@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
    echo Node.js is required. Install the LTS version from https://nodejs.org/ and run this again.
    pause
    exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
    echo npm was not found. Reinstall Node.js LTS and make sure npm is added to PATH.
    pause
    exit /b 1
)

echo Installing Vetrix backend dependencies...
call npm install
if errorlevel 1 (
    echo Dependency installation failed.
    pause
    exit /b 1
)

if not exist .env copy .env.example .env >nul
echo.
echo Installation complete. Add your API and RPC values to backend\.env as needed.
echo BOT_PRIVATE_KEY is optional and should only be set for a dedicated test wallet.
pause