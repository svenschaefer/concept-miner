const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const Module = require("node:module");

const { extractConcepts } = require("../../src");
const repoRoot = path.resolve(__dirname, "..", "..");
const artifactsRoot = path.join(repoRoot, "test", "artifacts");

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
      seedId: "prime_gen",
      artifactsRoot,
      mode: "default-extended",
    });
    assert.ok(Array.isArray(runtimeDoc.concepts));
    assert.ok(runtimeDoc.concepts.length > 0);

    const textDoc = await extractConcepts("alpha beta alpha", {});
    assert.ok(Array.isArray(textDoc.concepts));
    assert.equal(textDoc.concepts.length, 2);
  } finally {
    Module._load = originalLoad;
  }
});
