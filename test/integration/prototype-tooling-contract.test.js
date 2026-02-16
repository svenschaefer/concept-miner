const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const repoRoot = path.resolve(__dirname, "..", "..");

function runNode(args) {
  const result = spawnSync(process.execPath, args, {
    cwd: repoRoot,
    encoding: "utf8",
  });
  if (result.error) throw result.error;
  return result;
}

function stageSeedArtifacts(seedId) {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "concept-miner-artifacts-"));
  const sourceDir = path.join(repoRoot, "test", "artifacts", seedId, "result-reference");
  const targetDir = path.join(tmpRoot, seedId, "seed");
  fs.mkdirSync(targetDir, { recursive: true });

  for (const fileName of fs.readdirSync(sourceDir)) {
    fs.copyFileSync(path.join(sourceDir, fileName), path.join(targetDir, fileName));
  }
  return tmpRoot;
}

test("independent benchmark executes in generic baseline mode (13a)", () => {
  const artifactsRoot = stageSeedArtifacts("prime_gen");
  const result = runNode([
    "prototype/concept-candidates.independent-benchmark.js",
    "--artifacts-root",
    artifactsRoot,
    "--step13-mode",
    "13a",
    "--seed-id",
    "prime_gen",
  ]);

  assert.equal(result.status, 0, String(result.stderr || result.stdout || ""));
  assert.match(String(result.stdout || ""), /seed=prime_gen/);
  assert.match(String(result.stdout || ""), /mode=13a/);
});

test("independent benchmark executes in default extended mode (13b)", () => {
  const artifactsRoot = stageSeedArtifacts("prime_gen");
  const result = runNode([
    "prototype/concept-candidates.independent-benchmark.js",
    "--artifacts-root",
    artifactsRoot,
    "--step13-mode",
    "13b",
    "--seed-id",
    "prime_gen",
  ]);

  assert.equal(result.status, 0, String(result.stderr || result.stdout || ""));
  assert.match(String(result.stdout || ""), /seed=prime_gen/);
  assert.match(String(result.stdout || ""), /mode=13b/);
});

test("threshold sweep generates structured report", () => {
  const artifactsRoot = stageSeedArtifacts("prime_gen");
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "concept-miner-sweep-"));
  const reportPath = path.join(tmpDir, "13b-threshold-sweep.report.json");
  const result = runNode([
    "prototype/concept-candidates.13b-threshold-sweep.js",
    "--artifacts-root",
    artifactsRoot,
    "--seed-id",
    "prime_gen",
    "--out",
    reportPath,
  ]);

  assert.equal(result.status, 0, String(result.stderr || result.stdout || ""));
  const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
  assert.equal(report.schema_version, 1);
  assert.equal(report.step13_mode, "13b");
  assert.equal(typeof report.wikipedia_title_index_policy, "string");
  assert.ok(Array.isArray(report.results));
  assert.ok(report.results.length > 0);
  assert.equal(typeof report.chosen_thresholds, "object");
});

test("wikipedia-title-index coverage generates structured report", () => {
  const artifactsRoot = stageSeedArtifacts("prime_gen");
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "concept-miner-coverage-"));
  const reportPath = path.join(tmpDir, "step12-wikipedia-title-index.coverage.report.json");
  const result = runNode([
    "prototype/step12-wikipedia-title-index-coverage.js",
    "--artifacts-root",
    artifactsRoot,
    "--out",
    reportPath,
  ]);

  assert.equal(result.status, 0, String(result.stderr || result.stdout || ""));
  const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
  assert.equal(report.schema_version, 1);
  assert.equal(typeof report.wikipedia_title_index_policy, "string");
  assert.ok(Array.isArray(report.seeds));
  assert.ok(report.seeds.length > 0);
  assert.equal(typeof report.aggregate, "object");
});
