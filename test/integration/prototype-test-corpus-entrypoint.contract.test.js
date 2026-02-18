const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const Module = require("node:module");

const { extractConcepts } = require("../../src");
const repoRoot = path.resolve(__dirname, "..", "..");
const step12Path = path.join(repoRoot, "test", "artifacts", "prime_gen", "result-reference", "seed.elementary-assertions.yaml");

test("product runtime does not load prototype modules", async () => {
  const originalLoad = Module._load;
  Module._load = function patchedLoad(request, parent, isMain) {
    const normalized = String(request || "").replace(/\\/g, "/");
    if (normalized.includes("prototype/")) {
      throw new Error(`runtime prototype import attempted: ${request}`);
    }
    return originalLoad.call(this, request, parent, isMain);
  };

  try {
    const runtimeDoc = await extractConcepts("", {
      step12Path,
      mode: "default-extended",
    });
    assert.ok(Array.isArray(runtimeDoc.concepts));
    assert.ok(runtimeDoc.concepts.length > 0);

    await assert.rejects(
      () => extractConcepts("alpha beta alpha", {
        mode: "default-extended",
        wikipediaTitleIndexEndpoint: "http://127.0.0.1:1",
        wikipediaTitleIndexTimeoutMs: 50,
      }),
      /wikipedia-title-index/i
    );
    const textDoc = await extractConcepts("", { step12Path });
    assert.ok(Array.isArray(textDoc.concepts));
    assert.ok(textDoc.concepts.length > 0);
  } finally {
    Module._load = originalLoad;
  }
});
