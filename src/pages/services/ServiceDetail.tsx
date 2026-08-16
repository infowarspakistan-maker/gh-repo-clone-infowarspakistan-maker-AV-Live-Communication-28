import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Loader2, Info } from 'lucide-react';
import { getAllServices, Service } from '../../lib/firebase/firestore-helpers';
import { DeepQueryModal } from '../../components/DeepQueryModal';
import { SEO } from '../../components/SEO';

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
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('Consult with our AV Expert');

  useEffect(() => {
    const fetchService = async () => {
      const allServices = await getAllServices();
      const found = allServices.find(s => s.slug === serviceSlug);
      if (found) {
        setService(found);
      } else {
        // Option to navigate to 404 or services page
        navigate('/services');
      }
      setLoading(false);
    };
    fetchService();
  }, [serviceSlug, navigate]);

  if (loading) {
    return (
      <div className="flex-1 min-h-screen flex items-center justify-center bg-[#f8f9fa]">
        <Loader2 className="animate-spin text-[#00B4D8]" size={40} />
      </div>
    );
  }

  if (!service) return null;

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": service.title,
    "provider": {
      "@type": "LocalBusiness",
      "name": "AV Live Communications"
    },
    "description": service.description?.replace(/<[^>]*>?/gm, ''),
    "url": `https://avlive.com.pk/services/${service.slug || service.id}`
  };

  return (
    <div className="flex-1 w-full bg-[#f8f9fa] pb-16 overflow-hidden">
      <SEO 
        title={`${service.title} | AV Live Communications`}
        description={service.description?.replace(/<[^>]*>?/gm, '').substring(0, 160) || `Learn about ${service.title} services provided by AV Live.`}
        image={service.imageUrl || 'https://avlive.com.pk/og-image.jpg'}
        schema={serviceSchema}
      />
      {/* Hero Section */}
      <div className="bg-[#1A2B4C] text-white py-24 relative overflow-hidden">
        {service.imageUrl && (
           <div className="absolute inset-0 z-0">
             <img loading="lazy" src={service.imageUrl} alt={service.title} className="w-full h-full object-cover mix-blend-overlay opacity-30" />
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
        <div className="w-full min-w-0">
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
