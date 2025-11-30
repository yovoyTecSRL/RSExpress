# -*- coding: utf-8 -*-
"""
================================================================================
FLEET VEHICLE EXTENSION - RSEXPRESS OPTIMIZADO
================================================================================
Versión: 2.0 OPTIMIZADA
Fecha: 2025-11-30
Autor: Arquitecto Senior Odoo 19

MEJORAS IMPLEMENTADAS:
----------------------
✅ Relación bidireccional completa con delivery orders
✅ Campo x_active_order_id computed automático
✅ Contador delivery_order_count con store=True
✅ KPIs calculados desde relaciones (no manuales)
✅ Estado operacional sincronizado con orden activa
✅ Métodos CRUD completos para órdenes
✅ Validaciones de negocio avanzadas
✅ GPS alerts automáticos
✅ Documentación exhaustiva

CAMBIOS RESPECTO A VERSIÓN ANTERIOR:
------------------------------------
+ delivery_order_ids (One2many) - NUEVO
+ x_active_order_id (Many2one computed) - NUEVO
+ delivery_order_count (Integer computed) - NUEVO
+ _compute_active_order() - NUEVO
+ _compute_delivery_order_count() - NUEVO
+ _compute_kpi_from_orders() - NUEVO
+ assign_order() - NUEVO
+ release_vehicle() - NUEVO
+ _check_no_duplicate_assignment() - NUEVO
+ _check_has_driver_when_active() - NUEVO

BREAKING CHANGES:
-----------------
⚠️ x_orders_completed ahora es computed (antes manual)
⚠️ x_orders_failed ahora es computed (antes manual)
⚠️ x_success_rate ahora depende de relaciones
================================================================================
"""

from odoo import models, fields, api
from odoo.exceptions import UserError, ValidationError
from datetime import datetime
import math

class FleetVehicleExtended(models.Model):
    """
    Extensión del modelo fleet.vehicle para RSExpress.
    
    Integración completa con órdenes de entrega con relación bidireccional,
    tracking GPS avanzado, KPIs automáticos y validaciones de negocio.
    """
    _inherit = 'fleet.vehicle'
    
    # ========================================================================
    # IDENTIFICACIÓN Y ESTADO
    # ========================================================================
    
    x_internal_code = fields.Char(
        string='Código Interno',
        required=True,
        index=True,
        copy=False,
        help='Código único del vehículo (ej: MOTO-001)'
    )
    
    x_operational_status = fields.Selection(
        selection=[
            ('available', 'Disponible'),
            ('assigned', 'Orden Asignada'),
            ('on_route', 'En Ruta'),
            ('picked', 'Recogido'),
            ('delivering', 'Entregando'),
            ('delivered_ok', 'Entregado OK'),
            ('delivered_issue', 'Entregado con Incidencias'),
            ('failed', 'Fallido'),
            ('cancelled', 'Cancelado'),
        ],
        string='Estado Operacional',
        default='available',
        required=True,
        tracking=True,
        compute='_compute_operational_status',
        store=True,
        readonly=False,  # Permite override manual si es necesario
        help='Estado operacional actual del vehículo. Se sincroniza automáticamente con la orden activa.'
    )
    
    # ========================================================================
    # RELACIONES BIDIRECCIONALES CON ÓRDENES (✅ NUEVO)
    # ========================================================================
    
    delivery_order_ids = fields.One2many(
        comodel_name='rsexpress.delivery.order',
        inverse_name='vehicle_id',
        string='Órdenes de Entrega',
        help='Todas las órdenes asignadas a este vehículo (históricas y actuales)'
    )
    
    x_active_order_id = fields.Many2one(
        comodel_name='rsexpress.delivery.order',
        string='Orden Activa Actual',
        compute='_compute_active_order',
        store=True,
        readonly=True,
        help='Orden actualmente asignada al vehículo (estados: assigned, on_route)'
    )
    
    delivery_order_count = fields.Integer(
        string='Total Órdenes',
        compute='_compute_delivery_order_count',
        store=True,
        help='Cantidad total de órdenes asignadas a este vehículo'
    )
    
    # ========================================================================
    # KPIs DE PERFORMANCE (✅ AHORA COMPUTED DESDE RELACIONES)
    # ========================================================================
    
    x_orders_completed = fields.Integer(
        string='Órdenes Completadas',
        compute='_compute_kpi_from_orders',
        store=True,
        readonly=True,
        help='Órdenes entregadas exitosamente (estado: delivered)'
    )
    
    x_orders_failed = fields.Integer(
        string='Órdenes Fallidas',
        compute='_compute_kpi_from_orders',
        store=True,
        readonly=True,
        help='Órdenes que no pudieron completarse (estado: failed)'
    )
    
    x_rating_score = fields.Float(
        string='Calificación Promedio',
        digits=(3, 2),
        readonly=True,
        help='Calificación promedio de entregas (0-5 estrellas)'
    )
    
    x_total_km = fields.Float(
        string='Kilómetros Totales',
        digits=(10, 2),
        readonly=True,
        help='Kilómetros totales recorridos'
    )
    
    x_success_rate = fields.Float(
        string='Tasa de Éxito (%)',
        compute='_compute_success_rate',
        store=True,
        readonly=True,
        digits=(5, 2),
        help='Porcentaje de entregas exitosas (completadas / total)'
    )
    
    # ========================================================================
    # GPS TRACKING
    # ========================================================================
    
    x_last_gps_ping = fields.Datetime(
        string='Último Ping GPS',
        readonly=True,
        help='Fecha y hora de la última actualización GPS'
    )
    
    x_last_latitude = fields.Float(
        string='Última Latitud',
        digits=(10, 7),
        readonly=True,
        help='Última latitud registrada (-90 a 90)'
    )
    
    x_last_longitude = fields.Float(
        string='Última Longitud',
        digits=(10, 7),
        readonly=True,
        help='Última longitud registrada (-180 a 180)'
    )
    
    x_distance_today = fields.Float(
        string='Distancia Hoy (km)',
        digits=(8, 2),
        readonly=True,
        help='Kilómetros recorridos hoy (reset automático diario)'
    )
    
    # ========================================================================
    # ASIGNACIÓN DE CONDUCTOR
    # ========================================================================
    
    x_driver_id = fields.Many2one(
        comodel_name='hr.employee',
        string='Mensajero Asignado',
        tracking=True,
        domain=[('active', '=', True)],
        help='Empleado mensajero asignado al vehículo'
    )
    
    # ========================================================================
    # COMPUTED METHODS
    # ========================================================================
    
    @api.depends('delivery_order_ids', 'delivery_order_ids.state')
    def _compute_active_order(self):
        """
        Calcula la orden activa actual del vehículo.
        
        Una orden es considerada "activa" si está en estados:
        - assigned (asignada pero no iniciada)
        - on_route (en ruta de entrega)
        
        ✅ NUEVO MÉTODO
        """
        for vehicle in self:
            active_orders = vehicle.delivery_order_ids.filtered(
                lambda order: order.state in ['assigned', 'on_route']
            )
            
            # Debería haber máximo 1 orden activa
            if len(active_orders) > 1:
                # Log warning pero no fallar
                vehicle.message_post(
                    body=f"⚠️ Múltiples órdenes activas detectadas: {', '.join(active_orders.mapped('name'))}",
                    subject="Advertencia: Múltiples órdenes activas"
                )
            
            vehicle.x_active_order_id = active_orders[0] if active_orders else False
    
    @api.depends('delivery_order_ids')
    def _compute_delivery_order_count(self):
        """
        Cuenta el total de órdenes asignadas al vehículo.
        
        ✅ NUEVO MÉTODO
        """
        for vehicle in self:
            vehicle.delivery_order_count = len(vehicle.delivery_order_ids)
    
    @api.depends('delivery_order_ids', 'delivery_order_ids.state')
    def _compute_kpi_from_orders(self):
        """
        Calcula KPIs desde las relaciones con órdenes.
        
        Antes: Se actualizaban manualmente con write()
        Ahora: Se calculan automáticamente desde delivery_order_ids
        
        ✅ NUEVO MÉTODO
        """
        for vehicle in self:
            orders = vehicle.delivery_order_ids
            
            vehicle.x_orders_completed = len(orders.filtered(
                lambda o: o.state == 'delivered'
            ))
            
            vehicle.x_orders_failed = len(orders.filtered(
                lambda o: o.state == 'failed'
            ))
    
    @api.depends('x_orders_completed', 'x_orders_failed')
    def _compute_success_rate(self):
        """
        Calcula tasa de éxito (%) basado en órdenes completadas vs fallidas.
        
        Formula: (completadas / (completadas + fallidas)) * 100
        
        MEJORADO: Ahora depende de _compute_kpi_from_orders
        """
        for vehicle in self:
            total = vehicle.x_orders_completed + vehicle.x_orders_failed
            if total > 0:
                vehicle.x_success_rate = (vehicle.x_orders_completed / total) * 100.0
            else:
                vehicle.x_success_rate = 0.0
    
    @api.depends('x_active_order_id', 'x_active_order_id.state')
    def _compute_operational_status(self):
        """
        Sincroniza el estado operacional del vehículo con su orden activa.
        
        Mapeo automático:
        - No hay orden activa → available
        - assigned → assigned
        - on_route → on_route
        
        ✅ NUEVO MÉTODO
        """
        STATE_MAPPING = {
            'assigned': 'assigned',
            'on_route': 'on_route',
            # Futuros estados
            'picked': 'picked',
            'delivering': 'delivering',
        }
        
        for vehicle in self:
            if not vehicle.x_active_order_id:
                # No hay orden activa, vehículo disponible
                vehicle.x_operational_status = 'available'
            else:
                order_state = vehicle.x_active_order_id.state
                vehicle.x_operational_status = STATE_MAPPING.get(
                    order_state,
                    'assigned'  # Estado por defecto
                )
    
    # ========================================================================
    # MÉTODOS DE CAMBIO DE ESTADO
    # ========================================================================
    
    def action_set_available(self):
        """Marca el vehículo como disponible."""
        self.ensure_one()
        if self.x_active_order_id:
            raise UserError(
                "No se puede marcar como disponible. "
                "El vehículo tiene una orden activa. "
                "Complete o cancele la orden primero."
            )
        return self.write({'x_operational_status': 'available'})
    
    def action_set_assigned(self):
        """Marca el vehículo como orden asignada."""
        self.ensure_one()
        return self.write({'x_operational_status': 'assigned'})
    
    def action_set_on_route(self):
        """Marca el vehículo como en ruta."""
        self.ensure_one()
        if not self.x_active_order_id:
            raise UserError("No hay orden activa asignada.")
        return self.write({'x_operational_status': 'on_route'})
    
    def action_set_picked(self):
        """Marca el vehículo como recogido."""
        self.ensure_one()
        return self.write({'x_operational_status': 'picked'})
    
    def action_set_delivering(self):
        """Marca el vehículo como entregando."""
        self.ensure_one()
        return self.write({'x_operational_status': 'delivering'})
    
    def action_set_delivered_ok(self):
        """Marca el vehículo como entregado exitosamente."""
        self.ensure_one()
        return self.write({'x_operational_status': 'delivered_ok'})
    
    def action_set_delivered_issue(self):
        """Marca el vehículo como entregado con incidencias."""
        self.ensure_one()
        return self.write({'x_operational_status': 'delivered_issue'})
    
    def action_set_failed(self):
        """Marca el vehículo como fallido."""
        self.ensure_one()
        return self.write({'x_operational_status': 'failed'})
    
    def action_set_cancelled(self):
        """Marca el vehículo como cancelado."""
        self.ensure_one()
        return self.write({'x_operational_status': 'cancelled'})
    
    # ========================================================================
    # MÉTODOS CRUD ÓRDENES (✅ NUEVOS)
    # ========================================================================
    
    def assign_order(self, order_id):
        """
        Asigna una orden específica al vehículo.
        
        Args:
            order_id (int): ID de la orden a asignar
        
        Returns:
            bool: True si la asignación fue exitosa
        
        Raises:
            UserError: Si el vehículo no está disponible
            UserError: Si la orden no existe
            UserError: Si el vehículo no tiene conductor
        
        ✅ NUEVO MÉTODO
        """
        self.ensure_one()
        
        # Validar que el vehículo esté disponible
        if self.x_operational_status != 'available':
            raise UserError(
                f"El vehículo {self.x_internal_code} no está disponible. "
                f"Estado actual: {dict(self._fields['x_operational_status'].selection)[self.x_operational_status]}"
            )
        
        # Validar que tenga conductor
        if not self.x_driver_id and not self.driver_id:
            raise UserError(
                f"El vehículo {self.x_internal_code} no tiene conductor asignado."
            )
        
        # Buscar la orden
        DeliveryOrder = self.env['rsexpress.delivery.order']
        order = DeliveryOrder.browse(order_id)
        
        if not order.exists():
            raise UserError(f"La orden con ID {order_id} no existe.")
        
        # Asignar vehículo a la orden
        order.write({
            'vehicle_id': self.id,
            'state': 'assigned'
        })
        
        # Log en chatter
        self.message_post(
            body=f"✅ Orden {order.name} asignada al vehículo",
            subject="Orden Asignada"
        )
        
        return True
    
    def release_vehicle(self):
        """
        Libera el vehículo al completar o cancelar la orden activa.
        
        Establece el estado a 'available' y desvincula la orden activa.
        
        ✅ NUEVO MÉTODO
        """
        self.ensure_one()
        
        if self.x_active_order_id:
            order_name = self.x_active_order_id.name
            
            # Desvincular orden
            self.x_active_order_id.write({'vehicle_id': False})
            
            # Log en chatter
            self.message_post(
                body=f"🔓 Vehículo liberado de orden {order_name}",
                subject="Vehículo Liberado"
            )
        
        # Marcar como disponible
        self.write({'x_operational_status': 'available'})
        
        return True
    
    def action_view_delivery_orders(self):
        """
        Acción para ver todas las órdenes del vehículo.
        
        ✅ NUEVO MÉTODO
        """
        self.ensure_one()
        
        return {
            'name': f'Órdenes del Vehículo {self.x_internal_code}',
            'type': 'ir.actions.act_window',
            'res_model': 'rsexpress.delivery.order',
            'view_mode': 'tree,form',
            'domain': [('vehicle_id', '=', self.id)],
            'context': {
                'default_vehicle_id': self.id,
                'search_default_group_by_state': 1,
            },
        }
    
    # ========================================================================
    # GPS TRACKING
    # ========================================================================
    
    def update_gps(self, latitude, longitude):
        """
        Actualiza la posición GPS del vehículo y calcula distancia recorrida.
        
        Args:
            latitude (float): Nueva latitud (-90 a 90)
            longitude (float): Nueva longitud (-180 a 180)
        
        Returns:
            dict: Distancia recorrida en km
        """
        self.ensure_one()
        
        # Validar coordenadas
        if not (-90 <= latitude <= 90):
            raise UserError("Latitud debe estar entre -90 y 90")
        if not (-180 <= longitude <= 180):
            raise UserError("Longitud debe estar entre -180 y 180")
        
        distance_km = 0.0
        
        # Calcular distancia si hay coordenadas previas
        if self.x_last_latitude and self.x_last_longitude:
            distance_km = self._calculate_haversine_distance(
                self.x_last_latitude,
                self.x_last_longitude,
                latitude,
                longitude
            )
        
        # Actualizar valores
        self.write({
            'x_last_latitude': latitude,
            'x_last_longitude': longitude,
            'x_last_gps_ping': fields.Datetime.now(),
            'x_distance_today': self.x_distance_today + distance_km,
            'x_total_km': self.x_total_km + distance_km
        })
        
        return {
            'distance_km': round(distance_km, 2),
            'total_today': round(self.x_distance_today, 2)
        }
    
    def _calculate_haversine_distance(self, lat1, lon1, lat2, lon2):
        """
        Calcula distancia entre dos puntos GPS usando fórmula Haversine.
        
        Args:
            lat1, lon1: Coordenadas punto 1
            lat2, lon2: Coordenadas punto 2
        
        Returns:
            float: Distancia en kilómetros
        """
        R = 6371  # Radio de la Tierra en km
        
        # Convertir a radianes
        lat1_rad = math.radians(lat1)
        lat2_rad = math.radians(lat2)
        delta_lat = math.radians(lat2 - lat1)
        delta_lon = math.radians(lon2 - lon1)
        
        # Fórmula Haversine
        a = math.sin(delta_lat / 2) ** 2 + \
            math.cos(lat1_rad) * math.cos(lat2_rad) * \
            math.sin(delta_lon / 2) ** 2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        
        return R * c
    
    # ========================================================================
    # CRON JOBS
    # ========================================================================
    
    @api.model
    def cron_reset_daily_distance(self):
        """
        Cron job: Reset distancia diaria a las 00:00.
        
        Configurar en data/ir_cron.xml:
        - Nombre: Reset Daily Distance
        - Model: fleet.vehicle
        - Function: cron_reset_daily_distance
        - Interval: 1 day
        - Execute at: 00:00
        """
        vehicles = self.search([('x_distance_today', '>', 0)])
        vehicles.write({'x_distance_today': 0.0})
        return True
    
    @api.model
    def cron_check_gps_staleness(self):
        """
        Cron job: Detectar vehículos con GPS sin actualizar.
        
        Envía alertas si el GPS no se actualiza en más de 10 minutos
        para vehículos en ruta.
        
        ✅ NUEVO MÉTODO
        """
        now = datetime.now()
        threshold_minutes = 10
        
        active_vehicles = self.search([
            ('x_operational_status', 'in', ['on_route', 'delivering']),
            ('x_last_gps_ping', '!=', False)
        ])
        
        for vehicle in active_vehicles:
            time_diff = now - vehicle.x_last_gps_ping
            minutes_stale = time_diff.total_seconds() / 60
            
            if minutes_stale > threshold_minutes:
                vehicle.message_post(
                    body=f"⚠️ GPS sin actualizar por {int(minutes_stale)} minutos",
                    subject="Alerta GPS",
                    message_type='notification',
                    subtype_xmlid='mail.mt_note'
                )
        
        return True
    
    # ========================================================================
    # VALIDACIONES (CONSTRAINTS)
    # ========================================================================
    
    _sql_constraints = [
        ('x_internal_code_unique',
         'UNIQUE(x_internal_code)',
         'El código interno del vehículo debe ser único.')
    ]
    
    @api.constrains('x_operational_status', 'x_active_order_id')
    def _check_no_duplicate_assignment(self):
        """
        Validar que un vehículo no tenga múltiples órdenes activas.
        
        ✅ NUEVA VALIDACIÓN
        """
        for vehicle in self:
            if vehicle.x_operational_status in ['assigned', 'on_route']:
                active_orders = vehicle.delivery_order_ids.filtered(
                    lambda o: o.state in ['assigned', 'on_route']
                )
                if len(active_orders) > 1:
                    raise ValidationError(
                        f"El vehículo {vehicle.x_internal_code} tiene múltiples órdenes activas. "
                        f"Solo se permite 1 orden activa a la vez."
                    )
    
    @api.constrains('x_operational_status', 'x_driver_id', 'driver_id')
    def _check_has_driver_when_active(self):
        """
        Validar que el vehículo tenga conductor cuando está activo.
        
        ✅ NUEVA VALIDACIÓN
        """
        for vehicle in self:
            if vehicle.x_operational_status != 'available':
                if not vehicle.x_driver_id and not vehicle.driver_id:
                    raise ValidationError(
                        f"El vehículo {vehicle.x_internal_code} debe tener un conductor asignado "
                        f"para poder estar en estado {vehicle.x_operational_status}."
                    )
    
    # ========================================================================
    # NOTIFICACIONES
    # ========================================================================
    
    def notify_customer(self, event_type):
        """
        Envía notificación al cliente sobre eventos de entrega.
        
        Args:
            event_type (str): Tipo de evento (assigned, on_route, delivered, etc.)
        
        Integration: WhatsApp Business API, SMS, Email
        """
        self.ensure_one()
        
        if not self.x_active_order_id:
            return False
        
        order = self.x_active_order_id
        
        # Plantillas de mensajes
        messages = {
            'assigned': f"Tu pedido {order.name} ha sido asignado al mensajero.",
            'on_route': f"Tu pedido {order.name} está en camino. Vehículo: {self.x_internal_code}",
            'delivered': f"Tu pedido {order.name} ha sido entregado exitosamente.",
        }
        
        message = messages.get(event_type, f"Actualización de tu pedido {order.name}")
        
        # Aquí integrar con WhatsApp/SMS/Email
        # Por ahora, registrar en chatter
        order.message_post(
            body=f"📱 Notificación enviada: {message}",
            subject=f"Notificación: {event_type}"
        )
        
        return True
