import fs from 'fs';

let content = fs.readFileSync('server/flowEngine.ts', 'utf8');

content = content.replace(
  /if \(action === 'save_contact'\) \{\n\s*contactsDB\.upsert\(\{/g,
  `if (action === 'save_contact') {\n          await contactsDB.upsert({`
);

content = content.replace(
  /\} else if \(action === 'query_contact'\) \{\n\s*const contact = contactsDB\.find\(c => c\.phone === session\.variables\['phone'\]\);/g,
  `} else if (action === 'query_contact') {\n          const contact = await contactsDB.find(c => c.phone === session.variables['phone']);`
);

fs.writeFileSync('server/flowEngine.ts', content);
