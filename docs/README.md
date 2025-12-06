# 📦 RSExpress - Sistema de Gestión de Entregas

Sistema completo de gestión de entregas con seguimiento en tiempo real, cálculo de tarifas automático y dashboards interactivos.

## 🚀 Quick Start

```bash
# Instalar dependencias
npm install

# Iniciar servidor
npm start

# Abrir en navegador
http://localhost:5555/delivery-cards.html
```

## 📁 Estructura del Proyecto

```
RSExpress/
├── 📄 index.html                    # Página principal
├── 📄 delivery-cards.html           # Sistema de entregas principal
├── 📄 delivery-orders.html          # Gestión de órdenes
├── 📄 fleet-dashboard.html          # Dashboard de flota
├── 🔧 server.js                     # Servidor Node.js
├── 📂 scripts/                      # Scripts de utilidades
│   └── utils/
│       ├── delivery-card.js         # Componente de tarjeta
│       └── ...
├── 🎨 assets/                       # Estilos y recursos
│   ├── delivery-card.css
│   └── ...
├── 📚 docs/                         # Documentación completa
│   ├── README.md                    # Documentación principal
│   ├── ÍNDICE.md                    # Índice de documentación
│   └── logs/                        # Archivos de log
└── package.json                     # Dependencias
```

## 📚 Documentación

Toda la documentación completa está en la carpeta [`docs/`](docs/):

- **[README completo](docs/README.md)** - Documentación principal
- **[Índice de documentación](docs/ÍNDICE.md)** - Guía completa de módulos
- **[Guía de Inicio Rápido](docs/QUICK_START_DELIVERY_CARDS.txt)** - Pasos para comenzar
- **[Integración de Tarifas](docs/README_TARIFAS.md)** - Sistema de cálculo de tarifas
- **[Integración ODOO](docs/ODOO_INTEGRATION_COMPLETE.md)** - Conexión con ODOO

## 🎯 Características Principales

### 📦 Sistema de Entregas
- Gestión completa de entregas
- Estados en tiempo real (Pendiente, En Tránsito, Entregada, Fallida)
- Filtros avanzados y búsqueda
- Visualización de rutas con Leaflet.js
- Notas y historial de eventos

### 💰 Sistema de Tarifas
- Cálculo automático de costos
- Tarifas por distancia
- Factores de multiplicación por prioridad
- Integración con ShippingCalculator

### 🗺️ Seguimiento de Flotas
- Dashboard de flotas en vivo
- Posicionamiento de conductores
- Monitoreo de rutas
- Integración con Traccar

### 👥 Integración ODOO
- Sincronización de clientes
- Órdenes desde CRM
- Proxy JSON-RPC
- Actualización bidireccional

## 🔧 Tecnologías Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Backend**: Node.js
- **Mapas**: Leaflet.js, OpenStreetMap
- **Iconos**: FontAwesome 6.4.0
- **Estilos**: Glass Morphism, Gradientes

## 🌐 Rutas Disponibles

| URL | Descripción |
|-----|-------------|
| `/` | Página principal |
| `/delivery-cards.html` | Sistema de entregas |
| `/delivery-orders.html` | Gestión de órdenes |
| `/fleet-dashboard.html` | Dashboard de flota |
| `/deliveries-perez-zeledon.html` | Demo: Entregas Pérez Zeledón |

## 📝 Configuración

Archivo `package.json`:
```json
{
  "name": "RSExpress",
  "version": "2.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  }
}
```

## 🔐 Seguridad

- Variables de entorno en `.env`
- CORS configurado
- Headers de seguridad
- Validación de entrada

## 📊 Base de Datos

El sistema utiliza datos de ejemplo en memoria. Para producción, integrar con:
- MongoDB
- PostgreSQL
- MySQL
- ODOO

## 🚀 Deploy

```bash
# Build para producción
npm run build

# Start en modo producción
NODE_ENV=production npm start
```

## 📞 Soporte

Para reportar bugs o solicitar features, ver la carpeta [`docs/`](docs/) para contacto y detalles.

## 📄 Licencia

Propiedad de YOVOYTECH SRL

## 🙏 Créditos

Desarrollado por YOVOYTECH SRL - Soluciones en Logística y Transporte

---

**Última actualización**: 3 de Diciembre, 2025
