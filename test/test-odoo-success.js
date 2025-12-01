const https = require('https');

// Configuración de conexión a Odoo
const ODOO_HOST = 'rsexpress.online';
const ODOO_DB = 'odoo19';
const UID = 5;
const API_KEY = 'fee30b46503e2c2e498fd5ad29de5b03cec19f0f';

console.log('🔍 Probando conexión a Odoo 19 con UID 5 y API Key...\n');
console.log('📋 Configuración:');
console.log(`   Host: ${ODOO_HOST}`);
console.log(`   Base de datos: ${ODOO_DB}`);
console.log(`   UID: ${UID}`);
console.log(`   API Key: ${API_KEY.substring(0, 10)}...${API_KEY.substring(-5)}\n`);

// Función para hacer llamadas JSON-RPC
function callJsonRpc(service, method, args) {
  return new Promise((resolve, reject) => {
    const payload = {
      jsonrpc: '2.0',
      method: 'call',
      params: {
        service: service,
        method: method,
        args: args
      },
      id: Math.random()
    };

    const options = {
      hostname: ODOO_HOST,
      port: 443,
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

// Función para obtener usuarios
async function getUsers() {
  try {
    console.log('👥 Obteniendo usuarios (res.users)...');
    const result = await callJsonRpc('object', 'execute_kw', [
      ODOO_DB,
      UID,
      API_KEY,
      'res.users',
      'search_read',
      [],
      {
        fields: ['id', 'name', 'login', 'email', 'active'],
        limit: 50
      }
    ]);
    
    console.log(`✅ Se encontraron ${result.length} usuarios\n`);
    return result;
  } catch (error) {
    console.log(`❌ Error: ${error.message}\n`);
    return null;
  }
}

// Función para obtener partners (contactos)
async function getPartners() {
  try {
    console.log('🏢 Obteniendo partners (res.partner)...');
    const result = await callJsonRpc('object', 'execute_kw', [
      ODOO_DB,
      UID,
      API_KEY,
      'res.partner',
      'search_read',
      [],
      {
        fields: ['id', 'name', 'email', 'phone'],
        limit: 50
      }
    ]);
    
    console.log(`✅ Se encontraron ${result.length} partners\n`);
    return result;
  } catch (error) {
    console.log(`❌ Error: ${error.message}\n`);
    return null;
  }
}

// Función principal
async function main() {
  try {
    // Obtener usuarios
    const users = await getUsers();

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
    }

    // Obtener partners
    const partners = await getPartners();

    if (partners && partners.length > 0) {
      console.log('\n' + '═'.repeat(80));
      console.log('🏢 PARTNERS/CONTACTOS EN ODOO 19:');
      console.log('═'.repeat(80));
      partners.forEach((partner, index) => {
        console.log(`\n${index + 1}. ${partner.name}`);
        console.log(`   ID: ${partner.id}`);
        console.log(`   Email: ${partner.email || 'N/A'}`);
        console.log(`   Teléfono: ${partner.phone || 'N/A'}`);
      });
      console.log('\n' + '═'.repeat(80));
    }

    if (users) {
      console.log(`\n✅ Conexión exitosa!`);
      console.log(`   Total de usuarios: ${users.length}`);
      console.log(`   Total de partners: ${partners ? partners.length : 0}\n`);
    }

  } catch (error) {
    console.error(`\n❌ Error en el proceso: ${error.message}\n`);
    process.exit(1);
  }
}

// Ejecutar
main();
