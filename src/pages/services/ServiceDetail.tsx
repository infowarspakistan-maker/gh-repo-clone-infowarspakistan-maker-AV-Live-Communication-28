import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowRight, Loader2, Info, Phone, ShieldCheck, Clock, Award, MapPin, CheckCircle2, Sparkles } from 'lucide-react';
import { getAllServices } from '../../lib/firebase/firestore-helpers';
import { FALLBACK_SERVICES_CATALOG, mergeWithFallbackServices, EnrichedService } from '../../lib/services-catalog';
import { optimizeGalleryImageUrl } from '../../lib/image-optimize';
import { DeepQueryModal } from '../../components/DeepQueryModal';
import { SEO } from '../../components/SEO';
import { Breadcrumbs } from '../../components/Breadcrumbs';

const SERVICE_SLUG_ALIASES: Record<string, string> = {
  'video-conferencing-solutions': 'boardroom-integration',
  'corporate-event-management': 'corporate-events',
};

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
  const resolvedSlug = SERVICE_SLUG_ALIASES[serviceSlug || ''] || serviceSlug;
  const initialFallback = FALLBACK_SERVICES_CATALOG.find(s => s.slug === resolvedSlug) || null;
  const [service, setService] = useState<EnrichedService | null>(initialFallback);
  const [loading, setLoading] = useState(!initialFallback);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('Request a 15-Minute Quote');
  const [footerFormSubmitted, setFooterFormSubmitted] = useState(false);
  const [footerForm, setFooterForm] = useState({ name: '', company: '', phone: '', city: 'Lahore', requirement: '' });

  useEffect(() => {
    const targetSlug = SERVICE_SLUG_ALIASES[serviceSlug || ''] || serviceSlug;
    const matchedFallback = FALLBACK_SERVICES_CATALOG.find(s => s.slug === targetSlug) || null;
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
        const found = merged.find(s => s.slug === targetSlug || s.id === targetSlug) || null;
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
      {/* 1. Localized Hero Section with Direct 15-Minute Quote CTA */}
      <div className="bg-[#1A2B4C] text-white py-20 md:py-24 relative overflow-hidden">
        {service.imageUrl && (
           <div className="absolute inset-0 z-0">
             <img
               fetchPriority="high"
               decoding="async"
               width={1400}
               height={600}
               src={optimizeGalleryImageUrl(service.imageUrl, 1400, 80)}
               alt={service.localizedH1 || service.title}
               className="w-full h-full object-cover mix-blend-overlay opacity-30"
             />
           </div>
        )}
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full overflow-hidden">
          <Link to="/services" className="text-[#00B4D8] font-bold text-sm uppercase tracking-widest hover:text-white transition-colors mb-4 inline-block">← Back to All Services</Link>
          <div className="inline-flex items-center gap-2 bg-[#00B4D8]/15 border border-[#00B4D8]/30 text-[#00B4D8] px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest mb-5 block w-fit">
            <Sparkles size={14} />
            <span>Lahore (Johar Town &amp; DHA) • Karachi (Clifton) • Islamabad (Blue Area)</span>
          </div>
          <h1 className="text-3xl md:text-6xl font-black mb-6 max-w-4xl tracking-tight leading-tight break-words">
            {service.localizedH1 || service.title}
          </h1>
          <div className="text-lg md:text-2xl text-gray-200 max-w-4xl leading-relaxed font-medium prose prose-invert max-w-none break-words [&_*]:break-words [&_*]:whitespace-normal mb-8" dangerouslySetInnerHTML={{ __html: formatContent(service.description || '') }} />
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => {
                setModalTitle('Request a 15-Minute Quote');
                setIsQuoteModalOpen(true);
              }}
              className="bg-[#00B4D8] hover:bg-[#0096B4] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl flex items-center gap-3 cursor-pointer"
            >
              <span>Request a 15-Minute Quote</span>
              <ArrowRight size={18} />
            </button>
            <a
              href="tel:+923214256263"
              className="bg-white/10 hover:bg-white/20 text-white border border-white/25 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2"
            >
              <Phone size={16} className="text-[#00B4D8]" />
              <span>0321 425 6263</span>
            </a>
            <a
              href="tel:+923390000921"
              className="bg-white/10 hover:bg-white/20 text-white border border-white/25 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2"
            >
              <Phone size={16} className="text-[#F26522]" />
              <span>0339 0000 921</span>
            </a>
          </div>
        </div>
      </div>

      {/* 2. Trust & Authority Bar (Partner Hardware Logos + Certified Engineering Team) */}
      <div className="bg-white border-b border-gray-200 py-6 px-4 shadow-sm">
        <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00B4D8]/10 text-[#00B4D8] flex items-center justify-center shrink-0">
              <Award size={22} />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#00B4D8] block">Certified Pro-AV Engineering Team</span>
              <span className="text-sm font-black text-[#1A2B4C]">Official Deployment Partner Across Pakistan</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {[
              { name: 'Cisco', link: '/brands/cisco', tag: 'Room Kits & CUCM' },
              { name: 'HP Poly', link: '/brands/poly', tag: 'Group 500 & Studio X' },
              { name: 'Yealink', link: '/brands/yealink', tag: 'MTR & SIP Phones' },
              { name: 'Logitech', link: '/brands/logitech', tag: 'Rally Bar & Tap' },
              { name: 'Horion', link: '/category/video-conferencing', tag: '4K Interactive Flat Panels' },
              { name: 'Grandstream', link: '/brands/grandstream', tag: 'UCM IP-PBX & VoIP' },
            ].map((partner) => (
              <Link
                key={partner.name}
                to={partner.link}
                className="px-4 py-2 rounded-xl bg-[#F8F9FA] hover:bg-[#1A2B4C] text-[#1A2B4C] hover:text-white border border-gray-200 transition-all text-center group"
              >
                <span className="block text-xs font-black tracking-wider uppercase">{partner.name}</span>
                <span className="block text-[9px] text-gray-500 group-hover:text-[#00B4D8] font-bold">{partner.tag}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-12 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 w-full overflow-hidden">
        {/* Content */}
        <div className="w-full min-w-0 space-y-12">
          <div className="bg-white rounded-[3rem] p-6 sm:p-12 border border-gray-100 shadow-sm w-full overflow-hidden">
            {/* Answer-First Turnkey Engineering Summary */}
            <div className="bg-[#1A2B4C]/5 border-l-4 border-[#00B4D8] rounded-2xl p-6 mb-8">
              <span className="block text-[11px] font-black uppercase tracking-widest text-[#00B4D8] mb-2">
                Answer-First Service Overview
              </span>
              <p className="text-sm sm:text-base font-bold text-[#1A2B4C] leading-relaxed">
                <strong>{service.title}</strong> by AV Live Communications delivers turnkey engineering, certified hardware staging, and on-site execution across <strong>Lahore, Karachi, Islamabad, and nationwide Pakistan</strong>—backed by a 15-minute consultation SLA, 24-hour custom Bill of Materials (BoM) proposals, and official FBR GST/NTN compliance.
              </p>
            </div>

            {/* Semantic HTML Service Architecture & SLA Matrix */}
            <div className="mb-10 overflow-x-auto rounded-2xl border border-gray-200">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <caption className="bg-[#1A2B4C] text-white font-black text-left px-5 py-3 text-xs uppercase tracking-wider">
                  {service.title} — Turnkey Deliverables &amp; SLA Specifications
                </caption>
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-[#1A2B4C] font-black uppercase text-[11px] tracking-wider">
                    <th className="py-3 px-4">Deployment Dimension</th>
                    <th className="py-3 px-4">AV Live Enterprise Standard</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="py-3 px-4 font-black text-[#1A2B4C]">Service Classification</td>
                    <td className="py-3 px-4 font-medium text-gray-600">{service.serviceType || service.category || 'Turnkey Pro-AV & Event Production'}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-black text-[#1A2B4C]">Primary Regional Hubs</td>
                    <td className="py-3 px-4 font-medium text-gray-600">Lahore (Johar Town), Karachi (Clifton), Islamabad (Blue Area) &amp; Nationwide</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-black text-[#1A2B4C]">Core Hardware Ecosystem</td>
                    <td className="py-3 px-4 font-medium text-gray-600">HP Poly (Polycom Group 500 &amp; Studio X72), Logitech Rally, Cisco, Bosch, P2.5 SMD LED &amp; 3D Hologram</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-black text-[#1A2B4C]">Quotation &amp; Support SLA</td>
                    <td className="py-3 px-4 font-bold text-emerald-600">15-Min Engineering Response • 24-Hr Custom BoQ • FBR Tax Invoice</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Semantic HTML SLA & Reference PKR Investment Tiers Table */}
            {service.pricingTiers && service.pricingTiers.length > 0 && (
              <div className="mb-10 overflow-x-auto rounded-2xl border border-gray-200">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <caption className="bg-[#00B4D8] text-white font-black text-left px-5 py-3 text-xs uppercase tracking-wider">
                    {service.title} — Reference Packages, SLA &amp; PKR Investment Matrix (2026)
                  </caption>
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-[#1A2B4C] font-black uppercase text-[11px] tracking-wider">
                      <th className="py-3 px-4">Deployment Tier</th>
                      <th className="py-3 px-4">Scope &amp; Hardware Stack</th>
                      <th className="py-3 px-4">Turnaround &amp; SLA</th>
                      <th className="py-3 px-4">Reference PKR Investment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {service.pricingTiers.map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/70 transition-colors">
                        <td className="py-3 px-4 font-black text-[#1A2B4C]">{row.tier}</td>
                        <td className="py-3 px-4 font-medium text-gray-600">{row.capacityOrScope}</td>
                        <td className="py-3 px-4 font-bold text-emerald-600">{row.slaAndTurnaround}</td>
                        <td className="py-3 px-4 font-black text-[#00B4D8] whitespace-nowrap">{row.referenceInvestment}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {service.detailedContent ? (
               <div className="prose prose-lg max-w-none break-words prose-headings:font-black prose-headings:text-[#1A2B4C] prose-a:text-[#00B4D8] prose-img:rounded-3xl prose-p:text-gray-600 prose-p:leading-relaxed prose-strong:text-[#1A2B4C] marker:text-[#00B4D8] [&_*]:break-words" dangerouslySetInnerHTML={{ __html: formatContent(service.detailedContent) }} />
            ) : (
               <div className="text-center py-20 text-gray-400">
                  <Info className="mx-auto mb-4 opacity-50" size={48} />
                  <p className="font-bold text-lg">Detailed content coming soon.</p>
                  <p className="text-sm uppercase tracking-widest mt-2">Check back later for more information about {service.title}.</p>
               </div>
            )}

            <div className="mt-10 pt-8 border-t border-gray-100 flex flex-wrap gap-3">
              <Link to="/category/video-conferencing" className="text-xs font-bold text-[#1A2B4C] hover:text-[#00B4D8] bg-gray-50 px-4 py-2 rounded-full border border-gray-200 transition-colors">
                Explore Video Conferencing Hardware →
              </Link>
              <Link to="/blog/boardroom-av-system-price-guide-pakistan" className="text-xs font-bold text-[#1A2B4C] hover:text-[#00B4D8] bg-gray-50 px-4 py-2 rounded-full border border-gray-200 transition-colors">
                Boardroom BoM &amp; PKR Price Guide →
              </Link>
              <Link to="/blog/hybrid-events-101-av-integration-pakistan" className="text-xs font-bold text-[#1A2B4C] hover:text-[#00B4D8] bg-gray-50 px-4 py-2 rounded-full border border-gray-200 transition-colors">
                Hybrid Event Production Guide →
              </Link>
            </div>
          </div>

          {/* 3. The "AV Live" Advantage Block */}
          <div className="bg-[#1A2B4C] text-white rounded-[3rem] p-6 sm:p-12 shadow-xl">
            <span className="text-[#00B4D8] text-[11px] font-black uppercase tracking-[0.3em] block mb-2">Operational Excellence</span>
            <h2 className="text-2xl sm:text-3xl font-black mb-8">The &ldquo;AV Live&rdquo; Advantage</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <Clock className="text-[#00B4D8] mb-3" size={28} />
                <h3 className="font-black text-base mb-2">15-Minute Technical SLA</h3>
                <p className="text-xs text-gray-300 leading-relaxed font-medium">
                  Guaranteed 15-minute engineering response on WhatsApp and hotline for rapid quotation, acoustic room sizing, and live triage.
                </p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <ShieldCheck className="text-[#00B4D8] mb-3" size={28} />
                <h3 className="font-black text-base mb-2">Zero-Downtime Guarantee</h3>
                <p className="text-xs text-gray-300 leading-relaxed font-medium">
                  Redundant SDI/NDI signal paths, hot-swap codecs (Poly, Cisco, Logitech), and bonded multi-ISP streaming for mission-critical sessions.
                </p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <Award className="text-[#00B4D8] mb-3" size={28} />
                <h3 className="font-black text-base mb-2">On-Site Standby Engineers</h3>
                <p className="text-xs text-gray-300 leading-relaxed font-medium">
                  Dedicated certified AV &amp; broadcast engineers stationed on-site across Lahore, Karachi, and Islamabad for zero-stress execution.
                </p>
              </div>
            </div>
          </div>

          {/* 4. Service Breakdown */}
          <div className="bg-white rounded-[3rem] p-6 sm:p-12 border border-gray-100 shadow-sm">
            <span className="text-[#00B4D8] text-[11px] font-black uppercase tracking-[0.3em] block mb-2">Core Capabilities</span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#1A2B4C] mb-6">Turnkey Service Breakdown</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(service.offeringsBreakdown || [
                {
                  title: 'Boardroom & Huddle Room Kits',
                  detail: 'Polycom video conferencing distributors Lahore & Cisco Room Kit installation Karachi with acoustic ceiling/table microphone arrays.'
                },
                {
                  title: 'Interactive Flat Panels & Displays',
                  detail: 'Interactive flat panel displays for business Lahore (Horion 4K smart boards) and fine-pitch SMD LED screen rental for corporate events.'
                },
                {
                  title: 'Hybrid Broadcast & 3D Hologram Stages',
                  detail: 'Corporate hybrid event live streaming Lahore, 3D hologram display stages Pakistan, and multi-camera event broadcasting Karachi.'
                }
              ]).map((item, idx) => (
                <div key={idx} className="p-6 rounded-2xl bg-[#F8F9FA] border border-gray-200 flex flex-col">
                  <div className="w-10 h-10 rounded-xl bg-[#00B4D8]/10 text-[#00B4D8] flex items-center justify-center mb-4">
                    <CheckCircle2 size={20} />
                  </div>
                  <h3 className="font-black text-[#1A2B4C] text-base mb-2">{item.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed font-medium">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Localized Proof (Case Studies in Johar Town, DHA, Clifton & Blue Area) */}
          <div className="bg-white rounded-[3rem] p-6 sm:p-12 border border-gray-100 shadow-sm">
            <span className="text-[#00B4D8] text-[11px] font-black uppercase tracking-[0.3em] block mb-2">Verified Regional Deployments</span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#1A2B4C] mb-6">
              Localized Proof: Recent Installations in Johar Town, DHA, Clifton &amp; Blue Area
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(service.caseStudies || [
                {
                  hub: 'Johar Town & DHA, Lahore',
                  project: 'Executive Boardroom & Interactive Flat Panel Integration',
                  outcome: 'Deployed Poly Studio X72, 86" Horion interactive flat panel display, and expansion microphones with 15-minute SLA coverage.'
                },
                {
                  hub: 'Clifton & Shahrah-e-Faisal, Karachi',
                  project: 'Cisco Room Kit Installation & Multi-Camera Hybrid Townhall',
                  outcome: 'Commissioned Cisco Room Kit Plus boardroom endpoints and 4-camera SDI hybrid event broadcasting for 600+ participants.'
                },
                {
                  hub: 'Blue Area, Islamabad',
                  project: '30-Seat Council Boardroom & VoIP PBX Integration',
                  outcome: 'Integrated Polycom Group 500 12x PTZ optical system with Bosch digital conference mics and Grandstream UCM6308 IP PBX.'
                }
              ]).map((cs, idx) => (
                <div key={idx} className="p-6 rounded-2xl border border-gray-200 bg-white hover:border-[#00B4D8] transition-all">
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#00B4D8] bg-[#00B4D8]/10 px-3 py-1 rounded-full mb-3">
                    <MapPin size={12} />
                    <span>{cs.hub}</span>
                  </div>
                  <h3 className="font-black text-[#1A2B4C] text-base mb-2">{cs.project}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed font-medium">{cs.outcome}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 6. FAQ & Schema Markup Section */}
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

          {/* 7. Clear Contact Footer with Dual Hotlines (0321 425 6263 & 0339 0000 921) & Integrated Form */}
          <div className="bg-white rounded-[3rem] p-6 sm:p-12 border-2 border-[#00B4D8]/30 shadow-lg">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
              <div>
                <span className="text-[#00B4D8] text-[11px] font-black uppercase tracking-[0.3em] block mb-2">Direct Engineering Desk</span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#1A2B4C] mb-4">
                  Request a 15-Minute Quote or Site Survey
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed font-medium mb-6">
                  Speak directly with our certified Pro-AV and event staging engineers in Lahore (Johar Town), Karachi (Clifton), and Islamabad (Blue Area).
                </p>
                <div className="space-y-4 mb-6">
                  <a href="tel:+923214256263" className="flex items-center gap-4 p-4 rounded-2xl bg-[#F8F9FA] border border-gray-200 hover:border-[#00B4D8] transition-all">
                    <div className="w-12 h-12 rounded-xl bg-[#00B4D8] text-white flex items-center justify-center shrink-0">
                      <Phone size={22} />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Primary Enterprise Hotline (15-Min SLA)</span>
                      <span className="text-xl font-black text-[#1A2B4C]">0321 425 6263</span>
                    </div>
                  </a>
                  <a href="tel:+923390000921" className="flex items-center gap-4 p-4 rounded-2xl bg-[#F8F9FA] border border-gray-200 hover:border-[#F26522] transition-all">
                    <div className="w-12 h-12 rounded-xl bg-[#F26522] text-white flex items-center justify-center shrink-0">
                      <Phone size={22} />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Corporate Events &amp; Staging Desk</span>
                      <span className="text-xl font-black text-[#1A2B4C]">0339 0000 921</span>
                    </div>
                  </a>
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setFooterFormSubmitted(true);
                }}
                className="bg-[#F8F9FA] p-6 sm:p-8 rounded-3xl border border-gray-200 space-y-4"
              >
                <h3 className="font-black text-lg text-[#1A2B4C]">Instant BoM &amp; Project Quote Form</h3>
                {footerFormSubmitted ? (
                  <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold">
                    Thank you! Your inquiry for {service.title} has been routed to our engineering desk. An AV specialist will contact you within 15 minutes, or call us now at 0321 425 6263 / 0339 0000 921.
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        required
                        placeholder="Your Full Name *"
                        value={footerForm.name}
                        onChange={(e) => setFooterForm({ ...footerForm, name: e.target.value })}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold text-[#1A2B4C] focus:outline-none focus:border-[#00B4D8]"
                      />
                      <input
                        type="text"
                        required
                        placeholder="Organization / Company *"
                        value={footerForm.company}
                        onChange={(e) => setFooterForm({ ...footerForm, company: e.target.value })}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold text-[#1A2B4C] focus:outline-none focus:border-[#00B4D8]"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="tel"
                        required
                        placeholder="Phone / WhatsApp Number *"
                        value={footerForm.phone}
                        onChange={(e) => setFooterForm({ ...footerForm, phone: e.target.value })}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold text-[#1A2B4C] focus:outline-none focus:border-[#00B4D8]"
                      />
                      <select
                        value={footerForm.city}
                        onChange={(e) => setFooterForm({ ...footerForm, city: e.target.value })}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold text-[#1A2B4C] focus:outline-none focus:border-[#00B4D8]"
                      >
                        <option value="Lahore">Lahore (Johar Town / DHA / Gulberg)</option>
                        <option value="Karachi">Karachi (Clifton / Shahrah-e-Faisal)</option>
                        <option value="Islamabad">Islamabad / Rawalpindi (Blue Area)</option>
                        <option value="Other">Other City in Pakistan</option>
                      </select>
                    </div>
                    <textarea
                      rows={3}
                      placeholder="Room capacity, hardware model (Poly / Cisco / Yealink / Horion), or event dates..."
                      value={footerForm.requirement}
                      onChange={(e) => setFooterForm({ ...footerForm, requirement: e.target.value })}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold text-[#1A2B4C] focus:outline-none focus:border-[#00B4D8]"
                    />
                    <button
                      type="submit"
                      className="w-full bg-[#1A2B4C] hover:bg-[#00B4D8] text-white font-black py-4 rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer"
                    >
                      Submit 15-Minute Quote Request
                    </button>
                  </>
                )}
              </form>
            </div>
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
