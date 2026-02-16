# concept-miner Roadmap

This roadmap is derived from `TODO.md` and sequences productization into small, releasable increments.

Versioning note:
- `v0.001+` is used for pre-1.0 productization milestones.
- Each milestone requires deterministic behavior and explicit contract validation.

## v0.001 - Foundation And Scope Lock

Goals:
- Finalize scope decisions from `TODO.md` Section 0.
- Lock product naming and mode terminology.
- Establish repository baseline for productization work.

Deliverables:
- Decision record for:
  - packaging target (repo root vs `prototype/`)
  - canonical output contract (`concepts[]` vs `concept_candidates[]`)
  - OpenAPI/schema compatibility strategy
- Product-facing terminology lock:
  - `generic baseline mode`
  - `default extended mode`
  - `wikipedia` / `wikipedia-title-index`
- Initial `ROADMAP.md` and aligned `TODO.md`.

Exit criteria:
- Scope and contract decisions approved.
- No unresolved terminology conflicts in plan docs.

Status:
- Completed on `main`.

## v0.002 - Template Scaffold Integration

Goals:
- Bring repository structure in line with `C:\code\.nodejs-project-template`.

Deliverables:
- Add template baseline files/directories at chosen product root.
- Replace template placeholders.
- Add initial `package.json`/scripts wiring and `project.config.json`.
- Add `.github/workflows` baseline (`ci.yml`, `release.yml`).

Exit criteria:
- Template structure present and coherent.
- `npm ci` runnable in product root.

Status:
- Completed on `main`.

## v0.003 - Core Runtime Extraction Port

Goals:
- Port prototype core logic from `prototype/concept-candidates.js` into `src/*`.

Deliverables:
- Library-first module split:
  - `src/run.js`
  - `src/core/*`
  - `src/validate/*`
  - `src/tools/*`
- Deterministic behavior preserved:
  - canonicalization
  - concept-id generation
  - stable ordering/serialization

Exit criteria:
- Core extraction runs via library API.
- Deterministic replay checks pass for pinned inputs.

Status:
- Completed for transition API baseline on `main`.

## v0.004 - Contract Consolidation (Schema + OpenAPI)

Goals:
- Make runtime output, JSON schema, and OpenAPI contract consistent.

Deliverables:
- Canonical public document choice implemented.
- `schema/concepts.schema.json` and `openapi/openapi.yaml` aligned.
- Explicit handling of:
  - `schema_version`
  - `concepts`/document structure
  - UTF-16 offset contract
  - endpoint contracts:
    - `POST /v1/concepts/extract`
    - `POST /v1/concepts/validate`

Exit criteria:
- Contract tests pass for schema/API shape consistency.

Status:
- In progress.

## v0.005 - CLI Productization

Goals:
- Ship stable CLI behavior on top of core API.

Deliverables:
- `bin/cli.js` thin entrypoint with error handling.
- `run` and `validate` commands.
- Config loading contract (`--config`) with explicit failure semantics.
- Product mode flags/naming (no `13a/13b` or `wiki/wti` in product-facing help).

Exit criteria:
- CLI contract tests pass (`Usage`, input exclusivity, config errors).

Status:
- Completed for initial product commands (`extract`, `validate-concepts`) while compatibility commands remain.

## v0.006 - Prototype Governance And Tooling Migration

Goals:
- Preserve prototype governance and benchmark safety nets.

Deliverables:
- Migrate and wire:
  - `BENCHMARK_POLICY.md`, `LEGACY_POLICY.md`
  - `check-benchmark-policy.js`, `check-legacy-policy.js`
  - `check-concept-candidates.js`
  - `concept-candidates.independent-benchmark.js`
  - `concept-candidates.13b-threshold-sweep.js`
  - `step12-wikipedia-title-index-coverage.js`
- Define policy for generated reports:
  - `13b-threshold-sweep.report.json`
  - `step12-wikipedia-title-index.coverage.report.json`

Exit criteria:
- Policy guard scripts enforced in CI.
- Benchmark and coverage tooling runs deterministically.

Status:
- Completed in CI baseline (`check:concept-candidates:policies` in `ci:check`).

## v0.007 - Realistic Regression Corpus Lock

Goals:
- Protect behavior against realistic seed regressions.

Deliverables:
- Keep corpus structure:
  - `test/artifacts/<seed>/seed.txt`
  - `test/artifacts/<seed>/result-reference/*`
- Golden/frozen regression suite:
  - output comparisons
  - metadata sidecar comparisons
  - diagnostics sidecar comparisons
- Controlled reference-update workflow with rationale requirement.

Exit criteria:
- Frozen reference tests pass.
- CI blocks silent baseline drift.

Status:
- Completed with enforced artifact layout and frozen persisted-mode reference checks.

## v0.008 - Documentation And Operationalization

Goals:
- Make repository documentation truthful, complete, and testable.

Deliverables:
- Productized `README.md` with verified runnable paths.
- Required docs set aligned with template tests:
  - `docs/NPM_RELEASE.md`
  - `docs/REPO_WORKFLOWS.md`
  - `docs/OPERATIONAL.md`
  - `docs/DEV_TOOLING.md`
  - `docs/RELEASE_NOTES_TEMPLATE.md`
  - `docs/BASELINE_TEST_RUN.md`
  - `docs/GUARANTEES.md`
  - `docs/STATUSQUO.md`
  - `docs/TEMPLATE_SETUP.md`
- Release doc rule preserved (`git add ...`, no `git add -A`).

Exit criteria:
- Docs consistency tests pass.
- README matches actual repo state.

Status:
- Completed for current implemented API/CLI state.

## v0.009 - CI Gates And Release Readiness

Goals:
- Finalize quality gates and release checks.

Deliverables:
- Passing gates:
  - `npm run lint`
  - `npm test`
  - `npm run dev:check`
  - `npm run dev:report:metrics`
  - `npm run dev:report:maturity`
  - `npm run pack:check`
  - `npm run smoke:release`
  - `npm run ci:check`
  - `npm run release:check`
- Release workflow validates tag/version and tarball.

Exit criteria:
- Full gate suite green on local and CI.

Status:
- Completed locally (`npm run release:check` green).

## v0.010 - First Productized Pre-1.0 Release

Goals:
- Cut first productized release candidate on the new structure.

Deliverables:
- Version bump and changelog entry.
- Pre-publish and post-publish smoke checks.
- Release notes from template.
- Updated `docs/STATUSQUO.md`.

Exit criteria:
- Tagged release candidate shipped.
- Repository state reproducible and documented.

Status:
- Completed as release-candidate baseline (`0.10.0`) on `main`.

## Next Execution Cycles

Cycle A (`v0.010-a`) - Frozen Reference Governance:
- Add explicit frozen-reference change policy enforcement in CI.
- Require changelog rationale when `test/artifacts/*/result-reference/*` changes.
- Keep existing frozen-reference regression tests green.
Status:
- Completed on `main`.

Cycle B (`v0.010-b`) - OpenAPI/Schema Tight Alignment:
- Close remaining contract drift between `openapi/openapi.yaml` and `schema/concepts.schema.json`.
- Add alignment tests for required fields and input constraints.
- Keep product extraction/validation surfaces stable.
Status:
- Completed on `main`.

Cycle C (`v0.010-c`) - Operational Docs And Status:
- Update `docs/STATUSQUO.md` with current factual project state.
- Update changelog unreleased notes for completed productization phases.
- Re-run `release:check` and keep all gates green.
Status:
- Completed on `main`.

## Planned Next Cycles (Execution Bulk)

Cycle D (`v0.010-d`) - Release Candidate Finalization:
- Finalize version bump artifacts for first productized pre-1.0 release candidate.
- Keep gate suite green on the exact release candidate tree.
- Commit and push stable release-candidate snapshot.
Status:
- Completed on `main`.

Cycle E (`v0.011`) - Product-Facing Mode Terminology Normalization:
- Remove `13a`/`13b` naming from product-facing script names and README command examples.
- Expose mode labels as:
  - `generic-baseline`
  - `default-extended`
- Keep backward-compatible script aliases where needed for migration safety.
Status:
- Completed on `main`.

Cycle F (`v0.012`) - Product-Facing Naming Guardrails:
- Add tests that assert product-facing surfaces do not expose forbidden labels:
  - `step13`, `13a`, `13b`
  - `wiki`, `wti`
- Guard CLI help and primary docs from terminology regression.
Status:
- Completed on `main`.

Cycle G (`v0.013`) - Mode Value Ergonomics:
- Accept kebab-case mode values in product API/CLI:
  - `generic-baseline`
  - `default-extended`
- Keep underscore variants supported for compatibility:
  - `generic_baseline`
  - `default_extended`
- Update help/docs/tests to reflect accepted mode values clearly.
Status:
- Completed on `main`.

Cycle H (`v0.014`) - Scope Decision Closure In Backlog:
- Reconcile `TODO.md` Section 0 with already-implemented repository decisions.
- Mark resolved scope/contract decisions as complete with explicit selected options.
- Keep remaining backlog focused on still-open engineering work.
Status:
- Completed on `main`.

Cycle I (`v0.015`) - Canonical Validation Command Alignment:
- Align compatibility `validate` command with canonical concepts schema validation.
- Keep legacy template-document validation as fallback during transition.
- Add explicit CLI tests for canonical and fallback validation behavior.
Status:
- Completed on `main`.

Cycle J (`v0.016`) - Sidecar Contract Guarding:
- Add explicit integration contracts for metadata and diagnostics sidecars in frozen references.
- Assert mode-tagging consistency for `generic baseline mode` and `default extended mode`.
- Validate required top-level shape so accidental sidecar drift is detected early.
Status:
- Completed on `main`.

Cycle K (`v0.017`) - Prototype Tooling Execution Contracts:
- Add integration contracts that execute benchmark/report scripts in deterministic test scope.
- Validate both mode evaluations (`generic baseline mode` and `default extended mode`) execute successfully.
- Validate threshold sweep and wikipedia-title-index coverage reports are generated with expected top-level shape.
Status:
- Completed on `main`.

Cycle L (`v0.018`) - README REST Quick-Start Completion:
- Add concrete REST quick-start examples for:
  - `POST /v1/concepts/extract`
  - `POST /v1/concepts/validate`
- Keep wording consistent with canonical `concepts` document contract.
- Add docs contract test coverage to prevent regression.
Status:
- Completed on `main`.

Cycle M (`v0.019`) - Step12 Dependency Boundary Documentation:
- Explicitly document the upstream `elementary-assertions` boundary for Step12 inputs.
- Clarify what is in-scope vs out-of-scope for concept-miner when Step12 artifacts are malformed or changed upstream.
- Add a docs consistency test for this boundary note.
Status:
- Completed on `main`.

Cycle N (`v0.020`) - First Annotated Tag And Tag Strategy Closure:
- Confirm and document pre-1.0 tag strategy for productized milestones.
- Run `release:check` on clean tree.
- Create and push first annotated repository tag aligned to current package version.
Status:
- Completed on `main`.

Cycle O (`v0.021`) - TODO Truth-Sync Pass:
- Reconcile `TODO.md` checkbox state with work already completed on `main`.
- Mark completed template/CLI/CI/doc items that are already verified by tests and gates.
- Leave genuinely open engineering items unchecked with explicit remaining scope.
Status:
- Completed on `main`.

Cycle P (`v0.022`) - Release Workflow Contract Enforcement:
- Add tests that assert `.github/workflows/release.yml` enforces tag/version match.
- Assert release workflow produces and uploads npm tarball artifacts.
- Keep release documentation and TODO status aligned with verified workflow behavior.
Status:
- Completed on `main`.

Cycle Q (`v0.023`) - Publish Prerequisites And `npm ci` Gate Closure:
- Add docs consistency checks for npm publish prerequisites (`NPM_TOKEN`, `npm whoami`).
- Execute `npm ci` in repository and keep lockfile/install state stable.
- Close remaining TODO quality-gate/doc prerequisite items backed by explicit checks.
Status:
- Completed on `main`.

Cycle R (`v0.024`) - Post-Productization Documentation Closure:
- Publish concrete release notes from `docs/RELEASE_NOTES_TEMPLATE.md` for `v0.10.0`.
- Refresh `docs/STATUSQUO.md` with current repository/tag/test state.
- Add and document an explicit backlog for upstream Step12 improvements that remain out of this repository.
Status:
- Completed on `main`.

Cycle S (`v0.025`) - Operational Wrapper And Candidate-Checker Closure:
- Document optional PowerShell helper wrapper flows around core CLI/prototype tools.
- Add deterministic integration contract that executes `prototype/check-concept-candidates.js` on staged artifacts.
- Close related TODO operational/tooling checks while leaving unresolved platform-dependent batch flows explicit.
Status:
- Completed on `main`.

Cycle T (`v0.026`) - Generated Report Artifact Policy Closure:
- Decide and document governance for generated prototype report artifacts.
- Enforce policy in CI when report snapshots change.
- Align TODO status with explicit checked-in snapshot policy decision.
Status:
- Completed on `main`.

Cycle U (`v0.027`) - Prototype Documentation Migration Closure:
- Migrate key contract/governance points from `prototype/README.md` into product-facing docs.
- Capture open/closed items from `prototype/TODO.md` in product backlog history.
- Keep prototype specifics explicit while preserving product naming in primary docs.
Status:
- Completed on `main`.

Cycle V (`v0.028`) - Batch Seed Runner Contract Closure:
- Add integration coverage for `prototype/run-seed-concept-candidates.ps1` in persisted mode.
- Use staged artifact fixtures and platform-safe skipping when PowerShell is unavailable.
- Close remaining prototype-derived product check item for documented batch runner flow.
Status:
- Completed on `main`.

Cycle W (`v0.029`) - Execution-Order Phase Sync:
- Reconcile `TODO.md` Section 12 phase checkboxes with completed work to date.
- Mark fully completed phases and leave partially complete phases open.
- Keep roadmap/status text aligned with this phase-state truth.
Status:
- Completed on `main`.

Cycle X (`v0.030`) - Prototype Determinism And Hard-Failure Closure:
- Add explicit tests for prototype hard-failure behavior on invalid Step12 wikipedia count typing.
- Add deterministic replay checks for in-process and fresh-process executions.
- Verify serialization invariants (LF endings, single trailing newline) in replay checks.
Status:
- Completed on `main`.

Cycle Y (`v0.031`) - Contract Docs Sync And Envelope Clarification:
- Synchronize `openapi/README.md` and `schema/README.md` with canonical concepts-document contract.
- Explicitly document REST vs persisted-document envelope behavior.
- Add tests so contract-doc alignment and endpoint/schema mapping cannot silently drift.
Status:
- Completed on `main`.

Cycle Z (`v0.032`) - Repository Layout Decision Closure:
- Make explicit long-term placement decision for prototype assets.
- Document migration-table applicability based on that decision.
- Close repository-layout decision TODO items with traceable rationale.
Status:
- Completed on `main`.

Cycle AA (`v0.033`) - Prototype Test Corpus Entrypoint Migration:
- Make `prototype/concept-candidates.test.js` runnable in the productized repository layout.
- Add product integration contract that executes the legacy prototype test corpus entrypoint.
- Close remaining TODO test-governance items covered by that corpus (anti-regression guards and soft performance budget retention decision).
Status:
- Completed on `main`.

Cycle AB (`v0.034`) - Concepts-Contract Invariant Enforcement:
- Enforce currently undocumented-but-required invariants in concepts validation:
  - occurrence bounds (`end >= start`)
  - unique concept `id`
  - unique concept `name`
- Add unit contract tests for these invariants.
- Close the corresponding TODO schema/runtime invariant item.
Status:
- Completed on `main`.

Cycle AC (`v0.035`) - Concepts Runtime Modularization:
- Refactor `src/concepts.js` helper clusters into focused modules under `src/core` and `src/validate`.
- Keep extraction and validation behavior byte-for-byte compatible for existing tests.
- Close the TODO item on ad-hoc helper modularization in the current product runtime path.
Status:
- Completed on `main`.

Cycle AD (`v0.036`) - CLI Thin-Entrypoint Contract:
- Add explicit contract tests that `bin/cli.js` remains a thin entrypoint delegating to `src/tools/cli`.
- Keep compatibility command surfaces (`run`, `validate`) intact in usage contract.
- Close TODO item for removing business logic from CLI path.
Status:
- Completed on `main`.

Cycle AE (`v0.037`) - Compatibility Alias Contract Closure:
- Add explicit positive-path tests for compatibility commands (`run`, `validate`) in addition to failure-path coverage.
- Keep underscore mode aliases and legacy validation fallback behavior contractually covered.
- Close TODO item for backward-compatible aliases/flags retention during transition.
Status:
- Completed on `main`.

Cycle AF (`v0.038`) - Persisted Candidate-Schema Migration:
- Promote the prototype persisted candidate schema into `schema/` as product-owned contract artifact.
- Wire prototype generator/checker/test paths to resolve schema from product location with compatibility fallback.
- Close TODO item for persisted schema artifact migration/replacement.
Status:
- Completed on `main`.

Cycle AG (`v0.039`) - Golden Full-Artifact Diff Coverage:
- Add integration coverage that regenerates per-seed persisted artifacts and compares them against `result-reference`.
- Validate `*.yaml` and `*.json` golden artifacts for both `13a` and `13b` modes, with deterministic normalization for known runtime-variant diagnostics timing fields.
- Close the TODO item for full frozen artifact diff validation.
Status:
- Completed on `main`.

Cycle AH (`v0.040`) - Core Extraction Invariant Contracts:
- Add explicit invariant tests for prototype extraction core behavior:
  - canonicalization behavior
  - deterministic concept-id generation
  - role bucket materialization and non-negative counts
  - wikipedia-title-index signal typing (`*_count` integer, non-count boolean)
- Validate invariants across realistic persisted Step12 seed fixtures.
- Close TODO item for preserving core extraction contract invariants.
Status:
- Completed on `main`.

Cycle AI (`v0.041`) - Release Smoke Rehearsal Closure:
- Implement and execute deterministic release-smoke rehearsal for both prepublish and postpublish-style clean workspaces.
- Use local tarball install flow for rehearsal to avoid requiring public npm publication in the current private-package phase.
- Document rehearsal behavior in release docs and close TODO item for pre/post publish smoke flow execution.
Status:
- Completed on `main`.

Cycle AJ (`v0.042`) - Determinism And Ordering Guard Closure:
- Add explicit repeat-run determinism contracts across realistic Step12 seed fixtures for `13a` and `13b`.
- Assert byte-stable YAML and metadata ordering, with diagnostics comparison normalized only for runtime timing fields.
- Close TODO item for preserving deterministic behavior and ordering guarantees during refactor.
Status:
- Completed on `main`.

Cycle AK (`v0.043`) - Runtime Input Path Transition Closure:
- Add explicit product-level integration contracts for runtime seed-text input path (`seedId` + `artifactsRoot`) in both product modes.
- Assert deterministic output stability for repeated runtime seed-path extraction calls.
- Close TODO item for preserving runtime input paths and modes during transition.
Status:
- Completed on `main`.

Cycle AL (`v0.044`) - Prototype Split Groundwork (Canonicalization Module):
- Extract canonicalization and concept-id utility functions from `prototype/concept-candidates.js` into a dedicated module.
- Keep behavior and public exports unchanged while reducing monolith size.
- Preserve full frozen-reference and determinism gate stability after extraction.
Status:
- Completed on `main`.

Cycle AM (`v0.045`) - Prototype Split Groundwork (Shared Utility Module):
- Extract shared utility helpers (`compare/assert/semver/sorting/count/rounding`) from `prototype/concept-candidates.js` into a dedicated module.
- Keep behavior and exported prototype runtime contracts unchanged.
- Preserve full frozen-reference and determinism gate stability after extraction.
Status:
- Completed on `main`.

Cycle AN (`v0.046`) - Prototype Split Groundwork (Alias/Morphology Module):
- Extract alias/morphology helper logic from `prototype/concept-candidates.js` into a dedicated module.
- Keep behavior and exported prototype runtime contracts unchanged.
- Preserve full frozen-reference and determinism gate stability after extraction.
Status:
- Completed on `main`.

Cycle AO (`v0.047`) - Prototype Split Groundwork (Options/Policy Module):
- Extract option parsing and mode/policy helper logic from `prototype/concept-candidates.js` into a dedicated module.
- Keep behavior and exported prototype runtime contracts unchanged.
- Preserve full frozen-reference and determinism gate stability after extraction.
Status:
- Completed on `main`.

Cycle AP (`v0.048`) - Prototype Split Groundwork (Step12 Contract Module):
- Extract Step12 contract and index helper logic from `prototype/concept-candidates.js` into a dedicated module.
- Keep behavior and exported prototype runtime contracts unchanged.
- Preserve full frozen-reference and determinism gate stability after extraction.
Status:
- Completed on `main`.

Cycle AQ (`v0.049`) - Prototype Split Groundwork (Wikipedia-Signal Module):
- Extract wikipedia-signal regex/constants and helper logic from `prototype/concept-candidates.js` into a dedicated module.
- Keep behavior and exported prototype runtime contracts unchanged.
- Preserve full frozen-reference and determinism gate stability after extraction.
Status:
- Completed on `main`.

Cycle AR (`v0.050`) - Prototype Split Groundwork (Wikipedia Mapping Helpers):
- Extract wikipedia-title-index mapping helpers from `prototype/concept-candidates.js` into a dedicated module.
- Keep behavior and exported prototype runtime contracts unchanged.
- Preserve full frozen-reference and determinism gate stability after extraction.
Status:
- Completed on `main`.

Cycle AS (`v0.051`) - Prototype Split Groundwork (Mention Selection Helpers):
- Extract mention ranking/selection helper logic from `prototype/concept-candidates.js` into a dedicated module.
- Keep behavior and exported prototype runtime contracts unchanged.
- Preserve full frozen-reference and determinism gate stability after extraction.
Status:
- Completed on `main`.

Cycle AT (`v0.052`) - Prototype Split Groundwork (Mention Lifting Helpers):
- Extract mention lifting helper logic from `prototype/concept-candidates.js` into a dedicated module.
- Keep behavior and exported prototype runtime contracts unchanged.
- Preserve full frozen-reference and determinism gate stability after extraction.
Status:
- Completed on `main`.

Cycle AU (`v0.053`) - Prototype Split Groundwork (Candidate Accumulator Helpers):
- Extract candidate accumulator/update helper logic from `prototype/concept-candidates.js` into a dedicated module.
- Keep behavior and exported prototype runtime contracts unchanged.
- Preserve full frozen-reference and determinism gate stability after extraction.
Status:
- Completed on `main`.

Cycle AV (`v0.054`) - Prototype Split Groundwork (Mode13b Metrics Helpers):
- Extract mode13b metric/host-evaluation helper logic from `prototype/concept-candidates.js` into a dedicated module.
- Keep behavior and exported prototype runtime contracts unchanged.
- Preserve full frozen-reference and determinism gate stability after extraction.
Status:
- Completed on `main`.

Cycle AW (`v0.055`) - Prototype Split Groundwork (Mode13b Host-Selection Helpers):
- Extract mode13b stronger-host suppression and host-ranking helper logic from `prototype/concept-candidates.js` into a dedicated module.
- Keep behavior and exported prototype runtime contracts unchanged.
- Preserve full frozen-reference and determinism gate stability after extraction.
Status:
- Completed on `main`.

Cycle AX (`v0.056`) - Prototype Split Groundwork (Prune-Preparation Helpers):
- Extract prune-phase preparation/index helper logic from `prototype/concept-candidates.js` into a dedicated module.
- Keep behavior and exported prototype runtime contracts unchanged.
- Preserve full frozen-reference and determinism gate stability after extraction.
Status:
- Completed on `main`.

Cycle AY (`v0.057`) - Prototype Split Groundwork (Alias-Merge Helpers):
- Extract alias merge-target and canonical merge helper logic from `prototype/concept-candidates.js` into a dedicated module.
- Keep behavior and exported prototype runtime contracts unchanged.
- Preserve full frozen-reference and determinism gate stability after extraction.
Status:
- Completed on `main`.

Cycle AZ (`v0.058`) - Prototype Split Groundwork (Emission Assembly Helpers):
- Extract emitted candidate assembly and wikipedia-title-index evidence materialization helpers from `prototype/concept-candidates.js` into a dedicated module.
- Keep behavior and exported prototype runtime contracts unchanged.
- Preserve full frozen-reference and determinism gate stability after extraction.
Status:
- Completed on `main`.

Cycle BA (`v0.059`) - Prototype Split Groundwork (Diagnostics Assembly Helpers):
- Extract diagnostics/sidecar assembly helper logic from `prototype/concept-candidates.js` into a dedicated module.
- Keep behavior and exported prototype runtime contracts unchanged.
- Preserve full frozen-reference and determinism gate stability after extraction.
Status:
- Completed on `main`.

Cycle BB (`v0.060`) - Prototype Split Groundwork (Persisted Output Writer Helpers):
- Extract persisted output/sidecar writer helper logic from `prototype/concept-candidates.js` into a dedicated module.
- Keep behavior and exported prototype runtime contracts unchanged.
- Preserve full frozen-reference and determinism gate stability after extraction.
Status:
- Completed on `main`.

Cycle BC (`v0.061`) - Prototype Split Groundwork (Determinism Validation Helpers):
- Extract deterministic output contract validation helper clusters from `prototype/concept-candidates.js` into dedicated modules.
- Keep behavior and exported prototype runtime contracts unchanged.
- Preserve full frozen-reference and determinism gate stability after extraction.
Status:
- Completed on `main`.

Cycle BD (`v0.062`) - Prototype Split Groundwork (Runtime/Persisted Generation Helpers):
- Extract shared runtime/persisted generation orchestration helper logic from `prototype/concept-candidates.js` into dedicated modules.
- Keep behavior and exported prototype runtime contracts unchanged.
- Preserve full frozen-reference and determinism gate stability after extraction.
Status:
- Completed on `main`.

Cycle BE (`v0.063`) - Prototype Split Groundwork (Schema/Serialization IO Helpers):
- Extract schema loading/validation and deterministic serialization IO helper logic from `prototype/concept-candidates.js` into dedicated modules.
- Keep behavior and exported prototype runtime contracts unchanged.
- Preserve full frozen-reference and determinism gate stability after extraction.
Status:
- Completed on `main`.

Cycle BF (`v0.064`) - Prototype Split Groundwork (Step12 Input Loading Helpers):
- Extract Step12 artifact loading and seed-path resolution helper logic from `prototype/concept-candidates.js` into dedicated modules.
- Keep behavior and exported prototype runtime contracts unchanged.
- Preserve full frozen-reference and determinism gate stability after extraction.
Status:
- Completed on `main`.

Cycle BG (`v0.065`) - Prototype Split Groundwork (CLI Option Assembly Helpers):
- Extract CLI option parsing and run-option assembly helper logic from `prototype/concept-candidates.js` into dedicated modules.
- Keep behavior and exported prototype runtime contracts unchanged.
- Preserve full frozen-reference and determinism gate stability after extraction.
Status:
- Completed on `main`.

Cycle BH (`v0.066`) - Prototype Split Groundwork (CLI Validation/Usage Guard Helpers):
- Extract CLI validation/usage guard helper logic from `prototype/concept-candidates.js` into dedicated modules.
- Keep behavior and exported prototype runtime contracts unchanged.
- Preserve full frozen-reference and determinism gate stability after extraction.
Status:
- Completed on `main`.

Cycle BI (`v0.067`) - Prototype Split Groundwork (CLI Write/Emit Orchestration Helpers):
- Extract CLI output write/emit orchestration helper logic from `prototype/concept-candidates.js` into dedicated modules.
- Keep behavior and exported prototype runtime contracts unchanged.
- Preserve full frozen-reference and determinism gate stability after extraction.
Status:
- Planned.
