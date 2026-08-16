const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/ProductManagement.tsx', 'utf8');

if (!content.includes('RichTextEditor')) {
  // Add import
  content = content.replace("import { motion, AnimatePresence } from 'motion/react';", "import { motion, AnimatePresence } from 'motion/react';\nimport { RichTextEditor } from '../../components/admin/RichTextEditor';");

  // Replace textarea for Short Summary (Preview)
  content = content.replace(/<textarea[\s\S]*?onChange=\{e => setFormData\(\{ \.\.\.formData, shortDescription: e\.target\.value \}\)\}[\s\S]*?className="[\s\S]*?"\s*\/>/, 
    `<RichTextEditor value={formData.shortDescription} onChange={(val) => setFormData({...formData, shortDescription: val})} placeholder="Brief overview for product cards..." />`);

  // Replace textarea for Full Technical Description
  content = content.replace(/<textarea[\s\S]*?onChange=\{e => setFormData\(\{ \.\.\.formData, description: e\.target\.value \}\)\}[\s\S]*?className="[\s\S]*?"\s*\/>/, 
    `<RichTextEditor value={formData.description} onChange={(val) => setFormData({...formData, description: val})} placeholder="Comprehensive product details..." />`);

  fs.writeFileSync('src/pages/admin/ProductManagement.tsx', content);
  console.log('ProductManagement updated');
}
