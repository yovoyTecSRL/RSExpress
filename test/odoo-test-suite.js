/**
 * Test Suite para Integración Odoo 19
 * Pruebas de validación de funcionalidad
 * Ejecutar en consola del navegador: runAllTests()
 */

class OdooIntegrationTests {
    constructor() {
        this.results = [];
        this.passed = 0;
        this.failed = 0;
    }

    /**
     * Test 1: Verificar que USERS_DB existe y tiene 3 usuarios
     */
    testUsersDB() {
        const name = 'USERS_DB con 3 usuarios';
        try {
            if (!window.app.USERS_DB) {
                throw new Error('USERS_DB no existe');
            }
            
            if (Object.keys(window.app.USERS_DB).length !== 3) {
                throw new Error(`Se esperaban 3 usuarios, se encontraron ${Object.keys(window.app.USERS_DB).length}`);
            }

            const usuarios = Object.keys(window.app.USERS_DB);
            const rolesEsperados = ['CLIENTE', 'DRIVER', 'ADMIN'];
            
            usuarios.forEach(user => {
                const userData = window.app.USERS_DB[user];
                if (!userData.password || !userData.email || !userData.role) {
                    throw new Error(`Usuario ${user} incompleto`);
                }
            });

            this.logPass(name, 'Usuarios cargados correctamente: ' + usuarios.join(', '));
        } catch (error) {
            this.logFail(name, error.message);
        }
    }

    /**
     * Test 2: Verificar que OdooIntegration existe
     */
    testOdooIntegration() {
        const name = 'Clase OdooIntegration disponible';
        try {
            if (!window.odoo) {
                throw new Error('window.odoo no existe');
            }

            if (typeof window.odoo.authenticate !== 'function') {
                throw new Error('Método authenticate no existe');
            }

            if (typeof window.odoo.getUsers !== 'function') {
                throw new Error('Método getUsers no existe');
            }

            if (typeof window.odoo.getUsersTable !== 'function') {
                throw new Error('Método getUsersTable no existe');
            }

            this.logPass(name, `OdooIntegration configurada: ${window.odoo.url}`);
        } catch (error) {
            this.logFail(name, error.message);
        }
    }

    /**
     * Test 3: Verificar elementos HTML para Odoo
     */
    testOdooHTML() {
        const name = 'HTML para Odoo Users disponible';
        try {
            const odooPage = document.getElementById('odooUsersPage');
            if (!odooPage) {
                throw new Error('Página odooUsersPage no existe');
            }

            const btnSync = document.getElementById('btnSyncOdooUsers');
            if (!btnSync) {
                throw new Error('Botón btnSyncOdooUsers no existe');
            }

            const statusEl = document.getElementById('odooConnectionStatus');
            if (!statusEl) {
                throw new Error('Elemento odooConnectionStatus no existe');
            }

            const countEl = document.getElementById('odooUserCount');
            if (!countEl) {
                throw new Error('Elemento odooUserCount no existe');
            }

            const container = document.getElementById('odooUsersContainer');
            if (!container) {
                throw new Error('Contenedor odooUsersContainer no existe');
            }

            this.logPass(name, 'Todos los elementos HTML presentes');
        } catch (error) {
            this.logFail(name, error.message);
        }
    }

    /**
     * Test 4: Verificar menú item Odoo
     */
    testOdooMenuItem() {
        const name = 'Menú item para Odoo disponible';
        try {
            const odooItem = document.querySelector('[data-page="odooUsers"]');
            if (!odooItem) {
                throw new Error('Menu item odooUsers no existe');
            }

            const isHidden = odooItem.style.display === 'none';
            if (!isHidden) {
                throw new Error('Menu item debería estar oculto inicialmente');
            }

            this.logPass(name, 'Menu item encontrado (oculto correctamente)');
        } catch (error) {
            this.logFail(name, error.message);
        }
    }

    /**
     * Test 5: Verificar setupMenuForRole
     */
    testSetupMenuForRole() {
        const name = 'setupMenuForRole funciona correctamente';
        try {
            if (typeof window.app.setupMenuForRole !== 'function') {
                throw new Error('setupMenuForRole no es una función');
            }

            // Simular usuario Admin
            window.app.userRole = 'ADMIN';
            window.app.setupMenuForRole();

            const adminItem = document.querySelector('[data-page="admin"]');
            const odooItem = document.querySelector('[data-page="odooUsers"]');

            if (!adminItem || adminItem.style.display === 'none') {
                throw new Error('Admin no puede ver Panel Admin');
            }

            if (!odooItem || odooItem.style.display === 'none') {
                throw new Error('Admin no puede ver Usuarios Odoo');
            }

            this.logPass(name, 'Admin ve Panel Admin y Usuarios Odoo');
        } catch (error) {
            this.logFail(name, error.message);
        }
    }

    /**
     * Test 6: Verificar navigateTo maneja odooUsers
     */
    testNavigateToOdooUsers() {
        const name = 'navigateTo maneja página odooUsers';
        try {
            const originalMethod = window.app.loadOdooUsersPage;
            let llamado = false;

            window.app.loadOdooUsersPage = function() {
                llamado = true;
            };

            window.app.navigateTo('odooUsers');

            if (!llamado) {
                throw new Error('loadOdooUsersPage no fue llamado');
            }

            window.app.loadOdooUsersPage = originalMethod;
            this.logPass(name, 'navigateTo("odooUsers") funciona');
        } catch (error) {
            this.logFail(name, error.message);
            window.app.loadOdooUsersPage = window.app.loadOdooUsersPage;
        }
    }

    /**
     * Test 7: Verificar método loadOdooUsersPage
     */
    testLoadOdooUsersPage() {
        const name = 'loadOdooUsersPage existe';
        try {
            if (typeof window.app.loadOdooUsersPage !== 'function') {
                throw new Error('loadOdooUsersPage no es una función');
            }

            this.logPass(name, 'Método loadOdooUsersPage disponible');
        } catch (error) {
            this.logFail(name, error.message);
        }
    }

    /**
     * Test 8: Verificar método syncOdooUsers
     */
    testSyncOdooUsers() {
        const name = 'syncOdooUsers existe';
        try {
            if (typeof window.app.syncOdooUsers !== 'function') {
                throw new Error('syncOdooUsers no es una función');
            }

            this.logPass(name, 'Método syncOdooUsers disponible');
        } catch (error) {
            this.logFail(name, error.message);
        }
    }

    /**
     * Test 9: Verificar API Key configurada
     */
    testOdooAPIKey() {
        const name = 'API Key Odoo configurada';
        try {
            if (!window.odoo.api_key) {
                throw new Error('API Key no configurada');
            }

            if (window.odoo.api_key.length < 20) {
                throw new Error('API Key parece inválida');
            }

            const masked = window.odoo.api_key.substring(0, 10) + '...' + 
                          window.odoo.api_key.substring(window.odoo.api_key.length - 4);
            this.logPass(name, `API Key configurada: ${masked}`);
        } catch (error) {
            this.logFail(name, error.message);
        }
    }

    /**
     * Test 10: Verificar URL Odoo
     */
    testOdooURL() {
        const name = 'URL Odoo configurada correctamente';
        try {
            if (!window.odoo.url) {
                throw new Error('URL no configurada');
            }

            if (!window.odoo.url.includes('resexpress.online')) {
                throw new Error('URL debe ser resexpress.online');
            }

            this.logPass(name, `URL: ${window.odoo.url}`);
        } catch (error) {
            this.logFail(name, error.message);
        }
    }

    /**
     * Helper: Log pass
     */
    logPass(testName, details) {
        this.passed++;
        const message = `✅ ${testName}`;
        const detailMessage = details ? ` | ${details}` : '';
        console.log(`%c${message}${detailMessage}`, 'color: green; font-weight: bold;');
        this.results.push({ test: testName, status: 'PASS', details });
    }

    /**
     * Helper: Log fail
     */
    logFail(testName, error) {
        this.failed++;
        const message = `❌ ${testName}`;
        const errorMessage = ` | ${error}`;
        console.log(`%c${message}${errorMessage}`, 'color: red; font-weight: bold;');
        this.results.push({ test: testName, status: 'FAIL', error });
    }

    /**
     * Ejecutar todos los tests
     */
    runAll() {
        console.clear();
        console.log('%c🧪 PRUEBAS DE INTEGRACIÓN ODOO 19', 'font-size: 16px; font-weight: bold; color: #3498db;');
        console.log('%c════════════════════════════════════', 'color: #3498db;');
        console.log('');

        this.testUsersDB();
        this.testOdooIntegration();
        this.testOdooHTML();
        this.testOdooMenuItem();
        this.testSetupMenuForRole();
        this.testNavigateToOdooUsers();
        this.testLoadOdooUsersPage();
        this.testSyncOdooUsers();
        this.testOdooAPIKey();
        this.testOdooURL();

        console.log('');
        console.log('%c════════════════════════════════════', 'color: #3498db;');
        console.log(`%c📊 RESULTADOS: ${this.passed}/${this.passed + this.failed} tests pasaron`, 
            `font-size: 14px; font-weight: bold; color: ${this.failed === 0 ? 'green' : 'orange'};`);
        console.log('');

        if (this.failed === 0) {
            console.log('%c✅ TODAS LAS PRUEBAS PASARON - Integración Odoo lista para usar', 
                'font-size: 12px; color: green; font-weight: bold;');
        } else {
            console.log(`%c⚠️  ${this.failed} PRUEBA(S) FALLARON - Revisar arriba`, 
                'font-size: 12px; color: red; font-weight: bold;');
        }

        return {
            passed: this.passed,
            failed: this.failed,
            total: this.passed + this.failed,
            results: this.results
        };
    }
}

/**
 * Función global para ejecutar tests
 */
window.runAllTests = function() {
    const tester = new OdooIntegrationTests();
    return tester.runAll();
};

/**
 * Función para simular sync de Odoo (prueba de conexión)
 */
window.testOdooConnection = async function() {
    console.log('%c🔗 Probando conexión con Odoo...', 'color: #f39c12; font-weight: bold;');
    
    try {
        const result = await window.odoo.connect();
        if (result) {
            console.log('%c✅ Conexión exitosa', 'color: green; font-weight: bold;');
            console.log(`📊 Usuarios obtenidos: ${window.odoo.users.length}`);
            return true;
        } else {
            throw new Error('Conexión rechazada');
        }
    } catch (error) {
        console.log('%c❌ Error de conexión:', 'color: red; font-weight: bold;');
        console.log(`   ${error.message}`);
        return false;
    }
};

console.log('%c✅ Test Suite Odoo cargado. Ejecuta: runAllTests() o testOdooConnection()', 
    'color: #27ae60; font-weight: bold;');
