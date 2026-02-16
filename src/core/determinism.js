function normalizeIds(ids) {
  return Array.from(new Set((ids || []).filter((id) => typeof id === "string" && id.length > 0))).sort((a, b) => a.localeCompare(b));
}

function stableSortById(items) {
  return (items || []).slice().sort((a, b) => {
    const left = String((a && a.id) || "");
    const right = String((b && b.id) || "");
    return left.localeCompare(right);
  });
}

module.exports = {
  normalizeIds,
  stableSortById,
};
