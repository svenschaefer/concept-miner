# concept-miner

Deterministic concept extraction from natural language.

## Purpose

`concept-miner` is being productized as a CommonJS Node.js package for deterministic, contract-driven concept extraction.

Given text input, it extracts explicit concepts in canonical, deduplicated, traceable form.

## Current State

This repository currently contains:

- product-facing contracts:
  - `openapi/openapi.yaml`
  - `schema/concepts.schema.json`
- prototype implementation and governance assets:
  - `prototype/`
- realistic frozen regression corpus:
  - `test/artifacts/<seed>/seed.txt`
  - `test/artifacts/<seed>/result-reference/*`

The full productization backlog is tracked in `TODO.md`, and staged milestones are in `ROADMAP.md`.

Runtime boundary:

- product runtime does not load `prototype/*` modules.
- `prototype/` is maintained as reference/governance material only.

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

Prototype-oriented checks and reports:

```bash
npm run check:concept-candidates:benchmark-policy
npm run check:concept-candidates:legacy-policy
npm run eval:concept-candidates:independent:generic-baseline
npm run eval:concept-candidates:independent:default-extended
npm run eval:concept-candidates:independent:default-extended:policy
npm run eval:concept-candidates:default-extended:threshold-sweep
npm run report:wikipedia-title-index:coverage
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

Compatibility commands still available:

```bash
concept-miner run --text "alpha beta alpha"
concept-miner validate --in output.json
```

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
- `docs/BASELINE_TEST_RUN.md`
- `docs/FROZEN_REFERENCES_POLICY.md`
- `docs/GENERATED_REPORT_ARTIFACTS_POLICY.md`
- `docs/CONTRACT_ALIGNMENT.md`
- `docs/GUARANTEES.md`
- `docs/PROTOTYPE_MIGRATION_NOTES.md`
- `docs/REPO_LAYOUT_DECISION.md`
- `docs/STEP12_UPSTREAM_BACKLOG.md`
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
