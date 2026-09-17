import fs from 'fs';
let content = fs.readFileSync('src/data/initialData.ts', 'utf8');

content = content.replace(/label: 'Cadastro - Nome',\n\s*type: 'question',\n\s*messageText: 'Ficamos felizes com seu interesse! Cada gota salva vidas 💕. Para iniciar seu pré-cadastro, qual é o seu Nome Completo e Data de Nascimento\?',/s, "label: 'Cadastro - Nome',\n          type: 'question',\n          messageText: 'Ficamos felizes com seu interesse! Cada gota salva vidas 💕. Para iniciar seu pré-cadastro, qual é o seu Nome Completo e Data de Nascimento?',\n          variableName: 'nome_data',");
content = content.replace(/label: 'Cadastro - Endereço',\n\s*type: 'question',\n\s*messageText: 'Perfeito! Agora digite seu Endereço Completo \(Rua, Número, Bairro e Ponto de Referência\):',/s, "label: 'Cadastro - Endereço',\n          type: 'question',\n          messageText: 'Perfeito! Agora digite seu Endereço Completo (Rua, Número, Bairro e Ponto de Referência):',\n          variableName: 'endereco',");
content = content.replace(/label: 'Cadastro - Gestacional',\n\s*type: 'question',\n\s*messageText: 'Qual foi a Data do seu Parto, e o Local \(nome da Maternidade onde o bebê nasceu\)\?',/s, "label: 'Cadastro - Gestacional',\n          type: 'question',\n          messageText: 'Qual foi a Data do seu Parto, e o Local (nome da Maternidade onde o bebê nasceu)?',\n          variableName: 'parto_maternidade',");

fs.writeFileSync('src/data/initialData.ts', content);
