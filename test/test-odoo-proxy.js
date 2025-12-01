/**
 * Test del Proxy Odoo
 * Ejecutar en la consola del navegador: testOdooProxy()
 */

async function testOdooProxy() {
    console.log('═══════════════════════════════════════');
    console.log('🔍 TEST PROXY ODOO');
    console.log('═══════════════════════════════════════');
    
    try {
        // Test 1: Verificar que el proxy está disponible
        console.log('\n1️⃣  Verificando disponibilidad del proxy...');
        const proxyUrl = 'http://localhost:9999/jsonrpc';
        
        const testPayload = {
            jsonrpc: '2.0',
            method: 'call',
            params: {
                service: 'common',
                method: 'version',
                args: []
            },
            id: 1
        };
        
        console.log('   📤 Enviando solicitud a:', proxyUrl);
        console.log('   📋 Payload:', testPayload);
        
        const response = await fetch(proxyUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testPayload)
        });
        
        console.log('   ✅ Respuesta HTTP:', response.status, response.statusText);
        
        const data = await response.json();
        console.log('   📥 Datos recibidos:', data);
        
        if (data.error) {
            console.error('   ❌ Error en respuesta:', data.error);
            return false;
        }
        
        console.log('\n✅ PROXY FUNCIONANDO CORRECTAMENTE');
        console.log('   Versión Odoo:', data.result);
        
        return true;
        
    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        console.error('   Stack:', error.stack);
        return false;
    }
}

async function testOdooUsers() {
    console.log('\n═══════════════════════════════════════');
    console.log('👥 TEST SINCRONIZACIÓN DE USUARIOS');
    console.log('═══════════════════════════════════════');
    
    try {
        if (!window.odooIntegration) {
            console.error('❌ window.odooIntegration no existe');
            return;
        }
        
        console.log('\n1️⃣  Intentando sincronizar usuarios...');
        await window.odooIntegration.syncUsers();
        
        console.log('\n✅ Usuarios sincronizados');
        console.log('   Total:', window.odooIntegration.users.length);
        console.log('   Usuarios:', window.odooIntegration.users);
        
    } catch (error) {
        console.error('\n❌ ERROR al sincronizar:', error.message);
        console.error('   Stack:', error.stack);
    }
}

console.log('✅ Test functions cargadas');
console.log('   Ejecuta: testOdooProxy()');
console.log('   Ejecuta: testOdooUsers()');
