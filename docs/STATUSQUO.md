# Status Quo

## Repo status

- Branch: `main`
- Sync: tracking `origin/main` (kept in sync via stable phase commits)
- Current annotated release tag: `v0.10.0`
- Latest stable phase: `v0.108` (internal mode terminology closure complete; default-extended extension-field decision documented as deferred)
- Major completed workstreams:
  - template baseline scaffold + CI/release workflow
  - transition product API (`extractConcepts`, `validateConcepts`)
  - product CLI commands (`extract`, `validate-concepts`) plus compatibility commands
  - prototype governance checks integrated into CI
  - frozen artifact corpus layout + frozen reference regression checks
  - OpenAPI/schema contract guard tests
  - sidecar and release-workflow contract tests
  - full per-seed golden artifact regeneration diff checks (YAML/JSON) with diagnostics timing normalization
  - explicit core extraction invariant contracts across realistic persisted Step12 seeds
  - pre/post publish smoke rehearsal flow for private-package phase (`smoke:release:rehearsal`)
  - repeat-run deterministic persisted-step12 output contracts across all seed fixtures and both modes
  - runtime seed-text extraction compatibility for both legacy and flattened artifact layouts

## Implementation status

Implemented and stable:

- Template-aligned package scaffold and release/CI wiring are in place.
- Product API and CLI surfaces are implemented and contract-tested.
- OpenAPI/schema/runtime alignment checks are active.
- Frozen reference governance and full golden artifact regression checks are active across all seed fixtures.

Remaining open implementation items:

- Keep prototype governance assets operational while maintaining prototype read-only policy.
- Revisit optional default-extended extension fields in a future pre-1.0 cycle when field semantics are finalized.

## Runtime status

Working commands:

- `npm ci`
- `npm test`
- `npm run ci:check`
- `npm run release:check`
- `npm run check:concept-candidates:policies`
- `npm run check:frozen-references-policy`
- `npm run check:generated-report-artifacts-policy`
- `npm run smoke:release:rehearsal`

Known setup constraints:

- Node.js `>=20` is required.
- Prototype benchmark/policy scripts rely on in-repo `prototype/` paths, but product runtime must not import `prototype/*`.

## Quality status

- Local gates are green:
  - lint
  - tests (unit + integration)
  - policy checks
  - report scripts
  - pack dry-run
  - release smoke
- Deterministic frozen-reference checks are active for persisted-mode outputs.
- Golden artifact regeneration checks are active for all seeds and both legacy artifact modes (`13a`, `13b`) plus default output; product runtime mode APIs remain `generic-baseline` and `default-extended`.

## Documentation status

Recently updated:

- `README.md`
- `ROADMAP.md`
- `TODO.md`
- `CHANGELOG.md`
- `docs/FROZEN_REFERENCES_POLICY.md`
- `docs/STATUSQUO.md`
- `docs/releases/v0.10.0.md`
- `docs/STEP12_UPSTREAM_BACKLOG.md`
