@echo off
setlocal
cd /d "%~dp0"

echo ==========================================================
echo   APLIKASI ABSENSI SISWA BULANAN GURU BK MADRASAH/SEKOLAH
echo ==========================================================
echo Sedang menyiapkan dan membuka aplikasi desktop...
echo.

:: 1. PRIORITAS 1: Berkas Desktop Standalone Unpacked (Membuka Instan & Cepat)
if exist "dist\win-unpacked\absensi-guru-bk.exe" (
    echo [INFO] Membuka Aplikasi Desktop Absensi Guru BK...
    start "" "%~dp0dist\win-unpacked\absensi-guru-bk.exe"
    exit /b 0
)

:: 2. PRIORITAS 2: Berkas Desktop Portable Standalone (.exe)
if exist "dist\absensi-guru-bk 1.0.0.exe" (
    echo [INFO] Membuka Berkas Portable Standalone (.exe)...
    start "" "%~dp0dist\absensi-guru-bk 1.0.0.exe"
    exit /b 0
)

:: 3. PRIORITAS 3: Jalankan Engine Electron melalui Node.js jika ada
set "PATH=C:\Program Files\nodejs;C:\Program Files (x86)\nodejs;%LOCALAPPDATA%\Programs\nodejs;%PATH%"
set "NODE_BIN="
where node >nul 2>&1
if %ERRORLEVEL% EQU 0 set "NODE_BIN=node"
if not defined NODE_BIN (
    if exist "C:\Program Files\nodejs\node.exe" set "NODE_BIN=C:\Program Files\nodejs\node.exe"
)
if defined NODE_BIN (
    if exist "node_modules\electron\cli.js" (
        echo [INFO] Membuka via Engine Electron CLI...
        start "" "%NODE_BIN%" "%~dp0node_modules\electron\cli.js" "%~dp0."
        exit /b 0
    )
)

:: 4. PRIORITAS 4: Mode Windows Chromium Standalone (Microsoft Edge App Mode)
:: Bekerja 100% mandiri di semua Windows 10 & 11 tanpa instal apapun
set "EDGE_PATH="
if exist "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" (
    set "EDGE_PATH=C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
)
if not defined EDGE_PATH (
    if exist "C:\Program Files\Microsoft\Edge\Application\msedge.exe" (
        set "EDGE_PATH=C:\Program Files\Microsoft\Edge\Application\msedge.exe"
    )
)
if defined EDGE_PATH (
    echo [INFO] Membuka mode Desktop App Standalone...
    start "" "%EDGE_PATH%" --app="file:///%~dp0index.html" --window-size=1400,850
    exit /b 0
)

:: 5. PRIORITAS 5: Peramban Web Default
start "" "%~dp0index.html"
exit /b 0
