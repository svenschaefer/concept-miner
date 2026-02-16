# Status Quo

## Repo status

- Branch: `main`
- Sync: tracking `origin/main` (kept in sync via stable phase commits)
- Current annotated release tag: `v0.10.0`
- Latest stable phase: `v0.083` (prototype split groundwork)
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
  - first safe prototype monolith split step (canonicalization/concept-id utility extraction)
  - second safe prototype monolith split step (shared utility helper extraction)
  - third safe prototype monolith split step (alias/morphology helper extraction)
  - fourth safe prototype monolith split step (options/policy helper extraction)
  - fifth safe prototype monolith split step (Step12 contract/index helper extraction)
  - sixth safe prototype monolith split step (wikipedia-signal helper extraction)
  - seventh safe prototype monolith split step (wikipedia-title-index mapping helper extraction)
  - eighth safe prototype monolith split step (mention selection helper extraction)
  - ninth safe prototype monolith split step (mention lifting helper extraction)
  - tenth safe prototype monolith split step (candidate accumulator helper extraction)
  - eleventh safe prototype monolith split step (mode13b metrics/host-evaluation helper extraction)
  - twelfth safe prototype monolith split step (mode13b host-selection helper extraction)
  - thirteenth safe prototype monolith split step (prune-preparation helper extraction)
  - fourteenth safe prototype monolith split step (alias-merge helper extraction)
  - fifteenth safe prototype monolith split step (emission assembly helper extraction)
  - sixteenth safe prototype monolith split step (diagnostics assembly helper extraction)
  - seventeenth safe prototype monolith split step (persisted output writer helper extraction)
  - eighteenth safe prototype monolith split step (determinism validation helper extraction)
  - nineteenth safe prototype monolith split step (runtime/persisted generation orchestration helper extraction)
  - twentieth safe prototype monolith split step (schema/serialization IO helper extraction)
  - twenty-first safe prototype monolith split step (Step12 input loading helper extraction)
  - twenty-second safe prototype monolith split step (CLI option assembly helper extraction)
  - twenty-third safe prototype monolith split step (CLI usage/validation guard helper extraction)
  - twenty-fourth safe prototype monolith split step (CLI write/emit orchestration helper extraction)
  - twenty-fifth safe prototype monolith split step (CLI main-flow orchestration helper extraction)
  - twenty-sixth safe prototype monolith split step (CLI runtime invocation helper extraction)
  - twenty-seventh safe prototype monolith split step (CLI context assembly helper extraction)
  - twenty-eighth safe prototype monolith split step (CLI runtime invocation binding helper extraction)
  - twenty-ninth safe prototype monolith split step (CLI flow dependency assembly helper extraction)
  - thirtieth safe prototype monolith split step (CLI parse-context wrapper helper extraction)
  - thirty-first safe prototype monolith split step (CLI main setup orchestrator helper extraction)
  - thirty-second safe prototype monolith split step (CLI parse-dependency assembly helper extraction)
  - thirty-third safe prototype monolith split step (CLI flow-context dependency assembly helper extraction)
  - thirty-fourth safe prototype monolith split step (CLI runtime-invocation dependency assembly helper extraction)
  - thirty-fifth safe prototype monolith split step (CLI flow-dependency assembly helper extraction)
  - thirty-sixth safe prototype monolith split step (CLI main-setup dependency bundle helper extraction)
  - thirty-seventh safe prototype monolith split step (CLI main-setup invocation helper extraction)
  - thirty-eighth safe prototype monolith split step (CLI main-setup pipeline helper extraction)
  - thirty-ninth safe prototype monolith split step (CLI main pipeline input-assembly helper extraction)
  - fortieth safe prototype monolith split step (CLI main pipeline dependency-bundle helper extraction)

## Implementation status

Implemented and stable:

- Template-aligned package scaffold and release/CI wiring are in place.
- Product API and CLI surfaces are implemented and contract-tested.
- OpenAPI/schema/runtime alignment checks are active.
- Frozen reference governance and full golden artifact regression checks are active across all seed fixtures.

Remaining open implementation items:

- Split `prototype/concept-candidates.js` into product-style modules under `src/`.
- Preserve deterministic behavior and ordering guarantees during that refactor.
- Replace internal `13a`/`13b` step labels with product mode naming in internal config/meta surfaces.
- Migrate remaining prototype support/governance assets into product structure.

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
- Golden artifact regeneration checks are active for all seeds and both modes (`13a`, `13b`), plus default output.

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
