import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Send, FileText, Upload, Loader2, CheckCircle } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase/client';
import { SEO } from '../components/SEO';

export function RMA() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      orderNumber: formData.get('orderNumber'),
      productName: formData.get('productName'),
      sku: formData.get('sku'),
      issueType: formData.get('issueType'),
      description: formData.get('description'),
      customerEmail: formData.get('customerEmail'),
      customerPhone: formData.get('customerPhone'),
      status: 'pending',
      createdAt: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, 'rma_requests'), data);
      setSuccess(true);
    } catch (error) {
      console.error('Error submitting RMA:', error);
      alert('Error submitting request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
      <SEO title="R M A" />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-12 rounded-[3rem] shadow-2xl text-center max-w-xl w-full border border-gray-100"
        >
          <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle size={48} />
          </div>
          <h1 className="text-3xl font-black text-[#1A2B4C] mb-4">RMA Submitted Successfully</h1>
          <p className="text-gray-500 mb-8 font-medium">Your request ID has been logged. Our technical team will review the details and contact you within 24 hours.</p>
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
            Submit a Warranty or Return Request.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-white max-w-3xl mx-auto leading-relaxed"
          >
            Fill in the details below to initiate your Return Merchandise Authorization (RMA). We will review and get back to you within 24 hours.
          </motion.p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="bg-white p-8 md:p-10 rounded-3xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100">
            <FileText className="text-[#00B4D8]" size={28} />
            <h2 className="text-2xl font-black text-[#1A2B4C]">RMA Submission Form</h2>
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Order Number *</label>
                <input type="text" name="orderNumber" required className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8] transition-all" placeholder="Found on email" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Product Name *</label>
                <input type="text" name="productName" required className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8] transition-all" placeholder="e.g. Cisco 8841" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Product SKU</label>
                <input type="text" name="sku" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8] transition-all" placeholder="If available" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Issue Type *</label>
                <select name="issueType" required className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8] transition-all bg-white">
                  <option value="">Select an issue type</option>
                  <option>Defective</option>
                  <option>Damaged</option>
                  <option>Wrong Item</option>
                  <option>Missing Accessories</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Description of Issue *</label>
              <textarea name="description" required rows={4} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8] transition-all resize-y" placeholder="Please describe the problem in detail to expedite the process"></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Customer Email *</label>
                <input type="email" name="customerEmail" required className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8] transition-all" placeholder="you@example.com" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Customer Phone *</label>
                <input type="tel" name="customerPhone" required className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8] transition-all" placeholder="0300 1234567" />
              </div>
            </div>

            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:bg-gray-50 hover:border-[#00B4D8] transition-colors cursor-pointer group">
              <Upload className="mx-auto text-gray-400 group-hover:text-[#00B4D8] mb-2" size={24} />
              <p className="text-sm font-bold text-gray-700 group-hover:text-[#00B4D8]">Upload Photo/Video (Optional)</p>
              <p className="text-xs text-gray-500 mt-1">Helps us diagnose the issue faster. Max 5MB.</p>
              <input type="file" className="hidden" accept="image/*,video/*" />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#1A2B4C] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#00B4D8] transition-colors flex items-center justify-center gap-2 mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />} 
              {loading ? 'Submitting...' : 'Submit RMA Request'}
            </button>
          </form>
          
          <div className="mt-8 p-4 bg-blue-50 text-blue-800 rounded-lg text-sm font-medium">
             <strong>Note:</strong> Please ship your items to: AV Live Communications, Shop, Johar Town Block N, Lahore. Do not ship items without an RMA number provided via email.
          </div>
        </div>
      </div>
    </div>
  );
}
