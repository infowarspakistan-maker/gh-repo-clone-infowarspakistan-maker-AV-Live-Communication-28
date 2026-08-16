import { CreditCard, Save, Loader2, ShieldCheck, Wallet, Landmark, QrCode } from 'lucide-react';
import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase/client';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export function PaymentSettings() {
  const [settings, setSettings] = useState({
    stripePublicKey: '',
    stripeSecretKey: '',
    stripeWebhookSecret: '',
    bankTransferInfo: '',
    checkPayableTo: '',
    codEnabled: true,
    currency: 'PKR'
  });
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      const docRef = doc(db, 'settings', 'payment');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSettings(docSnap.data() as any);
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'payment'), {
        ...settings,
        updatedAt: serverTimestamp()
      }, { merge: true });
      alert('Payment settings synchronized successfully!');
    } catch (error) {
      console.error(error);
      alert('Failed to save payment settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-40 text-center">
         <Loader2 className="animate-spin w-10 h-10 text-[#00B4D8] mx-auto mb-4" />
         <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Accessing Financial Config...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      <div className="flex justify-between items-center mb-8">
        <div>
          <span className="text-[#00B4D8] text-xs font-black uppercase tracking-[0.2em] mb-1 block">Financial Terminal</span>
          <h1 className="text-3xl font-black text-[#1A2B4C] tracking-tight">Payment Gateways</h1>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-[#1A2B4C] text-white px-8 py-3 rounded-full hover:bg-[#00B4D8] transition-all flex items-center font-bold text-sm uppercase tracking-wider shadow-lg disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : <><Save size={18} className="mr-2" /> Sync Protocols</>}
        </button>
      </div>
      
      <div className="grid grid-cols-1 gap-8">
         {/* Stripe Section */}
         <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-10 border-b border-gray-50 flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#635BFF] rounded-2xl flex items-center justify-center text-white shadow-lg">
                     <CreditCard size={24} />
                  </div>
                  <div>
                     <h3 className="text-xl font-black text-[#1A2B4C]">Stripe Integration</h3>
                     <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Global Credit/Debit Terminal</p>
                  </div>
               </div>
               <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                  <ShieldCheck size={14} /> Secured
               </div>
            </div>
            <div className="p-10 space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Stripe Public Key</label>
                     <input 
                       type="password"
                       value={settings.stripePublicKey}
                       onChange={e => setSettings({...settings, stripePublicKey: e.target.value})}
                       placeholder="pk_test_..."
                       className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-mono focus:outline-none focus:border-[#00B4D8] transition-all" 
                     />
                  </div>
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Stripe Secret Key</label>
                     <input 
                       type="password"
                       value={settings.stripeSecretKey}
                       onChange={e => setSettings({...settings, stripeSecretKey: e.target.value})}
                       placeholder="sk_test_..."
                       className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-mono focus:outline-none focus:border-[#00B4D8] transition-all" 
                     />
                  </div>
               </div>
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Webhook Signing Secret</label>
                  <input 
                    type="password"
                    value={settings.stripeWebhookSecret}
                    onChange={e => setSettings({...settings, stripeWebhookSecret: e.target.value})}
                    placeholder="whsec_..."
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-mono focus:outline-none focus:border-[#00B4D8] transition-all" 
                  />
               </div>
            </div>
         </div>

         {/* Offline Methods */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden p-10 space-y-6">
               <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-[#1A2B4C] rounded-2xl flex items-center justify-center text-[#00B4D8] shadow-lg">
                     <Landmark size={24} />
                  </div>
                  <h3 className="text-lg font-black text-[#1A2B4C]">Bank Transfer</h3>
               </div>
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Account Details</label>
                  <textarea 
                    rows={4}
                    value={settings.bankTransferInfo}
                    onChange={e => setSettings({...settings, bankTransferInfo: e.target.value})}
                    placeholder="Bank: HBL&#10;Account: 1234-5678-9012-34&#10;IBAN: PK00HBL000000..."
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-[#00B4D8] transition-all resize-none" 
                  />
               </div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden p-10 space-y-6 flex flex-col justify-between">
               <div>
                  <div className="flex items-center gap-4 mb-4">
                     <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100">
                        <Wallet size={24} />
                     </div>
                     <h3 className="text-lg font-black text-[#1A2B4C]">COD / Checks</h3>
                  </div>
                  <div className="space-y-4 mt-6">
                     <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                        <span className="text-xs font-bold text-[#1A2B4C]">Cash On Delivery</span>
                        <button 
                           onClick={() => setSettings({...settings, codEnabled: !settings.codEnabled})}
                           className={`w-12 h-6 rounded-full transition-all relative ${settings.codEnabled ? 'bg-[#00B4D8]' : 'bg-gray-300'}`}
                        >
                           <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.codEnabled ? 'left-7' : 'left-1'}`}></div>
                        </button>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block px-1">Check Payable To</label>
                        <input 
                           type="text"
                           value={settings.checkPayableTo}
                           onChange={e => setSettings({...settings, checkPayableTo: e.target.value})}
                           placeholder="AV Live Communication (Pvt) Ltd"
                           className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-[#00B4D8] transition-all" 
                        />
                     </div>
                  </div>
               </div>
               <div className="pt-6">
                  <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                     <QrCode size={14} /> Local Payment Options Enabled
                  </div>
               </div>
            </div>
         </div>

         {/* Currency Section */}
         <div className="bg-[#1A2B4C] rounded-[2.5rem] p-10 text-white flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-2">
               <h3 className="text-2xl font-black">Base Currency</h3>
               <p className="text-gray-400 text-sm font-medium">All financial calculations will be performed in this unit.</p>
            </div>
            <select 
               value={settings.currency}
               onChange={e => setSettings({...settings, currency: e.target.value})}
               className="bg-white/10 border border-white/20 rounded-2xl px-10 py-5 text-xl font-black uppercase tracking-widest focus:outline-none hover:bg-white/20 transition-all cursor-pointer"
            >
               <option value="PKR">PKR - Rupees</option>
               <option value="USD">USD - Dollars</option>
               <option value="EUR">EUR - Euros</option>
               <option value="GBP">GBP - Pounds</option>
            </select>
         </div>
      </div>
    </div>
  );
}
