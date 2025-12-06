# 🚀 Plan de Mejora - Integración Odoo

## ✨ Mejoras Propuestas

### 1. Crear Capa API Unificada
**Archivo**: `scripts/odoo/odoo-api-base.js`
**Beneficio**: Reutilizar `callOdooAPI()` en todos los módulos

```javascript
class OdooAPIBase {
    constructor(config = {}) {
        this.url = config.url || 'http://localhost:9999';
        this.database = config.database || 'odoo19';
        this.uid = config.uid || 5;
        this.apiKey = config.apiKey || '1fc63a72dcf97e88aab89c5a8a54dc0eac25cb9b';
        this.isConnected = false;
    }

    /**
     * Llamada genérica JSON-RPC a Odoo
     */
    async callOdooAPI(service, method, args) {
        try {
            const payload = {
                jsonrpc: '2.0',
                method: 'call',
                params: { service, method, args },
                id: Math.random()
            };

            const response = await fetch(`${this.url}/jsonrpc`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error.data?.message || data.error.message);
            return data.result;
        } catch (error) {
            console.error(`[OdooAPI] Error (${service}.${method}):`, error);
            throw error;
        }
    }

    /**
     * Verificar conexión
     */
    async checkConnection() {
        try {
            const result = await this.callOdooAPI('common', 'version', []);
            this.isConnected = result && result.server_version;
            console.log(`[OdooAPI] ${this.isConnected ? '✅ Conectado' : '❌ Desconectado'}`);
            return this.isConnected;
        } catch (error) {
            this.isConnected = false;
            return false;
        }
    }
}
```

### 2. Extender OdooConnector desde OdooAPIBase
**Archivo**: `scripts/odoo/odoo-connector.js`

```javascript
class OdooConnector extends OdooAPIBase {
    constructor(config = {}) {
        super(config);
        this.cache = new Map();
        this.cacheTimeout = 300000; // 5 minutos
        console.log('[OdooConnector] Inicializado');
    }

    /**
     * Obtener leads del CRM
     */
    async getLeads(domain = [], offset = 0, limit = 20) {
        try {
            console.log(`[OdooConnector] Obteniendo leads (offset: ${offset}, limit: ${limit})...`);
            
            const leadIds = await this.callOdooAPI('object', 'execute_kw', [
                this.database, this.uid, this.apiKey,
                'crm.lead', 'search', [domain],
                { offset, limit }
            ]);

            const leads = await this.callOdooAPI('object', 'execute_kw', [
                this.database, this.uid, this.apiKey,
                'crm.lead', 'read',
                [leadIds, ['id', 'name', 'email_from', 'phone', 'contact_name', 'description']]
            ]);

            console.log(`[OdooConnector] ✅ ${leads.length} leads obtenidos`);
            return leads;
        } catch (error) {
            console.error('[OdooConnector] Error obteniendo leads:', error);
            return [];
        }
    }

    /**
     * Obtener lead por ID
     */
    async getLeadById(leadId) {
        const cacheKey = `lead_${leadId}`;
        
        // Verificar cache
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            }
        }

        try {
            const leads = await this.callOdooAPI('object', 'execute_kw', [
                this.database, this.uid, this.apiKey,
                'crm.lead', 'read',
                [[leadId], ['id', 'name', 'email_from', 'phone', 'contact_name', 'description', 'expected_revenue']]
            ]);

            const lead = leads[0] || null;
            if (lead) {
                this.cache.set(cacheKey, { data: lead, timestamp: Date.now() });
            }
            return lead;
        } catch (error) {
            console.error(`[OdooConnector] Error obteniendo lead ${leadId}:`, error);
            return null;
        }
    }

    /**
     * Crear lead por defecto
     */
    async createDefaultLead() {
        try {
            const leadData = {
                name: 'Lead de Prueba - RSExpress',
                email_from: 'test@rsexpress.local',
                phone: '+541234567890',
                contact_name: 'Cliente Test'
            };

            const leadId = await this.callOdooAPI('object', 'execute_kw', [
                this.database, this.uid, this.apiKey,
                'crm.lead', 'create', [leadData]
            ]);

            return this.getLeadById(leadId);
        } catch (error) {
            console.error('[OdooConnector] Error creando lead:', error);
            return null;
        }
    }
}
```

### 3. Mejorar OrderManager para sincronizar con Odoo
**Archivo**: `scripts/odoo/order-manager.js`

```javascript
class OrderManager extends OdooAPIBase {
    constructor(odooConnector) {
        super(odooConnector.config || {});
        this.odoo = odooConnector;
        this.orders = new Map();
        this.orderCounter = 2000;
        console.log('[OrderManager] Inicializado');
    }

    /**
     * Sincronizar órdenes desde Odoo
     */
    async syncOrdersFromOdoo() {
        try {
            console.log('[OrderManager] Sincronizando órdenes desde Odoo...');
            
            const orders = await this.callOdooAPI('object', 'execute_kw', [
                this.database, this.uid, this.apiKey,
                'sale.order', 'search_read',
                [['state', '!=', 'cancel']],
                { fields: ['id', 'name', 'partner_id', 'amount_total', 'state', 'order_line'] }
            ]);

            console.log(`[OrderManager] ✅ ${orders.length} órdenes sincronizadas`);
            return orders;
        } catch (error) {
            console.error('[OrderManager] Error sincronizando órdenes:', error);
            return [];
        }
    }

    /**
     * Crear pedido desde lead de Odoo
     */
    async createOrderFromLead(leadId) {
        try {
            console.log(`[OrderManager] Creando pedido desde lead ${leadId}...`);
            
            const lead = await this.odoo.getLeadById(leadId);
            if (!lead) {
                throw new Error(`Lead ${leadId} no encontrado`);
            }

            this.orderCounter++;
            const order = {
                id: this.orderCounter,
                lead_id: leadId,
                reference: `ORD-${this.orderCounter}`,
                customer: {
                    name: lead.contact_name || lead.name,
                    email: lead.email_from,
                    phone: lead.phone
                },
                amount: lead.expected_revenue || 0,
                status: 'pendiente',
                created_date: new Date().toISOString()
            };

            this.orders.set(order.id, order);
            console.log(`[OrderManager] ✅ Pedido ${order.reference} creado`);
            return order;
        } catch (error) {
            console.error('[OrderManager] Error creando pedido:', error);
            return null;
        }
    }

    /**
     * Obtener todos los pedidos
     */
    getAllOrders() {
        return Array.from(this.orders.values());
    }

    /**
     * Obtener pedido por ID
     */
    getOrder(orderId) {
        return this.orders.get(orderId) || null;
    }
}
```

### 4. Mejorar DriverFleetPanel para sincronizar conductores
**Archivo**: `scripts/fleet/driver-fleet-panel.js`

```javascript
class DriverFleetPanel extends OdooAPIBase {
    constructor(config = {}) {
        super(config);
        this.drivers = new Map();
        this.deliveries = new Map();
        console.log('[DriverFleetPanel] Inicializado');
    }

    /**
     * Sincronizar conductores desde Odoo
     */
    async syncDriversFromOdoo() {
        try {
            console.log('[DriverFleetPanel] Sincronizando conductores...');
            
            const drivers = await this.callOdooAPI('object', 'execute_kw', [
                this.database, this.uid, this.apiKey,
                'fleet.driver', 'search_read',
                [['state', '!=', 'archived']],
                { fields: ['id', 'name', 'state', 'license_start', 'license_expiry'] }
            ]);

            drivers.forEach(driver => this.addDriver(driver));
            console.log(`[DriverFleetPanel] ✅ ${drivers.length} conductores sincronizados`);
            return drivers;
        } catch (error) {
            console.error('[DriverFleetPanel] Error sincronizando conductores:', error);
            return [];
        }
    }

    /**
     * Agregar conductor
     */
    addDriver(driver) {
        this.drivers.set(driver.id, {
            ...driver,
            status: driver.state || 'disponible',
            lat: 9.9281,
            lon: -84.0907
        });
    }

    /**
     * Obtener todos los conductores
     */
    getDrivers() {
        return Array.from(this.drivers.values());
    }
}
```

---

## 📋 Checklist de Implementación

- [ ] Crear `odoo-api-base.js`
- [ ] Actualizar `odoo-connector.js` para heredar de OdooAPIBase
- [ ] Actualizar `order-manager.js` para heredar de OdooAPIBase
- [ ] Actualizar `driver-fleet-panel.js` para heredar de OdooAPIBase
- [ ] Agregar método `syncOrdersFromOdoo()` en OrderManager
- [ ] Agregar método `syncDriversFromOdoo()` en DriverFleetPanel
- [ ] Verificar rutas relativas en HTML (`./scripts/`)
- [ ] Probar en browser
- [ ] Verificar console.log con prefijos [OdooAPI], [OdooConnector], etc.

---

## 🧪 Verificación

En browser console (F12):
```javascript
// Verificar que las clases están disponibles
console.log('OdooAPIBase:', typeof OdooAPIBase);
console.log('OdooConnector:', typeof OdooConnector);
console.log('OrderManager:', typeof OrderManager);
console.log('DriverFleetPanel:', typeof DriverFleetPanel);

// Deberían mostrar: function
```

