import fs from 'fs';
let content = fs.readFileSync('src/data/initialData.ts', 'utf8');
content = content.replace(/          variableName: 'nome_data',\n/g, "");
content = content.replace(/          variableName: 'endereco',\n/g, "");
content = content.replace(/          variableName: 'parto_maternidade',\n/g, "");
fs.writeFileSync('src/data/initialData.ts', content);
