# Prototype Migration Notes

This document captures the productization-relevant content migrated from:

- `prototype/README.md`
- `prototype/TODO.md`

## Contract Points Migrated

1. Mode model:
- optional `generic baseline mode` (maps to prototype `13a`)
- default `default extended mode` (maps to prototype `13b`)

2. Input paths:
- persisted Step12 artifact path (`seed.elementary-assertions.yaml`)
- runtime seed-text path with upstream Step12 invocation

3. Determinism requirements:
- byte-stable replay for pinned inputs
- deterministic ordering/serialization expectations
- explicit hard-failure behavior on contract violations

4. Wikipedia Title Index handling:
- `wikipedia_title_index` / `wikipedia_title_index_evidence` naming
- integer/boolean signal typing requirements
- policy-driven evidence handling (`assertion_then_lexicon_fallback`, `assertion_only`)

## Governance Points Migrated

1. Benchmark governance:
- benchmark expected-set changes require explicit rationale
- benchmark remains evaluation pressure, not rule-authority

2. Legacy governance:
- legacy enrichment behavior remains explicitly gated
- policy check guards preserve intentional legacy boundaries

3. Upstream Step12 boundary:
- upstream owner: `elementary-assertions`
- in-repo tracking via coverage and regression tooling
- upstream backlog tracked in `docs/STEP12_UPSTREAM_BACKLOG.md`

## Backlog History Snapshot

From `prototype/TODO.md`:

- Closed in this repository:
  - deterministic `13b` calibration/sweep support
  - policy-intersection diagnostics reporting
  - mode-tagged metadata/diagnostics sidecars
  - benchmark and legacy policy CI checks

- Remaining upstream-only:
  - Step12 deterministic lookup normalization
  - Step12 token-vs-MWE evidence separation
  - Step12 evidence path consistency refinements

## Mapping Notes

- Prototype file `prototype/README.md` remains authoritative for prototype internals.
- Product-facing contracts are authoritative in:
  - `README.md`
  - `schema/concepts.schema.json`
  - `openapi/openapi.yaml`
