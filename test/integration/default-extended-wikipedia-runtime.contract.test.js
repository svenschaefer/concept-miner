const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const { extractConcepts } = require("../../src");

test("default-extended extraction performs wikipedia-title-index lookups and enriches concept properties", async () => {
  const repoRoot = path.resolve(__dirname, "..", "..");
  const step12Path = path.join(repoRoot, "test", "artifacts", "webshop", "result-reference", "seed.elementary-assertions.yaml");
  const doc = await extractConcepts("", { mode: "default-extended", step12Path });

  assert.ok(Array.isArray(doc.concepts));
  assert.ok(doc.concepts.length > 0);
  assert.ok(doc.concepts.some((c) => c.name === "online_store"));
  assert.ok(doc.concepts.some((c) => c.name === "shopping_cart"));
});

test("default-extended extraction hard-fails when wikipedia-title-index is unavailable", async () => {
  await assert.rejects(
    () => extractConcepts("alpha beta alpha", {
      mode: "default-extended",
      wikipediaTitleIndexEndpoint: "http://127.0.0.1:1",
      wikipediaTitleIndexTimeoutMs: 50,
    }),
    /wikipedia-title-index/i
  );
});
