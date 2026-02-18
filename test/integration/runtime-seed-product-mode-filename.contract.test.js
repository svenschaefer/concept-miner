const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const { extractConcepts } = require("../../src");

test("extractConcepts seed runtime reads seed.txt from seed root", async () => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "concept-miner-seed-"));
  const seedId = "demo";
  const seedDir = path.join(tmpRoot, seedId);
  fs.mkdirSync(seedDir, { recursive: true });
  fs.writeFileSync(path.join(seedDir, "seed.txt"), "A WebShop is an online store.", "utf8");

  await assert.rejects(
    () => extractConcepts("", {
      mode: "default-extended",
      seedId,
      artifactsRoot: tmpRoot,
      wikipediaTitleIndexEndpoint: "http://127.0.0.1:1",
      wikipediaTitleIndexTimeoutMs: 50,
    }),
    /wikipedia-title-index/i
  );
});

test("extractConcepts seed runtime fails when seed.txt is missing", async () => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "concept-miner-seed-"));
  const seedId = "demo";
  fs.mkdirSync(path.join(tmpRoot, seedId), { recursive: true });

  await assert.rejects(
    () => extractConcepts("", {
      mode: "default-extended",
      seedId,
      artifactsRoot: tmpRoot,
    }),
    /Missing seed\.txt/i
  );
});
