const fs = require('fs');
const content = fs.readFileSync('server.ts', 'utf8');

const sitemapCode = `
  app.get('/sitemap.xml', async (req, res) => {
    try {
      const baseUrl = 'https://avlive.com.pk';
      let xml = '<?xml version="1.0" encoding="UTF-8"?>\\n';
      xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\\n';

      // Static routes
      const staticRoutes = [
        '',
        '/shop',
        '/solutions',
        '/services',
        '/contact',
        '/about',
        '/blog'
      ];

      for (const route of staticRoutes) {
        xml += '  <url>\\n';
        xml += \`    <loc>\${baseUrl}\${route}</loc>\\n\`;
        xml += '    <changefreq>daily</changefreq>\\n';
        xml += '    <priority>0.8</priority>\\n';
        xml += '  </url>\\n';
      }

      // Dynamic Products
      try {
        const productsSnap = await db.collection('products').get();
        productsSnap.forEach(doc => {
          xml += '  <url>\\n';
          xml += \`    <loc>\${baseUrl}/product/\${doc.id}</loc>\\n\`;
          xml += '    <changefreq>weekly</changefreq>\\n';
          xml += '    <priority>0.9</priority>\\n';
          xml += '  </url>\\n';
        });
      } catch (e) {
        console.error('Error fetching products for sitemap:', e);
      }

      // Dynamic Categories
      try {
        const categoriesSnap = await db.collection('categories').get();
        categoriesSnap.forEach(doc => {
          const data = doc.data();
          xml += '  <url>\\n';
          xml += \`    <loc>\${baseUrl}/category/\${data.slug || doc.id}</loc>\\n\`;
          xml += '    <changefreq>weekly</changefreq>\\n';
          xml += '    <priority>0.8</priority>\\n';
          xml += '  </url>\\n';
        });
      } catch (e) {
        console.error('Error fetching categories for sitemap:', e);
      }

      xml += '</urlset>';

      res.header('Content-Type', 'application/xml');
      res.send(xml);
    } catch (error) {
      console.error('Sitemap generation error:', error);
      res.status(500).send('Error generating sitemap');
    }
  });
`;

const updated = content.replace("app.get('/api/health'", sitemapCode + "\\n  app.get('/api/health'");
fs.writeFileSync('server.ts', updated);
