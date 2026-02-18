const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const { extractConcepts } = require("../../src");

const repoRoot = path.resolve(__dirname, "..", "..");

test("seed runtime extraction writes deterministic output in staged seed layout", async () => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "concept-miner-seed-runtime-"));
  const seedId = "prime_gen";
  const sourceSeed = path.join(repoRoot, "test", "artifacts", seedId, "seed.txt");
  const targetSeedDir = path.join(tmpRoot, seedId);
  fs.mkdirSync(targetSeedDir, { recursive: true });
  fs.copyFileSync(sourceSeed, path.join(targetSeedDir, "seed.txt"));

  await assert.rejects(
    () => extractConcepts("", {
      seedId,
      artifactsRoot: tmpRoot,
      mode: "default-extended",
      wikipediaTitleIndexEndpoint: "http://127.0.0.1:1",
      wikipediaTitleIndexTimeoutMs: 50,
    }),
    /wikipedia-title-index/i
  );
});
