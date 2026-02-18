const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const pkg = JSON.parse(fs.readFileSync(path.join(repoRoot, "package.json"), "utf8"));
const changelog = fs.readFileSync(path.join(repoRoot, "CHANGELOG.md"), "utf8");

const requireEnv = process.argv.includes("--require-env");
const target = process.env.RELEASE_TARGET_VERSION;

if (requireEnv && (!target || target.trim().length === 0)) {
  process.stderr.write("Missing RELEASE_TARGET_VERSION. Set it before running release scripts.\n");
  process.exit(1);
}

if (!target || target.trim().length === 0) {
  process.stdout.write("RELEASE_TARGET_VERSION not set; release target check skipped.\n");
  process.exit(0);
}

if (target !== pkg.version) {
  process.stderr.write(
    `Release target mismatch: RELEASE_TARGET_VERSION=${target} but package.json version=${pkg.version}.\n`
  );
  process.exit(1);
}

const heading = `## [${target}]`;
if (!changelog.includes(heading)) {
  process.stderr.write(`Missing changelog heading for release target: ${heading}\n`);
  process.exit(1);
}

process.stdout.write(`release-target-ok ${target}\n`);
