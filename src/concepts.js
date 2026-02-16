const fs = require("node:fs");
const path = require("node:path");
const Ajv2020 = require("ajv/dist/2020");
const { runFallbackExtraction } = require("./core/fallback-extraction");
const {
  loadPrototype,
  toPrototypeOptions,
  mapCandidateDocToConceptsDocument,
} = require("./core/prototype-bridge");
const { enforceConceptInvariants } = require("./validate/concepts-invariants");

async function extractConcepts(text, options = {}) {
  if (options.step12Document && typeof options.step12Document === "object") {
    const prototype = loadPrototype();
    const prototypeOptions = toPrototypeOptions(options);
    const candidateDoc = prototype.buildConceptCandidatesFromStep12(options.step12Document, prototypeOptions);
    const diagnostics = candidateDoc._diagnostics || null;
    if (candidateDoc._diagnostics) delete candidateDoc._diagnostics;
    return mapCandidateDocToConceptsDocument(candidateDoc, options, diagnostics);
  }

  if (typeof options.step12Path === "string" && options.step12Path.length > 0) {
    const prototype = loadPrototype();
    const prototypeOptions = toPrototypeOptions(options);
    const result = prototype.generateForStep12Path(options.step12Path, prototypeOptions);
    return mapCandidateDocToConceptsDocument(result.outputDoc, options, result.diagnostics || null);
  }

  if (typeof options.seedId === "string" && options.seedId.length > 0) {
    const prototype = loadPrototype();
    const prototypeOptions = toPrototypeOptions(options);
    const result = await prototype.generateForSeed(options.seedId, prototypeOptions);
    return mapCandidateDocToConceptsDocument(result.outputDoc, options, result.diagnostics || null);
  }

  if (typeof text !== "string" || text.length === 0) {
    throw new Error("extractConcepts requires non-empty text when no Step12 source is provided.");
  }
  return runFallbackExtraction(text, options);
}

function validateConcepts(document) {
  const schemaPath = path.resolve(__dirname, "schema", "output.schema.json");
  const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  const validate = ajv.compile(schema);
  const ok = validate(document);
  const errors = (validate.errors || []).map((err) => ({
    message: err.message || "validation error",
    path: err.instancePath || "",
    keyword: err.keyword || "",
    params: err.params || {},
  }));
  enforceConceptInvariants(document, errors);
  return { ok: Boolean(ok) && errors.length === 0, errors };
}

module.exports = {
  extractConcepts,
  validateConcepts,
};
