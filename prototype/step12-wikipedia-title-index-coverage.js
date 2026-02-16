#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const YAML = require("yaml");

const DEFAULT_ARTIFACTS_ROOT = path.resolve(__dirname, "..", "artifacts");
const DEFAULT_REPORT_PATH = path.join(__dirname, "step12-wikipedia-title-index.coverage.report.json");
const SIGNAL_RE = /^wiki_[A-Za-z0-9_]+$/;
const COUNT_RE = /^wiki_[A-Za-z0-9_]+_count$/;

function arg(args, name) {
  const i = args.indexOf(name);
  if (i < 0 || i + 1 >= args.length) return null;
  return args[i + 1];
}

function compareStrings(a, b) {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

function walkSignals(node, fn) {
  if (Array.isArray(node)) {
    for (const item of node) walkSignals(item, fn);
    return;
  }
  if (!node || typeof node !== "object") return;
  for (const [key, value] of Object.entries(node)) {
    if (SIGNAL_RE.test(key)) fn(key, value);
    walkSignals(value, fn);
  }
}

function selectedSignalObject(assertionSignals, lexiconSignals, policy) {
  if (policy === "assertion_only") return assertionSignals || {};
  if (assertionSignals && Object.keys(assertionSignals).length > 0) return assertionSignals;
  return lexiconSignals || {};
}

function countTotals(signals) {
  let sum = 0;
  for (const [k, v] of Object.entries(signals || {})) {
    if (COUNT_RE.test(k) && Number.isInteger(v) && v > 0) sum += v;
  }
  return sum;
}

function hasAnyTrueBoolean(signals) {
  for (const [k, v] of Object.entries(signals || {})) {
    if (SIGNAL_RE.test(k) && !COUNT_RE.test(k) && v === true) return true;
  }
  return false;
}

function bucket(total) {
  if (total <= 0) return "0";
  if (total < 10) return "1-9";
  if (total < 100) return "10-99";
  return "100+";
}

function gatherMentionAssertionSignals(step12) {
  const out = new Map();
  const assertions = Array.isArray(step12.assertions) ? step12.assertions : [];
  for (let ai = 0; ai < assertions.length; ai += 1) {
    const mentionEvidence = ((((assertions[ai] || {}).evidence || {}).wiki_signals || {}).mention_evidence) || [];
    for (let mi = 0; mi < mentionEvidence.length; mi += 1) {
      const entry = mentionEvidence[mi] || {};
      const mentionId = String(entry.mention_id || "");
      if (!mentionId) continue;
      if (!out.has(mentionId)) out.set(mentionId, Object.create(null));
      const bucketObj = out.get(mentionId);
      walkSignals(entry.evidence, (k, v) => {
        if (COUNT_RE.test(k)) {
          if (!Number.isInteger(v)) return;
          bucketObj[k] = (bucketObj[k] || 0) + v;
        } else if (typeof v === "boolean") {
          bucketObj[k] = Boolean(bucketObj[k]) || v;
        }
      });
    }
  }
  return out;
}

function gatherMentionLexiconSignals(step12) {
  const out = new Map();
  const mentions = Array.isArray(step12.mentions) ? step12.mentions : [];
  for (let mi = 0; mi < mentions.length; mi += 1) {
    const mention = mentions[mi] || {};
    const mentionId = String(mention.id || "");
    if (!mentionId) continue;
    const lexiconEvidence = ((mention.provenance || {}).lexicon_evidence || null);
    if (!lexiconEvidence) continue;
    const bucketObj = Object.create(null);
    walkSignals(lexiconEvidence, (k, v) => {
      if (COUNT_RE.test(k)) {
        if (!Number.isInteger(v)) return;
        bucketObj[k] = (bucketObj[k] || 0) + v;
      } else if (typeof v === "boolean") {
        bucketObj[k] = Boolean(bucketObj[k]) || v;
      }
    });
    if (Object.keys(bucketObj).length > 0) out.set(mentionId, bucketObj);
  }
  return out;
}

function round1(n) {
  return Math.round(Number(n) * 10) / 10;
}

function buildSeedCoverage(step12, policy) {
  const mentions = Array.isArray(step12.mentions) ? step12.mentions : [];
  const assertions = Array.isArray(step12.assertions) ? step12.assertions : [];
  const assertionSignalsByMention = gatherMentionAssertionSignals(step12);
  const lexiconSignalsByMention = gatherMentionLexiconSignals(step12);
  const bins = { "0": 0, "1-9": 0, "10-99": 0, "100+": 0 };
  let selectedNonZeroCount = 0;
  let selectedAnySignal = 0;
  let assertionSignalMentions = 0;
  let lexiconSignalMentions = 0;
  for (const mention of mentions) {
    const mentionId = String((mention || {}).id || "");
    if (!mentionId) continue;
    const assertionSignals = assertionSignalsByMention.get(mentionId) || {};
    const lexiconSignals = lexiconSignalsByMention.get(mentionId) || {};
    if (Object.keys(assertionSignals).length > 0) assertionSignalMentions += 1;
    if (Object.keys(lexiconSignals).length > 0) lexiconSignalMentions += 1;
    const selected = selectedSignalObject(assertionSignals, lexiconSignals, policy);
    const total = countTotals(selected);
    bins[bucket(total)] += 1;
    if (total > 0) selectedNonZeroCount += 1;
    if (total > 0 || hasAnyTrueBoolean(selected)) selectedAnySignal += 1;
  }

  let assertionsWithSignals = 0;
  let assertionsWithMentionEvidence = 0;
  for (const assertion of assertions) {
    const mentionEvidence = ((((assertion || {}).evidence || {}).wiki_signals || {}).mention_evidence) || [];
    if (mentionEvidence.length > 0) assertionsWithMentionEvidence += 1;
    let hasSignals = false;
    for (const entry of mentionEvidence) {
      walkSignals(entry.evidence, () => {
        hasSignals = true;
      });
      if (hasSignals) break;
    }
    if (hasSignals) assertionsWithSignals += 1;
  }

  const mentionTotal = mentions.length || 1;
  const assertionTotal = assertions.length || 1;
  return {
    mentions_total: mentions.length,
    assertions_total: assertions.length,
    mention_signal_coverage: {
      selected_nonzero_count_mentions: selectedNonZeroCount,
      selected_nonzero_count_pct: round1((selectedNonZeroCount / mentionTotal) * 100),
      selected_any_signal_mentions: selectedAnySignal,
      selected_any_signal_pct: round1((selectedAnySignal / mentionTotal) * 100),
      assertion_signal_mentions: assertionSignalMentions,
      assertion_signal_pct: round1((assertionSignalMentions / mentionTotal) * 100),
      lexicon_signal_mentions: lexiconSignalMentions,
      lexicon_signal_pct: round1((lexiconSignalMentions / mentionTotal) * 100),
      selected_count_buckets: bins,
    },
    assertion_signal_coverage: {
      assertions_with_mention_evidence: assertionsWithMentionEvidence,
      assertions_with_mention_evidence_pct: round1((assertionsWithMentionEvidence / assertionTotal) * 100),
      assertions_with_any_wikipedia_signal: assertionsWithSignals,
      assertions_with_any_wikipedia_signal_pct: round1((assertionsWithSignals / assertionTotal) * 100),
    },
  };
}

function main() {
  try {
    const args = process.argv.slice(2);
    const artifactsRoot = path.resolve(arg(args, "--artifacts-root") || DEFAULT_ARTIFACTS_ROOT);
    const reportPath = path.resolve(arg(args, "--out") || DEFAULT_REPORT_PATH);
    const policy = String(arg(args, "--wikipedia-title-index-policy") || "assertion_then_lexicon_fallback");
    if (!["assertion_then_lexicon_fallback", "assertion_only"].includes(policy)) {
      throw new Error(`Invalid --wikipedia-title-index-policy: ${policy}`);
    }

    const seeds = [];
    const seedDirs = fs.readdirSync(artifactsRoot, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort(compareStrings);
    for (const seedId of seedDirs) {
      const step12Path = path.join(artifactsRoot, seedId, "seed", "seed.elementary-assertions.yaml");
      if (!fs.existsSync(step12Path)) continue;
      const step12 = YAML.parse(fs.readFileSync(step12Path, "utf8")) || {};
      const coverage = buildSeedCoverage(step12, policy);
      seeds.push({
        seed_id: seedId,
        ...coverage,
      });
    }

    const totals = {
      seeds: seeds.length,
      mentions_total: 0,
      assertions_total: 0,
      selected_nonzero_count_mentions: 0,
      selected_any_signal_mentions: 0,
      assertion_signal_mentions: 0,
      lexicon_signal_mentions: 0,
      assertions_with_mention_evidence: 0,
      assertions_with_any_wikipedia_signal: 0,
      selected_count_buckets: { "0": 0, "1-9": 0, "10-99": 0, "100+": 0 },
    };

    for (const s of seeds) {
      totals.mentions_total += s.mentions_total;
      totals.assertions_total += s.assertions_total;
      totals.selected_nonzero_count_mentions += s.mention_signal_coverage.selected_nonzero_count_mentions;
      totals.selected_any_signal_mentions += s.mention_signal_coverage.selected_any_signal_mentions;
      totals.assertion_signal_mentions += s.mention_signal_coverage.assertion_signal_mentions;
      totals.lexicon_signal_mentions += s.mention_signal_coverage.lexicon_signal_mentions;
      totals.assertions_with_mention_evidence += s.assertion_signal_coverage.assertions_with_mention_evidence;
      totals.assertions_with_any_wikipedia_signal += s.assertion_signal_coverage.assertions_with_any_wikipedia_signal;
      for (const k of Object.keys(totals.selected_count_buckets)) {
        totals.selected_count_buckets[k] += s.mention_signal_coverage.selected_count_buckets[k] || 0;
      }
    }

    const mentionTotal = totals.mentions_total || 1;
    const assertionTotal = totals.assertions_total || 1;
    const report = {
      schema_version: 1,
      artifacts_root: artifactsRoot,
      wikipedia_title_index_policy: policy,
      generated_at_utc: new Date().toISOString(),
      aggregate: {
        ...totals,
        selected_nonzero_count_pct: round1((totals.selected_nonzero_count_mentions / mentionTotal) * 100),
        selected_any_signal_pct: round1((totals.selected_any_signal_mentions / mentionTotal) * 100),
        assertion_signal_pct: round1((totals.assertion_signal_mentions / mentionTotal) * 100),
        lexicon_signal_pct: round1((totals.lexicon_signal_mentions / mentionTotal) * 100),
        assertions_with_mention_evidence_pct: round1((totals.assertions_with_mention_evidence / assertionTotal) * 100),
        assertions_with_any_wikipedia_signal_pct: round1((totals.assertions_with_any_wikipedia_signal / assertionTotal) * 100),
      },
      seeds,
    };

    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
    process.stdout.write(`Wrote ${reportPath} (seeds=${seeds.length})\n`);
  } catch (err) {
    console.error(err && err.message ? err.message : String(err));
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
