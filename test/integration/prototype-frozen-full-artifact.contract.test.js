const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const step13 = require("../../src/core/step13");

const repoRoot = path.resolve(__dirname, "..", "..");
const artifactsRoot = path.join(repoRoot, "test", "artifacts");

function listSeedDirs() {
  return fs
    .readdirSync(artifactsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
}

function normalizeDiagnosticsForGoldenCompare(doc) {
  const copy = JSON.parse(JSON.stringify(doc));
  if (copy && copy.stats && copy.stats.phase_ms && typeof copy.stats.phase_ms === "object") {
    for (const key of Object.keys(copy.stats.phase_ms)) {
      copy.stats.phase_ms[key] = 0;
    }
  }
  return copy;
}

test("persisted artifact regeneration matches frozen 13b result-reference across seeds", () => {
  const seeds = listSeedDirs();
  assert.ok(seeds.length > 0, "expected at least one realistic seed");

  for (const seed of seeds) {
    const refDir = path.join(artifactsRoot, seed, "result-reference");
    const seedTxtPath = path.join(artifactsRoot, seed, "seed.txt");
    const step12Path = path.join(refDir, "seed.elementary-assertions.yaml");

    assert.ok(fs.existsSync(seedTxtPath), `missing seed input: ${seedTxtPath}`);
    assert.ok(fs.existsSync(step12Path), `missing frozen step12 artifact: ${step12Path}`);

    const run = step13.generateForStep12Path(step12Path, {
      step13Mode: "13b",
      collectDiagnostics: true,
      enableLegacyEnrichment: false,
      enableRecoverySynthesis: false,
    });

    const expected13b = fs.readFileSync(path.join(refDir, "seed.concept-candidates.13b.yaml"), "utf8");
    const expectedMeta = JSON.parse(fs.readFileSync(path.join(refDir, "seed.concept-candidates.13b.meta.json"), "utf8"));
    const expectedDiag = JSON.parse(fs.readFileSync(path.join(refDir, "seed.concept-candidates.13b.diag.json"), "utf8"));

    assert.equal(run.yamlText, expected13b, `seed=${seed} 13b yaml diverged from frozen reference`);

    const actualMeta = {
      mode: "persisted_step12",
      seed_id: run.outputDoc.seed_id,
      step13: {
        wikipedia_title_index_policy: "assertion_then_lexicon_fallback",
        step13_mode: "13b",
        enable_13b_mode: true,
      },
    };
    assert.equal(actualMeta.mode, expectedMeta.mode, `seed=${seed} 13b metadata mode mismatch`);
    assert.equal(actualMeta.seed_id, expectedMeta.seed_id, `seed=${seed} 13b metadata seed mismatch`);
    assert.equal(actualMeta.step13.step13_mode, expectedMeta.step13.step13_mode, `seed=${seed} 13b metadata mode tag mismatch`);

    assert.deepEqual(
      normalizeDiagnosticsForGoldenCompare(run.diagnostics || {}),
      normalizeDiagnosticsForGoldenCompare(expectedDiag),
      `seed=${seed} 13b diagnostics diverged from frozen reference`
    );
  }
});
