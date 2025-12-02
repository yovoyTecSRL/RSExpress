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
                        <div class="delivery-id">${this.data.id}</div>
                        <small style="color: #95a5a6;">${this.data.cliente || 'Cliente'}</small>
                    </div>
                </div>
                <div class="delivery-status-badge ${statusClass}">
                    ${this.getStatusText()}
                </div>
            </div>

            <!-- Body - 2 Columns: Left (Info) & Right (Timeline) -->
            <div class="delivery-body">
                <!-- Left Column: Information -->
                <div class="delivery-body-left">
                    <!-- Descripción -->
                    <div class="delivery-item">
                        <div class="delivery-item-icon">📋</div>
                        <div class="delivery-item-content">
                            <div class="delivery-item-label">Descripción</div>
                            <div class="delivery-item-value">${this.data.descripcion}</div>
                        </div>
                    </div>

                    <!-- Ubicación -->
                    <div class="delivery-item">
                        <div class="delivery-item-icon">📍</div>
                        <div class="delivery-item-content">
                            <div class="delivery-item-label">Punto de Entrega</div>
                            <div class="delivery-item-value">
                                <strong>${this.data.ubicacion}</strong>
                            </div>
                        </div>
                    </div>

                    <!-- Estado -->
                    <div class="delivery-item">
                        <div class="delivery-item-icon">⏱️</div>
                        <div class="delivery-item-content">
                            <div class="delivery-item-label">Estado</div>
                            <div class="delivery-item-value">
                                ${this.getEstadoFormateado()}
                            </div>
                        </div>
                    </div>

                    <!-- Prioridad -->
                    <div class="delivery-item">
                        <div class="delivery-item-icon">⚡</div>
                        <div class="delivery-item-content">
                            <div class="delivery-item-label">Prioridad</div>
                            <div class="delivery-item-value">
                                <span class="delivery-priority-indicator"></span>
                                ${this.getPrioridadFormateada()}
                            </div>
                        </div>
                    </div>

                    ${this.data.notas ? `
                        <div class="delivery-notes">
                            <strong>📝 Notas:</strong><br>${this.data.notas}
                        </div>
                    ` : ''}
                </div>

                <!-- Right Column: Timeline/Historial -->
                <div class="delivery-body-right">
                    <div class="delivery-timeline-section">
                        <strong style="display: block; margin-bottom: 12px; color: #333; font-size: 13px;">Historial:</strong>
                        ${this.renderTimelineItems()}
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div class="delivery-footer">
                ${this.getActionButtons()}
            </div>
        `;

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
            'failed': 'Fallida'
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
            'alta': 'Alta',
            'baja': 'Baja',
            'high': 'Alta',
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
     * Exporta la tarjeta como JSON
     */
    toJSON() {
        return this.data;
    }
}

// Ejemplo de uso global
window.DeliveryCard = DeliveryCard;
