/**
 * Script de verificación de stats
 * Copia y pega esto en la consola del navegador (F12 → Console)
 * para verificar que los stats se están sincronizando correctamente
 */

console.group('🔍 VERIFICACIÓN DE STATS');

// 1. Verificar array de deliveries
console.log('📦 Array de deliveries:');
console.log(`   Total de deliveries: ${deliveries.length}`);
console.table(deliveries.map(d => ({
    id: d.id,
    cliente: d.cliente,
    estado: d.estado,
    prioridad: d.prioridad
})));

// 2. Calcular stats manualmente
const stats = {
    total: deliveries.length,
    pending: deliveries.filter(d => d.estado === 'pending' || d.estado === 'pendiente').length,
    transit: deliveries.filter(d => d.estado === 'in-transit' || d.estado === 'en-transito').length,
    completed: deliveries.filter(d => d.estado === 'completed' || d.estado === 'entregada').length,
    failed: deliveries.filter(d => d.estado === 'failed' || d.estado === 'fallida').length
};

console.log('\n📊 STATS CALCULADOS:');
console.table(stats);

// 3. Verificar elementos DOM
console.log('\n🎯 ELEMENTOS DOM EN FLOATING PANEL:');
const elements = {
    'float-failed': document.getElementById('float-failed'),
    'float-pending': document.getElementById('float-pending'),
    'float-transit': document.getElementById('float-transit'),
    'float-completed': document.getElementById('float-completed'),
    'float-total': document.getElementById('float-total')
};

Object.entries(elements).forEach(([id, element]) => {
    if (element) {
        console.log(`✅ ${id}: EXISTE - Valor actual: "${element.textContent}"`);
    } else {
        console.error(`❌ ${id}: NO EXISTE EN DOM`);
    }
});

// 4. Verificar elementos alternativos en header
console.log('\n🎯 ELEMENTOS DOM EN HEADER (si existen):');
const headerElements = {
    'stat-total': document.getElementById('stat-total'),
    'stat-pending': document.getElementById('stat-pending'),
    'stat-transit': document.getElementById('stat-transit'),
    'stat-completed': document.getElementById('stat-completed'),
    'stat-failed': document.getElementById('stat-failed')
};

Object.entries(headerElements).forEach(([id, element]) => {
    if (element) {
        console.log(`✅ ${id}: EXISTE - Valor actual: "${element.textContent}"`);
    }
});

// 5. Llamar updateStats() nuevamente
console.log('\n🔄 EJECUTANDO updateStats() NUEVAMENTE...');
updateStats();

console.log('\n✅ VERIFICACIÓN COMPLETADA');
console.log('Si ves "📊 Actualizando stats:" arriba, updateStats() se está ejecutando correctamente');
console.groupEnd();

// 6. Monitorear cambios en tiempo real
console.log('\n👁️ MONITOREO EN TIEMPO REAL:');
console.log('Abre el panel de Network, aplica filtros, y verifica que se actualice');
console.log('Cada vez que hagas un cambio, deberías ver "📊 Actualizando stats:" en la consola');
