/**
 * Script de diagnóstico para depuración de conexión Traccar
 * Ejecutar en consola del navegador
 */

console.log('=== DIAGNÓSTICO RS EXPRESS ===\n');

// 1. Verificar si los elementos HTML existen
console.log('1. ELEMENTOS HTML:');
const bulb = document.getElementById('connectionBulb');
console.log('   - connectionBulb existe:', !!bulb);
if (bulb) {
    console.log('     Classes:', bulb.className);
    console.log('     Styles:', window.getComputedStyle(bulb).cssText);
}

const tooltip = document.getElementById('bulbTooltip');
console.log('   - bulbTooltip existe:', !!tooltip);

// 2. Verificar si las clases están disponibles
console.log('\n2. CLASES JAVASCRIPT:');
console.log('   - window.app existe:', !!window.app);
console.log('   - TraccarIntegration disponible:', typeof TraccarIntegration !== 'undefined');
console.log('   - TRACCAR_CONFIG disponible:', typeof TRACCAR_CONFIG !== 'undefined');

// 3. Estado de la conexión
console.log('\n3. ESTADO DE CONEXIÓN:');
if (window.app) {
    console.log('   - Estado actual:', window.app.connectionStatus);
    console.log('   - Instancia Traccar:', !!window.app.traccar);
    if (window.app.traccar) {
        console.log('   - Traccar conectado:', window.app.traccar.isConnected);
        console.log('   - Dispositivos cargados:', window.app.traccar.devices.size);
    }
}

// 4. Función para probar conexión manual
console.log('\n4. COMANDOS DE PRUEBA:');
console.log('   Ejecutar: debugTraccar()');

function debugTraccar() {
    console.log('\n--- Prueba de conexión Traccar ---');
    
    if (!window.app) {
        console.error('ERROR: window.app no existe');
        return;
    }
    
    if (!window.app.traccar) {
        console.log('Iniciando Traccar manualmente...');
        window.app.initTraccar().then(() => {
            console.log('Traccar inicializado');
        }).catch(e => {
            console.error('Error al inicializar Traccar:', e);
        });
    } else {
        console.log('Traccar ya está inicializado');
        console.log('Estado de conexión:', window.app.connectionStatus);
        console.log('Conectado:', window.app.traccar.isConnected);
    }
}

// 5. Función para cambiar estado manualmente (prueba de UI)
console.log('   Ejecutar: testConnectionStatus("connected"|"connecting"|"disconnected")');

function testConnectionStatus(status) {
    console.log(`\nCambiando estado a: ${status}`);
    if (window.app) {
        window.app.updateConnectionStatus(status);
        console.log('Estado actualizado en UI');
    }
}

// 6. Verificar configuración de Traccar
console.log('\n5. CONFIGURACIÓN TRACCAR:');
if (typeof TRACCAR_CONFIG !== 'undefined') {
    console.log('   - API Key configurada:', TRACCAR_CONFIG.API_KEY ? 'SÍ' : 'NO');
    console.log('   - Ambiente:', TRACCAR_CONFIG.DEFAULT_ENVIRONMENT);
    console.log('   - Base URL:', TRACCAR_CONFIG.ENVIRONMENTS[TRACCAR_CONFIG.DEFAULT_ENVIRONMENT].baseUrl);
}

console.log('\n=== FIN DIAGNÓSTICO ===');
