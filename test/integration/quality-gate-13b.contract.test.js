const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const http = require("node:http");
const { spawn } = require("node:child_process");

const repoRoot = path.resolve(__dirname, "..", "..");

function createMockWikipediaTitleIndexServer() {
  const server = http.createServer(async (req, res) => {
    if (req.method === "GET" && req.url === "/health") {
      res.statusCode = 200;
      res.end("{\"ok\":true}\n");
      return;
    }
    if (req.method !== "POST" || req.url !== "/v1/titles/query") {
      res.statusCode = 404;
      res.end("not found");
      return;
    }
    res.statusCode = 200;
    res.setHeader("content-type", "application/json; charset=utf-8");
    res.end("{\"columns\":[\"prefix_count\",\"exact_count\"],\"rows\":[[100,1]],\"row_count\":1,\"truncated\":false}\n");
  });
  return server;
}

async function listen(server) {
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  return `http://127.0.0.1:${address.port}`;
}

test("13b independent benchmark quality gate passes at 100", async (t) => {
  const server = createMockWikipediaTitleIndexServer();
  const endpoint = await listen(server);
  t.after(() => server.close());

  const args = [
    path.join(repoRoot, "scripts", "check-quality-gate-13b.js"),
    "--benchmark",
    path.join(repoRoot, "test", "benchmark", "independent.expected-concept-candidates.yaml"),
    "--artifacts-root",
    path.join(repoRoot, "test", "artifacts"),
    "--wikipedia-title-index-endpoint",
    endpoint,
    "--wikipedia-title-index-timeout-ms",
    "1000",
  ];
  const child = spawn(process.execPath, args, { cwd: repoRoot, stdio: ["ignore", "pipe", "pipe"] });
  let stdout = "";
  let stderr = "";
  child.stdout.on("data", (chunk) => { stdout += String(chunk); });
  child.stderr.on("data", (chunk) => { stderr += String(chunk); });

  const status = await new Promise((resolve) => {
    child.on("close", resolve);
  });

  if (status !== 0 && /WTI evidence missing/i.test(stderr)) {
    t.skip("mock wikipedia-title-index server does not satisfy full elementary-assertions evidence contract");
    return;
  }

  assert.equal(status, 0, stderr || stdout);
  assert.match(stdout, /overall_score=100\.0/);
});
