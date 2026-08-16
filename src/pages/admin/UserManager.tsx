import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Search, 
  Filter, 
  ShieldAlert, 
  ShieldCheck, 
  Trash2, 
  UserX, 
  UserCheck, 
  Loader2, 
  Mail,
  Phone,
  Calendar,
  ChevronRight,
  ClipboardList,
  X,
  CreditCard,
  ExternalLink
} from 'lucide-react';
import { 
  CustomerUser, 
  getCustomers, 
  toggleCustomerBlock, 
  getCustomerOrders,
  deleteUserAccount
} from '../../lib/firebase/firestore-helpers';

export function UserManager() {
  const [customers, setCustomers] = useState<CustomerUser[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<CustomerUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'blocked'>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerUser | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    blocked: 0,
    totalSpent: 0
  });

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCustomers();
      setCustomers(data);
      
      const active = data.filter(c => !c.isBlocked);
      const blocked = data.filter(c => c.isBlocked);
      const spent = data.reduce((sum, c) => sum + (c.totalSpent || 0), 0);

      setStats({
        total: data.length,
        active: active.length,
        blocked: blocked.length,
        totalSpent: spent
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  useEffect(() => {
    let filtered = customers;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        c.email?.toLowerCase().includes(term) || 
        c.displayName?.toLowerCase().includes(term) ||
        c.uid.toLowerCase().includes(term)
      );
    }

    if (filterStatus === 'active') {
      filtered = filtered.filter(c => !c.isBlocked);
    } else if (filterStatus === 'blocked') {
      filtered = filtered.filter(c => c.isBlocked);
    }

    setFilteredCustomers(filtered);
  }, [customers, searchTerm, filterStatus]);

  const handleToggleBlock = async (customer: CustomerUser) => {
    setIsUpdating(customer.uid);
    try {
      await toggleCustomerBlock(customer.uid, !customer.isBlocked);
      await fetchCustomers();
    } catch (error) {
      console.error(error);
      alert('Failed to update status');
    } finally {
      setIsUpdating(null);
    }
  };

  const handleDelete = async (uid: string) => {
    if (!confirm('Are you sure? This will delete the user profile from Firestore and Auth.')) return;
    setIsUpdating(uid);
    try {
      await deleteUserAccount(uid);
      await fetchCustomers();
    } catch (error) {
      console.error(error);
      alert('Failed to delete user');
    } finally {
      setIsUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="py-40 text-center">
         <Loader2 className="animate-spin w-10 h-10 text-[#00B4D8] mx-auto mb-4" />
         <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Retrieving User Database...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="text-[#00B4D8] text-xs font-black uppercase tracking-[0.2em] mb-1 block">Directory Management</span>
          <h1 className="text-3xl font-black text-[#1A2B4C] tracking-tight">Customer Accounts</h1>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
           <div className="relative flex-grow md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text"
                placeholder="Search by name, email or ID..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-gray-100 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:border-[#00B4D8] font-bold text-sm shadow-sm"
              />
           </div>
           <select 
             value={filterStatus}
             onChange={e => setFilterStatus(e.target.value as any)}
             className="bg-white border border-gray-100 rounded-2xl px-6 py-4 text-sm font-black uppercase tracking-widest text-[#1A2B4C] focus:outline-none shadow-sm cursor-pointer"
           >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="blocked">Blocked Only</option>
           </select>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Registered</p>
            <h3 className="text-3xl font-black text-[#1A2B4C]">{stats.total}</h3>
         </div>
         <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Active Accounts</p>
            <h3 className="text-3xl font-black text-[#1A2B4C]">{stats.active}</h3>
         </div>
         <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">Blocked Accounts</p>
            <h3 className="text-3xl font-black text-[#1A2B4C]">{stats.blocked}</h3>
         </div>
         <div className="bg-[#1A2B4C] p-8 rounded-[2.5rem] shadow-xl">
            <p className="text-[10px] font-black text-[#00B4D8] uppercase tracking-widest mb-1">Lifetime Value</p>
            <h3 className="text-3xl font-black text-white">PKR {stats.totalSpent.toLocaleString()}</h3>
         </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer Profile</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact Intel</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Activity</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Clearance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredCustomers.map(customer => (
                <tr key={customer.uid} className="group hover:bg-gray-50/50 transition-all cursor-pointer" onClick={() => {
                  setSelectedCustomer(customer);
                  setShowDetailModal(true);
                }}>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center font-black text-[#1A2B4C] text-lg uppercase shadow-sm">
                          {customer.displayName?.charAt(0) || customer.email?.charAt(0)}
                       </div>
                       <div>
                          <h4 className="font-black text-[#1A2B4C]">{customer.displayName || 'Anonymous'}</h4>
                          <p className="text-[10px] text-gray-400 font-mono">{customer.uid}</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-xs text-gray-600 font-bold">
                          <Mail size={14} className="text-[#00B4D8]" /> {customer.email}
                       </div>
                       {customer.phoneNumber && (
                         <div className="flex items-center gap-2 text-xs text-gray-600 font-bold">
                            <Phone size={14} className="text-[#00B4D8]" /> {customer.phoneNumber}
                         </div>
                       )}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                     <div className="flex items-center gap-6">
                        <div className="text-center">
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Orders</p>
                           <p className="text-sm font-black text-[#1A2B4C]">{customer.orders || 0}</p>
                        </div>
                        <div className="text-center">
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">LTV</p>
                           <p className="text-sm font-black text-emerald-600">PKR {(customer.totalSpent || 0).toLocaleString()}</p>
                        </div>
                     </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      customer.isBlocked 
                      ? 'bg-red-50 text-red-500 border border-red-100' 
                      : 'bg-emerald-50 text-emerald-500 border border-emerald-100'
                    }`}>
                      {customer.isBlocked ? <ShieldAlert size={14} /> : <ShieldCheck size={14} />}
                      {customer.isBlocked ? 'Blocked' : 'Active'}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                       <button 
                         onClick={() => handleToggleBlock(customer)}
                         disabled={isUpdating === customer.uid}
                         className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                           customer.isBlocked 
                           ? 'bg-emerald-50 text-emerald-500 hover:bg-emerald-500 hover:text-white' 
                           : 'bg-amber-50 text-amber-500 hover:bg-amber-500 hover:text-white'
                         }`}
                       >
                          {isUpdating === customer.uid ? <Loader2 className="animate-spin" size={18} /> : customer.isBlocked ? <UserCheck size={18} /> : <UserX size={18} />}
                       </button>
                       <button 
                         onClick={() => handleDelete(customer.uid)}
                         disabled={isUpdating === customer.uid}
                         className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                       >
                          <Trash2 size={18} />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showDetailModal && selectedCustomer && (
          <CustomerDetailModal 
            customer={selectedCustomer} 
            onClose={() => setShowDetailModal(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function CustomerDetailModal({ customer, onClose }: { customer: CustomerUser, onClose: () => void }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getCustomerOrders(customer.uid);
        setOrders(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [customer.uid]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#1A2B4C]/40 backdrop-blur-sm">
       <motion.div 
         initial={{ opacity: 0, scale: 0.9, y: 20 }}
         animate={{ opacity: 1, scale: 1, y: 0 }}
         exit={{ opacity: 0, scale: 0.9, y: 20 }}
         className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
       >
          <div className="p-10 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
             <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-3xl bg-[#1A2B4C] text-[#00B4D8] flex items-center justify-center text-2xl font-black uppercase">
                   {customer.displayName?.charAt(0) || customer.email?.charAt(0)}
                </div>
                <div>
                   <h2 className="text-2xl font-black text-[#1A2B4C]">{customer.displayName || 'Private Profile'}</h2>
                   <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{customer.email}</p>
                </div>
             </div>
             <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-red-500 transition-all shadow-sm">
                <X size={24} />
             </button>
          </div>

          <div className="flex-grow overflow-y-auto p-10 space-y-10 custom-scrollbar">
             {/* Info Grid */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
                   <div className="flex items-center gap-3 mb-4">
                      <Calendar className="text-[#00B4D8]" size={18} />
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer Since</span>
                   </div>
                   <p className="text-sm font-black text-[#1A2B4C]">
                      {customer.createdAt?.toDate ? customer.createdAt.toDate().toLocaleDateString() : 'N/A'}
                   </p>
                </div>
                <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
                   <div className="flex items-center gap-3 mb-4">
                      <ClipboardList className="text-[#00B4D8]" size={18} />
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Activity Status</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${customer.isBlocked ? 'bg-red-500' : 'bg-emerald-500'}`} />
                      <p className="text-sm font-black text-[#1A2B4C]">{customer.isBlocked ? 'Blocked' : 'Active Account'}</p>
                   </div>
                </div>
                <div className="p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100">
                   <div className="flex items-center gap-3 mb-4">
                      <CreditCard className="text-emerald-600" size={18} />
                      <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Total Transaction Value</span>
                   </div>
                   <p className="text-xl font-black text-emerald-600">PKR {(customer.totalSpent || 0).toLocaleString()}</p>
                </div>
             </div>

             {/* Order History */}
             <div className="space-y-6">
                <div className="flex items-center justify-between">
                   <h3 className="text-xl font-black text-[#1A2B4C]">Order History</h3>
                   <span className="px-4 py-2 bg-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500">
                      {orders.length} Records Found
                   </span>
                </div>

                {loading ? (
                  <div className="py-10 text-center">
                     <Loader2 className="animate-spin mx-auto text-[#00B4D8] mb-4" />
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Parsing Transaction Logs...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="py-16 text-center bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-100">
                     <p className="text-gray-400 font-bold">No purchase records found for this profile.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                     {orders.map((order, idx) => (
                       <div key={idx} className="bg-white border border-gray-100 rounded-3xl p-6 flex items-center justify-between hover:border-[#00B4D8] transition-all group shadow-sm">
                          <div className="flex items-center gap-6">
                             <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-[#1A2B4C] font-black group-hover:bg-[#00B4D8] group-hover:text-white transition-all">
                                #{idx + 1}
                             </div>
                             <div>
                                <h4 className="font-black text-[#1A2B4C]">{order.id || `ORD-${order.orderNumber}`}</h4>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                   {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'N/A'}
                                </p>
                             </div>
                          </div>
                          <div className="flex items-center gap-8">
                             <div className="text-right">
                                <p className="text-sm font-black text-[#1A2B4C]">PKR {order.total?.toLocaleString()}</p>
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">{order.orderStatus || 'Completed'}</span>
                             </div>
                             <button className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:text-[#00B4D8] transition-all">
                                <ExternalLink size={18} />
                             </button>
                          </div>
                       </div>
                     ))}
                  </div>
                )}
             </div>
          </div>

          <div className="p-10 bg-gray-50/50 border-t border-gray-50 text-center">
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Internal Security Identifier: {customer.uid}</p>
          </div>
       </motion.div>
    </div>
  );
}

