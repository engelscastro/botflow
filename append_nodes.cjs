const fs = require('fs');
let content = fs.readFileSync('src/components/FlowBuilder/CustomNodes.tsx', 'utf-8');

const newImports = "import { Database, Calendar } from 'lucide-react';\n";
content = newImports + content;

const newNodes = `
export const DatabaseNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as NodeData;
  return (
    <div className={\`w-64 bg-[#141417] rounded-xl shadow-2xl border-2 transition-all \${selected ? 'border-sky-500 ring-2 ring-sky-500/20' : 'border-sky-500/40 hover:border-sky-500/80'}\`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-sky-500/50 border-2 border-sky-400" />
      <div className="bg-sky-500/20 text-sky-300 px-3 py-2 rounded-t-lg border-b border-sky-500/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* We had an issue with Database icon missing, we can use Users */}
          <span className="font-bold text-xs uppercase tracking-wider">Ação Interna CRM</span>
        </div>
      </div>
      <div className="p-3 text-xs text-slate-300">
        <p className="font-bold text-white mb-1">{nodeData.label || 'Salvar / Consultar Cliente'}</p>
        <p className="text-slate-400 text-[11px]">
          {nodeData.dbAction === 'save_contact' ? 'Salvar perfil do contato' : 'Consultar contato no DB'}
        </p>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-sky-500 border-2 border-slate-900" />
    </div>
  );
});

export const ScheduleNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as NodeData;
  return (
    <div className={\`w-64 bg-[#141417] rounded-xl shadow-2xl border-2 transition-all \${selected ? 'border-purple-500 ring-2 ring-purple-500/20' : 'border-purple-500/40 hover:border-purple-500/80'}\`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-purple-500/50 border-2 border-purple-400" />
      <div className="bg-purple-500/20 text-purple-300 px-3 py-2 rounded-t-lg border-b border-purple-500/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold text-xs uppercase tracking-wider">Agendamento</span>
        </div>
      </div>
      <div className="p-3 text-xs text-slate-300">
        <p className="font-bold text-white mb-1">{nodeData.label || 'Marcar Agenda'}</p>
        <p className="text-slate-400 text-[11px] truncate">
          Serviço: {nodeData.serviceName || 'Atendimento'}
        </p>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-purple-500 border-2 border-slate-900" />
    </div>
  );
});
`;

content += newNodes;
fs.writeFileSync('src/components/FlowBuilder/CustomNodes.tsx', content);
console.log("Nodes appended.");
