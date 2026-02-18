const { extractConcepts, validateConcepts } = require("../concepts");
const { normalizeModeValue } = require("../core/mode");
const { arg, readUtf8, writeUtf8 } = require("./io");
const { loadProjectConfig } = require("./config");

function usage() {
  return [
    "Usage:",
    "  concept-miner extract --text <string> [--out <path>] [--mode <generic-baseline|default-extended>] [--wikipedia-title-index-endpoint <url>] [--wikipedia-title-index-timeout-ms <ms>] [--config <path>]",
    "  concept-miner extract --seed-id <id> [--artifacts-root <path>] [--out <path>] [--mode <generic-baseline|default-extended>] [--wikipedia-title-index-endpoint <url>] [--wikipedia-title-index-timeout-ms <ms>] [--config <path>]",
    "  concept-miner extract --step12-in <path> [--out <path>] [--mode <generic-baseline|default-extended>] [--wikipedia-title-index-endpoint <url>] [--wikipedia-title-index-timeout-ms <ms>] [--config <path>]",
    "  concept-miner validate-concepts --in <path>",
  ].join("\n");
}

async function extractCommand(args) {
  const text = arg(args, "--text");
  const seedId = arg(args, "--seed-id");
  const step12Path = arg(args, "--step12-in");
  const artifactsRoot = arg(args, "--artifacts-root");
  const modeRaw = arg(args, "--mode");
  const outPath = arg(args, "--out");
  const configPath = arg(args, "--config");
  const wikipediaTitleIndexEndpoint = arg(args, "--wikipedia-title-index-endpoint");
  const wikipediaTitleIndexTimeoutMsRaw = arg(args, "--wikipedia-title-index-timeout-ms");

  const mode = normalizeModeValue(modeRaw);
  const wikipediaTitleIndexTimeoutMs = wikipediaTitleIndexTimeoutMsRaw
    ? Number.parseInt(wikipediaTitleIndexTimeoutMsRaw, 10)
    : undefined;
  if (
    wikipediaTitleIndexTimeoutMsRaw
    && (!Number.isFinite(wikipediaTitleIndexTimeoutMs) || wikipediaTitleIndexTimeoutMs <= 0)
  ) {
    throw new Error("Invalid --wikipedia-title-index-timeout-ms value. Expected positive integer.");
  }

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
    wikipediaTitleIndexEndpoint,
    wikipediaTitleIndexTimeoutMs,
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

  throw new Error(`Unknown command: ${cmd}`);
}

module.exports = {
  runCli,
  usage,
};
