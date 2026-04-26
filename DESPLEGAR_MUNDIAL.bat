@echo off
echo 🚀 INICIANDO DESPLIEGUE MUNDIAL - GymFuxionFit v5.7.1-AUTH-STABILITY
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
git commit -m "🔐 FIX CRÍTICO: v5.7.1 - Eliminado bucle de redirección Login y reforzada persistencia de sesión"

echo [3/3] Desplegando a Vercel/GitHub...
git push -u origin master
echo ----------------------------------------------------
echo 🎉 PROCESO COMPLETADO. Tu app esta ahora en camino al mundo.
echo.
echo ⚠️  IMPORTANTE: Se ha aplicado un refuerzo en la persistencia de datos.
echo    Si el problema persiste, limpia la caché del navegador una última vez.
pause
