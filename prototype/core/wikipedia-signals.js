const { compareStrings } = require("./shared-utils");

const COUNT_KEY_RE = /^wiki_[A-Za-z0-9_]+_count$/;
const WIKIPEDIA_SIGNAL_KEY_RE = /^wiki_[A-Za-z0-9_]+$/;

function ensureIntegerCount(key, value, pathLabel) {
  if (!Number.isInteger(value)) {
    throw new Error(`Non-integer ${key} at ${pathLabel}; integer required (no coercion).`);
  }
}

function ensureWikipediaSignalScalar(key, value, pathLabel) {
  if (COUNT_KEY_RE.test(key)) {
    ensureIntegerCount(key, value, pathLabel);
    return;
  }
  if (typeof value !== "boolean") {
    throw new Error(`Invalid ${key} at ${pathLabel}; expected boolean for non-count wiki signal.`);
  }
}

function orderedSparseWikipediaSignalObject(raw) {
  const out = Object.create(null);
  const keys = Object.keys(raw || {}).filter((k) => WIKIPEDIA_SIGNAL_KEY_RE.test(k)).sort(compareStrings);
  for (const k of keys) out[k] = raw[k];
  return out;
}

function walkWikipediaSignalFields(node, onSignal, pathLabel) {
  if (Array.isArray(node)) {
    for (let i = 0; i < node.length; i += 1) {
      walkWikipediaSignalFields(node[i], onSignal, `${pathLabel}[${i}]`);
    }
    return;
  }
  if (!node || typeof node !== "object") return;
  for (const [key, value] of Object.entries(node)) {
    const nextPath = `${pathLabel}.${key}`;
    if (WIKIPEDIA_SIGNAL_KEY_RE.test(key)) {
      ensureWikipediaSignalScalar(key, value, nextPath);
      onSignal(key, value, nextPath);
    }
    walkWikipediaSignalFields(value, onSignal, nextPath);
  }
}

function mergeWikipediaSignalValue(bucket, key, value) {
  if (COUNT_KEY_RE.test(key)) {
    bucket[key] = (bucket[key] || 0) + value;
    return;
  }
  bucket[key] = Boolean(bucket[key]) || Boolean(value);
}

module.exports = {
  COUNT_KEY_RE,
  WIKIPEDIA_SIGNAL_KEY_RE,
  ensureWikipediaSignalScalar,
  orderedSparseWikipediaSignalObject,
  walkWikipediaSignalFields,
  mergeWikipediaSignalValue,
};
