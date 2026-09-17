# 📘 Manual do Usuário — BotFlow Studio v2.5 PRO

Bem-vindo ao **Manual do Usuário do BotFlow Studio PRO**! Este guia foi elaborado para orientar você passo a passo na utilização de todas as ferramentas de automação, conexão do WhatsApp Web em tempo real, Inbox centralizado de atendimento e Inteligência Artificial.

---

## 🚀 1. Visão Geral da Plataforma

O **BotFlow Studio PRO** é uma plataforma profissional de automação multicanal com Inteligência Artificial integrada.

### Principais Recursos:
- **🟢 Conexão WhatsApp Web Real (Baileys Node.js):** Conexão direta via QR Code sem necessidade de APIs pagas da Meta.
- **📥 Inbox Centralizado:** Recebimento e envio de mensagens em tempo real com sincronização automática das conversas dos seus clientes.
- **⚡ Construtor Visual de Fluxos (React Flow):** Criação de chatbots drag-and-drop com nós de mensagem, condicionais, menus interativos, Webhooks e integração com IA.
- **🧠 Motor de IA (Gemini & Llama):** Respostas inteligentes automatizadas com contexto de negócio.
- **📚 Base de Conhecimento RAG:** Upload de manuais, PDFs e documentos para a IA responder com precisão sobre seus produtos e serviços.
- **📊 Analytics & Engajamento:** Métricas em tempo real de contatos, conversões e taxa de retenção.

---

## 📱 2. Como Conectar seu WhatsApp Web em Tempo Real

Siga os passos abaixo para conectar o WhatsApp do seu celular ao BotFlow Studio:

### Passo 1: Acessar a Tela de Conexões
1. No menu lateral esquerdo, clique em **Conexões & Canais**.
2. Certifique-se de que a aba **WhatsApp Web** está selecionada.

### Passo 2: Gerar o QR Code Real
1. Clique no botão verde **"⚡ Iniciar & Gerar QR Code Real"**.
2. O servidor iniciará a conexão via socket seguro e exibirá o QR Code gerado em tempo real na tela.

### Passo 3: Escanear com o Aplicativo WhatsApp do Celular
1. Abra o aplicativo **WhatsApp** no seu aparelho celular.
2. Acesse o menu de opções:
   - **Android:** Toque nos 3 pontinhos no canto superior direito ➔ **Aparelhos Conectados**.
   - **iPhone:** Toque em **Configurações** no canto inferior direito ➔ **Aparelhos Conectados**.
3. Toque no botão **Conectar um Aparelho**.
4. Aponta a câmera do celular para o QR Code exibido na tela do computador.
5. Aguarde 2 a 3 segundos até que o status mude para **"Sincronizado & Respostas IA Ativas"** com uma borda verde.

> 💡 **Dica de Segurança:** As credenciais de sessão são salvas localmente de forma criptografada na pasta `baileys_auth_info`. Para desconectar a linha a qualquer momento, basta clicar no botão vermelho **"Desconectar Linha do WhatsApp"**.

---

## 💬 3. Atendimento e Inbox Centralizado

Todas as mensagens enviadas pelos seus clientes no WhatsApp conectado chegam instantaneamente no **Inbox Centralizado**.

### Recursos do Inbox:
1. **Painel Limpo e Sincronizado:** O sistema inicia limpo, sem usuários fictícios ou de teste. Cada cliente real que envia mensagem pelo WhatsApp conectado aparece automaticamente.
2. **Listagem Automática de Conversas:** Quando um novo contato envia uma mensagem no seu WhatsApp, ele é cadastrado automaticamente com nome, número e foto na barra lateral do Inbox.
3. **Visualização e Envio em Tempo Real:** A mensagem do cliente e a resposta gerada pelo Robô/IA aparecem no chat em tempo real. Respostas de atendentes são entregues de forma imediata ao celular do cliente.
4. **Intervenção de Atendente Humano:**
   - Na caixa de texto inferior, você pode digitar uma resposta manual para o cliente.
   - Clique em **Enviar (Enter)**: a mensagem será enviada direto para o WhatsApp do celular do cliente.
5. **Desativar/Ativar Bot para um Contato Específico:**
   - Caso deseje assumir o atendimento e pausar as respostas automáticas da IA para determinado cliente, utilize o botão de alternância **Modo Bot** no cabeçalho da conversa.

---

## 📢 4. Disparos em Massa via CSV (WhatsApp & SMS)

O **BotFlow Studio PRO** conta com um motor completo de **Disparos em Massa** a partir de arquivos `.csv`, `.txt` ou listas coladas diretamente no painel. O disparo agora é híbrido e suporta tanto o WhatsApp quanto o Envio Nativo de SMS via IP Local ou Twilio.

### 📱 4.1. Configuração do Gateway de SMS (Chip Local)
O BotFlow permite disparar milhares de SMS sem pagar taxas externas (como Twilio/Zenvia) usando o seu próprio celular Android como servidor local na rede Wi-Fi!

**Como configurar o Android SMS Gateway:**
1. Instale o aplicativo **Simple SMS Gateway** (ou *Android SMS Gateway* do capcom6) no seu celular Android.
2. Conecte o celular na **mesma rede Wi-Fi** do computador que está rodando o BotFlow.
3. Inicie o servidor no aplicativo do celular para receber um número de IP (Ex: `http://192.168.15.12:8080/send-sms`).
4. No BotFlow, acesse **Conexões & Canais > Gateway SMS > App Android (Chip Local)** e cole a URL fornecida pelo seu celular.
5. Em **Disparos em Massa**, mude o "Canal de Disparo" no topo da tela de WhatsApp para **Twilio SMS** (que engloba o gateway local).

> 💡 **Diferenças de Plataforma:** Se você utilizar o BotFlow através da versão **Desktop App (Electron)**, a comunicação local funcionará sem bloqueios. Se acessar pelo **Navegador (Google Chrome)**, será necessário clicar no cadeado da barra de endereço e mudar a permissão de "Conteúdo Inseguro" para "Permitir", para evitar bloqueios de *Mixed Content*.

### 📋 Formato Exigido do Arquivo CSV:
O arquivo CSV deve conter **2 colunas**:
1. **Coluna 1 (Nome):** Nome do contato ou cliente (ex: `João da Silva`, `Maria Santos`).
2. **Coluna 2 (Telefone):** Número do celular com DDD (ex: `82993530493`, `11988887777`, ou com código do país `+55 (82) 99353-0493`).

> 💡 **Detecção Inteligente:** O sistema detecta automaticamente o delimitador (ponto e vírgula `;`, vírgula `,` ou tabulação `\t`), identifica se a primeira linha é cabeçalho e normaliza números brasileiros adicionando o DDI `55` automaticamente quando necessário.

#### Exemplo de conteúdo do arquivo `.csv`:
```csv
Nome;Telefone
João da Silva;82993530493
Maria Santos;11987654321
Carlos Eduardo Oliveira;21998765432
Ana Paula Souza;31988776655
Lucas Fernandes;41991234567
```

---

### 🚀 Passo a Passo para Realizar os Disparos em Massa:

1. **Acessar a aba "Disparos em Massa":**
   - No menu lateral esquerdo, clique no botão **Disparos em Massa** (ícone com badge `CSV`).
2. **Importar seus Contatos:**
   - **Opção A (Arquivo CSV):** Arraste o arquivo `.csv` diretamente para a área pontilhada ou clique em **"Selecionar Arquivo .CSV"**.
   - **Opção B (Colar Texto):** Clique em **"Colar Texto"** para colar linhas copiadas de uma planilha do Excel ou bloco de notas.
   - **Opção C (+ Contato):** Clique em **"+ Contato"** para adicionar números individualmente.
   - **Opção D (Modelo):** Clique em **"Modelo CSV"** para baixar um arquivo de exemplo pré-formatado.
3. **Personalizar a Mensagem com Variáveis Dinâmicas & Spintax:**
   - Clique nos botões de tags para inseri-las diretamente no texto:
     - `{{primeiro_nome}}` — Extrai apenas o primeiro nome do cliente (ex: *João*).
     - `{{nome}}` — Insere o nome completo cadastrado.
     - `{{saudacao}}` — Insere automaticamente *Bom dia*, *Boa tarde* ou *Boa noite* conforme o horário local do envio.
     - `{{telefone}}` — Insere o número de telefone formatado do cliente.
     - `{Olá|Oi|Opa}` — **Spintax Anti-Bloqueio:** Varia as palavras e saudações a cada contato enviado para humanizar os disparos e evitar padrões repetitivos.
4. **Verificar a Prévia no Simulador do WhatsApp:**
   - O simulador de celular no canto direito renderiza em tempo real como a mensagem chegará no WhatsApp do cliente selecionado na tabela.
5. **Configurar a Proteção Anti-Bloqueio & Humanização:**
   - **Intervalo Mínimo e Máximo (segundos):** Defina o tempo de espera aleatório entre cada envio (ex: entre 6s e 14s) com *jitter* de digitação para proteger seu número contra bloqueios da operadora.
   - **Simular Digitação:** Ativa o status de *"digitando..."* no WhatsApp do destinatário antes do envio.
6. **Controle de Disparos & Relatório:**
   - Clique em **"Iniciar Disparos"**.
   - Acompanhe a barra de progresso em tempo real, status de cada envio, contagem de enviados e falhas.
   - Você pode **Pausar**, **Retomar** ou **Cancelar** a qualquer momento.
   - Ao final, clique em **"Exportar Relatório"** para salvar uma planilha CSV com o histórico de envio, horário exato de entrega e logs.

---

## 🤖 5. Automação e Respostas da Inteligência Artificial

O BotFlow responde os contatos do WhatsApp de duas formas:

### 1. Resposta Automática Inteligente (IA Gemini / Llama)
- Quando o robô está ativo e um cliente envia uma dúvida, o servidor consulta a IA configurada.
- O robô simula o indicador de *"Digitando..."* no WhatsApp do cliente por 1 segundo antes de enviar a resposta.

### 2. Configurando o Motor de IA
1. No menu lateral, acesse **Motor IA & Llama**.
2. Escolha entre o modelo **Gemini 2.5 Flash (Nuvem)** ou **Llama 3.2 (Local)**.
3. Configure o **Prompt do Sistema** para definir a personalidade e o tom de voz do atendente (ex: *"Você é um atendente atencioso da clínica de odontologia..."*).

### 3. Base de Conhecimento (RAG)
1. Acesse **Base Conhecimento RAG** no menu lateral.
2. Adicione tópicos, manuais de produtos, FAQs e políticas da sua empresa.
3. A IA utilizará estas informações oficiais para responder às perguntas dos clientes no WhatsApp com 100% de exatidão.

---

## 🛠️ 6. Construtor Visual de Fluxos & Guia Completo dos Blocos de Automação

O **Construtor de Fluxos (Flow Builder)** permite criar árvores de atendimento automatizadas arrastando e conectando blocos funcionais (nós). Cada bloco executa uma ação específica quando a conversa atinge aquele ponto.

### 🎨 6.0 Recursos de Gerenciamento do Construtor
- **Renomear Fluxo:** Clique no botão de lápis ao lado do seletor de fluxo para editar o nome do fluxo em tempo real. Pressione **Enter** ou clique no check verde para salvar.
- **Importar Fluxo JSON:** Clique no botão **"Importar"** na barra superior para carregar um arquivo `.json` de fluxo salvo anteriormente.
- **Exportar Fluxo JSON:** Clique em **"Exportar"** para baixar um arquivo de backup do seu fluxo de automação.
- **Controles de Desfazer/Refazer:** Disponíveis diretamente na barra de ferramentas do canvas visual de arrastar e soltar.

---

### 🧩 6.1 Visão Geral dos 9 Blocos de Automação

| Bloco no Painel | Tipo Interno | Função Principal | Exemplo de Uso |
| :--- | :--- | :--- | :--- |
| **1. Gatilho / Início** | `triggerNode` | Inicia o fluxo com base em palavras-chave ou primeiro contato | Cliente digita `preço`, `ajuda` ou envia a 1ª mensagem |
| **2. Mensagem do Bot** | `messageNode` | Envia texto, mídia ou opções de resposta ao cliente | *"Olá! Como posso te ajudar hoje?"* |
| **3. Pergunta & Captura** | `questionNode` | Faz uma pergunta e valida/salva a resposta em variável | Captura o e-mail, nome ou CPF do cliente |
| **4. Agente IA (Llama / Gemini)** | `aiNode` | Processa perguntas via Gemini ou Llama Local com **RAG** | Tira dúvidas consultando a **Base de Conhecimento** |
| **5. Condição / Se-Senão** | `conditionNode` | Cria ramificações lógicas baseadas em regras e variáveis | Se `plano == 'PRO'`, segue para fila prioritária |
| **6. Pausa / Digitando...** | `delayNode` | Aguarda X segundos simulando o status *"digitando..."* | Pausa 3 segundos antes de responder |
| **7. Webhook / API** | `webhookNode` | Integração HTTP com CRMs, Hotmart, Zapier, n8n | Envia o lead cadastrado para seu sistema externo |
| **8. Transf. Atendente** | `handoverNode` | Transfere a conversa para a fila de atendimento humano | Redireciona para o setor **Vendas** ou **Suporte** |
| **9. Etiqueta / Tag** | `tagNode` | Aplica tags ou altera o estágio do cliente no funil | Marca o contato como `Lead Qualificado` ou `Cliente VIP` |

---

### 🔍 6.2 Detalhamento de Cada Bloco e Suas Configurações

#### 1. ⚡ Bloco 1: Gatilho / Início (`triggerNode`)
O nó de **Gatilho** é a porta de entrada do fluxo.
- **Palavras-chave:** Digite as palavras que disparam o fluxo (separadas por vírgula) ou deixe como gatilho padrão de saudação (`oi`, `olá`, `menu`, etc.).

#### 2. 💬 Bloco 2: Mensagem do Bot (`messageNode`)
Envia mensagens de texto fixas com suporte a variáveis dinâmicas e botões de resposta rápida.
- **Interpolação de Variáveis:** Ex: *"Olá {{nome}}! Seu cadastro foi recebido com sucesso."*
- **Respostas Rápidas (Quick Replies):** Adicione botões/opções numeradas (ex: `1. Falar com Atendente`, `2. Conhecer Planos`).

#### 3. ❓ Bloco 3: Pergunta & Captura (`questionNode`)
Faz uma pergunta ao cliente, aguarda a resposta e armazena o valor em uma variável personalizada.
- **Nome da Variável:** Ex: `email_cliente`, `cpf`, `cidade`.
- **Validação:** Valida formato de e-mail, telefone com DDD, números ou texto livre.

#### 4. 🧠 Bloco 4: Agente IA (Llama / Gemini) (`aiNode`)
> [!IMPORTANT]
> **Comportamento Inteligente e Estrito:** A IA e a Base de Conhecimento RAG só são acionadas se você incluir e conectar explicitamente este bloco no seu fluxo. Fluxos compostos apenas por mensagens fixas não chamam a IA.

- **Provedor de IA:** Alterne entre **Google Gemini 2.5 Flash** (Nuvem rápida) ou **Llama Local / Ollama** (100% offline).
- **Prompt do Sistema:** Defina as instruções da IA (ex: *"Você é o atendente virtual atencioso da empresa. Responda em português claro e cordial."*).
- **Chave Seletora "Consultar Base de Conhecimento (RAG)":** Quando ativada, a IA pesquisa automaticamente os documentos cadastrados na aba **Base de Conhecimento** e responde com base neles.

#### 5. 🔀 Bloco 5: Condição / Se-Senão (`conditionNode`)
Cria bifurcações dinâmicas no fluxo com saídas **Verdadeiro (Sim)** e **Falso (Não)** de acordo com regras de variáveis.

#### 6. ⏳ Bloco 6: Pausa / Digitando... (`delayNode`)
Introduz um tempo de espera humanizado e ativa o status *"digitando..."* no WhatsApp do cliente.

#### 7. 🌐 Bloco 7: Webhook / API (`webhookNode`)
Realiza requisições HTTP `POST` ou `GET` para integrar o fluxo com sistemas externos, CRMs e webhooks.

#### 8. 👤 Bloco 8: Transf. Atendente (`handoverNode`)
Transfere o atendimento para o painel de **Inbox** humano e pausa o robô para aquele contato até que o cliente digite uma palavra de reativação (como *"menu"* ou *"oi"*).

#### 9. 🏷️ Bloco 9: Etiqueta / Tag (`tagNode`)
Aplica ou remove tags no contato e move o lead de estágio no funil CRM.

---

### 📐 6.3 Exemplo Prático: Criando um Fluxo de Qualificação de Leads

Abaixo está o exemplo passo a passo de montagem de um fluxo completo de qualificação de vendas:

1. **Gatilho (Trigger):** Palavra-chave `orcamento`.
2. **Mensagem:** *"Olá {{nome}}! Que bom ter você aqui. Vou te ajudar com seu orçamento."*
3. **Atraso (Delay):** 2 segundos com indicador *"digitando..."* ativado.
4. **Pergunta (Question):** *"Qual o seu melhor e-mail corporativo?"* ➔ Validação: `E-mail` ➔ Salvar em: `email_corporativo`.
5. **Pergunta (Question):** *"Qual o número de funcionários da sua empresa?"* ➔ Validação: `Número` ➔ Salvar em: `num_funcionarios`.
6. **Condição (Condition):** `num_funcionarios` **Maior ou Igual a** `10`.
   - **Caminho VERDADEIRO (Empresa Grande):**
     - **Tag:** Adiciona a tag `Lead-Enterprise`.
     - **Transbordo (Handover):** Encaminha para o setor `Vendas Enterprise` com nota *"Lead de grande porte"*.
   - **Caminho FALSO (Empresa Pequena / Individual):**
     - **Agente IA (AI LLM):** IA configurada para apresentar os planos Standard com RAG ativado para tirar dúvidas de preços.

---

### 💡 6.4 Dicas de Boas Práticas na Construção de Fluxos

- **Sempre teste o fluxo no Inbox:** Envie uma mensagem de teste no WhatsApp conectado usando a palavra-chave cadastrada para validar a navegação do fluxo.
- **Evite mensagens longas consecutivas:** Utilize blocos de **Atraso (Delay)** entre mensagens grandes para não sobrecarregar o cliente com blocos maciços de texto de uma só vez.
- **Tenha um caminho de transbordo humano:** Sempre ofereça ao cliente uma forma de falar com uma pessoa caso o robô ou a IA não resolva o problema imediatamente.

---

## ⚙️ 7. Solução de Dúvidas Frequentes (FAQ)

### ❓ Como preparar minha planilha Excel para o Disparador em Massa?
- No Excel ou Google Planilhas, crie duas colunas simples: **Coluna A:** `Nome` e **Coluna B:** `Telefone`.
- Salve o arquivo como **CSV (Separado por vírgulas ou ponto e vírgula)**.
- O sistema aceita qualquer formatação telefônica brasileira (ex: `82993530493`, `(82) 99353-0493`, `5582993530493` ou `+55 82 99353-0493`), limpando e normalizando os dígitos automaticamente.
- Para evitar bloqueios do WhatsApp, utilize intervalos recomendados de 6 a 15 segundos entre disparos com **Spintax** ativo (`{Olá|Oi|Opa}`).

### ❓ Onde ficam gravados os arquivos de log de erros do aplicativo e como posso acessá-los?
- **Gravação Automática em Tempo Real:** Todo o histórico de execução, erros do servidor Express, falhas de rede, exceções não tratadas e desconexões do WhatsApp são gravados automaticamente com data e hora ISO.
- **Localização dos Arquivos de Log no Windows:**
  - `C:\Users\<SeuUsuario>\AppData\Roaming\botflow-studio-pro\logs\app.log` (Log completo do sistema)
  - `C:\Users\<SeuUsuario>\AppData\Roaming\botflow-studio-pro\logs\error.log` (Apenas alertas e erros)
- **Como Visualizar Direto no Aplicativo:**
  1. No menu superior da aplicação (Header), clique no botão **`Logs`** (ícone de terminal `>_`).
  2. Um modal será exibido em tela com os registros ao vivo.
  3. Você poderá clicar em **`Abrir Pasta de Logs`** para abrir diretamente o Windows Explorer na pasta dos arquivos, **`Copiar Logs`**, **`Baixar .log`** ou **`Limpar Logs`**.

### ❓ Aparecia a mensagem "Falha ao Conectar ao Servidor Interno" na porta 3000. O que causava e como foi corrigido?
- **Causa Raiz:** No Windows 10/11, duas causas podiam gerar essa mensagem no executável `.exe`:
  1. **Conflito de Porta (Porta 3000 Ocupada):** Se a porta 3000 já estivesse em uso no seu Windows (por outro programa, Docker, WSL, servidor React dev ou outra instância do BotFlow), o servidor Express falhava em escutar e o Electron não conseguia conectar.
  2. **Inicialização Assíncrona Não Aguardada:** O Electron iniciava o carregamento da janela antes que a promessa assíncrona do servidor Express completasse a abertura do socket TCP.
- **Ajustes aplicados na versão atual:**
  1. **Detecção e Busca Automática de Porta Livre:** O servidor agora tenta iniciar na porta `3000`. Se detectar que a porta está ocupada (`EADDRINUSE`), ele migra automaticamente para a próxima porta disponível (`3001`, `3002`, `3003`... até `3010`) sem travar ou emitir erro ao usuário!
  2. **Inicialização Sincronizada (Async Await):** O Electron aguarda rigorosamente o servidor emitir o evento `listening` e informar a porta ativa exata antes de abrir a janela do aplicativo.
  3. **Endereçamento Rígido IPv4 `127.0.0.1`:** O Electron se conecta diretamente ao loopback de IPv4 (`http://127.0.0.1:<porta>`), evitando conflitos de firewall ou DNS IPv6 (`::1`) no Windows 10/11 Pro e Home.
  4. **Caixa de Diagnóstico com Stack Trace:** Se ocorrer qualquer erro fatal ao carregar o servidor, a tela exibirá a pilha de erro detalhada em um bloco de código vermelho com instruções.

### ❓ O aplicativo `.exe` abria em tela preta no Windows 10 Home Single Language. Por que ocorria e como foi corrigido?
- **Não é uma restrição do seu Windows 10 Home Single Language**, mas sim um comportamento conhecido do Chromium/Electron ao interagir com drivers de placas de vídeo integradas (Intel HD Graphics / AMD Radeon) no Windows 10. Além disso, a tentativa de criação de subprocessos por `fork` dentro de arquivos `.asar` em edições Home era por vezes bloqueada pelo Windows Defender.
- **Solução aplicada no código:**
  1. **Desativação Forçada da Aceleração de Hardware por GPU:** Incluímos `app.disableHardwareAcceleration()`, `--disable-gpu` e `--disable-software-rasterizer` no inicializador do Electron (`electron/main.cjs`). Isso força o aplicativo a renderizar em modo software de alta performance sem tela preta.
  2. **Execução Direta do Servidor no Processo Principal:** O servidor Express passou a ser carregado diretamente no processo principal do Electron (`require(serverPath)`), eliminando qualquer dependência de `child_process.fork()` ou permissões de firewall no Windows 10.
  3. **Atalhos para Depuração:** Adicionamos os atalhos **F12** e **Ctrl+Shift+I** no executável gerado para permitir inspecionar o console caso necessário.

### ❓ Executei `npm run dist:win` e o aplicativo `.exe` compilado abria em tela preta. Como foi resolvido?
- Esse problema ocorria porque, no executável final compilado via Electron Builder, o servidor Node/Express interno tentava localizar os arquivos estáticos compilados usando o diretório atual do sistema (`process.cwd()`), o qual aponta para a pasta onde o executável foi instalado no Windows e não para os arquivos dentro do pacote do app (`app.asar`).
- **Ajuste realizado:**
  1. O servidor foi atualizado para resolver dinamicamente o caminho da pasta `dist/index.html` a partir do diretório interno do pacote (`app.getAppPath()`).
  2. O launcher do Electron em `electron/main.cjs` agora passa a variável de ambiente `ELECTRON_RUN_AS_NODE=1` para inicializar o subprocesso do servidor Express sem falhas.
  3. Adicionamos a diretiva `asarUnpack: ["dist/server.cjs"]` no `package.json` para garantir que o binário do servidor seja descompactado e executado perfeitamente no Windows.
  4. Agora, basta rodar `npm run dist:win`, acessar a pasta `dist-electron/` e executar o instalador `.exe` criado!

### ❓ Baixei a atualização em ZIP e substituí os arquivos, o que devo fazer?
- Sempre que você baixar um novo ZIP do projeto e extrair sobre a pasta existente:
  1. Feche o terminal ou o processo antigo rodando.
  2. A pasta `baileys_auth_info` (onde fica a sessão salva do WhatsApp) pode ser mantida se você não quiser ler o QR Code de novo.
  3. No terminal, execute `npm run electron:dev` ou `npm run dev`. O Baileys reconectará de forma ultra-rápida usando o resolver automático de JID e timeouts ajustados.

### ❓ Minha câmera diz "Código QR inválido", o que fazer?
- Certifique-se de ter clicado em **"⚡ Iniciar & Gerar QR Code Real"** para que o servidor Baileys ative o WebSocket. O QR Code gerado por esse botão é dinâmico e legítimo.

### ❓ Se eu fechar o navegador, o WhatsApp continua respondendo?
- Enquanto o servidor Node.js estiver rodando, a conexão permanece ativa. Em versões Desktop Electron, o aplicativo roda em segundo plano na bandeja do sistema (System Tray).

### ❓ Como enviar uma mensagem para um novo número?
- Na aba Inbox, clique em **Novo Chat**, insira o número com DDD e código do país (ex: `5511999998888`) e envie a mensagem. O sistema resolverá o número correto automaticamente.

---

*BotFlow Studio PRO v2.5 — Manual do Usuário oficial.*
