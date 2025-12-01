const xmlrpc = require('xmlrpc');

// Configuración de conexión a Odoo
const ODOO_HOST = 'rsexpress.online';
const ODOO_DB = 'odoo19';

// Lista de credenciales a intentar
const credentials = [
    { user: 'admin', pass: 'admin' },
    { user: 'odoo', pass: 'odoo' },
    { user: 'admin', pass: 'password' },
    { user: 'admin', pass: '12345' },
];

console.log('🔍 Iniciando prueba de conexión a Odoo 19...\n');
console.log('📋 Configuración:');
console.log(`   Host: ${ODOO_HOST}`);
console.log(`   Base de datos: ${ODOO_DB}\n`);

// Crear cliente XML-RPC
const client = xmlrpc.createSecureClient({
    host: ODOO_HOST,
    port: 443,
    path: '/xmlrpc/2/common'
});

// Función para autenticar con reintentos
async function tryAuthentication(user, pass) {
    return new Promise((resolve) => {
        console.log(`🔐 Intentando con usuario: ${user}...`);
        
        client.methodCall('authenticate', [ODOO_DB, user, pass, {}], (error, value) => {
            if (error) {
                console.log(`   ❌ Error: ${error.message}`);
                resolve(null);
            } else {
                if (value === false) {
                    console.log(`   ❌ Credenciales inválidas`);
                    resolve(null);
                } else {
                    console.log(`   ✅ Autenticación exitosa. UID: ${value}`);
                    resolve({ uid: value, user, pass });
                }
            }
        });
    });
}

// Función para obtener usuarios
async function getUsers(uid, pass) {
    return new Promise((resolve) => {
        const objectClient = xmlrpc.createSecureClient({
            host: ODOO_HOST,
            port: 443,
            path: '/xmlrpc/2/object'
        });

        console.log('👥 Obteniendo usuarios...');
        
        objectClient.methodCall('execute', [ODOO_DB, uid, pass, 'res.users', 'search_read', [], {
            fields: ['id', 'name', 'login', 'email', 'active'],
            limit: 50
        }], (error, users) => {
            if (error) {
                console.error(`   ❌ Error: ${error.message}`);
                resolve(null);
            } else {
                console.log(`   ✅ Se encontraron ${users.length} usuarios`);
                resolve(users);
            }
        });
    });
}

// Función principal
async function main() {
    let authenticated = false;
    let authResult = null;

    // Intentar cada conjunto de credenciales
    for (const cred of credentials) {
        authResult = await tryAuthentication(cred.user, cred.pass);
        if (authResult) {
            authenticated = true;
            break;
        }
    }

    if (!authenticated) {
        console.error('\n❌ No se pudo autenticar con ninguna credencial\n');
        process.exit(1);
    }

    console.log('');

    // Obtener usuarios
    const users = await getUsers(authResult.uid, authResult.pass);

    if (!users || users.length === 0) {
        console.log('\n⚠️  No se encontraron usuarios en la base de datos\n');
        process.exit(1);
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
    console.log(`\n✅ Conexión exitosa. Total de usuarios: ${users.length}`);
    console.log(`✅ Credenciales que funcionan: ${authResult.user} / ${authResult.pass}\n`);
}

// Ejecutar
main().catch(error => {
    console.error(`\n❌ Error: ${error.message}\n`);
    process.exit(1);
});
