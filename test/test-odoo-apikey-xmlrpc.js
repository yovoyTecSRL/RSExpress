const xmlrpc = require('xmlrpc');

// Configuración de conexión a Odoo
const ODOO_HOST = 'rsexpress.online';
const ODOO_DB = 'odoo19';
const API_KEY = 'fee30b46503e2c2e498fd5ad29de5b03cec19f0f';

console.log('🔍 Iniciando prueba de conexión a Odoo 19 con API Key (como contraseña)...\n');
console.log('📋 Configuración:');
console.log(`   Host: ${ODOO_HOST}`);
console.log(`   Base de datos: ${ODOO_DB}`);
console.log(`   API Key: ${API_KEY.substring(0, 10)}...${API_KEY.substring(-5)}\n`);

// Crear cliente XML-RPC
const client = xmlrpc.createSecureClient({
    host: ODOO_HOST,
    port: 443,
    path: '/xmlrpc/2/common'
});

// Función para autenticar usando API Key como contraseña
async function authenticate() {
    return new Promise((resolve, reject) => {
        console.log('🔐 Autenticando con API Key como contraseña...');
        
        // Intentar con usuario "api" y API Key como contraseña
        client.methodCall('authenticate', [ODOO_DB, 'api', API_KEY, {}], (error, value) => {
            if (error) {
                console.log(`   ❌ Error intento 1: ${error.message}`);
                
                // Reintentar con otro nombre de usuario
                client.methodCall('authenticate', [ODOO_DB, 'odoo', API_KEY, {}], (error2, value2) => {
                    if (error2) {
                        console.log(`   ❌ Error intento 2: ${error2.message}`);
                        reject(new Error('No se pudo autenticar'));
                    } else {
                        if (value2 === false) {
                            reject(new Error('Credenciales inválidas'));
                        } else {
                            console.log(`   ✅ Autenticación exitosa. UID: ${value2}`);
                            resolve({ uid: value2, user: 'odoo' });
                        }
                    }
                });
            } else {
                if (value === false) {
                    console.log(`   ❌ Credenciales inválidas intento 1`);
                    
                    // Reintentar
                    client.methodCall('authenticate', [ODOO_DB, 'odoo', API_KEY, {}], (error2, value2) => {
                        if (error2 || value2 === false) {
                            reject(new Error('No se pudo autenticar'));
                        } else {
                            console.log(`   ✅ Autenticación exitosa. UID: ${value2}`);
                            resolve({ uid: value2, user: 'odoo' });
                        }
                    });
                } else {
                    console.log(`   ✅ Autenticación exitosa. UID: ${value}`);
                    resolve({ uid: value, user: 'api' });
                }
            }
        });
    });
}

// Función para obtener usuarios
async function getUsers(uid, user) {
    return new Promise((resolve, reject) => {
        const objectClient = xmlrpc.createSecureClient({
            host: ODOO_HOST,
            port: 443,
            path: '/xmlrpc/2/object'
        });

        console.log('👥 Obteniendo usuarios...');
        
        objectClient.methodCall('execute', [ODOO_DB, uid, API_KEY, 'res.users', 'search_read', [], {
            fields: ['id', 'name', 'login', 'email', 'active'],
            limit: 50
        }], (error, users) => {
            if (error) {
                console.error(`   ❌ Error: ${error.message}`);
                reject(error);
            } else {
                console.log(`   ✅ Se encontraron ${users.length} usuarios`);
                resolve(users);
            }
        });
    });
}

// Función principal
async function main() {
    try {
        // Autenticar
        const authResult = await authenticate();
        console.log('');

        // Obtener usuarios
        const users = await getUsers(authResult.uid, authResult.user);

        if (users.length === 0) {
            console.log('\n⚠️  No se encontraron usuarios en la base de datos');
            return;
        }

        // Mostrar usuarios
        console.log('\n' + '═'.repeat(80));
        console.log('👥 USUARIOS EN ODOO 19:');
        console.log('═'.repeat(80));
        users.forEach((user, index) => {
            console.log(`\n${index + 1}. ${user.name}`);
            console.log(`   ID: ${user.id}`);
            console.log(`   Login: ${user.login}`);
            console.log(`   Email: ${user.email || 'N/A'}`);
            console.log(`   Activo: ${user.active ? 'Sí' : 'No'}`);
        });

        console.log('\n' + '═'.repeat(80));
        console.log(`\n✅ Conexión exitosa. Total de usuarios: ${users.length}\n`);

    } catch (error) {
        console.error(`\n❌ Error en el proceso: ${error.message}\n`);
        process.exit(1);
    }
}

// Ejecutar
main();
