@echo off
title 🛡️ MODO CRITICO: RESCATE DE VERCEL
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 🛡️ ACTIVANDO PROTOCOLO DE RESCATE VERCEL v6.5.0
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

echo 🔍 1/5: Verificando cambios locales...
git add .

echo.
echo 📦 2/5: Creando commit de fuerza...
git commit -m "🚨 CRITICAL: Force update Vercel - Version 6.5.0" --allow-empty

echo.
echo 🚀 3/5: Empujando cambios a la nube (Branch: master)...
git push origin master --force
if %errorlevel% neq 0 (
    echo.
    echo ❌ ERROR CRITICO: No se pudo subir a GitHub/Vercel.
    echo Revisa si tienes internet o si hay conflictos de Git.
    pause
    exit /b
)

echo.
echo 🧹 4/5: Limpiando cache local de compilacion...
if exist "node_modules\.vite" (
    rd /s /q "node_modules\.vite"
    echo ✅ Cache de Vite eliminada.
)

echo.
echo 🌍 5/5: Verificacion final...
echo La version en version.json ahora es: 6.5.0
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo ✅ ¡PROTOCOLO FINALIZADO!
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 💡 RECOMENDACION:
echo 1. Abre tu pagina de Vercel.
echo 2. Presiona CTRL + SHIFT + R (Limpieza de cache del navegador).
echo 3. Verifica que abajo o en configuracion diga v6.5.0.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
pause
