import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Clock, Send, Paperclip, Loader2, Globe, Facebook, Linkedin, Youtube, Instagram, Twitter } from 'lucide-react';
import { motion } from 'motion/react';
import { subscribeToContact, ContactData } from '../lib/firebase/firestore-helpers';
import { SEO } from '../components/SEO';

export function Contact() {
  const [content, setContent] = useState<ContactData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToContact((data) => {
      setContent(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="text-center">
          <Loader2 className="animate-spin text-[#00B4D8] mx-auto mb-4" size={40} />
          <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Loading Contact Support...</p>
        </div>
      </div>
    );
  }

  const data = {
    heroHeading: content?.heroHeading || "Let's Build Your AV Solution Together",
    heroSubheading: content?.heroSubheading || 'Whether you need a single IP phone or a complete video conferencing infrastructure, our team of AV experts is ready to help.',
    heroImageUrl: content?.heroImageUrl || '',
    address: content?.address || 'Shop, Johar Town Block N, Lahore',
    phone: content?.phone || '0321 425 6263',
    email: content?.email || 'info@avlive.com.pk',
    mapEmbedUrl: content?.mapEmbedUrl || 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13613.56515822359!2d74.26573881471374!3d31.458428581078776!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3919017432b1835b%3A0xe396992a5b05891c!2sBlock%20N%20Johar%20Town%2C%20Lahore%2C%20Punjab%2C%20Pakistan!5e0!3m2!1sen!2s!4v1715000000000!5m2!1sen!2s',
    businessHours: {
      weekday: content?.businessHours?.weekday || '9:00 AM – 6:00 PM',
      saturday: content?.businessHours?.saturday || '10:00 AM – 4:00 PM',
      sunday: content?.businessHours?.sunday || 'Closed',
    },
    socialLinks: {
      facebook: content?.socialLinks?.facebook || '',
      linkedin: content?.socialLinks?.linkedin || '',
      youtube: content?.socialLinks?.youtube || '',
      instagram: content?.socialLinks?.instagram || '',
      twitter: content?.socialLinks?.twitter || '',
    },
  };

  return (
    <div className="bg-[#F8F9FA] min-h-screen pb-16">
      <SEO 
        title="Contact AV Live Communications | Expert AV Support Lahore"
        description="Get in touch with our certified AV engineers. Offices in Lahore and Karachi. Expert support for IP phones, video conferencing, and AV integration."
        schema={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          "name": "Contact AV Live Communications",
          "description": "Get in touch with our certified AV engineers.",
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
            {data.heroHeading}
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-white max-w-3xl mx-auto leading-relaxed font-medium prose prose-invert max-w-none [&_*]:break-words [&_*]:whitespace-normal"
            dangerouslySetInnerHTML={{ __html: data.heroSubheading }}
          />
        </div>
        {/* Abstract Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00B4D8]/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#00B4D8]/5 rounded-full -translate-x-1/2 translate-y-1/2 blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Contact Information Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl"
            >
              <h3 className="text-xl font-black text-[#1A2B4C] mb-10 flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                  <MapPin size={20} />
                </div>
                Primary HQ
              </h3>
              
              <div className="space-y-8">
                <div className="flex gap-4">
                   <div className="text-gray-400 shrink-0 mt-1"><MapPin size={18} /></div>
                   <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Physical Address</div>
                      <div className="text-[#1A2B4C] font-bold leading-relaxed" dangerouslySetInnerHTML={{ __html: data.address }} />
                   </div>
                </div>

                <div className="flex gap-4">
                   <div className="text-gray-400 shrink-0 mt-1"><Phone size={18} /></div>
                   <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Support Hotline</div>
                      <a href={`tel:${data.phone.replace(/\s+/g, '')}`} className="text-[#1A2B4C] font-black text-xl hover:text-[#00B4D8] transition-colors">{data.phone}</a>
                   </div>
                </div>

                <div className="flex gap-4">
                   <div className="text-gray-400 shrink-0 mt-1"><Mail size={18} /></div>
                   <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Inquiry Vector</div>
                      <a href={`mailto:${data.email}`} className="text-[#1A2B4C] font-bold hover:text-[#00B4D8] transition-colors">{data.email}</a>
                   </div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl"
            >
              <h3 className="text-xl font-black text-[#1A2B4C] mb-8 flex items-center gap-4">
                <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                  <Clock size={20} />
                </div>
                Business Hours
              </h3>
              <div className="space-y-4">
                {[
                  { label: 'Monday - Friday', value: data.businessHours.weekday },
                  { label: 'Saturday', value: data.businessHours.saturday },
                  { label: 'Sunday', value: data.businessHours.sunday, highlight: true }
                ].map((slot, idx) => (
                  <div key={idx} className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0 last:pb-0">
                    <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">{slot.label}</span>
                    <span className={`font-black text-sm ${slot.highlight ? 'text-red-500' : 'text-[#1A2B4C]'}`}>{slot.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Social Links */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[#1A2B4C] p-8 rounded-[2.5rem] shadow-xl text-white"
            >
               <h4 className="text-sm font-black uppercase tracking-[0.2em] mb-6 text-center text-gray-400">Social Connectivity</h4>
               <div className="flex justify-center gap-4">
                  {[
                    { icon: Facebook, url: data.socialLinks.facebook, color: 'hover:bg-[#1877F2]' },
                    { icon: Linkedin, url: data.socialLinks.linkedin, color: 'hover:bg-[#0A66C2]' },
                    { icon: Youtube, url: data.socialLinks.youtube, color: 'hover:bg-[#FF0000]' },
                    { icon: Instagram, url: data.socialLinks.instagram, color: 'hover:bg-[#E4405F]' }
                  ].map((social, idx) => (
                    social.url && (
                      <a 
                        key={idx} 
                        href={social.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={`w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center transition-all ${social.color} group`}
                      >
                        <social.icon size={20} className="text-gray-400 group-hover:text-white transition-colors" />
                      </a>
                    )
                  ))}
                  {Object.values(data.socialLinks).every(v => !v) && (
                    <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest py-2">No Social Links Configured</div>
                  )}
               </div>
            </motion.div>
          </div>

          {/* Contact Form Main */}
          <div className="lg:col-span-2">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-10 md:p-16 rounded-[4rem] border border-gray-100 shadow-2xl relative overflow-hidden"
            >
              <div className="relative z-10">
                <h2 className="text-3xl font-black text-[#1A2B4C] mb-4 tracking-tight">Transmission Terminal</h2>
                <p className="text-gray-400 font-medium mb-12">Submit your requirements and our certified engineers will respond within 24 hours.</p>
                
                <form className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block px-1">Full Name *</label>
                      <input type="text" required className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-[#00B4D8] transition-all" placeholder="John Doe" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block px-1">Organization</label>
                      <input type="text" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-[#00B4D8] transition-all" placeholder="Enterprise Systems Ltd" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block px-1">Email Protocol *</label>
                      <input type="email" required className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-[#00B4D8] transition-all" placeholder="john@enterprise.com" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block px-1">Phone Link *</label>
                      <input type="tel" required className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-[#00B4D8] transition-all" placeholder="0321 0000000" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block px-1">Inquiry Subject *</label>
                    <select className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-black text-[#1A2B4C] focus:outline-none focus:border-[#00B4D8] transition-all appearance-none cursor-pointer">
                      <option>Project Consultation</option>
                      <option>Hardware Quote</option>
                      <option>Technical Support</option>
                      <option>RMA Submission</option>
                      <option>Partner Program</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block px-1">Transmission Message *</label>
                    <textarea required rows={5} className="w-full bg-gray-50 border border-gray-100 rounded-[2.5rem] px-8 py-6 text-sm font-bold focus:outline-none focus:border-[#00B4D8] transition-all resize-none" placeholder="Describe your technical requirements..."></textarea>
                  </div>

                  <button type="submit" className="w-full bg-[#1A2B4C] text-white py-6 rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-[#00B4D8] transition-all shadow-xl flex items-center justify-center gap-3 group">
                    <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> 
                    Engage Experts
                  </button>
                </form>
              </div>
              
              {/* Decorative Circle */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#00B4D8]/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="rounded-[4rem] overflow-hidden border border-gray-100 h-[400px] md:h-[600px] bg-gray-100 shadow-xl group">
           <iframe 
              src="https://storage.googleapis.com/maps-solutions-olnm31i0i8/locator-plus/10b8/locator-plus.html" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              loading="lazy" 
              title="AV Live Communications Store Locator"
              className="w-full h-full transition-all duration-700"
            ></iframe>
        </div>
      </div>

      {/* Nationwide Presence Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="bg-[#1A2B4C] rounded-[3rem] p-12 text-white relative overflow-hidden flex flex-col md:flex-row items-center gap-12">
           <div className="relative z-10 flex flex-col items-center md:items-start text-center md:text-left">
              <h3 className="text-3xl font-black mb-4 tracking-tight">Nationwide Intelligence Network</h3>
              <p className="text-gray-400 font-medium max-w-xl">We provide onsite support across all major hubs in Pakistan including Karachi, Islamabad, and Rawalpindi.</p>
           </div>
           <div className="relative z-10 grid grid-cols-2 gap-8 md:ml-auto">
              <div>
                 <div className="text-2xl font-black text-[#00B4D8]">Lahore</div>
                 <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">Central Hub</div>
              </div>
              <div>
                 <div className="text-2xl font-black text-white/40">Karachi</div>
                 <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">Onsite Support</div>
              </div>
           </div>
           {/* Glow */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-[#00B4D8]/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
        </div>
      </div>
    </div>
  );
}

