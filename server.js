/**
 * 🚀 Servidor Web RSExpress - Múltiples Puertos
 * 5555: HTML - pruebas UI (entrega-cards.html)
 * 7777: React app (Vite)
 * 9999: Proxy Odoo
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT_HTML = 5555;  // HTML UI Server
const PORT_REACT = 7777; // React Vite (managed by vite itself)
const PORT_ODOO = 9999;  // Odoo Proxy
const HOST = 'localhost';

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

// ============ FUNCIÓN PARA INICIAR PROXY ============

let proxyProcess = null;

function startOdooProxy() {
    const proxyScript = path.join(__dirname, 'scripts', 'odoo', 'odoo-proxy.js');
    
    console.log(`\n[Server] 🔄 Iniciando Proxy Odoo en puerto ${PROXY_PORT}...`);
    
    proxyProcess = spawn('node', [proxyScript], {
        stdio: 'inherit',
        detached: false
    });

    proxyProcess.on('error', (err) => {
        console.error(`[Server] ❌ Error iniciando proxy: ${err.message}`);
    });

    proxyProcess.on('exit', (code) => {
        if (code !== null) {
            console.log(`[Server] ⚠️  Proxy salió con código ${code}`);
        }
    });

    return proxyProcess;
}

// Crear servidor
const server = http.createServer((req, res) => {
    // Loguear petición
    console.log(`📥 ${new Date().toLocaleTimeString()} - ${req.method} ${req.url}`);

    // Ruta base
    const basePath = __dirname;
    let filePath = path.join(basePath, req.url);

    // Prevenir traversal attacks
    if (!filePath.startsWith(basePath)) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('Forbidden');
        return;
    }

    // Servir carpeta como index.html
    if (req.url === '/' || req.url === '') {
        filePath = path.join(basePath, 'delivery-cards.html');
    }

    // Extensión del archivo
    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'text/plain; charset=utf-8';

    // Leer y servir archivo
    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                console.log(`   ❌ No encontrado: ${filePath}`);
                res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>404 - No Encontrado</title>
                        <style>
                            body { font-family: Arial, sans-serif; margin: 50px; }
                            h1 { color: #d32f2f; }
                            a { color: #1976d2; text-decoration: none; }
                        </style>
                    </head>
                    <body>
                        <h1>404 - Página No Encontrada</h1>
                        <p>No se pudo encontrar: <code>${req.url}</code></p>
                        <p><a href="/">Volver al inicio</a></p>
                    </body>
                    </html>
                `, 'utf-8');
            } else {
                console.log(`   ❌ Error: ${err.message}`);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Error interno del servidor');
            }
        } else {
            console.log(`   ✅ ${ext} (${content.length} bytes)`);
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
});

// Iniciar servidor
server.listen(PORT_HTML, HOST, () => {
    console.log(`
╔═══════════════════════════════════════════════════════╗
║  🚀 SERVIDOR RSEXPRESS - 3 INSTANCIAS ACTIVAS        ║
╚═══════════════════════════════════════════════════════╝

  🌐 SERVIDOR HTML (UI Testing):
    📍 URL: http://${HOST}:${PORT_HTML}
    📄 Archivos: delivery-cards.html, orders-from-crm.html, etc.
    
  ⚛️  REACT APP (Vite):
    📍 URL: http://${HOST}:${PORT_REACT}
    🔥 Hot Reload Habilitado
    
  🔄 PROXY ODOO:
    📍 URL: http://${HOST}:${PORT_ODOO}
    ✅ Estado: Iniciando...

  📋 Archivos disponibles en 5555:
    ✅ /delivery-cards.html - Entregas principales
    ✅ /deliveries-perez-zeledon.html - Demo Pérez Zeledón
    ✅ /delivery-card-demo.html - Demo de tarjetas
    ✅ /fleet-dashboard.html - Dashboard de flota
    ✅ /delivery-orders.html - Órdenes de entrega
    ✅ /orders-from-crm.html - Órdenes desde CRM (requiere proxy)
  
  ⏱️  Presiona CTRL+C para detener TODOS los servidores

═══════════════════════════════════════════════════════
    `);
    
    // Iniciar proxy de Odoo automáticamente
    startOdooProxy();
});

// Manejar errores
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Error: Puerto ${PORT_HTML} ya está en uso`);
        process.exit(1);
    } else {
        console.error('❌ Error del servidor:', err);
    }
});

// Manejo de señales
process.on('SIGINT', () => {
    console.log('\n📛 Cerrando servidor y proxy...');
    if (proxyProcess) {
        proxyProcess.kill();
    }
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n📛 Cerrando servidor y proxy...');
    if (proxyProcess) {
        proxyProcess.kill();
    }
    process.exit(0);
});
