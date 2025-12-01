/**
 * Visualizador de Rutas en Mapa
 * Dibuja rutas optimizadas en Leaflet Map
 * Integración con RouteOptimizer
 */

class RouteMapVisualizer {
    constructor(mapId = 'map') {
        this.mapId = mapId;
        this.map = null;
        this.routeLayers = new Map();
        this.markerLayers = new Map();
        this.polylineLayers = new Map();
        this.colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];
        this.colorIndex = 0;
    }

    /**
     * Inicializar visualizador con mapa existente
     */
    initWithMap(leafletMap) {
        if (!leafletMap) {
            console.error('[RouteMapVisualizer] No se proporcionó mapa Leaflet');
            return false;
        }
        this.map = leafletMap;
        console.log('[RouteMapVisualizer] Inicializado con mapa Leaflet');
        return true;
    }

    /**
     * Obtener color para la ruta
     */
    getRouteColor(index) {
        return this.colors[index % this.colors.length];
    }

    /**
     * Dibujar una ruta completa en el mapa
     */
    drawRoute(route, vehicleId, routeData = {}) {
        try {
            if (!this.map) {
                console.error('[RouteMapVisualizer] Mapa no inicializado');
                return false;
            }

            const color = this.getRouteColor(vehicleId);
            const routeKey = `route-${vehicleId}`;

            // Limpiar ruta anterior si existe
            this.clearRoute(vehicleId);

            // Crear grupo de capas para esta ruta
            const routeGroup = {
                markers: [],
                polyline: null,
                popup: null
            };

            // Dibujar puntos (paradas)
            route.forEach((point, index) => {
                const isDepot = index === 0 || index === route.length - 1;
                const marker = this.createMarker(
                    point,
                    index,
                    isDepot ? 'depot' : 'delivery',
                    color,
                    vehicleId
                );
                this.map.addLayer(marker);
                routeGroup.markers.push(marker);
            });

            // Dibujar línea de ruta
            const routeCoordinates = route.map(point => [point.lat, point.lon]);
            const polyline = L.polyline(routeCoordinates, {
                color: color,
                weight: 3,
                opacity: 0.7,
                dashArray: '5, 5',
                className: 'route-polyline'
            }).addTo(this.map);

            routeGroup.polyline = polyline;

            // Agregar evento click a la línea
            polyline.bindPopup(`
                <div style="text-align: center;">
                    <strong>Vehículo ${vehicleId}</strong><br>
                    Distancia: ${routeData.distance?.toFixed(2) || '0'} km<br>
                    Tiempo: ${routeData.estimatedTime || '0'} min<br>
                    Entregas: ${routeData.deliveriesCount || 0}
                </div>
            `);

            // Guardar referencia
            this.routeLayers.set(routeKey, routeGroup);

            console.log(`[RouteMapVisualizer] Ruta ${vehicleId} dibujada: ${route.length} puntos, color: ${color}`);
            return true;

        } catch (error) {
            console.error('[RouteMapVisualizer] Error al dibujar ruta:', error);
            return false;
        }
    }

    /**
     * Crear marcador para punto de ruta
     */
    createMarker(point, index, type, color, vehicleId) {
        const isDepot = type === 'depot';
        
        let icon;
        if (isDepot) {
            // Icono para depósito
            icon = L.divIcon({
                className: 'depot-marker',
                html: `
                    <div style="
                        background: ${color};
                        color: white;
                        border-radius: 50%;
                        width: 40px;
                        height: 40px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-weight: bold;
                        border: 3px solid white;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                        font-size: 18px;
                    ">
                        📦
                    </div>
                `,
                iconSize: [40, 40],
                iconAnchor: [20, 20],
                popupAnchor: [0, -20]
            });
        } else {
            // Icono para entrega
            icon = L.divIcon({
                className: 'delivery-marker',
                html: `
                    <div style="
                        background: ${color};
                        color: white;
                        border-radius: 50%;
                        width: 32px;
                        height: 32px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-weight: bold;
                        border: 2px solid white;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                        font-size: 14px;
                    ">
                        ${index}
                    </div>
                `,
                iconSize: [32, 32],
                iconAnchor: [16, 16],
                popupAnchor: [0, -16]
            });
        }

        const marker = L.marker([point.lat, point.lon], { icon })
            .bindPopup(`
                <div style="font-size: 12px;">
                    <strong>${point.name || (isDepot ? 'Depósito' : `Parada ${index}`)}</strong><br>
                    ${point.address ? `Dirección: ${point.address}<br>` : ''}
                    Vehículo: ${vehicleId}<br>
                    Coordenadas: ${point.lat.toFixed(4)}, ${point.lon.toFixed(4)}
                </div>
            `);

        return marker;
    }

    /**
     * Dibujar múltiples rutas
     */
    drawMultipleRoutes(optimizedRoutes, routesData = {}) {
        console.log(`[RouteMapVisualizer] Dibujando ${optimizedRoutes.length} rutas`);

        optimizedRoutes.forEach((routeData, index) => {
            const vehicleId = routeData.vehicleId || index + 1;
            this.drawRoute(
                routeData.route,
                vehicleId,
                {
                    distance: routeData.distance,
                    estimatedTime: routeData.estimatedTime,
                    deliveriesCount: routeData.deliveriesCount
                }
            );
        });

        // Ajustar vista al mapa
        this.fitBounds();

        return true;
    }

    /**
     * Limpiar ruta del mapa
     */
    clearRoute(vehicleId) {
        const routeKey = `route-${vehicleId}`;
        const routeGroup = this.routeLayers.get(routeKey);

        if (routeGroup) {
            // Remover marcadores
            routeGroup.markers.forEach(marker => {
                this.map.removeLayer(marker);
            });

            // Remover línea
            if (routeGroup.polyline) {
                this.map.removeLayer(routeGroup.polyline);
            }

            this.routeLayers.delete(routeKey);
            console.log(`[RouteMapVisualizer] Ruta ${vehicleId} removida`);
        }
    }

    /**
     * Limpiar todas las rutas
     */
    clearAllRoutes() {
        this.routeLayers.forEach((routeGroup, key) => {
            routeGroup.markers.forEach(marker => {
                this.map.removeLayer(marker);
            });
            if (routeGroup.polyline) {
                this.map.removeLayer(routeGroup.polyline);
            }
        });
        this.routeLayers.clear();
        console.log('[RouteMapVisualizer] Todas las rutas removidas');
    }

    /**
     * Ajustar vista del mapa a todas las rutas
     */
    fitBounds() {
        const allPoints = [];

        this.routeLayers.forEach(routeGroup => {
            routeGroup.markers.forEach(marker => {
                allPoints.push(marker.getLatLng());
            });
        });

        if (allPoints.length > 0) {
            const group = new L.featureGroup(
                allPoints.map(p => L.marker(p))
            );
            this.map.fitBounds(group.getBounds().pad(0.1));
            console.log(`[RouteMapVisualizer] Vista ajustada a ${allPoints.length} puntos`);
        }
    }

    /**
     * Animar seguimiento a lo largo de la ruta
     */
    animateRoute(vehicleId, speed = 500) {
        const routeKey = `route-${vehicleId}`;
        const routeGroup = this.routeLayers.get(routeKey);

        if (!routeGroup || !routeGroup.polyline) {
            console.error(`[RouteMapVisualizer] No se encontró ruta para vehículo ${vehicleId}`);
            return;
        }

        const points = routeGroup.polyline.getLatLngs();
        let currentIndex = 0;

        const animationIcon = L.divIcon({
            className: 'vehicle-marker',
            html: `
                <div style="
                    background: #2ecc71;
                    color: white;
                    border-radius: 50%;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 18px;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.4);
                ">
                    🚗
                </div>
            `,
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });

        const animationMarker = L.marker(points[0], { icon: animationIcon }).addTo(this.map);

        const animate = () => {
            if (currentIndex < points.length) {
                animationMarker.setLatLng(points[currentIndex]);
                currentIndex++;
                setTimeout(animate, speed);
            } else {
                console.log(`[RouteMapVisualizer] Animación completada para vehículo ${vehicleId}`);
                this.map.removeLayer(animationMarker);
            }
        };

        animate();
    }

    /**
     * Generar reporte visual de rutas
     */
    generateVisualReport(optimizedRoutes) {
        let html = `
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
                <h3>📊 Resumen de Rutas Optimizadas</h3>
                <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                    <thead>
                        <tr style="background: #e8e8e8;">
                            <th style="padding: 8px; text-align: left;">Vehículo</th>
                            <th style="padding: 8px; text-align: left;">Entregas</th>
                            <th style="padding: 8px; text-align: left;">Distancia</th>
                            <th style="padding: 8px; text-align: left;">Tiempo</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        optimizedRoutes.forEach((route, index) => {
            const color = this.getRouteColor(index);
            html += `
                <tr style="border-bottom: 1px solid #ddd;">
                    <td style="padding: 8px;">
                        <span style="
                            background: ${color};
                            color: white;
                            padding: 4px 8px;
                            border-radius: 4px;
                        ">Veh. ${route.vehicleId}</span>
                    </td>
                    <td style="padding: 8px;">${route.deliveriesCount}</td>
                    <td style="padding: 8px;">${route.distance.toFixed(2)} km</td>
                    <td style="padding: 8px;">${route.estimatedTime} min</td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </div>
        `;

        return html;
    }
}

// Inicializar visualizador globalmente
window.routeMapVisualizer = new RouteMapVisualizer();

console.log('✅ Módulo RouteMapVisualizer cargado');
console.log('   Disponible en: window.routeMapVisualizer');
console.log('   Métodos: drawRoute(), drawMultipleRoutes(), clearRoute(), animateRoute()');
