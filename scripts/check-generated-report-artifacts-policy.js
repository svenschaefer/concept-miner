const { execSync } = require("node:child_process");

function main() {
  const status = execSync(
    "git status --porcelain -- prototype CHANGELOG.md docs/GENERATED_REPORT_ARTIFACTS_POLICY.md",
    { encoding: "utf8" }
  )
    .trim()
    .split(/\r?\n/)
    .filter(Boolean);

  const reportChanged = status.some((line) => {
    const normalized = line.replace(/\\/g, "/");
    return (
      normalized.endsWith("prototype/13b-threshold-sweep.report.json") ||
      normalized.endsWith("prototype/step12-wikipedia-title-index.coverage.report.json")
    );
  });

  const changelogChanged = status.some((line) =>
    line.replace(/\\/g, "/").endsWith("CHANGELOG.md")
  );
  const policyChanged = status.some((line) =>
    line.replace(/\\/g, "/").endsWith("docs/GENERATED_REPORT_ARTIFACTS_POLICY.md")
  );

  if (reportChanged && !changelogChanged) {
    throw new Error(
      "Generated report artifacts changed without CHANGELOG.md rationale update."
    );
  }

  if (reportChanged && !policyChanged) {
    throw new Error(
      "Generated report artifacts changed without docs/GENERATED_REPORT_ARTIFACTS_POLICY.md update."
    );
  }

  process.stdout.write("Generated report artifact policy check OK.\n");
}

try {
  main();
} catch (err) {
  const message = err && err.message ? err.message : String(err);
  process.stderr.write(`${message}\n`);
  process.exit(1);
}
