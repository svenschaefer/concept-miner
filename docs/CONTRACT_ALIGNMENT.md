# Contract Alignment

This document defines the canonical contract alignment between runtime output, JSON Schema, and OpenAPI.

## Canonical Persisted Document

- Canonical persisted/public document: `schema/concepts.schema.json`
- Required top-level fields:
  - `schema_version`
  - `concepts`
- Optional top-level fields include:
  - `input_id` (non-empty when present)
  - `meta`

## REST Mapping

- `POST /v1/concepts/extract`
  - response shape `ExtractConceptsResponse` aligns to canonical concepts-document core fields.
  - `default extended mode` enrichment contract:
    - optional `concepts[*].properties.wikipedia_title_index.exact_match` (`boolean`)
    - optional `concepts[*].properties.wikipedia_title_index.prefix_count` (`integer`, `>= 0`)

Default-extended enrichment availability:
- If wikipedia-title-index service is configured and reachable, enrichment may be included.
- If service is unavailable or times out in default-extended mode, extraction fails with an unprocessable-input error.

## Envelope Rule

- No additional transport envelope is defined (`data`, `payload`, wrapper objects).
- The canonical concepts document itself is the payload for persistence and validation.

## Prototype Compatibility Note

- Prototype `concept_candidates` artifacts remain governance/testing references.
- Product-facing contracts are the concepts document contracts above.
