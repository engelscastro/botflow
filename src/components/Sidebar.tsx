import React from 'react';
import { 
  Layers, 
  MessageSquare, 
  Wifi, 
  Sparkles, 
  TrendingUp, 
  BookOpen, 
  Settings,
  Bot,
  Send,
  Users,
  Calendar,
  ShieldCheck
} from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  onSelectSection: (section: string) => void;
  unreadCountTotal: number;
  theme?: 'dark' | 'light';
  userRole?: 'admin' | 'enterprise' | 'community' | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  onSelectSection,
  unreadCountTotal,
  theme = 'dark',
  userRole
}) => {
  const isDark = theme === 'dark';

  const allMenuItems = [
    { id: 'builder', label: 'Construtor de Fluxos', icon: Layers, badge: 'Visual' },
    { id: 'inbox', label: 'Inbox Centralizado', icon: MessageSquare, count: unreadCountTotal },
    { id: 'broadcast', label: 'Disparos em Massa', icon: Send, badge: 'CSV' },
    { id: 'channels', label: 'Conexões & Canais', icon: Wifi, badge: 'WhatsApp Web' },
    { id: 'ai', label: 'Motor IA & Llama', icon: Sparkles, badge: 'Local/Cloud' },
    { id: 'knowledge', label: 'Base Conhecimento RAG', icon: BookOpen },
    { id: 'crm', label: 'CRM & Contatos', icon: Users, badge: 'Auto' },
    { id: 'schedule', label: 'Agenda & Reservas', icon: Calendar, badge: 'Auto' },
    { id: 'analytics', label: 'Relatórios & Engajamento', icon: TrendingUp },
    { id: 'users', label: 'Gestão de Usuários', icon: ShieldCheck, badge: 'Admin' },
  ];

  const communityAllowed = ['builder', 'inbox', 'knowledge', 'channels', 'ai', 'schedule', 'analytics'];

  const menuItems = allMenuItems.filter(item => {
    if (userRole === 'community') {
      return communityAllowed.includes(item.id);
    }
    if (userRole === 'enterprise' && item.id === 'users') {
      return false; // Enterprise users cannot manage users
    }
    return true; 
  });

  return (
    <aside className={`w-64 border-r flex flex-col justify-between shrink-0 transition-colors ${
      isDark 
        ? 'bg-[#0A0A0B] text-slate-300 border-white/5' 
        : 'bg-white text-slate-700 border-slate-200'
    }`}>
      <div className="p-4 space-y-1">
        <span className={`text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-2 block ${
          isDark ? 'text-slate-500' : 'text-slate-400'
        }`}>
          Menu Principal
        </span>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectSection(item.id)}
              className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-medium flex items-center justify-between transition-all cursor-pointer ${
                isActive
                  ? isDark
                    ? 'bg-white/5 text-white border border-white/10'
                    : 'bg-blue-50 text-blue-700 font-bold border border-blue-200 shadow-xs'
                  : isDark
                    ? 'hover:bg-white/5 text-slate-400 hover:text-white border border-transparent'
                    : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${
                  isActive 
                    ? isDark ? 'text-blue-400' : 'text-blue-600'
                    : isDark ? 'text-slate-500' : 'text-slate-400'
                }`} />
                <span>{item.label}</span>
              </div>

              {item.count !== undefined && item.count > 0 && (
                <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {item.count}
                </span>
              )}

              {item.badge && item.count === undefined && (
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                  isActive 
                    ? isDark ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-blue-100 text-blue-700'
                    : isDark ? 'bg-white/5 text-slate-500' : 'bg-slate-100 text-slate-500'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className={`p-5 border-t text-[11px] space-y-2 ${
        isDark ? 'border-white/5 text-slate-400' : 'border-slate-200 text-slate-500'
      }`}>
        <div className={`flex items-center gap-2 font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          <Bot className="w-4 h-4 text-emerald-500" />
          <span>Status do Sistema: 100% OK</span>
        </div>
        <p className={`text-[10px] leading-relaxed ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          Suporte: WhatsApp Web, Telegram, Instagram & Llama 3.2 Ollama.
        </p>
      </div>
    </aside>
  );
};
