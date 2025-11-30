# 🚀 Guía de Instalación - RSExpress Logistics

**Fecha:** 30 de Noviembre, 2025  
**Versión del Módulo:** 19.0.1.0.0  
**Odoo:** 19.0

---

## 📋 PRE-REQUISITOS

### Dependencias del Módulo
El módulo **Orbix Fleet Test** requiere que los siguientes módulos estén instalados:

- ✅ `fleet` - Gestión de Flota (Base de Odoo)
- ✅ `hr` - Recursos Humanos (para conductores)
- ✅ `mail` - Mensajería y Actividades (para chatter)

### Verificar Dependencias

1. Ir a **Apps** en Odoo
2. Remover filtro "Apps" para ver todos los módulos
3. Buscar y verificar que estén instalados:
   - Fleet
   - Employees (HR)
   - Discuss (Mail)

---

## 🔧 MÉTODOS DE INSTALACIÓN

### Método 1: Desde la Interfaz Web (Recomendado)

#### Primera Instalación

1. **Activar modo desarrollador:**
   - Ir a **Ajustes** → Activar el modo desarrollador
   - O agregar `?debug=1` a la URL

2. **Actualizar lista de aplicaciones:**
   - Ir a **Apps** → Menú superior → **Actualizar Lista de Apps**
   - Confirmar la actualización

3. **Buscar el módulo:**
   - En **Apps**, buscar: `Orbix Fleet Test` o `RSExpress`

4. **Instalar:**
   - Clic en **Instalar**
   - Esperar a que se complete el proceso

#### Actualización (Si ya está instalado)

1. **Ir a Apps:**
   - Remover todos los filtros
   - Buscar: `Orbix Fleet Test`

2. **Actualizar módulo:**
   - Clic en el menú (⋮) del módulo
   - Seleccionar **Actualizar**
   - Confirmar la actualización

---

### Método 2: Desde Línea de Comandos (Avanzado)

#### Instalación

```bash
# Navegar al directorio de Odoo
cd /ruta/a/odoo

# Ejecutar con el parámetro -i (install)
python odoo-bin -c /etc/odoo/odoo.conf -d tu_base_datos -i orbix_fleet_test

# O sin archivo de configuración:
python odoo-bin -d tu_base_datos -i orbix_fleet_test --addons-path=/ruta/addons
```

#### Actualización

```bash
# Actualizar módulo existente con -u (upgrade)
python odoo-bin -c /etc/odoo/odoo.conf -d tu_base_datos -u orbix_fleet_test

# Actualizar con reinicio del servidor:
python odoo-bin -c /etc/odoo/odoo.conf -d tu_base_datos -u orbix_fleet_test --stop-after-init
```

#### Actualización Forzada (Si hay problemas)

```bash
# Actualizar con todas las dependencias
python odoo-bin -c /etc/odoo/odoo.conf -d tu_base_datos -u orbix_fleet_test,fleet,hr,mail

# Modo shell para debugging
python odoo-bin shell -c /etc/odoo/odoo.conf -d tu_base_datos
>>> self.env['ir.module.module'].search([('name', '=', 'orbix_fleet_test')]).button_immediate_upgrade()
```

---

### Método 3: Docker/Contenedores

```bash
# Entrar al contenedor de Odoo
docker exec -it nombre_contenedor_odoo bash

# Una vez dentro:
odoo -d tu_base_datos -i orbix_fleet_test

# O para actualizar:
odoo -d tu_base_datos -u orbix_fleet_test
```

---

## ✅ VERIFICACIÓN POST-INSTALACIÓN

### 1. Verificar Menú

Debe aparecer un nuevo menú principal:

```
🚚 RSExpress
   ├── 📂 Gestión de Flota
   │   ├── Vehículos (Lista)
   │   ├── Vehículos (Kanban)
   │   └── Vehículos (Formulario)
   ├── 📦 Órdenes de Entrega
   │   └── Todas las Órdenes
   └── 📊 Análisis
       └── Dashboard de Flota
```

### 2. Verificar Modelos

Ir a **Ajustes** → **Técnico** → **Modelos** y buscar:

- ✅ `fleet.vehicle` (debe tener campos personalizados)
- ✅ `rsexpress.delivery.order` (nuevo modelo)

### 3. Verificar Vistas

Ir a **Ajustes** → **Técnico** → **Vistas de Interfaz** y verificar:

- ✅ `rsexpress.delivery.order.list`
- ✅ `rsexpress.delivery.order.form`
- ✅ `rsexpress.delivery.order.kanban`
- ✅ `rsexpress.delivery.order.search`
- ✅ `rsexpress.delivery.order.calendar`
- ✅ Vistas heredadas de `fleet.vehicle`

### 4. Verificar Secuencias

Ir a **Ajustes** → **Técnico** → **Secuencias** y buscar:

- ✅ `RSExpress Delivery Order Code` (código: rsexpress.delivery.order)

### 5. Crear Registro de Prueba

#### Crear un Vehículo

1. Ir a **RSExpress → Gestión de Flota → Vehículos (Lista)**
2. Clic en **Crear**
3. Llenar datos mínimos:
   - Nombre del vehículo
   - Modelo
   - Placa
   - Código interno (x_internal_code)
4. Guardar

#### Crear una Orden de Entrega

1. Ir a **RSExpress → Órdenes de Entrega → Todas las Órdenes**
2. Clic en **Crear**
3. Llenar datos mínimos:
   - Vehículo (seleccionar el creado antes)
   - Fecha programada
   - Nombre del cliente
   - Teléfono del cliente
   - Dirección de recolección
   - Dirección de entrega
4. Guardar y verificar que se genere código automático (RSX-000001)

### 6. Probar Flujo de Estados

En la orden creada, probar los botones:

1. ✅ **Asignar** → Estado cambia a "Assigned"
2. ✅ **En Recolección** → Estado cambia a "Pickup"
3. ✅ **Empaquetando** → Estado cambia a "Package"
4. ✅ **En Ruta** → Estado cambia a "Delivering"
5. ✅ **Entregado** → Estado cambia a "Delivered"

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### Error: "Module not found"

**Problema:** Odoo no encuentra el módulo

**Solución:**
```bash
# Verificar que el módulo está en la ruta correcta
ls -la /ruta/addons/orbix_fleet_test/

# Verificar permisos
chmod -R 755 /ruta/addons/orbix_fleet_test/

# Reiniciar Odoo
sudo systemctl restart odoo
# o
sudo service odoo restart
```

### Error: "Dependencias no satisfechas"

**Problema:** Faltan módulos `fleet`, `hr` o `mail`

**Solución:**
1. Ir a **Apps**
2. Buscar e instalar módulos faltantes:
   - Fleet Management
   - Employees
   - Discuss

### Error: "ParseError" en XML

**Problema:** Error de sintaxis en vistas XML

**Solución:**
```bash
# Ver logs detallados
tail -f /var/log/odoo/odoo.log

# Verificar archivo específico
xmllint --noout /ruta/orbix_fleet_test/views/archivo.xml
```

### Error: "Access Denied" o permisos

**Problema:** Usuario no tiene permisos para ver/editar

**Solución:**
1. Ir a **Ajustes → Usuarios y Compañías → Usuarios**
2. Editar usuario
3. En pestaña **Access Rights**, verificar:
   - ✅ Fleet: Manager (para administradores) o User (para usuarios)
   - ✅ Technical Settings (para ver opciones técnicas)

### Error: Campos no aparecen en formulario

**Problema:** Vista no se actualizó correctamente

**Solución:**
```bash
# Forzar actualización de vistas
python odoo-bin -c odoo.conf -d base_datos -u orbix_fleet_test --stop-after-init

# O desde shell de Odoo:
self.env['ir.ui.view'].search([('model', '=', 'fleet.vehicle')]).write({'active': True})
```

### Botones no funcionan

**Problema:** Métodos de Python no se cargaron

**Solución:**
1. Reiniciar servidor Odoo completamente
2. Limpiar caché del navegador (Ctrl + Shift + Del)
3. Verificar logs para errores de Python:
```bash
tail -f /var/log/odoo/odoo.log | grep -i error
```

---

## 🔄 DESINSTALACIÓN (Si es necesario)

### Desde Interfaz

1. Ir a **Apps**
2. Buscar `Orbix Fleet Test`
3. Menú (⋮) → **Desinstalar**
4. Confirmar

**⚠️ ADVERTENCIA:** Esto eliminará:
- Todas las órdenes de entrega creadas
- Campos personalizados en vehículos (los datos se perderán)
- Vistas personalizadas

### Desde Línea de Comandos

```bash
python odoo-bin -c odoo.conf -d base_datos --uninstall orbix_fleet_test
```

---

## 📊 DATOS DE DEMOSTRACIÓN (Opcional)

Para cargar datos de prueba, crear archivo `data/demo_data.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <data noupdate="1">
        <!-- Vehículo de demostración -->
        <record id="demo_vehicle_1" model="fleet.vehicle">
            <field name="name">Toyota Hiace 2024</field>
            <field name="license_plate">ABC-123</field>
            <field name="x_internal_code">VH-001</field>
            <field name="x_operational_status">available</field>
        </record>

        <!-- Orden de demostración -->
        <record id="demo_order_1" model="rsexpress.delivery.order">
            <field name="vehicle_id" ref="demo_vehicle_1"/>
            <field name="customer_name">Cliente Demo</field>
            <field name="customer_phone">+507 6000-0000</field>
            <field name="pickup_address">Calle 50, Ciudad de Panamá</field>
            <field name="delivery_address">Av. Balboa, Ciudad de Panamá</field>
            <field name="scheduled_date" eval="datetime.now()"/>
        </record>
    </data>
</odoo>
```

Agregar al manifest:
```python
'demo': ['data/demo_data.xml'],
```

---

## 📚 RECURSOS ADICIONALES

- **Documentación Técnica:** `LOGICA_RSEXPRESS_EXPLICADA.md`
- **Guía de Usuario:** `README.md`
- **Implementación:** `IMPLEMENTACION_DELIVERY_ORDER.md`
- **Backup:** `BACKUP_PUNTO_RESTAURACION_2025-11-30.md`

---

## 🆘 SOPORTE

Si encuentras problemas durante la instalación:

1. Revisar logs de Odoo: `/var/log/odoo/odoo.log`
2. Verificar permisos de archivos
3. Asegurar que todas las dependencias estén instaladas
4. Contactar a **Sistemas Órbix**

---

## ✅ CHECKLIST DE INSTALACIÓN

- [ ] Odoo 19 instalado y funcionando
- [ ] Módulos dependientes instalados (fleet, hr, mail)
- [ ] Módulo orbix_fleet_test en directorio addons
- [ ] Permisos de archivos correctos (755)
- [ ] Modo desarrollador activado
- [ ] Lista de apps actualizada
- [ ] Módulo instalado/actualizado
- [ ] Menú RSExpress visible
- [ ] Modelos verificados en Técnico
- [ ] Vistas verificadas en Técnico
- [ ] Secuencia creada
- [ ] Vehículo de prueba creado
- [ ] Orden de prueba creada
- [ ] Flujo de estados probado
- [ ] Todo funcionando correctamente ✅

---

*Última actualización: 30 de Noviembre, 2025*
