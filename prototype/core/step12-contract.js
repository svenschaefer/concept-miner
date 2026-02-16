const { assert, parseSemverMajor } = require("./shared-utils");

function mentionSurfaceFromSpan(mention, canonicalText) {
  const span = mention && mention.span;
  assert(span && Number.isInteger(span.start) && Number.isInteger(span.end), `Mention ${mention && mention.id} has invalid span.`);
  assert(span.start >= 0 && span.end >= span.start, `Mention ${mention && mention.id} span is invalid.`);
  assert(typeof canonicalText === "string", "Step 12 canonical_text missing.");
  return canonicalText.slice(span.start, span.end);
}

function validateStep12Contract(step12) {
  assert(step12 && typeof step12 === "object", "Step 12 document must be an object.");
  assert(step12.stage === "elementary_assertions", `Invalid Step 12 stage: ${String(step12.stage)}`);
  const major = parseSemverMajor(step12.schema_version);
  assert(major !== null, `Step 12 schema_version must be valid SemVer, got: ${String(step12.schema_version)}`);
  assert(major === 1, `Incompatible Step 12 schema major: ${major}; expected 1.`);
  assert(Array.isArray(step12.mentions), "Step 12 mentions[] missing.");
  assert(Array.isArray(step12.assertions), "Step 12 assertions[] missing.");
  assert(typeof step12.canonical_text === "string", "Step 12 canonical_text missing.");
}

function buildMentionIndex(step12) {
  const byId = new Map();
  for (const mention of step12.mentions) {
    assert(mention && typeof mention.id === "string" && mention.id.length > 0, "Step 12 mention missing non-empty id.");
    if (byId.has(mention.id)) {
      throw new Error(`Duplicate mention id in Step 12: ${mention.id}`);
    }
    byId.set(mention.id, mention);
  }
  return byId;
}

function buildTokenIndex(step12) {
  const byId = new Map();
  for (const token of Array.isArray(step12.tokens) ? step12.tokens : []) {
    if (token && typeof token.id === "string" && token.id.length > 0) {
      byId.set(token.id, token);
    }
  }
  return byId;
}

module.exports = {
  mentionSurfaceFromSpan,
  validateStep12Contract,
  buildMentionIndex,
  buildTokenIndex,
};
