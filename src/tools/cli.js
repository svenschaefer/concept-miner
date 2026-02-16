const { runMain, runFromInput } = require("../run");
const { validateOutput } = require("../validate");
const { arg, readUtf8, writeUtf8 } = require("./io");
const { loadProjectConfig } = require("./config");

function usage() {
  return [
    "Usage:",
    "  concept-miner run --text <string> | --in <path> [--out <path>] [--config <path>]",
    "  concept-miner validate --in <path>",
  ].join("\n");
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
  validateOutput(doc);
  process.stdout.write("ok\n");
}

async function runCli(argv = process.argv.slice(2)) {
  const [cmd, ...args] = argv;
  if (!cmd || cmd === "--help" || cmd === "-h") {
    process.stdout.write(`${usage()}\n`);
    return;
  }

  if (cmd === "run") return runCommand(args);
  if (cmd === "validate") return validateCommand(args);

  throw new Error(`Unknown command: ${cmd}`);
}

module.exports = {
  runCli,
  usage,
};
