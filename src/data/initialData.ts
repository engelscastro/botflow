import { ChatFlow, Contact, Conversation, ChannelStatus, AIProviderConfig, KnowledgeDocument, AnalyticsSummary } from '../types';

export const INITIAL_FLOWS: ChatFlow[] = [
  {
    id: 'flow-sagi-01',
    name: 'Superintendência de Avaliação e Gestão da Informação (SAGI)',
    description: 'Fluxo oficial de atendimento institucional com direcionamento para Vigilância Socioassistencial e Gestão do Trabalho e Educação Permanente.',
    channel: 'whatsapp',
    isActive: true,
    updatedAt: 'Agora',
    triggerCount: 320,
    nodes: [
      {
        id: 'sagi-node-trigger',
        type: 'triggerNode',
        position: { x: 50, y: 380 },
        data: {
          label: 'Início: Palavras-chave SAGI',
          type: 'trigger',
          channel: 'whatsapp',
          triggerType: 'keyword',
          keywords: ['oi', 'olá', 'ola', 'bom dia', 'boa tarde', 'boa noite', 'sagi', 'suas', 'vigilancia', 'educacao', 'menu', 'iniciar', 'atendimento', 'ajuda'],
        }
      },
      {
        id: 'sagi-node-menu',
        type: 'messageNode',
        position: { x: 420, y: 380 },
        data: {
          label: 'Menu Principal - SAGI',
          type: 'message',
          messageText: '🏛️ *Superintendência de Avaliação e Gestão da Informação (SAGI)*\n\nOlá! Seja bem-vindo(a) ao canal oficial de atendimento e apoio técnico da SAGI.\n\nPor favor, selecione para qual gerência você deseja atendimento:',
          quickReplies: [
            '1. Gerência de Vigilância Socioassistencial',
            '2. Gerência de Gestão do Trabalho e Educação Permanente'
          ],
        }
      },
      // --- RAMIFICAÇÃO 1: GERÊNCIA DE VIGILÂNCIA SOCIOASSISTENCIAL ---
      {
        id: 'sagi-node-vigilancia-menu',
        type: 'messageNode',
        position: { x: 880, y: 160 },
        data: {
          label: 'Menu: Vigilância Socioassistencial',
          type: 'message',
          messageText: '📊 *Gerência de Vigilância Socioassistencial*\n\nA Vigilância Socioassistencial é responsável pela sistematização, análise e disseminação de informações socioterritoriais no âmbito do SUAS.\n\nComo podemos ajudar o seu município hoje? Selecione uma opção:',
          quickReplies: [
            '1. Dúvidas sobre sistemas',
            '2. Como implantar a vigilância no município',
            '3. Conhecer o Observatório do SUAS de Alagoas',
            '4. Falar com técnico',
            '5. Agendar reunião'
          ],
        }
      },
      {
        id: 'sagi-node-vig-sistemas',
        type: 'messageNode',
        position: { x: 1350, y: -40 },
        data: {
          label: 'Vigilância: Dúvidas sobre Sistemas',
          type: 'message',
          messageText: '💻 *Dúvidas sobre Sistemas - Vigilância Socioassistencial*\n\nPrestam-se orientações técnicas nos seguintes sistemas e instrumentais:\n\n• *RMA* (Registro Mensal de Atendimentos de CRAS/CREAS)\n• *Censo SUAS* (Preenchimento anual e qualificação cadastral)\n• *CadÚnico / Cecad* (Extração, tabulação e análise de vulnerabilidade)\n• *SISC* (Acompanhamento de usuários do SCFV)\n\nSelecione se deseja falar diretamente com a equipe técnica:',
          quickReplies: [
            'Falar com técnico da Vigilância',
            'Voltar ao menu inicial'
          ]
        }
      },
      {
        id: 'sagi-node-vig-implantar',
        type: 'messageNode',
        position: { x: 1350, y: 100 },
        data: {
          label: 'Vigilância: Como Implantar no Município',
          type: 'message',
          messageText: '📋 *Como Implantar a Vigilância Socioassistencial no Município*\n\nPassos estratégicos para estruturação no município:\n\n1️⃣ *Instituição Formal*: Previsão da unidade/setor de vigilância na estrutura da Secretaria Municipal de Assistência Social.\n2️⃣ *Equipe de Referência*: Composição técnica de acordo com as diretrizes da NOB-RH/SUAS.\n3️⃣ *Diagnóstico Socioterritorial*: Mapeamento das situações de risco e vulnerabilidade e da rede instalada.\n4️⃣ *Rotinas de Coleta e Monitoramento*: Alimentação periódica do RMA, Censo e cruzamento de bases.\n\nA SAGI disponibiliza orientações técnicas e minutas orientativas!',
          quickReplies: [
            'Falar com técnico da Vigilância',
            'Agendar reunião'
          ]
        }
      },
      {
        id: 'sagi-node-vig-observatorio',
        type: 'messageNode',
        position: { x: 1350, y: 240 },
        data: {
          label: 'Vigilância: Observatório do SUAS',
          type: 'message',
          messageText: '🌐 *Observatório do SUAS de Alagoas*\n\nO Observatório do SUAS de Alagoas é o portal oficial de inteligência territorial e transparência socioassistencial do Estado.\n\nPrincipais recursos disponíveis:\n📊 *Painéis Interativos (BI)* de cobertura de benefícios e serviços.\n📍 *Mapas Socioterritoriais* com indicadores municipais.\n📈 *Relatórios Analíticos* para subsidiar o planejamento municipal.',
          quickReplies: [
            'Falar com técnico da Vigilância',
            'Voltar ao menu inicial'
          ]
        }
      },
      {
        id: 'sagi-node-vig-tecnico',
        type: 'handoverNode',
        position: { x: 1350, y: 370 },
        data: {
          label: 'Transferir: Técnico Vigilância',
          type: 'handover',
          targetDepartment: 'Gerência de Vigilância Socioassistencial',
          agentNote: 'Encaminhamento para técnico especializado em Vigilância Socioassistencial da SAGI.',
        }
      },
      {
        id: 'sagi-node-vig-agendar',
        type: 'scheduleNode',
        position: { x: 1350, y: 490 },
        data: {
          label: 'Agendamento: Reunião Técnica',
          type: 'schedule',
          serviceName: 'Reunião Técnica - Vigilância Socioassistencial',
          scheduleAction: 'book_appointment',
          messageText: '📅 *Agendamento de Reunião Técnica*\n\nSua solicitação de reunião foi registrada com sucesso! Nossa equipe técnica entrará em contato para alinhar a pauta, data e link da reunião com os técnicos do seu município.',
        }
      },

      // --- RAMIFICAÇÃO 2: GERÊNCIA DE GESTÃO DO TRABALHO E EDUCAÇÃO PERMANENTE ---
      {
        id: 'sagi-node-educacao-menu',
        type: 'messageNode',
        position: { x: 880, y: 680 },
        data: {
          label: 'Menu: Gestão do Trabalho & Ed. Permanente',
          type: 'message',
          messageText: '🎓 *Gerência de Gestão do Trabalho e Educação Permanente*\n\nResponsável pelo aprimoramento da gestão do trabalho no SUAS, qualificação continuada dos trabalhadores e execução do Plano Estadual de Educação Permanente.\n\nEscolha o assunto desejado:',
          quickReplies: [
            '1. Dúvidas sobre sistemas',
            '2. Como implantar a gestão do trabalho e educação permanente no município',
            '3. Ações de educação permanente',
            '4. Falar com técnico'
          ],
        }
      },
      {
        id: 'sagi-node-edu-sistemas',
        type: 'messageNode',
        position: { x: 1350, y: 620 },
        data: {
          label: 'Ed. Permanente: Dúvidas sobre Sistemas',
          type: 'message',
          messageText: '💻 *Dúvidas sobre Sistemas - Gestão do Trabalho e Educação Permanente*\n\nOrientações e suporte operacional em:\n\n• *CadSUAS*: Atualização de cargos, vínculos de trabalhadores, coordenações de unidades e conselhos.\n• *Plataforma de Capacitação*: Ambientes de aprendizagem, inscrições de turmas e emissão de certificados.',
          quickReplies: [
            'Falar com técnico de Educação Permanente',
            'Voltar ao menu inicial'
          ]
        }
      },
      {
        id: 'sagi-node-edu-implantar',
        type: 'messageNode',
        position: { x: 1350, y: 760 },
        data: {
          label: 'Ed. Permanente: Implantação no Município',
          type: 'message',
          messageText: '📋 *Como Implantar a Gestão do Trabalho e Educação Permanente no Município*\n\nDiretrizes centrais para estruturação municipal:\n\n1️⃣ *Institucionalização*: Criação do setor de Gestão do Trabalho e Núcleo Municipal de Educação Permanente (NUEP).\n2️⃣ *Adequação à NOB-RH/SUAS*: Priorização de concurso público, plano de cargos e valorização das equipes.\n3️⃣ *Plano Municipal de Educação Permanente (PMEP)*: Diagnóstico das necessidades formativas dos trabalhadores do SUAS.',
          quickReplies: [
            'Falar com técnico de Educação Permanente',
            'Ações de Educação Permanente'
          ]
        }
      },
      {
        id: 'sagi-node-edu-acoes',
        type: 'messageNode',
        position: { x: 1350, y: 900 },
        data: {
          label: 'Ed. Permanente: Ações Formativas',
          type: 'message',
          messageText: '📚 *Ações de Educação Permanente em Alagoas*\n\nConheça as ações continuadas promovidas pela SAGI:\n\n• *Cursos de Formação e Atualização*: Ofertas temáticas para trabalhadores de nível médio e superior do SUAS.\n• *CapacitaSUAS*: Formação presencial e EaD com certificação.\n• *Oficinas Regionais e Webinários*: Acompanhamento técnico às equipes municipais.\n\nConsulte o cronograma de turmas abertas!',
          quickReplies: [
            'Falar com técnico de Educação Permanente',
            'Voltar ao menu inicial'
          ]
        }
      },
      {
        id: 'sagi-node-edu-tecnico',
        type: 'handoverNode',
        position: { x: 1350, y: 1040 },
        data: {
          label: 'Transferir: Técnico Ed. Permanente',
          type: 'handover',
          targetDepartment: 'Gerência de Gestão do Trabalho e Educação Permanente',
          agentNote: 'Encaminhamento para atendimento técnico especializado em Gestão do Trabalho e Educação Permanente.',
        }
      }
    ],
    edges: [
      // Início -> Menu Principal SAGI
      { id: 'e-sagi-start', source: 'sagi-node-trigger', target: 'sagi-node-menu' },
      
      // Menu Principal -> Gerências
      { id: 'e-sagi-to-vig', source: 'sagi-node-menu', target: 'sagi-node-vigilancia-menu', label: '1. Vigilância Socioassistencial' },
      { id: 'e-sagi-to-edu', source: 'sagi-node-menu', target: 'sagi-node-educacao-menu', label: '2. Gestão do Trabalho e Ed. Permanente' },

      // Menu Vigilância -> Opções
      { id: 'e-vig-1', source: 'sagi-node-vigilancia-menu', target: 'sagi-node-vig-sistemas', label: '1. Dúvidas sobre sistemas' },
      { id: 'e-vig-2', source: 'sagi-node-vigilancia-menu', target: 'sagi-node-vig-implantar', label: '2. Como implantar a vigilância' },
      { id: 'e-vig-3', source: 'sagi-node-vigilancia-menu', target: 'sagi-node-vig-observatorio', label: '3. Conhecer Observatório SUAS' },
      { id: 'e-vig-4', source: 'sagi-node-vigilancia-menu', target: 'sagi-node-vig-tecnico', label: '4. Falar com técnico' },
      { id: 'e-vig-5', source: 'sagi-node-vigilancia-menu', target: 'sagi-node-vig-agendar', label: '5. Agendar reunião' },

      // Vigilância Sub-opções conexões
      { id: 'e-vig-sis-tec', source: 'sagi-node-vig-sistemas', target: 'sagi-node-vig-tecnico', label: 'Falar com técnico' },
      { id: 'e-vig-sis-menu', source: 'sagi-node-vig-sistemas', target: 'sagi-node-menu', label: 'Voltar ao menu' },
      { id: 'e-vig-imp-tec', source: 'sagi-node-vig-implantar', target: 'sagi-node-vig-tecnico', label: 'Falar com técnico' },
      { id: 'e-vig-imp-agd', source: 'sagi-node-vig-implantar', target: 'sagi-node-vig-agendar', label: 'Agendar reunião' },
      { id: 'e-vig-obs-tec', source: 'sagi-node-vig-observatorio', target: 'sagi-node-vig-tecnico', label: 'Falar com técnico' },
      { id: 'e-vig-obs-menu', source: 'sagi-node-vig-observatorio', target: 'sagi-node-menu', label: 'Voltar ao menu' },

      // Menu Educação Permanente -> Opções
      { id: 'e-edu-1', source: 'sagi-node-educacao-menu', target: 'sagi-node-edu-sistemas', label: '1. Dúvidas sobre sistemas' },
      { id: 'e-edu-2', source: 'sagi-node-educacao-menu', target: 'sagi-node-edu-implantar', label: '2. Como implantar gestão do trabalho' },
      { id: 'e-edu-3', source: 'sagi-node-educacao-menu', target: 'sagi-node-edu-acoes', label: '3. Ações de educação permanente' },
      { id: 'e-edu-4', source: 'sagi-node-educacao-menu', target: 'sagi-node-edu-tecnico', label: '4. Falar com técnico' },

      // Educação Sub-opções conexões
      { id: 'e-edu-sis-tec', source: 'sagi-node-edu-sistemas', target: 'sagi-node-edu-tecnico', label: 'Falar com técnico' },
      { id: 'e-edu-sis-menu', source: 'sagi-node-edu-sistemas', target: 'sagi-node-menu', label: 'Voltar ao menu' },
      { id: 'e-edu-imp-tec', source: 'sagi-node-edu-implantar', target: 'sagi-node-edu-tecnico', label: 'Falar com técnico' },
      { id: 'e-edu-imp-acoes', source: 'sagi-node-edu-implantar', target: 'sagi-node-edu-acoes', label: 'Ações de educação' },
      { id: 'e-edu-acoes-tec', source: 'sagi-node-edu-acoes', target: 'sagi-node-edu-tecnico', label: 'Falar com técnico' },
      { id: 'e-edu-acoes-menu', source: 'sagi-node-edu-acoes', target: 'sagi-node-menu', label: 'Voltar ao menu' },
    ]
  },
  {
    id: 'flow-wa-01',
    name: 'Atendimento Geral WhatsApp Web & FAQ Llama',
    description: 'Fluxo de demonstração de atendimento automatizado com captura de e-mail e IA Llama 3.2.',
    channel: 'whatsapp',
    isActive: false,
    updatedAt: 'Hoje, 14:32',
    triggerCount: 1420,
    nodes: [
      {
        id: 'node-1',
        type: 'triggerNode',
        position: { x: 50, y: 150 },
        data: {
          label: 'Início: Palavras-chave',
          type: 'trigger',
          channel: 'whatsapp',
          triggerType: 'keyword',
          keywords: ['oi', 'olá', 'bom dia', 'boa tarde', 'menu', 'ajuda'],
        }
      },
      {
        id: 'node-2',
        type: 'messageNode',
        position: { x: 380, y: 150 },
        data: {
          label: 'Saudação com Opções',
          type: 'message',
          messageText: 'Olá! Seja bem-vindo ao suporte automatizado do BotFlow. Como posso te ajudar hoje?',
          quickReplies: ['1. Conhecer Produtos', '2. Falar com Atendente', '3. Dúvidas Frequentes (IA Llama)'],
        }
      },
      {
        id: 'node-3',
        type: 'questionNode',
        position: { x: 720, y: 50 },
        data: {
          label: 'Coleta de E-mail',
          type: 'question',
          messageText: 'Para começarmos, qual é o seu e-mail corporativo?',
          variableName: 'user_email',
          validationType: 'email',
        }
      },
      {
        id: 'node-4',
        type: 'aiNode',
        position: { x: 720, y: 280 },
        data: {
          label: 'Resposta Inteligente (Llama 3.2 / Gemini)',
          type: 'ai_llm',
          aiProvider: 'local_llama',
          modelName: 'llama3.2:3b-instruct',
          systemPrompt: 'Você é um assistente virtual atencioso da empresa BotFlow. Responda em português claro e conciso usando a base de conhecimento.',
          temperature: 0.3,
          useKnowledgeBase: true,
        }
      },
      {
        id: 'node-5',
        type: 'handoverNode',
        position: { x: 1060, y: 150 },
        data: {
          label: 'Transferir para Atendente',
          type: 'handover',
          targetDepartment: 'Equipe de Vendas',
          agentNote: 'Cliente solicitou atendimento humano via menu WhatsApp.',
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'node-1', target: 'node-2' },
      { id: 'e2-3', source: 'node-2', target: 'node-3', label: 'Opção 1' },
      { id: 'e2-4', source: 'node-2', target: 'node-4', label: 'Opção 3 (IA)' },
      { id: 'e2-5', source: 'node-2', target: 'node-5', label: 'Opção 2' },
    ]
  },
  {
    id: 'flow-tg-02',
    name: 'Captura de Leads Telegram',
    description: 'Boas-vindas para novos membros do canal Telegram com envio de material e qualificação automática.',
    channel: 'telegram',
    isActive: true,
    updatedAt: 'Ontem, 18:10',
    triggerCount: 890,
    nodes: [
      {
        id: 'tg-node-1',
        type: 'triggerNode',
        position: { x: 50, y: 150 },
        data: {
          label: 'Trigger Telegram /start',
          type: 'trigger',
          channel: 'telegram',
          triggerType: 'keyword',
          keywords: ['/start', '/menu', 'começar'],
        }
      },
      {
        id: 'tg-node-2',
        type: 'messageNode',
        position: { x: 380, y: 150 },
        data: {
          label: 'Boas-vindas Telegram',
          type: 'message',
          messageText: '🚀 Olá! Obrigado por iniciar o bot do Telegram BotFlow. Quer receber nosso Ebook Gratuito de Automação?',
          quickReplies: ['Quero o Ebook!', 'Conhecer Planos'],
        }
      },
      {
        id: 'tg-node-3',
        type: 'tagNode',
        position: { x: 720, y: 150 },
        data: {
          label: 'Aplicar Tag: Lead_Telegram',
          type: 'tag',
          actionType: 'add_tag',
          tagName: 'Lead Telegram Qualificado',
        }
      }
    ],
    edges: [
      { id: 'tg-e1-2', source: 'tg-node-1', target: 'tg-node-2' },
      { id: 'tg-e2-3', source: 'tg-node-2', target: 'tg-node-3' }
    ]
  },
  {
    id: 'flow-ig-03',
    name: 'Respostas Direct Instagram & Story',
    description: 'Responde automaticamente a menções em Stories e mensagens no Direct do Instagram.',
    channel: 'instagram',
    isActive: true,
    updatedAt: '3 dias atrás',
    triggerCount: 650,
    nodes: [
      {
        id: 'ig-node-1',
        type: 'triggerNode',
        position: { x: 50, y: 150 },
        data: {
          label: 'Início: Menção em Story / Direct',
          type: 'trigger',
          channel: 'instagram',
          triggerType: 'first_message',
        }
      },
      {
        id: 'ig-node-2',
        type: 'messageNode',
        position: { x: 380, y: 150 },
        data: {
          label: 'Agradecimento Instagram',
          type: 'message',
          messageText: 'Obrigado pelo seu recado aqui no Insta! 📸 Quer saber como criar um chatbot igual a esse para o seu perfil?',
          quickReplies: ['Sim! Ver Demonstração', 'Outras dúvidas'],
        }
      }
    ],
    edges: [
      { id: 'ig-e1-2', source: 'ig-node-1', target: 'ig-node-2' }
    ]
  }
];

export const INITIAL_CONTACTS: Contact[] = [];

export const INITIAL_CONVERSATIONS: Record<string, Conversation> = {};

export const INITIAL_CHANNELS: ChannelStatus[] = [
  {
    id: 'whatsapp',
    name: 'WhatsApp Web (Baileys / Webhook)',
    connected: true,
    statusText: 'Sincronizado e Ativo',
    accountIdentifier: '+55 (11) 99882-1000 (Sessão Web #01)',
    lastSync: 'Há 2 minutos',
    batteryLevel: 94,
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=BOTFLOW_WHATSAPP_SESSION_ACTIVE_2026'
  },
  {
    id: 'telegram',
    name: 'Telegram Bot API',
    connected: true,
    statusText: 'Webhook Operacional',
    accountIdentifier: '@BotFlowOfficial_Bot',
    lastSync: 'Há 5 minutos'
  },
  {
    id: 'instagram',
    name: 'Instagram Direct Messaging',
    connected: true,
    statusText: 'Meta App Conectado',
    accountIdentifier: '@botflow.studio (Conta Business)',
    lastSync: 'Há 12 minutos'
  },
  {
    id: 'web',
    name: 'Widget Web Chat Embed',
    connected: true,
    statusText: 'Script ativo no site',
    accountIdentifier: 'app.botflow.io/widget/v1.js',
    lastSync: 'Em tempo real'
  },
  {
    id: 'sms',
    name: 'Gateway SMS (Twilio / Android)',
    connected: false,
    statusText: 'Requer Configuração',
    accountIdentifier: 'Módulo SMS Local/Global',
    lastSync: 'Nunca configurado'
  }
];

export const INITIAL_AI_CONFIG: AIProviderConfig = {
  activeProvider: 'local_llama',
  localEndpoint: 'http://localhost:11434/api/generate',
  localModelName: 'llama3.2:3b-instruct',
  geminiApiKeyConfigured: true,
  temperature: 0.3,
  maxTokens: 512,
  fallbackToRuleBot: true,
  systemPromptTemplate: `Você é o assistente virtual inteligente da plataforma BotFlow.
Seu objetivo é ajudar os clientes tirando dúvidas sobre automação de chatbots, WhatsApp Web, Telegram, Instagram e IA Local (Llama / Ollama).
Responda de forma cortês, objetiva, em Português do Brasil e formate os pontos principais com marcadores ou negrito.`
};

export const INITIAL_KNOWLEDGE: KnowledgeDocument[] = [
  {
    id: 'doc-sagi-01',
    title: 'Superintendência de Avaliação e Gestão da Informação (SAGI)',
    category: 'SAGI & Gestão',
    content: 'A SAGI tem a missão institucional de gerir, analisar e avaliar as informações socioassistenciais do Estado de Alagoas, articulando a Gerência de Vigilância Socioassistencial e a Gerência de Gestão do Trabalho e Educação Permanente para apoiar os 102 municípios alagoanos no fortalecimento do SUAS.',
    tokens: 160,
    updatedAt: 'Hoje'
  },
  {
    id: 'doc-sagi-02',
    title: 'Gerência de Vigilância Socioassistencial - Sistemas e Implantação',
    category: 'Vigilância Socioassistencial',
    content: 'A Vigilância Socioassistencial atua na produção de diagnósticos socioterritoriais, monitoramento do CadÚnico, preenchimento do Censo SUAS, tabulação do RMA (Registro Mensal de Atendimento) e gestão do SISC. O setor apoia municípios na criação de seus setores próprios de vigilância e no uso de evidências para o planejamento.',
    tokens: 180,
    updatedAt: 'Hoje'
  },
  {
    id: 'doc-sagi-03',
    title: 'Observatório do SUAS de Alagoas',
    category: 'Observatório & Dados',
    content: 'Plataforma oficial de BI e transparência socioterritorial de Alagoas, integrando painéis interativos de vulnerabilidade, cobertura de CRAS/CREAS, programas de transferência de renda e indicadores municipais.',
    tokens: 130,
    updatedAt: 'Hoje'
  },
  {
    id: 'doc-sagi-04',
    title: 'Gerência de Gestão do Trabalho e Educação Permanente',
    category: 'Educação Permanente',
    content: 'Responsável pelo apoio técnico na adequação à NOB-RH/SUAS, estruturação de planos de cargos e carreiras, suporte ao CadSUAS e execução de capacitações como CapacitaSUAS, oficinas regionais e cursos de aperfeiçoamento para trabalhadores do SUAS.',
    tokens: 170,
    updatedAt: 'Hoje'
  },
  {
    id: 'doc-01',
    title: 'FAQ Geral - O que é o BotFlow e como funciona?',
    category: 'Geral',
    content: 'O BotFlow é uma plataforma web completa para criação e gestão visual de chatbots com suporte a arrastar e soltar. Permite integrar WhatsApp Web, Telegram, Instagram e modelos de IA locais como Llama/Ollama ou Gemini na nuvem.',
    tokens: 140,
    updatedAt: '01/08/2026'
  },
  {
    id: 'doc-02',
    title: 'Conexão WhatsApp Web via QR Code',
    category: 'Canais',
    content: 'Para conectar o WhatsApp Web, vá em Canais -> WhatsApp Web e escaneie o código QR exibido. A sessão permanece ativa em tempo real permitindo envio e recebimento automatizado de mensagens.',
    tokens: 110,
    updatedAt: '02/08/2026'
  },
  {
    id: 'doc-03',
    title: 'Configuração de IA Local (Llama 3.2 via Ollama)',
    category: 'Inteligência Artificial',
    content: 'O BotFlow permite conectar instâncias locais do Ollama rodando em sua própria infraestrutura (ex: http://localhost:11434). Isso garante total privacidade dos dados e zero custo por token enviado.',
    tokens: 180,
    updatedAt: '03/08/2026'
  }
];

export const INITIAL_ANALYTICS: AnalyticsSummary = {
  totalMessages: 18450,
  activeConversations: 342,
  botResolutionRate: 86.4,
  humanHandoverRate: 13.6,
  avgResponseTimeSec: 1.4,
  csatScore: 4.9,
  messagesByChannel: [
    { name: 'Seg', whatsapp: 1200, telegram: 450, instagram: 380, web: 150 },
    { name: 'Ter', whatsapp: 1500, telegram: 520, instagram: 410, web: 210 },
    { name: 'Qua', whatsapp: 1850, telegram: 600, instagram: 490, web: 280 },
    { name: 'Qui', whatsapp: 2100, telegram: 680, instagram: 530, web: 310 },
    { name: 'Sex', whatsapp: 2400, telegram: 750, instagram: 610, web: 350 },
    { name: 'Sáb', whatsapp: 1300, telegram: 390, instagram: 320, web: 180 },
    { name: 'Dom', whatsapp: 950, telegram: 280, instagram: 240, web: 110 }
  ],
  resolutionByBotVsHuman: [
    { name: 'Resolvido por Bot', valor: 86.4, color: '#10B981' },
    { name: 'Transf. Atendente Humano', valor: 13.6, color: '#3B82F6' }
  ],
  topDropoffNodes: [
    { nodeName: 'Coleta de E-mail Corporativo', dropoffs: 42, percentage: 4.1 },
    { nodeName: 'Menu de Opções Iniciais', dropoffs: 28, percentage: 2.7 },
    { nodeName: 'Confirmação de Agendamento', dropoffs: 18, percentage: 1.8 }
  ],
  sentimentBreakdown: [
    { type: 'Positivo / Satisfeito', count: 1240, color: '#10B981' },
    { type: 'Neutro / Dúvida', count: 480, color: '#6B7280' },
    { type: 'Urgente / Frustrado', count: 65, color: '#EF4444' }
  ]
};
