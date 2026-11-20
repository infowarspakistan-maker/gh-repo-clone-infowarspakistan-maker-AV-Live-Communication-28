import * as fs from 'fs';
import * as path from 'path';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import {
  PRODUCT_GMC_METADATA,
  getCanonicalProductSlug,
  buildFallbackProductFromGmcMeta,
  generateGmcTsv,
  formatProductToGmcRow,
} from '../src/lib/gmc-feed';
import { enrichProductImages, Product } from '../src/lib/firebase/firestore-helpers';
import { extractDirectImageUrls } from '../src/lib/image-optimize';

async function main() {
  const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  const app = initializeApp(config);
  const db = getFirestore(app, config.firestoreDatabaseId);

  let firestoreProducts: Product[] = [];
  let updatedInFirestore = 0;

  try {
    const snap = await getDocs(collection(db, 'products'));
    for (const d of snap.docs) {
      const raw = { id: d.id, ...d.data() } as Product;
      const slug = getCanonicalProductSlug(raw, raw.id);
      const meta = PRODUCT_GMC_METADATA[slug] || PRODUCT_GMC_METADATA[raw.id];

      // Extract clean direct external URLs from raw document (strips any /images/products/ paths, splits concatenated URLs, converts Google Drive /view links, and filters YouTube/Vimeo links)
      const directFromDoc = extractDirectImageUrls([raw.images, raw.image, (raw as any).imageUrl]).filter(
        (u) => !/unsplash\.com/i.test(u)
      );
      const directFromMeta = extractDirectImageUrls(meta?.images);

      // If raw document only had local /images/products/ paths, Unsplash placeholders, or had none, use direct external URLs from PRODUCT_GMC_METADATA
      const finalImages = directFromDoc.length > 0 ? directFromDoc : directFromMeta;
      const primaryImage = finalImages[0] || '';

      const rawImagesArr = Array.isArray(raw.images) ? raw.images : [];
      const isPodiumPrompter = d.id === 'kl5wGaNLxqQByn3oPd1Z' || slug === 'podium-prompter-17-compact-pakistan';
      const needsFirestoreUpdate =
        isPodiumPrompter ||
        raw.image !== primaryImage ||
        JSON.stringify(rawImagesArr) !== JSON.stringify(finalImages);

      if (finalImages.length > 0 && needsFirestoreUpdate) {
        try {
          const patch: Record<string, any> = {
            images: finalImages,
            image: primaryImage,
            imageUrl: primaryImage,
          };
          if (isPodiumPrompter && meta) {
            patch.slug = slug;
            patch.sku = meta.mpn;
            patch.mpn = meta.mpn;
            patch.gtin = meta.gtin;
            patch.brandName = meta.brand;
            patch.categorySlugs = meta.categorySlugs;
            patch.regularPrice = meta.regularPrice;
            patch.salePrice = meta.salePrice;
            patch.shortDescription = (meta.defaultDescription || meta.highlight).slice(0, 195);
            patch.description = `<p>${meta.defaultDescription || meta.highlight}</p>`;
            patch.specifications = meta.defaultSpecs || '';
            patch.videoUrl = 'https://youtu.be/aZLEIxOzm24';
          }
          await updateDoc(doc(db, 'products', d.id), patch);
          updatedInFirestore++;
        } catch {
          // Read-only or security rule gated; enriched client/server layer + TSV feed handles it
        }
      }

      const enriched = enrichProductImages({
        ...raw,
        images: finalImages,
        image: primaryImage,
      });
      firestoreProducts.push(enriched);
    }
  } catch (err: any) {
    console.log(`[INFO] Firestore read fallback active (${err?.code || 'quota/offline'})`);
  }

  // Merge with all canonical PRODUCT_GMC_METADATA products so all 53 SKUs are present
  const bySlug = new Map<string, Record<string, any>>();
  for (const p of firestoreProducts) {
    const slug = getCanonicalProductSlug(p, p.id);
    bySlug.set(slug, p);
  }
  for (const slugKey of Object.keys(PRODUCT_GMC_METADATA)) {
    const canonical = getCanonicalProductSlug({ slug: slugKey }, slugKey);
    if (!bySlug.has(canonical)) {
      const fb = buildFallbackProductFromGmcMeta(canonical);
      if (fb) bySlug.set(canonical, fb);
    } else {
      const existing = bySlug.get(canonical)!;
      bySlug.set(canonical, enrichProductImages(existing as Product));
    }
  }

  const allProducts = Array.from(bySlug.values());
  const tsv40 = generateGmcTsv(allProducts);
  const tsvPath = path.resolve(process.cwd(), 'public/google_merchant_feed.tsv');
  fs.writeFileSync(tsvPath, tsv40, 'utf8');

  const localPathRows = allProducts
    .map((p) => formatProductToGmcRow(p))
    .filter((r) => r.image_link.includes('/images/products/') || !r.image_link.startsWith('https://'));

  console.log(`=== DIRECT EXTERNAL PRODUCT IMAGE VERIFICATION SUMMARY ===`);
  console.log(`Total Catalog Products Verified: ${allProducts.length}`);
  console.log(`Firestore Live Docs Updated to Clean External URLs: ${updatedInFirestore}`);
  console.log(`Products with Local File Paths Remaining: ${localPathRows.length}`);
  process.exit(0);
}

main();

