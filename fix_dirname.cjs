const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf-8');

if (!content.includes('fileURLToPath(import.meta.url)')) {
  const replacement = `import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();`;
  
  content = content.replace("dotenv.config();", replacement);
  fs.writeFileSync('server.ts', content);
  console.log("Fixed __dirname");
}
