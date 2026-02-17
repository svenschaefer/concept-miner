# Repo Workflows

## Standard Flow

1. Implement feature.
2. Add/adjust tests.
3. Run `npm test`.
4. Update docs if behavior changed.
5. Commit with a clear message.

## Release Flow

1. Start from a clean worktree and run: `npm run release:check`.
2. Update `CHANGELOG.md`.
3. Bump version (no tag yet): `npm version <x.y.z> --no-git-tag-version`.
4. Re-run gates: `npm run ci:check`.
5. Commit release files on a release branch.
6. Merge to `main`.
7. Create annotated tag on `main`: `git tag -a v<x.y.z> -m "v<x.y.z>"`.
8. Push commit and tag.
9. Publish to npm: `npm publish --access public` (only when package posture is publishable, `"private": false`).
10. Verify npm propagation and run post-publish smoke checks (or tarball rehearsal when package remains private).

Rules:
- Pre-1.0 strategy:
  - use `v0.x.y` annotated tags for stable productization milestones.
  - keep `package.json` version and git tag version aligned.
- Never rewrite history after tagging.
- Never amend a tagged release commit.
- If a release is wrong, ship a new patch release.
