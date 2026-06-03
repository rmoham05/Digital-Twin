param(
  [string]$Server = "root@143.110.165.178",
  [string]$RemoteRoot = "/var/www/twinops",
  [string]$ArchiveName = "twinops-dist.tar.gz"
)

$ErrorActionPreference = "Stop"

$projectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$archivePath = Join-Path $projectRoot $ArchiveName

Push-Location $projectRoot
try {
  npm run build

  if (Test-Path $archivePath) {
    Remove-Item -LiteralPath $archivePath -Force
  }

  tar -czf $archivePath -C dist .
  scp $archivePath "${Server}:/tmp/$ArchiveName"

  $remoteCommand = @"
set -e
mkdir -p '$RemoteRoot'
tar -xzf '/tmp/$ArchiveName' -C '$RemoteRoot'
chown -R www-data:www-data '$RemoteRoot' || true
find '$RemoteRoot' -type d -exec chmod 755 {} \;
find '$RemoteRoot' -type f -exec chmod 644 {} \;
"@

  ssh $Server $remoteCommand
}
finally {
  Pop-Location
}

Write-Host "Deployed TwinOps static build to ${Server}:$RemoteRoot"
