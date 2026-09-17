import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf8');
const addEndpoint = `app.get("/api/contacts", (req, res) => {
  res.json(contactsDB.getAll());
});

app.post("/api/contacts", (req, res) => {
  const data = req.body;
  contactsDB.upsert({
     id: \`ct-\${Date.now()}\`,
     phone: data.phone || 'simulador',
     name: data.customFields?.nome_data || data.customFields?.nome || data.customFields?.name || data.name || '',
     cpf: data.customFields?.cpf || '',
     email: data.customFields?.email || '',
     customFields: data.customFields || {},
     createdAt: new Date().toISOString()
  });
  res.json({ success: true });
});
`;
content = content.replace(/app\.get\("\/api\/contacts", \(req, res\) => \{\n  res\.json\(contactsDB\.getAll\(\)\);\n\}\);/, addEndpoint);
fs.writeFileSync('server.ts', content);
