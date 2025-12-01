# 🚀 OdooProxy Integration Guide - RSExpress

## ✨ Overview

**OdooProxy** es un servidor intermediario que maneja la conexión a Odoo (rsexpress.online) y resuelve los problemas de CORS. Actúa como puente entre la interfaz de usuario y el servidor Odoo.

```
Browser (Port 5555)
    ↓ HTTP POST
OdooProxy (Port 9999)
    ↓ HTTPS
rsexpress.online:443
```

## 🎯 Características

✅ **Transparencia de CORS** - El proxy maneja automáticamente los headers CORS  
✅ **Proxy Transparente** - Reenvía exactamente lo que recibe  
✅ **Auto-detección** - El código detecta automáticamente si el proxy está disponible  
✅ **Fallback Automático** - Si no está disponible, usa conexión directa  
✅ **Sin cambios en el código** - OdooConnector se adapta automáticamente  

## 📦 Instalación

### 1. Instalar dependencias (si no las tienes)
```bash
npm install --save-dev http https url
```

Nota: Estas son dependencias nativas de Node.js, no necesitan instalación separada.

### 2. Iniciar OdooProxy

**Opción A: Comando directo**
```bash
node /home/menteavatar/Desktop/Projects/RSExpress/RSExpress/start-services.js
```

**Opción B: Desde el proyecto**
```bash
cd /home/menteavatar/Desktop/Projects/RSExpress/RSExpress
node start-services.js
```

**Output esperado:**
```
✅ PROXY SERVIDOR (OdooProxy)
   ├─ Puerto: 9999
   ├─ URL: http://localhost:9999/jsonrpc
   ├─ Destino: https://rsexpress.online:443/jsonrpc
   └─ CORS: ✅ Habilitado
```

## 💻 Uso en el código

### Método 1: Auto-detección (Recomendado)
```javascript
// El código detecta automáticamente si proxy está disponible
const connector = new OdooConnector({
    database: 'odoo19',
    uid: 5,
    token: '1fc63a72dcf97e88aab89c5a8a54dc0eac25cb9b'
});
// Usa proxy si está disponible, sino usa conexión directa
```

### Método 2: Proxy Explícito
```javascript
const connector = new OdooConnector({
    url: 'http://localhost:9999',  // Fuerza uso del proxy
    database: 'odoo19',
    uid: 5,
    token: '1fc63a72dcf97e88aab89c5a8a54dc0eac25cb9b'
});
```

### Método 3: Conexión Directa
```javascript
const connector = new OdooConnector({
    url: 'https://rsexpress.online',  // Directo sin proxy
    database: 'odoo19',
    uid: 5,
    token: '1fc63a72dcf97e88aab89c5a8a54dc0eac25cb9b'
});
```

## 🧪 Testing

### Test desde línea de comandos
```bash
bash /home/menteavatar/Desktop/Projects/RSExpress/RSExpress/test-proxy-integration.sh
```

Esto ejecutará:
1. ✅ Verificación de disponibilidad del proxy
2. ✅ Test JSON-RPC básico
3. ✅ Test de autenticación con token

### Test desde Browser Console

```javascript
// Test 1: Verificar conectividad del proxy
await testOdooProxy();

// Test 2: Sincronizar usuarios
await testOdooUsers();

// Test 3: Obtener partners
const partners = await odooConnector.getPartners([], 0, 10);
console.log('Partners:', partners);
```

## 📋 Integración en Aplicación

### orders-from-crm.html
Ya incluye auto-detección. Al conectar:
```javascript
// El botón "Conectar a Odoo" ahora:
// 1. Detecta si proxy está disponible
// 2. Usa proxy si está corriendo
// 3. Fallback a conexión directa si no

// No necesita cambios en el código existente
```

## 🔧 Configuración del Proxy

Archivo: `odoo-proxy.js` (128 líneas)

### Parámetros principales
```javascript
const ODOO_HOST = 'rsexpress.online';   // Servidor Odoo
const ODOO_PORT = 443;                   // Puerto HTTPS
const PROXY_PORT = 9999;                 // Puerto local del proxy
```

### Headers CORS que agrega
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

## 🚨 Troubleshooting

### ❌ "EADDRINUSE: address already in use :::9999"
```bash
# Encuentra qué proceso está usando puerto 9999
lsof -i :9999

# Mata el proceso (reemplaza PID)
kill -9 <PID>

# O cambia el puerto en odoo-proxy.js
sed -i 's/PROXY_PORT = 9999/PROXY_PORT = 9998/' odoo-proxy.js
```

### ❌ "Connection refused to rsexpress.online"
```bash
# Verifica que rsexpress.online está accesible
curl -k https://rsexpress.online/jsonrpc

# Si no funciona, proxy no puede conectar
# Verifica firewall y permisos de salida
```

### ❌ "CORS error en browser"
```bash
# Si aún hay CORS error con proxy corriendo:
# 1. Verifica que proxy está en puerto 9999
lsof -i :9999

# 2. Recarga la página (Ctrl+Shift+Delete cache)
# 3. Verifica console del navegador para errors

# 4. Prueba directamente:
curl -X POST http://localhost:9999/jsonrpc \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"version","params":{},"id":0}'
```

## 📊 Monitoreo

El proxy genera logs de todas las requests:
```
[PROXY] 2024-01-15T10:30:45.123Z - 200
[PROXY] 2024-01-15T10:30:46.456Z - 200
[PROXY] 2024-01-15T10:30:47.789Z - 500
```

Para ver en tiempo real:
```bash
node start-services.js 2>&1 | grep PROXY
```

## 🎓 Arquitectura

### Flujo de una request JSON-RPC

```
1. Browser hace POST a http://localhost:9999/jsonrpc
   {
     "jsonrpc": "2.0",
     "method": "call",
     "params": {...},
     "id": 1
   }

2. OdooProxy recibe request
   ├─ Agrega headers CORS
   ├─ Valida que sea POST a /jsonrpc
   └─ Reenvía a rsexpress.online

3. rsexpress.online procesa
   └─ Retorna JSON-RPC response

4. OdooProxy recibe respuesta
   ├─ Agrega headers CORS a respuesta
   └─ Retorna al browser

5. Browser recibe respuesta con CORS válidos
   └─ ✅ No hay error de CORS
```

### Métodos disponibles en OdooConnector

```javascript
// Lectura
await connector.getLeads(domain, offset, limit)
await connector.getPartners(domain, offset, limit)
await connector.getOrders(domain, offset, limit)
await connector.getFields(model)

// Escritura
await connector.create(model, values)
await connector.write(model, ids, values)
await connector.delete(model, ids)

// Utilidades
await connector.executeKW(model, method, domain, args)
await connector.rpc(method, params)
```

## 🔐 Seguridad

⚠️ **Importante para Producción:**

1. **No expongas el proxy a internet**
   ```bash
   # ❌ Malo: Expone proxy públicamente
   node start-services.js  # Escucha en 0.0.0.0
   
   # ✅ Bueno: Solo localhost
   # Cambiar en odoo-proxy.js: server.listen(PROXY_PORT, 'localhost', ...)
   ```

2. **Implementa autenticación**
   ```javascript
   // Agregar validación de token en proxy
   const validTokens = ['token1', 'token2'];
   if (!validTokens.includes(req.headers['x-api-token'])) {
       res.writeHead(401);
       res.end('Unauthorized');
   }
   ```

3. **Rate limiting**
   ```bash
   # Usar nginx o similar para limitar requests
   npm install express-rate-limit
   ```

## 📞 Soporte

### Logs detallados
```bash
DEBUG=* node start-services.js
```

### Test manual
```bash
# Versión
curl -X POST http://localhost:9999/jsonrpc \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"version","params":{},"id":0}'

# Con autenticación
curl -X POST http://localhost:9999/jsonrpc \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc":"2.0",
    "method":"call",
    "params":{"service":"object","method":"execute","args":["odoo19",5,"token","res.partner","search",[],0,5]},
    "id":1
  }'
```

## ✅ Checklist

- [ ] `start-services.js` creado
- [ ] `node start-services.js` ejecutándose sin errores
- [ ] Puerto 9999 abierto (`lsof -i :9999`)
- [ ] `test-proxy-integration.sh` pasa todos los tests
- [ ] `orders-from-crm.html` detecta proxy automáticamente
- [ ] Datos de Odoo cargados correctamente
- [ ] Operaciones CRUD funcionando

## 🎉 Ready!

OdooProxy está completamente integrado. Ya puedes:

✅ Hacer requests a Odoo sin problemas de CORS  
✅ Auto-detección de proxy disponible  
✅ Fallback automático a conexión directa  
✅ Código transparente a la presencia del proxy  

¡A crear! 🚀
