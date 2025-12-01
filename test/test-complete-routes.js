/**
 * Test Integrado: Optimización + Visualización de Rutas
 * Ejecutar en consola: testCompleteRouteOptimization()
 */

function testCompleteRouteOptimization() {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🗺️  TEST COMPLETO: OPTIMIZACIÓN + VISUALIZACIÓN DE RUTAS');
    console.log('═══════════════════════════════════════════════════════════');

    try {
        // Depósito central
        const depot = {
            lat: 9.9281,
            lon: -84.0907,
            name: 'Depósito Central RS Express'
        };

        // Clientes de prueba (San José, Costa Rica)
        const clients = [
            { id: 1, lat: 9.9300, lon: -84.0850, name: 'Cliente A', address: 'Av. Central', weight: 5 },
            { id: 2, lat: 9.9250, lon: -84.0900, name: 'Cliente B', address: 'Calle 5', weight: 3 },
            { id: 3, lat: 9.9400, lon: -84.0950, name: 'Cliente C', address: 'Paseo Colón', weight: 4 },
            { id: 4, lat: 9.9150, lon: -84.0800, name: 'Cliente D', address: 'Barrio Amon', weight: 2 },
            { id: 5, lat: 9.9200, lon: -84.1000, name: 'Cliente E', address: 'La Sabana', weight: 6 },
            { id: 6, lat: 9.9350, lon: -84.0750, name: 'Cliente F', address: 'Rohrmoser', weight: 3 },
            { id: 7, lat: 9.9100, lon: -84.0950, name: 'Cliente G', address: 'Pavas', weight: 4 },
            { id: 8, lat: 9.9450, lon: -84.0850, name: 'Cliente H', address: 'San Pedro', weight: 2 }
        ];

        // Vehículos
        const vehicles = [
            { id: 1, name: 'Vehículo 1', capacity: 15 },
            { id: 2, name: 'Vehículo 2', capacity: 15 },
            { id: 3, name: 'Vehículo 3', capacity: 20 }
        ];

        console.log('\n1️⃣  INICIALIZAR VISUALIZADOR');
        if (!window.app || !window.app.map) {
            console.warn('   ⚠️  No hay mapa disponible en window.app.map');
            console.log('   Continuando sin visualización...');
        } else {
            const initialized = window.routeMapVisualizer.initWithMap(window.app.map);
            console.log(`   ${initialized ? '✅' : '❌'} Visualizador ${initialized ? 'inicializado' : 'no inicializado'}`);
        }

        console.log('\n2️⃣  OPTIMIZAR RUTAS');
        console.log(`   📦 Clientes: ${clients.length}`);
        console.log(`   🚗 Vehículos: ${vehicles.length}`);
        
        const optimizedRoutes = window.routeOptimizer.optimizeMultipleRoutes(clients, vehicles, depot);
        console.log(`   ✅ ${optimizedRoutes.length} rutas optimizadas`);

        console.log('\n3️⃣  DIBUJAR RUTAS EN MAPA');
        if (window.app && window.app.map && window.routeMapVisualizer.map) {
            const drawn = window.routeMapVisualizer.drawMultipleRoutes(optimizedRoutes);
            console.log(`   ${drawn ? '✅' : '❌'} Rutas dibujadas en mapa`);
        } else {
            console.log('   ⚠️  Saltando visualización (sin mapa disponible)');
        }

        console.log('\n4️⃣  GENERAR REPORTE');
        const report = window.routeOptimizer.generateOptimizationReport(optimizedRoutes);
        
        console.log('   📊 Estadísticas:');
        console.log(`      • Rutas totales: ${report.totalRoutes}`);
        console.log(`      • Entregas: ${report.totalDeliveries}`);
        console.log(`      • Distancia total: ${report.totalDistanceKm} km`);
        console.log(`      • Tiempo total: ${report.totalTimeMinutes} minutos`);
        console.log(`      • Promedio entregas/ruta: ${report.averageDeliveriesPerRoute}`);

        console.log('\n5️⃣  DETALLES DE RUTAS:');
        optimizedRoutes.forEach((route, idx) => {
            const percent = ((route.distance / report.totalDistanceKm) * 100).toFixed(1);
            console.log(`
   Vehículo ${route.vehicleId}:
      - Entregas: ${route.deliveriesCount}
      - Distancia: ${route.distance.toFixed(2)} km (${percent}%)
      - Tiempo: ${route.estimatedTime} minutos
      - Ruta:`);
            route.route.forEach((point, i) => {
                const marker = i === 0 || i === route.route.length - 1 ? '📦' : '📍';
                console.log(`         ${marker} ${point.name || 'Depósito'}`);
            });
        });

        console.log('\n6️⃣  COMANDOS DISPONIBLES:');
        console.log('   • window.routeMapVisualizer.clearAllRoutes() - Limpiar mapa');
        console.log('   • window.routeMapVisualizer.animateRoute(1) - Animar vehículo 1');
        console.log('   • window.routeMapVisualizer.fitBounds() - Ajustar vista');

        console.log('\n✅ TEST COMPLETADO EXITOSAMENTE');
        return {
            depot,
            clients,
            vehicles,
            optimizedRoutes,
            report
        };

    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        console.error('Stack:', error.stack);
        return null;
    }
}

console.log('✅ Test integrado cargado');
console.log('   Ejecuta: testCompleteRouteOptimization()');
