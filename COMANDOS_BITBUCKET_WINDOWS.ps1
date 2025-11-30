# ================================================================================
# COMANDOS BITBUCKET WINDOWS - orbix_fleet_test
# ================================================================================
# Push de cambios al repositorio desde Windows/PowerShell
# ================================================================================

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "BITBUCKET PUSH - orbix_fleet_test" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "__manifest__.py")) {
    Write-Host "Error: No estas en el directorio del modulo" -ForegroundColor Red
    exit 1
}

# Mostrar estado
Write-Host ""
Write-Host "[1/5] Estado actual del repositorio:" -ForegroundColor Yellow
git status

# Agregar todos los archivos
Write-Host ""
Write-Host "[2/5] Agregando archivos al staging..." -ForegroundColor Yellow
git add .

# Mostrar qué se va a commitear
Write-Host ""
Write-Host "[3/5] Archivos a commitear:" -ForegroundColor Yellow
git diff --cached --name-status

# Solicitar mensaje de commit
Write-Host ""
$COMMIT_MSG = Read-Host "Mensaje del commit"

if ([string]::IsNullOrWhiteSpace($COMMIT_MSG)) {
    $COMMIT_MSG = "Update orbix_fleet_test - $(Get-Date -Format 'yyyy-MM-dd')"
}

# Commit
Write-Host ""
Write-Host "[4/5] Creando commit..." -ForegroundColor Yellow
git commit -m "$COMMIT_MSG"

# Push
Write-Host ""
Write-Host "[5/5] Enviando cambios a Bitbucket..." -ForegroundColor Yellow
git push origin main

Write-Host ""
Write-Host "======================================" -ForegroundColor Green
Write-Host "PUSH COMPLETADO" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
