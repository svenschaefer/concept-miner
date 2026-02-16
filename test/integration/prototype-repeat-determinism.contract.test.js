const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const YAML = require("yaml");

const prototype = require("../../prototype/concept-candidates");

const repoRoot = path.resolve(__dirname, "..", "..");
const artifactsRoot = path.join(repoRoot, "test", "artifacts");
const prototypeCliPath = path.join(repoRoot, "prototype", "concept-candidates.js");

function listSeedDirs() {
  return fs
    .readdirSync(artifactsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
}

function runPrototype(args) {
  const result = spawnSync(process.execPath, [prototypeCliPath, ...args], {
    cwd: repoRoot,
    encoding: "utf8",
    timeout: 300000,
  });
  if (result.error) throw result.error;
  assert.equal(result.status, 0, String(result.stderr || result.stdout || ""));
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
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

test("prototype persisted-step12 reruns are deterministic across seeds and modes", () => {
  const seeds = listSeedDirs();
  assert.ok(seeds.length > 0, "expected at least one realistic seed fixture");

  for (const seed of seeds) {
    const step12Path = path.join(artifactsRoot, seed, "result-reference", "seed.elementary-assertions.yaml");
    assert.ok(fs.existsSync(step12Path), `missing step12 fixture: ${step12Path}`);

    for (const mode of ["13a", "13b"]) {
      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), `concept-miner-repeat-${seed}-${mode}-`));
      const outA = path.join(tmpDir, "a.yaml");
      const outB = path.join(tmpDir, "b.yaml");
      const metaA = path.join(tmpDir, "a.meta.json");
      const metaB = path.join(tmpDir, "b.meta.json");
      const diagA = path.join(tmpDir, "a.diag.json");
      const diagB = path.join(tmpDir, "b.diag.json");

      runPrototype([
        "--step12-in",
        step12Path,
        "--step13-mode",
        mode,
        "--out",
        outA,
        "--meta-out",
        metaA,
        "--diag-out",
        diagA,
      ]);
      runPrototype([
        "--step12-in",
        step12Path,
        "--step13-mode",
        mode,
        "--out",
        outB,
        "--meta-out",
        metaB,
        "--diag-out",
        diagB,
      ]);

      const yamlA = fs.readFileSync(outA, "utf8");
      const yamlB = fs.readFileSync(outB, "utf8");
      assert.equal(yamlA, yamlB, `seed=${seed} mode=${mode} YAML output drifted across reruns`);
      assert.equal(
        fs.readFileSync(metaA, "utf8"),
        fs.readFileSync(metaB, "utf8"),
        `seed=${seed} mode=${mode} metadata output drifted across reruns`
      );
      assert.deepEqual(
        normalizeDiagnosticsForCompare(readJson(diagA)),
        normalizeDiagnosticsForCompare(readJson(diagB)),
        `seed=${seed} mode=${mode} diagnostics output drifted across reruns`
      );

      // Parse and validate deterministic ordering/shape constraints at object level.
      prototype.validateConceptCandidatesDeterminism(YAML.parse(yamlA));
      prototype.validateConceptCandidatesDeterminism(YAML.parse(yamlB));
    }
  }
});
