import React, { useState, useEffect } from 'react';
import { Store, Copy, Check, ExternalLink, MapPin, Phone, Globe, Clock, Sparkles } from 'lucide-react';
import { 
  getGeneralSettings, GeneralSettings,
  getContactData, ContactData,
  getAboutData, AboutData,
  getProducts, Product,
  getAllServices, Service
} from '../../lib/firebase/firestore-helpers';

export function GoogleBusinessExport() {
  const [settings, setSettings] = useState<GeneralSettings | null>(null);
  const [contact, setContact] = useState<ContactData | null>(null);
  const [about, setAbout] = useState<AboutData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [genSettings, contactData, aboutData, allProducts, allServices] = await Promise.all([
          getGeneralSettings(),
          getContactData(),
          getAboutData(),
          getProducts(),
          getAllServices()
        ]);
        
        setSettings(genSettings);
        setContact(contactData);
        setAbout(aboutData);
        setProducts(allProducts.filter(p => p.isActive).slice(0, 10)); // Top 10 products
        setServices(allServices.filter(s => s.isActive).slice(0, 10)); // Top 10 services
      } catch (error) {
        console.error('Error fetching data for Google Business export:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCopy = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const generateBusinessDescription = () => {
    let desc = `${settings?.tagline || ''}\n\n`;
    if (about?.history) {
      desc += `${about.history}\n\n`;
    }
    if (about?.mission) {
      desc += `Mission: ${about.mission}\n`;
    }
    return desc.trim();
  };

  const formatHours = () => {
    if (!contact?.businessHours) return 'Not specified';
    return `Monday-Friday: ${contact.businessHours.weekday || '9:00 AM - 6:00 PM'}
Saturday: ${contact.businessHours.saturday || '10:00 AM - 4:00 PM'}
Sunday: ${contact.businessHours.sunday || 'Closed'}`;
  };

  const formatProducts = () => {
    return products.map(p => 
      `${p.productName}
Category: ${p.brand || 'General'}
Price: PKR ${p.salePrice || p.regularPrice}
Description: ${p.shortDescription?.replace(/<[^>]+>/g, '') || 'High-quality AV equipment.'}`
    ).join('\n\n---\n\n');
  };

  const formatServices = () => {
    const dbServices = services.map(s => 
      `${s.title}\nDescription: ${s.description?.replace(/<[^>]+>/g, '') || ''}`
    );
    
    // Explicitly add Video Conferencing as a flagship solution
    const flagshipSolutions = [
      `Video Conferencing Solutions\nDescription: We provide enterprise-grade video conferencing and smart collaboration solutions for hybrid workspaces. As authorized partners for Poly, Cisco, Logitech, and Yealink, we offer complete room design, hardware provisioning, and installation across Pakistan.`
    ];

    return [...flagshipSolutions, ...dbServices].join('\n\n---\n\n');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-[#00B4D8]/20 border-t-[#00B4D8] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-[#1A2B4C] mb-2 tracking-tight">Google Business Profile</h1>
        <p className="text-gray-500">
          Generated branding profile, descriptions, and excerpts optimized for your Google Business listing.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Core Info */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Company Profile */}
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Store className="text-[#00B4D8]" /> 
                Company Profile
              </h2>
              <button 
                onClick={() => handleCopy(generateBusinessDescription(), 'profile')}
                className="flex items-center gap-2 text-sm text-[#00B4D8] hover:bg-[#00B4D8]/10 px-3 py-1.5 rounded-lg transition-colors font-medium"
              >
                {copiedSection === 'profile' ? <Check size={16} /> : <Copy size={16} />}
                {copiedSection === 'profile' ? 'Copied' : 'Copy'}
              </button>
            </div>
            
            <div className="space-y-4 text-sm text-gray-700 bg-gray-50 p-6 rounded-2xl whitespace-pre-wrap font-mono leading-relaxed border border-gray-100">
              {generateBusinessDescription() || 'No about/tagline data found. Please update settings and about page.'}
            </div>
          </div>

          {/* Products Excerpts */}
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Sparkles className="text-[#00B4D8]" /> 
                Products for Catalog
              </h2>
              <button 
                onClick={() => handleCopy(formatProducts(), 'products')}
                className="flex items-center gap-2 text-sm text-[#00B4D8] hover:bg-[#00B4D8]/10 px-3 py-1.5 rounded-lg transition-colors font-medium"
              >
                {copiedSection === 'products' ? <Check size={16} /> : <Copy size={16} />}
                {copiedSection === 'products' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="space-y-4 text-sm text-gray-700 bg-gray-50 p-6 rounded-2xl whitespace-pre-wrap font-mono leading-relaxed border border-gray-100 max-h-96 overflow-y-auto">
              {formatProducts() || 'No active products found.'}
            </div>
          </div>

          {/* Services Excerpts */}
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Sparkles className="text-[#00B4D8]" /> 
                Services Excerpts
              </h2>
              <button 
                onClick={() => handleCopy(formatServices(), 'services')}
                className="flex items-center gap-2 text-sm text-[#00B4D8] hover:bg-[#00B4D8]/10 px-3 py-1.5 rounded-lg transition-colors font-medium"
              >
                {copiedSection === 'services' ? <Check size={16} /> : <Copy size={16} />}
                {copiedSection === 'services' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="space-y-4 text-sm text-gray-700 bg-gray-50 p-6 rounded-2xl whitespace-pre-wrap font-mono leading-relaxed border border-gray-100 max-h-96 overflow-y-auto">
              {formatServices() || 'No active services found.'}
            </div>
          </div>

        </div>

        {/* Right Column - Quick Info & Timing */}
        <div className="space-y-6">
          <div className="bg-[#1A2B4C] text-white p-6 md:p-8 rounded-3xl shadow-xl">
            <h3 className="font-bold text-lg mb-6 text-white flex items-center gap-2">
              <Store size={20} className="text-[#00B4D8]" />
              Business Info
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Business Name</label>
                <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/10">
                  <span className="font-medium">{settings?.siteName || 'AV Live Communications'}</span>
                  <button onClick={() => handleCopy(settings?.siteName || '', 'name')} className="text-[#00B4D8] hover:text-white transition-colors">
                    <Copy size={14} />
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block flex items-center gap-2">
                  <MapPin size={14} /> Location
                </label>
                <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/10">
                  <span className="font-medium text-sm">{contact?.address || settings?.address || 'Not specified'}</span>
                  <button onClick={() => handleCopy(contact?.address || settings?.address || '', 'address')} className="text-[#00B4D8] hover:text-white transition-colors">
                    <Copy size={14} />
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block flex items-center gap-2">
                  <Phone size={14} /> Phone
                </label>
                <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/10">
                  <span className="font-medium text-sm">{contact?.phone || settings?.phone || 'Not specified'}</span>
                  <button onClick={() => handleCopy(contact?.phone || settings?.phone || '', 'phone')} className="text-[#00B4D8] hover:text-white transition-colors">
                    <Copy size={14} />
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block flex items-center gap-2">
                  <Globe size={14} /> Website
                </label>
                <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/10">
                  <span className="font-medium text-sm">https://avlive.com.pk</span>
                  <button onClick={() => handleCopy('https://avlive.com.pk', 'website')} className="text-[#00B4D8] hover:text-white transition-colors">
                    <Copy size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
              <Clock size={20} className="text-[#00B4D8]" />
              Business Hours
            </h3>
            
            <div className="flex items-start justify-between mb-4">
              <div className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 p-4 rounded-xl flex-1 font-mono border border-gray-100">
                {formatHours()}
              </div>
            </div>
            
            <button 
              onClick={() => handleCopy(formatHours(), 'hours')}
              className="w-full flex items-center justify-center gap-2 text-sm text-white bg-[#1A2B4C] hover:bg-[#00B4D8] py-3 rounded-xl transition-colors font-medium shadow-lg shadow-[#1A2B4C]/10"
            >
              {copiedSection === 'hours' ? <Check size={16} /> : <Copy size={16} />}
              {copiedSection === 'hours' ? 'Copied' : 'Copy Hours'}
            </button>
          </div>
          
          <a 
            href="https://business.google.com/locations" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full p-4 bg-gray-50 border border-gray-200 text-gray-700 rounded-2xl hover:bg-gray-100 transition-colors font-bold text-sm"
          >
            Open Google Business <ExternalLink size={16} />
          </a>
        </div>
      </div>
    </div>
  );
}
