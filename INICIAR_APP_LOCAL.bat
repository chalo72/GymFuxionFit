@echo off
title GymFuxionFit - Servidor Local (Nexus Edition)
color 0B

echo ============================================================
echo   INICIALIZANDO ECO-SISTEMA GYMFUXIONFIT
echo ============================================================
echo.

:: 1. Verificar si Node.js está instalado
echo [SISTEMA] Verificando entorno...
node -v >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js no esta instalado o no se encuentra en el PATH.
    echo [TIP] Descarga e instala Node.js desde: https://nodejs.org/
    echo.
    pause
    exit /b
)

:: 2. Verificar si node_modules existe
if not exist "node_modules\" (
    echo [SISTEMA] No se encontro la carpeta node_modules.
    echo [SISTEMA] Instalando dependencias necesarias...
    echo [INFO] Esto puede tardar un par de minutos.
    call npm install
)

echo [SISTEMA] Lanzando servidor de desarrollo (Vite)...
echo.

:: 3. Ejecutar el servidor
call npm run dev

:: Si llegamos aquí y hubo error, informar
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] El servidor se detuvo de forma inesperada (Codigo: %ERRORLEVEL%).
    echo [TIP] Prueba ejecutando 'npm install' manualmente o usa REPARAR_VITE.bat.
)

echo.
echo [SISTEMA] Proceso finalizado.
pause

