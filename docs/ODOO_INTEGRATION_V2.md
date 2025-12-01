# 🔗 Integración Odoo 19 - RSExpress

## ✅ Estado de Integración

La integración con Odoo 19 en `rsexpress.online` ha sido implementada exitosamente.

## 📋 Información de Conexión

- **Host**: rsexpress.online
- **Base de Datos**: odoo19
- **UID**: 5 (Usuario admin)
- **API Key**: fee30b46503e2c2e498fd5ad29de5b03cec19f0f
- **Versión Odoo**: 19.0

## 📊 Datos Sincronizados

### Usuarios en Odoo 19
1. **Administrator** (ID: 2)
   - Login: enriquemata2@hotmail.com
   - Email: enriquemata2@hotmail.com
   - Estado: Activo

2. **Recepcion** (ID: 7)
   - Login: info@rsexpress.online
   - Email: info@rsexpress.online
   - Estado: Activo

3. **Steward Calderon** (ID: 6)
   - Login: Steward
   - Email: rsexpresscr.pz@gmail.com
   - Estado: Activo

4. **admin** (ID: 5)
   - Login: info@sistemasorbix.com
   - Email: info@sistemasorbix.com
   - Estado: Activo

### Partners/Contactos Disponibles
Total: 17 partners registrados en el sistema

## 🛠️ Características Implementadas

### 1. **Vista de Usuarios en Admin Panel**
   - Nueva pestaña "Usuarios Odoo" en el panel administrativo
   - Muestra todos los usuarios con sus detalles
   - Estados en tiempo real

### 2. **Sincronización Automática**
   - Botón "Sincronizar" para obtener datos actualizados
   - Notificaciones de éxito/error con toasts
   - Contador de usuarios sincronizados

### 3. **Interfaz de Tarjetas de Usuario**
   - Diseño moderno con grid responsive
   - Avatar, nombre, login, email, estado
   - Información visual clara del estado (Activo/Inactivo)

### 4. **Información de Conexión**
   - Indicador de estado de conexión
   - Muestra "🟢 Conectado" o "🔴 Desconectado"
   - Última sincronización registrada

## 📁 Archivos Modificados/Creados

### Nuevos Archivos
- `odoo-integration-v2.js` - Módulo de integración
- `test-odoo-success.js` - Script de prueba exitoso

### Archivos Modificados
- `index.html` - Agregada pestaña y script de integración
- `styles.css` - Agregados estilos para usuarios Odoo

## 🚀 Cómo Usar

### En el Panel de Admin
1. Haz clic en la pestaña **"Usuarios Odoo"** en el panel administrativo
2. Haz clic en el botón **"Sincronizar Ahora"**
3. Los usuarios se cargarán en tarjetas con toda su información

### Detalles de Usuario
- Haz clic en una tarjeta de usuario para ver sus detalles completos
- Haz clic en el botón "Detalles" para más información

## 🔌 Endpoints Disponibles

### JSON-RPC
- **URL**: `https://rsexpress.online/jsonrpc`
- **Método**: POST
- **Content-Type**: application/json

### Servicios Disponibles
- `common` - Servicios comunes (version, authenticate)
- `object` - Operaciones en modelos (execute_kw, search_read, create, etc.)

## 💾 Ejemplo de Llamada

```javascript
const payload = {
    jsonrpc: '2.0',
    method: 'call',
    params: {
        service: 'object',
        method: 'execute_kw',
        args: [
            'odoo19',           // database
            5,                  // uid
            'fee30b46503e2c2e498fd5ad29de5b03cec19f0f', // api_key
            'res.users',        // model
            'search_read',      // method
            [],                 // domain
            {
                fields: ['id', 'name', 'login', 'email', 'active'],
                limit: 100
            }
        ]
    },
    id: 1
};

fetch('https://rsexpress.online/jsonrpc', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
})
.then(r => r.json())
.then(data => console.log(data.result));
```

## 🔐 Seguridad

- El API Key está configurado en la aplicación
- Se recomienda usar variables de entorno en producción
- Todos los datos se transmiten por HTTPS

## 📱 Características Adicionales Posibles

1. Crear nuevos usuarios desde RSExpress
2. Actualizar información de usuarios
3. Sincronizar clientes como partners
4. Integración de entregas con órdenes de venta
5. Reportes sincronizados

## 🐛 Solución de Problemas

### Error: "Access Denied"
- Verificar que el UID y API Key sean correctos

### Error: "Conexión rechazada"
- Verificar que el servidor Odoo esté activo
- Verificar la conectividad a rsexpress.online

### Usuarios no cargan
- Haz clic en "Sincronizar" para refrescar
- Verifica la consola del navegador para errores

## 📝 Notas

- La integración es bidireccional cuando sea necesario
- Los datos se sincronizan bajo demanda (no automático)
- Se pueden agregar actualizaciones en tiempo real si se requiere

---

**Última actualización**: 30 de Noviembre de 2025
**Estado**: ✅ Funcional
**Versión**: 2.0
