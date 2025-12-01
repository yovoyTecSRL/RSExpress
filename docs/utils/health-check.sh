#!/usr/bin/env bash
# 🚀 RSEXPRESS - Health Check Completo
# Verifica que todo está funcionando correctamente

echo "
╔════════════════════════════════════════════════════╗
║        🚀 RSEXPRESS - COMPLETE HEALTH CHECK       ║
╚════════════════════════════════════════════════════╝
"

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

CHECKS_PASSED=0
CHECKS_FAILED=0
PROJECT_DIR="/home/menteavatar/Desktop/Projects/RSExpress/RSExpress"

# Función para imprimir resultado de check
check_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅${NC} $2"
        ((CHECKS_PASSED++))
    else
        echo -e "${RED}❌${NC} $2"
        ((CHECKS_FAILED++))
    fi
}

# ================================
# 1. VERIFICAR ARCHIVOS NECESARIOS
# ================================
echo -e "\n${CYAN}📋 1. VERIFICANDO ARCHIVOS${NC}"

if [ -f "$PROJECT_DIR/odoo-connector.js" ]; then 
    check_result 0 "odoo-connector.js presente"
else 
    check_result 1 "odoo-connector.js FALTANTE"
fi

if [ -f "$PROJECT_DIR/start-services.js" ]; then 
    check_result 0 "start-services.js presente"
else 
    check_result 1 "start-services.js FALTANTE"
fi

if [ -f "$PROJECT_DIR/odoo-proxy.js" ]; then 
    check_result 0 "odoo-proxy.js presente"
else 
    check_result 1 "odoo-proxy.js FALTANTE"
fi

if [ -f "$PROJECT_DIR/orders-from-crm.html" ]; then 
    check_result 0 "orders-from-crm.html presente"
else 
    check_result 1 "orders-from-crm.html FALTANTE"
fi

if [ -f "$PROJECT_DIR/test-odoo-proxy.js" ]; then 
    check_result 0 "test-odoo-proxy.js presente"
else 
    check_result 1 "test-odoo-proxy.js FALTANTE"
fi

if [ -f "$PROJECT_DIR/ODOO_PROXY_GUIDE.md" ]; then 
    check_result 0 "ODOO_PROXY_GUIDE.md presente"
else 
    check_result 1 "ODOO_PROXY_GUIDE.md FALTANTE"
fi

# ================================
# 2. VERIFICAR CONFIGURACIÓN
# ================================
echo -e "\n${CYAN}⚙️  2. VERIFICANDO CONFIGURACIÓN${NC}"

# Verificar odoo-connector.js tiene auto-detección de proxy
if grep -q "localhost:9999\|proxyMode" "$PROJECT_DIR/odoo-connector.js" 2>/dev/null; then
    check_result 0 "odoo-connector.js tiene auto-detección de proxy"
else
    check_result 1 "odoo-connector.js SIN auto-detección de proxy"
fi

# Verificar orders-from-crm.html tiene auto-detección
if grep -q "localhost:9999" "$PROJECT_DIR/orders-from-crm.html" 2>/dev/null; then
    check_result 0 "orders-from-crm.html tiene auto-detección de proxy"
else
    check_result 1 "orders-from-crm.html SIN auto-detección de proxy"
fi

# Verificar start-services.js existe y contiene proxy
if grep -q "PROXY_PORT\|9999" "$PROJECT_DIR/start-services.js" 2>/dev/null; then
    check_result 0 "start-services.js configurado para puerto 9999"
else
    check_result 1 "start-services.js NO está configurado correctamente"
fi

# ================================
# 3. VERIFICAR CONNECTIVIDAD
# ================================
echo -e "\n${CYAN}🌐 3. VERIFICANDO CONECTIVIDAD${NC}"

# Verificar Node.js disponible
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    check_result 0 "Node.js disponible ($NODE_VERSION)"
else
    check_result 1 "Node.js NO disponible"
fi

# Verificar puerto 9999 disponible o en uso
if lsof -i :9999 &>/dev/null 2>&1; then
    check_result 0 "Puerto 9999 está en uso (proxy running)"
else
    echo -e "${YELLOW}ℹ️ ${NC} Puerto 9999 no en uso (proxy no está corriendo - opcional)"
fi

# Verificar que rsexpress.online es accesible
if timeout 5 curl -s -k -X POST https://rsexpress.online/jsonrpc \
    -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","method":"version","params":{},"id":0}' 2>/dev/null | grep -q "jsonrpc\|result\|error"; then
    check_result 0 "rsexpress.online accesible"
else
    check_result 1 "rsexpress.online NO accesible"
fi

# ================================
# 4. VERIFICAR PROXY (si está corriendo)
# ================================
echo -e "\n${CYAN}🔌 4. VERIFICANDO PROXY (si está disponible)${NC}"

if lsof -i :9999 &>/dev/null 2>&1; then
    # Proxy está corriendo, hacer test
    if timeout 5 curl -s -X POST http://localhost:9999/jsonrpc \
        -H "Content-Type: application/json" \
        -d '{"jsonrpc":"2.0","method":"version","params":{},"id":0}' 2>/dev/null | grep -q "error\|result"; then
        check_result 0 "Proxy responde correctamente"
    else
        check_result 1 "Proxy NO responde"
    fi
    
    # Verificar headers CORS
    CORS_HEADER=$(curl -s -i -X OPTIONS http://localhost:9999/jsonrpc 2>/dev/null | grep -i "access-control-allow-origin" | head -1)
    if [ -n "$CORS_HEADER" ]; then
        check_result 0 "Proxy tiene headers CORS"
    else
        check_result 1 "Proxy SIN headers CORS"
    fi
else
    echo -e "${YELLOW}ℹ️ ${NC} Proxy no está corriendo (opcional)"
fi

# ================================
# 5. VERIFICAR DOCUMENTACIÓN
# ================================
echo -e "\n${CYAN}📚 5. VERIFICANDO DOCUMENTACIÓN${NC}"

if [ -f "$PROJECT_DIR/ODOO_PROXY_GUIDE.md" ] && [ -s "$PROJECT_DIR/ODOO_PROXY_GUIDE.md" ]; then
    check_result 0 "ODOO_PROXY_GUIDE.md existe y tiene contenido"
else 
    check_result 1 "ODOO_PROXY_GUIDE.md vacío o faltante"
fi

if [ -f "$PROJECT_DIR/PROXY_INTEGRATION_SUMMARY.md" ] && [ -s "$PROJECT_DIR/PROXY_INTEGRATION_SUMMARY.md" ]; then
    check_result 0 "PROXY_INTEGRATION_SUMMARY.md existe"
else 
    check_result 1 "PROXY_INTEGRATION_SUMMARY.md faltante"
fi

# ================================
# 6. RESUMEN FINAL
# ================================
echo -e "\n${CYAN}📊 RESUMEN${NC}"
echo "Checks Pasados:  ${GREEN}$CHECKS_PASSED${NC}"
echo "Checks Fallados: ${RED}$CHECKS_FAILED${NC}"

if [ $((CHECKS_PASSED + CHECKS_FAILED)) -gt 0 ]; then
    TOTAL=$((CHECKS_PASSED + CHECKS_FAILED))
    PERCENTAGE=$((CHECKS_PASSED * 100 / TOTAL))
    echo -e "Porcentaje:      ${BLUE}$PERCENTAGE%${NC}"
fi

# ================================
# 7. RECOMENDACIONES
# ================================
echo -e "\n${CYAN}💡 RECOMENDACIONES${NC}"

if [ $CHECKS_FAILED -le 1 ]; then
    echo -e "${GREEN}✅ Sistema lista!${NC}"
    echo ""
    echo "Próximos pasos:"
    echo "  1. Inicia el proxy: node start-services.js"
    echo "  2. Abre orders-from-crm.html en el navegador"
    echo "  3. Haz clic en 'Conectar a Odoo'"
    echo "  4. Carga y administra tus pedidos"
else
    echo -e "${RED}⚠️  Se encontraron algunos problemas${NC}"
fi

echo ""
echo "Para más información:"
echo "  • Lee: $PROJECT_DIR/ODOO_PROXY_GUIDE.md"
echo "  • Lee: $PROJECT_DIR/PROXY_INTEGRATION_SUMMARY.md"
echo ""

# ================================
# 8. STATUS FINAL
# ================================
if [ $CHECKS_FAILED -le 1 ]; then
    echo -e "${GREEN}╔════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║    🚀 SISTEMA LISTO PARA USAR    ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════╝${NC}"
else
    echo -e "${RED}╔════════════════════════════════════╗${NC}"
    echo -e "${RED}║   ⚠️  REQUIERE ATENCIÓN           ║${NC}"
    echo -e "${RED}╚════════════════════════════════════╝${NC}"
fi
