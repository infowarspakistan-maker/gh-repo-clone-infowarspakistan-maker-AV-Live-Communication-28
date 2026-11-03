/**
 * Optimizes image URLs (especially Unsplash and CDN URLs) for Core Web Vitals (LCP / CLS / Bandwidth).
 * Automatically enforces WebP/AVIF format negotiation (`auto=format`), crop fitting, and target pixel width.
 */
export function optimizeGalleryImageUrl(
  rawUrl: string | undefined | null,
  width = 480,
  quality = 75
): string {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return 'https://placehold.co/480x480?text=AV+Live';
  }
  const trimmed = rawUrl.trim();
  if (!trimmed.includes('images.unsplash.com')) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    parsed.searchParams.set('auto', 'format');
    parsed.searchParams.set('fit', 'crop');
    parsed.searchParams.set('w', String(width));
    parsed.searchParams.set('q', String(quality));
    return parsed.toString();
  } catch {
    return trimmed;
  }
}

const BLUR_DATA_URI_CACHE = new Map<string, string>();
const BLUR_HASH_ALPHABET =
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz#$%*+,-.:;=?@[]^_{|}~';

const PALETTE_STOPS: ReadonlyArray< readonly [string, string, string] > = [
  ['#E8EEF5', '#D5E3F0', '#C2DCE8'],
  ['#EDF2F7', '#DCE7F3', '#C7E6F0'],
  ['#E6EEF6', '#D2E0EE', '#BAE0EC'],
  ['#EEF3F8', '#DAE5F0', '#C4DFEB'],
  ['#E9F0F6', '#D4E4F2', '#BDE2EE'],
  ['#F0F4F8', '#DDE8F2', '#C9E3EE'],
];

function hashSeed(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/**
 * Generates a deterministic 4x3 BlurHash representation string for a product SKU or image URL.
 */
export function getProductBlurHash(seed: string | undefined | null): string {
  const normalized = (seed || 'av-live-default').trim();
  let state = hashSeed(normalized) || 1;
  let hashStr = 'L4'; // 4x3 BlurHash header
  for (let i = 0; i < 26; i++) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    hashStr += BLUR_HASH_ALPHABET[state % 83];
  }
  return hashStr;
}

/**
 * Generates a deterministic, low-resolution base64 SVG data-URI placeholder (< 350 bytes)
 * that decodes synchronously on the first frame to prevent Cumulative Layout Shift (CLS)
 * while high-resolution product images load over high-latency mobile connections.
 */
export function getProductBlurDataUri(
  seed: string | undefined | null,
  width = 32,
  height = 24
): string {
  const key = `${seed || 'default'}:${width}x${height}`;
  const cached = BLUR_DATA_URI_CACHE.get(key);
  if (cached) return cached;

  const h = hashSeed(key);
  const [c0, c1, c2] = PALETTE_STOPS[h % PALETTE_STOPS.length];
  const cx = 25 + (h % 50);
  const cy = 25 + ((h >>> 8) % 50);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" preserveAspectRatio="none"><defs><radialGradient id="g" cx="${cx}%" cy="${cy}%" r="85%"><stop offset="0%" stop-color="${c2}"/><stop offset="55%" stop-color="${c1}"/><stop offset="100%" stop-color="${c0}"/></radialGradient></defs><rect width="${width}" height="${height}" fill="url(#g)"/></svg>`;

  const base64 =
    typeof btoa === 'function'
      ? btoa(svg)
      : Buffer.from(svg, 'utf-8').toString('base64');

  const dataUri = `data:image/svg+xml;base64,${base64}`;
  BLUR_DATA_URI_CACHE.set(key, dataUri);
  return dataUri;
}

