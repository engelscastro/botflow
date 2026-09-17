import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, CheckCircle, Search, RefreshCw, Link as LinkIcon, Check } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';

export default function ScheduleManager({ isDark }: { isDark: boolean }) {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);

  useEffect(() => {
    fetch('/api/appointments')
      .then(res => res.json())
      .then(data => setAppointments(data))
      .catch(err => console.error("Error fetching appointments", err));
  }, []);

  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      console.log('Google connected', tokenResponse);
      setIsGoogleConnected(true);
      // Aqui o tokenResponse.access_token seria salvo ou enviado ao backend
    },
    scope: 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/spreadsheets',
  });

  const filtered = appointments.filter(a => 
    a.contactId?.includes(searchTerm) ||
    a.service?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`h-full flex flex-col ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
      <div className={`p-6 border-b flex items-center justify-between ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
        <div>
          <h2 className="text-2xl font-bold font-display flex items-center gap-2">
            <Calendar className="w-6 h-6 text-purple-500" />
            Agenda & Reservas
          </h2>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'} mt-1`}>
            Acompanhe agendamentos marcados automaticamente pelo robô.
          </p>
        </div>
        
        {/* Google Connect Area */}
        <div>
          {!isGoogleConnected ? (
            <button 
              onClick={() => login()}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              <LinkIcon className="w-4 h-4" />
              Conectar Google Agenda
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-4 py-2 rounded-lg text-sm font-medium">
              <Check className="w-4 h-4" />
              Sincronizado com Google
            </div>
          )}
        </div>
      </div>

      <div className="p-6 flex-1 overflow-auto">
        <div className="flex items-center gap-4 mb-6">
          <div className={`flex-1 flex items-center gap-2 px-4 py-2 rounded-xl border focus-within:ring-2 focus-within:ring-purple-500/50 transition-all ${
            isDark ? 'bg-black/20 border-white/10' : 'bg-white border-slate-200'
          }`}>
            <Search className={`w-5 h-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
            <input
              type="text"
              placeholder="Buscar por cliente ou serviço..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none w-full text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-500">
              Nenhum agendamento encontrado.
            </div>
          ) : (
            filtered.map(apt => (
              <div key={apt.id} className={`p-5 rounded-2xl border transition-all ${
                isDark ? 'bg-black/20 border-white/10 hover:border-white/20' : 'bg-white border-slate-200 hover:shadow-md'
              }`}>
                <div className="flex items-start justify-between mb-4">
                  <div className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5 ${
                    apt.status === 'scheduled' ? 'bg-blue-500/10 text-blue-500' :
                    apt.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' :
                    'bg-rose-500/10 text-rose-500'
                  }`}>
                    {apt.status === 'scheduled' ? <Clock className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                    {apt.status === 'scheduled' ? 'Agendado' : apt.status}
                  </div>
                </div>
                
                <h3 className="text-lg font-bold mb-1">{apt.service}</h3>
                
                <div className="space-y-2 mt-4 text-sm">
                  <div className={`flex items-center gap-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(apt.date).toLocaleString('pt-BR')}</span>
                  </div>
                  <div className={`flex items-center gap-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    <User className="w-4 h-4" />
                    <span>{apt.contactId}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
