import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

if (content.includes("setUserRole(null);")) {
  content = content.replace(
    /setUserRole\(null\);\n\s*localStorage.removeItem\('botflow_role'\);/g,
    `setUserRole(null);
          localStorage.removeItem('botflow_role');
          import('@supabase/supabase-js').then(({ createClient }) => {
            const url = import.meta.env.VITE_SUPABASE_URL;
            const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
            if(url && key) {
              const supabase = createClient(url, key);
              supabase.auth.signOut();
            }
          });`
  );
  fs.writeFileSync('src/App.tsx', content);
}
