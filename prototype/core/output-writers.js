const fs = require("fs");
const path = require("path");

function ensureParentDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function buildMetaSidecar({
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
}) {
  return {
    mode,
    seed_id: outputDoc.seed_id,
    step13: {
      wikipedia_title_index_policy: wikipediaTitleIndexPolicy,
      step13_mode: step13Mode,
      enable_13b_mode: step13Mode === "13b",
      mode13b_policy: {
        verb_promotion_min_wikipedia_count: mode13bVerbPromotionMinWti,
        unlinked_finite_verb_promotion_min_wikipedia_count: mode13bUnlinkedFiniteVerbPromotionMinWti,
        low_wikipedia_count_unlinked_min_avg: mode13bLowWtiUnlinkedMinAvg,
        nonnominal_share_min: mode13bNonnominalShareMin,
        nonnominal_weak_wikipedia_count_max: mode13bNonnominalWeakWtiMax,
        merge_host_min_wikipedia_count_ratio: mode13bMergeHostMinWtiRatio,
      },
      enable_supplemental: enableSupplemental,
      enable_alias_synthesis: enableAliasSynthesis,
      enable_legacy_enrichment: enableLegacyEnrichment,
      enable_recovery_synthesis: enableLegacyEnrichment && enableRecoverySynthesis,
      emit_wikipedia_title_index_evidence: emitWikipediaTitleIndexEvidence,
    },
    runtime: {
      wikipedia_title_index_endpoint: step12In ? null : wikipediaTitleIndexEndpoint,
      timeout_ms: timeoutMs,
      wikipedia_title_index_timeout_ms: wikipediaTitleIndexTimeoutMs,
    },
  };
}

function writePersistedOutputs({
  outPath,
  yamlText,
  diagOutPathArg,
  diagnostics,
  metaOutPathArg,
  meta,
}) {
  ensureParentDir(outPath);
  fs.writeFileSync(outPath, yamlText, "utf8");

  if (diagOutPathArg) {
    const diagOutPath = path.resolve(diagOutPathArg);
    ensureParentDir(diagOutPath);
    fs.writeFileSync(diagOutPath, JSON.stringify(diagnostics || { source_by_canonical: {} }, null, 2), "utf8");
  }
  if (metaOutPathArg) {
    const metaOutPath = path.resolve(metaOutPathArg);
    ensureParentDir(metaOutPath);
    fs.writeFileSync(metaOutPath, JSON.stringify(meta, null, 2), "utf8");
  }
}

module.exports = {
  buildMetaSidecar,
  writePersistedOutputs,
};
