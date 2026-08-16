import fs from 'fs';
let rules = fs.readFileSync('firestore.rules', 'utf8');

if (!rules.includes('match /wizard_leads/')) {
  rules = rules.replace(
    "    // Event Quotes",
    "    // Wizard Leads\n    match /wizard_leads/{leadId} {\n      allow create: if true;\n      allow read, update, delete: if isAdmin();\n    }\n\n    // Event Quotes"
  );
  fs.writeFileSync('firestore.rules', rules);
}
