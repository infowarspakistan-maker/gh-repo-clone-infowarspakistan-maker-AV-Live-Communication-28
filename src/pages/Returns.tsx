import React from 'react';
import { motion } from 'motion/react';
import { RefreshCcw, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';

export function Returns() {
  return (
    <div className="bg-[#F8F9FA] min-h-screen pb-16">
      <SEO title="Returns" />
      <div className="bg-[#1A2B4C] text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-900/20 mix-blend-multiply"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black mb-6 tracking-tight"
          >
            Your Satisfaction is Our Guarantee.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-white max-w-3xl mx-auto leading-relaxed"
          >
            We stand behind the quality of our products. If you are not satisfied, we are here to make it right.
          </motion.p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 space-y-8">
        <h2 className="text-3xl font-black text-[#1A2B4C] mb-8 text-center">Our Policy</h2>
        
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm flex gap-6">
           <RefreshCcw className="text-[#00B4D8] shrink-0" size={24} />
           <div>
             <h3 className="font-bold text-lg text-gray-900 mb-2">Return Window</h3>
             <p className="text-gray-600">You have 7 calendar days from the delivery date to request a return.</p>
           </div>
        </div>
        
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm flex gap-6">
           <CheckCircle2 className="text-[#00B4D8] shrink-0" size={24} />
           <div>
             <h3 className="font-bold text-lg text-gray-900 mb-2">Eligibility</h3>
             <p className="text-gray-600">Items must be in original packaging, unused, and with all accessories/manuals intact.</p>
           </div>
        </div>
        
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm flex gap-6">
           <AlertCircle className="text-red-500 shrink-0" size={24} />
           <div>
             <h3 className="font-bold text-lg text-gray-900 mb-2">Non-Returnable Items</h3>
             <p className="text-gray-600">Custom-ordered products, opened software licenses, and consumables (batteries, cables) are non-returnable unless defective.</p>
           </div>
        </div>
        
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm flex gap-6">
           <FileText className="text-[#00B4D8] shrink-0" size={24} />
           <div>
             <h3 className="font-bold text-lg text-gray-900 mb-2">Refund Process & Shipping</h3>
             <p className="text-gray-600 mb-2">Once the item is inspected, refunds are processed via the original payment method within 5-7 business days.</p>
             <p className="text-gray-600">Return shipping costs are borne by the buyer unless the item arrived damaged or was a shipping error.</p>
           </div>
        </div>

        <div className="text-center mt-12 pt-12 border-t border-gray-200">
           <h3 className="text-xl font-bold text-[#1A2B4C] mb-6">Ready to initiate a return?</h3>
           <Link to="/rma" className="bg-[#1A2B4C] text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-[#00B4D8] transition-colors inline-block shadow-lg">
             Fill out RMA Form
           </Link>
        </div>
      </div>
    </div>
  );
}
