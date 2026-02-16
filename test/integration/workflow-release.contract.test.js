const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..", "..");
const releaseWorkflowPath = path.join(repoRoot, ".github", "workflows", "release.yml");

function readReleaseWorkflow() {
  return fs.readFileSync(releaseWorkflowPath, "utf8");
}

test("release workflow enforces package version to match tag input", () => {
  const workflow = readReleaseWorkflow();
  assert.match(workflow, /Verify package version matches tag/);
  assert.match(workflow, /PKG_VERSION="\$\(node -p "require\('\.\/package\.json'\)\.version"\)"/);
  assert.match(workflow, /if \[\[ "v\$PKG_VERSION" != "\$TAG" \]\]/);
});

test("release workflow creates and uploads npm tarball artifact", () => {
  const workflow = readReleaseWorkflow();
  assert.match(workflow, /Create npm tarball/);
  assert.match(workflow, /npm pack/);
  assert.match(workflow, /Upload tarball artifact/);
  assert.match(workflow, /actions\/upload-artifact@v4/);
  assert.match(workflow, /path: "\*\.tgz"/);
});
