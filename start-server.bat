@echo off
echo ========================================
echo   个人网站平台 - 本地服务器启动
echo ========================================
echo.

REM 检查Python是否安装
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo [√] 检测到Python，正在启动服务器...
    echo.
    echo 服务器地址: http://localhost:8000
    echo 按 Ctrl+C 停止服务器
    echo.
    python -m http.server 8000
    goto :end
)

REM 检查Node.js是否安装
node --version >nul 2>&1
if %errorlevel% == 0 (
    echo [√] 检测到Node.js，正在启动服务器...
    echo.
    
    REM 检查http-server是否安装
    where http-server >nul 2>&1
    if %errorlevel% == 0 (
        echo 服务器地址: http://localhost:8000
        echo 按 Ctrl+C 停止服务器
        echo.
        http-server -p 8000
    ) else (
        echo [!] 正在安装http-server...
        npm install -g http-server
        echo.
        echo 服务器地址: http://localhost:8000
        echo 按 Ctrl+C 停止服务器
        echo.
        http-server -p 8000
    )
    goto :end
)

REM 如果都没有安装
echo [×] 错误: 未检测到Python或Node.js
echo.
echo 请先安装以下任一工具:
echo   - Python 3.x: https://www.python.org/downloads/
echo   - Node.js: https://nodejs.org/
echo.
pause
goto :end

:end
