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
- Mode policy:
  - `default-extended` is the only product runtime mode.
  - wikipedia-title-index availability is required.

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

## 1.x Stability Policy

Breaking changes (require major version bump):

- Remove or rename documented REST endpoints/fields.
- Tighten required-field constraints in `schema/concepts.schema.json` so previously valid documents fail.
- Change `default-extended` extraction semantics in a way that breaks benchmark or contract compatibility.

Non-breaking changes (allowed in 1.x):

- Add optional fields to responses/contracts while preserving existing semantics.
- Add new CLI options without changing existing option behavior.
- Improve internal implementation/performance while preserving deterministic output contract.
- Tighten behavior from silent fallback to explicit unprocessable failure for missing runtime dependencies.
