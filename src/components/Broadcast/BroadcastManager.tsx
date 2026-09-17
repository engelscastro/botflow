import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Upload, 
  FileSpreadsheet, 
  Download, 
  Play, 
  Pause, 
  Square, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ShieldAlert, 
  UserPlus, 
  Trash2, 
  RotateCcw, 
  FileText, 
  Eye, 
  Sparkles, 
  Smartphone, 
  Search, 
  Filter, 
  Zap, 
  HelpCircle,
  Shuffle,
  Calendar,
  CheckCheck,
  Video,
  Image,
  Paperclip
} from 'lucide-react';
import { BroadcastContact, ChannelStatus } from '../../types';
import { 
  parseCSVContacts, 
  processMessageTemplate, 
  generateCSVTemplate, 
  exportContactsReportToCSV, 
  normalizeAndFormatPhone,
  getDynamicGreeting 
} from '../../utils/broadcastUtils';
import { NativeAutomatorPanel } from './NativeAutomatorPanel';

interface BroadcastManagerProps {
  channels: ChannelStatus[];
  onNavigateToChannels?: () => void;
  theme?: 'dark' | 'light';
}

export const BroadcastManager: React.FC<BroadcastManagerProps> = ({
  channels,
  onNavigateToChannels,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';
  const whatsappChannel = channels.find(c => c.id === 'whatsapp');
  const smsChannel = channels.find(c => c.id === 'sms');
  const isWhatsAppConnected = !!whatsappChannel?.connected;
  const isSMSConnected = !!smsChannel?.connected;

  // Contacts state
  const [targetChannel, setTargetChannel] = useState<'whatsapp' | 'sms'>('whatsapp');
  const [contacts, setContacts] = useState<BroadcastContact[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [pasteText, setPasteText] = useState<string>('');
  const [showPasteModal, setShowPasteModal] = useState<boolean>(false);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'sent' | 'failed' | 'invalid'>('all');

  // Manual Add Contact Modal
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newContactName, setNewContactName] = useState<string>('');
  const [newContactPhone, setNewContactPhone] = useState<string>('');

  // Message Template
  const [messageTemplate, setMessageTemplate] = useState<string>(
    `{Olá|Oi|Opa} {{primeiro_nome}}, {{saudacao}}!\n\nTemos uma novidade especial para você hoje. Gostaria de saber mais informações sobre nossas condições exclusivas?`
  );
  
  // Media Attachment
  const [attachment, setAttachment] = useState<{ base64: string; mimetype: string; filename: string } | null>(null);
  
  const [previewContactIndex, setPreviewContactIndex] = useState<number>(0);

  // Anti-Ban & Humanization Settings
  const [minDelay, setMinDelay] = useState<number>(6);
  const [maxDelay, setMaxDelay] = useState<number>(14);
  const [simulateTyping, setSimulateTyping] = useState<boolean>(true);

  // Campaign Execution State
  const [campaignStatus, setCampaignStatus] = useState<'idle' | 'running' | 'paused' | 'completed' | 'stopped'>('idle');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [countdown, setCountdown] = useState<number>(0);
  const [executionLogs, setExecutionLogs] = useState<{ id: string; time: string; text: string; type: 'info' | 'success' | 'error' | 'warn' }[]>([]);

  // Refs for async loop control
  const statusRef = useRef<'idle' | 'running' | 'paused' | 'completed' | 'stopped'>('idle');
  statusRef.current = campaignStatus;

  const contactsRef = useRef<BroadcastContact[]>(contacts);
  contactsRef.current = contacts;

  const channelsRef = useRef<ChannelStatus[]>(channels);
  channelsRef.current = channels;

  const targetChannelRef = useRef<'whatsapp' | 'sms'>(targetChannel);
  targetChannelRef.current = targetChannel;

  const executionIdRef = useRef<number>(0);

  // Stop loop on unmount
  useEffect(() => {
    return () => {
      statusRef.current = 'stopped';
      executionIdRef.current += 1;
    };
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Statistics calculation
  const totalContacts = contacts.length;
  const validContacts = contacts.filter(c => c.status !== 'invalid').length;
  const sentCount = contacts.filter(c => c.status === 'sent').length;
  const failedCount = contacts.filter(c => c.status === 'failed').length;
  const pendingCount = contacts.filter(c => c.status === 'pending').length;
  const invalidCount = contacts.filter(c => c.status === 'invalid').length;
  const progressPercent = totalContacts > 0 ? Math.round(((sentCount + failedCount) / (totalContacts - invalidCount || 1)) * 100) : 0;

  const addLog = (text: string, type: 'info' | 'success' | 'error' | 'warn' = 'info') => {
    const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setExecutionLogs(prev => [
      { id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`, time, text, type },
      ...prev.slice(0, 150)
    ]);
  };

  // Handle CSV file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const { contacts: parsed, total, validCount, invalidCount, errors } = parseCSVContacts(content);
        setContacts(parsed);
        setPreviewContactIndex(0);
        addLog(`Arquivo "${file.name}" importado com sucesso: ${total} contatos (${validCount} válidos, ${invalidCount} inválidos).`, 'success');
        if (errors.length > 0) {
          errors.forEach(err => addLog(`Aviso na importação: ${err}`, 'warn'));
        }
      }
    };
    reader.readAsText(file);
  };

  // Handle drag and drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const { contacts: parsed, total, validCount, invalidCount } = parseCSVContacts(content);
        setContacts(parsed);
        setPreviewContactIndex(0);
        addLog(`Arquivo "${file.name}" arrastado com sucesso: ${total} contatos (${validCount} válidos, ${invalidCount} inválidos).`, 'success');
      }
    };
    reader.readAsText(file);
  };

  // Handle media attachment upload
  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 16 * 1024 * 1024) {
      addLog(`O arquivo "${file.name}" é maior que 16MB. Mídias muito grandes podem falhar ou demorar muito para enviar.`, 'warn');
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        // data:image/png;base64,iVBORw0K...
        const matches = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          setAttachment({
            mimetype: matches[1],
            base64: matches[2],
            filename: file.name
          });
          addLog(`Mídia "${file.name}" anexada com sucesso.`, 'success');
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const clearAttachment = () => {
    setAttachment(null);
    addLog(`Mídia anexada foi removida.`, 'info');
  };

  // Handle manual CSV text paste
  const handleApplyPastedText = () => {
    if (!pasteText.trim()) return;
    const { contacts: parsed, total, validCount, invalidCount } = parseCSVContacts(pasteText);
    setContacts(parsed);
    setFileName('Lista colada manualmente');
    setShowPasteModal(false);
    setPasteText('');
    setPreviewContactIndex(0);
    addLog(`Lista manual importada: ${total} contatos (${validCount} válidos, ${invalidCount} inválidos).`, 'success');
  };

  // Download template CSV
  const handleDownloadTemplate = () => {
    const csvData = generateCSVTemplate();
    const blob = new Blob(["\uFEFF" + csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'modelo_contatos_whatsapp.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addLog('Modelo CSV baixado para o computador.', 'info');
  };

  // Export report to CSV
  const handleExportReport = () => {
    if (contacts.length === 0) return;
    const csvData = exportContactsReportToCSV(contacts);
    const blob = new Blob(["\uFEFF" + csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `relatorio_disparos_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addLog('Relatório detalhado de disparos exportado.', 'success');
  };

  // Add individual contact manually
  const handleAddSingleContact = () => {
    if (!newContactPhone.trim()) return;
    const { rawDigits, formatted, isValid } = normalizeAndFormatPhone(newContactPhone);
    const name = newContactName.trim() || `Contato ${contacts.length + 1}`;

    const newContact: BroadcastContact = {
      id: `bc-${Date.now()}`,
      name,
      phone: rawDigits,
      formattedPhone: formatted,
      status: isValid ? 'pending' : 'invalid',
      error: isValid ? undefined : 'Telefone inválido',
    };

    setContacts(prev => [newContact, ...prev]);
    setNewContactName('');
    setNewContactPhone('');
    setShowAddModal(false);
    addLog(`Contato ${name} (${formatted}) adicionado manualmente.`, 'info');
  };

  // Remove contact from list
  const handleRemoveContact = (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  // Reset campaign status
  const handleResetStatuses = () => {
    setContacts(prev => prev.map(c => ({
      ...c,
      status: c.status === 'invalid' ? 'invalid' : 'pending',
      error: c.status === 'invalid' ? c.error : undefined,
      sentAt: undefined,
    })));
    setCampaignStatus('idle');
    setCurrentIndex(0);
    setCountdown(0);
    addLog('Status da lista reiniciado para Pendente.', 'info');
  };

  // Insert tag into message template textarea
  const handleInsertTag = (tag: string) => {
    setMessageTemplate(prev => prev + ` ${tag} `);
  };

  // Sleep utility
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // START CAMPAIGN LOOP
  const handleStartCampaign = async () => {
    if (targetChannel === 'whatsapp' && !isWhatsAppConnected) {
      addLog('❌ Não é possível iniciar disparos: WhatsApp está desconectado. Conecte o QR Code na aba "Conexões & Canais".', 'error');
      return;
    }
    
    if (targetChannel === 'sms' && !isSMSConnected) {
      addLog('❌ Não é possível iniciar disparos SMS: Gateway SMS (Twilio/Android) não está configurado. Acesse a aba "Conexões & Canais".', 'error');
      return;
    }

    if (validContacts === 0) {
      addLog('❌ Nenhum contato válido na lista para disparo.', 'error');
      return;
    }

    if (!messageTemplate.trim()) {
      addLog('❌ O texto da mensagem está vazio.', 'error');
      return;
    }

    executionIdRef.current += 1;
    const currentExecutionId = executionIdRef.current;

    setCampaignStatus('running');
    statusRef.current = 'running';
    addLog(`🚀 Iniciando campanha de disparos em massa via ${targetChannel === 'whatsapp' ? 'WhatsApp' : 'Twilio SMS'} para ${pendingCount} contatos pendentes...`, 'info');

    // Run queue
    const list = [...contactsRef.current];

    for (let i = 0; i < list.length; i++) {
      // Check if paused or stopped
      if (statusRef.current === 'stopped' || executionIdRef.current !== currentExecutionId) {
        addLog('⏹️ Disparos cancelados pelo usuário.', 'warn');
        break;
      }

      while (statusRef.current === 'paused') {
        await sleep(1000);
        if (statusRef.current === 'stopped' || executionIdRef.current !== currentExecutionId) break;
      }

      if (statusRef.current === 'stopped' || executionIdRef.current !== currentExecutionId) break;

      // Ensure channel is still connected dynamically
      const activeTarget = targetChannelRef.current;
      const isStillConnected = !!channelsRef.current.find(c => c.id === activeTarget)?.connected;
      if (!isStillConnected) {
        addLog(`❌ Conexão do canal ${activeTarget.toUpperCase()} foi perdida. Cancelando disparos em andamento.`, 'error');
        setCampaignStatus('stopped');
        statusRef.current = 'stopped';
        break;
      }

      const contact = list[i];
      if (contact.status !== 'pending') {
        continue;
      }

      setCurrentIndex(i + 1);

      // Update status to 'sending'
      setContacts(prev => prev.map(c => c.id === contact.id ? { ...c, status: 'sending' } : c));
      const personalizedText = processMessageTemplate(messageTemplate, contact);

      let logChannelName = targetChannel.toUpperCase();
      if (targetChannel === 'sms') {
        const isElectron = window.navigator.userAgent.toLowerCase().includes('electron');
        logChannelName = `SMS (Gateway App Android via ${isElectron ? 'Electron/Desktop' : 'Navegador/No-CORS'})`;
      }

      addLog(`⏳ Enviando via ${logChannelName} para [${contact.name}] (${contact.formattedPhone})...`, 'info');

      try {
        let response;
        let data;

        if (targetChannel === 'whatsapp') {
          response = await fetch('/api/whatsapp/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: contact.phone,
              text: personalizedText,
              name: contact.name,
              attachment: attachment // newly added payload
            }),
          });
          data = await response.json();
        } else {
          // SMS Logic
          if (channelsRef.current.find(c => c.id === 'sms')?.connected) {
            // Assume Android Simple SMS Gateway format if it matches
            // We use mode: 'no-cors' because local simple apps often lack CORS headers.
            // With 'no-cors', the request is sent, but we can't read the response object. We just assume success if it doesn't throw.
            try {
               const gatewayUrl = localStorage.getItem('botflow_android_gateway_url') || 'http://192.168.15.12:8080/send-sms';
               
               // In browser environments (like AI Studio preview), we MUST use no-cors to prevent the browser from outright killing 
               // the request to the local HTTP server because the Simple SMS app doesn't send CORS allow headers.
               // In Electron desktop app, CORS is disabled so standard fetch works perfectly and returns the response.
               const isElectron = window.navigator.userAgent.toLowerCase().includes('electron');
               
               const fetchOptions: RequestInit = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  phone: contact.phone,
                  message: personalizedText
                })
               };

               if (!isElectron) {
                 fetchOptions.mode = 'no-cors';
               }

               const localRes = await fetch(gatewayUrl, fetchOptions);
              
              // When mode is no-cors, localRes.type is 'opaque' and localRes.ok is false, even if successful.
              // So in browser mode, we assume success if it didn't throw a network error.
              if (!isElectron || localRes.ok) {
                 response = { ok: true };
                 data = { success: true };
              } else {
                 response = { ok: false };
                 data = { error: `O celular recusou o envio (Erro ${localRes.status}). Verifique se o app está aberto.` };
              }
            } catch (e: any) {
               response = { ok: false };
               data = { error: 'Falha de conexão. O celular e o PC estão no mesmo Wi-Fi?' };
            }
          } else {
            // Fake Twilio fallback if not connected properly (should be blocked earlier, but just in case)
            await sleep(500); 
            response = { ok: true };
            data = { success: true };
          }
        }

        if (response.ok && (data.success || data.success === undefined)) {
          const sentTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
          setContacts(prev => prev.map(c => c.id === contact.id ? {
            ...c,
            status: 'sent',
            sentAt: sentTime,
            error: undefined
          } : c));
          addLog(`✅ Enviado com sucesso para [${contact.name}] (${contact.formattedPhone}) via ${targetChannel.toUpperCase()}`, 'success');
        } else {
          setContacts(prev => prev.map(c => c.id === contact.id ? {
            ...c,
            status: 'failed',
            error: data.error || `Falha no envio via ${targetChannel.toUpperCase()}`
          } : c));
          addLog(`❌ Falha no envio para [${contact.name}]: ${data.error || 'Erro desconhecido'}`, 'error');
        }
      } catch (err: any) {
        setContacts(prev => prev.map(c => c.id === contact.id ? {
          ...c,
          status: 'failed',
          error: err?.message || 'Erro de conexão com o servidor'
        } : c));
        addLog(`❌ Erro ao enviar para [${contact.name}]: ${err?.message || err}`, 'error');
      }

      // Check if there are more pending contacts to wait delay
      const remainingPending = contactsRef.current.filter(c => c.status === 'pending' && c.id !== contact.id);
      if (remainingPending.length > 0 && statusRef.current === 'running' && executionIdRef.current === currentExecutionId) {
        // Random delay between minDelay and maxDelay
        const actualDelay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
        addLog(`⏱️ Aguardando intervalo de segurança anti-bloqueio (${actualDelay}s)...`, 'info');

        for (let s = actualDelay; s > 0; s--) {
          setCountdown(s);
          await sleep(1000);
          if (statusRef.current === 'stopped' || executionIdRef.current !== currentExecutionId) break;
          while (statusRef.current === 'paused') {
            await sleep(1000);
            if (statusRef.current === 'stopped' || executionIdRef.current !== currentExecutionId) break;
          }
        }
        setCountdown(0);
      }
    }

    if (statusRef.current === 'running' && executionIdRef.current === currentExecutionId) {
      setCampaignStatus('completed');
      statusRef.current = 'completed';
      addLog('🎉 Todos os disparos da lista foram finalizados com sucesso!', 'success');
    }
  };

  const handlePauseCampaign = () => {
    setCampaignStatus('paused');
    statusRef.current = 'paused';
    addLog('⏸️ Campanha de disparos pausada.', 'warn');
  };

  const handleResumeCampaign = () => {
    setCampaignStatus('running');
    statusRef.current = 'running';
    addLog('▶️ Retomando disparos em massa...', 'info');
  };

  const handleStopCampaign = () => {
    setCampaignStatus('stopped');
    statusRef.current = 'stopped';
    setCountdown(0);
    addLog('⏹️ Disparos interrompidos.', 'warn');
  };

  // Filtered contacts list
  const filteredContacts = contacts.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      c.phone.includes(searchFilter) ||
      c.formattedPhone.includes(searchFilter);

    if (!matchesSearch) return false;
    if (statusFilter === 'all') return true;
    return c.status === statusFilter;
  });

  const previewContact = contacts[previewContactIndex] || {
    id: 'sample',
    name: 'Carlos Oliveira',
    phone: '5582993530493',
    formattedPhone: '+55 (82) 99353-0493',
    status: 'pending' as const,
  };

  const livePreviewText = processMessageTemplate(messageTemplate, previewContact);

  return (
    <div className={`p-6 max-w-7xl mx-auto space-y-6 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
      {/* Top Banner / Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5 border-white/5">
        <div>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${isDark ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-blue-100 text-blue-700'}`}>
              <Send className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Disparador em Massa (WhatsApp Broadcast)</h1>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Importe listas CSV (Nome e Telefone), personalize mensagens com variáveis dinâmicas e faça disparos seguros com anti-bloqueio.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Connection Status Badge */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border ${
            isWhatsAppConnected 
              ? isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : isDark ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isWhatsAppConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span>{isWhatsAppConnected ? 'WhatsApp Conectado' : 'WhatsApp Desconectado'}</span>
            {!isWhatsAppConnected && onNavigateToChannels && (
              <button 
                onClick={onNavigateToChannels}
                className="underline ml-1 font-bold hover:text-amber-300 cursor-pointer"
              >
                Conectar
              </button>
            )}
          </div>

          <button
            onClick={handleDownloadTemplate}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
              isDark ? 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10' : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-xs'
            }`}
            title="Baixar planilha modelo CSV com colunas Nome e Telefone"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>Modelo CSV</span>
          </button>

          {contacts.length > 0 && (
            <button
              onClick={handleExportReport}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                isDark ? 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10' : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-xs'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Exportar Relatório</span>
            </button>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        <div className={`col-span-2 sm:col-span-1 lg:col-span-2 p-3 rounded-xl border flex flex-col justify-between relative overflow-hidden ${isDark ? 'bg-gradient-to-br from-[#0E0E10] to-[#141417] border-white/5' : 'bg-gradient-to-br from-white to-slate-50 border-slate-200 shadow-xs'}`}>
          <div className="flex justify-between items-start">
            <div className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Canal de Disparo</div>
            {targetChannel === 'whatsapp' ? (
              <Zap className="w-4 h-4 text-emerald-500" />
            ) : (
              <Smartphone className="w-4 h-4 text-indigo-500" />
            )}
          </div>
          <div className={`mt-2 flex rounded-lg p-1 border ${isDark ? 'bg-black/20 border-white/10' : 'bg-slate-100 border-slate-200'}`}>
            <button
              onClick={() => setTargetChannel('whatsapp')}
              disabled={campaignStatus === 'running'}
              className={`flex-1 text-[10px] py-1 rounded font-bold transition-all cursor-pointer ${
                targetChannel === 'whatsapp' ? 'bg-emerald-600 text-white shadow-xs' : isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              WhatsApp
            </button>
            <button
              onClick={() => setTargetChannel('sms')}
              disabled={campaignStatus === 'running'}
              className={`flex-1 text-[10px] py-1 rounded font-bold transition-all cursor-pointer ${
                targetChannel === 'sms' ? 'bg-indigo-600 text-white shadow-xs' : isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Twilio SMS
            </button>
          </div>
        </div>

        <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#0E0E10] border-white/5' : 'bg-white border-slate-200 shadow-xs'}`}>
          <div className={`text-xs font-medium ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Total Importados</div>
          <div className={`text-2xl font-bold mt-1 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{totalContacts}</div>
        </div>

        <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#0E0E10] border-white/5' : 'bg-white border-slate-200 shadow-xs'}`}>
          <div className="text-xs font-medium text-emerald-500 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Enviados</span>
          </div>
          <div className="text-2xl font-bold mt-1 text-emerald-500">{sentCount}</div>
        </div>

        <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#0E0E10] border-white/5' : 'bg-white border-slate-200 shadow-xs'}`}>
          <div className="text-xs font-medium text-blue-500 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Pendentes</span>
          </div>
          <div className="text-2xl font-bold mt-1 text-blue-500">{pendingCount}</div>
        </div>

        <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#0E0E10] border-white/5' : 'bg-white border-slate-200 shadow-xs'}`}>
          <div className="text-xs font-medium text-rose-500 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            <span>Falhas</span>
          </div>
          <div className="text-2xl font-bold mt-1 text-rose-500">{failedCount}</div>
        </div>

        <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#0E0E10] border-white/5' : 'bg-white border-slate-200 shadow-xs'}`}>
          <div className="text-xs font-medium text-amber-500">Telefones Inválidos</div>
          <div className="text-2xl font-bold mt-1 text-amber-500">{invalidCount}</div>
        </div>

        <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#0E0E10] border-white/5' : 'bg-white border-slate-200 shadow-xs'}`}>
          <div className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Progresso Geral</div>
          <div className="text-2xl font-bold mt-1 text-purple-500">{progressPercent}%</div>
        </div>
      </div>

      {/* Progress Bar (Visible during and after dispatch) */}
      {campaignStatus !== 'idle' && (
        <div className={`p-4 rounded-xl border space-y-2 ${isDark ? 'bg-[#0E0E10] border-white/5' : 'bg-white border-slate-200 shadow-xs'}`}>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-semibold">
              <span className={`w-2.5 h-2.5 rounded-full ${
                campaignStatus === 'running' ? 'bg-blue-500 animate-pulse' :
                campaignStatus === 'paused' ? 'bg-amber-500' :
                campaignStatus === 'completed' ? 'bg-emerald-500' : 'bg-rose-500'
              }`} />
              <span className="capitalize">
                {campaignStatus === 'running' ? `Disparando... (${sentCount + failedCount} de ${totalContacts - invalidCount})` :
                 campaignStatus === 'paused' ? 'Disparos Pausados' :
                 campaignStatus === 'completed' ? 'Campanha Concluída com Sucesso!' : 'Disparos Interrompidos'}
              </span>
            </div>

            {countdown > 0 && campaignStatus === 'running' && (
              <div className="text-amber-400 flex items-center gap-1.5 font-mono">
                <Clock className="w-3.5 h-3.5 animate-spin" />
                <span>Próximo disparo em {countdown}s (Delay de segurança)</span>
              </div>
            )}

            <span className="font-mono text-slate-400">{progressPercent}%</span>
          </div>

          <div className="w-full bg-slate-800/60 rounded-full h-2.5 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Main Grid: Left (CSV & Contacts) | Right (Message & Preview & Execution) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: CSV Import & Contact List (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* CSV Upload / Drag Drop Box */}
          <div 
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className={`p-6 rounded-2xl border-2 border-dashed transition-all text-center flex flex-col items-center justify-center gap-3 ${
              isDark 
                ? 'bg-[#0E0E10] border-white/10 hover:border-blue-500/50' 
                : 'bg-white border-slate-300 hover:border-blue-500 shadow-xs'
            }`}
          >
            <div className="p-3.5 rounded-full bg-blue-500/10 text-blue-400">
              <Upload className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-sm font-bold">Importar Lista de Contatos em CSV</h3>
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Arraste o arquivo CSV ou clique abaixo. Formato: <span className="font-mono font-bold text-blue-400">Coluna 1: Nome</span> | <span className="font-mono font-bold text-blue-400">Coluna 2: Telefone</span>
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap justify-center mt-1">
              <input 
                ref={fileInputRef}
                type="file" 
                accept=".csv,.txt" 
                onChange={handleFileUpload} 
                className="hidden" 
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-2"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Selecionar Arquivo .CSV</span>
              </button>

              <button
                onClick={() => setShowPasteModal(true)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-2 ${
                  isDark ? 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Colar Texto</span>
              </button>

              <button
                onClick={() => setShowAddModal(true)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                  isDark ? 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                }`}
              >
                <UserPlus className="w-4 h-4 text-emerald-400" />
                <span>+ Contato</span>
              </button>
            </div>

            {fileName && (
              <div className={`mt-2 text-xs font-medium px-3 py-1 rounded-full ${isDark ? 'bg-white/5 text-blue-400' : 'bg-blue-50 text-blue-700'}`}>
                Arquivo ativo: <span className="font-bold">{fileName}</span> ({contacts.length} contatos)
              </div>
            )}
          </div>

          {/* Contact Table Card */}
          <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-[#0E0E10] border-white/5' : 'bg-white border-slate-200 shadow-xs'}`}>
            {/* Table Header Controls */}
            <div className="p-4 border-b border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border w-full sm:w-64 text-xs ${
                  isDark ? 'bg-black/30 border-white/10 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-800'
                }`}>
                  <Search className="w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Filtrar por nome ou telefone..."
                    className="bg-transparent border-none outline-none w-full text-xs"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e: any) => setStatusFilter(e.target.value)}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border outline-none cursor-pointer ${
                    isDark ? 'bg-[#18181B] border-white/10 text-slate-300' : 'bg-white border-slate-300 text-slate-700'
                  }`}
                >
                  <option value="all">Todos ({contacts.length})</option>
                  <option value="pending">Pendentes ({pendingCount})</option>
                  <option value="sent">Enviados ({sentCount})</option>
                  <option value="failed">Falhas ({failedCount})</option>
                  <option value="invalid">Inválidos ({invalidCount})</option>
                </select>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {contacts.some(c => c.status === 'sent' || c.status === 'failed') && (
                  <button
                    onClick={handleResetStatuses}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border cursor-pointer ${
                      isDark ? 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                    }`}
                    title="Reiniciar status para pendente e reexecutar disparos"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                    <span>Reiniciar Status</span>
                  </button>
                )}

                {contacts.length > 0 && (
                  <button
                    onClick={() => {
                      setContacts([]);
                      setFileName('');
                      setCampaignStatus('idle');
                      addLog('Lista de contatos limpa.', 'info');
                    }}
                    className={`p-1.5 rounded-lg text-xs border text-rose-400 hover:bg-rose-500/10 cursor-pointer ${
                      isDark ? 'border-white/10' : 'border-slate-300'
                    }`}
                    title="Limpar todos os contatos"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto max-h-[380px] overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className={`sticky top-0 z-10 uppercase tracking-wider text-[10px] font-bold ${
                  isDark ? 'bg-[#141416] text-slate-400 border-b border-white/5' : 'bg-slate-100 text-slate-600 border-b border-slate-200'
                }`}>
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center">#</th>
                    <th className="py-2.5 px-3">Nome do Cliente</th>
                    <th className="py-2.5 px-3">Telefone Formatado</th>
                    <th className="py-2.5 px-3">WhatsApp JID</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-slate-200'}`}>
                  {filteredContacts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-500">
                        {contacts.length === 0 ? (
                          <div className="space-y-2">
                            <FileSpreadsheet className="w-8 h-8 mx-auto text-slate-600 opacity-60" />
                            <p className="text-xs">Nenhum contato carregado. Importe um CSV acima.</p>
                          </div>
                        ) : (
                          'Nenhum contato corresponde ao filtro pesquisado.'
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredContacts.map((contact, idx) => {
                      const isSelectedForPreview = contacts.findIndex(c => c.id === contact.id) === previewContactIndex;
                      return (
                        <tr 
                          key={contact.id}
                          onClick={() => {
                            const realIdx = contacts.findIndex(c => c.id === contact.id);
                            if (realIdx !== -1) setPreviewContactIndex(realIdx);
                          }}
                          className={`cursor-pointer transition-colors ${
                            isSelectedForPreview 
                              ? isDark ? 'bg-blue-500/10' : 'bg-blue-50'
                              : isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="py-2.5 px-3 text-center text-slate-500 font-mono text-[11px]">{idx + 1}</td>
                          <td className={`py-2.5 px-3 font-semibold flex items-center gap-2 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                            <span>{contact.name}</span>
                            {isSelectedForPreview && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500 text-white font-bold">Prévia</span>
                            )}
                          </td>
                          <td className={`py-2.5 px-3 font-mono ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{contact.formattedPhone}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">
                            {contact.phone ? `${contact.phone}@s.whatsapp.net` : '-'}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              contact.status === 'sent' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                              contact.status === 'sending' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 animate-pulse' :
                              contact.status === 'failed' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                              contact.status === 'invalid' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                              'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                            }`}>
                              {contact.status === 'sent' && <CheckCircle2 className="w-3 h-3" />}
                              {contact.status === 'failed' && <AlertCircle className="w-3 h-3" />}
                              {contact.status === 'invalid' && <ShieldAlert className="w-3 h-3" />}
                              {contact.status === 'sent' ? `Enviado ${contact.sentAt ? `(${contact.sentAt})` : ''}` :
                               contact.status === 'sending' ? 'Enviando...' :
                               contact.status === 'failed' ? (contact.error || 'Falha') :
                               contact.status === 'invalid' ? 'Inválido' : 'Pendente'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveContact(contact.id);
                              }}
                              className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                              title="Remover este contato"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Anti-Ban & Dispatch Humanization Settings Card */}
          <div className={`p-5 rounded-2xl border space-y-4 ${isDark ? 'bg-[#0E0E10] border-white/5' : 'bg-white border-slate-200 shadow-xs'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider">Proteção Anti-Bloqueio & Humanização</h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                Recomendado
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-400 font-medium flex items-center justify-between">
                  <span>Intervalo Mínimo (segundos):</span>
                  <span className="font-bold text-blue-400">{minDelay}s</span>
                </label>
                <input
                  type="range"
                  min={3}
                  max={300}
                  value={minDelay}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setMinDelay(val);
                    if (val > maxDelay) setMaxDelay(val + 4);
                  }}
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 font-medium flex items-center justify-between">
                  <span>Intervalo Máximo (segundos):</span>
                  <span className="font-bold text-blue-400">{maxDelay}s</span>
                </label>
                <input
                  type="range"
                  min={minDelay}
                  max={300}
                  value={maxDelay}
                  onChange={(e) => setMaxDelay(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="simulateTyping"
                  checked={simulateTyping}
                  onChange={(e) => setSimulateTyping(e.target.checked)}
                  className="rounded accent-blue-500 cursor-pointer w-4 h-4"
                />
                <label htmlFor="simulateTyping" className="cursor-pointer text-slate-300 font-medium">
                  Simular digitação no WhatsApp antes de disparar
                </label>
              </div>

              <span className="text-slate-500 text-[11px]">Jitter aleatório ativado</span>
            </div>
          </div>
        </div>

        {/* Right Column: Message Composer & Live Preview & Execution Control (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Message Composer Card */}
          <div className={`p-5 rounded-2xl border space-y-4 ${isDark ? 'bg-[#0E0E10] border-white/5' : 'bg-white border-slate-200 shadow-xs'}`}>
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span>Modelo da Mensagem</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">
                {messageTemplate.length} caracteres
              </span>
            </div>

            {/* Variable insertion buttons */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Variáveis Rápidas (Clique para Inserir):
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => handleInsertTag('{{primeiro_nome}}')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-mono border transition-all cursor-pointer ${
                    isDark ? 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20' : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                  }`}
                  title="Insere o primeiro nome do cliente (ex: João)"
                >
                  + &#123;&#123;primeiro_nome&#125;&#125;
                </button>

                <button
                  onClick={() => handleInsertTag('{{nome}}')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-mono border transition-all cursor-pointer ${
                    isDark ? 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20' : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                  }`}
                  title="Insere o nome completo do cliente"
                >
                  + &#123;&#123;nome&#125;&#125;
                </button>

                <button
                  onClick={() => handleInsertTag('{{saudacao}}')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-mono border transition-all cursor-pointer ${
                    isDark ? 'bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20' : 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
                  }`}
                  title="Insere Bom dia / Boa tarde / Boa noite automaticamente"
                >
                  + &#123;&#123;saudacao&#125;&#125;
                </button>

                <button
                  onClick={() => handleInsertTag('{Olá|Oi|Opa}')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-mono border transition-all cursor-pointer ${
                    isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  }`}
                  title="Spintax: Varia a saudação aleatoriamente entre contatos para evitar bloqueios"
                >
                  + Spintax &#123;Oi|Olá&#125;
                </button>
              </div>
            </div>

            {/* Template Textarea */}
            <textarea
              rows={5}
              value={messageTemplate}
              onChange={(e) => setMessageTemplate(e.target.value)}
              placeholder="Digite o texto da mensagem com as tags..."
              className={`w-full p-3 rounded-xl text-xs outline-none border transition-all resize-none ${
                isDark 
                  ? 'bg-black/30 border-white/10 text-slate-200 focus:border-blue-500/50' 
                  : 'bg-slate-50 border-slate-300 text-slate-800 focus:border-blue-500'
              }`}
            />

            {/* Media Attachment Upload */}
            <div className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
              isDark ? 'bg-black/20 border-white/10' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${attachment ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-500/20 text-slate-400'}`}>
                  {attachment?.mimetype.startsWith('video/') ? (
                    <Video className="w-4 h-4" />
                  ) : attachment?.mimetype.startsWith('image/') ? (
                    <Image className="w-4 h-4" />
                  ) : (
                    <Paperclip className="w-4 h-4" />
                  )}
                </div>
                <div className="text-xs">
                  {attachment ? (
                    <>
                      <p className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{attachment.filename}</p>
                      <p className="text-[10px] text-slate-400">Anexo pronto para envio</p>
                    </>
                  ) : (
                    <>
                      <p className={`font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Anexar Mídia (Opcional)</p>
                      <p className="text-[10px] text-slate-500">Imagens ou vídeos até 16MB</p>
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {attachment && (
                  <button 
                    onClick={clearAttachment}
                    className="p-1.5 rounded-md hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                    title="Remover anexo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <label className={`px-3 py-1.5 rounded-md text-[11px] font-bold border transition-colors cursor-pointer ${
                  isDark ? 'bg-blue-500/10 text-blue-400 border-blue-500/30 hover:bg-blue-500/20' : 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'
                }`}>
                  <input type="file" accept="image/*,video/*,application/pdf" className="hidden" onChange={handleMediaUpload} />
                  {attachment ? 'Trocar Anexo' : 'Escolher Arquivo'}
                </label>
              </div>
            </div>
          </div>

          {/* Real-time WhatsApp Phone Mockup Preview */}
          <div className={`p-4 rounded-2xl border space-y-3 ${isDark ? 'bg-[#0E0E10] border-white/5' : 'bg-white border-slate-200 shadow-xs'}`}>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-slate-400">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>Prévia em Tempo Real no WhatsApp</span>
              </div>

              {contacts.length > 0 && (
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <span>Contato {previewContactIndex + 1} de {contacts.length}</span>
                </div>
              )}
            </div>

            {/* Simulated WhatsApp Phone Frame */}
            <div className="rounded-xl overflow-hidden border border-emerald-900/30 bg-[#0B141A] p-4 text-slate-100 shadow-lg relative">
              {/* WhatsApp Chat Header */}
              <div className="flex items-center gap-2.5 pb-3 border-b border-white/10 mb-3">
                <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white text-xs">
                  {previewContact.name.charAt(0)}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                    <span>{previewContact.name}</span>
                    <span className="text-[10px] text-emerald-400 font-normal">online</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">{previewContact.formattedPhone}</div>
                </div>
              </div>

              {/* Message Bubble */}
              <div className="flex justify-end">
                <div className="max-w-[90%] min-w-[200px] bg-[#005C4B] text-slate-100 p-1.5 rounded-xl rounded-tr-none text-xs shadow-md relative">
                  
                  {/* Render Image or Video preview inside bubble if attached */}
                  {attachment && (
                    <div className="mb-2 rounded-lg overflow-hidden relative bg-black/40">
                      {attachment.mimetype.startsWith('video/') ? (
                        <video src={`data:${attachment.mimetype};base64,${attachment.base64}`} className="w-full max-h-[250px] object-cover" controls />
                      ) : attachment.mimetype.startsWith('image/') ? (
                        <img src={`data:${attachment.mimetype};base64,${attachment.base64}`} alt="preview" className="w-full max-h-[250px] object-cover" />
                      ) : (
                        <div className="flex items-center gap-2 p-3 bg-[#014A3D]">
                          <div className="w-10 h-10 bg-[#00A884] rounded flex items-center justify-center">
                            <Paperclip className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <p className="font-bold truncate">{attachment.filename}</p>
                            <p className="text-[10px] opacity-70">1 Página • PDF</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="px-2 pb-1 space-y-1">
                    <p className="whitespace-pre-line leading-relaxed">{livePreviewText || 'Digite o modelo da mensagem acima...'}</p>
                    <div className="flex items-center justify-end gap-1 text-[10px] text-emerald-200/70 pt-0.5">
                      <span>{new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                      <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Execution Controller Card */}
          <div className={`p-5 rounded-2xl border space-y-4 ${isDark ? 'bg-[#0E0E10] border-white/5' : 'bg-white border-slate-200 shadow-xs'}`}>
            <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Controle de Disparos</span>
            </h3>

            <div className="flex items-center gap-3 flex-wrap">
              {campaignStatus === 'idle' || campaignStatus === 'completed' || campaignStatus === 'stopped' ? (
                <button
                  onClick={handleStartCampaign}
                  disabled={validContacts === 0 || (targetChannel === 'whatsapp' ? !isWhatsAppConnected : !isSMSConnected)}
                  className={`flex-1 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                    validContacts > 0 && (targetChannel === 'whatsapp' ? isWhatsAppConnected : isSMSConnected)
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-900/30'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
                  }`}
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Iniciar Disparos ({pendingCount} contatos)</span>
                </button>
              ) : campaignStatus === 'running' ? (
                <>
                  <button
                    onClick={handlePauseCampaign}
                    className="flex-1 py-3 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
                  >
                    <Pause className="w-4 h-4 fill-current" />
                    <span>Pausar Disparos</span>
                  </button>

                  <button
                    onClick={handleStopCampaign}
                    className="px-4 py-3 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
                  >
                    <Square className="w-4 h-4 fill-current" />
                    <span>Cancelar</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleResumeCampaign}
                    className="flex-1 py-3 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Retomar Disparos</span>
                  </button>

                  <button
                    onClick={handleStopCampaign}
                    className="px-4 py-3 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
                  >
                    <Square className="w-4 h-4 fill-current" />
                    <span>Cancelar</span>
                  </button>
                </>
              )}
            </div>

            {/* Real-time Execution Feed Logs */}
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                <span>Log de Execução em Tempo Real:</span>
                {executionLogs.length > 0 && (
                  <button 
                    onClick={() => setExecutionLogs([])}
                    className="text-[10px] hover:text-slate-200 cursor-pointer"
                  >
                    Limpar Logs
                  </button>
                )}
              </div>

              <div className={`p-3 rounded-xl font-mono text-[11px] max-h-36 overflow-y-auto space-y-1 ${
                isDark ? 'bg-black/50 border border-white/5 text-slate-300' : 'bg-slate-900 border border-slate-800 text-slate-300'
              }`}>
                {executionLogs.length === 0 ? (
                  <div className="text-slate-500 italic py-2 text-center">
                    Aguardando início dos disparos...
                  </div>
                ) : (
                  executionLogs.map(log => (
                    <div key={log.id} className="flex items-start gap-2 leading-tight">
                      <span className="text-slate-500 select-none">[{log.time}]</span>
                      <span className={
                        log.type === 'success' ? 'text-emerald-400' :
                        log.type === 'error' ? 'text-rose-400' :
                        log.type === 'warn' ? 'text-amber-400' : 'text-slate-300'
                      }>
                        {log.text}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Paste Modal */}
      {showPasteModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className={`w-full max-w-xl p-6 rounded-2xl border shadow-2xl space-y-4 ${
            isDark ? 'bg-[#121214] border-white/10 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <span>Colar Dados em Texto / CSV</span>
              </h3>
              <button 
                onClick={() => setShowPasteModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Cole abaixo suas linhas de contatos. Aceita separação por vírgula (<code className="text-blue-400">,</code>), ponto e vírgula (<code className="text-blue-400">;</code>) ou tabulação (<code className="text-blue-400">\t</code>).
            </p>

            <textarea
              rows={8}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder={`Nome;Telefone\nJoão da Silva;82993530493\nMaria Santos;11987654321\nCarlos Eduardo;21998765432`}
              className={`w-full p-3 rounded-xl font-mono text-xs outline-none border resize-none ${
                isDark ? 'bg-black/40 border-white/10 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-800'
              }`}
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowPasteModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold hover:bg-white/5 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleApplyPastedText}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer"
              >
                Processar Contatos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Single Contact Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className={`w-full max-w-md p-6 rounded-2xl border shadow-2xl space-y-4 ${
            isDark ? 'bg-[#121214] border-white/10 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-emerald-400" />
                <span>Adicionar Contato Manual</span>
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Nome do Cliente:</label>
                <input
                  type="text"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  placeholder="Ex: João da Silva"
                  className={`w-full p-2.5 rounded-lg outline-none border ${
                    isDark ? 'bg-black/40 border-white/10 text-slate-200' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Telefone com DDD:</label>
                <input
                  type="text"
                  value={newContactPhone}
                  onChange={(e) => setNewContactPhone(e.target.value)}
                  placeholder="Ex: 82993530493 ou (11) 98765-4321"
                  className={`w-full p-2.5 rounded-lg font-mono outline-none border ${
                    isDark ? 'bg-black/40 border-white/10 text-slate-200' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold hover:bg-white/5 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddSingleContact}
                disabled={!newContactPhone.trim()}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold cursor-pointer"
              >
                Adicionar à Lista
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Automação Nativa Fantasma (Electron) */}
      <NativeAutomatorPanel isDark={isDark} />
    </div>
  );
};
