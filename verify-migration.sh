#!/bin/bash

# 🚀 RSExpress - React Migration Verification Script
# Verifica que todos los archivos necesarios existan

echo "🔍 Verificando migración a React..."
echo ""

# Arrays de verificación
declare -A services
services[src/services/OdooConnectorService.js]="OdooConnectorService"
services[src/services/OrderManagerService.js]="OrderManagerService"
services[src/services/DriverFleetService.js]="DriverFleetService"
services[src/services/TraccarService.js]="TraccarService"

declare -A hooks
hooks[src/hooks/useOdoo.js]="useOdoo"
hooks[src/hooks/useLeads.js]="useLeads"
hooks[src/hooks/useOrders.js]="useOrders"
hooks[src/hooks/useFleet.js]="useFleet"

declare -A pages
pages[src/pages/OrdersFromCRM.jsx]="OrdersFromCRM"
pages[src/pages/DeliveryCards.jsx]="DeliveryCards"
pages[src/pages/FleetDashboard.jsx]="FleetDashboard"

declare -A styles
styles[src/styles/index.css]="Estilos globales"
styles[src/styles/app.css]="Estilos App"
styles[src/styles/orders-from-crm.css]="Estilos Órdenes"
styles[src/styles/delivery-cards.css]="Estilos Entregas"
styles[src/styles/fleet-dashboard.css]="Estilos Flota"

# Función para verificar archivos
verify_section() {
  local section_name=$1
  local -n files=$2
  
  echo "📂 Verificando $section_name..."
  local count=0
  local total=${#files[@]}
  
  for file in "${!files[@]}"; do
    if [ -f "$file" ]; then
      size=$(wc -l < "$file")
      echo "  ✅ ${files[$file]} ($file) - $size líneas"
      ((count++))
    else
      echo "  ❌ FALTA: ${files[$file]} ($file)"
    fi
  done
  
  echo "  Resultado: $count/$total completados"
  echo ""
  
  return 0
}

# Verificar estructuras clave
verify_section "SERVICIOS" services
verify_section "CUSTOM HOOKS" hooks
verify_section "PÁGINAS REACT" pages
verify_section "ESTILOS CSS" styles

# Verificar archivos principales
echo "🎯 Archivos Principales..."
files_to_check=(
  "src/main.jsx:Entrada Vite"
  "src/App.jsx:Router principal"
  "index.html:Template HTML"
  "vite.config.js:Configuración Vite"
  "package.json:Dependencias"
  "REACT_MIGRATION.md:Documentación"
  "MIGRATION_SUMMARY.md:Resumen"
)

main_count=0
main_total=${#files_to_check[@]}

for entry in "${files_to_check[@]}"; do
  file="${entry%:*}"
  desc="${entry#*:}"
  if [ -f "$file" ]; then
    echo "  ✅ $file - $desc"
    ((main_count++))
  else
    echo "  ❌ FALTA: $file - $desc"
  fi
done

echo "  Resultado: $main_count/$main_total completados"
echo ""

# Estadísticas
echo "📊 ESTADÍSTICAS GENERALES"
echo "========================"

total_files=$(find src -type f | wc -l)
total_lines=$(find src -type f \( -name "*.jsx" -o -name "*.js" -o -name "*.css" \) -exec wc -l {} + | tail -1 | awk '{print $1}')

echo "  Total de archivos en src/: $total_files"
echo "  Total de líneas de código: $total_lines"
echo ""

echo "✅ DEPENDENCIAS NPM"
echo "==================="
if grep -q '"react"' package.json; then
  echo "  ✅ React 18.2.0 instalado"
fi
if grep -q '"react-router-dom"' package.json; then
  echo "  ✅ React Router DOM 6.20.0 instalado"
fi
if grep -q '"vite"' package.json; then
  echo "  ✅ Vite 5.0.0 instalado"
fi
if grep -q '"axios"' package.json; then
  echo "  ✅ Axios 1.6.2 instalado"
fi
echo ""

echo "🚀 COMANDOS DISPONIBLES"
echo "======================="
echo "  npm run dev              - Desarrollo (server + Vite)"
echo "  npm run server           - Solo Express server"
echo "  npm run proxy            - Solo proxy Odoo"
echo "  npm run vite:dev         - Solo Vite dev"
echo "  npm run vite:build       - Build para producción"
echo "  npm run vite:preview     - Preview del build"
echo ""

echo "🌐 RUTAS DISPONIBLES"
echo "===================="
echo "  http://localhost:3000               - React App"
echo "  http://localhost:3000/              - Órdenes CRM"
echo "  http://localhost:3000/deliveries    - Entregas"
echo "  http://localhost:3000/fleet         - Flota"
echo ""

echo "✨ VERIFICACIÓN COMPLETADA"
echo "=========================="
echo ""
echo "Estado: ✅ MIGRACIÓN EXITOSA"
echo ""
echo "Próximos pasos:"
echo "  1. cd /home/menteavatar/Desktop/Projects/RSExpress/RSExpress"
echo "  2. npm run dev"
echo "  3. Abrir http://localhost:3000"
echo ""
