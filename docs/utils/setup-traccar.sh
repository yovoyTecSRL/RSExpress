#!/usr/bin/env bash

# RS Express - Traccar Integration Quick Start
# Este script ayuda a configurar la integración de Traccar

echo "╔════════════════════════════════════════════════════════════╗"
echo "║   RS EXPRESS - TRACCAR INTEGRATION SETUP                  ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Verificando estructura de archivos...${NC}"
echo ""

# Check if all required files exist
FILES=(
    "traccar.js"
    "traccar-config.js"
    "traccar-examples.js"
    "app.js"
    "index.html"
)

MISSING=0
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file"
    else
        echo -e "${RED}✗${NC} $file (FALTANTE)"
        MISSING=$((MISSING+1))
    fi
done

echo ""

if [ $MISSING -eq 0 ]; then
    echo -e "${GREEN}✓ Todos los archivos están en su lugar${NC}"
else
    echo -e "${RED}✗ Faltan $MISSING archivo(s)${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}Configuración actual:${NC}"
echo ""

# Extract API key from traccar.js
API_KEY=$(grep -oP "API_KEY: '[^']*'" traccar.js | cut -d"'" -f2)
if [ ! -z "$API_KEY" ]; then
    echo -e "${GREEN}✓${NC} API Key: ${API_KEY:0:20}..."
else
    echo -e "${RED}✗${NC} API Key no encontrada"
fi

# Extract default environment
DEFAULT_ENV=$(grep -oP "DEFAULT_ENVIRONMENT: '[^']*'" traccar-config.js | cut -d"'" -f2)
if [ ! -z "$DEFAULT_ENV" ]; then
    echo -e "${GREEN}✓${NC} Ambiente: $DEFAULT_ENV"
else
    echo -e "${RED}✗${NC} Ambiente no configurado"
fi

echo ""
echo -e "${BLUE}Estructura generada:${NC}"
echo ""

cat << 'EOF'
RSExpress/
├── 📄 index.html
├── 📄 app.js
├── 📄 styles.css
│
├── 🔌 TRACCAR INTEGRATION
├── 📄 traccar.js              → Módulo principal
├── 📄 traccar-config.js       → Configuración
├── 📄 traccar-examples.js     → Ejemplos
│
├── 📚 DOCUMENTACIÓN
├── 📄 TRACCAR_INTEGRATION.md  → Guía completa
├── 📄 TRACCAR_README.md       → Readme
└── 📄 setup-traccar.sh        → Este script

assets/
└── (imágenes, recursos)
EOF

echo ""
echo -e "${BLUE}Funcionalidades integradas:${NC}"
echo ""

FEATURES=(
    "✓ Rastreo en tiempo real"
    "✓ Autenticación automática"
    "✓ WebSocket para actualizaciones"
    "✓ Gestión de dispositivos"
    "✓ Historial de posiciones"
    "✓ Reportes de viajes"
    "✓ Alertas y eventos"
    "✓ Geofences"
    "✓ Estadísticas de conducción"
    "✓ Reconexión automática"
)

for feature in "${FEATURES[@]}"; do
    echo "  $feature"
done

echo ""
echo -e "${BLUE}Pasos para iniciar:${NC}"
echo ""
echo "1. Abrir index.html en navegador"
echo "2. Traccar se inicializará automáticamente"
echo "3. Ver consola del navegador para logs"
echo ""

echo -e "${YELLOW}Comandos de consola disponibles:${NC}"
echo ""

cat << 'EOF'
// Información general
TraccarConfig.printTraccarConfig()

// Rastrear conductor
TraccarExamples.trackDriver()

// Obtener estadísticas
await TraccarExamples.getDailyDrivingStats(driverId)

// Ver historial de viajes
await TraccarExamples.showTripHistory(driverId, 30)

// Cambiar ambiente
TraccarConfig.setEnvironment('PRODUCTION')

// Ver estado
app.getTraccarStatus()

// Desconectar
app.traccar.disconnect()
EOF

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Instalación completada exitosamente${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${BLUE}Próximos pasos:${NC}"
echo ""
echo "1. Revisar documentación:"
echo "   - TRACCAR_INTEGRATION.md (Guía detallada)"
echo "   - TRACCAR_README.md (Overview)"
echo ""
echo "2. Ver ejemplos de uso:"
echo "   - traccar-examples.js"
echo ""
echo "3. Configurar para producción:"
echo "   - traccar-config.js (Cambiar PRODUCTION)"
echo ""
echo "4. Probar en consola del navegador:"
echo "   - TraccarConfig.printTraccarConfig()"
echo ""
echo "📚 Documentación: https://www.traccar.org/"
echo "🌐 Demo: https://demo.traccar.org/"
echo ""
