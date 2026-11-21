export interface ImageSeoMetadata {
  title: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
}

export interface ImageObjectSchemaInput {
  url: string;
  title: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
}

const SITE_ORIGIN = 'https://avlive.com.pk';

export function toAbsoluteImageUrl(rawUrl: string): string {
  if (!rawUrl) return `${SITE_ORIGIN}/images/projects/world-bank-president-stage.webp`;
  if (/^https?:\/\//i.test(rawUrl)) return rawUrl;
  return `${SITE_ORIGIN}${rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`}`;
}

/**
 * Generates a Schema.org ImageObject JSON-LD node with full SEO title, alt description,
 * caption, intrinsic dimensions, and publisher attribution.
 */
export function buildImageObjectSchema(input: ImageObjectSchemaInput): Record<string, any> {
  const absUrl = toAbsoluteImageUrl(input.url);
  return {
    '@type': 'ImageObject',
    url: absUrl,
    contentUrl: absUrl,
    name: input.title,
    description: input.alt,
    caption: input.caption || input.alt,
    ...(input.width ? { width: input.width } : {}),
    ...(input.height ? { height: input.height } : {}),
    creditText: 'AV Live Communications Pakistan',
    creator: {
      '@type': 'Organization',
      name: 'AV Live Communications',
      url: SITE_ORIGIN,
    },
  };
}

/**
 * Canonical SEO filenames, HTML title attributes, and rich descriptive alt briefs
 * for all 11 Fold-Flat Stealth Podium Teleprompter visual plates.
 */
export const TELEPROMPTER_SLIDE_LEGACY_MAP: Record<string, string> = {
  'slide-01': 'avlive-fold-flat-podium-teleprompter-stage-overview',
  'slide-02': 'avlive-400-nit-privacy-ips-beam-splitter-teleprompter',
  'slide-03': 'avlive-teleprompter-speaker-clarity-vs-audience-stealth',
  'slide-04': 'avlive-teleprompter-3-layer-optical-stack-baffle',
  'slide-05': 'avlive-teleprompter-70-degree-micro-hinge-ergonomics',
  'slide-06': 'avlive-fold-flat-unibody-aluminium-chassis-dimensions',
  'slide-07': 'avlive-podium-teleprompter-keynote-broadcast-deployments',
  'slide-08': 'avlive-teleprompter-standard-hdmi-vs-standalone-smart',
  'slide-09': 'avlive-teleprompter-cnc-eva-aluminium-flight-case',
  'slide-10': 'avlive-podium-teleprompter-pakistan-pkr-pricing-qa',
  'slide-11': 'avlive-podium-teleprompter-specs-contact-pakistan',
};

export interface TeleprompterSlideSeo {
  slug: string;
  src: string;
  jpgSrc: string;
  label: string;
  title: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
}

export const TELEPROMPTER_SLIDES_SEO: TeleprompterSlideSeo[] = [
  {
    slug: 'avlive-fold-flat-podium-teleprompter-stage-overview',
    src: '/images/teleprompter/avlive-fold-flat-podium-teleprompter-stage-overview.webp',
    jpgSrc: '/images/teleprompter/avlive-fold-flat-podium-teleprompter-stage-overview.jpg',
    label: 'Stage Overview',
    title: 'AV Live 17" & 22" Fold-Flat Stealth Podium Teleprompter — Stage Overview | AV Live Pakistan',
    alt: 'AV Live 17-inch and 22-inch Fold-Flat Stealth Podium Teleprompter mounted on an executive keynote lectern showing zero-glare audience stealth for corporate conferences in Pakistan.',
    caption: 'AV Live 17" Compact Stealth Podium Teleprompter — Engineered for the Spotlight, Invisible to the Audience.',
    width: 2102,
    height: 1173,
  },
  {
    slug: 'avlive-400-nit-privacy-ips-beam-splitter-teleprompter',
    src: '/images/teleprompter/avlive-400-nit-privacy-ips-beam-splitter-teleprompter.webp',
    jpgSrc: '/images/teleprompter/avlive-400-nit-privacy-ips-beam-splitter-teleprompter.jpg',
    label: '400+ Nit Privacy IPS',
    title: '400+ Nit Privacy IPS Podium Teleprompter & 60/40 Beam-Splitter Glass | AV Live Pakistan',
    alt: 'Close-up engineering overview of the AV Live 400+ nit flush IPS podium teleprompter display with 4-way 30-degree microlouver privacy filter and zero audience reflection in Pakistan.',
    caption: 'Ultra-Bright 400+ nit flush IPS display with 4-way ±30° microlouver privacy filter and 0% audience reflection.',
    width: 2102,
    height: 1173,
  },
  {
    slug: 'avlive-teleprompter-speaker-clarity-vs-audience-stealth',
    src: '/images/teleprompter/avlive-teleprompter-speaker-clarity-vs-audience-stealth.webp',
    jpgSrc: '/images/teleprompter/avlive-teleprompter-speaker-clarity-vs-audience-stealth.jpg',
    label: 'Speaker vs Audience',
    title: 'Podium Teleprompter Speaker View vs Audience Stealth Comparison | AV Live Pakistan',
    alt: 'Side-by-side optical comparison showing 80 percent full-color script clarity for the keynote presenter versus zero visible text or reflection for audience members and broadcast cameras.',
    caption: '80% high-clarity full-color slides exclusively for the presenter vs 0% visible text for audience and cameras.',
    width: 2102,
    height: 1173,
  },
  {
    slug: 'avlive-teleprompter-3-layer-optical-stack-baffle',
    src: '/images/teleprompter/avlive-teleprompter-3-layer-optical-stack-baffle.webp',
    jpgSrc: '/images/teleprompter/avlive-teleprompter-3-layer-optical-stack-baffle.jpg',
    label: '3-Layer Optical Stack',
    title: '3-Layer Teleprompter Optical Stack — AR Glass, IPS LCD & Velvet Baffle | AV Live Pakistan',
    alt: 'Exploded 3-layer optical stack diagram of the AV Live Stealth Podium Teleprompter featuring 60/40 AR beam-splitter glass, 17-inch recessed IPS LCD panel, and matte-black velvet baffle.',
    caption: 'Exploded view: Layer 1 (60/40 AR Glass), Layer 2 (17" Recessed IPS LCD), Layer 3 (Matte-Black Velvet Stealth Baffle).',
    width: 2102,
    height: 1173,
  },
  {
    slug: 'avlive-teleprompter-70-degree-micro-hinge-ergonomics',
    src: '/images/teleprompter/avlive-teleprompter-70-degree-micro-hinge-ergonomics.webp',
    jpgSrc: '/images/teleprompter/avlive-teleprompter-70-degree-micro-hinge-ergonomics.jpg',
    label: '70° Micro-Hinge Geometry',
    title: '70-Degree Micro-Hinge Ergonomics for Podium Teleprompter | AV Live Pakistan',
    alt: 'Technical ergonomic geometry of the AV Live Fold-Flat Podium Teleprompter 3-stop friction hinge (68, 70 to 73, and 78 degrees) calibrated for speakers from 5 feet to 6 feet 5 inches.',
    caption: '3-stop ergonomic friction lock (68° / 70°–73° / 78°) with 4.4" inward overhang and 12.2" rise for speakers 5\'0"–6\'5".',
    width: 2102,
    height: 1173,
  },
  {
    slug: 'avlive-fold-flat-unibody-aluminium-chassis-dimensions',
    src: '/images/teleprompter/avlive-fold-flat-unibody-aluminium-chassis-dimensions.webp',
    jpgSrc: '/images/teleprompter/avlive-fold-flat-unibody-aluminium-chassis-dimensions.jpg',
    label: '1.2" Fold-Flat Unibody',
    title: '1.2-Inch Fold-Flat CNC Aluminium Teleprompter Chassis Dimensions | AV Live Pakistan',
    alt: 'Dimensional blueprint of the AV Live 1.2-inch slim fold-flat CNC aluminium unibody teleprompter chassis (16.0 by 13.5 inches) nesting optical glass flat at 0 degrees for executive travel.',
    caption: '1:1 fold-flat aluminium unibody nests optical glass cleanly at 0° inside the 16.0" × 13.5" × 1.2" perimeter.',
    width: 2102,
    height: 1173,
  },
  {
    slug: 'avlive-podium-teleprompter-keynote-broadcast-deployments',
    src: '/images/teleprompter/avlive-podium-teleprompter-keynote-broadcast-deployments.webp',
    jpgSrc: '/images/teleprompter/avlive-podium-teleprompter-keynote-broadcast-deployments.jpg',
    label: 'Deployment Scenarios',
    title: 'Executive Keynote, Government Briefing & Broadcast Teleprompter Scenarios | AV Live Pakistan',
    alt: 'Real-world deployment scenarios for the AV Live Stealth Podium Teleprompter across executive CEO keynotes, government state briefings, live TV broadcasts, and product launches in Pakistan.',
    caption: 'Built for Executive Keynotes, Government Briefings, Live Multi-Camera Broadcasts, and Product Launches.',
    width: 2102,
    height: 1173,
  },
  {
    slug: 'avlive-teleprompter-standard-hdmi-vs-standalone-smart',
    src: '/images/teleprompter/avlive-teleprompter-standard-hdmi-vs-standalone-smart.webp',
    jpgSrc: '/images/teleprompter/avlive-teleprompter-standard-hdmi-vs-standalone-smart.jpg',
    label: 'Standard vs Smart Edition',
    title: 'Standard HDMI FOH vs Standalone Smart Mini-PC Teleprompter Comparison | AV Live Pakistan',
    alt: 'Hardware architecture comparison between AV Live Standard Single-Cable HDMI FOH Podium Teleprompter and Standalone Smart Edition with integrated dark-mode Mini PC for Pakistan stages.',
    caption: 'Choose single-cable HDMI FOH connectivity or Standalone Smart Edition with integrated dark-mode Mini PC.',
    width: 2102,
    height: 1173,
  },
  {
    slug: 'avlive-teleprompter-cnc-eva-aluminium-flight-case',
    src: '/images/teleprompter/avlive-teleprompter-cnc-eva-aluminium-flight-case.webp',
    jpgSrc: '/images/teleprompter/avlive-teleprompter-cnc-eva-aluminium-flight-case.jpg',
    label: 'CNC EVA Flight Case',
    title: 'Custom CNC EVA Foam Aluminium Flight Case for 17" & 22" Teleprompter | AV Live Pakistan',
    alt: 'Hard aluminium executive briefcase for the 17-inch teleprompter and wheeled trolley flight case for the 22-inch model with custom CNC-cut EVA foam protection for Pakistan nationwide touring.',
    caption: 'Optional hard aluminium briefcase (17") and wheeled trolley flight case (22") with custom CNC-cut EVA foam.',
    width: 2102,
    height: 1173,
  },
  {
    slug: 'avlive-podium-teleprompter-pakistan-pkr-pricing-qa',
    src: '/images/teleprompter/avlive-podium-teleprompter-pakistan-pkr-pricing-qa.webp',
    jpgSrc: '/images/teleprompter/avlive-podium-teleprompter-pakistan-pkr-pricing-qa.jpg',
    label: 'PKR Investment & QA',
    title: 'AV Live Fold-Flat Teleprompter PKR Pricing & Optical Quality Assurance | AV Live Pakistan',
    alt: 'Transparent PKR turnkey investment schedule and stage-light optical quality assurance checklist for AV Live 17-inch and 22-inch Stealth Podium Teleprompters in Lahore, Karachi, and Islamabad.',
    caption: 'Transparent PKR turnkey pricing backed by full stage-light optical quality assurance prior to handover.',
    width: 2102,
    height: 1173,
  },
];

/**
 * Rich SEO title & alt metadata for local video-conference hub & studio hardware assets.
 */
export const VIDEO_CONFERENCE_MEDIA_SEO: Record<string, ImageSeoMetadata> = {
  '/images/video-conference/boardroom-hero.webp': {
    title: 'Enterprise Video Conference Boardroom — Dual 4K Displays & Beamforming Mics | AV Live Pakistan',
    alt: 'Flagship executive video conference boardroom featuring dual 4K commercial displays, beamforming ceiling microphones, and tabletop touch controller engineered by AV Live in Pakistan.',
    caption: 'Executive dual-4K video conference boardroom engineered by AV Live Pakistan.',
    width: 1200,
    height: 675,
  },
  '/images/video-conference/huddle-space.webp': {
    title: 'Compact 4-to-6 Seat Video Conference Huddle Room with All-in-One 4K Video Bar | AV Live Pakistan',
    alt: 'Modern corporate huddle space configured with an all-in-one 4K AI video conferencing bar, acoustic treatment, and one-touch Microsoft Teams and Zoom Rooms control in Pakistan.',
    caption: 'All-in-one 4K AI video bar huddle room engineered for corporate offices in Lahore, Karachi, and Islamabad.',
    width: 1200,
    height: 800,
  },
  '/images/video-conference/hybrid-summit.webp': {
    title: 'Hybrid Conference Auditorium with Panoramic SMD LED Wall & Live Video Bridge | AV Live Pakistan',
    alt: 'Large enterprise hybrid summit auditorium combining a seamless SMD LED stage wall, multi-camera broadcast switching, and multi-site remote video conference bridge by AV Live Pakistan.',
    caption: 'Enterprise hybrid auditorium with live multi-city video conference bridge and SMD LED wall.',
    width: 1200,
    height: 800,
  },
  '/images/products/poly-x70-studio.webp': {
    title: 'HP Poly Studio X70 / X72 Dual-4K Lens Video Conferencing Bar — Studio View | AV Live Pakistan',
    alt: 'HP Poly Studio X70 and X72 flagship dual-4K 20MP all-in-one video conferencing bar with Poly DirectorAI speaker tracking, supplied with official warranty in Pakistan by AV Live.',
    width: 1200,
    height: 900,
  },
  '/images/products/poly-x70-studio.jpg': {
    title: 'HP Poly Studio X70 / X72 Dual-4K Lens Video Conferencing Bar — Studio View | AV Live Pakistan',
    alt: 'HP Poly Studio X70 and X72 flagship dual-4K 20MP all-in-one video conferencing bar with Poly DirectorAI speaker tracking, supplied with official warranty in Pakistan by AV Live.',
    width: 1200,
    height: 900,
  },
  '/images/products/poly-x70-boardroom.webp': {
    title: 'HP Poly Studio X70 / X72 Boardroom Installation & Dual-Display Setup | AV Live Pakistan',
    alt: 'Executive conference room deployed with HP Poly Studio X70 and X72 dual-camera video bar, dual 4K displays, and tabletop touch controller across corporate offices in Pakistan.',
    width: 1200,
    height: 900,
  },
  '/images/products/poly-x70-boardroom.jpg': {
    title: 'HP Poly Studio X70 / X72 Boardroom Installation & Dual-Display Setup | AV Live Pakistan',
    alt: 'Executive conference room deployed with HP Poly Studio X70 and X72 dual-camera video bar, dual 4K displays, and tabletop touch controller across corporate offices in Pakistan.',
    width: 1200,
    height: 900,
  },
  '/images/products/cisco-room-kit-studio.webp': {
    title: 'Cisco Webex Room Kit & Room Navigator Touch Controller — Studio View | AV Live Pakistan',
    alt: 'Cisco Webex Room Kit 5K UltraHD integrated video collaboration bar with Cisco Room Navigator touch controller for Webex, Microsoft Teams, and Zoom rooms in Pakistan.',
    width: 1200,
    height: 900,
  },
  '/images/products/cisco-room-kit-studio.jpg': {
    title: 'Cisco Webex Room Kit & Room Navigator Touch Controller — Studio View | AV Live Pakistan',
    alt: 'Cisco Webex Room Kit 5K UltraHD integrated video collaboration bar with Cisco Room Navigator touch controller for Webex, Microsoft Teams, and Zoom rooms in Pakistan.',
    width: 1200,
    height: 900,
  },
  '/images/products/cisco-room-kit-eq.webp': {
    title: 'Cisco Room Kit EQ Quad-Camera AI Codec Bundle for Large Boardrooms | AV Live Pakistan',
    alt: 'Cisco Room Kit EQ flagship NVIDIA AI-powered codec and Quad Camera bar engineered for 16-to-30 seat executive boardrooms and auditoriums across Lahore, Karachi, and Islamabad.',
    width: 1200,
    height: 900,
  },
  '/images/products/cisco-room-kit-eq.jpg': {
    title: 'Cisco Room Kit EQ Quad-Camera AI Codec Bundle for Large Boardrooms | AV Live Pakistan',
    alt: 'Cisco Room Kit EQ flagship NVIDIA AI-powered codec and Quad Camera bar engineered for 16-to-30 seat executive boardrooms and auditoriums across Lahore, Karachi, and Islamabad.',
    width: 1200,
    height: 900,
  },
  '/images/products/3d-hologram-stage.webp': {
    title: '3D Hologram Stage Projection & Corporate Keynote Holonet Display | AV Live Pakistan',
    alt: 'Turnkey 3D Hologram stage projection and holonet display setup engineered by AV Live for flagship corporate product launches, conventions, and CEO keynotes across Pakistan.',
    width: 1200,
    height: 900,
  },
  '/images/products/3d-hologram-display.webp': {
    title: 'Commercial 3D Holographic Display & Retail Exhibition Totem | AV Live Pakistan',
    alt: 'High-brightness commercial 3D holographic showcase display and exhibition totem supplied and rented by AV Live Communications for expos and brand activations in Pakistan.',
    width: 1200,
    height: 900,
  },
};

export interface ProductLikeForSeo {
  productName?: string;
  name?: string;
  brand?: string;
  brandName?: string;
  sku?: string;
  mpn?: string;
  shortDescription?: string;
}

const ANGLE_DESCRIPTORS = [
  {
    titleSuffix: 'Official Hardware View',
    altAction: 'enterprise AV hardware showcase view',
  },
  {
    titleSuffix: 'Kit & Accessory Configuration',
    altAction: 'complete hardware bundle and connectivity view',
  },
  {
    titleSuffix: 'Boardroom Deployment Context',
    altAction: 'corporate boardroom and installation deployment perspective',
  },
  {
    titleSuffix: 'Technical Profile & Ports',
    altAction: 'technical hardware profile and enterprise integration view',
  },
  {
    titleSuffix: 'Enterprise System Showcase',
    altAction: 'commercial AV deployment overview',
  },
];

function stripHtmlTags(raw?: string): string {
  if (!raw) return '';
  return raw
    .replace(/<[^>]*>?/gm, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Generates an SEO-rich HTML `title` and descriptive `alt` brief for any hardware product image,
 * naming the product, brand, MPN/SKU, visual angle context, and Pakistan availability by AV Live.
 */
export function buildProductImageSeo(
  product: ProductLikeForSeo,
  imageUrl?: string,
  angleIndex = 0
): ImageSeoMetadata {
  const cleanPath = (imageUrl || '')
    .replace(/^https?:\/\/avlive\.com\.pk/i, '')
    .split('?')[0];

  const name = (product.productName || product.name || 'Enterprise AV Hardware').trim();
  const brand = (product.brand || product.brandName || '').trim();
  const code = (product.mpn || product.sku || '').trim();
  const descriptor = ANGLE_DESCRIPTORS[angleIndex % ANGLE_DESCRIPTORS.length];

  const hasBrandInName = brand ? name.toLowerCase().includes(brand.toLowerCase()) : true;
  const brandedName = brand && !hasBrandInName ? `${brand} ${name}` : name;
  const codeTag = code && !name.toLowerCase().includes(code.toLowerCase()) ? ` (${code})` : '';

  // Check if the image itself is a known local studio/project photo to weave in exact visual context
  const knownLocal = VIDEO_CONFERENCE_MEDIA_SEO[cleanPath];
  if (knownLocal && angleIndex > 0) {
    return {
      title: `${brandedName}${codeTag} — ${descriptor.titleSuffix} | AV Live Pakistan`,
      alt: `${brandedName}${codeTag} — ${knownLocal.alt}`,
      caption: `${brandedName}${codeTag} — ${knownLocal.caption || descriptor.titleSuffix}`,
    };
  }

  const cleanSummary = stripHtmlTags(product.shortDescription);
  const briefContext =
    cleanSummary && cleanSummary.length >= 25
      ? cleanSummary.slice(0, 95).replace(/[.,;:\s]+$/, '')
      : `official ${descriptor.altAction}`;

  const title =
    angleIndex === 0
      ? `${brandedName}${codeTag} Price in Pakistan — ${descriptor.titleSuffix} | AV Live`
      : `${brandedName}${codeTag} — ${descriptor.titleSuffix} | AV Live Pakistan`;

  const alt =
    angleIndex === 0
      ? `${brandedName}${codeTag} — ${briefContext}; supplied with turnkey installation and 15-minute SLA across Lahore, Karachi, and Islamabad by AV Live Pakistan.`
      : `${brandedName}${codeTag} (${descriptor.altAction}) — enterprise AV hardware supplied, configured, and supported nationwide in Pakistan by AV Live Communications.`;

  return {
    title,
    alt,
    caption: `${brandedName}${codeTag} — ${descriptor.titleSuffix} (AV Live Pakistan)`,
  };
}

/**
 * Generates paired SEO title & alt metadata for service cards, category headers, and editorial blog cards.
 */
export function buildEditorialImageSeo(
  heading: string,
  context: 'service' | 'category' | 'blog' | 'solution' | 'hero',
  extraDetail?: string
): ImageSeoMetadata {
  const cleanHeading = heading.trim();
  const cleanDetail = extraDetail ? stripHtmlTags(extraDetail).slice(0, 100) : '';

  switch (context) {
    case 'service':
      return {
        title: `${cleanHeading} in Pakistan — Turnkey AV & Event Engineering | AV Live`,
        alt: `${cleanHeading} delivered by AV Live Communications across Lahore, Karachi, and Islamabad${cleanDetail ? ` — ${cleanDetail}` : ' with in-house SMD LED walls, broadcast audio, and video conferencing hardware'}.`,
      };
    case 'category':
      return {
        title: `${cleanHeading} Hardware & Systems in Pakistan | AV Live Communications`,
        alt: `Authorized ${cleanHeading} enterprise hardware catalog in Pakistan featuring Poly, Cisco, Logitech, Sony, and VISSONIC systems installed by AV Live across Lahore, Karachi, and Islamabad.`,
      };
    case 'blog':
      return {
        title: `${cleanHeading} — AV Live Pakistan Engineering Guide`,
        alt: `Technical engineering guide cover for ${cleanHeading} published by AV Live Communications Pakistan covering enterprise AV, video conferencing, and corporate event production.`,
      };
    case 'solution':
      return {
        title: `${cleanHeading} — Enterprise AV Solution in Pakistan | AV Live`,
        alt: `${cleanHeading} turnkey enterprise deployment in Pakistan${cleanDetail ? ` — ${cleanDetail}` : ' engineered by AV Live Communications for corporate boardrooms and conventions'}.`,
      };
    case 'hero':
    default:
      return {
        title: `${cleanHeading} | AV Live Communications Pakistan`,
        alt: `${cleanHeading} — real enterprise video conferencing boardroom and national corporate event production engineered by AV Live across Pakistan.`,
      };
  }
}
