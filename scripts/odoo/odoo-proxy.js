/**
 * Proxy para Odoo 19 - Puerto 9999
 * Resuelve problemas de CORS y actúa como intermediario
 */

import http from 'http';
import https from 'https';
import url from 'url';

const ODOO_HOST = 'rsexpress.online';
const ODOO_PORT = 443;
const PROXY_PORT = 9999;

// Crear servidor proxy
const server = http.createServer((req, res) => {
    // Permitir CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Content-Type', 'application/json');

    // Responder a preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Solo aceptar POST a /jsonrpc
    if (req.method !== 'POST' || req.url !== '/jsonrpc') {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Not found' }));
        return;
    }

    let body = '';

    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        try {
            // Parsear el JSON del cliente
            const data = JSON.parse(body);
            console.log('[Proxy] Solicitud Odoo:', {
                method: data.params?.method,
                service: data.service
            });

            // Crear opciones para la solicitud a Odoo
            const options = {
                hostname: ODOO_HOST,
                port: ODOO_PORT,
                path: '/jsonrpc',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(body)
                }
            };

            // Hacer solicitud a Odoo
            const odooReq = https.request(options, (odooRes) => {
                let odooBody = '';

                odooRes.on('data', chunk => {
                    odooBody += chunk.toString();
                });

                odooRes.on('end', () => {
                    console.log('[Proxy] Respuesta Odoo recibida');
                    res.writeHead(odooRes.statusCode, {
                        'Access-Control-Allow-Origin': '*',
                        'Content-Type': 'application/json'
                    });
                    res.end(odooBody);
                });
            });

            odooReq.on('error', (error) => {
                console.error('[Proxy] Error conexión a Odoo:', error.message);
                res.writeHead(502);
                res.end(JSON.stringify({
                    jsonrpc: '2.0',
                    id: data.id || null,
                    error: {
                        code: -32000,
                        message: 'No se pudo conectar a Odoo: ' + error.message
                    }
                }));
            });

            odooReq.write(body);
            odooReq.end();

        } catch (error) {
            console.error('[Proxy] Error procesando solicitud:', error.message);
            res.writeHead(400);
            res.end(JSON.stringify({
                error: 'Solicitud inválida: ' + error.message
            }));
        }
    });
});

server.listen(PROXY_PORT, '0.0.0.0', () => {
    console.log(`
╔════════════════════════════════════════╗
║   🔄 PROXY ODOO 19 - Iniciado         ║
╠════════════════════════════════════════╣
║ 🌐 Escuchando en: 0.0.0.0:${PROXY_PORT}     ║
║ 📡 Redirecciona a: ${ODOO_HOST}:${ODOO_PORT}  ║
║ 🛡️  CORS habilitado                     ║
║ 📝 Endpoint: http://localhost:${PROXY_PORT}/jsonrpc ║
╚════════════════════════════════════════╝
    `);
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Puerto ${PROXY_PORT} ya está en uso`);
    } else {
        console.error('❌ Error del servidor:', err);
    }
    process.exit(1);
});
