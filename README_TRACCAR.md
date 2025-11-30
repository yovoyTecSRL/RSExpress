# 🛰️ INTEGRACIÓN TRACCAR GPS - RSExpress Logistics by Órbix

**Fecha:** 2025-11-30  
**Módulo:** orbix_fleet_test  
**Versión:** 1.0

---

## 📋 ÍNDICE

1. [¿Qué es Traccar?](#qué-es-traccar)
2. [Instalación de Traccar Server](#instalación-de-traccar-server)
3. [Configuración en Odoo](#configuración-en-odoo)
4. [Asociar Dispositivos a Vehículos](#asociar-dispositivos-a-vehículos)
5. [Sincronización Automática](#sincronización-automática)
6. [Webhooks (Opcional)](#webhooks-opcional)
7. [Testing y Validación](#testing-y-validación)
8. [Troubleshooting](#troubleshooting)

---

## 🔍 ¿QUÉ ES TRACCAR?

**Traccar** es una plataforma **open-source** de tracking GPS compatible con más de **200 protocolos** de dispositivos GPS.

### ✅ Ventajas

- ✅ **Gratuito y open-source**
- ✅ Compatible con 200+ dispositivos GPS
- ✅ Interfaz web incluida
- ✅ API REST completa
- ✅ Geofencing y alertas
- ✅ Reportes históricos
- ✅ Sin límite de dispositivos

### 📊 Arquitectura

```
[Dispositivos GPS] → [Traccar Server] → [API REST] → [Odoo RSExpress]
   (Móviles)           (Puerto 5055)    (Puerto 8082)   (fleet.vehicle)
```

---

## 🚀 INSTALACIÓN DE TRACCAR SERVER

### Opción 1: Docker (Recomendado)

```bash
# Crear directorio de datos
mkdir -p /var/traccar

# Ejecutar Traccar en Docker
docker run -d --name traccar \
  --restart unless-stopped \
  -p 8082:8082 \
  -p 5055:5055 \
  -v /var/traccar:/opt/traccar/data \
  traccar/traccar:latest

# Verificar que está corriendo
docker ps | grep traccar
docker logs traccar
```

### Opción 2: Linux (Ubuntu/Debian)

```bash
# Descargar instalador
cd /tmp
wget https://github.com/traccar/traccar/releases/download/v5.10/traccar-linux-64-5.10.zip

# Descomprimir e instalar
unzip traccar-linux-64-5.10.zip
sudo ./traccar.run

# Iniciar servicio
sudo systemctl start traccar
sudo systemctl enable traccar

# Verificar estado
sudo systemctl status traccar
```

### Opción 3: Windows

1. Descargar instalador desde: https://www.traccar.org/download/
2. Ejecutar `traccar-windows-64-5.10.exe`
3. Instalar como servicio de Windows
4. Iniciar desde Servicios de Windows

### Acceso Web

Después de instalar, acceder a:

```
http://localhost:8082
```

**Credenciales por defecto:**
- Usuario: `admin`
- Password: `admin`

⚠️ **IMPORTANTE:** Cambiar la contraseña en producción.

---

## ⚙️ CONFIGURACIÓN EN ODOO

### Paso 1: Configurar Parámetros del Sistema

1. Ir a **Ajustes** → **Técnico** → **Parámetros del Sistema**
2. Crear los siguientes parámetros:

| Clave | Valor | Descripción |
|-------|-------|-------------|
| `traccar.api.url` | `http://localhost:8082/api` | URL del API de Traccar |
| `traccar.api.username` | `admin` | Usuario de Traccar |
| `traccar.api.password` | `admin` | Contraseña de Traccar |
| `traccar.api.timeout` | `10` | Timeout en segundos |
| `traccar.api.retry` | `3` | Reintentos en caso de error |

**Ejemplo SQL (alternativo):**

```sql
INSERT INTO ir_config_parameter (key, value, create_date, write_date)
VALUES 
    ('traccar.api.url', 'http://localhost:8082/api', NOW(), NOW()),
    ('traccar.api.username', 'admin', NOW(), NOW()),
    ('traccar.api.password', 'admin', NOW(), NOW()),
    ('traccar.api.timeout', '10', NOW(), NOW()),
    ('traccar.api.retry', '3', NOW(), NOW())
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
```

### Paso 2: Verificar Conexión

#### Desde Navegador:

```
http://tu-odoo:8069/rsexpress/traccar/test
```

Si todo está OK, verás: ✅ **Conexión Exitosa con Traccar**

#### Desde Terminal:

```bash
cd /ruta/a/orbix_fleet_test
python test_traccar_connection.py
```

---

## 🔗 ASOCIAR DISPOSITIVOS A VEHÍCULOS

### Paso 1: Registrar Dispositivos en Traccar

1. Acceder a Traccar: `http://localhost:8082`
2. Login con `admin` / `admin`
3. Click en **Dispositivos** → **Agregar**
4. Configurar:
   - **Nombre:** `Moto-001` (mismo que vehículo en Odoo)
   - **Identificador:** IMEI del dispositivo GPS (ej: `123456789012345`)
   - **Grupo:** (opcional)
5. Guardar

### Paso 2: Asociar en Odoo

1. Ir a **RSExpress** → **Gestión de Flota** → **Vehículos**
2. Abrir el vehículo (ej: `Moto-001`)
3. En el formulario, buscar sección **"Integración Traccar"**
4. Completar:
   - **Traccar Device ID:** (obtener desde Traccar, ver abajo)
   - **Traccar Unique ID:** IMEI del dispositivo
5. Guardar

### ¿Cómo obtener el Traccar Device ID?

**Opción A: Desde API**

```bash
curl -u admin:admin http://localhost:8082/api/devices | jq
```

Buscar el `"id"` del dispositivo.

**Opción B: Desde Traccar UI**

1. Click en el dispositivo
2. Ver URL: `http://localhost:8082/?deviceId=123`
3. El número `123` es el Device ID

**Opción C: Desde Odoo (automático)**

Ejecutar en shell de Odoo:

```python
from odoo.addons.orbix_fleet_test.models.traccar_client import TraccarClient

client = TraccarClient(env)
devices = client.get_devices()

for device in devices:
    print(f"ID: {device['id']}, Nombre: {device['name']}, IMEI: {device['uniqueId']}")
```

---

## 🔄 SINCRONIZACIÓN AUTOMÁTICA

### Sincronización Manual

Desde el formulario del vehículo, click en botón:

**🔄 Sincronizar GPS Traccar**

Esto actualizará:
- Latitud
- Longitud
- Velocidad
- Última actualización
- Dirección (geocoding inverso)
- Estado (online/offline)

### Sincronización Automática (Cron Job)

El módulo incluye un cron job que sincroniza todos los vehículos cada **5 minutos**.

Para activarlo:

1. Ir a **Ajustes** → **Técnico** → **Tareas Programadas**
2. Buscar: **"Sync All Traccar Positions"**
3. Configurar:
   - **Intervalo:** 5 minutos (o el deseado)
   - **Activo:** ✅
   - **Usuario:** Administrador
4. Guardar

**Crear manualmente (XML):**

Agregar en `data/ir_cron.xml`:

```xml
<record id="cron_sync_traccar_positions" model="ir.cron">
    <field name="name">Sync All Traccar GPS Positions</field>
    <field name="model_id" ref="fleet.model_fleet_vehicle"/>
    <field name="state">code</field>
    <field name="code">model.cron_sync_all_traccar_positions()</field>
    <field name="interval_number">5</field>
    <field name="interval_type">minutes</field>
    <field name="numbercall">-1</field>
    <field name="active" eval="True"/>
</record>
```

---

## 🔔 WEBHOOKS (OPCIONAL)

Los webhooks permiten que **Traccar envíe actualizaciones a Odoo** en tiempo real sin necesidad de polling.

### Configurar en Traccar

1. Editar archivo de configuración de Traccar:

**Linux/Docker:**
```bash
sudo nano /opt/traccar/conf/traccar.xml
```

**Windows:**
```
C:\Program Files\Traccar\conf\traccar.xml
```

2. Agregar dentro de `<config>`:

```xml
<entry key='notificator.types'>web</entry>
<entry key='notificator.web.url'>http://tu-odoo:8069/rsexpress/traccar/webhook</entry>
```

3. Reiniciar Traccar:

```bash
# Docker
docker restart traccar

# Linux
sudo systemctl restart traccar

# Windows
net stop traccar
net start traccar
```

### Configurar Notificación en Traccar UI

1. Ir a **Configuración** → **Notificaciones**
2. Click **Agregar**
3. Configurar:
   - **Tipo:** `Web Request (HTTP)`
   - **Siempre:** ✅ (o configurar geofence)
   - **Dispositivos:** Seleccionar todos
4. Guardar

### Verificar Webhook

Desde terminal:

```bash
curl -X POST http://tu-odoo:8069/rsexpress/traccar/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": 1,
    "latitude": 4.60971,
    "longitude": -74.08175,
    "speed": 45.5,
    "fixTime": "2025-11-30T10:30:00Z"
  }'
```

Respuesta esperada:
```json
{
  "status": "success",
  "vehicle_id": 5,
  "vehicle_name": "Moto-001",
  "message": "Posición actualizada"
}
```

---

## 🧪 TESTING Y VALIDACIÓN

### Test 1: Script Python

```bash
cd /ruta/a/orbix_fleet_test
python test_traccar_connection.py
```

Resultado esperado:
```
✅ PASS - Servidor Info
✅ PASS - Dispositivos
✅ PASS - Posiciones GPS
✅ PASS - Autenticación
✅ PASS - Endpoints API

Resultado: 5/5 tests exitosos
```

### Test 2: Desde Odoo UI

```
http://tu-odoo:8069/rsexpress/traccar/test
```

### Test 3: Desde Shell de Odoo

```bash
odoo shell -d rsexpress_db
```

```python
from odoo.addons.orbix_fleet_test.models.traccar_client import TraccarClient

# Crear cliente
client = TraccarClient(env)

# Test de conexión
result = client.test_connection()
print(result)

# Listar dispositivos
devices = client.get_devices()
for device in devices:
    print(f"{device['id']}: {device['name']} - {device['status']}")

# Obtener última posición
position = client.get_last_position(device_id=1)
print(f"Lat: {position['latitude']}, Lng: {position['longitude']}")

# Sincronizar un vehículo
vehicle = env['fleet.vehicle'].search([('x_traccar_device_id', '=', 1)], limit=1)
vehicle.sync_traccar_position()
print(f"Vehículo actualizado: {vehicle.name}")
```

### Test 4: Endpoint JSON desde JavaScript

```javascript
// Desde navegador (console)
fetch('/rsexpress/opscenter/tracking/all', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'call',
        params: {}
    })
})
.then(r => r.json())
.then(data => console.log(data));
```

---

## 🐛 TROUBLESHOOTING

### Problema 1: "No se puede conectar a Traccar"

**Síntomas:**
- Error: `ConnectionError: No se puede conectar a http://localhost:8082/api`

**Solución:**
1. Verificar que Traccar esté corriendo:
   ```bash
   # Docker
   docker ps | grep traccar
   
   # Linux
   sudo systemctl status traccar
   
   # Windows
   services.msc → Buscar "Traccar"
   ```

2. Verificar puerto 8082 abierto:
   ```bash
   curl http://localhost:8082/api/server
   ```

3. Verificar firewall:
   ```bash
   # Linux
   sudo ufw allow 8082
   
   # Windows
   Firewall → Regla de entrada → Puerto 8082
   ```

---

### Problema 2: "Autenticación fallida"

**Síntomas:**
- Error: `401 Unauthorized`

**Solución:**
1. Verificar credenciales en Parámetros del Sistema
2. Probar login en Traccar UI: `http://localhost:8082`
3. Verificar que no haya espacios en usuario/password

---

### Problema 3: "Dispositivo no encontrado"

**Síntomas:**
- Error: `Vehículo con Traccar Device ID X no encontrado`

**Solución:**
1. Verificar que el Device ID en Odoo coincida con Traccar:
   ```bash
   curl -u admin:admin http://localhost:8082/api/devices | jq
   ```

2. Actualizar el Device ID en el formulario del vehículo

---

### Problema 4: "No hay posiciones registradas"

**Síntomas:**
- Dispositivo online pero sin posiciones GPS

**Solución:**
1. Verificar que el dispositivo GPS esté enviando datos:
   - Revisar logs de Traccar: `docker logs traccar`
   - Verificar protocolo del dispositivo GPS
   - Verificar puerto correcto (ej: 5055 para OSMAND)

2. Configurar dispositivo GPS:
   ```
   Servidor: tu-traccar-server.com
   Puerto: 5055 (OSMAND)
   Device ID: IMEI del dispositivo
   Intervalo: 30 segundos
   ```

3. Simular envío de posición (para testing):
   ```bash
   curl "http://localhost:5055?id=123456&lat=4.60971&lon=-74.08175&timestamp=$(date +%s)"
   ```

---

### Problema 5: "Timeout después de 10 segundos"

**Síntomas:**
- Error: `Timeout conectando a Traccar (10s)`

**Solución:**
1. Aumentar timeout en Parámetros del Sistema:
   - `traccar.api.timeout` = `30`

2. Verificar latencia de red:
   ```bash
   ping tu-traccar-server.com
   ```

3. Verificar carga del servidor Traccar

---

## 📊 CONFIGURACIÓN AVANZADA

### Geofencing con Traccar

1. En Traccar UI: **Geofences** → **Agregar**
2. Dibujar área en el mapa
3. Asignar a dispositivos
4. Configurar notificación al entrar/salir
5. Webhook enviará evento a Odoo

### Reportes Históricos

```python
from datetime import datetime, timedelta
from odoo.addons.orbix_fleet_test.models.traccar_client import TraccarClient

client = TraccarClient(env)

# Obtener posiciones de las últimas 24 horas
from_time = datetime.now() - timedelta(hours=24)
to_time = datetime.now()

positions = client.get_positions(
    device_ids=[1, 2, 3],
    from_time=from_time,
    to_time=to_time
)

print(f"Total posiciones: {len(positions)}")
```

### Integración con OpsCenter

El OpsCenter ya consume automáticamente los datos GPS desde:

```
/rsexpress/opscenter/data
```

Este endpoint incluye `lat`, `lng` y `speed` de todos los vehículos.

---

## 🔐 SEGURIDAD EN PRODUCCIÓN

### 1. Cambiar Contraseña de Traccar

```bash
# Desde Traccar UI:
# Settings → Users → admin → Change Password
```

### 2. HTTPS para API

Configurar proxy inverso (Nginx):

```nginx
server {
    listen 443 ssl;
    server_name traccar.tu-dominio.com;

    ssl_certificate /etc/ssl/certs/traccar.crt;
    ssl_certificate_key /etc/ssl/private/traccar.key;

    location / {
        proxy_pass http://localhost:8082;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 3. Restringir Acceso por IP

En Traccar:

```xml
<entry key='web.origin'>https://tu-odoo.com</entry>
<entry key='filter.enable'>true</entry>
<entry key='filter.invalid'>true</entry>
```

---

## 📚 RECURSOS ADICIONALES

- **Documentación Oficial:** https://www.traccar.org/documentation/
- **API Reference:** https://www.traccar.org/api-reference/
- **Protocolos Soportados:** https://www.traccar.org/devices/
- **Forum:** https://www.traccar.org/forums/
- **GitHub:** https://github.com/traccar/traccar

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

- [ ] Traccar Server instalado y corriendo
- [ ] Acceso web funcionando (`http://localhost:8082`)
- [ ] Parámetros del sistema configurados en Odoo
- [ ] Test de conexión exitoso (`/rsexpress/traccar/test`)
- [ ] Dispositivos GPS registrados en Traccar
- [ ] Device IDs asociados a vehículos en Odoo
- [ ] Sincronización manual funciona
- [ ] Cron job activado (cada 5 min)
- [ ] Webhooks configurados (opcional)
- [ ] Testing completo con `test_traccar_connection.py`
- [ ] Contraseña cambiada en producción
- [ ] HTTPS configurado en producción
- [ ] Documentación entregada al equipo

---

**Fin de la documentación**  
*Generado por Sistemas Órbix - 2025-11-30*
