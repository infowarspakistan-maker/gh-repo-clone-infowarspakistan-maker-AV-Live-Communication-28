import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Search, 
  Loader2, 
  Package, 
  Eye, 
  Truck, 
  Clock, 
  AlertCircle,
  MapPin,
  Phone,
  TrendingUp,
  X,
  Save,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Order, 
  subscribeToOrders, 
  updateOrderStatus, 
  addTrackingNumber, 
  getOrderStats 
} from '../../lib/firebase/firestore-helpers';

// ============================================
// SUB-COMPONENT: ORDER DETAIL MODAL
// ============================================

interface OrderDetailModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: () => void;
}

function OrderDetailModal({ order, isOpen, onClose, onStatusUpdate }: OrderDetailModalProps) {
  const [trackingInput, setTrackingInput] = useState(order?.trackingNumber || '');
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState<Order['orderStatus']>(order?.orderStatus || 'pending');

  useEffect(() => {
    if (order) {
      setNewStatus(order.orderStatus);
      setTrackingInput(order.trackingNumber || '');
    }
  }, [order]);

  if (!isOpen || !order) return null;

  const handleStatusUpdate = async () => {
    setUpdating(true);
    try {
      await updateOrderStatus(order.id!, newStatus);
      onStatusUpdate();
    } catch (error) {
      console.error(error);
      alert('Status update failed');
    } finally {
      setUpdating(false);
    }
  };

  const handleTrackingUpdate = async () => {
    if (!trackingInput.trim()) return;
    setUpdating(true);
    try {
      await addTrackingNumber(order.id!, trackingInput.trim());
      onStatusUpdate();
    } catch (error) {
      console.error(error);
      alert('Tracking synchronization failed');
    } finally {
      setUpdating(false);
    }
  };

  const statusOptions: Order['orderStatus'][] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-PK', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-[#1A2B4C]/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-[3rem] w-full max-w-4xl overflow-hidden shadow-2xl border border-white/20 flex flex-col max-h-[90vh]"
          >
            <div className="p-10 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <div>
                <div className="flex items-center gap-3 mb-2">
                   <h2 className="text-3xl font-black text-[#1A2B4C] tracking-tight">Order #{order.orderNumber}</h2>
                   <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      order.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                   }`}>
                      {order.paymentStatus}
                   </span>
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  Placed on {formatDate(order.createdAt)}
                </p>
              </div>
              <button 
                onClick={onClose} 
                className="w-12 h-12 rounded-2xl bg-white text-gray-400 hover:text-red-500 hover:shadow-lg transition-all flex items-center justify-center border border-gray-100"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-10">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                     <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">Customer Protocol</h3>
                     <div className="bg-gray-50 rounded-3xl p-6 space-y-4">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#1A2B4C] shadow-sm">
                              <Eye size={18} />
                           </div>
                           <div>
                              <div className="text-sm font-bold text-[#1A2B4C]">{order.customerName}</div>
                              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{order.customerEmail}</div>
                           </div>
                        </div>
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#1A2B4C] shadow-sm">
                              <Phone size={18} />
                           </div>
                           <div className="text-sm font-bold text-[#1A2B4C]">{order.customerPhone}</div>
                        </div>
                        <div className="flex items-start gap-4">
                           <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#1A2B4C] shadow-sm shrink-0">
                              <MapPin size={18} />
                           </div>
                           <div className="text-sm font-bold text-[#1A2B4C] leading-relaxed">{order.shippingAddress}</div>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-6">
                     <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">Status Control</h3>
                     <div className="bg-gray-50 rounded-3xl p-6 space-y-6">
                        <div>
                           <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-3">Lifecycle Stage</label>
                           <div className="flex gap-2">
                              <select 
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value as any)}
                                className="flex-1 bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-[#1A2B4C] focus:outline-none focus:border-[#00B4D8]"
                              >
                                 {statusOptions.map(s => (
                                   <option key={s} value={s}>{s.toUpperCase()}</option>
                                 ))}
                              </select>
                              <button 
                                onClick={handleStatusUpdate}
                                disabled={updating || newStatus === order.orderStatus}
                                className="bg-[#1A2B4C] text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#00B4D8] transition-all disabled:opacity-50"
                              >
                                 Update
                              </button>
                           </div>
                        </div>

                        <div>
                           <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-3">Carrier Intelligence</label>
                           <div className="flex gap-2">
                              <input 
                                type="text"
                                placeholder="Tracking ID..."
                                value={trackingInput}
                                onChange={(e) => setTrackingInput(e.target.value)}
                                className="flex-1 bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-[#1A2B4C] focus:outline-none focus:border-[#00B4D8]"
                              />
                              <button 
                                onClick={handleTrackingUpdate}
                                disabled={updating || !trackingInput.trim()}
                                className="bg-gray-200 text-gray-500 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-300 transition-all disabled:opacity-50"
                              >
                                 Add
                              </button>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="space-y-6">
                  <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">Manifest (Asset Breakdown)</h3>
                  <div className="bg-white border border-gray-50 rounded-[2rem] overflow-hidden">
                     <table className="w-full">
                        <thead>
                           <tr className="bg-gray-50 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                              <th className="py-4 px-6 text-left">Asset</th>
                              <th className="py-4 px-6 text-center">Qty</th>
                              <th className="py-4 px-6 text-right">Unit Price</th>
                              <th className="py-4 px-6 text-right">Extension</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                           {order.items.map((item, idx) => (
                             <tr key={idx} className="group">
                                <td className="py-4 px-6">
                                   <div className="text-sm font-bold text-[#1A2B4C]">{item.productName}</div>
                                   <div className="text-[9px] font-black text-[#00B4D8] uppercase tracking-widest">{item.sku}</div>
                                </td>
                                <td className="py-4 px-6 text-center font-bold text-sm">{item.quantity}</td>
                                <td className="py-4 px-6 text-right font-bold text-sm">PKR {(item.price ?? 0).toLocaleString()}</td>
                                <td className="py-4 px-6 text-right font-black text-sm text-[#1A2B4C]">PKR {(item.total ?? 0).toLocaleString()}</td>
                             </tr>
                           ))}
                        </tbody>
                        <tfoot>
                           <tr className="bg-gray-50/50">
                              <td colSpan={3} className="py-6 px-10 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Valuation</td>
                              <td className="py-6 px-10 text-right text-2xl font-black text-[#1A2B4C]">PKR {(order.total ?? 0).toLocaleString()}</td>
                           </tr>
                        </tfoot>
                     </table>
                  </div>
               </div>
            </div>

            <div className="p-10 bg-gray-50/50 border-t border-gray-50">
              <button 
                onClick={onClose}
                className="w-full bg-[#1A2B4C] text-white font-black py-5 rounded-2xl hover:bg-[#00B4D8] transition-all uppercase tracking-[0.2em] text-[10px]"
              >
                Close Tactical View
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

export function OrderManagement() {
  const { userProfile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<Order['orderStatus'] | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState<any>(null);

  const fetchStats = useCallback(async () => {
    try {
      const data = await getOrderStats();
      setStats(data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const loadOrders = async () => {
      setLoading(true);
      const filter = statusFilter !== 'all' ? { orderStatus: statusFilter } : undefined;
      unsubscribe = subscribeToOrders((data) => {
        setOrders(data);
        setLoading(false);
      }, filter);
    };

    loadOrders();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [statusFilter]);

  const filteredOrders = useMemo(() => {
    if (!searchTerm) return orders;
    const term = searchTerm.toLowerCase();
    return orders.filter(
      (o) =>
        (o.orderNumber || '').toLowerCase().includes(term) ||
        (o.customerName || '').toLowerCase().includes(term) ||
        (o.customerEmail || '').toLowerCase().includes(term)
    );
  }, [orders, searchTerm]);

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const statusColors: Record<Order['orderStatus'] | 'all', string> = {
    all: 'bg-gray-100 text-gray-500',
    pending: 'bg-amber-50 text-amber-600',
    processing: 'bg-blue-50 text-blue-600',
    shipped: 'bg-purple-50 text-purple-600',
    delivered: 'bg-emerald-50 text-emerald-600',
    cancelled: 'bg-red-50 text-red-600',
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <span className="text-[#00B4D8] text-xs font-black uppercase tracking-[0.3em] mb-2 block">Supply Chain Intelligence</span>
          <h1 className="text-4xl font-black text-[#1A2B4C] tracking-tight">Order Management</h1>
        </div>
        <div className="flex gap-4">
           <button 
             onClick={fetchStats}
             className="bg-white border border-gray-100 text-gray-500 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:text-[#00B4D8] transition-all flex items-center gap-2"
           >
              <Loader2 className={loading ? 'animate-spin' : ''} size={16} /> Sync Logs
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Total Revenue</p>
            <h3 className="text-2xl font-black text-[#1A2B4C]">PKR {(stats?.totalRevenue ?? 0).toLocaleString()}</h3>
         </div>
         <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Pending Nodes</p>
            <h3 className="text-2xl font-black text-amber-500">{stats?.pendingOrders || 0}</h3>
         </div>
         <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Processing</p>
            <h3 className="text-2xl font-black text-blue-500">{stats?.processingOrders || 0}</h3>
         </div>
         <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Delivered</p>
            <h3 className="text-2xl font-black text-emerald-500">{stats?.deliveredOrders || 0}</h3>
         </div>
      </div>

      <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
         <div className="p-10 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex gap-4 flex-wrap">
              {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status as any)}
                  className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                    statusFilter === status 
                    ? 'bg-[#1A2B4C] text-white shadow-lg' 
                    : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
            <div className="relative flex-1 md:w-80">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
               <input 
                 type="text" 
                 placeholder="Search Orders / Customers..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:border-[#00B4D8] transition-all font-bold" 
               />
            </div>
         </div>

         {loading ? (
            <div className="py-40 text-center">
               <Loader2 className="animate-spin w-10 h-10 text-[#00B4D8] mx-auto" />
            </div>
         ) : filteredOrders.length === 0 ? (
            <div className="py-40 text-center">
               <p className="text-gray-300 font-black uppercase tracking-widest text-[10px]">No transmission logs detected in this sector</p>
            </div>
         ) : (
           <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead>
                   <tr className="border-b border-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                      <th className="py-6 px-10">Order Identity</th>
                      <th className="py-6 px-10">Customer Protocol</th>
                      <th className="py-6 px-10">Timestamp</th>
                      <th className="py-6 px-10">Valuation</th>
                      <th className="py-6 px-10">Status</th>
                      <th className="py-6 px-10 text-right">Actions</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                   {filteredOrders.map(order => (
                      <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group" onClick={() => handleOrderClick(order)}>
                         <td className="py-6 px-10">
                            <div className="font-bold text-[#1A2B4C] text-sm">#{order.orderNumber}</div>
                            <div className="text-[9px] font-black text-[#00B4D8] uppercase tracking-widest">{order.paymentMethod.replace('_', ' ')}</div>
                         </td>
                         <td className="py-6 px-10">
                            <div className="font-bold text-[#1A2B4C] text-sm">{order.customerName}</div>
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{order.customerEmail}</div>
                         </td>
                         <td className="py-6 px-10 text-[10px] font-black text-[#1A2B4C] uppercase tracking-widest">
                            {order.createdAt?.toDate().toLocaleDateString('en-PK', { day: '2-digit', month: 'short' })}
                         </td>
                         <td className="py-6 px-10 font-black text-sm text-[#1A2B4C]">
                            PKR {(order.total ?? 0).toLocaleString()}
                         </td>
                         <td className="py-6 px-10">
                            <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${statusColors[order.orderStatus]}`}>
                               {order.orderStatus}
                            </span>
                         </td>
                         <td className="py-6 px-10 text-right">
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleOrderClick(order); }}
                              className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 hover:text-[#00B4D8] hover:bg-[#00B4D8]/5 transition-all flex items-center justify-center border border-gray-100"
                            >
                               <Eye size={18} />
                            </button>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
           </div>
         )}
      </div>

      <OrderDetailModal 
        order={selectedOrder} 
        isOpen={showDetailModal} 
        onClose={() => { setShowDetailModal(false); setSelectedOrder(null); }} 
        onStatusUpdate={fetchStats}
      />
    </div>
  );
}
