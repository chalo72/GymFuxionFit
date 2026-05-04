@echo off
title 🚀 SUBIDA A LA NUBE (VERCEL) - GymFuxionFit
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 🚀 INICIANDO SUBIDA A LA NUBE (VERCEL)
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

echo 📥 1/4: Actualizando desde la nube (Pull)...
git pull origin master --rebase

echo.
echo 🛡️ 2/4: Verificando que el codigo sea perfecto (Build)...
call npm run build
if %errorlevel% neq 0 (
    echo.
    echo ❌ ERROR CRITICO: El codigo tiene errores. Vercel lo rechazara.
    echo 👁️ Sube la pantalla negra para leer cual es el error y corrigelo.
    pause
    exit /b %errorlevel%
)

echo.
echo 📦 3/4: Empaquetando los cambios...
git add .
git commit -m "🚀 DEPLOY: Actualizacion automatica Vercel"

echo.
echo 🚀 4/4: Enviando a la Nube...
git push origin master
if %errorlevel% neq 0 (
    echo.
    echo ❌ ERROR: Fallo la subida a GitHub/Vercel. Verifica tu internet.
    pause
    exit /b
)

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo ✅ ¡EXITO TOTAL! EL CODIGO VA RUMBO A VERCEL.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 💡 Espera 1 o 2 minutos y entra a tu pagina web para ver los cambios.
echo (Recuerda usar modo Incognito o CTRL+F5 si no los ves)
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
pause
