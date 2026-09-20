import React from 'react';
import { 
  Bot, 
  Sparkles, 
  Wifi, 
  Bell, 
  Play, 
  Layers, 
  CheckCircle2, 
  HelpCircle,
  Cpu,
  Sun,
  Moon,
  Monitor,
  Terminal
} from 'lucide-react';

import { ChannelStatus, AIProviderConfig } from '../types';

interface HeaderProps {
  channels: ChannelStatus[];
  aiConfig: AIProviderConfig;
  activeSection: string;
  onOpenTestSimulator: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenLogs?: () => void;
  userRole?: 'admin' | 'enterprise' | 'community' | null;
  userEmail?: string;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  channels,
  aiConfig,
  activeSection,
  onOpenTestSimulator,
  theme,
  onToggleTheme,
  onOpenLogs,
  userRole,
  userEmail,
  onLogout
}) => {
  const connectedChannelsCount = channels.filter(c => c.connected).length;
  const isLlama = aiConfig.activeProvider === 'local_llama';
  const isDark = theme === 'dark';

  return (
    <header className={`h-16 border-b px-6 flex items-center justify-between shrink-0 z-20 transition-colors ${
      isDark 
        ? 'bg-[#050505]/90 backdrop-blur-md text-white border-white/5' 
        : 'bg-white/90 backdrop-blur-md text-slate-900 border-slate-200 shadow-xs'
    }`}>
      
      {/* Brand & Title */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-[0_0_12px_rgba(37,99,235,0.4)]">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div>
          <h1 className={`font-serif text-lg italic tracking-tight flex items-center gap-2.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            BotFlow Studio 
            <span className={`text-[10px] px-2 py-0.5 rounded font-sans not-italic font-mono ${
              isDark 
                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                : 'bg-blue-50 text-blue-700 border border-blue-200'
            }`}>v2.5 PRO</span>
            <span className={`text-[10px] px-2 py-0.5 rounded font-sans not-italic font-mono flex items-center gap-1 ${
              isDark
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}>
              <Monitor className="w-3 h-3" /> Electron Desktop
            </span>
            {userRole && (
              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                userRole === 'admin' ? 'bg-amber-500/20 text-amber-500 border-amber-500/30 border' :
                userRole === 'enterprise' ? 'bg-purple-500/20 text-purple-500 border-purple-500/30 border' :
                'bg-blue-500/20 text-blue-500 border-blue-500/30 border'
              }`}>
                {userRole}
              </span>
            )}
          </h1>
          <p className={`text-[10px] font-sans ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Gerenciador de Chatbots Visual Drag-and-Drop & Multiplataforma
          </p>
        </div>
      </div>

      {/* Middle Status Badges */}
      <div className="hidden lg:flex items-center gap-3 text-xs">
        {/* Active AI Status */}
        <div className={`px-3 py-1.5 rounded-lg flex items-center gap-2 border ${
          isDark 
            ? 'bg-[#141417] border-white/10' 
            : 'bg-slate-100 border-slate-200'
        }`}>
          <Cpu className={`w-4 h-4 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
          <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Motor IA:</span>
          <span className={`font-semibold font-mono text-[11px] ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>
            {isLlama ? '🦙 Llama 3.2 (Local)' : '✨ Gemini 2.5'}
          </span>
        </div>

        {/* Channels Status */}
        <div className={`px-3 py-1.5 rounded-lg flex items-center gap-2 border ${
          isDark 
            ? 'bg-[#141417] border-white/10' 
            : 'bg-slate-100 border-slate-200'
        }`}>
          <Wifi className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
          <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Canais:</span>
          <span className={`font-semibold text-[11px] ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
            {connectedChannelsCount}/{channels.length} Ativos
          </span>
        </div>
      </div>

      {/* Right Controls: Theme Toggle, Logs & Quick Test Trigger */}
      <div className="flex items-center gap-3">
        {/* Logs Button */}
        {onOpenLogs && (
          <button
            onClick={onOpenLogs}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              isDark
                ? 'bg-[#141417] hover:bg-white/10 text-blue-400 border-white/10 shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-blue-700 border-slate-300 shadow-xs'
            }`}
            title="Abrir Logs do Sistema"
          >
            <Terminal className="w-4 h-4 text-blue-500" />
            <span className="hidden sm:inline">Logs</span>
          </button>
        )}

        {/* Light / Dark Mode Button */}
        <button
          onClick={onToggleTheme}
          className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            isDark
              ? 'bg-[#141417] hover:bg-white/10 text-amber-300 border-white/10 shadow-sm'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300 shadow-xs'
          }`}
          title={isDark ? 'Mudar para Modo Claro (Light Mode)' : 'Mudar para Modo Escuro (Dark Mode)'}
        >
          {isDark ? (
            <>
              <Sun className="w-4 h-4 text-amber-400 fill-amber-400/20" />
              <span className="hidden sm:inline">Modo Claro</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-indigo-600 fill-indigo-600/20" />
              <span className="hidden sm:inline">Modo Escuro</span>
            </>
          )}
        </button>

        <button
          onClick={onOpenTestSimulator}
          className={`font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-2 transition-colors active:scale-95 shadow-sm cursor-pointer ${
            isDark
              ? 'bg-white text-black hover:bg-slate-200'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          <Play className="w-3.5 h-3.5 fill-current" /> Simular Chat ao Vivo
        </button>

        {userEmail && (
          <div className="hidden md:flex items-center gap-2 pl-2 border-l border-white/10">
            <span className={`text-[11px] font-medium font-mono ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {userEmail}
            </span>
          </div>
        )}

        {onLogout && (
          <button
            onClick={onLogout}
            className={`font-bold text-[11px] px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
              isDark
                ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/20'
                : 'bg-rose-50 hover:bg-rose-100 text-rose-600 border-rose-200'
            }`}
            title="Encerrar sessão"
          >
            Sair
          </button>
        )}
      </div>

    </header>
  );
};

