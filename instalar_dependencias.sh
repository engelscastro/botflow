#!/bin/bash
echo "===================================================="
echo "  BotFlow Studio PRO - Instalador de Dependências"
echo "===================================================="
echo ""

if ! command -v node &> /dev/null
then
    echo "[ERRO] Node.js não está instalado. Instale o Node.js em https://nodejs.org/"
    exit 1
fi

echo "Instalando todas as dependências do package.json..."
echo ""

npm install

if [ $? -eq 0 ]; then
    echo ""
    echo "===================================================="
    echo "  [SUCESSO] Todas as dependências foram instaladas!"
    echo "===================================================="
    echo ""
    echo "Comandos úteis:"
    echo " - Iniciar servidor web: npm run dev"
    echo " - Iniciar App Desktop (Electron): npm run electron:dev"
    echo " - Gerar executável Linux: npm run dist:linux"
    echo " - Gerar executável Mac: npm run dist:mac"
    echo ""
else
    echo "[ERRO] Ocorreu uma falha ao instalar as dependências."
fi
