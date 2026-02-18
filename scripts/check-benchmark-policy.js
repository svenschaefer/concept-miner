#!/usr/bin/env node
const { execSync } = require("child_process");
const path = require("path");

const REPO_ROOT = path.resolve(__dirname, "..");
const EXPECTED_PATH = path.join(REPO_ROOT, "test", "benchmark", "independent.expected-concept-candidates.yaml");
const POLICY_PATH = path.join(__dirname, "BENCHMARK_POLICY.md");

function rel(p) {
  return path.relative(process.cwd(), p).replace(/\\/g, "/");
}

function main() {
  try {
    const status = execSync(
      `git status --porcelain -- "${EXPECTED_PATH}" "${POLICY_PATH}"`,
      { encoding: "utf8" }
    )
      .trim()
      .split(/\r?\n/)
      .filter(Boolean);

    let expectedChanged = false;
    let policyChanged = false;
    for (const line of status) {
      const normalized = line.replace(/\\/g, "/");
      if (normalized.endsWith(rel(EXPECTED_PATH))) expectedChanged = true;
      if (normalized.endsWith(rel(POLICY_PATH))) policyChanged = true;
    }

    if (expectedChanged && !policyChanged) {
      throw new Error(
        "independent.expected-concept-candidates.yaml changed without BENCHMARK_POLICY.md rationale update."
      );
    }

    process.stdout.write("Benchmark policy check OK.\n");
  } catch (err) {
    console.error(err && err.message ? err.message : String(err));
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
