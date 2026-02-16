const { stableSortById, normalizeIds } = require("./determinism");

function processInput(input, options = {}) {
  const sortedItems = stableSortById(input.items || []);

  const records = sortedItems.map((item) => ({
    id: item.id,
    value: String(item.value || ""),
    tags: normalizeIds(item.tags || []),
  }));

  return {
    stage: "output",
    schema_version: String(options.schemaVersion || "1.0.0"),
    source_text: String(input.source_text || ""),
    records,
  };
}

module.exports = {
  processInput,
};
