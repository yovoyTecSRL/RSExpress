/**
 * Test Panel de Flota de Conductores
 * Ejecutar en consola: testDriverFleetPanel()
 */

function testDriverFleetPanel() {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🚗 TEST: PANEL DE FLOTA DE CONDUCTORES');
    console.log('═══════════════════════════════════════════════════════════');

    try {
        console.log('\n1️⃣  INICIALIZAR PANEL');
        if (!window.app || !window.app.map) {
            console.error('   ❌ No hay mapa disponible');
            return;
        }

        const initialized = window.driverFleetPanel.initWithMap(null, window.app.map);
        console.log(`   ${initialized ? '✅' : '❌'} Panel inicializado`);

        console.log('\n2️⃣  AGREGAR CONDUCTORES');
        const drivers = [
            {
                id: 1,
                name: 'Carlos Ramírez',
                status: 'activo',
                lat: 9.9281,
                lon: -84.0907,
                completedDeliveries: 5,
                totalDistance: 32.5,
                efficiency: 92
            },
            {
                id: 2,
                name: 'María González',
                status: 'activo',
                lat: 9.9350,
                lon: -84.0850,
                completedDeliveries: 8,
                totalDistance: 45.2,
                efficiency: 95
            },
            {
                id: 3,
                name: 'Juan Pérez',
                status: 'disponible',
                lat: 9.9200,
                lon: -84.0950,
                completedDeliveries: 3,
                totalDistance: 18.7,
                efficiency: 88
            }
        ];

        drivers.forEach(driver => {
            window.driverFleetPanel.addDriver(driver);
        });
        console.log(`   ✅ ${drivers.length} conductores agregados`);

        console.log('\n3️⃣  AGREGAR ENTREGAS');
        const deliveries = [
            {
                id: 101,
                address: 'Av. Central, San José',
                client: 'Cliente A',
                lat: 9.9300,
                lon: -84.0850,
                status: 'pendiente',
                priority: 'normal'
            },
            {
                id: 102,
                address: 'Calle 5, Barrio Amon',
                client: 'Cliente B',
                lat: 9.9250,
                lon: -84.0900,
                status: 'pendiente',
                priority: 'alta'
            },
            {
                id: 103,
                address: 'Paseo Colón, La Sabana',
                client: 'Cliente C',
                lat: 9.9400,
                lon: -84.0950,
                status: 'pendiente',
                priority: 'urgente'
            },
            {
                id: 104,
                address: 'Rohrmoser',
                client: 'Cliente D',
                lat: 9.9150,
                lon: -84.0800,
                status: 'pendiente',
                priority: 'normal'
            },
            {
                id: 105,
                address: 'San Pedro',
                client: 'Cliente E',
                lat: 9.9450,
                lon: -84.0850,
                status: 'pendiente',
                priority: 'normal'
            }
        ];

        deliveries.forEach(delivery => {
            window.driverFleetPanel.addDelivery(delivery);
        });
        console.log(`   ✅ ${deliveries.length} entregas agregadas`);

        console.log('\n4️⃣  ASIGNAR ENTREGAS A CONDUCTORES');
        window.driverFleetPanel.assignDeliveriesToDriver(1, [101, 102]);
        window.driverFleetPanel.assignDeliveriesToDriver(2, [103, 104]);
        window.driverFleetPanel.assignDeliveriesToDriver(3, [105]);
        console.log('   ✅ Entregas asignadas');

        console.log('\n5️⃣  RENDERIZAR PANEL EN MAPA');
        window.driverFleetPanel.render();
        console.log('   ✅ Panel renderizado en mapa');

        console.log('\n6️⃣  GENERAR REPORTE');
        const report = window.driverFleetPanel.generateFleetReport();
        
        console.log('   📊 Resumen de Flota:');
        console.log(`      • Conductores activos: ${report.summary.activeDrivers}/${report.summary.totalDrivers}`);
        console.log(`      • Entregas pendientes: ${report.summary.pendingDeliveries}`);
        console.log(`      • Entregas completadas: ${report.summary.completedDeliveries}`);
        console.log(`      • Tasa de completación: ${report.summary.completionRate}%`);
        console.log(`      • Distancia total: ${report.summary.totalDistance} km`);
        console.log(`      • Promedio entregas/conductor: ${report.summary.averageDeliveriesPerDriver}`);

        console.log('\n   👥 Estado de Conductores:');
        report.drivers.forEach(driver => {
            console.log(`      ${driver.name}: ${driver.pending} pendientes, ${driver.completed} completadas, ${driver.efficiency}% eficiencia`);
        });

        console.log('\n7️⃣  COMANDOS DISPONIBLES:');
        console.log('   • window.driverFleetPanel.completeDelivery(101, 1) - Marcar entrega como completada');
        console.log('   • window.driverFleetPanel.updateDriverPosition(1, 9.93, -84.08) - Actualizar posición');
        console.log('   • window.driverFleetPanel.clear() - Limpiar mapa');
        console.log('   • window.driverFleetPanel.generateFleetReport() - Ver reporte completo');

        console.log('\n✅ TEST COMPLETADO');
        return report;

    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        console.error('Stack:', error.stack);
        return null;
    }
}

console.log('✅ Test Driver Fleet Panel cargado');
console.log('   Ejecuta: testDriverFleetPanel()');
