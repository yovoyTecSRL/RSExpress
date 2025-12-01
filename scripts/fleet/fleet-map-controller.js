/**
 * Fleet Map Controller
 * Controla el mapa interactivo de flota en la página principal
 */

// Ubicación del Headquarters de RSExpress
const RS_EXPRESS_HQ = {
    name: 'RS Express - Headquarters',
    lat: 9.3808796,
    lon: -83.7045467,
    address: 'San Isidro de El General, Costa Rica'
};

let fleetMap = null;
let hqMarker = null;
let fleetMapMarkers = {
    drivers: new Map(),
    deliveries: new Map()
};
let fleetMapSelectedDriver = null;

// Colores para los conductores
const driverColors = ['#27ae60', '#3498db', '#f39c12', '#e74c3c', '#9b59b6', '#1abc9c'];

/**
 * Crear icono del headquarters
 */
function createHQIcon() {
    return L.divIcon({
        className: 'hq-marker',
        html: `
            <div style="
                position: relative;
                width: 60px;
                height: 60px;
                display: flex;
                align-items: center;
                justify-content: center;
            ">
                <!-- Logo/Puntero del HQ -->
                <div style="
                    background: linear-gradient(135deg, #ff6b35 0%, #e74c3c 100%);
                    color: white;
                    border-radius: 50%;
                    width: 60px;
                    height: 60px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    border: 4px solid white;
                    box-shadow: 0 4px 12px rgba(255, 107, 53, 0.6);
                    font-size: 32px;
                    animation: pulse 2s infinite;
                    position: relative;
                ">
                    <i class="fas fa-rocket"></i>
                    <!-- Pulso externo -->
                    <div style="
                        position: absolute;
                        width: 100%;
                        height: 100%;
                        border: 2px solid #ff6b35;
                        border-radius: 50%;
                        animation: pulseBorder 2s infinite;
                    "></div>
                </div>
            </div>
            <style>
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                }
                @keyframes pulseBorder {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    100% { transform: scale(1.4); opacity: 0; }
                }
            </style>
        `,
        iconSize: [60, 60],
        iconAnchor: [30, 30],
        popupAnchor: [0, -30]
    });
}

/**
 * Inicializar mapa de flota
 */
function initFleetMap() {
    // Si el mapa ya está inicializado, no hacer nada
    if (fleetMap) return;

    const mapContainer = document.getElementById('fleetMapContainer');
    if (!mapContainer) {
        console.warn('⚠️ Contenedor del mapa de flota no encontrado');
        return;
    }

    try {
        // Centro en San Isidro de El General (ubicación del HQ)
        const centerLat = 9.3808796;
        const centerLon = -83.7045467;

        // Inicializar mapa con Leaflet
        fleetMap = L.map('fleetMapContainer', {
            center: [centerLat, centerLon],
            zoom: 13,
            zoomControl: false
        });

        // Agregar capa de OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
            className: 'map-tiles'
        }).addTo(fleetMap);

        // Agregar marcador del Headquarters
        hqMarker = L.marker([RS_EXPRESS_HQ.lat, RS_EXPRESS_HQ.lon], { 
            icon: createHQIcon()
        })
        .bindPopup(`
            <div style="width: 280px; font-size: 13px; color: #333;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
                    <i class="fas fa-rocket" style="color: #ff6b35; font-size: 20px;"></i>
                    <strong style="color: #ff6b35; font-size: 16px;">RS Express HQ</strong>
                </div>
                <hr style="margin: 8px 0;">
                <strong>Ubicación:</strong> ${RS_EXPRESS_HQ.address}<br>
                <strong>Coordenadas:</strong> ${RS_EXPRESS_HQ.lat.toFixed(4)}, ${RS_EXPRESS_HQ.lon.toFixed(4)}<br>
                <strong>Centro de Operaciones:</strong> Pérez Zeledón<br>
                <div style="background: #f0f0f0; padding: 8px; border-radius: 4px; margin-top: 8px; font-size: 12px;">
                    ✅ Sistema de flota en línea<br>
                    📡 Conectado a Traccar GPS<br>
                    🚗 4 conductores activos
                </div>
            </div>
        `)
        .addTo(fleetMap);

        console.log('✅ Mapa de flota inicializado correctamente');
        console.log(`📍 Headquarters en: ${RS_EXPRESS_HQ.address}`);

        // Cargar datos de flota
        loadFleetMapData();

        // Actualizar cada 5 segundos
        setInterval(updateFleetMapData, 5000);
    } catch (error) {
        console.error('❌ Error inicializando mapa de flota:', error);
    }
}

/**
 * Cargar datos de flota en el mapa
 */
function loadFleetMapData() {
    if (!window.driverFleetPanel || window.driverFleetPanel.drivers.size === 0) {
        console.warn('⚠️ No hay datos de flota disponibles');
        document.getElementById('fleetDriversList').innerHTML = '<div class="error" style="padding: 20px; text-align: center; color: #e74c3c;">❌ No hay conductores disponibles</div>';
        return;
    }

    updateFleetMapData();
}

/**
 * Actualizar datos en el mapa
 */
function updateFleetMapData() {
    if (!window.driverFleetPanel || !fleetMap) {
        console.warn('⚠️ driverFleetPanel o mapa no disponibles');
        return;
    }

    try {
        const snapshot = getFleetSnapshot();
        const drivers = snapshot.drivers || [];
        const deliveries = snapshot.deliveries || [];

        console.log(`🗺️ Actualizando mapa: ${drivers.length} conductores, ${deliveries.length} entregas`);

        // Actualizar estadísticas
        updateFleetStats(drivers, deliveries);

        // Dibujar conductores
        drawFleetDrivers(drivers);

        // Dibujar entregas
        drawFleetDeliveries(deliveries);

        // Actualizar lista de conductores
        updateFleetDriversList(drivers);
        
        // Actualizar lista de entregas
        updateFleetDeliveriesList(deliveries);
    } catch (error) {
        console.error('❌ Error actualizando mapa de flota:', error);
    }
}

/**
 * Actualizar estadísticas de flota
 */
function updateFleetStats(drivers, deliveries) {
    document.querySelector('[data-stat="total"]').textContent = drivers.length;
    document.querySelector('[data-stat="online"]').textContent = drivers.filter(d => d.status === 'activo').length;
    document.querySelector('[data-stat="deliveries"]').textContent = deliveries.length;
}

/**
 * Dibujar conductores en el mapa
 */
function drawFleetDrivers(drivers) {
    drivers.forEach((driver, index) => {
        const markerId = `driver-${driver.id}`;
        const color = driverColors[index % driverColors.length];

        // Crear icono del conductor con moto
        const icon = L.divIcon({
            className: 'fleet-driver-marker',
            html: `
                <div style="
                    background: ${color};
                    color: white;
                    border-radius: 50%;
                    width: 50px;
                    height: 50px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    border: 3px solid white;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.4);
                    font-size: 28px;
                ">
                    🏍️
                </div>
            `,
            iconSize: [50, 50],
            iconAnchor: [25, 25],
            popupAnchor: [0, -25]
        });

        // Actualizar o crear marcador
        if (fleetMapMarkers.drivers.has(markerId)) {
            const marker = fleetMapMarkers.drivers.get(markerId);
            marker.setLatLng([driver.lat, driver.lon]);
        } else {
            const marker = L.marker([driver.lat, driver.lon], { icon })
                .bindPopup(`
                    <div style="width: 250px; font-size: 12px; color: #333;">
                        <strong style="color: ${color};">🏍️ ${driver.name}</strong><br>
                        <hr style="margin: 5px 0;">
                        <strong>Estado:</strong> ${driver.status}<br>
                        <strong>Entregas completadas:</strong> ${driver.completedDeliveries}<br>
                        <strong>Distancia total:</strong> ${driver.totalDistance.toFixed(2)} km<br>
                        <strong>Eficiencia:</strong> ${driver.efficiency}%<br>
                        <strong>Teléfono:</strong> ${driver.phone || 'N/A'}<br>
                        <strong>Vehículo:</strong> ${driver.vehicle || 'N/A'}
                    </div>
                `)
                .on('click', () => selectFleetDriver(driver.id))
                .addTo(fleetMap);

            fleetMapMarkers.drivers.set(markerId, marker);
        }
    });
}

/**
 * Dibujar entregas en el mapa
 */
function drawFleetDeliveries(deliveries) {
    deliveries.forEach(delivery => {
        const markerId = `delivery-${delivery.id}`;

        // Crear icono de entrega
        const icon = L.divIcon({
            className: 'fleet-delivery-marker',
            html: `
                <div style="
                    background: #3498db;
                    color: white;
                    border-radius: 5px;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    border: 2px solid white;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                    font-size: 14px;
                    cursor: pointer;
                ">
                    📦
                </div>
            `,
            iconSize: [30, 30],
            iconAnchor: [15, 15],
            popupAnchor: [0, -15]
        });

        // Crear marcador
        if (!fleetMapMarkers.deliveries.has(markerId)) {
            const marker = L.marker([delivery.lat, delivery.lon], { icon })
                .bindPopup(`
                    <div style="width: 200px; font-size: 12px; color: #333;">
                        <strong style="color: #3498db;">#${delivery.id} 📦</strong><br>
                        <hr style="margin: 5px 0;">
                        <strong>Cliente:</strong> ${delivery.clientName}<br>
                        <strong>Dirección:</strong> ${delivery.address}<br>
                        <strong>Estado:</strong> ${delivery.status}<br>
                        <strong>Prioridad:</strong> ${delivery.priority}
                    </div>
                `)
                .on('click', () => selectFleetDelivery(delivery.id, delivery))
                .addTo(fleetMap);

            fleetMapMarkers.deliveries.set(markerId, marker);
        }
    });
}

/**
 * Mostrar entregas en lista clickeable
 */
function updateFleetDeliveriesList(deliveries) {
    const deliveriesList = document.getElementById('fleetDeliveriesList');
    
    if (!deliveriesList) return;
    
    deliveriesList.innerHTML = deliveries.map((delivery, index) => {
        const priorityColor = delivery.priority === 'urgente' ? '#ff6b6b' : 
                             delivery.priority === 'alta' ? '#ffd93d' : '#6bcf7f';
        const statusBg = delivery.status === 'completada' ? '#e8f5e9' : 
                        delivery.status === 'en_progreso' ? '#e3f2fd' : '#fff3e0';
        
        return `
            <div class="delivery-item" onclick="selectFleetDelivery(${delivery.id}, ${JSON.stringify(delivery).replace(/"/g, '&quot;')})" style="
                background: ${statusBg};
                padding: 12px;
                margin-bottom: 8px;
                border-radius: 6px;
                border-left: 4px solid ${priorityColor};
                cursor: pointer;
                transition: all 0.3s ease;
            " onmouseover="this.style.boxShadow='0 2px 8px rgba(0,0,0,0.15)'; this.style.transform='translateX(4px)';" 
               onmouseout="this.style.boxShadow='none'; this.style.transform='translateX(0)';">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div style="flex: 1;">
                        <strong style="color: #333; font-size: 13px;">📦 ${delivery.clientName}</strong>
                        <div style="font-size: 11px; color: #666; margin-top: 4px;">
                            📍 ${delivery.address}
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <span style="
                            font-size: 10px;
                            padding: 3px 6px;
                            background: ${priorityColor};
                            color: ${delivery.priority === 'alta' ? '#333' : 'white'};
                            border-radius: 3px;
                            font-weight: bold;
                            display: block;
                            margin-bottom: 4px;
                        ">${delivery.priority.toUpperCase()}</span>
                        <span style="font-size: 10px; color: #666;">ID: ${delivery.id}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Seleccionar una entrega
 */
function selectFleetDelivery(deliveryId, delivery) {
    try {
        // Centrar mapa en la entrega
        if (fleetMap && delivery && delivery.lat && delivery.lon) {
            fleetMap.setView([delivery.lat, delivery.lon], 15);
        }
        
        // Mostrar panel de detalles de la entrega
        showDeliveryDetailsPanel(delivery);
        
        console.log(`✅ Entrega seleccionada: #${deliveryId} - ${delivery.clientName}`);
    } catch (error) {
        console.error('❌ Error seleccionando entrega:', error);
    }
    return false;
}

/**
 * Mostrar panel de detalles de la entrega
 */
function showDeliveryDetailsPanel(delivery) {
    const priorityColor = delivery.priority === 'urgente' ? '#ff6b6b' : 
                         delivery.priority === 'alta' ? '#ffd93d' : '#6bcf7f';
    const statusLabel = delivery.status === 'completada' ? 'Completada ✓' : 
                       delivery.status === 'en_progreso' ? 'En Progreso ⏳' : 'Pendiente ⏱️';
    
    const panelHTML = `
        <div style="
            background: linear-gradient(135deg, #3498db 0%, rgba(52, 152, 219, 0.8) 100%);
            color: white;
            border-radius: 8px;
            padding: 20px;
            margin: 10px 0;
        ">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="margin: 0; font-size: 18px;">📦 Entrega #${delivery.id}</h3>
                <span style="
                    background: rgba(255, 255, 255, 0.3);
                    padding: 5px 12px;
                    border-radius: 20px;
                    font-size: 11px;
                    font-weight: bold;
                ">${statusLabel}</span>
            </div>
            
            <div style="
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 12px;
                margin-bottom: 15px;
                padding: 12px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 6px;
            ">
                <div>
                    <small style="opacity: 0.8;">Cliente</small>
                    <div style="font-size: 14px; font-weight: bold;">${delivery.clientName}</div>
                </div>
                <div>
                    <small style="opacity: 0.8;">Prioridad</small>
                    <div style="
                        font-size: 12px;
                        font-weight: bold;
                        color: ${priorityColor};
                        background: rgba(255, 255, 255, 0.15);
                        padding: 4px 8px;
                        border-radius: 3px;
                        text-align: center;
                    ">${delivery.priority.toUpperCase()}</div>
                </div>
            </div>
            
            <div style="
                padding: 10px;
                background: rgba(255, 255, 255, 0.1);
                border-left: 3px solid rgba(255, 255, 255, 0.5);
                border-radius: 4px;
                margin-bottom: 15px;
                font-size: 13px;
                line-height: 1.6;
            ">
                <strong>📍 Dirección:</strong><br>
                ${delivery.address}<br><br>
                <strong>🚚 Conductor Asignado:</strong><br>
                ${delivery.driverId ? `Driver #${delivery.driverId}` : 'No asignado'}<br><br>
                <strong>📅 Estado:</strong><br>
                ${statusLabel}
            </div>
            
            <div style="
                text-align: center;
                font-size: 11px;
                opacity: 0.8;
                padding: 10px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 4px;
            ">
                Haz click en la moto del conductor para ver su cola completa
            </div>
        </div>
    `;
    
    const detailsPanel = document.getElementById('fleetDriverDetails');
    if (detailsPanel) {
        detailsPanel.innerHTML = panelHTML;
    }
}


/**
 * Actualizar lista de conductores
 */
function updateFleetDriversList(drivers) {
    const driversList = document.getElementById('fleetDriversList');
    
    driversList.innerHTML = drivers.map((driver, index) => {
        const color = driverColors[index % driverColors.length];
        const isActive = fleetMapSelectedDriver?.id === driver.id ? 'active' : '';
        const statusColor = driver.status === 'activo' ? '#27ae60' : '#e74c3c';
        
        // Obtener entregas del conductor
        const queueInfo = window.driverFleetPanel.getDriverQueueInfo(driver.id);
        const queue = queueInfo ? queueInfo.queue : [];
        const pendingCount = queue.filter(d => d.status !== 'completada').length;
        
        return `
            <div class="driver-item ${isActive}" onclick="selectFleetDriver(${driver.id}); return false;" style="cursor: pointer;">
                <div class="driver-item-name">
                    <span class="driver-status-dot" style="background: ${statusColor};"></span>
                    🏍️ ${driver.name}
                </div>
                <div class="driver-item-info">
                    <span><strong>Entregas:</strong> ${driver.completedDeliveries}</span>
                    <span><strong>Distancia:</strong> ${driver.totalDistance.toFixed(1)} km</span>
                    <span><strong>Eficiencia:</strong> ${driver.efficiency}%</span>
                    <span style="color: #ff6b35; font-weight: bold; margin-top: 5px;">
                        📦 Cola: ${pendingCount}/${queue.length} entregas
                    </span>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Seleccionar conductor
 */
function selectFleetDriver(driverId) {
    try {
        const snapshot = getFleetSnapshot();
        fleetMapSelectedDriver = snapshot.drivers.find(d => d.id === driverId);
        
        if (fleetMapSelectedDriver && fleetMap) {
            fleetMap.setView([fleetMapSelectedDriver.lat, fleetMapSelectedDriver.lon], 14);
            updateFleetMapData();
            
            // Mostrar panel de detalles con cola de entregas
            showDriverQueuePanel(driverId);
            console.log(`✅ Conductor seleccionado: ${fleetMapSelectedDriver.name} (ID: ${driverId})`);
        }
    } catch (error) {
        console.error('❌ Error seleccionando conductor:', error);
    }
    return false;
}

/**
 * Mostrar panel de detalles con cola de entregas del conductor
 */
function showDriverQueuePanel(driverId) {
    const queueInfo = window.driverFleetPanel.getDriverQueueInfo(driverId);
    if (!queueInfo) return;
    
    const { driver, queue, pendingDeliveries, completedDeliveries, totalDeliveries, averagePriority } = queueInfo;
    const driverColor = driverColors[(driver.id - 1) % driverColors.length];
    
    // HTML del panel de detalles
    let queueHTML = `
        <div style="
            background: linear-gradient(135deg, ${driverColor} 0%, rgba(${parseInt(driverColor.slice(1,3), 16)}, ${parseInt(driverColor.slice(3,5), 16)}, ${parseInt(driverColor.slice(5,7), 16)}, 0.8) 100%);
            color: white;
            border-radius: 8px;
            padding: 20px;
            margin: 10px 0;
        ">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="margin: 0; font-size: 18px;">🚗 ${driver.name}</h3>
                <span style="
                    background: rgba(255, 255, 255, 0.3);
                    padding: 5px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: bold;
                ">Estado: ${driver.status.toUpperCase()}</span>
            </div>
            
            <!-- Estadísticas del conductor -->
            <div style="
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
                margin-bottom: 15px;
                padding: 10px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 6px;
            ">
                <div>
                    <small style="opacity: 0.8;">Entregas Completadas</small>
                    <div style="font-size: 20px; font-weight: bold;">${completedDeliveries}</div>
                </div>
                <div>
                    <small style="opacity: 0.8;">Entregas Pendientes</small>
                    <div style="font-size: 20px; font-weight: bold; color: #fff9e6;">${pendingDeliveries}</div>
                </div>
                <div>
                    <small style="opacity: 0.8;">Distancia Total</small>
                    <div style="font-size: 18px; font-weight: bold;">${driver.totalDistance.toFixed(1)} km</div>
                </div>
                <div>
                    <small style="opacity: 0.8;">Eficiencia</small>
                    <div style="font-size: 18px; font-weight: bold;">${driver.efficiency}%</div>
                </div>
            </div>
            
            <!-- Prioridad Promedio -->
            <div style="
                padding: 8px 12px;
                background: rgba(255, 255, 255, 0.15);
                border-left: 4px solid rgba(255, 255, 255, 0.5);
                border-radius: 4px;
                margin-bottom: 15px;
                font-size: 14px;
            ">
                <strong>Prioridad Promedio de Cola:</strong> 
                <span style="
                    font-weight: bold;
                    color: ${averagePriority === 'Urgente' ? '#ff6b6b' : averagePriority === 'Alta' ? '#ffd93d' : '#6bcf7f'};
                ">
                    ${averagePriority}
                </span>
            </div>
            
            <!-- Título de Cola -->
            <div style="
                font-size: 16px;
                font-weight: bold;
                margin-bottom: 12px;
                display: flex;
                align-items: center;
                gap: 8px;
            ">
                <span>📦 COLA DE ENTREGAS (${pendingDeliveries}/${totalDeliveries})</span>
            </div>
            
            <!-- Lista de entregas en cola -->
            <div style="
                max-height: 300px;
                overflow-y: auto;
                padding: 0;
            ">
    `;
    
    // Agregar entregas en la cola
    queue.forEach((delivery, index) => {
        const priorityColor = delivery.priority === 'urgente' ? '#ff6b6b' : 
                             delivery.priority === 'alta' ? '#ffd93d' : '#6bcf7f';
        const statusIcon = delivery.status === 'completada' ? '✓' : 
                          delivery.status === 'en_progreso' ? '⏳' : '⏱️';
        const statusText = delivery.status === 'completada' ? 'Completada' : 
                          delivery.status === 'en_progreso' ? 'En Progreso' : 'Pendiente';
        
        queueHTML += `
            <div style="
                background: rgba(255, 255, 255, 0.1);
                padding: 12px;
                margin-bottom: 8px;
                border-radius: 6px;
                border-left: 4px solid ${priorityColor};
                display: flex;
                justify-content: space-between;
                align-items: center;
            ">
                <div style="flex: 1;">
                    <div style="
                        font-weight: bold;
                        font-size: 14px;
                        margin-bottom: 4px;
                    ">
                        ${index + 1}. ${delivery.clientName}
                    </div>
                    <div style="
                        font-size: 12px;
                        opacity: 0.8;
                    ">
                        📍 ${delivery.address}
                    </div>
                </div>
                <div style="
                    text-align: right;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    align-items: flex-end;
                ">
                    <span style="
                        font-size: 12px;
                        padding: 3px 8px;
                        background: ${priorityColor};
                        border-radius: 3px;
                        font-weight: bold;
                    ">
                        ${delivery.priority.toUpperCase()}
                    </span>
                    <span style="
                        font-size: 11px;
                        opacity: 0.8;
                    ">
                        ${statusIcon} ${statusText}
                    </span>
                </div>
            </div>
        `;
    });
    
    queueHTML += `
            </div>
        </div>
    `;
    
    // Insertar el panel en el contenedor
    const detailsPanel = document.getElementById('fleetDriverDetails');
    if (detailsPanel) {
        detailsPanel.innerHTML = queueHTML;
        detailsPanel.style.display = 'block';
    } else {
        // Si no existe, crear el contenedor
        const fleetPanel = document.querySelector('.fleet-layout-container');
        if (fleetPanel) {
            const newPanel = document.createElement('div');
            newPanel.id = 'fleetDriverDetails';
            newPanel.style.cssText = 'padding: 10px; max-height: 500px; overflow-y: auto; background: #f8f9fa; border-radius: 8px;';
            newPanel.innerHTML = queueHTML;
            fleetPanel.appendChild(newPanel);
        }
    }
    
    console.log(`\n%c🚗 DETALLES DE CONDUCTOR`, 'color: ${driverColor}; font-weight: bold; font-size: 14px');
    console.log(`%c${driver.name}`, 'color: ${driverColor}; font-weight: bold; font-size: 12px');
    console.log(`📦 Cola: ${pendingDeliveries} entregas pendientes de ${totalDeliveries} totales`);
    console.log(`⚡ Prioridad promedio: ${averagePriority}`);
    console.log('Entregas:', queue.map(d => `${d.id}: ${d.clientName}`).join(', '));
}

/**
 * Controles del mapa
 */
function fleetMapZoomIn() {
    if (fleetMap) fleetMap.zoomIn();
}

function fleetMapZoomOut() {
    if (fleetMap) fleetMap.zoomOut();
}

function fleetMapCenter() {
    if (fleetMap) {
        fleetMap.setView([9.3808796, -83.7045467], 13);
        fleetMapSelectedDriver = null;
        updateFleetMapData();
    }
}

function fleetMapCenterHQ() {
    if (fleetMap && hqMarker) {
        fleetMap.setView([RS_EXPRESS_HQ.lat, RS_EXPRESS_HQ.lon], 15);
        hqMarker.openPopup();
        fleetMapSelectedDriver = null;
    }
}

function fleetMapRefresh() {
    loadFleetMapData();
}

/**
 * Obtener snapshot de flota
 */
function getFleetSnapshot() {
    if (!window.driverFleetPanel) {
        return { drivers: [], deliveries: [] };
    }

    // Llamar al método correcto del objeto driverFleetPanel
    if (typeof window.driverFleetPanel.getFleetSnapshot === 'function') {
        return window.driverFleetPanel.getFleetSnapshot();
    }

    // Fallback: construir snapshot manualmente desde los Maps
    const drivers = Array.from(window.driverFleetPanel.drivers.values() || []);
    const deliveries = Array.from(window.driverFleetPanel.deliveries.values() || []);
    
    return { drivers, deliveries };
}

// Inicializar mapa cuando se carga la página de flota
document.addEventListener('DOMContentLoaded', () => {
    // Observar cambios de página
    const navLinks = document.querySelectorAll('[data-page="fleet"]');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            // Inicializar mapa después de que se muestre la página
            setTimeout(() => {
                const fleetPage = document.getElementById('fleetPage');
                if (fleetPage && fleetPage.classList.contains('active')) {
                    initFleetMap();
                }
            }, 100);
        });
    });

    // Inicializar si la página de flota es la activa
    const fleetPage = document.getElementById('fleetPage');
    if (fleetPage && fleetPage.classList.contains('active')) {
        setTimeout(initFleetMap, 500);
    }
});

/**
 * Cambiar pestaña en el sidebar (Conductores/Entregas)
 */
function switchFleetTab(tabName) {
    // Actualizar botones
    document.querySelectorAll('.fleet-tab-btn').forEach(btn => {
        const isActive = btn.getAttribute('data-tab') === tabName;
        btn.style.color = isActive ? '#ff6b35' : '#999';
        btn.style.borderBottom = isActive ? '3px solid #ff6b35' : 'none';
        btn.classList.toggle('active', isActive);
    });
    
    // Mostrar/ocultar listas
    const driversList = document.getElementById('fleetDriversList');
    const deliveriesList = document.getElementById('fleetDeliveriesList');
    const driversTitle = document.getElementById('driversTitle');
    const deliveriesTitle = document.getElementById('deliveriesTitle');
    
    if (tabName === 'drivers') {
        driversList.style.display = 'block';
        deliveriesList.style.display = 'none';
        driversTitle.style.display = 'block';
        deliveriesTitle.style.display = 'none';
    } else {
        driversList.style.display = 'none';
        deliveriesList.style.display = 'block';
        driversTitle.style.display = 'none';
        deliveriesTitle.style.display = 'block';
    }
}
