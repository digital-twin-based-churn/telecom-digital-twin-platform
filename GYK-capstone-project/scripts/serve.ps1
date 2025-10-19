param(
    [int]$Port = 8001,
    [string]$OutDir = "",
    [switch]$Background
)

$ErrorActionPreference = "Stop"

# Proje kökü
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = (Resolve-Path (Join-Path $ScriptDir "..")).Path
Set-Location $ProjectRoot

# Sanal ortam python yolu
$VenvPy = Join-Path $ProjectRoot "venv\Scripts\python.exe"
if (-not (Test-Path $VenvPy)) {
    Write-Host "Uyarı: venv bulunamadı, sistem python kullanılacak." -ForegroundColor Yellow
    $VenvPy = "python"
}

# Spark temp klasörü
$sparkTmp = "C:\spark_tmp"
if (-not (Test-Path $sparkTmp)) {
    New-Item -ItemType Directory -Force -Path $sparkTmp | Out-Null
}

# OUT_DIR otomatik seçim: en güncel postpaid_prod_* varsa onu al, yoksa baseline
function Get-DefaultOutDir {
    $artifacts = Join-Path $ProjectRoot "artifacts"
    if (-not (Test-Path $artifacts)) { return "artifacts\postpaid_baseline" }
    $prod = Get-ChildItem -Directory -Path $artifacts | Where-Object { $_.Name -like 'postpaid_prod_*' } | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if ($prod) { return (Join-Path $artifacts $prod.Name) }
    return (Join-Path $artifacts "postpaid_baseline")
}

if ([string]::IsNullOrWhiteSpace($OutDir)) {
    $OutDir = Get-DefaultOutDir
}

# Ortam değişkenleri
$env:PYSPARK_PYTHON = $VenvPy
$env:PYSPARK_DRIVER_PYTHON = $VenvPy
$env:PYTHONPATH = $ProjectRoot
$env:SPARK_LOCAL_DIRS = $sparkTmp
# PowerShell 5.1 uyumluluğu: '??' yerine boşluk/Null kontrolü
if (-not $env:SPARK_DRIVER_MEM -or [string]::IsNullOrWhiteSpace($env:SPARK_DRIVER_MEM)) { $env:SPARK_DRIVER_MEM = "6g" }
if (-not $env:SPARK_EXECUTOR_MEM -or [string]::IsNullOrWhiteSpace($env:SPARK_EXECUTOR_MEM)) { $env:SPARK_EXECUTOR_MEM = "6g" }
if (-not $env:SPARK_SHUFFLE_PARTITIONS -or [string]::IsNullOrWhiteSpace($env:SPARK_SHUFFLE_PARTITIONS)) { $env:SPARK_SHUFFLE_PARTITIONS = "24" }
$env:OUT_DIR = $OutDir

# Java kontrol (bilgilendirme amaçlı)
try { & java -version 2>$null } catch { Write-Host "Uyarı: Java bulunamadı (JAVA_HOME/PATH kontrol edin)." -ForegroundColor Yellow }

$argsUvicorn = "-m uvicorn svc.app:app --host 127.0.0.1 --port $Port"
if ($Background) {
    Start-Process -FilePath $VenvPy -ArgumentList $argsUvicorn -NoNewWindow | Out-Null
    Write-Host "Uvicorn arka planda başlatıldı: http://127.0.0.1:$Port"
}
else {
    & $VenvPy -m uvicorn svc.app:app --host 127.0.0.1 --port $Port
}


