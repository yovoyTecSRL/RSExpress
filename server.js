/**
 * 🚀 Servidor Web RSExpress - Multi-Port Server
 * 5555: HTML UI (pruebas estáticas)
 * 7777: React App (proxy a Vite)
 * 9999: Odoo Proxy API
 */

import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import url from 'url';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT_HTML = 5555;  // HTML UI Server
const PORT_REACT = 7777; // React Vite Proxy
const PORT_ODOO = 9999;  // Odoo Proxy
const HOST = 'localhost';

const ODOO_URL = 'https://rsexpress.online'; // Cambiar a tu Odoo URL
const VITE_URL = 'http://localhost:5173';

// Tipos MIME
const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2'
};

// ==================== SERVIDOR HTML (5555) ====================

function createHtmlServer() {
    const publicDir = __dirname;

    return http.createServer((req, res) => {
        console.log(`[${new Date().toLocaleTimeString()}] 5555 ${req.method} ${req.url}`);

        let filePath = path.join(publicDir, req.url);

        // Ruta raíz
        if (req.url === '/' || req.url === '') {
            filePath = path.join(publicDir, 'index.html');
        }

        // Prevenir directory traversal
        if (!filePath.startsWith(publicDir)) {
            res.writeHead(403, { 'Content-Type': 'text/plain' });
            res.end('Forbidden');
            return;
        }

        // Leer archivo
        fs.readFile(filePath, (err, content) => {
            if (err) {
                const ext = path.extname(req.url);
                const contentType = mimeTypes[ext] || 'text/plain';

                res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(`
                    <!DOCTYPE html>
                    <html>
                    <head><title>404 - No Encontrado</title></head>
                    <body style="font-family:Arial;margin:50px">
                        <h1>404 - No Encontrado</h1>
                        <p>${req.url}</p>
                        <a href="/">Volver</a>
                    </body>
                    </html>
                `);
                return;
            }

            const ext = path.extname(filePath).toLowerCase();
            const contentType = mimeTypes[ext] || 'text/plain';

            res.writeHead(200, { 
                'Content-Type': contentType,
                'Access-Control-Allow-Origin': '*'
            });
            res.end(content);
        });
    });
}

// ==================== PROXY ODOO (9999) ====================

function createOdooProxyServer() {
    return http.createServer(async (req, res) => {
        console.log(`[${new Date().toLocaleTimeString()}] 9999 ${req.method} ${req.url}`);

        // CORS
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

        if (req.method === 'OPTIONS') {
            res.writeHead(200);
            res.end();
            return;
        }

        try {
            // Leer body
            let body = '';
            if (req.method !== 'GET' && req.method !== 'HEAD') {
                body = await new Promise((resolve, reject) => {
                    let data = '';
                    req.on('data', chunk => data += chunk);
                    req.on('end', () => resolve(data));
                    req.on('error', reject);
                });
            }

            // Construir URL objetivo
            const targetUrl = `${ODOO_URL}${req.url}`;
            const targetUrlObj = new url.URL(targetUrl);

            // Elegir protocolo basado en la URL
            const requestModule = targetUrlObj.protocol === 'https:' ? 
                (await import('https')).default : 
                http;

            // Hacer proxy
            const proxyReq = requestModule.request({
                hostname: targetUrlObj.hostname,
                port: targetUrlObj.port,
                path: targetUrlObj.pathname + targetUrlObj.search,
                method: req.method,
                headers: {
                    ...req.headers,
                    'Host': targetUrlObj.host
                }
            }, (proxyRes) => {
                res.writeHead(proxyRes.statusCode, proxyRes.headers);
                proxyRes.pipe(res);
            });

            proxyReq.on('error', (error) => {
                console.error(`[9999 ERROR] ${error.message}`);
                res.writeHead(502, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Bad Gateway', message: error.message }));
            });

            if (body) proxyReq.write(body);
            proxyReq.end();
        } catch (error) {
            console.error(`[9999 ERROR] ${error.message}`);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Internal Server Error', message: error.message }));
        }
    });
}

// ==================== PROXY REACT/VITE (7777) ====================

function createReactProxyServer() {
    return http.createServer((req, res) => {
        console.log(`[${new Date().toLocaleTimeString()}] 7777 ${req.method} ${req.url}`);

        // CORS
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

        if (req.method === 'OPTIONS') {
            res.writeHead(200);
            res.end();
            return;
        }

        const proxyReq = http.request(
            `${VITE_URL}${req.url}`,
            {
                method: req.method,
                headers: req.headers
            },
            (proxyRes) => {
                // Pasar headers de respuesta
                res.writeHead(proxyRes.statusCode, proxyRes.headers);
                proxyRes.pipe(res);
            }
        );

        proxyReq.on('error', (error) => {
            console.error(`[7777 ERROR] ${error.message}`);
            res.writeHead(502, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                error: 'Vite Server Not Available',
                message: 'Ejecuta: npm run dev',
                details: error.message 
            }));
        });

        req.pipe(proxyReq);
    });
}

// ==================== INICIAR SERVIDORES ====================

function startAllServers() {
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║        🚀 RSEXPRESS - MULTI-PORT SERVER CONFIGURATION          ║
╚════════════════════════════════════════════════════════════════╝
    `);

    // Servidor HTML
    const htmlServer = createHtmlServer();
    htmlServer.listen(PORT_HTML, HOST, () => {
        console.log(`✅ Servidor HTML en http://${HOST}:${PORT_HTML}`);
        console.log(`   • index.html`);
        console.log(`   • delivery-cards.html`);
        console.log(`   • Archivos estáticos\n`);
    });

    htmlServer.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.error(`❌ Puerto ${PORT_HTML} ya está en uso. Intenta: lsof -i :${PORT_HTML}`);
        } else {
            console.error(`❌ Error servidor HTML:`, err);
        }
        process.exit(1);
    });

    // Servidor Odoo Proxy
    const odooServer = createOdooProxyServer();
    odooServer.listen(PORT_ODOO, HOST, () => {
        console.log(`✅ Proxy Odoo en http://${HOST}:${PORT_ODOO}`);
        console.log(`   • Proxy a: ${ODOO_URL}`);
        console.log(`   • JSON-RPC API\n`);
    });

    odooServer.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.error(`❌ Puerto ${PORT_ODOO} ya está en uso`);
        } else {
            console.error(`❌ Error servidor Odoo:`, err);
        }
    });

    // Servidor React Proxy
    const reactServer = createReactProxyServer();
    reactServer.listen(PORT_REACT, HOST, () => {
        console.log(`✅ Proxy React en http://${HOST}:${PORT_REACT}`);
        console.log(`   • Proxy a: ${VITE_URL}`);
        console.log(`   • ⚡ Requiere: npm run dev\n`);
    });

    reactServer.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.error(`❌ Puerto ${PORT_REACT} ya está en uso`);
        } else {
            console.error(`❌ Error servidor React:`, err);
        }
    });

    // Instrucciones
    console.log(`
────────────────────────────────────────────────────────────────
📋 CÓMO USAR:

  Terminal 1 - Vite Dev Server:
    $ npm run dev

  Terminal 2 - Multi-Server:
    $ node server.js

  Abrir en navegador:
    🟦 HTML UI:        http://localhost:${PORT_HTML}
    🟢 React App:      http://localhost:${PORT_REACT}
    🟠 Odoo Proxy:     http://localhost:${PORT_ODOO}

────────────────────────────────────────────────────────────────
  Presiona CTRL+C para detener los servidores
────────────────────────────────────────────────────────────────
    `);

    // Manejo de señales
    process.on('SIGINT', () => {
        console.log('\n\n🛑 Cerrando servidores...');
        htmlServer.close();
        odooServer.close();
        reactServer.close();
        process.exit(0);
    });

    process.on('SIGTERM', () => {
        console.log('\n\n🛑 Cerrando servidores...');
        htmlServer.close();
        odooServer.close();
        reactServer.close();
        process.exit(0);
    });
}

// ==================== INICIAR ====================

startAllServers();
