import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Box, Settings, Mic, Video, ShieldCheck, Speaker, Loader2, Zap, LayoutGrid, Layers, Heart } from 'lucide-react';
import { subscribeToCategories, subscribeToProducts, Product, Category as CategoryType } from '../lib/firebase/firestore-helpers';
import { addToCart } from '../lib/cart';
import { SEO } from '../components/SEO';
import { Breadcrumbs } from '../components/Breadcrumbs';

export function Category() {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubCategories = subscribeToCategories((cats) => {
      setCategories(cats);
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

  const currentCategory = categories.find(c => c.slug === categorySlug);
  
  const subcategories = currentCategory 
    ? categories.filter(c => c.parentId === currentCategory.id && c.isActive)
    : [];

  const categoryProducts = currentCategory
    ? products.filter(p => (Array.isArray(p.categorySlugs) ? p.categorySlugs : typeof p.categorySlugs === 'string' ? [p.categorySlugs] : []).includes(categorySlug!) || p.categoryIds?.includes(currentCategory.id!))
    : [];

  const brandsIncategory = Array.from(new Set(categoryProducts.map(p => p.brand || 'Unknown'))).sort();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
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
        <h1 className="text-4xl font-black text-[#1A2B4C] mb-4">Classification Error</h1>
        <p className="text-gray-500 mb-8 font-medium">The hardware category you requested is not indexed.</p>
        <Link to="/shop" className="bg-[#1A2B4C] text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#00B4D8] transition-all shadow-xl">
          Browse All Inventory
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#F8F9FA] min-h-screen pb-16 text-[#1A2B4C]">
      <SEO 
        title={`${currentCategory.name} | Professional AV Categories | AV Live`}
        description={`Explore our selection of ${currentCategory.name}. High-quality hardware and professional deployments in Pakistan.`}
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
              <img loading="lazy" src={currentCategory.imageUrl} alt={currentCategory.name} className="w-full h-full object-cover rounded-[2.5rem]" />
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
                  {brandsIncategory.map(brand => (
                    <Link key={brand} to={`/shop?brand=${brand.toString().toLowerCase()}`} className="flex items-center justify-between group">
                       <span className="text-sm font-black uppercase tracking-widest text-[#1A2B4C] group-hover:text-[#00B4D8] transition-colors">{brand}</span>
                       <div className="w-1.5 h-1.5 bg-gray-100 rounded-full group-hover:bg-[#00B4D8] transition-colors"></div>
                    </Link>
                  ))}
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
                {categoryProducts.map((product, idx) => (
                  <motion.div 
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white group rounded-[2.5rem] overflow-hidden border border-gray-100 hover:border-[#00B4D8] transition-all shadow-sm hover:shadow-2xl"
                  >
                    <Link to={`/product/${product.id}`} className="aspect-square bg-gray-50 overflow-hidden block">
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
                       <Link to={`/product/${product.id}`} className="block">
                          <h3 className="font-black text-[#1A2B4C] group-hover:text-[#00B4D8] transition-colors line-clamp-2 leading-tight mb-8 h-10">{product.productName}</h3>
                       </Link>
                       <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                          <span className="text-xl font-black">Rs. {(product.salePrice ?? 0).toLocaleString()}</span>
                          <button 
                            onClick={() => addToCart({
                              id: product.id!,
                              name: product.productName,
                              price: product.salePrice,
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
                ))}

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
    </div>
  );
}

