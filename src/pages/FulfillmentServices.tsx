import React from 'react';
import { motion } from 'motion/react';
import { Warehouse, Box, Truck, BarChart } from 'lucide-react';
import { SEO } from '../components/SEO';

export function FulfillmentServices() {
  return (
    <div className="bg-[#F8F9FA] min-h-screen pb-16">
      <SEO title="Fulfillment Services" />
      <div className="bg-[#1A2B4C] text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-900/20 mix-blend-multiply"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black mb-6 tracking-tight"
          >
            Focus on Sales. Leave the Warehousing to Us.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-white max-w-3xl mx-auto leading-relaxed"
          >
            We provide third-party logistics (3PL) for AV equipment. Store your inventory at our secure Lahore warehouse, and we will ship your orders when you need them.
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 space-y-16">
        <div>
          <h2 className="text-3xl font-black text-[#1A2B4C] mb-8 text-center">Services Offered</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center hover:shadow-lg transition-shadow">
               <div className="w-16 h-16 bg-[#00B4D8]/10 text-[#00B4D8] rounded-2xl flex items-center justify-center mx-auto mb-6"><Warehouse size={32} /></div>
               <h3 className="font-bold text-[#1A2B4C] text-lg mb-3">Secure Warehousing</h3>
               <p className="text-gray-500 text-sm">Climate-controlled storage with 24/7 surveillance in Lahore.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center hover:shadow-lg transition-shadow">
               <div className="w-16 h-16 bg-[#00B4D8]/10 text-[#00B4D8] rounded-2xl flex items-center justify-center mx-auto mb-6"><Box size={32} /></div>
               <h3 className="font-bold text-[#1A2B4C] text-lg mb-3">Kitting & Assembly</h3>
               <p className="text-gray-500 text-sm">Bundling phones, headsets, and cables into single retail packages.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center hover:shadow-lg transition-shadow">
               <div className="w-16 h-16 bg-[#00B4D8]/10 text-[#00B4D8] rounded-2xl flex items-center justify-center mx-auto mb-6"><Truck size={32} /></div>
               <h3 className="font-bold text-[#1A2B4C] text-lg mb-3">Nationwide Shipping</h3>
               <p className="text-gray-500 text-sm">Fast pick-and-pack services via premium couriers across Pakistan.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center hover:shadow-lg transition-shadow">
               <div className="w-16 h-16 bg-[#00B4D8]/10 text-[#00B4D8] rounded-2xl flex items-center justify-center mx-auto mb-6"><BarChart size={32} /></div>
               <h3 className="font-bold text-[#1A2B4C] text-lg mb-3">Real-Time Reporting</h3>
               <p className="text-gray-500 text-sm">Inventory tracking via API and dedicated portal access.</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-100 rounded-[2rem] p-12 text-center border border-gray-200">
           <h3 className="text-2xl font-black text-[#1A2B4C] mb-4">Ideal For</h3>
           <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
             E-commerce sellers, event management companies, and corporate procurement departments looking to streamline their logistics operations.
           </p>
           <button className="bg-[#1A2B4C] text-white px-8 py-4 rounded-full font-bold hover:bg-[#00B4D8] transition-colors">
             Discuss Your Logistics Needs
           </button>
        </div>
      </div>
    </div>
  );
}
