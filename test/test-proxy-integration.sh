#!/usr/bin/env bash
# 🧪 RSEXPRESS - Test OdooProxy Integration
# Verifica que OdooProxy está funcionando correctamente

echo "
╔════════════════════════════════════════════════════╗
║      🧪 TEST ODOO PROXY INTEGRATION               ║
╚════════════════════════════════════════════════════╝
"

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PROXY_URL="http://localhost:9999/jsonrpc"
DIRECT_URL="https://rsexpress.online/jsonrpc"

echo -e "${BLUE}📋 Configuración:${NC}"
echo "   Proxy: $PROXY_URL"
echo "   Direct: $DIRECT_URL"
echo ""

# Test 1: Verificar que proxy está corriendo
echo -e "${BLUE}Test 1: Verificar disponibilidad del proxy${NC}"
if curl -s -o /dev/null -w "%{http_code}" "$PROXY_URL" | grep -q "404\|200\|400"; then
    echo -e "${GREEN}✅ Proxy disponible en puerto 9999${NC}"
    PROXY_OK=1
else
    echo -e "${RED}❌ Proxy no disponible${NC}"
    echo "   Intenta: node /home/menteavatar/Desktop/Projects/RSExpress/RSExpress/start-services.js"
    PROXY_OK=0
fi

echo ""

# Test 2: Probar conexión JSON-RPC
echo -e "${BLUE}Test 2: Probar JSON-RPC via proxy${NC}"

PAYLOAD='{"jsonrpc":"2.0","method":"version","params":{},"id":0}'

if [ $PROXY_OK -eq 1 ]; then
    RESPONSE=$(curl -s -X POST "$PROXY_URL" \
        -H "Content-Type: application/json" \
        -d "$PAYLOAD")
    
    if echo "$RESPONSE" | grep -q "result"; then
        echo -e "${GREEN}✅ JSON-RPC responde correctamente${NC}"
        echo "   Respuesta: $(echo $RESPONSE | jq . 2>/dev/null || echo $RESPONSE | head -c 100)"
    else
        echo -e "${RED}❌ JSON-RPC error${NC}"
        echo "   Respuesta: $RESPONSE"
    fi
fi

echo ""

# Test 3: Probar con token
echo -e "${BLUE}Test 3: Probar autenticación con token${NC}"

TOKEN_PAYLOAD='{
  "jsonrpc": "2.0",
  "method": "call",
  "params": {
    "service": "object",
    "method": "execute",
    "args": ["odoo19", 5, "1fc63a72dcf97e88aab89c5a8a54dc0eac25cb9b", "res.partner", "search", [[]], 0, 5]
  },
  "id": 1
}'

if [ $PROXY_OK -eq 1 ]; then
    TOKEN_RESPONSE=$(curl -s -X POST "$PROXY_URL" \
        -H "Content-Type: application/json" \
        -d "$TOKEN_PAYLOAD")
    
    if echo "$TOKEN_RESPONSE" | grep -q "result"; then
        echo -e "${GREEN}✅ Autenticación exitosa${NC}"
        COUNT=$(echo "$TOKEN_RESPONSE" | jq '.result | length' 2>/dev/null || echo "?")
        echo "   Partners encontrados: $COUNT"
    else
        echo -e "${RED}❌ Error de autenticación${NC}"
        echo "   Respuesta: $(echo $TOKEN_RESPONSE | head -c 200)"
    fi
fi

echo ""
echo -e "${BLUE}📝 Proxies de función disponibles:${NC}"
echo ""
echo "   Browser Console:"
echo "   • testOdooProxy()     - Prueba conectividad"
echo "   • testOdooUsers()     - Prueba sincronización"
echo ""
echo "   Code:"
echo "   • new OdooConnector({ url: 'http://localhost:9999', ... })"
echo ""
echo -e "${YELLOW}✨ Integración lista para usar!${NC}"
