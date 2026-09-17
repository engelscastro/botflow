import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(
  /const PORT = 3000;/g,
  `const PORT = parseInt(process.env.PORT || "3000", 10);`
);

fs.writeFileSync('server.ts', content);
