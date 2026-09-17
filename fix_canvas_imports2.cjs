const fs = require('fs');
let content = fs.readFileSync('src/components/FlowBuilder/FlowCanvas.tsx', 'utf-8');

content = content.replace("AlertCircle} from 'lucide-react';", "AlertCircle, Database, Calendar } from 'lucide-react';");

fs.writeFileSync('src/components/FlowBuilder/FlowCanvas.tsx', content);
console.log("Imports fixed properly.");
