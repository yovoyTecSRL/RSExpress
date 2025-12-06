#!/bin/bash

# 🚀 RSExpress Server Control Script
# Facilita iniciar, detener y monitorear el servidor

set -e

PORT_SERVER=5555
PORT_PROXY=9999
SERVER_URL="http://localhost:$PORT_SERVER"
PROXY_URL="http://localhost:$PORT_PROXY"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funciones helper
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
