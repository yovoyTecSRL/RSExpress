-- ================================================================================
-- SCRIPT SQL - ACTUALIZACIÓN BRANDING "RSExpress Logistics by Órbix"
-- ================================================================================
-- Fecha: 2025-11-30
-- Propósito: Actualizar metadata de Odoo después de refactorización del módulo
-- Módulo técnico: orbix_fleet_test
-- IMPORTANTE: Ejecutar este script DESPUÉS de actualizar el módulo
-- ================================================================================

-- ====================
-- 1. MÓDULO PRINCIPAL
-- ====================

UPDATE ir_module_module
SET 
    shortdesc = 'RSExpress Logistics by Órbix',
    summary = 'RSExpress - Sistema Completo de Gestión Logística y Entregas'
WHERE name = 'orbix_fleet_test';

-- Verificar actualización
SELECT name, shortdesc, summary, state
FROM ir_module_module
WHERE name = 'orbix_fleet_test';


-- ====================
-- 2. MENÚS
-- ====================

-- Menú raíz
UPDATE ir_ui_menu
SET name = 'RSExpress Logistics'
WHERE name = 'Orbix Fleet Test'
  AND parent_id IS NULL;

-- Actualizar menú raíz alternativo (si existe)
UPDATE ir_ui_menu
SET name = 'RSExpress'
WHERE name IN ('RSExpress', 'Orbix Fleet Test', 'orbix_fleet_test')
  AND parent_id IS NULL;

-- Verificar menús actualizados
SELECT id, name, parent_id, sequence
FROM ir_ui_menu
WHERE name LIKE '%RSExpress%' OR name LIKE '%Orbix%'
ORDER BY parent_id, sequence;


-- ====================
-- 3. ACCIONES DE VENTANA
-- ====================

-- Actualizar acciones de flota
UPDATE ir_actions_act_window
SET name = 'Vehículos RSExpress'
WHERE name LIKE '%Orbix Fleet%' OR name LIKE '%Fleet Test%'
  AND res_model = 'fleet.vehicle';

-- Actualizar acciones de pedidos
UPDATE ir_actions_act_window
SET name = 'Pedidos de Entrega RSExpress'
WHERE name LIKE '%Delivery%' OR name LIKE '%Pedidos%'
  AND res_model = 'rsexpress.delivery.order';

-- Actualizar acción del dashboard
UPDATE ir_actions_act_window
SET name = 'RSExpress OpsCenter'
WHERE name LIKE '%OpsCenter%' OR name LIKE '%Dashboard%';

-- Verificar acciones actualizadas
SELECT id, name, res_model, view_mode
FROM ir_actions_act_window
WHERE name LIKE '%RSExpress%' OR res_model IN ('fleet.vehicle', 'rsexpress.delivery.order')
ORDER BY res_model, name;


-- ====================
-- 4. VISTAS
-- ====================

-- Actualizar nombres de vistas heredadas de fleet.vehicle
UPDATE ir_ui_view
SET name = 'rsexpress.fleet.vehicle.form.inherit'
WHERE name LIKE '%orbix%fleet%' 
  AND model = 'fleet.vehicle'
  AND name NOT LIKE '%rsexpress%';

-- Verificar vistas actualizadas
SELECT id, name, model, type, inherit_id
FROM ir_ui_view
WHERE model IN ('fleet.vehicle', 'rsexpress.delivery.order')
  AND (name LIKE '%rsexpress%' OR name LIKE '%orbix%')
ORDER BY model, type;


-- ====================
-- 5. CAMPOS PERSONALIZADOS
-- ====================

-- Verificar que los campos x_* tengan string apropiado
SELECT name, field_description, model
FROM ir_model_fields
WHERE model = 'fleet.vehicle'
  AND name LIKE 'x_%'
ORDER BY name;


-- ====================
-- 6. REGLAS DE SEGURIDAD (ir.model.access)
-- ====================

-- Verificar permisos del módulo
SELECT name, model_id, perm_read, perm_write, perm_create, perm_unlink
FROM ir_model_access
WHERE name LIKE '%orbix%' OR name LIKE '%rsexpress%'
ORDER BY model_id;


-- ====================
-- 7. LIMPIAR REFERENCIAS ANTIGUAS
-- ====================

-- Buscar cualquier referencia a "Test" en nombres de acciones
SELECT id, name, res_model
FROM ir_actions_act_window
WHERE name LIKE '%Test%' 
  AND (res_model = 'fleet.vehicle' OR res_model LIKE '%rsexpress%');

-- Buscar cualquier referencia a "Test" en menús
SELECT id, name, parent_id
FROM ir_ui_menu
WHERE name LIKE '%Test%'
  AND name NOT LIKE '%Unit Test%';  -- Excluir tests unitarios legítimos

-- Buscar cualquier referencia a "Demo" o "Prueba"
SELECT id, name, res_model
FROM ir_actions_act_window
WHERE (name LIKE '%Demo%' OR name LIKE '%Prueba%')
  AND (res_model = 'fleet.vehicle' OR res_model LIKE '%rsexpress%');


-- ====================
-- 8. VERIFICACIÓN FINAL
-- ====================

-- Resumen de elementos del módulo
SELECT 
    'Módulo' as tipo,
    name as codigo_tecnico,
    shortdesc as nombre_mostrado,
    summary as resumen,
    state as estado
FROM ir_module_module
WHERE name = 'orbix_fleet_test'

UNION ALL

SELECT 
    'Menú' as tipo,
    COALESCE(m2.name, 'ROOT') as codigo_tecnico,
    m1.name as nombre_mostrado,
    CAST(m1.sequence as VARCHAR) as resumen,
    'menu' as estado
FROM ir_ui_menu m1
LEFT JOIN ir_ui_menu m2 ON m1.parent_id = m2.id
WHERE m1.name LIKE '%RSExpress%' OR m1.name LIKE '%Orbix%'

UNION ALL

SELECT 
    'Acción' as tipo,
    res_model as codigo_tecnico,
    name as nombre_mostrado,
    view_mode as resumen,
    'action' as estado
FROM ir_actions_act_window
WHERE res_model IN ('fleet.vehicle', 'rsexpress.delivery.order')
  OR name LIKE '%RSExpress%'

ORDER BY tipo, codigo_tecnico;


-- ====================
-- 9. COMMIT Y LOG
-- ====================

-- ⚠️ IMPORTANTE: Ejecutar COMMIT solo si todo está correcto
-- COMMIT;

-- Log de ejecución (opcional - para auditoría)
-- INSERT INTO rsexpress_migration_log (execution_date, script_name, status, records_affected)
-- VALUES (NOW(), 'update_branding_db.sql', 'SUCCESS', ROW_COUNT());


-- ================================================================================
-- FIN DEL SCRIPT
-- ================================================================================
-- 
-- INSTRUCCIONES DE USO:
-- ---------------------
-- 1. Hacer backup de la base de datos:
--    pg_dump -U odoo -d odoo19 -F c -f backup_antes_branding.dump
-- 
-- 2. Conectar a PostgreSQL:
--    psql -U odoo -d odoo19
-- 
-- 3. Ejecutar este script:
--    \i /opt/odoo/addons/orbix_fleet_test/data/update_branding_db.sql
-- 
-- 4. Verificar resultados con las queries de verificación (sección 8)
-- 
-- 5. Si todo es correcto, hacer COMMIT
-- 
-- 6. Reiniciar Odoo:
--    sudo systemctl restart odoo
-- 
-- 7. Limpiar cache del navegador y verificar en interfaz web
-- 
-- ================================================================================
-- ROLLBACK (si algo sale mal):
-- ---------------------
-- BEGIN;
-- ... ejecutar script ...
-- ROLLBACK;  -- En lugar de COMMIT
-- 
-- O restaurar backup:
-- pg_restore -U odoo -d odoo19 -c backup_antes_branding.dump
-- ================================================================================
