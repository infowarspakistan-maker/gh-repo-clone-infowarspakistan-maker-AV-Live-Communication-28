import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import {
  getCanonicalProductSlug,
  PRODUCT_GMC_METADATA,
  buildFallbackProductFromGmcMeta,
} from '../lib/gmc-feed';
import { FALLBACK_SERVICES_CATALOG } from '../lib/services-catalog';
import { FALLBACK_BLOG_CATALOG } from '../lib/sitemap-generator';

export interface SeoFooterLinkItem {
  label: string;
  path: string;
}

export interface SeoFooterCategoryGroup {
  id: string;
  title: string;
  links: SeoFooterLinkItem[];
}

export interface FooterAccordionProps {
  categories?: SeoFooterCategoryGroup[];
  defaultOpenId?: string | null;
}

const CORE_PILLAR_SEO_LINKS: SeoFooterLinkItem[] = [
  { path: '/', label: 'AV Live Pakistan Home' },
  { path: '/shop', label: 'All Enterprise AV Hardware (53 SKUs)' },
  { path: '/sitemap', label: 'Complete HTML Sitemap (156 Pages)' },
  { path: '/video-conference-in-pakistan', label: 'Video Conference in Pakistan' },
  { path: '/event-management-in-pakistan', label: 'Event Management in Pakistan' },
  { path: '/corporate-event-management', label: 'Corporate Event Management Pakistan' },
  { path: '/video-conferencing', label: 'Video Conferencing Room Architecture' },
  { path: '/video-conferencing-solutions', label: 'Turnkey Video Conferencing Solutions' },
  { path: '/conference-room-solutions', label: 'Executive Conference Room Solutions' },
  { path: '/zoom-rooms', label: 'Zoom Rooms Certified Hardware' },
  { path: '/microsoft-teams-rooms', label: 'Microsoft Teams Rooms (MTR)' },
  { path: '/3d-hologram', label: '3D Hologram Display Stages' },
  { path: '/projection-mapping', label: '3D Projection Mapping Pakistan' },
  { path: '/live-streaming-services', label: 'Hybrid Event Live Streaming' },
  { path: '/av-equipment-rental', label: 'AV & SMD LED Screen Rental' },
  { path: '/esports', label: 'e-Sports Arena Production' },
  { path: '/services', label: 'Enterprise AV & AI Services' },
  { path: '/events-services', label: 'Event Production & Staging Hub' },
  { path: '/solutions', label: 'Industry AV Solutions Matrix' },
  { path: '/room-designer', label: '3D Room Designer & BoM Calculator' },
  { path: '/event-quote', label: '24-Hour Custom Event Quote' },
  { path: '/compare', label: 'Boardroom Hardware Comparison Tool' },
];

const HARDWARE_CATEGORY_SEO_LINKS: SeoFooterLinkItem[] = [
  { path: '/category/video-conferencing', label: 'Video Conferencing Systems' },
  { path: '/category/boardroom-codecs', label: 'Boardroom H.323/SIP Codecs' },
  { path: '/category/large-room', label: 'Large Room & Auditorium AV' },
  { path: '/category/ptz-cameras', label: 'Optical PTZ Broadcast Cameras' },
  { path: '/category/touch-panels', label: 'Interactive Touch Panels & Displays' },
  { path: '/category/speakerphones', label: 'Speakerphones & Ceiling Mics' },
  { path: '/category/ip-phones', label: 'Enterprise PoE SIP IP Phones' },
  { path: '/category/voip-phone-systems', label: 'VoIP Phone Systems & IP PBX' },
  { path: '/category/headsets', label: 'ANC Call Center & Office Headsets' },
  { path: '/category/projectors', label: 'Commercial Laser Projectors' },
  { path: '/category/ip-cameras', label: 'NDAA Commercial IP Cameras' },
  { path: '/category/intercom-paging-access', label: 'Intercom, Paging & PA Systems' },
];

const BRAND_PORTAL_SEO_LINKS: SeoFooterLinkItem[] = [
  { path: '/brands/poly', label: 'HP Poly (Polycom) Pakistan' },
  { path: '/brands/cisco', label: 'Cisco Webex Collaboration' },
  { path: '/brands/logitech', label: 'Logitech Video Collaboration' },
  { path: '/brands/yealink', label: 'Yealink UC & Video Bars' },
  { path: '/brands/jabra', label: 'Jabra PanaCast & Evolve2' },
  { path: '/brands/bosch', label: 'Bosch Congress & PAVIRO PA' },
  { path: '/brands/grandstream', label: 'Grandstream IP PBX & Phones' },
  { path: '/brands/hikvision', label: 'Hikvision Commercial Displays' },
  { path: '/brands/dahua', label: 'Dahua DeepHub & Security' },
  { path: '/brands/axis', label: 'Axis Network Cameras & Audio' },
  { path: '/brands/fanvil', label: 'Fanvil SIP Desk Telephony' },
  { path: '/brands/2n', label: '2N SIP Door Access Intercoms' },
  { path: '/brands/epson', label: 'Epson 3LCD Laser Projectors' },
  { path: '/brands/benq', label: 'BenQ 4K Projectors & Boards' },
  { path: '/brands/optoma', label: 'Optoma DLP Laser Projectors' },
  { path: '/brands/panasonic', label: 'Panasonic Broadcast & Projection' },
  { path: '/brands/sony', label: 'Sony BRAVIA & PTZ Cameras' },
  { path: '/brands/viewsonic', label: 'ViewSonic ViewBoard Displays' },
  { path: '/brands/uniview', label: 'Uniview (UNV) Enterprise CCTV' },
  { path: '/brands/itc', label: 'ITC Digital Conference & PA' },
  { path: '/brands/3cx', label: '3CX Enterprise IP PBX' },
  { path: '/brands/freepbx', label: 'FreePBX Open-Standards VoIP' },
  { path: '/brands/sangoma', label: 'Sangoma PBXact & Gateways' },
  { path: '/brands/horion', label: 'Horion 4K Interactive Panels' },
  { path: '/brands/google', label: 'Google Meet Room Hardware' },
];

const B2B_REGIONAL_AND_POLICY_SEO_LINKS: SeoFooterLinkItem[] = [
  { path: '/lahore', label: 'AV Live Lahore Head Office Hub' },
  { path: '/karachi', label: 'AV Live Karachi Regional Hub' },
  { path: '/islamabad', label: 'AV Live Islamabad Regional Hub' },
  { path: '/about', label: 'About AV Live Communications' },
  { path: '/contact', label: 'Contact Engineering & Sales Desk' },
  { path: '/brands', label: 'Authorized OEM Brands Directory' },
  { path: '/guides', label: 'Enterprise AV Buyer’s Guides' },
  { path: '/blog', label: 'Engineering Insights & AV Blog' },
  { path: '/reviews', label: 'Verified Client Reviews' },
  { path: '/faqs', label: 'Technical & Procurement FAQs' },
  { path: '/programs/quote', label: '24-Hour Custom BoQ Quote' },
  { path: '/programs/government-education-pricing', label: 'FBR GST/NTN & Gov/Ed Pricing' },
  { path: '/programs/reseller-program', label: 'B2B Sub-Distributor Program' },
  { path: '/programs/provisioning-services', label: 'Zero-Touch SIP Provisioning' },
  { path: '/programs/fulfillment-services', label: 'Nationwide Rollout Fulfillment' },
  { path: '/programs/blind-drop-shipping', label: 'Blind Drop Shipping Program' },
  { path: '/programs/promotions', label: 'Enterprise Hardware Promotions' },
  { path: '/voip-service-providers', label: 'VoIP & SIP Trunking Matrix' },
  { path: '/shipping', label: 'Nationwide Insured Shipping' },
  { path: '/returns', label: 'Returns & Warranty Policy' },
  { path: '/payment', label: 'Corporate Payment & PO Terms' },
  { path: '/rma', label: 'Hardware Warranty RMA Portal' },
  { path: '/privacy-policy', label: 'Corporate Privacy Policy' },
  { path: '/terms-of-service', label: 'Enterprise Terms of Service' },
];

export function buildAll155SeoFooterCategories(): SeoFooterCategoryGroup[] {
  const serviceLinks: SeoFooterLinkItem[] = FALLBACK_SERVICES_CATALOG.map((svc) => ({
    path: `/services/${svc.slug}`,
    label: svc.title,
  }));

  const blogLinks: SeoFooterLinkItem[] = FALLBACK_BLOG_CATALOG.map((post) => ({
    path: `/blog/${post.slug}`,
    label: post.title,
  }));

  const seenProductSlugs = new Set<string>();
  const productLinks: SeoFooterLinkItem[] = [];
  for (const rawKey of Object.keys(PRODUCT_GMC_METADATA)) {
    const canonicalSlug = getCanonicalProductSlug({ slug: rawKey }, rawKey);
    if (!canonicalSlug || seenProductSlugs.has(canonicalSlug)) continue;
    seenProductSlugs.add(canonicalSlug);
    const prod = buildFallbackProductFromGmcMeta(canonicalSlug);
    productLinks.push({
      path: `/product/${canonicalSlug}`,
      label: prod?.productName || canonicalSlug,
    });
  }

  return [
    {
      id: 'pillars',
      title: 'Core AV Pillars & Solutions',
      links: CORE_PILLAR_SEO_LINKS,
    },
    {
      id: 'categories',
      title: 'Shop Hardware Categories',
      links: HARDWARE_CATEGORY_SEO_LINKS,
    },
    {
      id: 'services',
      title: 'Turnkey Event & AI Services',
      links: serviceLinks,
    },
    {
      id: 'brands',
      title: 'Authorized OEM Brand Portals',
      links: BRAND_PORTAL_SEO_LINKS,
    },
    {
      id: 'programs-cities',
      title: 'Regional Hubs, B2B & Policies',
      links: B2B_REGIONAL_AND_POLICY_SEO_LINKS,
    },
    {
      id: 'guides-blog',
      title: 'Technical Guides & Comparisons',
      links: blogLinks,
    },
    {
      id: 'products',
      title: 'Enterprise Hardware SKUs (53)',
      links: productLinks,
    },
  ];
}

export const FooterAccordion: React.FC<FooterAccordionProps> = ({
  categories,
  defaultOpenId = null,
}) => {
  const groups = useMemo(
    () => (categories && categories.length > 0 ? categories : buildAll155SeoFooterCategories()),
    [categories]
  );

  const [openGroupId, setOpenGroupId] = useState<string | null>(defaultOpenId);

  const totalLinkCount = useMemo(
    () => groups.reduce((acc, group) => acc + group.links.length, 0),
    [groups]
  );

  const toggleGroup = (id: string) => {
    setOpenGroupId((prev) => (prev === id ? null : id));
  };

  return (
    <nav
      aria-label={`Complete Directory of ${totalLinkCount} Enterprise AV Links`}
      className="lg:hidden mb-5 space-y-1.5"
    >
      <div className="flex items-center justify-between px-1 mb-1">
        <span className="text-[11px] font-black uppercase tracking-wider text-white/90">
          Quick Site Directory ({totalLinkCount} Pages)
        </span>
        <Link
          to="/sitemap"
          className="text-[11px] font-bold text-[#00B4D8] hover:text-white py-1 inline-flex items-center justify-end"
        >
          View All →
        </Link>
      </div>

      {groups.map((group) => {
        const isOpen = openGroupId === group.id;
        const panelId = `footer-accordion-panel-${group.id}`;
        const buttonId = `footer-accordion-btn-${group.id}`;

        return (
          <div
            key={group.id}
            className="bg-white/5 rounded-xl border border-white/10 overflow-hidden"
          >
            <button
              id={buttonId}
              type="button"
              onClick={() => toggleGroup(group.id)}
              aria-expanded={isOpen}
              aria-controls={panelId}
              className="w-full min-h-[38px] px-3.5 py-2 flex items-center justify-between text-left text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              <span className="font-bold text-[11px] sm:text-xs uppercase tracking-wider">
                {group.title}{' '}
                <span className="text-white/60 font-semibold text-[10px] ml-1">
                  ({group.links.length})
                </span>
              </span>
              <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-[#00B4D8]' : 'text-white/80'
                  }`}
                />
              </span>
            </button>

            <ul
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className={`${
                isOpen ? 'grid' : 'hidden'
              } grid-cols-2 gap-x-3 gap-y-0.5 px-3.5 pb-2.5 pt-1.5 border-t border-white/10 text-[11px] text-gray-200`}
            >
              {group.links.map((item) => (
                <li key={item.path} className="min-w-0">
                  <Link
                    to={item.path}
                    className="hover:text-[#00B4D8] transition-colors block py-1 leading-snug truncate"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </nav>
  );
};
