const https = require('https');

// Configuración de conexión a Odoo
const ODOO_HOST = 'rsexpress.online';
const ODOO_DB = 'odoo19';
const API_KEY = 'fee30b46503e2c2e498fd5ad29de5b03cec19f0f';

console.log('🔍 Iniciando prueba de conexión a Odoo 19 con API Key...\n');
console.log('📋 Configuración:');
console.log(`   Host: ${ODOO_HOST}`);
console.log(`   Base de datos: ${ODOO_DB}`);
console.log(`   API Key: ${API_KEY.substring(0, 10)}...${API_KEY.substring(-5)}\n`);

// Función para hacer llamadas a la API REST de Odoo
function callOdooAPI(endpoint, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: ODOO_HOST,
      path: `/api/v1${endpoint}`,
      method: method,
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    if (data && method !== 'GET') {
      const payload = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          console.log(`   Status: ${res.statusCode}`);
          if (res.statusCode === 401) {
            reject(new Error('Unauthorized - API Key inválida'));
          } else if (res.statusCode === 403) {
            reject(new Error('Forbidden - No tiene permisos'));
          } else if (res.statusCode === 404) {
            reject(new Error('Not Found - Endpoint no existe'));
          } else if (res.statusCode >= 400) {
            reject(new Error(`HTTP Error ${res.statusCode}: ${responseData}`));
          } else {
            const response = JSON.parse(responseData);
            resolve(response);
          }
        } catch (e) {
          reject(new Error(`Error al parsear respuesta: ${e.message}`));
        }
      });
    });

    req.on('error', (e) => {
      reject(new Error(`Error de conexión: ${e.message}`));
    });

    if (data && method !== 'GET') {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Función para obtener usuarios
async function getUsers() {
  try {
    console.log('👥 Obteniendo usuarios...');
    const result = await callOdooAPI('/users');
    return result;
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    throw error;
  }
}

// Función para obtener perfil
async function getProfile() {
  try {
    console.log('👤 Obteniendo perfil del usuario actual...');
    const result = await callOdooAPI('/auth/profile');
    return result;
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return null;
  }
}

// Función principal
async function main() {
  try {
    // Intentar obtener el perfil primero
    const profile = await getProfile();
    if (profile) {
      console.log(`\n✅ Autenticación exitosa con API Key`);
      console.log(`   Usuario: ${profile.name || profile.login || 'N/A'}`);
      console.log(`   ID: ${profile.id || 'N/A'}\n`);
    }

    // Obtener usuarios
    const users = await getUsers();

    if (!users || !Array.isArray(users)) {
      console.log('\n⚠️  Respuesta inesperada:', users);
      return;
    }

    if (users.length === 0) {
      console.log('\n⚠️  No se encontraron usuarios en la base de datos');
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
      console.log(`   Activo: ${user.active !== false ? 'Sí' : 'No'}`);
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
