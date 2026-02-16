const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const { extractConcepts } = require("../../src");

const repoRoot = path.resolve(__dirname, "..", "..");
const artifactsRoot = path.join(repoRoot, "test", "artifacts");

for (const mode of ["generic-baseline", "default-extended"]) {
  test(`extractConcepts supports runtime seed-text input path in ${mode}`, async () => {
    const options = {
      mode,
      seedId: "prime_gen",
      artifactsRoot,
      wikipediaTitleIndexEndpoint: "http://127.0.0.1:32123",
      timeoutMs: 120000,
      wikipediaTitleIndexTimeoutMs: 2000,
      includeDiagnostics: false,
    };

    const first = await extractConcepts("", options);
    const second = await extractConcepts("", options);

    assert.equal(first.schema_version, "1.0.0");
    assert.ok(Array.isArray(first.concepts));
    assert.ok(first.concepts.length > 0);
    assert.equal(first.meta.service.deterministic, true);

    assert.equal(
      JSON.stringify(first),
      JSON.stringify(second),
      `runtime seed-path extraction output must be deterministic for mode=${mode}`
    );
  });
}
