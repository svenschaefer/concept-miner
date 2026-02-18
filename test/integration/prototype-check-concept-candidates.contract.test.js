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

test("product check-benchmark-policy executes successfully", () => {
  const result = runNode(["scripts/check-benchmark-policy.js"]);
  assert.equal(result.status, 0, String(result.stderr || result.stdout || ""));
  assert.match(String(result.stdout || ""), /Benchmark policy check OK/);
});

test("product check-legacy-policy executes successfully", () => {
  const result = runNode(["scripts/check-legacy-policy.js"]);
  assert.equal(result.status, 0, String(result.stderr || result.stdout || ""));
  assert.match(String(result.stdout || ""), /Legacy policy check OK/);
});
