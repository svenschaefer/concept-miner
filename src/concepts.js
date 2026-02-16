const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const Ajv2020 = require("ajv/dist/2020");

function loadPrototype() {
  try {
    return require("../prototype/concept-candidates");
  } catch (err) {
    const message = err && err.message ? err.message : String(err);
    throw new Error(`Prototype runtime is unavailable in this environment: ${message}`);
  }
}

function canonicalizeToken(value) {
  return String(value || "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function conceptIdFromName(name) {
  return `c_${crypto.createHash("sha256").update(Buffer.from(name, "utf8")).digest("hex").slice(0, 12)}`;
}

function normalizeModeValue(mode) {
  if (mode === "generic_baseline" || mode === "generic-baseline") {
    return "generic_baseline";
  }
  if (mode === "default_extended" || mode === "default-extended") {
    return "default_extended";
  }
  return "default_extended";
}

function toProductMode(options = {}) {
  return normalizeModeValue(options.mode);
}

function toPrototypeOptions(options = {}) {
  const mode = toProductMode(options);
  return {
    step13Mode: mode === "generic_baseline" ? "13a" : "13b",
    wikipediaTitleIndexPolicy: options.wikipediaTitleIndexPolicy || "assertion_then_lexicon_fallback",
    collectDiagnostics: options.includeDiagnostics === true,
    emitWikipediaTitleIndexEvidence: options.emitWikipediaTitleIndexEvidence !== false,
    mode13bVerbPromotionMinWti: options.mode13bVerbPromotionMinWikipediaCount,
    mode13bUnlinkedFiniteVerbPromotionMinWti: options.mode13bUnlinkedFiniteVerbPromotionMinWikipediaCount,
    mode13bLowWtiUnlinkedMinAvg: options.mode13bLowWikipediaCountUnlinkedMinAvg,
    mode13bNonnominalShareMin: options.mode13bNonnominalShareMin,
    mode13bNonnominalWeakWtiMax: options.mode13bNonnominalWeakWikipediaCountMax,
    mode13bMergeHostMinWtiRatio: options.mode13bMergeHostMinWikipediaCountRatio,
    enableSupplemental: options.enableSupplemental,
    enableAliasSynthesis: options.enableAliasSynthesis,
    enableLegacyEnrichment: options.enableLegacyEnrichment,
    enableRecoverySynthesis: options.enableRecoverySynthesis,
    artifactsRoot: options.artifactsRoot,
    wikipediaTitleIndexEndpoint: options.wikipediaTitleIndexEndpoint,
    wikipediaTitleIndexTimeoutMs: options.wikipediaTitleIndexTimeoutMs,
    timeoutMs: options.timeoutMs,
  };
}

function mapCandidateDocToConceptsDocument(candidateDoc, options = {}, diagnostics = null) {
  const concepts = (candidateDoc.concept_candidates || []).map((candidate) => ({
    id: candidate.concept_id,
    name: candidate.canonical,
    surface_forms: Array.isArray(candidate.surfaces) ? candidate.surfaces : [],
  }));

  const out = {
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
  if (typeof options.inputId === "string" && options.inputId.length > 0) {
    out.input_id = options.inputId;
  }
  if (options.includeDiagnostics === true && diagnostics) {
    out.diagnostics = diagnostics;
  }
  return out;
}

function runFallbackExtraction(text, options = {}) {
  const byName = new Map();
  const sourceText = String(text || "");
  for (const match of sourceText.matchAll(/[A-Za-z0-9]+/g)) {
    const token = canonicalizeToken(match[0]);
    if (!token) continue;
    if (!byName.has(token)) {
      byName.set(token, {
        id: conceptIdFromName(token),
        name: token,
        surface_forms: [],
        occurrences: [],
      });
    }
    const entry = byName.get(token);
    entry.surface_forms.push(match[0]);
    if (options.includeEvidence === true) {
      entry.occurrences.push({
        start: match.index,
        end: match.index + String(match[0]).length,
        text: String(match[0]),
        source: "token",
      });
    }
  }

  const concepts = Array.from(byName.values())
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((entry) => ({
      id: entry.id,
      name: entry.name,
      surface_forms: Array.from(new Set(entry.surface_forms)),
      ...(options.includeEvidence === true ? { occurrences: entry.occurrences } : {}),
    }));

  const out = {
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
  if (typeof options.inputId === "string" && options.inputId.length > 0) {
    out.input_id = options.inputId;
  }
  return out;
}

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
  function pushInvariantError(errors, pathValue, message, params = {}) {
    errors.push({
      message,
      path: pathValue,
      keyword: "invariant",
      params,
    });
  }

  function enforceConceptInvariants(doc, errors) {
    if (!doc || typeof doc !== "object" || !Array.isArray(doc.concepts)) return;

    const seenIds = new Set();
    const seenNames = new Set();

    for (let i = 0; i < doc.concepts.length; i += 1) {
      const concept = doc.concepts[i];
      const id = typeof concept?.id === "string" ? concept.id : "";
      const name = typeof concept?.name === "string" ? concept.name : "";

      if (id) {
        if (seenIds.has(id)) {
          pushInvariantError(errors, `/concepts/${i}/id`, `Duplicate concept id: ${id}`, { duplicate: id });
        } else {
          seenIds.add(id);
        }
      }

      if (name) {
        if (seenNames.has(name)) {
          pushInvariantError(errors, `/concepts/${i}/name`, `Duplicate concept name: ${name}`, { duplicate: name });
        } else {
          seenNames.add(name);
        }
      }

      if (!Array.isArray(concept?.occurrences)) continue;
      for (let j = 0; j < concept.occurrences.length; j += 1) {
        const occurrence = concept.occurrences[j];
        if (!Number.isInteger(occurrence?.start) || !Number.isInteger(occurrence?.end)) continue;
        if (occurrence.end < occurrence.start) {
          pushInvariantError(
            errors,
            `/concepts/${i}/occurrences/${j}/end`,
            "Occurrence end must be greater than or equal to start.",
            { start: occurrence.start, end: occurrence.end }
          );
        }
      }
    }
  }

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
