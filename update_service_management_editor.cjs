const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/ServiceManagement.tsx', 'utf8');

if (!content.includes('RichTextEditor')) {
  content = content.replace("import { Plus, Trash2, Edit3, Loader2, X, Image as ImageIcon, Copy, Check } from 'lucide-react';", "import { Plus, Trash2, Edit3, Loader2, X, Image as ImageIcon, Copy, Check } from 'lucide-react';\nimport { RichTextEditor } from '../../components/admin/RichTextEditor';");

  content = content.replace(/<textarea[\s\S]*?onChange=\{e => setFormData\(\{ \.\.\.formData, description: e\.target\.value \}\)\}[\s\S]*?className="[\s\S]*?"\s*\/>/, 
    `<RichTextEditor value={formData.description} onChange={(val) => setFormData({...formData, description: val})} placeholder="Brief overview of the service..." />`);

  content = content.replace(/<textarea[\s\S]*?onChange=\{e => setFormData\(\{ \.\.\.formData, detailedContent: e\.target\.value \}\)\}[\s\S]*?className="[\s\S]*?"\s*\/>/, 
    `<RichTextEditor value={formData.detailedContent} onChange={(val) => setFormData({...formData, detailedContent: val})} placeholder="Comprehensive details about the service..." />`);

  fs.writeFileSync('src/pages/admin/ServiceManagement.tsx', content);
  console.log('ServiceManagement updated');
}
