import React from 'react';
import { motion } from 'motion/react';
import { PhoneCall, Hash, Globe, ServerCog } from 'lucide-react';
import { SEO } from '../components/SEO';

export function VoipService() {
  return (
    <div className="bg-[#F8F9FA] min-h-screen pb-16">
      <SEO title="Voip Service" />
      <div className="bg-[#1A2B4C] text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-900/20 mix-blend-multiply"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black mb-6 tracking-tight"
          >
            Connect to the World. Affordable VoIP Services.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-white max-w-3xl mx-auto leading-relaxed"
          >
            A VoIP phone system is useless without a great service provider. We partner with Pakistan's leading carriers to deliver reliable SIP trunking, DIDs, and virtual numbers.
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 space-y-24">
        
        <div>
          <h2 className="text-3xl font-black text-[#1A2B4C] mb-12 text-center">What We Offer</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center hover:shadow-lg transition-shadow">
               <div className="w-16 h-16 bg-[#00B4D8]/10 text-[#00B4D8] rounded-2xl flex items-center justify-center mx-auto mb-6"><ServerCog size={32} /></div>
               <h3 className="font-bold text-[#1A2B4C] text-lg mb-3">SIP Trunk Provisioning</h3>
               <p className="text-gray-500 text-sm">We connect your IP PBX to local and international SIP providers flawlessly.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center hover:shadow-lg transition-shadow">
               <div className="w-16 h-16 bg-[#00B4D8]/10 text-[#00B4D8] rounded-2xl flex items-center justify-center mx-auto mb-6"><Hash size={32} /></div>
               <h3 className="font-bold text-[#1A2B4C] text-lg mb-3">Local DIDs</h3>
               <p className="text-gray-500 text-sm">Get Lahore, Karachi, and Islamabad virtual phone numbers instantly.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center hover:shadow-lg transition-shadow">
               <div className="w-16 h-16 bg-[#00B4D8]/10 text-[#00B4D8] rounded-2xl flex items-center justify-center mx-auto mb-6"><Globe size={32} /></div>
               <h3 className="font-bold text-[#1A2B4C] text-lg mb-3">International Routing</h3>
               <p className="text-gray-500 text-sm">Low-cost termination to global destinations for your call center.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center hover:shadow-lg transition-shadow">
               <div className="w-16 h-16 bg-[#00B4D8]/10 text-[#00B4D8] rounded-2xl flex items-center justify-center mx-auto mb-6"><PhoneCall size={32} /></div>
               <h3 className="font-bold text-[#1A2B4C] text-lg mb-3">Carrier Neutral</h3>
               <p className="text-gray-500 text-sm">We work with any provider you choose or recommend the best for your needs.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
           <div>
             <h2 className="text-3xl font-black text-[#1A2B4C] mb-6">Our Trusted Partners</h2>
             <ul className="space-y-6">
               <li className="flex items-start gap-4 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                 <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center font-bold text-blue-800 shrink-0">PTCL</div>
                 <div><h4 className="font-bold text-[#1A2B4C]">PTCL (Smart TV & Voice)</h4><p className="text-sm text-gray-500">Industry-standard analog/digital lines.</p></div>
               </li>
               <li className="flex items-start gap-4 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                 <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center font-bold text-indigo-800 shrink-0">CNet</div>
                 <div><h4 className="font-bold text-[#1A2B4C]">Cybernet</h4><p className="text-sm text-gray-500">Enterprise fiber and robust SIP trunking.</p></div>
               </li>
               <li className="flex items-start gap-4 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                 <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center font-bold text-green-800 shrink-0">Zong</div>
                 <div><h4 className="font-bold text-[#1A2B4C]">Zong 4G</h4><p className="text-sm text-gray-500">IMS-based VoIP for modern business.</p></div>
               </li>
               <li className="flex items-start gap-4 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                 <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center font-bold text-gray-800 shrink-0"><Globe size={20}/></div>
                 <div><h4 className="font-bold text-[#1A2B4C]">Global Carriers</h4><p className="text-sm text-gray-500">Twilio, Bandwidth, or Voxbone for international presence.</p></div>
               </li>
             </ul>
           </div>
           
           <div className="bg-[#1A2B4C] p-12 rounded-[2rem] text-white">
             <h3 className="text-2xl font-black mb-4">Fully Managed Service</h3>
             <p className="text-gray-300 leading-relaxed mb-8">
               We don't just sell you the equipment; we manage the entire setup, ensuring QoS (Quality of Service) prioritizes voice traffic over your network.
             </p>
             <button className="bg-[#00B4D8] text-white px-8 py-4 rounded-full font-bold hover:bg-white hover:text-[#1A2B4C] transition-colors w-full shadow-lg shadow-[#00B4D8]/30">
               Request a VoIP Service Quote
             </button>
             <p className="text-center mt-6 text-sm text-gray-400">Or call 0321 425 6263</p>
           </div>
        </div>
      </div>
    </div>
  );
}
