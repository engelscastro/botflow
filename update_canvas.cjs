const fs = require('fs');
let content = fs.readFileSync('src/components/FlowBuilder/FlowCanvas.tsx', 'utf-8');

// 1. Add to imports
content = content.replace("TagNode\n} from './CustomNodes';", "TagNode,\n  DatabaseNode,\n  ScheduleNode\n} from './CustomNodes';");
content = content.replace("Database, Calendar", "Calendar"); // Lucide-react cleanup if needed, but let's just do:
if(!content.includes("Database")) {
  content = content.replace("BookOpen", "BookOpen,\n  Database,\n  Calendar");
}

// 2. Add to nodeTypes
content = content.replace("tagNode: TagNode,", "tagNode: TagNode,\n  databaseNode: DatabaseNode,\n  scheduleNode: ScheduleNode,");

// 3. Add to node configurations when dragging from Sidebar
// Wait, the Sidebar inside FlowCanvas is a local component or hardcoded array. Let's see.
