@echo off
title Membangun Installer Aplikasi Absensi Guru BK...
cd /d "%~dp0"

echo ==========================================================
echo   PEMBUATAN INSTALLER DESKTOP WINDOWS (.EXE)
echo ==========================================================
echo.
echo Sedang memaketkan aplikasi ke berkas Windows Standalone (.exe)...
echo Harap tunggu beberapa saat...
echo.

set "PATH=C:\Program Files\nodejs;%PATH%"

if exist "node_modules\.bin\electron-builder.cmd" (
    call "node_modules\.bin\electron-builder.cmd" --win portable
) else (
    call npx -y electron-builder --win portable
)

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ==========================================================
    echo [SUKSES] Berkas aplikasi .exe berhasil dibuat di folder:
    echo   dist\
    echo.
    echo File .exe tersebut siap disalin ke flashdisk dan dijalankan
    echo di komputer manapun tanpa perlu instal software lain!
    echo ==========================================================
) else (
    echo.
    echo [CATATAN] Jika paket installer online gagal diunduh, Anda tetap
    echo dapat langsung menjalankan aplikasi melalui "Jalankan-Aplikasi-Desktop.bat".
)

pause
