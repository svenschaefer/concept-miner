# Template Setup

1. Replace all placeholder tokens in the repository.
2. Set `package.json` fields (`name`, `description`, `bin`).
3. Set `private` to `false` when ready to publish.
4. Run:
   - `npm ci`
   - `npm test`
5. Rename API entrypoints in `src/run.js` if your project needs different names.
6. Adapt `project.config.json` to your directory layout and runtime policies.

Recommended replacement command (PowerShell):

```powershell
Get-ChildItem -Recurse -File | ForEach-Object {
  (Get-Content $_.FullName -Raw) `
    -replace 'concept-miner', 'your-project' `
    -replace 'concept-miner', 'your-package-name' `
    -replace 'Deterministic concept extraction from natural language.', 'your description' `
    -replace 'concept-miner', 'your-cli' `
    -replace 'svenschaefer', 'your name' `
    -replace 'svenschaefer', 'your-github-user-or-org' `
    -replace 'concept-miner', 'your-repo-name' `
    -replace 'concept-extraction', 'keyword-one' `
    -replace 'deterministic', 'keyword-two' `
    -replace '2026', '2026' |
  Set-Content $_.FullName
}
```
