# OpenAPI

This directory contains the product-oriented OpenAPI contract for the concept-miner REST API.

- File: `openapi.yaml`
- API base: `/v1`
- Primary endpoints:
  - `POST /v1/concepts/extract`

Canonical contract mapping:
- Persisted/public document contract: `schema/concepts.schema.json`
- REST response/request schema references:
  - `ExtractConceptsResponse` aligns with canonical `ConceptsDocument` core fields

Envelope note:
- concept-miner does not define an additional transport envelope (`data`, `payload`, etc.).
- The canonical concepts document is the payload for persistence and validation.
- See `docs/CONTRACT_ALIGNMENT.md` for alignment and compatibility notes.

Versioning:
- `info.version` follows the public API version.
- Backward-compatible additions are allowed within a major version.
- Breaking changes require a major version bump.
