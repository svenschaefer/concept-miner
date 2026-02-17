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

function requestRaw(port, method, path, payloadText = "") {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        host: "127.0.0.1",
        port,
        method,
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
          resolve({ statusCode: res.statusCode, raw });
        });
      }
    );
    req.on("error", reject);
    req.end(payloadText);
  });
}

function createMockWikipediaTitleIndexServer() {
  const calls = [];
  const server = http.createServer(async (req, res) => {
    if (req.method !== "POST" || req.url !== "/v1/titles/query") {
      res.statusCode = 404;
      res.end("not found");
      return;
    }
    let raw = "";
    req.setEncoding("utf8");
    for await (const chunk of req) raw += chunk;
    const body = JSON.parse(raw || "{}");
    calls.push(body);
    const payload = {
      columns: ["prefix_count", "exact_count"],
      rows: [[9, 1]],
      row_count: 1,
      truncated: false,
    };
    const out = `${JSON.stringify(payload)}\n`;
    res.statusCode = 200;
    res.setHeader("content-type", "application/json; charset=utf-8");
    res.setHeader("content-length", Buffer.byteLength(out, "utf8"));
    res.end(out);
  });
  return { server, calls };
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

test("REST API returns 404 for unknown routes", async (t) => {
  const api = createApiServer();
  t.after(() => api.close());
  const apiPort = await listen(api);

  const response = await requestRaw(apiPort, "GET", "/v1/unknown");
  const body = JSON.parse(response.raw);
  assert.equal(response.statusCode, 404);
  assert.equal(body.error, "not_found");
});

test("REST extract endpoint rejects too-large request payload with 400", async (t) => {
  const api = createApiServer();
  t.after(() => api.close());
  const apiPort = await listen(api);

  const giant = "a".repeat(1024 * 1024 + 128);
  const response = await requestRaw(apiPort, "POST", "/v1/concepts/extract", giant);
  const body = JSON.parse(response.raw);
  assert.equal(response.statusCode, 400);
  assert.equal(body.error, "invalid_request");
  assert.match(String(body.message || ""), /too large/i);
});

test("REST extract default-extended mode forwards wikipedia-title-index endpoint options", async (t) => {
  const mock = createMockWikipediaTitleIndexServer();
  t.after(() => mock.server.close());
  const wtiPort = await listen(mock.server);

  const api = createApiServer();
  t.after(() => api.close());
  const apiPort = await listen(api);

  const response = await requestJson(
    apiPort,
    "/v1/concepts/extract?view=compact",
    JSON.stringify({
      text: "alpha beta alpha",
      options: {
        mode: "default-extended",
        wikipedia_title_index_endpoint: `http://127.0.0.1:${wtiPort}`,
        wikipedia_title_index_timeout_ms: 1000,
      },
    })
  );

  assert.equal(response.statusCode, 200);
  assert.ok(mock.calls.length > 0);
  const alpha = response.body.concepts.find((c) => c.name === "alpha");
  assert.ok(alpha);
  assert.deepEqual(alpha.properties.wikipedia_title_index, {
    exact_match: true,
    prefix_count: 9,
  });
});

test("REST extract remains successful without enrichment when wikipedia-title-index is unavailable", async (t) => {
  const api = createApiServer();
  t.after(() => api.close());
  const apiPort = await listen(api);

  const response = await requestJson(
    apiPort,
    "/v1/concepts/extract?view=evidence",
    JSON.stringify({
      text: "alpha beta alpha",
      options: {
        mode: "default-extended",
        wikipedia_title_index_endpoint: "http://127.0.0.1:1",
        wikipedia_title_index_timeout_ms: 50,
      },
    })
  );

  assert.equal(response.statusCode, 200);
  assert.ok(Array.isArray(response.body.concepts));
  for (const concept of response.body.concepts) {
    const hasWti = Boolean(
      concept.properties
        && typeof concept.properties === "object"
        && concept.properties.wikipedia_title_index
    );
    assert.equal(hasWti, false);
  }
});

test("REST extract endpoint maps unexpected extractor failures to 500", async (t) => {
  const api = createApiServer({
    extractConcepts: async () => {
      throw new Error("boom");
    },
  });
  t.after(() => api.close());
  const apiPort = await listen(api);

  const response = await requestJson(apiPort, "/v1/concepts/extract", JSON.stringify({ text: "alpha" }));
  assert.equal(response.statusCode, 500);
  assert.equal(response.body.error, "internal_error");
});
