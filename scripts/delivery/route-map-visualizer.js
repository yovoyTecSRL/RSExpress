/**
 * Route Map Visualizer - Visualiza rutas de entregas en mapa
 * Usa Leaflet.js para mostrar rutas tipo Waze
 */

class RouteMapVisualizer {
    constructor(containerId, initialZoom = 12) {
        this.containerId = containerId;
        this.map = null;
        this.markers = {};
        this.polylines = {};
        this.initialZoom = initialZoom;
        this.shippingCalc = new ShippingCalculator();
        
        this.initMap();
    }

    /**
     * Inicializa el mapa con Leaflet
     */
    initMap() {
        // Verificar que Leaflet está disponible
        if (typeof L === 'undefined') {
            console.error('❌ Leaflet.js no está cargado');
            return false;
        }

        const container = document.getElementById(this.containerId);
        if (!container) {
            console.error(`❌ Contenedor "${this.containerId}" no encontrado`);
            return false;
        }

        // Crear mapa centrado en CDMX
        this.map = L.map(this.containerId).setView([19.4326, -99.1332], this.initialZoom);

        // Agregar capa de OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
            minZoom: 10
        }).addTo(this.map);

        console.log('✅ Mapa inicializado');
        return true;
    }

    /**
     * Agrega marcador al mapa
     */
    addMarker(lat, lng, label, type = 'location') {
        if (!this.map) return null;

        const iconColors = {
            hq: '#667eea',
            delivery: '#10b981',
            pending: '#f59e0b',
            active: '#3b82f6',
            completed: '#6b7280'
        };

        const icon = L.divIcon({
            html: `
                <div style="
                    background: ${iconColors[type] || '#667eea'};
                    color: white;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    font-size: 18px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                    border: 3px solid white;
                ">
                    ${this.getIcon(type)}
                </div>
            `,
            className: 'delivery-marker',
            iconSize: [40, 40],
            iconAnchor: [20, 20],
            popupAnchor: [0, -20]
        });

        const marker = L.marker([lat, lng], { icon: icon })
            .addTo(this.map)
            .bindPopup(`<b>${label}</b><br/>Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`);

        return marker;
    }

    /**
     * Obtiene emoji según tipo
     */
    getIcon(type) {
        const icons = {
            hq: '🏢',
            delivery: '📦',
            pending: '⏳',
            active: '🚚',
            completed: '✅'
        };
        return icons[type] || '📍';
    }

    /**
     * Dibuja ruta en el mapa
     */
    drawRoute(route, label = 'Ruta', color = '#3b82f6', weight = 3) {
        if (!this.map || route.length < 2) return null;

        const coordinates = route.map(point => [point.lat, point.lng]);

        const polyline = L.polyline(coordinates, {
            color: color,
            weight: weight,
            opacity: 0.8,
            dashArray: '5, 5'
        }).addTo(this.map);

        // Agregar popup al inicio
        polyline.bindPopup(`<b>${label}</b><br/>Puntos: ${route.length}`);

        return polyline;
    }

    /**
     * Visualiza entrega completa (HQ → Destino)
     */
    visualizeDelivery(delivery, locationId) {
        if (!this.map) return null;

        // Obtener ubicación
        const location = this.shippingCalc.getLocation(locationId);
        if (!location) {
            console.error('Ubicación no encontrada');
            return null;
        }

        // Limpiar marcadores previos
        this.clearMap();

        // HQ
        this.addMarker(19.4326, -99.1332, 'HQ RSExpress', 'hq');

        // Destino
        this.addMarker(location.lat, location.lng, delivery.cliente, 'delivery');

        // Generar y dibujar ruta
        const route = this.shippingCalc.generateRoute(
            19.4326, -99.1332,
            location.lat, location.lng,
            8
        );

        this.drawRoute(route, `Ruta: ${delivery.id}`, '#3b82f6', 3);

        // Ajustar zoom para ver la ruta completa
        const bounds = L.latLngBounds(
            [[19.4326, -99.1332], [location.lat, location.lng]]
        );
        this.map.fitBounds(bounds, { padding: [50, 50] });

        // Mostrar información
        console.log(`
📍 RUTA VISUALIZADA
====================
Entrega: ${delivery.id}
Cliente: ${delivery.cliente}
Ubicación: ${location.nombre}
Distancia: ${route.length > 0 ? 'Calculada' : 'N/A'}
        `);

        return route;
    }

    /**
     * Anima un conductor a lo largo de una ruta
     */
    animateDriver(route, label = 'Conductor', speed = 500) {
        if (!this.map || route.length < 2) return null;

        let currentIndex = 0;
        let marker = null;

        const animate = () => {
            const point = route[currentIndex];

            if (!marker) {
                const icon = L.divIcon({
                    html: `
                        <div style="
                            background: #ef4444;
                            color: white;
                            border-radius: 50%;
                            width: 50px;
                            height: 50px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 28px;
                            box-shadow: 0 4px 12px rgba(0,0,0,0.4);
                            border: 3px solid white;
                        ">
                            🚗
                        </div>
                    `,
                    iconSize: [50, 50],
                    iconAnchor: [25, 25]
                });
                marker = L.marker([point.lat, point.lng], { icon: icon })
                    .addTo(this.map)
                    .bindPopup(`<b>${label}</b><br/>En movimiento...`);
            } else {
                marker.setLatLng([point.lat, point.lng]);
            }

            currentIndex++;
            if (currentIndex < route.length) {
                setTimeout(animate, speed);
            } else {
                console.log('✅ Animación completada');
            }
        };

        animate();
        return marker;
    }

    /**
     * Limpia el mapa
     */
    clearMap() {
        if (!this.map) return;

        this.map.eachLayer(layer => {
            if (layer instanceof L.Marker || layer instanceof L.Polyline) {
                this.map.removeLayer(layer);
            }
        });
    }

    /**
     * Destruye el mapa
     */
    destroy() {
        if (this.map) {
            this.clearMap();
            this.map.remove();
            this.map = null;
        }
    }
}

// Exportar para Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RouteMapVisualizer;
}
