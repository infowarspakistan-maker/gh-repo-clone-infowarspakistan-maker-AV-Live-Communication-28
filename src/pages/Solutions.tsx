import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { SEO } from '../components/SEO';

export function Solutions() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="py-16 bg-[#F8F9FA] min-h-screen text-[#1A2B4C]">
      <SEO title="Solutions" />
      <motion.div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.h1 
          className="text-4xl font-bold mb-4 uppercase tracking-tighter"
          variants={itemVariants}
        >
          Solutions Ecosystem
        </motion.h1>
        <motion.p 
          className="text-lg text-gray-500 mb-16 max-w-3xl font-medium"
          variants={itemVariants}
        >
          We integrate the world's leading brands to build seamless environments for hybrid work, 
          immersive presentations, and large-scale enterprise events.
        </motion.p>

        <div className="space-y-8">
          <motion.div 
            className="bg-white rounded-[32px] border border-gray-200 p-8 md:p-12 flex flex-col md:flex-row gap-12 items-center shadow-sm hover:border-[#00B4D8] transition-all hover:shadow-md"
            variants={itemVariants}
            whileHover={{ y: -5 }}
          >
            <div className="flex-1">
              <span className="text-[#00B4D8] text-xs font-bold uppercase tracking-[0.2em] mb-4 block">Workspace</span>
              <h2 className="text-3xl font-bold mb-4">Smart Collaboration</h2>
              <p className="text-gray-500 mb-8 text-sm leading-relaxed">
                Equip your meeting spaces with state-of-the-art video conferencing systems. We bundle 
                Polycom, Cisco, and HP hardware to create flawless communication hubs that bridge the gap 
                between in-office and remote teams.
              </p>
              <ul className="space-y-4 text-sm font-semibold mb-8">
                <li className="flex items-center"><span className="w-2 h-2 bg-[#00B4D8] rounded-full mr-4"></span> Polycom Studio & Cisco Webex Integration</li>
                <li className="flex items-center"><span className="w-2 h-2 bg-[#00B4D8] rounded-full mr-4"></span> Intelligent Audio Framing</li>
                <li className="flex items-center"><span className="w-2 h-2 bg-[#00B4D8] rounded-full mr-4"></span> Touch-panel control systems</li>
              </ul>
              <button className="bg-[#1A2B4C] text-white px-8 py-3 rounded-full text-sm font-bold hover:bg-[#00B4D8] transition-all tracking-wider uppercase">
                Request Consultation
              </button>
            </div>
            <div className="flex-1 bg-gray-100 rounded-3xl aspect-video overflow-hidden border border-gray-200 relative">
              <img loading="lazy" src="https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=800&q=80" alt="Smart Collaboration" className="w-full h-full object-cover mix-blend-multiply" />
            </div>
          </motion.div>

          <motion.div 
            className="bg-white rounded-[32px] border border-gray-200 p-8 md:p-12 flex flex-col md:flex-row-reverse gap-12 items-center shadow-sm hover:border-[#00B4D8] transition-all hover:shadow-md"
            variants={itemVariants}
            whileHover={{ y: -5 }}
          >
            <div className="flex-1">
              <span className="text-[#00B4D8] text-xs font-bold uppercase tracking-[0.2em] mb-4 block">Visuals</span>
              <h2 className="text-3xl font-bold mb-4">Immersive Visuals</h2>
              <p className="text-gray-500 mb-8 text-sm leading-relaxed">
                Command attention with our high-resolution SMD displays and crystal-clear PA systems. 
                Perfect for digital signage, auditoriums, and corporate lobbies requiring high-impact visual delivery.
              </p>
              <ul className="space-y-4 text-sm font-semibold mb-8">
                <li className="flex items-center"><span className="w-2 h-2 bg-[#00B4D8] rounded-full mr-4"></span> P2.5 to P6 Pitch SMD Displays</li>
                <li className="flex items-center"><span className="w-2 h-2 bg-[#00B4D8] rounded-full mr-4"></span> Bosch Multi-channel PA Audio</li>
                <li className="flex items-center"><span className="w-2 h-2 bg-[#00B4D8] rounded-full mr-4"></span> Digital Signage Management</li>
              </ul>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/shop" className="bg-[#1A2B4C] text-white px-8 py-3 rounded-full text-sm font-bold hover:bg-[#00B4D8] transition-all tracking-wider uppercase text-center">
                  View Catalog
                </Link>
                <Link to="/room-designer" className="bg-white border-2 border-[#1A2B4C] text-[#1A2B4C] px-8 py-3 rounded-full text-sm font-bold hover:bg-[#1A2B4C] hover:text-white transition-all tracking-wider uppercase text-center">
                  Room Designer
                </Link>
              </div>
            </div>
            <div className="flex-1 bg-gray-100 rounded-3xl aspect-video overflow-hidden border border-gray-200 relative">
              <img loading="lazy" src="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80" alt="Immersive Visuals" className="w-full h-full object-cover mix-blend-multiply" />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
