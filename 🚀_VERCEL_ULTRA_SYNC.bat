@echo off
title 🚀 VERCEL ULTRA SYNC v7.0 - GymFuxionFit
setlocal enabledelayedexpansion

echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 🚀 INICIANDO DESPLIEGUE ULTRA-ESTABLE v7.0
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

echo 🔄 1/5: Incrementando version y limpiando cache...
node scripts/bump-version.js
if exist "dist" rd /s /q "dist"
if exist "node_modules\.vite" rd /s /q "node_modules\.vite"

echo.
echo 🛡️ 2/5: Verificando Integridad del Codigo (Build Local)...
call npm run build
if %errorlevel% neq 0 (
    echo.
    echo ❌ ERROR CRITICO: El build ha fallado localmente. 
    echo Vercel rechazaria este codigo. Revisa los errores arriba.
    pause
    exit /b %errorlevel%
)

echo.
echo 📦 3/5: Preparando Commit Antigravity...
git add .
git commit -m "🚀 DEPLOY v7.0: Fix Reception ReferenceError & Version Bump [Auto-Sync]"

echo.
echo 🚀 4/5: Empujando a la Nube (Master)...
git push origin master --force
if %errorlevel% neq 0 (
    echo.
    echo ❌ ERROR: Fallo la subida. Verifica tu conexion o permisos.
    pause
    exit /b
)

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo ✅ ¡DESPLIEGUE EXITOSO!
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 💡 LA PWA SE ACTUALIZARA SOLA EN 1-2 MINUTOS.
echo 💡 Si no ves los cambios, usa CTRL + SHIFT + R.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
pause
