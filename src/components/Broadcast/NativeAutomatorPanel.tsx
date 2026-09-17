import React, { useState, useEffect, useRef } from 'react';
import { MonitorPlay, StopCircle, Bot, Zap, Play, Terminal } from 'lucide-react';

export const NativeAutomatorPanel = ({ isDark }: { isDark: boolean }) => {
  const [numbers, setNumbers] = useState('');
  const [message, setMessage] = useState('');
  const [minDelay, setMinDelay] = useState(5);
  const [maxDelay, setMaxDelay] = useState(10);
  const [logs, setLogs] = useState<{ msg: string; type: string; time: string }[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  const isElectron = !!window.electronAPI?.isElectron;

  useEffect(() => {
    if (isElectron) {
      window.electronAPI?.onAutomatorLog((data) => {
        setLogs(prev => [...prev, { ...data, time: new Date().toLocaleTimeString() }]);
        if (data.msg.includes('finalizada') || data.msg.includes('parada')) {
          setIsRunning(false);
        }
      });
    }
  }, [isElectron]);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const handleOpenWindow = () => {
    window.electronAPI?.openAutomatorWindow();
  };

  const handleStart = () => {
    const list = numbers.split('\n').map(n => n.replace(/\D/g, '')).filter(n => n.length >= 10);
    if (list.length === 0) return alert('Insira pelo menos um número válido.');
    if (!message.trim()) return alert('Insira a mensagem.');

    setIsRunning(true);
    setLogs([{ msg: 'Iniciando campanha fantasma...', type: 'info', time: new Date().toLocaleTimeString() }]);
    window.electronAPI?.startAutomatorCampaign({
      numbers: list,
      message,
      minDelay,
      maxDelay
    });
  };

  const handleStop = () => {
    window.electronAPI?.stopAutomatorCampaign();
    setIsRunning(false);
  };

  if (!isElectron) {
    return (
      <div className={`mt-8 p-6 rounded-2xl border flex flex-col items-center justify-center gap-4 text-center ${isDark ? 'bg-indigo-950/20 border-indigo-500/20' : 'bg-indigo-50/50 border-indigo-200'}`}>
        <MonitorPlay className={`w-10 h-10 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
        <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Automação Nativa Indisponível
        </h3>
        <p className={`text-sm max-w-md ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Você está usando o BotFlow pelo navegador web. Para usar o recurso de cliques fantasmas e automação de interface, baixe e instale o aplicativo Desktop (Electron) do BotFlow.
        </p>
      </div>
    );
  }

  return (
    <div className={`mt-8 rounded-2xl border overflow-hidden ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
      <div className={`px-6 py-4 border-b flex items-center justify-between ${isDark ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className={`font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Auto-Clicker Fantasma (Electron) <Zap className="w-4 h-4 text-yellow-500" />
            </h3>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Envio ultra humanizado e indetectável diretamente via interface nativa.
            </p>
          </div>
        </div>
        <button
          onClick={handleOpenWindow}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors"
        >
          Abrir Janela Fantasma
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
        <div className="space-y-4">
          <div>
            <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Lista de Números (com DDD)
            </label>
            <textarea
              className={`w-full h-32 p-3 text-sm rounded-xl border focus:ring-2 outline-none transition-all resize-none ${
                isDark 
                  ? 'bg-slate-950 border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20 text-slate-300' 
                  : 'bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 text-slate-700'
              }`}
              placeholder="5582999999999&#10;5511988888888"
              value={numbers}
              onChange={(e) => setNumbers(e.target.value)}
              disabled={isRunning}
            />
          </div>

          <div>
            <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Mensagem
            </label>
            <textarea
              className={`w-full h-24 p-3 text-sm rounded-xl border focus:ring-2 outline-none transition-all resize-none ${
                isDark 
                  ? 'bg-slate-950 border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20 text-slate-300' 
                  : 'bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 text-slate-700'
              }`}
              placeholder="Sua mensagem..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isRunning}
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Intervalo Mín. (s)
              </label>
              <input
                type="number"
                min={1}
                max={300}
                value={minDelay}
                onChange={(e) => setMinDelay(Number(e.target.value))}
                disabled={isRunning}
                className={`w-full p-2 text-sm rounded-lg border outline-none ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}
              />
            </div>
            <div className="flex-1">
              <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Intervalo Máx. (s)
              </label>
              <input
                type="number"
                min={minDelay}
                max={300}
                value={maxDelay}
                onChange={(e) => setMaxDelay(Number(e.target.value))}
                disabled={isRunning}
                className={`w-full p-2 text-sm rounded-lg border outline-none ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}
              />
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            {!isRunning ? (
              <button
                onClick={handleStart}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20"
              >
                <Play className="w-5 h-5" fill="currentColor" /> Iniciar Fantasma
              </button>
            ) : (
              <button
                onClick={handleStop}
                className="flex-1 bg-red-500 hover:bg-red-400 text-white px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-500/20"
              >
                <StopCircle className="w-5 h-5" /> Parar Automação
              </button>
            )}
          </div>
        </div>

        {/* Logs Terminal */}
        <div className={`rounded-xl border flex flex-col font-mono text-xs overflow-hidden ${isDark ? 'bg-[#0A0A0B] border-slate-800' : 'bg-slate-900 border-slate-900'}`}>
          <div className="px-4 py-2 border-b border-white/10 flex items-center gap-2 text-slate-400 bg-black/40">
            <Terminal className="w-4 h-4" /> Terminal Fantasma
          </div>
          <div className="p-4 flex-1 overflow-y-auto max-h-[360px] space-y-2">
            {logs.length === 0 ? (
              <div className="text-slate-600 text-center mt-10">Aguardando início...</div>
            ) : (
              logs.map((log, i) => (
                <div key={i} className={`flex items-start gap-2 ${
                  log.type === 'error' ? 'text-red-400' : 
                  log.type === 'success' ? 'text-emerald-400' : 
                  'text-slate-300'
                }`}>
                  <span className="text-slate-600 whitespace-nowrap">[{log.time}]</span>
                  <span>{log.msg}</span>
                </div>
              ))
            )}
            <div ref={logEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
};
