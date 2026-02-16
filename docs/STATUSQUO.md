# Status Quo

## Repo status

- Branch: `main`
- Sync: tracking `origin/main` (kept in sync via stable phase commits)
- Current annotated release tag: `v0.10.0`
- Major completed workstreams:
  - template baseline scaffold + CI/release workflow
  - transition product API (`extractConcepts`, `validateConcepts`)
  - product CLI commands (`extract`, `validate-concepts`) plus compatibility commands
  - prototype governance checks integrated into CI
  - frozen artifact corpus layout + frozen reference regression checks
  - OpenAPI/schema contract guard tests
  - sidecar and release-workflow contract tests

## Runtime status

Working commands:

- `npm ci`
- `npm test`
- `npm run ci:check`
- `npm run release:check`
- `npm run check:concept-candidates:policies`
- `npm run check:frozen-references-policy`

Known setup constraints:

- Node.js `>=20` is required.
- Prototype benchmark/policy scripts rely on in-repo `prototype/` paths.

## Quality status

- Local gates are green:
  - lint
  - tests (unit + integration)
  - policy checks
  - report scripts
  - pack dry-run
  - release smoke
- Deterministic frozen-reference checks are active for persisted-mode outputs.

## Documentation status

Recently updated:

- `README.md`
- `ROADMAP.md`
- `TODO.md`
- `docs/FROZEN_REFERENCES_POLICY.md`
- `docs/releases/v0.10.0.md`
- `docs/STEP12_UPSTREAM_BACKLOG.md`
