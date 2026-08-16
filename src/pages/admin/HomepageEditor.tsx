import { useState, useEffect, useCallback, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Loader2, 
  Eye, 
  Clock, 
  AlertCircle,
  TrendingUp,
  X,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Truck,
  Image as ImageIcon,
  ShieldAlert,
  Layout,
  Plus,
  Trash2,
  Edit2,
  GripVertical,
  Save,
  Star,
  Users,
  Briefcase,
  History,
  Target,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import {
  HomepageData,
  HeroSlide,
  Brand,
  Testimonial,
  getHomepageData,
  subscribeToHomepage,
  updateHomepage,
  addHeroSlide,
  updateHeroSlide,
  removeHeroSlide,
  reorderHeroSlides,
  addBrand,
  updateBrand,
  removeBrand,
  addTestimonial,
  updateTestimonial,
  removeTestimonial,
  updateStats,
  updatePromoBanner,
} from '../../lib/firebase/firestore-helpers';

// ============================================
// SUB-COMPONENT: Hero Slider Manager
// ============================================

interface HeroSliderManagerProps {
  slides: HeroSlide[];
  onUpdate: () => void;
}

function HeroSliderManager({ slides, onUpdate }: HeroSliderManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [formData, setFormData] = useState<Partial<HeroSlide>>({
    title: '',
    subtitle: '',
    ctaText: '',
    ctaLink: '',
    imageUrl: '',
    mediaType: 'image',
    isActive: true,
    order: slides.length + 1,
    textAlignment: 'center',
    overlayOpacity: 30,
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editingSlide) {
        await updateHeroSlide(editingSlide.id!, formData);
      } else {
        await addHeroSlide(formData as Omit<HeroSlide, 'id'>);
      }
      setShowForm(false);
      setEditingSlide(null);
      setFormData({
        title: '',
        subtitle: '',
        ctaText: '',
        ctaLink: '',
        imageUrl: '',
        mediaType: 'image',
        isActive: true,
        order: slides.length + 1,
        textAlignment: 'center',
        overlayOpacity: 30,
      });
      onUpdate();
    } catch (error) {
      console.error(error);
      alert('Failed to save slide.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this slide?')) return;
    try {
      await removeHeroSlide(id);
      onUpdate();
    } catch (error) {
      console.error(error);
      alert('Failed to delete slide.');
    }
  };

  const handleEdit = (slide: HeroSlide) => {
    setEditingSlide(slide);
    setFormData(slide);
    setShowForm(true);
  };

  const sortedSlides = [...slides].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-black text-[#1A2B4C] uppercase tracking-tight">Hero Slides</h3>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{slides.length} nodes active in sequence</p>
        </div>
        <button
          onClick={() => {
            setEditingSlide(null);
            setFormData({
              title: '',
              subtitle: '',
              ctaText: '',
              ctaLink: '',
              imageUrl: '',
              mediaType: 'image',
              isActive: true,
              order: slides.length + 1,
              textAlignment: 'center',
              overlayOpacity: 30,
            });
            setShowForm(true);
          }}
          className="bg-[#1A2B4C] text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#00B4D8] transition-all flex items-center gap-2"
        >
          <Plus size={14} /> New Slide
        </button>
      </div>

      <div className="space-y-4">
        {sortedSlides.map((slide, index) => (
          <div
            key={slide.id || `slide-${index}`}
            className="flex items-center gap-6 p-6 bg-white rounded-[2rem] border border-gray-100 hover:shadow-xl hover:border-[#00B4D8]/20 transition-all group"
          >
            <div className="text-gray-200 group-hover:text-[#00B4D8] transition-colors">
              <GripVertical size={20} />
            </div>

            <div className="w-40 h-24 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
              {slide.imageUrl ? (
                <img loading="lazy" src={slide.imageUrl} alt={slide.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <ImageIcon size={24} />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h4 className="font-black text-[#1A2B4C] text-lg truncate">{slide.title || 'Untitled Node'}</h4>
                <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${slide.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                  {slide.isActive ? 'Online' : 'Offline'}
                </span>
              </div>
              <p className="text-xs font-bold text-gray-400 truncate">{slide.subtitle || 'No transmission data'}</p>
              <div className="mt-2 flex gap-4 text-[9px] font-black text-[#00B4D8] uppercase tracking-widest">
                 <span>Order: {slide.order}</span>
                 <span>Alignment: {slide.textAlignment}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => handleEdit(slide)} className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 hover:text-[#00B4D8] hover:bg-[#00B4D8]/5 transition-all flex items-center justify-center border border-gray-100">
                <Edit2 size={16} />
              </button>
              <button onClick={() => handleDelete(slide.id!)} className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center border border-gray-100">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 bg-[#1A2B4C]/80 backdrop-blur-md flex items-center justify-center z-[110] p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl border border-white/20 flex flex-col max-h-[90vh]"
            >
              <div className="p-10 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <h2 className="text-2xl font-black text-[#1A2B4C] tracking-tight">{editingSlide ? 'Modify Slide' : 'Initialize Slide'}</h2>
                <button onClick={() => setShowForm(false)} className="w-10 h-10 rounded-xl bg-white text-gray-400 hover:text-red-500 transition-all flex items-center justify-center border border-gray-100">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-10 overflow-y-auto space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Primary Title</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-[#1A2B4C] focus:border-[#00B4D8] outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Secondary Header</label>
                      <input
                        type="text"
                        value={formData.subtitle}
                        onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-[#1A2B4C] focus:border-[#00B4D8] outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">CTA Label</label>
                      <input
                        type="text"
                        value={formData.ctaText}
                        onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-[#1A2B4C] focus:border-[#00B4D8] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">CTA Endpoint (URI)</label>
                      <input
                        type="text"
                        value={formData.ctaLink}
                        onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-[#1A2B4C] focus:border-[#00B4D8] outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Asset URL (High-Res)</label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-[#1A2B4C] focus:border-[#00B4D8] outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Media</label>
                    <select
                      value={formData.mediaType}
                      onChange={(e) => setFormData({ ...formData, mediaType: e.target.value as any })}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-[#1A2B4C] outline-none"
                    >
                      <option value="image">IMAGE</option>
                      <option value="video">VIDEO</option>
                      <option value="youtube">YOUTUBE</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Alignment</label>
                    <select
                      value={formData.textAlignment}
                      onChange={(e) => setFormData({ ...formData, textAlignment: e.target.value as any })}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-[#1A2B4C] outline-none"
                    >
                      <option value="left">LEFT</option>
                      <option value="center">CENTER</option>
                      <option value="right">RIGHT</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Opacity</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.overlayOpacity}
                      onChange={(e) => setFormData({ ...formData, overlayOpacity: Number(e.target.value) })}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-[#1A2B4C] outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-5 h-5 rounded-lg border-gray-200 text-[#00B4D8] focus:ring-[#00B4D8]"
                  />
                  <label htmlFor="isActive" className="text-sm font-bold text-[#1A2B4C]">Broadcast this node to live environment</label>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#1A2B4C] text-white font-black py-5 rounded-2xl hover:bg-[#00B4D8] transition-all uppercase tracking-[0.2em] text-[10px]"
                >
                  {editingSlide ? 'Sync Updates' : 'Initialize Protocol'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// SUB-COMPONENT: Brand Manager
// ============================================

interface BrandManagerProps {
  brands: Brand[];
  onUpdate: () => void;
}

function BrandManager({ brands, onUpdate }: BrandManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    logoUrl: '',
    website: '',
    order: brands.length + 1,
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editingBrand) {
        await updateBrand(editingBrand.id!, formData);
      } else {
        await addBrand(formData);
      }
      setShowForm(false);
      setEditingBrand(null);
      setFormData({ name: '', logoUrl: '', website: '', order: brands.length + 1 });
      onUpdate();
    } catch (error) {
      console.error(error);
      alert('Failed to save brand.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this brand partner?')) return;
    try {
      await removeBrand(id);
      onUpdate();
    } catch (error) {
      console.error(error);
      alert('Failed to delete brand.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-black text-[#1A2B4C] uppercase tracking-tight">Partner Ecosystem</h3>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{brands.length} brand logos active in relay</p>
        </div>
        <button
          onClick={() => {
            setEditingBrand(null);
            setFormData({ name: '', logoUrl: '', website: '', order: brands.length + 1 });
            setShowForm(true);
          }}
          className="bg-[#1A2B4C] text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#00B4D8] transition-all flex items-center gap-2"
        >
          <Plus size={14} /> Add Partner
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {brands.sort((a,b) => a.order - b.order).map((brand) => (
          <div key={brand.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 flex flex-col items-center justify-center relative group hover:shadow-xl transition-all">
            <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
               <button onClick={() => { setEditingBrand(brand); setFormData(brand); setShowForm(true); }} className="p-2 text-gray-300 hover:text-[#00B4D8]">
                 <Edit2 size={14} />
               </button>
               <button onClick={() => handleDelete(brand.id!)} className="p-2 text-gray-300 hover:text-red-500">
                 <Trash2 size={14} />
               </button>
            </div>
            <div className="h-16 w-full flex items-center justify-center mb-4">
              {brand.logoUrl ? (
                <img loading="lazy" src={brand.logoUrl} alt={brand.name} className="max-h-full max-w-full object-contain grayscale group-hover:grayscale-0 transition-all" />
              ) : (
                <ImageIcon className="text-gray-200" size={32} />
              )}
            </div>
            <div className="text-[10px] font-black text-[#1A2B4C] uppercase tracking-[0.2em]">{brand.name}</div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 bg-[#1A2B4C]/80 backdrop-blur-md flex items-center justify-center z-[110] p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white rounded-[3rem] w-full max-w-md p-10 space-y-6">
              <h3 className="text-2xl font-black text-[#1A2B4C] uppercase tracking-tight">{editingBrand ? 'Edit Partner' : 'New Partner'}</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Partner Name</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-[#1A2B4C] outline-none" required />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Logo Endpoint (URL)</label>
                  <input type="url" value={formData.logoUrl} onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-[#1A2B4C] outline-none" required />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Order Weight</label>
                  <input type="number" value={formData.order} onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-[#1A2B4C] outline-none" />
                </div>
              </div>
              <div className="flex gap-4">
                 <button onClick={() => setShowForm(false)} className="flex-1 bg-gray-50 text-gray-400 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest">Abort</button>
                 <button onClick={handleSubmit} className="flex-1 bg-[#1A2B4C] text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#00B4D8]">Execute</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// SUB-COMPONENT: Testimonial Manager
// ============================================

interface TestimonialManagerProps {
  testimonials: Testimonial[];
  onUpdate: () => void;
}

function TestimonialManager({ testimonials, onUpdate }: TestimonialManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    text: '',
    rating: 5,
    avatarUrl: '',
    order: testimonials.length + 1,
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editingTestimonial) {
        await updateTestimonial(editingTestimonial.id!, formData);
      } else {
        await addTestimonial(formData);
      }
      setShowForm(false);
      onUpdate();
    } catch (error) {
      console.error(error);
      alert('Failed to save testimonial.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-black text-[#1A2B4C] uppercase tracking-tight">Social Proof</h3>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{testimonials.length} reviews in rotation</p>
        </div>
        <button
          onClick={() => {
            setEditingTestimonial(null);
            setFormData({ name: '', designation: '', text: '', rating: 5, avatarUrl: '', order: testimonials.length + 1 });
            setShowForm(true);
          }}
          className="bg-[#1A2B4C] text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#00B4D8] transition-all flex items-center gap-2"
        >
          <Plus size={14} /> New Review
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {testimonials.map((t) => (
          <div key={t.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 space-y-4 relative group">
             <div className="absolute top-6 right-8 flex gap-2">
                <button onClick={() => { setEditingTestimonial(t); setFormData(t); setShowForm(true); }} className="text-gray-300 hover:text-[#00B4D8]"><Edit2 size={16} /></button>
                <button onClick={async () => { if(confirm('Delete?')) { await removeTestimonial(t.id!); onUpdate(); } }} className="text-gray-300 hover:text-red-500"><Trash2 size={16} /></button>
             </div>
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden border border-gray-50 flex-shrink-0">
                  {t.avatarUrl ? <img loading="lazy" src={t.avatarUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><Users size={20} /></div>}
                </div>
                <div>
                   <div className="text-sm font-black text-[#1A2B4C]">{t.name}</div>
                   <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.designation}</div>
                </div>
             </div>
             <div className="flex text-amber-400">
                {[...Array(t.rating)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
             </div>
             <p className="text-sm font-bold text-[#1A2B4C] leading-relaxed italic">"{t.text}"</p>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 bg-[#1A2B4C]/80 backdrop-blur-md flex items-center justify-center z-[110] p-4">
             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="bg-white rounded-[3rem] w-full max-w-lg p-10 space-y-6">
               <h3 className="text-2xl font-black text-[#1A2B4C] uppercase tracking-tight">{editingTestimonial ? 'Update Review' : 'New Review'}</h3>
               <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input placeholder="Name" type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-[#1A2B4C] outline-none" required />
                    <input placeholder="Designation" type="text" value={formData.designation} onChange={(e) => setFormData({ ...formData, designation: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-[#1A2B4C] outline-none" />
                  </div>
                  <textarea placeholder="The Review..." rows={4} value={formData.text} onChange={(e) => setFormData({ ...formData, text: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-[#1A2B4C] outline-none" required />
                  <div className="grid grid-cols-2 gap-4">
                    <select value={formData.rating} onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-[#1A2B4C] outline-none">
                      {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} STARS</option>)}
                    </select>
                    <input placeholder="Avatar URL" type="url" value={formData.avatarUrl} onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-[#1A2B4C] outline-none" />
                  </div>
               </div>
               <div className="flex gap-4">
                 <button onClick={() => setShowForm(false)} className="flex-1 bg-gray-50 text-gray-400 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest">Abort</button>
                 <button onClick={handleSubmit} className="flex-1 bg-[#1A2B4C] text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest">Sync</button>
               </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// MAIN PAGE COMPONENT
// ============================================

export function HomepageEditor() {
  const [data, setData] = useState<HomepageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'slides' | 'brands' | 'testimonials' | 'stats' | 'banner'>('slides');

  useEffect(() => {
    const unsubscribe = subscribeToHomepage((homepageData) => {
      setData(homepageData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleStatsUpdate = async (stats: HomepageData['stats']) => {
    try {
      await updateStats(stats);
      alert('Stats synchronized successfully');
    } catch (error) {
      console.error(error);
      alert('Stats sync failed');
    }
  };

  const handleBannerUpdate = async (banner: HomepageData['promoBanner']) => {
    try {
      await updatePromoBanner(banner);
      alert('Banner synchronized successfully');
    } catch (error) {
      console.error(error);
      alert('Banner sync failed');
    }
  };

  if (loading) return <div className="py-40 text-center"><Loader2 className="animate-spin w-10 h-10 text-[#00B4D8] mx-auto" /></div>;

  if (!data) return (
    <div className="py-40 text-center">
       <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-4" />
       <p className="text-gray-300 font-black uppercase tracking-widest text-[10px]">No homepage configuration detected</p>
       <button onClick={() => updateHomepage({
         heroSlides: [],
         brands: [],
         testimonials: [],
         stats: { yearsExperience: 10, happyClients: 1000, projectsCompleted: 500 },
         promoBanner: { headline: 'Ready to elevate?', subheadline: 'Contact us today', ctaText: 'Get Quote', ctaLink: '/contact', backgroundImageUrl: '', isActive: true }
       })} className="mt-6 bg-[#1A2B4C] text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest">Initialize Main Node</button>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <span className="text-[#00B4D8] text-xs font-black uppercase tracking-[0.3em] mb-2 block">Visual Interface Engine</span>
          <h1 className="text-4xl font-black text-[#1A2B4C] tracking-tight">Homepage Editor</h1>
        </div>
        <Link 
          to="/admin/media-guide" 
          className="bg-white hover:bg-gray-50 text-[#1A2B4C] px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-gray-100 shadow-sm flex items-center gap-2"
          id="homepage-editor-guide-button"
        >
          <FileText size={14} className="text-[#00B4D8]" />
          Media URL Guide
        </Link>
      </div>

      <div className="flex gap-4 p-2 bg-gray-50 rounded-3xl w-fit">
        {[
          { id: 'slides', icon: <ImageIcon size={14} />, label: 'Hero Slides' },
          { id: 'brands', icon: <Target size={14} />, label: 'Partners' },
          { id: 'testimonials', icon: <MessageSquare size={14} />, label: 'Reviews' },
          { id: 'stats', icon: <History size={14} />, label: 'Metrics' },
          { id: 'banner', icon: <Layout size={14} />, label: 'Promo Banner' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
              activeTab === tab.id 
              ? 'bg-[#1A2B4C] text-white shadow-lg' 
              : 'text-gray-400 hover:text-[#1A2B4C]'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white/50 rounded-[3rem] p-10 min-h-[600px] border border-gray-50">
        <AnimatePresence mode="wait">
           <motion.div
             key={activeTab}
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -10 }}
             transition={{ duration: 0.2 }}
           >
             {activeTab === 'slides' && <HeroSliderManager slides={data.heroSlides || []} onUpdate={() => {}} />}
             {activeTab === 'brands' && <BrandManager brands={data.brands || []} onUpdate={() => {}} />}
             {activeTab === 'testimonials' && <TestimonialManager testimonials={data.testimonials || []} onUpdate={() => {}} />}
             
             {activeTab === 'stats' && (
                <div className="space-y-8">
                   <div>
                     <h3 className="text-xl font-black text-[#1A2B4C] uppercase tracking-tight">Enterprise Metrics</h3>
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Global success indicators for homepage relay</p>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {[
                        { key: 'yearsExperience', label: 'Years Experience', icon: <History size={20} className="text-[#00B4D8]" /> },
                        { key: 'happyClients', label: 'Happy Clients', icon: <Users size={20} className="text-emerald-500" /> },
                        { key: 'projectsCompleted', label: 'Projects Completed', icon: <Briefcase size={20} className="text-purple-500" /> },
                      ].map(stat => (
                        <div key={stat.key} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 space-y-4">
                           <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center">{stat.icon}</div>
                           <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">{stat.label}</label>
                           <input 
                             type="number" 
                             value={(data.stats as any)[stat.key]} 
                             onChange={(e) => handleStatsUpdate({ ...data.stats, [stat.key]: Number(e.target.value) })}
                             className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-2xl font-black text-[#1A2B4C] outline-none focus:border-[#00B4D8]" 
                           />
                        </div>
                      ))}
                   </div>
                </div>
             )}

             {activeTab === 'banner' && (
                <div className="space-y-8">
                   <div>
                     <h3 className="text-xl font-black text-[#1A2B4C] uppercase tracking-tight">Conversion Anchor</h3>
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">High-impact promo banner configuration</p>
                   </div>
                   <div className="bg-white p-10 rounded-[3rem] border border-gray-100 space-y-8 max-w-2xl">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Headline</label>
                          <input type="text" value={data.promoBanner.headline} onChange={(e) => handleBannerUpdate({ ...data.promoBanner, headline: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-[#1A2B4C] outline-none focus:border-[#00B4D8]" />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Subheadline</label>
                          <input type="text" value={data.promoBanner.subheadline} onChange={(e) => handleBannerUpdate({ ...data.promoBanner, subheadline: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-[#1A2B4C] outline-none focus:border-[#00B4D8]" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">CTA Label</label>
                          <input type="text" value={data.promoBanner.ctaText} onChange={(e) => handleBannerUpdate({ ...data.promoBanner, ctaText: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-[#1A2B4C] outline-none focus:border-[#00B4D8]" />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">CTA Link</label>
                          <input type="text" value={data.promoBanner.ctaLink} onChange={(e) => handleBannerUpdate({ ...data.promoBanner, ctaLink: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-[#1A2B4C] outline-none focus:border-[#00B4D8]" />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Background Asset (URL)</label>
                        <input type="url" value={data.promoBanner.backgroundImageUrl} onChange={(e) => handleBannerUpdate({ ...data.promoBanner, backgroundImageUrl: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-[#1A2B4C] outline-none focus:border-[#00B4D8]" />
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                        <input type="checkbox" id="bannerActive" checked={data.promoBanner.isActive} onChange={(e) => handleBannerUpdate({ ...data.promoBanner, isActive: e.target.checked })} className="w-5 h-5 rounded-lg border-gray-200 text-[#00B4D8]" />
                        <label htmlFor="bannerActive" className="text-sm font-bold text-[#1A2B4C]">Activate this conversion node</label>
                      </div>
                   </div>
                </div>
             )}
           </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
