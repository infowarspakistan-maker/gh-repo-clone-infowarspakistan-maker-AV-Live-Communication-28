import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Box, Settings, Mic, Video, ShieldCheck, Speaker, Loader2, Zap, LayoutGrid, Layers, Heart } from 'lucide-react';
import { subscribeToCategories, subscribeToProducts, Product, Category as CategoryType } from '../lib/firebase/firestore-helpers';
import {
  getCanonicalProductSlug,
  resolveProductPricing,
  PRODUCT_GMC_METADATA,
  buildFallbackProductFromGmcMeta,
} from '../lib/gmc-feed';
import { EXCLUDED_CATEGORY_SLUGS, NON_PRODUCT_CATEGORY_REDIRECTS } from '../lib/sitemap-generator';
import { addToCart } from '../lib/cart';
import { SEO } from '../components/SEO';
import { Breadcrumbs } from '../components/Breadcrumbs';

const FALLBACK_PRODUCT_CATEGORIES: Record<
  string,
  { name: string; description: string; productSlugs: string[] }
> = {
  'video-conferencing': {
    name: 'Video Conferencing Systems',
    description:
      'Enterprise Video Conference in Pakistan hardware including Polycom RealPresence Group 500, Poly Studio X70, Logitech Rally Bar, Cisco Room Kits, and Zoom/Teams boardroom solutions.',
    productSlugs: [
      'polycom-realpresence-group-500-pakistan',
      'poly-studio-x72-pakistan',
      'logitech-rally-bar-pakistan',
      'cisco-room-kit-plus-pakistan',
      'poly-studio-x52-pakistan',
      'poly-studio-usb-video-bar-pakistan',
      'poly-studio-x50-pakistan',
      'logitech-rally-bar-mini-pakistan',
    ],
  },
  'touch-panels': {
    name: 'Boardroom Touch Panels & Room Controllers',
    description:
      'Dedicated touch-screen room controllers, scheduling panels, and AV automation consoles for Zoom Rooms, Microsoft Teams Rooms, Cisco Webex, and Poly Studio boardrooms in Pakistan.',
    productSlugs: [
      'cisco-room-bar-pakistan',
      'cisco-room-kit-plus-pakistan',
      'poly-studio-x72-pakistan',
      'logitech-rally-bar-pakistan',
      'horion-k6a-bundle-special-offer',
      'google-meet-hardware-license-pakistan',
    ],
  },
  'large-room': {
    name: 'Large Boardroom Video Conferencing Systems',
    description:
      'High-capacity dual-camera and PTZ codec systems including Polycom RealPresence Group 500, Poly Studio X70, and Cisco Room Kit Plus for 12–40 seat executive boardrooms in Pakistan.',
    productSlugs: [
      'polycom-realpresence-group-500-pakistan',
      'poly-studio-x72-pakistan',
      'cisco-room-kit-plus-pakistan',
      'cisco-room-kit-pro-pakistan',
      'poly-g7500-pakistan',
      'logitech-rally-bar-pakistan',
    ],
  },
  speakerphones: {
    name: 'Conference Room Speakerphones & Microphone Arrays',
    description:
      '360-degree beamforming conference phones, expansion microphones, and ceiling audio pickup systems from Poly, Jabra, and Yealink in Pakistan.',
    productSlugs: [
      'poly-studio-usb-video-bar-pakistan',
      'poly-studio-v52-pakistan',
      'jabra-evolve2-65-pakistan',
      'yealink-sip-t46s-pakistan',
    ],
  },
  'boardroom-codecs': {
    name: 'Enterprise H.323 / SIP Boardroom Codecs',
    description:
      'Hardware telepresence codecs including Polycom RealPresence Group 500 (7200-64550-001), Poly G7500, and Cisco Room Kit Pro/Plus for standards-based multipoint video conferencing in Pakistan.',
    productSlugs: [
      'polycom-realpresence-group-500-pakistan',
      'poly-g7500-pakistan',
      'cisco-room-kit-pro-pakistan',
      'cisco-room-kit-plus-pakistan',
      'cisco-room-kit-eq-pakistan',
    ],
  },
  'ptz-cameras': {
    name: '4K Optical PTZ Conferencing & Broadcast Cameras',
    description:
      'Motorized 12x–25x optical zoom PTZ cameras including Polycom EagleEye IV, Logitech Rally PTZ, and Hikvision DarkFighter PTZ systems for boardrooms and hybrid events in Pakistan.',
    productSlugs: [
      'polycom-realpresence-group-500-pakistan',
      'logitech-rally-bar-pakistan',
      'hikvision-ptz-camera-pakistan',
      'poly-studio-x72-pakistan',
    ],
  },
  'ip-phones': {
    name: 'Enterprise IP Phones',
    description:
      'Executive SIP & VoIP desk phones from Cisco, Yealink, Polycom VVX, Grandstream, and Fanvil with PoE and HD voice for Pakistani enterprises.',
    productSlugs: [
      'cisco-8841-ip-phone-pakistan',
      'polycom-vvx-250-pakistan',
      'yealink-sip-t46s-pakistan',
      'grandstream-gxp2170-pakistan',
      'fanvil-x4-ip-phone-pakistan',
    ],
  },
  'voip-phone-systems': {
    name: 'VoIP Phone Systems & IP PBX',
    description:
      'Scalable IP PBX appliances and unified communications licensing from 3CX, Grandstream UCM, Cisco CUCM, and FreePBX.',
    productSlugs: [
      '3cx-pro-8-sc-pakistan',
      'freepbx-enterprise-pakistan',
      'cisco-cucm-license-pakistan',
      'grandstream-ucm6308-pakistan',
      'grandstream-ucm6304-pakistan',
    ],
  },
  projectors: {
    name: 'Commercial Laser & 4K Projectors',
    description:
      'High-lumen 4K UHD and laser installation projectors from Panasonic, BenQ, Epson, Sony, Optoma, and ViewSonic for auditoriums and 3D projection mapping in Pakistan.',
    productSlugs: [
      'panasonic-pt-rq45k-pakistan',
      'panasonic-pt-vmz82-pakistan',
      'epson-lifestudio-flex-plus-pakistan',
      'benq-tk705i-pakistan',
      'benq-w4100i-pakistan',
      'sony-bravia-projector-7-pakistan',
      'optoma-gt4000uhd-pakistan',
      'viewsonic-lsd400w-pakistan',
    ],
  },
  headsets: {
    name: 'Professional UC & Call Center Headsets',
    description:
      'Active noise-cancelling (ANC) wireless and USB headsets from Jabra Evolve, HP Poly Voyager/Blackwire, and Yealink for hybrid work and contact centers.',
    productSlugs: [
      'jabra-evolve2-65-pakistan',
      'jabra-evolve-75-pakistan',
      'poly-voyager-focus-uc-pakistan',
      'poly-blackwire-c3220-pakistan',
      'yealink-bh70-headset-pakistan',
    ],
  },
  'ip-cameras': {
    name: 'IP Security & PTZ Cameras',
    description:
      'NDAA-compliant network surveillance, Starlight WDR domes, and optical PTZ cameras from Axis, Hikvision, Dahua, and Uniview.',
    productSlugs: [
      'axis-m3065-v-camera-pakistan',
      'hikvision-colorvu-camera-pakistan',
      'hikvision-ptz-camera-pakistan',
      'dahua-n43al52-bullet-pakistan',
      'uniview-ipc3612sr3-vf-pakistan',
    ],
  },
  'intercom-paging-access': {
    name: 'SIP Intercom, Paging & Public Address',
    description:
      'Commercial PA amplifiers, EN 54-16 voice alarm controllers, and SIP video door intercoms from Bosch PAVIRO, 2N, Axis, and ITC.',
    productSlugs: [
      '2n-ip-vario-intercom-pakistan',
      'axis-a8105-e-door-station-pakistan',
      'bosch-paviro-pva-4cr12-pakistan',
      'bosch-paviro-pva-2p500-pakistan',
      'itc-va-6200ma-pakistan',
    ],
  },
};

function getFallbackCategoryProducts(slug?: string): Product[] {
  if (!slug) return [];
  const catConfig = FALLBACK_PRODUCT_CATEGORIES[slug];
  const candidateSlugs =
    catConfig?.productSlugs ||
    Object.keys(PRODUCT_GMC_METADATA)
      .filter(k => k.endsWith('-pakistan'))
      .slice(0, 6);

  const built: Product[] = [];
  for (const s of candidateSlugs) {
    const prod = buildFallbackProductFromGmcMeta(s) as Product | null;
    if (prod) {
      built.push({
        ...prod,
        categoryIds: [slug],
        categorySlugs: [slug],
      });
    }
  }
  return built;
}

export function Category() {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubCategories = subscribeToCategories((cats) => {
      const productOnlyCats = cats.filter(
        c =>
          c.isActive !== false &&
          !EXCLUDED_CATEGORY_SLUGS.has(c.slug) &&
          (!(c as any).type || (c as any).type === 'product')
      );
      setCategories(productOnlyCats);
    });

    const unsubProducts = subscribeToProducts((prods) => {
      setProducts(prods);
      setLoading(false);
    }, { isActive: true });

    return () => {
      unsubCategories();
      unsubProducts();
    };
  }, []);

  if (categorySlug && NON_PRODUCT_CATEGORY_REDIRECTS[categorySlug]) {
    return <Navigate to={NON_PRODUCT_CATEGORY_REDIRECTS[categorySlug]} replace />;
  }

  const fallbackCat = categorySlug ? FALLBACK_PRODUCT_CATEGORIES[categorySlug] : undefined;
  const currentCategory: CategoryType | undefined =
    categories.find(c => c.slug === categorySlug && !EXCLUDED_CATEGORY_SLUGS.has(c.slug)) ||
    (fallbackCat && categorySlug
      ? {
          id: categorySlug,
          name: fallbackCat.name,
          slug: categorySlug,
          description: fallbackCat.description,
          parentId: null,
          displayOrder: 1,
          isActive: true,
        }
      : undefined);
  
  const subcategories = currentCategory 
    ? categories.filter(c => c.parentId === currentCategory.id && c.isActive)
    : [];

  const firestoreMatchedProducts = currentCategory
    ? products.filter(p => (Array.isArray(p.categorySlugs) ? p.categorySlugs : typeof p.categorySlugs === 'string' ? [p.categorySlugs] : []).includes(categorySlug!) || p.categoryIds?.includes(currentCategory.id!))
    : [];

  const categoryProducts =
    firestoreMatchedProducts.length > 0
      ? firestoreMatchedProducts
      : getFallbackCategoryProducts(categorySlug);

  const brandsIncategory = Array.from(new Set(categoryProducts.map(p => p.brand || 'Unknown'))).sort();

  if (loading && !currentCategory) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <SEO
          title={`${(categorySlug || 'Hardware').replace(/-/g, ' ')} | Video Conference in Pakistan | AV Live`}
          description="Explore enterprise video conferencing, VoIP telephony, and commercial AV hardware in Pakistan from AV Live Communications."
          url={`https://avlive.com.pk/category/${categorySlug || ''}`}
        />
        <div className="text-center">
          <Loader2 className="animate-spin text-[#00B4D8] mx-auto mb-4" size={40} />
          <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Filtering Infrastructure...</p>
        </div>
      </div>
    );
  }

  if (!currentCategory) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FA]">
        <SEO
          title="Category Not Found | AV Live Communications"
          description="The requested hardware category does not exist."
          noindex={true}
        />
        <h1 className="text-4xl font-black text-[#1A2B4C] mb-4">Classification Error</h1>
        <p className="text-gray-500 mb-8 font-medium">The hardware category you requested is not indexed.</p>
        <Link to="/shop" className="bg-[#1A2B4C] text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#00B4D8] transition-all shadow-xl">
          Browse All Inventory
        </Link>
      </div>
    );
  }

  const canonicalCategoryUrl = `https://avlive.com.pk/category/${currentCategory.slug || currentCategory.id}`;

  return (
    <div className="bg-[#F8F9FA] min-h-screen pb-16 text-[#1A2B4C]">
      <SEO 
        title={`${currentCategory.name} | Video Conference in Pakistan | Polycom Group 500 & Poly X70 | AV Live`}
        description={currentCategory.description || `Explore genuine ${currentCategory.name} in Pakistan including Polycom Group 500, Poly X70, and enterprise Video conference & Corporate event management hardware.`}
        keywords={`${currentCategory.name}, Video Conference in Pakistan, Video conference, Polycom Group 500, Poly X70, Event management, Corporate event management, hybrid event, Hologram Display, events, AV Live`}
        image={currentCategory.imageUrl}
        imageAlt={`${currentCategory.name} - Video Conference in Pakistan & Enterprise AV Solutions`}
        url={canonicalCategoryUrl}
        schema={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "CollectionPage",
              "@id": `${canonicalCategoryUrl}#collection`,
              "name": `${currentCategory.name} - Video Conference in Pakistan | AV Live`,
              "description": currentCategory.description || `Enterprise ${currentCategory.name} hardware in Pakistan.`,
              "url": canonicalCategoryUrl,
              "mainEntity": {
                "@type": "ItemList",
                "numberOfItems": categoryProducts.length,
                "itemListElement": categoryProducts.slice(0, 24).map((prod, idx) => {
                  const slug = getCanonicalProductSlug(prod);
                  const { effectivePrice } = resolveProductPricing(prod);
                  return {
                    "@type": "ListItem",
                    "position": idx + 1,
                    "url": `https://avlive.com.pk/product/${slug}`,
                    "name": prod.productName,
                    "item": {
                      "@type": "Product",
                      "name": prod.productName,
                      "url": `https://avlive.com.pk/product/${slug}`,
                      "brand": { "@type": "Brand", "name": prod.brand || "AV Live" },
                      "offers": {
                        "@type": "Offer",
                        "priceCurrency": "PKR",
                        "price": effectivePrice.toFixed(2),
                        "availability": "https://schema.org/InStock"
                      }
                    }
                  };
                })
              }
            },
            {
              "@type": "FAQPage",
              "@id": `${canonicalCategoryUrl}#faq`,
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": `Which ${currentCategory.name} models are recommended for Video Conference in Pakistan?`,
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": `For enterprise boardrooms and hybrid events in Pakistan, our top-performing ${currentCategory.name} systems include the Polycom RealPresence Group 500 (Polycom Group 500), Poly Studio X70 (Poly X70), Yealink MeetingBar series, and Logitech Rally systems—all backed by local warranty and engineering support in Lahore, Karachi, and Islamabad.`
                  }
                }
              ]
            }
          ]
        }}
      />
      {/* Category Hero */}
      <div className="bg-white border-b border-gray-100 py-16 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-16 relative z-10">
           <div className="absolute top-8 left-8">
              <Breadcrumbs items={[
                { label: 'Shop', path: '/shop' },
                { label: currentCategory.name }
              ]} />
           </div>
           <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-32 h-32 bg-[#1A2B4C] text-[#00B4D8] rounded-[2.5rem] flex items-center justify-center shrink-0 shadow-2xl"
          >
            {currentCategory.imageUrl ? (
              <img fetchPriority="high" src={currentCategory.imageUrl} alt={currentCategory.name} className="w-full h-full object-cover rounded-[2.5rem]" />
            ) : (
              <Layers size={48} />
            )}
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 text-center md:text-left"
          >
            <span className="text-[#00B4D8] text-[10px] font-black uppercase tracking-[0.3em] mb-4 block">Hardware Classification</span>
            <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">{currentCategory.name}</h1>
            <p className="text-gray-400 max-w-2xl leading-relaxed font-medium text-lg">
              {currentCategory.description || 'Enterprise-grade equipment and specialized infrastructure solutions.'}
            </p>
          </motion.div>
        </div>
        {/* Abstract Background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gray-50 rounded-full translate-x-1/2 -translate-y-1/2"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          
          {/* Sidebar / Filters */}
          <div className="lg:col-span-1 space-y-10">
             {subcategories.length > 0 && (
               <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                 <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-8">Sub-Systems</h3>
                 <div className="space-y-4">
                    {subcategories.map(sub => (
                      <Link key={sub.id} to={`/category/${sub.slug}`} className="flex items-center justify-between group">
                         <span className="text-sm font-black uppercase tracking-widest text-[#1A2B4C] group-hover:text-[#00B4D8] transition-colors">{sub.name}</span>
                         <ArrowRight size={14} className="text-gray-200 group-hover:text-[#00B4D8] group-hover:translate-x-1 transition-all" />
                      </Link>
                    ))}
                 </div>
               </div>
             )}

             <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
               <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-8">Hardware Partners</h3>
               <div className="space-y-4">
                  {brandsIncategory.map(brand => {
                    const rawSlug = brand.toString().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                    const canonicalBrandSlug = rawSlug === 'polycom' || rawSlug === 'hp-poly' ? 'poly' : rawSlug;
                    return (
                      <Link key={brand} to={`/brands/${encodeURIComponent(canonicalBrandSlug)}`} className="flex items-center justify-between group">
                         <span className="text-sm font-black uppercase tracking-widest text-[#1A2B4C] group-hover:text-[#00B4D8] transition-colors">{brand}</span>
                         <div className="w-1.5 h-1.5 bg-gray-100 rounded-full group-hover:bg-[#00B4D8] transition-colors"></div>
                      </Link>
                    );
                  })}
                  {brandsIncategory.length === 0 && (
                    <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">No Active Brands</p>
                  )}
               </div>
             </div>

             <div className="bg-[#1A2B4C] p-10 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group">
                <div className="relative z-10">
                   <h4 className="text-sm font-black uppercase tracking-widest mb-4">Design Assistance</h4>
                   <p className="text-xs text-gray-400 leading-relaxed mb-8">Need a custom technical drawing for this infrastructure?</p>
                   <Link to="/contact" className="bg-[#00B4D8] text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-[#1A2B4C] transition-all inline-block">
                      Consult Architect
                   </Link>
                </div>
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/5 rounded-full translate-x-8 translate-y-8 group-hover:scale-150 transition-transform duration-700"></div>
             </div>
          </div>

          {/* Product Grid */}
          <div className="lg:col-span-3">
             <div className="flex items-center justify-between mb-12">
                <h2 className="text-2xl font-black tracking-tight">{categoryProducts.length} Active Modules Found</h2>
                <div className="flex items-center gap-4">
                   <LayoutGrid size={20} className="text-[#00B4D8]" />
                </div>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                {categoryProducts.map((product, idx) => {
                  const prodSlug = getCanonicalProductSlug(product);
                  const { effectivePrice } = resolveProductPricing(product);
                  return (
                  <motion.div 
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white group rounded-[2.5rem] overflow-hidden border border-gray-100 hover:border-[#00B4D8] transition-all shadow-sm hover:shadow-2xl"
                  >
                    <Link to={`/product/${prodSlug}`} className="aspect-square bg-gray-50 overflow-hidden block">
                       <img loading="lazy" 
                         src={(Array.isArray(product.images) ? product.images : (typeof product.images === 'string' ? [product.images] : (product.image ? [product.image] : [])))[0] || 'https://placehold.co/600x600?text=No+Image'} 
                         alt={product.productName} 
                         className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                       />
                    </Link>
                    <div className="p-8">
                       <div className="flex items-center justify-between mb-4">
                          <span className="text-[10px] text-[#00B4D8] font-black uppercase tracking-widest">{product.brand}</span>
                          <span className="text-[10px] text-gray-300 font-black tracking-widest">{product.sku}</span>
                       </div>
                       <Link to={`/product/${prodSlug}`} className="block">
                          <h3 className="font-black text-[#1A2B4C] group-hover:text-[#00B4D8] transition-colors line-clamp-2 leading-tight mb-8 h-10">{product.productName}</h3>
                       </Link>
                       <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                          <span className="text-xl font-black">Rs. {effectivePrice.toLocaleString()}</span>
                          <button 
                            onClick={() => addToCart({
                              id: product.id!,
                              name: product.productName,
                              price: effectivePrice,
                              image: (Array.isArray(product.images) ? product.images : (typeof product.images === 'string' ? [product.images] : (product.image ? [product.image] : [])))[0] || '',
                              brand: product.brand
                            } as any)}
                            className="w-10 h-10 bg-[#1A2B4C] text-white rounded-xl flex items-center justify-center hover:bg-[#00B4D8] transition-all shadow-lg"
                          >
                             <Zap size={16} />
                          </button>
                       </div>
                    </div>
                  </motion.div>
                  );
                })}

                {categoryProducts.length === 0 && (
                  <div className="col-span-full py-16 text-center bg-white rounded-[4rem] border border-gray-100">
                    <Box size={48} className="text-gray-200 mx-auto mb-6" />
                    <h3 className="text-xl font-black text-[#1A2B4C] mb-2">No Active Hardware In This Category</h3>
                    <p className="text-gray-400 font-medium max-w-sm mx-auto">Our logistics team is currently updating this inventory classification.</p>
                  </div>
                )}
             </div>
          </div>
          
        </div>
      </div>
      
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 bg-white rounded-[32px] p-8 sm:p-10 border border-gray-100 shadow-sm space-y-6">
        <div className="bg-[#1A2B4C]/5 border-l-4 border-[#00B4D8] rounded-2xl p-5">
          <span className="block text-[10px] font-black uppercase tracking-widest text-[#00B4D8] mb-1">
            Answer-First Procurement Summary ({currentCategory.name})
          </span>
          <p className="text-sm sm:text-base font-bold text-[#1A2B4C] leading-relaxed">
            For enterprise deployments in Pakistan, AV Live supplies {categoryProducts.length} verified <strong>{currentCategory.name}</strong> models from {brandsIncategory.slice(0, 5).join(', ') || 'HP Poly, Cisco, Logitech, and Yealink'}—complete with GS1 GTIN/MPN verification, official 1-to-3 year Pakistan warranty, and turnkey installation in Lahore, Karachi, and Islamabad.
          </p>
        </div>

        <h2 className="text-2xl font-black text-[#1A2B4C]">
          {currentCategory.name} Comparison &amp; Reference Price Matrix (Pakistan)
        </h2>

        {categoryProducts.length > 0 && (
          <div className="overflow-x-auto rounded-2xl border border-gray-200">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <caption className="bg-[#1A2B4C] text-white font-black text-left px-5 py-3 text-xs uppercase tracking-wider">
                Top {currentCategory.name} Models — Specifications &amp; PKR Pricing
              </caption>
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-[#1A2B4C] font-black uppercase text-[11px] tracking-wider">
                  <th className="py-3 px-4">Hardware Model</th>
                  <th className="py-3 px-4">Brand</th>
                  <th className="py-3 px-4">Part Number (SKU/MPN)</th>
                  <th className="py-3 px-4">Reference Price (PKR)</th>
                  <th className="py-3 px-4">Warranty &amp; Availability</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categoryProducts.slice(0, 8).map((prod) => {
                  const slug = getCanonicalProductSlug(prod);
                  const { effectivePrice } = resolveProductPricing(prod);
                  return (
                    <tr key={prod.id || slug} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3 px-4 font-black text-[#1A2B4C]">
                        <Link to={`/product/${slug}`} className="hover:text-[#00B4D8] transition-colors">
                          {prod.productName}
                        </Link>
                      </td>
                      <td className="py-3 px-4 font-bold text-gray-600">{prod.brand}</td>
                      <td className="py-3 px-4 font-mono text-xs text-gray-500">{prod.sku || prod.mpn || 'Official OEM'}</td>
                      <td className="py-3 px-4 font-black text-[#00B4D8]">Rs. {effectivePrice.toLocaleString()}</td>
                      <td className="py-3 px-4 font-bold text-emerald-600">In Stock • 1-Yr Official PK Warranty</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <p className="text-gray-600 leading-relaxed">
          When investing in <strong>{currentCategory.name.toLowerCase()}</strong> for your corporate boardroom, <strong>hybrid event</strong>, or <strong>Corporate event management</strong> infrastructure in Pakistan, selecting genuine, PTA-compliant hardware is critical. At AV Live, we supply and integrate flagship <strong>Video conference</strong> systems—including the <strong>Polycom Group 500</strong> and <strong>Poly X70</strong>—alongside commercial audio, IP telephony, and <strong>Hologram Display</strong> solutions.
        </p>
        <p className="text-gray-600 leading-relaxed">
          Our certified technical consultants in <strong>Lahore, Karachi, and Islamabad</strong> provide acoustic room surveys, GS1-verified hardware procurement, and turnkey onsite installation for all <strong>{currentCategory.name.toLowerCase()}</strong> deployments.
        </p>

        <div className="pt-4 border-t border-gray-100 flex flex-wrap gap-3">
          <Link to="/blog/logitech-rally-bar-vs-poly-studio-x50-pakistan" className="text-xs font-bold text-[#1A2B4C] hover:text-[#00B4D8] bg-gray-50 px-4 py-2 rounded-full border border-gray-200 transition-colors">
            Logitech Rally Bar vs. Poly Studio X50 Guide →
          </Link>
          <Link to="/blog/yealink-vs-cisco-video-conferencing-pakistan" className="text-xs font-bold text-[#1A2B4C] hover:text-[#00B4D8] bg-gray-50 px-4 py-2 rounded-full border border-gray-200 transition-colors">
            Yealink vs. Cisco Room Kits Comparison →
          </Link>
          <Link to="/blog/boardroom-av-system-price-guide-pakistan" className="text-xs font-bold text-[#1A2B4C] hover:text-[#00B4D8] bg-gray-50 px-4 py-2 rounded-full border border-gray-200 transition-colors">
            6–30 Person Boardroom BoM Price Guide →
          </Link>
          <Link to="/blog/banking-healthcare-university-av-solutions-pakistan" className="text-xs font-bold text-[#1A2B4C] hover:text-[#00B4D8] bg-gray-50 px-4 py-2 rounded-full border border-gray-200 transition-colors">
            Banking, Healthcare &amp; University AV Guide →
          </Link>
        </div>
      </section>
    </div>
  );
}

