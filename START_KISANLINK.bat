@echo off
set "PROJECT_DIR=%~dp0"

title KisanLink Python - SIH26132

echo.
echo ========================================
echo       KISANLINK PYTHON SYSTEM
echo ========================================
echo.

echo Starting FastAPI Backend...
start "KisanLink Backend" cmd /k "cd /d "%PROJECT_DIR%backend" && python -m uvicorn app:app --host 127.0.0.1 --port 8081"

timeout /t 3 /nobreak >nul

echo Starting Frontend...
start "KisanLink Frontend" cmd /k "cd /d "%PROJECT_DIR%frontend" && python -m http.server 5501"

timeout /t 3 /nobreak >nul

echo Opening KisanLink...
start "" "http://127.0.0.1:5501/index.html"

echo.
echo ========================================
echo       KISANLINK STARTED
echo ========================================
echo.
echo Frontend: http://127.0.0.1:5501
echo Backend : http://127.0.0.1:8081
echo.
pause
