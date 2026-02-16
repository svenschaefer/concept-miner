const { normalizeModeValue } = require("./mode");

function loadPrototype() {
  try {
    return require("../../prototype/concept-candidates");
  } catch (err) {
    const message = err && err.message ? err.message : String(err);
    throw new Error(`Prototype runtime is unavailable in this environment: ${message}`);
  }
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

module.exports = {
  loadPrototype,
  toProductMode,
  toPrototypeOptions,
  mapCandidateDocToConceptsDocument,
};
