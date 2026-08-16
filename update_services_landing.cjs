const fs = require('fs');
let file = 'src/pages/services/ServicesLanding.tsx';
if (fs.existsSync(file)) {
  let content = fs.readFileSync(file, 'utf8');

  // pageData.introText
  content = content.replace(
    /<p className="text-xl text-gray-400 font-medium leading-relaxed max-w-2xl mx-auto">\s*\{pageData\.introText\}\s*<\/p>/g,
    `<div className="text-xl text-gray-400 font-medium leading-relaxed max-w-2xl mx-auto prose prose-p:m-0 prose-p:text-gray-400 prose-invert" dangerouslySetInnerHTML={{ __html: pageData.introText || '' }} />`
  );

  // service.description
  content = content.replace(
    /<p className="text-gray-500 text-sm leading-relaxed mb-8 line-clamp-3 font-medium">\s*\{service\.description\}\s*<\/p>/g,
    `<div className="text-gray-500 text-sm leading-relaxed mb-8 line-clamp-3 font-medium prose prose-sm prose-p:m-0 max-w-none" dangerouslySetInnerHTML={{ __html: service.description || '' }} />`
  );

  fs.writeFileSync(file, content);
  console.log("ServicesLanding updated");
}
