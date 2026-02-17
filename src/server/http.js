const http = require("node:http");
const { URL } = require("node:url");
const { extractConcepts } = require("../concepts");

function writeJson(res, statusCode, payload) {
  const body = `${JSON.stringify(payload, null, 2)}\n`;
  res.statusCode = statusCode;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.setHeader("content-length", Buffer.byteLength(body, "utf8"));
  res.end(body);
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.setEncoding("utf8");
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1024 * 1024) {
        const err = new Error("request_too_large");
        err.code = "REQUEST_TOO_LARGE";
        reject(err);
      }
    });
    req.on("end", () => {
      try {
        resolve(raw.length > 0 ? JSON.parse(raw) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

function mapViewToFlags(view, bodyOptions = {}) {
  const outputOptions = bodyOptions.output && typeof bodyOptions.output === "object" ? bodyOptions.output : {};
  const includeEvidence = bodyOptions.evidence === true || view === "evidence" || view === "diagnostic";
  const includeDiagnostics = outputOptions.include_diagnostics === true || view === "diagnostic";
  return { includeEvidence, includeDiagnostics };
}

function createApiServer(deps = {}) {
  const extractConceptsImpl = typeof deps.extractConcepts === "function" ? deps.extractConcepts : extractConcepts;
  return http.createServer(async (req, res) => {
    const method = req.method || "GET";
    const parsed = new URL(req.url || "/", "http://127.0.0.1");
    const pathname = parsed.pathname;

    if (method !== "POST" || pathname !== "/v1/concepts/extract") {
      writeJson(res, 404, { error: "not_found", message: "Unknown route." });
      return;
    }

    const view = parsed.searchParams.get("view") || "compact";
    if (!["compact", "evidence", "diagnostic"].includes(view)) {
      writeJson(res, 400, { error: "invalid_request", message: "Invalid view query value." });
      return;
    }

    let body;
    try {
      body = await readJsonBody(req);
    } catch (err) {
      if (err && err.code === "REQUEST_TOO_LARGE") {
        writeJson(res, 400, { error: "invalid_request", message: "Request body too large (max 1 MiB)." });
        return;
      }
      writeJson(res, 400, { error: "invalid_request", message: "Malformed JSON body." });
      return;
    }

    if (!body || typeof body !== "object" || typeof body.text !== "string" || body.text.length === 0) {
      writeJson(res, 400, { error: "invalid_request", message: "`text` (non-empty string) is required." });
      return;
    }

    const bodyOptions = body.options && typeof body.options === "object" ? body.options : {};
    const { includeEvidence, includeDiagnostics } = mapViewToFlags(view, bodyOptions);

    try {
      const doc = await extractConceptsImpl(body.text, {
        inputId: body.input_id,
        mode: bodyOptions.mode,
        wikipediaTitleIndexEndpoint: bodyOptions.wikipedia_title_index_endpoint,
        wikipediaTitleIndexTimeoutMs: bodyOptions.wikipedia_title_index_timeout_ms,
        includeEvidence,
        includeDiagnostics,
      });
      writeJson(res, 200, doc);
    } catch (err) {
      if (err && (err.code === "UNPROCESSABLE_INPUT" || err.name === "UnprocessableInputError")) {
        const message = err && err.message ? err.message : "Unprocessable input.";
        writeJson(res, 422, { error: "unprocessable_input", message });
        return;
      }
      writeJson(res, 500, { error: "internal_error", message: "Internal server error." });
    }
  });
}

module.exports = {
  createApiServer,
};
