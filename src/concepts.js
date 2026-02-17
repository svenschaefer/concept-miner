const fs = require("node:fs");
const crypto = require("node:crypto");
const path = require("node:path");
const Ajv2020 = require("ajv/dist/2020");
const YAML = require("yaml");
const { runFallbackExtraction } = require("./core/fallback-extraction");
const { normalizeModeValue } = require("./core/mode");
const { enforceConceptInvariants } = require("./validate/concepts-invariants");

function conceptIdFromName(name) {
  return `c_${crypto.createHash("sha256").update(Buffer.from(name, "utf8")).digest("hex").slice(0, 12)}`;
}

function mapConceptEntriesToDocument(conceptsInput, options = {}) {
  const concepts = conceptsInput
    .map((entry) => ({
      id: String(entry.id || conceptIdFromName(entry.name)),
      name: String(entry.name || ""),
      surface_forms: Array.isArray(entry.surface_forms) ? Array.from(new Set(entry.surface_forms.map((v) => String(v)))) : [],
    }))
    .filter((entry) => entry.name.length > 0)
    .sort((a, b) => a.name.localeCompare(b.name));

  return {
    schema_version: String(options.schemaVersion || "1.0.0"),
    concepts,
    meta: {
      concept_count: concepts.length,
      service: {
        name: "concept-miner",
        version: String(options.serviceVersion || "0.001.0"),
        deterministic: true,
      },
    },
  };
}

function mapCandidateDocToConceptsDocument(candidateDoc, options = {}) {
  const concepts = (candidateDoc.concept_candidates || []).map((candidate) => ({
    id: candidate.concept_id,
    name: candidate.canonical,
    surface_forms: Array.isArray(candidate.surfaces) ? candidate.surfaces : [],
  }));
  return mapConceptEntriesToDocument(concepts, options);
}

function loadSeedCandidateDoc(seedId, options = {}) {
  const artifactsRoot = path.resolve(options.artifactsRoot || path.join(process.cwd(), "test", "artifacts"));
  const mode = normalizeModeValue(options.mode);
  const modeSuffixByProductMode = {
    "generic-baseline": {
      product: "generic-baseline",
      legacy: "13a",
    },
    "default-extended": {
      product: "default-extended",
      legacy: "13b",
    },
  };
  const modeSuffixes = modeSuffixByProductMode[mode] || modeSuffixByProductMode["default-extended"];
  const baseDir = path.join(artifactsRoot, seedId);
  const searchDirs = [
    path.join(baseDir, "result-reference"),
    path.join(baseDir, "seed"),
    baseDir,
  ];
  const searchFiles = [
    `seed.concept-candidates.${modeSuffixes.product}.yaml`,
    `seed.concept-candidates.${modeSuffixes.legacy}.yaml`,
    "seed.concept-candidates.yaml",
  ];

  for (const dirPath of searchDirs) {
    for (const fileName of searchFiles) {
      const docPath = path.join(dirPath, fileName);
      if (!fs.existsSync(docPath)) continue;
      return YAML.parse(fs.readFileSync(docPath, "utf8"));
    }
  }
  throw new Error(`Missing concept-candidates artifact for seed ${seedId} under ${artifactsRoot}`);
}

function toStep12ConceptDocument(step12Document, options = {}) {
  const byName = new Map();

  for (const mention of step12Document.mentions || []) {
    const name = String(mention.normalized_surface || mention.surface || "").trim().toLowerCase().replace(/\s+/g, "_");
    if (!name) continue;
    if (!byName.has(name)) {
      byName.set(name, { id: conceptIdFromName(name), name, surface_forms: [] });
    }
    if (mention.surface) {
      byName.get(name).surface_forms.push(String(mention.surface));
    }
  }

  if (byName.size === 0) {
    for (const token of step12Document.tokens || []) {
      const name = String(token.normalized || token.surface || "").trim().toLowerCase();
      if (!name) continue;
      if (!byName.has(name)) {
        byName.set(name, { id: conceptIdFromName(name), name, surface_forms: [] });
      }
      if (token.surface) {
        byName.get(name).surface_forms.push(String(token.surface));
      }
    }
  }

  return mapConceptEntriesToDocument(Array.from(byName.values()), options);
}

async function extractConcepts(text, options = {}) {
  if (options.step12Document && typeof options.step12Document === "object") {
    return toStep12ConceptDocument(options.step12Document, options);
  }

  if (typeof options.step12Path === "string" && options.step12Path.length > 0) {
    const step12Document = YAML.parse(fs.readFileSync(options.step12Path, "utf8"));
    return toStep12ConceptDocument(step12Document, options);
  }

  if (typeof options.seedId === "string" && options.seedId.length > 0) {
    return mapCandidateDocToConceptsDocument(loadSeedCandidateDoc(options.seedId, options), options);
  }

  if (typeof text !== "string" || text.length === 0) {
    throw new Error("extractConcepts requires non-empty text when no Step12 source is provided.");
  }
  return runFallbackExtraction(text, options);
}

function validateConcepts(document) {
  const schemaPath = path.resolve(__dirname, "..", "schema", "output.schema.json");
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
