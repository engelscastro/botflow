import fs from 'fs';
let content = fs.readFileSync('.env', 'utf8');

content = content.replace(
  /SUPABASE_URL=https:\/\/ntmwfddqsbsmiferatys\.supabase\.co/,
  'SUPABASE_URL=https://ntmwfddqsbmsiferatys.supabase.co'
);

fs.writeFileSync('.env', content);
