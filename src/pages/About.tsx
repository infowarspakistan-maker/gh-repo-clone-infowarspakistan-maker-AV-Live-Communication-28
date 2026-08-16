import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, Award, ShieldCheck, MapPin, CheckCircle, Loader2, Target, History, Heart } from 'lucide-react';
import { subscribeToAbout, AboutData } from '../lib/firebase/firestore-helpers';
import { SEO } from '../components/SEO';

export function About() {
  const [content, setContent] = useState<AboutData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAbout((data) => {
      setContent(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="text-center">
          <Loader2 className="animate-spin text-[#00B4D8] mx-auto mb-4" size={40} />
          <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Loading Our Story...</p>
        </div>
      </div>
    );
  }

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
        title="About AV Live Communications | Pakistan's AV Integration Leaders"
        description="Learn about our 15-year journey of unifying people and ideas. AV Live is Pakistan's premier systems integrator for professional communication technology."
        schema={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          "name": "About AV Live Communications",
          "description": "Learn about our 15-year journey of unifying people and ideas.",
          "publisher": {
            "@id": "https://avlive.com.pk/#organization"
          }
        }}
      />
      {/* Hero Section */}
      <div className="relative h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img loading="lazy" src={data.heroImageUrl} alt="About Us" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[#1A2B4C]/80 mix-blend-multiply"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[#00B4D8] text-xs font-black uppercase tracking-[0.4em] mb-4 block"
          >
            Since 2010
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight"
          >
            {data.heroHeading}
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-white max-w-3xl mx-auto leading-relaxed prose prose-invert max-w-none [&_*]:break-words"
            dangerouslySetInnerHTML={{ __html: data.heroSubheading }}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
              className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl border border-gray-100 text-center"
            >
              <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                <stat.icon size={24} />
              </div>
              <div className="text-3xl font-black text-[#1A2B4C] mb-1">{stat.value}+</div>
              <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
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
      </div>
    </div>
  );
}

