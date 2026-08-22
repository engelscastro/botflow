const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf-8');

// Change `const isDev = process.env.NODE_ENV === "development";` to `const isDev = process.env.NODE_ENV !== "production";`
content = content.replace(
  'const isDev = process.env.NODE_ENV === "development";',
  'const isDev = process.env.NODE_ENV !== "production";'
);

fs.writeFileSync('server.ts', content);
console.log("Fixed isDev");
