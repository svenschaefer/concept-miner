const { validateSchemaShape } = require("./schema");
const { validateIntegrity } = require("./integrity");
const { ValidationError } = require("./errors");

function validateOutput(doc) {
  validateSchemaShape(doc);
  validateIntegrity(doc);
  return { ok: true };
}

module.exports = {
  validateOutput,
  ValidationError,
};
