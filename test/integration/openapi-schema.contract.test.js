const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const YAML = require("yaml");

const repoRoot = path.resolve(__dirname, "..", "..");

test("openapi exposes extract and validate endpoints under /v1", () => {
  const openapiPath = path.join(repoRoot, "openapi", "openapi.yaml");
  const doc = YAML.parse(fs.readFileSync(openapiPath, "utf8"));
  assert.equal(doc.openapi, "3.0.3");
  assert.ok(doc.paths["/v1/concepts/extract"], "missing /v1/concepts/extract");
  assert.ok(doc.paths["/v1/concepts/validate"], "missing /v1/concepts/validate");
  assert.ok(doc.paths["/v1/concepts/extract"].post, "missing POST /v1/concepts/extract");
  assert.ok(doc.paths["/v1/concepts/validate"].post, "missing POST /v1/concepts/validate");
});

test("public concepts schema requires schema_version and concepts", () => {
  const schemaPath = path.join(repoRoot, "schema", "concepts.schema.json");
  const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
  assert.equal(schema.type, "object");
  assert.ok(Array.isArray(schema.required));
  assert.ok(schema.required.includes("schema_version"));
  assert.ok(schema.required.includes("concepts"));
});

test("occurrence offsets are documented as UTF-16 in schema and openapi", () => {
  const schemaPath = path.join(repoRoot, "schema", "concepts.schema.json");
  const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
  const schemaStartDesc = String(schema.$defs.occurrence.properties.start.description || "");
  const schemaEndDesc = String(schema.$defs.occurrence.properties.end.description || "");
  assert.match(schemaStartDesc, /UTF-16/i);
  assert.match(schemaEndDesc, /UTF-16/i);

  const openapiPath = path.join(repoRoot, "openapi", "openapi.yaml");
  const openapi = YAML.parse(fs.readFileSync(openapiPath, "utf8"));
  const occurrence = openapi.components.schemas.Occurrence;
  assert.match(String(occurrence.properties.start.description || ""), /UTF-16/i);
  assert.match(String(occurrence.properties.end.description || ""), /UTF-16/i);
});
