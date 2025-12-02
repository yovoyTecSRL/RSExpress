/**
 * API REST para Entregas desde Órdenes
 * Endpoints para cargar, filtrar y gestionar entregas
 */

class DeliveryOrdersAPI {
    constructor(baseUrl = 'http://localhost:5555') {
        this.baseUrl = baseUrl;
        this.loader = null;
    }

    /**
     * Inicializa el loader
     */
    async initialize() {
        this.loader = new DeliveryLoader(null);
        return this;
    }

    /**
     * GET /api/deliveries - Obtiene todas las entregas
     */
    async getDeliveries(filters = {}) {
        try {
            if (!this.loader) await this.initialize();

            let deliveries = this.loader.deliveries;

            if (filters.state) {
                deliveries = deliveries.filter(d => d.estado === filters.state);
            }

            if (filters.priority) {
                deliveries = deliveries.filter(d => d.prioridad === filters.priority);
            }

            if (filters.search) {
                const q = filters.search.toLowerCase();
                deliveries = deliveries.filter(d =>
                    d.cliente.toLowerCase().includes(q) ||
                    d.descripcion.toLowerCase().includes(q) ||
                    d.id.toLowerCase().includes(q)
                );
            }

            return {
                success: true,
                count: deliveries.length,
                deliveries: deliveries,
                statistics: this.loader.getStatistics()
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * GET /api/orders - Obtiene todas las órdenes
     */
    async getOrders() {
        try {
            if (!this.loader) await this.initialize();

            return {
                success: true,
                count: this.loader.orders.length,
                orders: this.loader.orders
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * POST /api/load-deliveries - Carga entregas desde Odoo
     */
    async loadDeliveries() {
        try {
            if (!this.loader) await this.initialize();

            const result = await this.loader.loadDeliveries();
            return result;
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * GET /api/deliveries/:id - Obtiene detalle de una entrega
     */
    async getDelivery(deliveryId) {
        try {
            if (!this.loader) await this.initialize();

            const delivery = this.loader.deliveries.find(d => d.id === deliveryId);
            if (!delivery) {
                return { success: false, error: 'Entrega no encontrada' };
            }

            return { success: true, delivery };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * PUT /api/deliveries/:id/status - Actualiza estado de entrega
     */
    async updateDeliveryStatus(deliveryId, newState) {
        try {
            if (!this.loader) await this.initialize();

            const updated = this.loader.updateDeliveryStatus(deliveryId, newState);
            if (!updated) {
                return { success: false, error: 'Entrega no encontrada' };
            }

            return {
                success: true,
                message: 'Estado actualizado',
                delivery: this.loader.deliveries.find(d => d.id === deliveryId)
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * PUT /api/deliveries/:id/assign-driver - Asigna conductor
     */
    async assignDriver(deliveryId, driverId, driverName) {
        try {
            if (!this.loader) await this.initialize();

            const assigned = this.loader.assignDriver(deliveryId, driverId, driverName);
            if (!assigned) {
                return { success: false, error: 'Entrega no encontrada' };
            }

            return {
                success: true,
                message: 'Conductor asignado',
                delivery: this.loader.deliveries.find(d => d.id === deliveryId)
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * GET /api/statistics - Obtiene estadísticas
     */
    async getStatistics() {
        try {
            if (!this.loader) await this.initialize();

            return {
                success: true,
                statistics: this.loader.getStatistics()
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * GET /api/deliveries/by-state/:state - Obtiene entregas por estado
     */
    async getDeliveriesByState(state) {
        try {
            if (!this.loader) await this.initialize();

            const deliveries = this.loader.getDeliveriesByState(state);
            return {
                success: true,
                state: state,
                count: deliveries.length,
                deliveries: deliveries
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * GET /api/deliveries/by-priority/:priority - Obtiene entregas por prioridad
     */
    async getDeliveriesByPriority(priority) {
        try {
            if (!this.loader) await this.initialize();

            const deliveries = this.loader.getDeliveriesByPriority(priority);
            return {
                success: true,
                priority: priority,
                count: deliveries.length,
                deliveries: deliveries
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * POST /api/search - Busca entregas
     */
    async searchDeliveries(query) {
        try {
            if (!this.loader) await this.initialize();

            const deliveries = this.loader.searchDeliveries(query);
            return {
                success: true,
                query: query,
                count: deliveries.length,
                deliveries: deliveries
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * GET /api/export - Exporta todas las entregas como JSON
     */
    async exportDeliveries() {
        try {
            if (!this.loader) await this.initialize();

            return {
                success: true,
                data: this.loader.toJSON()
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * POST /api/deliveries/batch-update - Actualiza múltiples entregas
     */
    async batchUpdateDeliveries(updates) {
        try {
            if (!this.loader) await this.initialize();

            const results = [];
            for (const update of updates) {
                if (update.status) {
                    const result = this.loader.updateDeliveryStatus(update.id, update.status);
                    results.push({ id: update.id, success: result });
                }
            }

            return {
                success: true,
                updated: results.length,
                results: results
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

// Exportar para Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DeliveryOrdersAPI;
}
