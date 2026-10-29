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
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    return pathOrUrl;
  }
  // Ensure the path is clean and prepended with the domain
  const cleanPath = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return `${DEFAULT_DOMAIN}${cleanPath}`;
}

export function SEO({ 
  title = 'Event Management Company Pakistan | Video Conferencing in Pakistan | 3D Hologram & Projection Mapping | AV Live', 
  description = "Pakistan's premier event management company & video conferencing provider. 3D hologram, projection mapping, conference room AV for Zoom & MS Teams. Lahore, Karachi, Islamabad.",
  keywords = 'Event management company Pakistan, Video conferencing in Pakistan, 3D hologram events Pakistan, Projection mapping Pakistan, Conference room AV setup, Zoom meeting room setup Pakistan, Microsoft Teams room setup Pakistan, Event production company Lahore, Corporate event management Karachi, Event equipment rental Islamabad, AV Live',
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

