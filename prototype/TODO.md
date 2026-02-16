# 13 - Concept Candidates - TODO

Compact short/mid-term task list to protect the Step 13 contract:
- optional `13a` generic baseline extraction
- default `13b` generic extended extraction (structure + Wikipedia Title Index evidence may affect candidate set)
- legacy/domain behavior strictly opt-in and isolated

## Current Baseline (Latest)

- `13a` independent score: `98.2`
- `13b` independent score: `100.0`
- Step 13 output signal contract status:
  - no Wikipedia Title Index signal skipped in Step 13 output/evidence propagation
  - `wiki_*_count` aggregated as integers; non-count `wiki_*` aggregated as booleans
  - field naming normalized to `wikipedia_title_index` / `wikipedia_title_index_evidence`
- `saas` (`13b`) status:
  - must: `58/58` (missing: none)
  - anti suppression: `8/8` (anti present: none)
- Calibrated `13b` defaults (from deterministic sweep):
  - `verb_promotion_min_wikipedia_count=1.0`
  - `unlinked_finite_verb_promotion_min_wikipedia_count=80.0`
  - `low_wikipedia_count_unlinked_min_avg=0.5`
  - `nonnominal_share_min=0.5`
  - `nonnominal_weak_wikipedia_count_max=1.5`
  - `merge_host_min_wikipedia_count_ratio=1.0`

## Upstream Dependency (Step 12)

- Owner for Step-12 producer changes: `elementary-assertions` package (external to this repo).
- Upstream-only tasks:
  - `19.1` deterministic lookup normalization
  - `19.2` token vs MWE evidence separation
  - `19.3` evidence path consistency refinements
- In-repo support completed:
  - deterministic Step-12 coverage reporting (`report:step12:wikipedia-title-index-coverage`)
  - Step-13 integration/validation harness for re-evaluation after upstream release

## A. Contract & Gating Safety (highest priority)

1. Done - Negative recovery CLI test
- Add explicit test:
  - run with `--enable-recovery-synthesis` but without `--enable-legacy-enrichment`
  - assert `meta.step13.enable_recovery_synthesis === false`
  - assert byte-identical YAML vs plain `13a`

2. Done - Minimal `meta.step13` contract snapshot
- Lock key set and invariant:
  - `enable_recovery_synthesis === (enable_legacy_enrichment && cli_flag_recovery)`

3. Done - Freeze + tag legacy enrichment
- Governance rule:
  - `legacy-enrichment.js` frozen except explicit bugfixes
  - any legacy change labeled as legacy-only in changelog/meta notes
  - enforced by:
    - `LEGACY_POLICY.md`
    - `check-legacy-policy.js`
    - npm script: `check:concept-candidates:legacy-policy`

## B. Boundary Enforcement (13a vs legacy vs 13b)

4. Done - 13a vs legacy delta guard
- Pinned Step12 input:
  - run `13a`
  - run with `--enable-legacy-enrichment`
  - assert outputs are not identical
  - assert diffs are in expected categories (candidate content, not schema/meta shape)

5. Done - 13b generic-extended guard
- `13b` may change candidate set/identity/order vs `13a`
- changes must remain deterministic and schema-valid
- no legacy hooks unless `--enable-legacy-enrichment` is enabled
- no literal-string/domain rule activation

6. Done - Static no-literal-string-rules CI guard
- Add lightweight static tripwire for `13a` path:
  - fail on ungated drop-lists/merge-tables/string templates in default path

## C. Benchmark & Quality Direction

7. Done - Explicit benchmark policy text
- Keep benchmark policy explicit:
  - benchmark is a pressure gauge, not a completion certificate
  - must/should/anti remain structural/generic
  - benchmark edits require contract-level rationale

8. Done - Use `saas` as primary pressure signal
- `saas` remains the primary hard seed for generic pressure tracking:
  - `13a` still shows structural pressure
  - `13b` policy layer resolves must/anti pressure without literal-string/domain rules
- continue to require structural justification + regression lock for further changes

9. Done - Dual independent benchmark reports against one normative target
- Signal A: `13a` baseline scored vs `independent.expected-concept-candidates.yaml`
- Signal B: `13b` extended scored vs `independent.expected-concept-candidates.yaml`
- both score canonical sets only and require mode-tagged artifacts + mode-matching meta sidecars

12. Done - 13b policy-effect diagnostics and reproducible calibration
- diagnostics include policy-hit traces and compact metric snapshots in mode-tagged diag sidecars
- benchmark can report policy intersections against `must_missing` / `anti_present`
- deterministic 13b threshold sweep writes a reproducible report file with tested settings and selected thresholds

13. Done - Benchmark expected-set governance note
- `BENCHMARK_POLICY.md` defines rationale requirements for changes to `independent.expected-concept-candidates.yaml`

14. Done - Close remaining `saas` must gaps in `13b` (generic only)
- `13b` currently has no `saas` must gaps (`58/58`).
- Recovery achieved with structure + Wikipedia Title Index policies only (no literal-string/domain conditions).

15. Done - Close remaining `saas` anti leaks in `13b` (generic only)
- Implemented structural suppression for:
  - weak-core-role participial chunk reductions (captures `complemented`-like artifacts)
  - short symbolic punctuation-collapse artifacts (captures `i_e`-like artifacts)
- No lexical drop lists.
- Added regression fixtures:
  - `test13bParticipialChunkSuppressionWithWeakCoreRole`
  - `test13bShortSymbolicSuppression`

16. Done - Improve policy-intersection diagnostics fidelity
- Extend benchmark policy report to show:
  - `promoted_must_missing_now_present`
  - `suppressed_anti_present_now_absent`
- Keep diagnostics/report deterministic and sidecar-only.

17. Done - Freeze and document current 13b policy profile
- Add short policy profile note in README/TODO after each accepted threshold/rule change:
  - what changed
  - why contract-safe
  - measured score delta vs previous baseline
- Current accepted profile update:
  - Added two generic 13b suppression refinements:
    - participial chunk reduction suppression now allows weak `other`-only linkage (`role_total <= 1`, `core_role_total == 0`)
    - short symbolic suppression now uses punctuation-collapse share for compact symbolic artifacts
  - Added alias synthesis hardening:
    - determiner-prefixed tail aliases are rejected at alias-generation time (`a_*`, `an_*`, `the_*`)
  - Added 13b participial-lift suppression refinement:
    - suppress unlinked two-token gerund-led lifts (`VBG + *`) via structural token-tag checks (no lexical string list)
  - Contract safety:
    - structure + Wikipedia Title Index metrics only; no literal-string/domain conditions
    - deterministic behavior preserved and meta/diag unchanged in schema
  - Measured delta:
    - `13b` overall score: `96.6 -> 100.0`
    - `webshop` anti suppression: `7/8 -> 8/8` (`the_order` removed)
    - `access_control` anti suppression: `10/11 -> 11/11` (`using_credentials` removed)

18. Done - Make Wikipedia Title Index evidence fully effective in Step 13 (in-repo scope)
- Scope recap (authoritative):
  - `13a`: baseline generic extraction from Step-12 structure.
  - `13b`: generic evidence-informed transformation layer that may reduce and/or extend the `13a` candidate set.
  - `13b` may use only:
    - Step-12 structural signals (mentions, spans, roles, assertion links, provenance kinds, containment)
    - Wikipedia Title Index-derived evidence fields from Step 12 (`wiki_*_count` integers + non-count `wiki_*` booleans)
  - Hard bans remain absolute:
    - no literal-string rules
    - no domain knowledge
    - no drop-lists, merge tables, lexeme whitelists, acronym special cases
  - Determinism/replayability mandatory:
    - same inputs + same mode + same thresholds -> byte-identical outputs
    - mode and thresholds emitted in meta

19. Open (Upstream) - Step 12 Wikipedia Title Index reliability and expressiveness
- `1.1` Deterministic lookup normalization:
  - deterministic variant generation per mention surface:
    - lemma (only if deterministic lemma already exists in Step 12)
    - surface form
    - hyphen/space/underscore normalization
    - case normalization
    - Unicode NFC normalization
  - lookup variants in stable order and aggregate counts deterministically (integer sum)
- `1.2` Token vs MWE evidence separation:
  - for multi-token mentions/chunks: lookup full MWE surface
  - preserve signal separation where useful:
    - token-level Wikipedia Title Index counts
    - MWE-level Wikipedia Title Index counts
  - attach deterministically to mention for Step-13b use
- `1.3` Evidence path consistency:
  - assertion evidence preferred
  - lexicon fallback when assertion evidence absent
  - reduce `none` cases for structurally relevant mentions
- `1.4` Producer diagnostics (non-normative):
  - Step-12 diagnostics:
    - % mentions with non-zero Wikipedia Title Index total
    - % assertions with Wikipedia Title Index evidence
    - bucketed distributions of totals/averages
  - diagnostics only; no schema changes
  - status:
    - implemented in this repo as deterministic coverage report:
      - script: `step12-wikipedia-title-index-coverage.js`
      - npm script: `report:step12:wikipedia-title-index-coverage`
      - report file: `step12-wikipedia-title-index.coverage.report.json`
    - `1.1`-`1.3` remain blocked for in-repo implementation because Step 12 producer code lives in external package (`elementary-assertions`)

20. Done - Step 13b policy levers that move benchmark pressure
- `2.1` Recall lever: Wikipedia Title Index-backed promotion
  - 13b-only promotion for candidates excluded by 13a
  - allowed only when:
    - mention is role-linked or assertion-linked
    - Wikipedia Title Index meets explicit threshold
  - start with verb-head singletons; expand via structure only
  - Wikipedia Title Index alone never sufficient
  - threshold in meta:
    - `mode13b_policy.verb_promotion_min_wikipedia_count`
- `2.2` Precision lever: Wikipedia Title Index-weak discourse/meta suppression
  - suppress only when all are true:
    - `role_total == 0`
    - `assertion_count == 0`
    - high non-nominal share
    - containment dependency on stronger host candidates
    - Wikipedia Title Index weak/absent
  - Wikipedia Title Index is final gate, not primary classifier
  - thresholds in meta:
    - `mode13b_policy.low_wikipedia_count_unlinked_min_avg`
    - `mode13b_policy.nonnominal_share_min`
    - `mode13b_policy.nonnominal_weak_wikipedia_count_max`
- `2.3` Done - Optional merge lever (generic):
  - Implemented deterministic merge of weak contained candidates into stronger broader hosts when host Wikipedia Title Index/candidate Wikipedia Title Index passes threshold.
  - merge rationale emitted in diagnostics (`merge_into_stronger_host`).
  - merge policy threshold persisted in meta:
    - `mode13b_policy.merge_host_min_wikipedia_count_ratio`
  - regression lock added:
    - `test13bMergeIntoStrongerHost`

21. Done - Diagnostics proof of Wikipedia Title Index effectiveness (non-normative)
- Per-canonical diagnostics (sidecar only):
  - `policy_hits`:
    - `promotion_verb_wikipedia_count`
    - `suppress_low_wikipedia_count_unlinked`
    - `suppress_nonnominal_weak_wikipedia_count`
    - `suppress_contained_stronger_host`
    - `merge_into_stronger_host` (if implemented)
  - compact metrics:
    - `avg_wikipedia_count`
    - `non_nominal_share`
    - `role_total`
    - `assertion_count`
    - `mention_count`
- Benchmark runner intersection reporting:
  - which `must_missing` were touched by 13b
  - which `anti_present` were touched by 13b
  - status: implemented and used in `eval:concept-candidates:independent:13b:policy`
  - extension only required when new policy families are introduced

22. Done - Tests and guardrails (no weakening)
- Keep existing guardrails:
  - legacy gating
  - recovery semantics
  - no literal-string tripwire
  - determinism sentinel
  - mode/meta verification
  - one-goal/two-reports benchmark model
- Add/maintain tests:
  - promotion triggers only with linkage + Wikipedia Title Index thresholds
  - suppression triggers only with structural + Wikipedia Title Index-weak conditions
  - merge deterministic and structure-driven
- meta records:
    - `step13_mode`
    - all 13b policy thresholds
- Keep both reports against same normative target:
  - `13a vs expected`
  - `13b vs expected`
- Status:
  - implemented and passing
  - maintain as regression baseline for future changes

23. Done (In-repo closure) - Acceptance criteria and deliverables
- Acceptance criteria:
  - Wikipedia Title Index becomes measurably effective:
    - 13b moves `must/anti` in intended direction (especially hardest seeds)
    - no regressions on other seeds
  - no literal-string/domain logic introduced
  - determinism holds for identical input + mode + thresholds
  - meta fully captures mode + thresholds
  - diagnostics show intersection with benchmark pressure points
  - Deliverables:
  - Step-12 Wikipedia Title Index improvements (upstream open; this repo provides coverage diagnostics/reporting, producer-side algorithmic changes pending external Step 12 package)
  - Step-13b promotion/suppression (optional merge) (done)
  - updated tests (done)
  - updated diagnostics (done)
  - updated docs (done)
  - short report with:
    - Wikipedia Title Index coverage deltas
    - 13a vs 13b benchmark deltas
    - which 13b policies touched which pressure points

## Open Items (Current)

- Step 13 status in this repository: complete for current contract scope (`13b` default, `13a` optional).
- Only upstream-owned items remain open:
  - `19.1` deterministic lookup normalization in Step 12 producer (`elementary-assertions`)
  - `19.2` token vs MWE evidence separation in Step 12 producer (`elementary-assertions`)
  - `19.3` evidence path consistency refinements in Step 12 producer (`elementary-assertions`)
- In-repo tracking/validation is complete and ready for re-run after upstream release:
  - `report:step12:wikipedia-title-index-coverage`
  - `eval:concept-candidates:independent:13a`
  - `eval:concept-candidates:independent:13b`
  - `eval:concept-candidates:independent:13b:policy`

## D. Determinism & Refactor Safety (selective)

10. Done - Canonicalization + ordering invariants
- Keep hard locks for:
  - non-empty canonical
  - deterministic key ordering
  - deterministic array ordering

11. Done - No hidden nondeterminism check (optional)
- Same pinned input:
  - twice in-process
  - once fresh process
- detect iteration/order drift after refactors

## De-prioritized For Now

- Memory budget checks
- Detailed role/assertion closure invariants
- Segment-locality invariants
- Stats schema locking
- Minimal reproducible `saas` micro-fixtures
- Taxonomy tolerance checks

## Lean TL;DR

1. Negative recovery CLI test
2. `meta.step13` snapshot + invariant
3. Freeze/tag legacy enrichment
4. 13a vs legacy delta test
5. 13b generic-extended guard
6. Static no-string-rules CI guard
7. Explicit benchmark policy text
8. Canonicalization + ordering invariants
9. Upstream: finish Step-12 reliability workstream (`19.1`-`19.3`) in `elementary-assertions`
10. After upstream release: rerun coverage + benchmarks and publish delta addendum



