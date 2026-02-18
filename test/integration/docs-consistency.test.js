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
    "docs/FROZEN_REFERENCES_POLICY.md",
    "docs/GENERATED_REPORT_ARTIFACTS_POLICY.md",
    "docs/CONTRACT_ALIGNMENT.md",
    "docs/GUARANTEES.md",
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

test("README includes REST quick-start examples for extract endpoint", () => {
  const readme = read("README.md");
  assert.match(readme, /\/v1\/concepts\/extract/);
  assert.match(readme, /curl -sS -X POST/);
});

test("README does not advertise removed compatibility commands", () => {
  const readme = read("README.md");
  assert.doesNotMatch(readme, /Compatibility commands/i);
  assert.doesNotMatch(readme, /concept-miner run --text/);
  assert.doesNotMatch(readme, /concept-miner validate --in/);
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

test("guarantees doc states enrichment typing and strict mode policy", () => {
  const guarantees = read("docs/GUARANTEES.md");
  assert.match(guarantees, /wikipedia_title_index/);
  assert.match(guarantees, /exact_match/);
  assert.match(guarantees, /prefix_count/);
  assert.match(guarantees, /default-extended/i);
  assert.doesNotMatch(guarantees, /generic-baseline/i);
});

test("guarantees doc defines 1.x stability policy with breaking/non-breaking examples", () => {
  const guarantees = read("docs/GUARANTEES.md");
  assert.match(guarantees, /1\.x Stability Policy/);
  assert.match(guarantees, /Breaking changes/);
  assert.match(guarantees, /Non-breaking changes/);
  assert.match(guarantees, /major version bump/i);
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
  assert.match(releaseGuide, /pack:check/);
  assert.match(releaseGuide, /does not create/i);
  assert.match(releaseGuide, /pack:artifact/);
  assert.match(releaseGuide, /RELEASE_TARGET_VERSION/);
});

test("operational guide documents runtime boundary", () => {
  const operational = read("docs/OPERATIONAL.md");
  assert.match(operational, /Runtime Boundary/);
  assert.match(operational, /no dependency on prototype-local files/i);
});

test("operational guide documents REST runtime hardening notes", () => {
  const operational = read("docs/OPERATIONAL.md");
  assert.match(operational, /1 MiB/);
  assert.match(operational, /400/);
  assert.match(operational, /404/);
  assert.match(operational, /500/);
  assert.match(operational, /422/);
});
