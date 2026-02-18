const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const YAML = require("yaml");

const repoRoot = path.resolve(__dirname, "..", "..");
const step13 = require(path.join(repoRoot, "src", "core", "step13.js"));
const step12Path = path.join(
  repoRoot,
  "test",
  "artifacts",
  "prime_gen",
  "result-reference",
  "seed.elementary-assertions.yaml"
);

function mutateAssertionMentionEvidenceCount(step12) {
  for (const assertion of step12.assertions || []) {
    const mentionEvidence = ((((assertion || {}).evidence || {}).wiki_signals || {}).mention_evidence || []);
    for (const entry of mentionEvidence) {
      const evidence = (entry || {}).evidence || {};
      if (evidence.mwe && Number.isInteger(evidence.mwe.wiki_prefix_count)) {
        evidence.mwe.wiki_prefix_count = "invalid-count";
        return true;
      }
      for (const tokenEv of evidence.tokens || []) {
        if (tokenEv && tokenEv.evidence && Number.isInteger(tokenEv.evidence.wiki_prefix_count)) {
          tokenEv.evidence.wiki_prefix_count = "invalid-count";
          return true;
        }
      }
    }
  }
  return false;
}

test("step13 hard-fails when wiki_*_count is not integer", () => {
  const step12 = YAML.parse(fs.readFileSync(step12Path, "utf8"));
  const mutated = mutateAssertionMentionEvidenceCount(step12);
  assert.equal(mutated, true, "expected at least one assertion mention-evidence wiki_*_count field in fixture");

  assert.throws(
    () => step13.buildConceptCandidatesFromStep12(step12, { step13Mode: "13b" }),
    /integer|count/i
  );
});

test("step13 generateForStep12Path is deterministic in-process", () => {
  const a = step13.generateForStep12Path(step12Path, { step13Mode: "13b" });
  const b = step13.generateForStep12Path(step12Path, { step13Mode: "13b" });
  assert.equal(a.yamlText, b.yamlText);
});

test("step13 fresh-process replay is deterministic and keeps LF with one trailing newline", () => {
  const script = [
    "const s=require('./src/core/step13');",
    `const out=s.generateForStep12Path(${JSON.stringify(step12Path)},{step13Mode:'13b'});`,
    "process.stdout.write(out.yamlText);",
  ].join("");
  const args = ["-e", script];

  const r1 = spawnSync(process.execPath, args, { cwd: repoRoot, encoding: "utf8" });
  const r2 = spawnSync(process.execPath, args, { cwd: repoRoot, encoding: "utf8" });

  assert.equal(r1.status, 0, r1.stderr || r1.stdout);
  assert.equal(r2.status, 0, r2.stderr || r2.stdout);
  assert.equal(r1.stdout, r2.stdout, "fresh-process replay must be byte-identical");
  assert.equal(r1.stdout.includes("\r"), false, "output must use LF line endings");
  assert.equal(r1.stdout.endsWith("\n"), true, "output must end with a newline");
  assert.equal(r1.stdout.endsWith("\n\n"), false, "output must have exactly one trailing newline");
});
