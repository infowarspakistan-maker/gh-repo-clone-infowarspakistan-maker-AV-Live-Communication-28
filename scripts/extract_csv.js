import fs from 'fs';
import path from 'path';

const logDir = '/.aistudio/artifacts/brain/f9bf3ada-84c8-482d-93bb-e35d5845634f/.system_generated/logs';
const files = fs.readdirSync(logDir);
const transcriptFile = path.join(logDir, 'transcript.jsonl');

if (fs.existsSync(transcriptFile)) {
  const content = fs.readFileSync(transcriptFile, 'utf8');
  const lines = content.split('\n');
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i];
    if (!line) continue;
    try {
      const data = JSON.parse(line);
      // Look for the user message with CSV
      if (data.text && data.text.includes('id,lowStockThreshold') && data.text.includes('BENQ-TK705I')) {
        console.log('--- FOUND CSV IN LOGS ---');
        console.log(data.text);
        console.log('--- END OF CSV ---');
        break;
      }
    } catch (e) {
      // ignore
    }
  }
} else {
  console.log('Transcript file not found');
}
