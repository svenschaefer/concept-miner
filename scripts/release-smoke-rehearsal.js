const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

function fail(message) {
  throw new Error(message);
}

function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, encoding: "utf8" });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    const stderr = (result.stderr || "").trim();
    const stdout = (result.stdout || "").trim();
    fail(`Command failed: ${command} ${args.join(" ")}\n${stderr || stdout}`);
  }
  return (result.stdout || "").trim();
}

function quoteCmdArg(arg) {
  return `"${String(arg).replace(/"/g, '""')}"`;
}

function formatCmdArg(arg) {
  const text = String(arg);
  return /^[A-Za-z0-9._@/:=\\-]+$/.test(text) ? text : quoteCmdArg(text);
}

function runWindowsShell(commandLine, cwd) {
  const comspec = process.env.ComSpec || "cmd.exe";
  const result = spawnSync(comspec, ["/d", "/s", "/c", commandLine], { cwd, encoding: "utf8" });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    const stderr = (result.stderr || "").trim();
    const stdout = (result.stdout || "").trim();
    fail(`Command failed: ${commandLine}\n${stderr || stdout}`);
  }
  return (result.stdout || "").trim();
}

function assertVersion(workspaceDir, expectedVersion) {
  const out = run(
    process.execPath,
    [
      "-e",
      "const fs=require('node:fs');const p=JSON.parse(fs.readFileSync('node_modules/concept-miner/package.json','utf8'));console.log(p.version);",
    ],
    workspaceDir
  );
  if (out !== expectedVersion) {
    fail(`Installed version mismatch in ${workspaceDir}: expected ${expectedVersion}, got ${out}`);
  }
}

function main() {
  const root = path.resolve(__dirname, "..");
  const pkg = require(path.join(root, "package.json"));
  const version = pkg.version;
  const npmCommand = "npm";
  const npxCommand = "npx";
  const runNpm = (args, cwd) => (
    process.platform === "win32"
      ? runWindowsShell(`${npmCommand} ${args.map(formatCmdArg).join(" ")}`, cwd)
      : run(npmCommand, args, cwd)
  );
  const runNpx = (args, cwd) => (
    process.platform === "win32"
      ? runWindowsShell(`${npxCommand} ${args.map(formatCmdArg).join(" ")}`, cwd)
      : run(npxCommand, args, cwd)
  );

  const packedFile = runNpm(["pack"], root)
    .split(/\r?\n/)
    .filter(Boolean)
    .pop();
  const packedPath = path.join(root, packedFile);
  if (!fs.existsSync(packedPath)) {
    fail(`Packed tarball not found: ${packedPath}`);
  }

  const smokeRoot = fs.mkdtempSync(path.join(os.tmpdir(), "concept-miner-release-smoke-"));
  const preDir = path.join(smokeRoot, `prepublish-${version}`);
  function installWorkspaceWithCommands(workspaceDir, installTarget) {
    fs.mkdirSync(workspaceDir, { recursive: true });
    runNpm(["init", "-y"], workspaceDir);
    runNpm(["install", installTarget], workspaceDir);
  }

  installWorkspaceWithCommands(preDir, packedPath);
  assertVersion(preDir, version);
  const cliOut = runNpx(["concept-miner", "--help"], preDir);
  if (!/Usage:/.test(cliOut)) {
    fail(`CLI smoke failed in ${preDir}: help output did not include Usage.`);
  }

  const postDir = path.join(smokeRoot, `postpublish-${version}`);
  const publicInstall = process.env.CONCEPT_MINER_PUBLIC_POSTPUBLISH_SMOKE === "1";
  if (publicInstall) {
    installWorkspaceWithCommands(postDir, `${pkg.name}@${version}`);
  } else {
    installWorkspaceWithCommands(postDir, packedPath);
  }
  assertVersion(postDir, version);
  const postCliOut = runNpx(["concept-miner", "--help"], postDir);
  if (!/Usage:/.test(postCliOut)) {
    fail(`CLI smoke failed in ${postDir}: help output did not include Usage.`);
  }

  process.stdout.write(
    JSON.stringify(
      {
        ok: true,
        package: pkg.name,
        version,
        prepublish_workspace: preDir,
        postpublish_workspace: postDir,
        postpublish_mode: publicInstall ? "public_registry" : "tarball_simulated",
      },
      null,
      2
    ) + "\n"
  );
}

main();
