/**
 * 🚗 Driver Positioning System - RSExpress
 * 
 * Sistema de posicionamiento de conductores:
 * - Ubica drivers dentro de 20km del HQ
 * - Genera rutas en tiempo real
 * - Visualiza rutas en el mapa
 */

class DriverPositioningSystem {
    constructor(map) {
        this.map = map;
        this.hq = {
            lat: 19.4326,  // Mexico City (CDMX)
            lon: -99.1332,
            name: 'Oficina Central'
        };
        
        this.maxDistanceKm = 20;
        this.drivers = new Map();
        this.routes = new Map();
        this.routePolylines = new Map();
        this.driverMarkers = new Map();
        this.hqMarker = null;
        
        this.init();
    }

    init() {
        console.log('[DriverPositioning] Inicializando sistema...');
        this.createHQMarker();
        this.generateDriversInZone();
        this.updateAllRoutes();
        this.startRealTimeTracking();
    }

    /**
     * Crea marcador del HQ en el mapa
     */
    createHQMarker() {
        if (this.hqMarker) {
            this.map.removeLayer(this.hqMarker);
        }

        const hqIcon = L.divIcon({
            html: `
                <div style="
                    background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
                    color: white;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                    font-weight: bold;
                    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
                    border: 3px solid white;
                ">
                    HQ
                </div>
            `,
            iconSize: [40, 40],
            className: 'hq-marker'
        });

        this.hqMarker = L.marker([this.hq.lat, this.hq.lon], { icon: hqIcon })
            .addTo(this.map)
            .bindPopup(`<strong>${this.hq.name}</strong><br>Oficina Central`);

        // Dibujar círculo de cobertura de 20km
        this.drawCoverageArea();

        console.log('[DriverPositioning] HQ marcado en:', this.hq.lat, this.hq.lon);
    }

    /**
     * Dibuja círculo de cobertura de 20km alrededor del HQ
     */
    drawCoverageArea() {
        const circle = L.circle([this.hq.lat, this.hq.lon], {
            radius: this.maxDistanceKm * 1000, // Convertir km a metros
            color: '#3498db',
            weight: 2,
            opacity: 0.3,
            fillColor: '#3498db',
            fillOpacity: 0.1,
            dashArray: '5, 5'
        }).addTo(this.map);

        circle.bindPopup(`<strong>Zona de Cobertura</strong><br>${this.maxDistanceKm}km del HQ`);
        console.log('[DriverPositioning] Área de cobertura dibujada: ' + this.maxDistanceKm + 'km');
    }

    /**
     * Calcula distancia entre dos puntos en km (Fórmula Haversine)
     */
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Radio de la Tierra en km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    /**
     * Genera posición aleatoria dentro de la zona de 20km
     */
    generateRandomPositionInZone() {
        // Usar algoritmo para generar punto dentro de círculo
        const angle = Math.random() * 2 * Math.PI;
        const radius = Math.random() * this.maxDistanceKm;
        
        // Convertir radianes a km en grados (aprox 0.009 grados = 1km)
        const dLat = (radius * Math.cos(angle)) / 111;
        const dLon = (radius * Math.sin(angle)) / (111 * Math.cos(this.hq.lat * Math.PI / 180));
        
        return {
            lat: this.hq.lat + dLat,
            lon: this.hq.lon + dLon
        };
    }

    /**
     * Genera conductores dentro de la zona
     */
    generateDriversInZone() {
        const driverData = [
            { id: 'DRV001', name: 'Carlos Rodríguez', vehicle: 'Ford Transit', status: 'disponible', color: '#e74c3c' },
            { id: 'DRV002', name: 'Juan García', vehicle: 'Mercedes Sprinter', status: 'disponible', color: '#3498db' },
            { id: 'DRV003', name: 'Miguel López', vehicle: 'Iveco Daily', status: 'en ruta', color: '#2ecc71' },
            { id: 'DRV004', name: 'José Martínez', vehicle: 'Man TGE', status: 'disponible', color: '#f39c12' },
            { id: 'DRV005', name: 'Luis Sánchez', vehicle: 'Renault Master', status: 'en ruta', color: '#9b59b6' }
        ];

        driverData.forEach(data => {
            const position = this.generateRandomPositionInZone();
            const distance = this.calculateDistance(this.hq.lat, this.hq.lon, position.lat, position.lon);

            const driver = {
                id: data.id,
                name: data.name,
                vehicle: data.vehicle,
                status: data.status,
                color: data.color,
                position: position,
                distanceFromHQ: distance.toFixed(2),
                route: [],
                currentDelivery: null,
                totalDeliveries: Math.floor(Math.random() * 8) + 1
            };

            this.drivers.set(data.id, driver);
            this.placeDriverMarker(driver);

            console.log(`[DriverPositioning] ${data.name} ubicado a ${distance.toFixed(2)}km del HQ`);
        });

        console.log(`[DriverPositioning] ${this.drivers.size} conductores generados en zona`);
    }

    /**
     * Coloca marcador del conductor en el mapa
     */
    placeDriverMarker(driver) {
        // Icono del conductor
        const driverIcon = L.divIcon({
            html: `
                <div style="
                    background: ${driver.color};
                    color: white;
                    border-radius: 50%;
                    width: 35px;
                    height: 35px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 16px;
                    font-weight: bold;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                    border: 2px solid white;
                    position: relative;
                ">
                    👨‍✈️
                </div>
                <div style="
                    position: absolute;
                    top: -8px;
                    right: -8px;
                    background: ${driver.status === 'en ruta' ? '#27ae60' : '#95a5a6'};
                    border-radius: 50%;
                    width: 12px;
                    height: 12px;
                    border: 2px solid white;
                "></div>
            `,
            iconSize: [35, 35],
            className: `driver-marker driver-${driver.id}`
        });

        const marker = L.marker([driver.position.lat, driver.position.lon], { icon: driverIcon })
            .addTo(this.map)
            .bindPopup(this.createDriverPopup(driver));

        this.driverMarkers.set(driver.id, marker);
    }

    /**
     * Crea popup con información del conductor
     */
    createDriverPopup(driver) {
        return `
            <div style="font-family: Arial; min-width: 200px;">
                <strong style="font-size: 14px; color: ${driver.color}">👨‍✈️ ${driver.name}</strong><br>
                <hr style="margin: 5px 0;">
                <table style="width: 100%; font-size: 12px;">
                    <tr><td><strong>ID:</strong></td><td>${driver.id}</td></tr>
                    <tr><td><strong>Vehículo:</strong></td><td>${driver.vehicle}</td></tr>
                    <tr><td><strong>Estado:</strong></td><td>
                        <span style="
                            background: ${driver.status === 'en ruta' ? '#27ae60' : '#95a5a6'};
                            color: white;
                            padding: 2px 6px;
                            border-radius: 3px;
                        ">${driver.status}</span>
                    </td></tr>
                    <tr><td><strong>Distancia HQ:</strong></td><td>${driver.distanceFromHQ}km</td></tr>
                    <tr><td><strong>Entregas:</strong></td><td>${driver.totalDeliveries}</td></tr>
                </table>
                <button onclick="driverPositioningSystem.showDriverRoute('${driver.id}')" 
                    style="
                        width: 100%;
                        padding: 6px;
                        margin-top: 8px;
                        background: ${driver.color};
                        color: white;
                        border: none;
                        border-radius: 3px;
                        cursor: pointer;
                        font-size: 12px;
                    ">
                    Ver Ruta
                </button>
            </div>
        `;
    }

    /**
     * Genera ruta para un conductor
     */
    generateRoute(driverId) {
        const driver = this.drivers.get(driverId);
        if (!driver) return [];

        const route = [];
        
        // Punto de inicio: posición actual del driver
        route.push({
            lat: driver.position.lat,
            lon: driver.position.lon,
            type: 'inicio',
            name: driver.name
        });

        // Generar puntos de entrega (entre 2 y 4 entregas)
        const numDeliveries = Math.floor(Math.random() * 3) + 2;
        for (let i = 0; i < numDeliveries; i++) {
            const deliveryPoint = this.generateRandomPositionInZone();
            const distanceToHQ = this.calculateDistance(this.hq.lat, this.hq.lon, deliveryPoint.lat, deliveryPoint.lon);
            
            // Asegurar que el punto está dentro de la zona
            if (distanceToHQ <= this.maxDistanceKm) {
                route.push({
                    lat: deliveryPoint.lat,
                    lon: deliveryPoint.lon,
                    type: 'entrega',
                    name: `Entrega ${i + 1}`,
                    distance: distanceToHQ.toFixed(2)
                });
            }
        }

        // Punto final: retornar al HQ
        route.push({
            lat: this.hq.lat,
            lon: this.hq.lon,
            type: 'fin',
            name: 'Retorno a HQ'
        });

        this.routes.set(driverId, route);
        console.log(`[DriverPositioning] Ruta generada para ${driver.name}: ${route.length} puntos`);
        return route;
    }

    /**
     * Dibuja ruta en el mapa
     */
    drawRouteOnMap(driverId, route) {
        // Eliminar ruta anterior si existe
        if (this.routePolylines.has(driverId)) {
            this.map.removeLayer(this.routePolylines.get(driverId));
        }

        const driver = this.drivers.get(driverId);
        const coordinates = route.map(point => [point.lat, point.lon]);

        // Dibujar polilínea
        const polyline = L.polyline(coordinates, {
            color: driver.color,
            weight: 3,
            opacity: 0.7,
            dashArray: '5, 5',
            lineCap: 'round',
            lineJoin: 'round'
        }).addTo(this.map);

        // Dibujar marcadores en cada punto
        route.forEach((point, index) => {
            let icon;
            if (point.type === 'inicio') {
                icon = 'S'; // Start
            } else if (point.type === 'fin') {
                icon = 'E'; // End
            } else {
                icon = (index).toString();
            }

            const markerIcon = L.divIcon({
                html: `
                    <div style="
                        background: ${driver.color};
                        color: white;
                        border-radius: 50%;
                        width: 28px;
                        height: 28px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 12px;
                        font-weight: bold;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                        border: 2px solid white;
                    ">
                        ${icon}
                    </div>
                `,
                iconSize: [28, 28],
                className: `route-point route-${driverId}-${index}`
            });

            const routeMarker = L.marker([point.lat, point.lon], { icon: markerIcon })
                .addTo(this.map)
                .bindPopup(`
                    <strong>${point.name}</strong><br>
                    Tipo: ${point.type}<br>
                    ${point.distance ? `Distancia HQ: ${point.distance}km` : ''}
                `);
        });

        this.routePolylines.set(driverId, polyline);
        console.log(`[DriverPositioning] Ruta dibujada en el mapa: ${driver.name}`);
    }

    /**
     * Actualiza todas las rutas
     */
    updateAllRoutes() {
        this.drivers.forEach((driver, driverId) => {
            const route = this.generateRoute(driverId);
            this.drawRouteOnMap(driverId, route);
        });
        console.log('[DriverPositioning] Todas las rutas actualizadas');
    }

    /**
     * Muestra la ruta de un conductor específico
     */
    showDriverRoute(driverId) {
        const route = this.routes.get(driverId);
        const driver = this.drivers.get(driverId);
        
        if (!route) {
            console.error(`No route found for driver: ${driverId}`);
            return;
        }

        // Enfocar mapa en la ruta
        const coordinates = route.map(p => [p.lat, p.lon]);
        const bounds = L.latLngBounds(coordinates);
        this.map.fitBounds(bounds, { padding: [50, 50] });

        console.log(`[DriverPositioning] Mostrando ruta de ${driver.name}`);
    }

    /**
     * Actualiza posición de un conductor (simulación)
     */
    updateDriverPosition(driverId, newLat, newLon) {
        const driver = this.drivers.get(driverId);
        if (!driver) return;

        const distance = this.calculateDistance(this.hq.lat, this.hq.lon, newLat, newLon);
        
        // Validar que esté dentro de la zona
        if (distance > this.maxDistanceKm) {
            console.warn(`Driver ${driverId} fuera de zona permitida`);
            return false;
        }

        driver.position = { lat: newLat, lon: newLon };
        driver.distanceFromHQ = distance.toFixed(2);

        // Actualizar marcador en el mapa
        const marker = this.driverMarkers.get(driverId);
        if (marker) {
            marker.setLatLng([newLat, newLon]);
        }

        return true;
    }

    /**
     * Inicia seguimiento en tiempo real (simulación)
     */
    startRealTimeTracking() {
        setInterval(() => {
            this.drivers.forEach((driver, driverId) => {
                if (driver.status === 'en ruta') {
                    // Simular movimiento pequeño
                    const angle = Math.random() * 2 * Math.PI;
                    const distance = 0.0005; // Pequeño movimiento
                    const newLat = driver.position.lat + distance * Math.cos(angle);
                    const newLon = driver.position.lon + distance * Math.sin(angle);
                    
                    this.updateDriverPosition(driverId, newLat, newLon);
                }
            });
        }, 5000); // Actualizar cada 5 segundos

        console.log('[DriverPositioning] Seguimiento en tiempo real iniciado');
    }

    /**
     * Obtiene estadísticas de drivers
     */
    getStatistics() {
        let totalDrivers = 0;
        let driversInRoute = 0;
        let totalDeliveries = 0;
        let avgDistance = 0;

        this.drivers.forEach(driver => {
            totalDrivers++;
            if (driver.status === 'en ruta') driversInRoute++;
            totalDeliveries += driver.totalDeliveries;
            avgDistance += parseFloat(driver.distanceFromHQ);
        });

        avgDistance = (avgDistance / totalDrivers).toFixed(2);

        return {
            totalDrivers,
            driversInRoute,
            driversAvailable: totalDrivers - driversInRoute,
            totalDeliveries,
            avgDistanceFromHQ: avgDistance
        };
    }

    /**
     * Muestra estadísticas en consola
     */
    printStatistics() {
        const stats = this.getStatistics();
        console.log(`
════════════════════════════════════
📊 ESTADÍSTICAS DE DRIVERS
════════════════════════════════════
👥 Total de Drivers: ${stats.totalDrivers}
🚚 En ruta: ${stats.driversInRoute}
✅ Disponibles: ${stats.driversAvailable}
📦 Total Entregas: ${stats.totalDeliveries}
📍 Distancia promedio HQ: ${stats.avgDistanceFromHQ}km
════════════════════════════════════
        `);
    }
}

// Instancia global
let driverPositioningSystem = null;

// Inicializar cuando el mapa esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('[DriverPositioning] Esperando mapa...');
});
