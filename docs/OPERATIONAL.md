# Operational Guide

## Commands

- `run`: Execute the main pipeline.
- `validate`: Validate output contract.

## CLI Examples

```bash
npx concept-miner run --in input.json --out output.json --config project.config.json
npx concept-miner validate --in output.json
```

## Optional PowerShell Wrappers

Optional helper wrappers are provided for prototype-oriented execution flows. They are wrappers around repository-local Node entrypoints and are not required for product API/CLI usage.

- `prototype/run-seed-concept-candidates.ps1`
  - generates concept-candidates artifacts for one or all seeds
- `prototype/check-concept-candidates.ps1`
  - executes concept-candidates schema/determinism checks

Core product usage remains:
- library API via `src/index.js`
- CLI via `bin/cli.js`

## REST Runtime Notes

- API server entrypoint: `bin/api-server.js` (default `127.0.0.1:32180`).
- Request body limit: `1 MiB` for `POST /v1/concepts/extract`.
- Runtime error behavior:
  - malformed/invalid request: `400`
  - unknown route: `404`
  - unexpected internal extractor failure: `500`
- Default-extended enrichment behavior:
  - if wikipedia-title-index is reachable, enrichment may be added under
    `concepts[*].properties.wikipedia_title_index`
  - if unavailable/timeout, extraction remains successful without enrichment fields.

## Quality Gates

- `npm test`
- `npm run pack:check`
- `npm run smoke:release`
- `npm run ci:check`
