#!/usr/bin/env node

/**
 * Load Leads from Odoo 19 CRM
 * Script para cargar leads desde el CRM Odoo
 */

import axios from 'axios';

const ODOO_URL = 'http://localhost:9999';
const ODOO_DB = 'odoo19';
const ODOO_UID = 5;
const ODOO_TOKEN = '1fc63a72dcf97e88aab89c5a8a54dc0eac25cb9b';

async function loadLeads() {
  try {
    console.log('🔄 Cargando leads desde Odoo CRM...\n');
    
    // Endpoint para obtener leads
    const response = await axios.post(`${ODOO_URL}/web/dataset/call_kw`, {
      jsonrpc: '2.0',
      method: 'call',
      params: {
        service: 'object',
        method: 'execute_kw',
        args: [
          ODOO_DB,
          ODOO_UID,
          ODOO_TOKEN,
          'crm.lead',
          'search_read',
          [],
          {
            fields: ['id', 'name', 'email', 'phone', 'state', 'priority', 'description', 'company_name'],
            limit: 50
          }
        ]
      }
    });

    if (response.data.result) {
      const leads = response.data.result;
      console.log(`✅ ${leads.length} leads cargados:\n`);
      
      leads.forEach((lead, index) => {
        console.log(`${index + 1}. ${lead.name}`);
        console.log(`   📧 Email: ${lead.email || 'N/A'}`);
        console.log(`   📱 Phone: ${lead.phone || 'N/A'}`);
        console.log(`   📊 State: ${lead.state || 'N/A'}`);
        console.log(`   ⚡ Priority: ${lead.priority || 'N/A'}`);
        console.log('');
      });

      return leads;
    } else {
      console.log('⚠️  Error:', response.data.error?.message);
      return [];
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    return [];
  }
}

// Ejecutar
loadLeads();
