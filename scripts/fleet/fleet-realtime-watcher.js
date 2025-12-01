/**
 * OBSERVADOR DE CAMBIOS EN VIVO
 * Detecta cambios en datos y refleja en panel de flota
 */

class FleetRealtimeWatcher {
    constructor() {
        this.observers = new Map();
        this.callbacks = {
            onDriverAdded: [],
            onDriverUpdated: [],
            onDeliveryAdded: [],
            onDeliveryUpdated: [],
            onDeliveryCompleted: [],
            onRouteChanged: []
        };
        this.isWatching = false;
    }

    start() {
        if (this.isWatching) return;
        
        console.log('👁️ Iniciando observador de cambios en flota...');
        this.isWatching = true;

        // Crear proxy para app.js
        if (window.app) {
            this.watchAppChanges();
        }

        // Monitorear botones de acción en el dashboard
        this.watchDashboardActions();

        // Escuchar eventos personalizados
        this.setupEventListeners();
    }

    stop() {
        this.isWatching = false;
        console.log('🛑 Observador detenido');
    }

    watchAppChanges() {
        const self = this;

        // Monitorear cambios en trips
        if (window.app && Array.isArray(window.app.trips)) {
            const originalPush = window.app.trips.push;
            window.app.trips.push = function(...args) {
                const result = originalPush.apply(this, args);
                self.callbacks.onDeliveryAdded.forEach(cb => cb(args[0]));
                return result;
            };
        }
    }

    watchDashboardActions() {
        // Escuchar clics en botones de completar entrega
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-complete')) {
                const deliveryId = parseInt(e.target.getAttribute('data-delivery-id'));
                const driverId = parseInt(e.target.getAttribute('data-driver-id'));
                
                this.callbacks.onDeliveryCompleted.forEach(cb => 
                    cb({ deliveryId, driverId })
                );
            }
        });
    }

    setupEventListeners() {
        // Eventos personalizados
        window.addEventListener('driver-position-updated', (e) => {
            this.callbacks.onDriverUpdated.forEach(cb => cb(e.detail));
        });

        window.addEventListener('delivery-completed', (e) => {
            this.callbacks.onDeliveryCompleted.forEach(cb => cb(e.detail));
        });
    }

    on(eventType, callback) {
        if (this.callbacks[eventType]) {
            this.callbacks[eventType].push(callback);
        }
    }

    emit(eventType, data) {
        if (this.callbacks[eventType]) {
            this.callbacks[eventType].forEach(cb => cb(data));
        }
    }
}

// Instancia global
window.fleetWatcher = new FleetRealtimeWatcher();

function initFleetWatcher() {
    window.fleetWatcher.start();
    
    // Conectar con panel de flota
    window.fleetWatcher.on('onDeliveryCompleted', (data) => {
        if (window.fleetDashboard) {
            window.fleetDashboard.completeDelivery(data.deliveryId, data.driverId);
        }
    });

    console.log('✅ Fleet Watcher inicializado');
}

console.log('✅ Fleet Realtime Watcher cargado');
