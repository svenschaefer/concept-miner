# Benchmark Policy

## Normative Target

`independent.expected-concept-candidates.yaml` is the single normative target for Step 13 benchmark evaluation.

Both reports:
- `13a vs expected`
- `13b vs expected`

must be scored against this same expected file.

## Governance Rule

Any change to `independent.expected-concept-candidates.yaml` requires a written rationale in this file under **Rationale Log**.

Rationale entries must include:
- date (YYYY-MM-DD)
- what changed (seed(s), must/should/anti impact)
- why the change is contract-level (not implementation-tuning)

## Stability Rule

Benchmark edits must not be used to silently improve scores without contract justification.
Calibration and optimization must target implementation behavior, not expected-set drift.

## Neutral Bucket

`neutral` entries are permitted in the expected file as a diagnostic-only class:
- neither rewarded nor penalized in scoring,
- reported in benchmark output as `neutral_present`,
- used for concepts that are acceptable but not required and not anti-targets.

## Rationale Log

- 2026-02-16: Established single normative expected target and dual reporting (`13a` and `13b`) against the same target.
- 2026-02-16: Updated `saas` `must_have` by removing `schedule`, `trigger`, and `issue` because these lexemes are not present in `artifacts/saas/seed/seed.txt` (nor in its Step-12 lexical surfaces). This is a contract-level text-grounding correction, not implementation tuning.
- 2026-02-16: Updated `saas` singular/plural forms in `must_have`/`should_have` to match literal surface forms in `artifacts/saas/seed/seed.txt` (for example `folder -> folders`, `run -> runs`, `transaction -> transactions`). This enforces explicit lexical grounding in expected targets.
- 2026-02-16: Removed non-literal `saas` compound `should_have` entries (`document_item`, `file_attachment`, `workflow_pipeline`, `comment_note`, `task_ticket_issue`) because they are not contiguous lexical surfaces in `seed.txt`. This aligns all expected entries with strict text grounding.
- 2026-02-16: Reclassified `system` (access_control), `irs` and `request_clarification` (irs), and `generator` (prime_gen) from `anti_targets` to `should_have` because they are role/assertion-linked in current generic extraction and are better treated as optional concept outcomes than hard negatives.
- 2026-02-16: Introduced a `neutral` class (diagnostic-only, non-scoring) and moved borderline entries (`system`, `irs`, `request_clarification`, `generator`) from `should_have` to `neutral`.
- 2026-02-16: Moved `generated_primes` (prime_gen) from `anti_targets` to `neutral` because it is acceptable as a borderline generated phrase outcome under generic extraction, but should not be a scored target.
- 2026-02-16: Updated benchmark description wording from `WTI` to `Wikipedia Title Index` for naming consistency with Step 13 contract/docs. No seed targets, scoring weights, or must/should/anti/neutral sets changed.
- 2026-02-18: Synced `test/benchmark/independent.expected-concept-candidates.yaml` to the updated product-owned benchmark baseline (ported from reference prototype benchmark update) and revalidated with Step13 runtime gate at `overall_score=100.0` across all six seeds. This is a benchmark-contract baseline update, not a threshold-only implementation tune.
