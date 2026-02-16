# concept-miner

Deterministic concept extraction from natural language.

## Current Repository State

This repository is currently in a **productization transition** state.

Available today:

- product-facing contract assets:
  - `openapi/openapi.yaml`
  - `schema/concepts.schema.json`
- realistic regression corpus:
  - `test/artifacts/*/seed.txt`
  - `test/artifacts/*/result-reference/*`
- prototype implementation source under:
  - `prototype/`

Not yet available at repository root:

- `package.json`
- finalized library API package wiring
- finalized CLI wiring
- finalized service/runtime wiring
- release workflow/docs scaffolding

## Productization Goal

`concept-miner` is being productized as a standalone concept extraction product with:

- deterministic output
- schema-validated contracts
- library-first architecture with CLI and REST access layers

Target mode model:

- `generic baseline mode` (optional): extraction without wikipedia/wikipedia-title-index information
- `default extended mode` (default): extraction with wikipedia/wikipedia-title-index information

## Contracts

Current public contract artifacts:

- REST/OpenAPI contract: `openapi/openapi.yaml`
- Concepts document schema: `schema/concepts.schema.json`

These are the integration boundary while productization is in progress.

## Regression Corpus

The repository includes frozen reference data for realistic seeds:

- input seeds: `test/artifacts/<seed>/seed.txt`
- frozen prototype outputs: `test/artifacts/<seed>/result-reference/*`

These references are used to preserve deterministic behavior and detect regressions during migration.

## Plan

The full migration and hardening backlog is tracked in:

- `TODO.md`

## License

License file is not yet present at repository root in this transition state.
