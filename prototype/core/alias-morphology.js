function isNominalTag(tag) {
  return tag === "NN"
    || tag === "NNS"
    || tag === "NNP"
    || tag === "NNPS"
    || tag === "JJ"
    || tag === "JJR"
    || tag === "JJS"
    || tag === "CD"
    || tag === "VBN"
    || tag === "VBG";
}

function singularizeTokenPart(part) {
  const p = String(part || "");
  if (p.length <= 3) return p;
  if (p.endsWith("ies") && p.length > 4) return `${p.slice(0, -3)}y`;
  if (/(ches|shes|xes|zes)$/i.test(p)) return p.slice(0, -2);
  if (p.endsWith("sses")) return `${p.slice(0, -2)}`;
  if (p.endsWith("ss") || p.endsWith("us") || p.endsWith("is") || p.endsWith("ics")) return p;
  if (p.endsWith("s")) return p.slice(0, -1);
  return p;
}

function singularizeCanonical(canonical) {
  const parts = String(canonical || "").split("_").filter(Boolean);
  if (parts.length === 0) return String(canonical || "");
  return parts.map((p) => singularizeTokenPart(p)).join("_");
}

function shouldRejectAliasCanonical(canonical) {
  const c = String(canonical || "");
  if (!c) return true;
  if (c.startsWith("a_") || c.startsWith("an_") || c.startsWith("the_")) return true;
  const parts = c.split("_").filter(Boolean);
  if (parts.length === 2) {
    const p0 = String(parts[0] || "");
    if (p0 === "a" || p0 === "an" || p0 === "the") return true;
  }
  return false;
}

module.exports = {
  isNominalTag,
  singularizeCanonical,
  shouldRejectAliasCanonical,
};
