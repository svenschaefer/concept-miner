const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const { runFromInput, runMain } = require("../../src");

function loadJson(fileName) {
  const p = path.resolve(__dirname, `../fixtures/${fileName}`);
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

test("runFromInput is deterministic for identical input", () => {
  const input = loadJson("example-input.json");
  const a = runFromInput(input, {});
  const b = runFromInput(input, {});
  assert.equal(JSON.stringify(a), JSON.stringify(b));
});

test("runMain rejects empty text", async () => {
  await assert.rejects(() => runMain("", {}), /non-empty text/i);
});

test("runMain is deterministic for identical text", async () => {
  const text = "alpha beta alpha";
  const a = await runMain(text, {});
  const b = await runMain(text, {});
  assert.equal(JSON.stringify(a), JSON.stringify(b));
});
