@echo off
title WINi - Starting...
echo.
echo  ============================
echo   WINi - Wine Information
echo  ============================
echo.

REM Check if port 3100 is already in use
netstat -ano | findstr :3100 | findstr LISTENING >nul 2>&1
if %errorlevel% equ 0 (
    echo   Port 3100 is already in use!
    echo   WINi may already be running.
    echo.
    echo   Opening browser anyway...
    start http://localhost:3100
    echo.
    pause
    exit /b
)

echo   Starting Next.js dev server on port 3100...
echo.

REM Start the dev server in a new window
start "WINi Dev Server" cmd /k "cd /d %~dp0.. && npm run dev"

REM Wait for server to start
echo   Waiting for server to start...
timeout /t 5 /nobreak > nul

REM Open browser
echo   Opening browser...
start http://localhost:3100

echo.
echo   WINi is running at: http://localhost:3100
echo.
echo   Press any key to close this launcher window.
echo   (The server will keep running in its own window)
echo.
pause > nul
