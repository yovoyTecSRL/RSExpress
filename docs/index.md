# 📚 RSExpress - Documentación

## 🚀 Inicios Rápidos

- **[README_SERVIDOR.md](README_SERVIDOR.md)** - Guía completa del servidor (⭐ LEER PRIMERO)
- **[PROXY_9999_SETUP_COMPLETE.md](PROXY_9999_SETUP_COMPLETE.md)** - Configuración del proxy Odoo
- **[ACTUALIZACION_COMPLETADA.md](ACTUALIZACION_COMPLETADA.md)** - Resumen de cambios

## 📋 Integración Odoo CRM

- **[ORDERS_CRM_INTEGRATION_COMPLETED.md](ORDERS_CRM_INTEGRATION_COMPLETED.md)** - Integración de órdenes desde CRM
- **[ODOO_INTEGRATION_ANALYSIS.md](ODOO_INTEGRATION_ANALYSIS.md)** - Análisis de arquitectura
- **[IMPROVEMENT_PLAN.md](IMPROVEMENT_PLAN.md)** - Plan de mejoras

## 🛣️ Entregas y Rutas

- **[ENTREGAS_PEREZ_ZELEDON.md](ENTREGAS_PEREZ_ZELEDON.md)** - Sistema de entregas en Pérez Zeledón
- **[PEREZ_ZELEDON_TARIFAS.md](PEREZ_ZELEDON_TARIFAS.md)** - Tarifas por zona
- **[SHIPMENTS_ROUTES_FREIGHT.md](SHIPMENTS_ROUTES_FREIGHT.md)** - Rutas y carga

## 🚗 Fleet Dashboard

- **[FLEET_DASHBOARD_README.md](FLEET_DASHBOARD_README.md)** - Dashboard de flota
- **[DRIVER_POSITIONING_COMPLETED.md](DRIVER_POSITIONING_COMPLETED.md)** - Posicionamiento de conductores

## 📦 Entregas de Tarjetas

- **[DELIVERY_CARDS_IMPLEMENTATION.md](DELIVERY_CARDS_IMPLEMENTATION.md)** - Implementación de tarjetas
- **[README_DELIVERY_CARDS.md](README_DELIVERY_CARDS.md)** - Guía de tarjetas de entrega

## 🔧 Configuración

- **[CONFIGURACION_FINAL.md](CONFIGURACION_FINAL.md)** - Configuración final del sistema
- **[JSON_RPC_CONFIG.md](JSON_RPC_CONFIG.md)** - Configuración JSON-RPC
- **[TRACCAR_README.md](TRACCAR_README.md)** - Configuración de Traccar

## ✅ Verificación

- **[QUICK_VERIFICATION.md](QUICK_VERIFICATION.md)** - Verificación rápida
- **[STATS_VERIFICATION_GUIDE.md](STATS_VERIFICATION_GUIDE.md)** - Guía de estadísticas

## 📁 Estructura

```
docs/
├── logs/                    # Logs del sistema
├── index.md                # Este archivo
├── README.md               # Descripción general
└── *.md                    # Documentación temática
```

## 🎯 Resumen General

RSExpress es un sistema integrado que combina:

- **Backend:** Node.js + Express
- **Frontend:** HTML5 + CSS3 + JavaScript
- **Integración:** Odoo 19 via JSON-RPC
- **Entregas:** Sistema de rutas y tracking
- **Flota:** Dashboard en vivo con posicionamiento

## 🚀 Cómo Empezar

1. Lee **[README_SERVIDOR.md](README_SERVIDOR.md)**
2. Ejecuta `npm run dev`
3. Abre http://localhost:5555
4. Ve a http://localhost:5555/orders-from-crm.html para ver órdenes

## 📞 Soporte

- Ver logs en `/docs/logs/`
- Ejecutar `./server-control.sh test` para verificar conexión
- Revisar consola del navegador (F12) para errores JavaScript

---

**Última actualización:** Diciembre 5, 2025  
**Versión:** 2.0.0  
**Estado:** ✅ Producción
