#!/usr/bin/env node

/**
 * Mock Leads Data Generator
 * Genera leads de prueba para demostrar que el sistema funciona
 */

// Datos de prueba basados en patrones reales de Odoo
const mockLeads = [
  {
    id: 1,
    name: 'Empresa Logística ABC',
    email: 'contacto@logisticaabc.com',
    phone: '+34 912 345 678',
    state: 'new',
    priority: 'high',
    description: 'Necesita servicio de entregas urgentes en Madrid'
  },
  {
    id: 2,
    name: 'Tienda Retail XYZ',
    email: 'info@retailxyz.es',
    phone: '+34 913 456 789',
    state: 'assigned',
    priority: 'normal',
    description: 'Distribución diaria de inventario a 5 sucursales'
  },
  {
    id: 3,
    name: 'E-Commerce FastShip',
    email: 'logistics@fastship.com',
    phone: '+34 914 567 890',
    state: 'won',
    priority: 'high',
    description: 'Contrato mensual para 500+ entregas/mes'
  },
  {
    id: 4,
    name: 'Peluquería Premium Barcelona',
    email: 'admin@pelu-premium.cat',
    phone: '+34 933 567 890',
    state: 'lost',
    priority: 'low',
    description: 'Cliente pequeño, no cumple requisitos mínimos'
  },
  {
    id: 5,
    name: 'Farmacia Central Valencia',
    email: 'gerente@farmacentral.es',
    phone: '+34 961 234 567',
    state: 'new',
    priority: 'normal',
    description: 'Entregas de medicamentos a domicilio'
  },
  {
    id: 6,
    name: 'Hotel Boutique Sevilla',
    email: 'reservas@hotelboutique.es',
    phone: '+34 954 123 456',
    state: 'assigned',
    priority: 'normal',
    description: 'Servicio de room service y entregas de proveedores'
  },
  {
    id: 7,
    name: 'Restaurante Gourmet Bilbao',
    email: 'chef@gourmetchef.es',
    phone: '+34 944 123 456',
    state: 'won',
    priority: 'high',
    description: 'Entregas de insumos frescos diarios'
  },
  {
    id: 8,
    name: 'Boutique de Ropa Valencia',
    email: 'ventas@boutiquemoda.es',
    phone: '+34 962 123 456',
    state: 'new',
    priority: 'normal',
    description: 'Envío de pedidos online a nivel nacional'
  }
];

// Mostrar información
console.log('\n📦 MOCK LEADS DATA - RSExpress CRM\n');
console.log('═'.repeat(70));
console.log(`Total de leads en caché: ${mockLeads.length}\n`);

// Estadísticas
const stats = {
  new: mockLeads.filter(l => l.state === 'new').length,
  assigned: mockLeads.filter(l => l.state === 'assigned').length,
  won: mockLeads.filter(l => l.state === 'won').length,
  lost: mockLeads.filter(l => l.state === 'lost').length
};

console.log('📊 ESTADÍSTICAS POR ESTADO:\n');
console.log(`   📋 Nuevos (new):      ${stats.new}`);
console.log(`   🚗 Asignados (assigned): ${stats.assigned}`);
console.log(`   ✅ Ganados (won):     ${stats.won}`);
console.log(`   ❌ Perdidos (lost):   ${stats.lost}\n`);

// Mostrar leads
console.log('📋 LEADS DISPONIBLES:\n');
mockLeads.forEach((lead, index) => {
  const stateEmoji = {
    'new': '📝',
    'assigned': '🚗',
    'won': '✅',
    'lost': '❌'
  }[lead.state] || '❓';

  const priorityEmoji = {
    'low': '📍',
    'normal': '📌',
    'high': '🔴',
    'urgent': '🆘'
  }[lead.priority] || '❓';

  console.log(`${index + 1}. ${lead.name}`);
  console.log(`   ${stateEmoji} Estado: ${lead.state.toUpperCase()}`);
  console.log(`   ${priorityEmoji} Prioridad: ${lead.priority.toUpperCase()}`);
  console.log(`   📧 Email: ${lead.email}`);
  console.log(`   📱 Teléfono: ${lead.phone}`);
  console.log(`   📝 Descripción: ${lead.description}`);
  console.log('');
});

console.log('═'.repeat(70));
console.log('\n✅ Los leads están listos para ser cargados en OrdersFromCRM');
console.log('   Abre http://localhost:7777 para ver la aplicación React\n');

// Exportar datos como JSON para uso en JavaScript
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { mockLeads, stats };
}
