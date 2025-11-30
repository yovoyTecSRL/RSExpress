# -*- coding: utf-8 -*-
# License LGPL-3.0

from odoo import models, fields, api


class RSExpressDeliveryOrder(models.Model):
    """Modelo de Pedidos de Entrega RSExpress - Completamente independiente de fleet.vehicle"""
    
    _name = 'rsexpress.delivery.order'
    _description = 'Pedido de Entrega RSExpress'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'create_date desc'
    
    # ==================== CAMPOS OBLIGATORIOS ====================
    
    name = fields.Char(
        string='Código de Pedido',
        required=True,
        copy=False,
        readonly=True,
        default='Nuevo',
        tracking=True
    )
    
    pickup_address = fields.Char(
        string='Dirección de Recogida',
        required=True,
        tracking=True
    )
    
    delivery_address = fields.Char(
        string='Dirección de Entrega',
        required=True,
        tracking=True
    )
    
    task_description = fields.Text(
        string='Descripción del Pedido',
        required=True,
        tracking=True
    )
    
    customer_name = fields.Char(
        string='Nombre del Cliente',
        required=True,
        tracking=True
    )
    
    customer_phone = fields.Char(
        string='Teléfono del Cliente',
        required=True,
        tracking=True
    )
    
    # ==================== ESTADO ====================
    
    state = fields.Selection([
        ('new', 'Nuevo'),
        ('assigned', 'Asignado'),
        ('on_route', 'En Ruta'),
        ('delivered', 'Entregado'),
        ('failed', 'Fallido'),
        ('cancelled', 'Cancelado'),
    ], string='Estado', default='new', required=True, tracking=True)
    
    # ==================== RELACIÓN CON VEHÍCULO (OPCIONAL) ====================
    
    vehicle_id = fields.Many2one(
        'fleet.vehicle',
        string='Vehículo Asignado',
        tracking=True,
        ondelete='set null'
    )
    
    # ==================== CAMPOS AUTOMÁTICOS ====================
    
    create_date = fields.Datetime(
        string='Fecha de Creación',
        readonly=True
    )
    
    write_date = fields.Datetime(
        string='Última Modificación',
        readonly=True
    )
    
    # ==================== MÉTODOS DE CREACIÓN ====================
    
    @api.model
    def create(self, vals):
        """Generar código automático al crear"""
        if vals.get('name', 'Nuevo') == 'Nuevo':
            vals['name'] = self.env['ir.sequence'].next_by_code('rsexpress.delivery.order') or 'RSX-NEW'
        return super(RSExpressDeliveryOrder, self).create(vals)
    
    # ==================== MÉTODOS DE ESTADO ====================
    
    def action_assign(self):
        """Asignar pedido"""
        self.write({'state': 'assigned'})
        return True
    
    def action_on_route(self):
        """Marcar como en ruta"""
        self.write({'state': 'on_route'})
        return True
    
    def action_delivered(self):
        """Marcar como entregado"""
        self.write({'state': 'delivered'})
        return True
    
    def action_failed(self):
        """Marcar como fallido"""
        self.write({'state': 'failed'})
        return True
    
    def action_cancel(self):
        """Cancelar pedido - volver a nuevo"""
        self.write({'state': 'new'})
        return True
