# RSExpress - Sistema de Tarifas Pérez Zeledón, Costa Rica ✅

**Fecha de Actualización:** Diciembre 1, 2025

## 📋 Resumen Ejecutivo

Se ha actualizado completamente el **ShippingCalculator** con las nuevas tarifas y ubicaciones para operaciones en **Pérez Zeledón, Costa Rica**.

---

## 💰 Tarifas Implementadas

| Concepto | Tarifa | Unidad |
|----------|--------|--------|
| **Tarifa Base** | ₡200 | Por envío |
| **Precio por km** | ₡200 | Por kilómetro |
| **Rush Hour** | +50% | 16:00-20:00 hrs |
| **Express** | +100% | Envío prioritario |

### Ejemplos de Cálculo

**Ruta: Centro Comercial → Marino Ballena (11.27 km)**
- Tarifa base: ₡200
- Costo distancia: 11.27 km × ₡200 = ₡2,253.18
- **Total: ₡2,453.18**

Si fuera en horario pico (16:00-20:00):
- **Total con rush: ₡2,453.18 × 1.5 = ₡3,679.77**

---

## 🗺️ Ubicaciones Predefinidas en Pérez Zeledón

### HQ RSExpress
- **Coordenadas:** 9.3778°N, -83.7274°O
- **Descripción:** Sede central en Pérez Zeledón

### 10 Ubicaciones Estratégicas

| # | Ubicación | Coordenadas | Distancia HQ |
|---|-----------|-------------|--------------|
| 1 | Centro Comercial Pérez Zeledón, San Isidro | 9.3800, -83.7285 | 0.27 km |
| 2 | Hospital de Pérez Zeledón, San Isidro | 9.3750, -83.7300 | 0.42 km |
| 3 | Mercado Municipal, Buenos Aires | 9.3600, -83.7400 | 2.41 km |
| 4 | Parque Central, Uvita | 9.3156, -83.7310 | 6.93 km |
| 5 | Marino Ballena National Park, Ojochal | 9.2800, -83.7450 | 11.04 km |
| 6 | Supermercado Walmart, San Isidro | 9.3850, -83.7280 | 0.80 km |
| 7 | Colegio San Isidro Labrador, San Isidro | 9.3900, -83.7200 | 1.58 km |
| 8 | Terminal de Autobuses, San Isidro | 9.3820, -83.7360 | 1.05 km |
| 9 | Restaurante El Castillo, Ojochal | 9.2970, -83.7520 | 9.38 km |
| 10 | Playas Uvita y Marino Ballena, Uvita | 9.2900, -83.7380 | 9.83 km |

---

## 🛣️ Sistema de Rutas con Waypoints

### Características Implementadas

✅ **Generación automática de waypoints**
- No lineales (uso de funciones sinusoidales)
- Realistas y naturales
- Configurable (5-20 puntos)

✅ **Información detallada por waypoint**
- Coordenadas exactas (6 decimales)
- Distancia acumulada desde inicio
- Porcentaje de progreso
- Estimación de tiempo

✅ **Cálculo inteligente de distancias**
- Fórmula Haversine para precisión
- Medidas en kilómetros
- Incluye variaciones geográficas

---

## 📊 Estadísticas del Sistema

### Análisis de 90 Rutas Posibles (A → B)

| Métrica | Valor |
|---------|-------|
| **Distancia total** | 532 km |
| **Costo total acumulado** | ₡124,330 |
| **Costo promedio por ruta** | ₡1,381 |
| **Distancia promedio** | 5.91 km |
| **Precio mínimo** | ₡311.73 (0.56 km) |
| **Precio máximo** | ₡2,707.05 (12.54 km) |

### Top 5 Rutas Más Caras
1. Marino Ballena ↔ Colegio San Isidro | 12.54 km | ₡2,707.05
2. Marino Ballena ↔ Walmart | 11.82 km | ₡2,564.71
3. Marino Ballena ↔ Terminal Autobuses | 11.38 km | ₡2,476.96

### Top 5 Rutas Más Baratas
1. Centro Comercial ↔ Walmart | 0.56 km | ₡311.73
2. Centro Comercial ↔ Hospital | 0.58 km | ₡315.96
3. Centro Comercial ↔ Terminal | 0.85 km | ₡370.47

---

## 🔧 Archivos Modificados

### 1. `scripts/delivery/shipping-calculator.js`
**Cambios:**
- Actualización de HQ a Pérez Zeledón (9.3778°N, -83.7274°O)
- 10 ubicaciones predefinidas con coordenadas reales
- Tarifas: ₡200 base + ₡200/km
- Horario pico: +50% (16:00-20:00 hrs)
- Método `generateRoute()` mejorado con waypoints no lineales
- Nuevo método `calculateRouteInfo()` con desglose completo

### 2. `scripts/delivery/perez-zeledon-demo.js` (NUEVO)
**Funcionalidad:**
- Demostración completa del sistema
- Visualización de todas las ubicaciones
- Cálculo de precios desde HQ
- Generación de rutas detalladas
- Estadísticas de rutas
- Salida formateada con tablas y gráficos

---

## 💻 Uso del Sistema

### Importar ShippingCalculator
```javascript
const ShippingCalculator = require('./scripts/delivery/shipping-calculator');
const calculator = new ShippingCalculator();
```

### Calcular precio desde HQ a una ubicación
```javascript
const result = calculator.calculateFromHQ(1);
console.log(`Precio: ₡${result.price}`);
console.log(`Distancia: ${result.distance} km`);
console.log(`¿Horario pico?: ${result.isRushHour}`);
```

### Generar ruta detallada
```javascript
const route = calculator.calculateRouteInfo(1, 5, 8);
console.log(`Waypoints: ${route.waypoints.length}`);
console.log(`Precio final: ₡${route.price}`);
```

### Generar solo waypoints
```javascript
const waypoints = calculator.generateRoute(9.38, -83.728, 9.28, -83.745, 10);
waypoints.forEach(wp => {
    console.log(`(${wp.lat}, ${wp.lng}) - Progreso: ${wp.progress}%`);
});
```

---

## 🚀 Ejecutar la Demostración

```bash
node scripts/delivery/perez-zeledon-demo.js
```

**Salida incluye:**
- ✅ Tarifas vigentes
- ✅ Todas las ubicaciones con coordenadas
- ✅ Pricing desde HQ a cada ubicación
- ✅ Ejemplos de rutas detalladas con waypoints
- ✅ Estadísticas completas de redes de distribución

---

## 🔒 Especificaciones Técnicas

### Algoritmo de Distancia (Haversine)
```
d = 2 × R × arcsin(√[sin²(Δlat/2) + cos(lat1) × cos(lat2) × sin²(Δlng/2)])
```
- Radio de la Tierra: 6,371 km
- Precisión: ±0.5% para distancias < 2,000 km

### Generación de Waypoints
```
latVariation = sin(t×π) × cos(i×0.7) × 0.0015
lngVariation = cos(t×π) × sin(i×0.9) × 0.0015
```
- Crea un patrón natural y no lineal
- Configurable por número de puntos
- Mantiene inicio y fin exactos

### Cálculo de Tarifas
```
base = 200
distanceCost = distance × 200
subtotal = base + distanceCost
final = subtotal × rushMultiplier × expressMultiplier
```

---

## 📋 Verificación de Implementación

✅ Tarifa base: ₡200  
✅ Precio por km: ₡200/km  
✅ Rush hour: +50% (16:00-20:00 hrs)  
✅ 10 ubicaciones predefinidas en Pérez Zeledón  
✅ Coordenadas reales con precisión de 4 decimales  
✅ Generación de rutas con waypoints  
✅ Waypoints no lineales (sinusoidales)  
✅ Sistema de estadísticas completo  
✅ Demostración interactiva funcional  

---

## 📞 Contacto

**RSExpress - Pérez Zeledón, Costa Rica**
- Sistema de Distribución de Última Milla
- Actualizado: 2025-12-01
- Versión: 2.0
