import React from 'react';
import { motion } from 'motion/react';
import { Package, Truck, Zap, Globe, MapPin } from 'lucide-react';
import { SEO } from '../components/SEO';

export function Shipping() {
  return (
    <div className="bg-[#F8F9FA] min-h-screen pb-16">
      <SEO title="Shipping" />
      <div className="bg-[#1A2B4C] text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-900/20 mix-blend-multiply"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black mb-6 tracking-tight"
          >
            Getting Your Gear Delivered Safely.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-white max-w-3xl mx-auto leading-relaxed"
          >
            We partner with Pakistan's most reliable couriers to ensure your AV equipment arrives on time and in perfect condition.
          </motion.p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm flex items-start gap-6">
             <div className="w-16 h-16 bg-[#00B4D8]/10 text-[#00B4D8] rounded-2xl flex items-center justify-center shrink-0">
               <Truck size={32} />
             </div>
             <div>
               <h3 className="text-xl font-bold text-[#1A2B4C] mb-2">Standard Courier (Nationwide)</h3>
               <p className="text-gray-600">TCS, Leopards, or Call Courier. Delivery within 2-5 business days across Pakistan.</p>
             </div>
           </div>

           <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm flex items-start gap-6">
             <div className="w-16 h-16 bg-[#00B4D8]/10 text-[#00B4D8] rounded-2xl flex items-center justify-center shrink-0">
               <Zap size={32} />
             </div>
             <div>
               <h3 className="text-xl font-bold text-[#1A2B4C] mb-2">Express Delivery</h3>
               <p className="text-gray-600">Next-day delivery for Lahore, Karachi, and Islamabad (orders placed before 12 PM).</p>
             </div>
           </div>

           <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm flex items-start gap-6">
             <div className="w-16 h-16 bg-[#00B4D8]/10 text-[#00B4D8] rounded-2xl flex items-center justify-center shrink-0">
               <Package size={32} />
             </div>
             <div>
               <h3 className="text-xl font-bold text-[#1A2B4C] mb-2">Heavy/Bulky Items</h3>
               <p className="text-gray-600">Special freight shipping for large SMD displays and PA systems. Quotes provided at checkout.</p>
             </div>
           </div>

           <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm flex items-start gap-6">
             <div className="w-16 h-16 bg-[#00B4D8]/10 text-[#00B4D8] rounded-2xl flex items-center justify-center shrink-0">
               <MapPin size={32} />
             </div>
             <div>
               <h3 className="text-xl font-bold text-[#1A2B4C] mb-2">Self-Pickup (Free)</h3>
               <p className="text-gray-600">Visit our shop at Johar Town Block N, Lahore, and pick up your order in person.</p>
             </div>
           </div>
           
           <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm flex items-start gap-6 md:col-span-2">
             <div className="w-16 h-16 bg-[#00B4D8]/10 text-[#00B4D8] rounded-2xl flex items-center justify-center shrink-0">
               <Globe size={32} />
             </div>
             <div>
               <h3 className="text-xl font-bold text-[#1A2B4C] mb-2">International Shipping</h3>
               <p className="text-gray-600">We can coordinate international shipments for our global partners. Contact us for a custom quote.</p>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
