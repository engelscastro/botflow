import fs from 'fs';
let content = fs.readFileSync('src/components/Login/LoginScreen.tsx', 'utf8');

// Ajusta o listener de AuthStateChange para não relogar automaticamente no 'SIGNED_OUT'
content = content.replace(
  /const \{ data: \{ subscription \} \} = supabase\.auth\.onAuthStateChange\(\(_event, session\) => \{\n\s*if \(session\) \{/g,
  `const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (session && event !== 'SIGNED_OUT') {`
);

fs.writeFileSync('src/components/Login/LoginScreen.tsx', content);
