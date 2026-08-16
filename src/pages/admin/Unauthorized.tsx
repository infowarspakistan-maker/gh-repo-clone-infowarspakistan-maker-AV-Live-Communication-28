import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

export function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-10 text-center border border-gray-100"
      >
        <div className="w-20 h-20 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
          <ShieldAlert size={40} />
        </div>
        <h1 className="text-3xl font-black text-[#1A2B4C] mb-4 uppercase tracking-tight">Access Denied</h1>
        <p className="text-gray-500 font-medium mb-10 leading-relaxed">
          Your account does not have the necessary permissions to access this administrative area. Please contact the system administrator if you believe this is an error.
        </p>
        <div className="space-y-4">
          <Link 
            to="/" 
            className="w-full bg-[#1A2B4C] text-white py-4 px-6 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-[#00B4D8] transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Public Site
          </Link>
          <Link 
            to="/admin/login" 
            className="block text-[#00B4D8] font-black text-xs uppercase tracking-[0.2em] hover:underline"
          >
            Try Different Account
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
