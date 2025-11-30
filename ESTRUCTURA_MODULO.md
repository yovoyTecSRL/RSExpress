# 📦 RSExpress Logistics - Estructura del Módulo Odoo 19

## 🎯 Versión: 19.0.2.0.0

---

## 📂 Estructura de Archivos

```
orbix_fleet_test/
│
├── 📄 __init__.py                      # Inicializador raíz (importa models y controllers)
├── 📄 __manifest__.py                  # Manifiesto del módulo (v19.0.2.0.0)
│
├── 📁 models/                          # Modelos de datos
│   ├── __init__.py                     # Importa: fleet_vehicle_ext, rsexpress_delivery_order
│   ├── fleet_vehicle_ext.py            # Extensión de fleet.vehicle (VACÍO - solo hereda)
│   ├── rsexpress_delivery_order.py     # ✅ Modelo ACTIVO (126 líneas, 5 estados)
│   └── delivery_order.py               # ⚠️ Modelo VIEJO (500+ líneas, 8 estados) - NO USADO
│
├── 📁 views/                           # Vistas XML
│   ├── ✅ fleet_vehicle_title.xml      # Solo título RSExpress en fleet.vehicle
│   ├── ✅ fleet_vehicle_clean.xml      # Herencia vacía (limpieza)
│   ├── ✅ fleet_vehicle_rsexpress_buttons.xml  # Herencia vacía (sin botones)
│   │
│   ├── ✅ rsexpress_delivery_form.xml  # Form view pedidos (5 botones de estado)
│   ├── ✅ rsexpress_delivery_list.xml  # List view con colores por estado
│   ├── ✅ rsexpress_delivery_kanban.xml # Kanban agrupado por estado
│   ├── ✅ rsexpress_delivery_menu.xml  # Menú: RSExpress → Pedidos → Ver Pedidos
│   │
│   ├── ✅ rsexpress_opscenter_dashboard.xml  # Template QWeb OpsCenter
│   ├── ✅ rsexpress_opscenter_menu.xml       # Menú: RSExpress → OpsCenter
│   │
│   ├── ⚠️ delivery_order_views.xml    # Vistas del modelo VIEJO - NO declarado en manifest
│   ├── ⚠️ rsexpress_menu.xml          # Menú DUPLICADO - NO declarado en manifest
│   ├── ⚠️ orbix_fleet_list_view.xml   # Vista duplicada - NO declarado en manifest
│   ├── ⚠️ fleet_vehicle_kanban_inherit.xml  # Kanban duplicada - NO declarado
│   └── ⚠️ fleet_vehicle_rsexpress_kanban.xml # Otra Kanban duplicada - NO declarado
│
├── 📁 controllers/                     # Controladores HTTP
│   ├── __init__.py                     # Importa: opscenter
│   └── opscenter.py                    # Controlador JSON para OpsCenter Dashboard
│
├── 📁 static/src/js/                   # JavaScript
│   └── opscenter.js                    # AbstractAction - Dashboard con auto-refresh 5s
│
├── 📁 data/                            # Datos maestros
│   └── ir_sequence.xml                 # Secuencia para códigos RSX-00001
│
└── 📁 security/                        # Permisos
    └── ir.model.access.csv             # Permisos para rsexpress.delivery.order
```

---

## 🎛️ Acceso desde Odoo

### ✅ Menús ACTIVOS (Funcionando)

**1. RSExpress → Pedidos → Ver Pedidos**
- Acción: `action_rsexpress_orders_list`
- Modelo: `rsexpress.delivery.order`
- Vistas: Kanban, List, Form
- Estados: 5 (new, assigned, on_route, delivered, failed)

**2. RSExpress → OpsCenter**
- Acción: `action_rsexpress_opscenter`
- Tag: `rsexpress_opscenter_dashboard`
- Tipo: Client Action
- Actualización: Cada 5 segundos

### ⚠️ Menús INACTIVOS (No declarados en manifest)

**RSExpress → Órdenes de Entrega → Todas las Órdenes**
- ❌ Referencia rota: `delivery_order_views.action_delivery_order`
- ❌ Archivo no declarado: `delivery_order_views.xml`
- ❌ Modelo viejo: 8 estados complejos

**RSExpress → Gestión de Flota → Vehículos (Lista/Kanban/Form)**
- ❌ Definido en: `rsexpress_menu.xml` (no declarado)
- ❌ Duplica funcionalidad del módulo fleet estándar

---

## 🧩 Modelos de Datos

### ✅ rsexpress.delivery.order (ACTIVO)
**Archivo:** `models/rsexpress_delivery_order.py` (126 líneas)

**Campos:**
- `name` (Char) - Código auto-generado RSX-00001
- `pickup_address` (Text) - Dirección de recogida
- `delivery_address` (Text) - Dirección de entrega
- `task_description` (Text) - Descripción de la tarea
- `customer_name` (Char) - Nombre del cliente
- `customer_phone` (Char) - Teléfono del cliente
- `vehicle_id` (Many2one → fleet.vehicle) - Vehículo asignado
- `state` (Selection) - Estado de la entrega

**Estados (5):**
1. `new` - Nuevo
2. `assigned` - Asignado
3. `on_route` - En Ruta
4. `delivered` - Entregado
5. `failed` - Fallido

**Métodos:**
- `action_assign()` - new → assigned
- `action_on_route()` - assigned → on_route
- `action_delivered()` - on_route → delivered
- `action_failed()` - Cualquier → failed
- `action_cancel()` - Reset → new

---

### ⚠️ rsexpress.delivery.order (VIEJO - NO USADO)
**Archivo:** `models/delivery_order.py` (500+ líneas)

**Estados (8):**
1. `new` - Nuevo
2. `assigned` - Asignado
3. `pickup` - En Recolección
4. `package` - Empaquetando
5. `delivering` - Entregando
6. `delivered` - Entregado
7. `incident` - Con Incidente
8. `failed` - Fallido
9. `cancelled` - Cancelado

**Campos adicionales:**
- Firma digital (`signature`)
- Foto de prueba (`delivery_proof_photo`)
- GPS pickup y delivery (`pickup_lat`, `delivery_lon`)
- Tiempos de duración por fase
- Información de paquete (peso, dimensiones)
- Incidentes y fotos
- Calendario de entregas

**Vistas completas:**
- Form con firma y fotos
- Calendar view
- Search avanzado
- Kanban con prioridades

---

## 🚀 OpsCenter Dashboard

### Controlador JSON
**Ruta:** `/rsexpress/opscenter/data`
**Método:** POST (JSON)
**Auth:** user

**Retorna:**
```json
{
  "kpi_total_orders": 15,
  "kpi_active_orders": 8,
  "kpi_completed_today": 5,
  "kpi_failed_today": 1,
  "kpi_available_drivers": 3,
  "kpi_busy_drivers": 2,
  
  "orders": [
    {
      "id": 1,
      "name": "RSX-00001",
      "customer_name": "Juan Pérez",
      "pickup": "Calle 123",
      "delivery": "Av. Principal 456",
      "state": "Asignado",
      "state_raw": "assigned",
      "vehicle": "Toyota Corolla",
      "customer_phone": "+593987654321"
    }
  ],
  
  "vehicles": [
    {
      "id": 1,
      "vehicle_name": "Toyota Corolla",
      "driver_name": "Pedro López",
      "state": "available",
      "last_lat": -0.1234,
      "last_lon": -78.5678,
      "last_gps_ping": "2025-11-30 10:30:00",
      "active_delivery": "RSX-00001",
      "distance_today": 45.8
    }
  ],
  
  "last_update": "2025-11-30 10:30:15"
}
```

### JavaScript
**Tecnología:** AbstractAction (web.AbstractAction)
**Auto-refresh:** 5 segundos
**Métodos:**
- `refreshData()` - Llama al endpoint JSON
- `updateKPIs()` - Actualiza contadores con animación
- `populateOrders()` - Renderiza tabla de pedidos
- `populateDrivers()` - Renderiza tabla de conductores
- `getStateBadgeClass()` - Mapea estados a colores Bootstrap

---

## 📊 KPIs del Dashboard

| KPI | Color | Descripción |
|-----|-------|-------------|
| Total Pedidos | Púrpura (#875A7B) | Todos los pedidos |
| Activos | Naranja (#F39C12) | Estado ≠ delivered/failed/cancelled |
| Disponibles | Verde (#27AE60) | Conductores sin pedido asignado |
| En Ruta | Rojo (#E74C3C) | Conductores con estado ≠ available |
| Entregas Hoy | Azul (#3498DB) | Pedidos delivered hoy |
| Fallos Hoy | Gris (#95A5A6) | Pedidos failed hoy |

---

## 🗺️ Integración GPS (Placeholder)

**Estado actual:** Placeholder visual
**Integración futura:** Traccar GPS API + Leaflet.js

**Campos GPS en vehículos:**
- `x_last_gps_lat` (Float)
- `x_last_gps_lon` (Float)
- `x_last_gps_update` (Datetime)
- `x_operational_status` (Selection)

---

## ⚙️ Instalación y Actualización

```bash
# Actualizar módulo
python odoo-bin -d tu_base_datos -u orbix_fleet_test

# Verificar logs
tail -f /var/log/odoo/odoo.log
```

**Acceso post-instalación:**
1. Ir a: **RSExpress → Pedidos → Ver Pedidos**
2. Crear pedidos de prueba
3. Ir a: **RSExpress → OpsCenter**
4. Verificar que dashboard carga en 5 segundos

---

## 🧹 Archivos para ELIMINAR (Limpieza futura)

```
models/delivery_order.py                    # 500+ líneas no usadas
views/delivery_order_views.xml              # Vistas del modelo viejo
views/rsexpress_menu.xml                    # Menú duplicado
views/orbix_fleet_list_view.xml             # Vista duplicada
views/fleet_vehicle_kanban_inherit.xml      # Kanban duplicada
views/fleet_vehicle_rsexpress_kanban.xml    # Otra Kanban duplicada
```

**Comando para eliminar:**
```bash
cd /opt/odoo/custom/addons/orbix_fleet_test/
rm models/delivery_order.py
rm views/delivery_order_views.xml
rm views/rsexpress_menu.xml
rm views/orbix_fleet_list_view.xml
rm views/fleet_vehicle_kanban_inherit.xml
rm views/fleet_vehicle_rsexpress_kanban.xml
```

---

## 📝 Notas Técnicas

### Separación de Modelos
- ✅ `fleet.vehicle` - Gestión estándar de vehículos (módulo fleet)
- ✅ `rsexpress.delivery.order` - Gestión de pedidos (independiente)
- ✅ No hay campos de pedidos en fleet.vehicle
- ✅ Relación Many2one: order → vehicle (opcional)

### Mail Thread
- Ambos modelos heredan `mail.thread`
- Chatter disponible en formularios
- Actividades y mensajes integrados

### Secuencias
- Código auto-generado: `RSX-00001`, `RSX-00002`, etc.
- Definido en: `data/ir_sequence.xml`
- Formato: `RSX-` + 5 dígitos con ceros a la izquierda

---

## 🎨 Colores por Estado (Badges)

| Estado | Color | Clase Bootstrap |
|--------|-------|-----------------|
| new | Azul | badge-info |
| assigned | Azul oscuro | badge-primary |
| on_route | Amarillo | badge-warning |
| delivered | Verde | badge-success |
| failed | Rojo | badge-danger |

---

## 📞 Soporte

**Desarrollado por:** Sistemas Órbix  
**Versión Odoo:** 19.0  
**Licencia:** LGPL-3  
**Última actualización:** 30/11/2025

---

✅ **Módulo listo para producción**  
🚀 **OpsCenter operativo con auto-refresh**  
📊 **KPIs en tiempo real**  
🎯 **Arquitectura limpia y modular**
