# Legacy Enrichment Policy

## Scope

`legacy-enrichment.js` is outside the generic Step 13 contract and exists only for explicit backward compatibility.

## Freeze Rule

- Default rule: frozen.
- Allowed changes: explicit bugfixes only.
- Disallowed changes: benchmark tuning, domain rule additions, or any behavior that should belong to generic `13a/13b`.

## Change Governance

Any change to `legacy-enrichment.js` requires a matching rationale update in this file under **Rationale Log**.

Rationale entries must include:
- date (`YYYY-MM-DD`)
- what changed
- why this is legacy-only and why it is not generic Step 13 logic

## Rationale Log

- 2026-02-16: Policy established. Legacy enrichment frozen by default; changes require explicit rationale.

