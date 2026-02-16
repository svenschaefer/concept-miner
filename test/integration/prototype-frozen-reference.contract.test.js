const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const prototype = require("../../prototype/concept-candidates");

const repoRoot = path.resolve(__dirname, "..", "..");
const artifactsRoot = path.join(repoRoot, "test", "artifacts");

function listSeedDirs() {
  return fs
    .readdirSync(artifactsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

test("persisted-step12 generation matches frozen result-reference for 13a and 13b", () => {
  const seeds = listSeedDirs();
  assert.ok(seeds.length > 0, "expected at least one seed artifact directory");

  for (const seed of seeds) {
    const refDir = path.join(artifactsRoot, seed, "result-reference");
    const step12Path = path.join(refDir, "seed.elementary-assertions.yaml");
    assert.ok(fs.existsSync(step12Path), `missing frozen step12 artifact: ${step12Path}`);

    const out13a = prototype.generateForStep12Path(step12Path, { step13Mode: "13a" });
    const out13b = prototype.generateForStep12Path(step12Path, { step13Mode: "13b" });

    const expected13a = fs.readFileSync(path.join(refDir, "seed.concept-candidates.13a.yaml"), "utf8");
    const expected13b = fs.readFileSync(path.join(refDir, "seed.concept-candidates.13b.yaml"), "utf8");

    assert.equal(
      out13a.yamlText,
      expected13a,
      `seed=${seed} mode=13a diverged from frozen result-reference`
    );
    assert.equal(
      out13b.yamlText,
      expected13b,
      `seed=${seed} mode=13b diverged from frozen result-reference`
    );
  }
});
