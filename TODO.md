# concept-miner Productization TODO

Goal: productize the current concept-miner prototype (`prototype/`) into a template-aligned Node.js package in this repository, based on `C:\code\.nodejs-project-template`.

Status date: 2026-02-16

## Progress Snapshot

- [x] `v0.001` scaffold baseline integrated and green gates (`28c7c0a`).
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
- [x] `v0.011` product-facing script/readme mode terminology normalized (generic-baseline/default-extended).
- [x] `v0.012` product-facing terminology guardrails added (no `step13`/`13a`/`13b`/`wiki`/`wti` in primary surfaces).
- [x] `v0.013` mode ergonomics aligned: kebab-case and underscore mode values both supported in API/CLI.
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
- [x] `v0.033` prototype test corpus entrypoint migrated into product integration contracts (including anti-regression and soft performance budget checks).
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
- [x] `v0.044` prototype split groundwork started by extracting canonicalization/concept-id utilities into `prototype/core/canonicalization.js` with behavior-preserving wiring.
- [x] `v0.045` prototype split groundwork continued by extracting shared utility helpers into `prototype/core/shared-utils.js` with behavior-preserving wiring.
- [x] `v0.046` prototype split groundwork continued by extracting alias/morphology helpers into `prototype/core/alias-morphology.js` with behavior-preserving wiring.
- [x] `v0.047` prototype split groundwork continued by extracting options/policy helpers into `prototype/core/options-policy.js` with behavior-preserving wiring.
- [x] `v0.048` prototype split groundwork continued by extracting Step12 contract/index helpers into `prototype/core/step12-contract.js` with behavior-preserving wiring.
- [ ] Remaining roadmap cycles continue from current baseline (`main`).

## 0. Scope And Decisions (must be resolved first)

- [x] Confirm final packaging target:
- Selected: Target A, publishable package at repository root (`C:\code\concept-miner`).
- [x] Confirm product contract boundary:
- Selected: Option 1, product output contract is `schema/concepts.schema.json` (`concepts[]`).
- [x] Define compatibility policy between current OpenAPI and prototype output:
- Selected: keep canonical public concepts document and use explicit transform from prototype candidate output.
- [x] Confirm final mode naming and defaults in all public interfaces:
- `generic baseline mode` = extraction without wikipedia/wikipedia-title-index information (optional)
- `default extended mode` = extraction with wikipedia/wikipedia-title-index information (default)
- [x] Enforce terminology policy in code/docs/contracts:
- Use `wikipedia` and `wikipedia-title-index`
- Do not expose `step13`, `13a`, `13b`, `wiki`, or `wti` in product-facing naming
- [x] Confirm Node baseline (template requires Node >=20) and npm baseline.
- Current baseline: Node `>=20` (enforced in `package.json` engines).
- [x] Confirm publish intent and timing:
- Current state: `"private": true` kept through current release-candidate milestones.

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
- `"./schema" -> "./src/schema/output.schema.json"` (or documented equivalent with updated tests)
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

- [ ] Split `prototype/concept-candidates.js` into template-style modules:
- `src/run.js` (public entrypoints)
- `src/core/*` (deterministic extraction core)
- `src/validate/*` (schema + integrity + stable errors)
- `src/tools/*` (CLI/tool wrappers)
- Progress: canonicalization and concept-id utilities extracted from monolith to `prototype/core/canonicalization.js` as the first safe split step.
- Progress: shared utility helpers extracted from monolith to `prototype/core/shared-utils.js` as the second safe split step.
- Progress: alias/morphology helpers extracted from monolith to `prototype/core/alias-morphology.js` as the third safe split step.
- Progress: options/policy helpers extracted from monolith to `prototype/core/options-policy.js` as the fourth safe split step.
- Progress: Step12 contract/index helpers extracted from monolith to `prototype/core/step12-contract.js` as the fifth safe split step.
- [x] Remove business logic from CLI path; keep CLI as thin wrapper only.
- [x] Convert current ad-hoc helpers into coherent modules:
- argument parsing, IO, deterministic sorting, canonicalization, ID generation, policy parsing.
- [x] Preserve deterministic behavior and ordering guarantees during refactor.
- [x] Keep backward-compatible aliases/flags where already documented (for controlled transition).
- [ ] Replace internal mode names in API/CLI/config/meta from step labels to product mode labels.
- [ ] Migrate prototype support modules and governance artifacts into product structure:
- `legacy-enrichment.js`
- `BENCHMARK_POLICY.md`
- `LEGACY_POLICY.md`
- `check-benchmark-policy.js`
- `check-concept-candidates.js`
- `check-concept-candidates.ps1`
- `check-legacy-policy.js`
- `concept-candidates.independent-benchmark.js`
- `concept-candidates.13b-threshold-sweep.js`
- `run-seed-concept-candidates.ps1`
- `step12-wikipedia-title-index-coverage.js`
- [x] Preserve current runtime input paths and modes during transition:
- persisted artifact input path
- runtime seed-text input path with `elementary-assertions` integration
- [ ] Replace prototype names in code and CLI while preserving behavior:
- product mode names instead of `13a`/`13b`
- `wikipedia`/`wikipedia-title-index` terms instead of `wiki`/`wti`

## 4. Public Contract Consolidation (OpenAPI + JSON Schema + Runtime)

- [x] Select one canonical persisted document format and make all interfaces consistent.
- [x] Align `openapi/openapi.yaml` with chosen schema contract and actual runtime output.
- [x] Keep and maintain `openapi/README.md` and `schema/README.md` in sync with implemented behavior.
- [x] Preserve and validate current REST endpoint contracts unless intentionally changed:
- `POST /v1/concepts/extract`
- `POST /v1/concepts/validate`
- [x] Remove or explicitly document envelope/document differences.
- [x] Enforce missing invariants in schema validation (for example):
- occurrence bounds (`end >= start`)
- uniqueness constraints where required by contract
- identifier/version format constraints if part of public contract
- [x] Add schema export file under `src/schema/` and wire it to package export.
- [x] Ensure `validate` command validates against the canonical public schema.
- Current behavior: canonical concepts schema is validated first; legacy template output validation remains as compatibility fallback.
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
- `prototype/concept-candidates.test.js` is executed via product integration contract test with productized artifact staging.
- [x] Port prototype anti-regression checks:
- generic mode must not activate legacy enrichment behavior by default
- optional legacy/recovery controls remain explicitly gated
- static tripwire for literal-string/domain rule leakage in generic path
- [x] Decide fate of prototype soft performance budget checks and keep/adapt if retained.
- Decision: retained via the migrated prototype corpus entrypoint contract (`testSaasPerformanceSoftBudget`).
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
- Current phase uses tarball-based postpublish simulation (`npm run smoke:release:rehearsal`) while package publication remains private.
- [x] Publish release notes using `docs/RELEASE_NOTES_TEMPLATE.md`.
- [x] Record operational snapshot in `docs/STATUSQUO.md`.
- [x] Plan backlog for upstream Step 12 improvements that remain out-of-repo.

## 12. Suggested Execution Order

- [x] Phase 1: Scope decisions (Section 0)
- [x] Phase 2: Template scaffold + metadata (Sections 1-2)
- [ ] Phase 3: Core refactor + contract consolidation (Sections 3-4)
- [ ] Phase 4: CLI/tests/docs completion (Sections 5-7)
- [ ] Phase 5: CI/release wiring + cleanup (Sections 8-9)
- [ ] Phase 6: Full gate run and release readiness check (Sections 10-11)
