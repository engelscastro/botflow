# 📦 Guia de Instalação e Execução - BotFlow Studio PRO

O **BotFlow Studio PRO** é uma plataforma completa que pode ser executada tanto como uma **aplicação web no navegador** quanto como um **aplicativo de desktop nativo (.exe)** com servidor integrado e conexão real com o WhatsApp Web.

---

## 💻 1. Pré-requisitos do Sistema
Antes de iniciar, certifique-se de ter instalado em seu computador:
- **Node.js**: Versão 18.x, 20.x ou superior ([Baixar Node.js](https://nodejs.org/)).
- **Git** (Opcional, para clonagem de repositório).
- Sistema Operacional: Windows 10/11, macOS ou Linux.

---

## ⚡ 2. Instalação Rápida de Dependências (1-Clique)

O arquivo **`package.json`** na raiz do projeto centraliza e gerencia todos os pacotes necessários:

### 🪟 No Windows:
1. Dê um duplo clique no arquivo **`instalar_dependencias.bat`** na raiz do projeto.
2. O script verificará a instalação do Node.js e executará o `npm install` automaticamente.

### 🐧 / 🍎 No Linux ou macOS:
1. Abra o terminal na pasta do projeto.
2. Dê permissão e execute:
   ```bash
   chmod +x instalar_dependencias.sh && ./instalar_dependencias.sh
   ```

### 💻 Ou via Terminal Manual:
```bash
npm install
```

Este comando baixa e instala automaticamente todos os módulos:
- **Frontend Moderno:** React 19, Vite, Lucide Icons, Motion, Recharts, Tailwind CSS v4.
- **Construtor de Fluxos:** `@xyflow/react`.
- **Motor WhatsApp Web & Servidor:** Express, `@whiskeysockets/baileys`, QRCode, Pino, Google GenAI.
- **Ambiente Desktop Nativo:** Electron, Electron Builder, Esbuild, Concurrently, TSX, TypeScript.

---

## 🚀 3. Modos de Execução da Aplicação

### 🌐 Modo A: Navegador Web (Recomendado para Desenvolvimento)
Para rodar a aplicação no seu navegador padrão:
```bash
npm run dev
```
Acesse no seu navegador: **`http://localhost:3000`**

---

### 🖥️ Modo B: Aplicativo Desktop (Electron + Servidor Integrado)
Para abrir o aplicativo como uma janela nativa com bandeja de sistema:
```bash
npm run electron:dev
```

---

### 📦 Modo C: Gerar Instalador Executável `.exe` para Windows
Para compilar o aplicativo e criar o instalador final do Windows:
```bash
npm run dist:win
```
> 📁 O arquivo instalador `.exe` será gerado automaticamente dentro da pasta **`dist-electron/`**.

---

## 📱 4. Conectando o WhatsApp Web
1. Abra a aplicação (Web ou Desktop) e vá em **Conexões & Canais ➔ WhatsApp Web**.
2. Clique no botão verde **"⚡ Iniciar & Gerar QR Code Real"**.
3. Abra o **WhatsApp no celular** ➔ Menu (3 pontos) ou Configurações ➔ **Aparelhos Conectados** ➔ **Conectar um Aparelho**.
4. Aponte a câmera para o QR Code na tela.
5. Pronto! Suas conversas reais sincronizarão no **Inbox** e o motor de respostas estará ativo.

---

## 📢 5. Utilizando os Disparos em Massa via CSV
1. Acesse o menu **Disparos em Massa** (ícone `CSV`).
2. Crie uma planilha com 2 colunas:
   - **Coluna 1:** `Nome` (ex: `João da Silva`)
   - **Coluna 2:** `Telefone` (ex: `82993530493` ou `+55 (82) 99353-0493`)
3. Salve como arquivo `.csv` e importe no painel.
4. Escreva a mensagem utilizando variáveis dinâmicas (`{{primeiro_nome}}`, `{{nome}}`, `{{saudacao}}`, `{{telefone}}`) e Spintax (`{Olá|Oi|Opa}`).
5. Configure os intervalos de segurança (ex: 6s a 14s) e clique em **"Iniciar Disparos"**.

---

## 🛠️ 6. Solução de Problemas Rápidos
- **Porta Ocupada (`EADDRINUSE`):** O sistema detecta e migra automaticamente para portas alternativas (`3001` a `3010`) sem intervenção do usuário.
- **Desconectar Linha do WhatsApp:** Clique em **"Desconectar Linha do WhatsApp"** na tela de canais para resetar a pasta de autenticação `baileys_auth_info`.
- **Logs do Sistema:** Acesse o botão **Logs** no topo da tela para visualizar erros e diagnósticos detalhados em tempo real.


