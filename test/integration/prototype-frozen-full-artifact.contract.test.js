const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

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

function normalizeDiagnosticsForGoldenCompare(doc) {
  const copy = JSON.parse(JSON.stringify(doc));
  if (copy && copy.stats && copy.stats.phase_ms && typeof copy.stats.phase_ms === "object") {
    for (const key of Object.keys(copy.stats.phase_ms)) {
      copy.stats.phase_ms[key] = 0;
    }
  }
  return copy;
}

test("persisted artifact regeneration matches frozen result-reference across seeds", () => {
  const seeds = listSeedDirs();
  assert.ok(seeds.length > 0, "expected at least one realistic seed");

  for (const seed of seeds) {
    const refDir = path.join(artifactsRoot, seed, "result-reference");
    const seedTxtPath = path.join(artifactsRoot, seed, "seed.txt");
    const step12Path = path.join(refDir, "seed.elementary-assertions.yaml");

    assert.ok(fs.existsSync(seedTxtPath), `missing seed input: ${seedTxtPath}`);
    assert.ok(fs.existsSync(step12Path), `missing frozen step12 artifact: ${step12Path}`);

    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), `concept-miner-golden-${seed}-`));
    const out13a = path.join(tmpDir, "seed.concept-candidates.13a.yaml");
    const out13aMeta = path.join(tmpDir, "seed.concept-candidates.13a.meta.json");
    const out13aDiag = path.join(tmpDir, "seed.concept-candidates.13a.diag.json");
    const out13b = path.join(tmpDir, "seed.concept-candidates.13b.yaml");
    const out13bMeta = path.join(tmpDir, "seed.concept-candidates.13b.meta.json");
    const out13bDiag = path.join(tmpDir, "seed.concept-candidates.13b.diag.json");
    const outDefault = path.join(tmpDir, "seed.concept-candidates.yaml");

    runPrototype([
      "--step12-in",
      step12Path,
      "--step13-mode",
      "13a",
      "--out",
      out13a,
      "--meta-out",
      out13aMeta,
      "--diag-out",
      out13aDiag,
    ]);
    runPrototype([
      "--step12-in",
      step12Path,
      "--step13-mode",
      "13b",
      "--out",
      out13b,
      "--meta-out",
      out13bMeta,
      "--diag-out",
      out13bDiag,
    ]);
    runPrototype([
      "--step12-in",
      step12Path,
      "--out",
      outDefault,
    ]);

    assert.equal(
      fs.readFileSync(out13a, "utf8"),
      fs.readFileSync(path.join(refDir, "seed.concept-candidates.13a.yaml"), "utf8"),
      `seed=${seed} 13a yaml diverged from frozen reference`
    );
    assert.equal(
      fs.readFileSync(out13aMeta, "utf8"),
      fs.readFileSync(path.join(refDir, "seed.concept-candidates.13a.meta.json"), "utf8"),
      `seed=${seed} 13a metadata diverged from frozen reference`
    );
    assert.deepEqual(
      normalizeDiagnosticsForGoldenCompare(readJson(out13aDiag)),
      normalizeDiagnosticsForGoldenCompare(readJson(path.join(refDir, "seed.concept-candidates.13a.diag.json"))),
      `seed=${seed} 13a diagnostics diverged from frozen reference`
    );

    assert.equal(
      fs.readFileSync(out13b, "utf8"),
      fs.readFileSync(path.join(refDir, "seed.concept-candidates.13b.yaml"), "utf8"),
      `seed=${seed} 13b yaml diverged from frozen reference`
    );
    assert.equal(
      fs.readFileSync(out13bMeta, "utf8"),
      fs.readFileSync(path.join(refDir, "seed.concept-candidates.13b.meta.json"), "utf8"),
      `seed=${seed} 13b metadata diverged from frozen reference`
    );
    assert.deepEqual(
      normalizeDiagnosticsForGoldenCompare(readJson(out13bDiag)),
      normalizeDiagnosticsForGoldenCompare(readJson(path.join(refDir, "seed.concept-candidates.13b.diag.json"))),
      `seed=${seed} 13b diagnostics diverged from frozen reference`
    );

    assert.equal(
      fs.readFileSync(outDefault, "utf8"),
      fs.readFileSync(path.join(refDir, "seed.concept-candidates.yaml"), "utf8"),
      `seed=${seed} default yaml diverged from frozen reference`
    );
  }
});
