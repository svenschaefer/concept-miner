function parseStepMode(value, allowedModes, optionName = "--step13-mode") {
  const mode = String(value || "13b");
  if (!allowedModes.has(mode)) {
    throw new Error(`Invalid ${optionName}: ${mode}`);
  }
  return mode;
}

function parseNonNegativeNumberArg(name, raw, fallback) {
  if (raw === null || raw === undefined || raw === "") return fallback;
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`Invalid ${name}: ${String(raw)}`);
  }
  return value;
}

function selectMentionEvidenceByPolicy(assertionEvidence, lexiconEvidence, policy) {
  if (policy === "assertion_only") return assertionEvidence || {};
  return assertionEvidence || lexiconEvidence || {};
}

module.exports = {
  parseStepMode,
  parseNonNegativeNumberArg,
  selectMentionEvidenceByPolicy,
};
