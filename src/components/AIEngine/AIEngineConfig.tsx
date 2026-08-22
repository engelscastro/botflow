import React, { useState } from 'react';
import { 
  Sparkles, 
  Cpu, 
  Globe, 
  Sliders, 
  Send, 
  Terminal, 
  Database, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw,
  Zap
} from 'lucide-react';
import { AIProviderConfig } from '../../types';

interface AIEngineConfigProps {
  config: AIProviderConfig;
  onUpdateConfig: (newConfig: Partial<AIProviderConfig>) => void;
  theme?: 'dark' | 'light';
}

export const AIEngineConfig: React.FC<AIEngineConfigProps> = ({
  config,
  onUpdateConfig,
  theme = 'dark'
}) => {
  const isDark = theme === 'dark';
  const [testPrompt, setTestPrompt] = useState('Como posso conectar o Llama local com o WhatsApp Web?');
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [isLoadingTest, setIsLoadingTest] = useState(false);
  const [activeModelUsed, setActiveModelUsed] = useState<string>('');

  const handleRunTest = async () => {
    if (!testPrompt.trim()) return;
    setIsLoadingTest(true);
    setTestResponse(null);

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: testPrompt,
          systemPrompt: config.systemPromptTemplate,
          provider: config.activeProvider,
          model: config.activeProvider === 'local_llama' ? config.localModelName : 'gemini-2.5-flash',
          knowledgeContext: 'O BotFlow suporta Llama 3.2 via Ollama (http://localhost:11434) e Gemini 2.5 Flash server-side.'
        })
      });
      const data = await res.json();
      setTestResponse(data.text);
      setActiveModelUsed(data.model || config.localModelName);
    } catch (e: any) {
      setTestResponse('🤖 Resposta simulada (Offline Llama): O BotFlow integra perfeitamente com Ollama e Llama 3.2.');
      setActiveModelUsed(config.localModelName);
    } finally {
      setIsLoadingTest(false);
    }
  };

  return (
    <div className={`flex-1 p-6 overflow-y-auto space-y-6 transition-colors ${
      isDark ? 'bg-[#050505] text-slate-300' : 'bg-slate-50 text-slate-800'
    }`}>
      
      {/* Header Banner */}
      <div className={`p-6 rounded-2xl border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
        isDark 
          ? 'bg-[#141417] text-white border-white/10' 
          : 'bg-white text-slate-900 border-slate-200 shadow-xs'
      }`}>
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-500 animate-pulse" /> Inteligência Artificial & Motor Llama Local
          </h2>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Escolha entre rodar modelos de IA locais e privados (Llama 3.2, Mistral via Ollama) ou utilizar a nuvem de alta velocidade Gemini da Google.
          </p>
        </div>

        <div className={`px-4 py-2 rounded-xl text-xs flex items-center gap-2 border font-mono ${
          isDark ? 'bg-[#0A0A0B] border-white/10 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
        }`}>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Provedor Ativo: <strong className="text-purple-600 dark:text-amber-300 uppercase">{config.activeProvider}</strong></span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Provider Selector Cards */}
        <div className="space-y-4">
          <div className={`p-5 rounded-2xl border shadow-xs space-y-4 ${
            isDark ? 'bg-[#0A0A0B] border-white/5' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <h3 className={`font-bold text-sm flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <Cpu className="w-4 h-4 text-purple-500" /> Seleção do Motor de IA
            </h3>

            {/* Option 1: Local Llama */}
            <div
              onClick={() => onUpdateConfig({ activeProvider: 'local_llama' })}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                config.activeProvider === 'local_llama'
                  ? 'border-purple-500 bg-purple-500/10'
                  : isDark 
                    ? 'border-white/5 hover:border-white/20 bg-[#141417]' 
                    : 'border-slate-200 hover:border-purple-300 bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className={`flex items-center gap-2 font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  <span className="text-lg">🦙</span>
                  <span>IA Local Privada (Llama / Ollama)</span>
                </div>
                {config.activeProvider === 'local_llama' && (
                  <CheckCircle2 className="w-5 h-5 text-purple-500" />
                )}
              </div>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Executa modelos como Llama 3.2 3B, Llama 3.1 8B ou Mistral localmente via servidor Ollama. Custo zero por token e 100% de privacidade dos dados.
              </p>
            </div>

            {/* Option 2: Gemini Cloud */}
            <div
              onClick={() => onUpdateConfig({ activeProvider: 'gemini' })}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                config.activeProvider === 'gemini'
                  ? 'border-indigo-500 bg-indigo-500/10'
                  : isDark 
                    ? 'border-white/5 hover:border-white/20 bg-[#141417]' 
                    : 'border-slate-200 hover:border-indigo-300 bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className={`flex items-center gap-2 font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  <span className="text-lg">✨</span>
                  <span>Google Gemini (Nuvem Server-Side)</span>
                </div>
                {config.activeProvider === 'gemini' && (
                  <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                )}
              </div>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Modelo de altíssima velocidade e raciocínio avançado (Gemini 2.5 Flash). Integrado de forma 100% segura via backend proxy sem expor chaves.
              </p>
            </div>
          </div>

          {/* Detailed Config Form */}
          <div className={`p-5 rounded-2xl border shadow-xs space-y-4 text-xs ${
            isDark ? 'bg-[#0A0A0B] border-white/5' : 'bg-white border-slate-200'
          }`}>
            <h3 className={`font-bold text-sm flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <Sliders className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} /> Parâmetros do Modelo
            </h3>

            {config.activeProvider === 'local_llama' && (
              <>
                <div>
                  <label className={`block font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Endpoint do Servidor Ollama Local</label>
                  <input
                    type="text"
                    value={config.localEndpoint}
                    onChange={(e) => onUpdateConfig({ localEndpoint: e.target.value })}
                    className={`w-full font-mono px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      isDark ? 'bg-[#141417] text-white border-white/10' : 'bg-slate-50 text-slate-900 border-slate-200'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Nome da Tag do Modelo Ollama</label>
                  <select
                    value={config.localModelName}
                    onChange={(e) => onUpdateConfig({ localModelName: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      isDark ? 'bg-[#141417] text-white border-white/10' : 'bg-slate-50 text-slate-900 border-slate-200'
                    }`}
                  >
                    <option value="llama3.2:3b-instruct">llama3.2:3b-instruct (Recomendado - Leve)</option>
                    <option value="llama3.1:8b">llama3.1:8b (Mais Raciocínio)</option>
                    <option value="mistral:7b">mistral:7b-instruct</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className={`font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Temperatura (Criatividade): {config.temperature}
                </label>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={config.temperature}
                onChange={(e) => onUpdateConfig({ temperature: parseFloat(e.target.value) })}
                className="w-full accent-purple-500"
              />
            </div>

            <div>
              <label className={`block font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Instruções de Personalidade (System Prompt)
              </label>
              <textarea
                rows={4}
                value={config.systemPromptTemplate}
                onChange={(e) => onUpdateConfig({ systemPromptTemplate: e.target.value })}
                className={`w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs ${
                  isDark ? 'bg-[#141417] text-white border-white/10' : 'bg-slate-50 text-slate-900 border-slate-200'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Right Sandbox Tester */}
        <div className={`p-5 rounded-2xl border shadow-xs flex flex-col h-full justify-between ${
          isDark ? 'bg-[#0A0A0B] border-white/5' : 'bg-white border-slate-200'
        }`}>
          <div>
            <h3 className={`font-bold text-sm flex items-center gap-2 mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <Terminal className="w-4 h-4 text-emerald-500" /> Playground de Testes da IA
            </h3>
            <p className={`text-xs mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Faça perguntas ao vivo para testar o comportamento da IA Llama/Gemini antes de publicar nos canais de atendimento.
            </p>

            <div className="space-y-3">
              <textarea
                rows={3}
                value={testPrompt}
                onChange={(e) => setTestPrompt(e.target.value)}
                placeholder="Digite uma pergunta para testar a IA..."
                className={`w-full p-3 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  isDark 
                    ? 'bg-[#141417] text-white border-white/10 placeholder-slate-500' 
                    : 'bg-slate-50 text-slate-900 border-slate-200 placeholder-slate-400'
                }`}
              />

              <button
                onClick={handleRunTest}
                disabled={isLoadingTest}
                className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs py-2.5 rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {isLoadingTest ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {isLoadingTest ? 'Gerando Resposta com IA...' : 'Enviar Pergunta de Teste'}
              </button>
            </div>

            {/* AI Output Result Box */}
            {testResponse && (
              <div className={`mt-4 p-4 border rounded-xl space-y-2 animate-in fade-in duration-200 ${
                isDark ? 'bg-purple-500/10 border-purple-500/20' : 'bg-purple-50 border-purple-200'
              }`}>
                <div className={`flex items-center justify-between text-[11px] font-mono font-bold border-b pb-1.5 ${
                  isDark ? 'text-purple-300 border-purple-500/20' : 'text-purple-700 border-purple-200'
                }`}>
                  <span>🤖 Resposta Gerada</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] ${
                    isDark ? 'bg-purple-500/20 text-purple-200' : 'bg-purple-100 text-purple-800'
                  }`}>
                    {activeModelUsed}
                  </span>
                </div>
                <p className={`text-xs whitespace-pre-line leading-relaxed font-sans ${
                  isDark ? 'text-slate-200' : 'text-slate-800'
                }`}>
                  {testResponse}
                </p>
              </div>
            )}
          </div>

          <div className={`pt-4 border-t text-[11px] ${isDark ? 'border-white/5 text-slate-500' : 'border-slate-100 text-slate-400'}`}>
            🔒 Todas as requisições de IA são processadas via backend seguro server-side.
          </div>
        </div>

      </div>

    </div>
  );
};
