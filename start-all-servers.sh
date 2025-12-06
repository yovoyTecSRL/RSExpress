#!/bin/bash

# 🚀 Script para iniciar las 3 instancias de RSExpress
# 5555: HTML UI Server
# 7777: React App (Vite)
# 9999: Proxy Odoo

set -e

echo "
╔═══════════════════════════════════════════════════════╗
║   🚀 INICIANDO RSEXPRESS - 3 INSTANCIAS              ║
╚═══════════════════════════════════════════════════════╝
"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para detener procesos al salir
cleanup() {
    echo -e "\n${RED}⏹️  Deteniendo todos los servidores...${NC}"
    kill $PID_HTML 2>/dev/null || true
    kill $PID_REACT 2>/dev/null || true
    kill $PID_PROXY 2>/dev/null || true
    wait 2>/dev/null || true
    echo -e "${GREEN}✅ Todos los servidores detenidos${NC}"
    exit 0
}

# Capturar CTRL+C
trap cleanup SIGINT SIGTERM

# 1️⃣  Iniciar Servidor HTML en puerto 5555
echo -e "${BLUE}[1/3]${NC} Iniciando servidor HTML en puerto 5555..."
node server.js &
PID_HTML=$!
echo -e "${GREEN}✅ HTML Server iniciado (PID: $PID_HTML)${NC}"
sleep 1

# 2️⃣  Iniciar Servidor React (Vite) en puerto 7777
echo -e "${BLUE}[2/3]${NC} Iniciando servidor React en puerto 7777..."
PORT=7777 npm run vite:dev &
PID_REACT=$!
echo -e "${GREEN}✅ React Server iniciado (PID: $PID_REACT)${NC}"
sleep 2

# 3️⃣  Iniciar Proxy Odoo en puerto 9999
echo -e "${BLUE}[3/3]${NC} Iniciando Proxy Odoo en puerto 9999..."
node scripts/odoo/odoo-proxy.js &
PID_PROXY=$!
echo -e "${GREEN}✅ Proxy Odoo iniciado (PID: $PID_PROXY)${NC}"
sleep 1

echo -e "
${GREEN}╔═══════════════════════════════════════════════════════╗
║   ✅ TODOS LOS SERVIDORES ACTIVOS                      ║
╠═══════════════════════════════════════════════════════╣
║ 🌐 HTML Server:  http://localhost:5555               ║
║ ⚛️  React App:    http://localhost:7777               ║
║ 🔄 Proxy Odoo:   http://localhost:9999               ║
╠═══════════════════════════════════════════════════════╣
║ 📋 Archivos HTML disponibles:                         ║
║    - /delivery-cards.html                             ║
║    - /orders-from-crm.html                            ║
║    - /fleet-dashboard.html                            ║
║    - /delivery-orders.html                            ║
║                                                       ║
║ ⏱️  Presiona CTRL+C para detener todo                  ║
╚═══════════════════════════════════════════════════════╝${NC}
"

# Mantener script ejecutando
wait
