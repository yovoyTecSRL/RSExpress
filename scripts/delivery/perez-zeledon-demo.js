/**
 * RSExpress - Demo de Tarifas y Ubicaciones
 * Pérez Zeledón, Costa Rica
 * 
 * ✅ Tarifa: ₡2000 si distancia ≤ 10 km, sino ₡2000 + (km extra × ₡200)
 * ✅ Precio por km extra:  ₡200/km
 * ✅ Rush hour: +50% (16:00-20:00 hrs)
 * ✅ 10 ubicaciones predefinidas en Pérez Zeledón con coordenadas reales
 * ✅ Generación de rutas con waypoints (no lineales)
 */

// Importar ShippingCalculator
const ShippingCalculator = require('./shipping-calculator');

class PeezZeledonDemo {
    constructor() {
        this.calculator = new ShippingCalculator();
        this.currentHour = new Date().getHours();
        this.isRushHour = this.currentHour >= 16 && this.currentHour < 20;
    }

    /**
     * Muestra todas las ubicaciones disponibles
     */
    displayLocations() {
        console.log('\n🗺️  UBICACIONES PREDEFINIDAS EN PÉREZ ZELEDÓN');
        console.log('='.repeat(80));
        console.log(`📍 HQ RSExpress - Lat: ${this.calculator.hq.lat}, Lng: ${this.calculator.hq.lng}\n`);
        
        this.calculator.getLocations().forEach((loc, index) => {
            console.log(`${index + 1}. ${loc.nombre}`);
            console.log(`   📍 Coordenadas: ${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`);
            console.log();
        });
    }

    /**
     * Muestra las tarifas actuales
     */
    displayRates() {
        console.log('\n💰 TARIFAS RSEXPRESS PÉREZ ZELEDÓN');
        console.log('='.repeat(80));
        console.log(`💵 Tarifa Plana (≤ 10 km):  ₡2000`);
        console.log(`📏 Precio por km extra:     ₡200/km (para distancia > 10 km)`);
        console.log(`⏰ Horario Pico (Rush):     +${(this.calculator.rates.rush - 1) * 100}% (16:00-20:00 hrs)`);
        console.log(`🚀 Envío Express:           +${(this.calculator.rates.express - 1) * 100}%`);
        console.log();
        console.log(`Fórmula: precio = (distancia ≤ 10) ? 2000 : 2000 + ((distancia - 10) × 200)`);
        console.log();
        console.log(`⏱️  Hora actual: ${this.currentHour}:00`);
        console.log(`🚨 Estado Rush Hour: ${this.isRushHour ? '✅ ACTIVO' : '❌ Inactivo'}`);
        console.log();
    }

    /**
     * Calcula y muestra precio desde HQ a cada ubicación
     */
    displayPricingFromHQ() {
        console.log('\n📦 PRICING DESDE HQ RSEXPRESS');
        console.log('='.repeat(80));
        
        const results = [];
        this.calculator.getLocations().forEach(loc => {
            const price = this.calculator.calculateFromHQ(loc.id);
            results.push({
                location: loc.nombre,
                distance: price.distance,
                baseCost: price.breakdown.base,
                distanceCost: price.breakdown.perKm,
                subtotal: price.breakdown.base + price.breakdown.perKm,
                rushMultiplier: price.breakdown.rushMultiplier,
                finalPrice: price.price,
                isRush: price.isRushHour
            });
        });

        // Mostrar resultados organizados
        console.log(`\n${' '.repeat(2)}# │ Ubicación${' '.repeat(40)} │ Dist│ Precio`);
        console.log('-'.repeat(80));
        
        results.forEach((r, i) => {
            const rushIndicator = r.isRush ? '🚨' : '  ';
            const name = r.location.substring(0, 45).padEnd(45);
            console.log(
                `${rushIndicator} ${(i + 1).toString().padStart(2)} │ ${name} │ ` +
                `${r.distance.toString().padStart(5)}km │ ₡${r.finalPrice.toString().padStart(7)}`
            );
        });

        console.log('\n' + '='.repeat(80));
        console.log(`Total de ubicaciones: ${results.length}`);
        console.log(`Precio mínimo: ₡${Math.min(...results.map(r => r.finalPrice))}`);
        console.log(`Precio máximo: ₡${Math.max(...results.map(r => r.finalPrice))}`);
        const avgPrice = results.reduce((sum, r) => sum + r.finalPrice, 0) / results.length;
        console.log(`Precio promedio: ₡${Math.round(avgPrice)}`);
        console.log();
    }

    /**
     * Muestra ruta detallada entre dos ubicaciones
     */
    displayRoute(fromId, toId) {
        console.log(`\n🛣️  RUTA DETALLADA: Ubicación ${fromId} → Ubicación ${toId}`);
        console.log('='.repeat(80));
        
        const routeInfo = this.calculator.calculateRouteInfo(fromId, toId, 8);
        
        if (!routeInfo) {
            console.log('❌ Ubicación no encontrada');
            return;
        }

        console.log(`De: ${routeInfo.from.nombre}`);
        console.log(`Hacia: ${routeInfo.to.nombre}`);
        console.log(`\n📊 Información del Viaje:`);
        console.log(`  • Distancia: ${routeInfo.distance} km`);
        console.log(`  • Tiempo estimado: ${routeInfo.estimatedTime}`);
        console.log(`  • Precio final: ${routeInfo.currency}${routeInfo.price}`);
        console.log(`  • Horario Pico: ${routeInfo.isRushHour ? '✅ SÍ (+50%)' : '❌ No'}`);
        
        console.log(`\n💰 Desglose de Costo:`);
        console.log(`  • Tarifa plana (≤ 10 km): ${routeInfo.breakdown.baseRate}`);
        if (routeInfo.distance > 10) {
            console.log(`  • Km extra: ${routeInfo.breakdown.extraKm.toFixed(2)} km`);
            console.log(`  • Costo km extra (${routeInfo.breakdown.extraKm.toFixed(2)}km × ₡200): ₡${routeInfo.breakdown.extraCost}`);
            console.log(`  • Subtotal: ₡${routeInfo.breakdown.baseRate.replace('₡', '')} + ₡${routeInfo.breakdown.extraCost} = ₡${(parseFloat(routeInfo.breakdown.baseRate.replace('₡', '')) + routeInfo.breakdown.extraCost).toFixed(2)}`);
        } else {
            console.log(`  • Distancia dentro de tarifa plana`);
        }
        console.log(`  • Multiplicador Rush Hour: ${routeInfo.breakdown.rushHourMultiplier}`);
        console.log(`  • Precio final: ₡${routeInfo.breakdown.finalPrice}`);
        
        console.log(`\n🗺️  WAYPOINTS (${routeInfo.waypoints.length} puntos):`);
        console.log(`${'Pt'.padEnd(4)} │ Latitud${' '.repeat(8)} │ Longitud${' '.repeat(7)} │ ${' '.repeat(7)}Dist Acum │ Progreso`);
        console.log('-'.repeat(80));
        
        routeInfo.waypoints.forEach((wp, idx) => {
            const progress = wp.progress;
            const progressBar = '█'.repeat(Math.floor(progress / 5)) + '░'.repeat(20 - Math.floor(progress / 5));
            console.log(
                `${wp.step.toString().padEnd(4)}│ ${wp.lat.toFixed(6).padEnd(8)} │ ${wp.lng.toFixed(6).padEnd(8)} │ ` +
                `${wp.accumulatedDistance.toString().padStart(7)} km │ [${progressBar}] ${progress}%`
            );
        });
        
        console.log();
    }

    /**
     * Simula múltiples rutas y calcula estadísticas
     */
    generateStatistics() {
        console.log('\n📈 ESTADÍSTICAS DE RUTAS');
        console.log('='.repeat(80));
        
        const stats = {
            totalRoutes: 0,
            totalDistance: 0,
            totalCost: 0,
            routes: []
        };

        // Calcular precio entre todas las ubicaciones
        for (let i = 1; i <= 10; i++) {
            for (let j = 1; j <= 10; j++) {
                if (i !== j) {
                    const routeInfo = this.calculator.calculateRouteInfo(i, j, 5);
                    stats.routes.push(routeInfo);
                    stats.totalRoutes++;
                    stats.totalDistance += routeInfo.distance;
                    stats.totalCost += routeInfo.price;
                }
            }
        }

        console.log(`Total de rutas posibles (A→B): ${stats.totalRoutes}`);
        console.log(`Distancia total recorrida: ${Math.round(stats.totalDistance)} km`);
        console.log(`Costo total acumulado: ₡${Math.round(stats.totalCost)}`);
        console.log(`Costo promedio por ruta: ₡${Math.round(stats.totalCost / stats.totalRoutes)}`);
        console.log(`Distancia promedio por ruta: ${(stats.totalDistance / stats.totalRoutes).toFixed(2)} km`);
        
        // Top 5 rutas más caras
        const topRoutes = [...stats.routes]
            .sort((a, b) => b.price - a.price)
            .slice(0, 5);
        
        console.log('\n🔴 Top 5 Rutas Más Caras:');
        topRoutes.forEach((route, idx) => {
            console.log(
                `  ${idx + 1}. ${route.from.nombre.substring(0, 30)} → ` +
                `${route.to.nombre.substring(0, 30)}`
            );
            console.log(`     Distancia: ${route.distance}km | Precio: ₡${route.price}`);
        });

        // Top 5 rutas más baratas
        const cheapRoutes = [...stats.routes]
            .sort((a, b) => a.price - b.price)
            .slice(0, 5);
        
        console.log('\n🟢 Top 5 Rutas Más Baratas:');
        cheapRoutes.forEach((route, idx) => {
            console.log(
                `  ${idx + 1}. ${route.from.nombre.substring(0, 30)} → ` +
                `${route.to.nombre.substring(0, 30)}`
            );
            console.log(`     Distancia: ${route.distance}km | Precio: ₡${route.price}`);
        });
        
        console.log();
    }

    /**
     * Ejecuta la demostración completa
     */
    runFullDemo() {
        console.log('\n');
        console.log('╔' + '═'.repeat(78) + '╗');
        console.log('║' + ' '.repeat(78) + '║');
        console.log('║' + '🚚 RSExpress - Sistema de Tarifas Pérez Zeledón, Costa Rica'.padEnd(78) + '║');
        console.log('║' + ' '.repeat(78) + '║');
        console.log('╚' + '═'.repeat(78) + '╝');
        
        this.displayRates();
        this.displayLocations();
        this.displayPricingFromHQ();
        
        // Mostrar ejemplos de rutas
        this.displayRoute(1, 5);  // Centro a Marino Ballena
        this.displayRoute(6, 9);  // Walmart a Restaurante
        this.displayRoute(1, 10); // Centro a Playas
        
        this.generateStatistics();
        
        console.log('\n' + '═'.repeat(80));
        console.log('✅ Demostración completada');
        console.log('═'.repeat(80) + '\n');
    }
}

// Ejecutar demostración si se ejecuta directamente
if (require.main === module) {
    const demo = new PeezZeledonDemo();
    demo.runFullDemo();
}

module.exports = PeezZeledonDemo;
