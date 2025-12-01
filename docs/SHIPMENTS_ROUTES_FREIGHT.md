# 🚀 RS Express - Nuevas Features: Connection Bulb & Shipments/Routes/Freight

## ✨ Características Agregadas

### 1. 🟢 Connection Status Bulb (Indicador de Conexión)

**Ubicación:** En el header, al lado del botón de tema

**Estados:**
- 🟢 **Verde** - Conectado (pulsante)
- 🟡 **Amarillo** - Conectando (pulsante lento)
- 🔴 **Rojo** - Desconectado (fijo)

**Efectos visuales:**
- Animación de pulsado suave
- Tooltip con estado actual
- Integración con Traccar
- Actualización automática

**Código:**
```html
<div class="connection-bulb" id="connectionBulb" title="Estado de conexión">
    <div class="bulb-indicator"></div>
    <span class="bulb-tooltip" id="bulbTooltip">Conectando...</span>
</div>
```

---

### 2. 📦 Sistema Completo de Envíos, Rutas y Flete

Ahora RS Express gestiona tres entidades conectadas:

#### A. **Envíos (Shipments)**
```javascript
const shipment = app.createShipment({
    pickup: 'Dirección origen',
    delivery: 'Dirección destino',
    weight: 2.5,
    description: 'Descripción',
    price: 150
});
```

**Propiedades:**
- `id` - ID único del envío
- `status` - pending, assigned, in_transit, delivered
- `pickup/delivery` - Direcciones
- `weight/dimensions` - Detalles de tamaño
- `routeId` - Vinculado a ruta
- `freightId` - Vinculado a flete
- `driver/vehicle` - Información asignada

#### B. **Rutas (Routes)**
```javascript
const route = app.createRoute({
    driverId: 1,
    driverName: 'Juan Pérez',
    startLocation: 'Centro Distribución',
    vehicle: {
        model: 'Toyota Prius',
        plate: 'ABC123'
    }
});
```

**Propiedades:**
- `id` - ID único de ruta
- `driverId/driverName` - Conductor asignado
- `stops` - Lista de paradas
- `shipments` - Envíos en esta ruta
- `vehicle` - Información del vehículo
- `status` - active, completed
- `totalDistance` - Distancia total

#### C. **Flete (Freight)**
```javascript
const freight = app.createFreight({
    shipmentId: shipment.id,
    routeId: route.id,
    weight: 2.5,
    type: 'standard',
    value: 150,
    insuranceRequired: false
});
```

**Propiedades:**
- `id` - ID único de flete
- `shipmentId` - Envío vinculado
- `routeId` - Ruta vinculada
- `weight/volume` - Tamaño
- `type` - standard, fragile, perishable
- `trackingNumber` - Número de rastreo único
- `insuranceRequired` - Requiere seguro

---

## 🔗 Vinculación de Entidades

### Conectar Envío con Ruta:
```javascript
app.assignShipmentToRoute(shipmentId, routeId);
```

### Conectar Flete con Envío:
```javascript
app.linkFreightToShipment(freightId, shipmentId);
```

---

## 📊 Métodos Disponibles

### Crear Entidades
```javascript
app.createShipment(data)      // Crear envío
app.createRoute(data)         // Crear ruta
app.createFreight(data)       // Crear flete
```

### Vincular Entidades
```javascript
app.assignShipmentToRoute(shipmentId, routeId)    // Vincular envío a ruta
app.linkFreightToShipment(freightId, shipmentId)  // Vincular flete a envío
```

### Obtener Información
```javascript
app.getShipmentDetails(shipmentId)   // Detalles completos de envío
app.getActiveRoutes()                // Todas las rutas activas
app.getPendingShipments()            // Envíos sin asignar
app.getShipmentsStats()              // Estadísticas generales
```

### Actualizar Estado
```javascript
app.updateShipmentStatus(shipmentId, newStatus)  // Cambiar estado de envío
```

### Estado de Conexión
```javascript
app.updateConnectionStatus(status)   // Actualizar bulb (connected/connecting/disconnected)
app.getTraccarStatus()               // Estado de Traccar
```

---

## 💻 Ejemplos de Uso Rápido

### Ejemplo 1: Crear todo desde cero
```javascript
// En consola del navegador (F12):
ShipmentsExamples.createCompleteShipment()
```

Resultado:
- ✓ Envío creado
- ✓ Ruta creada
- ✓ Flete registrado
- ✓ Todo vinculado

### Ejemplo 2: Múltiples envíos en una ruta
```javascript
ShipmentsExamples.manageMultipleShipments()
```

Resultado:
- ✓ Una ruta con 3 paradas
- ✓ 3 envíos asignados
- ✓ 3 registros de flete

### Ejemplo 3: Ver estadísticas
```javascript
ShipmentsExamples.showShipmentsStatistics()
```

Resultado:
```
Envíos Totales:    15
Envíos Pendientes:  3
Envíos Asignados:   8
Envíos Entregados:  4

Rutas Activas:      3
Distancia Total:    145.50 km
```

### Ejemplo 4: Ver dashboard
```javascript
ShipmentsExamples.showDashboard()
```

---

## 🎨 Estilos del Bulb

### CSS Clases
```css
.connection-bulb              /* Contenedor principal */
.bulb-indicator               /* La luz indicadora */
.connection-bulb.connected    /* Estado conectado */
.connection-bulb.connecting   /* Estado conectando */
.connection-bulb.disconnected /* Estado desconectado */
```

### Animaciones
```css
@keyframes pulse-green   /* Pulsación verde */
@keyframes pulse-yellow  /* Pulsación amarilla */
```

---

## 🔄 Flujo de Trabajo Típico

```
1. Usuario solicita envío
   └─ app.createShipment()

2. Sistema crea ruta
   └─ app.createRoute()

3. Sistema registra flete
   └─ app.createFreight()

4. Vincular envío a ruta
   └─ app.assignShipmentToRoute()

5. Vincular flete a envío
   └─ app.linkFreightToShipment()

6. Ver detalles completos
   └─ app.getShipmentDetails()

7. Actualizar estado
   └─ app.updateShipmentStatus()

8. Rastrear con Traccar
   └─ Integración automática con GPS
```

---

## 📱 Integración con Traccar

Los envíos pueden estar vinculados con rastreo en vivo:

```javascript
// Vincular envío con dispositivo Traccar
await ShipmentsExamples.linkShipmentWithTraccar(
    shipmentId,
    traccarDeviceId
);

// Resultado:
// - Posición GPS en vivo
// - Velocidad actual
// - Dirección
```

---

## 🗂️ Estructura de Datos

### Shipment Object
```javascript
{
    id: "SHP1732778432645",
    status: "assigned",
    pickup: "Calle A",
    delivery: "Calle B",
    weight: 2.5,
    description: "Paquete",
    price: 150,
    routeId: "RTE1732778432700",
    freightId: "FRT1732778432750",
    driver: "Juan",
    vehicle: { model: "Toyota", plate: "ABC123" }
}
```

### Route Object
```javascript
{
    id: "RTE1732778432700",
    driverId: 1,
    driverName: "Juan Pérez",
    stops: [ { location: "...", shipmentId: "..." } ],
    shipments: [ "SHP1", "SHP2" ],
    status: "active",
    totalDistance: 15.5,
    vehicle: { model: "Toyota Prius", plate: "ABC123" }
}
```

### Freight Object
```javascript
{
    id: "FRT1732778432750",
    shipmentId: "SHP1732778432645",
    routeId: "RTE1732778432700",
    weight: 2.5,
    volume: 9,
    type: "standard",
    value: 150,
    trackingNumber: "TRKAB1C2D3E",
    insuranceRequired: false
}
```

---

## 🚀 Comandos en Consola

```javascript
// Ver todos los ejemplos disponibles
window.ShipmentsExamples

// Dashboard
ShipmentsExamples.showDashboard()

// Crear completo
ShipmentsExamples.createCompleteShipment()

// Múltiples envíos
ShipmentsExamples.manageMultipleShipments()

// Estadísticas
ShipmentsExamples.showShipmentsStatistics()

// Rutas activas
ShipmentsExamples.listActiveRoutes()

// Envíos pendientes
ShipmentsExamples.listPendingShipments()

// Estado de conexión
ShipmentsExamples.checkConnectionStatus()

// Información detallada (necesita shipmentId)
ShipmentsExamples.getDetailedShipmentInfo('SHP...')

// Actualizar estado (necesita shipmentId)
ShipmentsExamples.updateShipmentProgress('SHP...')
```

---

## ✅ Verificación

### Ver en la UI:
1. Bulb en header (esquina superior derecha)
2. Indicador de conexión animado
3. Cambia de color según estado

### En Consola (F12):
```javascript
// Ver estado actual
app.connectionStatus

// Ver envíos
console.log(app.shipments)

// Ver rutas
console.log(app.routes)

// Ver fletes
console.log(app.freight)

// Estadísticas
app.getShipmentsStats()
```

---

## 🔧 Personalización

### Cambiar colores del bulb
En `styles.css`, busca:
```css
.connection-bulb.connected .bulb-indicator {
    background: #27ae60;  /* Cambiar color aquí */
}
```

### Cambiar duración de animación
```css
@keyframes pulse-green {
    /* Cambiar "2s" a otro valor */
    animation: pulse-green 2s infinite;
}
```

### Cambiar mensajes del bulb
En `app.js`, en `updateConnectionStatus()`:
```javascript
tooltip.textContent = '🟢 Conectado';  // Personalizar
```

---

## 📋 Próximas Mejoras

- [ ] UI para crear envíos
- [ ] Mapa de rutas con markers
- [ ] Historial de rastreo
- [ ] Notificaciones en tiempo real
- [ ] Exportar reportes
- [ ] Integración con pagos
- [ ] App móvil

---

## 🎯 Estado Actual

✅ **Completado:**
- Connection Status Bulb
- Sistema de Envíos
- Sistema de Rutas
- Sistema de Flete
- Vinculación de entidades
- 10 ejemplos de uso
- Integración con Traccar

✅ **Listo para usar:**
- Crear envíos y rutas
- Rastrear en tiempo real
- Ver estadísticas
- Gestionar estados

---

**Última actualización:** Noviembre 2025
**Versión:** 2.0 (Con Shipments & Routes)
