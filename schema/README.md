# Schema

This directory contains JSON Schemas for public, product-facing documents.

- `concepts.schema.json` defines the public "Concepts Document" format intended for storage,
  interchange, and validation (independent of REST transport).

Notes:
- Offsets in `occurrences[*].start/end` are UTF-16 code units (JavaScript string indexing).
- `schema_version` is a public schema version and is independent of the service build.
