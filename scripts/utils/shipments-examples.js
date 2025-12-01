/**
 * Ejemplos de Uso - Envíos, Rutas y Flete
 * Cómo usar los nuevos métodos de gestión de envíos integrados con rutas y flete
 */

// =====================================================
// EJEMPLO 1: Crear un envío completo con ruta
// =====================================================

async function createCompleteShipment() {
    // 1. Crear un envío
    const shipment = app.createShipment({
        pickup: 'Calle Principal 123, Centro',
        delivery: 'Avenida Secundaria 456, Zona Norte',
        weight: 2.5,
        dimensions: { length: 30, width: 20, height: 15 },
        description: 'Paquete con libros',
        price: 150
    });
    
    console.log('✓ Envío creado:', shipment.id);
    
    // 2. Crear una ruta para el conductor
    const route = app.createRoute({
        driverId: 1,
        driverName: 'Juan Pérez',
        startLocation: 'Centro Distribución',
        estimatedTime: 45,
        vehicle: {
            model: 'Toyota Prius',
            plate: 'ABC123',
            color: 'Blanco'
        }
    });
    
    console.log('✓ Ruta creada:', route.id);
    
    // 3. Crear registro de flete
    const freight = app.createFreight({
        shipmentId: shipment.id,
        routeId: route.id,
        weight: shipment.weight,
        volume: 9, // 30*20*15/1000
        type: 'standard',
        value: shipment.price,
        insuranceRequired: false,
        specialHandling: ['manejo_cuidadoso']
    });
    
    console.log('✓ Flete registrado:', freight.id);
    
    // 4. Vincular envío con ruta
    app.assignShipmentToRoute(shipment.id, route.id);
    
    // 5. Vincular flete con envío
    app.linkFreightToShipment(freight.id, shipment.id);
    
    // 6. Obtener detalles completos
    const details = app.getShipmentDetails(shipment.id);
    
    console.log('═══ INFORMACIÓN COMPLETA DEL ENVÍO ═══');
    console.log(JSON.stringify(details.fullInfo, null, 2));
    
    return { shipment, route, freight };
}

// Ejecutar:
// createCompleteShipment()

// =====================================================
// EJEMPLO 2: Gestionar múltiples envíos en una ruta
// =====================================================

async function manageMultipleShipments() {
    // 1. Crear ruta
    const route = app.createRoute({
        driverId: 2,
        driverName: 'María García',
        startLocation: 'Almacén Central',
        estimatedTime: 120,
        vehicle: {
            model: 'Mercedes Sprinter',
            plate: 'XYZ789',
            color: 'Negro'
        }
    });
    
    console.log('Ruta creada:', route.id);
    
    // 2. Crear múltiples envíos
    const shipments = [];
    const locations = [
        { pickup: 'Oficina A', delivery: 'Casa Cliente 1', desc: 'Documentos' },
        { pickup: 'Oficina B', delivery: 'Casa Cliente 2', desc: 'Paquete' },
        { pickup: 'Almacén', delivery: 'Comercio', desc: 'Mercadería' }
    ];
    
    for (let i = 0; i < locations.length; i++) {
        const shipment = app.createShipment({
            pickup: locations[i].pickup,
            delivery: locations[i].delivery,
            weight: (i + 1) * 0.5,
            description: locations[i].desc,
            price: (i + 1) * 50
        });
        
        shipments.push(shipment);
        
        // Asignar a ruta
        app.assignShipmentToRoute(shipment.id, route.id);
        
        // Crear flete
        const freight = app.createFreight({
            shipmentId: shipment.id,
            routeId: route.id,
            weight: shipment.weight,
            volume: shipment.weight * 0.5,
            type: 'standard',
            value: shipment.price
        });
        
        app.linkFreightToShipment(freight.id, shipment.id);
    }
    
    console.log(`✓ ${shipments.length} envíos agregados a ruta ${route.id}`);
    
    // 3. Mostrar ruta con detalles
    console.log('═══ RUTA COMPLETA ═══');
    console.log(`Conductor: ${route.driverName}`);
    console.log(`Vehículo: ${route.vehicle.model} (${route.vehicle.plate})`);
    console.log(`Envíos: ${route.shipments.length}`);
    console.log(`Paradas: ${route.stops.length}`);
    
    route.stops.forEach((stop, index) => {
        console.log(`  ${index + 1}. ${stop.location}`);
    });
    
    return { route, shipments };
}

// Ejecutar:
// manageMultipleShipments()

// =====================================================
// EJEMPLO 3: Obtener estadísticas de envíos
// =====================================================

function showShipmentsStatistics() {
    const stats = app.getShipmentsStats();
    
    console.log('═══ ESTADÍSTICAS DE ENVÍOS Y RUTAS ═══');
    console.log(`
    Envíos Totales:          ${stats.totalShipments}
    Envíos Pendientes:       ${stats.pendingShipments}
    Envíos Asignados:        ${stats.assignedShipments}
    Envíos Entregados:       ${stats.deliveredShipments}
    
    Valor Total:             $${stats.totalValue}
    
    Rutas Activas:           ${stats.activeRoutes}
    Distancia Total:         ${stats.totalDistance} km
    Registros de Flete:      ${stats.freightRecords}
    `);
    
    return stats;
}

// Ejecutar:
// showShipmentsStatistics()

// =====================================================
// EJEMPLO 4: Actualizar estado de envíos
// =====================================================

function updateShipmentProgress(shipmentId) {
    // Estados: pending → assigned → in_transit → delivered
    
    const shipment = app.shipments.get(shipmentId);
    if (!shipment) {
        console.log('Envío no encontrado');
        return;
    }
    
    const statuses = ['pending', 'assigned', 'in_transit', 'delivered'];
    const currentIndex = statuses.indexOf(shipment.status);
    const nextIndex = (currentIndex + 1) % statuses.length;
    const nextStatus = statuses[nextIndex];
    
    app.updateShipmentStatus(shipmentId, nextStatus);
    
    console.log(`✓ Envío ${shipmentId} actualizado a: ${nextStatus}`);
    
    // Mostrar detalles actualizados
    const details = app.getShipmentDetails(shipmentId);
    console.log(`Estado: ${details.shipment.status}`);
}

// Ejecutar:
// updateShipmentProgress('SHP1234567890')

// =====================================================
// EJEMPLO 5: Obtener envíos pendientes
// =====================================================

function listPendingShipments() {
    const pending = app.getPendingShipments();
    
    if (pending.length === 0) {
        console.log('No hay envíos pendientes');
        return;
    }
    
    console.log(`═══ ${pending.length} ENVÍOS PENDIENTES ═══`);
    
    pending.forEach((shipment, index) => {
        console.log(`
    ${index + 1}. ${shipment.id}
       Desde: ${shipment.pickup}
       Hasta: ${shipment.delivery}
       Precio: $${shipment.price}
       Peso: ${shipment.weight} kg
        `);
    });
    
    return pending;
}

// Ejecutar:
// listPendingShipments()

// =====================================================
// EJEMPLO 6: Obtener rutas activas
// =====================================================

function listActiveRoutes() {
    const activeRoutes = app.getActiveRoutes();
    
    if (activeRoutes.length === 0) {
        console.log('No hay rutas activas');
        return;
    }
    
    console.log(`═══ ${activeRoutes.length} RUTAS ACTIVAS ═══`);
    
    activeRoutes.forEach((route, index) => {
        console.log(`
    ${index + 1}. ${route.id}
       Conductor: ${route.driverName}
       Vehículo: ${route.vehicle.model} (${route.vehicle.plate})
       Envíos: ${route.shipments.length}
       Paradas: ${route.stops.length}
       Tiempo estimado: ${route.estimatedTime} min
        `);
    });
    
    return activeRoutes;
}

// Ejecutar:
// listActiveRoutes()

// =====================================================
// EJEMPLO 7: Estado de conexión
// =====================================================

function checkConnectionStatus() {
    const status = app.connectionStatus;
    
    console.log(`Estado de conexión: ${status}`);
    
    const statusIcon = {
        'connected': '🟢',
        'connecting': '🟡',
        'disconnected': '🔴'
    };
    
    console.log(`${statusIcon[status]} ${status.toUpperCase()}`);
    
    // Ver estado de Traccar
    if (app.traccar) {
        const traccarStatus = app.getTraccarStatus();
        console.log(`
        Traccar Conectado: ${traccarStatus.isConnected}
        Dispositivos: ${traccarStatus.devicesCount}
        Posiciones: ${traccarStatus.positionsCount}
        `);
    }
}

// Ejecutar:
// checkConnectionStatus()

// =====================================================
// EJEMPLO 8: Vincular envío con conductor via Traccar
// =====================================================

async function linkShipmentWithTraccar(shipmentId, traccarDeviceId) {
    const shipment = app.shipments.get(shipmentId);
    
    if (!shipment) {
        console.log('Envío no encontrada');
        return;
    }
    
    if (!app.traccar) {
        console.log('Traccar no está disponible');
        return;
    }
    
    // Obtener posición actual del dispositivo
    const position = await app.traccar.getDevicePosition(traccarDeviceId);
    
    if (position) {
        shipment.currentDriverPosition = {
            lat: position.latitude,
            lng: position.longitude,
            speed: position.speed,
            timestamp: position.fixTime
        };
        
        console.log(`✓ Envío ${shipmentId} vinculado con dispositivo Traccar`);
        console.log(`  Posición actual: ${position.latitude}, ${position.longitude}`);
        console.log(`  Velocidad: ${position.speed} km/h`);
    }
}

// Ejecutar:
// await linkShipmentWithTraccar('SHP1234567890', 123)

// =====================================================
// EJEMPLO 9: Obtener información detallada de envío
// =====================================================

function getDetailedShipmentInfo(shipmentId) {
    const details = app.getShipmentDetails(shipmentId);
    
    if (!details) {
        console.log('Envío no encontrada');
        return;
    }
    
    console.log('═══ INFORMACIÓN DETALLADA DEL ENVÍO ═══');
    console.log(JSON.stringify(details, null, 2));
    
    // Mostrar también información de rastreo si está disponible
    if (details.route && details.shipment.currentDriverPosition) {
        console.log('\n═══ RASTREO EN VIVO ═══');
        console.log(`Conductor: ${details.route.driverName}`);
        console.log(`Posición: ${details.shipment.currentDriverPosition.lat}, ${details.shipment.currentDriverPosition.lng}`);
        console.log(`Velocidad: ${details.shipment.currentDriverPosition.speed} km/h`);
    }
}

// Ejecutar:
// getDetailedShipmentInfo('SHP1234567890')

// =====================================================
// EJEMPLO 10: Dashboard en consola
// =====================================================

function showDashboard() {
    console.clear();
    console.log('╔════════════════════════════════════════════╗');
    console.log('║   RS EXPRESS - DASHBOARD                 ║');
    console.log('╚════════════════════════════════════════════╝\n');
    
    // Estado de conexión
    console.log(`📡 Estado: ${app.connectionStatus.toUpperCase()}`);
    
    // Estadísticas
    const stats = app.getShipmentsStats();
    console.log(`
📦 ENVÍOS
  Total: ${stats.totalShipments}
  Pendientes: ${stats.pendingShipments}
  Asignados: ${stats.assignedShipments}
  Entregados: ${stats.deliveredShipments}
  Valor: $${stats.totalValue}

🛣️ RUTAS
  Activas: ${stats.activeRoutes}
  Distancia: ${stats.totalDistance} km
  Registros de Flete: ${stats.freightRecords}
    `);
    
    // Rutas activas
    const activeRoutes = app.getActiveRoutes();
    if (activeRoutes.length > 0) {
        console.log('🚗 RUTAS ACTIVAS:');
        activeRoutes.forEach((route, i) => {
            console.log(`  ${i + 1}. ${route.driverName} - ${route.shipments.length} envíos`);
        });
    }
    
    // Envíos pendientes
    const pending = app.getPendingShipments();
    if (pending.length > 0) {
        console.log(`\n⏳ ${pending.length} ENVÍOS PENDIENTES`);
    }
}

// Ejecutar:
// showDashboard()

// =====================================================
// Exportar funciones para uso global
// =====================================================

window.ShipmentsExamples = {
    createCompleteShipment,
    manageMultipleShipments,
    showShipmentsStatistics,
    updateShipmentProgress,
    listPendingShipments,
    listActiveRoutes,
    checkConnectionStatus,
    linkShipmentWithTraccar,
    getDetailedShipmentInfo,
    showDashboard
};
