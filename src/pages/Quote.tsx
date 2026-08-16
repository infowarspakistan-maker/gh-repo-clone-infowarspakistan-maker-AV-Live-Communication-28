import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Send, FileText, Settings, CreditCard, CheckCircle, Loader2 } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase/client';
import { handleFirestoreError, OperationType } from '../lib/firebase/firestore-helpers';
import { SEO } from '../components/SEO';

export function Quote() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    email: '',
    phone: '',
    projectTypes: [] as string[],
    budget: '100k - 500k PKR',
    timeline: 'Immediate',
    details: ''
  });

  const totalSteps = 4;

  const handleNext = () => setStep(prev => Math.min(prev + 1, totalSteps));
  const handlePrev = () => setStep(prev => Math.max(prev - 1, 1));

  const handleCheckboxChange = (opt: string) => {
    setFormData(prev => ({
      ...prev,
      projectTypes: prev.projectTypes.includes(opt)
        ? prev.projectTypes.filter(t => t !== opt)
        : [...prev.projectTypes, opt]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const path = 'quote_requests';
    try {
      await addDoc(collection(db, path), {
        ...formData,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      setSuccess(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
      <SEO title="Quote" />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-12 rounded-[3rem] shadow-2xl text-center max-w-xl w-full border border-gray-100"
        >
          <div className="w-24 h-24 bg-[#00B4D8]/10 text-[#00B4D8] rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle size={48} />
          </div>
          <h1 className="text-3xl font-black text-[#1A2B4C] mb-4">Request Transmitted</h1>
          <p className="text-gray-500 mb-8 font-medium">Your custom quote request has been received. Our AV design team will review your specifications and send a tailored proposal within 24 hours.</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="w-full bg-[#1A2B4C] text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-[#00B4D8] transition-all"
          >
            Return to Homepage
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-[#F8F9FA] min-h-screen pb-16">
      <div className="bg-[#1A2B4C] text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-900/20 mix-blend-multiply"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black mb-6 tracking-tight"
          >
            Get Your Custom Quote in 24 Hours.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-white max-w-3xl mx-auto leading-relaxed"
          >
            Tell us about your project, and our AV experts will design a solution tailored to your budget and infrastructure.
          </motion.p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex justify-between mb-2">
            {[1, 2, 3, 4].map(s => (
              <span key={s} className={`text-xs font-bold uppercase ${step >= s ? 'text-[#00B4D8]' : 'text-gray-400'}`}>
                Step {s}
              </span>
            ))}
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden flex">
             <div className="h-full bg-[#00B4D8] transition-all duration-300" style={{ width: `${(step / totalSteps) * 100}%` }}></div>
          </div>
        </div>

        <div className="bg-white p-8 md:p-10 rounded-3xl border border-gray-200 shadow-sm">
          
          <form className="space-y-8" onSubmit={handleSubmit}>
            
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <h3 className="text-2xl font-black text-[#1A2B4C] mb-6 flex items-center gap-2"><FileText className="text-[#00B4D8]"/> Your Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Full Name *</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.fullName}
                      onChange={e => setFormData(p => ({ ...p, fullName: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8] transition-all" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Company Name</label>
                    <input 
                      type="text" 
                      value={formData.companyName}
                      onChange={e => setFormData(p => ({ ...p, companyName: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8] transition-all" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Email Address *</label>
                    <input 
                      type="email" 
                      required 
                      value={formData.email}
                      onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8] transition-all" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number *</label>
                    <input 
                      type="tel" 
                      required 
                      value={formData.phone}
                      onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8] transition-all" 
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <h3 className="text-2xl font-black text-[#1A2B4C] mb-6 flex items-center gap-2"><Settings className="text-[#00B4D8]"/> Project Type</h3>
                <label className="block text-sm font-bold text-gray-700 mb-4">I am interested in (Select all that apply):</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['IP Phones & VoIP Systems', 'Video Conferencing Setup', 'IP Camera & Security', 'Public Address / Paging', 'AV Integration (Boardrooms)', 'Event Management & Expo', 'Other'].map(opt => (
                    <label key={opt} className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-[#00B4D8] transition-colors">
                      <input 
                        type="checkbox" 
                        checked={formData.projectTypes.includes(opt)}
                        onChange={() => handleCheckboxChange(opt)}
                        className="w-5 h-5 text-[#00B4D8] focus:ring-[#00B4D8] rounded" 
                      />
                      <span className="font-medium text-gray-700">{opt}</span>
                    </label>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <h3 className="text-2xl font-black text-[#1A2B4C] mb-6 flex items-center gap-2"><CreditCard className="text-[#00B4D8]"/> Scope & Budget</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Budget Range</label>
                    <select 
                      value={formData.budget}
                      onChange={e => setFormData(p => ({ ...p, budget: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8] transition-all bg-white font-medium"
                    >
                      <option>Under 100k PKR</option>
                      <option>100k - 500k PKR</option>
                      <option>500k - 1M PKR</option>
                      <option>1M - 5M PKR</option>
                      <option>5M+ PKR</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Timeline</label>
                    <select 
                      value={formData.timeline}
                      onChange={e => setFormData(p => ({ ...p, timeline: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8] transition-all bg-white font-medium"
                    >
                      <option>Immediate</option>
                      <option>1-3 Months</option>
                      <option>3-6 Months</option>
                      <option>Planning Stage</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Additional Details</label>
                  <textarea 
                    rows={4} 
                    value={formData.details}
                    onChange={e => setFormData(p => ({ ...p, details: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8] transition-all resize-y font-medium" 
                    placeholder="Describe your requirements, room size, number of users, etc."
                  ></textarea>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                <CheckCircle size={64} className="text-green-500 mx-auto mb-6" />
                <h3 className="text-2xl font-black text-[#1A2B4C] mb-2">Ready to Submit?</h3>
                <p className="text-gray-500 mb-8">Please review your details and click submit. We'll get back to you shortly.</p>
              </motion.div>
            )}

            <div className="flex gap-4 pt-6 border-t border-gray-100">
              {step > 1 && (
                <button type="button" onClick={handlePrev} className="px-6 py-3 rounded-xl font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                  Back
                </button>
              )}
              {step < 4 ? (
                <button type="button" onClick={handleNext} className="flex-1 bg-[#1A2B4C] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#00B4D8] transition-colors ml-auto">
                  Continue to Next Step
                </button>
              ) : (
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 bg-[#00B4D8] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#1A2B4C] transition-colors flex items-center justify-center gap-2 text-lg disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />} 
                  {loading ? 'Transmitting...' : 'Send My Quote Request'}
                </button>
              )}
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
