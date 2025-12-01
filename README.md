# 📦 RSExpress - Sistema de Gestión de Pedidos y Entregas

**Integración Odoo CRM + Gestión de Flota + Entregas**

## 🚀 Descripción Rápida

RSExpress es un sistema completo para:
- 📋 Convertir leads de Odoo CRM en pedidos
- 🚗 Gestionar flota de vehículos
- 📍 Rastrear entregas en tiempo real
- 👨‍✈️ Asignar conductores y rutas
- 📊 Ver dashboards y estadísticas

## 🌐 Acceso Rápido

### Interfaces Web
- **Gestor de Pedidos**: http://localhost:5555/orders-from-crm.html
- **Dashboard de Flota**: http://localhost:5555/fleet-dashboard.html
- **Cola de Entregas**: http://localhost:5555/test-delivery-queue.html

### Servicios
- **OdooProxy**: http://localhost:9999/jsonrpc
- **API HTTP**: http://localhost:5555

## 📚 Documentación

Toda la documentación está organizada en `/docs/`:

### 🔧 Configuración
- [JSON_RPC_CONFIG.md](docs/JSON_RPC_CONFIG.md) - Configuración JSON-RPC
- [CONFIGURACION_FINAL.md](docs/CONFIGURACION_FINAL.md) - Checklist de configuración
- [ODOO_INTEGRATION_COMPLETE.md](docs/ODOO_INTEGRATION_COMPLETE.md) - Integración con Odoo

### 📖 Guías
- [FLEET_DASHBOARD_GUIA.md](docs/FLEET_DASHBOARD_GUIA.md) - Cómo usar el dashboard de flota
- [GUIA_VERIFICACION_FLOTA.md](docs/GUIA_VERIFICACION_FLOTA.md) - Verificación de flota
- [PROXY_INTEGRATION_SUMMARY.md](docs/PROXY_INTEGRATION_SUMMARY.md) - Resumen integración proxy

### 🎯 Características
- [FLEET_DASHBOARD_README.md](docs/FLEET_DASHBOARD_README.md) - Features del dashboard
- [QUEUE_SYSTEM_COMPLETE.md](docs/QUEUE_SYSTEM_COMPLETE.md) - Sistema de cola
- [SINCRONIZACION_EN_VIVO.md](docs/SINCRONIZACION_EN_VIVO.md) - Sincronización en vivo

### 🚚 Rastreo
- [TRACCAR_README.md](docs/TRACCAR_README.md) - Rastreo con Traccar
- [TRACCAR_INTEGRATION.md](docs/TRACCAR_INTEGRATION.md) - Integración Traccar
- [TRACCAR_IMPLEMENTATION.md](docs/TRACCAR_IMPLEMENTATION.md) - Implementación Traccar

### 📦 Entregas
- [DELIVERIES_CLICKABLE.md](docs/DELIVERIES_CLICKABLE.md) - Entregas clickeables
- [SHIPMENTS_ROUTES_FREIGHT.md](docs/SHIPMENTS_ROUTES_FREIGHT.md) - Rutas y envíos

### 🔍 Verificación
- [VERIFICACION_JSON_RPC.md](docs/VERIFICACION_JSON_RPC.md) - Tests de RPC
- [QUICK_VERIFICATION.md](docs/QUICK_VERIFICATION.md) - Verificación rápida

## 🛠️ Instalación Rápida

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servicios
node start-services.js

# 3. Abrir en navegador
open http://localhost:5555/orders-from-crm.html
```

## 📋 Requisitos

- Node.js 14+
- Odoo 19 (rsexpress.online)
- Navegador moderno (Chrome, Firefox, Safari)
- Puerto 5555 disponible (HTTP)
- Puerto 9999 disponible (OdooProxy)

## 🔑 Credenciales

```javascript
// Configuración Odoo
Database: odoo19
UID: 5
Token: 1fc63a72dcf97e88aab89c5a8a54dc0eac25cb9b
URL: https://rsexpress.online/jsonrpc
```

## 📁 Estructura

```
RSExpress/
├── docs/                          # 📚 Documentación (27 archivos)
├── assets/                        # 🎨 CSS, imágenes, fuentes
├── *.html                         # 🌐 Interfaces web
├── *.js                           # 🔧 Lógica backend
├── start-services.js              # 🚀 Punto de entrada
└── package.json                   # 📦 Dependencias
```

## 🎯 Funcionalidades Principales

### ✅ Módulo Odoo CRM
- Conectar a Odoo automáticamente
- Obtener leads del CRM
- Crear pedidos desde leads
- Auto-detectar proxy local
- Sincronización en tiempo real

### ✅ Gestor de Flota
- Dashboard de vehículos
- Asignación de conductores
- Rutas optimizadas
- Estado de vehículos en vivo
- Historial de viajes

### ✅ Sistema de Entregas
- Cola de espera
- Asignación automática
- Rastreo GPS
- Cambio de estado
- Notificaciones

### ✅ Rastreo
- Integración Traccar
- Localización en tiempo real
- Historial de movimientos
- Geofencing

## 🚀 Comandos Útiles

```bash
# Iniciar servidor
node start-services.js

# Ver logs
tail -f proxy.log

# Buscar errores
grep "ERROR" proxy.log

# Reiniciar servidor
pkill -f "node start-services"; sleep 2; node start-services.js

# Ver puertos activos
netstat -tlnp | grep node
```

## 🐛 Troubleshooting

### "No se puede conectar a Odoo"
→ Verificar QUICK_VERIFICATION.md

### "Error de RPC"
→ Ver JSON_RPC_CONFIG.md

### "Puerto ya en uso"
→ Cambiar puerto en start-services.js

## 📞 Soporte

Para más información, consulta la documentación en `/docs/`.

## 📅 Última Actualización

**Diciembre 1, 2025**

---

**Made with ❤️ for RSExpress**
