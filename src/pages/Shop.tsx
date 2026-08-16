import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Filter, 
  Search, 
  ChevronDown, 
  Loader2, 
  Zap, 
  Grid, 
  List, 
  RotateCcw, 
  X, 
  SlidersHorizontal,
  Check,
  Eye, ArrowRight, Star, Heart,
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { addToCart } from '../lib/cart';
import { subscribeToProducts, subscribeToCategories, Product, Category } from '../lib/firebase/firestore-helpers';
import { SEO } from '../components/SEO';
import { Breadcrumbs } from '../components/Breadcrumbs';

export function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [expandedParents, setExpandedParents] = useState<{[key: string]: boolean}>({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Sync parameters from URL
  const searchQuery = searchParams.get('q') || '';
  const selectedCategory = searchParams.get('category') || null;
  const selectedBrands = useMemo(() => {
    const brandParam = searchParams.get('brand');
    return brandParam ? brandParam.split(',').map(b => b.trim().toLowerCase()) : [];
  }, [searchParams]);
  const minPrice = searchParams.get('min_price') || '';
  const maxPrice = searchParams.get('max_price') || '';
  const sortOption = searchParams.get('sort') || 'featured';

  // Local inputs to avoid over-triggering search params update on typing
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [localMinPrice, setLocalMinPrice] = useState(minPrice);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice);

  // Sync local inputs when URL parameters change
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    setLocalMinPrice(minPrice);
  }, [minPrice]);

  useEffect(() => {
    setLocalMaxPrice(maxPrice);
  }, [maxPrice]);

  useEffect(() => {
    const unsubscribeCategories = subscribeToCategories((cats) => {
      setCategories(cats);
    });

    const unsubscribeProducts = subscribeToProducts((data) => {
      setProducts(data);
      setLoading(false);
    }, { isActive: true });

    return () => {
      unsubscribeCategories();
      unsubscribeProducts();
    };
  }, []);

  const updateFilters = (updates: {
    q?: string;
    category?: string | null;
    brand?: string[] | null;
    min_price?: string;
    max_price?: string;
    sort?: string;
  }) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      
      if (updates.q !== undefined) {
        if (updates.q) next.set('q', updates.q);
        else next.delete('q');
      }
      
      if (updates.category !== undefined) {
        if (updates.category) next.set('category', updates.category);
        else next.delete('category');
      }
      
      if (updates.brand !== undefined) {
        if (updates.brand && updates.brand.length > 0) next.set('brand', updates.brand.join(','));
        else next.delete('brand');
      }
      
      if (updates.min_price !== undefined) {
        if (updates.min_price) next.set('min_price', updates.min_price);
        else next.delete('min_price');
      }
      
      if (updates.max_price !== undefined) {
        if (updates.max_price) next.set('max_price', updates.max_price);
        else next.delete('max_price');
      }
      
      if (updates.sort !== undefined) {
        if (updates.sort && updates.sort !== 'featured') next.set('sort', updates.sort);
        else next.delete('sort');
      }
      
      return next;
    });
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
    setLocalSearch('');
    setLocalMinPrice('');
    setLocalMaxPrice('');
  };

  // 1. Calculate available brands with contextual counts (after search & category filters)
  const availableBrands = useMemo(() => {
    let baseProducts = [...products];
    if (selectedCategory) {
      const cat = categories.find(c => c.id === selectedCategory);
      baseProducts = baseProducts.filter(p => 
        p.categoryIds?.includes(selectedCategory) ||
        (cat && (Array.isArray(p.categorySlugs) ? p.categorySlugs : (typeof p.categorySlugs === 'string' ? [p.categorySlugs] : [])).includes(cat.slug))
      );
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      baseProducts = baseProducts.filter(p => 
        (p.productName || p.name || '').toLowerCase().includes(q) || 
        (p.brand || '').toLowerCase().includes(q)
      );
    }

    const counts: { [brand: string]: number } = {};
    baseProducts.forEach(p => {
      const b = p.brand || 'Other';
      counts[b] = (counts[b] || 0) + 1;
    });

    return Object.entries(counts).map(([name, count]) => ({
      name,
      count,
      normalized: name.toLowerCase()
    })).sort((a, b) => a.name.localeCompare(b.name));
  }, [products, selectedCategory, searchQuery]);

  // 2. Calculate category counts
  const categoryCounts = useMemo(() => {
    const counts: { [catId: string]: number } = {};
    products.forEach(p => {
      const idsToCount = new Set<string>();
      p.categoryIds?.forEach(id => idsToCount.add(id));
      const slugs = Array.isArray(p.categorySlugs) ? p.categorySlugs : (typeof p.categorySlugs === 'string' ? [p.categorySlugs] : []);
      slugs.forEach(slug => {
        const cat = categories.find(c => c.slug === slug);
        if (cat && cat.id) idsToCount.add(cat.id);
      });
      idsToCount.forEach(id => {
        counts[id] = (counts[id] || 0) + 1;
      });
    });
    return counts;
  }, [products, categories]);

  // 3. Main Sorted and Filtered Products List
  const sortedAndFilteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by category
    if (selectedCategory) {
      const cat = categories.find(c => c.id === selectedCategory);
      result = result.filter(p => 
        p.categoryIds?.includes(selectedCategory) || 
        (cat && (Array.isArray(p.categorySlugs) ? p.categorySlugs : (typeof p.categorySlugs === 'string' ? [p.categorySlugs] : [])).includes(cat.slug))
      );
    }

    // Filter by search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        (p.productName || p.name || '').toLowerCase().includes(q) || 
        (p.brand || '').toLowerCase().includes(q) ||
        (p.sku || '').toLowerCase().includes(q)
      );
    }

    // Filter by brand selection
    if (selectedBrands.length > 0) {
      result = result.filter(p => p.brand && selectedBrands.includes(p.brand.toLowerCase()));
    }

    // Filter by min price
    if (minPrice) {
      const minVal = parseFloat(minPrice);
      if (!isNaN(minVal)) {
        result = result.filter(p => p.salePrice >= minVal);
      }
    }

    // Filter by max price
    if (maxPrice) {
      const maxVal = parseFloat(maxPrice);
      if (!isNaN(maxVal)) {
        result = result.filter(p => p.salePrice <= maxVal);
      }
    }

    // Sort products
    switch (sortOption) {
      case 'price-low':
        result.sort((a, b) => a.salePrice - b.salePrice);
        break;
      case 'price-high':
        result.sort((a, b) => b.salePrice - a.salePrice);
        break;
      case 'newest':
        result.sort((a, b) => {
          const timeA = a.createdAt ? (a.createdAt as any).seconds || 0 : 0;
          const timeB = b.createdAt ? (b.createdAt as any).seconds || 0 : 0;
          return timeB - timeA;
        });
        break;
      case 'popularity':
        result.sort((a, b) => {
          const popA = (a as any).views || 0;
          const popB = (b as any).views || 0;
          return popB - popA;
        });
        break;
      case 'name-asc':
        result.sort((a, b) => a.productName.localeCompare(b.productName));
        break;
      case 'name-desc':
        result.sort((a, b) => b.productName.localeCompare(a.productName));
        break;
      default:
        break;
    }
    return result;
  }, [products, searchQuery, selectedCategory, selectedBrands, minPrice, maxPrice, sortOption]);

  const parentCategories = categories.filter(c => {
    const isProductCategory = !c.parentId && c.isActive && ((c as any).type === 'product');
    if (!isProductCategory) return false;
    const parentCount = categoryCounts[c.id!] || 0;
    const hasProducts = parentCount > 0 || categories.some(sub => sub.parentId === c.id && (categoryCounts[sub.id!] || 0) > 0);
    return hasProducts;
  });

  const getSubcategories = (parentId: string) => categories.filter(c => {
    const isSub = c.parentId === parentId && c.isActive;
    if (!isSub) return false;
    const subCount = categoryCounts[c.id!] || 0;
    return subCount > 0;
  });
  const selectedCategoryName = categories.find(c => c.id === selectedCategory)?.name || null;

  // Toggle brand in search parameters list
  const handleBrandToggle = (brandName: string) => {
    const normalized = brandName.toLowerCase();
    let nextBrands: string[];
    if (selectedBrands.includes(normalized)) {
      nextBrands = selectedBrands.filter(b => b !== normalized);
    } else {
      nextBrands = [...selectedBrands, normalized];
    }
    updateFilters({ brand: nextBrands });
  };

  const handlePriceFilterApply = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({
      min_price: localMinPrice,
      max_price: localMaxPrice
    });
  };

  const isAnyFilterActive = searchQuery || selectedCategory || selectedBrands.length > 0 || minPrice || maxPrice;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="text-center">
          <Loader2 className="animate-spin text-[#00B4D8] mx-auto mb-4" size={40} />
          <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Syncing Gear Catalog...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F8F9FA] min-h-screen py-12 text-[#1A2B4C]">
      <SEO 
        title="Shop Professional AV Hardware & IP Phones | AV Live"
        description="Browse our extensive collection of IP phones, video conferencing systems, and professional audio visual hardware. Competitive pricing and nationwide delivery."
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: 'Shop' }]} />
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-8 border-b border-gray-200">
          <div>
            <h1 className="text-4xl font-black tracking-tight">Equipment Catalog</h1>
            <p className="text-gray-400 mt-2 font-black uppercase tracking-widest text-[10px]">Industrial Grade AV Hardware</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            {/* Inline Search */}
            <div className="relative shrink-0">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search catalog..." 
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    updateFilters({ q: localSearch });
                  }
                }}
                className="pl-12 pr-10 py-3.5 bg-white border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00B4D8] focus:border-[#00B4D8] transition-all font-bold text-sm w-64 text-[#1A2B4C]"
              />
              {localSearch && (
                <button 
                  onClick={() => {
                    setLocalSearch('');
                    updateFilters({ q: '' });
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Sorting */}
            <div className="relative">
              <select 
                value={sortOption}
                onChange={(e) => updateFilters({ sort: e.target.value })}
                className="appearance-none bg-white border border-gray-200 pl-6 pr-12 py-3.5 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00B4D8] font-black text-[10px] uppercase tracking-widest cursor-pointer text-[#1A2B4C]"
              >
                <option value="featured">Featured Sequence</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest Arrivals</option>
                <option value="popularity">Popularity</option>
                <option value="name-asc">Lexical: A-Z</option>
                <option value="name-desc">Lexical: Z-A</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>

            {/* Grid/List View Toggler */}
            <div className="flex border border-gray-200 bg-white rounded-2xl overflow-hidden shadow-sm p-1 h-[46px] items-center">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-xl transition-all h-full aspect-square flex items-center justify-center ${viewMode === 'grid' ? 'bg-[#1A2B4C] text-white shadow-sm' : 'text-gray-400 hover:text-[#1A2B4C]'}`}
                title="Grid Layout"
              >
                <Grid size={16} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-xl transition-all h-full aspect-square flex items-center justify-center ${viewMode === 'list' ? 'bg-[#1A2B4C] text-white shadow-sm' : 'text-gray-400 hover:text-[#1A2B4C]'}`}
                title="List Layout"
              >
                <List size={16} />
              </button>
            </div>

            {/* Filter Toggle Desktop/Mobile */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`h-[46px] flex items-center gap-2 px-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-sm transition-all border ${
                isSidebarOpen 
                  ? 'bg-[#1A2B4C] text-white border-[#1A2B4C]' 
                  : 'bg-white text-gray-500 border-gray-200 hover:text-[#1A2B4C]'
              }`}
            >
              <Filter size={16} className={isSidebarOpen ? "text-[#00B4D8]" : ""} /> 
              Filters
            </button>
          </div>
        </div>

        {/* Active Filter Chips / Indicators Row */}
        {isAnyFilterActive && (
          <div className="flex flex-wrap items-center gap-3 mb-8 animate-in fade-in slide-in-from-top-1 duration-250">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-1.5 mr-2">
              <SlidersHorizontal size={12} /> Active Criteria:
            </span>
            
            {/* Search Query Chip */}
            {searchQuery && (
              <span className="bg-white border border-[#00B4D8]/20 text-[#1A2B4C] pl-3 pr-2 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm">
                Search: "{searchQuery}"
                <button onClick={() => updateFilters({ q: '' })} className="text-[#00B4D8] hover:text-red-500 rounded-full p-0.5 hover:bg-gray-50">
                  <X size={12} />
                </button>
              </span>
            )}

            {/* Category Chip */}
            {selectedCategory && (
              <span className="bg-white border border-[#00B4D8]/20 text-[#1A2B4C] pl-3 pr-2 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm">
                Classification: {selectedCategoryName || 'Hardware'}
                <button onClick={() => updateFilters({ category: null })} className="text-[#00B4D8] hover:text-red-500 rounded-full p-0.5 hover:bg-gray-50">
                  <X size={12} />
                </button>
              </span>
            )}

            {/* Brands Chips */}
            {selectedBrands.map(brand => {
              const properName = availableBrands.find(b => b.normalized === brand)?.name || brand.toUpperCase();
              return (
                <span key={brand} className="bg-white border border-[#00B4D8]/20 text-[#1A2B4C] pl-3 pr-2 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm">
                  Partner: {properName}
                  <button onClick={() => handleBrandToggle(brand)} className="text-[#00B4D8] hover:text-red-500 rounded-full p-0.5 hover:bg-gray-50">
                    <X size={12} />
                  </button>
                </span>
              );
            })}

            {/* Price Chip */}
            {(minPrice || maxPrice) && (
              <span className="bg-white border border-[#00B4D8]/20 text-[#1A2B4C] pl-3 pr-2 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm">
                Price: {minPrice ? `Rs. ${parseFloat(minPrice).toLocaleString()}` : '0'} - {maxPrice ? `Rs. ${parseFloat(maxPrice).toLocaleString()}` : 'Max'}
                <button onClick={() => updateFilters({ min_price: '', max_price: '' })} className="text-[#00B4D8] hover:text-red-500 rounded-full p-0.5 hover:bg-gray-50">
                  <X size={12} />
                </button>
              </span>
            )}

            {/* Reset All Button */}
            <button 
              onClick={clearAllFilters}
              className="text-[#00B4D8] hover:text-[#1A2B4C] font-black text-[10px] uppercase tracking-widest flex items-center gap-1.5 ml-auto border border-dashed border-[#00B4D8]/30 hover:border-[#1A2B4C] px-4 py-2 rounded-xl transition-all bg-white"
            >
              <RotateCcw size={12} /> Clear Filters
            </button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Sidebar */}
          {isSidebarOpen && (
            <div className="w-full lg:w-56 shrink-0 space-y-6">
              
              {/* Inventory Classification Widget */}
              <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                <h3 className="font-black mb-6 uppercase tracking-[0.2em] text-[10px] text-gray-400">Inventory Classification</h3>
              
              <div className="space-y-1.5">
                {/* All Hardware Button */}
                <button
                  onClick={() => updateFilters({ category: null })}
                  className={`w-full flex items-center justify-between py-2.5 px-3 rounded-xl text-left transition-all ${
                    !selectedCategory 
                      ? 'bg-[#00B4D8]/10 text-[#00B4D8] font-black text-xs uppercase tracking-wider shadow-sm' 
                      : 'text-[#1A2B4C] hover:bg-gray-50 font-bold text-xs uppercase tracking-wider'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {!selectedCategory && <span className="w-1.5 h-1.5 rounded-full bg-[#00B4D8]" />}
                    All Hardware
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${!selectedCategory ? 'bg-[#00B4D8]/20 text-[#00B4D8]' : 'bg-gray-50 text-gray-400'}`}>
                    {products.length}
                  </span>
                </button>

                {/* Parent Categories list */}
                <div className="space-y-1.5 pt-1.5 border-t border-gray-50">
                  {parentCategories.map(parent => {
                    const subs = getSubcategories(parent.id!);
                    const isParentActive = selectedCategory === parent.id;
                    const isSubActive = subs.some(sub => sub.id === selectedCategory);
                    const isExpanded = expandedParents[parent.id!] === true || isParentActive || isSubActive; // defaults to false unless active
                    const parentCount = categoryCounts[parent.id!] || 0;
                    
                    const totalCategoryCount = parentCount + subs.reduce((acc, sub) => acc + (categoryCounts[sub.id!] || 0), 0);

                    return (
                      <div key={parent.id} className="space-y-1">
                        <div className="flex items-center justify-between group">
                          <button
                            onClick={() => updateFilters({ category: parent.id! })}
                            className={`flex-grow flex items-center justify-between py-2 px-3 rounded-xl text-left transition-all ${
                              isParentActive 
                                ? 'bg-[#00B4D8]/10 text-[#00B4D8] font-black text-xs uppercase tracking-wider' 
                                : isSubActive 
                                  ? 'text-[#00B4D8] font-bold text-xs uppercase tracking-wider' 
                                  : 'text-[#1A2B4C] hover:bg-gray-50 font-bold text-xs uppercase tracking-wider'
                            }`}
                          >
                            <span className="flex items-center gap-2 truncate">
                              {isParentActive && <span className="w-1.5 h-1.5 rounded-full bg-[#00B4D8]" />}
                              <span className="truncate">{parent.name}</span>
                            </span>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${isParentActive ? 'bg-[#00B4D8]/20 text-[#00B4D8]' : 'bg-gray-50 text-gray-400'}`}>
                              {totalCategoryCount}
                            </span>
                          </button>

                          {subs.length > 0 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedParents(prev => ({
                                  ...prev,
                                  [parent.id!]: !isExpanded
                                }));
                              }}
                              className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-[#00B4D8] transition-colors ml-0.5 shrink-0"
                            >
                              <ChevronDown 
                                size={14} 
                                className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
                              />
                            </button>
                          )}
                        </div>

                        {/* Subcategories (Hierarchically nested) */}
                        {subs.length > 0 && isExpanded && (
                          <div className="pl-5 pr-1 py-0.5 space-y-1.5 border-l border-gray-100 ml-5 mt-0.5 mb-1.5">
                            {subs.map(sub => {
                              const isChildActive = selectedCategory === sub.id;
                              const childCount = categoryCounts[sub.id!] || 0;
                              return (
                                <button
                                  key={sub.id}
                                  onClick={() => updateFilters({ category: sub.id! })}
                                  className={`w-full flex items-center justify-between py-1 px-2.5 rounded-lg text-left transition-all ${
                                    isChildActive 
                                      ? 'text-[#00B4D8] font-black text-xs bg-[#00B4D8]/5' 
                                      : 'text-gray-500 hover:text-[#1A2B4C] font-semibold text-xs'
                                  }`}
                                >
                                  <span className="flex items-center gap-1.5 truncate">
                                    {isChildActive && <span className="w-1 h-1 rounded-full bg-[#00B4D8]" />}
                                    <span className="truncate">{sub.name}</span>
                                  </span>
                                  <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded-full shrink-0 ${isChildActive ? 'bg-[#00B4D8]/10 text-[#00B4D8]' : 'text-gray-300'}`}>
                                    {childCount}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Hardware Partners (Brand Checkboxes) Widget */}
            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
              <h3 className="font-black mb-6 uppercase tracking-[0.2em] text-[10px] text-gray-400">Hardware Partners</h3>
              
              <div className="space-y-3">
                {availableBrands.map(brand => {
                  const isChecked = selectedBrands.includes(brand.normalized);
                  return (
                    <button 
                      key={brand.normalized}
                      onClick={() => handleBrandToggle(brand.name)}
                      className="w-full flex items-center justify-between group py-1"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${isChecked ? 'bg-[#00B4D8] border-[#00B4D8] text-white' : 'border-gray-300 bg-white group-hover:border-[#00B4D8]'}`}>
                          {isChecked && <Check size={10} strokeWidth={3} />}
                        </div>
                        <span className={`text-xs font-bold uppercase tracking-widest transition-colors ${isChecked ? 'text-[#00B4D8]' : 'text-gray-500 group-hover:text-[#1A2B4C]'}`}>
                          {brand.name}
                        </span>
                      </div>
                      <span className="text-[9px] font-black text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
                        {brand.count}
                      </span>
                    </button>
                  );
                })}
                {availableBrands.length === 0 && (
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest py-2">No active partners for selected criteria</p>
                )}
              </div>
            </div>

            {/* Price Limit Widget */}
            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
              <h3 className="font-black mb-6 uppercase tracking-[0.2em] text-[10px] text-gray-400">Value Limits (Rs.)</h3>
              
              <form onSubmit={handlePriceFilterApply} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Min Limit</label>
                    <input 
                      type="number" 
                      placeholder="0"
                      value={localMinPrice}
                      onChange={(e) => setLocalMinPrice(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#00B4D8] rounded-xl px-3 py-2 text-xs font-bold text-[#1A2B4C]"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Max Limit</label>
                    <input 
                      type="number" 
                      placeholder="Any"
                      value={localMaxPrice}
                      onChange={(e) => setLocalMaxPrice(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#00B4D8] rounded-xl px-3 py-2 text-xs font-bold text-[#1A2B4C]"
                    />
                  </div>
                </div>
                
                <button 
                  type="submit"
                  className="w-full bg-[#1A2B4C] hover:bg-[#00B4D8] text-white text-[10px] font-black uppercase tracking-widest py-3 rounded-xl transition-all shadow-sm active:scale-98"
                >
                  Apply Value Limits
                </button>
              </form>
            </div>

            {/* Quote Sidebar Widget */}
            <div className="bg-[#1A2B4C] p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden group">
              <div className="relative z-10">
                <h4 className="text-sm font-black uppercase tracking-widest mb-4">Design Assistance</h4>
                <p className="text-xs text-gray-400 leading-relaxed mb-6 font-medium">Need a custom technical drawing or volume enterprise discount?</p>
                <Link to="/programs/quote" className="bg-[#00B4D8] text-white px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-[#1A2B4C] transition-all inline-block shadow-md">
                  Request Custom Quote
                </Link>
              </div>
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/5 rounded-full translate-x-8 translate-y-8 group-hover:scale-150 transition-transform duration-700"></div>
            </div>

          </div>
          )}

          {/* Product Grid / List container */}
          <div className="flex-1">
            <div className="mb-6 flex justify-between items-center">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Showing {sortedAndFilteredProducts.length} of {products.length} hardware modules
              </p>
            </div>

            {/* Products container */}
            <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8" : "flex flex-col gap-6"}>
              {sortedAndFilteredProducts.map((product, index) => (
                viewMode === 'grid' ? (
                  // Grid View Card
                  <motion.div 
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="bg-white group cursor-pointer rounded-[2.5rem] overflow-hidden flex flex-col border border-gray-100 hover:border-[#00B4D8] transition-all shadow-sm hover:shadow-2xl"
                  >
                    <Link to={`/product/${product.id}`} className="aspect-square bg-gray-50 overflow-hidden relative block">
                      <img loading="lazy" 
                        src={(Array.isArray(product.images) ? product.images : (typeof product.images === 'string' ? [product.images] : (product.image ? [product.image] : [])))[0] || 'https://placehold.co/600x600?text=No+Image'} 
                        alt={product.productName} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      {product.salePrice < product.regularPrice && (
                        <div className="absolute top-6 left-6 bg-[#00B4D8] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
                          Special Offer
                        </div>
                      )}
                      <button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setQuickViewProduct(product);
                          }}
                          className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm text-[#1A2B4C] px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-[#00B4D8] hover:text-white flex items-center gap-2 z-10"
                        >
                          <Eye size={14} /> Quick View
                        </button>
                      </Link>
                    <div className="p-8 flex flex-col flex-grow">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                           <span className="text-[10px] text-[#00B4D8] font-black uppercase tracking-widest">{product.brand}</span>
                           <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
                           <span className="text-[10px] text-gray-400 font-semibold leading-normal uppercase tracking-widest">{product.sku}</span>
                        </div>
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md ${
                          (product.stockQuantity ?? 0) > 5 
                            ? 'bg-emerald-50 text-emerald-600' 
                            : (product.stockQuantity ?? 0) > 0 
                              ? 'bg-amber-50 text-amber-600' 
                              : 'bg-red-50 text-red-600'
                        }`}>
                          {(product.stockQuantity ?? 0) > 5 
                            ? 'In Stock' 
                            : (product.stockQuantity ?? 0) > 0 
                              ? `Only ${product.stockQuantity} Left` 
                              : 'Built to Order'}
                        </span>
                      </div>

                      {/* Dynamic Star Rating Badge for Grid PLP */}
                      <div className="flex items-center gap-1.5 mb-3">
                        <div className="flex items-center text-amber-500">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={11} fill={i < 4 ? "currentColor" : "none"} className={i < 4 ? "text-amber-500" : "text-gray-200"} />
                          ))}
                        </div>
                        <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider">4.8 (80+ Reviews)</span>
                      </div>

                      <Link to={`/product/${product.id}`} className="block flex-grow">
                        <h3 className="font-black mb-2 leading-tight text-xl text-[#1A2B4C] group-hover:text-[#00B4D8] transition-colors line-clamp-2">{product.productName}</h3>
                      </Link>

                      {/* Search Crawler Friendly Short Description */}
                      <p className="text-gray-500 text-xs font-semibold leading-relaxed line-clamp-2 mb-6" dangerouslySetInnerHTML={{ __html: product.shortDescription || 'Enterprise-grade professional equipment and specialized deployment solutions.' }} />

                      <div className="mt-auto pt-6 flex items-center justify-between border-t border-gray-50">
                        <div className="flex flex-col">
                          <span className="font-black text-2xl text-[#1A2B4C]">Rs. {(product.salePrice ?? 0).toLocaleString()}</span>
                          {product.salePrice < product.regularPrice && (
                            <span className="text-xs text-gray-400 line-through font-bold">Rs. {(product.regularPrice ?? 0).toLocaleString()}</span>
                          )}
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart({
                              id: product.id!,
                              name: product.productName,
                              price: product.salePrice,
                              image: (Array.isArray(product.images) ? product.images : (typeof product.images === 'string' ? [product.images] : (product.image ? [product.image] : [])))[0] || '',
                              brand: product.brand
                            } as any);
                          }}
                          className="bg-[#1A2B4C] text-white w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-[#00B4D8] transition-all shadow-lg active:scale-95 shrink-0"
                        >
                           <Zap size={20} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  // List View Card
                  <motion.div 
                    key={product.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="bg-white group rounded-[2rem] overflow-hidden flex flex-col sm:flex-row border border-gray-100 hover:border-[#00B4D8] transition-all shadow-sm hover:shadow-xl p-6 gap-6"
                  >
                    <Link to={`/product/${product.id}`} className="w-full sm:w-48 h-48 bg-gray-50 rounded-2xl overflow-hidden relative shrink-0 block">
                      <img loading="lazy" 
                        src={(Array.isArray(product.images) ? product.images : (typeof product.images === 'string' ? [product.images] : (product.image ? [product.image] : [])))[0] || 'https://placehold.co/600x600?text=No+Image'} 
                        alt={product.productName} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      {product.salePrice < product.regularPrice && (
                        <div className="absolute top-4 left-4 bg-[#00B4D8] text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-md">
                          Special Offer
                        </div>
                      )}
                      <button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setQuickViewProduct(product);
                          }}
                          className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm text-[#1A2B4C] px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-[#00B4D8] hover:text-white flex items-center gap-1 z-10"
                        >
                          <Eye size={12} /> Quick View
                        </button>
                      </Link>
                    <div className="flex-grow flex flex-col min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-[#00B4D8] font-black uppercase tracking-widest">{product.brand}</span>
                          <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
                          <span className="text-[10px] text-gray-400 font-semibold leading-normal uppercase tracking-widest">{product.sku}</span>
                        </div>
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md ${
                          (product.stockQuantity ?? 0) > 5 
                            ? 'bg-emerald-50 text-emerald-600' 
                            : (product.stockQuantity ?? 0) > 0 
                              ? 'bg-amber-50 text-amber-600' 
                              : 'bg-red-50 text-red-600'
                        }`}>
                          {(product.stockQuantity ?? 0) > 5 
                            ? 'In Stock' 
                            : (product.stockQuantity ?? 0) > 0 
                              ? `Only ${product.stockQuantity} Left` 
                              : 'Built to Order'}
                        </span>
                      </div>

                      {/* Dynamic Star Rating Badge for List PLP */}
                      <div className="flex items-center gap-1.5 mb-2">
                        <div className="flex items-center text-amber-500">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={11} fill={i < 4 ? "currentColor" : "none"} className={i < 4 ? "text-amber-500" : "text-gray-200"} />
                          ))}
                        </div>
                        <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider">4.8 (80+ Reviews)</span>
                      </div>
                      
                      <Link to={`/product/${product.id}`}>
                        <h3 className="font-black text-lg sm:text-xl text-[#1A2B4C] group-hover:text-[#00B4D8] transition-colors mb-2 leading-tight">
                          {product.productName}
                        </h3>
                      </Link>
                      
                      <div className="text-gray-500 text-xs font-semibold line-clamp-3 mb-4" dangerouslySetInnerHTML={{ __html: product.shortDescription || 'Enterprise-grade professional equipment and specialized deployment solutions.' }} />
                      
                      <div className="flex flex-wrap items-center justify-between pt-4 border-t border-gray-50 mt-auto gap-4">
                        <div className="flex items-baseline gap-2">
                          <span className="font-black text-xl text-[#1A2B4C]">Rs. {(product.salePrice ?? 0).toLocaleString()}</span>
                          {product.salePrice < product.regularPrice && (
                            <span className="text-xs text-gray-400 line-through font-bold">Rs. {(product.regularPrice ?? 0).toLocaleString()}</span>
                          )}
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart({
                              id: product.id!,
                              name: product.productName,
                              price: product.salePrice,
                              image: (Array.isArray(product.images) ? product.images : (typeof product.images === 'string' ? [product.images] : (product.image ? [product.image] : [])))[0] || '',
                              brand: product.brand
                            } as any);
                          }}
                          className="bg-[#1A2B4C] text-white h-11 px-6 rounded-xl flex items-center justify-center hover:bg-[#00B4D8] transition-all shadow-md text-xs font-black uppercase tracking-widest gap-2 active:scale-95 shrink-0"
                        >
                          <Zap size={14} /> Add to Cart
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )
              ))}
              
              {sortedAndFilteredProducts.length === 0 && (
                <div className="col-span-full py-16 text-center bg-white rounded-[2.5rem] border border-gray-100 shadow-sm px-6">
                  <div className="w-16 h-16 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search size={30} />
                  </div>
                  <h3 className="text-xl font-black text-[#1A2B4C] mb-2">No Matching Hardware</h3>
                  <p className="text-gray-400 font-medium max-w-sm mx-auto text-sm mb-6">We couldn't find any equipment matching your criteria. Try adjusting or clearing your active filters.</p>
                  <button 
                    onClick={clearAllFilters}
                    className="bg-[#1A2B4C] text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#00B4D8] transition-all shadow-md"
                  >
                    Reset All Criteria
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setQuickViewProduct(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[2.5rem] shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row relative"
          >
            <button 
              onClick={() => setQuickViewProduct(null)}
              className="absolute top-4 right-4 w-10 h-10 bg-gray-100 hover:bg-gray-200 text-[#1A2B4C] rounded-full flex items-center justify-center transition-colors z-10"
            >
              <X size={20} />
            </button>
            
            <div className="w-full md:w-1/2 h-64 md:h-auto bg-gray-50 flex items-center justify-center p-8 shrink-0">
               <img 
                 src={quickViewProduct.images?.[0] || 'https://placehold.co/600x600?text=No+Image'} 
                 alt={quickViewProduct.productName}
                 className="w-full h-full object-contain drop-shadow-xl"
               />
            </div>
            
            <div className="p-8 md:p-10 flex flex-col flex-grow overflow-y-auto">
               <div className="flex items-center gap-2 mb-4">
                  <span className="text-[10px] text-[#00B4D8] font-black uppercase tracking-widest">{quickViewProduct.brand}</span>
                  <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
                  <span className="text-[10px] text-gray-400 font-semibold leading-normal uppercase tracking-widest">{quickViewProduct.sku}</span>
               </div>
               
               <h2 className="text-2xl md:text-3xl font-black text-[#1A2B4C] mb-4 leading-tight">{quickViewProduct.productName}</h2>
               
               <p className="text-gray-500 font-medium text-sm leading-relaxed mb-8 line-clamp-4">
                 {quickViewProduct.shortDescription || quickViewProduct.description}
               </p>
               
               <div className="mt-auto pt-6 border-t border-gray-100 flex flex-col gap-6">
                 <div className="flex items-baseline gap-3">
                   <span className="font-black text-3xl text-[#1A2B4C]">Rs. {quickViewProduct.salePrice?.toLocaleString()}</span>
                   {quickViewProduct.salePrice < quickViewProduct.regularPrice && (
                     <span className="text-sm text-gray-400 line-through font-bold">Rs. {quickViewProduct.regularPrice?.toLocaleString()}</span>
                   )}
                 </div>
                 
                 <div className="flex gap-4">
                   <button 
                     onClick={() => {
                        addToCart({
                          id: quickViewProduct.id,
                          name: quickViewProduct.productName,
                          price: quickViewProduct.salePrice,
                          image: quickViewProduct.images?.[0] || '',
                          brand: quickViewProduct.brand
                        });
                        setQuickViewProduct(null);
                     }}
                     className="flex-1 bg-[#1A2B4C] text-white h-14 rounded-2xl flex items-center justify-center hover:bg-[#00B4D8] transition-all shadow-lg font-black uppercase tracking-widest text-xs gap-2 active:scale-95"
                   >
                     <Zap size={16} /> Add to Cart
                   </button>
                   <Link
                     to={`/product/${quickViewProduct.id}`}
                     className="w-14 h-14 bg-gray-50 text-[#1A2B4C] rounded-2xl flex items-center justify-center hover:bg-gray-100 transition-colors border border-gray-200"
                   >
                     <ArrowRight size={20} />
                   </Link>
                 </div>
               </div>
            </div>
          </motion.div>
        </div>
      )}

      </div>
    </div>
  );
}
