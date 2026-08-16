const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const replacements = {
  'py-32': 'py-24',
  'py-24': 'py-16',
  'py-20': 'py-16',
  'mb-24': 'mb-16',
  'mb-20': 'mb-16',
  'mt-24': 'mt-16',
  'mt-20': 'mt-16',
  'gap-24': 'gap-16',
  'gap-20': 'gap-16',
  'p-24': 'p-16',
  'p-20': 'p-16',
  'pt-32': 'pt-24',
  'pt-24': 'pt-16',
  'pt-20': 'pt-16',
  'pb-32': 'pb-24',
  'pb-24': 'pb-16',
  'pb-20': 'pb-16',
};

walkDir('./src', (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    for (const [key, value] of Object.entries(replacements)) {
      const regex = new RegExp(`\\b${key}\\b`, 'g');
      if (regex.test(content)) {
        content = content.replace(regex, value);
        modified = true;
      }
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated padding in ${filePath}`);
    }
  }
});
