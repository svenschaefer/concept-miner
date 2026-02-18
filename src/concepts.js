const fs = require("node:fs");
const crypto = require("node:crypto");
const path = require("node:path");
const Ajv2020 = require("ajv/dist/2020");
const YAML = require("yaml");
const { runElementaryAssertions } = require("elementary-assertions");
const { buildConceptCandidatesFromStep12 } = require("./core/step13");
const { normalizeModeValue } = require("./core/mode");
const { enforceConceptInvariants } = require("./validate/concepts-invariants");

const DEFAULT_WIKIPEDIA_TITLE_INDEX_ENDPOINT = "http://127.0.0.1:32123";

function conceptIdFromName(name) {
  return `c_${crypto.createHash("sha256").update(Buffer.from(name, "utf8")).digest("hex").slice(0, 12)}`;
}

function unprocessable(message) {
  const err = new Error(message);
  err.code = "UNPROCESSABLE_INPUT";
  err.name = "UnprocessableInputError";
  return err;
}

function sortedUniqueStrings(values) {
  return Array.from(new Set((values || []).map((v) => String(v)))).sort((a, b) => a.localeCompare(b));
}

function mapConceptEntriesToDocument(conceptsInput, options = {}) {
  const concepts = conceptsInput
    .map((entry) => {
      const base = {
        id: String(entry.id || conceptIdFromName(entry.name)),
        name: String(entry.name || ""),
        surface_forms: sortedUniqueStrings(entry.surface_forms || []),
      };
      if (Array.isArray(entry.occurrences) && entry.occurrences.length > 0) {
        base.occurrences = entry.occurrences;
      }
      return base;
    })
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

function mapCandidateDocToConceptsDocument(candidateDoc, options = {}, context = {}) {
  const mentionById = new Map();
  if (context.step12Document && Array.isArray(context.step12Document.mentions)) {
    for (const mention of context.step12Document.mentions) {
      if (mention && typeof mention.id === "string") {
        mentionById.set(mention.id, mention);
      }
    }
  }

  const concepts = (candidateDoc.concept_candidates || []).map((candidate) => {
    const concept = {
      id: candidate.concept_id,
      name: candidate.canonical,
      surface_forms: Array.isArray(candidate.surfaces) ? candidate.surfaces : [],
    };
    if (options.includeEvidence === true && Array.isArray(candidate.mention_ids)) {
      const occurrences = [];
      for (const mentionId of candidate.mention_ids) {
        const mention = mentionById.get(mentionId);
        if (!mention) continue;
        occurrences.push({
          start: Number.isInteger(mention.start) ? mention.start : 0,
          end: Number.isInteger(mention.end) ? mention.end : 0,
          text: String(mention.surface || mention.normalized_surface || ""),
          source: String(mention.kind || "mention"),
        });
      }
      if (occurrences.length > 0) {
        concept.occurrences = occurrences.sort((a, b) => (a.start - b.start) || (a.end - b.end));
      }
    }
    return concept;
  });
  return mapConceptEntriesToDocument(concepts, options);
}

function loadSeedText(seedId, options = {}) {
  const artifactsRoot = path.resolve(options.artifactsRoot || path.join(process.cwd(), "test", "artifacts"));
  const seedTextPath = path.join(artifactsRoot, seedId, "seed.txt");
  if (!fs.existsSync(seedTextPath)) {
    throw unprocessable(`Missing seed.txt for seed ${seedId} under ${artifactsRoot}`);
  }
  return fs.readFileSync(seedTextPath, "utf8");
}

function parseStep12Document(step12Raw) {
  if (!step12Raw || typeof step12Raw !== "object") {
    throw unprocessable("Step12 input must be an object.");
  }
  if (!Array.isArray(step12Raw.mentions) || step12Raw.mentions.length === 0) {
    throw unprocessable("Step12 input must provide non-empty mentions[].");
  }
  if (!Array.isArray(step12Raw.assertions)) {
    throw unprocessable("Step12 input must provide assertions[].");
  }
  return step12Raw;
}

async function runDefaultExtendedExtractionFromText(text, options = {}) {
  const endpoint =
    options.wikipediaTitleIndexEndpoint
    || options.wikipedia_title_index_endpoint
    || process.env.WIKIPEDIA_TITLE_INDEX_ENDPOINT
    || DEFAULT_WIKIPEDIA_TITLE_INDEX_ENDPOINT;
  const timeoutMs = Number.isFinite(options.timeoutMs) ? Number(options.timeoutMs) : 120000;
  const wikipediaTitleIndexTimeoutMs = Number.isFinite(options.wikipediaTitleIndexTimeoutMs)
    ? Number(options.wikipediaTitleIndexTimeoutMs)
    : (Number.isFinite(options.wikipedia_title_index_timeout_ms) ? Number(options.wikipedia_title_index_timeout_ms) : 2000);

  let step12;
  try {
    step12 = await runElementaryAssertions(String(text), {
      services: {
        "wikipedia-title-index": { endpoint },
      },
      timeoutMs,
      wtiTimeoutMs: wikipediaTitleIndexTimeoutMs,
    });
  } catch (err) {
    throw unprocessable(err && err.message ? err.message : String(err));
  }

  const candidateDoc = buildConceptCandidatesFromStep12(parseStep12Document(step12), {
    step13Mode: "13b",
    enableLegacyEnrichment: false,
    enableRecoverySynthesis: false,
  });
  if (candidateDoc && candidateDoc._diagnostics) delete candidateDoc._diagnostics;
  return mapCandidateDocToConceptsDocument(candidateDoc, options, { step12Document: step12 });
}

async function extractConcepts(text, options = {}) {
  normalizeModeValue(options.mode);

  if (options.step12Document && typeof options.step12Document === "object") {
    const step12Document = parseStep12Document(options.step12Document);
    const candidateDoc = buildConceptCandidatesFromStep12(step12Document, {
      step13Mode: "13b",
      enableLegacyEnrichment: false,
      enableRecoverySynthesis: false,
    });
    if (candidateDoc && candidateDoc._diagnostics) delete candidateDoc._diagnostics;
    return mapCandidateDocToConceptsDocument(candidateDoc, options, { step12Document });
  }

  if (typeof options.step12Path === "string" && options.step12Path.length > 0) {
    const step12Document = parseStep12Document(YAML.parse(fs.readFileSync(options.step12Path, "utf8")));
    const candidateDoc = buildConceptCandidatesFromStep12(step12Document, {
      step13Mode: "13b",
      enableLegacyEnrichment: false,
      enableRecoverySynthesis: false,
    });
    if (candidateDoc && candidateDoc._diagnostics) delete candidateDoc._diagnostics;
    return mapCandidateDocToConceptsDocument(candidateDoc, options, { step12Document });
  }

  if (typeof options.seedId === "string" && options.seedId.length > 0) {
    const seedText = loadSeedText(options.seedId, options);
    return runDefaultExtendedExtractionFromText(seedText, options);
  }

  if (typeof text !== "string" || text.length === 0) {
    throw new Error("extractConcepts requires non-empty text when no Step12 source is provided.");
  }
  return runDefaultExtendedExtractionFromText(text, options);
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
  unprocessable,
};
