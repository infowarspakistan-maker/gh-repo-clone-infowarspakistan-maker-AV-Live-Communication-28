import { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Copy, 
  Check, 
  ExternalLink, 
  HelpCircle, 
  Image as ImageIcon, 
  Database, 
  Play, 
  BookOpen, 
  AlertCircle,
  FileText
} from 'lucide-react';

export function MediaGuide() {
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const cheatSheetItems = [
    {
      media: "Product Image",
      url: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&q=80",
      location: "/admin/products-all → Edit Product → Images field",
      type: "Product"
    },
    {
      media: "Product Thumbnail",
      url: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=300&q=80",
      location: "Same as above (automatically uses the first image URL)",
      type: "Product"
    },
    {
      media: "Hero Slide",
      url: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1920&q=80",
      location: "/admin/homepage-editor → Hero Slides → New / Edit Slide",
      type: "Homepage"
    },
    {
      media: "Brand Logo",
      url: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=300&q=80",
      location: "/admin/homepage-editor → Partners & Brands → Add Brand",
      type: "Homepage"
    },
    {
      media: "Testimonial Avatar",
      url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80",
      location: "/admin/homepage-editor → Client Testimonials → Add Testimonial",
      type: "Homepage"
    },
    {
      media: "Service Icon",
      url: "https://via.placeholder.com/64x64/1A2B4C/FFFFFF?text=🏢",
      location: "Firestore → services collection → iconUrl field",
      type: "Services"
    },
    {
      media: "Service Hero Image",
      url: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1920&q=80",
      location: "Firestore → services collection → heroImageUrl field",
      type: "Services"
    }
  ];

  const sources = [
    {
      title: "Option A: Unsplash (Free Stock Images)",
      steps: [
        "Go to unsplash.com",
        "Search and locate your desired image",
        "Right-click on the image and select 'Copy image address'"
      ],
      link: "https://unsplash.com",
      id: "unsplash"
    },
    {
      title: "Option B: ImgBB (Free Image Hosting)",
      steps: [
        "Go to imgbb.com and upload your custom files",
        "After uploading, change the embed codes dropdown to 'Direct link'",
        "Copy the generated URL (it will end in .jpg, .png, etc.)"
      ],
      link: "https://imgbb.com",
      id: "imgbb"
    },
    {
      title: "Option C: Cloudinary (Professional CDN)",
      steps: [
        "Upload images to your Cloudinary Media Library",
        "Hover over the image and click the link icon to copy URL",
        "Make sure the URL is absolute and starts with https://"
      ],
      link: "https://cloudinary.com",
      id: "cloudinary"
    }
  ];

  const dosAndDonts = [
    {
      type: "do",
      title: "What to Do",
      items: [
        { text: "Paste https://example.com/image.jpg", desc: "Direct URL to a publicly hosted secure image." },
        { text: "Use https:// URLs only", desc: "Browsers block mixed content if you use insecure HTTP." },
        { text: "Test the URL in a browser tab first", desc: "Verify it loads directly without HTML wrapper pages." },
        { text: "Keep source images active", desc: "If you delete the image from the source host, the link breaks." }
      ]
    },
    {
      type: "dont",
      title: "What NOT to Do",
      items: [
        { text: "Paste C:\\Images\\product.jpg", desc: "This is a local computer path. Nobody else can load it." },
        { text: "Use http:// (not https://)", desc: "Web browsers will block the resource due to security policies." },
        { text: "Paste Google Drive preview links", desc: "e.g., https://drive.google.com/file/d/abc. These do not point directly to raw image data." },
        { text: "Delete original source files", desc: "Doing so makes the image go offline, leaving placeholder icons." }
      ]
    }
  ];

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-16 animate-in fade-in duration-500">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm" id="media-guide-header">
        <div>
          <div className="flex items-center gap-2 text-[#00B4D8] font-bold text-xs uppercase tracking-widest mb-1">
            <BookOpen size={14} />
            Administrator Documentation
          </div>
          <h1 className="text-3xl font-black text-[#1A2B4C] tracking-tight uppercase">Media & Image URL Integration</h1>
          <p className="text-sm text-gray-500 mt-1">
            Learn how to link high-quality images, slides, logos, and testimonials directly using secure HTTPS URLs.
          </p>
        </div>
        <div className="bg-[#00B4D8]/10 text-[#00B4D8] px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 border border-[#00B4D8]/20">
          <CheckCircle2 size={14} /> No File Uploads Required
        </div>
      </div>

      {/* How It Works Intro Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-[#1A2B4C] to-[#2C4066] text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden flex flex-col justify-between col-span-1 lg:col-span-1" id="how-it-works-card">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-[#00B4D8]">
              <HelpCircle size={24} />
            </div>
            <h2 className="text-xl font-bold tracking-tight uppercase">How It Works</h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              Instead of slow and storage-heavy server uploads, this admin system works entirely using direct, live web links (URLs).
            </p>
            <ul className="space-y-3 text-xs text-gray-300">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-[#00B4D8]/20 text-[#00B4D8] flex items-center justify-center font-bold shrink-0 text-[10px]">1</span>
                <span>Copy any direct image address from the web (Unsplash, ImgBB, etc.)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-[#00B4D8]/20 text-[#00B4D8] flex items-center justify-center font-bold shrink-0 text-[10px]">2</span>
                <span>Paste the URL into the appropriate field in the Admin forms</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-[#00B4D8]/20 text-[#00B4D8] flex items-center justify-center font-bold shrink-0 text-[10px]">3</span>
                <span>The platform immediately saves it and streams it securely to the live users</span>
              </li>
            </ul>
          </div>
          <div className="mt-8 border-t border-white/10 pt-4 flex justify-between items-center text-[10px] uppercase font-black tracking-widest text-gray-400">
            <span>Client Side Proxying</span>
            <span className="text-[#00B4D8]">Active</span>
          </div>
        </div>

        {/* Quick Test Interactive Panel */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm col-span-1 lg:col-span-2 flex flex-col justify-between" id="quick-test-card">
          <div>
            <div className="flex items-center gap-2 text-gray-400 font-bold text-[10px] uppercase tracking-widest mb-2">
              <Play size={10} className="text-[#00B4D8]" />
              Interactive Tutorial
            </div>
            <h2 className="text-xl font-black text-[#1A2B4C] uppercase tracking-tight">🎯 Direct URL Quick Test</h2>
            <p className="text-sm text-gray-500 mt-1 leading-relaxed">
              Let's test this workflow. Follow these simple steps to verify how direct image integration operates in real-time.
            </p>

            <div className="mt-6 space-y-4">
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Step 1: Copy this Unsplash test image URL</div>
                <div className="flex gap-2 items-center">
                  <input 
                    type="text" 
                    readOnly 
                    value="https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&q=80" 
                    className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs font-mono text-gray-600 focus:outline-none"
                    id="unsplash-test-input"
                  />
                  <button 
                    onClick={() => copyToClipboard("https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&q=80", "unsplash-test")}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${copiedText === "unsplash-test" ? 'bg-emerald-500 text-white' : 'bg-[#1A2B4C] hover:bg-[#00B4D8] text-white'}`}
                    id="copy-test-url-button"
                  >
                    {copiedText === "unsplash-test" ? <Check size={14} /> : <Copy size={14} />}
                    {copiedText === "unsplash-test" ? "Copied" : "Copy URL"}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-gray-100 bg-[#F8F9FA]">
                  <div className="text-xs font-black text-[#1A2B4C] uppercase tracking-widest mb-1">Step 2: Edit product</div>
                  <p className="text-xs text-gray-500">
                    Navigate to <span className="font-bold text-[#00B4D8]">All Products</span>, select edit on any items, and find the <span className="font-bold">Images</span> field.
                  </p>
                </div>
                <div className="p-4 rounded-2xl border border-gray-100 bg-[#F8F9FA]">
                  <div className="text-xs font-black text-[#1A2B4C] uppercase tracking-widest mb-1">Step 3: Paste & save</div>
                  <p className="text-xs text-gray-500">
                    Paste this copied URL on its own line, click <span className="font-bold">Update Product</span>, and see it display instantly on the user shop details.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Reference Table */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm" id="cheat-sheet-section">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-black text-[#1A2B4C] uppercase tracking-tight flex items-center gap-2">
              <FileText className="text-[#00B4D8]" size={20} />
              📝 Quick Reference Cheat Sheet
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Where to paste your links in the administrator panel based on media category types.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-gray-100">
          <table className="w-full text-left border-collapse" id="cheat-sheet-table">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Media Type</th>
                <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Paste Location</th>
                <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Example URL Template</th>
                <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {cheatSheetItems.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 font-bold text-[#1A2B4C]">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        item.type === 'Product' ? 'bg-indigo-500' : 
                        item.type === 'Homepage' ? 'bg-[#00B4D8]' : 'bg-emerald-500'
                      }`}></span>
                      {item.media}
                    </div>
                  </td>
                  <td className="p-4 text-xs font-semibold text-gray-500">{item.location}</td>
                  <td className="p-4 font-mono text-xs text-gray-400 truncate max-w-xs">{item.url}</td>
                  <td className="p-4 text-center">
                    <button
                      id={`copy-ref-${index}`}
                      onClick={() => copyToClipboard(item.url, `ref-${index}`)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 ${copiedText === `ref-${index}` ? 'bg-emerald-500 text-white' : 'bg-gray-100 hover:bg-[#00B4D8] hover:text-white text-gray-500'}`}
                    >
                      {copiedText === `ref-${index}` ? <Check size={12} /> : <Copy size={12} />}
                      {copiedText === `ref-${index}` ? "Copied" : "Copy Link"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Direct URL Finding Options */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-black text-[#1A2B4C] uppercase tracking-tight">🌐 How to get a direct URL from free providers</h2>
          <p className="text-sm text-gray-500 mt-1">
            Choose your preferred source to retrieve absolute direct paths.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sources.map((src) => (
            <div key={src.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-between" id={`source-${src.id}`}>
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-[#00B4D8] border border-gray-100">
                  <ImageIcon size={18} />
                </div>
                <h3 className="text-base font-black text-[#1A2B4C] leading-snug">{src.title}</h3>
                <ol className="space-y-2 text-xs text-gray-500 list-decimal pl-4">
                  {src.steps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>
              <div className="mt-8 pt-4 border-t border-gray-50">
                <a 
                  href={src.link} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-xs font-black text-[#00B4D8] hover:text-[#1A2B4C] transition-colors inline-flex items-center gap-1 uppercase tracking-wider"
                  id={`link-to-${src.id}`}
                >
                  Visit Website
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Services Editing Guide - Firestore Manual Update */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm" id="services-firestore-guide">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500">
            <Database size={18} />
          </div>
          <div>
            <h3 className="text-lg font-black text-[#1A2B4C] uppercase tracking-tight">🔧 How to add Services Images (Firestore Update)</h3>
            <p className="text-xs text-gray-500">Since direct client administration for services isn't fully exposed, update documents directly in the Firestore cloud panel.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="p-6 rounded-2xl bg-[#F8F9FA] border border-gray-100">
            <span className="text-[10px] font-black text-[#00B4D8] uppercase tracking-widest block mb-1">Step 1</span>
            <h4 className="font-bold text-sm text-[#1A2B4C] mb-2">Navigate to Firestore</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Open your Firebase Console, navigate to your active Firestore Database panel, and locate the <span className="font-bold font-mono bg-gray-200/50 px-1.5 py-0.5 rounded text-gray-700">services</span> collection documents.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-[#F8F9FA] border border-gray-100">
            <span className="text-[10px] font-black text-[#00B4D8] uppercase tracking-widest block mb-1">Step 2</span>
            <h4 className="font-bold text-sm text-[#1A2B4C] mb-2">Identify Service Documents</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Find the specific service document you want to edit (e.g. corporate-events or hybrid-events) and click on it to see its fields.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-[#F8F9FA] border border-gray-100">
            <span className="text-[10px] font-black text-[#00B4D8] uppercase tracking-widest block mb-1">Step 3</span>
            <h4 className="font-bold text-sm text-[#1A2B4C] mb-2">Configure URL Fields</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Add or update these string fields with your live URLs: <span className="font-mono font-bold">iconUrl</span> (for custom service symbols) and <span className="font-mono font-bold">heroImageUrl</span> (for landing sliders).
            </p>
          </div>
        </div>
      </div>

      {/* DOs & DONTs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="dos-donts-section">
        {dosAndDonts.map((group, idx) => (
          <div 
            key={idx} 
            className={`p-8 rounded-[2.5rem] border ${
              group.type === "do" ? "bg-emerald-50/20 border-emerald-500/10" : "bg-red-50/20 border-red-500/10"
            }`}
          >
            <div className="flex items-center gap-2 mb-6">
              {group.type === "do" ? (
                <CheckCircle2 className="text-emerald-500" size={20} />
              ) : (
                <XCircle className="text-red-500" size={20} />
              )}
              <h3 className="text-lg font-black text-[#1A2B4C] uppercase tracking-tight">{group.title}</h3>
            </div>

            <div className="space-y-4">
              {group.items.map((item, itemIdx) => (
                <div key={itemIdx} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-1">
                  <span className={`font-mono text-xs font-bold leading-tight ${group.type === "do" ? "text-emerald-600" : "text-red-500"}`}>
                    {item.text}
                  </span>
                  <span className="text-xs text-gray-500">{item.desc}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
