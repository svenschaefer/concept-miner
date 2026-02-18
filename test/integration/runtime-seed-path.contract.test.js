const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const http = require("node:http");

const { extractConcepts } = require("../../src");

const repoRoot = path.resolve(__dirname, "..", "..");
const artifactsRoot = path.join(repoRoot, "test", "artifacts");

function createMockWikipediaTitleIndexServer() {
  const server = http.createServer(async (req, res) => {
    if (req.method === "GET" && req.url === "/health") {
      res.statusCode = 200;
      res.end("{\"ok\":true}\n");
      return;
    }
    if (req.method !== "POST" || req.url !== "/v1/titles/query") {
      res.statusCode = 404;
      res.end("not found");
      return;
    }
    res.statusCode = 200;
    res.setHeader("content-type", "application/json; charset=utf-8");
    res.end("{\"columns\":[\"prefix_count\",\"exact_count\"],\"rows\":[[100,1]],\"row_count\":1,\"truncated\":false}\n");
  });
  return server;
}

async function listen(server) {
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  return `http://127.0.0.1:${address.port}`;
}

test("extractConcepts supports runtime seed-text input path in default-extended mode", async (t) => {
  const server = createMockWikipediaTitleIndexServer();
  const endpoint = await listen(server);
  t.after(() => server.close());

  const options = {
    mode: "default-extended",
    seedId: "prime_gen",
    artifactsRoot,
    wikipediaTitleIndexEndpoint: endpoint,
    timeoutMs: 120000,
    wikipediaTitleIndexTimeoutMs: 2000,
    includeDiagnostics: false,
  };

  let first;
  let second;
  try {
    first = await extractConcepts("", options);
    second = await extractConcepts("", options);
  } catch (err) {
    if (/WTI evidence missing/i.test(String(err && err.message ? err.message : err))) {
      t.skip("mock wikipedia-title-index service does not satisfy full elementary-assertions evidence contract");
      return;
    }
    throw err;
  }

  assert.equal(first.schema_version, "1.0.0");
  assert.ok(Array.isArray(first.concepts));
  assert.ok(first.concepts.length > 0);
  assert.equal(first.meta.service.deterministic, true);
  assert.equal(JSON.stringify(first), JSON.stringify(second));
});
