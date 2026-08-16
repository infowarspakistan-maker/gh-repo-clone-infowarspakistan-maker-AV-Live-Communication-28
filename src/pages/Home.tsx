import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Phone, Video, Headphones, ShieldCheck, Box, Mic, Loader2, Sparkles, Projector } from 'lucide-react';
import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Product, 
  HomepageData, GeneralSettings, ContactData, getGeneralSettings, getContactData, 
  subscribeToHomepage, 
  subscribeToProducts 
} from '../lib/firebase/firestore-helpers';
import { SEO } from '../components/SEO';

import { TopBrands, brands } from '../components/TopBrands';

import { StructuredData } from "../components/StructuredData";

export function Home() {
  const [content, setContent] = useState<HomepageData | null>(null);
  const [settings, setSettings] = useState<GeneralSettings | null>(null);
  const [contact, setContact] = useState<ContactData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoplayPaused, setIsAutoplayPaused] = useState(false);
  const [currentVideoSlide, setCurrentVideoSlide] = useState(0);
  const [activeFilter, setActiveFilter] = useState('All');
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
    // Listen for homepage content
    getGeneralSettings().then(setSettings).catch(console.error);
    getContactData().then(setContact).catch(console.error);
    const unsubscribeHome = subscribeToHomepage((data) => {
      setContent(data);
    });

    // Listen for products
    const unsubscribeProducts = subscribeToProducts((data) => {
      setProducts(data); 
      setLoading(false);
    }, { isActive: true });

    return () => {
      unsubscribeHome();
      unsubscribeProducts();
    };
  }, []);

  const CATEGORIES = [
    { name: "Projectors", icon: Projector, link: "/category/projectors", id: "projectors" },
    { name: "IP Phones", icon: Phone, link: "/category/ip-phones", id: "ip-phones" },
    { name: "Headsets", icon: Headphones, link: "/category/headsets", id: "headsets" },
    { name: "Video Conferencing", icon: Video, link: "/category/video-conferencing", id: "video-conferencing" },
    { name: "IP Cameras", icon: ShieldCheck, link: "/category/ip-cameras", id: "ip-cameras" },
    { name: "Intercom, Paging & Access", icon: Mic, link: "/category/intercom-paging-access", id: "intercom-paging" },
    { name: "VoIP Phone Systems", icon: Box, link: "/category/voip-phone-systems", id: "voip-systems" }
  ];

  const scrollSlider = useCallback((direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const { scrollLeft, clientWidth, scrollWidth } = sliderRef.current;
      const scrollAmount = direction === 'left' ? -(clientWidth * 0.8) : (clientWidth * 0.8);
      
      let newScroll = scrollLeft + scrollAmount;
      if (direction === 'right' && scrollLeft + clientWidth >= scrollWidth - 10) {
        newScroll = 0;
      } else if (direction === 'left' && scrollLeft <= 10) {
        newScroll = scrollWidth;
      }
      
      sliderRef.current.scrollTo({ left: newScroll, behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => scrollSlider('right'), 5000);
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

  const videoConferencingProducts = products.filter(p => p.categoryIds?.includes('cat-video') || (Array.isArray(p.categorySlugs) ? p.categorySlugs : typeof p.categorySlugs === 'string' ? [p.categorySlugs] : []).includes('video-conferencing'));
  const videoChunks: Product[][] = [];
  for (let i = 0; i < videoConferencingProducts.length; i += 5) {
    videoChunks.push(videoConferencingProducts.slice(i, i + 5));
  }

  useEffect(() => {
    if (videoChunks.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentVideoSlide(prev => (prev + 1) % videoChunks.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [videoChunks.length]);

  if (loading && !content) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[600px] bg-white">
        <div className="text-center">
          <Loader2 className="animate-spin w-12 h-12 text-[#00B4D8] mx-auto mb-4" />
          <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Loading Experience...</p>
        </div>
      </div>
    );
  }

  const slides = content?.heroSlides || [];

  return (
    <div className="flex-1 w-full bg-[#f8f9fa]">
      <SEO 
        title={settings?.siteName ? `${settings.siteName} | Pro AV & IP Phone Solutions Pakistan` : "AV Live Communications | Pro AV & IP Phone Solutions Pakistan"}
        description={settings?.tagline || "Pakistan's leading provider of professional AV solutions, IP phones, and video conferencing. Authorized partners for Poly, Cisco, and Grandstream."}
        schema={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": "https://avlive.com.pk/#organization",
              "name": settings?.siteName || "AV Live Communications",
              "url": "https://avlive.com.pk",
              "logo": "https://avlive.com.pk/logo.png",
              "description": settings?.tagline || "Pakistan's leading provider of professional AV solutions, IP phones, and video conferencing.",
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": contact?.phone || settings?.phone || "+92-321-425-6263",
                "contactType": "customer service",
                "areaServed": "PK",
                "availableLanguage": ["English", "Urdu"]
              }
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
              "@id": "https://avlive.com.pk/#localbusiness",
              "name": settings?.siteName || "AV Live Communications",
              "image": "https://avlive.com.pk/logo.png",
              "telephone": contact?.phone || settings?.phone || "0321 425 6263",
              "url": "https://avlive.com.pk",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": contact?.address || settings?.address || "Johar Town Block N",
                "addressLocality": "Lahore",
                "addressRegion": "Punjab",
                "addressCountry": "PK"
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
            }
          ]
        }}
      />
      
      {/* Hero Slider */}
      <div 
        className="relative w-full h-[600px] overflow-hidden bg-[#1A2B4C] group/slider"
        onMouseEnter={() => setIsAutoplayPaused(true)}
        onMouseLeave={() => setIsAutoplayPaused(false)}
      >
        <AnimatePresence mode="wait">
          {slides.length > 0 ? (
            <div key={currentSlide} className="absolute inset-0">
              {/* Background zoom & fade transition */}
              <motion.div 
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="absolute inset-0 w-full h-full"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#1A2B4C]/95 via-[#1A2B4C]/70 to-transparent z-10"></div>
                <img 
                  loading="lazy" 
                  src={slides[currentSlide].imageUrl} 
                  alt={slides[currentSlide].title} 
                  className="absolute inset-0 w-full h-full object-cover" 
                />
              </motion.div>

              {/* Slide text content container */}
              <div className="absolute inset-0 z-20 flex flex-col items-start justify-center text-left px-8 md:px-20 max-w-[1400px] mx-auto">
                 <motion.div 
                   initial={{ opacity: 0, y: 15 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ duration: 0.5, delay: 0.2 }}
                   className="bg-[#00B4D8] px-4 py-1.5 rounded-lg shadow-lg mb-6 flex items-center gap-2 inline-flex"
                 >
                    <span className="font-black text-white uppercase tracking-widest text-[10px]">New Innovation</span>
                 </motion.div>

                 <motion.h1 
                   initial={{ opacity: 0, y: 25 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ duration: 0.6, delay: 0.3 }}
                   className="text-5xl md:text-7xl font-black text-white mb-6 drop-shadow-2xl leading-tight max-w-3xl font-sans"
                 >
                   {slides[currentSlide].title}
                 </motion.h1>

                 <motion.div 
                   initial={{ opacity: 0, y: 25 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ duration: 0.6, delay: 0.4 }}
                   className="text-xl md:text-2xl text-white mb-10 max-w-2xl drop-shadow-md font-semibold leading-[1.6] prose prose-p:m-0 prose-invert" 
                   dangerouslySetInnerHTML={{ __html: slides[currentSlide].subtitle || '' }} 
                 />
                 
                 <motion.div
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ duration: 0.5, delay: 0.5 }}
                 >
                   <Link 
                    to={slides[currentSlide].ctaLink || '/shop'} 
                    className="bg-white text-[#1A2B4C] px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-[#00B4D8] hover:text-white transition-all shadow-2xl flex items-center gap-3 group"
                   >
                     {slides[currentSlide].ctaText || 'Explore Now'}
                     <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                   </Link>
                 </motion.div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-white/20 font-black text-4xl uppercase tracking-widest">
              AV LIVE CMS INACTIVE
            </div>
          )}
        </AnimatePresence>

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

        {/* Pagination Dots with Active Progress Fill */}
        {slides.length > 1 && (
          <div className="absolute bottom-10 left-8 md:left-20 z-30 flex items-center gap-3">
            {slides.map((_: any, index: number) => {
              const isActive = index === currentSlide;
              return (
                <button 
                  key={index} 
                  onClick={() => setCurrentSlide(index)}
                  className="relative group/dot p-2 -m-2 cursor-pointer"
                  aria-label={`Go to slide ${index + 1}`}
                >
                  <div className={`h-2 transition-all duration-300 rounded-full bg-white/20 hover:bg-white/40 ${isActive ? 'w-12 bg-white/0 overflow-hidden relative border border-white/20' : 'w-6'}`}>
                    {isActive && (
                      <motion.div 
                        initial={{ left: "-100%" }}
                        animate={{ left: "0%" }}
                        transition={isAutoplayPaused ? { duration: 0 } : { duration: 8, ease: "linear" }}
                        className="absolute inset-0 bg-[#00B4D8]"
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Category Icons */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-white border border-gray-100 shadow-sm py-12 relative z-20 mx-auto" 
        style={{ paddingTop: '34px', height: '185.375px' }}
      >
        <div className="max-w-[1400px] mx-auto px-8 overflow-x-auto pb-4 hide-scrollbar">
          <div className="flex items-start justify-between min-w-max gap-12" style={{ paddingTop: '2px', marginTop: '2px' }}>
             {CATEGORIES.map((cat, i) => (
               <Link key={i} to={cat.link} className="flex flex-col items-center group w-28">
                 <div className="w-20 h-20 rounded-[2rem] bg-gray-50 flex items-center justify-center text-[#1A2B4C] group-hover:bg-[#1A2B4C] group-hover:text-white transition-all shadow-sm border border-gray-100 mb-4 group-hover:shadow-xl group-hover:-translate-y-1">
                   <cat.icon size={32} strokeWidth={1.5} />
                 </div>
                 <span className="text-[10px] font-black text-center leading-tight uppercase tracking-[0.2em] text-gray-400 group-hover:text-[#1A2B4C] transition-colors">{cat.name}</span>
               </Link>
             ))}
          </div>
        </div>
      </motion.div>

      {/* Brand Marquee */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-transparent py-6 overflow-hidden relative border-y border-gray-200"
      >
        <div className="absolute left-0 top-0 bottom-0 w-40 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none"></div>
        <div className="flex flex-col sm:flex-row items-center gap-6 absolute left-8 z-20 top-1/2 -translate-y-1/2">
          <span className="text-white font-black uppercase tracking-[0.2em] bg-[#00B4D8] px-4 rounded-full shadow-lg flex items-center" style={{ height: '47px' }}>Featured Brands</span>
        </div>
        <div className="flex whitespace-nowrap animate-marquee hover:pause w-max items-center gap-16 px-8 ml-64">
          {Array(4).fill(brands).flat().map((brand, idx) => (
             <Link to={`/shop?brand=${brand.id}`} key={`${brand.id}-${idx}`} className="inline-flex items-center gap-4 group opacity-50 hover:opacity-100 transition-opacity grayscale hover:grayscale-0">
               <div className="w-32 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                 {brand.logo}
               </div>
             </Link>
          ))}
        </div>
      </motion.div>

      {/* Featured Products */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="bg-white py-16" 
        style={{ paddingTop: '20px', paddingBottom: '20px' }}
      >
        <div className="max-w-[1400px] mx-auto px-8 relative" style={{ paddingLeft: '30px', borderWidth: '0px', borderRadius: '0px', paddingTop: '23px' }}>
          
          {/* Smart Product Filter */}
          <div className="flex overflow-x-auto gap-3 pb-4 mb-10 hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <button
              onClick={() => setActiveFilter('All')}
              className={`px-6 py-3 rounded-[1rem] text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-colors border ${activeFilter === 'All' ? 'bg-[#1A2B4C] text-white border-[#1A2B4C]' : 'bg-white text-gray-500 border-gray-200 hover:border-[#1A2B4C] hover:text-[#1A2B4C]'}`}
            >
              All Models
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveFilter(cat.id)}
                className={`px-6 py-3 rounded-[1rem] text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-colors flex items-center gap-2 border ${activeFilter === cat.id ? 'bg-[#1A2B4C] text-white border-[#1A2B4C]' : 'bg-white text-gray-500 border-gray-200 hover:border-[#1A2B4C] hover:text-[#1A2B4C]'}`}
              >
                <cat.icon size={14} />
                {cat.name}
              </button>
            ))}
          </div>
          
          <div className="relative group/slider">
            <button onClick={() => scrollSlider('left')} className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover/slider:opacity-100 p-4 bg-white border border-gray-100 text-[#1A2B4C] rounded-full hover:bg-[#00B4D8] hover:border-[#00B4D8] hover:text-white transition-all shadow-xl hidden md:block">
              <ArrowLeft size={20} />
            </button>
            <button onClick={() => scrollSlider('right')} className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover/slider:opacity-100 p-4 bg-white border border-gray-100 text-[#1A2B4C] rounded-full hover:bg-[#00B4D8] hover:border-[#00B4D8] hover:text-white transition-all shadow-xl hidden md:block">
              <ArrowRight size={20} />
            </button>
          <div 
            ref={sliderRef}
            className="flex overflow-x-auto gap-6 md:gap-8 pb-12 snap-x snap-mandatory scroll-smooth hide-scrollbar [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {filteredProducts.length > 0 ? filteredProducts.map((prod) => (
               <Link 
                to={`/product/${prod.id}`} 
                key={prod.id} 
                className="group bg-white rounded-[2.5rem] p-8 border border-gray-100 hover:shadow-2xl transition-all flex flex-col relative shrink-0 w-[280px] sm:w-[320px] lg:w-[calc(25%-1.5rem)] snap-start hover:-translate-y-2"
               >
                  {prod.salePrice > 0 && (
                    <span className="absolute top-6 left-6 bg-[#00B4D8] text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg z-10">Special Offer</span>
                  )}
                  <div className="h-56 flex items-center justify-center mb-8 bg-gray-50/50 rounded-[2rem] p-8">
                    {prod.images?.[0] ? (
                      <img loading="lazy" src={prod.images[0]} alt={prod.productName} className="max-h-full object-contain group-hover:scale-110 transition-all duration-500" />
                    ) : (
                      <Box size={48} className="text-gray-200" />
                    )}
                  </div>
                  <div className="text-[10px] font-black text-[#00B4D8] uppercase tracking-widest mb-2">{prod.brand}</div>
                  <h3 className="text-lg font-bold text-[#1A2B4C] mb-4 group-hover:text-[#00B4D8] transition-colors line-clamp-2 min-h-[3.5rem]">{prod.productName}</h3>
                  <div className="mt-auto flex items-baseline gap-3">
                    <span className="text-2xl font-black text-[#1A2B4C]">PKR { ((prod.salePrice || prod.regularPrice) ?? 0).toLocaleString() }</span>
                    {(prod.salePrice ?? 0) > 0 && <span className="text-sm text-gray-400 line-through font-medium">{(prod.regularPrice ?? 0).toLocaleString()}</span>}
                  </div>
               </Link>
            )) : (
              <div className="w-full py-16 text-center border-2 border-dashed border-gray-100 rounded-[3rem]">
                 <Box size={48} className="mx-auto text-gray-200 mb-4" />
                 <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No products found for this category.</p>
              </div>
            )}
          </div>
          </div>
          
          <div className="flex justify-center mt-4">
             <Link to="/shop" className="text-xs font-black text-[#1A2B4C] uppercase tracking-[0.2em] hover:text-[#00B4D8] transition-colors flex items-center gap-2 group mb-2 bg-gray-50 hover:bg-gray-100 px-6 py-3 rounded-full">
                Browse Full Catalog <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
             </Link>
          </div>
        </div>
      </motion.div>

      {/* Video Conferencing Slider */}
      {videoChunks.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-[1400px] mx-auto px-8 py-16 overflow-hidden"
        >
           <div className="text-center mb-10">
              <h2 className="text-4xl font-black text-[#1A2B4C] tracking-tight">Video Conferencing Solutions</h2>
              <p className="text-gray-500 mt-2">Empowering teams with seamless visual collaboration</p>
           </div>
           
           <div className="relative">
              <div 
                className="flex transition-transform duration-700 ease-in-out" 
                style={{ transform: `translateX(-${currentVideoSlide * 100}%)` }}
              >
                {videoChunks.map((chunk, slideIdx) => (
                   <div key={slideIdx} className="w-full flex-shrink-0">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:h-[600px] h-auto">
                         {/* Left Column (2 items) */}
                         <div className="col-span-1 flex flex-col gap-4 h-full">
                            {chunk[0] && (
                               <Link to={`/product/${chunk[0].id}`} className="flex-1 min-h-[250px] md:min-h-0 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all group flex flex-col items-center justify-center relative overflow-hidden">
                                  {chunk[0].images?.[0] && <img loading="lazy" src={chunk[0].images[0]} alt={chunk[0].productName} className="w-full h-32 md:flex-1 object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500 mb-4" />}
                                  <h3 className="text-center font-bold text-[#1A2B4C] group-hover:text-[#00B4D8] transition-colors line-clamp-2">{chunk[0].productName}</h3>
                                  <p className="text-[#00B4D8] font-black mt-2">Rs. {chunk[0].salePrice > 0 ? (chunk[0].salePrice ?? 0).toLocaleString() : (chunk[0].regularPrice ?? 0).toLocaleString()}</p>
                               </Link>
                            )}
                            {chunk[1] && (
                               <Link to={`/product/${chunk[1].id}`} className="flex-1 min-h-[250px] md:min-h-0 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all group flex flex-col items-center justify-center relative overflow-hidden">
                                  {chunk[1].images?.[0] && <img loading="lazy" src={chunk[1].images[0]} alt={chunk[1].productName} className="w-full h-32 md:flex-1 object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500 mb-4" />}
                                  <h3 className="text-center font-bold text-[#1A2B4C] group-hover:text-[#00B4D8] transition-colors line-clamp-2">{chunk[1].productName}</h3>
                                  <p className="text-[#00B4D8] font-black mt-2">Rs. {chunk[1].salePrice > 0 ? (chunk[1].salePrice ?? 0).toLocaleString() : (chunk[1].regularPrice ?? 0).toLocaleString()}</p>
                               </Link>
                            )}
                         </div>
                         
                         {/* Middle Column (1 large item) */}
                         <div className="col-span-1 md:col-span-2 h-full">
                            {chunk[2] && (
                               <Link to={`/product/${chunk[2].id}`} className="w-full h-full min-h-[350px] md:min-h-0 bg-transparent border-0 rounded-[2.5rem] p-10 group flex flex-col items-center justify-center relative overflow-hidden text-center">
                                  {chunk[2].images?.[0] && <img loading="lazy" src={chunk[2].images[0]} alt={chunk[2].productName} className="w-full h-48 md:flex-1 object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700 relative z-20 mb-8" />}
                                  <div className="relative z-20">
                                     <span className="text-[#00B4D8] font-black uppercase tracking-widest text-xs mb-2 block">Featured</span>
                                     <h3 className="text-2xl md:text-3xl font-black text-[#1A2B4C] group-hover:text-[#00B4D8] transition-colors line-clamp-2">{chunk[2].productName}</h3>
                                     <p className="text-[#00B4D8] text-xl font-black mt-2">Rs. {chunk[2].salePrice > 0 ? (chunk[2].salePrice ?? 0).toLocaleString() : (chunk[2].regularPrice ?? 0).toLocaleString()}</p>
                                     <p className="text-gray-500 mt-4 line-clamp-2 max-w-md mx-auto text-sm">{chunk[2].shortDescription?.replace(/<[^>]*>?/gm, '') || 'Professional video conferencing solution.'}</p>
                                  </div>
                               </Link>
                            )}
                         </div>
                         
                         {/* Right Column (2 items) */}
                         <div className="col-span-1 flex flex-col gap-4 h-full">
                            {chunk[3] && (
                               <Link to={`/product/${chunk[3].id}`} className="flex-1 min-h-[250px] md:min-h-0 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all group flex flex-col items-center justify-center relative overflow-hidden">
                                  {chunk[3].images?.[0] && <img loading="lazy" src={chunk[3].images[0]} alt={chunk[3].productName} className="w-full h-32 md:flex-1 object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500 mb-4" />}
                                  <h3 className="text-center font-bold text-[#1A2B4C] group-hover:text-[#00B4D8] transition-colors line-clamp-2">{chunk[3].productName}</h3>
                                  <p className="text-[#00B4D8] font-black mt-2">Rs. {chunk[3].salePrice > 0 ? (chunk[3].salePrice ?? 0).toLocaleString() : (chunk[3].regularPrice ?? 0).toLocaleString()}</p>
                               </Link>
                            )}
                            {chunk[4] && (
                               <Link to={`/product/${chunk[4].id}`} className="flex-1 min-h-[250px] md:min-h-0 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all group flex flex-col items-center justify-center relative overflow-hidden">
                                  {chunk[4].images?.[0] && <img loading="lazy" src={chunk[4].images[0]} alt={chunk[4].productName} className="w-full h-32 md:flex-1 object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500 mb-4" />}
                                  <h3 className="text-center font-bold text-[#1A2B4C] group-hover:text-[#00B4D8] transition-colors line-clamp-2">{chunk[4].productName}</h3>
                                  <p className="text-[#00B4D8] font-black mt-2">Rs. {chunk[4].salePrice > 0 ? (chunk[4].salePrice ?? 0).toLocaleString() : (chunk[4].regularPrice ?? 0).toLocaleString()}</p>
                               </Link>
                            )}
                         </div>
                      </div>
                   </div>
                ))}
              </div>
              
              {/* Slider Dots */}
              {videoChunks.length > 1 && (
                 <div className="flex justify-center items-center gap-3 mt-8">
                    {videoChunks.map((_, idx) => (
                       <button
                          key={idx}
                          onClick={() => setCurrentVideoSlide(idx)}
                          className={`h-2 rounded-full transition-all duration-300 ${currentVideoSlide === idx ? 'w-8 bg-[#00B4D8]' : 'w-2 bg-gray-300 hover:bg-gray-400'}`}
                          aria-label={`Go to slide ${idx + 1}`}
                       />
                    ))}
                 </div>
              )}
           </div>
        </motion.div>
      )}

      {/* Setup Wizard Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="bg-[#F8F9FA] pb-16"
      >
        <div className="max-w-[1400px] mx-auto px-8">
          <div className="bg-gradient-to-r from-[#1A2B4C] to-[#0A192F] rounded-[3.5rem] p-12 md:p-16 text-white relative overflow-hidden shadow-2xl border border-gray-800">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#00B4D8]/20 to-transparent rounded-full translate-x-32 -translate-y-32"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-[#00B4D8]/10 to-transparent rounded-full -translate-x-32 translate-y-32"></div>

            <div className="relative z-10 max-w-5xl flex flex-col md:flex-row items-start md:items-center justify-between gap-10">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 bg-[#00B4D8]/20 text-[#00B4D8] px-4 py-2 rounded-full">
                  <Sparkles size={12} className="animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-white">Smart Configurator</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
                  Unsure of Room Scale & VoIP Requirements?
                </h2>
                <p className="text-gray-300 font-medium text-xs md:text-sm leading-relaxed max-w-2xl">
                  Take our interactive 3-question hardware wizard. We'll instantly size up your space and recommend the perfect pre-configured starter bundle of certified IP phones and video bars in under 60 seconds.
                </p>
              </div>

              <div className="shrink-0">
                <Link
                  to="/setup-wizard"
                  className="bg-[#00B4D8] hover:bg-white hover:text-[#1A2B4C] text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-lg active:scale-98 flex items-center gap-2 group whitespace-nowrap"
                >
                  Launch Setup Configurator <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Trust & Services */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="bg-[#1A2B4C] py-16 text-white overflow-hidden relative"
      >
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
                         <h4 className="font-bold text-lg mb-2">Certified Tech Support</h4>
                         <p className="text-gray-400 text-sm leading-relaxed">Our engineers hold certifications from Cisco, Poly, and Yealink, ensuring you get expert help when you need it.</p>
                      </div>
                   </div>
                   <div className="flex gap-6">
                      <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 border border-white/10">
                         <Box className="text-[#00B4D8]" size={28} />
                      </div>
                      <div>
                         <h4 className="font-bold text-lg mb-2">Same Day Nationwide Shipping</h4>
                         <p className="text-gray-400 text-sm leading-relaxed">We maintain local stock in Lahore for rapid delivery across Pakistan, including Karachi, Islamabad, and beyond.</p>
                      </div>
                   </div>
                </div>
             </div>
             <div className="bg-white/5 border border-white/10 rounded-[3rem] p-12 backdrop-blur-sm">
                <div className="grid grid-cols-2 gap-8">
                   <div className="text-center p-6 border border-white/10 rounded-3xl">
                      <div className="text-4xl font-black text-[#00B4D8] mb-2">{content?.stats?.yearsExperience || 15}+</div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">Years Experience</div>
                   </div>
                   <div className="text-center p-6 border border-white/10 rounded-3xl">
                      <div className="text-4xl font-black text-[#00B4D8] mb-2">{content?.stats?.projectsCompleted || '5K'}+</div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">Deployments</div>
                   </div>
                   <div className="text-center p-6 border border-white/10 rounded-3xl">
                      <div className="text-4xl font-black text-[#00B4D8] mb-2">{content?.stats?.happyClients || '100%'}</div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">Satisfied Clients</div>
                   </div>
                   <div className="text-center p-6 border border-white/10 rounded-3xl">
                      <div className="text-4xl font-black text-[#00B4D8] mb-2">24/7</div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">Remote Support</div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </motion.div>
      <TopBrands />
    </div>
  );
}
