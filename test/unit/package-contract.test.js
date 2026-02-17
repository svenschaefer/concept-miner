const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..", "..");
const packageJsonPath = path.join(repoRoot, "package.json");

test("package.json defines stable public export subpaths", () => {
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

  assert.equal(typeof pkg.exports, "object");
  assert.equal(pkg.exports["."], "./src/index.js");
  assert.equal(pkg.exports["./validate"], "./src/validate/index.js");
  assert.equal(pkg.exports["./tools"], "./src/tools/index.js");
  assert.equal(pkg.exports["./schema"], "./schema/output.schema.json");
});

test("package packlist includes docs and security files", () => {
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

  assert.ok(Array.isArray(pkg.files));
  assert.ok(pkg.files.includes("docs/"));
  assert.ok(pkg.files.includes("README.md"));
  assert.ok(pkg.files.includes("SECURITY.md"));
});

test("package scripts include lint and ci gate wiring", () => {
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  assert.equal(typeof pkg.scripts, "object");
  assert.equal(typeof pkg.scripts.lint, "string");
  assert.match(pkg.scripts.ci_check || pkg.scripts["ci:check"], /npm run lint/);
});

test("package scripts expose product-facing mode names for benchmark tooling", () => {
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  assert.equal(typeof pkg.scripts["eval:concept-candidates:independent:generic-baseline"], "string");
  assert.equal(typeof pkg.scripts["eval:concept-candidates:independent:default-extended"], "string");
  assert.equal(typeof pkg.scripts["eval:concept-candidates:default-extended:threshold-sweep"], "string");
  assert.equal(typeof pkg.scripts["report:wikipedia-title-index:coverage"], "string");
});

test("exported schema JSON is non-empty and parseable", () => {
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  const schemaPath = path.join(repoRoot, pkg.exports["./schema"]);
  const raw = fs.readFileSync(schemaPath, "utf8");
  assert.ok(raw.trim().length > 0, "schema export file must not be empty");

  const schema = JSON.parse(raw);
  assert.equal(typeof schema, "object");
  assert.equal(schema.type, "object");
  assert.equal(typeof schema.$schema, "string");
});
