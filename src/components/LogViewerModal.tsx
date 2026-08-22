import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  FileText, 
  FolderOpen, 
  Trash2, 
  RefreshCw, 
  Copy, 
  Check, 
  X, 
  AlertCircle,
  Download
} from 'lucide-react';

interface LogViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'dark' | 'light';
}

export const LogViewerModal: React.FC<LogViewerModalProps> = ({
  isOpen,
  onClose,
  theme
}) => {
  const [logs, setLogs] = useState<string>('Carregando registros de logs...');
  const [logsPath, setLogsPath] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);

  const isDark = theme === 'dark';

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/logs');
      if (response.ok) {
        const data = await response.json();
        setLogs(data.content || 'Nenhum registro de log encontrado.');
        setLogsPath(data.logsPath || '');
      } else {
        setLogs('Erro ao carregar logs da API.');
      }
    } catch (err: any) {
      setLogs(`Erro ao conectar com o servidor: ${err?.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLogs();
    }
  }, [isOpen]);

  const handleOpenFolder = async () => {
    try {
      // Try Electron IPC first if available
      if ((window as any).electron) {
        await (window as any).electron.invoke('open-logs-folder');
        setMessage('Pasta de logs aberta no sistema.');
      } else {
        // Fallback to Express backend
        const res = await fetch('/api/logs/open-folder', { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          setMessage('Pasta de logs aberta no sistema.');
        } else {
          setMessage(`Caminho dos logs: ${logsPath}`);
        }
      }
    } catch {
      setMessage(`Caminho dos logs: ${logsPath}`);
    }
    setTimeout(() => setMessage(null), 4000);
  };

  const handleClearLogs = async () => {
    if (!confirm('Deseja realmente limpar todos os logs do aplicativo?')) return;
    try {
      const res = await fetch('/api/logs', { method: 'DELETE' });
      if (res.ok) {
        setLogs('Logs limpos com sucesso.');
        setMessage('Registros zerados.');
      }
    } catch (err) {
      setMessage('Falha ao limpar logs.');
    }
    setTimeout(() => setMessage(null), 3000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(logs);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([logs], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `botflow-system-logs-${new Date().toISOString().slice(0, 10)}.log`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`w-full max-w-4xl h-[85vh] rounded-2xl border shadow-2xl flex flex-col overflow-hidden transition-all ${
        isDark ? 'bg-[#0f0f12] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between shrink-0 ${
          isDark ? 'border-white/10 bg-[#141418]' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-600/10 text-blue-500 border border-blue-500/20">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base flex items-center gap-2">
                Logs de Diagnóstico do Sistema
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Ao Vivo
                </span>
              </h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {logsPath ? `Arquivo: ${logsPath}` : 'Registros do servidor Express & Electron'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isDark ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-slate-200 text-slate-600'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Alert if message exists */}
        {message && (
          <div className="px-6 py-2 bg-blue-600/10 border-b border-blue-500/20 text-blue-400 text-xs flex items-center justify-between">
            <span className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {message}
            </span>
          </div>
        )}

        {/* Toolbar */}
        <div className={`px-6 py-3 border-b flex flex-wrap items-center justify-between gap-3 text-xs shrink-0 ${
          isDark ? 'border-white/5 bg-[#0a0a0c]' : 'border-slate-100 bg-slate-100/50'
        }`}>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchLogs}
              disabled={loading}
              className={`px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isDark 
                  ? 'bg-white/5 hover:bg-white/10 text-slate-200 border-white/10' 
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </button>

            <button
              onClick={handleOpenFolder}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              Abrir Pasta de Logs
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className={`px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isDark 
                  ? 'bg-white/5 hover:bg-white/10 text-slate-200 border-white/10' 
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copiado!' : 'Copiar Logs'}
            </button>

            <button
              onClick={handleDownload}
              className={`px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isDark 
                  ? 'bg-white/5 hover:bg-white/10 text-slate-200 border-white/10' 
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              Baixar .log
            </button>

            <button
              onClick={handleClearLogs}
              className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Limpar Logs
            </button>
          </div>
        </div>

        {/* Logs Terminal Area */}
        <div className="flex-1 p-4 bg-[#050508] overflow-auto font-mono text-xs text-slate-300 selection:bg-blue-600 selection:text-white">
          <pre className="whitespace-pre-wrap leading-relaxed font-mono">
            {logs}
          </pre>
        </div>

        {/* Footer info */}
        <div className={`px-6 py-2.5 border-t text-[11px] flex items-center justify-between shrink-0 ${
          isDark ? 'border-white/5 bg-[#0a0a0c] text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-500'
        }`}>
          <span className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            Logs salvos automaticamente em tempo real no diretório do usuário
          </span>
          <span className="font-mono">
            botflow-studio-pro/logs/app.log
          </span>
        </div>

      </div>
    </div>
  );
};
