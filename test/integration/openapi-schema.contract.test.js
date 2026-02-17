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

test("openapi concepts document matches key input constraints from JSON schema", () => {
  const schemaPath = path.join(repoRoot, "schema", "concepts.schema.json");
  const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
  const schemaInputIdMin = schema.properties.input_id.minLength;
  const schemaConceptIdPattern = schema.$defs.concept.properties.id.pattern;
  const schemaSurfaceFormsUnique = schema.$defs.concept.properties.surface_forms.uniqueItems;

  const openapiPath = path.join(repoRoot, "openapi", "openapi.yaml");
  const openapi = YAML.parse(fs.readFileSync(openapiPath, "utf8"));
  const conceptsDoc = openapi.components.schemas.ConceptsDocument;
  const extractResponse = openapi.components.schemas.ExtractConceptsResponse;
  const concept = openapi.components.schemas.Concept;

  assert.ok(conceptsDoc.required.includes("schema_version"));
  assert.ok(conceptsDoc.required.includes("concepts"));
  assert.equal(conceptsDoc.properties.input_id.minLength, schemaInputIdMin);

  assert.ok(extractResponse.required.includes("schema_version"));
  assert.ok(extractResponse.required.includes("concepts"));
  assert.equal(extractResponse.properties.input_id.minLength, schemaInputIdMin);
  assert.equal(concept.properties.id.pattern, schemaConceptIdPattern);
  assert.equal(concept.properties.surface_forms.uniqueItems, schemaSurfaceFormsUnique);
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

test("contract docs describe canonical concepts document mapping without envelope wrappers", () => {
  const contractDocPath = path.join(repoRoot, "docs", "CONTRACT_ALIGNMENT.md");
  const contractDoc = fs.readFileSync(contractDocPath, "utf8");
  assert.match(contractDoc, /schema\/concepts\.schema\.json/);
  assert.match(contractDoc, /POST \/v1\/concepts\/extract/);
  assert.match(contractDoc, /No additional transport envelope/i);

  const openapiReadmePath = path.join(repoRoot, "openapi", "README.md");
  const openapiReadme = fs.readFileSync(openapiReadmePath, "utf8");
  assert.match(openapiReadme, /CONTRACT_ALIGNMENT\.md/);

  const schemaReadmePath = path.join(repoRoot, "schema", "README.md");
  const schemaReadme = fs.readFileSync(schemaReadmePath, "utf8");
  assert.match(schemaReadme, /CONTRACT_ALIGNMENT\.md/);
});
