import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Search, 
  Loader2, 
  Eye, 
  Clock, 
  AlertCircle,
  TrendingUp,
  X,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Truck,
  Image as ImageIcon,
  ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  RMARequest, 
  subscribeToRMARequests, 
  updateRMARequestStatus, 
  addRMANote, 
  addRMATracking, 
  getRMAStats 
} from '../../lib/firebase/firestore-helpers';

// ============================================
// SUB-COMPONENT: RMA DETAIL MODAL
// ============================================

interface RMADetailModalProps {
  request: RMARequest | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

function RMADetailModal({ request, isOpen, onClose, onUpdate }: RMADetailModalProps) {
  const { userProfile } = useAuth();
  const [updating, setUpdating] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionInput, setShowRejectionInput] = useState(false);
  const [adminNote, setAdminNote] = useState('');
  const [trackingNumber, setTrackingNumber] = useState(request?.returnTrackingNumber || '');

  useEffect(() => {
    if (request) {
      setTrackingNumber(request.returnTrackingNumber || '');
      setShowRejectionInput(false);
      setRejectionReason('');
    }
  }, [request]);

  if (!isOpen || !request) return null;

  const handleStatusUpdate = async (status: RMARequest['status']) => {
    if (status === 'rejected' && !rejectionReason.trim()) {
      setShowRejectionInput(true);
      return;
    }

    setUpdating(true);
    try {
      await updateRMARequestStatus(request.id!, status, rejectionReason);
      onUpdate();
      if (status === 'rejected') setShowRejectionInput(false);
    } catch (error) {
      console.error(error);
      alert('RMA synchronization failed');
    } finally {
      setUpdating(false);
    }
  };

  const handleAddNote = async () => {
    if (!adminNote.trim()) return;
    setUpdating(true);
    try {
      await addRMANote(request.id!, `${userProfile?.email || 'admin'}: ${adminNote.trim()}`);
      setAdminNote('');
      onUpdate();
    } catch (error) {
      console.error(error);
    } finally {
      setUpdating(false);
    }
  };

  const handleAddTracking = async () => {
    if (!trackingNumber.trim()) return;
    setUpdating(true);
    try {
      await addRMATracking(request.id!, trackingNumber.trim());
      onUpdate();
    } catch (error) {
      console.error(error);
    } finally {
      setUpdating(false);
    }
  };

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
                <h2 className="text-3xl font-black text-[#1A2B4C] tracking-tight">RMA Protocol #{request.orderNumber}</h2>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-2">
                  Initiated on {formatDate(request.createdAt)}
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
                     <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">Customer Assets</h3>
                     <div className="bg-gray-50 rounded-3xl p-6 space-y-4">
                        <div>
                           <div className="text-sm font-bold text-[#1A2B4C]">{request.customerName}</div>
                           <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{request.customerEmail}</div>
                        </div>
                        <div className="pt-4 border-t border-gray-100">
                           <div className="text-sm font-bold text-[#1A2B4C]">{request.productName}</div>
                           <div className="text-[10px] font-black text-[#00B4D8] uppercase tracking-widest">SKU: {request.sku}</div>
                        </div>
                     </div>

                     <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">Issue Manifest</h3>
                     <div className="bg-gray-50 rounded-3xl p-6">
                        <div className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2">{request.reason}</div>
                        <div className="text-sm text-[#1A2B4C] leading-relaxed">{request.issueDescription}</div>
                     </div>
                  </div>

                  <div className="space-y-6">
                     <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">Decision Console</h3>
                     <div className="bg-gray-50 rounded-3xl p-6 space-y-4">
                        <div className="flex gap-2">
                           <button 
                             onClick={() => handleStatusUpdate('approved')}
                             disabled={updating || request.status === 'approved' || request.status === 'completed'}
                             className="flex-1 bg-emerald-50 text-emerald-600 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all disabled:opacity-50"
                           >
                              Approve
                           </button>
                           <button 
                             onClick={() => setShowRejectionInput(true)}
                             disabled={updating || request.status === 'rejected' || request.status === 'completed'}
                             className="flex-1 bg-red-50 text-red-600 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-all disabled:opacity-50"
                           >
                              Reject
                           </button>
                           <button 
                             onClick={() => handleStatusUpdate('completed')}
                             disabled={updating || request.status === 'completed'}
                             className="flex-1 bg-[#1A2B4C] text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#00B4D8] transition-all disabled:opacity-50"
                           >
                              Complete
                           </button>
                        </div>

                        {showRejectionInput && (
                           <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="space-y-2">
                              <input 
                                type="text"
                                placeholder="Rejection reason..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2 text-sm font-bold text-[#1A2B4C]"
                              />
                              <button 
                                onClick={() => handleStatusUpdate('rejected')}
                                className="w-full bg-red-600 text-white py-2 rounded-xl text-[9px] font-black uppercase tracking-widest"
                              >
                                Confirm Rejection Protocol
                              </button>
                           </motion.div>
                        )}
                     </div>

                     <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">Carrier Log</h3>
                     <div className="bg-gray-50 rounded-3xl p-6 space-y-4">
                        <div className="flex gap-2">
                           <input 
                             type="text"
                             placeholder="Return Tracking ID..."
                             value={trackingNumber}
                             onChange={(e) => setTrackingNumber(e.target.value)}
                             className="flex-1 bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-[#1A2B4C]"
                           />
                           <button 
                             onClick={handleAddTracking}
                             className="bg-[#1A2B4C] text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#00B4D8] transition-all"
                           >
                              Add
                           </button>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Admin Notes */}
               <div className="space-y-6">
                  <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">Internal Audit Notes</h3>
                  <div className="bg-gray-50 rounded-3xl p-6 space-y-4">
                     <div className="space-y-2">
                        {request.adminNotes?.map((note, idx) => (
                           <div key={idx} className="bg-white border border-gray-100 p-3 rounded-xl text-xs text-[#1A2B4C] font-bold">
                              {note}
                           </div>
                        ))}
                     </div>
                     <div className="flex gap-2">
                        <input 
                          type="text"
                          placeholder="Internal audit note..."
                          value={adminNote}
                          onChange={(e) => setAdminNote(e.target.value)}
                          className="flex-1 bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-[#1A2B4C]"
                        />
                        <button 
                          onClick={handleAddNote}
                          className="bg-gray-200 text-gray-500 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-300 transition-all"
                        >
                           Log Note
                        </button>
                     </div>
                  </div>
               </div>
            </div>

            <div className="p-10 bg-gray-50/50 border-t border-gray-50">
              <button 
                onClick={onClose}
                className="w-full bg-[#1A2B4C] text-white font-black py-5 rounded-2xl hover:bg-[#00B4D8] transition-all uppercase tracking-[0.2em] text-[10px]"
              >
                Close Protocol View
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

export function RMAManagement() {
  const [requests, setRequests] = useState<RMARequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<RMARequest | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<RMARequest['status'] | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState<any>(null);

  const fetchStats = useCallback(async () => {
    try {
      const data = await getRMAStats();
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

    const loadRequests = async () => {
      setLoading(true);
      const filter = statusFilter !== 'all' ? { status: statusFilter } : undefined;
      unsubscribe = subscribeToRMARequests((data) => {
        setRequests(data);
        setLoading(false);
      }, filter);
    };

    loadRequests();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [statusFilter]);

  const filteredRequests = useMemo(() => {
    if (!searchTerm) return requests;
    const term = searchTerm.toLowerCase();
    return requests.filter(
      (r) =>
        (r.orderNumber || '').toLowerCase().includes(term) ||
        (r.customerName || '').toLowerCase().includes(term) ||
        (r.customerEmail || '').toLowerCase().includes(term) ||
        (r.productName || r.name || '').toLowerCase().includes(term)
    );
  }, [requests, searchTerm]);

  const statusColors: Record<RMARequest['status'] | 'all', string> = {
    all: 'bg-gray-100 text-gray-500',
    pending: 'bg-amber-50 text-amber-600',
    approved: 'bg-blue-50 text-blue-600',
    rejected: 'bg-red-50 text-red-600',
    completed: 'bg-emerald-50 text-emerald-600',
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <span className="text-[#00B4D8] text-xs font-black uppercase tracking-[0.3em] mb-2 block">Post-Purchase Protocol</span>
          <h1 className="text-4xl font-black text-[#1A2B4C] tracking-tight">RMA Intelligence</h1>
        </div>
        <div className="flex gap-4">
           <button 
             onClick={fetchStats}
             className="bg-white border border-gray-100 text-gray-500 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:text-[#00B4D8] transition-all flex items-center gap-2"
           >
              <Loader2 className={loading ? 'animate-spin' : ''} size={16} /> Sync Nodes
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
         <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Total</p>
            <h3 className="text-xl font-black text-[#1A2B4C]">{stats?.total || 0}</h3>
         </div>
         <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
            <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-2">Pending</p>
            <h3 className="text-xl font-black text-amber-500">{stats?.pending || 0}</h3>
         </div>
         <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
            <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-2">Approved</p>
            <h3 className="text-xl font-black text-blue-500">{stats?.approved || 0}</h3>
         </div>
         <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
            <p className="text-[9px] font-black text-red-500 uppercase tracking-widest mb-2">Rejected</p>
            <h3 className="text-xl font-black text-red-500">{stats?.rejected || 0}</h3>
         </div>
         <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
            <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-2">Completed</p>
            <h3 className="text-xl font-black text-emerald-500">{stats?.completed || 0}</h3>
         </div>
      </div>

      {stats?.pending > 0 && (
         <div className="bg-amber-50 border border-amber-100 p-6 rounded-3xl flex items-center justify-between">
            <div className="flex items-center gap-4">
               <ShieldAlert className="text-amber-500" size={24} />
               <div>
                  <div className="text-sm font-black text-amber-800 uppercase tracking-widest">Pending Approvals Detected</div>
                  <div className="text-[10px] font-bold text-amber-600">There are {stats.pending} RMA requests requiring immediate executive review.</div>
               </div>
            </div>
            <button 
              onClick={() => setStatusFilter('pending')}
              className="bg-amber-500 text-white px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-amber-600 shadow-lg transition-all"
            >
               View Sector
            </button>
         </div>
      )}

      <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
         <div className="p-10 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex gap-4 flex-wrap">
              {['all', 'pending', 'approved', 'rejected', 'completed'].map((status) => (
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
                 placeholder="Search Order / Product / Customer..." 
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
         ) : filteredRequests.length === 0 ? (
            <div className="py-40 text-center">
               <p className="text-gray-300 font-black uppercase tracking-widest text-[10px]">No RMA logs detected in this sector</p>
            </div>
         ) : (
           <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead>
                   <tr className="border-b border-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                      <th className="py-6 px-10">Order Identity</th>
                      <th className="py-6 px-10">Customer / Product</th>
                      <th className="py-6 px-10">Status</th>
                      <th className="py-6 px-10">Timestamp</th>
                      <th className="py-6 px-10 text-right">Actions</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                   {filteredRequests.map(request => (
                      <tr key={request.id} className="hover:bg-gray-50/50 transition-colors group" onClick={() => { setSelectedRequest(request); setShowDetailModal(true); }}>
                         <td className="py-6 px-10">
                            <div className="font-bold text-[#1A2B4C] text-sm">#{request.orderNumber}</div>
                            <div className="text-[9px] font-black text-[#00B4D8] uppercase tracking-widest">Protocol ID: {request.id?.slice(-6)}</div>
                         </td>
                         <td className="py-6 px-10">
                            <div className="font-bold text-[#1A2B4C] text-sm">{request.customerName}</div>
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest line-clamp-1">{request.productName}</div>
                         </td>
                         <td className="py-6 px-10">
                            <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${statusColors[request.status]}`}>
                               {request.status}
                            </span>
                         </td>
                         <td className="py-6 px-10 text-[10px] font-black text-[#1A2B4C] uppercase tracking-widest">
                            {request.createdAt?.toDate().toLocaleDateString('en-PK', { day: '2-digit', month: 'short' })}
                         </td>
                         <td className="py-6 px-10 text-right">
                            <button 
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

      <RMADetailModal 
        request={selectedRequest} 
        isOpen={showDetailModal} 
        onClose={() => { setShowDetailModal(false); setSelectedRequest(null); }} 
        onUpdate={fetchStats}
      />
    </div>
  );
}
