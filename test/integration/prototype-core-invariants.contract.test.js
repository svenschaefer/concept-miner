const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const prototype = require("../../prototype/concept-candidates");

const repoRoot = path.resolve(__dirname, "..", "..");
const artifactsRoot = path.join(repoRoot, "test", "artifacts");

function listSeedDirs() {
  return fs
    .readdirSync(artifactsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
}

test("prototype canonicalization contract is stable", () => {
  assert.equal(prototype.canonicalizeSurface("  Älpha---Beta\t\n"), "lpha_beta");
  assert.equal(prototype.canonicalizeSurface("Role-based Access Control"), "role_based_access_control");
});

test("prototype extraction core invariants hold across realistic persisted Step12 seeds", () => {
  const seeds = listSeedDirs();
  assert.ok(seeds.length > 0, "expected at least one realistic seed fixture");

  for (const seed of seeds) {
    const step12Path = path.join(artifactsRoot, seed, "result-reference", "seed.elementary-assertions.yaml");
    assert.ok(fs.existsSync(step12Path), `missing step12 fixture: ${step12Path}`);

    for (const mode of ["13a", "13b"]) {
      const { outputDoc } = prototype.generateForStep12Path(step12Path, {
        step13Mode: mode,
      });
      assert.ok(Array.isArray(outputDoc.concept_candidates), `seed=${seed} mode=${mode} missing concept_candidates[]`);

      for (const candidate of outputDoc.concept_candidates) {
        assert.equal(
          candidate.concept_id,
          prototype.conceptIdFromCanonical(candidate.canonical),
          `seed=${seed} mode=${mode} concept_id must deterministically derive from canonical`
        );

        assert.equal(typeof candidate.roles, "object", `seed=${seed} mode=${mode} roles must be object`);
        for (const role of prototype.ROLE_KEYS) {
          assert.ok(Object.prototype.hasOwnProperty.call(candidate.roles, role), `seed=${seed} mode=${mode} missing role bucket: ${role}`);
          const count = candidate.roles[role];
          assert.ok(Number.isInteger(count), `seed=${seed} mode=${mode} role count must be integer for ${role}`);
          assert.ok(count >= 0, `seed=${seed} mode=${mode} role count must be non-negative for ${role}`);
        }

        const wti = candidate.wikipedia_title_index;
        assert.equal(typeof wti, "object", `seed=${seed} mode=${mode} wikipedia_title_index must be object`);
        for (const [key, value] of Object.entries(wti)) {
          if (!/^wiki_/.test(key)) continue;
          if (prototype.COUNT_KEY_RE.test(key)) {
            assert.ok(Number.isInteger(value) && value >= 0, `seed=${seed} mode=${mode} ${key} must be non-negative integer`);
          } else {
            assert.equal(typeof value, "boolean", `seed=${seed} mode=${mode} ${key} must be boolean`);
          }
        }
      }
    }
  }
});
