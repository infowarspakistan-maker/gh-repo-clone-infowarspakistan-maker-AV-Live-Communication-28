import React from 'react';
import { X } from 'lucide-react';
import { DeepQueryForm } from './DeepQueryForm';

interface DeepQueryModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  initialEventType?: string;
}

export function DeepQueryModal({ isOpen, onClose, title = "Consult with our AV Expert", initialEventType }: DeepQueryModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-[#1A2B4C]/70 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden z-10 border border-gray-100 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 bg-[#1A2B4C] text-white flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-lg font-black tracking-tight">{title}</h3>
            <p className="text-xs text-blue-200 font-medium">Multi-step Interactive Event Planner</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body - Scrollable */}
        <div className="p-6 overflow-y-auto flex-1">
          <DeepQueryForm isModal={true} onClose={onClose} initialEventType={initialEventType} />
        </div>
      </div>
    </div>
  );
}
