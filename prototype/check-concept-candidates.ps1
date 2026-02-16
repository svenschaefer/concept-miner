param(
  [string]$SeedId,
  [string]$ArtifactsRoot = (Join-Path $PSScriptRoot "..\artifacts")
)

function Invoke-Check {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Id
  )

  node (Join-Path $PSScriptRoot "check-concept-candidates.js") `
    --seed-id $Id `
    --artifacts-root $ArtifactsRoot

  if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
  }
}

if (-not (Test-Path $ArtifactsRoot)) {
  throw "Artifacts root not found: $ArtifactsRoot"
}

if ([string]::IsNullOrWhiteSpace($SeedId)) {
  $seedDirs = Get-ChildItem -Path $ArtifactsRoot -Directory | Sort-Object Name
  foreach ($dir in $seedDirs) {
    $seedTxt = Join-Path $dir.FullName "seed\seed.txt"
    if (-not (Test-Path $seedTxt)) { continue }
    Invoke-Check -Id $dir.Name
  }
} else {
  Invoke-Check -Id $SeedId
}
