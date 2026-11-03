import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Cog, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { subscribeToServicesPage, ServicePageData, getAllServices } from '../../lib/firebase/firestore-helpers';
import { FALLBACK_SERVICES_CATALOG, mergeWithFallbackServices, EnrichedService } from '../../lib/services-catalog';
import { SEO } from '../../components/SEO';
import { Breadcrumbs } from '../../components/Breadcrumbs';

export function ServicesLanding() {
  const [pageData, setPageData] = useState<ServicePageData | null>(null);
  const [allServices, setAllServices] = useState<EnrichedService[]>(FALLBACK_SERVICES_CATALOG);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const services = await getAllServices();
        setAllServices(mergeWithFallbackServices(services));
      } catch (e) {
        console.warn('Using fallback services catalog:', e);
      }
      
      const unsubscribe = subscribeToServicesPage((data) => {
        setPageData(data);
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

  const data = {
    heroHeading: pageData?.heroHeading || 'Beyond Products. We Deliver Experiences.',
    heroSubheading: pageData?.heroSubheading || 'Whether it\'s a 500-person corporate gala, a hybrid summit bridged with Poly X70 & Polycom Group 500 video conferencing, a 3D Hologram Display launch, or an AI system that runs your business processes—we bring your vision to life.',
    heroImageUrl: pageData?.heroImageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=2000',
    introText: pageData?.introText || 'We bridge the gap between enterprise AV engineering, Corporate event management, and AI intelligence.',
    serviceIds: pageData?.serviceIds || [],
    ctaText: pageData?.ctaText || 'Consult an Expert',
    ctaLink: pageData?.ctaLink || '/contact'
  };

  const displayedServices = allServices.filter(s => 
    data.serviceIds.includes(s.id || '') || (data.serviceIds.length === 0 && s.isActive !== false)
  );

  return (
    <div className="flex-1 w-full bg-[#f8f9fa] pb-16">
      <SEO
        title="Corporate Events & Video Conferencing Services | AV Live"
        description="Turnkey Corporate Event Management, Hybrid Events, 3D Hologram Displays, Boardroom Video Conferencing & AI Automation across Pakistan."
        keywords="Corporate event management, Event management in Pakistan, hybrid event, Hologram Display, Video Conference in Pakistan, Polycom Group 500, Poly X70, AV Live"
        url="https://avlive.com.pk/services"
        image={data.heroImageUrl}
        schema={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Service",
              "@id": "https://avlive.com.pk/services#service",
              "name": "Corporate Event Management, Hybrid Events & Video Conferencing Integration",
              "url": "https://avlive.com.pk/services",
              "provider": {
                "@id": "https://avlive.com.pk/#organization"
              },
              "areaServed": ["Lahore", "Karachi", "Islamabad", "Pakistan"],
              "description": "Enterprise corporate event management, hybrid events, 3D hologram stage displays, and video conferencing boardroom integration in Pakistan.",
              "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "AV Live Enterprise Event & Integration Services",
                "itemListElement": displayedServices.map((svc, idx) => ({
                  "@type": "Offer",
                  "position": idx + 1,
                  "itemOffered": {
                    "@type": "Service",
                    "name": svc.title,
                    "description": svc.description?.replace(/<[^>]*>?/gm, ''),
                    "url": `https://avlive.com.pk/services/${svc.slug}`
                  }
                }))
              }
            }
          ]
        }}
      />
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-2.5">
        <Breadcrumbs items={[{ label: 'Services' }]} />
      </div>
      {/* Compact 16:6 Hero Section */}
      <div className="relative aspect-[16/9] sm:aspect-[16/6] min-h-[230px] max-h-[320px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img fetchPriority="high" src={data.heroImageUrl} alt="Corporate Event Management and Video Conferencing Services in Pakistan" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[#1A2B4C]/85 mix-blend-multiply"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center pt-5 pb-10 sm:pb-12">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[#00B4D8] text-[10px] font-black uppercase tracking-[0.3em] mb-2 block"
          >
            Our Expertise
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-2.5 tracking-tight leading-tight"
          >
            {data.heroHeading}
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xs sm:text-sm md:text-base text-white/90 max-w-3xl mx-auto leading-relaxed font-medium line-clamp-3 prose prose-invert max-w-none [&_*]:break-words [&_*]:whitespace-normal"
            dangerouslySetInnerHTML={{ __html: data.heroSubheading }}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 -mt-5 relative z-20">
        {/* Compact Intro Bar */}
        <div className="bg-white p-4 sm:p-6 lg:p-7 rounded-2xl lg:rounded-3xl shadow-xl border border-gray-100 flex flex-col md:flex-row items-center gap-4 lg:gap-8 mb-6 lg:mb-10">
           <div className="hidden sm:flex w-12 h-12 lg:w-14 lg:h-14 bg-blue-50 text-[#00B4D8] rounded-2xl items-center justify-center shrink-0">
              <Sparkles size={24} />
           </div>
           <div className="text-sm sm:text-base lg:text-lg font-black text-[#1A2B4C] leading-snug flex-grow prose max-w-none [&_*]:break-words [&_*]:whitespace-normal text-center md:text-left" dangerouslySetInnerHTML={{ __html: data.introText }} />
           <Link to={data.ctaLink} className="bg-[#1A2B4C] text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#00B4D8] transition-all flex items-center gap-2 whitespace-nowrap shrink-0">
              {data.ctaText} <ArrowRight size={15} />
           </Link>
        </div>

        {/* Dynamic Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
           {displayedServices.map((service, idx) => (
             <motion.div 
               key={service.id}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: idx * 0.05 }}
               className="bg-white rounded-2xl lg:rounded-3xl overflow-hidden border border-gray-100 shadow-xs hover:shadow-xl transition-all group flex flex-col"
             >
                <div className="aspect-[16/9] h-36 sm:h-40 relative overflow-hidden">
                   <img loading="lazy" src={service.imageUrl} alt={service.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                   <div className="absolute top-3 left-3">
                      <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-md">
                         <img loading="lazy" src={service.iconUrl} alt="icon" className="w-5 h-5" />
                      </div>
                   </div>
                </div>
                <div className="p-5 lg:p-6 flex flex-col flex-1">
                   <h3 className="text-base lg:text-lg font-black text-[#1A2B4C] mb-2 group-hover:text-[#00B4D8] transition-colors">{service.title}</h3>
                   <div className="text-gray-500 text-xs sm:text-sm leading-relaxed mb-4 line-clamp-3 font-medium prose prose-sm prose-p:m-0 max-w-none flex-1" dangerouslySetInnerHTML={{ __html: service.description || '' }} />
                   <Link to={`/services/${service.slug}`} className="flex items-center gap-1.5 text-[#00B4D8] font-black uppercase tracking-widest text-[10px] group-hover:gap-3 transition-all mt-auto pt-2">
                      Explore Integration <ArrowRight size={13} />
                   </Link>
                </div>
             </motion.div>
           ))}
        </div>

        {/* Answer-First Verdict & Semantic Service SLA Comparison Table */}
        <div className="mt-8 lg:mt-10 bg-white rounded-2xl lg:rounded-3xl border border-gray-100 p-5 sm:p-7 shadow-xs space-y-5">
          <div className="bg-[#1A2B4C]/5 border-l-4 border-[#00B4D8] rounded-xl p-4">
            <span className="block text-[10px] font-black uppercase tracking-widest text-[#00B4D8] mb-1">
              Direct Engineering Verdict (TL;DR) — AV Live Services Division
            </span>
            <p className="text-xs sm:text-sm font-semibold text-[#1A2B4C] leading-relaxed">
              Unlike catering-first event planners or box-moving IT traders, <strong>AV Live Communications</strong> (Est. 2011) owns its entire fleet of P2.5 SMD LED walls, line-array PA rigs, 3D HoloGauze stages, and authorized HP Poly, Cisco, and Logitech codecs—delivering turnkey <Link to="/event-management-in-pakistan" className="text-[#00B4D8] underline">Event Management in Pakistan</Link> and <Link to="/video-conference-in-pakistan" className="text-[#00B4D8] underline">Video Conference in Pakistan</Link> across Lahore, Karachi, and Islamabad with a 15-minute response SLA.
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <caption className="bg-[#1A2B4C] text-white font-black text-left px-4 py-3 text-xs uppercase tracking-wider">
                AV Live Turnkey Engineering, Event Production &amp; Integration Service Matrix (Pakistan)
              </caption>
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-[#1A2B4C] font-black uppercase text-[11px] tracking-wider">
                  <th className="py-3 px-4">Service Division</th>
                  <th className="py-3 px-4">Core In-House Hardware &amp; Deliverables</th>
                  <th className="py-3 px-4">Coverage &amp; SLA</th>
                  <th className="py-3 px-4">Reference PKR Tier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr className="hover:bg-gray-50/70">
                  <td className="py-3 px-4 font-black text-[#1A2B4C]"><Link to="/video-conference-in-pakistan" className="hover:text-[#00B4D8]">Boardroom Video Conferencing</Link></td>
                  <td className="py-3 px-4 text-gray-600">Polycom Group 500, Poly Studio X72/X70, Cisco Room Kits, RT60 Acoustic Tuning</td>
                  <td className="py-3 px-4 text-gray-600">Lahore, Karachi, Islamabad (15m SLA)</td>
                  <td className="py-3 px-4 font-bold text-[#00B4D8]">Rs. 295,000 – Rs. 2,850,000</td>
                </tr>
                <tr className="hover:bg-gray-50/70">
                  <td className="py-3 px-4 font-black text-[#1A2B4C]"><Link to="/event-management-in-pakistan" className="hover:text-[#00B4D8]">Corporate &amp; Hybrid Event Production</Link></td>
                  <td className="py-3 px-4 text-gray-600">P2.5/P3.91 SMD LED Screens, Line-Array Sound, Truss Rigging, 4K Multi-Cam Webcast</td>
                  <td className="py-3 px-4 text-gray-600">Nationwide On-Site Broadcast Crew</td>
                  <td className="py-3 px-4 font-bold text-[#00B4D8]">Rs. 180,000 – Rs. 2,500,000+</td>
                </tr>
                <tr className="hover:bg-gray-50/70">
                  <td className="py-3 px-4 font-black text-[#1A2B4C]"><Link to="/projection-mapping" className="hover:text-[#00B4D8]">3D Hologram &amp; Projection Mapping</Link></td>
                  <td className="py-3 px-4 text-gray-600">HoloGauze Stage Mesh, 20,000-Lumen Laser Projectors, Custom 3D Content Creation</td>
                  <td className="py-3 px-4 text-gray-600">PC Hotels, Serena &amp; Expo Centres</td>
                  <td className="py-3 px-4 font-bold text-[#00B4D8]">Rs. 480,000 – Rs. 1,850,000</td>
                </tr>
                <tr className="hover:bg-gray-50/70">
                  <td className="py-3 px-4 font-black text-[#1A2B4C]"><Link to="/services/ai-automation" className="hover:text-[#00B4D8]">AI Agents &amp; VoIP IP-PBX Automation</Link></td>
                  <td className="py-3 px-4 text-gray-600">3CX Pro 8 SC, FreePBX, Grandstream UCM6308, AI Voice/CRM Digital Workers</td>
                  <td className="py-3 px-4 text-gray-600">24/7 Cloud &amp; On-Premise Support</td>
                  <td className="py-3 px-4 font-bold text-[#00B4D8]">Custom B2B BoQ Quote</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Standards Bar */}
        <div className="mt-6 lg:mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
           {[
             { label: 'Quality Assurance', icon: ShieldCheck, color: 'text-emerald-500' },
             { label: 'Instant Support', icon: Zap, color: 'text-amber-500' },
             { label: 'Modern Tech Stack', icon: Cog, color: 'text-blue-500' }
           ].map((std, i) => (
             <div key={i} className="flex items-center gap-4 p-4 lg:p-6 bg-white rounded-2xl border border-gray-100">
                <div className={`${std.color}`}>
                   <std.icon size={24} />
                </div>
                <div className="text-xs font-black text-[#1A2B4C] uppercase tracking-widest">{std.label}</div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}

