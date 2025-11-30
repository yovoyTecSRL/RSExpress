#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
================================================================================
TEST TRACCAR CONNECTION - Script de Prueba para Traccar Integration
================================================================================
Versión: 1.0
Fecha: 2025-11-30
Autor: Sistemas Órbix

Propósito:
----------
Script standalone para validar la conexión con Traccar Server antes de
integrar con Odoo.

Uso:
----
python test_traccar_connection.py

Configuración:
--------------
Editar las variables TRACCAR_* al inicio del script.
================================================================================
"""

import requests
from requests.auth import HTTPBasicAuth
import json
from datetime import datetime

# ========================================================================
# CONFIGURACIÓN - EDITAR ESTOS VALORES
# ========================================================================

TRACCAR_URL = "http://localhost:8082/api"
TRACCAR_USERNAME = "admin"
TRACCAR_PASSWORD = "admin"
TIMEOUT = 10

# ========================================================================
# COLORES PARA TERMINAL
# ========================================================================

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

def print_header(text):
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*70}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.BLUE}{text.center(70)}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'='*70}{Colors.RESET}\n")

def print_success(text):
    print(f"{Colors.GREEN}✅ {text}{Colors.RESET}")

def print_error(text):
    print(f"{Colors.RED}❌ {text}{Colors.RESET}")

def print_warning(text):
    print(f"{Colors.YELLOW}⚠️  {text}{Colors.RESET}")

def print_info(text):
    print(f"{Colors.BLUE}ℹ️  {text}{Colors.RESET}")

# ========================================================================
# FUNCIONES DE TEST
# ========================================================================

def test_server_info():
    """Test 1: Obtener información del servidor Traccar"""
    print_header("TEST 1: Información del Servidor")
    
    try:
        response = requests.get(
            f"{TRACCAR_URL}/server",
            auth=HTTPBasicAuth(TRACCAR_USERNAME, TRACCAR_PASSWORD),
            timeout=TIMEOUT
        )
        
        if response.status_code == 200:
            data = response.json()
            print_success("Conexión exitosa con Traccar Server")
            print_info(f"URL: {TRACCAR_URL}")
            print_info(f"Versión: {data.get('version', 'N/A')}")
            print_info(f"ID: {data.get('id', 'N/A')}")
            print_info(f"Nombre: {data.get('name', 'N/A')}")
            return True
        
        elif response.status_code == 401:
            print_error("Autenticación fallida - Verificar usuario y contraseña")
            return False
        
        else:
            print_error(f"Error {response.status_code}: {response.text}")
            return False
    
    except requests.exceptions.ConnectionError:
        print_error(f"No se puede conectar a {TRACCAR_URL}")
        print_warning("Verificar que Traccar Server esté corriendo")
        return False
    
    except requests.exceptions.Timeout:
        print_error(f"Timeout después de {TIMEOUT} segundos")
        return False
    
    except Exception as e:
        print_error(f"Error inesperado: {str(e)}")
        return False

def test_devices():
    """Test 2: Listar dispositivos GPS"""
    print_header("TEST 2: Dispositivos GPS Registrados")
    
    try:
        response = requests.get(
            f"{TRACCAR_URL}/devices",
            auth=HTTPBasicAuth(TRACCAR_USERNAME, TRACCAR_PASSWORD),
            timeout=TIMEOUT
        )
        
        if response.status_code == 200:
            devices = response.json()
            
            if len(devices) == 0:
                print_warning("No hay dispositivos registrados en Traccar")
                print_info("Registre dispositivos en Traccar UI: http://localhost:8082")
                return True
            
            print_success(f"Se encontraron {len(devices)} dispositivo(s)")
            
            for idx, device in enumerate(devices, 1):
                print(f"\n  📱 Dispositivo {idx}:")
                print(f"     ID: {device.get('id')}")
                print(f"     Nombre: {device.get('name')}")
                print(f"     Unique ID: {device.get('uniqueId')}")
                print(f"     Estado: {device.get('status')}")
                print(f"     Última actualización: {device.get('lastUpdate')}")
            
            return True
        
        else:
            print_error(f"Error {response.status_code}: {response.text}")
            return False
    
    except Exception as e:
        print_error(f"Error obteniendo dispositivos: {str(e)}")
        return False

def test_positions():
    """Test 3: Obtener posiciones GPS"""
    print_header("TEST 3: Posiciones GPS")
    
    try:
        # Primero obtener dispositivos
        response = requests.get(
            f"{TRACCAR_URL}/devices",
            auth=HTTPBasicAuth(TRACCAR_USERNAME, TRACCAR_PASSWORD),
            timeout=TIMEOUT
        )
        
        if response.status_code != 200:
            print_error("No se pueden obtener dispositivos")
            return False
        
        devices = response.json()
        
        if len(devices) == 0:
            print_warning("No hay dispositivos para obtener posiciones")
            return True
        
        # Obtener posiciones del primer dispositivo
        device = devices[0]
        device_id = device['id']
        
        response = requests.get(
            f"{TRACCAR_URL}/positions",
            params={'deviceId': device_id},
            auth=HTTPBasicAuth(TRACCAR_USERNAME, TRACCAR_PASSWORD),
            timeout=TIMEOUT
        )
        
        if response.status_code == 200:
            positions = response.json()
            
            if len(positions) == 0:
                print_warning(f"Dispositivo '{device['name']}' sin posiciones registradas")
                return True
            
            print_success(f"Se encontraron {len(positions)} posición(es) para '{device['name']}'")
            
            # Mostrar última posición
            last_pos = positions[-1]
            print(f"\n  📍 Última posición:")
            print(f"     Latitud: {last_pos.get('latitude')}")
            print(f"     Longitud: {last_pos.get('longitude')}")
            print(f"     Velocidad: {last_pos.get('speed', 0)} km/h")
            print(f"     Curso: {last_pos.get('course', 0)}°")
            print(f"     Timestamp: {last_pos.get('fixTime')}")
            print(f"     Dirección: {last_pos.get('address', 'N/A')}")
            
            # Mostrar atributos adicionales
            attributes = last_pos.get('attributes', {})
            if attributes:
                print(f"\n  📊 Atributos:")
                for key, value in attributes.items():
                    print(f"     {key}: {value}")
            
            return True
        
        else:
            print_error(f"Error {response.status_code}: {response.text}")
            return False
    
    except Exception as e:
        print_error(f"Error obteniendo posiciones: {str(e)}")
        return False

def test_authentication():
    """Test 4: Probar autenticación con credenciales incorrectas"""
    print_header("TEST 4: Validación de Autenticación")
    
    try:
        # Intentar con credenciales incorrectas
        response = requests.get(
            f"{TRACCAR_URL}/server",
            auth=HTTPBasicAuth("invalid_user", "invalid_pass"),
            timeout=TIMEOUT
        )
        
        if response.status_code == 401:
            print_success("Validación de autenticación funciona correctamente")
            print_info("Las credenciales incorrectas son rechazadas (esperado)")
            return True
        
        else:
            print_warning("El servidor no valida correctamente la autenticación")
            return False
    
    except Exception as e:
        print_error(f"Error en test de autenticación: {str(e)}")
        return False

def test_api_endpoints():
    """Test 5: Verificar endpoints disponibles"""
    print_header("TEST 5: Endpoints API Disponibles")
    
    endpoints = [
        '/server',
        '/devices',
        '/positions',
        '/session',
        '/users'
    ]
    
    all_ok = True
    
    for endpoint in endpoints:
        try:
            response = requests.get(
                f"{TRACCAR_URL}{endpoint}",
                auth=HTTPBasicAuth(TRACCAR_USERNAME, TRACCAR_PASSWORD),
                timeout=TIMEOUT
            )
            
            if response.status_code in [200, 204]:
                print_success(f"{endpoint} - OK")
            elif response.status_code == 403:
                print_warning(f"{endpoint} - Acceso denegado (403)")
            else:
                print_error(f"{endpoint} - Error {response.status_code}")
                all_ok = False
        
        except Exception as e:
            print_error(f"{endpoint} - Exception: {str(e)}")
            all_ok = False
    
    return all_ok

# ========================================================================
# FUNCIÓN PRINCIPAL
# ========================================================================

def main():
    """Ejecutar todos los tests"""
    print_header("TRACCAR CONNECTION TEST - RSExpress by Órbix")
    
    print(f"{Colors.BOLD}Configuración:{Colors.RESET}")
    print(f"  URL: {TRACCAR_URL}")
    print(f"  Usuario: {TRACCAR_USERNAME}")
    print(f"  Timeout: {TIMEOUT}s")
    print()
    
    results = []
    
    # Ejecutar tests
    results.append(("Servidor Info", test_server_info()))
    results.append(("Dispositivos", test_devices()))
    results.append(("Posiciones GPS", test_positions()))
    results.append(("Autenticación", test_authentication()))
    results.append(("Endpoints API", test_api_endpoints()))
    
    # Resumen final
    print_header("RESUMEN DE TESTS")
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        color = Colors.GREEN if result else Colors.RED
        print(f"{color}{status}{Colors.RESET} - {test_name}")
    
    print(f"\n{Colors.BOLD}Resultado: {passed}/{total} tests exitosos{Colors.RESET}")
    
    if passed == total:
        print_success("Todos los tests pasaron - Traccar está listo para integración")
        return 0
    else:
        print_error("Algunos tests fallaron - Revisar configuración")
        return 1

# ========================================================================
# EJECUCIÓN
# ========================================================================

if __name__ == "__main__":
    import sys
    sys.exit(main())
