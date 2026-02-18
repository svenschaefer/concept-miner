# Baseline Test Run

Purpose: define a stable end-to-end verification baseline even when parts of a system may be non-deterministic (for example, external services or LLM-driven steps).

## Verify Stable Invariants

- CLI/API wiring works end-to-end.
- State-changing commands actually persist expected changes.
- Rejected/no-op paths do not mutate persisted state.
- Required output envelope fields are present.
- Exit codes follow contract (`0` success, non-zero failure).

## Do Not Over-Constrain Non-Deterministic Surfaces

Avoid hard-locking:
- exact wording of generated text
- full byte-identical outputs from non-deterministic components
- incidental ordering not declared as part of contract

## Recommended Baseline Strategy

1. Define input fixture(s).
2. Run command sequence.
3. Assert invariant checkpoints only.
4. Capture result summary (counts/flags/hashes) instead of fragile full output strings.
5. Keep one deterministic smoke path in CI (`npm run smoke:release:ci`).

## Suggested Run Checklist

- `npm test`
- `npm run pack:check`
- `npm run smoke:release:ci`

Optional:
- multi-cycle run for workflows that involve non-deterministic retries, with bounded attempts.
