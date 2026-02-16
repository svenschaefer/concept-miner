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
