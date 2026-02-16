# Repository Layout Decision

## Decision

- Keep `prototype/` in this repository as a historical and governance reference for the current productization phase.
- Do not migrate prototype internals into `src/` yet.

## Rationale

- Existing CI/policy/benchmark tooling is already wired against `prototype/`.
- Frozen regression references and governance scripts rely on stable prototype-relative paths.
- Immediate migration would increase risk without improving current contract confidence.

## Mapping Table Applicability

- Because prototype assets are intentionally retained in place, a full old-file to new-file migration mapping table is not applicable at this phase.
- If a future migration into `src/` is approved, create a dedicated mapping table in this document at that time.
