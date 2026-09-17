const fs = require('fs');
let content = fs.readFileSync('src/components/FlowBuilder/FlowCanvas.tsx', 'utf-8');

const targetTagNodeStr = `<button
              onClick={() => handleAddNode('tagNode', 'Adicionar Tag')}
              className="w-full text-left p-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-300 flex items-center gap-2 font-medium transition-colors"
            >
              <Tag className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>9. Etiqueta / Tag</span>
            </button>`;

const newButtons = `${targetTagNodeStr}
            <button
              onClick={() => handleAddNode('databaseNode', 'Ação Interna CRM')}
              className="w-full text-left p-2.5 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 rounded-xl text-sky-300 flex items-center gap-2 font-medium transition-colors"
            >
              <Database className="w-4 h-4 text-sky-400 shrink-0" />
              <span>10. Cadastro CRM DB</span>
            </button>
            <button
              onClick={() => handleAddNode('scheduleNode', 'Agendamento')}
              className="w-full text-left p-2.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-xl text-purple-300 flex items-center gap-2 font-medium transition-colors"
            >
              <Calendar className="w-4 h-4 text-purple-400 shrink-0" />
              <span>11. Agenda Interna</span>
            </button>`;

content = content.replace(targetTagNodeStr, newButtons);
fs.writeFileSync('src/components/FlowBuilder/FlowCanvas.tsx', content);
console.log("Canvas buttons updated.");
