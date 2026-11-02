import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail } from 'lucide-react';
import { useState, useEffect } from 'react';
import { subscribeToCategories } from '../lib/firebase/firestore-helpers';
import { EXCLUDED_CATEGORY_SLUGS } from '../lib/sitemap-generator';

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
    <footer className="bg-[#1C4E70] text-white pt-12 pb-safe pb-24 lg:pb-8">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <h2 className="sr-only">Footer Navigation, Social Media &amp; Contact Directory</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Shop */}
          <div>
            <h3 className="font-bold text-lg mb-6 uppercase tracking-wider">Shop Hardware</h3>
            <ul className="space-y-3 text-sm text-gray-200">
              {categories.map(cat => (
                <li key={cat.id}>
                  <Link to={`/category/${cat.slug || cat.id}`} className="hover:text-[#00B4D8] transition-colors inline-block py-1">
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/shop" className="hover:text-[#00B4D8] transition-colors font-semibold text-white inline-block py-1">
                  All Enterprise AV Hardware (53 SKUs)
                </Link>
              </li>
            </ul>
          </div>

          {/* Information */}
          <div>
            <h3 className="font-bold text-lg mb-6 uppercase tracking-wider">Information &amp; SEO Hubs</h3>
            <ul className="space-y-3 text-sm text-gray-200">
              <li><Link to="/about" className="hover:text-[#00B4D8] transition-colors inline-block py-1">About AV Live</Link></li>
              <li><Link to="/video-conference-in-pakistan" className="hover:text-[#00B4D8] transition-colors font-semibold text-white inline-block py-1">Video Conference in Pakistan</Link></li>
              <li><Link to="/corporate-event-management" className="hover:text-[#00B4D8] transition-colors font-semibold text-white inline-block py-1">Corporate Event Management</Link></li>
              <li><Link to="/video-conferencing" className="hover:text-[#00B4D8] transition-colors inline-block py-1">Video Conferencing Hardware Hub</Link></li>
              <li><Link to="/events-services" className="hover:text-[#00B4D8] transition-colors inline-block py-1">Event Production &amp; Staging</Link></li>
              <li><Link to="/3d-hologram" className="hover:text-[#00B4D8] transition-colors inline-block py-1">3D Hologram Displays</Link></li>
              <li><Link to="/projection-mapping" className="hover:text-[#00B4D8] transition-colors inline-block py-1">3D Projection Mapping</Link></li>
              <li><Link to="/zoom-rooms" className="hover:text-[#00B4D8] transition-colors inline-block py-1">Zoom Rooms Pakistan</Link></li>
              <li><Link to="/microsoft-teams-rooms" className="hover:text-[#00B4D8] transition-colors inline-block py-1">Microsoft Teams Rooms</Link></li>
              <li><Link to="/guides" className="hover:text-[#00B4D8] transition-colors inline-block py-1">Enterprise AV Buyer's Guides</Link></li>
              <li><Link to="/compare" className="hover:text-[#00B4D8] transition-colors inline-block py-1">Boardroom Comparison Charts</Link></li>
              <li><Link to="/faqs" className="hover:text-[#00B4D8] transition-colors inline-block py-1">Technical FAQs</Link></li>
              <li><Link to="/payment" className="hover:text-[#00B4D8] transition-colors inline-block py-1">Payment Methods</Link></li>
              <li><Link to="/returns" className="hover:text-[#00B4D8] transition-colors inline-block py-1">Returns &amp; Warranty Policy</Link></li>
              <li><Link to="/rma" className="hover:text-[#00B4D8] transition-colors inline-block py-1">RMA Service Form</Link></li>
              <li><Link to="/shipping" className="hover:text-[#00B4D8] transition-colors inline-block py-1">Nationwide Shipping Methods</Link></li>
              <li><Link to="/reviews" className="hover:text-[#00B4D8] transition-colors inline-block py-1">Verified Customer Reviews</Link></li>
              <li><Link to="/sitemap" className="hover:text-[#00B4D8] transition-colors font-bold text-[#00B4D8] inline-block py-1">Complete HTML Sitemap (155 Pages)</Link></li>
            </ul>
          </div>

          {/* Programs */}
          <div>
            <h3 className="font-bold text-lg mb-6 uppercase tracking-wider">Programs &amp; Cities</h3>
            <ul className="space-y-3 text-sm text-gray-200">
              <li><Link to="/programs/blind-drop-shipping" className="hover:text-[#00B4D8] transition-colors inline-block py-1">Blind Drop Shipping</Link></li>
              <li><Link to="/programs/government-education-pricing" className="hover:text-[#00B4D8] transition-colors inline-block py-1">FBR GST/NTN &amp; Gov/Ed Pricing</Link></li>
              <li><Link to="/programs/fulfillment-services" className="hover:text-[#00B4D8] transition-colors inline-block py-1">Product Fulfillment Services</Link></li>
              <li><Link to="/programs/promotions" className="hover:text-[#00B4D8] transition-colors inline-block py-1">Hardware Promotions</Link></li>
              <li><Link to="/programs/provisioning-services" className="hover:text-[#00B4D8] transition-colors inline-block py-1">SIP Provisioning Services</Link></li>
              <li><Link to="/programs/quote" className="hover:text-[#00B4D8] transition-colors inline-block py-1">24-Hour Custom BoQ Quote</Link></li>
              <li><Link to="/event-quote" className="hover:text-[#00B4D8] transition-colors inline-block py-1">24-Hour Custom Event Quote</Link></li>
              <li><Link to="/programs/reseller-program" className="hover:text-[#00B4D8] transition-colors inline-block py-1">B2B Reseller Program</Link></li>
              <li><Link to="/voip-service-providers" className="hover:text-[#00B4D8] transition-colors inline-block py-1">VoIP Service Providers</Link></li>
              <li><Link to="/lahore" className="hover:text-[#00B4D8] transition-colors inline-block py-1">AV Live Lahore (Integration Hub)</Link></li>
              <li><Link to="/karachi" className="hover:text-[#00B4D8] transition-colors inline-block py-1">AV Live Karachi Regional Hub</Link></li>
              <li><Link to="/islamabad" className="hover:text-[#00B4D8] transition-colors inline-block py-1">AV Live Islamabad Regional Hub</Link></li>
            </ul>
          </div>

          {/* Contact & Social Media */}
          <div>
            <h3 className="font-bold text-lg mb-6 uppercase tracking-wider">Contact &amp; Social Media</h3>
            <ul className="space-y-5 text-sm text-gray-200">
              <li className="flex items-start gap-4">
                <MapPin className="shrink-0 w-5 h-5 mt-0.5" />
                <div>
                  Johar Town Block N<br />
                  Lahore, Pakistan
                </div>
              </li>
              <li className="flex items-start gap-4">
                <Phone className="shrink-0 w-5 h-5 mt-0.5" />
                <div>
                  <a href="tel:+923214256263" className="hover:text-[#00B4D8] transition-colors">+92 321 425 6263</a> / <a href="tel:+924232334782" className="hover:text-[#00B4D8] transition-colors">+92 42 3233 4782</a>
                </div>
              </li>
              <li className="flex items-center gap-4">
                <Mail className="shrink-0 w-5 h-5" />
                <a href="mailto:info@avlive.com.pk" className="hover:text-[#00B4D8] transition-colors">info@avlive.com.pk</a>
              </li>
            </ul>

            <div className="mt-6">
              <div className="text-xs font-bold uppercase tracking-wider text-gray-200 mb-3">Follow AV Live Official Channels</div>
              <div className="flex flex-wrap gap-2.5">
                <a
                  href="https://www.youtube.com/@avlivepk"
                  target="_blank"
                  rel="noopener"
                  aria-label="AV Live on YouTube"
                  className="px-3.5 py-2.5 min-h-[44px] bg-white/10 hover:bg-[#00B4D8] hover:text-[#1A2B4C] rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                >
                  YouTube
                </a>
                <a
                  href="https://x.com/avlivepk"
                  target="_blank"
                  rel="noopener"
                  aria-label="AV Live on X (Twitter)"
                  className="px-3.5 py-2.5 min-h-[44px] bg-white/10 hover:bg-[#00B4D8] hover:text-[#1A2B4C] rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                >
                  X (Twitter)
                </a>
                <a
                  href="https://www.linkedin.com/company/avlivepk"
                  target="_blank"
                  rel="noopener"
                  aria-label="AV Live on LinkedIn"
                  className="px-3.5 py-2.5 min-h-[44px] bg-white/10 hover:bg-[#00B4D8] hover:text-[#1A2B4C] rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                >
                  LinkedIn
                </a>
                <a
                  href="https://www.instagram.com/avlivepk"
                  target="_blank"
                  rel="noopener"
                  aria-label="AV Live on Instagram"
                  className="px-3.5 py-2.5 min-h-[44px] bg-white/10 hover:bg-[#00B4D8] hover:text-[#1A2B4C] rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                >
                  Instagram
                </a>
                <a
                  href="https://www.facebook.com/avlivepk"
                  target="_blank"
                  rel="noopener"
                  aria-label="AV Live on Facebook"
                  className="px-3.5 py-2.5 min-h-[44px] bg-white/10 hover:bg-[#00B4D8] hover:text-[#1A2B4C] rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                >
                  Facebook
                </a>
              </div>
            </div>

            <div className="mt-6">
              <Link to="/contact" className="border-b-2 border-white pb-1 font-bold text-white hover:text-[#00B4D8] hover:border-[#00B4D8] transition-colors text-base uppercase tracking-wider inline-block py-2">
                Request Engineering Consultation
              </Link>
            </div>
          </div>
        </div>

        {/* Global OEM & Ecosystem Reference Links */}
        <div className="border-t border-[#2A658E] py-6 mb-4">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-200 mb-3">
            Global Unified Communications &amp; OEM Technology Partners
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-200">
            <a href="https://www.ipphone-warehouse.com/" target="_blank" rel="noopener" className="hover:text-[#00B4D8] transition-colors py-1">IP Phone Warehouse</a>
            <a href="https://www.hp.com/" target="_blank" rel="noopener" className="hover:text-[#00B4D8] transition-colors py-1">HP.com (HP Poly)</a>
            <a href="https://www.plantronics.com/" target="_blank" rel="noopener" className="hover:text-[#00B4D8] transition-colors py-1">Plantronics.com Headsets</a>
            <a href="https://www.cisco.com/" target="_blank" rel="noopener" className="hover:text-[#00B4D8] transition-colors py-1">Cisco.com Collaboration</a>
            <a href="https://zoom.us/" target="_blank" rel="noopener" className="hover:text-[#00B4D8] transition-colors py-1">Zoom.us Certified Rooms</a>
            <a href="https://www.webex.com/" target="_blank" rel="noopener" className="hover:text-[#00B4D8] transition-colors py-1">Webex.com Enterprise</a>
            <a href="https://www.323.tv/" target="_blank" rel="noopener" className="hover:text-[#00B4D8] transition-colors py-1">323.tv H.323 &amp; Cloud Video</a>
          </div>
        </div>
        
        <div className="border-t border-[#2A658E] pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-200">
          <div>
            &copy; {new Date().getFullYear()} AV LIVE COMMUNICATIONS. All rights reserved.
          </div>
          <div className="flex flex-wrap gap-6">
            <Link to="/sitemap" className="hover:text-white transition-colors font-semibold py-1">HTML Sitemap</Link>
            <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors py-1">XML Sitemap</a>
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('open-cookie-settings'))}
              className="hover:text-white transition-colors py-1 cursor-pointer"
            >
              Cookie Settings
            </button>
            <Link to="/privacy-policy" className="hover:text-white transition-colors py-1">Privacy Policy</Link>
            <Link to="/terms-of-service" className="hover:text-white transition-colors py-1">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
