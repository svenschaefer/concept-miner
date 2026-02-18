const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const step13 = require("../../src/core/step13");

const repoRoot = path.resolve(__dirname, "..", "..");
const artifactsRoot = path.join(repoRoot, "test", "artifacts");

function runForSeed(seedId) {
  const step12Path = path.join(
    artifactsRoot,
    seedId,
    "result-reference",
    "seed.elementary-assertions.yaml"
  );
  return step13.generateForStep12Path(step12Path, {
    step13Mode: "13b",
    collectDiagnostics: true,
    enableLegacyEnrichment: false,
    enableRecoverySynthesis: false,
  });
}

function conceptSet(outputDoc) {
  return new Set((outputDoc.concept_candidates || []).map((c) => String(c.canonical)));
}

function hasPolicyHit(diagnostics, canonical, hit) {
  const byCanonical = diagnostics && diagnostics.mode13b_by_canonical;
  if (!byCanonical || typeof byCanonical !== "object") return false;
  const entry = byCanonical[canonical];
  if (!entry || !Array.isArray(entry.policy_hits)) return false;
  return entry.policy_hits.includes(hit);
}

test("webshop keeps host canonicals and suppresses alias fragment", () => {
  const { outputDoc, diagnostics } = runForSeed("webshop");
  const set = conceptSet(outputDoc);

  assert.equal(set.has("customer_s_payment"), true);
  assert.equal(set.has("record_of_the_order"), true);
  assert.equal(set.has("s_payment"), false);
  assert.equal(hasPolicyHit(diagnostics, "s_payment", "suppress_alias_short_lead_fragment"), true);
});

test("saas includes predicate-verb promotion and function-leading suppression signals", () => {
  const { diagnostics } = runForSeed("saas");
  const byCanonical = diagnostics && diagnostics.mode13b_by_canonical;
  assert.equal(typeof byCanonical, "object");

  let hasPredicatePromotion = false;
  let hasFunctionLeadingSuppression = false;
  for (const canonical of Object.keys(byCanonical || {})) {
    if (hasPolicyHit(diagnostics, canonical, "promotion_predicate_verb_wikipedia_count")) {
      hasPredicatePromotion = true;
    }
    if (hasPolicyHit(diagnostics, canonical, "suppress_function_leading_fragment")) {
      hasFunctionLeadingSuppression = true;
    }
  }

  assert.equal(hasPredicatePromotion, true, "expected at least one predicate-verb promotion hit in saas seed");
  assert.equal(hasFunctionLeadingSuppression, true, "expected at least one function-leading suppression hit in saas seed");
});

test("access_control suppresses quantifier-led fragments", () => {
  const { diagnostics } = runForSeed("access_control");
  const byCanonical = diagnostics && diagnostics.mode13b_by_canonical;
  assert.equal(typeof byCanonical, "object");

  let hasQuantifierSuppression = false;
  for (const canonical of Object.keys(byCanonical || {})) {
    if (hasPolicyHit(diagnostics, canonical, "suppress_quantifier_led_fragment")) {
      hasQuantifierSuppression = true;
      break;
    }
  }
  assert.equal(hasQuantifierSuppression, true);
});
