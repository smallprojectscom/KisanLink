@echo off
title KisanLink - Python Server

echo ==========================================
echo          KISANLINK PYTHON SERVER
echo ==========================================
echo.
echo Starting Backend on port 8081...
echo Starting Frontend on port 5501...
echo.

start "KisanLink Backend" cmd /k "cd /d E:\SIH26132_PYTHON\backend && python -m uvicorn app:app --host 127.0.0.1 --port 8081"

timeout /t 2 /nobreak >nul

start "KisanLink Frontend" cmd /k "cd /d E:\SIH26132_PYTHON\frontend && python -m http.server 5501 --bind 127.0.0.1"

timeout /t 2 /nobreak >nul

echo.
echo ==========================================
echo Backend:  http://127.0.0.1:8081
echo Frontend: http://127.0.0.1:5501
echo ==========================================
echo.
echo Opening KisanLink...
start "" "http://127.0.0.1:5501"

exit
