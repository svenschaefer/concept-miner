# npm Release Process

Generic release process for template-based Node.js packages.

## Two Release Streams

1. Git stream
- Release commit on `main`
- Annotated tag `vX.Y.Z`
- Optional GitHub Release for the tag

2. npm stream
- Publish package to npmjs
- Verify registry propagation
- Verify installed package behavior in a clean workspace

Both streams should point to the same version and release commit.

Package payload rule:
- Only product-owned runtime/tooling/docs files are included in npm tarballs.
- Enforcement in this repository uses package `files` allowlist plus `.npmignore`.

## 1) Prepare

1. Create a release branch:
```powershell
git checkout -b release/<x.y.z>-<scope>
```
2. Set explicit release target version (required by release scripts):
```powershell
$env:RELEASE_TARGET_VERSION = "<x.y.z>"
```
3. Run release checks on a clean worktree:
```powershell
npm run release:check
```
4. Update code, tests, and `CHANGELOG.md`.
5. Bump version without creating a tag:
```powershell
npm version <x.y.z> --no-git-tag-version
```

## 2) Validate Before Commit

```powershell
npm run ci:check
```

## 3) Pre-Publish Local Tarball Smoke

Important:
- `npm run pack:check` is validation only (`npm pack --dry-run`) and does not create `*.tgz`.
- Use `npm run pack:artifact` (or `npm pack`) when a real tarball file is required.
- `npm run pack:artifact`, `npm run smoke:release`, and `npm run release:check` require
  `RELEASE_TARGET_VERSION` and verify:
  - `RELEASE_TARGET_VERSION === package.json version`
  - `CHANGELOG.md` contains heading `## [<x.y.z>]`

```powershell
npm run pack:artifact
```

Create a clean smoke workspace and install the tarball:
```powershell
New-Item -ItemType Directory -Path <workspace-root>\concept-miner-smoke\prepublish-<x.y.z> -Force
cd <workspace-root>\concept-miner-smoke\prepublish-<x.y.z>
npm init -y
npm install <absolute-path-to-template-root>\concept-miner-<x.y.z>.tgz
```

Run basic smoke checks:
```powershell
node -e "console.log(require('concept-miner/package.json').version)"
npx concept-miner --help
```

Shortcut rehearsal command (automates the prepublish and postpublish-style clean-workspace flow):

```powershell
npm run smoke:release:rehearsal
```

## 4) Commit, Merge, Tag, Push

Commit release files:
```powershell
git add CHANGELOG.md package.json package-lock.json src test docs scripts
git commit -m "release: v<x.y.z>"
```

Merge release branch to `main`, then tag on `main`:
```powershell
git checkout main
git merge --ff-only release/<x.y.z>-<scope>
git push origin main
git tag -a v<x.y.z> -m "v<x.y.z>"
git push origin v<x.y.z>
```

## 5) Publish to npmjs

Precondition:
- `package.json` is publishable (`"private": false`).

```powershell
npm whoami
npm publish --access public
```

If `npm whoami` fails, run `npm login` first.

## 6) Verify npm Propagation

```powershell
npm view concept-miner versions --json --registry=https://registry.npmjs.org/
npm view concept-miner@<x.y.z> version --registry=https://registry.npmjs.org/
npm info concept-miner dist-tags --registry=https://registry.npmjs.org/
```

## 7) Post-Publish Public Smoke

Install from npm (not tarball) in a second clean workspace:
```powershell
New-Item -ItemType Directory -Path <workspace-root>\concept-miner-smoke\postpublish-<x.y.z> -Force
cd <workspace-root>\concept-miner-smoke\postpublish-<x.y.z>
npm init -y
npm install concept-miner@<x.y.z>
node -e "console.log(require('concept-miner/package.json').version)"
npx concept-miner --help
```

Optional rehearsal-only mode (without registry publish):

```powershell
$env:CONCEPT_MINER_PUBLIC_POSTPUBLISH_SMOKE = "1"
npm run smoke:release:rehearsal
```

## 8) Optional GitHub Release

```powershell
gh release create v<x.y.z> --title "v<x.y.z>" --notes-file <notes-file>
```

## 9) Optional GitHub Release Workflow (`workflow_dispatch`)

This template includes `.github/workflows/release.yml` with manual inputs:
- `tag` (required, e.g. `v1.2.3`)
- `publish_to_npm` (default: `false`)
- `npm_dist_tag` (default: `latest`)

Behavior:
- Always runs release checks (`npm run ci:check`, version/tag match, tarball artifact upload).
- Publishes to npm only when `publish_to_npm=true` and `NPM_TOKEN` is configured.
- Manual publish remains the default mode.

## 10) Supply-Chain Hygiene

- Keep `package-lock.json` committed.
- Keep `SECURITY.md` present and current.
- Use npm account protection (2FA recommended).
- Enable npm provenance/OIDC when you automate publishing.

## Final Checklist

- `main` contains the release commit.
- `v<x.y.z>` tag exists and points to the release commit.
- npm package is live with expected `latest` (only for publishable/public release flow).
- post-publish smoke check passed (public registry or private tarball rehearsal, depending on posture).
- repo is clean (`git status`).

## Strict Release Script Notes

- CI path uses `npm run smoke:release:ci` (no release-target env required).
- Human release path uses:
  - `npm run pack:artifact`
  - `npm run smoke:release`
  - `npm run release:check`
  and requires `RELEASE_TARGET_VERSION`.

## Current Posture (v1.1.0)

- Repository/package posture is publishable (`"private": false`).
- Public npm release can be executed using this guide (`npm whoami`, `npm publish`, propagation checks, post-publish smoke).
- Current published package state: `concept-miner@1.1.0` with `latest` dist-tag.
- Deprecated npm versions: `1.0.1`, `1.0.2`, `1.0.3`, `1.0.4` (migration message points to `1.1.0+`).
