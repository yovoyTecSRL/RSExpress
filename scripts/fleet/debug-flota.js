/**
 * DEBUGUADOR - PANEL DE FLOTA
 * Ejecutar en consola: F12 → Copiar contenido de este archivo
 */

console.clear();
console.log('%c🔍 DEBUGUADOR DE FLOTA - INICIANDO...', 'font-size: 16px; color: #FF6B35; font-weight: bold');

// 1. Verificar panel
console.log('\n📦 VERIFICAR PANEL:');
console.log('  Panel existe:', !!window.driverFleetPanel);
console.log('  Drivers (Map):', window.driverFleetPanel?.drivers);
console.log('  Deliveries (Map):', window.driverFleetPanel?.deliveries);
console.log('  Drivers size:', window.driverFleetPanel?.drivers?.size || 0);
console.log('  Deliveries size:', window.driverFleetPanel?.deliveries?.size || 0);

// 2. Intentar agregar un conductor de prueba
console.log('\n🧪 PRUEBA - AGREGAR CONDUCTOR:');
if (window.driverFleetPanel) {
    const testDriver = {
        id: 999,
        name: 'TEST Conductor',
        status: 'activo',
        lat: 9.9281,
        lon: -84.0907,
        completedDeliveries: 5,
        totalDistance: 50,
        efficiency: 85
    };
    
    console.log('  Antes - Drivers:', window.driverFleetPanel.drivers.size);
    window.driverFleetPanel.addDriver(testDriver);
    console.log('  Después - Drivers:', window.driverFleetPanel.drivers.size);
    console.log('  Driver agregado:', window.driverFleetPanel.drivers.get(999));
}

// 3. Intentar agregar una entrega de prueba
console.log('\n🧪 PRUEBA - AGREGAR ENTREGA:');
if (window.driverFleetPanel) {
    const testDelivery = {
        id: 9999,
        address: 'TEST Dirección',
        client: 'TEST Cliente',
        lat: 9.93,
        lon: -84.09,
        status: 'pendiente',
        priority: 'alta',
        assignedDriver: null
    };
    
    console.log('  Antes - Deliveries:', window.driverFleetPanel.deliveries.size);
    window.driverFleetPanel.addDelivery(testDelivery);
    console.log('  Después - Deliveries:', window.driverFleetPanel.deliveries.size);
    console.log('  Delivery agregado:', window.driverFleetPanel.deliveries.get(9999));
}

// 4. Verificar snapshot
console.log('\n📸 VERIFICAR SNAPSHOT:');
const snapshot = getFleetSnapshot();
console.log('  Snapshot:', snapshot);
console.log('  Drivers en snapshot:', snapshot?.drivers?.length || 0);
console.log('  Deliveries en snapshot:', snapshot?.deliveries?.length || 0);

// 5. Verificar si createTestFleetData fue llamado
console.log('\n📋 VERIFICAR createTestFleetData:');
console.log('  Función existe:', typeof createTestFleetData === 'function');

console.log('\n%c✅ DEBUG COMPLETADO', 'font-size: 14px; color: #4CAF50; font-weight: bold');

