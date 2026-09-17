import fs from 'fs';
let content = fs.readFileSync('src/data/initialData.ts', 'utf8');

const regex2 = /id: 'bl-cad-2',\n\s*type: 'questionNode',\n\s*position: [^,]+,\n\s*data: \{\n\s*label: 'Cadastro - Endereço',\n\s*type: 'question',\n\s*messageText: [^\n]+,/s;

content = content.replace(regex2, match => {
  return match + "\n          variableName: 'endereco',";
});


const regex3 = /id: 'bl-cad-3',\n\s*type: 'questionNode',\n\s*position: [^,]+,\n\s*data: \{\n\s*label: 'Cadastro - Gestacional',\n\s*type: 'question',\n\s*messageText: [^\n]+,/s;

content = content.replace(regex3, match => {
  return match + "\n          variableName: 'parto_maternidade',";
});

fs.writeFileSync('src/data/initialData.ts', content);
