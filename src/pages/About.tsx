import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, Award, ShieldCheck, MapPin, CheckCircle, Loader2, Target, History, Heart } from 'lucide-react';
import { subscribeToAbout, AboutData } from '../lib/firebase/firestore-helpers';
import { SEO } from '../components/SEO';
import { Breadcrumbs } from '../components/Breadcrumbs';

export function About() {
  const [content, setContent] = useState<AboutData | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToAbout((data) => {
      setContent(data);
    });
    return () => unsubscribe();
  }, []);

  const data = {
    heroHeading: content?.heroHeading || 'Unifying People and Ideas Since 2010',
    heroSubheading: content?.heroSubheading || 'We are an experienced leader in the audio-visual collaboration field.',
    heroImageUrl: content?.heroImageUrl || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=2000',
    mission: content?.mission || 'To provide integrated multimedia tools that drive business innovation and profitability.',
    vision: content?.vision || 'To lead Pakistan\'s digital transformation by making enterprise-grade communication tools accessible, secure, and simple to use.',
    history: content?.history || 'Founded in 2010, AV Live Communications began with a single vision: to bridge the communication gap in Pakistan using world-class technology. Over the last decade, we have evolved from a small hardware supplier into a full-scale systems integrator.',
    teamDescription: content?.teamDescription || 'Our team comprises Polycom-certified engineers, Cisco-accredited technicians, and dedicated support staff who understand the nuances of mission-critical communication.',
    teamImages: content?.teamImages || [],
    values: content?.values || ['Innovation', 'Integrity', 'Customer First', 'Excellence'],
    stats: {
      yearsExperience: content?.stats?.yearsExperience ?? 15,
      happyClients: content?.stats?.happyClients ?? 5000,
      projectsCompleted: content?.stats?.projectsCompleted ?? 10000,
      teamMembers: content?.stats?.teamMembers ?? 45,
    },
  };

  return (
    <div className="bg-[#F8F9FA] min-h-screen pb-16">
      <SEO 
        title="About AV Live | Pro-AV & Event Engineering Pakistan"
        description="Learn how AV Live Communications delivers enterprise video conferencing, unified communications, 3D hologram stages & corporate events in Pakistan."
        url="https://avlive.com.pk/about"
        image="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200"
        imageAlt="About AV Live Communications Pakistan"
        schema={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          "name": "About AV Live Communications",
          "description": "Learn how AV Live Communications delivers enterprise video conferencing, unified communications, 3D hologram stages & corporate events in Pakistan.",
          "publisher": {
            "@id": "https://avlive.com.pk/#organization"
          }
        }}
      />
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-2.5">
        <Breadcrumbs items={[{ label: 'About Us' }]} />
      </div>
      {/* Compact 16:6 Hero Section */}
      <div className="relative aspect-[16/9] sm:aspect-[16/6] min-h-[220px] max-h-[300px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img loading="lazy" src={data.heroImageUrl} alt="About AV Live Communications Pakistan" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[#1A2B4C]/85 mix-blend-multiply"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center pt-4 pb-10">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[#00B4D8] text-[10px] font-black uppercase tracking-[0.35em] mb-2 block"
          >
            Pioneering Pro-AV &amp; Events Since 2010
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-2.5 tracking-tight leading-tight"
          >
            {data.heroHeading}
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xs sm:text-sm md:text-base text-white/90 max-w-3xl mx-auto leading-relaxed prose prose-invert max-w-none [&_*]:break-words"
            dangerouslySetInnerHTML={{ __html: data.heroSubheading }}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 -mt-5 relative z-20">
        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: 'Years Experience', value: data.stats.yearsExperience, icon: History, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Happy Clients', value: data.stats.happyClients, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Projects Done', value: data.stats.projectsCompleted, icon: Award, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Team Members', value: data.stats.teamMembers, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' }
          ].map((stat, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + (idx * 0.1) }}
              className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-lg border border-gray-100 text-center"
            >
              <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mx-auto mb-2.5`}>
                <stat.icon size={20} />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-[#1A2B4C] mb-0.5">{stat.value}+</div>
              <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-8 lg:mt-10">
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white p-12 rounded-[3rem] shadow-sm border border-gray-100 flex flex-col gap-6"
          >
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center">
              <Target size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-[#1A2B4C] mb-4">Our Mission</h3>
              <div className="text-gray-600 leading-relaxed text-lg prose prose-lg max-w-none [&_*]:break-words [&_*]:whitespace-normal" dangerouslySetInnerHTML={{ __html: data.mission }} />
            </div>
          </motion.div>
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-[#1A2B4C] p-12 rounded-[3rem] shadow-xl text-white flex flex-col gap-6"
          >
            <div className="w-16 h-16 bg-white/10 text-[#00B4D8] rounded-3xl flex items-center justify-center">
              <ShieldCheck size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white mb-4">Our Vision</h3>
              <div className="text-gray-300 leading-relaxed text-lg prose prose-lg prose-invert max-w-none [&_*]:break-words [&_*]:whitespace-normal" dangerouslySetInnerHTML={{ __html: data.vision }} />
            </div>
          </motion.div>
        </div>

        {/* History / Story */}
        <div className="mt-16 bg-white rounded-[4rem] overflow-hidden shadow-sm border border-gray-100">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="p-12 md:p-16 flex flex-col justify-center">
               <span className="text-[#00B4D8] text-xs font-black uppercase tracking-[0.3em] mb-4 block">Established 2010</span>
               <h2 className="text-4xl font-black text-[#1A2B4C] mb-8 tracking-tight">Bridging the Communication Gap</h2>
               <div className="text-gray-600 text-lg leading-relaxed whitespace-pre-wrap space-y-6 font-medium prose prose-lg max-w-none [&_*]:break-words [&_*]:whitespace-normal" dangerouslySetInnerHTML={{ __html: data.history }} />
            </div>
            <div className="relative min-h-[400px]">
              <img loading="lazy" 
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200" 
                alt="Office Space" 
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="mt-16 text-center">
           <span className="text-[#00B4D8] text-xs font-black uppercase tracking-[0.3em] mb-4 block">Our DNA</span>
           <h2 className="text-4xl font-black text-[#1A2B4C] mb-16 tracking-tight">The Principles That Guide Us</h2>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {data.values.map((val, i) => (
                <div key={i} className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm hover:border-[#00B4D8] hover:shadow-xl transition-all group">
                   <div className="w-14 h-14 bg-gray-50 text-[#1A2B4C] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-[#1A2B4C] group-hover:text-white transition-colors">
                      <Award size={28} />
                   </div>
                   <h4 className="font-black text-[#1A2B4C] uppercase tracking-widest text-sm">{val}</h4>
                </div>
              ))}
           </div>
        </div>

        {/* Team Section */}
        <div className="mt-16 bg-[#00B4D8] rounded-[4rem] p-12 md:p-16 text-white flex flex-col lg:flex-row items-center gap-12 relative overflow-hidden">
          <div className="relative z-10 lg:w-2/3">
             <h2 className="text-4xl font-black mb-8 tracking-tight">Driven by Human Intelligence</h2>
             <div className="text-xl text-white/90 leading-relaxed font-medium prose prose-invert max-w-none [&_*]:break-words [&_*]:whitespace-normal" dangerouslySetInnerHTML={{ __html: data.teamDescription }} />
             <div className="mt-12 flex items-center gap-6">
                <div className="flex -space-x-4">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-12 h-12 rounded-full border-4 border-[#00B4D8] bg-gray-200 overflow-hidden shadow-lg">
                       <img loading="lazy" src={`https://i.pravatar.cc/150?u=${i}`} alt="Team" />
                    </div>
                  ))}
                </div>
                <div className="text-sm font-black uppercase tracking-widest">
                  Expert Consultants & Engineers
                </div>
             </div>
          </div>
          <div className="lg:w-1/3 flex justify-center lg:justify-end relative z-10">
             <div className="w-48 h-48 bg-white/20 rounded-full flex items-center justify-center border border-white/30 animate-pulse">
                <Users size={64} className="text-white" />
             </div>
          </div>
          {/* Abstract Shapes */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 rounded-full -translate-x-1/2 translate-y-1/2 blur-3xl"></div>
        </div>

        {/* Nationwide Engineering Hubs & Milestones Semantic Table */}
        <div className="mt-10 bg-white rounded-3xl p-5 sm:p-8 border border-gray-100 shadow-xs overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <caption className="bg-[#1A2B4C] text-white font-black text-left px-4 py-3 text-xs uppercase tracking-wider rounded-t-xl">
              AV Live Communications — Nationwide Engineering Hubs &amp; OEM Accreditations (Est. 2010)
            </caption>
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-[#1A2B4C] font-black uppercase text-[11px] tracking-wider">
                <th className="py-3 px-4">Regional Engineering Hub</th>
                <th className="py-3 px-4">Primary Capabilities &amp; Staging Inventory</th>
                <th className="py-3 px-4">Authorized OEM Ecosystems</th>
                <th className="py-3 px-4">Support SLA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="py-3 px-4 font-black text-[#1A2B4C]">Lahore Head Office (Johar Town)</td>
                <td className="py-3 px-4 text-gray-600">Central Pro-AV Warehouse, P2.5 SMD LED Fleet, 3D Hologram Lab &amp; RMA Bench</td>
                <td className="py-3 px-4 text-gray-600">HP Poly (Polycom), Cisco, Logitech, Yealink, Bosch</td>
                <td className="py-3 px-4 font-bold text-[#00B4D8]">15-Min Phone / Same-Day On-Site</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-black text-[#1A2B4C]">Karachi Regional Hub</td>
                <td className="py-3 px-4 text-gray-600">Banking Command Centers, Multinational Boardrooms &amp; Expo Centre Production</td>
                <td className="py-3 px-4 text-gray-600">Cisco Room Kits, Poly Studio X72, Grandstream, Axis</td>
                <td className="py-3 px-4 font-bold text-[#00B4D8]">15-Min Remote / Next-Day On-Site</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-black text-[#1A2B4C]">Islamabad &amp; Rawalpindi Hub</td>
                <td className="py-3 px-4 text-gray-600">Federal Ministry H.323 Codecs, Bosch Chairman/Delegate Mics &amp; Diplomatic Summits</td>
                <td className="py-3 px-4 text-gray-600">Polycom Group 500, Bosch Dicentis/CCS, Horion IFP</td>
                <td className="py-3 px-4 font-bold text-[#00B4D8]">15-Min Remote / On-Site Standby</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

