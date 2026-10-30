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
