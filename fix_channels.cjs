const fs = require('fs');
let content = fs.readFileSync('src/components/Channels/ChannelsManager.tsx', 'utf-8');

// 1. Add states for Whatsapp Engine
content = content.replace("const [authMethod, setAuthMethod] = useState<'qr' | 'pairing'>('qr');", "const [authMethod, setAuthMethod] = useState<'qr' | 'pairing'>('qr');\n  const [whatsappEngine, setWhatsappEngine] = useState<'baileys' | 'official'>('baileys');\n  const [waOfficialToken, setWaOfficialToken] = useState('');\n  const [waPhoneNumberId, setWaPhoneNumberId] = useState('');\n  const [waVerifyToken, setWaVerifyToken] = useState('botflow_secure_123');");

// 2. Add selector UI and logic
const oldBaileysUI = `<div className="space-y-6">
          
          {/* Informative Notice Box for user */}`;

const newBaileysUI = `<div className="space-y-6">
          
          {/* Engine Selector */}
          <div className="flex items-center gap-4 bg-[#141417] p-2 rounded-xl border border-white/10 max-w-md">
            <button
              onClick={() => setWhatsappEngine('baileys')}
              className={\`flex-1 py-2 rounded-lg text-sm font-bold transition-all \${whatsappEngine === 'baileys' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}\`}
            >
              Motor: Baileys (QR Code)
            </button>
            <button
              onClick={() => setWhatsappEngine('official')}
              className={\`flex-1 py-2 rounded-lg text-sm font-bold transition-all \${whatsappEngine === 'official' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}\`}
            >
              Motor: API Oficial (Meta)
            </button>
          </div>

          {whatsappEngine === 'official' ? (
            <div className="bg-[#0A0A0B] p-6 rounded-2xl border border-white/5 shadow-sm space-y-6">
              <div className="flex items-center gap-2 font-bold text-emerald-400 text-lg">
                <ShieldCheck className="w-5 h-5 text-emerald-400" /> WhatsApp Cloud API (Oficial)
              </div>
              <p className="text-sm text-slate-400">
                Conecte seu sistema à infraestrutura oficial da Meta. As primeiras 1.000 mensagens iniciadas pelo usuário por mês são gratuitas. Disparos em massa (iniciados pela empresa) requerem templates aprovados e têm custo por envio.
              </p>

              <div className="space-y-4 max-w-xl">
                <div>
                  <label className="block text-slate-400 font-medium mb-1 text-sm">Token de Acesso (Bearer)</label>
                  <input
                    type="password"
                    value={waOfficialToken}
                    onChange={(e) => setWaOfficialToken(e.target.value)}
                    placeholder="EAA..."
                    className="w-full px-3 py-2 bg-[#141417] text-white border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1 text-sm">ID do Número de Telefone (Phone Number ID)</label>
                  <input
                    type="text"
                    value={waPhoneNumberId}
                    onChange={(e) => setWaPhoneNumberId(e.target.value)}
                    placeholder="Ex: 102345678901234"
                    className="w-full px-3 py-2 bg-[#141417] text-white border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1 text-sm">Token de Verificação (Verify Token)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={waVerifyToken}
                      onChange={(e) => setWaVerifyToken(e.target.value)}
                      className="w-full px-3 py-2 bg-[#141417] text-white border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-sm"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Cole este token no painel da Meta ao configurar o Webhook.</p>
                </div>
                
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl mt-4">
                  <h4 className="font-bold text-emerald-400 text-sm mb-2">URL do Webhook (Cole na Meta)</h4>
                  <div className="flex items-center justify-between bg-black/40 px-3 py-2 rounded-lg font-mono text-xs text-slate-300">
                    <span>https://{window.location.hostname}/api/webhook/whatsapp</span>
                    <button className="text-emerald-400 hover:text-emerald-300"><Copy className="w-4 h-4" /></button>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-5 h-5" /> Salvar Configuração Oficial
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
          {/* Informative Notice Box for user */}`;

content = content.replace(oldBaileysUI, newBaileysUI);
content = content.replace("              </div>\n            </div>\n\n            {/* Status / Settings Card */}", "              </div>\n            </div>\n\n            {/* Status / Settings Card */}\n            </>"); // close the conditional block properly

fs.writeFileSync('src/components/Channels/ChannelsManager.tsx', content);
console.log("Channels updated.");
