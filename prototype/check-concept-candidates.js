#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const YAML = require("yaml");
const {
  TOP_LEVEL_KEYS,
  CANDIDATE_KEYS,
  CANDIDATE_KEYS_WITH_WIKIPEDIA_TITLE_INDEX_EVIDENCE,
  validateSchema,
  validateConceptCandidatesDeterminism,
} = require("./concept-candidates");

const DEFAULT_ARTIFACTS_ROOT = path.resolve(__dirname, "..", "artifacts");
const SCHEMA_PATH = path.join(__dirname, "seed.concept-candidates.schema.json");

function usage() {
  return "Usage: node check-concept-candidates.js --seed-id <id> [--artifacts-root <path>] [--step13-mode <13a|13b>] [--in <path>]";
}

function arg(args, name) {
  const i = args.indexOf(name);
  if (i < 0 || i + 1 >= args.length) return null;
  return args[i + 1];
}

function ensureKeyOrderViaText(yamlText) {
  const topOrder = TOP_LEVEL_KEYS.map((k) => {
    const atStart = yamlText.startsWith(`${k}:`) ? 0 : -1;
    if (atStart === 0) return 0;
    return yamlText.indexOf(`\n${k}:`);
  });
  for (let i = 0; i < topOrder.length; i += 1) {
    if (topOrder[i] < 0) {
      throw new Error(`Missing top-level key in YAML text: ${TOP_LEVEL_KEYS[i]}`);
    }
    if (i > 0 && topOrder[i - 1] > topOrder[i]) {
      throw new Error("Top-level YAML key order is not deterministic.");
    }
  }

  const candidateBlocks = yamlText.split("\n- concept_id:");
  for (let i = 1; i < candidateBlocks.length; i += 1) {
    const block = `- concept_id:${candidateBlocks[i]}`;
    let prev = -1;
    const keys = block.includes("\n  wikipedia_title_index_evidence:")
      ? CANDIDATE_KEYS_WITH_WIKIPEDIA_TITLE_INDEX_EVIDENCE
      : CANDIDATE_KEYS;
    for (const key of keys) {
      const needle = key === "concept_id" ? "- concept_id:" : `  ${key}:`;
      const idx = block.indexOf(needle);
      if (idx < 0) throw new Error(`Candidate YAML block missing key: ${key}`);
      if (prev > idx) throw new Error(`Candidate YAML key order is not deterministic for key ${key}.`);
      prev = idx;
    }
  }
}

function main() {
  try {
    const args = process.argv.slice(2);
    const seedId = arg(args, "--seed-id");
    const artifactsRoot = arg(args, "--artifacts-root") || DEFAULT_ARTIFACTS_ROOT;
    const step13Mode = arg(args, "--step13-mode") || "13b";
    if (step13Mode !== "13a" && step13Mode !== "13b") {
      throw new Error(`Invalid --step13-mode: ${step13Mode}`);
    }
    const inputPath =
      arg(args, "--in") ||
      (seedId ? path.join(artifactsRoot, seedId, "seed", `seed.concept-candidates.${step13Mode}.yaml`) : null);

    if (!inputPath || !seedId) {
      console.error(usage());
      process.exit(2);
    }
    if (!fs.existsSync(inputPath)) {
      throw new Error(`Missing concept candidates artifact: ${inputPath}`);
    }

    const yamlText = fs.readFileSync(inputPath, "utf8");
    const doc = YAML.parse(yamlText);
    const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, "utf8"));

    validateSchema(schema, doc);
    validateConceptCandidatesDeterminism(doc);
    ensureKeyOrderViaText(yamlText);

    process.stdout.write(`Concept candidates validation OK (${doc.concept_candidates.length} candidates)\n`);
  } catch (err) {
    console.error(err && err.message ? err.message : String(err));
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
