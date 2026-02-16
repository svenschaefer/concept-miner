# Step 13 - Concept Candidates

Step 13 is the first concept-level stage in the Secos linguistic pipeline.
Its contract is **generic US-English concept extraction**, with one optional generic extension for Wikipedia Title Index evidence propagation.

---

## Position

```
... -> relations_extracted
-> elementary_assertions        (Step 12)
-> concept_candidates           (Step 13)
-> concept_mapping
-> concept_roles
-> concept_relations
-> concept_scopes
-> normative_assertions
-> CL_construction
```

Step 12 ends linguistic projection.
Step 13 extracts concept candidates from Step 12 structure.

---

## Step 13 Modes

Step 13 has exactly two modes:

1. `13a` Generic Baseline (optional execution path)
- Uses only Step 12 structural signals:
  - mentions, spans, assertion role links, deterministic canonicalization/aggregation.
- Deterministic candidate extraction and deduplication.
- No domain knowledge in extraction rules.

2. `13b` Generic Extended Mode (default execution path)
- Performs all of `13a`.
- May change candidate existence/identity/merge/suppression when driven only by:
  - Step 12 structural signals (mentions, spans, roles, assertion links, provenance kinds).
  - Step 12 Wikipedia Title Index-derived evidence fields (for example aggregated `wiki_*` values).
- Includes both:
  - suppression of weak, structurally low-quality candidates, and
  - promotion of otherwise excluded candidates when structure + Wikipedia Title Index evidence justifies inclusion.
- Remains generic and deterministic; no literal-string/domain rules.

Current status:
- Step 13 implementation in this repository is complete for the current contract scope.
- Remaining open work is upstream in Step 12 producer code (`elementary-assertions`), not in Step 13 code here.

---

## Hard Contract Rules

1. No literal-string create/merge/suppress logic in Step 13 extraction.
- No rules of the form "if canonical == X then ...".

2. No domain- or benchmark-specific extraction rules.
- No hardcoded domain drop-lists.
- No hardcoded synthesis templates.
- No lexeme-specific semantic whitelists.
- No domain acronym identity collapses.

3. Determinism is mandatory.
- Same bytes in -> same bytes out.

4. Step 12 contract validation is mandatory.
- `stage === "elementary_assertions"`
- `schema_version` is SemVer with `major === 1`
- role-linked mention references must resolve to exactly one mention in `mentions[]`

---

## Input Contract (Execution)

Step 13 supports two execution paths:

1. Persisted Step 12 path
- `--step12-in <path>` using `seed.elementary-assertions.yaml`

2. Runtime Step 12 path
- `--seed-id <id>` using `seed.txt` and internal Step 12 invocation
- runtime path may depend on Wikipedia Title Index endpoint configuration

Operational default for batch runs:
- `run-seed-concept-candidates.ps1` defaults to persisted mode (`-Mode persisted`).
- Use `-Mode runtime` when Step 12 artifacts are unavailable.
- Persisted outputs are mode-tagged: `seed.concept-candidates.13a.yaml` / `seed.concept-candidates.13b.yaml`.

CLI summary:
- Runtime mode: `--seed-id <id> [--artifacts-root <path>] [--wikipedia-title-index-endpoint <url>]`
- Persisted mode: `--step12-in <path>`
- Shared flags:
  - `--step13-mode 13a|13b` (default `13b`)
  - `--mode13b-verb-promotion-min-wikipedia-count <number>`
  - `--mode13b-unlinked-finite-verb-promotion-min-wikipedia-count <number>`
  - `--mode13b-low-wikipedia-count-unlinked-min-avg <number>`
  - `--mode13b-nonnominal-share-min <number>`
  - `--mode13b-nonnominal-weak-wikipedia-count-max <number>`
  - `--mode13b-merge-host-min-wikipedia-count-ratio <number>`
  - `--wikipedia-title-index-policy assertion_then_lexicon_fallback|assertion_only`
  - `--wti-policy assertion_then_lexicon_fallback|assertion_only` (backward-compatible alias)
  - `--disable-supplemental`
  - `--disable-alias-synthesis`
  - `--enable-legacy-enrichment` (legacy compatibility switch; default off)
  - `--enable-recovery-synthesis` (legacy sub-switch; effective only when legacy enrichment is enabled)
  - `--no-emit-wikipedia-title-index-evidence` (default emits `wikipedia_title_index_evidence`)
  - `--no-emit-wti-evidence` (backward-compatible alias)
  - `--diag-out <path>` (`source_by_canonical` + `stats` profiling counters/timers)
  - `--meta-out <path>`

Legacy flag note:
- `--disable-supplemental`, `--disable-alias-synthesis`, `--enable-legacy-enrichment`, and `--enable-recovery-synthesis` are backward-compatibility controls and are outside the generic Step 13 contract.
- Legacy governance is enforced by `LEGACY_POLICY.md` and `check-legacy-policy.js`.

---

## Output Contract

Top-level fields:
- `schema_version`
- `seed_id`
- `stage: concept_candidates`
- `concept_candidates[]`

Per candidate:
- `concept_id`
- `canonical`
- `surfaces[]`
- `mention_ids[]`
- `assertion_ids[]`
- `roles`
- `wikipedia_title_index`
- optional `wikipedia_title_index_evidence` (when not disabled)

Roles:
- fixed keys: `actor`, `theme`, `attr`, `topic`, `location`, `other`
- integer, non-negative
- unobserved keys materialized as `0`

`concept_id`:
- `cc_[0-9a-f]{16}`
- `cc_ + sha256(utf8(canonical)).hex[0:16]`

---

## Canonicalization

Canonicalization pipeline:
1. Unicode NFKC
2. Unicode default case fold
3. Replace non `[A-Za-z0-9]` with ASCII space
4. Collapse spaces, trim
5. Replace spaces with `_`

Empty canonical results are hard failures.

---

## Wikipedia Title Index Contract (`13b`)

Wikipedia Title Index key union per seed:
- `K = union(all wiki_* keys found in Step12 assertion mention evidence and Step12 wiki_title_evidence)`

Aggregation:
- for `wiki_*_count`: integer-only values (non-integer is hard failure); for other `wiki_*`: booleans
- unknown `wiki_*` keys preserved
- candidate values aggregated from attached mention evidence per policy:
  - `assertion_then_lexicon_fallback` (default)
  - `assertion_only`

Optional detailed emission:
- default emits `wikipedia_title_index_evidence`
- disable with `--no-emit-wikipedia-title-index-evidence`

Wikipedia Title Index behavior by mode:
- In `13a`: Wikipedia Title Index does not affect candidate existence.
- In `13b`: Wikipedia Title Index may participate in generic candidate existence/merge/suppression decisions, but only via structural/evidence rules (never literal-string/domain rules).

---

## Deterministic Replay

Replay determinism holds when all relevant inputs are pinned by bytes:
- `seed.txt` (runtime path) or persisted Step 12 artifact
- Step 12 package/version in runtime mode
- Wikipedia Title Index endpoint behavior/response stability (or offline-pinned Wikipedia Title Index)
- Step 13 code version

Serialization guarantees:
- UTF-8
- LF line endings
- exactly one trailing newline
- deterministic key/array ordering

---

## Failure Policy

Step 13 fails the entire seed on contract violations, including:
- invalid/missing Step 12 contract fields
- unresolved mention references
- duplicate mention ids
- empty canonicalization result
- invalid `wikipedia_title_index` signal values (`wiki_*_count` must be integer; other `wiki_*` must be boolean)
- schema/determinism violations
- in-seed concept-id collisions

---

## Scope Boundary

Out of scope for Step 13:
- domain-aware concept invention/suppression
- benchmark-tuned string rules
- acronym/domain identity resolution
- ontology/domain mapping behavior

Those belong to a later, explicitly domain-aware step outside Step 13.

---

## Quality Gate

Primary quality gate:
- single normative target: `independent.expected-concept-candidates.yaml`
- evaluated by `concept-candidates.independent-benchmark.js` with explicit `--step13-mode`
- npm scripts:
  - `npm run eval:concept-candidates:independent:13a`
  - `npm run eval:concept-candidates:independent:13b`
  - `npm run eval:concept-candidates:independent:13b:policy` (includes 13b policy intersection details)
  - `npm run eval:concept-candidates:13b:sweep` (deterministic threshold sweep report)
  - `npm run check:concept-candidates:benchmark-policy` (fails if expected benchmark changed without policy-note update)
  - `npm run check:concept-candidates:legacy-policy` (fails if `legacy-enrichment.js` changed without policy-note update)
  - `npm run report:step12:wikipedia-title-index-coverage` (deterministic Step-12 signal coverage report)

Benchmark policy:
- The benchmark is evaluation-only and must not drive extraction rule design in Step 13.
- The benchmark is intentionally non-trivial and should remain a diagnostic pressure gauge, not a completion certificate.
- Optional `neutral` entries are diagnostic-only (reported as present/missing, not scored).
- Canonical-only scoring is used for both signals; `wikipedia_title_index`/`wikipedia_title_index_evidence` fields are not scored directly.
- Signal A (`13a`) and Signal B (`13b`) are both scored against the same normative expected set.
- Mode-tagged artifacts and mode-tagged meta sidecars are required to avoid mode ambiguity during scoring.
- Replay metadata includes Step 13 mode and active `13b` thresholds.
- `13b` policy-hit traces and metric snapshots are diagnostics-only (sidecars), not part of persisted schema output.
- Current calibrated default thresholds (from deterministic sweep): `verb_promotion_min_wikipedia_count=1.0`, `unlinked_finite_verb_promotion_min_wikipedia_count=80.0`, `low_wikipedia_count_unlinked_min_avg=0.5`, `nonnominal_share_min=0.5`, `nonnominal_weak_wikipedia_count_max=1.5`, `merge_host_min_wikipedia_count_ratio=1.0`.

Secondary checks:
- schema validation
- deterministic ordering/serialization checks
- Step 13 unit/integration tests

---

## References

- Step 12 package: https://www.npmjs.com/package/elementary-assertions/v/1.0.2
- Step 12 rendered snapshot reference: https://github.com/svenschaefer/elementary-assertions/tree/main/test/_full-run-rendered/v0.1.7-full-run-20260215
- Step 12 renderer implementation reference: https://github.com/svenschaefer/elementary-assertions/tree/main/src/render

