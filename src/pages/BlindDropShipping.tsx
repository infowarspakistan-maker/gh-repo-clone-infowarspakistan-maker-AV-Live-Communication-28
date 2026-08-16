import React from 'react';
import { motion } from 'motion/react';
import { PackageX, ShieldCheck, Zap, Receipt } from 'lucide-react';
import { SEO } from '../components/SEO';

export function BlindDropShipping() {
  return (
    <div className="bg-[#F8F9FA] min-h-screen pb-16">
      <SEO title="Blind Drop Shipping" />
      <div className="bg-[#1A2B4C] text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-900/20 mix-blend-multiply"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black mb-6 tracking-tight"
          >
            Grow Your Business. We Handle the Logistics.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-white max-w-3xl mx-auto leading-relaxed"
          >
            Our blind drop shipping service allows you to sell AV products under your brand. We pick, pack, and ship orders directly to your end-customers using your own packaging and return labels.
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 space-y-24">
        <div>
          <h2 className="text-3xl font-black text-[#1A2B4C] mb-12 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: 1, title: 'You Place Order', desc: 'You place the order with us through your reseller portal.' },
              { step: 2, title: 'We Remove Branding', desc: 'We remove all AV Live branding from the package entirely.' },
              { step: 3, title: 'We Ship Directly', desc: 'We ship directly to your client using your provided return address.' },
              { step: 4, title: 'Client Receives', desc: 'Your customer never knows the product came from us.' }
            ].map((item, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl border border-gray-200 text-center relative">
                 <div className="w-12 h-12 bg-[#00B4D8] text-white rounded-full flex items-center justify-center font-black text-xl absolute -top-6 left-1/2 -translate-x-1/2 border-4 border-[#F8F9FA]">{item.step}</div>
                 <h3 className="font-bold text-[#1A2B4C] text-lg mb-3 mt-4">{item.title}</h3>
                 <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-12 border border-gray-200 shadow-sm flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <h2 className="text-3xl font-black text-[#1A2B4C] mb-6">Benefits for Your Business</h2>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                 <PackageX className="text-[#00B4D8] shrink-0 mt-1" />
                 <div><span className="font-bold text-gray-800 block">Zero inventory costs.</span><span className="text-gray-600 text-sm">No need to hold stock or manage warehouse space.</span></div>
              </li>
              <li className="flex items-start gap-3">
                 <ShieldCheck className="text-[#00B4D8] shrink-0 mt-1" />
                 <div><span className="font-bold text-gray-800 block">Access to premium brands.</span><span className="text-gray-600 text-sm">Sell without minimum order quantities constraints.</span></div>
              </li>
              <li className="flex items-start gap-3">
                 <Zap className="text-[#00B4D8] shrink-0 mt-1" />
                 <div><span className="font-bold text-gray-800 block">Fast dispatch.</span><span className="text-gray-600 text-sm">Rapid fulfillment from our Lahore warehouse.</span></div>
              </li>
              <li className="flex items-start gap-3">
                 <Receipt className="text-[#00B4D8] shrink-0 mt-1" />
                 <div><span className="font-bold text-gray-800 block">White-label invoicing.</span><span className="text-gray-600 text-sm">Custom packing slips with your branding.</span></div>
              </li>
            </ul>
          </div>
          <div className="flex-1 bg-blue-50 p-8 rounded-2xl text-center border border-blue-100">
             <h3 className="text-xl font-bold text-blue-900 mb-4">Ready to start?</h3>
             <p className="text-blue-700 mb-8 text-sm">This service is exclusively for registered resellers and agencies.</p>
             <button className="bg-[#1A2B4C] text-white px-8 py-3 rounded-full font-bold hover:bg-[#00B4D8] transition-colors w-full">Apply for Reseller Account</button>
          </div>
        </div>
      </div>
    </div>
  );
}
