const fs = require('fs');
let file = 'src/pages/ProductDetails.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /<p className="text-xl text-gray-500 font-medium leading-relaxed max-w-2xl">\s*\{product\.shortDescription\}\s*<\/p>/g,
  `<div className="text-xl text-gray-500 font-medium leading-relaxed max-w-2xl prose prose-p:m-0" dangerouslySetInnerHTML={{ __html: product.shortDescription || '' }} />`
);

content = content.replace(
  /<div className="text-gray-600 leading-relaxed font-medium whitespace-pre-wrap">\s*\{product\.description\}\s*<\/div>/g,
  `<div className="text-gray-600 leading-relaxed font-medium prose prose-sm max-w-none prose-a:text-[#00B4D8] prose-a:no-underline hover:prose-a:underline" dangerouslySetInnerHTML={{ __html: product.description || '' }} />`
);

fs.writeFileSync(file, content);

let file2 = 'src/pages/Category.tsx';
if (fs.existsSync(file2)) {
  let content2 = fs.readFileSync(file2, 'utf8');
  content2 = content2.replace(
    /<p className="text-gray-500 font-medium leading-relaxed">\s*\{category\.description\}\s*<\/p>/g,
    `<div className="text-gray-500 font-medium leading-relaxed prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: category.description || '' }} />`
  );
  content2 = content2.replace(
    /description=\{category\.description\?\.substring\(0, 160\)/g,
    `description={category.description?.replace(/<[^>]*>?/gm, '').substring(0, 160)`
  );
  fs.writeFileSync(file2, content2);
}

console.log("Rendering updates 2 done");
