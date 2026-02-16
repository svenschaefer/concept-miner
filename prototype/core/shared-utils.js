function compareStrings(a, b) {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function parseSemverMajor(value) {
  const m = /^(\d+)\.(\d+)\.(\d+)(?:[-+].*)?$/.exec(String(value || ""));
  if (!m) return null;
  return Number(m[1]);
}

function sortedUniqueStrings(values) {
  return Array.from(new Set((values || []).map((v) => String(v)))).sort(compareStrings);
}

function countObjectTotal(raw) {
  let total = 0;
  for (const key of Object.keys(raw || {})) {
    const value = raw[key];
    if (Number.isInteger(value) && value > 0) total += value;
  }
  return total;
}

function roundFixed3(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 1000) / 1000;
}

module.exports = {
  compareStrings,
  assert,
  parseSemverMajor,
  sortedUniqueStrings,
  countObjectTotal,
  roundFixed3,
};
