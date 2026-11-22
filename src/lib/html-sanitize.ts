/**
 * Shared rich-text HTML sanitizer & normalizer for CMS / Firestore HTML fragments.
 * Removes executable tags, event handler attributes, and unsafe URI schemes
 * while preserving safe formatting tags and whitelisted YouTube embeds.
 */
function decodeHtmlEntitiesForSchemeCheck(raw: string): string {
  return raw
    .replace(/&#x([0-9a-f]+);?/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#(\d+);?/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
    .replace(/&colon;/gi, ':')
    .replace(/[\u0000-\u0020]+/g, '');
}

function isSafeUrlValue(rawValue: string, attrName: string): boolean {
  const trimmed = rawValue.trim();
  if (!trimmed) return true;
  const decoded = decodeHtmlEntitiesForSchemeCheck(trimmed).toLowerCase();
  if (
    decoded.startsWith('javascript:') ||
    decoded.startsWith('vbscript:') ||
    decoded.startsWith('file:')
  ) {
    return false;
  }
  if (decoded.startsWith('data:')) {
    // Allow strictly raster image data URIs on src/poster; disallow data: in links or SVG/HTML payloads
    if (attrName.toLowerCase() === 'href' || attrName.toLowerCase() === 'cite') {
      return false;
    }
    return /^data:image\/(?:png|jpe?g|webp|gif);base64,/i.test(decoded);
  }
  return true;
}

const ALLOWED_IFRAME_SRC_RE = /^https:\/\/(?:www\.)?(?:youtube\.com|youtube-nocookie\.com)\/embed\/[a-zA-Z0-9_-]{6,}(?:\?[^"'\s<>]*)?$/i;

export function cleanRichTextHtml(rawHtml?: string | null): string {
  if (!rawHtml) return '';

  let sanitized = String(rawHtml)
    .replace(/(?:&nbsp;|\u00A0)+/gi, ' ')
    .replace(
      /\[www\.avlives\.com\]\(https?:\/\/www\.avlives\.com\)\.pk/gi,
      '<a href="https://avlive.com.pk" class="text-[#00B4D8] font-bold underline">www.avlive.com.pk</a>'
    )
    .replace(/https?:\/\/(?:www\.)?avlives\.com(?:\.pk)?/gi, 'https://avlive.com.pk')
    .replace(/www\.avlives\.com\.pk/gi, 'www.avlive.com.pk');

  // 1. Strip dangerous container elements along with their body content
  sanitized = sanitized.replace(
    /<\s*(script|style|object|embed|applet|noscript|template|svg|math|form|title)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi,
    ''
  );
  // 2. Strip dangerous standalone / unclosed void elements
  sanitized = sanitized.replace(
    /<\s*\/?\s*(script|style|object|embed|applet|noscript|template|svg|math|form|input|textarea|button|select|option|meta|link|base|frame|frameset)\b[^>]*>/gi,
    ''
  );

  // 3. Strictly filter <iframe> elements: permit only official YouTube / YouTube-Nocookie embeds
  sanitized = sanitized.replace(
    /<\s*iframe\b([^>]*)>[\s\S]*?(?:<\s*\/\s*iframe\s*>|$)/gi,
    (fullMatch, attrs: string) => {
      const srcMatch = attrs.match(/\bsrc\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
      const srcVal = (srcMatch?.[1] || srcMatch?.[2] || srcMatch?.[3] || '').trim();
      if (!ALLOWED_IFRAME_SRC_RE.test(srcVal)) {
        return '';
      }
      // Strip inline event handlers and srcdoc even on allowed YouTube iframes
      const cleanedAttrs = attrs
        .replace(/\s+on[a-z0-9_-]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
        .replace(/\s+srcdoc\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');
      return `<iframe${cleanedAttrs}></iframe>`;
    }
  );

  // 4. Strip inline event handlers, dangerous attributes, and unsafe URLs across remaining tags
  sanitized = sanitized.replace(/<([a-zA-Z][a-zA-Z0-9-]*)(\s+[^>]*)?>/g, (full, tagName: string, rawAttrs?: string) => {
    if (!rawAttrs) return `<${tagName}>`;

    let cleanedAttrs = rawAttrs
      // Remove inline event handlers (onClick, onError, onLoad, etc.)
      .replace(/\s+on[a-z0-9_-]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
      // Remove boolean/valueless on* attributes if malformed
      .replace(/\s+on[a-z0-9_-]+(?=\s|>|$)/gi, '')
      // Remove dangerous attributes
      .replace(/\s+(?:srcdoc|formaction|xlink:href|dynsrc|lowsrc|action)\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');

    // Validate href / src / poster / cite URI schemes
    cleanedAttrs = cleanedAttrs.replace(
      /\s+(href|src|poster|cite)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi,
      (attrMatch, attrName: string, dQuoted?: string, sQuoted?: string, unquoted?: string) => {
        const val = dQuoted ?? sQuoted ?? unquoted ?? '';
        if (!isSafeUrlValue(val, attrName)) {
          return ` ${attrName}="#"`;
        }
        return attrMatch;
      }
    );

    return `<${tagName}${cleanedAttrs}>`;
  });

  return sanitized.replace(/\s{2,}/g, ' ').trim();
}
