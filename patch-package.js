import fs from 'fs';
let content = fs.readFileSync('package.json', 'utf8');

content = content.replace(
  /"start": "node dist\/server.cjs"/,
  '"start": "node keep-alive.js & node dist/server.cjs"'
);

fs.writeFileSync('package.json', content);
