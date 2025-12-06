/**
 * 📦 Ejemplos de DeliveryCard para Pérez Zeledón
 * RSExpress - Demostración de tarjetas de entrega con cálculo de tarifas
 */

// Importar ShippingCalculator
const ShippingCalculator = require('../delivery/shipping-calculator');
const calculator = new ShippingCalculator();

/**
 * Función para calcular el costo usando la fórmula de tarifas
 * Fórmula: precio = (distancia ≤ 10) ? 2000 : 2000 + ((distancia - 10) × 200)
 */
function calculateDeliveryCost(distanceKm, isRushHour = false, isExpress = false) {
    return calculator.calculateShippingPrice(distanceKm, isExpress, isRushHour);
}

/**
 * Función para formatear el costo
 */
function formatCost(cost) {
    return '₡' + cost.toLocaleString('es-CR', { maximumFractionDigits: 2 });
}

// Ejemplos de entregas en Pérez Zeledón
const deliveryExamples = [
    {
        id: '#1007',
        cliente: 'María García López',
        descripcion: 'Electrodoméstico - Refrigerador Samsung 550L',
        puntoRetiro: 'Centro Comercial, San Isidro',
        ubicacion: 'La Unión, San Isidro',
        estado: 'pending',
        prioridad: 'normal',
        distancia: '2.5 km',
        costo: formatCost(calculateDeliveryCost(2.5)),
        costoRaw: calculateDeliveryCost(2.5),
        notas: 'Llamar 30 min antes de llegar',
        timeline: [
            { evento: 'Orden creada', timestamp: new Date(Date.now() - 3600000), estado: 'completed' },
            { evento: 'En almacén', timestamp: new Date(Date.now() - 1800000), estado: 'completed' },
            { evento: 'Asignada a conductor', timestamp: new Date(Date.now() - 600000), estado: 'completed' }
        ]
    },
    {
        id: '#1008',
        cliente: 'Roberto Gómez Chávez',
        descripcion: 'Paquete de documentos y suministros',
        puntoRetiro: 'Supermercado Walmart, San Isidro',
        ubicacion: 'Terminal de Autobuses, San Isidro',
        estado: 'in-transit',
        prioridad: 'high',
        distancia: '1.5 km',
        costo: formatCost(calculateDeliveryCost(1.5)),
        costoRaw: calculateDeliveryCost(1.5),
        notas: 'Express - Requiere firma del cliente',
        timeline: [
            { evento: 'Orden creada', timestamp: new Date(Date.now() - 7200000), estado: 'completed' },
            { evento: 'En almacén', timestamp: new Date(Date.now() - 5400000), estado: 'completed' },
            { evento: 'Asignada a conductor', timestamp: new Date(Date.now() - 1800000), estado: 'completed' },
            { evento: 'En ruta', timestamp: new Date(Date.now() - 600000), estado: 'completed' }
        ]
    },
    {
        id: '#1009',
        cliente: 'Software Solutions S.A.',
        descripcion: 'Material de oficina - 10 cajas',
        puntoRetiro: 'Centro Comercial, San Isidro',
        ubicacion: 'Parque Central, Uvita',
        estado: 'completed',
        prioridad: 'normal',
        distancia: '6.93 km',
        costo: formatCost(calculateDeliveryCost(6.93)),
        costoRaw: calculateDeliveryCost(6.93),
        timeline: [
            { evento: 'Orden creada', timestamp: new Date(Date.now() - 14400000), estado: 'completed' },
            { evento: 'Recogida completada', timestamp: new Date(Date.now() - 10800000), estado: 'completed' },
            { evento: 'En ruta', timestamp: new Date(Date.now() - 5400000), estado: 'completed' },
            { evento: 'Entregada', timestamp: new Date(Date.now() - 1800000), estado: 'completed' }
        ]
    },
    {
        id: '#1010',
        cliente: 'Carmen Morales Vega',
        descripcion: 'Compra de medicamentos y artículos',
        puntoRetiro: 'Hospital de Pérez Zeledón, San Isidro',
        ubicacion: 'Restaurante El Castillo, Ojochal',
        estado: 'pending',
        prioridad: 'high',
        distancia: '9.38 km',
        costo: formatCost(calculateDeliveryCost(9.38)),
        costoRaw: calculateDeliveryCost(9.38),
        notas: 'Frágil - Mantener refrigerado',
        timeline: [
            { evento: 'Orden creada', timestamp: new Date(Date.now() - 1800000), estado: 'completed' }
        ]
    },
    {
        id: '#1011',
        cliente: 'Turismo Costa Rica S.A.',
        descripcion: 'Equipamiento para hotel - 5 cajas',
        puntoRetiro: 'Supermercado Walmart, San Isidro',
        ubicacion: 'Marino Ballena National Park, Ojochal',
        estado: 'completed',
        prioridad: 'normal',
        distancia: '11.04 km',
        costo: formatCost(calculateDeliveryCost(11.04)),
        costoRaw: calculateDeliveryCost(11.04),
        timeline: [
            { evento: 'Orden creada', timestamp: new Date(Date.now() - 86400000), estado: 'completed' },
            { evento: 'Recogida completada', timestamp: new Date(Date.now() - 79200000), estado: 'completed' },
            { evento: 'En ruta', timestamp: new Date(Date.now() - 72000000), estado: 'completed' },
            { evento: 'Entregada', timestamp: new Date(Date.now() - 64800000), estado: 'completed' }
        ]
    },
    {
        id: '#1012',
        cliente: 'David López Castillo',
        descripcion: 'Compras del supermercado',
        puntoRetiro: 'Supermercado Walmart, San Isidro',
        ubicacion: 'Colegio San Isidro Labrador, San Isidro',
        estado: 'failed',
        prioridad: 'low',
        distancia: '1.58 km',
        costo: formatCost(calculateDeliveryCost(1.58)),
        costoRaw: calculateDeliveryCost(1.58),
        notas: 'Cliente no disponible - Reintentar mañana',
        timeline: [
            { evento: 'Orden creada', timestamp: new Date(Date.now() - 3600000), estado: 'completed' },
            { evento: 'En almacén', timestamp: new Date(Date.now() - 2400000), estado: 'completed' },
            { evento: 'Intento de entrega fallido', timestamp: new Date(Date.now() - 600000), estado: 'completed' }
        ]
    }
];

/**
 * Función para renderizar todas las entregas de ejemplo
 */
function renderDeliveryExamples() {
    const container = document.getElementById('deliveryExamplesContainer');
    
    if (!container) {
        console.log('⚠️  Contenedor no encontrado. Creando uno...');
        const newContainer = document.createElement('div');
        newContainer.id = 'deliveryExamplesContainer';
        newContainer.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(550px, 1fr));
            gap: 20px;
            padding: 20px;
            background: #f5f5f5;
            border-radius: 8px;
            margin: 20px 0;
        `;
        document.body.appendChild(newContainer);
    }

    deliveryExamples.forEach(data => {
        const delivery = new DeliveryCard(data);
        const container = document.getElementById('deliveryExamplesContainer');
        container.appendChild(delivery.render());
    });

    console.log(`✅ ${deliveryExamples.length} entregas de ejemplo renderizadas`);
}

/**
 * Función para mostrar estadísticas de las entregas
 */
function showDeliveryStats() {
    console.log('\n📊 ESTADÍSTICAS DE ENTREGAS - PÉREZ ZELEDÓN');
    console.log('='.repeat(60));
    
    const total = deliveryExamples.length;
    const completed = deliveryExamples.filter(d => d.estado === 'completed').length;
    const inTransit = deliveryExamples.filter(d => d.estado === 'in-transit').length;
    const pending = deliveryExamples.filter(d => d.estado === 'pending').length;
    const failed = deliveryExamples.filter(d => d.estado === 'failed').length;
    
    const totalDistance = deliveryExamples.reduce((sum, d) => {
        const km = parseFloat(d.distancia);
        return sum + (isNaN(km) ? 0 : km);
    }, 0);
    
    const totalCost = deliveryExamples.reduce((sum, d) => {
        return sum + (d.costoRaw || 0);
    }, 0);
    
    console.log(`\n📦 Total de entregas: ${total}`);
    console.log(`   ✅ Completadas: ${completed}`);
    console.log(`   🚚 En tránsito: ${inTransit}`);
    console.log(`   ⏳ Pendientes: ${pending}`);
    console.log(`   ❌ Fallidas: ${failed}`);
    console.log(`\n📏 Distancia total: ${totalDistance.toFixed(2)} km`);
    console.log(`💰 Costo total: ₡${totalCost.toLocaleString('es-CR')}`);
    console.log(`📊 Costo promedio: ₡${(totalCost / total).toLocaleString('es-CR', { maximumFractionDigits: 2 })}`);
    console.log('\n' + '='.repeat(60));
}

/**
 * Inicializar cuando el DOM esté listo
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        renderDeliveryExamples();
        showDeliveryStats();
    });
} else {
    renderDeliveryExamples();
    showDeliveryStats();
}

// Exportar para uso global
window.deliveryExamples = deliveryExamples;
window.renderDeliveryExamples = renderDeliveryExamples;
window.showDeliveryStats = showDeliveryStats;
