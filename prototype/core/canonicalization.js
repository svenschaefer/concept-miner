const crypto = require("crypto");

function defaultCaseFold(input) {
  let out = String(input || "").toLowerCase();
  out = out.replace(/\u1E9E/g, "ss").replace(/\u00DF/g, "ss");
  out = out.replace(/\u03C2/g, "\u03C3");
  return out;
}

function canonicalizeSurface(surface) {
  let out = String(surface || "");
  out = out.normalize("NFKC");
  out = defaultCaseFold(out);
  out = out.replace(/[^A-Za-z0-9]/gu, " ");
  out = out.replace(/ +/g, " ").trim();
  out = out.replace(/ /g, "_");
  if (!out) throw new Error(`Canonicalization produced empty key for surface: ${JSON.stringify(surface)}`);
  return out;
}

function normalizeLiftedSurface(surface) {
  const trimmed = String(surface || "").replace(/\s+/g, " ").trim();
  if (!trimmed) return trimmed;
  const parts = trimmed.split(" ");
  const drop = new Set([
    "a", "an", "the",
  ]);
  let i = 0;
  while (i < parts.length && drop.has(parts[i].toLowerCase())) i += 1;
  while (i < parts.length && /^[0-9]+$/.test(parts[i])) i += 1;
  return parts.slice(i).join(" ").trim();
}

function sha256HexUtf8(text) {
  return crypto.createHash("sha256").update(Buffer.from(String(text), "utf8")).digest("hex");
}

function conceptIdFromCanonical(canonical) {
  return `cc_${sha256HexUtf8(canonical).slice(0, 16)}`;
}

module.exports = {
  canonicalizeSurface,
  conceptIdFromCanonical,
  normalizeLiftedSurface,
};
