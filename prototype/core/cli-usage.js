function buildUsageText() {
  return [
    "Usage:",
    "  Runtime mode:",
    "    node concept-candidates.js --seed-id <id> [--artifacts-root <path>] [--out <path>]",
    "      [--wikipedia-title-index-endpoint <url>] [--timeout-ms <ms>] [--wikipedia-title-index-timeout-ms <ms>]",
    "      [--wti-endpoint <url>] [--wti-timeout-ms <ms>]  # backward-compatible aliases",
    "  Persisted mode:",
    "    node concept-candidates.js --step12-in <path> [--out <path>]",
    "  Shared flags:",
    "      [--step13-mode <13a|13b>]",
    "      [--mode13b-verb-promotion-min-wikipedia-count <number>]",
    "      [--mode13b-unlinked-finite-verb-promotion-min-wikipedia-count <number>]",
    "      [--mode13b-low-wikipedia-count-unlinked-min-avg <number>]",
    "      [--mode13b-nonnominal-share-min <number>]",
    "      [--mode13b-nonnominal-weak-wikipedia-count-max <number>]",
    "      [--mode13b-merge-host-min-wikipedia-count-ratio <number>]",
    "      [--mode13b-verb-promotion-min-wti <number>]  # backward-compatible alias",
    "      [--mode13b-unlinked-finite-verb-promotion-min-wti <number>]  # backward-compatible alias",
    "      [--mode13b-low-wti-unlinked-min-avg <number>]  # backward-compatible alias",
    "      [--mode13b-nonnominal-weak-wti-max <number>]  # backward-compatible alias",
    "      [--mode13b-merge-host-min-wti-ratio <number>]  # backward-compatible alias",
    "      [--wikipedia-title-index-policy <assertion_then_lexicon_fallback|assertion_only>]",
    "      [--wti-policy <assertion_then_lexicon_fallback|assertion_only>]  # backward-compatible alias",
    "      [--disable-supplemental] [--disable-alias-synthesis] [--enable-legacy-enrichment] [--enable-recovery-synthesis]",
    "      [--no-emit-wikipedia-title-index-evidence]",
    "      [--no-emit-wti-evidence]  # backward-compatible alias",
    "      [--diag-out <path>] [--meta-out <path>] [--print]",
  ].join("\n");
}

module.exports = {
  buildUsageText,
};
