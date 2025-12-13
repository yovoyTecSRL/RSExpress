/**
 * OdooConnector Service
 * Servicio para conectar a Odoo 19 via JSON-RPC
 * 
 * Este es el equivalente modular de scripts/odoo/odoo-connector.js
 */

class OdooConnectorService {
  constructor(config = {}) {
    this.config = {
      url: config.url || 'http://localhost:9999',
      endpoint: '/jsonrpc',
      database: config.database || 'odoo19',
      uid: config.uid || 5,
      token: config.token || '1fc63a72dcf97e88aab89c5a8a54dc0eac25cb9b'
    };
    
    this.isConnected = false;
    this.users = [];
    this.partners = [];
    this.lastSync = null;
  }

  /**
   * Método genérico para llamadas JSON-RPC
   */
  async callOdooAPI(service, method, args) {
    try {
      const payload = {
        jsonrpc: '2.0',
        method: 'call',
        params: {
          service: service,
          method: method,
          args: args
        },
        id: Math.random()
      };

      const response = await fetch(`${this.config.url}${this.config.endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.data?.message || data.error.message);
      }

      return data.result;
    } catch (error) {
      console.error('[OdooService] Error:', error);
      throw error;
    }
  }

  /**
   * Verificar conexión con Odoo
   */
  async checkConnection() {
    try {
      const result = await this.callOdooAPI('common', 'version', []);
      if (result && result.server_version) {
        this.isConnected = true;
        console.log(`[OdooService] ✅ Conectado a Odoo ${result.server_version}`);
        return true;
      }
    } catch (error) {
      console.error('[OdooService] ❌ No se pudo conectar:', error);
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Sincronizar usuarios y partners
   */
  async syncUsers() {
    try {
      console.log('[OdooService] 📋 Sincronizando usuarios...');

      const users = await this.callOdooAPI('object', 'execute_kw', [
        this.config.database,
        this.config.uid,
        this.config.token,
        'res.users',
        'search_read',
        [],
        {
          fields: ['id', 'name', 'login', 'email', 'active'],
          limit: 100
        }
      ]);

      const partners = await this.callOdooAPI('object', 'execute_kw', [
        this.config.database,
        this.config.uid,
        this.config.token,
        'res.partner',
        'search_read',
        [],
        {
          fields: ['id', 'name', 'email', 'phone', 'is_company'],
          limit: 100
        }
      ]);

      this.users = users;
      this.partners = partners;
      this.lastSync = new Date();

      console.log(`[OdooService] ✅ Sincronización completada: ${users.length} usuarios, ${partners.length} partners`);
      
      return { users, partners };
    } catch (error) {
      console.error('[OdooService] Error durante sincronización:', error);
      throw error;
    }
  }

  /**
   * Obtener leads
   */
  async getLeads(domain = [], offset = 0, limit = 100) {
    try {
      const result = await this.callOdooAPI('object', 'execute_kw', [
        this.config.database,
        this.config.uid,
        this.config.token,
        'crm.lead',
        'search_read',
        domain,
        {
          fields: ['id', 'name', 'email', 'phone', 'company_id', 'state'],
          offset: offset,
          limit: limit,
          order: 'id DESC'
        }
      ]);

      return result || [];
    } catch (error) {
      console.error('[OdooService] Error obteniendo leads:', error);
      return [];
    }
  }

  /**
   * Obtener lead por ID
   */
  async getLeadById(leadId) {
    try {
      const result = await this.callOdooAPI('object', 'execute_kw', [
        this.config.database,
        this.config.uid,
        this.config.token,
        'crm.lead',
        'read',
        [leadId],
        {}
      ]);

      return result?.[0] || null;
    } catch (error) {
      console.error('[OdooService] Error obteniendo lead:', error);
      return null;
    }
  }

  /**
   * Crear lead de prueba
   */
  async createDefaultLead() {
    try {
      const leadId = await this.callOdooAPI('object', 'execute_kw', [
        this.config.database,
        this.config.uid,
        this.config.token,
        'crm.lead',
        'create',
        [{
          name: 'Lead Test - Browser Session',
          email: 'browser@test.local',
          phone: '+54987654321',
          company_id: 1
        }]
      ]);

      return leadId;
    } catch (error) {
      console.error('[OdooService] Error creando lead:', error);
      return null;
    }
  }

  /**
   * Obtener estadísticas de leads
   */
  async getLeadStats() {
    try {
      // Usar searchCount en lugar de read_group para evitar errores de parámetros
      const stats = {
        total: 0,
        new: 0,
        assigned: 0,
        won: 0,
        lost: 0
      };

      // Contar total de leads
      const totalCount = await this.callOdooAPI('object', 'execute_kw', [
        this.config.database,
        this.config.uid,
        this.config.token,
        'crm.lead',
        'search_count',
        []
      ]);

      stats.total = totalCount || 0;

      // Contar por estado
      const newCount = await this.callOdooAPI('object', 'execute_kw', [
        this.config.database,
        this.config.uid,
        this.config.token,
        'crm.lead',
        'search_count',
        [['state', '=', 'new']]
      ]);
      stats.new = newCount || 0;

      const assignedCount = await this.callOdooAPI('object', 'execute_kw', [
        this.config.database,
        this.config.uid,
        this.config.token,
        'crm.lead',
        'search_count',
        [['state', '=', 'assigned']]
      ]);
      stats.assigned = assignedCount || 0;

      const wonCount = await this.callOdooAPI('object', 'execute_kw', [
        this.config.database,
        this.config.uid,
        this.config.token,
        'crm.lead',
        'search_count',
        [['state', '=', 'won']]
      ]);
      stats.won = wonCount || 0;

      const lostCount = await this.callOdooAPI('object', 'execute_kw', [
        this.config.database,
        this.config.uid,
        this.config.token,
        'crm.lead',
        'search_count',
        [['state', '=', 'lost']]
      ]);
      stats.lost = lostCount || 0;

      return stats;
    } catch (error) {
      console.error('[OdooService] Error obteniendo stats:', error);
      // Retornar stats vacías en lugar de array vacío
      return {
        total: 0,
        new: 0,
        assigned: 0,
        won: 0,
        lost: 0
      };
    }
  }

  /**
   * Obtener usuarios sincronizados
   */
  getUsers() {
    return this.users || [];
  }

  /**
   * Obtener partners sincronizados
   */
  getPartners() {
    return this.partners || [];
  }
}

export default OdooConnectorService;
