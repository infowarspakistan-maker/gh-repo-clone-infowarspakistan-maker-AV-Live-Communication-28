const fs = require('fs');
let file = 'src/pages/admin/AboutEditor.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('RichTextEditor')) {
  content = content.replace("import { Save, Loader2, Users, Plus, Trash2, Layout, Image as ImageIcon, CheckCircle, Info } from 'lucide-react';", "import { Save, Loader2, Users, Plus, Trash2, Layout, Image as ImageIcon, CheckCircle, Info } from 'lucide-react';\nimport { RichTextEditor } from '../../components/admin/RichTextEditor';");
}

content = content.replace(
  /<textarea\s*rows=\{3\}\s*value=\{formData\.heroSubheading\}\s*onChange=\{e => handleChange\('heroSubheading', e\.target\.value\)\}[\s\S]*?\/>/g,
  `<RichTextEditor value={formData.heroSubheading} onChange={(val) => handleChange('heroSubheading', val)} />`
);

content = content.replace(
  /<textarea\s*rows=\{4\}\s*value=\{formData\.mission\}\s*onChange=\{e => handleChange\('mission', e\.target\.value\)\}[\s\S]*?\/>/g,
  `<RichTextEditor value={formData.mission} onChange={(val) => handleChange('mission', val)} />`
);

content = content.replace(
  /<textarea\s*rows=\{4\}\s*value=\{formData\.vision\}\s*onChange=\{e => handleChange\('vision', e\.target\.value\)\}[\s\S]*?\/>/g,
  `<RichTextEditor value={formData.vision} onChange={(val) => handleChange('vision', val)} />`
);

content = content.replace(
  /<textarea\s*rows=\{6\}\s*value=\{formData\.history\}\s*onChange=\{e => handleChange\('history', e\.target\.value\)\}[\s\S]*?\/>/g,
  `<RichTextEditor value={formData.history} onChange={(val) => handleChange('history', val)} />`
);

fs.writeFileSync(file, content);
console.log('AboutEditor updated properly');
