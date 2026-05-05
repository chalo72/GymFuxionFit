@echo off
title 🛠️ REPARADOR DE VITE - GymFuxionFit
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 🛠️ INICIANDO LIMPIEZA DE CACHE DE VITE
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

echo 🧹 1/2: Eliminando carpeta .vite (Caché corrupta)...
if exist "node_modules\.vite" (
    rd /s /q "node_modules\.vite"
    echo ✅ Caché eliminada.
) else (
    echo ℹ️ No se encontró carpeta de caché.
)

echo.
echo 🚀 2/2: Iniciando servidor limpio...
echo 💡 Se abrira una nueva terminal con la App.
echo.
pause
start cmd /k "npm run dev"
exit
