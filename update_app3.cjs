const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const targetStr = "<BroadcastManager isDark={isDark} />\n          </div>\n        )}";
const newContent = `<BroadcastManager isDark={isDark} />
          </div>
        )}
        
        {activeSection === 'crm' && (
          <div className="flex-1 overflow-hidden h-full">
            <CRMManager isDark={isDark} />
          </div>
        )}

        {activeSection === 'schedule' && (
          <div className="flex-1 overflow-hidden h-full">
            <ScheduleManager isDark={isDark} />
          </div>
        )}`;

content = content.replace(targetStr, newContent);
fs.writeFileSync('src/App.tsx', content);
console.log("App tabs added.");
