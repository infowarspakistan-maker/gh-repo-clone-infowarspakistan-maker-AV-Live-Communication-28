export type ImageOptimizationPreset = 'product' | 'hero' | 'project' | 'square' | 'editor';

export interface PresetDimensions {
  maxWidth: number;
  maxHeight: number;
  quality: number;
  maxTargetBytes: number;
  label: string;
}

export const IMAGE_PRESETS: Record<ImageOptimizationPreset, PresetDimensions> = {
  product: {
    maxWidth: 1200,
    maxHeight: 900,
    quality: 0.82,
    maxTargetBytes: 140 * 1024,
    label: 'Product Studio (1200×900 max, WebP + GMC JPG)',
  },
  hero: {
    maxWidth: 1600,
    maxHeight: 900,
    quality: 0.80,
    maxTargetBytes: 180 * 1024,
    label: 'Hero / Banner (1600×900 max, WebP)',
  },
  project: {
    maxWidth: 1400,
    maxHeight: 933,
    quality: 0.80,
    maxTargetBytes: 160 * 1024,
    label: 'Project / Event Showcase (1400×933 max, WebP)',
  },
  square: {
    maxWidth: 600,
    maxHeight: 600,
    quality: 0.84,
    maxTargetBytes: 80 * 1024,
    label: 'Brand Logo / Icon (600×600 max, WebP)',
  },
  editor: {
    maxWidth: 1200,
    maxHeight: 900,
    quality: 0.80,
    maxTargetBytes: 140 * 1024,
    label: 'Article / Spec Embed (1200×900 max, WebP)',
  },
};

export interface CompressedImageResult {
  seoSlug: string;
  webpFile: File;
  webpBase64: string;
  jpgFile?: File;
  jpgBase64?: string;
  previewUrl: string;
  originalBytes: number;
  optimizedBytes: number;
  jpgBytes?: number;
  savingsPercent: number;
  width: number;
  height: number;
}

export function toSeoImageSlug(rawName: string): string {
  const withoutExt = String(rawName || '')
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return (withoutExt || `avlive-media-${Date.now()}`).slice(0, 72);
}

export function formatFileSizeKb(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 KB';
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      const commaIdx = result.indexOf(',');
      resolve(commaIdx >= 0 ? result.slice(commaIdx + 1) : result);
    };
    reader.onerror = () => reject(new Error('Failed to encode compressed image'));
    reader.readAsDataURL(blob);
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, mimeType: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error(`Browser failed to encode ${mimeType}`));
          return;
        }
        resolve(blob);
      },
      mimeType,
      quality
    );
  });
}

async function decodeImageSource(file: File | Blob): Promise<{
  width: number;
  height: number;
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
  cleanup: () => void;
}> {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file);
      return {
        width: bitmap.width,
        height: bitmap.height,
        draw: (ctx, w, h) => ctx.drawImage(bitmap, 0, 0, w, h),
        cleanup: () => bitmap.close(),
      };
    } catch {
      // Fallback to HTMLImageElement
    }
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('Unable to decode selected image file'));
      el.src = objectUrl;
    });
    return {
      width: img.naturalWidth || img.width,
      height: img.naturalHeight || img.height,
      draw: (ctx, w, h) => ctx.drawImage(img, 0, 0, w, h),
      cleanup: () => URL.revokeObjectURL(objectUrl),
    };
  } catch (err) {
    URL.revokeObjectURL(objectUrl);
    throw err;
  }
}

/**
 * Compresses and downscales any image in the browser using Canvas WebP/JPEG encoding
 * before it is ever uploaded over the network, keeping site assets lightweight (< 140 KB).
 */
export async function compressImageFile(
  file: File,
  options?: {
    preset?: ImageOptimizationPreset;
    seoSlug?: string;
    includeGmcJpg?: boolean;
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
  }
): Promise<CompressedImageResult> {
  const presetConfig = IMAGE_PRESETS[options?.preset || 'product'];
  const maxWidth = options?.maxWidth || presetConfig.maxWidth;
  const maxHeight = options?.maxHeight || presetConfig.maxHeight;
  let quality = options?.quality ?? presetConfig.quality;
  const seoSlug = toSeoImageSlug(options?.seoSlug || file.name);

  const decoded = await decodeImageSource(file);
  try {
    const ratio = Math.min(maxWidth / decoded.width, maxHeight / decoded.height, 1);
    const targetWidth = Math.max(1, Math.round(decoded.width * ratio));
    const targetHeight = Math.max(1, Math.round(decoded.height * ratio));

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas 2D context unavailable');
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.clearRect(0, 0, targetWidth, targetHeight);
    decoded.draw(ctx, targetWidth, targetHeight);

    // Encode WebP and iteratively reduce quality slightly if above target byte budget
    let webpBlob = await canvasToBlob(canvas, 'image/webp', quality);
    while (webpBlob.size > presetConfig.maxTargetBytes && quality > 0.56) {
      quality = Math.max(0.55, Number((quality - 0.08).toFixed(2)));
      webpBlob = await canvasToBlob(canvas, 'image/webp', quality);
    }

    // If browser somehow lacks WebP encoder (returns PNG), keep JPEG fallback
    const actualExt = webpBlob.type === 'image/webp' ? 'webp' : 'jpg';
    if (actualExt === 'jpg') {
      webpBlob = await canvasToBlob(canvas, 'image/jpeg', 0.82);
    }

    const webpFile = new File([webpBlob], `${seoSlug}.${actualExt}`, {
      type: webpBlob.type || 'image/webp',
    });
    const webpBase64 = await blobToBase64(webpBlob);
    const previewUrl = URL.createObjectURL(webpBlob);

    let jpgFile: File | undefined;
    let jpgBase64: string | undefined;
    let jpgBytes: number | undefined;

    if (options?.includeGmcJpg) {
      // Paint clean white backdrop under transparent PNGs before saving JPEG for GMC feeds
      const jpgCanvas = document.createElement('canvas');
      jpgCanvas.width = targetWidth;
      jpgCanvas.height = targetHeight;
      const jpgCtx = jpgCanvas.getContext('2d');
      if (jpgCtx) {
        jpgCtx.fillStyle = '#FFFFFF';
        jpgCtx.fillRect(0, 0, targetWidth, targetHeight);
        jpgCtx.drawImage(canvas, 0, 0);
        const jpgBlob = await canvasToBlob(jpgCanvas, 'image/jpeg', 0.84);
        jpgFile = new File([jpgBlob], `${seoSlug}.jpg`, { type: 'image/jpeg' });
        jpgBase64 = await blobToBase64(jpgBlob);
        jpgBytes = jpgBlob.size;
      }
    }

    const originalBytes = file.size || webpBlob.size;
    const optimizedBytes = webpBlob.size;
    const savingsPercent =
      originalBytes > 0
        ? Math.max(0, Math.round(((originalBytes - optimizedBytes) / originalBytes) * 1000) / 10)
        : 0;

    return {
      seoSlug,
      webpFile,
      webpBase64,
      jpgFile,
      jpgBase64,
      previewUrl,
      originalBytes,
      optimizedBytes,
      jpgBytes,
      savingsPercent,
      width: targetWidth,
      height: targetHeight,
    };
  } finally {
    decoded.cleanup();
  }
}
