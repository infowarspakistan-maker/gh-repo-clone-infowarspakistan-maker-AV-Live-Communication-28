import React, { useState, useEffect } from 'react';
import { Calendar, Clock, ArrowRight, Mail, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { subscribeToBlogPosts } from '../lib/firebase/firestore-helpers';

const CATEGORIES = [
  'All',
  'Video Conferencing',
  'IP Phones & VoIP',
  'AV Integration',
  'Events & Expo',
  'Industry Trends',
  'Company News'
];

const BLOG_POSTS = [
  {
    id: 1,
    title: 'The Future of Video Conferencing in Pakistan: Trends to Watch in 2026',
    date: 'July 2026',
    category: 'Video Conferencing',
    readTime: '6 min read',
    excerpt: 'As Pakistan embraces digital transformation, video conferencing has become core infrastructure for organizations. From AI-driven meeting experiences to secure local platforms like "KALAAM", the landscape is evolving rapidly. At AV Live, we\'re at the forefront, delivering solutions from Cisco Webex and Polycom that "just work" without requiring technical expertise. In this post, we explore the top trends shaping hybrid work and secure communications in Pakistan.',
    image: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 2,
    title: 'IP Phones vs. Softphones: Which Is Right for Your Business?',
    date: 'June 2026',
    category: 'IP Phones & VoIP',
    readTime: '5 min read',
    excerpt: 'Choosing between a physical IP phone and a software-based softphone depends on your team\'s workflow, security needs, and budget. Desk IP phones remain essential for small businesses in 2026, offering reliability, superior audio quality, and dedicated features. We break down the pros and cons of each, helping you make the right decision for your organization.',
    image: 'https://images.unsplash.com/photo-1563690325150-10aa17ff983e?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 3,
    title: 'How to Choose the Right Video Conferencing Equipment for Your Meeting Rooms',
    date: 'June 2026',
    category: 'Video Conferencing',
    readTime: '7 min read',
    excerpt: 'The best video conferencing equipment depends less on the camera alone and more on room size, audio coverage, display use, and meeting workflow. In this comprehensive guide, we walk you through the four things to check first: audio pickup, camera framing, display clarity, and connection simplicity. Whether you need a 4-person huddle room or a 14-person boardroom, AV Live has the solution.',
    image: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 4,
    title: 'Understanding Public Address Systems: Components Every Facility Needs',
    date: 'May 2026',
    category: 'AV Integration',
    readTime: '5 min read',
    excerpt: 'A modern public address system in 2026 consists of five tightly integrated components. From microphones and amplifiers to speakers and network infrastructure, every element plays a critical role. We explain how IP-based PA systems are transforming communication in factories, schools, and commercial buildings across Pakistan.',
    image: 'https://images.unsplash.com/photo-1520166012956-add9ba0ee3f4?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 5,
    title: 'Hybrid Events 101: How to Engage Both In-Person and Virtual Audiences',
    date: 'May 2026',
    category: 'Events & Expo',
    readTime: '6 min read',
    excerpt: 'Hybrid events are here to stay. Combining live audiences with remote participants requires robust AV infrastructure, seamless streaming, and interactive tools. At AV Live, we specialize in end-to-end hybrid event solutions, from SMD displays and PA systems to live streaming and audience engagement platforms.',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 6,
    title: 'AV Live Communications: 15 Years of Unifying People and Ideas',
    date: 'April 2026',
    category: 'Company News',
    readTime: '4 min read',
    excerpt: 'Founded in 2010, AV Live has grown from a visionary startup to a trusted leader in Pakistan\'s AV industry. With offices in Lahore and Karachi, a team of dedicated professionals, and partnerships with global brands like Polycom and Cisco, we continue to deliver award-winning solutions that drive business innovation and profitability.',
    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32b7?auto=format&fit=crop&q=80&w=800'
  }
];

export function Blog() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToBlogPosts((firebasePosts) => {
      if (firebasePosts && firebasePosts.length > 0) {
        const mapped = firebasePosts.map(p => ({
          id: p.id || p.slug,
          title: p.title,
          category: p.category,
          excerpt: p.excerpt,
          image: p.image || p.featuredImage || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&q=80',
          readTime: '5 min read',
          date: p.publishedAt ? new Date(p.publishedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'July 2026'
        }));
        setPosts(mapped);
      } else {
        setPosts(BLOG_POSTS);
      }
    });
    return () => unsubscribe();
  }, []);

  const filteredPosts = activeCategory === 'All' 
    ? posts 
    : posts.filter(post => post.category === activeCategory);

  return (
    <div className="bg-[#F8F9FA] min-h-screen pb-16">
      <SEO 
        title="AV Live Blog | Latest Trends in Video Conferencing & VoIP"
        description="Insights, Trends & Expert Advice. Stay updated with the latest in video conferencing, IP phones, AV integration, and event technology."
        schema={{
          "@context": "https://schema.org",
          "@type": "Blog",
          "name": "AV Live Blog",
          "description": "Insights, Trends & Expert Advice.",
          "publisher": {
            "@id": "https://avlive.com.pk/#organization"
          }
        }}
      />
      {/* Hero Section */}
      <div className="bg-[#1A2B4C] text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-900/20 mix-blend-multiply"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black mb-6 tracking-tight"
          >
            AV Live Blog
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-white max-w-2xl mx-auto leading-relaxed"
          >
            Insights, Trends & Expert Advice. Stay updated with the latest in video conferencing, IP phones, AV integration, and event technology.
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-16">
        {/* Category Filter */}
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

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post, i) => (
            <motion.article 
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-3xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all group flex flex-col"
            >
              <div className="h-48 relative overflow-hidden">
                <img loading="lazy" src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-[#1A2B4C]">
                  {post.category}
                </div>
              </div>
              
              <div className="p-8 flex flex-col flex-1">
                <div className="flex items-center gap-4 text-xs font-semibold text-gray-400 mb-4 uppercase tracking-wider">
                  <span className="flex items-center gap-1"><Calendar size={14} /> {post.date}</span>
                  <span className="flex items-center gap-1"><Clock size={14} /> {post.readTime}</span>
                </div>
                
                <h2 className="text-xl font-black text-[#1A2B4C] mb-4 group-hover:text-[#00B4D8] transition-colors line-clamp-2 leading-snug">
                  <Link to={`/blog/${post.id}`}>{post.title}</Link>
                </h2>
                
                <p className="text-gray-500 text-sm leading-relaxed mb-8 flex-1 line-clamp-4">
                  {post.excerpt}
                </p>
                
                <Link to={`/blog/${post.id}`} className="inline-flex items-center gap-2 text-[#00B4D8] font-bold text-sm hover:text-[#1A2B4C] transition-colors mt-auto w-max">
                  Read More <ArrowRight size={16} />
                </Link>
              </div>
            </motion.article>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-16">
            <h3 className="text-2xl font-bold text-gray-400 mb-2">No posts found</h3>
            <p className="text-gray-500">Try selecting a different category.</p>
          </div>
        )}
      </div>

      {/* Newsletter Signup */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-[#1A2B4C] rounded-[2rem] p-10 md:p-16 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#00B4D8] rounded-full blur-3xl opacity-20 -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#F26522] rounded-full blur-3xl opacity-20 -ml-32 -mb-32"></div>
          
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Mail className="text-white" size={32} />
            </div>
            <h2 className="text-3xl font-black text-white mb-4">Stay Ahead in AV Technology</h2>
            <p className="text-gray-300 mb-8 max-w-lg mx-auto">Subscribe to our newsletter for the latest product updates, industry insights, and exclusive offers.</p>
            
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="Enter your email address" 
                required
                className="flex-1 bg-white/10 border border-white/20 text-white placeholder:text-gray-400 rounded-full px-6 py-4 focus:outline-none focus:border-[#00B4D8] focus:bg-white/20 transition-all"
              />
              <button 
                type="submit"
                className="bg-[#00B4D8] text-white px-8 py-4 rounded-full font-bold hover:bg-white hover:text-[#1A2B4C] transition-colors shrink-0"
              >
                Subscribe Now
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
