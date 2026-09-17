import React from 'react';
import { DownloadCloud, Chrome, ArrowRight, ShieldCheck } from 'lucide-react';

export const ExtensionDownloadPanel = ({ isDark }: { isDark: boolean }) => {
  return (
    <div className={`mt-8 p-6 rounded-2xl border flex flex-col md:flex-row gap-6 items-start ${isDark ? 'bg-indigo-950/20 border-indigo-500/20' : 'bg-indigo-50/50 border-indigo-200'}`}>
      <div className="flex-1 space-y-4">
        <h3 className={`text-lg font-bold flex items-center gap-2 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
          <Chrome className="w-5 h-5" /> BotFlow Web Automator (Extensão)
        </h3>
        
        <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          O envio 100% humanizado e blindado contra bloqueios. Nossa extensão oficial para o Google Chrome / Brave não usa servidores nem APIs: ela abre a aba oficial do WhatsApp Web no seu navegador e escreve as mensagens. <strong>Você só precisa apertar a tecla ENTER</strong> para disparar e o robô pula automaticamente para o próximo cliente.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <a
            href="/botflow-extension.tar.gz"
            download
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <DownloadCloud className="w-4 h-4" /> Baixar Extensão (.tar.gz)
          </a>
          <span className={`text-[10px] sm:text-xs flex items-center gap-1 ${isDark ? 'text-indigo-300/60' : 'text-indigo-500/60'}`}>
            <ShieldCheck className="w-4 h-4" /> Seguro & Código Aberto
          </span>
        </div>
      </div>

      <div className={`md:w-72 p-4 rounded-xl border text-xs ${isDark ? 'bg-[#0A0A0B] border-white/5 text-slate-400' : 'bg-white border-slate-200 text-slate-500'}`}>
        <h4 className={`font-bold mb-3 flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Como instalar:
        </h4>
        <ol className="space-y-2 list-decimal list-inside marker:text-indigo-500 marker:font-bold">
          <li>Baixe o arquivo e extraia a pasta <code className="bg-slate-500/10 px-1 rounded">dist</code>.</li>
          <li>No Chrome/Brave, acesse <code className="bg-slate-500/10 px-1 rounded">chrome://extensions</code></li>
          <li>Ative o <strong>Modo do Desenvolvedor</strong> (canto superior direito).</li>
          <li>Clique em <strong>"Carregar sem compactação"</strong> e selecione a pasta extraída.</li>
          <li>Pronto! Clique no ícone da extensão no topo do navegador para iniciar os envios.</li>
        </ol>
      </div>
    </div>
  );
};
