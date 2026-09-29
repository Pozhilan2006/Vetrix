@echo off
setlocal
cd /d "%~dp0"

if not exist node_modules (
    echo Dependencies are missing. Run install.bat first.
    pause
    exit /b 1
)

call npm start
pause