const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
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

function stageConceptCandidateArtifacts(seedId) {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "concept-miner-check-"));
  const sourceDir = path.join(repoRoot, "test", "artifacts", seedId, "result-reference");
  const targetDir = path.join(tmpRoot, seedId, "seed");
  fs.mkdirSync(targetDir, { recursive: true });

  const required = [
    "seed.concept-candidates.13a.yaml",
    "seed.concept-candidates.13b.yaml",
  ];
  for (const name of required) {
    fs.copyFileSync(path.join(sourceDir, name), path.join(targetDir, name));
  }
  return tmpRoot;
}

for (const mode of ["13a", "13b"]) {
  test(`prototype check-concept-candidates validates staged artifact (${mode})`, () => {
    const artifactsRoot = stageConceptCandidateArtifacts("prime_gen");
    const result = runNode([
      "prototype/check-concept-candidates.js",
      "--seed-id",
      "prime_gen",
      "--artifacts-root",
      artifactsRoot,
      "--step13-mode",
      mode,
    ]);

    assert.equal(result.status, 0, String(result.stderr || result.stdout || ""));
    assert.match(String(result.stdout || ""), /Concept candidates validation OK/);
  });
}
