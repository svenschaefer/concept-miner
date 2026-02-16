const crypto = require("node:crypto");

function canonicalizeToken(value) {
  return String(value || "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function conceptIdFromName(name) {
  return `c_${crypto.createHash("sha256").update(Buffer.from(name, "utf8")).digest("hex").slice(0, 12)}`;
}

function runFallbackExtraction(text, options = {}) {
  const byName = new Map();
  const sourceText = String(text || "");
  for (const match of sourceText.matchAll(/[A-Za-z0-9]+/g)) {
    const token = canonicalizeToken(match[0]);
    if (!token) continue;
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

  const concepts = Array.from(byName.values())
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((entry) => ({
      id: entry.id,
      name: entry.name,
      surface_forms: Array.from(new Set(entry.surface_forms)),
      ...(options.includeEvidence === true ? { occurrences: entry.occurrences } : {}),
    }));

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
