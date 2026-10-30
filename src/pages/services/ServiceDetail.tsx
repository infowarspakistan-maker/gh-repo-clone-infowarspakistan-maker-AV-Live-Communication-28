import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowRight, Loader2, Info } from 'lucide-react';
import { getAllServices } from '../../lib/firebase/firestore-helpers';
import { FALLBACK_SERVICES_CATALOG, mergeWithFallbackServices, EnrichedService } from '../../lib/services-catalog';
import { DeepQueryModal } from '../../components/DeepQueryModal';
import { SEO } from '../../components/SEO';
import { Breadcrumbs } from '../../components/Breadcrumbs';

function formatContent(content: string) {
  if (!content) return '';
  const hasHtml = /<[a-z][\s\S]*>/i.test(content);
  if (hasHtml) {
    return content;
  }
  
  const lines = content.split('\n');
  let html = '';
  let inList = false;

  for (let line of lines) {
    line = line.trim();
    if (!line) {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      continue;
    }

    if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
      if (!inList) {
        html += '<ul class="list-disc pl-6 mb-6 space-y-2 text-gray-600 font-medium">';
        inList = true;
      }
      const itemText = line.substring(1).trim();
      html += `<li>${itemText}</li>`;
    } else {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      if (line.endsWith(':')) {
        html += `<p class="font-bold text-[#1A2B4C] text-lg mt-6 mb-3">${line}</p>`;
      } else {
        html += `<p class="text-gray-600 leading-relaxed font-medium mb-4">${line}</p>`;
      }
    }
  }

  if (inList) {
    html += '</ul>';
  }

  return html;
}

export function ServiceDetail() {
  const { serviceSlug } = useParams<{ serviceSlug: string }>();
  const initialFallback = FALLBACK_SERVICES_CATALOG.find(s => s.slug === serviceSlug) || null;
  const [service, setService] = useState<EnrichedService | null>(initialFallback);
  const [loading, setLoading] = useState(!initialFallback);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('Consult with our AV Expert');

  useEffect(() => {
    const matchedFallback = FALLBACK_SERVICES_CATALOG.find(s => s.slug === serviceSlug) || null;
    if (matchedFallback) {
      setService(matchedFallback);
      setLoading(false);
    } else {
      setLoading(true);
    }

    const fetchService = async () => {
      try {
        const allServices = await getAllServices();
        const merged = mergeWithFallbackServices(allServices);
        const found = merged.find(s => s.slug === serviceSlug || s.id === serviceSlug) || null;
        setService(found);
      } catch (e) {
        console.warn('Error fetching service details, using fallback:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [serviceSlug]);

  if (loading && !service) {
    return (
      <div className="flex-1 min-h-screen flex items-center justify-center bg-[#f8f9fa]">
        <SEO
          title={`${(serviceSlug || 'Service').replace(/-/g, ' ')} | AV Live Communications Pakistan`}
          description="Enterprise AV integration, video conferencing, corporate event management, and VoIP solutions in Pakistan."
          url={`https://avlive.com.pk/services/${serviceSlug || ''}`}
        />
        <Loader2 className="animate-spin text-[#00B4D8]" size={40} />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="flex-1 min-h-screen flex flex-col items-center justify-center bg-[#f8f9fa] px-4 text-center">
        <SEO title="Service Not Found | AV Live Communications" noindex={true} />
        <h1 className="text-3xl font-black text-[#1A2B4C] mb-4">Service Not Found</h1>
        <Link to="/services" className="bg-[#1A2B4C] text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#00B4D8] transition-all">
          View All Services
        </Link>
      </div>
    );
  }

  const canonicalUrl = `https://avlive.com.pk/services/${service.slug || service.id}`;
  const serviceFaqs = service.faqs || [
    {
      q: `Does AV Live provide ${service.title} in Lahore, Karachi, and Islamabad?`,
      a: `Yes, AV Live Communications provides nationwide ${service.title}, Corporate event management, hybrid event broadcasting, 3D Hologram Display stages, and Video Conference in Pakistan (Polycom Group 500 & Poly X70) across Lahore, Karachi, and Islamabad.`
    }
  ];

  const serviceSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${canonicalUrl}#service`,
        "name": service.title,
        "serviceType": service.serviceType || service.category || "Corporate event management & AV Integration",
        "provider": {
          "@id": "https://avlive.com.pk/#organization"
        },
        "areaServed": ["Lahore", "Karachi", "Islamabad", "Pakistan"],
        "description": service.description?.replace(/<[^>]*>?/gm, ''),
        "url": canonicalUrl
      },
      {
        "@type": "FAQPage",
        "@id": `${canonicalUrl}#faq`,
        "mainEntity": serviceFaqs.map(f => ({
          "@type": "Question",
          "name": f.q,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": f.a
          }
        }))
      }
    ]
  };

  return (
    <div className="flex-1 w-full bg-[#f8f9fa] pb-16 overflow-hidden">
      <SEO 
        title={`${service.title} | AV Live Communications Pakistan`}
        description={service.description?.replace(/<[^>]*>?/gm, '').substring(0, 160) || `Professional ${service.title} enterprise deployment and support by AV Live Communications.`}
        keywords={service.keywords || `${service.title}, Corporate event management, Event management, hybrid event, Hologram Display, events, Video Conference in Pakistan, Video conference, Polycom Group 500, Poly X70`}
        image={service.imageUrl || 'https://avlive.com.pk/og-image.jpg'}
        imageAlt={`${service.title} - AV Live Communications`}
        url={canonicalUrl}
        type="website"
        schema={serviceSchema}
      />
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Breadcrumbs items={[{ label: 'Services', path: '/services' }, { label: service.title }]} />
      </div>
      {/* Hero Section */}
      <div className="bg-[#1A2B4C] text-white py-24 relative overflow-hidden">
        {service.imageUrl && (
           <div className="absolute inset-0 z-0">
             <img fetchPriority="high" src={service.imageUrl} alt={service.title} className="w-full h-full object-cover mix-blend-overlay opacity-30" />
           </div>
        )}
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full overflow-hidden">
          <Link to="/services" className="text-[#00B4D8] font-bold text-sm uppercase tracking-widest hover:text-white transition-colors mb-6 inline-block">← Back to Services</Link>
          <h1 className="text-4xl md:text-6xl font-black mb-6 max-w-4xl tracking-tight leading-none break-words">{service.title}</h1>
          <div className="text-xl md:text-2xl text-white max-w-4xl leading-relaxed font-medium prose prose-invert max-w-none break-words [&_*]:break-words [&_*]:whitespace-normal" dangerouslySetInnerHTML={{ __html: formatContent(service.description || '') }} />
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-16 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-16 w-full overflow-hidden">
        {/* Content */}
        <div className="w-full min-w-0 space-y-12">
          <div className="bg-white rounded-[3rem] p-6 sm:p-12 border border-gray-100 shadow-sm w-full overflow-hidden">
            {service.detailedContent ? (
               <div className="prose prose-lg max-w-none break-words prose-headings:font-black prose-headings:text-[#1A2B4C] prose-a:text-[#00B4D8] prose-img:rounded-3xl prose-p:text-gray-600 prose-p:leading-relaxed prose-strong:text-[#1A2B4C] marker:text-[#00B4D8] [&_*]:break-words" dangerouslySetInnerHTML={{ __html: formatContent(service.detailedContent) }} />
            ) : (
               <div className="text-center py-20 text-gray-400">
                  <Info className="mx-auto mb-4 opacity-50" size={48} />
                  <p className="font-bold text-lg">Detailed content coming soon.</p>
                  <p className="text-sm uppercase tracking-widest mt-2">Check back later for more information about {service.title}.</p>
               </div>
            )}
          </div>

          {serviceFaqs.length > 0 && (
            <div className="bg-white rounded-[3rem] p-6 sm:p-12 border border-gray-100 shadow-sm">
              <h2 className="text-2xl font-black text-[#1A2B4C] mb-6">Frequently Asked Questions ({service.title})</h2>
              <div className="space-y-4">
                {serviceFaqs.map((faq, i) => (
                  <div key={i} className="p-6 rounded-2xl bg-[#f8f9fa] border border-gray-100">
                    <h3 className="font-bold text-[#1A2B4C] mb-2">{faq.q}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed font-medium">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <div className="bg-[#1A2B4C] p-10 rounded-[3rem] shadow-xl text-center flex flex-col items-center justify-center relative overflow-hidden">
            <div className="relative z-10 w-full">
               <h2 className="text-3xl font-black text-white mb-4 leading-tight">Ready to Get Started?</h2>
               <p className="text-blue-100 mb-8 text-sm leading-relaxed font-medium">
                 Use our deep query estimator to plan your event and get an instant cost breakdown, or consult with our experts.
               </p>
               <div className="space-y-4 w-full">
                 <button 
                   onClick={() => {
                     setModalTitle("Get a Quick Quote");
                     setIsQuoteModalOpen(true);
                   }}
                   className="bg-[#00B4D8] hover:bg-[#0096B4] text-white px-8 py-4 rounded-full font-black text-[10px] uppercase tracking-widest transition-all shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2 w-full cursor-pointer"
                 >
                   Quick Quote <ArrowRight size={16} />
                 </button>
                 <button 
                   onClick={() => {
                     setModalTitle("Connect with our Consultant");
                     setIsQuoteModalOpen(true);
                   }}
                   className="bg-transparent hover:bg-white/10 text-white border border-white/30 px-8 py-4 rounded-full font-black text-[10px] uppercase tracking-widest transition-all hover:-translate-y-1 flex items-center justify-center gap-2 w-full cursor-pointer"
                 >
                   Connect with our Consultant
                 </button>
               </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#00B4D8]/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          </div>
        </div>
      </div>

      <DeepQueryModal 
        isOpen={isQuoteModalOpen} 
        onClose={() => setIsQuoteModalOpen(false)} 
        title={modalTitle}
        initialEventType={(() => {
          if (!serviceSlug) return 'esports';
          const s = serviceSlug.toLowerCase();
          if (s.includes('esports') || s.includes('gaming')) return 'esports';
          if (s.includes('corporate') || s.includes('conference')) return 'corporate';
          if (s.includes('hybrid') || s.includes('stream')) return 'hybrid';
          if (s.includes('expo') || s.includes('trade')) return 'expo';
          if (s.includes('ai-') || s.includes('automation')) return 'ai_service';
          return 'esports';
        })()}
      />
    </div>
  );
}
