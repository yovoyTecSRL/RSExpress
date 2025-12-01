const https = require('https');

// Configuración de conexión a Odoo
const ODOO_HOST = 'rsexpress.online';
const ODOO_DB = 'odoo19';
const API_KEY = 'fee30b46503e2c2e498fd5ad29de5b03cec19f0f';

console.log('🔍 Probando acceso directo a usuarios con UID 1 y API Key...\n');

// Función para hacer llamadas JSON-RPC
function callJsonRpc(method, params, customHeaders = {}) {
  return new Promise((resolve, reject) => {
    const payload = {
      jsonrpc: '2.0',
      method: method,
      params: params,
      id: Math.random()
    };

    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(JSON.stringify(payload)),
      ...customHeaders
    };

    const options = {
      hostname: ODOO_HOST,
      port: 443,
      path: '/jsonrpc',
      method: 'POST',
      headers: defaultHeaders
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
            reject(new Error(`${response.error.data?.message || response.error.message}`));
          } else {
            resolve(response.result);
          }
        } catch (e) {
          reject(new Error(`Error al parsear: ${e.message}`));
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

// Intentar con UID 1 y diferentes "contraseñas"
async function tryWithUID1(password) {
  try {
    console.log(`📌 Intentando con UID=1 y password="${password}"...`);
    
    const result = await callJsonRpc('call', {
      service: 'object',
      method: 'execute',
      args: [ODOO_DB, 1, password, 'res.users', 'search_read', [], {
        fields: ['id', 'name', 'login', 'email'],
        limit: 50
      }]
    });

    console.log(`✅ Éxito! Usuarios encontrados: ${result.length}`);
    return result;

  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return null;
  }
}

// Función principal
async function main() {
  const passwordsToTry = [
    API_KEY,
    '',
    'admin',
    'password',
    API_KEY.substring(0, 20),
  ];

  console.log(`Probando con ${passwordsToTry.length} variaciones de contraseña:\n`);

  let users = null;

  for (const pwd of passwordsToTry) {
    users = await tryWithUID1(pwd);
    if (users) {
      console.log(`\n✅ ENCONTRADO! La contraseña es: "${pwd}"\n`);
      break;
    }
  }

  if (users && users.length > 0) {
    console.log('═'.repeat(80));
    console.log('👥 USUARIOS EN ODOO 19:');
    console.log('═'.repeat(80));
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.name}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Login: ${user.login}`);
      console.log(`   Email: ${user.email || 'N/A'}`);
    });
    console.log('\n' + '═'.repeat(80));
    console.log(`\n✅ Total de usuarios: ${users.length}\n`);
  } else if (!users) {
    console.log('\n⚠️ No se pudo acceder con ninguna contraseña\n');
  }
}

main();
