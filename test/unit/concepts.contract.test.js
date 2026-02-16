const test = require("node:test");
const assert = require("node:assert/strict");

const { extractConcepts, validateConcepts } = require("../../src");

test("extractConcepts fallback returns concepts document", async () => {
  const doc = await extractConcepts("alpha beta alpha", { includeEvidence: true });
  assert.equal(doc.schema_version, "1.0.0");
  assert.ok(Array.isArray(doc.concepts));
  assert.equal(doc.concepts.length, 2);
  const names = doc.concepts.map((c) => c.name).sort();
  assert.deepEqual(names, ["alpha", "beta"]);
});

test("validateConcepts accepts extracted fallback document", async () => {
  const doc = await extractConcepts("alpha beta alpha", {});
  const result = validateConcepts(doc);
  assert.equal(result.ok, true);
  assert.deepEqual(result.errors, []);
});

test("validateConcepts rejects malformed concepts document", () => {
  const result = validateConcepts({ schema_version: "1.0.0", concepts: [{ id: "", name: "" }] });
  assert.equal(result.ok, false);
  assert.ok(result.errors.length > 0);
});

test("validateConcepts rejects duplicate concept ids", () => {
  const result = validateConcepts({
    schema_version: "1.0.0",
    concepts: [
      { id: "c_1", name: "alpha" },
      { id: "c_1", name: "beta" },
    ],
  });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.keyword === "invariant" && /Duplicate concept id/.test(error.message)));
});

test("validateConcepts rejects duplicate concept names", () => {
  const result = validateConcepts({
    schema_version: "1.0.0",
    concepts: [
      { id: "c_1", name: "alpha" },
      { id: "c_2", name: "alpha" },
    ],
  });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.keyword === "invariant" && /Duplicate concept name/.test(error.message)));
});

test("validateConcepts rejects occurrence bounds where end < start", () => {
  const result = validateConcepts({
    schema_version: "1.0.0",
    concepts: [
      {
        id: "c_1",
        name: "alpha",
        occurrences: [{ start: 10, end: 3, text: "alpha" }],
      },
    ],
  });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.keyword === "invariant" && /Occurrence end/.test(error.message)));
});

test("extractConcepts accepts kebab-case mode values", async () => {
  const doc = await extractConcepts("alpha beta alpha", { mode: "generic-baseline" });
  assert.equal(doc.schema_version, "1.0.0");
  assert.ok(Array.isArray(doc.concepts));
  assert.equal(doc.concepts.length, 2);
});
