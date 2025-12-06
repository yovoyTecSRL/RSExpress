# 📁 Estructura del Repositorio RSExpress

## Organización Actual

```
RSExpress/
│
├── 📚 docs/                          # Documentación completa
│   ├── index.md                     # Índice principal de documentación
│   ├── ESTRUCTURA.md                # Este archivo
│   ├── logs/                        # Logs del sistema
│   └── *.md                         # Documentación temática (45+ archivos)
│
├── 🌐 Páginas HTML Principales
│   ├── index.html                   # Home
│   ├── orders-from-crm.html        # ⭐ Órdenes desde CRM (AUTO-LOAD)
│   ├── delivery-cards.html          # Tarjetas de entrega
│   ├── delivery-card-demo.html      # Demo de tarjetas
│   ├── delivery-orders.html         # Órdenes de entrega
│   ├── deliveries-perez-zeledon.html # Entregas Pérez Zeledón
│   └── fleet-dashboard.html         # Dashboard de flota
│
├── 🔧 Scripts
│   ├── scripts/
│   │   ├── odoo/
│   │   │   ├── odoo-connector.js    # ⭐ Conector Odoo mejorado
│   │   │   ├── odoo-proxy.js        # ⭐ Proxy en puerto 9999
│   │   │   ├── odoo-integration-v2.js
│   │   │   ├── order-manager.js     # Gestor de órdenes
│   │   │   └── README.md            # Guía de scripts
│   │   │
│   │   └── fleet/
│   │       ├── driver-fleet-panel.js # Dashboard conductores
│   │       └── ...
│   │
│   └── test/                        # Tests (25+ archivos)
│
├── 🎨 Recursos
│   ├── assets/                      # Imágenes, iconos, etc
│   ├── styles.css                   # CSS global
│   └── ...
│
├── 🚀 Servidor
│   ├── server.js                    # ⭐ Servidor Express (auto-inicia proxy)
│   ├── server-control.sh            # 🔧 Helper de control
│   └── package.json                 # 📦 Dependencias npm
│
└── 📋 Configuración
    ├── .gitignore                   # Archivos ignorados por git
    ├── ROOT_README.md               # Este README
    └── ...
```

## 📊 Resumen por Categorías

### 📚 Documentación (45+ archivos en `docs/`)

**Inicios Rápidos:**
- README_SERVIDOR.md
- PROXY_9999_SETUP_COMPLETE.md
- ACTUALIZACION_COMPLETADA.md

**Integración Odoo:**
- ORDERS_CRM_INTEGRATION_COMPLETED.md
- ODOO_INTEGRATION_ANALYSIS.md
- IMPROVEMENT_PLAN.md

**Entregas:**
- ENTREGAS_PEREZ_ZELEDON.md
- DELIVERY_CARDS_IMPLEMENTATION.md
- README_DELIVERY_CARDS.md

**Flota:**
- FLEET_DASHBOARD_README.md
- DRIVER_POSITIONING_COMPLETED.md

**Y muchos más...**

### 🌐 Páginas HTML (7 archivos)

```
✅ index.html ........................ Home
✅ orders-from-crm.html ............ ⭐ Órdenes (carga automática)
✅ delivery-cards.html ............. Tarjetas
✅ delivery-card-demo.html ......... Demo
✅ delivery-orders.html ............ Órdenes
✅ deliveries-perez-zeledon.html ... Entregas Pérez Zeledón
✅ fleet-dashboard.html ............ Dashboard Flota
```

### 🔧 Scripts JavaScript

**Odoo Integration:**
- odoo-connector.js (546 líneas) - ⭐ Conector mejorado
- odoo-proxy.js (128 líneas) - Proxy JSON-RPC
- order-manager.js (324 líneas) - Gestor de órdenes
- odoo-integration-v2.js (318 líneas) - V2 del conector

**Fleet:**
- driver-fleet-panel.js (496 líneas) - Dashboard conductores

**Otros:**
- shipments-examples.js
- traccar.js
- traccar-examples.js
- etc.

### 🧪 Tests (25+ archivos en `test/`)

- test-odoo-*.js - Pruebas de conexión Odoo
- test-delivery-*.js - Pruebas de entregas
- test-fleet-*.html - Pruebas de flota
- etc.

## 🎯 Archivos Críticos

### ⭐ Más Importantes

1. **server.js** - Servidor Express con auto-start de proxy
2. **scripts/odoo/odoo-connector.js** - Conector Odoo mejorado
3. **scripts/odoo/odoo-proxy.js** - Proxy en puerto 9999
4. **orders-from-crm.html** - Interfaz principal de órdenes
5. **package.json** - Configuración npm

### 📦 Dependencias

```json
{
  "express": "^4.18.2",
  "cors": "^2.8.5",
  "xmlrpc": "^1.3.2",
  "concurrently": "^8.2.0"
}
```

## 🚀 Rutas y Puertos

```
Servidor Web:  http://localhost:5555
  ├─ / ........................... Home
  ├─ /orders-from-crm.html ...... Órdenes (carga automática)
  ├─ /delivery-cards.html ....... Tarjetas
  ├─ /fleet-dashboard.html ...... Dashboard Flota
  ├─ /api/health ................ Health check
  └─ /api/info .................. Info servidor

Proxy Odoo: http://localhost:9999
  └─ /jsonrpc ................... JSON-RPC endpoint
       ↓ redirecciona a
  Odoo 19: rsexpress.online:443
```

## 📊 Estadísticas del Proyecto

```
📄 Archivos HTML: 7
📄 Scripts JS: 20+
📄 Tests: 25+
📚 Documentación: 45+ archivos markdown
📦 Dependencias npm: 4 principales
💾 Tamaño estimado: ~5MB (sin node_modules)
```

## 🎛️ Configuración

### Variables Importantes

**Odoo (en scripts/odoo/odoo-connector.js):**
```javascript
{
    database: 'odoo19',
    uid: 5,
    token: '1fc63a72dcf97e88aab89c5a8a54dc0eac25cb9b',
    url: 'http://localhost:9999'  // Proxy local
}
```

**Servidor (en server.js):**
```javascript
const PORT = 5555;
const PROXY_PORT = 9999;
```

## 🔐 Seguridad

- CORS: Habilitado para localhost
- Token: Guardado en odoo-connector.js
- .gitignore: Configurado correctamente

## 📝 Flujo de Datos

```
1. Usuario abre http://localhost:5555/orders-from-crm.html
   ↓
2. JavaScript ejecuta DOMContentLoaded
   ↓
3. Llama a connectToOdoo()
   ↓
4. OdooConnector detecta proxy local
   ↓
5. Realiza llamadas a http://localhost:9999/jsonrpc
   ↓
6. Proxy redirecciona a rsexpress.online:443
   ↓
7. Odoo 19 responde con datos
   ↓
8. Interfaz se actualiza con leads
```

## ✅ Verificación

### Estructura OK
```bash
✅ docs/ existe con 45+ documentos
✅ docs/logs/ existe para logs
✅ scripts/odoo/ tiene archivos principales
✅ HTML principal en raíz
✅ server.js con auto-proxy
✅ package.json actualizado
```

### Funcionalidad OK
```bash
✅ npm run dev inicia servidor + proxy
✅ http://localhost:5555 accesible
✅ http://localhost:9999/jsonrpc funciona
✅ orders-from-crm.html carga automáticamente leads
✅ CORS habilitado
```

## 🎓 Flujo de Desarrollo

Para agregar nueva funcionalidad:

1. Crear HTML en raíz
2. Agregar scripts en `scripts/`
3. Documentar en `docs/`
4. Agregar tests en `test/`
5. Actualizar `package.json` si necesita dependencias
6. Probar con `npm run dev`

## 🚀 Próximos Pasos

- [ ] Agregar autenticación
- [ ] Mejorar logging
- [ ] Agregar métricas
- [ ] Optimizar performance
- [ ] Agregar más tests

---

**Última actualización:** Diciembre 5, 2025
**Versión:** 2.0.0
**Estado:** ✅ Organizado y Limpio
