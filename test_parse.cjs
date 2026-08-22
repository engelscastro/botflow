const fs = require('fs');
const content = fs.readFileSync('src/components/Channels/ChannelsManager.tsx', 'utf-8');

const ts = require('typescript');
try {
  const sourceFile = ts.createSourceFile(
    'test.tsx',
    content,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );
  console.log("Parsed OK. Checking diagnostics...");
  // just relying on the compiler output above instead
} catch (e) {
  console.log("Error:", e);
}
