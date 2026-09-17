import fs from 'fs';

let content = fs.readFileSync('src/data/initialData.ts', 'utf8');

// Replace positions of db and final message
content = content.replace(
  /id: 'bl-cad-db',\n\s*type: 'databaseNode',\n\s*position: \{ x: 3100, y: 150 \}/,
  "id: 'bl-cad-db',\n        type: 'databaseNode',\n        position: { x: 3400, y: 150 }"
);
content = content.replace(
  /id: 'bl-cad-4',\n\s*type: 'messageNode',\n\s*position: \{ x: 3400, y: 150 \}/,
  "id: 'bl-cad-4',\n        type: 'messageNode',\n        position: { x: 3700, y: 150 }"
);

// Insert confirm node
const confirmNode = `{
        id: 'bl-cad-confirm',
        type: 'messageNode',
        position: { x: 3100, y: 150 },
        data: {
          label: 'Cadastro - Confirmação',
          type: 'message',
          messageText: 'Aqui estão os seus dados:\\n\\n*Nome:* {{nome}}\\n*Nascimento:* {{data_nascimento}}\\n*Rua:* {{rua}}, {{numero}}\\n*Bairro:* {{bairro}}\\n*Referência:* {{ponto_referencia}}\\n*Data do Parto:* {{data_parto}}\\n*Maternidade:* {{maternidade}}\\n\\nPodemos confirmar o seu pré-cadastro?',
          quickReplies: ['1. Confirmar', '2. Refazer Cadastro'],
        }
      },
      {
        id: 'bl-cad-db',`;

content = content.replace(/\{\s*id: 'bl-cad-db',/s, confirmNode);

// Update edges
content = content.replace(
  /\{ id: 'bl-e-db1', source: 'bl-cad-3b', target: 'bl-cad-db' \},/,
  `{ id: 'bl-e-conf', source: 'bl-cad-3b', target: 'bl-cad-confirm' },
      { id: 'bl-e-db1', source: 'bl-cad-confirm', target: 'bl-cad-db', label: '1. Confirmar' },
      { id: 'bl-e-redo', source: 'bl-cad-confirm', target: 'bl-cad-1', label: '2. Refazer Cadastro' },`
);

fs.writeFileSync('src/data/initialData.ts', content);

