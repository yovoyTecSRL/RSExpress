/**
 * Optimización de Rutas para RS Express
 * Utiliza algoritmos como Nearest Neighbor, 2-Opt para optimizar entregas
 * Integración con Traccar para rastreo en tiempo real
 */

class RouteOptimizer {
    constructor() {
        this.routes = [];
        this.deliveries = [];
        this.vehicles = [];
        this.optimizedRoutes = [];
    }

    /**
     * Calcular distancia entre dos puntos usando Haversine
     * @param {number} lat1 - Latitud del punto 1
     * @param {number} lon1 - Longitud del punto 1
     * @param {number} lat2 - Latitud del punto 2
     * @param {number} lon2 - Longitud del punto 2
     * @returns {number} Distancia en km
     */
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Radio de la tierra en km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    /**
     * Algoritmo Nearest Neighbor para construcción de ruta
     * Comienza en el depósito y siempre va al cliente más cercano no visitado
     * @param {Array} clients - Array de clientes con {id, lat, lon, address}
     * @param {Object} depot - Depósito con {lat, lon}
     * @returns {Array} Ruta optimizada
     */
    nearestNeighbor(clients, depot) {
        const route = [depot];
        const unvisited = [...clients];
        let currentLocation = depot;

        console.log(`[RouteOptimizer] Iniciando Nearest Neighbor con ${clients.length} clientes`);

        while (unvisited.length > 0) {
            let nearest = null;
            let nearestDistance = Infinity;
            let nearestIndex = -1;

            // Encontrar cliente más cercano
            for (let i = 0; i < unvisited.length; i++) {
                const distance = this.calculateDistance(
                    currentLocation.lat,
                    currentLocation.lon,
                    unvisited[i].lat,
                    unvisited[i].lon
                );

                if (distance < nearestDistance) {
                    nearestDistance = distance;
                    nearest = unvisited[i];
                    nearestIndex = i;
                }
            }

            if (nearest) {
                route.push(nearest);
                currentLocation = nearest;
                unvisited.splice(nearestIndex, 1);
            }
        }

        // Volver al depósito
        route.push(depot);

        return route;
    }

    /**
     * Algoritmo 2-Opt para mejorar la ruta
     * Elimina cruces innecesarios en la ruta
     * @param {Array} route - Ruta inicial
     * @param {number} maxIterations - Máximo de iteraciones
     * @returns {Array} Ruta mejorada
     */
    twoOpt(route, maxIterations = 1000) {
        console.log(`[RouteOptimizer] Aplicando 2-Opt con máx ${maxIterations} iteraciones`);

        let improved = true;
        let iteration = 0;
        let bestRoute = [...route];
        let bestDistance = this.calculateRouteDistance(bestRoute);

        while (improved && iteration < maxIterations) {
            improved = false;
            iteration++;

            for (let i = 1; i < bestRoute.length - 2; i++) {
                for (let k = i + 1; k < bestRoute.length - 1; k++) {
                    const newRoute = this.twoOptSwap(bestRoute, i, k);
                    const newDistance = this.calculateRouteDistance(newRoute);

                    if (newDistance < bestDistance) {
                        bestRoute = newRoute;
                        bestDistance = newDistance;
                        improved = true;
                        break;
                    }
                }
                if (improved) break;
            }
        }

        console.log(`[RouteOptimizer] 2-Opt completado: ${iteration} iteraciones, distancia: ${bestDistance.toFixed(2)} km`);

        return bestRoute;
    }

    /**
     * Intercambiar segmentos en la ruta (operación básica de 2-Opt)
     */
    twoOptSwap(route, i, k) {
        const newRoute = [
            ...route.slice(0, i),
            ...route.slice(i, k + 1).reverse(),
            ...route.slice(k + 1)
        ];
        return newRoute;
    }

    /**
     * Calcular distancia total de una ruta
     */
    calculateRouteDistance(route) {
        let totalDistance = 0;
        for (let i = 0; i < route.length - 1; i++) {
            totalDistance += this.calculateDistance(
                route[i].lat,
                route[i].lon,
                route[i + 1].lat,
                route[i + 1].lon
            );
        }
        return totalDistance;
    }

    /**
     * Algoritmo de barrido angular (Sweep Algorithm)
     * Útil para distribuciones geográficas
     * @param {Array} clients - Array de clientes
     * @param {Object} depot - Depósito (centro)
     * @returns {Array} Ruta optimizada
     */
    sweepAlgorithm(clients, depot) {
        console.log(`[RouteOptimizer] Iniciando Sweep Algorithm con ${clients.length} clientes`);

        // Calcular ángulos desde el depósito
        const clientsWithAngles = clients.map(client => ({
            ...client,
            angle: Math.atan2(client.lat - depot.lat, client.lon - depot.lon)
        }));

        // Ordenar por ángulo
        clientsWithAngles.sort((a, b) => a.angle - b.angle);

        // Construir ruta
        const route = [depot, ...clientsWithAngles, depot];

        console.log(`[RouteOptimizer] Sweep Algorithm: ${clientsWithAngles.length} clientes ordenados por ángulo`);

        return route;
    }

    /**
     * Optimizar múltiples rutas para múltiples vehículos
     * @param {Array} deliveries - Entregas a realizar
     * @param {Array} vehicles - Vehículos disponibles
     * @param {Object} depot - Depósito central
     * @returns {Array} Rutas optimizadas por vehículo
     */
    optimizeMultipleRoutes(deliveries, vehicles, depot) {
        console.log(`[RouteOptimizer] Optimizando ${deliveries.length} entregas para ${vehicles.length} vehículos`);

        const optimized = [];

        // Asignar entregas a vehículos por capacidad
        const vehicleAssignments = this.assignDeliveriesToVehicles(deliveries, vehicles, depot);

        // Optimizar cada ruta
        for (let i = 0; i < vehicleAssignments.length; i++) {
            const assignment = vehicleAssignments[i];
            
            // Aplicar Nearest Neighbor + 2-Opt
            let route = this.nearestNeighbor(assignment.deliveries, depot);
            route = this.twoOpt(route);

            const distance = this.calculateRouteDistance(route);
            const time = this.estimateTime(distance);

            optimized.push({
                vehicleId: assignment.vehicleId,
                route: route,
                distance: distance,
                estimatedTime: time,
                deliveriesCount: assignment.deliveries.length
            });

            console.log(`[RouteOptimizer] Vehículo ${assignment.vehicleId}: ${assignment.deliveries.length} entregas, ${distance.toFixed(2)} km, ${time} min`);
        }

        return optimized;
    }

    /**
     * Asignar entregas a vehículos basado en capacidad y zona
     */
    assignDeliveriesToVehicles(deliveries, vehicles, depot) {
        console.log(`[RouteOptimizer] Asignando ${deliveries.length} entregas a ${vehicles.length} vehículos`);

        const assignments = vehicles.map(vehicle => ({
            vehicleId: vehicle.id,
            deliveries: [],
            capacity: vehicle.capacity || Infinity,
            currentLoad: 0
        }));

        // Ordenar entregas por cercanía al depósito
        const sortedDeliveries = deliveries.sort((a, b) => {
            const distA = this.calculateDistance(depot.lat, depot.lon, a.lat, a.lon);
            const distB = this.calculateDistance(depot.lat, depot.lon, b.lat, b.lon);
            return distA - distB;
        });

        // Asignar entregas usando bin packing
        for (const delivery of sortedDeliveries) {
            const weight = delivery.weight || 1;
            
            // Encontrar vehículo con espacio
            let bestAssignment = null;
            let minLoad = Infinity;

            for (const assignment of assignments) {
                if (assignment.currentLoad + weight <= assignment.capacity &&
                    assignment.currentLoad < minLoad) {
                    minLoad = assignment.currentLoad;
                    bestAssignment = assignment;
                }
            }

            // Si no hay espacio, usar el con menor carga
            if (!bestAssignment) {
                bestAssignment = assignments.reduce((min, curr) =>
                    curr.currentLoad < min.currentLoad ? curr : min
                );
            }

            bestAssignment.deliveries.push(delivery);
            bestAssignment.currentLoad += weight;
        }

        return assignments.filter(a => a.deliveries.length > 0);
    }

    /**
     * Estimar tiempo de viaje basado en distancia
     * Usa velocidad promedio de 40 km/h en ciudad
     */
    estimateTime(distanceKm) {
        const averageSpeed = 40; // km/h
        const timeHours = distanceKm / averageSpeed;
        const timeMinutes = Math.round(timeHours * 60);
        return timeMinutes;
    }

    /**
     * Generar resumen de optimización
     */
    generateOptimizationReport(optimizedRoutes) {
        const totalDeliveries = optimizedRoutes.reduce((sum, r) => sum + r.deliveriesCount, 0);
        const totalDistance = optimizedRoutes.reduce((sum, r) => sum + r.distance, 0);
        const totalTime = optimizedRoutes.reduce((sum, r) => sum + r.estimatedTime, 0);
        const avgDeliveriesPerRoute = (totalDeliveries / optimizedRoutes.length).toFixed(2);

        return {
            totalRoutes: optimizedRoutes.length,
            totalDeliveries,
            totalDistanceKm: totalDistance.toFixed(2),
            totalTimeMinutes: totalTime,
            averageDeliveriesPerRoute: avgDeliveriesPerRoute,
            routes: optimizedRoutes
        };
    }
}

// Inicializar optimizer globalmente
window.routeOptimizer = new RouteOptimizer();

console.log('✅ Módulo RouteOptimizer cargado');
console.log('   Disponible en: window.routeOptimizer');
console.log('   Métodos: nearestNeighbor(), twoOpt(), sweepAlgorithm(), optimizeMultipleRoutes()');
