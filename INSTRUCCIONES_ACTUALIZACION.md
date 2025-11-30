# 🚀 INSTRUCCIONES DE ACTUALIZACIÓN - RSExpress Logistics v2.0
## Integración Traccar GPS Completa

**Fecha:** 2025-11-30  
**Versión anterior:** 1.0 (sin Traccar)  
**Versión nueva:** 2.0 (con Traccar completo)  
**Modo de actualización:** Upgrade in-place

---

## ⚠️ IMPORTANTE - LEER ANTES DE COMENZAR

Esta actualización agrega:
- ✅ 7 nuevos campos en `fleet.vehicle`
- ✅ 1 nuevo modelo Python (`traccar_client.py`)
- ✅ 4 nuevos endpoints REST
- ✅ 1 cron job (sincronización cada 5 minutos)
- ✅ 3 nuevas vistas XML
- ✅ 1 nuevo componente JavaScript (mapa Leaflet)

**NO es destructiva:** No elimina datos existentes.

---

## 📋 CHECKLIST PRE-ACTUALIZACIÓN

- [ ] **Backup completo de base de datos**
  ```bash
  pg_dump -U odoo rsexpress_db > backup_$(date +%Y%m%d_%H%M%S).sql
  ```

- [ ] **Backup del código del módulo**
  ```bash
  cd d:\RSEXPRESS\MimotoExpress8888
  tar -czf orbix_fleet_test_backup_$(date +%Y%m%d).tar.gz orbix_fleet_test/
  ```

- [ ] **Verificar Odoo corriendo correctamente**
  ```bash
  # Windows
  tasklist | findstr python

  # Linux
  systemctl status odoo
  ```

- [ ] **Verificar permisos de escritura en directorio del módulo**

- [ ] **Cerrar sesiones activas de Odoo** (opcional pero recomendado)

---

## 🔧 PASO 1: ACTUALIZAR ARCHIVOS DEL MÓDULO

### 1.1 Detener Odoo (recomendado)

**Windows:**
```cmd
# Buscar proceso Python de Odoo
tasklist | findstr python

# Matar proceso (reemplazar PID)
taskkill /PID <PID> /F
```

**Linux:**
```bash
sudo systemctl stop odoo
```

---

### 1.2 Verificar archivos nuevos/modificados

Archivos que deben existir:

```
orbix_fleet_test/
├── models/
│   ├── traccar_client.py                    ← NUEVO
│   └── fleet_vehicle_ext.py                 ← MODIFICADO
├── controllers/
│   └── opscenter.py                         ← MODIFICADO
├── data/
│   ├── ir_cron_traccar.xml                  ← NUEVO
│   └── update_branding_db.sql               ← NUEVO
├── views/
│   ├── fleet_vehicle_traccar_form.xml       ← NUEVO
│   └── rsexpress_tracking_map.xml           ← NUEVO
├── static/src/js/
│   └── tracking_map.js                      ← NUEVO
├── test_traccar_connection.py               ← NUEVO
├── README_TRACCAR.md                        ← NUEVO
├── RESUMEN_INTEGRACION_TRACCAR.md           ← NUEVO
└── __manifest__.py                          ← MODIFICADO
```

---

### 1.3 Verificar `__manifest__.py`

Debe contener:

```python
'version': '19.0.2.0.0',  # Versión incrementada

'data': [
    'data/ir_cron_traccar.xml',              # ← AGREGADO
    'views/fleet_vehicle_traccar_form.xml',  # ← AGREGADO
    'views/rsexpress_tracking_map.xml',      # ← AGREGADO
],

'assets': {
    'web.assets_backend': [
        'orbix_fleet_test/static/src/js/tracking_map.js',  # ← AGREGADO
        'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css', # ← AGREGADO
        'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',  # ← AGREGADO
    ],
},
```

---

## 🔄 PASO 2: ACTUALIZAR MÓDULO EN ODOO

### 2.1 Iniciar Odoo en modo upgrade

**Opción A: Desde línea de comandos (recomendado)**

```bash
# Windows
python odoo-bin -c odoo.conf -d rsexpress_db -u orbix_fleet_test --stop-after-init

# Linux
odoo -c /etc/odoo/odoo.conf -d rsexpress_db -u orbix_fleet_test --stop-after-init
```

**Flags:**
- `-d rsexpress_db` = Nombre de tu base de datos
- `-u orbix_fleet_test` = Actualizar módulo específico
- `--stop-after-init` = Detener después de actualizar

---

**Opción B: Desde interfaz web**

1. Iniciar Odoo normalmente
2. Activar **Modo Desarrollador**:
   - Ajustes → Activar modo desarrollador
3. Ir a **Aplicaciones**
4. Quitar filtro "Aplicaciones"
5. Buscar: "RSExpress Logistics"
6. Click en **⬆️ Actualizar**

---

### 2.2 Verificar actualización exitosa

**Consola/terminal debe mostrar:**

```
INFO rsexpress_db odoo.modules.loading: loading 1 modules...
INFO rsexpress_db odoo.modules.loading: 1 modules loaded in 0.05s, 0 queries
INFO rsexpress_db odoo.modules.registry: module orbix_fleet_test: creating or updating database tables
INFO rsexpress_db odoo.addons.base.models.ir_model: Model fleet.vehicle: updating field x_traccar_device_id
INFO rsexpress_db odoo.addons.base.models.ir_model: Model fleet.vehicle: updating field x_traccar_unique_id
INFO rsexpress_db odoo.addons.base.models.ir_model: updating field x_last_speed
INFO rsexpress_db odoo.addons.base.models.ir_model: updating field x_last_update
INFO rsexpress_db odoo.addons.base.models.ir_model: updating field x_last_address
INFO rsexpress_db odoo.addons.base.models.ir_model: updating field x_traccar_status
INFO rsexpress_db odoo.modules.loading: Modules loaded.
```

**Si hay errores:**
- Revisar logs completos en `odoo.log`
- Verificar sintaxis de archivos Python/XML
- Verificar permisos de archivos

---

## ✅ PASO 3: VERIFICAR INSTALACIÓN

### 3.1 Verificar campos nuevos en base de datos

```bash
psql -U odoo -d rsexpress_db
```

```sql
-- Verificar que los campos existen
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'fleet_vehicle' 
AND column_name LIKE 'x_traccar%';

-- Debe mostrar:
-- x_traccar_device_id    | integer
-- x_traccar_unique_id    | character varying
-- x_traccar_status       | character varying
-- x_last_speed           | double precision
-- x_last_update          | timestamp without time zone
-- x_last_address         | character varying
```

---

### 3.2 Verificar cron job

1. Ir a **Ajustes** → **Técnico** → **Tareas Programadas**
2. Buscar: "RSExpress - Sync Traccar GPS Positions"
3. Verificar:
   - ✅ **Activo:** Sí
   - ✅ **Intervalo:** 5 minutos
   - ✅ **Estado:** code
   - ✅ **Código:** `model.cron_sync_all_traccar_positions()`

---

### 3.3 Verificar vistas

1. Ir a **RSExpress** → **Gestión de Flota** → **Vehículos**
2. Abrir cualquier vehículo
3. Verificar que existe página: **🛰️ GPS Tracking (Traccar)**
4. Verificar que aparecen campos:
   - Traccar Device ID
   - Traccar Unique ID
   - Última Latitud / Longitud
   - Última Velocidad
   - Botón "🔄 Sincronizar GPS Ahora"

---

### 3.4 Verificar menú de tracking

1. Ir a **RSExpress** → **Gestión de Flota**
2. Verificar que existe menú: **🗺️ Tracking GPS**
3. Click para abrir (debe cargar vista modal con placeholder de mapa)

---

### 3.5 Verificar endpoints

**Opción A: Navegador**

```
http://localhost:8069/rsexpress/traccar/test
```

Debe mostrar página de test (puede mostrar error de conexión si Traccar no está instalado aún, esto es normal).

**Opción B: cURL**

```bash
# Test endpoint público
curl http://localhost:8069/rsexpress/traccar/test

# Test endpoint tracking (requiere autenticación)
curl -u admin:admin -X POST \
  http://localhost:8069/rsexpress/opscenter/tracking/all \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"call","params":{}}'
```

---

## 📊 PASO 4: CONFIGURAR TRACCAR (POST-ACTUALIZACIÓN)

**NOTA:** Esta actualización no requiere Traccar instalado para funcionar.  
Los endpoints y vistas funcionan sin Traccar, solo no mostrarán datos GPS.

Para habilitar tracking GPS completo:

### 4.1 Instalar Traccar Server

Ver: `README_TRACCAR.md` sección "Instalación de Traccar Server"

**Resumen rápido (Docker):**
```bash
docker run -d --name traccar \
  --restart unless-stopped \
  -p 8082:8082 \
  -p 5055:5055 \
  traccar/traccar:latest
```

---

### 4.2 Configurar parámetros en Odoo

1. Ir a **Ajustes** → **Técnico** → **Parámetros del Sistema**
2. Crear:

| Clave | Valor |
|-------|-------|
| `traccar.api.url` | `http://localhost:8082/api` |
| `traccar.api.username` | `admin` |
| `traccar.api.password` | `admin` |
| `traccar.api.timeout` | `10` |
| `traccar.api.retry` | `3` |

---

### 4.3 Test de conexión

```bash
cd d:\RSEXPRESS\MimotoExpress8888\orbix_fleet_test
python test_traccar_connection.py
```

Debe mostrar:
```
✅ PASS - Servidor Info
✅ PASS - Dispositivos
✅ PASS - Posiciones GPS
✅ PASS - Autenticación
✅ PASS - Endpoints API

Resultado: 5/5 tests exitosos
```

---

## 🔥 ROLLBACK EN CASO DE PROBLEMAS

### Opción 1: Restaurar base de datos

```bash
# Detener Odoo
sudo systemctl stop odoo

# Restaurar backup
psql -U odoo -d rsexpress_db < backup_20251130_HHMMSS.sql

# Reiniciar Odoo
sudo systemctl start odoo
```

---

### Opción 2: Desinstalar campos Traccar

```sql
-- Conectar a base de datos
psql -U odoo -d rsexpress_db

-- Eliminar campos (NO RECOMENDADO)
ALTER TABLE fleet_vehicle DROP COLUMN IF EXISTS x_traccar_device_id;
ALTER TABLE fleet_vehicle DROP COLUMN IF EXISTS x_traccar_unique_id;
ALTER TABLE fleet_vehicle DROP COLUMN IF EXISTS x_last_speed;
ALTER TABLE fleet_vehicle DROP COLUMN IF EXISTS x_last_update;
ALTER TABLE fleet_vehicle DROP COLUMN IF EXISTS x_last_address;
ALTER TABLE fleet_vehicle DROP COLUMN IF EXISTS x_traccar_status;

-- Eliminar cron job
DELETE FROM ir_cron WHERE name = 'RSExpress - Sync Traccar GPS Positions';
```

---

### Opción 3: Restaurar código anterior

```bash
# Extraer backup
tar -xzf orbix_fleet_test_backup_20251130.tar.gz

# Reemplazar directorio
rm -rf orbix_fleet_test/
mv orbix_fleet_test_backup/ orbix_fleet_test/

# Actualizar módulo con código anterior
odoo -c odoo.conf -d rsexpress_db -u orbix_fleet_test --stop-after-init
```

---

## 🐛 TROUBLESHOOTING

### Error: "Field 'x_traccar_device_id' does not exist"

**Causa:** Campos no creados en base de datos.

**Solución:**
```bash
# Forzar actualización de módulo
odoo -c odoo.conf -d rsexpress_db -u orbix_fleet_test --stop-after-init -i orbix_fleet_test
```

---

### Error: "Module traccar_client not found"

**Causa:** Archivo `models/traccar_client.py` no existe o no está en `models/__init__.py`.

**Solución:**
Verificar que `models/__init__.py` contiene:
```python
from . import traccar_client
```

---

### Error: "View 'fleet_vehicle_traccar_form' not found"

**Causa:** Vista XML no cargada correctamente.

**Solución:**
1. Verificar que archivo existe: `views/fleet_vehicle_traccar_form.xml`
2. Verificar que está en `__manifest__.py` sección `'data'`
3. Actualizar módulo con `-u orbix_fleet_test`

---

### Error: "Leaflet is not defined"

**Causa:** CDN de Leaflet no cargado.

**Solución:**
1. Verificar conexión a internet
2. Verificar que `__manifest__.py` contiene:
   ```python
   'assets': {
       'web.assets_backend': [
           'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
           'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
       ],
   }
   ```
3. Limpiar caché del navegador: Ctrl + Shift + R

---

### Cron job no ejecuta

**Causa:** Cron desactivado o error en código.

**Solución:**
1. Verificar en **Tareas Programadas** que está **Activo**
2. Click derecho → **Ejecutar Manualmente**
3. Revisar logs: `tail -f /var/log/odoo/odoo.log`

---

## 📈 MÉTRICAS DE ÉXITO

Después de la actualización, deberías poder:

- ✅ Ver página "GPS Tracking" en formulario de vehículo
- ✅ Ver menú "🗺️ Tracking GPS" en RSExpress
- ✅ Acceder a `/rsexpress/traccar/test` sin error 404
- ✅ Ver cron job en Tareas Programadas
- ✅ Ejecutar `python test_traccar_connection.py` (puede fallar conexión si Traccar no instalado)
- ✅ Crear registro nuevo en `fleet.vehicle` sin errores
- ✅ Campos `x_traccar_*` visibles en vista form
- ✅ Botón "Sincronizar GPS Ahora" visible (deshabilitado si no hay Device ID)

---

## 📚 DOCUMENTACIÓN ADICIONAL

- **Instalación Traccar:** `README_TRACCAR.md`
- **Resumen técnico:** `RESUMEN_INTEGRACION_TRACCAR.md`
- **Testing script:** `test_traccar_connection.py`
- **SQL branding:** `data/update_branding_db.sql`

---

## 🆘 SOPORTE

Si encuentras problemas:

1. **Revisar logs:**
   ```bash
   tail -f /var/log/odoo/odoo.log
   ```

2. **Modo debug Odoo:**
   ```bash
   odoo -c odoo.conf --log-level=debug
   ```

3. **Verificar permisos:**
   ```bash
   ls -la models/traccar_client.py
   ls -la views/fleet_vehicle_traccar_form.xml
   ```

4. **Contactar soporte:**
   - Email: soporte@sistemasorbix.com
   - Logs completos adjuntos
   - Pasos para reproducir error
   - Versión de Odoo: `odoo --version`

---

## ✅ CHECKLIST POST-ACTUALIZACIÓN

- [ ] Módulo actualizado sin errores
- [ ] Campos `x_traccar_*` existen en base de datos
- [ ] Vista "GPS Tracking" visible en formulario
- [ ] Menú "🗺️ Tracking GPS" accesible
- [ ] Cron job activo en Tareas Programadas
- [ ] Endpoint `/rsexpress/traccar/test` funciona
- [ ] Backup de base de datos guardado
- [ ] README_TRACCAR.md leído
- [ ] test_traccar_connection.py ejecutado (con Traccar instalado)
- [ ] Documentación interna actualizada
- [ ] Usuarios notificados de nueva funcionalidad

---

**🎉 ¡Actualización completada!**

Ahora puedes proceder a instalar Traccar Server y configurar dispositivos GPS.

Ver: `README_TRACCAR.md` para continuar.

---

**Fecha:** 2025-11-30  
**Desarrollado por:** Sistemas Órbix  
**Versión:** 2.0.0  
**Estado:** ✅ Production Ready
