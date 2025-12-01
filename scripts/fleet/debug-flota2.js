// Ejecutar en consola del navegador
console.clear();
console.log('%c🔍 DEBUG COMPLETO FLOTA v2', 'font-size: 14px; color: #FF6B35; font-weight: bold');

// 1. Verificar estado del panel
console.log('\n1️⃣ ESTADO DEL PANEL:');
console.log('   Drivers (size):', window.driverFleetPanel.drivers.size);
console.log('   Deliveries (size):', window.driverFleetPanel.deliveries.size);

// 2. Listar todos los drivers
console.log('\n2️⃣ LISTADO DE DRIVERS:');
if (window.driverFleetPanel.drivers.size > 0) {
    let i = 1;
    window.driverFleetPanel.drivers.forEach((driver, id) => {
        console.log(`   ${i}. ID: ${id}, Name: ${driver.name}, Status: ${driver.status}`);
        i++;
    });
} else {
    console.log('   ❌ SIN DRIVERS');
}

// 3. Listar todas las deliveries
console.log('\n3️⃣ LISTADO DE DELIVERIES:');
if (window.driverFleetPanel.deliveries.size > 0) {
    let i = 1;
    window.driverFleetPanel.deliveries.forEach((delivery, id) => {
        console.log(`   ${i}. ID: ${id}, Address: ${delivery.address}, Status: ${delivery.status}`);
        i++;
    });
} else {
    console.log('   ❌ SIN DELIVERIES');
}

// 4. Snapshot
console.log('\n4️⃣ SNAPSHOT:');
const snap = getFleetSnapshot();
console.log('   Total Drivers:', snap.drivers.length);
console.log('   Total Deliveries:', snap.deliveries.length);

// 5. Intenta agregar un test delivery manualmente
console.log('\n5️⃣ PRUEBA MANUAL - AGREGAR DELIVERY:');
try {
    const testDelivery = {
        id: 9999,
        address: 'TEST Dirección Manual',
        client: 'TEST Cliente',
        lat: 9.93,
        lon: -84.09,
        status: 'pendiente',
        priority: 'alta',
        assignedDriver: null
    };
    console.log('   Antes - Deliveries:', window.driverFleetPanel.deliveries.size);
    window.driverFleetPanel.addDelivery(testDelivery);
    console.log('   Después - Deliveries:', window.driverFleetPanel.deliveries.size);
    console.log('   ✅ Delivery agregado exitosamente');
} catch (e) {
    console.error('   ❌ Error:', e);
}

// 6. Snapshot nuevamente
console.log('\n6️⃣ SNAPSHOT DESPUÉS DE PRUEBA:');
const snap2 = getFleetSnapshot();
console.log('   Total Drivers:', snap2.drivers.length);
console.log('   Total Deliveries:', snap2.deliveries.length);

console.log('\n%c✅ DEBUG COMPLETADO', 'font-size: 12px; color: #4CAF50');
