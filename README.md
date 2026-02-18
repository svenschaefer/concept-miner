# concept-miner

Deterministic concept extraction from natural language.

## Purpose

`concept-miner` is productized as a CommonJS Node.js package for deterministic, contract-driven concept extraction.

Given text input, it extracts explicit concepts in canonical, deduplicated, traceable form.

## Current State

This repository currently contains:

- product-facing contracts:
  - `openapi/openapi.yaml`
  - `schema/concepts.schema.json`

The full productization backlog is tracked in `TODO.md`, and staged milestones are in `ROADMAP.md`.

Runtime boundary:

- package payload is product runtime only.

## Target Mode Model

- `generic baseline mode` (optional): extraction without wikipedia/wikipedia-title-index information.
- `default extended mode` (default): extraction with wikipedia/wikipedia-title-index information.

## Development

```bash
npm ci
npm run lint
npm test
npm run dev:check
npm run dev:report:metrics
npm run dev:report:maturity
npm run ci:check
npm run release:check
```

## JavaScript API (Current)

```js
const { extractConcepts, validateConcepts } = require("concept-miner");

const doc = await extractConcepts("alpha beta alpha", {
  mode: "default-extended", // or "generic-baseline"
});

const validation = validateConcepts(doc);
```

## CLI (Current)

```bash
concept-miner extract --text "alpha beta alpha" --mode default-extended --out concepts.json
concept-miner validate-concepts --in concepts.json
```

Optional runtime enrichment flags for `extract`:

```bash
concept-miner extract --text "alpha beta alpha" \
  --mode default-extended \
  --wikipedia-title-index-endpoint "http://127.0.0.1:32123" \
  --wikipedia-title-index-timeout-ms 1500
```

In `default-extended` mode, wikipedia-title-index is required. If unavailable or timed out, extraction hard-fails.

## REST API

The REST contract is specified in `openapi/openapi.yaml`, and an in-repo runtime server is available:

```bash
npm run serve:api
```

Default server bind:
- `http://127.0.0.1:32180`

`POST /v1/concepts/extract`:

```bash
curl -sS -X POST "http://127.0.0.1:32180/v1/concepts/extract?view=compact" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "A webshop accepts orders."
  }'
```

Default-extended runtime enrichment options:

```json
{
  "text": "The quick brown fox jumps over the lazy dog.",
  "options": {
    "mode": "default-extended",
    "wikipedia_title_index_endpoint": "http://127.0.0.1:32123",
    "wikipedia_title_index_timeout_ms": 1500
  }
}
```

## Release

This repository follows a dual-stream release model:

- Git stream:
  - versioned commits
  - annotated tags
  - optional GitHub Releases
- npm stream:
  - `npm publish`
  - registry propagation checks
  - post-publish smoke tests

Relevant documentation:

- `docs/NPM_RELEASE.md`
- `docs/REPO_WORKFLOWS.md`
- `docs/OPERATIONAL.md`
- `docs/DEV_TOOLING.md`
- `docs/RELEASE_NOTES_TEMPLATE.md`
- `docs/releases/v0.10.0.md`
- `docs/releases/v1.0.0.md`
- `docs/releases/v1.0.1.md`
- `docs/releases/v1.0.2.md`
- `docs/releases/v1.0.3.md`
- `docs/releases/v1.0.4.md`
- `docs/BASELINE_TEST_RUN.md`
- `docs/FROZEN_REFERENCES_POLICY.md`
- `docs/GENERATED_REPORT_ARTIFACTS_POLICY.md`
- `docs/CONTRACT_ALIGNMENT.md`
- `docs/GUARANTEES.md`
- `docs/STATUSQUO.md`
- `docs/TEMPLATE_SETUP.md`
- `CONTRIBUTING.md`
- `SECURITY.md`
- `CHANGELOG.md`
- `project.config.json`

Release automation:

- `.github/workflows/release.yml` provides a manual `workflow_dispatch` release check.

## License

See `LICENSE`.
