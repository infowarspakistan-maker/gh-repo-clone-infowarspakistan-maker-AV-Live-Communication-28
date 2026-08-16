import fs from 'fs';
const content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

const structuredData = `      <StructuredData 
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "AV Live Communications",
          "url": "https://avlive.com.pk",
          "logo": "https://avlive.com.pk/logo.png",
          "description": "Pakistan's leading provider of professional AV solutions, IP phones, and video conferencing.",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Lahore",
            "addressCountry": "PK"
          }
        }}
      />`;

const updated = content.replace(/<SEO([^>]*)(\/>|<\/SEO>)/, `<SEO$1$2\n${structuredData}`);
fs.writeFileSync('src/pages/Home.tsx', updated);
