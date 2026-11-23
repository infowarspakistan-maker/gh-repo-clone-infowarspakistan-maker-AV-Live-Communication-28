import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Tag, Gift, Percent, Users } from 'lucide-react';
import { SEO } from '../components/SEO';

export function Promotions() {
  return (
    <div className="bg-[#F8F9FA] min-h-screen pb-16">
      <SEO 
        title="Promotions & Limited-Time Deals on AV Hardware | AV Live Pakistan" 
        description="Exclusive corporate discounts, bundle packages, and seasonal promotional pricing on video conferencing systems and IP phones."
        url="https://avlive.com.pk/programs/promotions"
        schema={{
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'CollectionPage',
              '@id': 'https://avlive.com.pk/programs/promotions#collection',
              name: 'Enterprise AV & Video Conferencing Hardware Promotions in Pakistan',
              url: 'https://avlive.com.pk/programs/promotions',
              description: 'Active bundle discounts, trade-in rebates, and corporate promotions on Poly, Logitech, Cisco, and Yealink hardware.'
            },
            {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://avlive.com.pk' },
                { '@type': 'ListItem', position: 2, name: 'Promotions', item: 'https://avlive.com.pk/programs/promotions' }
              ]
            }
          ]
        }}
      />
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {/* Flagship Featured Deal: Poly Studio X50 4K + TC8 Controller (PKR 399,000 • Free Delivery in Pakistan) */}
        <div className="mb-10 rounded-3xl overflow-hidden shadow-xl border border-[#141816]/15 grid grid-cols-1 lg:grid-cols-[1.25fr_0.95fr] bg-white">
          <div className="bg-[#c7f5c7] p-7 sm:p-10 flex flex-col justify-center text-[#141816]">
            <div className="flex flex-wrap items-center gap-2 text-xs font-extrabold uppercase tracking-wider mb-3">
              <span>LIMITED CONFERENCE ROOM DEAL</span>
              <span className="bg-[#141816] text-[#c7f5c7] px-2.5 py-0.5 rounded text-[11px] font-black">SAVE 53%</span>
              <span className="bg-emerald-800 text-white px-2.5 py-0.5 rounded text-[11px] font-black">FREE DELIVERY IN PAKISTAN</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight mb-3">
              POLY STUDIO X50 4K + TC8 CONTROLLER
            </h2>
            <div className="flex flex-wrap items-baseline gap-3 mb-4">
              <div className="flex flex-col text-xs font-extrabold uppercase leading-tight">
                <span>SPECIAL</span>
                <span>OFFER</span>
              </div>
              <div className="text-4xl sm:text-5xl font-black tracking-tight text-[#141816]">
                <span className="text-lg font-extrabold mr-1">PKR</span>399,000
              </div>
              <div className="text-base font-bold text-[#d9383a] line-through decoration-2">
                PKR 850,000
              </div>
            </div>
            <p className="text-sm text-[#2d3831] leading-relaxed mb-5 max-w-xl">
              Upgrade your medium-to-large conference rooms with 4K UltraHD auto-framing video, boardroom-filling stereo speakers, the Poly TC8 8-inch touch controller, and seamless Zoom &amp; Teams integration — including free nationwide delivery anywhere in Pakistan.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/product/poly-studio-x50-tc8-special-offer-pakistan"
                className="bg-[#141816] hover:bg-[#28302c] text-white px-6 py-3.5 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-colors"
              >
                Buy Now — PKR 399,000
              </Link>
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('open-poly-x50-offer'))}
                className="bg-white hover:bg-gray-50 text-[#141816] border border-[#141816]/30 px-5 py-3.5 rounded-lg text-xs font-extrabold uppercase tracking-wider cursor-pointer transition-colors"
              >
                Open Interactive Brochure Popup
              </button>
            </div>
          </div>
          <div className="bg-white p-8 flex flex-col items-center justify-center">
            <Link to="/product/poly-studio-x50-tc8-special-offer-pakistan" className="block max-w-[320px] w-full group">
              <img
                src="https://firebasestorage.googleapis.com/v0/b/studio-5367437135-24ac6.firebasestorage.app/o/Products%2Fpoly-studio-x50-png-3cq9.webp?alt=media&token=bc3614ec-64f7-405b-95df-7a793acd7563"
                alt="Poly Studio X50 4K Video Bar and Poly TC8 Touch Controller Special Offer"
                title="Poly Studio X50 4K + TC8 Bundle — PKR 399,000"
                width={1000}
                height={800}
                className="w-full h-auto object-contain -rotate-3 group-hover:-rotate-1 group-hover:scale-103 drop-shadow-lg transition-transform"
              />
            </Link>
            <p className="mt-4 text-center text-xs font-bold uppercase tracking-wider text-gray-500">
              All-in-One 4K Video Bar + TC8 Touch Panel &bull; Free Delivery in Pakistan
            </p>
          </div>
        </div>

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
               <Link to="/product/cisco-8841-ip-phone-pakistan" className="w-full bg-[#1A2B4C] text-white py-3 min-h-[48px] rounded-full font-bold hover:bg-[#00B4D8] transition-colors flex items-center justify-center">Claim Offer</Link>
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
               <Link to="/programs/government-education-pricing" className="w-full bg-[#1A2B4C] text-white py-3 min-h-[48px] rounded-full font-bold hover:bg-[#00B4D8] transition-colors flex items-center justify-center">Apply Now</Link>
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
               <Link to="/shop" className="w-full bg-[#1A2B4C] text-white py-3 min-h-[48px] rounded-full font-bold hover:bg-[#00B4D8] transition-colors flex items-center justify-center">Shop Clearance</Link>
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
               <Link to="/programs/reseller-program" className="w-full bg-[#1A2B4C] text-white py-3 min-h-[48px] rounded-full font-bold hover:bg-[#00B4D8] transition-colors flex items-center justify-center">Join Partner Program</Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
