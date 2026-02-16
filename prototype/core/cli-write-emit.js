const path = require("path");

async function handleCliResultIO({
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
}) {
  const { yamlText, seedDir, outputDoc, diagnostics, mode } = result;
  if (printOnly) {
    process.stdout.write(yamlText);
    return;
  }

  const outPath = outPathArg || path.join(seedDir, "seed.concept-candidates.yaml");
  const meta = buildMetaSidecar({
    mode,
    outputDoc,
    step12In,
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
  });
  writePersistedOutputs({
    outPath,
    yamlText,
    diagOutPathArg,
    diagnostics,
    metaOutPathArg,
    meta,
  });
  process.stdout.write(
    `Wrote ${outPath} (${outputDoc.concept_candidates.length} candidates, mode=${mode})\n`
  );
}

module.exports = {
  handleCliResultIO,
};
