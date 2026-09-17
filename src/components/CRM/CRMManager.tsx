import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, Phone, User, Calendar } from 'lucide-react';

export default function CRMManager({ isDark }: { isDark: boolean }) {
  const [contacts, setContacts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('/api/contacts')
      .then(res => res.json())
      .then(data => setContacts(data))
      .catch(err => console.error("Error fetching contacts", err));
  }, []);

  const filtered = contacts.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone?.includes(searchTerm)
  );

  return (
    <div className={`h-full flex flex-col ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
      <div className={`p-6 border-b flex items-center justify-between ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
        <div>
          <h2 className="text-2xl font-bold font-display flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-500" />
            CRM & Contatos
          </h2>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'} mt-1`}>
            Gerencie leads capturados automaticamente pelo fluxo do chatbot.
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
              placeholder="Buscar por nome ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none w-full text-sm"
            />
          </div>
          <button className={`px-4 py-2 rounded-xl border flex items-center gap-2 text-sm font-medium transition-colors ${
            isDark ? 'bg-black/20 border-white/10 hover:bg-white/5' : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}>
            <Filter className="w-4 h-4" />
            Filtros
          </button>
        </div>

        <div className={`rounded-xl border overflow-hidden ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
          <table className="w-full text-left text-sm">
            <thead className={`border-b ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
              <tr>
                <th className="px-6 py-4 font-semibold">Nome</th>
                <th className="px-6 py-4 font-semibold">Telefone</th>
                <th className="px-6 py-4 font-semibold">Data Cadastro</th>
                <th className="px-6 py-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    Nenhum contato encontrado.
                  </td>
                </tr>
              ) : (
                filtered.map(contact => (
                  <tr key={contact.id} className={`border-b last:border-0 transition-colors ${
                    isDark ? 'border-white/5 hover:bg-white/5' : 'border-slate-100 hover:bg-slate-50'
                  }`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'
                        }`}>
                          <User className="w-4 h-4" />
                        </div>
                        <span className="font-medium">{contact.name || 'Sem Nome'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {contact.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(contact.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4">
                      {Object.keys(contact.customFields || {}).filter(k => k !== 'phone').map(k => (
                        <div key={k} className="text-xs mb-1">
                          <span className="font-semibold text-slate-400">{k}:</span> {contact.customFields[k]}
                        </div>
                      ))}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-blue-500 hover:text-blue-600 font-medium text-xs">
                        Ver Perfil
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
