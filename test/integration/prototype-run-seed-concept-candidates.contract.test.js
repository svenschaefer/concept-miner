const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const repoRoot = path.resolve(__dirname, "..", "..");

function findPowerShell() {
  const candidates = process.platform === "win32"
    ? ["pwsh", "powershell"]
    : ["pwsh", "powershell"];

  for (const cmd of candidates) {
    const probe = spawnSync(cmd, ["-NoProfile", "-Command", "$PSVersionTable.PSVersion.ToString()"], {
      encoding: "utf8",
    });
    if (probe.status === 0) return cmd;
  }
  return null;
}

function stageSeed(seedId) {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "concept-miner-run-seed-"));
  const sourceDir = path.join(repoRoot, "test", "artifacts", seedId, "result-reference");
  const targetDir = path.join(tmpRoot, seedId, "seed");
  fs.mkdirSync(targetDir, { recursive: true });

  fs.copyFileSync(
    path.join(repoRoot, "test", "artifacts", seedId, "seed.txt"),
    path.join(targetDir, "seed.txt")
  );
  fs.copyFileSync(
    path.join(sourceDir, "seed.elementary-assertions.yaml"),
    path.join(targetDir, "seed.elementary-assertions.yaml")
  );
  return { tmpRoot, targetDir };
}

const powershell = findPowerShell();

test(
  "prototype run-seed wrapper executes in persisted mode for a staged seed",
  { skip: !powershell },
  () => {
    const { tmpRoot, targetDir } = stageSeed("prime_gen");
    const scriptPath = path.join(repoRoot, "prototype", "run-seed-concept-candidates.ps1");
    const result = spawnSync(
      powershell,
      [
        "-NoProfile",
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        scriptPath,
        "-SeedId",
        "prime_gen",
        "-ArtifactsRoot",
        tmpRoot,
        "-Mode",
        "persisted",
        "-Step13Mode",
        "13b",
      ],
      { cwd: repoRoot, encoding: "utf8" }
    );

    assert.equal(result.status, 0, result.stderr || result.stdout);
    assert.ok(fs.existsSync(path.join(targetDir, "seed.concept-candidates.13b.yaml")));
    assert.ok(fs.existsSync(path.join(targetDir, "seed.concept-candidates.13b.meta.json")));
    assert.ok(fs.existsSync(path.join(targetDir, "seed.concept-candidates.13b.diag.json")));
  }
);
