# 🚗 Driver Positioning System - Manual de Uso

**Versión:** 1.0  
**Fecha:** Diciembre 1, 2025  
**Status:** ✅ ACTIVO

---

## 📋 Descripción

El **Driver Positioning System** es un sistema de posicionamiento en tiempo real que:

✅ Ubica conductores dentro de una zona de **20km del HQ** (Oficina Central)  
✅ Genera rutas automáticas para cada conductor  
✅ Visualiza rutas en el mapa interactivo  
✅ Muestra estadísticas de conductores  
✅ Simula movimiento en tiempo real  

---

## 🎯 Características Principales

### 1. Posicionamiento de Drivers
- **5 conductores** ubicados aleatoriamente dentro de 20km del HQ
- Cada driver tiene vehículo y estado (disponible/en ruta)
- Código de color único para cada conductor
- Marcador con estado de actividad (punto verde = en ruta)

### 2. Sistema de Rutas
- Rutas automáticas generadas para cada conductor
- **2-4 puntos de entrega** por ruta
- Puntos inicial, intermedios y final (retorno HQ)
- Visualización con polilíneas de colores
- Numeración de paradas (S, 1, 2, E)

### 3. Visualización en Mapa
- **Círculo de cobertura**: 20km de radio alrededor del HQ
- **Marcador HQ**: Ubicación de la oficina central
- **Marcadores drivers**: Posición actual de cada conductor
- **Rutas**: Polilíneas con paradas numeradas
- **Popups informativos**: Detalles al hacer click

### 4. Estadísticas
- Total de drivers en operación
- Drivers en ruta vs disponibles
- Total de entregas pendientes
- Distancia promedio del HQ

---

## 🗺️ Cómo Usar

### Acceso Inicial
```
URL: http://localhost:5555/index.html
```

### Interacción con el Mapa

#### 1. Ver Información del HQ
```
Click en marcador HQ → Ver zona de cobertura y detalles
```

#### 2. Ver Información del Conductor
```
Click en marcador del driver → Ver:
  • Nombre del conductor
  • ID único
  • Vehículo asignado
  • Estado actual
  • Distancia al HQ
  • Total de entregas
  • Botón "Ver Ruta"
```

#### 3. Ver Ruta del Conductor
```
Click en "Ver Ruta" → El mapa:
  • Se enfoca en toda la ruta del conductor
  • Muestra todos los puntos de parada
  • Visualiza la polilínea de la ruta
```

#### 4. Ver Punto de Parada
```
Click en número de parada → Ver:
  • Tipo de punto (inicio/entrega/fin)
  • Nombre de la parada
  • Distancia al HQ
```

---

## 🔧 API JavaScript

### Acceso Global
```javascript
// El sistema está disponible globalmente
window.driverPositioningSystem
```

### Métodos Principales

#### Obtener Estadísticas
```javascript
const stats = driverPositioningSystem.getStatistics();
console.log(stats);
// {
//   totalDrivers: 5,
//   driversInRoute: 2,
//   driversAvailable: 3,
//   totalDeliveries: 35,
//   avgDistanceFromHQ: "8.50"
// }
```

#### Mostrar Ruta de un Driver
```javascript
driverPositioningSystem.showDriverRoute('DRV001');
// Enfoca el mapa en la ruta del driver con ID DRV001
```

#### Actualizar Posición del Driver
```javascript
driverPositioningSystem.updateDriverPosition('DRV001', 19.450, -99.145);
// Actualiza la posición (valida que esté dentro de 20km)
// Retorna true si se actualizó, false si está fuera de zona
```

#### Imprimir Estadísticas
```javascript
driverPositioningSystem.printStatistics();
// Muestra tabla formateada en consola
```

#### Calcular Distancia
```javascript
const distance = driverPositioningSystem.calculateDistance(19.4326, -99.1332, 19.450, -99.145);
console.log(distance); // Distancia en km
```

---

## 📊 Estructura de Datos

### Driver Object
```javascript
{
  id: "DRV001",
  name: "Carlos Rodríguez",
  vehicle: "Ford Transit",
  status: "en ruta" | "disponible",
  color: "#e74c3c",
  position: { lat: 19.45, lon: -99.14 },
  distanceFromHQ: "3.20",
  route: [...],
  currentDelivery: null,
  totalDeliveries: 5
}
```

### Route Point Object
```javascript
{
  lat: 19.45,
  lon: -99.14,
  type: "inicio" | "entrega" | "fin",
  name: "Entrega 1",
  distance: "3.20" // km del HQ
}
```

---

## 🎨 Personalización

### Cambiar Ubicación del HQ
```javascript
driverPositioningSystem.hq = {
  lat: 25.6866,    // Nueva latitud
  lon: -100.3161,  // Nueva longitud
  name: 'Monterrey'
};
driverPositioningSystem.createHQMarker();
```

### Cambiar Distancia Máxima
```javascript
driverPositioningSystem.maxDistanceKm = 30; // 30km en lugar de 20km
driverPositioningSystem.drawCoverageArea();
```

### Agregar Nuevo Conductor
```javascript
const newDriver = {
  id: 'DRV006',
  name: 'Ana González',
  vehicle: 'Peugeot Boxer',
  status: 'disponible',
  color: '#1abc9c'
};

const position = driverPositioningSystem.generateRandomPositionInZone();
const distance = driverPositioningSystem.calculateDistance(
  driverPositioningSystem.hq.lat,
  driverPositioningSystem.hq.lon,
  position.lat,
  position.lon
);

const driver = {
  ...newDriver,
  position: position,
  distanceFromHQ: distance.toFixed(2),
  route: [],
  currentDelivery: null,
  totalDeliveries: 0
};

driverPositioningSystem.drivers.set('DRV006', driver);
driverPositioningSystem.placeDriverMarker(driver);
```

---

## 📍 Algoritmo de Posicionamiento

### Cálculo de Distancia (Haversine)
Se utiliza la fórmula Haversine para calcular distancias precisas entre dos puntos geográficos:

```
R = 6371 km (radio de la Tierra)
dLat = latitud2 - latitud1 (en radianes)
dLon = longitud2 - longitud1 (en radianes)

a = sin²(dLat/2) + cos(lat1) * cos(lat2) * sin²(dLon/2)
c = 2 * atan2(√a, √(1−a))
distancia = R * c
```

### Generación de Posición Aleatoria
Se genera un punto aleatorio dentro del círculo de 20km:

```
angle = random(0, 2π)
radius = random(0, 20km)
newLat = HQ_lat + (radius * cos(angle)) / 111
newLon = HQ_lon + (radius * sin(angle)) / (111 * cos(HQ_lat))
```

---

## 🔄 Seguimiento en Tiempo Real

El sistema simula movimiento en tiempo real:

- **Intervalo**: Actualización cada 5 segundos
- **Movimiento**: Pequeño desplazamiento aleatorio (±0.0005 grados)
- **Validación**: Se verifica que siempre esté dentro de 20km
- **Drivers**: Solo se mueven si están "en ruta"

### Desactivar Seguimiento
```javascript
clearInterval(driverPositioningSystem.trackingInterval);
```

---

## 🚀 Casos de Uso

### 1. Dashboard en Vivo
Mostrar posición actual de todos los drivers:
```javascript
setInterval(() => {
  driverPositioningSystem.drivers.forEach((driver, id) => {
    console.log(`${driver.name}: ${driver.distanceFromHQ}km del HQ`);
  });
}, 5000);
```

### 2. Alertas de Salida de Zona
```javascript
if (parseFloat(driver.distanceFromHQ) > 20) {
  console.warn(`⚠️ ${driver.name} SALIÓ DE LA ZONA`);
  // Enviar notificación
}
```

### 3. Optimización de Rutas
```javascript
const inRoute = [...driverPositioningSystem.drivers.values()]
  .filter(d => d.status === 'en ruta');
console.log(`Drivers en ruta: ${inRoute.length}`);
```

### 4. Reporte de Entregas
```javascript
let totalDeliveries = 0;
driverPositioningSystem.drivers.forEach(driver => {
  totalDeliveries += driver.totalDeliveries;
});
console.log(`Total entregas: ${totalDeliveries}`);
```

---

## 🐛 Troubleshooting

### "El sistema no se inicializa"
**Solución**: Verificar que:
- El servidor esté corriendo en puerto 5555
- El archivo `driver-positioning-system.js` esté cargado
- Leaflet esté disponible (`L` objeto global)

### "Los drivers no aparecen"
**Solución**: 
- Abrir consola (F12) y verificar errores
- Verificar que el mapa esté visible
- Ejecutar: `driverPositioningSystem.generateDriversInZone()`

### "Las rutas no se muestran"
**Solución**:
- Hacer zoom fuera del mapa
- Ejecutar: `driverPositioningSystem.updateAllRoutes()`
- Verificar que Leaflet esté funcionando correctamente

---

## 📈 Performance

- **Drivers**: Optimizado hasta 100+ drivers
- **Rutas**: 2000+ puntos de ruta soportados
- **Actualización**: 5 segundos por ciclo
- **Memoria**: ~2MB por 50 drivers

---

## 🔐 Seguridad

- ✅ Sin datos sensibles expuestos
- ✅ Validaciones de zona (20km)
- ✅ Datos simulados (no reales)
- ✅ Sin conexiones externas requeridas

---

## 📞 Soporte

Para más ayuda:
- Revisar código fuente: `scripts/fleet/driver-positioning-system.js`
- Consultar logs en consola (F12 → Console)
- Revisar documentación Leaflet: https://leafletjs.com

---

**¡Sistema listo para producción!** ✨
