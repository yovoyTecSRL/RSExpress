/**
 * Shipping Calculator - Calcula precio de envío según distancia
 * Usa coordenadas GPS y algoritmo Haversine para distancia no lineal
 */

class ShippingCalculator {
    constructor() {
        // HQ RSExpress en CDMX
        this.hq = {
            nombre: 'HQ RSExpress',
            lat: 19.4326,
            lng: -99.1332
        };

        // Ubicaciones predefinidas en CDMX
        this.locations = [
            { id: 1, nombre: 'Paseo de la Reforma 505, CDMX', lat: 19.4349, lng: -99.1868 },
            { id: 2, nombre: 'Avenida Paseo de los Tamarindos 400, CDMX', lat: 19.3904, lng: -99.2450 },
            { id: 3, nombre: 'Centro Comercial Polanco, CDMX', lat: 19.4269, lng: -99.2061 },
            { id: 4, nombre: 'Calle Médicos 234, CDMX', lat: 19.3987, lng: -99.1564 },
            { id: 5, nombre: 'Plaza Mayor 456, Centro Histórico, CDMX', lat: 19.4327, lng: -99.1332 },
            { id: 6, nombre: 'La Unión, San Isidro, CDMX', lat: 19.3598, lng: -99.0948 },
            { id: 7, nombre: 'Avenida Tecnológica 100, CDMX', lat: 19.4589, lng: -99.2156 },
            { id: 8, nombre: 'Boulevar Miguel de Cervantes, CDMX', lat: 19.4167, lng: -99.2317 },
            { id: 9, nombre: 'Calle Tolstoi 123, Anzures, CDMX', lat: 19.4380, lng: -99.2001 },
            { id: 10, nombre: 'Avenida Santa Fe 505, CDMX', lat: 19.3892, lng: -99.2567 }
        ];

        // Tarifas base (precio por km)
        this.rates = {
            base: 50,        // $50 tarifa base
            perKm: 8,        // $8 por km
            rush: 1.5,       // 50% extra en horario pico (16-20hrs)
            express: 2.0     // 100% extra para envíos express
        };
    }

    /**
     * Calcula distancia entre dos puntos usando Haversine
     * Retorna distancia en km
     */
    calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371; // Radio de la Tierra en km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        
        const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    /**
     * Calcula precio de envío
     */
    calculateShippingPrice(distanceKm, isExpress = false, isRushHour = false) {
        let price = this.rates.base + (distanceKm * this.rates.perKm);
        
        if (isRushHour) {
            price *= this.rates.rush;
        }
        
        if (isExpress) {
            price *= this.rates.express;
        }
        
        return Math.round(price * 100) / 100;
    }

    /**
     * Calcula envío desde HQ a una ubicación
     */
    calculateFromHQ(locationId, isExpress = false) {
        const location = this.locations.find(l => l.id === locationId);
        if (!location) {
            return null;
        }

        const distance = this.calculateDistance(
            this.hq.lat, this.hq.lng,
            location.lat, location.lng
        );

        const isRushHour = this.isRushHour();
        const price = this.calculateShippingPrice(distance, isExpress, isRushHour);

        return {
            distance: Math.round(distance * 100) / 100,
            price: price,
            isRushHour: isRushHour,
            isExpress: isExpress,
            location: location,
            breakdown: {
                base: this.rates.base,
                perKm: this.rates.perKm * distance,
                rushMultiplier: isRushHour ? this.rates.rush : 1,
                expressMultiplier: isExpress ? this.rates.express : 1
            }
        };
    }

    /**
     * Verifica si es horario pico (16-20 hrs)
     */
    isRushHour() {
        const hour = new Date().getHours();
        return hour >= 16 && hour < 20;
    }

    /**
     * Obtiene todas las ubicaciones
     */
    getLocations() {
        return this.locations;
    }

    /**
     * Obtiene ubicación por ID
     */
    getLocation(id) {
        return this.locations.find(l => l.id === id);
    }

    /**
     * Genera ruta de prueba (waypoints)
     */
    generateRoute(startLat, startLng, endLat, endLng, waypoints = 5) {
        const route = [];
        
        for (let i = 0; i <= waypoints; i++) {
            const t = i / waypoints;
            const lat = startLat + (endLat - startLat) * t;
            const lng = startLng + (endLng - startLng) * t;
            
            // Agregar pequeña variación para que no sea lineal
            const variation = Math.sin(i) * 0.001;
            route.push({
                lat: lat + variation,
                lng: lng + variation,
                step: i + 1,
                total: waypoints + 1
            });
        }
        
        return route;
    }
}

// Exportar para Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ShippingCalculator;
}
