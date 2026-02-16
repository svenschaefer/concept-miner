# Changelog

All notable changes to this project are documented in this file.

## [Unreleased]

- v0.001 scaffold baseline integrated with template structure, scripts, and quality gates.
- v0.003 transition product API added: `extractConcepts` and `validateConcepts`.
- v0.004 product CLI commands added: `extract` and `validate-concepts` (compatibility commands retained).
- v0.004 contract guard tests added for OpenAPI/schema endpoint and field alignment.
- v0.005 realistic artifact corpus layout contract test added.
- v0.006 prototype benchmark/legacy policy checks enforced in `ci:check`.
- v0.007 frozen persisted-mode reference regression test added across realistic seeds.
- v0.008 README updated with current runnable API/CLI usage.
- v0.009 local `release:check` gate validated as green.
- v0.010-a frozen reference policy guard added (`check:frozen-references-policy`) with CI enforcement.
- v0.010-b OpenAPI alignment tightened:
  - `ExtractConceptsResponse` now requires `schema_version` + `concepts`
  - `input_id` minLength constraints aligned with JSON schema
- v0.015 compatibility `validate` command now prioritizes canonical concepts-schema validation, with legacy template-output fallback retained during transition.
- v0.016 sidecar contracts added:
  - `schema/concept-candidates-meta.schema.json`
  - `schema/concept-candidates-diagnostics.schema.json`
  - integration checks validate frozen sidecars for all seeds/modes.
- v0.017 prototype tooling execution contracts added:
  - independent benchmark checks for `13a` and `13b` execution paths
  - threshold sweep report generation contract
  - wikipedia-title-index coverage report generation contract.
- v0.018 README now includes concrete REST quick-start examples for:
  - `POST /v1/concepts/extract`
  - `POST /v1/concepts/validate`
  plus docs contract coverage to prevent regression.
- v0.019 documented Step12 upstream boundary in `docs/GUARANTEES.md`:
  - `elementary-assertions` ownership is explicit
  - in-scope vs out-of-scope behavior is now contract-tested in docs checks.
- v0.020 pre-1.0 tag strategy closed:
  - `docs/REPO_WORKFLOWS.md` documents `v0.x.y` annotated tag policy
  - clean `npm run release:check` verified before first annotated tag creation.
- v0.021 `TODO.md` truth-sync:
  - completed template/package/CLI/test/docs/CI checklist items marked done
  - remaining unchecked items narrowed to genuinely open engineering scope.
- v0.022 release workflow contract checks added:
  - validates tag/version consistency in `.github/workflows/release.yml`
  - validates npm tarball creation and artifact upload steps are present.
- v0.023 publish prerequisite and install-gate closure:
  - docs consistency checks enforce npm prerequisite guidance (`npm whoami`, `NPM_TOKEN`)
  - `npm ci` executed successfully and local quality gates re-verified.
- v0.024 post-productization documentation closure:
  - release notes published at `docs/releases/v0.10.0.md`
  - operational snapshot refreshed in `docs/STATUSQUO.md`
  - upstream backlog documented at `docs/STEP12_UPSTREAM_BACKLOG.md`.
- v0.025 operational/tooling closure:
  - optional PowerShell wrapper flows documented in `docs/OPERATIONAL.md`
  - integration contract added for `prototype/check-concept-candidates.js` execution.
- v0.026 generated report artifact governance:
  - checked-in snapshot policy documented in `docs/GENERATED_REPORT_ARTIFACTS_POLICY.md`
  - CI policy check added via `scripts/check-generated-report-artifacts-policy.js`.
- v0.027 prototype documentation migration:
  - contract/governance summary migrated into `docs/PROTOTYPE_MIGRATION_NOTES.md`
  - prototype TODO open/closed history mapped into product backlog context.
- v0.028 batch runner contract coverage:
  - added staged integration execution check for `prototype/run-seed-concept-candidates.ps1` in persisted mode.
