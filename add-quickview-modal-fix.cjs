const fs = require('fs');

const content = fs.readFileSync('src/pages/Shop.tsx', 'utf8');

const quickViewModal = `
      {/* Quick View Modal */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setQuickViewProduct(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[2.5rem] shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row relative"
          >
            <button 
              onClick={() => setQuickViewProduct(null)}
              className="absolute top-4 right-4 w-10 h-10 bg-gray-100 hover:bg-gray-200 text-[#1A2B4C] rounded-full flex items-center justify-center transition-colors z-10"
            >
              <X size={20} />
            </button>
            
            <div className="w-full md:w-1/2 h-64 md:h-auto bg-gray-50 flex items-center justify-center p-8 shrink-0">
               <img 
                 src={quickViewProduct.images?.[0] || 'https://placehold.co/600x600?text=No+Image'} 
                 alt={quickViewProduct.productName}
                 className="w-full h-full object-contain drop-shadow-xl"
               />
            </div>
            
            <div className="p-8 md:p-10 flex flex-col flex-grow overflow-y-auto">
               <div className="flex items-center gap-2 mb-4">
                  <span className="text-[10px] text-[#00B4D8] font-black uppercase tracking-widest">{quickViewProduct.brand}</span>
                  <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
                  <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{quickViewProduct.sku}</span>
               </div>
               
               <h2 className="text-2xl md:text-3xl font-black text-[#1A2B4C] mb-4 leading-tight">{quickViewProduct.productName}</h2>
               
               <p className="text-gray-500 font-medium text-sm leading-relaxed mb-8 line-clamp-4">
                 {quickViewProduct.shortDescription || quickViewProduct.description}
               </p>
               
               <div className="mt-auto pt-6 border-t border-gray-100 flex flex-col gap-6">
                 <div className="flex items-baseline gap-3">
                   <span className="font-black text-3xl text-[#1A2B4C]">Rs. {quickViewProduct.salePrice?.toLocaleString()}</span>
                   {quickViewProduct.salePrice < quickViewProduct.regularPrice && (
                     <span className="text-sm text-gray-400 line-through font-bold">Rs. {quickViewProduct.regularPrice?.toLocaleString()}</span>
                   )}
                 </div>
                 
                 <div className="flex gap-4">
                   <button 
                     onClick={() => {
                        addToCart({
                          id: quickViewProduct.id,
                          name: quickViewProduct.productName,
                          price: quickViewProduct.salePrice,
                          image: quickViewProduct.images?.[0] || '',
                          brand: quickViewProduct.brand
                        });
                        setQuickViewProduct(null);
                     }}
                     className="flex-1 bg-[#1A2B4C] text-white h-14 rounded-2xl flex items-center justify-center hover:bg-[#00B4D8] transition-all shadow-lg font-black uppercase tracking-widest text-xs gap-2 active:scale-95"
                   >
                     <Zap size={16} /> Add to Cart
                   </button>
                   <Link
                     to={\`/product/\${quickViewProduct.id}\`}
                     className="w-14 h-14 bg-gray-50 text-[#1A2B4C] rounded-2xl flex items-center justify-center hover:bg-gray-100 transition-colors border border-gray-200"
                   >
                     <ArrowRight size={20} />
                   </Link>
                 </div>
               </div>
            </div>
          </motion.div>
        </div>
      )}
`;

const updated = content.replace(
  "      </div>\n    </div>\n  );\n}",
  quickViewModal + "\n      </div>\n    </div>\n  );\n}"
);

if (updated !== content) {
  fs.writeFileSync('src/pages/Shop.tsx', updated);
  console.log("Successfully added Quick View Modal");
} else {
  console.log("Failed to match replace string");
}
