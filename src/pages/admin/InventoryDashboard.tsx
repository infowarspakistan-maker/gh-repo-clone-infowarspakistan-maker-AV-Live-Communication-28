import { useState, useEffect, useMemo } from 'react';
import { 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownRight, 
  Search, 
  Filter, 
  Loader2, 
  Package, 
  History, 
  TrendingUp, 
  ShieldAlert,
  Save,
  X,
  History as HistoryIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Product, 
  getProducts, 
  updateStockWithHistory, 
  getStockHistory, 
  StockHistoryEntry,
  bulkUpdateStock 
} from '../../lib/firebase/firestore-helpers';

// ============================================
// SUB-COMPONENT: STOCK HISTORY MODAL
// ============================================

interface StockHistoryModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

function StockHistoryModal({ product, isOpen, onClose }: StockHistoryModalProps) {
  const [history, setHistory] = useState<StockHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (product && isOpen) {
      const fetchHistory = async () => {
        setLoading(true);
        try {
          const data = await getStockHistory(product.id!);
          setHistory(data);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      };
      fetchHistory();
    }
  }, [product, isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-[#1A2B4C]/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl border border-white/20"
          >
            <div className="p-10 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <div>
                <h2 className="text-3xl font-black text-[#1A2B4C] tracking-tight">Stock Ledger</h2>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-2">
                  {product?.productName} / {product?.sku}
                </p>
              </div>
              <button 
                onClick={onClose} 
                className="w-12 h-12 rounded-2xl bg-white text-gray-400 hover:text-red-500 hover:shadow-lg transition-all flex items-center justify-center border border-gray-100"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-10 max-h-[60vh] overflow-y-auto space-y-4">
              {loading ? (
                <div className="py-16 text-center">
                  <Loader2 className="animate-spin w-10 h-10 text-[#00B4D8] mx-auto mb-4" />
                </div>
              ) : history.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="text-gray-300 font-black uppercase tracking-widest text-[10px]">No history logs detected for this asset</p>
                </div>
              ) : (
                history.map((entry) => (
                  <div key={entry.id} className="bg-gray-50 rounded-2xl p-5 border border-gray-100 flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${
                        entry.change > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                      }`}>
                        {entry.change > 0 ? `+${entry.change}` : entry.change}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[#1A2B4C]">{entry.previousStock} → {entry.newStock}</div>
                        <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{entry.reason.replace('_', ' ')}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-black text-[#1A2B4C] uppercase tracking-widest">{entry.createdAt?.toDate().toLocaleDateString()}</div>
                      <div className="text-[8px] font-bold text-[#00B4D8] uppercase tracking-[0.2em]">{entry.updatedBy}</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-10 bg-gray-50/50 border-t border-gray-50">
              <button 
                onClick={onClose}
                className="w-full bg-[#1A2B4C] text-white font-black py-5 rounded-2xl hover:bg-[#00B4D8] transition-all uppercase tracking-[0.2em] text-[10px]"
              >
                Close Audit Log
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ============================================
// MAIN PAGE COMPONENT
// ============================================

export function InventoryDashboard() {
  const { userProfile } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'low' | 'out' | 'in'>('all');
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [bulkStockValue, setBulkStockValue] = useState<number | ''>('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [editingStock, setEditingStock] = useState<{ id: string; value: number } | null>(null);
  const [historyProduct, setHistoryProduct] = useState<Product | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          (p.productName || p.name || '').toLowerCase().includes(term) ||
          (p.sku || '').toLowerCase().includes(term)
      );
    }

    switch (filterType) {
      case 'low':
        filtered = filtered.filter(
          (p) => p.isActive && p.stockQuantity <= (p.lowStockThreshold || 10)
        );
        break;
      case 'out':
        filtered = filtered.filter((p) => p.isActive && p.stockQuantity === 0);
        break;
      case 'in':
        filtered = filtered.filter(
          (p) => p.isActive && p.stockQuantity > (p.lowStockThreshold || 10)
        );
        break;
    }

    return filtered;
  }, [products, searchTerm, filterType]);

  const stats = useMemo(() => {
    const active = products.filter((p) => p.isActive);
    const lowStock = active.filter((p) => p.stockQuantity <= (p.lowStockThreshold || 10));
    const outOfStock = active.filter((p) => p.stockQuantity === 0);
    const totalAssetValue = active.reduce((acc, p) => acc + ((p.stockQuantity || 0) * (p.regularPrice || 0)), 0);
    return { lowStockCount: lowStock.length, outOfStockCount: outOfStock.length, totalAssetValue };
  }, [products]);

  const handleStockUpdate = async (productId: string, newStock: number, reason: string = 'manual_update') => {
    setUpdatingId(productId);
    try {
      await updateStockWithHistory(productId, newStock, reason, userProfile?.email || 'admin');
      await fetchProducts();
      setEditingStock(null);
    } catch (error) {
      console.error(error);
      alert('Stock synchronization failed');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleBulkStockUpdate = async () => {
    if (selectedProducts.size === 0) return;
    if (bulkStockValue === '' || bulkStockValue < 0) return;

    if (!confirm(`Synchronize stock to ${bulkStockValue} for ${selectedProducts.size} assets?`)) return;

    setLoading(true);
    try {
      const updates = Array.from(selectedProducts).map((id) => ({
        id: id as string,
        stockQuantity: Number(bulkStockValue),
      }));
      await bulkUpdateStock(updates);
      setSelectedProducts(new Set());
      setBulkStockValue('');
      await fetchProducts();
    } catch (error) {
      console.error(error);
      alert('Bulk synchronization failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleProductSelection = (productId: string) => {
    const newSet = new Set(selectedProducts);
    if (newSet.has(productId)) {
      newSet.delete(productId);
    } else {
      newSet.add(productId);
    }
    setSelectedProducts(newSet);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <span className="text-[#00B4D8] text-xs font-black uppercase tracking-[0.3em] mb-2 block">Warehouse Intelligence</span>
          <h1 className="text-4xl font-black text-[#1A2B4C] tracking-tight">Stock Command Center</h1>
        </div>
        <div className="flex gap-4">
           <button 
             onClick={fetchProducts}
             className="bg-white border border-gray-100 text-gray-500 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:text-[#00B4D8] transition-all flex items-center gap-2"
           >
              <Loader2 className={loading ? 'animate-spin' : ''} size={16} /> Sync Cloud Node
           </button>
           <button className="bg-[#1A2B4C] text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-[#00B4D8] transition-all flex items-center gap-2">
              <TrendingUp size={16} /> Asset Trends
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform"></div>
            <div className="relative z-10">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Total Asset Value</p>
               <h3 className="text-3xl font-black text-[#1A2B4C]">PKR {stats.totalAssetValue.toLocaleString()}</h3>
               <div className="flex items-center gap-1.5 mt-4 text-emerald-500 text-[10px] font-bold">
                  <ArrowUpRight size={14} /> System-wide valuation
               </div>
            </div>
         </div>
         <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform"></div>
            <div className="relative z-10">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Low Stock Alerts</p>
               <h3 className="text-3xl font-black text-amber-500">{stats.lowStockCount} <span className="text-gray-300 text-lg font-bold">SKUs</span></h3>
               <div className="flex items-center gap-1.5 mt-4 text-amber-500 text-[10px] font-bold">
                  <ShieldAlert size={14} /> Immediate reorder recommended
               </div>
            </div>
         </div>
         <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform"></div>
            <div className="relative z-10">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Critical Depletion</p>
               <h3 className="text-3xl font-black text-red-500">{stats.outOfStockCount} <span className="text-gray-300 text-lg font-bold">Items</span></h3>
               <div className="flex items-center gap-1.5 mt-4 text-red-500 text-[10px] font-bold uppercase tracking-widest">
                  <AlertTriangle size={14} /> Zero availability detected
               </div>
            </div>
         </div>
      </div>

      <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
         <div className="p-10 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex gap-4">
              {['all', 'low', 'out', 'in'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type as any)}
                  className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                    filterType === type 
                    ? 'bg-[#1A2B4C] text-white shadow-lg' 
                    : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                  }`}
                >
                  {type} Nodes
                </button>
              ))}
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
               <div className="relative flex-1 md:w-80">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search SKUs..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:border-[#00B4D8] transition-all font-bold" 
                  />
               </div>
            </div>
         </div>

         {selectedProducts.size > 0 && (
           <motion.div 
             initial={{ height: 0, opacity: 0 }}
             animate={{ height: 'auto', opacity: 1 }}
             className="bg-[#1A2B4C] p-8 border-b border-[#00B4D8]/20 flex justify-between items-center"
           >
             <div className="flex items-center gap-6">
                <span className="text-white text-[10px] font-black uppercase tracking-widest">
                  <span className="text-[#00B4D8]">{selectedProducts.size}</span> Assets Selected for Protocol
                </span>
                <div className="h-8 w-px bg-white/10"></div>
                <div className="flex items-center gap-3">
                   <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Set Quantity:</label>
                   <input 
                     type="number"
                     value={bulkStockValue}
                     onChange={(e) => setBulkStockValue(e.target.value === '' ? '' : Number(e.target.value))}
                     className="w-24 bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white font-bold text-sm focus:outline-none focus:border-[#00B4D8]"
                   />
                </div>
             </div>
             <div className="flex gap-4">
                <button 
                  onClick={() => setSelectedProducts(new Set())}
                  className="px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-all"
                >
                  Abort
                </button>
                <button 
                  onClick={handleBulkStockUpdate}
                  className="bg-[#00B4D8] text-[#1A2B4C] px-8 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-xl"
                >
                  Finalize Bulk Sync
                </button>
             </div>
           </motion.div>
         )}

         {loading ? (
           <div className="py-40 text-center">
              <Loader2 className="animate-spin w-10 h-10 text-[#00B4D8] mx-auto mb-4" />
           </div>
         ) : (
           <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead>
                   <tr className="border-b border-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                      <th className="py-6 px-10 w-10">
                         <input 
                           type="checkbox"
                           checked={selectedProducts.size === filteredProducts.length && filteredProducts.length > 0}
                           onChange={() => {
                             if (selectedProducts.size === filteredProducts.length) setSelectedProducts(new Set());
                             else setSelectedProducts(new Set(filteredProducts.map(p => p.id!)));
                           }}
                           className="w-4 h-4 rounded border-gray-300 text-[#00B4D8] focus:ring-[#00B4D8]"
                         />
                      </th>
                      <th className="py-6 px-10">Asset / SKU</th>
                      <th className="py-6 px-10">Stock Level</th>
                      <th className="py-6 px-10">Threshold</th>
                      <th className="py-6 px-10 text-right">Audit Actions</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                   {filteredProducts.map(product => {
                      const threshold = product.lowStockThreshold || 10;
                      const isLow = product.stockQuantity <= threshold && product.stockQuantity > 0;
                      const isOut = product.stockQuantity === 0;

                      return (
                        <tr key={product.id} className={`hover:bg-gray-50/50 transition-colors group ${selectedProducts.has(product.id!) ? 'bg-gray-50' : ''}`}>
                           <td className="py-6 px-10">
                              <input 
                                type="checkbox"
                                checked={selectedProducts.has(product.id!)}
                                onChange={() => toggleProductSelection(product.id!)}
                                className="w-4 h-4 rounded border-gray-300 text-[#00B4D8] focus:ring-[#00B4D8]"
                              />
                           </td>
                           <td className="py-6 px-10">
                              <div className="flex items-center gap-4">
                                 <div className="w-12 h-12 bg-white rounded-xl border border-gray-100 p-2 shrink-0 shadow-sm">
                                    {(Array.isArray(product.images) ? product.images : (typeof product.images === 'string' ? [product.images] : (product.image ? [product.image] : [])))[0] ? (
                                      <img loading="lazy" src={product.images?.[0] || 'https://placehold.co/400x400?text=No+Image'} className="w-full h-full object-contain" />
                                    ) : (
                                      <Package className="w-full h-full text-gray-100" />
                                    )}
                                 </div>
                                 <div>
                                    <div className="font-bold text-[#1A2B4C] text-sm">{product.productName}</div>
                                    <div className="text-[10px] font-black text-[#00B4D8] uppercase tracking-widest">{product.sku}</div>
                                 </div>
                              </div>
                           </td>
                           <td className="py-6 px-10">
                              {editingStock?.id === product.id ? (
                                <div className="flex items-center gap-2">
                                  <input 
                                    type="number"
                                    value={editingStock.value}
                                    onChange={(e) => setEditingStock({ id: product.id!, value: e.target.value === '' ? 0 : Number(e.target.value) })}
                                    className="w-20 bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-[#1A2B4C] focus:outline-none focus:border-[#00B4D8]"
                                    autoFocus
                                  />
                                  <button onClick={() => handleStockUpdate(product.id!, editingStock.value)} className="text-emerald-500 hover:scale-110 transition-transform">
                                    <Save size={18} />
                                  </button>
                                  <button onClick={() => setEditingStock(null)} className="text-gray-300 hover:text-red-500">
                                    <X size={18} />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-3">
                                   <div className={`text-xl font-black ${isOut ? 'text-red-500' : isLow ? 'text-amber-500' : 'text-[#1A2B4C]'}`}>
                                      {product.stockQuantity}
                                   </div>
                                   <button 
                                     onClick={() => setEditingStock({ id: product.id!, value: product.stockQuantity })}
                                     className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-[#00B4D8] transition-all"
                                   >
                                      <TrendingUp size={14} />
                                   </button>
                                </div>
                              )}
                           </td>
                           <td className="py-6 px-10">
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest border border-gray-100 px-3 py-1.5 rounded-lg">
                                 Alert at {threshold}
                              </span>
                           </td>
                           <td className="py-6 px-10 text-right">
                              <div className="flex justify-end gap-2">
                                 <button 
                                   onClick={() => { setHistoryProduct(product); setShowHistoryModal(true); }}
                                   className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 hover:text-[#00B4D8] hover:bg-[#00B4D8]/5 transition-all flex items-center justify-center border border-gray-100"
                                   title="Audit Log"
                                 >
                                    <History size={18} />
                                 </button>
                                 <button 
                                   onClick={() => handleStockUpdate(product.id!, product.stockQuantity + 5, 'restock')}
                                   className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 transition-all flex items-center justify-center border border-gray-100"
                                   title="Add Stock (+5)"
                                 >
                                    <ArrowUpRight size={18} />
                                 </button>
                                 <button 
                                   onClick={() => handleStockUpdate(product.id!, Math.max(0, product.stockQuantity - 5), 'adjustment')}
                                   className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center border border-gray-100"
                                   title="Deduct Stock (-5)"
                                   disabled={product.stockQuantity === 0}
                                 >
                                    <ArrowDownRight size={18} />
                                 </button>
                              </div>
                           </td>
                        </tr>
                      );
                   })}
                </tbody>
             </table>
           </div>
         )}
      </div>

      <StockHistoryModal 
        product={historyProduct} 
        isOpen={showHistoryModal} 
        onClose={() => { setShowHistoryModal(false); setHistoryProduct(null); }} 
      />
    </div>
  );
}
