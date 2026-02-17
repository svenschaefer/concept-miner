const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");

const { createApiServer } = require("../../src/server/http");

function listen(server) {
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const addr = server.address();
      resolve(addr.port);
    });
  });
}

function requestJson(port, path, payloadText) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        host: "127.0.0.1",
        port,
        method: "POST",
        path,
        headers: {
          "content-type": "application/json",
        },
      },
      (res) => {
        let raw = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          raw += chunk;
        });
        res.on("end", () => {
          try {
            resolve({ statusCode: res.statusCode, body: JSON.parse(raw) });
          } catch (err) {
            reject(err);
          }
        });
      }
    );
    req.on("error", reject);
    req.end(payloadText);
  });
}

test("REST extract endpoint returns concepts document", async (t) => {
  const server = createApiServer();
  t.after(() => server.close());
  const port = await listen(server);

  const response = await requestJson(
    port,
    "/v1/concepts/extract?view=compact",
    JSON.stringify({ text: "alpha beta alpha" })
  );

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.schema_version, "1.0.0");
  assert.ok(Array.isArray(response.body.concepts));
  assert.ok(response.body.concepts.length > 0);
});

test("REST extract endpoint is deterministic for identical payloads", async (t) => {
  const server = createApiServer();
  t.after(() => server.close());
  const port = await listen(server);

  const payload = JSON.stringify({ text: "alpha beta alpha", input_id: "demo-1" });
  const first = await requestJson(port, "/v1/concepts/extract?view=evidence", payload);
  const second = await requestJson(port, "/v1/concepts/extract?view=evidence", payload);

  assert.equal(first.statusCode, 200);
  assert.equal(second.statusCode, 200);
  assert.equal(JSON.stringify(first.body), JSON.stringify(second.body));
});

test("REST extract endpoint rejects invalid request payloads with 400", async (t) => {
  const server = createApiServer();
  t.after(() => server.close());
  const port = await listen(server);

  const missingText = await requestJson(port, "/v1/concepts/extract", JSON.stringify({ input_id: "x" }));
  assert.equal(missingText.statusCode, 400);
  assert.equal(missingText.body.error, "invalid_request");
});

test("REST extract endpoint rejects malformed JSON with 400", async (t) => {
  const server = createApiServer();
  t.after(() => server.close());
  const port = await listen(server);

  const response = await requestJson(port, "/v1/concepts/extract", "{not-json");
  assert.equal(response.statusCode, 400);
  assert.equal(response.body.error, "invalid_request");
});
