import { useEffect, useLayoutEffect } from 'react';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  imageAlt?: string;
  imageWidth?: string | number;
  imageHeight?: string | number;
  url?: string;
  type?: 'website' | 'article' | 'product' | 'profile' | string;
  price?: number | string;
  currency?: string;
  availability?: string;
  brand?: string;
  sku?: string;
  gtin?: string;
  mpn?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  schema?: Record<string, any> | Record<string, any>[];
  noindex?: boolean;
  locale?: string;
}

const DEFAULT_DOMAIN = 'https://avlive.com.pk';
const DEFAULT_IMAGE = 'https://avlive.com.pk/og-image.jpg';

function toAbsoluteUrl(pathOrUrl?: string, defaultFallback: string = DEFAULT_DOMAIN): string {
  if (!pathOrUrl) return defaultFallback;
  let fullUrl = pathOrUrl;
  if (!pathOrUrl.startsWith('http://') && !pathOrUrl.startsWith('https://')) {
    const cleanPath = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
    fullUrl = `${DEFAULT_DOMAIN}${cleanPath}`;
  }
  // Strip query parameters and trailing slash (except root domain) for strict canonical deduplication
  const withoutQuery = fullUrl.split('?')[0].split('#')[0];
  if (withoutQuery.length > DEFAULT_DOMAIN.length + 1 && withoutQuery.endsWith('/')) {
    return withoutQuery.slice(0, -1);
  }
  return withoutQuery;
}

export function clampSeoTitle(rawTitle: string, maxLen = 65): string {
  const normalized = String(rawTitle || 'Video Conference in Pakistan | Event Management | AV Live')
    .replace(/^e-Sports\b/i, 'Esports')
    .replace(/\s+/g, ' ')
    .trim();
  const capitalized = normalized.replace(/^[a-z]/, c => c.toUpperCase());
  let withBrand = capitalized.includes('AV Live') ? capitalized : `${capitalized} | AV Live`;
  if (withBrand.length < 50 && !/pakistan/i.test(withBrand)) {
    withBrand = withBrand.replace(/\s*\|\s*AV Live$/i, ' in Pakistan | AV Live');
  }
  if (withBrand.length < 50) {
    withBrand = withBrand.replace(/\s*\|\s*AV Live$/i, ' — Enterprise AV | AV Live');
  }
  if (withBrand.length <= maxLen) return withBrand;

  const core = capitalized.replace(/\s*\|\s*AV Live(?:\s+[^\s|]+)*$/i, '').trim();
  const suffix = ' | AV Live';
  const budget = maxLen - suffix.length;
  if (core.length <= budget) return `${core}${suffix}`;

  const segments = core.split(/\s+[|—–-]\s+/);
  if (segments.length > 1 && segments[0].length <= budget && segments[0].length >= 18) {
    return `${segments[0].trim()}${suffix}`;
  }

  const sliced = core.slice(0, budget);
  const lastSpace = sliced.lastIndexOf(' ');
  const cleanCore = (lastSpace > 20 ? sliced.slice(0, lastSpace) : sliced).replace(/[,:;|\-–—\s]+$/, '');
  return `${cleanCore}${suffix}`;
}

export function clampSeoDescription(rawDesc: string, maxLen = 128): string {
  let clean = String(rawDesc || '')
    .replace(/\s+/g, ' ')
    .trim();
  if (clean.length > 0 && clean.length < 100) {
    clean = `${clean.replace(/\.$/, '')} — Authorized AV Live Pakistan warranty & PKR pricing.`;
  }
  if (clean.length <= maxLen) return clean;
  const sliced = clean.slice(0, maxLen - 1);
  const lastSpace = sliced.lastIndexOf(' ');
  const trimmed = (lastSpace > 75 ? sliced.slice(0, lastSpace) : sliced).replace(/[,:;|\-–—.\s]+$/, '');
  return `${trimmed}.`;
}

export function SEO({ 
  title = 'Video Conference in Pakistan | Event Management | AV Live', 
  description = 'Video Conference in Pakistan, Corporate Event Management by AV Live: Poly X70, Cisco Room Kit, 3D Hologram Display price PKR.',
  image = DEFAULT_IMAGE,
  imageAlt,
  imageWidth = 1200,
  imageHeight = 630,
  url,
  type = 'website',
  price,
  currency = 'PKR',
  availability,
  brand,
  sku,
  gtin,
  mpn,
  author = 'AV Live Communications',
  publishedTime,
  modifiedTime,
  section,
  tags = [],
  schema,
  noindex = false,
  locale = 'en_PK'
}: SEOProps) {
  const siteTitle = clampSeoTitle(title, 65);
  const clampedDescription = clampSeoDescription(description, 128);
  const absoluteUrl = toAbsoluteUrl(url || (typeof window !== 'undefined' ? window.location.pathname : '/'));
  const absoluteImage = toAbsoluteUrl(image, DEFAULT_IMAGE);
  const resolvedAlt = imageAlt || siteTitle;
  const robotsContent = noindex
    ? 'noindex, nofollow'
    : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

  const schemaKey = schema ? JSON.stringify(schema) : '';
  const tagsKey = Array.isArray(tags) ? tags.join('|') : '';

  useIsomorphicLayoutEffect(() => {
    if (typeof document === 'undefined' || !document.head) return;

    const htmlEl = document.documentElement;
    if (htmlEl) {
      if (htmlEl.getAttribute('lang') !== 'en') htmlEl.setAttribute('lang', 'en');
      if (htmlEl.getAttribute('prefix') !== 'og: https://ogp.me/ns# fb: https://ogp.me/ns/fb#') {
        htmlEl.setAttribute('prefix', 'og: https://ogp.me/ns# fb: https://ogp.me/ns/fb#');
      }
    }

    // 1. Single <title data-rh="true">
    document.title = siteTitle;
    const titleNodes = Array.from(document.head.querySelectorAll('title'));
    if (titleNodes.length === 0) {
      const titleEl = document.createElement('title');
      titleEl.setAttribute('data-rh', 'true');
      titleEl.textContent = siteTitle;
      document.head.insertBefore(titleEl, document.head.firstChild);
    } else {
      titleNodes[0].setAttribute('data-rh', 'true');
      if (titleNodes[0].textContent !== siteTitle) {
        titleNodes[0].textContent = siteTitle;
      }
      for (let i = 1; i < titleNodes.length; i++) {
        titleNodes[i].parentNode?.removeChild(titleNodes[i]);
      }
    }

    // 2. Single self-referencing <link rel="canonical" data-rh="true">
    const canonicalNodes = Array.from(document.head.querySelectorAll('link[rel="canonical"]'));
    if (canonicalNodes.length === 0) {
      const linkEl = document.createElement('link');
      linkEl.setAttribute('data-rh', 'true');
      linkEl.setAttribute('rel', 'canonical');
      linkEl.setAttribute('href', absoluteUrl);
      document.head.appendChild(linkEl);
    } else {
      canonicalNodes[0].setAttribute('data-rh', 'true');
      canonicalNodes[0].setAttribute('href', absoluteUrl);
      for (let i = 1; i < canonicalNodes.length; i++) {
        canonicalNodes[i].parentNode?.removeChild(canonicalNodes[i]);
      }
    }

    // 3. Synchronize all <meta data-rh="true"> entries in-place
    const desiredMetas: Array<{ attr: 'name' | 'property'; key: string; content: string }> = [
      { attr: 'name', key: 'description', content: clampedDescription },
      { attr: 'name', key: 'robots', content: robotsContent },
      { attr: 'property', key: 'og:site_name', content: 'AV Live Communications' },
      { attr: 'property', key: 'og:type', content: type },
      { attr: 'property', key: 'og:url', content: absoluteUrl },
      { attr: 'property', key: 'og:title', content: siteTitle },
      { attr: 'property', key: 'og:description', content: clampedDescription },
      { attr: 'property', key: 'og:image', content: absoluteImage },
      { attr: 'property', key: 'og:image:secure_url', content: absoluteImage },
      { attr: 'property', key: 'og:image:alt', content: resolvedAlt },
      { attr: 'property', key: 'og:image:width', content: String(imageWidth) },
      { attr: 'property', key: 'og:image:height', content: String(imageHeight) },
      { attr: 'property', key: 'og:locale', content: locale },
      { attr: 'property', key: 'og:locale:alternate', content: 'en_US' },
      { attr: 'name', key: 'twitter:card', content: 'summary_large_image' },
      { attr: 'name', key: 'twitter:site', content: '@avlivepk' },
      { attr: 'name', key: 'twitter:creator', content: '@avlivepk' },
      { attr: 'name', key: 'twitter:domain', content: 'avlive.com.pk' },
      { attr: 'name', key: 'twitter:url', content: absoluteUrl },
      { attr: 'name', key: 'twitter:title', content: siteTitle },
      { attr: 'name', key: 'twitter:description', content: clampedDescription },
      { attr: 'name', key: 'twitter:image', content: absoluteImage },
      { attr: 'name', key: 'twitter:image:alt', content: resolvedAlt },
    ];

    if (type === 'product') {
      if (price !== undefined && price !== null) {
        desiredMetas.push({ attr: 'property', key: 'product:price:amount', content: String(price) });
        desiredMetas.push({ attr: 'property', key: 'product:price:currency', content: currency });
      }
      if (availability) desiredMetas.push({ attr: 'property', key: 'product:availability', content: availability });
      if (brand) desiredMetas.push({ attr: 'property', key: 'product:brand', content: brand });
      if (sku) desiredMetas.push({ attr: 'property', key: 'product:retailer_item_id', content: sku });
      if (mpn) desiredMetas.push({ attr: 'property', key: 'product:mfr_part_no', content: mpn });
      if (gtin) desiredMetas.push({ attr: 'property', key: 'product:gtin', content: gtin });
      desiredMetas.push({ attr: 'property', key: 'product:condition', content: 'new' });
    }

    if (type === 'article' || publishedTime) {
      desiredMetas.push({ attr: 'property', key: 'article:publisher', content: 'https://avlive.com.pk/#organization' });
      if (author) desiredMetas.push({ attr: 'property', key: 'article:author', content: author });
      if (publishedTime) desiredMetas.push({ attr: 'property', key: 'article:published_time', content: publishedTime });
      if (modifiedTime) desiredMetas.push({ attr: 'property', key: 'article:modified_time', content: modifiedTime });
      if (section) desiredMetas.push({ attr: 'property', key: 'article:section', content: section });
      for (const tag of tags) {
        if (tag) desiredMetas.push({ attr: 'property', key: 'article:tag', content: tag });
      }
    }

    const keptMetaNodes = new Set<Element>();
    for (const item of desiredMetas) {
      const selector =
        item.key === 'article:tag'
          ? `meta[${item.attr}="${item.key}"][content="${CSS.escape(item.content)}"]`
          : `meta[${item.attr}="${item.key}"]`;
      const matches = Array.from(document.head.querySelectorAll(selector));
      if (matches.length > 0) {
        const primary = matches[0];
        primary.setAttribute('data-rh', 'true');
        primary.setAttribute('content', item.content);
        keptMetaNodes.add(primary);
        for (let i = 1; i < matches.length; i++) {
          matches[i].parentNode?.removeChild(matches[i]);
        }
      } else {
        const metaEl = document.createElement('meta');
        metaEl.setAttribute('data-rh', 'true');
        metaEl.setAttribute(item.attr, item.key);
        metaEl.setAttribute('content', item.content);
        document.head.appendChild(metaEl);
        keptMetaNodes.add(metaEl);
      }
    }

    // Remove stale [data-rh="true"] meta tags from previous route transitions
    const allRhMetas = Array.from(document.head.querySelectorAll('meta[data-rh="true"]'));
    for (const node of allRhMetas) {
      if (!keptMetaNodes.has(node)) {
        node.parentNode?.removeChild(node);
      }
    }

    // 4. Synchronize JSON-LD structured data without duplicate Product/Organization nodes
    if (schemaKey) {
      const ssrJsonLdNodes = document.head.querySelectorAll('#ssr-route-schema, #ssr-home-schema');
      ssrJsonLdNodes.forEach((node) => {
        node.parentNode?.removeChild(node);
      });
      let scriptEl = document.head.querySelector('script#rh-seo-schema[type="application/ld+json"]') as HTMLScriptElement | null;
      if (!scriptEl) {
        scriptEl = document.createElement('script');
        scriptEl.id = 'rh-seo-schema';
        scriptEl.type = 'application/ld+json';
        scriptEl.setAttribute('data-rh', 'true');
        document.head.appendChild(scriptEl);
      }
      if (scriptEl.textContent !== schemaKey) {
        scriptEl.textContent = schemaKey;
      }
    }
  }, [
    siteTitle,
    clampedDescription,
    robotsContent,
    absoluteUrl,
    absoluteImage,
    resolvedAlt,
    imageWidth,
    imageHeight,
    locale,
    type,
    price,
    currency,
    availability,
    brand,
    sku,
    mpn,
    gtin,
    author,
    publishedTime,
    modifiedTime,
    section,
    tagsKey,
    schemaKey,
  ]);

  return null;
}


