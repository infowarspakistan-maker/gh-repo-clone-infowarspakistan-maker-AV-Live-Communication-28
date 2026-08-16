import React from 'react';
import { motion } from 'motion/react';
import { CreditCard, Landmark, Truck, Wallet, ShieldCheck } from 'lucide-react';
import { SEO } from '../components/SEO';

export function Payment() {
  return (
    <div className="bg-[#F8F9FA] min-h-screen pb-16">
      <SEO title="Payment" />
      <div className="bg-[#1A2B4C] text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-900/20 mix-blend-multiply"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black mb-6 tracking-tight"
          >
            Easy, Secure, and Flexible Payments.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
          >
            Choose the payment method that works best for you. We prioritize your financial security with industry-standard encryption.
          </motion.p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm flex items-start gap-6">
             <div className="w-16 h-16 bg-[#00B4D8]/10 text-[#00B4D8] rounded-2xl flex items-center justify-center shrink-0">
               <Landmark size={32} />
             </div>
             <div>
               <h3 className="text-xl font-bold text-[#1A2B4C] mb-2">Bank Transfer (IBFT)</h3>
               <p className="text-gray-600">Instant transfer to our corporate bank account. Details will be provided on your order confirmation.</p>
             </div>
           </div>

           <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm flex items-start gap-6">
             <div className="w-16 h-16 bg-[#00B4D8]/10 text-[#00B4D8] rounded-2xl flex items-center justify-center shrink-0">
               <Wallet size={32} />
             </div>
             <div>
               <h3 className="text-xl font-bold text-[#1A2B4C] mb-2">Cheque</h3>
               <p className="text-gray-600">Pay via local bank cheque. Delivery is initiated upon cheque clearance.</p>
             </div>
           </div>

           <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm flex items-start gap-6">
             <div className="w-16 h-16 bg-[#00B4D8]/10 text-[#00B4D8] rounded-2xl flex items-center justify-center shrink-0">
               <CreditCard size={32} />
             </div>
             <div>
               <h3 className="text-xl font-bold text-[#1A2B4C] mb-2">Credit/Debit Cards (Stripe)</h3>
               <p className="text-gray-600">Visa, Mastercard, and UnionPay accepted. Fully PCI-DSS compliant.</p>
             </div>
           </div>

           <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm flex items-start gap-6">
             <div className="w-16 h-16 bg-[#00B4D8]/10 text-[#00B4D8] rounded-2xl flex items-center justify-center shrink-0">
               <Truck size={32} />
             </div>
             <div>
               <h3 className="text-xl font-bold text-[#1A2B4C] mb-2">Cash on Delivery (COD)</h3>
               <p className="text-gray-600">Available for select small orders in Lahore & Karachi. Cash/Walk-in also available at our Lahore shop.</p>
             </div>
           </div>
        </div>
        
        <div className="bg-[#1A2B4C] rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-white mt-12">
          <div className="flex items-center gap-4">
             <ShieldCheck size={40} className="text-[#00B4D8]" />
             <div>
               <h3 className="font-bold text-lg mb-1">Corporate Installment Plans</h3>
               <p className="text-gray-300 text-sm">We partner with select banks for corporate financing on large-scale integration projects.</p>
             </div>
          </div>
          <button className="bg-[#00B4D8] text-white px-6 py-3 rounded-full font-bold hover:bg-white hover:text-[#1A2B4C] transition-colors whitespace-nowrap">
            Enquire Now
          </button>
        </div>
      </div>
    </div>
  );
}
