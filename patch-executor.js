import fs from 'fs';
let content = fs.readFileSync('src/utils/flowExecutor.ts', 'utf8');

const dbLogic = `else if (targetNode.type === 'databaseNode') {
      try {
        if (data.dbAction === 'save_contact') {
          await fetch('/api/contacts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phone: contact.phone,
              name: contact.name,
              customFields: updatedVariables
            })
          });
        }
      } catch (e) {
        console.error('Failed to save contact from simulator', e);
      }
    }`;

content = content.replace(/else if \(targetNode\.type === 'databaseNode'\) \{\s*\/\/ just pass through\s*\}/, dbLogic);
fs.writeFileSync('src/utils/flowExecutor.ts', content);
