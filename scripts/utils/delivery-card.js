/**
 * 📦 DeliveryCard Component - RSExpress
 * Componente de tarjeta de entrega con estado dinámico
 */

class DeliveryCard {
    constructor(data) {
        this.data = {
            id: data.id || '#1007',
            cliente: data.cliente || 'Cliente',
            descripcion: data.descripcion || 'Descripción de entrega',
            ubicacion: data.ubicacion || 'Ubicación',
            estado: data.estado || 'pending',
            prioridad: data.prioridad || 'normal',
            ...data
        };
        this.element = null;
    }

    /**
     * Renderiza la tarjeta de entrega
     */
    render() {
        const cardClass = this.getStateClass();
        const statusClass = this.getStatusClass();
        const priorityClass = this.getPriorityClass();

        this.element = document.createElement('div');
        this.element.className = `delivery-card ${cardClass} ${priorityClass}`;
        this.element.innerHTML = `
            <!-- Header -->
            <div class="delivery-header">
                <div class="delivery-number">
                    <div class="delivery-number-badge">📦</div>
                    <div>
                        <span class="delivery-id">${this.data.id}</span>
                        <span class="delivery-description">${this.data.descripcion}</span>
                    </div>
                </div>
                <div class="delivery-status-badge ${statusClass}">
                    ${this.getStatusText()}
                </div>
                <div style="padding: 6px 12px 0 12px;/* border-bottom: 1px solid #f0f0f0; */margin-bottom: 0;">
                    <span style="font-size: 10px; color: #999; display: inline; margin-right: 4px; line-height: 1.1;">👤</span>
                    <span style="font-size: 12px; font-weight: 600; color: #2c3e50; display: inline; line-height: 1.1;">
                        ${this.data.cliente || 'Sin cliente'}
                    </span>
                </div>
            </div>

            <!-- Delivery Body - 2 Columns -->
            <div class="delivery-body">
                <!-- Left Column: Ubicaciones -->
                <div class="delivery-body-left">
                    <!-- Punto de Retiro -->
                    ${this.data.puntoRetiro ? `
                        <div class="location-item">
                            <span class="location-label">🏪</span>
                            <span class="location-value">${this.data.puntoRetiro}</span>
                        </div>
                    ` : ''}

                    <!-- Punto de Entrega -->
                    <div class="location-item">
                        <span class="location-label">📍</span>
                        <span class="location-value">${this.data.ubicacion}</span>
                    </div>

                    <!-- Prioridad -->
                    <div class="location-item">
                        <span class="location-label">⚡</span>
                        <span class="location-value">${this.getPrioridadFormateada()}</span>
                    </div>
                    <div class="delivery-notes">
                        ${this.data.notas ? `<strong>📝 Notas:</strong><span>${this.data.notas}</span>` : ''}
                    </div>
                </div>

                <!-- Right Column: Historial y Costo -->
                <div class="delivery-body-right">
                    <!-- Historial -->
                    <div class="historial-section">
                        <span class="historial-title">Historial:</span>
                        ${this.renderTimelineItems()}
                    </div>

                    <!-- Costo -->
                    <div class="cost-box">
                        ${this.data.distancia ? `<span class="cost-distance">📏 ${this.data.distancia}km</span>` : ''}
                        <span class="cost-value">${this.data.costo || '₡--'}</span>
                    </div>
                </div>
            </div>

            <!-- Footer con Botones -->
            <div class="delivery-footer">
                ${this.getActionButtons()}
            </div>
        `;

        // Después de crear el elemento, inicializar el mapa
        setTimeout(() => {
            this.initializeMap();
        }, 100);

        return this.element;
    }

    /**
     * Obtiene la clase de estado
     */
    getStateClass() {
        const states = {
            'pending': 'pending',
            'pendiente': 'pending',
            'in-transit': 'in-transit',
            'en-transito': 'in-transit',
            'completed': 'completed',
            'completada': 'completed',
            'entregada': 'completed',
            'failed': 'failed',
            'fallida': 'failed',
            'cancelada': 'failed'
        };
        return states[this.data.estado?.toLowerCase()] || 'pending';
    }

    /**
     * Obtiene la clase del badge de estado
     */
    getStatusClass() {
        const status = this.getStateClass();
        return status;
    }

    /**
     * Obtiene el texto del estado
     */
    getStatusText() {
        const texts = {
            'pending': 'Pendiente',
            'in-transit': 'En Tránsito',
            'completed': 'Entregada',
            'failed': 'No Entregada'
        };
        return texts[this.getStateClass()] || 'Pendiente';
    }

    /**
     * Obtiene el estado formateado para mostrar
     */
    getEstadoFormateado() {
        const stateEmojis = {
            'pending': '⏳ Pendiente de entrega',
            'in-transit': '🚚 En tránsito',
            'completed': '✅ Entregada',
            'failed': '❌ No entregada'
        };
        return stateEmojis[this.getStateClass()] || '⏳ Pendiente';
    }

    /**
     * Obtiene la clase de prioridad
     */
    getPriorityClass() {
        const priority = this.data.prioridad?.toLowerCase();
        if (priority === 'alta' || priority === 'high') return 'priority-high';
        if (priority === 'baja' || priority === 'low') return 'priority-low';
        return 'priority-normal';
    }

    /**
     * Obtiene la prioridad formateada
     */
    getPrioridadFormateada() {
        const priorities = {
            'normal': 'Normal',
            'alta': 'Urgente',
            'baja': 'Baja',
            'high': 'Urgente',
            'low': 'Baja'
        };
        return priorities[this.data.prioridad?.toLowerCase()] || 'Normal';
    }

    /**
     * Renderiza los items del timeline para la columna derecha
     */
    renderTimelineItems() {
        if (!Array.isArray(this.data.timeline) || this.data.timeline.length === 0) {
            return `
                <div class="timeline-item-empty" style="padding: 8px; color: #999; font-size: 12px;">
                    Sin historial
                </div>
            `;
        }

        return this.data.timeline.map((item, index) => {
            const isCompleted = item.estado === 'completed' || item.completed;
            const icon = isCompleted ? '●' : '○';
            const timestamp = item.timestamp ? new Date(item.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '';
            const evento = item.evento || item.label || 'Evento';

            return `
                <div class="timeline-item ${isCompleted ? 'completed' : 'pending'}" style="display: flex; margin-bottom: 12px; gap: 8px;">
                    <div style="color: ${isCompleted ? '#10b981' : '#cbd5e0'}; font-size: 14px; margin-top: 2px; flex-shrink: 0;">
                        ${icon}
                    </div>
                    <div style="flex: 1;">
                        <div style="font-size: 12px; color: #333; font-weight: 500;">${evento}</div>
                        ${timestamp ? `<div style="font-size: 11px; color: #999;">${timestamp}</div>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Renderiza la línea de tiempo (versión antigua, mantenida por compatibilidad)
     */
    renderTimeline() {
        if (!Array.isArray(this.data.timeline) || this.data.timeline.length === 0) {
            return '';
        }

        const timelineHTML = this.data.timeline.map((item, index) => `
            <div class="timeline-item ${item.completed ? 'completed' : 'pending'}">
                <div class="timeline-dot"></div>
                <div>
                    <strong>${item.label}</strong><br>
                    <small>${item.time || ''}</small>
                </div>
            </div>
        `).join('');

        return `
            <div class="delivery-timeline">
                <strong style="font-size: 12px; color: #555;">Historial:</strong>
                ${timelineHTML}
            </div>
        `;
    }

    /**
     * Obtiene los botones de acción según el estado
     */
    getActionButtons() {
        const state = this.getStateClass();
        let buttons = '';

        if (state === 'pending') {
            buttons = `
                <button class="delivery-button primary" onclick="this.deliveryCard?.updateStatus('in-transit')">
                    🚚 Asignar
                </button>
                <button class="delivery-button secondary" onclick="this.deliveryCard?.viewDetails()">
                    👁️ Ver
                </button>
            `;
        } else if (state === 'in-transit') {
            buttons = `
                <button class="delivery-button primary" onclick="this.deliveryCard?.updateStatus('completed')">
                    ✅ Entregar
                </button>
                <button class="delivery-button secondary" onclick="this.deliveryCard?.updateStatus('failed')">
                    ❌ No Entregada
                </button>
            `;
        } else if (state === 'completed') {
            buttons = `
                <button class="delivery-button secondary" onclick="this.deliveryCard?.viewDetails()">
                    📄 Ver Comprobante
                </button>
            `;
        } else if (state === 'failed') {
            buttons = `
                <button class="delivery-button primary" onclick="this.deliveryCard?.updateStatus('pending')">
                    🔄 Reintentar
                </button>
                <button class="delivery-button secondary" onclick="this.deliveryCard?.viewDetails()">
                    📋 Ver Motivo
                </button>
            `;
        }

        // Agregar botón Ver Ruta en todos los estados
        buttons += `
            <button class="delivery-button route-btn" onclick="showRouteModal('${this.data.id}', '${this.data.cliente}', '${this.data.ubicacion}')">
                🗺️ Ver Ruta
            </button>
        `;

        return buttons;
    }

    /**
     * Actualiza el estado de la entrega
     */
    updateStatus(newStatus) {
        this.data.estado = newStatus;
        const newElement = this.render();
        if (this.element && this.element.parentNode) {
            this.element.parentNode.replaceChild(newElement, this.element);
            this.element = newElement;
        }
        console.log(`✅ Estado actualizado a: ${newStatus}`);
    }

    /**
     * Muestra detalles de la entrega
     */
    viewDetails() {
        console.log('📦 Detalles de la entrega:', this.data);
        alert(`
📦 DETALLES DE LA ENTREGA

ID: ${this.data.id}
Cliente: ${this.data.cliente}
Descripción: ${this.data.descripcion}
Ubicación: ${this.data.ubicacion}
Estado: ${this.getStatusText()}
Prioridad: ${this.getPrioridadFormateada()}
${this.data.notas ? `\nNotas: ${this.data.notas}` : ''}
        `);
    }

    /**
     * Monta la tarjeta en un contenedor
     */
    mount(selector) {
        const container = document.querySelector(selector);
        if (container) {
            container.appendChild(this.render());
        }
        return this;
    }

    /**
     * Monta múltiples tarjetas en un contenedor
     */
    static mountMultiple(deliveries, selector) {
        const container = document.querySelector(selector);
        if (!container) return;

        deliveries.forEach(delivery => {
            const card = new DeliveryCard(delivery);
            container.appendChild(card.render());
        });
    }

    /**
     * Inicializa el mapa Leaflet para la entrega
     */
    initializeMap() {
        // Coordenadas de destino
        const destLat = this.data.lat || 9.3833;
        const destLng = this.data.lng || -83.7333;
        
        // Generar coordenadas de origen cercanas (punto de retiro)
        const originLat = destLat + (Math.random() * 0.02 - 0.01);
        const originLng = destLng + (Math.random() * 0.02 - 0.01);
        
        const mapId = `map-${this.data.id}`;
        const mapContainer = document.getElementById(mapId);
        
        if (!mapContainer) {
            console.warn(`Map container ${mapId} not found`);
            return;
        }

        try {
            // Crear mapa centrado entre origen y destino
            const centerLat = (originLat + destLat) / 2;
            const centerLng = (originLng + destLng) / 2;
            
            const map = L.map(mapId).setView([centerLat, centerLng], 12);
            
            // Agregar tiles de OpenStreetMap
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19
            }).addTo(map);
            
            // Marcador de ORIGEN (Punto de Retiro) - Verde
            const originMarker = L.marker([originLat, originLng], {
                icon: L.icon({
                    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iIzI3YWU2MCIgZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyYzAgNy4yIDEwIDIwIDEwIDIwczEwLTEyLjggMTAtMjBjMC01LjUyLTQuNDgtMTAtMTAtMTB6bTAgMTVjLTIuNzYgMC01LTIuMjQtNS01czIuMjQtNSA1LTUgNSAyLjI0IDUgNS0yLjI0IDUtNSA1eiIvPjwvc3ZnPg==',
                    iconSize: [32, 32],
                    iconAnchor: [16, 32],
                    popupAnchor: [0, -32]
                })
            }).addTo(map);
            
            originMarker.bindPopup(`
                <strong style="color: #27ae60;">🏪 Origen</strong><br>
                ${this.data.puntoRetiro || 'Punto de Retiro'}<br>
                <small style="color: #666;">Lat: ${originLat.toFixed(4)}</small><br>
                <small style="color: #666;">Lng: ${originLng.toFixed(4)}</small>
            `);
            
            // Marcador de DESTINO (Punto de Entrega) - Azul
            const destMarker = L.marker([destLat, destLng], {
                icon: L.icon({
                    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iIzI5ODBiOSIgZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyYzAgNy4yIDEwIDIwIDEwIDIwczEwLTEyLjggMTAtMjBjMC01LjUyLTQuNDgtMTAtMTAtMTB6bTAgMTVjLTIuNzYgMC01LTIuMjQtNS01czIuMjQtNSA1LTUgNSAyLjI0IDUgNS0yLjI0IDUtNSA1eiIvPjwvc3ZnPg==',
                    iconSize: [32, 32],
                    iconAnchor: [16, 32],
                    popupAnchor: [0, -32]
                })
            }).addTo(map);
            
            destMarker.bindPopup(`
                <strong style="color: #2980b9;">📍 Destino</strong><br>
                ${this.data.ubicacion}<br>
                <small style="color: #666;">Lat: ${destLat.toFixed(4)}</small><br>
                <small style="color: #666;">Lng: ${destLng.toFixed(4)}</small>
            `);
            
            // Crear línea de ruta principal con estilo de trafficway mejorado
            const routeLine = L.polyline(
                [[originLat, originLng], [destLat, destLng]],
                {
                    color: '#667eea',
                    weight: 7,
                    opacity: 0.9,
                    dashArray: '0',
                    lineCap: 'round',
                    lineJoin: 'round',
                    className: 'route-line-animated'
                }
            ).addTo(map);
            
            // Añadir efecto de brillo/sombra a la ruta con gradiente
            const shadowLine = L.polyline(
                [[originLat, originLng], [destLat, destLng]],
                {
                    color: '#667eea',
                    weight: 14,
                    opacity: 0.15,
                    dashArray: '0',
                    lineCap: 'round',
                    lineJoin: 'round'
                }
            ).addTo(map);
            
            // Añadir línea interior de contraste
            const innerLine = L.polyline(
                [[originLat, originLng], [destLat, destLng]],
                {
                    color: '#fff',
                    weight: 3,
                    opacity: 0.4,
                    dashArray: '5, 5',
                    lineCap: 'round',
                    lineJoin: 'round'
                }
            ).addTo(map);
            
            // Calcular distancia aproximada en km (usando Haversine formula)
            const distance = this.calculateDistance(originLat, originLng, destLat, destLng);
            const duration = Math.ceil(distance / 40) + ' min'; // Asumiendo ~40 km/h promedio
            
            // Crear marcador de información de ruta en el centro
            const routeInfoLat = (originLat + destLat) / 2;
            const routeInfoLng = (originLng + destLng) / 2;
            
            const routeInfo = L.marker([routeInfoLat, routeInfoLng], {
                icon: L.divIcon({
                    className: 'route-info-marker',
                    html: `
                        <div style="
                            background: rgba(102, 126, 234, 0.95);
                            color: white;
                            padding: 8px 12px;
                            border-radius: 20px;
                            font-weight: bold;
                            font-size: 12px;
                            white-space: nowrap;
                            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                            border: 2px solid white;
                        ">
                            📍 ${distance.toFixed(1)} km • ${duration}
                        </div>
                    `,
                    iconSize: [120, 34],
                    iconAnchor: [60, 17],
                    popupAnchor: [0, -17]
                })
            }).addTo(map);
            
            // Ajustar vista para mostrar ambos marcadores
            const group = L.featureGroup([originMarker, destMarker]);
            map.fitBounds(group.getBounds().pad(0.15));
            
            // Ajustar tamaño del mapa
            setTimeout(() => {
                map.invalidateSize();
            }, 200);
            
        } catch (error) {
            console.error(`Error initializing map for ${mapId}:`, error);
        }
    }
    
    /**
     * Calcula la distancia entre dos puntos usando la fórmula Haversine
     */
    calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371; // Radio terrestre en km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    /**
     * Exporta la tarjeta como JSON
     */
    toJSON() {
        return this.data;
    }
}

// Ejemplo de uso global
window.DeliveryCard = DeliveryCard;
