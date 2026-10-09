@echo off
echo Installing Python dependencies...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://python.org
    pause
    exit /b 1
)

REM Install dependencies
echo Installing required packages...
pip install -r requirements.txt

if errorlevel 1 (
    echo.
    echo Error installing dependencies. Please check the error messages above.
    pause
    exit /b 1
)

echo.
echo ✓ Dependencies installed successfully!
echo.
echo Testing model loading...
python test_model.py

echo.
echo Setup complete! You can now run:
echo   1. Backend: cd backend && python app.py
echo   2. Frontend: cd client && npm install && npm start
echo.
pause