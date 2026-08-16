const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/CategoryManagement.tsx', 'utf8');

if (!content.includes('RichTextEditor')) {
  content = content.replace("import { motion, AnimatePresence } from 'motion/react';", "import { motion, AnimatePresence } from 'motion/react';\nimport { RichTextEditor } from '../../components/admin/RichTextEditor';");

  content = content.replace(/<textarea[\s\S]*?onChange=\{e => setFormData\(\{ \.\.\.formData, description: e\.target\.value \}\)\}[\s\S]*?className="[\s\S]*?"\s*\/>/, 
    `<RichTextEditor value={formData.description} onChange={(val) => setFormData({...formData, description: val})} placeholder="Provide category details and overview..." />`);

  fs.writeFileSync('src/pages/admin/CategoryManagement.tsx', content);
  console.log('CategoryManagement updated');
}
