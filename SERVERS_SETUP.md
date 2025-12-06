# 🚀 RSExpress - 3 Instancias de Servidor

## Arquitectura de Servidores

El proyecto RSExpress ahora tiene **3 instancias independientes**:

### 1️⃣ **Puerto 5555 - HTML Server (UI Testing)**
- **Propósito**: Servir archivos HTML estáticos para pruebas de UI
- **URL**: `http://localhost:5555`
- **Archivos disponibles**:
  - `/delivery-cards.html` - Dashboard de entregas
  - `/orders-from-crm.html` - Órdenes desde CRM
  - `/fleet-dashboard.html` - Dashboard de flota
  - `/deliveries-perez-zeledon.html` - Demo Pérez Zeledón
  - `/delivery-orders.html` - Órdenes de entrega

### 2️⃣ **Puerto 7777 - React App (Vite)**
- **Propósito**: Aplicación React moderna con Hot Reload
- **URL**: `http://localhost:7777`
- **Features**:
  - Hot Module Replacement (HMR)
  - TypeScript support
  - CSS modules
  - Optimized bundling
- **Componentes**:
  - OrdersFromCRM (Pedidos desde CRM)
  - DeliveryCards (Tarjetas de entrega)
  - FleetDashboard (Dashboard de flota)

### 3️⃣ **Puerto 9999 - Proxy Odoo**
- **Propósito**: Proxy JSON-RPC para Odoo 19
- **URL**: `http://localhost:9999`
- **Funcionalidades**:
  - Resuelve CORS
  - Actúa como intermediario con Odoo
  - Manejo de sesiones
  - Logging de solicitudes

---

## 🎯 Cómo Iniciar

### Opción 1: Iniciar Todo (Recomendado)
```bash
npm run dev
```
Inicia automáticamente:
- ✅ HTML Server (5555)
- ✅ React App (7777)
- ✅ Proxy Odoo (9999)

### Opción 2: Iniciar Servidores Individuales

**Solo HTML Server:**
```bash
npm run dev:html
# o
npm run server-html
```

**Solo React App:**
```bash
npm run dev:react
# o
npm run react
```

**Solo Proxy Odoo:**
```bash
npm run dev:proxy
# o
npm run proxy
```

### Opción 3: Script Bash (Control manual)
```bash
bash start-all-servers.sh
```

---

## 📋 Estructura de Archivos

```
RSExpress/
├── server.js                 # HTML Server (5555)
├── src/
│   ├── App.jsx              # React Router setup
│   ├── main.jsx             # Vite entry point
│   ├── pages/               # React page components
│   │   ├── OrdersFromCRM.jsx
│   │   ├── DeliveryCards.jsx
│   │   └── FleetDashboard.jsx
│   ├── hooks/               # Custom React hooks
│   │   ├── useOdoo.js
│   │   ├── useLeads.js
│   │   ├── useOrders.js
│   │   └── useFleet.js
│   ├── services/            # Business logic
│   │   ├── OdooConnectorService.js
│   │   ├── OrderManagerService.js
│   │   ├── DriverFleetService.js
│   │   └── TraccarService.js
│   └── styles/              # CSS modules
├── scripts/
│   └── odoo/
│       └── odoo-proxy.js    # Proxy Odoo (9999)
├── vite.config.js           # Vite configuration
├── package.json             # NPM scripts
└── index.html               # HTML root (React mount)
```

---

## 🔗 Flujo de Comunicación

```
[Cliente Navegador]
        ↓
    ┌───────────────────────────┐
    │  http://localhost:5555    │ (HTML UI Testing)
    │  - Archivos estáticos    │
    └───────────────────────────┘
        ↓
    ┌───────────────────────────┐
    │  http://localhost:7777    │ (React App)
    │  - Componentes React      │
    │  - Hot Reload Vite        │
    └───────────────────────────┘
        ↓
    ┌───────────────────────────┐
    │  http://localhost:9999    │ (Proxy Odoo)
    │  - JSON-RPC Odoo          │
    │  - CORS Resolution        │
    └───────────────────────────┘
        ↓
    ┌───────────────────────────┐
    │  rsexpress.online         │ (Odoo 19 Production)
    │  - API endpoints          │
    │  - Database               │
    └───────────────────────────┘
```

---

## 🛠️ Desarrollo

### Workflow típico:
1. **Desarrollo de UI**: Edita archivos HTML en `5555`
2. **Desarrollo React**: Edita componentes en `src/` → se recarga automáticamente en `7777`
3. **Pruebas de API**: Usa `9999` para solicitudes Odoo
4. **Combinación**: Prueba integración entre React y HTML

### Scripts NPM disponibles:
```bash
npm run dev              # Inicia todo
npm run dev:html        # Solo HTML
npm run dev:react       # Solo React
npm run dev:proxy       # Solo Proxy
npm run vite:build      # Build React production
npm run vite:preview    # Preview build
```

---

## 🔧 Configuración

### Cambiar puertos
Edita estas variables en:
- **server.js** (línea 15-17): `PORT_HTML`, `PORT_REACT`, `PORT_ODOO`
- **vite.config.js** (línea 19): `port: 7777`
- **scripts/odoo/odoo-proxy.js** (línea 10): `PROXY_PORT`

### Cambiar host Odoo
En **scripts/odoo/odoo-proxy.js** (línea 8):
```javascript
const ODOO_HOST = 'rsexpress.online'; // Cambiar aquí
```

---

## 📊 Monitoreo

### Ver procesos activos:
```bash
lsof -i :5555    # HTML Server
lsof -i :7777    # React App
lsof -i :9999    # Proxy Odoo
```

### Matar procesos específicos:
```bash
kill $(lsof -t -i :5555)   # Matar HTML Server
kill $(lsof -t -i :7777)   # Matar React App
kill $(lsof -t -i :9999)   # Matar Proxy Odoo
```

---

## ✅ Checklist de Validación

- [ ] HTML Server accesible en `http://localhost:5555`
- [ ] React App accesible en `http://localhost:7777`
- [ ] Proxy Odoo accesible en `http://localhost:9999`
- [ ] Hot reload funcionando en React
- [ ] Conexión a Odoo establecida
- [ ] CORS resuelto en proxy
- [ ] Componentes React renderizan correctamente
- [ ] Estilos CSS aplicados

---

## 🐛 Troubleshooting

**"Puerto X ya está en uso"**
```bash
# Matar proceso
kill -9 $(lsof -t -i :PUERTO)
```

**"Cannot find module" en React**
- Verifica que `vite.config.js` tenga los alias correctos
- Ejecuta: `npm install`

**Odoo proxy no se conecta**
- Verifica `ODOO_HOST` en `scripts/odoo/odoo-proxy.js`
- Comprueba conexión: `curl https://rsexpress.online/`

**Hot Reload no funciona**
- Reinicia: `npm run dev`
- Limpia cache: `rm -rf node_modules/.vite`

---

## 📝 Notas

- El servidor HTML (5555) es importante para pruebas de componentes individuales
- El servidor React (7777) es la aplicación principal
- El proxy Odoo (9999) es crítico para las operaciones CRM
- Todos los servidores se detienen simultáneamente con CTRL+C

**Última actualización**: Diciembre 6, 2025
**Versión**: 2.0.0
