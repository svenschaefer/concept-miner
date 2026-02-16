const { failValidation } = require("./errors");

function validateSchemaShape(doc) {
  if (!doc || typeof doc !== "object") failValidation("TPL_VALIDATE_DOC_OBJECT", "Document must be an object.");
  if (doc.stage !== "output") failValidation("TPL_VALIDATE_STAGE", "Invalid stage: expected output.");
  if (!Array.isArray(doc.records)) failValidation("TPL_VALIDATE_RECORDS_ARRAY", "Invalid document: records[] required.");
}

module.exports = {
  validateSchemaShape,
};
