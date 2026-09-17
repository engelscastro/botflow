import React, { useState } from 'react';
import { Lock, User, Bot, UserPlus, LogIn, KeyRound, ArrowLeft } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (role: 'admin' | 'enterprise' | 'community', userEmail?: string) => void;
  theme: 'dark' | 'light';
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, theme }) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const isDark = theme === 'dark';

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        // Registro de conta na tabela users
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            password: password.trim()
          })
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Erro ao criar conta.');
        }

        setSuccess('Conta criada com sucesso! Faça login para entrar.');
        setMode('login');
        setPassword('');
      } else if (mode === 'forgot') {
        // Redefinição de senha
        const response = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.trim(),
            newPassword: password.trim()
          })
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Erro ao redefinir senha.');
        }

        setSuccess(data.message || 'Senha redefinida com sucesso! Acesse com a nova senha.');
        setMode('login');
        setPassword('');
      } else {
        // Login na tabela users
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.trim(),
            password: password.trim()
          })
        });

        const data = await response.json();
        if (!response.ok) {
          // Fallback para admin master com senhas padrão
          const cleanEmail = email.toLowerCase().trim();
          const cleanPwd = password.trim();
          if ((cleanEmail === 'admin' || cleanEmail === 'engelsbarros@gmail.com') && (cleanPwd === 'admin' || cleanPwd === 'admin123')) {
            onLogin('admin', cleanEmail);
            return;
          }
          throw new Error(data.error || 'E-mail ou senha inválidos.');
        }

        if (data.user) {
          const role = data.user.role || 'community';
          onLogin(role, data.user.email);
        }
      }
    } catch (err: any) {
      console.error("[Auth Error]", err);
      const cleanEmail = email.toLowerCase().trim();
      const cleanPwd = password.trim();
      if ((cleanEmail === 'admin' || cleanEmail === 'engelsbarros@gmail.com') && (cleanPwd === 'admin' || cleanPwd === 'admin123')) {
        onLogin('admin', cleanEmail);
      } else {
        setError(err.message || 'Falha na autenticação.');
      }
    } finally {
      setLoading(false);
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
            {mode === 'signup' ? (
              <UserPlus className="w-8 h-8 text-white" />
            ) : mode === 'forgot' ? (
              <KeyRound className="w-8 h-8 text-white" />
            ) : (
              <Bot className="w-8 h-8 text-white" />
            )}
          </div>
          <h1 className="text-2xl font-black tracking-tight font-display">BotFlow Studio</h1>
          <p className={`text-sm mt-1 text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {mode === 'signup'
              ? 'Crie sua conta (salva no Supabase)'
              : mode === 'forgot'
              ? 'Digite seu e-mail e cadastre uma nova senha'
              : 'Acesse a sua conta'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          <div className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  Nome Completo
                </label>
                <div className="relative">
                  <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                    isDark ? 'text-slate-500' : 'text-slate-400'
                  }`} />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu Nome"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500/50 outline-none transition-all ${
                      isDark 
                        ? 'bg-black/50 border-white/10 text-white placeholder-slate-600 focus:border-blue-500' 
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500'
                    }`}
                  />
                </div>
              </div>
            )}

            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}>
                E-mail ou Usuário
              </label>
              <div className="relative">
                <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                  isDark ? 'text-slate-500' : 'text-slate-400'
                }`} />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                    setSuccess('');
                  }}
                  placeholder="seu@email.com ou admin"
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
              <div className="flex items-center justify-between mb-2">
                <label className={`block text-xs font-bold uppercase tracking-wider ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  {mode === 'forgot' ? 'Nova Senha' : 'Senha'}
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setError('');
                      setSuccess('');
                    }}
                    className={`text-xs font-medium hover:underline ${
                      isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'
                    }`}
                  >
                    Esqueceu a senha?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                  isDark ? 'text-slate-500' : 'text-slate-400'
                }`} />
                <input
                  type="password"
                  required
                  minLength={4}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                    setSuccess('');
                  }}
                  placeholder={
                    mode === 'signup' 
                      ? "Crie sua senha..." 
                      : mode === 'forgot'
                      ? "Digite a nova senha..."
                      : "Sua senha..."
                  }
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500/50 outline-none transition-all ${
                    isDark 
                      ? 'bg-black/50 border-white/10 text-white placeholder-slate-600 focus:border-blue-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500'
                  }`}
                />
              </div>
            </div>
            
            {error && (
              <p className="text-rose-500 text-xs mt-2 font-medium bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">
                {error}
              </p>
            )}

            {success && (
              <p className="text-emerald-500 text-xs mt-2 font-medium bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20">
                {success}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              'Aguarde...'
            ) : mode === 'signup' ? (
              <><UserPlus className="w-5 h-5" /> Criar Minha Conta</>
            ) : mode === 'forgot' ? (
              <><KeyRound className="w-5 h-5" /> Salvar Nova Senha</>
            ) : (
              <><LogIn className="w-5 h-5" /> Acessar Plataforma</>
            )}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          {mode === 'forgot' ? (
            <button 
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
                setSuccess('');
              }}
              className={`inline-flex items-center gap-1.5 text-sm font-medium hover:underline transition-colors ${
                isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowLeft className="w-4 h-4" /> Voltar para o Login
            </button>
          ) : (
            <button 
              type="button"
              onClick={() => {
                setMode(mode === 'signup' ? 'login' : 'signup');
                setError('');
                setSuccess('');
              }}
              className={`text-sm font-medium hover:underline transition-colors ${
                isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'
              }`}
            >
              {mode === 'signup' 
                ? 'Já tem uma conta? Faça login.' 
                : 'Não tem uma conta? Crie uma grátis (Community).'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

