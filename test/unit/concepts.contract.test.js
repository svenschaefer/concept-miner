const test = require("node:test");
const assert = require("node:assert/strict");

const { extractConcepts, validateConcepts } = require("../../src");

test("extractConcepts returns concepts document in generic-baseline mode", async () => {
  const doc = await extractConcepts("alpha beta alpha", { mode: "generic-baseline", includeEvidence: true });
  assert.equal(doc.schema_version, "1.0.0");
  assert.ok(Array.isArray(doc.concepts));
  assert.equal(doc.concepts.length, 2);
  const names = doc.concepts.map((c) => c.name).sort();
  assert.deepEqual(names, ["alpha", "beta"]);
});

test("extractConcepts removes stopwords for simple sentence", async () => {
  const doc = await extractConcepts("This is a test.", { mode: "generic-baseline", includeEvidence: true });
  const names = doc.concepts.map((c) => c.name).sort();
  assert.deepEqual(names, ["test"]);
  assert.deepEqual(doc.concepts[0].surface_forms, ["test"]);
  assert.equal(doc.concepts[0].occurrences.length, 1);
});

test("extractConcepts removes stopword-only concept from pangram", async () => {
  const doc = await extractConcepts("The quick brown fox jumps over the lazy dog.", { mode: "generic-baseline" });
  const names = doc.concepts.map((c) => c.name).sort();
  assert.deepEqual(names, ["brown", "dog", "fox", "jumps", "lazy", "over", "quick"]);
});

test("validateConcepts accepts extracted generic-baseline document", async () => {
  const doc = await extractConcepts("alpha beta alpha", { mode: "generic-baseline" });
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

test("extractConcepts rejects legacy underscore mode values", async () => {
  await assert.rejects(
    () => extractConcepts("alpha beta alpha", { mode: "generic_baseline" }),
    /Invalid mode/i
  );
});

test("extractConcepts hard-fails in default-extended mode when wikipedia-title-index is unavailable", async () => {
  await assert.rejects(
    () => extractConcepts("alpha beta alpha", {
      mode: "default-extended",
      wikipediaTitleIndexEndpoint: "http://127.0.0.1:1",
      wikipediaTitleIndexTimeoutMs: 50,
    }),
    /wikipedia-title-index query failed/i
  );
});

test("validateConcepts rejects invalid wikipedia_title_index enrichment typing", () => {
  const result = validateConcepts({
    schema_version: "1.0.0",
    concepts: [
      {
        id: "c_1f2d3c4b5a6e",
        name: "alpha",
        properties: {
          wikipedia_title_index: {
            exact_match: "yes",
            prefix_count: -1,
          },
        },
      },
    ],
  });
  assert.equal(result.ok, false);
  assert.ok(result.errors.length > 0);
});

test("validateConcepts accepts valid wikipedia_title_index enrichment typing", () => {
  const result = validateConcepts({
    schema_version: "1.0.0",
    concepts: [
      {
        id: "c_1f2d3c4b5a6e",
        name: "alpha",
        properties: {
          wikipedia_title_index: {
            exact_match: true,
            prefix_count: 7,
          },
        },
      },
    ],
  });
  assert.equal(result.ok, true);
  assert.deepEqual(result.errors, []);
});
