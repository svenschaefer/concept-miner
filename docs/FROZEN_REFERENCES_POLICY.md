# Frozen References Policy

`test/artifacts/*/result-reference/*` are frozen regression baselines from the prototype.

Policy:

- Changes to frozen reference artifacts require an explicit rationale entry in `CHANGELOG.md`.
- Silent drift is blocked by `scripts/check-frozen-references-policy.js`.
- Reference updates must correspond to intentional behavior changes, not incidental output noise.
