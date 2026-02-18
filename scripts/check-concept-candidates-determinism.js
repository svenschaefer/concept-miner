#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const YAML = require("yaml");
const {
  TOP_LEVEL_KEYS,
  CANDIDATE_KEYS,
  CANDIDATE_KEYS_WITH_WIKIPEDIA_TITLE_INDEX_EVIDENCE,
  validateSchema,
  validateConceptCandidatesDeterminism,
} = require("../src/core/step13");

function usage() {
  return [
    "Usage:",
    "  node scripts/check-concept-candidates-determinism.js --in <path>",
    "      [--schema <path>]",
  ].join("\n");
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
    if (topOrder[i] < 0) throw new Error(`Missing top-level key in YAML text: ${TOP_LEVEL_KEYS[i]}`);
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
  const args = process.argv.slice(2);
  const inputPath = arg(args, "--in");
  const schemaPath = path.resolve(
    arg(args, "--schema") || path.join(__dirname, "..", "schema", "seed.concept-candidates.schema.json")
  );
  if (!inputPath) {
    throw new Error(usage());
  }
  const inPath = path.resolve(inputPath);
  if (!fs.existsSync(inPath)) throw new Error(`Missing concept candidates artifact: ${inPath}`);
  if (!fs.existsSync(schemaPath)) throw new Error(`Missing schema: ${schemaPath}`);

  const yamlText = fs.readFileSync(inPath, "utf8");
  const doc = YAML.parse(yamlText);
  const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));

  validateSchema(schema, doc);
  validateConceptCandidatesDeterminism(doc);
  ensureKeyOrderViaText(yamlText);

  process.stdout.write(`Concept candidates determinism/schema check OK (${doc.concept_candidates.length} candidates)\n`);
}

try {
  main();
} catch (err) {
  process.stderr.write(`${err && err.message ? err.message : String(err)}\n`);
  process.exit(1);
}
