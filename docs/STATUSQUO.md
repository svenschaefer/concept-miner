# Status Quo

## Repo status

- Branch: `main`
- Sync: tracking `origin/main` (kept in sync via stable phase commits)
- Current annotated release tag: `v1.0.2`
- npm package status: `concept-miner@1.0.5` published (`latest` -> `1.0.5`).
- Latest stable phase: `v1.000` (first stable product release cut at package version `1.0.0`)
- Planning state: `TODO.md` and `ROADMAP.md` are synchronized; `v1.1.0` is in progress.
- Major completed workstreams:
  - template baseline scaffold + CI/release workflow
  - transition product API (`extractConcepts`, `validateConcepts`)
  - product CLI commands (`extract`, `validate-concepts`) with legacy compatibility commands removed
  - prototype governance checks integrated into CI
  - frozen artifact corpus layout + frozen reference regression checks
  - OpenAPI/schema contract guard tests
  - sidecar and release-workflow contract tests
  - full per-seed golden artifact regeneration diff checks (YAML/JSON) with diagnostics timing normalization
  - explicit core extraction invariant contracts across realistic persisted Step12 seeds
  - pre/post publish smoke rehearsal flow (`smoke:release:rehearsal`)
  - repeat-run deterministic persisted-step12 output contracts across all seed fixtures
  - runtime seed-text extraction in strict default-extended mode

## Implementation status

Implemented and stable:

- Template-aligned package scaffold and release/CI wiring are in place.
- Product API and CLI surfaces are implemented and contract-tested.
- OpenAPI/schema/runtime alignment checks are active.
- Frozen reference governance and full golden artifact regression checks are active across all seed fixtures.
- Default-extended runtime extraction now runs Step12 (`elementary-assertions`) + product-owned Step13 candidate construction for raw text and seed paths.
- Field-level enrichment typing is now contract-defined (`exact_match` boolean, `prefix_count` integer >= 0).
- Default-extended runtime now hard-fails when wikipedia-title-index is unavailable (no silent enrichment fallback).
- Legacy CLI compatibility commands `run` and `validate` are removed from product-facing surfaces.
- 13b independent benchmark quality gate is now mandatory in `ci:check` with required `overall_score=100.0`.
- Latest `v1.1.0` Step13 delta port restored the 13b gate to `overall_score=100.0` on all six benchmark seeds.
- Prototype-deletion safety gap closure is in progress with product-owned benchmark diagnostics tooling, determinism checker script, and heuristic-level Step13 regression tests.
- 13a/generic-baseline mode is removed from the product runtime/API/CLI contract.
- 1.x stability policy (breaking vs non-breaking changes) is documented in `docs/GUARANTEES.md`.

Remaining open implementation items:

- Continue reducing non-product test dependencies on `prototype/*` while keeping prototype read-only as reference material.

Release/publish posture:

- Package posture is publishable (`"private": false`).
- Repository is public and npm public-release flow is enabled via `docs/NPM_RELEASE.md`.
- Public npm publication has been executed and propagation checks are green.
- npm deprecations are active for `1.0.1` through `1.0.4` (message points consumers to `1.0.5+`).

Current next-step planning:

- Continue post-`v1.000` 1.x backlog execution under the documented stability policy.
- Complete `v1.1.0-e` docs/release sync and release cut.

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
- Product runtime does not import `prototype/*`; prototype remains reference-only.

## Quality status

- Local gates are green:
  - lint
  - tests (unit + integration)
  - policy checks
  - report scripts
  - pack dry-run
  - release smoke
- Deterministic frozen-reference checks are active for persisted-mode outputs.
- Golden artifact and benchmark checks are active for default-extended behavior.

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
- `docs/releases/v1.0.5.md`
- `docs/STEP12_UPSTREAM_BACKLOG.md`
