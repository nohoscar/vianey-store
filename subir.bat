@echo off
echo ========================================
echo   SUBIENDO CAMBIOS A LA TIENDA...
echo ========================================
echo.

cd /d "%~dp0"

git add .
git commit -m "Actualizar productos - %date% %time%"
git push

echo.
echo ========================================
echo   LISTO! Los cambios ya estan en linea
echo ========================================
echo.
pause
