import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';

export function TermsOfService() {
  return (
    <div className="flex-1 w-full bg-[#f8f9fa] pb-16">
      <SEO title="Terms Of Service" />
      <div className="bg-[#1A2B4C] text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-4">Terms of Service</h1>
          <p className="text-gray-300">Last Updated: July 11, 2026</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-16 bg-white p-8 md:p-12 rounded-3xl border border-gray-200 shadow-sm">
        <div className="prose prose-lg max-w-none text-gray-700">
          <p className="lead text-xl text-[#1A2B4C] font-medium mb-8">
            Welcome to AV Live Communications (avlive.com.pk). By accessing our website, purchasing products, or using our services, you agree to comply with the following terms. Please read them carefully.
          </p>

          <h2 className="text-2xl font-black text-[#1A2B4C] mt-8 mb-4">1. Acceptance of Terms</h2>
          <p className="mb-6">By using our website and placing orders, you accept these Terms of Service. If you do not agree, please refrain from using our platform.</p>

          <h2 className="text-2xl font-black text-[#1A2B4C] mt-8 mb-4">2. General Business Information</h2>
          <ul className="list-none pl-0 space-y-2 mb-6">
            <li><strong>Company:</strong> AV Live Communications</li>
            <li><strong>Address:</strong> Shop, Johar Town Block N, Lahore</li>
            <li><strong>Contact:</strong> 0321 425 6263 | info@avlive.com.pk</li>
            <li><strong>Governing Law:</strong> These terms are governed by the laws of the Islamic Republic of Pakistan. Any disputes will be subject to the exclusive jurisdiction of the courts in Lahore.</li>
          </ul>

          <h2 className="text-2xl font-black text-[#1A2B4C] mt-8 mb-4">3. Products & Services</h2>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li><strong>Product Descriptions:</strong> We strive for accuracy in product images, specifications, and pricing. However, errors may occur; we reserve the right to correct inaccuracies.</li>
            <li><strong>Services:</strong> Our service deliverables (Events, AI development, AV integration) will be detailed in individual Service Level Agreements (SLAs) or project quotes.</li>
            <li><strong>Availability:</strong> All products and services are subject to availability. We reserve the right to discontinue any product at any time.</li>
          </ul>

          <h2 className="text-2xl font-black text-[#1A2B4C] mt-8 mb-4">4. Orders & Payments</h2>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li><strong>Order Acceptance:</strong> We reserve the right to accept or cancel any order at our discretion (e.g., stock unavailability, pricing errors, or suspected fraud).</li>
            <li><strong>Pricing:</strong> All prices are listed in Pakistani Rupees (PKR) and are exclusive of applicable sales tax, unless stated otherwise.</li>
            <li><strong>Payment Methods:</strong> We accept Bank Transfer, Cheque, Credit/Debit Cards (via Stripe), and Cash on Delivery (COD) for select items. Payments must be cleared before dispatch (unless credit terms are agreed upon).</li>
          </ul>

          <h2 className="text-2xl font-black text-[#1A2B4C] mt-8 mb-4">5. Shipping & Risk of Loss</h2>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li><strong>Shipping Timelines:</strong> Delivery times are estimates and not guaranteed. We are not liable for courier delays due to weather, strikes, or third-party failures.</li>
            <li><strong>Risk of Loss:</strong> Once the product is handed over to the courier, the risk of loss or damage passes to the buyer. Insurance is optional and can be added at checkout.</li>
          </ul>

          <h2 className="text-2xl font-black text-[#1A2B4C] mt-8 mb-4">6. Returns, Warranty & RMA</h2>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li><strong>Return Policy:</strong> You may return unused, unopened items within 7 days of delivery (subject to our full Returns Policy).</li>
            <li><strong>Warranty Claims:</strong> All products come with manufacturer warranties. For support, please use our RMA Form (/rma). We do not honor warranty claims for misuse, unauthorized repairs, or water/physical damage.</li>
            <li><strong>Service Revisions:</strong> For AI/Development services, revisions are only included if specifically outlined in the project contract.</li>
          </ul>

          <h2 className="text-2xl font-black text-[#1A2B4C] mt-8 mb-4">7. Intellectual Property</h2>
          <p className="mb-6">All content on this website—including logos, images, product descriptions, and code—is the property of AV Live Communications or our partners. You may not copy, reproduce, or distribute any content without explicit written permission.</p>

          <h2 className="text-2xl font-black text-[#1A2B4C] mt-8 mb-4">8. User Conduct</h2>
          <p>You agree not to:</p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Interfere with the security or functionality of our website.</li>
            <li>Upload malicious code, viruses, or spam.</li>
            <li>Misrepresent your identity or engage in fraudulent transactions.</li>
          </ul>

          <h2 className="text-2xl font-black text-[#1A2B4C] mt-8 mb-4">9. Limitation of Liability</h2>
          <p>To the fullest extent permitted by law, AV Live Communications shall not be liable for:</p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Indirect, incidental, or consequential damages.</li>
            <li>Loss of revenue, data, or business interruption.</li>
            <li>Damages exceeding the total purchase price of the product or service in question.</li>
          </ul>
          <p className="mb-6">This limitation applies even if we have been advised of the possibility of such damages.</p>

          <h2 className="text-2xl font-black text-[#1A2B4C] mt-8 mb-4">10. Indemnification</h2>
          <p className="mb-6">You agree to indemnify and hold AV Live Communications harmless from any claims, losses, or expenses arising from your misuse of our site or products.</p>

          <h2 className="text-2xl font-black text-[#1A2B4C] mt-8 mb-4">11. Termination</h2>
          <p className="mb-6">We reserve the right to suspend or terminate your account/access to our website if we believe you have violated these Terms of Service.</p>

          <h2 className="text-2xl font-black text-[#1A2B4C] mt-8 mb-4">12. External Links</h2>
          <p className="mb-6">Our website may include links to third-party sites. We are not responsible for their content or practices.</p>

          <h2 className="text-2xl font-black text-[#1A2B4C] mt-8 mb-4">13. Amendments</h2>
          <p className="mb-6">We reserve the right to update these Terms of Service. Significant changes will be communicated via our website banner or email.</p>

          <h2 className="text-2xl font-black text-[#1A2B4C] mt-8 mb-4">14. Severability</h2>
          <p className="mb-6">If any part of these terms is deemed unenforceable, the remaining provisions will remain in full effect.</p>

          <h2 className="text-2xl font-black text-[#1A2B4C] mt-8 mb-4">15. Contact for Legal Matters</h2>
          <p className="mb-6">For any legal questions or formal notices, please contact us in writing:</p>
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
            <p className="mb-2"><strong>Address:</strong> Shop, Johar Town Block N, Lahore</p>
            <p className="mb-0"><strong>Email:</strong> info@avlive.com.pk (Subject: Legal Notice)</p>
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
