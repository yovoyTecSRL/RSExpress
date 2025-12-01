/**
 * SINCRONIZACIÓN EN VIVO - Panel de Flota
 * Refleja cambios en tiempo real desde app.js y otras fuentes
 * Ejecutar: initLiveFleetSync()
 */

class LiveFleetSync {
    constructor() {
        this.updateInterval = null;
        this.isEnabled = false;
        this.lastSync = 0;
        this.syncDelay = 1000; // 1 segundo entre sincronizaciones
        this.dataCache = {
            drivers: {},
            deliveries: {},
            trips: []
        };
    }

    start() {
        if (this.isEnabled) return;
        
        console.log('🔄 Iniciando sincronización en vivo de flota...');
        this.isEnabled = true;

        // Sincronizar cada segundo
        this.updateInterval = setInterval(() => {
            this.syncFromAppData();
        }, this.syncDelay);

        // Sincronizar inmediatamente
        this.syncFromAppData();
    }

    stop() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        this.isEnabled = false;
        console.log('🛑 Sincronización de flota detenida');
    }

    syncFromAppData() {
        try {
            // Obtener datos de app.js si existe
            if (!window.app) return;

            // DATOS DE CONDUCTORES
            this.syncDrivers();

            // DATOS DE ENTREGAS (TRIPS)
            this.syncTrips();

            // ACTUALIZAR DASHBOARD SI EXISTE
            if (window.fleetDashboard && window.fleetDashboard.initialized) {
                window.fleetDashboard.refresh();
            }

        } catch (error) {
            console.error('Error en sincronización:', error.message);
        }
    }

    syncDrivers() {
        if (!window.app || !window.app.traccarDevices) return;

        // Obtener dispositivos de Traccar
        const devices = window.app.traccarDevices;
        
        if (!window.driverFleetPanel) return;

        // Para cada dispositivo, crear/actualizar conductor
        devices.forEach((device, deviceId) => {
            const driver = {
                id: deviceId,
                name: device.name || `Conductor ${deviceId}`,
                status: device.status === 'online' ? 'activo' : 'disponible',
                lat: device.lastUpdate?.lat || 9.9281,
                lon: device.lastUpdate?.lon || -84.0907,
                completedDeliveries: parseInt(device.attributes?.completedDeliveries || 0),
                totalDistance: parseFloat(device.attributes?.totalDistance || 0),
                efficiency: parseInt(device.attributes?.efficiency || 90),
                phone: device.attributes?.phone || '',
                vehicle: device.attributes?.vehicle || device.name
            };

            // Verificar si conductor ya existe
            const existingDriver = window.driverFleetPanel.drivers.get(driver.id);
            
            if (!existingDriver) {
                // Agregar nuevo conductor
                window.driverFleetPanel.addDriver(driver);
                console.log(`✅ Conductor agregado: ${driver.name}`);
            } else {
                // Actualizar posición
                window.driverFleetPanel.updateDriverPosition(driver.id, driver.lat, driver.lon);
                
                // Actualizar estado
                Object.assign(existingDriver, driver);
            }
        });
    }

    syncTrips() {
        if (!window.app || !window.app.trips) return;
        if (!window.driverFleetPanel) return;

        const trips = window.app.trips || [];

        trips.forEach(trip => {
            // Crear entrega basada en trip
            const delivery = {
                id: trip.id || Math.random(),
                address: trip.deliveryAddress || trip.address || 'Ubicación desconocida',
                client: trip.clientName || 'Cliente',
                lat: trip.deliveryCoords?.[0] || trip.deliveryLat || 9.93,
                lon: trip.deliveryCoords?.[1] || trip.deliveryLon || -84.09,
                status: trip.status || 'pendiente',
                priority: this.determinePriority(trip),
                driverId: trip.driverId || null,
                attempts: trip.attempts || 0
            };

            // Verificar si entrega ya existe
            const existingDelivery = window.driverFleetPanel.deliveries.get(delivery.id);
            
            if (!existingDelivery && delivery.status === 'pendiente') {
                // Agregar nueva entrega
                window.driverFleetPanel.addDelivery(delivery);
                console.log(`✅ Entrega agregada: ${delivery.address}`);
            } else if (existingDelivery) {
                // Actualizar estado de entrega
                Object.assign(existingDelivery, delivery);
                
                // Si se completó, marcar como completada
                if (trip.status === 'completed' || trip.status === 'delivered') {
                    window.driverFleetPanel.completeDelivery(delivery.id, delivery.driverId);
                    console.log(`✅ Entrega completada: ${delivery.address}`);
                }
            }
        });
    }

    determinePriority(trip) {
        if (trip.priority === 'urgente' || trip.priority === 'emergency') return 'urgente';
        if (trip.priority === 'alta' || trip.priority === 'high') return 'alta';
        return 'normal';
    }
}

// Instancia global
window.liveFleetSync = null;

function initLiveFleetSync() {
    if (!window.liveFleetSync) {
        window.liveFleetSync = new LiveFleetSync();
    }
    window.liveFleetSync.start();
    return window.liveFleetSync;
}

function stopLiveFleetSync() {
    if (window.liveFleetSync) {
        window.liveFleetSync.stop();
    }
}

console.log('✅ Live Fleet Sync cargado');
console.log('   Usa: initLiveFleetSync() para iniciar');
console.log('   Usa: stopLiveFleetSync() para detener');
