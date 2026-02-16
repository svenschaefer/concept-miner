const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const scriptPath = path.resolve(__dirname, "..", "..", "scripts", "release-smoke-rehearsal.js");

test("release smoke rehearsal script performs pre/post publish workspace installs", () => {
  const script = fs.readFileSync(scriptPath, "utf8");
  assert.match(script, /runNpm\(\["pack"\], root\)/);
  assert.match(script, /runNpm\(\["init", "-y"\], workspaceDir\)/);
  assert.match(script, /runNpm\(\["install", installTarget\], workspaceDir\)/);
  assert.match(script, /runNpx\(\["concept-miner", "--help"\], preDir\)/);
  assert.match(script, /runNpx\(\["concept-miner", "--help"\], postDir\)/);
});

test("release smoke rehearsal script supports public-registry postpublish mode toggle", () => {
  const script = fs.readFileSync(scriptPath, "utf8");
  assert.match(script, /CONCEPT_MINER_PUBLIC_POSTPUBLISH_SMOKE/);
  assert.match(script, /tarball_simulated/);
  assert.match(script, /public_registry/);
});
