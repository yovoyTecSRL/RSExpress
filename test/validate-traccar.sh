#!/usr/bin/env bash

# RS Express - Traccar Integration Validation
# Script para validar que la integración esté correctamente configurada

echo "╔════════════════════════════════════════════════════════════╗"
echo "║   VALIDACIÓN DE INTEGRACIÓN TRACCAR EN RS EXPRESS         ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

ERRORS=0
WARNINGS=0

# ========================================
# VERIFICACIÓN 1: Archivos Requeridos
# ========================================
echo -e "${BLUE}1. Verificando archivos requeridos...${NC}"
echo ""

REQUIRED_FILES=(
    "traccar.js"
    "traccar-config.js"
    "traccar-examples.js"
    "app.js"
    "index.html"
    "TRACCAR_INTEGRATION.md"
    "TRACCAR_README.md"
    "TRACCAR_IMPLEMENTATION.md"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        SIZE=$(wc -c < "$file" | numfmt --to=iec-i --suffix=B 2>/dev/null || wc -c < "$file")
        echo -e "  ${GREEN}✓${NC} $file ($SIZE)"
    else
        echo -e "  ${RED}✗${NC} $file (FALTANTE)"
        ERRORS=$((ERRORS+1))
    fi
done

echo ""

# ========================================
# VERIFICACIÓN 2: API Key
# ========================================
echo -e "${BLUE}2. Verificando API Key...${NC}"
echo ""

API_KEY=$(grep -oP "API_KEY: '[^']*'" traccar-config.js 2>/dev/null | cut -d"'" -f2)

if [ ! -z "$API_KEY" ]; then
    # Verificar que tiene al menos 50 caracteres
    API_KEY_LEN=${#API_KEY}
    if [ $API_KEY_LEN -ge 50 ]; then
        echo -e "  ${GREEN}✓${NC} API Key presente (${API_KEY_LEN} caracteres)"
        echo -e "     ${API_KEY:0:30}..."
    else
        echo -e "  ${YELLOW}⚠${NC} API Key parece muy corta (${API_KEY_LEN} caracteres)"
        WARNINGS=$((WARNINGS+1))
    fi
else
    echo -e "  ${RED}✗${NC} API Key no encontrada en traccar-config.js"
    ERRORS=$((ERRORS+1))
fi

# Verificar que también está en app.js
API_KEY_APP=$(grep -oP "this.traccarApiKey = '[^']*'" app.js 2>/dev/null | cut -d"'" -f2)
if [ ! -z "$API_KEY_APP" ]; then
    echo -e "  ${GREEN}✓${NC} API Key también en app.js"
else
    echo -e "  ${RED}✗${NC} API Key no encontrada en app.js"
    ERRORS=$((ERRORS+1))
fi

echo ""

# ========================================
# VERIFICACIÓN 3: Métodos en app.js
# ========================================
echo -e "${BLUE}3. Verificando métodos de Traccar en app.js...${NC}"
echo ""

METHODS=(
    "initTraccar"
    "startTraccarTracking"
    "stopTraccarTracking"
    "getTraccarActivityReport"
    "getTraccarDrivingStats"
    "getTraccarStatus"
    "handleTraccarPositionUpdate"
)

METHODS_FOUND=0
for method in "${METHODS[@]}"; do
    if grep -q "^    $method" app.js 2>/dev/null || grep -q "^    \*.*$method" app.js 2>/dev/null; then
        echo -e "  ${GREEN}✓${NC} $method()"
        METHODS_FOUND=$((METHODS_FOUND+1))
    else
        echo -e "  ${RED}✗${NC} $method() no encontrado"
        ERRORS=$((ERRORS+1))
    fi
done

echo -e "  Métodos encontrados: $METHODS_FOUND/${#METHODS[@]}"
echo ""

# ========================================
# VERIFICACIÓN 4: Scripts en index.html
# ========================================
echo -e "${BLUE}4. Verificando scripts en index.html...${NC}"
echo ""

if grep -q "traccar-config.js" index.html 2>/dev/null; then
    echo -e "  ${GREEN}✓${NC} traccar-config.js incluido"
else
    echo -e "  ${RED}✗${NC} traccar-config.js no incluido en index.html"
    ERRORS=$((ERRORS+1))
fi

if grep -q "traccar.js" index.html 2>/dev/null; then
    echo -e "  ${GREEN}✓${NC} traccar.js incluido"
else
    echo -e "  ${RED}✗${NC} traccar.js no incluido en index.html"
    ERRORS=$((ERRORS+1))
fi

if grep -q "app.js" index.html 2>/dev/null; then
    echo -e "  ${GREEN}✓${NC} app.js incluido"
else
    echo -e "  ${RED}✗${NC} app.js no incluido en index.html"
    ERRORS=$((ERRORS+1))
fi

echo ""

# ========================================
# VERIFICACIÓN 5: Configuración en traccar-config.js
# ========================================
echo -e "${BLUE}5. Verificando configuración en traccar-config.js...${NC}"
echo ""

CONFIGS=(
    "ENVIRONMENTS"
    "DEFAULT_ENVIRONMENT"
    "CONNECTION"
    "TRACKING"
    "ALERTS"
    "REPORTS"
    "MAPS"
)

for config in "${CONFIGS[@]}"; do
    if grep -q "$config" traccar-config.js 2>/dev/null; then
        echo -e "  ${GREEN}✓${NC} $config configurado"
    else
        echo -e "  ${RED}✗${NC} $config no encontrado"
        ERRORS=$((ERRORS+1))
    fi
done

echo ""

# ========================================
# VERIFICACIÓN 6: Documentación
# ========================================
echo -e "${BLUE}6. Verificando documentación...${NC}"
echo ""

DOCS=(
    "TRACCAR_INTEGRATION.md"
    "TRACCAR_README.md"
    "TRACCAR_IMPLEMENTATION.md"
)

for doc in "${DOCS[@]}"; do
    if [ -f "$doc" ]; then
        LINES=$(wc -l < "$doc")
        echo -e "  ${GREEN}✓${NC} $doc ($LINES líneas)"
    else
        echo -e "  ${RED}✗${NC} $doc no encontrado"
        WARNINGS=$((WARNINGS+1))
    fi
done

echo ""

# ========================================
# VERIFICACIÓN 7: Ejemplos
# ========================================
echo -e "${BLUE}7. Verificando ejemplos en traccar-examples.js...${NC}"
echo ""

EXAMPLES=(
    "trackDriver"
    "getDailyDrivingStats"
    "showTripHistory"
    "setupGeofenceAlerts"
    "setupSpeedAlerts"
    "displayDriversLiveStatus"
    "exportTripReportToCSV"
)

EXAMPLES_FOUND=0
for example in "${EXAMPLES[@]}"; do
    if grep -q "function $example" traccar-examples.js 2>/dev/null; then
        echo -e "  ${GREEN}✓${NC} $example"
        EXAMPLES_FOUND=$((EXAMPLES_FOUND+1))
    else
        echo -e "  ${RED}✗${NC} $example no encontrado"
    fi
done

echo -e "  Ejemplos encontrados: $EXAMPLES_FOUND/${#EXAMPLES[@]}"
echo ""

# ========================================
# VERIFICACIÓN 8: WebSocket en traccar.js
# ========================================
echo -e "${BLUE}8. Verificando WebSocket en traccar.js...${NC}"
echo ""

if grep -q "connectWebSocket" traccar.js 2>/dev/null; then
    echo -e "  ${GREEN}✓${NC} connectWebSocket() presente"
else
    echo -e "  ${RED}✗${NC} connectWebSocket() no encontrado"
    ERRORS=$((ERRORS+1))
fi

if grep -q "handleWebSocketMessage" traccar.js 2>/dev/null; then
    echo -e "  ${GREEN}✓${NC} handleWebSocketMessage() presente"
else
    echo -e "  ${RED}✗${NC} handleWebSocketMessage() no encontrado"
    ERRORS=$((ERRORS+1))
fi

if grep -q "attemptReconnect" traccar.js 2>/dev/null; then
    echo -e "  ${GREEN}✓${NC} attemptReconnect() presente (reconexión automática)"
else
    echo -e "  ${RED}✗${NC} attemptReconnect() no encontrado"
    WARNINGS=$((WARNINGS+1))
fi

echo ""

# ========================================
# VERIFICACIÓN 9: Endpoints de Traccar
# ========================================
echo -e "${BLUE}9. Verificando endpoints de Traccar API...${NC}"
echo ""

ENDPOINTS=(
    "/api/server"
    "/api/devices"
    "/api/positions"
    "/api/reports/route"
    "/api/reports/events"
    "/api/reports/trips"
    "/api/geofences"
    "/api/socket"
)

ENDPOINTS_FOUND=0
for endpoint in "${ENDPOINTS[@]}"; do
    if grep -q "$endpoint" traccar.js 2>/dev/null; then
        echo -e "  ${GREEN}✓${NC} $endpoint"
        ENDPOINTS_FOUND=$((ENDPOINTS_FOUND+1))
    fi
done

echo -e "  Endpoints encontrados: $ENDPOINTS_FOUND/${#ENDPOINTS[@]}"
echo ""

# ========================================
# RESULTADO FINAL
# ========================================
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ VALIDACIÓN EXITOSA${NC}"
    echo ""
    echo "Toda la integración de Traccar está correctamente configurada."
    echo "La aplicación está lista para usar."
    echo ""
    echo "Próximos pasos:"
    echo "1. Abrir index.html en navegador"
    echo "2. Revisar consola del navegador"
    echo "3. Ejecutar: TraccarConfig.printTraccarConfig()"
    echo "4. Probar ejemplos desde consola"
    echo ""
    exit 0
    
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ VALIDACIÓN CON ADVERTENCIAS${NC}"
    echo ""
    echo "La integración está funcionando pero hay $WARNINGS advertencia(s)."
    echo ""
    exit 0
    
else
    echo -e "${RED}✗ VALIDACIÓN FALLIDA${NC}"
    echo ""
    echo "Hay $ERRORS error(es) que deben corregirse:"
    echo ""
    echo "Acciones recomendadas:"
    echo "1. Verificar que todos los archivos están presentes"
    echo "2. Verificar la API Key en traccar-config.js"
    echo "3. Ejecutar setup-traccar.sh para reinicializar"
    echo "4. Revisar documentación en TRACCAR_INTEGRATION.md"
    echo ""
    exit 1
fi
