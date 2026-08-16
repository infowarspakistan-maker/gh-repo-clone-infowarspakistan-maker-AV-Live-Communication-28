const fs = require('fs');

const content = `
import { useEffect, useState } from 'react';
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
  CreditCard
} from 'lucide-react';
import { getProduct, Product } from '../lib/firebase/firestore-helpers';
import { addToCart } from '../lib/cart';
import { SEO } from '../components/SEO';
import { Breadcrumbs } from '../components/Breadcrumbs';

export function ProductDetails() {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'specs' | 'in-the-box' | 'support'>('overview');
  const [isZooming, setIsZooming] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (productId) {
      getProduct(productId)
        .then(data => {
          setProduct(data);
          setLoading(false);
        })
        .catch(console.error);
    }
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

  const handleAddToCart = () => {
    addToCart({
      id: product.id!,
      name: product.productName,
      price: product.salePrice,
      image: product.images?.[0] || '',
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

  return (
    <div className="bg-[#F8F9FA] min-h-screen text-[#1A2B4C]">
      <SEO 
        title={\`\${product.productName} | \${product.brand} | AV Live\`}
        description={product.description?.substring(0, 160) || \`Buy \${product.productName} by \${product.brand}. Expert AV hardware and collaboration tools.\`}
        image={product.images?.[0] || product.image}
      />
      
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-100 py-4 sticky top-[72px] md:top-[88px] z-30">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
           <Breadcrumbs items={[
             { label: 'Shop', path: '/shop' },
             { label: product.brand, path: \`/shop?brand=\${product.brand.toLowerCase()}\` },
             { label: product.productName }
           ]} />
           <div className="hidden md:flex items-center gap-4">
              <span className="font-black text-[#1A2B4C]">Rs. {product.salePrice.toLocaleString()}</span>
              <button 
                onClick={handleAddToCart}
                className="bg-[#00B4D8] text-white px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-[#1A2B4C] transition-all"
              >
                Buy Now
              </button>
           </div>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Left: Image Gallery (Span 7) */}
          <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4 md:gap-6">
             {/* Thumbnail Strip */}
             <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-y-auto w-full md:w-24 shrink-0 no-scrollbar py-2 md:py-0">
               {product.images?.map((img, idx) => (
                 <button 
                   key={idx}
                   onClick={() => setActiveImage(idx)}
                   className={\`w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border-2 transition-all shrink-0 bg-white \${activeImage === idx ? 'border-[#00B4D8] shadow-md scale-95' : 'border-transparent hover:border-gray-200 opacity-60 hover:opacity-100'}\`}
                 >
                   <img loading="lazy" src={img} alt="Thumbnail" className="w-full h-full object-contain p-2" />
                 </button>
               ))}
             </div>

             {/* Main Image */}
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="bg-white rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden relative flex-grow aspect-square md:aspect-auto md:min-h-[600px] cursor-crosshair group flex items-center justify-center p-12"
               onMouseEnter={() => setIsZooming(true)}
               onMouseLeave={() => setIsZooming(false)}
               onMouseMove={handleMouseMove}
             >
               <div className="absolute top-6 left-6 flex flex-col gap-2 z-10">
                 {product.salePrice < product.regularPrice && (
                   <div className="bg-[#00B4D8] text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-lg">
                     Save Rs. {(product.regularPrice - product.salePrice).toLocaleString()}
                   </div>
                 )}
                 {product.stockQuantity < 5 && product.stockQuantity > 0 && (
                   <div className="bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-lg">
                     Only {product.stockQuantity} Left
                   </div>
                 )}
               </div>
               
               <div className="absolute top-6 right-6 flex gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center text-[#1A2B4C] hover:bg-[#00B4D8] hover:text-white transition-all shadow-md">
                     <Share2 size={16} />
                  </button>
                  <button className="w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center text-[#1A2B4C] hover:bg-rose-500 hover:text-white transition-all shadow-md">
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
                   src={product.images?.[activeImage] || 'https://placehold.co/800x800?text=No+Image'} 
                   alt={product.productName} 
                   className={\`w-full h-full object-contain transition-transform duration-200 \${isZooming ? 'scale-[2]' : 'scale-100'}\`}
                   style={isZooming ? {
                     transformOrigin: \`\${mousePos.x}% \${mousePos.y}%\`
                   } : undefined}
                 />
               </AnimatePresence>
             </motion.div>
          </div>

          {/* Right: Technical Specs & Purchase Module (Span 5) */}
          <div className="lg:col-span-5 flex flex-col relative">
            <div className="sticky top-[120px] lg:top-[160px]">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div>
                  <div className="flex items-center gap-3 mb-4">
                     <span className="text-[#00B4D8] text-xs font-black uppercase tracking-[0.2em]">{product.brand}</span>
                     <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                     <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">SKU: {product.sku}</span>
                  </div>
                  
                  <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-[1.1] mb-6">{product.productName}</h1>
                  
                  <p className="text-gray-500 font-medium leading-relaxed text-lg">
                    {product.shortDescription}
                  </p>
                </div>

                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
                  <div className="flex items-end justify-between border-b border-gray-100 pb-6">
                    <div className="flex flex-col">
                      <span className="text-5xl font-black text-[#1A2B4C] tracking-tight">Rs. {product.salePrice.toLocaleString()}</span>
                      {product.salePrice < product.regularPrice && (
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-sm text-gray-400 line-through font-bold">Rs. {product.regularPrice.toLocaleString()}</span>
                          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-50 px-2 py-1 rounded">
                            {Math.round(((product.regularPrice - product.salePrice) / product.regularPrice) * 100)}% OFF
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                     <div className="flex items-center gap-2 text-sm font-bold text-[#1A2B4C]">
                        {product.stockQuantity > 0 ? (
                           <>
                             <CheckCircle size={16} className="text-emerald-500" /> 
                             <span className="text-emerald-600">In Stock & Ready to Ship</span>
                           </>
                        ) : (
                           <>
                             <Info size={16} className="text-rose-500" /> 
                             <span className="text-rose-600">Currently Out of Stock</span>
                           </>
                        )}
                     </div>
                     <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest pl-6">
                       Free Shipping on orders over Rs. 100,000
                     </div>
                  </div>

                  {/* Purchase Controls */}
                  <div className="flex flex-col gap-4 pt-4">
                    <div className="flex items-center gap-4">
                       <div className="flex items-center bg-gray-50 border border-gray-100 rounded-2xl p-2 w-32">
                         <button 
                           onClick={() => setQuantity(Math.max(1, quantity - 1))}
                           className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-[#1A2B4C] transition-colors bg-white rounded-xl shadow-sm"
                         >
                           <Minus size={16} />
                         </button>
                         <span className="flex-1 text-center font-black text-lg">{quantity}</span>
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
                    <button className="w-full bg-[#00B4D8] text-white h-[60px] rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#0096B4] transition-all shadow-xl shadow-[#00B4D8]/20 flex items-center justify-center gap-3 active:scale-95 mt-2">
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
        </div>

        {/* Detailed Intelligence Tabs */}
        <div className="mt-32 max-w-5xl mx-auto">
          <div className="flex gap-8 mb-12 overflow-x-auto border-b border-gray-200">
             {[
               { id: 'overview', label: 'Product Overview' },
               { id: 'specs', label: 'Technical Specs' },
               { id: 'in-the-box', label: 'What\\'s in the Box' },
               { id: 'support', label: 'Support & Warranty' }
             ].map(tab => (
               <button 
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id as any)}
                 className={\`text-xs font-black uppercase tracking-[0.2em] pb-6 border-b-4 transition-all whitespace-nowrap \${activeTab === tab.id ? 'border-[#00B4D8] text-[#1A2B4C]' : 'border-transparent text-gray-400 hover:text-[#1A2B4C]'}\`}
               >
                 {tab.label}
               </button>
             ))}
          </div>
             
          <div className="min-h-[400px]">
             <AnimatePresence mode="wait">
               {activeTab === 'overview' && (
                 <motion.div 
                   key="overview"
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -10 }}
                   className="prose prose-blue prose-lg max-w-none"
                 >
                    <div className="text-gray-600 leading-relaxed font-medium whitespace-pre-wrap">
                       {product.description}
                    </div>
                    
                    <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
                       <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center">
                          <PlayCircle className="w-12 h-12 text-[#00B4D8] mx-auto mb-4" />
                          <h4 className="font-black text-[#1A2B4C] mb-2">Plug and Play</h4>
                          <p className="text-sm text-gray-500 font-medium">Deploy in minutes with minimal configuration required.</p>
                       </div>
                       <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center">
                          <Headset className="w-12 h-12 text-[#00B4D8] mx-auto mb-4" />
                          <h4 className="font-black text-[#1A2B4C] mb-2">Enterprise Audio</h4>
                          <p className="text-sm text-gray-500 font-medium">Crystal clear communication with advanced noise blocking.</p>
                       </div>
                       <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center">
                          <ShieldCheck className="w-12 h-12 text-[#00B4D8] mx-auto mb-4" />
                          <h4 className="font-black text-[#1A2B4C] mb-2">Secure Architecture</h4>
                          <p className="text-sm text-gray-500 font-medium">Built with enterprise-grade security protocols standard.</p>
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
                   <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                     {specificationsList.length > 0 ? (
                       <div className="divide-y divide-gray-50">
                         {specificationsList.map((spec, idx) => {
                           const parts = spec.split(':');
                           if (parts.length < 2) return null;
                           const label = parts[0];
                           const val = parts.slice(1).join(':');
                           return (
                             <div key={idx} className="flex flex-col md:flex-row md:items-center p-6 hover:bg-gray-50 transition-colors">
                               <span className="w-1/3 text-xs font-black uppercase tracking-widest text-gray-400 mb-2 md:mb-0">{label.trim()}</span>
                               <span className="w-2/3 text-sm font-bold text-[#1A2B4C]">{val.trim()}</span>
                             </div>
                           );
                         })}
                       </div>
                     ) : (
                       <div className="p-12 text-center text-gray-500 font-medium">
                         No detailed specifications available for this product.
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
                   <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-12 text-center">
                      <Box className="w-16 h-16 text-gray-300 mx-auto mb-6" />
                      <h3 className="text-2xl font-black text-[#1A2B4C] mb-8">Standard Package Contents</h3>
                      <ul className="max-w-md mx-auto text-left space-y-4">
                        <li className="flex items-center gap-4 text-gray-600 font-medium"><CheckCircle className="text-emerald-500" size={20} /> Main Hardware Unit</li>
                        <li className="flex items-center gap-4 text-gray-600 font-medium"><CheckCircle className="text-emerald-500" size={20} /> Power Supply & Cable</li>
                        <li className="flex items-center gap-4 text-gray-600 font-medium"><CheckCircle className="text-emerald-500" size={20} /> Network Cable (Cat5e/Cat6)</li>
                        <li className="flex items-center gap-4 text-gray-600 font-medium"><CheckCircle className="text-emerald-500" size={20} /> Mounting Hardware (if applicable)</li>
                        <li className="flex items-center gap-4 text-gray-600 font-medium"><CheckCircle className="text-emerald-500" size={20} /> Setup Guide & Documentation</li>
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
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-10">
                        <ShieldCheck className="w-12 h-12 text-[#00B4D8] mb-6" />
                        <h3 className="text-xl font-black text-[#1A2B4C] mb-4">Standard Warranty</h3>
                        <p className="text-gray-500 font-medium leading-relaxed mb-6">
                          This product includes a standard 1-year manufacturer warranty covering defects in materials and workmanship.
                        </p>
                        <button className="text-xs font-black text-[#00B4D8] uppercase tracking-widest hover:underline">
                          View Warranty Details
                        </button>
                     </div>
                     <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-10">
                        <CreditCard className="w-12 h-12 text-[#00B4D8] mb-6" />
                        <h3 className="text-xl font-black text-[#1A2B4C] mb-4">Extended Protection</h3>
                        <p className="text-gray-500 font-medium leading-relaxed mb-6">
                          Add AV Live Premier Support for advanced hardware replacement, 24/7 technical assistance, and priority RMA handling.
                        </p>
                        <button className="text-xs font-black text-[#00B4D8] uppercase tracking-widest hover:underline">
                          Contact Sales for Quote
                        </button>
                     </div>
                   </div>
                 </motion.div>
               )}
             </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/pages/ProductDetails.tsx', content);
console.log("Successfully rewritten ProductDetails.tsx");
