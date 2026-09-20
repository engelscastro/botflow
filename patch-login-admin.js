import fs from 'fs';
let content = fs.readFileSync('src/components/Login/LoginScreen.tsx', 'utf8');

// Adiciona hardcode fallback para admin e enterprise
content = content.replace(
  /const getUserRole = \(user: any\): 'admin' \| 'enterprise' \| 'community' => \{\n\s*return user\?\.user_metadata\?\.role \|\| 'community';\n\s*\};/,
  `const getUserRole = (user: any): 'admin' | 'enterprise' | 'community' => {
    // Garante que seu e-mail sempre será admin mesmo que o Supabase perca a role
    if (user?.email === 'admin@maternidade.com' || user?.email === 'engelsbarros@gmail.com') return 'admin';
    return user?.user_metadata?.role || 'community';
  };`
);

fs.writeFileSync('src/components/Login/LoginScreen.tsx', content);
