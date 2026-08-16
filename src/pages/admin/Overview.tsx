import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase/client';
import { collection, query, orderBy, limit, onSnapshot, getDocs } from 'firebase/firestore';
import { seedDatabase } from '../../lib/firebase/seed';
import { Database, RefreshCw, Loader2, ArrowRight, CheckCircle, AlertCircle, X } from 'lucide-react';

export function Overview() {
  const [stats, setStats] = useState({
    sales: 'PKR 0',
    ordersCount: 0,
    products: 0,
    customers: 0,
    quotes: 0
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Custom non-blocking modal states
  const [modalState, setModalState] = useState<'idle' | 'confirming' | 'seeding' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Real-time listener for orders
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(5));
    const unsubscribeOrders = onSnapshot(q, (snapshot) => {
      const orders: any[] = [];
      snapshot.forEach((doc) => {
        orders.push({ id: doc.id, ...doc.data() });
      });
      setRecentOrders(orders);
      setStats(prev => ({ ...prev, ordersCount: snapshot.size }));
    });

    // Fetch total products and users
    const fetchCounts = async () => {
      const productSnap = await getDocs(collection(db, 'products'));
      const userSnap = await getDocs(collection(db, 'users'));
      const quoteSnap = await getDocs(collection(db, 'event_quotes'));
      setStats(prev => ({ 
        ...prev, 
        products: productSnap.size,
        customers: userSnap.size,
        quotes: quoteSnap.size
      }));
      setLoading(false);
    };

    fetchCounts();

    return () => unsubscribeOrders();
  }, []);

  const triggerSeedConfirmation = () => {
    setModalState('confirming');
  };

  const handleSeed = async () => {
    setModalState('seeding');
    try {
      await seedDatabase();
      setModalState('success');
      setTimeout(() => {
        window.location.reload();
      }, 2500);
    } catch (error: any) {
      console.error('Seeding failed:', error);
      setErrorMessage(error?.message || String(error));
      setModalState('error');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <span className="text-[#00B4D8] text-xs font-black uppercase tracking-[0.3em] mb-2 block">System Pulse</span>
          <h1 className="text-4xl font-black text-[#1A2B4C] tracking-tight">Enterprise Overview</h1>
        </div>
        <button 
          onClick={triggerSeedConfirmation}
          disabled={modalState !== 'idle'}
          className="flex items-center gap-2 bg-white border border-gray-100 text-gray-400 hover:text-[#00B4D8] px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:shadow-lg disabled:opacity-50"
        >
          {modalState === 'seeding' ? <Loader2 size={16} className="animate-spin" /> : <Database size={16} />}
          Seed System Data
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 group hover:shadow-xl transition-all">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Gross Revenue</p>
            <h3 className="text-3xl font-black text-[#1A2B4C]">{stats.sales}</h3>
            <p className="text-[10px] font-bold text-emerald-500 mt-4 flex items-center gap-1.5">
               <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
               Live from Firestore
            </p>
         </div>
         <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 group hover:shadow-xl transition-all">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Orders</p>
            <h3 className="text-3xl font-black text-[#1A2B4C]">{stats.ordersCount}</h3>
            <p className="text-[10px] font-bold text-blue-500 mt-4">Active Transactions</p>
         </div>
         <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 group hover:shadow-xl transition-all">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">SKU Inventory</p>
            <h3 className="text-3xl font-black text-[#1A2B4C]">{stats.products}</h3>
            <p className="text-[10px] font-bold text-gray-400 mt-4">Unique Products</p>
         </div>

         <div className="bg-[#1A2B4C] p-8 rounded-[2rem] shadow-sm text-white group hover:shadow-xl transition-all">
            <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-4">Event Quotes</p>
            <h3 className="text-3xl font-black">{stats.quotes}</h3>
            <p className="text-[10px] font-bold text-gray-400 mt-4">Total Quote Requests</p>
            <a href="/admin/event-quotes" className="text-[10px] font-black text-[#00B4D8] uppercase tracking-widest hover:underline mt-2 block">View Quotes →</a>
         </div>
         <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 group hover:shadow-xl transition-all">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Customers</p>
            <h3 className="text-3xl font-black text-[#1A2B4C]">{stats.customers}</h3>
            <p className="text-[10px] font-bold text-emerald-500 mt-4">Registered Accounts</p>
         </div>
      </div>

      <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 p-10">
         <div className="flex justify-between items-center mb-10">
            <div>
               <h3 className="text-2xl font-black text-[#1A2B4C] tracking-tight">Recent Activity</h3>
               <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Real-time Transaction Log</p>
            </div>
            <button className="text-[10px] font-black text-[#00B4D8] uppercase tracking-widest hover:translate-x-1 transition-transform flex items-center gap-2">
               View All Orders <ArrowRight size={14} />
            </button>
         </div>
         
         <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
               <thead>
                 <tr className="border-b border-gray-50 text-gray-400 uppercase tracking-[0.2em] text-[9px] font-black">
                   <th className="py-4 px-4">Order ID</th>
                   <th className="py-4 px-4">Customer</th>
                   <th className="py-4 px-4">Status</th>
                   <th className="py-4 px-4">Amount</th>
                   <th className="py-4 px-4 text-right">Synchronization</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                 {recentOrders.length === 0 ? (
                   <tr>
                     <td colSpan={5} className="py-16 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">No Recent Activity Detected</td>
                   </tr>
                 ) : (
                   recentOrders.map(order => (
                     <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                       <td className="py-6 px-4">
                          <span className="font-bold text-[#1A2B4C] font-mono text-xs">{order.id.slice(0, 8)}...</span>
                       </td>
                       <td className="py-6 px-4">
                          <div className="font-bold text-gray-800">{order.customerName}</div>
                          <div className="text-[10px] text-gray-400">{order.customerEmail}</div>
                       </td>
                       <td className="py-6 px-4">
                         <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg ${
                           order.status === 'shipped' ? 'bg-emerald-100 text-emerald-800' : 
                           order.status === 'processing' ? 'bg-blue-100 text-blue-800' : 
                           'bg-amber-100 text-amber-800'
                         }`}>
                           {order.status}
                         </span>
                       </td>
                       <td className="py-6 px-4 font-black text-[#1A2B4C]">PKR {(order.total ?? 0).toLocaleString()}</td>
                       <td className="py-6 px-4 text-right">
                          <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Encrypted via SSL</span>
                       </td>
                     </tr>
                   ))
                 )}
               </tbody>
            </table>
         </div>
      </div>

      {/* Modern Custom Non-Blocking Dialog Modal for Seed Data */}
      {modalState !== 'idle' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 max-w-md w-full p-8 relative overflow-hidden animate-scale-up">
            <button 
              onClick={() => setModalState('idle')} 
              disabled={modalState === 'seeding'}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
              <X size={20} />
            </button>

            {modalState === 'confirming' && (
              <div className="text-center">
                <div className="w-16 h-16 bg-[#00B4D8]/10 text-[#00B4D8] rounded-full flex items-center justify-center mx-auto mb-6">
                  <Database size={32} />
                </div>
                <h3 className="text-2xl font-black text-[#1A2B4C] mb-3 tracking-tight">Seed System Data</h3>
                <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                  This will populate the Firestore database with comprehensive AV product catalogs, categorizations, sample transaction logs, and global store settings. Continue?
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => setModalState('idle')}
                    className="flex-1 py-4 px-6 rounded-2xl border border-gray-100 text-xs font-black uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSeed}
                    className="flex-1 py-4 px-6 rounded-2xl bg-[#00B4D8] hover:bg-[#0096b5] text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-[#00B4D8]/20 transition-all"
                  >
                    Seed Database
                  </button>
                </div>
              </div>
            )}

            {modalState === 'seeding' && (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-[#00B4D8]/10 text-[#00B4D8] rounded-full flex items-center justify-center mx-auto mb-6">
                  <Loader2 size={32} className="animate-spin" />
                </div>
                <h3 className="text-2xl font-black text-[#1A2B4C] mb-3 tracking-tight font-sans">Seeding Database</h3>
                <p className="text-sm text-gray-400 uppercase tracking-widest font-black animate-pulse">
                  Writing schemas to Firestore...
                </p>
              </div>
            )}

            {modalState === 'success' && (
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle size={32} />
                </div>
                <h3 className="text-2xl font-black text-emerald-900 mb-3 tracking-tight">Seed Completed!</h3>
                <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                  Sample catalogs, systems, and orders successfully registered. Rebooting application...
                </p>
                <div className="w-full bg-gray-100 h-[6px] rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-full animate-pulse rounded-full"></div>
                </div>
              </div>
            )}

            {modalState === 'error' && (
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle size={32} />
                </div>
                <h3 className="text-2xl font-black text-red-900 mb-3 tracking-tight">Seeding Failed</h3>
                <p className="text-sm text-gray-500 mb-6 leading-relaxed bg-red-50/50 p-4 rounded-2xl text-left font-mono text-xs overflow-auto max-h-40">
                  {errorMessage}
                </p>
                <button
                  onClick={() => setModalState('idle')}
                  className="w-full py-4 px-6 rounded-2xl bg-red-500 hover:bg-red-600 text-white text-xs font-black uppercase tracking-widest transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
   </div>
  );
}
