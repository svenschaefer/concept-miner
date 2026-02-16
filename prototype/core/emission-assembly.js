function materializeWikipediaTitleIndexForCandidate({
  mentionIds,
  wikipediaSignalKeys,
  COUNT_KEY_RE,
  mentionWikipediaTitleIndex,
  mentionLexiconWikipediaTitleIndex,
  policy,
  ensureWikipediaSignalScalar,
  mergeWikipediaSignalValue,
  emitWikipediaTitleIndexEvidence,
  orderedSparseWikipediaSignalObject,
}) {
  const wikipediaTitleIndex = Object.create(null);
  for (const key of wikipediaSignalKeys) {
    wikipediaTitleIndex[key] = COUNT_KEY_RE.test(key) ? 0 : false;
  }

  const mentionContrib = [];
  for (const mentionId of mentionIds) {
    const assertionEvidence = mentionWikipediaTitleIndex.get(mentionId) || null;
    const lexiconEvidence = mentionLexiconWikipediaTitleIndex.get(mentionId) || null;
    let evidence = {};
    if (policy === "assertion_only") {
      evidence = assertionEvidence || {};
    } else {
      evidence = assertionEvidence || lexiconEvidence || {};
    }
    for (const key of wikipediaSignalKeys) {
      const value = evidence[key];
      if (value !== undefined) {
        ensureWikipediaSignalScalar(key, value, `selected_signals.${mentionId}.${key}`);
        mergeWikipediaSignalValue(wikipediaTitleIndex, key, value);
      }
    }
    if (emitWikipediaTitleIndexEvidence) {
      let source = "none";
      if (assertionEvidence && lexiconEvidence) source = "assertion_and_lexicon";
      else if (assertionEvidence) source = "assertion";
      else if (lexiconEvidence) source = "lexicon_fallback";
      mentionContrib.push({
        mention_id: mentionId,
        source,
        assertion_signals: orderedSparseWikipediaSignalObject(assertionEvidence || {}),
        lexicon_signals: orderedSparseWikipediaSignalObject(lexiconEvidence || {}),
        selected_signals: orderedSparseWikipediaSignalObject(evidence || {}),
      });
    }
  }

  return { wikipediaTitleIndex, mentionContrib };
}

function buildCandidateRecord({
  conceptId,
  candidate,
  surfaces,
  mentionIds,
  assertionIds,
  wikipediaSignalKeys,
  wikipediaTitleIndex,
  emitWikipediaTitleIndexEvidence,
  policy,
  mentionContrib,
}) {
  const roles = {
    actor: candidate.roles.actor,
    theme: candidate.roles.theme,
    attr: candidate.roles.attr,
    topic: candidate.roles.topic,
    location: candidate.roles.location,
    other: candidate.roles.other,
  };
  const orderedWikipediaTitleIndex = Object.create(null);
  for (const k of wikipediaSignalKeys) orderedWikipediaTitleIndex[k] = wikipediaTitleIndex[k];

  const record = {
    concept_id: conceptId,
    canonical: candidate.canonical,
    surfaces,
    mention_ids: mentionIds,
    assertion_ids: assertionIds,
    roles,
    wikipedia_title_index: orderedWikipediaTitleIndex,
  };
  if (emitWikipediaTitleIndexEvidence) {
    record.wikipedia_title_index_evidence = {
      wikipedia_title_index_policy: policy,
      mention_contributions: mentionContrib,
    };
  }
  return record;
}

module.exports = {
  materializeWikipediaTitleIndexForCandidate,
  buildCandidateRecord,
};
