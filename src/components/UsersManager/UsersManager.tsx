import React from 'react';
import { ShieldCheck, Zap, Users, Search, Ban, CheckCircle, Clock } from 'lucide-react';
import { UserAccount } from '../../types';

interface UsersManagerProps {
  isDark: boolean;
  users: UserAccount[];
  onUpdateStatus: (userId: string, newStatus: 'active' | 'inactive' | 'blocked') => void;
}

export const UsersManager: React.FC<UsersManagerProps> = ({ isDark, users, onUpdateStatus }) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`h-full flex flex-col ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
      <div className={`p-6 border-b flex items-center justify-between ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
        <div>
          <h2 className="text-2xl font-bold font-display flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-500" />
            Gerenciamento de Usuários
          </h2>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'} mt-1`}>
            Controle de acesso, permissões e status das contas da plataforma.
          </p>
        </div>
      </div>

      <div className="p-6 flex-1 overflow-auto">
        <div className="flex items-center gap-4 mb-6">
          <div className={`flex-1 flex items-center gap-2 px-4 py-2 rounded-xl border focus-within:ring-2 focus-within:ring-blue-500/50 transition-all ${
            isDark ? 'bg-black/20 border-white/10' : 'bg-white border-slate-200'
          }`}>
            <Search className={`w-5 h-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
            <input
              type="text"
              placeholder="Buscar por usuário ou permissão..."
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
            } ${user.status === 'blocked' ? 'opacity-70' : ''}`}>
              
              <div className="flex items-start justify-between mb-4">
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
                    <h3 className="font-bold text-lg">{user.username}</h3>
                    <p className={`text-xs uppercase tracking-wider font-bold ${
                      user.role === 'admin' ? 'text-emerald-500' :
                      user.role === 'enterprise' ? 'text-purple-500' :
                      'text-blue-500'
                    }`}>
                      {user.role}
                    </p>
                  </div>
                </div>
              </div>

              <div className={`space-y-2 mt-4 text-sm pt-4 border-t ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                <div className={`flex items-center gap-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  <Clock className="w-4 h-4" />
                  <span>Criado em: {user.createdAt || 'Desconhecido'}</span>
                </div>
                <div className={`flex flex-col gap-2 pt-2 mt-2 border-t ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                  <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    Status Atual:
                  </span>
                  
                  <div className="flex bg-slate-100/10 rounded-lg p-1 gap-1">
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
            </div>
          ))}
          
          {filteredUsers.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500">
              Nenhum usuário encontrado.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
