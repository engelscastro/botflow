const fs = require('fs');
let content = fs.readFileSync('src/components/Channels/ChannelsManager.tsx', 'utf-8');

// The error TS17015 says: Expected corresponding closing tag for JSX fragment.
// So there is an opening `<>` without a closing `</>`.
// Let's find `<>` in the file.
const lines = content.split('\n');
lines.forEach((line, i) => {
  if (line.includes('<>')) console.log("Found <> at line: " + (i + 1) + ": " + line);
  if (line.includes('</>')) console.log("Found </> at line: " + (i + 1) + ": " + line);
});

