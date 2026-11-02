import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Phone, Video, Headphones, ShieldCheck, Box, Mic, Sparkles, Projector, Heart } from 'lucide-react';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { 
  Product, Service,
  HomepageData, GeneralSettings, ContactData, getGeneralSettings, getContactData, 
  subscribeToHomepage, 
  subscribeToProducts,
  subscribeToServices,
  deduplicateProducts
} from '../lib/firebase/firestore-helpers';
import { SEO } from '../components/SEO';
import { optimizeGalleryImageUrl } from '../lib/image-optimize';

import { FALLBACK_SERVICES_CATALOG } from "../lib/services-catalog";
import { getCanonicalProductSlug, PRODUCT_GMC_METADATA, buildFallbackProductFromGmcMeta } from "../lib/gmc-feed";

const TopBrands = React.lazy(() => import('../components/TopBrands').then(m => ({ default: m.TopBrands })));

const DEFAULT_HERO_SLIDES = [
  {
    id: 'slide-1',
    title: 'Video Conference in Pakistan | Corporate Event Management | AV Live',
    subtitle: 'Pakistan’s premier Video Conference in Pakistan & Corporate Event Management company — Poly X70, Cisco Room Kit & 3D Hologram Display with official price PKR warranty.',
    ctaText: 'Explore Catalog',
    ctaLink: '/shop',
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1280&q=75',
    mediaType: 'image' as const,
    isActive: true,
    order: 1,
    textAlignment: 'left' as const,
    overlayOpacity: 30,
  },
  {
    id: 'slide-2',
    title: 'Immersive AV for Events',
    subtitle: 'From Corporate Expos & 3D Hologram Displays to Hybrid Event Broadcasts.',
    ctaText: 'Plan Your Event',
    ctaLink: '/services/corporate-events',
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1280&q=75',
    mediaType: 'image' as const,
    isActive: true,
    order: 2,
    textAlignment: 'left' as const,
    overlayOpacity: 35,
  },
  {
    id: 'slide-3',
    title: 'AI Automation for Business',
    subtitle: 'Deploy Autonomous AI Agents & Digital Workers Across Your Enterprise.',
    ctaText: 'Learn More',
    ctaLink: '/services/ai-development',
    imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1280&q=75',
    mediaType: 'image' as const,
    isActive: true,
    order: 3,
    textAlignment: 'left' as const,
    overlayOpacity: 40,
  },
];

const DEFAULT_HOMEPAGE_DATA: HomepageData = {
  heroSlides: DEFAULT_HERO_SLIDES,
  brands: [],
  testimonials: [],
  stats: {
    yearsExperience: 15,
    happyClients: 100,
    projectsCompleted: 5000,
  },
  promoBanner: {
    headline: 'Ready to Upgrade Your AV?',
    subheadline: 'Get a free consultation from our experts today.',
    ctaText: 'Contact Us',
    ctaLink: '/contact',
    backgroundImageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1280&q=75',
    isActive: true,
  },
};

const DEFAULT_INITIAL_PRODUCTS: Product[] = deduplicateProducts(
  Object.keys(PRODUCT_GMC_METADATA)
    .map((slug) => buildFallbackProductFromGmcMeta(slug))
    .filter((p): p is Product => Boolean(p))
);

function buildHeroSrcSet(rawUrl: string): string | undefined {
  if (!rawUrl || !rawUrl.includes('images.unsplash.com')) return undefined;
  const base = rawUrl.split('?')[0];
  return `${base}?auto=format&fit=crop&w=640&q=70 640w, ${base}?auto=format&fit=crop&w=1024&q=75 1024w, ${base}?auto=format&fit=crop&w=1600&q=75 1600w`;
}

export function Home() {
  const [content, setContent] = useState<HomepageData>(DEFAULT_HOMEPAGE_DATA);
  const [settings, setSettings] = useState<GeneralSettings | null>(null);
  const [contact, setContact] = useState<ContactData | null>(null);
  const [products, setProducts] = useState<Product[]>(DEFAULT_INITIAL_PRODUCTS);
  const [services, setServices] = useState<Service[]>(FALLBACK_SERVICES_CATALOG as unknown as Service[]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoplayPaused, setIsAutoplayPaused] = useState(false);
  const [activeIntentTab, setActiveIntentTab] = useState<'solutions' | 'shop'>('solutions');
  const [activeFilter, setActiveFilter] = useState('All');
  const [hoveredProductId, setHoveredProductId] = useState<string | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  const nextSlide = useCallback(() => {
    if (content?.heroSlides && content.heroSlides.length > 0) {
      setCurrentSlide((prev) => (prev + 1) % content.heroSlides.length);
    }
  }, [content]);

  const prevSlide = useCallback(() => {
    if (content?.heroSlides && content.heroSlides.length > 0) {
      setCurrentSlide((prev) => (prev - 1 + content.heroSlides.length) % content.heroSlides.length);
    }
  }, [content]);

  useEffect(() => {
    if (isAutoplayPaused) return;
    const timer = setInterval(nextSlide, 8000);
    return () => clearInterval(timer);
  }, [nextSlide, isAutoplayPaused]);

  useEffect(() => {
    let unsubscribeHome: (() => void) | undefined;
    let unsubscribeProducts: (() => void) | undefined;
    let unsubscribeServices: (() => void) | undefined;

    // Defer Firestore network subscriptions off the main thread so initial taps/clicks (INP) respond in <30ms
    const timer = setTimeout(() => {
      getGeneralSettings().then(setSettings).catch(console.error);
      getContactData().then(setContact).catch(console.error);
      unsubscribeHome = subscribeToHomepage((data) => {
        if (data && data.heroSlides && data.heroSlides.length > 0) {
          setContent(data);
        }
      });

      unsubscribeProducts = subscribeToProducts((data) => {
        if (data && data.length > 0) {
          setProducts(data);
        }
      }, { isActive: true });

      unsubscribeServices = subscribeToServices((data) => {
        if (data && data.length > 0) {
          setServices(data);
        }
      });
    }, 1800);

    return () => {
      clearTimeout(timer);
      if (unsubscribeHome) unsubscribeHome();
      if (unsubscribeProducts) unsubscribeProducts();
      if (unsubscribeServices) unsubscribeServices();
    };
  }, []);

  const CATEGORIES = [
    { name: "Video Conferencing", icon: Video, link: "/category/video-conferencing", id: "video-conferencing" },
    { name: "Boardroom Codecs", icon: Video, link: "/category/boardroom-codecs", id: "boardroom-codecs" },
    { name: "Large Room AV", icon: Video, link: "/category/large-room", id: "large-room" },
    { name: "PTZ Cameras", icon: Video, link: "/category/ptz-cameras", id: "ptz-cameras" },
    { name: "Touch Panels", icon: Box, link: "/category/touch-panels", id: "touch-panels" },
    { name: "Speakerphones", icon: Mic, link: "/category/speakerphones", id: "speakerphones" },
    { name: "IP Phones", icon: Phone, link: "/category/ip-phones", id: "ip-phones" },
    { name: "VoIP Phone Systems", icon: Box, link: "/category/voip-phone-systems", id: "voip-phone-systems" },
    { name: "Headsets", icon: Headphones, link: "/category/headsets", id: "headsets" },
    { name: "Projectors", icon: Projector, link: "/category/projectors", id: "projectors" },
    { name: "IP Cameras", icon: ShieldCheck, link: "/category/ip-cameras", id: "ip-cameras" },
    { name: "Intercom & Paging", icon: Mic, link: "/category/intercom-paging-access", id: "intercom-paging-access" }
  ];

  const scrollSlider = useCallback((direction: 'left' | 'right') => {
    const el = sliderRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      const { scrollLeft, clientWidth, scrollWidth } = el;
      if (scrollWidth <= clientWidth) return;
      const scrollAmount = direction === 'left' ? -(clientWidth * 0.8) : (clientWidth * 0.8);
      let newScroll = scrollLeft + scrollAmount;
      if (direction === 'right' && scrollLeft + clientWidth >= scrollWidth - 10) {
        newScroll = 0;
      } else if (direction === 'left' && scrollLeft <= 10) {
        newScroll = scrollWidth;
      }
      el.scrollTo({ left: newScroll, behavior: 'smooth' });
    });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => scrollSlider('right'), 6000);
    return () => clearInterval(timer);
  }, [scrollSlider]);

  const filteredProducts = activeFilter === 'All' 
    ? products 
    : products.filter(p => {
        const checkValues = [
          activeFilter,
          `cat-${activeFilter}`,
          activeFilter.replace('-systems', '-phone-systems').replace('-paging', '-paging-access')
        ];
        return p.categoryIds?.some(id => checkValues.includes(id)) || 
               (Array.isArray(p.categorySlugs) ? p.categorySlugs : typeof p.categorySlugs === 'string' ? [p.categorySlugs] : []).some(slug => checkValues.includes(slug));
      });

  const featuredCarouselProducts = filteredProducts.slice(0, 8);

  const videoConferencingProducts = products.filter(p => p.categoryIds?.includes('cat-video') || (Array.isArray(p.categorySlugs) ? p.categorySlugs : typeof p.categorySlugs === 'string' ? [p.categorySlugs] : []).includes('video-conferencing'));
  const flagshipVideoSet = videoConferencingProducts.slice(0, 5);

  const slides = content?.heroSlides?.length ? content.heroSlides : DEFAULT_HERO_SLIDES;
  const activeHeroSlide = slides[currentSlide] || DEFAULT_HERO_SLIDES[0];

  return (
    <div className="flex-1 w-full bg-[#f8f9fa]">
      <SEO 
        title="Video Conference in Pakistan | Event Management | AV Live"
        description="Video Conference in Pakistan, Corporate Event Management by AV Live: Poly X70, Cisco Room Kit, 3D Hologram Display price PKR."
        url="https://avlive.com.pk"
        image={settings?.ogImage || "https://avlive.com.pk/og-image.jpg"}
        imageAlt="Video Conference in Pakistan | Event Management | AV Live"
        schema={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": "https://avlive.com.pk/#organization",
              "name": settings?.siteName || "AV Live Communications",
              "legalName": "AV Live Communications (Pvt) Ltd",
              "url": "https://avlive.com.pk",
              "logo": {
                "@type": "ImageObject",
                "url": "https://avlive.com.pk/apple-touch-icon.png",
                "width": 180,
                "height": 180
              },
              "image": "https://avlive.com.pk/og-image.jpg",
              "description": settings?.tagline || "Pakistan's premier enterprise Video Conference in Pakistan, Polycom Group 500, Poly X70, Cisco Room Kit, Corporate event management, and 3D Hologram Display provider.",
              "telephone": contact?.phone || settings?.phone || "+92-321-425-6263",
              "email": "info@avlive.com.pk",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": contact?.address || settings?.address || "Johar Town Block N",
                "addressLocality": "Lahore",
                "addressRegion": "Punjab",
                "postalCode": "54782",
                "addressCountry": "PK"
              },
              "sameAs": [
                "https://www.facebook.com/avlivepk",
                "https://www.instagram.com/avlivepk",
                "https://www.linkedin.com/company/avlivepk",
                "https://www.youtube.com/@avlivepk",
                "https://x.com/avlivepk",
                "https://twitter.com/avlivepk"
              ],
              "areaServed": [
                { "@type": "Country", "name": "Pakistan" },
                { "@type": "City", "name": "Lahore" },
                { "@type": "City", "name": "Karachi" },
                { "@type": "City", "name": "Islamabad" }
              ],
              "contactPoint": [
                {
                  "@type": "ContactPoint",
                  "telephone": contact?.phone || settings?.phone || "+92-321-425-6263",
                  "contactType": "sales & customer support",
                  "areaServed": "PK",
                  "availableLanguage": ["English", "Urdu"]
                }
              ]
            },
            {
              "@type": "WebSite",
              "@id": "https://avlive.com.pk/#website",
              "url": "https://avlive.com.pk",
              "name": settings?.siteName || "AV Live Communications",
              "description": settings?.tagline || "Pakistan's leading provider of professional AV solutions, IP phones, and video conferencing.",
              "publisher": {
                "@id": "https://avlive.com.pk/#organization"
              },
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://avlive.com.pk/shop?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            },
            {
              "@type": "LocalBusiness",
              "@id": "https://avlive.com.pk/#lahore-hq",
              "parentOrganization": { "@id": "https://avlive.com.pk/#organization" },
              "name": `${settings?.siteName || "AV Live Communications"} - Lahore Head Office`,
              "image": "https://avlive.com.pk/og-image.jpg",
              "telephone": contact?.phone || settings?.phone || "+92-321-425-6263",
              "priceRange": "PKR 45,000 - 15,000,000",
              "currenciesAccepted": "PKR",
              "paymentAccepted": "Bank Transfer, Pay Order, Corporate Cheque, Credit Card",
              "url": "https://avlive.com.pk",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": contact?.address || settings?.address || "Johar Town Block N",
                "addressLocality": "Lahore",
                "addressRegion": "Punjab",
                "postalCode": "54782",
                "addressCountry": "PK"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": 31.4584,
                "longitude": 74.2657
              },
              "openingHoursSpecification": [
                {
                  "@type": "OpeningHoursSpecification",
                  "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                  "opens": "09:00",
                  "closes": "18:00"
                },
                {
                  "@type": "OpeningHoursSpecification",
                  "dayOfWeek": ["Saturday"],
                  "opens": "10:00",
                  "closes": "16:00"
                }
              ]
            },
            {
              "@type": "LocalBusiness",
              "@id": "https://avlive.com.pk/#karachi-branch",
              "parentOrganization": { "@id": "https://avlive.com.pk/#organization" },
              "name": `${settings?.siteName || "AV Live Communications"} - Karachi Regional Office`,
              "image": "https://avlive.com.pk/og-image.jpg",
              "url": "https://avlive.com.pk/karachi",
              "telephone": "+92-21-35890123",
              "priceRange": "PKR 45,000 - 15,000,000",
              "currenciesAccepted": "PKR",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Sharah-e-Faisal, PECHS Block 6",
                "addressLocality": "Karachi",
                "addressRegion": "Sindh",
                "postalCode": "75400",
                "addressCountry": "PK"
              }
            },
            {
              "@type": "LocalBusiness",
              "@id": "https://avlive.com.pk/#islamabad-branch",
              "parentOrganization": { "@id": "https://avlive.com.pk/#organization" },
              "name": `${settings?.siteName || "AV Live Communications"} - Islamabad & Rawalpindi Office`,
              "image": "https://avlive.com.pk/og-image.jpg",
              "url": "https://avlive.com.pk/islamabad",
              "telephone": "+92-51-2890124",
              "priceRange": "PKR 45,000 - 15,000,000",
              "currenciesAccepted": "PKR",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Blue Area, Jinnah Avenue",
                "addressLocality": "Islamabad",
                "addressRegion": "ICT",
                "postalCode": "44000",
                "addressCountry": "PK"
              }
            },
            {
              "@type": "FAQPage",
              "@id": "https://avlive.com.pk/#faq",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "What is the best Video Conference in Pakistan solution for large boardrooms?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "For large corporate boardrooms in Pakistan, the Poly Studio X70 (Poly X70), Cisco Room Kit Plus, and Polycom RealPresence Group 500 are the industry standards with official price PKR warranty across Lahore, Karachi, and Islamabad."
                  }
                },
                {
                  "@type": "Question",
                  "name": "How does AV Live handle Corporate event management, hybrid events, and 3D Hologram Display production in Pakistan?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "AV Live provides turnkey Corporate event management and hybrid event production across Lahore, Karachi, and Islamabad, deploying 3D Hologram Display stages, architectural projection mapping, and P2.5 SMD LED video walls."
                  }
                }
              ]
            }
          ]
        }}
      />
      
      {/* Hero Slider (Zero-JS Animation Blocking for Instant LCP) */}
      <div 
        className="relative w-full h-[540px] md:h-[600px] overflow-hidden bg-[#1A2B4C] group/slider"
        onMouseEnter={() => setIsAutoplayPaused(true)}
        onMouseLeave={() => setIsAutoplayPaused(false)}
      >
        <div key={currentSlide} className="absolute inset-0 transition-opacity duration-300">
          <div className="absolute inset-0 w-full h-full">
            <div className="absolute inset-0 bg-gradient-to-r from-[#1A2B4C]/95 via-[#1A2B4C]/70 to-transparent z-10"></div>
            <img 
              loading={currentSlide === 0 ? "eager" : "lazy"}
              fetchPriority={currentSlide === 0 ? "high" : "auto"}
              decoding="async"
              width={1280}
              height={600}
              src={activeHeroSlide.imageUrl} 
              srcSet={buildHeroSrcSet(activeHeroSlide.imageUrl)}
              sizes="100vw"
              alt={activeHeroSlide.title} 
              className="absolute inset-0 w-full h-full object-cover" 
            />
          </div>

          <div className="absolute inset-0 z-20 flex flex-col items-start justify-center text-left px-6 md:px-20 max-w-[1400px] mx-auto">
             <div className="bg-[#00B4D8] px-4 py-1.5 rounded-lg shadow-lg mb-5 inline-flex items-center gap-2">
                <span className="font-black text-[#1A2B4C] uppercase tracking-widest text-[10px]">Enterprise AV &amp; Events Pakistan</span>
             </div>

             <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white mb-5 drop-shadow-2xl leading-tight max-w-3xl font-sans">
               {activeHeroSlide.title}
             </h1>

             <div 
               className="text-base sm:text-xl md:text-2xl text-white mb-8 max-w-2xl drop-shadow-md font-semibold leading-[1.6] prose prose-p:m-0 prose-invert" 
               dangerouslySetInnerHTML={{ __html: activeHeroSlide.subtitle || '' }} 
             />
             
             <div className="flex flex-wrap gap-4">
               <Link 
                to={activeHeroSlide.ctaLink || '/shop'} 
                className="bg-white text-[#1A2B4C] px-8 md:px-10 py-4 md:py-5 rounded-2xl font-black uppercase tracking-widest text-xs md:text-sm hover:bg-[#00B4D8] hover:text-[#1A2B4C] transition-colors shadow-2xl flex items-center gap-3 group"
               >
                 {activeHeroSlide.ctaText || 'Explore Now'}
                 <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
               </Link>
               <Link 
                to="/event-quote" 
                className="bg-[#00B4D8]/20 border border-[#00B4D8] text-white px-6 md:px-8 py-4 md:py-5 rounded-2xl font-black uppercase tracking-widest text-xs md:text-sm hover:bg-[#00B4D8] hover:text-[#1A2B4C] transition-colors flex items-center gap-2"
               >
                 15-Min Event / AV Quote
               </Link>
             </div>
          </div>
        </div>

        {/* Floating Arrows */}
        {slides.length > 1 && (
          <>
            <button 
              onClick={(e) => { e.stopPropagation(); prevSlide(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-4 rounded-2xl bg-[#1A2B4C]/40 hover:bg-[#00B4D8] border border-white/10 text-white transition-all shadow-lg backdrop-blur-sm opacity-0 group-hover/slider:opacity-100 -translate-x-4 group-hover/slider:translate-x-0 duration-300 flex items-center justify-center cursor-pointer"
              aria-label="Previous slide"
            >
              <ArrowLeft size={24} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); nextSlide(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-4 rounded-2xl bg-[#1A2B4C]/40 hover:bg-[#00B4D8] border border-white/10 text-white transition-all shadow-lg backdrop-blur-sm opacity-0 group-hover/slider:opacity-100 translate-x-4 group-hover/slider:translate-x-0 duration-300 flex items-center justify-center cursor-pointer"
              aria-label="Next slide"
            >
              <ArrowRight size={24} />
            </button>
          </>
        )}

        {/* Pagination Dots */}
        {slides.length > 1 && (
          <div className="absolute bottom-8 left-6 md:left-20 z-30 flex items-center gap-3">
            {slides.map((_: any, index: number) => {
              const isActive = index === currentSlide;
              return (
                <button 
                  key={index} 
                  onClick={() => setCurrentSlide(index)}
                  className="relative group/dot p-2 -m-2 cursor-pointer"
                  aria-label={`Go to slide ${index + 1}`}
                >
                  <div className={`h-2 w-10 rounded-full overflow-hidden relative border transition-colors duration-300 ${isActive ? 'bg-[#00B4D8] border-white/30' : 'bg-white/25 border-transparent hover:bg-white/40'}`} />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Category Icons */}
      <section aria-label="Enterprise AV & Unified Communications Categories" className="bg-white border border-gray-100 shadow-sm py-8 relative z-20 mx-auto">
        <div className="max-w-[1400px] mx-auto px-8 overflow-x-auto pb-2 hide-scrollbar">
          <h2 className="sr-only">Primary Enterprise AV &amp; Unified Communications Categories in Pakistan</h2>
          <div className="flex items-start justify-between min-w-max gap-10">
             {CATEGORIES.map((cat, i) => (
               <Link key={i} to={cat.link} className="flex flex-col items-center group w-28">
                 <div className="w-20 h-20 rounded-[2rem] bg-gray-50 flex items-center justify-center text-[#1A2B4C] group-hover:bg-[#1A2B4C] group-hover:text-white transition-all shadow-sm border border-gray-100 mb-3 group-hover:shadow-xl group-hover:-translate-y-1">
                   <cat.icon size={32} strokeWidth={1.5} />
                 </div>
                  <span className="text-[10px] font-black text-center leading-tight uppercase tracking-[0.2em] text-slate-600 group-hover:text-[#1A2B4C] transition-colors">{cat.name}</span>
               </Link>
             ))}
          </div>
        </div>
      </section>

      {/* Tabbed Intent Split */}
      <section className="w-full py-16 bg-white">
        <div className="max-w-[1200px] mx-auto px-6 md:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-[#00B4D8] text-xs font-black uppercase tracking-[0.3em] mb-2 block">Dual Commercial Pillars</span>
            <h2 className="text-3xl md:text-4xl font-black text-[#1A2B4C] tracking-tight">
              Turnkey Corporate Event Management, AI &amp; Pro-AV Solutions in Pakistan
            </h2>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <button 
              onClick={() => setActiveIntentTab('solutions')}
              className={`px-8 py-3 min-h-[44px] rounded-full font-black uppercase tracking-widest text-xs md:text-sm transition-all cursor-pointer ${activeIntentTab === 'solutions' ? 'bg-[#1A2B4C] text-white shadow-xl' : 'bg-gray-100 text-slate-700 hover:bg-gray-200'}`}
            >
              Event &amp; AI Solutions (9)
            </button>
            <button 
              onClick={() => setActiveIntentTab('shop')}
              className={`px-8 py-3 min-h-[44px] rounded-full font-black uppercase tracking-widest text-xs md:text-sm transition-all cursor-pointer ${activeIntentTab === 'shop' ? 'bg-[#1A2B4C] text-white shadow-xl' : 'bg-gray-100 text-slate-700 hover:bg-gray-200'}`}
            >
              Professional AV Shop
            </button>
          </div>

          <div className="min-h-[400px]">
            {activeIntentTab === 'solutions' ? (
              <div className="grid md:grid-cols-3 gap-8">
                {services.filter(s => s.isActive).slice(0, 9).map((s) => (
                  <div key={s.id} className="bg-gray-50 rounded-3xl p-8 border border-gray-100 hover:shadow-xl transition-all flex flex-col">
                    <img
                      loading="lazy"
                      decoding="async"
                      width={480}
                      height={240}
                      src={optimizeGalleryImageUrl(s.imageUrl, 480, 75)}
                      alt={`${s.title} — AV Live Pakistan`}
                      className="w-full h-48 object-cover rounded-2xl mb-6"
                    />
                    <h3 className="text-xl font-black text-[#1A2B4C] mb-3">{s.title}</h3>
                    <p className="text-gray-600 mb-6 line-clamp-3 text-sm flex-grow">{s.description.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ')}</p>
                    <Link to={`/services/${s.slug}`} className="text-[#00B4D8] hover:text-[#1A2B4C] font-bold text-sm flex items-center gap-2 mt-auto py-1">
                      Explore {s.title} <ArrowRight size={16} />
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-8">
                {products.filter(p => p.isFeatured).slice(0, 6).map((p) => (
                  <div key={p.id} className="bg-white rounded-3xl p-6 border border-gray-100 hover:shadow-xl transition-all flex flex-col">
                    <img
                      loading="lazy"
                      decoding="async"
                      width={480}
                      height={240}
                      src={optimizeGalleryImageUrl(p.images?.[0], 480, 75)}
                      alt={p.productName}
                      className="w-full h-48 object-cover rounded-2xl mb-6"
                    />
                    <h3 className="text-lg font-bold text-[#1A2B4C] mb-2">{p.productName}</h3>
                    <p className="text-xs text-slate-600 mb-4 line-clamp-2 flex-grow">{p.shortDescription}</p>
                    <Link to={`/product/${getCanonicalProductSlug(p, p.id)}`} className="text-[#00B4D8] font-bold text-sm mt-auto py-1">
                      View {p.productName} Price PKR →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-white py-12 border-t border-gray-100">
        <div className="max-w-[1400px] mx-auto px-6 md:px-8 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-[#00B4D8] text-xs font-black uppercase tracking-[0.3em] mb-2 block">Authorized Pakistan Stock &amp; Price PKR</span>
              <h2 className="text-3xl md:text-4xl font-black text-[#1A2B4C] tracking-tight">
                Featured Video Conference in Pakistan &amp; Enterprise AV Hardware
              </h2>
            </div>
            <Link to="/shop" className="text-xs font-black text-[#1A2B4C] uppercase tracking-[0.2em] hover:text-[#00B4D8] transition-colors flex items-center gap-2 py-2">
              View All 53 Models <ArrowRight size={16} />
            </Link>
          </div>
          
          {/* Smart Product Filter */}
          <div className="flex overflow-x-auto gap-3 pb-4 mb-10 hide-scrollbar [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              onClick={() => setActiveFilter('All')}
              className={`px-6 py-3 min-h-[44px] rounded-[1rem] text-xs font-black uppercase tracking-widest whitespace-nowrap transition-colors border cursor-pointer ${activeFilter === 'All' ? 'bg-[#1A2B4C] text-white border-[#1A2B4C]' : 'bg-white text-slate-700 border-gray-200 hover:border-[#1A2B4C] hover:text-[#1A2B4C]'}`}
            >
              All Models
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveFilter(cat.id)}
                className={`px-6 py-3 min-h-[44px] rounded-[1rem] text-xs font-black uppercase tracking-widest whitespace-nowrap transition-colors flex items-center gap-2 border cursor-pointer ${activeFilter === cat.id ? 'bg-[#1A2B4C] text-white border-[#1A2B4C]' : 'bg-white text-slate-700 border-gray-200 hover:border-[#1A2B4C] hover:text-[#1A2B4C]'}`}
              >
                <cat.icon size={14} />
                {cat.name}
              </button>
            ))}
          </div>
          
          <div className="relative group/slider">
            <button 
              onClick={() => scrollSlider('left')} 
              aria-label="Scroll featured products left"
              className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover/slider:opacity-100 p-4 bg-white border border-gray-100 text-[#1A2B4C] rounded-full hover:bg-[#00B4D8] hover:border-[#00B4D8] hover:text-[#1A2B4C] transition-all shadow-xl hidden md:block cursor-pointer"
            >
              <ArrowLeft size={20} />
            </button>
            <button 
              onClick={() => scrollSlider('right')} 
              aria-label="Scroll featured products right"
              className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover/slider:opacity-100 p-4 bg-white border border-gray-100 text-[#1A2B4C] rounded-full hover:bg-[#00B4D8] hover:border-[#00B4D8] hover:text-[#1A2B4C] transition-all shadow-xl hidden md:block cursor-pointer"
            >
              <ArrowRight size={20} />
            </button>
          <div 
            ref={sliderRef}
            className="flex overflow-x-auto gap-6 md:gap-8 pb-12 snap-x snap-mandatory scroll-smooth hide-scrollbar [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {featuredCarouselProducts.length > 0 ? featuredCarouselProducts.map((prod) => (
               <Link 
                to={`/product/${getCanonicalProductSlug(prod, prod.id)}`} 
                key={prod.id} 
                onMouseEnter={() => setHoveredProductId(prod.id || null)}
                onMouseLeave={() => setHoveredProductId(null)}
                onFocus={() => setHoveredProductId(prod.id || null)}
                className="bg-white group cursor-pointer rounded-3xl overflow-hidden flex flex-col border border-gray-100 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-2 relative shrink-0 w-[280px] sm:w-[320px] lg:w-[calc(25%-1.5rem)] snap-start"
               >
                  <div className="relative aspect-[4/3] bg-gradient-to-br from-[#1A2B4C]/5 to-[#00B4D8]/10 overflow-hidden">
                    {(() => {
                       const images = Array.isArray(prod.images) ? prod.images : (typeof prod.images === 'string' ? [prod.images] : (prod.image ? [prod.image] : []));
                       const firstImage = optimizeGalleryImageUrl(images[0] || 'https://placehold.co/600x600?text=No+Image', 480, 75);
                       return (
                         <img 
                           loading="lazy" 
                           decoding="async"
                           width={400}
                           height={300}
                           src={firstImage} 
                           alt={`${prod.productName} — Price PKR in Pakistan`} 
                           className="absolute inset-0 w-full h-full object-cover mix-blend-multiply transition-transform duration-500 ease-in-out group-hover:scale-105"
                         />
                       );
                    })()}
                    
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      aria-label={`Save ${prod.productName} to wishlist`}
                      className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-[#1A2B4C] hover:bg-[#1A2B4C] hover:text-white transition-colors z-10 shadow-sm"
                    >
                      <Heart size={16} />
                    </button>

                    {prod.salePrice > 0 && (
                      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-[#1A2B4C] text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm z-10">
                        Special Offer
                      </div>
                    )}
                  </div>

                  <div className="p-6 flex flex-col flex-grow bg-white z-10 relative">
                    <h3 className="font-bold text-lg text-[#1A2B4C] group-hover:text-[#00B4D8] transition-colors mb-2 line-clamp-1">
                      {prod.productName}
                    </h3>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                       {prod.brand && (
                         <span className="text-xs text-slate-600 font-bold uppercase tracking-wider border border-gray-200 px-2 py-0.5 rounded-sm">
                           {prod.brand}
                         </span>
                       )}
                       {prod.sku && (
                         <span className="text-xs text-slate-600 font-bold uppercase tracking-wider border border-gray-200 px-2 py-0.5 rounded-sm">
                           {prod.sku}
                         </span>
                       )}
                    </div>

                    <div className="text-slate-600 text-xs font-medium leading-relaxed line-clamp-2 mb-6" dangerouslySetInnerHTML={{ __html: prod.shortDescription || 'Professional unified communications equipment.' }} />
                    
                    <div className="mt-auto flex items-end justify-between gap-4 pt-4 border-t border-gray-50">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-600 uppercase tracking-widest mb-1">Price PKR</span>
                        <div className="flex items-baseline gap-2">
                          <span className="font-black text-xl text-[#1A2B4C]">PKR { ((prod.salePrice || prod.regularPrice) ?? 0).toLocaleString() }</span>
                        </div>
                      </div>
                      <span className="bg-[#1A2B4C] text-white px-4 py-2.5 rounded-lg text-xs font-bold group-hover:bg-[#00B4D8] group-hover:text-[#1A2B4C] transition-all shadow-md shrink-0 whitespace-nowrap">
                         View Specs
                      </span>
                    </div>
                  </div>
               </Link>
            )) : (
              <div className="w-full py-16 text-center border-2 border-dashed border-gray-100 rounded-[3rem]">
                 <Box size={48} className="mx-auto text-gray-300 mb-4" />
                 <p className="text-slate-600 font-bold uppercase tracking-widest text-xs">No products found for this category.</p>
              </div>
            )}
          </div>
          </div>
          
          <div className="flex justify-center mt-4">
             <Link to="/shop" className="text-xs font-black text-[#1A2B4C] uppercase tracking-[0.2em] hover:text-[#00B4D8] transition-colors flex items-center gap-2 group mb-2 bg-gray-50 hover:bg-gray-100 px-6 py-3.5 min-h-[44px] rounded-full">
                Browse Full 53-SKU Hardware Catalog <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
             </Link>
          </div>
        </div>
      </section>

      {/* Flagship Video Conferencing Bento Grid (Zero Inline Styles & Lean DOM) */}
      {flagshipVideoSet.length > 0 && (
        <section className="max-w-[1400px] mx-auto px-6 md:px-8 py-16 overflow-hidden">
           <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-black text-[#1A2B4C] tracking-tight">Video Conference in Pakistan — Poly X70 &amp; Cisco Room Kit Solutions</h2>
              <p className="text-gray-600 mt-2 text-sm md:text-base">Empowering boardrooms with certified visual collaboration &amp; transparent price PKR across Lahore, Karachi &amp; Islamabad</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:h-[580px] h-auto">
              {/* Left Column (2 items) */}
              <div className="col-span-1 flex flex-col gap-4 h-full">
                 {flagshipVideoSet[0] && (
                    <Link to={`/product/${getCanonicalProductSlug(flagshipVideoSet[0], flagshipVideoSet[0].id)}`} className="flex-1 min-h-[240px] md:min-h-0 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all group flex flex-col items-center justify-center relative overflow-hidden">
                       {flagshipVideoSet[0].images?.[0] && (
                         <img loading="lazy" decoding="async" width={320} height={200} src={optimizeGalleryImageUrl(flagshipVideoSet[0].images[0], 420, 75)} alt={`${flagshipVideoSet[0].productName} Pakistan`} className="w-full h-32 md:flex-1 object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500 mb-4" />
                       )}
                       <h3 className="text-center font-bold text-[#1A2B4C] group-hover:text-[#00B4D8] transition-colors line-clamp-2">{flagshipVideoSet[0].productName}</h3>
                       <p className="text-[#00B4D8] font-black mt-2">PKR {flagshipVideoSet[0].salePrice > 0 ? (flagshipVideoSet[0].salePrice ?? 0).toLocaleString() : (flagshipVideoSet[0].regularPrice ?? 0).toLocaleString()}</p>
                    </Link>
                 )}
                 {flagshipVideoSet[1] && (
                    <Link to={`/product/${getCanonicalProductSlug(flagshipVideoSet[1], flagshipVideoSet[1].id)}`} className="flex-1 min-h-[240px] md:min-h-0 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all group flex flex-col items-center justify-center relative overflow-hidden">
                       {flagshipVideoSet[1].images?.[0] && (
                         <img loading="lazy" decoding="async" width={320} height={200} src={optimizeGalleryImageUrl(flagshipVideoSet[1].images[0], 420, 75)} alt={`${flagshipVideoSet[1].productName} Pakistan`} className="w-full h-32 md:flex-1 object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500 mb-4" />
                       )}
                       <h3 className="text-center font-bold text-[#1A2B4C] group-hover:text-[#00B4D8] transition-colors line-clamp-2">{flagshipVideoSet[1].productName}</h3>
                       <p className="text-[#00B4D8] font-black mt-2">PKR {flagshipVideoSet[1].salePrice > 0 ? (flagshipVideoSet[1].salePrice ?? 0).toLocaleString() : (flagshipVideoSet[1].regularPrice ?? 0).toLocaleString()}</p>
                    </Link>
                 )}
              </div>
              
              {/* Middle Column (1 large item) */}
              <div className="col-span-1 md:col-span-2 h-full">
                 {flagshipVideoSet[2] && (
                    <Link to={`/product/${getCanonicalProductSlug(flagshipVideoSet[2], flagshipVideoSet[2].id)}`} className="w-full h-full min-h-[340px] md:min-h-0 bg-white border border-gray-100 shadow-sm hover:shadow-lg rounded-[2.5rem] p-8 md:p-10 group flex flex-col items-center justify-center relative overflow-hidden text-center">
                       {flagshipVideoSet[2].images?.[0] && (
                         <img loading="lazy" decoding="async" width={540} height={360} src={optimizeGalleryImageUrl(flagshipVideoSet[2].images[0], 560, 75)} alt={`${flagshipVideoSet[2].productName} Pakistan`} className="w-full h-48 md:flex-1 object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500 relative z-20 mb-6" />
                       )}
                       <div className="relative z-20">
                          <span className="text-[#00B4D8] font-black uppercase tracking-widest text-xs mb-2 block">Flagship Boardroom Endpoint</span>
                          <h3 className="text-2xl md:text-3xl font-black text-[#1A2B4C] group-hover:text-[#00B4D8] transition-colors line-clamp-2">{flagshipVideoSet[2].productName}</h3>
                          <p className="text-[#00B4D8] text-xl font-black mt-2">PKR {flagshipVideoSet[2].salePrice > 0 ? (flagshipVideoSet[2].salePrice ?? 0).toLocaleString() : (flagshipVideoSet[2].regularPrice ?? 0).toLocaleString()}</p>
                          <p className="text-gray-600 mt-3 line-clamp-2 max-w-md mx-auto text-sm">{flagshipVideoSet[2].shortDescription?.replace(/<[^>]*>?/gm, '') || 'Professional video conferencing solution.'}</p>
                       </div>
                    </Link>
                 )}
              </div>
              
              {/* Right Column (2 items) */}
              <div className="col-span-1 flex flex-col gap-4 h-full">
                 {flagshipVideoSet[3] && (
                    <Link to={`/product/${getCanonicalProductSlug(flagshipVideoSet[3], flagshipVideoSet[3].id)}`} className="flex-1 min-h-[240px] md:min-h-0 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all group flex flex-col items-center justify-center relative overflow-hidden">
                       {flagshipVideoSet[3].images?.[0] && (
                         <img loading="lazy" decoding="async" width={320} height={200} src={optimizeGalleryImageUrl(flagshipVideoSet[3].images[0], 420, 75)} alt={`${flagshipVideoSet[3].productName} Pakistan`} className="w-full h-32 md:flex-1 object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500 mb-4" />
                       )}
                       <h3 className="text-center font-bold text-[#1A2B4C] group-hover:text-[#00B4D8] transition-colors line-clamp-2">{flagshipVideoSet[3].productName}</h3>
                       <p className="text-[#00B4D8] font-black mt-2">PKR {flagshipVideoSet[3].salePrice > 0 ? (flagshipVideoSet[3].salePrice ?? 0).toLocaleString() : (flagshipVideoSet[3].regularPrice ?? 0).toLocaleString()}</p>
                    </Link>
                 )}
                 {flagshipVideoSet[4] && (
                    <Link to={`/product/${getCanonicalProductSlug(flagshipVideoSet[4], flagshipVideoSet[4].id)}`} className="flex-1 min-h-[240px] md:min-h-0 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all group flex flex-col items-center justify-center relative overflow-hidden">
                       {flagshipVideoSet[4].images?.[0] && (
                         <img loading="lazy" decoding="async" width={320} height={200} src={optimizeGalleryImageUrl(flagshipVideoSet[4].images[0], 420, 75)} alt={`${flagshipVideoSet[4].productName} Pakistan`} className="w-full h-32 md:flex-1 object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500 mb-4" />
                       )}
                       <h3 className="text-center font-bold text-[#1A2B4C] group-hover:text-[#00B4D8] transition-colors line-clamp-2">{flagshipVideoSet[4].productName}</h3>
                       <p className="text-[#00B4D8] font-black mt-2">PKR {flagshipVideoSet[4].salePrice > 0 ? (flagshipVideoSet[4].salePrice ?? 0).toLocaleString() : (flagshipVideoSet[4].regularPrice ?? 0).toLocaleString()}</p>
                    </Link>
                 )}
              </div>
           </div>
        </section>
      )}

      {/* Setup Wizard Banner */}
      <section className="bg-[#F8F9FA] pb-16">
        <div className="max-w-[1400px] mx-auto px-8">
          <div className="bg-gradient-to-r from-[#1A2B4C] to-[#0A192F] rounded-[3.5rem] p-12 md:p-16 text-white relative overflow-hidden shadow-2xl border border-gray-800">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#00B4D8]/20 to-transparent rounded-full translate-x-32 -translate-y-32"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-[#00B4D8]/10 to-transparent rounded-full -translate-x-32 translate-y-32"></div>

            <div className="relative z-10 max-w-5xl flex flex-col md:flex-row items-start md:items-center justify-between gap-10">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 bg-[#00B4D8]/20 text-[#00B4D8] px-4 py-2 rounded-full">
                  <Sparkles size={12} />
                  <span className="text-[9px] font-black uppercase tracking-widest text-white">Smart Configurator</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
                  Unsure of Room Scale &amp; VoIP Requirements?
                </h2>
                <h3 className="text-sm font-bold text-[#00B4D8] uppercase tracking-wider">
                  Interactive 60-Second Conference Room &amp; SIP PBX Sizing Tool
                </h3>
                <p className="text-gray-300 font-medium text-xs md:text-sm leading-relaxed max-w-2xl">
                  Take our interactive 3-question hardware wizard. We'll instantly size up your space and recommend the perfect pre-configured starter bundle of certified IP phones and video bars in under 60 seconds.
                </p>
              </div>

              <div className="shrink-0">
                <Link
                  to="/setup-wizard"
                  className="bg-[#00B4D8] hover:bg-white text-[#1A2B4C] px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-lg active:scale-98 flex items-center gap-2 group whitespace-nowrap"
                >
                  Launch Setup Configurator <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Services */}
      <section className="bg-[#1A2B4C] py-16 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 skew-x-12 translate-x-1/2"></div>
        <div className="max-w-[1400px] mx-auto px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
             <div>
                <span className="text-[#00B4D8] text-xs font-black uppercase tracking-[0.3em] mb-6 block">Why AV Live?</span>
                <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight tracking-tight">Pakistan's Trusted Unified Communications Partner.</h2>
                <div className="space-y-8">
                   <div className="flex gap-6">
                      <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 border border-white/10">
                         <ShieldCheck className="text-[#00B4D8]" size={28} />
                      </div>
                      <div>
                         <h3 className="font-bold text-lg mb-2">Certified Tech Support &amp; 15-Minute SLA</h3>
                         <p className="text-slate-300 text-sm leading-relaxed">Our engineers hold certifications from Cisco, HP Poly, Logitech, and Yealink, delivering on-site boardroom calibration and standby event engineering across Lahore, Karachi, and Islamabad.</p>
                      </div>
                   </div>
                   <div className="flex gap-6">
                      <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 border border-white/10">
                         <Box className="text-[#00B4D8]" size={28} />
                      </div>
                      <div>
                         <h3 className="font-bold text-lg mb-2">Same Day Nationwide Dispatch &amp; FBR Tax Invoicing</h3>
                         <p className="text-slate-300 text-sm leading-relaxed">We maintain serial-verified local stock in Lahore for rapid delivery across Pakistan, complete with official 1-to-3 year warranty and PPRA/FBR GST documentation.</p>
                      </div>
                   </div>
                </div>
             </div>
             <div className="bg-white/5 border border-white/10 rounded-[3rem] p-12 backdrop-blur-sm">
                <div className="grid grid-cols-2 gap-8">
                   <div className="text-center p-6 border border-white/10 rounded-3xl">
                      <div className="text-4xl font-black text-[#00B4D8] mb-2">{content?.stats?.yearsExperience || 15}+</div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-300">Years Experience</div>
                   </div>
                   <div className="text-center p-6 border border-white/10 rounded-3xl">
                      <div className="text-4xl font-black text-[#00B4D8] mb-2">{content?.stats?.projectsCompleted || '5K'}+</div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-300">Deployments</div>
                   </div>
                   <div className="text-center p-6 border border-white/10 rounded-3xl">
                      <div className="text-4xl font-black text-[#00B4D8] mb-2">{content?.stats?.happyClients || '100%'}</div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-300">Satisfied Clients</div>
                   </div>
                   <div className="text-center p-6 border border-white/10 rounded-3xl">
                      <div className="text-4xl font-black text-[#00B4D8] mb-2">24/7</div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-300">Remote Support</div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Answer Engine Optimization (AEO) Knowledge, Reference Matrix & FAQ Section */}
      <section className="bg-white py-20 border-t border-gray-100">
        <div className="max-w-[1400px] mx-auto px-8">
          <div className="max-w-4xl mb-14">
            <span className="text-[#00B4D8] text-xs font-black uppercase tracking-[0.3em] mb-3 block">
              Enterprise AV &amp; Event Intelligence
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-[#1A2B4C] tracking-tight mb-4">
              Video Conference in Pakistan, Corporate Event Management &amp; 3D Hologram Solutions
            </h2>
            <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-4">
              AV Live Communications (Pvt) Ltd is Pakistan’s authoritative B2B distributor and systems integrator for enterprise <strong>Video conference</strong> rooms, unified SIP/VoIP telephony, and high-impact <strong>Corporate event management</strong>. From executive boardrooms in Lahore (Johar Town &amp; Gulberg), Karachi (I.I. Chundrigar Road, Clifton &amp; Shahrah-e-Faisal), and Islamabad (Blue Area &amp; Diplomatic Enclave) to nationwide hybrid townhalls and <strong>3D Hologram Display</strong> product launches, our engineering teams design, supply, and support mission-critical visual collaboration infrastructure.
            </p>
            <p className="text-gray-600 text-sm md:text-base leading-relaxed">
              Every turnkey project is backed by a guaranteed <strong>15-minute technical response SLA</strong>, certified acoustic RT60 modeling, structured PoE+ network integration, and official OEM warranty across 25 global manufacturers including <Link to="/brands/poly" className="text-[#00B4D8] font-bold hover:underline">HP Poly (Polycom)</Link>, <Link to="/brands/logitech" className="text-[#00B4D8] font-bold hover:underline">Logitech</Link>, <Link to="/brands/cisco" className="text-[#00B4D8] font-bold hover:underline">Cisco</Link>, <Link to="/brands/yealink" className="text-[#00B4D8] font-bold hover:underline">Yealink</Link>, <Link to="/brands/jabra" className="text-[#00B4D8] font-bold hover:underline">Jabra</Link>, <Link to="/brands/bosch" className="text-[#00B4D8] font-bold hover:underline">Bosch</Link>, and <Link to="/brands/horion" className="text-[#00B4D8] font-bold hover:underline">Horion</Link>.
            </p>
          </div>

          {/* Reference Comparison Table */}
          <div className="mb-16 overflow-x-auto bg-[#F8F9FA] rounded-3xl p-6 md:p-8 border border-gray-100">
            <h3 className="text-xl font-black text-[#1A2B4C] mb-4">
              2026 Pakistan Conference Room AV &amp; Corporate Event Production Reference Matrix
            </h3>
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-[#1A2B4C] font-black uppercase tracking-wider text-[11px]">
                  <th className="py-3 pr-4">Deployment Tier / Event Scope</th>
                  <th className="py-3 px-4">Flagship Hardware &amp; Production Stack</th>
                  <th className="py-3 px-4">Capacity &amp; Acoustic Spec</th>
                  <th className="py-3 pl-4">Reference PKR Budget</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/70 text-slate-700">
                <tr>
                  <td className="py-3.5 pr-4 font-bold text-[#1A2B4C]">Focus &amp; Huddle Room (MTR / Zoom)</td>
                  <td className="py-3.5 px-4">Poly Studio R30 / Logitech Rally Bar Mini / Yealink UVC40</td>
                  <td className="py-3.5 px-4">2–6 Seats • 120° 4K AI Framing • 4m Beamforming Mic</td>
                  <td className="py-3.5 pl-4 font-bold text-[#1A2B4C]">Rs. 240,000 – Rs. 490,000</td>
                </tr>
                <tr>
                  <td className="py-3.5 pr-4 font-bold text-[#1A2B4C]">Mid-Sized Corporate Conference Room</td>
                  <td className="py-3.5 px-4">Logitech Rally Bar / HP Poly Studio X52 / Cisco Room Bar</td>
                  <td className="py-3.5 px-4">8–14 Seats • 20MP 4K DirectorAI • Expansion Mic Array</td>
                  <td className="py-3.5 pl-4 font-bold text-[#1A2B4C]">Rs. 680,000 – Rs. 1,350,000</td>
                </tr>
                <tr>
                  <td className="py-3.5 pr-4 font-bold text-[#1A2B4C]">Large Executive Boardroom Suite</td>
                  <td className="py-3.5 px-4">Polycom RealPresence Group 500 / Poly Studio X72 / Cisco Room Kit Plus</td>
                  <td className="py-3.5 px-4">16–28 Seats • 12x Optical PTZ / Dual 4K + Ceiling Mics</td>
                  <td className="py-3.5 pl-4 font-bold text-[#1A2B4C]">Rs. 1,450,000 – Rs. 2,850,000</td>
                </tr>
                <tr>
                  <td className="py-3.5 pr-4 font-bold text-[#1A2B4C]">Hybrid Corporate Townhall &amp; SMD LED Stage</td>
                  <td className="py-3.5 px-4">P2.5 3840Hz SMD LED Wall, 3-Cam 4K SDI ATEM Switcher, Line-Array PA</td>
                  <td className="py-3.5 px-4">100–1,000+ Delegates • Bidirectional Zoom/Teams Bridge</td>
                  <td className="py-3.5 pl-4 font-bold text-[#1A2B4C]">Rs. 350,000 – Rs. 1,850,000 / Event</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <article className="bg-[#F8F9FA] rounded-3xl p-8 border border-gray-100">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#00B4D8] bg-[#00B4D8]/10 px-3 py-1 rounded-full">
                Video Conference in Pakistan
              </span>
              <h3 className="text-xl font-black text-[#1A2B4C] mt-4 mb-3">
                What is the best Video Conference in Pakistan solution for executive boardrooms?
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                For medium-to-large corporate boardrooms and training halls in Pakistan, AV Live recommends the <strong>Poly Studio X70 / X72 (Poly X70)</strong> and the <strong>Polycom RealPresence Group 500 (Polycom Group 500)</strong>. Both systems deliver ultra-low latency 4K/1080p60 video, NoiseBlockAI acoustic filtering, and full compatibility with Zoom Rooms, Microsoft Teams Rooms, and standards-based SIP/H.323 networks.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link to="/category/video-conferencing" className="text-xs font-black text-[#1A2B4C] hover:text-[#00B4D8] uppercase tracking-wider flex items-center gap-1">
                  Explore Video Conference Hardware <ArrowRight size={14} />
                </Link>
              </div>
            </article>

            <article className="bg-[#F8F9FA] rounded-3xl p-8 border border-gray-100">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#00B4D8] bg-[#00B4D8]/10 px-3 py-1 rounded-full">
                Polycom Group 500 vs. Poly X70
              </span>
              <h3 className="text-xl font-black text-[#1A2B4C] mt-4 mb-3">
                How do Polycom Group 500 and Poly X70 compare for enterprise meetings?
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                The <strong>Polycom Group 500</strong> (MPN 7200-64550-001) features a dedicated rack-mountable codec with an EagleEye IV 12x optical zoom PTZ camera, making it ideal for multi-display rooms and hardware MCU networks. The <strong>Poly X70</strong> is a modern all-in-one AI video bar with dual 4K 20MP sensors, Poly DirectorAI automatic speaker framing, and native cloud apps for Zoom and Microsoft Teams without an external PC.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link to="/video-conferencing" className="text-xs font-black text-[#1A2B4C] hover:text-[#00B4D8] uppercase tracking-wider flex items-center gap-1">
                  Compare Boardroom Systems <ArrowRight size={14} />
                </Link>
              </div>
            </article>

            <article className="bg-[#F8F9FA] rounded-3xl p-8 border border-gray-100">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#00B4D8] bg-[#00B4D8]/10 px-3 py-1 rounded-full">
                Corporate Event Management &amp; Hybrid Events
              </span>
              <h3 className="text-xl font-black text-[#1A2B4C] mt-4 mb-3">
                How does AV Live execute Corporate event management and hybrid events?
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                AV Live combines full-scale <strong>Event management</strong> and <strong>Corporate event management</strong> with broadcast-grade <strong>hybrid event</strong> engineering. We integrate SMD LED video walls, line-array PA sound, multi-camera SDI switching, and bidirectional <strong>Video conference</strong> bridges so remote executives and international keynote speakers interact live with in-person audiences in Lahore, Karachi, and Islamabad.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link to="/services" className="text-xs font-black text-[#1A2B4C] hover:text-[#00B4D8] uppercase tracking-wider flex items-center gap-1">
                  Book Corporate Event Production <ArrowRight size={14} />
                </Link>
              </div>
            </article>

            <article className="bg-[#F8F9FA] rounded-3xl p-8 border border-gray-100">
              <span className="text-xs font-black uppercase tracking-widest text-[#00B4D8] bg-[#00B4D8]/10 px-3 py-1 rounded-full">
                3D Hologram Display &amp; Events
              </span>
              <h3 className="text-xl font-black text-[#1A2B4C] mt-4 mb-3">
                Where can we rent or install a 3D Hologram Display for events in Pakistan?
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                AV Live engineers custom <strong>3D Hologram Display</strong> stages, 3D holographic fan arrays, and high-lumen optical Pepper's Ghost mesh projections for product launches, expos, and flagship corporate <strong>events</strong> across Pakistan. Our creative studio builds bespoke 3D holographic animations and handles complete on-site rigging and lighting synchronization.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link to="/3d-hologram" className="text-xs font-black text-[#1A2B4C] hover:text-[#00B4D8] uppercase tracking-wider flex items-center gap-1 py-1">
                  View Hologram Display Solutions <ArrowRight size={14} />
                </Link>
              </div>
            </article>
          </div>

          {/* Global OEM Standards & Official Social Media Block */}
          <div className="mt-14 pt-10 border-t border-gray-100 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-[#F8F9FA] rounded-3xl p-6 md:p-8 border border-gray-100">
              <h3 className="text-lg font-black text-[#1A2B4C] mb-3">
                Official OEM &amp; Cloud Conferencing Standards
              </h3>
              <p className="text-xs md:text-sm text-gray-600 mb-4 leading-relaxed">
                All AV Live boardroom codecs, SIP endpoints, and UC headsets conform to global enterprise standards from our technology partners:
              </p>
              <div className="flex flex-wrap gap-2.5 text-xs font-bold">
                <a href="https://www.ipphone-warehouse.com/" target="_blank" rel="noopener" className="px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-[#1A2B4C] hover:border-[#00B4D8] hover:text-[#00B4D8] transition-colors">IP Phone Warehouse</a>
                <a href="https://www.hp.com/" target="_blank" rel="noopener" className="px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-[#1A2B4C] hover:border-[#00B4D8] hover:text-[#00B4D8] transition-colors">HP.com (Poly)</a>
                <a href="https://www.plantronics.com/" target="_blank" rel="noopener" className="px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-[#1A2B4C] hover:border-[#00B4D8] hover:text-[#00B4D8] transition-colors">Plantronics.com</a>
                <a href="https://www.cisco.com/" target="_blank" rel="noopener" className="px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-[#1A2B4C] hover:border-[#00B4D8] hover:text-[#00B4D8] transition-colors">Cisco.com</a>
                <a href="https://zoom.us/" target="_blank" rel="noopener" className="px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-[#1A2B4C] hover:border-[#00B4D8] hover:text-[#00B4D8] transition-colors">Zoom.us</a>
                <a href="https://www.webex.com/" target="_blank" rel="noopener" className="px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-[#1A2B4C] hover:border-[#00B4D8] hover:text-[#00B4D8] transition-colors">Webex.com</a>
                <a href="https://www.323.tv/" target="_blank" rel="noopener" className="px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-[#1A2B4C] hover:border-[#00B4D8] hover:text-[#00B4D8] transition-colors">323.tv</a>
              </div>
            </div>

            <div className="bg-[#F8F9FA] rounded-3xl p-6 md:p-8 border border-gray-100">
              <h3 className="text-lg font-black text-[#1A2B4C] mb-3">
                Connect with AV Live Communications on Social Media
              </h3>
              <p className="text-xs md:text-sm text-gray-600 mb-4 leading-relaxed">
                Watch live 3D hologram stage reels, boardroom acoustic walkthroughs, and Pakistan corporate event highlights across our official channels:
              </p>
              <div className="flex flex-wrap gap-2.5 text-xs font-bold">
                <a href="https://www.youtube.com/@avlivepk" target="_blank" rel="noopener" className="px-4 py-2.5 min-h-[44px] inline-flex items-center bg-[#1A2B4C] text-white rounded-xl hover:bg-[#00B4D8] hover:text-[#1A2B4C] transition-colors">YouTube Channel</a>
                <a href="https://x.com/avlivepk" target="_blank" rel="noopener" className="px-4 py-2.5 min-h-[44px] inline-flex items-center bg-[#1A2B4C] text-white rounded-xl hover:bg-[#00B4D8] hover:text-[#1A2B4C] transition-colors">X (Twitter)</a>
                <a href="https://www.linkedin.com/company/avlivepk" target="_blank" rel="noopener" className="px-4 py-2.5 min-h-[44px] inline-flex items-center bg-[#1A2B4C] text-white rounded-xl hover:bg-[#00B4D8] hover:text-[#1A2B4C] transition-colors">LinkedIn Company</a>
                <a href="https://www.instagram.com/avlivepk" target="_blank" rel="noopener" className="px-4 py-2.5 min-h-[44px] inline-flex items-center bg-[#1A2B4C] text-white rounded-xl hover:bg-[#00B4D8] hover:text-[#1A2B4C] transition-colors">Instagram</a>
                <a href="https://www.facebook.com/avlivepk" target="_blank" rel="noopener" className="px-4 py-2.5 min-h-[44px] inline-flex items-center bg-[#1A2B4C] text-white rounded-xl hover:bg-[#00B4D8] hover:text-[#1A2B4C] transition-colors">Facebook Page</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <React.Suspense fallback={null}>
        <TopBrands />
      </React.Suspense>
    </div>
  );
}
