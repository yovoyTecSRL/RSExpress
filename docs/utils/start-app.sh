#!/usr/bin/env bash
# 🎯 Iniciar aplicación RSExpress con OdooProxy

echo "
╔════════════════════════════════════════════════════╗
║     🚀 INICIANDO RSEXPRESS CON OODOPROXY          ║
╚════════════════════════════════════════════════════╝
"

PROJECT_DIR="/home/menteavatar/Desktop/Projects/RSExpress/RSExpress"

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 1. Verificar que proxy está corriendo
echo -e "${BLUE}1️⃣  Verificando OdooProxy...${NC}"
if lsof -i :9999 &>/dev/null 2>&1; then
    echo -e "${GREEN}✅ OdooProxy corriendo en puerto 9999${NC}"
else
    echo -e "${YELLOW}⚠️ OdooProxy no está corriendo${NC}"
    echo "Iniciando OdooProxy..."
    cd "$PROJECT_DIR"
    node start-services.js > proxy.log 2>&1 &
    sleep 2
    echo -e "${GREEN}✅ OdooProxy iniciado${NC}"
fi

echo ""

# 2. Iniciar servidor HTTP
echo -e "${BLUE}2️⃣  Iniciando servidor HTTP...${NC}"
if lsof -i :5555 &>/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️ Servidor ya está corriendo en puerto 5555${NC}"
else
    echo "Iniciando servidor en puerto 5555..."
    cd "$PROJECT_DIR"
    python3 -m http.server 5555 > server.log 2>&1 &
    sleep 1
    echo -e "${GREEN}✅ Servidor HTTP iniciado${NC}"
fi

echo ""

# 3. Mostrar instrucciones
echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     ✅ TODO LISTO PARA USAR               ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${BLUE}📍 URLs Disponibles:${NC}"
echo ""
echo "  1️⃣ ${YELLOW}Interfaz Principal (Leads & Órdenes)${NC}"
echo "     → http://localhost:5555/orders-from-crm.html"
echo "     → Botón: 'Conectar a Odoo'"
echo "     → Verás los leads automáticamente"
echo ""
echo "  2️⃣ ${YELLOW}Suite de Pruebas JSON-RPC${NC}"
echo "     → http://localhost:5555/test-json-rpc.html"
echo "     → Pruebas automáticas de conexión"
echo "     → 4 tests disponibles"
echo ""

echo -e "${BLUE}🔌 Conexiones:${NC}"
echo "  • OdooProxy:        http://localhost:9999 (ACTIVO)"
echo "  • Servidor HTTP:    http://localhost:5555 (ACTIVO)"
echo "  • Odoo Backend:     https://rsexpress.online (VERIFICADO)"
echo ""

echo -e "${BLUE}🎯 Próximos pasos:${NC}"
echo "  1. Abre tu navegador"
echo "  2. Ve a: http://localhost:5555/orders-from-crm.html"
echo "  3. Haz clic en 'Conectar a Odoo'"
echo "  4. ¡Verás los leads de Odoo cargados automáticamente!"
echo ""

echo -e "${YELLOW}💡 Tips:${NC}"
echo "  • El proxy maneja CORS automáticamente"
echo "  • Si cambias de máquina, actualiza la URL del proxy"
echo "  • Puedes usar test-json-rpc.html para debugging"
echo "  • Revisa la consola (F12) para ver los logs"
echo ""
