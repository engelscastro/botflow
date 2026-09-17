const fs = require('fs');
let content = fs.readFileSync('src/components/FlowBuilder/FlowCanvas.tsx', 'utf-8');

content = content.replace("AlertCircle\n} from 'lucide-react';", "AlertCircle,\n  Database,\n  Calendar\n} from 'lucide-react';");

fs.writeFileSync('src/components/FlowBuilder/FlowCanvas.tsx', content);
console.log("Imports fixed for real.");
