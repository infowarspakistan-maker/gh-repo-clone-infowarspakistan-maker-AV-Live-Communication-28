import { useState } from 'react';
import { motion } from 'motion/react';
import { Gamepad2, MonitorPlay, Network } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DeepQueryModal } from '../components/DeepQueryModal';
import { SEO } from '../components/SEO';

export function Esports() {
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('Consult with our AV Expert');
  return (
    <div className="bg-[#1A2B4C] min-h-screen text-white">
      <SEO title="Esports" />
      <div className="relative h-[400px] overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <img loading="lazy" src="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1920&q=80" alt="e-Sports Arena" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A2B4C] to-transparent"></div>
        </div>
        <div className="relative z-10 text-center px-4">
          <span className="text-[#00B4D8] font-bold tracking-[0.3em] uppercase text-sm block mb-4">Official Partnership: e-sport.pk</span>
          <h1 className="text-5xl md:text-6xl font-black mb-4 uppercase tracking-tighter">e-Sports Arenas</h1>
          <p className="text-xl text-white max-w-2xl mx-auto font-medium">
            Turnkey AV infrastructure for professional gaming tournaments.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white/5 border border-white/10 p-8 rounded-[32px] backdrop-blur-sm hover:border-[#00B4D8]/50 transition-colors">
            <div className="w-12 h-12 bg-[#00B4D8]/20 rounded-2xl flex items-center justify-center text-[#00B4D8] mb-6">
              <MonitorPlay size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3">144Hz+ SMD Displays</h3>
            <p className="text-gray-400 text-sm leading-relaxed font-medium">Giant, high-refresh-rate LED walls that capture every frame for the live audience without motion blur.</p>
          </div>
          <div className="bg-white/5 border border-white/10 p-8 rounded-[32px] backdrop-blur-sm hover:border-[#00B4D8]/50 transition-colors">
            <div className="w-12 h-12 bg-[#00B4D8]/20 rounded-2xl flex items-center justify-center text-[#00B4D8] mb-6">
              <Network size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3">Zero Latency Networks</h3>
            <p className="text-gray-400 text-sm leading-relaxed font-medium">Enterprise-grade Cisco switching and routing to ensure ping stability during million-dollar matches.</p>
          </div>
          <div className="bg-white/5 border border-white/10 p-8 rounded-[32px] backdrop-blur-sm hover:border-[#00B4D8]/50 transition-colors">
            <div className="w-12 h-12 bg-[#00B4D8]/20 rounded-2xl flex items-center justify-center text-[#00B4D8] mb-6">
              <Gamepad2 size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3">Broadcast & Audio</h3>
            <p className="text-gray-400 text-sm leading-relaxed font-medium">Multi-channel PA systems and broadcast integration for shoutcasters and live streamers.</p>
          </div>
        </div>

        <div className="bg-white rounded-[32px] p-8 md:p-12 text-[#1A2B4C] flex flex-col md:flex-row items-center gap-12 justify-between shadow-xl">
          <div className="flex-1 max-w-2xl">
            <h2 className="text-3xl font-bold mb-4">Host Your Next Tournament</h2>
            <p className="text-gray-500 font-medium mb-8">Whether it's a local LAN party or a national championship, our expert engineers design the arena to international standards.</p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => {
                  setModalTitle("Get a Quick Quote");
                  setIsQuoteModalOpen(true);
                }}
                className="bg-[#1A2B4C] text-white px-8 py-4 rounded-full font-bold hover:bg-[#00B4D8] transition-all uppercase tracking-wider text-sm whitespace-nowrap shadow-lg hover:-translate-y-1 cursor-pointer"
              >
                Quick Quote
              </button>
              <button 
                onClick={() => {
                  setModalTitle("Connect with our Consultant");
                  setIsQuoteModalOpen(true);
                }}
                className="bg-transparent text-[#1A2B4C] border-2 border-[#1A2B4C]/20 hover:border-[#1A2B4C] px-8 py-4 rounded-full font-bold hover:bg-gray-50 transition-all uppercase tracking-wider text-sm whitespace-nowrap hover:-translate-y-1 cursor-pointer"
              >
                Connect with our Consultant
              </button>
            </div>
          </div>
          <div className="flex-1 w-full">
            <div className="aspect-video bg-gray-100 rounded-2xl overflow-hidden relative">
              <img loading="lazy" 
                src="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80" 
                alt="Esports Arena" 
                className="w-full h-full object-cover opacity-80 mix-blend-multiply" 
              />
            </div>
          </div>
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
