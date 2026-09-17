import React, { useState, useEffect } from 'react';
import { Lock, User, Bot, UserPlus, LogIn } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

interface LoginScreenProps {
  onLogin: (role: 'admin' | 'enterprise' | 'community', userEmail?: string) => void;
  theme: 'dark' | 'light';
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, theme }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const isDark = theme === 'dark';

  // Função auxiliar para extrair a role do usuário (padrão: community)
  const getUserRole = (user: any): 'admin' | 'enterprise' | 'community' => {
    return user?.user_metadata?.role || 'community';
  };

  useEffect(() => {
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
           onLogin(getUserRole(session.user), session.user.email);
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (session && event !== 'SIGNED_OUT') {
          onLogin(getUserRole(session.user), session.user.email);
        }
      });
      return () => subscription.unsubscribe();
    }
  }, [onLogin]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    if (!supabase) {
      // Fallback local se não houver banco configurado
      const user = email.toLowerCase().trim();
      const pwd = password.toLowerCase().trim();
      
      if (user === 'admin' && pwd === 'admin') {
        onLogin('admin', 'admin@local');
      } else {
        setError('Usuário ou senha inválidos. (Modo Local)');
      }
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        // Criar conta
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              role: 'community' // Define o plano padrão como community
            }
          }
        });

        if (signUpError) throw signUpError;

        if (data.user?.identities?.length === 0) {
          setError('Este e-mail já está cadastrado.');
        } else if (!data.session) {
          setSuccess('Conta criada! Faça login para continuar (ou verifique seu e-mail se a confirmação estiver ativada no Supabase).');
          setIsSignUp(false); // Volta pra tela de login
          setPassword('');
        }
      } else {
        // Fazer login
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;
      }
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Falha na autenticação.');
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
            {isSignUp ? <UserPlus className="w-8 h-8 text-white" /> : <Bot className="w-8 h-8 text-white" />}
          </div>
          <h1 className="text-2xl font-black tracking-tight font-display">BotFlow Studio</h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
            {isSignUp ? 'Crie sua conta Community' : 'Acesse a sua conta'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}>
                E-mail
              </label>
              <div className="relative">
                <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                  isDark ? 'text-slate-500' : 'text-slate-400'
                }`} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                    setSuccess('');
                  }}
                  placeholder="seu@email.com"
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
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                    setSuccess('');
                  }}
                  placeholder={isSignUp ? "Crie uma senha forte..." : "Sua senha..."}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500/50 outline-none transition-all ${
                    isDark 
                      ? 'bg-black/50 border-white/10 text-white placeholder-slate-600 focus:border-blue-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500'
                  }`}
                />
              </div>
            </div>
            
            {error && (
              <p className="text-rose-500 text-xs mt-2 font-medium bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                {error}
              </p>
            )}

            {success && (
              <p className="text-emerald-500 text-xs mt-2 font-medium bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                {success}
              </p>
            )}
            
            {!supabase && (
               <p className="text-amber-500 text-xs mt-2 font-medium">
                ⚠️ Supabase não configurado. Use admin/admin.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {loading ? 'Aguarde...' : isSignUp ? (
              <><UserPlus className="w-5 h-5" /> Criar Minha Conta</>
            ) : (
              <><LogIn className="w-5 h-5" /> Acessar Plataforma</>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
              setSuccess('');
            }}
            className={`text-sm font-medium hover:underline transition-colors ${
              isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'
            }`}
          >
            {isSignUp 
              ? 'Já tem uma conta? Faça login.' 
              : 'Não tem uma conta? Crie uma grátis (Community).'}
          </button>
        </div>

      </div>
    </div>
  );
};
