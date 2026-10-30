import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail } from 'lucide-react';
import { useState, useEffect } from 'react';
import { subscribeToCategories } from '../lib/firebase/firestore-helpers';

const DEFAULT_FOOTER_CATEGORIES = [
  { id: 'cat-projectors', name: 'Projectors', slug: 'projectors', isActive: true, type: 'product' },
  { id: 'cat-voip', name: 'VoIP Phone Systems', slug: 'voip-phone-systems', isActive: true, type: 'product' },
  { id: 'cat-intercom', name: 'Intercom, Paging & Access', slug: 'intercom-paging-access', isActive: true, type: 'product' },
  { id: 'cat-video', name: 'Video Conferencing', slug: 'video-conferencing', isActive: true, type: 'product' },
  { id: 'cat-headsets', name: 'Headsets', slug: 'headsets', isActive: true, type: 'product' },
  { id: 'cat-phones', name: 'IP Phones', slug: 'ip-phones', isActive: true, type: 'product' },
];

export function Footer() {
  const [categories, setCategories] = useState<any[]>(DEFAULT_FOOTER_CATEGORIES);

  useEffect(() => {
    const unsub = subscribeToCategories((cats) => {
      const filtered = cats.filter(c => c.isActive && ((c as any).type === 'product' || !(c as any).type || c.id.startsWith('parent-') || c.id.startsWith('child-')));
      if (filtered.length > 0) {
        setCategories(filtered);
      }
    });
    return () => unsub();
  }, []);

  return (
    <footer className="bg-[#1C4E70] text-white pt-12 pb-safe pb-24 lg:pb-8">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <h2 className="sr-only">Footer Navigation &amp; Contact Directory</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Shop */}
          <div>
            <h3 className="font-bold text-lg mb-6 uppercase tracking-wider">Shop</h3>
            <ul className="space-y-4 text-sm text-gray-200">
              {categories.map(cat => (
                <li key={cat.id}>
                  <Link to={`/category/${cat.slug || cat.id}`} className="hover:text-[#00B4D8] transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li><Link to="/shop" className="hover:text-[#00B4D8] transition-colors">More</Link></li>
            </ul>
          </div>

          {/* Information */}
          <div>
            <h3 className="font-bold text-lg mb-6 uppercase tracking-wider">Information &amp; SEO Hubs</h3>
            <ul className="space-y-4 text-sm text-gray-200">
              <li><Link to="/about" className="hover:text-[#00B4D8] transition-colors">About Us</Link></li>
              <li><Link to="/video-conferencing" className="hover:text-[#00B4D8] transition-colors">Video Conferencing in Pakistan</Link></li>
              <li><Link to="/events-services" className="hover:text-[#00B4D8] transition-colors">Corporate Event Management</Link></li>
              <li><Link to="/3d-hologram" className="hover:text-[#00B4D8] transition-colors">3D Hologram Displays</Link></li>
              <li><Link to="/projection-mapping" className="hover:text-[#00B4D8] transition-colors">3D Projection Mapping</Link></li>
              <li><Link to="/zoom-rooms" className="hover:text-[#00B4D8] transition-colors">Zoom Rooms Pakistan</Link></li>
              <li><Link to="/microsoft-teams-rooms" className="hover:text-[#00B4D8] transition-colors">Microsoft Teams Rooms</Link></li>
              <li><Link to="/guides" className="hover:text-[#00B4D8] transition-colors">Buyer's Guides</Link></li>
              <li><Link to="/compare" className="hover:text-[#00B4D8] transition-colors">Comparison Charts</Link></li>
              <li><Link to="/faqs" className="hover:text-[#00B4D8] transition-colors">FAQs</Link></li>
              <li><Link to="/payment" className="hover:text-[#00B4D8] transition-colors">Payment Methods</Link></li>
              <li><Link to="/returns" className="hover:text-[#00B4D8] transition-colors">Returns</Link></li>
              <li><Link to="/rma" className="hover:text-[#00B4D8] transition-colors">RMA Form</Link></li>
              <li><Link to="/shipping" className="hover:text-[#00B4D8] transition-colors">Shipping Methods</Link></li>
              <li><Link to="/reviews" className="hover:text-[#00B4D8] transition-colors">Verified Customer Reviews</Link></li>
            </ul>
          </div>

          {/* Programs */}
          <div>
            <h3 className="font-bold text-lg mb-6 uppercase tracking-wider">Programs &amp; Cities</h3>
            <ul className="space-y-4 text-sm text-gray-200">
              <li><Link to="/programs/blind-drop-shipping" className="hover:text-[#00B4D8] transition-colors">Blind Drop Shipping</Link></li>
              <li><Link to="/programs/government-education-pricing" className="hover:text-[#00B4D8] transition-colors">Government &amp; Education Pricing</Link></li>
              <li><Link to="/programs/fulfillment-services" className="hover:text-[#00B4D8] transition-colors">Product Fulfillment Services</Link></li>
              <li><Link to="/programs/promotions" className="hover:text-[#00B4D8] transition-colors">Promotions</Link></li>
              <li><Link to="/programs/provisioning-services" className="hover:text-[#00B4D8] transition-colors">Provisioning Services</Link></li>
              <li><Link to="/event-quote" className="hover:text-[#00B4D8] transition-colors">24-Hour Custom Quote</Link></li>
              <li><Link to="/programs/reseller-program" className="hover:text-[#00B4D8] transition-colors">Reseller Program</Link></li>
              <li><Link to="/voip-service-providers" className="hover:text-[#00B4D8] transition-colors">VoIP Service Providers</Link></li>
              <li><Link to="/lahore" className="hover:text-[#00B4D8] transition-colors">AV &amp; Events Lahore</Link></li>
              <li><Link to="/karachi" className="hover:text-[#00B4D8] transition-colors">AV &amp; Events Karachi</Link></li>
              <li><Link to="/islamabad" className="hover:text-[#00B4D8] transition-colors">AV &amp; Events Islamabad</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-lg mb-6 uppercase tracking-wider">Contact</h3>
            <ul className="space-y-6 text-sm text-gray-200">
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
                  +92 321 425 6263 / +92 42 3233 4782
                </div>
              </li>
              <li className="flex items-center gap-4">
                <Mail className="shrink-0 w-5 h-5" />
                <a href="mailto:info@avlive.com.pk" className="hover:text-[#00B4D8] transition-colors">info@avlive.com.pk</a>
              </li>
            </ul>
            <div className="mt-8">
               <Link to="/contact" className="border-b-2 border-white pb-1 font-bold text-white hover:text-[#00B4D8] hover:border-[#00B4D8] transition-colors text-lg uppercase tracking-wider inline-block">
                 Ask an Expert
               </Link>
            </div>
          </div>
        </div>
        
        <div className="border-t border-[#2A658E] pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-300">
          <div>
            &copy; {new Date().getFullYear()} AV LIVE COMMUNICATIONS. All rights reserved.
          </div>
          <div className="flex gap-6">
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('open-cookie-settings'))}
              className="hover:text-white transition-colors"
            >
              Cookie Settings
            </button>
            <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
