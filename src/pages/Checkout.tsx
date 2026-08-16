import { useState, useEffect } from 'react';
import { ShieldCheck, CreditCard, Building2, User, Loader2, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { getCart, getCartTotal, clearCart } from '../lib/cart';
import { createOrder } from '../lib/firebase/firestore-helpers';
import { SEO } from '../components/SEO';

export function Checkout() {
  const cartItems = getCart();
  const subtotal = getCartTotal();
  
  const [customerType, setCustomerType] = useState<'individual' | 'business'>('individual');
  const [ntn, setNtn] = useState('');
  const [isVerifyingNtn, setIsVerifyingNtn] = useState(false);
  const [ntnStatus, setNtnStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [taxRate, setTaxRate] = useState(0.18); // Default 18% GST
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: 'Lahore',
    zipCode: ''
  });

  useEffect(() => {
    if (customerType === 'individual') {
      setTaxRate(0.18);
      setNtnStatus('idle');
      setNtn('');
    }
  }, [customerType]);

  const handleVerifyNtn = async () => {
    if (!ntn.trim()) return;
    
    setIsVerifyingNtn(true);
    setNtnStatus('idle');
    
    // Simulate NTN Verification
    setTimeout(() => {
      setIsVerifyingNtn(false);
      if (ntn.length === 7) {
        setNtnStatus('valid');
        setTaxRate(0); 
      } else {
        setNtnStatus('invalid');
        setTaxRate(0.18);
      }
    }, 1500);
  };

  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [quotationId, setQuotationId] = useState('');

  const handleCompleteOrder = async () => {
    if (!formData.email || !formData.firstName) {
      alert('Please complete the required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderData = {
        orderNumber: `AV-${Math.floor(100000 + Math.random() * 900000)}`,
        customerId: formData.email, // In a real app, this would be the user UID
        customerName: `${formData.firstName} ${formData.lastName}`,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        items: cartItems.map(item => ({
          productId: item.id.toString(),
          productName: item.name,
          sku: '', // Should be fetched from product
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
        })),
        subtotal,
        tax: taxAmount,
        shippingCost: 0,
        total,
        orderStatus: 'pending' as const,
        paymentStatus: 'pending' as const,
        shippingAddress: `${formData.address}, ${formData.city}, ${formData.zipCode}`,
        billingAddress: `${formData.address}, ${formData.city}, ${formData.zipCode}`,
        paymentMethod: 'bank_transfer' as const,
        notes: customerType === 'business' ? `NTN: ${ntn}` : undefined,
      };

      const id = await createOrder(orderData);
      setQuotationId(orderData.orderNumber);
      setOrderComplete(true);
      clearCart();
    } catch (e) {
      console.error(e);
      alert('System error: Could not process order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="bg-[#F8F9FA] min-h-screen py-16 text-[#1A2B4C] flex items-center justify-center">
      <SEO title="Checkout" noindex />
        <div className="bg-white p-12 rounded-[3rem] border border-gray-100 shadow-2xl text-center max-w-lg w-full">
          <CheckCircle2 size={64} className="text-emerald-500 mx-auto mb-8" />
          <h1 className="text-4xl font-black mb-4">Transmission Successful</h1>
          <p className="text-gray-400 mb-8 font-medium">Your hardware procurement request has been logged in our logistics system.</p>
          <div className="bg-[#F8F9FA] p-8 rounded-3xl border border-gray-50 mb-10">
            <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Logistics Reference</span>
            <span className="font-mono text-3xl text-[#00B4D8] font-black tracking-tighter">{quotationId}</span>
          </div>
          <a href="/shop" className="w-full bg-[#1A2B4C] hover:bg-[#00B4D8] text-white py-5 rounded-2xl font-black transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-xl active:scale-95">
            Return to Catalog
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F8F9FA] min-h-screen py-16 text-[#1A2B4C]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12">
           <div>
             <h1 className="text-4xl font-black tracking-tight">Secure Logistics Portal</h1>
             <p className="text-gray-400 mt-2 font-black uppercase tracking-widest text-[10px]">Finalizing Hardware Acquisition</p>
           </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            
            {/* Customer Information */}
            <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-xl">
              <h2 className="text-xl font-black mb-8 border-b border-gray-50 pb-6 uppercase tracking-widest text-[12px] text-gray-400">1. Deployment Profile</h2>
              
              <div className="flex gap-4 mb-10 p-1.5 bg-gray-50 rounded-2xl w-fit">
                <button 
                  onClick={() => setCustomerType('individual')}
                  className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${customerType === 'individual' ? 'bg-white shadow-xl text-[#00B4D8]' : 'text-gray-400 hover:text-gray-700'}`}
                >
                  <User size={16} /> Individual
                </button>
                <button 
                  onClick={() => setCustomerType('business')}
                  className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${customerType === 'business' ? 'bg-white shadow-xl text-[#00B4D8]' : 'text-gray-400 hover:text-gray-700'}`}
                >
                  <Building2 size={16} /> Enterprise (B2B)
                </button>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Operator First Name</label>
                  <input 
                    type="text" 
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="w-full bg-[#F8F9FA] border border-gray-100 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-[#00B4D8] transition-all font-bold text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Operator Last Name</label>
                  <input 
                    type="text" 
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="w-full bg-[#F8F9FA] border border-gray-100 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-[#00B4D8] transition-all font-bold text-sm" 
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Communication Address (Email)</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-[#F8F9FA] border border-gray-100 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-[#00B4D8] transition-all font-bold text-sm" 
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Deployment Site (Address)</label>
                  <textarea 
                    rows={3}
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full bg-[#F8F9FA] border border-gray-100 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-[#00B4D8] transition-all font-bold text-sm" 
                  />
                </div>
              </div>

              {customerType === 'business' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="mt-12 bg-[#F8F9FA] p-8 rounded-[2rem] border border-gray-100"
                >
                  <h3 className="font-black mb-4 flex items-center gap-2 text-[#00B4D8] uppercase tracking-widest text-[11px]">
                    <ShieldCheck size={20} /> Automated B2B Tax Verification
                  </h3>
                  <p className="text-xs text-gray-400 mb-8 font-medium leading-relaxed">System allows automated verification of National Tax Numbers (NTN) for immediate B2B tax exemptions on hardware procurement.</p>
                  
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <input 
                        type="text" 
                        value={ntn}
                        onChange={(e) => setNtn(e.target.value)}
                        placeholder="7-digit NTN (e.g. 1234567)" 
                        className={`w-full bg-white border rounded-2xl px-6 py-4 focus:outline-none transition-all font-bold text-sm ${ntnStatus === 'valid' ? 'border-emerald-500 bg-emerald-50 focus:ring-emerald-500' : ntnStatus === 'invalid' ? 'border-rose-500 bg-rose-50 focus:ring-rose-500' : 'border-gray-200 focus:ring-[#00B4D8]'}`} 
                      />
                    </div>
                    <button 
                      onClick={handleVerifyNtn}
                      disabled={isVerifyingNtn || !ntn.trim()}
                      className="bg-[#1A2B4C] hover:bg-[#00B4D8] text-white px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
                    >
                      {isVerifyingNtn ? <Loader2 className="animate-spin" size={18} /> : 'Process'}
                    </button>
                  </div>
                  
                  {ntnStatus === 'valid' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-[10px] font-black text-emerald-600 flex items-center gap-2 uppercase tracking-widest">
                      <CheckCircle2 size={16} /> Protocol Verified: Zero-Rated B2B Exemption Applied.
                    </motion.div>
                  )}
                  {ntnStatus === 'invalid' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-[10px] font-black text-rose-500 uppercase tracking-widest">
                      Verification Failed. Standard 18% GST Protocol Reinstated.
                    </motion.div>
                  )}
                </motion.div>
              )}
            </div>

            {/* Payment Information */}
            <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-xl opacity-50 cursor-not-allowed">
              <h2 className="text-xl font-black mb-8 border-b border-gray-50 pb-6 uppercase tracking-widest text-[12px] text-gray-400 flex items-center gap-2">
                <CreditCard /> 2. Transaction Module
              </h2>
              <div className="flex items-center gap-4 text-gray-400 font-bold text-xs italic bg-gray-50 p-6 rounded-2xl border border-gray-100">
                 <Loader2 className="animate-spin" size={16} /> Awaiting deployment profile completion...
              </div>
            </div>
            
          </div>

          <div>
            <div className="bg-white rounded-[2.5rem] border border-gray-100 p-10 sticky top-32 shadow-2xl overflow-hidden">
              <h3 className="font-black text-xl mb-10 border-b border-gray-50 pb-6 uppercase tracking-widest text-[12px] text-gray-400">Inventory Summary</h3>
              
              <div className="space-y-6 mb-10">
                {cartItems.map(item => (
                  <div key={item.id} className="flex justify-between items-start gap-4">
                    <div className="flex gap-4">
                       <div className="w-12 h-12 bg-gray-50 rounded-xl overflow-hidden shrink-0 border border-gray-100">
                          <img loading="lazy" src={item.image} alt={item.name} className="w-full h-full object-cover" />
                       </div>
                       <div className="flex flex-col">
                          <span className="text-xs font-black line-clamp-1">{item.name}</span>
                          <span className="text-[10px] font-bold text-gray-400">{item.quantity} Unit(s)</span>
                       </div>
                    </div>
                    <span className="font-black text-sm whitespace-nowrap">Rs. {((item.price ?? 0) * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-4 mb-10 border-t border-gray-50 pt-10">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <span>Gross Value</span>
                  <span className="text-[#1A2B4C]">Rs. {subtotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <span>Logistics</span>
                  <span className="text-emerald-600">Complimentary</span>
                </div>
                <div className="flex justify-between items-center transition-all duration-300">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">GST Protocol</span>
                    <span className="text-[9px] font-black text-[#00B4D8] tracking-[0.2em]">{taxRate === 0 ? 'B2B EXEMPT (0%)' : 'STANDARD (18%)'}</span>
                  </div>
                  <span className="font-black text-sm">Rs. {taxAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center border-t border-gray-100 pt-10 mb-10">
                <span className="font-black text-lg uppercase tracking-widest">Net Total</span>
                <span className="font-black text-3xl text-[#00B4D8]">Rs. {total.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
              </div>

              <button 
                onClick={handleCompleteOrder} 
                disabled={isSubmitting || cartItems.length === 0} 
                className="w-full bg-[#1A2B4C] text-white py-6 rounded-2xl font-black hover:bg-[#00B4D8] transition-all uppercase tracking-[0.2em] text-[11px] shadow-2xl flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95"
              >
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Execute Deployment'}
              </button>
              
              <div className="mt-8 text-center flex items-center justify-center gap-2 text-gray-300 text-[10px] font-black uppercase tracking-widest">
                <ShieldCheck size={14} className="text-[#00B4D8]" /> 256-bit AES Encrypted
              </div>
              
              {/* Visual Accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#00B4D8]/5 rounded-full translate-x-16 -translate-y-16"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
