import fs from 'fs';
let content = fs.readFileSync('src/components/CRM/CRMManager.tsx', 'utf8');

// replace column headers
content = content.replace(
  '<th className="px-6 py-4 font-medium text-left">Data de Criação</th>',
  '<th className="px-6 py-4 font-medium text-left">Data de Criação</th>\n                  <th className="px-6 py-4 font-medium text-left">Respostas (Variáveis)</th>'
);

// replace column data
content = content.replace(
  '<td className="px-6 py-4 text-slate-500">\n                      {new Date(contact.createdAt).toLocaleDateString(\'pt-BR\')}\n                    </td>',
  `<td className="px-6 py-4 text-slate-500">
                      {new Date(contact.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4">
                      {Object.keys(contact.customFields || {}).filter(k => k !== 'phone').map(k => (
                        <div key={k} className="text-xs mb-1">
                          <span className="font-semibold text-slate-400">{k}:</span> {contact.customFields[k]}
                        </div>
                      ))}
                    </td>`
);

fs.writeFileSync('src/components/CRM/CRMManager.tsx', content);
