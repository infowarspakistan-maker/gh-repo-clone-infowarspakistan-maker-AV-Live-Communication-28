import { useState } from 'react';
import { SEO } from '../components/SEO';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { DeepQueryModal } from '../components/DeepQueryModal';

export function Services() {
  const [step, setStep] = useState(1);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('Consult with our AV Expert');

  return (
    <div className="bg-[#F8F9FA] min-h-screen py-12 text-[#1A2B4C]">
      <SEO 
        title="Event Management & AV Rental Services | AV Live Pakistan"
        description="Book professional AV teams for corporate summits, hybrid events, or e-Sports tournaments. SMD screens, PA systems, and multi-camera live streaming."
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: 'Services' }]} />
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 uppercase tracking-tighter">Event Management</h1>
          <p className="text-lg text-gray-500 font-medium mb-6">
            Book our professional teams for your next corporate summit, hybrid event, or e-Sports tournament.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button 
              onClick={() => {
                setModalTitle("Get a Quick Quote");
                setIsQuoteModalOpen(true);
              }}
              className="bg-[#00B4D8] text-white px-6 py-3 rounded-full font-bold hover:bg-[#1A2B4C] transition-all uppercase tracking-wider text-xs whitespace-nowrap shadow-md hover:-translate-y-0.5 cursor-pointer"
            >
              Quick Quote
            </button>
            <button 
              onClick={() => {
                setModalTitle("Connect with our Consultant");
                setIsQuoteModalOpen(true);
              }}
              className="bg-white text-[#1A2B4C] border border-gray-200 px-6 py-3 rounded-full font-bold hover:bg-gray-50 transition-all uppercase tracking-wider text-xs whitespace-nowrap shadow-sm hover:-translate-y-0.5 cursor-pointer"
            >
              Connect with our Consultant
            </button>
          </div>
        </div>

        <div className="bg-white rounded-[32px] border border-gray-200 p-8 shadow-sm">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    step >= s ? 'bg-[#00B4D8] text-white' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {s}
                  </div>
                  {s < 4 && (
                    <div className={`h-1 w-16 sm:w-32 mx-2 rounded ${
                      step > s ? 'bg-[#00B4D8]' : 'bg-gray-100'
                    }`}></div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-widest">
              <span>Service Type</span>
              <span>Scope</span>
              <span>Add-ons</span>
              <span>Details</span>
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-6 animate-in fade-in">
              <h2 className="text-2xl font-bold mb-6">Select Service Type</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <label className="border-2 border-gray-200 rounded-2xl p-6 cursor-pointer hover:border-[#00B4D8] transition-colors focus-within:border-[#00B4D8] focus-within:ring-1 focus-within:ring-[#00B4D8] group">
                  <input type="radio" name="service" className="sr-only" />
                  <span className="block font-bold text-[#1A2B4C] mb-2 group-hover:text-[#00B4D8]">Corporate Event</span>
                  <span className="block text-sm text-gray-500 font-medium">Conferences, seminars, product launches.</span>
                </label>
                <label className="border-2 border-gray-200 rounded-2xl p-6 cursor-pointer hover:border-[#00B4D8] transition-colors focus-within:border-[#00B4D8] focus-within:ring-1 focus-within:ring-[#00B4D8] group">
                  <input type="radio" name="service" className="sr-only" />
                  <span className="block font-bold text-[#1A2B4C] mb-2 group-hover:text-[#00B4D8]">Hybrid Event</span>
                  <span className="block text-sm text-gray-500 font-medium">In-person combined with high-quality live streaming.</span>
                </label>
                <label className="border-2 border-gray-200 rounded-2xl p-6 cursor-pointer hover:border-[#00B4D8] transition-colors focus-within:border-[#00B4D8] focus-within:ring-1 focus-within:ring-[#00B4D8] group">
                  <input type="radio" name="service" className="sr-only" />
                  <span className="block font-bold text-[#1A2B4C] mb-2 group-hover:text-[#00B4D8]">Expo Organizing</span>
                  <span className="block text-sm text-gray-500 font-medium">Custom shell schemes and large scale booth construction.</span>
                </label>
                <label className="border-2 border-gray-200 rounded-2xl p-6 cursor-pointer hover:border-[#00B4D8] transition-colors focus-within:border-[#00B4D8] focus-within:ring-1 focus-within:ring-[#00B4D8] group">
                  <input type="radio" name="service" className="sr-only" />
                  <span className="block font-bold text-[#1A2B4C] mb-2 group-hover:text-[#00B4D8]">e-Sports Arena Setup</span>
                  <span className="block text-sm text-gray-500 font-medium">High refresh rate displays and robust networking.</span>
                </label>
              </div>
              <div className="pt-6 flex justify-end">
                <button onClick={() => setStep(2)} className="bg-[#1A2B4C] text-white px-8 py-3 rounded-full hover:bg-[#00B4D8] font-bold text-sm uppercase tracking-wider transition-colors">Next Step</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in">
              <h2 className="text-2xl font-bold mb-6">Select Scope</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Expected Guests (Pax)</label>
                  <select className="w-full border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#00B4D8] font-medium">
                    <option>50 - 100</option>
                    <option>100 - 300</option>
                    <option>300 - 1000</option>
                    <option>1000+</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Duration (Days)</label>
                  <select className="w-full border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#00B4D8] font-medium">
                    <option>1 Day</option>
                    <option>2-3 Days</option>
                    <option>1 Week+</option>
                  </select>
                </div>
              </div>
              <div className="pt-6 flex justify-between">
                <button onClick={() => setStep(1)} className="text-gray-500 px-8 py-3 rounded-full hover:bg-gray-50 border border-gray-200 font-bold text-sm uppercase tracking-wider">Back</button>
                <button onClick={() => setStep(3)} className="bg-[#1A2B4C] text-white px-8 py-3 rounded-full hover:bg-[#00B4D8] font-bold text-sm uppercase tracking-wider transition-colors">Next Step</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in">
              <h2 className="text-2xl font-bold mb-6">Select Add-ons</h2>
              <div className="space-y-3">
                <label className="flex items-center space-x-4 border border-gray-200 p-6 rounded-2xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="checkbox" className="h-5 w-5 text-[#00B4D8] rounded border-gray-300 focus:ring-[#00B4D8]" />
                  <div>
                    <span className="block font-bold text-[#1A2B4C]">SMD Screen Rental</span>
                    <span className="block text-sm text-gray-500 font-medium mt-1">Large format LED video walls for stage backdrops.</span>
                  </div>
                </label>
                <label className="flex items-center space-x-4 border border-gray-200 p-6 rounded-2xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="checkbox" className="h-5 w-5 text-[#00B4D8] rounded border-gray-300 focus:ring-[#00B4D8]" />
                  <div>
                    <span className="block font-bold text-[#1A2B4C]">Line Array PA System</span>
                    <span className="block text-sm text-gray-500 font-medium mt-1">High-fidelity audio for large auditoriums.</span>
                  </div>
                </label>
                <label className="flex items-center space-x-4 border border-gray-200 p-6 rounded-2xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="checkbox" className="h-5 w-5 text-[#00B4D8] rounded border-gray-300 focus:ring-[#00B4D8]" />
                  <div>
                    <span className="block font-bold text-[#1A2B4C]">Professional Live Streaming</span>
                    <span className="block text-sm text-gray-500 font-medium mt-1">Multi-camera setup with broadcasting switches.</span>
                  </div>
                </label>
              </div>
              <div className="pt-6 flex justify-between">
                <button onClick={() => setStep(2)} className="text-gray-500 px-8 py-3 rounded-full hover:bg-gray-50 border border-gray-200 font-bold text-sm uppercase tracking-wider">Back</button>
                <button onClick={() => setStep(4)} className="bg-[#1A2B4C] text-white px-8 py-3 rounded-full hover:bg-[#00B4D8] font-bold text-sm uppercase tracking-wider transition-colors">Next Step</button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-in fade-in">
              <h2 className="text-2xl font-bold mb-6">Final Details</h2>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Company Name</label>
                  <input type="text" className="w-full border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#00B4D8] font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
                  <input type="email" className="w-full border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#00B4D8] font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Preferred Date</label>
                  <input type="date" className="w-full border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#00B4D8] font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Additional Notes</label>
                  <textarea rows={3} className="w-full border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#00B4D8] font-medium"></textarea>
                </div>
              </div>
              <div className="pt-6 flex justify-between items-center">
                <button onClick={() => setStep(3)} className="text-gray-500 px-8 py-3 rounded-full hover:bg-gray-50 border border-gray-200 font-bold text-sm uppercase tracking-wider">Back</button>
                <button onClick={() => alert('Quotation Request Submitted!')} className="bg-[#1A2B4C] text-white px-8 py-3 rounded-full hover:bg-[#00B4D8] font-bold text-sm uppercase tracking-wider transition-colors">Submit Request</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <DeepQueryModal 
        isOpen={isQuoteModalOpen} 
        onClose={() => setIsQuoteModalOpen(false)} 
        title={modalTitle}
        initialEventType="esports"
      />
    </div>
  );
}
