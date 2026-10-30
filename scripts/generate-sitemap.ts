import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import { getCanonicalProductSlug, PRODUCT_GMC_METADATA } from '../src/lib/gmc-feed';

let config: any = {};
try {
  config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
} catch (e) {
  console.warn('Could not read firebase-applet-config.json:', e);
}

const BASE_URL = 'https://avlive.com.pk';

async function generateSitemap() {
  console.log('Generating canonical sitemap.xml...');
  const today = new Date().toISOString().split('T')[0];
  const seenUrls = new Set<string>();
  const urls: string[] = [];

  const appendUrl = (locPath: string, priority: string) => {
    const normalizedPath = locPath === '/' ? '' : locPath;
    const fullLoc = `${BASE_URL}${normalizedPath}`;
    if (seenUrls.has(fullLoc)) return;
    seenUrls.add(fullLoc);
    urls.push(`  <url>
    <loc>${fullLoc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`);
  };

  try {
    const staticRoutes = [
      '',
      '/shop',
      '/brands',
      '/solutions',
      '/services',
      '/events-services',
      '/event-quote',
      '/esports',
      '/room-designer',
      '/contact',
      '/about',
      '/faqs',
      '/blog',
      '/compare',
      '/guides',
      '/reviews',
      '/returns',
      '/shipping',
      '/payment',
      '/rma',
      '/privacy-policy',
      '/terms-of-service',
      '/programs/quote',
      '/programs/blind-drop-shipping',
      '/programs/government-education-pricing',
      '/programs/fulfillment-services',
      '/programs/promotions',
      '/programs/provisioning-services',
      '/programs/reseller-program',
      '/voip-service-providers',
      '/3d-hologram',
      '/projection-mapping',
      '/video-conferencing',
      '/conference-room-solutions',
      '/zoom-rooms',
      '/microsoft-teams-rooms',
      '/lahore',
      '/karachi',
      '/islamabad',
      '/services/corporate-events',
      '/services/hybrid-events',
      '/services/expo-organizing',
      '/services/esports-events',
      '/services/ai-development',
      '/services/ai-agents-workers',
      '/services/ai-automation',
      '/services/boardroom-integration',
      '/services/voip-telephony',
      '/brands/poly',
      '/brands/cisco',
      '/brands/logitech',
      '/brands/yealink',
      '/brands/jabra',
      '/brands/bosch',
      '/brands/hikvision',
      '/brands/dahua',
      '/brands/axis',
      '/brands/grandstream',
      '/brands/fanvil',
      '/brands/2n',
      '/brands/epson',
      '/brands/benq',
      '/brands/optoma',
      '/brands/panasonic',
      '/brands/sony',
      '/brands/viewsonic',
      '/brands/uniview',
      '/brands/itc',
      '/brands/3cx',
      '/brands/freepbx',
      '/brands/sangoma'
    ];

    for (const route of staticRoutes) {
      appendUrl(
        route,
        route === ''
          ? '1.0'
          : route.startsWith('/brands/') || route.startsWith('/programs/')
          ? '0.7'
          : '0.9'
      );
    }

    const canonicalCategorySlugs = [
      'video-conferencing',
      'touch-panels',
      'large-room',
      'speakerphones',
      'boardroom-codecs',
      'ptz-cameras',
      'ip-phones',
      'headsets',
      'ip-cameras',
      'intercom-paging-access',
      'voip-phone-systems',
      'projectors'
    ];
    for (const slug of canonicalCategorySlugs) {
      appendUrl(`/category/${slug}`, '0.8');
    }

    const excludedCategorySlugs = new Set([
      'about', 'compare', 'faqs', 'guides', 'payment', 'returns', 'reviews', 'rma',
      'shipping', 'blog', 'contact', 'privacy-policy', 'terms-of-service',
      'blind-drop-shipping', 'fulfillment-services', 'government-education-pricing',
      'promotions', 'provisioning-services', 'quote', 'reseller-program',
      'ai-agents-workers', 'ai-automation', 'ai-development', 'corporate-events',
      'esports-events', 'expo-organizing', 'hybrid-events', 'voip-service-providers'
    ]);

    let addedProductCount = 0;
    if (config.projectId) {
      try {
        const app = initializeApp(config);
        const db = getFirestore(app, config.firestoreDatabaseId || undefined);
        const productsSnapshot = await getDocs(collection(db, 'products'));
        const categoriesSnapshot = await getDocs(collection(db, 'categories'));

        productsSnapshot.docs.forEach(doc => {
          const data: any = doc.data();
          if (data.isActive === false) return;
          const slug = getCanonicalProductSlug(data, doc.id);
          appendUrl(
            `/product/${slug}`,
            slug === 'polycom-realpresence-group-500-pakistan' ? '0.9' : '0.8'
          );
          addedProductCount++;
        });

        categoriesSnapshot.docs.forEach(doc => {
          const data: any = doc.data();
          if (data.isActive === false) return;
          const slug = data.slug || doc.id;
          if ((data.type && data.type !== 'product') || excludedCategorySlugs.has(slug)) {
            return;
          }
          appendUrl(`/category/${slug}`, '0.8');
        });
      } catch (dbErr) {
        console.warn('Firestore fetch fallback during sitemap build:', dbErr);
      }
    }

    // Always ensure all canonical GMC catalog products (including Navbar-linked items like freepbx-enterprise-pakistan) are present
    for (const rawKey of Object.keys(PRODUCT_GMC_METADATA)) {
      const canonicalSlug = getCanonicalProductSlug({ slug: rawKey }, rawKey);
      appendUrl(
        `/product/${canonicalSlug}`,
        canonicalSlug === 'polycom-realpresence-group-500-pakistan' ? '0.9' : '0.8'
      );
    }

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

    const publicDir = path.join(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir);
    }

    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap);
    console.log(`sitemap.xml generated successfully with ${urls.length} canonical URLs at public/sitemap.xml`);
    process.exit(0);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    process.exit(1);
  }
}

generateSitemap();

