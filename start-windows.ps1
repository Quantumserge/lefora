param(
  [ValidateRange(1024, 65535)]
  [int]$Port = 3000
)

$ErrorActionPreference = 'Stop'
$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$Python = Get-Command python -ErrorAction Stop
$Npm = Get-Command npm -ErrorAction Stop
$DatabasePath = Join-Path $ProjectRoot 'plant_readiness.db'
$BackendProcess = $null

Set-Location $ProjectRoot
$env:PYTHONPATH = $ProjectRoot
$env:PLANT_READINESS_DB_PATH = $DatabasePath

Write-Host 'Checking Python dependencies…'
& $Python.Source -c 'import cv2, flask, numpy, onnxruntime, pandas, rembg, sklearn' 2>$null
if ($LASTEXITCODE -ne 0) {
  Write-Host 'Installing Python dependencies…'
  & $Python.Source -m pip install -r (Join-Path $ProjectRoot 'requirements.txt')
  if ($LASTEXITCODE -ne 0) { throw 'Python dependency installation failed.' }
}

$NextDirectory = Join-Path $ProjectRoot 'nextjs'
if (-not (Test-Path (Join-Path $NextDirectory 'node_modules'))) {
  Write-Host 'Installing frontend dependencies…'
  Push-Location $NextDirectory
  try {
    & $Npm.Source install
    if ($LASTEXITCODE -ne 0) { throw 'Frontend dependency installation failed.' }
  }
  finally { Pop-Location }
}

Write-Host 'Loading the committed plant measurements…'
& $Python.Source -m plantreadiness.seed `
  --db $DatabasePath `
  --csv (Join-Path $ProjectRoot 'data\super_orange_growth_data.csv') `
  --models-dir (Join-Path $ProjectRoot 'models')
if ($LASTEXITCODE -ne 0) { throw 'Preparing the plant data failed.' }

$BackendLog = Join-Path $env:TEMP "leafora-backend-$PID.log"
$BackendErrorLog = Join-Path $env:TEMP "leafora-backend-error-$PID.log"
try {
  $BackendProcess = Start-Process `
    -FilePath $Python.Source `
    -ArgumentList @('-m', 'flask', '--app', 'backend.app', 'run', '--host=127.0.0.1', '--port=8000') `
    -WorkingDirectory $ProjectRoot `
    -WindowStyle Hidden `
    -RedirectStandardOutput $BackendLog `
    -RedirectStandardError $BackendErrorLog `
    -PassThru

  Start-Sleep -Seconds 2
  if ($BackendProcess.HasExited) {
    throw "The backend did not start. See $BackendErrorLog"
  }

  Set-Location $NextDirectory
  Write-Host "Leafora is starting at http://localhost:$Port/nursery"
  Write-Host 'Keep this window open while using the app. Press Ctrl+C to stop it.'
  & $Npm.Source run dev -- --hostname 0.0.0.0 --port $Port
  if ($LASTEXITCODE -ne 0) { throw 'The frontend stopped with an error.' }
}
finally {
  if ($BackendProcess -and -not $BackendProcess.HasExited) {
    Stop-Process -Id $BackendProcess.Id -Force -ErrorAction SilentlyContinue
  }
}
