/**
 * OrderManager Service
 * Gestor de órdenes desde leads
 * 
 * Equivalente modular de scripts/odoo/order-manager.js
 */

class OrderManagerService {
  constructor(odooConnector) {
    this.odooConnector = odooConnector;
    this.orders = new Map();
  }

  /**
   * Crear orden desde un lead
   */
  async createOrderFromLead(leadId, leadData) {
    try {
      console.log(`[OrderManager] 📦 Creando orden desde lead ${leadId}...`);

      // Crear orden en Odoo
      const orderId = await this.odooConnector.callOdooAPI(
        'object',
        'execute_kw',
        [
          this.odooConnector.config.database,
          this.odooConnector.config.uid,
          this.odooConnector.config.token,
          'sale.order',
          'create',
          [{
            partner_id: leadData.company_id?.[0] || 1,
            order_line: [(0, 0, {
              product_id: 1,
              product_qty: 1,
              price_unit: 0,
            })],
            note: `Convertido desde lead: ${leadData.name}`,
          }]
        ]
      );

      // Guardar orden en caché
      const order = {
        id: orderId,
        leadId: leadId,
        reference: `SO-${orderId}`,
        customer: {
          id: leadData.company_id?.[0] || 1,
          name: leadData.company_id?.[1] || 'Cliente'
        },
        amount: 0,
        status: 'draft',
        assigned_driver: null
      };

      this.orders.set(orderId, order);

      console.log(`[OrderManager] ✅ Orden creada: ${orderId}`);
      return order;
    } catch (error) {
      console.error('[OrderManager] Error creando orden:', error);
      throw error;
    }
  }

  /**
   * Obtener todas las órdenes
   */
  getAllOrders() {
    return Array.from(this.orders.values());
  }

  /**
   * Obtener orden por ID
   */
  getOrder(orderId) {
    return this.orders.get(orderId) || null;
  }

  /**
   * Asignar conductor a orden
   */
  assignDriver(orderId, driverId) {
    const order = this.orders.get(orderId);
    if (order) {
      order.assigned_driver = driverId;
      console.log(`[OrderManager] 👤 Conductor asignado: ${driverId} a orden ${orderId}`);
      return true;
    }
    return false;
  }

  /**
   * Actualizar estado de orden
   */
  updateOrderStatus(orderId, status) {
    const order = this.orders.get(orderId);
    if (order) {
      order.status = status;
      console.log(`[OrderManager] 📊 Estado actualizado: ${orderId} → ${status}`);
      return true;
    }
    return false;
  }
}

export default OrderManagerService;
