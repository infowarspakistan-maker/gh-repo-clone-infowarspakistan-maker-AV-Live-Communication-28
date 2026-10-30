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

export function SEO({ 
  title = 'Video Conference in Pakistan | Polycom Group 500 & Poly X70 | Corporate Event Management & Hologram Display | AV Live', 
  description = "Leading provider of Video Conference in Pakistan (Polycom Group 500, Poly X70, Cisco, Logitech) & Corporate Event Management, Hybrid Event Production, and 3D Hologram Display across Lahore, Karachi & Islamabad.",
  keywords = 'Video Conference in Pakistan, Video conference, Polycom Group 500, Poly X70, Event management, Corporate event management, hybrid event, Hologram Display, events, Conference room AV setup, Zoom meeting room setup Pakistan, Microsoft Teams room setup Pakistan, AV Live',
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
  const siteTitle = title.includes('AV Live') ? title : `${title} | AV Live`;
  const absoluteUrl = toAbsoluteUrl(url || (typeof window !== 'undefined' ? window.location.pathname : '/'));
  const absoluteImage = toAbsoluteUrl(image, DEFAULT_IMAGE);
  const resolvedAlt = imageAlt || siteTitle;
  const robotsContent = noindex
    ? 'noindex, nofollow'
    : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.title = siteTitle;

    const dedupeAndSet = (selector: string, attr: string, value: string) => {
      const nodes = document.querySelectorAll(selector);
      if (nodes.length > 0) {
        nodes[0].setAttribute(attr, value);
        for (let i = 1; i < nodes.length; i++) {
          nodes[i].remove();
        }
      }
    };

    dedupeAndSet('link[rel="canonical"]', 'href', absoluteUrl);
    dedupeAndSet('meta[property="og:url"]', 'content', absoluteUrl);
    dedupeAndSet('meta[name="description"]', 'content', description);
    dedupeAndSet('meta[name="robots"]', 'content', robotsContent);
  }, [siteTitle, absoluteUrl, description, robotsContent]);

  return (
    <Helmet htmlAttributes={{ lang: 'en', prefix: 'og: https://ogp.me/ns# fb: https://ogp.me/ns/fb#' }}>
      {/* Standard metadata */}
      <title>{siteTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Robots Directives */}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      )}

      {/* Canonical Link */}
      <link rel="canonical" href={absoluteUrl} />

      {/* Open Graph / Facebook / LinkedIn / WhatsApp / Meta AI */}
      <meta property="og:site_name" content="AV Live Communications" />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={absoluteUrl} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={absoluteImage} />
      <meta property="og:image:secure_url" content={absoluteImage} />
      <meta property="og:image:alt" content={resolvedAlt} />
      <meta property="og:image:width" content={String(imageWidth)} />
      <meta property="og:image:height" content={String(imageHeight)} />
      <meta property="og:locale" content={locale} />
      <meta property="og:locale:alternate" content="en_US" />

      {/* Product Open Graph Tags */}
      {type === 'product' && (
        <>
          {price !== undefined && price !== null && (
            <>
              <meta property="product:price:amount" content={String(price)} />
              <meta property="product:price:currency" content={currency} />
            </>
          )}
          {availability && <meta property="product:availability" content={availability} />}
          {brand && <meta property="product:brand" content={brand} />}
          {sku && <meta property="product:retailer_item_id" content={sku} />}
          {mpn && <meta property="product:mfr_part_no" content={mpn} />}
          {gtin && <meta property="product:gtin" content={gtin} />}
          <meta property="product:condition" content="new" />
        </>
      )}

      {/* Article / Blog Open Graph Tags */}
      {(type === 'article' || publishedTime) && (
        <>
          <meta property="article:publisher" content="https://avlive.com.pk/#organization" />
          {author && <meta property="article:author" content={author} />}
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          {section && <meta property="article:section" content={section} />}
          {tags.map((tag, idx) => (
            <meta key={`og-tag-${idx}`} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {/* Twitter / X Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@avlivepk" />
      <meta name="twitter:creator" content="@avlivepk" />
      <meta name="twitter:domain" content="avlive.com.pk" />
      <meta name="twitter:url" content={absoluteUrl} />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={absoluteImage} />
      <meta name="twitter:image:alt" content={resolvedAlt} />

      {/* Structured Data (JSON-LD) */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
}

