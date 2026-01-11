@echo off
echo Killing all Go processes...
taskkill /F /IM go.exe 2>nul
taskkill /F /IM main.exe 2>nul
timeout /t 2 /nobreak >nul
echo Starting server...
cd /d "%~dp0"
go run cmd/main.go
pause
