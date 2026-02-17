# Schema

This directory contains JSON Schemas for public, product-facing documents.

- `concepts.schema.json` defines the public "Concepts Document" format intended for storage,
  interchange, and validation (independent of REST transport).
- `concept-candidates-meta.schema.json` defines the persisted metadata sidecar contract used by
  frozen prototype-reference artifacts.
- `concept-candidates-diagnostics.schema.json` defines the persisted diagnostics sidecar contract
  used by frozen prototype-reference artifacts.

Notes:
- Offsets in `occurrences[*].start/end` are UTF-16 code units (JavaScript string indexing).
- `schema_version` is a public schema version and is independent of the service build.

Contract mapping:
- Canonical persisted document contract is `concepts.schema.json`.
- REST contract in `openapi/openapi.yaml` maps:
  - `ExtractConceptsResponse` to canonical concepts-document fields.
- See `docs/CONTRACT_ALIGNMENT.md` for explicit envelope/compatibility notes.
