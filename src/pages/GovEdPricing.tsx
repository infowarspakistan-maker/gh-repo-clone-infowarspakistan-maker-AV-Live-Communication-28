import React from 'react';
import { motion } from 'motion/react';
import { Landmark, GraduationCap, FileSignature, Handshake, Users } from 'lucide-react';
import { SEO } from '../components/SEO';

export function GovEdPricing() {
  return (
    <div className="bg-[#F8F9FA] min-h-screen pb-16">
      <SEO title="Gov Ed Pricing" />
      <div className="bg-[#1A2B4C] text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-900/20 mix-blend-multiply"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black mb-6 tracking-tight"
          >
            Empowering Public Sector and Academia.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-white max-w-3xl mx-auto leading-relaxed"
          >
            We offer competitive, transparent pricing for government departments, universities, schools, and training institutes. Exemptions on sales tax available for registered entities.
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 space-y-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="bg-white p-10 rounded-3xl border border-gray-200 shadow-sm">
             <div className="w-16 h-16 bg-[#00B4D8]/10 text-[#00B4D8] rounded-2xl flex items-center justify-center mb-6">
               <FileSignature size={32} />
             </div>
             <h3 className="text-2xl font-black text-[#1A2B4C] mb-4">Tender Bidding</h3>
             <p className="text-gray-600 leading-relaxed">We help prepare technical documentation, compliance matrices, and authorization letters for government tenders to ensure seamless procurement.</p>
           </div>
           <div className="bg-white p-10 rounded-3xl border border-gray-200 shadow-sm">
             <div className="w-16 h-16 bg-[#00B4D8]/10 text-[#00B4D8] rounded-2xl flex items-center justify-center mb-6">
               <GraduationCap size={32} />
             </div>
             <h3 className="text-2xl font-black text-[#1A2B4C] mb-4">Exclusive Education Bundles</h3>
             <p className="text-gray-600 leading-relaxed">Special bundled pricing on PA systems, interactive displays, and video conferencing setups for classrooms, lecture halls, and auditoriums.</p>
           </div>
           <div className="bg-white p-10 rounded-3xl border border-gray-200 shadow-sm">
             <div className="w-16 h-16 bg-[#00B4D8]/10 text-[#00B4D8] rounded-2xl flex items-center justify-center mb-6">
               <Handshake size={32} />
             </div>
             <h3 className="text-2xl font-black text-[#1A2B4C] mb-4">Deferred Payment</h3>
             <p className="text-gray-600 leading-relaxed">Flexible net-30 or net-60 payment terms available for verified government entities and registered educational institutions.</p>
           </div>
           <div className="bg-white p-10 rounded-3xl border border-gray-200 shadow-sm">
             <div className="w-16 h-16 bg-[#00B4D8]/10 text-[#00B4D8] rounded-2xl flex items-center justify-center mb-6">
               <Users size={32} />
             </div>
             <h3 className="text-2xl font-black text-[#1A2B4C] mb-4">Dedicated Account Manager</h3>
             <p className="text-gray-600 leading-relaxed">One point of contact for all your departmental needs, from initial quotation to post-installation support and warranty claims.</p>
           </div>
        </div>

        <div className="bg-[#1A2B4C] rounded-[2rem] p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-[#00B4D8] rounded-full blur-3xl opacity-20 -mr-32 -mt-32"></div>
           <div className="relative z-10 flex-1 text-white">
              <h2 className="text-3xl font-black mb-4">Qualifying Entities</h2>
              <p className="text-gray-300 text-lg mb-6">Government Ministries, WAPDA, PEMRA, Universities, Colleges, and K-12 Schools are eligible for our public sector pricing.</p>
              <div className="flex gap-4">
                 <button className="bg-[#00B4D8] text-white px-8 py-4 rounded-full font-bold hover:bg-white hover:text-[#1A2B4C] transition-colors whitespace-nowrap">
                   Submit Your NTN
                 </button>
                 <a href="tel:03214256263" className="bg-transparent border border-white text-white px-8 py-4 rounded-full font-bold hover:bg-white hover:text-[#1A2B4C] transition-colors whitespace-nowrap text-center">
                   Call 0321 425 6263
                 </a>
              </div>
           </div>
           <div className="relative z-10 shrink-0 opacity-50 hidden md:block">
              <Landmark size={180} />
           </div>
        </div>
      </div>
    </div>
  );
}
