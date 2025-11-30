#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
RSExpress Logistics - Script de Verificación de Módulo
======================================================

Este script verifica que todos los archivos del módulo estén correctos
antes de instalar/actualizar en Odoo.

Uso:
    python verify_module.py

Autor: Sistemas Órbix
Fecha: 30 de Noviembre, 2025
"""

import os
import sys
from pathlib import Path
import xml.etree.ElementTree as ET

# Colores para terminal
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    BOLD = '\033[1m'
    END = '\033[0m'

def print_success(msg):
    print(f"{Colors.GREEN}✅ {msg}{Colors.END}")

def print_error(msg):
    print(f"{Colors.RED}❌ {msg}{Colors.END}")

def print_warning(msg):
    print(f"{Colors.YELLOW}⚠️  {msg}{Colors.END}")

def print_info(msg):
    print(f"{Colors.BLUE}ℹ️  {msg}{Colors.END}")

def print_header(msg):
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}{msg:^60}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.END}\n")

# Directorio base del módulo
MODULE_DIR = Path(__file__).parent
MODULE_NAME = "orbix_fleet_test"

# Archivos requeridos
REQUIRED_FILES = {
    '__init__.py': 'Archivo de inicialización del módulo',
    '__manifest__.py': 'Manifiesto del módulo',
    'models/__init__.py': 'Inicialización de modelos',
    'models/fleet_vehicle_ext.py': 'Extensión de fleet.vehicle',
    'models/delivery_order.py': 'Modelo de órdenes de entrega',
    'security/ir.model.access.csv': 'Permisos de acceso',
    'data/ir_sequence.xml': 'Secuencia de códigos de orden',
    'views/fleet_vehicle_title.xml': 'Vista título vehículos',
    'views/fleet_vehicle_clean.xml': 'Vista limpia vehículos',
    'views/fleet_vehicle_rsexpress_buttons.xml': 'Botones RSExpress',
    'views/orbix_fleet_list_view.xml': 'Vista lista vehículos',
    'views/fleet_vehicle_kanban_inherit.xml': 'Kanban heredado vehículos',
    'views/fleet_vehicle_rsexpress_kanban.xml': 'Kanban RSExpress',
    'views/delivery_order_views.xml': 'Vistas órdenes de entrega',
    'views/rsexpress_menu.xml': 'Menú RSExpress',
}

# Archivos XML a validar
XML_FILES = [
    'data/ir_sequence.xml',
    'views/fleet_vehicle_title.xml',
    'views/fleet_vehicle_clean.xml',
    'views/fleet_vehicle_rsexpress_buttons.xml',
    'views/orbix_fleet_list_view.xml',
    'views/fleet_vehicle_kanban_inherit.xml',
    'views/fleet_vehicle_rsexpress_kanban.xml',
    'views/delivery_order_views.xml',
    'views/rsexpress_menu.xml',
]

# Archivos Python a verificar sintaxis
PYTHON_FILES = [
    '__init__.py',
    '__manifest__.py',
    'models/__init__.py',
    'models/fleet_vehicle_ext.py',
    'models/delivery_order.py',
]

def check_file_exists(filepath, description):
    """Verifica que un archivo exista"""
    full_path = MODULE_DIR / filepath
    if full_path.exists():
        print_success(f"{filepath}: {description}")
        return True
    else:
        print_error(f"{filepath}: NO ENCONTRADO")
        return False

def validate_xml(filepath):
    """Valida sintaxis XML"""
    full_path = MODULE_DIR / filepath
    try:
        ET.parse(full_path)
        print_success(f"XML válido: {filepath}")
        return True
    except ET.ParseError as e:
        print_error(f"XML inválido: {filepath}")
        print_error(f"  Error: {str(e)}")
        return False
    except Exception as e:
        print_error(f"Error leyendo: {filepath}")
        print_error(f"  Error: {str(e)}")
        return False

def validate_python(filepath):
    """Valida sintaxis Python"""
    full_path = MODULE_DIR / filepath
    try:
        with open(full_path, 'r', encoding='utf-8') as f:
            code = f.read()
            compile(code, filepath, 'exec')
        print_success(f"Python válido: {filepath}")
        return True
    except SyntaxError as e:
        print_error(f"Sintaxis Python inválida: {filepath}")
        print_error(f"  Línea {e.lineno}: {e.msg}")
        return False
    except Exception as e:
        print_error(f"Error leyendo: {filepath}")
        print_error(f"  Error: {str(e)}")
        return False

def check_manifest():
    """Verifica contenido del manifest"""
    manifest_path = MODULE_DIR / '__manifest__.py'
    try:
        with open(manifest_path, 'r', encoding='utf-8') as f:
            content = f.read()
            manifest = eval(content)
        
        print_info("Verificando __manifest__.py:")
        
        # Verificar campos requeridos
        required_keys = ['name', 'version', 'depends', 'data']
        for key in required_keys:
            if key in manifest:
                print_success(f"  Campo '{key}': ✓")
            else:
                print_error(f"  Campo '{key}': FALTA")
        
        # Verificar dependencias
        print_info("\n  Dependencias:")
        for dep in manifest.get('depends', []):
            print(f"    • {dep}")
        
        # Verificar archivos de datos
        print_info("\n  Archivos de datos:")
        for data_file in manifest.get('data', []):
            full_path = MODULE_DIR / data_file
            if full_path.exists():
                print_success(f"    • {data_file}")
            else:
                print_error(f"    • {data_file} - NO EXISTE")
        
        return True
    except Exception as e:
        print_error(f"Error verificando manifest: {str(e)}")
        return False

def check_security():
    """Verifica archivo de seguridad"""
    security_path = MODULE_DIR / 'security' / 'ir.model.access.csv'
    try:
        with open(security_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        print_info("Verificando security/ir.model.access.csv:")
        print_success(f"  {len(lines)} líneas encontradas")
        
        # Verificar que tenga header
        if lines[0].startswith('id,name,model_id'):
            print_success("  Header correcto")
        else:
            print_error("  Header incorrecto")
        
        # Contar permisos
        num_permissions = len(lines) - 1
        print_info(f"  {num_permissions} reglas de acceso definidas")
        
        return True
    except Exception as e:
        print_error(f"Error verificando seguridad: {str(e)}")
        return False

def check_models():
    """Verifica que los modelos tengan las clases correctas"""
    errors = []
    
    # Verificar fleet_vehicle_ext.py
    vehicle_path = MODULE_DIR / 'models' / 'fleet_vehicle_ext.py'
    try:
        with open(vehicle_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if 'class FleetVehicleRSExpress' in content:
            print_success("Clase FleetVehicleRSExpress encontrada")
        else:
            print_error("Clase FleetVehicleRSExpress NO encontrada")
            errors.append("FleetVehicleRSExpress")
        
        if '_inherit = "fleet.vehicle"' in content or "_inherit = 'fleet.vehicle'" in content:
            print_success("Herencia de fleet.vehicle correcta")
        else:
            print_warning("No se encontró herencia de fleet.vehicle")
    except Exception as e:
        print_error(f"Error verificando fleet_vehicle_ext.py: {str(e)}")
        errors.append("fleet_vehicle_ext")
    
    # Verificar delivery_order.py
    order_path = MODULE_DIR / 'models' / 'delivery_order.py'
    try:
        with open(order_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if 'class RSExpressDeliveryOrder' in content:
            print_success("Clase RSExpressDeliveryOrder encontrada")
        else:
            print_error("Clase RSExpressDeliveryOrder NO encontrada")
            errors.append("RSExpressDeliveryOrder")
        
        if '_name = "rsexpress.delivery.order"' in content or "_name = 'rsexpress.delivery.order'" in content:
            print_success("Nombre del modelo correcto")
        else:
            print_error("Nombre del modelo incorrecto")
            errors.append("delivery.order._name")
    except Exception as e:
        print_error(f"Error verificando delivery_order.py: {str(e)}")
        errors.append("delivery_order")
    
    return len(errors) == 0

def main():
    """Función principal"""
    print_header("VERIFICACIÓN DE MÓDULO RSEXPRESS LOGISTICS")
    
    total_errors = 0
    
    # 1. Verificar existencia de archivos
    print_header("1. VERIFICACIÓN DE ARCHIVOS REQUERIDOS")
    for filepath, description in REQUIRED_FILES.items():
        if not check_file_exists(filepath, description):
            total_errors += 1
    
    # 2. Validar archivos XML
    print_header("2. VALIDACIÓN DE SINTAXIS XML")
    for xml_file in XML_FILES:
        if not validate_xml(xml_file):
            total_errors += 1
    
    # 3. Validar archivos Python
    print_header("3. VALIDACIÓN DE SINTAXIS PYTHON")
    for py_file in PYTHON_FILES:
        if not validate_python(py_file):
            total_errors += 1
    
    # 4. Verificar manifest
    print_header("4. VERIFICACIÓN DE MANIFEST")
    if not check_manifest():
        total_errors += 1
    
    # 5. Verificar seguridad
    print_header("5. VERIFICACIÓN DE SEGURIDAD")
    if not check_security():
        total_errors += 1
    
    # 6. Verificar modelos
    print_header("6. VERIFICACIÓN DE MODELOS")
    if not check_models():
        total_errors += 1
    
    # Resumen final
    print_header("RESUMEN DE VERIFICACIÓN")
    if total_errors == 0:
        print_success("✨ ¡TODAS LAS VERIFICACIONES PASARON!")
        print_success("El módulo está listo para instalar/actualizar en Odoo")
        print_info("\nPróximos pasos:")
        print_info("  1. Ir a Odoo → Apps")
        print_info("  2. Actualizar lista de apps")
        print_info("  3. Buscar 'Orbix Fleet Test'")
        print_info("  4. Clic en Instalar o Actualizar")
        return 0
    else:
        print_error(f"❌ SE ENCONTRARON {total_errors} ERRORES")
        print_error("Por favor corrija los errores antes de continuar")
        return 1

if __name__ == '__main__':
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print("\n\n⚠️  Verificación interrumpida por el usuario")
        sys.exit(1)
    except Exception as e:
        print_error(f"Error inesperado: {str(e)}")
        sys.exit(1)
