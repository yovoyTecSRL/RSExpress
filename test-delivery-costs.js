/**
 * Test script to verify delivery cost calculations
 */

const ShippingCalculator = require('./scripts/delivery/shipping-calculator');
const calculator = new ShippingCalculator();

console.log('\n✅ VERIFICACIÓN DE CÁLCULOS DE ENTREGAS\n');
console.log('='.repeat(60));

// Test cases based on the delivery examples
const testCases = [
    { id: '#1007', distance: 2.5, expected: 2000, description: 'María García López' },
    { id: '#1008', distance: 1.5, expected: 2000, description: 'Roberto Gómez Chávez' },
    { id: '#1009', distance: 6.93, expected: 2000, description: 'Software Solutions' },
    { id: '#1010', distance: 9.38, expected: 2000, description: 'Carmen Morales Vega' },
    { id: '#1011', distance: 11.04, expected: 2208, description: 'Turismo Costa Rica' },
    { id: '#1012', distance: 1.58, expected: 2000, description: 'David López Castillo' }
];

let allPassed = true;

testCases.forEach(test => {
    const result = calculator.calculateShippingPrice(test.distance, false, false);
    const passed = result === test.expected;
    allPassed = allPassed && passed;
    
    const status = passed ? '✅' : '❌';
    const formatted = '₡' + result.toLocaleString('es-CR', { maximumFractionDigits: 2 });
    const expectedFormatted = '₡' + test.expected.toLocaleString('es-CR', { maximumFractionDigits: 2 });
    
    console.log(`\n${status} ${test.id} - ${test.description}`);
    console.log(`   Distancia: ${test.distance} km`);
    console.log(`   Resultado: ${formatted}`);
    console.log(`   Esperado:  ${expectedFormatted}`);
    
    if (!passed) {
        console.log(`   ⚠️  DIFERENCIA: ${result - test.expected}`);
    }
});

console.log('\n' + '='.repeat(60));
if (allPassed) {
    console.log('\n✅ TODOS LOS CÁLCULOS SON CORRECTOS\n');
} else {
    console.log('\n❌ ALGUNOS CÁLCULOS TIENEN ERRORES\n');
}
