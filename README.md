# 🚀 RSExpress Logistics - Sistema Completo de Gestión

**Versión:** 19.0.2.0.0  
**Odoo:** 19  
**Autor:** Sistemas Órbix  
**Licencia:** LGPL-3

---

## 🎯 ¿Qué es RSExpress?

Sistema completo de gestión logística para empresas de mensajería y entregas, con tracking en tiempo real, OpsCenter estilo "Uber Dispatch" y gestión inteligente de flota.

---

## ✨ Características Principales

### 📦 Gestión de Pedidos
- **5 estados de entrega:** Nuevo → Asignado → En Ruta → Entregado / Fallido
- **Código automático:** RSX-00001, RSX-00002, etc.
- **Vistas múltiples:** Kanban, Lista, Formulario
- **Chatter integrado:** Seguimiento de actividades y mensajes
- **Asignación de vehículos:** Relación directa con fleet.vehicle

### 🚗 Gestión de Flota
- **Integración con módulo Fleet:** Hereda funcionalidad estándar de Odoo
- **Sin contaminación:** No hay campos de pedidos en vehículos
- **Branding RSExpress:** Solo título personalizado en formulario

### 🎛️ OpsCenter Dashboard
- **6 KPIs en tiempo real:**
  - Total de pedidos
  - Pedidos activos
  - Conductores disponibles
  - Conductores en ruta
  - Entregas completadas hoy
  - Entregas fallidas hoy

- **Tabla de pedidos activos:** Con cliente, direcciones, estado, vehículo
- **Tabla de conductores:** Con GPS, último ping, entrega activa, KM del día
- **Auto-refresh:** Actualización automática cada 5 segundos
- **Mapa GPS:** Placeholder listo para integración Traccar

---

## 📂 Estructura del Módulo

```
orbix_fleet_test/
├── models/
│   ├── fleet_vehicle_ext.py           # Herencia limpia de fleet.vehicle
│   └── rsexpress_delivery_order.py    # Modelo de pedidos (5 estados)
│
├── views/
│   ├── fleet_vehicle_*.xml            # Vistas heredadas (solo título)
│   ├── rsexpress_delivery_*.xml       # Vistas de pedidos
│   └── rsexpress_opscenter_*.xml      # Dashboard OpsCenter
│
├── controllers/
│   └── opscenter.py                   # API JSON para dashboard
│
├── static/src/js/
│   └── opscenter.js                   # Frontend del dashboard
│
├── data/
│   └── ir_sequence.xml                # Secuencia RSX-00001
│
└── security/
    └── ir.model.access.csv            # Permisos de acceso
```

---

## 🔧 Instalación

### 1. Copiar el módulo
```bash
cp -r orbix_fleet_test /opt/odoo/custom/addons/
chown -R odoo:odoo /opt/odoo/custom/addons/orbix_fleet_test
```

### 2. Actualizar lista de módulos
Ir a: **Aplicaciones → Actualizar lista de aplicaciones**

### 3. Instalar módulo
Buscar: **RSExpress Logistics**  
Click: **Instalar**

### 4. O actualizar vía comando
```bash
python odoo-bin -d tu_base_datos -u orbix_fleet_test
```

---

## 🎮 Uso del Sistema

### Crear un Pedido
1. Ir a: **RSExpress → Pedidos → Ver Pedidos**
2. Click: **Crear**
3. Llenar datos del cliente y direcciones
4. Asignar vehículo (opcional)
5. Guardar

### Transiciones de Estado
Desde el formulario del pedido, usar los botones en el header:

```
[✓ Asignar] → Estado: Asignado
[🚗 En Ruta] → Estado: En Ruta  
[✅ Entregado] → Estado: Entregado
[❌ Fallido] → Estado: Fallido
```

### Usar el OpsCenter
1. Ir a: **RSExpress → OpsCenter**
2. Ver KPIs actualizándose cada 5 segundos
3. Revisar pedidos activos en la tabla
4. Monitorear conductores disponibles

---

## 📊 API del OpsCenter

### Endpoint JSON
```
POST /rsexpress/opscenter/data
Auth: user
Content-Type: application/json
```

### Respuesta
```json
{
  "kpi_total_orders": 15,
  "kpi_active_orders": 8,
  "kpi_completed_today": 5,
  "kpi_failed_today": 1,
  "kpi_available_drivers": 3,
  "kpi_busy_drivers": 2,
  "orders": [...],
  "vehicles": [...],
  "last_update": "2025-11-30 10:30:15"
}
```

---

## 🎨 Estados y Colores

| Estado | Color | Descripción |
|--------|-------|-------------|
| Nuevo | 🔵 Azul | Pedido creado, sin asignar |
| Asignado | 🔵 Azul oscuro | Vehículo asignado |
| En Ruta | 🟡 Amarillo | Conductor en camino |
| Entregado | 🟢 Verde | Entrega completada |
| Fallido | 🔴 Rojo | Entrega no completada |

---

## 🔐 Permisos

El módulo crea los siguientes permisos automáticamente:

- **rsexpress.delivery.order** → Acceso a todos los usuarios
- **fleet.vehicle** → Permisos heredados del módulo fleet

---

## 🗺️ Roadmap Futuro

### Fase 2 (Próximamente)
- [ ] Integración Traccar GPS real
- [ ] Mapa con Leaflet.js
- [ ] Notificaciones WhatsApp (Respond.io)
- [ ] Firma digital en entregas
- [ ] Foto de prueba de entrega
- [ ] Estados adicionales (pickup, package, delivering)
- [ ] Vista de calendario
- [ ] Reportes avanzados

---

## 🐛 Troubleshooting

### El OpsCenter no carga datos
1. Verificar que hay pedidos creados
2. Verificar consola del navegador (F12)
3. Verificar permisos del usuario actual
4. Verificar logs de Odoo: `tail -f /var/log/odoo/odoo.log`

### Los pedidos no se crean
1. Verificar secuencia: `data/ir_sequence.xml`
2. Verificar permisos: `security/ir.model.access.csv`
3. Actualizar módulo: `-u orbix_fleet_test`

### Error de referencia en menús
Si aparece error de menú roto, actualizar el módulo completo:
```bash
python odoo-bin -d tu_bd -u orbix_fleet_test --log-level=debug
```

---

## 📞 Soporte

**Email:** soporte@sistemasorbix.com  
**Web:** https://sistemasorbix.com  
**Documentación completa:** Ver `ESTRUCTURA_MODULO.md`

---

## 📝 Changelog

### v19.0.2.0.0 (30/11/2025)
- ✅ OpsCenter Dashboard estilo Uber Dispatch
- ✅ Auto-refresh cada 5 segundos
- ✅ 6 KPIs en tiempo real
- ✅ Tabla de conductores con GPS
- ✅ Manifest limpio y organizado
- ✅ Documentación completa

### v19.0.1.0.0 (30/11/2025)
- ✅ Modelo rsexpress.delivery.order (5 estados)
- ✅ Vistas: Form, List, Kanban
- ✅ Secuencia automática RSX-00001
- ✅ Integración con fleet.vehicle
- ✅ Chatter integrado

---

**¡Gracias por usar RSExpress Logistics!** 🚀

Desarrollado con ❤️ por Sistemas Órbix

### 1. **Estados Operativos**
El vehículo puede estar en 9 estados diferentes:
- `available` → Disponible
- `assigned` → Asignado
- `on_route` → En ruta de recogida
- `picked` → Paquete recogido
- `delivering` → En camino de entrega
- `delivered_ok` → Entregado exitosamente
- `delivered_issue` → Entregado con incidencias
- `failed` → Intento fallido
- `cancelled` → Cancelado

### 2. **KPIs Automáticos**
- Órdenes completadas
- Órdenes fallidas
- Tasa de éxito (%)
- Rating promedio
- Total KM recorridos
- Distancia recorrida hoy

### 3. **Tracking GPS**
- Actualización de posición en tiempo real
- Cálculo automático de distancias con fórmula Haversine
- Registro en chatter de movimientos > 1km
- Almacenamiento de última posición conocida

### 4. **Botones de Acción**
Botones dinámicos en el formulario que aparecen según el estado:
- 📋 Asignar Pedido
- 🚗 En Ruta
- 📦 Confirmar Recogida
- 🚚 En Camino
- ✅ Entregado
- ⚠️ Con Incidencias
- ❌ Intento Fallido
- 🚫 Cancelar Entrega
- 🔄 Marcar Disponible

---

## 📦 Instalación

### Requisitos
- Odoo 19
- Módulos: `fleet`, `hr`

### Pasos
1. Copiar carpeta `orbix_fleet_test` a `/opt/odoo/custom/addons/`
2. Reiniciar Odoo: `sudo systemctl restart odoo`
3. Apps → Actualizar lista
4. Buscar "Orbix Fleet Test"
5. Instalar

---

## 🔧 Uso

### Crear un Vehículo RSExpress

1. Ir a: **RSExpress → Gestión de Flota → Vehículos (Lista)**
2. Clic en **Nuevo**
3. Completar datos obligatorios:
   - Modelo
   - Matrícula
   - **Código RSExpress** (único)
4. Asignar mensajero en campo `Mensajero Asignado`
5. Guardar

### Gestionar una Entrega

#### Flujo Completo:
1. **Asignar Pedido** → Estado: `assigned`
2. **En Ruta** → Estado: `on_route`
3. **Confirmar Recogida** → Estado: `picked`
4. **En Camino** → Estado: `delivering`
5. **Entregado** → Estado: `delivered_ok` (incrementa KPIs)

#### Flujo con Problemas:
- **Con Incidencias** → Estado: `delivered_issue`
- **Intento Fallido** → Estado: `failed` (incrementa fallos)
- **Cancelar** → Estado: `cancelled`

### Actualizar GPS (Desde Código)

```python
vehicle = self.env['fleet.vehicle'].browse(vehicle_id)
vehicle.update_gps(lat=9.9281, lon=-84.0907)  # Coordenadas San José, CR
```

### Método Rápido: Completar Ciclo

Para pruebas rápidas, existe el botón:
**🚚 Completar Ciclo de Entrega**

Ejecuta automáticamente: `assigned` → `on_route` → `picked` → `delivering` → `delivered_ok`

---

## 📊 Vistas

### Vista Lista
Muestra columnas:
- Código RSExpress
- Mensajero asignado
- Estado operativo (con colores)
- Órdenes completadas
- Tasa de éxito
- Distancia hoy
- Último ping GPS

### Vista Kanban
Agrupada por estado operativo:
- Muestra KPIs en cada tarjeta
- Información GPS en tiempo real
- Progreso visual de entregas

### Vista Formulario
- Botones dinámicos en header
- Sección RSExpress Logistics con todos los campos
- Sección KPIs de Performance
- Sección Tracking GPS
- Chatter con historial de eventos

---

## 🔄 Automatizaciones

### Cron Job: Reset Distancia Diaria
Configurar en **Ajustes → Técnico → Acciones Programadas**:

- **Nombre:** Resetear Distancia Diaria RSExpress
- **Modelo:** fleet.vehicle
- **Función:** `cron_reset_daily_distance`
- **Intervalo:** Diariamente a las 00:00
- **Código:**
```python
model.cron_reset_daily_distance()
```

---

## 🔌 Integraciones Futuras

### WhatsApp Respond.io
El método `notify_customer(event)` está preparado para integración con Respond.io API.

**Eventos soportados:**
- `delivered_ok` → Notificación de entrega exitosa
- `delivered_issue` → Notificación de incidencias
- `failed` → Notificación de fallo
- `cancelled` → Notificación de cancelación

### Modelo delivery.order
Los campos `x_active_delivery_id` y `x_assigned_deliveries_ids` están preparados para conectar con un modelo de órdenes de entrega futuro.

---

## 📝 Campos del Modelo

### Identificadores
- `x_internal_code` (Char, requerido, único)
- `x_qr_delivery_tag` (Char)

### Estado y Performance
- `x_operational_status` (Selection, 9 estados)
- `x_orders_completed` (Integer)
- `x_orders_failed` (Integer)
- `x_rating_score` (Float)
- `x_success_rate` (Float, computado)

### GPS
- `x_last_gps_ping` (Datetime)
- `x_last_latitude` (Float)
- `x_last_longitude` (Float)
- `x_distance_today` (Float)
- `x_total_km` (Float)

### Relaciones
- `x_driver_id` (Many2one → hr.employee)
- `x_next_driver_id` (Many2one → hr.employee)
- `x_load_capacity` (Integer)

---

## 🛠️ Métodos Disponibles

### Cambio de Estado
- `action_set_available()`
- `action_set_assigned()`
- `action_set_on_route()`
- `action_set_picked()`
- `action_set_delivering()`
- `action_set_delivered_ok()`
- `action_set_delivered_issue()`
- `action_set_failed()`
- `action_set_cancelled()`

### Gestión de Entregas
- `assign_delivery(order_id=None)`
- `pickup_delivery()`
- `confirm_delivery(success=True)`
- `fail_delivery()`

### Tracking
- `update_gps(lat, lon)`
- `_calculate_haversine_distance(lat1, lon1, lat2, lon2)`

### Notificaciones
- `notify_customer(event)`

### Utilidades
- `action_complete_delivery_cycle()`
- `cron_reset_daily_distance()`

---

## 📈 KPIs y Reportes

### Métricas Principales
- **Tasa de Éxito:** `(órdenes completadas / total órdenes) * 100`
- **Distancia Total:** Acumulado histórico
- **Distancia Hoy:** Reseteo automático diario
- **Rating Score:** Preparado para sistema de calificación

### Análisis Recomendados
- Vehículos más eficientes
- Mensajeros con mejor performance
- Rutas más utilizadas
- Tiempos promedio de entrega

---

## 🎨 Personalización

### Colores en Vista Lista
Los estados tienen decoraciones automáticas:
- 🟢 Verde: `available`
- 🔵 Azul: `assigned`, `on_route`
- 🟡 Amarillo: `picked`, `delivering`
- 🟣 Morado: `delivered_ok`
- ⚫ Gris: `delivered_issue`, `failed`, `cancelled`

---

## 🐛 Troubleshooting

### Error: "El Código RSExpress debe ser único"
**Solución:** Asignar un código diferente a cada vehículo.

### Error: "El vehículo debe estar disponible"
**Solución:** Primero ejecutar `Marcar Disponible` antes de asignar nueva entrega.

### GPS no se actualiza
**Solución:** Verificar que `update_gps()` reciba coordenadas válidas.

---

## 📞 Soporte

**Desarrollador:** Sistemas Órbix  
**Versión:** 19.0.1.0.0  
**Licencia:** LGPL-3  

---

## 🚀 Roadmap

- [ ] Integración WhatsApp Respond.io
- [ ] Modelo `delivery.order` completo
- [ ] Dashboard de analytics
- [ ] Optimización de rutas
- [ ] Predicción de tiempos de entrega
- [ ] App móvil para mensajeros
- [ ] Geofencing automático
- [ ] Integración con Waze/Google Maps

---

**¡RSExpress - La logística fluye mejor cuando el código piensa!** 🧠🚚
