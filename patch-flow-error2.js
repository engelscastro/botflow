import fs from 'fs';
let content = fs.readFileSync('src/utils/flowExecutor.ts', 'utf8');

content = content.replace(
  /phone: session\.variables\['phone'\] \|\| contact\.phone \|\| '',\n\s*name: session\.variables\['nome_data'\] \|\| session\.variables\['nome'\] \|\| contact\.name \|\| '',/g,
  `phone: updatedVariables['phone'] || contact.phone || '',\n              name: updatedVariables['nome_data'] || updatedVariables['nome'] || contact.name || '',`
);

fs.writeFileSync('src/utils/flowExecutor.ts', content);
