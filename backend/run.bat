@echo off
echo ============================================================
echo   Flower Disease Detection - Backend Server
echo ============================================================
echo.

if not exist "app.py" (
    echo ERROR: Run this script from the backend\ directory.
    pause & exit /b 1
)

if not exist "..\models\health_model.keras" (
    echo ERROR: health_model.keras not found in ..\models\
    echo Run train_models.py from the project root first.
    pause & exit /b 1
)

if not exist "..\models\species_model.keras" (
    echo ERROR: species_model.keras not found in ..\models\
    echo Run train_models.py from the project root first.
    pause & exit /b 1
)

set TF_ENABLE_ONEDNN_OPTS=0
set TF_CPP_MIN_LOG_LEVEL=2

set PYTHON=..\.venv311\Scripts\python.exe
if not exist "%PYTHON%" set PYTHON=python

echo Starting Flask backend with %PYTHON%...
echo API available at: http://localhost:5000
echo Press Ctrl+C to stop.
echo.

%PYTHON% app.py