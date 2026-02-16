function buildDiagnosticsDocument(sourceByCanonical, mode13bByCanonical, stats, compareStrings) {
  const diagnostics = {
    source_by_canonical: Object.create(null),
    mode13b_by_canonical: Object.create(null),
    stats,
  };
  for (const canonical of Array.from(sourceByCanonical.keys()).sort(compareStrings)) {
    diagnostics.source_by_canonical[canonical] = Array.from(sourceByCanonical.get(canonical)).filter(Boolean).sort(compareStrings);
  }
  for (const canonical of Array.from(mode13bByCanonical.keys()).sort(compareStrings)) {
    const entry = mode13bByCanonical.get(canonical) || {};
    diagnostics.mode13b_by_canonical[canonical] = {
      policy_hits: Array.from(entry.policy_hits || []).filter(Boolean).sort(compareStrings),
      metrics: entry.metrics || {
        role_total: 0,
        assertion_count: 0,
        mention_count: 0,
        avg_wikipedia_count: 0,
        non_nominal_share: 0,
      },
    };
  }
  return diagnostics;
}

module.exports = {
  buildDiagnosticsDocument,
};
