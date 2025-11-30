# -*- coding: utf-8 -*-
# License LGPL-3.0

from odoo import http
from odoo.http import request
from datetime import datetime, timedelta


class RSExpressOpsCenter(http.Controller):
    """Controlador para el OpsCenter - Dashboard Operativo estilo Uber Dispatch"""

    @http.route('/rsexpress/opscenter/data', type='json', auth='user')
    def ops_data(self):
        """Devuelve datos en tiempo real para el dashboard - Formato Uber Style"""
        
        # Obtener todos los pedidos
        orders = request.env['rsexpress.delivery.order'].search([])
        
        # Obtener todos los vehículos
        vehicles = request.env['fleet.vehicle'].search([])
        
        # Fecha de hoy
        today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        
        # ========== KPIs GLOBALES ==========
        total_orders = len(orders)
        
        active_orders = orders.filtered(
            lambda o: o.state not in ('delivered', 'failed', 'cancelled')
        )
        
        completed_today = orders.filtered(
            lambda o: o.state == 'delivered' and 
            o.write_date and 
            o.write_date >= today_start
        )
        
        failed_today = orders.filtered(
            lambda o: o.state == 'failed' and 
            o.write_date and 
            o.write_date >= today_start
        )
        
        available_drivers = vehicles.filtered(
            lambda v: not hasattr(v, 'x_operational_status') or 
            v.x_operational_status in (False, 'available')
        )
        
        busy_drivers = vehicles.filtered(
            lambda v: hasattr(v, 'x_operational_status') and 
            v.x_operational_status not in (False, 'available')
        )
        
        # ========== DATOS DE VEHÍCULOS (ESTILO UBER DRIVER) ==========
        vehicles_data = []
        for vehicle in vehicles:
            # Buscar pedido activo asignado a este vehículo
            active_delivery = orders.filtered(
                lambda o: o.vehicle_id.id == vehicle.id and 
                o.state not in ('delivered', 'failed', 'cancelled')
            )
            
            vehicle_info = {
                'id': vehicle.id,
                'vehicle_name': vehicle.name or vehicle.license_plate or 'Sin nombre',
                'driver_name': vehicle.driver_id.name if vehicle.driver_id else 'Sin conductor',
                'state': getattr(vehicle, 'x_operational_status', 'available') or 'available',
                'last_lat': getattr(vehicle, 'x_last_latitude', 0.0) or 0.0,
                'last_lon': getattr(vehicle, 'x_last_longitude', 0.0) or 0.0,
                'last_gps_ping': str(getattr(vehicle, 'x_last_gps_ping', '-')) if hasattr(vehicle, 'x_last_gps_ping') else '-',
                'active_delivery': active_delivery[0].name if active_delivery else 'Ninguna',
                'distance_today': getattr(vehicle, 'x_distance_today', 0.0) or 0.0,
            }
            vehicles_data.append(vehicle_info)
        
        # ========== DATOS DE PEDIDOS ACTIVOS ==========
        orders_data = []
        for order in active_orders:
            order_info = {
                'id': order.id,
                'name': order.name or 'Sin código',
                'customer_name': order.customer_name or 'Sin nombre',
                'pickup': order.pickup_address or '-',
                'delivery': order.delivery_address or '-',
                'state': dict(order._fields['state'].selection).get(order.state, order.state),
                'state_raw': order.state,
                'vehicle': order.vehicle_id.name if order.vehicle_id else 'Sin asignar',
                'customer_phone': order.customer_phone or '-',
            }
            orders_data.append(order_info)
        
        # ========== RESPUESTA JSON ==========
        return {
            # KPIs
            'kpi_total_orders': total_orders,
            'kpi_active_orders': len(active_orders),
            'kpi_completed_today': len(completed_today),
            'kpi_failed_today': len(failed_today),
            'kpi_available_drivers': len(available_drivers),
            'kpi_busy_drivers': len(busy_drivers),
            
            # Datos detallados
            'orders': orders_data,
            'vehicles': vehicles_data,
            
            # Timestamp
            'last_update': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        }

    @http.route('/rsexpress/opscenter/refresh', type='json', auth='user')
    def ops_refresh(self):
        """Endpoint alternativo para refrescar datos"""
        return self.ops_data()
    
    # ========================================================================
    # ENDPOINTS TRACCAR GPS
    # ========================================================================
    
    @http.route('/rsexpress/opscenter/tracking/<int:vehicle_id>', type='json', auth='user')
    def vehicle_tracking(self, vehicle_id):
        """
        Obtiene datos GPS actualizados de un vehículo específico.
        
        Args:
            vehicle_id (int): ID del vehículo en Odoo
        
        Returns:
            dict: Datos GPS del vehículo
        """
        vehicle = request.env['fleet.vehicle'].browse(vehicle_id)
        
        if not vehicle.exists():
            return {'error': 'Vehículo no encontrado'}
        
        # Intentar sincronizar con Traccar si está configurado
        if vehicle.x_traccar_device_id:
            try:
                vehicle.sync_traccar_position()
            except Exception as e:
                # Log pero no fallar
                pass
        
        return {
            'vehicle_id': vehicle.id,
            'vehicle_name': vehicle.name or vehicle.license_plate,
            'latitude': vehicle.x_last_latitude or 0.0,
            'longitude': vehicle.x_last_longitude or 0.0,
            'speed': vehicle.x_last_speed or 0.0,
            'last_update': str(vehicle.x_last_update) if vehicle.x_last_update else None,
            'address': vehicle.x_last_address or 'Sin dirección',
            'status': vehicle.x_operational_status or 'available',
            'traccar_status': vehicle.x_traccar_status or 'unknown',
            'distance_today': vehicle.x_distance_today or 0.0,
        }
    
    @http.route('/rsexpress/opscenter/tracking/all', type='json', auth='user')
    def all_vehicles_tracking(self):
        """
        Obtiene posiciones GPS de todos los vehículos activos.
        
        Returns:
            dict: Mapa de vehículos con sus posiciones
        """
        vehicles = request.env['fleet.vehicle'].search([
            ('x_last_latitude', '!=', False),
            ('x_last_longitude', '!=', False)
        ])
        
        vehicles_map = []
        
        for vehicle in vehicles:
            vehicles_map.append({
                'id': vehicle.id,
                'name': vehicle.name or vehicle.license_plate,
                'lat': vehicle.x_last_latitude,
                'lng': vehicle.x_last_longitude,
                'speed': vehicle.x_last_speed or 0.0,
                'status': vehicle.x_operational_status or 'available',
                'driver': vehicle.driver_id.name if vehicle.driver_id else 'Sin conductor',
                'last_update': str(vehicle.x_last_update) if vehicle.x_last_update else None,
            })
        
        return {
            'vehicles': vehicles_map,
            'count': len(vehicles_map),
            'timestamp': datetime.now().isoformat()
        }
    
    @http.route('/rsexpress/traccar/webhook', type='json', auth='public', csrf=False)
    def traccar_webhook(self, **kwargs):
        """
        Webhook para recibir actualizaciones de posición desde Traccar Server.
        
        Configurar en Traccar:
        <entry key='notificator.types'>web</entry>
        <entry key='notificator.web.url'>https://tu-odoo.com/rsexpress/traccar/webhook</entry>
        
        Payload esperado de Traccar:
        {
            "deviceId": 123,
            "latitude": 4.60971,
            "longitude": -74.08175,
            "speed": 45.5,
            "fixTime": "2025-11-30T10:30:00Z",
            "attributes": {...}
        }
        """
        try:
            data = request.jsonrequest
            
            device_id = data.get('deviceId')
            
            if not device_id:
                return {'status': 'error', 'message': 'deviceId requerido'}
            
            # Buscar vehículo por traccar_device_id
            vehicle = request.env['fleet.vehicle'].sudo().search([
                ('x_traccar_device_id', '=', device_id)
            ], limit=1)
            
            if not vehicle:
                return {
                    'status': 'error',
                    'message': f'Vehículo con Traccar Device ID {device_id} no encontrado'
                }
            
            # Actualizar posición GPS
            position_data = {
                'x_last_latitude': data.get('latitude'),
                'x_last_longitude': data.get('longitude'),
                'x_last_speed': data.get('speed', 0.0),
                'x_last_update': data.get('fixTime'),
                'x_last_address': data.get('address', ''),
                'x_traccar_status': 'online',
                'x_last_gps_ping': datetime.now()
            }
            
            # Calcular distancia si hay posición anterior
            if vehicle.x_last_latitude and vehicle.x_last_longitude:
                distance = vehicle._calculate_haversine_distance(
                    vehicle.x_last_latitude,
                    vehicle.x_last_longitude,
                    position_data['x_last_latitude'],
                    position_data['x_last_longitude']
                )
                
                position_data['x_total_km'] = vehicle.x_total_km + distance
                position_data['x_distance_today'] = vehicle.x_distance_today + distance
            
            vehicle.write(position_data)
            
            return {
                'status': 'success',
                'vehicle_id': vehicle.id,
                'vehicle_name': vehicle.name,
                'message': 'Posición actualizada'
            }
        
        except Exception as e:
            return {
                'status': 'error',
                'message': str(e)
            }
    
    @http.route('/rsexpress/traccar/test', type='http', auth='user')
    def traccar_test_connection(self):
        """
        Prueba la conexión con Traccar Server.
        
        Acceder desde navegador: http://tu-odoo:8069/rsexpress/traccar/test
        """
        try:
            from odoo.addons.orbix_fleet_test.models.traccar_client import TraccarClient
            
            client = TraccarClient(request.env)
            result = client.test_connection()
            
            if result['success']:
                html = f"""
                <html>
                <head><title>Test Traccar - OK</title></head>
                <body style="font-family: Arial; padding: 20px;">
                    <h1 style="color: green;">✅ Conexión Exitosa con Traccar</h1>
                    <p><strong>URL:</strong> {result['base_url']}</p>
                    <p><strong>Versión:</strong> {result['server_version']}</p>
                    <p><strong>Dispositivos:</strong> {result['devices_count']}</p>
                    <p><strong>Mensaje:</strong> {result['message']}</p>
                    <hr>
                    <p><a href="/web">← Volver a Odoo</a></p>
                </body>
                </html>
                """
            else:
                html = f"""
                <html>
                <head><title>Test Traccar - ERROR</title></head>
                <body style="font-family: Arial; padding: 20px;">
                    <h1 style="color: red;">❌ Error de Conexión con Traccar</h1>
                    <p><strong>URL:</strong> {result['base_url']}</p>
                    <p><strong>Error:</strong> {result['message']}</p>
                    <hr>
                    <h3>Verificar:</h3>
                    <ul>
                        <li>Traccar Server está corriendo</li>
                        <li>URL correcta en parámetros del sistema</li>
                        <li>Usuario y contraseña correctos</li>
                        <li>Firewall permite conexión</li>
                    </ul>
                    <p><a href="/web">← Volver a Odoo</a></p>
                </body>
                </html>
                """
            
            return html
        
        except Exception as e:
            return f"""
            <html>
            <head><title>Test Traccar - EXCEPTION</title></head>
            <body style="font-family: Arial; padding: 20px;">
                <h1 style="color: red;">💥 Excepción al probar Traccar</h1>
                <p><strong>Error:</strong> {str(e)}</p>
                <hr>
                <p><a href="/web">← Volver a Odoo</a></p>
            </body>
            </html>
            """
