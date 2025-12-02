/**
 * Delivery Loader - Carga entregas desde órdenes de Odoo
 * Integra órdenes de venta con el sistema de entregas
 */

class DeliveryLoader {
    constructor(odooConnector) {
        this.odoo = odooConnector;
        this.deliveries = [];
        this.orders = [];
        this.deliveryCounter = 0; // Contador para IDs autogenerados
    }

    /**
     * Genera ID de entrega con formato RS-EN-mmdd.nnn (autoincrement sin decimales)
     * Ejemplo: RS-EN-1201.001, RS-EN-1201.002, RS-EN-1201.003, etc
     */
    generateDeliveryId() {
        const now = new Date();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        this.deliveryCounter++;
        const counter = String(this.deliveryCounter).padStart(3, '0');
        return `RS-EN-${month}${day}.${counter}`;
    }

    /**
     * Obtiene todas las órdenes de Odoo
     */
    async fetchOrders() {
        try {
            if (!this.odoo) {
                console.warn('⚠️ Odoo connector no inicializado');
                return this.generateDemoOrders();
            }

            const orders = await this.odoo.call('sale.order', 'search_read', [
                [['state', 'in', ['draft', 'sent', 'sale', 'done']]]
            ], {
                fields: ['id', 'name', 'client_order_ref', 'date_order', 'partner_id', 
                         'order_line', 'amount_total', 'state', 'note']
            });

            this.orders = orders.map((order, idx) => ({
                id: order.id,
                nombre: order.name,
                cliente: order.partner_id ? order.partner_id[1] : `Cliente ${idx + 1}`,
                referencia: order.client_order_ref || `REF-${order.id}`,
                fecha: new Date(order.date_order),
                estado: order.state,
                total: order.amount_total,
                notas: order.note || '',
                items: order.order_line ? order.order_line.length : 0,
                direccion: `Dirección del cliente ${order.partner_id ? order.partner_id[1] : ''}`,
                telefono: '📞 +52 (555) 1234-5678',
                email: order.partner_id ? `cliente${order.id}@ejemplo.com` : ''
            }));

            return this.orders;
        } catch (error) {
            console.error('❌ Error al obtener órdenes:', error);
            return this.generateDemoOrders();
        }
    }

    /**
     * Genera órdenes de demostración si Odoo no está disponible
     */
    generateDemoOrders() {
        return [
            {
                id: 1001,
                nombre: 'SO/2024/001',
                cliente: 'Restaurante La Esquina',
                referencia: 'ORD-1001',
                fecha: new Date('2024-12-01'),
                estado: 'sale',
                total: 1250.00,
                notas: 'Envío urgente a domicilio',
                items: 5,
                direccion: 'Av. Paseo de la Reforma 505, CDMX',
                telefono: '📞 +52 (555) 1234-5678',
                email: 'restaurante@ejemplo.com'
            },
            {
                id: 1002,
                nombre: 'SO/2024/002',
                cliente: 'Tienda de Ropa Premium',
                referencia: 'ORD-1002',
                fecha: new Date('2024-12-01'),
                estado: 'done',
                total: 3500.00,
                notas: 'Entrega completada',
                items: 12,
                direccion: 'Centro Comercial Polanco, CDMX',
                telefono: '📞 +52 (555) 2345-6789',
                email: 'tienda@ejemplo.com'
            },
            {
                id: 1003,
                nombre: 'SO/2024/003',
                cliente: 'Software Solutions LLC',
                referencia: 'ORD-1003',
                fecha: new Date('2024-12-02'),
                estado: 'sale',
                total: 5200.00,
                notas: 'Equipo de cómputo para oficina',
                items: 3,
                direccion: 'Torre Ejecutiva, Avenida Tecnológica 100, CDMX',
                telefono: '📞 +52 (555) 3456-7890',
                email: 'compras@softwaresolutions.com'
            },
            {
                id: 1004,
                nombre: 'SO/2024/004',
                cliente: 'Farmacia Central',
                referencia: 'ORD-1004',
                fecha: new Date('2024-12-02'),
                estado: 'sent',
                total: 890.50,
                notas: 'Medicamentos refrigerados - Manejo especial',
                items: 25,
                direccion: 'Calle Médicos 234, CDMX',
                telefono: '📞 +52 (555) 4567-8901',
                email: 'farmacia@ejemplo.com'
            },
            {
                id: 1005,
                nombre: 'SO/2024/005',
                cliente: 'Hotel Plaza Mayor',
                referencia: 'ORD-1005',
                fecha: new Date('2024-12-02'),
                estado: 'sale',
                total: 4100.00,
                notas: 'Linens y equipamiento hotelero',
                items: 8,
                direccion: 'Plaza Mayor 456, Centro Histórico CDMX',
                telefono: '📞 +52 (555) 5678-9012',
                email: 'compras@hotelplaza.com'
            }
        ];
    }

    /**
     * Convierte órdenes en entregas
     */
    async convertOrdersToDeliveries(orders = null) {
        const ordersToConvert = orders || this.orders;
        
        if (ordersToConvert.length === 0) {
            await this.fetchOrders();
        }

        // Resetear contador si es necesario
        if (this.deliveries.length === 0) {
            this.deliveryCounter = 0;
        }

        this.deliveries = this.orders.map((order, idx) => ({
            id: this.generateDeliveryId(),
            orderId: order.id,
            orderName: order.nombre,
            cliente: order.cliente,
            descripcion: `Envío de pedido ${order.nombre}`,
            ubicacion: order.direccion,
            estado: this.mapOrderStateToDeliveryState(order.estado),
            prioridad: this.calculatePriority(order),
            notas: order.notas,
            fecha_orden: order.fecha,
            total: order.total,
            items: order.items,
            telefono: order.telefono,
            email: order.email,
            referencia: order.referencia,
            timeline: [
                {
                    timestamp: new Date(order.fecha),
                    evento: 'Orden creada',
                    estado: 'completed'
                }
            ],
            conductor: null,
            vehiculo: null,
            latitud: this.getRandomLatitude(),
            longitud: this.getRandomLongitude()
        }));

        return this.deliveries;
    }

    /**
     * Mapea estado de orden a estado de entrega
     */
    mapOrderStateToDeliveryState(orderState) {
        const stateMap = {
            'draft': 'pending',
            'sent': 'pending',
            'sale': 'in-transit',
            'done': 'completed'
        };
        return stateMap[orderState] || 'pending';
    }

    /**
     * Calcula prioridad basada en monto y urgencia
     */
    calculatePriority(order) {
        if (order.notas && (order.notas.includes('urgente') || order.notas.includes('URGENTE'))) {
            return 'high';
        }
        if (order.total > 3000) return 'high';
        if (order.total > 1000) return 'normal';
        return 'low';
    }

    /**
     * Obtiene coordenadas aleatorias en CDMX (±20km HQ)
     */
    getRandomLatitude() {
        // CDMX: 19.4326 ± 0.18 ≈ ±20km
        return 19.4326 + (Math.random() - 0.5) * 0.36;
    }

    getRandomLongitude() {
        // CDMX: -99.1332 ± 0.18 ≈ ±20km
        return -99.1332 + (Math.random() - 0.5) * 0.36;
    }

    /**
     * Carga entregas desde órdenes
     */
    async loadDeliveries() {
        try {
            await this.fetchOrders();
            await this.convertOrdersToDeliveries();
            return {
                success: true,
                count: this.deliveries.length,
                deliveries: this.deliveries,
                orders: this.orders
            };
        } catch (error) {
            console.error('❌ Error al cargar entregas:', error);
            return {
                success: false,
                error: error.message,
                deliveries: []
            };
        }
    }

    /**
     * Obtiene entregas por estado
     */
    getDeliveriesByState(state) {
        return this.deliveries.filter(d => d.estado === state);
    }

    /**
     * Obtiene entregas por prioridad
     */
    getDeliveriesByPriority(priority) {
        return this.deliveries.filter(d => d.prioridad === priority);
    }

    /**
     * Busca entregas por cliente
     */
    searchDeliveries(query) {
        const q = query.toLowerCase();
        return this.deliveries.filter(d => 
            d.cliente.toLowerCase().includes(q) ||
            d.descripcion.toLowerCase().includes(q) ||
            d.id.toLowerCase().includes(q)
        );
    }

    /**
     * Actualiza estado de entrega
     */
    updateDeliveryStatus(deliveryId, newState) {
        const delivery = this.deliveries.find(d => d.id === deliveryId);
        if (delivery) {
            const oldState = delivery.estado;
            delivery.estado = newState;
            delivery.timeline.push({
                timestamp: new Date(),
                evento: `Estado actualizado: ${oldState} → ${newState}`,
                estado: 'completed'
            });
            return true;
        }
        return false;
    }

    /**
     * Asigna conductor a entrega
     */
    assignDriver(deliveryId, driverId, driverName) {
        const delivery = this.deliveries.find(d => d.id === deliveryId);
        if (delivery) {
            delivery.conductor = {
                id: driverId,
                nombre: driverName
            };
            delivery.timeline.push({
                timestamp: new Date(),
                evento: `Conductor asignado: ${driverName}`,
                estado: 'completed'
            });
            return true;
        }
        return false;
    }

    /**
     * Obtiene estadísticas de entregas
     */
    getStatistics() {
        return {
            total: this.deliveries.length,
            pending: this.getDeliveriesByState('pending').length,
            inTransit: this.getDeliveriesByState('in-transit').length,
            completed: this.getDeliveriesByState('completed').length,
            failed: this.getDeliveriesByState('failed').length,
            montoTotal: this.deliveries.reduce((sum, d) => sum + (d.total || 0), 0),
            itemsTotal: this.deliveries.reduce((sum, d) => sum + (d.items || 0), 0)
        };
    }

    /**
     * Exporta entregas a JSON
     */
    toJSON() {
        return {
            timestamp: new Date(),
            deliveries: this.deliveries,
            orders: this.orders,
            statistics: this.getStatistics()
        };
    }
}

// Exportar para Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DeliveryLoader;
}
