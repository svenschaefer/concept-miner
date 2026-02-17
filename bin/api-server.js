#!/usr/bin/env node

const { createApiServer } = require("../src/server/http");

function parsePort(argv) {
  const idx = argv.indexOf("--port");
  if (idx < 0 || idx + 1 >= argv.length) return 32180;
  const n = Number.parseInt(argv[idx + 1], 10);
  if (!Number.isFinite(n) || n <= 0 || n > 65535) {
    throw new Error("Invalid --port value. Expected integer in [1, 65535].");
  }
  return n;
}

async function main(argv = process.argv.slice(2)) {
  const port = parsePort(argv);
  const server = createApiServer();
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", resolve);
  });
  process.stdout.write(`concept-miner REST API listening on http://127.0.0.1:${port}\n`);
}

main().catch((err) => {
  const message = err && err.message ? err.message : String(err);
  process.stderr.write(`error: ${message}\n`);
  process.exitCode = 1;
});
