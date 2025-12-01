/**
 * Ejemplos de Uso - Integración Traccar en RS Express
 * Este archivo contiene ejemplos prácticos de cómo usar Traccar en diferentes casos
 */

// =====================================================
// EJEMPLO 1: Rastrear un conductor en tiempo real
// =====================================================

async function trackDriver() {
    // Obtener el viaje activo
    const activeTrip = app.trips.find(trip => trip.status === 'active');
    
    if (!activeTrip) {
        console.log('No hay viaje activo para rastrear');
        return;
    }
    
    // El dispositivo Traccar está asociado al conductor
    const traccarDeviceId = activeTrip.driver.traccarDeviceId;
    
    // Iniciar rastreo
    const success = await app.startTraccarTracking(activeTrip, traccarDeviceId);
    
    if (success) {
        console.log('✓ Rastreo iniciado');
        
        // La interfaz se actualiza automáticamente con las posiciones
        // El mapa muestra la ubicación actual del conductor
        // La distancia y tiempo estimado se actualizan en tiempo real
    }
}

// Llamar cuando el usuario hace clic en "Ver Ubicación del Conductor"
document.getElementById('trackDriverBtn')?.addEventListener('click', trackDriver);

// =====================================================
// EJEMPLO 2: Obtener estadísticas de conducción diarias
// =====================================================

async function getDailyDrivingStats(driverId) {
    const traccarDeviceId = 456; // Obtener del conductor
    
    // Fechas de hoy
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Obtener estadísticas
    const stats = await app.getTraccarDrivingStats(
        traccarDeviceId,
        today,
        tomorrow
    );
    
    if (stats) {
        return {
            distancia: `${stats.distance} km`,
            velocidadPromedio: `${stats.avgSpeed} km/h`,
            velocidadMaxima: `${stats.maxSpeed} km/h`,
            duracion: `${stats.duration} minutos`,
            hora_inicio: stats.startTime.toLocaleTimeString(),
            hora_fin: stats.endTime.toLocaleTimeString()
        };
    }
}

// Usar en panel de conductor
async function updateDriverStats() {
    const stats = await getDailyDrivingStats(app.currentUser.id);
    
    if (stats) {
        document.getElementById('driverDistance').textContent = stats.distancia;
        document.getElementById('driverAvgSpeed').textContent = stats.velocidadPromedio;
        document.getElementById('driverMaxSpeed').textContent = stats.velocidadMaxima;
    }
}

// =====================================================
// EJEMPLO 3: Mostrar historial de viajes completo
// =====================================================

async function showTripHistory(driverId, days = 7) {
    const traccarDeviceId = 456;
    
    // Calcular rango de fechas
    const toDate = new Date();
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);
    
    // Obtener reporte de actividad
    const report = await app.getTraccarActivityReport(
        traccarDeviceId,
        fromDate,
        toDate
    );
    
    if (!report) {
        console.log('No hay datos disponibles');
        return;
    }
    
    // Mostrar resumen
    console.log(`═══ REPORTE DE ACTIVIDAD ═══`);
    console.log(`Conductor: ${report.deviceName}`);
    console.log(`Período: ${fromDate.toLocaleDateString()} - ${toDate.toLocaleDateString()}`);
    console.log(`Viajes: ${report.summary.totalTrips}`);
    console.log(`Distancia total: ${report.summary.totalDistance} km`);
    console.log(`Duración total: ${report.summary.totalDuration} minutos`);
    console.log(`Eventos: ${report.summary.totalEvents}`);
    
    // Mostrar detalles de cada viaje
    console.log(`\n═══ DETALLES DE VIAJES ═══`);
    report.trips.forEach((trip, index) => {
        console.log(`\nViaje ${index + 1}:`);
        console.log(`  Inicio: ${new Date(trip.startTime).toLocaleString()}`);
        console.log(`  Fin: ${new Date(trip.endTime).toLocaleString()}`);
        console.log(`  Distancia: ${trip.distance} km`);
        console.log(`  Duración: ${trip.duration} minutos`);
        console.log(`  Desde: ${trip.startAddress || 'Desconocido'}`);
        console.log(`  Hasta: ${trip.endAddress || 'Desconocido'}`);
    });
    
    return report;
}

// =====================================================
// EJEMPLO 4: Crear alertas cuando el conductor entra/sale de zonas
// =====================================================

async function setupGeofenceAlerts() {
    if (!app.traccar) return;
    
    // Configurar callback para eventos de geofence
    app.traccar.onEventReceived = (event) => {
        if (event.type === 'geofenceEnter') {
            const geofence = app.traccar.geofences.get(event.geofenceId);
            console.log(`✓ Conductor entró a: ${geofence.name}`);
            
            // Notificar al usuario
            app.showToast(`Conductor en zona: ${geofence.name}`, 'info');
            
            // Enviar notificación push
            sendNotification(`Evento de geofence`, {
                body: `Tu conductor entró a la zona ${geofence.name}`,
                tag: 'geofence'
            });
        } else if (event.type === 'geofenceExit') {
            const geofence = app.traccar.geofences.get(event.geofenceId);
            console.log(`✗ Conductor salió de: ${geofence.name}`);
            
            app.showToast(`Conductor salió de: ${geofence.name}`, 'info');
        }
    };
}

// =====================================================
// EJEMPLO 5: Alertas de velocidad excesiva
// =====================================================

async function setupSpeedAlerts(maxSpeed = 100) {
    if (!app.traccar) return;
    
    app.traccar.onEventReceived = (event) => {
        if (event.type === 'speedExceeded') {
            console.warn(`⚠ ALERTA: Velocidad excesiva detectada`);
            
            app.showToast('⚠ Velocidad excesiva detectada', 'warning');
            
            // Registrar evento
            app.recordSpeedingEvent({
                driverId: event.deviceId,
                timestamp: new Date(),
                severity: 'high'
            });
        }
    };
}

// =====================================================
// EJEMPLO 6: Dashboard de conductores con estado en vivo
// =====================================================

async function displayDriversLiveStatus() {
    if (!app.traccar) return;
    
    const statusContainer = document.getElementById('driversStatus');
    const html = [];
    
    app.traccar.devices.forEach((device, deviceId) => {
        const position = app.traccar.positions.get(deviceId);
        const isOnline = device.status === 'online';
        
        html.push(`
            <div class="driver-card ${isOnline ? 'online' : 'offline'}" data-device-id="${deviceId}">
                <div class="driver-info">
                    <h3>${device.name}</h3>
                    <p class="device-status ${device.status}">${isOnline ? '● En línea' : '● Desconectado'}</p>
                </div>
                
                ${position ? `
                <div class="driver-location">
                    <p><i class="fas fa-map-marker-alt"></i> ${position.latitude.toFixed(4)}, ${position.longitude.toFixed(4)}</p>
                    <p><i class="fas fa-tachometer-alt"></i> ${(position.speed || 0).toFixed(1)} km/h</p>
                </div>
                ` : `
                <p class="no-location">Sin ubicación disponible</p>
                `}
            </div>
        `);
    });
    
    statusContainer.innerHTML = html.join('');
}

// Actualizar cada 5 segundos
setInterval(displayDriversLiveStatus, 5000);

// =====================================================
// EJEMPLO 7: Exportar reporte a CSV
// =====================================================

async function exportTripReportToCSV(driverId, days = 30) {
    const traccarDeviceId = 456;
    
    const toDate = new Date();
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);
    
    const report = await app.getTraccarActivityReport(
        traccarDeviceId,
        fromDate,
        toDate
    );
    
    if (!report) return;
    
    // Crear CSV
    let csv = 'Fecha Inicio,Hora Inicio,Fecha Fin,Hora Fin,Distancia (km),Duración (min),Origen,Destino\n';
    
    report.trips.forEach(trip => {
        const startDate = new Date(trip.startTime);
        const endDate = new Date(trip.endTime);
        
        csv += `${startDate.toLocaleDateString()},${startDate.toLocaleTimeString()},` +
               `${endDate.toLocaleDateString()},${endDate.toLocaleTimeString()},` +
               `${trip.distance},${trip.duration},` +
               `"${trip.startAddress}","${trip.endAddress}"\n`;
    });
    
    // Descargar
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `reporte_viajes_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
}

// =====================================================
// EJEMPLO 8: Monitorear estado de conexión de Traccar
// =====================================================

function monitorTraccarConnection() {
    setInterval(() => {
        const status = app.getTraccarStatus();
        
        console.log(`[Traccar Status]`);
        console.log(`  Conectado: ${status.isConnected ? '✓' : '✗'}`);
        console.log(`  Dispositivos: ${status.devicesCount}`);
        console.log(`  Posiciones: ${status.positionsCount}`);
        console.log(`  Eventos: ${status.eventsCount}`);
        
        // Actualizar indicador en UI
        const indicator = document.getElementById('traccarStatus');
        if (indicator) {
            indicator.className = `status-indicator ${status.isConnected ? 'online' : 'offline'}`;
            indicator.title = status.isConnected ? 'Traccar conectado' : 'Traccar desconectado';
        }
    }, 30000); // Cada 30 segundos
}

monitorTraccarConnection();

// =====================================================
// EJEMPLO 9: Enviar notificación push
// =====================================================

function sendNotification(title, options = {}) {
    if ('Notification' in window) {
        if (Notification.permission === 'granted') {
            new Notification(title, options);
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    new Notification(title, options);
                }
            });
        }
    }
}

// =====================================================
// EJEMPLO 10: Análisis de patrones de conducción
// =====================================================

async function analyzeDrivingPatterns(driverId, days = 30) {
    const stats = await getDailyDrivingStats(driverId);
    
    const patterns = {
        timeOfDay: {},
        speedDistribution: {},
        dailyAverage: {}
    };
    
    // Analizar patrones por hora del día
    const report = await app.getTraccarActivityReport(
        456,
        new Date(Date.now() - days * 24 * 60 * 60 * 1000),
        new Date()
    );
    
    if (report) {
        report.trips.forEach(trip => {
            const startHour = new Date(trip.startTime).getHours();
            patterns.timeOfDay[startHour] = (patterns.timeOfDay[startHour] || 0) + trip.distance;
        });
        
        console.log('Patrones de conducción:');
        console.log(patterns);
    }
    
    return patterns;
}

// =====================================================
// Exportar funciones para uso global
// =====================================================

window.TraccarExamples = {
    trackDriver,
    getDailyDrivingStats,
    showTripHistory,
    setupGeofenceAlerts,
    setupSpeedAlerts,
    displayDriversLiveStatus,
    exportTripReportToCSV,
    monitorTraccarConnection,
    analyzeDrivingPatterns
};
