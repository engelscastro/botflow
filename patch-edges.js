import fs from 'fs';

let content = fs.readFileSync('src/data/initialData.ts', 'utf8');

content = content.replace(
  "{ id: 'bl-e-7', source: 'bl-col-1', target: 'bl-col-2' },",
  `{ id: 'bl-e-7a', source: 'bl-col-1', target: 'bl-col-2', label: 'Buscar Leite' },
      { id: 'bl-e-7b', source: 'bl-col-1', target: 'bl-col-2', label: 'Receber Vidros' },
      { id: 'bl-e-7c', source: 'bl-col-1', target: 'bl-col-2', label: 'Devolver Vidros' },`
);

fs.writeFileSync('src/data/initialData.ts', content);
