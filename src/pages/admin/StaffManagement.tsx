import React, { useState, useEffect, FormEvent } from 'react';
import { UserPlus, Shield, ShieldAlert, Mail, Phone, MoreVertical, Loader2, X, Trash2, Key, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  UserProfile, 
  subscribeToUsers, 
  updateUserProfile, 
  deleteUserAccount,
  createStaffUser
} from '../../lib/firebase/firestore-helpers';

export function StaffManagement() {
  const [staff, setStaff] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    role: 'editor' as UserProfile['role'],
    isActive: true
  });

  useEffect(() => {
    const unsubscribe = subscribeToUsers((data) => {
      setStaff(data);
      setLoading(false);
    }, { role: 'staff' });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.displayName) {
      alert('Please fill in all fields');
      return;
    }
    setIsSubmitting(true);
    try {
      await createStaffUser({
        email: formData.email,
        password: formData.password,
        displayName: formData.displayName,
        role: formData.role
      });
      setShowForm(false);
      setFormData({ email: '', password: '', displayName: '', role: 'editor', isActive: true });
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Failed to provision staff member');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateRole = async (uid: string, role: UserProfile['role']) => {
    try {
      await updateUserProfile(uid, { role });
    } catch (error) {
      console.error(error);
      alert('Role synchronization failed');
    }
  };

  const toggleStatus = async (uid: string, currentStatus: boolean) => {
    try {
      await updateUserProfile(uid, { isActive: !currentStatus });
    } catch (error) {
      console.error(error);
    }
  };

  const revokeAccess = async (uid: string) => {
    if (!confirm('Are you sure you want to revoke all access for this member?')) return;
    try {
      await deleteUserAccount(uid);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <span className="text-[#00B4D8] text-xs font-black uppercase tracking-[0.3em] mb-2 block">Personnel Directory</span>
          <h1 className="text-4xl font-black text-[#1A2B4C] tracking-tight">Staff Authority</h1>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-[#1A2B4C] text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-[#00B4D8] transition-all flex items-center gap-2"
        >
          <UserPlus size={18} /> Provision Member
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {loading ? (
            <div className="col-span-full py-40 text-center">
               <Loader2 className="animate-spin w-10 h-10 text-[#00B4D8] mx-auto mb-4" />
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Accessing Security Database...</p>
            </div>
         ) : staff.map(member => (
            <div key={member.uid} className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 rounded-full -translate-y-12 translate-x-12 group-hover:bg-[#00B4D8]/5 transition-colors"></div>
               
               <div className="flex items-center gap-5 mb-8 relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-[#1A2B4C] text-[#00B4D8] flex items-center justify-center font-black text-xl shadow-lg border border-white/10 overflow-hidden">
                     {member.photoURL ? (
                       <img loading="lazy" src={member.photoURL} alt="" className="w-full h-full object-cover" />
                     ) : (
                       <span>{(member.displayName || member.email || '?')[0].toUpperCase()}</span>
                     )}
                  </div>
                  <div>
                     <h3 className="font-bold text-[#1A2B4C] text-lg truncate max-w-[150px]">{member.displayName || 'Unnamed Agent'}</h3>
                     <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                          member.role === 'admin' ? 'bg-red-50 text-red-500' : 'bg-[#00B4D8]/10 text-[#00B4D8]'
                        }`}>
                           {member.role}
                        </span>
                        {!member.isActive && (
                          <span className="bg-gray-100 text-gray-400 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded">Suspended</span>
                        )}
                     </div>
                  </div>
               </div>

               <div className="space-y-4 mb-8 relative z-10">
                  <div className="flex items-center gap-3 text-xs text-gray-500 font-medium truncate">
                     <Mail size={14} className="text-[#00B4D8] shrink-0" /> {member.email}
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-gray-400 font-black uppercase tracking-widest">
                     <Shield size={14} className="text-gray-300 shrink-0" /> Node: {member.uid.slice(0, 12)}
                  </div>
               </div>

               <div className="flex items-center gap-3 pt-6 border-t border-gray-50 relative z-10">
                  <select 
                    value={member.role || 'support'}
                    onChange={(e) => updateRole(member.uid, e.target.value as any)}
                    className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-[9px] font-black uppercase tracking-widest focus:outline-none focus:border-[#00B4D8] cursor-pointer"
                  >
                     <option value="admin">Administrator</option>
                     <option value="editor">Content Editor</option>
                     <option value="support">Support Staff</option>
                  </select>
                  <button 
                    onClick={() => toggleStatus(member.uid, member.isActive)}
                    className={`p-2.5 rounded-xl transition-all border ${
                      member.isActive ? 'text-emerald-500 border-emerald-50 bg-emerald-50/30' : 'text-gray-400 border-gray-100 bg-gray-50'
                    }`}
                    title={member.isActive ? "Deactivate" : "Activate"}
                  >
                     <CheckCircle2 size={18} />
                  </button>
                  <button 
                    onClick={() => revokeAccess(member.uid)}
                    className="p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 border border-gray-100 rounded-xl transition-all"
                    title="Revoke Credentials"
                  >
                     <Trash2 size={18} />
                  </button>
               </div>
            </div>
         ))}
      </div>

      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 bg-[#1A2B4C]/80 backdrop-blur-md flex items-center justify-center z-[110] p-4">
             <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.9 }}
               className="bg-white rounded-[3rem] w-full max-w-lg overflow-hidden shadow-2xl border border-white/20"
             >
                <div className="p-10 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                   <div>
                      <h2 className="text-3xl font-black text-[#1A2B4C] tracking-tight">Elevate Personnel</h2>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-2">V Admin Authority Protocol</p>
                   </div>
                   <button onClick={() => setShowForm(false)} className="w-12 h-12 rounded-2xl bg-white text-gray-400 hover:text-red-500 transition-all flex items-center justify-center border border-gray-100">
                      <X size={24} />
                   </button>
                </div>
                               <form onSubmit={handleSubmit} className="p-10 space-y-6">
                   <div className="space-y-4">
                      <div>
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Display Name</label>
                         <input 
                           type="text"
                           required
                           value={formData.displayName}
                           onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                           placeholder="e.g. John Doe"
                           className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-[#00B4D8] transition-all"
                         />
                      </div>
                      <div>
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Email Address</label>
                         <input 
                           type="email"
                           required
                           value={formData.email}
                           onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                           placeholder="staff@v-admin.com"
                           className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-[#00B4D8] transition-all"
                         />
                      </div>
                      <div>
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Temporary Password</label>
                         <input 
                           type="password"
                           required
                           value={formData.password}
                           onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                           placeholder="••••••••"
                           className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-[#00B4D8] transition-all"
                         />
                      </div>
                      <div>
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Initial Role</label>
                         <select 
                           value={formData.role}
                           onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                           className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-[#00B4D8] transition-all appearance-none"
                         >
                            <option value="support">Support Staff</option>
                            <option value="editor">Content Editor</option>
                            <option value="admin">Administrator</option>
                         </select>
                      </div>
                   </div>

                   <button 
                     type="submit"
                     disabled={isSubmitting}
                     className="w-full bg-[#1A2B4C] text-white font-black py-5 rounded-2xl hover:bg-[#00B4D8] disabled:opacity-50 transition-all uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3"
                   >
                      {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <UserPlus size={18} />}
                      {isSubmitting ? 'Provisioning...' : 'Provision Member'}
                   </button>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
