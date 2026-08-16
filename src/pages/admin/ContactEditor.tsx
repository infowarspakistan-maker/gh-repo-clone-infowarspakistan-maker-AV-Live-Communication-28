import React, { useState, useEffect } from 'react';
import { Save, Loader2, Mail, Phone, MapPin, Clock, Facebook, Linkedin, Youtube, Instagram, Twitter, Info, Globe, Share2 } from 'lucide-react';
import { ContactData, subscribeToContact, updateContactData } from '../../lib/firebase/firestore-helpers';

export function ContactEditor() {
  const [formData, setFormData] = useState<ContactData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToContact((data) => {
      if (data) {
        setFormData(data);
      } else {
        const defaults: ContactData = {
          heroHeading: "Let's Build Your AV Solution Together",
          heroSubheading: 'Whether you need a single IP phone or a complete video conferencing infrastructure, our team of AV experts is ready to help.',
          heroImageUrl: '',
          address: 'Shop, Johar Town Block N, Lahore',
          phone: '0321 425 6263',
          email: 'info@avlive.com.pk',
          mapEmbedUrl: '',
          businessHours: {
            weekday: '9:00 AM – 6:00 PM',
            saturday: '10:00 AM – 4:00 PM',
            sunday: 'Closed',
          },
          socialLinks: {
            facebook: '',
            linkedin: '',
            youtube: '',
            instagram: '',
            twitter: '',
          },
        };
        setFormData(defaults);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    if (!formData) return;
    setIsSaving(true);
    try {
      await updateContactData(formData);
      alert('Contact configuration synchronized!');
    } catch (error) {
      console.error(error);
      alert('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: keyof ContactData, value: any) => {
    setFormData(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleHoursChange = (field: keyof ContactData['businessHours'], value: string) => {
    setFormData(prev => prev ? {
      ...prev,
      businessHours: { ...prev.businessHours, [field]: value }
    } : null);
  };

  const handleSocialChange = (platform: keyof ContactData['socialLinks'], value: string) => {
    setFormData(prev => prev ? {
      ...prev,
      socialLinks: { ...prev.socialLinks, [platform]: value }
    } : null);
  };

  if (loading) {
    return (
      <div className="py-40 text-center">
        <Loader2 className="animate-spin w-10 h-10 text-[#00B4D8] mx-auto mb-4" />
        <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Retrieving Contact Intelligence...</p>
      </div>
    );
  }

  if (!formData) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-16">
      <div className="flex justify-between items-center mb-12">
        <div>
          <span className="text-[#00B4D8] text-xs font-black uppercase tracking-[0.2em] mb-1 block">Support Terminal</span>
          <h1 className="text-4xl font-black text-[#1A2B4C] tracking-tight">Contact Editor</h1>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-[#1A2B4C] text-white px-10 py-4 rounded-full hover:bg-[#00B4D8] transition-all flex items-center font-black text-sm uppercase tracking-widest shadow-xl disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="animate-spin mr-2" size={18} /> : <Save size={18} className="mr-2" />}
          {isSaving ? 'Synchronizing...' : 'Sync Config'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-10">
        {/* Core Contact Info */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-10 border-b border-gray-50 flex items-center gap-4">
             <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100">
                <Phone size={24} />
             </div>
             <div>
                <h3 className="text-xl font-black text-[#1A2B4C]">Contact Core</h3>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Primary support vectors</p>
             </div>
          </div>
          <div className="p-10 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Primary Email</label>
                <div className="relative">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    value={formData.email}
                    onChange={e => handleChange('email', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-14 pr-6 py-4 text-sm font-bold focus:outline-none focus:border-[#00B4D8] transition-all"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Support Hotline</label>
                <div className="relative">
                  <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    value={formData.phone}
                    onChange={e => handleChange('phone', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-14 pr-6 py-4 text-sm font-bold focus:outline-none focus:border-[#00B4D8] transition-all"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Physical HQ Address</label>
              <textarea 
                rows={3}
                value={formData.address}
                onChange={e => handleChange('address', e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-[2rem] px-6 py-4 text-sm font-bold focus:outline-none focus:border-[#00B4D8] transition-all resize-none"
              />
            </div>
          </div>
        </div>

        {/* Business Hours */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-10 border-b border-gray-50 flex items-center gap-4">
             <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 shadow-sm border border-amber-100">
                <Clock size={24} />
             </div>
             <div>
                <h3 className="text-xl font-black text-[#1A2B4C]">Operational Window</h3>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Business uptime</p>
             </div>
          </div>
          <div className="p-10 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Mon - Fri</label>
              <input 
                value={formData.businessHours.weekday}
                onChange={e => handleHoursChange('weekday', e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-[#00B4D8]"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Saturday</label>
              <input 
                value={formData.businessHours.saturday}
                onChange={e => handleHoursChange('saturday', e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-[#00B4D8]"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Sunday</label>
              <input 
                value={formData.businessHours.sunday}
                onChange={e => handleHoursChange('sunday', e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-[#00B4D8]"
              />
            </div>
          </div>
        </div>

        {/* Social Connectivity */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-10 border-b border-gray-50 flex items-center gap-4">
             <div className="w-12 h-12 bg-[#00B4D8] rounded-2xl flex items-center justify-center text-white shadow-lg">
                <Share2 size={24} />
             </div>
             <div>
                <h3 className="text-xl font-black text-[#1A2B4C]">Social Connectivity</h3>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Network profiles</p>
             </div>
          </div>
          <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block flex items-center gap-2">
                <Facebook size={12} className="text-[#1877F2]" /> Facebook URL
              </label>
              <input 
                value={formData.socialLinks.facebook}
                onChange={e => handleSocialChange('facebook', e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-mono focus:outline-none focus:border-[#00B4D8]"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block flex items-center gap-2">
                <Linkedin size={12} className="text-[#0A66C2]" /> LinkedIn URL
              </label>
              <input 
                value={formData.socialLinks.linkedin}
                onChange={e => handleSocialChange('linkedin', e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-mono focus:outline-none focus:border-[#00B4D8]"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block flex items-center gap-2">
                <Youtube size={12} className="text-[#FF0000]" /> YouTube URL
              </label>
              <input 
                value={formData.socialLinks.youtube}
                onChange={e => handleSocialChange('youtube', e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-mono focus:outline-none focus:border-[#00B4D8]"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block flex items-center gap-2">
                <Instagram size={12} className="text-[#E4405F]" /> Instagram URL
              </label>
              <input 
                value={formData.socialLinks.instagram}
                onChange={e => handleSocialChange('instagram', e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-mono focus:outline-none focus:border-[#00B4D8]"
              />
            </div>
          </div>
        </div>

        {/* Security Note */}
        <div className="bg-[#1A2B4C] rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
            <div className="w-20 h-20 bg-white/10 rounded-[2rem] flex items-center justify-center shrink-0">
              <Globe className="text-[#00B4D8]" size={40} />
            </div>
            <div>
              <h3 className="text-2xl font-black mb-3">Global Intelligence</h3>
              <p className="text-gray-400 text-sm leading-relaxed max-w-2xl font-medium">
                The contact intelligence matrix governs all customer support touchpoints. 
                Ensure geographical coordinates for maps and business hours are verified 
                periodically to maintain operational accuracy.
              </p>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#00B4D8]/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        </div>
      </div>
    </div>
  );
}
