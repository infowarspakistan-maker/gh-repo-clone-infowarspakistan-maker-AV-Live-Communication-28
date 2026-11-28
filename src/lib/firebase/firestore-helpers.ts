import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  query,
  orderBy,
  where,
  serverTimestamp,
  onSnapshot,
  setDoc,
  Unsubscribe,
  Timestamp,
  limit as firestoreLimit,
  arrayUnion,
} from 'firebase/firestore';
import {
  arrayRemove,
} from 'firebase/firestore';
import { db, auth, testFirestoreConnection } from './client';
import {
  uploadToProductsStorage,
  deleteFromProductsStorage,
} from './products-storage';
import { v4 as uuidv4 } from 'uuid';
import {
  SEO_SLUG_TO_PRODUCT_ID,
  resolveCanonicalProductSlugByIdentifier,
  buildFallbackProductFromGmcMeta,
  getCanonicalProductSlug,
  PRODUCT_GMC_METADATA,
  PRODUCT_CUSTOM_PAGE_ROUTES,
} from '../gmc-feed';
import { FALLBACK_SERVICES_CATALOG } from '../services-catalog';
import { extractDirectImageUrls, DEFAULT_EXTERNAL_PRODUCT_IMAGE } from '../image-optimize';
import { TV_CATALOG_ITEMS } from '../tv-catalog';

const QUOTA_STORAGE_KEY = 'avlive_fs_quota_tripped_until';
let memoryQuotaTrippedUntil = 0;

export function isFirestoreQuotaExhausted(): boolean {
  const now = Date.now();
  if (memoryQuotaTrippedUntil > now) return true;
  if (typeof window !== 'undefined' && window.sessionStorage) {
    try {
      const stored = Number(window.sessionStorage.getItem(QUOTA_STORAGE_KEY) || '0');
      if (stored > now) {
        memoryQuotaTrippedUntil = stored;
        return true;
      }
    } catch {
      // ignore storage errors
    }
  }
  return false;
}

export function checkAndTripQuota(error: any): boolean {
  const msg = String(error?.message || error?.code || error || '');
  if (
    msg.includes('resource-exhausted') ||
    msg.includes('Quota limit exceeded') ||
    msg.includes('Quota exceeded') ||
    error?.code === 'resource-exhausted'
  ) {
    // Trip circuit breaker for 1 hour in current session to eliminate redundant failing network requests
    const tripUntil = Date.now() + 60 * 60 * 1000;
    memoryQuotaTrippedUntil = tripUntil;
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        window.sessionStorage.setItem(QUOTA_STORAGE_KEY, String(tripUntil));
      } catch {
        // ignore storage errors
      }
    }
    return true;
  }
  return false;
}

const FALLBACK_CATEGORIES_LIST: Category[] = [
  { id: 'video-conferencing', name: 'Video Conferencing', slug: 'video-conferencing', description: 'Enterprise 4K PTZ cameras, video bars & codecs', parentId: null, displayOrder: 1, isActive: true, isFeatured: true },
  { id: 'audio-microphones', name: 'Audio & Microphones', slug: 'audio-microphones', description: 'Ceiling mic arrays, speakerphones & DSPs', parentId: null, displayOrder: 2, isActive: true, isFeatured: true },
  { id: 'ip-phones', name: 'IP Phones & VoIP', slug: 'ip-phones', description: 'SIP desk phones, reception consoles & IP PBXs', parentId: null, displayOrder: 3, isActive: true, isFeatured: true },
  { id: 'headsets', name: 'Headsets', slug: 'headsets', description: 'ANC wireless DECT, Bluetooth & USB headsets', parentId: null, displayOrder: 4, isActive: true, isFeatured: true },
  { id: 'led-tv-displays', name: 'LED TVs & Commercial Displays', slug: 'led-tv-displays', description: 'Samsung Crystal UHD, TCL 4K Google TVs & Horion Interactive Flat Panels', parentId: null, displayOrder: 5, isActive: true, isFeatured: true },
  { id: 'displays', name: 'Commercial Displays & SMD Walls', slug: 'displays', description: 'Interactive flat panels & fine-pitch SMD LED walls', parentId: null, displayOrder: 6, isActive: true, isFeatured: true },
  { id: 'projectors', name: 'Projectors', slug: 'projectors', description: 'Laser boardroom & large-venue projectors', parentId: null, displayOrder: 7, isActive: true, isFeatured: false },
  { id: 'ip-cameras', name: 'IP Cameras', slug: 'ip-cameras', description: 'Enterprise NDAA-compliant IP surveillance', parentId: null, displayOrder: 8, isActive: true, isFeatured: false },
  { id: 'intercom', name: 'Intercom & Paging', slug: 'intercom', description: 'SIP door intercoms & IP paging horns', parentId: null, displayOrder: 9, isActive: true, isFeatured: false },
  { id: 'networking', name: 'Networking & PoE', slug: 'networking', description: 'Managed PoE+ switches & Wi-Fi 6/7 access points', parentId: null, displayOrder: 10, isActive: true, isFeatured: false },
];

async function getAuthHeader() {
  const token = await auth.currentUser?.getIdToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// ============================================
// PRODUCT CRUD OPERATIONS
// ============================================

export interface Product {
  id?: string;
  gmcId?: string;
  slug?: string;
  productName: string;
  sku: string;
  gtin?: string;
  mpn?: string;
  identifierExists?: 'yes' | 'no';
  shortDescription: string;
  description: string;
  gmcDescription?: string;
  productUrl?: string;
  mobileLink?: string;
  availability?: 'in_stock' | 'out_of_stock' | 'preorder' | 'backorder';
  condition?: 'new' | 'refurbished' | 'used';
  priceCurrency?: 'PKR' | 'USD' | 'GBP' | 'AED' | 'EUR';
  gmcPrice?: number;
  gmcSalePrice?: number;
  regularPrice: number;
  salePrice: number;
  stockQuantity: number;
  lowStockThreshold: number;
  images: string[];
  image?: string;
  additionalImages?: string[];
  videoLink?: string;
  categoryIds: string[];
  categorySlugs: string[];
  googleProductCategory?: string;
  productType?: string;
  customLabel0?: string;
  customLabel1?: string;
  customLabel2?: string;
  customLabel3?: string;
  customLabel4?: string;
  shippingWeight?: string;
  shippingLength?: string;
  shippingWidth?: string;
  shippingHeight?: string;
  returnPolicyLabel?: string;
  isBundle?: 'yes' | 'no';
  multipack?: number | null;
  brand: string;
  size?: string;
  itemGroupId?: string;
  modelSeries?: string;
  typeKeyFeature?: string;
  priceNote?: string;
  variations: any[];
  isActive: boolean;
  isFeatured?: boolean;
  specifications?: string;
  seoTags?: string;
  seoMetaDescription?: string;
  imageAltText?: string;
  imagesCustomized?: boolean;
  customPagePath?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface ProductBackup {
  id?: string;
  originalProductId: string;
  gmcId?: string;
  productName: string;
  brand?: string;
  sku?: string;
  reason: 'before_delete' | 'before_image_update' | 'manual_snapshot';
  backedUpBy: string;
  images: string[];
  productSnapshot: Record<string, any>;
  createdAt?: Timestamp | string;
}

function stripUndefinedDeep<T>(val: T): T {
  if (Array.isArray(val)) {
    return val.map((item) => stripUndefinedDeep(item)) as unknown as T;
  }
  if (val && typeof val === 'object' && Object.getPrototypeOf(val) === Object.prototype) {
    const clean: Record<string, any> = {};
    for (const [k, v] of Object.entries(val as Record<string, any>)) {
      if (v !== undefined) {
        clean[k] = stripUndefinedDeep(v);
      }
    }
    return clean as T;
  }
  return val;
}

function serializeSnapshotForBackup(prod: Record<string, any>): Record<string, any> {
  const clean: Record<string, any> = {};
  for (const [k, v] of Object.entries(prod || {})) {
    if (v === undefined) continue;
    if (v && typeof (v as any).toDate === 'function') {
      clean[k] = (v as any).toDate().toISOString();
    } else if (v && typeof v === 'object' && Object.getPrototypeOf(v) === Object.prototype) {
      clean[k] = serializeSnapshotForBackup(v);
    } else {
      clean[k] = v;
    }
  }
  return clean;
}

export function enrichProductImages(p: Product): Product {
  const canonicalSlug = getCanonicalProductSlug(p, p.id);
  const meta = PRODUCT_GMC_METADATA[canonicalSlug] || (p.id ? PRODUCT_GMC_METADATA[p.id] : undefined);

  // Extract direct image URLs from the product document
  const rawExternalImgs = extractDirectImageUrls([
    p.image,
    ...(Array.isArray(p.images) ? p.images : typeof p.images === 'string' ? [p.images] : []),
    ...(Array.isArray(p.additionalImages) ? p.additionalImages : []),
    (p as any).imageUrl,
  ]);

  let finalImages: string[];
  if (p.imagesCustomized === true) {
    // Respect explicit admin image additions, ordering, and deletions without re-injecting catalog metadata images
    finalImages = rawExternalImgs;
  } else {
    const metaExternalImgs = extractDirectImageUrls(meta?.images || []);
    const hasCuratedLocalMain = metaExternalImgs.some(
      (u) => u.startsWith('/images/products/') && !u.includes('/avlive-')
    );

    const mergedImgs = Array.from(
      new Set(
        hasCuratedLocalMain
          ? [...metaExternalImgs, ...rawExternalImgs]
          : [...rawExternalImgs, ...metaExternalImgs]
      )
    );

    finalImages = mergedImgs.length > 0 ? mergedImgs : [DEFAULT_EXTERNAL_PRODUCT_IMAGE];
  }

  const rawSlugs = Array.isArray(p.categorySlugs)
    ? p.categorySlugs
    : typeof p.categorySlugs === 'string' && p.categorySlugs
    ? [p.categorySlugs]
    : [];
  const normalizedSlugs = Array.from(
    new Set([
      ...rawSlugs.map((s) => {
        const clean = String(s || '').trim().toLowerCase();
        if (clean === 'video conference' || clean === 'video conferencing') return 'video-conferencing';
        return clean.replace(/\s+/g, '-');
      }).filter(Boolean),
      ...(meta?.categorySlugs || []),
    ])
  );

  const mergedCategoryIds = Array.from(
    new Set([
      ...(Array.isArray(p.categoryIds) ? p.categoryIds.filter(Boolean) : []),
      ...(normalizedSlugs.includes('video-conferencing') ? ['cat-video'] : []),
    ])
  );
  const resolvedCustomPagePath =
    (p.customPagePath && p.customPagePath.startsWith('/') ? p.customPagePath : undefined) ||
    PRODUCT_CUSTOM_PAGE_ROUTES[canonicalSlug] ||
    (p.id ? PRODUCT_CUSTOM_PAGE_ROUTES[p.id] : undefined);

  const isGgnCiscoRefresh = Boolean(meta?.gmcId?.startsWith('GGN-CS-')) && p.imagesCustomized !== true;
  const normalizedRegular =
    Number(p.regularPrice) > 0 ? Number(p.regularPrice) : Number(meta?.regularPrice || 0);
  const rawSale = Number(p.salePrice ?? 0);
  const normalizedSale =
    rawSale > 0 && (normalizedRegular <= 0 || rawSale < normalizedRegular)
      ? rawSale
      : normalizedRegular;

  return {
    ...p,
    id: String(p.id || canonicalSlug).trim() || canonicalSlug,
    slug: canonicalSlug,
    ...(resolvedCustomPagePath ? { customPagePath: resolvedCustomPagePath } : {}),
    ...(p.gmcId || meta?.gmcId ? { gmcId: p.gmcId || meta?.gmcId } : {}),
    ...(p.gtin || meta?.gtin ? { gtin: isGgnCiscoRefresh ? meta?.gtin || p.gtin : p.gtin || meta?.gtin } : {}),
    productName: isGgnCiscoRefresh && meta?.title ? meta.title : p.productName,
    sku: isGgnCiscoRefresh && meta?.mpn ? meta.mpn : (p.sku && p.sku.trim()) || meta?.mpn || p.mpn || '',
    mpn: isGgnCiscoRefresh && meta?.mpn ? meta.mpn : (p.mpn && p.mpn.trim()) || meta?.mpn || p.sku || '',
    regularPrice: normalizedRegular,
    salePrice: normalizedSale,
    ...(p.googleProductCategory || meta?.googleProductCategory
      ? { googleProductCategory: p.googleProductCategory || meta?.googleProductCategory }
      : {}),
    ...(p.productType || meta?.productType ? { productType: p.productType || meta?.productType } : {}),
    ...(p.customLabel0 || meta?.customLabel0 ? { customLabel0: p.customLabel0 || meta?.customLabel0 } : {}),
    ...(p.customLabel1 || meta?.customLabel1 ? { customLabel1: p.customLabel1 || meta?.customLabel1 } : {}),
    ...(p.customLabel2 || meta?.customLabel2 ? { customLabel2: p.customLabel2 || meta?.customLabel2 } : {}),
    ...(p.customLabel3 || meta?.customLabel3 ? { customLabel3: p.customLabel3 || meta?.customLabel3 } : {}),
    ...(p.customLabel4 || meta?.customLabel4 ? { customLabel4: p.customLabel4 || meta?.customLabel4 } : {}),
    ...(p.shippingWeight || meta?.shippingWeight
      ? { shippingWeight: isGgnCiscoRefresh ? meta?.shippingWeight || p.shippingWeight : p.shippingWeight || meta?.shippingWeight }
      : {}),
    ...(p.shippingLength || meta?.shippingLength ? { shippingLength: p.shippingLength || meta?.shippingLength } : {}),
    ...(p.shippingWidth || meta?.shippingWidth ? { shippingWidth: p.shippingWidth || meta?.shippingWidth } : {}),
    ...(p.shippingHeight || meta?.shippingHeight ? { shippingHeight: p.shippingHeight || meta?.shippingHeight } : {}),
    ...(p.returnPolicyLabel || meta?.returnPolicyLabel
      ? { returnPolicyLabel: p.returnPolicyLabel || meta?.returnPolicyLabel }
      : {}),
    ...(p.isBundle || meta?.isBundle ? { isBundle: p.isBundle || meta?.isBundle } : {}),
    categoryIds: mergedCategoryIds,
    categorySlugs: normalizedSlugs.length > 0 ? normalizedSlugs : p.categorySlugs,
    images: finalImages,
    image: finalImages[0] || '',
    additionalImages: finalImages.slice(1, 11),
  };
}

export function deduplicateProducts(products: Product[]): Product[] {
  const seenIds = new Set<string>();
  const seenSlugs = new Set<string>();
  const result: Product[] = [];
  for (const rawProd of products) {
    const p = enrichProductImages(rawProd);
    const idKey = String(p.id || p.slug || p.sku || p.productName || '').trim();
    const canonicalSlug = getCanonicalProductSlug(p, p.id);
    if ((idKey && seenIds.has(idKey)) || (canonicalSlug && seenSlugs.has(canonicalSlug))) {
      continue;
    }
    if (idKey) seenIds.add(idKey);
    if (canonicalSlug) seenSlugs.add(canonicalSlug);
    result.push(p);
  }
  return result;
}

let memoryDeletedCatalogIds = new Set<string>();

function isProductTombstoned(p: Partial<Product>, tombstones: Set<string>): boolean {
  if (tombstones.size === 0) return false;
  const canonical = getCanonicalProductSlug(p, p.id);
  return Boolean(
    (p.id && tombstones.has(p.id)) ||
    (p.slug && tombstones.has(p.slug)) ||
    (canonical && tombstones.has(canonical))
  );
}

async function fetchDeletedCatalogIds(): Promise<Set<string>> {
  if (isFirestoreQuotaExhausted()) return memoryDeletedCatalogIds;
  try {
    const snap = await getDoc(doc(db, 'settings', 'catalog_tombstones'));
    if (snap.exists()) {
      const ids = Array.isArray(snap.data()?.deletedIds) ? snap.data().deletedIds : [];
      memoryDeletedCatalogIds = new Set(ids.map((x: any) => String(x)));
    }
  } catch {
    // ignore read failures
  }
  return memoryDeletedCatalogIds;
}

function mergeUnpersistedCatalogFallbacks(
  firestoreProducts: Product[],
  tombstones: Set<string>
): Product[] {
  const coveredSlugs = new Set<string>();
  const coveredIds = new Set<string>();
  for (const p of firestoreProducts) {
    if (p.id) coveredIds.add(String(p.id));
    const canonical = getCanonicalProductSlug(p, p.id);
    if (canonical) coveredSlugs.add(canonical);
  }
  const merged = [...firestoreProducts];
  for (const slugKey of Object.keys(PRODUCT_GMC_METADATA)) {
    const canonical = getCanonicalProductSlug({ slug: slugKey }, slugKey);
    if (!canonical || coveredSlugs.has(canonical) || coveredIds.has(slugKey)) continue;
    const fb = buildFallbackProductFromGmcMeta(canonical) as Product | null;
    if (fb && !isProductTombstoned(fb, tombstones)) {
      merged.push(fb);
      coveredSlugs.add(canonical);
    }
  }
  return deduplicateProducts(merged).filter((p) => !isProductTombstoned(p, tombstones));
}

function getFallbackFilteredProducts(filter?: { isActive?: boolean; categoryId?: string }): Product[] {
  let products = Object.keys(PRODUCT_GMC_METADATA)
    .map((slug) => buildFallbackProductFromGmcMeta(slug))
    .filter(Boolean) as Product[];
  products = deduplicateProducts(products).filter(
    (p) => !isProductTombstoned(p, memoryDeletedCatalogIds)
  );
  if (filter?.isActive !== undefined) {
    products = products.filter((p) => Boolean(p.isActive) === filter.isActive);
  }
  if (filter?.categoryId) {
    products = products.filter(
      (p) =>
        p.categoryIds?.includes(filter.categoryId!) ||
        p.categorySlugs?.includes(filter.categoryId!)
    );
  }
  return products;
}

// Validate Firestore connectivity once at startup
if (typeof window !== 'undefined') {
  testFirestoreConnection().catch(() => {});
}

export function subscribeToProducts(
  callback: (products: Product[]) => void,
  filter?: { isActive?: boolean; categoryId?: string }
): Unsubscribe {
  if (isFirestoreQuotaExhausted()) {
    callback(getFallbackFilteredProducts(filter));
    return () => {};
  }

  let latestFirestoreProducts: Product[] = [];
  let hasInitialProducts = false;

  const emitCombined = () => {
    let list =
      latestFirestoreProducts.length > 0
        ? mergeUnpersistedCatalogFallbacks(latestFirestoreProducts, memoryDeletedCatalogIds)
        : (deduplicateProducts(
            Object.keys(PRODUCT_GMC_METADATA)
              .map((slug) => buildFallbackProductFromGmcMeta(slug))
              .filter(Boolean) as Product[]
          ).filter((p) => !isProductTombstoned(p, memoryDeletedCatalogIds)));
    if (filter?.isActive !== undefined) {
      list = list.filter((p) => Boolean(p.isActive) === filter.isActive);
    }
    if (filter?.categoryId) {
      list = list.filter(
        (p) =>
          p.categoryIds?.includes(filter.categoryId!) ||
          p.categorySlugs?.includes(filter.categoryId!)
      );
    }
    list.sort((a, b) => {
      const timeA = typeof a.createdAt?.toMillis === 'function' ? a.createdAt.toMillis() : 0;
      const timeB = typeof b.createdAt?.toMillis === 'function' ? b.createdAt.toMillis() : 0;
      return timeB - timeA;
    });
    callback(list);
  };

  const unsubTombstones = onSnapshot(
    doc(db, 'settings', 'catalog_tombstones'),
    (snap) => {
      const ids = snap.exists() && Array.isArray(snap.data()?.deletedIds)
        ? snap.data().deletedIds
        : [];
      memoryDeletedCatalogIds = new Set(ids.map((x: any) => String(x)));
      if (hasInitialProducts) emitCombined();
    },
    () => {
      // Ignore tombstone listener errors cleanly
    }
  );

  const q = query(collection(db, 'products'));

  const unsubProducts = onSnapshot(
    q,
    (snapshot) => {
      hasInitialProducts = true;
      latestFirestoreProducts = [];
      snapshot.forEach((docSnap) => {
        latestFirestoreProducts.push({ ...docSnap.data(), id: docSnap.id } as Product);
      });
      emitCombined();
    },
    (error) => {
      checkAndTripQuota(error);
      callback(getFallbackFilteredProducts(filter));
    }
  );

  return () => {
    unsubProducts();
    unsubTombstones();
  };
}

async function uploadBase64ImagesInHtml(html: string, productId: string): Promise<string> {
  if (!html) return html;

  // Find all matches of base64 image sources
  const regex = /src="(data:image\/([a-zA-Z0-9+-.]+);base64,([^"]+))"/g;
  let match;
  let updatedHtml = html;
  
  const matches: { fullMatch: string; mimeType: string; base64Data: string }[] = [];
  
  regex.lastIndex = 0;
  while ((match = regex.exec(html)) !== null) {
    matches.push({
      fullMatch: match[1],
      mimeType: match[2],
      base64Data: match[3],
    });
  }
  
  for (const item of matches) {
    try {
      // Decode base64
      const byteCharacters = atob(item.base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: `image/${item.mimeType}` });
      const file = new File([blob], `pasted_image_${Date.now()}.${item.mimeType}`, { type: `image/${item.mimeType}` });
      
      const url = await uploadProductImage(file, productId);
      updatedHtml = updatedHtml.replaceAll(item.fullMatch, url);
    } catch (err) {
      console.error('Failed to upload pasted base64 image in rich text:', err);
    }
  }
  
  return updatedHtml;
}

export async function saveProductBackupSnapshot(
  product: Partial<Product> & { id: string },
  reason: ProductBackup['reason']
): Promise<string> {
  const backupId = `${reason}_${product.id}_${Date.now()}`;
  const snapshotObj = serializeSnapshotForBackup(product);
  const imgs = Array.from(
    new Set([
      ...(Array.isArray(product.images) ? product.images : []),
      ...(product.image ? [product.image] : []),
      ...(Array.isArray(product.additionalImages) ? product.additionalImages : []),
    ].filter(Boolean))
  );

  try {
    await setDoc(doc(db, 'product_backups', backupId), {
      originalProductId: product.id,
      gmcId: product.gmcId || product.id,
      productName: product.productName || 'Untitled Product',
      brand: product.brand || '',
      sku: product.sku || '',
      reason,
      backedUpBy: auth.currentUser?.email || 'admin',
      images: imgs,
      productSnapshot: snapshotObj,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Could not save product backup snapshot:', err);
  }
  return backupId;
}

export async function listProductBackups(): Promise<ProductBackup[]> {
  if (isFirestoreQuotaExhausted()) return [];
  try {
    const q = query(
      collection(db, 'product_backups'),
      orderBy('createdAt', 'desc'),
      firestoreLimit(100)
    );
    const snap = await getDocs(q);
    const backups: ProductBackup[] = [];
    snap.forEach((docSnap) => {
      backups.push({ id: docSnap.id, ...docSnap.data() } as ProductBackup);
    });
    return backups;
  } catch (err) {
    checkAndTripQuota(err);
    return [];
  }
}

export async function restoreProductFromBackup(backupId: string): Promise<string> {
  const backupRef = doc(db, 'product_backups', backupId);
  const backupSnap = await getDoc(backupRef);
  if (!backupSnap.exists()) {
    throw new Error('Backup record not found.');
  }
  const backupData = backupSnap.data() as ProductBackup;
  const snapObj = stripUndefinedDeep({ ...(backupData.productSnapshot || {}) });
  const targetId = String(backupData.originalProductId || snapObj.id || uuidv4());
  delete snapObj.id;
  delete snapObj.createdAt;
  delete snapObj.updatedAt;

  // Clear tombstone markers if previously deleted
  const canonicalSlug = getCanonicalProductSlug({ ...snapObj, id: targetId }, targetId);
  memoryDeletedCatalogIds.delete(targetId);
  if (canonicalSlug) memoryDeletedCatalogIds.delete(canonicalSlug);
  try {
    await setDoc(
      doc(db, 'settings', 'catalog_tombstones'),
      {
        deletedIds: arrayRemove(targetId, ...(canonicalSlug ? [canonicalSlug] : [])),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch {
    // non-fatal if tombstone doc doesn't exist yet
  }

  await setDoc(
    doc(db, 'products', targetId),
    {
      ...snapObj,
      isActive: snapObj.isActive ?? true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return targetId;
}

export async function deleteProductBackup(backupId: string): Promise<void> {
  await deleteDoc(doc(db, 'product_backups', backupId));
}

export async function createProduct(
  data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  // Pre-generate a doc reference so we have the ID for the storage upload path
  const docRef = doc(collection(db, 'products'));
  const id = docRef.id;

  let processedDescription = data.description || '';
  let processedSpecifications = data.specifications || '';

  try {
    processedDescription = await uploadBase64ImagesInHtml(processedDescription, id);
    processedSpecifications = await uploadBase64ImagesInHtml(processedSpecifications, id);
  } catch (err) {
    console.error('Error pre-processing description base64 images:', err);
  }

  const hasExplicitImages =
    data.images !== undefined ||
    data.image !== undefined ||
    data.additionalImages !== undefined;

  const cleanData = stripUndefinedDeep({
    ...data,
    ...(hasExplicitImages ? { imagesCustomized: true } : {}),
    description: processedDescription,
    specifications: processedSpecifications,
  });

  await setDoc(docRef, {
    ...cleanData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return id;
}

export async function updateProduct(
  id: string,
  data: Partial<Product>,
  options?: { skipBackup?: boolean }
): Promise<void> {
  const docRef = doc(db, 'products', id);

  let processedDescription = data.description;
  let processedSpecifications = data.specifications;

  try {
    if (processedDescription) {
      processedDescription = await uploadBase64ImagesInHtml(processedDescription, id);
    }
    if (processedSpecifications) {
      processedSpecifications = await uploadBase64ImagesInHtml(processedSpecifications, id);
    }
  } catch (err) {
    console.error('Error pre-processing description base64 images in update:', err);
  }

  const touchesImages =
    data.images !== undefined ||
    data.image !== undefined ||
    data.additionalImages !== undefined ||
    data.imagesCustomized !== undefined;

  // Snapshot existing state before image edits so no URL or metadata is ever lost
  const existingSnap = await getDoc(docRef).catch(() => null);
  const existingData = existingSnap?.exists() ? (existingSnap.data() as Product) : null;

  if (touchesImages && !options?.skipBackup) {
    const prevProduct = existingData
      ? { ...existingData, id }
      : await getProduct(id).catch(() => null);
    if (prevProduct) {
      await saveProductBackupSnapshot({ ...prevProduct, id }, 'before_image_update');
    }
  }

  const updateData = stripUndefinedDeep({
    ...data,
    ...(touchesImages && data.imagesCustomized === undefined ? { imagesCustomized: true } : {}),
    ...(processedDescription !== undefined ? { description: processedDescription } : {}),
    ...(processedSpecifications !== undefined ? { specifications: processedSpecifications } : {}),
    updatedAt: serverTimestamp(),
  });

  if (existingData) {
    await updateDoc(docRef, updateData);
  } else {
    // Upsert catalog fallback product cleanly if it was not persisted as its own Firestore document yet
    const fallbackProd = await getProduct(id).catch(() => null);
    const baseData = fallbackProd
      ? stripUndefinedDeep(serializeSnapshotForBackup({ ...fallbackProd }))
      : {};
    delete (baseData as any).id;
    delete (baseData as any).createdAt;
    delete (baseData as any).updatedAt;

    await setDoc(
      docRef,
      {
        ...baseData,
        ...updateData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }

  // Ensure edited product is not marked deleted
  memoryDeletedCatalogIds.delete(id);
}

export async function deleteProduct(
  id: string,
  options?: { deleteStorageImages?: boolean }
): Promise<{ backupId?: string }> {
  const docRef = doc(db, 'products', id);
  const productSnap = await getDoc(docRef).catch(() => null);
  const existingProd = productSnap?.exists()
    ? ({ id: productSnap.id, ...productSnap.data() } as Product)
    : await getProduct(id).catch(() => null);

  let backupId: string | undefined;
  if (existingProd) {
    backupId = await saveProductBackupSnapshot({ ...existingProd, id }, 'before_delete');
  }

  const canonicalSlug = existingProd
    ? getCanonicalProductSlug(existingProd, id)
    : id;
  memoryDeletedCatalogIds.add(id);
  if (canonicalSlug) memoryDeletedCatalogIds.add(canonicalSlug);

  try {
    await setDoc(
      doc(db, 'settings', 'catalog_tombstones'),
      {
        deletedIds: arrayUnion(id, ...(canonicalSlug && canonicalSlug !== id ? [canonicalSlug] : [])),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Could not persist catalog tombstone:', err);
  }

  if (options?.deleteStorageImages && existingProd?.images) {
    for (const imageUrl of existingProd.images) {
      await deleteFromProductsStorage(imageUrl).catch((err) =>
        console.warn('Optional storage delete skipped:', err)
      );
    }
  }

  if (productSnap?.exists()) {
    await deleteDoc(docRef);
  }

  return { backupId };
}

// ============================================
// IMAGE UPLOAD HELPERS
// ============================================

export async function uploadProductImage(
  file: File,
  productId: string
): Promise<string> {
  const result = await uploadToProductsStorage(file, {
    slugHint: `${productId}-${file.name}`,
    includeGmcJpg: true,
    allowSiteVaultFallback: true,
  });
  return result.downloadUrl;
}

export async function deleteProductImage(imageUrl: string): Promise<void> {
  const res = await deleteFromProductsStorage(imageUrl);
  if (!res.deleted && res.authRequired) {
    throw new Error(res.reason || 'Google Storage authorization required to delete this file.');
  }
}

// ============================================
// CATEGORY CRUD OPERATIONS
// ============================================

export interface Category {
  id?: string;
  name: string;
  slug: string;
  description: string;
  imageUrl?: string;
  parentId: string | null;
  displayOrder: number;
  isActive: boolean;
  isFeatured?: boolean;
  seoTags?: string;
  seoMetaDescription?: string;
  imageAltText?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export async function getCategories(): Promise<Category[]> {
  if (isFirestoreQuotaExhausted()) {
    return FALLBACK_CATEGORIES_LIST;
  }
  try {
    const snapshot = await getDocs(
      query(collection(db, 'categories'), orderBy('displayOrder', 'asc'))
    );
    const categories: Category[] = [];
    snapshot.forEach((doc) => {
      categories.push({ ...doc.data(), id: doc.id } as Category);
    });
    return categories.length > 0 ? categories : FALLBACK_CATEGORIES_LIST;
  } catch (err) {
    checkAndTripQuota(err);
    return FALLBACK_CATEGORIES_LIST;
  }
}

export function subscribeToCategories(
  callback: (categories: Category[]) => void
): Unsubscribe {
  if (isFirestoreQuotaExhausted()) {
    callback(FALLBACK_CATEGORIES_LIST);
    return () => {};
  }
  const q = query(collection(db, 'categories'), orderBy('displayOrder', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const categories: Category[] = [];
    snapshot.forEach((doc) => {
      categories.push({ ...doc.data(), id: doc.id } as Category);
    });
    callback(categories.length > 0 ? categories : FALLBACK_CATEGORIES_LIST);
  }, (error) => {
    checkAndTripQuota(error);
    callback(FALLBACK_CATEGORIES_LIST);
  });
}

export async function createCategory(
  data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const docRef = await addDoc(collection(db, 'categories'), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateCategory(
  id: string,
  data: Partial<Category>
): Promise<void> {
  const docRef = doc(db, 'categories', id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteCategory(id: string): Promise<void> {
  // Find all children of this category
  const childrenQuery = query(
    collection(db, 'categories'),
    where('parentId', '==', id)
  );
  const childrenSnapshot = await getDocs(childrenQuery);
  
  // Reassign children to no parent
  for (const childDoc of childrenSnapshot.docs) {
    await updateDoc(doc(db, 'categories', childDoc.id), {
      parentId: null,
      updatedAt: serverTimestamp(),
    });
  }

  await deleteDoc(doc(db, 'categories', id));
}

export async function reorderCategories(
  updates: { id: string; displayOrder: number; parentId?: string | null }[]
): Promise<void> {
  const promises = updates.map(update => {
    const docRef = doc(db, 'categories', update.id);
    const data: any = { displayOrder: update.displayOrder };
    if (update.parentId !== undefined) {
      data.parentId = update.parentId;
    }
    return updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
  });
  await Promise.all(promises);
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function buildCategoryTree(
  categories: Category[]
): (Category & { children: any[] })[] {
  const map: Record<string, any> = {};
  const roots: any[] = [];

  categories.forEach((cat) => {
    map[cat.id!] = { ...cat, children: [] };
  });

  categories.forEach((cat) => {
    if (cat.parentId === cat.id) {
      roots.push(map[cat.id!]);
      return;
    }
    if (cat.parentId && map[cat.parentId]) {
      map[cat.parentId].children.push(map[cat.id!]);
    } else {
      roots.push(map[cat.id!]);
    }
  });

  const visited = new Set<string>();
  const sortByOrder = (items: any[]) => {
    items.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    items.forEach((item) => {
      if (item.id && !visited.has(item.id)) {
        visited.add(item.id);
        if (item.children) {
          sortByOrder(item.children);
        }
      }
    });
  };
  sortByOrder(roots);

  return roots;
}

// ============================================
// ORDER FUNCTIONS
// ============================================

export interface Order {
  id?: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  billingAddress?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shippingCost: number;
  total: number;
  paymentMethod: 'stripe' | 'bank_transfer' | 'check' | 'cod';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber?: string;
  notes?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface OrderItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  price: number;
  total: number;
  variation?: string;
}

export async function getOrders(
  filters?: {
    orderStatus?: Order['orderStatus'];
    paymentStatus?: Order['paymentStatus'];
    customerEmail?: string;
    startDate?: Date;
    endDate?: Date;
  }
): Promise<Order[]> {
  if (isFirestoreQuotaExhausted()) return [];
  try {
    let q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));

    if (filters?.orderStatus) {
      q = query(q, where('orderStatus', '==', filters.orderStatus));
    }
    if (filters?.paymentStatus) {
      q = query(q, where('paymentStatus', '==', filters.paymentStatus));
    }
    if (filters?.customerEmail) {
      q = query(q, where('customerEmail', '==', filters.customerEmail));
    }
    if (filters?.startDate) {
      q = query(q, where('createdAt', '>=', filters.startDate));
    }
    if (filters?.endDate) {
      q = query(q, where('createdAt', '<=', filters.endDate));
    }

    const snapshot = await getDocs(q);
    const orders: Order[] = [];
    snapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() } as Order);
    });
    return orders;
  } catch (err) {
    checkAndTripQuota(err);
    return [];
  }
}

export function subscribeToOrders(
  callback: (orders: Order[]) => void,
  filters?: { orderStatus?: Order['orderStatus'] }
): Unsubscribe {
  if (isFirestoreQuotaExhausted()) {
    callback([]);
    return () => {};
  }
  let q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
  if (filters?.orderStatus) {
    q = query(q, where('orderStatus', '==', filters.orderStatus));
  }
  return onSnapshot(q, (snapshot) => {
    const orders: Order[] = [];
    snapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() } as Order);
    });
    callback(orders);
  }, (error) => {
    checkAndTripQuota(error);
    callback([]);
  });
}

export async function getOrder(id: string): Promise<Order | null> {
  if (isFirestoreQuotaExhausted()) return null;
  try {
    const docRef = doc(db, 'orders', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Order;
    }
    return null;
  } catch (err) {
    checkAndTripQuota(err);
    return null;
  }
}

export async function updateOrderStatus(
  id: string,
  status: Order['orderStatus']
): Promise<void> {
  const docRef = doc(db, 'orders', id);
  await updateDoc(docRef, {
    orderStatus: status,
    updatedAt: serverTimestamp(),
  });
}

export async function updatePaymentStatus(
  id: string,
  status: Order['paymentStatus']
): Promise<void> {
  const docRef = doc(db, 'orders', id);
  await updateDoc(docRef, {
    paymentStatus: status,
    updatedAt: serverTimestamp(),
  });
}

export async function addTrackingNumber(
  id: string,
  trackingNumber: string
): Promise<void> {
  const docRef = doc(db, 'orders', id);
  await updateDoc(docRef, {
    trackingNumber,
    updatedAt: serverTimestamp(),
  });
}

export async function getOrderStats(): Promise<{
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  revenueThisMonth: number;
  ordersThisMonth: number;
}> {
  const emptyStats = {
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    processingOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    revenueThisMonth: 0,
    ordersThisMonth: 0,
  };
  if (isFirestoreQuotaExhausted()) return emptyStats;
  try {
    const snapshot = await getDocs(collection(db, 'orders'));
    const orders: Order[] = [];
    snapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() } as Order);
    });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let totalRevenue = 0;
    let revenueThisMonth = 0;
    let pending = 0,
      processing = 0,
      shipped = 0,
      delivered = 0,
      cancelled = 0;

    orders.forEach((order) => {
      if (order.orderStatus === 'delivered' || order.paymentStatus === 'paid') {
        totalRevenue += order.total || 0;
      }
      if (order.createdAt?.toDate() && order.createdAt.toDate() >= startOfMonth) {
        if (order.orderStatus === 'delivered' || order.paymentStatus === 'paid') {
          revenueThisMonth += order.total || 0;
        }
      }

      switch (order.orderStatus) {
        case 'pending':
          pending++;
          break;
        case 'processing':
          processing++;
          break;
        case 'shipped':
          shipped++;
          break;
        case 'delivered':
          delivered++;
          break;
        case 'cancelled':
          cancelled++;
          break;
      }
    });

    return {
      totalOrders: orders.length,
      totalRevenue,
      pendingOrders: pending,
      processingOrders: processing,
      shippedOrders: shipped,
      deliveredOrders: delivered,
      cancelledOrders: cancelled,
      revenueThisMonth,
      ordersThisMonth: orders.filter(
        (o) => o.createdAt?.toDate() && o.createdAt.toDate() >= startOfMonth
      ).length,
    };
  } catch (err) {
    checkAndTripQuota(err);
    return emptyStats;
  }
}

export async function createOrder(data: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'orders'), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

// ============================================
// RMA FUNCTIONS
// ============================================

export interface RMARequest {
  id?: string;
  orderNumber: string;
  orderId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  productId: string;
  productName: string;
  sku: string;
  reason: string;
  issueDescription: string;
  images?: string[];
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  rejectionReason?: string;
  adminNotes?: string[];
  returnTrackingNumber?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export async function getRMARequests(filters?: { status?: RMARequest['status'] }): Promise<RMARequest[]> {
  if (isFirestoreQuotaExhausted()) return [];
  try {
    let q = query(collection(db, 'rma_requests'), orderBy('createdAt', 'desc'));
    if (filters?.status) {
      q = query(q, where('status', '==', filters.status));
    }
    const snapshot = await getDocs(q);
    const requests: RMARequest[] = [];
    snapshot.forEach((doc) => {
      requests.push({ id: doc.id, ...doc.data() } as RMARequest);
    });
    return requests;
  } catch (err) {
    checkAndTripQuota(err);
    return [];
  }
}

export function subscribeToRMARequests(
  callback: (requests: RMARequest[]) => void,
  filters?: { status?: RMARequest['status'] }
): Unsubscribe {
  if (isFirestoreQuotaExhausted()) {
    callback([]);
    return () => {};
  }
  let q = query(collection(db, 'rma_requests'), orderBy('createdAt', 'desc'));
  if (filters?.status) {
    q = query(q, where('status', '==', filters.status));
  }
  return onSnapshot(q, (snapshot) => {
    const requests: RMARequest[] = [];
    snapshot.forEach((doc) => {
      requests.push({ id: doc.id, ...doc.data() } as RMARequest);
    });
    callback(requests);
  }, (error) => {
    checkAndTripQuota(error);
    callback([]);
  });
}

export async function updateRMARequestStatus(
  id: string,
  status: RMARequest['status'],
  rejectionReason?: string
): Promise<void> {
  const docRef = doc(db, 'rma_requests', id);
  const updateData: any = {
    status,
    updatedAt: serverTimestamp(),
  };
  if (rejectionReason) {
    updateData.rejectionReason = rejectionReason;
  }
  await updateDoc(docRef, updateData);
}

export async function addRMANote(id: string, note: string): Promise<void> {
  const docRef = doc(db, 'rma_requests', id);
  await updateDoc(docRef, {
    adminNotes: arrayUnion(note),
    updatedAt: serverTimestamp(),
  });
}

export async function addRMATracking(id: string, trackingNumber: string): Promise<void> {
  const docRef = doc(db, 'rma_requests', id);
  await updateDoc(docRef, {
    returnTrackingNumber: trackingNumber,
    updatedAt: serverTimestamp(),
  });
}

export async function getRMAStats(): Promise<{
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  completed: number;
}> {
  const emptyStats = { total: 0, pending: 0, approved: 0, rejected: 0, completed: 0 };
  if (isFirestoreQuotaExhausted()) return emptyStats;
  try {
    const snapshot = await getDocs(collection(db, 'rma_requests'));
    const requests: RMARequest[] = [];
    snapshot.forEach((doc) => {
      requests.push({ id: doc.id, ...doc.data() } as RMARequest);
    });

    return {
      total: requests.length,
      pending: requests.filter((r) => r.status === 'pending').length,
      approved: requests.filter((r) => r.status === 'approved').length,
      rejected: requests.filter((r) => r.status === 'rejected').length,
      completed: requests.filter((r) => r.status === 'completed').length,
    };
  } catch (err) {
    checkAndTripQuota(err);
    return emptyStats;
  }
}


export interface StockHistoryEntry {
  id?: string;
  productId: string;
  productName: string;
  sku: string;
  previousStock: number;
  newStock: number;
  change: number; // positive = added, negative = removed
  reason: string; // 'manual_update', 'order_fulfilled', 'restock', 'adjustment'
  updatedBy: string; // admin email or uid
  createdAt?: Timestamp;
}

export async function getProduct(idOrSlug: string): Promise<Product | null> {
  const canonicalSlug = resolveCanonicalProductSlugByIdentifier(idOrSlug) || idOrSlug;
  const mappedId = SEO_SLUG_TO_PRODUCT_ID[canonicalSlug] || SEO_SLUG_TO_PRODUCT_ID[idOrSlug] || canonicalSlug;

  const tombstones = await fetchDeletedCatalogIds();
  if (tombstones.has(idOrSlug) || tombstones.has(canonicalSlug) || tombstones.has(mappedId)) {
    return null;
  }

  if (!isFirestoreQuotaExhausted()) {
    try {
      const docSnap = await getDoc(doc(db, 'products', mappedId));
      if (docSnap.exists()) {
        const data = docSnap.data() as Product;
        return enrichProductImages({
          id: docSnap.id,
          ...data,
          slug: getCanonicalProductSlug({ ...data, id: docSnap.id }, docSnap.id),
        });
      }

      if (mappedId !== idOrSlug) {
        const rawSnap = await getDoc(doc(db, 'products', idOrSlug));
        if (rawSnap.exists()) {
          const data = rawSnap.data() as Product;
          return enrichProductImages({
            id: rawSnap.id,
            ...data,
            slug: getCanonicalProductSlug({ ...data, id: rawSnap.id }, rawSnap.id),
          });
        }
      }

      // Fallback 1: query by slug field in Firestore
      const slugQuery = query(
        collection(db, 'products'),
        where('slug', '==', canonicalSlug),
        firestoreLimit(1)
      );
      const slugSnap = await getDocs(slugQuery);
      if (!slugSnap.empty) {
        const firstDoc = slugSnap.docs[0];
        const data = firstDoc.data() as Product;
        return enrichProductImages({
          id: firstDoc.id,
          ...data,
          slug: getCanonicalProductSlug({ ...data, id: firstDoc.id }, firstDoc.id),
        });
      }

      // Fallback 2: query by sku field in Firestore (e.g., /product/9137161U)
      const skuQuery = query(
        collection(db, 'products'),
        where('sku', '==', idOrSlug),
        firestoreLimit(1)
      );
      const skuSnap = await getDocs(skuQuery);
      if (!skuSnap.empty) {
        const firstDoc = skuSnap.docs[0];
        const data = firstDoc.data() as Product;
        return enrichProductImages({
          id: firstDoc.id,
          ...data,
          slug: getCanonicalProductSlug({ ...data, id: firstDoc.id }, firstDoc.id),
        });
      }
    } catch (err) {
      checkAndTripQuota(err);
    }
  }

  // Fallback 3: synthesize from verified PRODUCT_GMC_METADATA so canonical product URLs never 404
  const fallback = buildFallbackProductFromGmcMeta(canonicalSlug);
  if (fallback) {
    return fallback as Product;
  }

  return null;
}

export async function getProducts(): Promise<Product[]> {
  let products: Product[] = [];
  const tombstones = await fetchDeletedCatalogIds();
  if (!isFirestoreQuotaExhausted()) {
    try {
      const snapshot = await getDocs(collection(db, 'products'));
      snapshot.forEach((doc) => {
        products.push({ ...doc.data(), id: doc.id } as Product);
      });
    } catch (err) {
      checkAndTripQuota(err);
    }
  }
  return mergeUnpersistedCatalogFallbacks(products, tombstones);
}

export async function addStockHistory(
  entry: Omit<StockHistoryEntry, 'id' | 'createdAt'>
): Promise<string> {
  const docRef = await addDoc(collection(db, 'stock_history'), {
    ...entry,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getStockHistory(
  productId: string,
  limitCount: number = 20
): Promise<StockHistoryEntry[]> {
  const q = query(
    collection(db, 'stock_history'),
    where('productId', '==', productId),
    orderBy('createdAt', 'desc'),
    firestoreLimit(limitCount)
  );
  const snapshot = await getDocs(q);
  const history: StockHistoryEntry[] = [];
  snapshot.forEach((doc) => {
    history.push({ id: doc.id, ...doc.data() } as StockHistoryEntry);
  });
  return history;
}

export async function updateStockWithHistory(
  productId: string,
  newStock: number,
  reason: string = 'manual_update',
  updatedBy: string = 'admin'
): Promise<void> {
  const product = await getProduct(productId);
  if (!product) throw new Error('Product not found');

  const previousStock = product.stockQuantity || 0;

  await updateProduct(productId, {
    stockQuantity: newStock,
  });

  await addStockHistory({
    productId,
    productName: product.productName,
    sku: product.sku,
    previousStock,
    newStock,
    change: newStock - previousStock,
    reason,
    updatedBy,
  });
}

export async function bulkUpdateStock(
  updates: { id: string; stockQuantity: number }[]
): Promise<void> {
  const promises = updates.map(async (update) => {
    const product = await getProduct(update.id);
    if (!product) return;

    const previousStock = product.stockQuantity || 0;
    
    await updateProduct(update.id, {
      stockQuantity: update.stockQuantity,
    });

    await addStockHistory({
      productId: update.id,
      productName: product.productName,
      sku: product.sku,
      previousStock,
      newStock: update.stockQuantity,
      change: update.stockQuantity - previousStock,
      reason: 'bulk_update',
      updatedBy: 'admin',
    });
  });
  await Promise.all(promises);
}

// ============================================
// HOMEPAGE FUNCTIONS
// ============================================

export interface HeroSlide {
  id?: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  imageUrl: string;
  mediaType: 'image' | 'video' | 'youtube';
  isActive: boolean;
  order: number;
  textAlignment: 'left' | 'center' | 'right';
  overlayOpacity: number; // 0-100
}

export interface Brand {
  id?: string;
  name: string;
  logoUrl: string;
  website: string;
  order: number;
}

export interface Testimonial {
  id?: string;
  name: string;
  designation: string;
  text: string;
  rating: number; // 1-5
  avatarUrl: string;
  order: number;
}

export interface HomepageData {
  heroSlides: HeroSlide[];
  brands: Brand[];
  testimonials: Testimonial[];
  stats: {
    yearsExperience: number;
    happyClients: number;
    projectsCompleted: number;
  };
  promoBanner: {
    headline: string;
    subheadline: string;
    ctaText: string;
    ctaLink: string;
    backgroundImageUrl: string;
    isActive: boolean;
  };
  seo?: {
    title: string;
    description: string;
    keywords: string;
  };
  updatedAt?: Timestamp;
}

// Get homepage data
function enrichHomepageData(data: HomepageData): HomepageData {
  if (data) {
    if (data.heroSlides) {
      data.heroSlides = data.heroSlides.map((slide, idx) => ({
        ...slide,
        id: slide.id || `slide-${idx}`,
      }));
    }
    if (data.brands) {
      data.brands = data.brands.map((brand, idx) => ({
        ...brand,
        id: brand.id || `brand-${idx}`,
      }));
    }
    if (data.testimonials) {
      data.testimonials = data.testimonials.map((t, idx) => ({
        ...t,
        id: t.id || `testimonial-${idx}`,
      }));
    }
  }
  return data;
}

export async function getHomepageData(): Promise<HomepageData | null> {
  if (isFirestoreQuotaExhausted()) return null;
  try {
    const docRef = doc(db, 'homepage', 'main');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return enrichHomepageData(docSnap.data() as HomepageData);
    }
    return null;
  } catch (err) {
    checkAndTripQuota(err);
    return null;
  }
}

// Subscribe to real-time homepage data
export function subscribeToHomepage(
  callback: (data: HomepageData | null) => void
): Unsubscribe {
  if (isFirestoreQuotaExhausted()) {
    callback(null);
    return () => {};
  }
  return onSnapshot(doc(db, 'homepage', 'main'), (docSnap) => {
    if (docSnap.exists()) {
      callback(enrichHomepageData(docSnap.data() as HomepageData));
    } else {
      callback(null);
    }
  }, (error) => {
    checkAndTripQuota(error);
    callback(null);
  });
}

// Update entire homepage
export async function updateHomepage(data: HomepageData): Promise<void> {
  const docRef = doc(db, 'homepage', 'main');
  await setDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

// ============================================
// HERO SLIDE OPERATIONS
// ============================================

// Add a hero slide
export async function addHeroSlide(
  slide: Omit<HeroSlide, 'id'>
): Promise<void> {
  const homepage = await getHomepageData();
  const slides = homepage?.heroSlides || [];
  const newSlide = {
    ...slide,
    id: uuidv4(),
  };
  slides.push(newSlide);
  await updateHomepage({
    ...homepage,
    heroSlides: slides,
  } as HomepageData);
}

// Update a hero slide
export async function updateHeroSlide(
  slideId: string,
  updates: Partial<HeroSlide>
): Promise<void> {
  const homepage = await getHomepageData();
  if (!homepage) return;
  const slides = homepage.heroSlides.map((slide) =>
    slide.id === slideId ? { ...slide, ...updates } : slide
  );
  await updateHomepage({
    ...homepage,
    heroSlides: slides,
  });
}

// Remove a hero slide
export async function removeHeroSlide(slideId: string): Promise<void> {
  const homepage = await getHomepageData();
  if (!homepage) return;
  const slides = homepage.heroSlides.filter((slide) => slide.id !== slideId);
  await updateHomepage({
    ...homepage,
    heroSlides: slides,
  });
}

// Reorder hero slides
export async function reorderHeroSlides(
  slideIds: string[]
): Promise<void> {
  const homepage = await getHomepageData();
  if (!homepage) return;
  const slides = slideIds.map((id, index) => {
    const slide = homepage.heroSlides.find((s) => s.id === id);
    return { ...slide, order: index + 1 };
  }) as HeroSlide[];
  await updateHomepage({
    ...homepage,
    heroSlides: slides,
  });
}

// ============================================
// BRAND OPERATIONS
// ============================================

export async function addBrand(brand: Omit<Brand, 'id'>): Promise<void> {
  const homepage = await getHomepageData();
  const brands = homepage?.brands || [];
  const newBrand = { ...brand, id: uuidv4() };
  brands.push(newBrand);
  await updateHomepage({
    ...homepage,
    brands: brands,
  } as HomepageData);
}

export async function updateBrand(
  brandId: string,
  updates: Partial<Brand>
): Promise<void> {
  const homepage = await getHomepageData();
  if (!homepage) return;
  const brands = homepage.brands.map((brand) =>
    brand.id === brandId ? { ...brand, ...updates } : brand
  );
  await updateHomepage({
    ...homepage,
    brands: brands,
  });
}

export async function removeBrand(brandId: string): Promise<void> {
  const homepage = await getHomepageData();
  if (!homepage) return;
  const brands = homepage.brands.filter((brand) => brand.id !== brandId);
  await updateHomepage({
    ...homepage,
    brands: brands,
  });
}

// ============================================
// TESTIMONIAL OPERATIONS
// ============================================

export async function addTestimonial(
  testimonial: Omit<Testimonial, 'id'>
): Promise<void> {
  const homepage = await getHomepageData();
  const testimonials = homepage?.testimonials || [];
  const newTestimonial = { ...testimonial, id: uuidv4() };
  testimonials.push(newTestimonial);
  await updateHomepage({
    ...homepage,
    testimonials: testimonials,
  } as HomepageData);
}

export async function updateTestimonial(
  testimonialId: string,
  updates: Partial<Testimonial>
): Promise<void> {
  const homepage = await getHomepageData();
  if (!homepage) return;
  const testimonials = homepage.testimonials.map((t) =>
    t.id === testimonialId ? { ...t, ...updates } : t
  );
  await updateHomepage({
    ...homepage,
    testimonials: testimonials,
  });
}

export async function removeTestimonial(testimonialId: string): Promise<void> {
  const homepage = await getHomepageData();
  if (!homepage) return;
  const testimonials = homepage.testimonials.filter((t) => t.id !== testimonialId);
  await updateHomepage({
    ...homepage,
    testimonials: testimonials,
  });
}

// ============================================
// STATS OPERATIONS
// ============================================

export async function updateStats(stats: {
  yearsExperience: number;
  happyClients: number;
  projectsCompleted: number;
}): Promise<void> {
  const homepage = await getHomepageData();
  if (!homepage) return;
  await updateHomepage({
    ...homepage,
    stats: stats,
  });
}

// ============================================
// PROMO BANNER OPERATIONS
// ============================================

export async function updatePromoBanner(promoBanner: HomepageData['promoBanner']): Promise<void> {
  const homepage = await getHomepageData();
  if (!homepage) return;
  await updateHomepage({
    ...homepage,
    promoBanner: promoBanner,
  });
}

// ============================================
// USER MANAGEMENT FUNCTIONS
// ============================================

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: 'admin' | 'editor' | 'support' | 'customer' | null;
  isActive: boolean;
  isBlocked?: boolean;
  phoneNumber?: string | null;
  photoURL?: string | null;
  createdAt?: Timestamp;
  lastLogin?: Timestamp;
}

export function subscribeToUsers(
  callback: (users: UserProfile[]) => void,
  filter?: { role?: UserProfile['role'] | 'staff' }
): Unsubscribe {
  if (isFirestoreQuotaExhausted()) {
    callback([]);
    return () => {};
  }
  let q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));

  if (filter?.role) {
    if (filter.role === 'staff') {
      q = query(q, where('role', 'in', ['admin', 'editor', 'support']));
    } else {
      q = query(q, where('role', '==', filter.role));
    }
  }

  return onSnapshot(q, (snapshot) => {
    const users: UserProfile[] = [];
    snapshot.forEach((doc) => {
      users.push({ ...doc.data() } as UserProfile);
    });
    callback(users);
  }, (error) => {
    checkAndTripQuota(error);
    callback([]);
  });
}

export async function updateUserProfile(
  uid: string,
  updates: Partial<UserProfile>
): Promise<void> {
  const headers = await getAuthHeader();
  const response = await fetch('/api/admin/users', {
    method: 'PUT',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ uid, ...updates }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update user profile');
  }
}

export async function deleteUserAccount(uid: string): Promise<void> {
  const headers = await getAuthHeader();
  const response = await fetch('/api/admin/users', {
    method: 'DELETE',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ uid }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete user account');
  }
}

export async function createStaffUser(data: {
  email: string;
  password: string;
  displayName: string;
  role: UserProfile['role'];
}): Promise<UserProfile> {
  const headers = await getAuthHeader();
  const response = await fetch('/api/admin/users', {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create staff user');
  }
  return response.json();
}

// ============================================
// CUSTOMER FUNCTIONS
// ============================================

export interface CustomerUser extends UserProfile {
  orders?: number;
  totalSpent?: number;
}

export async function getCustomers(): Promise<CustomerUser[]> {
  const headers = await getAuthHeader();
  const response = await fetch('/api/admin/customers', {
    method: 'GET',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch customers');
  }
  return response.json();
}

export async function toggleCustomerBlock(
  uid: string,
  isBlocked: boolean
): Promise<void> {
  const headers = await getAuthHeader();
  const response = await fetch('/api/admin/customers', {
    method: 'PUT',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ uid, isBlocked }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update customer status');
  }
}

export async function getCustomerOrders(uid: string): Promise<any[]> {
  const headers = await getAuthHeader();
  const response = await fetch(`/api/admin/customers?uid=${uid}`, {
    method: 'GET',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch customer orders');
  }
  return response.json();
}

// ============================================
// SETTINGS FUNCTIONS
// ============================================

export interface GeneralSettings {
  siteName: string;
  tagline: string;
  logoUrl: string;
  faviconUrl: string;
  contactEmail: string;
  phone: string;
  address: string;
  taxRate: number;
  socialLinks: {
    facebook: string;
    linkedin: string;
    youtube: string;
    instagram: string;
    twitter: string;
    tiktok?: string;
  };
  seo: {
    title: string;
    description: string;
    keywords: string;
    ogImage: string;
  };
  googleMerchantSheetUrl?: string;
  updatedAt?: Timestamp;
}

export async function getGeneralSettings(): Promise<GeneralSettings | null> {
  if (isFirestoreQuotaExhausted()) return null;
  try {
    const docRef = doc(db, 'settings', 'global');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as GeneralSettings;
    }
    return null;
  } catch (err) {
    checkAndTripQuota(err);
    return null;
  }
}

export function subscribeToGeneralSettings(
  callback: (data: GeneralSettings | null) => void
): Unsubscribe {
  if (isFirestoreQuotaExhausted()) {
    callback(null);
    return () => {};
  }
  return onSnapshot(doc(db, 'settings', 'global'), (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data() as GeneralSettings);
    } else {
      callback(null);
    }
  }, (error) => {
    checkAndTripQuota(error);
    callback(null);
  });
}

export async function updateGeneralSettings(
  data: Partial<GeneralSettings>
): Promise<void> {
  const docRef = doc(db, 'settings', 'global');
  await setDoc(
    docRef,
    {
      ...data,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export interface Service {
  id?: string;
  title: string;
  name?: string;
  slug: string;
  description: string;
  iconUrl: string;
  imageUrl: string;
  isActive: boolean;
  order: number;
  category?: string;
  type?: string;
  serviceType?: string;
  heroHeading?: string;
  detailedContent?: string;
  priceRange?: string;
  formFields?: any;
  seoTags?: string;
  seoMetaDescription?: string;
  imageAltText?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// ============================================
// ABOUT PAGE FUNCTIONS
// ============================================

export interface AboutData {
  heroHeading: string;
  heroSubheading: string;
  heroImageUrl: string;
  mission: string;
  vision: string;
  history: string;
  teamDescription: string;
  teamImages: string[];
  values: string[];
  stats: {
    yearsExperience: number;
    happyClients: number;
    projectsCompleted: number;
    teamMembers: number;
  };
  updatedAt?: Timestamp;
}

export async function getAboutData(): Promise<AboutData | null> {
  if (isFirestoreQuotaExhausted()) return null;
  try {
    const docRef = doc(db, 'about', 'main');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as AboutData;
    }
    return null;
  } catch (err) {
    checkAndTripQuota(err);
    return null;
  }
}

export function subscribeToAbout(
  callback: (data: AboutData | null) => void
): Unsubscribe {
  if (isFirestoreQuotaExhausted()) {
    callback(null);
    return () => {};
  }
  return onSnapshot(doc(db, 'about', 'main'), (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data() as AboutData);
    } else {
      callback(null);
    }
  }, (error) => {
    checkAndTripQuota(error);
    callback(null);
  });
}

export async function updateAboutData(data: Partial<AboutData>): Promise<void> {
  const docRef = doc(db, 'about', 'main');
  await setDoc(
    docRef,
    {
      ...data,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

// ============================================
// CONTACT PAGE FUNCTIONS
// ============================================

export interface ContactData {
  heroHeading: string;
  heroSubheading: string;
  heroImageUrl: string;
  address: string;
  phone: string;
  email: string;
  mapEmbedUrl: string;
  businessHours: {
    weekday: string;
    saturday: string;
    sunday: string;
  };
  socialLinks: {
    facebook: string;
    linkedin: string;
    youtube: string;
    instagram: string;
    twitter: string;
    tiktok?: string;
  };
  updatedAt?: Timestamp;
}

export async function getContactData(): Promise<ContactData | null> {
  if (isFirestoreQuotaExhausted()) return null;
  try {
    const docRef = doc(db, 'contact', 'main');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as ContactData;
    }
    return null;
  } catch (err) {
    checkAndTripQuota(err);
    return null;
  }
}

export function subscribeToContact(
  callback: (data: ContactData | null) => void
): Unsubscribe {
  if (isFirestoreQuotaExhausted()) {
    callback(null);
    return () => {};
  }
  return onSnapshot(doc(db, 'contact', 'main'), (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data() as ContactData);
    } else {
      callback(null);
    }
  }, (error) => {
    checkAndTripQuota(error);
    callback(null);
  });
}

export async function updateContactData(data: Partial<ContactData>): Promise<void> {
  const docRef = doc(db, 'contact', 'main');
  await setDoc(
    docRef,
    {
      ...data,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

// ============================================
// SERVICES PAGE FUNCTIONS
// ============================================

export interface ServicePageData {
  heroHeading: string;
  heroSubheading: string;
  heroImageUrl: string;
  introText: string;
  serviceIds: string[];
  ctaText: string;
  ctaLink: string;
  updatedAt?: Timestamp;
}

export async function getServicesPageData(): Promise<ServicePageData | null> {
  if (isFirestoreQuotaExhausted()) return null;
  try {
    const docRef = doc(db, 'services_page', 'main');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as ServicePageData;
    }
    return null;
  } catch (err) {
    checkAndTripQuota(err);
    return null;
  }
}

export function subscribeToServicesPage(
  callback: (data: ServicePageData | null) => void
): Unsubscribe {
  if (isFirestoreQuotaExhausted()) {
    callback(null);
    return () => {};
  }
  return onSnapshot(doc(db, 'services_page', 'main'), (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data() as ServicePageData);
    } else {
      callback(null);
    }
  }, (error) => {
    checkAndTripQuota(error);
    callback(null);
  });
}

export async function updateServicesPageData(
  data: Partial<ServicePageData>
): Promise<void> {
  const docRef = doc(db, 'services_page', 'main');
  await setDoc(
    docRef,
    {
      ...data,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}


export async function createService(service: Omit<Service, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'services'), {
    ...service,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateService(id: string, updates: Partial<Service>): Promise<void> {
  const docRef = doc(db, 'services', id);
  await updateDoc(docRef, { ...updates, updatedAt: serverTimestamp() });
}

export function subscribeToServices(
  callback: (services: Service[]) => void
): Unsubscribe {
  if (isFirestoreQuotaExhausted()) {
    callback(FALLBACK_SERVICES_CATALOG as Service[]);
    return () => {};
  }
  const q = query(collection(db, 'services'), orderBy('order', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const services: Service[] = [];
    snapshot.forEach((doc) => {
      services.push({ ...doc.data(), id: doc.id } as Service);
    });
    callback(services.length > 0 ? services : (FALLBACK_SERVICES_CATALOG as Service[]));
  }, (error) => {
    checkAndTripQuota(error);
    callback(FALLBACK_SERVICES_CATALOG as Service[]);
  });
}

export async function deleteService(id: string): Promise<void> {
  const docRef = doc(db, 'services', id);
  await deleteDoc(docRef);
}

export async function getAllServices(): Promise<Service[]> {
  if (isFirestoreQuotaExhausted()) {
    return FALLBACK_SERVICES_CATALOG as Service[];
  }
  try {
    const snapshot = await getDocs(
      query(collection(db, 'services'), orderBy('order', 'asc'))
    );
    const services: Service[] = [];
    snapshot.forEach((doc) => {
      services.push({ ...doc.data(), id: doc.id } as Service);
    });
    return services.length > 0 ? services : (FALLBACK_SERVICES_CATALOG as Service[]);
  } catch (err) {
    checkAndTripQuota(err);
    return FALLBACK_SERVICES_CATALOG as Service[];
  }
}

// ============================================
// PAGE CONTENT FUNCTIONS
// ============================================

export interface PageContent {
  id: string;
  title: string;
  subtitle?: string;
  sections: any[];
  updatedAt?: Timestamp;
}

export async function getPageContent(pageId: string): Promise<PageContent | null> {
  if (isFirestoreQuotaExhausted()) return null;
  try {
    const docRef = doc(db, 'page_contents', pageId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as PageContent;
    }
    return null;
  } catch (err) {
    checkAndTripQuota(err);
    return null;
  }
}

export function subscribeToPageContent(
  pageId: string,
  callback: (data: PageContent | null) => void
): Unsubscribe {
  if (isFirestoreQuotaExhausted()) {
    callback(null);
    return () => {};
  }
  return onSnapshot(doc(db, 'page_contents', pageId), (docSnap) => {
    if (docSnap.exists()) {
      callback({ id: docSnap.id, ...docSnap.data() } as PageContent);
    } else {
      callback(null);
    }
  }, (error) => {
    checkAndTripQuota(error);
    callback(null);
  });
}

export async function updatePageContent(pageId: string, data: Partial<PageContent>): Promise<void> {
  const docRef = doc(db, 'page_contents', pageId);
  await setDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

export interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  image: string;
  category: string;
  author: string;
  tags: string[];
  isPublished: boolean;
  publishedAt: string;
  updatedAt?: any;
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  if (isFirestoreQuotaExhausted()) return [];
  try {
    const q = query(collection(db, 'blog_posts'), orderBy('publishedAt', 'desc'));
    const snapshot = await getDocs(q);
    const posts: BlogPost[] = [];
    snapshot.forEach((doc) => {
      posts.push({ ...doc.data(), id: doc.id } as BlogPost);
    });
    return posts;
  } catch (err) {
    checkAndTripQuota(err);
    return [];
  }
}

export function subscribeToBlogPosts(callback: (posts: BlogPost[]) => void): Unsubscribe {
  if (isFirestoreQuotaExhausted()) {
    callback([]);
    return () => {};
  }
  const q = query(collection(db, 'blog_posts'), orderBy('publishedAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const posts: BlogPost[] = [];
    snapshot.forEach((doc) => {
      posts.push({ ...doc.data(), id: doc.id } as BlogPost);
    });
    callback(posts);
  }, (error) => {
    checkAndTripQuota(error);
    callback([]);
  });
}

// ============================================
// FACEBOOK PAGE INTEGRATION & POST AUDIT HELPERS
// ============================================

export interface FacebookSettings {
  connected: boolean;
  pageId: string;
  pageName: string;
  pageCategory?: string;
  pageLink?: string;
  pictureUrl?: string;
  fanCount?: number;
  connectionMethod: 'oauth' | 'token';
  pageAccessToken?: string;
  defaultHashtags?: string;
  autoIncludePrice?: boolean;
  connectedBy?: string;
  connectedAt?: string;
  updatedAt?: any;
}

export interface FacebookPostRecord {
  id?: string;
  pageId: string;
  pageName: string;
  itemType: 'product' | 'service' | 'custom';
  itemId: string;
  title: string;
  message: string;
  postFormat: 'photo' | 'link' | 'text';
  linkUrl: string;
  imageUrl: string;
  facebookPostId: string;
  permalinkUrl: string;
  status: 'published' | 'failed';
  errorMessage: string;
  publishedBy: string;
  createdAt?: any;
}

export async function getFacebookSettings(): Promise<FacebookSettings | null> {
  if (isFirestoreQuotaExhausted()) return null;
  const path = 'settings/facebook';
  try {
    const snap = await getDoc(doc(db, 'settings', 'facebook'));
    if (snap.exists()) {
      return snap.data() as FacebookSettings;
    }
    return null;
  } catch (err) {
    checkAndTripQuota(err);
    handleFirestoreError(err, OperationType.GET, path);
    return null;
  }
}

export async function saveFacebookSettings(data: FacebookSettings): Promise<void> {
  const path = 'settings/facebook';
  try {
    await setDoc(doc(db, 'settings', 'facebook'), {
      connected: Boolean(data.connected),
      pageId: String(data.pageId || '').slice(0, 64),
      pageName: String(data.pageName || '').slice(0, 200),
      pageCategory: String(data.pageCategory || 'Business').slice(0, 120),
      pageLink: String(data.pageLink || '').slice(0, 500),
      pictureUrl: String(data.pictureUrl || '').slice(0, 1000),
      fanCount: Number(data.fanCount || 0),
      connectionMethod: data.connectionMethod === 'oauth' ? 'oauth' : 'token',
      pageAccessToken: String(data.pageAccessToken || ''),
      defaultHashtags: String(data.defaultHashtags || '#AVLivePakistan #VideoConferencing #CorporateEvents').slice(0, 400),
      autoIncludePrice: data.autoIncludePrice !== false,
      connectedBy: String(data.connectedBy || auth.currentUser?.email || 'admin').slice(0, 200),
      connectedAt: data.connectedAt || new Date().toISOString(),
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (err) {
    checkAndTripQuota(err);
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function clearFacebookSettings(): Promise<void> {
  const path = 'settings/facebook';
  try {
    await setDoc(doc(db, 'settings', 'facebook'), {
      connected: false,
      pageId: '',
      pageName: '',
      pageCategory: '',
      pageLink: '',
      pictureUrl: '',
      fanCount: 0,
      connectionMethod: 'token',
      pageAccessToken: '',
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (err) {
    checkAndTripQuota(err);
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function createFacebookPostRecord(
  record: Omit<FacebookPostRecord, 'id' | 'createdAt'>
): Promise<string> {
  const postId = `fb_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const path = `facebook_posts/${postId}`;
  try {
    const payload = {
      pageId: String(record.pageId || '').slice(0, 64),
      pageName: String(record.pageName || 'Facebook Page').slice(0, 200),
      itemType: (['product', 'service', 'custom'].includes(record.itemType) ? record.itemType : 'custom') as 'product' | 'service' | 'custom',
      itemId: String(record.itemId || '').slice(0, 150),
      title: String(record.title || 'AV Live Update').slice(0, 300),
      message: String(record.message || '').slice(0, 5000),
      postFormat: (['photo', 'link', 'text'].includes(record.postFormat) ? record.postFormat : 'photo') as 'photo' | 'link' | 'text',
      linkUrl: String(record.linkUrl || '').slice(0, 500),
      imageUrl: String(record.imageUrl || '').slice(0, 1000),
      facebookPostId: String(record.facebookPostId || '').slice(0, 150),
      permalinkUrl: String(record.permalinkUrl || '').slice(0, 500),
      status: (record.status === 'failed' ? 'failed' : 'published') as 'published' | 'failed',
      errorMessage: String(record.errorMessage || '').slice(0, 500),
      publishedBy: String(record.publishedBy || auth.currentUser?.email || 'admin').slice(0, 200),
      createdAt: serverTimestamp(),
    };
    await setDoc(doc(db, 'facebook_posts', postId), payload);
    return postId;
  } catch (err) {
    checkAndTripQuota(err);
    handleFirestoreError(err, OperationType.CREATE, path);
    return '';
  }
}

export async function getFacebookPostRecords(): Promise<FacebookPostRecord[]> {
  if (isFirestoreQuotaExhausted()) return [];
  const path = 'facebook_posts';
  try {
    const q = query(collection(db, 'facebook_posts'), orderBy('createdAt', 'desc'), firestoreLimit(30));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as FacebookPostRecord));
  } catch (err) {
    checkAndTripQuota(err);
    handleFirestoreError(err, OperationType.LIST, path);
    return [];
  }
}

export async function deleteFacebookPostRecord(id: string): Promise<void> {
  const path = `facebook_posts/${id}`;
  try {
    await deleteDoc(doc(db, 'facebook_posts', id));
  } catch (err) {
    checkAndTripQuota(err);
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

/**
 * Idempotently syncs the LED TVs & Commercial Displays category and all 28 verified
 * Samsung & TCL TV SKUs into Firestore so admins can update prices, stock, and add
 * Horion commercial TVs directly from the Admin Panel.
 */
export async function syncLedTvCatalogToFirestore(): Promise<{
  categorySynced: boolean;
  productsSynced: number;
}> {
  const catPath = 'categories/led-tv-displays';
  try {
    await setDoc(
      doc(db, 'categories', 'led-tv-displays'),
      {
        name: 'LED TVs & Commercial Displays',
        slug: 'led-tv-displays',
        description:
          'Official Samsung Crystal UHD, TCL 4K Google TVs, and Horion 4K Interactive Flat Panels in Pakistan with verified PKR pricing, screen-size variants, and nationwide delivery.',
        imageUrl: '/images/products/tv-samsung-u8000f.webp',
        parentId: null,
        displayOrder: 5,
        isActive: true,
        isFeatured: true,
        type: 'product',
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    let synced = 0;
    for (const item of TV_CATALOG_ITEMS) {
      const docRef = doc(db, 'products', item.gmcId);
      const existingSnap = await getDoc(docRef);
      const existingData = existingSnap.exists() ? existingSnap.data() : null;
      await setDoc(
        docRef,
        {
          gmcId: item.gmcId,
          slug: item.slug,
          productName: item.title,
          sku: item.gmcId,
          gtin: item.gtin,
          mpn: item.mpn,
          identifierExists: item.identifierExists,
          brand: item.brand,
          size: item.size,
          itemGroupId: item.itemGroupId,
          modelSeries: item.modelSeries,
          typeKeyFeature: item.typeKeyFeature,
          priceNote: item.priceNote,
          availability: existingData?.availability || item.availability,
          condition: item.condition,
          priceCurrency: 'PKR',
          regularPrice: existingData?.regularPrice ?? item.regularPrice,
          salePrice: existingData?.salePrice ?? item.salePrice,
          stockQuantity: existingData?.stockQuantity ?? 12,
          lowStockThreshold: existingData?.lowStockThreshold ?? 2,
          images: item.images,
          image: item.images[0],
          additionalImages: item.images.slice(1),
          categoryIds: ['led-tv-displays'],
          categorySlugs: ['led-tv-displays'],
          googleProductCategory: item.googleProductCategory,
          productType: item.productType,
          customLabel0: item.customLabel0,
          customLabel1: item.customLabel1,
          customLabel2: item.customLabel2,
          customLabel3: item.customLabel3,
          customLabel4: item.customLabel4,
          shippingWeight: item.shippingWeight,
          shippingLength: item.shippingLength,
          shippingWidth: item.shippingWidth,
          shippingHeight: item.shippingHeight,
          returnPolicyLabel: item.returnPolicyLabel,
          isBundle: item.isBundle,
          shortDescription: item.shortSummary,
          description: item.defaultDescription,
          gmcDescription: item.gmcDescription,
          specifications: item.defaultSpecs,
          seoMetaDescription: item.seoMetaDescription,
          seoTags: item.seoTags,
          imageAltText: item.imageAltText,
          variations: existingData?.variations || [],
          isActive: existingData?.isActive !== undefined ? existingData.isActive : true,
          isFeatured: existingData?.isFeatured !== undefined ? existingData.isFeatured : false,
          ...(existingSnap.exists() ? {} : { createdAt: serverTimestamp() }),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      synced++;
    }

    return { categorySynced: true, productsSynced: synced };
  } catch (err) {
    checkAndTripQuota(err);
    handleFirestoreError(err, OperationType.WRITE, catPath);
    return { categorySynced: false, productsSynced: 0 };
  }
}


