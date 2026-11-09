@echo off
rem Starts Resonance on Windows with nothing to install. See OKU-BENI.txt / README.md.
cd /d "%~dp0"
if not exist "%~dp0integrations\web\serve-windows.ps1" (
  echo.
  echo  Lutfen once zip dosyasini bir klasore cikarin: sag tik ^> Tumunu ayikla.
  echo  Please extract the zip first: right-click ^> Extract All. Then open this file again.
  echo.
  pause
  exit /b 1
)
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0integrations\web\serve-windows.ps1"
if errorlevel 1 pause
