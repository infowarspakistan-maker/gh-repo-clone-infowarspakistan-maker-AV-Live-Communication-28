import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Star, MessageSquare } from 'lucide-react';
import { SEO } from '../components/SEO';

const REVIEWS = [
  {
    id: 1,
    name: "Ahmed Raza",
    role: "IT Director",
    company: "Habib Bank Ltd.",
    category: "Video Conferencing",
    content: "AV Live completely transformed our boardroom. The Cisco Room Kit is a game-changer. Their installation team was professional and punctual.",
    rating: 5
  },
  {
    id: 2,
    name: "Sara Khan",
    role: "Operations Manager",
    company: "JazzCall",
    category: "IP Phones",
    content: "We outfitted our new 300-seat call center with Yealink IP Phones and headsets from AV Live. The provisioning service saved us weeks of configuration time.",
    rating: 5
  },
  {
    id: 3,
    name: "Zain Malik",
    role: "Marketing Head",
    company: "Nestlé Pakistan",
    category: "Events",
    content: "The SMD display they installed for our launch event was stunning. The colors were perfect, and the on-site support was impeccable.",
    rating: 5
  },
  {
    id: 4,
    name: "Imam Qasim",
    role: "Head",
    company: "Jamia Masjid Al-Haram",
    category: "Security",
    content: "We needed a public address system for our mosque renovation. AV Live delivered a crystal-clear Bosch system with flawless zone control.",
    rating: 5
  }
];

const CATEGORIES = ['All', 'Video Conferencing', 'IP Phones', 'Security', 'Events'];

export function Reviews() {
  const [activeCategory, setActiveCategory] = useState('All');
  const filteredReviews = activeCategory === 'All' ? REVIEWS : REVIEWS.filter(r => r.category === activeCategory);

  return (
    <div className="bg-[#F8F9FA] min-h-screen pb-16">
      <SEO title="Reviews" />
      <div className="bg-[#1A2B4C] text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-900/20 mix-blend-multiply"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black mb-6 tracking-tight"
          >
            Trusted by Pakistan's Top Enterprises
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-white max-w-3xl mx-auto leading-relaxed"
          >
            Real reviews from real clients. We take pride in delivering exceptional AV solutions and support. AV Live is rated 4.8/5 stars by our clients across Pakistan. We are proud to be the trusted choice for enterprise AV.
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="flex flex-wrap items-center justify-center gap-3 mb-16">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
                activeCategory === cat 
                  ? 'bg-[#00B4D8] text-white shadow-md shadow-[#00B4D8]/20' 
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-[#00B4D8] hover:text-[#00B4D8]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredReviews.map((review, i) => (
            <motion.div 
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm relative"
            >
              <div className="absolute top-8 right-8 text-[#00B4D8]/20">
                 <MessageSquare size={48} />
              </div>
              <div className="flex gap-1 mb-6 text-yellow-400">
                {[...Array(review.rating)].map((_, i) => <Star key={i} size={20} fill="currentColor" />)}
              </div>
              <p className="text-gray-600 text-lg leading-relaxed mb-8 relative z-10 italic">
                "{review.content}"
              </p>
              <div>
                <h4 className="font-bold text-[#1A2B4C]">{review.name}</h4>
                <p className="text-sm text-gray-500">{review.role}, <span className="font-semibold text-gray-700">{review.company}</span></p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center">
           <button className="bg-[#1A2B4C] text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-[#00B4D8] transition-colors inline-block shadow-lg">
             Write a Review
           </button>
        </div>
      </div>
    </div>
  );
}
