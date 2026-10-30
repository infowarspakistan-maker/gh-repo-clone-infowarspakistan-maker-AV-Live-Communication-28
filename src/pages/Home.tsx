import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Phone, Video, Headphones, ShieldCheck, Box, Mic, Loader2, Sparkles, Projector, Heart } from 'lucide-react';
import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Product, Service,
  HomepageData, GeneralSettings, ContactData, getGeneralSettings, getContactData, 
  subscribeToHomepage, 
  subscribeToProducts,
  subscribeToServices
} from '../lib/firebase/firestore-helpers';
import { SEO } from '../components/SEO';

import { TopBrands, brands } from '../components/TopBrands';

import { StructuredData } from "../components/StructuredData";
import { FALLBACK_SERVICES_CATALOG } from "../lib/services-catalog";
import { getCanonicalProductSlug } from "../lib/gmc-feed";

const DEFAULT_HERO_SLIDES = [
  {
    id: 'slide-1',
    title: 'Video Conference | Event Management | AV Live',
    subtitle: 'Pakistan’s premier Video Conference & Event Management company — certified Poly, Logitech & Cisco boardroom systems and immersive 3D hologram corporate events.',
    ctaText: 'Explore Catalog',
    ctaLink: '/shop',
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1920&q=80',
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
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1920&q=80',
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
    imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1920&q=80',
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
    backgroundImageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1920&q=80',
    isActive: true,
  },
};

const DEFAULT_INITIAL_PRODUCTS: Product[] = [
  {
    id: 'polycom-realpresence-group-500-pakistan',
    slug: 'polycom-realpresence-group-500-pakistan',
    productName: 'Polycom RealPresence Group 500 (EagleEye IV 12x)',
    sku: '7200-64550-001',
    brand: 'Poly',
    regularPrice: 980000,
    salePrice: 850000,
    stockQuantity: 8,
    lowStockThreshold: 2,
    images: ['https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80'],
    categoryIds: ['cat-video'],
    categorySlugs: ['video-conferencing'],
    shortDescription: 'Enterprise multipoint H.323/SIP video conferencing codec with EagleEye IV 12x optical PTZ camera for large boardrooms in Pakistan.',
    description: 'Enterprise Polycom Group 500 video conferencing system.',
    variations: [],
    isActive: true,
    isFeatured: true,
  },
  {
    id: 'poly-studio-x72-pakistan',
    slug: 'poly-studio-x72-pakistan',
    productName: 'Poly Studio X70 / X72 All-in-One 4K Video Bar',
    sku: 'A4LZ8AA',
    brand: 'Poly',
    regularPrice: 2300000,
    salePrice: 2000000,
    stockQuantity: 5,
    lowStockThreshold: 2,
    images: ['https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80'],
    categoryIds: ['cat-video'],
    categorySlugs: ['video-conferencing'],
    shortDescription: 'Dual 4K 20MP all-in-one AI video bar with Poly DirectorAI speaker framing for large Zoom and Microsoft Teams boardrooms.',
    description: 'Flagship Poly X70 / X72 4K video bar.',
    variations: [],
    isActive: true,
    isFeatured: true,
  },
  {
    id: 'logitech-rally-bar-pakistan',
    slug: 'logitech-rally-bar-pakistan',
    productName: 'Logitech Rally Bar',
    sku: '960-001308',
    brand: 'Logitech',
    regularPrice: 517500,
    salePrice: 450000,
    stockQuantity: 8,
    lowStockThreshold: 2,
    images: ['https://images.unsplash.com/photo-1611095773767-114946654271?w=800&q=80'],
    categoryIds: ['cat-video'],
    categorySlugs: ['video-conferencing'],
    shortDescription: 'All-in-one 4K video conferencing bar with motorized PTZ lens, RightSight AI framing, and native Zoom & Teams support.',
    description: 'Logitech Rally Bar for medium to large rooms.',
    variations: [],
    isActive: true,
    isFeatured: true,
  },
  {
    id: 'cisco-room-kit-plus-pakistan',
    slug: 'cisco-room-kit-plus-pakistan',
    productName: 'Cisco Room Kit Plus Video Conferencing System',
    sku: 'CS-KITPLPTZ4K-K9',
    brand: 'Cisco',
    regularPrice: 3680000,
    salePrice: 3200000,
    stockQuantity: 5,
    lowStockThreshold: 2,
    images: ['https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80'],
    categoryIds: ['cat-video'],
    categorySlugs: ['video-conferencing'],
    shortDescription: 'Cisco quad-camera 4K video bar and Codec Plus bundle for large enterprise boardrooms up to 14 seats.',
    description: 'Cisco Room Kit Plus enterprise telepresence system.',
    variations: [],
    isActive: true,
    isFeatured: true,
  },
  {
    id: 'poly-studio-x52-pakistan',
    slug: 'poly-studio-x52-pakistan',
    productName: 'Poly Studio X52 All-in-One Video Bar',
    sku: '7200-87620-001',
    brand: 'Poly',
    regularPrice: 1610000,
    salePrice: 1400000,
    stockQuantity: 5,
    lowStockThreshold: 2,
    images: ['https://images.unsplash.com/photo-1611095773767-114946654271?w=800&q=80'],
    categoryIds: ['cat-video'],
    categorySlugs: ['video-conferencing'],
    shortDescription: 'All-in-one 4K 20MP video bar with 95° FOV, DirectorAI framing, and native Zoom/Teams apps for medium rooms.',
    description: 'Poly Studio X52 video bar.',
    variations: [],
    isActive: true,
    isFeatured: true,
  },
  {
    id: 'poly-studio-usb-video-bar-pakistan',
    slug: 'poly-studio-usb-video-bar-pakistan',
    productName: 'Poly Studio USB Video Bar',
    sku: '7200-85830-012',
    brand: 'Poly',
    regularPrice: 212750,
    salePrice: 185000,
    stockQuantity: 10,
    lowStockThreshold: 2,
    images: ['https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80'],
    categoryIds: ['cat-video'],
    categorySlugs: ['video-conferencing'],
    shortDescription: 'Plug-and-play 4K USB video bar with Poly DirectorAI speaker tracking, Acoustic Fence, and NoiseBlockAI.',
    description: 'Poly Studio USB video bar.',
    variations: [],
    isActive: true,
    isFeatured: true,
  },
];

export function Home() {
  const [content, setContent] = useState<HomepageData>(DEFAULT_HOMEPAGE_DATA);
  const [settings, setSettings] = useState<GeneralSettings | null>(null);
  const [contact, setContact] = useState<ContactData | null>(null);
  const [products, setProducts] = useState<Product[]>(DEFAULT_INITIAL_PRODUCTS);
  const [services, setServices] = useState<Service[]>(FALLBACK_SERVICES_CATALOG as unknown as Service[]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoplayPaused, setIsAutoplayPaused] = useState(false);
  const [currentVideoSlide, setCurrentVideoSlide] = useState(0);
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
    // Listen for homepage content without blocking initial paint
    getGeneralSettings().then(setSettings).catch(console.error);
    getContactData().then(setContact).catch(console.error);
    const unsubscribeHome = subscribeToHomepage((data) => {
      if (data && data.heroSlides && data.heroSlides.length > 0) {
        setContent(data);
      }
    });

    // Listen for products
    const unsubscribeProducts = subscribeToProducts((data) => {
      if (data && data.length > 0) {
        setProducts(data);
      }
    }, { isActive: true });

    // Listen for services
    const unsubscribeServices = subscribeToServices((data) => {
      if (data && data.length > 0) {
        setServices(data);
      }
    });

    return () => {
      unsubscribeHome();
      unsubscribeProducts();
      unsubscribeServices();
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

  const featuredCarouselProducts = filteredProducts.slice(0, 12);

  const videoConferencingProducts = products.filter(p => p.categoryIds?.includes('cat-video') || (Array.isArray(p.categorySlugs) ? p.categorySlugs : typeof p.categorySlugs === 'string' ? [p.categorySlugs] : []).includes('video-conferencing'));
  const videoChunks: Product[][] = [];
  for (let i = 0; i < Math.min(videoConferencingProducts.length, 15); i += 5) {
    videoChunks.push(videoConferencingProducts.slice(i, i + 5));
  }

  useEffect(() => {
    if (videoChunks.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentVideoSlide(prev => (prev + 1) % videoChunks.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [videoChunks.length]);

  const slides = content?.heroSlides?.length ? content.heroSlides : DEFAULT_HERO_SLIDES;

  return (
    <div className="flex-1 w-full bg-[#f8f9fa]">
      <SEO 
        title="Video Conference | Event Management | AV Live"
        description="AV Live is Pakistan's premier Video Conference & Event Management company. Shop Poly, Logitech & Cisco AV systems or book 3D hologram & corporate events."
        keywords="Video Conference, Event Management, AV Live, Video Conference in Pakistan, Event Management Company Pakistan, Polycom Group 500, Poly X70, Logitech Rally Bar, Corporate Event Management, 3D Hologram Display, Hybrid Events"
        url="https://avlive.com.pk"
        image={settings?.ogImage || "https://avlive.com.pk/og-image.jpg"}
        imageAlt="Video Conference | Event Management | AV Live"
        schema={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": ["Organization", "Corporation"],
              "@id": "https://avlive.com.pk/#organization",
              "name": settings?.siteName || "AV Live Communications",
              "legalName": "AV Live Communications (Pvt) Ltd",
              "url": "https://avlive.com.pk",
              "logo": "https://avlive.com.pk/logo.png",
              "description": settings?.tagline || "Pakistan's premier enterprise Video Conference in Pakistan, Polycom Group 500, Poly X70, Corporate event management, hybrid event, and 3D Hologram Display provider.",
              "areaServed": [
                { "@type": "Country", "name": "Pakistan" },
                { "@type": "City", "name": "Lahore" },
                { "@type": "City", "name": "Karachi" },
                { "@type": "City", "name": "Islamabad" }
              ],
              "knowsAbout": [
                "Video Conference in Pakistan",
                "Video conference",
                "Polycom Group 500",
                "Poly X70",
                "Event management",
                "Corporate event management",
                "hybrid event",
                "Hologram Display",
                "events",
                "Cisco TelePresence",
                "Yealink MeetingBar",
                "Logitech Room Solutions",
                "IP PBX & VoIP Telephony"
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
              "image": "https://avlive.com.pk/logo.png",
              "telephone": contact?.phone || settings?.phone || "+92-321-425-6263",
              "priceRange": "PKR 50,000 - 50,000,000",
              "currenciesAccepted": "PKR",
              "paymentAccepted": "Bank Transfer, Pay Order, Corporate Cheque, Credit Card",
              "url": "https://avlive.com.pk",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": contact?.address || settings?.address || "Johar Town Block N",
                "addressLocality": "Lahore",
                "addressRegion": "Punjab",
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
              "telephone": "+92-21-35890123",
              "priceRange": "PKR 50,000 - 50,000,000",
              "currenciesAccepted": "PKR",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Sharah-e-Faisal, PECHS Block 6",
                "addressLocality": "Karachi",
                "addressRegion": "Sindh",
                "addressCountry": "PK"
              }
            },
            {
              "@type": "LocalBusiness",
              "@id": "https://avlive.com.pk/#islamabad-branch",
              "parentOrganization": { "@id": "https://avlive.com.pk/#organization" },
              "name": `${settings?.siteName || "AV Live Communications"} - Islamabad & Rawalpindi Office`,
              "telephone": "+92-51-2890124",
              "priceRange": "PKR 50,000 - 50,000,000",
              "currenciesAccepted": "PKR",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Blue Area, Jinnah Avenue",
                "addressLocality": "Islamabad",
                "addressRegion": "ICT",
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
                    "text": "For large corporate boardrooms in Pakistan, the Poly Studio X70 (Poly X70) and Polycom RealPresence Group 500 (Polycom Group 500) are the industry standards. The Poly X70 delivers dual 4K 20MP sensors with Poly DirectorAI speaker framing and native Zoom/Microsoft Teams Rooms support, while the Polycom Group 500 provides dual-display 1080p60 H.323/SIP interoperability for enterprise and government networks across Lahore, Karachi, and Islamabad."
                  }
                },
                {
                  "@type": "Question",
                  "name": "What is the difference between Polycom Group 500 and Poly X70 for video conference rooms?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "The Polycom Group 500 (SKU 7200-64550-001) is a modular H.323/SIP codec paired with the EagleEye IV 12x optical PTZ camera, ideal for standards-based multipoint telepresence. The Poly Studio X70 (Poly X70) is an all-in-one 4K AI video bar with native cloud app support for Zoom Rooms and Microsoft Teams Rooms, NoiseBlockAI, and Acoustic Fence technology."
                  }
                },
                {
                  "@type": "Question",
                  "name": "How does AV Live handle Corporate event management, hybrid events, and Hologram Display production in Pakistan?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "AV Live provides turnkey Corporate event management and hybrid event production across Lahore, Karachi, and Islamabad. Our engineering teams deploy 3D Hologram Display stages, architectural projection mapping, SMD LED walls, line-array concert sound, and multi-camera broadcast streaming that connects live stage events directly with remote Zoom, Webex, and Microsoft Teams audiences."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Does AV Live provide onsite installation and warranty support across Pakistan?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes. AV Live Communications provides certified engineering teams for onsite structural installation, acoustic calibration, and AMC nationwide across Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, and Multan."
                  }
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
                initial={currentSlide === 0 ? false : { opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="absolute inset-0 w-full h-full"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#1A2B4C]/95 via-[#1A2B4C]/70 to-transparent z-10"></div>
                <img 
                  loading={currentSlide === 0 ? "eager" : "lazy"}
                  fetchPriority={currentSlide === 0 ? "high" : "auto"}
                  decoding="async"
                  width={1920}
                  height={600}
                  src={slides[currentSlide].imageUrl} 
                  alt={slides[currentSlide].title} 
                  className="absolute inset-0 w-full h-full object-cover" 
                />
              </motion.div>

              {/* Slide text content container */}
              <div className="absolute inset-0 z-20 flex flex-col items-start justify-center text-left px-8 md:px-20 max-w-[1400px] mx-auto">
                 <div className="bg-[#00B4D8] px-4 py-1.5 rounded-lg shadow-lg mb-6 inline-flex items-center gap-2">
                    <span className="font-black text-[#1A2B4C] uppercase tracking-widest text-[10px]">New Innovation</span>
                 </div>

                 <h1 className="text-5xl md:text-7xl font-black text-white mb-6 drop-shadow-2xl leading-tight max-w-3xl font-sans">
                   {slides[currentSlide].title}
                 </h1>

                 <div 
                   className="text-xl md:text-2xl text-white mb-10 max-w-2xl drop-shadow-md font-semibold leading-[1.6] prose prose-p:m-0 prose-invert" 
                   dangerouslySetInnerHTML={{ __html: slides[currentSlide].subtitle || '' }} 
                 />
                 
                 <div>
                   <Link 
                    to={slides[currentSlide].ctaLink || '/shop'} 
                    className="bg-white text-[#1A2B4C] px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-[#00B4D8] hover:text-[#1A2B4C] transition-colors shadow-2xl flex items-center gap-3 group"
                   >
                     {slides[currentSlide].ctaText || 'Explore Now'}
                     <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                   </Link>
                 </div>
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

        {/* Pagination Dots with GPU-Composited Active Progress Fill */}
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
                  <div className={`h-2 w-10 rounded-full overflow-hidden relative border transition-colors duration-300 ${isActive ? 'bg-white/10 border-white/30' : 'bg-white/25 border-transparent hover:bg-white/40'}`}>
                    {isActive && (
                      <motion.div 
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={isAutoplayPaused ? { duration: 0 } : { duration: 8, ease: "linear" }}
                        className="absolute inset-0 bg-[#00B4D8] origin-left"
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
                  <span className="text-[10px] font-black text-center leading-tight uppercase tracking-[0.2em] text-slate-600 group-hover:text-[#1A2B4C] transition-colors">{cat.name}</span>
               </Link>
             ))}
          </div>
        </div>
      </motion.div>

      {/* Tabbed Intent Split */}
      <div className="w-full py-16 bg-white" x-data="{ activeTab: 'solutions' }">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="flex justify-center gap-6 mb-12">
            <button 
              onClick={() => setActiveFilter('solutions')}
              className={`px-8 py-3 rounded-full font-black uppercase tracking-widest text-sm transition-all ${activeFilter === 'solutions' ? 'bg-[#1A2B4C] text-white shadow-xl' : 'bg-gray-100 text-slate-700 hover:bg-gray-200'}`}
            >
              Event Solutions
            </button>
            <button 
              onClick={() => setActiveFilter('shop')}
              className={`px-8 py-3 rounded-full font-black uppercase tracking-widest text-sm transition-all ${activeFilter === 'shop' ? 'bg-[#1A2B4C] text-white shadow-xl' : 'bg-gray-100 text-slate-700 hover:bg-gray-200'}`}
            >
              Professional AV Shop
            </button>
          </div>

          <div className="min-h-[400px]">
            {activeFilter === 'solutions' ? (
              <div className="grid md:grid-cols-3 gap-8">
                {services.filter(s => s.isActive).slice(0, 3).map((s) => (
                  <div key={s.id} className="bg-gray-50 rounded-3xl p-8 border border-gray-100 hover:shadow-xl transition-all">
                    <img src={s.imageUrl} alt={s.title} className="w-full h-48 object-cover rounded-2xl mb-6" />
                    <h3 className="text-xl font-black text-[#1A2B4C] mb-4">{s.title}</h3>
                    <p className="text-gray-600 mb-6 line-clamp-3">{s.description.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ')}</p>
                    <Link to={`/services/${s.slug}`} className="text-[#00B4D8] font-bold text-sm flex items-center gap-2">Learn More <ArrowRight size={16} /></Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-8">
                {products.filter(p => p.isFeatured).slice(0, 3).map((p) => (
                  <div key={p.id} className="bg-white rounded-3xl p-6 border border-gray-100 hover:shadow-xl transition-all">
                    <img src={p.images?.[0]} alt={p.productName} className="w-full h-48 object-cover rounded-2xl mb-6" />
                    <h3 className="text-lg font-bold text-[#1A2B4C] mb-2">{p.productName}</h3>
                    <Link to={`/product/${getCanonicalProductSlug(p, p.id)}`} className="text-[#00B4D8] font-bold text-sm">View Product</Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

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
          <span className="text-[#1A2B4C] font-black uppercase tracking-[0.2em] bg-[#00B4D8] px-4 rounded-full shadow-lg flex items-center" style={{ height: '47px' }}>Featured Brands</span>
        </div>
        <div className="flex whitespace-nowrap animate-marquee hover:pause w-max items-center gap-16 px-8 ml-64">
          {Array(4).fill(brands).flat().map((brand, idx) => (
             <Link to={`/brands/${brand.id}`} key={`${brand.id}-${idx}`} aria-label={`Browse ${brand.name || brand.id} hardware`} className="inline-flex items-center gap-4 group opacity-50 hover:opacity-100 transition-opacity grayscale hover:grayscale-0">
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
              className={`px-6 py-3 rounded-[1rem] text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-colors border ${activeFilter === 'All' ? 'bg-[#1A2B4C] text-white border-[#1A2B4C]' : 'bg-white text-slate-600 border-gray-200 hover:border-[#1A2B4C] hover:text-[#1A2B4C]'}`}
            >
              All Models
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveFilter(cat.id)}
                className={`px-6 py-3 rounded-[1rem] text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-colors flex items-center gap-2 border ${activeFilter === cat.id ? 'bg-[#1A2B4C] text-white border-[#1A2B4C]' : 'bg-white text-slate-600 border-gray-200 hover:border-[#1A2B4C] hover:text-[#1A2B4C]'}`}
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
              className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover/slider:opacity-100 p-4 bg-white border border-gray-100 text-[#1A2B4C] rounded-full hover:bg-[#00B4D8] hover:border-[#00B4D8] hover:text-[#1A2B4C] transition-all shadow-xl hidden md:block"
            >
              <ArrowLeft size={20} />
            </button>
            <button 
              onClick={() => scrollSlider('right')} 
              aria-label="Scroll featured products right"
              className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover/slider:opacity-100 p-4 bg-white border border-gray-100 text-[#1A2B4C] rounded-full hover:bg-[#00B4D8] hover:border-[#00B4D8] hover:text-[#1A2B4C] transition-all shadow-xl hidden md:block"
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
                       const firstImage = images[0] || 'https://placehold.co/600x600?text=No+Image';
                       const secondImage = images[1];
                       const showSecondImage = hoveredProductId === prod.id && Boolean(secondImage && secondImage !== firstImage);
                       return (
                         <>
                           <img 
                             loading="lazy" 
                             decoding="async"
                             width={400}
                             height={300}
                             src={firstImage} 
                             alt={prod.productName} 
                             className={`absolute inset-0 w-full h-full object-cover mix-blend-multiply transition-opacity duration-500 ease-in-out ${showSecondImage ? 'opacity-0' : 'opacity-100'}`}
                           />
                           {showSecondImage && (
                             <img 
                               loading="lazy" 
                               decoding="async"
                               width={400}
                               height={300}
                               src={secondImage} 
                               alt={`${prod.productName} alternate view`} 
                               className="absolute inset-0 w-full h-full object-cover mix-blend-multiply transition-opacity duration-500 ease-in-out opacity-100 scale-105"
                             />
                           )}
                         </>
                       );
                    })()}
                    
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      aria-label={`Save ${prod.productName} to wishlist`}
                      className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/70 backdrop-blur-sm flex items-center justify-center text-[#1A2B4C] hover:bg-[#1A2B4C] hover:text-white transition-colors z-10 shadow-sm"
                    >
                      <Heart size={14} />
                    </button>

                    {prod.salePrice > 0 && (
                      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm text-[#1A2B4C] text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md shadow-sm z-10">
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
                         <span className="text-[9px] text-slate-600 font-bold uppercase tracking-wider border border-gray-200 px-2 py-0.5 rounded-sm">
                           {prod.brand}
                         </span>
                       )}
                       {prod.sku && (
                         <span className="text-[9px] text-slate-600 font-bold uppercase tracking-wider border border-gray-200 px-2 py-0.5 rounded-sm">
                           {prod.sku}
                         </span>
                       )}
                    </div>

                    <div className="text-slate-600 text-xs font-medium leading-relaxed line-clamp-2 mb-6" dangerouslySetInnerHTML={{ __html: prod.shortDescription || 'Professional unified communications equipment.' }} />
                    
                    <div className="mt-auto flex items-end justify-between gap-4 pt-4 border-t border-gray-50">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Price</span>
                        <div className="flex items-baseline gap-2">
                          <span className="font-black text-xl text-[#1A2B4C]">PKR { ((prod.salePrice || prod.regularPrice) ?? 0).toLocaleString() }</span>
                          {(prod.salePrice ?? 0) > 0 && (
                            <span className="text-[10px] text-slate-500 line-through font-bold">{(prod.regularPrice ?? 0).toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                      <span className="bg-[#1A2B4C] text-white px-4 py-2.5 rounded-lg text-xs font-bold group-hover:bg-[#00B4D8] group-hover:text-[#1A2B4C] transition-all shadow-md shrink-0 whitespace-nowrap">
                         View Details
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
                               <Link to={`/product/${getCanonicalProductSlug(chunk[0], chunk[0].id)}`} className="flex-1 min-h-[250px] md:min-h-0 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all group flex flex-col items-center justify-center relative overflow-hidden">
                                  {chunk[0].images?.[0] && <img loading="lazy" src={chunk[0].images[0]} alt={chunk[0].productName} className="w-full h-32 md:flex-1 object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500 mb-4" />}
                                  <h3 className="text-center font-bold text-[#1A2B4C] group-hover:text-[#00B4D8] transition-colors line-clamp-2">{chunk[0].productName}</h3>
                                  <p className="text-[#00B4D8] font-black mt-2">Rs. {chunk[0].salePrice > 0 ? (chunk[0].salePrice ?? 0).toLocaleString() : (chunk[0].regularPrice ?? 0).toLocaleString()}</p>
                               </Link>
                            )}
                            {chunk[1] && (
                               <Link to={`/product/${getCanonicalProductSlug(chunk[1], chunk[1].id)}`} className="flex-1 min-h-[250px] md:min-h-0 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all group flex flex-col items-center justify-center relative overflow-hidden">
                                  {chunk[1].images?.[0] && <img loading="lazy" src={chunk[1].images[0]} alt={chunk[1].productName} className="w-full h-32 md:flex-1 object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500 mb-4" />}
                                  <h3 className="text-center font-bold text-[#1A2B4C] group-hover:text-[#00B4D8] transition-colors line-clamp-2">{chunk[1].productName}</h3>
                                  <p className="text-[#00B4D8] font-black mt-2">Rs. {chunk[1].salePrice > 0 ? (chunk[1].salePrice ?? 0).toLocaleString() : (chunk[1].regularPrice ?? 0).toLocaleString()}</p>
                               </Link>
                            )}
                         </div>
                         
                         {/* Middle Column (1 large item) */}
                         <div className="col-span-1 md:col-span-2 h-full">
                            {chunk[2] && (
                               <Link to={`/product/${getCanonicalProductSlug(chunk[2], chunk[2].id)}`} className="w-full h-full min-h-[350px] md:min-h-0 bg-transparent border-0 rounded-[2.5rem] p-10 group flex flex-col items-center justify-center relative overflow-hidden text-center">
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
                               <Link to={`/product/${getCanonicalProductSlug(chunk[3], chunk[3].id)}`} className="flex-1 min-h-[250px] md:min-h-0 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all group flex flex-col items-center justify-center relative overflow-hidden">
                                  {chunk[3].images?.[0] && <img loading="lazy" src={chunk[3].images[0]} alt={chunk[3].productName} className="w-full h-32 md:flex-1 object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500 mb-4" />}
                                  <h3 className="text-center font-bold text-[#1A2B4C] group-hover:text-[#00B4D8] transition-colors line-clamp-2">{chunk[3].productName}</h3>
                                  <p className="text-[#00B4D8] font-black mt-2">Rs. {chunk[3].salePrice > 0 ? (chunk[3].salePrice ?? 0).toLocaleString() : (chunk[3].regularPrice ?? 0).toLocaleString()}</p>
                               </Link>
                            )}
                            {chunk[4] && (
                               <Link to={`/product/${getCanonicalProductSlug(chunk[4], chunk[4].id)}`} className="flex-1 min-h-[250px] md:min-h-0 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all group flex flex-col items-center justify-center relative overflow-hidden">
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
                  className="bg-[#00B4D8] hover:bg-white text-[#1A2B4C] px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-lg active:scale-98 flex items-center gap-2 group whitespace-nowrap"
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
                         <h3 className="font-bold text-lg mb-2">Certified Tech Support</h3>
                         <p className="text-slate-300 text-sm leading-relaxed">Our engineers hold certifications from Cisco, Poly, and Yealink, ensuring you get expert help when you need it.</p>
                      </div>
                   </div>
                   <div className="flex gap-6">
                      <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 border border-white/10">
                         <Box className="text-[#00B4D8]" size={28} />
                      </div>
                      <div>
                         <h3 className="font-bold text-lg mb-2">Same Day Nationwide Shipping</h3>
                         <p className="text-slate-300 text-sm leading-relaxed">We maintain local stock in Lahore for rapid delivery across Pakistan, including Karachi, Islamabad, and beyond.</p>
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
      </motion.div>

      {/* Answer Engine Optimization (AEO) Knowledge & FAQ Section */}
      <section className="bg-white py-20 border-t border-gray-100">
        <div className="max-w-[1400px] mx-auto px-8">
          <div className="max-w-3xl mb-14">
            <span className="text-[#00B4D8] text-xs font-black uppercase tracking-[0.3em] mb-3 block">
              Enterprise AV & Event Intelligence
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-[#1A2B4C] tracking-tight mb-4">
              Video Conference in Pakistan, Corporate Event Management & 3D Hologram Solutions
            </h2>
            <p className="text-gray-600 text-sm md:text-base leading-relaxed">
              Direct engineering answers on deploying enterprise <strong>Video conference</strong> systems—including the flagship <strong>Polycom Group 500</strong> and <strong>Poly X70</strong>—alongside turnkey <strong>Corporate event management</strong>, <strong>hybrid event</strong> broadcasting, and <strong>Hologram Display</strong> stages across Pakistan.
            </p>
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
                For medium-to-large corporate boardrooms and training halls in Pakistan, AV Live recommends the <strong>Poly Studio X70 (Poly X70)</strong> and the <strong>Polycom RealPresence Group 500 (Polycom Group 500)</strong>. Both systems deliver ultra-low latency 4K/1080p60 video, NoiseBlockAI acoustic filtering, and full compatibility with Zoom Rooms, Microsoft Teams Rooms, and standards-based SIP/H.323 networks.
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
                Corporate Event Management & Hybrid Events
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
              <span className="text-[10px] font-black uppercase tracking-widest text-[#00B4D8] bg-[#00B4D8]/10 px-3 py-1 rounded-full">
                3D Hologram Display & Events
              </span>
              <h3 className="text-xl font-black text-[#1A2B4C] mt-4 mb-3">
                Where can we rent or install a 3D Hologram Display for events in Pakistan?
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                AV Live engineers custom <strong>Hologram Display</strong> stages, 3D holographic fan arrays, and high-lumen optical Pepper's Ghost mesh projections for product launches, expos, and flagship corporate <strong>events</strong> across Pakistan. Our creative studio builds bespoke 3D holographic animations and handles complete on-site rigging and lighting synchronization.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link to="/3d-hologram" className="text-xs font-black text-[#1A2B4C] hover:text-[#00B4D8] uppercase tracking-wider flex items-center gap-1">
                  View Hologram Display Solutions <ArrowRight size={14} />
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      <TopBrands />
    </div>
  );
}
