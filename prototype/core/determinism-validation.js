function validateDeterministicCandidateRecord({
  candidate,
  index,
  prevCanonical,
  idMap,
  compareStrings,
  assert,
  conceptIdFromCanonical,
  CANDIDATE_KEYS,
  CANDIDATE_KEYS_WITH_WIKIPEDIA_TITLE_INDEX_EVIDENCE,
  ROLE_KEYS,
  WIKIPEDIA_SIGNAL_KEY_RE,
  COUNT_KEY_RE,
}) {
  const c = candidate;
  const expectedKeys = c && Object.prototype.hasOwnProperty.call(c, "wikipedia_title_index_evidence")
    ? CANDIDATE_KEYS_WITH_WIKIPEDIA_TITLE_INDEX_EVIDENCE
    : CANDIDATE_KEYS;
  assert(JSON.stringify(Object.keys(c)) === JSON.stringify(expectedKeys), `Candidate ${index} key order mismatch.`);
  assert(typeof c.canonical === "string" && c.canonical.length > 0, `Candidate ${index} canonical missing.`);
  if (prevCanonical !== null && compareStrings(prevCanonical, c.canonical) > 0) {
    throw new Error(`Candidates not sorted by canonical at index ${index}.`);
  }

  const recomputed = conceptIdFromCanonical(c.canonical);
  assert(c.concept_id === recomputed, `Candidate ${index} concept_id mismatch for canonical ${c.canonical}.`);

  const existing = idMap.get(c.concept_id);
  if (existing && existing !== c.canonical) {
    throw new Error(`Collision in output: ${c.concept_id} maps to multiple canonicals.`);
  }
  idMap.set(c.concept_id, c.canonical);

  for (const field of ["surfaces", "mention_ids", "assertion_ids"]) {
    assert(Array.isArray(c[field]), `Candidate ${c.canonical} ${field} must be array.`);
    for (let j = 1; j < c[field].length; j += 1) {
      if (compareStrings(c[field][j - 1], c[field][j]) > 0) {
        throw new Error(`Candidate ${c.canonical} ${field} must be sorted.`);
      }
    }
  }

  assert(c.roles && typeof c.roles === "object" && !Array.isArray(c.roles), `Candidate ${c.canonical} roles must be object.`);
  assert(JSON.stringify(Object.keys(c.roles)) === JSON.stringify(ROLE_KEYS), `Candidate ${c.canonical} role keys mismatch.`);
  for (const k of ROLE_KEYS) {
    assert(Number.isInteger(c.roles[k]) && c.roles[k] >= 0, `Candidate ${c.canonical} roles.${k} must be non-negative integer.`);
  }

  assert(
    c.wikipedia_title_index &&
    typeof c.wikipedia_title_index === "object" &&
    !Array.isArray(c.wikipedia_title_index),
    `Candidate ${c.canonical} wikipedia_title_index must be object.`
  );
  const wikipediaSignalKeys = Object.keys(c.wikipedia_title_index);
  for (let j = 1; j < wikipediaSignalKeys.length; j += 1) {
    if (compareStrings(wikipediaSignalKeys[j - 1], wikipediaSignalKeys[j]) > 0) {
      throw new Error(`Candidate ${c.canonical} wikipedia_title_index keys must be sorted.`);
    }
  }
  for (const key of wikipediaSignalKeys) {
    assert(WIKIPEDIA_SIGNAL_KEY_RE.test(key), `Candidate ${c.canonical} has invalid wikipedia_title_index key: ${key}`);
    const value = c.wikipedia_title_index[key];
    if (COUNT_KEY_RE.test(key)) {
      assert(Number.isInteger(value) && value >= 0, `Candidate ${c.canonical} wikipedia_title_index.${key} must be non-negative integer.`);
    } else {
      assert(typeof value === "boolean", `Candidate ${c.canonical} wikipedia_title_index.${key} must be boolean.`);
    }
  }
  if (Object.prototype.hasOwnProperty.call(c, "wikipedia_title_index_evidence")) {
    assert(
      c.wikipedia_title_index_evidence &&
      typeof c.wikipedia_title_index_evidence === "object" &&
      !Array.isArray(c.wikipedia_title_index_evidence),
      `Candidate ${c.canonical} wikipedia_title_index_evidence must be object.`
    );
    assert(
      typeof c.wikipedia_title_index_evidence.wikipedia_title_index_policy === "string" &&
      c.wikipedia_title_index_evidence.wikipedia_title_index_policy.length > 0,
      `Candidate ${c.canonical} wikipedia_title_index_evidence.wikipedia_title_index_policy must be non-empty string.`
    );
    assert(
      Array.isArray(c.wikipedia_title_index_evidence.mention_contributions),
      `Candidate ${c.canonical} wikipedia_title_index_evidence.mention_contributions must be array.`
    );
    let prevMention = null;
    for (const mc of c.wikipedia_title_index_evidence.mention_contributions) {
      assert(mc && typeof mc === "object" && !Array.isArray(mc), `Candidate ${c.canonical} mention contribution must be object.`);
      assert(typeof mc.mention_id === "string" && mc.mention_id.length > 0, `Candidate ${c.canonical} mention contribution mention_id invalid.`);
      if (prevMention !== null && compareStrings(prevMention, mc.mention_id) > 0) {
        throw new Error(`Candidate ${c.canonical} wikipedia_title_index_evidence mention_contributions must be sorted by mention_id.`);
      }
      prevMention = mc.mention_id;
      for (const field of ["assertion_signals", "lexicon_signals", "selected_signals"]) {
        assert(mc[field] && typeof mc[field] === "object" && !Array.isArray(mc[field]), `Candidate ${c.canonical} ${field} must be object.`);
        const keys = Object.keys(mc[field]);
        for (let j = 1; j < keys.length; j += 1) {
          if (compareStrings(keys[j - 1], keys[j]) > 0) {
            throw new Error(`Candidate ${c.canonical} ${field} keys must be sorted.`);
          }
        }
        for (const k of keys) {
          assert(WIKIPEDIA_SIGNAL_KEY_RE.test(k), `Candidate ${c.canonical} has invalid ${field} key: ${k}`);
          const v = mc[field][k];
          if (COUNT_KEY_RE.test(k)) {
            assert(Number.isInteger(v) && v >= 0, `Candidate ${c.canonical} ${field}.${k} must be non-negative integer.`);
          } else {
            assert(typeof v === "boolean", `Candidate ${c.canonical} ${field}.${k} must be boolean.`);
          }
        }
      }
    }
  }
  return c.canonical;
}

module.exports = {
  validateDeterministicCandidateRecord,
};
