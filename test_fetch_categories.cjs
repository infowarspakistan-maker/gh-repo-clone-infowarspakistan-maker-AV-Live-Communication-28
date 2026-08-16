const fs = require('fs');
const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));

const projectId = config.projectId;
const databaseId = config.firestoreDatabaseId || '(default)';
const apiKey = config.apiKey;
const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents/categories?key=${apiKey}`;

fetch(url)
  .then(res => res.json())
  .then(data => {
    console.log(data);
  })
  .catch(console.error);
