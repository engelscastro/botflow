import { GoogleGenAI } from "@google/genai";
import { contactsDB, appointmentsDB } from './db.js';

export interface FlowNode {
  id: string;
  type: string;
  data: {
    label?: string;
    type?: string;
    channel?: string;
    triggerType?: string;
    keywords?: string[];
    messageText?: string;
    quickReplies?: string[];
    variableName?: string;
    validationType?: string;
    aiProvider?: string;
    modelName?: string;
    systemPrompt?: string;
    useKnowledgeBase?: boolean;
    targetDepartment?: string;
    agentNote?: string;
    tagName?: string;
    conditionVariable?: string;
    conditionOperator?: string;
    conditionValue?: string;
    dbAction?: string;
    scheduleAction?: string;
    serviceName?: string;
  };
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface ChatFlow {
  id: string;
  name: string;
  description?: string;
  channel: string;
  isActive: boolean;
  nodes: FlowNode[];
  edges: FlowEdge[];
}

export interface KnowledgeDocument {
  id: string;
  title: string;
  category: string;
  content: string;
  tokens?: number;
  updatedAt?: string;
}

interface UserSession {
  lastNodeId?: string;
  variables: Record<string, string>;
  isPaused: boolean;
  lastInteraction: number;
}

const userSessions: Record<string, UserSession> = {};

let serverDocuments: KnowledgeDocument[] = [
  {
    id: 'doc-01',
    title: 'FAQ Geral - O que é o BotFlow e como funciona?',
    category: 'Geral',
    content: 'O BotFlow é uma plataforma web completa para criação e gestão visual de chatbots com suporte a arrastar e soltar. Permite integrar WhatsApp Web, Telegram, Instagram e modelos de IA locais como Llama/Ollama ou Gemini na nuvem.'
  },
  {
    id: 'doc-02',
    title: 'Conexão WhatsApp Web via QR Code',
    category: 'Canais',
    content: 'Para conectar o WhatsApp Web, vá em Canais -> WhatsApp Web e escaneie o código QR exibido. A sessão permanece ativa em tempo real permitindo envio e recebimento automatizado de mensagens.'
  },
  {
    id: 'doc-03',
    title: 'Configuração de IA Local (Llama 3.2 via Ollama)',
    category: 'Inteligência Artificial',
    content: 'O BotFlow permite conectar instâncias locais do Ollama rodando em sua própria infraestrutura (ex: http://localhost:11434). Isso garante total privacidade dos dados e zero custo por token enviado.'
  }
];

let serverFlows: ChatFlow[] = [
  {
    id: 'flow-sagi-01',
    name: 'Superintendência de Avaliação e Gestão da Informação (SAGI)',
    description: 'Fluxo oficial de atendimento institucional com direcionamento para Vigilância Socioassistencial e Gestão do Trabalho e Educação Permanente.',
    channel: 'whatsapp',
    isActive: true,
    nodes: [
      {
        id: 'sagi-node-trigger',
        type: 'triggerNode',
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
        data: {
          label: 'Transferir: Técnico Ed. Permanente',
          type: 'handover',
          targetDepartment: 'Gerência de Gestão do Trabalho e Educação Permanente',
          agentNote: 'Encaminhamento para atendimento técnico especializado em Gestão do Trabalho e Educação Permanente.',
        }
      }
    ],
    edges: [
      { id: 'e-sagi-start', source: 'sagi-node-trigger', target: 'sagi-node-menu' },
      { id: 'e-sagi-to-vig', source: 'sagi-node-menu', target: 'sagi-node-vigilancia-menu', label: '1. Vigilância Socioassistencial' },
      { id: 'e-sagi-to-edu', source: 'sagi-node-menu', target: 'sagi-node-educacao-menu', label: '2. Gestão do Trabalho e Ed. Permanente' },

      { id: 'e-vig-1', source: 'sagi-node-vigilancia-menu', target: 'sagi-node-vig-sistemas', label: '1. Dúvidas sobre sistemas' },
      { id: 'e-vig-2', source: 'sagi-node-vigilancia-menu', target: 'sagi-node-vig-implantar', label: '2. Como implantar a vigilância' },
      { id: 'e-vig-3', source: 'sagi-node-vigilancia-menu', target: 'sagi-node-vig-observatorio', label: '3. Conhecer Observatório SUAS' },
      { id: 'e-vig-4', source: 'sagi-node-vigilancia-menu', target: 'sagi-node-vig-tecnico', label: '4. Falar com técnico' },
      { id: 'e-vig-5', source: 'sagi-node-vigilancia-menu', target: 'sagi-node-vig-agendar', label: '5. Agendar reunião' },

      { id: 'e-vig-sis-tec', source: 'sagi-node-vig-sistemas', target: 'sagi-node-vig-tecnico', label: 'Falar com técnico' },
      { id: 'e-vig-sis-menu', source: 'sagi-node-vig-sistemas', target: 'sagi-node-menu', label: 'Voltar ao menu' },
      { id: 'e-vig-imp-tec', source: 'sagi-node-vig-implantar', target: 'sagi-node-vig-tecnico', label: 'Falar com técnico' },
      { id: 'e-vig-imp-agd', source: 'sagi-node-vig-implantar', target: 'sagi-node-vig-agendar', label: 'Agendar reunião' },
      { id: 'e-vig-obs-tec', source: 'sagi-node-vig-observatorio', target: 'sagi-node-vig-tecnico', label: 'Falar com técnico' },
      { id: 'e-vig-obs-menu', source: 'sagi-node-vig-observatorio', target: 'sagi-node-menu', label: 'Voltar ao menu' },

      { id: 'e-edu-1', source: 'sagi-node-educacao-menu', target: 'sagi-node-edu-sistemas', label: '1. Dúvidas sobre sistemas' },
      { id: 'e-edu-2', source: 'sagi-node-educacao-menu', target: 'sagi-node-edu-implantar', label: '2. Como implantar gestão do trabalho' },
      { id: 'e-edu-3', source: 'sagi-node-educacao-menu', target: 'sagi-node-edu-acoes', label: '3. Ações de educação permanente' },
      { id: 'e-edu-4', source: 'sagi-node-educacao-menu', target: 'sagi-node-edu-tecnico', label: '4. Falar com técnico' },

      { id: 'e-edu-sis-tec', source: 'sagi-node-edu-sistemas', target: 'sagi-node-edu-tecnico', label: 'Falar com técnico' },
      { id: 'e-edu-sis-menu', source: 'sagi-node-edu-sistemas', target: 'sagi-node-menu', label: 'Voltar ao menu' },
      { id: 'e-edu-imp-tec', source: 'sagi-node-edu-implantar', target: 'sagi-node-edu-tecnico', label: 'Falar com técnico' },
      { id: 'e-edu-imp-acoes', source: 'sagi-node-edu-implantar', target: 'sagi-node-edu-acoes', label: 'Ações de educação' },
      { id: 'e-edu-acoes-tec', source: 'sagi-node-edu-acoes', target: 'sagi-node-edu-tecnico', label: 'Falar com técnico' },
      { id: 'e-edu-acoes-menu', source: 'sagi-node-edu-acoes', target: 'sagi-node-menu', label: 'Voltar ao menu' },
    ]
  }
];

let serverActiveFlowId = 'flow-sagi-01';

export function setServerFlows(flows: ChatFlow[], activeId?: string, documents?: KnowledgeDocument[]) {
  if (flows && Array.isArray(flows) && flows.length > 0) {
    serverFlows = flows;
  }
  if (activeId) {
    serverActiveFlowId = activeId;
  }
  if (documents && Array.isArray(documents)) {
    serverDocuments = documents;
  }
}

export function getServerFlows() {
  return { flows: serverFlows, activeFlowId: serverActiveFlowId, documents: serverDocuments };
}

export function resetUserSession(fromNumber: string) {
  delete userSessions[fromNumber];
}

export function toggleSessionPause(fromNumber: string, isPaused?: boolean) {
  if (!userSessions[fromNumber]) {
    userSessions[fromNumber] = { variables: {}, isPaused: false, lastInteraction: Date.now() };
  }
  userSessions[fromNumber].isPaused = isPaused !== undefined ? isPaused : !userSessions[fromNumber].isPaused;
  if (!userSessions[fromNumber].isPaused) {
    userSessions[fromNumber].lastNodeId = undefined; // Clear previous position so bot restarts fresh
  }
  return userSessions[fromNumber].isPaused;
}

function buildRagContext(documents: KnowledgeDocument[]): string {
  if (!documents || documents.length === 0) return '';
  return `\n\n=== BASE DE CONHECIMENTO DA EMPRESA (RAG) ===\n` +
    documents.map((d, i) => `[Documento ${i + 1}] Título: ${d.title}\nCategoria: ${d.category}\nConteúdo: ${d.content}`).join('\n\n') +
    `\n=============================================\nInstrução RAG: Baseie sua resposta OBRIGATORIAMENTE nas informações oficiais acima da Base de Conhecimento. Se a pergunta for sobre os temas cadastrados, responda com clareza baseando-se no texto acima.`;
}

// Helper to format a message node response with its quick reply options
function formatMessageNodeResponse(node: FlowNode, variables: Record<string, string> = {}): string {
  let msg = node.data?.messageText || 'Olá! Como posso te ajudar hoje?';
  
  // Interpolate variables
  Object.entries(variables).forEach(([k, v]) => {
    msg = msg.replace(new RegExp(`{{${k}}}`, 'g'), v);
    msg = msg.replace(new RegExp(`{${k}}`, 'g'), v);
  });

  const replies = node.data?.quickReplies || [];
  if (replies.length > 0) {
    return `${msg}\n\n${replies.map((r, i) => {
      // If reply doesn't start with a number, add one for easy mobile selection
      const hasNumber = /^\d+[\.\-\)]/.test(r.trim());
      return hasNumber ? r : `${i + 1}. ${r}`;
    }).join('\n')}`;
  }
  return msg;
}


export async function processFlowIncomingMessage(
  fromNumber: string,
  userText: string,
  getAIClient: () => GoogleGenAI | null
): Promise<string | null> {
  const cleanText = userText.trim().toLowerCase();
  
  const flow = serverFlows.find(f => f.id === serverActiveFlowId && f.isActive) ||
               serverFlows.find(f => f.channel === 'whatsapp' && f.isActive) ||
               serverFlows.find(f => f.isActive) ||
               serverFlows[0];

  if (!flow || !flow.nodes || flow.nodes.length === 0) {
    return "Olá! Seja bem-vindo ao BotFlow. Como posso te ajudar hoje?";
  }

  let session = userSessions[fromNumber];
  if (!session) {
    session = { variables: { phone: fromNumber }, isPaused: false, lastInteraction: Date.now() };
    userSessions[fromNumber] = session;
  }
  session.lastInteraction = Date.now();
  session.variables['phone'] = fromNumber;

  if (session.isPaused) {
    const unpauseKeywords = ['oi', 'olá', 'ola', 'menu', 'iniciar', 'bot', 'reativar', 'voltar', 'ajuda', 'start', 'reset', '0', 'atendimento', 'bom dia', 'boa tarde', 'boa noite', 'falar com bot', 'robo', 'robô', 'recomeçar', 'recomecar'];
    const shouldUnpause = unpauseKeywords.some(k => cleanText === k || cleanText.includes(k));

    if (shouldUnpause) {
      session.isPaused = false;
      session.lastNodeId = undefined;
    } else {
      return null; // Human is handling
    }
  }

  const triggerNode = flow.nodes.find(n => n.type === 'triggerNode' || n.data?.type === 'trigger') || flow.nodes[0];
  
  const executeAINode = async (aiNode: FlowNode, promptInput?: string): Promise<string> => {
    const useRag = aiNode.data?.useKnowledgeBase ?? true;
    const systemPrompt = aiNode.data?.systemPrompt || 'Você é o assistente virtual atencioso da empresa.';
    const ragContext = (useRag && serverDocuments && serverDocuments.length > 0) ? buildRagContext(serverDocuments) : '';
    const queryText = promptInput || userText;
    const fullSystemPrompt = `${systemPrompt}${ragContext}`;

    const ai = getAIClient();
    if (ai) {
      try {
        const aiPromise = ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `${fullSystemPrompt}\n\nPergunta do Cliente: "${queryText}"\nResposta:`,
        });
        const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000));
        const resp: any = await Promise.race([aiPromise, timeoutPromise]);
        if (resp && resp.text) return resp.text;
      } catch (e) {
        console.error("AI Node error:", e);
      }
    }

    if (useRag && serverDocuments.length > 0) {
      const summary = serverDocuments.map(d => `• *${d.title}*: ${d.content}`).join('\n\n');
      return `🤖 [Base de Conhecimento]:\n\n${summary}`;
    }
    return "Olá! Sou o assistente virtual integrado. Como posso ajudar?";
  };

  const getFirstMessageNode = (): FlowNode | undefined => {
    if (triggerNode && flow.edges) {
      const startEdge = flow.edges.find(e => e.source === triggerNode.id);
      if (startEdge) {
        const target = flow.nodes.find(n => n.id === startEdge.target);
        if (target) return target;
      }
    }
    return flow.nodes.find(n => n.type === 'messageNode' || n.data?.type === 'message') || flow.nodes[1] || flow.nodes[0];
  };

  // State Machine Loop
  let currentNode: FlowNode | undefined = undefined;

  // Evaluate user response if waiting at a node
  if (session.lastNodeId && flow.edges && flow.edges.length > 0) {
    const lastNode = flow.nodes.find(n => n.id === session.lastNodeId);
    
    if (lastNode && (lastNode.type === 'questionNode' || lastNode.data?.type === 'question')) {
      const varName = lastNode.data?.variableName || 'resposta';
      session.variables[varName] = userText;
      const nextEdge = flow.edges.find(e => e.source === lastNode.id);
      if (nextEdge) currentNode = flow.nodes.find(n => n.id === nextEdge.target);
    } 
    else if (lastNode && (lastNode.type === 'messageNode' || lastNode.data?.type === 'message')) {
      // Find matching edge based on quick reply options
      const outgoingEdges = flow.edges.filter(e => e.source === session.lastNodeId);
      if (outgoingEdges.length > 0) {
        for (let i = 0; i < outgoingEdges.length; i++) {
          const edge = outgoingEdges[i];
          const edgeLabel = (edge.label || '').trim().toLowerCase();
          const optionIndexStr = (i + 1).toString();
          const isMatch = (edgeLabel && cleanText === edgeLabel) || (edgeLabel && cleanText.includes(edgeLabel)) ||
                          cleanText === optionIndexStr || cleanText.startsWith(`${optionIndexStr}.`) ||
                          cleanText.startsWith(`${optionIndexStr} `) || cleanText.startsWith(`${optionIndexStr}-`);
          if (isMatch) {
            currentNode = flow.nodes.find(n => n.id === edge.target);
            break;
          }
        }
      }
    }
    else if (lastNode && (lastNode.type === 'aiNode' || lastNode.data?.type === 'ai_llm')) {
       // Stay in AI node unless triggered out. We return directly.
       return await executeAINode(lastNode, userText);
    }
  }

  // If no currentNode was determined by previous answer, check trigger
  if (!currentNode) {
     currentNode = getFirstMessageNode();
  }

  // Traverse the flow automatically for non-blocking nodes
  let outputText = [];
  
  while (currentNode) {
    session.lastNodeId = currentNode.id;
    const type = currentNode.type.replace('Node', '') || currentNode.data?.type;

    if (type === 'message') {
      outputText.push(formatMessageNodeResponse(currentNode, session.variables));
      break; // Message waits for next input if it has quick replies, or we just pause here.
             // Usually, message nodes wait for input. Let's stop traversal.
    } 
    else if (type === 'question') {
      outputText.push(currentNode.data?.messageText || 'Por favor, responda:');
      break; // Wait for answer
    }
    else if (type === 'ai_llm' || type === 'aiNode') {
      outputText.push(await executeAINode(currentNode, userText));
      break; // Wait for answer
    }
    else if (type === 'handover') {
      session.isPaused = true;
      outputText.push(`🎧 Atendimento transferido para a fila de ${currentNode.data?.targetDepartment || 'Atendente Humano'}. Um atendente responderá em breve!`);
      break;
    }
    else if (type === 'condition') {
      const vName = currentNode.data?.conditionVariable || '';
      const vOp = currentNode.data?.conditionOperator || 'contains';
      const vVal = currentNode.data?.conditionValue || '';
      const actualVal = session.variables[vName] || '';
      
      let matched = false;
      if (vOp === 'equals') matched = actualVal.toLowerCase() === vVal.toLowerCase();
      if (vOp === 'contains') matched = actualVal.toLowerCase().includes(vVal.toLowerCase());
      if (vOp === 'not_empty') matched = actualVal.trim().length > 0;
      
      // Find edge for true or false
      const edges = flow.edges.filter(e => e.source === currentNode?.id);
      const targetEdge = edges.find(e => {
         const lbl = (e.label || '').toLowerCase();
         if (matched && (lbl === 'true' || lbl === 'sim' || lbl === 'yes')) return true;
         if (!matched && (lbl === 'false' || lbl === 'não' || lbl === 'nao' || lbl === 'no')) return true;
         return false;
      }) || edges[0]; // fallback
      
      if (targetEdge) {
        currentNode = flow.nodes.find(n => n.id === targetEdge.target);
        continue;
      } else {
        break;
      }
    }
    else if (type === 'database') {
       const action = currentNode.data?.dbAction;
       if (action === 'save_contact') {
          contactsDB.upsert({
             id: `ct-${Date.now()}`,
             phone: session.variables['phone'],
             name: session.variables['nome'] || session.variables['name'] || '',
             cpf: session.variables['cpf'] || '',
             email: session.variables['email'] || '',
             customFields: session.variables,
             createdAt: new Date().toISOString()
          });
       } else if (action === 'query_contact') {
          const contact = contactsDB.find(c => c.phone === session.variables['phone']);
          if (contact) {
             session.variables['is_registered'] = 'true';
             session.variables['nome'] = contact.name || '';
          } else {
             session.variables['is_registered'] = 'false';
          }
       }
       // Auto-advance
       const nextEdge = flow.edges.find(e => e.source === currentNode?.id);
       if (nextEdge) {
         currentNode = flow.nodes.find(n => n.id === nextEdge.target);
         continue;
       } else {
         break;
       }
    }
    else if (type === 'schedule') {
       appointmentsDB.upsert({
          id: `apt-${Date.now()}`,
          contactId: session.variables['phone'],
          date: session.variables['data'] || new Date().toISOString(),
          service: currentNode.data?.serviceName || 'Atendimento',
          status: 'scheduled',
          createdAt: new Date().toISOString()
       });
       // Auto-advance
       const nextEdge = flow.edges.find(e => e.source === currentNode?.id);
       if (nextEdge) {
         currentNode = flow.nodes.find(n => n.id === nextEdge.target);
         continue;
       } else {
         break;
       }
    }
    else {
      // For any other unknown node, try to advance
      const nextEdge = flow.edges.find(e => e.source === currentNode?.id);
      if (nextEdge) {
        currentNode = flow.nodes.find(n => n.id === nextEdge.target);
        continue;
      } else {
        break;
      }
    }
  }

  return outputText.join('\n\n') || "Mensagem processada.";
}
