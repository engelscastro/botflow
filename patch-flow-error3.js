import fs from 'fs';
let content = fs.readFileSync('src/utils/flowExecutor.ts', 'utf8');

content = content.replace(
  /phone: updatedVariables\['phone'\] \|\| contact\.phone \|\| '',\n\s*name: updatedVariables\['nome_data'\] \|\| updatedVariables\['nome'\] \|\| contact\.name \|\| '',/g,
  `phone: updatedVariables['phone'] || contact.phoneOrHandle || '',\n              name: updatedVariables['nome_data'] || updatedVariables['nome'] || contact.name || '',`
);

fs.writeFileSync('src/utils/flowExecutor.ts', content);
