/**
 * Odoo Connector - Integración CRM Odoo con RSExpress
 * Maneja la conexión y sincronización con Odoo via JSON-RPC
 * Endpoint: https://rsexpress.online/jsonrpc
 */

class OdooConnector {
    constructor(config = {}) {
        this.config = {
            // Usar proxy local si está disponible, sino usa rsexpress.online directamente
            url: config.url || (typeof window === 'undefined' ? 'https://rsexpress.online' : 'http://localhost:9999'),
            endpoint: '/jsonrpc',
            database: config.database || 'odoo19',
            uid: config.uid || 5,  // User ID para rsexpress.online
            token: config.token || '1fc63a72dcf97e88aab89c5a8a54dc0eac25cb9b'  // Session token
        };
        
        this.isConnected = true; // Ya autenticado en rsexpress.online
        this.cache = new Map();
        this.cacheTimeout = 300000; // 5 minutos
        this.requestId = 0;
        this.proxyMode = this.config.url.includes('localhost:9999');
        
        console.log(`🔗 OdooConnector inicializado ${this.proxyMode ? '(Via Proxy Local)' : '(Direct)'}:`, this.config.url);
    }
    
    /**
     * Conectar a Odoo (rsexpress.online usa autenticación por token)
     */
    async connect() {
        try {
            console.log('🔄 Verificando conexión a Odoo rsexpress.online...');
            
            // Verificar conexión haciendo un RPC simple
            const result = await this.rpc('res.partner', 'search', [[]], {});
            
            if (Array.isArray(result)) {
                this.isConnected = true;
                console.log('✅ Conectado a Odoo rsexpress.online');
                return true;
            } else {
                console.error('❌ Error de verificación en Odoo:', result);
                return false;
            }
        } catch (error) {
            console.error('❌ Error conectando a Odoo:', error);
            this.isConnected = false;
            return false;
        }
    }
    
    /**
     * Llamar método RPC de Odoo via JSON-RPC
     */
    async rpc(model, method, args = [], kwargs = {}) {
        if (!this.config.token) {
            throw new Error('Token de sesión no configurado');
        }
        
        try {
            this.requestId++;
            const payload = {
                jsonrpc: '2.0',
                method: 'call',
                params: {
                    service: 'object',
                    method: 'execute_kw',
                    args: [
                        this.config.database,
                        this.config.uid,
                        this.config.token,
                        model,
                        method,
                        args
                    ]
                },
                id: this.requestId
            };
            
            // Agregar kwargs si existen
            if (Object.keys(kwargs).length > 0) {
                payload.params.args.push(kwargs);
            }
            
            const response = await fetch(`${this.config.url}${this.config.endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            
            const data = await response.json();
            
            if (data.error) {
                console.error(`❌ RPC Error (${model}.${method}):`, data.error);
                throw new Error(`RPC Error: ${data.error.message}`);
            }
            
            return data.result;
        } catch (error) {
            console.error(`❌ Error en RPC (${model}.${method}):`, error);
            throw error;
        }
    }
    
    /**
     * Obtener todos los leads del CRM
     */
    async getLeads(filters = [], offset = 0, limit = 10) {
        try {
            console.log(`📋 Obteniendo leads (offset: ${offset}, limit: ${limit})...`);
            
            // Campos a obtener del lead
            const fields = [
                'id', 'name', 'email_from', 'phone', 'contact_name',
                'description', 'stage_id', 'user_id', 'create_date',
                'city', 'country_id', 'date_deadline',
                'expected_revenue', 'probability', 'lost_reason_id', 'active',
                'company_id', 'date_closed'
            ];
            
            // Construir filtros
            const domain = filters.length > 0 ? filters : [];
            
            // Primero: buscar IDs de leads
            const leadIds = await this.rpc(
                'crm.lead',
                'search',
                [domain],
                { offset: offset, limit: limit }
            );
            
            console.log(`🔍 Encontrados ${leadIds.length} leads`);
            
            // Luego: obtener datos de los leads
            if (leadIds.length === 0) {
                console.log('⚠️ No hay leads disponibles');
                return [];
            }
            
            const leads = await this.rpc(
                'crm.lead',
                'read',
                [leadIds, fields],
                {}
            );
            
            console.log(`✅ Se obtuvieron ${leads.length} leads`);
            return leads;
        } catch (error) {
            console.error('❌ Error obteniendo leads:', error);
            return [];
        }
    }
    
    /**
     * Crear un lead por defecto para pruebas
     */
    async createDefaultLead() {
        try {
            const leadData = {
                name: 'Lead de Prueba - RSExpress',
                email_from: 'test@rsexpress.local',
                phone: '+541234567890',
                contact_name: 'Cliente Test',
                description: 'Lead creado automáticamente por RSExpress - ' + new Date().toISOString(),
                stage_id: 1,  // Nuevo
                probability: 20,
                city: 'Buenos Aires',
                country_id: false  // Sin país específico
            };
            
            console.log('📝 Creando lead por defecto...', leadData);
            
            const leadId = await this.rpc(
                'crm.lead',
                'create',
                [leadData]
            );
            
            console.log(`✅ Lead creado con ID: ${leadId}`);
            
            // Obtener el lead creado
            const lead = await this.getLeadById(leadId);
            return lead;
        } catch (error) {
            console.error('❌ Error creando lead por defecto:', error);
            return null;
        }
    }
    
    /**
     * Obtener lead por ID
     */
    async getLeadById(leadId) {
        try {
            const cacheKey = `lead_${leadId}`;
            
            // Verificar cache
            if (this.cache.has(cacheKey)) {
                const cached = this.cache.get(cacheKey);
                if (Date.now() - cached.timestamp < this.cacheTimeout) {
                    console.log(`📦 Lead ${leadId} obtenido del cache`);
                    return cached.data;
                }
            }
            
            console.log(`🔍 Obteniendo lead ${leadId}...`);
            
            const fields = [
                'id', 'name', 'email_from', 'phone', 'contact_name',
                'description', 'stage_id', 'user_id', 'create_date',
                'city', 'country_id', 'date_deadline',
                'expected_revenue', 'probability', 'lost_reason_id', 'active',
                'company_id', 'date_closed'
            ];
            
            const leads = await this.rpc(
                'crm.lead',
                'read',
                [[leadId], fields],
                {}
            );
            
            const lead = leads[0] || null;
            
            if (lead) {
                // Guardar en cache
                this.cache.set(cacheKey, {
                    data: lead,
                    timestamp: Date.now()
                });
                console.log(`✅ Lead ${leadId} obtenido correctamente`);
            }
            
            return lead;
        } catch (error) {
            console.error(`❌ Error obteniendo lead ${leadId}:`, error);
            return null;
        }
    }
    
    /**
     * Crear nuevo lead en Odoo
     */
    async createLead(leadData) {
        try {
            console.log('📝 Creando nuevo lead en Odoo...');
            
            const data = {
                name: leadData.name || 'Sin nombre',
                email_from: leadData.email || '',
                phone: leadData.phone || '',
                company_name: leadData.company || '',
                contact_name: leadData.contact || '',
                description: leadData.description || '',
                city: leadData.city || '',
                country_id: leadData.country || false
            };
            
            const leadId = await this.rpc('crm.lead', 'create', [data], {});
            
            console.log(`✅ Lead creado con ID: ${leadId}`);
            return leadId;
        } catch (error) {
            console.error('❌ Error creando lead:', error);
            return null;
        }
    }
    
    /**
     * Actualizar lead en Odoo
     */
    async updateLead(leadId, leadData) {
        try {
            console.log(`✏️ Actualizando lead ${leadId}...`);
            
            const result = await this.rpc('crm.lead', 'write', [
                [leadId],
                leadData
            ], {});
            
            if (result) {
                // Limpiar cache
                this.cache.delete(`lead_${leadId}`);
                console.log(`✅ Lead ${leadId} actualizado`);
            }
            
            return result;
        } catch (error) {
            console.error(`❌ Error actualizando lead ${leadId}:`, error);
            return false;
        }
    }
    
    /**
     * Convertir lead en cliente/pedido
     */
    async convertLeadToOrder(leadId, orderData) {
        try {
            console.log(`🔄 Convirtiendo lead ${leadId} a pedido...`);
            
            // Obtener datos del lead
            const lead = await this.getLeadById(leadId);
            if (!lead) throw new Error(`Lead ${leadId} no encontrado`);
            
            // Datos del pedido
            const order = {
                lead_id: leadId,
                customer_name: lead.contact_name || lead.name,
                customer_email: lead.email_from,
                customer_phone: lead.phone,
                customer_address: lead.city,
                description: lead.description || orderData.description || '',
                amount: orderData.amount || lead.expected_revenue || 0,
                notes: orderData.notes || '',
                status: 'pendiente',
                created_at: new Date().toISOString(),
                source: 'crm'
            };
            
            console.log(`✅ Lead ${leadId} convertido a pedido`, order);
            return order;
        } catch (error) {
            console.error(`❌ Error convirtiendo lead:`, error);
            return null;
        }
    }
    
    /**
     * Obtener estadísticas de leads
     */
    async getLeadStats() {
        try {
            console.log('📊 Obteniendo estadísticas de leads...');
            
            // Total de leads
            const totalLeads = await this.rpc('crm.lead', 'search_count', [[]], {});
            
            // Leads activos
            const activeLeads = await this.rpc('crm.lead', 'search_count', [
                [['active', '=', true]]
            ], {});
            
            // Leads ganados
            const wonLeads = await this.rpc('crm.lead', 'search_count', [
                [['probability', '=', 100]]
            ], {});
            
            // Leads perdidos
            const lostLeads = await this.rpc('crm.lead', 'search_count', [
                [['active', '=', false]]
            ], {});
            
            const stats = {
                total: totalLeads,
                active: activeLeads,
                won: wonLeads,
                lost: lostLeads,
                pending: activeLeads - wonLeads
            };
            
            console.log('✅ Estadísticas obtenidas:', stats);
            return stats;
        } catch (error) {
            console.error('❌ Error obteniendo estadísticas:', error);
            return null;
        }
    }
    
    /**
     * Sincronizar leads con la base de datos local
     */
    async syncLeads(callback) {
        try {
            console.log('🔄 Iniciando sincronización de leads...');
            
            let offset = 0;
            const limit = 20;
            let totalSynced = 0;
            let hasMore = true;
            
            while (hasMore) {
                const leads = await this.getLeads([], offset, limit);
                
                if (leads.length === 0) {
                    hasMore = false;
                } else {
                    totalSynced += leads.length;
                    
                    if (callback) {
                        callback({
                            leads: leads,
                            offset: offset,
                            total: totalSynced,
                            hasMore: leads.length === limit
                        });
                    }
                    
                    offset += limit;
                }
            }
            
            console.log(`✅ Sincronización completada: ${totalSynced} leads sincronizados`);
            return totalSynced;
        } catch (error) {
            console.error('❌ Error en sincronización:', error);
            return 0;
        }
    }
    
    /**
     * Desconectar de Odoo
     */
    disconnect() {
        this.isConnected = false;
        this.cache.clear();
        console.log('🔌 Desconectado de Odoo');
    }
}

// Exportar para uso en navegador
if (typeof window !== 'undefined') {
    window.OdooConnector = OdooConnector;
}

// Exportar para Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OdooConnector;
}
