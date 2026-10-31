import React, { useEffect, useState, useMemo, useRef } from 'react';
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
import { Link, useSearchParams, useParams, useLocation } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { subscribeToProducts, subscribeToCategories, Product, Category } from '../lib/firebase/firestore-helpers';
import {
  getCanonicalProductSlug,
  resolveProductPricing,
  PRODUCT_GMC_METADATA,
  buildFallbackProductFromGmcMeta,
} from '../lib/gmc-feed';
import { EXCLUDED_CATEGORY_SLUGS } from '../lib/sitemap-generator';
import { optimizeGalleryImageUrl } from '../lib/image-optimize';
import { SEO } from '../components/SEO';
import { Breadcrumbs } from '../components/Breadcrumbs';

const INITIAL_FALLBACK_SHOP_PRODUCTS: Product[] = (() => {
  const seen = new Set<string>();
  const list: Product[] = [];
  for (const rawKey of Object.keys(PRODUCT_GMC_METADATA)) {
    const slug = getCanonicalProductSlug({ slug: rawKey }, rawKey);
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    const prod = buildFallbackProductFromGmcMeta(slug) as Product | null;
    if (prod) list.push(prod);
  }
  return list;
})();

const FALLBACK_SHOP_CATEGORIES: Category[] = [
  { id: 'video-conferencing', name: 'Video Conferencing', slug: 'video-conferencing', description: 'Enterprise Video Conferencing Systems', parentId: null, displayOrder: 1, isActive: true },
  { id: 'boardroom-codecs', name: 'Boardroom Codecs', slug: 'boardroom-codecs', description: 'Executive Boardroom Codecs', parentId: null, displayOrder: 2, isActive: true },
  { id: 'large-room', name: 'Large Room Systems', slug: 'large-room', description: 'Large Room & Auditorium AV', parentId: null, displayOrder: 3, isActive: true },
  { id: 'ptz-cameras', name: 'PTZ Cameras', slug: 'ptz-cameras', description: '4K Optical PTZ Cameras', parentId: null, displayOrder: 4, isActive: true },
  { id: 'touch-panels', name: 'Touch Panels', slug: 'touch-panels', description: 'Room Touch Controllers & Panels', parentId: null, displayOrder: 5, isActive: true },
  { id: 'speakerphones', name: 'Speakerphones & Mics', slug: 'speakerphones', description: 'Conference Speakerphones & Ceiling Mics', parentId: null, displayOrder: 6, isActive: true },
  { id: 'ip-phones', name: 'IP Phones', slug: 'ip-phones', description: 'SIP & VoIP Executive Desk Phones', parentId: null, displayOrder: 7, isActive: true },
  { id: 'voip-phone-systems', name: 'VoIP PBX & Gateways', slug: 'voip-phone-systems', description: 'Enterprise IP PBX & VoIP Gateways', parentId: null, displayOrder: 8, isActive: true },
  { id: 'headsets', name: 'Enterprise Headsets', slug: 'headsets', description: 'ANC Call Center & UC Headsets', parentId: null, displayOrder: 9, isActive: true },
  { id: 'projectors', name: 'Projectors & Displays', slug: 'projectors', description: 'Laser Projectors & Interactive Displays', parentId: null, displayOrder: 10, isActive: true },
  { id: 'ip-cameras', name: 'IP Security Cameras', slug: 'ip-cameras', description: 'Enterprise IP Surveillance & NVRs', parentId: null, displayOrder: 11, isActive: true },
  { id: 'intercom-paging-access', name: 'PA, Intercom & Access', slug: 'intercom-paging-access', description: 'SIP Intercom, Paging & Access Control', parentId: null, displayOrder: 12, isActive: true },
];

export function Shop() {
  const { addToCart } = useCart();
  const { brandSlug } = useParams<{ brandSlug?: string }>();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>(INITIAL_FALLBACK_SHOP_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(FALLBACK_SHOP_CATEGORIES);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [expandedParents, setExpandedParents] = useState<{[key: string]: boolean}>({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [hoveredProductId, setHoveredProductId] = useState<string | null>(null);
  const [visibleCount, setHoveredVisibleCount] = useState<number>(16);
  const setVisibleCount = setHoveredVisibleCount;
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Sync parameters from URL (/brands/:brandSlug or ?brand=...)
  const searchQuery = searchParams.get('q') || '';
  const selectedCategory = searchParams.get('category') || null;
  const selectedBrands = useMemo(() => {
    const brandParam = searchParams.get('brand');
    const fromQuery = brandParam ? brandParam.split(',').map(b => b.trim().toLowerCase()).filter(Boolean) : [];
    if (brandSlug) {
      const cleanRouteBrand = brandSlug.trim().toLowerCase();
      return Array.from(new Set([cleanRouteBrand, ...fromQuery]));
    }
    return fromQuery;
  }, [searchParams, brandSlug]);
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
      const productOnlyCats = cats.filter(
        c =>
          c.isActive !== false &&
          !EXCLUDED_CATEGORY_SLUGS.has(c.slug) &&
          (!(c as any).type || (c as any).type === 'product')
      );
      if (productOnlyCats.length > 0) {
        setCategories(productOnlyCats);
      }
    });

    const unsubscribeProducts = subscribeToProducts((data) => {
      if (data && data.length > 0) {
        setProducts(data);
      }
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

    // Filter by brand selection (including brand aliases like poly <-> hp poly / polycom)
    if (selectedBrands.length > 0) {
      result = result.filter(p => {
        if (!p.brand) return false;
        const pBrand = p.brand.toLowerCase();
        return selectedBrands.some(sb =>
          pBrand === sb ||
          pBrand.includes(sb) ||
          (sb === 'poly' && (pBrand.includes('poly') || pBrand.includes('plantronics'))) ||
          (sb === 'polycom' && pBrand.includes('poly'))
        );
      });
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

  // Reset progressive batching count when filters change
  useEffect(() => {
    setVisibleCount(16);
  }, [searchQuery, selectedCategory, selectedBrands, minPrice, maxPrice, sortOption]);

  // Progressive IntersectionObserver batch loader for smooth Core Web Vitals
  useEffect(() => {
    const sentinel = loadMoreRef.current;
    if (!sentinel || visibleCount >= sortedAndFilteredProducts.length) return;
    if (typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + 16, sortedAndFilteredProducts.length));
        }
      },
      { rootMargin: '320px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [visibleCount, sortedAndFilteredProducts.length]);

  const visibleProducts = useMemo(
    () => sortedAndFilteredProducts.slice(0, visibleCount),
    [sortedAndFilteredProducts, visibleCount]
  );

  const parentCategories = categories.filter(c => {
    const isProductCategory = !c.parentId && c.isActive && (!(c as any).type || (c as any).type === 'product');
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
  const shouldNoIndexFaceted = Boolean(
    searchQuery || minPrice || maxPrice || (sortOption && sortOption !== 'featured') || selectedBrands.length > 1
  );

  const activeSingleBrandSlug = brandSlug
    ? brandSlug.toLowerCase()
    : selectedBrands.length === 1
      ? selectedBrands[0].toLowerCase()
      : null;

  const activeSingleBrandName = activeSingleBrandSlug
    ? availableBrands.find((b) => b.normalized === activeSingleBrandSlug || b.normalized.includes(activeSingleBrandSlug))?.name ||
      activeSingleBrandSlug.charAt(0).toUpperCase() + activeSingleBrandSlug.slice(1)
    : null;

  const isBrandsIndexPage = location.pathname === '/brands';

  const canonicalShopUrl = activeSingleBrandSlug
    ? `https://avlive.com.pk/brands/${encodeURIComponent(activeSingleBrandSlug)}`
    : isBrandsIndexPage
      ? 'https://avlive.com.pk/brands'
      : 'https://avlive.com.pk/shop';

  const shopSeoTitle = activeSingleBrandName
    ? `${activeSingleBrandName} Video Conferencing & AV Hardware in Pakistan | Official Dealer | AV Live`
    : isBrandsIndexPage
      ? 'Authorized Enterprise AV & Video Conferencing Brands in Pakistan | AV Live'
      : selectedCategoryName
        ? `${selectedCategoryName} | Video Conference in Pakistan & Enterprise AV Shop | AV Live`
        : 'Enterprise AV Shop | Video Conference in Pakistan, Polycom Group 500 & Poly X70 | AV Live';

  const shopSeoDescription = activeSingleBrandName
    ? `Buy genuine ${activeSingleBrandName} video conferencing, IP phones, projectors, and professional AV hardware in Pakistan with official warranty and nationwide delivery.`
    : isBrandsIndexPage
      ? 'Explore official enterprise AV and video conferencing brands in Pakistan: Polycom, HP Poly, Logitech, Cisco, Yealink, Epson, Dahua, Bosch, Jabra, and more.'
      : "Browse Pakistan's largest inventory of Video Conference in Pakistan hardware, Polycom Group 500, Poly Studio X70, Cisco & Yealink IP telephony, and Corporate Event Management gear.";

  const shopSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${canonicalShopUrl}#collection`,
        name: shopSeoTitle,
        description: shopSeoDescription,
        url: canonicalShopUrl,
        isPartOf: { '@id': 'https://avlive.com.pk/#website' },
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: sortedAndFilteredProducts.length,
          itemListElement: sortedAndFilteredProducts.slice(0, 24).map((prod, idx) => {
            const slug = getCanonicalProductSlug(prod);
            const { effectivePrice } = resolveProductPricing(prod);
            return {
              '@type': 'ListItem',
              position: idx + 1,
              url: `https://avlive.com.pk/product/${slug}`,
              name: prod.productName,
              item: {
                '@type': 'Product',
                name: prod.productName,
                url: `https://avlive.com.pk/product/${slug}`,
                brand: { '@type': 'Brand', name: prod.brand || 'AV Live' },
                offers: {
                  '@type': 'Offer',
                  priceCurrency: 'PKR',
                  price: effectivePrice.toFixed(2),
                  availability: 'https://schema.org/InStock',
                },
              },
            };
          }),
        },
      },
    ],
  };

  return (
    <div className="bg-[#F8F9FA] min-h-screen py-12 text-[#1A2B4C]">
      <SEO 
        title={shopSeoTitle}
        description={shopSeoDescription}
        keywords="Video Conference in Pakistan, Video conference, Polycom Group 500, Poly X70, Event management, Corporate event management, hybrid event, Hologram Display, events, AV hardware shop Pakistan"
        url={canonicalShopUrl}
        image="https://avlive.com.pk/og-image.jpg"
        imageAlt="AV Live Communications - Professional AV Equipment Catalog"
        noindex={shouldNoIndexFaceted}
        schema={shopSchema}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={
            activeSingleBrandName
              ? [{ label: 'Brands', path: '/brands' }, { label: activeSingleBrandName }]
              : isBrandsIndexPage
                ? [{ label: 'Brands' }]
                : [{ label: 'Shop' }]
          }
        />
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-8 border-b border-gray-200">
          <div>
            <h1 className="text-4xl font-black tracking-tight">
              {activeSingleBrandName
                ? `${activeSingleBrandName} Video Conferencing & AV Hardware in Pakistan`
                : 'Professional Audio Visual & Video Conferencing Hardware in Pakistan'}
            </h1>
            <p className="text-gray-400 mt-2 font-black uppercase tracking-widest text-[10px]">
              Official Polycom Group 500, Poly X70, Zoom Rooms & Corporate Event Equipment
            </p>
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

        {/* Instant 1-Click Category & Price-Tier Filter Chips Bar */}
        <div className="mb-8 space-y-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            <button
              type="button"
              onClick={() => updateFilters({ category: null })}
              className={`shrink-0 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-wider transition-all border cursor-pointer ${
                !selectedCategory
                  ? 'bg-[#1A2B4C] text-white border-[#1A2B4C] shadow-sm'
                  : 'bg-white text-[#1A2B4C] border-gray-200 hover:border-[#00B4D8] hover:text-[#00B4D8]'
              }`}
            >
              All Hardware ({products.length})
            </button>
            {FALLBACK_SHOP_CATEGORIES.map((cat) => {
              const matchedCat = categories.find(c => c.slug === cat.slug || c.id === cat.id) || cat;
              const catId = matchedCat.id || cat.slug;
              const count = categoryCounts[catId] || categoryCounts[cat.slug] || 0;
              const isActive = selectedCategory === catId || selectedCategory === cat.slug;
              return (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => updateFilters({ category: isActive ? null : catId })}
                  className={`shrink-0 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-wider transition-all border flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-[#00B4D8] text-white border-[#00B4D8] shadow-sm'
                      : 'bg-white text-[#1A2B4C] border-gray-200 hover:border-[#00B4D8] hover:text-[#00B4D8]'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Instant PKR Budget / Price-Tier Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mr-1">Quick Budget Filter:</span>
            {[
              { label: 'All Budgets', min: '', max: '' },
              { label: 'Under Rs. 100k (Phones & Headsets)', min: '', max: '100000' },
              { label: 'Rs. 100k – 500k (Huddle & PTZ)', min: '100000', max: '500000' },
              { label: 'Rs. 500k – 1.5M (Video Bars & PBX)', min: '500000', max: '1500000' },
              { label: 'Rs. 1.5M+ (Boardroom & Codecs)', min: '1500000', max: '' },
            ].map((tier) => {
              const isTierActive = minPrice === tier.min && maxPrice === tier.max;
              return (
                <button
                  key={tier.label}
                  type="button"
                  onClick={() => {
                    setLocalMinPrice(tier.min);
                    setLocalMaxPrice(tier.max);
                    updateFilters({ min_price: tier.min, max_price: tier.max });
                  }}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border cursor-pointer ${
                    isTierActive
                      ? 'bg-[#1A2B4C]/10 text-[#1A2B4C] border-[#1A2B4C]'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-[#00B4D8] hover:text-[#00B4D8]'
                  }`}
                >
                  {tier.label}
                </button>
              );
            })}
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
                {loading
                  ? 'Loading verified hardware inventory...'
                  : `Showing ${sortedAndFilteredProducts.length} of ${products.length} hardware modules`}
              </p>
            </div>

            {loading ? (
              <div className="py-24 flex items-center justify-center bg-white rounded-[2.5rem] border border-gray-100">
                <div className="text-center">
                  <Loader2 className="animate-spin text-[#00B4D8] mx-auto mb-4" size={40} />
                  <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Syncing Gear Catalog...</p>
                </div>
              </div>
            ) : (
            <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8" : "flex flex-col gap-6"}>
              {visibleProducts.map((product, index) => {
                const productSlug = getCanonicalProductSlug(product);
                const productKey = product.id || productSlug;
                const { regularPrice: cardRegularPrice, effectivePrice: cardEffectivePrice, hasSale: cardHasSale } = resolveProductPricing(product);
                const rawImages = Array.isArray(product.images) ? product.images : (typeof product.images === 'string' ? [product.images] : (product.image ? [product.image] : []));
                const firstImage = optimizeGalleryImageUrl(rawImages[0] || 'https://placehold.co/600x600?text=No+Image', 480, 75);
                const secondImage = rawImages[1] ? optimizeGalleryImageUrl(rawImages[1], 480, 75) : null;
                const isEagerCard = index < 4;

                return viewMode === 'grid' ? (
                  // Grid View Card
                  <motion.div 
                    key={productKey}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index, 8) * 0.02 }}
                    onMouseEnter={() => secondImage && setHoveredProductId(productKey)}
                    onMouseLeave={() => secondImage && setHoveredProductId(null)}
                    className="bg-white group cursor-pointer rounded-3xl overflow-hidden flex flex-col border border-gray-100 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-2 relative"
                  >
                    <div className="relative aspect-[4/3] bg-gradient-to-br from-[#1A2B4C]/5 to-[#00B4D8]/10 overflow-hidden">
                      <Link to={`/product/${productSlug}`} className="absolute inset-0 z-0">
                        <img
                          loading={isEagerCard ? 'eager' : 'lazy'}
                          fetchPriority={index < 2 ? 'high' : 'auto'}
                          decoding="async"
                          width={480}
                          height={360}
                          src={firstImage}
                          alt={`Professional AV equipment: ${product.productName} by ${product.brand}`}
                          className={`absolute inset-0 w-full h-full object-cover mix-blend-multiply transition-opacity duration-500 ease-in-out ${secondImage ? 'group-hover:opacity-0' : ''}`}
                        />
                        {secondImage && hoveredProductId === productKey && (
                          <img
                            loading="lazy"
                            decoding="async"
                            width={480}
                            height={360}
                            src={secondImage}
                            alt={`Alternate view of ${product.productName}`}
                            className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-0 transition-opacity duration-500 ease-in-out group-hover:opacity-100 scale-105"
                          />
                        )}
                      </Link>
                      
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/40 backdrop-blur-sm flex items-center justify-center text-[#1A2B4C] hover:bg-[#1A2B4C] hover:text-white transition-colors z-10 shadow-sm"
                      >
                        <Heart size={14} />
                      </button>

                      {cardHasSale && (
                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-[#00B4D8] text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md shadow-sm z-10">
                          Special Offer
                        </div>
                      )}
                    </div>

                    <div className="p-6 flex flex-col flex-grow bg-white z-10 relative">
                      <Link to={`/product/${productSlug}`} className="block">
                        <h3 className="font-bold text-lg text-[#1A2B4C] group-hover:text-[#00B4D8] transition-colors mb-2 line-clamp-1">
                          {product.productName}
                        </h3>
                      </Link>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                         {product.brand && (
                           <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider border border-gray-200 px-2 py-0.5 rounded-sm">
                             {product.brand}
                           </span>
                         )}
                         {product.sku && (
                           <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider border border-gray-200 px-2 py-0.5 rounded-sm">
                             {product.sku}
                           </span>
                         )}
                      </div>

                      <div className="text-gray-500 text-xs font-medium leading-relaxed line-clamp-3 mb-6" dangerouslySetInnerHTML={{ __html: product.shortDescription || 'Enterprise-grade professional equipment and specialized deployment solutions.' }} />
                      
                      <div className="mt-auto flex items-end justify-between gap-4 pt-4 border-t border-gray-50">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Price</span>
                          <div className="flex items-baseline gap-2">
                            <span className="font-black text-xl text-[#1A2B4C]">Rs. {cardEffectivePrice.toLocaleString()}</span>
                            {cardHasSale && (
                              <span className="text-[10px] text-gray-400 line-through font-bold">{cardRegularPrice.toLocaleString()}</span>
                            )}
                          </div>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            addToCart({
                              id: product.id!,
                              name: product.productName,
                              price: cardEffectivePrice,
                              image: firstImage,
                              brand: product.brand
                            } as any);
                          }}
                          className="bg-[#1A2B4C] text-white px-5 py-2.5 rounded-lg text-xs font-bold hover:bg-[#00B4D8] transition-all shadow-md hover:shadow-lg active:scale-95 shrink-0 whitespace-nowrap"
                        >
                           Add to cart
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  // List View Card
                  <motion.div 
                    key={productKey}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index, 8) * 0.02 }}
                    className="bg-white group rounded-[2rem] overflow-hidden flex flex-col sm:flex-row border border-gray-100 hover:border-[#00B4D8] transition-all shadow-sm hover:shadow-xl p-6 gap-6"
                  >
                    <Link to={`/product/${productSlug}`} className="w-full sm:w-48 h-48 bg-gray-50 rounded-2xl overflow-hidden relative shrink-0 block">
                      <img
                        loading={isEagerCard ? 'eager' : 'lazy'}
                        decoding="async"
                        width={320}
                        height={320}
                        src={firstImage}
                        alt={product.productName} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      {cardHasSale && (
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
                      
                      <Link to={`/product/${productSlug}`}>
                        <h3 className="font-black text-lg sm:text-xl text-[#1A2B4C] group-hover:text-[#00B4D8] transition-colors mb-2 leading-tight">
                          {product.productName}
                        </h3>
                      </Link>
                      
                      <div className="text-gray-500 text-xs font-semibold line-clamp-3 mb-4" dangerouslySetInnerHTML={{ __html: product.shortDescription || 'Enterprise-grade professional equipment and specialized deployment solutions.' }} />
                      
                      <div className="flex flex-wrap items-center justify-between pt-4 border-t border-gray-50 mt-auto gap-4">
                        <div className="flex items-baseline gap-2">
                          <span className="font-black text-xl text-[#1A2B4C]">Rs. {cardEffectivePrice.toLocaleString()}</span>
                          {cardHasSale && (
                            <span className="text-xs text-gray-400 line-through font-bold">Rs. {cardRegularPrice.toLocaleString()}</span>
                          )}
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart({
                              id: product.id!,
                              name: product.productName,
                              price: cardEffectivePrice,
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
                );
              })}
              
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
            )}

            {visibleCount < sortedAndFilteredProducts.length && (
              <div ref={loadMoreRef} className="mt-10 flex flex-col items-center justify-center gap-3 py-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Showing {visibleProducts.length} of {sortedAndFilteredProducts.length} hardware modules
                </p>
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => Math.min(prev + 16, sortedAndFilteredProducts.length))}
                  className="bg-white border border-gray-200 hover:border-[#00B4D8] text-[#1A2B4C] hover:text-[#00B4D8] px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-sm cursor-pointer"
                >
                  Load More Hardware ({sortedAndFilteredProducts.length - visibleProducts.length} Remaining)
                </button>
              </div>
            )}
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
                     to={`/product/${getCanonicalProductSlug(quickViewProduct, quickViewProduct.id)}`}
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

      {/* Answer-First Brand & Enterprise Catalog Summary Table for Google & AI Answer Engines */}
      <section className="mt-16 bg-white rounded-[2.5rem] p-8 sm:p-10 border border-gray-100 shadow-sm space-y-6">
        <div className="bg-[#1A2B4C]/5 border-l-4 border-[#00B4D8] rounded-2xl p-5">
          <span className="block text-[10px] font-black uppercase tracking-widest text-[#00B4D8] mb-1">
            Answer-First Procurement Summary
          </span>
          <p className="text-sm sm:text-base font-bold text-[#1A2B4C] leading-relaxed">
            {activeSingleBrandName
              ? `AV Live Communications is Pakistan's authorized enterprise partner for ${activeSingleBrandName}, supplying ${sortedAndFilteredProducts.length} genuine ${activeSingleBrandName} hardware models with official MPN/GTIN verification, FBR GST tax invoicing, and turnkey installation in Lahore, Karachi, and Islamabad.`
              : `AV Live Communications stocks ${sortedAndFilteredProducts.length}+ genuine enterprise video conferencing, VoIP telephony, and pro-AV hardware modules in Pakistan—backed by official 1-to-3 year warranties and nationwide engineering support.`}
          </p>
        </div>

        {sortedAndFilteredProducts.length > 0 && (
          <div className="overflow-x-auto rounded-2xl border border-gray-200">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <caption className="bg-[#1A2B4C] text-white font-black text-left px-5 py-3 text-xs uppercase tracking-wider">
                {activeSingleBrandName ? `${activeSingleBrandName} Official Pakistan Hardware & Price Matrix` : 'Featured Enterprise AV Hardware & Reference Price Matrix (PKR)'}
              </caption>
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-[#1A2B4C] font-black uppercase text-[11px] tracking-wider">
                  <th className="py-3 px-4">Hardware Model</th>
                  <th className="py-3 px-4">Brand</th>
                  <th className="py-3 px-4">Part Number (SKU/MPN)</th>
                  <th className="py-3 px-4">Reference Price (PKR)</th>
                  <th className="py-3 px-4">Pakistan Warranty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedAndFilteredProducts.slice(0, 10).map((prod) => {
                  const slug = getCanonicalProductSlug(prod);
                  const { effectivePrice } = resolveProductPricing(prod);
                  return (
                    <tr key={prod.id || slug} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3 px-4 font-black text-[#1A2B4C]">
                        <Link to={`/product/${slug}`} className="hover:text-[#00B4D8] transition-colors">
                          {prod.productName}
                        </Link>
                      </td>
                      <td className="py-3 px-4 font-bold text-gray-600">{prod.brand}</td>
                      <td className="py-3 px-4 font-mono text-xs text-gray-500">{prod.sku || prod.mpn || 'Official OEM'}</td>
                      <td className="py-3 px-4 font-black text-[#00B4D8]">Rs. {effectivePrice.toLocaleString()}</td>
                      <td className="py-3 px-4 font-bold text-emerald-600">1-Year Official Local Warranty</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      </div>
    </div>
  );
}
