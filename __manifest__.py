# -*- coding: utf-8 -*-
{
    'name': 'RSExpress Logistics by Órbix',
    'version': '19.0.2.0.0',
    'summary': 'RSExpress - Sistema Completo de Gestión Logística y Entregas',
    'description': """
        RSExpress Logistics - Motor Cognitivo Órbix
        ===========================================
        
        Sistema completo de gestión logística con:
        
        ✅ Gestión de Flota
        - Vehículos con tracking GPS en tiempo real (Traccar)
        - Estados operacionales en tiempo real
        - Asignación inteligente de conductores
        - Sincronización automática cada 5 minutos
        
        ✅ Integración GPS Traccar
        - Cliente HTTP para Traccar API REST
        - Sincronización manual y automática (cron)
        - Webhooks para actualizaciones en tiempo real
        - Mapa universal Leaflet.js con marcadores
        - Testing automatizado con script Python
        - Documentación completa (README_TRACCAR.md)
        
        ✅ Gestión de Pedidos
        - Ciclo completo de entrega (5 estados)
        - Asignación automática de códigos
        - Tracking por estado
        - Chatter integrado
        
        ✅ OpsCenter Dashboard
        - 6 KPIs en tiempo real
        - Monitoreo de conductores activos
        - Tabla de pedidos activos
        - Auto-refresh cada 5 segundos
        - Mapa GPS con tracking vehicular
        
        Tecnologías:
        - Python/Odoo 19 ORM
        - Traccar v5.10 GPS Server
        - Leaflet.js Mapping
        - QWeb Templates
        - JavaScript (AbstractAction/OWL)
        - Bootstrap UI
        - JSON Controllers
        - PostgreSQL
    """,
    'author': 'Sistemas Órbix',
    'website': 'https://sistemasorbix.com',
    'category': 'Operations/Fleet',
    'depends': [
        'fleet',      # Gestión de vehículos
        'mail',       # Chatter y actividades
        'web',        # Assets backend (OWL/JS)
        'hr',         # Empleados/mensajeros (x_driver_id)
    ],
    'data': [
        # Seguridad
        'security/ir.model.access.csv',
        
        # Datos maestros
        'data/ir_sequence.xml',
        'data/ir_cron_traccar.xml',
        
        # Vistas de Flota (heredadas - solo título)
        'views/fleet_vehicle_title.xml',
        'views/fleet_vehicle_clean.xml',
        'views/fleet_vehicle_rsexpress_buttons.xml',
        'views/fleet_vehicle_traccar_form.xml',
        
        # Vistas de Pedidos RSExpress
        'views/rsexpress_delivery_form.xml',
        'views/rsexpress_delivery_list.xml',
        'views/rsexpress_delivery_kanban.xml',
        'views/rsexpress_delivery_menu.xml',
        
        # OpsCenter Dashboard
        'views/rsexpress_opscenter_dashboard.xml',
        'views/rsexpress_opscenter_menu.xml',
        
        # Tracking GPS Universal
        'views/rsexpress_tracking_map.xml',
    ],
    'assets': {
        'web.assets_backend': [
            'orbix_fleet_test/static/src/js/opscenter.js',
            'orbix_fleet_test/static/src/js/tracking_map.js',
            # Leaflet CSS (CDN)
            'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
            # Leaflet JS (CDN)
            'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
        ],
    },
    'installable': True,
    'application': True,
    'auto_install': False,
    'license': 'LGPL-3',
    'images': ['static/description/banner.png'],
}
