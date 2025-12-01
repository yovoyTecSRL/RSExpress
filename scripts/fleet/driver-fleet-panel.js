/**
 * Panel de Control de Conductores y Entregas
 * Muestra mapa en tiempo real con conductores y sus rutas pendientes
 */

class DriverFleetPanel {
    constructor() {
        this.drivers = new Map();
        this.deliveries = new Map();
        this.map = null;
        this.driverMarkers = new Map();
        this.deliveryMarkers = new Map();
        this.routes = new Map();
    }

    /**
     * Inicializar panel con mapa
     */
    initWithMap(mapElement, leafletMap) {
        if (!leafletMap) {
            console.error('[DriverFleetPanel] No se proporcionó mapa Leaflet');
            return false;
        }

        this.map = leafletMap;
        console.log('[DriverFleetPanel] Inicializado con mapa Leaflet');
        return true;
    }

    /**
     * Agregar conductor al panel
     */
    addDriver(driver) {
        this.drivers.set(driver.id, {
            ...driver,
            status: driver.status || 'disponible',
            lat: driver.lat || 9.9281,
            lon: driver.lon || -84.0907,
            currentDeliveries: driver.currentDeliveries || [],
            completedDeliveries: driver.completedDeliveries || 0,
            totalDistance: driver.totalDistance || 0,
            efficiency: driver.efficiency || 0
        });

        console.log(`[DriverFleetPanel] Conductor agregado: ${driver.name} (ID: ${driver.id})`);
    }

    /**
     * Agregar entrega al panel
     */
    addDelivery(delivery) {
        this.deliveries.set(delivery.id, {
            ...delivery,
            status: delivery.status || 'pendiente',
            assignedDriver: delivery.assignedDriver || null,
            lat: delivery.lat,
            lon: delivery.lon,
            priority: delivery.priority || 'normal',
            attempts: delivery.attempts || 0
        });
    }

    /**
     * Asignar entregas a conductor
     */
    assignDeliveriesToDriver(driverId, deliveryIds) {
        const driver = this.drivers.get(driverId);
        if (!driver) {
            console.error('[DriverFleetPanel] Conductor no encontrado:', driverId);
            return false;
        }

        deliveryIds.forEach(deliveryId => {
            const delivery = this.deliveries.get(deliveryId);
            if (delivery) {
                delivery.assignedDriver = driverId;
                driver.currentDeliveries.push(deliveryId);
            }
        });

        console.log(`[DriverFleetPanel] ${deliveryIds.length} entregas asignadas a ${driver.name}`);
        return true;
    }

    /**
     * Dibujar conductores en el mapa
     */
    drawDrivers() {
        if (!this.map) {
            console.error('[DriverFleetPanel] Mapa no inicializado');
            return false;
        }

        const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12'];
        let colorIndex = 0;

        this.drivers.forEach((driver, driverId) => {
            const color = colors[colorIndex % colors.length];
            colorIndex++;

            // Crear icono del conductor
            const icon = L.divIcon({
                className: 'driver-marker',
                html: `
                    <div style="
                        background: ${color};
                        color: white;
                        border-radius: 50%;
                        width: 50px;
                        height: 50px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-weight: bold;
                        border: 3px solid white;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.4);
                        font-size: 24px;
                        position: relative;
                    ">
                        🚗
                        <div style="
                            position: absolute;
                            top: -5px;
                            right: -5px;
                            background: ${driver.status === 'disponible' ? '#2ecc71' : '#e74c3c'};
                            border: 2px solid white;
                            border-radius: 50%;
                            width: 16px;
                            height: 16px;
                        "></div>
                    </div>
                `,
                iconSize: [50, 50],
                iconAnchor: [25, 25],
                popupAnchor: [0, -25]
            });

            // Crear marcador
            const marker = L.marker([driver.lat, driver.lon], { icon })
                .bindPopup(`
                    <div style="width: 200px; font-size: 12px;">
                        <strong>${driver.name}</strong><br>
                        Estado: ${driver.status}<br>
                        Entregas pendientes: ${driver.currentDeliveries.length}<br>
                        Completadas: ${driver.completedDeliveries}<br>
                        Distancia total: ${driver.totalDistance.toFixed(2)} km<br>
                        Eficiencia: ${driver.efficiency}%
                    </div>
                `)
                .addTo(this.map);

            this.driverMarkers.set(driverId, { marker, color });

            console.log(`[DriverFleetPanel] Conductor ${driver.name} dibujado en (${driver.lat}, ${driver.lon})`);
        });

        return true;
    }

    /**
     * Dibujar entregas pendientes en el mapa
     */
    drawDeliveries() {
        if (!this.map) {
            console.error('[DriverFleetPanel] Mapa no inicializado');
            return false;
        }

        let pendingCount = 0;

        this.deliveries.forEach((delivery, deliveryId) => {
            if (delivery.status === 'pendiente' || delivery.status === 'en_ruta') {
                pendingCount++;

                // Determinar color según prioridad
                let priorityColor = '#3498db'; // normal
                let priorityIcon = '📍';

                if (delivery.priority === 'urgente') {
                    priorityColor = '#e74c3c';
                    priorityIcon = '🔴';
                } else if (delivery.priority === 'alta') {
                    priorityColor = '#f39c12';
                    priorityIcon = '🟠';
                }

                // Crear icono de entrega
                const icon = L.divIcon({
                    className: 'delivery-marker',
                    html: `
                        <div style="
                            background: ${priorityColor};
                            color: white;
                            border-radius: 50%;
                            width: 40px;
                            height: 40px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-weight: bold;
                            border: 2px solid white;
                            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                            font-size: 20px;
                        ">
                            ${priorityIcon}
                        </div>
                    `,
                    iconSize: [40, 40],
                    iconAnchor: [20, 20],
                    popupAnchor: [0, -20]
                });

                // Crear marcador
                const marker = L.marker([delivery.lat, delivery.lon], { icon })
                    .bindPopup(`
                        <div style="width: 200px; font-size: 12px;">
                            <strong>Entrega #${delivery.id}</strong><br>
                            Dirección: ${delivery.address || 'N/A'}<br>
                            Estado: ${delivery.status}<br>
                            Prioridad: ${delivery.priority}<br>
                            Cliente: ${delivery.client || 'N/A'}<br>
                            Intentos: ${delivery.attempts}
                        </div>
                    `)
                    .addTo(this.map);

                this.deliveryMarkers.set(deliveryId, marker);
            }
        });

        console.log(`[DriverFleetPanel] ${pendingCount} entregas dibujadas`);
        return true;
    }

    /**
     * Dibujar rutas asignadas a conductores
     */
    drawDriverRoutes() {
        if (!this.map) {
            console.error('[DriverFleetPanel] Mapa no inicializado');
            return false;
        }

        this.drivers.forEach((driver, driverId) => {
            if (driver.currentDeliveries.length === 0) return;

            // Obtener color del conductor
            const driverMarker = this.driverMarkers.get(driverId);
            const color = driverMarker ? driverMarker.color : '#3498db';

            // Construir puntos de ruta
            const routePoints = [
                [driver.lat, driver.lon] // Posición del conductor
            ];

            // Agregar entregas pendientes
            driver.currentDeliveries.forEach(deliveryId => {
                const delivery = this.deliveries.get(deliveryId);
                if (delivery) {
                    routePoints.push([delivery.lat, delivery.lon]);
                }
            });

            // Dibujar línea de ruta
            if (routePoints.length > 1) {
                const polyline = L.polyline(routePoints, {
                    color: color,
                    weight: 2,
                    opacity: 0.6,
                    dashArray: '5, 10',
                    className: 'driver-route'
                }).addTo(this.map);

                this.routes.set(driverId, polyline);

                console.log(`[DriverFleetPanel] Ruta del conductor ${driver.name} dibujada`);
            }
        });

        return true;
    }

    /**
     * Actualizar posición de conductor en tiempo real
     */
    updateDriverPosition(driverId, lat, lon) {
        const driver = this.drivers.get(driverId);
        if (!driver) return false;

        driver.lat = lat;
        driver.lon = lon;

        // Actualizar marcador
        const driverMarkerData = this.driverMarkers.get(driverId);
        if (driverMarkerData && driverMarkerData.marker) {
            driverMarkerData.marker.setLatLng([lat, lon]);

            // Actualizar ruta
            const route = this.routes.get(driverId);
            if (route) {
                const points = route.getLatLngs();
                points[0] = [lat, lon];
                route.setLatLngs(points);
            }
        }

        return true;
    }

    /**
     * Marcar entrega como completada
     */
    completeDelivery(deliveryId, driverId) {
        const delivery = this.deliveries.get(deliveryId);
        const driver = this.drivers.get(driverId);

        if (!delivery || !driver) return false;

        delivery.status = 'completada';
        driver.currentDeliveries = driver.currentDeliveries.filter(id => id !== deliveryId);
        driver.completedDeliveries++;

        // Remover marcador de entrega
        const marker = this.deliveryMarkers.get(deliveryId);
        if (marker) {
            this.map.removeLayer(marker);
            this.deliveryMarkers.delete(deliveryId);
        }

        console.log(`[DriverFleetPanel] Entrega #${deliveryId} completada por ${driver.name}`);
        return true;
    }

    /**
     * Generar reporte del estado de flota
     */
    generateFleetReport() {
        const totalDrivers = this.drivers.size;
        const activeDrivers = Array.from(this.drivers.values()).filter(d => d.status === 'activo').length;
        const totalDeliveries = this.deliveries.size;
        const completedDeliveries = Array.from(this.deliveries.values()).filter(d => d.status === 'completada').length;
        const pendingDeliveries = totalDeliveries - completedDeliveries;

        let totalDistance = 0;
        let totalDeliveriesCompleted = 0;
        let totalEfficiency = 0;

        this.drivers.forEach(driver => {
            totalDistance += driver.totalDistance;
            totalDeliveriesCompleted += driver.completedDeliveries;
            totalEfficiency += driver.efficiency || 0;
        });

        const averageEfficiency = totalDrivers > 0 ? (totalEfficiency / totalDrivers).toFixed(1) : 0;

        return {
            summary: {
                totalDrivers,
                activeDrivers,
                totalDeliveries,
                pendingDeliveries,
                completedDeliveries,
                completionRate: totalDeliveries > 0 ? ((completedDeliveries / totalDeliveries) * 100).toFixed(1) : 0,
                totalDistance: totalDistance.toFixed(2),
                averageDeliveriesPerDriver: totalDrivers > 0 ? (totalDeliveriesCompleted / totalDrivers).toFixed(1) : 0,
                averageEfficiency: averageEfficiency
            },
            drivers: Array.from(this.drivers.values()).map(d => ({
                id: d.id,
                name: d.name,
                status: d.status,
                pending: d.currentDeliveries.length,
                completed: d.completedDeliveries,
                efficiency: d.efficiency
            })),
            deliveries: Array.from(this.deliveries.values()).map(d => ({
                id: d.id,
                address: d.address,
                status: d.status,
                priority: d.priority,
                assignedDriver: d.assignedDriver
            }))
        };
    }

    /**
     * Limpiar panel
     */
    clear() {
        this.driverMarkers.forEach((data, key) => {
            if (data.marker) this.map.removeLayer(data.marker);
        });
        this.deliveryMarkers.forEach((marker, key) => {
            if (marker) this.map.removeLayer(marker);
        });
        this.routes.forEach((polyline, key) => {
            if (polyline) this.map.removeLayer(polyline);
        });

        this.driverMarkers.clear();
        this.deliveryMarkers.clear();
        this.routes.clear();

        console.log('[DriverFleetPanel] Panel limpiado');
    }

    /**
     * Renderizar panel completo
     */
    render() {
        this.clear();
        this.drawDrivers();
        this.drawDeliveries();
        this.drawDriverRoutes();
        console.log('[DriverFleetPanel] Panel renderizado');
        return true;
    }

    /**
     * Obtener entregas de un conductor específico
     */
    getDeliveriesByDriver(driverId) {
        const driverDeliveries = [];
        for (const [id, delivery] of this.deliveries) {
            if (delivery.driverId === driverId) {
                driverDeliveries.push(delivery);
            }
        }
        return driverDeliveries;
    }

    /**
     * Obtener snapshot completo de la flota con entregas por conductor
     */
    getSnapshot() {
        const drivers = Array.from(this.drivers.values()).map(driver => ({
            ...driver,
            queue: this.getDeliveriesByDriver(driver.id)
        }));
        
        const deliveries = Array.from(this.deliveries.values());
        
        return { drivers, deliveries };
    }

    /**
     * Obtener información de cola para un conductor
     */
    getDriverQueueInfo(driverId) {
        const driver = this.drivers.get(driverId);
        if (!driver) return null;

        const queue = this.getDeliveriesByDriver(driverId);
        const pendingDeliveries = queue.filter(d => d.status !== 'completada').length;
        const completedDeliveries = queue.filter(d => d.status === 'completada').length;

        return {
            driver: driver,
            queue: queue,
            pendingDeliveries: pendingDeliveries,
            completedDeliveries: completedDeliveries,
            totalDeliveries: queue.length,
            averagePriority: this.calculateAveragePriority(queue)
        };
    }

    /**
     * Calcular prioridad promedio de entregas
     */
    calculateAveragePriority(deliveries) {
        if (deliveries.length === 0) return 'N/A';
        
        const priorityValues = {
            'urgente': 3,
            'alta': 2,
            'normal': 1
        };
        
        const totalPriority = deliveries.reduce((sum, d) => {
            return sum + (priorityValues[d.priority] || 0);
        }, 0);
        
        const average = totalPriority / deliveries.length;
        
        if (average >= 2.5) return 'Urgente';
        if (average >= 1.5) return 'Alta';
        return 'Normal';
    }
}

// Inicializar globalmente
window.driverFleetPanel = new DriverFleetPanel();

console.log('✅ Módulo DriverFleetPanel cargado');
console.log('   Disponible en: window.driverFleetPanel');
