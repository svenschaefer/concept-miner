const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..", "..");
const artifactsRoot = path.join(repoRoot, "test", "artifacts");

function listSeedDirs() {
  const entries = fs.readdirSync(artifactsRoot, { withFileTypes: true });
  return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
}

test("each realistic seed directory has seed.txt and frozen result-reference outputs", () => {
  assert.ok(fs.existsSync(artifactsRoot), "missing test/artifacts root");
  const seedDirs = listSeedDirs();
  assert.ok(seedDirs.length > 0, "expected at least one realistic seed directory");

  for (const seed of seedDirs) {
    const seedDir = path.join(artifactsRoot, seed);
    const seedTxt = path.join(seedDir, "seed.txt");
    const refDir = path.join(seedDir, "result-reference");

    assert.ok(fs.existsSync(seedTxt), `missing seed input: ${seedTxt}`);
    assert.ok(fs.existsSync(refDir), `missing frozen result-reference directory: ${refDir}`);

    const required = [
      "seed.concept-candidates.13a.yaml",
      "seed.concept-candidates.13a.meta.json",
      "seed.concept-candidates.13a.diag.json",
      "seed.concept-candidates.13b.yaml",
      "seed.concept-candidates.13b.meta.json",
      "seed.concept-candidates.13b.diag.json",
      "seed.concept-candidates.yaml",
      "seed.elementary-assertions.yaml",
    ];
    for (const rel of required) {
      const full = path.join(refDir, rel);
      assert.ok(fs.existsSync(full), `missing frozen reference artifact: ${full}`);
    }
  }
});
