import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail } from 'lucide-react';
import { useState, useEffect } from 'react';
import { subscribeToCategories } from '../lib/firebase/firestore-helpers';
import { EXCLUDED_CATEGORY_SLUGS } from '../lib/sitemap-generator';
import { FooterAccordion } from './FooterAccordion';

const DEFAULT_FOOTER_CATEGORIES = [
  { id: 'cat-video', name: 'Video Conferencing', slug: 'video-conferencing', isActive: true, type: 'product' },
  { id: 'cat-codecs', name: 'Boardroom Codecs', slug: 'boardroom-codecs', isActive: true, type: 'product' },
  { id: 'cat-large-room', name: 'Large Room AV', slug: 'large-room', isActive: true, type: 'product' },
  { id: 'cat-ptz', name: 'PTZ Cameras', slug: 'ptz-cameras', isActive: true, type: 'product' },
  { id: 'cat-touch', name: 'Touch Panels & Displays', slug: 'touch-panels', isActive: true, type: 'product' },
  { id: 'cat-speakerphones', name: 'Speakerphones & Mics', slug: 'speakerphones', isActive: true, type: 'product' },
  { id: 'cat-phones', name: 'IP Phones', slug: 'ip-phones', isActive: true, type: 'product' },
  { id: 'cat-voip', name: 'VoIP Phone Systems', slug: 'voip-phone-systems', isActive: true, type: 'product' },
  { id: 'cat-headsets', name: 'Headsets', slug: 'headsets', isActive: true, type: 'product' },
  { id: 'cat-projectors', name: 'Projectors', slug: 'projectors', isActive: true, type: 'product' },
  { id: 'cat-cameras', name: 'IP Cameras', slug: 'ip-cameras', isActive: true, type: 'product' },
  { id: 'cat-intercom', name: 'Intercom, Paging & Access', slug: 'intercom-paging-access', isActive: true, type: 'product' },
];

export function Footer() {
  const [categories, setCategories] = useState<any[]>(DEFAULT_FOOTER_CATEGORIES);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    const timer = setTimeout(() => {
      unsub = subscribeToCategories((cats) => {
        const filtered = cats.filter(
          c =>
            c.isActive &&
            !EXCLUDED_CATEGORY_SLUGS.has(c.slug) &&
            ((c as any).type === 'product' || c.id.startsWith('cat-') || c.id.startsWith('parent-') || c.id.startsWith('child-'))
        );
        if (filtered.length > 0) {
          setCategories(filtered);
        }
      });
    }, 2000);
    return () => {
      clearTimeout(timer);
      if (unsub) unsub();
    };
  }, []);

  return (
    <footer className="bg-[#1C4E70] text-white pt-6 lg:pt-8 pb-safe pb-16 lg:pb-6">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-6 md:px-8">
        <h2 className="sr-only">Footer Navigation, Social Media &amp; Contact Directory</h2>

        {/* Collapsible 155-Link SEO Accordion Directory (Mobile < 1024px) */}
        <FooterAccordion />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8 mb-6 lg:mb-8">
          {/* Shop (Desktop >= 1024px) */}
          <div className="hidden lg:block">
            <h3 className="font-bold text-xs lg:text-sm mb-3 uppercase tracking-wider">Shop Hardware</h3>
            <ul className="space-y-1.5 text-xs text-gray-200">
              {categories.map(cat => (
                <li key={cat.id}>
                  <Link to={`/category/${cat.slug || cat.id}`} className="hover:text-[#00B4D8] transition-colors inline-flex items-center py-0.5">
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/shop" className="hover:text-[#00B4D8] transition-colors font-semibold text-white inline-flex items-center py-0.5">
                  All Enterprise AV Hardware (53 SKUs)
                </Link>
              </li>
            </ul>
          </div>

          {/* Information (Desktop >= 1024px) */}
          <div className="hidden lg:block">
            <h3 className="font-bold text-xs lg:text-sm mb-3 uppercase tracking-wider">Information &amp; SEO Hubs</h3>
            <ul className="space-y-1.5 text-xs text-gray-200">
              <li><Link to="/about" className="hover:text-[#00B4D8] transition-colors inline-flex items-center py-0.5">About AV Live</Link></li>
              <li><Link to="/video-conference-in-pakistan" className="hover:text-[#00B4D8] transition-colors font-semibold text-white inline-flex items-center py-0.5">Video Conference in Pakistan</Link></li>
              <li><Link to="/corporate-event-management" className="hover:text-[#00B4D8] transition-colors font-semibold text-white inline-flex items-center py-0.5">Corporate Event Management</Link></li>
              <li><Link to="/video-conferencing" className="hover:text-[#00B4D8] transition-colors inline-flex items-center py-0.5">Video Conferencing Hardware Hub</Link></li>
              <li><Link to="/events-services" className="hover:text-[#00B4D8] transition-colors inline-flex items-center py-0.5">Event Production &amp; Staging</Link></li>
              <li><Link to="/3d-hologram" className="hover:text-[#00B4D8] transition-colors inline-flex items-center py-0.5">3D Hologram Displays</Link></li>
              <li><Link to="/projection-mapping" className="hover:text-[#00B4D8] transition-colors inline-flex items-center py-0.5">3D Projection Mapping</Link></li>
              <li><Link to="/zoom-rooms" className="hover:text-[#00B4D8] transition-colors inline-flex items-center py-0.5">Zoom Rooms Pakistan</Link></li>
              <li><Link to="/microsoft-teams-rooms" className="hover:text-[#00B4D8] transition-colors inline-flex items-center py-0.5">Microsoft Teams Rooms</Link></li>
              <li><Link to="/guides" className="hover:text-[#00B4D8] transition-colors inline-flex items-center py-0.5">Enterprise AV Buyer's Guides</Link></li>
              <li><Link to="/compare" className="hover:text-[#00B4D8] transition-colors inline-flex items-center py-0.5">Boardroom Comparison Charts</Link></li>
              <li><Link to="/faqs" className="hover:text-[#00B4D8] transition-colors inline-flex items-center py-0.5">Technical FAQs</Link></li>
              <li><Link to="/payment" className="hover:text-[#00B4D8] transition-colors inline-flex items-center py-0.5">Payment Methods</Link></li>
              <li><Link to="/returns" className="hover:text-[#00B4D8] transition-colors inline-flex items-center py-0.5">Returns &amp; Warranty Policy</Link></li>
              <li><Link to="/rma" className="hover:text-[#00B4D8] transition-colors inline-flex items-center py-0.5">RMA Service Form</Link></li>
              <li><Link to="/shipping" className="hover:text-[#00B4D8] transition-colors inline-flex items-center py-0.5">Nationwide Shipping Methods</Link></li>
              <li><Link to="/reviews" className="hover:text-[#00B4D8] transition-colors inline-flex items-center py-0.5">Verified Customer Reviews</Link></li>
              <li><Link to="/sitemap" className="hover:text-[#00B4D8] transition-colors font-bold text-[#00B4D8] inline-flex items-center py-0.5">Complete HTML Sitemap (155 Pages)</Link></li>
            </ul>
          </div>

          {/* Programs (Desktop >= 1024px) */}
          <div className="hidden lg:block">
            <h3 className="font-bold text-xs lg:text-sm mb-3 uppercase tracking-wider">Programs &amp; Cities</h3>
            <ul className="space-y-1.5 text-xs text-gray-200">
              <li><Link to="/programs/blind-drop-shipping" className="hover:text-[#00B4D8] transition-colors inline-flex items-center py-0.5">Blind Drop Shipping</Link></li>
              <li><Link to="/programs/government-education-pricing" className="hover:text-[#00B4D8] transition-colors inline-flex items-center py-0.5">FBR GST/NTN &amp; Gov/Ed Pricing</Link></li>
              <li><Link to="/programs/fulfillment-services" className="hover:text-[#00B4D8] transition-colors inline-flex items-center py-0.5">Product Fulfillment Services</Link></li>
              <li><Link to="/programs/promotions" className="hover:text-[#00B4D8] transition-colors inline-flex items-center py-0.5">Hardware Promotions</Link></li>
              <li><Link to="/programs/provisioning-services" className="hover:text-[#00B4D8] transition-colors inline-flex items-center py-0.5">SIP Provisioning Services</Link></li>
              <li><Link to="/programs/quote" className="hover:text-[#00B4D8] transition-colors inline-flex items-center py-0.5">24-Hour Custom BoQ Quote</Link></li>
              <li><Link to="/event-quote" className="hover:text-[#00B4D8] transition-colors inline-flex items-center py-0.5">24-Hour Custom Event Quote</Link></li>
              <li><Link to="/programs/reseller-program" className="hover:text-[#00B4D8] transition-colors inline-flex items-center py-0.5">B2B Reseller Program</Link></li>
              <li><Link to="/voip-service-providers" className="hover:text-[#00B4D8] transition-colors inline-flex items-center py-0.5">VoIP Service Providers</Link></li>
              <li><Link to="/lahore" className="hover:text-[#00B4D8] transition-colors inline-flex items-center py-0.5">AV Live Lahore (Integration Hub)</Link></li>
              <li><Link to="/karachi" className="hover:text-[#00B4D8] transition-colors inline-flex items-center py-0.5">AV Live Karachi Regional Hub</Link></li>
              <li><Link to="/islamabad" className="hover:text-[#00B4D8] transition-colors inline-flex items-center py-0.5">AV Live Islamabad Regional Hub</Link></li>
            </ul>
          </div>

          {/* Contact & Social Media */}
          <div className="bg-white/5 lg:bg-transparent rounded-xl lg:rounded-none p-3.5 lg:p-0 border border-white/10 lg:border-0">
            <h3 className="font-bold text-xs lg:text-sm mb-2.5 lg:mb-3 uppercase tracking-wider">Contact &amp; Social Media</h3>
            <ul className="space-y-2.5 text-xs text-gray-200">
              <li className="flex items-start gap-2.5">
                <MapPin className="shrink-0 w-4 h-4 mt-0.5 text-[#00B4D8]" />
                <div>
                  Johar Town Block N, Lahore, Pakistan
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone className="shrink-0 w-4 h-4 mt-0.5 text-[#00B4D8]" />
                <div className="flex flex-wrap items-center gap-x-1.5">
                  <a href="tel:+923214256263" className="hover:text-[#00B4D8] transition-colors py-0.5">+92 321 425 6263</a> / <a href="tel:+924232334782" className="hover:text-[#00B4D8] transition-colors py-0.5">+92 42 3233 4782</a>
                </div>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="shrink-0 w-4 h-4 text-[#00B4D8]" />
                <a href="mailto:info@avlive.com.pk" className="hover:text-[#00B4D8] transition-colors py-0.5">info@avlive.com.pk</a>
              </li>
            </ul>

            <div className="mt-3.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-300 mb-2">Official Channels</div>
              <div className="flex flex-wrap gap-1.5">
                <a
                  href="https://www.youtube.com/@avlivepk"
                  target="_blank"
                  rel="noopener"
                  aria-label="AV Live on YouTube"
                  className="px-2.5 py-1.5 min-h-[30px] bg-white/10 hover:bg-[#00B4D8] hover:text-[#1A2B4C] rounded-lg text-[11px] font-bold transition-colors inline-flex items-center justify-center"
                >
                  YouTube
                </a>
                <a
                  href="https://x.com/avlivepk"
                  target="_blank"
                  rel="noopener"
                  aria-label="AV Live on X (Twitter)"
                  className="px-2.5 py-1.5 min-h-[30px] bg-white/10 hover:bg-[#00B4D8] hover:text-[#1A2B4C] rounded-lg text-[11px] font-bold transition-colors inline-flex items-center justify-center"
                >
                  X
                </a>
                <a
                  href="https://www.linkedin.com/company/avlivepk"
                  target="_blank"
                  rel="noopener"
                  aria-label="AV Live on LinkedIn"
                  className="px-2.5 py-1.5 min-h-[30px] bg-white/10 hover:bg-[#00B4D8] hover:text-[#1A2B4C] rounded-lg text-[11px] font-bold transition-colors inline-flex items-center justify-center"
                >
                  LinkedIn
                </a>
                <a
                  href="https://www.instagram.com/avlivepk"
                  target="_blank"
                  rel="noopener"
                  aria-label="AV Live on Instagram"
                  className="px-2.5 py-1.5 min-h-[30px] bg-white/10 hover:bg-[#00B4D8] hover:text-[#1A2B4C] rounded-lg text-[11px] font-bold transition-colors inline-flex items-center justify-center"
                >
                  Instagram
                </a>
                <a
                  href="https://www.facebook.com/avlivepk"
                  target="_blank"
                  rel="noopener"
                  aria-label="AV Live on Facebook"
                  className="px-2.5 py-1.5 min-h-[30px] bg-white/10 hover:bg-[#00B4D8] hover:text-[#1A2B4C] rounded-lg text-[11px] font-bold transition-colors inline-flex items-center justify-center"
                >
                  Facebook
                </a>
              </div>
            </div>

            <div className="mt-3.5">
              <Link to="/contact" className="border-b border-white pb-0.5 font-bold text-white hover:text-[#00B4D8] hover:border-[#00B4D8] transition-colors text-xs uppercase tracking-wider inline-flex items-center py-1">
                Request Engineering Consultation →
              </Link>
            </div>
          </div>
        </div>

        {/* Global OEM & Ecosystem Reference Links */}
        <div className="border-t border-[#2A658E] py-3.5 mb-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-300 mb-1.5">
            Global Unified Communications &amp; OEM Technology Partners
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-200">
            <a href="https://www.ipphone-warehouse.com/" target="_blank" rel="noopener" className="hover:text-[#00B4D8] transition-colors py-0.5">IP Phone Warehouse</a>
            <a href="https://www.hp.com/" target="_blank" rel="noopener" className="hover:text-[#00B4D8] transition-colors py-0.5">HP.com (HP Poly)</a>
            <a href="https://www.plantronics.com/" target="_blank" rel="noopener" className="hover:text-[#00B4D8] transition-colors py-0.5">Plantronics.com Headsets</a>
            <a href="https://www.cisco.com/" target="_blank" rel="noopener" className="hover:text-[#00B4D8] transition-colors py-0.5">Cisco.com Collaboration</a>
            <a href="https://zoom.us/" target="_blank" rel="noopener" className="hover:text-[#00B4D8] transition-colors py-0.5">Zoom.us Certified Rooms</a>
            <a href="https://www.webex.com/" target="_blank" rel="noopener" className="hover:text-[#00B4D8] transition-colors py-0.5">Webex.com Enterprise</a>
            <a href="https://www.323.tv/" target="_blank" rel="noopener" className="hover:text-[#00B4D8] transition-colors py-0.5">323.tv H.323 &amp; Cloud Video</a>
          </div>
        </div>
        
        <div className="border-t border-[#2A658E] pt-3.5 flex flex-col md:flex-row items-center justify-between gap-2 text-[11px] text-gray-200">
          <div>
            &copy; {new Date().getFullYear()} AV LIVE COMMUNICATIONS. All rights reserved.
          </div>
          <div className="flex flex-wrap gap-4">
            <Link to="/sitemap" className="hover:text-white transition-colors font-semibold py-0.5">HTML Sitemap</Link>
            <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors py-0.5">XML Sitemap</a>
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('open-cookie-settings'))}
              className="hover:text-white transition-colors py-0.5 cursor-pointer"
            >
              Cookie Settings
            </button>
            <Link to="/privacy-policy" className="hover:text-white transition-colors py-0.5">Privacy Policy</Link>
            <Link to="/terms-of-service" className="hover:text-white transition-colors py-0.5">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
