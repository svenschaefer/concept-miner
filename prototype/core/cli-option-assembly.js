function parseCliExecutionContext({
  args,
  env,
  arg,
  hasFlag,
  parseStepMode,
  parseNonNegativeNumberArg,
  step13Modes,
  defaultArtifactsRoot,
  defaultWikipediaTitleIndexEndpoint,
}) {
  const seedId = arg(args, "--seed-id");
  const step12In = arg(args, "--step12-in");
  const artifactsRoot = arg(args, "--artifacts-root") || defaultArtifactsRoot;
  const outPathArg = arg(args, "--out");
  const diagOutPathArg = arg(args, "--diag-out");
  const metaOutPathArg = arg(args, "--meta-out");
  const wikipediaTitleIndexEndpoint =
    arg(args, "--wikipedia-title-index-endpoint") ||
    arg(args, "--wti-endpoint") ||
    env.WIKIPEDIA_TITLE_INDEX_ENDPOINT ||
    defaultWikipediaTitleIndexEndpoint;
  const timeoutMsRaw = arg(args, "--timeout-ms");
  const wikipediaTitleIndexTimeoutMsRaw =
    arg(args, "--wikipedia-title-index-timeout-ms") || arg(args, "--wti-timeout-ms");
  const timeoutMs = timeoutMsRaw ? Number(timeoutMsRaw) : 120000;
  const wikipediaTitleIndexTimeoutMs = wikipediaTitleIndexTimeoutMsRaw ? Number(wikipediaTitleIndexTimeoutMsRaw) : 2000;
  const wikipediaTitleIndexPolicy =
    arg(args, "--wikipedia-title-index-policy") || arg(args, "--wti-policy") || "assertion_then_lexicon_fallback";
  const step13Mode = parseStepMode(arg(args, "--step13-mode") || "13b", step13Modes, "--step13-mode");
  const mode13bVerbPromotionMinWti = parseNonNegativeNumberArg(
    "--mode13b-verb-promotion-min-wikipedia-count",
    arg(args, "--mode13b-verb-promotion-min-wikipedia-count") || arg(args, "--mode13b-verb-promotion-min-wti"),
    1.0
  );
  const mode13bUnlinkedFiniteVerbPromotionMinWti = parseNonNegativeNumberArg(
    "--mode13b-unlinked-finite-verb-promotion-min-wikipedia-count",
    arg(args, "--mode13b-unlinked-finite-verb-promotion-min-wikipedia-count")
      || arg(args, "--mode13b-unlinked-finite-verb-promotion-min-wti"),
    80.0
  );
  const mode13bLowWtiUnlinkedMinAvg = parseNonNegativeNumberArg(
    "--mode13b-low-wikipedia-count-unlinked-min-avg",
    arg(args, "--mode13b-low-wikipedia-count-unlinked-min-avg") || arg(args, "--mode13b-low-wti-unlinked-min-avg"),
    0.5
  );
  const mode13bNonnominalShareMin = parseNonNegativeNumberArg(
    "--mode13b-nonnominal-share-min",
    arg(args, "--mode13b-nonnominal-share-min"),
    0.5
  );
  const mode13bNonnominalWeakWtiMax = parseNonNegativeNumberArg(
    "--mode13b-nonnominal-weak-wikipedia-count-max",
    arg(args, "--mode13b-nonnominal-weak-wikipedia-count-max") || arg(args, "--mode13b-nonnominal-weak-wti-max"),
    1.5
  );
  const mode13bMergeHostMinWtiRatio = parseNonNegativeNumberArg(
    "--mode13b-merge-host-min-wikipedia-count-ratio",
    arg(args, "--mode13b-merge-host-min-wikipedia-count-ratio") || arg(args, "--mode13b-merge-host-min-wti-ratio"),
    1.0
  );
  const enableSupplemental = hasFlag(args, "--disable-supplemental") ? false : true;
  const enableAliasSynthesis = hasFlag(args, "--disable-alias-synthesis") ? false : true;
  const enableLegacyEnrichment = hasFlag(args, "--enable-legacy-enrichment");
  const enableRecoverySynthesis = hasFlag(args, "--enable-recovery-synthesis");
  const collectDiagnostics = Boolean(diagOutPathArg);
  const emitWikipediaTitleIndexEvidence =
    hasFlag(args, "--no-emit-wikipedia-title-index-evidence") || hasFlag(args, "--no-emit-wti-evidence") ? false : true;
  const printOnly = args.includes("--print");

  if (seedId && step12In) {
    throw new Error("Provide either --seed-id (runtime mode) or --step12-in (persisted mode), not both.");
  }
  if (wikipediaTitleIndexPolicy !== "assertion_then_lexicon_fallback" && wikipediaTitleIndexPolicy !== "assertion_only") {
    throw new Error(`Invalid --wikipedia-title-index-policy: ${wikipediaTitleIndexPolicy}`);
  }

  return {
    seedId,
    step12In,
    artifactsRoot,
    outPathArg,
    diagOutPathArg,
    metaOutPathArg,
    wikipediaTitleIndexEndpoint,
    timeoutMs,
    wikipediaTitleIndexTimeoutMs,
    wikipediaTitleIndexPolicy,
    step13Mode,
    mode13bVerbPromotionMinWti,
    mode13bUnlinkedFiniteVerbPromotionMinWti,
    mode13bLowWtiUnlinkedMinAvg,
    mode13bNonnominalShareMin,
    mode13bNonnominalWeakWtiMax,
    mode13bMergeHostMinWtiRatio,
    enableSupplemental,
    enableAliasSynthesis,
    enableLegacyEnrichment,
    enableRecoverySynthesis,
    collectDiagnostics,
    emitWikipediaTitleIndexEvidence,
    printOnly,
    runOptions: {
      artifactsRoot,
      wikipediaTitleIndexEndpoint,
      timeoutMs,
      wikipediaTitleIndexTimeoutMs,
      wikipediaTitleIndexPolicy,
      step13Mode,
      mode13bVerbPromotionMinWti,
      mode13bUnlinkedFiniteVerbPromotionMinWti,
      mode13bLowWtiUnlinkedMinAvg,
      mode13bNonnominalShareMin,
      mode13bNonnominalWeakWtiMax,
      mode13bMergeHostMinWtiRatio,
      enableSupplemental,
      enableAliasSynthesis,
      enableLegacyEnrichment,
      enableRecoverySynthesis,
      collectDiagnostics,
      emitWikipediaTitleIndexEvidence,
    },
  };
}

module.exports = {
  parseCliExecutionContext,
};
