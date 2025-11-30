# 🔄 PUNTO DE RESTAURACIÓN - orbix_fleet_test
**Fecha:** 30 de Noviembre de 2025
**Estado:** Módulo funcional con vistas personalizadas RSExpress

---

## 📁 Estructura del Módulo

```
orbix_fleet_test/
├── __init__.py
├── __manifest__.py
├── models/
│   ├── __init__.py
│   └── fleet_vehicle_ext.py
└── views/
    ├── fleet_vehicle_title.xml
    ├── fleet_vehicle_clean.xml
    ├── orbix_fleet_list_view.xml
    ├── fleet_vehicle_kanban_inherit.xml
    └── rsexpress_menu.xml
```

---

## 📄 ARCHIVOS COMPLETOS

### 1. `__manifest__.py`
```python
# -*- coding: utf-8 -*-
{
    'name': 'Orbix Fleet Test',
    'version': '19.0.1.0.0',
    'summary': 'Prueba de herencia de Flota',
    'author': 'Sistemas Órbix',
    'depends': ['fleet'],
    'data': [
        'views/fleet_vehicle_title.xml',
        'views/fleet_vehicle_clean.xml',
        'views/orbix_fleet_list_view.xml',
        'views/fleet_vehicle_kanban_inherit.xml',
        'views/rsexpress_menu.xml',
    ],
    'installable': True,
    'application': False,
    'license': 'LGPL-3',
}
```

### 2. `__init__.py`
```python
# -*- coding: utf-8 -*-
# License LGPL-3.0

from . import models
```

### 3. `models/__init__.py`
```python
# -*- coding: utf-8 -*-
# License LGPL-3.0

from . import fleet_vehicle_ext
```

### 4. `models/fleet_vehicle_ext.py`
```python
# -*- coding: utf-8 -*-
# License LGPL-3.0

from odoo import models, fields


class FleetVehicleRSexpress(models.Model):
    _inherit = 'fleet.vehicle'

    x_internal_code = fields.Char(string="Código RSExpress")
    x_operational_status = fields.Selection([
        ('available', 'Disponible'),
        ('on_route', 'En Ruta'),
        ('maintenance', 'Mantenimiento'),
    ], string="Estado Operativo", default='available')
    x_load_capacity = fields.Integer(string="Capacidad de carga (kg)")
```

### 5. `views/fleet_vehicle_title.xml`
```xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <record id="orbix_fleet_title_view" model="ir.ui.view">
        <field name="name">orbix.fleet.title.view</field>
        <field name="model">fleet.vehicle</field>

        <!-- Vista correcta en Odoo 19 -->
        <field name="inherit_id" ref="fleet.fleet_vehicle_view_form"/>

        <field name="arch" type="xml">
            <xpath expr="//field[@name='license_plate']" position="after">
                <h2 class="text-center" style="color: #875A7B; margin: 10px 0;">
                    RSexpress by Sistemas Órbix
                </h2>
            </xpath>
        </field>
    </record>
</odoo>
```

### 6. `views/fleet_vehicle_clean.xml`
```xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <record id="orbix_fleet_clean_view" model="ir.ui.view">
        <field name="name">orbix.fleet.clean.view</field>
        <field name="model">fleet.vehicle</field>
        <field name="inherit_id" ref="fleet.fleet_vehicle_view_form"/>
        <field name="arch" type="xml">
            
            <!-- Renombrar campo location si existe -->
            <xpath expr="//field[@name='location']" position="attributes" optional="1">
                <attribute name="string">Ubicación operativa</attribute>
            </xpath>

            <!-- Renombrar campo driver_id -->
            <field name="driver_id" position="attributes">
                <attribute name="string">Conductor asignado</attribute>
            </field>

            <!-- Agregar nuevos campos operativos después del driver_id -->
            <field name="driver_id" position="after">
                <field name="x_internal_code"/>
                <field name="x_operational_status"/>
                <field name="x_load_capacity"/>
            </field>

        </field>
    </record>
</odoo>
```

### 7. `views/orbix_fleet_list_view.xml`
```xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <record id="orbix_fleet_vehicle_list_inherit" model="ir.ui.view">
        <field name="name">orbix.fleet.vehicle.list.inherit</field>
        <field name="model">fleet.vehicle</field>
        <field name="inherit_id" ref="fleet.fleet_vehicle_view_tree"/>

        <field name="arch" type="xml">
            <!-- Agregar columnas RSExpress después de driver_id -->
            <xpath expr="//field[@name='driver_id']" position="after">
                <field name="x_internal_code"/>
                <field name="x_operational_status"/>
            </xpath>
        </field>
    </record>
</odoo>
```

### 8. `views/fleet_vehicle_kanban_inherit.xml`
```xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <record id="orbix_fleet_kanban_banner" model="ir.ui.view">
        <field name="name">orbix.fleet.vehicle.kanban.banner</field>
        <field name="model">fleet.vehicle</field>
        <field name="inherit_id" ref="fleet.fleet_vehicle_view_kanban"/>

        <field name="arch" type="xml">

            <!-- Agregar banner en la parte superior del kanban -->
            <xpath expr="//kanban" position="attributes">
                <attribute name="banner_route">/web/static/src/img/banner.png</attribute>
            </xpath>
            
            <!-- Insertar el div del banner antes de las templates -->
            <xpath expr="//templates" position="before">
                <div class="alert alert-info text-center" style="margin: 0; padding: 14px;
                    background: linear-gradient(90deg, #6a3c76, #875A7B) !important;
                    color: white !important; border: none; border-radius: 0;
                    font-size: 20px; font-weight: 600;">
                    RSExpress Logistics • Motor Cognitivo Órbix
                </div>
            </xpath>

        </field>
    </record>
</odoo>
```

### 9. `views/rsexpress_menu.xml`
```xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>

    <!-- MENÚ RAÍZ RSEXPRESS -->
    <menuitem id="menu_rsexpress_root"
              name="RSExpress"
              sequence="1"
              web_icon="orbix_fleet_test,static/description/icon.png"/>

    <!-- SUBMENÚ: GESTIÓN DE FLOTA -->
    <menuitem id="menu_rsexpress_fleet"
              name="Gestión de Flota"
              parent="menu_rsexpress_root"
              sequence="10"/>

    <!-- ACCIÓN: VISTA LISTA -->
    <record id="action_rsexpress_fleet_list" model="ir.actions.act_window">
        <field name="name">Vehículos (Lista)</field>
        <field name="res_model">fleet.vehicle</field>
        <field name="view_mode">list,form</field>
        <field name="context">{}</field>
        <field name="help" type="html">
            <p class="o_view_nocontent_smiling_face">
                Crea tu primer vehículo RSExpress
            </p>
        </field>
    </record>

    <menuitem id="menu_rsexpress_fleet_list"
              name="Vehículos (Lista)"
              parent="menu_rsexpress_fleet"
              action="action_rsexpress_fleet_list"
              sequence="1"/>

    <!-- ACCIÓN: VISTA KANBAN -->
    <record id="action_rsexpress_fleet_kanban" model="ir.actions.act_window">
        <field name="name">Vehículos (Kanban)</field>
        <field name="res_model">fleet.vehicle</field>
        <field name="view_mode">kanban,form</field>
        <field name="context">{}</field>
    </record>

    <menuitem id="menu_rsexpress_fleet_kanban"
              name="Vehículos (Kanban)"
              parent="menu_rsexpress_fleet"
              action="action_rsexpress_fleet_kanban"
              sequence="2"/>

    <!-- ACCIÓN: VISTA FORMULARIO -->
    <record id="action_rsexpress_fleet_form" model="ir.actions.act_window">
        <field name="name">Vehículos (Formulario)</field>
        <field name="res_model">fleet.vehicle</field>
        <field name="view_mode">form,list</field>
        <field name="context">{}</field>
    </record>

    <menuitem id="menu_rsexpress_fleet_form"
              name="Vehículos (Formulario)"
              parent="menu_rsexpress_fleet"
              action="action_rsexpress_fleet_form"
              sequence="3"/>

    <!-- SEPARADOR -->
    <menuitem id="menu_rsexpress_fleet_separator"
              name="Análisis"
              parent="menu_rsexpress_root"
              sequence="50"/>

    <!-- ACCIÓN: DASHBOARD -->
    <record id="action_rsexpress_fleet_dashboard" model="ir.actions.act_window">
        <field name="name">Dashboard de Flota</field>
        <field name="res_model">fleet.vehicle</field>
        <field name="view_mode">kanban,list,form</field>
        <field name="context">{}</field>
    </record>

    <menuitem id="menu_rsexpress_fleet_dashboard"
              name="Dashboard de Flota"
              parent="menu_rsexpress_fleet_separator"
              action="action_rsexpress_fleet_dashboard"
              sequence="1"/>

</odoo>
```

---

## ✅ CARACTERÍSTICAS DEL MÓDULO

### Campos Personalizados
- `x_internal_code`: Código RSExpress (Char)
- `x_operational_status`: Estado Operativo (Selection: Disponible/En Ruta/Mantenimiento)
- `x_load_capacity`: Capacidad de carga en kg (Integer)

### Vistas Heredadas
1. **Formulario**: Título RSExpress + 3 campos personalizados
2. **Lista**: Columnas Código RSExpress y Estado Operativo
3. **Kanban**: Banner corporativo RSExpress-Órbix

### Menú RSExpress
- Gestión de Flota
  - Vehículos (Lista)
  - Vehículos (Kanban)
  - Vehículos (Formulario)
- Análisis
  - Dashboard de Flota

---

## 🔧 PARA RESTAURAR

1. Copiar todos los archivos a `/opt/odoo/custom/addons/orbix_fleet_test/`
2. Reiniciar Odoo: `sudo systemctl restart odoo`
3. Actualizar módulo desde Apps

---

**Estado:** ✅ Funcional en Odoo 19
**Versión:** 19.0.1.0.0
