-- ================================================================================
-- VERIFICACIÓN DE INTEGRIDAD - orbix_fleet_test
-- ================================================================================
-- Base de datos: odoo19
-- Modo: SOLO LECTURA (sin ALTER/DROP/DELETE)
-- ================================================================================

\echo '======================================'
\echo 'VERIFICACIÓN DE INTEGRIDAD'
\echo 'Base de datos: odoo19'
\echo '======================================'
\echo ''

-- 1. ESTADO DEL MÓDULO
\echo '[1/10] Estado del módulo orbix_fleet_test:'
SELECT 
    name,
    shortdesc,
    state,
    latest_version
FROM ir_module_module
WHERE name = 'orbix_fleet_test';
\echo ''

-- 2. CAMPOS TRACCAR EN FLEET.VEHICLE
\echo '[2/10] Campos Traccar en fleet.vehicle:'
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'fleet_vehicle'
AND column_name LIKE 'x_traccar%'
ORDER BY column_name;
\echo ''

-- 3. TODOS LOS CAMPOS CUSTOM EN FLEET.VEHICLE
\echo '[3/10] Campos personalizados x_* en fleet.vehicle:'
SELECT 
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'fleet_vehicle'
AND column_name LIKE 'x_%'
ORDER BY column_name;
\echo ''

-- 4. VISTAS TRACCAR
\echo '[4/10] Vistas relacionadas con Traccar:'
SELECT 
    name,
    model,
    type,
    active
FROM ir_ui_view
WHERE name LIKE '%traccar%'
ORDER BY name;
\echo ''

-- 5. MENÚS RSEXPRESS
\echo '[5/10] Menús de RSExpress:'
SELECT 
    id,
    name,
    parent_id,
    sequence
FROM ir_ui_menu
WHERE name LIKE '%RSExpress%' OR name LIKE '%Tracking%'
ORDER BY parent_id, sequence;
\echo ''

-- 6. ACCIONES
\echo '[6/10] Acciones de RSExpress:'
SELECT 
    name,
    res_model,
    view_mode
FROM ir_actions_act_window
WHERE name LIKE '%RSExpress%' OR name LIKE '%Tracking%'
ORDER BY res_model;
\echo ''

-- 7. CRON JOB TRACCAR
\echo '[7/10] Cron job de sincronización Traccar:'
SELECT 
    name,
    active,
    interval_number,
    interval_type,
    numbercall,
    nextcall
FROM ir_cron
WHERE name LIKE '%traccar%';
\echo ''

-- 8. PARÁMETROS TRACCAR
\echo '[8/10] Parámetros de configuración Traccar:'
SELECT 
    key,
    value
FROM ir_config_parameter
WHERE key LIKE 'traccar.%'
ORDER BY key;
\echo ''

-- 9. INTEGRIDAD DE DATOS
\echo '[9/10] Conteo de registros:'
SELECT 
    'fleet.vehicle' as modelo,
    COUNT(*) as total_registros
FROM fleet_vehicle
UNION ALL
SELECT 
    'rsexpress.delivery.order' as modelo,
    COUNT(*) as total_registros
FROM rsexpress_delivery_order;
\echo ''

-- 10. VEHÍCULOS CON TRACCAR CONFIGURADO
\echo '[10/10] Vehículos con Traccar configurado:'
SELECT 
    COUNT(*) as vehiculos_con_traccar
FROM fleet_vehicle
WHERE x_traccar_device_id IS NOT NULL;
\echo ''

\echo '======================================'
\echo '✓ VERIFICACIÓN COMPLETADA'
\echo '======================================'
