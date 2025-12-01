# RS Express - Integración Traccar

## 🎯 Descripción

RS Express es una plataforma de delivery moderna que integra **Traccar** para rastreo en tiempo real de conductores y vehículos. Esta integración proporciona funcionalidades avanzadas de seguimiento, reportes y monitoreo.

## 🔑 API Key Traccar

```
eyJkYXRhIjo1MDA1Nn0ubTFrRzRFdDBiRk1obDMyMVRGdXNFVHQxQXlTNGI3ODZtL0xYaFdZZmNQWQ
```

**Integrada automáticamente en el sistema**

## 📁 Estructura de Archivos

```
RSExpress/
├── index.html                    # Página principal
├── app.js                        # Lógica principal con Traccar integrado
├── styles.css                    # Estilos
│
├── 📦 MÓDULOS TRACCAR
├── traccar.js                    # Módulo de integración Traccar
├── traccar-config.js             # Configuración centralizada
├── traccar-examples.js           # Ejemplos de uso
├── TRACCAR_INTEGRATION.md        # Documentación detallada
│
├── assets/                       # Recursos (imágenes, etc)
├── README.md                     # Readme original
└── install_odoo19_rsexpress.sh   # Script de instalación
```

## 🚀 Características de Traccar Integradas

### ✓ Rastreo en Tiempo Real
- Posición GPS en vivo de conductores
- Actualización de posición cada 2 segundos
- Mapa interactivo con Leaflet

### ✓ Gestión de Dispositivos
- Lista de vehículos/conductores
- Estado online/offline
- Información de dispositivo

### ✓ Reportes y Estadísticas
- Historial de viajes
- Distancia recorrida
- Velocidad promedio y máxima
- Duración de viajes

### ✓ Alertas y Eventos
- Velocidad excesiva
- Entrada/salida de zonas (Geofences)
- Dispositivo desconectado
- Mantenimiento requerido

### ✓ Geofences (Zonas)
- Crear zonas geográficas
- Alertas automáticas
- Estadísticas por zona

## 📋 Archivos Principales

### 1. **traccar.js** - Módulo de Integración
Clase `TraccarIntegration` que maneja:
- Autenticación con Traccar
- Conexión WebSocket
- CRUD de dispositivos
- Rastreo de posiciones
- Gestión de geofences
- Generación de reportes

**Métodos principales:**
```javascript
- initialize() - Inicializar conexión
- authenticate() - Autenticar
- fetchDevices() - Obtener dispositivos
- getDevicePosition(deviceId) - Última posición
- getPositionHistory(deviceId, from, to) - Historial
- createDevice(deviceData) - Crear vehículo
- createGeofence(geofenceData) - Crear zona
- getTripSummary(deviceId, from, to) - Resumen de viajes
- generateActivityReport() - Reporte completo
```

### 2. **traccar-config.js** - Configuración
Gestión centralizada de parámetros:
- Credenciales API
- URLs de servidores (Demo, Producción, Local)
- Parámetros de conexión
- Configuración de rastreo
- Alertas y notificaciones
- Mapas y dispositivos

**Funciones de utilidad:**
```javascript
- getEnvironmentConfig(env) - Obtener config de ambiente
- setEnvironment(env) - Cambiar ambiente
- updateTraccarConfig(path, value) - Actualizar parámetro
- getTraccarConfig(path) - Leer parámetro
- validateTraccarConfig() - Validar
- printTraccarConfig() - Mostrar configuración
```

### 3. **traccar-examples.js** - Ejemplos de Uso
Ejemplos prácticos para:
1. Rastrear conductor en tiempo real
2. Obtener estadísticas diarias
3. Mostrar historial de viajes
4. Configurar alertas de geofence
5. Alertas de velocidad
6. Dashboard de conductores en vivo
7. Exportar reportes a CSV
8. Monitorear conexión
9. Enviar notificaciones
10. Analizar patrones de conducción

### 4. **app.js** - Integración Principal
Métodos integrados en `RSExpressApp`:
```javascript
- initTraccar() - Inicializar
- updateTraccarDevicesList() - Actualizar lista
- handleTraccarPositionUpdate() - Procesar posición
- updateTrackingMapPosition() - Actualizar mapa
- handleTraccarDeviceStatusChange() - Cambio de estado
- handleTraccarEvent() - Procesar evento
- updateTripWithTraccarData() - Actualizar viaje
- startTraccarTracking() - Iniciar rastreo
- stopTraccarTracking() - Detener rastreo
- getTraccarActivityReport() - Obtener reporte
- getTraccarDrivingStats() - Obtener estadísticas
- getTraccarStatus() - Estado de conexión
```

## 💻 Cómo Usar

### Uso Básico

```html
<!-- Los scripts se cargan automáticamente -->
<script src="traccar-config.js"></script>
<script src="traccar.js"></script>
<script src="app.js"></script>
```

### Inicialización Automática

```javascript
// Al crear la aplicación, Traccar se inicializa automáticamente
const app = new RSExpressApp();
```

### Rastrear un Viaje

```javascript
const trip = app.trips[0];
await app.startTraccarTracking(trip, trip.driverTraccarId);

// El mapa se actualiza automáticamente
// La posición se actualiza cada 2 segundos
```

### Obtener Estadísticas

```javascript
const stats = await app.getTraccarDrivingStats(
    deviceId,
    new Date(),
    new Date()
);

console.log(`Distancia: ${stats.distance} km`);
console.log(`Velocidad promedio: ${stats.avgSpeed} km/h`);
```

### Cambiar Ambiente

```javascript
// Cambiar a producción
TraccarConfig.setEnvironment('PRODUCTION');

// O actualizar URL manualmente
TraccarConfig.updateTraccarConfig('ENVIRONMENTS.PRODUCTION.baseUrl', 
    'https://mi-servidor.com/api');
```

## 🔐 Seguridad

### ✓ Implementado
- Bearer token en autenticación
- Conexión WSS (encriptada)
- Headers CORS
- Validación de datos

### ⚠️ Para Producción
- Mover API Key a backend
- Usar variables de entorno
- Implementar validación de origen
- Encriptar datos en BD
- Implementar rate limiting
- Usar certificados SSL válidos

## 📊 Configuración de Ambientes

### Demo (Por defecto)
```javascript
Base URL: https://demo.traccar.org/api
WebSocket: wss://demo.traccar.org/api/socket
Uso: Pruebas y desarrollo
```

### Producción
```javascript
Base URL: https://tu-servidor.com/api
WebSocket: wss://tu-servidor.com/api/socket
Uso: Producción
```

### Local
```javascript
Base URL: http://localhost:8082/api
WebSocket: ws://localhost:8082/api/socket
Uso: Desarrollo local
```

## 🎨 UI Components

### Mapa de Rastreo
- Mapa interactivo con Leaflet
- Marcador de conductor
- Línea de ruta
- Información en popup
- Zoom automático

### Dashboard de Conductores
- Lista en vivo
- Estado online/offline
- Ubicación actual
- Velocidad
- Última actualización

### Panel de Estadísticas
- Distancia recorrida
- Velocidad promedio/máxima
- Duración de viajes
- Eventos registrados

## 🔔 Tipos de Alertas

```javascript
// Velocidad excesiva
event.type === 'speedExceeded'

// Geofence
event.type === 'geofenceEnter' | 'geofenceExit'

// Dispositivo
event.type === 'deviceOnline' | 'deviceOffline'

// Conducción
event.type === 'deviceMoving' | 'deviceStopped'

// Mantenimiento
event.type === 'maintenanceRequired'
```

## 📈 Datos Disponibles

### Device (Dispositivo)
```javascript
{
    id: 123,
    name: "Toyota Prius",
    uniqueId: "352000000000000",
    status: "online",
    lastUpdate: "2025-01-20T10:30:00Z",
    attributes: { category: "car", color: "red" }
}
```

### Position (Posición)
```javascript
{
    id: 456,
    deviceId: 123,
    latitude: 19.4326,
    longitude: -99.1332,
    altitude: 2250,
    speed: 45.5,
    course: 180,
    accuracy: 15,
    fixTime: "2025-01-20T10:30:00Z"
}
```

### Trip (Viaje)
```javascript
{
    distance: 15.5,
    duration: 28,
    startTime: "2025-01-20T08:00:00Z",
    endTime: "2025-01-20T08:28:00Z",
    startAddress: "Punto A",
    endAddress: "Punto B"
}
```

## 🛠️ Troubleshooting

### Conexión rechazada
```javascript
// Verificar API Key
console.log(app.traccar.apiKey);

// Verificar servidor
console.log(app.getTraccarStatus());
```

### WebSocket no conecta
```javascript
// Cambiar a ambiente local o verificar CORS
TraccarConfig.setEnvironment('LOCAL');
```

### Sin posiciones
```javascript
// Verificar que el dispositivo tenga datos
const positions = await app.traccar.fetchDevices();
console.log(positions);
```

## 📚 Documentación Adicional

- [TRACCAR_INTEGRATION.md](./TRACCAR_INTEGRATION.md) - Guía detallada
- [Traccar Oficial](https://www.traccar.org/) - Sitio oficial
- [API Traccar](https://www.traccar.org/api-reference/) - Referencia de API
- [Demo Traccar](https://demo.traccar.org/) - Servidor de pruebas

## 🚀 Próximos Pasos

1. **Backend**
   - Crear API para gestionar dispositivos
   - Almacenar datos en BD
   - Autenticación segura

2. **Frontend**
   - UI mejorada para rastreo
   - Notificaciones en tiempo real
   - Gráficos de estadísticas

3. **Funcionalidades**
   - Historial detallado
   - Exportación de reportes
   - Alertas personalizadas
   - Geofences avanzadas

4. **Integración**
   - Sistema de facturación
   - Integración con Odoo19
   - Push notifications
   - Análisis de datos

## 👥 Soporte

Para reportar problemas o sugerir mejoras:
1. Verificar logs en consola del navegador
2. Revisar configuración en `traccar-config.js`
3. Consultar ejemplos en `traccar-examples.js`
4. Ver documentación completa en `TRACCAR_INTEGRATION.md`

## 📝 Licencia

RS Express - Integración con Traccar
Desarrollado para YoVoyTec SRL

---

**Última actualización:** Noviembre 2025
**Versión de Traccar:** API Compatible con v5.x
**Estado:** ✓ En producción
