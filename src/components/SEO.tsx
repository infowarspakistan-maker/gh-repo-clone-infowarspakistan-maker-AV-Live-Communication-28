import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  schema?: Record<string, any> | Record<string, any>[];
  noindex?: boolean;
}

export function SEO({ 
  title = 'AV Live Communications | Pro AV Solutions in Pakistan', 
  description = 'AV Live Communications is Pakistan\'s leading provider of professional AV solutions, IP phones, video conferencing, and specialized hardware. Quality hardware, expert deployments.',
  keywords = 'AV solutions, IP phones, video conferencing, Pakistan AV, professional audio visual, Polycom Pakistan, Cisco IP phones, Grandstream Pakistan',
  image = 'https://avlive.com.pk/og-image.jpg',
  url = 'https://avlive.com.pk',
  type = 'website',
  schema,
  noindex = false
}: SEOProps) {
  const siteTitle = title.includes('AV Live') ? title : `${title} | AV Live Communications`;

  return (
    <Helmet htmlAttributes={{ lang: 'en' }}>
      {/* Standard metadata */}
      <title>{siteTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Robots Tag - New SEO Policy Standards */}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      )}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="AV Live Communications" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Canonical */}
      <link rel="canonical" href={url} />

      {/* Structured Data (JSON-LD) */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
}
