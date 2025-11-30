# 🔍 AUDITORÍA EXHAUSTIVA - MODELO FLEET.VEHICLE RSEXPRESS

**Auditor:** Arquitecto Senior Odoo 19  
**Fecha:** 2025-11-30  
**Módulo:** orbix_fleet_test  
**Modelo:** fleet.vehicle (herencia)

---

## 📋 RESUMEN EJECUTIVO

### ✅ FORTALEZAS DETECTADAS

1. ✅ **Herencia correcta** de `fleet.vehicle`
2. ✅ **Tracking GPS** funcional con Haversine
3. ✅ **Estados logísticos** bien definidos (9 estados)
4. ✅ **KPIs de performance** implementados
5. ✅ **Métodos de cambio de estado** con validación
6. ✅ **Constraint SQL** único en `x_internal_code`
7. ✅ **Computed field** `x_success_rate` con store=True
8. ✅ **Integración mail.thread** heredada

---

### ❌ PROBLEMAS CRÍTICOS DETECTADOS

#### 1️⃣ **RELACIÓN BIDIRECCIONAL INCOMPLETA** (CRÍTICO ⚠️)

**Problema:**
- `rsexpress.delivery.order` tiene `vehicle_id` (Many2one → fleet.vehicle) ✅
- **FALTA** `fleet.vehicle` con `delivery_ids` (One2many → rsexpress.delivery.order) ❌
- **FALTA** `fleet.vehicle` con `x_active_order_id` (Many2one → rsexpress.delivery.order) ❌

**Impacto:**
- OpsCenter no puede mostrar "orden activa del vehículo"
- No hay forma eficiente de listar órdenes asignadas a un vehículo
- KPIs incompletos (no se puede contar órdenes por vehículo directamente)

**Solución requerida:**
```python
# En fleet_vehicle_ext.py - FALTANTE
x_active_order_id = fields.Many2one(
    'rsexpress.delivery.order',
    string='Orden Activa',
    compute='_compute_active_order',
    store=True
)

delivery_order_ids = fields.One2many(
    'rsexpress.delivery.order',
    'vehicle_id',
    string='Órdenes Asignadas'
)

delivery_order_count = fields.Integer(
    string='Total Órdenes',
    compute='_compute_delivery_order_count',
    store=True
)
```

---

#### 2️⃣ **CONFLICTO DE MODELOS DUPLICADOS** (CRÍTICO ⚠️)

**Problema:**
Existen **DOS modelos** de delivery order:

1. `rsexpress_delivery_order.py` (126 líneas) - Modelo **SIMPLE**
   - 6 estados: new, assigned, on_route, delivered, failed, cancelled
   - Campos mínimos

2. `delivery_order.py` (498 líneas) - Modelo **COMPLEJO**
   - Muchos más campos
   - Lógica avanzada

**En `__init__.py`:**
```python
from . import rsexpress_delivery_order
from . import delivery_order  # ❌ DUPLICADO
```

**Impacto:**
- Confusión sobre cuál usar
- Posible conflicto de nombres
- Código muerto

**Solución:**
- Eliminar import de `delivery_order` si está inactivo
- O unificar ambos modelos

---

#### 3️⃣ **CAMPOS CON PROBLEMAS DE DISEÑO**

##### A) `x_driver_id` vs `driver_id` nativo

**Problema:**
- `fleet.vehicle` ya tiene `driver_id` nativo (Many2one → res.partner)
- Se agregó `x_driver_id` (Many2one → hr.employee)

**Conflicto:**
- Dos campos para lo mismo
- `driver_id` nativo apunta a `res.partner`
- `x_driver_id` apunta a `hr.employee`

**Solución:**
```python
# Opción A: Usar solo driver_id nativo
driver_id = fields.Many2one(
    'res.partner',  # Odoo estándar
    domain=[('is_company', '=', False)]
)

# Opción B: Related field para hr.employee
x_employee_id = fields.Many2one(
    'hr.employee',
    string='Empleado Mensajero',
    compute='_compute_employee_from_driver',
    store=True
)
```

##### B) Estados en `x_operational_status` vs `rsexpress.delivery.order.state`

**Problema:**
- `fleet.vehicle.x_operational_status` tiene 9 estados
- `rsexpress.delivery.order.state` tiene 6 estados
- **No están sincronizados**

**Estados vehículo:**
```python
'available', 'assigned', 'on_route', 'picked', 'delivering',
'delivered_ok', 'delivered_issue', 'failed', 'cancelled'
```

**Estados orden:**
```python
'new', 'assigned', 'on_route', 'delivered', 'failed', 'cancelled'
```

**Discrepancias:**
- Vehículo tiene `picked` y `delivering` separados
- Orden los agrupa en `on_route`
- Vehículo distingue `delivered_ok` vs `delivered_issue`
- Orden solo tiene `delivered`

**Solución:**
- Unificar estados
- O crear método de sincronización automática

---

#### 4️⃣ **CAMPOS QUE REQUIEREN `store=True`**

**Campos computados SIN store:**

Ninguno - ✅ Correcto, `x_success_rate` ya tiene `store=True`

---

#### 5️⃣ **CAMPOS QUE REQUIEREN `readonly=True`**

**Correctos (ya readonly):**
- ✅ `x_orders_completed`
- ✅ `x_orders_failed`
- ✅ `x_rating_score`
- ✅ `x_total_km`
- ✅ `x_last_gps_ping`
- ✅ `x_last_latitude`
- ✅ `x_last_longitude`
- ✅ `x_distance_today`

**Faltantes (deberían ser readonly):**
- ⚠️ `x_success_rate` → readonly=True (es computed, debería ser readonly)

---

#### 6️⃣ **CAMPOS COMPUTED FALTANTES**

**Campos que deberían ser computed:**

```python
# 1. Orden activa
x_active_order_id = fields.Many2one(
    'rsexpress.delivery.order',
    compute='_compute_active_order',
    store=True,
    string='Orden Activa Actual'
)

@api.depends('delivery_order_ids.state')
def _compute_active_order(self):
    for vehicle in self:
        active = vehicle.delivery_order_ids.filtered(
            lambda o: o.state in ['assigned', 'on_route']
        )
        vehicle.x_active_order_id = active[0] if active else False

# 2. Estado automático desde orden activa
x_operational_status = fields.Selection(
    ...,
    compute='_compute_operational_status',
    store=True,
    readonly=False  # Permitir override manual
)

@api.depends('x_active_order_id.state')
def _compute_operational_status(self):
    for vehicle in self:
        if not vehicle.x_active_order_id:
            vehicle.x_operational_status = 'available'
        else:
            # Mapear estado de orden a estado de vehículo
            order_state = vehicle.x_active_order_id.state
            mapping = {
                'assigned': 'assigned',
                'on_route': 'on_route',
                # etc...
            }
            vehicle.x_operational_status = mapping.get(
                order_state, 'available'
            )
```

---

#### 7️⃣ **MÉTODOS FALTANTES**

**Métodos críticos NO implementados:**

```python
# 1. Asignar orden al vehículo
def assign_order(self, order_id):
    """Asignar orden específica al vehículo"""
    order = self.env['rsexpress.delivery.order'].browse(order_id)
    if not order.exists():
        raise UserError("Orden no encontrada")
    
    if self.x_operational_status != 'available':
        raise UserError("Vehículo no disponible")
    
    order.write({
        'vehicle_id': self.id,
        'state': 'assigned'
    })
    
    self.write({'x_operational_status': 'assigned'})
    
    return True

# 2. Liberar vehículo
def release_vehicle(self):
    """Liberar vehículo al completar orden"""
    self.ensure_one()
    
    if self.x_active_order_id:
        self.x_active_order_id.write({'vehicle_id': False})
    
    self.write({
        'x_operational_status': 'available',
        'x_active_order_id': False
    })
    
    return True

# 3. KPI en tiempo real
@api.depends('delivery_order_ids', 'delivery_order_ids.state')
def _compute_kpi_realtime(self):
    """Calcular KPIs desde órdenes relacionadas"""
    for vehicle in self:
        orders = vehicle.delivery_order_ids
        vehicle.x_orders_completed = len(orders.filtered(
            lambda o: o.state == 'delivered'
        ))
        vehicle.x_orders_failed = len(orders.filtered(
            lambda o: o.state == 'failed'
        ))
```

---

#### 8️⃣ **REGLAS DE NEGOCIO FALTANTES**

**Validaciones que NO existen:**

```python
# 1. No puede asignarse si ya tiene orden activa
@api.constrains('x_operational_status')
def _check_no_duplicate_assignment(self):
    for vehicle in self:
        if vehicle.x_operational_status == 'assigned':
            active_orders = vehicle.delivery_order_ids.filtered(
                lambda o: o.state in ['assigned', 'on_route']
            )
            if len(active_orders) > 1:
                raise ValidationError(
                    "El vehículo ya tiene una orden activa"
                )

# 2. GPS debe actualizarse al menos cada 10 minutos
@api.constrains('x_last_gps_ping')
def _check_gps_freshness(self):
    for vehicle in self:
        if vehicle.x_operational_status in ['on_route', 'delivering']:
            if vehicle.x_last_gps_ping:
                time_diff = datetime.now() - vehicle.x_last_gps_ping
                if time_diff.total_seconds() > 600:  # 10 minutos
                    # Enviar alerta
                    vehicle.message_post(
                        body="⚠️ GPS sin actualizar por más de 10 minutos",
                        subject="Alerta GPS"
                    )

# 3. Vehículo debe tener conductor asignado
@api.constrains('x_operational_status', 'driver_id')
def _check_has_driver(self):
    for vehicle in self:
        if vehicle.x_operational_status != 'available':
            if not vehicle.driver_id:
                raise ValidationError(
                    "El vehículo debe tener un conductor asignado"
                )
```

---

## 📊 COMPARATIVA: ESTADO ACTUAL VS OPTIMIZADO

| Aspecto | Actual | Optimizado |
|---------|--------|------------|
| **Relación bidireccional orden** | ❌ Falta One2many | ✅ Completa |
| **Campo orden activa** | ❌ No existe | ✅ Computed + store |
| **Sincronización estados** | ❌ Manual | ✅ Automática |
| **Contador órdenes** | ❌ Manual | ✅ Computed |
| **KPIs en tiempo real** | ❌ Estático | ✅ Desde relaciones |
| **Validaciones negocio** | ⚠️ Básicas | ✅ Completas |
| **Métodos CRUD órdenes** | ❌ Faltantes | ✅ Completos |
| **Conflicto modelos** | ❌ 2 modelos | ✅ 1 modelo unificado |
| **GPS alerts** | ❌ No | ✅ Automático |

---

## 🎯 RECOMENDACIONES INMEDIATAS

### Paso 1: Limpiar `__init__.py` (5 min)

```python
# Eliminar import duplicado
# from . import delivery_order  # ❌ ELIMINAR
```

### Paso 2: Agregar relaciones bidireccionales (15 min)

```python
# En fleet_vehicle_ext.py
delivery_order_ids = fields.One2many(...)
x_active_order_id = fields.Many2one(...)
delivery_order_count = fields.Integer(...)
```

### Paso 3: Sincronizar estados (20 min)

Unificar estados entre vehículo y orden.

### Paso 4: Agregar métodos faltantes (30 min)

`assign_order()`, `release_vehicle()`, KPIs computed.

---

## 🚀 ROADMAP FUTURO

### Fase 1: WebSocket Real-time (Q1 2026)
- GPS updates vía WebSocket
- Estado órdenes en tiempo real
- Notificaciones push

### Fase 2: IA Predictiva (Q2 2026)
- Estimación tiempos de entrega
- Asignación inteligente vehículos
- Predicción de fallos

### Fase 3: Integración Traccar (Q2 2026)
- GPS automático desde Traccar
- Webhooks bidireccionales
- Geofencing automático

---

**Fin del informe de auditoría**  
*Generado por Arquitecto Senior Odoo 19 - 2025-11-30*
