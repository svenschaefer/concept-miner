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
npm run eval:concept-candidates:independent:13a
npm run eval:concept-candidates:independent:13b
npm run eval:concept-candidates:independent:13b:policy
npm run eval:concept-candidates:13b:sweep
npm run report:step12:wikipedia-title-index-coverage
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
- `docs/BASELINE_TEST_RUN.md`
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
