import fs from 'fs';
let content = fs.readFileSync('.env', 'utf8');

// Adiciona as variáveis com prefixo VITE_ para que o React (Frontend) consiga ler
if (!content.includes('VITE_SUPABASE_URL')) {
  const urlMatch = content.match(/SUPABASE_URL=(.*)/);
  const anonMatch = content.match(/SUPABASE_ANON_KEY=(.*)/);
  
  if (urlMatch && anonMatch) {
    content += `\nVITE_SUPABASE_URL=${urlMatch[1]}\n`;
    content += `VITE_SUPABASE_ANON_KEY=${anonMatch[1]}\n`;
    fs.writeFileSync('.env', content);
  }
}
