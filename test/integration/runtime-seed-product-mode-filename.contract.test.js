const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const YAML = require("yaml");

const { extractConcepts } = require("../../src");

test("extractConcepts uses strict mode-specific seed artifact filename", async () => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "concept-miner-seed-"));
  const seedId = "demo";
  const seedDir = path.join(tmpRoot, seedId, "result-reference");
  fs.mkdirSync(seedDir, { recursive: true });

  const strictModeFile = path.join(seedDir, "seed.concept-candidates.13b.yaml");
  const legacyFallbackFile = path.join(seedDir, "seed.concept-candidates.yaml");

  const strictDoc = {
    concept_candidates: [
      { concept_id: "cc_1111111111111111", canonical: "strict_mode", surfaces: ["Strict Mode"] },
    ],
  };
  const fallbackDoc = {
    concept_candidates: [
      { concept_id: "cc_2222222222222222", canonical: "fallback_mode", surfaces: ["Fallback Mode"] },
    ],
  };

  fs.writeFileSync(strictModeFile, `${YAML.stringify(strictDoc)}`, "utf8");
  fs.writeFileSync(legacyFallbackFile, `${YAML.stringify(fallbackDoc)}`, "utf8");

  const doc = await extractConcepts("", {
    mode: "default-extended",
    seedId,
    artifactsRoot: tmpRoot,
  });

  assert.equal(doc.schema_version, "1.0.0");
  assert.ok(Array.isArray(doc.concepts));
  assert.equal(doc.concepts.length, 1);
  assert.equal(doc.concepts[0].id, "cc_1111111111111111");
  assert.equal(doc.concepts[0].name, "strict_mode");
});

test("extractConcepts fails when strict mode-specific seed artifact file is missing", async () => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "concept-miner-seed-"));
  const seedId = "demo";
  const seedDir = path.join(tmpRoot, seedId, "result-reference");
  fs.mkdirSync(seedDir, { recursive: true });

  const fallbackDoc = {
    concept_candidates: [
      { concept_id: "cc_2222222222222222", canonical: "fallback_mode", surfaces: ["Fallback Mode"] },
    ],
  };
  fs.writeFileSync(path.join(seedDir, "seed.concept-candidates.yaml"), `${YAML.stringify(fallbackDoc)}`, "utf8");

  await assert.rejects(
    () => extractConcepts("", {
      mode: "default-extended",
      seedId,
      artifactsRoot: tmpRoot,
    }),
    /Missing concept-candidates artifact/i
  );
});
