# OpenAPI

This directory contains the product-oriented OpenAPI contract for the concept-miner REST API.

- File: `openapi.yaml`
- API base: `/v1`
- Primary endpoint: `POST /v1/concepts/extract`

Versioning:
- `info.version` follows the public API version.
- Backward-compatible additions are allowed within a major version.
- Breaking changes require a major version bump.
