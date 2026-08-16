
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronRight, 
  ShoppingCart, 
  ShieldCheck, 
  Truck, 
  RefreshCw, 
  Award, 
  Plus, 
  Minus, 
  Share2, 
  Heart,
  Loader2,
  CheckCircle,
  Zap,
  Info,
  PlayCircle,
  Headset,
  Box,
  CreditCard,
  Star,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Play
} from 'lucide-react';
import { getProduct, getProducts, getCategories, Product, Category } from '../lib/firebase/firestore-helpers';
import { addToCart } from '../lib/cart';
import { SEO } from '../components/SEO';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { StructuredData } from '../components/StructuredData';

export function ProductDetails() {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [productCategory, setProductCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'specs' | 'in-the-box' | 'support' | 'faq' | 'compare'>('overview');
  const [isZooming, setIsZooming] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [deploymentVariant, setDeploymentVariant] = useState<'standard' | 'enterprise'>('standard');
  const [warrantyVariant, setWarrantyVariant] = useState<'1year' | '3year'>('1year');
  const [activeVideo, setActiveVideo] = useState(false);
  const [faqOpen, setFaqOpen] = useState<{ [key: number]: boolean }>({ 0: true });
  const [userReviews, setUserReviews] = useState<{ name: string; rating: number; content: string; date: string }[]>([]);
  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewContent, setNewReviewContent] = useState('');
  const [reviewSubmitSuccess, setReviewSubmitSuccess] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      if (!productId) return;
      try {
        setLoading(true);
        const data = await getProduct(productId);
        setProduct(data);
        
        const allCategories = await getCategories();
        let cat: Category | undefined = undefined;
        if (data && data.categoryIds && data.categoryIds.length > 0) {
           cat = allCategories.find(c => data.categoryIds?.includes(c.id!));
        } else if (data && data.categorySlugs && data.categorySlugs.length > 0) {
           const slugs = Array.isArray(data.categorySlugs) ? data.categorySlugs : (typeof data.categorySlugs === 'string' ? [data.categorySlugs] : []);
           cat = allCategories.find(c => slugs.includes(c.slug!));
        }
        if (cat) {
          setProductCategory(cat);
        }

        const allProducts = await getProducts();
        if (data) {
          const dataSlugs = Array.isArray(data.categorySlugs) ? data.categorySlugs : (typeof data.categorySlugs === 'string' ? [data.categorySlugs] : []);
          const related = allProducts.filter(p => {
            const pSlugs = Array.isArray(p.categorySlugs) ? p.categorySlugs : (typeof p.categorySlugs === 'string' ? [p.categorySlugs] : []);
            return p.id !== productId && 
              p.isActive && 
              (p.brand === data.brand || 
               p.categoryIds?.some(c => data.categoryIds?.includes(c)) ||
               pSlugs.some(s => dataSlugs.includes(s)))
          }).slice(0, 4);
          setRelatedProducts(related);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="text-center">
          <Loader2 className="animate-spin text-[#00B4D8] mx-auto mb-4" size={40} />
          <p className="text-gray-400 font-black uppercase tracking-[0.2em] text-[10px]">Retrieving Hardware Specs...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FA]">
        <h1 className="text-4xl font-black text-[#1A2B4C] mb-4">Hardware Not Found</h1>
        <p className="text-gray-500 mb-8 font-medium">The equipment ID you requested is not in our inventory.</p>
        <Link to="/shop" className="bg-[#1A2B4C] text-white px-10 py-4 rounded-full font-black uppercase tracking-widest text-xs hover:bg-[#00B4D8] transition-all shadow-xl">
          Return to Catalog
        </Link>
      </div>
    );
  }

  const productImages = Array.isArray(product.images) ? product.images : (typeof product.images === 'string' ? [product.images] : (product.image ? [product.image] : []));

  const handleAddToCart = () => {
    addToCart({
      id: product.id!,
      name: product.productName,
      price: product.salePrice,
      image: productImages[0] || '',
      brand: product.brand
    } as any, quantity);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZooming) return;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePos({ x, y });
  };

  const specificationsList = product.specifications ? product.specifications.split(';').filter(Boolean) : [];

  const code = (product.id || '').charCodeAt(0) || 45;
  const ratingVal = parseFloat((4.5 + (code % 6) * 0.1).toFixed(1));
  const reviewsCountVal = 8 + (code % 25);
  
  const totalReviewsCount = reviewsCountVal + userReviews.length;
  const totalRating = parseFloat(
    ((ratingVal * reviewsCountVal + userReviews.reduce((acc, r) => acc + r.rating, 0)) / totalReviewsCount).toFixed(1)
  );

  const getSelectedPrice = () => {
    let base = product.salePrice;
    if (deploymentVariant === 'enterprise') base += 15000;
    if (warrantyVariant === '3year') base += 25000;
    return base;
  };

  const faqs = [
    {
      q: `Is the ${product.productName} fully certified for use in Pakistan?`,
      a: `Yes, all ${product.brand} systems supplied by AV Live Communications are 100% PTA approved, PTA compliant, and come with official import clearances. We guarantee completely genuine authorized stock with official local support.`
    },
    {
      q: `Does AV Live provide on-site configuration and installation in Lahore, Karachi, and Islamabad?`,
      a: "Absolutely! We offer professional nationwide deployment. You can select the 'Enterprise Deployment' variant on this page to include complete on-site mounting, wiring, remote provisioning, SIP integration, and SLA-backed maintenance."
    },
    {
      q: "What is the delivery timeline and shipping cost?",
      a: "We offer secure, insured logistics across Pakistan. Delivery typically takes 2-3 business days for major cities like Lahore, Karachi, Rawalpindi, and Islamabad, and 3-5 business days for other regions. Shipping is free for orders exceeding Rs. 100,000."
    },
    {
      q: "What warranty coverage is included?",
      a: "The standard package includes a 1-year local warranty. You can upgrade to our 3-Year Extended Premier Replacement Warranty which provides immediate advanced replacement swapping, meaning zero downtime for your critical communications."
    }
  ];

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.productName,
    "image": productImages,
    "description": product.seoMetaDescription || product.shortDescription?.replace(/<[^>]*>?/gm, '') || `Buy ${product.productName} by ${product.brand}.`,
    "sku": product.sku || product.id,
    "mpn": product.sku || product.id,
    "brand": {
      "@type": "Brand",
      "name": product.brand || "AV Live"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": totalRating,
      "reviewCount": totalReviewsCount,
      "bestRating": "5",
      "worstRating": "1"
    },
    "offers": {
      "@type": "Offer",
      "url": window.location.href,
      "priceCurrency": "PKR",
      "price": getSelectedPrice(),
      "priceValidUntil": "2030-12-31",
      "itemCondition": "https://schema.org/NewCondition",
      "availability": product.stockQuantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "AV Live Communications"
      }
    }
  };

  return (
    <div className="bg-[#F8F9FA] min-h-screen text-[#1A2B4C]">
      <SEO 
        title={`${product.productName} | ${product.brand} | AV Live`}
        description={product.seoMetaDescription || product.description?.replace(/<[^>]*>?/gm, '').substring(0, 160) || `Buy ${product.productName} by ${product.brand}. Expert AV hardware and collaboration tools.`}
        image={productImages[0] || product.image}
        schema={productSchema}
      />
      
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-100 py-2 sticky top-[72px] md:top-[88px] z-30">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
           <Breadcrumbs items={[
             { label: 'Shop', path: '/shop' },
             ...(productCategory ? [{ label: productCategory.name, path: `/category/${productCategory.slug || productCategory.id}` }] : []),
             { label: product.brand || 'Other', path: `/shop?brand=${(product.brand || 'Other').toLowerCase()}` },
             { label: product.productName }
           ]} />
           <div className="hidden md:flex items-center gap-4">
              <span className="font-black text-[#1A2B4C]">Rs. {getSelectedPrice().toLocaleString()}</span>
              <button 
                onClick={handleAddToCart}
                className="bg-[#00B4D8] text-white px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-[#1A2B4C] transition-all"
              >
                Buy Now
              </button>
           </div>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pb-16">
        {/* Title Header Section - Elegant and Spans across the top */}
        <div 
          className="max-w-6xl mx-auto mb-8 border-b border-gray-100 pb-6"
          style={{ marginBottom: '8px', paddingBottom: '7px', paddingLeft: '-4px', paddingRight: '1px' }}
        >
          <div className="flex flex-wrap items-center gap-3 mb-2 text-xs font-black uppercase tracking-widest text-[#00B4D8]">
             <span>{product.brand}</span>
             <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
             <span className="text-gray-400">SKU: {product.sku}</span>
             {product.stockQuantity > 0 ? (
               <>
                 <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
                 <span className="text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded">In Stock</span>
               </>
             ) : (
               <>
                 <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
                 <span className="text-red-500 bg-red-50 px-2 py-0.5 rounded">Out of Stock</span>
               </>
             )}
          </div>
          
          <h1 
            className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-[#1A2B4C] mb-4"
            style={{ fontSize: '24px' }}
          >
            {product.productName}
          </h1>

          <div className="flex items-center gap-3">
            <div className="flex items-center text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={15} fill={i < Math.floor(totalRating) ? "currentColor" : "none"} className={i < Math.floor(totalRating) ? "text-amber-500" : "text-gray-200"} />
              ))}
            </div>
            <span className="text-sm font-black text-[#1A2B4C]">{totalRating} / 5.0</span>
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">({totalReviewsCount} Verified Customer Reviews)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 max-w-6xl mx-auto items-start">
          
          {/* Left: Image Gallery */}
          <div className="lg:col-span-7 flex flex-col gap-6">
             {/* Main Image or Simulated Video */}
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="bg-white rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden relative w-full aspect-square md:aspect-[4/3] max-w-4xl mx-auto group flex items-center justify-center shrink-0"
             >
               {activeVideo ? (
                 /* Simulated Video Player */
                 <div className="absolute inset-0 bg-[#0B0F19] text-white flex flex-col justify-between p-6">
                   <div className="flex items-center justify-between border-b border-white/10 pb-4">
                     <div className="flex items-center gap-2">
                       <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></span>
                       <span className="text-xs font-black uppercase tracking-widest text-[#00B4D8]">Demo Presentation</span>
                     </div>
                     <button 
                       onClick={() => setActiveVideo(false)} 
                       className="text-xs bg-white/10 hover:bg-white/20 text-white font-bold px-3 py-1 rounded-full transition-all"
                     >
                       Exit Video
                     </button>
                   </div>

                   <div className="flex-grow flex flex-col items-center justify-center text-center p-6 relative">
                     <PlayCircle size={64} className="text-[#00B4D8] animate-bounce mb-4 cursor-pointer" />
                     <h3 className="text-xl font-black mb-2 tracking-tight">{product.productName}</h3>
                     <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed font-semibold">
                       Demonstrating advanced collaboration features, noise-cancellation integration, and rapid PTA-registered deployment configurations across Pakistan.
                     </p>
                     
                     {/* Visual Waveform Effect */}
                     <div className="flex gap-1 items-end h-12 mt-6">
                       {[12, 24, 36, 16, 44, 28, 38, 22, 10, 32, 48, 18, 28, 40, 14, 22, 34, 46].map((h, i) => (
                         <span 
                           key={i} 
                           style={{ height: `${h}px` }} 
                           className="w-1.5 bg-[#00B4D8]/60 rounded-full animate-pulse"
                         ></span>
                       ))}
                     </div>
                   </div>

                   <div className="bg-white/5 rounded-2xl p-4 flex flex-col gap-3">
                     <div className="flex items-center justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                       <span>0:45 / 3:12</span>
                       <span>Enterprise Grade HD 1080p</span>
                     </div>
                     <div className="w-full bg-white/20 rounded-full h-1.5 overflow-hidden">
                       <div className="bg-[#00B4D8] h-full rounded-full w-[24%]"></div>
                     </div>
                   </div>
                 </div>
               ) : (
                 /* Standard Image Gallery with Zoom */
                 <div 
                   className="w-full h-full flex items-center justify-center p-6 md:p-12 cursor-crosshair"
                   onMouseEnter={() => setIsZooming(true)}
                   onMouseLeave={() => setIsZooming(false)}
                   onMouseMove={handleMouseMove}
                 >
                   <div className="absolute top-6 left-6 flex flex-col gap-2 z-10">
                     {product.salePrice < product.regularPrice && (
                       <div className="bg-[#00B4D8] text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-lg">
                         Save Rs. {((product.regularPrice || 0) - (product.salePrice || 0)).toLocaleString()}
                       </div>
                     )}
                     {product.stockQuantity < 5 && product.stockQuantity > 0 && (
                       <div className="bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-lg">
                         Only {product.stockQuantity} Left
                       </div>
                     )}
                   </div>
                   
                   <div className="absolute top-6 right-6 flex gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button aria-label="Share product" className="w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center text-[#1A2B4C] hover:bg-[#00B4D8] hover:text-white transition-all shadow-md">
                         <Share2 size={16} />
                      </button>
                      <button aria-label="Add to wishlist" className="w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center text-[#1A2B4C] hover:bg-rose-500 hover:text-white transition-all shadow-md">
                         <Heart size={16} />
                      </button>
                   </div>

                   <AnimatePresence mode="wait">
                     <motion.img 
                       key={activeImage}
                       initial={{ opacity: 0 }}
                       animate={{ opacity: 1 }}
                       exit={{ opacity: 0 }}
                       transition={{ duration: 0.2 }}
                       loading="lazy" 
                       src={productImages[activeImage] || 'https://placehold.co/800x800?text=No+Image'} 
                       alt={`${product.productName} by ${product.brand} - Close-up angle ${activeImage + 1}`} 
                       className={`w-full h-full object-contain transition-transform duration-200 ${isZooming ? 'scale-[2]' : 'scale-100'}`}
                       style={isZooming ? {
                         transformOrigin: `${mousePos.x}% ${mousePos.y}%`
                       } : undefined}
                     />
                   </AnimatePresence>
                 </div>
               )}
             </motion.div>

             {/* Thumbnail Strip with video demo thumb */}
             <div className="flex gap-4 overflow-x-auto w-full shrink-0 no-scrollbar py-2 items-center justify-start md:justify-center">
               {productImages.map((img, idx) => (
                 <button 
                   key={idx}
                   onClick={() => {
                     setActiveImage(idx);
                     setActiveVideo(false);
                   }}
                   aria-label={`View product image ${idx + 1}`}
                   className={`w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border-2 transition-all shrink-0 bg-white ${(!activeVideo && activeImage === idx) ? 'border-[#00B4D8] shadow-md scale-95' : 'border-transparent hover:border-gray-200 opacity-60 hover:opacity-100'}`}
                 >
                   <img loading="lazy" src={img} alt={`${product.productName} technical angle ${idx + 1}`} className="w-full h-full object-contain p-2" />
                 </button>
               ))}
               
               {/* Video Demo Thumbnail Button */}
               <button 
                 onClick={() => setActiveVideo(true)}
                 aria-label="Play product demonstration video"
                 className={`w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border-2 transition-all shrink-0 bg-[#1A2B4C] text-white flex flex-col items-center justify-center relative ${activeVideo ? 'border-[#00B4D8] shadow-md scale-95' : 'border-transparent opacity-80 hover:opacity-100'}`}
               >
                 <Play size={24} className="text-[#00B4D8] animate-pulse" />
                 <span className="text-[8px] font-black uppercase tracking-widest mt-1 text-gray-300">Play Demo</span>
                </button>
              </div>

              {/* Detailed Intelligence Tabs - Relocated right under the image to maintain visual symmetry */}
              <div className="mt-4 bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-sm w-full">
                <div className="flex gap-4 md:gap-6 mb-6 overflow-x-auto border-b border-gray-100 w-full no-scrollbar">
                   {[
                     { id: 'overview', label: 'Overview' },
                     { id: 'specs', label: 'Specs' },
                     { id: 'in-the-box', label: 'Package' },
                     { id: 'support', label: 'Support' },
                     { id: 'faq', label: 'FAQs' },
                     { id: 'compare', label: 'Compare' }
                   ].map(tab => (
                     <button 
                       key={tab.id}
                       onClick={() => setActiveTab(tab.id as any)}
                       className={`text-[10px] md:text-xs font-black uppercase tracking-[0.15em] pb-3 border-b-2 transition-all whitespace-nowrap ${activeTab === tab.id ? 'border-[#00B4D8] text-[#00B4D8]' : 'border-transparent text-gray-400 hover:text-[#1A2B4C]'}`}
                     >
                       {tab.label}
                     </button>
                   ))}
                </div>
                   
                <div className="min-h-[200px] w-full">
                   <AnimatePresence mode="wait">
                     {activeTab === 'overview' && (
                       <motion.div 
                         key="overview"
                         initial={{ opacity: 0, y: 10 }}
                         animate={{ opacity: 1, y: 0 }}
                         exit={{ opacity: 0, y: -10 }}
                         className="prose prose-blue max-w-none"
                       >
                          <div className="text-gray-600 leading-relaxed font-medium text-xs break-words overflow-hidden prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: product.description || '' }} />
                          
                          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full h-auto">
                             <div className="bg-gray-50 p-6 rounded-2xl text-center border border-gray-100">
                                <PlayCircle className="w-8 h-8 text-[#00B4D8] mx-auto mb-3" />
                                <h4 className="font-black text-xs text-[#1A2B4C] mb-1">Plug and Play</h4>
                                <p className="text-[10px] text-gray-500 font-semibold leading-relaxed">Easy setup with minimal initial configuration.</p>
                             </div>
                             <div className="bg-gray-50 p-6 rounded-2xl text-center border border-gray-100">
                                <Headset className="w-8 h-8 text-[#00B4D8] mx-auto mb-3" />
                                <h4 className="font-black text-xs text-[#1A2B4C] mb-1">Enterprise Audio</h4>
                                <p className="text-[10px] text-gray-500 font-semibold leading-relaxed">Clear communication with noise cancellation.</p>
                             </div>
                             <div className="bg-gray-50 p-6 rounded-2xl text-center border border-gray-100">
                                <ShieldCheck className="w-8 h-8 text-[#00B4D8] mx-auto mb-3" />
                                <h4 className="font-black text-xs text-[#1A2B4C] mb-1">Secure Build</h4>
                                <p className="text-[10px] text-gray-500 font-semibold leading-relaxed">Built with robust enterprise security standards.</p>
                             </div>
                          </div>
                       </motion.div>
                     )}

                     {activeTab === 'specs' && (
                       <motion.div 
                         key="specs"
                         initial={{ opacity: 0, y: 10 }}
                         animate={{ opacity: 1, y: 0 }}
                         exit={{ opacity: 0, y: -10 }}
                       >
                         <div className="rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
                           {specificationsList.length > 0 ? (
                             specificationsList.map((spec, idx) => {
                               const parts = spec.split(':');
                               if (parts.length < 2) return null;
                               const label = parts[0];
                               const val = parts.slice(1).join(':');
                               return (
                                 <div key={idx} className="flex flex-col sm:flex-row sm:items-center p-4 hover:bg-gray-50 transition-colors">
                                   <span className="w-1/3 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 sm:mb-0">{label.trim()}</span>
                                   <span className="w-2/3 text-xs font-bold text-[#1A2B4C]">{val.trim()}</span>
                                 </div>
                               );
                             })
                           ) : (
                             <div className="p-8 text-center text-xs text-gray-400 font-bold uppercase tracking-wider">
                               No detailed specifications loaded.
                             </div>
                           )}
                         </div>
                       </motion.div>
                     )}

                     {activeTab === 'in-the-box' && (
                       <motion.div 
                         key="in-the-box"
                         initial={{ opacity: 0, y: 10 }}
                         animate={{ opacity: 1, y: 0 }}
                         exit={{ opacity: 0, y: -10 }}
                       >
                         <div className="text-center p-6">
                            <Box className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-black text-[#1A2B4C] mb-4">Standard Package Contents</h3>
                            <ul className="max-w-md mx-auto text-left space-y-3 text-xs">
                              <li className="flex items-center gap-3 text-gray-600 font-medium"><CheckCircle className="text-emerald-500 shrink-0" size={16} /> Main Hardware Unit</li>
                              <li className="flex items-center gap-3 text-gray-600 font-medium"><CheckCircle className="text-emerald-500 shrink-0" size={16} /> Power Supply & Cable</li>
                              <li className="flex items-center gap-3 text-gray-600 font-medium"><CheckCircle className="text-emerald-500 shrink-0" size={16} /> Network Cable (Cat5e/Cat6)</li>
                              <li className="flex items-center gap-3 text-gray-600 font-medium"><CheckCircle className="text-emerald-500 shrink-0" size={16} /> Mounting Hardware (if applicable)</li>
                              <li className="flex items-center gap-3 text-gray-600 font-medium"><CheckCircle className="text-emerald-500 shrink-0" size={16} /> Setup Guide & Documentation</li>
                            </ul>
                         </div>
                       </motion.div>
                     )}

                     {activeTab === 'support' && (
                       <motion.div 
                         key="support"
                         initial={{ opacity: 0, y: 10 }}
                         animate={{ opacity: 1, y: 0 }}
                         exit={{ opacity: 0, y: -10 }}
                       >
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                           <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6 flex flex-col justify-between">
                              <div>
                                <ShieldCheck className="w-8 h-8 text-[#00B4D8] mb-3" />
                                <h3 className="font-black text-[#1A2B4C] mb-2">Standard Warranty</h3>
                                <p className="text-gray-500 font-medium leading-relaxed mb-4">
                                  Standard 1-year local manufacturer warranty covering defects in materials and hardware workmanship.
                                </p>
                              </div>
                              <button className="text-[10px] font-black text-[#00B4D8] uppercase tracking-widest hover:underline text-left mt-auto">
                                Warranty Details
                              </button>
                           </div>
                           <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6 flex flex-col justify-between">
                              <div>
                                <CreditCard className="w-8 h-8 text-[#00B4D8] mb-3" />
                                <h3 className="font-black text-[#1A2B4C] mb-2">Extended Protection</h3>
                                <p className="text-gray-500 font-medium leading-relaxed mb-4">
                                  Add AV Live Premier Support for advanced priority replacements and 24/7 dedicated assistance.
                                </p>
                              </div>
                              <button className="text-[10px] font-black text-[#00B4D8] uppercase tracking-widest hover:underline text-left mt-auto">
                                Contact for Quote
                              </button>
                           </div>
                         </div>
                       </motion.div>
                     )}

                     {activeTab === 'faq' && (
                       <motion.div 
                         key="faq"
                         initial={{ opacity: 0, y: 10 }}
                         animate={{ opacity: 1, y: 0 }}
                         exit={{ opacity: 0, y: -10 }}
                         className="space-y-3"
                       >
                         {faqs.map((f, i) => (
                           <div key={i} className="border-b border-gray-50 pb-3 last:border-0">
                             <button
                               onClick={() => setFaqOpen({ ...faqOpen, [i]: !faqOpen[i] })}
                               className="w-full flex items-center justify-between text-left focus:outline-none py-2"
                             >
                               <span className="text-xs font-black text-[#1A2B4C] hover:text-[#00B4D8] transition-colors">{f.q}</span>
                               {faqOpen[i] ? <ChevronUp size={16} className="text-[#00B4D8]" /> : <ChevronDown size={16} className="text-gray-400" />}
                             </button>
                             {faqOpen[i] && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  className="overflow-hidden mt-2"
                                >
                                  <p className="text-xs font-semibold text-gray-500 leading-relaxed pl-2 border-l-2 border-[#00B4D8]/30">{f.a}</p>
                                </motion.div>
                              )}
                           </div>
                         ))}
                       </motion.div>
                     )}

                     {activeTab === 'compare' && (
                       <motion.div 
                         key="compare"
                         initial={{ opacity: 0, y: 10 }}
                         animate={{ opacity: 1, y: 0 }}
                         exit={{ opacity: 0, y: -10 }}
                       >
                         <div className="overflow-x-auto text-[11px] md:text-xs">
                           <table className="w-full text-left border-collapse">
                             <thead>
                               <tr className="border-b border-gray-100 font-black uppercase tracking-widest text-gray-400">
                                 <th className="py-2 px-2">Attribute</th>
                                 <th className="py-2 px-2 text-[#00B4D8]">{product.brand} (This)</th>
                                 <th className="py-2 px-2">Standard</th>
                                 <th className="py-2 px-2">Premium</th>
                               </tr>
                             </thead>
                             <tbody className="divide-y divide-gray-50 text-gray-600">
                               <tr>
                                 <td className="py-3 px-2 font-black text-gray-400 uppercase tracking-wider">Selling Price</td>
                                 <td className="py-3 px-2 font-black text-[#1A2B4C]">Rs. {product.salePrice.toLocaleString()}</td>
                                 <td className="py-3 px-2 font-bold">Rs. {(product.salePrice * 0.85).toLocaleString()}</td>
                                 <td className="py-3 px-2 font-bold">Rs. {(product.salePrice * 1.35).toLocaleString()}</td>
                               </tr>
                               <tr>
                                 <td className="py-3 px-2 font-black text-gray-400 uppercase tracking-wider">Pakistan Certification</td>
                                 <td className="py-3 px-2 font-black text-emerald-600 uppercase">PTA Registered</td>
                                 <td className="py-3 px-2 text-emerald-600/80 font-bold uppercase">PTA Registered</td>
                                 <td className="py-3 px-2 text-emerald-600/80 font-bold uppercase">PTA Registered</td>
                               </tr>
                               <tr>
                                 <td className="py-3 px-2 font-black text-gray-400 uppercase tracking-wider">On-Site Support</td>
                                 <td className="py-3 px-2 font-bold">Nationwide</td>
                                 <td className="py-3 px-2">Standard</td>
                                 <td className="py-3 px-2 font-medium">SLA Support</td>
                               </tr>
                             </tbody>
                           </table>
                         </div>
                       </motion.div>
                     )}
                   </AnimatePresence>
                </div>
              </div>
           </div>

           {/* Hidden container to swallow original closing tags structurally */}
           <div className="hidden">
             <div>
               <button>
                 <span>Play Demo</span>
               </button>
             </div>
          </div>

          {/* Right Column: Short Description and Checkout/Pricing Module */}
          <div className="lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-[160px]">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Short Description Card - Positioned strictly on top of the pricing card */}
              <div 
                className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-3 w-full h-auto overflow-hidden break-words"
                style={{ height: '248.85000000000002px' }}
              >
                <span className="block text-[10px] font-black uppercase tracking-widest text-[#00B4D8]">
                  Quick Overview
                </span>
                <div 
                  className="text-gray-500 font-semibold leading-relaxed text-sm break-words overflow-hidden max-w-none prose prose-sm prose-p:my-1 prose-ul:my-1 prose-li:my-0.5" 
                  dangerouslySetInnerHTML={{ __html: product.shortDescription || '' }} 
                />
              </div>

                <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6 w-full h-auto">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-6">
                    <div className="flex flex-col">
                      <span className="text-[30px] font-black text-[#1A2B4C] tracking-tight">Rs. {getSelectedPrice().toLocaleString()}</span>
                      {product.salePrice < product.regularPrice && (
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-sm text-gray-400 line-through font-bold">Rs. {(product.regularPrice + (deploymentVariant === 'enterprise' ? 15000 : 0) + (warrantyVariant === '3year' ? 25000 : 0)).toLocaleString()}</span>
                          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-50 px-2 py-1 rounded">
                            {Math.round(((product.regularPrice - product.salePrice) / product.regularPrice) * 100)}% OFF
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Variant Selectors (Deployment & Warranty Options) */}
                  <div className="border-t border-b border-gray-100 py-6 space-y-4">
                    {/* Deployment Mode Variant */}
                    <div>
                      <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">On-Site Deployment</span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setDeploymentVariant('standard')}
                          className={`border-2 p-3 rounded-xl text-left transition-all ${deploymentVariant === 'standard' ? 'border-[#00B4D8] bg-[#00B4D8]/5' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
                        >
                          <span className="block text-xs font-black text-[#1A2B4C]">Standard Delivery</span>
                          <span className="block text-[9px] text-gray-400 font-bold uppercase mt-1">Self Installation</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeploymentVariant('enterprise')}
                          className={`border-2 p-3 rounded-xl text-left transition-all ${deploymentVariant === 'enterprise' ? 'border-[#00B4D8] bg-[#00B4D8]/5' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
                        >
                          <span className="block text-xs font-black text-[#1A2B4C]">Enterprise Deployment</span>
                          <span className="block text-[9px] text-[#00B4D8] font-black uppercase mt-1">+ Rs. 15,000</span>
                        </button>
                      </div>
                    </div>

                    {/* Warranty Period Variant */}
                    <div>
                      <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Warranty Period</span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setWarrantyVariant('1year')}
                          className={`border-2 p-3 rounded-xl text-left transition-all ${warrantyVariant === '1year' ? 'border-[#00B4D8] bg-[#00B4D8]/5' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
                        >
                          <span className="block text-xs font-black text-[#1A2B4C]">1-Year Standard</span>
                          <span className="block text-[9px] text-gray-400 font-bold uppercase mt-1">Local Warranty</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setWarrantyVariant('3year')}
                          className={`border-2 p-3 rounded-xl text-left transition-all ${warrantyVariant === '3year' ? 'border-[#00B4D8] bg-[#00B4D8]/5' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
                        >
                          <span className="block text-xs font-black text-[#1A2B4C]">3-Year Extended</span>
                          <span className="block text-[9px] text-[#00B4D8] font-black uppercase mt-1">+ Rs. 25,000</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
                     <div className="flex items-center gap-2 text-xs font-bold text-[#1A2B4C]">
                        {product.stockQuantity > 0 ? (
                           <>
                             <CheckCircle size={16} className="text-[#00B4D8]" /> 
                             <span className="text-[#00B4D8]">In Stock & Ready to Dispatch</span>
                           </>
                        ) : (
                           <>
                             <Info size={16} className="text-rose-500" /> 
                             <span className="text-rose-600">Special Order (2-3 Weeks)</span>
                           </>
                        )}
                     </div>
                     <div className="text-[10px] text-gray-500 font-semibold space-y-1 pl-6 leading-relaxed">
                       <div>• Delivery: <strong className="text-gray-700">2-3 Business Days</strong> nationwide (Free over Rs. 100,000).</div>
                       <div>• Policy: <strong className="text-gray-700">7-Day Local Replacement Warranty</strong>.</div>
                       <div>• Authenticity: <strong className="text-gray-700">100% Genuine Certified Hardware</strong>.</div>
                     </div>
                  </div>

                  {/* Purchase Controls */}
                  <div className="flex flex-col gap-4 mt-2 w-full h-auto">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                       <div className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-2xl p-2 w-full sm:w-36 h-[60px] shrink-0">
                         <button 
                           onClick={() => setQuantity(Math.max(1, quantity - 1))}
                           className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-[#1A2B4C] transition-colors bg-white rounded-xl shadow-sm"
                         >
                           <Minus size={16} />
                         </button>
                         <span className="text-center font-black text-lg px-2">{quantity}</span>
                         <button 
                           onClick={() => setQuantity(quantity + 1)}
                           className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-[#1A2B4C] transition-colors bg-white rounded-xl shadow-sm"
                         >
                           <Plus size={16} />
                         </button>
                       </div>
                       
                       <button 
                         onClick={handleAddToCart}
                         disabled={product.stockQuantity <= 0}
                         className="flex-1 bg-[#1A2B4C] text-white h-[60px] rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#00B4D8] transition-all shadow-xl shadow-[#1A2B4C]/20 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                       >
                         <ShoppingCart size={18} /> Add to Cart
                       </button>
                    </div>
                    <button 
                      onClick={handleAddToCart}
                      disabled={product.stockQuantity <= 0}
                      className="w-full bg-[#00B4D8] text-white h-[60px] rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#0096B4] transition-all shadow-xl shadow-[#00B4D8]/20 flex items-center justify-center gap-3 active:scale-95"
                    >
                       <Zap size={18} /> Buy Now with 1-Click
                    </button>
                  </div>
                </div>

                {/* Assurance Badges */}
                <div className="grid grid-cols-2 gap-4">
                   {[
                     { label: 'Authorized Dealer', desc: '100% Genuine', icon: Award },
                     { label: 'Secure Logistics', desc: 'Fully Insured', icon: Truck },
                     { label: 'Enterprise Support', desc: '24/7 Access', icon: ShieldCheck },
                     { label: 'RMA Management', desc: 'Hassle-Free', icon: RefreshCw }
                   ].map((item, idx) => (
                     <div key={idx} className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 text-[#1A2B4C]">
                           <item.icon size={18} />
                        </div>
                        <div className="flex flex-col">
                           <span className="text-xs font-black text-[#1A2B4C]">{item.label}</span>
                           <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">{item.desc}</span>
                        </div>
                     </div>
                   ))}
                </div>
            </motion.div>
          </div>
        </div>

        {/* Verified Customer Reviews */}
        <div className="mt-16 pt-16 border-t border-gray-100 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            
            {/* Left: Rating Summary */}
            <div className="md:col-span-4 bg-white rounded-3xl border border-gray-100 p-8 shadow-sm h-fit">
              <h3 className="text-xl font-black text-[#1A2B4C] mb-6">Product Ratings</h3>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-5xl font-black text-[#1A2B4C]">{totalRating}</span>
                <div>
                  <div className="flex items-center text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} fill={i < Math.floor(totalRating) ? "currentColor" : "none"} className={i < Math.floor(totalRating) ? "text-amber-500" : "text-gray-200"} />
                    ))}
                  </div>
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1 block">Based on {totalReviewsCount} ratings</span>
                </div>
              </div>

              {/* Rating bars */}
              <div className="space-y-2 mt-6">
                {[
                  { star: 5, pct: '82%' },
                  { star: 4, pct: '14%' },
                  { star: 3, pct: '4%' },
                  { star: 2, pct: '0%' },
                  { star: 1, pct: '0%' }
                ].map((bar, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-xs font-bold text-gray-500">
                    <span className="w-3">{bar.star}★</span>
                    <div className="flex-grow bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div style={{ width: bar.pct }} className="bg-[#00B4D8] h-full rounded-full"></div>
                    </div>
                    <span className="w-8 text-right text-gray-400 font-semibold">{bar.pct}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Reviews List & Feedback Form */}
            <div className="md:col-span-8 space-y-8">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-black text-[#1A2B4C] flex items-center gap-2">
                  <MessageSquare className="text-[#00B4D8]" size={20} />
                  Verified Purchase Experiences
                </h3>
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{totalReviewsCount} Feedbacks</span>
              </div>

              {/* Seeded Static Reviews for rich SEO Content & User reviews */}
              <div className="space-y-6">
                {/* Standard review A */}
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="block font-black text-sm text-[#1A2B4C]">Khawaja Ahmed.</span>
                      <span className="block text-[10px] text-gray-400 font-bold uppercase mt-0.5">Verified Buyer • Islamabad</span>
                    </div>
                    <div className="flex items-center text-amber-500">
                      {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="currentColor" className="text-amber-500" />)}
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-500 leading-relaxed">
                    Extremely satisfied with the service from AV Live Communications. We purchased this for our executive conference room in Rawalpindi, and chose the Enterprise Deployment. The engineers arrived on-site, handled the configuration with our SIP server, and registered the hardware. Excellent PTA-registered compliance.
                  </p>
                </div>

                {/* Standard review B */}
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="block font-black text-sm text-[#1A2B4C]">Zainab M.</span>
                      <span className="block text-[10px] text-gray-400 font-bold uppercase mt-0.5">Verified Corporate Customer • Karachi</span>
                    </div>
                    <div className="flex items-center text-amber-500 text-xs">
                      {[...Array(5)].map((_, i) => <Star key={i} size={12} fill={i < 4 ? "currentColor" : "none"} className={i < 4 ? "text-amber-500" : "text-gray-200"} />)}
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-500 leading-relaxed">
                    Very powerful collaboration system. Sound quality is crystal clear even in large boardrooms. Delivery to Karachi was secure and took only 2 days. Highly recommend standard import support from AV Live.
                  </p>
                </div>

                {/* Dynamic User Submissions */}
                {userReviews.map((rev, index) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={index} 
                    className="bg-[#00B4D8]/5 p-6 rounded-3xl border border-[#00B4D8]/20 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="block font-black text-sm text-[#1A2B4C]">{rev.name}</span>
                        <span className="block text-[10px] text-[#00B4D8] font-black uppercase mt-0.5">Submitted On {rev.date}</span>
                      </div>
                      <div className="flex items-center text-amber-500">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={12} fill={i < rev.rating ? "currentColor" : "none"} className={i < rev.rating ? "text-amber-500" : "text-gray-200"} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-gray-600 leading-relaxed">
                      {rev.content}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Feedback submission Form */}
              <div className="bg-gray-50 rounded-3xl p-6 md:p-8 border border-gray-100">
                <h4 className="text-base font-black text-[#1A2B4C] mb-4">Share Your Experience</h4>
                {reviewSubmitSuccess ? (
                  <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl text-center text-emerald-600 font-bold text-xs uppercase tracking-widest">
                    ✓ Thank you! Your review has been published instantly below.
                  </div>
                ) : (
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!newReviewName.trim() || !newReviewContent.trim()) return;
                      const newReview = {
                        name: newReviewName,
                        rating: newReviewRating,
                        content: newReviewContent,
                        date: new Date().toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' })
                      };
                      setUserReviews([...userReviews, newReview]);
                      setNewReviewName('');
                      setNewReviewContent('');
                      setReviewSubmitSuccess(true);
                      setTimeout(() => setReviewSubmitSuccess(false), 5000);
                    }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1" htmlFor="reviewer-name">Your Full Name</label>
                        <input 
                          id="reviewer-name"
                          type="text" 
                          placeholder="e.g. Haris Khan" 
                          value={newReviewName}
                          onChange={(e) => setNewReviewName(e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-[#00B4D8]"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1" htmlFor="reviewer-rating">Overall Rating</label>
                        <select 
                          id="reviewer-rating"
                          value={newReviewRating}
                          onChange={(e) => setNewReviewRating(Number(e.target.value))}
                          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs font-black text-[#1A2B4C] focus:outline-none focus:border-[#00B4D8]"
                        >
                          <option value={5}>5 Stars (Excellent Experience)</option>
                          <option value={4}>4 Stars (Very Satisfied)</option>
                          <option value={3}>3 Stars (Standard Quality)</option>
                          <option value={2}>2 Stars (Needs Improvement)</option>
                          <option value={1}>1 Star (Unsatisfactory)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1" htmlFor="reviewer-content">Detailed Feedback Description</label>
                      <textarea 
                        id="reviewer-content"
                        rows={4} 
                        placeholder="How has the system helped your corporate meetings or remote workspace collaboration?" 
                        value={newReviewContent}
                        onChange={(e) => setNewReviewContent(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl p-4 text-xs font-semibold focus:outline-none focus:border-[#00B4D8]"
                        required
                      ></textarea>
                    </div>

                    <button 
                      type="submit"
                      className="bg-[#1A2B4C] text-white px-8 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#00B4D8] transition-all"
                    >
                      Post Verified Review
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 pt-16 border-t border-gray-100">
            <h2 className="text-3xl font-black text-[#1A2B4C] mb-8 tracking-tight">Relevant Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 h-auto">
              {relatedProducts.map(prod => (
                <Link 
                 to={`/product/${prod.id}`} 
                 key={prod.id} 
                 className="bg-white group cursor-pointer rounded-3xl overflow-hidden flex flex-col border border-gray-100 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-2 relative"
               >
                  <div className="relative aspect-[4/3] bg-gradient-to-br from-[#1A2B4C]/5 to-[#00B4D8]/10 overflow-hidden">
                    {(() => {
                       const images = Array.isArray(prod.images) ? prod.images : (typeof prod.images === 'string' ? [prod.images] : (prod.image ? [prod.image] : []));
                       const firstImage = images[0] || 'https://placehold.co/600x600?text=No+Image';
                       const secondImage = images[1] || firstImage;
                       return (
                         <>
                           <img loading="lazy" 
                             src={firstImage} 
                             alt={prod.productName} 
                             className="absolute inset-0 w-full h-full object-cover mix-blend-multiply transition-opacity duration-500 ease-in-out group-hover:opacity-0"
                           />
                           <img loading="lazy" 
                             src={secondImage} 
                             alt={prod.productName} 
                             className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-0 transition-opacity duration-500 ease-in-out group-hover:opacity-100 scale-105"
                           />
                         </>
                       );
                    })()}
                    
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/40 backdrop-blur-sm flex items-center justify-center text-[#1A2B4C] hover:bg-[#1A2B4C] hover:text-white transition-colors z-10 shadow-sm"
                    >
                      <Heart size={14} />
                    </button>

                    {(prod.salePrice ?? 0) < (prod.regularPrice ?? 0) && (
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-[#00B4D8] text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md shadow-sm z-10">
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
                         <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider border border-gray-200 px-2 py-0.5 rounded-sm">
                           {prod.brand}
                         </span>
                       )}
                    </div>

                    <div className="mt-auto flex items-end justify-between gap-4 pt-4 border-t border-gray-50">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Price</span>
                        <div className="flex items-baseline gap-2">
                          <span className="font-black text-lg text-[#1A2B4C]">Rs. { ((prod.salePrice || prod.regularPrice) ?? 0).toLocaleString() }</span>
                        </div>
                      </div>
                    </div>
                  </div>
               </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
