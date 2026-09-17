import fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf8');

// Update /api/contacts
content = content.replace(
  /app\.get\("\/api\/contacts", \(req, res\) => \{\n\s*res\.json\(contactsDB\.getAll\(\)\);\n\}\);/,
  `app.get("/api/contacts", async (req, res) => {
  res.json(await contactsDB.getAll());
});`
);

content = content.replace(
  /app\.post\("\/api\/contacts", \(req, res\) => \{\n\s*const data = req\.body;\n\s*contactsDB\.upsert\(\{/,
  `app.post("/api/contacts", async (req, res) => {
  const data = req.body;
  await contactsDB.upsert({`
);

// Update /api/appointments
content = content.replace(
  /app\.get\("\/api\/appointments", \(req, res\) => \{\n\s*res\.json\(appointmentsDB\.getAll\(\)\);\n\}\);/,
  `app.get("/api/appointments", async (req, res) => {
  res.json(await appointmentsDB.getAll());
});`
);

fs.writeFileSync('server.ts', content);
