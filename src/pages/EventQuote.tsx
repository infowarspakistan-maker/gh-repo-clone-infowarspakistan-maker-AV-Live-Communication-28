import React from 'react';
import { SEO } from '../components/SEO';
import { DeepQueryForm } from '../components/DeepQueryForm';

export function EventQuote() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <SEO title="Get a Quote" description="Get a comprehensive quote and consultation for your event services." />
      <div className="container max-w-4xl mx-auto px-4 mt-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-[#1A2B4C] mb-4">Event Quote & Consultation</h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-sm leading-relaxed font-medium">
            Complete our multi-step interactive estimator to tell us about your requirements. We'll generate an estimated budget range instantly, and our expert consultants will follow up with a detailed proposal.
          </p>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-xl p-6 md:p-12 border border-gray-100">
          <DeepQueryForm />
        </div>
      </div>
    </div>
  );
}
