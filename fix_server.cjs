const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf-8');

const webhookCode = `
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
      
      console.log(\`[Meta API] Mensagem de \${from}: \${text}\`);
      
      // Processa pelo BotFlow
      const aiClient = null; // Instanciar AI se necessário
      const reply = await processFlowIncomingMessage(from, text, () => aiClient);
      
      if (reply) {
         // Responde via Meta API
         if (metaWaConfig.apiToken && metaWaConfig.phoneNumberId) {
            try {
              await fetch(\`https://graph.facebook.com/v19.0/\${metaWaConfig.phoneNumberId}/messages\`, {
                method: 'POST',
                headers: {
                  'Authorization': \`Bearer \${metaWaConfig.apiToken}\`,
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
`;

if (!content.includes('/api/webhook/whatsapp')) {
   const target = 'app.get("/api/health"';
   content = content.replace(target, webhookCode + '\n\n' + target);
   fs.writeFileSync('server.ts', content);
   console.log("Server updated with Webhook.");
}
