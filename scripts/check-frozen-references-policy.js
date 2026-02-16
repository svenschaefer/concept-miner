const { execSync } = require("node:child_process");

function main() {
  const status = execSync(
    "git status --porcelain -- test/artifacts CHANGELOG.md",
    { encoding: "utf8" }
  )
    .trim()
    .split(/\r?\n/)
    .filter(Boolean);

  const refsChanged = status.some((line) =>
    line.replace(/\\/g, "/").includes("test/artifacts/") &&
    line.replace(/\\/g, "/").includes("/result-reference/")
  );
  const changelogChanged = status.some((line) =>
    line.replace(/\\/g, "/").endsWith("CHANGELOG.md")
  );

  if (refsChanged && !changelogChanged) {
    throw new Error(
      "Frozen result-reference artifacts changed without CHANGELOG.md rationale update."
    );
  }

  process.stdout.write("Frozen reference policy check OK.\n");
}

try {
  main();
} catch (err) {
  const message = err && err.message ? err.message : String(err);
  process.stderr.write(`${message}\n`);
  process.exit(1);
}
