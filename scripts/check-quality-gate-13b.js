#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const YAML = require("yaml");
const { extractConcepts } = require("../src");

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

function scoreSeed(gotSet, spec) {
  const must = toSet(spec.must_have);
  const should = toSet(spec.should_have);
  const anti = toSet(spec.anti_targets);

  const mustHit = [...must].filter((x) => gotSet.has(x));
  const mustMiss = [...must].filter((x) => !gotSet.has(x));
  const shouldHit = [...should].filter((x) => gotSet.has(x));
  const shouldMiss = [...should].filter((x) => !gotSet.has(x));
  const antiHit = [...anti].filter((x) => gotSet.has(x));

  const mustRecall = must.size ? mustHit.length / must.size : 1;
  const shouldRecall = should.size ? shouldHit.length / should.size : 1;
  const antiSuppression = anti.size ? 1 - antiHit.length / anti.size : 1;
  const weighted = 100 * (0.7 * mustRecall + 0.2 * shouldRecall + 0.1 * antiSuppression);

  return {
    must,
    should,
    anti,
    mustMiss,
    shouldMiss,
    antiHit,
    mustRecall,
    shouldRecall,
    antiSuppression,
    weighted,
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
      + ` | must=${(score.must.size - score.mustMiss.length)}/${score.must.size}`
      + ` | should=${(score.should.size - score.shouldMiss.length)}/${score.should.size}`
      + ` | anti_ok=${(score.anti.size - score.antiHit.length)}/${score.anti.size}\n`
    );
    if (score.mustMiss.length > 0) {
      process.stdout.write(`  must_missing: ${sortStrings(score.mustMiss).join(", ")}\n`);
    }
    if (score.shouldMiss.length > 0) {
      process.stdout.write(`  should_missing: ${sortStrings(score.shouldMiss).join(", ")}\n`);
    }
    if (score.antiHit.length > 0) {
      process.stdout.write(`  anti_present: ${sortStrings(score.antiHit).join(", ")}\n`);
    }

    if (Math.abs(score.weighted - 100) > 1e-9) {
      failures.push(`seed ${seedId} scored ${score.weighted.toFixed(1)} (required: 100.0)`);
    }
  }

  const overall = weightedCount ? weightedSum / weightedCount : 0;
  process.stdout.write(`overall_score=${overall.toFixed(1)} (${weightedCount} seed(s))\n`);

  if (failures.length > 0) {
    throw new Error(`13b quality gate failed:\n${failures.join("\n")}`);
  }
}

main().catch((err) => {
  process.stderr.write(`${err && err.message ? err.message : String(err)}\n`);
  process.exitCode = 1;
});
