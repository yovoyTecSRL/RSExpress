#!/usr/bin/env node
/**
 * 🚀 RSEXPRESS - Servicios de Inicio Automático
 * Inicia: Proxy OdooProxy (puerto 9999) + Servidor Principal (puerto 5555)
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// ================================
// 1. ODOO PROXY SERVER (Puerto 9999)
// ================================

const ODOO_HOST = 'rsexpress.online';
const ODOO_PORT = 443;
const PROXY_PORT = 9999;

const proxyServer = http.createServer((req, res) => {
    // Agregar headers CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Content-Type', 'application/json');

    // Manejar preflight OPTIONS
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Solo aceptar POST a /jsonrpc
    if (req.method !== 'POST' || req.url !== '/jsonrpc') {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Endpoint not found. Use POST /jsonrpc' }));
        return;
    }

    // Leer el body de la request
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        try {
            // Enviar a Odoo via HTTPS
            const options = {
                hostname: ODOO_HOST,
                port: ODOO_PORT,
                path: '/jsonrpc',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(body)
                },
                rejectUnauthorized: false // Permitir certificados auto-firmados en desarrollo
            };

            const proxyReq = https.request(options, (proxyRes) => {
                let responseBody = '';
                proxyRes.on('data', chunk => {
                    responseBody += chunk.toString();
                });

                proxyRes.on('end', () => {
                    res.writeHead(proxyRes.statusCode, {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    });
                    res.end(responseBody);
                    console.log(`[PROXY] ${new Date().toISOString()} - ${proxyRes.statusCode}`);
                });
            });

            proxyReq.on('error', (err) => {
                console.error(`[PROXY ERROR] ${err.message}`);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message }));
            });

            proxyReq.write(body);
            proxyReq.end();

        } catch (err) {
            console.error(`[PROXY ERROR] ${err.message}`);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
        }
    });
});

// ================================
// 2. HTTP SERVER (Puerto 5555)
// ================================

const HTTP_PORT = 5555;
const PROJECT_ROOT = path.resolve(__dirname, '../../');

const httpServer = http.createServer((req, res) => {
    // Eliminar query strings de la URL
    let url = req.url.split('?')[0];
    
    // Manejo de rutas especiales
    let filePath = url;
    
    // Si pide un archivo en /scripts/, servirlo desde /scripts/
    if (filePath.startsWith('/scripts/')) {
        filePath = path.join(PROJECT_ROOT, filePath);
    } else if (filePath.startsWith('/test/')) {
        filePath = path.join(PROJECT_ROOT, filePath);
    } else if (filePath.startsWith('/docs/')) {
        filePath = path.join(PROJECT_ROOT, filePath);
    } else if (filePath.startsWith('/assets/')) {
        filePath = path.join(PROJECT_ROOT, filePath);
    } else {
        // Para archivos en raíz (index.html, orders-from-crm.html, etc)
        filePath = path.join(PROJECT_ROOT, filePath === '/' ? 'index.html' : filePath);
    }
    
    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.wav': 'audio/wav',
        '.mp4': 'video/mp4',
        '.woff': 'application/font-woff',
        '.ttf': 'application/font-ttf',
        '.eot': 'application/vnd.ms-fontobject',
        '.otf': 'application/font-otf'
    };

    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                console.log(`[HTTP 404] ${req.url}`);
                res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end('<h1>404 - Archivo no encontrado</h1><p>Ruta: ' + req.url + '</p><p>Archivo: ' + filePath + '</p>');
            } else {
                console.log(`[HTTP ERROR] ${err.code}`);
                res.writeHead(500);
                res.end('Error del servidor: ' + err.code);
            }
        } else {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
            console.log(`[HTTP 200] ${req.url}`);
        }
    });
});

// ================================
// 3. INICIAR SERVICIOS
// ================================

const startServices = () => {
    console.log(`
╔════════════════════════════════════════════════════╗
║      🚀 RSEXPRESS - INICIANDO SERVICIOS            ║
╚════════════════════════════════════════════════════╝
    `);

    // Iniciar proxy
    proxyServer.listen(PROXY_PORT, '0.0.0.0', () => {
        console.log(`
✅ PROXY SERVIDOR (OdooProxy)
   ├─ Puerto: ${PROXY_PORT}
   ├─ URL: http://localhost:${PROXY_PORT}/jsonrpc
   ├─ Destino: https://${ODOO_HOST}:${ODOO_PORT}/jsonrpc
   └─ CORS: ✅ Habilitado
        `);
    });

    // Iniciar HTTP Server
    httpServer.listen(HTTP_PORT, '0.0.0.0', () => {
        console.log(`
✅ HTTP SERVIDOR (RSExpress)
   ├─ Puerto: ${HTTP_PORT}
   ├─ URL: http://localhost:${HTTP_PORT}
   ├─ Root: ${PROJECT_ROOT}
   └─ CORS: ✅ Habilitado

🌐 INTERFACES WEB DISPONIBLES:
   • http://localhost:${HTTP_PORT}/orders-from-crm.html
   • http://localhost:${HTTP_PORT}/fleet-dashboard.html
   • http://localhost:${HTTP_PORT}/index.html

✨ Servicios listos:
   • OdooProxy → http://localhost:${PROXY_PORT}/jsonrpc
   • HTTP Server → http://localhost:${HTTP_PORT}

📝 Uso en código:
   const connector = new OdooConnector({
       url: 'http://localhost:${PROXY_PORT}',
       database: 'odoo19',
       uid: 5,
       token: 'tu_token'
   });
        `);
    });

    proxyServer.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.error(`❌ Puerto ${PROXY_PORT} ya está en uso`);
            console.log(`   Intenta: lsof -i :${PROXY_PORT}`);
        } else {
            console.error(`❌ Error del proxy:`, err.message);
        }
        process.exit(1);
    });

    httpServer.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.error(`❌ Puerto ${HTTP_PORT} ya está en uso`);
            console.log(`   Intenta: lsof -i :${HTTP_PORT}`);
        } else {
            console.error(`❌ Error del HTTP Server:`, err.message);
        }
        process.exit(1);
    });

    // Manejar Ctrl+C
    process.on('SIGINT', () => {
        console.log('\n\n🛑 Deteniendo servicios...');
        proxyServer.close(() => {
            console.log('✅ Proxy cerrado');
        });
        httpServer.close(() => {
            console.log('✅ HTTP Server cerrado');
            process.exit(0);
        });
        
        // Forzar cierre después de 5 segundos
        setTimeout(() => {
            console.log('⚠️ Forzando cierre...');
            process.exit(1);
        }, 5000);
    });
};

startServices();
