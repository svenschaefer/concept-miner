const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const YAML = require("yaml");

const { extractConcepts } = require("../../src");

test("extractConcepts resolves product-mode artifact filenames before legacy step labels", async () => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "concept-miner-seed-"));
  const seedId = "demo";
  const seedDir = path.join(tmpRoot, seedId, "result-reference");
  fs.mkdirSync(seedDir, { recursive: true });

  const productModeFile = path.join(seedDir, "seed.concept-candidates.default-extended.yaml");
  const legacyModeFile = path.join(seedDir, "seed.concept-candidates.13b.yaml");

  const productDoc = {
    concept_candidates: [
      { concept_id: "cc_1111111111111111", canonical: "product_mode", surfaces: ["Product Mode"] },
    ],
  };
  const legacyDoc = {
    concept_candidates: [
      { concept_id: "cc_2222222222222222", canonical: "legacy_mode", surfaces: ["Legacy Mode"] },
    ],
  };

  fs.writeFileSync(productModeFile, `${YAML.stringify(productDoc)}`, "utf8");
  fs.writeFileSync(legacyModeFile, `${YAML.stringify(legacyDoc)}`, "utf8");

  const doc = await extractConcepts("", {
    mode: "default-extended",
    seedId,
    artifactsRoot: tmpRoot,
  });

  assert.equal(doc.schema_version, "1.0.0");
  assert.ok(Array.isArray(doc.concepts));
  assert.equal(doc.concepts.length, 1);
  assert.equal(doc.concepts[0].id, "cc_1111111111111111");
  assert.equal(doc.concepts[0].name, "product_mode");
});
