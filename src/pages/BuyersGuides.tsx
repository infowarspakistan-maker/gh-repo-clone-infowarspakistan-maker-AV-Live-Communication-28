import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, Check, Download, Phone, Mail, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';

export function BuyersGuides() {
  return (
    <div className="bg-[#F8F9FA] min-h-screen pb-16">
      <SEO title="Buyers Guides" />
      {/* Hero Section */}
      <div className="bg-[#1A2B4C] text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-900/20 mix-blend-multiply"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black mb-6 tracking-tight"
          >
            The Right AV Solution Starts Here
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-white max-w-3xl mx-auto leading-relaxed"
          >
            Navigating the world of audio-visual technology can be overwhelming. Our buyer's guides simplify the process, helping you compare features, understand specifications, and choose the perfect solution for your budget and requirements.
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        
        <div className="space-y-12">
          {/* Guide 1: IP Phones */}
          <div className="bg-white rounded-[2rem] border border-gray-200 overflow-hidden shadow-sm flex flex-col lg:flex-row group">
            <div className="lg:w-1/3 bg-gray-50 p-10 flex flex-col justify-center items-center text-center border-r border-gray-100">
              <div className="w-20 h-20 bg-white shadow-sm rounded-3xl flex items-center justify-center mb-6 text-[#00B4D8]">
                <BookOpen size={40} />
              </div>
              <h2 className="text-2xl font-black text-[#1A2B4C] mb-4 leading-tight">The Ultimate IP Phone Buyer's Guide (2026)</h2>
              <div className="flex flex-col gap-3 w-full mt-4">
                 <button className="bg-[#00B4D8] text-white py-3 px-6 rounded-full font-bold text-sm hover:bg-[#1A2B4C] transition-colors w-full flex items-center justify-center gap-2">
                   <Download size={16} /> Download Full Guide
                 </button>
                 <button className="bg-white border border-[#1A2B4C] text-[#1A2B4C] py-3 px-6 rounded-full font-bold text-sm hover:bg-gray-50 transition-colors w-full">
                   Compare IP Phone Models
                 </button>
              </div>
            </div>
            <div className="p-8 lg:p-12 lg:w-2/3">
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Overview</h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                An IP phone is any device that makes calls over the internet using Voice over IP technology. But not every IP phone system works the same way—some are cloud-based and easy to manage, while others use on-premise or hybrid infrastructure for more control. This guide helps you choose the right one based on your size, setup, budget, and communication needs.
              </p>
              
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">What You'll Learn</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  ['Types of IP Phones', 'Desk phones, conference phones, and cordless options.'],
                  ['Key Features', 'Number of lines, PoE support, screen type, and HD audio.'],
                  ['Top Brands', 'Compare Cisco, Polycom, Yealink, Grandstream, and Fanvil.'],
                  ['Deployment', 'Cloud-based vs. on-premise vs. hybrid.'],
                  ['Budgeting', 'Entry-level vs. enterprise-grade options.'],
                  ['Network Req.', 'Why underlying infrastructure is important.']
                ].map(([title, desc], i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check size={18} className="text-[#00B4D8] shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-600"><span className="font-bold text-gray-800">{title}:</span> {desc}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t border-gray-100 flex items-center gap-3">
                 <span className="text-xs font-black text-gray-400 uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-md">Recommended For</span>
                 <span className="text-sm text-gray-600 font-medium">Small businesses, call centers, enterprises, and government offices.</span>
              </div>
            </div>
          </div>

          {/* Guide 2: Video Conferencing */}
          <div className="bg-white rounded-[2rem] border border-gray-200 overflow-hidden shadow-sm flex flex-col lg:flex-row group">
            <div className="lg:w-1/3 bg-gray-50 p-10 flex flex-col justify-center items-center text-center border-r border-gray-100">
              <div className="w-20 h-20 bg-white shadow-sm rounded-3xl flex items-center justify-center mb-6 text-[#00B4D8]">
                <BookOpen size={40} />
              </div>
              <h2 className="text-2xl font-black text-[#1A2B4C] mb-4 leading-tight">The Complete Video Conferencing Buyer's Guide</h2>
              <div className="flex flex-col gap-3 w-full mt-4">
                 <button className="bg-[#00B4D8] text-white py-3 px-6 rounded-full font-bold text-sm hover:bg-[#1A2B4C] transition-colors w-full flex items-center justify-center gap-2">
                   <Download size={16} /> Download Full Guide
                 </button>
                 <Link to="/contact" className="bg-white border border-[#1A2B4C] text-[#1A2B4C] py-3 px-6 rounded-full font-bold text-sm hover:bg-gray-50 transition-colors w-full inline-flex items-center justify-center">
                   Book a Consultation
                 </Link>
              </div>
            </div>
            <div className="p-8 lg:p-12 lg:w-2/3">
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Overview</h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                In 2026, video conferencing technology sits at the center of how organizations communicate, collaborate, innovate, and make decisions. The best video conferencing solutions are integrated collaboration ecosystems that combine hardware, software, AI, cloud management, and workflow integrations.
              </p>
              
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">What You'll Learn</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  ['Room Size', 'Equipment depends on room size and meeting workflow.'],
                  ['The Four Essentials', 'Audio pickup, camera framing, display clarity, connection.'],
                  ['System Types', 'All-in-One vs. Modular Systems pros and cons.'],
                  ['Software Platforms', 'Zoom Workplace, Cisco Webex, Microsoft Teams.'],
                  ['Security', 'End-to-end encryption and secure protocols.'],
                  ['AI Features', 'Automated framing, noise cancellation, transcription.']
                ].map(([title, desc], i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check size={18} className="text-[#00B4D8] shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-600"><span className="font-bold text-gray-800">{title}:</span> {desc}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t border-gray-100 flex items-center gap-3">
                 <span className="text-xs font-black text-gray-400 uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-md">Recommended For</span>
                 <span className="text-sm text-gray-600 font-medium">Corporate offices, educational institutions, healthcare facilities.</span>
              </div>
            </div>
          </div>

          {/* Guide 3: PA Systems */}
          <div className="bg-white rounded-[2rem] border border-gray-200 overflow-hidden shadow-sm flex flex-col lg:flex-row group">
            <div className="lg:w-1/3 bg-gray-50 p-10 flex flex-col justify-center items-center text-center border-r border-gray-100">
              <div className="w-20 h-20 bg-white shadow-sm rounded-3xl flex items-center justify-center mb-6 text-[#00B4D8]">
                <BookOpen size={40} />
              </div>
              <h2 className="text-2xl font-black text-[#1A2B4C] mb-4 leading-tight">The Public Address & Paging Systems Buyer's Guide</h2>
              <div className="flex flex-col gap-3 w-full mt-4">
                 <button className="bg-[#00B4D8] text-white py-3 px-6 rounded-full font-bold text-sm hover:bg-[#1A2B4C] transition-colors w-full flex items-center justify-center gap-2">
                   <Download size={16} /> Download Full Guide
                 </button>
                 <Link to="/contact" className="bg-white border border-[#1A2B4C] text-[#1A2B4C] py-3 px-6 rounded-full font-bold text-sm hover:bg-gray-50 transition-colors w-full inline-flex items-center justify-center">
                   Request a Site Survey
                 </Link>
              </div>
            </div>
            <div className="p-8 lg:p-12 lg:w-2/3">
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Overview</h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                A public address system is designed to amplify sound and distribute audio across multiple loudspeakers within a building or facility. Modern PA systems in 2026 consist of five tightly integrated components and are used for public broadcast of messages, emergency notifications, and background music.
              </p>
              
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">What You'll Learn</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  ['Core Components', 'Microphones, amplifiers, speakers, mixing consoles.'],
                  ['Wired vs. Wireless', 'Why wired IP-based systems remain the gold standard.'],
                  ['Analog vs. Digital', 'Choosing the right backbone for your facility size.'],
                  ['Zone Management', 'Independent zone addressing and multi-zone broadcast.'],
                  ['Integration', 'Interfacing with fire alarms and access control.']
                ].map(([title, desc], i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check size={18} className="text-[#00B4D8] shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-600"><span className="font-bold text-gray-800">{title}:</span> {desc}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t border-gray-100 flex items-center gap-3">
                 <span className="text-xs font-black text-gray-400 uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-md">Recommended For</span>
                 <span className="text-sm text-gray-600 font-medium">Industrial facilities, schools, places of worship, commercial buildings.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Comparison Tools Table */}
        <div className="mt-16 mb-16">
           <h2 className="text-3xl font-black text-[#1A2B4C] mb-8 text-center">At a Glance Comparison</h2>
           <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
             <table className="w-full text-left border-collapse bg-white">
               <thead>
                 <tr className="bg-gray-50 border-b border-gray-200">
                   <th className="py-5 px-6 font-bold text-gray-500 uppercase text-xs tracking-wider">Feature</th>
                   <th className="py-5 px-6 font-bold text-[#1A2B4C] uppercase text-sm tracking-wider">IP Phones</th>
                   <th className="py-5 px-6 font-bold text-[#1A2B4C] uppercase text-sm tracking-wider">Video Conferencing</th>
                   <th className="py-5 px-6 font-bold text-[#1A2B4C] uppercase text-sm tracking-wider">PA Systems</th>
                 </tr>
               </thead>
               <tbody className="text-sm text-gray-600">
                 <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                   <td className="py-4 px-6 font-bold text-gray-800">Guide Available</td>
                   <td className="py-4 px-6"><Check size={20} className="text-green-500" /></td>
                   <td className="py-4 px-6"><Check size={20} className="text-green-500" /></td>
                   <td className="py-4 px-6"><Check size={20} className="text-green-500" /></td>
                 </tr>
                 <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                   <td className="py-4 px-6 font-bold text-gray-800">Brand Comparison</td>
                   <td className="py-4 px-6">Cisco, Polycom, Yealink, Grandstream</td>
                   <td className="py-4 px-6">Cisco Webex, Polycom, Zoom</td>
                   <td className="py-4 px-6">Bosch, ITC, TOA</td>
                 </tr>
                 <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                   <td className="py-4 px-6 font-bold text-gray-800">Budget Range</td>
                   <td className="py-4 px-6 font-mono text-xs">PKR 5,000 – 50,000+</td>
                   <td className="py-4 px-6 font-mono text-xs">PKR 50,000 – 5,000,000+</td>
                   <td className="py-4 px-6 font-mono text-xs">PKR 50,000 – 2,000,000+</td>
                 </tr>
                 <tr className="hover:bg-gray-50 transition-colors">
                   <td className="py-4 px-6 font-bold text-gray-800">Best For</td>
                   <td className="py-4 px-6 font-medium">Daily voice communication</td>
                   <td className="py-4 px-6 font-medium">Remote collaboration</td>
                   <td className="py-4 px-6 font-medium">Mass notification & audio distribution</td>
                 </tr>
               </tbody>
             </table>
           </div>
        </div>

        {/* Still Not Sure CTA */}
        <div className="bg-[#1A2B4C] rounded-[2rem] p-10 md:p-16 relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#00B4D8] rounded-full blur-3xl opacity-20 -mr-32 -mt-32"></div>
          
          <div className="relative z-10 flex-1">
            <h2 className="text-3xl font-black text-white mb-4">Still Not Sure? Let Us Help.</h2>
            <p className="text-gray-300 mb-8 max-w-lg">Choosing the right AV solution can be complex. Our experts are here to guide you every step of the way.</p>
            
            <div className="flex flex-col gap-4 text-white/80 font-medium">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <Phone size={14} />
                </div>
                <span>0321 425 6263</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <Mail size={14} />
                </div>
                <span>info@avlive.com.pk</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <MapPin size={14} />
                </div>
                <span>Shop, Johar Town Block N, Lahore</span>
              </div>
            </div>
          </div>
          
          <div className="relative z-10 shrink-0">
             <Link to="/contact" className="bg-[#00B4D8] text-white px-8 py-5 rounded-full font-bold text-lg hover:bg-white hover:text-[#1A2B4C] transition-all inline-block text-center shadow-lg shadow-[#00B4D8]/30">
               Request a Free Consultation
             </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
