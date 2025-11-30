# -*- coding: utf-8 -*-
# License LGPL-3.0

# Importar modelos de Odoo
from . import fleet_vehicle_ext
from . import rsexpress_delivery_order

# traccar_client es una clase helper, no un modelo
# Se importa directamente donde se necesita:
# from .traccar_client import TraccarClient