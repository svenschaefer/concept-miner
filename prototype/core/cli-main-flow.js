async function executeCliMainFlow({
  context,
  hasCliInputSource,
  generateForStep12Path,
  generateForSeed,
  handleCliResultIO,
}) {
  const {
    seedId,
    step12In,
    runOptions,
    printOnly,
    outPathArg,
    diagOutPathArg,
    metaOutPathArg,
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
    emitWikipediaTitleIndexEvidence,
    wikipediaTitleIndexEndpoint,
    timeoutMs,
    wikipediaTitleIndexTimeoutMs,
    buildMetaSidecar,
    writePersistedOutputs,
  } = context;

  if (!hasCliInputSource(seedId, step12In)) {
    return { usage: true };
  }

  const result = step12In ? generateForStep12Path(step12In, runOptions) : await generateForSeed(seedId, runOptions);
  await handleCliResultIO({
    result,
    printOnly,
    outPathArg,
    step12In,
    diagOutPathArg,
    metaOutPathArg,
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
    emitWikipediaTitleIndexEvidence,
    wikipediaTitleIndexEndpoint,
    timeoutMs,
    wikipediaTitleIndexTimeoutMs,
    buildMetaSidecar,
    writePersistedOutputs,
  });
  return { usage: false };
}

module.exports = {
  executeCliMainFlow,
};
