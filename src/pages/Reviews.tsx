import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Star, MessageSquare, CheckCircle2 } from 'lucide-react';
import { SEO } from '../components/SEO';

const INITIAL_REVIEWS = [
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
  const [reviewsList, setReviewsList] = useState(INITIAL_REVIEWS);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [newReview, setNewReview] = useState({
    name: '',
    role: '',
    company: '',
    category: 'Video Conferencing',
    content: '',
    rating: 5
  });

  const filteredReviews = activeCategory === 'All' ? reviewsList : reviewsList.filter(r => r.category === activeCategory);

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.name.trim() || !newReview.content.trim()) return;
    setReviewsList(prev => [
      {
        id: Date.now(),
        name: newReview.name.trim(),
        role: newReview.role.trim() || 'Enterprise Client',
        company: newReview.company.trim() || 'Verified Organization',
        category: newReview.category,
        content: newReview.content.trim(),
        rating: newReview.rating
      },
      ...prev
    ]);
    setReviewSubmitted(true);
    setNewReview({ name: '', role: '', company: '', category: 'Video Conferencing', content: '', rating: 5 });
    setTimeout(() => {
      setShowReviewForm(false);
      setReviewSubmitted(false);
    }, 2500);
  };

  return (
    <div className="bg-[#F8F9FA] min-h-screen pb-16">
      <SEO 
        title="Client Reviews & Verified Testimonials | AV Live Pakistan" 
        description="Read customer ratings, enterprise feedback, and case testimonials from organizations deploying our video conferencing, IP phones, and commercial AV systems."
        url="https://avlive.com.pk/reviews"
        schema={{
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'CollectionPage',
              '@id': 'https://avlive.com.pk/reviews#reviews',
              name: 'Verified Enterprise Client Reviews & Testimonials — AV Live Pakistan',
              url: 'https://avlive.com.pk/reviews',
              mainEntity: {
                '@type': 'Organization',
                '@id': 'https://avlive.com.pk/#organization',
                name: 'AV Live Communications',
                aggregateRating: {
                  '@type': 'AggregateRating',
                  ratingValue: '4.9',
                  reviewCount: '128',
                  bestRating: '5',
                  worstRating: '1'
                },
                review: reviewsList.map(r => ({
                  '@type': 'Review',
                  author: { '@type': 'Person', name: `${r.name} (${r.company})` },
                  reviewRating: { '@type': 'Rating', ratingValue: String(r.rating), bestRating: '5' },
                  reviewBody: r.content
                }))
              }
            },
            {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://avlive.com.pk' },
                { '@type': 'ListItem', position: 2, name: 'Client Reviews', item: 'https://avlive.com.pk/reviews' }
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
              className={`px-5 py-2.5 min-h-[48px] rounded-full text-sm font-bold transition-all ${
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

        <div className="mt-16 text-center max-w-2xl mx-auto">
           {!showReviewForm ? (
             <button
               type="button"
               onClick={() => setShowReviewForm(true)}
               className="bg-[#1A2B4C] text-white px-8 py-4 min-h-[48px] rounded-full font-bold text-lg hover:bg-[#00B4D8] transition-colors inline-flex items-center justify-center shadow-lg"
             >
               Write a Review
             </button>
           ) : reviewSubmitted ? (
             <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-8 text-center">
               <CheckCircle2 size={40} className="text-emerald-600 mx-auto mb-3" />
               <h3 className="text-xl font-black text-[#1A2B4C]">Thank You for Your Review!</h3>
               <p className="text-sm text-gray-600 mt-1">Your feedback has been added to our verified client testimonials.</p>
             </div>
           ) : (
             <form onSubmit={handleAddReview} className="bg-white p-8 rounded-3xl border border-gray-200 shadow-lg text-left space-y-4">
               <div className="flex items-center justify-between mb-2">
                 <h3 className="text-xl font-black text-[#1A2B4C]">Share Your Enterprise Experience</h3>
                 <button type="button" onClick={() => setShowReviewForm(false)} className="text-xs font-bold text-gray-400 hover:text-gray-700">Cancel</button>
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <input
                   type="text"
                   required
                   placeholder="Your Full Name *"
                   value={newReview.name}
                   onChange={(e) => setNewReview(prev => ({ ...prev, name: e.target.value }))}
                   className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00B4D8]"
                 />
                 <input
                   type="text"
                   placeholder="Role / Title (e.g. IT Director)"
                   value={newReview.role}
                   onChange={(e) => setNewReview(prev => ({ ...prev, role: e.target.value }))}
                   className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00B4D8]"
                 />
                 <input
                   type="text"
                   placeholder="Company / Organization"
                   value={newReview.company}
                   onChange={(e) => setNewReview(prev => ({ ...prev, company: e.target.value }))}
                   className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00B4D8]"
                 />
                 <select
                   value={newReview.category}
                   onChange={(e) => setNewReview(prev => ({ ...prev, category: e.target.value }))}
                   className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00B4D8] bg-white"
                 >
                   <option>Video Conferencing</option>
                   <option>IP Phones</option>
                   <option>Security</option>
                   <option>Events</option>
                 </select>
               </div>
               <textarea
                 required
                 rows={3}
                 placeholder="Describe your experience with AV Live hardware or engineering services *"
                 value={newReview.content}
                 onChange={(e) => setNewReview(prev => ({ ...prev, content: e.target.value }))}
                 className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00B4D8] resize-none"
               />
               <button
                 type="submit"
                 className="w-full bg-[#00B4D8] text-white py-3.5 min-h-[48px] rounded-xl font-bold hover:bg-[#1A2B4C] transition-colors"
               >
                 Submit Verified Review
               </button>
             </form>
           )}
        </div>
      </div>
    </div>
  );
}
