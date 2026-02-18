const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const repoRoot = path.resolve(__dirname, "..", "..");
const scriptPath = path.join(repoRoot, "scripts", "check-release-target-version.js");
const pkg = require(path.join(repoRoot, "package.json"));

function run(args = [], env = {}) {
  return spawnSync(process.execPath, [scriptPath, ...args], {
    cwd: repoRoot,
    env: { ...process.env, ...env },
    encoding: "utf8",
  });
}

test("release target check fails when required env var is missing", () => {
  const result = run(["--require-env"], { RELEASE_TARGET_VERSION: "" });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Missing RELEASE_TARGET_VERSION/);
});

test("release target check fails for version mismatch", () => {
  const result = run(["--require-env"], { RELEASE_TARGET_VERSION: "9.9.9" });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Release target mismatch/);
});

test("release target check passes for matching version and changelog heading", () => {
  const result = run(["--require-env"], { RELEASE_TARGET_VERSION: pkg.version });
  assert.equal(result.status, 0);
  assert.match(result.stdout, new RegExp(`release-target-ok ${pkg.version.replace(/\./g, "\\.")}`));
});
