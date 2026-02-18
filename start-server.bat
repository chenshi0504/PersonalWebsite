@echo off
chcp 65001 >nul
echo ========================================
echo   Personal Website - Local Server
echo ========================================
echo.

set PORT=8000
set URL=http://localhost:%PORT%

REM 检查Python
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo [√] Python detected, starting server...
    echo.
    echo Server: %URL%
    echo Press Ctrl+C to stop
    echo.
    start "" "%URL%"
    python -m http.server %PORT%
    goto :end
)

REM 检查Node.js
node --version >nul 2>&1
if %errorlevel% == 0 (
    echo [√] Node.js detected, starting server...
    where http-server >nul 2>&1
    if not %errorlevel% == 0 (
        echo [!] Installing http-server...
        npm install -g http-server
    )
    echo.
    echo Server: %URL%
    echo Press Ctrl+C to stop
    echo.
    start "" "%URL%"
    http-server -p %PORT% -c-1
    goto :end
)

echo [x] Error: Python or Node.js not found.
echo Please install one of:
echo   Python 3.x : https://www.python.org/downloads/
echo   Node.js    : https://nodejs.org/
echo.
pause

:end
