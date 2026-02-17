const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");

const { extractConcepts } = require("../../src");

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

    const queryText = Array.isArray(body.params) && typeof body.params[2] === "string" ? body.params[2] : "";
    const prefixCount = queryText === "Alpha" ? 120 : 7;
    const exactCount = queryText === "Alpha" ? 1 : 0;

    const payload = {
      columns: ["prefix_count", "exact_count"],
      rows: [[prefixCount, exactCount]],
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

async function listen(server) {
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  return `http://127.0.0.1:${address.port}`;
}

test("default-extended extraction performs wikipedia-title-index lookups and enriches concept properties", async (t) => {
  const mock = createMockWikipediaTitleIndexServer();
  const endpoint = await listen(mock.server);
  t.after(() => mock.server.close());

  const doc = await extractConcepts("alpha beta alpha", {
    mode: "default-extended",
    wikipediaTitleIndexEndpoint: endpoint,
  });

  assert.ok(Array.isArray(doc.concepts));
  assert.equal(doc.concepts.length, 2);
  assert.equal(mock.calls.length, 2, "expected one wikipedia-title-index query per concept");

  const alpha = doc.concepts.find((c) => c.name === "alpha");
  const beta = doc.concepts.find((c) => c.name === "beta");
  assert.ok(alpha && beta);

  assert.deepEqual(alpha.properties.wikipedia_title_index, {
    exact_match: true,
    prefix_count: 120,
  });
  assert.deepEqual(beta.properties.wikipedia_title_index, {
    exact_match: false,
    prefix_count: 7,
  });
});

test("generic-baseline extraction does not call wikipedia-title-index runtime", async (t) => {
  const mock = createMockWikipediaTitleIndexServer();
  const endpoint = await listen(mock.server);
  t.after(() => mock.server.close());

  const doc = await extractConcepts("alpha beta alpha", {
    mode: "generic-baseline",
    wikipediaTitleIndexEndpoint: endpoint,
  });

  assert.ok(Array.isArray(doc.concepts));
  assert.equal(doc.concepts.length, 2);
  assert.equal(mock.calls.length, 0);
  for (const concept of doc.concepts) {
    assert.equal(Object.prototype.hasOwnProperty.call(concept, "properties"), false);
  }
});

test("default-extended extraction remains successful without enrichment when wikipedia-title-index is unavailable", async () => {
  const doc = await extractConcepts("alpha beta alpha", {
    mode: "default-extended",
    wikipediaTitleIndexEndpoint: "http://127.0.0.1:1",
    wikipediaTitleIndexTimeoutMs: 50,
  });

  assert.ok(Array.isArray(doc.concepts));
  assert.equal(doc.concepts.length, 2);
  for (const concept of doc.concepts) {
    const hasWti = Boolean(
      concept.properties
        && typeof concept.properties === "object"
        && concept.properties.wikipedia_title_index
    );
    assert.equal(hasWti, false);
  }
});
