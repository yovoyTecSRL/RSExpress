/**
 * Shipping Calculator - Calcula precio de envío según distancia
 * Usa coordenadas GPS y algoritmo Haversine para distancia no lineal
 */

class ShippingCalculator {
    constructor() {
        // HQ RSExpress en Pérez Zeledón, Costa Rica
        this.hq = {
            nombre: 'HQ RSExpress',
            lat: 9.3778,
            lng: -83.7274
        };

        // Ubicaciones predefinidas en Pérez Zeledón
        this.locations = [
            { id: 1, nombre: 'Centro Comercial Pérez Zeledón, San Isidro', lat: 9.3800, lng: -83.7285 },
            { id: 2, nombre: 'Hospital de Pérez Zeledón, San Isidro', lat: 9.3750, lng: -83.7300 },
            { id: 3, nombre: 'Mercado Municipal, Buenos Aires', lat: 9.3600, lng: -83.7400 },
            { id: 4, nombre: 'Parque Central, Uvita', lat: 9.3156, lng: -83.7310 },
            { id: 5, nombre: 'Marino Ballena National Park, Ojochal', lat: 9.2800, lng: -83.7450 },
            { id: 6, nombre: 'Supermercado Walmart, San Isidro', lat: 9.3850, lng: -83.7280 },
            { id: 7, nombre: 'Colegio San Isidro Labrador, San Isidro', lat: 9.3900, lng: -83.7200 },
            { id: 8, nombre: 'Terminal de Autobuses, San Isidro', lat: 9.3820, lng: -83.7360 },
            { id: 9, nombre: 'Restaurante El Castillo, Ojochal', lat: 9.2970, lng: -83.7520 },
            { id: 10, nombre: 'Playas Uvita y Marino Ballena, Uvita', lat: 9.2900, lng: -83.7380 }
        ];

        // Tarifas en colones costarricenses (₡)
        this.rates = {
            base: 2000,      // ₡2000 tarifa base
            perKm: 200,      // ₡200 por km
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
     * Fórmula: Si distancia <= 10 km: ₡2000
     *          Si distancia > 10 km: ₡2000 + ((distancia - 10) × ₡200)
     */
    calculateShippingPrice(distanceKm, isExpress = false, isRushHour = false) {
        let price;
        
        // Tarifa plana de ₡2000 para hasta 10 km
        // Para distancias mayores a 10 km, se agrega ₡200 por cada km extra
        if (distanceKm <= 10) {
            price = 2000;  // Tarifa plana
        } else {
            const extraKm = distanceKm - 10;
            price = 2000 + (extraKm * 200);
        }
        
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
                base: 2000,
                extraKm: Math.max(0, distance - 10),
                extraCost: Math.max(0, (distance - 10) * 200),
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
     * Genera ruta con waypoints no lineales (más realista)
     * Utiliza variaciones sinusoidales para crear un patrón natural
     */
    generateRoute(startLat, startLng, endLat, endLng, numWaypoints = 5) {
        const route = [];
        const totalPoints = numWaypoints + 2; // incluye start y end
        
        for (let i = 0; i < totalPoints; i++) {
            const t = i / (totalPoints - 1);
            
            // Interpolación base lineal
            const lat = startLat + (endLat - startLat) * t;
            const lng = startLng + (endLng - startLng) * t;
            
            // Variación no lineal para crear waypoints más realistas
            // Usa combinación de seno y coseno para desviaciones naturales
            const latVariation = Math.sin(t * Math.PI) * Math.cos(i * 0.7) * 0.0015;
            const lngVariation = Math.cos(t * Math.PI) * Math.sin(i * 0.9) * 0.0015;
            
            // Distancia acumulada desde el inicio
            let accumulatedDistance = 0;
            if (i > 0) {
                const prevPoint = route[i - 1];
                accumulatedDistance = prevPoint.accumulatedDistance + 
                    this.calculateDistance(prevPoint.lat, prevPoint.lng, 
                                         lat + latVariation, lng + lngVariation);
            }
            
            route.push({
                lat: parseFloat((lat + latVariation).toFixed(6)),
                lng: parseFloat((lng + lngVariation).toFixed(6)),
                step: i + 1,
                total: totalPoints,
                progress: Math.round(t * 100),
                accumulatedDistance: Math.round(accumulatedDistance * 100) / 100,
                timestamp: new Date(Date.now() + i * 5 * 60000) // 5 minutos entre puntos
            });
        }
        
        return route;
    }

    /**
     * Calcula información detallada de una ruta entre dos ubicaciones
     */
    calculateRouteInfo(startId, endId, numWaypoints = 5) {
        const start = this.getLocation(startId) || this.hq;
        const end = this.getLocation(endId);
        
        if (!end && endId !== 'HQ') {
            return null;
        }
        
        const distance = this.calculateDistance(
            start.lat, start.lng,
            end.lat, end.lng
        );
        
        const route = this.generateRoute(start.lat, start.lng, end.lat, end.lng, numWaypoints);
        const isRushHour = this.isRushHour();
        const price = this.calculateShippingPrice(distance, false, isRushHour);
        
        return {
            from: start,
            to: end,
            distance: Math.round(distance * 100) / 100,
            price: price,
            isRushHour: isRushHour,
            currency: '₡',
            estimatedTime: Math.ceil(distance / 50) + ' minutos', // Estimado a 50km/h
            waypoints: route,
            breakdown: {
                baseRate: '₡2000',
                ratePerExtraKm: '₡200/km',
                extraKm: Math.max(0, distance - 10),
                extraCost: Math.round(Math.max(0, (distance - 10) * 200) * 100) / 100,
                rushHourMultiplier: isRushHour ? `${(this.rates.rush - 1) * 100}%` : '0%',
                finalPrice: price
            }
        };
    }
}

// Exportar para Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ShippingCalculator;
}
