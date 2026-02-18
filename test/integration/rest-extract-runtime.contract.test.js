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

test("REST extract endpoint returns concepts document", async (t) => {
  const server = createApiServer({
    extractConcepts: async (text) => ({
      schema_version: "1.0.0",
      concepts: [{ id: "c_1", name: text.toLowerCase(), surface_forms: [text] }],
      meta: { concept_count: 1, service: { name: "concept-miner", version: "test", deterministic: true } },
    }),
  });
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
  const server = createApiServer({
    extractConcepts: async (text, options) => ({
      schema_version: "1.0.0",
      concepts: [{ id: "c_1", name: text.toLowerCase(), surface_forms: [text] }],
      input_id: options.inputId,
      meta: { concept_count: 1, service: { name: "concept-miner", version: "test", deterministic: true } },
    }),
  });
  t.after(() => server.close());
  const port = await listen(server);

  const payload = JSON.stringify({
    text: "alpha beta alpha",
    input_id: "demo-1",
  });
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
  const endpoint = "http://127.0.0.1:32123";
  let seenOptions = null;
  const api = createApiServer({
    extractConcepts: async (_text, options) => {
      seenOptions = options;
      return {
        schema_version: "1.0.0",
        concepts: [{ id: "c_1", name: "alpha" }],
        meta: { concept_count: 1, service: { name: "concept-miner", version: "test", deterministic: true } },
      };
    },
  });
  t.after(() => api.close());
  const apiPort = await listen(api);

  const response = await requestJson(
    apiPort,
    "/v1/concepts/extract?view=compact",
    JSON.stringify({
      text: "alpha beta alpha",
      options: {
        mode: "default-extended",
        wikipedia_title_index_endpoint: endpoint,
        wikipedia_title_index_timeout_ms: 1000,
      },
    })
  );

  assert.equal(response.statusCode, 200);
  assert.ok(seenOptions);
  assert.equal(seenOptions.mode, "default-extended");
  assert.equal(seenOptions.wikipediaTitleIndexEndpoint, endpoint);
  assert.equal(seenOptions.wikipediaTitleIndexTimeoutMs, 1000);
});

test("REST extract returns 422 when wikipedia-title-index is unavailable in default-extended mode", async (t) => {
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

  assert.equal(response.statusCode, 422);
  assert.equal(response.body.error, "unprocessable_input");
  assert.match(String(response.body.message || ""), /wikipedia-title-index/i);
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
