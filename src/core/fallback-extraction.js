const crypto = require("node:crypto");
const { normalizeModeValue } = require("./mode");

const DEFAULT_WIKIPEDIA_TITLE_INDEX_ENDPOINT = "http://127.0.0.1:32123";
const MIN_TOKEN_LENGTH = 2;
const STOPWORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "in",
  "is",
  "it",
  "of",
  "on",
  "or",
  "that",
  "the",
  "this",
  "to",
  "was",
  "were",
  "with",
]);

function canonicalizeToken(value) {
  return String(value || "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function isConceptCandidate(token) {
  return token.length >= MIN_TOKEN_LENGTH && !STOPWORDS.has(token);
}

function conceptIdFromName(name) {
  return `c_${crypto.createHash("sha256").update(Buffer.from(name, "utf8")).digest("hex").slice(0, 12)}`;
}

function titleCaseAscii(value) {
  return String(value || "")
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function queryPrefixBounds(query) {
  return [query, `${query}\uFFFF`];
}

async function fetchWikipediaTitleIndexSignals(endpoint, queryText, timeoutMs) {
  const [start, end] = queryPrefixBounds(queryText);
  const payload = {
    sql: "SELECT COUNT(*) AS prefix_count, SUM(CASE WHEN t = ?3 THEN 1 ELSE 0 END) AS exact_count FROM titles WHERE t >= ?1 AND t < ?2",
    params: [start, end, queryText],
    max_rows: 1,
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${endpoint}/v1/titles/query`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (!response.ok) return null;

    const body = await response.json();
    const row = Array.isArray(body.rows) && body.rows.length > 0 && Array.isArray(body.rows[0]) ? body.rows[0] : null;
    if (!row) return null;

    const prefixCount = Number.isInteger(row[0]) ? row[0] : 0;
    const exactCount = Number.isInteger(row[1]) ? row[1] : 0;

    return {
      exact_match: exactCount > 0,
      prefix_count: prefixCount,
    };
  } catch (_err) {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function addWikipediaTitleIndexSignals(concepts, options = {}) {
  const mode = normalizeModeValue(options.mode);
  if (mode !== "default-extended") return concepts;

  const endpoint =
    options.wikipediaTitleIndexEndpoint ||
    options.wikipedia_title_index_endpoint ||
    process.env.WIKIPEDIA_TITLE_INDEX_ENDPOINT ||
    DEFAULT_WIKIPEDIA_TITLE_INDEX_ENDPOINT;
  const timeoutMs = Number.isFinite(options.wikipediaTitleIndexTimeoutMs)
    ? Number(options.wikipediaTitleIndexTimeoutMs)
    : (Number.isFinite(options.wikipedia_title_index_timeout_ms)
        ? Number(options.wikipedia_title_index_timeout_ms)
        : 2000);

  const out = [];
  for (const concept of concepts) {
    const surface = Array.isArray(concept.surface_forms) && concept.surface_forms.length > 0
      ? String(concept.surface_forms[0])
      : String(concept.name || "");
    const queryText = titleCaseAscii(surface);
    const wti = await fetchWikipediaTitleIndexSignals(endpoint, queryText, timeoutMs);

    if (wti) {
      out.push({
        ...concept,
        properties: {
          ...(concept.properties && typeof concept.properties === "object" ? concept.properties : {}),
          wikipedia_title_index: wti,
        },
      });
    } else {
      out.push(concept);
    }
  }
  return out;
}

async function runFallbackExtraction(text, options = {}) {
  const byName = new Map();
  const sourceText = String(text || "");
  for (const match of sourceText.matchAll(/[A-Za-z0-9]+/g)) {
    const token = canonicalizeToken(match[0]);
    if (!token || !isConceptCandidate(token)) continue;
    if (!byName.has(token)) {
      byName.set(token, {
        id: conceptIdFromName(token),
        name: token,
        surface_forms: [],
        occurrences: [],
      });
    }
    const entry = byName.get(token);
    entry.surface_forms.push(match[0]);
    if (options.includeEvidence === true) {
      entry.occurrences.push({
        start: match.index,
        end: match.index + String(match[0]).length,
        text: String(match[0]),
        source: "token",
      });
    }
  }

  let concepts = Array.from(byName.values())
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((entry) => ({
      id: entry.id,
      name: entry.name,
      surface_forms: Array.from(new Set(entry.surface_forms)),
      ...(options.includeEvidence === true ? { occurrences: entry.occurrences } : {}),
    }));
  concepts = await addWikipediaTitleIndexSignals(concepts, options);

  const out = {
    schema_version: String(options.schemaVersion || "1.0.0"),
    concepts,
    meta: {
      concept_count: concepts.length,
      service: {
        name: "concept-miner",
        version: String(options.serviceVersion || "0.001.0"),
        deterministic: true,
      },
    },
  };
  if (typeof options.inputId === "string" && options.inputId.length > 0) {
    out.input_id = options.inputId;
  }
  return out;
}

module.exports = {
  runFallbackExtraction,
};
