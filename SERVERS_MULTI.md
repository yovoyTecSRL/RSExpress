# 🚀 RSExpress - Configuración de 3 Servidores

## Estructura Multi-Servidor

RSExpress funciona con **3 servidores simultáneamente**:

| Puerto | Servidor | Función | URL |
|--------|----------|---------|-----|
| **5555** | 📄 HTML Server | Sirve archivos HTML estáticos y demos | http://localhost:5555 |
| **7777** | ⚛️ React App | Aplicación React con Vite (hot reload) | http://localhost:7777 |
| **9999** | 🔀 Odoo Proxy | Proxy JSON-RPC para Odoo 19 (sin CORS) | http://localhost:9999 |

---

## 🎯 Inicio Rápido

### Opción 1: Comando Único (Recomendado)
```bash
npm run dev
# O
npm run start
```

Esto inicia los 3 servidores simultáneamente con `concurrently`.

### Opción 2: Control Manual
```bash
# Permisos de ejecución (primera vez)
chmod +x server-control.sh

# Modo interactivo
./server-control.sh

# O comandos específicos
./server-control.sh start    # Inicia todo
./server-control.sh status   # Ver estado
./server-control.sh stop     # Detener todo
./server-control.sh restart  # Reiniciar
./server-control.sh open     # Abrir navegadores
```

### Opción 3: Terminal Separadas
```bash
# Terminal 1: HTML Server (5555)
npm run server:html

# Terminal 2: React App (7777)
npm run server:react

# Terminal 3: Proxy (9999)
npm run server:proxy
```

---

## 📄 Puerto 5555 - HTML Server

**Función**: Sirve archivos HTML estáticos, demostraciones y assets.

### Archivos Disponibles
- `http://localhost:5555/delivery-cards.html` - Dashboard de entregas
- `http://localhost:5555/delivery-card-demo.html` - Demo visual de cards
- `http://localhost:5555/orders-from-crm.html` - Órdenes desde CRM (versión HTML)
- `http://localhost:5555/fleet-dashboard.html` - Panel de flota

### Casos de Uso
- ✅ Pruebas de HTML/CSS
- ✅ Visualización de componentes
- ✅ Testing de assets estáticos
- ✅ Demostraciones sin React

---

## ⚛️ Puerto 7777 - React App

**Función**: Aplicación React moderna con Vite (hot reload automático).

### Rutas Disponibles
- `http://localhost:7777/` - Home
- `http://localhost:7777/orders` - Órdenes desde CRM (React)
- `http://localhost:7777/deliveries` - Gestión de entregas
- `http://localhost:7777/fleet` - Panel de flota

### Características
- ✅ Hot reload en desarrollo
- ✅ React Router para navegación
- ✅ Conexión a Odoo Proxy (9999)
- ✅ CSS moderno con animaciones
- ✅ Responsive design

### Scripts
```bash
npm run server:react     # Iniciar solo React
npm run vite:dev        # Iniciar Vite (alternativo)
npm run vite:build      # Build para producción
```

---

## 🔀 Puerto 9999 - Odoo Proxy

**Función**: Proxy JSON-RPC que comunica con Odoo 19 sin problemas de CORS.

### Endpoints
- `POST http://localhost:9999/jsonrpc` - Llamadas JSON-RPC

### Configuración
- Archivo: `scripts/odoo/odoo-proxy.js`
- Variables de entorno necesarias:
  ```
  ODOO_URL=http://your-odoo-server.com
  ODOO_DATABASE=odoo19
  ODOO_UID=2
  ODOO_TOKEN=your-token
  ```

### Casos de Uso
- ✅ Consulta de leads/órdenes
- ✅ Sincronización de datos
- ✅ Integración con Odoo 19

---

## 🔧 Configuración Avanzada

### Cambiar Puertos
Edita `vite.config.js` y `server.js`:

```javascript
// vite.config.js
server: {
  port: 7777,  // Cambiar aquí
  ...
}

// server.js
const PORT_HTML = 5555;  // Cambiar aquí
```

### Proxies desde React
Configurados en `vite.config.js`:

```javascript
proxy: {
  '/api': {
    target: 'http://localhost:5555',
    changeOrigin: true,
  },
  '/jsonrpc': {
    target: 'http://localhost:9999',
    changeOrigin: true,
  },
}
```

---

## 📊 Monitoreo

### Ver Estado de Puertos
```bash
lsof -i :5555    # Verificar 5555
lsof -i :7777    # Verificar 7777
lsof -i :9999    # Verificar 9999
```

### Ver Logs
```bash
# En el script interactivo, seleccionar opción 3 (status)
./server-control.sh status
```

---

## 🚨 Troubleshooting

### Puerto ya en uso
```bash
# Liberar puerto (ejemplo para 7777)
lsof -ti :7777 | xargs kill -9

# O usar el script
./server-control.sh stop
```

### React no conecta a Odoo
- Verificar que proxy está corriendo en 9999
- Revisar configuración de Odoo en `.env` o `scripts/odoo/odoo-proxy.js`
- Ver logs en consola del proxy

### HTML Server no sirve archivos
- Verificar que los archivos existen en `/`
- Revisar permisos de lectura
- Revisar ruta en `server.js`

---

## 📝 Desarrollo Típico

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar todos los servidores
npm run dev

# 3. Abrir en navegador
# - HTML: http://localhost:5555/delivery-cards.html
# - React: http://localhost:7777
# - Proxy: http://localhost:9999 (sin interfaz)

# 4. Editar código y hot reload automático en 7777

# 5. Cuando termines
./server-control.sh stop
```

---

## 🎯 Arquitectura de Comunicación

```
┌──────────────────────────────────────────────────────┐
│                Browser / Cliente                      │
└─────────────────────┬──────────────────────────────┘
          │            │            │
    5555  │       7777 │       9999 │
    (GET) │   (React)  │  (Proxy)   │
          │            │            │
          ▼            ▼            ▼
    ┌─────────┐  ┌────────┐  ┌──────────┐
    │  HTML   │  │ React  │  │  Odoo    │
    │ Server  │  │  App   │  │  Proxy   │
    └─────────┘  └────────┘  └──────────┘
          │            │            │
          │     /api   │   /jsonrpc │
          │     Proxy  ├────────────┤
          │            │            │
          └────────────┴────────────┘
                       │
                  ┌────▼─────┐
                  │   Odoo   │
                  │    19    │
                  └──────────┘
```

---

## 📦 Dependencias Necesarias

```json
{
  "express": "^4.18.2",
  "concurrently": "^8.2.0",
  "vite": "^5.0.0",
  "@vitejs/plugin-react": "^4.2.0",
  "react": "^18.2.0",
  "react-router-dom": "^6.20.0"
}
```

Instala con: `npm install`

---

## 🔗 Enlaces Útiles

- **React App**: http://localhost:7777
- **HTML Server**: http://localhost:5555
- **Odoo Proxy**: http://localhost:9999/jsonrpc (POST)
- **Configuración**: `server-config.js`
- **Script Control**: `server-control.sh`

---

**Última actualización**: Diciembre 2025
