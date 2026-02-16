const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..", "..");

function read(relPath) {
  return fs.readFileSync(path.join(repoRoot, relPath), "utf8");
}

function exists(relPath) {
  return fs.existsSync(path.join(repoRoot, relPath));
}

test("CHANGELOG keeps an Unreleased section", () => {
  const changelog = read("CHANGELOG.md");
  assert.match(changelog, /^## \[?Unreleased\]?\s*$/m);
});

test("README documentation links reference existing files", () => {
  const readme = read("README.md");
  const requiredDocs = [
    "docs/NPM_RELEASE.md",
    "docs/REPO_WORKFLOWS.md",
    "docs/OPERATIONAL.md",
    "docs/DEV_TOOLING.md",
    "docs/RELEASE_NOTES_TEMPLATE.md",
    "docs/releases/v0.10.0.md",
    "docs/BASELINE_TEST_RUN.md",
    "docs/GUARANTEES.md",
    "docs/STEP12_UPSTREAM_BACKLOG.md",
    "docs/STATUSQUO.md",
    "docs/TEMPLATE_SETUP.md",
    "CONTRIBUTING.md",
    "SECURITY.md",
    "CHANGELOG.md",
  ];

  for (const doc of requiredDocs) {
    assert.match(readme, new RegExp(doc.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.ok(exists(doc), `missing documented file: ${doc}`);
  }
});

test("README includes REST quick-start examples for extract and validate endpoints", () => {
  const readme = read("README.md");
  assert.match(readme, /\/v1\/concepts\/extract/);
  assert.match(readme, /\/v1\/concepts\/validate/);
  assert.match(readme, /curl -sS -X POST/);
});

test("release guide uses explicit staging paths for release commits", () => {
  const releaseGuide = read("docs/NPM_RELEASE.md");
  assert.match(
    releaseGuide,
    /git add CHANGELOG\.md package\.json package-lock\.json src test docs scripts/
  );
  assert.doesNotMatch(releaseGuide, /\ngit add -A\n/);
});

test("guarantees doc states the upstream elementary-assertions Step12 boundary", () => {
  const guarantees = read("docs/GUARANTEES.md");
  assert.match(guarantees, /elementary-assertions/);
  assert.match(guarantees, /Step12/i);
  assert.match(guarantees, /out of scope/i);
});

test("repo workflows doc states pre-1.0 tag strategy", () => {
  const workflows = read("docs/REPO_WORKFLOWS.md");
  assert.match(workflows, /Pre-1\.0 strategy/i);
  assert.match(workflows, /v0\.x\.y/);
});

test("npm release guide documents npm publish prerequisites", () => {
  const releaseGuide = read("docs/NPM_RELEASE.md");
  assert.match(releaseGuide, /npm whoami/);
  assert.match(releaseGuide, /NPM_TOKEN/);
});

test("operational guide documents optional PowerShell wrappers", () => {
  const operational = read("docs/OPERATIONAL.md");
  assert.match(operational, /run-seed-concept-candidates\.ps1/);
  assert.match(operational, /check-concept-candidates\.ps1/);
});
