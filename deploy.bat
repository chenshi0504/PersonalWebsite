@echo off
chcp 65001 >nul
echo ========================================
echo   Personal Website - Deploy to GitHub
echo ========================================
echo.

REM 切换到脚本所在目录
cd /d "%~dp0"

REM 检查git
git --version >nul 2>&1
if not %errorlevel% == 0 (
    echo [x] Git not found. Please install Git: https://git-scm.com/
    pause
    exit /b 1
)

REM 检查是否在git仓库中
git rev-parse --git-dir >nul 2>&1
if not %errorlevel% == 0 (
    echo [x] Not a git repository. Run "git init" first.
    pause
    exit /b 1
)

REM 显示当前状态
echo [*] Current status:
git status --short
echo.

REM 询问commit message
set /p MSG="Commit message (press Enter for default): "
if "%MSG%"=="" set MSG=Update website content

REM 执行git操作
echo.
echo [*] Adding all changes...
git add -A

echo [*] Committing: %MSG%
git commit -m "%MSG%"
if %errorlevel% == 0 (
    echo.
    echo [*] Pushing to GitHub...
    git push
    if %errorlevel% == 0 (
        echo.
        echo [√] Deploy successful!
        echo     Live at: https://chenshi0504.github.io/PersonalWebsite/
    ) else (
        echo [x] Push failed. Check your network or GitHub credentials.
    )
) else (
    echo [!] Nothing to commit, or commit failed.
)

echo.
pause
