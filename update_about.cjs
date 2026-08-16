const fs = require('fs');
let file = 'src/pages/About.tsx';
if (fs.existsSync(file)) {
  let content = fs.readFileSync(file, 'utf8');

  content = content.replace(
    /<p className="text-xl text-gray-500 leading-relaxed font-medium">\s*\{pageData\?\.introText || '.*?'\}\s*<\/p>/g,
    `<div className="text-xl text-gray-500 leading-relaxed font-medium prose prose-p:m-0 max-w-none" dangerouslySetInnerHTML={{ __html: pageData?.introText || 'We are a specialized audio-visual integration company focused on transforming spaces through technology.' }} />`
  );

  content = content.replace(
    /<p className="text-gray-500 leading-relaxed text-lg">\s*\{pageData\?\.missionStatement || '.*?'\}\s*<\/p>/g,
    `<div className="text-gray-500 leading-relaxed text-lg prose prose-p:m-0 max-w-none" dangerouslySetInnerHTML={{ __html: pageData?.missionStatement || 'To empower organizations to communicate, collaborate, and connect effectively through innovative audio-visual solutions.' }} />`
  );

  content = content.replace(
    /<div className="prose prose-lg text-gray-600">\s*<p>\s*\{pageData\?\.companyStory || '.*?'\}\s*<\/p>\s*<\/div>/g,
    `<div className="prose prose-lg text-gray-600" dangerouslySetInnerHTML={{ __html: pageData?.companyStory || 'Founded by industry veterans, AV Live represents the next evolution in communication technology integration...' }} />`
  );

  fs.writeFileSync(file, content);
  console.log("About updated");
}
