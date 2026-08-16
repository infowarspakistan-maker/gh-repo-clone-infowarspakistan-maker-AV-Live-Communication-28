const fs = require('fs');
let file = 'src/pages/admin/ServicesEditor.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /<textarea\s*rows=\{3\}\s*value=\{formData\.heroSubheading\}\s*onChange=\{e => handleChange\('heroSubheading', e\.target\.value\)\}[\s\S]*?\/>/g,
  `<RichTextEditor value={formData.heroSubheading} onChange={(val) => handleChange('heroSubheading', val)} />`
);

fs.writeFileSync(file, content);
console.log('ServicesEditor updated properly');
