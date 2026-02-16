param(
  [string]$SeedId,
  [string]$ArtifactsRoot = (Join-Path $PSScriptRoot "..\artifacts"),
  [ValidateSet("persisted", "runtime")]
  [string]$Mode = "persisted",
  [ValidateSet("13a", "13b")]
  [string]$Step13Mode = "13b",
  [string]$WikipediaTitleIndexEndpoint = "http://127.0.0.1:32123",
  [int]$TimeoutMs = 120000,
  [int]$WikipediaTitleIndexTimeoutMs = 2000
)

function Invoke-ConceptCandidates {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Id,
    [Parameter(Mandatory = $true)]
    [string]$SeedDir
  )

  $outPath = Join-Path $SeedDir "seed.concept-candidates.$Step13Mode.yaml"
  $metaPath = Join-Path $SeedDir "seed.concept-candidates.$Step13Mode.meta.json"
  $diagPath = Join-Path $SeedDir "seed.concept-candidates.$Step13Mode.diag.json"
  $step12Path = Join-Path $SeedDir "seed.elementary-assertions.yaml"
  if ($Mode -eq "persisted") {
    if (-not (Test-Path $step12Path)) {
      throw "Missing persisted Step 12 artifact for seed '$Id': $step12Path. Run Step 12 first or use -Mode runtime."
    }
    node (Join-Path $PSScriptRoot "concept-candidates.js") `
      --step12-in $step12Path `
      --step13-mode $Step13Mode `
      --out $outPath `
      --diag-out $diagPath `
      --meta-out $metaPath
  } else {
    node (Join-Path $PSScriptRoot "concept-candidates.js") `
      --seed-id $Id `
      --artifacts-root $ArtifactsRoot `
      --step13-mode $Step13Mode `
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
    $seedTxt = Join-Path $dir.FullName "seed\seed.txt"
    if (-not (Test-Path $seedTxt)) { continue }
    Invoke-ConceptCandidates -Id $dir.Name -SeedDir (Join-Path $dir.FullName "seed")
  }
} else {
  Invoke-ConceptCandidates -Id $SeedId -SeedDir (Join-Path $ArtifactsRoot $SeedId "seed")
}
