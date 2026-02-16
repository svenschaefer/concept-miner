const path = require("path");
const { spawnSync } = require("child_process");

function fail(message) {
  throw new Error(message);
}

function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, encoding: "utf8" });
  if (result.status !== 0) {
    const stderr = (result.stderr || "").trim();
    const stdout = (result.stdout || "").trim();
    fail(`Command failed: ${command} ${args.join(" ")}\n${stderr || stdout}`);
  }
  return (result.stdout || "").trim();
}

function main() {
  const root = path.resolve(__dirname, "..");
  const pkg = require(path.join(root, "package.json"));
  const api = require(path.join(root, "src", "index.js"));
  const cliEntry = path.join(root, "bin", "cli.js");

  if (!api || typeof api.runFromInput !== "function" || typeof api.runMain !== "function") {
    fail("API smoke failed: expected runFromInput and runMain exports.");
  }

  const cliOut = run(process.execPath, [cliEntry, "--help"], root);
  if (!/Usage:/i.test(cliOut)) {
    fail("CLI smoke failed: help output did not include 'Usage:'.");
  }

  const binKeys = Object.keys(pkg.bin || {});
  if (binKeys.length === 0) {
    fail("Package smoke failed: package.json bin mapping is missing.");
  }

  process.stdout.write(
    JSON.stringify(
      {
        ok: true,
        package: pkg.name,
        version: pkg.version,
        bin: binKeys,
      },
      null,
      2
    ) + "\n"
  );
}

main();
