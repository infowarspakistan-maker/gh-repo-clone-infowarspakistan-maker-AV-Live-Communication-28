import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRightLeft, Info, Check } from 'lucide-react';
import { SEO } from '../components/SEO';

const PRODUCTS = {
  'ip-phones': [
    { id: 'cisco-8841', name: 'Cisco 8841', lines: '5 Lines', poe: 'Yes', screen: '5" Color Widescreen', warranty: '1 Year' },
    { id: 'yealink-t46s', name: 'Yealink T46S', lines: '16 Lines', poe: 'Yes', screen: '4.3" Color Touch', warranty: '1 Year' },
    { id: 'polycom-vvx-250', name: 'Polycom VVX 250', lines: '4 Lines', poe: 'Yes', screen: '2.8" Color LCD', warranty: '1 Year' }
  ],
  'video-conferencing': [
    { id: 'poly-studio', name: 'Poly Studio Bar', camera: '4K', fov: '120°', micRange: '15 ft', platform: 'All (USB)' },
    { id: 'logitech-rally', name: 'Logitech Rally Bar', camera: '4K PTZ', fov: '90°', micRange: '15 ft', platform: 'All (Appliance)' }
  ],
  'projectors': [
    { id: 'epson-flex', name: 'Epson Lifestudio Flex Plus', resolution: '4K PRO-UHD', brightness: '3,000 Lumens', lightSource: '3LCD Triple Core Engine', smartOS: 'Google TV', audio: 'Bose Sound' },
    { id: 'benq-w4100i', name: 'BenQ W4100i Cinema', resolution: '4K UHD HDR', brightness: '3,000 ANSI Lumens', lightSource: 'LED Light Engine', smartOS: 'Android TV', audio: 'Stereo' },
    { id: 'sony-bravia-7', name: 'Sony BRAVIA Projector 7', resolution: 'Native 4K UHD', brightness: '2,000 Lumens', lightSource: 'Pristine Laser Diode', smartOS: 'None (Premium Cinema)', audio: 'Home Theater Out' }
  ]
};

export function Compare() {
  const [category, setCategory] = useState<'ip-phones' | 'video-conferencing' | 'projectors'>('ip-phones');

  return (
    <div className="bg-[#F8F9FA] min-h-screen pb-16">
      <SEO title="Compare" />
      <div className="bg-[#1A2B4C] text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-900/20 mix-blend-multiply"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black mb-6 tracking-tight"
          >
            Compare. Decide. Buy with Confidence.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-white max-w-3xl mx-auto leading-relaxed"
          >
            Not sure which model fits your needs? Our dynamic comparison charts highlight the key differences in features, specs, and pricing.
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="flex gap-4 mb-8 justify-center flex-wrap">
           <button onClick={() => setCategory('ip-phones')} className={`px-6 py-3 rounded-full font-bold text-sm ${category === 'ip-phones' ? 'bg-[#00B4D8] text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
             IP Phones
           </button>
           <button onClick={() => setCategory('video-conferencing')} className={`px-6 py-3 rounded-full font-bold text-sm ${category === 'video-conferencing' ? 'bg-[#00B4D8] text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
             Video Conferencing
           </button>
           <button onClick={() => setCategory('projectors')} className={`px-6 py-3 rounded-full font-bold text-sm ${category === 'projectors' ? 'bg-[#00B4D8] text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
             Projectors
           </button>
        </div>

        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden overflow-x-auto">
          {category === 'ip-phones' ? (
            <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="bg-gray-50 border-b border-gray-200">
                   <th className="py-6 px-6 font-bold text-gray-500 uppercase text-xs tracking-wider w-1/4">Feature</th>
                   {PRODUCTS['ip-phones'].map(p => (
                     <th key={p.id} className="py-6 px-6 font-bold text-[#1A2B4C] text-lg">{p.name}</th>
                   ))}
                 </tr>
               </thead>
               <tbody className="text-sm text-gray-600">
                 <tr className="border-b border-gray-100">
                   <td className="py-5 px-6 font-bold text-gray-800">Lines</td>
                   {PRODUCTS['ip-phones'].map(p => <td key={p.id} className="py-5 px-6">{p.lines}</td>)}
                 </tr>
                 <tr className="border-b border-gray-100">
                   <td className="py-5 px-6 font-bold text-gray-800">PoE Support</td>
                   {PRODUCTS['ip-phones'].map(p => <td key={p.id} className="py-5 px-6">{p.poe}</td>)}
                 </tr>
                 <tr className="border-b border-gray-100">
                   <td className="py-5 px-6 font-bold text-gray-800">Screen</td>
                   {PRODUCTS['ip-phones'].map(p => <td key={p.id} className="py-5 px-6">{p.screen}</td>)}
                 </tr>
                 <tr>
                   <td className="py-5 px-6 font-bold text-gray-800">Warranty</td>
                   {PRODUCTS['ip-phones'].map(p => <td key={p.id} className="py-5 px-6">{p.warranty}</td>)}
                 </tr>
               </tbody>
            </table>
          ) : category === 'video-conferencing' ? (
            <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="bg-gray-50 border-b border-gray-200">
                   <th className="py-6 px-6 font-bold text-gray-500 uppercase text-xs tracking-wider w-1/4">Feature</th>
                   {PRODUCTS['video-conferencing'].map(p => (
                     <th key={p.id} className="py-6 px-6 font-bold text-[#1A2B4C] text-lg">{p.name}</th>
                   ))}
                 </tr>
               </thead>
               <tbody className="text-sm text-gray-600">
                 <tr className="border-b border-gray-100">
                   <td className="py-5 px-6 font-bold text-gray-800">Camera Quality</td>
                   {PRODUCTS['video-conferencing'].map(p => <td key={p.id} className="py-5 px-6">{p.camera}</td>)}
                 </tr>
                 <tr className="border-b border-gray-100">
                   <td className="py-5 px-6 font-bold text-gray-800">Field of View</td>
                   {PRODUCTS['video-conferencing'].map(p => <td key={p.id} className="py-5 px-6">{p.fov}</td>)}
                 </tr>
                 <tr className="border-b border-gray-100">
                   <td className="py-5 px-6 font-bold text-gray-800">Mic Pickup Range</td>
                   {PRODUCTS['video-conferencing'].map(p => <td key={p.id} className="py-5 px-6">{p.micRange}</td>)}
                 </tr>
                 <tr>
                   <td className="py-5 px-6 font-bold text-gray-800">Platform Support</td>
                   {PRODUCTS['video-conferencing'].map(p => <td key={p.id} className="py-5 px-6">{p.platform}</td>)}
                 </tr>
               </tbody>
            </table>
          ) : (
            <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="bg-gray-50 border-b border-gray-200">
                   <th className="py-6 px-6 font-bold text-gray-500 uppercase text-xs tracking-wider w-1/4">Feature</th>
                   {PRODUCTS['projectors'].map(p => (
                     <th key={p.id} className="py-6 px-6 font-bold text-[#1A2B4C] text-lg">{p.name}</th>
                   ))}
                 </tr>
               </thead>
               <tbody className="text-sm text-gray-600">
                 <tr className="border-b border-gray-100">
                   <td className="py-5 px-6 font-bold text-gray-800">Resolution</td>
                   {PRODUCTS['projectors'].map(p => <td key={p.id} className="py-5 px-6">{p.resolution}</td>)}
                 </tr>
                 <tr className="border-b border-gray-100">
                   <td className="py-5 px-6 font-bold text-gray-800">Brightness</td>
                   {PRODUCTS['projectors'].map(p => <td key={p.id} className="py-5 px-6">{p.brightness}</td>)}
                 </tr>
                 <tr className="border-b border-gray-100">
                   <td className="py-5 px-6 font-bold text-gray-800">Light Source</td>
                   {PRODUCTS['projectors'].map(p => <td key={p.id} className="py-5 px-6">{p.lightSource}</td>)}
                 </tr>
                 <tr className="border-b border-gray-100">
                   <td className="py-5 px-6 font-bold text-gray-800">Smart OS</td>
                   {PRODUCTS['projectors'].map(p => <td key={p.id} className="py-5 px-6">{p.smartOS}</td>)}
                 </tr>
                 <tr>
                   <td className="py-5 px-6 font-bold text-gray-800">Audio Setup</td>
                   {PRODUCTS['projectors'].map(p => <td key={p.id} className="py-5 px-6">{p.audio}</td>)}
                 </tr>
               </tbody>
            </table>
          )}
        </div>

        <div className="mt-16 bg-[#1A2B4C] rounded-[2rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="text-white">
             <h3 className="text-2xl font-black mb-2 flex items-center gap-2"><Info className="text-[#00B4D8]"/> Need a Custom Comparison?</h3>
             <p className="text-gray-300">We can compare any products not listed here. Let our experts build a matrix for you.</p>
           </div>
           <button className="bg-[#00B4D8] text-white px-8 py-4 rounded-full font-bold hover:bg-white hover:text-[#1A2B4C] transition-colors whitespace-nowrap">
             Request Comparison Form
           </button>
        </div>
      </div>
    </div>
  );
}
