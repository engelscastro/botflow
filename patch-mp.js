import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf8');

const mpCode = `
// ==========================================
// INTEGRAÇÃO MERCADO PAGO E PIX
// ==========================================
app.post("/api/checkout/mercadopago", async (req, res) => {
  const { email } = req.body;
  const mpToken = process.env.MP_ACCESS_TOKEN;
  
  if (!mpToken) {
    return res.status(500).json({ error: "Mercado Pago não configurado. Adicione MP_ACCESS_TOKEN no .env." });
  }

  try {
    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: \`Bearer \${mpToken}\`
      },
      body: JSON.stringify({
        items: [
          {
            title: "Plano Enterprise - BotFlow Studio",
            quantity: 1,
            unit_price: 97.00, // Substitua pelo valor real do seu plano
            currency_id: "BRL"
          }
        ],
        external_reference: email, // Usado pelo webhook para saber quem pagou
        payment_methods: {
          excluded_payment_types: [
            { id: "ticket" } // Exclui boleto (opcional, só cartão e pix)
          ],
          installments: 12
        },
        back_urls: {
          success: process.env.APP_URL || "http://localhost:3000",
          failure: process.env.APP_URL || "http://localhost:3000",
          pending: process.env.APP_URL || "http://localhost:3000"
        },
        auto_return: "approved"
      })
    });
    
    const data = await response.json();
    res.json({ init_point: data.init_point });
  } catch (err: any) {
    console.error("Erro MP Checkout:", err);
    res.status(500).json({ error: "Erro ao gerar checkout do Mercado Pago." });
  }
});

app.post("/api/webhooks/mercadopago", async (req, res) => {
  // O MercadoPago exige que você retorne 200/201 imediatamente
  res.status(200).send("OK");
  
  const { type, data } = req.body;
  
  if (type === "payment" && data && data.id) {
    try {
      const mpToken = process.env.MP_ACCESS_TOKEN;
      
      // Consultar o status real do pagamento por segurança
      const payRes = await fetch(\`https://api.mercadopago.com/v1/payments/\${data.id}\`, {
        headers: { Authorization: \`Bearer \${mpToken}\` }
      });
      const payment = await payRes.json();

      if (payment.status === "approved") {
        const email = payment.external_reference; // Recuperamos o e-mail que mandamos no checkout
        if (email) {
          console.log(\`[Mercado Pago] Pagamento aprovado para: \${email}\`);
          
          // Promover para Enterprise
          const adminSupabase = createClient(
            process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '',
            process.env.SUPABASE_SERVICE_ROLE_KEY || ''
          );
          
          const { data: usersData } = await adminSupabase.auth.admin.listUsers();
          const user = usersData?.users?.find(u => u.email === email);
          
          if (user) {
            await adminSupabase.auth.admin.updateUserById(user.id, {
              user_metadata: { role: 'enterprise' }
            });
            console.log(\`[Mercado Pago] \${email} foi promovido para Enterprise com sucesso!\`);
          }
        }
      }
    } catch(err) {
      console.error("Erro no processamento do Webhook MP:", err);
    }
  }
});
`;

if (!content.includes('/api/webhooks/mercadopago')) {
  content = content.replace(
    /app\.listen\(PORT/,
    mpCode + '\napp.listen(PORT'
  );
  fs.writeFileSync('server.ts', content);
}
