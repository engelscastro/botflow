# 🚀 Documentação Técnica e Arquitetura - BotFlow Studio v2.5 PRO

---

## 📌 1. Visão Geral do Sistema

O **BotFlow Studio v2.5 PRO** é uma plataforma full-stack de alta performance desenvolvida para automação de conversas, criação de fluxos visuais de atendimento e integração de Inteligência Artificial híbrida (Modelos locais Llama/Ollama e modelos em nuvem Google Gemini).

A aplicação centraliza múltiplos canais de comunicação (WhatsApp Web, Telegram, Instagram Direct e Web Chat) em um painel unificado em tempo real, permitindo transição suave entre atendimento automatizado por robôs de IA e intervenção humana.

---

## 📐 2. Arquitetura do Sistema

A arquitetura do **BotFlow Studio** foi concebida seguindo o modelo **Full-Stack desacoplado com Proxy Backend seguro**, garantindo a proteção de chaves de API e isolamento do cliente de execuções de IA pesadas.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          NAVEGADOR / CLIENT (SPA)                           │
│  React 19 + TypeScript + Vite + Tailwind CSS v4 + @xyflow/react + Recharts  │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTP / REST API (Porta 3000)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          SERVIDOREXPRESS (Node.js)                          │
│     - Express Router / Middleware                                           │
│     - Proxy de Inteligência Artificial (AI Engine Manager)                   │
│     - Simulação & Integração de Webhooks (WhatsApp / Telegram / Instagram)   │
│     - Servidor Estático de Produção (esbuild CJS Output)                   │
└──────────────────┬──────────────────────────────────────┬───────────────────┘
                   │                                      │
                   ▼                                      ▼
┌──────────────────────────────────────┐┌─────────────────────────────────────┐
│    LOCAL / OLLAMA LLAMA ENGINE       ││      GOOGLE GEMINI API NUVEM        │
│  - Llama 3.2 3B Instruct             ││  - Gemini 2.5 Flash                │
│  - Llama 3.1 8B                      ││  - RAG Context Injection            │
│  - Mistral 7B                        ││  - Server-Side Key Masking          │
└──────────────────────────────────────┘└─────────────────────────────────────┘
```

### 🧩 Destaques da Arquitetura:
* **Frontend Single Page Application (SPA):** Construído com React 19 e Vite, otimizado para renderização ultrarrápida com estado centralizado e componentes reutilizáveis modularizados.
* **Backend Express em Node.js:** Servidor configurado para manipular solicitações REST, fornecer fallback para desenvolvimento em modo Vite Middleware e servir artefatos compilados no ambiente de produção através do estático `dist/server.cjs`.
* **Motor Graph Canvas (@xyflow/react):** Integração avançada de nós interativos para criação de fluxos visuais no padrão de diagramas direcionados (DAGs) com suporte a exportação, importação de esquemas JSON e edição direta do nome do fluxo.
* **Proxy RAG & IA Flexível:** Abstração no servidor (`/api/ai/generate`) capaz de alternar dinamicamente entre servidores locais Ollama/Llama e a API do Gemini.
* **Motor WhatsApp Baileys Otimizado (`/server/whatsappService.ts`):** Resolução dinâmica de JIDs via `onWhatsApp` (garantindo compatibilidade com números brasileiros de 8/9 dígitos), tratamento seguro de timestamps de mensagens e envio de mensagens sem latência ou travamentos de fila.

---

## 🛠️ 3. Módulos e Funcionalidades

### 1. 🎨 Construtor de Fluxos Visuais (Flow Builder)
* **Canvas Interativo:** Arraste, solte e conecte os 9 nós do catálogo para montar árvores de decisão e jornadas de automação.
* **Gerenciamento de Fluxos:** Criação de novos fluxos, renomeação instantânea do fluxo ativo (botão de lápis com atalho Enter/Esc) e alternância rápida pelo seletor de canais.
* **Importação e Exportação JSON:** Suporte a download de backups do fluxo em JSON e botão de **Importar** para carregar arquivos de fluxos criados previamente.
* **Catálogo dos 9 Nós do Construtor:**
  1. `1. Gatilho / Início` (`triggerNode`): Início por palavras-chave ou primeiro contato.
  2. `2. Mensagem do Bot` (`messageNode`): Envio de mensagens de texto formatadas com suporte a respostas rápidas e variáveis `{{nome}}`.
  3. `3. Pergunta & Captura` (`questionNode`): Captura de respostas e salvamento em variáveis validadas.
  4. `4. Agente IA (Llama / Gemini)` (`aiNode`): Execução contextual de IA com suporte opcional à Base de Conhecimento RAG. *(Acionamento estrito: a IA e a Base de Conhecimento só respondem quando este bloco estiver explicitamente conectado no fluxo).*
  5. `5. Condição / Se-Senão` (`conditionNode`): Ramificação lógica baseada em variáveis e dados do cliente.
  6. `6. Pausa / Digitando...` (`delayNode`): Atraso humanizado simulando digitação no WhatsApp.
  7. `7. Webhook / API` (`webhookNode`): Integração HTTP REST com serviços externos.
  8. `8. Transf. Atendente` (`handoverNode`): Transfere a conversa para atendimento humano no Inbox e pausa o robô.
  9. `9. Etiqueta / Tag` (`tagNode`): Atribuição e remoção de tags do contato e avanço de estágio no CRM.
* **Recursos do Canvas:** Zoom intuitivo, controles de desfazer/refazer integrados ao canvas (Ctrl+Z / Ctrl+Y), mini-mapa, simulação de execução de fluxo em tempo real.

### 2. 📥 Atendimento Unificado / Painel de Inbox (Central Inbox)
* **Hub Multi-Canal Limpo e Real-Time:** Estado inicial pronto para produção sem contatos fictícios/simulados. As conversas reais do WhatsApp Web conectado são populadas e atualizadas instantaneamente conforme o envio e recebimento de mensagens.
* **Filtros e Busca em Tempo Real:** Filtragem por palavra-chave, número de telefone, tags ou canal ativo.
* **Pausa e Retomada do Bot:** Botão instantâneo para pausar a IA e assumir a conversa como **Atendente Humano** com aviso visual diferenciado no chat.
* **Painel Lateral do Cliente (CRM Lite):**
  * Detecção automática de **Sentimento do Cliente** (Positivo, Urgente, Neutro).
  * Exibição e edição das **Variáveis Coletadas no Fluxo** (ex: `{nome}`, `{plano}`, `{email}`).
  * Gerenciamento de **Etiqueta/Tags** e **Etapa do Funil CRM**.

### 3. 📢 Motor de Disparos em Massa via CSV (Broadcast Engine)
* **Importação & Normalização CSV (`/src/utils/broadcastUtils.ts`):**
  * Auto-detecção de delimitadores (`;`, `,`, `\t`, `|`).
  * Tratamento de cabeçalhos e aspas duplas.
  * Normalização telefônica para o padrão E.164 (inclusão automática do DDI 55 para números brasileiros de 10 e 11 dígitos, sanitização de caracteres não numéricos).
* **Variáveis Dinâmicas & Spintax:**
  * Interpolação de `{{primeiro_nome}}`, `{{nome}}`, `{{saudacao}}`, `{{telefone}}`.
  * Parser de **Spintax Anti-Bloqueio** (`{Olá|Oi|Opa}`) para alternância algorítmica de palavras entre contatos.
* **Sistema Anti-Bloqueio & Humanização:**
  * Delays configuráveis com *jitter* aleatório (ex: 6s a 14s) entre mensagens.
  * Simulação de status `"composing"` (digitando...) via socket Baileys antes da entrega.
* **Múltiplos Canais de Envio:** Suporte híbrido a disparo via WhatsApp e Gateway SMS.
* **Simulador de Prévia em Tempo Real:** Renderização fiel da bolha de mensagem no mockup do WhatsApp antes do disparo.
* **Relatório de Auditoria:** Exportação de relatório detalhado pós-disparo em `.csv` com status de entrega e timestamps.

### 4. 🌐 Central de Canais & Conexões (Channels Manager)
* **WhatsApp Web (Baileys/Puppeteer Sync):**
  * Sincronização via leitura de **QR Code em tempo real**.
  * Monitoramento de status da sessão, número do aparelho conectado e nível de bateria do celular.
  * Opções para simulação do efeito "digitando..." durante gerações de IA.
* **Gateway SMS (Android Local & Twilio):**
  * Suporte a envio de SMS Nativo global usando a API da **Twilio**.
  * Integração híbrida de Gateway via Wi-Fi local com aplicativos como **Simple SMS Gateway** (disparo através do chip do celular sem taxas por mensagem usando POST no IP do aparelho, suportado com *no-cors* no browser ou nativamente no Electron).
* **Telegram Bot API:**
  * Campo para validação e salvamento do Token HTTP da API (BotFather).
  * Lista de comandos nativos do menu Telegram (`/start`, `/ajuda`, `/atendimento`).
* **Instagram Direct (Meta Graph API):**
  * Respostas automáticas para menções em Stories e mensagens diretas.
  * Suporte a botões de resposta rápida (Quick Reply).
* **Widget Web Chat Flutuante:**
  * Gerador de código Script embedável (`<script src="...">`) para inclusão em qualquer site externo.

### 5. 🧠 Motor de IA & Base de Conhecimento (RAG Engine)
* **Provedores de IA Suportados:**
  * **IA Local Privada (Llama / Ollama):** Llama 3.2 3B Instruct, Llama 3.1 8B e Mistral 7B. Privacidade total sem custo por token.
  * **Google Gemini Cloud:** Gemini 2.5 Flash via proxy server-side com tempo de resposta ultrarrápido.
* **Controles do Modelo:**
  * Ajuste de Temperatura (Criatividade) via slider visual (0.0 a 1.0).
  * Editor de Instruções de Personalidade (System Prompt).
  * **Playground de Testes de IA:** Ambiente de depuração interno para testar perguntas e verificar as respostas geradas pela IA em tempo real.
* **Base de Conhecimento RAG (Retrieval-Augmented Generation):**
  * Cadastro de artigos, FAQs e manuais da empresa divididos por categorias.
  * Contagem estimada de tokens por documento.
  * Injeção dinâmica de contexto relevante ao prompt da IA antes de responder ao cliente.

### 6. 📊 Relatórios & Analytics (Analytics Dashboard)
* **KPIs Globais:** Total de Contatos, Bots Ativos, Taxa de Conversão no Funil e Tempo Médio de Resposta.
* **Gráficos Interativos (Recharts):**
  * Volume de mensagens diárias agrupadas por canal (Linhas/Áreas).
  * Distribuição percentual de conversas por canal (Gráfico de Pizza/Donut).
* **Métricas Principais:** Lista de gatilhos/intenções mais acionados e relatório de eficiência do bot vs. atendimento humano.

---


### 3.8. CRM & Contatos (`CRMManager`)
*   **Gestão de Leads:** Módulo para visualização de todos os contatos salvos no banco de dados.
*   **Filtros:** Busca inteligente por nome, telefone e listagem de data de cadastro.
*   **Integração com Fluxo:** Leads são criados automaticamente a partir do bloco "Cadastro CRM DB" durante as interações do robô.

### 3.9. Agenda & Reservas (`ScheduleManager`)
*   **Visualização de Compromissos:** Painel visual com os compromissos agendados pelo robô.
*   **Status do Agendamento:** Identificação de status (Agendado, Concluído, Cancelado).
*   **Integração com Fluxo:** Alimentado de forma automática via o bloco "Agendamento Interno".

## 📂 4. Estrutura do Projeto

```
/
├── server.ts                 # Ponto de entrada do servidor backend Express com proxy Gemini/Llama
├── index.html                # Ponto de entrada HTML do aplicativo Vite
├── package.json              # Dependências do projeto, scripts Electron e electron-builder
├── vite.config.ts            # Configurações de build do Vite e Tailwind CSS
├── tsconfig.json             # Configuração do TypeScript
├── DOCUMENTACAO_TECNICA.md   # Documentação técnica completa e arquitetura (este arquivo)
├── MANUAL_DO_USUARIO.md      # Manual do usuário com passo a passo ilustrado
├── INSTRUCOES_INSTALACAO.md  # Instruções detalhadas de instalação e build
│
├── electron/                 # Processos nativos do Electron para Desktop
│   ├── main.cjs              # Processo principal (BrowserWindow, servidor Express fork, IPC, bandeja)
│   └── preload.cjs           # ContextBridge seguro para IPC entre Electron e React
│
├── server/                   # Serviços do Servidor Node.js
│   └── whatsappService.ts    # Motor @whiskeysockets/baileys (WebSockets WhatsApp, QR Code real, envio/auto-resposta)
│
└── src/
    ├── main.tsx              # Inicialização do React 19
    ├── App.tsx               # Componente raiz e gerenciador de abas de navegação
    ├── index.css             # Estilos globais Tailwind v4 (Design Dark Moderno)
    │
    ├── types/                # Interfaces e tipos TypeScript compartilhados
    │   └── index.ts          # Definição de interfaces (FlowNode, Contact, Channel, BroadcastContact, etc.)
    │
    ├── data/                 # Dados de demonstração e valores padrão
    │   └── mockData.ts       # Mocks para fluxos, conversas, estatísticas e canais
    │
    ├── utils/                # Utilitários e helpers de execução
    │   ├── broadcastUtils.ts # Parser CSV, normalizador telefônico, parser Spintax e exportador
    │   ├── flowExecutor.ts   # Interpretador de nós do fluxo em tempo real
    │   └── analyticsHelper.ts# Agregação de métricas
    │
    └── components/           # Componentes visuais da aplicação
        ├── Header.tsx        # Barra superior com status da sessão e badge Desktop Nativo
        ├── Sidebar.tsx       # Menu lateral de navegação principal (com aba Disparos em Massa)
        ├── Broadcast/        # Módulo de Disparos em Massa via CSV e anti-bloqueio
        │   └── BroadcastManager.tsx
        ├── FlowBuilder/      # Construtor visual de fluxos interativos (React Flow)
        │   └── VisualFlowBuilder.tsx
        ├── Inbox/            # Central unificada de atendimento ao vivo
        │   └── CentralInbox.tsx
        ├── Channels/         # Gerenciador de conexões WhatsApp (Baileys real), Telegram, Instagram
        │   └── ChannelsManager.tsx
        ├── AIEngine/         # Configurações da IA Llama/Gemini e playground de testes
        │   └── AIEngineConfig.tsx
        ├── KnowledgeBase/    # Gestor da Base de Conhecimento RAG
        │   └── KnowledgeBaseManager.tsx
        └── Analytics/        # Painel de métricas e gráficos Recharts
            └── AnalyticsDashboard.tsx
```

---

## 📡 5. Contratos de API Backend (`server.ts` & `server/whatsappService.ts`)

### `GET /api/health`
Retorna o estado de funcionamento do servidor Express.
* **Resposta:** `{ "status": "ok", "timestamp": "2026-08-13T17:15:45.000Z" }`

### `POST /api/ai/generate`
Proxy seguro para geração de texto por IA (Gemini ou Fallback Llama Local).
* **Corpo da Requisição:**
  ```json
  {
    "prompt": "Qual o horário de funcionamento?",
    "systemPrompt": "Você é um assistente atencioso da loja X.",
    "provider": "gemini",
    "knowledgeContext": "Horário: Segunda a Sexta das 8h às 18h."
  }
  ```
* **Resposta:**
  ```json
  {
    "text": "Nosso horário de funcionamento é de Segunda a Sexta, das 8h às 18h!",
    "provider": "gemini",
    "model": "gemini-2.5-flash"
  }
  ```

### `GET /api/whatsapp/status`
Retorna o estado em tempo real da sessão Baileys (status, QR Code em base64/DataURL, número conectado, logs).
* **Resposta:**
  ```json
  {
    "status": "CONNECTING | CONNECTED | DISCONNECTED",
    "qrDataUrl": "data:image/png;base64,...",
    "phoneNumber": "+5511998821000",
    "pushName": "BotFlow Business",
    "battery": 98,
    "lastLogs": ["..."]
  }
  ```

### `POST /api/whatsapp/start`
Inicia o socket Baileys com os servidores do WhatsApp para emissão do QR Code real.

### `POST /api/whatsapp/disconnect`
Encerra a sessão ativa do Baileys e limpa os arquivos de autenticação em `baileys_auth_info`.

### `POST /api/whatsapp/send`
Envia uma mensagem de texto via WhatsApp para um número especificado (atendimento manual no Inbox ou disparos em massa).
* **Corpo da Requisição:**
  ```json
  {
    "to": "5582993530493",
    "text": "Olá João, tudo bem?",
    "name": "João da Silva"
  }
  ```
* **Resposta:** `{ "success": true }`

### `POST /api/webhook/telegram`
Endpoint simulado para recepção de mensagens do Telegram Bot API.

---

## 💻 6. Guia de Instalação e Execução

### Pré-requisitos
* Node.js v18+ ou v20+
* NPM ou Bun

### Passos de Instalação e Inicialização

1. **Clonar e instalar dependências:**
   ```bash
   npm install
   ```

2. **Configuração de Variáveis de Ambiente (`.env`):**
   Crie ou edite o arquivo `.env` na raiz do projeto:
   ```env
   GEMINI_API_KEY=sua_chave_aqui
   NODE_ENV=development
   ```

3. **Execução em Modo Desenvolvimento:**
   ```bash
   npm run dev
   ```
   A aplicação estará acessível em `http://localhost:3000`.

4. **Compilação para Produção:**
   ```bash
   npm run build
   ```
   Gera os artefatos estáticos em `dist/` e o servidor empacotado em `dist/server.cjs`.

5. **Inicialização em Produção:**
   ```bash
   npm run start
   ```

---

## 🔒 7. Segurança e Melhores Práticas

1. **Ocultação de Secrets:** As chaves da API do Gemini e tokens de canais nunca são expostos ao cliente web/browser; todo o processamento é feito server-side no backend Express.
2. **Inicialização Preguiçosa (Lazy Load) de SDKs:** As instâncias de clientes de IA só são inicializadas mediante requisições, prevenindo crashes no boot em ambientes sem chave configurada.
3. **Resiliência e Fallback:** Se a API em nuvem falhar ou estiver sem chave, o sistema aciona automaticamente o simulador do motor Llama 3.2 local para manter a continuidade do atendimento.
4. **Sem Uso de Window Alerts:** Uso de modais e componentes nativos React para diálogo com o usuário, mantendo compatibilidade total com iFrames e Cloud Run.

---

## 🖥️ 8. Compilação e Empacotamento Desktop Nativo (Electron)

O **BotFlow Studio PRO** conta com suporte nativo para ser empacotado como um **aplicativo de desktop para Windows (.exe), macOS (.dmg) e Linux (.AppImage)** utilizando **Electron**.

### 🏗️ Como Funciona o Modo Desktop Nativo:
1. **Subprocesso do Backend:** O processo principal do Electron (`electron/main.cjs`) inicializa o servidor Express estático em background na máquina do usuário.
2. **Janela Nativa:** Abre uma instância `BrowserWindow` segura conectada diretamente ao servidor local com barra de menus personalizada, ícone de bandeja (tray) e notificações do sistema operacional.
3. **Segurança IPC:** Comunicação isolada via `contextBridge` em `electron/preload.cjs` protegendo chamadas de sistema.

### 📦 Passo a Passo para Instalar e Compilar no seu PC:

1. **Instalar as Dependências (Obrigatório antes do 1º uso):**
   ```bash
   npm install
   ```

2. **Testar em Modo Desenvolvimento Desktop (Electron + Server):**
   ```bash
   npm run electron:dev
   ```

3. **Gerar Instalador Executável para Windows (`.exe` em `dist-electron/`):**
   ```bash
   npm run dist:win
   ```
   *O arquivo `.exe` será gerado dentro da pasta **`dist-electron/`**.*

4. **Gerar Imagem Instalável para macOS (`.dmg`):**
   ```bash
   npm run dist:mac
   ```

5. **Gerar Pacote para Linux (`.AppImage` / `.deb`):**
   ```bash
   npm run dist:linux
   ```

---

## 📱 9. Integração Real do WhatsApp Web via Motor `@whiskeysockets/baileys`

O **BotFlow Studio PRO** conta com a biblioteca `@whiskeysockets/baileys` e `qrcode` integradas diretamente no servidor Express (`/server/whatsappService.ts`).

### ⚡ Como conectar o seu WhatsApp Real no aplicativo:
1. Abra o aplicativo (Desktop ou Web) e navegue até **Conexões & Canais ➔ WhatsApp Web**.
2. Clique no botão verde **"⚡ Iniciar & Gerar QR Code Real"**.
3. O servidor Node.js iniciará o socket WebSocket seguro com a infraestrutura do WhatsApp Web e renderizará o **QR Code legítimo em tempo real**.
4. No aplicativo WhatsApp do seu celular, vá em **Menu (3 pontos) / Configurações ➔ Aparelhos Conectados ➔ Conectar um Aparelho**.
5. Aponte a câmera do seu celular para o QR Code na tela do computador.
6. A sessão será autenticada, salvando as chaves de criptografia na pasta local `/baileys_auth_info` e exibindo seu número conectado com respostas automáticas ativas via Gemini / Llama!

---
*BotFlow Studio v2.5 PRO — Desenvolvido com React 19, Vite, TypeScript, Express, Tailwind CSS, Electron Native & Inteligência Artificial.*

