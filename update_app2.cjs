const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Imports
content = content.replace(
  "import { BroadcastManager } from './components/Broadcast/BroadcastManager';",
  "import { BroadcastManager } from './components/Broadcast/BroadcastManager';\nimport CRMManager from './components/CRM/CRMManager';\nimport ScheduleManager from './components/Schedule/ScheduleManager';"
);

// Menu buttons: the Sidebar is actually a separate component!
// Let's check src/components/Sidebar.tsx
