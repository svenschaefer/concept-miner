const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..", "..");

test("bin/cli.js remains a thin delegating entrypoint", () => {
  const cliEntrypoint = fs.readFileSync(path.join(repoRoot, "bin", "cli.js"), "utf8");
  assert.match(cliEntrypoint, /require\("\.\.\/src\/tools\/cli"\)/);
  assert.match(cliEntrypoint, /runCli\(\)\.catch/);
  assert.doesNotMatch(cliEntrypoint, /--text|--in|--out|--mode/);
});
