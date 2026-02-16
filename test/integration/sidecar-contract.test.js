const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Ajv2020 = require("ajv/dist/2020");

const repoRoot = path.resolve(__dirname, "..", "..");
const artifactsRoot = path.join(repoRoot, "test", "artifacts");
const metaSchema = JSON.parse(
  fs.readFileSync(path.join(repoRoot, "schema", "concept-candidates-meta.schema.json"), "utf8")
);
const diagnosticsSchema = JSON.parse(
  fs.readFileSync(path.join(repoRoot, "schema", "concept-candidates-diagnostics.schema.json"), "utf8")
);

const ajv = new Ajv2020({ allErrors: true, strict: false });
const validateMeta = ajv.compile(metaSchema);
const validateDiagnostics = ajv.compile(diagnosticsSchema);

function seedDirs() {
  return fs
    .readdirSync(artifactsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

for (const seed of seedDirs()) {
  for (const mode of ["13a", "13b"]) {
    test(`sidecars for seed=${seed} mode=${mode} match sidecar schemas`, () => {
      const refDir = path.join(artifactsRoot, seed, "result-reference");
      const metaPath = path.join(refDir, `seed.concept-candidates.${mode}.meta.json`);
      const diagPath = path.join(refDir, `seed.concept-candidates.${mode}.diag.json`);
      const meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
      const diag = JSON.parse(fs.readFileSync(diagPath, "utf8"));

      const metaOk = validateMeta(meta);
      assert.equal(
        metaOk,
        true,
        `meta schema mismatch for seed=${seed} mode=${mode}: ${JSON.stringify(validateMeta.errors)}`
      );

      const diagOk = validateDiagnostics(diag);
      assert.equal(
        diagOk,
        true,
        `diag schema mismatch for seed=${seed} mode=${mode}: ${JSON.stringify(validateDiagnostics.errors)}`
      );

      assert.equal(meta.step13.step13_mode, mode);
      assert.equal(diag.stats.step13_mode, mode);
      assert.equal(meta.mode, "persisted_step12");
    });
  }
}
