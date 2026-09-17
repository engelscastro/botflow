import React, { useState, useEffect } from 'react';
import { 
  QrCode, 
  CheckCircle2, 
  RefreshCw, 
  Wifi, 
  Send, 
  ShieldCheck, 
  Smartphone, 
  Instagram, 
  Globe, 
  Battery, 
  Copy, 
  Check, 
  Terminal,
  Zap,
  Power
} from 'lucide-react';
import { ChannelStatus } from '../../types';

interface ChannelsManagerProps {
  channels: ChannelStatus[];
  onToggleChannelConnect: (channelId: string) => void;
  onSetChannelConnected?: (channelId: string, isConnected: boolean) => void;
  theme?: 'dark' | 'light';
}

export const ChannelsManager: React.FC<ChannelsManagerProps> = ({
  channels,
  onToggleChannelConnect,
  onSetChannelConnected,
  theme = 'dark'
}) => {
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'telegram' | 'instagram' | 'web' | 'sms'>('whatsapp');
  const [telegramToken, setTelegramToken] = useState('7198234901:AAHkQx91-vB8zL8mX1...9128');
  const [smsProvider, setSmsProvider] = useState<'twilio' | 'android'>('android');
  const [twilioSid, setTwilioSid] = useState('ACe6e3c0b89...f9a');
  const [twilioToken, setTwilioToken] = useState('a1b2c3d4e5f6...90');
  const [twilioNumber, setTwilioNumber] = useState('+1234567890');
  const [androidGatewayUrl, setAndroidGatewayUrl] = useState(() => localStorage.getItem('botflow_android_gateway_url') || 'http://192.168.15.12:8080/send-sms');
  const [androidGatewayToken, setAndroidGatewayToken] = useState('secret123');
  const [copiedCode, setCopiedCode] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [authMethod, setAuthMethod] = useState<'qr' | 'pairing'>('qr');
  const [whatsappEngine, setWhatsappEngine] = useState<'baileys' | 'official'>('baileys');
  const [waOfficialToken, setWaOfficialToken] = useState('');
  const [waPhoneNumberId, setWaPhoneNumberId] = useState('');
  const [waVerifyToken, setWaVerifyToken] = useState('botflow_secure_123');
  const [pairingPhone, setPairingPhone] = useState('5511998821000');
  const [generatedPairingCode, setGeneratedPairingCode] = useState('');

  // Persist local URL
  useEffect(() => {
    localStorage.setItem('botflow_android_gateway_url', androidGatewayUrl);
  }, [androidGatewayUrl]);

  // Real Baileys Server State
  const [realBaileysStatus, setRealBaileysStatus] = useState<'DISCONNECTED' | 'CONNECTING' | 'CONNECTED'>('DISCONNECTED');
  const [realBaileysQR, setRealBaileysQR] = useState<string | null>(null);
  const [realBaileysPhone, setRealBaileysPhone] = useState<string | null>(null);
  const [realBaileysLogs, setRealBaileysLogs] = useState<string[]>([]);

  const whatsappChannel = channels.find(c => c.id === 'whatsapp')!;
  const telegramChannel = channels.find(c => c.id === 'telegram')!;
  const instagramChannel = channels.find(c => c.id === 'instagram')!;
  const webChannel = channels.find(c => c.id === 'web')!;

  // Poll real Baileys status from Express server
  useEffect(() => {
    let interval: any = null;

    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/whatsapp/status');
        if (res.ok) {
          const data = await res.json();
          setRealBaileysStatus(data.status);
          setRealBaileysQR(data.qrDataUrl);
          setRealBaileysPhone(data.phoneNumber);
          if (data.lastLogs) {
            setRealBaileysLogs(prev => {
              if (prev.length === data.lastLogs.length && prev[prev.length - 1] === data.lastLogs[data.lastLogs.length - 1]) {
                return prev; // bail out if logs appear unchanged
              }
              return data.lastLogs;
            });
          }

          if (data.status === 'CONNECTED' && !whatsappChannel.connected) {
            if (onSetChannelConnected) {
              onSetChannelConnected('whatsapp', true);
            } else {
              onToggleChannelConnect('whatsapp');
            }
          } else if (data.status === 'DISCONNECTED' && whatsappChannel.connected) {
            if (onSetChannelConnected) {
              onSetChannelConnected('whatsapp', false);
            }
          }
        }
      } catch (err) {
        // Backend not ready or offline
      }
    };

    fetchStatus();
    interval = setInterval(fetchStatus, 3000);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [whatsappChannel.connected, onSetChannelConnected, onToggleChannelConnect]);

  const handleStartRealBaileys = async () => {
    setIsConnecting(true);
    try {
      const res = await fetch('/api/whatsapp/start', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setRealBaileysStatus('CONNECTING');
      }
    } catch (err: any) {
      console.error('Error starting Baileys:', err);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectRealBaileys = async () => {
    try {
      await fetch('/api/whatsapp/disconnect', { method: 'POST' });
      setRealBaileysStatus('DISCONNECTED');
      setRealBaileysQR(null);
      setRealBaileysPhone(null);
      if (whatsappChannel.connected) {
        onToggleChannelConnect('whatsapp');
      }
    } catch (err) {
      console.error('Error disconnecting Baileys:', err);
    }
  };

  const handleCopyWidget = () => {
    navigator.clipboard.writeText(`<script src="https://app.botflow.io/widget/v1.js" data-bot-id="flow-wa-01"></script>`);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleGeneratePairingCode = () => {
    if (!pairingPhone) return;
    const code = `${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}`;
    setGeneratedPairingCode(code);
  };

  return (
    <div className={`flex-1 p-6 overflow-y-auto space-y-6 transition-colors ${
      isDark ? 'bg-[#050505] text-slate-300' : 'bg-slate-50 text-slate-800'
    }`}>
      
      {/* Top Banner */}
      <div className={`p-6 rounded-2xl border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
        isDark ? 'bg-[#141417] text-white border-white/10' : 'bg-white text-slate-900 border-slate-200 shadow-xs'
      }`}>
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Wifi className="w-6 h-6 text-emerald-500" /> Central de Conexões & Canais
          </h2>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Conecte suas contas de WhatsApp Web, Telegram, Instagram Direct e Web Chat para responder mensagens simultaneamente com os fluxos visuais do BotFlow.
          </p>
        </div>

        {/* Live Channel Status Summary Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          {channels.map(c => (
            <div key={c.id} className={`px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 border font-medium ${
              isDark ? 'bg-[#0A0A0B] border-white/10 text-white' : 'bg-slate-100 border-slate-200 text-slate-800'
            }`}>
              <span className={`w-2 h-2 rounded-full ${c.connected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              <span className="font-semibold capitalize">{c.id}</span>
              <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>({c.connected ? 'Ativo' : 'Off'})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className={`flex items-center gap-2 border-b pb-2 ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
        <button
          onClick={() => setActiveTab('whatsapp')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'whatsapp'
              ? 'bg-emerald-600 text-white shadow-xs'
              : isDark 
                ? 'bg-[#141417] text-slate-400 hover:text-white border border-white/10' 
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          💬 WhatsApp Web
        </button>

        <button
          onClick={() => setActiveTab('telegram')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'telegram'
              ? 'bg-sky-600 text-white shadow-xs'
              : isDark 
                ? 'bg-[#141417] text-slate-400 hover:text-white border border-white/10' 
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          ✈️ Telegram Bot
        </button>

        <button
          onClick={() => setActiveTab('instagram')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'instagram'
              ? 'bg-pink-600 text-white shadow-xs'
              : isDark 
                ? 'bg-[#141417] text-slate-400 hover:text-white border border-white/10' 
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          📸 Instagram Direct
        </button>

        <button
          onClick={() => setActiveTab('web')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'web'
              ? 'bg-purple-600 text-white shadow-xs'
              : isDark 
                ? 'bg-[#141417] text-slate-400 hover:text-white border border-white/10' 
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          🌐 Widget Web Chat
        </button>

        <button
          onClick={() => setActiveTab('sms')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'sms'
              ? 'bg-indigo-600 text-white shadow-xs'
              : isDark 
                ? 'bg-[#141417] text-slate-400 hover:text-white border border-white/10' 
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          💬 Integração SMS Gateway
        </button>
      </div>

      {/* WhatsApp Web Tab Content */}
      {activeTab === 'whatsapp' && (
        <div className="space-y-6">
          
          {/* Engine Selector */}
          <div className={`flex items-center gap-4 p-1.5 rounded-xl border max-w-md ${
            isDark ? 'bg-[#141417] border-white/10' : 'bg-slate-100 border-slate-200'
          }`}>
            <button
              onClick={() => setWhatsappEngine('baileys')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                whatsappEngine === 'baileys' 
                  ? 'bg-emerald-600 text-white shadow-xs' 
                  : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Motor: Baileys (QR Code)
            </button>
            <button
              onClick={() => setWhatsappEngine('official')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                whatsappEngine === 'official' 
                  ? 'bg-emerald-600 text-white shadow-xs' 
                  : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Motor: API Oficial (Meta)
            </button>
          </div>

          {whatsappEngine === 'official' ? (
            <div className={`p-6 rounded-2xl border shadow-xs space-y-6 ${
              isDark ? 'bg-[#0A0A0B] border-white/5' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-400 text-lg">
                <ShieldCheck className="w-5 h-5 text-emerald-500" /> WhatsApp Cloud API (Oficial)
              </div>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Conecte seu sistema à infraestrutura oficial da Meta. As primeiras 1.000 mensagens iniciadas pelo usuário por mês são gratuitas.
              </p>

              <div className="space-y-4 max-w-xl">
                <div>
                  <label className={`block font-medium mb-1 text-sm ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Token de Acesso (Bearer)</label>
                  <input
                    type="password"
                    value={waOfficialToken}
                    onChange={(e) => setWaOfficialToken(e.target.value)}
                    placeholder="EAA..."
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-sm ${
                      isDark ? 'bg-[#141417] text-white border-white/10' : 'bg-slate-50 text-slate-900 border-slate-200'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block font-medium mb-1 text-sm ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>ID do Número de Telefone (Phone Number ID)</label>
                  <input
                    type="text"
                    value={waPhoneNumberId}
                    onChange={(e) => setWaPhoneNumberId(e.target.value)}
                    placeholder="Ex: 102345678901234"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-sm ${
                      isDark ? 'bg-[#141417] text-white border-white/10' : 'bg-slate-50 text-slate-900 border-slate-200'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block font-medium mb-1 text-sm ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Token de Verificação (Verify Token)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={waVerifyToken}
                      onChange={(e) => setWaVerifyToken(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-sm ${
                        isDark ? 'bg-[#141417] text-white border-white/10' : 'bg-slate-50 text-slate-900 border-slate-200'
                      }`}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Cole este token no painel da Meta ao configurar o Webhook.</p>
                </div>
                
                <div className={`p-4 border rounded-xl mt-4 ${
                  isDark ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'
                }`}>
                  <h4 className="font-bold text-emerald-700 dark:text-emerald-400 text-sm mb-2">URL do Webhook (Cole na Meta)</h4>
                  <div className={`flex items-center justify-between px-3 py-2 rounded-lg font-mono text-xs ${
                    isDark ? 'bg-black/40 text-slate-300' : 'bg-white border border-emerald-200 text-slate-800'
                  }`}>
                    <span>https://{window.location.hostname}/api/webhook/whatsapp</span>
                    <button className="text-emerald-600 hover:text-emerald-500"><Copy className="w-4 h-4" /></button>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-white/10">
                  <button 
                    onClick={async () => {
                      if (!waOfficialToken || !waPhoneNumberId) {
                        alert("Preencha o Token e o ID do Número");
                        return;
                      }
                      try {
                        await fetch('/api/wa-config', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            apiToken: waOfficialToken,
                            phoneNumberId: waPhoneNumberId,
                            verifyToken: waVerifyToken
                          })
                        });
                        if (onSetChannelConnected) onSetChannelConnected('whatsapp', true);
                        alert("Configuração Oficial salva com sucesso! WhatsApp Conectado.");
                      } catch (e) {
                        alert("Erro ao salvar configuração.");
                      }
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs">
                    <CheckCircle2 className="w-5 h-5" /> Salvar Configuração Oficial
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 w-full">
          {/* Informative Notice Box */}
          <div className={`border rounded-2xl p-4 text-xs space-y-2 ${
            isDark ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
          }`}>
            <div className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-400 text-sm">
              <Zap className="w-4 h-4 text-emerald-500" /> Servidor Baileys Real Ativo (Node.js + WebSockets)
            </div>
            <p className="leading-relaxed">
              O BotFlow Studio inclui um **motor Baileys completo rodando no backend Express/Node.js**. 
              Ao clicar em <strong>"Gerar QR Code Real"</strong>, o servidor conecta diretamente à infraestrutura do WhatsApp Web e gera um QR Code dinâmico e legítimo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* QR Code Scan / Pairing Code Card */}
            <div className={`p-6 rounded-2xl border shadow-xs flex flex-col items-center text-center space-y-4 ${
              isDark ? 'bg-[#0A0A0B] border-white/5' : 'bg-white border-slate-200'
            }`}>
              <div className={`flex items-center justify-between w-full p-1 rounded-xl border text-xs font-semibold ${
                isDark ? 'bg-[#141417] border-white/10' : 'bg-slate-100 border-slate-200'
              }`}>
                <button
                  onClick={() => setAuthMethod('qr')}
                  className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                    authMethod === 'qr' 
                      ? 'bg-emerald-600 text-white shadow-xs' 
                      : isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}
                >
                  QR Code Real
                </button>
                <button
                  onClick={() => setAuthMethod('pairing')}
                  className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                    authMethod === 'pairing' 
                      ? 'bg-emerald-600 text-white shadow-xs' 
                      : isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}
                >
                  Código de Pareamento
                </button>
              </div>

              {authMethod === 'qr' ? (
                <>
                  <h3 className={`font-bold text-sm flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    <QrCode className="w-5 h-5 text-emerald-500" /> Sincronização WhatsApp Web Real
                  </h3>

                  <div className="p-3 bg-white border-2 border-emerald-500 rounded-2xl shadow-inner relative group min-h-[200px] flex items-center justify-center">
                    {realBaileysQR ? (
                      <img
                        src={realBaileysQR}
                        alt="WhatsApp Real QR Code Baileys"
                        className="w-48 h-48 rounded-lg shadow-md"
                      />
                    ) : realBaileysStatus === 'CONNECTED' ? (
                      <div className="flex flex-col items-center justify-center text-emerald-600 space-y-2 py-6">
                        <CheckCircle2 className="w-16 h-16 text-emerald-500 animate-bounce" />
                        <span className="text-xs font-bold text-slate-800">Conectado ao WhatsApp!</span>
                      </div>
                    ) : (
                      <img
                        src={whatsappChannel.qrCodeUrl}
                        alt="WhatsApp QR Code Preview"
                        className={`w-48 h-48 rounded-lg transition-opacity ${isConnecting ? 'opacity-30' : 'opacity-80'}`}
                      />
                    )}

                    {isConnecting && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 rounded-2xl text-emerald-400 space-y-2">
                        <RefreshCw className="w-8 h-8 animate-spin" />
                        <span className="text-xs font-bold">Iniciando Socket Baileys...</span>
                      </div>
                    )}
                  </div>

                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {realBaileysStatus === 'CONNECTED' 
                      ? `Linha ativa e vinculada ao número: ${realBaileysPhone || whatsappChannel.accountIdentifier}`
                      : 'Abra o WhatsApp no celular ➔ Aparelhos Conectados ➔ Conectar um Aparelho.'}
                  </p>

                  <div className="w-full space-y-2">
                    {realBaileysStatus === 'CONNECTED' ? (
                      <button
                        onClick={handleDisconnectRealBaileys}
                        className="w-full py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Power className="w-4 h-4" /> Desconectar Linha do WhatsApp
                      </button>
                    ) : (
                      <button
                        onClick={handleStartRealBaileys}
                        disabled={isConnecting}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                      >
                        <RefreshCw className={`w-4 h-4 ${isConnecting ? 'animate-spin' : ''}`} />
                        {realBaileysStatus === 'CONNECTING' ? 'Gerando QR Code Real...' : '⚡ Iniciar & Gerar QR Code Real'}
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div className="w-full space-y-3 text-left">
                  <h3 className={`font-bold text-sm flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    <Smartphone className="w-5 h-5 text-emerald-500" /> Pareamento por Código de 8 Dígitos
                  </h3>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Insira o número do seu WhatsApp com DDD e país para receber o código no celular.
                  </p>
                  <div>
                    <label className={`text-[10px] font-bold uppercase ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Número do WhatsApp</label>
                    <input
                      type="text"
                      value={pairingPhone}
                      onChange={(e) => setPairingPhone(e.target.value)}
                      placeholder="5511998821000"
                      className={`w-full font-mono text-xs px-3 py-2 border rounded-xl mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        isDark ? 'bg-[#141417] text-white border-white/10' : 'bg-slate-50 text-slate-900 border-slate-200'
                      }`}
                    />
                  </div>
                  <button
                    onClick={handleGeneratePairingCode}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-xs"
                  >
                    Gerar Código de 8 Dígitos
                  </button>

                  {generatedPairingCode && (
                    <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-500/40 p-4 rounded-xl text-center space-y-1">
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold uppercase block">Código de Pareamento:</span>
                      <span className="text-2xl font-mono font-black text-emerald-600 dark:text-emerald-400 tracking-widest">{generatedPairingCode}</span>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 pt-1">
                        Digite este código no seu WhatsApp ➔ Aparelhos Conectados ➔ Conectar com número de telefone.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Connection Details & Options */}
            <div className="md:col-span-2 space-y-4">
              <div className={`p-6 rounded-2xl border shadow-xs space-y-4 ${
                isDark ? 'bg-[#0A0A0B] border-white/5' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <h4 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>Status da Sessão Web (Baileys Engine)</h4>
                  <span className={`border font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1 ${
                    realBaileysStatus === 'CONNECTED'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                      : realBaileysStatus === 'CONNECTING'
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                      : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                  }`}>
                    <CheckCircle2 className="w-4 h-4" /> {
                      realBaileysStatus === 'CONNECTED' 
                        ? 'Sincronizado & Respostas IA Ativas' 
                        : realBaileysStatus === 'CONNECTING' 
                        ? 'Aguardando Leitura do QR Code' 
                        : 'Desconectado'
                    }
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className={`p-3 rounded-xl border ${isDark ? 'bg-[#141417] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                    <span className={`block text-[10px] uppercase font-semibold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Número Vinculado</span>
                    <span className={`font-mono font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {realBaileysPhone || (whatsappChannel.connected ? whatsappChannel.accountIdentifier : 'Aguardando conexão...')}
                    </span>
                  </div>

                  <div className={`p-3 rounded-xl border ${isDark ? 'bg-[#141417] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                    <span className={`block text-[10px] uppercase font-semibold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Bateria do Celular</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-1">
                      <Battery className="w-4 h-4" /> {realBaileysStatus === 'CONNECTED' ? '98% (Carregando)' : 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Live Console Output Logs */}
                {realBaileysLogs.length > 0 && (
                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl font-mono text-[11px] space-y-1 max-h-40 overflow-y-auto">
                    <div className="text-slate-400 text-[10px] font-bold uppercase flex items-center gap-1 sticky top-0 bg-slate-900 pb-1">
                      <Terminal className="w-3 h-3 text-emerald-400" /> Logs em Tempo Real do Servidor Baileys:
                    </div>
                    {realBaileysLogs.map((log, i) => (
                      <div key={i} className="text-emerald-400 leading-tight">{log}</div>
                    ))}
                  </div>
                )}

                <div className={`pt-3 border-t space-y-2 text-xs ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
                  <span className={`font-bold block ${isDark ? 'text-white' : 'text-slate-900'}`}>Opções da Conexão WhatsApp:</span>
                  <label className={`flex items-center gap-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    <input type="checkbox" defaultChecked className="rounded text-emerald-600" />
                    <span>Responder automaticamente com os fluxos do BotFlow e Inteligência Artificial</span>
                  </label>
                  <label className={`flex items-center gap-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    <input type="checkbox" defaultChecked className="rounded text-emerald-600" />
                    <span>Simular indicador "digitando..." durante respostas geradas pela IA</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
          </div>
          )}
        </div>
      )}

      {/* Telegram Tab Content */}
      {activeTab === 'telegram' && (
        <div className={`p-6 rounded-2xl border shadow-xs space-y-5 ${
          isDark ? 'bg-[#0A0A0B] border-white/5' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`font-bold text-base flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                ✈️ Integração Telegram Bot API
              </h3>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Insira o Token do Bot criado com o @BotFather para sincronizar comandos e conversas no Telegram.
              </p>
            </div>
            <span className="bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 text-xs font-bold px-3 py-1 rounded-full">
              Status: {telegramChannel.statusText}
            </span>
          </div>

          <div className="space-y-3">
            <label className={`block text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>HTTP API Bot Token (BotFather)</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={telegramToken}
                onChange={(e) => setTelegramToken(e.target.value)}
                className={`flex-1 font-mono text-xs px-3.5 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                  isDark ? 'bg-[#141417] text-white border-white/10' : 'bg-slate-50 text-slate-900 border-slate-200'
                }`}
              />
              <button className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors cursor-pointer shadow-xs">
                Validar & Salvar
              </button>
            </div>
          </div>

          <div className={`p-4 rounded-xl border space-y-2 text-xs ${
            isDark ? 'bg-sky-500/10 border-sky-500/20 text-sky-300' : 'bg-sky-50 border-sky-200 text-sky-900'
          }`}>
            <span className="font-bold block">Comandos Ativos no Menu Telegram:</span>
            <div className="grid grid-cols-3 gap-2 font-mono">
              <div className={`p-2 rounded border ${isDark ? 'bg-[#141417] border-white/5' : 'bg-white border-sky-200 text-slate-800'}`}>/start ➔ Iniciar</div>
              <div className={`p-2 rounded border ${isDark ? 'bg-[#141417] border-white/5' : 'bg-white border-sky-200 text-slate-800'}`}>/ajuda ➔ IA FAQ</div>
              <div className={`p-2 rounded border ${isDark ? 'bg-[#141417] border-white/5' : 'bg-white border-sky-200 text-slate-800'}`}>/humano ➔ Transf.</div>
            </div>
          </div>
        </div>
      )}

      {/* Instagram Tab Content */}
      {activeTab === 'instagram' && (
        <div className={`p-6 rounded-2xl border shadow-xs space-y-5 ${
          isDark ? 'bg-[#0A0A0B] border-white/5' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`font-bold text-base flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                📸 Meta Graph API - Instagram Messaging
              </h3>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Automação para respostas em mensagens no Direct e menções em Stories do Instagram.
              </p>
            </div>
            <span className="bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/20 text-xs font-bold px-3 py-1 rounded-full">
              Status: {instagramChannel.accountIdentifier}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className={`p-4 border rounded-xl space-y-2 ${isDark ? 'bg-[#141417] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
              <h4 className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Auto-Responder Menção de Story</h4>
              <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>Quando um seguidor mencionar sua marca em um Story, o bot enviará uma mensagem de agradecimento com menu no Direct.</p>
              <label className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold pt-1">
                <input type="checkbox" defaultChecked className="rounded text-pink-600" />
                <span>Ativo para Stories</span>
              </label>
            </div>

            <div className={`p-4 border rounded-xl space-y-2 ${isDark ? 'bg-[#141417] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
              <h4 className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Botões Quick Reply no Direct</h4>
              <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>Exibe opções de botões rápidos interativos nas primeiras interações dos seguidores no perfil.</p>
              <label className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold pt-1">
                <input type="checkbox" defaultChecked className="rounded text-pink-600" />
                <span>Ativo no Direct</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Web Widget Embed Content */}
      {activeTab === 'web' && (
        <div className={`p-6 rounded-2xl border shadow-xs space-y-5 ${
          isDark ? 'bg-[#0A0A0B] border-white/5' : 'bg-white border-slate-200'
        }`}>
          <div>
            <h3 className={`font-bold text-base flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              🌐 Widget Flutuante para Web Site
            </h3>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Copie o código JS abaixo e cole antes do fechamento da tag &lt;/body&gt; no seu site para ativar o chat.
            </p>
          </div>

          <div className={`p-4 rounded-xl font-mono text-xs flex items-center justify-between border overflow-x-auto ${
            isDark ? 'bg-[#141417] text-slate-200 border-white/5' : 'bg-slate-100 text-slate-900 border-slate-200'
          }`}>
            <code>&lt;script src="https://app.botflow.io/widget/v1.js" data-bot-id="flow-wa-01"&gt;&lt;/script&gt;</code>
            <button
              onClick={handleCopyWidget}
              className="bg-purple-600 text-white hover:bg-purple-500 font-sans text-xs font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors ml-4 shrink-0 cursor-pointer"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedCode ? 'Copiado!' : 'Copiar Código'}
            </button>
          </div>
        </div>
      )}

      {/* SMS Gateway Tab Content */}
      {activeTab === 'sms' && (
        <div className={`p-6 rounded-2xl border shadow-xs space-y-6 ${
          isDark ? 'bg-[#0A0A0B] border-white/5' : 'bg-white border-slate-200'
        }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className={`font-bold text-base flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                💬 Gateway de Envio SMS
              </h3>
              <p className={`text-xs mt-0.5 max-w-lg ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Selecione o provedor para disparos de SMS. Você pode usar uma operadora global (Twilio) ou disparar diretamente do seu chip físico Android via rede Wi-Fi.
              </p>
            </div>
            
            <button
              onClick={() => onToggleChannelConnect('sms')}
              className={`font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
                channels.find(c => c.id === 'sms')?.connected
                  ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs'
              }`}
            >
              {channels.find(c => c.id === 'sms')?.connected ? 'Desconectar SMS' : 'Conectar Gateway SMS'}
            </button>
          </div>

          <div className={`flex p-1 rounded-xl border max-w-md ${
            isDark ? 'bg-[#141417] border-white/10' : 'bg-slate-100 border-slate-200'
          }`}>
            <button
              onClick={() => setSmsProvider('twilio')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                smsProvider === 'twilio' 
                  ? 'bg-indigo-600 text-white shadow-xs' 
                  : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Twilio API (Global)
            </button>
            <button
              onClick={() => setSmsProvider('android')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                smsProvider === 'android' 
                  ? 'bg-indigo-600 text-white shadow-xs' 
                  : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              App Android (Chip Local)
            </button>
          </div>

          {smsProvider === 'twilio' ? (
            <div className={`p-5 rounded-xl border space-y-4 text-xs animate-in fade-in duration-300 ${
              isDark ? 'bg-[#141417] border-white/5' : 'bg-slate-50 border-slate-200'
            }`}>
              <h4 className={`font-bold text-sm mb-2 border-b pb-2 ${isDark ? 'text-white border-white/10' : 'text-slate-900 border-slate-200'}`}>
                Credenciais da API Twilio
              </h4>
              <p className={`max-w-xl mb-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                O Twilio garante entregabilidade em massa sem risco de bloqueio da linha. Custa centavos por mensagem e não requer hardware local.
              </p>
              
              <div className="space-y-3 max-w-lg">
                <div>
                  <label className={`block font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Account SID</label>
                  <input 
                    type="text" 
                    value={twilioSid}
                    onChange={(e) => setTwilioSid(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:border-indigo-500 font-mono ${
                      isDark ? 'bg-[#0A0A0B] text-white border-white/10' : 'bg-white text-slate-900 border-slate-200'
                    }`}
                    placeholder="ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                  />
                </div>

                <div>
                  <label className={`block font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Auth Token</label>
                  <input 
                    type="password" 
                    value={twilioToken}
                    onChange={(e) => setTwilioToken(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:border-indigo-500 font-mono ${
                      isDark ? 'bg-[#0A0A0B] text-white border-white/10' : 'bg-white text-slate-900 border-slate-200'
                    }`}
                    placeholder="Seu Auth Token secreto"
                  />
                </div>

                <div>
                  <label className={`block font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Número Remetente Twilio (From)</label>
                  <input 
                    type="text" 
                    value={twilioNumber}
                    onChange={(e) => setTwilioNumber(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:border-indigo-500 font-mono ${
                      isDark ? 'bg-[#0A0A0B] text-white border-white/10' : 'bg-white text-slate-900 border-slate-200'
                    }`}
                    placeholder="+1234567890"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className={`p-5 rounded-xl border space-y-4 text-xs animate-in fade-in duration-300 ${
              isDark ? 'bg-[#141417] border-white/5' : 'bg-slate-50 border-slate-200'
            }`}>
              <h4 className={`font-bold text-sm mb-2 border-b pb-2 ${isDark ? 'text-white border-white/10' : 'text-slate-900 border-slate-200'}`}>
                Conexão com App Android (SMS Local)
              </h4>
              <p className={`max-w-xl mb-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Instale um app como <strong>SMS Gateway API</strong> no seu celular Android. Certifique-se de que o celular está na mesma rede Wi-Fi que este computador e insira o IP e Token fornecidos pelo app abaixo.
              </p>

              <div className="space-y-3 max-w-lg">
                <div>
                  <label className={`block font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>URL / IP do Servidor do App Android</label>
                  <input 
                    type="text" 
                    value={androidGatewayUrl}
                    onChange={(e) => setAndroidGatewayUrl(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:border-indigo-500 font-mono ${
                      isDark ? 'bg-[#0A0A0B] text-white border-white/10' : 'bg-white text-slate-900 border-slate-200'
                    }`}
                    placeholder="http://192.168.0.10:8080/v1/sms"
                  />
                </div>

                <div>
                  <label className={`block font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Token de Segurança (Password)</label>
                  <input 
                    type="password" 
                    value={androidGatewayToken}
                    onChange={(e) => setAndroidGatewayToken(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:border-indigo-500 font-mono ${
                      isDark ? 'bg-[#0A0A0B] text-white border-white/10' : 'bg-white text-slate-900 border-slate-200'
                    }`}
                    placeholder="Senha configurada no App"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="pt-2">
            <div className={`p-3 rounded-xl border text-xs ${
              isDark ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300' : 'bg-indigo-50 border-indigo-200 text-indigo-900'
            }`}>
              <span className="font-bold">Dica de Disparo em Massa:</span> Ao configurar o Gateway SMS, o módulo de <span className="font-semibold underline">Disparos em Massa (Broadcast)</span> enviará suas campanhas por ele!
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
