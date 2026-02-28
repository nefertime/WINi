@echo off
title WINi - Starting...
echo.
echo  ============================
echo   WINi Dev Launcher
echo  ============================
echo.

REM Check if port 3100 is already in use
netstat -ano | findstr :3100 | findstr LISTENING >nul 2>&1
if %errorlevel% equ 0 (
    echo   Port 3100 is already in use - WINi may already be running.
    echo   Opening browser anyway...
    start http://localhost:3100
    echo.
    pause
    exit /b
)

REM ── Step 1: Start Azure PostgreSQL ──────────────────────────────────────────
echo   [1/3] Starting Azure database...
powershell -NoProfile -Command "& 'C:\Program Files\Microsoft SDKs\Azure\CLI2\wbin\az.cmd' postgres flexible-server start --resource-group wini-dev-rg --name wini-dev-pg" >nul 2>&1
echo   Database start command sent.
echo.

REM ── Step 2: Wait for DB to come online ──────────────────────────────────────
echo   [2/3] Waiting 60 seconds for database to be ready...
for /l %%i in (60,-1,1) do (
    <nul set /p "=   %%i seconds remaining...   " & echo.
    timeout /t 1 /nobreak >nul
)
echo   Database should be ready.
echo.

REM ── Step 3: Start dev server ─────────────────────────────────────────────────
echo   [3/3] Starting Next.js dev server on port 3100...
start "WINi Dev Server" cmd /k "cd /d %~dp0.. && npm run dev"

timeout /t 5 /nobreak >nul
start http://localhost:3100

echo.
echo  ============================
echo   WINi is running!
echo   http://localhost:3100
echo  ============================
echo.
echo   Close the "WINi Dev Server" window when done.
echo.
echo   Then press any key HERE to stop the database.
echo   (Leaving it running costs ~0.40 EUR/day)
echo.
pause >nul

REM ── Stop database on exit ────────────────────────────────────────────────────
echo.
echo   Stopping Azure database...
powershell -NoProfile -Command "& 'C:\Program Files\Microsoft SDKs\Azure\CLI2\wbin\az.cmd' postgres flexible-server stop --resource-group wini-dev-rg --name wini-dev-pg" >nul 2>&1
echo   Database stopped. No charges while stopped.
echo.
timeout /t 3 /nobreak >nul
