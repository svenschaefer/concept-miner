# Codex Context

This file captures durable implementation and process context for `concept-miner` so future work remains consistent.

## Product Contract Baseline

- Product stream is 1.x.
- Public package/runtime is product-owned only; `prototype/` is not part of runtime behavior.
- Only runtime mode is `default-extended`.
- `default-extended` requires `wikipedia-title-index`; unavailability/timeout is a hard failure (no silent fallback).
- Product-facing terminology uses `wikipedia` and `wikipedia-title-index` (no `wiki`/`wti` abbreviations in user-facing surfaces).

## Quality Gates That Must Stay True

- `npm test` must stay green.
- `npm run ci:check` must include the independent quality gate.
- `npm run check:quality-gate:13b` must remain mandatory and stay at `overall_score=100.0`.
- Frozen references and benchmark governance checks must remain active and deterministic.

## Determinism And Safety Rules

- Preserve stable sorting/serialization and deterministic output for identical input/options.
- CLI and REST must remain thin wrappers around library behavior.
- Validation/tooling layers must not mutate core output.
- Do not reintroduce legacy compatibility/fallback behavior that contradicts strict product mode.

## Release Discipline

- For human release flow, set `RELEASE_TARGET_VERSION` and keep it aligned with:
  - `package.json` version
  - matching `CHANGELOG.md` heading (`## [x.y.z]`)
- `pack:check` is dry-run only; use `pack:artifact` (or `npm pack`) when a real `.tgz` is required.
- Run pre/post publish smoke checks per `docs/NPM_RELEASE.md`.
- Keep npm deprecation notes and release docs synchronized with actual registry state.

## Repository Boundaries

- Source of truth for product behavior is under product-owned paths (`src/`, `bin/`, `schema/`, `openapi/`, `scripts/`, `test/`, `docs/`).
- Do not add runtime dependencies on external prototype paths.
- Keep JavaScript/CommonJS-only constraints from `AGENTS.md`.

## Documentation Sync Rules

- When behavior/contracts/release posture changes, update at least:
  - `README.md`
  - `docs/STATUSQUO.md`
  - `TODO.md`
  - `ROADMAP.md`
  - `CHANGELOG.md`
  - `docs/NPM_RELEASE.md` (if release flow/state changed)
- `TODO.md` and `ROADMAP.md` must remain synchronized on active/planned cycles.

## Current Planning Context

- `v1.1.0` is completed and published.
- Next line is `v1.2.0` (scope -> implementation -> full gate run -> publish/post-publish smoke).
