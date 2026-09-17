import { ChatFlow, Contact, Message, KnowledgeDocument } from '../types';

export interface FlowExecutionResult {
  botMessages: Message[];
  updatedVariables: Record<string, string>;
  updatedTags: string[];
  isBotActive: boolean;
  funnelStage?: string;
  currentNodeId?: string | null;
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
  let funnelStage = contact.funnelStage;
  
  let currentNodeId: string | null = contact.currentNodeId || null;
  let nextNodeId: string | null = null;

  // 1. Determine next step if we are already in a flow
  if (currentNodeId && flow.nodes.find(n => n.id === currentNodeId)) {
    const currentNode = flow.nodes.find(n => n.id === currentNodeId);
    
    // If it was a question node, save the answer
    if (currentNode?.type === 'questionNode' && userMessageText) {
      const varName = currentNode.data.variableName || 'resposta';
      updatedVariables[varName] = userMessageText;
    }

    const outgoingEdges = flow.edges.filter(e => e.source === currentNodeId);
    
    if (outgoingEdges.length > 0) {
      if (outgoingEdges.length === 1) {
        nextNodeId = outgoingEdges[0].target;
      } else if (userMessageText) {
        // Multiple edges (e.g. Menu)
        const textLower = userMessageText.toLowerCase();
        let matchedEdge = null;
        
        for (let i = 0; i < outgoingEdges.length; i++) {
          const edge = outgoingEdges[i];
          if (edge.label && textLower.includes(edge.label.toLowerCase())) {
            matchedEdge = edge;
            break;
          }
          if (textLower.includes(String(i + 1))) {
            matchedEdge = edge;
            break;
          }
        }
        
        if (matchedEdge) {
          nextNodeId = matchedEdge.target;
        } else {
          // Input didn't match any option, stay on current node to retry (we can just stop here)
          return { botMessages, updatedVariables, updatedTags, isBotActive, funnelStage, currentNodeId };
        }
      }
    } else {
      // Flow ended previously, restart
      currentNodeId = null;
    }
  }

  // 2. If no valid continuation, treat as a new trigger
  if (!nextNodeId && (!currentNodeId || !userMessageText)) {
    let triggerNode = flow.nodes.find(n => {
      if (n.type !== 'triggerNode') return false;
      if (!userMessageText) return true;
      const keywords = n.data.keywords || [];
      if (keywords.length === 0) return true;
      return keywords.some(k => userMessageText.toLowerCase().includes(k.toLowerCase()));
    }) || flow.nodes.find(n => n.type === 'triggerNode');
    
    if (triggerNode) {
      nextNodeId = triggerNode.id;
    }
  }

  if (!nextNodeId) {
    return { botMessages, updatedVariables, updatedTags, isBotActive, funnelStage, currentNodeId: null };
  }

  // 3. Traverse from nextNodeId
  const visited = new Set<string>();
  let executingNodeId: string | null = nextNodeId;
  let finalNodeId: string | null = currentNodeId;

  while (executingNodeId && !visited.has(executingNodeId)) {
    visited.add(executingNodeId);
    const targetNode = flow.nodes.find(n => n.id === executingNodeId);
    if (!targetNode) break;
    
    finalNodeId = executingNodeId;
    const data = targetNode.data;
    
    if (targetNode.type === 'triggerNode') {
      // pass
    }
    else if (targetNode.type === 'messageNode') {
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
      
      if (data.quickReplies && data.quickReplies.length > 0) {
         break;
      }
    }
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
      break;
    }
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
    }
    else if (targetNode.type === 'tagNode') {
      if (data.tagName && !updatedTags.includes(data.tagName)) {
        updatedTags.push(data.tagName);
      }
    }
    else if (targetNode.type === 'databaseNode') {
      try {
        if (data.dbAction === 'save_contact') {
          await fetch('/api/contacts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phone: updatedVariables['phone'] || contact.phoneOrHandle || '',
              name: updatedVariables['nome_data'] || updatedVariables['nome'] || contact.name || '',
              customFields: updatedVariables
            })
          });
        }
      } catch (e) {
        console.error('Failed to save contact from simulator', e);
      }
    }
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

    const outgoingEdges = flow.edges.filter(e => e.source === executingNodeId);
    if (outgoingEdges.length === 0) {
      break;
    }
    
    if (outgoingEdges.length > 1) {
       break;
    }

    executingNodeId = outgoingEdges[0].target;
  }

  return {
    botMessages,
    updatedVariables,
    updatedTags,
    isBotActive,
    funnelStage,
    currentNodeId: finalNodeId
  };
}
