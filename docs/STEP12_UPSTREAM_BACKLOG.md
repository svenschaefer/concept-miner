# Step12 Upstream Backlog

This backlog tracks Step12 improvements owned by upstream `elementary-assertions` and therefore out of scope for direct implementation in this repository.

## Backlog Items

1. Assertion signal completeness audit:
- Validate coverage of `wikipedia_title_index` signal fields across assertion categories.

2. Deterministic evidence normalization:
- Ensure stable ordering and canonical key layout in Step12 mention evidence payloads.

3. Error taxonomy alignment:
- Introduce stable upstream error codes for malformed assertion structures consumed by concept-miner.

4. Large-input performance envelope:
- Benchmark Step12 generation latency/throughput for long enterprise seed texts.

5. Extended language hint behavior:
- Clarify and test language-hint handling contract for non-English assertions.

## Integration Note

- Concept-miner will consume these upstream improvements through explicit dependency/version updates and frozen-corpus revalidation.
