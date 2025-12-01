const http = require('http');
const https = require('https');
const querystring = require('querystring');

// Configuración de conexión a Odoo
const ODOO_HOST = 'rsexpress.online';
const ODOO_PORT = 443;
const ODOO_DB = 'odoo19';
const ODOO_USER = 'odoo';
const ODOO_PASSWORD = '$pbkdf2-sha512$600000$HkPIeW.N0ZqTMqaUslbq3Q$FCa/HxNfV7rTsm78AgEewd9SuJJAaB1k7.Nvo5Ew7BsMasdNEMtnHgupHyh8xY05kTGoGVuoMO3Zz7M0gbG3pQ';

console.log('🔍 Iniciando prueba de conexión a Odoo 19...\n');
console.log('📋 Configuración:');
console.log(`   Host: ${ODOO_HOST}`);
console.log(`   Puerto: ${ODOO_PORT}`);
console.log(`   Base de datos: ${ODOO_DB}`);
console.log(`   Usuario: ${ODOO_USER}\n`);

// Función para hacer llamadas RPC a Odoo
function callOdoo(method, params) {
  return new Promise((resolve, reject) => {
    const payload = {
      jsonrpc: '2.0',
      method: method,
      params: params,
      id: Math.random()
    };

    const options = {
      hostname: ODOO_HOST,
      port: ODOO_PORT,
      path: '/jsonrpc',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(JSON.stringify(payload))
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.error) {
            reject(new Error(`Error RPC: ${response.error.message}`));
          } else {
            resolve(response.result);
          }
        } catch (e) {
          reject(new Error(`Error al parsear respuesta: ${e.message}`));
        }
      });
    });

    req.on('error', (e) => {
      reject(new Error(`Error de conexión: ${e.message}`));
    });

    req.write(JSON.stringify(payload));
    req.end();
  });
}

// Función para autenticar
async function authenticate() {
  try {
    console.log('🔐 Autenticando...');
    const result = await callOdoo('call', {
      service: 'common',
      method: 'authenticate',
      args: [ODOO_DB, ODOO_USER, ODOO_PASSWORD, {}]
    });
    
    console.log(`✅ Autenticación exitosa. UID: ${result}\n`);
    return result;
  } catch (error) {
    console.error(`❌ Error de autenticación: ${error.message}\n`);
    throw error;
  }
}

// Función para obtener usuarios
async function getUsers(uid) {
  try {
    console.log('👥 Obteniendo usuarios...');
    const result = await callOdoo('call', {
      service: 'object',
      method: 'execute',
      args: [ODOO_DB, uid, ODOO_PASSWORD, 'res.users', 'search', []]
    });
    
    console.log(`✅ Se encontraron ${result.length} usuarios\n`);
    return result;
  } catch (error) {
    console.error(`❌ Error al obtener usuarios: ${error.message}\n`);
    throw error;
  }
}

// Función para obtener detalles de usuarios
async function getUserDetails(uid, userIds) {
  try {
    console.log('📋 Obteniendo detalles de usuarios...\n');
    const result = await callOdoo('call', {
      service: 'object',
      method: 'execute',
      args: [ODOO_DB, uid, ODOO_PASSWORD, 'res.users', 'read', userIds, ['id', 'name', 'login', 'email', 'active']]
    });
    
    return result;
  } catch (error) {
    console.error(`❌ Error al obtener detalles: ${error.message}\n`);
    throw error;
  }
}

// Función principal
async function main() {
  try {
    // Paso 1: Autenticar
    const uid = await authenticate();

    // Paso 2: Obtener lista de usuarios
    const userIds = await getUsers(uid);

    if (userIds.length === 0) {
      console.log('⚠️  No se encontraron usuarios en la base de datos');
      return;
    }

    // Paso 3: Obtener detalles de usuarios
    const users = await getUserDetails(uid, userIds);

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
