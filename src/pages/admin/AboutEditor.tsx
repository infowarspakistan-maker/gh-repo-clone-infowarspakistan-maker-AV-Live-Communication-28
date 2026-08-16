import React, { useState, useEffect } from 'react';
import { Save, Loader2, Info, Image as ImageIcon, Plus, Trash2, Award, CheckCircle, Target, History, Users } from 'lucide-react';
import { RichTextEditor } from '../../components/admin/RichTextEditor';
import { AboutData, subscribeToAbout, updateAboutData } from '../../lib/firebase/firestore-helpers';

export function AboutEditor() {
  const [formData, setFormData] = useState<AboutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToAbout((data) => {
      if (data) {
        setFormData(data);
      } else {
        const defaults: AboutData = {
          heroHeading: 'Unifying People and Ideas Since 2010',
          heroSubheading: 'We are an experienced leader in the audio-visual collaboration field.',
          heroImageUrl: '',
          mission: 'To provide integrated multimedia tools that drive business innovation and profitability.',
          vision: 'To lead Pakistan\'s digital transformation by making enterprise-grade communication tools accessible, secure, and simple to use.',
          history: 'Founded in 2010, AV Live Communications began with a single vision...',
          teamDescription: 'Our team comprises Polycom-certified engineers, Cisco-accredited technicians...',
          teamImages: [],
          values: ['Innovation', 'Integrity', 'Customer First', 'Excellence'],
          stats: {
            yearsExperience: 10,
            happyClients: 500,
            projectsCompleted: 1000,
            teamMembers: 25,
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
      await updateAboutData(formData);
      alert('About page synchronized successfully!');
    } catch (error) {
      console.error(error);
      alert('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: keyof AboutData, value: any) => {
    setFormData(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleStatsChange = (field: keyof AboutData['stats'], value: number) => {
    setFormData(prev => prev ? {
      ...prev,
      stats: { ...prev.stats, [field]: value }
    } : null);
  };

  if (loading) {
    return (
      <div className="py-40 text-center">
        <Loader2 className="animate-spin w-10 h-10 text-[#00B4D8] mx-auto mb-4" />
        <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Retrieving About Configuration...</p>
      </div>
    );
  }

  if (!formData) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-16">
      <div className="flex justify-between items-center mb-12">
        <div>
          <span className="text-[#00B4D8] text-xs font-black uppercase tracking-[0.2em] mb-1 block">Content Terminal</span>
          <h1 className="text-4xl font-black text-[#1A2B4C] tracking-tight">About Editor</h1>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-[#1A2B4C] text-white px-10 py-4 rounded-full hover:bg-[#00B4D8] transition-all flex items-center font-black text-sm uppercase tracking-widest shadow-xl disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="animate-spin mr-2" size={18} /> : <Save size={18} className="mr-2" />}
          {isSaving ? 'Synchronizing...' : 'Sync Content'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-10">
        {/* Hero Section */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-10 border-b border-gray-50 flex items-center gap-4">
             <div className="w-12 h-12 bg-[#1A2B4C] rounded-2xl flex items-center justify-center text-[#00B4D8] shadow-lg">
                <ImageIcon size={24} />
             </div>
             <div>
                <h3 className="text-xl font-black text-[#1A2B4C]">Hero Presence</h3>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Initial visual impact</p>
             </div>
          </div>
          <div className="p-10 space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Main Heading</label>
              <input 
                value={formData.heroHeading}
                onChange={e => handleChange('heroHeading', e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-[#00B4D8] transition-all"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Subheading</label>
              <RichTextEditor value={formData.heroSubheading} onChange={(val) => handleChange('heroSubheading', val)} />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Hero Background Image (URL)</label>
              <input 
                value={formData.heroImageUrl}
                onChange={e => handleChange('heroImageUrl', e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-mono focus:outline-none focus:border-[#00B4D8] transition-all"
              />
            </div>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-10 border-b border-gray-50 flex items-center gap-4">
             <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100">
                <Target size={24} />
             </div>
             <div>
                <h3 className="text-xl font-black text-[#1A2B4C]">Mission & Vision</h3>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Core objectives</p>
             </div>
          </div>
          <div className="p-10 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Our Mission</label>
                <RichTextEditor value={formData.mission} onChange={(val) => handleChange('mission', val)} />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Our Vision</label>
                <RichTextEditor value={formData.vision} onChange={(val) => handleChange('vision', val)} />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Our History / Story</label>
              <RichTextEditor value={formData.history} onChange={(val) => handleChange('history', val)} />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-10 border-b border-gray-50 flex items-center gap-4">
             <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 shadow-sm border border-amber-100">
                <CheckCircle size={24} />
             </div>
             <div>
                <h3 className="text-xl font-black text-[#1A2B4C]">Success Metrics</h3>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Quantitative impact</p>
             </div>
          </div>
          <div className="p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { key: 'yearsExperience', label: 'Years Experience', icon: <History size={14} /> },
              { key: 'happyClients', label: 'Happy Clients', icon: <CheckCircle size={14} /> },
              { key: 'projectsCompleted', label: 'Projects Done', icon: <Target size={14} /> },
              { key: 'teamMembers', label: 'Team Size', icon: <Users size={14} /> }
            ].map((stat) => (
              <div key={stat.key} className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block flex items-center gap-2">
                  {stat.icon} {stat.label}
                </label>
                <input 
                  type="number"
                  value={formData.stats[stat.key as keyof AboutData['stats']]}
                  onChange={e => handleStatsChange(stat.key as keyof AboutData['stats'], parseInt(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-black text-[#1A2B4C] focus:outline-none focus:border-[#00B4D8] transition-all"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Core Values */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
           <div className="p-10 border-b border-gray-50 flex items-center gap-4">
             <div className="w-12 h-12 bg-[#00B4D8] rounded-2xl flex items-center justify-center text-white shadow-lg">
                <Award size={24} />
             </div>
             <div>
                <h3 className="text-xl font-black text-[#1A2B4C]">Core Values</h3>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Guiding principles</p>
             </div>
          </div>
          <div className="p-10 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.values.map((value, idx) => (
                <div key={idx} className="flex gap-2">
                  <input 
                    value={value}
                    onChange={e => {
                      const newValues = [...formData.values];
                      newValues[idx] = e.target.value;
                      handleChange('values', newValues);
                    }}
                    className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold focus:outline-none focus:border-[#00B4D8]"
                  />
                  <button 
                    onClick={() => {
                      const newValues = formData.values.filter((_, i) => i !== idx);
                      handleChange('values', newValues);
                    }}
                    className="p-3 text-red-400 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            <button 
              onClick={() => handleChange('values', [...formData.values, ''])}
              className="w-full py-4 border-2 border-dashed border-gray-100 rounded-2xl text-gray-400 font-black text-[10px] uppercase tracking-widest hover:border-[#00B4D8] hover:text-[#00B4D8] transition-all flex items-center justify-center gap-2"
            >
              <Plus size={16} /> Add Value
            </button>
          </div>
        </div>

        {/* Security Banner */}
        <div className="bg-[#1A2B4C] rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
            <div className="w-20 h-20 bg-white/10 rounded-[2rem] flex items-center justify-center shrink-0">
              <Info className="text-[#00B4D8]" size={40} />
            </div>
            <div>
              <h3 className="text-2xl font-black mb-3">Content Synchronization</h3>
              <p className="text-gray-400 text-sm leading-relaxed max-w-2xl font-medium">
                Changes made here will be reflected across all about-page instances in real-time. 
                Ensure visual assets (images) are optimized for web delivery before deployment.
              </p>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#00B4D8]/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        </div>
      </div>
    </div>
  );
}
