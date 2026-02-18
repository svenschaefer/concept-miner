const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const pkg = JSON.parse(fs.readFileSync(path.join(repoRoot, "package.json"), "utf8"));

const tarballName = `${pkg.name}-${pkg.version}.tgz`;
const tarballPath = path.join(repoRoot, tarballName);

if (!fs.existsSync(tarballPath)) {
  process.stderr.write(`Missing npm pack artifact: ${tarballPath}\n`);
  process.exit(1);
}

const stat = fs.statSync(tarballPath);
if (!stat.isFile() || stat.size <= 0) {
  process.stderr.write(`Invalid npm pack artifact: ${tarballPath}\n`);
  process.exit(1);
}

process.stdout.write(`${tarballName}\n`);
