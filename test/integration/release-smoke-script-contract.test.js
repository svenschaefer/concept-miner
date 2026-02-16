const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const scriptPath = path.resolve(__dirname, "..", "..", "scripts", "release-smoke-check.js");

test("release smoke script checks API exports and CLI help", () => {
  const script = fs.readFileSync(scriptPath, "utf8");
  assert.match(script, /runFromInput/);
  assert.match(script, /runMain/);
  assert.match(script, /--help/);
  assert.match(script, /Usage:/);
});

test("release smoke script checks package bin mapping", () => {
  const script = fs.readFileSync(scriptPath, "utf8");
  assert.match(script, /package\.json/);
  assert.match(script, /bin mapping is missing/i);
});
