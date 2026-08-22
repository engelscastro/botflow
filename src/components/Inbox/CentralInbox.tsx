import React, { useState } from 'react';
import { 
  MessageSquare, 
  Search, 
  Send, 
  Bot, 
  User, 
  Phone, 
  Tag, 
  Sparkles, 
  CheckCheck, 
  PauseCircle, 
  PlayCircle,
  Filter,
  UserCheck,
  Smartphone,
  SendHorizontal,
  Paperclip,
  Smile,
  Zap,
  ChevronLeft,
  Info,
  X
} from 'lucide-react';
import { Contact, Conversation, Message, ChannelType, ChatFlow } from '../../types';

interface CentralInboxProps {
  contacts: Contact[];
  conversations: Record<string, Conversation>;
  flows?: ChatFlow[];
  onSendMessage: (contactId: string, text: string) => void;
  onToggleBotActive: (contactId: string) => void;
  onTriggerFlow?: (contactId: string, flowId: string) => void;
  theme?: 'dark' | 'light';
}

export const CentralInbox: React.FC<CentralInboxProps> = ({
  contacts,
  conversations,
  flows = [],
  onSendMessage,
  onToggleBotActive,
  onTriggerFlow,
  theme = 'dark'
}) => {
  const isDark = theme === 'dark';
  const [selectedContactId, setSelectedContactId] = useState<string>(contacts[0]?.id || '');
  const [filterChannel, setFilterChannel] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [replyText, setReplyText] = useState('');
  const [selectedFlowId, setSelectedFlowId] = useState<string>(flows[0]?.id || '');
  const [showRightDrawer, setShowRightDrawer] = useState<boolean>(false);

  const selectedContact = contacts.find(c => c.id === selectedContactId) || (contacts.length > 0 ? contacts[0] : null);
  const activeConversation = (selectedContact && conversations[selectedContact.id]) || { contactId: selectedContact?.id || '', messages: [] };

  // Filter contacts logic
  const filteredContacts = contacts.filter(c => {
    if (filterChannel !== 'all' && c.channel !== filterChannel) return false;
    if (filterStatus === 'bot_active' && !c.isBotActive) return false;
    if (filterStatus === 'human' && c.isBotActive) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (c.name || '').toLowerCase().includes(q) || 
             (c.phoneOrHandle || '').toLowerCase().includes(q) || 
             (c.lastMessage || '').toLowerCase().includes(q);
    }
    return true;
  });

  const handleSend = () => {
    if (!replyText.trim() || !selectedContactId) return;
    onSendMessage(selectedContactId, replyText);
    setReplyText('');
  };

  const renderChannelBadge = (channel: ChannelType) => {
    if (channel === 'whatsapp') return <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] px-2 py-0.5 rounded font-semibold flex items-center gap-1 shrink-0">💬 WhatsApp</span>;
    if (channel === 'telegram') return <span className="bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 text-[10px] px-2 py-0.5 rounded font-semibold flex items-center gap-1 shrink-0">✈️ Telegram</span>;
    if (channel === 'instagram') return <span className="bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/20 text-[10px] px-2 py-0.5 rounded font-semibold flex items-center gap-1 shrink-0">📸 Instagram</span>;
    return <span className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-[10px] px-2 py-0.5 rounded font-semibold flex items-center gap-1 shrink-0">🌐 Web</span>;
  };

  return (
    <div className={`flex-1 flex w-full h-full overflow-hidden relative transition-colors ${
      isDark ? 'bg-[#050505] text-slate-300' : 'bg-slate-50 text-slate-800'
    }`}>
      
      {/* Left Sidebar: Contact List (Responsive on small screens: hidden when chat is open) */}
      <div className={`w-full md:w-80 border-r flex flex-col h-full shrink-0 transition-all ${
        isDark ? 'bg-[#0A0A0B] border-white/5' : 'bg-white border-slate-200'
      } ${selectedContact && 'hidden md:flex'}`}>
        
        {/* Inbox Header & Search */}
        <div className={`p-4 border-b space-y-3 shrink-0 ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between">
            <h2 className={`font-bold text-base flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <MessageSquare className="w-5 h-5 text-blue-500" /> Painel Unificado
            </h2>
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
              isDark ? 'bg-white/5 text-slate-300 border-white/10' : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}>
              {filteredContacts.length} Conversas
            </span>
          </div>

          <div className="relative">
            <Search className={`w-4 h-4 absolute left-3 top-2.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nome, telefone..."
              className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark 
                  ? 'bg-[#141417] text-white border-white/10 placeholder-slate-500' 
                  : 'bg-slate-50 text-slate-900 border-slate-200 placeholder-slate-400'
              }`}
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs no-scrollbar">
            <button
              onClick={() => setFilterChannel('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors shrink-0 cursor-pointer ${
                filterChannel === 'all' 
                  ? isDark ? 'bg-white text-black font-bold' : 'bg-slate-900 text-white font-bold'
                  : isDark ? 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterChannel('whatsapp')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors shrink-0 cursor-pointer ${
                filterChannel === 'whatsapp' 
                  ? 'bg-emerald-600 text-white font-bold' 
                  : isDark ? 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              WhatsApp
            </button>
            <button
              onClick={() => setFilterChannel('telegram')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors shrink-0 cursor-pointer ${
                filterChannel === 'telegram' 
                  ? 'bg-sky-600 text-white font-bold' 
                  : isDark ? 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              Telegram
            </button>
            <button
              onClick={() => setFilterChannel('instagram')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors shrink-0 cursor-pointer ${
                filterChannel === 'instagram' 
                  ? 'bg-pink-600 text-white font-bold' 
                  : isDark ? 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              Instagram
            </button>
          </div>
        </div>

        {/* Contact List Scroll */}
        <div className={`flex-1 overflow-y-auto divide-y ${isDark ? 'divide-white/5' : 'divide-slate-100'}`}>
          {filteredContacts.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              Nenhuma conversa encontrada com os filtros selecionados.
            </div>
          ) : (
            filteredContacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => setSelectedContactId(contact.id)}
                className={`p-3.5 cursor-pointer transition-all flex items-start gap-3 relative ${
                  isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'
                } ${
                  selectedContactId === contact.id 
                    ? isDark 
                      ? 'bg-blue-500/10 border-l-2 border-blue-500' 
                      : 'bg-blue-50/80 border-l-2 border-blue-500'
                    : ''
                }`}
              >
                <div className="relative shrink-0">
                  <img
                    src={contact.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'}
                    alt={contact.name}
                    className={`w-10 h-10 rounded-full object-cover border ${isDark ? 'border-white/10' : 'border-slate-200'}`}
                  />
                  {contact.isBotActive ? (
                    <span className={`absolute -bottom-1 -right-1 bg-purple-600 text-white p-0.5 rounded-full ring-2 ${isDark ? 'ring-[#0A0A0B]' : 'ring-white'}`} title="Bot Ativo">
                      <Bot className="w-3 h-3" />
                    </span>
                  ) : (
                    <span className={`absolute -bottom-1 -right-1 bg-blue-600 text-white p-0.5 rounded-full ring-2 ${isDark ? 'ring-[#0A0A0B]' : 'ring-white'}`} title="Atendente Humano">
                      <UserCheck className="w-3 h-3" />
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h4 className={`font-bold text-xs truncate max-w-[150px] ${isDark ? 'text-white' : 'text-slate-900'}`}>{contact.name}</h4>
                    <span className={`text-[10px] font-medium shrink-0 ml-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{contact.lastMessageTime}</span>
                  </div>
                  <p className={`text-xs truncate mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{contact.lastMessage}</p>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {renderChannelBadge(contact.channel)}
                    {contact.unreadCount > 0 && (
                      <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                        {contact.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Center: Conversation Active View */}
      {selectedContact ? (
        <div className={`flex-1 flex flex-col h-full min-w-0 overflow-hidden relative ${
          isDark ? 'bg-[#050505]' : 'bg-slate-100/60'
        }`}>
          
          {/* Active Chat Header */}
          <div className={`border-b px-4 py-3 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 shrink-0 z-10 ${
            isDark ? 'bg-[#0A0A0B] border-white/5' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
              {/* Back button on mobile */}
              <button
                onClick={() => setSelectedContactId('')}
                className={`md:hidden p-1.5 rounded-lg transition-colors shrink-0 ${
                  isDark ? 'bg-white/5 hover:bg-white/10 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
                title="Voltar para lista de conversas"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <img
                src={selectedContact.avatar}
                alt={selectedContact.name}
                className={`w-10 h-10 rounded-full object-cover border shrink-0 hidden sm:block ${
                  isDark ? 'border-white/10' : 'border-slate-200'
                }`}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-nowrap">
                  <h3 className={`font-bold text-sm truncate max-w-[120px] sm:max-w-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedContact.name}</h3>
                  {renderChannelBadge(selectedContact.channel)}
                </div>
                <span className={`text-xs font-mono block truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{selectedContact.phoneOrHandle}</span>
              </div>
            </div>

            {/* Actions: Flow Trigger, Toggle Bot & Info Drawer */}
            <div className="flex items-center gap-2 justify-between sm:justify-end w-full sm:w-auto shrink-0">
              {flows.length > 0 && onTriggerFlow && (
                <div className={`flex items-center gap-1.5 p-1 rounded-xl shrink-0 border ${
                  isDark ? 'bg-[#141417] border-purple-500/30' : 'bg-slate-100 border-purple-200'
                }`}>
                  <select
                    value={selectedFlowId || flows[0]?.id}
                    onChange={(e) => setSelectedFlowId(e.target.value)}
                    className={`text-xs px-2 py-1 rounded-lg border font-medium max-w-[100px] md:max-w-[130px] lg:max-w-[170px] truncate focus:outline-none focus:ring-1 focus:ring-purple-500 ${
                      isDark ? 'bg-[#0A0A0B] text-slate-200 border-white/10' : 'bg-white text-slate-800 border-slate-200'
                    }`}
                  >
                    {flows.map(f => (
                      <option key={f.id} value={f.id}>
                        ⚡ {f.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => {
                      const fId = selectedFlowId || flows[0]?.id;
                      if (fId && selectedContact) {
                        onTriggerFlow(selectedContact.id, fId);
                      }
                    }}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs p-1 sm:px-2.5 sm:py-1 rounded-lg flex items-center gap-1.5 transition-all shadow-xs cursor-pointer shrink-0"
                    title="Disparar este fluxo de automação para este contato agora"
                  >
                    <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                    <span className="hidden xl:inline">Disparar Fluxo</span>
                  </button>
                </div>
              )}

              <button
                onClick={() => onToggleBotActive(selectedContact.id)}
                className={`text-xs font-bold p-1.5 sm:px-3 sm:py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shrink-0 border ${
                  selectedContact.isBotActive
                    ? isDark 
                      ? 'bg-purple-600/20 border-purple-500/40 text-purple-300 hover:bg-purple-600/30'
                      : 'bg-purple-50 border-purple-300 text-purple-700 hover:bg-purple-100'
                    : isDark 
                      ? 'bg-amber-600/20 border-amber-500/40 text-amber-300 hover:bg-amber-600/30'
                      : 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100'
                }`}
                title={selectedContact.isBotActive ? 'Pausar bot e assumir atendimento' : 'Reativar bot automático'}
              >
                {selectedContact.isBotActive ? (
                  <>
                    <Bot className="w-3.5 h-3.5 text-purple-500" />
                    <span className="hidden sm:inline">Bot Ativo</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-3.5 h-3.5 text-amber-500" />
                    <span className="hidden sm:inline">Humano</span>
                  </>
                )}
              </button>

              {/* Toggle Details Panel Button */}
              <button
                onClick={() => setShowRightDrawer(!showRightDrawer)}
                className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer lg:hidden ${
                  showRightDrawer 
                    ? 'bg-blue-600 text-white border-blue-500' 
                    : isDark 
                      ? 'bg-[#141417] text-slate-300 border-white/10 hover:bg-white/10' 
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
                title="Ver dados do contato e variáveis"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className={`flex-1 p-4 md:p-5 overflow-y-auto space-y-3 min-h-0 ${
            isDark 
              ? 'bg-[#0A0A0B] bg-[radial-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:20px_20px]' 
              : 'bg-slate-50 bg-[radial-gradient(rgba(0,0,0,0.05)_1px,transparent_1px)] [background-size:20px_20px]'
          }`}>
            {activeConversation.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-start' : 'items-end'}`}
              >
                <div className={`flex items-center gap-1 mb-1 text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  {msg.sender === 'user' && <span className={`font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{selectedContact.name}</span>}
                  {msg.sender === 'bot' && <span className="font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-0.5"><Bot className="w-3 h-3" /> Bot Automático</span>}
                  {msg.sender === 'agent' && <span className="font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-0.5"><UserCheck className="w-3 h-3" /> Atendente Humano</span>}
                  <span>• {msg.timestamp}</span>
                </div>

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 text-xs shadow-xs break-words ${
                    msg.sender === 'user'
                      ? isDark 
                        ? 'bg-[#141417] text-slate-200 border border-white/10 rounded-tl-none' 
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-xs'
                      : msg.sender === 'bot'
                      ? 'bg-gradient-to-r from-purple-700 to-indigo-700 text-white border border-purple-500/30 rounded-tr-none shadow-xs'
                      : 'bg-blue-600 text-white rounded-tr-none shadow-xs'
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                  
                  {msg.intentDetected && (
                    <div className="mt-2 text-[10px] bg-white/20 text-white font-mono px-2 py-0.5 rounded w-fit">
                      Gatilho: {msg.intentDetected}
                    </div>
                  )}

                  {msg.options && (
                    <div className="mt-2.5 pt-2 border-t border-white/20 space-y-1">
                      {msg.options.map((opt, idx) => (
                        <div key={idx} className="bg-white/15 text-white px-2 py-1 rounded text-[11px]">
                          🔘 {opt}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Reply Box */}
          <div className={`border-t p-3 md:p-4 flex flex-col gap-2 shrink-0 ${
            isDark ? 'bg-[#0A0A0B] border-white/5' : 'bg-white border-slate-200'
          }`}>
            {!selectedContact.isBotActive && (
              <div className={`text-[11px] px-3 py-1.5 rounded-lg border flex items-center justify-between flex-wrap gap-2 ${
                isDark ? 'bg-amber-500/10 text-amber-300 border-amber-500/20' : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}>
                <span>⚠️ O bot está pausado. Mensagens enviadas aqui serão entregues como Atendente Humano.</span>
                <button
                  onClick={() => onToggleBotActive(selectedContact.id)}
                  className="font-bold underline cursor-pointer"
                >
                  Reativar Bot
                </button>
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={`Responder para ${selectedContact.name}...`}
                className={`flex-1 px-4 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-0 ${
                  isDark 
                    ? 'bg-[#141417] text-white border-white/10 placeholder-slate-500' 
                    : 'bg-slate-50 text-slate-900 border-slate-200 placeholder-slate-400'
                }`}
              />
              <button
                onClick={handleSend}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-xs"
              >
                <span className="hidden sm:inline">Enviar</span>
                <SendHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className={`flex-1 flex flex-col items-center justify-center p-8 text-center ${
          isDark ? 'bg-[#050505]' : 'bg-slate-50'
        }`}>
          <div className={`w-16 h-16 border rounded-2xl flex items-center justify-center mb-4 text-blue-500 shadow-xs ${
            isDark ? 'bg-[#141417] border-white/10' : 'bg-white border-slate-200'
          }`}>
            <MessageSquare className="w-8 h-8" />
          </div>
          <h3 className={`font-bold text-base mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Nenhuma conversa selecionada</h3>
          <p className={`text-xs max-w-md leading-relaxed mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            As conversas em tempo real recebidas através do WhatsApp Web ou outros canais aparecerão aqui automaticamente.
          </p>
          <div className={`flex items-center gap-2.5 border px-4 py-2.5 rounded-xl text-xs ${
            isDark ? 'bg-[#0A0A0B] border-white/10 text-slate-300' : 'bg-white border-slate-200 text-slate-700 shadow-xs'
          }`}>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span>Painel sincronizado • Aguardando novas mensagens...</span>
          </div>
        </div>
      )}

      {/* Right Sidebar: Customer Profile & Captured Variables */}
      {selectedContact && (
        <div className={`w-72 lg:w-80 border-l p-4 h-full overflow-y-auto space-y-5 text-xs shrink-0 z-20 transition-all ${
          isDark ? 'bg-[#0A0A0B] border-white/5' : 'bg-white border-slate-200'
        } ${
          showRightDrawer 
            ? `absolute right-0 top-0 bottom-0 shadow-2xl flex flex-col ${isDark ? 'bg-[#0A0A0B] border-white/10' : 'bg-white border-slate-300'}` 
            : 'hidden lg:block'
        }`}>
          {/* Drawer Close Button for Mobile */}
          {showRightDrawer && (
            <div className={`flex items-center justify-between pb-2 border-b lg:hidden ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
              <span className={`font-bold text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>Detalhes do Contato</span>
              <button 
                onClick={() => setShowRightDrawer(false)}
                className={`p-1 rounded-lg cursor-pointer ${
                  isDark ? 'bg-white/5 hover:bg-white/10 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* User Profile Summary */}
          <div className={`text-center pb-4 border-b ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
            <img
              src={selectedContact.avatar}
              alt={selectedContact.name}
              className="w-16 h-16 rounded-full object-cover mx-auto mb-2 border-2 border-blue-500/50 shadow-md"
            />
            <h3 className={`font-bold text-sm truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedContact.name}</h3>
            <span className={`font-mono text-[11px] block truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{selectedContact.phoneOrHandle}</span>

            <div className="mt-2 flex items-center justify-center gap-1 flex-wrap">
              {selectedContact.sentiment === 'positivo' && (
                <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold px-2 py-0.5 rounded-full text-[10px]">
                  Sentimento: Positivo 😊
                </span>
              )}
              {selectedContact.sentiment === 'urgente' && (
                <span className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-semibold px-2 py-0.5 rounded-full text-[10px]">
                  Sentimento: Urgente ⚡
                </span>
              )}
            </div>
          </div>

          {/* Funnel Stage */}
          <div>
            <span className={`text-[10px] font-bold uppercase tracking-[0.15em] block mb-1.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              Etapa do Funil CRM
            </span>
            <div className={`font-semibold p-2.5 rounded-xl border text-center ${
              isDark ? 'bg-blue-500/10 text-blue-300 border-blue-500/20' : 'bg-blue-50 text-blue-700 border-blue-200'
            }`}>
              {selectedContact.funnelStage || 'Novo Lead'}
            </div>
          </div>

          {/* Captured Variables in Chatbot Flow */}
          <div>
            <span className={`text-[10px] font-bold uppercase tracking-[0.15em] block mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              Variáveis Coletadas no Fluxo
            </span>
            <div className={`p-3 rounded-xl border space-y-2 ${
              isDark ? 'bg-[#141417] border-white/5' : 'bg-slate-50 border-slate-200'
            }`}>
              {Object.keys(selectedContact.variables || {}).length === 0 ? (
                <span className={`text-[11px] block text-center py-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Nenhuma variável coletada ainda.</span>
              ) : (
                Object.entries(selectedContact.variables || {}).map(([key, value]) => (
                  <div key={key} className={`flex items-center justify-between p-2 rounded border gap-2 ${
                    isDark ? 'bg-[#0A0A0B] border-white/5' : 'bg-white border-slate-200'
                  }`}>
                    <span className="font-mono text-[10px] text-purple-600 dark:text-purple-400 font-semibold truncate shrink-0">{`{${key}}`}</span>
                    <span className={`font-medium truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{value}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Connected Flow Builder Flows */}
          {flows.length > 0 && (
            <div>
              <span className={`text-[10px] font-bold uppercase tracking-[0.15em] block mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                Fluxos do Construtor Ativos
              </span>
              <div className="space-y-2">
                {flows.map(f => {
                  const triggerNode = f.nodes.find(n => n.type === 'triggerNode');
                  const keywords = triggerNode?.data?.keywords || [];
                  return (
                    <div key={f.id} className={`p-2.5 rounded-xl border text-[11px] ${
                      isDark ? 'bg-[#141417] border-purple-500/20' : 'bg-slate-50 border-purple-200'
                    }`}>
                      <div className="flex items-center justify-between font-bold text-purple-600 dark:text-purple-300 mb-1">
                        <span className="truncate max-w-[140px]">{f.name}</span>
                        <span className="text-[9px] bg-purple-500/10 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded font-mono border border-purple-500/20">
                          {f.nodes.length} nós
                        </span>
                      </div>
                      <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Gatilhos: {keywords.length > 0 ? keywords.join(', ') : 'Início direto'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tags */}
          <div>
            <span className={`text-[10px] font-bold uppercase tracking-[0.15em] block mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              Etiquetas Atribuídas
            </span>
            <div className="flex flex-wrap gap-1">
              {selectedContact.tags.map((t, idx) => (
                <span key={idx} className={`px-2 py-1 rounded-md text-[10px] font-medium flex items-center gap-1 border ${
                  isDark ? 'bg-[#141417] text-slate-300 border-white/10' : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}>
                  <Tag className="w-3 h-3 text-slate-400" /> {t}
                </span>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
