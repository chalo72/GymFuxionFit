@echo off
echo 🚀 INICIANDO DESPLIEGUE MUNDIAL - GymFuxionFit v6.0.0-PREMIUM-DUAL
echo ----------------------------------------------------
echo [1/4] Limpiando residuos anteriores...
if exist dist (
    rd /s /q dist
    echo ✅ Cache de Build eliminada.
)

echo [2/4] Verificando integridad (Build)...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ ERROR: El build ha fallado. Verifica el codigo antes de continuar.
    pause
    exit /b %errorlevel%
)
echo ✅ Build exitoso.

echo [3/4] Preparando Commit de Seguridad...
git add .
git commit -m "🚀 DEPLOY: v6.0.0 - Motor Dual (Firebase+Appwrite) + Recepcion Glass Premium v5.0"

echo [4/4] Desplegando a Vercel/GitHub...
git push -u origin master
echo ----------------------------------------------------
echo 🎉 PROCESO COMPLETADO. Tu app esta ahora en camino al mundo.
echo.
echo 🚨 RECUERDA: Al abrir la app en el celular o tablet, presiona RECARGAR
echo o borra los datos del navegador si no ves el BANNER ROJO arriba.
echo ----------------------------------------------------
pause
