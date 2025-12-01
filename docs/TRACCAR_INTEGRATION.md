# Integración de Traccar en RS Express

## 📍 Descripción General

La integración de Traccar permite rastrear conductores y vehículos en tiempo real en la plataforma RS Express. Utiliza la API de Traccar y WebSocket para proporcionar actualizaciones de posición en vivo, seguimiento de eventos y reportes de actividad.

## 🔑 API Key

```
eyJkYXRhIjo1MDA1Nn0ubTFrRzRFdDBiRk1obDMyMVRGdXNFVHQxQXlTNGI3ODZtL0xYaFdZZmNQWQ
```

Esta clave está integrada en el proyecto y se usa automáticamente para autenticar con Traccar.

## 📦 Módulo: traccar.js

El módulo `traccar.js` proporciona la clase `TraccarIntegration` que maneja toda la comunicación con la API de Traccar.

### Características Principales

1. **Autenticación**: Conecta y se autentica con el servidor Traccar
2. **Gestión de Dispositivos**: Lista, crea y actualiza vehículos/dispositivos
3. **Rastreo en Tiempo Real**: WebSocket para actualizaciones de posición en vivo
4. **Geofences**: Crear y gestionar zonas geográficas
5. **Reportes**: Historial de viajes, eventos, estadísticas de conducción
6. **Reconexión Automática**: Reintentos automáticos en caso de desconexión

## 🚀 Uso en app.js

### Inicialización Automática

La integración se inicializa automáticamente cuando se carga la aplicación:

```javascript
const app = new RSExpressApp();
// Traccar se inicializa automáticamente en app.init()
```

### Métodos Disponibles

#### 1. Iniciar Rastreo de un Viaje

```javascript
await app.startTraccarTracking(trip, deviceId);
```

**Parámetros:**
- `trip`: Objeto del viaje a rastrear
- `deviceId`: ID del dispositivo en Traccar

**Retorna:** `true` si se inició correctamente, `false` en caso contrario

#### 2. Detener Rastreo

```javascript
app.stopTraccarTracking();
```

Detiene el rastreo activo y muestra un resumen del viaje.

#### 3. Obtener Reporte de Actividad

```javascript
const report = await app.getTraccarActivityReport(deviceId, fromDate, toDate);
```

**Retorna:** Objeto con trips, eventos y estadísticas del período

#### 4. Obtener Estadísticas de Conducción

```javascript
const stats = await app.getTraccarDrivingStats(deviceId, fromDate, toDate);
```

**Retorna:** Objeto con distancia, duración, velocidad promedio y máxima

#### 5. Verificar Estado de Conexión

```javascript
const status = app.getTraccarStatus();
```

**Retorna:** 
```javascript
{
    connected: boolean,
    devicesCount: number,
    positionsCount: number,
    geofencesCount: number,
    eventsCount: number
}
```

## 🔌 Traccar API Endpoints Utilizados

### Autenticación
- `GET /api/server` - Verificar autenticación

### Dispositivos
- `GET /api/devices` - Listar dispositivos
- `POST /api/devices` - Crear dispositivo
- `PUT /api/devices/{id}` - Actualizar dispositivo

### Posiciones
- `GET /api/positions?deviceId={id}` - Última posición
- `GET /api/reports/route` - Historial de posiciones

### Eventos
- `GET /api/reports/events` - Eventos del dispositivo

### Geofences
- `GET /api/geofences` - Listar zonas
- `POST /api/geofences` - Crear zona

### Reportes
- `GET /api/reports/trips` - Resumen de viajes
- `GET /api/reports/events` - Eventos

### WebSocket
- `wss://demo.traccar.org/api/socket` - Conexión en tiempo real

## 📊 Estructura de Datos

### Device (Dispositivo)
```javascript
{
    id: number,
    name: string,
    uniqueId: string,
    status: 'online' | 'offline',
    lastUpdate: timestamp,
    attributes: object
}
```

### Position (Posición)
```javascript
{
    id: number,
    deviceId: number,
    latitude: number,
    longitude: number,
    altitude: number,
    speed: number,
    course: number,
    accuracy: number,
    fixTime: timestamp
}
```

### Event (Evento)
```javascript
{
    id: number,
    type: string,
    deviceId: number,
    serverTime: timestamp,
    attributes: object
}
```

### Trip (Viaje)
```javascript
{
    distance: number,
    duration: number,
    startTime: timestamp,
    endTime: timestamp,
    startAddress: string,
    endAddress: string
}
```

## 🎯 Casos de Uso

### 1. Rastrear Conductor en Tiempo Real

```javascript
// En la sección de "Mis Viajes" cuando se hace clic en "Ver Rastreo"
const trip = app.trips.find(t => t.id === tripId);
await app.startTraccarTracking(trip, trip.driverTraccarId);
```

### 2. Ver Estadísticas de Conducción

```javascript
const today = new Date();
const stats = await app.getTraccarDrivingStats(deviceId, today, today);

console.log(`Distancia: ${stats.distance} km`);
console.log(`Velocidad promedio: ${stats.avgSpeed} km/h`);
console.log(`Velocidad máxima: ${stats.maxSpeed} km/h`);
```

### 3. Generar Reporte de Actividad

```javascript
const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 días atrás
const to = new Date();

const report = await app.getTraccarActivityReport(deviceId, from, to);

console.log(`Viajes: ${report.summary.totalTrips}`);
console.log(`Distancia total: ${report.summary.totalDistance} km`);
console.log(`Eventos: ${report.summary.totalEvents}`);
```

### 4. Configurar Callbacks

```javascript
// Callbacks se configuran automáticamente en initTraccar()
// Pero puedes modificarlos manualmente si es necesario

app.traccar.onPositionUpdate = (position) => {
    console.log('Nueva posición:', position);
    // Actualizar UI
};

app.traccar.onDeviceStatusChange = (device) => {
    console.log('Estado de dispositivo:', device);
    // Notificar al usuario
};

app.traccar.onEventReceived = (event) => {
    console.log('Evento:', event);
    // Mostrar alerta
};
```

## 🔐 Seguridad

- **API Key**: Almacenada en `app.js` (considerar mover a backend en producción)
- **Autenticación**: Bearer token en headers HTTP
- **WebSocket**: Conexión segura (WSS)
- **Reconexión**: Maneja desconexiones automáticamente

## ⚠️ Limitaciones

- **Demo Server**: Se usa `demo.traccar.org` (reemplazar con servidor propio en producción)
- **Rate Limiting**: Considerar implementar límites de consultas
- **Almacenamiento**: Los datos se almacenan en memoria (considerar persistencia en BD)

## 🔧 Configuración Avanzada

### Cambiar Servidor Traccar

En `traccar.js`:
```javascript
this.traccarBaseUrl = 'https://tu-servidor.com/api';
this.wsUrl = 'wss://tu-servidor.com/api/socket';
```

### Cambiar Intervalo de Reconexión

En `traccar.js`:
```javascript
this.reconnectDelay = 5000; // 5 segundos (default: 3000)
this.maxReconnectAttempts = 10; // (default: 5)
```

## 📝 Ejemplo Completo

```javascript
// 1. Iniciar aplicación (Traccar se inicializa automáticamente)
const app = new RSExpressApp();

// 2. Esperar a que se cargue un viaje
const trip = {
    id: 123,
    driverTraccarId: 456,
    status: 'active'
};

// 3. Iniciar rastreo
const trackingStarted = await app.startTraccarTracking(trip, 456);

if (trackingStarted) {
    // 4. El mapa se actualiza automáticamente con las posiciones
    
    // 5. Cuando se complete el viaje
    app.stopTraccarTracking();
    
    // 6. Obtener estadísticas
    const stats = await app.getTraccarDrivingStats(456, new Date(), new Date());
    console.log('Viaje completado:', stats);
}
```

## 📞 Soporte

Para problemas con Traccar:
- Documentación oficial: https://www.traccar.org/documentation/
- Servidor demo: https://demo.traccar.org/
- API Reference: https://www.traccar.org/api-reference/

## 📄 Archivos Relacionados

- `traccar.js` - Módulo de integración Traccar
- `app.js` - Integración en aplicación principal
- `index.html` - Interfaz de usuario
- `styles.css` - Estilos para mapa de rastreo
