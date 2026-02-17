# Guarantees

This file defines core behavior guarantees for template-based projects.

## Core Guarantees

- Deterministic behavior:
  - identical input + options should produce identical output within the same version.
- Fail-fast validation:
  - malformed input is rejected explicitly.
- Clear authority boundary:
  - source input and persisted outputs are authoritative.
  - view/tooling outputs are derived and non-authoritative.
- Stable error surface:
  - validation failures use stable error codes for consumer branching.
- Default-extended enrichment typing:
  - when present, `concepts[*].properties.wikipedia_title_index` has:
    - `exact_match` (`boolean`)
    - `prefix_count` (`integer`, `>= 0`)
- Compatibility command policy (1.x):
  - `concept-miner run` and `concept-miner validate` remain supported compatibility surfaces in 1.x.

## Non-Goals

Template-based projects should not implicitly provide:
- hidden retries
- silent auto-repair of invalid input
- implicit mutation of persisted state from read-only commands
- undocumented public API surfaces

## Design Rule

Prefer small, explicit mechanics over broad abstractions.
If behavior is important, make it contract-tested.

## Step12 Boundary (`elementary-assertions`)

- `concept-miner` consumes Step12 assertion artifacts as an upstream contract boundary.
- Step12 generation logic is provided by upstream `elementary-assertions` and is out of scope for this repository.
- In-scope for this repository:
  - deterministic handling of valid Step12 artifacts
  - explicit validation and failure behavior when Step12 artifacts are malformed or missing required fields
  - regression checks against frozen reference artifacts
- Out-of-scope for this repository:
  - changing Step12 assertion extraction semantics in `elementary-assertions`
  - silently mutating or repairing upstream Step12 content
