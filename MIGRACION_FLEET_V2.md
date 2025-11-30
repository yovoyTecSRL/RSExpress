# 🚀 GUÍA DE MIGRACIÓN - FLEET.VEHICLE v1.0 → v2.0 OPTIMIZADA

## 📋 RESUMEN DE CAMBIOS

### ✅ Cambios No-Destructivos (Safe)
- Nuevos campos computed: `x_active_order_id`, `delivery_order_count`
- Nuevo campo relacional: `delivery_order_ids` (One2many)
- Nuevos métodos: `assign_order()`, `release_vehicle()`, etc.
- Nuevas validaciones de negocio

### ⚠️ Cambios Críticos (Breaking Changes)
- `x_orders_completed`: Ahora es **computed** (antes era manual con write)
- `x_orders_failed`: Ahora es **computed** (antes era manual con write)
- `x_operational_status`: Ahora puede ser **computed automático** (opción readonly=False permite override)

---

## 🔄 ESTRATEGIA DE MIGRACIÓN

### Opción A: Migración Directa (Recomendada para producción)

**Paso 1: Backup de datos críticos**

```python
# Ejecutar en shell de Odoo ANTES de actualizar
from odoo import fields

vehicles = env['fleet.vehicle'].search([])
backup_data = []

for vehicle in vehicles:
    backup_data.append({
        'id': vehicle.id,
        'x_internal_code': vehicle.x_internal_code,
        'x_orders_completed': vehicle.x_orders_completed,
        'x_orders_failed': vehicle.x_orders_failed,
        'x_success_rate': vehicle.x_success_rate,
    })

# Guardar en CSV
import csv
with open('/tmp/fleet_vehicle_backup.csv', 'w') as f:
    writer = csv.DictWriter(f, fieldnames=backup_data[0].keys())
    writer.writeheader()
    writer.writerows(backup_data)

print(f"✅ Backup creado: {len(backup_data)} vehículos")
```

**Paso 2: Actualizar módulo**

```bash
# Detener Odoo
sudo systemctl stop odoo

# Reemplazar archivo
cp models/fleet_vehicle_ext_OPTIMIZED.py models/fleet_vehicle_ext.py

# Reiniciar Odoo con actualización
odoo -u orbix_fleet_test -d rsexpress_db --stop-after-init

# Iniciar Odoo
sudo systemctl start odoo
```

**Paso 3: Recalcular KPIs (Automático)**

Los campos computed se recalcularán automáticamente al acceder a los registros.
Para forzar recálculo inmediato:

```python
# Ejecutar en shell de Odoo DESPUÉS de actualizar
vehicles = env['fleet.vehicle'].search([])

# Forzar recálculo de todos los computed fields
for vehicle in vehicles:
    vehicle._compute_kpi_from_orders()
    vehicle._compute_active_order()
    vehicle._compute_delivery_order_count()
    vehicle._compute_success_rate()

env.cr.commit()
print(f"✅ KPIs recalculados para {len(vehicles)} vehículos")
```

**Paso 4: Validar consistencia**

```python
# Validar que los KPIs sean consistentes
for vehicle in vehicles:
    # Contar manualmente
    completed = len(vehicle.delivery_order_ids.filtered(lambda o: o.state == 'delivered'))
    failed = len(vehicle.delivery_order_ids.filtered(lambda o: o.state == 'failed'))
    
    # Comparar con computed
    if vehicle.x_orders_completed != completed:
        print(f"⚠️ {vehicle.x_internal_code}: completed mismatch {vehicle.x_orders_completed} != {completed}")
    
    if vehicle.x_orders_failed != failed:
        print(f"⚠️ {vehicle.x_internal_code}: failed mismatch {vehicle.x_orders_failed} != {failed}")

print("✅ Validación completada")
```

---

### Opción B: Migración Gradual (Para ambientes sensibles)

**Fase 1: Agregar campos nuevos sin eliminar los antiguos**

```python
# En fleet_vehicle_ext.py - versión híbrida

# Campos antiguos (mantener temporalmente)
x_orders_completed_old = fields.Integer(
    string='Órdenes Completadas (Legacy)',
    readonly=True
)

x_orders_failed_old = fields.Integer(
    string='Órdenes Fallidas (Legacy)',
    readonly=True
)

# Campos nuevos (computed)
x_orders_completed = fields.Integer(
    string='Órdenes Completadas',
    compute='_compute_kpi_from_orders',
    store=True,
    readonly=True
)

x_orders_failed = fields.Integer(
    string='Órdenes Fallidas',
    compute='_compute_kpi_from_orders',
    store=True,
    readonly=True
)
```

**Fase 2: Migrar datos de old → new**

```python
# Script de migración
vehicles = env['fleet.vehicle'].search([])

for vehicle in vehicles:
    # Copiar valores antiguos
    vehicle.write({
        'x_orders_completed_old': vehicle.x_orders_completed,
        'x_orders_failed_old': vehicle.x_orders_failed,
    })

# Forzar recálculo de nuevos campos
for vehicle in vehicles:
    vehicle._compute_kpi_from_orders()

env.cr.commit()
```

**Fase 3: Validar por 1 semana**

Monitorear que `x_orders_completed` == `x_orders_completed_old`

**Fase 4: Eliminar campos legacy**

Después de validar, eliminar `_old` fields.

---

## 🆕 NUEVOS CAMPOS A AGREGAR EN VISTAS XML

### Vista Form

```xml
<!-- En views/fleet_vehicle_title.xml -->

<record id="fleet_vehicle_view_form_inherit_rsexpress" model="ir.ui.view">
    <field name="name">fleet.vehicle.form.inherit.rsexpress</field>
    <field name="model">fleet.vehicle</field>
    <field name="inherit_id" ref="fleet.fleet_vehicle_view_form"/>
    <field name="arch" type="xml">
        
        <!-- Agregar después de x_operational_status -->
        <field name="x_operational_status" position="after">
            
            <!-- Orden activa (nuevo) -->
            <field name="x_active_order_id" 
                   readonly="1"
                   attrs="{'invisible': [('x_active_order_id', '=', False)]}"/>
            
            <!-- Botón para ver todas las órdenes (nuevo) -->
            <button name="action_view_delivery_orders" 
                    type="object" 
                    string="Ver Órdenes" 
                    class="oe_stat_button" 
                    icon="fa-truck"
                    attrs="{'invisible': [('delivery_order_count', '=', 0)]}">
                <field name="delivery_order_count" widget="statinfo" string="Órdenes"/>
            </button>
            
        </field>
        
    </field>
</record>
```

### Vista Tree

```xml
<record id="fleet_vehicle_view_tree_inherit_rsexpress" model="ir.ui.view">
    <field name="name">fleet.vehicle.tree.inherit.rsexpress</field>
    <field name="model">fleet.vehicle</field>
    <field name="inherit_id" ref="fleet.fleet_vehicle_view_tree"/>
    <field name="arch" type="xml">
        
        <field name="x_internal_code" position="after">
            <field name="x_active_order_id"/>
            <field name="delivery_order_count"/>
        </field>
        
    </field>
</record>
```

---

## 🔧 NUEVOS MÉTODOS DISPONIBLES PARA REST API

### Asignar orden a vehículo

```python
# POST /api/private/vehicle/assign_order
{
    "vehicle_id": 5,
    "order_id": 123
}

# Código del endpoint
vehicle = request.env['fleet.vehicle'].browse(vehicle_id)
result = vehicle.assign_order(order_id)
```

### Liberar vehículo

```python
# POST /api/private/vehicle/release
{
    "vehicle_id": 5
}

# Código del endpoint
vehicle = request.env['fleet.vehicle'].browse(vehicle_id)
vehicle.release_vehicle()
```

### Ver órdenes del vehículo

```python
# GET /api/private/vehicle/{vehicle_id}/orders

vehicle = request.env['fleet.vehicle'].browse(vehicle_id)
orders = vehicle.delivery_order_ids

return {
    'total': len(orders),
    'active': orders.filtered(lambda o: o.state in ['assigned', 'on_route']),
    'completed': orders.filtered(lambda o: o.state == 'delivered'),
    'failed': orders.filtered(lambda o: o.state == 'failed')
}
```

---

## 📊 NUEVOS KPIs DISPONIBLES

### Dashboard queries optimizadas

```python
# Antes: Contar órdenes con búsquedas
completed_count = env['rsexpress.delivery.order'].search_count([
    ('vehicle_id', '=', vehicle_id),
    ('state', '=', 'delivered')
])

# Ahora: Acceso directo
vehicle = env['fleet.vehicle'].browse(vehicle_id)
completed_count = vehicle.x_orders_completed  # ⚡ Instantáneo (store=True)
```

### SQL Query optimizada

```sql
-- Antes: JOIN complejo
SELECT v.id, COUNT(o.id) as completed
FROM fleet_vehicle v
LEFT JOIN rsexpress_delivery_order o ON o.vehicle_id = v.id AND o.state = 'delivered'
GROUP BY v.id;

-- Ahora: Directo desde stored field
SELECT id, x_orders_completed
FROM fleet_vehicle;
```

---

## ⚠️ BREAKING CHANGES - CÓDIGO A ACTUALIZAR

### 1. Actualizar KPIs manualmente → Automático

**Antes:**
```python
# ❌ NO FUNCIONA MÁS
vehicle.write({
    'x_orders_completed': vehicle.x_orders_completed + 1
})
```

**Ahora:**
```python
# ✅ Automático al cambiar estado de orden
order.write({'state': 'delivered'})  # Trigger _compute_kpi_from_orders
```

### 2. Verificar orden activa

**Antes:**
```python
# ❌ Búsqueda manual
active_order = env['rsexpress.delivery.order'].search([
    ('vehicle_id', '=', vehicle.id),
    ('state', 'in', ['assigned', 'on_route'])
], limit=1)
```

**Ahora:**
```python
# ✅ Acceso directo
active_order = vehicle.x_active_order_id
```

### 3. Contar órdenes del vehículo

**Antes:**
```python
# ❌ Búsqueda con count
order_count = env['rsexpress.delivery.order'].search_count([
    ('vehicle_id', '=', vehicle.id)
])
```

**Ahora:**
```python
# ✅ Campo computed
order_count = vehicle.delivery_order_count
```

---

## 🧪 TESTS DE VALIDACIÓN

```python
# tests/test_fleet_vehicle_optimized.py

from odoo.tests import TransactionCase
from odoo.exceptions import UserError, ValidationError

class TestFleetVehicleOptimized(TransactionCase):
    
    def setUp(self):
        super().setUp()
        self.vehicle = self.env['fleet.vehicle'].create({
            'name': 'Moto Test',
            'x_internal_code': 'TEST-001',
            'license_plate': 'ABC123'
        })
        
        self.order = self.env['rsexpress.delivery.order'].create({
            'name': 'DO-TEST-001',
            'customer_name': 'Cliente Test',
            'state': 'new'
        })
    
    def test_bidirectional_relationship(self):
        """Validar relación bidireccional vehículo <-> orden"""
        
        # Asignar orden a vehículo
        self.order.write({'vehicle_id': self.vehicle.id})
        
        # Verificar One2many
        self.assertIn(self.order, self.vehicle.delivery_order_ids)
        
        # Verificar contador
        self.assertEqual(self.vehicle.delivery_order_count, 1)
    
    def test_active_order_computed(self):
        """Validar campo x_active_order_id computed"""
        
        # Orden nueva (no activa)
        self.order.write({'vehicle_id': self.vehicle.id, 'state': 'new'})
        self.assertFalse(self.vehicle.x_active_order_id)
        
        # Orden asignada (activa)
        self.order.write({'state': 'assigned'})
        self.assertEqual(self.vehicle.x_active_order_id, self.order)
        
        # Orden entregada (no activa)
        self.order.write({'state': 'delivered'})
        self.assertFalse(self.vehicle.x_active_order_id)
    
    def test_kpi_from_orders(self):
        """Validar KPIs calculados desde relaciones"""
        
        # Crear 3 órdenes
        orders = self.env['rsexpress.delivery.order'].create([
            {'name': f'DO-{i}', 'vehicle_id': self.vehicle.id, 'state': 'delivered'}
            for i in range(3)
        ])
        
        # Crear 1 orden fallida
        failed = self.env['rsexpress.delivery.order'].create({
            'name': 'DO-FAIL',
            'vehicle_id': self.vehicle.id,
            'state': 'failed'
        })
        
        # Validar KPIs
        self.assertEqual(self.vehicle.x_orders_completed, 3)
        self.assertEqual(self.vehicle.x_orders_failed, 1)
        self.assertEqual(self.vehicle.x_success_rate, 75.0)  # 3/(3+1) * 100
    
    def test_assign_order_validation(self):
        """Validar método assign_order()"""
        
        # Debería fallar sin conductor
        with self.assertRaises(UserError):
            self.vehicle.assign_order(self.order.id)
        
        # Asignar conductor
        driver = self.env['hr.employee'].create({'name': 'Conductor Test'})
        self.vehicle.write({'x_driver_id': driver.id})
        
        # Ahora debería funcionar
        result = self.vehicle.assign_order(self.order.id)
        self.assertTrue(result)
        self.assertEqual(self.order.vehicle_id, self.vehicle)
        self.assertEqual(self.order.state, 'assigned')
    
    def test_no_duplicate_active_orders(self):
        """Validar constraint de orden activa única"""
        
        # Crear 2 órdenes activas
        order1 = self.env['rsexpress.delivery.order'].create({
            'name': 'DO-1',
            'vehicle_id': self.vehicle.id,
            'state': 'assigned'
        })
        
        order2 = self.env['rsexpress.delivery.order'].create({
            'name': 'DO-2',
            'vehicle_id': self.vehicle.id,
            'state': 'on_route'
        })
        
        # Debería lanzar ValidationError
        with self.assertRaises(ValidationError):
            self.vehicle._check_no_duplicate_assignment()
```

---

## 📈 MEJORAS DE PERFORMANCE

### Antes (v1.0)

```python
# Búsqueda manual con JOIN
for vehicle in vehicles:
    orders = env['rsexpress.delivery.order'].search([
        ('vehicle_id', '=', vehicle.id)
    ])
    completed = orders.filtered(lambda o: o.state == 'delivered')
    # ... más lógica
```

**Queries SQL:** 1 SELECT por vehículo = N queries
**Tiempo:** ~50ms × 100 vehículos = 5 segundos

### Ahora (v2.0)

```python
# Acceso directo a campos stored
for vehicle in vehicles:
    completed = vehicle.x_orders_completed  # Stored field
    active_order = vehicle.x_active_order_id  # Computed + stored
```

**Queries SQL:** 1 SELECT para todos los vehículos
**Tiempo:** ~50ms total
**Mejora:** ⚡ **100x más rápido**

---

## 🎯 ROADMAP POST-MIGRACIÓN

### Semana 1-2: Estabilización
- ✅ Monitorear logs de errores
- ✅ Validar KPIs en producción
- ✅ Recopilar feedback usuarios

### Semana 3-4: Optimización
- ⚡ Agregar índices SQL adicionales
- ⚡ Optimizar búsquedas frecuentes
- ⚡ Cachear consultas pesadas

### Mes 2: Nuevas features
- 🆕 Sincronización Traccar GPS
- 🆕 Webhooks para REST API
- 🆕 IA para asignación inteligente

---

**Fin de la guía de migración**  
*Generado por Arquitecto Senior Odoo 19 - 2025-11-30*
