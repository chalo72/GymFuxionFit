@echo off
title GYMFUXION FIT - DESPLIEGUE MODO DIOS v6.0.0
echo 🌌 INICIANDO PROTOCOLO DE DESPLIEGUE ANTIGRAVITY...
echo.

echo 📦 1/3: Preparando archivos modificados...
git add .
if %errorlevel% neq 0 (
    echo ❌ ERROR: No se pudieron preparar los archivos.
    pause
    exit /b
)

echo 📝 2/3: Registrando cambios en el ADN del sistema...
git commit -m "FIX(Modo-Dios): Reparacion total de buscadores, sincronizacion realtime y actualizacion v6.0.0"
if %errorlevel% neq 0 (
    echo ⚠️ AVISO: Nada nuevo para commit o error de Git.
)

echo 🚀 3/3: Lanzando cambios a Vercel/GitHub...
git push
if %errorlevel% neq 0 (
    echo ❌ ERROR: No se pudo hacer el PUSH. Verifica tu conexion o permisos.
    pause
    exit /b
)

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo ✅ ¡MISION CUMPLIDA! LOS CAMBIOS ESTAN EN LA NUBE.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 💡 RECUERDA: En el navegador presiona CTRL + SHIFT + R 
echo para ver el "Agua bolsa" en la version 6.0.0.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
pause
