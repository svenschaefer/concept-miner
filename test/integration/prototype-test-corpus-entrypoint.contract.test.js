const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const repoRoot = path.resolve(__dirname, "..", "..");
const artifactsRoot = path.join(repoRoot, "test", "artifacts");

function stageLegacyPrototypeArtifacts() {
  const stagedRoot = fs.mkdtempSync(path.join(os.tmpdir(), "concept-miner-prototype-corpus-"));
  const seedIds = fs
    .readdirSync(artifactsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));

  for (const seedId of seedIds) {
    const sourceSeedDir = path.join(artifactsRoot, seedId);
    const sourceResultRefDir = path.join(sourceSeedDir, "result-reference");
    const targetSeedDir = path.join(stagedRoot, seedId, "seed");
    fs.mkdirSync(targetSeedDir, { recursive: true });

    const sourceSeedTxt = path.join(sourceSeedDir, "seed.txt");
    if (!fs.existsSync(sourceSeedTxt)) continue;
    fs.copyFileSync(sourceSeedTxt, path.join(targetSeedDir, "seed.txt"));

    const sourceStep12 = path.join(sourceResultRefDir, "seed.elementary-assertions.yaml");
    if (fs.existsSync(sourceStep12)) {
      fs.copyFileSync(sourceStep12, path.join(targetSeedDir, "seed.elementary-assertions.yaml"));
    }
  }

  return stagedRoot;
}

test("prototype concept-candidates corpus entrypoint runs in productized layout", () => {
  const legacyArtifactsRoot = stageLegacyPrototypeArtifacts();
  const result = spawnSync(process.execPath, ["prototype/concept-candidates.test.js"], {
    cwd: repoRoot,
    encoding: "utf8",
    env: {
      ...process.env,
      CONCEPT_MINER_ARTIFACTS_ROOT: legacyArtifactsRoot,
    },
    timeout: 600000,
  });

  if (result.error) throw result.error;

  assert.equal(result.status, 0, String(result.stderr || result.stdout || ""));
  assert.match(String(result.stdout || ""), /concept-candidates tests passed\./);
});
