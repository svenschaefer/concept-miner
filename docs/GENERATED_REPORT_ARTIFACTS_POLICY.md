# Generated Report Artifacts Policy

This repository keeps the following generated product report artifacts as version-controlled snapshots:

- `scripts/13b-threshold-sweep.report.json`
- `scripts/step12-wikipedia-title-index.coverage.report.json`

## Policy

- Strategy: checked-in snapshot (not generate-on-demand only).
- Any change to either report artifact requires:
  - `CHANGELOG.md` update with rationale
  - this policy file update when governance rules change

## CI Enforcement

- `scripts/check-generated-report-artifacts-policy.js` enforces that report-artifact changes are not silent.
