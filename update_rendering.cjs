const fs = require('fs');

function updateFile(file, replacements) {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  for (const { regex, replace } of replacements) {
    if (regex.test(content)) {
      content = content.replace(regex, replace);
      changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
}

updateFile('src/pages/ProductDetails.tsx', [
  {
    regex: /<div className="text-gray-600 leading-relaxed font-medium whitespace-pre-wrap">\s*\{product\.description\}\s*<\/div>/g,
    replace: `<div className="text-gray-600 leading-relaxed font-medium prose prose-sm max-w-none prose-a:text-[#00B4D8] prose-a:no-underline hover:prose-a:underline" dangerouslySetInnerHTML={{ __html: product.description || '' }} />`
  }
]);

updateFile('src/components/ProductCard.tsx', [
  {
    regex: /<p className="text-gray-500 text-sm font-medium line-clamp-2 mt-2 leading-relaxed">\s*\{product\.shortDescription\}\s*<\/p>/g,
    replace: `<div className="text-gray-500 text-sm font-medium line-clamp-2 mt-2 leading-relaxed prose prose-sm prose-p:m-0" dangerouslySetInnerHTML={{ __html: product.shortDescription || '' }} />`
  }
]);

// Wait, let's also fix the SEO description stripping HTML in ProductDetails.tsx
updateFile('src/pages/ProductDetails.tsx', [
  {
    regex: /description=\{product\.description\?\.substring\(0, 160\)/g,
    replace: `description={product.description?.replace(/<[^>]*>?/gm, '').substring(0, 160)`
  }
]);

console.log("Rendering updates done");
