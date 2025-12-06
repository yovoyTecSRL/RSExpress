# 🚀 RSExpress

Sistema integrado de gestión de pedidos, entregas y flota con integración a Odoo 19.

## ⚡ Inicio Rápido

```bash
# Instalar dependencias
npm install

# Iniciar servidor + proxy Odoo
npm run dev

# En navegador:
http://localhost:5555
```

## 📁 Estructura

```
RSExpress/
├── docs/                 # 📚 Documentación completa
│   ├── index.md         # Índice de documentación
│   └── logs/            # Logs del sistema
├── scripts/             # 🔧 Scripts y módulos
│   ├── odoo/            # Integración Odoo
│   └── fleet/           # Dashboard flota
├── assets/              # 🎨 Recursos (imágenes, iconos)
├── *.html               # 🌐 Páginas principales
├── styles.css           # 🎨 Estilos globales
├── server.js            # 🚀 Servidor Express
├── package.json         # 📦 Dependencias
└── server-control.sh    # 🔧 Helper de control
```

## 🎯 Funcionalidades Principales

### 📋 Gestión de Órdenes desde CRM
- Sincronización automática de leads desde Odoo
- Conversión de leads a órdenes
- Asignación de conductores

### 📦 Entregas
- Sistema de rutas optimizadas
- Tracking en vivo
- Tarifas por zona (Pérez Zeledón)

### 🚗 Fleet Dashboard
- Posicionamiento en vivo de conductores
- Estadísticas de flota
- Gestión de entregas

### 🔌 Integración Odoo 19
- JSON-RPC via proxy local
- CORS habilitado
- Auto-sincronización

## 📚 Documentación

Toda la documentación está en [`docs/`](docs/index.md)

Archivos clave:
- **[README_SERVIDOR.md](docs/README_SERVIDOR.md)** - Guía del servidor
- **[PROXY_9999_SETUP_COMPLETE.md](docs/PROXY_9999_SETUP_COMPLETE.md)** - Proxy Odoo
- **[ORDERS_CRM_INTEGRATION_COMPLETED.md](docs/ORDERS_CRM_INTEGRATION_COMPLETED.md)** - Órdenes CRM

## 🌐 URLs Principales

| URL | Descripción |
|-----|-------------|
| http://localhost:5555 | Home - Entregas principales |
| http://localhost:5555/orders-from-crm.html | ⭐ Órdenes desde CRM |
| http://localhost:5555/delivery-cards.html | Tarjetas de entrega |
| http://localhost:5555/fleet-dashboard.html | Dashboard de flota |
| http://localhost:5555/api/health | Health check |

## 🛠️ Comandos npm

```bash
npm run dev              # Servidor + proxy
npm run proxy            # Solo proxy Odoo
npm run server-only      # Solo servidor
npm install              # Instalar dependencias
```

## 🔧 Script Helper

```bash
./server-control.sh start      # Iniciar
./server-control.sh stop       # Detener
./server-control.sh status     # Ver estado
./server-control.sh test       # Probar Odoo
./server-control.sh restart    # Reiniciar
```

## 🔒 Configuración Odoo

**Credenciales (en odoo-connector.js):**
```javascript
{
    database: 'odoo19',
    uid: 5,
    token: '1fc63a72dcf97e88aab89c5a8a54dc0eac25cb9b'
}
```

**Proxy:**
- Puerto: 9999
- Endpoint: http://localhost:9999/jsonrpc
- Destino: rsexpress.online:443

## 📊 Arquitectura

```
Navegador
    ↓
    Servidor Web (Puerto 5555)
    ├─ Express.js
    └─ Proxy Odoo (Puerto 9999) ← subprocess
            ↓
        Odoo 19 (rsexpress.online)
```

## ✅ Estado del Proyecto

```
✅ Servidor web: Operativo
✅ Proxy Odoo: Operativo  
✅ Órdenes CRM: Funcionando
✅ Entregas: Sincronizadas
✅ Fleet: Dashboard activo
✅ CORS: Habilitado
✅ Auto-start: Configurado
```

## 🎓 Tecnologías

- **Backend:** Node.js, Express.js
- **Frontend:** HTML5, CSS3, JavaScript ES6+
- **API:** JSON-RPC 2.0 (Odoo)
- **Proxy:** Node.js HTTP
- **Diseño:** Responsive, CSS Grid

## 📝 Logs

Los logs se guardan en `docs/logs/`

Ver en tiempo real:
```bash
npm run dev  # Sin background para ver logs en consola
```

## 🆘 Soporte

### Error: Puerto en uso
```bash
kill -9 $(lsof -ti:5555)
kill -9 $(lsof -ti:9999)
```

### Error: No se conecta a Odoo
```bash
./server-control.sh test  # Verificar proxy
```

### Error: Scripts no cargan
```bash
curl http://localhost:5555/scripts/odoo/odoo-connector.js
```

## 📞 Contacto

Para más información, revisar documentación en [`docs/`](docs/index.md)

---

**Versión:** 2.0.0  
**Última actualización:** Diciembre 5, 2025  
**Estado:** ✅ Producción  
**Licencia:** MIT  

🎉 **¡Listo para usar!**
