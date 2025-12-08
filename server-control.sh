#!/bin/bash

##############################################################
# 🚀 RSExpress Multi-Server Control Script
# Maneja los 3 servidores: HTML (5555), React (7777), Proxy (9999)
##############################################################

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$SCRIPT_DIR"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función de banner
print_banner() {
    echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║  🚀 RSExpress - Multi-Server Control          ║${NC}"
    echo -e "${BLUE}║  5555: HTML UI  | 7777: React  | 9999: Proxy  ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
}

# Función para verificar puertos
check_port() {
    local port=$1
    local service=$2
    
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        echo -e "${GREEN}✓${NC} Puerto $port ($service) está ocupado"
        return 0
    else
        echo -e "${RED}✗${NC} Puerto $port ($service) está libre"
        return 1
    fi
}

# Función para listar estado
status() {
    print_banner
    echo ""
    echo -e "${BLUE}📊 Estado de Servidores:${NC}"
    echo "─────────────────────────────────────────"
    
    echo -e "\n${YELLOW}📄 HTML Server (Puerto 5555)${NC}"
    check_port 5555 "HTML" && echo "   URL: http://localhost:5555" || echo "   Estado: DETENIDO"
    
    echo -e "\n${YELLOW}⚛️  React App (Puerto 7777)${NC}"
    check_port 7777 "React" && echo "   URL: http://localhost:7777" || echo "   Estado: DETENIDO"
    
    echo -e "\n${YELLOW}🔀 Odoo Proxy (Puerto 9999)${NC}"
    check_port 9999 "Proxy" && echo "   URL: http://localhost:9999" || echo "   Estado: DETENIDO"
    
    echo ""
}

# Función para iniciar todos
start_all() {
    print_banner
    echo -e "\n${YELLOW}🚀 Iniciando todos los servidores...${NC}\n"
    
    cd "$PROJECT_ROOT"
    npm run dev
}

# Función para detener todos
stop_all() {
    print_banner
    echo -e "\n${YELLOW}⏹️  Deteniendo servidores...${NC}\n"
    
    # Matar procesos Node
    pkill -f "node server.js" 2>/dev/null && echo -e "${GREEN}✓${NC} HTML Server detenido" || true
    pkill -f "vite" 2>/dev/null && echo -e "${GREEN}✓${NC} React App detenido" || true
    pkill -f "odoo-proxy" 2>/dev/null && echo -e "${GREEN}✓${NC} Proxy detenido" || true
    
    echo -e "\n${GREEN}✓ Todos los servidores han sido detenidos${NC}\n"
}

# Función para reiniciar
restart() {
    stop_all
    sleep 2
    start_all
}

# Función para abrir URLs
open_servers() {
    echo -e "${YELLOW}🌐 Abriendo servidores en el navegador...${NC}\n"
    
    # Detectar sistema operativo
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        xdg-open http://localhost:5555 2>/dev/null &
        xdg-open http://localhost:7777 2>/dev/null &
        echo -e "${GREEN}✓ Navegadores abiertos${NC}\n"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        open http://localhost:5555 2>/dev/null &
        open http://localhost:7777 2>/dev/null &
        echo -e "${GREEN}✓ Navegadores abiertos${NC}\n"
    else
        echo -e "${YELLOW}⚠ Por favor abre manualmente:${NC}"
        echo "  • HTML: http://localhost:5555"
        echo "  • React: http://localhost:7777"
        echo ""
    fi
}

# Menú principal
show_menu() {
    echo ""
    echo -e "${BLUE}Selecciona una opción:${NC}"
    echo "  1) Iniciar todos los servidores"
    echo "  2) Detener todos los servidores"
    echo "  3) Ver estado"
    echo "  4) Reiniciar todos"
    echo "  5) Abrir en navegador"
    echo "  6) Salir"
    echo ""
    read -p "Opción: " choice
    
    case $choice in
        1) start_all ;;
        2) stop_all ;;
        3) status ;;
        4) restart ;;
        5) open_servers ;;
        6) echo -e "${GREEN}¡Hasta luego!${NC}\n"; exit 0 ;;
        *) echo -e "${RED}Opción inválida${NC}" ;;
    esac
}

# Main
if [[ $# -eq 0 ]]; then
    # Modo interactivo
    while true; do
        show_menu
    done
else
    # Modo comando
    case $1 in
        start) start_all ;;
        stop) stop_all ;;
        restart) restart ;;
        status) status ;;
        open) open_servers ;;
        *) 
            echo "Uso: $0 {start|stop|restart|status|open}"
            echo ""
            echo "Ejemplos:"
            echo "  $0 start          # Inicia todos los servidores"
            echo "  $0 status         # Muestra estado"
            echo "  $0 stop           # Detiene todo"
            exit 1
            ;;
    esac
fi
print_banner() {
    echo -e "${BLUE}"
    echo "╔═══════════════════════════════════════════════════════╗"
    echo "║      🚀 RSExpress Server Control Script              ║"
    echo "╚═══════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_status() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

check_server() {
    if curl -s "$SERVER_URL/api/health" > /dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

check_proxy() {
    if curl -s -X POST "$PROXY_URL/jsonrpc" \
        -H "Content-Type: application/json" \
        -d '{"jsonrpc":"2.0","method":"call","params":{"service":"common","method":"version","args":[]},"id":1}' \
        > /dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

get_pids() {
    echo "$(lsof -ti:$PORT_SERVER 2>/dev/null || echo '')"
}

# Comandos

cmd_start() {
    print_banner
    print_status "Iniciando servidor y proxy..."
    
    if check_server; then
        print_warning "Servidor ya está corriendo en puerto $PORT_SERVER"
    else
        cd "$(dirname "$0")"
        npm run dev
    fi
}

cmd_stop() {
    print_banner
    print_status "Deteniendo servicios..."
    
    PIDS=$(get_pids)
    if [ -z "$PIDS" ]; then
        print_warning "No hay servidores corriendo"
    else
        print_status "Matando procesos: $PIDS"
        kill -9 $PIDS 2>/dev/null || true
        sleep 1
        
        if ! check_server; then
            print_success "Servidor detenido"
        else
            print_error "No se pudo detener el servidor"
            return 1
        fi
    fi
}

cmd_status() {
    print_banner
    
    echo -e "${BLUE}Estado del Servidor:${NC}"
    if check_server; then
        print_success "Servidor web en puerto $PORT_SERVER"
        echo "  URL: $SERVER_URL"
        echo "  Health: $(curl -s $SERVER_URL/api/health | jq .)"
    else
        print_error "Servidor web no está activo"
    fi
    
    echo ""
    echo -e "${BLUE}Estado del Proxy Odoo:${NC}"
    if check_proxy; then
        print_success "Proxy Odoo en puerto $PORT_PROXY"
        echo "  URL: $PROXY_URL/jsonrpc"
    else
        print_error "Proxy Odoo no está activo"
    fi
}

cmd_restart() {
    print_banner
    cmd_stop
    sleep 2
    cmd_start
}

cmd_logs() {
    print_banner
    print_status "Logs del servidor (últimas 50 líneas)..."
    echo ""
    
    PIDS=$(get_pids)
    if [ -z "$PIDS" ]; then
        print_error "Servidor no está corriendo"
    else
        echo "Procesos activos: $PIDS"
    fi
}

cmd_test() {
    print_banner
    print_status "Probando conexión a Odoo a través del proxy..."
    
    if ! check_proxy; then
        print_error "No se puede conectar al proxy"
        return 1
    fi
    
    print_success "Proxy respondiendo correctamente"
    
    print_status "Consultando versión de Odoo..."
    RESULT=$(curl -s -X POST "$PROXY_URL/jsonrpc" \
        -H "Content-Type: application/json" \
        -d '{"jsonrpc":"2.0","method":"call","params":{"service":"common","method":"version","args":[]},"id":1}')
    
    VERSION=$(echo "$RESULT" | jq -r '.result.server_version' 2>/dev/null || echo "desconocida")
    
    if [ "$VERSION" != "null" ] && [ ! -z "$VERSION" ]; then
        print_success "Versión de Odoo: $VERSION"
        echo "$RESULT" | jq '.'
    else
        print_error "No se pudo obtener versión de Odoo"
        echo "$RESULT" | jq '.'
        return 1
    fi
}

cmd_help() {
    print_banner
    echo "Comandos disponibles:"
    echo ""
    echo -e "${BLUE}  start${NC}     - Iniciar servidor y proxy"
    echo -e "${BLUE}  stop${NC}      - Detener servidor y proxy"
    echo -e "${BLUE}  restart${NC}   - Reiniciar servidor y proxy"
    echo -e "${BLUE}  status${NC}    - Mostrar estado de servicios"
    echo -e "${BLUE}  logs${NC}      - Mostrar logs"
    echo -e "${BLUE}  test${NC}      - Probar conexión a Odoo"
    echo -e "${BLUE}  help${NC}      - Mostrar esta ayuda"
    echo ""
    echo "Ejemplos:"
    echo "  ./server-control.sh start"
    echo "  ./server-control.sh status"
    echo "  ./server-control.sh test"
}

# Main
main() {
    COMMAND="${1:-help}"
    
    case "$COMMAND" in
        start)
            cmd_start
            ;;
        stop)
            cmd_stop
            ;;
        restart)
            cmd_restart
            ;;
        status)
            cmd_status
            ;;
        logs)
            cmd_logs
            ;;
        test)
            cmd_test
            ;;
        help|--help|-h)
            cmd_help
            ;;
        *)
            print_error "Comando desconocido: $COMMAND"
            cmd_help
            exit 1
            ;;
    esac
}

main "$@"
