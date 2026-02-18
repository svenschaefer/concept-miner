const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const repoRoot = path.resolve(__dirname, "..", "..");

test("13b independent benchmark quality gate passes at 100", () => {
  const result = spawnSync(
    process.execPath,
    [
      path.join(repoRoot, "scripts", "check-quality-gate-13b.js"),
      "--benchmark",
      path.join(repoRoot, "test", "benchmark", "independent.expected-concept-candidates.yaml"),
      "--artifacts-root",
      path.join(repoRoot, "test", "artifacts"),
    ],
    { cwd: repoRoot, encoding: "utf8" }
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(String(result.stdout || ""), /overall_score=100\.0/);
});
