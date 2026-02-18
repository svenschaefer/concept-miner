# AGENTS.md

Repository constraints for this template:

- Language: JavaScript only.
- Module system: CommonJS only.
- Prefer library-first architecture; CLI is a thin wrapper.
- Keep output deterministic (stable sorting and serialization).
- Add tests for each functional change.

Public API contract (starter):

1) `runFromInput(input, options)`
- Accepts structured input object.
- Must be deterministic for identical input and options.

2) `runMain(text, options)`
- Accepts raw text and returns transformed output.

Tooling layer:
- Validation and CLI must not mutate core output.
- Release script safety:
  - `pack:artifact`, `smoke:release`, and `release:check` require `RELEASE_TARGET_VERSION`.
  - Release target must match `package.json` version and have a matching `CHANGELOG.md` heading.
