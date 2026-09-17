import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  WASocket
} from '@whiskeysockets/baileys';
import QRCode from 'qrcode';
import pino from 'pino';
import fs from 'fs';
import path from 'path';

export interface WhatsAppSessionState {
  status: 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED';
  qrDataUrl: string | null;
  phoneNumber: string | null;
  pushName: string | null;
  battery: number;
  lastLogs: string[];
}

export interface StoreMessage {
  id: string;
  from: string; // e.g. +5511999998888 or +5582993530493
  senderName: string;
  text: string;
  sender: 'contact' | 'bot' | 'agent';
  timestamp: string;
}

let sock: WASocket | null = null;
let currentQR: string | null = null;
let currentQRDataUrl: string | null = null;
let connectionStatus: 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' = 'DISCONNECTED';
let connectedPhone: string | null = null;
let connectedPushName: string | null = null;
let logs: string[] = [];
let messageStore: StoreMessage[] = [];

// Reconnection & lifecycle locks
let reconnectTimer: NodeJS.Timeout | null = null;
let isInitializing: boolean = false;
let storedOnMessageReceived: ((from: string, text: string) => Promise<string | void>) | null = null;
let sessionConnectedAt: number = 0;

export function getWhatsAppMessages(): StoreMessage[] {
  return messageStore;
}

function addLog(msg: string) {
  const time = new Date().toLocaleTimeString('pt-BR');
  const entry = `[${time}] ${msg}`;
  console.log(`[Baileys Engine] ${entry}`);
  logs.unshift(entry);
  if (logs.length > 35) logs.pop();
}

const AUTH_FOLDER = path.join(process.cwd(), 'baileys_auth_info');

export function getWhatsAppSessionState(): WhatsAppSessionState {
  return {
    status: connectionStatus,
    qrDataUrl: currentQRDataUrl,
    phoneNumber: connectedPhone,
    pushName: connectedPushName,
    battery: 98,
    lastLogs: logs
  };
}

// Helper to reliably parse timestamp from Baileys message objects (number, string, or Long)
function getTimestampSeconds(ts: any): number {
  if (!ts) return 0;
  if (typeof ts === 'number') return ts;
  if (typeof ts === 'string') {
    const parsed = parseInt(ts, 10);
    return isNaN(parsed) ? 0 : parsed;
  }
  if (typeof ts === 'object' && ts !== null) {
    if (typeof ts.toNumber === 'function') {
      try {
        return ts.toNumber();
      } catch (e) {
        // ignore
      }
    }
    if (typeof ts.low === 'number' && ts.low > 0) {
      return ts.low;
    }
  }
  return 0;
}

// Helper to resolve the exact JID registered on WhatsApp servers
async function resolveJid(sockInstance: WASocket | null, inputPhoneOrJid: string): Promise<{ jid: string; formattedPhone: string }> {
  if (!inputPhoneOrJid) {
    return { jid: '', formattedPhone: '' };
  }

  // Preserve LID JIDs (@lid) directly
  if (inputPhoneOrJid.endsWith('@lid')) {
    const cleanNumber = inputPhoneOrJid.split('@')[0];
    return { jid: inputPhoneOrJid, formattedPhone: `+${cleanNumber}` };
  }

  if (inputPhoneOrJid.endsWith('@s.whatsapp.net')) {
    const cleanNumber = inputPhoneOrJid.split('@')[0];
    return { jid: inputPhoneOrJid, formattedPhone: `+${cleanNumber}` };
  }

  let cleanNumber = inputPhoneOrJid.replace(/\D/g, '');
  if (!cleanNumber) {
    return { jid: inputPhoneOrJid, formattedPhone: inputPhoneOrJid };
  }

  // If Brazilian number without DDI 55, add it
  if (cleanNumber.length === 10 || cleanNumber.length === 11) {
    cleanNumber = `55${cleanNumber}`;
  }

  let resolvedJid = `${cleanNumber}@s.whatsapp.net`;
  let formattedPhone = `+${cleanNumber}`;

  try {
    if (sockInstance && typeof sockInstance.onWhatsApp === 'function') {
      const checkNumber = async (num: string) => {
        const queryPromise = sockInstance.onWhatsApp(num);
        const timeoutPromise = new Promise<any>((r) => setTimeout(() => r(null), 2500));
        return Promise.race([queryPromise, timeoutPromise]);
      };

      let results = await checkNumber(cleanNumber);
      let found = Array.isArray(results) ? results.find(r => r.exists && r.jid) : null;

      // Se não encontrou e for número brasileiro, tenta a variação do 9º dígito
      if (!found && cleanNumber.startsWith('55')) {
        let altNumber = null;
        if (cleanNumber.length === 13) {
          // Remove o 9º dígito: 55 + DDD + 9 + XXXX-XXXX -> 55 + DDD + XXXX-XXXX
          altNumber = `55${cleanNumber.substring(2, 4)}${cleanNumber.substring(5)}`;
        } else if (cleanNumber.length === 12) {
          // Adiciona o 9º dígito: 55 + DDD + XXXX-XXXX -> 55 + DDD + 9 + XXXX-XXXX
          altNumber = `55${cleanNumber.substring(2, 4)}9${cleanNumber.substring(4)}`;
        }
        
        if (altNumber) {
          results = await checkNumber(altNumber);
          found = Array.isArray(results) ? results.find(r => r.exists && r.jid) : null;
          if (found) {
            cleanNumber = altNumber; // Usa o número alternativo validado
          }
        }
      }

      if (found && found.jid) {
        resolvedJid = found.jid;
        const exactPhone = found.jid.split('@')[0];
        formattedPhone = `+${exactPhone}`;
      }
    }
  } catch (err) {
    // Fallback to standard JID
  }

  return { jid: resolvedJid, formattedPhone };
}

// Unwraps and extracts text/media label from any Baileys message structure
function extractMessageContent(msg: any): { text: string; isMedia: boolean } {
  if (!msg?.message) return { text: '', isMedia: false };

  let messageObj = msg.message as any;

  // Unwrap nested containers
  if (messageObj?.ephemeralMessage?.message) messageObj = messageObj.ephemeralMessage.message;
  if (messageObj?.viewOnceMessage?.message) messageObj = messageObj.viewOnceMessage.message;
  if (messageObj?.viewOnceMessageV2?.message) messageObj = messageObj.viewOnceMessageV2.message;
  if (messageObj?.documentWithCaptionMessage?.message) messageObj = messageObj.documentWithCaptionMessage.message;
  if (messageObj?.editedMessage?.message?.protocolMessage?.editedMessage) {
    messageObj = messageObj.editedMessage.message.protocolMessage.editedMessage;
  }
  if (messageObj?.templateMessage?.hydratedTemplate) messageObj = messageObj.templateMessage.hydratedTemplate;
  if (messageObj?.templateMessage?.hydratedFourRowTemplate) messageObj = messageObj.templateMessage.hydratedFourRowTemplate;
  if (messageObj?.interactiveMessage?.header) {
    // Interactive message
  }

  let text = 
    messageObj?.conversation || 
    messageObj?.extendedTextMessage?.text || 
    messageObj?.imageMessage?.caption || 
    messageObj?.videoMessage?.caption || 
    messageObj?.documentMessage?.caption ||
    messageObj?.buttonsResponseMessage?.selectedDisplayText ||
    messageObj?.buttonsResponseMessage?.selectedButtonId ||
    messageObj?.listResponseMessage?.title ||
    messageObj?.listResponseMessage?.singleSelectReply?.selectedRowId ||
    messageObj?.templateButtonReplyMessage?.selectedDisplayText ||
    messageObj?.templateButtonReplyMessage?.selectedId ||
    messageObj?.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson ||
    '';

  let isMedia = false;
  if (!text) {
    if (messageObj?.imageMessage) { text = '[📷 Imagem]'; isMedia = true; }
    else if (messageObj?.videoMessage) { text = '[🎥 Vídeo]'; isMedia = true; }
    else if (messageObj?.audioMessage) { text = '[🎤 Áudio / Mensagem de Voz]'; isMedia = true; }
    else if (messageObj?.documentMessage) { text = '[📄 Documento]'; isMedia = true; }
    else if (messageObj?.stickerMessage) { text = '[🎨 Figurinha / Sticker]'; isMedia = true; }
    else if (messageObj?.locationMessage || messageObj?.liveLocationMessage) { text = '[📍 Localização]'; isMedia = true; }
    else if (messageObj?.contactMessage || messageObj?.contactsArrayMessage) { text = '[👤 Contato]'; isMedia = true; }
    else if (messageObj?.reactionMessage) { return { text: '', isMedia: false }; }
    else if (messageObj?.protocolMessage) { return { text: '', isMedia: false }; }
  }

  return { text: text.trim(), isMedia };
}

export async function initWhatsAppBaileys(onMessageReceived?: (from: string, text: string) => Promise<string | void>) {
  if (onMessageReceived) {
    storedOnMessageReceived = onMessageReceived;
  }

  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  if (isInitializing) {
    addLog('Handshake já em andamento, aguardando resposta do socket...');
    return;
  }

  if (sock && connectionStatus === 'CONNECTED') {
    addLog('Sessão Baileys já conectada e operacional.');
    return;
  }

  // Clean up any stale socket instance
  if (sock) {
    try {
      sock.ev.removeAllListeners('connection.update');
      sock.ev.removeAllListeners('creds.update');
      sock.ev.removeAllListeners('messages.upsert');
      sock.end(undefined);
    } catch (e) {}
    sock = null;
  }

  isInitializing = true;

  try {
    addLog('Iniciando handshake Baileys com os servidores do WhatsApp...');
    connectionStatus = 'CONNECTING'; 

    if (!fs.existsSync(AUTH_FOLDER)) {
      fs.mkdirSync(AUTH_FOLDER, { recursive: true });
    }

    const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);
    const { version } = await fetchLatestBaileysVersion().catch(() => ({ version: [2, 3000, 1015901307] as [number, number, number] }));

    const activeSocket = makeWASocket({
      version,
      logger: pino({ level: 'silent' }),
      printQRInTerminal: false,
      auth: state,
      browser: ['BotFlow Studio PRO', 'Chrome', '122.0.0.0'],
      connectTimeoutMs: 35000,
      defaultQueryTimeoutMs: 15000,
      keepAliveIntervalMs: 20000,
      markOnlineOnConnect: true,
      syncFullHistory: false,
      retryRequestDelayMs: 300,
      maxMsgRetryCount: 3
    });

    sock = activeSocket;
    isInitializing = false;

    activeSocket.ev.on('creds.update', saveCreds);

    activeSocket.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;
      addLog(`[DEBUG] connection.update: ${JSON.stringify({connection, statusCode: (lastDisconnect?.error as any)?.output?.statusCode})}`);

      if (qr) {
        currentQR = qr;
        try {
          currentQRDataUrl = await QRCode.toDataURL(qr, {
            margin: 2,
            scale: 8,
            color: {
              dark: '#050505',
              light: '#FFFFFF'
            }
          });
          addLog('Novo QR Code Real gerado! Pronto para escaneamento no celular.');
        } catch (err: any) {
          addLog(`Erro ao gerar imagem de QR code: ${err?.message}`);
        }
      }

      if (connection === 'open') {
        connectionStatus = 'CONNECTED';
        sessionConnectedAt = Math.floor(Date.now() / 1000);
        currentQR = null;
        currentQRDataUrl = null;

        const userJid = activeSocket?.user?.id || '';
        const cleanNumber = userJid.split(':')[0].split('@')[0];
        connectedPhone = cleanNumber ? `+${cleanNumber}` : '+55 (11) 99882-1000';
        connectedPushName = activeSocket?.user?.name || 'BotFlow Business';

        addLog(`✅ WhatsApp Conectado com Sucesso! Linha: ${connectedPhone} (${connectedPushName})`);
      }

      if (connection === 'close') {
        const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
        const isLoggedOut = statusCode === DisconnectReason.loggedOut || statusCode === 401;
        const isConflict = statusCode === 440; // Stream conflict / connection replaced
        const isRestartRequired = statusCode === 515; // Restart required

        addLog(`Conexão fechada. Código: ${statusCode || 'Desconhecido'}. Encerrado: ${isLoggedOut}`);

        connectionStatus = 'DISCONNECTED'; 
        currentQRDataUrl = null;

        if (sock === activeSocket) {
          sock = null;
        }

        if (isLoggedOut) {
          addLog('Sessão encerrada pelo usuário ou token revogado. Limpando credenciais...');
          if (fs.existsSync(AUTH_FOLDER)) {
            try {
              fs.rmSync(AUTH_FOLDER, { recursive: true, force: true });
            } catch (e) {}
          }
        } else if (isConflict) {
          // Erro 440: Aguardar 5s para evitar colisão contínua de handshakes
          addLog('⚠️ Conflito de conexão (440). Aguardando 5s para estabilizar antes de reconectar...');
          reconnectTimer = setTimeout(() => {
            initWhatsAppBaileys(storedOnMessageReceived || undefined);
          }, 5000);
        } else if (isRestartRequired) {
          addLog('Sincronização de chaves necessária (515). Reconectando em 1.5s...');
          reconnectTimer = setTimeout(() => {
            initWhatsAppBaileys(storedOnMessageReceived || undefined);
          }, 1500);
        } else {
          addLog('Tentando reconectar automaticamente ao socket do WhatsApp em 3s...');
          reconnectTimer = setTimeout(() => {
            initWhatsAppBaileys(storedOnMessageReceived || undefined);
          }, 3000);
        }
      }
    });

    // Handle Incoming & Outgoing Messages
    activeSocket.ev.on('messages.upsert', async (m) => {
      if (!m.messages || m.messages.length === 0) return;

      const isNotify = m.type === 'notify' || !m.type;

      for (const msg of m.messages) {
        if (!msg.message) continue;

        const from = msg.key.remoteJid || '';

        // Skip status broadcasts, newsletters and group chats
        if (!from || from === 'status@broadcast' || from.endsWith('@g.us') || from.includes('newsletter')) {
          continue;
        }

        const { text } = extractMessageContent(msg);
        if (!text || !text.trim()) continue;

        // Calculate message timestamp age
        const msgTimeSec = getTimestampSeconds(msg.messageTimestamp);
        const nowSec = Math.floor(Date.now() / 1000);
        let ageSec = (msgTimeSec > 0 && nowSec >= msgTimeSec) ? (nowSec - msgTimeSec) : 0;
        
        // Consider message old only if sent long before bot connection and not a live notify
        const isOldMessage = !isNotify && sessionConnectedAt > 0 && msgTimeSec > 0 && (msgTimeSec < sessionConnectedAt - 60);

        const rawPhone = from.replace('@s.whatsapp.net', '').replace('@lid', '').replace(/\D/g, '');
        const formattedPhone = `+${rawPhone}`;
        const cleanPushName = (msg.pushName && msg.pushName.trim() && msg.pushName.trim() !== 'Atendente')
          ? msg.pushName.trim()
          : (formattedPhone.length > 4 ? formattedPhone : 'Cliente WhatsApp');
        const timestamp = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const msgId = msg.key.id || `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

        // If sent from me directly on phone or web
        if (msg.key.fromMe) {
          const exists = messageStore.some(sm => sm.id === msgId);
          if (!exists) {
            messageStore.push({
              id: msgId,
              from: formattedPhone,
              senderName: 'Atendente',
              text: text.trim(),
              sender: 'agent',
              timestamp
            });
          }
          continue;
        }

        // Process message from external contact
        if (isOldMessage) {
          addLog(`⏩ Mensagem antiga de histórico (${ageSec}s de [${cleanPushName}]): "${text}"`);
        } else {
          addLog(`📩 Mensagem recebida em tempo real de [${cleanPushName} ${formattedPhone}]: "${text}"`);
          if (sock && msg.key) {
            sock.readMessages([msg.key]).catch(() => {});
          }
        }

        // Add to local message store so it appears in the Inbox immediately
        const exists = messageStore.some(sm => sm.id === msgId);
        if (!exists) {
          messageStore.push({
            id: msgId,
            from: formattedPhone,
            senderName: cleanPushName,
            text: text.trim(),
            sender: 'contact',
            timestamp
          });
        }

        // Trigger bot auto-reply for live messages
        const handler = storedOnMessageReceived || onMessageReceived;
        if (handler && sock && connectionStatus === 'CONNECTED' && !isOldMessage) {
          try {
            sock.sendPresenceUpdate('composing', from).catch(() => {});

            const replyText = await handler(from, text.trim());

            if (sock && connectionStatus === 'CONNECTED') {
              sock.sendPresenceUpdate('paused', from).catch(() => {});
            }

            if (replyText && sock && connectionStatus === 'CONNECTED') {
              // Send back directly to the source remoteJid (handles both @s.whatsapp.net and @lid)
              const targetJid = from;
              
              await sock.sendMessage(targetJid, { text: replyText });
              addLog(`📤 Resposta enviada em tempo real para [${cleanPushName} ${formattedPhone}]: "${replyText}"`);

              messageStore.push({
                id: `bot-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
                from: formattedPhone,
                senderName: cleanPushName,
                text: replyText,
                sender: 'bot',
                timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
              });
            }
          } catch (err: any) {
            if (connectionStatus !== 'CONNECTED' || err?.message?.includes('Closed') || err?.message?.includes('closed')) {
              addLog(`ℹ️ Tentativa de envio ignorada pois a sessão WhatsApp foi encerrada.`);
            } else {
              addLog(`❌ Erro ao responder mensagem de [${from}]: ${err?.message || err}`);
            }
          }
        }
      }

      // Limit in-memory store size
      if (messageStore.length > 500) {
        messageStore = messageStore.slice(-300);
      }
    });

  } catch (error: any) {
    isInitializing = false;
    addLog(`Erro ao iniciar Baileys: ${error?.message || error}`);
    connectionStatus = 'DISCONNECTED'; 
    sock = null;
  }
}

export async function disconnectWhatsAppBaileys() { addLog("DISCONNECT CALLED!"); console.trace("DISCONNECT CALLED");
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  if (sock) {
    try {
      addLog('Encerrando sessão Baileys por solicitação do usuário...');
      sock.ev.removeAllListeners('connection.update');
      sock.ev.removeAllListeners('creds.update');
      sock.ev.removeAllListeners('messages.upsert');
      await sock.logout().catch(() => {});
      sock.end(undefined);
    } catch (e) {
      // ignore
    }
    sock = null;
  }
  connectionStatus = 'DISCONNECTED'; 
  currentQRDataUrl = null;
  connectedPhone = null;
  sessionConnectedAt = 0;

  if (fs.existsSync(AUTH_FOLDER)) {
    try {
      fs.rmSync(AUTH_FOLDER, { recursive: true, force: true });
    } catch (e) {}
  }
  addLog('Sessão desconectada e credenciais limpas.');
}

export async function sendWhatsAppMessage(
  toJid: string, 
  text: string, 
  recipientName?: string, 
  attachment?: { base64: string; mimetype: string; filename?: string }
): Promise<boolean> {
  if (!sock || connectionStatus !== 'CONNECTED') {
    addLog('Erro: tentativa de enviar mensagem sem sessão conectada.');
    return false;
  }
  try {
    const { jid, formattedPhone } = await resolveJid(sock, toJid);

    sock.sendPresenceUpdate('composing', jid).catch(() => {});
    
    if (attachment) {
      // Decode base64 to buffer
      const buffer = Buffer.from(attachment.base64, 'base64');
      const isVideo = attachment.mimetype.startsWith('video/');
      const isImage = attachment.mimetype.startsWith('image/');
      
      const payload: any = {};
      if (isVideo) {
        payload.video = buffer;
        payload.caption = text.trim();
        if (attachment.mimetype.includes('mp4')) {
          payload.mimetype = 'video/mp4';
        }
      } else if (isImage) {
        payload.image = buffer;
        payload.caption = text.trim();
      } else {
        payload.document = buffer;
        payload.caption = text.trim();
        payload.mimetype = attachment.mimetype;
        payload.fileName = attachment.filename || 'arquivo';
      }
      
      await sock.sendMessage(jid, payload);
      addLog(`📤 Mídia enviada com sucesso para ${jid} (${formattedPhone})`);
    } else {
      await sock.sendMessage(jid, { text: text.trim() });
    }
    
    sock.sendPresenceUpdate('paused', jid).catch(() => {});

    const displayName = recipientName || 'Cliente';
    addLog(`📤 Mensagem enviada com sucesso para ${jid} (${formattedPhone} - ${displayName})`);

    messageStore.push({
      id: `agent-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      from: formattedPhone,
      senderName: displayName,
      text: attachment ? `[Mídia anexada] ${text.trim()}` : text.trim(),
      sender: 'agent',
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    });

    return true;
  } catch (err: any) {
    addLog(`Falha ao enviar mensagem para ${toJid}: ${err?.message || err}`);
    return false;
  }
}


