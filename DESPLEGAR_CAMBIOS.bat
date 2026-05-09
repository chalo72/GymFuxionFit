@echo off
title 🚀 Desplegar Cambios a Vercel
setlocal enabledelayedexpansion

echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 🚀 INICIANDO DESPLIEGUE AUTOMATICO
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

echo 🔄 1/3: Agregando todos los cambios...
git add .

echo.
echo 📦 2/3: Creando commit automatico...
git commit -m "🚀 Auto-Deploy: Actualizacion de mejoras del sistema"

echo.
echo 🚀 3/3: Empujando a Master (Vercel)...
git push origin master

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo ✅ ¡PROCESO COMPLETADO!
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 💡 Espera 1-2 minutos para que Vercel termine el despliegue.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
pause
