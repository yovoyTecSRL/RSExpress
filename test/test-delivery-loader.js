/**
 * Test Suite - Delivery Loader & API
 * Verifica carga de entregas desde órdenes
 */

async function runDeliveryTests() {
    console.log('\n' + '='.repeat(60));
    console.log('🧪 TESTING DELIVERY LOADER & API');
    console.log('='.repeat(60) + '\n');

    const tests = [];
    let passed = 0;
    let failed = 0;

    // Test 1: Inicializar loader
    try {
        const loader = new DeliveryLoader(null);
        console.log('✅ Test 1: DeliveryLoader inicializado');
        passed++;
        tests.push({ name: 'DeliveryLoader init', status: 'PASS' });
    } catch (e) {
        console.log('❌ Test 1 FAILED:', e.message);
        failed++;
        tests.push({ name: 'DeliveryLoader init', status: 'FAIL', error: e.message });
    }

    // Test 2: Cargar órdenes de demostración
    try {
        const loader = new DeliveryLoader(null);
        const orders = loader.generateDemoOrders();
        console.log(`✅ Test 2: ${orders.length} órdenes de demostración generadas`);
        passed++;
        tests.push({ name: 'Generate demo orders', status: 'PASS', count: orders.length });
    } catch (e) {
        console.log('❌ Test 2 FAILED:', e.message);
        failed++;
        tests.push({ name: 'Generate demo orders', status: 'FAIL', error: e.message });
    }

    // Test 3: Convertir órdenes a entregas
    try {
        const loader = new DeliveryLoader(null);
        await loader.fetchOrders();
        await loader.convertOrdersToDeliveries();
        console.log(`✅ Test 3: ${loader.deliveries.length} entregas convertidas`);
        console.log(`   - Pendientes: ${loader.getDeliveriesByState('pending').length}`);
        console.log(`   - En tránsito: ${loader.getDeliveriesByState('in-transit').length}`);
        console.log(`   - Completadas: ${loader.getDeliveriesByState('completed').length}`);
        passed++;
        tests.push({ name: 'Convert orders to deliveries', status: 'PASS', count: loader.deliveries.length });
    } catch (e) {
        console.log('❌ Test 3 FAILED:', e.message);
        failed++;
        tests.push({ name: 'Convert orders to deliveries', status: 'FAIL', error: e.message });
    }

    // Test 4: Cargar todas las entregas
    try {
        const loader = new DeliveryLoader(null);
        const result = await loader.loadDeliveries();
        console.log(`✅ Test 4: Entregas cargadas - Total: ${result.count}`);
        console.log(`   - Órdenes: ${result.orders.length}`);
        console.log(`   - Entregas: ${result.deliveries.length}`);
        passed++;
        tests.push({ name: 'Load all deliveries', status: 'PASS', count: result.count });
    } catch (e) {
        console.log('❌ Test 4 FAILED:', e.message);
        failed++;
        tests.push({ name: 'Load all deliveries', status: 'FAIL', error: e.message });
    }

    // Test 5: Filtrar por estado
    try {
        const loader = new DeliveryLoader(null);
        await loader.loadDeliveries();
        const pending = loader.getDeliveriesByState('pending');
        const transit = loader.getDeliveriesByState('in-transit');
        const completed = loader.getDeliveriesByState('completed');
        console.log(`✅ Test 5: Filtrado por estado`);
        console.log(`   - Pendientes: ${pending.length}`);
        console.log(`   - En tránsito: ${transit.length}`);
        console.log(`   - Completadas: ${completed.length}`);
        passed++;
        tests.push({ name: 'Filter by state', status: 'PASS' });
    } catch (e) {
        console.log('❌ Test 5 FAILED:', e.message);
        failed++;
        tests.push({ name: 'Filter by state', status: 'FAIL', error: e.message });
    }

    // Test 6: Filtrar por prioridad
    try {
        const loader = new DeliveryLoader(null);
        await loader.loadDeliveries();
        const high = loader.getDeliveriesByPriority('high');
        const normal = loader.getDeliveriesByPriority('normal');
        const low = loader.getDeliveriesByPriority('low');
        console.log(`✅ Test 6: Filtrado por prioridad`);
        console.log(`   - Alta: ${high.length}`);
        console.log(`   - Normal: ${normal.length}`);
        console.log(`   - Baja: ${low.length}`);
        passed++;
        tests.push({ name: 'Filter by priority', status: 'PASS' });
    } catch (e) {
        console.log('❌ Test 6 FAILED:', e.message);
        failed++;
        tests.push({ name: 'Filter by priority', status: 'FAIL', error: e.message });
    }

    // Test 7: Buscar entregas
    try {
        const loader = new DeliveryLoader(null);
        await loader.loadDeliveries();
        const results = loader.searchDeliveries('Restaurante');
        console.log(`✅ Test 7: Búsqueda de entregas - Encontradas: ${results.length}`);
        if (results.length > 0) {
            console.log(`   - Primer resultado: ${results[0].cliente}`);
        }
        passed++;
        tests.push({ name: 'Search deliveries', status: 'PASS', found: results.length });
    } catch (e) {
        console.log('❌ Test 7 FAILED:', e.message);
        failed++;
        tests.push({ name: 'Search deliveries', status: 'FAIL', error: e.message });
    }

    // Test 8: Actualizar estado de entrega
    try {
        const loader = new DeliveryLoader(null);
        await loader.loadDeliveries();
        const firstDelivery = loader.deliveries[0];
        const oldState = firstDelivery.estado;
        loader.updateDeliveryStatus(firstDelivery.id, 'in-transit');
        const newState = firstDelivery.estado;
        console.log(`✅ Test 8: Estado actualizado - ${oldState} → ${newState}`);
        console.log(`   - ID: ${firstDelivery.id}`);
        console.log(`   - Timeline items: ${firstDelivery.timeline.length}`);
        passed++;
        tests.push({ name: 'Update delivery status', status: 'PASS' });
    } catch (e) {
        console.log('❌ Test 8 FAILED:', e.message);
        failed++;
        tests.push({ name: 'Update delivery status', status: 'FAIL', error: e.message });
    }

    // Test 9: Asignar conductor
    try {
        const loader = new DeliveryLoader(null);
        await loader.loadDeliveries();
        const firstDelivery = loader.deliveries[0];
        loader.assignDriver(firstDelivery.id, 'D001', 'Carlos García');
        console.log(`✅ Test 9: Conductor asignado`);
        console.log(`   - Entrega: ${firstDelivery.id}`);
        console.log(`   - Conductor: ${firstDelivery.conductor.nombre}`);
        console.log(`   - Timeline items: ${firstDelivery.timeline.length}`);
        passed++;
        tests.push({ name: 'Assign driver', status: 'PASS' });
    } catch (e) {
        console.log('❌ Test 9 FAILED:', e.message);
        failed++;
        tests.push({ name: 'Assign driver', status: 'FAIL', error: e.message });
    }

    // Test 10: Obtener estadísticas
    try {
        const loader = new DeliveryLoader(null);
        await loader.loadDeliveries();
        const stats = loader.getStatistics();
        console.log(`✅ Test 10: Estadísticas generadas`);
        console.log(`   - Total: ${stats.total}`);
        console.log(`   - Pendientes: ${stats.pending}`);
        console.log(`   - En tránsito: ${stats.inTransit}`);
        console.log(`   - Completadas: ${stats.completed}`);
        console.log(`   - Fallidas: ${stats.failed}`);
        console.log(`   - Monto total: $${stats.montoTotal.toFixed(2)}`);
        console.log(`   - Items total: ${stats.itemsTotal}`);
        passed++;
        tests.push({ name: 'Get statistics', status: 'PASS' });
    } catch (e) {
        console.log('❌ Test 10 FAILED:', e.message);
        failed++;
        tests.push({ name: 'Get statistics', status: 'FAIL', error: e.message });
    }

    // Test 11: Exportar a JSON
    try {
        const loader = new DeliveryLoader(null);
        await loader.loadDeliveries();
        const json = loader.toJSON();
        console.log(`✅ Test 11: Exportación a JSON`);
        console.log(`   - Entregas: ${json.deliveries.length}`);
        console.log(`   - Órdenes: ${json.orders.length}`);
        console.log(`   - Timestamp: ${json.timestamp}`);
        passed++;
        tests.push({ name: 'Export to JSON', status: 'PASS' });
    } catch (e) {
        console.log('❌ Test 11 FAILED:', e.message);
        failed++;
        tests.push({ name: 'Export to JSON', status: 'FAIL', error: e.message });
    }

    // Test 12: API REST - Inicializar
    try {
        const api = new DeliveryOrdersAPI();
        await api.initialize();
        console.log(`✅ Test 12: API REST inicializado`);
        passed++;
        tests.push({ name: 'API initialization', status: 'PASS' });
    } catch (e) {
        console.log('❌ Test 12 FAILED:', e.message);
        failed++;
        tests.push({ name: 'API initialization', status: 'FAIL', error: e.message });
    }

    // Test 13: API - Cargar entregas
    try {
        const api = new DeliveryOrdersAPI();
        const result = await api.loadDeliveries();
        console.log(`✅ Test 13: API - Cargar entregas`);
        console.log(`   - Entregas: ${result.count}`);
        passed++;
        tests.push({ name: 'API load deliveries', status: 'PASS', count: result.count });
    } catch (e) {
        console.log('❌ Test 13 FAILED:', e.message);
        failed++;
        tests.push({ name: 'API load deliveries', status: 'FAIL', error: e.message });
    }

    // Test 14: API - Obtener entregas con filtros
    try {
        const api = new DeliveryOrdersAPI();
        await api.initialize();
        await api.loadDeliveries();
        const filtered = await api.getDeliveries({ state: 'pending' });
        console.log(`✅ Test 14: API - Filtrar entregas`);
        console.log(`   - Entregas pendientes: ${filtered.count}`);
        passed++;
        tests.push({ name: 'API filter deliveries', status: 'PASS', count: filtered.count });
    } catch (e) {
        console.log('❌ Test 14 FAILED:', e.message);
        failed++;
        tests.push({ name: 'API filter deliveries', status: 'FAIL', error: e.message });
    }

    // Test 15: API - Búsqueda
    try {
        const api = new DeliveryOrdersAPI();
        await api.initialize();
        await api.loadDeliveries();
        const results = await api.searchDeliveries('Restaurante');
        console.log(`✅ Test 15: API - Búsqueda`);
        console.log(`   - Resultados: ${results.count}`);
        passed++;
        tests.push({ name: 'API search', status: 'PASS', count: results.count });
    } catch (e) {
        console.log('❌ Test 15 FAILED:', e.message);
        failed++;
        tests.push({ name: 'API search', status: 'FAIL', error: e.message });
    }

    // Resumen
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN DE PRUEBAS');
    console.log('='.repeat(60));
    console.log(`✅ Pasadas: ${passed}`);
    console.log(`❌ Fallidas: ${failed}`);
    console.log(`📈 Tasa de éxito: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
    console.log('='.repeat(60) + '\n');

    return {
        total: tests.length,
        passed,
        failed,
        tests,
        success: failed === 0
    };
}

// Ejecutar pruebas si se llama desde Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runDeliveryTests };
}

// Ejecutar en navegador si se carga como script
if (typeof window !== 'undefined') {
    console.log('🧪 Cargado: Test Suite de Delivery Loader');
    console.log('📝 Ejecuta: runDeliveryTests()');
}
