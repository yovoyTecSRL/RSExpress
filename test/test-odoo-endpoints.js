const https = require('https');

// Configuración de conexión a Odoo
const ODOO_HOST = 'rsexpress.online';
const ODOO_DB = 'odoo19';
const API_KEY = 'fee30b46503e2c2e498fd5ad29de5b03cec19f0f';

console.log('🔍 Probando diferentes endpoints de Odoo 19...\n');

// Función para hacer llamadas HTTPS
function httpsRequest(path, method = 'GET', headers = {}) {
  return new Promise((resolve, reject) => {
    const defaultHeaders = {
      'Authorization': `Bearer ${API_KEY}`,
      ...headers
    };

    const options = {
      hostname: ODOO_HOST,
      path: path,
      method: method,
      headers: defaultHeaders
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.end();
  });
}

// Función para probar endpoints
async function testEndpoints() {
  const endpoints = [
    '/api/v1/users',
    '/api/v1/auth/profile',
    '/api/resource/res.users',
    '/jsonrpc',
    '/web',
    '/api',
    '/'
  ];

  console.log('🧪 Probando endpoints:\n');

  for (const endpoint of endpoints) {
    try {
      console.log(`📍 Probando: ${endpoint}`);
      const result = await httpsRequest(endpoint);
      console.log(`   Status: ${result.status}`);
      
      if (result.status === 200 || result.status === 401 || result.status === 403) {
        if (result.data) {
          const preview = result.data.substring(0, 100);
          console.log(`   Response: ${preview}${result.data.length > 100 ? '...' : ''}`);
        }
        console.log(`   ✅ Endpoint accesible\n`);
      } else {
        console.log(`   ❌ No accesible\n`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}\n`);
    }
  }
}

testEndpoints().then(() => {
  console.log('✅ Prueba completada\n');
}).catch(error => {
  console.error(`❌ Error: ${error.message}\n`);
});
