const { compareStrings } = require("./shared-utils");

function mentionKindRank(kind) {
  const k = String(kind || "");
  if (k === "mwe") return 0;
  if (k === "chunk") return 1;
  if (k === "token") return 2;
  return 3;
}

function mentionSortKeyForSelection(mention) {
  const tokenCount = Array.isArray(mention && mention.token_ids) ? mention.token_ids.length : 0;
  const span = mention && mention.span && Number.isInteger(mention.span.start) && Number.isInteger(mention.span.end)
    ? (mention.span.end - mention.span.start)
    : 0;
  return {
    kindRank: mentionKindRank(mention && mention.kind),
    tokenCount,
    span,
    id: String((mention && mention.id) || ""),
  };
}

function mentionTokensInOrder(mention, tokenById) {
  const ids = Array.isArray(mention && mention.token_ids) ? mention.token_ids : [];
  return ids
    .map((id) => tokenById.get(id))
    .filter(Boolean)
    .sort((a, b) => {
      const ai = Number.isInteger(a.i) ? a.i : 0;
      const bi = Number.isInteger(b.i) ? b.i : 0;
      if (ai !== bi) return ai - bi;
      return compareStrings(String(a.id || ""), String(b.id || ""));
    });
}

function mentionHasFiniteVerbToken(mention, tokenById) {
  const ordered = mentionTokensInOrder(mention, tokenById);
  for (const t of ordered) {
    const tag = String((((t.pos || {}).tag) || ""));
    if (tag === "VB" || tag === "VBD" || tag === "VBP" || tag === "VBZ" || tag === "MD") {
      return true;
    }
  }
  return false;
}

module.exports = {
  mentionKindRank,
  mentionSortKeyForSelection,
  mentionTokensInOrder,
  mentionHasFiniteVerbToken,
};
