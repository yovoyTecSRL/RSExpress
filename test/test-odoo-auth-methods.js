const https = require('https');

// Configuración de conexión a Odoo
const ODOO_HOST = 'rsexpress.online';
const ODOO_DB = 'odoo19';
const API_KEY = 'fee30b46503e2c2e498fd5ad29de5b03cec19f0f';

console.log('🔍 Probando autenticación con API Key en Odoo 19...\n');

// Función para hacer llamadas JSON-RPC con diferentes encabezados
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
            reject(new Error(`JSON-RPC Error: ${JSON.stringify(response.error)}`));
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

// Intentar autenticar con diferentes métodos
async function tryAuthMethods() {
  const methods = [
    {
      name: 'Método 1: x-odoo-db y x-odoo-uid headers',
      headers: {
        'x-odoo-db': ODOO_DB,
        'x-odoo-api-key': API_KEY
      },
      params: {}
    },
    {
      name: 'Método 2: Authorization header con token_type=bearer',
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      },
      params: {}
    },
    {
      name: 'Método 3: Parámetro de header api_key',
      headers: {
        'api_key': API_KEY
      },
      params: {}
    }
  ];

  for (const method of methods) {
    try {
      console.log(`\n📌 ${method.name}`);
      console.log(`   Headers: ${JSON.stringify(method.headers)}`);
      
      const result = await callJsonRpc('call', {
        service: 'object',
        method: 'execute',
        args: [ODOO_DB, 1, '', 'res.users', 'search_read', [], {
          fields: ['id', 'name', 'login'],
          limit: 5
        }]
      }, method.headers);

      console.log(`   ✅ Éxito: ${Array.isArray(result) ? `${result.length} usuarios` : JSON.stringify(result)}`);
      return { method: method.name, headers: method.headers, result };

    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }

  return null;
}

// Función para obtener información del usuario actual con API Key
async function getUserInfoWithApiKey() {
  try {
    console.log('\n🔐 Intentando obtener info del usuario con API Key...');
    
    // En Odoo, algunos endpoints permiten acceder como "usuario API"
    const headers = {
      'Authorization': `Bearer ${API_KEY}`,
      'X-Odoo-Session-Token': API_KEY
    };

    const result = await callJsonRpc('call', {
      service: 'web',
      method: 'session_info',
      args: []
    }, headers);

    console.log(`   ✅ Session info:`, JSON.stringify(result, null, 2));
    return result;

  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return null;
  }
}

// Función principal
async function main() {
  await tryAuthMethods();
  await getUserInfoWithApiKey();

  console.log('\n✅ Pruebas completadas\n');
}

main();
