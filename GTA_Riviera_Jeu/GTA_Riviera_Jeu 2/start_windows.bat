@echo off
cd /d "%~dp0"
where node >nul 2>&1
if errorlevel 1 (
 echo Node.js est necessaire. Installez la version LTS depuis https://nodejs.org/fr
 pause
 exit /b 1
)
start "GTA Riviera - navigateur" cmd /c "timeout /t 2 /nobreak >nul & start http://localhost:3000"
node server.js
pause
