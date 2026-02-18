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
  assert.match(String(result.stdout || ""), /extract --text <string>/);
  assert.doesNotMatch(String(result.stdout || ""), /concept-miner run --text <string>/);
  assert.doesNotMatch(String(result.stdout || ""), /concept-miner validate --in <path>/);
});

test("CLI rejects removed compatibility run command", () => {
  const result = runCli(["run"]);
  assert.equal(result.status, 1);
  assert.match(String(result.stderr || ""), /Unknown command: run/i);
});

test("CLI rejects removed compatibility validate command", () => {
  const result = runCli(["validate", "--in", "out.json"]);
  assert.equal(result.status, 1);
  assert.match(String(result.stderr || ""), /Unknown command: validate/i);
});

test("CLI extract supports product mode flag", () => {
  const result = runCli(["extract", "--text", "alpha beta alpha", "--mode", "generic-baseline"]);
  assert.equal(result.status, 0);
  const parsed = JSON.parse(String(result.stdout || "{}"));
  assert.equal(parsed.schema_version, "1.0.0");
  assert.ok(Array.isArray(parsed.concepts));
});

test("CLI extract accepts kebab-case product mode flag", () => {
  const result = runCli(["extract", "--text", "alpha beta alpha", "--mode", "generic-baseline"]);
  assert.equal(result.status, 0);
  const parsed = JSON.parse(String(result.stdout || "{}"));
  assert.equal(parsed.schema_version, "1.0.0");
  assert.ok(Array.isArray(parsed.concepts));
});

test("CLI extract rejects legacy underscore mode alias", () => {
  const result = runCli(["extract", "--text", "alpha beta alpha", "--mode", "generic_baseline"]);
  assert.equal(result.status, 1);
  assert.match(String(result.stderr || ""), /Invalid mode/i);
});

test("CLI extract hard-fails with unreachable wikipedia-title-index endpoint in default-extended mode", () => {
  const result = runCli([
    "extract",
    "--text",
    "alpha beta alpha",
    "--mode",
    "default-extended",
    "--wikipedia-title-index-endpoint",
    "http://127.0.0.1:1",
    "--wikipedia-title-index-timeout-ms",
    "50",
  ]);
  assert.equal(result.status, 1);
  assert.match(String(result.stderr || ""), /wikipedia-title-index query failed/i);
});

test("CLI extract rejects invalid wikipedia-title-index timeout flag", () => {
  const result = runCli([
    "extract",
    "--text",
    "alpha beta alpha",
    "--wikipedia-title-index-timeout-ms",
    "0",
  ]);
  assert.equal(result.status, 1);
  assert.match(String(result.stderr || ""), /Invalid --wikipedia-title-index-timeout-ms/i);
});

test("CLI validate-concepts validates extracted output", () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "nodejs-template-cli-"));
  const outputPath = path.join(tmpDir, "concepts.json");
  const extract = runCli(["extract", "--text", "alpha beta alpha", "--mode", "generic-baseline", "--out", outputPath]);
  assert.equal(extract.status, 0);

  const validate = runCli(["validate-concepts", "--in", outputPath]);
  assert.equal(validate.status, 0);
  assert.match(String(validate.stdout || ""), /^ok/m);
});
