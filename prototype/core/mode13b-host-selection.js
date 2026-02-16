const { compareStrings, roundFixed3 } = require("./shared-utils");

function allMentionsContainedByStrongerHost({
  canonical,
  item,
  metrics,
  byCanonical,
  candidateMetrics,
  mentionSpanById,
  containingMentionIdsByMentionId,
  mentionToCanonicals,
}) {
  const candidatePartCount = String(canonical).split("_").filter(Boolean).length;
  for (const mentionId of item.mention_ids) {
    const mentionSpan = mentionSpanById.get(String(mentionId || ""));
    const hostMentionIds = containingMentionIdsByMentionId.get(String(mentionId || "")) || [];
    let supported = false;
    for (const hostMentionId of hostMentionIds) {
      const hostSpan = mentionSpanById.get(String(hostMentionId || ""));
      const hostCanonicals = mentionToCanonicals.get(String(hostMentionId || "")) || new Set();
      for (const hostCanonical of hostCanonicals) {
        if (hostCanonical === canonical) continue;
        const hostItem = byCanonical.get(hostCanonical);
        const hostMetrics = candidateMetrics.get(hostCanonical);
        if (!hostItem || !hostMetrics) continue;
        const hostPartCount = String(hostCanonical).split("_").filter(Boolean).length;
        const hostIsBroader =
          hostPartCount > candidatePartCount ||
          (hostSpan && mentionSpan && hostSpan.length > mentionSpan.length);
        const hostIsStronger = hostMetrics.roleTotal > 0 || hostMetrics.avgWti >= metrics.avgWti;
        if (hostIsBroader && hostIsStronger) {
          supported = true;
          break;
        }
      }
      if (supported) break;
    }
    if (!supported) {
      return false;
    }
  }
  return true;
}

function findBestHostCanonicalForMerge({
  canonical,
  item,
  metrics,
  byCanonical,
  candidateMetrics,
  containingMentionIdsByMentionId,
  mentionToCanonicals,
  mode13bMergeHostMinWtiRatio,
}) {
  const candidatePartCount = String(canonical).split("_").filter(Boolean).length;
  let bestHostCanonical = null;
  let bestHostRank = null;
  for (const mentionId of item.mention_ids) {
    const hostMentionIds = containingMentionIdsByMentionId.get(String(mentionId || "")) || [];
    for (const hostMentionId of hostMentionIds) {
      const hostCanonicals = mentionToCanonicals.get(String(hostMentionId || "")) || new Set();
      for (const hostCanonical of hostCanonicals) {
        if (hostCanonical === canonical) continue;
        const hostItem = byCanonical.get(hostCanonical);
        const hostMetrics = candidateMetrics.get(hostCanonical);
        if (!hostItem || !hostMetrics) continue;
        const hostPartCount = String(hostCanonical).split("_").filter(Boolean).length;
        const hostIsBroader = hostPartCount > candidatePartCount;
        if (!hostIsBroader) continue;
        const hostWtiRatio = metrics.avgWti > 0 ? (hostMetrics.avgWti / metrics.avgWti) : Number.POSITIVE_INFINITY;
        if (hostWtiRatio < mode13bMergeHostMinWtiRatio) continue;
        const rank = [
          hostMetrics.roleTotal,
          roundFixed3(hostMetrics.avgWti),
          hostPartCount,
          hostCanonical,
        ];
        if (!bestHostRank) {
          bestHostRank = rank;
          bestHostCanonical = hostCanonical;
          continue;
        }
        if (rank[0] > bestHostRank[0]) {
          bestHostRank = rank;
          bestHostCanonical = hostCanonical;
          continue;
        }
        if (rank[0] === bestHostRank[0] && rank[1] > bestHostRank[1]) {
          bestHostRank = rank;
          bestHostCanonical = hostCanonical;
          continue;
        }
        if (rank[0] === bestHostRank[0] && rank[1] === bestHostRank[1] && rank[2] > bestHostRank[2]) {
          bestHostRank = rank;
          bestHostCanonical = hostCanonical;
          continue;
        }
        if (
          rank[0] === bestHostRank[0] &&
          rank[1] === bestHostRank[1] &&
          rank[2] === bestHostRank[2] &&
          compareStrings(rank[3], bestHostRank[3]) < 0
        ) {
          bestHostRank = rank;
          bestHostCanonical = hostCanonical;
        }
      }
    }
  }
  return bestHostCanonical;
}

module.exports = {
  allMentionsContainedByStrongerHost,
  findBestHostCanonicalForMerge,
};
