const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf-8');

const oldSend = `app.post("/api/whatsapp/send", async (req, res) => {
  const { to, text, name, attachment } = req.body;
  if (!to || (!text && !attachment)) {
    return res.status(400).json({ error: "Parâmetros obrigatórios ausentes." });
  }

  const success = await sendWhatsAppMessage(to, text || '', name, attachment);
  res.json({ success });
});`;

const newSend = `app.post("/api/whatsapp/send", async (req, res) => {
  const { to, text, name, attachment } = req.body;
  if (!to || (!text && !attachment)) {
    return res.status(400).json({ error: "Parâmetros obrigatórios ausentes." });
  }

  // Se a API oficial estiver configurada com Token e Number ID, tente enviar por ela primeiro.
  if (metaWaConfig.apiToken && metaWaConfig.phoneNumberId) {
     try {
        let cleanTo = to.replace(/[^0-9]/g, '');
        // Disparos oficiais geralmente requerem formato E.164 (ex: 5511999999999)
        const response = await fetch(\`https://graph.facebook.com/v19.0/\${metaWaConfig.phoneNumberId}/messages\`, {
          method: 'POST',
          headers: {
            'Authorization': \`Bearer \${metaWaConfig.apiToken}\`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: cleanTo,
            type: 'text',
            text: { body: text || '' }
          })
        });
        
        const data = await response.json();
        if (response.ok) {
           return res.json({ success: true, via: 'official' });
        } else {
           console.error("Erro no envio API Oficial (Pode ser bloqueio de template fora da janela 24h):", data);
           // Fallback to Baileys if it fails? No, just return error so user knows.
           return res.status(400).json({ error: data.error?.message || "Erro na API Oficial da Meta." });
        }
     } catch (e) {
        console.error("Falha ao comunicar com a API Oficial", e);
     }
  }

  // Fallback para Baileys
  const success = await sendWhatsAppMessage(to, text || '', name, attachment);
  res.json({ success, via: 'baileys' });
});`;

if (content.includes('app.post("/api/whatsapp/send"')) {
   content = content.replace(oldSend, newSend);
   fs.writeFileSync('server.ts', content);
   console.log("Fixed /api/whatsapp/send");
}
