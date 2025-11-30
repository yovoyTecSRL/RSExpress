@echo off
REM ========================================================
REM RSExpress Logistics - Script de Instalacion Windows
REM ========================================================
REM Autor: Sistemas Orbix
REM Fecha: 30 de Noviembre, 2025
REM ========================================================

echo.
echo ========================================================
echo  RSEXPRESS LOGISTICS - INSTALACION/ACTUALIZACION
echo ========================================================
echo.

REM Colores y formato
color 0A

echo [PASO 1] Verificando estructura del modulo...
echo.

REM Verificar que estamos en el directorio correcto
if not exist "__manifest__.py" (
    echo [ERROR] No se encuentra __manifest__.py
    echo Por favor ejecute este script desde el directorio del modulo
    pause
    exit /b 1
)

echo [OK] Archivo __manifest__.py encontrado
echo.

REM Verificar archivos criticos
echo [PASO 2] Verificando archivos criticos...
echo.

set ERROR_COUNT=0

if not exist "models\__init__.py" (
    echo [ERROR] Falta models\__init__.py
    set /a ERROR_COUNT+=1
)

if not exist "models\fleet_vehicle_ext.py" (
    echo [ERROR] Falta models\fleet_vehicle_ext.py
    set /a ERROR_COUNT+=1
)

if not exist "models\delivery_order.py" (
    echo [ERROR] Falta models\delivery_order.py
    set /a ERROR_COUNT+=1
)

if not exist "security\ir.model.access.csv" (
    echo [ERROR] Falta security\ir.model.access.csv
    set /a ERROR_COUNT+=1
)

if not exist "data\ir_sequence.xml" (
    echo [ERROR] Falta data\ir_sequence.xml
    set /a ERROR_COUNT+=1
)

if not exist "views\delivery_order_views.xml" (
    echo [ERROR] Falta views\delivery_order_views.xml
    set /a ERROR_COUNT+=1
)

if %ERROR_COUNT% GTR 0 (
    echo.
    echo [ERROR] Se encontraron %ERROR_COUNT% archivos faltantes
    echo Por favor verifique la estructura del modulo
    pause
    exit /b 1
)

echo [OK] Todos los archivos criticos presentes
echo.

REM Verificar sintaxis Python si esta disponible
echo [PASO 3] Verificando sintaxis Python (opcional)...
echo.

where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Python encontrado, ejecutando verificacion...
    python verify_module.py
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo [ADVERTENCIA] Verificacion reporto errores
        echo Puede continuar pero revise los errores
        echo.
        set /p CONTINUAR="Desea continuar de todas formas? (S/N): "
        if /i "%CONTINUAR%" NEQ "S" (
            echo Instalacion cancelada
            pause
            exit /b 1
        )
    )
) else (
    echo [INFO] Python no encontrado, saltando verificacion automatica
    echo Asegurese de que los archivos Python sean validos
)

echo.
echo ========================================================
echo  INSTRUCCIONES DE INSTALACION EN ODOO
echo ========================================================
echo.
echo Por favor siga estos pasos en su instancia de Odoo:
echo.
echo 1. Abrir navegador e ir a su instalacion de Odoo
echo 2. Iniciar sesion como administrador
echo 3. Ir a: Ajustes ^> Activar modo desarrollador
echo 4. Ir a: Apps (Aplicaciones)
echo 5. Hacer clic en: Actualizar Lista de Apps
echo 6. Buscar: "Orbix Fleet Test" o "RSExpress"
echo 7. Hacer clic en: INSTALAR (si es primera vez)
echo    O hacer clic en menu (...)  ^> ACTUALIZAR (si ya existe)
echo.
echo ========================================================
echo  VERIFICACION POST-INSTALACION
echo ========================================================
echo.
echo Despues de instalar, verifique que:
echo.
echo [x] Aparece menu "RSExpress" en la barra superior
echo [x] Submenu "Gestion de Flota" esta presente
echo [x] Submenu "Ordenes de Entrega" esta presente
echo [x] Puede crear un vehiculo de prueba
echo [x] Puede crear una orden de entrega de prueba
echo [x] El codigo de orden se genera automaticamente (RSX-000001)
echo.
echo ========================================================
echo  DOCUMENTACION DISPONIBLE
echo ========================================================
echo.
echo - README.md                          - Guia de usuario
echo - INSTALL.md                         - Guia de instalacion detallada
echo - LOGICA_RSEXPRESS_EXPLICADA.md      - Documentacion tecnica
echo - IMPLEMENTACION_DELIVERY_ORDER.md   - Detalles de ordenes
echo - ESTADO_FINAL_MODULO.md             - Estado completo del proyecto
echo.
echo ========================================================
echo  INSTALACION ALTERNATIVA (CLI)
echo ========================================================
echo.
echo Si tiene acceso a la linea de comandos de Odoo:
echo.
echo python odoo-bin -c odoo.conf -d TU_BASE_DATOS -i orbix_fleet_test
echo.
echo Para actualizar un modulo ya instalado:
echo.
echo python odoo-bin -c odoo.conf -d TU_BASE_DATOS -u orbix_fleet_test
echo.
echo ========================================================

echo.
set /p ABRIR_DOC="Desea abrir la documentacion de instalacion? (S/N): "
if /i "%ABRIR_DOC%"=="S" (
    start INSTALL.md
)

echo.
echo ========================================================
echo  MODULO LISTO PARA INSTALACION
echo ========================================================
echo.
echo Todos los archivos estan en orden.
echo Siga las instrucciones mostradas para completar
echo la instalacion en su instancia de Odoo.
echo.
echo Gracias por usar RSExpress Logistics!
echo.
echo ========================================================
echo.

pause
