const fs = require('fs');
let file = 'src/pages/Home.tsx';
if (fs.existsSync(file)) {
  let content = fs.readFileSync(file, 'utf8');

  content = content.replace(
    /<p className="text-xl md:text-2xl text-gray-300 font-medium mb-10 max-w-2xl leading-relaxed">\s*\{pageData\?\.heroSubheading || '.*?'\}\s*<\/p>/g,
    `<div className="text-xl md:text-2xl text-gray-300 font-medium mb-10 max-w-2xl leading-relaxed prose prose-p:m-0 prose-invert" dangerouslySetInnerHTML={{ __html: pageData?.heroSubheading || 'Premium audio-visual technology and unified communications hardware for modern workspaces. Expert provisioning and deployment.' }} />`
  );

  fs.writeFileSync(file, content);
  console.log("Home updated");
}
