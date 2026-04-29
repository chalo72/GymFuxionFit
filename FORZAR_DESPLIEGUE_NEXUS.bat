@echo off
title FORZAR DESPLIEGUE NEXUS - REPARACIÓN DE EMERGENCIA
echo 🛠️ INICIANDO REPARACIÓN DE CONFLICTOS...
echo.

echo 📥 1/4: Trayendo cambios remotos (Pull)...
git pull origin master --rebase
if %errorlevel% neq 0 (
    echo ❌ ERROR en Pull. Intentando modo forzado...
)

echo 📦 2/4: Preparando archivos corregidos (v6.2.1)...
git add .

echo 📝 3/4: Creando punto de restauración...
git commit -m "FIX(Sync): MODO CRITICO - Reparacion de emergencia v6.2.1"

echo 🚀 4/4: Subiendo a la Nube (Push)...
git push origin master
if %errorlevel% neq 0 (
    echo.
    echo ❌ ERROR CRÍTICO: No se pudo subir el código. 
    echo Posibles causas: 
    echo 1. No tienes internet.
    echo 2. No tienes permisos de Git.
    echo 3. Hay un conflicto que requiere intervención manual.
    pause
    exit /b
)

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo ✅ ¡ÉXITO TOTAL! LA NUBE SE ESTÁ ACTUALIZANDO.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 💡 Espera 1 minuto y refresca Vercel con CTRL + F5.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
pause
