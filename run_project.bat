@echo off
echo ============================================================
echo   Flower Disease Detection - Starting Full Application
echo ============================================================
echo.

set PYTHON=.venv311\Scripts\python.exe
if not exist "%PYTHON%" (
    if exist "venv\Scripts\python.exe" set PYTHON=venv\Scripts\python.exe
    if not exist "%PYTHON%" set PYTHON=python
)

echo [1/2] Starting Flask Backend Server on port 5000...
start "Flower Disease Backend" cmd /k "cd backend && ..\%PYTHON% app.py"

echo [2/2] Starting Frontend Vite Server on port 3001...
start "Flower Disease Frontend" cmd /k "cd Frontend && npm run dev"

echo.
echo ============================================================
echo Both servers have been launched in separate windows!
echo - Backend API: http://localhost:5000
echo - Frontend UI:  http://localhost:3001
echo ============================================================
pause
