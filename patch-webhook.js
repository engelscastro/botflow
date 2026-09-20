import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf8');

const webhookCode = `
// ==========================================
// WEBHOOK DE PAGAMENTO (UPGRADE AUTOMÁTICO)
// ==========================================
app.post("/api/webhooks/payment", async (req, res) => {
  try {
    // 1. Aqui você receberá os dados da plataforma de pagamento
    const { email, status, plan } = req.body; 

    // Validação básica de segurança (Em produção, valide a assinatura do Webhook)
    if (!email || status !== 'approved') {
      return res.status(400).json({ error: "Pagamento não aprovado ou dados incompletos." });
    }

    console.log(\`[Webhook Pagamento] Upgrade aprovado para: \${email}\`);

    // 2. Conectar ao Supabase com privilégios de Admin (Service Role)
    const adminSupabase = createClient(
      process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );

    // 3. Buscar o ID do usuário pelo e-mail
    const { data: usersData, error: listError } = await adminSupabase.auth.admin.listUsers();
    if (listError) throw listError;
    
    const user = usersData.users.find(u => u.email === email);
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado no sistema." });
    }

    // 4. Atualizar o usuário para Enterprise (ou o plano comprado)
    const { data: updateData, error: updateError } = await adminSupabase.auth.admin.updateUserById(
      user.id,
      { user_metadata: { role: plan || 'enterprise' } }
    );

    if (updateError) throw updateError;

    console.log(\`[Webhook Pagamento] Sucesso! \${email} agora é \${plan || 'enterprise'}.\`);
    res.json({ success: true, message: "Usuário promovido a Enterprise com sucesso!" });

  } catch (err: any) {
    console.error("[Webhook Pagamento Error]", err);
    res.status(500).json({ error: err.message });
  }
});
`;

if (!content.includes('/api/webhooks/payment')) {
  content = content.replace(
    /app\.listen\(PORT/,
    webhookCode + '\napp.listen(PORT'
  );
  fs.writeFileSync('server.ts', content);
}
