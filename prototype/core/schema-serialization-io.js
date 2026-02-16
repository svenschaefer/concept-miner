const fs = require("fs");
const path = require("path");
const YAML = require("yaml");
const Ajv2020 = require("ajv/dist/2020");

function loadConceptCandidatesSchema(step13Dir) {
  const migratedSchemaPath = path.resolve(step13Dir, "..", "schema", "seed.concept-candidates.schema.json");
  const legacySchemaPath = path.join(step13Dir, "seed.concept-candidates.schema.json");
  const schemaPath = fs.existsSync(migratedSchemaPath) ? migratedSchemaPath : legacySchemaPath;
  return JSON.parse(fs.readFileSync(schemaPath, "utf8"));
}

function validateSchema(schema, doc) {
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  const validate = ajv.compile(schema);
  if (!validate(doc)) {
    const lines = (validate.errors || []).map((e) => `${e.instancePath || "/"} ${e.message || "schema error"}`);
    throw new Error(`Schema validation failed:\n${lines.join("\n")}`);
  }
}

function serializeDeterministicYaml(doc) {
  let text = YAML.stringify(doc, {
    lineWidth: 0,
    indent: 2,
    sortMapEntries: false,
    aliasDuplicateObjects: false,
  });
  text = text.replace(/\r\n/g, "\n").replace(/\n*$/, "\n");
  return text;
}

module.exports = {
  loadConceptCandidatesSchema,
  validateSchema,
  serializeDeterministicYaml,
};
