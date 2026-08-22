const fs = require('fs');
let content = fs.readFileSync('src/components/FlowBuilder/FlowCanvas.tsx', 'utf-8');

if (!content.includes('Database,') || !content.includes('Calendar,')) {
    content = content.replace("Tag\n} from 'lucide-react';", "Tag,\n  Database,\n  Calendar\n} from 'lucide-react';");
}

fs.writeFileSync('src/components/FlowBuilder/FlowCanvas.tsx', content);
console.log("Imports fixed.");
