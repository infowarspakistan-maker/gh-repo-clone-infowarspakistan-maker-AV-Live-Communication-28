import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';

export function PrivacyPolicy() {
  return (
    <div className="flex-1 w-full bg-[#f8f9fa] pb-16">
      <SEO title="Privacy Policy" />
      <div className="bg-[#1A2B4C] text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-4">Privacy Policy</h1>
          <p className="text-gray-300">Last Updated: July 11, 2026</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-16 bg-white p-8 md:p-12 rounded-3xl border border-gray-200 shadow-sm">
        <div className="prose prose-lg max-w-none text-gray-700">
          <p className="lead text-xl text-[#1A2B4C] font-medium mb-8">
            At AV Live Communications (avlive.com.pk), we take your privacy seriously. This policy describes how we collect, use, and safeguard your information when you visit our website, purchase products, or use our services.
          </p>

          <h2 className="text-2xl font-black text-[#1A2B4C] mt-8 mb-4">1. Information We Collect</h2>
          <p>We collect information to provide better services to our customers:</p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li><strong>Personal Identification Data:</strong> Name, email address, phone number, shipping/billing address.</li>
            <li><strong>Business Data:</strong> Company name, NTN (National Tax Number), job title, and procurement details.</li>
            <li><strong>Technical Data:</strong> IP address, browser type, device information, and cookies (used for site functionality and analytics).</li>
            <li><strong>Transaction Data:</strong> Order history, payment details (processed securely via Stripe), and service requests.</li>
          </ul>

          <h2 className="text-2xl font-black text-[#1A2B4C] mt-8 mb-4">2. How We Use Your Information</h2>
          <p>We use your data to:</p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Process and fulfill your orders (shipping, invoicing, and after-sales support).</li>
            <li>Deliver our services (event management, AI development, installations).</li>
            <li>Communicate with you about order updates, promotions, and technical support.</li>
            <li>Improve our website, products, and customer experience.</li>
            <li>Comply with legal obligations and prevent fraud.</li>
          </ul>

          <h2 className="text-2xl font-black text-[#1A2B4C] mt-8 mb-4">3. How We Share Your Information</h2>
          <p>We do not sell, trade, or rent your personal data to third parties. However, we may share data with:</p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li><strong>Trusted Partners:</strong> Courier services (TCS, Leopards) for delivery; payment gateways (Stripe) for transaction processing.</li>
            <li><strong>Service Providers:</strong> IT infrastructure, cloud hosting, and analytics tools (e.g., Google Analytics).</li>
            <li><strong>Legal Compliance:</strong> If required by Pakistani law or regulatory authorities (PECA, FIA).</li>
          </ul>

          <h2 className="text-2xl font-black text-[#1A2B4C] mt-8 mb-4">4. Data Security</h2>
          <p className="mb-6">We implement industry-standard security measures (SSL encryption, firewalls, and access controls) to protect your data. While we strive to protect your data, no online transmission is 100% secure.</p>

          <h2 className="text-2xl font-black text-[#1A2B4C] mt-8 mb-4">5. Cookies</h2>
          <p className="mb-6">We use cookies to enhance your browsing experience, remember your cart, and analyze site traffic. You can disable cookies in your browser settings, though this may affect site functionality.</p>

          <h2 className="text-2xl font-black text-[#1A2B4C] mt-8 mb-4">6. Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Access the personal data we hold about you.</li>
            <li>Request corrections to inaccurate data.</li>
            <li>Request deletion of your data (subject to legal/order retention requirements).</li>
            <li>Withdraw consent for marketing communications.</li>
          </ul>

          <h2 className="text-2xl font-black text-[#1A2B4C] mt-8 mb-4">7. Data Retention</h2>
          <p className="mb-6">We retain your data only as long as necessary for order fulfillment, legal compliance, and business operations (minimum of 5 years for tax/audit purposes).</p>

          <h2 className="text-2xl font-black text-[#1A2B4C] mt-8 mb-4">8. Third-Party Links</h2>
          <p className="mb-6">Our website may contain links to partner brands (Polycom, Cisco). We are not responsible for their privacy practices; please review their policies separately.</p>

          <h2 className="text-2xl font-black text-[#1A2B4C] mt-8 mb-4">9. Children's Privacy</h2>
          <p className="mb-6">Our services are strictly for businesses and adults over 18. We do not knowingly collect data from minors.</p>

          <h2 className="text-2xl font-black text-[#1A2B4C] mt-8 mb-4">10. Updates to This Policy</h2>
          <p className="mb-6">We may update this policy periodically. Changes will be posted on this page with an updated "Last Updated" date.</p>

          <h2 className="text-2xl font-black text-[#1A2B4C] mt-8 mb-4">11. Contact Us</h2>
          <p className="mb-6">If you have questions about this Privacy Policy, please contact us:</p>
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
            <p className="mb-2"><strong>Address:</strong> Shop, Johar Town Block N, Lahore</p>
            <p className="mb-2"><strong>Phone:</strong> 0321 425 6263</p>
            <p className="mb-0"><strong>Email:</strong> info@avlive.com.pk</p>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-100 text-center">
           <Link to="/" className="inline-flex items-center text-[#00B4D8] font-bold hover:text-[#1A2B4C] transition-colors">
              Return to Homepage <ArrowRight className="ml-2" size={20} />
           </Link>
        </div>
      </div>
    </div>
  );
}
