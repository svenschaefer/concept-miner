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

## 1) Prepare

1. Create a release branch:
```powershell
git checkout -b release/<x.y.z>-<scope>
```
2. Run release checks on a clean worktree:
```powershell
npm run release:check
```
3. Update code, tests, and `CHANGELOG.md`.
4. Bump version without creating a tag:
```powershell
npm version <x.y.z> --no-git-tag-version
```

## 2) Validate Before Commit

```powershell
npm run ci:check
```

## 3) Pre-Publish Local Tarball Smoke

```powershell
npm pack
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

For the current private-package phase, run the same postpublish checks in a second clean workspace using the local tarball rehearsal (`npm run smoke:release:rehearsal`).
When public npm validation is required, set:

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
- npm package is live with expected `latest`.
- post-publish smoke check passed.
- repo is clean (`git status`).

## Current Posture (v0.114)

- Current repository posture remains `"private": true`.
- `v1.0.0` publish cut requires an explicit transition decision to publishable posture.
