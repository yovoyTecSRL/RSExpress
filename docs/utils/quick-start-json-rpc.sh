#!/usr/bin/env bash

# 🚀 QUICK START - Configuración JSON-RPC Verificada
# 
# Este script ayuda a verificar la configuración JSON-RPC para Odoo
# Uso: bash quick-start-json-rpc.sh

set -e

echo "🚀 RSExpress - Quick Start JSON-RPC Odoo"
echo "========================================"
echo ""

# 1. Verificar servidor HTTP
echo "1️⃣  Verificando servidor HTTP..."
if curl -s http://localhost:5555 > /dev/null 2>&1; then
    echo "   ✅ Servidor HTTP corriendo en puerto 5555"
else
    echo "   ❌ Servidor HTTP no está accesible"
    echo "   Inicia con: python3 -m http.server 5555"
    exit 1
fi

# 2. Verificar archivo odoo-connector.js
echo ""
echo "2️⃣  Verificando archivos..."
if [ -f "odoo-connector.js" ]; then
    echo "   ✅ odoo-connector.js existe"
else
    echo "   ❌ odoo-connector.js no encontrado"
    exit 1
fi

if [ -f "order-manager.js" ]; then
    echo "   ✅ order-manager.js existe"
else
    echo "   ⚠️  order-manager.js no encontrado (opcional)"
fi

if [ -f "orders-from-crm.html" ]; then
    echo "   ✅ orders-from-crm.html existe"
else
    echo "   ❌ orders-from-crm.html no encontrado"
    exit 1
fi

# 3. Verificar conexión Odoo JSON-RPC
echo ""
echo "3️⃣  Verificando conexión JSON-RPC Odoo..."

RESPONSE=$(curl -s -X POST "https://rsexpress.online/jsonrpc" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "call",
    "params": {
      "service": "object",
      "method": "execute_kw",
      "args": [
        "odoo19",
        5,
        "1fc63a72dcf97e88aab89c5a8a54dc0eac25cb9b",
        "res.partner",
        "search_count",
        [[]]
      ]
    },
    "id": 1
  }')

if echo "$RESPONSE" | grep -q '"result"'; then
    PARTNER_COUNT=$(echo "$RESPONSE" | grep -o '"result":[0-9]*' | cut -d: -f2)
    echo "   ✅ Conexión exitosa a Odoo"
    echo "   📊 Partners encontrados: $PARTNER_COUNT"
else
    echo "   ❌ Error en conexión JSON-RPC"
    echo "   Respuesta: $RESPONSE"
    exit 1
fi

# 4. Obtener primer lead
echo ""
echo "4️⃣  Obteniendo primeros leads..."

LEADS=$(curl -s -X POST "https://rsexpress.online/jsonrpc" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "call",
    "params": {
      "service": "object",
      "method": "execute_kw",
      "args": [
        "odoo19",
        5,
        "1fc63a72dcf97e88aab89c5a8a54dc0eac25cb9b",
        "crm.lead",
        "search_read",
        [[]],
        {
          "fields": ["id", "name", "email_from"],
          "limit": 3
        }
      ]
    },
    "id": 2
  }')

if echo "$LEADS" | grep -q '"result"'; then
    echo "   ✅ Leads obtenidos correctamente"
    LEAD_COUNT=$(echo "$LEADS" | grep -o '"id":' | wc -l)
    echo "   📋 Leads disponibles: $LEAD_COUNT"
else
    echo "   ⚠️  No se pudieron obtener leads"
fi

# 5. URLs útiles
echo ""
echo "5️⃣  URLs Disponibles:"
echo "   🌐 Aplicación: http://localhost:5555/index.html"
echo "   📦 Gestor de Pedidos: http://localhost:5555/orders-from-crm.html"
echo "   🧪 Test JSON-RPC: http://localhost:5555/test-json-rpc.html"
echo ""

# 6. Resumen
echo "✅ Verificación Completada"
echo "========================================"
echo ""
echo "🎯 Próximos Pasos:"
echo "   1. Abre: http://localhost:5555/orders-from-crm.html"
echo "   2. Haz clic en 'Conectar a Odoo'"
echo "   3. Espera a que el indicador se ponga verde"
echo "   4. ¡Listo para usar!"
echo ""
echo "📚 Documentación:"
echo "   - JSON_RPC_CONFIG.md (Configuración detallada)"
echo "   - CONFIGURACION_FINAL.md (Resumen ejecutivo)"
echo "   - VERIFICACION_JSON_RPC.md (Pruebas realizadas)"
echo ""
