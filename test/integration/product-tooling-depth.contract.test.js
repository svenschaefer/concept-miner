const test = require("node:test");
const assert = require("node:assert/strict");
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

test("detailed independent benchmark reports neutral and policy intersection diagnostics", (t) => {
  const result = runNode([
    "scripts/concept-candidates.independent-benchmark.js",
    "--benchmark",
    path.join(repoRoot, "test", "benchmark", "independent.expected-concept-candidates.yaml"),
    "--artifacts-root",
    path.join(repoRoot, "test", "artifacts"),
    "--seed-id",
    "prime_gen",
    "--report-policy-intersections",
  ]);

  if (result.status !== 0 && /wikipedia-title-index/i.test(String(result.stderr || ""))) {
    t.skip("wikipedia-title-index service unavailable for runtime benchmark diagnostics");
    return;
  }

  assert.equal(result.status, 0, String(result.stderr || result.stdout || ""));
  const stdout = String(result.stdout || "");
  assert.match(stdout, /neutral_present=/);
  assert.match(stdout, /policy_intersections:/);
});

test("standalone concept-candidates determinism checker validates frozen reference yaml", () => {
  const inPath = path.join(
    repoRoot,
    "test",
    "artifacts",
    "webshop",
    "result-reference",
    "seed.concept-candidates.13b.yaml"
  );
  const result = runNode([
    "scripts/check-concept-candidates-determinism.js",
    "--in",
    inPath,
  ]);
  assert.equal(result.status, 0, String(result.stderr || result.stdout || ""));
  assert.match(String(result.stdout || ""), /determinism\/schema check OK/);
});
