const fs = require('fs');

let content = fs.readFileSync('server/flowEngine.ts', 'utf-8');

const newFunc = `
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
    const fullSystemPrompt = \`\${systemPrompt}\${ragContext}\`;

    const ai = getAIClient();
    if (ai) {
      try {
        const aiPromise = ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: \`\${fullSystemPrompt}\\n\\nPergunta do Cliente: "\${queryText}"\\nResposta:\`,
        });
        const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000));
        const resp: any = await Promise.race([aiPromise, timeoutPromise]);
        if (resp && resp.text) return resp.text;
      } catch (e) {
        console.error("AI Node error:", e);
      }
    }

    if (useRag && serverDocuments.length > 0) {
      const summary = serverDocuments.map(d => \`• *\${d.title}*: \${d.content}\`).join('\\n\\n');
      return \`🤖 [Base de Conhecimento]:\\n\\n\${summary}\`;
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
                          cleanText === optionIndexStr || cleanText.startsWith(\`\${optionIndexStr}.\`) ||
                          cleanText.startsWith(\`\${optionIndexStr} \`) || cleanText.startsWith(\`\${optionIndexStr}-\`);
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
      outputText.push(\`🎧 Atendimento transferido para a fila de \${currentNode.data?.targetDepartment || 'Atendente Humano'}. Um atendente responderá em breve!\`);
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
             id: \`ct-\${Date.now()}\`,
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
          id: \`apt-\${Date.now()}\`,
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

  return outputText.join('\\n\\n') || "Mensagem processada.";
}
`;

const startIndex = content.indexOf('export async function processFlowIncomingMessage');
const updatedContent = content.substring(0, startIndex) + newFunc;

fs.writeFileSync('server/flowEngine.ts', updatedContent);
console.log('Update successful!');
