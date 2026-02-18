const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const YAML = require("yaml");

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

function normalizeDiagnosticsForCompare(doc) {
  const copy = JSON.parse(JSON.stringify(doc));
  if (copy && copy.stats && copy.stats.phase_ms && typeof copy.stats.phase_ms === "object") {
    for (const key of Object.keys(copy.stats.phase_ms)) {
      copy.stats.phase_ms[key] = 0;
    }
  }
  return copy;
}

test("step13 persisted-step12 reruns are deterministic across seeds", () => {
  const seeds = listSeedDirs();
  assert.ok(seeds.length > 0, "expected at least one realistic seed fixture");

  for (const seed of seeds) {
    const step12Path = path.join(artifactsRoot, seed, "result-reference", "seed.elementary-assertions.yaml");
    assert.ok(fs.existsSync(step12Path), `missing step12 fixture: ${step12Path}`);

    const a = step13.generateForStep12Path(step12Path, { step13Mode: "13b", collectDiagnostics: true });
    const b = step13.generateForStep12Path(step12Path, { step13Mode: "13b", collectDiagnostics: true });

    assert.equal(a.yamlText, b.yamlText, `seed=${seed} YAML output drifted across reruns`);
    assert.deepEqual(
      normalizeDiagnosticsForCompare(a.diagnostics || {}),
      normalizeDiagnosticsForCompare(b.diagnostics || {}),
      `seed=${seed} diagnostics output drifted across reruns`
    );

    step13.validateConceptCandidatesDeterminism(YAML.parse(a.yamlText));
    step13.validateConceptCandidatesDeterminism(YAML.parse(b.yamlText));
  }
});
