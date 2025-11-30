#!/bin/bash
# ================================================================================
# CONFIGURACIÓN TRACCAR - orbix_fleet_test
# ================================================================================
# Base de datos: odoo19
# ================================================================================

echo "======================================"
echo "CONFIGURACIÓN TRACCAR"
echo "======================================"

# Solicitar datos al usuario
read -p "URL de Traccar [http://localhost:8082]: " TRACCAR_URL
TRACCAR_URL=${TRACCAR_URL:-http://localhost:8082}

read -p "Usuario Traccar [admin]: " TRACCAR_USER
TRACCAR_USER=${TRACCAR_USER:-admin}

read -sp "Password Traccar [admin]: " TRACCAR_PASS
TRACCAR_PASS=${TRACCAR_PASS:-admin}
echo ""

# Crear archivo temporal con comandos Python
cat > /tmp/config_traccar.py << EOF
env['ir.config_parameter'].sudo().set_param('traccar.api.url', '$TRACCAR_URL/api')
env['ir.config_parameter'].sudo().set_param('traccar.api.username', '$TRACCAR_USER')
env['ir.config_parameter'].sudo().set_param('traccar.api.password', '$TRACCAR_PASS')
env['ir.config_parameter'].sudo().set_param('traccar.api.timeout', '10')
env['ir.config_parameter'].sudo().set_param('traccar.api.retry', '3')
env.cr.commit()
print('✓ Configuración Traccar guardada')
EOF

# Ejecutar en Odoo shell
echo ""
echo "Guardando configuración en Odoo..."
odoo-bin shell -c /etc/odoo/odoo.conf -d odoo19 < /tmp/config_traccar.py

# Limpiar
rm /tmp/config_traccar.py

echo ""
echo "======================================"
echo "✓ CONFIGURACIÓN COMPLETADA"
echo "======================================"
echo ""
echo "Verificar en Odoo:"
echo "Ajustes → Técnico → Parámetros del Sistema"
echo "Buscar: traccar.api.*"
echo ""
