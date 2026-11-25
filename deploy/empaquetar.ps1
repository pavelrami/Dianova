# Compila Dianova en Windows y arma el paquete para subirlo al VPS.
# Uso (desde la raíz del repositorio, en PowerShell):
#   powershell -ExecutionPolicy Bypass -File deploy\empaquetar.ps1
# Resultado: deploy\paquete\dianova-paquete.tar.gz con el JAR, el build de React
# y los scripts de deploy\hostinger. Luego:
#   scp deploy\paquete\dianova-paquete.tar.gz root@IP-DEL-VPS:/root/
$ErrorActionPreference = 'Stop'

$raiz = Split-Path -Parent $PSScriptRoot
$salida = Join-Path $PSScriptRoot 'paquete'
$carpeta = Join-Path $salida 'dianova-paquete'

Write-Host '==> Backend: JAR (sin la configuración local)'
Push-Location (Join-Path $raiz 'backend')
try {
    & .\mvnw.cmd -q -B -DskipTests package
    if ($LASTEXITCODE -ne 0) { throw 'Falló la compilación del backend' }
} finally { Pop-Location }

Write-Host '==> Frontend: build estático'
Push-Location (Join-Path $raiz 'frontend')
try {
    if (-not (Test-Path 'node_modules')) {
        & npm ci
        if ($LASTEXITCODE -ne 0) { throw 'Falló npm ci' }
    }
    $env:VITE_API_URL = '/api'
    & npm run build
    if ($LASTEXITCODE -ne 0) { throw 'Falló el build del frontend' }
} finally { Pop-Location }

Write-Host '==> Armando el paquete'
if (Test-Path $carpeta) { Remove-Item -Recurse -Force $carpeta }
New-Item -ItemType Directory -Force $carpeta | Out-Null
Copy-Item (Join-Path $raiz 'backend\target\dianova-api.jar') $carpeta
Copy-Item -Recurse (Join-Path $raiz 'frontend\dist') (Join-Path $carpeta 'web')
Copy-Item (Join-Path $PSScriptRoot 'hostinger\*') $carpeta

$tgz = Join-Path $salida 'dianova-paquete.tar.gz'
if (Test-Path $tgz) { Remove-Item -Force $tgz }
& tar.exe -czf $tgz -C $salida 'dianova-paquete'
if ($LASTEXITCODE -ne 0) { throw 'Falló tar' }

$mb = [math]::Round((Get-Item $tgz).Length / 1MB, 1)
Write-Host "Listo: $tgz ($mb MB)"
