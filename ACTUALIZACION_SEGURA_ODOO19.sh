#!/bin/bash
# ================================================================================
# SCRIPT DE ACTUALIZACIÓN SEGURA - orbix_fleet_test
# ================================================================================
# Base de datos: odoo19
# Módulo: orbix_fleet_test
# Fecha: 2025-11-30
# ================================================================================

set -e  # Detener si hay errores

echo "======================================"
echo "ACTUALIZACIÓN SEGURA - orbix_fleet_test"
echo "Base de datos: odoo19"
echo "======================================"

# 1. BACKUP
echo ""
echo "[1/7] Creando backup..."
pg_dump -U odoo -d odoo19 -F c -f backup_pre_update_$(date +%F_%H%M%S).dump
echo "✓ Backup creado"

# 2. ACTUALIZAR MÓDULO
echo ""
echo "[2/7] Actualizando módulo orbix_fleet_test..."
odoo-bin -c /etc/odoo/odoo.conf -d odoo19 -u orbix_fleet_test --stop-after-init
echo "✓ Módulo actualizado"

# 3. VERIFICAR MÓDULO
echo ""
echo "[3/7] Verificando estado del módulo..."
psql -U odoo -d odoo19 -c "SELECT name, shortdesc, state FROM ir_module_module WHERE name = 'orbix_fleet_test';"

# 4. VERIFICAR CAMPOS TRACCAR
echo ""
echo "[4/7] Verificando campos Traccar en fleet.vehicle..."
psql -U odoo -d odoo19 -c "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'fleet_vehicle' AND column_name LIKE 'x_traccar%' ORDER BY column_name;"

# 5. VERIFICAR VISTAS
echo ""
echo "[5/7] Verificando vistas..."
psql -U odoo -d odoo19 -c "SELECT name, model FROM ir_ui_view WHERE name LIKE '%traccar%' ORDER BY name;"

# 6. VERIFICAR CRON
echo ""
echo "[6/7] Verificando cron job..."
psql -U odoo -d odoo19 -c "SELECT name, active, interval_number, interval_type FROM ir_cron WHERE name LIKE '%traccar%';"

# 7. VERIFICAR INTEGRIDAD
echo ""
echo "[7/7] Verificando integridad de datos..."
psql -U odoo -d odoo19 -c "SELECT COUNT(*) as total_vehiculos FROM fleet_vehicle;"
psql -U odoo -d odoo19 -c "SELECT COUNT(*) as total_ordenes FROM rsexpress_delivery_order;"

echo ""
echo "======================================"
echo "✓ ACTUALIZACIÓN COMPLETADA"
echo "======================================"
echo ""
echo "Próximos pasos:"
echo "1. Configurar parámetros Traccar (ver sección CONFIG)"
echo "2. Instalar Traccar Server si no existe"
echo "3. Probar endpoints en navegador"
echo ""
