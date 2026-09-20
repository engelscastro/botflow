import React, { useState } from 'react';
import { ShieldCheck, Zap, Users, Search, Ban, CheckCircle, Clock, Mail, Plus, X, RefreshCw } from 'lucide-react';
import { UserAccount } from '../../types';

interface UsersManagerProps {
  isDark: boolean;
  users: UserAccount[];
  onUpdateStatus: (userId: string, newStatus: 'active' | 'inactive' | 'blocked') => void;
  onUpdateRole?: (userId: string, newRole: 'admin' | 'enterprise' | 'community') => void;
  onRefresh?: () => void;
}

export const UsersManager: React.FC<UsersManagerProps> = ({ 
  isDark, 
  users, 
  onUpdateStatus,
  onUpdateRole,
  onRefresh 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'enterprise' | 'community'>('community');
  const [addingUser, setAddingUser] = useState(false);
  const [modalError, setModalError] = useState('');

  const filteredUsers = users.filter(u => 
    (u.username || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.role || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');
    setAddingUser(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          email: newEmail,
          password: newPassword,
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao criar usuário');
      }

      // Se a role escolhida não foi a padrão, atualiza
      if (newRole !== 'community' && onUpdateRole && data.user?.id) {
        await onUpdateRole(data.user.id, newRole);
      }

      setShowAddModal(false);
      setNewName('');
      setNewEmail('');
      setNewPassword('');
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setModalError(err.message || 'Falha ao salvar usuário');
    } finally {
      setAddingUser(false);
    }
  };

  return (
    <div className={`h-full flex flex-col ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
      <div className={`p-6 border-b flex flex-wrap items-center justify-between gap-4 ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
        <div>
          <h2 className="text-2xl font-bold font-display flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-500" />
            Gerenciamento de Usuários
          </h2>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'} mt-1`}>
            Controle de contas, permissões de acesso e sincronização direta com a tabela <b>users</b> do Supabase.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className={`p-2.5 rounded-xl border transition-all flex items-center gap-2 text-sm font-semibold ${
                isDark 
                  ? 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300' 
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm'
              }`}
              title="Atualizar lista do banco"
            >
              <RefreshCw className="w-4 h-4" />
              Sincronizar
            </button>
          )}

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            Novo Usuário
          </button>
        </div>
      </div>

      <div className="p-6 flex-1 overflow-auto">
        <div className="flex items-center gap-4 mb-6">
          <div className={`flex-1 flex items-center gap-2 px-4 py-2 rounded-xl border focus-within:ring-2 focus-within:ring-blue-500/50 transition-all ${
            isDark ? 'bg-black/20 border-white/10' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <Search className={`w-5 h-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
            <input
              type="text"
              placeholder="Buscar por nome, e-mail ou perfil..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none w-full text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map(user => (
            <div key={user.id} className={`p-5 rounded-2xl border transition-all ${
              isDark ? 'bg-black/20 border-white/10' : 'bg-white border-slate-200 shadow-sm'
            } ${user.status === 'blocked' ? 'opacity-65' : ''}`}>
              
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    user.role === 'admin' ? 'bg-emerald-500/10 text-emerald-500' :
                    user.role === 'enterprise' ? 'bg-purple-500/10 text-purple-500' :
                    'bg-blue-500/10 text-blue-500'
                  }`}>
                    {user.role === 'admin' && <ShieldCheck className="w-5 h-5" />}
                    {user.role === 'enterprise' && <Zap className="w-5 h-5" />}
                    {user.role === 'community' && <Users className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-base leading-tight">{user.name || user.username}</h3>
                    {user.email && (
                      <p className={`text-xs flex items-center gap-1 mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        <Mail className="w-3 h-3" />
                        {user.email}
                      </p>
                    )}
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  user.role === 'admin' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                  user.role === 'enterprise' ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' :
                  'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                }`}>
                  {user.role}
                </span>
              </div>

              {/* Plano / Nível de Acesso */}
              {onUpdateRole && (
                <div className="mt-3 pt-3 border-t border-dashed border-slate-200 dark:border-white/5">
                  <span className={`text-[11px] font-bold uppercase tracking-wider block mb-1.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    Nível de Acesso (Role):
                  </span>
                  <div className="grid grid-cols-3 gap-1 bg-slate-100/10 p-1 rounded-lg">
                    {(['community', 'enterprise', 'admin'] as const).map(roleOption => (
                      <button
                        key={roleOption}
                        onClick={() => onUpdateRole(user.id, roleOption)}
                        className={`py-1 text-[11px] font-bold rounded-md capitalize transition-all ${
                          user.role === roleOption
                            ? roleOption === 'admin' ? 'bg-emerald-600 text-white shadow-sm' :
                              roleOption === 'enterprise' ? 'bg-purple-600 text-white shadow-sm' :
                              'bg-blue-600 text-white shadow-sm'
                            : isDark ? 'text-slate-400 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {roleOption}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Status da Conta */}
              <div className={`space-y-2 mt-3 text-xs pt-3 border-t ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                <div className={`flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  <Clock className="w-3.5 h-3.5" />
                  <span>Cadastrado em: {user.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : 'N/A'}</span>
                </div>
                
                <div className="flex bg-slate-100/10 rounded-lg p-1 gap-1 mt-2">
                  <button
                    onClick={() => onUpdateStatus(user.id, 'active')}
                    className={`flex-1 py-1.5 px-2 rounded-md text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      user.status === 'active'
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : isDark ? 'text-slate-400 hover:bg-white/5' : 'text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Ativo
                  </button>
                  
                  <button
                    onClick={() => onUpdateStatus(user.id, 'blocked')}
                    className={`flex-1 py-1.5 px-2 rounded-md text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      user.status === 'blocked'
                        ? 'bg-rose-500 text-white shadow-sm'
                        : isDark ? 'text-slate-400 hover:bg-white/5' : 'text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    <Ban className="w-3.5 h-3.5" />
                    Bloqueado
                  </button>
                </div>
              </div>

            </div>
          ))}
          
          {filteredUsers.length === 0 && (
            <div className="col-span-full py-16 text-center text-slate-500">
              Nenhum usuário encontrado.
            </div>
          )}
        </div>
      </div>

      {/* Modal Adicionar Usuário */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl ${
            isDark ? 'bg-[#0E0E10] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                Criar Novo Usuário
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1 opacity-70">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: João da Silva"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-blue-500/50 ${
                    isDark ? 'bg-black/30 border-white/10' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1 opacity-70">
                  E-mail
                </label>
                <input
                  type="email"
                  required
                  placeholder="usuario@empresa.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-blue-500/50 ${
                    isDark ? 'bg-black/30 border-white/10' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1 opacity-70">
                  Senha Inicial
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Mínimo 6 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-blue-500/50 ${
                    isDark ? 'bg-black/30 border-white/10' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1 opacity-70">
                  Nível de Acesso (Role)
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-blue-500/50 ${
                    isDark ? 'bg-slate-900 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  <option value="community">Community (Gratuito)</option>
                  <option value="enterprise">Enterprise (Completo)</option>
                  <option value="admin">Administrador (Master)</option>
                </select>
              </div>

              {modalError && (
                <p className="text-rose-500 text-xs p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
                  {modalError}
                </p>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold ${
                    isDark ? 'hover:bg-white/10 text-slate-300' : 'hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={addingUser}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-500/20 disabled:opacity-50"
                >
                  {addingUser ? 'Criando...' : 'Salvar no Banco'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

