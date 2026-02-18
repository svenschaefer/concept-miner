#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const YAML = require("yaml");
const { extractConcepts } = require("../src");

function usage() {
  return [
    "Usage:",
    "  node scripts/concept-candidates.independent-benchmark.js [--seed-id <id>] [--artifacts-root <path>]",
    "      [--benchmark <path>] [--min-score <0..100>] [--report-policy-intersections]",
    "",
    "Notes:",
    "  - Product stream supports only default-extended (13b-equivalent) behavior.",
    "  - By default this script enforces exact 100.0 score per seed.",
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

  const mustRecall = must.size ? mustHit.length / must.size : 1;
  const shouldRecall = should.size ? shouldHit.length / should.size : 1;
  const antiSuppression = anti.size ? 1 - antiHit.length / anti.size : 1;
  const weighted = 100 * (0.7 * mustRecall + 0.2 * shouldRecall + 0.1 * antiSuppression);

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
    mustRecall,
    shouldRecall,
    antiSuppression,
    weighted,
  };
}

function loadOptionalDiagnostics(artifactsRoot, seedId) {
  const diagPath = path.join(
    artifactsRoot,
    seedId,
    "result-reference",
    "seed.concept-candidates.13b.diag.json"
  );
  if (!fs.existsSync(diagPath)) return null;
  return JSON.parse(fs.readFileSync(diagPath, "utf8"));
}

function summarizePolicyIntersections(diag, score) {
  if (!diag || typeof diag !== "object") return null;
  const byCanonical = (diag.mode13b_by_canonical && typeof diag.mode13b_by_canonical === "object")
    ? diag.mode13b_by_canonical
    : {};

  const promoted = new Set();
  const suppressed = new Set();

  for (const canonical of Object.keys(byCanonical)) {
    const hits = toSet((byCanonical[canonical] || {}).policy_hits || []);
    if (
      hits.has("promotion_verb_wikipedia_count")
      || hits.has("promotion_predicate_verb_wikipedia_count")
      || hits.has("promotion_unlinked_finite_verb_wikipedia_count")
    ) {
      promoted.add(canonical);
    }
    if (
      hits.has("suppress_low_wikipedia_count_unlinked")
      || hits.has("suppress_nonnominal_weak_wikipedia_count")
      || hits.has("suppress_contained_stronger_host")
      || hits.has("merge_into_stronger_host")
      || hits.has("suppress_participial_fragment")
      || hits.has("suppress_participial_chunk_reduction")
      || hits.has("suppress_two_token_participial_lift")
      || hits.has("suppress_short_symbolic_token")
      || hits.has("suppress_function_leading_fragment")
      || hits.has("suppress_quantifier_led_fragment")
      || hits.has("suppress_alias_function_leading_fragment")
    ) {
      suppressed.add(canonical);
    }
  }

  const mustHit = intersectionSorted(promoted, new Set(score.mustHit));
  const mustMissing = intersectionSorted(promoted, new Set(score.mustMiss));
  const antiPresentPromoted = intersectionSorted(promoted, new Set(score.antiHit));
  const antiPresentSuppressed = intersectionSorted(suppressed, new Set(score.antiHit));

  return {
    promoted_must_hit: mustHit,
    promoted_must_missing: mustMissing,
    promoted_anti_present: antiPresentPromoted,
    suppressed_anti_present: antiPresentSuppressed,
  };
}

async function main() {
  const args = process.argv.slice(2);
  const benchmarkPath = path.resolve(
    arg(args, "--benchmark")
    || path.join(__dirname, "..", "test", "benchmark", "independent.expected-concept-candidates.yaml")
  );
  const artifactsRoot = path.resolve(arg(args, "--artifacts-root") || path.join(__dirname, "..", "test", "artifacts"));
  const seedFilter = arg(args, "--seed-id");
  const minScoreRaw = arg(args, "--min-score");
  const reportPolicyIntersections = args.includes("--report-policy-intersections");
  const minScore = minScoreRaw === null ? 100 : Number(minScoreRaw);

  if (!Number.isFinite(minScore) || minScore < 0 || minScore > 100) {
    throw new Error(`Invalid --min-score: ${String(minScoreRaw)}`);
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
      throw new Error(`Seed ${seedFilter} not found in benchmark.`);
    }
    seedIds = [seedFilter];
  }
  seedIds = sortStrings(seedIds);

  let weightedSum = 0;
  let weightedCount = 0;
  const failures = [];

  for (const seedId of seedIds) {
    const doc = await extractConcepts("", {
      seedId,
      artifactsRoot,
      mode: "default-extended",
    });
    const gotSet = toSet((doc.concepts || []).map((c) => c.name));
    const score = scoreSeed(gotSet, benchmark.seeds[seedId] || {});
    weightedSum += score.weighted;
    weightedCount += 1;

    process.stdout.write(
      `seed=${seedId} | mode=13b | score=${score.weighted.toFixed(1)}`
      + ` | must=${score.mustHit.length}/${score.must.size}`
      + ` | should=${score.shouldHit.length}/${score.should.size}`
      + ` | anti_ok=${(score.anti.size - score.antiHit.length)}/${score.anti.size}`
      + ` | neutral_present=${score.neutralHit.length}/${score.neutral.size}\n`
    );
    if (score.mustMiss.length > 0) process.stdout.write(`  must_missing: ${sortStrings(score.mustMiss).join(", ")}\n`);
    if (score.shouldMiss.length > 0) process.stdout.write(`  should_missing: ${sortStrings(score.shouldMiss).join(", ")}\n`);
    if (score.antiHit.length > 0) process.stdout.write(`  anti_present: ${sortStrings(score.antiHit).join(", ")}\n`);

    if (reportPolicyIntersections) {
      const intersections = summarizePolicyIntersections(loadOptionalDiagnostics(artifactsRoot, seedId), score);
      if (intersections) {
        process.stdout.write(
          `  policy_intersections: promoted_must_hit=${intersections.promoted_must_hit.length}`
          + ` promoted_must_missing=${intersections.promoted_must_missing.length}`
          + ` promoted_anti_present=${intersections.promoted_anti_present.length}`
          + ` suppressed_anti_present=${intersections.suppressed_anti_present.length}\n`
        );
      }
    }

    if ((score.weighted + 1e-9) < minScore) {
      failures.push(`seed ${seedId} score ${score.weighted.toFixed(1)} below min ${minScore.toFixed(1)}`);
    }
  }

  const overall = weightedCount ? weightedSum / weightedCount : 0;
  process.stdout.write(`overall_score=${overall.toFixed(1)} (${weightedCount} seed(s))\n`);
  if (failures.length > 0) {
    throw new Error(failures.join("\n"));
  }
}

main().catch((err) => {
  process.stderr.write(`${err && err.message ? err.message : String(err)}\n`);
  process.stderr.write(`${usage()}\n`);
  process.exitCode = 1;
});
