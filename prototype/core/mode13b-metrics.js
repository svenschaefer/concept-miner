const { assert, roundFixed3 } = require("./shared-utils");
const { isNominalTag } = require("./alias-morphology");
const { selectMentionEvidenceByPolicy } = require("./options-policy");
const { mentionTokensInOrder } = require("./mention-selection");

function hasEnumeratedVerbHost(mention, mentions, tokenById) {
  const span = mention && mention.span;
  if (!span || !Number.isInteger(span.start) || !Number.isInteger(span.end)) return false;
  const segmentId = String((mention && mention.segment_id) || "");
  for (const host of mentions) {
    if (!host || host.id === mention.id) continue;
    const hostKind = String(host.kind || "");
    if (hostKind !== "chunk" && hostKind !== "mwe") continue;
    const hostSpan = host.span || {};
    if (!Number.isInteger(hostSpan.start) || !Number.isInteger(hostSpan.end)) continue;
    const hostSegmentId = String((host && host.segment_id) || "");
    if (segmentId && hostSegmentId && segmentId !== hostSegmentId) continue;
    if (!(hostSpan.start <= span.start && hostSpan.end >= span.end)) continue;
    const hostTokens = mentionTokensInOrder(host, tokenById);
    let finiteVerbCount = 0;
    for (const t of hostTokens) {
      const tag = String(((t.pos || {}).tag) || "");
      if (tag === "VB" || tag === "VBP" || tag === "VBZ" || tag === "VBD") {
        finiteVerbCount += 1;
      }
    }
    if (finiteVerbCount >= 2) return true;
  }
  return false;
}

function buildMentionToCanonicals(byCanonical) {
  const mentionToCanonicals = new Map();
  for (const [canonical, item] of byCanonical.entries()) {
    for (const mentionId of item.mention_ids) {
      const key = String(mentionId || "");
      if (!mentionToCanonicals.has(key)) mentionToCanonicals.set(key, new Set());
      mentionToCanonicals.get(key).add(canonical);
    }
  }
  return mentionToCanonicals;
}

function buildMentionSpanById(mentions) {
  const mentionSpanById = new Map();
  for (const mention of mentions) {
    if (!mention || typeof mention.id !== "string") continue;
    const span = mention.span || {};
    if (!Number.isInteger(span.start) || !Number.isInteger(span.end)) continue;
    mentionSpanById.set(mention.id, { start: span.start, end: span.end, length: span.end - span.start });
  }
  return mentionSpanById;
}

function buildContainingMentionIdsByMentionId(mentions, mentionSpanById) {
  const containingMentionIdsByMentionId = new Map();
  for (const mention of mentions) {
    if (!mention || typeof mention.id !== "string") continue;
    const span = mentionSpanById.get(mention.id);
    if (!span) continue;
    const segmentId = String((mention.segment_id) || "");
    const hosts = [];
    for (const host of mentions) {
      if (!host || typeof host.id !== "string" || host.id === mention.id) continue;
      const hostSpan = mentionSpanById.get(host.id);
      if (!hostSpan) continue;
      const hostSegmentId = String((host.segment_id) || "");
      if (segmentId && hostSegmentId && segmentId !== hostSegmentId) continue;
      if (hostSpan.start <= span.start && hostSpan.end >= span.end) {
        hosts.push(host.id);
      }
    }
    containingMentionIdsByMentionId.set(mention.id, hosts);
  }
  return containingMentionIdsByMentionId;
}

function buildMode13bCandidateMetrics({
  byCanonical,
  mentionById,
  tokenById,
  getMentionLiftInfo,
  mentionWikipediaTitleIndex,
  mentionLexiconWikipediaTitleIndex,
  wikipediaCountKeys,
  policy,
}) {
  const candidateMetrics = new Map();
  for (const [canonical, item] of byCanonical.entries()) {
    const mentionIds = Array.from(item.mention_ids).map((v) => String(v));
    const assertionIds = Array.from(item.assertion_ids).map((v) => String(v));
    const roles = item.roles || {};
    const roleTotal =
      (roles.actor || 0) +
      (roles.theme || 0) +
      (roles.attr || 0) +
      (roles.topic || 0) +
      (roles.location || 0) +
      (roles.other || 0);

    let wtiTotal = 0;
    let nonNominalCount = 0;
    let participialFragmentCount = 0;
    let participialChunkReductionCount = 0;
    let twoTokenParticipialLiftCount = 0;
    let shortSymbolicTokenCount = 0;
    let punctuatedSurfaceCount = 0;
    for (const mentionId of mentionIds) {
      const mention = mentionById.get(mentionId) || {};
      const head = tokenById.get(String(mention.head_token_id || "")) || {};
      const tag = String(((head.pos || {}).tag) || "");
      const coarse = String(((head.pos || {}).coarse) || "");
      const nominalHead = isNominalTag(tag) || coarse === "NOUN" || coarse === "PROPN" || coarse === "ADJ";
      if (!nominalHead) nonNominalCount += 1;
      const tokenCount = Array.isArray(mention.token_ids) ? mention.token_ids.length : 0;
      const sourceKind = String((((mention.provenance || {}).source_kind) || ""));
      const participialTag = tag === "VBN" || tag === "VBG" || tag === "VBD";
      if (tokenCount === 1 && participialTag && (sourceKind === "token_fallback" || sourceKind === "token_shadow")) {
        participialFragmentCount += 1;
      }
      const info = getMentionLiftInfo(mentionId) || {};
      const rawParts = String(info.normalizedRawSurface || "").split(/\s+/).filter(Boolean).length;
      const liftedParts = String(info.liftedSurface || "").split(/\s+/).filter(Boolean).length;
      const isChunkLike = String(mention.kind || "") === "chunk" || String(mention.kind || "") === "mwe";
      if (isChunkLike && participialTag && rawParts >= 2 && liftedParts === 1) {
        participialChunkReductionCount += 1;
      }
      if (liftedParts === 2) {
        const ordered = mentionTokensInOrder(mention, tokenById);
        const firstLift = String((info.liftedSurface || "").split(/\s+/)[0] || "").toLowerCase();
        let firstLiftToken = ordered.find((t) => {
          const tok = String(t.normalized || t.surface || "").toLowerCase();
          return tok === firstLift;
        });
        if (!firstLiftToken) firstLiftToken = ordered[0] || {};
        const firstLiftTag = String((((firstLiftToken.pos || {}).tag) || ""));
        const firstLiftCoarse = String((((firstLiftToken.pos || {}).coarse) || ""));
        const headTag = String(((head.pos || {}).tag) || "");
        const isGerundLead =
          (firstLiftTag === "VBG" && firstLiftCoarse === "VERB") ||
          headTag === "VBG";
        if (isGerundLead) {
          twoTokenParticipialLiftCount += 1;
        }
      }
      if (
        tokenCount === 1 &&
        (sourceKind === "token_fallback" || sourceKind === "token_shadow") &&
        String(canonical || "").length <= 3 &&
        String(canonical || "").includes("_")
      ) {
        shortSymbolicTokenCount += 1;
      }
      if (tokenCount === 1) {
        const rawSurface = String(info.normalizedRawSurface || "");
        if (/[^a-z0-9 ]/.test(rawSurface)) {
          punctuatedSurfaceCount += 1;
        }
      }

      const assertionEvidence = mentionWikipediaTitleIndex.get(mentionId) || null;
      const lexiconEvidence = mentionLexiconWikipediaTitleIndex.get(mentionId) || null;
      const selected = selectMentionEvidenceByPolicy(assertionEvidence, lexiconEvidence, policy);
      for (const key of wikipediaCountKeys) {
        const value = selected[key];
        if (value !== undefined) {
          assert(Number.isInteger(value), `Non-integer value for ${key} on mention ${mentionId}.`);
          wtiTotal += value;
        }
      }
    }
    const mentionCount = mentionIds.length;
    const avgWti = mentionCount > 0 ? (wtiTotal / mentionCount) : 0;
    const nonNominalShare = mentionCount > 0 ? (nonNominalCount / mentionCount) : 0;
    const participialFragmentShare = mentionCount > 0 ? (participialFragmentCount / mentionCount) : 0;
    const participialChunkReductionShare = mentionCount > 0 ? (participialChunkReductionCount / mentionCount) : 0;
    const twoTokenParticipialLiftShare = mentionCount > 0 ? (twoTokenParticipialLiftCount / mentionCount) : 0;
    const shortSymbolicTokenShare = mentionCount > 0 ? (shortSymbolicTokenCount / mentionCount) : 0;
    const punctuatedSurfaceShare = mentionCount > 0 ? (punctuatedSurfaceCount / mentionCount) : 0;
    const coreRoleTotal = (roles.actor || 0) + (roles.theme || 0) + (roles.attr || 0) + (roles.topic || 0) + (roles.location || 0);
    candidateMetrics.set(canonical, {
      roleTotal,
      coreRoleTotal,
      assertionCount: assertionIds.length,
      mentionCount,
      avgWti,
      nonNominalShare,
      participialFragmentShare,
      participialChunkReductionShare,
      twoTokenParticipialLiftShare,
      shortSymbolicTokenShare,
      punctuatedSurfaceShare,
    });
  }
  return candidateMetrics;
}

module.exports = {
  hasEnumeratedVerbHost,
  buildMentionToCanonicals,
  buildMentionSpanById,
  buildContainingMentionIdsByMentionId,
  buildMode13bCandidateMetrics,
};
