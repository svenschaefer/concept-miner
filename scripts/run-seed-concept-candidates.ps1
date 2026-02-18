param(
  [string]$SeedId,
  [string]$ArtifactsRoot = (Join-Path $PSScriptRoot "..\test\artifacts"),
  [ValidateSet("persisted", "runtime")]
  [string]$Mode = "persisted",
  [string]$WikipediaTitleIndexEndpoint = "http://127.0.0.1:32123",
  [int]$TimeoutMs = 120000,
  [int]$WikipediaTitleIndexTimeoutMs = 2000
)

function Invoke-SeedConceptCandidates {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Id
  )

  $seedRoot = Join-Path $ArtifactsRoot $Id
  $seedDir = Join-Path $seedRoot "seed"
  $resultRefDir = Join-Path $seedRoot "result-reference"
  $seedTxt = Join-Path $seedRoot "seed.txt"
  $step12Path = Join-Path $resultRefDir "seed.elementary-assertions.yaml"

  if (-not (Test-Path $seedTxt)) {
    throw "Missing seed.txt for seed '$Id': $seedTxt"
  }

  $outPath = Join-Path $resultRefDir "seed.concept-candidates.13b.yaml"
  $metaPath = Join-Path $resultRefDir "seed.concept-candidates.13b.meta.json"
  $diagPath = Join-Path $resultRefDir "seed.concept-candidates.13b.diag.json"
  New-Item -ItemType Directory -Path $resultRefDir -Force | Out-Null

  if ($Mode -eq "persisted") {
    if (-not (Test-Path $step12Path)) {
      throw "Missing persisted Step12 artifact for seed '$Id': $step12Path"
    }
    node (Join-Path $PSScriptRoot "..\src\core\step13.js") `
      --step12-in $step12Path `
      --step13-mode 13b `
      --out $outPath `
      --diag-out $diagPath `
      --meta-out $metaPath
  } else {
    node (Join-Path $PSScriptRoot "..\src\core\step13.js") `
      --seed-id $Id `
      --artifacts-root $ArtifactsRoot `
      --step13-mode 13b `
      --out $outPath `
      --diag-out $diagPath `
      --meta-out $metaPath `
      --wikipedia-title-index-endpoint $WikipediaTitleIndexEndpoint `
      --timeout-ms $TimeoutMs `
      --wikipedia-title-index-timeout-ms $WikipediaTitleIndexTimeoutMs
  }

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
    if (-not (Test-Path (Join-Path $dir.FullName "seed.txt"))) { continue }
    Invoke-SeedConceptCandidates -Id $dir.Name
  }
} else {
  Invoke-SeedConceptCandidates -Id $SeedId
}
