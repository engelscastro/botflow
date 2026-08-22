@echo off
title BotFlow Studio PRO - Instalador de Dependencias
echo ====================================================
echo   BotFlow Studio PRO - Instalador de Dependencias
echo ====================================================
echo.
echo Verificando Node.js...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Node.js nao foi encontrado no sistema.
    echo Por favor, instale o Node.js em: https://nodejs.org/
    pause
    exit /b
)

echo.
echo Instalando todas as dependencias do package.json...
echo Isso pode levar alguns momentos.
echo.

call npm install

if %errorlevel% equ 0 (
    echo.
    echo ====================================================
    echo   [SUCESSO] Todas as dependencias foram instaladas!
    echo ====================================================
    echo.
    echo Comandos uteis:
    echo  - Iniciar servidor web: npm run dev
    echo  - Iniciar App Desktop (Electron): npm run electron:dev
    echo  - Gerar instalador Windows (.exe): npm run dist:win
    echo.
) else (
    echo.
    echo [ERRO] Ocorreu uma falha ao instalar as dependencias.
)

pause
