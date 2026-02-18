const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const step13 = require("../../src/core/step13");

const repoRoot = path.resolve(__dirname, "..", "..");
const artifactsRoot = path.join(repoRoot, "test", "artifacts");

function listSeedDirs() {
  return fs
    .readdirSync(artifactsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
}

test("step13 canonicalization contract is stable", () => {
  assert.equal(step13.canonicalizeSurface("  Älpha---Beta\t\n"), "lpha_beta");
  assert.equal(step13.canonicalizeSurface("Role-based Access Control"), "role_based_access_control");
});

test("step13 extraction core invariants hold across realistic persisted Step12 seeds", () => {
  const seeds = listSeedDirs();
  assert.ok(seeds.length > 0, "expected at least one realistic seed fixture");

  for (const seed of seeds) {
    const step12Path = path.join(artifactsRoot, seed, "result-reference", "seed.elementary-assertions.yaml");
    assert.ok(fs.existsSync(step12Path), `missing step12 fixture: ${step12Path}`);

    const { outputDoc } = step13.generateForStep12Path(step12Path, {
      step13Mode: "13b",
      enableLegacyEnrichment: false,
      enableRecoverySynthesis: false,
    });
    assert.ok(Array.isArray(outputDoc.concept_candidates), `seed=${seed} missing concept_candidates[]`);

    for (const candidate of outputDoc.concept_candidates) {
      assert.equal(
        candidate.concept_id,
        step13.conceptIdFromCanonical(candidate.canonical),
        `seed=${seed} concept_id must deterministically derive from canonical`
      );

      assert.equal(typeof candidate.roles, "object", `seed=${seed} roles must be object`);
      for (const role of step13.ROLE_KEYS) {
        assert.ok(Object.prototype.hasOwnProperty.call(candidate.roles, role), `seed=${seed} missing role bucket: ${role}`);
        const count = candidate.roles[role];
        assert.ok(Number.isInteger(count), `seed=${seed} role count must be integer for ${role}`);
        assert.ok(count >= 0, `seed=${seed} role count must be non-negative for ${role}`);
      }

      const wti = candidate.wikipedia_title_index;
      assert.equal(typeof wti, "object", `seed=${seed} wikipedia_title_index must be object`);
      for (const [key, value] of Object.entries(wti)) {
        if (!/^wiki_/.test(key)) continue;
        if (step13.COUNT_KEY_RE.test(key)) {
          assert.ok(Number.isInteger(value) && value >= 0, `seed=${seed} ${key} must be non-negative integer`);
        } else {
          assert.equal(typeof value, "boolean", `seed=${seed} ${key} must be boolean`);
        }
      }
    }
  }
});
