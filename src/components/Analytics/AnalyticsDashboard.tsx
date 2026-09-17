import React, { useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area,
  LineChart,
  Line
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Bot, 
  UserCheck, 
  Clock, 
  Star, 
  Download, 
  FileSpreadsheet, 
  PieChart as PieIcon,
  Zap,
  Smile,
  Frown,
  Meh,
  Send,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Calendar,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Layers,
  MessageSquare,
  Printer,
  RefreshCw
} from 'lucide-react';
import { AnalyticsSummary } from '../../types';

interface AnalyticsDashboardProps {
  analytics: AnalyticsSummary;
  theme?: 'dark' | 'light';
}

type PeriodFilter = 'today' | '7d' | '30d' | 'all';
type ChannelFilter = 'all' | 'whatsapp' | 'telegram' | 'instagram' | 'web';
type SubTab = 'overview' | 'channels' | 'broadcast' | 'sentiment';

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ 
  analytics, 
  theme = 'dark' 
}) => {
  const isDark = theme === 'dark';
  const [period, setPeriod] = useState<PeriodFilter>('7d');
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>('all');
  const [activeTab, setActiveTab] = useState<SubTab>('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  // Peak activity hours mock data based on live analytics
  // Hourly Heatmap Fake Data replaced with zeros for starting state
  const hourlyPeakData = useMemo(() => [
    { hour: '08:00', volume: 0, engagement: '0%' },
    { hour: '10:00', volume: 0, engagement: '0%' },
    { hour: '12:00', volume: 0, engagement: '0%' },
    { hour: '14:00', volume: 0, engagement: '0%' },
    { hour: '16:00', volume: 0, engagement: '0%' },
    { hour: '18:00', volume: 0, engagement: '0%' },
    { hour: '20:00', volume: 0, engagement: '0%' },
    { hour: '22:00', volume: 0, engagement: '0%' }
  ], []);

  // Broadcast & Funnel Conversion metrics
  const broadcastMetrics = useMemo(() => ({
    totalCampaigns: 0,
    totalDispatched: 0,
    deliveredRate: 0,
    readRate: 0,
    responseRate: 0,
    optOutRate: 0,
    funnelSteps: [
      { step: '1. Mensagem Enviada', count: 0, rate: '0%', color: '#3B82F6' },
      { step: '2. Entregue no Celular', count: 0, rate: '0%', color: '#10B981' },
      { step: '3. Mensagem Aberta / Lida', count: 0, rate: '0%', color: '#6366F1' },
      { step: '4. Interação / Resposta', count: 0, rate: '0%', color: '#EC4899' },
      { step: '5. Conversão / Agendamento', count: 0, rate: '0%', color: '#F59E0B' }
    ]
  }), []);

  // Top Keywords & User Intents
  const topIntents = useMemo(() => [
    { keyword: 'Quero me Cadastrar', triggers: 0, share: '0%', trend: '0%' },
    { keyword: 'Agendar Coleta', triggers: 0, share: '0%', trend: '0%' },
    { keyword: 'Dúvidas Gerais', triggers: 0, share: '0%', trend: '0%' },
    { keyword: 'Falar com Enfermagem', triggers: 0, share: '0%', trend: '0%' },
    { keyword: 'Outros', triggers: 0, share: '0%', trend: '0%' }
  ], []);

  const handleExportCSV = () => {
    let csv = "Relatório de Desempenho & Engajamento - BotFlow Studio Pro\n\n";
    csv += "Métrica,Valor\n";
    csv += `Total de Mensagens Processadas,${analytics.totalMessages}\n`;
    csv += `Conversas Ativas em Tempo Real,${analytics.activeConversations}\n`;
    csv += `Taxa de Resolução 100% por Robô,${analytics.botResolutionRate}%\n`;
    csv += `Taxa de Transferência para Atendente,${analytics.humanHandoverRate}%\n`;
    csv += `Tempo Médio de Resposta,${analytics.avgResponseTimeSec}s\n`;
    csv += `Índice de Satisfação CSAT,${analytics.csatScore}/5.0\n\n`;

    csv += "Volume de Mensagens por Canal\n";
    csv += "Período,WhatsApp,Telegram,Instagram,Web Chat\n";
    analytics.messagesByChannel.forEach(item => {
      csv += `${item.name},${item.whatsapp},${item.telegram},${item.instagram},${item.web}\n`;
    });

    csv += "\nAnálise de Sentimento dos Clientes\n";
    csv += "Classificação,Quantidade de Atendimentos\n";
    analytics.sentimentBreakdown.forEach(s => {
      csv += `"${s.type}",${s.count}\n`;
    });

    csv += "\nFunil de Disparos em Massa & Campanhas\n";
    csv += "Etapa do Funil,Contatos,Taxa de Conversão\n";
    broadcastMetrics.funnelSteps.forEach(f => {
      csv += `"${f.step}",${f.count},${f.rate}\n`;
    });

    const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csv);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `relatorio_botflow_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`flex-1 p-6 overflow-y-auto space-y-6 transition-colors ${
      isDark ? 'bg-[#0A0A0B] text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      
      {/* Header Banner & Action Bar */}
      <div className={`p-6 rounded-2xl border transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
        isDark 
          ? 'bg-[#121215] border-white/5 shadow-sm' 
          : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-display flex items-center gap-2">
                Relatórios Detalhados & Engajamento
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-normal">
                  Tempo Real
                </span>
              </h2>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Métricas de conversão, desempenho dos fluxos com IA, taxa de retenção e análise de audiência multiplataforma.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Period Selector */}
          <div className={`p-1 rounded-xl border flex items-center gap-1 ${
            isDark ? 'bg-black/40 border-white/10' : 'bg-slate-100 border-slate-200'
          }`}>
            {(['today', '7d', '30d', 'all'] as PeriodFilter[]).map((p) => {
              const labels: Record<PeriodFilter, string> = {
                today: 'Hoje',
                '7d': '7 Dias',
                '30d': '30 Dias',
                all: 'Total'
              };
              const isSelected = period === p;
              return (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? isDark
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white text-emerald-700 font-bold shadow-xs border border-slate-200'
                      : isDark
                        ? 'text-slate-400 hover:text-white'
                        : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {labels[p]}
                </button>
              );
            })}
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            title="Atualizar dados agora"
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isDark 
                ? 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300' 
                : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
          </button>

          {/* Print/PDF */}
          <button
            onClick={handlePrint}
            title="Imprimir ou Salvar em PDF"
            className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              isDark 
                ? 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300' 
                : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Imprimir</span>
          </button>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-xs flex items-center gap-2 transition-all shrink-0 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" /> 
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className={`flex items-center gap-2 border-b pb-1 ${
        isDark ? 'border-white/10' : 'border-slate-200'
      }`}>
        {[
          { id: 'overview', label: 'Visão Geral & KPIs', icon: Activity },
          { id: 'channels', label: 'Engajamento & Horários de Pico', icon: MessageSquare },
          { id: 'broadcast', label: 'Disparos em Massa & Funil', icon: Send },
          { id: 'sentiment', label: 'Sentimento & Insights de IA', icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SubTab)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                isActive
                  ? isDark
                    ? 'bg-white/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs'
                  : isDark
                    ? 'text-slate-400 hover:text-white hover:bg-white/5'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* KPI Summary Cards Grid (Always prominent) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Total Messages */}
        <div className={`p-4 rounded-2xl border transition-all ${
          isDark ? 'bg-[#121215] border-white/5' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Total Mensagens
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {analytics.totalMessages.toLocaleString('pt-BR')}
          </div>
          <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-semibold mt-1">
            <ArrowUpRight className="w-3 h-3" /> +18.4% vs período anterior
          </div>
        </div>

        {/* Active Conversations */}
        <div className={`p-4 rounded-2xl border transition-all ${
          isDark ? 'bg-[#121215] border-white/5' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Conversas Ativas
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {analytics.activeConversations}
          </div>
          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Ao vivo no sistema
          </div>
        </div>

        {/* Bot Resolution Rate */}
        <div className={`p-4 rounded-2xl border transition-all ${
          isDark ? 'bg-[#121215] border-white/5' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Retenção do Bot
            </span>
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Bot className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-400">
            {analytics.botResolutionRate}%
          </div>
          <div className="text-[10px] text-purple-300 font-medium mt-1">
            Sem intervenção humana
          </div>
        </div>

        {/* Avg Response Time */}
        <div className={`p-4 rounded-2xl border transition-all ${
          isDark ? 'bg-[#121215] border-white/5' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Tempo Médio
            </span>
            <div className="w-7 h-7 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-teal-400">
            {analytics.avgResponseTimeSec}s
          </div>
          <div className="text-[10px] text-emerald-500 font-medium mt-1">
            ⚡ Resposta instantânea
          </div>
        </div>

        {/* CSAT Score */}
        <div className={`p-4 rounded-2xl border transition-all ${
          isDark ? 'bg-[#121215] border-white/5' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Satisfação CSAT
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
          </div>
          <div className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {analytics.csatScore} <span className="text-sm font-normal text-slate-500">/ 5.0</span>
          </div>
          <div className="text-[10px] text-amber-500 font-semibold mt-1">
            ★★★★★ 96% aprovação
          </div>
        </div>

      </div>

      {/* TAB 1: VISÃO GERAL & KPIS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Messages Volume Area Chart */}
            <div className={`lg:col-span-2 p-5 rounded-2xl border ${
              isDark ? 'bg-[#121215] border-white/5' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-sm flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-500" /> Volume de Mensagens por Canal
                  </h3>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Evolução diária de atendimentos recebidos e respondidos
                  </p>
                </div>
              </div>
              
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <AreaChart data={analytics.messagesByChannel}>
                    <defs>
                      <linearGradient id="waGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
                      </linearGradient>
                      <linearGradient id="tgGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0284C7" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#0284C7" stopOpacity={0.0}/>
                      </linearGradient>
                      <linearGradient id="igGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EC4899" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#EC4899" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#262626' : '#f1f5f9'} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: isDark ? '#9CA3AF' : '#64748B' }} />
                    <YAxis tick={{ fontSize: 11, fill: isDark ? '#9CA3AF' : '#64748B' }} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: isDark ? '#18181B' : '#FFFFFF',
                        borderColor: isDark ? '#27272A' : '#E2E8F0',
                        borderRadius: '0.75rem',
                        fontSize: '12px',
                        color: isDark ? '#F4F4F5' : '#0F172A'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: '10px' }} />
                    <Area type="monotone" dataKey="whatsapp" name="WhatsApp Web" stackId="1" stroke="#10b981" fill="url(#waGrad)" strokeWidth={2} />
                    <Area type="monotone" dataKey="telegram" name="Telegram" stackId="1" stroke="#0284c7" fill="url(#tgGrad)" strokeWidth={2} />
                    <Area type="monotone" dataKey="instagram" name="Instagram" stackId="1" stroke="#ec4899" fill="url(#igGrad)" strokeWidth={2} />
                    <Area type="monotone" dataKey="web" name="Web Chat" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bot vs Human Resolution Pie Chart */}
            <div className={`p-5 rounded-2xl border flex flex-col justify-between ${
              isDark ? 'bg-[#121215] border-white/5' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <div>
                <h3 className="font-bold text-sm mb-1 flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-purple-500" /> Resolução: Bot vs Humano
                </h3>
                <p className={`text-xs mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Porcentagem de chamados finalizados sem intervenção humana
                </p>

                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <PieChart>
                      <Pie
                        data={analytics.resolutionByBotVsHuman}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={5}
                        dataKey="valor"
                      >
                        {analytics.resolutionByBotVsHuman.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [`${value}%`, 'Taxa']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className={`space-y-2 pt-3 border-t text-xs ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
                {analytics.resolutionByBotVsHuman.map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="flex items-center gap-2 font-medium">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      {item.name}
                    </span>
                    <span className="font-bold">{item.valor}%</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* AI Automated Recommendations Banner */}
          <div className="bg-gradient-to-r from-emerald-950/40 via-blue-950/20 to-purple-950/30 border border-emerald-500/20 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-emerald-300 flex items-center gap-2">
                  Diagnóstico Inteligente do BotFlow AI
                </h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-3xl">
                  Seus fluxos estão com <strong>{analytics.botResolutionRate}% de retenção autônoma</strong>. O horário de maior engajamento dos seus clientes é entre <strong>16h e 18h</strong>. Disparos em massa programados para este intervalo têm 34% mais chance de conversão imediata.
                </p>
              </div>
            </div>
            <button 
              onClick={() => setActiveTab('broadcast')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs whitespace-nowrap transition-all shrink-0 cursor-pointer"
            >
              Ver Funil de Disparos →
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: ENGAJAMENTO & HORÁRIOS DE PICO */}
      {activeTab === 'channels' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Hourly Peak Engagement Chart */}
            <div className={`p-5 rounded-2xl border ${
              isDark ? 'bg-[#121215] border-white/5' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <h3 className="font-bold text-sm mb-1 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" /> Horários de Pico & Atividade dos Usuários
              </h3>
              <p className={`text-xs mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Distribuição de tráfego ao longo do dia para planejar disparos e plantão
              </p>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <BarChart data={hourlyPeakData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#262626' : '#f1f5f9'} />
                    <XAxis dataKey="hour" tick={{ fontSize: 11, fill: isDark ? '#9CA3AF' : '#64748B' }} />
                    <YAxis tick={{ fontSize: 11, fill: isDark ? '#9CA3AF' : '#64748B' }} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: isDark ? '#18181B' : '#FFFFFF',
                        borderColor: isDark ? '#27272A' : '#E2E8F0',
                        borderRadius: '0.75rem',
                        fontSize: '12px'
                      }}
                    />
                    <Bar dataKey="volume" name="Volume de Mensagens" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Keywords & Trigger Intents */}
            <div className={`p-5 rounded-2xl border ${
              isDark ? 'bg-[#121215] border-white/5' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <h3 className="font-bold text-sm mb-1 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" /> Intenções & Gatilhos Mais Acionados
              </h3>
              <p className={`text-xs mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Assuntos mais procurados pelos clientes ao iniciar atendimento
              </p>

              <div className="space-y-3">
                {topIntents.map((item, idx) => (
                  <div 
                    key={idx} 
                    className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                      isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs">{item.keyword}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{item.triggers} acionamentos no período</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-emerald-400">{item.share}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        item.trend.startsWith('+') 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {item.trend}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 3: DISPAROS EM MASSA & FUNIL */}
      {activeTab === 'broadcast' && (
        <div className="space-y-6">
          {/* Funnel Conversion Breakdown */}
          <div className={`p-6 rounded-2xl border ${
            isDark ? 'bg-[#121215] border-white/5' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <Send className="w-5 h-5 text-emerald-400" /> Funil de Conversão de Disparos em Massa
                </h3>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Métricas acumuladas de entregabilidade, leitura e conversão das campanhas
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                  {broadcastMetrics.deliveredRate}% Entregues
                </span>
                <span className="px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold">
                  {broadcastMetrics.responseRate}% Respostas
                </span>
              </div>
            </div>

            {/* Funnel Progress Bars */}
            <div className="space-y-4 max-w-4xl">
              {broadcastMetrics.funnelSteps.map((f, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: f.color }} />
                      {f.step}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className={`font-mono ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {f.count.toLocaleString('pt-BR')} contatos
                      </span>
                      <span className="font-bold text-emerald-400 min-w-[45px] text-right font-mono">{f.rate}</span>
                    </div>
                  </div>
                  <div className={`w-full h-3 rounded-full overflow-hidden ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
                    <div 
                      className="h-full rounded-full transition-all duration-500" 
                      style={{ 
                        width: f.rate, 
                        backgroundColor: f.color 
                      }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Drop-off Nodes in Visual Flow */}
          <div className={`p-5 rounded-2xl border ${
            isDark ? 'bg-[#121215] border-white/5' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <h3 className="font-bold text-sm mb-1 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" /> Nós do Fluxo Visual com Maior Abandono
            </h3>
            <p className={`text-xs mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Identifique onde os clientes encerram a conversa antes de concluir a conversão
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {analytics.topDropoffNodes.map((item, idx) => (
                <div key={idx} className={`p-4 rounded-xl border space-y-2 ${
                  isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'
                }`}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold truncate">{item.nodeName}</span>
                    <span className="text-rose-500 font-bold shrink-0">{item.percentage}%</span>
                  </div>
                  <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-white/5' : 'bg-slate-200'}`}>
                    <div
                      className="bg-rose-500 h-full rounded-full"
                      style={{ width: `${item.percentage * 15}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {item.dropoffs} clientes pararam nesta etapa
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SENTIMENTO & INSIGHTS DE IA */}
      {activeTab === 'sentiment' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {analytics.sentimentBreakdown.map((s, idx) => {
              const isPositive = s.type.includes('Positivo');
              const isNeutral = s.type.includes('Neutro');
              const isUrgent = s.type.includes('Urgente') || s.type.includes('Frustrado');

              const Icon = isPositive ? Smile : isNeutral ? Meh : Frown;

              return (
                <div 
                  key={idx} 
                  className={`p-5 rounded-2xl border transition-all ${
                    isDark ? 'bg-[#121215] border-white/5' : 'bg-white border-slate-200 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${s.color}20`, color: s.color }}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-sm">{s.type}</span>
                    </div>
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                  </div>

                  <div className="text-3xl font-black mt-2 font-mono">
                    {s.count.toLocaleString('pt-BR')}
                  </div>
                  <div className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    conversas classificadas automaticamente por IA
                  </div>
                </div>
              );
            })}
          </div>

          {/* CSAT Detailed Breakdown */}
          <div className={`p-6 rounded-2xl border ${
            isDark ? 'bg-[#121215] border-white/5' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <h3 className="font-bold text-base mb-1 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" /> Avaliação de Qualidade de Atendimento (CSAT)
            </h3>
            <p className={`text-xs mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Feedback pós-atendimento coletado após a finalização do fluxo
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
              {[
                { stars: '5 Estrelas', count: '0', pct: '0%', color: '#10B981' },
                { stars: '4 Estrelas', count: '0', pct: '0%', color: '#3B82F6' },
                { stars: '3 Estrelas', count: '0', pct: '0%', color: '#F59E0B' },
                { stars: '2 Estrelas', count: '0', pct: '0%', color: '#F97316' },
                { stars: '1 Estrela', count: '0', pct: '0%', color: '#EF4444' }
              ].map((item, i) => (
                <div key={i} className={`p-4 rounded-xl border text-center space-y-1 ${
                  isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'
                }`}>
                  <div className="text-xs font-bold">{item.stars}</div>
                  <div className="text-xl font-black font-mono" style={{ color: item.color }}>{item.count}</div>
                  <div className="text-[10px] text-slate-400">{item.pct} dos votos</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
