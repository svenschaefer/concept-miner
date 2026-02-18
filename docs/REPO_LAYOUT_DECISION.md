# Repository Layout Decision

## Decision

- Remove `prototype/` from this repository in `v1.1.0`.
- Keep product-owned runtime/tooling/tests/docs only under `src/`, `scripts/`, `test/`, `schema/`, and `docs/`.

## Rationale

- Step13 runtime, benchmark tooling, determinism checker tooling, and heuristic-level regression coverage are now product-owned.
- Runtime and release gates no longer require prototype-local files.
- Removing `prototype/` eliminates repository drift risk between reference and product code streams.

## Mapping Table Applicability

- Migration mapping is documented in product history/planning notes (`TODO.md`, `ROADMAP.md`, `docs/PROTOTYPE_MIGRATION_NOTES.md`).
