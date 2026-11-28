import React from 'react';
import { motion } from 'motion/react';
import { HelpCircle } from 'lucide-react';
import { SEO } from '../components/SEO';
import { Breadcrumbs } from '../components/Breadcrumbs';

const FAQS = [
  {
    category: "Video Conferencing & Corporate Event Management",
    questions: [
      {
        q: "Which systems are best for Video Conference in Pakistan for medium and large boardrooms?",
        a: "For medium-to-large executive boardrooms in Pakistan, our most reliable deployments are the Poly Studio X70 (Poly X70) all-in-one dual-4K video bar, the Polycom RealPresence Group 500 (Polycom Group 500) codec system, and Logitech Rally Bar kits certified for Zoom Rooms and Microsoft Teams Rooms."
      },
      {
        q: "Does AV Live supply genuine Polycom Group 500 and Poly X70 systems with warranty in Pakistan?",
        a: "Yes. AV Live Communications provides genuine Polycom Group 500 and Poly Studio X70 hardware with official warranty, acoustic calibration, and on-site engineering installation across Lahore, Karachi, and Islamabad."
      },
      {
        q: "What Corporate event management, hybrid event, and Hologram Display services do you provide?",
        a: "We deliver turnkey Corporate event management across Pakistan—including 3D Hologram Display stage setups, 3D architectural projection mapping, hybrid event multi-cam broadcasting for Zoom and MS Teams, SMD LED video walls, and concert-grade audio."
      }
    ]
  },
  {
    category: "Ordering & Products",
    questions: [
      { q: "Do you have physical products on display?", a: "Yes! Our Johar Town Block N, Lahore shop is open for walk-in customers to test IP Phones, Headsets, and Cameras." },
      { q: "What brands do you carry?", a: "We are authorized partners for Polycom, Cisco, Yealink, Grandstream, Hikvision, Bosch, Jabra, and more." },
      { q: "Do you offer bulk order discounts?", a: "Absolutely. Contact our reseller team or call 0321 425 6263 for bulk pricing in Pakistani Rupees (PKR)." }
    ]
  },
  {
    category: "Shipping & Delivery",
    questions: [
      { q: "Do you ship nationwide?", a: "Yes, we ship to all major cities including Lahore, Karachi, Islamabad, Peshawar, Quetta, and Faisalabad via TCS, Leopards, and Call Courier." },
      { q: "What are the shipping charges?", a: "Shipping is complimentary on enterprise orders above Rs. 100,000 PKR, and Rs. 1,500 PKR flat-rate insured courier below Rs. 100,000 PKR." },
      { q: "Do you offer cash on delivery (COD)?", a: "We offer COD for select small items. High-value enterprise equipment requires advance payment, corporate purchase order (PO), or bank transfer." }
    ]
  },
  {
    category: "Returns & RMA",
    questions: [
      { q: "What is your return policy?", a: "We accept returns within 14 days of delivery for unopened, factory-sealed items and provide instant DOA replacement. Please visit our Returns page for full policy details." },
      { q: "How do I claim warranty?", a: "Fill out our RMA Form. We will generate a ticket and provide instructions for return or on-site repair." },
      { q: "Do you provide technical support?", a: "Yes, we provide remote and on-site engineering support for all systems we integrate across Pakistan." }
    ]
  },
  {
    category: "Payments & FBR Tax Invoicing",
    questions: [
      { q: "What payment methods do you accept?", a: "We accept Corporate Bank Transfer (IBFT/RTGS), Crossed Company Cheque, Pay Order, Credit/Debit Cards, and Cash for walk-in showroom orders." },
      { q: "What currency and tax invoicing standards do you use?", a: "All catalog prices and tax invoices are issued in Pakistani Rupees (PKR / Rs.) with official FBR GST and NTN compliance for corporate and PPRA public-sector procurement." }
    ]
  }
];

export function FAQs() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": FAQS.flatMap(group =>
      group.questions.map(item => ({
        "@type": "Question",
        "name": item.q,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": item.a
        }
      }))
    )
  };

  return (
    <div className="bg-[#F8F9FA] min-h-screen pb-16">
      <SEO 
        title="FAQs | Video Conferencing & Event Management | AV Live" 
        description="Answers to common questions about Video Conferencing in Pakistan, Polycom Group 500, Poly X70, Corporate Event Management & nationwide delivery."
        keywords="Video Conferencing FAQs Pakistan, Polycom Group 500, Poly X70, Corporate Event Management FAQs, AV Live FAQs"
        url="https://avlive.com.pk/faqs"
        schema={faqSchema}
      />
      <div className="bg-[#1A2B4C] text-white py-6 lg:py-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-900/20 mix-blend-multiply"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl sm:text-3xl md:text-4xl font-black mb-2.5 tracking-tight"
          >
            Frequently Asked Technical &amp; Procurement Questions
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xs sm:text-sm md:text-base text-white/90 max-w-3xl mx-auto leading-relaxed"
          >
            Quick, authoritative answers to the most common questions about enterprise video conferencing, corporate event production, shipping, and SLA support at AV Live.
          </motion.p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 lg:mt-8 space-y-10">
        <Breadcrumbs items={[{ label: 'FAQs' }]} />

        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <span className="block text-[10px] font-black uppercase tracking-widest text-[#00B4D8] mb-1">
              Answer-First Procurement &amp; SLA Verdict
            </span>
            <p className="text-xs sm:text-sm font-bold text-[#1A2B4C] leading-relaxed">
              AV Live Communications supplies 100% genuine, PTA-compliant video conferencing, VoIP telephony, and pro-AV hardware in Pakistani Rupees (PKR) with official 1-to-3 year local warranty, FBR GST/NTN invoicing, and 24–72 hour insured delivery across Lahore, Karachi, and Islamabad.
            </p>
          </div>
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-left border-collapse text-xs">
              <caption className="bg-gray-50 text-[#1A2B4C] font-black text-left px-4 py-2.5 text-[10px] uppercase tracking-widest border-b border-gray-100">
                AV Live Pakistan Procurement &amp; Support Standards Summary
              </caption>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <th className="py-2.5 px-4 font-black text-gray-500 uppercase w-2/5">Technical &amp; Quote SLA</th>
                  <td className="py-2.5 px-4 font-bold text-[#1A2B4C]">15-Minute Engineer Callback (0321 425 6263 / 0339 0000 921).</td>
                </tr>
                <tr>
                  <th className="py-2.5 px-4 font-black text-gray-500 uppercase">Billing &amp; Tax Compliance</th>
                  <td className="py-2.5 px-4 font-bold text-[#1A2B4C]">100% Pakistani Rupees (PKR / Rs.) with FBR GST &amp; NTN Invoices.</td>
                </tr>
                <tr>
                  <th className="py-2.5 px-4 font-black text-gray-500 uppercase">Nationwide Logistics</th>
                  <td className="py-2.5 px-4 font-bold text-emerald-700">Free Shipping on Orders Above Rs. 100,000 PKR (1–3 Day Transit).</td>
                </tr>
                <tr>
                  <th className="py-2.5 px-4 font-black text-gray-500 uppercase">Warranty &amp; Returns</th>
                  <td className="py-2.5 px-4 font-bold text-[#1A2B4C]">1-Year Official Local Warranty + 14-Day Return &amp; DOA Replacement.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {FAQS.map((group, i) => (
          <div key={i}>
            <h2 className="text-2xl font-black text-[#1A2B4C] mb-8 pb-4 border-b border-gray-200 flex items-center gap-3">
              <HelpCircle className="text-[#00B4D8]" /> {group.category}
            </h2>
            <div className="space-y-6">
              {group.questions.map((faq, j) => (
                <div key={j} className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
                   <h3 className="text-lg font-bold text-gray-900 mb-3">{faq.q}</h3>
                   <p className="text-gray-600 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
