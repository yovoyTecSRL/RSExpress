/**
 * Test de Optimización de Rutas
 * Ejecutar en consola: testRouteOptimization()
 */

function testRouteOptimization() {
    console.log('═══════════════════════════════════════');
    console.log('🚀 TEST OPTIMIZACIÓN DE RUTAS');
    console.log('═══════════════════════════════════════');

    // Depósito central (ejemplo: San José, Costa Rica)
    const depot = {
        lat: 9.9281,
        lon: -84.0907,
        name: 'Depósito Central'
    };

    // Clientes de prueba
    const clients = [
        { id: 1, lat: 9.9300, lon: -84.0850, name: 'Cliente A', weight: 5 },
        { id: 2, lat: 9.9250, lon: -84.0900, name: 'Cliente B', weight: 3 },
        { id: 3, lat: 9.9400, lon: -84.0950, name: 'Cliente C', weight: 4 },
        { id: 4, lat: 9.9150, lon: -84.0800, name: 'Cliente D', weight: 2 },
        { id: 5, lat: 9.9200, lon: -84.1000, name: 'Cliente E', weight: 6 },
        { id: 6, lat: 9.9350, lon: -84.0750, name: 'Cliente F', weight: 3 },
        { id: 7, lat: 9.9100, lon: -84.0950, name: 'Cliente G', weight: 4 },
        { id: 8, lat: 9.9450, lon: -84.0850, name: 'Cliente H', weight: 2 }
    ];

    // Vehículos disponibles
    const vehicles = [
        { id: 1, name: 'Vehículo 1', capacity: 15 },
        { id: 2, name: 'Vehículo 2', capacity: 15 },
        { id: 3, name: 'Vehículo 3', capacity: 20 }
    ];

    try {
        console.log('\n1️⃣  PRUEBA: Nearest Neighbor');
        console.log(`   Depósito: ${depot.name} (${depot.lat}, ${depot.lon})`);
        console.log(`   Clientes: ${clients.length}`);
        
        const nnRoute = window.routeOptimizer.nearestNeighbor(clients, depot);
        const nnDistance = window.routeOptimizer.calculateRouteDistance(nnRoute);
        
        console.log(`   ✅ Ruta creada: ${nnRoute.length} puntos`);
        console.log(`   📏 Distancia: ${nnDistance.toFixed(2)} km`);
        console.log(`   📍 Ruta:`);
        nnRoute.forEach((point, i) => {
            console.log(`      ${i}. ${point.name || 'Depósito'}`);
        });

        console.log('\n2️⃣  PRUEBA: 2-Opt Optimization');
        const optimizedRoute = window.routeOptimizer.twoOpt(nnRoute);
        const optimizedDistance = window.routeOptimizer.calculateRouteDistance(optimizedRoute);
        
        console.log(`   ✅ Ruta optimizada`);
        console.log(`   📏 Distancia: ${optimizedDistance.toFixed(2)} km`);
        console.log(`   💾 Ahorro: ${(nnDistance - optimizedDistance).toFixed(2)} km (${((nnDistance - optimizedDistance) / nnDistance * 100).toFixed(1)}%)`);

        console.log('\n3️⃣  PRUEBA: Sweep Algorithm');
        const sweepRoute = window.routeOptimizer.sweepAlgorithm(clients, depot);
        const sweepDistance = window.routeOptimizer.calculateRouteDistance(sweepRoute);
        
        console.log(`   ✅ Ruta por barrido angular`);
        console.log(`   📏 Distancia: ${sweepDistance.toFixed(2)} km`);

        console.log('\n4️⃣  PRUEBA: Múltiples Rutas');
        const multipleRoutes = window.routeOptimizer.optimizeMultipleRoutes(clients, vehicles, depot);
        
        console.log(`   ✅ Rutas generadas para ${vehicles.length} vehículos`);
        console.log(`   Detalle:`);
        multipleRoutes.forEach(route => {
            console.log(`      - Vehículo ${route.vehicleId}: ${route.deliveriesCount} entregas, ${route.distance.toFixed(2)} km, ${route.estimatedTime} min`);
        });

        console.log('\n5️⃣  REPORTE DE OPTIMIZACIÓN');
        const report = window.routeOptimizer.generateOptimizationReport(multipleRoutes);
        
        console.log(`   📊 Resumen:`);
        console.log(`      Rutas totales: ${report.totalRoutes}`);
        console.log(`      Entregas totales: ${report.totalDeliveries}`);
        console.log(`      Distancia total: ${report.totalDistanceKm} km`);
        console.log(`      Tiempo total: ${report.totalTimeMinutes} minutos`);
        console.log(`      Promedio entregas/ruta: ${report.averageDeliveriesPerRoute}`);

        console.log('\n✅ TODOS LOS TESTS COMPLETADOS');
        return report;

    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        console.error('Stack:', error.stack);
        return null;
    }
}

console.log('✅ Test functions para Route Optimizer cargadas');
console.log('   Ejecuta: testRouteOptimization()');
