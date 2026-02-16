const { compareStrings, assert } = require("./shared-utils");
const { walkWikipediaSignalFields, mergeWikipediaSignalValue } = require("./wikipedia-signals");

function collectUnionWikipediaSignalKeys(step12) {
  const keySet = new Set();
  const assertions = Array.isArray(step12.assertions) ? step12.assertions : [];

  for (let ai = 0; ai < assertions.length; ai += 1) {
    const assertion = assertions[ai] || {};
    const mentionEvidence = ((((assertion.evidence || {}).wiki_signals || {}).mention_evidence) || []);
    for (let mi = 0; mi < mentionEvidence.length; mi += 1) {
      const entry = mentionEvidence[mi] || {};
      walkWikipediaSignalFields(entry.evidence, (k) => keySet.add(k), `assertions[${ai}].evidence.wiki_signals.mention_evidence[${mi}].evidence`);
    }
  }

  walkWikipediaSignalFields(step12.wiki_title_evidence, (k) => keySet.add(k), "wiki_title_evidence");

  assert(keySet.size > 0, "Wikipedia title index signal union is empty; at least one upstream wiki_* key is required.");
  return Array.from(keySet).sort(compareStrings);
}

function buildMentionWikipediaTitleIndexMap(step12) {
  const mentionWikipediaTitleIndex = new Map();
  const assertions = Array.isArray(step12.assertions) ? step12.assertions : [];

  for (let ai = 0; ai < assertions.length; ai += 1) {
    const assertion = assertions[ai] || {};
    const mentionEvidence = ((((assertion.evidence || {}).wiki_signals || {}).mention_evidence) || []);
    for (let mi = 0; mi < mentionEvidence.length; mi += 1) {
      const entry = mentionEvidence[mi] || {};
      const mentionId = String(entry.mention_id || "");
      if (!mentionId) continue;
      if (!mentionWikipediaTitleIndex.has(mentionId)) mentionWikipediaTitleIndex.set(mentionId, Object.create(null));
      const bucket = mentionWikipediaTitleIndex.get(mentionId);
      walkWikipediaSignalFields(
        entry.evidence,
        (k, v) => {
          mergeWikipediaSignalValue(bucket, k, v);
        },
        `assertions[${ai}].evidence.wiki_signals.mention_evidence[${mi}].evidence`
      );
    }
  }

  return mentionWikipediaTitleIndex;
}

function buildMentionLexiconWikipediaTitleIndexMap(step12) {
  const mentionWikipediaTitleIndex = new Map();
  const mentions = Array.isArray(step12.mentions) ? step12.mentions : [];
  for (let mi = 0; mi < mentions.length; mi += 1) {
    const mention = mentions[mi] || {};
    const mentionId = String(mention.id || "");
    if (!mentionId) continue;
    const evidence = (((mention.provenance || {}).lexicon_evidence) || null);
    if (!evidence) continue;
    const bucket = Object.create(null);
    walkWikipediaSignalFields(
      evidence,
      (k, v) => {
        mergeWikipediaSignalValue(bucket, k, v);
      },
      `mentions[${mi}].provenance.lexicon_evidence`
    );
    if (Object.keys(bucket).length > 0) {
      mentionWikipediaTitleIndex.set(mentionId, bucket);
    }
  }
  return mentionWikipediaTitleIndex;
}

module.exports = {
  collectUnionWikipediaSignalKeys,
  buildMentionWikipediaTitleIndexMap,
  buildMentionLexiconWikipediaTitleIndexMap,
};
