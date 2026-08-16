const fs = require('fs');
let file = 'src/pages/About.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /<p className="text-xl md:text-2xl text-gray-200 font-medium max-w-2xl leading-relaxed">\s*\{data\.heroSubheading\}\s*<\/p>/g,
  `<div className="text-xl md:text-2xl text-gray-200 font-medium max-w-2xl leading-relaxed prose prose-p:m-0 prose-invert" dangerouslySetInnerHTML={{ __html: data.heroSubheading }} />`
);

content = content.replace(
  /<p className="text-gray-500 leading-relaxed text-lg">\s*\{data\.mission\}\s*<\/p>/g,
  `<div className="text-gray-500 leading-relaxed text-lg prose prose-p:m-0 max-w-none" dangerouslySetInnerHTML={{ __html: data.mission }} />`
);

content = content.replace(
  /<p className="text-gray-500 leading-relaxed text-lg">\s*\{data\.vision\}\s*<\/p>/g,
  `<div className="text-gray-500 leading-relaxed text-lg prose prose-p:m-0 max-w-none" dangerouslySetInnerHTML={{ __html: data.vision }} />`
);

content = content.replace(
  /<div className="prose prose-lg text-gray-600">\s*<p>\s*\{data\.history\}\s*<\/p>\s*<\/div>/g,
  `<div className="prose prose-lg text-gray-600" dangerouslySetInnerHTML={{ __html: data.history }} />`
);

fs.writeFileSync(file, content);
console.log('About render updated');
