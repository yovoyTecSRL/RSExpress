/**
 * Configuración de Traccar para RS Express
 * Gestiona los parámetros de conexión y autenticación
 */

const TRACCAR_CONFIG = {
    // ============================================
    // CREDENCIALES Y AUTENTICACIÓN
    // ============================================
    
    // API Key para autenticación con Traccar
    API_KEY: 'eyJkYXRhIjo1MDA1Nn0ubTFrRzRFdDBiRk1obDMyMVRGdXNFVHQxQXlTNGI3ODZtL0xYaFdZZmNQWQ',
    
    // ============================================
    // SERVIDORES (Ambiente)
    // ============================================
    
    ENVIRONMENTS: {
        DEMO: {
            name: 'Demostración',
            baseUrl: 'https://demo.traccar.org/api',
            wsUrl: 'wss://demo.traccar.org/api/socket',
            description: 'Servidor de demostración (NO usar en producción)'
        },
        PRODUCTION: {
            name: 'Producción',
            baseUrl: 'https://tu-servidor.com/api',
            wsUrl: 'wss://tu-servidor.com/api/socket',
            description: 'Servidor de producción (configurable)'
        },
        LOCAL: {
            name: 'Local',
            baseUrl: 'http://localhost:8082/api',
            wsUrl: 'ws://localhost:8082/api/socket',
            description: 'Servidor local para desarrollo'
        }
    },
    
    // Ambiente activo por defecto
    DEFAULT_ENVIRONMENT: 'DEMO', // Cambiar a 'PRODUCTION' en producción
    
    // ============================================
    // CONFIGURACIÓN DE CONEXIÓN
    // ============================================
    
    CONNECTION: {
        // Reintentos de conexión WebSocket
        maxReconnectAttempts: 5,
        reconnectDelay: 3000, // milisegundos
        
        // Timeout para peticiones HTTP
        httpTimeout: 10000, // milisegundos
        
        // Keep-alive del WebSocket
        keepAliveInterval: 30000, // milisegundos
    },
    
    // ============================================
    // RASTREO EN TIEMPO REAL
    // ============================================
    
    TRACKING: {
        // Actualizar posición cada X milisegundos
        updateInterval: 2000,
        
        // Zoom del mapa en rastreo
        mapZoom: 15,
        
        // Centrar mapa en posición del conductor
        centerOnDriver: true,
        
        // Mostrar información del conductor
        showDriverInfo: true,
        
        // Precisión mínima requerida (metros)
        minAccuracy: 50
    },
    
    // ============================================
    // ALERTAS Y NOTIFICACIONES
    // ============================================
    
    ALERTS: {
        // Alerta de velocidad excesiva
        speedAlert: {
            enabled: true,
            maxSpeed: 100, // km/h
            notifyUser: true
        },
        
        // Alerta de geofence
        geofenceAlert: {
            enabled: true,
            notifyUser: true,
            sound: true
        },
        
        // Alerta de dispositivo desconectado
        offlineAlert: {
            enabled: true,
            timeoutMinutes: 5,
            notifyUser: true
        }
    },
    
    // ============================================
    // REPORTES Y ESTADÍSTICAS
    // ============================================
    
    REPORTS: {
        // Incluir en reportes
        includeTrips: true,
        includeEvents: true,
        includeStatistics: true,
        
        // Formato de exportación
        exportFormat: 'csv', // 'csv', 'pdf', 'json'
        
        // Período de retención de datos
        dataRetentionDays: 90
    },
    
    // ============================================
    // MAPAS
    // ============================================
    
    MAPS: {
        // Proveedor de mapas
        provider: 'openstreetmap', // 'openstreetmap', 'google', 'mapbox'
        
        // Centro predeterminado
        defaultCenter: {
            lat: 19.4326,
            lng: -99.1332
        },
        
        // Zoom predeterminado
        defaultZoom: 12,
        
        // Mostrar capa de satélite
        showSatellite: false,
        
        // Mostrar tráfico
        showTraffic: false
    },
    
    // ============================================
    // DISPOSITIVOS
    // ============================================
    
    DEVICES: {
        // Sincronizar dispositivos cada X minutos
        syncInterval: 5,
        
        // Mostrar dispositivos offline
        showOfflineDevices: true,
        
        // Agrupar por atributo
        groupBy: 'category', // 'category', 'status', 'none'
    },
    
    // ============================================
    // SEGURIDAD
    // ============================================
    
    SECURITY: {
        // Validar certificado SSL
        verifySsl: true,
        
        // Encriptar datos locales
        encryptLocalData: true,
        
        // Token expira en X minutos
        tokenExpiryMinutes: 60,
        
        // Tiempo de sesión
        sessionTimeout: 30 // minutos
    },
    
    // ============================================
    // CACHÉ
    // ============================================
    
    CACHE: {
        // Cachear dispositivos
        cacheDevices: true,
        devicesCacheTime: 300000, // 5 minutos
        
        // Cachear posiciones
        cachePositions: true,
        positionsCacheTime: 60000, // 1 minuto
        
        // Cachear geofences
        cacheGeofences: true,
        geofencesCacheTime: 600000 // 10 minutos
    },
    
    // ============================================
    // LOGGING
    // ============================================
    
    LOGGING: {
        // Nivel de logging
        level: 'info', // 'debug', 'info', 'warn', 'error'
        
        // Registrar en archivo
        toFile: false,
        
        // Registrar eventos de Traccar
        logTraccarEvents: true,
        
        // Registrar cambios de posición
        logPositionUpdates: false // Puede generar mucho volumen
    }
};

/**
 * Obtener configuración de un ambiente
 */
function getEnvironmentConfig(env = TRACCAR_CONFIG.DEFAULT_ENVIRONMENT) {
    return TRACCAR_CONFIG.ENVIRONMENTS[env];
}

/**
 * Cambiar ambiente
 */
function setEnvironment(env) {
    if (!TRACCAR_CONFIG.ENVIRONMENTS[env]) {
        console.error(`Ambiente no válido: ${env}`);
        return false;
    }
    
    TRACCAR_CONFIG.DEFAULT_ENVIRONMENT = env;
    console.log(`Ambiente cambiado a: ${env}`);
    
    // Necesitará reiniciar la conexión de Traccar
    if (window.app && window.app.traccar) {
        window.app.traccar.disconnect();
        setTimeout(() => {
            window.app.initTraccar();
        }, 1000);
    }
    
    return true;
}

/**
 * Actualizar parámetro de configuración
 */
function updateTraccarConfig(path, value) {
    const keys = path.split('.');
    let obj = TRACCAR_CONFIG;
    
    for (let i = 0; i < keys.length - 1; i++) {
        obj = obj[keys[i]];
    }
    
    obj[keys[keys.length - 1]] = value;
    console.log(`Configuración actualizada: ${path} = ${value}`);
}

/**
 * Obtener parámetro de configuración
 */
function getTraccarConfig(path, defaultValue = null) {
    const keys = path.split('.');
    let obj = TRACCAR_CONFIG;
    
    for (let key of keys) {
        obj = obj[key];
        if (obj === undefined) return defaultValue;
    }
    
    return obj;
}

/**
 * Validar configuración
 */
function validateTraccarConfig() {
    const errors = [];
    
    if (!TRACCAR_CONFIG.API_KEY) {
        errors.push('API_KEY no configurado');
    }
    
    const env = getEnvironmentConfig();
    if (!env) {
        errors.push(`Ambiente inválido: ${TRACCAR_CONFIG.DEFAULT_ENVIRONMENT}`);
    }
    
    if (!env.baseUrl) {
        errors.push('URL base de Traccar no configurada');
    }
    
    if (!env.wsUrl) {
        errors.push('URL de WebSocket de Traccar no configurada');
    }
    
    if (errors.length > 0) {
        console.error('Errores de configuración de Traccar:');
        errors.forEach(error => console.error(`  - ${error}`));
        return false;
    }
    
    console.log('✓ Configuración de Traccar válida');
    return true;
}

/**
 * Mostrar configuración actual
 */
function printTraccarConfig() {
    const env = getEnvironmentConfig();
    
    console.log(`
╔══════════════════════════════════════════════════╗
║   CONFIGURACIÓN DE TRACCAR - RS EXPRESS         ║
╚══════════════════════════════════════════════════╝

Ambiente: ${TRACCAR_CONFIG.DEFAULT_ENVIRONMENT}
Servidor: ${env.name}
URL Base: ${env.baseUrl}
WebSocket: ${env.wsUrl}

Conexión:
  - Reintentos máximos: ${TRACCAR_CONFIG.CONNECTION.maxReconnectAttempts}
  - Delay de reconexión: ${TRACCAR_CONFIG.CONNECTION.reconnectDelay}ms
  - HTTP Timeout: ${TRACCAR_CONFIG.CONNECTION.httpTimeout}ms

Rastreo:
  - Intervalo de actualización: ${TRACCAR_CONFIG.TRACKING.updateInterval}ms
  - Zoom del mapa: ${TRACCAR_CONFIG.TRACKING.mapZoom}

Alertas:
  - Velocidad excesiva: ${TRACCAR_CONFIG.ALERTS.speedAlert.enabled ? `✓ (${TRACCAR_CONFIG.ALERTS.speedAlert.maxSpeed} km/h)` : '✗'}
  - Geofence: ${TRACCAR_CONFIG.ALERTS.geofenceAlert.enabled ? '✓' : '✗'}
  - Dispositivo offline: ${TRACCAR_CONFIG.ALERTS.offlineAlert.enabled ? '✓' : '✗'}

Logging: ${TRACCAR_CONFIG.LOGGING.level}
    `);
}

/**
 * Exportar configuración
 */
window.TraccarConfig = {
    config: TRACCAR_CONFIG,
    getEnvironmentConfig,
    setEnvironment,
    updateTraccarConfig,
    getTraccarConfig,
    validateTraccarConfig,
    printTraccarConfig
};

// Validar configuración al cargar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', validateTraccarConfig);
} else {
    validateTraccarConfig();
}
