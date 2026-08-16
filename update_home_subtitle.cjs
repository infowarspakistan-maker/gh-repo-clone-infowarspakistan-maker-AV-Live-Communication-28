const fs = require('fs');
let file = 'src/pages/Home.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `<p className="text-xl md:text-2xl text-gray-200 mb-10 max-w-2xl drop-shadow-md font-medium leading-relaxed">{slide.subtitle}</p>`;
const replacement = `<div className="text-xl md:text-2xl text-gray-200 mb-10 max-w-2xl drop-shadow-md font-medium leading-relaxed prose prose-p:m-0 prose-invert" dangerouslySetInnerHTML={{ __html: slide.subtitle }} />`;

content = content.replace(target, replacement);
fs.writeFileSync(file, content);
console.log('Home subtitle updated');
