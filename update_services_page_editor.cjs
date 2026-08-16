const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/ServicesEditor.tsx', 'utf8');

if (!content.includes('RichTextEditor')) {
  content = content.replace("import { Save, Loader2, Briefcase, Plus, Trash2, Layout, Image as ImageIcon, CheckCircle, Info, Copy } from 'lucide-react';", "import { Save, Loader2, Briefcase, Plus, Trash2, Layout, Image as ImageIcon, CheckCircle, Info, Copy } from 'lucide-react';\nimport { RichTextEditor } from '../../components/admin/RichTextEditor';");

  content = content.replace(/<textarea[\s\S]*?onChange=\{e => handleChange\('introText', e\.target\.value\)\}[\s\S]*?className="[\s\S]*?"\s*\/>/, 
    `<RichTextEditor value={formData.introText} onChange={(val) => handleChange('introText', val)} placeholder="Main introductory paragraph..." />`);

  fs.writeFileSync('src/pages/admin/ServicesEditor.tsx', content);
  console.log('ServicesEditor updated');
}
