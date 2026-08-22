const fs = require('fs');
let content = fs.readFileSync('src/components/FlowBuilder/NodeInspector.tsx', 'utf-8');

// Header Icons
content = content.replace(
  "{node.type === 'tagNode' && <Tag className=\"w-4 h-4 text-emerald-400\" />}",
  "{node.type === 'tagNode' && <Tag className=\"w-4 h-4 text-emerald-400\" />}\n          {node.type === 'databaseNode' && <Tag className=\"w-4 h-4 text-sky-400\" />}\n          {node.type === 'scheduleNode' && <Clock className=\"w-4 h-4 text-purple-400\" />}"
);

// Content specifics
const targetTagNodeEnd = `          </div>
        )}

      </div>

      {/* Footer Actions */}`;

const newSpecifics = `          </div>
        )}

        {/* Database Node Specifics */}
        {node.type === 'databaseNode' && (
          <div className="space-y-3 pt-2 border-t border-white/5">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Ação Interna (CRM)</label>
              <select
                value={data.dbAction || 'save_contact'}
                onChange={(e) => handleInputChange('dbAction', e.target.value)}
                className="w-full px-3 py-2 bg-[#141417] text-white border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="save_contact">Salvar Dados do Cliente</option>
                <option value="query_contact">Consultar se é Cadastrado</option>
              </select>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              O sistema irá ler as variáveis (como {{nome}}, {{cpf}}, {{email}}) que você coletou anteriormente usando blocos de Pergunta e vai salvar automaticamente no CRM.
            </p>
          </div>
        )}

        {/* Schedule Node Specifics */}
        {node.type === 'scheduleNode' && (
          <div className="space-y-3 pt-2 border-t border-white/5">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Ação de Agendamento</label>
              <select
                value={data.scheduleAction || 'book_appointment'}
                onChange={(e) => handleInputChange('scheduleAction', e.target.value)}
                className="w-full px-3 py-2 bg-[#141417] text-white border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="book_appointment">Marcar/Criar Agendamento</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Nome do Serviço / Consulta</label>
              <input
                type="text"
                value={data.serviceName || ''}
                onChange={(e) => handleInputChange('serviceName', e.target.value)}
                placeholder="Ex: Consulta Odontológica, Reunião de Vendas"
                className="w-full px-3 py-2 bg-[#141417] text-white border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              O robô salvará o agendamento no banco usando a variável {{data}} se existir.
            </p>
          </div>
        )}

      </div>

      {/* Footer Actions */}`;

content = content.replace(targetTagNodeEnd, newSpecifics);
fs.writeFileSync('src/components/FlowBuilder/NodeInspector.tsx', content);
console.log("Inspector updated.");
