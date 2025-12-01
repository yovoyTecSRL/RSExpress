/**
 * Integración del Panel de Flota con app.js
 * Inicializa y conecta todos los componentes
 */

function initializeFleetIntegration() {
    console.log('🚗 Inicializando integración de flota...');

    try {
        // Esperar a que el DOM y los módulos estén listos
        // (fleetDashboard puede ser null inicialmente, eso está OK)
        if (!window.app || !window.driverFleetPanel || typeof window.fleetDashboard === 'undefined') {
            console.log('⏳ Esperando módulos...');
            setTimeout(initializeFleetIntegration, 500);
            return;
        }

        console.log('✅ Todos los módulos están disponibles');
        console.log('   - window.app:', !!window.app);
        console.log('   - window.driverFleetPanel:', !!window.driverFleetPanel);
        console.log('   - window.fleetDashboard:', window.fleetDashboard === null ? '(null - esperando)' : '✓');

        // NO crear datos aquí - esperar a que el dashboard esté inicializado

        // INICIAR SINCRONIZACIÓN EN VIVO
        initLiveFleetSync();
        initFleetWatcher();
        enableFleetViewReflection();
        console.log('✅ Sincronización en vivo activada');

        // Hook para inicializar el dashboard cuando se abre la pestaña de flota
        const fleetTab = document.querySelector('[data-tab="fleet"]');
        if (fleetTab) {
            fleetTab.addEventListener('click', () => {
                console.log('📊 Abriendo panel de flota...');
                setTimeout(() => {
                    if (!window.fleetDashboard?.initialized) {
                        window.initFleetDashboard('fleetDashboardContainer', 'fleetMap');
                        // Crear datos después de inicializar dashboard
                        setTimeout(() => {
                            createTestFleetData();
                        }, 500);
                    } else {
                        window.fleetDashboard.refresh();
                    }
                }, 100);
            });
        }

        // Auto-inicializar si ya hay un contenedor visible
        const container = document.getElementById('fleetDashboardContainer');
        if (container && container.offsetParent !== null) {
            console.log('📊 Contenedor de flota visible - inicializando...');
            window.initFleetDashboard('fleetDashboardContainer', 'fleetMap');
            // Crear datos después de inicializar
            setTimeout(() => {
                createTestFleetData();
            }, 1000);
        } else {
            console.log('⏳ Contenedor no visible - creando datos cuando sea necesario');
            // Si no está visible, crear datos más tarde cuando se clickee
            setTimeout(() => {
                if (window.driverFleetPanel && window.driverFleetPanel.drivers.size === 0) {
                    console.log('📊 Creando datos por primera vez...');
                    createTestFleetData();
                }
            }, 2000);
        }

        console.log('✅ Integración de flota completada');

    } catch (error) {
        console.error('❌ Error en integración de flota:', error);
    }
}

function createTestFleetData() {
    console.log('%c📋 INICIANDO DATOS DE PRUEBA', 'color: #00BCD4; font-weight: bold');
    
    if (!window.driverFleetPanel) {
        console.error('❌ driverFleetPanel NO existe');
        return false;
    }

    try {
        // Limpiar
        window.driverFleetPanel.clear();
        console.log('✓ Panel limpio');

        // Coordenadas base de San Isidro de El General
        const hqLat = 9.3808796;
        const hqLon = -83.7045467;

        // AGREGAR 4 CONDUCTORES en el área de San Isidro
        console.log('Agregando conductores en San Isidro de El General...');
        
        window.driverFleetPanel.addDriver({
            id: 1,
            name: 'Carlos Ramírez',
            status: 'activo',
            lat: hqLat + 0.02,
            lon: hqLon - 0.02,
            completedDeliveries: 12,
            totalDistance: 87.5,
            efficiency: 94,
            phone: '+506 8888-1111',
            vehicle: 'Toyota Hiace Blanca'
        });
        console.log('  ✓ Driver 1 - Pérez Zeledón Nord');

        window.driverFleetPanel.addDriver({
            id: 2,
            name: 'María González',
            status: 'activo',
            lat: hqLat - 0.015,
            lon: hqLon + 0.025,
            completedDeliveries: 18,
            totalDistance: 125.3,
            efficiency: 97,
            phone: '+506 8888-2222',
            vehicle: 'Nissan NV200 Roja'
        });
        console.log('  ✓ Driver 2 - Pérez Zeledón Este');

        window.driverFleetPanel.addDriver({
            id: 3,
            name: 'Juan Pérez',
            status: 'disponible',
            lat: hqLat + 0.01,
            lon: hqLon + 0.015,
            completedDeliveries: 7,
            totalDistance: 45.2,
            efficiency: 89,
            phone: '+506 8888-3333',
            vehicle: 'Volkswagen Caddy Azul'
        });
        console.log('  ✓ Driver 3 - San Isidro Centro-Este');

        window.driverFleetPanel.addDriver({
            id: 4,
            name: 'Ana Martínez',
            status: 'activo',
            lat: hqLat - 0.025,
            lon: hqLon - 0.015,
            completedDeliveries: 14,
            totalDistance: 95.8,
            efficiency: 92,
            phone: '+506 8888-4444',
            vehicle: 'Toyota ProAce Gris'
        });
        console.log('  ✓ Driver 4 - San Isidro Sud');
        console.log(`✅ Total drivers agregados: ${window.driverFleetPanel.drivers.size}`);

        // AGREGAR 8 ENTREGAS en San Isidro
        console.log('Agregando entregas en San Isidro de El General...');

        window.driverFleetPanel.addDelivery({
            id: 1001,
            address: 'Av. Principal 100, San Isidro',
            client: 'Comercial ABC',
            lat: hqLat + 0.018,
            lon: hqLon - 0.018,
            status: 'pendiente',
            priority: 'urgente',
            driverId: 1,
            attempts: 0
        });
        console.log('  ✓ Delivery 1001 - Asignada a Carlos Ramírez');

        window.driverFleetPanel.addDelivery({
            id: 1002,
            address: 'Calle Real 250, San Isidro',
            client: 'Restaurante El Sazón',
            lat: hqLat - 0.01,
            lon: hqLon + 0.02,
            status: 'pendiente',
            priority: 'alta',
            driverId: 2,
            attempts: 1
        });
        console.log('  ✓ Delivery 1002 - Asignada a María González');

        window.driverFleetPanel.addDelivery({
            id: 1003,
            address: 'Barrio González, San Isidro',
            client: 'Boutique Fashion',
            lat: hqLat + 0.008,
            lon: hqLon + 0.012,
            status: 'pendiente',
            priority: 'normal',
            driverId: 2,
            attempts: 0
        });
        console.log('  ✓ Delivery 1003 - Asignada a María González');

        window.driverFleetPanel.addDelivery({
            id: 1004,
            address: 'Barrio Florencio, San Isidro',
            client: 'Oficina Legal',
            lat: hqLat - 0.022,
            lon: hqLon - 0.012,
            status: 'pendiente',
            priority: 'normal',
            driverId: 3,
            attempts: 0
        });
        console.log('  ✓ Delivery 1004 - Asignada a Juan Pérez');

        window.driverFleetPanel.addDelivery({
            id: 1005,
            address: 'Barrio Nueva, San Isidro',
            client: 'Librería Universal',
            lat: hqLat + 0.015,
            lon: hqLon + 0.018,
            status: 'pendiente',
            priority: 'alta',
            driverId: 4,
            attempts: 0
        });
        console.log('  ✓ Delivery 1005 - Asignada a Ana Martínez');

        window.driverFleetPanel.addDelivery({
            id: 1006,
            address: 'Centro, San Isidro',
            client: 'Depósito de Materiales',
            lat: hqLat - 0.005,
            lon: hqLon - 0.005,
            status: 'pendiente',
            priority: 'normal',
            driverId: 3,
            attempts: 0
        });
        console.log('  ✓ Delivery 1006 - Asignada a Juan Pérez');

        window.driverFleetPanel.addDelivery({
            id: 1007,
            address: 'La Unión, San Isidro',
            client: 'Almacén Industrial',
            lat: hqLat + 0.025,
            lon: hqLon - 0.025,
            status: 'pendiente',
            priority: 'normal',
            driverId: 1,
            attempts: 2
        });
        console.log('  ✓ Delivery 1007 - Asignada a Carlos Ramírez');

        window.driverFleetPanel.addDelivery({
            id: 1008,
            address: 'Buenos Aires, San Isidro',
            client: 'Café Gourmet',
            lat: hqLat - 0.02,
            lon: hqLon + 0.02,
            status: 'pendiente',
            priority: 'alta',
            driverId: 4,
            attempts: 0
        });
        console.log('  ✓ Delivery 1008 - Asignada a Ana Martínez');
        console.log(`✅ Total deliveries agregadas: ${window.driverFleetPanel.deliveries.size}`);

        // RESUMEN DE COLAS DE ENTREGA
        console.log('\n%c📋 COLA DE ENTREGAS POR CONDUCTOR', 'color: #FF9800; font-weight: bold; font-size: 14px');
        console.log('%c🚗 Carlos Ramírez (Driver 1):', 'color: #27ae60; font-weight: bold');
        console.log('   → 1001: Comercial ABC (urgente) - Av. Principal');
        console.log('   → 1007: Almacén Industrial (normal) - La Unión');
        console.log('%c🚗 María González (Driver 2):', 'color: #3498db; font-weight: bold');
        console.log('   → 1002: Restaurante El Sazón (alta) - Calle Real');
        console.log('   → 1003: Boutique Fashion (normal) - Barrio González');
        console.log('%c🚗 Juan Pérez (Driver 3):', 'color: #f39c12; font-weight: bold');
        console.log('   → 1004: Oficina Legal (normal) - Barrio Florencio');
        console.log('   → 1006: Depósito de Materiales (normal) - Centro');
        console.log('%c🚗 Ana Martínez (Driver 4):', 'color: #e74c3c; font-weight: bold');
        console.log('   → 1005: Librería Universal (alta) - Barrio Nueva');
        console.log('   → 1008: Café Gourmet (alta) - Buenos Aires');

        // Resumen final
        console.log('%c✅ DATOS CARGADOS CORRECTAMENTE EN SAN ISIDRO DE EL GENERAL', 'color: #4CAF50; font-weight: bold');
        console.log(`   Drivers: ${window.driverFleetPanel.drivers.size}`);
        console.log(`   Deliveries: ${window.driverFleetPanel.deliveries.size}`);
        console.log(`   Centro: 9.3808796, -83.7045467`);
        
        return true;

    } catch (error) {
        console.error('%c❌ ERROR EN createTestFleetData', 'color: #F44336', error);
        console.error(error.stack);
        return false;
    }
}

// Funciones para interacción desde el admin
window.completeFleetDelivery = function(deliveryId, driverId) {
    if (window.driverFleetPanel) {
        window.driverFleetPanel.completeDelivery(deliveryId, driverId);
        if (window.fleetDashboard) {
            window.fleetDashboard.log(`✅ Entrega #${deliveryId} completada por ${driverId}`, 'success');
            window.fleetDashboard.refresh();
        }
    }
};

window.updateFleetDriverPosition = function(driverId, lat, lon) {
    if (window.driverFleetPanel) {
        window.driverFleetPanel.updateDriverPosition(driverId, lat, lon);
        if (window.fleetDashboard) {
            window.fleetDashboard.log(`📍 Posición actualizada: Conductor ${driverId}`, 'info');
        }
    }
};

window.refreshFleetData = function() {
    if (window.fleetDashboard) {
        window.fleetDashboard.refresh();
    }
};

// Inicializar cuando el documento está listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeFleetIntegration);
} else {
    setTimeout(initializeFleetIntegration, 1000);
}

console.log('✅ Fleet Integration cargado');
