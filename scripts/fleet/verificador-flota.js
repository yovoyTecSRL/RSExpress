/**
 * VERIFICADOR DE SALUD - FLOTA PANEL
 * Ejecutar en consola: F12 → Copiar y pegar todo esto
 */

console.clear();
console.log('%c🔍 VERIFICANDO SISTEMA DE FLOTA...', 'font-size: 16px; color: #FF6B35; font-weight: bold');
console.log('%c' + '═'.repeat(80), 'color: #FF6B35');

// 1. Verificar módulos cargados
console.log('\n📦 MÓDULOS CARGADOS:');
const modules = [
    { name: 'window.app', obj: window.app },
    { name: 'window.driverFleetPanel', obj: window.driverFleetPanel },
    { name: 'window.fleetDashboard', obj: window.fleetDashboard },
    { name: 'window.liveFleetSync', obj: window.liveFleetSync },
    { name: 'window.fleetRealtimeWatcher', obj: window.fleetRealtimeWatcher },
    { name: 'window.fleetViewReflection', obj: window.fleetViewReflection }
];

modules.forEach(m => {
    const status = m.obj ? '✅' : '❌';
    console.log(`  ${status} ${m.name}`);
});

// 2. Verificar sincronización
console.log('\n🔄 SINCRONIZACIÓN:');
console.log(`  ${window.liveFleetSync?.isEnabled ? '✅' : '❌'} LiveFleetSync activo`);
console.log(`  ${window.fleetViewReflection?.isEnabled ? '✅' : '❌'} FleetViewReflection activo`);

// 3. Verificar datos
console.log('\n📊 DATOS:');
if (window.driverFleetPanel) {
    const driverCount = window.driverFleetPanel.drivers?.size || 0;
    const deliveryCount = window.driverFleetPanel.deliveries?.size || 0;
    console.log(`  ${driverCount > 0 ? '✅' : '⚠️'} Conductores: ${driverCount}`);
    console.log(`  ${deliveryCount > 0 ? '✅' : '⚠️'} Entregas: ${deliveryCount}`);
}

// 4. Verificar estructura de datos
console.log('\n🗂️ ESTRUCTURA DE DATOS:');
if (window.driverFleetPanel) {
    const driversIsMap = window.driverFleetPanel.drivers instanceof Map;
    const deliveriesIsMap = window.driverFleetPanel.deliveries instanceof Map;
    console.log(`  ${driversIsMap ? '✅' : '❌'} Drivers es Map`);
    console.log(`  ${deliveriesIsMap ? '✅' : '❌'} Deliveries es Map`);
}

// 5. Verificar métodos críticos
console.log('\n🔧 MÉTODOS DISPONIBLES:');
const methods = [
    { name: 'getFleetSnapshot', fn: getFleetSnapshot },
    { name: 'initLiveFleetSync', fn: initLiveFleetSync },
    { name: 'enableFleetViewReflection', fn: enableFleetViewReflection },
    { name: 'initFleetDashboard', fn: initFleetDashboard }
];

methods.forEach(m => {
    const exists = typeof m.fn === 'function';
    console.log(`  ${exists ? '✅' : '❌'} ${m.name}()`);
});

// 6. Prueba getFleetSnapshot
console.log('\n🧪 PRUEBAS:');
try {
    const snapshot = getFleetSnapshot();
    if (snapshot && snapshot.drivers !== undefined && snapshot.deliveries !== undefined) {
        console.log(`  ✅ getFleetSnapshot() retorna objeto válido`);
        console.log(`     └─ Conductores: ${snapshot.drivers.length}`);
        console.log(`     └─ Entregas: ${snapshot.deliveries.length}`);
    } else {
        console.log(`  ⚠️ getFleetSnapshot() retorna null o estructura incompleta`);
    }
} catch (error) {
    console.log(`  ❌ getFleetSnapshot() genera error: ${error.message}`);
}

// 7. Verificar reportes
console.log('\n📈 REPORTE DE FLOTA:');
if (window.driverFleetPanel) {
    try {
        const report = window.driverFleetPanel.generateFleetReport();
        if (report && report.summary) {
            console.log(`  ✅ Reporte generado correctamente`);
            console.log(`     └─ Conductores totales: ${report.summary.totalDrivers}`);
            console.log(`     └─ Entregas totales: ${report.summary.totalDeliveries}`);
            console.log(`     └─ Tasa de finalización: ${report.summary.completionRate}%`);
            console.log(`     └─ Eficiencia promedio: ${report.summary.averageEfficiency}%`);
        } else {
            console.log(`  ⚠️ Reporte está vacío (sin datos cargados)`);
        }
    } catch (error) {
        console.log(`  ❌ Error generando reporte: ${error.message}`);
    }
}

// 8. Verificar DOM
console.log('\n🖥️ ELEMENTOS DEL DOM:');
const elements = [
    'fleetDashboardContainer',
    'fleetMap',
    'fleet-list',
    'driversTableBody',
    'deliveriesTableBody',
    'fleetLogs'
];

elements.forEach(id => {
    const exists = document.getElementById(id);
    console.log(`  ${exists ? '✅' : '❌'} #${id}`);
});

// 9. Resumen
console.log('\n%c' + '═'.repeat(80), 'color: #FF6B35');
console.log('%c✅ VERIFICACIÓN COMPLETADA', 'font-size: 14px; color: #4CAF50; font-weight: bold');

// Verificación final
const allOk = modules.every(m => m.obj) && 
              window.liveFleetSync?.isEnabled &&
              window.fleetViewReflection?.isEnabled;

if (allOk) {
    console.log('%c🎉 ¡SISTEMA LISTO PARA USAR!', 'font-size: 14px; color: #4CAF50; font-weight: bold');
} else {
    console.log('%c⚠️ ALGUNOS COMPONENTES NO ESTÁN DISPONIBLES', 'font-size: 14px; color: #FF9800; font-weight: bold');
    console.log('%c  → Recarga la página (F5) y abre nuevamente la consola', 'color: #FF9800');
}

console.log('%c\n💡 PRÓXIMOS PASOS:', 'font-size: 12px; color: #2196F3; font-weight: bold');
console.log('%c  1. Abre el panel de flota desde el menú Admin → Flota', 'color: #2196F3');
console.log('%c  2. Verifica que no haya errores rojos en la consola', 'color: #2196F3');
console.log('%c  3. Ejecuta: getFleetSnapshot() para ver datos', 'color: #2196F3');
console.log('%c  4. El mapa debe sincronizarse cada 1 segundo', 'color: #2196F3');
console.log('\n', '');
