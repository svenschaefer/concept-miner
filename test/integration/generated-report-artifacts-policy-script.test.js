const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const repoRoot = path.resolve(__dirname, "..", "..");

test("generated report artifacts policy script runs successfully when policy is respected", () => {
  const result = spawnSync(
    process.execPath,
    [path.join(repoRoot, "scripts", "check-generated-report-artifacts-policy.js")],
    { cwd: repoRoot, encoding: "utf8" }
  );
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(String(result.stdout || ""), /Generated report artifact policy check OK/i);
});
