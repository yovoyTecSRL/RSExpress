/**
 * REFLEJO DE VISTA - Panel de Flota
 * Sincroniza el mapa principal con el panel de flota en tiempo real
 * Ejecutar: enableFleetViewReflection()
 */

class FleetViewReflection {
    constructor() {
        this.isEnabled = false;
        this.reflectionInterval = null;
        this.lastDriverStates = new Map();
        this.lastDeliveryStates = new Map();
    }

    enable() {
        if (this.isEnabled) return;
        
        console.log('🔄 Habilitando reflejo de vista de flota...');
        this.isEnabled = true;

        // Verificar cambios cada 500ms
        this.reflectionInterval = setInterval(() => {
            this.reflectChanges();
        }, 500);

        this.reflectChanges();
    }

    disable() {
        if (this.reflectionInterval) {
            clearInterval(this.reflectionInterval);
            this.reflectionInterval = null;
        }
        this.isEnabled = false;
        console.log('🛑 Reflejo de vista deshabilitado');
    }

    reflectChanges() {
        try {
            // Si no hay app o no hay datos de flota, no hacer nada
            if (!window.app || !window.driverFleetPanel || !window.fleetDashboard) {
                return;
            }

            // REFLEJAR CAMBIOS DE CONDUCTORES
            this.reflectDriverChanges();

            // REFLEJAR CAMBIOS DE ENTREGAS
            this.reflectDeliveryChanges();

            // ACTUALIZAR DASHBOARD VISUAL
            if (window.fleetDashboard.initialized && window.app.map) {
                // Forzar redibujado del mapa si hay cambios significativos
                const hasSignificantChanges = 
                    this.lastDriverStates.size !== window.driverFleetPanel.drivers.length ||
                    this.lastDeliveryStates.size !== window.driverFleetPanel.deliveries.length;

                if (hasSignificantChanges) {
                    window.driverFleetPanel.render();
                }
            }

        } catch (error) {
            console.error('Error en reflejo de vista:', error.message);
        }
    }

    reflectDriverChanges() {
        const driverMap = window.driverFleetPanel.drivers;
        if (!driverMap) return;

        // Convertir Map a array
        const drivers = Array.from(driverMap.values());

        drivers.forEach(driver => {
            const lastState = this.lastDriverStates.get(driver.id);

            // Verificar si la posición cambió
            if (!lastState || 
                lastState.lat !== driver.lat || 
                lastState.lon !== driver.lon ||
                lastState.status !== driver.status) {

                // Disparar evento de cambio de conductor
                this.emitDriverUpdate({
                    id: driver.id,
                    name: driver.name,
                    lat: driver.lat,
                    lon: driver.lon,
                    status: driver.status,
                    previous: lastState
                });

                // Actualizar estado
                this.lastDriverStates.set(driver.id, {
                    lat: driver.lat,
                    lon: driver.lon,
                    status: driver.status
                });
            }
        });
    }

    reflectDeliveryChanges() {
        const deliveryMap = window.driverFleetPanel.deliveries;
        if (!deliveryMap) return;

        // Convertir Map a array
        const deliveries = Array.from(deliveryMap.values());

        deliveries.forEach(delivery => {
            const lastState = this.lastDeliveryStates.get(delivery.id);

            // Verificar si el estado cambió
            if (!lastState || lastState.status !== delivery.status) {

                // Si se completó la entrega
                if (delivery.status === 'completada' && lastState?.status !== 'completada') {
                    this.emitDeliveryCompleted({
                        id: delivery.id,
                        address: delivery.address,
                        client: delivery.client,
                        driverId: delivery.driverId
                    });

                    // Actualizar en app.js si existe
                    if (window.app && window.app.trips) {
                        const trip = window.app.trips.find(t => t.id === delivery.id);
                        if (trip) {
                            trip.status = 'completed';
                            trip.completedAt = new Date();
                        }
                    }
                }

                // Actualizar estado
                this.lastDeliveryStates.set(delivery.id, {
                    status: delivery.status
                });
            }
        });
    }

    emitDriverUpdate(driverData) {
        // Disparar evento personalizado
        const event = new CustomEvent('fleet-driver-updated', { detail: driverData });
        window.dispatchEvent(event);

        // Log
        console.log(`📍 Conductor actualizado: ${driverData.name} (${driverData.status})`);
    }

    emitDeliveryCompleted(deliveryData) {
        // Disparar evento personalizado
        const event = new CustomEvent('fleet-delivery-completed', { detail: deliveryData });
        window.dispatchEvent(event);

        // Log
        console.log(`✅ Entrega completada: ${deliveryData.address}`);
    }

    // Obtener estado actual de flota formateado
    getFleetSnapshot() {
        if (!window.driverFleetPanel) return null;

        // Convertir Maps a arrays
        const drivers = Array.from(window.driverFleetPanel.drivers.values()).map(d => ({
            id: d.id,
            name: d.name,
            status: d.status,
            lat: d.lat,
            lon: d.lon,
            completedDeliveries: d.completedDeliveries,
            efficiency: d.efficiency
        }));

        const deliveries = Array.from(window.driverFleetPanel.deliveries.values()).map(d => ({
            id: d.id,
            address: d.address,
            client: d.client,
            status: d.status,
            priority: d.priority,
            assignedDriver: d.assignedDriver
        }));

        return {
            timestamp: new Date().toISOString(),
            drivers: drivers,
            deliveries: deliveries
        };
    }

    // Exportar histórico de cambios
    exportChangesHistory() {
        return {
            lastSync: new Date().toISOString(),
            driverStates: Array.from(this.lastDriverStates.entries()),
            deliveryStates: Array.from(this.lastDeliveryStates.entries())
        };
    }
}

// Instancia global
window.fleetViewReflection = new FleetViewReflection();

function enableFleetViewReflection() {
    window.fleetViewReflection.enable();
    
    // Escuchar eventos de cambio
    window.addEventListener('fleet-driver-updated', (e) => {
        console.log('📊 Evento: Conductor actualizado', e.detail);
        // Aquí puedes agregar lógica adicional
    });

    window.addEventListener('fleet-delivery-completed', (e) => {
        console.log('📊 Evento: Entrega completada', e.detail);
        // Aquí puedes agregar lógica adicional
    });

    console.log('✅ Reflejo de vista habilitado');
}

function disableFleetViewReflection() {
    window.fleetViewReflection.disable();
    console.log('✅ Reflejo de vista deshabilitado');
}

function getFleetSnapshot() {
    return window.fleetViewReflection.getFleetSnapshot();
}

console.log('✅ Fleet View Reflection cargado');
console.log('   Usa: enableFleetViewReflection() para habilitar');
console.log('   Usa: disableFleetViewReflection() para deshabilitar');
console.log('   Usa: getFleetSnapshot() para obtener estado actual');
