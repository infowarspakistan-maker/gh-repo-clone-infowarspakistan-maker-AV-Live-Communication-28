import React from 'react';
import { motion } from 'motion/react';
import { Settings, Shield, Edit3, Server } from 'lucide-react';
import { SEO } from '../components/SEO';

export function Provisioning() {
  return (
    <div className="bg-[#F8F9FA] min-h-screen pb-16">
      <SEO title="Provisioning" />
      <div className="bg-[#1A2B4C] text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-900/20 mix-blend-multiply"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black mb-6 tracking-tight"
          >
            Plug-and-Play Simplicity.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-white max-w-3xl mx-auto leading-relaxed"
          >
            Skip the complicated IT configuration. We pre-configure every IP phone, video bar, and gateway in our lab before shipping, so they are ready to use straight out of the box.
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 space-y-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="bg-white p-8 rounded-2xl border border-gray-200 flex items-start gap-6 shadow-sm hover:shadow-md transition-shadow">
             <div className="w-14 h-14 bg-[#00B4D8]/10 text-[#00B4D8] rounded-xl flex items-center justify-center shrink-0">
               <Settings size={28} />
             </div>
             <div>
               <h3 className="text-xl font-bold text-[#1A2B4C] mb-2">Auto-provisioning</h3>
               <p className="text-gray-600">Pre-loaded with your SIP credentials, extension numbers, and VPN settings directly from our provisioning servers.</p>
             </div>
           </div>

           <div className="bg-white p-8 rounded-2xl border border-gray-200 flex items-start gap-6 shadow-sm hover:shadow-md transition-shadow">
             <div className="w-14 h-14 bg-[#00B4D8]/10 text-[#00B4D8] rounded-xl flex items-center justify-center shrink-0">
               <Shield size={28} />
             </div>
             <div>
               <h3 className="text-xl font-bold text-[#1A2B4C] mb-2">Firmware Updates</h3>
               <p className="text-gray-600">We flash and test the latest stable firmware for all devices to ensure maximum security and performance.</p>
             </div>
           </div>

           <div className="bg-white p-8 rounded-2xl border border-gray-200 flex items-start gap-6 shadow-sm hover:shadow-md transition-shadow">
             <div className="w-14 h-14 bg-[#00B4D8]/10 text-[#00B4D8] rounded-xl flex items-center justify-center shrink-0">
               <Edit3 size={28} />
             </div>
             <div>
               <h3 className="text-xl font-bold text-[#1A2B4C] mb-2">Customization</h3>
               <p className="text-gray-600">Set custom wallpapers, speed-dial buttons, and BLF (Busy Lamp Field) keys per your specific user requirements.</p>
             </div>
           </div>

           <div className="bg-white p-8 rounded-2xl border border-gray-200 flex items-start gap-6 shadow-sm hover:shadow-md transition-shadow">
             <div className="w-14 h-14 bg-[#00B4D8]/10 text-[#00B4D8] rounded-xl flex items-center justify-center shrink-0">
               <Server size={28} />
             </div>
             <div>
               <h3 className="text-xl font-bold text-[#1A2B4C] mb-2">Supported Platforms</h3>
               <p className="text-gray-600">We support 3CX, Asterisk, Cisco UCM, Grandstream UCM, and BroadSoft native provisioning.</p>
             </div>
           </div>
        </div>

        <div className="bg-[#1A2B4C] rounded-[2rem] p-12 text-center text-white">
           <h3 className="text-2xl font-black mb-4">Pricing</h3>
           <p className="text-gray-300 text-lg mb-6 max-w-2xl mx-auto">
             Minimal setup fee per device. <span className="font-bold text-white">Waived entirely on bulk orders over 50 units.</span>
           </p>
           <button className="bg-[#00B4D8] text-white px-8 py-4 rounded-full font-bold hover:bg-white hover:text-[#1A2B4C] transition-colors">
             Contact Sales
           </button>
        </div>
      </div>
    </div>
  );
}
