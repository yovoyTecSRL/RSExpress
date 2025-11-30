# ✅ CHECKLIST DE TESTING - OPSCENTER OWL V2 HARDENED

**Módulo:** orbix_fleet_test  
**Componente:** RSExpress OpsCenter  
**Versión:** 2.0.0 - OWL v2 Hardened  
**Fecha:** 2025-11-30

---

## 🚀 PASOS PARA ACTUALIZAR Y PROBAR

### 1️⃣ Actualizar Módulo en Odoo

```bash
# Opción 1: Actualizar vía CLI
python odoo-bin -d TU_BASE_DE_DATOS -u orbix_fleet_test --stop-after-init

# Opción 2: Actualizar con servidor corriendo
python odoo-bin -d TU_BASE_DE_DATOS -u orbix_fleet_test
```

### 2️⃣ Limpiar Cache del Navegador

**Chrome/Edge:**
- `Ctrl + Shift + Delete` → Limpiar cache e imágenes
- O `F12` → Network → Disable cache (con DevTools abierto)

**Firefox:**
- `Ctrl + Shift + Delete` → Todo el historial

### 3️⃣ Reiniciar Odoo (recomendado)

```bash
# Detener Odoo
Ctrl + C

# Reiniciar con logs visibles
python odoo-bin -d TU_BASE_DE_DATOS
```

---

## 🧪 CHECKLIST DE VALIDACIÓN

### ✅ FASE 1: VALIDACIÓN BÁSICA

- [ ] **1.1** Módulo actualiza sin errores en logs de Odoo
- [ ] **1.2** No hay errores Python en servidor
- [ ] **1.3** Assets JS cargados correctamente
- [ ] **1.4** Menu **RSExpress → OpsCenter** visible

### ✅ FASE 2: CARGA INICIAL

- [ ] **2.1** Dashboard carga sin errores JavaScript (F12 Console)
- [ ] **2.2** Aparece mensaje: `🚀 [OpsCenter] Iniciado - OWL v2 Hardened`
- [ ] **2.3** Se muestra spinner de carga (Loading...)
- [ ] **2.4** 6 KPIs se actualizan con números correctos
- [ ] **2.5** Timestamp "Última actualización" aparece

### ✅ FASE 3: REACTIVIDAD (CRÍTICO)

- [ ] **3.1** Tabla de pedidos renderiza con `t-foreach` (no innerHTML)
- [ ] **3.2** Tabla de vehículos renderiza con `t-foreach` (no innerHTML)
- [ ] **3.3** Si no hay datos, aparece mensaje "No hay pedidos activos"
- [ ] **3.4** Badges de estado se muestran correctamente
- [ ] **3.5** Coordenadas GPS formateadas ("Lat: X, Lon: Y" o "Sin GPS")

### ✅ FASE 4: AUTO-REFRESH

- [ ] **4.1** Console muestra `📊 [OpsCenter] Datos actualizados` cada 5 segundos
- [ ] **4.2** KPIs se actualizan automáticamente
- [ ] **4.3** Si datos no cambian, aparece `📦 [OpsCenter] Cache hit - sin cambios`
- [ ] **4.4** No hay overlapping requests (solo 1 RPC a la vez)

### ✅ FASE 5: MANEJO DE ERRORES

**Simular error:** Detener Odoo o cambiar URL del RPC

- [ ] **5.1** Aparece banner amarillo: "⚠️ Error de conexión"
- [ ] **5.2** Notificación toast aparece en esquina
- [ ] **5.3** Console muestra `🔄 [OpsCenter] Reintentando... (1/2)`
- [ ] **5.4** Después de 2 retries, muestra error definitivo
- [ ] **5.5** Botón "🔄 Reintentar" funciona al hacer click

### ✅ FASE 6: LIMPIEZA DE MEMORIA

**Cambiar de vista o cerrar OpsCenter:**

- [ ] **6.1** Console muestra `🛑 [OpsCenter] Limpieza completada`
- [ ] **6.2** Auto-refresh se detiene (no más logs cada 5s)
- [ ] **6.3** No hay memory leaks (verificar en F12 → Memory → Heap Snapshot)

### ✅ FASE 7: PERFORMANCE

- [ ] **7.1** Dashboard carga en <2 segundos
- [ ] **7.2** No hay re-renders innecesarios (verificar con React DevTools Profiler si aplica)
- [ ] **7.3** Smooth scrolling en tablas largas
- [ ] **7.4** CPU usage normal (<10% en idle)

### ✅ FASE 8: COMPATIBILIDAD

- [ ] **8.1** Funciona en Chrome/Edge
- [ ] **8.2** Funciona en Firefox
- [ ] **8.3** Funciona en Safari (si aplica)
- [ ] **8.4** Responsivo en móviles (Bootstrap debe adaptar)

---

## 🔧 DEBUGGING - SI ALGO FALLA

### Error: "Template not found"

```bash
# Reiniciar Odoo para recargar QWeb templates
Ctrl + C
python odoo-bin -d DATABASE -u orbix_fleet_test
```

### Error: "Cannot read property 'rpc' of undefined"

```javascript
// Verificar que useService está importado
import { useService } from "@web/core/utils/hooks";
```

### Error: JavaScript no se actualiza

```bash
# Forzar recarga de assets
1. Ctrl + Shift + R (hard reload)
2. O detener Odoo, borrar __pycache__, reiniciar
```

### Error: RPC falla con 404

```python
# Verificar que el controller está en __init__.py
from . import controllers
```

### Error: Tablas no se actualizan

```javascript
// Verificar console logs
console.log("Estado orders:", this.state.orders);
console.log("Estado vehicles:", this.state.vehicles);
```

---

## 📊 LOGS ESPERADOS EN CONSOLE (F12)

### Carga inicial (correcto):
```
🚀 [OpsCenter] Iniciado - OWL v2 Hardened
📊 [OpsCenter] Datos actualizados
```

### Auto-refresh funcionando (correcto):
```
📊 [OpsCenter] Datos actualizados
📦 [OpsCenter] Cache hit - sin cambios
📦 [OpsCenter] Cache hit - sin cambios
📊 [OpsCenter] Datos actualizados  ← Cambió algo
```

### Error de conexión (correcto):
```
❌ [OpsCenter] Error al cargar datos: Error: ...
🔄 [OpsCenter] Reintentando... (1/2)
❌ [OpsCenter] Error al cargar datos: Error: ...
🔄 [OpsCenter] Reintentando... (2/2)
❌ [OpsCenter] Error al cargar datos: Error: ...
```

### Cierre del componente (correcto):
```
🛑 [OpsCenter] Limpieza completada
```

---

## 🎯 VALIDACIÓN DE ARQUITECTURA OWL V2

### ✅ Verificar que NO aparece:

- ❌ `document.querySelector`
- ❌ `innerHTML`
- ❌ `getElementById`
- ❌ Referencias a jQuery (`$`)
- ❌ Errores de "Cannot read property of undefined"

### ✅ Verificar que SÍ aparece:

- ✅ `useState()`
- ✅ `useRef()`
- ✅ `onMounted()` y `onWillUnmount()`
- ✅ `t-foreach` en template
- ✅ `t-esc` para datos reactivos
- ✅ `useService("rpc")`
- ✅ `useService("notification")`

---

## 📈 MÉTRICAS DE ÉXITO

| Métrica | Objetivo | ¿Cumple? |
|---------|----------|----------|
| **Tiempo de carga inicial** | <3s | ⬜ |
| **Auto-refresh funcionando** | Cada 5s exactos | ⬜ |
| **Errores JavaScript** | 0 | ⬜ |
| **Errores Python** | 0 | ⬜ |
| **Cache funcionando** | Logs de "Cache hit" visibles | ⬜ |
| **Retry automático** | 2 intentos antes de error final | ⬜ |
| **Limpieza memoria** | Log "Limpieza completada" | ⬜ |
| **Reactividad tablas** | Actualización sin parpadeos | ⬜ |

---

## 🚨 PROBLEMAS CONOCIDOS Y SOLUCIONES

### Problema: "Pedidos no aparecen en tabla"

**Causa:** Modelo `rsexpress.delivery.order` sin datos

**Solución:**
```python
# Crear pedidos de prueba desde Python
order = env['rsexpress.delivery.order'].create({
    'customer_name': 'Cliente Test',
    'customer_phone': '123456789',
    'pickup_address': 'Calle A',
    'delivery_address': 'Calle B',
    'state': 'new',
})
```

### Problema: "Vehículos sin GPS"

**Causa:** Campos `x_last_latitude` y `x_last_longitude` vacíos

**Solución:**
```python
# Actualizar vehículo con GPS de prueba
vehicle = env['fleet.vehicle'].search([], limit=1)
vehicle.write({
    'x_last_latitude': -17.783298,
    'x_last_longitude': -63.182129,
    'x_last_gps_ping': fields.Datetime.now(),
})
```

---

## 🏆 CRITERIO DE ACEPTACIÓN

**El módulo está 100% funcional cuando:**

1. ✅ Dashboard carga sin errores
2. ✅ KPIs se actualizan automáticamente cada 5s
3. ✅ Tablas muestran datos con `t-foreach` (sin acceso al DOM)
4. ✅ Errores se manejan con retry automático y banner UX
5. ✅ Cache evita re-renders innecesarios
6. ✅ Limpieza de memoria funciona al cerrar
7. ✅ Console muestra logs estructurados (`🚀`, `📊`, `⚠️`)
8. ✅ Zero errores en console (F12)

---

**Si todos los checkboxes están ✅, el módulo está en PRODUCCIÓN READY** 🎉

---

**Documento generado por:** Sistemas Órbix - Senior Odoo 19 Architect  
**Última actualización:** 2025-11-30
