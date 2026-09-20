import fs from 'fs';
let content = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

const upgradeBtn = `
      {userRole === 'community' && (
        <div className="p-4 mx-3 mb-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20">
          <h4 className="text-xs font-bold text-purple-400 mb-1">Upgrade para PRO</h4>
          <p className="text-[10px] text-slate-400 mb-3 leading-tight">Desbloqueie Integrações CRM e WhatsApp ilimitado.</p>
          <button 
            onClick={async () => {
              try {
                // Recupera o email da sessão do Supabase (armazenado globalmente ou pedindo Auth)
                const { createClient } = await import('@supabase/supabase-js');
                const sb = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);
                const { data } = await sb.auth.getSession();
                const email = data?.session?.user?.email;
                
                if(!email) {
                  alert("Você precisa estar logado com um e-mail válido.");
                  return;
                }

                alert("Gerando link de pagamento Mercado Pago (PIX/Cartão)...");
                const res = await fetch('/api/checkout/mercadopago', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email })
                });
                const checkoutData = await res.json();
                if(checkoutData.init_point) {
                  window.location.href = checkoutData.init_point;
                } else {
                  alert("Erro ao gerar checkout. O admin configurou a chave MP_ACCESS_TOKEN?");
                }
              } catch (e) {
                console.error(e);
                alert("Erro ao conectar com servidor de pagamento.");
              }
            }}
            className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold rounded-lg transition-colors shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
          >
            <Zap className="w-3 h-3" />
            Fazer Upgrade Agora
          </button>
        </div>
      )}
`;

if (!content.includes('Fazer Upgrade Agora')) {
  // Inserir antes da tag de navegação final ou área do usuário
  content = content.replace(
    /(<div className="p-4 border-t[^>]*>)/,
    upgradeBtn + '\n      $1'
  );
  
  // Garantir que a tag Zap esteja importada se não estiver (provavelmente está)
  if(!content.includes('Zap')) {
      content = content.replace(/import {([^}]+)} from 'lucide-react';/, "import { $1, Zap } from 'lucide-react';");
  }
  
  fs.writeFileSync('src/components/Sidebar.tsx', content);
}
