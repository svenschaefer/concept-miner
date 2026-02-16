const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const repoRoot = path.resolve(__dirname, "..", "..");
const cliPath = path.join(repoRoot, "bin", "cli.js");

function runCli(args) {
  const result = spawnSync(process.execPath, [cliPath].concat(args), {
    cwd: repoRoot,
    encoding: "utf8",
  });
  if (result.error) throw result.error;
  return result;
}

test("CLI usage includes --config in run syntax", () => {
  const result = runCli(["--help"]);
  assert.equal(result.status, 0);
  assert.match(String(result.stdout || ""), /--config <path>/);
});

test("CLI run rejects when no run input source is provided", () => {
  const result = runCli(["run"]);
  assert.equal(result.status, 1);
  assert.match(String(result.stderr || ""), /Exactly one of --text or --in is required/i);
});

test("CLI run rejects when multiple run input sources are provided", () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "nodejs-template-cli-"));
  const inputPath = path.join(tmpDir, "input.json");
  fs.writeFileSync(inputPath, JSON.stringify({ items: [] }), "utf8");

  const result = runCli(["run", "--text", "alpha", "--in", inputPath]);
  assert.equal(result.status, 1);
  assert.match(String(result.stderr || ""), /Exactly one of --text or --in is required/i);
});

test("CLI run with --config fails explicitly when config file is missing", () => {
  const result = runCli(["run", "--text", "alpha", "--config", "does-not-exist.json"]);
  assert.equal(result.status, 1);
  assert.match(String(result.stderr || ""), /Config file does not exist/i);
});
