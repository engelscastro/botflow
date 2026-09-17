import React, { useState } from 'react';
import { Lock, User, Bot, ShieldCheck, Zap, Users } from 'lucide-react';
import { UserAccount } from '../../types';

interface LoginScreenProps {
  onLogin: (role: 'admin' | 'enterprise' | 'community') => void;
  theme: 'dark' | 'light';
  users?: UserAccount[];
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, theme, users = [] }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const isDark = theme === 'dark';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = username.toLowerCase().trim();
    const pwd = password.toLowerCase().trim();
    
    // Default hardcoded logic as fallback, but checking real users first
    const foundUser = users.find(u => u.username.toLowerCase() === user && pwd === u.username.toLowerCase());
    
    if (foundUser) {
      if (foundUser.status === 'blocked' || foundUser.status === 'inactive') {
        setError('Sua conta está bloqueada ou inativa. Contate o administrador.');
        return;
      }
      onLogin(foundUser.role);
    } else if (user === 'admin' && pwd === 'admin') {
      onLogin('admin');
    } else if (user === 'enterprise' && pwd === 'enterprise') {
      onLogin('enterprise');
    } else if ((user === 'community' || user === 'comunidade') && (pwd === 'community' || pwd === 'comunidade')) {
      onLogin('community');
    } else {
      setError('Usuário ou senha inválidos.');
    }
  };

  return (
    <div className={`min-h-screen w-full flex items-center justify-center transition-colors ${
      isDark ? 'bg-[#050505] text-slate-300' : 'bg-slate-100 text-slate-800'
    }`}>
      <div className={`w-full max-w-md p-8 rounded-3xl border shadow-2xl ${
        isDark ? 'bg-[#0A0A0B] border-white/10' : 'bg-white border-slate-200'
      }`}>
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight font-display">BotFlow Studio</h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
            Plataforma de Automação IA
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}>
                Usuário
              </label>
              <div className="relative">
                <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                  isDark ? 'text-slate-500' : 'text-slate-400'
                }`} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError('');
                  }}
                  placeholder="Insira seu usuário..."
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500/50 outline-none transition-all ${
                    isDark 
                      ? 'bg-black/50 border-white/10 text-white placeholder-slate-600 focus:border-blue-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500'
                  }`}
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}>
                Senha
              </label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                  isDark ? 'text-slate-500' : 'text-slate-400'
                }`} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="Insira sua senha..."
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500/50 outline-none transition-all ${
                    isDark 
                      ? 'bg-black/50 border-white/10 text-white placeholder-slate-600 focus:border-blue-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500'
                  }`}
                />
              </div>
            </div>
            
            {error && (
              <p className="text-rose-500 text-xs mt-2 font-medium">
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
          >
            Acessar Plataforma
          </button>
        </form>

        <div className={`mt-8 pt-6 border-t grid grid-cols-3 gap-2 text-center ${
          isDark ? 'border-white/5' : 'border-slate-100'
        }`}>
          <div className="flex flex-col items-center justify-center gap-1">
            <ShieldCheck className={`w-4 h-4 ${isDark ? 'text-emerald-500' : 'text-emerald-600'}`} />
            <span className={`text-[10px] font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Admin</span>
          </div>
          <div className="flex flex-col items-center justify-center gap-1">
            <Zap className={`w-4 h-4 ${isDark ? 'text-purple-500' : 'text-purple-600'}`} />
            <span className={`text-[10px] font-medium flex gap-1 items-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              Enterprise <span className="bg-purple-500 text-white text-[8px] px-1 rounded-sm">PRO</span>
            </span>
          </div>
          <div className="flex flex-col items-center justify-center gap-1">
            <Users className={`w-4 h-4 ${isDark ? 'text-blue-500' : 'text-blue-600'}`} />
            <span className={`text-[10px] font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Community</span>
          </div>
        </div>
      </div>
    </div>
  );
};
