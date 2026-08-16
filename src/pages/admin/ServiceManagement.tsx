import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, Loader2, X, Image as ImageIcon, Copy, Check } from 'lucide-react';
import { RichTextEditor } from '../../components/admin/RichTextEditor';
import { 
  Service, 
  getAllServices, 
  createService, 
  updateService, 
  deleteService, 
  generateSlug 
} from '../../lib/firebase/firestore-helpers';

export function ServiceManagement() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentServiceId, setCurrentServiceId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Omit<Service, 'id'>>({
    title: '',
    name: '',
    slug: '',
    description: '',
    iconUrl: '',
    imageUrl: '',
    isActive: true,
    order: 0,
    category: '',
    type: '',
    serviceType: '',
    heroHeading: '',
    detailedContent: '',
    priceRange: '',
    seoTags: '',
    seoMetaDescription: '',
    imageAltText: ''
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    const data = await getAllServices();
    setServices(data);
    setLoading(false);
  };

  const handleCreate = () => {
    setFormData({
      title: '',
      name: '',
      slug: '',
      description: '',
      iconUrl: '',
      imageUrl: '',
      isActive: true,
      order: services.length,
      category: '',
      type: '',
      serviceType: '',
      heroHeading: '',
      detailedContent: '',
      priceRange: '',
      seoTags: '',
      seoMetaDescription: '',
      imageAltText: ''
    });
    setCurrentServiceId(null);
    setIsEditing(true);
  };

  const handleEdit = (service: Service) => {
    setFormData({
      title: service.title,
      name: service.name || '',
      slug: service.slug,
      description: service.description,
      iconUrl: service.iconUrl,
      imageUrl: service.imageUrl,
      isActive: service.isActive,
      order: service.order,
      category: service.category || '',
      type: service.type || '',
      serviceType: service.serviceType || '',
      heroHeading: service.heroHeading || '',
      detailedContent: service.detailedContent || '',
      priceRange: service.priceRange || '',
      seoTags: service.seoTags || '',
      seoMetaDescription: service.seoMetaDescription || '',
      imageAltText: service.imageAltText || ''
    });
    setCurrentServiceId(service.id!);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this service module?')) {
      await deleteService(id);
      fetchServices();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const dataToSave = {
        ...formData,
        slug: formData.slug || generateSlug(formData.title)
      };

      if (currentServiceId) {
        await updateService(currentServiceId, dataToSave);
      } else {
        await createService(dataToSave);
      }
      setIsEditing(false);
      fetchServices();
    } catch (error) {
      console.error(error);
      alert('Failed to save service module');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-40 text-center">
        <Loader2 className="animate-spin w-10 h-10 text-[#00B4D8] mx-auto mb-4" />
        <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Synchronizing Modules...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-16">
      <div className="flex justify-between items-center mb-12">
        <div>
          <span className="text-[#00B4D8] text-xs font-black uppercase tracking-[0.2em] mb-1 block">Module Management</span>
          <h1 className="text-4xl font-black text-[#1A2B4C] tracking-tight">Services Matrix</h1>
        </div>
        {!isEditing && (
          <button 
            onClick={handleCreate}
            className="bg-[#1A2B4C] text-white px-8 py-4 rounded-full hover:bg-[#00B4D8] transition-all flex items-center font-black text-sm uppercase tracking-widest shadow-xl"
          >
            <Plus size={18} className="mr-2" />
            Initialize Module
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="p-10 border-b border-gray-50 flex justify-between items-center bg-[#1A2B4C] text-white">
            <h2 className="text-2xl font-black">{currentServiceId ? 'Reconfigure Module' : 'Initialize New Module'}</h2>
            <button onClick={() => setIsEditing(false)} className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="p-10 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 ml-1">Service Title</label>
                <input 
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 focus:outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8] font-medium text-[#1A2B4C] transition-all text-sm"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 ml-1">System Slug (Auto-generated if empty)</label>
                <input 
                  type="text"
                  value={formData.slug}
                  onChange={e => setFormData({...formData, slug: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 focus:outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8] font-medium text-[#1A2B4C] transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2 ml-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Service Description</label>
                <button type="button" onClick={(e) => { e.preventDefault(); navigator.clipboard.writeText(formData.description); alert('Copied'); }} className="flex items-center gap-1 text-[9px] font-bold text-[#00B4D8] uppercase tracking-widest hover:underline"><Copy size={12} /> Copy</button>
              </div>
              <RichTextEditor
                value={formData.description}
                onChange={val => setFormData({...formData, description: val})}
                placeholder="Brief overview of the service..."
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2 ml-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Detailed Content</label>
                <button type="button" onClick={(e) => { e.preventDefault(); navigator.clipboard.writeText(formData.detailedContent); alert('Copied'); }} className="flex items-center gap-1 text-[9px] font-bold text-[#00B4D8] uppercase tracking-widest hover:underline"><Copy size={12} /> Copy</button>
              </div>
              <RichTextEditor
                value={formData.detailedContent}
                onChange={val => setFormData({...formData, detailedContent: val})}
                placeholder="Comprehensive details about the service..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 ml-1">Icon URL</label>
                <input 
                  type="url"
                  value={formData.iconUrl}
                  onChange={e => setFormData({...formData, iconUrl: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 focus:outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8] font-medium text-[#1A2B4C] transition-all text-sm"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 ml-1">Feature Image URL</label>
                <input 
                  type="url"
                  value={formData.imageUrl}
                  onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 focus:outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8] font-medium text-[#1A2B4C] transition-all text-sm"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 space-y-6">
              <h3 className="text-sm font-black text-[#1A2B4C] uppercase tracking-widest">SEO & Metadata</h3>
              
              <div>
                <div className="flex justify-between items-center mb-2 ml-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Meta Description</label>
                  <button type="button" onClick={(e) => { e.preventDefault(); navigator.clipboard.writeText(formData.seoMetaDescription); alert('Copied'); }} className="flex items-center gap-1 text-[9px] font-bold text-[#00B4D8] uppercase tracking-widest hover:underline"><Copy size={12} /> Copy</button>
                </div>
                <textarea 
                  rows={3}
                  placeholder="Brief summary for search engines (max 160 chars)..."
                  value={formData.seoMetaDescription}
                  onChange={e => setFormData({...formData, seoMetaDescription: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 focus:outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8] font-medium text-[#1A2B4C] transition-all text-sm resize-none"
                  maxLength={160}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2 ml-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">SEO Hashtags / Keywords</label>
                  <button type="button" onClick={(e) => { e.preventDefault(); navigator.clipboard.writeText(formData.seoTags); alert('Copied'); }} className="flex items-center gap-1 text-[9px] font-bold text-[#00B4D8] uppercase tracking-widest hover:underline"><Copy size={12} /> Copy</button>
                </div>
                <textarea 
                  rows={2}
                  placeholder="e.g. #services #av #integration"
                  value={formData.seoTags}
                  onChange={e => setFormData({...formData, seoTags: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 focus:outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8] font-medium text-[#1A2B4C] transition-all text-sm resize-none"
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2 ml-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Image Alt Text (Primary)</label>
                  <button type="button" onClick={(e) => { e.preventDefault(); navigator.clipboard.writeText(formData.imageAltText); alert('Copied'); }} className="flex items-center gap-1 text-[9px] font-bold text-[#00B4D8] uppercase tracking-widest hover:underline"><Copy size={12} /> Copy</button>
                </div>
                <input 
                  type="text"
                  placeholder="e.g. Professional Audio Visual Installation Team"
                  value={formData.imageAltText}
                  onChange={e => setFormData({...formData, imageAltText: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 focus:outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8] font-medium text-[#1A2B4C] transition-all text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-8">
              <button 
                type="button" 
                onClick={() => setIsEditing(false)}
                className="px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest text-gray-500 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={saving}
                className="bg-[#00B4D8] text-white px-10 py-4 rounded-full hover:bg-[#1A2B4C] transition-all flex items-center font-black text-sm uppercase tracking-widest shadow-xl disabled:opacity-50"
              >
                {saving ? <Loader2 className="animate-spin mr-2" size={18} /> : <Check className="mr-2" size={18} />}
                Deploy Module
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {services.map(service => (
            <div key={service.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-6 group hover:border-[#00B4D8]/30 transition-all">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0 border border-gray-100">
                {service.iconUrl ? (
                  <img loading="lazy" src={service.iconUrl} alt={service.imageAltText || service.title} className="w-8 h-8 object-contain" />
                ) : (
                  <ImageIcon className="text-gray-400" size={24} />
                )}
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-lg font-black text-[#1A2B4C]">{service.title}</h3>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Slug: {service.slug}</p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleEdit(service)}
                  className="w-12 h-12 bg-gray-50 hover:bg-[#00B4D8] hover:text-white text-[#1A2B4C] rounded-2xl flex items-center justify-center transition-all"
                >
                  <Edit3 size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(service.id!)}
                  className="w-12 h-12 bg-gray-50 hover:bg-rose-500 hover:text-white text-[#1A2B4C] rounded-2xl flex items-center justify-center transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
          {services.length === 0 && (
            <div className="text-center py-16 bg-white rounded-[2.5rem] border border-gray-100">
              <p className="text-gray-400 font-bold mb-2">No Service Modules Detected</p>
              <p className="text-[10px] uppercase tracking-widest text-gray-300">Initialize a new module to begin</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
