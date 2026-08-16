import { Settings, Save, Globe, Phone, Mail, MapPin, Loader2, Facebook, Linkedin, Youtube, Instagram, Twitter, ShieldCheck, Share2, Search as SearchIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { 
  GeneralSettings, 
  subscribeToGeneralSettings, 
  updateGeneralSettings 
} from '../../lib/firebase/firestore-helpers';

export function SettingsPage() {
  const [formData, setFormData] = useState<GeneralSettings>({
    siteName: '',
    tagline: '',
    logoUrl: '',
    faviconUrl: '',
    contactEmail: '',
    phone: '',
    address: '',
    taxRate: 0.18,
    socialLinks: {
      facebook: '',
      linkedin: '',
      youtube: '',
      instagram: '',
      twitter: '',
    },
    seo: {
      title: '',
      description: '',
      keywords: '',
      ogImage: '',
    },
  });
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToGeneralSettings((data) => {
      if (data) {
        setFormData(data);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateGeneralSettings(formData);
      alert('Global configuration synchronized!');
    } catch (error) {
      console.error(error);
      alert('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const updateSocial = (platform: keyof GeneralSettings['socialLinks'], value: string) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [platform]: value }
    }));
  };

  const updateSEO = (field: keyof GeneralSettings['seo'], value: string) => {
    setFormData(prev => ({
      ...prev,
      seo: { ...prev.seo, [field]: value }
    }));
  };

  if (loading) {
    return (
      <div className="py-40 text-center">
         <Loader2 className="animate-spin w-10 h-10 text-[#00B4D8] mx-auto mb-4" />
         <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Retrieving Core Configuration...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      <div className="flex justify-between items-center mb-12">
        <div>
          <span className="text-[#00B4D8] text-xs font-black uppercase tracking-[0.2em] mb-1 block">Global Terminal</span>
          <h1 className="text-4xl font-black text-[#1A2B4C] tracking-tight">System Settings</h1>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-[#1A2B4C] text-white px-10 py-4 rounded-full hover:bg-[#00B4D8] transition-all flex items-center font-black text-sm uppercase tracking-widest shadow-xl disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="animate-spin mr-2" size={18} /> : <Save size={18} className="mr-2" />}
          {isSaving ? 'Synchronizing...' : 'Sync Settings'}
        </button>
      </div>
      
      <div className="grid grid-cols-1 gap-10">
         {/* Site Branding */}
         <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-10 border-b border-gray-50 flex items-center gap-4">
               <div className="w-12 h-12 bg-[#1A2B4C] rounded-2xl flex items-center justify-center text-[#00B4D8] shadow-lg">
                  <Globe size={24} />
               </div>
               <div>
                  <h3 className="text-xl font-black text-[#1A2B4C]">Identity & Branding</h3>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Public profile and assets</p>
               </div>
            </div>
            <div className="p-10 space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Site Name</label>
                     <input 
                       value={formData.siteName}
                       onChange={e => setFormData({...formData, siteName: e.target.value})}
                       className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-[#00B4D8] transition-all" 
                     />
                  </div>
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Tagline / Motto</label>
                     <input 
                       value={formData.tagline}
                       onChange={e => setFormData({...formData, tagline: e.target.value})}
                       className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-[#00B4D8] transition-all" 
                     />
                  </div>
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Default GST Rate (%)</label>
                     <input 
                       type="number"
                       step="0.01"
                       value={formData.taxRate * 100}
                       onChange={e => setFormData({...formData, taxRate: parseFloat(e.target.value) / 100})}
                       className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-[#00B4D8] transition-all" 
                     />
                  </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Logo URL</label>
                     <input 
                       value={formData.logoUrl}
                       onChange={e => setFormData({...formData, logoUrl: e.target.value})}
                       className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-mono focus:outline-none focus:border-[#00B4D8] transition-all" 
                     />
                  </div>
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Favicon URL</label>
                     <input 
                       value={formData.faviconUrl}
                       onChange={e => setFormData({...formData, faviconUrl: e.target.value})}
                       className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-mono focus:outline-none focus:border-[#00B4D8] transition-all" 
                     />
                  </div>
               </div>
            </div>
         </div>

         {/* Contact Intel */}
         <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-10 border-b border-gray-50 flex items-center gap-4">
               <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100">
                  <MapPin size={24} />
               </div>
               <div>
                  <h3 className="text-xl font-black text-[#1A2B4C]">Contact Intelligence</h3>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Global support and location</p>
               </div>
            </div>
            <div className="p-10 space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Primary Email</label>
                     <div className="relative">
                        <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                          value={formData.contactEmail}
                          onChange={e => setFormData({...formData, contactEmail: e.target.value})}
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
                          onChange={e => setFormData({...formData, phone: e.target.value})}
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-14 pr-6 py-4 text-sm font-bold focus:outline-none focus:border-[#00B4D8] transition-all" 
                        />
                     </div>
                  </div>
               </div>
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Physical Address</label>
                  <textarea 
                    rows={3}
                    value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 rounded-[2rem] px-6 py-4 text-sm font-bold focus:outline-none focus:border-[#00B4D8] transition-all resize-none" 
                  />
               </div>
            </div>
         </div>

         {/* SEO Engine */}
         <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-10 border-b border-gray-50 flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#00B4D8] rounded-2xl flex items-center justify-center text-white shadow-lg">
                     <SearchIcon size={24} />
                  </div>
                  <div>
                     <h3 className="text-xl font-black text-[#1A2B4C]">SEO Architecture</h3>
                     <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Meta tags and indexing</p>
                  </div>
               </div>
               <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                  <ShieldCheck size={14} /> Optimized
               </div>
            </div>
            <div className="p-10 space-y-8">
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Global Page Title</label>
                  <input 
                    value={formData.seo.title}
                    onChange={e => updateSEO('title', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-[#00B4D8] transition-all" 
                  />
               </div>
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Meta Description</label>
                  <textarea 
                    rows={3}
                    value={formData.seo.description}
                    onChange={e => updateSEO('description', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-[2rem] px-6 py-4 text-sm font-bold focus:outline-none focus:border-[#00B4D8] transition-all resize-none" 
                  />
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Keywords (Comma Separated)</label>
                     <input 
                       value={formData.seo.keywords}
                       onChange={e => updateSEO('keywords', e.target.value)}
                       className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-[#00B4D8] transition-all" 
                     />
                  </div>
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Social Share (OG) Image</label>
                     <input 
                       value={formData.seo.ogImage}
                       onChange={e => updateSEO('ogImage', e.target.value)}
                       className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-mono focus:outline-none focus:border-[#00B4D8] transition-all" 
                     />
                  </div>
               </div>
            </div>
         </div>

         {/* Social Links */}
         <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-10 border-b border-gray-50 flex items-center gap-4">
               <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 shadow-sm border border-amber-100">
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
                    onChange={e => updateSocial('facebook', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-mono focus:outline-none focus:border-[#00B4D8] transition-all" 
                  />
               </div>
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block flex items-center gap-2">
                     <Linkedin size={12} className="text-[#0A66C2]" /> LinkedIn URL
                  </label>
                  <input 
                    value={formData.socialLinks.linkedin}
                    onChange={e => updateSocial('linkedin', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-mono focus:outline-none focus:border-[#00B4D8] transition-all" 
                  />
               </div>
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block flex items-center gap-2">
                     <Youtube size={12} className="text-[#FF0000]" /> YouTube URL
                  </label>
                  <input 
                    value={formData.socialLinks.youtube}
                    onChange={e => updateSocial('youtube', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-mono focus:outline-none focus:border-[#00B4D8] transition-all" 
                  />
               </div>
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block flex items-center gap-2">
                     <Instagram size={12} className="text-[#E4405F]" /> Instagram URL
                  </label>
                  <input 
                    value={formData.socialLinks.instagram}
                    onChange={e => updateSocial('instagram', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-mono focus:outline-none focus:border-[#00B4D8] transition-all" 
                  />
               </div>
               <div className="space-y-3 md:col-span-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block flex items-center gap-2">
                     <Twitter size={12} className="text-[#1DA1F2]" /> Twitter / X URL
                  </label>
                  <input 
                    value={formData.socialLinks.twitter}
                    onChange={e => updateSocial('twitter', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-mono focus:outline-none focus:border-[#00B4D8] transition-all" 
                  />
               </div>
            </div>
         </div>

         {/* Security Banner */}
         <div className="bg-[#1A2B4C] rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
               <div className="w-20 h-20 bg-white/10 rounded-[2rem] flex items-center justify-center shrink-0">
                  <Settings className="text-[#00B4D8]" size={40} />
               </div>
               <div>
                  <h3 className="text-2xl font-black mb-3">System Integrity</h3>
                  <p className="text-gray-400 text-sm leading-relaxed max-w-2xl font-medium">
                     The global configuration controls public metadata, branding assets, and SEO indexing rules. 
                     Sensitive environment variables like API keys for Stripe or Google Gemini are managed via the 
                     encrypted system vault and cannot be modified from this terminal.
                  </p>
               </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#00B4D8]/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
         </div>
      </div>
    </div>
  );
}

