const fs = require('fs');
let content = fs.readFileSync('src/components/Sidebar.tsx', 'utf-8');

// Imports
content = content.replace("Send\n} from 'lucide-react';", "Send,\n  Users,\n  Calendar\n} from 'lucide-react';");

const itemsStr = "    { id: 'analytics', label: 'Relatórios & Engajamento', icon: TrendingUp },";
const newItems = `    { id: 'crm', label: 'CRM & Contatos', icon: Users, badge: 'Auto' },
    { id: 'schedule', label: 'Agenda & Reservas', icon: Calendar, badge: 'Auto' },
    { id: 'analytics', label: 'Relatórios & Engajamento', icon: TrendingUp },`;

content = content.replace(itemsStr, newItems);

fs.writeFileSync('src/components/Sidebar.tsx', content);
console.log("Sidebar updated.");
