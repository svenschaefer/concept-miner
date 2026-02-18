# concept-miner Productization TODO

Goal: productize the current concept-miner prototype (`prototype/`) into a template-aligned Node.js package in this repository, based on `C:\code\.nodejs-project-template`.

Status date: 2026-02-18

## Immediate Execution Cycles (completed through v1.0.9)

- [x] `v1.0.5` remove generic-baseline/13a from product stream:
- mode handling accepts only `default-extended`
- remove 13a product scripts/tests/docs references
- remove runtime expectations for 13a artifacts
- [x] `v1.0.6` restore prototype-equivalent default-extended runtime extraction:
- product text extraction must execute Step12 (`elementary-assertions`) + product-owned Step13 candidate construction
- remove token-regex fallback extraction path from default runtime behavior
- [x] `v1.0.7` make quality gate extraction-runtime-based (not frozen-artifact replay):
- evaluate benchmark from `seed.txt` runtime generation in product code
- require `overall_score=100.0` in default-extended mode
- [x] `v1.0.8` productize relevant prototype tests into product-owned tests:
- port core invariants/determinism/schema/benchmark checks required for Step13 behavior
- remove product test/runtime dependence on `prototype/*` modules/scripts
- [x] `v1.0.9` doc and release sync:
- update README/docs/STATUSQUO/TODO/ROADMAP and release notes to strict 13b-only product behavior
- run full gate, then commit and push stable phase

## Next Release Line: v1.1.0

- [x] Define and approve `v1.1.0` scope (feature set and non-goals).
- [x] Add concrete `v1.1.0` execution cycles to `ROADMAP.md`.
- [ ] Execute `v1.1.0` cycles with full gate validation and release notes.
- [x] Analyze all changes in `prototype/*` against product source and port the deltas that improve candidate quality or test quality.
- [x] Prioritize and apply Step13 quality improvements from prototype (`concept-candidates.js` / benchmark / tests) into product-owned code and tests.
- [x] Re-run and iterate until `npm run check:quality-gate:13b` reaches `overall_score=100.0` again.
- [x] Port remaining prototype deletion-safety gaps:
- detailed independent benchmark diagnostics tooling
- standalone concept-candidates determinism checker script
- heuristic-level Step13 regression tests
- product PowerShell seed runner script
- [x] Remove `prototype/` directory from repository after port-completeness gate.
- [x] Update docs/policies/tests that still assume in-repo prototype retention.
- [ ] Re-run full release gates after prototype removal (`npm run ci:check`, `npm run release:check`).

## Progress Snapshot

- [x] `v0.001` scaffold baseline integrated and green gates (`28c7c0a`).
- [x] `v0.002` template scaffold integration completed and runnable in product root.
- [x] `v0.003` transition `extractConcepts` / `validateConcepts` API added (`ac5711a`).
- [x] `v0.004` product CLI commands `extract` and `validate-concepts` added (`9e08f3b`).
- [x] `v0.005` realistic artifacts corpus layout contract test added (`077d9cf`).
- [x] `v0.006` prototype benchmark/legacy policy guards enforced in `ci:check` (`c4a5ff6`).
- [x] `v0.007` frozen persisted-mode references enforced against `result-reference` (`33d6cfe`).
- [x] `v0.008` README updated with current API/CLI usage (`8ba14c0`).
- [x] `v0.009` release-readiness gate (`npm run release:check`) passes locally.
- [x] `v0.010-a` frozen reference policy guard added to CI (`235442d`).
- [x] `v0.010-b` OpenAPI/schema constraint alignment tightened (`73efa3a`).
- [x] `v0.010-c` operational docs/changelog refreshed and release check re-verified (`ab2671f`).
- [x] `v0.010-d` release-candidate baseline finalized at `0.10.0` (`efab0a1`).
- [x] `v0.010` first productized pre-1.0 release baseline completed (`0.10.0`).
- [x] `v0.011` product-facing script/readme mode terminology normalized (generic-baseline/default-extended).
- [x] `v0.012` product-facing terminology guardrails added (no `step13`/`13a`/`13b`/`wiki`/`wti` in primary surfaces).
- [x] `v0.013` mode ergonomics aligned (historical).
- [x] `v0.014` scope/contract decisions in Section 0 reconciled to implemented repository state.
- [x] `v0.015` compatibility `validate` command aligned to canonical concepts validation with legacy fallback.
- [x] `v0.016` metadata/diagnostics sidecar contracts added and enforced against frozen references.
- [x] `v0.017` prototype benchmark/report tooling execution contracts added in bounded deterministic integration tests.
- [x] `v0.018` README REST quick-start examples added with docs regression coverage.
- [x] `v0.019` Step12 upstream dependency boundary documented and regression-tested in docs checks.
- [x] `v0.020` first annotated pre-1.0 tag workflow closed with clean `release:check` gate.
- [x] `v0.021` TODO checklist truth-synced to completed template/CLI/tests/docs/CI work.
- [x] `v0.022` release workflow contract checks added for tag/version match and tarball artifact publication steps.
- [x] `v0.023` npm publish prerequisites docs and `npm ci` clean-install gate verified and test-covered.
- [x] `v0.024` post-productization docs closed: release notes published, status snapshot refreshed, upstream Step12 backlog documented.
- [x] `v0.025` optional PowerShell wrapper flows documented and `check-concept-candidates` execution contract added.
- [x] `v0.026` generated report artifact policy decided (checked-in snapshots) and enforced in CI.
- [x] `v0.027` prototype documentation mined/migrated into product docs with backlog history mapping.
- [x] `v0.028` PowerShell seed-runner persisted-mode contract covered via staged integration execution test.
- [x] `v0.029` suggested execution-order phase status synced with completed sections.
- [x] `v0.030` prototype hard-failure and replay determinism contracts added (in-process + fresh-process).
- [x] `v0.031` contract docs synchronized with explicit no-envelope rule and OpenAPI/schema mapping checks.
- [x] `v0.032` repository layout decision documented: keep `prototype/` in-place for current phase.
- [x] `v0.033` product runtime contract hardened to avoid prototype runtime dependency in extraction paths.
- [x] `v0.034` concepts-document invariants enforced in validation (`end >= start`, unique concept ids, unique concept names) with unit contract tests.
- [x] `v0.035` ad-hoc concepts runtime helpers modularized into focused `src/core` and `src/validate` modules.
- [x] `v0.036` thin-CLI entrypoint contract enforced (`bin/cli.js` delegates only) with compatibility usage guards.
- [x] `v0.037` compatibility command/alias positive-path contracts added (`run`, `validate`, underscore/kebab mode support).
- [x] `v0.038` persisted concept-candidates schema migrated to `schema/` and wired via product-location-first resolution with legacy fallback.
- [x] `v0.039` full per-seed frozen artifact regeneration diff coverage added for YAML/JSON golden references (diagnostics normalized for timing fields).
- [x] `v0.040` core extraction invariant contracts added and enforced across realistic persisted Step12 seeds.
- [x] `v0.041` pre/post publish smoke rehearsal flow executed via clean-workspace tarball installs (postpublish simulated for private-package phase).
- [x] `v0.042` repeat-run determinism and ordering contracts enforced across realistic persisted Step12 seeds and both modes.
- [x] `v0.043` runtime seed-text input-path transition compatibility enforced for both legacy and flattened artifact layouts with deterministic product API contracts.
- [x] `v0.102` product runtime decoupled from `prototype/*` modules; extraction now runs product-native paths without prototype runtime imports (`30fc53f`).
- [x] `v0.103` prototype read-only planning enforcement closed: roadmap execution is restricted to product-owned surfaces while prototype remains reference/governance only.
- [x] `v0.104` consolidate product schema export path by moving `src/schema/output.schema.json` to `schema/output.schema.json` and rewiring runtime/package references.
- [x] `v0.105` schema hardening completed: `concept.id` pattern and `surface_forms` uniqueness constraints are now enforced in schema and OpenAPI with alignment tests.
- [x] `v0.106` REST API runtime implementation completed: in-repo HTTP server now hosts `POST /v1/concepts/extract` with deterministic behavior and integration coverage.
- [x] `v0.107` internal mode terminology closure completed: product-owned runtime internals now normalize on product mode names with artifact compatibility fallback retained.
- [x] `v0.108` default-extended extension-field decision closed: no new response fields added in this phase to preserve the stable public concepts contract.
- [x] `v0.109` default-extended wikipedia runtime wiring completed: runtime extraction now queries `wikipedia-title-index` (when reachable/configured) and exposes deterministic enrichment in concept properties.
- [x] `v0.110` formalize stable default-extended enrichment contract in schema/OpenAPI/docs (field-level guarantees).
- [x] `v0.111` stabilize REST/CLI runtime behavior for wikipedia-title-index failure and timeout semantics with explicit tests.
- [x] `v0.112` compatibility-surface decision recorded (historical; superseded by strict `v1.0.4` cut).
- [x] `v0.113` complete API runtime production-hardening checks and explicit error contract coverage.
- [x] `v0.114` close publish posture and release-readiness gates for first stable release (decision carried into `v1.000`: stable release remains `private`).
- [x] `v1.000` first stable release gate closure.
- [x] `v1.0.3` published with stopword filtering improvement for raw-text extraction.
- [x] `v1.0.4` strict-stream hard cut:
- remove CLI compatibility commands (`run`, `validate`)
- remove underscore mode aliases (`generic_baseline`, `default_extended`)
- remove silent default-extended wikipedia-title-index fallback (hard-fail when unavailable)
- remove Step12 token-only fallback (`mentions[]` required)
- remove legacy artifact filename fallback in runtime seed-mode loading
- align docs/contracts/tests to strict mode semantics
- [x] `v1.0.4-a` restore mandatory independent benchmark quality gate for 13b:
- copied benchmark target to product-owned path: `test/benchmark/independent.expected-concept-candidates.yaml`
- added product-owned gate script: `scripts/check-quality-gate-13b.js`
- wired gate into `ci:check` with mandatory `overall_score=100.0` for all benchmark seeds

## 0. Scope And Decisions (must be resolved first)

- [x] Confirm final packaging target:
- Selected: Target A, publishable package at repository root (`C:\code\concept-miner`).
- [x] Confirm product contract boundary:
- Selected: Option 1, product output contract is `schema/concepts.schema.json` (`concepts[]`).
- [x] Define compatibility policy between current OpenAPI and prototype output:
- Selected: keep canonical public concepts document and use explicit transform from prototype candidate output.
- [x] Confirm final mode naming and defaults in all public interfaces:
- `default extended mode` = extraction with wikipedia/wikipedia-title-index information (default and only product runtime mode)
- [x] Enforce terminology policy in code/docs/contracts:
- Use `wikipedia` and `wikipedia-title-index`
- Do not expose `step13`, `13a`, `13b`, `wiki`, or `wti` in product-facing naming
- [x] Confirm Node baseline (template requires Node >=20) and npm baseline.
- Current baseline: Node `>=20` (enforced in `package.json` engines).
- [x] Confirm publish intent and timing:
- Current state: package is publishable (`"private": false`).

## 1. Template Baseline Adoption

- [x] Copy template repository skeleton (excluding `node_modules` and placeholder tokens) into product target.
- [x] Add/align root files from template:
- `.editorconfig`, `.eslintrc.cjs`, `.gitattributes`, `.gitignore`, `.npmignore`
- `package.json`, `package-lock.json`, `project.config.json`
- `README.md`, `CHANGELOG.md`, `CONTRIBUTING.md`, `SECURITY.md`, `LICENSE`, `AGENTS.md`
- [x] Add template directories:
- `bin/`, `src/`, `scripts/`, `docs/`, `test/`, `.github/workflows/`
- [x] Replace all placeholder tokens from template:
- `__PROJECT_NAME__`, `__PACKAGE_NAME__`, `__DESCRIPTION__`, `__CLI_NAME__`
- `__AUTHOR__`, `__GITHUB_OWNER__`, `__REPO_NAME__`, `__KEYWORD_1__`, `__KEYWORD_2__`
- `__YEAR__`
- [x] Ensure line-ending and formatting policy matches template (`LF`, final newline, UTF-8).

## 2. Package Contract And Metadata Hardening

- [x] Define final `package.json` identity fields (`name`, `description`, `keywords`, `author`, `repository`, `bugs`, `homepage`).
- [x] Adapt `project.config.json` to product runtime policies and CLI tool key namespace.
- [x] Configure stable public exports (`.`, `./validate`, `./tools`, `./schema`) and ensure files exist.
- [x] Match template export subpaths exactly unless intentionally versioned away:
- `"." -> "./src/index.js"`
- `"./validate" -> "./src/validate/index.js"`
- `"./tools" -> "./src/tools/index.js"`
- `"./schema" -> "./schema/output.schema.json"` (or documented equivalent with updated tests)
- [x] Configure CLI bin mapping for product command(s).
- [x] Add required scripts from template and adapt to project specifics:
- `lint`, `test`, `test:unit`, `test:integration`
- `dev:check`, `dev:report:metrics`, `dev:report:maturity`
- `pack:check`, `smoke:release`, `ci:check`, `release:check`
- [x] Preserve template script wiring semantics:
- `ci:check` includes `npm run lint` plus full gate chain
- `release:check` fails on dirty worktree before running `ci:check`
- [x] Add runtime deps required by prototype code (`yaml`, `ajv`, `elementary-assertions`) and pin versions.
- [x] Verify package packlist includes docs/security files.

## 3. Source Architecture Refactor (prototype -> library-first package)

- [x] Remove business logic from CLI path; keep CLI as thin wrapper only.
- [x] Convert current ad-hoc helpers into coherent modules:
- argument parsing, IO, deterministic sorting, canonicalization, ID generation, policy parsing.
- [x] Preserve deterministic behavior and ordering guarantees during refactor.
- [x] Keep backward-compatible aliases/flags where already documented (for controlled transition).
- [x] Replace internal mode names in API/CLI/config/meta from step labels to product mode labels.
- [x] Preserve current runtime input paths and modes during transition:
- persisted artifact input path
- runtime seed-text input path with `elementary-assertions` integration
- [x] Replace prototype names in code and CLI while preserving behavior:
- product mode names instead of `13a`/`13b`
- `wikipedia`/`wikipedia-title-index` terms instead of `wiki`/`wti`

## 4. Public Contract Consolidation (OpenAPI + JSON Schema + Runtime)

- [x] Select one canonical persisted document format and make all interfaces consistent.
- [x] Align `openapi/openapi.yaml` with chosen schema contract and actual runtime output.
- [x] Keep and maintain `openapi/README.md` and `schema/README.md` in sync with implemented behavior.
- [x] Preserve and validate current REST endpoint contracts unless intentionally changed:
- `POST /v1/concepts/extract`
- [x] Remove or explicitly document envelope/document differences.
- [x] Enforce missing invariants in schema validation (for example):
- occurrence bounds (`end >= start`)
- uniqueness constraints where required by contract
- identifier/version format constraints if part of public contract
- [x] Add schema export file under `schema/` and wire it to package export.
- [x] Ensure `validate-concepts` command validates against the canonical public schema.
- [x] Remove legacy template-output validation fallback from product CLI.
- [x] Migrate/replace prototype persisted schema artifact:
- `prototype/seed.concept-candidates.schema.json` -> product schema location and validator wiring
- [x] Preserve prototype deterministic serialization contracts where applicable:
- stable top-level key order
- stable per-candidate key order
- UTF-8 + LF + exactly one trailing newline
- [x] Preserve core extraction contract invariants from prototype:
- canonicalization pipeline behavior
- deterministic concept identifier generation
- role bucket materialization and non-negative counts
- wikipedia-title-index signal typing (`*_count` integer, non-count boolean)
- [x] Preserve schema-level concepts-document invariants from `schema/concepts.schema.json`:
- required top-level `schema_version`
- required top-level `concepts`
- optional `input_id` non-empty when present
- [x] Preserve occurrence offset contract in schema/docs/runtime:
- offsets are UTF-16 code units (`occurrences[*].start`, `occurrences[*].end`)
- [x] Define and validate sidecar contracts explicitly:
- metadata sidecar schema/content (mode + thresholds + runtime context)
- diagnostics sidecar schema/content (source-by-canonical + policy hits + stats)
- [x] Tighten product schema constraints where behavior is already deterministic:
- add explicit `concept.id` format constraint (product-owned pattern)
- enforce `surface_forms` uniqueness (`uniqueItems: true`)
- promote currently code-only invariants into schema where feasible
- [x] Evaluate optional product-safe extension fields for default extended mode:
- structured wikipedia-title-index signal block under product naming
- optional diagnostics/traceability block (e.g. mention/assertion provenance) without exposing prototype `concept_candidates` artifact contract.
- Decision: broad schema-level extension block remains deferred; `v0.109` introduced runtime enrichment under existing `concepts[*].properties` without changing required schema shape.

## 5. CLI And Tooling Productization

- [x] Implement template-compatible CLI:
- `run` command (exactly one input source)
- `validate` command
- `--config` loading behavior (missing file error when explicitly requested)
- [x] Ensure CLI help contract includes `Usage:` and `--config <path>`.
- [x] Implement `bin/cli.js` as thin entrypoint with shebang and non-zero exit on command errors.
- [x] Decide and document concept-miner-specific commands/flags:
- Keep `run` generic and expose product modes via options, or
- Add explicit subcommands while preserving template discipline.
- [x] Add robust usage output and stable non-zero exit behavior on failures.
- [x] Move PowerShell helper flows into documented optional wrappers around core CLI.
- [x] Implement REST server runtime in-repo as a thin wrapper over product library:
- expose `POST /v1/concepts/extract`
- align deterministic error mapping to OpenAPI response classes (`400`, `422`, `500`)
- [x] Add REST integration tests (real HTTP calls) that verify:
- endpoint availability and response contract shape
- deterministic output for identical request payloads
- parity with core extraction behavior for canonical inputs

## 6. Test Migration And Contract Coverage

- [x] Port and adapt template contract tests to concept-miner domain.
- [x] Keep or intentionally replace template public API entrypoint contract:
- `runFromInput(input, options)`
- `runMain(text, options)`
- [x] Add package/schema contract tests mirroring template checks:
- exported schema file is non-empty and valid JSON
- exported schema has top-level object type and `$schema` marker
- [x] Create deterministic unit tests for extracted core modules.
- [x] Migrate prototype test coverage into `test/unit` and `test/integration`.
- [x] Add tests for stable validation error codes (consumer-branchable errors).
- [x] Add CLI contract tests:
- help output
- input-source exclusivity
- missing config failure
- [x] Add config loader contract tests:
- explicit config loads correctly
- missing default config returns empty config object
- invalid JSON and non-object config fail explicitly
- [x] Add integration tests for:
- `scripts/dev-check.js`
- `scripts/dev-report-metrics.js`
- `scripts/dev-report-maturity.js`
- `scripts/release-smoke-check.js`
- [x] Add required fixture contracts for script tests:
- `test/fixtures/example-input.json`
- `test/fixtures/example-output.json`
- [x] Assert dev script output shape contracts:
- `dev:check` emits JSON with `mode`, `validated_count`, `ok`
- report scripts emit JSON with `generated_at` and non-empty `rows`/`seeds`
- [x] Assert release smoke contract checks:
- API exports are present
- CLI help includes `Usage:`
- `package.json` bin mapping exists
- [x] Keep prototype benchmark/policy tests and wire them into package scripts.
- [x] Ensure all artifact-based tests use stable fixtures and deterministic assertions.
- [x] Port prototype policy-governance tests/checks:
- benchmark expected-set change requires `BENCHMARK_POLICY.md` update
- legacy enrichment change requires `LEGACY_POLICY.md` update
- [x] Port prototype determinism and contract tests:
- schema validation failures and hard-failure cases
- deterministic replay across repeated runs and fresh process
- deterministic YAML key-order checks
- [x] Port prototype mode/metadata/diagnostics tests:
- mode-tagged output artifacts
- mode-tagged metadata sidecars
- diagnostics sidecars with expected top-level shape
- [x] Port prototype benchmark tooling tests:
- independent benchmark scoring scripts and policy-intersection reporting
- threshold sweep reproducibility and report generation
- wikipedia-title-index coverage report generation
- [x] Migrate benchmark fixture assets and keep them version-controlled:
- `independent.expected-concept-candidates.yaml`
- representative seed fixtures under `test/artifacts/*`
- [x] Preserve realistic regression corpus structure under `test/artifacts/*`:
- each seed keeps `seed.txt` as authoritative natural-language input fixture
- each seed keeps `result-reference/*` as frozen prototype reference outputs
- [x] Add golden/frozen reference regression tests for each seed:
- compare product outputs against `result-reference` baselines in agreed compatibility mode(s)
- validate output YAML plus metadata and diagnostics sidecars against frozen references
- [x] Add full frozen artifact diff test for every seed:
- regenerate persisted artifacts for each seed and compare produced `*.yaml` and `*.json` files against `test/artifacts/<seed>/result-reference/*`
- diagnostics compare is normalized for `stats.phase_ms.*` timing variance; all other fields remain exact.
- [x] Define controlled baseline-update workflow for frozen references:
- when behavior intentionally changes, update `result-reference` with explicit rationale and changelog note
- block silent drift of frozen references in CI
- [x] Migrate prototype unit/integration test corpus entrypoint:
- `test/integration/prototype-test-corpus-entrypoint.contract.test.js` now enforces that product runtime does not load `prototype/*` modules.
- [x] Port prototype anti-regression checks:
- generic mode must not activate legacy enrichment behavior by default
- optional legacy/recovery controls remain explicitly gated
- static tripwire for literal-string/domain rule leakage in generic path
- [x] Decide fate of prototype soft performance budget checks and keep/adapt if retained.
- Decision: legacy prototype soft-budget checks are no longer part of product runtime contracts; prototype remains reference/governance only.
- [x] Add tests that assert product-facing naming:
- no `step13`/`13a`/`13b` terms in CLI help, OpenAPI descriptions, schema descriptions, or README
- no `wiki`/`wti` abbreviations in product-facing fields and options

## 7. Documentation And Governance Productization

- [x] Rewrite root `README.md` to match real runnable state and chosen contract.
- [x] Mine and migrate prototype documentation content:
- `prototype/README.md` contract details into product docs
- `prototype/TODO.md` open/closed governance items into product backlog/history notes
- [x] Add concrete quick-start examples for JS API, CLI, and REST.
- [x] Ensure README links to all required docs and that all linked docs exist.
- [x] Create/align docs from template:
- `docs/NPM_RELEASE.md`
- `docs/REPO_WORKFLOWS.md`
- `docs/OPERATIONAL.md`
- `docs/DEV_TOOLING.md`
- `docs/RELEASE_NOTES_TEMPLATE.md`
- `docs/BASELINE_TEST_RUN.md`
- `docs/GUARANTEES.md`
- `docs/STATUSQUO.md`
- `docs/TEMPLATE_SETUP.md`
- [x] Ensure `docs/NPM_RELEASE.md` keeps explicit release staging command:
- `git add CHANGELOG.md package.json package-lock.json src test docs scripts`
- and avoids `git add -A` in release guidance
- [x] Keep `CHANGELOG.md` with `Unreleased` section.
- [x] Document determinism guarantees, failure policy, and non-goals clearly.
- [x] Document upstream dependency boundary for Step 12 (`elementary-assertions`).

## 8. CI/CD And Release Workflow Setup

- [x] Add/adapt `.github/workflows/ci.yml` for Node matrix checks.
- [x] Add/adapt `.github/workflows/release.yml` with manual dispatch gate.
- [x] Ensure CI runs required gates:
- `npm test`
- `npm run pack:check`
- `npm run smoke:release`
- [x] Ensure release workflow validates tag/version match and produces tarball artifact.
- [x] Document npm publish prerequisites (`NPM_TOKEN`, optional publish gate).
- [x] Add `scripts/ensure-clean-worktree.js` and wire `release:check`.

## 9. Repository Layout Cleanup And Migration Operations

- [x] Decide long-term placement of prototype assets:
- migrate into `src/` + `test/fixtures`, or
- keep under `prototype/` as historical reference.
- [x] If migrating, create a traceable mapping table:
- old file -> new file/module.
- Current decision: no migration in this phase, therefore mapping table is not yet applicable.
- [x] Decide how to handle current symlinked `prototype` dependency.
- [x] Ensure no runtime dependency on external symlink paths after productization.
- [x] Ensure no runtime dependency on `prototype/*` modules in product API/CLI execution paths.
- [x] Normalize artifact paths to repository-local, documented locations.
- [x] Keep or document migration of per-seed reference layout:
- `test/artifacts/<seed>/seed.txt`
- `test/artifacts/<seed>/result-reference/*`
- [x] Define policy for generated prototype report artifacts:
- `13b-threshold-sweep.report.json` (generated benchmark sweep report)
- `step12-wikipedia-title-index.coverage.report.json` (generated coverage report)
- decide: checked-in snapshot vs generated-on-demand, then enforce consistently

## 10. Quality Gates And Exit Criteria

- [x] `npm ci` succeeds on clean checkout.
- [x] `npm run lint` passes.
- [x] `npm test` passes.
- [x] `npm run dev:check` passes.
- [x] `npm run dev:report:metrics` emits valid JSON.
- [x] `npm run dev:report:maturity` emits valid JSON.
- [x] `npm run ci:check` passes locally.
- [x] `npm run release:check` passes on clean worktree.
- [x] `npm pack --dry-run` includes expected files only.
- [x] `npm run smoke:release` validates API exports + CLI help + bin mapping.
- [x] OpenAPI, schema, and runtime outputs are contract-consistent.
- [x] Prototype-derived product checks pass (renamed as needed):
- benchmark policy guard
- legacy policy guard
- independent benchmark evaluation for both product modes
- deterministic threshold-sweep report generation
- wikipedia-title-index coverage report generation
- concept-candidates schema + deterministic key-order checker (from `check-concept-candidates.js`) passes
- batch seed runner flow (from `run-seed-concept-candidates.ps1`) passes in documented modes
- Current status: listed checks are covered; batch runner coverage is validated in persisted mode (default documented mode).

## 11. Post-Productization Follow-Up (after baseline is green)

- [x] Cut first productized version and tag strategy (`v0.x` or `v1.0.0` decision).
- [x] Run pre-publish and post-publish smoke flows from release docs.
- Public npm postpublish flow is documented; tarball-based rehearsal remains available via `npm run smoke:release:rehearsal`.
- [x] Publish release notes using `docs/RELEASE_NOTES_TEMPLATE.md`.
- [x] Record operational snapshot in `docs/STATUSQUO.md`.
- [x] Plan backlog for upstream Step 12 improvements that remain out-of-repo.

## 12. Suggested Execution Order

- [x] Phase 1: Scope decisions (Section 0)
- [x] Phase 2: Template scaffold + metadata (Sections 1-2)
- [x] Phase 3: Core refactor + contract consolidation (Sections 3-4)
- [x] Phase 4: CLI/tests/docs completion (Sections 5-7)
- [x] Phase 5: CI/release wiring + cleanup (Sections 8-9)
- [x] Phase 6: Full gate run and release readiness check (Sections 10-11)

## 13. v1.000 Gate Checklist

- [x] Freeze field-level public contract for `default extended mode` enrichment:
- explicitly define stable keys/types under `concepts[*].properties.wikipedia_title_index`
- reflect guarantees in `schema/concepts.schema.json`, `openapi/openapi.yaml`, and docs
- [x] Finalize strict product-only CLI policy:
- remove compatibility commands (`run`, `validate`) from CLI/docs/tests
- enforce strict command surface via contract tests
- [x] Harden REST runtime operational behavior:
- deterministic hard-failure behavior when wikipedia-title-index is unavailable or slow in `default-extended` mode
- explicit response-class contract checks for `400` / `422` / `500`
- [x] Close release/publish posture:
- explicit decision for `"private"` vs publishable package posture
- final clean `npm run release:check` and smoke rehearsal evidence
- [x] Publish 1.x stability policy:
- document what constitutes breaking vs non-breaking change for API/schema/CLI
- ensure roadmap/todo/status docs reflect stable-release state at cut time
