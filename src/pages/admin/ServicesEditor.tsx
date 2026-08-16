import React, { useState, useEffect } from 'react';
import { Save, Loader2, Briefcase, Plus, Trash2, Layout, Image as ImageIcon, CheckCircle, Info, Copy } from 'lucide-react';
import { RichTextEditor } from '../../components/admin/RichTextEditor';
import { ServicePageData, Service, subscribeToServicesPage, updateServicesPageData, getAllServices } from '../../lib/firebase/firestore-helpers';

export function ServicesEditor() {
  const [formData, setFormData] = useState<ServicePageData | null>(null);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToServicesPage((data) => {
      if (data) {
        setFormData(data);
      } else {
        const defaults: ServicePageData = {
          heroHeading: 'Beyond Products. We Deliver Experiences.',
          heroSubheading: 'From immersive hybrid events to AI-powered business automation.',
          heroImageUrl: '',
          introText: 'We don\'t just sell equipment; we deliver complete ecosystems.',
          serviceIds: [],
          ctaText: 'Get a Free Consultation',
          ctaLink: '/contact',
        };
        setFormData(defaults);
      }
      setLoading(false);
    });

    const fetchServices = async () => {
      const services = await getAllServices();
      setAllServices(services);
    };
    fetchServices();

    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    if (!formData) return;
    setIsSaving(true);
    try {
      await updateServicesPageData(formData);
      alert('Services architecture synchronized!');
    } catch (error) {
      console.error(error);
      alert('Failed to save configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: keyof ServicePageData, value: any) => {
    setFormData(prev => prev ? { ...prev, [field]: value } : null);
  };

  const toggleService = (id: string) => {
    if (!formData) return;
    const newIds = formData.serviceIds.includes(id)
      ? formData.serviceIds.filter(i => i !== id)
      : [...formData.serviceIds, id];
    handleChange('serviceIds', newIds);
  };

  if (loading) {
    return (
      <div className="py-40 text-center">
        <Loader2 className="animate-spin w-10 h-10 text-[#00B4D8] mx-auto mb-4" />
        <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Retrieving Service Ecosystem...</p>
      </div>
    );
  }

  if (!formData) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-16">
      <div className="flex justify-between items-center mb-12">
        <div>
          <span className="text-[#00B4D8] text-xs font-black uppercase tracking-[0.2em] mb-1 block">Architecture Terminal</span>
          <h1 className="text-4xl font-black text-[#1A2B4C] tracking-tight">Services Editor</h1>
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
        {/* Service Selection */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
           <div className="p-10 border-b border-gray-50 flex items-center gap-4">
             <div className="w-12 h-12 bg-[#1A2B4C] rounded-2xl flex items-center justify-center text-[#00B4D8] shadow-lg">
                <Layout size={24} />
             </div>
             <div>
                <h3 className="text-xl font-black text-[#1A2B4C]">Ecosystem Selection</h3>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Active service modules</p>
             </div>
          </div>
          <div className="p-10">
            {allServices.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-400 font-bold">No services defined in ecosystem.</p>
                <p className="text-[10px] text-gray-300 uppercase tracking-widest mt-1">Add modules via Service Management terminal</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allServices.map((service) => (
                  <button 
                    key={service.id}
                    onClick={() => toggleService(service.id!)}
                    className={`p-6 rounded-3xl border transition-all text-left flex items-center gap-4 ${
                      formData.serviceIds.includes(service.id!) 
                        ? 'border-[#00B4D8] bg-[#00B4D8]/5 shadow-sm' 
                        : 'border-gray-100 bg-gray-50/50 grayscale opacity-60 hover:grayscale-0 hover:opacity-100'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                      formData.serviceIds.includes(service.id!) ? 'bg-[#1A2B4C] text-[#00B4D8]' : 'bg-white text-gray-400'
                    }`}>
                      {service.iconUrl ? <img loading="lazy" src={service.iconUrl} className="w-6 h-6" alt="" /> : <Briefcase size={20} />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-black text-[#1A2B4C]">{service.title}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{service.slug}</p>
                    </div>
                    {formData.serviceIds.includes(service.id!) && <CheckCircle className="text-[#00B4D8]" size={20} />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
           <div className="p-10 border-b border-gray-50 flex items-center gap-4">
             <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-[#00B4D8] shadow-sm border border-blue-100">
                <ImageIcon size={24} />
             </div>
             <div>
                <h3 className="text-xl font-black text-[#1A2B4C]">Page Content</h3>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Hero and introductory metadata</p>
             </div>
          </div>
          <div className="p-10 space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Hero Heading</label>
              <input 
                value={formData.heroHeading}
                onChange={e => handleChange('heroHeading', e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-[#00B4D8] transition-all"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Hero Subheading</label>
              <RichTextEditor value={formData.heroSubheading} onChange={(val) => handleChange('heroSubheading', val)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">CTA Button Text</label>
                <input 
                  value={formData.ctaText}
                  onChange={e => handleChange('ctaText', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-[#00B4D8]"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">CTA Button Link</label>
                <input 
                  value={formData.ctaLink}
                  onChange={e => handleChange('ctaLink', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-[#00B4D8]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Security Banner */}
        <div className="bg-[#1A2B4C] rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
            <div className="w-20 h-20 bg-white/10 rounded-[2rem] flex items-center justify-center shrink-0">
              <Info className="text-[#00B4D8]" size={40} />
            </div>
            <div>
              <h3 className="text-2xl font-black mb-3">Service Architecture</h3>
              <p className="text-gray-400 text-sm leading-relaxed max-w-2xl font-medium">
                The services landing terminal allows you to architect the active service ecosystem. 
                Ensure that individual service modules are updated in the primary database 
                before including them in the active landing page selection.
              </p>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#00B4D8]/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        </div>
      </div>
    </div>
  );
}
