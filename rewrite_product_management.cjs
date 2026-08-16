const fs = require('fs');

const content = `
import { Plus, Trash2, Search, Filter, Download, X, ImageIcon, Loader2, FileText, Check, AlertCircle } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  subscribeToProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  uploadProductImage,
  Product,
  Category,
  getCategories
} from '../../lib/firebase/firestore-helpers';

export function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageUrlsText, setImageUrlsText] = useState('');
  
  const [formData, setFormData] = useState({
    productName: '',
    brand: '',
    categorySlugs: [] as string[],
    regularPrice: 0,
    salePrice: 0,
    stockQuantity: 0,
    shortDescription: '',
    description: '',
    specifications: '',
    sku: '',
    isActive: true
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'pricing' | 'media' | 'details'>('basic');

  useEffect(() => {
    getCategories().then(setCategories);
    
    const unsubscribe = subscribeToProducts((data) => {
      setProducts(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleEdit = (product: Product) => {
    setEditingId(product.id || null);
    setFormData({
      productName: product.productName,
      brand: product.brand,
      categorySlugs: product.categorySlugs || [],
      regularPrice: product.regularPrice,
      salePrice: product.salePrice || 0,
      stockQuantity: product.stockQuantity,
      shortDescription: product.shortDescription || '',
      description: product.description || '',
      specifications: product.specifications || '',
      sku: product.sku,
      isActive: product.isActive
    });
    setImageUrlsText((product.images || []).join('\\n'));
    setActiveTab('basic');
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let imageUrls = imageUrlsText
        .split('\\n')
        .map(url => url.trim())
        .filter(url => url.startsWith('http://') || url.startsWith('https://'));
      
      if (selectedFile) {
        const tempId = editingId || \`new_\${Date.now()}\`;
        const url = await uploadProductImage(selectedFile, tempId);
        imageUrls.push(url);
      }

      const productData = {
        ...formData,
        images: imageUrls,
        categoryIds: [],
        variations: [],
        lowStockThreshold: 5
      };

      if (editingId) {
        await updateProduct(editingId, productData);
      } else {
        await createProduct(productData);
      }

      setShowForm(false);
      setEditingId(null);
      resetForm();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteProduct(id);
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const resetForm = () => {
    setFormData({
      productName: '',
      brand: '',
      categorySlugs: [],
      regularPrice: 0,
      salePrice: 0,
      stockQuantity: 0,
      shortDescription: '',
      description: '',
      specifications: '',
      sku: '',
      isActive: true
    });
    setImageUrlsText('');
    setSelectedFile(null);
    setActiveTab('basic');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <span className="text-[#00B4D8] text-xs font-black uppercase tracking-[0.2em] mb-1 block">Inventory Control</span>
          <h1 className="text-4xl font-black text-[#1A2B4C] tracking-tight">Product Master</h1>
        </div>
        <div className="flex items-center gap-4">
          <Link 
            to="/admin/media-guide" 
            className="hidden sm:flex bg-white hover:bg-gray-50 text-[#1A2B4C] px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-gray-100 shadow-sm items-center gap-2"
          >
            <FileText size={14} className="text-[#00B4D8]" />
            Media URL Guide
          </Link>
          <button 
            onClick={() => {
              setEditingId(null);
              resetForm();
              setShowForm(true);
            }}
            className="bg-[#1A2B4C] text-white px-6 py-3.5 rounded-full hover:bg-[#00B4D8] transition-all flex items-center font-black text-[10px] uppercase tracking-widest shadow-lg hover:shadow-xl active:scale-95"
          >
            <Plus size={16} className="mr-2" />
            Add Equipment
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
         <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="relative w-full md:w-96">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
               <input 
                 type="text" 
                 placeholder="Search by name, SKU, or brand..." 
                 className="w-full border border-gray-200 rounded-2xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-[#00B4D8] transition-all bg-gray-50/50 font-medium text-[#1A2B4C]" 
               />
            </div>
            <div className="flex gap-3 w-full md:w-auto">
               <button className="flex-1 md:flex-none flex items-center justify-center gap-2 border border-gray-100 text-gray-500 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all">
                 <Filter size={14} /> Filter
               </button>
               <button className="flex-1 md:flex-none flex items-center justify-center gap-2 border border-gray-100 text-gray-500 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all">
                 <Download size={14} /> Export CSV
               </button>
            </div>
         </div>

         {loading ? (
           <div className="py-32 text-center">
              <Loader2 className="animate-spin w-10 h-10 text-[#00B4D8] mx-auto mb-4" />
              <div className="text-gray-400 font-black uppercase tracking-[0.2em] text-[10px]">Synchronizing Catalog...</div>
           </div>
         ) : (
           <div className="overflow-x-auto">
             <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/30 text-gray-400 uppercase tracking-[0.2em] text-[9px] font-black">
                    <th className="py-5 px-8 whitespace-nowrap">Equipment Details</th>
                    <th className="py-5 px-8 whitespace-nowrap">Category / Brand</th>
                    <th className="py-5 px-8 whitespace-nowrap">Inventory Status</th>
                    <th className="py-5 px-8 whitespace-nowrap">Market Value</th>
                    <th className="py-5 px-8 text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map(product => (
                    <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group cursor-pointer" onClick={() => handleEdit(product)}>
                      <td className="py-4 px-8">
                         <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-white rounded-2xl overflow-hidden border border-gray-100 p-2 shrink-0 shadow-sm flex items-center justify-center">
                               {product.images?.[0] ? (
                                 <img loading="lazy" src={product.images[0]} className="w-full h-full object-contain" />
                               ) : (
                                 <ImageIcon size={20} className="text-gray-300" />
                               )}
                            </div>
                            <div>
                               <div className="font-bold text-[#1A2B4C] text-sm mb-1 max-w-[250px] truncate">{product.productName}</div>
                               <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                  SKU: <span className="text-[#00B4D8]">{product.sku}</span>
                               </div>
                            </div>
                         </div>
                      </td>
                      <td className="py-4 px-8">
                         <div className="flex flex-col gap-1.5">
                            <span className="text-[10px] font-black text-[#1A2B4C] uppercase tracking-widest">{product.brand}</span>
                            <div className="flex flex-wrap gap-1">
                               {product.categorySlugs?.map(slug => (
                                  <span key={slug} className="text-[8px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded uppercase tracking-wider">{slug}</span>
                               ))}
                            </div>
                         </div>
                      </td>
                      <td className="py-4 px-8">
                         <div className="flex items-center gap-2">
                            <div className={\`w-2 h-2 rounded-full \${product.stockQuantity > 10 ? 'bg-emerald-500' : product.stockQuantity > 0 ? 'bg-amber-500' : 'bg-red-500'}\`}></div>
                            <span className="font-bold text-[#1A2B4C]">{product.stockQuantity} <span className="text-[10px] text-gray-400 font-bold ml-1 uppercase tracking-widest">Units</span></span>
                         </div>
                      </td>
                      <td className="py-4 px-8">
                         <div className="flex flex-col">
                            <span className="font-black text-[#1A2B4C]">Rs. {product.salePrice.toLocaleString()}</span>
                            {product.regularPrice > product.salePrice && (
                              <span className="text-[10px] font-bold text-gray-400 line-through">Rs. {product.regularPrice.toLocaleString()}</span>
                            )}
                         </div>
                      </td>
                      <td className="py-4 px-8">
                         <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                            <button 
                              onClick={() => handleDelete(product.id!)}
                              className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-100"
                              title="Delete Product"
                            >
                               <Trash2 size={14} />
                            </button>
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
             </table>
           </div>
         )}
      </div>

      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-[#1A2B4C]/40 backdrop-blur-sm"
              onClick={() => setShowForm(false)}
            />
            <motion.div 
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-3xl bg-white h-full shadow-2xl flex flex-col z-10"
            >
              <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
                <div>
                  <h2 className="text-2xl font-black text-[#1A2B4C] tracking-tight">{editingId ? 'Edit Equipment' : 'Deploy New Equipment'}</h2>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Fill required details below</p>
                </div>
                <button 
                  onClick={() => setShowForm(false)} 
                  className="w-10 h-10 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:shadow-md transition-all flex items-center justify-center"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gray-100 px-8 shrink-0">
                {[
                  { id: 'basic', label: 'Basic Info' },
                  { id: 'pricing', label: 'Pricing & Stock' },
                  { id: 'media', label: 'Media Gallery' },
                  { id: 'details', label: 'Descriptions & Specs' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={\`py-4 px-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-colors \${activeTab === tab.id ? 'border-[#00B4D8] text-[#1A2B4C]' : 'border-transparent text-gray-400 hover:text-[#1A2B4C]'}\`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <form id="product-form" onSubmit={handleSubmit} className="p-8 overflow-y-auto flex-grow space-y-8">
                {activeTab === 'basic' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="col-span-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 ml-1">Equipment Name *</label>
                        <input 
                          required
                          placeholder="e.g. Poly Studio X50 Video Bar"
                          value={formData.productName}
                          onChange={e => setFormData({...formData, productName: e.target.value})}
                          className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 focus:outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8] font-bold text-[#1A2B4C] transition-all text-sm" 
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 ml-1">Manufacturer SKU *</label>
                        <input 
                          required
                          placeholder="e.g. 2200-85970-101"
                          value={formData.sku}
                          onChange={e => setFormData({...formData, sku: e.target.value})}
                          className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 focus:outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8] font-bold text-[#1A2B4C] transition-all text-sm" 
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 ml-1">Brand Name *</label>
                        <input 
                          required
                          placeholder="e.g. Poly"
                          value={formData.brand}
                          onChange={e => setFormData({...formData, brand: e.target.value})}
                          className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 focus:outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8] font-bold text-[#1A2B4C] transition-all text-sm" 
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 ml-1">Categories (Comma Separated)</label>
                        <input 
                          placeholder="e.g. video-conferencing, endpoints"
                          value={formData.categorySlugs.join(', ')}
                          onChange={e => setFormData({...formData, categorySlugs: e.target.value.split(',').map(s => s.trim())})}
                          className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 focus:outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8] font-bold text-[#1A2B4C] transition-all text-sm" 
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'pricing' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="col-span-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 ml-1">Sale Price (PKR) *</label>
                        <div className="relative">
                          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">Rs.</span>
                          <input 
                            required
                            type="number"
                            min="0"
                            value={formData.salePrice}
                            onChange={e => setFormData({...formData, salePrice: parseInt(e.target.value) || 0})}
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-12 pr-5 py-4 focus:outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8] font-bold text-[#1A2B4C] transition-all text-sm" 
                          />
                        </div>
                      </div>
                      <div className="col-span-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 ml-1">Regular Price / MSRP (PKR)</label>
                        <div className="relative">
                          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">Rs.</span>
                          <input 
                            type="number"
                            min="0"
                            value={formData.regularPrice}
                            onChange={e => setFormData({...formData, regularPrice: parseInt(e.target.value) || 0})}
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-12 pr-5 py-4 focus:outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8] font-bold text-[#1A2B4C] transition-all text-sm" 
                          />
                        </div>
                      </div>
                      <div className="col-span-2 bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex items-start gap-3">
                         <AlertCircle size={16} className="text-blue-500 shrink-0 mt-0.5" />
                         <p className="text-xs text-blue-800 font-medium leading-relaxed">If Sale Price is lower than Regular Price, the product will show an "Inventory Special" badge and strikethrough pricing.</p>
                      </div>
                      <div className="col-span-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 ml-1">Available Stock Units *</label>
                        <input 
                          required
                          type="number"
                          min="0"
                          value={formData.stockQuantity}
                          onChange={e => setFormData({...formData, stockQuantity: parseInt(e.target.value) || 0})}
                          className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 focus:outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8] font-bold text-[#1A2B4C] transition-all text-sm" 
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'media' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 ml-1">Direct Upload</label>
                      <div className="border-2 border-dashed border-gray-200 rounded-3xl p-8 text-center hover:border-[#00B4D8] hover:bg-[#00B4D8]/5 transition-all group cursor-pointer bg-gray-50/50 h-[200px] flex flex-col justify-center items-center relative overflow-hidden">
                         <input 
                          type="file" 
                          id="product-image" 
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                          onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                         />
                         {selectedFile ? (
                            <div className="flex flex-col items-center gap-2">
                               <Check className="text-emerald-500" size={32} />
                               <span className="font-bold text-[#1A2B4C]">{selectedFile.name}</span>
                               <span className="text-xs text-gray-400">Click to change file</span>
                            </div>
                         ) : (
                            <div className="flex flex-col items-center pointer-events-none">
                              <ImageIcon className="text-gray-300 group-hover:text-[#00B4D8] transition-colors mb-3" size={36} />
                              <p className="text-sm font-bold text-[#1A2B4C] mb-1">Drop image here or click to browse</p>
                              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Supports JPG, PNG, WEBP (Max 5MB)</p>
                            </div>
                         )}
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2 ml-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">External Image URLs</label>
                        <span className="text-[9px] text-gray-400 uppercase tracking-wider">One URL per line</span>
                      </div>
                      <textarea 
                        rows={5}
                        placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                        value={imageUrlsText}
                        onChange={e => setImageUrlsText(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 focus:outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8] font-mono text-xs text-[#1A2B4C] transition-all resize-none shadow-inner"
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'details' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 ml-1">Short Summary (Preview)</label>
                      <textarea 
                        rows={3}
                        required
                        placeholder="Brief 1-2 sentence overview for the product card..."
                        value={formData.shortDescription}
                        onChange={e => setFormData({...formData, shortDescription: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 focus:outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8] font-medium text-[#1A2B4C] transition-all text-sm resize-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 ml-1">Full Technical Description</label>
                      <textarea 
                        rows={6}
                        placeholder="Detailed marketing and technical copy..."
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 focus:outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8] font-medium text-[#1A2B4C] transition-all text-sm resize-y"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2 ml-1">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Technical Specifications</label>
                         <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Format: Label: Value;</span>
                      </div>
                      <textarea 
                        rows={4}
                        placeholder="Resolution: 4K UltraHD; Field of View: 120 Degrees; Audio: Poly NoiseBlockAI;"
                        value={formData.specifications}
                        onChange={e => setFormData({...formData, specifications: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 focus:outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8] font-mono text-[#1A2B4C] transition-all text-xs resize-y"
                      />
                    </div>
                  </div>
                )}
              </form>

              <div className="p-6 border-t border-gray-100 flex gap-4 bg-gray-50/50 shrink-0">
                <button 
                  type="button" 
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-white border border-gray-200 text-[#1A2B4C] font-black py-4 rounded-2xl hover:bg-gray-50 transition-all uppercase tracking-widest text-[10px]"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  form="product-form"
                  disabled={isSubmitting}
                  className="flex-[2] bg-[#1A2B4C] text-white font-black py-4 rounded-2xl hover:bg-[#00B4D8] transition-all shadow-xl shadow-[#1A2B4C]/10 uppercase tracking-widest text-[10px] flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : 'Publish to Catalog'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
`;

fs.writeFileSync('src/pages/admin/ProductManagement.tsx', content);
console.log("Successfully rewritten ProductManagement.tsx");
