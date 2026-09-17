const fs = require('fs');
let content = fs.readFileSync('src/components/Channels/ChannelsManager.tsx', 'utf-8');

const buttonStr = `<button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-5 h-5" /> Salvar Configuração Oficial
                  </button>`;

const newButtonStr = `<button 
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
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-5 h-5" /> Salvar Configuração Oficial
                  </button>`;

if(content.includes(buttonStr)) {
  content = content.replace(buttonStr, newButtonStr);
  fs.writeFileSync('src/components/Channels/ChannelsManager.tsx', content);
  console.log("Updated button");
} else {
  console.log("Not found");
}
