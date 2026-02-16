const { runMain, runFromInput } = require("../run");
const { extractConcepts, validateConcepts } = require("../concepts");
const { validateOutput } = require("../validate");
const { arg, readUtf8, writeUtf8 } = require("./io");
const { loadProjectConfig } = require("./config");

function usage() {
  return [
    "Usage:",
    "  concept-miner extract --text <string> [--out <path>] [--mode <generic-baseline|default-extended>] [--config <path>]",
    "  concept-miner extract --seed-id <id> [--artifacts-root <path>] [--out <path>] [--mode <generic-baseline|default-extended>] [--config <path>]",
    "  concept-miner extract --step12-in <path> [--out <path>] [--mode <generic-baseline|default-extended>] [--config <path>]",
    "  concept-miner validate-concepts --in <path>",
    "",
    "Compatibility commands:",
    "  concept-miner run --text <string> | --in <path> [--out <path>] [--config <path>]",
    "  concept-miner validate --in <path>",
  ].join("\n");
}

function normalizeModeValue(modeRaw) {
  if (modeRaw === "generic_baseline" || modeRaw === "generic-baseline") {
    return "generic_baseline";
  }
  if (modeRaw === "default_extended" || modeRaw === "default-extended") {
    return "default_extended";
  }
  return "default_extended";
}

async function runCommand(args) {
  const text = arg(args, "--text");
  const inPath = arg(args, "--in");
  const outPath = arg(args, "--out");
  const configPath = arg(args, "--config");

  const hasText = typeof text === "string";
  const hasIn = typeof inPath === "string";
  if (Number(hasText) + Number(hasIn) !== 1) {
    throw new Error("Exactly one of --text or --in is required.");
  }

  const { config } = loadProjectConfig({
    configPath,
    requireExists: typeof configPath === "string" && configPath.length > 0,
  });

  let doc;
  if (hasText) {
    doc = await runMain(text, { config });
  } else {
    const raw = readUtf8(inPath, "input file");
    const input = JSON.parse(raw);
    doc = runFromInput(input, { config });
  }

  const output = JSON.stringify(doc, null, 2) + "\n";
  if (outPath) writeUtf8(outPath, output);
  else process.stdout.write(output);
}

function validateCommand(args) {
  const inPath = arg(args, "--in");
  if (!inPath) throw new Error("validate requires --in <path>");
  const raw = readUtf8(inPath, "input file");
  const doc = JSON.parse(raw);
  const conceptsResult = validateConcepts(doc);
  if (conceptsResult.ok) {
    process.stdout.write("ok\n");
    return;
  }

  // Backward-compatible fallback for legacy template output documents.
  validateOutput(doc);
  process.stdout.write("ok\n");
}

async function extractCommand(args) {
  const text = arg(args, "--text");
  const seedId = arg(args, "--seed-id");
  const step12Path = arg(args, "--step12-in");
  const artifactsRoot = arg(args, "--artifacts-root");
  const modeRaw = arg(args, "--mode");
  const outPath = arg(args, "--out");
  const configPath = arg(args, "--config");

  const mode = normalizeModeValue(modeRaw);

  if (!text && !seedId && !step12Path) {
    throw new Error("extract requires one of --text, --seed-id, or --step12-in.");
  }

  const { config } = loadProjectConfig({
    configPath,
    requireExists: typeof configPath === "string" && configPath.length > 0,
  });

  const doc = await extractConcepts(text || "", {
    mode,
    seedId,
    step12Path,
    artifactsRoot,
    includeDiagnostics: false,
    ...(config || {}),
  });

  const output = JSON.stringify(doc, null, 2) + "\n";
  if (outPath) writeUtf8(outPath, output);
  else process.stdout.write(output);
}

function validateConceptsCommand(args) {
  const inPath = arg(args, "--in");
  if (!inPath) throw new Error("validate-concepts requires --in <path>");
  const raw = readUtf8(inPath, "input file");
  const doc = JSON.parse(raw);
  const result = validateConcepts(doc);
  if (!result.ok) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    throw new Error("Concepts document validation failed.");
  }
  process.stdout.write("ok\n");
}

async function runCli(argv = process.argv.slice(2)) {
  const [cmd, ...args] = argv;
  if (!cmd || cmd === "--help" || cmd === "-h") {
    process.stdout.write(`${usage()}\n`);
    return;
  }

  if (cmd === "extract") return extractCommand(args);
  if (cmd === "validate-concepts") return validateConceptsCommand(args);
  if (cmd === "run") return runCommand(args);
  if (cmd === "validate") return validateCommand(args);

  throw new Error(`Unknown command: ${cmd}`);
}

module.exports = {
  runCli,
  usage,
};
