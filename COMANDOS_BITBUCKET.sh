#!/bin/bash
# ================================================================================
# COMANDOS BITBUCKET - orbix_fleet_test
# ================================================================================
# Push de cambios al repositorio
# ================================================================================

set -e

echo "======================================"
echo "BITBUCKET PUSH - orbix_fleet_test"
echo "======================================"

# Verificar que estamos en el directorio correcto
if [ ! -f "__manifest__.py" ]; then
    echo "❌ Error: No estás en el directorio del módulo"
    exit 1
fi

# Mostrar estado
echo ""
echo "[1/5] Estado actual del repositorio:"
git status

# Agregar todos los archivos modificados
echo ""
echo "[2/5] Agregando archivos al staging..."
git add .

# Mostrar qué se va a commitear
echo ""
echo "[3/5] Archivos a commitear:"
git diff --cached --name-status

# Solicitar mensaje de commit
echo ""
read -p "Mensaje del commit: " COMMIT_MSG

if [ -z "$COMMIT_MSG" ]; then
    COMMIT_MSG="Update orbix_fleet_test - $(date +%F)"
fi

# Commit
echo ""
echo "[4/5] Creando commit..."
git commit -m "$COMMIT_MSG"

# Push
echo ""
echo "[5/5] Enviando cambios a Bitbucket..."
git push origin main

echo ""
echo "======================================"
echo "✓ PUSH COMPLETADO"
echo "======================================"
