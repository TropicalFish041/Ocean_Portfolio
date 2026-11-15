@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Install Node.js from https://nodejs.org/ first.
  pause
  exit /b 1
)
call npm install
if errorlevel 1 (
  echo npm install failed. Please check your internet connection.
  pause
  exit /b 1
)
start "" "http://localhost:3000"
call npm run dev
pause
