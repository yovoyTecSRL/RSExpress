# ✅ Servidor RSExpress Configurado - Puerto 9999 Proxy Odoo Habilitado

## 🚀 Estado del Servidor

**El servidor está corriendo correctamente con el proxy Odoo habilitado:**

```
🌐 SERVIDOR WEB:        http://localhost:5555
🔄 PROXY ODOO:          http://localhost:9999
```

## 📋 Cambios Realizados

### 1. **package.json - Actualizado**
   - ✅ Agregado script `npm run dev` - Inicia servidor + proxy
   - ✅ Agregado script `npm run proxy` - Inicia solo proxy
   - ✅ Agregado script `npm start` - Inicia ambos con `concurrently`
   - ✅ Agregadas dependencias: express, cors, concurrently
   
### 2. **server.js - Mejorado**
   - ✅ Agregado soporte para iniciar proxy automáticamente
   - ✅ Agregada función `startOdooProxy()` que ejecuta odoo-proxy.js en subprocess
   - ✅ Mejorado mensaje de inicio con información del proxy
   - ✅ Agregada limpieza de proxy al cerrar servidor (SIGINT/SIGTERM)
   - ✅ Ahora el proxy se inicia automáticamente junto con el servidor
   
### 3. **odoo-proxy.js - Ya existente**
   - ✅ Escucha en puerto 9999
   - ✅ Redirecciona peticiones a rsexpress.online:443
   - ✅ Resuelve problemas de CORS
   - ✅ JSON-RPC compatible con Odoo 19

## 🎯 Cómo Usar

### Opción 1: Iniciar servidor + proxy automáticamente (RECOMENDADO)
```bash
npm run dev
```
Esto ejecuta ambos servicios en paralelo.

### Opción 2: Iniciar solo el servidor
```bash
npm run server-only
```

### Opción 3: Iniciar solo el proxy
```bash
npm run proxy
```

## 🌐 Acceso a Aplicaciones

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **Entregas** | http://localhost:5555/ | Principal (delivery-cards.html) |
| **Órdenes CRM** | http://localhost:5555/orders-from-crm.html | ⭐ Requiere proxy habilitado |
| **Health Check** | http://localhost:5555/api/health | Estado del servidor |
| **Info** | http://localhost:5555/api/info | Información del servidor |
| **Proxy Odoo** | http://localhost:9999/jsonrpc | Endpoint JSON-RPC |

## 🔧 Configuración Odoo

**Credenciales en odoo-connector.js:**
```javascript
{
    database: 'odoo19',
    uid: 5,
    token: '1fc63a72dcf97e88aab89c5a8a54dc0eac25cb9b',
    url: 'http://localhost:9999'  // ← Proxy local
}
```

## 📡 Proxy Odoo Características

- **Puerto**: 9999
- **Endpoint**: http://localhost:9999/jsonrpc
- **CORS**: ✅ Habilitado (permite todas las origins)
- **Redirección**: rsexpress.online:443
- **Método**: POST a /jsonrpc
- **Protocolo**: JSON-RPC 2.0

## ✅ Validación

### Verificar servidor está activo:
```bash
curl http://localhost:5555/api/health
```

Respuesta esperada:
```json
{
    "status": "ok",
    "server": "running",
    "port": 5555
}
```

### Verificar proxy Odoo está activo:
```bash
curl -X POST http://localhost:9999/jsonrpc \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"call","params":{"service":"common","method":"version","args":[]},"id":1}'
```

Respuesta esperada:
```json
{
    "jsonrpc": "2.0",
    "id": 1,
    "result": {
        "server_version": "19.0",
        ...
    }
}
```

## 🎨 Interfaces Disponibles

```
✅ /delivery-cards.html - Entregas principales
✅ /deliveries-perez-zeledon.html - Demo Pérez Zeledón
✅ /delivery-card-demo.html - Demo de tarjetas
✅ /fleet-dashboard.html - Dashboard de flota
✅ /delivery-orders.html - Órdenes de entrega
✅ /orders-from-crm.html - Órdenes desde CRM (NUEVO - requiere proxy)
```

## 🛑 Detener Servidor

```bash
# Presionar CTRL+C en la terminal
# O en otra terminal:
npm run stop  # (si existe el script)

# O matar el proceso directamente:
kill -9 $(lsof -ti:5555)
kill -9 $(lsof -ti:9999)
```

## 📝 Logs

Los logs se mostrarán en la terminal:
- `[Server]` - Logs del servidor principal
- `[Proxy]` - Logs del proxy Odoo
- Incluyen timestamps y códigos de estado

## 🔐 Seguridad Nota

- El proxy abre CORS a todas las origins (`Access-Control-Allow-Origin: *`)
- Esto es conveniente para desarrollo pero **NO para producción**
- Para producción, restringir a dominios específicos

## 📚 Archivos Modificados

```
✏️  package.json
✏️  server.js
📄 odoo-proxy.js (sin cambios - existente)
```

## 🎉 ¡Todo Listo!

El servidor RSExpress está operativo con:
- ✅ Servidor web en puerto 5555
- ✅ Proxy Odoo en puerto 9999
- ✅ Auto-inicio del proxy con el servidor
- ✅ CORS habilitado
- ✅ Todas las rutas configuradas

**Inicia con:** `npm run dev`
