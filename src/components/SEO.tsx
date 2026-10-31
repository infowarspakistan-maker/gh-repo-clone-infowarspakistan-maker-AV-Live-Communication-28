import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

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
  const normalized = String(rawTitle || 'Video Conference | Event Management | AV Live')
    .replace(/^e-Sports\b/i, 'Esports')
    .replace(/\s+/g, ' ')
    .trim();
  const capitalized = normalized.replace(/^[a-z]/, c => c.toUpperCase());
  const withBrand = capitalized.includes('AV Live') ? capitalized : `${capitalized} | AV Live`;
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

export function clampSeoDescription(rawDesc: string, maxLen = 158): string {
  const clean = String(rawDesc || '')
    .replace(/\s+/g, ' ')
    .trim();
  if (clean.length <= maxLen) return clean;
  const sliced = clean.slice(0, maxLen - 1);
  const lastSpace = sliced.lastIndexOf(' ');
  const trimmed = (lastSpace > 80 ? sliced.slice(0, lastSpace) : sliced).replace(/[,:;|\-–—.\s]+$/, '');
  return `${trimmed}.`;
}

export function SEO({ 
  title = 'Video Conference | Event Management | AV Live', 
  description = "AV Live is Pakistan's premier Video Conference & Event Management company. Shop Poly, Logitech & Cisco AV or book 3D hologram & corporate events.",
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
  const clampedDescription = clampSeoDescription(description, 158);
  const absoluteUrl = toAbsoluteUrl(url || (typeof window !== 'undefined' ? window.location.pathname : '/'));
  const absoluteImage = toAbsoluteUrl(image, DEFAULT_IMAGE);
  const resolvedAlt = imageAlt || siteTitle;
  const robotsContent = noindex
    ? 'noindex, nofollow'
    : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.title = siteTitle;

    const isReactManaged = (node: Element) =>
      Object.keys(node).some((k) => k.startsWith('__react'));

    // Remove only leftover static SSR [data-rh="true"] tags that are NOT managed by React 19 HostHoistable fibers
    const cleanupStaticSsrTags = (selector: string) => {
      const nodes = Array.from(document.head.querySelectorAll(selector));
      const hasReactNode = nodes.some(isReactManaged);
      if (hasReactNode) {
        for (const node of nodes) {
          if (!isReactManaged(node) && node.parentNode) {
            node.parentNode.removeChild(node);
          }
        }
      } else if (nodes.length > 1) {
        for (let i = 1; i < nodes.length; i++) {
          if (!isReactManaged(nodes[i]) && nodes[i].parentNode) {
            nodes[i].parentNode.removeChild(nodes[i]);
          }
        }
      }
    };

    cleanupStaticSsrTags('title');
    cleanupStaticSsrTags('link[rel="canonical"]');
    cleanupStaticSsrTags('meta[property="og:url"]');
    cleanupStaticSsrTags('meta[property="og:title"]');
    cleanupStaticSsrTags('meta[property="og:description"]');
    cleanupStaticSsrTags('meta[property="og:image"]');
    cleanupStaticSsrTags('meta[property="og:type"]');
    cleanupStaticSsrTags('meta[property="og:site_name"]');
    cleanupStaticSsrTags('meta[property="og:locale"]');
    cleanupStaticSsrTags('meta[name="description"]');
    cleanupStaticSsrTags('meta[name="robots"]');
    cleanupStaticSsrTags('meta[name="twitter:card"]');
    cleanupStaticSsrTags('meta[name="twitter:title"]');
    cleanupStaticSsrTags('meta[name="twitter:description"]');
    cleanupStaticSsrTags('meta[name="twitter:image"]');
  }, [siteTitle, absoluteUrl, clampedDescription, robotsContent]);

  return (
    <Helmet htmlAttributes={{ lang: 'en', prefix: 'og: https://ogp.me/ns# fb: https://ogp.me/ns/fb#' }}>
      {/* Standard metadata */}
      <title data-rh="true">{siteTitle}</title>
      <meta data-rh="true" name="description" content={clampedDescription} />
      
      {/* Robots Directives */}
      {noindex ? (
        <meta data-rh="true" name="robots" content="noindex, nofollow" />
      ) : (
        <meta data-rh="true" name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      )}

      {/* Canonical Link */}
      <link data-rh="true" rel="canonical" href={absoluteUrl} />

      {/* Open Graph / Facebook / LinkedIn / WhatsApp / Meta AI */}
      <meta data-rh="true" property="og:site_name" content="AV Live Communications" />
      <meta data-rh="true" property="og:type" content={type} />
      <meta data-rh="true" property="og:url" content={absoluteUrl} />
      <meta data-rh="true" property="og:title" content={siteTitle} />
      <meta data-rh="true" property="og:description" content={clampedDescription} />
      <meta data-rh="true" property="og:image" content={absoluteImage} />
      <meta data-rh="true" property="og:image:secure_url" content={absoluteImage} />
      <meta data-rh="true" property="og:image:alt" content={resolvedAlt} />
      <meta data-rh="true" property="og:image:width" content={String(imageWidth)} />
      <meta data-rh="true" property="og:image:height" content={String(imageHeight)} />
      <meta data-rh="true" property="og:locale" content={locale} />
      <meta data-rh="true" property="og:locale:alternate" content="en_US" />

      {/* Product Open Graph Tags */}
      {type === 'product' && (
        <>
          {price !== undefined && price !== null && (
            <>
              <meta data-rh="true" property="product:price:amount" content={String(price)} />
              <meta data-rh="true" property="product:price:currency" content={currency} />
            </>
          )}
          {availability && <meta data-rh="true" property="product:availability" content={availability} />}
          {brand && <meta data-rh="true" property="product:brand" content={brand} />}
          {sku && <meta data-rh="true" property="product:retailer_item_id" content={sku} />}
          {mpn && <meta data-rh="true" property="product:mfr_part_no" content={mpn} />}
          {gtin && <meta data-rh="true" property="product:gtin" content={gtin} />}
          <meta data-rh="true" property="product:condition" content="new" />
        </>
      )}

      {/* Article / Blog Open Graph Tags */}
      {(type === 'article' || publishedTime) && (
        <>
          <meta data-rh="true" property="article:publisher" content="https://avlive.com.pk/#organization" />
          {author && <meta data-rh="true" property="article:author" content={author} />}
          {publishedTime && <meta data-rh="true" property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta data-rh="true" property="article:modified_time" content={modifiedTime} />}
          {section && <meta data-rh="true" property="article:section" content={section} />}
          {tags.map((tag, idx) => (
            <meta key={`og-tag-${idx}`} data-rh="true" property="article:tag" content={tag} />
          ))}
        </>
      )}

      {/* Twitter / X Meta Tags */}
      <meta data-rh="true" name="twitter:card" content="summary_large_image" />
      <meta data-rh="true" name="twitter:site" content="@avlivepk" />
      <meta data-rh="true" name="twitter:creator" content="@avlivepk" />
      <meta data-rh="true" name="twitter:domain" content="avlive.com.pk" />
      <meta data-rh="true" name="twitter:url" content={absoluteUrl} />
      <meta data-rh="true" name="twitter:title" content={siteTitle} />
      <meta data-rh="true" name="twitter:description" content={clampedDescription} />
      <meta data-rh="true" name="twitter:image" content={absoluteImage} />
      <meta data-rh="true" name="twitter:image:alt" content={resolvedAlt} />

      {/* Structured Data (JSON-LD) */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
}

