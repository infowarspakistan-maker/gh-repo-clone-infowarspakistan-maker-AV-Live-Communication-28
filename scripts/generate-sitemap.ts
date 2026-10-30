import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import { buildDynamicSitemapXml, buildLlmsFullTxt } from '../src/lib/sitemap-generator';

let config: any = {};
try {
  config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
} catch (e) {
  console.warn('Could not read firebase-applet-config.json:', e);
}

async function generateSitemap() {
  console.log('Generating canonical sitemap.xml and llms-full.txt...');

  const products: Array<Record<string, any>> = [];
  const categories: Array<Record<string, any>> = [];
  const services: Array<Record<string, any>> = [];
  const blogPosts: Array<Record<string, any>> = [];

  if (config.projectId) {
    try {
      const app = initializeApp(config);
      const db = getFirestore(app, config.firestoreDatabaseId || undefined);

      const [productsRes, categoriesRes, servicesRes, blogsRes] = await Promise.allSettled([
        getDocs(collection(db, 'products')),
        getDocs(collection(db, 'categories')),
        getDocs(collection(db, 'services')),
        getDocs(collection(db, 'blog_posts'))
      ]);

      if (productsRes.status === 'fulfilled') {
        productsRes.value.docs.forEach(doc => products.push({ id: doc.id, ...doc.data() }));
      }
      if (categoriesRes.status === 'fulfilled') {
        categoriesRes.value.docs.forEach(doc => categories.push({ id: doc.id, ...doc.data() }));
      }
      if (servicesRes.status === 'fulfilled') {
        servicesRes.value.docs.forEach(doc => services.push({ id: doc.id, ...doc.data() }));
      }
      if (blogsRes.status === 'fulfilled') {
        blogsRes.value.docs.forEach(doc => blogPosts.push({ id: doc.id, ...doc.data() }));
      }
    } catch (dbErr) {
      console.warn('Firestore fetch fallback during sitemap build:', dbErr);
    }
  }

  try {
    const { xml, counts } = buildDynamicSitemapXml({
      products,
      categories,
      services,
      blogPosts
    });
    const llmsFull = buildLlmsFullTxt();

    const publicDir = path.join(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), xml, 'utf8');
    fs.writeFileSync(path.join(publicDir, 'llms-full.txt'), llmsFull, 'utf8');
    console.log(
      `sitemap.xml generated successfully with ${counts.total} canonical URLs ` +
        `(static: ${counts.staticPages}, products: ${counts.products}, categories: ${counts.categories}, services: ${counts.services}, blogs: ${counts.blogs}) at public/sitemap.xml + public/llms-full.txt`
    );
    process.exit(0);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    process.exit(1);
  }
}

generateSitemap();


