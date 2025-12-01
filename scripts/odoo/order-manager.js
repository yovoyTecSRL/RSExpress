/**
 * Gestor de Pedidos - Integración con Odoo CRM
 * Maneja la conversión de leads en pedidos y entregas
 */

class OrderManager {
    constructor(odooConnector) {
        this.odoo = odooConnector;
        this.orders = new Map();
        this.orderCounter = 2000; // ID inicial para pedidos internos
        
        console.log('📦 OrderManager inicializado');
    }
    
    /**
     * Crear pedido desde un lead de Odoo
     */
    async createOrderFromLead(leadId) {
        try {
            console.log(`📝 Creando pedido desde lead ${leadId}...`);
            
            // Obtener datos del lead
            const lead = await this.odoo.getLeadById(leadId);
            if (!lead) {
                console.error(`❌ Lead ${leadId} no encontrado`);
                return null;
            }
            
            // Generar ID único del pedido
            this.orderCounter++;
            const orderId = this.orderCounter;
            
            // Crear estructura del pedido
            const order = {
                id: orderId,
                lead_id: leadId,
                reference: `ORD-${orderId}`,
                customer: {
                    name: lead.contact_name || lead.name,
                    email: lead.email_from,
                    phone: lead.phone,
                    company: lead.company_name,
                    address: lead.city,
                    country: lead.country_id
                },
                description: lead.description || '',
                amount: lead.expected_revenue || 0,
                status: 'pendiente', // pendiente, confirmado, en_entrega, completado, cancelado
                priority: lead.probability > 75 ? 'alta' : lead.probability > 50 ? 'media' : 'baja',
                items: [],
                deliveries: [],
                notes: lead.description || '',
                created_date: new Date().toISOString(),
                updated_date: new Date().toISOString(),
                source: 'crm',
                assigned_driver: null,
                tracking_number: `TRK-${orderId}-${Date.now()}`
            };
            
            // Guardar pedido
            this.orders.set(orderId, order);
            
            console.log(`✅ Pedido ${orderId} creado desde lead ${leadId}`, order);
            return order;
        } catch (error) {
            console.error('❌ Error creando pedido:', error);
            return null;
        }
    }
    
    /**
     * Agregar artículos al pedido
     */
    addOrderItem(orderId, item) {
        try {
            const order = this.orders.get(orderId);
            if (!order) {
                console.error(`❌ Pedido ${orderId} no encontrado`);
                return false;
            }
            
            // Validar artículo
            if (!item.name || !item.quantity || !item.price) {
                console.error('❌ Artículo inválido: necesita name, quantity y price');
                return false;
            }
            
            // Crear artículo con ID único
            const orderItem = {
                id: `ITEM-${orderId}-${order.items.length + 1}`,
                ...item,
                subtotal: item.quantity * item.price
            };
            
            order.items.push(orderItem);
            order.amount = order.items.reduce((sum, i) => sum + i.subtotal, 0);
            order.updated_date = new Date().toISOString();
            
            console.log(`✅ Artículo agregado al pedido ${orderId}`, orderItem);
            return true;
        } catch (error) {
            console.error('❌ Error agregando artículo:', error);
            return false;
        }
    }
    
    /**
     * Asignar conductor al pedido
     */
    assignDriver(orderId, driverId) {
        try {
            const order = this.orders.get(orderId);
            if (!order) {
                console.error(`❌ Pedido ${orderId} no encontrado`);
                return false;
            }
            
            order.assigned_driver = driverId;
            order.status = 'asignado';
            order.updated_date = new Date().toISOString();
            
            console.log(`✅ Conductor ${driverId} asignado al pedido ${orderId}`);
            return true;
        } catch (error) {
            console.error('❌ Error asignando conductor:', error);
            return false;
        }
    }
    
    /**
     * Crear entregas desde el pedido
     */
    createDeliveriesFromOrder(orderId) {
        try {
            const order = this.orders.get(orderId);
            if (!order) {
                console.error(`❌ Pedido ${orderId} no encontrado`);
                return [];
            }
            
            const deliveries = [];
            
            // Crear una entrega por artículo o por grupo
            order.items.forEach((item, index) => {
                const delivery = {
                    id: 2000 + orderId + index,
                    order_id: orderId,
                    item_id: item.id,
                    reference: `DEL-${orderId}-${index + 1}`,
                    clientName: order.customer.name,
                    address: order.customer.address,
                    phone: order.customer.phone,
                    description: item.name,
                    quantity: item.quantity,
                    weight: item.weight || 0,
                    priority: order.priority,
                    status: 'pendiente',
                    assigned_driver: order.assigned_driver,
                    scheduled_date: new Date().toISOString(),
                    tracking_number: order.tracking_number
                };
                
                deliveries.push(delivery);
                order.deliveries.push(delivery.id);
            });
            
            order.updated_date = new Date().toISOString();
            
            console.log(`✅ ${deliveries.length} entregas creadas para pedido ${orderId}`, deliveries);
            return deliveries;
        } catch (error) {
            console.error('❌ Error creando entregas:', error);
            return [];
        }
    }
    
    /**
     * Obtener pedido por ID
     */
    getOrder(orderId) {
        return this.orders.get(orderId) || null;
    }
    
    /**
     * Listar todos los pedidos
     */
    getAllOrders() {
        return Array.from(this.orders.values());
    }
    
    /**
     * Filtrar pedidos por estado
     */
    getOrdersByStatus(status) {
        return Array.from(this.orders.values()).filter(order => order.status === status);
    }
    
    /**
     * Filtrar pedidos por conductor
     */
    getOrdersByDriver(driverId) {
        return Array.from(this.orders.values()).filter(order => order.assigned_driver === driverId);
    }
    
    /**
     * Actualizar estado del pedido
     */
    updateOrderStatus(orderId, status) {
        try {
            const order = this.orders.get(orderId);
            if (!order) {
                console.error(`❌ Pedido ${orderId} no encontrado`);
                return false;
            }
            
            const validStatuses = ['pendiente', 'confirmado', 'asignado', 'en_entrega', 'completado', 'cancelado'];
            if (!validStatuses.includes(status)) {
                console.error(`❌ Estado inválido: ${status}`);
                return false;
            }
            
            order.status = status;
            order.updated_date = new Date().toISOString();
            
            console.log(`✅ Pedido ${orderId} actualizado a estado: ${status}`);
            return true;
        } catch (error) {
            console.error('❌ Error actualizando estado:', error);
            return false;
        }
    }
    
    /**
     * Sincronizar lead con pedido en Odoo
     */
    async syncOrderToOdoo(orderId) {
        try {
            const order = this.orders.get(orderId);
            if (!order) {
                console.error(`❌ Pedido ${orderId} no encontrado`);
                return false;
            }
            
            // Actualizar lead en Odoo
            const leadData = {
                description: `Pedido ${order.reference}\n${order.notes}\n\nEstado: ${order.status}`,
                expected_revenue: order.amount,
                probability: order.status === 'completado' ? 100 : order.status === 'cancelado' ? 0 : 50
            };
            
            const result = await this.odoo.updateLead(order.lead_id, leadData);
            
            if (result) {
                console.log(`✅ Pedido ${orderId} sincronizado con lead ${order.lead_id} en Odoo`);
            }
            
            return result;
        } catch (error) {
            console.error('❌ Error sincronizando con Odoo:', error);
            return false;
        }
    }
    
    /**
     * Obtener resumen del pedido
     */
    getOrderSummary(orderId) {
        const order = this.orders.get(orderId);
        if (!order) return null;
        
        return {
            id: order.id,
            reference: order.reference,
            customer: order.customer.name,
            items_count: order.items.length,
            total_items: order.items.reduce((sum, i) => sum + i.quantity, 0),
            amount: order.amount,
            status: order.status,
            driver: order.assigned_driver,
            deliveries_count: order.deliveries.length,
            created_date: order.created_date,
            tracking_number: order.tracking_number
        };
    }
    
    /**
     * Exportar pedido como JSON
     */
    exportOrder(orderId) {
        const order = this.orders.get(orderId);
        if (!order) {
            console.error(`❌ Pedido ${orderId} no encontrado`);
            return null;
        }
        
        return JSON.stringify(order, null, 2);
    }
    
    /**
     * Importar pedido desde JSON
     */
    importOrder(jsonData) {
        try {
            const order = JSON.parse(jsonData);
            const orderId = order.id;
            this.orders.set(orderId, order);
            console.log(`✅ Pedido ${orderId} importado correctamente`);
            return orderId;
        } catch (error) {
            console.error('❌ Error importando pedido:', error);
            return null;
        }
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.OrderManager = OrderManager;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = OrderManager;
}
