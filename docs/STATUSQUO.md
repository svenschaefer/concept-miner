# Status Quo

## Repo status

- Branch: `main`
- Sync: tracking `origin/main` (kept in sync via stable phase commits)
- Current annotated release tag: `v1.0.0`
- Latest stable phase: `v1.000` (first stable product release cut at package version `1.0.0`)
- Planning state: `TODO.md` and `ROADMAP.md` are synchronized through `v1.000`.
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
- Default-extended runtime extraction now performs wikipedia-title-index lookups and attaches deterministic enrichment under concept `properties.wikipedia_title_index` when service is reachable.
- Field-level enrichment typing is now contract-defined (`exact_match` boolean, `prefix_count` integer >= 0).
- Compatibility commands `run` and `validate` are explicitly retained as supported surfaces for 1.x.
- 1.x stability policy (breaking vs non-breaking changes) is now documented in `docs/GUARANTEES.md`.

Remaining open implementation items:

- Keep prototype governance assets operational while maintaining prototype read-only policy.
- Evaluate future 1.x backlog items; no open pre-`v1.000` gate items remain.

Release/publish posture:

- Current package posture remains `"private": true`.
- `v1.0.0` is cut as a stable private release; public npm publication remains a separate explicit decision.

Current next-step planning:

- Continue post-`v1.000` 1.x backlog execution under the documented stability policy.

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
- `docs/releases/v1.0.0.md`
- `docs/STEP12_UPSTREAM_BACKLOG.md`
