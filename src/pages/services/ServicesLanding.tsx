import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Users, MonitorPlay, Gamepad2, BrainCircuit, Bot, Cog, Loader2, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { subscribeToServicesPage, ServicePageData, getAllServices, Service } from '../../lib/firebase/firestore-helpers';

export function ServicesLanding() {
  const [pageData, setPageData] = useState<ServicePageData | null>(null);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const services = await getAllServices();
      setAllServices(services);
      
      const unsubscribe = subscribeToServicesPage((data) => {
        setPageData(data);
        setLoading(false);
      });
      return unsubscribe;
    };

    let unsubscribe: () => void;
    fetchData().then(unsub => {
      unsubscribe = unsub;
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
        <div className="text-center">
          <Loader2 className="animate-spin text-[#00B4D8] mx-auto mb-4" size={40} />
          <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Loading Service Solutions...</p>
        </div>
      </div>
    );
  }

  const data = {
    heroHeading: pageData?.heroHeading || 'Beyond Products. We Deliver Experiences.',
    heroSubheading: pageData?.heroSubheading || 'Whether it\'s a 500-person corporate gala, a high-stakes esports tournament, or an AI system that runs your business processes—we bring your vision to life.',
    heroImageUrl: pageData?.heroImageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=2000',
    introText: pageData?.introText || 'We bridge the gap between human intelligence and technical excellence.',
    serviceIds: pageData?.serviceIds || [],
    ctaText: pageData?.ctaText || 'Consult an Expert',
    ctaLink: pageData?.ctaLink || '/contact'
  };

  const displayedServices = allServices.filter(s => 
    data.serviceIds.includes(s.id || '') || (data.serviceIds.length === 0 && s.isActive)
  );

  return (
    <div className="flex-1 w-full bg-[#f8f9fa] pb-16">
      {/* Hero Section */}
      <div className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img loading="lazy" src={data.heroImageUrl} alt="Services" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[#1A2B4C]/80 mix-blend-multiply"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[#00B4D8] text-xs font-black uppercase tracking-[0.4em] mb-4 block"
          >
            Our Expertise
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-7xl font-black text-white mb-6 tracking-tight leading-none"
          >
            {data.heroHeading}
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-white max-w-4xl mx-auto leading-relaxed font-medium prose prose-invert max-w-none [&_*]:break-words [&_*]:whitespace-normal"
            dangerouslySetInnerHTML={{ __html: data.heroSubheading }}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-16 relative z-20">
        {/* Intro Bar */}
        <div className="bg-white p-12 rounded-[3rem] shadow-2xl border border-gray-100 flex flex-col md:flex-row items-center gap-12 mb-16">
           <div className="w-20 h-20 bg-blue-50 text-[#00B4D8] rounded-3xl flex items-center justify-center shrink-0">
              <Sparkles size={40} />
           </div>
           <div className="text-2xl font-black text-[#1A2B4C] leading-tight flex-grow prose prose-lg max-w-none [&_*]:break-words [&_*]:whitespace-normal" dangerouslySetInnerHTML={{ __html: data.introText }} />
           <Link to={data.ctaLink} className="bg-[#1A2B4C] text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-[#00B4D8] transition-all flex items-center gap-3 whitespace-nowrap">
              {data.ctaText} <ArrowRight size={18} />
           </Link>
        </div>

        {/* Dynamic Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {displayedServices.map((service, idx) => (
             <motion.div 
               key={service.id}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: idx * 0.1 }}
               className="bg-white rounded-[3rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all group"
             >
                <div className="h-48 relative overflow-hidden">
                   <img loading="lazy" src={service.imageUrl} alt={service.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                   <div className="absolute top-4 left-4">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                         <img loading="lazy" src={service.iconUrl} alt="icon" className="w-6 h-6" />
                      </div>
                   </div>
                </div>
                <div className="p-10">
                   <h3 className="text-2xl font-black text-[#1A2B4C] mb-4 group-hover:text-[#00B4D8] transition-colors">{service.title}</h3>
                   <div className="text-gray-500 text-sm leading-relaxed mb-8 line-clamp-3 font-medium prose prose-sm prose-p:m-0 max-w-none" dangerouslySetInnerHTML={{ __html: service.description || '' }} />
                   <Link to={`/services/${service.slug}`} className="flex items-center gap-2 text-[#00B4D8] font-black uppercase tracking-widest text-[10px] group-hover:gap-4 transition-all">
                      Explore Integration <ArrowRight size={14} />
                   </Link>
                </div>
             </motion.div>
           ))}
        </div>

        {/* Standards Bar */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8">
           {[
             { label: 'Quality Assurance', icon: ShieldCheck, color: 'text-emerald-500' },
             { label: 'Instant Support', icon: Zap, color: 'text-amber-500' },
             { label: 'Modern Tech Stack', icon: Cog, color: 'text-blue-500' }
           ].map((std, i) => (
             <div key={i} className="flex items-center gap-6 p-8 bg-white rounded-[2rem] border border-gray-100">
                <div className={`${std.color}`}>
                   <std.icon size={32} />
                </div>
                <div className="text-sm font-black text-[#1A2B4C] uppercase tracking-widest">{std.label}</div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}

import { motion } from 'motion/react';

