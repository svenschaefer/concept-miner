# Operational Guide

## Commands

- `extract`: Run concept extraction.
- `validate-concepts`: Validate concepts output contract.

## CLI Examples

```bash
npx concept-miner extract --text "alpha beta alpha" --mode default-extended --out output.json
npx concept-miner validate-concepts --in output.json
```

## Runtime Boundary

- Product runtime is self-contained under `src/`, `bin/`, `schema/`, and `scripts/`.
- `prototype/` is reference-only and not part of runtime execution paths.

## REST Runtime Notes

- API server entrypoint: `bin/api-server.js` (default `127.0.0.1:32180`).
- Request body limit: `1 MiB` for `POST /v1/concepts/extract`.
- Runtime error behavior:
  - malformed/invalid request: `400`
  - unprocessable extractor input/runtime dependency failure: `422`
  - unknown route: `404`
  - unexpected internal extractor failure: `500`
- Default-extended enrichment behavior:
  - extraction uses Step12 + Step13 pipeline behavior and may include deterministic enrichment fields where contract-defined
  - if unavailable/timeout, extraction fails (no silent enrichment fallback).

## Quality Gates

- `npm test`
- `npm run pack:check`
- `npm run smoke:release:ci`
- `npm run ci:check`

## Step13 Tooling

- Detailed runtime benchmark diagnostics:
  - `node scripts/concept-candidates.independent-benchmark.js --artifacts-root ./test/artifacts --benchmark ./test/benchmark/independent.expected-concept-candidates.yaml`
- Standalone concept-candidates determinism/schema check:
  - `node scripts/check-concept-candidates-determinism.js --in ./test/artifacts/webshop/result-reference/seed.concept-candidates.13b.yaml`
- PowerShell batch runner for seed concept-candidates regeneration:
  - `pwsh ./scripts/run-seed-concept-candidates.ps1 -Mode persisted`
