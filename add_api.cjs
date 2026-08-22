const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf-8');

const apiAdditions = `
import { contactsDB, appointmentsDB } from './server/db.js';

app.get("/api/contacts", (req, res) => {
  res.json(contactsDB.getAll());
});

app.get("/api/appointments", (req, res) => {
  res.json(appointmentsDB.getAll());
});
`;

if (!content.includes('/api/contacts')) {
  // Find where API routes start
  const targetStr = 'app.get("/api/health"';
  content = content.replace(targetStr, apiAdditions.trim() + '\n\n' + targetStr);
  fs.writeFileSync('server.ts', content);
  console.log("APIs added.");
}
