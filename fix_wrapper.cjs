const fs = require('fs');
let content = fs.readFileSync('src/components/Channels/ChannelsManager.tsx', 'utf-8');

// Replace <> at 312 with <div className="space-y-6 w-full">
content = content.replace("          ) : (\n            <>", "          ) : (\n            <div className=\"space-y-6 w-full\">");

// Replace </> at 505 with </div>
content = content.replace("          </>\n          )}\n        </div>\n      )}\n\n      {/* Telegram Tab Content */}", "          </div>\n          )}\n        </div>\n      )}\n\n      {/* Telegram Tab Content */}");

fs.writeFileSync('src/components/Channels/ChannelsManager.tsx', content);
