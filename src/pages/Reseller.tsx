import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, BookOpen, FileText, ArrowRight } from 'lucide-react';
import { SEO } from '../components/SEO';

export function Reseller() {
  return (
    <div className="bg-[#F8F9FA] min-h-screen pb-16">
      <SEO title="Reseller" />
      <div className="bg-[#1A2B4C] text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-900/20 mix-blend-multiply"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black mb-6 tracking-tight"
          >
            Partner with Pakistan's AV Leader.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-white max-w-3xl mx-auto leading-relaxed"
          >
            Unlock exclusive margins, technical certifications, and marketing support. Whether you are a system integrator or a retail shop, we have a partnership tier for you.
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 space-y-24">
        
        <div>
          <h2 className="text-3xl font-black text-[#1A2B4C] mb-12 text-center">Program Benefits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1">
               <div className="w-16 h-16 bg-[#00B4D8]/10 text-[#00B4D8] rounded-2xl flex items-center justify-center mb-6"><TrendingUp size={32} /></div>
               <h3 className="font-bold text-[#1A2B4C] text-lg mb-3">Tiered Discounts</h3>
               <p className="text-gray-500 text-sm">Starting from 15% off MSRP, scaling up to 35% based on volume.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1">
               <div className="w-16 h-16 bg-[#00B4D8]/10 text-[#00B4D8] rounded-2xl flex items-center justify-center mb-6"><BookOpen size={32} /></div>
               <h3 className="font-bold text-[#1A2B4C] text-lg mb-3">Training & Certs</h3>
               <p className="text-gray-500 text-sm">Access to product webinars and certification courses (Polycom, Cisco, Yealink).</p>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1">
               <div className="w-16 h-16 bg-[#00B4D8]/10 text-[#00B4D8] rounded-2xl flex items-center justify-center mb-6"><FileText size={32} /></div>
               <h3 className="font-bold text-[#1A2B4C] text-lg mb-3">Marketing Support</h3>
               <p className="text-gray-500 text-sm">Access to high-res images, brochures, and demo units for your showroom.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1">
               <div className="w-16 h-16 bg-[#00B4D8]/10 text-[#00B4D8] rounded-2xl flex items-center justify-center mb-6"><ArrowRight size={32} /></div>
               <h3 className="font-bold text-[#1A2B4C] text-lg mb-3">Leads Referral</h3>
               <p className="text-gray-500 text-sm">We will forward local leads in your region directly to your sales team.</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col lg:flex-row">
           <div className="p-12 lg:w-1/2 bg-gray-50 flex flex-col justify-center">
             <h2 className="text-3xl font-black text-[#1A2B4C] mb-4">Dedicated Reseller Portal</h2>
             <p className="text-gray-600 mb-8 leading-relaxed">
               Manage your pricing, check live stock, track orders, and request RMA directly from your custom B2B dashboard.
             </p>
             <button className="bg-[#1A2B4C] text-white px-8 py-4 rounded-full font-bold hover:bg-[#00B4D8] transition-colors w-max">
               Login to Portal
             </button>
           </div>
           <div className="p-12 lg:w-1/2 border-t lg:border-t-0 lg:border-l border-gray-200">
             <h2 className="text-2xl font-black text-[#1A2B4C] mb-6">Apply Now</h2>
             <form className="space-y-4">
               <input type="text" placeholder="Company Name" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-[#00B4D8]" />
               <input type="text" placeholder="NTN Number" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-[#00B4D8]" />
               <input type="email" placeholder="Business Email" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-[#00B4D8]" />
               <textarea placeholder="Tell us about your business" rows={3} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-[#00B4D8] resize-none"></textarea>
               <button type="button" className="w-full bg-[#00B4D8] text-white py-3 rounded-lg font-bold hover:bg-[#1A2B4C] transition-colors">Submit Application</button>
             </form>
           </div>
        </div>
      </div>
    </div>
  );
}
