import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

// 1. Initialize Firebase Client SDK
let config: any = {};
try {
  config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
} catch (e) {
  console.warn('Could not read firebase-applet-config.json:', e);
}

const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId || undefined);

const BASE_URL = 'https://avlive.com.pk';

async function generateSitemap() {
  console.log('Generating sitemap...');
  try {
    const productsSnapshot = await getDocs(collection(db, 'products'));
    const categoriesSnapshot = await getDocs(collection(db, 'categories'));
    
    const products = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const categories = categoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const urls = [];

    // Add static routes
    const staticRoutes = [
      '/', '/shop', '/solutions', '/services', '/contact', '/about', '/faqs', '/blog'
    ];

    staticRoutes.forEach(route => {
      urls.push(`
  <url>
    <loc>${BASE_URL}${route}</loc>
    <changefreq>weekly</changefreq>
    <priority>${route === '/' ? '1.0' : '0.8'}</priority>
  </url>`);
    });

    // Add product routes
    products.forEach((product: any) => {
      urls.push(`
  <url>
    <loc>${BASE_URL}/product/${product.id}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);
    });

    // Add category routes
    categories.forEach((category: any) => {
      if (category.slug) {
        urls.push(`
  <url>
    <loc>${BASE_URL}/category/${category.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`);
      }
    });

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('')}
</urlset>`;

    // Ensure public folder exists
    const publicDir = path.join(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir);
    }

    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap);
    console.log('sitemap.xml generated successfully at public/sitemap.xml');
    
    // Explicitly exit since Firestore client keeps the connection open
    process.exit(0);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    process.exit(1);
  }
}

generateSitemap();
