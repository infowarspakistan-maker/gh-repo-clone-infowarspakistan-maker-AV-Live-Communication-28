import React, { useState, useEffect } from 'react';
import { Calendar, Clock, ArrowRight, ArrowLeft, Mail } from 'lucide-react';
import { motion } from 'motion/react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { subscribeToBlogPosts } from '../lib/firebase/firestore-helpers';
import { FALLBACK_BLOG_CATALOG, BlogCatalogEntry, resolveCanonicalBlogSlug } from '../lib/sitemap-generator';

const CATEGORIES = [
  'All',
  'Video Conferencing',
  'IP Phones & VoIP',
  'AV Integration',
  'Events & Expo',
  'Industry Trends',
  'Company News'
];

export type FallbackBlogPost = BlogCatalogEntry;
export const FALLBACK_BLOG_POSTS: FallbackBlogPost[] = FALLBACK_BLOG_CATALOG;

export function Blog() {
  const { postSlug } = useParams<{ postSlug?: string }>();
  const [activeCategory, setActiveCategory] = useState('All');
  const [posts, setPosts] = useState<FallbackBlogPost[]>(FALLBACK_BLOG_POSTS);

  useEffect(() => {
    const unsubscribe = subscribeToBlogPosts((firebasePosts) => {
      if (firebasePosts && firebasePosts.length > 0) {
        const mapped: FallbackBlogPost[] = firebasePosts
          .filter(p => p.isPublished !== false)
          .map(p => {
            const rawSlug = p.slug || String(p.id);
            const canonicalSlug = resolveCanonicalBlogSlug(rawSlug) || rawSlug;
            const fallbackEntry = FALLBACK_BLOG_POSTS.find(fb => fb.slug === canonicalSlug);
            return {
              id: fallbackEntry?.id || p.id || canonicalSlug,
              slug: canonicalSlug,
              title: p.title || fallbackEntry?.title || 'AV Live Insights',
              category: p.category || fallbackEntry?.category || 'Industry Trends',
              excerpt: p.excerpt || fallbackEntry?.excerpt || '',
              answerFirstSummary: fallbackEntry?.answerFirstSummary,
              comparisonTable: fallbackEntry?.comparisonTable,
              faqs: fallbackEntry?.faqs,
              relatedLinks: fallbackEntry?.relatedLinks,
              content: Array.isArray(p.content) && p.content.length > 0
                ? p.content
                : typeof p.content === 'string' && p.content.trim()
                ? p.content.split('\n\n')
                : fallbackEntry?.content || [p.excerpt || ''],
              image: p.image || p.featuredImage || fallbackEntry?.image || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&q=80',
              readTime: fallbackEntry?.readTime || '5 min read',
              publishedIso: p.publishedAt ? new Date(p.publishedAt).toISOString().split('T')[0] : (fallbackEntry?.publishedIso || '2026-07-15'),
              date: p.publishedAt ? new Date(p.publishedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : (fallbackEntry?.date || 'July 2026')
            };
          });
        const existingSlugs = new Set(mapped.map(m => m.slug));
        const merged = [...mapped, ...FALLBACK_BLOG_POSTS.filter(fb => !existingSlugs.has(fb.slug))];
        setPosts(merged);
      } else {
        setPosts(FALLBACK_BLOG_POSTS);
      }
    });
    return () => unsubscribe();
  }, []);

  if (postSlug) {
    const canonicalSlug = resolveCanonicalBlogSlug(postSlug) || postSlug;
    if (canonicalSlug !== postSlug) {
      return <Navigate to={`/blog/${canonicalSlug}`} replace />;
    }

    const matchedPost = posts.find(
      p => p.slug === canonicalSlug || String(p.id) === postSlug
    );

    if (matchedPost && matchedPost.slug !== postSlug) {
      return <Navigate to={`/blog/${matchedPost.slug}`} replace />;
    }

    if (matchedPost) {
      const canonicalUrl = `https://avlive.com.pk/blog/${matchedPost.slug}`;
      const schemaGraph: any[] = [
        {
          '@type': 'BlogPosting',
          '@id': `${canonicalUrl}#article`,
          headline: matchedPost.title,
          description: matchedPost.answerFirstSummary || matchedPost.excerpt,
          image: matchedPost.image,
          datePublished: matchedPost.publishedIso,
          dateModified: matchedPost.publishedIso,
          author: {
            '@type': 'Organization',
            name: 'AV Live Communications',
            url: 'https://avlive.com.pk'
          },
          publisher: {
            '@id': 'https://avlive.com.pk/#organization'
          },
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': canonicalUrl
          }
        }
      ];

      if (matchedPost.faqs && matchedPost.faqs.length > 0) {
        schemaGraph.push({
          '@type': 'FAQPage',
          '@id': `${canonicalUrl}#faq`,
          mainEntity: matchedPost.faqs.map(f => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: {
              '@type': 'Answer',
              text: f.a
            }
          }))
        });
      }

      return (
        <div className="bg-[#F8F9FA] min-h-screen pb-16">
          <SEO
            title={`${matchedPost.title} | AV Live Blog`}
            description={(matchedPost.answerFirstSummary || matchedPost.excerpt).substring(0, 160)}
            url={canonicalUrl}
            type="article"
            image={matchedPost.image}
            imageAlt={matchedPost.title}
            schema={{
              '@context': 'https://schema.org',
              '@graph': schemaGraph
            }}
          />
          <div className="bg-[#1A2B4C] text-white py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <Link to="/blog" className="inline-flex items-center gap-2 text-[#00B4D8] font-bold text-sm mb-6 hover:text-white transition-colors">
                <ArrowLeft size={16} /> Back to All Articles
              </Link>
              <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider text-[#00B4D8] mb-4">
                <span>{matchedPost.category}</span>
                <span>•</span>
                <span>{matchedPost.date}</span>
                <span>•</span>
                <span>{matchedPost.readTime}</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
                {matchedPost.title}
              </h1>
            </div>
          </div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
            <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-lg p-6 sm:p-12">
              {/* Answer-First AEO Direct Verdict Block */}
              <div className="bg-[#1A2B4C]/5 border-l-4 border-[#00B4D8] rounded-2xl p-6 mb-8">
                <span className="block text-[11px] font-black uppercase tracking-widest text-[#00B4D8] mb-2">
                  Direct Engineering Verdict (TL;DR)
                </span>
                <p className="text-base sm:text-lg font-bold text-[#1A2B4C] leading-relaxed">
                  {matchedPost.answerFirstSummary || matchedPost.excerpt}
                </p>
              </div>

              <img
                src={matchedPost.image}
                alt={matchedPost.title}
                className="w-full h-72 sm:h-96 object-cover rounded-2xl mb-8"
              />

              {/* Semantic HTML Comparison & Specification Matrix */}
              {matchedPost.comparisonTable && (
                <div className="mb-10 overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
                  <table className="w-full text-left border-collapse text-xs sm:text-sm">
                    <caption className="bg-[#1A2B4C] text-white font-black text-left px-5 py-3.5 text-xs uppercase tracking-wider">
                      {matchedPost.comparisonTable.caption}
                    </caption>
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-[#1A2B4C] font-black uppercase text-[11px] tracking-wider">
                        {matchedPost.comparisonTable.headers.map((header, hIdx) => (
                          <th key={hIdx} className="py-3.5 px-4">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {matchedPost.comparisonTable.rows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-gray-50/80 transition-colors">
                          {row.map((cell, cIdx) => (
                            <td
                              key={cIdx}
                              className={`py-3.5 px-4 ${
                                cIdx === 0 ? 'font-black text-[#1A2B4C]' : 'font-medium text-gray-600'
                              }`}
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="space-y-5 text-gray-600 leading-relaxed">
                {matchedPost.content.map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>

              {/* Article FAQ Section for AEO & Featured Snippets */}
              {matchedPost.faqs && matchedPost.faqs.length > 0 && (
                <div className="mt-10 pt-8 border-t border-gray-100">
                  <h2 className="text-2xl font-black text-[#1A2B4C] mb-6">
                    Frequently Asked Questions
                  </h2>
                  <div className="space-y-4">
                    {matchedPost.faqs.map((faq, fIdx) => (
                      <div key={fIdx} className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                        <h3 className="font-black text-sm sm:text-base text-[#1A2B4C] mb-2">
                          {faq.q}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium">
                          {faq.a}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Topical Cluster Internal Links */}
              {matchedPost.relatedLinks && matchedPost.relatedLinks.length > 0 && (
                <div className="mt-10 pt-8 border-t border-gray-100">
                  <h2 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4">
                    Related Enterprise Hardware &amp; Solutions
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {matchedPost.relatedLinks.map((item, lIdx) => (
                      <Link
                        key={lIdx}
                        to={item.path}
                        className="flex items-center justify-between p-4 rounded-2xl border border-gray-200 hover:border-[#00B4D8] hover:bg-[#00B4D8]/5 transition-all group"
                      >
                        <span className="font-bold text-sm text-[#1A2B4C] group-hover:text-[#00B4D8]">
                          {item.label}
                        </span>
                        <ArrowRight size={16} className="text-gray-400 group-hover:text-[#00B4D8] group-hover:translate-x-1 transition-all" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-10 pt-8 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
                <Link to="/shop" className="bg-[#1A2B4C] text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-[#00B4D8] transition-colors">
                  Explore Enterprise Hardware
                </Link>
                <Link to="/contact" className="text-[#00B4D8] font-bold text-sm hover:text-[#1A2B4C] transition-colors inline-flex items-center gap-2">
                  Schedule an AV Consultation <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  const filteredPosts = activeCategory === 'All' 
    ? posts 
    : posts.filter(post => post.category === activeCategory);

  return (
    <div className="bg-[#F8F9FA] min-h-screen pb-16">
      <SEO 
        title="AV Live Insights & Tech Blog | Video Conferencing & VoIP Trends"
        description="Expert insights, architectural guides, and industry trends on corporate video conferencing, IP telephony, Microsoft Teams Rooms, and smart boardroom automation in Pakistan."
        url="https://avlive.com.pk/blog"
        type="website"
        image="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1200"
        imageAlt="AV Live Communications - Tech Blog and Pro AV Guides"
        schema={{
          "@context": "https://schema.org",
          "@type": "Blog",
          "name": "AV Live Blog",
          "description": "Insights, Trends & Expert Advice on AV Solutions.",
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
              key={post.slug || post.id}
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
                  <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                </h2>
                
                <p className="text-gray-500 text-sm leading-relaxed mb-8 flex-1 line-clamp-4">
                  {post.excerpt}
                </p>
                
                <Link to={`/blog/${post.slug}`} className="inline-flex items-center gap-2 text-[#00B4D8] font-bold text-sm hover:text-[#1A2B4C] transition-colors mt-auto w-max">
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

