const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..", "..");
const productFacingFiles = [
  "README.md",
  "src/tools/cli.js",
  "openapi/openapi.yaml",
  "schema/concepts.schema.json",
];

function read(relPath) {
  return fs.readFileSync(path.join(repoRoot, relPath), "utf8");
}

test("product-facing files do not use deprecated mode labels", () => {
  const forbidden = [/\bstep13\b/i, /\b13a\b/i, /\b13b\b/i];

  for (const relPath of productFacingFiles) {
    const text = read(relPath);
    for (const pattern of forbidden) {
      assert.doesNotMatch(text, pattern, `${relPath} contains forbidden label: ${pattern}`);
    }
  }
});

test("product-facing files do not abbreviate wikipedia-title-index as wiki or wti", () => {
  const forbidden = [/\bwiki\b/i, /\bwti\b/i];

  for (const relPath of productFacingFiles) {
    const text = read(relPath);
    for (const pattern of forbidden) {
      assert.doesNotMatch(text, pattern, `${relPath} contains forbidden abbreviation: ${pattern}`);
    }
  }
});
