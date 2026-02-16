const { failValidation } = require("./errors");

function ensureUniqueRecordIds(records) {
  const seen = new Set();
  for (const record of records || []) {
    const id = String((record && record.id) || "");
    if (!id) failValidation("TPL_VALIDATE_RECORD_ID", "Record id is required.");
    if (seen.has(id)) failValidation("TPL_VALIDATE_RECORD_ID_DUPLICATE", `Duplicate record id: ${id}`);
    seen.add(id);
  }
}

function validateIntegrity(doc) {
  ensureUniqueRecordIds(doc.records);
}

module.exports = {
  validateIntegrity,
};
