import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  Bot, 
  User, 
  Smartphone, 
  Sparkles, 
  RefreshCw, 
  Zap,
  CheckCheck
} from 'lucide-react';
import { ChatFlow, ChannelType, Message } from '../../types';

interface FlowSimulatorModalProps {
  flow: ChatFlow;
  isOpen: boolean;
  onClose: () => void;
  theme?: 'dark' | 'light';
}

export const FlowSimulatorModal: React.FC<FlowSimulatorModalProps> = ({
  flow,
  isOpen,
  onClose,
  theme = 'dark'
}) => {
  if (!isOpen) return null;

  const isDark = theme === 'dark';

  const [simChannel, setSimChannel] = useState<ChannelType>(flow.channel === 'all' ? 'whatsapp' : flow.channel);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [capturedVariables, setCapturedVariables] = useState<Record<string, string>>({});
  const [waitingForInputVar, setWaitingForInputVar] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Advance through a single node and its cascade
  const executeSingleNode = async (nodeId: string, currentVars: Record<string, string>, userMsgText?: string) => {
    const targetNode = flow.nodes.find(n => n.id === nodeId);
    if (!targetNode) return;

    setCurrentNodeId(targetNode.id);
    const data = targetNode.data;

    // Handle Message Node
    if (targetNode.type === 'messageNode') {
      setIsTyping(true);
      await new Promise(res => setTimeout(res, 600));
      setIsTyping(false);

      let interpolatedText = data.messageText || '';
      Object.entries(currentVars).forEach(([k, v]) => {
        interpolatedText = interpolatedText.replace(new RegExp(`{${k}}`, 'g'), v);
      });

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: 'bot',
        text: interpolatedText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        channel: simChannel,
        options: data.quickReplies
      }]);

      const outgoingEdges = flow.edges.filter(e => e.source === targetNode.id);
      // If node has quickReplies or multiple branching edges, halt and wait for user selection
      if ((data.quickReplies && data.quickReplies.length > 0) || outgoingEdges.length > 1) {
        return;
      }

      // If exactly one simple outgoing edge with no quick replies, continue
      if (outgoingEdges.length === 1 && (!outgoingEdges[0].label || outgoingEdges[0].label.trim() === '')) {
        await executeSingleNode(outgoingEdges[0].target, currentVars, userMsgText);
      }
    }

    // Handle Question Node (Halts and waits for user input)
    else if (targetNode.type === 'questionNode') {
      setIsTyping(true);
      await new Promise(res => setTimeout(res, 600));
      setIsTyping(false);

      let questionText = data.messageText || 'Por favor, responda:';
      Object.entries(currentVars).forEach(([k, v]) => {
        questionText = questionText.replace(new RegExp(`{${k}}`, 'g'), v);
      });

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: 'bot',
        text: questionText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        channel: simChannel
      }]);

      setWaitingForInputVar(data.variableName || 'user_response');
      return; // Halt flow until input is submitted
    }

    // Handle AI Node (Llama / Gemini generation)
    else if (targetNode.type === 'aiNode') {
      setIsTyping(true);
      try {
        const prompt = userMsgText || 'Olá assistente';
        const res = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt,
            provider: data.aiProvider || 'local_llama',
            model: data.modelName,
            systemPrompt: data.systemPrompt || 'Você é um assistente prestativo.'
          })
        });
        const resData = await res.json();
        setIsTyping(false);

        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          sender: 'bot',
          text: `✨ [${data.aiProvider === 'gemini' ? 'Gemini AI' : 'Llama 3.2 AI'}]:\n${resData.text || 'Desculpe, não consegui processar a resposta de IA.'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          channel: simChannel
        }]);
      } catch {
        setIsTyping(false);
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          sender: 'bot',
          text: '✨ [IA Offline]: Olá! Estou processando localmente via base institucional da SAGI.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          channel: simChannel
        }]);
      }
      
      const outgoing = flow.edges.filter(e => e.source === targetNode.id);
      if (outgoing.length > 0) {
        await executeSingleNode(outgoing[0].target, currentVars, userMsgText);
      }
    }

    // Handle Schedule Node
    else if (targetNode.type === 'scheduleNode') {
      setIsTyping(true);
      await new Promise(res => setTimeout(res, 500));
      setIsTyping(false);

      const msg = data.messageText || `📅 [Agendamento Confirmado]: Solicitação de reunião para "${data.serviceName || 'Atendimento Técnico'}" registrada com sucesso!`;
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: 'bot',
        text: msg,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        channel: simChannel,
        options: ['Voltar ao menu inicial']
      }]);

      const outgoing = flow.edges.filter(e => e.source === targetNode.id);
      if (outgoing.length === 1 && !outgoing[0].label) {
        await executeSingleNode(outgoing[0].target, currentVars, userMsgText);
      }
    }

    // Handle Database Node
    else if (targetNode.type === 'databaseNode') {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: 'bot',
        text: `💾 [Sistema]: Registro de contato e solicitação atualizado no banco de dados.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        channel: simChannel
      }]);
      const outgoing = flow.edges.filter(e => e.source === targetNode.id);
      if (outgoing.length > 0) {
        await executeSingleNode(outgoing[0].target, currentVars, userMsgText);
      }
    }

    // Handle Delay Node
    else if (targetNode.type === 'delayNode') {
      setIsTyping(true);
      const delaySeconds = Math.min(data.delaySeconds || 2, 4);
      await new Promise(res => setTimeout(res, delaySeconds * 1000));
      setIsTyping(false);
      const outgoing = flow.edges.filter(e => e.source === targetNode.id);
      if (outgoing.length > 0) {
        await executeSingleNode(outgoing[0].target, currentVars, userMsgText);
      }
    }

    // Handle Condition Node
    else if (targetNode.type === 'conditionNode') {
      const varName = data.conditionVariable || '';
      const varValue = (currentVars[varName] || userMsgText || '').toLowerCase();
      const expectedValue = (data.conditionValue || '').toLowerCase();

      let isMatch = false;
      if (data.conditionOperator === 'equals') isMatch = varValue === expectedValue;
      else if (data.conditionOperator === 'contains') isMatch = varValue.includes(expectedValue);
      else if (data.conditionOperator === 'not_empty') isMatch = varValue.trim().length > 0;

      const branchEdges = flow.edges.filter(e => e.source === targetNode.id);
      const matchedEdge = branchEdges.find(e => isMatch ? (e.sourceHandle === 'true' || !e.sourceHandle) : e.sourceHandle === 'false');
      
      if (matchedEdge) {
        await executeSingleNode(matchedEdge.target, currentVars, userMsgText);
      }
    }

    // Handle Tag Node
    else if (targetNode.type === 'tagNode') {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: 'bot',
        text: `🏷️ [Sistema]: Etiqueta "${data.tagName || 'Nova Tag'}" adicionada ao contato.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        channel: simChannel
      }]);
      const outgoing = flow.edges.filter(e => e.source === targetNode.id);
      if (outgoing.length > 0) {
        await executeSingleNode(outgoing[0].target, currentVars, userMsgText);
      }
    }

    // Handle Handover Node
    else if (targetNode.type === 'handoverNode') {
      setIsTyping(true);
      await new Promise(res => setTimeout(res, 500));
      setIsTyping(false);

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: 'bot',
        text: `👤 [Transferência de Atendimento]: Sua solicitação foi transferida para a equipe de *${data.targetDepartment || 'um atendente humano'}*.\n\nUm técnico responderá em breve!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        channel: simChannel,
        options: ['Voltar ao menu inicial']
      }]);
      return; // Ends bot automated flow
    }

    // Default cascade for triggers
    else if (targetNode.type === 'triggerNode') {
      const outgoing = flow.edges.filter(e => e.source === targetNode.id);
      if (outgoing.length > 0) {
        await executeSingleNode(outgoing[0].target, currentVars, userMsgText);
      }
    }
  };

  const handleRestart = () => {
    setMessages([]);
    setCapturedVariables({});
    setWaitingForInputVar(null);
    setCurrentNodeId(null);

    // Initial greeting
    const startTrigger = flow.nodes.find(n => n.type === 'triggerNode');
    if (startTrigger) {
      executeSingleNode(startTrigger.id, {});
    } else {
      setMessages([{
        id: '1',
        sender: 'bot',
        text: '👋 Olá! Simulação iniciada. Envie uma mensagem como "oi" ou "menu" para ativar o fluxo.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        channel: simChannel
      }]);
    }
  };

  useEffect(() => {
    handleRestart();
  }, [flow, simChannel]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || userInput).trim();
    if (!text) return;

    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      channel: simChannel
    };

    setMessages(prev => [...prev, userMsg]);
    setUserInput('');

    // 1. If waiting for variable input
    if (waitingForInputVar && currentNodeId) {
      const updatedVars = {
        ...capturedVariables,
        [waitingForInputVar]: text
      };
      setCapturedVariables(updatedVars);
      setWaitingForInputVar(null);

      const outgoing = flow.edges.filter(e => e.source === currentNodeId);
      if (outgoing.length > 0) {
        await executeSingleNode(outgoing[0].target, updatedVars, text);
      }
      return;
    }

    const clean = text.toLowerCase();

    // Check for global restart keywords
    if (['menu', 'iniciar', 'voltar ao menu inicial', 'voltar', 'recomeçar', 'recomecar', 'inicio', 'início'].includes(clean)) {
      const menuNode = flow.nodes.find(n => n.id === 'sagi-node-menu' || n.id.includes('menu')) || flow.nodes.find(n => n.type === 'messageNode');
      if (menuNode) {
        await executeSingleNode(menuNode.id, capturedVariables, text);
        return;
      }
    }

    // 2. If at a current node with outgoing branches
    if (currentNodeId) {
      const outgoingEdges = flow.edges.filter(e => e.source === currentNodeId);

      if (outgoingEdges.length > 0) {
        // Try finding matching edge
        let matchedEdge = outgoingEdges.find((edge, idx) => {
          const lbl = (edge.label || '').toLowerCase();
          const targetNode = flow.nodes.find(n => n.id === edge.target);
          const targetLabel = (targetNode?.data?.label || '').toLowerCase();
          const optIndex = (idx + 1).toString();

          return (
            (lbl && (clean === lbl || clean.includes(lbl) || lbl.includes(clean))) ||
            (targetLabel && (clean.includes(targetLabel) || targetLabel.includes(clean))) ||
            clean === optIndex ||
            clean.startsWith(`${optIndex}.`) ||
            clean.startsWith(`${optIndex} `) ||
            clean.startsWith(`${optIndex}-`)
          );
        });

        // If user clicked a quick reply text
        if (!matchedEdge) {
          const currentNode = flow.nodes.find(n => n.id === currentNodeId);
          const replies = currentNode?.data?.quickReplies || [];
          const replyIdx = replies.findIndex(r => r.toLowerCase().includes(clean) || clean.includes(r.toLowerCase()));
          if (replyIdx >= 0 && outgoingEdges[replyIdx]) {
            matchedEdge = outgoingEdges[replyIdx];
          }
        }

        if (matchedEdge) {
          await executeSingleNode(matchedEdge.target, capturedVariables, text);
          return;
        }
      }
    }

    // 3. Check trigger keywords
    const matchingTrigger = flow.nodes.find(n => {
      if (n.type !== 'triggerNode') return false;
      const keywords = n.data.keywords || [];
      if (n.data.triggerType === 'keyword') {
        return keywords.some(k => clean.includes(k.toLowerCase()));
      }
      return true;
    });

    if (matchingTrigger) {
      await executeSingleNode(matchingTrigger.id, capturedVariables, text);
    } else {
      // Fallback
      setIsTyping(true);
      await new Promise(res => setTimeout(res, 500));
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: 'bot',
        text: '🤖 Não compreendi essa opção. Por favor, selecione uma das opções acima ou digite "menu" para retornar ao início.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        channel: simChannel,
        options: ['Voltar ao menu inicial']
      }]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className={`w-full max-w-4xl h-[620px] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row border transition-colors ${
        isDark ? 'bg-[#0A0A0B] border-white/10 text-slate-300' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        
        {/* Left Side: Phone Chat Simulator */}
        <div className={`flex-1 flex flex-col border-r ${
          isDark ? 'bg-[#050505] border-white/5' : 'bg-slate-50 border-slate-200'
        }`}>
          {/* Header */}
          <div className={`p-3.5 flex items-center justify-between border-b ${
            isDark ? 'bg-[#141417] text-white border-white/5' : 'bg-white text-slate-900 border-slate-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs leading-tight">BotFlow Simulator ({flow.name})</h4>
                <div className={`flex items-center gap-2 text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Em execução
                  </span>
                  <span>•</span>
                  <span>Canal: {simChannel.toUpperCase()}</span>
                </div>
              </div>
            </div>

            {/* Channel Switcher */}
            <div className={`flex items-center gap-1 p-1 rounded-lg border ${
              isDark ? 'bg-white/5 border-white/5' : 'bg-slate-100 border-slate-200'
            }`}>
              <button 
                onClick={() => setSimChannel('whatsapp')}
                className={`text-[11px] px-2.5 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${simChannel === 'whatsapp' ? 'bg-emerald-600 text-white' : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
              >
                WhatsApp
              </button>
              <button 
                onClick={() => setSimChannel('telegram')}
                className={`text-[11px] px-2.5 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${simChannel === 'telegram' ? 'bg-sky-600 text-white' : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Telegram
              </button>
              <button 
                onClick={() => setSimChannel('instagram')}
                className={`text-[11px] px-2.5 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${simChannel === 'instagram' ? 'bg-pink-600 text-white' : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Instagram
              </button>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className={`flex-1 p-4 overflow-y-auto space-y-3 ${
            isDark 
              ? 'bg-[#0A0A0B] bg-[radial-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:16px_16px]' 
              : 'bg-slate-100/70 bg-[radial-gradient(rgba(0,0,0,0.05)_1px,transparent_1px)] [background-size:16px_16px]'
          }`}>
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-3 text-xs shadow-xs ${
                    m.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : isDark
                        ? 'bg-[#141417] text-slate-200 border border-white/10 rounded-tl-none'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-xs'
                  }`}
                >
                  <p className="whitespace-pre-line">{m.text}</p>
                  
                  {/* Options / Quick Reply Buttons */}
                  {m.options && m.options.length > 0 && (
                    <div className={`mt-2.5 pt-2 flex flex-col gap-1.5 border-t ${
                      isDark ? 'border-white/10' : 'border-slate-200'
                    }`}>
                      {m.options.map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => handleSendMessage(opt)}
                          className="w-full text-left bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-300 font-medium px-3 py-1.5 rounded-lg border border-blue-500/20 transition-colors text-xs flex items-center justify-between cursor-pointer"
                        >
                          <span>{opt}</span>
                          <span className="text-[10px] text-blue-500 font-normal">Enviar ➔</span>
                        </button>
                      ))}
                    </div>
                  )}

                  <div className={`text-[9px] mt-1 text-right flex items-center justify-end gap-1 ${
                    m.sender === 'user' ? 'text-blue-200' : isDark ? 'text-slate-500' : 'text-slate-400'
                  }`}>
                    <span>{m.timestamp}</span>
                    {m.sender === 'user' && <CheckCheck className="w-3 h-3 text-blue-200" />}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className={`flex items-center gap-1.5 border p-2.5 rounded-xl w-fit text-xs shadow-xs ${
                isDark ? 'bg-[#141417] border-white/10 text-slate-400' : 'bg-white border-slate-200 text-slate-500'
              }`}>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-300"></span>
                <span className="text-[11px] ml-1">Bot digitando...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className={`p-3 border-t flex items-center gap-2 ${
            isDark ? 'bg-[#141417] border-white/5' : 'bg-white border-slate-200'
          }`}>
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={waitingForInputVar ? `Digite o valor para {${waitingForInputVar}}...` : 'Digite uma mensagem...'}
              className={`flex-1 px-3.5 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark ? 'bg-[#0A0A0B] text-white border-white/10' : 'bg-slate-100 text-slate-900 border-slate-300'
              }`}
            />
            <button
              onClick={() => handleSendMessage()}
              className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Side: Debug & Variables Inspector Panel */}
        <div className={`w-full md:w-72 p-4 border-l flex flex-col justify-between ${
          isDark ? 'bg-[#0A0A0B] border-white/5' : 'bg-slate-50 border-slate-200'
        }`}>
          <div>
            <div className={`flex items-center justify-between pb-3 border-b mb-4 ${
              isDark ? 'border-white/5' : 'border-slate-200'
            }`}>
              <h4 className={`font-bold text-xs flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <Zap className="w-4 h-4 text-amber-500" /> Painel de Depuração
              </h4>
              <button 
                onClick={handleRestart}
                className={`p-1 rounded text-[11px] flex items-center gap-1 cursor-pointer transition-colors ${
                  isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
                }`}
                title="Reiniciar Simulação"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Current Node Execution Status */}
            <div className={`p-3 rounded-xl border mb-4 shadow-xs ${
              isDark ? 'bg-[#141417] border-white/5' : 'bg-white border-slate-200'
            }`}>
              <span className={`text-[10px] font-medium block uppercase tracking-wider mb-1 ${
                isDark ? 'text-slate-500' : 'text-slate-400'
              }`}>Nó Atual Executado</span>
              <span className="font-mono text-xs text-purple-600 dark:text-purple-400 font-semibold bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 block truncate">
                {currentNodeId || 'start_trigger'}
              </span>
            </div>

            {/* Captured Variables State */}
            <div className={`p-3 rounded-xl border shadow-xs ${
              isDark ? 'bg-[#141417] border-white/5' : 'bg-white border-slate-200'
            }`}>
              <span className={`text-[10px] font-medium block uppercase tracking-wider mb-2 ${
                isDark ? 'text-slate-500' : 'text-slate-400'
              }`}>Variáveis Capturadas</span>
              {Object.keys(capturedVariables).length === 0 ? (
                <p className="text-slate-500 text-[11px] italic">Nenhuma variável coletada ainda.</p>
              ) : (
                <div className="space-y-1.5">
                  {Object.entries(capturedVariables).map(([key, val]) => (
                    <div key={key} className={`flex items-center justify-between text-xs p-1.5 rounded border ${
                      isDark ? 'bg-[#0A0A0B] border-white/5' : 'bg-slate-100 border-slate-200'
                    }`}>
                      <span className="font-mono text-[11px] text-violet-600 dark:text-violet-400 font-medium">{`{${key}}`}</span>
                      <span className={`font-semibold truncate max-w-[110px] ${isDark ? 'text-white' : 'text-slate-900'}`}>{val}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className={`pt-4 border-t flex items-center justify-between ${
            isDark ? 'border-white/5' : 'border-slate-200'
          }`}>
            <span className={`text-[11px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Testador BotFlow</span>
            <button
              onClick={onClose}
              className={`text-xs font-bold px-4 py-1.5 rounded-lg cursor-pointer transition-colors ${
                isDark ? 'bg-white text-black hover:bg-slate-200' : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              Fechar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
