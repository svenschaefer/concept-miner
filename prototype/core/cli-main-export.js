function buildCliMainExports(baseExports) {
  const {
    ROLE_KEYS,
    TOP_LEVEL_KEYS,
    CANDIDATE_KEYS,
    CANDIDATE_KEYS_WITH_WIKIPEDIA_TITLE_INDEX_EVIDENCE,
    COUNT_KEY_RE,
    canonicalizeSurface,
    conceptIdFromCanonical,
    buildConceptCandidatesFromStep12,
    validateConceptCandidatesDeterminism,
    validateSchema,
    serializeDeterministicYaml,
    generateForSeed,
    generateForStep12Path,
  } = baseExports;

  return {
    ROLE_KEYS,
    TOP_LEVEL_KEYS,
    CANDIDATE_KEYS,
    CANDIDATE_KEYS_WITH_WIKIPEDIA_TITLE_INDEX_EVIDENCE,
    COUNT_KEY_RE,
    canonicalizeSurface,
    conceptIdFromCanonical,
    buildConceptCandidatesFromStep12,
    validateConceptCandidatesDeterminism,
    validateSchema,
    serializeDeterministicYaml,
    generateForSeed,
    generateForStep12Path,
  };
}

module.exports = {
  buildCliMainExports,
};
