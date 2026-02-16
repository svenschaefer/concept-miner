const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const YAML = require("yaml");
const {
  canonicalizeSurface,
  buildConceptCandidatesFromStep12,
  generateForStep12Path,
  serializeDeterministicYaml,
  validateSchema,
} = require("./concept-candidates");

const step13Dir = __dirname;
const repoRoot = path.resolve(__dirname, "..");
const configuredArtifactsRoot = process.env.CONCEPT_MINER_ARTIFACTS_ROOT
  ? path.resolve(process.env.CONCEPT_MINER_ARTIFACTS_ROOT)
  : null;
const artifactsRoot = configuredArtifactsRoot
  || (fs.existsSync(path.join(repoRoot, "test", "artifacts"))
    ? path.join(repoRoot, "test", "artifacts")
    : path.resolve(step13Dir, "..", "artifacts"));

function listSeedIds() {
  return fs
    .readdirSync(artifactsRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((seedId) => fs.existsSync(path.join(artifactsRoot, seedId, "seed", "seed.txt")))
    .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
}

function runNode(script, args, timeoutMs = 300000) {
  const out = spawnSync(process.execPath, [path.join(step13Dir, script), ...args], {
    cwd: repoRoot,
    encoding: "utf8",
    timeout: timeoutMs,
  });
  return out;
}

function mkTmpArtifacts() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "step13-"));
  const root = path.join(tmp, "artifacts");
  fs.mkdirSync(root, { recursive: true });
  return root;
}

function writeStep12(seedId, step12Doc, dstRoot) {
  const out = path.join(dstRoot, seedId, "seed", "seed.elementary-assertions.yaml");
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, YAML.stringify(step12Doc), "utf8");
  return out;
}

function copySeedTxt(seedId, dstRoot) {
  const src = path.join(artifactsRoot, seedId, "seed", "seed.txt");
  const dst = path.join(dstRoot, seedId, "seed", "seed.txt");
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(src, dst);
}

function readYaml(filePath) {
  return YAML.parse(fs.readFileSync(filePath, "utf8"));
}

function buildMinimalStep12ForUnit() {
  return {
    schema_version: "1.0.0",
    seed_id: "unit",
    stage: "elementary_assertions",
    canonical_text: "Alpha!! Beta",
    tokens: [
      { id: "t1", pos: { tag: "NN", coarse: "NOUN" } },
      { id: "t2", pos: { tag: "NN", coarse: "NOUN" } },
      { id: "t3", pos: { tag: "NN", coarse: "NOUN" } },
      { id: "t4", pos: { tag: "CD", coarse: "NUM" } },
    ],
    mentions: [
      { id: "m1", kind: "token", is_primary: true, token_ids: ["t1"], head_token_id: "t1", span: { start: 0, end: 7 } },
      { id: "m2", kind: "mwe", is_primary: true, token_ids: ["t2", "t3"], head_token_id: "t3", span: { start: 8, end: 12 } },
      { id: "m3", kind: "token", is_primary: false, token_ids: ["t4"], head_token_id: "t4", span: { start: 0, end: 7 } },
    ],
    assertions: [
      {
        id: "a1",
        arguments: [{ role: "actor", mention_ids: ["m1"] }],
        modifiers: [{ role: "beneficiary", mention_ids: ["m2", "m3"] }],
        evidence: {
          wiki_signals: {
            mention_evidence: [
              {
                mention_id: "m1",
                evidence: {
                  tokens: [{ evidence: { wiki_prefix_count: 3, wiki_parenthetical_variant_count: 1 } }],
                },
              },
              {
                mention_id: "m2",
                evidence: {
                  tokens: [{ evidence: { wiki_prefix_count: 2, wiki_parenthetical_variant_count: 0 } }],
                },
              },
            ],
          },
        },
      },
    ],
    wiki_title_evidence: {
      mention_matches: {
        alpha: { wiki_prefix_count: 1, wiki_parenthetical_variant_count: 0 },
      },
    },
  };
}

function buildStep12FromWordList(seedId, words) {
  const clean = (words || []).map((w) => String(w)).filter(Boolean);
  let cursor = 0;
  const tokens = [];
  const mentions = [];
  const mentionEvidence = [];
  for (let i = 0; i < clean.length; i += 1) {
    const word = clean[i];
    const start = cursor;
    const end = start + word.length;
    cursor = end + 1;
    const tokenId = `t${i + 1}`;
    const mentionId = `m${i + 1}`;
    tokens.push({
      id: tokenId,
      i,
      span: { start, end },
      surface: word,
      normalized: word.toLowerCase(),
      pos: { tag: "NN", coarse: "NOUN" },
      flags: { is_punct: false, is_space: false, is_stop: false },
    });
    mentions.push({
      id: mentionId,
      kind: "token",
      is_primary: true,
      token_ids: [tokenId],
      head_token_id: tokenId,
      span: { start, end },
    });
    mentionEvidence.push({
      mention_id: mentionId,
      evidence: {
        tokens: [{ evidence: { wiki_prefix_count: 1, wiki_parenthetical_variant_count: 0 } }],
      },
    });
  }
  return {
    schema_version: "1.0.0",
    seed_id: seedId,
    stage: "elementary_assertions",
    canonical_text: clean.join(" "),
    tokens,
    mentions,
    assertions: [
      {
        id: "a1",
        arguments: [{ role: "actor", mention_ids: mentions.map((m) => m.id) }],
        modifiers: [],
        evidence: { wiki_signals: { mention_evidence: mentionEvidence } },
      },
    ],
    wiki_title_evidence: {
      mention_matches: {
        seed: { wiki_prefix_count: 1, wiki_parenthetical_variant_count: 0 },
      },
    },
  };
}

function buildSingleMentionStep12({
  seedId,
  text,
  mentionSurface,
  mentionKind = "chunk",
  tokenTag = "NN",
  tokenCoarse = "NOUN",
}) {
  const canonicalText = String(text);
  const surface = String(mentionSurface);
  const start = canonicalText.indexOf(surface);
  assert.ok(start >= 0, "mentionSurface must be contained in text");
  const end = start + surface.length;
  return {
    schema_version: "1.0.0",
    seed_id: seedId,
    stage: "elementary_assertions",
    canonical_text: canonicalText,
    tokens: [
      {
        id: "t1",
        i: 0,
        span: { start, end },
        surface,
        normalized: surface.toLowerCase(),
        pos: { tag: tokenTag, coarse: tokenCoarse },
        flags: { is_punct: false, is_space: false, is_stop: false },
      },
    ],
    mentions: [
      {
        id: "m1",
        kind: mentionKind,
        is_primary: true,
        token_ids: ["t1"],
        head_token_id: "t1",
        span: { start, end },
      },
    ],
    assertions: [
      {
        id: "a1",
        arguments: [{ role: "actor", mention_ids: ["m1"] }],
        modifiers: [],
        evidence: {
          wiki_signals: {
            mention_evidence: [
              {
                mention_id: "m1",
                evidence: {
                  tokens: [{ evidence: { wiki_prefix_count: 1, wiki_parenthetical_variant_count: 0 } }],
                },
              },
            ],
          },
        },
      },
    ],
    wiki_title_evidence: {
      mention_matches: {
        seed: { wiki_prefix_count: 1, wiki_parenthetical_variant_count: 0 },
      },
    },
  };
}

function testCanonicalization() {
  const got = canonicalizeSurface("  Älpha---Beta\t\n");
  assert.equal(got, "lpha_beta");
}

function testUnitBuild() {
  const step12 = buildMinimalStep12ForUnit();
  const out = buildConceptCandidatesFromStep12(step12);
  assert.equal(out.stage, "concept_candidates");
  assert.equal(out.concept_candidates.length, 2);

  const c1 = out.concept_candidates.find((c) => c.canonical === "alpha");
  const c2 = out.concept_candidates.find((c) => c.canonical === "beta");
  assert.ok(c1);
  assert.ok(c2);
  assert.equal(c1.roles.actor, 1);
  assert.equal(c1.roles.other, 0);
  assert.equal(c2.roles.other, 1);
  assert.equal(c2.roles.actor, 0);
  assert.equal(c1.wikipedia_title_index.wiki_prefix_count, 3);
  assert.equal(c2.wikipedia_title_index.wiki_prefix_count, 2);
}

function testFailureNonIntegerCount() {
  const step12 = buildMinimalStep12ForUnit();
  step12.assertions[0].evidence.wiki_signals.mention_evidence[0].evidence.tokens[0].evidence.wiki_prefix_count = "3";
  assert.throws(() => buildConceptCandidatesFromStep12(step12), /Non-integer/i);
}

function testFailureUnknownMentionRef() {
  const step12 = buildMinimalStep12ForUnit();
  step12.assertions[0].arguments[0].mention_ids = ["missing"];
  assert.throws(() => buildConceptCandidatesFromStep12(step12), /unknown mention id/i);
}

function testFailureEmptyCanonical() {
  const step12 = buildMinimalStep12ForUnit();
  step12.canonical_text = "!!! !!!";
  assert.throws(() => buildConceptCandidatesFromStep12(step12), /empty key/i);
}

function testDeterministicSerialization() {
  const step12 = buildMinimalStep12ForUnit();
  const out = buildConceptCandidatesFromStep12(step12);
  const a = serializeDeterministicYaml(out);
  const b = serializeDeterministicYaml(out);
  assert.equal(a, b);
  assert.ok(a.endsWith("\n"));
  assert.ok(!a.endsWith("\n\n"));
  assert.ok(!a.includes("\r\n"));
}

function testWikipediaTitleIndexPolicyAssertionOnly() {
  const step12 = buildMinimalStep12ForUnit();
  step12.assertions[0].evidence.wiki_signals.mention_evidence = [];
  step12.mentions[0].provenance = {
    lexicon_evidence: {
      tokens: [{ evidence: { wiki_prefix_count: 9, wiki_parenthetical_variant_count: 0 } }],
    },
  };
  const outFallback = buildConceptCandidatesFromStep12(step12, { wikipediaTitleIndexPolicy: "assertion_then_lexicon_fallback" });
  const outAssertionOnly = buildConceptCandidatesFromStep12(step12, { wikipediaTitleIndexPolicy: "assertion_only" });
  const cFallback = outFallback.concept_candidates.find((c) => c.canonical === "alpha");
  const cAssertionOnly = outAssertionOnly.concept_candidates.find((c) => c.canonical === "alpha");
  assert.equal(cFallback.wikipedia_title_index.wiki_prefix_count, 9);
  assert.equal(cAssertionOnly.wikipedia_title_index.wiki_prefix_count, 0);
}

function testEmitWikipediaTitleIndexEvidence() {
  const step12 = buildMinimalStep12ForUnit();
  const out = buildConceptCandidatesFromStep12(step12, {
    emitWikipediaTitleIndexEvidence: true,
    wikipediaTitleIndexPolicy: "assertion_then_lexicon_fallback",
  });
  const c1 = out.concept_candidates.find((c) => c.canonical === "alpha");
  assert.ok(c1);
  assert.ok(c1.wikipedia_title_index_evidence);
  assert.equal(c1.wikipedia_title_index_evidence.wikipedia_title_index_policy, "assertion_then_lexicon_fallback");
  assert.ok(Array.isArray(c1.wikipedia_title_index_evidence.mention_contributions));
  assert.ok(c1.wikipedia_title_index_evidence.mention_contributions.length > 0);
}

function testNoWikipediaTitleIndexSignalSkipped() {
  const step12 = buildMinimalStep12ForUnit();
  step12.assertions[0].evidence.wiki_signals.mention_evidence[0].evidence.tokens[0].evidence.wiki_exact_match = true;
  step12.assertions[0].evidence.wiki_signals.mention_evidence[0].evidence.tokens[0].evidence.wiki_hyphen_space_variant_match = false;
  step12.assertions[0].evidence.wiki_signals.mention_evidence[0].evidence.tokens[0].evidence.wiki_any_signal = true;
  const out = buildConceptCandidatesFromStep12(step12, {
    emitWikipediaTitleIndexEvidence: true,
    wikipediaTitleIndexPolicy: "assertion_then_lexicon_fallback",
  });
  const c1 = out.concept_candidates.find((c) => c.canonical === "alpha");
  assert.ok(c1);
  assert.equal(c1.wikipedia_title_index.wiki_exact_match, true);
  assert.equal(c1.wikipedia_title_index.wiki_hyphen_space_variant_match, false);
  assert.equal(c1.wikipedia_title_index.wiki_any_signal, true);
  const mc = c1.wikipedia_title_index_evidence.mention_contributions.find((x) => x.mention_id === "m1");
  assert.ok(mc);
  assert.equal(mc.selected_signals.wiki_exact_match, true);
  assert.equal(mc.selected_signals.wiki_hyphen_space_variant_match, false);
  assert.equal(mc.selected_signals.wiki_any_signal, true);
}

function buildStep12For13bCandidateDelta() {
  return {
    schema_version: "1.0.0",
    seed_id: "unit_13b_delta",
    stage: "elementary_assertions",
    canonical_text: "alpha gamma",
    tokens: [
      {
        id: "t1",
        i: 0,
        span: { start: 0, end: 5 },
        surface: "alpha",
        normalized: "alpha",
        pos: { tag: "NN", coarse: "NOUN" },
        flags: { is_punct: false, is_space: false, is_stop: false },
      },
      {
        id: "t2",
        i: 1,
        span: { start: 6, end: 11 },
        surface: "gamma",
        normalized: "gamma",
        pos: { tag: "NN", coarse: "NOUN" },
        flags: { is_punct: false, is_space: false, is_stop: false },
      },
    ],
    mentions: [
      {
        id: "m1",
        kind: "token",
        is_primary: true,
        token_ids: ["t1"],
        head_token_id: "t1",
        span: { start: 0, end: 5 },
      },
      {
        id: "m2",
        kind: "token",
        is_primary: true,
        token_ids: ["t2"],
        head_token_id: "t2",
        span: { start: 6, end: 11 },
        provenance: { source_kind: "token_fallback" },
      },
    ],
    assertions: [
      {
        id: "a1",
        arguments: [{ role: "actor", mention_ids: ["m1"] }],
        modifiers: [],
        evidence: {
          wiki_signals: {
            mention_evidence: [
              {
                mention_id: "m1",
                evidence: {
                  tokens: [{ evidence: { wiki_prefix_count: 2, wiki_parenthetical_variant_count: 0 } }],
                },
              },
            ],
          },
        },
      },
    ],
    wiki_title_evidence: {
      mention_matches: {
        alpha: { wiki_prefix_count: 1, wiki_parenthetical_variant_count: 0 },
      },
    },
  };
}

function test13bModeContractGuard() {
  const step12 = buildStep12For13bCandidateDelta();
  const out13a = buildConceptCandidatesFromStep12(step12, { step13Mode: "13a", emitWikipediaTitleIndexEvidence: false });
  const out13b = buildConceptCandidatesFromStep12(step12, { step13Mode: "13b", emitWikipediaTitleIndexEvidence: false });

  const set13a = new Set(out13a.concept_candidates.map((c) => c.canonical));
  const set13b = new Set(out13b.concept_candidates.map((c) => c.canonical));
  assert.equal(set13a.has("gamma"), true, "Fixture sanity: 13a must include supplemental gamma candidate.");
  assert.equal(set13b.has("gamma"), true, "Fixture sanity: 13b remains structurally valid for supplemental candidate.");

  const schema = JSON.parse(fs.readFileSync(path.join(step13Dir, "seed.concept-candidates.schema.json"), "utf8"));
  validateSchema(schema, out13a);
  validateSchema(schema, out13b);

  const y13aA = serializeDeterministicYaml(buildConceptCandidatesFromStep12(step12, { step13Mode: "13a", emitWikipediaTitleIndexEvidence: false }));
  const y13aB = serializeDeterministicYaml(buildConceptCandidatesFromStep12(step12, { step13Mode: "13a", emitWikipediaTitleIndexEvidence: false }));
  const y13bA = serializeDeterministicYaml(buildConceptCandidatesFromStep12(step12, { step13Mode: "13b", emitWikipediaTitleIndexEvidence: false }));
  const y13bB = serializeDeterministicYaml(buildConceptCandidatesFromStep12(step12, { step13Mode: "13b", emitWikipediaTitleIndexEvidence: false }));
  assert.equal(y13aA, y13aB, "13a must remain deterministic.");
  assert.equal(y13bA, y13bB, "13b must remain deterministic.");

  const legacyFixture = buildStep12FromWordList("unit_13b_legacy_isolation", ["workflow", "pipeline", "ticket", "task"]);
  const out13bNoLegacy = buildConceptCandidatesFromStep12(legacyFixture, { step13Mode: "13b" });
  const noLegacyCanonicals = new Set(out13bNoLegacy.concept_candidates.map((c) => c.canonical));
  assert.equal(noLegacyCanonicals.has("workflow_pipeline"), false, "13b must not activate legacy synthesis without legacy flag.");
}

function buildStep12For13bVerbPromotion() {
  return {
    schema_version: "1.0.0",
    seed_id: "unit_13b_verb_promotion",
    stage: "elementary_assertions",
    canonical_text: "users schedule reports",
    tokens: [
      {
        id: "t1",
        i: 0,
        span: { start: 0, end: 5 },
        surface: "users",
        normalized: "users",
        pos: { tag: "NNS", coarse: "NOUN" },
        flags: { is_punct: false, is_space: false, is_stop: false },
      },
      {
        id: "t2",
        i: 1,
        span: { start: 6, end: 14 },
        surface: "schedule",
        normalized: "schedule",
        pos: { tag: "VB", coarse: "VERB" },
        flags: { is_punct: false, is_space: false, is_stop: false },
      },
      {
        id: "t3",
        i: 2,
        span: { start: 15, end: 22 },
        surface: "reports",
        normalized: "reports",
        pos: { tag: "NNS", coarse: "NOUN" },
        flags: { is_punct: false, is_space: false, is_stop: false },
      },
    ],
    mentions: [
      { id: "m1", kind: "token", is_primary: true, token_ids: ["t1"], head_token_id: "t1", span: { start: 0, end: 5 } },
      { id: "m2", kind: "token", is_primary: true, token_ids: ["t2"], head_token_id: "t2", span: { start: 6, end: 14 } },
      { id: "m3", kind: "token", is_primary: true, token_ids: ["t3"], head_token_id: "t3", span: { start: 15, end: 22 } },
    ],
    assertions: [
      {
        id: "a1",
        arguments: [{ role: "actor", mention_ids: ["m1"] }, { role: "theme", mention_ids: ["m3"] }],
        modifiers: [{ role: "topic", mention_ids: ["m2"] }],
        evidence: {
          wiki_signals: {
            mention_evidence: [
              {
                mention_id: "m1",
                evidence: { tokens: [{ evidence: { wiki_prefix_count: 2, wiki_parenthetical_variant_count: 0 } }] },
              },
              {
                mention_id: "m2",
                evidence: { tokens: [{ evidence: { wiki_prefix_count: 5, wiki_parenthetical_variant_count: 0 } }] },
              },
              {
                mention_id: "m3",
                evidence: { tokens: [{ evidence: { wiki_prefix_count: 1, wiki_parenthetical_variant_count: 0 } }] },
              },
            ],
          },
        },
      },
    ],
    wiki_title_evidence: {
      mention_matches: {
        users: { wiki_prefix_count: 1, wiki_parenthetical_variant_count: 0 },
      },
    },
  };
}

function test13bVerbPromotionWithWikipediaTitleIndex() {
  const step12 = buildStep12For13bVerbPromotion();
  const out13a = buildConceptCandidatesFromStep12(step12, { step13Mode: "13a" });
  const out13b = buildConceptCandidatesFromStep12(step12, { step13Mode: "13b" });
  const set13a = new Set(out13a.concept_candidates.map((c) => c.canonical));
  const set13b = new Set(out13b.concept_candidates.map((c) => c.canonical));
  assert.equal(set13a.has("schedule"), false, "13a should keep verb singleton excluded.");
  assert.equal(set13b.has("schedule"), true, "13b should promote role-linked verb singleton with strong Wikipedia Title Index evidence.");
}

function test13bDiagnosticsPolicyHits() {
  const step12 = buildStep12For13bVerbPromotion();
  const out = buildConceptCandidatesFromStep12(step12, {
    step13Mode: "13b",
    collectDiagnostics: true,
    emitWikipediaTitleIndexEvidence: false,
  });
  const d = out._diagnostics || {};
  assert.equal(typeof d.mode13b_by_canonical, "object");
  assert.ok(d.mode13b_by_canonical.schedule);
  const hits = d.mode13b_by_canonical.schedule.policy_hits || [];
  assert.ok(Array.isArray(hits));
  assert.ok(hits.includes("promotion_verb_wikipedia_count"));
}

function test13bUnlinkedFiniteVerbPromotion() {
  const step12 = buildStep12FromWordList("unit_13b_unlinked_verb", ["collections"]);
  const mention = step12.mentions[0];
  mention.provenance = { source_kind: "token_fallback" };
  step12.tokens[0].pos = { tag: "VBZ", coarse: "VERB" };
  step12.assertions[0].arguments = [];
  step12.assertions[0].modifiers = [];
  step12.assertions[0].evidence = {
    wiki_signals: {
      mention_evidence: [
        {
          mention_id: mention.id,
          evidence: { tokens: [{ evidence: { wiki_prefix_count: 200, wiki_parenthetical_variant_count: 0 } }] },
        },
      ],
    },
  };
  const out13a = buildConceptCandidatesFromStep12(step12, { step13Mode: "13a" });
  const out13b = buildConceptCandidatesFromStep12(step12, { step13Mode: "13b" });
  const s13a = new Set(out13a.concept_candidates.map((c) => c.canonical));
  const s13b = new Set(out13b.concept_candidates.map((c) => c.canonical));
  assert.equal(s13a.has("collections"), false);
  assert.equal(s13b.has("collections"), true);
}

function buildStep12For13bParticipialChunkSuppression() {
  return {
    schema_version: "1.0.0",
    seed_id: "unit_13b_participial_chunk",
    stage: "elementary_assertions",
    canonical_text: "complemented by folders",
    tokens: [
      {
        id: "t1",
        i: 0,
        span: { start: 0, end: 12 },
        surface: "complemented",
        normalized: "complemented",
        pos: { tag: "VBN", coarse: "VERB" },
        flags: { is_punct: false, is_space: false, is_stop: false },
      },
      {
        id: "t2",
        i: 1,
        span: { start: 13, end: 15 },
        surface: "by",
        normalized: "by",
        pos: { tag: "IN", coarse: "ADP" },
        flags: { is_punct: false, is_space: false, is_stop: false },
      },
      {
        id: "t3",
        i: 2,
        span: { start: 16, end: 23 },
        surface: "folders",
        normalized: "folders",
        pos: { tag: "NNS", coarse: "NOUN" },
        flags: { is_punct: false, is_space: false, is_stop: false },
      },
    ],
    mentions: [
      {
        id: "m1",
        kind: "chunk",
        is_primary: false,
        token_ids: ["t1", "t2", "t3"],
        head_token_id: "t1",
        span: { start: 0, end: 23 },
        provenance: { source_kind: "chunk_accepted" },
      },
    ],
    assertions: [
      {
        id: "a1",
        arguments: [],
        modifiers: [{ role: "other", mention_ids: ["m1"] }],
        evidence: {
          wiki_signals: {
            mention_evidence: [
              {
                mention_id: "m1",
                evidence: {
                  tokens: [{ evidence: { wiki_prefix_count: 20, wiki_parenthetical_variant_count: 0 } }],
                },
              },
            ],
          },
        },
      },
    ],
    wiki_title_evidence: {
      mention_matches: {
        seed: { wiki_prefix_count: 1, wiki_parenthetical_variant_count: 0 },
      },
    },
  };
}

function buildStep12For13bShortSymbolicSuppression() {
  return {
    schema_version: "1.0.0",
    seed_id: "unit_13b_short_symbolic",
    stage: "elementary_assertions",
    canonical_text: "i.e.",
    tokens: [
      {
        id: "t1",
        i: 0,
        span: { start: 0, end: 4 },
        surface: "i.e.",
        normalized: "i.e.",
        pos: { tag: "NNP", coarse: "NOUN" },
        flags: { is_punct: false, is_space: false, is_stop: false },
      },
    ],
    mentions: [
      {
        id: "m1",
        kind: "token",
        is_primary: true,
        token_ids: ["t1"],
        head_token_id: "t1",
        span: { start: 0, end: 4 },
        provenance: { source_kind: "token_fallback" },
      },
      {
        id: "m2",
        kind: "chunk",
        is_primary: false,
        token_ids: ["t1"],
        head_token_id: "t1",
        span: { start: 0, end: 4 },
        provenance: { source_kind: "chunk_accepted" },
      },
    ],
    assertions: [
      {
        id: "a1",
        arguments: [],
        modifiers: [],
        evidence: {
          wiki_signals: {
            mention_evidence: [
              {
                mention_id: "m1",
                evidence: {
                  tokens: [{ evidence: { wiki_prefix_count: 80, wiki_parenthetical_variant_count: 0 } }],
                },
              },
              {
                mention_id: "m2",
                evidence: {
                  tokens: [{ evidence: { wiki_prefix_count: 80, wiki_parenthetical_variant_count: 0 } }],
                },
              },
            ],
          },
        },
      },
    ],
    wiki_title_evidence: {
      mention_matches: {
        seed: { wiki_prefix_count: 1, wiki_parenthetical_variant_count: 0 },
      },
    },
  };
}

function buildStep12For13bContainmentMerge() {
  return {
    schema_version: "1.0.0",
    seed_id: "unit_13b_merge",
    stage: "elementary_assertions",
    canonical_text: "tenant scope role",
    tokens: [
      {
        id: "t1",
        i: 0,
        span: { start: 0, end: 6 },
        surface: "tenant",
        normalized: "tenant",
        pos: { tag: "NN", coarse: "NOUN" },
        flags: { is_punct: false, is_space: false, is_stop: false },
      },
      {
        id: "t2",
        i: 1,
        span: { start: 7, end: 12 },
        surface: "scope",
        normalized: "scope",
        pos: { tag: "NN", coarse: "NOUN" },
        flags: { is_punct: false, is_space: false, is_stop: false },
      },
      {
        id: "t3",
        i: 2,
        span: { start: 13, end: 17 },
        surface: "role",
        normalized: "role",
        pos: { tag: "NN", coarse: "NOUN" },
        flags: { is_punct: false, is_space: false, is_stop: false },
      },
    ],
    mentions: [
      {
        id: "m1",
        kind: "chunk",
        is_primary: false,
        token_ids: ["t1", "t2"],
        head_token_id: "t2",
        span: { start: 0, end: 12 },
        provenance: { source_kind: "chunk_accepted" },
      },
      {
        id: "m2",
        kind: "chunk",
        is_primary: false,
        token_ids: ["t1", "t2", "t3"],
        head_token_id: "t3",
        span: { start: 0, end: 17 },
        provenance: { source_kind: "chunk_accepted" },
      },
    ],
    assertions: [
      {
        id: "a1",
        arguments: [],
        modifiers: [],
        evidence: {
          wiki_signals: {
            mention_evidence: [
              {
                mention_id: "m1",
                evidence: {
                  tokens: [{ evidence: { wiki_prefix_count: 5, wiki_parenthetical_variant_count: 0 } }],
                },
              },
              {
                mention_id: "m2",
                evidence: {
                  tokens: [{ evidence: { wiki_prefix_count: 20, wiki_parenthetical_variant_count: 0 } }],
                },
              },
            ],
          },
        },
      },
    ],
    wiki_title_evidence: {
      mention_matches: {
        seed: { wiki_prefix_count: 1, wiki_parenthetical_variant_count: 0 },
      },
    },
  };
}

function buildStep12ForAliasDeterminerGuard() {
  return {
    schema_version: "1.0.0",
    seed_id: "unit_alias_determiner_guard",
    stage: "elementary_assertions",
    canonical_text: "record of the order",
    tokens: [
      {
        id: "t1",
        i: 0,
        span: { start: 0, end: 6 },
        surface: "record",
        normalized: "record",
        pos: { tag: "NN", coarse: "NOUN" },
        flags: { is_punct: false, is_space: false, is_stop: false },
      },
      {
        id: "t2",
        i: 1,
        span: { start: 7, end: 9 },
        surface: "of",
        normalized: "of",
        pos: { tag: "IN", coarse: "ADP" },
        flags: { is_punct: false, is_space: false, is_stop: false },
      },
      {
        id: "t3",
        i: 2,
        span: { start: 10, end: 13 },
        surface: "the",
        normalized: "the",
        pos: { tag: "DT", coarse: "DET" },
        flags: { is_punct: false, is_space: false, is_stop: false },
      },
      {
        id: "t4",
        i: 3,
        span: { start: 14, end: 19 },
        surface: "order",
        normalized: "order",
        pos: { tag: "NN", coarse: "NOUN" },
        flags: { is_punct: false, is_space: false, is_stop: false },
      },
    ],
    mentions: [
      {
        id: "m1",
        kind: "mwe",
        is_primary: true,
        token_ids: ["t1", "t2", "t3", "t4"],
        head_token_id: "t4",
        span: { start: 0, end: 19 },
        provenance: { source_kind: "mwe_materialized" },
      },
    ],
    assertions: [
      {
        id: "a1",
        arguments: [{ role: "theme", mention_ids: ["m1"] }],
        modifiers: [],
        evidence: {
          wiki_signals: {
            mention_evidence: [
              {
                mention_id: "m1",
                evidence: {
                  tokens: [{ evidence: { wiki_prefix_count: 4, wiki_parenthetical_variant_count: 0 } }],
                },
              },
            ],
          },
        },
      },
    ],
    wiki_title_evidence: {
      mention_matches: {
        seed: { wiki_prefix_count: 1, wiki_parenthetical_variant_count: 0 },
      },
    },
  };
}

function buildStep12ForTwoTokenParticipialLiftSuppression() {
  return {
    schema_version: "1.0.0",
    seed_id: "unit_13b_two_token_participial",
    stage: "elementary_assertions",
    canonical_text: "authenticate using credentials",
    tokens: [
      {
        id: "t1",
        i: 0,
        span: { start: 0, end: 12 },
        surface: "authenticate",
        normalized: "authenticate",
        pos: { tag: "VBP", coarse: "VERB" },
        flags: { is_punct: false, is_space: false, is_stop: false },
      },
      {
        id: "t2",
        i: 1,
        span: { start: 13, end: 18 },
        surface: "using",
        normalized: "using",
        pos: { tag: "VBG", coarse: "VERB" },
        flags: { is_punct: false, is_space: false, is_stop: false },
      },
      {
        id: "t3",
        i: 2,
        span: { start: 19, end: 30 },
        surface: "credentials",
        normalized: "credentials",
        pos: { tag: "NNS", coarse: "NOUN" },
        flags: { is_punct: false, is_space: false, is_stop: false },
      },
    ],
    mentions: [
      {
        id: "m1",
        kind: "mwe",
        is_primary: true,
        token_ids: ["t2", "t3"],
        head_token_id: "t3",
        span: { start: 13, end: 30 },
        provenance: { source_kind: "mwe_materialized" },
      },
      {
        id: "m2",
        kind: "chunk",
        is_primary: false,
        token_ids: ["t1", "t2", "t3"],
        head_token_id: "t1",
        span: { start: 0, end: 30 },
        provenance: { source_kind: "chunk_accepted" },
      },
    ],
    assertions: [
      {
        id: "a1",
        arguments: [],
        modifiers: [],
        evidence: {
          wiki_signals: {
            mention_evidence: [
              {
                mention_id: "m1",
                evidence: {
                  tokens: [{ evidence: { wiki_prefix_count: 12, wiki_parenthetical_variant_count: 0 } }],
                },
              },
              {
                mention_id: "m2",
                evidence: {
                  tokens: [{ evidence: { wiki_prefix_count: 12, wiki_parenthetical_variant_count: 0 } }],
                },
              },
            ],
          },
        },
      },
    ],
    wiki_title_evidence: {
      mention_matches: {
        seed: { wiki_prefix_count: 1, wiki_parenthetical_variant_count: 0 },
      },
    },
  };
}

function test13bParticipialChunkSuppressionWithWeakCoreRole() {
  const step12 = buildStep12For13bParticipialChunkSuppression();
  const out13a = buildConceptCandidatesFromStep12(step12, { step13Mode: "13a" });
  const out13b = buildConceptCandidatesFromStep12(step12, { step13Mode: "13b", collectDiagnostics: true });
  const set13a = new Set(out13a.concept_candidates.map((c) => c.canonical));
  const set13b = new Set(out13b.concept_candidates.map((c) => c.canonical));
  assert.equal(set13a.has("complemented"), true, "13a fixture sanity: complemented candidate should exist.");
  assert.equal(set13b.has("complemented"), false, "13b should suppress participial chunk reduction with weak core role support.");
  const hits = (((out13b._diagnostics || {}).mode13b_by_canonical || {}).complemented || {}).policy_hits || [];
  assert.ok(hits.includes("suppress_participial_chunk_reduction"));
}

function test13bShortSymbolicSuppression() {
  const step12 = buildStep12For13bShortSymbolicSuppression();
  const out13a = buildConceptCandidatesFromStep12(step12, { step13Mode: "13a" });
  const out13b = buildConceptCandidatesFromStep12(step12, { step13Mode: "13b", collectDiagnostics: true });
  const set13a = new Set(out13a.concept_candidates.map((c) => c.canonical));
  const set13b = new Set(out13b.concept_candidates.map((c) => c.canonical));
  assert.equal(set13a.has("i_e"), true, "13a fixture sanity: i_e should exist before 13b suppression.");
  assert.equal(set13b.has("i_e"), false, "13b should suppress short symbolic punctuation-collapse artifacts.");
  const hits = (((out13b._diagnostics || {}).mode13b_by_canonical || {}).i_e || {}).policy_hits || [];
  assert.ok(hits.includes("suppress_short_symbolic_token"));
}

function test13bMergeIntoStrongerHost() {
  const step12 = buildStep12For13bContainmentMerge();
  const out13b = buildConceptCandidatesFromStep12(step12, { step13Mode: "13b", collectDiagnostics: true });
  const set13b = new Set(out13b.concept_candidates.map((c) => c.canonical));
  assert.equal(set13b.has("tenant_scope"), false, "13b should not emit weak contained candidate after merge/suppress resolution.");
  assert.equal(set13b.has("tenant_scope_role"), true);
  const host = out13b.concept_candidates.find((c) => c.canonical === "tenant_scope_role");
  assert.ok(host);
  assert.equal(host.mention_ids.length, 2, "Merged host should absorb mention ids from weaker contained candidate.");
  const hits = (((out13b._diagnostics || {}).mode13b_by_canonical || {}).tenant_scope || {}).policy_hits || [];
  assert.ok(hits.includes("merge_into_stronger_host"));
}

function testAliasDeterminerGuard() {
  const step12 = buildStep12ForAliasDeterminerGuard();
  const out = buildConceptCandidatesFromStep12(step12, {
    step13Mode: "13a",
    collectDiagnostics: true,
  });
  const got = new Set(out.concept_candidates.map((c) => c.canonical));
  assert.equal(got.has("record_of_the_order"), true);
  assert.equal(got.has("order"), true, "tail1 alias should still be emitted.");
  assert.equal(got.has("the_order"), false, "alias guard must block determiner-prefixed tail aliases.");
  const source = (out._diagnostics || {}).source_by_canonical || {};
  assert.equal(Object.prototype.hasOwnProperty.call(source, "the_order"), false, "the_order must not be marked as alias source.");
}

function test13bSuppressesTwoTokenParticipialLifts() {
  const step12 = buildStep12ForTwoTokenParticipialLiftSuppression();
  const out13a = buildConceptCandidatesFromStep12(step12, { step13Mode: "13a" });
  const out13b = buildConceptCandidatesFromStep12(step12, {
    step13Mode: "13b",
    collectDiagnostics: true,
  });
  const set13a = new Set(out13a.concept_candidates.map((c) => c.canonical));
  const set13b = new Set(out13b.concept_candidates.map((c) => c.canonical));
  assert.equal(set13a.has("using_credentials"), true, "13a fixture sanity: using_credentials should exist.");
  assert.equal(set13b.has("using_credentials"), false, "13b should suppress two-token participial lifts.");
  const hits = (((out13b._diagnostics || {}).mode13b_by_canonical || {}).using_credentials || {}).policy_hits || [];
  assert.ok(hits.includes("suppress_two_token_participial_lift"));
}

function testBenchmarkPolicyNoteExists() {
  const policyPath = path.join(step13Dir, "BENCHMARK_POLICY.md");
  assert.ok(fs.existsSync(policyPath), "BENCHMARK_POLICY.md must exist.");
  const text = fs.readFileSync(policyPath, "utf8");
  assert.match(text, /Normative Target/);
  assert.match(text, /Rationale Log/);
  assert.match(text, /independent\.expected-concept-candidates\.yaml/);
}

function testGenericDefaultBlocksLegacyTemplates() {
  const step12 = buildStep12FromWordList("unit_generic_default", [
    "workflow",
    "pipeline",
    "document",
    "item",
    "file",
    "attachment",
    "comment",
    "note",
    "task",
    "ticket",
    "approval",
    "review",
    "owner",
    "data",
    "classification",
    "job",
    "event",
    "folder",
    "seat",
    "limit",
    "entitlement",
  ]);
  const out = buildConceptCandidatesFromStep12(step12);
  const got = new Set(out.concept_candidates.map((c) => c.canonical));
  const forbidden = [
    "workflow_pipeline",
    "document_item",
    "file_attachment",
    "comment_note",
    "task_ticket_issue",
    "approval_review",
    "ownership",
    "data_classification",
    "run",
    "schedule",
    "trigger",
    "issue",
    "collection",
    "job_run",
    "schedule_trigger",
    "folder_collection",
    "seat_license",
    "rate_limit_quota",
  ];
  for (const canonical of forbidden) {
    assert.equal(got.has(canonical), false, `Generic 13a must not synthesize legacy canonical: ${canonical}`);
  }
}

function test13aGoldenDeterminismPersistedCli() {
  const tmpArtifacts = mkTmpArtifacts();
  const seedId = "unit_13a_golden";
  const step12 = buildStep12FromWordList(seedId, ["alpha", "beta", "gamma"]);
  const step12Path = writeStep12(seedId, step12, tmpArtifacts);
  const outA = path.join(tmpArtifacts, seedId, "seed", "a.concept-candidates.yaml");
  const outB = path.join(tmpArtifacts, seedId, "seed", "b.concept-candidates.yaml");

  const runA = runNode("concept-candidates.js", ["--step12-in", step12Path, "--out", outA, "--no-emit-wikipedia-title-index-evidence"]);
  const runB = runNode("concept-candidates.js", ["--step12-in", step12Path, "--out", outB, "--no-emit-wikipedia-title-index-evidence"]);
  assert.equal(runA.status, 0, runA.stderr || runA.stdout);
  assert.equal(runB.status, 0, runB.stderr || runB.stdout);
  const a = fs.readFileSync(outA, "utf8");
  const b = fs.readFileSync(outB, "utf8");
  assert.equal(a, b, "Default persisted CLI output must be byte-identical for pinned Step12 input.");
}

function testAntiLeakLegacyDropList() {
  const step12 = buildSingleMentionStep12({
    seedId: "unit_antileak_drop",
    text: "classic saas system",
    mentionSurface: "classic saas system",
    mentionKind: "chunk",
    tokenTag: "NN",
    tokenCoarse: "NOUN",
  });
  const genericOut = buildConceptCandidatesFromStep12(step12, { step13Mode: "13a" });
  const legacyOut = buildConceptCandidatesFromStep12(step12, { enableLegacyEnrichment: true });
  const generic = new Set(genericOut.concept_candidates.map((c) => c.canonical));
  const legacy = new Set(legacyOut.concept_candidates.map((c) => c.canonical));
  assert.equal(generic.has("classic_saas_system"), true, "13a should not apply legacy drop list.");
  assert.equal(legacy.has("classic_saas_system"), false, "Legacy mode should apply legacy drop list.");
}

function testAntiLeakAcronymCollapse() {
  const step12 = buildSingleMentionStep12({
    seedId: "unit_antileak_abac",
    text: "abac policy",
    mentionSurface: "abac policy",
    mentionKind: "chunk",
    tokenTag: "NN",
    tokenCoarse: "NOUN",
  });
  const genericOut = buildConceptCandidatesFromStep12(step12, { step13Mode: "13a" });
  const legacyOut = buildConceptCandidatesFromStep12(step12, { enableLegacyEnrichment: true });
  const generic = new Set(genericOut.concept_candidates.map((c) => c.canonical));
  const legacy = new Set(legacyOut.concept_candidates.map((c) => c.canonical));
  assert.equal(generic.has("abac_policy"), true);
  assert.equal(generic.has("abac"), false, "13a must not run acronym collapse.");
  assert.equal(legacy.has("abac"), true, "Legacy mode may run acronym collapse.");
}

function testAntiLeakNominalVerbWhitelist() {
  const step12 = buildSingleMentionStep12({
    seedId: "unit_antileak_nomverb",
    text: "schedule",
    mentionSurface: "schedule",
    mentionKind: "token",
    tokenTag: "VBZ",
    tokenCoarse: "VERB",
  });
  const genericOut = buildConceptCandidatesFromStep12(step12, { step13Mode: "13a" });
  const legacyOut = buildConceptCandidatesFromStep12(step12, { enableLegacyEnrichment: true });
  const generic = new Set(genericOut.concept_candidates.map((c) => c.canonical));
  const legacy = new Set(legacyOut.concept_candidates.map((c) => c.canonical));
  assert.equal(generic.has("schedule"), false, "13a must not use legacy nominal-verb whitelist.");
  assert.equal(legacy.has("schedule"), true, "Legacy mode may use legacy nominal-verb whitelist.");
}

function testLegacyEnrichmentRegression() {
  const step12 = buildStep12FromWordList("unit_recovery", [
    "workflow",
    "pipeline",
    "document",
    "item",
    "file",
    "attachment",
    "comment",
    "note",
    "task",
    "ticket",
    "approval",
    "review",
    "owner",
    "data",
    "classification",
    "job",
    "event",
    "folder",
    "seat",
    "limit",
    "entitlement",
  ]);
  const out = buildConceptCandidatesFromStep12(step12, {
    enableLegacyEnrichment: true,
    enableRecoverySynthesis: true,
  });
  const got = new Set(out.concept_candidates.map((c) => c.canonical));
  const expected = [
    "workflow_pipeline",
    "document_item",
    "file_attachment",
    "comment_note",
    "task_ticket_issue",
    "approval_review",
    "ownership",
    "data_classification",
    "run",
    "schedule",
    "trigger",
    "issue",
    "collection",
    "job_run",
    "schedule_trigger",
    "folder_collection",
    "seat_license",
    "rate_limit_quota",
  ];
  for (const canonical of expected) {
    assert.ok(got.has(canonical), `Expected synthesized canonical: ${canonical}`);
  }
}

function testDisableRecoverySynthesisFlag() {
  const step12 = buildStep12FromWordList("unit_recovery_toggle", [
    "workflow",
    "pipeline",
    "document",
    "item",
    "file",
    "attachment",
    "comment",
    "note",
    "task",
    "ticket",
    "approval",
    "review",
    "owner",
    "data",
    "classification",
    "job",
    "event",
    "folder",
    "seat",
    "limit",
    "entitlement",
  ]);
  const out = buildConceptCandidatesFromStep12(step12, {
    enableLegacyEnrichment: true,
    enableRecoverySynthesis: false,
  });
  const got = new Set(out.concept_candidates.map((c) => c.canonical));
  const recoveryOnly = [
    "license",
    "rate",
    "quota",
  ];
  for (const canonical of recoveryOnly) {
    assert.equal(got.has(canonical), false, `Recovery canonical should be disabled: ${canonical}`);
  }
}

function test13aVsLegacyDeltaGuard() {
  const step12 = buildStep12FromWordList("unit_13a_vs_legacy", [
    "workflow",
    "pipeline",
    "document",
    "item",
    "seat",
    "limit",
    "entitlement",
    "abac",
    "policy",
  ]);
  const genericOut = buildConceptCandidatesFromStep12(step12, { step13Mode: "13a" });
  const legacyOut = buildConceptCandidatesFromStep12(step12, {
    enableLegacyEnrichment: true,
    enableRecoverySynthesis: true,
  });
  const genericYaml = serializeDeterministicYaml(genericOut);
  const legacyYaml = serializeDeterministicYaml(legacyOut);
  assert.notEqual(genericYaml, legacyYaml, "13a and legacy outputs must differ for pinned delta fixture.");
  assert.deepEqual(Object.keys(genericOut), Object.keys(legacyOut));
}

function testPersistedModeCli() {
  const tmpArtifacts = mkTmpArtifacts();
  const seedId = "unit_persisted";
  const step12 = buildMinimalStep12ForUnit();
  const step12Path = writeStep12(seedId, step12, tmpArtifacts);
  const outPath = path.join(tmpArtifacts, seedId, "seed", "seed.concept-candidates.yaml");
  const diagOut = path.join(tmpArtifacts, seedId, "seed", "seed.concept-candidates.diag.json");
  const metaOut = path.join(tmpArtifacts, seedId, "seed", "seed.concept-candidates.meta.json");

  const run = runNode("concept-candidates.js", [
    "--step12-in",
    step12Path,
    "--out",
    outPath,
    "--diag-out",
    diagOut,
    "--meta-out",
    metaOut,
    "--no-emit-wikipedia-title-index-evidence",
  ]);
  assert.equal(run.status, 0, run.stderr || run.stdout);
  assert.match(run.stdout, /mode=persisted_step12/);
  assert.ok(fs.existsSync(outPath), "Persisted mode did not write output yaml.");
  assert.ok(fs.existsSync(diagOut), "Persisted mode did not write diagnostics.");
  assert.ok(fs.existsSync(metaOut), "Persisted mode did not write metadata.");

  const diag = JSON.parse(fs.readFileSync(diagOut, "utf8"));
  assert.deepEqual(Object.keys(diag), ["source_by_canonical", "mode13b_by_canonical", "stats"]);
  assert.equal(typeof diag.source_by_canonical, "object");
  assert.equal(typeof diag.mode13b_by_canonical, "object");
  assert.equal(typeof diag.stats, "object");
  assert.equal(typeof diag.stats.phase_ms, "object");

  const meta = JSON.parse(fs.readFileSync(metaOut, "utf8"));
  assert.deepEqual(Object.keys(meta), ["mode", "seed_id", "step13", "runtime"]);
  assert.equal(meta.mode, "persisted_step12");
  assert.equal(meta.seed_id, "unit");
  assert.deepEqual(Object.keys(meta.step13), [
    "wikipedia_title_index_policy",
    "step13_mode",
    "enable_13b_mode",
    "mode13b_policy",
    "enable_supplemental",
    "enable_alias_synthesis",
    "enable_legacy_enrichment",
    "enable_recovery_synthesis",
    "emit_wikipedia_title_index_evidence",
  ]);
  assert.equal(meta.step13.enable_legacy_enrichment, false);
  assert.equal(meta.step13.enable_recovery_synthesis, false);
  assert.equal(meta.step13.emit_wikipedia_title_index_evidence, false);
  assert.equal(meta.step13.step13_mode, "13b");
  assert.equal(meta.step13.enable_13b_mode, true);
  assert.equal(typeof meta.step13.mode13b_policy, "object");
  assert.equal(typeof meta.step13.mode13b_policy.verb_promotion_min_wikipedia_count, "number");
  assert.equal(typeof meta.step13.mode13b_policy.unlinked_finite_verb_promotion_min_wikipedia_count, "number");
  assert.equal(typeof meta.step13.mode13b_policy.low_wikipedia_count_unlinked_min_avg, "number");
  assert.equal(typeof meta.step13.mode13b_policy.nonnominal_share_min, "number");
  assert.equal(typeof meta.step13.mode13b_policy.nonnominal_weak_wikipedia_count_max, "number");
  assert.equal(typeof meta.step13.mode13b_policy.merge_host_min_wikipedia_count_ratio, "number");
  assert.equal(meta.runtime.wikipedia_title_index_endpoint, null);
  const outDoc = readYaml(outPath);
  for (const c of outDoc.concept_candidates) {
    assert.equal(Object.prototype.hasOwnProperty.call(c, "wikipedia_title_index_evidence"), false, "wikipedia_title_index_evidence should be disabled by flag");
  }
}

function testEnableRecoverySynthesisCliFlag() {
  const tmpArtifacts = mkTmpArtifacts();
  const seedId = "unit_persisted_recovery";
  const step12 = buildMinimalStep12ForUnit();
  const step12Path = writeStep12(seedId, step12, tmpArtifacts);
  const outPath = path.join(tmpArtifacts, seedId, "seed", "seed.concept-candidates.yaml");
  const metaOut = path.join(tmpArtifacts, seedId, "seed", "seed.concept-candidates.meta.json");

  const run = runNode("concept-candidates.js", [
    "--step12-in",
    step12Path,
    "--out",
    outPath,
    "--meta-out",
    metaOut,
    "--enable-legacy-enrichment",
    "--enable-recovery-synthesis",
  ]);
  assert.equal(run.status, 0, run.stderr || run.stdout);
  const meta = JSON.parse(fs.readFileSync(metaOut, "utf8"));
  assert.equal(meta.mode, "persisted_step12");
  assert.equal(meta.step13.enable_legacy_enrichment, true);
  assert.equal(meta.step13.enable_recovery_synthesis, true);
}

function testStep13ModeCliMeta() {
  const tmpArtifacts = mkTmpArtifacts();
  const seedId = "unit_persisted_13b_mode";
  const step12 = buildStep12For13bCandidateDelta();
  const step12Path = writeStep12(seedId, step12, tmpArtifacts);
  const outPath = path.join(tmpArtifacts, seedId, "seed", "seed.concept-candidates.yaml");
  const metaOut = path.join(tmpArtifacts, seedId, "seed", "seed.concept-candidates.meta.json");

  const run = runNode("concept-candidates.js", [
    "--step12-in",
    step12Path,
    "--out",
    outPath,
    "--meta-out",
    metaOut,
    "--step13-mode",
    "13b",
  ]);
  assert.equal(run.status, 0, run.stderr || run.stdout);
  const meta = JSON.parse(fs.readFileSync(metaOut, "utf8"));
  assert.equal(meta.step13.step13_mode, "13b");
  assert.equal(meta.step13.enable_13b_mode, true);
}

function testRecoverySynthesisWithoutLegacyCliNoop() {
  const tmpArtifacts = mkTmpArtifacts();
  const seedId = "unit_persisted_recovery_no_legacy";
  const step12 = buildMinimalStep12ForUnit();
  const step12Path = writeStep12(seedId, step12, tmpArtifacts);
  const outA = path.join(tmpArtifacts, seedId, "seed", "a.concept-candidates.yaml");
  const outB = path.join(tmpArtifacts, seedId, "seed", "b.concept-candidates.yaml");
  const metaOut = path.join(tmpArtifacts, seedId, "seed", "seed.concept-candidates.meta.json");

  const runA = runNode("concept-candidates.js", [
    "--step12-in",
    step12Path,
    "--out",
    outA,
  ]);
  assert.equal(runA.status, 0, runA.stderr || runA.stdout);

  const runB = runNode("concept-candidates.js", [
    "--step12-in",
    step12Path,
    "--out",
    outB,
    "--meta-out",
    metaOut,
    "--enable-recovery-synthesis",
  ]);
  assert.equal(runB.status, 0, runB.stderr || runB.stdout);

  const a = fs.readFileSync(outA, "utf8");
  const b = fs.readFileSync(outB, "utf8");
  assert.equal(a, b, "Recovery flag without legacy gate must be a no-op.");

  const meta = JSON.parse(fs.readFileSync(metaOut, "utf8"));
  assert.equal(meta.step13.enable_legacy_enrichment, false);
  assert.equal(meta.step13.enable_recovery_synthesis, false);
}

function testStaticNoLiteralStringRulesTripwire() {
  const src = fs.readFileSync(path.join(step13Dir, "concept-candidates.js"), "utf8");
  assert.match(src, /if \(enableLegacyEnrichment && LEGACY_GENERIC_DROP\.has\(canonical\)\)/);
  assert.match(src, /if \(enableLegacyEnrichment && canonical\.startsWith\("generated_"\) && roleTotal === 0\)/);
  assert.match(src, /if \(enableLegacyEnrichment && parts\.length >= 2 && parts\[0\] === "abac"\)/);
  assert.match(src, /enableLegacyNominalWhitelist:\s*enableLegacyEnrichment/);
  assert.match(src, /if \(enableLegacyEnrichment\)\s*\{\s*applyLegacyStringRules\(/s);
}

function testIntegrationFromSeedText() {
  const seedIds = listSeedIds();
  assert.ok(seedIds.length > 0, "No seed ids with seed.txt found.");

  const tmpArtifacts = mkTmpArtifacts();
  for (const seedId of seedIds) {
    copySeedTxt(seedId, tmpArtifacts);
    const outPath = path.join(tmpArtifacts, seedId, "seed", "seed.concept-candidates.13a.yaml");
    const run = runNode("concept-candidates.js", [
      "--seed-id",
      seedId,
      "--artifacts-root",
      tmpArtifacts,
      "--step13-mode",
      "13a",
      "--out",
      outPath,
      "--wikipedia-title-index-endpoint",
      "http://127.0.0.1:32123",
      "--timeout-ms",
      "120000",
      "--wikipedia-title-index-timeout-ms",
      "2000",
    ]);
    assert.equal(run.status, 0, `Generator failed for ${seedId}: ${run.stderr || run.stdout}`);

    assert.ok(fs.existsSync(outPath), `Missing output for ${seedId}`);

    const check = runNode("check-concept-candidates.js", [
      "--seed-id",
      seedId,
      "--artifacts-root",
      tmpArtifacts,
      "--step13-mode",
      "13a",
    ]);
    assert.equal(check.status, 0, `Checker failed for ${seedId}: ${check.stderr || check.stdout}`);

    const doc = readYaml(outPath);
    assert.equal(doc.stage, "concept_candidates");
  }
}

function testReplayDeterminism() {
  const seedIds = listSeedIds();
  assert.ok(seedIds.length > 0, "No seed ids with seed.txt found.");
  const seedId = seedIds[0];
  const tmpArtifacts = mkTmpArtifacts();
  copySeedTxt(seedId, tmpArtifacts);
  const outPath = path.join(tmpArtifacts, seedId, "seed", "seed.concept-candidates.13a.yaml");

  const run1 = runNode("concept-candidates.js", [
    "--seed-id",
    seedId,
    "--artifacts-root",
    tmpArtifacts,
    "--step13-mode",
    "13a",
    "--out",
    outPath,
    "--wikipedia-title-index-endpoint",
    "http://127.0.0.1:32123",
  ]);
  assert.equal(run1.status, 0, run1.stderr || run1.stdout);
  const one = fs.readFileSync(outPath, "utf8");

  const run2 = runNode("concept-candidates.js", [
    "--seed-id",
    seedId,
    "--artifacts-root",
    tmpArtifacts,
    "--step13-mode",
    "13a",
    "--out",
    outPath,
    "--wikipedia-title-index-endpoint",
    "http://127.0.0.1:32123",
  ]);
  assert.equal(run2.status, 0, run2.stderr || run2.stdout);
  const two = fs.readFileSync(outPath, "utf8");
  assert.equal(two, one, "Output YAML must be byte-identical across runs.");
}

function testSaasPerformanceSoftBudget() {
  const step12Path = path.join(artifactsRoot, "saas", "seed", "seed.elementary-assertions.yaml");
  if (!fs.existsSync(step12Path)) return;
  const step12 = YAML.parse(fs.readFileSync(step12Path, "utf8"));
  const out = buildConceptCandidatesFromStep12(step12, {
    step13Mode: "13a",
    collectDiagnostics: true,
    emitWikipediaTitleIndexEvidence: false,
  });
  const stats = out._diagnostics && out._diagnostics.stats;
  assert.ok(stats && stats.phase_ms, "Missing diagnostics stats for performance budget check.");
  const totalMs = Number(stats.phase_ms.total || 0);
  // Soft guardrail: catches major complexity regressions without overfitting to local machine variance.
  assert.ok(totalMs <= 250, `SaaS 13a total_ms budget exceeded: ${totalMs}ms > 250ms`);
}

function run() {
  testCanonicalization();
  testUnitBuild();
  testFailureNonIntegerCount();
  testFailureUnknownMentionRef();
  testFailureEmptyCanonical();
  testDeterministicSerialization();
  testWikipediaTitleIndexPolicyAssertionOnly();
  testEmitWikipediaTitleIndexEvidence();
  testNoWikipediaTitleIndexSignalSkipped();
  test13bModeContractGuard();
  test13bVerbPromotionWithWikipediaTitleIndex();
  test13bUnlinkedFiniteVerbPromotion();
  test13bParticipialChunkSuppressionWithWeakCoreRole();
  test13bShortSymbolicSuppression();
  test13bMergeIntoStrongerHost();
  testAliasDeterminerGuard();
  test13bSuppressesTwoTokenParticipialLifts();
  test13bDiagnosticsPolicyHits();
  testBenchmarkPolicyNoteExists();
  test13aGoldenDeterminismPersistedCli();
  testGenericDefaultBlocksLegacyTemplates();
  testAntiLeakLegacyDropList();
  testAntiLeakAcronymCollapse();
  testAntiLeakNominalVerbWhitelist();
  testLegacyEnrichmentRegression();
  testDisableRecoverySynthesisFlag();
  test13aVsLegacyDeltaGuard();
  testPersistedModeCli();
  testEnableRecoverySynthesisCliFlag();
  testStep13ModeCliMeta();
  testRecoverySynthesisWithoutLegacyCliNoop();
  testStaticNoLiteralStringRulesTripwire();
  testIntegrationFromSeedText();
  testReplayDeterminism();
  testSaasPerformanceSoftBudget();
  console.log("concept-candidates tests passed.");
}

run();




