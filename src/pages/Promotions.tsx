import React from 'react';
import { motion } from 'motion/react';
import { Tag, Gift, Percent, Users } from 'lucide-react';
import { SEO } from '../components/SEO';

export function Promotions() {
  return (
    <div className="bg-[#F8F9FA] min-h-screen pb-16">
      <SEO title="Promotions" />
      <div className="bg-[#1A2B4C] text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-900/20 mix-blend-multiply"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black mb-6 tracking-tight"
          >
            Big Savings on Big Tech.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-white max-w-3xl mx-auto leading-relaxed"
          >
            Upgrade your office AV setup without breaking the bank. Check out our limited-time bundles, cashback offers, and clearance sales.
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm group">
            <div className="h-48 bg-gradient-to-r from-blue-600 to-blue-400 p-8 flex items-center justify-between relative overflow-hidden">
               <div className="relative z-10">
                 <span className="bg-white text-blue-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-3 inline-block">Limited Time</span>
                 <h3 className="text-3xl font-black text-white">Ramadan Bundle</h3>
               </div>
               <Gift size={80} className="text-white/20 absolute -right-4 -bottom-4 transform rotate-12 group-hover:scale-110 transition-transform" />
            </div>
            <div className="p-8">
               <p className="text-gray-600 text-lg mb-6">Buy 1 Cisco 8841 IP Phone, Get a <span className="font-bold text-[#1A2B4C]">Free Cisco Headset</span>.</p>
               <button className="w-full bg-[#1A2B4C] text-white py-3 rounded-full font-bold hover:bg-[#00B4D8] transition-colors">Claim Offer</button>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm group">
            <div className="h-48 bg-gradient-to-r from-emerald-600 to-emerald-400 p-8 flex items-center justify-between relative overflow-hidden">
               <div className="relative z-10">
                 <span className="bg-white text-emerald-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-3 inline-block">Education</span>
                 <h3 className="text-3xl font-black text-white">Back-to-School</h3>
               </div>
               <Percent size={80} className="text-white/20 absolute -right-4 -bottom-4 transform rotate-12 group-hover:scale-110 transition-transform" />
            </div>
            <div className="p-8">
               <p className="text-gray-600 text-lg mb-6"><span className="font-bold text-[#1A2B4C]">15% off</span> on all Logitech Rally Bars for registered educational institutes.</p>
               <button className="w-full bg-[#1A2B4C] text-white py-3 rounded-full font-bold hover:bg-[#00B4D8] transition-colors">Apply Now</button>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm group">
            <div className="h-48 bg-gradient-to-r from-orange-600 to-orange-400 p-8 flex items-center justify-between relative overflow-hidden">
               <div className="relative z-10">
                 <span className="bg-white text-orange-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-3 inline-block">Stock Clearance</span>
                 <h3 className="text-3xl font-black text-white">Clearance Zone</h3>
               </div>
               <Tag size={80} className="text-white/20 absolute -right-4 -bottom-4 transform rotate-12 group-hover:scale-110 transition-transform" />
            </div>
            <div className="p-8">
               <p className="text-gray-600 text-lg mb-6"><span className="font-bold text-[#1A2B4C]">Up to 40% off</span> on last-generation Polycom and Yealink models.</p>
               <button className="w-full bg-[#1A2B4C] text-white py-3 rounded-full font-bold hover:bg-[#00B4D8] transition-colors">Shop Clearance</button>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm group">
            <div className="h-48 bg-gradient-to-r from-purple-600 to-purple-400 p-8 flex items-center justify-between relative overflow-hidden">
               <div className="relative z-10">
                 <span className="bg-white text-purple-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-3 inline-block">Partners</span>
                 <h3 className="text-3xl font-black text-white">Referral Program</h3>
               </div>
               <Users size={80} className="text-white/20 absolute -right-4 -bottom-4 transform rotate-12 group-hover:scale-110 transition-transform" />
            </div>
            <div className="p-8">
               <p className="text-gray-600 text-lg mb-6">Refer a business partner and get <span className="font-bold text-[#1A2B4C]">PKR 5,000</span> worth of store credit.</p>
               <button className="w-full bg-[#1A2B4C] text-white py-3 rounded-full font-bold hover:bg-[#00B4D8] transition-colors">Generate Link</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
