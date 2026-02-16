const test = require("node:test");
const assert = require("node:assert/strict");

const { validateOutput, ValidationError } = require("../../src/validate");

test("validateOutput accepts valid document", () => {
  const doc = {
    stage: "output",
    records: [{ id: "r:1", value: "x", tags: [] }],
  };
  const result = validateOutput(doc);
  assert.equal(result.ok, true);
});

test("validateOutput throws ValidationError for wrong stage", () => {
  assert.throws(
    () => validateOutput({ stage: "wrong", records: [] }),
    (err) => err instanceof ValidationError && err.code === "TPL_VALIDATE_STAGE"
  );
});
