/**
 * Dashboard de Flota en Tiempo Real
 * Integración visual para el panel administrativo
 */

class FleetDashboard {
    constructor(containerId, mapId) {
        this.container = document.getElementById(containerId);
        this.mapContainer = document.getElementById(mapId);
        this.map = null;
        this.initialized = false;
        this.stats = {};
        this.updateInterval = null;
    }

    init() {
        console.log('🚗 Inicializando Fleet Dashboard');
        
        if (!this.container) {
            console.error('❌ Contenedor no encontrado');
            return false;
        }

        // Crear HTML del dashboard
        this.container.innerHTML = `
            <div class="fleet-dashboard">
                <!-- ENCABEZADO -->
                <div class="fleet-header">
                    <h2>📊 Panel de Control de Flota</h2>
                    <div class="fleet-controls">
                        <button id="btnRefreshFleet" class="btn-refresh">🔄 Actualizar</button>
                        <button id="btnClearFleetMap" class="btn-clear">🗑️ Limpiar Mapa</button>
                        <button id="btnExportFleetReport" class="btn-export">📥 Exportar Reporte</button>
                    </div>
                </div>

                <!-- MAPA -->
                <div class="fleet-map-container">
                    <div id="fleetMap" style="height: 500px; border-radius: 8px; overflow: hidden;"></div>
                </div>

                <!-- ESTADÍSTICAS -->
                <div class="fleet-stats">
                    <div class="stat-card">
                        <div class="stat-icon">👥</div>
                        <div class="stat-content">
                            <div class="stat-label">Conductores Activos</div>
                            <div class="stat-value" id="statActiveDrivers">0/0</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">📍</div>
                        <div class="stat-content">
                            <div class="stat-label">Entregas Pendientes</div>
                            <div class="stat-value" id="statPendingDeliveries">0</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">✅</div>
                        <div class="stat-content">
                            <div class="stat-label">Completadas Hoy</div>
                            <div class="stat-value" id="statCompletedDeliveries">0</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">⚡</div>
                        <div class="stat-content">
                            <div class="stat-label">Tasa Completación</div>
                            <div class="stat-value" id="statCompletionRate">0%</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">🛣️</div>
                        <div class="stat-content">
                            <div class="stat-label">Distancia Total</div>
                            <div class="stat-value" id="statTotalDistance">0 km</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">📈</div>
                        <div class="stat-content">
                            <div class="stat-label">Eficiencia Promedio</div>
                            <div class="stat-value" id="statAvgEfficiency">0%</div>
                        </div>
                    </div>
                </div>

                <!-- TABLA DE CONDUCTORES -->
                <div class="fleet-section">
                    <h3>👥 Estado de Conductores</h3>
                    <table class="drivers-table">
                        <thead>
                            <tr>
                                <th>Conductor</th>
                                <th>Estado</th>
                                <th>Ubicación</th>
                                <th>Pendientes</th>
                                <th>Completadas</th>
                                <th>Distancia</th>
                                <th>Eficiencia</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="driversTableBody">
                            <tr><td colspan="8" style="text-align: center; color: #999;">Cargando conductores...</td></tr>
                        </tbody>
                    </table>
                </div>

                <!-- TABLA DE ENTREGAS -->
                <div class="fleet-section">
                    <h3>📦 Entregas Pendientes</h3>
                    <table class="deliveries-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Cliente</th>
                                <th>Dirección</th>
                                <th>Prioridad</th>
                                <th>Asignado a</th>
                                <th>Intentos</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="deliveriesTableBody">
                            <tr><td colspan="7" style="text-align: center; color: #999;">Cargando entregas...</td></tr>
                        </tbody>
                    </table>
                </div>

                <!-- LOGS EN VIVO -->
                <div class="fleet-section">
                    <h3>📝 Actividad en Tiempo Real</h3>
                    <div class="fleet-logs" id="fleetLogs">
                        <p style="color: #999;">Esperando actividad...</p>
                    </div>
                </div>
            </div>
        `;

        // Estilos CSS
        this.injectStyles();

        // Inicializar mapa con pequeño delay para que el DOM se renderice
        setTimeout(() => {
            this.initMap();
        }, 100);

        // Event listeners
        document.getElementById('btnRefreshFleet')?.addEventListener('click', () => this.refresh());
        document.getElementById('btnClearFleetMap')?.addEventListener('click', () => this.clearMap());
        document.getElementById('btnExportFleetReport')?.addEventListener('click', () => this.exportReport());

        this.initialized = false; // No marcar como inicializado aún
        this.log('📌 Inicializando Dashboard...', 'info');

        return true;
    }

    initMap() {
        console.log('🗺️ Inicializando mapa...');
        
        if (!window.L) {
            console.error('❌ Leaflet no está cargado');
            return;
        }

        const mapElement = document.getElementById('fleetMap');
        if (!mapElement) {
            console.error('❌ Elemento fleetMap no encontrado');
            return;
        }

        // Asegurar que el elemento tenga dimensiones
        if (mapElement.offsetHeight === 0) {
            console.warn('⚠️ Elemento sin altura, reintentando...');
            setTimeout(() => this.initMap(), 200);
            return;
        }

        try {
            // Crear mapa
            this.map = L.map(mapElement).setView([9.9281, -84.0907], 13);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap',
                maxZoom: 19
            }).addTo(this.map);

            console.log('✅ Mapa creado exitosamente');

            // Inicializar panel de flota
            if (window.driverFleetPanel) {
                window.driverFleetPanel.initWithMap(null, this.map);
                console.log('✅ Panel de flota vinculado al mapa');
            }

            // MARCAR COMO INICIALIZADO Y CARGAR DATOS
            this.initialized = true;
            this.log('✅ Fleet Dashboard inicializado', 'success');
            
            // Cargar datos después de que el mapa esté listo
            setTimeout(() => {
                this.loadFleetData();
            }, 200);

        } catch (error) {
            console.error('❌ Error inicializando mapa:', error.message);
        }
    }

    injectStyles() {
        if (document.getElementById('fleet-dashboard-styles')) return;

        const style = document.createElement('style');
        style.id = 'fleet-dashboard-styles';
        style.textContent = `
            .fleet-dashboard {
                padding: 20px;
                background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            }

            .fleet-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 2px solid #3498db;
            }

            .fleet-header h2 {
                margin: 0;
                color: #2c3e50;
                font-size: 24px;
            }

            .fleet-controls {
                display: flex;
                gap: 10px;
            }

            .fleet-controls button {
                padding: 8px 16px;
                border: none;
                border-radius: 6px;
                background: #3498db;
                color: white;
                cursor: pointer;
                font-weight: bold;
                transition: all 0.3s;
            }

            .fleet-controls button:hover {
                background: #2980b9;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(52, 152, 219, 0.4);
            }

            .btn-clear {
                background: #e74c3c !important;
            }

            .btn-clear:hover {
                background: #c0392b !important;
            }

            .btn-export {
                background: #27ae60 !important;
            }

            .btn-export:hover {
                background: #229954 !important;
            }

            .fleet-map-container {
                margin-bottom: 20px;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }

            .fleet-stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
                margin-bottom: 30px;
            }

            .stat-card {
                background: white;
                padding: 20px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                gap: 15px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                transition: all 0.3s;
            }

            .stat-card:hover {
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
                transform: translateY(-2px);
            }

            .stat-icon {
                font-size: 32px;
            }

            .stat-content {
                flex: 1;
            }

            .stat-label {
                font-size: 12px;
                color: #7f8c8d;
                text-transform: uppercase;
                font-weight: bold;
            }

            .stat-value {
                font-size: 24px;
                font-weight: bold;
                color: #2c3e50;
            }

            .fleet-section {
                background: white;
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 20px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }

            .fleet-section h3 {
                margin: 0 0 15px 0;
                color: #2c3e50;
                border-bottom: 2px solid #ecf0f1;
                padding-bottom: 10px;
            }

            .drivers-table, .deliveries-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 14px;
            }

            .drivers-table thead, .deliveries-table thead {
                background: #ecf0f1;
            }

            .drivers-table th, .deliveries-table th {
                padding: 12px;
                text-align: left;
                font-weight: bold;
                color: #2c3e50;
                border-bottom: 2px solid #bdc3c7;
            }

            .drivers-table td, .deliveries-table td {
                padding: 12px;
                border-bottom: 1px solid #ecf0f1;
            }

            .drivers-table tbody tr:hover, .deliveries-table tbody tr:hover {
                background: #f9f9f9;
            }

            .status-badge {
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: bold;
                display: inline-block;
            }

            .status-activo {
                background: #d4edda;
                color: #155724;
            }

            .status-disponible {
                background: #cce5ff;
                color: #004085;
            }

            .status-inactivo {
                background: #f8d7da;
                color: #721c24;
            }

            .priority-urgente {
                background: #f5c6cb;
                color: #721c24;
            }

            .priority-alta {
                background: #ffeaa7;
                color: #d63031;
            }

            .priority-normal {
                background: #d4edda;
                color: #27ae60;
            }

            .btn-complete {
                padding: 4px 8px;
                background: #27ae60;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
                font-weight: bold;
            }

            .btn-complete:hover {
                background: #229954;
            }

            .fleet-logs {
                background: #ecf0f1;
                padding: 15px;
                border-radius: 6px;
                max-height: 200px;
                overflow-y: auto;
                font-family: 'Courier New', monospace;
                font-size: 12px;
                color: #2c3e50;
            }

            .log-entry {
                padding: 4px 0;
                border-bottom: 1px solid #bdc3c7;
            }

            .log-entry.success {
                color: #27ae60;
            }

            .log-entry.warning {
                color: #f39c12;
            }

            .log-entry.error {
                color: #e74c3c;
            }

            .log-entry.info {
                color: #3498db;
            }

            @media (max-width: 768px) {
                .fleet-stats {
                    grid-template-columns: repeat(2, 1fr);
                }

                .drivers-table, .deliveries-table {
                    font-size: 12px;
                }

                .drivers-table th, .deliveries-table th,
                .drivers-table td, .deliveries-table td {
                    padding: 8px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    loadFleetData() {
        console.log('📊 Cargando datos de flota...');

        try {
            // Obtener datos del panel de flota
            if (!window.driverFleetPanel) {
                console.error('❌ Panel de flota no está disponible');
                this.displayEmptyFleet();
                return;
            }

            const report = window.driverFleetPanel.generateFleetReport();
            
            if (!report || !report.summary) {
                console.error('❌ Reporte vacío');
                this.displayEmptyFleet();
                return;
            }

            // Actualizar estadísticas
            this.updateStats(report);

            // Actualizar tabla de conductores
            this.updateDriversTable(report.drivers);

            // Actualizar tabla de entregas
            this.updateDeliveriesTable(report.deliveries);

            // Renderizar mapa
            if (this.map) {
                window.driverFleetPanel.render();
            }
        } catch (error) {
            console.error('❌ Error cargando datos de flota:', error);
            this.displayEmptyFleet();
        }
    }

    displayEmptyFleet() {
        const tbody = document.getElementById('driversTableBody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #999; padding: 2rem;">Sin datos disponibles</td></tr>';
        }
        const deliveryTbody = document.getElementById('deliveriesTableBody');
        if (deliveryTbody) {
            deliveryTbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #999; padding: 2rem;">Sin entregas pendientes</td></tr>';
        }
    }

    updateStats(report) {
        const summary = report.summary || {};

        const safeSetContent = (elementId, content) => {
            const el = document.getElementById(elementId);
            if (el) el.textContent = content;
        };

        safeSetContent('statActiveDrivers', `${summary.activeDrivers || 0}/${summary.totalDrivers || 0}`);
        safeSetContent('statPendingDeliveries', summary.pendingDeliveries || 0);
        safeSetContent('statCompletedDeliveries', summary.completedDeliveries || 0);
        safeSetContent('statCompletionRate', `${summary.completionRate || 0}%`);
        safeSetContent('statTotalDistance', `${summary.totalDistance || 0} km`);
        safeSetContent('statAvgEfficiency', `${summary.averageEfficiency || 0}%`);

        this.stats = summary;
    }

    updateDriversTable(drivers) {
        const tbody = document.getElementById('driversTableBody');
        if (!tbody) return;

        if (drivers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #999;">Sin conductores</td></tr>';
            return;
        }

        tbody.innerHTML = drivers.map((driver, idx) => `
            <tr>
                <td>${driver.name}</td>
                <td><span class="status-badge status-${driver.status}">${driver.status}</span></td>
                <td>${driver.lat.toFixed(4)}, ${driver.lon.toFixed(4)}</td>
                <td><strong>${driver.pending}</strong></td>
                <td><strong>${driver.completed}</strong></td>
                <td>${driver.totalDistance} km</td>
                <td><strong>${driver.efficiency}%</strong></td>
                <td>
                    <button class="btn-complete" onclick="window.fleetDashboard.viewDriverDetails(${driver.id})">
                        👁️ Ver
                    </button>
                </td>
            </tr>
        `).join('');
    }

    updateDeliveriesTable(deliveries) {
        const tbody = document.getElementById('deliveriesTableBody');
        if (!tbody) return;

        if (deliveries.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #999;">Sin entregas</td></tr>';
            return;
        }

        tbody.innerHTML = deliveries.map(delivery => `
            <tr>
                <td>#${delivery.id}</td>
                <td>${delivery.client}</td>
                <td>${delivery.address}</td>
                <td><span class="priority-${delivery.priority}">${delivery.priority}</span></td>
                <td>${delivery.assignedDriver || '-'}</td>
                <td>${delivery.attempts}</td>
                <td>
                    ${delivery.status === 'pendiente' ? `
                        <button class="btn-complete" onclick="window.fleetDashboard.completeDelivery(${delivery.id}, ${delivery.driverId})">
                            ✅ Completar
                        </button>
                    ` : '<span style="color: #999;">-</span>'}
                </td>
            </tr>
        `).join('');
    }

    log(message, type = 'info') {
        const logsDiv = document.getElementById('fleetLogs');
        if (!logsDiv) return;

        const timestamp = new Date().toLocaleTimeString('es-CR');
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.textContent = `[${timestamp}] ${message}`;

        logsDiv.appendChild(entry);
        logsDiv.scrollTop = logsDiv.scrollHeight;

        // Mantener solo los últimos 50 logs
        while (logsDiv.children.length > 50) {
            logsDiv.removeChild(logsDiv.firstChild);
        }
    }

    refresh() {
        this.log('🔄 Actualizando datos...', 'info');
        this.loadFleetData();
        this.log('✅ Datos actualizados', 'success');
    }

    clearMap() {
        if (window.driverFleetPanel && this.map) {
            window.driverFleetPanel.clear();
            this.log('🗑️ Mapa limpiado', 'warning');
        }
    }

    completeDelivery(deliveryId, driverId) {
        if (window.driverFleetPanel) {
            window.driverFleetPanel.completeDelivery(deliveryId, driverId);
            this.log(`✅ Entrega #${deliveryId} completada`, 'success');
            this.refresh();
        }
    }

    viewDriverDetails(driverId) {
        alert(`Ver detalles del conductor ${driverId}`);
    }

    exportReport() {
        const report = window.driverFleetPanel?.generateFleetReport();
        if (!report) return;

        const csv = this.generateCSV(report);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fleet-report-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();

        this.log('📥 Reporte exportado', 'success');
    }

    generateCSV(report) {
        let csv = 'REPORTE DE FLOTA\n';
        csv += `Generado: ${new Date().toLocaleString('es-CR')}\n\n`;

        csv += 'RESUMEN\n';
        Object.entries(report.summary).forEach(([key, value]) => {
            csv += `${key}: ${value}\n`;
        });

        csv += '\nCONDUCTORES\n';
        csv += 'Nombre,Estado,Completadas,Pendientes,Distancia,Eficiencia\n';
        report.drivers.forEach(driver => {
            csv += `${driver.name},${driver.status},${driver.completed},${driver.pending},${driver.totalDistance},${driver.efficiency}%\n`;
        });

        return csv;
    }
}

// Crear instancia global
window.fleetDashboard = null;

function initFleetDashboard(containerId = 'fleetDashboardContainer', mapId = 'fleetMap') {
    if (window.fleetDashboard) {
        window.fleetDashboard.refresh();
        return window.fleetDashboard;
    }

    window.fleetDashboard = new FleetDashboard(containerId, mapId);
    if (!window.fleetDashboard.init()) {
        console.error('❌ Error inicializando dashboard');
        return null;
    }
    // loadFleetData se llama ahora desde initMap() cuando el mapa está listo
    return window.fleetDashboard;
}

console.log('✅ Fleet Dashboard cargado');
console.log('   Usa: initFleetDashboard("container-id")');
