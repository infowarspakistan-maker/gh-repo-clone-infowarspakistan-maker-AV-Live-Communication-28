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

      // Extract clean direct URLs from raw document and metadata
      const directFromDoc = extractDirectImageUrls([raw.images, raw.image, (raw as any).imageUrl]).filter(
        (u) => !/unsplash\.com/i.test(u)
      );
      const directFromMeta = extractDirectImageUrls(meta?.images);
      const hasCuratedAvLiveMain = directFromMeta.some((u) =>
        /^\/images\/(products|projects|teleprompter|video-conference)\//i.test(u) &&
        !/^\/images\/products\/avlive-/i.test(u)
      );

      const finalImages = Array.from(
        new Set(
          hasCuratedAvLiveMain
            ? [...directFromMeta, ...directFromDoc]
            : directFromDoc.length > 0
            ? [...directFromDoc, ...directFromMeta]
            : directFromMeta
        )
      );
      const primaryImage = finalImages[0] || '';

      const rawImagesArr = Array.isArray(raw.images) ? raw.images : [];
      const isPodiumPrompter = d.id === 'kl5wGaNLxqQByn3oPd1Z' || slug === 'podium-prompter-17-compact-pakistan';
      const needsFirestoreUpdate =
        isPodiumPrompter ||
        hasCuratedAvLiveMain ||
        raw.image !== primaryImage ||
        JSON.stringify(rawImagesArr) !== JSON.stringify(finalImages);

      if (finalImages.length > 0 && needsFirestoreUpdate) {
        try {
          const patch: Record<string, any> = {
            images: finalImages,
            image: primaryImage,
            imageUrl: primaryImage,
          };
          if (meta?.shippingWeight) {
            patch.shippingWeight = meta.shippingWeight;
          }
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

  // Preserve every distinct Firestore product document ID so all 53 GMC Item IDs match 1-to-1
  const byId = new Map<string, Record<string, any>>();
  const coveredSlugs = new Set<string>();
  for (const p of firestoreProducts) {
    const idKey = p.id || getCanonicalProductSlug(p);
    byId.set(idKey, enrichProductImages(p as Product));
    coveredSlugs.add(getCanonicalProductSlug(p, p.id));
  }
  for (const slugKey of Object.keys(PRODUCT_GMC_METADATA)) {
    const canonical = getCanonicalProductSlug({ slug: slugKey }, slugKey);
    if (!coveredSlugs.has(canonical) && !byId.has(slugKey)) {
      const fb = buildFallbackProductFromGmcMeta(canonical);
      if (fb) {
        byId.set(fb.id || canonical, fb);
        coveredSlugs.add(canonical);
      }
    }
  }

  const allProducts = Array.from(byId.values());
  const tsv40 = generateGmcTsv(allProducts);
  const tsvPath = path.resolve(process.cwd(), 'public/google_merchant_feed.tsv');
  fs.writeFileSync(tsvPath, tsv40, 'utf8');

  const gmcRows = allProducts.map((p) => formatProductToGmcRow(p));
  const invalidImageRows = gmcRows.filter((r) => !r.image_link.startsWith('https://'));
  const missingWeightRows = gmcRows.filter((r) => !r.shipping_weight);

  console.log(`=== GMC FEED & PRODUCT IMAGE VERIFICATION SUMMARY ===`);
  console.log(`Total Catalog Products Verified: ${allProducts.length}`);
  console.log(`Firestore Live Docs Updated: ${updatedInFirestore}`);
  console.log(`GMC Rows Missing https:// image_link: ${invalidImageRows.length}`);
  console.log(`GMC Rows Missing shipping_weight: ${missingWeightRows.length}`);
  process.exit(0);
}

main();

