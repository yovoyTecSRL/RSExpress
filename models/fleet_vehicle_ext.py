# -*- coding: utf-8 -*-
# License LGPL-3.0

from odoo import models, fields, api, _
from odoo.exceptions import UserError, ValidationError
from datetime import datetime, timedelta
import math


class FleetVehicleRSexpress(models.Model):
    _inherit = 'fleet.vehicle'

    # ========== IDENTIFICADORES RSEXPRESS ==========
    x_internal_code = fields.Char(
        string="Código RSExpress",
        copy=False,
        index=True,
        help="Código interno único del vehículo/mensajero (opcional pero recomendado)"
    )
    x_qr_delivery_tag = fields.Char(
        string="QR Tag Delivery",
        help="Texto para QR de asignación rápida"
    )

    # ========== ESTADO OPERATIVO ==========
    x_operational_status = fields.Selection([
        ('available', 'Disponible'),
        ('assigned', 'Asignado'),
        ('on_route', 'En ruta de recogida'),
        ('picked', 'Paquete recogido'),
        ('delivering', 'En camino de entrega'),
        ('delivered_ok', 'Entregado exitosamente'),
        ('delivered_issue', 'Entregado con incidencias'),
        ('failed', 'Intento fallido'),
        ('cancelled', 'Cancelado'),
    ], string="Estado Operativo", default='available', required=True, tracking=True)

    # ========== KPI DE PERFORMANCE ==========
    x_orders_completed = fields.Integer(
        string="Órdenes Completadas",
        default=0,
        readonly=True
    )
    x_orders_failed = fields.Integer(
        string="Órdenes Fallidas",
        default=0,
        readonly=True
    )
    x_rating_score = fields.Float(
        string="Rating Promedio",
        default=0.0,
        digits=(3, 2),
        readonly=True
    )
    x_total_km = fields.Float(
        string="Total KM Recorridos",
        default=0.0,
        digits=(10, 2),
        readonly=True
    )

    # ========== TRACKING Y AUTOMATIZACIÓN ==========
    x_last_gps_ping = fields.Datetime(
        string="Último Ping GPS",
        readonly=True
    )
    x_last_latitude = fields.Float(
        string="Última Latitud",
        digits=(10, 7),
        readonly=True
    )
    x_last_longitude = fields.Float(
        string="Última Longitud",
        digits=(10, 7),
        readonly=True
    )
    x_distance_today = fields.Float(
        string="Distancia Hoy (km)",
        default=0.0,
        digits=(8, 2),
        readonly=True
    )
    
    # ========== INTEGRACIÓN TRACCAR ==========
    x_traccar_device_id = fields.Integer(
        string="Traccar Device ID",
        help="ID del dispositivo GPS en Traccar Server",
        index=True
    )
    x_traccar_unique_id = fields.Char(
        string="Traccar Unique ID",
        help="IMEI o identificador único del dispositivo GPS"
    )
    x_last_speed = fields.Float(
        string="Última Velocidad (km/h)",
        digits=(5, 2),
        readonly=True
    )
    x_last_update = fields.Datetime(
        string="Última Actualización GPS",
        readonly=True,
        help="Timestamp de la última posición GPS registrada"
    )
    x_last_address = fields.Char(
        string="Última Dirección",
        readonly=True,
        help="Geocodificación inversa de la última posición"
    )
    x_traccar_status = fields.Selection([
        ('unknown', 'Desconocido'),
        ('online', 'En Línea'),
        ('offline', 'Fuera de Línea')
    ], string="Estado Traccar", default='unknown', readonly=True)

    # ========== RELACIÓN CON EMPLEADOS/MENSAJEROS ==========
    x_driver_id = fields.Many2one(
        'hr.employee',
        string="Mensajero Asignado",
        tracking=True
    )
    x_next_driver_id = fields.Many2one(
        'hr.employee',
        string="Próximo Mensajero"
    )

    # ========== CAPACIDAD DE CARGA (campo original) ==========
    x_load_capacity = fields.Integer(
        string="Capacidad de carga (kg)",
        default=0
    )

    # ========== RELACIÓN CON ÓRDENES (preparado para futuro) ==========
    # Nota: El modelo delivery.order se creará posteriormente
    # x_active_delivery_id = fields.Many2one(
    #     'delivery.order',
    #     string="Entrega Activa"
    # )
    # x_assigned_deliveries_ids = fields.One2many(
    #     'delivery.order',
    #     'vehicle_id',
    #     string="Entregas Asignadas"
    # )

    # ========== CAMPOS COMPUTADOS ==========
    x_success_rate = fields.Float(
        string="Tasa de Éxito (%)",
        compute="_compute_success_rate",
        store=True,
        digits=(5, 2)
    )

    @api.depends('x_orders_completed', 'x_orders_failed')
    def _compute_success_rate(self):
        for record in self:
            total = record.x_orders_completed + record.x_orders_failed
            if total > 0:
                record.x_success_rate = (record.x_orders_completed / total) * 100
            else:
                record.x_success_rate = 0.0

    # ========== CONSTRAINT ==========
    _sql_constraints = [
        ('x_internal_code_unique', 'UNIQUE(x_internal_code)',
         'El Código RSExpress debe ser único!')
    ]

    # ========== MÉTODOS DE CAMBIO DE ESTADO ==========

    def action_set_available(self):
        """Establece el vehículo como disponible"""
        for record in self:
            record.x_operational_status = 'available'
            record.message_post(
                body=_("🟢 Vehículo marcado como DISPONIBLE"),
                subject=_("Cambio de Estado")
            )

    def action_set_assigned(self):
        """Asigna el vehículo a una orden"""
        for record in self:
            if record.x_operational_status != 'available':
                raise UserError(_("El vehículo debe estar disponible para ser asignado"))
            record.x_operational_status = 'assigned'
            record.message_post(
                body=_("📋 Vehículo ASIGNADO a orden de entrega"),
                subject=_("Cambio de Estado")
            )

    def action_set_on_route(self):
        """Marca el vehículo en ruta de recogida"""
        for record in self:
            record.x_operational_status = 'on_route'
            record.message_post(
                body=_("🚗 Vehículo EN RUTA de recogida"),
                subject=_("Cambio de Estado")
            )

    def action_set_picked(self):
        """Marca el paquete como recogido"""
        for record in self:
            record.x_operational_status = 'picked'
            record.message_post(
                body=_("📦 Paquete RECOGIDO exitosamente"),
                subject=_("Cambio de Estado")
            )

    def action_set_delivering(self):
        """Marca el vehículo en camino de entrega"""
        for record in self:
            record.x_operational_status = 'delivering'
            record.message_post(
                body=_("🚚 Vehículo EN CAMINO de entrega"),
                subject=_("Cambio de Estado")
            )

    def action_set_delivered_ok(self):
        """Marca la entrega como exitosa"""
        for record in self:
            record.x_operational_status = 'delivered_ok'
            record.x_orders_completed += 1
            record.message_post(
                body=_("✅ Entrega COMPLETADA exitosamente. Total órdenes: %s") % record.x_orders_completed,
                subject=_("Entrega Exitosa")
            )
            # Llamar notificación
            record.notify_customer('delivered_ok')

    def action_set_delivered_issue(self):
        """Marca la entrega con incidencias"""
        for record in self:
            record.x_operational_status = 'delivered_issue'
            record.x_orders_completed += 1
            record.message_post(
                body=_("⚠️ Entrega COMPLETADA con incidencias"),
                subject=_("Entrega con Problemas")
            )
            record.notify_customer('delivered_issue')

    def action_set_failed(self):
        """Marca el intento de entrega como fallido"""
        for record in self:
            record.x_operational_status = 'failed'
            record.x_orders_failed += 1
            record.message_post(
                body=_("❌ Intento de entrega FALLIDO. Total fallos: %s") % record.x_orders_failed,
                subject=_("Entrega Fallida")
            )
            record.notify_customer('failed')

    def action_set_cancelled(self):
        """Cancela la entrega"""
        for record in self:
            record.x_operational_status = 'cancelled'
            record.message_post(
                body=_("🚫 Entrega CANCELADA"),
                subject=_("Entrega Cancelada")
            )
            record.notify_customer('cancelled')

    # ========== MÉTODOS DE ASIGNACIÓN DE ÓRDENES ==========

    def assign_delivery(self, order_id=None):
        """
        Asigna una orden al vehículo
        Nota: Implementación completa cuando exista delivery.order
        """
        self.ensure_one()
        if self.x_operational_status != 'available':
            raise UserError(_("El vehículo debe estar disponible para asignar entregas"))
        
        self.action_set_assigned()
        
        if order_id:
            self.message_post(
                body=_("📦 Orden #%s asignada al vehículo") % order_id,
                subject=_("Orden Asignada")
            )
        
        return True

    def pickup_delivery(self):
        """Confirma la recogida del paquete"""
        self.ensure_one()
        if self.x_operational_status not in ['assigned', 'on_route']:
            raise UserError(_("El vehículo debe estar asignado o en ruta para recoger"))
        
        self.action_set_picked()
        return True

    def confirm_delivery(self, success=True):
        """
        Confirma la entrega
        :param success: True si exitosa, False si con incidencias
        """
        self.ensure_one()
        if success:
            self.action_set_delivered_ok()
        else:
            self.action_set_delivered_issue()
        
        return True

    def fail_delivery(self):
        """Marca la entrega como fallida"""
        self.ensure_one()
        self.action_set_failed()
        return True

    # ========== MÉTODO DE TRACKING GPS ==========

    def update_gps(self, lat, lon):
        """
        Actualiza la posición GPS del vehículo
        :param lat: Latitud
        :param lon: Longitud
        """
        self.ensure_one()
        
        # Calcular distancia si hay posición anterior
        distance_traveled = 0.0
        if self.x_last_latitude and self.x_last_longitude:
            distance_traveled = self._calculate_haversine_distance(
                self.x_last_latitude,
                self.x_last_longitude,
                lat,
                lon
            )
            
            # Registrar en chatter si el salto es mayor a 1 km
            if distance_traveled > 1.0:
                self.message_post(
                    body=_("📍 Movimiento detectado: %.2f km desde última posición") % distance_traveled,
                    subject=_("Actualización GPS")
                )
        
        # Actualizar valores
        self.write({
            'x_last_latitude': lat,
            'x_last_longitude': lon,
            'x_last_gps_ping': fields.Datetime.now(),
            'x_total_km': self.x_total_km + distance_traveled,
            'x_distance_today': self.x_distance_today + distance_traveled,
        })
        
        return True

    def _calculate_haversine_distance(self, lat1, lon1, lat2, lon2):
        """
        Calcula la distancia entre dos puntos GPS usando fórmula Haversine
        Retorna distancia en kilómetros
        """
        R = 6371  # Radio de la Tierra en kilómetros
        
        lat1_rad = math.radians(lat1)
        lat2_rad = math.radians(lat2)
        delta_lat = math.radians(lat2 - lat1)
        delta_lon = math.radians(lon2 - lon1)
        
        a = math.sin(delta_lat / 2) ** 2 + \
            math.cos(lat1_rad) * math.cos(lat2_rad) * \
            math.sin(delta_lon / 2) ** 2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        
        distance = R * c
        return distance

    # ========== MÉTODO DE NOTIFICACIÓN ==========

    def notify_customer(self, event):
        """
        Notificación al cliente (preparado para WhatsApp Respond.io)
        :param event: Tipo de evento (delivered_ok, delivered_issue, failed, cancelled)
        """
        self.ensure_one()
        
        event_messages = {
            'delivered_ok': '✅ Su paquete ha sido entregado exitosamente',
            'delivered_issue': '⚠️ Su paquete ha sido entregado con observaciones',
            'failed': '❌ No se pudo completar la entrega',
            'cancelled': '🚫 La entrega ha sido cancelada',
        }
        
        message = event_messages.get(event, 'Actualización de entrega')
        
        # Por ahora solo registro
        self.message_post(
            body=_("📱 Notificación generada: %s") % message,
            subject=_("Notificación Cliente")
        )
        
        # TODO: Integrar con Respond.io API
        # self._send_whatsapp_notification(message)
        
        return True

    # ========== MÉTODO PARA RESETEAR DISTANCIA DIARIA ==========

    @api.model
    def cron_reset_daily_distance(self):
        """
        Cron job para resetear x_distance_today cada día
        Configurar en ir.cron para ejecutar a las 00:00
        """
        vehicles = self.search([])
        vehicles.write({'x_distance_today': 0.0})
        return True
    
    # ========== INTEGRACIÓN TRACCAR GPS ==========
    
    def sync_traccar_position(self):
        """
        Sincroniza la posición GPS desde Traccar Server.
        
        Este método obtiene la última posición del dispositivo GPS asociado
        y actualiza los campos del vehículo en Odoo.
        
        Returns:
            bool: True si la sincronización fue exitosa
        
        Raises:
            UserError: Si no hay device_id configurado o falla la conexión
        """
        self.ensure_one()
        
        if not self.x_traccar_device_id:
            raise UserError(
                f"El vehículo {self.name} no tiene un dispositivo Traccar asociado. "
                f"Configure el campo 'Traccar Device ID'."
            )
        
        try:
            # Importar cliente Traccar
            from .traccar_client import TraccarClient
            
            # Crear instancia del cliente
            client = TraccarClient(self.env)
            
            # Obtener última posición del dispositivo
            position = client.get_last_position(self.x_traccar_device_id)
            
            if not position:
                _logger.warning(
                    f"No se pudo obtener posición de dispositivo Traccar {self.x_traccar_device_id}"
                )
                self.write({'x_traccar_status': 'offline'})
                return False
            
            # Formatear datos para Odoo
            position_data = client.format_position_for_odoo(position)
            
            # Agregar estado online
            position_data['x_traccar_status'] = 'online'
            position_data['x_last_gps_ping'] = fields.Datetime.now()
            
            # Calcular distancia si hay posición anterior
            if self.x_last_latitude and self.x_last_longitude:
                distance_traveled = self._calculate_haversine_distance(
                    self.x_last_latitude,
                    self.x_last_longitude,
                    position_data['x_last_latitude'],
                    position_data['x_last_longitude']
                )
                
                # Actualizar distancias
                position_data['x_total_km'] = self.x_total_km + distance_traveled
                position_data['x_distance_today'] = self.x_distance_today + distance_traveled
            
            # Actualizar vehículo
            self.write(position_data)
            
            _logger.info(
                f"Vehículo {self.name} sincronizado con Traccar: "
                f"lat={position_data['x_last_latitude']}, "
                f"lng={position_data['x_last_longitude']}, "
                f"speed={position_data['x_last_speed']} km/h"
            )
            
            return True
        
        except Exception as e:
            _logger.error(f"Error sincronizando vehículo {self.name} con Traccar: {str(e)}")
            self.write({'x_traccar_status': 'unknown'})
            raise UserError(f"Error sincronizando con Traccar: {str(e)}")
    
    @api.model
    def cron_sync_all_traccar_positions(self):
        """
        Cron job para sincronizar todas las posiciones GPS desde Traccar.
        
        Ejecutar cada 1-5 minutos para tracking en tiempo real.
        Configurar en data/ir_cron.xml
        
        Returns:
            dict: Resumen de sincronización
        """
        vehicles = self.search([('x_traccar_device_id', '!=', False)])
        
        success_count = 0
        fail_count = 0
        
        for vehicle in vehicles:
            try:
                if vehicle.sync_traccar_position():
                    success_count += 1
                else:
                    fail_count += 1
            except Exception as e:
                _logger.error(f"Error en cron sync Traccar para {vehicle.name}: {str(e)}")
                fail_count += 1
        
        _logger.info(
            f"Cron Traccar completado: {success_count} éxitos, {fail_count} fallos"
        )
        
        return {
            'success': success_count,
            'failed': fail_count,
            'total': len(vehicles)
        }
    
    def action_sync_traccar_now(self):
        """
        Acción manual para sincronizar posición GPS desde Traccar.
        
        Botón en la vista de formulario del vehículo.
        """
        self.ensure_one()
        
        try:
            self.sync_traccar_position()
            
            return {
                'type': 'ir.actions.client',
                'tag': 'display_notification',
                'params': {
                    'title': _('Sincronización Exitosa'),
                    'message': _(
                        'Posición GPS actualizada desde Traccar.\n'
                        f'Lat: {self.x_last_latitude:.6f}\n'
                        f'Lng: {self.x_last_longitude:.6f}\n'
                        f'Velocidad: {self.x_last_speed:.1f} km/h'
                    ),
                    'type': 'success',
                    'sticky': False,
                }
            }
        
        except Exception as e:
            return {
                'type': 'ir.actions.client',
                'tag': 'display_notification',
                'params': {
                    'title': _('Error de Sincronización'),
                    'message': str(e),
                    'type': 'danger',
                    'sticky': True,
                }
            }
    
    def action_open_traccar_map(self):
        """
        Abre Traccar en una nueva ventana para ver el vehículo en el mapa.
        
        Returns:
            dict: Acción de abrir URL
        """
        self.ensure_one()
        
        if not self.x_traccar_device_id:
            raise UserError(_("Este vehículo no tiene un dispositivo Traccar configurado"))
        
        # Obtener URL de Traccar desde config
        IrConfigParameter = self.env['ir.config_parameter'].sudo()
        traccar_url = IrConfigParameter.get_param('traccar.api.url', 'http://localhost:8082/api')
        
        # Construir URL base (quitar /api)
        base_url = traccar_url.replace('/api', '')
        
        # URL para ver el dispositivo en el mapa
        device_url = f"{base_url}/?deviceId={self.x_traccar_device_id}"
        
        return {
            'type': 'ir.actions.act_url',
            'url': device_url,
            'target': 'new',
        }

    # ========== ACCIÓN RÁPIDA: COMPLETAR CICLO ==========

    def action_complete_delivery_cycle(self):
        """Acción rápida que completa todo el ciclo de entrega"""
        self.ensure_one()
        self.action_set_on_route()
        self.action_set_picked()
        self.action_set_delivering()
        self.action_set_delivered_ok()
        return {
            'type': 'ir.actions.client',
            'tag': 'display_notification',
            'params': {
                'title': _('Ciclo Completado'),
                'message': _('El ciclo de entrega ha sido completado exitosamente'),
                'type': 'success',
                'sticky': False,
            }
        }
