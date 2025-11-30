/** @odoo-module **/
/**
 * RSExpress Tracking Map - Leaflet Integration
 * ===========================================
 * 
 * Muestra todos los vehículos con GPS en un mapa interactivo.
 * Consume endpoint: /rsexpress/opscenter/tracking/all
 * 
 * Tecnologías:
 * - Leaflet.js v1.9.4
 * - OpenStreetMap Tiles
 * - Odoo OWL Framework
 */

import { registry } from '@web/core/registry';
import { useService } from '@web/core/utils/hooks';
import { Component, onMounted, onWillUnmount } from '@odoo/owl';

export class RSExpressTrackingMap extends Component {
    setup() {
        this.rpc = useService('rpc');
        this.map = null;
        this.markers = {};
        this.refreshInterval = null;

        onMounted(() => {
            this.initMap();
            this.loadVehicles();
            this.startAutoRefresh();
        });

        onWillUnmount(() => {
            this.stopAutoRefresh();
        });
    }

    /**
     * Inicializa el mapa Leaflet
     */
    initMap() {
        // Centro predeterminado: Bogotá, Colombia
        const defaultLat = 4.60971;
        const defaultLng = -74.08175;
        const defaultZoom = 12;

        // Verificar si Leaflet está disponible
        if (typeof L === 'undefined') {
            console.error('Leaflet no está cargado. Incluir CDN en template.');
            this.showError('Error: Librería Leaflet no disponible');
            return;
        }

        // Crear mapa
        const mapContainer = document.getElementById('rsexpress_tracking_map');
        if (!mapContainer) {
            console.error('Contenedor del mapa no encontrado');
            return;
        }

        this.map = L.map(mapContainer).setView([defaultLat, defaultLng], defaultZoom);

        // Agregar capa de OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19,
        }).addTo(this.map);

        console.log('🗺️ Mapa Leaflet inicializado');
    }

    /**
     * Carga vehículos desde el backend
     */
    async loadVehicles() {
        try {
            const response = await this.rpc('/rsexpress/opscenter/tracking/all', {});
            
            if (response.vehicles && response.vehicles.length > 0) {
                this.renderMarkers(response.vehicles);
                this.fitMapBounds(response.vehicles);
            } else {
                this.showInfo('No hay vehículos con GPS disponible');
            }
        } catch (error) {
            console.error('Error cargando vehículos:', error);
            this.showError('Error al cargar posiciones GPS');
        }
    }

    /**
     * Renderiza marcadores en el mapa
     */
    renderMarkers(vehicles) {
        // Limpiar marcadores existentes
        Object.values(this.markers).forEach(marker => marker.remove());
        this.markers = {};

        vehicles.forEach(vehicle => {
            const lat = vehicle.latitude || vehicle.lat;
            const lng = vehicle.longitude || vehicle.lng;

            if (!lat || !lng) return;

            // Color del marcador según estado
            const color = this.getMarkerColor(vehicle.status);

            // Crear icono personalizado
            const icon = L.divIcon({
                className: 'custom-marker',
                html: `<div style="
                    background-color: ${color};
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    border: 3px solid white;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    color: white;
                ">🚗</div>`,
                iconSize: [30, 30],
                iconAnchor: [15, 15],
            });

            // Crear marcador
            const marker = L.marker([lat, lng], { icon: icon }).addTo(this.map);

            // Popup con información
            const popupContent = `
                <div style="font-family: Arial, sans-serif;">
                    <h4 style="margin: 0 0 10px 0; color: #333;">
                        🚗 ${vehicle.name}
                    </h4>
                    <table style="width: 100%; font-size: 12px;">
                        <tr>
                            <td><strong>Estado:</strong></td>
                            <td>${this.getStatusLabel(vehicle.status)}</td>
                        </tr>
                        <tr>
                            <td><strong>Conductor:</strong></td>
                            <td>${vehicle.driver || 'Sin asignar'}</td>
                        </tr>
                        <tr>
                            <td><strong>Velocidad:</strong></td>
                            <td>${vehicle.speed ? vehicle.speed.toFixed(1) + ' km/h' : 'N/A'}</td>
                        </tr>
                        <tr>
                            <td><strong>Última actualización:</strong></td>
                            <td>${vehicle.last_update || 'Desconocida'}</td>
                        </tr>
                        <tr>
                            <td colspan="2">
                                <button onclick="window.open('/web#id=${vehicle.id}&model=fleet.vehicle&view_type=form', '_blank')" 
                                        style="margin-top: 8px; padding: 5px 10px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
                                    Ver Detalles
                                </button>
                            </td>
                        </tr>
                    </table>
                </div>
            `;

            marker.bindPopup(popupContent);
            this.markers[vehicle.id] = marker;
        });

        console.log(`✅ ${vehicles.length} marcadores renderizados`);
    }

    /**
     * Ajusta el mapa para mostrar todos los vehículos
     */
    fitMapBounds(vehicles) {
        const validPositions = vehicles
            .filter(v => v.latitude && v.longitude)
            .map(v => [v.latitude || v.lat, v.longitude || v.lng]);

        if (validPositions.length > 0) {
            const bounds = L.latLngBounds(validPositions);
            this.map.fitBounds(bounds, { padding: [50, 50] });
        }
    }

    /**
     * Color del marcador según estado del vehículo
     */
    getMarkerColor(status) {
        const colors = {
            'available': '#28a745',    // Verde
            'on_route': '#007bff',     // Azul
            'maintenance': '#ffc107',  // Amarillo
            'inactive': '#6c757d',     // Gris
            'problem': '#dc3545',      // Rojo
        };
        return colors[status] || '#6c757d';
    }

    /**
     * Etiqueta del estado en español
     */
    getStatusLabel(status) {
        const labels = {
            'available': '✅ Disponible',
            'on_route': '🚚 En Ruta',
            'maintenance': '🔧 Mantenimiento',
            'inactive': '⏸️ Inactivo',
            'problem': '⚠️ Problema',
        };
        return labels[status] || status;
    }

    /**
     * Auto-refresh cada 30 segundos
     */
    startAutoRefresh() {
        this.refreshInterval = setInterval(() => {
            console.log('🔄 Auto-refresh tracking GPS');
            this.loadVehicles();
        }, 30000); // 30 segundos
    }

    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
    }

    /**
     * Muestra mensaje de error
     */
    showError(message) {
        const container = document.getElementById('rsexpress_tracking_map');
        if (container) {
            container.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #f8d7da; color: #721c24; padding: 20px; border-radius: 8px;">
                    <div style="text-align: center;">
                        <h3>❌ ${message}</h3>
                        <button onclick="location.reload()" style="margin-top: 10px; padding: 8px 16px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">
                            Reintentar
                        </button>
                    </div>
                </div>
            `;
        }
    }

    /**
     * Muestra mensaje informativo
     */
    showInfo(message) {
        const container = document.getElementById('rsexpress_tracking_map');
        if (container) {
            container.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #d1ecf1; color: #0c5460; padding: 20px; border-radius: 8px;">
                    <div style="text-align: center;">
                        <h3>ℹ️ ${message}</h3>
                        <p>Configure dispositivos Traccar para ver tracking GPS</p>
                        <button onclick="location.reload()" style="margin-top: 10px; padding: 8px 16px; background: #17a2b8; color: white; border: none; border-radius: 4px; cursor: pointer;">
                            Actualizar
                        </button>
                    </div>
                </div>
            `;
        }
    }
}

RSExpressTrackingMap.template = 'rsexpress.tracking.map.template';

registry.category('actions').add('rsexpress_tracking_map', RSExpressTrackingMap);
