import { useState } from 'react';
import { Calculator, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import jsPDF from 'jspdf';
import { SEO } from '../components/SEO';

export function RoomDesigner() {
  const [width, setWidth] = useState(4);
  const [height, setHeight] = useState(2.5);
  const [pitch, setPitch] = useState('P2.5');

  // SMD Panel Specs
  const panelWidth = 0.5; // meters (500mm)
  const panelHeight = 0.5; // meters (500mm)
  const panelWeight = 7.5; // kg
  
  const cols = Math.ceil(width / panelWidth);
  const rows = Math.ceil(height / panelHeight);
  const totalPanels = cols * rows;
  const totalWeight = totalPanels * panelWeight;

  const getPricePerPanel = () => {
    switch (pitch) {
      case 'P2.5': return 650;
      case 'P2.9': return 550;
      case 'P3.9': return 450;
      default: return 650;
    }
  };

  const totalPrice = totalPanels * getPricePerPanel();

  const handleGenerateQuote = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(24);
    doc.setTextColor(26, 43, 76); // #1A2B4C
    doc.text('AV Live Communications', 20, 30);
    
    doc.setFontSize(14);
    doc.setTextColor(0, 180, 216); // #00B4D8
    doc.text('Official Quotation - SMD Display System', 20, 40);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Date: ' + new Date().toLocaleDateString(), 20, 50);
    doc.text('Quote Reference: ' + Math.floor(Math.random() * 1000000), 20, 55);
    
    // Configuration details
    doc.setFontSize(14);
    doc.setTextColor(26, 43, 76);
    doc.text('Configuration Details', 20, 75);
    
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text('Wall Dimensions: ' + width + 'm (Width) x ' + height + 'm (Height)', 20, 85);
    doc.text('Pixel Pitch: ' + pitch, 20, 92);
    doc.text('Total Panels Needed (500x500mm): ' + totalPanels + ' (' + cols + ' cols x ' + rows + ' rows)', 20, 99);
    doc.text('Estimated Structural Weight: ' + totalWeight + ' kg', 20, 106);
    
    // Pricing
    doc.setFontSize(14);
    doc.setTextColor(26, 43, 76);
    doc.text('Estimated Pricing', 20, 126);
    
    doc.setFontSize(12);
    doc.text('Total Price: USD ' + totalPrice.toLocaleString(), 20, 136);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Note: This is an estimated quote. Final pricing may vary based on installation complexity,', 20, 150);
    doc.text('shipping, and additional accessories.', 20, 155);
    
    doc.save('AV_Live_SMD_Quote.pdf');
  };

  return (
    <div className="bg-[#F8F9FA] min-h-screen py-12 text-[#1A2B4C]">
      <SEO title="Room Designer" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <Link to="/solutions" className="text-[#00B4D8] hover:underline text-xs uppercase tracking-widest font-bold mb-4 inline-block">&larr; Back to Solutions</Link>
          <h1 className="text-4xl font-bold mb-4 uppercase tracking-tighter">SMD Room Designer</h1>
          <p className="text-lg text-gray-500 font-medium max-w-2xl mx-auto">Calculate panel requirements and estimated costs for your custom LED wall.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Controls & Specs combined */}
          <div className="space-y-8">
            <div className="bg-white rounded-[32px] border border-gray-200 p-8 shadow-sm">
              <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 text-[#1A2B4C]">
                <Calculator className="text-[#00B4D8]" />
                Configuration
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Wall Width (meters)</label>
                  <div className="flex items-center space-x-4">
                    <input 
                      type="range" 
                      min="1" max="20" step="0.5" 
                      value={width} 
                      onChange={(e) => setWidth(parseFloat(e.target.value))}
                      className="w-full accent-[#00B4D8]"
                    />
                    <span className="font-mono bg-gray-100 px-3 py-1 rounded-lg font-bold min-w-[4rem] text-center">{width}m</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Wall Height (meters)</label>
                  <div className="flex items-center space-x-4">
                    <input 
                      type="range" 
                      min="1" max="10" step="0.5" 
                      value={height} 
                      onChange={(e) => setHeight(parseFloat(e.target.value))}
                      className="w-full accent-[#00B4D8]"
                    />
                    <span className="font-mono bg-gray-100 px-3 py-1 rounded-lg font-bold min-w-[4rem] text-center">{height}m</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Pixel Pitch (Resolution)</label>
                  <select 
                    value={pitch} 
                    onChange={(e) => setPitch(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#00B4D8] font-bold"
                  >
                    <option value="P2.5">P2.5 (High Res - Auditoriums)</option>
                    <option value="P2.9">P2.9 (Standard - Indoor)</option>
                    <option value="P3.9">P3.9 (Standard - Large Halls)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-[#1A2B4C] text-white rounded-[32px] p-8 shadow-xl">
              <h3 className="font-bold text-lg mb-6">System Specifications</h3>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <span className="text-gray-400 text-sm">Total Panels (500x500mm)</span>
                  <span className="font-bold text-[#00B4D8] text-xl">{totalPanels} <span className="text-sm font-medium text-gray-300">({cols}w x {rows}h)</span></span>
                </div>
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <span className="text-gray-400 text-sm">Total Structural Weight</span>
                  <span className="font-bold text-[#00B4D8] text-xl">{totalWeight} <span className="text-sm font-medium text-gray-300">kg</span></span>
                </div>
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <span className="text-gray-400 text-sm">Native Resolution Estimate</span>
                  <span className="font-bold text-white font-mono bg-white/10 px-2 py-1 rounded">
                    {pitch === 'P2.5' ? `${cols * 200}x${rows * 200}` : pitch === 'P2.9' ? `${Math.floor(cols * 172)}x${Math.floor(rows * 172)}` : `${Math.floor(cols * 128)}x${Math.floor(rows * 128)}`}
                  </span>
                </div>
                <div className="flex justify-between items-end pt-4">
                  <span className="text-gray-400 text-sm font-bold uppercase tracking-wider">Estimated Price</span>
                  <span className="font-black text-4xl">${totalPrice.toLocaleString()}</span>
                </div>
              </div>
              <button onClick={handleGenerateQuote} className="w-full bg-[#00B4D8] hover:bg-[#009bc2] text-white font-bold py-4 rounded-xl transition-colors uppercase tracking-wider text-sm shadow-lg shadow-[#00B4D8]/20 flex items-center justify-center gap-2">
                <Download size={20} /> Generate Official Quote (PDF)
              </button>
            </div>
          </div>

          {/* Visualizer */}
          <div className="bg-white rounded-[32px] border border-gray-200 p-8 shadow-sm flex flex-col items-center justify-center min-h-[500px]">
            <div className="w-full h-full flex flex-col items-center justify-center bg-[#F8F9FA] rounded-2xl border-2 border-dashed border-gray-300 relative overflow-hidden p-8 flex-grow">
              <div className="absolute top-4 left-4">
                <span className="text-[#00B4D8] text-xs font-bold uppercase tracking-[0.2em]">Scale Preview</span>
              </div>
              
              <div className="relative border-4 border-[#1A2B4C] bg-[#1A2B4C]/5 shadow-2xl flex flex-wrap mt-8" style={{ 
                width: `${Math.min(width * 20, 100)}%`, 
                aspectRatio: `${width} / ${height}`
              }}>
                 {/* Grid overlay simulating panels */}
                 <div className="absolute inset-0" style={{
                   backgroundImage: 'linear-gradient(rgba(26, 43, 76, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(26, 43, 76, 0.2) 1px, transparent 1px)',
                   backgroundSize: `${100/cols}% ${100/rows}%`
                 }}></div>
                 <div className="absolute inset-0 flex items-center justify-center opacity-50">
                    <span className="text-[#1A2B4C] font-bold text-xl md:text-3xl whitespace-nowrap">{width}m x {height}m</span>
                 </div>
              </div>
            </div>
            <div className="mt-6 text-center">
               <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Grid Matrix: {cols} x {rows} panels</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
