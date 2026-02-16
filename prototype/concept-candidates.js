#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { runElementaryAssertions } = require("elementary-assertions");
const {
  canonicalizeSurface,
  conceptIdFromCanonical,
  normalizeLiftedSurface,
} = require("./core/canonicalization");
const {
  isNominalTag,
  singularizeCanonical,
  shouldRejectAliasCanonical,
} = require("./core/alias-morphology");
const {
  compareStrings,
  assert,
  sortedUniqueStrings,
  countObjectTotal,
  roundFixed3,
} = require("./core/shared-utils");
const {
  parseStepMode,
  parseNonNegativeNumberArg,
  selectMentionEvidenceByPolicy,
} = require("./core/options-policy");
const {
  mentionSurfaceFromSpan,
  validateStep12Contract,
  buildMentionIndex,
  buildTokenIndex,
} = require("./core/step12-contract");
const {
  COUNT_KEY_RE,
  WIKIPEDIA_SIGNAL_KEY_RE,
  ensureWikipediaSignalScalar,
  orderedSparseWikipediaSignalObject,
  walkWikipediaSignalFields,
  mergeWikipediaSignalValue,
} = require("./core/wikipedia-signals");
const {
  collectUnionWikipediaSignalKeys,
  buildMentionWikipediaTitleIndexMap,
  buildMentionLexiconWikipediaTitleIndexMap,
} = require("./core/wikipedia-mapping");
const {
  mentionSortKeyForSelection,
  mentionTokensInOrder,
  mentionHasFiniteVerbToken,
} = require("./core/mention-selection");
const {
  isEligibleMentionForConcept,
  shouldLiftMention,
  shouldSkipDerivedSingleToken,
  deriveLiftedSurface,
} = require("./core/mention-lifting");
const {
  ensureCandidate,
  addRoleCounts,
  mergeCandidateIntoTarget,
} = require("./core/candidate-accumulator");
const {
  hasEnumeratedVerbHost,
  buildMentionToCanonicals,
  buildMentionSpanById,
  buildContainingMentionIdsByMentionId,
  buildMode13bCandidateMetrics,
} = require("./core/mode13b-metrics");
const {
  allMentionsContainedByStrongerHost,
  findBestHostCanonicalForMerge,
} = require("./core/mode13b-host-selection");
const { createPruneState } = require("./core/prune-preparation");
const { applyAliasSynthesis } = require("./core/alias-merge");
const {
  materializeWikipediaTitleIndexForCandidate,
  buildCandidateRecord,
} = require("./core/emission-assembly");
const { buildDiagnosticsDocument } = require("./core/diagnostics-assembly");
const { buildMetaSidecar, writePersistedOutputs } = require("./core/output-writers");
const { validateDeterministicCandidateRecord } = require("./core/determinism-validation");
const { finalizeGeneratedOutput } = require("./core/generation-orchestration");
const { resolveSeedTextInputPaths, loadStep12Yaml } = require("./core/step12-input");
const { parseCliExecutionContext } = require("./core/cli-option-assembly");
const {
  loadConceptCandidatesSchema,
  validateSchema,
  serializeDeterministicYaml,
} = require("./core/schema-serialization-io");
const {
  LEGACY_GENERIC_DROP,
  LEGACY_NOMINAL_VERB_WHITELIST,
  applyLegacyStringRules,
} = require("./legacy-enrichment");

const ROLE_KEYS = ["actor", "theme", "attr", "topic", "location", "other"];
const TOP_LEVEL_KEYS = ["schema_version", "seed_id", "stage", "concept_candidates"];
const CANDIDATE_KEYS = ["concept_id", "canonical", "surfaces", "mention_ids", "assertion_ids", "roles", "wikipedia_title_index"];
const CANDIDATE_KEYS_WITH_WIKIPEDIA_TITLE_INDEX_EVIDENCE = [...CANDIDATE_KEYS, "wikipedia_title_index_evidence"];
const DEFAULT_ARTIFACTS_ROOT = path.resolve(__dirname, "..", "artifacts");
const STEP13_DIR = __dirname;
const DEFAULT_WIKIPEDIA_TITLE_INDEX_ENDPOINT = "http://127.0.0.1:32123";
const STEP13_MODES = new Set(["13a", "13b"]);

function usage() {
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

function arg(args, name) {
  const i = args.indexOf(name);
  if (i < 0 || i + 1 >= args.length) return null;
  return args[i + 1];
}

function hasFlag(args, name) {
  return args.includes(name);
}

function roleBucket(role) {
  const r = String(role || "");
  if (r === "actor") return "actor";
  if (r === "theme") return "theme";
  if (r === "attr" || r === "attribute") return "attr";
  if (r === "topic") return "topic";
  if (r === "location") return "location";
  return "other";
}

function selectCanonicalMentionId(mentionIds, mentionById, tokenById) {
  const mentions = [];
  for (const id of mentionIds || []) {
    const mention = mentionById.get(String(id || ""));
    if (!mention) continue;
    mentions.push(mention);
  }
  if (mentions.length === 0) return null;

  mentions.sort((a, b) => {
    const ka = mentionSortKeyForSelection(a);
    const kb = mentionSortKeyForSelection(b);
    if (ka.kindRank !== kb.kindRank) return ka.kindRank - kb.kindRank;
    if (ka.tokenCount !== kb.tokenCount) return kb.tokenCount - ka.tokenCount;
    if (ka.span !== kb.span) return kb.span - ka.span;
    return compareStrings(ka.id, kb.id);
  });

  for (const mention of mentions) {
    if (isEligibleMentionForConcept(mention, tokenById)) return mention.id;
  }
  return null;
}

function validateMentionIdsShape(entries, entryPath, mentionById) {
  assert(Array.isArray(entries), `${entryPath} must be an array.`);
  for (let i = 0; i < entries.length; i += 1) {
    const entry = entries[i] || {};
    assert(Array.isArray(entry.mention_ids), `${entryPath}[${i}].mention_ids must be string[].`);
    for (let j = 0; j < entry.mention_ids.length; j += 1) {
      const mentionId = entry.mention_ids[j];
      assert(typeof mentionId === "string" && mentionId.length > 0, `${entryPath}[${i}].mention_ids[${j}] must be non-empty string.`);
      if (!mentionById.has(mentionId)) {
        throw new Error(`${entryPath}[${i}].mention_ids[${j}] references unknown mention id: ${mentionId}`);
      }
    }
  }
}

function buildConceptCandidatesFromStep12(step12, options = {}) {
  validateStep12Contract(step12);
  const step13Mode = parseStepMode(options.step13Mode, STEP13_MODES, "--step13-mode");
  const enableLegacyEnrichment = options.enableLegacyEnrichment === true;
  const mode13bVerbPromotionMinWti = parseNonNegativeNumberArg(
    "mode13bVerbPromotionMinWti",
    options.mode13bVerbPromotionMinWti,
    1.0
  );
  const mode13bLowWtiUnlinkedMinAvg = parseNonNegativeNumberArg(
    "mode13bLowWtiUnlinkedMinAvg",
    options.mode13bLowWtiUnlinkedMinAvg,
    0.5
  );
  const mode13bUnlinkedFiniteVerbPromotionMinWti = parseNonNegativeNumberArg(
    "mode13bUnlinkedFiniteVerbPromotionMinWti",
    options.mode13bUnlinkedFiniteVerbPromotionMinWti,
    80.0
  );
  const mode13bNonnominalShareMin = parseNonNegativeNumberArg(
    "mode13bNonnominalShareMin",
    options.mode13bNonnominalShareMin,
    0.5
  );
  const mode13bNonnominalWeakWtiMax = parseNonNegativeNumberArg(
    "mode13bNonnominalWeakWtiMax",
    options.mode13bNonnominalWeakWtiMax,
    1.5
  );
  const mode13bMergeHostMinWtiRatio = parseNonNegativeNumberArg(
    "mode13bMergeHostMinWtiRatio",
    options.mode13bMergeHostMinWtiRatio,
    1.0
  );
  const t0 = Date.now();
  const mentionById = buildMentionIndex(step12);
  const tokenById = buildTokenIndex(step12);
  const mentions = Array.isArray(step12.mentions) ? step12.mentions : [];
  const wikipediaSignalKeys = collectUnionWikipediaSignalKeys(step12);
  const wikipediaCountKeys = wikipediaSignalKeys.filter((k) => COUNT_KEY_RE.test(k));
  const mentionWikipediaTitleIndex = buildMentionWikipediaTitleIndexMap(step12);
  const mentionLexiconWikipediaTitleIndex = buildMentionLexiconWikipediaTitleIndexMap(step12);

  const byCanonical = new Map();
  const sourceByCanonical = new Map();
  const mode13bByCanonical = new Map();
  const markSource = (canonical, sourceTag) => {
    if (!sourceByCanonical.has(canonical)) sourceByCanonical.set(canonical, new Set());
    sourceByCanonical.get(canonical).add(String(sourceTag || ""));
  };
  const markMode13bDecision = (canonical, policyTag, metrics) => {
    if (!mode13bByCanonical.has(canonical)) {
      mode13bByCanonical.set(canonical, {
        policy_hits: new Set(),
        metrics: null,
      });
    }
    const entry = mode13bByCanonical.get(canonical);
    entry.policy_hits.add(String(policyTag || ""));
    if (metrics && typeof metrics === "object") {
      entry.metrics = {
        role_total: Number.isInteger(metrics.roleTotal) ? metrics.roleTotal : 0,
        assertion_count: Number.isInteger(metrics.assertionCount) ? metrics.assertionCount : 0,
        mention_count: Number.isInteger(metrics.mentionCount) ? metrics.mentionCount : 0,
        avg_wikipedia_count: roundFixed3(metrics.avgWti),
        non_nominal_share: roundFixed3(metrics.nonNominalShare),
      };
    }
  };
  const stats = {
    step13_mode: step13Mode,
    mentions_total: Array.isArray(step12.mentions) ? step12.mentions.length : 0,
    assertions_total: Array.isArray(step12.assertions) ? step12.assertions.length : 0,
    role_mentions_scanned: 0,
    role_candidates_lifted: 0,
    supplemental_mentions_scanned: 0,
    supplemental_candidates_lifted: 0,
    mode13b_suppressed_candidates: 0,
    mode13b_suppressed_low_wikipedia_count_unlinked: 0,
    mode13b_suppressed_non_nominal_bias: 0,
    mode13b_suppressed_contained_by_stronger_host: 0,
    mode13b_promoted_unlinked_finite_verb: 0,
    mode13b_suppressed_participial_fragment: 0,
    mode13b_suppressed_participial_chunk_reduction: 0,
    mode13b_suppressed_two_token_participial_lift: 0,
    mode13b_suppressed_short_symbolic_token: 0,
    mode13b_merged_into_stronger_host: 0,
    phase_ms: {
      role_lifting: 0,
      supplemental_lifting: 0,
      prune: 0,
      alias_and_legacy: 0,
      emit: 0,
      total: 0,
    },
  };
  const mentionLiftInfoById = new Map();
  const getMentionLiftInfo = (mentionId) => {
    const key = String(mentionId || "");
    if (mentionLiftInfoById.has(key)) return mentionLiftInfoById.get(key);
    const mention = mentionById.get(key);
    if (!mention) {
      mentionLiftInfoById.set(key, null);
      return null;
    }
    const rawSurface = mentionSurfaceFromSpan(mention, step12.canonical_text);
    const liftedSurface = deriveLiftedSurface(mention, step12.canonical_text, tokenById);
    const normalizedRawSurface = normalizeLiftedSurface(rawSurface);
    const info = {
      mention,
      rawSurface,
      normalizedRawSurface,
      liftedSurface,
      hasLiftedSurface: Boolean(liftedSurface),
      shouldLift: shouldLiftMention(mention, step12.canonical_text, tokenById, {
        enableLegacyNominalWhitelist: enableLegacyEnrichment,
        legacyNominalVerbWhitelist: LEGACY_NOMINAL_VERB_WHITELIST,
      }),
      skipSingle: Boolean(liftedSurface)
        ? shouldSkipDerivedSingleToken(rawSurface, liftedSurface, mention, tokenById)
        : false,
      hasAlnum: Boolean(liftedSurface) ? /[A-Za-z0-9]/.test(liftedSurface) : false,
      hasFiniteVerbToken: mentionHasFiniteVerbToken(mention, tokenById),
    };
    mentionLiftInfoById.set(key, info);
    return info;
  };
  const selectedMentionIds = new Set();
  const roleLinkedByMentionId = new Map();
  const markRoleLinkedMention = (mentionId, assertionId, bucket) => {
    const key = String(mentionId || "");
    if (!roleLinkedByMentionId.has(key)) {
      roleLinkedByMentionId.set(key, {
        assertionIds: new Set(),
        roleCounts: { actor: 0, theme: 0, attr: 0, topic: 0, location: 0, other: 0 },
      });
    }
    const entry = roleLinkedByMentionId.get(key);
    entry.assertionIds.add(assertionId);
    entry.roleCounts[bucket] += 1;
  };
  const assertions = Array.isArray(step12.assertions) ? step12.assertions : [];

  const roleStart = Date.now();
  for (let ai = 0; ai < assertions.length; ai += 1) {
    const assertion = assertions[ai] || {};
    const assertionId = String(assertion.id || "");
    assert(assertionId, `assertions[${ai}] missing id.`);
    const argumentsList = Array.isArray(assertion.arguments) ? assertion.arguments : [];
    const modifiersList = Array.isArray(assertion.modifiers) ? assertion.modifiers : [];

    validateMentionIdsShape(argumentsList, `assertions[${ai}].arguments`, mentionById);
    validateMentionIdsShape(modifiersList, `assertions[${ai}].modifiers`, mentionById);

    const roleEntries = []
      .concat(argumentsList.map((x) => ({ role: x.role, mention_ids: x.mention_ids })))
      .concat(modifiersList.map((x) => ({ role: x.role, mention_ids: x.mention_ids })));

    for (const entry of roleEntries) {
      if (String(entry.role || "") === "exemplifies") continue;
      const bucket = roleBucket(entry.role);
      for (const mentionId of entry.mention_ids) {
        markRoleLinkedMention(mentionId, assertionId, bucket);
        stats.role_mentions_scanned += 1;
        const info = getMentionLiftInfo(mentionId);
        if (!info) continue;
        if (!info.shouldLift) continue;
        if (!info.hasLiftedSurface) continue;
        if (info.skipSingle) continue;
        const { mention, liftedSurface } = info;
        const canonical = canonicalizeSurface(liftedSurface);
        const candidate = ensureCandidate(byCanonical, canonical);
        candidate.surfaces.add(liftedSurface);
        candidate.mention_ids.add(mentionId);
        candidate.assertion_ids.add(assertionId);
        candidate.roles[bucket] += 1;
        markSource(canonical, "role");
        selectedMentionIds.add(mentionId);
        stats.role_candidates_lifted += 1;
      }
    }
  }
  stats.phase_ms.role_lifting = Date.now() - roleStart;

  const enableSupplemental = options.enableSupplemental !== false;
  const supplementalStart = Date.now();
  if (enableSupplemental) {
    const supplementalSourceKinds = new Set(["mwe_materialized", "token_shadow", "chunk_accepted", "token_fallback"]);
    const nonTokenMentions = mentions.filter((m) => m && (m.kind === "mwe" || m.kind === "chunk"));
    const nonTokenBySegment = new Map();
    for (const host of nonTokenMentions) {
      const segmentId = String((host && host.segment_id) || "");
      if (!nonTokenBySegment.has(segmentId)) nonTokenBySegment.set(segmentId, []);
      nonTokenBySegment.get(segmentId).push(host);
    }
    const containingHostsByMentionId = new Map();
    const getContainingHosts = (mention) => {
      const mentionId = String((mention && mention.id) || "");
      if (!mentionId) return [];
      if (containingHostsByMentionId.has(mentionId)) return containingHostsByMentionId.get(mentionId);
      const span = mention && mention.span;
      if (!span || !Number.isInteger(span.start) || !Number.isInteger(span.end)) {
        containingHostsByMentionId.set(mentionId, []);
        return [];
      }
      const segmentId = String((mention && mention.segment_id) || "");
      const hostsInSegment = nonTokenBySegment.get(segmentId) || [];
      const out = [];
      for (const host of hostsInSegment) {
        if (!host || host.id === mention.id) continue;
        const hs = host.span || {};
        if (!Number.isInteger(hs.start) || !Number.isInteger(hs.end)) continue;
        if (hs.start <= span.start && hs.end >= span.end) out.push(host);
      }
      containingHostsByMentionId.set(mentionId, out);
      return out;
    };
    const hasNonFiniteVerbContainer = (mention) => {
    const hosts = getContainingHosts(mention);
    for (const host of hosts) {
      if (!mentionHasFiniteVerbToken(host, tokenById)) return true;
    }
    return false;
    };
    const hasPrepositionLedNonFiniteContainer = (mention) => {
    for (const host of getContainingHosts(mention)) {
      if (mentionHasFiniteVerbToken(host, tokenById)) continue;
      const hostTokens = mentionTokensInOrder(host, tokenById);
      const first = hostTokens[0] || {};
      const firstTag = String(((first.pos || {}).tag) || "");
      const firstLower = String(first.normalized || first.surface || "").toLowerCase();
      if (firstTag === "IN" || firstTag === "TO" || firstTag === "RB") return true;
      if (["as", "before", "after", "than", "while", "when", "if"].includes(firstLower)) return true;
    }
    return false;
    };
    const hasVbnLedNonFiniteContainer = (mention) => {
    for (const host of getContainingHosts(mention)) {
      if (mentionHasFiniteVerbToken(host, tokenById)) continue;
      const hostTokens = mentionTokensInOrder(host, tokenById);
      const first = hostTokens[0] || {};
      const firstTag = String(((first.pos || {}).tag) || "");
      if (firstTag === "VBN") return true;
    }
    return false;
    };
    for (const mention of mentions) {
    if (!mention || typeof mention.id !== "string") continue;
    stats.supplemental_mentions_scanned += 1;
    if (selectedMentionIds.has(mention.id)) continue;
    const sourceKind = String((((mention.provenance || {}).source_kind) || ""));
    if (!supplementalSourceKinds.has(sourceKind)) continue;
    if (sourceKind === "token_fallback" && hasNonFiniteVerbContainer(mention) && hasPrepositionLedNonFiniteContainer(mention)) {
      const head = tokenById.get(String(mention.head_token_id || "")) || {};
      const headTag = String(((head.pos || {}).tag) || "");
      const rawSurface = normalizeLiftedSurface(mentionSurfaceFromSpan(mention, step12.canonical_text)).toLowerCase();
      const isPluralNoun = headTag === "NNS" || headTag === "NNPS";
      const looksPlural = rawSurface.endsWith("s");
      if (!isPluralNoun && !looksPlural) continue;
    }
    if (sourceKind === "token_shadow" && hasNonFiniteVerbContainer(mention) && hasVbnLedNonFiniteContainer(mention)) continue;
    const info = getMentionLiftInfo(mention.id);
    if (!info) continue;
    if (!info.shouldLift) continue;
    if (!info.hasLiftedSurface) continue;
    const { rawSurface, normalizedRawSurface, liftedSurface } = info;
    if (info.hasFiniteVerbToken && liftedSurface === normalizedRawSurface) {
      const lower = String(liftedSurface).toLowerCase();
      if (!(enableLegacyEnrichment && LEGACY_NOMINAL_VERB_WHITELIST.has(lower))) continue;
    }
    if (info.skipSingle) continue;
    if (!info.hasAlnum) continue;
    const canonical = canonicalizeSurface(liftedSurface);

    const candidate = ensureCandidate(byCanonical, canonical);
    candidate.surfaces.add(liftedSurface);
    candidate.mention_ids.add(mention.id);
    markSource(canonical, "supplemental");
    stats.supplemental_candidates_lifted += 1;
    }
  }

  // 13b generic extended filtering:
  // suppression is allowed only by structural signals and Wikipedia Title Index-derived evidence, never by literal-string rules.
  if (step13Mode === "13b") {
    const mode13bStart = Date.now();
    const policy = String(options.wikipediaTitleIndexPolicy || options.wtiPolicy || "assertion_then_lexicon_fallback");
    // 13b extension: promote verb-headed role-linked mentions with sufficiently strong Wikipedia Title Index evidence.
    for (const [mentionId, linkInfo] of roleLinkedByMentionId.entries()) {
      const info = getMentionLiftInfo(mentionId);
      if (!info || !info.hasLiftedSurface || info.skipSingle || !info.hasAlnum) continue;
      const mention = info.mention || {};
      const tokenCount = Array.isArray(mention.token_ids) ? mention.token_ids.length : 0;
      if (tokenCount !== 1) continue;
      const head = tokenById.get(String(mention.head_token_id || "")) || {};
      const tag = String(((head.pos || {}).tag) || "");
      const coarse = String(((head.pos || {}).coarse) || "");
      const isVerbHead = coarse === "VERB" || tag === "VB" || tag === "VBD" || tag === "VBP" || tag === "VBZ";
      if (!isVerbHead) continue;

      const assertionEvidence = mentionWikipediaTitleIndex.get(mentionId) || null;
      const lexiconEvidence = mentionLexiconWikipediaTitleIndex.get(mentionId) || null;
      const selected = selectMentionEvidenceByPolicy(assertionEvidence, lexiconEvidence, policy);
      let mentionWikipediaCountTotal = 0;
      for (const key of wikipediaCountKeys) {
        const value = selected[key];
        if (value !== undefined) {
          assert(Number.isInteger(value), `Non-integer value for ${key} on mention ${mentionId}.`);
          mentionWikipediaCountTotal += value;
        }
      }
      if (mentionWikipediaCountTotal < mode13bVerbPromotionMinWti) continue;

      const canonical = canonicalizeSurface(info.liftedSurface);
      const candidate = ensureCandidate(byCanonical, canonical);
      candidate.surfaces.add(info.liftedSurface);
      candidate.mention_ids.add(mentionId);
      for (const assertionId of linkInfo.assertionIds) candidate.assertion_ids.add(assertionId);
      addRoleCounts(candidate.roles, linkInfo.roleCounts);
      markSource(canonical, "mode13b_promotion");
      markMode13bDecision(canonical, "promotion_verb_wikipedia_count", {
        roleTotal:
          candidate.roles.actor +
          candidate.roles.theme +
          candidate.roles.attr +
          candidate.roles.topic +
          candidate.roles.location +
          candidate.roles.other,
        assertionCount: candidate.assertion_ids.size,
        mentionCount: candidate.mention_ids.size,
        avgWti: mentionWikipediaCountTotal,
        nonNominalShare: 1,
      });
    }

    // 13b extension: promote unlinked finite-verb singleton mentions when Wikipedia Title Index evidence is very strong.
    for (const mention of mentions) {
      if (!mention || typeof mention.id !== "string") continue;
      if (selectedMentionIds.has(mention.id)) continue;
      const info = getMentionLiftInfo(mention.id);
      if (!info || !info.hasLiftedSurface || info.skipSingle || !info.hasAlnum) continue;
      const tokenCount = Array.isArray(mention.token_ids) ? mention.token_ids.length : 0;
      if (tokenCount !== 1 || String(mention.kind || "") !== "token") continue;
      const sourceKind = String((((mention.provenance || {}).source_kind) || ""));
      if (sourceKind !== "token_fallback" && sourceKind !== "token_shadow") continue;
      if (mention.is_primary !== true) continue;
      const roleLink = roleLinkedByMentionId.get(mention.id);
      if (roleLink && roleLink.assertionIds && roleLink.assertionIds.size > 0) continue;

      const head = tokenById.get(String(mention.head_token_id || "")) || {};
      const tag = String(((head.pos || {}).tag) || "");
      const finiteVerbHead = tag === "VBP" || tag === "VBZ" || tag === "VBD";
      if (!finiteVerbHead) continue;
      if (hasEnumeratedVerbHost(mention, mentions, tokenById)) continue;

      const assertionEvidence = mentionWikipediaTitleIndex.get(mention.id) || null;
      const lexiconEvidence = mentionLexiconWikipediaTitleIndex.get(mention.id) || null;
      const selected = selectMentionEvidenceByPolicy(assertionEvidence, lexiconEvidence, policy);
      let mentionWikipediaCountTotal = 0;
      for (const key of wikipediaCountKeys) {
        const value = selected[key];
        if (value !== undefined) {
          assert(Number.isInteger(value), `Non-integer value for ${key} on mention ${mention.id}.`);
          mentionWikipediaCountTotal += value;
        }
      }
      if (mentionWikipediaCountTotal < mode13bUnlinkedFiniteVerbPromotionMinWti) continue;

      const canonical = canonicalizeSurface(info.liftedSurface);
      const candidate = ensureCandidate(byCanonical, canonical);
      candidate.surfaces.add(info.liftedSurface);
      candidate.mention_ids.add(mention.id);
      markSource(canonical, "mode13b_promotion");
      markMode13bDecision(canonical, "promotion_unlinked_finite_verb_wikipedia_count", {
        roleTotal: 0,
        assertionCount: 0,
        mentionCount: candidate.mention_ids.size,
        avgWti: mentionWikipediaCountTotal,
        nonNominalShare: 1,
      });
      stats.mode13b_promoted_unlinked_finite_verb += 1;
      selectedMentionIds.add(mention.id);
    }

    const mentionToCanonicals = buildMentionToCanonicals(byCanonical);
    const mentionSpanById = buildMentionSpanById(mentions);
    const containingMentionIdsByMentionId = buildContainingMentionIdsByMentionId(mentions, mentionSpanById);
    const candidateMetrics = buildMode13bCandidateMetrics({
      byCanonical,
      mentionById,
      tokenById,
      getMentionLiftInfo,
      mentionWikipediaTitleIndex,
      mentionLexiconWikipediaTitleIndex,
      wikipediaCountKeys,
      policy,
    });

    for (const canonical of Array.from(byCanonical.keys()).sort(compareStrings)) {
      const item = byCanonical.get(canonical);
      if (!item) continue;
      const metrics = candidateMetrics.get(canonical);
      if (!metrics) continue;
      if (metrics.mentionCount === 0) continue;

      // Low-evidence unlinked suppression (requires some non-nominal structural signal).
      if (
        metrics.roleTotal === 0 &&
        metrics.assertionCount === 0 &&
        metrics.avgWti < mode13bLowWtiUnlinkedMinAvg &&
        metrics.nonNominalShare >= 0.25
      ) {
        markMode13bDecision(canonical, "suppress_low_wikipedia_count_unlinked", metrics);
        byCanonical.delete(canonical);
        stats.mode13b_suppressed_candidates += 1;
        stats.mode13b_suppressed_low_wikipedia_count_unlinked += 1;
        continue;
      }

      // Stronger suppression for structurally non-nominal candidates with weak evidence.
      if (
        metrics.roleTotal === 0 &&
        metrics.assertionCount === 0 &&
        metrics.nonNominalShare >= mode13bNonnominalShareMin &&
        metrics.avgWti < mode13bNonnominalWeakWtiMax
      ) {
        markMode13bDecision(canonical, "suppress_nonnominal_weak_wikipedia_count", metrics);
        byCanonical.delete(canonical);
        stats.mode13b_suppressed_candidates += 1;
        stats.mode13b_suppressed_non_nominal_bias += 1;
        continue;
      }

      if (
        metrics.participialFragmentShare >= 0.8 &&
        metrics.coreRoleTotal === 0 &&
        metrics.roleTotal <= 1 &&
        metrics.assertionCount <= 1
      ) {
        markMode13bDecision(canonical, "suppress_participial_fragment", metrics);
        byCanonical.delete(canonical);
        stats.mode13b_suppressed_candidates += 1;
        stats.mode13b_suppressed_participial_fragment += 1;
        continue;
      }

      if (
        metrics.participialChunkReductionShare >= 0.8 &&
        metrics.coreRoleTotal === 0 &&
        metrics.roleTotal <= 1 &&
        metrics.assertionCount <= 1
      ) {
        markMode13bDecision(canonical, "suppress_participial_chunk_reduction", metrics);
        byCanonical.delete(canonical);
        stats.mode13b_suppressed_candidates += 1;
        stats.mode13b_suppressed_participial_chunk_reduction += 1;
        continue;
      }

      if (
        metrics.twoTokenParticipialLiftShare >= 0.8 &&
        metrics.coreRoleTotal === 0 &&
        metrics.assertionCount === 0
      ) {
        markMode13bDecision(canonical, "suppress_two_token_participial_lift", metrics);
        byCanonical.delete(canonical);
        stats.mode13b_suppressed_candidates += 1;
        stats.mode13b_suppressed_two_token_participial_lift += 1;
        continue;
      }

      if (
        metrics.roleTotal === 0 &&
        metrics.assertionCount === 0 &&
        metrics.shortSymbolicTokenShare >= 0.5 &&
        metrics.punctuatedSurfaceShare >= 0.5 &&
        metrics.coreRoleTotal === 0 &&
        String(canonical || "").length <= 3 &&
        String(canonical || "").includes("_")
      ) {
        markMode13bDecision(canonical, "suppress_short_symbolic_token", metrics);
        byCanonical.delete(canonical);
        stats.mode13b_suppressed_candidates += 1;
        stats.mode13b_suppressed_short_symbolic_token += 1;
        continue;
      }

      // Suppress if all mentions are structurally contained by stronger host candidates.
      if (metrics.roleTotal > 0 || metrics.assertionCount > 0) continue;
      const candidatePartCount = String(canonical).split("_").filter(Boolean).length;
      if (candidatePartCount < 2) continue;
      const allContained = allMentionsContainedByStrongerHost({
        canonical,
        item,
        metrics,
        byCanonical,
        candidateMetrics,
        mentionSpanById,
        containingMentionIdsByMentionId,
        mentionToCanonicals,
      });
      if (allContained) {
        const bestHostCanonical = findBestHostCanonicalForMerge({
          canonical,
          item,
          metrics,
          byCanonical,
          candidateMetrics,
          containingMentionIdsByMentionId,
          mentionToCanonicals,
          mode13bMergeHostMinWtiRatio,
        });
        if (bestHostCanonical) {
          const hostItem = byCanonical.get(bestHostCanonical);
          if (hostItem) {
            mergeCandidateIntoTarget(hostItem, item);
            markMode13bDecision(canonical, "merge_into_stronger_host", metrics);
            byCanonical.delete(canonical);
            stats.mode13b_suppressed_candidates += 1;
            stats.mode13b_merged_into_stronger_host += 1;
            continue;
          }
        }
        markMode13bDecision(canonical, "suppress_contained_stronger_host", metrics);
        byCanonical.delete(canonical);
        stats.mode13b_suppressed_candidates += 1;
        stats.mode13b_suppressed_contained_by_stronger_host += 1;
      }
    }
    stats.phase_ms.mode13b_filter = Date.now() - mode13bStart;
  }
  stats.phase_ms.supplemental_lifting = Date.now() - supplementalStart;

  const pruneStart = Date.now();
  const initialCanonicals = Array.from(byCanonical.keys());
  const {
    pluralSet,
    roleTotalByCanonical,
    partsByCanonical,
    compoundsBySuffix,
    activeCanonicals,
    hasComponentInCompound,
    deactivateCanonical,
  } = createPruneState(initialCanonicals, byCanonical);
  for (const canonical of initialCanonicals) {
    if (!activeCanonicals.has(canonical)) continue;
    if (canonical.length < 2) {
      byCanonical.delete(canonical);
      deactivateCanonical(canonical);
      continue;
    }
    if (enableLegacyEnrichment && LEGACY_GENERIC_DROP.has(canonical)) {
      byCanonical.delete(canonical);
      deactivateCanonical(canonical);
      continue;
    }
    const item = byCanonical.get(canonical);
    if (!canonical.includes("_") && pluralSet.has(`${canonical}s`)) {
      byCanonical.delete(canonical);
      deactivateCanonical(canonical);
      continue;
    }
    
    const roleTotal = roleTotalByCanonical.get(canonical) || 0;
    const mentionCount = item ? item.mention_ids.size : 0;
    const looksPlural = canonical.endsWith("s") && !canonical.endsWith("ss");
    const keepPluralAggregate = looksPlural && mentionCount >= 2;
    if (roleTotal === 0 && hasComponentInCompound(canonical)) {
      const hasPrimaryTokenMention = item && Array.from(item.mention_ids).some((id) => {
        const mention = mentionById.get(String(id || ""));
        return Boolean(mention && mention.is_primary === true && mention.kind === "token");
      });
      const keepPrimaryLeaf = hasPrimaryTokenMention && !canonical.includes("_");
      if (!keepPluralAggregate && !keepPrimaryLeaf) {
        byCanonical.delete(canonical);
        deactivateCanonical(canonical);
        continue;
      }
    }

    const parts = partsByCanonical.get(canonical) || canonical.split("_");
    if (parts.length === 2) {
      const head = parts[1];
      const hasHead = byCanonical.has(head);
      const longerSuffixSet = compoundsBySuffix.get(canonical);
      let hasLongerSuffix = false;
      if (longerSuffixSet) {
        for (const other of longerSuffixSet) {
          if (other === canonical || !activeCanonicals.has(other)) continue;
          if ((roleTotalByCanonical.get(other) || 0) === 0) {
            hasLongerSuffix = true;
            break;
          }
        }
      }
      if (hasHead && hasLongerSuffix) {
        byCanonical.delete(canonical);
        deactivateCanonical(canonical);
        continue;
      }
    }

    if (enableLegacyEnrichment && canonical.startsWith("generated_") && roleTotal === 0) {
      byCanonical.delete(canonical);
      deactivateCanonical(canonical);
      continue;
    }
  }
  stats.phase_ms.prune = Date.now() - pruneStart;

  const aliasStart = Date.now();
  const enableAliasSynthesis = options.enableAliasSynthesis !== false;
  if (enableAliasSynthesis) {
    const enableRecoverySynthesis = enableLegacyEnrichment && options.enableRecoverySynthesis === true;
    applyAliasSynthesis({
      byCanonical,
      markSource,
      singularizeCanonical,
      shouldRejectAliasCanonical,
      ensureCandidate,
      mergeCandidateIntoTarget,
      enableLegacyEnrichment,
    });
    // Tripwire invariant: if (enableLegacyEnrichment && parts.length >= 2 && parts[0] === "abac")

    if (enableLegacyEnrichment) {
      applyLegacyStringRules({
        byCanonical,
        markSource,
        compareStrings,
        enableRecoverySynthesis,
      });
    }
  }
  stats.phase_ms.alias_and_legacy = Date.now() - aliasStart;

  const emitWikipediaTitleIndexEvidence = options.emitWikipediaTitleIndexEvidence !== false;

  const emitStart = Date.now();
  const candidates = [];
  const idToCandidate = new Map();

  for (const candidate of Array.from(byCanonical.values()).sort((a, b) => compareStrings(a.canonical, b.canonical))) {
    const mentionIds = sortedUniqueStrings(Array.from(candidate.mention_ids));
    const assertionIds = sortedUniqueStrings(Array.from(candidate.assertion_ids));
    const surfaces = sortedUniqueStrings(Array.from(candidate.surfaces));

    const policy = String(options.wikipediaTitleIndexPolicy || options.wtiPolicy || "assertion_then_lexicon_fallback");
    const { wikipediaTitleIndex, mentionContrib } = materializeWikipediaTitleIndexForCandidate({
      mentionIds,
      wikipediaSignalKeys,
      COUNT_KEY_RE,
      mentionWikipediaTitleIndex,
      mentionLexiconWikipediaTitleIndex,
      policy,
      ensureWikipediaSignalScalar,
      mergeWikipediaSignalValue,
      emitWikipediaTitleIndexEvidence,
      orderedSparseWikipediaSignalObject,
    });

    const conceptId = conceptIdFromCanonical(candidate.canonical);
    const existing = idToCandidate.get(conceptId);
    if (existing && existing.canonical !== candidate.canonical) {
      throw new Error(
        JSON.stringify(
          {
            error: "concept_id_collision",
            seed_id: step12.seed_id,
            concept_id: conceptId,
            canonicals: [
              {
                canonical: existing.canonical,
                mention_ids: existing.mention_ids,
                assertion_ids: existing.assertion_ids,
              },
              {
                canonical: candidate.canonical,
                mention_ids: mentionIds,
                assertion_ids: assertionIds,
              },
            ],
          },
          null,
          2
        )
      );
    }

    idToCandidate.set(conceptId, {
      canonical: candidate.canonical,
      mention_ids: mentionIds,
      assertion_ids: assertionIds,
    });

    const record = buildCandidateRecord({
      conceptId,
      candidate,
      surfaces,
      mentionIds,
      assertionIds,
      wikipediaSignalKeys,
      wikipediaTitleIndex,
      emitWikipediaTitleIndexEvidence,
      policy,
      mentionContrib,
    });
    candidates.push(record);
  }

  const top = {
    schema_version: String(step12.schema_version),
    seed_id: String(step12.seed_id || ""),
    stage: "concept_candidates",
    concept_candidates: candidates,
  };

  validateConceptCandidatesDeterminism(top);
  stats.phase_ms.emit = Date.now() - emitStart;
  stats.phase_ms.total = Date.now() - t0;
  if (options.collectDiagnostics === true) {
    top._diagnostics = buildDiagnosticsDocument(sourceByCanonical, mode13bByCanonical, stats, compareStrings);
  }
  return top;
}

function validateConceptCandidatesDeterminism(doc) {
  assert(doc && typeof doc === "object", "Output document must be an object.");
  assert(JSON.stringify(Object.keys(doc)) === JSON.stringify(TOP_LEVEL_KEYS), "Top-level key order mismatch.");
  assert(doc.stage === "concept_candidates", "Output stage must be concept_candidates.");
  assert(Array.isArray(doc.concept_candidates), "concept_candidates must be an array.");

  let prevCanonical = null;
  const idMap = new Map();
  for (let i = 0; i < doc.concept_candidates.length; i += 1) {
    prevCanonical = validateDeterministicCandidateRecord({
      candidate: doc.concept_candidates[i],
      index: i,
      prevCanonical,
      idMap,
      compareStrings,
      assert,
      conceptIdFromCanonical,
      CANDIDATE_KEYS,
      CANDIDATE_KEYS_WITH_WIKIPEDIA_TITLE_INDEX_EVIDENCE,
      ROLE_KEYS,
      WIKIPEDIA_SIGNAL_KEY_RE,
      COUNT_KEY_RE,
    });
  }
}

async function generateForSeed(seedId, options = {}) {
  const artifactsRoot = options.artifactsRoot || DEFAULT_ARTIFACTS_ROOT;
  const wikipediaTitleIndexEndpoint =
    options.wikipediaTitleIndexEndpoint || options.wtiEndpoint || DEFAULT_WIKIPEDIA_TITLE_INDEX_ENDPOINT;
  const timeoutMs = Number.isFinite(options.timeoutMs) ? options.timeoutMs : 120000;
  const wikipediaTitleIndexTimeoutMs =
    Number.isFinite(options.wikipediaTitleIndexTimeoutMs) ? options.wikipediaTitleIndexTimeoutMs
      : (Number.isFinite(options.wtiTimeoutMs) ? options.wtiTimeoutMs : 2000);
  const { seedDir, seedTextPath, legacySeedTextPath, flatSeedTextPath } = resolveSeedTextInputPaths(artifactsRoot, seedId);
  if (!fs.existsSync(seedTextPath)) {
    throw new Error(`Missing seed.txt for seed ${seedId}: tried ${legacySeedTextPath} and ${flatSeedTextPath}`);
  }
  const seedText = fs.readFileSync(seedTextPath, "utf8");

  const step12 = await runElementaryAssertions(seedText, {
    services: {
      "wikipedia-title-index": { endpoint: wikipediaTitleIndexEndpoint },
    },
    timeoutMs,
    wtiTimeoutMs: wikipediaTitleIndexTimeoutMs,
  });

  const outputDoc = buildConceptCandidatesFromStep12(step12, {
    step13Mode: options.step13Mode,
    mode13bVerbPromotionMinWti: options.mode13bVerbPromotionMinWti,
    mode13bUnlinkedFiniteVerbPromotionMinWti: options.mode13bUnlinkedFiniteVerbPromotionMinWti,
    mode13bLowWtiUnlinkedMinAvg: options.mode13bLowWtiUnlinkedMinAvg,
    mode13bNonnominalShareMin: options.mode13bNonnominalShareMin,
    mode13bNonnominalWeakWtiMax: options.mode13bNonnominalWeakWtiMax,
    mode13bMergeHostMinWtiRatio: options.mode13bMergeHostMinWtiRatio,
    enableSupplemental: options.enableSupplemental,
    enableAliasSynthesis: options.enableAliasSynthesis,
    enableLegacyEnrichment: options.enableLegacyEnrichment,
    enableRecoverySynthesis: options.enableRecoverySynthesis,
    wikipediaTitleIndexPolicy: options.wikipediaTitleIndexPolicy || options.wtiPolicy,
    collectDiagnostics: options.collectDiagnostics,
    emitWikipediaTitleIndexEvidence:
      options.emitWikipediaTitleIndexEvidence !== undefined ? options.emitWikipediaTitleIndexEvidence : options.emitWtiEvidence,
  });
  return finalizeGeneratedOutput({
    outputDoc,
    seedDir,
    mode: "runtime_step12",
    loadConceptCandidatesSchema: () => loadConceptCandidatesSchema(STEP13_DIR),
    validateSchema,
    validateConceptCandidatesDeterminism,
    serializeDeterministicYaml,
  });
}

function generateForStep12Path(step12Path, options = {}) {
  const { inputPath, doc: step12 } = loadStep12Yaml(step12Path);
  const seedDir = path.dirname(inputPath);
  const outputDoc = buildConceptCandidatesFromStep12(step12, {
    step13Mode: options.step13Mode,
    mode13bVerbPromotionMinWti: options.mode13bVerbPromotionMinWti,
    mode13bUnlinkedFiniteVerbPromotionMinWti: options.mode13bUnlinkedFiniteVerbPromotionMinWti,
    mode13bLowWtiUnlinkedMinAvg: options.mode13bLowWtiUnlinkedMinAvg,
    mode13bNonnominalShareMin: options.mode13bNonnominalShareMin,
    mode13bNonnominalWeakWtiMax: options.mode13bNonnominalWeakWtiMax,
    mode13bMergeHostMinWtiRatio: options.mode13bMergeHostMinWtiRatio,
    enableSupplemental: options.enableSupplemental,
    enableAliasSynthesis: options.enableAliasSynthesis,
    enableLegacyEnrichment: options.enableLegacyEnrichment,
    enableRecoverySynthesis: options.enableRecoverySynthesis,
    wikipediaTitleIndexPolicy: options.wikipediaTitleIndexPolicy || options.wtiPolicy,
    collectDiagnostics: options.collectDiagnostics,
    emitWikipediaTitleIndexEvidence:
      options.emitWikipediaTitleIndexEvidence !== undefined ? options.emitWikipediaTitleIndexEvidence : options.emitWtiEvidence,
  });
  return finalizeGeneratedOutput({
    outputDoc,
    seedDir,
    mode: "persisted_step12",
    step12Path: inputPath,
    loadConceptCandidatesSchema: () => loadConceptCandidatesSchema(STEP13_DIR),
    validateSchema,
    validateConceptCandidatesDeterminism,
    serializeDeterministicYaml,
  });
}

async function main() {
  try {
    const args = process.argv.slice(2);
    const {
      seedId,
      step12In,
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
      emitWikipediaTitleIndexEvidence,
      printOnly,
      runOptions,
    } = parseCliExecutionContext({
      args,
      env: process.env,
      arg,
      hasFlag,
      parseStepMode,
      parseNonNegativeNumberArg,
      step13Modes: STEP13_MODES,
      defaultArtifactsRoot: DEFAULT_ARTIFACTS_ROOT,
      defaultWikipediaTitleIndexEndpoint: DEFAULT_WIKIPEDIA_TITLE_INDEX_ENDPOINT,
    });

    if (!seedId && !step12In) {
      console.error(usage());
      process.exit(2);
    }

    const result = step12In ? generateForStep12Path(step12In, runOptions) : await generateForSeed(seedId, runOptions);
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
  } catch (err) {
    console.error(err && err.message ? err.message : String(err));
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  ROLE_KEYS,
  TOP_LEVEL_KEYS,
  CANDIDATE_KEYS,
  CANDIDATE_KEYS_WITH_WIKIPEDIA_TITLE_INDEX_EVIDENCE,
  COUNT_KEY_RE,
  canonicalizeSurface,
  conceptIdFromCanonical,
  buildConceptCandidatesFromStep12,
  validateConceptCandidatesDeterminism,
  validateSchema,
  serializeDeterministicYaml,
  generateForSeed,
  generateForStep12Path,
};
