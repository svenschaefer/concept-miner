function applyAliasSynthesis({
  byCanonical,
  markSource,
  singularizeCanonical,
  shouldRejectAliasCanonical,
  ensureCandidate,
  mergeCandidateIntoTarget,
  enableLegacyEnrichment,
}) {
  for (const canonical of Array.from(byCanonical.keys())) {
    const singular = singularizeCanonical(canonical);
    if (!singular || singular === canonical) continue;
    const source = byCanonical.get(canonical);
    if (!source) continue;
    const target = ensureCandidate(byCanonical, singular);
    mergeCandidateIntoTarget(target, source);
    markSource(singular, "alias");
  }

  const mergeIntoCanonical = (targetCanonical, sourceCanonicals) => {
    const t = String(targetCanonical || "");
    if (!t) return;
    if (shouldRejectAliasCanonical(t)) return;
    const target = ensureCandidate(byCanonical, t);
    for (const sourceCanonical of sourceCanonicals || []) {
      const source = byCanonical.get(String(sourceCanonical || ""));
      if (!source) continue;
      mergeCandidateIntoTarget(target, source);
    }
    markSource(t, "alias");
  };

  for (const canonical of Array.from(byCanonical.keys())) {
    const parts = canonical.split("_").filter(Boolean);
    if (parts.length >= 3) {
      const tail2 = `${parts[parts.length - 2]}_${parts[parts.length - 1]}`;
      mergeIntoCanonical(tail2, [canonical]);
    }
    if (parts.length >= 2) {
      const tail1 = `${parts[parts.length - 1]}`;
      mergeIntoCanonical(tail1, [canonical]);
    }
    if (enableLegacyEnrichment && parts.length >= 2 && parts[0] === "abac") {
      mergeIntoCanonical("abac", [canonical]);
    }
  }
}

module.exports = {
  applyAliasSynthesis,
};
