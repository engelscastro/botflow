import fs from 'fs';
let content = fs.readFileSync('src/utils/flowExecutor.ts', 'utf8');

content = content.replace(
  /phone: contact\.phone,\n\s*name: contact\.name,/g,
  `phone: session.variables['phone'] || contact.phone || '',\n              name: session.variables['nome_data'] || session.variables['nome'] || contact.name || '',`
);

fs.writeFileSync('src/utils/flowExecutor.ts', content);
