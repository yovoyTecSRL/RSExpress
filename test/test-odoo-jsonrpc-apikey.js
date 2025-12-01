const https = require('https');

// Configuración de conexión a Odoo
const ODOO_HOST = 'rsexpress.online';
const ODOO_DB = 'odoo19';
const API_KEY = 'fee30b46503e2c2e498fd5ad29de5b03cec19f0f';

console.log('🔍 Probando JSON-RPC con API Key...\n');

// Función para hacer llamadas JSON-RPC
function callJsonRpc(method, params) {
  return new Promise((resolve, reject) => {
    const payload = {
      jsonrpc: '2.0',
      method: method,
      params: params,
      id: Math.random()
    };

    const options = {
      hostname: ODOO_HOST,
      port: 443,
      path: '/jsonrpc',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(JSON.stringify(payload)),
        'Authorization': `Bearer ${API_KEY}`
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
            reject(new Error(`JSON-RPC Error: ${JSON.stringify(response.error)}`));
          } else {
            resolve(response.result);
          }
        } catch (e) {
          reject(new Error(`Error al parsear: ${e.message} - Data: ${data}`));
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

// Prueba 1: Obtener versión (no requiere autenticación)
async function testVersion() {
  try {
    console.log('📌 Intentando obtener versión de Odoo...');
    const result = await callJsonRpc('call', {
      service: 'common',
      method: 'version',
      args: []
    });
    console.log('✅ Versión:', result);
    return true;
  } catch (error) {
    console.log(`❌ Error: ${error.message}\n`);
    return false;
  }
}

// Prueba 2: Autenticar con API Key directamente en params
async function testAuthWithApiKey() {
  try {
    console.log('🔐 Intentando autenticar con API Key en params...');
    const result = await callJsonRpc('call', {
      service: 'common',
      method: 'authenticate',
      args: [ODOO_DB, ODOO_DB, API_KEY, {}]
    });
    console.log('✅ UID:', result);
    return result;
  } catch (error) {
    console.log(`❌ Error: ${error.message}\n`);
    return null;
  }
}

// Prueba 3: Obtener usuarios si autenticación funciona
async function getUsers(uid) {
  try {
    console.log('👥 Obteniendo usuarios...');
    const result = await callJsonRpc('call', {
      service: 'object',
      method: 'execute',
      args: [ODOO_DB, uid, API_KEY, 'res.users', 'search_read', [], {
        fields: ['id', 'name', 'login', 'email', 'active'],
        limit: 50
      }]
    });
    console.log(`✅ Usuarios encontrados: ${result.length}\n`);
    return result;
  } catch (error) {
    console.log(`❌ Error: ${error.message}\n`);
    return null;
  }
}

// Función principal
async function main() {
  try {
    // Prueba 1: Versión
    await testVersion();

    // Prueba 2: Autenticar
    const uid = await testAuthWithApiKey();
    
    if (uid && uid !== false) {
      console.log('');
      // Prueba 3: Obtener usuarios
      const users = await getUsers(uid);

      if (users && users.length > 0) {
        console.log('═'.repeat(80));
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
        console.log(`\n✅ Conexión y obtención de usuarios exitosa!\n`);
      }
    }

  } catch (error) {
    console.error(`\n❌ Error fatal: ${error.message}\n`);
    process.exit(1);
  }
}

main();
