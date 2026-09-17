import fs from 'fs';
let content = fs.readFileSync('src/data/initialData.ts', 'utf8');

const regex1 = /id: 'bl-cad-1',\n\s*type: 'questionNode',\n\s*position: [^,]+,\n\s*data: \{\n\s*label: 'Cadastro - Nome',\n\s*type: 'question',\n\s*messageText: [^\n]+,/s;
content = content.replace(regex1, match => match + "\n          variableName: 'nome_data',");

const regex2 = /id: 'bl-cad-2',\n\s*type: 'questionNode',\n\s*position: [^,]+,\n\s*data: \{\n\s*label: 'Cadastro - Endereço',\n\s*type: 'question',\n\s*messageText: [^\n]+,/s;
content = content.replace(regex2, match => match + "\n          variableName: 'endereco',");

const regex3 = /id: 'bl-cad-3',\n\s*type: 'questionNode',\n\s*position: [^,]+,\n\s*data: \{\n\s*label: 'Cadastro - Gestacional',\n\s*type: 'question',\n\s*messageText: [^\n]+,/s;
content = content.replace(regex3, match => match + "\n          variableName: 'parto_maternidade',");

fs.writeFileSync('src/data/initialData.ts', content);
