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
