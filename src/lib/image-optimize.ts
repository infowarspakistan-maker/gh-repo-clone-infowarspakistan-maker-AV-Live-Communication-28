export const DEFAULT_EXTERNAL_PRODUCT_IMAGE =
  'https://www.hp.com/content/dam/sites/worldwide/poly/video-conferencing/all-in-one/studio-x72/Hero_Banner_Desktop@2x.jpg';

/**
 * Normalizes an externally hosted image URL for direct rendering in an <img> tag:
 * - Rejects local filesystem paths (/images/...) so only direct external http(s) URLs are used.
 * - Converts Google Drive share links (/file/d/<ID>/view or ?id=<ID>) into direct image stream URLs.
 * - Converts Dropbox share links (?dl=0) into raw image stream URLs (?raw=1).
 * - Preserves external CDN query parameters and signatures untouched.
 */
const VERIFIED_LOCAL_IMAGE_PREFIX = /^\/images\/(products|projects|teleprompter|video-conference|uploads)\//i;

export function normalizeExternalImageUrl(rawUrl: string | undefined | null): string {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';

  // Allow verified local static /images/ assets and rewrite domain-prefixed URLs to relative paths for instant local serving
  if (
    trimmed.startsWith('https://avlive.com.pk/images/') ||
    trimmed.startsWith('http://avlive.com.pk/images/')
  ) {
    const rel = trimmed.replace(/^https?:\/\/avlive\.com\.pk/i, '');
    if (VERIFIED_LOCAL_IMAGE_PREFIX.test(rel) && !rel.includes('/avlive-')) {
      return rel;
    }
    return '';
  }

  if (VERIFIED_LOCAL_IMAGE_PREFIX.test(trimmed) && !trimmed.includes('/avlive-')) {
    return trimmed;
  }

  if (
    trimmed.startsWith('/') ||
    trimmed.startsWith('./') ||
    trimmed.startsWith('../')
  ) {
    return '';
  }

  if (!/^https?:\/\//i.test(trimmed)) {
    return '';
  }

  // Reject YouTube or Vimeo video links accidentally placed in image arrays
  if (/(?:youtube\.com|youtu\.be|vimeo\.com)\//i.test(trimmed)) {
    return '';
  }

  // Convert Google Drive file viewer links to direct <img>-compatible stream URLs
  const gdriveFileMatch = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i);
  if (gdriveFileMatch && gdriveFileMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${gdriveFileMatch[1]}`;
  }
  const gdriveIdMatch = trimmed.match(/drive\.google\.com\/(?:open|uc|thumbnail)\?[^#]*\bid=([a-zA-Z0-9_-]+)/i);
  if (gdriveIdMatch && gdriveIdMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${gdriveIdMatch[1]}`;
  }

  // Convert Dropbox preview links (?dl=0) to direct raw image links (?raw=1)
  if (trimmed.includes('dropbox.com/') && trimmed.includes('dl=0')) {
    return trimmed.replace('dl=0', 'raw=1');
  }

  return trimmed;
}

/**
 * Extracts a YouTube 11-character video ID from a watch, embed, shorts, or youtu.be URL.
 */
export function extractYoutubeVideoId(rawUrl: string | undefined | null): string | null {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const trimmed = rawUrl.trim();
  const match = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([a-zA-Z0-9_-]{11})/i
  );
  return match && match[1] ? match[1] : null;
}

/**
 * Extracts any YouTube or Vimeo video links stored inside a product's media array.
 */
export function extractVideoUrls(input: unknown): string[] {
  const rawList: string[] = [];
  if (Array.isArray(input)) {
    for (const item of input) {
      if (typeof item === 'string') rawList.push(item);
    }
  } else if (typeof input === 'string' && input.trim()) {
    rawList.push(...input.trim().split(/[\r\n,]+/));
  }
  const videos: string[] = [];
  for (const item of rawList) {
    const trimmed = item.trim();
    if (/^https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be|vimeo\.com)\//i.test(trimmed)) {
      if (!videos.includes(trimmed)) videos.push(trimmed);
    }
  }
  return videos;
}

/**
 * Extracts a clean array of direct external http(s) image URLs from an array or string.
 * Automatically splits accidentally concatenated URLs (e.g. "https://.../a.webphttps://.../b.webp")
 * and strips any local file paths.
 */
export function extractDirectImageUrls(input: unknown): string[] {
  const rawList: string[] = [];
  if (Array.isArray(input)) {
    for (const item of input) {
      if (typeof item === 'string') rawList.push(item);
    }
  } else if (typeof input === 'string' && input.trim()) {
    const str = input.trim();
    if (str.startsWith('[')) {
      try {
        const parsed = JSON.parse(str);
        if (Array.isArray(parsed)) {
          for (const item of parsed) {
            if (typeof item === 'string') rawList.push(item);
          }
        } else {
          rawList.push(str);
        }
      } catch {
        rawList.push(...str.split(/[\r\n,]+/));
      }
    } else {
      rawList.push(...str.split(/[\r\n]+/));
    }
  }

  const results: string[] = [];
  const seen = new Set<string>();

  for (const entry of rawList) {
    // Split accidentally concatenated http(s):// URLs on the same line
    const segments = entry
      .split(/(?=https?:\/\/)/i)
      .map((s) => s.trim())
      .filter(Boolean);

    for (const seg of segments) {
      const normalized = normalizeExternalImageUrl(seg);
      if (normalized && !seen.has(normalized)) {
        seen.add(normalized);
        results.push(normalized);
      }
    }
  }

  return results;
}

/**
 * Optimizes image URLs for Core Web Vitals while preserving direct external image host URLs untouched.
 * Never returns a local file path.
 */
export function optimizeGalleryImageUrl(
  rawUrl: string | undefined | null,
  width = 480,
  quality = 75
): string {
  const externalUrl = normalizeExternalImageUrl(rawUrl);
  if (!externalUrl) {
    return DEFAULT_EXTERNAL_PRODUCT_IMAGE;
  }

  if (!externalUrl.includes('images.unsplash.com')) {
    return externalUrl;
  }

  try {
    const parsed = new URL(externalUrl);
    parsed.searchParams.set('auto', 'format');
    parsed.searchParams.set('fit', 'crop');
    parsed.searchParams.set('w', String(width));
    parsed.searchParams.set('q', String(quality));
    return parsed.toString();
  } catch {
    return externalUrl;
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

