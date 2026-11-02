import React from 'react';
import { Link } from 'react-router-dom';

export const brands = [
  { id: '2n', name: '2N', logo: <span className="text-3xl font-black text-[#E31937] tracking-tighter">2N</span> },
  { id: '3cx', name: '3CX', logo: <span className="text-3xl font-black text-[#1A2B4C] tracking-tighter">3CX</span> },
  { id: 'axis', name: 'Axis', logo: (
    <div className="flex flex-col items-center leading-none">
      <div className="flex items-center gap-1">
        <span className="text-3xl font-black text-black">AXIS</span>
        <div className="w-0 h-0 border-l-[12px] border-l-transparent border-b-[20px] border-b-[#FFC627] border-r-[12px] border-r-transparent ml-1"></div>
      </div>
      <span className="text-[8px] tracking-[0.2em] font-bold text-black mt-1">COMMUNICATIONS</span>
    </div>
  )},
  { id: 'bosch', name: 'Bosch', logo: (
    <span className="text-3xl font-black text-[#E31937] tracking-tight font-sans">BOSCH</span>
  )},
  { id: 'cisco', name: 'Cisco', logo: (
    <div className="flex flex-col items-center leading-none">
       <div className="flex items-end gap-0.5 mb-1 h-5">
         {['h-1', 'h-1.5', 'h-2', 'h-3', 'h-4', 'h-3', 'h-2', 'h-1.5', 'h-1'].map((cls, i) => (
           <div key={i} className={`w-1 bg-[#005073] ${cls}`}></div>
         ))}
       </div>
       <span className="text-2xl font-black text-[#005073] tracking-tight">CISCO</span>
    </div>
  )},
  { id: 'dahua', name: 'Dahua', logo: (
     <div className="flex items-center text-[#E31937]">
       <span className="text-3xl font-black lowercase tracking-tight">alhua</span>
     </div>
  )},
  { id: 'fanvil', name: 'Fanvil', logo: <span className="text-4xl font-black text-[#D71921] lowercase font-sans relative"><span className="text-[#D71921] uppercase text-5xl">F</span>anvil</span> },
  { id: 'freepbx', name: 'FreePBX', logo: <span className="text-2xl font-black text-[#00A651] tracking-tighter">FreePBX</span> },
  { id: 'grandstream', name: 'Grandstream', logo: (
    <div className="flex items-center gap-2">
      <div className="w-5 h-5 bg-[#1B5796] rounded-sm skew-x-[-15deg]"></div>
      <div className="flex flex-col items-start leading-none">
        <span className="text-sm font-bold text-[#1B5796] tracking-wide">GRANDSTREAM</span>
      </div>
    </div>
  )},
  { id: 'hikvision', name: 'Hikvision', logo: (
    <div className="flex items-center text-[#E31937]">
      <span className="text-2xl font-black italic tracking-tighter">HIKVISION</span>
    </div>
  )},
  { id: 'itc', name: 'ITC', logo: <span className="text-3xl font-black text-[#1A2B4C] tracking-tight">ITC</span> },
  { id: 'jabra', name: 'Jabra', logo: (
    <div className="bg-[#FFD100] px-4 py-1.5 flex items-center justify-center rounded-sm">
      <span className="text-xl text-black font-black tracking-tight">Jabra GN</span>
    </div>
  )},
  { id: 'logitech', name: 'Logitech', logo: (
    <div className="flex items-center gap-2">
       <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
         <div className="w-3 h-3 bg-[#00B8FC] rounded-full"></div>
       </div>
       <span className="text-2xl font-bold text-black tracking-tight">logitech</span>
    </div>
  )},
  { id: 'poly', name: 'Poly', logo: (
    <div className="flex items-center gap-2 text-[#EB3323]">
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8" aria-hidden="true">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
      </svg>
      <span className="text-3xl font-bold text-gray-800 tracking-tighter lowercase">poly</span>
    </div>
  )},
  { id: 'uniview', name: 'Uniview', logo: <span className="text-3xl font-black text-[#0050A4] tracking-tight">uniview</span> },
  { id: 'yealink', name: 'Yealink', logo: <span className="text-3xl font-bold text-[#00A97E] tracking-tight">Yealink</span> },
  { id: 'epson', name: 'Epson', logo: <span className="text-3xl font-black text-[#003399] tracking-tighter">EPSON</span> },
  { id: 'benq', name: 'BenQ', logo: <span className="text-3xl font-black text-[#5C2D91] tracking-tighter">BenQ</span> },
  { id: 'sony', name: 'Sony', logo: <span className="text-3xl font-black text-black tracking-widest">SONY</span> },
  { id: 'panasonic', name: 'Panasonic', logo: <span className="text-3xl font-bold text-[#0000FF] tracking-tighter">Panasonic</span> },
  { id: 'optoma', name: 'Optoma', logo: <span className="text-3xl font-black text-[#E31937] tracking-tight">Optoma</span> },
  { id: 'viewsonic', name: 'ViewSonic', logo: (
    <div className="flex flex-col items-center leading-none">
      <span className="text-2xl font-black text-[#C1121F]">ViewSonic</span>
    </div>
  )}
];

export const TopBrands = () => {
  return (
    <section aria-label="Authorized Enterprise AV Brands" className="py-16 bg-white">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-[#1A2B4C]">Authorized Pro-AV &amp; Unified Communications Brands</h2>
            <h3 className="text-sm font-semibold text-slate-600 mt-1">Official Pakistan Distributor &amp; Certified Integration Partner</h3>
          </div>
          <Link to="/brands" className="text-sm font-bold text-[#1F558C] hover:text-[#00B4D8] py-2 px-4 rounded-xl bg-gray-50">
            Explore All 25 Brands
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {brands.slice(0, 12).map((brand) => (
            <Link 
              key={brand.id}
              to={`/brands/${brand.id}`}
              aria-label={`Explore ${brand.name} products in Pakistan`}
              className="bg-white border border-gray-200 rounded-xl h-24 flex items-center justify-center hover:shadow-lg transition-shadow hover:border-[#00B4D8]"
            >
              {brand.logo}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
