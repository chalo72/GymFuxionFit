@echo off
title 🛠️ REPARADOR DE VITE - GymFuxionFit
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 🛠️ INICIANDO LIMPIEZA DE CACHE DE VITE
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

echo 🧹 1/2: Verificando node_modules y eliminando carpeta .vite...
if not exist "node_modules" (
    echo [SISTEMA] node_modules no existe. Instalando dependencias primero...
    call npm install
)

if exist "node_modules\.vite" (
    rd /s /q "node_modules\.vite"
    echo ✅ Caché de Vite eliminada.
) else (
    echo ℹ️ No se encontró carpeta de caché .vite.
)

echo.
echo 🚀 2/2: Iniciando servidor en modo limpio...
echo.
call npm run dev
pause

