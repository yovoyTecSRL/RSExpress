# 📦 Entregas Pérez Zeledón - Sistema de Tarjetas de Entrega

## 🎯 Resumen

Se han creado ejemplos completos de tarjetas de entrega (`DeliveryCard`) con datos reales de Pérez Zeledón, Costa Rica, integrados con el sistema de cálculo de tarifas de RSExpress.

---

## 📋 Nuevos Archivos Creados

### 1. **`scripts/utils/delivery-examples-perez-zeledon.js`**
- **Propósito:** Ejemplos de entregas con datos de Pérez Zeledón
- **Contenido:**
  - 6 entregas de ejemplo con diferentes estados
  - Puntos de retiro y destino reales
  - Cálculos de costo y distancia
  - Funciones de estadísticas

### 2. **`deliveries-perez-zeledon.html`**
- **Propósito:** Página de demostración visual
- **Características:**
  - Grid responsivo de entregas
  - Sistema de filtros (estado, prioridad)
  - Estadísticas en tiempo real
  - Diseño moderno con animaciones

---

## 📦 Estructura de Datos de una Entrega

```javascript
{
    id: '#1007',
    cliente: 'María García López',
    descripcion: 'Electrodoméstico - Refrigerador Samsung 550L',
    puntoRetiro: 'Centro Comercial, San Isidro',        // ← NUEVO
    ubicacion: 'La Unión, San Isidro',
    estado: 'pending',
    prioridad: 'normal',
    distancia: '2.5 km',                               // ← NUEVO
    costo: '₡2,500.00',                                // ← MEJORADO
    notas: 'Llamar 30 min antes de llegar',
    timeline: [...]
}
```

### Campos Nuevos/Mejorados:
- **`puntoRetiro`:** Ubicación donde se retira el paquete (opcional)
- **`distancia`:** Distancia del viaje (ej: "2.5 km")
- **`costo`:** Costo calculado (ej: "₡2,500.00")

---

## 🎨 Tarjeta de Entrega Actualizada

La tarjeta ahora muestra:

### Columna Izquierda (Información):
```
📋 Descripción
🏪 Punto de Retiro (nuevo)
📍 Punto de Entrega
⏱️  Estado
⚡ Prioridad
📝 Notas
```

### Columna Derecha (Historial + Costo):
```
📋 Historial (Timeline)
────────────────────
Costo del envío
₡2,500.00 (22px, rojo oscuro)
📏 2.5 km (gris claro)
```

---

## 📊 Entregas de Ejemplo Incluidas

### #1007 - María García López
- **Distancia:** 2.5 km
- **Costo:** ₡2,500.00
- **Estado:** Pendiente
- **Punto Retiro → Entrega:** Centro Comercial → La Unión

### #1008 - Roberto Gómez Chávez
- **Distancia:** 1.5 km
- **Costo:** ₡2,300.00
- **Estado:** En Tránsito (Alta Prioridad)
- **Punto Retiro → Entrega:** Walmart → Terminal de Autobuses

### #1009 - Software Solutions S.A.
- **Distancia:** 11.8 km
- **Costo:** ₡4,360.00
- **Estado:** Completada
- **Punto Retiro → Entrega:** Centro Comercial → Parque Central, Uvita

### #1010 - Carmen Morales Vega
- **Distancia:** 15.2 km
- **Costo:** ₡5,040.00
- **Estado:** Pendiente (Alta Prioridad)
- **Punto Retiro → Entrega:** Hospital → Restaurante El Castillo, Ojochal

### #1011 - Turismo Costa Rica S.A.
- **Distancia:** 18.5 km
- **Costo:** ₡5,700.00
- **Estado:** Completada
- **Punto Retiro → Entrega:** Walmart → Marino Ballena National Park

### #1012 - David López Castillo
- **Distancia:** 0.8 km
- **Costo:** ₡2,160.00
- **Estado:** Fallida
- **Punto Retiro → Entrega:** Walmart → Colegio San Isidro Labrador

---

## 💻 Cómo Usar

### 1. **En la Página HTML**
```html
<!-- Incluir los scripts -->
<script src="/scripts/utils/delivery-card.js"></script>
<script src="/scripts/utils/delivery-examples-perez-zeledon.js"></script>

<!-- El contenedor se crea automáticamente -->
<div id="deliveryExamplesContainer"></div>
```

### 2. **Crear una Entrega Programáticamente**
```javascript
const delivery = new DeliveryCard({
    id: '#1007',
    cliente: 'María García López',
    descripcion: 'Electrodoméstico - Refrigerador',
    puntoRetiro: 'Centro Comercial, San Isidro',
    ubicacion: 'La Unión, San Isidro',
    estado: 'pending',
    prioridad: 'normal',
    distancia: '2.5 km',
    costo: '₡2,500.00',
    notas: 'Llamar 30 min antes'
});

// Montar en página
delivery.mount('#container');
```

### 3. **Acceder a los Ejemplos**
```javascript
// Ver todas las entregas de ejemplo
console.log(deliveryExamples);

// Renderizar entregas
renderDeliveryExamples();

// Mostrar estadísticas
showDeliveryStats();
```

---

## 📈 Estadísticas Automáticas

La página muestra automáticamente:

| Métrica | Ejemplo |
|---------|---------|
| **Total de Entregas** | 6 |
| **Completadas** | 2 |
| **En Tránsito** | 1 |
| **Pendientes** | 2 |
| **Fallidas** | 1 |
| **Distancia Total** | ~49.3 km |
| **Costo Total** | ₡21,060.00 |

---

## 🔗 URLs de Acceso

### Página de Entregas Pérez Zeledón
```
http://localhost:5555/deliveries-perez-zeledon.html
```

### Características:
- ✅ Grid responsivo de entregas
- ✅ Filtros por estado y prioridad
- ✅ Estadísticas en tiempo real
- ✅ Diseño moderno con animaciones
- ✅ Compatibilidad móvil

---

## 🎨 Cálculo de Tarifas Integrado

Cada entrega muestra el costo calculado según:

```
Fórmula: precio = (distancia ≤ 10) ? 2000 : 2000 + ((distancia - 10) × 200)
```

**Ejemplos:**
- 2.5 km → ₡2,500.00 (tarifa plana)
- 11.8 km → ₡2,000 + (1.8 × 200) = ₡2,360.00
- 15.2 km → ₡2,000 + (5.2 × 200) = ₡3,040.00

---

## ✨ Características Nuevas

### En DeliveryCard:
✅ Campo `puntoRetiro` (punto de recogida)
✅ Campo `distancia` (mostrado en tarjeta)
✅ Mejor presentación del costo
✅ Distancia visible bajo el costo

### En Página HTML:
✅ Estadísticas dinámicas
✅ Sistema de filtros funcional
✅ Diseño responsivo
✅ Animaciones suaves
✅ Contador de tiempo de actualización

---

## 🚀 Próximos Pasos

1. **Integración con Backend:** Cargar datos reales desde API
2. **Mapas Interactivos:** Mostrar rutas en mapa Leaflet
3. **Notificaciones en Tiempo Real:** WebSockets para actualizaciones
4. **Exportación de Reportes:** PDF, Excel con datos de entregas
5. **Analytics:** Gráficos de entregas por zona/conductor

---

## 📞 Contacto

**RSExpress - Pérez Zeledón, Costa Rica**
- Sistema de entregas de última milla
- Actualizado: 2025-12-01
- Versión: 3.0 (con Punto de Retiro)
