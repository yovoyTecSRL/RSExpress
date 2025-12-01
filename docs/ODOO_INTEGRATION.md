# 🔗 Integración Odoo CRM - RSExpress Pedidos

## 📋 Resumen

Sistema completo de integración entre **Odoo CRM 19** y **RSExpress** para:
- Convertir Leads del CRM en Pedidos
- Asignar Pedidos a Conductores
- Generar Entregas automáticamente
- Sincronizar estado en tiempo real

---

## 🎯 Componentes Implementados

### 1. **odoo-connector.js**
Módulo de conexión y comunicación con Odoo mediante XML-RPC

**Funcionalidades:**
- ✅ Autenticación en Odoo
- ✅ Obtener leads del CRM
- ✅ Crear/Actualizar leads
- ✅ Cache de datos (5 minutos)
- ✅ Sincronización en lote
- ✅ Manejo robusto de errores

**Métodos principales:**
```javascript
// Conexión
await odooConnector.connect()

// Obtener leads
const leads = await odooConnector.getLeads(filters, offset, limit)
const lead = await odooConnector.getLeadById(leadId)

// Crear/Actualizar
const leadId = await odooConnector.createLead(leadData)
await odooConnector.updateLead(leadId, updates)

// Conversión
const order = await odooConnector.convertLeadToOrder(leadId)

// Estadísticas
const stats = await odooConnector.getLeadStats()
```

---

### 2. **order-manager.js**
Gestor de Pedidos - Convierte Leads en Pedidos y Entregas

**Funcionalidades:**
- ✅ Crear pedidos desde leads
- ✅ Agregar artículos al pedido
- ✅ Asignar conductores
- ✅ Generar entregas automáticas
- ✅ Sincronizar con Odoo
- ✅ Gestión de estado

**Métodos principales:**
```javascript
// Crear pedido
const order = await orderManager.createOrderFromLead(leadId)

// Agregar artículos
orderManager.addOrderItem(orderId, {
    name: 'Producto',
    quantity: 1,
    price: 100,
    weight: 2.5
})

// Asignar conductor
orderManager.assignDriver(orderId, driverId)

// Crear entregas
const deliveries = orderManager.createDeliveriesFromOrder(orderId)

// Actualizar estado
orderManager.updateOrderStatus(orderId, 'en_entrega')
```

---

### 3. **orders-from-crm.html**
Interfaz completa de gestión de pedidos

**Secciones:**
1. **Leads de Odoo** - Ver todos los leads disponibles
2. **Gestión de Pedidos** - Lista de pedidos creados
3. **Crear Pedido** - Formulario para crear pedidos
4. **Entregas** - Entregas generadas

**Características:**
- Interfaz moderna y responsive
- Estado de conexión en tiempo real
- Formularios validados
- Alertas de éxito/error
- Tablas interactivas
- Botones de acción

---

## 🔧 Configuración

### Credenciales Odoo (odoo-connector.js)
```javascript
new OdooConnector({
    url: 'http://odoo.sistemasorbix.com',
    database: 'odoo19_rsexpress',
    username: 'admin',
    password: 'admin',
    port: 8069
})
```

### Campos de Lead (Odoo)
```
- id: ID único
- name: Nombre del lead
- email_from: Email
- phone: Teléfono
- company_name: Empresa
- contact_name: Contacto
- description: Notas
- stage_id: Etapa del pipeline
- user_id: Usuario asignado
- expected_revenue: Monto estimado
- probability: Probabilidad (0-100)
- country_id: País
- city: Ciudad
```

### Estructura del Pedido
```javascript
{
    id: 2001,
    reference: 'ORD-2001',
    lead_id: 123,
    customer: {
        name: 'Nombre',
        email: 'email@example.com',
        phone: '+506 123456',
        address: 'Dirección'
    },
    items: [],
    amount: 100.00,
    status: 'pendiente',
    priority: 'alta',
    assigned_driver: 1,
    deliveries: [],
    tracking_number: 'TRK-2001-123456'
}
```

---

## 🚀 Flujo de Trabajo

### 1. Conectar a Odoo
```
Página → [Conectar a Odoo] → Autenticación → Cache de Leads
```

### 2. Convertir Lead → Pedido
```
Lead en Odoo → [Convertir] → Crear Pedido → Asignar Conductor
```

### 3. Crear Entregas
```
Pedido → Agregar Artículos → Crear Entregas → Asignar Rutas
```

### 4. Sincronizar
```
Estado Local → Actualizar en Odoo → Marcar Completado
```

---

## 📊 Estructura de Datos

### Lead (Odoo → Local)
```javascript
{
    id: 123,
    name: "Cliente Importante",
    email_from: "cliente@example.com",
    phone: "+506 1234567",
    company_name: "Empresa ABC",
    expected_revenue: 500,
    probability: 75,
    description: "Descripción del lead"
}
```

### Pedido (Local)
```javascript
{
    id: 2001,
    reference: "ORD-2001",
    lead_id: 123,
    customer: {...},
    items: [
        {
            id: "ITEM-2001-1",
            name: "Producto A",
            quantity: 2,
            price: 50,
            subtotal: 100
        }
    ],
    amount: 250,
    status: "en_entrega",
    assigned_driver: 1,
    tracking_number: "TRK-2001-456789"
}
```

### Entrega
```javascript
{
    id: 3001,
    order_id: 2001,
    reference: "DEL-2001-1",
    clientName: "Cliente Importante",
    address: "Dirección",
    description: "Producto A (x2)",
    priority: "alta",
    status: "pendiente",
    assigned_driver: 1,
    tracking_number: "TRK-2001-456789"
}
```

---

## 💾 Almacenamiento

### Local (JavaScript Maps)
- **Odoo.cache**: Almacena leads (5 min TTL)
- **OrderManager.orders**: Almacena pedidos
- **Deliveries**: Se generan desde pedidos

### Sincronización
```
Local ↔ Odoo (bidireccional)
- Lectura: Leads desde Odoo
- Escritura: Actualizaciones de estado
```

---

## 🔐 Seguridad

**Implementado:**
- ✅ Autenticación XML-RPC
- ✅ Session ID para persistencia
- ✅ Validación de datos
- ✅ Manejo de errores
- ✅ Reintentos automáticos
- ✅ Logging de operaciones

**Recomendaciones:**
- 🔒 Usar HTTPS en producción
- 🔑 Guardar credenciales en variables de entorno
- 🛡️ Implementar CORS en servidor
- 📝 Auditoría de cambios

---

## 📱 Integración con Flota

### Cómo conectar Pedidos → Entregas → Conductores

```javascript
// 1. Crear pedido desde lead
const order = await orderManager.createOrderFromLead(leadId)

// 2. Asignar conductor
orderManager.assignDriver(order.id, driverId)

// 3. Crear entregas
const deliveries = orderManager.createDeliveriesFromOrder(order.id)

// 4. Agregar a sistema de flota
deliveries.forEach(delivery => {
    window.driverFleetPanel.addDelivery(delivery)
})

// 5. Actualizar en Odoo
await orderManager.syncOrderToOdoo(order.id)
```

---

## 🔄 Sincronización en Tiempo Real

### Automático
- Sincronización cada 5 minutos (configurable)
- Cache TTL de 5 minutos
- Limpiar cache al actualizar

### Manual
```javascript
// Sincronizar todos los leads
await odooConnector.syncLeads((progress) => {
    console.log(`Sincronizado: ${progress.total}/${progress.totalLeads}`)
})

// Sincronizar pedido específico
await orderManager.syncOrderToOdoo(orderId)
```

---

## 📊 Estados de Pedido

```
pendiente
    ↓
confirmado
    ↓
asignado (+ conductor)
    ↓
en_entrega
    ↓
completado ✓
```

O alternativa:
```
pendiente → cancelado ✗
```

---

## 🧪 Testing

### Conexión
```javascript
const odoo = new OdooConnector()
const connected = await odoo.connect()
console.log(connected ? '✅ Conectado' : '❌ Desconectado')
```

### Obtener Leads
```javascript
const leads = await odoo.getLeads([], 0, 10)
console.log(`Leads encontrados: ${leads.length}`)
```

### Crear Pedido
```javascript
const order = await orderManager.createOrderFromLead(leadId)
console.log(`Pedido creado: ${order.reference}`)
```

---

## 📂 Archivos Creados

| Archivo | Propósito |
|---------|-----------|
| `odoo-connector.js` | Conexión y API de Odoo |
| `order-manager.js` | Gestión de pedidos |
| `orders-from-crm.html` | Interfaz de usuario |
| `ODOO_INTEGRATION.md` | Este documento |

---

## 🌐 URLs

- **Gestión de Pedidos**: `http://localhost:5555/orders-from-crm.html`
- **Flota**: `http://localhost:5555/index.html?page=fleet`
- **Test Page**: `http://localhost:5555/test-delivery-queue.html`

---

## 🔗 Integración Completa

```
Odoo CRM
   ↓
[Leads] → [Seleccionar Lead]
   ↓
OdooConnector (auth + RPC)
   ↓
OrderManager (crear pedido)
   ↓
[Pedido creado] → [Asignar conductor]
   ↓
Entregas generadas
   ↓
DriverFleetPanel (mostrar en flota)
   ↓
[Actualizar estado]
   ↓
Sincronizar en Odoo
```

---

## 📞 Soporte

**Logs de Debug:**
```javascript
// Habilitar logs
console.log('🔗 OdooConnector')
console.log('📦 OrderManager')
console.log('✅ Success operations')
console.log('❌ Errors')
```

**Contacto:**
- Soporte Técnico: soporte@sistemasorbix.com
- GitHub: yovoyTecSRL/RSExpress

---

**Última actualización:** 30 de Noviembre 2025
**Versión:** 1.0.0
**Estado:** ✅ Implementado y funcional
