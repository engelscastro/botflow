const fs = require('fs');
let content = fs.readFileSync('src/components/Channels/ChannelsManager.tsx', 'utf-8');

const regex = /{activeTab === 'whatsapp' && \((.*?)\)\}\s*{\/\* Telegram Tab Content \*\//s;
const match = content.match(regex);

if (match) {
  let inner = match[1];
  
  // I know the structure should be:
  // <div className="space-y-6">
  //   selector
  //   {whatsappEngine === 'official' ? ( officialUI ) : ( <>{baileysUI}</> )}
  // </div>
  
  // Let's just fix it by ensuring baileysUI is properly wrapped.
  // Actually, I can just replace the whole inner content.
}

console.log("Found match: " + !!match);
