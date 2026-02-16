#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const YAML = require("yaml");

const { buildConceptCandidatesFromStep12 } = require("./concept-candidates");

const STEP13_DIR = __dirname;
const DEFAULT_ARTIFACTS_ROOT = path.resolve(STEP13_DIR, "..", "artifacts");
const DEFAULT_BENCHMARK = path.join(STEP13_DIR, "independent.expected-concept-candidates.yaml");
const DEFAULT_REPORT = path.join(STEP13_DIR, "13b-threshold-sweep.report.json");

function usage() {
  return [
    "Usage:",
    "  node concept-candidates.13b-threshold-sweep.js [--artifacts-root <path>] [--benchmark <path>] [--out <path>]",
    "      [--seed-id <id>] [--wikipedia-title-index-policy <assertion_then_lexicon_fallback|assertion_only>]",
    "      [--seed-id <id>] [--wti-policy <assertion_then_lexicon_fallback|assertion_only>]  # backward-compatible alias",
  ].join("\n");
}

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

function toSet(values) {
  return new Set((values || []).map((x) => String(x)));
}

function scoreSeed(gotSet, spec) {
  const must = toSet(spec.must_have);
  const should = toSet(spec.should_have);
  const anti = toSet(spec.anti_targets);

  const mustHit = [...must].filter((x) => gotSet.has(x));
  const shouldHit = [...should].filter((x) => gotSet.has(x));
  const antiHit = [...anti].filter((x) => gotSet.has(x));

  const mustRecall = must.size ? mustHit.length / must.size : 1;
  const shouldRecall = should.size ? shouldHit.length / should.size : 1;
  const antiSuppression = anti.size ? 1 - antiHit.length / anti.size : 1;
  const weighted = 100 * (0.7 * mustRecall + 0.2 * shouldRecall + 0.1 * antiSuppression);

  return {
    weighted,
    must_recall: mustRecall,
    should_recall: shouldRecall,
    anti_suppression: antiSuppression,
    got_count: gotSet.size,
  };
}

function fixed1(n) {
  return Math.round(Number(n) * 10) / 10;
}

function loadStep12ForSeed(artifactsRoot, seedId) {
  const p = path.join(artifactsRoot, seedId, "seed", "seed.elementary-assertions.yaml");
  if (!fs.existsSync(p)) {
    throw new Error(`Missing Step12 artifact for ${seedId}: ${p}`);
  }
  return YAML.parse(fs.readFileSync(p, "utf8"));
}

function loadBenchmark(benchmarkPath) {
  if (!fs.existsSync(benchmarkPath)) {
    throw new Error(`Missing benchmark file: ${benchmarkPath}`);
  }
  const benchmark = YAML.parse(fs.readFileSync(benchmarkPath, "utf8")) || {};
  if (!benchmark.seeds || typeof benchmark.seeds !== "object") {
    throw new Error("Benchmark file missing seeds map.");
  }
  return benchmark;
}

function main() {
  try {
    const args = process.argv.slice(2);
    const artifactsRoot = arg(args, "--artifacts-root") || DEFAULT_ARTIFACTS_ROOT;
    const benchmarkPath = arg(args, "--benchmark") || DEFAULT_BENCHMARK;
    const reportPath = arg(args, "--out") || DEFAULT_REPORT;
    const seedFilter = arg(args, "--seed-id");
    const wikipediaTitleIndexPolicy =
      arg(args, "--wikipedia-title-index-policy") || arg(args, "--wti-policy") || "assertion_then_lexicon_fallback";
    if (wikipediaTitleIndexPolicy !== "assertion_then_lexicon_fallback" && wikipediaTitleIndexPolicy !== "assertion_only") {
      throw new Error(`Invalid --wikipedia-title-index-policy: ${wikipediaTitleIndexPolicy}`);
    }

    const benchmark = loadBenchmark(benchmarkPath);
    let seedIds = Object.keys(benchmark.seeds).sort(compareStrings);
    if (seedFilter) {
      if (!benchmark.seeds[seedFilter]) throw new Error(`Seed ${seedFilter} not found in benchmark.`);
      seedIds = [seedFilter];
    }

    const step12BySeed = new Map();
    for (const seedId of seedIds) {
      step12BySeed.set(seedId, loadStep12ForSeed(artifactsRoot, seedId));
    }

    // Bounded deterministic sweep grid.
    const gridVerbPromotionMinWti = [1, 2, 3, 4];
    const gridUnlinkedFiniteVerbPromotionMinWti = [80, 120];
    const gridLowWtiUnlinkedMinAvg = [0.5, 1.0, 1.5];
    const gridNonnominalShareMin = [0.5, 0.6, 0.75];
    const gridNonnominalWeakWtiMax = [1.5, 2.0, 2.5];

    const results = [];
    for (const verbPromotionMinWti of gridVerbPromotionMinWti) {
      for (const unlinkedFiniteVerbPromotionMinWti of gridUnlinkedFiniteVerbPromotionMinWti) {
        for (const lowWtiUnlinkedMinAvg of gridLowWtiUnlinkedMinAvg) {
          for (const nonnominalShareMin of gridNonnominalShareMin) {
            for (const nonnominalWeakWtiMax of gridNonnominalWeakWtiMax) {
            const perSeed = Object.create(null);
            let overallSum = 0;
            for (const seedId of seedIds) {
              const step12 = step12BySeed.get(seedId);
              const out = buildConceptCandidatesFromStep12(step12, {
                step13Mode: "13b",
                wikipediaTitleIndexPolicy,
                emitWikipediaTitleIndexEvidence: false,
                mode13bVerbPromotionMinWti: verbPromotionMinWti,
                mode13bUnlinkedFiniteVerbPromotionMinWti: unlinkedFiniteVerbPromotionMinWti,
                mode13bLowWtiUnlinkedMinAvg: lowWtiUnlinkedMinAvg,
                mode13bNonnominalShareMin: nonnominalShareMin,
                mode13bNonnominalWeakWtiMax: nonnominalWeakWtiMax,
              });
              const gotSet = toSet((out.concept_candidates || []).map((c) => c.canonical));
              const score = scoreSeed(gotSet, benchmark.seeds[seedId] || {});
              perSeed[seedId] = {
                weighted: fixed1(score.weighted),
                must_recall: fixed1(score.must_recall * 100),
                should_recall: fixed1(score.should_recall * 100),
                anti_suppression: fixed1(score.anti_suppression * 100),
                got_count: score.got_count,
              };
              overallSum += score.weighted;
            }
            const overall = seedIds.length ? (overallSum / seedIds.length) : 0;
            results.push({
              thresholds: {
                verb_promotion_min_wikipedia_count: verbPromotionMinWti,
                unlinked_finite_verb_promotion_min_wikipedia_count: unlinkedFiniteVerbPromotionMinWti,
                low_wikipedia_count_unlinked_min_avg: lowWtiUnlinkedMinAvg,
                nonnominal_share_min: nonnominalShareMin,
                nonnominal_weak_wikipedia_count_max: nonnominalWeakWtiMax,
              },
              overall_weighted: fixed1(overall),
              per_seed: perSeed,
            });
            }
          }
        }
      }
    }

    results.sort((a, b) => {
      if (b.overall_weighted !== a.overall_weighted) return b.overall_weighted - a.overall_weighted;
      const sa = ((a.per_seed.saas || {}).weighted || 0);
      const sb = ((b.per_seed.saas || {}).weighted || 0);
      if (sb !== sa) return sb - sa;
      const at = a.thresholds;
      const bt = b.thresholds;
      if (at.verb_promotion_min_wikipedia_count !== bt.verb_promotion_min_wikipedia_count) {
        return at.verb_promotion_min_wikipedia_count - bt.verb_promotion_min_wikipedia_count;
      }
      if (at.unlinked_finite_verb_promotion_min_wikipedia_count !== bt.unlinked_finite_verb_promotion_min_wikipedia_count) {
        return at.unlinked_finite_verb_promotion_min_wikipedia_count - bt.unlinked_finite_verb_promotion_min_wikipedia_count;
      }
      if (at.low_wikipedia_count_unlinked_min_avg !== bt.low_wikipedia_count_unlinked_min_avg) {
        return at.low_wikipedia_count_unlinked_min_avg - bt.low_wikipedia_count_unlinked_min_avg;
      }
      if (at.nonnominal_share_min !== bt.nonnominal_share_min) return at.nonnominal_share_min - bt.nonnominal_share_min;
      return at.nonnominal_weak_wikipedia_count_max - bt.nonnominal_weak_wikipedia_count_max;
    });

    const chosen = results[0] || null;
    const report = {
      schema_version: 1,
      benchmark_path: path.resolve(benchmarkPath),
      artifacts_root: path.resolve(artifactsRoot),
      step13_mode: "13b",
      wikipedia_title_index_policy: wikipediaTitleIndexPolicy,
      seeds: seedIds,
      grid: {
        verb_promotion_min_wikipedia_count: gridVerbPromotionMinWti,
        unlinked_finite_verb_promotion_min_wikipedia_count: gridUnlinkedFiniteVerbPromotionMinWti,
        low_wikipedia_count_unlinked_min_avg: gridLowWtiUnlinkedMinAvg,
        nonnominal_share_min: gridNonnominalShareMin,
        nonnominal_weak_wikipedia_count_max: gridNonnominalWeakWtiMax,
      },
      selection_rule:
        "maximize overall_weighted; tie-break by saas weighted; then lexicographic ascending thresholds",
      chosen_thresholds: chosen ? chosen.thresholds : null,
      chosen_scores: chosen ? { overall_weighted: chosen.overall_weighted, per_seed: chosen.per_seed } : null,
      results,
    };

    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(path.resolve(reportPath), `${JSON.stringify(report, null, 2)}\n`, "utf8");
    process.stdout.write(
      `Wrote ${path.resolve(reportPath)} (configs=${results.length}, best_overall=${chosen ? chosen.overall_weighted : "n/a"})\n`
    );
  } catch (err) {
    console.error(err && err.message ? err.message : String(err));
    console.error("\n" + usage());
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
