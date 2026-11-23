import * as fs from 'fs';
import * as path from 'path';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import {
  PRODUCT_GMC_METADATA,
  getCanonicalProductSlug,
  buildFallbackProductFromGmcMeta,
  generateGmcTsv,
  resolveProductPricing,
} from '../src/lib/gmc-feed';
import { enrichProductImages, Product } from '../src/lib/firebase/firestore-helpers';

function getDocUpdatedAtMs(docObj: Record<string, any>): number {
  const u = docObj?.updatedAt;
  if (!u) return 0;
  if (typeof u?.toMillis === 'function') return u.toMillis();
  if (typeof u?.seconds === 'number') return u.seconds * 1000;
  const parsed = Date.parse(String(u));
  return Number.isFinite(parsed) ? parsed : 0;
}

async function main() {
  const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const app = initializeApp(config);
  const db = getFirestore(app, config.firestoreDatabaseId);

  const snap = await getDocs(collection(db, 'products'));
  const liveByCanonical = new Map<string, Record<string, any>>();
  const inactiveSlugs = new Set<string>();

  for (const d of snap.docs) {
    const raw: Record<string, any> = { ...d.data(), id: d.id };
    const canonical = getCanonicalProductSlug(raw, d.id);
    if (!canonical) continue;

    if (raw.isActive === false) {
      inactiveSlugs.add(canonical);
      continue;
    }

    const existing = liveByCanonical.get(canonical);
    if (!existing) {
      liveByCanonical.set(canonical, raw);
    } else {
      const existingScore = (existing.id === canonical ? 1e15 : 0) + getDocUpdatedAtMs(existing);
      const candidateScore = (raw.id === canonical ? 1e15 : 0) + getDocUpdatedAtMs(raw);
      if (candidateScore >= existingScore) {
        liveByCanonical.set(canonical, raw);
      }
    }
  }

  // Reconcile PRODUCT_GMC_METADATA in src/lib/gmc-feed.ts so every active Firestore SKU matches 100%
  const gmcFeedPath = path.resolve(process.cwd(), 'src/lib/gmc-feed.ts');
  let gmcSource = fs.readFileSync(gmcFeedPath, 'utf8');
  let updatedMetaCount = 0;

  for (const [slug, fsDoc] of liveByCanonical.entries()) {
    const pricing = resolveProductPricing(fsDoc);
    const targetReg = Math.round(pricing.regularPrice);
    const targetSale = Math.round(pricing.salePrice);

    // Match the exact block for `'slug': { ... }` in PRODUCT_GMC_METADATA
    const keyPatterns = [slug];
    if (slug === 'polycom-realpresence-group-500-pakistan') {
      keyPatterns.push('T1XLMubVYmFzeIfC7V9B');
    }

    for (const keyName of keyPatterns) {
      const escapedKey = keyName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const blockRegex = new RegExp(
        `('${escapedKey}':\\s*\\{[\\s\\S]*?\\n\\s*regularPrice:\\s*)(\\d+)([\\s\\S]*?\\n\\s*salePrice:\\s*)(\\d+)`,
        'm'
      );
      const match = gmcSource.match(blockRegex);
      if (match) {
        const curReg = Number(match[2]);
        const curSale = Number(match[4]);
        if (curReg !== targetReg || curSale !== targetSale) {
          gmcSource = gmcSource.replace(blockRegex, `$1${targetReg}$3${targetSale}`);
          updatedMetaCount++;
        }
      }
    }
  }

  fs.writeFileSync(gmcFeedPath, gmcSource, 'utf8');

  // Build deduplicated full catalog for public/google_merchant_feed.tsv
  // Include all active Firestore docs + all non-inactive PRODUCT_GMC_METADATA fallbacks
  const finalByCanonical = new Map<string, Record<string, any>>();
  for (const [slug, fsDoc] of liveByCanonical.entries()) {
    const pricing = resolveProductPricing(fsDoc);
    const enriched = enrichProductImages({
      ...fsDoc,
      regularPrice: pricing.regularPrice,
      salePrice: pricing.salePrice,
    } as Product);
    finalByCanonical.set(slug, enriched);
  }

  for (const slugKey of Object.keys(PRODUCT_GMC_METADATA)) {
    if (slugKey === 'T1XLMubVYmFzeIfC7V9B' || slugKey === 'wMbGVClqbDS2LFrv5HyX') continue;
    const canonical = getCanonicalProductSlug({ slug: slugKey }, slugKey);
    if (finalByCanonical.has(canonical) || inactiveSlugs.has(canonical) || inactiveSlugs.has(slugKey)) {
      continue;
    }
    const fb = buildFallbackProductFromGmcMeta(canonical);
    if (fb) {
      finalByCanonical.set(canonical, fb);
    }
  }

  const allFeedProducts = Array.from(finalByCanonical.values());
  const tsv40 = generateGmcTsv(allFeedProducts);
  const tsvPath = path.resolve(process.cwd(), 'public/google_merchant_feed.tsv');
  fs.writeFileSync(tsvPath, tsv40, 'utf8');

  console.log('=== GMC PRICE RECONCILIATION COMPLETE ===');
  console.log('Active unique Firestore products:', liveByCanonical.size);
  console.log('Inactive Firestore products excluded from GMC:', inactiveSlugs.size);
  console.log('PRODUCT_GMC_METADATA entries synced to live Firestore prices:', updatedMetaCount);
  console.log('Deduplicated active GMC feed rows written to public/google_merchant_feed.tsv:', allFeedProducts.length);
  process.exit(0);
}

main().catch((err) => {
  console.error('Price reconciliation failed:', err);
  process.exit(1);
});
