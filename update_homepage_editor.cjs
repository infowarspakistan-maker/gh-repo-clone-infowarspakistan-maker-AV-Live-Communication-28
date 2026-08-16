const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/HomepageEditor.tsx', 'utf8');

if (!content.includes('RichTextEditor')) {
  content = content.replace("import { Save, Loader2, LayoutTemplate, Plus, Trash2, GripVertical, CheckCircle, Info, Copy } from 'lucide-react';", "import { Save, Loader2, LayoutTemplate, Plus, Trash2, GripVertical, CheckCircle, Info, Copy } from 'lucide-react';\nimport { RichTextEditor } from '../../components/admin/RichTextEditor';");

  content = content.replace(/<textarea[\s\S]*?onChange=\{e => setFormData\(\{ \.\.\.formData, heroSubheading: e\.target\.value \}\)\}[\s\S]*?className="[\s\S]*?"\s*\/>/, 
    `<RichTextEditor value={formData.heroSubheading} onChange={(val) => setFormData({...formData, heroSubheading: val})} placeholder="Supporting text..." />`);

  fs.writeFileSync('src/pages/admin/HomepageEditor.tsx', content);
  console.log('HomepageEditor updated');
}
