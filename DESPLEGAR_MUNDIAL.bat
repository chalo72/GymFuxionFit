@echo off
echo 🚀 INICIANDO DESPLIEGUE MUNDIAL - GymFuxionFit v5.6.2-SELECT-PRODUCT
echo ----------------------------------------------------
echo [1/3] Verificando integridad (Build)...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ ERROR: El build ha fallado. Verifica el codigo antes de continuar.
    pause
    exit /b %errorlevel%
)
echo ✅ Build exitoso.

echo [2/3] Preparando Commit de Seguridad...
git add .
git commit -m "🚀 DEPLOY: v5.6.2 - Buscador Inteligente de Productos en Recepción"

echo [3/3] Desplegando a Vercel/GitHub...
git push -u origin master
echo ----------------------------------------------------
echo 🎉 PROCESO COMPLETADO. Tu app esta ahora en camino al mundo.
echo Revisa tu dashboard de Vercel para confirmar el estado live.
pause
