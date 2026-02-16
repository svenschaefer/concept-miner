const { isNominalTag } = require("./alias-morphology");
const { normalizeLiftedSurface } = require("./canonicalization");
const { mentionSurfaceFromSpan } = require("./step12-contract");
const { mentionTokensInOrder } = require("./mention-selection");

function isEligibleMentionForConcept(mention, tokenById, options = {}) {
  const token = tokenById.get(String((mention && mention.head_token_id) || "")) || {};
  const tag = String(((token.pos || {}).tag) || "");
  const coarse = String(((token.pos || {}).coarse) || "");
  const normalized = String(token.normalized || token.surface || "").toLowerCase();
  const isPunct = Boolean(((token.flags || {}).is_punct));
  const isSpace = Boolean(((token.flags || {}).is_space));
  const tokenCount = Array.isArray(mention && mention.token_ids) ? mention.token_ids.length : 0;
  const legacyNominalVerbWhitelist = options.legacyNominalVerbWhitelist instanceof Set
    ? options.legacyNominalVerbWhitelist
    : new Set();

  if (isPunct || isSpace) return false;
  if (tag === "DT" || tag === "CD" || tag === "CC") return false;
  if (coarse === "PRON" || coarse === "ADV" || coarse === "ADP" || coarse === "X") return false;
  if (coarse === "VERB" && tag !== "VBG") {
    if (!(options.enableLegacyNominalWhitelist === true && legacyNominalVerbWhitelist.has(normalized))) return false;
  }
  if (tokenCount === 1 && (tag === "JJ" || tag === "JJR" || tag === "JJS" || tag === "RB" || tag === "RBR" || tag === "RBS")) return false;
  if (tokenCount === 1 && tag === "VBG" && (normalized === "doing" || normalized === "placing")) return false;
  if (tokenCount === 1 && normalized.endsWith("ly")) return false;
  return true;
}

function shouldLiftMention(mention, canonicalText, tokenById, options = {}) {
  if (isEligibleMentionForConcept(mention, tokenById, options)) return true;
  const kind = String((mention && mention.kind) || "");
  if (kind === "chunk" || kind === "mwe") {
    const raw = normalizeLiftedSurface(mentionSurfaceFromSpan(mention, canonicalText));
    const derived = deriveLiftedSurface(mention, canonicalText, tokenById);
    return Boolean(derived) && derived !== raw;
  }
  return false;
}

function shouldSkipDerivedSingleToken(rawSurface, liftedSurface, mention, tokenById) {
  const rawParts = String(rawSurface || "").trim().split(/\s+/).filter(Boolean);
  const liftedParts = String(liftedSurface || "").trim().split(/\s+/).filter(Boolean);
  if (rawParts.length <= 1 || liftedParts.length !== 1) return false;
  const ordered = mentionTokensInOrder(mention, tokenById);
  const first = ordered[0] || {};
  const firstLower = String(first.normalized || first.surface || "").toLowerCase();
  const firstTag = String(((first.pos || {}).tag) || "");
  if (["IN", "TO", "DT", "CC", "WDT", "MD", "VB", "VBP", "VBZ", "VBD"].includes(firstTag)) return true;
  return ["as", "before", "after", "during", "while", "when", "if", "than", "such", "only", "least"].includes(firstLower);
}

function deriveLiftedSurface(mention, canonicalText, tokenById) {
  const baseSurface = mentionSurfaceFromSpan(mention, canonicalText);
  const ordered = mentionTokensInOrder(mention, tokenById);
  if (ordered.length === 0) {
    return normalizeLiftedSurface(baseSurface);
  }

  const firstTag = String((((ordered[0] || {}).pos || {}).tag) || "");
  const secondTag = String((((ordered[1] || {}).pos || {}).tag) || "");
  const startsNominal = isNominalTag(firstTag) && !(firstTag === "VBG" && secondTag === "DT");

  if (!startsNominal) {
    let right = ordered.length - 1;
    while (right >= 0) {
      const t = ordered[right] || {};
      const tag = String((((t.pos || {}).tag) || ""));
      if (isNominalTag(tag)) break;
      right -= 1;
    }
    if (right >= 0) {
      let left = right;
      while (left > 0) {
        const prev = ordered[left - 1] || {};
        const prevTag = String((((prev.pos || {}).tag) || ""));
        if (!isNominalTag(prevTag)) break;
        left -= 1;
      }
      const start = (((ordered[left] || {}).span || {}).start);
      const end = (((ordered[right] || {}).span || {}).end);
      if (Number.isInteger(start) && Number.isInteger(end) && end >= start) {
        return normalizeLiftedSurface(canonicalText.slice(start, end));
      }
    }
  }

  let result = normalizeLiftedSurface(baseSurface);
  const stopAdp = new Set(["for", "to", "with", "without", "by", "from", "than", "before", "after", "during", "while", "when", "if", "as"]);
  if (ordered.length > 1) {
    for (let i = 1; i < ordered.length; i += 1) {
      const t = ordered[i] || {};
      const tag = String((((t.pos || {}).tag) || ""));
      const lower = String(t.normalized || t.surface || "").toLowerCase();
      if (tag !== "IN" && tag !== "TO") continue;
      if (!stopAdp.has(lower)) continue;
      const start = (((ordered[0] || {}).span || {}).start);
      const end = (((ordered[i - 1] || {}).span || {}).end);
      if (Number.isInteger(start) && Number.isInteger(end) && end >= start) {
        result = normalizeLiftedSurface(canonicalText.slice(start, end));
      }
      break;
    }
  }
  return result;
}

module.exports = {
  isEligibleMentionForConcept,
  shouldLiftMention,
  shouldSkipDerivedSingleToken,
  deriveLiftedSurface,
};
