import { ChatFlow, Contact, Message, KnowledgeDocument } from '../types';

export interface FlowExecutionResult {
  botMessages: Message[];
  updatedVariables: Record<string, string>;
  updatedTags: string[];
  isBotActive: boolean;
  funnelStage?: string;
}

/**
 * Evaluates a ChatFlow starting from a trigger node or keyword match for a specific contact.
 */
export async function executeFlowForContact(
  flow: ChatFlow,
  contact: Contact,
  userMessageText?: string,
  documents?: KnowledgeDocument[]
): Promise<FlowExecutionResult> {
  const botMessages: Message[] = [];
  let updatedVariables = { ...(contact.variables || {}) };
  let updatedTags = [...(contact.tags || [])];
  let isBotActive = contact.isBotActive;
  let funnelStage: 'Novo Lead' | 'Em Atendimento' | 'Proposta Enviada' | 'Convertido' | 'Handover Humano' | undefined = contact.funnelStage;

  // Find start trigger node
  let triggerNode = flow.nodes.find(n => {
    if (n.type !== 'triggerNode') return false;
    if (!userMessageText) return true;
    const keywords = n.data.keywords || [];
    if (keywords.length === 0) return true;
    return keywords.some(k => userMessageText.toLowerCase().includes(k.toLowerCase()));
  }) || flow.nodes.find(n => n.type === 'triggerNode');

  if (!triggerNode && flow.nodes.length > 0) {
    triggerNode = flow.nodes[0];
  }

  if (!triggerNode) {
    return { botMessages, updatedVariables, updatedTags, isBotActive, funnelStage };
  }

  // Traversal of edges
  let currentNodeId: string | null = triggerNode.id;
  const visited = new Set<string>();

  while (currentNodeId && !visited.has(currentNodeId)) {
    visited.add(currentNodeId);

    const outgoingEdges = flow.edges.filter(e => e.source === currentNodeId);
    if (outgoingEdges.length === 0) break;

    const nextEdge = outgoingEdges[0]; // Primary path
    const targetNode = flow.nodes.find(n => n.id === nextEdge.target);

    if (!targetNode) break;

    const data = targetNode.data;

    // 1. Message Node
    if (targetNode.type === 'messageNode') {
      let interpolatedText = data.messageText || 'Mensagem do Fluxo';
      Object.entries(updatedVariables).forEach(([k, v]) => {
        interpolatedText = interpolatedText.replace(new RegExp(`{{${k}}}`, 'g'), v);
        interpolatedText = interpolatedText.replace(new RegExp(`{${k}}`, 'g'), v);
      });
      interpolatedText = interpolatedText.replace(/{{nome}}/g, contact.name || 'Cliente');

      botMessages.push({
        id: `bot-flow-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        sender: 'bot',
        text: interpolatedText,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        channel: contact.channel || 'whatsapp',
        options: data.quickReplies,
        intentDetected: `Fluxo: ${flow.name}`
      });

      currentNodeId = targetNode.id;
    } 
    // 2. Question Node
    else if (targetNode.type === 'questionNode') {
      let qText = data.messageText || 'Por favor, informe seus dados:';
      botMessages.push({
        id: `bot-flow-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        sender: 'bot',
        text: qText,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        channel: contact.channel || 'whatsapp',
        intentDetected: `Pergunta do Fluxo: ${data.variableName || 'Var'}`
      });
      // Stop execution waiting for user reply
      break;
    }
    // 3. AI Node
    else if (targetNode.type === 'aiNode') {
      try {
        let ragContext = `Cliente: ${contact.name}`;
        if (data.useKnowledgeBase !== false && documents && documents.length > 0) {
          ragContext += `\n\n=== BASE DE CONHECIMENTO DA EMPRESA (RAG) ===\n` +
            documents.map((d, i) => `[Artigo ${i + 1}] ${d.title}\nCategoria: ${d.category}\nConteúdo: ${d.content}`).join('\n\n') +
            `\n=============================================\nInstrução RAG: Utilize as informações da Base de Conhecimento acima para responder.`;
        }

        const response = await fetch('/api/ai/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: userMessageText || 'Atendimento automatizado',
            systemPrompt: data.systemPrompt || 'Responda cordialmente.',
            provider: data.aiProvider || 'gemini',
            model: data.modelName || 'gemini-2.5-flash',
            knowledgeContext: ragContext
          })
        });
        const json = await response.json();
        botMessages.push({
          id: `bot-ai-${Date.now()}`,
          sender: 'bot',
          text: `🤖 ${json.text || 'Olá! Como posso te ajudar hoje?'}`,
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          channel: contact.channel || 'whatsapp',
          intentDetected: `IA (${data.aiProvider || 'Gemini'})`
        });
      } catch (err) {
        botMessages.push({
          id: `bot-ai-err-${Date.now()}`,
          sender: 'bot',
          text: `🤖 Olá! Sou o assistente virtual do BotFlow. Como posso auxiliar seu atendimento hoje?`,
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          channel: contact.channel || 'whatsapp'
        });
      }
      currentNodeId = targetNode.id;
    }
    // 4. Tag Node
    else if (targetNode.type === 'tagNode') {
      if (data.tagName && !updatedTags.includes(data.tagName)) {
        updatedTags.push(data.tagName);
      }
      currentNodeId = targetNode.id;
    }
    // 5. Handover Node
    else if (targetNode.type === 'handoverNode') {
      isBotActive = false;
      funnelStage = 'Handover Humano';
      botMessages.push({
        id: `bot-handover-${Date.now()}`,
        sender: 'bot',
        text: `🎧 Robô pausado. Atendimento transferido para a fila de ${data.targetDepartment || 'Atendente Humano'}.`,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        channel: contact.channel || 'whatsapp'
      });
      break;
    }
    else {
      currentNodeId = targetNode.id;
    }
  }

  return {
    botMessages,
    updatedVariables,
    updatedTags,
    isBotActive,
    funnelStage
  };
}
