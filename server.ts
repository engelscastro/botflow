import express from "express";
import path from "path";
import fs from "fs";
import { exec } from "child_process";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import {
  getLogDirectory,
  getAppLogFilePath,
  getErrorLogFilePath,
  readAppLogs,
  clearAppLogs
} from "./server/logger.js";
import {
  initWhatsAppBaileys,
  getWhatsAppSessionState,
  disconnectWhatsAppBaileys,
  sendWhatsAppMessage,
  getWhatsAppMessages
} from "./server/whatsappService.js";
import {
  processFlowIncomingMessage,
  setServerFlows,
  getServerFlows,
  toggleSessionPause
} from "./server/flowEngine.js";
import { parseDocumentBuffer } from "./server/documentParser.js";

import { fileURLToPath } from 'url';
const isESM = typeof import.meta !== 'undefined' && import.meta.url;
const currentFilename = isESM ? fileURLToPath(import.meta.url) : (typeof __filename !== 'undefined' ? __filename : '');
const currentDirname = isESM ? path.dirname(currentFilename) : (typeof __dirname !== 'undefined' ? __dirname : '');

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));

// Initialize Gemini client lazily
let aiClient: GoogleGenAI | null = null;
function getAIClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      aiClient = new GoogleGenAI({ apiKey });
    }
  }
  return aiClient;
}

// Automatic message responder handler for real WhatsApp messages executing active flows
async function handleAutoResponse(fromNumber: string, userPrompt: string): Promise<string | null> {
  return await processFlowIncomingMessage(fromNumber, userPrompt, getAIClient);
}

// Health check endpoint
import { contactsDB, appointmentsDB } from './server/db.js';

app.get("/api/contacts", (req, res) => {
  res.json(contactsDB.getAll());
});

app.get("/api/appointments", (req, res) => {
  res.json(appointmentsDB.getAll());
});


// ==========================================
// WHATSAPP CLOUD API (META) WEBHOOKS
// ==========================================
let metaWaConfig = {
  verifyToken: 'botflow_secure_123',
  apiToken: '',
  phoneNumberId: ''
};

app.post('/api/wa-config', (req, res) => {
  metaWaConfig = { ...metaWaConfig, ...req.body };
  res.json({ success: true, config: metaWaConfig });
});

// Verificação do Webhook (Meta)
app.get('/api/webhook/whatsapp', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === metaWaConfig.verifyToken) {
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(400);
  }
});

// Recebimento de mensagens (Meta)
app.post('/api/webhook/whatsapp', async (req, res) => {
  const body = req.body;
  
  if (body.object) {
    if (body.entry && body.entry[0].changes && body.entry[0].changes[0] && body.entry[0].changes[0].value.messages && body.entry[0].changes[0].value.messages[0]) {
      const waMessage = body.entry[0].changes[0].value.messages[0];
      const from = waMessage.from;
      const text = waMessage.text ? waMessage.text.body : '';
      
      console.log(`[Meta API] Mensagem de ${from}: ${text}`);
      
      // Processa pelo BotFlow
      const aiClient = null; // Instanciar AI se necessário
      const reply = await processFlowIncomingMessage(from, text, () => aiClient);
      
      if (reply) {
         // Responde via Meta API
         if (metaWaConfig.apiToken && metaWaConfig.phoneNumberId) {
            try {
              await fetch(`https://graph.facebook.com/v19.0/${metaWaConfig.phoneNumberId}/messages`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${metaWaConfig.apiToken}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  messaging_product: 'whatsapp',
                  to: from,
                  type: 'text',
                  text: { body: reply }
                })
              });
            } catch (err) {
              console.error("Erro ao responder Meta API", err);
            }
         }
      }
    }
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});


app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// System Logs endpoints
app.get("/api/logs", (req, res) => {
  const data = readAppLogs();
  res.json({
    success: true,
    logsPath: data.path,
    errorLogsPath: data.errorPath,
    logDir: getLogDirectory(),
    content: data.content
  });
});

app.post("/api/logs/open-folder", (req, res) => {
  const dir = getLogDirectory();
  try {
    const cmd = process.platform === 'win32' 
      ? `start "" "${dir}"`
      : process.platform === 'darwin'
      ? `open "${dir}"`
      : `xdg-open "${dir}"`;
    
    exec(cmd, (err) => {
      if (err) {
        console.error('[Logs API] Error opening folder:', err);
        return res.status(500).json({ success: false, message: err.message });
      }
      res.json({ success: true, message: 'Pasta de logs aberta no sistema.' });
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || String(err) });
  }
});

app.delete("/api/logs", (req, res) => {
  const success = clearAppLogs();
  res.json({ success, message: success ? 'Logs limpos com sucesso.' : 'Falha ao limpar logs.' });
});

// AI Generation Proxy (Supports Local Llama simulation or Gemini)
app.post("/api/ai/generate", async (req, res) => {
  try {
    const { prompt, systemPrompt, model, provider, knowledgeContext } = req.body;
    const ai = getAIClient();
    
    let fullPrompt = `System: ${systemPrompt || 'Você é um assistente virtual atencioso.'}\n`;
    if (knowledgeContext) {
      fullPrompt += `Contexto da Base de Conhecimento:\n${knowledgeContext}\n\n`;
    }
    fullPrompt += `Usuário: ${prompt}\nResposta:`;

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: fullPrompt,
        });
        const text = response.text || "Desculpe, não consegui processar sua resposta no momento.";
        return res.json({ text, provider: provider || 'gemini', model: 'gemini-2.5-flash' });
      } catch (err: any) {
        console.error("Gemini API Error, falling back to Llama simulation:", err?.message);
      }
    }

    let responseText = `🤖 [Llama 3.2 Local]: Olá! `;
    const lowerPrompt = (prompt || '').toLowerCase();

    if (lowerPrompt.includes('preço') || lowerPrompt.includes('plano') || lowerPrompt.includes('quanto custa')) {
      responseText += `Nossos planos de automação começam em R$ 149/mês para até 3 canais com IA Llama inclusa.`;
    } else if (lowerPrompt.includes('whatsapp') || lowerPrompt.includes('qr')) {
      responseText += `Para conectar o WhatsApp Web real, acesse a aba 'Conexões & Canais', escaneie o QR Code emitido pelo servidor Baileys em tempo real.`;
    } else {
      responseText += `Entendi sua pergunta sobre "${prompt}". O bot automatizado respondeu usando a IA configurada.`;
    }

    return res.json({ text: responseText, provider: provider || 'local_llama', model: model || 'llama3.2:3b' });
  } catch (error: any) {
    console.error("AI Error:", error);
    res.status(500).json({ error: error?.message || "Internal server error" });
  }
});

// REAL WhatsApp Baileys Endpoints
app.get("/api/whatsapp/debug", (req, res) => { res.json({ success: true }); });
app.get("/api/debug/flows", (req, res) => { res.json({ count: 1 }); });
app.get("/api/whatsapp/status", (req, res) => {
  const state = getWhatsAppSessionState(); console.log("STATE BEFORE JSON:", JSON.stringify(state));
  res.json({ ...state});
});

app.get("/api/whatsapp/messages", (req, res) => {
  res.json({ messages: getWhatsAppMessages() });
});

app.post("/api/whatsapp/start", async (req, res) => {
  try {
    initWhatsAppBaileys(handleAutoResponse);
    res.json({ success: true, message: "Handshake Baileys iniciado. Verifique o QR Code em instantes." });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Erro ao iniciar sessão Baileys" });
  }
});

app.post("/api/whatsapp/disconnect", async (req, res) => {
  try {
    await disconnectWhatsAppBaileys();
    res.json({ success: true, message: "Sessão encerrada com sucesso." });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Erro ao desconectar" });
  }
});

app.post("/api/whatsapp/send", async (req, res) => {
  const { to, text, name, attachment } = req.body;
  if (!to || (!text && !attachment)) {
    return res.status(400).json({ error: "Parâmetros obrigatórios ausentes." });
  }
  const success = await sendWhatsAppMessage(to, text || '', name, attachment);
  res.json({ success });
});

// Flow synchronization & execution endpoints
app.get("/api/flows", (req, res) => {
  res.json(getServerFlows());
});

app.post("/api/flows", (req, res) => {
  const { flows, activeFlowId, documents } = req.body;
  setServerFlows(flows, activeFlowId, documents);
  res.json({ success: true, message: "Fluxos e Base de Conhecimento RAG atualizados no servidor." });
});

app.post("/api/knowledge/parse-document", async (req, res) => {
  try {
    const { base64, filename, mimetype } = req.body;
    if (!base64 || !filename) {
      return res.status(400).json({ error: "base64 e filename são obrigatórios." });
    }

    const buffer = Buffer.from(base64, 'base64');
    const result = await parseDocumentBuffer(buffer, filename, mimetype);

    res.json({
      success: true,
      filename,
      ...result
    });
  } catch (err: any) {
    console.error("Erro ao processar arquivo para RAG:", err);
    res.status(500).json({ error: err?.message || "Falha ao extrair texto do documento." });
  }
});

app.post("/api/whatsapp/toggle-bot", (req, res) => {
  const { phone, isPaused } = req.body;
  if (!phone) return res.status(400).json({ error: "Telefone do contato é obrigatório." });
  const paused = toggleSessionPause(phone, isPaused);
  res.json({ success: true, isPaused: paused });
});

export async function startServer(initialPort: number = PORT): Promise<number> {
  let currentPort = initialPort;
  const maxAttempts = 10;
  let boundPort = -1;

  // 1. First, bind the port so wait-on/Electron can detect it immediately
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      boundPort = await new Promise<number>((resolve, reject) => {
        const server = app.listen(currentPort, "0.0.0.0");
        
        server.once("listening", () => {
          console.log(`[BotFlow Server] Successfully running on http://127.0.0.1:${currentPort}`);
          resolve(currentPort);
        });

        server.once("error", (err: any) => {
          if (err.code === "EADDRINUSE") {
            console.warn(`[BotFlow Server] Port ${currentPort} is in use, trying port ${currentPort + 1}...`);
            currentPort++;
            resolve(-1);
          } else {
            console.error(`[BotFlow Server] Error listening on port ${currentPort}:`, err);
            reject(err);
          }
        });
      });

      if (boundPort > 0) {
        break;
      }
    } catch (err) {
      throw err;
    }
  }

  if (boundPort === -1) {
    throw new Error(`[BotFlow Server] Unable to find an available port starting from ${initialPort} to ${currentPort}`);
  }

  // 2. Then set up Vite or Static files
  const isDev = process.env.NODE_ENV !== "production";

  if (isDev) {
    let viteReady = false;
    let viteMiddleware: any = null;
    
    // Add a middleware to hold requests until Vite is ready
    app.use(async (req, res, next) => {
      if (viteReady && viteMiddleware) {
        return viteMiddleware(req, res, next);
      }
      
      // Wait for Vite to be ready
      const checkInterval = setInterval(() => {
        if (viteReady && viteMiddleware) {
          clearInterval(checkInterval);
          return viteMiddleware(req, res, next);
        }
      }, 100);
    });

    (async () => {
      try {
        const vitePkgName = "vite";
        const { createServer: createViteServer } = await import(vitePkgName);
        const vite = await createViteServer({
          server: { middlewareMode: true },
          appType: "spa",
        });
        viteMiddleware = vite.middlewares;
        viteReady = true;
        console.log("[BotFlow Server] Vite development middleware attached.");
      } catch (err) {
        console.warn("[BotFlow Server] Could not load Vite dev middleware:", err);
      }
    })();
  } else {
    // Determine static assets location dynamically (works in standard Node, ASAR, or packaged Electron)
    const resolveDistPath = (): string => {
      if (process.env.DIST_PATH && fs.existsSync(path.join(process.env.DIST_PATH, "index.html"))) {
        return process.env.DIST_PATH;
      }

      const candidates = [
        process.env.DIST_PATH,
        currentDirname,
        currentDirname.replace("app.asar.unpacked", "app.asar"),
        currentDirname.replace("app.asar", "app.asar.unpacked"),
        path.join(currentDirname, "dist"),
        path.join(currentDirname, "../dist"),
        path.join(currentDirname.replace("app.asar.unpacked", "app.asar"), "dist"),
        path.join(currentDirname.replace("app.asar", "app.asar.unpacked"), "dist"),
        path.join(process.cwd(), "dist"),
        path.join(process.cwd(), "resources/app.asar/dist"),
        path.join(process.cwd(), "resources/app.asar.unpacked/dist"),
        process.cwd(),
      ].filter(Boolean) as string[];

      for (const candidate of candidates) {
        try {
          if (candidate && fs.existsSync(path.join(candidate, "index.html"))) {
            return candidate;
          }
        } catch (e) {}
      }

      return currentDirname;
    };

    const distPath = resolveDistPath();

    console.log(`[BotFlow Server] Serving static production files from: ${distPath}`);
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      const indexPath = path.join(distPath, "index.html");
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        // Ultimate fallback search if distPath changed or was not found initially
        const fallbackPath = resolveDistPath();
        const fallbackIndex = path.join(fallbackPath, "index.html");
        if (fs.existsSync(fallbackIndex)) {
          res.sendFile(fallbackIndex);
        } else {
          res.status(404).send(`BotFlow Studio: index.html not found. (Checked: ${indexPath})`);
        }
      }
    });
  }

  return boundPort;
}

// Auto-start server if not executed inside Electron main process
if (!process.versions?.electron) {
  startServer().catch((err) => {
    console.error("[BotFlow Server] Standalone auto-start failed:", err);
  });
}

