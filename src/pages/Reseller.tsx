import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { TrendingUp, BookOpen, FileText, ArrowRight, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase/client';
import { SEO } from '../components/SEO';

export function Reseller() {
  const [formData, setFormData] = useState({
    companyName: '',
    ntn: '',
    email: '',
    details: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    try {
      await addDoc(collection(db, 'reseller_applications'), {
        ...formData,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      setSubmitted(true);
      setFormData({ companyName: '', ntn: '', email: '', details: '' });
    } catch (err) {
      console.error('Error submitting reseller application:', err);
      setSubmitError('Unable to submit application right now. Please call 0321 425 6263.');
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div className="bg-[#F8F9FA] min-h-screen pb-16">
      <SEO 
        title="Authorized Reseller & Channel Partner Program | AV Live Pakistan" 
        description="Join Pakistan's leading AV distribution network. Tier-1 margins, dedicated technical training, partner deal registration, and authorized brand access."
        url="https://avlive.com.pk/programs/reseller-program"
        schema={{
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'Service',
              '@id': 'https://avlive.com.pk/programs/reseller-program#service',
              name: 'Authorized B2B Partner & IT Reseller Program in Pakistan',
              serviceType: 'Wholesale Pro-AV & Unified Communications Channel Program',
              provider: { '@id': 'https://avlive.com.pk/#organization' },
              areaServed: 'PK',
              url: 'https://avlive.com.pk/programs/reseller-program'
            },
            {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://avlive.com.pk' },
                { '@type': 'ListItem', position: 2, name: 'Reseller Program', item: 'https://avlive.com.pk/programs/reseller-program' }
              ]
            }
          ]
        }}
      />
      <div className="bg-[#1A2B4C] text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-900/20 mix-blend-multiply"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black mb-6 tracking-tight"
          >
            Partner with Pakistan's AV Leader.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-white max-w-3xl mx-auto leading-relaxed"
          >
            Unlock exclusive margins, technical certifications, and marketing support. Whether you are a system integrator or a retail shop, we have a partnership tier for you.
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 space-y-24">
        
        <div>
          <h2 className="text-3xl font-black text-[#1A2B4C] mb-12 text-center">Program Benefits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1">
               <div className="w-16 h-16 bg-[#00B4D8]/10 text-[#00B4D8] rounded-2xl flex items-center justify-center mb-6"><TrendingUp size={32} /></div>
               <h3 className="font-bold text-[#1A2B4C] text-lg mb-3">Tiered Discounts</h3>
               <p className="text-gray-500 text-sm">Starting from 15% off MSRP, scaling up to 35% based on volume.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1">
               <div className="w-16 h-16 bg-[#00B4D8]/10 text-[#00B4D8] rounded-2xl flex items-center justify-center mb-6"><BookOpen size={32} /></div>
               <h3 className="font-bold text-[#1A2B4C] text-lg mb-3">Training & Certs</h3>
               <p className="text-gray-500 text-sm">Access to product webinars and certification courses (Polycom, Cisco, Yealink).</p>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1">
               <div className="w-16 h-16 bg-[#00B4D8]/10 text-[#00B4D8] rounded-2xl flex items-center justify-center mb-6"><FileText size={32} /></div>
               <h3 className="font-bold text-[#1A2B4C] text-lg mb-3">Marketing Support</h3>
               <p className="text-gray-500 text-sm">Access to high-res images, brochures, and demo units for your showroom.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1">
               <div className="w-16 h-16 bg-[#00B4D8]/10 text-[#00B4D8] rounded-2xl flex items-center justify-center mb-6"><ArrowRight size={32} /></div>
               <h3 className="font-bold text-[#1A2B4C] text-lg mb-3">Leads Referral</h3>
               <p className="text-gray-500 text-sm">We will forward local leads in your region directly to your sales team.</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col lg:flex-row">
           <div className="p-12 lg:w-1/2 bg-gray-50 flex flex-col justify-center">
             <h2 className="text-3xl font-black text-[#1A2B4C] mb-4">Dedicated Reseller Portal</h2>
             <p className="text-gray-600 mb-8 leading-relaxed">
               Manage your pricing, check live stock, track orders, and request RMA directly from your custom B2B dashboard.
             </p>
             <Link to="/admin/login" className="bg-[#1A2B4C] text-white px-8 py-4 min-h-[48px] rounded-full font-bold hover:bg-[#00B4D8] transition-colors w-max inline-flex items-center justify-center">
               Login to Portal
             </Link>
           </div>
           <div className="p-12 lg:w-1/2 border-t lg:border-t-0 lg:border-l border-gray-200">
             <h2 className="text-2xl font-black text-[#1A2B4C] mb-6">Apply Now</h2>
             {submitted ? (
               <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-3">
                 <CheckCircle2 size={40} className="text-emerald-600 mx-auto" />
                 <h3 className="text-lg font-black text-[#1A2B4C]">Partner Application Received</h3>
                 <p className="text-xs text-gray-600 font-medium">Our channel partner desk will verify your NTN and contact you within 24 hours.</p>
               </div>
             ) : (
               <form className="space-y-4" onSubmit={handleApplySubmit}>
                 {submitError && (
                   <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg text-xs font-bold flex items-center gap-2">
                     <AlertCircle size={16} className="shrink-0" />
                     <span>{submitError}</span>
                   </div>
                 )}
                 <input
                   type="text"
                   required
                   placeholder="Company Name *"
                   value={formData.companyName}
                   onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                   className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-[#00B4D8]"
                 />
                 <input
                   type="text"
                   placeholder="NTN Number"
                   value={formData.ntn}
                   onChange={(e) => setFormData(prev => ({ ...prev, ntn: e.target.value }))}
                   className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-[#00B4D8]"
                 />
                 <input
                   type="email"
                   required
                   placeholder="Business Email *"
                   value={formData.email}
                   onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                   className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-[#00B4D8]"
                 />
                 <textarea
                   required
                   placeholder="Tell us about your business *"
                   rows={3}
                   value={formData.details}
                   onChange={(e) => setFormData(prev => ({ ...prev, details: e.target.value }))}
                   className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-[#00B4D8] resize-none"
                 ></textarea>
                 <button
                   type="submit"
                   disabled={submitting}
                   className="w-full bg-[#00B4D8] text-white py-3 min-h-[48px] rounded-lg font-bold hover:bg-[#1A2B4C] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                 >
                   {submitting && <Loader2 size={16} className="animate-spin" />}
                   {submitting ? 'Submitting...' : 'Submit Application'}
                 </button>
               </form>
             )}
           </div>
        </div>
      </div>
    </div>
  );
}
