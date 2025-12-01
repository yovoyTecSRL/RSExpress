# Configuración JSON-RPC para Odoo - RSExpress

## 🔧 Información de Conexión

**Endpoint:** `https://rsexpress.online/jsonrpc`

**Parámetros de Autenticación:**
```
Database: odoo19
User ID (uid): 5
Session Token: 1fc63a72dcf97e88aab89c5a8a54dc0eac25cb9b
```

## 📋 Estructura de Llamadas JSON-RPC

### Formato Base

```json
{
  "jsonrpc": "2.0",
  "method": "call",
  "params": {
    "service": "object",
    "method": "execute_kw",
    "args": [
      "odoo19",                           // Database
      5,                                   // UID
      "1fc63a72dcf97e88aab89c5a8a54dc0eac25cb9b",  // Token
      "res.partner",                      // Modelo
      "search_read",                      // Método
      []                                  // Argumentos del método
    ]
  },
  "id": 1
}
```

### Con Parámetros Adicionales (kwargs)

```json
{
  "jsonrpc": "2.0",
  "method": "call",
  "params": {
    "service": "object",
    "method": "execute_kw",
    "args": [
      "odoo19",
      5,
      "1fc63a72dcf97e88aab89c5a8a54dc0eac25cb9b",
      "crm.lead",
      "search_read",
      [[]],  // domain (búsqueda todos)
      {      // kwargs
        "fields": ["id", "name", "email_from", "phone"],
        "limit": 10
      }
    ]
  },
  "id": 1
}
```

## 📚 Ejemplos de Uso

### 1. Obtener Lista de Partners

```bash
curl -X POST https://rsexpress.online/jsonrpc \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "call",
    "params": {
      "service": "object",
      "method": "execute_kw",
      "args": [
        "odoo19",
        5,
        "1fc63a72dcf97e88aab89c5a8a54dc0eac25cb9b",
        "res.partner",
        "search_read",
        [],
        {
          "fields": ["id", "name", "email", "phone"],
          "limit": 20
        }
      ]
    },
    "id": 1
  }'
```

**Respuesta:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": [
    {
      "id": 1,
      "name": "RSExpress",
      "email": "info@rsexpress.com",
      "phone": "+1234567890"
    },
    {
      "id": 14,
      "name": "Client Crédito",
      "email": "client@credit.com",
      "phone": "+0987654321"
    }
  ]
}
```

### 2. Obtener Leads CRM

```bash
curl -X POST https://rsexpress.online/jsonrpc \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "call",
    "params": {
      "service": "object",
      "method": "execute_kw",
      "args": [
        "odoo19",
        5,
        "1fc63a72dcf97e88aab89c5a8a54dc0eac25cb9b",
        "crm.lead",
        "search_read",
        [[]],
        {
          "fields": ["id", "name", "email_from", "phone", "company_name", "expected_revenue"],
          "limit": 20
        }
      ]
    },
    "id": 2
  }'
```

### 3. Crear un Lead

```bash
curl -X POST https://rsexpress.online/jsonrpc \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "call",
    "params": {
      "service": "object",
      "method": "execute_kw",
      "args": [
        "odoo19",
        5,
        "1fc63a72dcf97e88aab89c5a8a54dc0eac25cb9b",
        "crm.lead",
        "create",
        [
          {
            "name": "Nuevo Cliente",
            "email_from": "cliente@example.com",
            "phone": "+1234567890",
            "company_name": "Mi Empresa",
            "description": "Lead creado vía API"
          }
        ]
      ]
    },
    "id": 3
  }'
```

**Respuesta:**
```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": 42  // ID del nuevo lead
}
```

### 4. Actualizar un Lead

```bash
curl -X POST https://rsexpress.online/jsonrpc \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "call",
    "params": {
      "service": "object",
      "method": "execute_kw",
      "args": [
        "odoo19",
        5,
        "1fc63a72dcf97e88aab89c5a8a54dc0eac25cb9b",
        "crm.lead",
        "write",
        [
          [42],  // IDs a actualizar (array)
          {      // Datos a actualizar
            "probability": 50,
            "description": "Lead actualizado"
          }
        ]
      ]
    },
    "id": 4
  }'
```

### 5. Obtener Órdenes de Venta

```bash
curl -X POST https://rsexpress.online/jsonrpc \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "call",
    "params": {
      "service": "object",
      "method": "execute_kw",
      "args": [
        "odoo19",
        5,
        "1fc63a72dcf97e88aab89c5a8a54dc0eac25cb9b",
        "sale.order",
        "search_read",
        [
          [["state", "=", "sale"]]  // Solo órdenes confirmadas
        ],
        {
          "fields": ["id", "name", "partner_id", "amount_total", "state", "date_order"],
          "limit": 50
        }
      ]
    },
    "id": 5
  }'
```

## 🔄 Métodos Disponibles

### Búsqueda y Lectura

| Método | Descripción | Ejemplo |
|--------|-------------|---------|
| `search_read` | Buscar y leer registros | `search_read([domain], fields=[...])` |
| `read` | Leer registros por ID | `read([[1, 2, 3]], fields=[...])` |
| `search` | Solo buscar IDs | `search([domain])` |
| `search_count` | Contar registros | `search_count([domain])` |

### Escritura y Creación

| Método | Descripción | Ejemplo |
|--------|-------------|---------|
| `create` | Crear nuevo registro | `create([{field: value}])` |
| `write` | Actualizar registros | `write([[ids], {field: value}])` |
| `unlink` | Eliminar registros | `unlink([ids])` |

## 📊 Modelos Disponibles

### Modelos CRM
- `crm.lead` - Leads (prospectos)
- `crm.stage` - Etapas de oportunidades
- `crm.team` - Equipos de venta

### Modelos de Ventas
- `sale.order` - Órdenes de venta
- `sale.order.line` - Líneas de orden
- `product.product` - Productos

### Modelos de Contactos
- `res.partner` - Contactos/Socios
- `res.partner.category` - Categorías

### Modelos de Gestión
- `stock.picking` - Entregas
- `account.invoice` - Facturas

## 🐛 Solución de Problemas

### Error: "Invalid database"
```json
{
  "error": {
    "code": 401,
    "message": "Unauthorized or invalid database"
  }
}
```
✅ Verifica que `database: "odoo19"` sea correcto.

### Error: "Invalid uid"
```json
{
  "error": {
    "code": 400,
    "message": "Invalid uid"
  }
}
```
✅ Verifica que `uid: 5` sea un usuario válido.

### Error: "Invalid token/session"
```json
{
  "error": {
    "code": 401,
    "message": "Session invalid"
  }
}
```
✅ Verifica que el `token` sea correcto: `"1fc63a72dcf97e88aab89c5a8a54dc0eac25cb9b"`

### Error: CORS (Cross-Origin)
Si estás haciendo llamadas desde el navegador:
```javascript
// El servidor remoto debe permitir CORS
// O usar un proxy local
```

✅ Usa la clase `OdooConnector` que incluye manejo de CORS.

## 💻 Implementación en JavaScript

Usa el archivo `odoo-connector.js`:

```javascript
// Crear instancia
const odoo = new OdooConnector({
    url: 'https://rsexpress.online',
    database: 'odoo19',
    uid: 5,
    token: '1fc63a72dcf97e88aab89c5a8a54dc0eac25cb9b'
});

// Conectar
await odoo.connect();

// Obtener leads
const leads = await odoo.getLeads([], 0, 20);

// Obtener partners
const partners = await odoo.getPartners(10);

// Crear lead
const leadId = await odoo.createLead({
    name: 'Cliente Nuevo',
    email: 'cliente@example.com',
    phone: '+1234567890'
});

// Actualizar lead
await odoo.updateLead(leadId, {
    probability: 60,
    description: 'Lead calificado'
});
```

## 🧪 Herramientas de Prueba

Accede a la página de prueba: **http://localhost:5555/test-json-rpc.html**

Funciones disponibles:
- ✅ Prueba de conexión (Partners)
- ✅ Obtener Leads CRM
- ✅ Obtener Órdenes de Venta
- ✅ Crear Lead de prueba

## 📝 Notas Importantes

1. **Seguridad**: El token es sensible. No lo expongas en código público.
2. **Rate Limiting**: Respeta los límites de API del servidor.
3. **Caché**: La clase `OdooConnector` cachea resultados por 5 minutos.
4. **HTTPS**: Siempre usa HTTPS en producción.
5. **Errores**: Revisa los logs del servidor Odoo para mensajes detallados.

## 🔗 Integración con RSExpress

La integración JSON-RPC permite:

1. **Sincronizar Leads** desde Odoo CRM
2. **Crear Pedidos** a partir de leads
3. **Asignar Conductores** automáticamente
4. **Generar Entregas** desde pedidos
5. **Actualizar Estados** en Odoo

## 📞 Soporte

Para problemas de conexión, verifica:
- ✅ Endpoint: `https://rsexpress.online/jsonrpc`
- ✅ Database: `odoo19`
- ✅ UID: `5`
- ✅ Token válido
- ✅ Conexión HTTPS activa
