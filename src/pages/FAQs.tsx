import React from 'react';
import { motion } from 'motion/react';
import { HelpCircle } from 'lucide-react';
import { SEO } from '../components/SEO';

const FAQS = [
  {
    category: "Ordering & Products",
    questions: [
      { q: "Do you have physical products on display?", a: "Yes! Our Johar Town Block N, Lahore shop is open for walk-in customers to test IP Phones, Headsets, and Cameras." },
      { q: "What brands do you carry?", a: "We are authorized partners for Polycom, Cisco, Yealink, Grandstream, Hikvision, Bosch, Jabra, and more." },
      { q: "Do you offer bulk order discounts?", a: "Absolutely. Contact our reseller team or call 0321 425 6263 for bulk pricing." }
    ]
  },
  {
    category: "Shipping & Delivery",
    questions: [
      { q: "Do you ship nationwide?", a: "Yes, we ship to all major cities including Lahore, Karachi, Islamabad, Peshawar, Quetta, and Faisalabad via TCS, Leopards, and Call Courier." },
      { q: "What are the shipping charges?", a: "Shipping rates depend on weight and location. Calculated at checkout." },
      { q: "Do you offer cash on delivery (COD)?", a: "We offer COD for select small items. High-value enterprise equipment requires advance payment or bank transfer." }
    ]
  },
  {
    category: "Returns & RMA",
    questions: [
      { q: "What is your return policy?", a: "We accept returns within 7 days of delivery for unopened, unused items. Please visit our Returns page for full policy." },
      { q: "How do I claim warranty?", a: "Fill out our RMA Form. We will generate a ticket and provide instructions for return or on-site repair." },
      { q: "Do you provide technical support?", a: "Yes, we provide remote and on-site support for all systems we integrate." }
    ]
  },
  {
    category: "Payments",
    questions: [
      { q: "What payment methods do you accept?", a: "We accept Bank Transfer, Cheque, Credit/Debit Cards (via Stripe), and Cash for walk-ins." },
      { q: "Do you accept foreign currency?", a: "For export or international clients, we accept USD via wire transfer." }
    ]
  }
];

export function FAQs() {
  return (
    <div className="bg-[#F8F9FA] min-h-screen pb-16">
      <SEO title="F A Qs" />
      <div className="bg-[#1A2B4C] text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-900/20 mix-blend-multiply"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black mb-6 tracking-tight"
          >
            We Have Answers.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-white max-w-3xl mx-auto leading-relaxed"
          >
            Quick, helpful answers to the most common questions about shopping, shipping, and support at AV Live.
          </motion.p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 space-y-16">
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
