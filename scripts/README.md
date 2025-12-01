# 📁 Scripts - Módulos de RSExpress

Todos los scripts están organizados por función:

## 📂 Estructura

```
scripts/
├── core/                  # 🎯 Servicios principales
│   ├── app.js            # Servidor HTTP principal
│   └── start-services.js # Punto de entrada
├── odoo/                 # 🔌 Integración Odoo CRM
│   ├── odoo-connector.js     # Conector JSON-RPC
│   ├── odoo-proxy.js         # Proxy CORS
│   ├── odoo-integration.js   # Integración
│   ├── odoo-integration-v2.js # V2
│   └── order-manager.js      # Gestor de pedidos
├── fleet/                # 🚗 Gestión de flota
│   ├── fleet-dashboard.js
│   ├── fleet-integration.js
│   ├── fleet-map-controller.js
│   ├── fleet-realtime-watcher.js
│   ├── fleet-view-reflection.js
│   ├── driver-fleet-panel.js
│   ├── live-fleet-sync.js
│   ├── route-optimizer.js
│   ├── route-map-visualizer.js
│   ├── verificador-flota.js
│   └── debug-flota*.js
├── traccar/              # 📍 Rastreo GPS
│   ├── traccar.js
│   ├── traccar-config.js
│   └── traccar-examples.js
└── utils/                # 🛠️ Utilidades
    ├── debug-console.js
    └── shipments-examples.js
```

## 🚀 Uso

### Iniciar servicios
```bash
node scripts/core/start-services.js
```

### En HTML (desde raíz)
```html
<!-- Odoo -->
<script src="scripts/odoo/odoo-connector.js"></script>

<!-- Fleet -->
<script src="scripts/fleet/fleet-dashboard.js"></script>

<!-- Traccar -->
<script src="scripts/traccar/traccar.js"></script>
```

### En HTML (desde /test)
```html
<!-- Sube un nivel para acceder a scripts -->
<script src="../scripts/fleet/driver-fleet-panel.js"></script>
```

## 🔧 Módulos

### Core
- `app.js`: Servidor HTTP, rutas, controladores
- `start-services.js`: Inicia proxy + servicios

### Odoo
- `odoo-connector.js`: JSON-RPC client a Odoo
- `odoo-proxy.js`: Proxy CORS para localhost:9999
- `odoo-integration*.js`: Integración con vistas
- `order-manager.js`: Lógica de pedidos

### Fleet
- `fleet-*.js`: Dashboard, sincronización, mapas
- `driver-*.js`: Controladores de conductores
- `route-*.js`: Optimización y visualización de rutas
- `live-*.js`: Actualizaciones en tiempo real

### Traccar
- `traccar.js`: Cliente GPS
- `traccar-config.js`: Configuración
- `traccar-examples.js`: Ejemplos de uso

### Utils
- `debug-console.js`: Consola de debug
- `shipments-examples.js`: Ejemplos de envíos

## 📦 Dependencias

- Node.js (para `/core/start-services.js`)
- navegador moderno (para archivos HTML)

## 🐛 Troubleshooting

### "Cannot find module"
Verificar rutas relativas desde el archivo que importa

### "CORS error"
Verificar que proxy esté corriendo: `http://localhost:9999`

### "Script not loading"
Verificar rutas en HTML (raíz vs /test)

