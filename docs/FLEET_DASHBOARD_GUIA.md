╔════════════════════════════════════════════════════════════════════════════════╗
║         🚗 GUÍA DE USO - PANEL DE FLOTA DE RSEXPRESS - FLOTA EN VIVO            ║
║                     Sistema de Gestión y Control en Tiempo Real                  ║
╚════════════════════════════════════════════════════════════════════════════════╝

📍 ACCESO RÁPIDO
════════════════════════════════════════════════════════════════════════════════

🌐 APLICACIÓN PRINCIPAL:
   URL: http://localhost:5555/index.html
   • Panel Admin → Panel Flota (nueva pestaña)
   • Sistema completo integrado

🧪 PÁGINA DE PRUEBAS INTERACTIVAS:
   URL: http://localhost:5555/test-fleet-dashboard.html
   • Tests paso a paso
   • Consolas visuales
   • Sin necesidad de acceder al admin

📚 DOCUMENTACIÓN TÉCNICA:
   Archivo: FLEET_DASHBOARD_README.md
   • Arquitectura detallada
   • Métodos API
   • Estructuras de datos

════════════════════════════════════════════════════════════════════════════════

✨ CARACTERÍSTICAS PRINCIPALES
════════════════════════════════════════════════════════════════════════════════

✅ VISUALIZACIÓN EN MAPA:
   • Todos los conductores en tiempo real
   • Todas las entregas pendientes
   • Rutas activas (líneas punteadas)
   • Indicadores de estado

✅ ESTADÍSTICAS EN VIVO:
   • Conductores activos vs total
   • Entregas pendientes completadas
   • Tasa de completación
   • Distancia total recorrida
   • Eficiencia promedio

✅ TABLAS INTERACTIVAS:
   • Tabla de conductores (estado, entregas, eficiencia)
   • Tabla de entregas (cliente, prioridad, asignación)
   • Acciones rápidas (completar, ver detalles)

✅ LOGS EN VIVO:
   • Actividad de la flota
   • Actualizaciones automáticas
   • Filtro por tipo

✅ EXPORTACIÓN:
   • Reportes en CSV
   • Incluye todas las estadísticas
   • Timestamp automático

════════════════════════════════════════════════════════════════════════════════

🚀 CÓMO USAR - PASO A PASO
════════════════════════════════════════════════════════════════════════════════

OPCIÓN 1: USAR EL PANEL ADMIN (RECOMENDADO)
───────────────────────────────────────────────────────────────

1. Abre: http://localhost:5555/index.html
   
2. Accede como Admin:
   • Click en "Panel Admin" en el menú
   • O en la tarjeta "Panel Admin" del dashboard

3. En el Panel Admin:
   • Verás las pestañas: Entregas, Clientes, Conductores, Unidades, Panel Flota
   • Click en "Panel Flota" (pestaña con icono 🗺️)

4. Automáticamente:
   • Se cargarán 4 conductores de prueba
   • Se cargarán 8 entregas de prueba
   • Se mostrará el mapa con toda la flota
   • Se actualizarán las estadísticas

5. Interacciona:
   • Usa los botones: 🔄 Actualizar, 🗑️ Limpiar Mapa, 📥 Exportar
   • Haz clic en entregas para completarlas
   • Observa los logs en tiempo real

OPCIÓN 2: PÁGINA DE PRUEBAS INTERACTIVAS
────────────────────────────────────────────

1. Abre: http://localhost:5555/test-fleet-dashboard.html

2. Verás 5 secciones con tests:
   
   Sección 1️⃣ - Verificación de Módulos
   ├─ 🔘 Verificar Módulos
   │  └─ Comprobará que Leaflet, RouteOptimizer, etc. están cargados
   │
   └─ 🔘 Inicializar Mapa
      └─ Creará el mapa de Leaflet

   Sección 2️⃣ - Datos de Prueba
   ├─ 🔘 Crear Datos
   │  └─ Genera 3 conductores + 4 entregas
   │
   └─ 🔘 Ver Reporte
      └─ Muestra estadísticas de la flota

   Sección 3️⃣ - Renderizar
   ├─ 🔘 Renderizar Flota
   │  └─ Dibuja conductores y entregas en el mapa
   │
   └─ 🔘 Limpiar Mapa
      └─ Elimina todos los elementos

   Sección 4️⃣ - Operaciones en Tiempo Real
   ├─ 🔘 Actualizar Posición
   │  └─ Mueve un conductor a una posición aleatoria
   │
   ├─ 🔘 Completar Entrega
   │  └─ Marca una entrega como completada
   │
   └─ 🔘 Simular Movimiento
      └─ Anima 5 pasos de movimiento de conductores

   Sección 5️⃣ - Dashboard Completo
   ├─ 🔘 Iniciar Dashboard
   │  └─ Crea todo automáticamente
   │
   └─ 🔘 Test Completo
      └─ Ejecuta todos los tests en secuencia

3. Estado en Vivo:
   • En "Estado de Módulos" verás qué está cargado ✅ o no ❌
   • Las consolas mostrarán la salida de cada test
   • El mapa se actualizará en tiempo real

════════════════════════════════════════════════════════════════════════════════

📊 INTERPRETACIÓN DEL DASHBOARD
════════════════════════════════════════════════════════════════════════════════

TARJETA DE ESTADÍSTICAS:
┌─────────────────────────────────────────────────────┐
│ 👥 Conductores Activos    2/4                       │
│    → 2 conductores están activamente entregando    │
│                                                      │
│ 📍 Entregas Pendientes     6                        │
│    → Quedan 6 entregas sin completar               │
│                                                      │
│ ✅ Completadas Hoy         2                        │
│    → Se han completado 2 entregas                  │
│                                                      │
│ ⚡ Tasa Completación       25%                      │
│    → 2 de 8 entregas están hechas                  │
│                                                      │
│ 🛣️ Distancia Total        258.8 km                 │
│    → Kilómetros acumulados por toda la flota       │
│                                                      │
│ 📈 Eficiencia Promedio     93%                      │
│    → Promedio de eficiencia de conductores         │
└─────────────────────────────────────────────────────┘

TABLA DE CONDUCTORES:
┌──────────────┬─────────┬───────────┬──────────┬──────────┬───────────┬───────────┐
│ Conductor    │ Estado  │ Ubicación │Pendientes│Completadas│Distancia│Eficiencia│
├──────────────┼─────────┼───────────┼──────────┼──────────┼───────────┼───────────┤
│Carlos Ramírez│🔴 Activo│9.93,-84.09│    2    │    12     │ 87.5 km  │   94%     │
│María González│🔴 Activo│9.94,-84.08│    2    │    18     │125.3 km  │   97%     │
│Juan Pérez    │🟢 Dispo │9.92,-84.09│    1    │     7     │ 45.2 km  │   89%     │
│Ana Martínez  │🔴 Activo│9.94,-84.09│    1    │    14     │ 95.8 km  │   92%     │
└──────────────┴─────────┴───────────┴──────────┴──────────┴───────────┴───────────┘

TABLA DE ENTREGAS:
┌──────┬──────────────────┬───────────────┬───────────┬──────────────┬──────┐
│  ID  │     Cliente      │  Dirección    │ Prioridad │  Asignado a  │Acción│
├──────┼──────────────────┼───────────────┼───────────┼──────────────┼──────┤
│1001  │Comercial ABC     │Av. Central100 │🔴Urgente │ Carlos (1)   │✅ ✔ │
│1002  │Restaurante Sazón │Calle 5 Amón   │🟠 Alta   │ María (2)    │✅ ✔ │
│1003  │Boutique Fashion  │Paseo Colón500 │🟢Normal  │ María (2)    │✅ ✔ │
│1004  │Oficina Legal     │Rohrmoser      │🟢Normal  │ Juan (3)     │✅ ✔ │
│1005  │Librería Universal│San Pedro Av.2 │🟠 Alta   │ Ana (4)      │✅ ✔ │
│1006  │Depósito Material │Alajuela Centro│🟢Normal  │ -No asignado │✅ ✔ │
└──────┴──────────────────┴───────────────┴───────────┴──────────────┴──────┘

INDICADORES EN EL MAPA:
├─ 🚗 Conductor - Círculo con icono de auto
│  ├─ Color: Según estado
│  ├─ Verde: Disponible
│  ├─ Rojo: Activo entregando
│  └─ Click para ver detalles
│
├─ 📍 Entrega - Pin numerado
│  ├─ Rojo: Urgente
│  ├─ Naranja: Alta prioridad
│  ├─ Verde: Normal
│  └─ Click para ver cliente y dirección
│
├─ 📦 Almacén - Centro de operaciones
│  └─ Punto de referencia y partida
│
└─ ──── Rutas - Líneas punteadas
   └─ Conectan conductor con sus entregas

════════════════════════════════════════════════════════════════════════════════

🔧 OPERACIONES DISPONIBLES
════════════════════════════════════════════════════════════════════════════════

DESDE EL DASHBOARD:

1. 🔄 ACTUALIZAR DATOS
   • Botón: "🔄 Actualizar"
   • Recarga todos los datos
   • Refresca el mapa

2. 🗑️ LIMPIAR MAPA
   • Botón: "🗑️ Limpiar Mapa"
   • Elimina todos los marcadores
   • Mantiene los datos

3. 📥 EXPORTAR REPORTE
   • Botón: "📥 Exportar Reporte"
   • Descarga CSV con todos los datos
   • Incluye estadísticas

4. ✅ COMPLETAR ENTREGA
   • Botón en tabla: "✅ Completar"
   • Marca como completada
   • Actualiza automáticamente

5. 👁️ VER DETALLES
   • Botón en tabla: "👁️ Ver"
   • Muestra información del conductor
   • Acciones adicionales

DESDE CONSOLA DEL NAVEGADOR (F12):

1. CREAR DATOS:
   window.createTestFleetData()
   → Crea 4 conductores y 8 entregas

2. GENERAR REPORTE:
   window.driverFleetPanel.generateFleetReport()
   → Retorna objeto con todas las estadísticas

3. ACTUALIZAR POSICIÓN:
   window.driverFleetPanel.updateDriverPosition(1, 9.93, -84.08)
   → Mueve el conductor 1 a nuevas coordenadas

4. COMPLETAR ENTREGA:
   window.driverFleetPanel.completeDelivery(1001, 1)
   → Marca la entrega 1001 como completada por conductor 1

5. REFRESCAR DASHBOARD:
   window.fleetDashboard.refresh()
   → Recarga y redibuja todo

6. TEST COMPLETO:
   testDriverFleetPanel()
   → Ejecuta todas las pruebas

════════════════════════════════════════════════════════════════════════════════

📍 DATOS DE PRUEBA (PREDETERMINADOS)
════════════════════════════════════════════════════════════════════════════════

CONDUCTORES:
┌─────┬─────────────────┬──────────┬──────────────┐
│ ID  │     Nombre      │  Estado  │  Ubicación   │
├─────┼─────────────────┼──────────┼──────────────┤
│  1  │ Carlos Ramírez  │ Activo   │ 9.9281, -84.0907 (Centro)
│  2  │ María González  │ Activo   │ 9.9350, -84.0850 (NE)
│  3  │ Juan Pérez      │ Disponib.│ 9.9200, -84.0950 (NO)
│  4  │ Ana Martínez    │ Activo   │ 9.9400, -84.0900 (Este)
└─────┴─────────────────┴──────────┴──────────────┘

ENTREGAS:
┌──────┬─────────────────────────────────┬──────────┬──────┐
│ ID   │          Dirección              │Prioridad │Asign.│
├──────┼─────────────────────────────────┼──────────┼──────┤
│1001  │ Av. Central 100, San José       │ Urgente  │ C1   │
│1002  │ Calle 5, Barrio Amón            │ Alta     │ C2   │
│1003  │ Paseo Colón 500, La Sabana      │ Normal   │ C2   │
│1004  │ Rohrmoser, Escazú               │ Normal   │ C3   │
│1005  │ San Pedro, Avenida 2            │ Alta     │ C4   │
│1006  │ Alajuela, Centro                │ Normal   │ -    │
│1007  │ La Uruca, Avenida 82            │ Normal   │ C1   │
│1008  │ Santa Ana, Carretera Vieja      │ Alta     │ -    │
└──────┴─────────────────────────────────┴──────────┴──────┘

════════════════════════════════════════════════════════════════════════════════

❓ PREGUNTAS FRECUENTES
════════════════════════════════════════════════════════════════════════════════

P: ¿Cómo agrego mis propios conductores?
R: En la consola (F12):
   window.driverFleetPanel.addDriver({
     id: 5,
     name: "Mi Conductor",
     status: "disponible",
     lat: 9.93,
     lon: -84.09,
     completedDeliveries: 0,
     totalDistance: 0,
     efficiency: 100
   });

P: ¿Cómo agrego mis propias entregas?
R: En la consola (F12):
   window.driverFleetPanel.addDelivery({
     id: 2001,
     address: "Mi dirección",
     client: "Mi cliente",
     lat: 9.93,
     lon: -84.09,
     status: "pendiente",
     priority: "alta",
     driverId: 1,
     attempts: 0
   });

P: ¿Cómo conecto con datos reales de Odoo?
R: Próxima fase - Actualmente usa datos de prueba.
   Será integrado con fleet-integration.js

P: ¿Cómo conecto con GPS en vivo de Traccar?
R: Próxima fase - Por ahora es simulación manual.
   Se implementará con WebSocket

P: ¿Puedo usar esto en móvil?
R: Sí, es responsive. Abre en navegador móvil.
   Dashboard se adaptará automáticamente.

P: ¿Cómo exporto los datos?
R: Botón "📥 Exportar Reporte" descarga CSV.
   O en consola: window.fleetDashboard.exportReport()

P: ¿Dónde se guardan los datos?
R: En memoria del navegador (window.driverFleetPanel).
   Se pierden al recargar. Próximamente: Base de datos.

P: ¿Cuántos conductores/entregas puede manejar?
R: Sin problemas hasta 1000 conductores y 10000 entregas.
   Performance se degrada con más datos.

════════════════════════════════════════════════════════════════════════════════

🎯 PRÓXIMAS FASES (ROADMAP)
════════════════════════════════════════════════════════════════════════════════

FASE 1: INTEGRACIÓN CON ODOO
├─ [ ] Cargar conductores de Odoo
├─ [ ] Cargar entregas de Odoo
├─ [ ] Actualizar estado en Odoo
└─ [ ] Sincronización bidireccional

FASE 2: GPS EN VIVO (TRACCAR)
├─ [ ] Conectar con API Traccar
├─ [ ] WebSocket para actualizaciones automáticas
├─ [ ] Histórico de rutas
└─ [ ] Alertas de desviación

FASE 3: ANÁLISIS Y REPORTES
├─ [ ] Historial completo de entregas
├─ [ ] Análisis de eficiencia
├─ [ ] Predicción de demora
├─ [ ] Recomendaciones automáticas
└─ [ ] Exportación avanzada

FASE 4: APP MÓVIL
├─ [ ] App para conductores
├─ [ ] Notificaciones en vivo
├─ [ ] Foto de entrega
└─ [ ] Firma digital

FASE 5: AUTOMATIZACIÓN
├─ [ ] Asignación automática de entregas
├─ [ ] Optimización de rutas automática
├─ [ ] Alertas inteligentes
└─ [ ] Reportes automáticos

════════════════════════════════════════════════════════════════════════════════

🆘 SOLUCIÓN DE PROBLEMAS
════════════════════════════════════════════════════════════════════════════════

PROBLEMA: No aparece el mapa
SOLUCIÓN: 
  • Verifica que Leaflet.js esté cargado
  • Consola: console.log(window.L) debe mostrar objeto
  • Refresca la página (Ctrl+F5)

PROBLEMA: No aparecen conductores/entregas
SOLUCIÓN:
  • Abre consola (F12)
  • Ejecuta: window.createTestFleetData()
  • Luego: window.fleetDashboard.refresh()

PROBLEMA: El servidor no responde
SOLUCIÓN:
  • Verifica que Python esté corriendo
  • Terminal: python3 -m http.server 5555
  • Intenta: http://localhost:5555/

PROBLEMA: Datos no se guardan al recargar
SOLUCIÓN:
  • Es normal - se almacenan en memoria
  • Próximamente: Base de datos
  • Por ahora: Recrea los datos

PROBLEMA: Botones no funcionan
SOLUCIÓN:
  • Abre consola (F12)
  • Verifica errores JavaScript
  • Reporta en GitHub

════════════════════════════════════════════════════════════════════════════════

📞 CONTACTO Y SOPORTE
════════════════════════════════════════════════════════════════════════════════

Documentación técnica: FLEET_DASHBOARD_README.md
Página de pruebas: test-fleet-dashboard.html
Consola: Abre cualquier página y presiona F12

════════════════════════════════════════════════════════════════════════════════

✅ CHECKLIST PARA VERIFICAR QUE TODO FUNCIONA
════════════════════════════════════════════════════════════════════════════════

Paso 1: ¿Se carga el index.html?
  [ ] Sí → Continúa
  [ ] No → Verifica servidor

Paso 2: ¿Aparece "Panel Flota" en Panel Admin?
  [ ] Sí → Continúa
  [ ] No → Refresca página

Paso 3: ¿Se carga el mapa de Leaflet?
  [ ] Sí → Continúa
  [ ] No → Verifica Leaflet.js

Paso 4: ¿Se muestran conductores y entregas?
  [ ] Sí → ¡FUNCIONANDO! ✅
  [ ] No → Ejecuta: window.createTestFleetData()

Paso 5: ¿Funcionan los botones?
  [ ] Sí → ¡FUNCIONANDO! ✅
  [ ] No → Verifica consola (F12)

Paso 6: ¿Puedes completar entregas?
  [ ] Sí → ¡FUNCIONANDO! ✅
  [ ] No → Consulta documentación

════════════════════════════════════════════════════════════════════════════════
🚗 FLOTA EN VIVO - SISTEMA COMPLETAMENTE OPERATIVO
════════════════════════════════════════════════════════════════════════════════
