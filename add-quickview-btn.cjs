const fs = require('fs');
let content = fs.readFileSync('src/pages/Shop.tsx', 'utf8');

const btnGrid = `  <button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setQuickViewProduct(product);
                          }}
                          className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm text-[#1A2B4C] px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-[#00B4D8] hover:text-white flex items-center gap-2 z-10"
                        >
                          <Eye size={14} /> Quick View
                        </button>
                      </Link>`;

content = content.replace(/<\/Link>\s*<div className="p-8 flex flex-col flex-grow">/, btnGrid + '\n                    <div className="p-8 flex flex-col flex-grow">');

const btnList = `  <button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setQuickViewProduct(product);
                          }}
                          className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm text-[#1A2B4C] px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-[#00B4D8] hover:text-white flex items-center gap-1 z-10"
                        >
                          <Eye size={12} /> Quick View
                        </button>
                      </Link>`;

content = content.replace(/<\/Link>\s*<div className="flex-grow flex flex-col min-w-0">/, btnList + '\n                    <div className="flex-grow flex flex-col min-w-0">');

fs.writeFileSync('src/pages/Shop.tsx', content);
