const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Imports
content = content.replace("import AnalyticsDashboard from './components/AnalyticsDashboard';", "import AnalyticsDashboard from './components/AnalyticsDashboard';\nimport CRMManager from './components/CRM/CRMManager';\nimport ScheduleManager from './components/Schedule/ScheduleManager';");

// Types
content = content.replace("'builder' | 'analytics' | 'broadcast'", "'builder' | 'analytics' | 'broadcast' | 'crm' | 'schedule'");

// Navigation mapping
content = content.replace("<Calendar className=\"w-5 h-5\" />", "<Calendar className=\"w-5 h-5\" />\n              <span>Agendamentos</span>\n            </button>\n\n            <button\n              onClick={() => setActiveTab('crm')}\n              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'crm' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : (isDark ? 'text-slate-400 hover:bg-white/5 hover:text-slate-200' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800')}`}\n            >\n              <Users className=\"w-5 h-5\" />\n              <span>CRM</span>\n            </button>");
content = content.replace("<span>Agendamentos</span>", "<span>Campanhas</span>").replace("Campanhas\n            </button>\n\n            <button\n              onClick={() => setActiveTab('crm')}", "Campanhas\n            </button>\n\n            <button\n              onClick={() => setActiveTab('schedule')}\n              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'schedule' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : (isDark ? 'text-slate-400 hover:bg-white/5 hover:text-slate-200' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800')}`}\n            >\n              <Calendar className=\"w-5 h-5\" />\n              <span>Agenda</span>\n            </button>\n\n            <button\n              onClick={() => setActiveTab('crm')}");

// Render active tab
content = content.replace("{activeTab === 'analytics' && <AnalyticsDashboard isDark={isDark} />}", "{activeTab === 'analytics' && <AnalyticsDashboard isDark={isDark} />}\n        {activeTab === 'crm' && <CRMManager isDark={isDark} />}\n        {activeTab === 'schedule' && <ScheduleManager isDark={isDark} />}");

fs.writeFileSync('src/App.tsx', content);
console.log("App.tsx updated.");
