@echo off
title Configuración de Despliegue - Antigravity
echo 🛠️ CONFIGURANDO REPOSITORIO PARA DESPLIEGUE MUNDIAL
echo ------------------------------------------------
echo [1/3] Inicializando Git...
git init
echo [2/3] Preparando archivos...
git add .
git commit -m "🚀 INITIAL: GymFuxionFit v5.1.0-WORLDWIDE [GLOBAL_FUSION]"
echo.
echo [3/3] CONEXIÓN CON LA NUBE
echo Por favor, pega aqui la URL de tu repositorio de GitHub o Vercel:
set /p repo_url="URL: "
if "%repo_url%"=="" (
    echo ❌ No se proporcionó URL. El proceso se detendrá.
    pause
    exit /b
)
git remote add origin %repo_url%
echo.
echo ✅ REPOSITORIO VINCULADO.
echo Ahora puedes ejecutar DESPLEGAR_MUNDIAL.bat para lanzar la app.
echo.
pause
