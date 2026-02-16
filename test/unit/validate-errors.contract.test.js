const test = require("node:test");
const assert = require("node:assert/strict");

const { validateOutput, ValidationError } = require("../../src/validate");

test("validate exports ValidationError type", () => {
  assert.equal(typeof ValidationError, "function");
});

test("stage mismatch has stable validation error code", () => {
  assert.throws(
    () => validateOutput({ stage: "wrong", records: [] }),
    (err) => err instanceof ValidationError && err.code === "TPL_VALIDATE_STAGE"
  );
});

test("record id duplicate has stable validation error code", () => {
  assert.throws(
    () =>
      validateOutput({
        stage: "output",
        records: [
          { id: "r:1", value: "a", tags: [] },
          { id: "r:1", value: "b", tags: [] },
        ],
      }),
    (err) => err instanceof ValidationError && err.code === "TPL_VALIDATE_RECORD_ID_DUPLICATE"
  );
});
