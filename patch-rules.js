import fs from 'fs';
let rules = fs.readFileSync('firestore.rules', 'utf8');

if (!rules.includes('match /event_quotes/')) {
  rules = rules.replace(
    "    // Quote Requests - EXPLICIT ALLOW CREATE",
    "    // Event Quotes\n    match /event_quotes/{quoteId} {\n      allow read, update, delete: if isAdmin();\n    }\n\n    // Quote Requests - EXPLICIT ALLOW CREATE"
  );
  fs.writeFileSync('firestore.rules', rules);
}
