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
- `POST /v1/concepts/validate`
  - request body is `ConceptsDocument`.

## Envelope Rule

- No additional transport envelope is defined (`data`, `payload`, wrapper objects).
- The canonical concepts document itself is the payload for persistence and validation.

## Prototype Compatibility Note

- Prototype `concept_candidates` artifacts remain governance/testing references.
- Product-facing contracts are the concepts document contracts above.
