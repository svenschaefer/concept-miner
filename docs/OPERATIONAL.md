# Operational Guide

## Commands

- `run`: Execute the main pipeline.
- `validate`: Validate output contract.

## CLI Examples

```bash
npx concept-miner run --in input.json --out output.json --config project.config.json
npx concept-miner validate --in output.json
```

## Quality Gates

- `npm test`
- `npm run pack:check`
- `npm run smoke:release`
- `npm run ci:check`
