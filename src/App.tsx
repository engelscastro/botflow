import React, { useState, useEffect } from 'react';
import { 
  INITIAL_FLOWS, 
  INITIAL_CONTACTS, 
  INITIAL_CONVERSATIONS, 
  INITIAL_CHANNELS, 
  INITIAL_AI_CONFIG, 
  INITIAL_KNOWLEDGE, 
  INITIAL_ANALYTICS 
} from './data/initialData';
import { ChatFlow, Contact, Conversation, Message, ChannelStatus, AIProviderConfig, KnowledgeDocument, UserAccount } from './types';

import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { LoginScreen } from './components/Login/LoginScreen';
import { UsersManager } from './components/UsersManager/UsersManager';
import { FlowCanvas } from './components/FlowBuilder/FlowCanvas';
import { CentralInbox } from './components/Inbox/CentralInbox';
import { ChannelsManager } from './components/Channels/ChannelsManager';
import { AIEngineConfig } from './components/AIEngine/AIEngineConfig';
import { KnowledgeBaseManager } from './components/KnowledgeBase/KnowledgeBaseManager';
import { AnalyticsDashboard } from './components/Analytics/AnalyticsDashboard';
import { BroadcastManager } from './components/Broadcast/BroadcastManager';
import CRMManager from './components/CRM/CRMManager';
import ScheduleManager from './components/Schedule/ScheduleManager';
import { FlowSimulatorModal } from './components/FlowBuilder/FlowSimulatorModal';
import { LogViewerModal } from './components/LogViewerModal';

import { executeFlowForContact } from './utils/flowExecutor';
import { computeRealtimeAnalytics } from './utils/analyticsHelper';

export default function App() {
  const [flows, setFlows] = useState<ChatFlow[]>(INITIAL_FLOWS);
  const [activeFlowId, setActiveFlowId] = useState<string>(INITIAL_FLOWS[0].id);
  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS);
  const [conversations, setConversations] = useState<Record<string, Conversation>>(INITIAL_CONVERSATIONS);
  const [channels, setChannels] = useState<ChannelStatus[]>(INITIAL_CHANNELS);
  const [aiConfig, setAiConfig] = useState<AIProviderConfig>(INITIAL_AI_CONFIG);
  const [documents, setDocuments] = useState<KnowledgeDocument[]>(INITIAL_KNOWLEDGE);

  const analytics = React.useMemo(() => {
    return computeRealtimeAnalytics(contacts, conversations, flows);
  }, [contacts, conversations, flows]);

  const [activeSection, setActiveSection] = useState<string>('builder');
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('botflow_theme') as 'dark' | 'light') || 'dark';
  });

  const [userRole, setUserRole] = useState<'admin' | 'enterprise' | 'community' | null>(() => {
    return (localStorage.getItem('botflow_role') as 'admin' | 'enterprise' | 'community' | null) || null;
  });

  const [systemUsers, setSystemUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('botflow_users');
    if (saved) return JSON.parse(saved);
    return [
      { id: '1', username: 'admin', role: 'admin', status: 'active', createdAt: new Date().toLocaleDateString() },
      { id: '2', username: 'enterprise', role: 'enterprise', status: 'active', createdAt: new Date().toLocaleDateString() },
      { id: '3', username: 'community', role: 'community', status: 'active', createdAt: new Date().toLocaleDateString() }
    ];
  });

  const handleUpdateUserStatus = (userId: string, status: 'active' | 'inactive' | 'blocked') => {
    setSystemUsers(prev => {
      const newUsers = prev.map(u => u.id === userId ? { ...u, status } : u);
      localStorage.setItem('botflow_users', JSON.stringify(newUsers));
      return newUsers;
    });
  };

  const handleLogin = (role: 'admin' | 'enterprise' | 'community') => {
    setUserRole(role);
    localStorage.setItem('botflow_role', role);
    if (role === 'community') {
      const allowed = ['builder', 'inbox', 'knowledge', 'channels', 'ai', 'schedule', 'analytics'];
      if (!allowed.includes(activeSection)) {
        setActiveSection('builder');
      }
    }
  };

  const handleToggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('botflow_theme', next);
      return next;
    });
  };

  const activeFlow = flows.find(f => f.id === activeFlowId) || flows[0];
  const unreadCountTotal = contacts.reduce((sum, c) => sum + c.unreadCount, 0);

  // Flow handlers
  const handleSaveFlow = (updatedFlow: ChatFlow) => {
    setFlows(prev => {
      const exists = prev.some(f => f.id === updatedFlow.id);
      if (exists) {
        return prev.map(f => f.id === updatedFlow.id ? updatedFlow : f);
      }
      return [...prev, updatedFlow];
    });
  };

  const handleImportFlow = (importedFlow: ChatFlow) => {
    setFlows(prev => [...prev, importedFlow]);
    setActiveFlowId(importedFlow.id);
  };

  const handleCreateNewFlow = () => {
    const newId = `flow-${Date.now()}`;
    const newFlow: ChatFlow = {
      id: newId,
      name: `Novo Fluxo de Automação #${flows.length + 1}`,
      description: 'Fluxo customizado de atendimento automatizado.',
      channel: 'whatsapp',
      isActive: true,
      updatedAt: 'Criado agora',
      triggerCount: 0,
      nodes: [
        {
          id: 'n-start',
          type: 'triggerNode',
          position: { x: 100, y: 150 },
          data: {
            label: 'Início: Palavras-chave',
            type: 'trigger',
            channel: 'whatsapp',
            triggerType: 'keyword',
            keywords: ['oi', 'menu', 'ajuda']
          }
        },
        {
          id: 'n-msg',
          type: 'messageNode',
          position: { x: 420, y: 150 },
          data: {
            label: 'Mensagem de Boas-Vindas',
            type: 'message',
            messageText: 'Olá! Como posso te ajudar hoje?',
            quickReplies: ['Opção 1', 'Opção 2']
          }
        }
      ],
      edges: [
        { id: 'e-start-msg', source: 'n-start', target: 'n-msg' }
      ]
    };
    setFlows(prev => [...prev, newFlow]);
    setActiveFlowId(newId);
  };

  const processedMsgIdsRef = React.useRef<Set<string>>(new Set());

  // Sync real-time WhatsApp messages from Baileys Server
  useEffect(() => {
    let failCount = 0;
    const syncWhatsAppMessages = async () => {
      if (failCount > 5) {
        // If server is unavailable, slow down polling to once every 10s
        if (Math.random() > 0.2) return;
      }
      try {
        const res = await fetch('/api/whatsapp/messages');
        if (!res.ok) {
          failCount++;
          return;
        }
        failCount = 0;
        const data = await res.json();
        const serverMsgs: Array<{
          id: string;
          from: string;
          senderName: string;
          text: string;
          sender: 'contact' | 'bot' | 'agent';
          timestamp: string;
        }> = data.messages || [];

        if (serverMsgs.length === 0) return;

        // Only process new messages that haven't been tracked yet
        const newMsgs = serverMsgs.filter(m => !processedMsgIdsRef.current.has(m.id));
        if (newMsgs.length === 0) return;

        newMsgs.forEach(m => processedMsgIdsRef.current.add(m.id));

        // Map messages to contacts and conversations cleanly
        setContacts(prevContacts => {
          let updatedContacts = [...prevContacts];

          for (const sMsg of newMsgs) {
            const rawPhone = sMsg.from;
            const cleanPhone = rawPhone.replace(/\D/g, '');

            let contact = updatedContacts.find(c => {
              const cClean = (c.phoneOrHandle || '').replace(/\D/g, '');
              return (cClean && cleanPhone && cClean === cleanPhone) ||
                     c.phoneOrHandle === rawPhone ||
                     c.id === `c-wa-${cleanPhone}`;
            });

            if (!contact) {
              const newContactId = `c-wa-${cleanPhone || Date.now()}`;
              // When the first received message in batch was sent from me (agent), do not name the customer "Atendente"
              const initialContactName = (sMsg.sender !== 'agent' && sMsg.senderName && sMsg.senderName !== 'Atendente')
                ? sMsg.senderName
                : rawPhone;

              contact = {
                id: newContactId,
                name: initialContactName,
                phoneOrHandle: rawPhone,
                avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150`,
                channel: 'whatsapp',
                lastMessage: sMsg.text,
                lastMessageTime: sMsg.timestamp,
                unreadCount: sMsg.sender === 'contact' ? 1 : 0,
                isBotActive: true,
                tags: ['WhatsApp Real', 'Ativo'],
                variables: { whatsapp_jid: rawPhone },
                sentiment: 'positivo',
                funnelStage: 'Em Atendimento'
              };
              updatedContacts.unshift(contact);
            } else {
              // Only update contact name if incoming sender is not 'Atendente' and is a real name
              let resolvedName = contact.name;
              if (sMsg.sender === 'contact' && sMsg.senderName && sMsg.senderName !== 'Atendente' && sMsg.senderName.trim() !== '') {
                resolvedName = sMsg.senderName;
              } else if (resolvedName === 'Atendente') {
                resolvedName = rawPhone;
              }

              const updated = {
                ...contact,
                name: resolvedName,
                lastMessage: sMsg.text,
                lastMessageTime: sMsg.timestamp,
                unreadCount: sMsg.sender === 'contact' ? (contact.unreadCount || 0) + 1 : contact.unreadCount
              };
              const idx = updatedContacts.findIndex(c => c.id === contact!.id);
              if (idx !== -1) {
                updatedContacts.splice(idx, 1);
              }
              updatedContacts.unshift(updated);
            }
          }

          return updatedContacts;
        });

        setConversations(prevConversations => {
          let updatedConversations = { ...prevConversations };

          for (const sMsg of newMsgs) {
            const rawPhone = sMsg.from;
            const cleanPhone = rawPhone.replace(/\D/g, '');

            // Find matching contact id or conversation key
            let targetContactId = `c-wa-${cleanPhone || Date.now()}`;
            const existingKey = Object.keys(updatedConversations).find(k => {
              const cleanKey = k.replace(/\D/g, '');
              return (cleanKey && cleanPhone && cleanKey === cleanPhone) || k === `c-wa-${cleanPhone}`;
            });
            if (existingKey) {
              targetContactId = existingKey;
            }

            const currentConv = updatedConversations[targetContactId] || { contactId: targetContactId, messages: [] };
            const exists = currentConv.messages.some(m => m.id === sMsg.id);

            if (!exists) {
              const appMsg: Message = {
                id: sMsg.id,
                sender: sMsg.sender === 'contact' ? 'user' : sMsg.sender === 'bot' ? 'bot' : 'agent',
                text: sMsg.text,
                timestamp: sMsg.timestamp,
                channel: 'whatsapp',
                status: 'read'
              };

              updatedConversations = {
                ...updatedConversations,
                [targetContactId]: {
                  ...currentConv,
                  messages: [...currentConv.messages, appMsg]
                }
              };
            }
          }

          return updatedConversations;
        });

      } catch (e) {
        failCount++;
      }
    };

    const interval = setInterval(syncWhatsAppMessages, 2000);
    syncWhatsAppMessages();
    return () => clearInterval(interval);
  }, []);

  // Sync flows & knowledge base with backend server for real WhatsApp auto-responses
  useEffect(() => {
    fetch('/api/flows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ flows, activeFlowId, documents })
    }).catch(err => console.error("Error syncing flows to server:", err));
  }, [flows, activeFlowId, documents]);

  // Inbox message handlers
  const handleSendMessage = (contactId: string, text: string) => {
    const targetContact = contacts.find(c => c.id === contactId);

    const newMsg: Message = {
      id: Date.now().toString(),
      sender: 'agent',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      channel: targetContact?.channel || 'whatsapp',
      status: 'sent'
    };

    setConversations(prev => {
      const current = prev[contactId] || { contactId, messages: [] };
      return {
        ...prev,
        [contactId]: {
          ...current,
          messages: [...current.messages, newMsg]
        }
      };
    });

    setContacts(prev => prev.map(c => {
      if (c.id === contactId) {
        return {
          ...c,
          lastMessage: text,
          lastMessageTime: newMsg.timestamp,
          unreadCount: 0
        };
      }
      return c;
    }));

    if (targetContact && targetContact.channel === 'whatsapp' && targetContact.phoneOrHandle) {
      fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: targetContact.phoneOrHandle, text })
      }).catch(err => console.error("Erro ao enviar WhatsApp real:", err));
    }
  };

  const handleToggleBotActive = (contactId: string) => {
    const targetContact = contacts.find(c => c.id === contactId);
    const newActiveState = targetContact ? !targetContact.isBotActive : true;

    setContacts(prev => prev.map(c => {
      if (c.id === contactId) {
        return { ...c, isBotActive: newActiveState };
      }
      return c;
    }));

    if (targetContact?.phoneOrHandle) {
      fetch('/api/whatsapp/toggle-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: targetContact.phoneOrHandle, isPaused: !newActiveState })
      }).catch(err => console.error("Error toggling bot on server:", err));
    }
  };

  const handleTriggerFlow = async (contactId: string, flowId: string, userText?: string) => {
    const targetContact = contacts.find(c => c.id === contactId);
    const targetFlow = flows.find(f => f.id === flowId);
    if (!targetContact || !targetFlow) return;

    const result = await executeFlowForContact(targetFlow, targetContact, userText, documents);

    // Always update contact details
    setContacts(prev => prev.map(c => {
      if (c.id === contactId) {
        return {
          ...c,
          tags: Array.from(new Set([...(c.tags || []), ...result.updatedTags])),
          variables: { ...(c.variables || {}), ...result.updatedVariables },
          isBotActive: result.isBotActive,
          funnelStage: result.funnelStage || c.funnelStage,
          currentNodeId: result.currentNodeId !== undefined ? result.currentNodeId : c.currentNodeId,
          ...(result.botMessages.length > 0 ? {
            lastMessage: result.botMessages[result.botMessages.length - 1].text,
            lastMessageTime: result.botMessages[result.botMessages.length - 1].timestamp,
          } : {})
        };
      }
      return c;
    }));

    if (result.botMessages.length > 0) {
      // 1. Update conversations
      setConversations(prev => {
        const currentConv = prev[contactId] || { contactId, messages: [] };
        return {
          ...prev,
          [contactId]: {
            ...currentConv,
            messages: [...currentConv.messages, ...result.botMessages]
          }
        };
      });

      // 3. Send real WhatsApp message if applicable
      if (targetContact.channel === 'whatsapp' && targetContact.phoneOrHandle) {
        for (const botMsg of result.botMessages) {
          fetch('/api/whatsapp/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ to: targetContact.phoneOrHandle, text: botMsg.text })
          }).catch(err => console.error("Erro ao enviar fluxo no WhatsApp:", err));
        }
      }
    }
  };

  // Channels handlers
  const handleToggleChannelConnect = (channelId: string) => {
    setChannels(prev => prev.map(ch => {
      if (ch.id === channelId) {
        return {
          ...ch,
          connected: !ch.connected,
          statusText: !ch.connected ? 'Sincronizado e Ativo' : 'Desconectado'
        };
      }
      return ch;
    }));
  };

  const handleSetChannelConnected = (channelId: string, isConnected: boolean) => {
    setChannels(prev => prev.map(ch => {
      if (ch.id === channelId) {
        if (ch.connected === isConnected) return ch;
        return {
          ...ch,
          connected: isConnected,
          statusText: isConnected ? 'Sincronizado e Ativo' : 'Desconectado'
        };
      }
      return ch;
    }));
  };

  // AI Config handler
  const handleUpdateAiConfig = (newCfg: Partial<AIProviderConfig>) => {
    setAiConfig(prev => ({ ...prev, ...newCfg }));
  };

  // Knowledge base handlers
  const handleAddDocument = (doc: KnowledgeDocument) => {
    setDocuments(prev => [doc, ...prev]);
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  if (!userRole) {
    return <LoginScreen onLogin={handleLogin} theme={theme} users={systemUsers} />;
  }

  return (
    <div className={`flex flex-col h-screen w-screen overflow-hidden font-sans antialiased transition-colors ${
      theme === 'dark' ? 'bg-[#050505] text-slate-300' : 'bg-slate-100 text-slate-800'
    }`}>
      {/* Top Bar Header */}
      <Header
        channels={channels}
        aiConfig={aiConfig}
        activeSection={activeSection}
        onOpenTestSimulator={() => setIsSimulatorOpen(true)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenLogs={() => setIsLogsOpen(true)}
        userRole={userRole}
        onLogout={() => {
          setUserRole(null);
          localStorage.removeItem('botflow_role');
        }}
      />

      {/* Main Body Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          activeSection={activeSection}
          onSelectSection={setActiveSection}
          unreadCountTotal={unreadCountTotal}
          theme={theme}
          userRole={userRole}
        />

        {/* Dynamic Section Content with persistent mounting to avoid losing active campaign or flow states */}
        <main className={`flex-1 flex flex-col h-full overflow-hidden relative transition-colors ${
          theme === 'dark' ? 'bg-[#050505]' : 'bg-slate-50'
        }`}>
          <div className={activeSection === 'builder' ? 'flex-1 flex flex-col h-full overflow-hidden' : 'hidden'}>
            <FlowCanvas
              flows={flows}
              activeFlowId={activeFlowId}
              onSelectFlow={setActiveFlowId}
              onSaveFlow={handleSaveFlow}
              onCreateNewFlow={handleCreateNewFlow}
              onImportFlow={handleImportFlow}
              theme={theme}
            />
          </div>

          <div className={activeSection === 'inbox' ? 'flex-1 flex flex-col h-full overflow-hidden' : 'hidden'}>
            <CentralInbox
              contacts={contacts}
              conversations={conversations}
              flows={flows}
              onSendMessage={handleSendMessage}
              onToggleBotActive={handleToggleBotActive}
              onTriggerFlow={handleTriggerFlow}
              theme={theme}
            />
          </div>

          <div className={activeSection === 'broadcast' ? 'flex-1 flex flex-col h-full overflow-y-auto' : 'hidden'}>
            <BroadcastManager
              channels={channels}
              onNavigateToChannels={() => setActiveSection('channels')}
              theme={theme}
            />
          </div>

          <div className={activeSection === 'channels' ? 'flex-1 flex flex-col h-full overflow-y-auto' : 'hidden'}>
            <ChannelsManager
              channels={channels}
              onToggleChannelConnect={handleToggleChannelConnect}
              onSetChannelConnected={handleSetChannelConnected}
              theme={theme}
            />
          </div>

          <div className={activeSection === 'ai' ? 'flex-1 flex flex-col h-full overflow-y-auto' : 'hidden'}>
            <AIEngineConfig
              config={aiConfig}
              onUpdateConfig={handleUpdateAiConfig}
              theme={theme}
            />
          </div>

          <div className={activeSection === 'knowledge' ? 'flex-1 flex flex-col h-full overflow-y-auto' : 'hidden'}>
            <KnowledgeBaseManager
              documents={documents}
              onAddDocument={handleAddDocument}
              onDeleteDocument={handleDeleteDocument}
              theme={theme}
            />
          </div>

          <div className={activeSection === 'crm' ? 'flex-1 flex flex-col h-full overflow-y-auto' : 'hidden'}>
            <CRMManager isDark={theme === 'dark'} />
          </div>

          <div className={activeSection === 'schedule' ? 'flex-1 flex flex-col h-full overflow-y-auto' : 'hidden'}>
            <ScheduleManager isDark={theme === 'dark'} />
          </div>

          <div className={activeSection === 'analytics' ? 'flex-1 flex flex-col h-full overflow-y-auto' : 'hidden'}>
            <AnalyticsDashboard
              analytics={analytics}
              theme={theme}
            />
          </div>

          <div className={activeSection === 'users' ? 'flex-1 flex flex-col h-full overflow-y-auto' : 'hidden'}>
            <UsersManager
              isDark={theme === 'dark'}
              users={systemUsers}
              onUpdateStatus={handleUpdateUserStatus}
            />
          </div>
        </main>
      </div>

      {/* Global Interactive Chat Simulator Modal */}
      <FlowSimulatorModal
        flow={activeFlow}
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
      />

      {/* System Log Viewer Modal */}
      <LogViewerModal
        isOpen={isLogsOpen}
        onClose={() => setIsLogsOpen(false)}
        theme={theme}
      />
    </div>
  );
}
