import { Product } from './firebase/firestore-helpers';
import { getCanonicalProductSlug, PRODUCT_GMC_METADATA, resolveProductPricing } from './gmc-feed';

export type EbayListingTab = 'all' | 'sale' | 'bundles' | 'free-shipping';

export interface EbayFacetOption {
  id: string;
  label: string;
  shortLabel?: string;
}

export const EBAY_ROOM_SIZE_FACETS: EbayFacetOption[] = [
  { id: 'huddle-focus', label: 'Huddle & Focus Rooms (2–6 Pax)', shortLabel: 'Huddle / Focus Room' },
  { id: 'medium-room', label: 'Small to Medium Rooms (6–14 Pax)', shortLabel: 'Small–Medium Room' },
  { id: 'large-boardroom', label: 'Large Boardrooms & Auditoriums (14+ Pax)', shortLabel: 'Large Boardroom / Auditorium' },
  { id: 'personal-desk', label: 'Executive Desks & Workstations', shortLabel: 'Executive / Personal Desk' },
  { id: 'campus-venue', label: 'Venues, Stages & Facility Security', shortLabel: 'Venue / Stage / Facility' },
];

export const EBAY_FORM_FACTOR_FACETS: EbayFacetOption[] = [
  { id: 'video-bars', label: 'All-in-One Video Bars', shortLabel: 'Video Bars' },
  { id: 'room-kits', label: 'Integrated Room Systems & Kits', shortLabel: 'Room Systems & Kits' },
  { id: 'codecs', label: 'Boardroom Codecs & AI Engines', shortLabel: 'Boardroom Codecs' },
  { id: 'desk-touch', label: 'Touch Displays, Desk & Prompters', shortLabel: 'Desk & Touch Devices' },
  { id: 'ptz-cameras', label: 'PTZ & IP Security Cameras', shortLabel: 'PTZ & IP Cameras' },
  { id: 'ip-phones-pbx', label: 'IP Phones & VoIP PBX Systems', shortLabel: 'IP Phones & PBX' },
  { id: 'audio-headsets', label: 'Headsets, Speakerphones & PA', shortLabel: 'Headsets & Pro Audio' },
  { id: 'projectors-displays', label: '4K Laser Projectors & Displays', shortLabel: 'Laser Projectors' },
];

export const EBAY_PRICE_TIERS = [
  { id: 'all', label: 'Any Price', min: '', max: '' },
  { id: 'under-100k', label: 'Under Rs. 100,000', min: '', max: '100000' },
  { id: '100k-500k', label: 'Rs. 100,000 to Rs. 500,000', min: '100000', max: '500000' },
  { id: '500k-1.5m', label: 'Rs. 500,000 to Rs. 1,500,000', min: '500000', max: '1500000' },
  { id: 'over-1.5m', label: 'Over Rs. 1,500,000', min: '1500000', max: '' },
] as const;

export function getProductRoomSizeFacets(product: Product): string[] {
  const slug = getCanonicalProductSlug(product, product.id);
  const meta = PRODUCT_GMC_METADATA[slug] || (product.id ? PRODUCT_GMC_METADATA[product.id] : undefined);
  const label2 = (product.customLabel2 || meta?.customLabel2 || '').toLowerCase();
  const label3 = (product.customLabel3 || meta?.customLabel3 || '').toLowerCase();
  const name = (product.productName || '').toLowerCase();
  const specs = (product.specifications || meta?.defaultSpecs || '').toLowerCase();
  const cats = Array.isArray(product.categorySlugs)
    ? product.categorySlugs.map((c) => String(c).toLowerCase())
    : [];

  const matched = new Set<string>();

  if (
    label2.includes('huddle') ||
    label2.includes('focus') ||
    label3.includes('focus') ||
    name.includes('room bar cs-bar-t') ||
    name.includes('cisco room bar') && !name.includes('bar pro') ||
    name.includes('studio x32') ||
    name.includes('studio usb') ||
    name.includes('rally bar mini') ||
    specs.includes('huddle')
  ) {
    matched.add('huddle-focus');
  }

  if (
    label2.includes('medium') ||
    label2.includes('small-medium') ||
    label3.includes('conference-room') ||
    name.includes('room bar pro') ||
    (name.includes('room kit') && !name.includes('plus') && !name.includes('pro') && !name.includes('eq')) ||
    name.includes('studio x50') ||
    name.includes('studio x52') ||
    name.includes('studio v52') ||
    (name.includes('rally bar') && !name.includes('mini'))
  ) {
    matched.add('medium-room');
  }

  if (
    label2.includes('large') ||
    label3.includes('boardroom') ||
    label3.includes('auditorium') ||
    cats.includes('large-room') ||
    name.includes('codec pro') ||
    name.includes('kit pro') ||
    name.includes('kit plus') ||
    name.includes('codec eq') ||
    name.includes('kit eq') ||
    name.includes('studio x72') ||
    name.includes('g7500') ||
    name.includes('group 500')
  ) {
    matched.add('large-boardroom');
  }

  if (
    label2.includes('personal-desk') ||
    name.includes('desk pro') ||
    cats.includes('ip-phones') ||
    cats.includes('headsets')
  ) {
    matched.add('personal-desk');
  }

  if (
    cats.includes('projectors') ||
    cats.includes('ip-cameras') ||
    cats.includes('intercom-paging-access') ||
    slug.includes('prompter')
  ) {
    matched.add('campus-venue');
  }

  if (matched.size === 0) {
    if (cats.includes('video-conferencing')) matched.add('medium-room');
    else matched.add('personal-desk');
  }

  return Array.from(matched);
}

export function getProductFormFactorFacets(product: Product): string[] {
  const slug = getCanonicalProductSlug(product, product.id);
  const meta = PRODUCT_GMC_METADATA[slug] || (product.id ? PRODUCT_GMC_METADATA[product.id] : undefined);
  const pType = (product.productType || meta?.productType || '').toLowerCase();
  const name = (product.productName || '').toLowerCase();
  const cats = Array.isArray(product.categorySlugs)
    ? product.categorySlugs.map((c) => String(c).toLowerCase())
    : [];

  const matched = new Set<string>();

  if (
    pType.includes('video bars') ||
    name.includes('video bar') ||
    name.includes('room bar') ||
    name.includes('rally bar') ||
    name.includes('studio x32') ||
    name.includes('studio x50') ||
    name.includes('studio x52') ||
    name.includes('studio x72') ||
    name.includes('studio v52') ||
    name.includes('studio usb')
  ) {
    matched.add('video-bars');
  }

  if (
    pType.includes('room systems') ||
    name.includes('room kit') ||
    name.includes('group 500') ||
    product.isBundle === 'yes' ||
    meta?.isBundle === 'yes'
  ) {
    matched.add('room-kits');
  }

  if (
    pType.includes('codecs') ||
    name.includes('codec pro') ||
    name.includes('codec eq') ||
    name.includes('g7500') ||
    (cats.includes('boardroom-codecs') && !matched.has('video-bars'))
  ) {
    matched.add('codecs');
  }

  if (
    pType.includes('desk devices') ||
    name.includes('desk pro') ||
    name.includes('prompter') ||
    name.includes('horion') ||
    name.includes('google meet') ||
    cats.includes('touch-panels')
  ) {
    matched.add('desk-touch');
  }

  if (cats.includes('ptz-cameras') || cats.includes('ip-cameras') || name.includes('ptz')) {
    matched.add('ptz-cameras');
  }

  if (cats.includes('ip-phones') || cats.includes('voip-phone-systems')) {
    matched.add('ip-phones-pbx');
  }

  if (
    cats.includes('headsets') ||
    cats.includes('speakerphones') ||
    cats.includes('intercom-paging-access')
  ) {
    matched.add('audio-headsets');
  }

  if (cats.includes('projectors')) {
    matched.add('projectors-displays');
  }

  return Array.from(matched);
}

export function isProductBundleOrKit(product: Product): boolean {
  const slug = getCanonicalProductSlug(product, product.id);
  const meta = PRODUCT_GMC_METADATA[slug] || (product.id ? PRODUCT_GMC_METADATA[product.id] : undefined);
  const pType = (product.productType || meta?.productType || '').toLowerCase();
  const name = (product.productName || '').toLowerCase();
  return (
    product.isBundle === 'yes' ||
    meta?.isBundle === 'yes' ||
    pType.includes('room systems') ||
    name.includes('bundle') ||
    name.includes('room kit') ||
    name.includes('group 500')
  );
}

export function getProductListingBadges(product: Product): {
  mpn: string;
  gtin: string;
  productTypeLabel: string;
  roomLabel: string;
  isFreeShipping: boolean;
  isBundle: boolean;
  savingsAmount: number;
  savingsPercent: number;
} {
  const slug = getCanonicalProductSlug(product, product.id);
  const meta = PRODUCT_GMC_METADATA[slug] || (product.id ? PRODUCT_GMC_METADATA[product.id] : undefined);
  const { regularPrice, effectivePrice, hasSale } = resolveProductPricing(product);
  const savingsAmount = hasSale ? Math.max(0, regularPrice - effectivePrice) : 0;
  const savingsPercent = hasSale && regularPrice > 0 ? Math.round((savingsAmount / regularPrice) * 100) : 0;

  const rawType = product.productType || meta?.productType || '';
  const productTypeLabel = rawType.includes('>')
    ? rawType.split('>').pop()!.trim()
    : rawType || (product.categorySlugs?.[0] || 'Enterprise AV').replace(/-/g, ' ');

  const roomLabel = (product.customLabel2 || meta?.customLabel2 || product.customLabel3 || meta?.customLabel3 || '')
    .replace(/-/g, ' ')
    .trim();

  return {
    mpn: product.mpn || meta?.mpn || product.sku || '',
    gtin: product.gtin || meta?.gtin || '',
    productTypeLabel,
    roomLabel,
    isFreeShipping: effectivePrice >= 100000,
    isBundle: isProductBundleOrKit(product),
    savingsAmount,
    savingsPercent,
  };
}
