#!/usr/bin/env node
const { execSync } = require("child_process");
const path = require("path");

const REPO_ROOT = path.resolve(__dirname, "..");
const LEGACY_PATH = path.join(REPO_ROOT, "src", "core", "legacy-enrichment.js");
const POLICY_PATH = path.join(__dirname, "LEGACY_POLICY.md");

function rel(p) {
  return path.relative(process.cwd(), p).replace(/\\/g, "/");
}

function main() {
  try {
    const status = execSync(
      `git status --porcelain -- "${LEGACY_PATH}" "${POLICY_PATH}"`,
      { encoding: "utf8" }
    )
      .trim()
      .split(/\r?\n/)
      .filter(Boolean);

    let legacyChanged = false;
    let policyChanged = false;
    for (const line of status) {
      const normalized = line.replace(/\\/g, "/");
      if (normalized.endsWith(rel(LEGACY_PATH))) legacyChanged = true;
      if (normalized.endsWith(rel(POLICY_PATH))) policyChanged = true;
    }

    if (legacyChanged && !policyChanged) {
      throw new Error("legacy-enrichment.js changed without LEGACY_POLICY.md rationale update.");
    }

    process.stdout.write("Legacy policy check OK.\n");
  } catch (err) {
    console.error(err && err.message ? err.message : String(err));
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
