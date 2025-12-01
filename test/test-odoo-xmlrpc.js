const https = require('https');
const xmlrpc = require('xmlrpc');

// Configuración de conexión a Odoo
const ODOO_HOST = 'rsexpress.online';
const ODOO_PROTOCOL = 'https';
const ODOO_DB = 'odoo19';
const ODOO_USER = 'odoo';
// Usa la contraseña en texto plano, no el hash
const ODOO_PASSWORD = 'odoo';

console.log('🔍 Iniciando prueba de conexión a Odoo 19...\n');
console.log('📋 Configuración:');
console.log(`   Host: ${ODOO_HOST}`);
console.log(`   Protocolo: ${ODOO_PROTOCOL}`);
console.log(`   Base de datos: ${ODOO_DB}`);
console.log(`   Usuario: ${ODOO_USER}\n`);

// Crear cliente XML-RPC
const client = xmlrpc.createSecureClient({
    host: ODOO_HOST,
    port: 443,
    path: '/xmlrpc/2/common'
});

// Función para autenticar
async function authenticate() {
    return new Promise((resolve, reject) => {
        console.log('🔐 Autenticando...');
        
        client.methodCall('authenticate', [ODOO_DB, ODOO_USER, ODOO_PASSWORD, {}], (error, value) => {
            if (error) {
                console.error(`❌ Error de autenticación: ${error.message}`);
                reject(error);
            } else {
                if (value === false) {
                    reject(new Error('Credenciales inválidas - Autenticación fallida'));
                } else {
                    console.log(`✅ Autenticación exitosa. UID: ${value}\n`);
                    resolve(value);
                }
            }
        });
    });
}

// Función para obtener usuarios
async function getUsers(uid) {
    return new Promise((resolve, reject) => {
        const objectClient = xmlrpc.createSecureClient({
            host: ODOO_HOST,
            port: 443,
            path: '/xmlrpc/2/object'
        });

        console.log('👥 Obteniendo usuarios...');
        
        objectClient.methodCall('execute', [ODOO_DB, uid, ODOO_PASSWORD, 'res.users', 'search_read', [], {
            fields: ['id', 'name', 'login', 'email', 'active'],
            limit: 50
        }], (error, users) => {
            if (error) {
                console.error(`❌ Error al obtener usuarios: ${error.message}`);
                reject(error);
            } else {
                console.log(`✅ Se encontraron ${users.length} usuarios\n`);
                resolve(users);
            }
        });
    });
}

// Función principal
async function main() {
    try {
        // Paso 1: Autenticar
        const uid = await authenticate();

        // Paso 2: Obtener usuarios
        const users = await getUsers(uid);

        if (users.length === 0) {
            console.log('⚠️  No se encontraron usuarios en la base de datos');
            return;
        }

        // Mostrar usuarios
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
