# Frozen References Policy

`test/artifacts/*/result-reference/*` are frozen regression baselines derived from the historical prototype and now owned by the product repository.

Policy:

- Changes to frozen reference artifacts require an explicit rationale entry in `CHANGELOG.md`.
- Silent drift is blocked by `scripts/check-frozen-references-policy.js`.
- Reference updates must correspond to intentional behavior changes, not incidental output noise.
- Golden regeneration tests compare YAML/JSON outputs against frozen references.
- Diagnostics timing fields (`stats.phase_ms.*`) are treated as runtime-variant and normalized during comparison.
