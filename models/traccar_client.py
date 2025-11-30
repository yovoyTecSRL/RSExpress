# -*- coding: utf-8 -*-
"""
================================================================================
TRACCAR CLIENT - Cliente HTTP para API Traccar
================================================================================
Versión: 1.0
Fecha: 2025-11-30
Autor: Sistemas Órbix

Propósito:
----------
Cliente HTTP reutilizable para conectar con Traccar Server y obtener datos
de tracking GPS en tiempo real.

Características:
----------------
- Autenticación HTTP Basic
- Endpoints configurables vía ir.config_parameter
- Manejo de errores robusto
- Timeouts configurables
- Logging detallado
- Retry automático
- Cache opcional

Configuración en Odoo:
----------------------
Configurar en Ajustes > Técnico > Parámetros del Sistema:

1. traccar.api.url = http://traccar-server:8082/api
2. traccar.api.username = admin
3. traccar.api.password = admin (o token)
4. traccar.api.timeout = 10
5. traccar.api.retry = 3

Uso:
----
from .traccar_client import TraccarClient

client = TraccarClient(env)
devices = client.get_devices()
position = client.get_last_position(device_id=5)
================================================================================
"""

import requests
import logging
import json
from datetime import datetime, timedelta
from requests.auth import HTTPBasicAuth
from odoo.exceptions import UserError

_logger = logging.getLogger(__name__)


class TraccarClient:
    """
    Cliente HTTP para Traccar Server API.
    
    Métodos disponibles:
    - get_devices() - Obtener todos los dispositivos
    - get_device(device_id) - Obtener un dispositivo específico
    - get_positions(device_ids, from_time, to_time) - Obtener posiciones históricas
    - get_last_position(device_id) - Obtener última posición de un dispositivo
    - get_device_by_unique_id(unique_id) - Buscar dispositivo por identificador único
    """
    
    def __init__(self, env):
        """
        Inicializa el cliente Traccar con configuración desde Odoo.
        
        Args:
            env: Entorno de Odoo (self.env)
        """
        self.env = env
        
        # Obtener parámetros de configuración
        self.base_url = self._get_config('traccar.api.url', 'http://localhost:8082/api')
        self.username = self._get_config('traccar.api.username', 'admin')
        self.password = self._get_config('traccar.api.password', 'admin')
        self.timeout = int(self._get_config('traccar.api.timeout', '10'))
        self.max_retries = int(self._get_config('traccar.api.retry', '3'))
        
        # Validar configuración
        if not self.base_url or not self.username or not self.password:
            raise UserError(
                "Configuración de Traccar incompleta. "
                "Por favor configure: traccar.api.url, traccar.api.username, traccar.api.password"
            )
        
        # Configurar autenticación
        self.auth = HTTPBasicAuth(self.username, self.password)
        
        # Headers por defecto
        self.headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
        
        _logger.info(f"TraccarClient inicializado: {self.base_url}")
    
    def _get_config(self, key, default=None):
        """Obtiene parámetro de configuración de Odoo."""
        IrConfigParameter = self.env['ir.config_parameter'].sudo()
        return IrConfigParameter.get_param(key, default)
    
    def _request(self, method, endpoint, params=None, data=None, retry_count=0):
        """
        Realiza petición HTTP a Traccar con retry automático.
        
        Args:
            method (str): Método HTTP (GET, POST, PUT, DELETE)
            endpoint (str): Endpoint relativo (ej: '/devices')
            params (dict): Query parameters
            data (dict): Body JSON (para POST/PUT)
            retry_count (int): Contador de reintentos
        
        Returns:
            dict o list: Respuesta JSON de Traccar
        
        Raises:
            UserError: Si la petición falla después de reintentos
        """
        url = f"{self.base_url}{endpoint}"
        
        try:
            _logger.debug(f"Traccar {method} {url} | params={params}")
            
            response = requests.request(
                method=method,
                url=url,
                auth=self.auth,
                headers=self.headers,
                params=params,
                json=data,
                timeout=self.timeout
            )
            
            # Log de respuesta
            _logger.debug(f"Traccar response: {response.status_code} | {response.text[:200]}")
            
            # Validar respuesta
            if response.status_code == 200:
                return response.json()
            
            elif response.status_code == 401:
                raise UserError(
                    "Autenticación con Traccar fallida. "
                    "Verifique traccar.api.username y traccar.api.password"
                )
            
            elif response.status_code == 404:
                _logger.warning(f"Traccar endpoint no encontrado: {url}")
                return None
            
            else:
                error_msg = f"Traccar error {response.status_code}: {response.text}"
                _logger.error(error_msg)
                
                # Retry si es error de servidor
                if response.status_code >= 500 and retry_count < self.max_retries:
                    _logger.info(f"Retry {retry_count + 1}/{self.max_retries}")
                    return self._request(method, endpoint, params, data, retry_count + 1)
                
                raise UserError(error_msg)
        
        except requests.exceptions.Timeout:
            error_msg = f"Timeout conectando a Traccar ({self.timeout}s)"
            _logger.error(error_msg)
            
            # Retry en caso de timeout
            if retry_count < self.max_retries:
                _logger.info(f"Retry {retry_count + 1}/{self.max_retries}")
                return self._request(method, endpoint, params, data, retry_count + 1)
            
            raise UserError(error_msg)
        
        except requests.exceptions.ConnectionError:
            error_msg = f"No se puede conectar a Traccar: {self.base_url}"
            _logger.error(error_msg)
            raise UserError(error_msg)
        
        except Exception as e:
            error_msg = f"Error inesperado conectando a Traccar: {str(e)}"
            _logger.exception(error_msg)
            raise UserError(error_msg)
    
    # ========================================================================
    # ENDPOINTS - DEVICES
    # ========================================================================
    
    def get_devices(self):
        """
        Obtiene todos los dispositivos GPS de Traccar.
        
        Returns:
            list: Lista de dispositivos
            [
                {
                    "id": 1,
                    "name": "Moto-001",
                    "uniqueId": "IMEI123456",
                    "status": "online",
                    "lastUpdate": "2025-11-30T10:30:00Z",
                    "positionId": 123,
                    ...
                }
            ]
        """
        return self._request('GET', '/devices')
    
    def get_device(self, device_id):
        """
        Obtiene un dispositivo específico por ID.
        
        Args:
            device_id (int): ID del dispositivo en Traccar
        
        Returns:
            dict: Datos del dispositivo o None si no existe
        """
        devices = self.get_devices()
        for device in devices:
            if device.get('id') == device_id:
                return device
        
        _logger.warning(f"Dispositivo {device_id} no encontrado en Traccar")
        return None
    
    def get_device_by_unique_id(self, unique_id):
        """
        Busca dispositivo por uniqueId (IMEI, serial, etc).
        
        Args:
            unique_id (str): Identificador único del dispositivo
        
        Returns:
            dict: Datos del dispositivo o None si no existe
        """
        devices = self.get_devices()
        for device in devices:
            if device.get('uniqueId') == unique_id:
                return device
        
        _logger.warning(f"Dispositivo con uniqueId '{unique_id}' no encontrado")
        return None
    
    # ========================================================================
    # ENDPOINTS - POSITIONS
    # ========================================================================
    
    def get_positions(self, device_ids, from_time=None, to_time=None):
        """
        Obtiene posiciones históricas de uno o más dispositivos.
        
        Args:
            device_ids (list): Lista de IDs de dispositivos
            from_time (datetime): Fecha inicio (default: hace 24h)
            to_time (datetime): Fecha fin (default: ahora)
        
        Returns:
            list: Lista de posiciones
            [
                {
                    "id": 456,
                    "deviceId": 1,
                    "latitude": 4.60971,
                    "longitude": -74.08175,
                    "speed": 45.5,
                    "course": 180.0,
                    "fixTime": "2025-11-30T10:30:00Z",
                    "serverTime": "2025-11-30T10:30:05Z",
                    "attributes": {
                        "batteryLevel": 85,
                        "distance": 1234.56,
                        "totalDistance": 98765.43
                    }
                }
            ]
        """
        # Defaults: últimas 24 horas
        if not from_time:
            from_time = datetime.now() - timedelta(hours=24)
        if not to_time:
            to_time = datetime.now()
        
        # Formatear fechas ISO 8601
        params = {
            'deviceId': device_ids if isinstance(device_ids, list) else [device_ids],
            'from': from_time.strftime('%Y-%m-%dT%H:%M:%S.000Z'),
            'to': to_time.strftime('%Y-%m-%dT%H:%M:%S.000Z')
        }
        
        return self._request('GET', '/positions', params=params)
    
    def get_last_position(self, device_id):
        """
        Obtiene la última posición conocida de un dispositivo.
        
        Este es el método más usado para tracking en tiempo real.
        
        Args:
            device_id (int): ID del dispositivo en Traccar
        
        Returns:
            dict: Última posición o None si no hay datos
            {
                "latitude": 4.60971,
                "longitude": -74.08175,
                "speed": 45.5,
                "course": 180.0,
                "fixTime": "2025-11-30T10:30:00Z",
                "address": "Cra 7 #10-20, Bogotá",
                "attributes": {...}
            }
        """
        # Primero obtener el device para saber el positionId
        device = self.get_device(device_id)
        
        if not device:
            return None
        
        position_id = device.get('positionId')
        
        if not position_id:
            _logger.warning(f"Dispositivo {device_id} sin posiciones registradas")
            return None
        
        # Obtener la posición específica
        # Traccar no tiene endpoint directo, obtenemos de la lista
        positions = self._request('GET', '/positions', params={'id': position_id})
        
        if positions and len(positions) > 0:
            return positions[0]
        
        return None
    
    # ========================================================================
    # MÉTODOS AUXILIARES
    # ========================================================================
    
    def test_connection(self):
        """
        Prueba la conexión con Traccar.
        
        Returns:
            dict: Estado de la conexión
            {
                'success': True/False,
                'message': 'Mensaje descriptivo',
                'server_version': 'X.X',
                'devices_count': N
            }
        """
        try:
            # Intentar obtener servidor info
            server = self._request('GET', '/server')
            devices = self.get_devices()
            
            return {
                'success': True,
                'message': 'Conexión exitosa con Traccar',
                'server_version': server.get('version', 'Unknown'),
                'devices_count': len(devices) if devices else 0,
                'base_url': self.base_url
            }
        
        except Exception as e:
            return {
                'success': False,
                'message': f'Error conectando a Traccar: {str(e)}',
                'server_version': None,
                'devices_count': 0,
                'base_url': self.base_url
            }
    
    def format_position_for_odoo(self, position):
        """
        Formatea datos de posición de Traccar para Odoo.
        
        Args:
            position (dict): Posición raw de Traccar
        
        Returns:
            dict: Datos formateados para fleet.vehicle
            {
                'x_last_latitude': float,
                'x_last_longitude': float,
                'x_last_speed': float,
                'x_last_update': datetime,
                'x_last_address': str
            }
        """
        if not position:
            return {}
        
        return {
            'x_last_latitude': position.get('latitude'),
            'x_last_longitude': position.get('longitude'),
            'x_last_speed': position.get('speed', 0.0),
            'x_last_update': position.get('fixTime'),  # Odoo parseará automáticamente
            'x_last_address': position.get('address', 'Sin dirección')
        }
