import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Globe,
  Search,
  Package,
  Layers,
  Building2,
  MapPin,
  BookOpen,
  Briefcase,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  FileCode2,
} from 'lucide-react';
import { SEO } from '../components/SEO';
import {
  PRODUCT_GMC_METADATA,
  buildFallbackProductFromGmcMeta,
} from '../lib/gmc-feed';
import { FALLBACK_SERVICES_CATALOG } from '../lib/services-catalog';
import {
  FALLBACK_BLOG_CATALOG,
  CANONICAL_CATEGORY_SLUGS,
} from '../lib/sitemap-generator';

const CORE_PILLAR_LINKS = [
  { path: '/', label: 'Home — Enterprise AV, Video Conferencing & Event Management Pakistan', tag: 'Core Hub' },
  { path: '/shop', label: 'Hardware Storefront — All 53+ Verified AV & VoIP Products', tag: 'Storefront' },
  { path: '/video-conference-in-pakistan', label: 'Video Conference in Pakistan — Polycom Group 500, Poly X70, Cisco & Logitech', tag: 'Top Keyword' },
  { path: '/corporate-event-management', label: 'Corporate Event Management Pakistan — SMD Screens, Hybrid Staging & Holograms', tag: 'Top Keyword' },
  { path: '/video-conferencing', label: 'Video Conferencing Hardware & Codec Solutions Hub', tag: 'Pillar' },
  { path: '/video-conferencing-solutions', label: 'Turnkey Boardroom Video Conferencing Solutions Pakistan', tag: 'Pillar' },
  { path: '/conference-room-solutions', label: 'Executive Conference Room AV & Acoustic Integration', tag: 'Pillar' },
  { path: '/zoom-rooms', label: 'Zoom Rooms Hardware & Certified Integrator Pakistan', tag: 'Platform' },
  { path: '/microsoft-teams-rooms', label: 'Microsoft Teams Rooms (MTR) Certified Appliances Pakistan', tag: 'Platform' },
  { path: '/3d-hologram', label: '3D Hologram Display Stages, Fan Walls & HoloGauze Pakistan', tag: 'Experiential' },
  { path: '/projection-mapping', label: 'Architectural 3D Projection Mapping & Laser Projectors Pakistan', tag: 'Experiential' },
  { path: '/live-streaming-services', label: 'Corporate Hybrid Event Live Streaming & Multi-Camera Broadcast', tag: 'Broadcast' },
  { path: '/av-equipment-rental', label: 'SMD LED Screen, Line-Array Sound & AV Equipment Rental Pakistan', tag: 'Rental' },
  { path: '/esports', label: 'e-Sports Tournament Arena Engineering & Broadcast Production', tag: 'Arena' },
  { path: '/services', label: 'All Enterprise AV, Event & AI Engineering Services', tag: 'Services' },
  { path: '/events-services', label: 'Corporate Events, Expos & Hybrid Summit Production Hub', tag: 'Events' },
  { path: '/solutions', label: 'Industry AV & Unified Communications Solutions Matrix', tag: 'Solutions' },
  { path: '/room-designer', label: 'Interactive 3D Conference Room Designer & BOM Calculator', tag: 'Interactive Tool' },
  { path: '/event-quote', label: '24-Hour Corporate Event & Stage Production Quote Engine', tag: 'Interactive Tool' },
  { path: '/compare', label: 'Side-by-Side Enterprise Video Bar & Codec Comparison Tool', tag: 'Interactive Tool' },
];

const REGIONAL_HUB_LINKS = [
  { path: '/lahore', city: 'Lahore HQ', desc: 'Johar Town, Gulberg & DHA Lahore — Boardroom AV, Poly/Logitech Stock & SMD Event Staging' },
  { path: '/karachi', city: 'Karachi Hub', desc: 'Clifton, Shahrah-e-Faisal & Korangi — Banking Telepresence, Multi-Camera Broadcast & VoIP' },
  { path: '/islamabad', city: 'Islamabad Hub', desc: 'Blue Area, F-6/F-7 & Diplomatic Enclave — Government, Defense & Public Sector AV Integration' },
];

const BRAND_PORTALS = [
  { slug: 'poly', name: 'HP Poly (Polycom)', focus: 'Studio X70/X72, Group 500, Sync & VVX' },
  { slug: 'cisco', name: 'Cisco Webex', focus: 'Room Kit Plus, Room Bar, IP Phones 8800' },
  { slug: 'logitech', name: 'Logitech', focus: 'Rally Bar, Rally Bar Mini, Rally Plus, Sight' },
  { slug: 'yealink', name: 'Yealink', focus: 'MeetingBar A20/A30, SIP-T46U/T54W Phones' },
  { slug: 'jabra', name: 'Jabra', focus: 'PanaCast 50, Evolve2 ANC Headsets, Speak2' },
  { slug: 'bosch', name: 'Bosch Security & Audio', focus: 'CCS 1000D Discussion, PAVIRO Public Address' },
  { slug: 'grandstream', name: 'Grandstream', focus: 'UCM6300 IP PBX, GXP/GRP Carrier Phones' },
  { slug: 'hikvision', name: 'Hikvision Commercial', focus: 'Interactive Flat Panels, SMD Walls & IP CCTV' },
  { slug: 'dahua', name: 'Dahua Technology', focus: 'DeepHub Smart Boards & WizMind Surveillance' },
  { slug: 'axis', name: 'Axis Communications', focus: 'NDAA Network Cameras & IP Horn Speakers' },
  { slug: 'fanvil', name: 'Fanvil', focus: 'Executive SIP Desk Phones & Hotel Telephony' },
  { slug: '2n', name: '2N Telekomunikace', focus: 'IP Vario & IP Verso SIP Door Access Intercoms' },
  { slug: 'epson', name: 'Epson', focus: '3LCD Laser Boardroom & Large-Venue Projectors' },
  { slug: 'benq', name: 'BenQ', focus: '4K Corporate Projectors & Interactive Displays' },
  { slug: 'optoma', name: 'Optoma', focus: 'DLP Laser Projectors & Projection Mapping Rigs' },
  { slug: 'panasonic', name: 'Panasonic Connect', focus: 'PTZ Broadcast Cameras & High-Lumen Projectors' },
  { slug: 'sony', name: 'Sony Professional', focus: 'BRAVIA 4K Commercial Displays & SRG PTZ Cameras' },
  { slug: 'viewsonic', name: 'ViewSonic', focus: 'ViewBoard Interactive Touch Panels & Displays' },
  { slug: 'uniview', name: 'Uniview (UNV)', focus: 'Enterprise NVR & AI Perimeter Cameras' },
  { slug: 'itc', name: 'ITC Audio', focus: 'Digital Conference Mics, Line Arrays & 100V PA' },
  { slug: '3cx', name: '3CX Communications', focus: 'Enterprise Software IP PBX & Call Center Licensing' },
  { slug: 'freepbx', name: 'FreePBX / Sangoma', focus: 'Open-Standards IP Telephony & Trunk Gateways' },
  { slug: 'sangoma', name: 'Sangoma', focus: 'PBXact Appliances, Vega Gateways & SBCs' },
];

const B2B_CORPORATE_LINKS = [
  { path: '/about', label: 'About AV Live Communications (15+ Years in Pakistan)' },
  { path: '/contact', label: 'Contact Regional Engineering Offices (Lahore, Karachi, Islamabad)' },
  { path: '/brands', label: 'All Authorized Enterprise Hardware Brands Directory' },
  { path: '/guides', label: 'Enterprise AV & VoIP Technical Buyer’s Guides' },
  { path: '/blog', label: 'Engineering Insights & Pakistan AV Price Guides Blog' },
  { path: '/reviews', label: 'Verified Corporate Client Testimonials & Case Studies' },
  { path: '/faqs', label: 'Frequently Asked Technical & Procurement Questions' },
  { path: '/programs/quote', label: 'Request Official B2B / Tender BOQ Quotation' },
  { path: '/programs/government-education-pricing', label: 'Government, HEC University & Defense Sector Pricing' },
  { path: '/programs/reseller-program', label: 'Authorized Sub-Distributor & IT Reseller Partner Program' },
  { path: '/programs/provisioning-services', label: 'Zero-Touch SIP & Boardroom Pre-Provisioning Lab' },
  { path: '/programs/fulfillment-services', label: 'Nationwide Multi-Branch Rollout & SLA Fulfillment' },
  { path: '/programs/blind-drop-shipping', label: 'White-Label Blind Drop Shipping for System Integrators' },
  { path: '/programs/promotions', label: 'Current Enterprise Hardware Bundles & Trade-In Offers' },
  { path: '/voip-service-providers', label: 'SIP Trunking & VoIP PBX Compatibility Matrix' },
  { path: '/shipping', label: 'Nationwide Insured Delivery & Dispatch Policy' },
  { path: '/returns', label: '30-Day Enterprise Hardware Return & DOA Replacement Policy' },
  { path: '/payment', label: 'Corporate PO, Crossed Cheque, IBFT & Tax Invoice Terms' },
  { path: '/rma', label: 'Official Hardware Warranty Claim & RMA Portal' },
  { path: '/privacy-policy', label: 'Corporate Data Protection & Privacy Policy' },
  { path: '/terms-of-service', label: 'Enterprise Terms of Sale & SLA Conditions' },
];

const CATEGORY_LABELS: Record<string, string> = {
  'video-conferencing': 'Video Conferencing Systems & Bars',
  'touch-panels': 'Interactive Touch Panels & Smart Boards',
  'large-room': 'Large Boardroom & Auditorium AV',
  'speakerphones': 'Conference Speakerphones & Ceiling Mics',
  'boardroom-codecs': 'Dedicated H.323/SIP Boardroom Codecs',
  'ptz-cameras': 'Optical 12x–30x PTZ Broadcast Cameras',
  'ip-phones': 'Enterprise PoE SIP Desk IP Phones',
  'voip-phone-systems': 'IP PBX Appliances & VoIP Gateways',
  'projectors': 'Laser Boardroom & Venue Projectors',
  'headsets': 'ANC Wireless DECT & USB Call Center Headsets',
  'ip-cameras': 'NDAA Commercial IP Security Cameras',
  'intercom-paging-access': 'SIP Door Intercoms & 100V Public Address',
};

export function HtmlSitemap() {
  const [searchQuery, setSearchQuery] = useState('');

  const allProducts = useMemo(() => {
    return Object.keys(PRODUCT_GMC_METADATA)
      .map((slug) => buildFallbackProductFromGmcMeta(slug))
      .filter(Boolean);
  }, []);

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return allProducts;
    const q = searchQuery.toLowerCase();
    return allProducts.filter(
      (p) =>
        p?.productName.toLowerCase().includes(q) ||
        p?.brand.toLowerCase().includes(q) ||
        p?.sku.toLowerCase().includes(q) ||
        p?.slug?.toLowerCase().includes(q)
    );
  }, [allProducts, searchQuery]);

  const totalUrlsCount =
    CORE_PILLAR_LINKS.length +
    REGIONAL_HUB_LINKS.length +
    CANONICAL_CATEGORY_SLUGS.length +
    BRAND_PORTALS.length +
    FALLBACK_SERVICES_CATALOG.length +
    FALLBACK_BLOG_CATALOG.length +
    B2B_CORPORATE_LINKS.length +
    allProducts.length;

  const sitemapSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': 'https://avlive.com.pk/sitemap#collection',
    name: 'AV Live Communications Complete HTML Sitemap & Enterprise Hardware Directory',
    description:
      'Complete crawlable directory of all 153+ verified pages on avlive.com.pk including Polycom Group 500, Poly Studio X70, Cisco, Logitech, Yealink, Corporate Event Management, 3D Hologram Displays, and nationwide engineering hubs.',
    url: 'https://avlive.com.pk/sitemap',
    isPartOf: {
      '@id': 'https://avlive.com.pk/#website',
    },
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20">
      <SEO
        title="HTML Sitemap & Complete Enterprise AV Directory | AV Live Pakistan"
        description="Browse the complete directory of 153+ verified pages on AV Live Communications (avlive.com.pk): Video Conference in Pakistan, Corporate Event Management, 53 Hardware Products, 23 Brands, and Buyer's Guides."
        keywords="AV Live sitemap, avlive.com.pk directory, Video Conference in Pakistan, Corporate event management Pakistan, Polycom Group 500, Poly Studio X70, Logitech Rally Bar Pakistan, Yealink Pakistan, 3D Hologram Display Pakistan"
        url="https://avlive.com.pk/sitemap"
        schema={sitemapSchema}
      />

      {/* Hero Header */}
      <section className="bg-[#1A2B4C] text-white py-14 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00B4D8]/20 border border-[#00B4D8]/40 text-[#00B4D8] text-xs font-black uppercase tracking-widest mb-4">
                <Globe className="w-3.5 h-3.5" /> Official Search &amp; Crawl Index ({totalUrlsCount} Canonical Pages)
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-3">
                Complete HTML Sitemap &amp; Site Directory
              </h1>
              <p className="text-gray-300 max-w-3xl text-sm sm:text-base leading-relaxed">
                Direct 1-click access to every verified page, enterprise hardware datasheet, authorized brand portal, and turnkey event service on{' '}
                <strong className="text-white">avlive.com.pk</strong>. Looking for the machine-readable XML feed for Google Search Console? Access it directly below.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#00B4D8] hover:bg-[#0096B4] text-white font-black text-xs uppercase tracking-wider shadow-lg transition-all"
              >
                <FileCode2 className="w-4 h-4" /> Open XML Sitemap (/sitemap.xml) <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <a
                href="/gmc-products.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider border border-white/15 transition-all"
              >
                GMC Product Feed (/gmc-products.xml)
              </a>
            </div>
          </div>

          {/* Answer-First AEO Summary Box */}
          <div className="mt-8 bg-white/5 border border-white/15 rounded-2xl p-5 text-xs sm:text-sm text-gray-200 leading-relaxed">
            <strong className="text-[#00B4D8] uppercase tracking-wider mr-2">Direct Architecture Summary:</strong>
            AV Live Communications (<code className="text-white font-mono">https://avlive.com.pk</code>) indexes {totalUrlsCount} canonical, self-referencing commercial URLs covering{' '}
            <Link to="/video-conference-in-pakistan" className="text-[#00B4D8] underline font-bold">Video Conference in Pakistan</Link>,{' '}
            <Link to="/corporate-event-management" className="text-[#00B4D8] underline font-bold">Corporate Event Management</Link>,{' '}
            {CANONICAL_CATEGORY_SLUGS.length} hardware categories, {BRAND_PORTALS.length} authorized OEM brand portals (HP Poly, Cisco, Logitech, Yealink, Bosch, Jabra), and {allProducts.length} in-stock enterprise SKUs with PKR pricing across Lahore, Karachi, and Islamabad.
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Section 1: High-Priority Commercial Pillars & Keyword Landing Pages */}
        <section className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-[#1A2B4C] text-[#00B4D8] flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#1A2B4C]">
                1. Core Commercial Pillars &amp; High-Intent Landing Pages
              </h2>
              <p className="text-xs text-gray-500">
                Primary national landing pages for Video Conferencing, Corporate Event Management, 3D Hologram Stages, and Interactive Configurators
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {CORE_PILLAR_LINKS.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-gray-100 hover:border-[#00B4D8] hover:bg-[#00B4D8]/5 transition-all group"
              >
                <div className="min-w-0">
                  <span className="font-bold text-sm text-[#1A2B4C] group-hover:text-[#00B4D8] block truncate">
                    {item.label}
                  </span>
                  <span className="text-[11px] font-mono text-gray-400">
                    https://avlive.com.pk{item.path === '/' ? '' : item.path}
                  </span>
                </div>
                <span className="shrink-0 px-2.5 py-1 rounded-md bg-gray-100 group-hover:bg-[#1A2B4C] group-hover:text-white text-[10px] font-black uppercase tracking-wider text-gray-600 transition-colors">
                  {item.tag}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Section 2: Regional Engineering Hubs & Turnkey Services */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-[#00B4D8]/10 text-[#00B4D8] flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-[#1A2B4C]">
                  2. Regional Engineering Hubs
                </h2>
                <p className="text-xs text-gray-500">Local offices, demo centers, and SLA dispatch hubs</p>
              </div>
            </div>
            <div className="space-y-3">
              {REGIONAL_HUB_LINKS.map((hub) => (
                <Link
                  key={hub.path}
                  to={hub.path}
                  className="block p-4 rounded-2xl border border-gray-100 hover:border-[#00B4D8] hover:bg-[#00B4D8]/5 transition-all group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-black text-base text-[#1A2B4C] group-hover:text-[#00B4D8]">
                      {hub.city} ({hub.path})
                    </span>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#00B4D8] group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-xs text-gray-600">{hub.desc}</p>
                </Link>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <h3 className="text-base font-black text-[#1A2B4C] mb-4">
                3. Hardware Product Categories ({CANONICAL_CATEGORY_SLUGS.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {CANONICAL_CATEGORY_SLUGS.map((slug) => (
                  <Link
                    key={slug}
                    to={`/category/${slug}`}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gray-50 hover:bg-[#1A2B4C] text-[#1A2B4C] hover:text-white text-xs font-bold transition-colors"
                  >
                    <span className="truncate">{CATEGORY_LABELS[slug] || slug}</span>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0 ml-2 opacity-60" />
                  </Link>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-[#FF6B35]/10 text-[#FF6B35] flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-[#1A2B4C]">
                  4. Turnkey Enterprise &amp; Event Services ({FALLBACK_SERVICES_CATALOG.length})
                </h2>
                <p className="text-xs text-gray-500">Dedicated engineering and event production verticals</p>
              </div>
            </div>
            <div className="space-y-2.5">
              {FALLBACK_SERVICES_CATALOG.map((service) => (
                <Link
                  key={service.slug}
                  to={`/services/${service.slug}`}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 hover:border-[#00B4D8] hover:bg-[#00B4D8]/5 transition-all group"
                >
                  <div className="min-w-0 pr-3">
                    <span className="font-bold text-sm text-[#1A2B4C] group-hover:text-[#00B4D8] block truncate">
                      {service.title}
                    </span>
                    <span className="text-[11px] text-gray-400 font-mono">
                      /services/{service.slug} • {service.priceRange || 'Custom Quote'}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#00B4D8] shrink-0" />
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* Section 5: Authorized Brand Portals */}
        <section className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-[#1A2B4C] text-white flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#1A2B4C]">
                5. Authorized OEM Brand Portals ({BRAND_PORTALS.length} Brands)
              </h2>
              <p className="text-xs text-gray-500">
                Official Pakistan brand landing pages with local warranty and genuine serial verification
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {BRAND_PORTALS.map((b) => (
              <Link
                key={b.slug}
                to={`/brands/${b.slug}`}
                className="p-3.5 rounded-xl border border-gray-100 hover:border-[#00B4D8] hover:bg-[#00B4D8]/5 transition-all group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-black text-sm text-[#1A2B4C] group-hover:text-[#00B4D8]">
                    {b.name}
                  </span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                </div>
                <p className="text-[11px] text-gray-500 truncate">{b.focus}</p>
                <span className="text-[10px] font-mono text-gray-400 block mt-1">/brands/{b.slug}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Section 6: Technical Blog & Buyer's Guides + B2B Programs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-[#00B4D8]/10 text-[#00B4D8] flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-[#1A2B4C]">
                  6. Engineering Guides &amp; Price Benchmarks ({FALLBACK_BLOG_CATALOG.length})
                </h2>
                <p className="text-xs text-gray-500">In-depth comparisons and 2026 Pakistan AV pricing guides</p>
              </div>
            </div>
            <div className="space-y-2.5">
              {FALLBACK_BLOG_CATALOG.map((post) => (
                <Link
                  key={post.slug}
                  to={`/blog/${post.slug}`}
                  className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-[#00B4D8] hover:bg-[#00B4D8]/5 transition-all group"
                >
                  <div className="min-w-0 pr-3">
                    <span className="font-bold text-xs sm:text-sm text-[#1A2B4C] group-hover:text-[#00B4D8] block truncate">
                      {post.title}
                    </span>
                    <span className="text-[11px] text-gray-400 font-mono">
                      /blog/{post.slug} • {post.category}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#00B4D8] shrink-0" />
                </Link>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-[#1A2B4C]/10 text-[#1A2B4C] flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-[#1A2B4C]">
                  7. Corporate B2B Programs &amp; Policies ({B2B_CORPORATE_LINKS.length})
                </h2>
                <p className="text-xs text-gray-500">Procurement programs, SLA fulfillment, RMA, and legal policies</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {B2B_CORPORATE_LINKS.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="p-3 rounded-xl border border-gray-100 hover:border-[#00B4D8] hover:bg-[#00B4D8]/5 transition-all group"
                >
                  <span className="font-bold text-xs text-[#1A2B4C] group-hover:text-[#00B4D8] block leading-snug">
                    {item.label}
                  </span>
                  <span className="text-[10px] font-mono text-gray-400 block mt-1">{item.path}</span>
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* Section 8: Complete Verified Hardware Catalog (All 53 Canonical Product Pages) */}
        <section className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1A2B4C] text-[#00B4D8] flex items-center justify-center">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-[#1A2B4C]">
                  8. Verified Enterprise Hardware Catalog ({allProducts.length} Canonical SKUs)
                </h2>
                <p className="text-xs text-gray-500">
                  Direct links to every canonical product page with official MPN, brand, and PKR pricing
                </p>
              </div>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by model, brand, or MPN..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#00B4D8]"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-gray-200">
            <table className="w-full text-left border-collapse text-xs">
              <caption className="sr-only">
                Complete AV Live Communications Enterprise Hardware Product Directory in Pakistan
              </caption>
              <thead>
                <tr className="bg-[#1A2B4C] text-white uppercase text-[11px] font-black tracking-wider">
                  <th className="py-3 px-4">Product Name &amp; Canonical Link</th>
                  <th className="py-3 px-4">Brand</th>
                  <th className="py-3 px-4">MPN / SKU</th>
                  <th className="py-3 px-4 text-right">Reference Price (PKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((product) => {
                  if (!product) return null;
                  const price = product.salePrice || product.regularPrice || 0;
                  return (
                    <tr key={product.slug || product.id} className="hover:bg-[#00B4D8]/5 transition-colors">
                      <td className="py-3 px-4">
                        <Link
                          to={`/product/${product.slug}`}
                          className="font-bold text-[#1A2B4C] hover:text-[#00B4D8] block"
                        >
                          {product.productName}
                        </Link>
                        <span className="text-[10px] font-mono text-gray-400">
                          https://avlive.com.pk/product/{product.slug}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-gray-700">{product.brand}</td>
                      <td className="py-3 px-4 font-mono text-gray-500">{product.mpn || product.sku}</td>
                      <td className="py-3 px-4 text-right font-black text-[#1A2B4C]">
                        Rs. {price.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
export default HtmlSitemap;
