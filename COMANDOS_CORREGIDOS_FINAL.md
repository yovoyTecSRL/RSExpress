# COMANDOS CORREGIDOS - BASE DE DATOS: odoo19

## 1. ACTUALIZACIÓN DEL MÓDULO

### Opción A: Interfaz Web (RECOMENDADA)
```
Aplicaciones → Buscar "RSExpress Logistics" → Actualizar
```

### Opción B: Linux/Docker
```bash
odoo-bin -c /etc/odoo/odoo.conf -d odoo19 -u orbix_fleet_test --stop-after-init
```

### Opción C: Docker Exec
```bash
docker exec -it odoo_container odoo-bin -c /etc/odoo/odoo.conf -d odoo19 -u orbix_fleet_test --stop-after-init
```

### Opción D: Windows PowerShell
```powershell
odoo-bin.exe -c odoo.conf -d odoo19 -u orbix_fleet_test --stop-after-init
```

---

## 2. CONFIGURACIÓN TRACCAR

### Desde Odoo Shell
```bash
odoo-bin shell -c /etc/odoo/odoo.conf -d odoo19
```

```python
env['ir.config_parameter'].sudo().set_param('traccar.api.url', 'http://localhost:8082/api')
env['ir.config_parameter'].sudo().set_param('traccar.api.username', 'admin')
env['ir.config_parameter'].sudo().set_param('traccar.api.password', 'admin')
env['ir.config_parameter'].sudo().set_param('traccar.api.timeout', '10')
env['ir.config_parameter'].sudo().set_param('traccar.api.retry', '3')
env.cr.commit()
exit()
```

### Desde Interfaz Web
```
Ajustes → Técnico → Parámetros del Sistema
Crear: traccar.api.url, traccar.api.username, traccar.api.password
```

---

## 3. BACKUP

```bash
pg_dump -U odoo -d odoo19 -F c -f backup_$(date +%F_%H%M%S).dump
```

### Restaurar
```bash
pg_restore -U odoo -d odoo19 -c backup_FECHA.dump
```

---

## 4. VERIFICACIÓN POST-ACTUALIZACIÓN

```bash
psql -U odoo -d odoo19 -f VERIFICAR_INTEGRIDAD.sql
```

O manualmente:
```sql
-- Módulo
SELECT name, shortdesc, state FROM ir_module_module WHERE name = 'orbix_fleet_test';

-- Campos Traccar
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'fleet_vehicle' AND column_name LIKE 'x_traccar%';

-- Vistas
SELECT name, model FROM ir_ui_view WHERE name LIKE '%traccar%';

-- Cron
SELECT name, active FROM ir_cron WHERE name LIKE '%traccar%';
```

---

## 5. INSTALACIÓN TRACCAR

```bash
docker run -d \
  --name traccar \
  -p 8082:8082 \
  -p 5055:5055 \
  -v /opt/traccar/conf:/opt/traccar/conf \
  -v /opt/traccar/logs:/opt/traccar/logs \
  traccar/traccar:latest
```

### Acceso
```
http://localhost:8082
Usuario: admin
Password: admin
```

---

## 6. TEST ENDPOINTS

```bash
# Tracking de todos los vehículos
curl http://localhost:8069/rsexpress/opscenter/tracking/all

# Tracking de vehículo específico
curl http://localhost:8069/rsexpress/opscenter/tracking/1

# Test de conexión Traccar
curl http://localhost:8069/rsexpress/traccar/test
```

---

## 7. BITBUCKET PUSH

### Linux/macOS
```bash
chmod +x COMANDOS_BITBUCKET.sh
./COMANDOS_BITBUCKET.sh
```

### Windows PowerShell
```powershell
.\COMANDOS_BITBUCKET_WINDOWS.ps1
```

### Manual
```bash
git add .
git commit -m "Update orbix_fleet_test con integración Traccar"
git push origin main
```

---

## 8. ROLLBACK DE EMERGENCIA

```bash
pg_restore -U odoo -d odoo19 -c backup_FECHA.dump
sudo systemctl restart odoo
```

---

## SCRIPTS EJECUTABLES

- `ACTUALIZACION_SEGURA_ODOO19.sh` - Actualización automatizada
- `CONFIGURAR_TRACCAR.sh` - Configuración interactiva
- `VERIFICAR_INTEGRIDAD.sql` - Verificación post-actualización
- `COMANDOS_BITBUCKET.sh` - Push a Bitbucket (Linux)
- `COMANDOS_BITBUCKET_WINDOWS.ps1` - Push a Bitbucket (Windows)

---

## RESUMEN DE CORRECCIONES

| Incorrecto | Correcto |
|------------|----------|
| `-d rsexpress_db` | `-d odoo19` |
| `psql rsexpress_db` | `psql -U odoo -d odoo19` |
| `pg_dump rsexpress_db` | `pg_dump -U odoo -d odoo19` |
| SQL directo config | `ir.config_parameter` |
| Crear nueva DB | **ELIMINADO** |
| ALTER TABLE DROP | **ELIMINADO** |

---

**✓ Base de datos: odoo19**  
**✓ Sin pérdida de datos**  
**✓ Sin operaciones destructivas**
