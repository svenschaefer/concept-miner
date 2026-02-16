#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const YAML = require("yaml");

const STEP13_DIR = __dirname;
const DEFAULT_ARTIFACTS_ROOT = path.resolve(STEP13_DIR, "..", "artifacts");
const DEFAULT_BENCHMARK = path.join(STEP13_DIR, "independent.expected-concept-candidates.yaml");
const STEP13_MODES = new Set(["13a", "13b"]);

function usage() {
  return [
    "Usage:",
    "  node concept-candidates.independent-benchmark.js [--seed-id <id>] [--artifacts-root <path>]",
    "      [--step13-mode <13a|13b>] [--benchmark <path>] [--min-score <0..100>] [--no-verify-meta-mode] [--report-policy-intersections]",
  ].join("\n");
}

function arg(args, name) {
  const i = args.indexOf(name);
  if (i < 0 || i + 1 >= args.length) return null;
  return args[i + 1];
}

function sortStrings(values) {
  return [...values].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
}

function toSet(values) {
  return new Set((values || []).map((x) => String(x)));
}

function intersectionSorted(aSet, bSet) {
  const out = [];
  for (const v of aSet) {
    if (bSet.has(v)) out.push(v);
  }
  return sortStrings(out);
}

function fmtPct(x) {
  return `${(100 * x).toFixed(1)}%`;
}

function parseStep13Mode(raw) {
  const mode = String(raw || "13a");
  if (!STEP13_MODES.has(mode)) {
    throw new Error(`Invalid --step13-mode: ${mode}`);
  }
  return mode;
}

function scoreSeed(gotSet, spec) {
  const must = toSet(spec.must_have);
  const should = toSet(spec.should_have);
  const anti = toSet(spec.anti_targets);
  const neutral = toSet(spec.neutral);

  const mustHit = [...must].filter((x) => gotSet.has(x));
  const mustMiss = [...must].filter((x) => !gotSet.has(x));

  const shouldHit = [...should].filter((x) => gotSet.has(x));
  const shouldMiss = [...should].filter((x) => !gotSet.has(x));

  const antiHit = [...anti].filter((x) => gotSet.has(x));
  const neutralHit = [...neutral].filter((x) => gotSet.has(x));
  const neutralMiss = [...neutral].filter((x) => !gotSet.has(x));

  const mustRecall = must.size ? mustHit.length / must.size : 1;
  const shouldRecall = should.size ? shouldHit.length / should.size : 1;
  const antiSuppression = anti.size ? 1 - antiHit.length / anti.size : 1;

  const weighted =
    100 *
    (0.7 * mustRecall + 0.2 * shouldRecall + 0.1 * antiSuppression);

  return {
    must,
    should,
    anti,
    neutral,
    mustHit,
    mustMiss,
    shouldHit,
    shouldMiss,
    antiHit,
    neutralHit,
    neutralMiss,
    mustRecall,
    shouldRecall,
    antiSuppression,
    weighted,
  };
}

function main() {
  try {
    const args = process.argv.slice(2);
    const artifactsRoot = arg(args, "--artifacts-root") || DEFAULT_ARTIFACTS_ROOT;
    const step13Mode = parseStep13Mode(arg(args, "--step13-mode") || "13a");
    const benchmarkPath = arg(args, "--benchmark") || DEFAULT_BENCHMARK;
    const seedFilter = arg(args, "--seed-id");
    const minScoreRaw = arg(args, "--min-score");
    const minScore = minScoreRaw === null ? null : Number(minScoreRaw);
    const verifyMetaMode = !args.includes("--no-verify-meta-mode");
    const reportPolicyIntersections = args.includes("--report-policy-intersections");

    if (minScoreRaw !== null && !Number.isFinite(minScore)) {
      throw new Error(`Invalid --min-score: ${minScoreRaw}`);
    }

    if (!fs.existsSync(benchmarkPath)) {
      throw new Error(`Missing benchmark file: ${benchmarkPath}`);
    }
    const benchmark = YAML.parse(fs.readFileSync(benchmarkPath, "utf8")) || {};
    if (!benchmark.seeds || typeof benchmark.seeds !== "object") {
      throw new Error("Benchmark file missing seeds map.");
    }

    let seedIds = Object.keys(benchmark.seeds);
    if (seedFilter) {
      if (!benchmark.seeds[seedFilter]) {
        throw new Error(`Seed ${seedFilter} not found in benchmark file.`);
      }
      seedIds = [seedFilter];
    }
    seedIds = sortStrings(seedIds);

    let weightedSum = 0;
    let weightedCount = 0;
    const failures = [];

    for (const seedId of seedIds) {
      const outPath = path.join(artifactsRoot, seedId, "seed", `seed.concept-candidates.${step13Mode}.yaml`);
      if (!fs.existsSync(outPath)) {
        throw new Error(`Missing output artifact for ${seedId}: ${outPath}`);
      }
      if (verifyMetaMode) {
        const metaPath = path.join(artifactsRoot, seedId, "seed", `seed.concept-candidates.${step13Mode}.meta.json`);
        if (!fs.existsSync(metaPath)) {
          throw new Error(`Missing mode metadata for ${seedId}: ${metaPath}`);
        }
        const meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
        const metaMode = (((meta || {}).step13 || {}).step13_mode);
        if (metaMode !== step13Mode) {
          throw new Error(
            `Mode metadata mismatch for ${seedId}: expected ${step13Mode}, got ${String(metaMode)} (${metaPath})`
          );
        }
      }
      const out = YAML.parse(fs.readFileSync(outPath, "utf8")) || {};
      const gotSet = toSet((out.concept_candidates || []).map((c) => c.canonical));
      const s = scoreSeed(gotSet, benchmark.seeds[seedId] || {});

      weightedSum += s.weighted;
      weightedCount += 1;

      process.stdout.write(
        [
          `seed=${seedId}`,
          `mode=${step13Mode}`,
          `score=${s.weighted.toFixed(1)}`,
          `must=${s.mustHit.length}/${s.must.size} (${fmtPct(s.mustRecall)})`,
          `should=${s.shouldHit.length}/${s.should.size} (${fmtPct(s.shouldRecall)})`,
          `anti_ok=${s.anti.size - s.antiHit.length}/${s.anti.size} (${fmtPct(s.antiSuppression)})`,
          `neutral_present=${s.neutralHit.length}/${s.neutral.size}`,
          `got=${gotSet.size}`,
        ].join(" | ") + "\n"
      );

      if (s.mustMiss.length > 0) {
        process.stdout.write(`  must_missing: ${s.mustMiss.join(", ")}\n`);
      }
      if (s.antiHit.length > 0) {
        process.stdout.write(`  anti_present: ${s.antiHit.join(", ")}\n`);
      }
      if (reportPolicyIntersections && step13Mode === "13b") {
        const diagPath = path.join(artifactsRoot, seedId, "seed", `seed.concept-candidates.${step13Mode}.diag.json`);
        if (fs.existsSync(diagPath)) {
          const baseline13aPath = path.join(artifactsRoot, seedId, "seed", "seed.concept-candidates.13a.yaml");
          let baseline13aSet = new Set();
          if (fs.existsSync(baseline13aPath)) {
            const out13a = YAML.parse(fs.readFileSync(baseline13aPath, "utf8")) || {};
            baseline13aSet = toSet((out13a.concept_candidates || []).map((c) => c.canonical));
          }
          const diag = JSON.parse(fs.readFileSync(diagPath, "utf8")) || {};
          const mode13bByCanonical = (diag.mode13b_by_canonical && typeof diag.mode13b_by_canonical === "object")
            ? diag.mode13b_by_canonical
            : {};
          const promoted = new Set();
          const suppressed = new Set();
          for (const canonical of Object.keys(mode13bByCanonical)) {
            const hits = toSet((mode13bByCanonical[canonical] || {}).policy_hits || []);
            if (
              hits.has("promotion_verb_wikipedia_count")
              || hits.has("promotion_unlinked_finite_verb_wikipedia_count")
            ) promoted.add(canonical);
            if (
              hits.has("suppress_low_wikipedia_count_unlinked") ||
              hits.has("suppress_nonnominal_weak_wikipedia_count") ||
              hits.has("suppress_contained_stronger_host") ||
              hits.has("merge_into_stronger_host") ||
              hits.has("suppress_participial_fragment") ||
              hits.has("suppress_participial_chunk_reduction") ||
              hits.has("suppress_two_token_participial_lift") ||
              hits.has("suppress_short_symbolic_token")
            ) {
              if (!gotSet.has(canonical)) suppressed.add(canonical);
            }
          }
          const mustHitSet = new Set(s.mustHit);
          const mustMissSet = new Set(s.mustMiss);
          const antiHitSet = new Set(s.antiHit);
          const promotedMustHit = intersectionSorted(promoted, mustHitSet);
          const promotedMustMissing = intersectionSorted(promoted, mustMissSet);
          const suppressedMustHit = intersectionSorted(suppressed, mustHitSet);
          const suppressedMustMissing = intersectionSorted(suppressed, mustMissSet);
          const promotedAntiPresent = intersectionSorted(promoted, antiHitSet);
          const suppressedAntiPresent = intersectionSorted(suppressed, antiHitSet);
          const expectedMustSet = new Set(s.must);
          const antiTargetSet = new Set(s.anti);
          const promotedMustMissingNowPresent = [];
          const suppressedAntiPresentNowAbsent = [];
          for (const canonical of promoted) {
            if (expectedMustSet.has(canonical) && !baseline13aSet.has(canonical) && gotSet.has(canonical)) {
              promotedMustMissingNowPresent.push(canonical);
            }
          }
          for (const canonical of suppressed) {
            if (antiTargetSet.has(canonical) && baseline13aSet.has(canonical) && !gotSet.has(canonical)) {
              suppressedAntiPresentNowAbsent.push(canonical);
            }
          }
          const promotedMustMissingNowPresentSorted = sortStrings(promotedMustMissingNowPresent);
          const suppressedAntiPresentNowAbsentSorted = sortStrings(suppressedAntiPresentNowAbsent);
          process.stdout.write(
            `  policy_intersections: promoted_must_hit=${promotedMustHit.length} promoted_must_missing=${promotedMustMissing.length} ` +
            `suppressed_must_hit=${suppressedMustHit.length} suppressed_must_missing=${suppressedMustMissing.length} ` +
            `promoted_anti_present=${promotedAntiPresent.length} suppressed_anti_present=${suppressedAntiPresent.length} ` +
            `promoted_must_missing_now_present=${promotedMustMissingNowPresentSorted.length} ` +
            `suppressed_anti_present_now_absent=${suppressedAntiPresentNowAbsentSorted.length}\n`
          );
          if (promotedMustHit.length > 0) process.stdout.write(`    promoted_must_hit: ${promotedMustHit.join(", ")}\n`);
          if (promotedMustMissing.length > 0) process.stdout.write(`    promoted_must_missing: ${promotedMustMissing.join(", ")}\n`);
          if (suppressedMustHit.length > 0) process.stdout.write(`    suppressed_must_hit: ${suppressedMustHit.join(", ")}\n`);
          if (suppressedMustMissing.length > 0) process.stdout.write(`    suppressed_must_missing: ${suppressedMustMissing.join(", ")}\n`);
          if (promotedAntiPresent.length > 0) process.stdout.write(`    promoted_anti_present: ${promotedAntiPresent.join(", ")}\n`);
          if (suppressedAntiPresent.length > 0) process.stdout.write(`    suppressed_anti_present: ${suppressedAntiPresent.join(", ")}\n`);
          if (promotedMustMissingNowPresentSorted.length > 0) {
            process.stdout.write(`    promoted_must_missing_now_present: ${promotedMustMissingNowPresentSorted.join(", ")}\n`);
          }
          if (suppressedAntiPresentNowAbsentSorted.length > 0) {
            process.stdout.write(`    suppressed_anti_present_now_absent: ${suppressedAntiPresentNowAbsentSorted.join(", ")}\n`);
          }
        }
      }

      if (minScore !== null && s.weighted < minScore) {
        failures.push(`seed ${seedId} score ${s.weighted.toFixed(1)} below min ${minScore.toFixed(1)}`);
      }
    }

    const overall = weightedCount ? weightedSum / weightedCount : 0;
    process.stdout.write(`overall_score=${overall.toFixed(1)} (${weightedCount} seed(s))\n`);

    if (failures.length > 0) {
      throw new Error(failures.join("\n"));
    }
  } catch (err) {
    console.error(err && err.message ? err.message : String(err));
    console.error("\n" + usage());
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
