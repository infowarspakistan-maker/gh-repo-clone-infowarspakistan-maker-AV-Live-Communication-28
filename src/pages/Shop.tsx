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
  Eye, ArrowRight, Star, Heart, Plus, Truck,
} from 'lucide-react';
import { Link, useSearchParams, useParams, useLocation } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { subscribeToProducts, subscribeToCategories, Product, Category } from '../lib/firebase/firestore-helpers';
import {
  getCanonicalProductSlug,
  getProductHref,
  resolveProductPricing,
  PRODUCT_GMC_METADATA,
  buildFallbackProductFromGmcMeta,
} from '../lib/gmc-feed';
import { EXCLUDED_CATEGORY_SLUGS } from '../lib/sitemap-generator';
import { optimizeGalleryImageUrl } from '../lib/image-optimize';
import { SEO } from '../components/SEO';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { MobileProductCard } from '../components/MobileProductCard';
import { BlurProductImage } from '../components/BlurProductImage';
import { useCurrency } from '../contexts/CurrencyContext';
import { buildProductImageSeo } from '../lib/image-seo';
import { cleanRichTextHtml } from '../lib/html-sanitize';
import {
  EBAY_ROOM_SIZE_FACETS,
  EBAY_FORM_FACTOR_FACETS,
  EBAY_PRICE_TIERS,
  getProductRoomSizeFacets,
  getProductFormFactorFacets,
  isProductBundleOrKit,
  getProductListingBadges,
} from '../lib/ebay-facets';

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
  const { currency, formatPrice } = useCurrency();
  const { brandSlug } = useParams<{ brandSlug?: string }>();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>(INITIAL_FALLBACK_SHOP_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(FALLBACK_SHOP_CATEGORIES);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [expandedParents, setExpandedParents] = useState<{[key: string]: boolean}>({});
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [brandSearchTerm, setBrandSearchTerm] = useState('');
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [hoveredProductId, setHoveredProductId] = useState<string | null>(null);
  const [visibleCount, setHoveredVisibleCount] = useState<number>(16);
  const setVisibleCount = setHoveredVisibleCount;
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const toggleSection = (key: string) => {
    setCollapsedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

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
  const selectedRooms = useMemo(() => {
    const raw = searchParams.get('room');
    return raw ? raw.split(',').map((s) => s.trim()).filter(Boolean) : [];
  }, [searchParams]);
  const selectedTypes = useMemo(() => {
    const raw = searchParams.get('type');
    return raw ? raw.split(',').map((s) => s.trim()).filter(Boolean) : [];
  }, [searchParams]);
  const listingTab = (searchParams.get('tab') || 'all') as 'all' | 'sale' | 'bundles' | 'free-shipping';
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
    room?: string[] | null;
    type?: string[] | null;
    tab?: string | null;
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

      if (updates.room !== undefined) {
        if (updates.room && updates.room.length > 0) next.set('room', updates.room.join(','));
        else next.delete('room');
      }

      if (updates.type !== undefined) {
        if (updates.type && updates.type.length > 0) next.set('type', updates.type.join(','));
        else next.delete('type');
      }

      if (updates.tab !== undefined) {
        if (updates.tab && updates.tab !== 'all') next.set('tab', updates.tab);
        else next.delete('tab');
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
    setBrandSearchTerm('');
  };

  // Base products filtered by category & search query for contextual facet counts
  const categoryAndSearchProducts = useMemo(() => {
    let base = [...products];
    if (selectedCategory) {
      const cat = categories.find(c => c.id === selectedCategory || c.slug === selectedCategory);
      base = base.filter(p =>
        p.categoryIds?.includes(selectedCategory) ||
        (Array.isArray(p.categorySlugs) ? p.categorySlugs : (typeof p.categorySlugs === 'string' ? [p.categorySlugs] : [])).includes(cat?.slug || selectedCategory)
      );
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      base = base.filter(p =>
        (p.productName || (p as any).name || '').toLowerCase().includes(q) ||
        (p.brand || '').toLowerCase().includes(q) ||
        (p.sku || '').toLowerCase().includes(q) ||
        (p.mpn || '').toLowerCase().includes(q) ||
        (p.gtin || '').toLowerCase().includes(q) ||
        (p.gmcId || '').toLowerCase().includes(q)
      );
    }
    return base;
  }, [products, selectedCategory, categories, searchQuery]);

  // 1. Calculate available brands with contextual counts
  const availableBrands = useMemo(() => {
    const byNormalized = new Map<string, { name: string; count: number; normalized: string }>();
    categoryAndSearchProducts.forEach(p => {
      const raw = (p.brand || 'Other').trim() || 'Other';
      const normalized = raw.toLowerCase();
      const existing = byNormalized.get(normalized);
      if (existing) {
        existing.count += 1;
      } else {
        byNormalized.set(normalized, { name: raw, count: 1, normalized });
      }
    });

    return Array.from(byNormalized.values()).sort(
      (a, b) => b.count - a.count || a.name.localeCompare(b.name)
    );
  }, [categoryAndSearchProducts]);

  // 2. Calculate Room Size & Form Factor aspect counts
  const roomFacetCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    categoryAndSearchProducts.forEach((p) => {
      getProductRoomSizeFacets(p).forEach((rId) => {
        counts[rId] = (counts[rId] || 0) + 1;
      });
    });
    return counts;
  }, [categoryAndSearchProducts]);

  const formFactorCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    categoryAndSearchProducts.forEach((p) => {
      getProductFormFactorFacets(p).forEach((tId) => {
        counts[tId] = (counts[tId] || 0) + 1;
      });
    });
    return counts;
  }, [categoryAndSearchProducts]);

  // 3. Listing Format tab counts
  const tabCounts = useMemo(() => {
    let sale = 0;
    let bundles = 0;
    let freeShipping = 0;
    categoryAndSearchProducts.forEach((p) => {
      const { effectivePrice, hasSale } = resolveProductPricing(p);
      if (hasSale) sale++;
      if (isProductBundleOrKit(p)) bundles++;
      if (effectivePrice >= 100000) freeShipping++;
    });
    return {
      all: categoryAndSearchProducts.length,
      sale,
      bundles,
      freeShipping,
    };
  }, [categoryAndSearchProducts]);

  // 4. Calculate category counts
  const categoryCounts = useMemo(() => {
    const counts: { [catId: string]: number } = {};
    products.forEach(p => {
      const idsToCount = new Set<string>();
      p.categoryIds?.forEach(id => idsToCount.add(id));
      const slugs = Array.isArray(p.categorySlugs) ? p.categorySlugs : (typeof p.categorySlugs === 'string' ? [p.categorySlugs] : []);
      slugs.forEach(slug => {
        idsToCount.add(slug);
        const cat = categories.find(c => c.slug === slug);
        if (cat && cat.id) idsToCount.add(cat.id);
      });
      idsToCount.forEach(id => {
        counts[id] = (counts[id] || 0) + 1;
      });
    });
    return counts;
  }, [products, categories]);

  // 5. Main Sorted and Filtered Products List
  const sortedAndFilteredProducts = useMemo(() => {
    let result = [...categoryAndSearchProducts];

    // Filter by listing format tab
    if (listingTab === 'sale') {
      result = result.filter((p) => resolveProductPricing(p).hasSale);
    } else if (listingTab === 'bundles') {
      result = result.filter((p) => isProductBundleOrKit(p));
    } else if (listingTab === 'free-shipping') {
      result = result.filter((p) => resolveProductPricing(p).effectivePrice >= 100000);
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

    // Filter by Room Size / Deployment Environment aspect
    if (selectedRooms.length > 0) {
      result = result.filter((p) => {
        const pRooms = getProductRoomSizeFacets(p);
        return selectedRooms.some((r) => pRooms.includes(r));
      });
    }

    // Filter by Form Factor / Product Type aspect
    if (selectedTypes.length > 0) {
      result = result.filter((p) => {
        const pTypes = getProductFormFactorFacets(p);
        return selectedTypes.some((t) => pTypes.includes(t));
      });
    }

    // Filter by min price
    if (minPrice) {
      const minVal = parseFloat(minPrice);
      if (!isNaN(minVal)) {
        result = result.filter(p => resolveProductPricing(p).effectivePrice >= minVal);
      }
    }

    // Filter by max price
    if (maxPrice) {
      const maxVal = parseFloat(maxPrice);
      if (!isNaN(maxVal)) {
        result = result.filter(p => resolveProductPricing(p).effectivePrice <= maxVal);
      }
    }

    // Sort products
    switch (sortOption) {
      case 'price-low':
        result.sort((a, b) => resolveProductPricing(a).effectivePrice - resolveProductPricing(b).effectivePrice);
        break;
      case 'price-high':
        result.sort((a, b) => resolveProductPricing(b).effectivePrice - resolveProductPricing(a).effectivePrice);
        break;
      case 'savings':
        result.sort((a, b) => {
          const savA = getProductListingBadges(a).savingsAmount;
          const savB = getProductListingBadges(b).savingsAmount;
          return savB - savA;
        });
        break;
      case 'newest':
        result.sort((a, b) => {
          const ggnA = String(a.gmcId || '').startsWith('GGN-CS-') ? 1 : 0;
          const ggnB = String(b.gmcId || '').startsWith('GGN-CS-') ? 1 : 0;
          if (ggnB !== ggnA) return ggnB - ggnA;
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
  }, [categoryAndSearchProducts, listingTab, selectedBrands, selectedRooms, selectedTypes, minPrice, maxPrice, sortOption]);

  // Reset progressive batching count when filters change
  useEffect(() => {
    setVisibleCount(16);
  }, [searchQuery, selectedCategory, selectedBrands, selectedRooms, selectedTypes, listingTab, minPrice, maxPrice, sortOption]);

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
    const parentCount = categoryCounts[c.id!] || categoryCounts[c.slug] || 0;
    const hasProducts = parentCount > 0 || categories.some(sub => sub.parentId === c.id && (categoryCounts[sub.id!] || 0) > 0);
    return hasProducts;
  });

  const getSubcategories = (parentId: string) => categories.filter(c => {
    const isSub = c.parentId === parentId && c.isActive;
    if (!isSub) return false;
    const subCount = categoryCounts[c.id!] || 0;
    return subCount > 0;
  });
  const selectedCategoryName =
    categories.find(c => c.id === selectedCategory || c.slug === selectedCategory)?.name ||
    FALLBACK_SHOP_CATEGORIES.find(c => c.slug === selectedCategory)?.name ||
    null;

  // Toggle helpers
  const handleBrandToggle = (brandName: string) => {
    const normalized = brandName.toLowerCase();
    const nextBrands = selectedBrands.includes(normalized)
      ? selectedBrands.filter(b => b !== normalized)
      : [...selectedBrands, normalized];
    updateFilters({ brand: nextBrands });
  };

  const handleRoomToggle = (roomId: string) => {
    const nextRooms = selectedRooms.includes(roomId)
      ? selectedRooms.filter(r => r !== roomId)
      : [...selectedRooms, roomId];
    updateFilters({ room: nextRooms });
  };

  const handleTypeToggle = (typeId: string) => {
    const nextTypes = selectedTypes.includes(typeId)
      ? selectedTypes.filter(t => t !== typeId)
      : [...selectedTypes, typeId];
    updateFilters({ type: nextTypes });
  };

  const handlePriceFilterApply = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({
      min_price: localMinPrice,
      max_price: localMaxPrice
    });
  };

  const isAnyFilterActive = Boolean(
    searchQuery ||
    selectedCategory ||
    selectedBrands.length > 0 ||
    selectedRooms.length > 0 ||
    selectedTypes.length > 0 ||
    listingTab !== 'all' ||
    minPrice ||
    maxPrice
  );
  const shouldNoIndexFaceted = Boolean(
    searchQuery ||
    minPrice ||
    maxPrice ||
    selectedRooms.length > 0 ||
    selectedTypes.length > 0 ||
    listingTab !== 'all' ||
    (sortOption && sortOption !== 'featured') ||
    selectedBrands.length > 1
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
    ? `${activeSingleBrandName} Official Dealer & Price in Pakistan | AV Live`
    : isBrandsIndexPage
      ? 'Authorized Enterprise AV Brands in Pakistan | AV Live'
      : selectedCategoryName
        ? `${selectedCategoryName} Price in Pakistan | Enterprise AV Store | AV Live`
        : 'Enterprise AV Shop | Poly, Logitech & Cisco | AV Live';

  const shopSeoDescription = activeSingleBrandName
    ? `Buy genuine ${activeSingleBrandName} video conferencing, IP phones, projectors, and professional AV hardware in Pakistan with official warranty and nationwide delivery.`
    : isBrandsIndexPage
      ? 'Browse official enterprise hardware by authorized brand in Pakistan: HP Poly, Cisco, Logitech, Yealink, Jabra, Bosch, Hikvision, Dahua & Epson.'
      : 'Buy genuine video conferencing hardware in Pakistan: Polycom Group 500, Poly Studio X70, Logitech Rally Bar, Cisco Room Kits & Yealink IP phones.';

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
            const prodHref = getProductHref(prod, prod.id);
            const { effectivePrice } = resolveProductPricing(prod);
            const rawImg = (Array.isArray(prod.images) && prod.images[0]) || prod.imageUrl || (prod as any).image || 'https://avlive.com.pk/og-image.jpg';
            const absImg = String(rawImg).startsWith('http') ? String(rawImg) : `https://avlive.com.pk${String(rawImg).startsWith('/') ? '' : '/'}${rawImg}`;
            return {
              '@type': 'ListItem',
              position: idx + 1,
              url: `https://avlive.com.pk${prodHref}`,
              name: prod.productName,
              item: {
                '@type': 'Product',
                name: prod.productName,
                image: [absImg],
                description: prod.shortDescription?.replace(/<[^>]*>?/gm, '') || `${prod.productName} by ${prod.brand || 'AV Live'} in Pakistan.`,
                sku: prod.mpn || prod.sku || prod.slug,
                mpn: prod.mpn || prod.sku || prod.slug,
                url: `https://avlive.com.pk${prodHref}`,
                brand: { '@type': 'Brand', name: prod.brand || 'AV Live' },
                offers: {
                  '@type': 'Offer',
                  url: `https://avlive.com.pk${prodHref}`,
                  priceCurrency: 'PKR',
                  price: effectivePrice.toFixed(2),
                  validFrom: '2026-01-01',
                  priceValidUntil: '2027-12-31',
                  itemCondition: 'https://schema.org/NewCondition',
                  availability: 'https://schema.org/InStock',
                  shippingDetails: {
                    '@type': 'OfferShippingDetails',
                    shippingRate: {
                      '@type': 'MonetaryAmount',
                      value: effectivePrice >= 100000 ? '0.00' : '1500.00',
                      currency: 'PKR',
                    },
                    shippingDestination: {
                      '@type': 'DefinedRegion',
                      addressCountry: 'PK',
                    },
                    deliveryTime: {
                      '@type': 'ShippingDeliveryTime',
                      handlingTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 1, unitCode: 'DAY' },
                      transitTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 5, unitCode: 'DAY' },
                    },
                  },
                  hasMerchantReturnPolicy: {
                    '@type': 'MerchantReturnPolicy',
                    applicableCountry: 'PK',
                    returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
                    merchantReturnDays: 30,
                    returnMethod: 'https://schema.org/ReturnByMail',
                    returnFees: 'https://schema.org/FreeReturn',
                  },
                },
              },
            };
          }),
        },
      },
      ...(activeSingleBrandName
        ? [
            {
              '@type': 'FAQPage',
              '@id': `${canonicalShopUrl}#faq`,
              mainEntity: [
                {
                  '@type': 'Question',
                  name: `Is AV Live an authorized ${activeSingleBrandName} partner in Pakistan?`,
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: `Yes. AV Live Communications supplies genuine, factory-sealed ${activeSingleBrandName} hardware in Pakistan with official manufacturer part numbers (MPNs), GS1 GTIN verification, FBR GST tax invoicing, and a 1-to-3 year local warranty.`,
                  },
                },
                {
                  '@type': 'Question',
                  name: `Does AV Live provide ${activeSingleBrandName} installation in Lahore, Karachi, and Islamabad?`,
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: `Yes. Our regional engineering teams in Lahore (Johar Town), Karachi (Clifton), and Islamabad (Blue Area) provide on-site boardroom installation, acoustic tuning, and SLA support for all ${activeSingleBrandName} systems.`,
                  },
                },
                {
                  '@type': 'Question',
                  name: `How quickly can ${activeSingleBrandName} equipment be delivered in Pakistan?`,
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: `In-stock ${activeSingleBrandName} hardware ships within 24 to 72 hours across Lahore, Karachi, and Islamabad via insured logistics, with complimentary shipping on orders above Rs. 100,000 PKR.`,
                  },
                },
              ],
            },
          ]
        : []),
    ],
  };

  const filteredBrandList = useMemo(() => {
    if (!brandSearchTerm.trim()) return availableBrands;
    const q = brandSearchTerm.toLowerCase();
    return availableBrands.filter((b) => b.name.toLowerCase().includes(q));
  }, [availableBrands, brandSearchTerm]);

  const renderSidebarFacets = () => (
    <div className="space-y-4">
      {/* 1. Category / Department Hierarchy */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('category')}
          className="w-full flex items-center justify-between px-4 py-3.5 bg-gray-50/70 border-b border-gray-100 text-left cursor-pointer"
        >
          <span className="font-black text-[11px] uppercase tracking-wider text-[#1A2B4C]">
            Category / Department
          </span>
          <ChevronDown
            size={15}
            className={`text-gray-400 transition-transform ${collapsedSections['category'] ? '-rotate-90' : ''}`}
          />
        </button>
        {!collapsedSections['category'] && (
          <div className="p-3 space-y-1">
            <button
              type="button"
              onClick={() => updateFilters({ category: null })}
              className={`w-full flex items-center justify-between py-1.5 px-2.5 rounded-lg text-left transition-all cursor-pointer ${
                !selectedCategory
                  ? 'bg-[#1A2B4C] text-white font-black text-xs'
                  : 'text-[#1A2B4C] hover:bg-gray-100 font-semibold text-xs'
              }`}
            >
              <span>All Categories</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${!selectedCategory ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                {products.length}
              </span>
            </button>

            {parentCategories.map((parent) => {
              const subs = getSubcategories(parent.id!);
              const isParentActive = selectedCategory === parent.id || selectedCategory === parent.slug;
              const isSubActive = subs.some((sub) => sub.id === selectedCategory);
              const isExpanded = expandedParents[parent.id!] === true || isParentActive || isSubActive;
              const parentCount = categoryCounts[parent.id!] || categoryCounts[parent.slug] || 0;
              const totalCategoryCount = parentCount + subs.reduce((acc, sub) => acc + (categoryCounts[sub.id!] || 0), 0);

              return (
                <div key={parent.id || parent.slug} className="space-y-0.5">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => updateFilters({ category: isParentActive ? null : parent.id || parent.slug })}
                      className={`flex-1 flex items-center justify-between py-1.5 px-2.5 rounded-lg text-left transition-all cursor-pointer ${
                        isParentActive
                          ? 'bg-[#00B4D8]/15 text-[#0088A8] font-black text-xs'
                          : 'text-gray-700 hover:bg-gray-50 font-semibold text-xs'
                      }`}
                    >
                      <span className="truncate pr-1">{parent.name}</span>
                      <span className="text-[10px] font-bold text-gray-400 shrink-0">({totalCategoryCount})</span>
                    </button>
                    {subs.length > 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedParents((prev) => ({
                            ...prev,
                            [parent.id!]: !isExpanded,
                          }))
                        }
                        aria-label={`Expand ${parent.name}`}
                        className="p-1 text-gray-400 hover:text-[#1A2B4C]"
                      >
                        <ChevronDown size={13} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>
                    )}
                  </div>
                  {subs.length > 0 && isExpanded && (
                    <div className="pl-3 ml-2 border-l border-gray-200 space-y-0.5">
                      {subs.map((sub) => {
                        const isChildActive = selectedCategory === sub.id;
                        return (
                          <button
                            key={sub.id}
                            type="button"
                            onClick={() => updateFilters({ category: isChildActive ? null : sub.id! })}
                            className={`w-full flex items-center justify-between py-1 px-2 rounded-md text-left text-xs cursor-pointer ${
                              isChildActive ? 'text-[#00B4D8] font-black' : 'text-gray-500 hover:text-[#1A2B4C] font-medium'
                            }`}
                          >
                            <span className="truncate">{sub.name}</span>
                            <span className="text-[10px] text-gray-400">({categoryCounts[sub.id!] || 0})</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Brand / OEM Manufacturer (Searchable Checkboxes like eBay) */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('brand')}
          className="w-full flex items-center justify-between px-4 py-3.5 bg-gray-50/70 border-b border-gray-100 text-left cursor-pointer"
        >
          <span className="font-black text-[11px] uppercase tracking-wider text-[#1A2B4C]">
            Brand / Manufacturer
          </span>
          <ChevronDown
            size={15}
            className={`text-gray-400 transition-transform ${collapsedSections['brand'] ? '-rotate-90' : ''}`}
          />
        </button>
        {!collapsedSections['brand'] && (
          <div className="p-3 space-y-2.5">
            {availableBrands.length > 5 && (
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={brandSearchTerm}
                  onChange={(e) => setBrandSearchTerm(e.target.value)}
                  placeholder="Find a brand..."
                  aria-label="Filter brands"
                  className="w-full pl-7 pr-6 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-[#1A2B4C] focus:outline-none focus:border-[#00B4D8]"
                />
                {brandSearchTerm && (
                  <button
                    type="button"
                    onClick={() => setBrandSearchTerm('')}
                    aria-label="Clear brand search"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            )}
            <div className="max-h-56 overflow-y-auto pr-1 space-y-1">
              {filteredBrandList.map((brand) => {
                const isChecked = selectedBrands.includes(brand.normalized);
                return (
                  <button
                    key={brand.normalized}
                    type="button"
                    onClick={() => handleBrandToggle(brand.name)}
                    className="w-full flex items-center justify-between py-1 px-1.5 rounded-lg hover:bg-gray-50 group cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                          isChecked
                            ? 'bg-[#1A2B4C] border-[#1A2B4C] text-white'
                            : 'border-gray-300 bg-white group-hover:border-[#00B4D8]'
                        }`}
                      >
                        {isChecked && <Check size={11} strokeWidth={3} />}
                      </span>
                      <span className={`text-xs truncate ${isChecked ? 'font-black text-[#1A2B4C]' : 'font-semibold text-gray-700'}`}>
                        {brand.name}
                      </span>
                    </span>
                    <span className="text-[11px] font-semibold text-gray-400 shrink-0">({brand.count})</span>
                  </button>
                );
              })}
              {filteredBrandList.length === 0 && (
                <p className="text-xs text-gray-400 py-2 text-center">No matching brand</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 3. Room Size & Deployment Environment (eBay Aspect Filter) */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('room')}
          className="w-full flex items-center justify-between px-4 py-3.5 bg-gray-50/70 border-b border-gray-100 text-left cursor-pointer"
        >
          <span className="font-black text-[11px] uppercase tracking-wider text-[#1A2B4C]">
            Room Size &amp; Environment
          </span>
          <ChevronDown
            size={15}
            className={`text-gray-400 transition-transform ${collapsedSections['room'] ? '-rotate-90' : ''}`}
          />
        </button>
        {!collapsedSections['room'] && (
          <div className="p-3 space-y-1">
            {EBAY_ROOM_SIZE_FACETS.map((facet) => {
              const count = roomFacetCounts[facet.id] || 0;
              const isChecked = selectedRooms.includes(facet.id);
              return (
                <button
                  key={facet.id}
                  type="button"
                  onClick={() => handleRoomToggle(facet.id)}
                  className="w-full flex items-center justify-between py-1.5 px-1.5 rounded-lg hover:bg-gray-50 group text-left cursor-pointer"
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                        isChecked
                          ? 'bg-[#1A2B4C] border-[#1A2B4C] text-white'
                          : 'border-gray-300 bg-white group-hover:border-[#00B4D8]'
                      }`}
                    >
                      {isChecked && <Check size={11} strokeWidth={3} />}
                    </span>
                    <span className={`text-xs leading-snug ${isChecked ? 'font-black text-[#1A2B4C]' : 'font-semibold text-gray-700'}`}>
                      {facet.shortLabel || facet.label}
                    </span>
                  </span>
                  <span className="text-[11px] font-semibold text-gray-400 shrink-0">({count})</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Product Type / Hardware Form Factor (eBay Aspect Filter) */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('type')}
          className="w-full flex items-center justify-between px-4 py-3.5 bg-gray-50/70 border-b border-gray-100 text-left cursor-pointer"
        >
          <span className="font-black text-[11px] uppercase tracking-wider text-[#1A2B4C]">
            Product Type / Form Factor
          </span>
          <ChevronDown
            size={15}
            className={`text-gray-400 transition-transform ${collapsedSections['type'] ? '-rotate-90' : ''}`}
          />
        </button>
        {!collapsedSections['type'] && (
          <div className="p-3 space-y-1">
            {EBAY_FORM_FACTOR_FACETS.map((facet) => {
              const count = formFactorCounts[facet.id] || 0;
              const isChecked = selectedTypes.includes(facet.id);
              return (
                <button
                  key={facet.id}
                  type="button"
                  onClick={() => handleTypeToggle(facet.id)}
                  className="w-full flex items-center justify-between py-1.5 px-1.5 rounded-lg hover:bg-gray-50 group text-left cursor-pointer"
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                        isChecked
                          ? 'bg-[#1A2B4C] border-[#1A2B4C] text-white'
                          : 'border-gray-300 bg-white group-hover:border-[#00B4D8]'
                      }`}
                    >
                      {isChecked && <Check size={11} strokeWidth={3} />}
                    </span>
                    <span className={`text-xs leading-snug ${isChecked ? 'font-black text-[#1A2B4C]' : 'font-semibold text-gray-700'}`}>
                      {facet.shortLabel || facet.label}
                    </span>
                  </span>
                  <span className="text-[11px] font-semibold text-gray-400 shrink-0">({count})</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Price Range & eBay Quick Price Tiers */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('price')}
          className="w-full flex items-center justify-between px-4 py-3.5 bg-gray-50/70 border-b border-gray-100 text-left cursor-pointer"
        >
          <span className="font-black text-[11px] uppercase tracking-wider text-[#1A2B4C]">
            Price Range (PKR)
          </span>
          <ChevronDown
            size={15}
            className={`text-gray-400 transition-transform ${collapsedSections['price'] ? '-rotate-90' : ''}`}
          />
        </button>
        {!collapsedSections['price'] && (
          <div className="p-3 space-y-3">
            <div className="space-y-1">
              {EBAY_PRICE_TIERS.map((tier) => {
                const isSelected = minPrice === tier.min && maxPrice === tier.max;
                return (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => {
                      setLocalMinPrice(tier.min);
                      setLocalMaxPrice(tier.max);
                      updateFilters({ min_price: tier.min, max_price: tier.max });
                    }}
                    className="w-full flex items-center gap-2.5 py-1 px-1.5 rounded-lg hover:bg-gray-50 text-left cursor-pointer"
                  >
                    <span
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected ? 'border-[#1A2B4C]' : 'border-gray-300'
                      }`}
                    >
                      {isSelected && <span className="w-2 h-2 rounded-full bg-[#1A2B4C]" />}
                    </span>
                    <span className={`text-xs ${isSelected ? 'font-black text-[#1A2B4C]' : 'font-semibold text-gray-700'}`}>
                      {tier.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <form onSubmit={handlePriceFilterApply} className="pt-2 border-t border-gray-100 flex items-center gap-1.5">
              <input
                type="number"
                placeholder="Min"
                aria-label="Minimum price in PKR"
                value={localMinPrice}
                onChange={(e) => setLocalMinPrice(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#1A2B4C] focus:outline-none focus:border-[#00B4D8]"
              />
              <span className="text-xs text-gray-400 font-bold">to</span>
              <input
                type="number"
                placeholder="Max"
                aria-label="Maximum price in PKR"
                value={localMaxPrice}
                onChange={(e) => setLocalMaxPrice(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#1A2B4C] focus:outline-none focus:border-[#00B4D8]"
              />
              <button
                type="submit"
                aria-label="Apply price range"
                className="px-3 py-1.5 bg-[#1A2B4C] hover:bg-[#00B4D8] text-white rounded-lg text-xs font-black transition-colors shrink-0 cursor-pointer"
              >
                Go
              </button>
            </form>
          </div>
        )}
      </div>

      {/* 6. Buying Format, Condition & Shipping Options */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('condition')}
          className="w-full flex items-center justify-between px-4 py-3.5 bg-gray-50/70 border-b border-gray-100 text-left cursor-pointer"
        >
          <span className="font-black text-[11px] uppercase tracking-wider text-[#1A2B4C]">
            Condition &amp; Delivery
          </span>
          <ChevronDown
            size={15}
            className={`text-gray-400 transition-transform ${collapsedSections['condition'] ? '-rotate-90' : ''}`}
          />
        </button>
        {!collapsedSections['condition'] && (
          <div className="p-3 space-y-1.5">
            <button
              type="button"
              onClick={() => updateFilters({ tab: listingTab === 'sale' ? 'all' : 'sale' })}
              className="w-full flex items-center justify-between py-1 px-1.5 rounded-lg hover:bg-gray-50 text-left cursor-pointer"
            >
              <span className="flex items-center gap-2.5">
                <span
                  className={`w-4 h-4 rounded border flex items-center justify-center ${
                    listingTab === 'sale' ? 'bg-[#1A2B4C] border-[#1A2B4C] text-white' : 'border-gray-300 bg-white'
                  }`}
                >
                  {listingTab === 'sale' && <Check size={11} strokeWidth={3} />}
                </span>
                <span className="text-xs font-semibold text-gray-700">Special Offers &amp; Deals</span>
              </span>
              <span className="text-[11px] font-semibold text-gray-400">({tabCounts.sale})</span>
            </button>

            <button
              type="button"
              onClick={() => updateFilters({ tab: listingTab === 'bundles' ? 'all' : 'bundles' })}
              className="w-full flex items-center justify-between py-1 px-1.5 rounded-lg hover:bg-gray-50 text-left cursor-pointer"
            >
              <span className="flex items-center gap-2.5">
                <span
                  className={`w-4 h-4 rounded border flex items-center justify-center ${
                    listingTab === 'bundles' ? 'bg-[#1A2B4C] border-[#1A2B4C] text-white' : 'border-gray-300 bg-white'
                  }`}
                >
                  {listingTab === 'bundles' && <Check size={11} strokeWidth={3} />}
                </span>
                <span className="text-xs font-semibold text-gray-700">Complete Room Bundles</span>
              </span>
              <span className="text-[11px] font-semibold text-gray-400">({tabCounts.bundles})</span>
            </button>

            <button
              type="button"
              onClick={() => updateFilters({ tab: listingTab === 'free-shipping' ? 'all' : 'free-shipping' })}
              className="w-full flex items-center justify-between py-1 px-1.5 rounded-lg hover:bg-gray-50 text-left cursor-pointer"
            >
              <span className="flex items-center gap-2.5">
                <span
                  className={`w-4 h-4 rounded border flex items-center justify-center ${
                    listingTab === 'free-shipping' ? 'bg-[#1A2B4C] border-[#1A2B4C] text-white' : 'border-gray-300 bg-white'
                  }`}
                >
                  {listingTab === 'free-shipping' && <Check size={11} strokeWidth={3} />}
                </span>
                <span className="text-xs font-semibold text-gray-700">Free Nationwide Shipping</span>
              </span>
              <span className="text-[11px] font-semibold text-gray-400">({tabCounts.freeShipping})</span>
            </button>

            <div className="flex items-center justify-between py-1 px-1.5 text-left opacity-90">
              <span className="flex items-center gap-2.5">
                <span className="w-4 h-4 rounded border bg-emerald-600 border-emerald-600 text-white flex items-center justify-center">
                  <Check size={11} strokeWidth={3} />
                </span>
                <span className="text-xs font-semibold text-gray-700">New (Factory Sealed OEM)</span>
              </span>
              <span className="text-[11px] font-semibold text-gray-400">({categoryAndSearchProducts.length})</span>
            </div>
          </div>
        )}
      </div>

      {/* B2B Quote Assistance Box */}
      <div className="bg-[#1A2B4C] p-5 rounded-2xl text-white shadow-md">
        <span className="text-[9px] font-black uppercase tracking-widest text-[#00B4D8] block mb-1">
          Enterprise BOQ &amp; Tenders
        </span>
        <h4 className="text-xs font-black uppercase tracking-wider mb-1.5">Need Volume Project Pricing?</h4>
        <p className="text-[11px] text-gray-300 leading-relaxed mb-3.5">
          Request an FBR GST tax invoice, PPRA tender authorization letter, or 3D acoustic room design.
        </p>
        <div className="flex flex-col gap-2">
          <Link
            to="/programs/quote"
            className="bg-[#00B4D8] hover:bg-white hover:text-[#1A2B4C] text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all text-center"
          >
            Request Custom BOQ
          </Link>
          <Link
            to="/room-designer"
            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all text-center"
          >
            3D Room Designer
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-[#F8F9FA] min-h-screen py-3 lg:py-6 text-[#1A2B4C]">
      <SEO 
        title={shopSeoTitle}
        description={shopSeoDescription}
        keywords="Video Conference in Pakistan, Video conference, Polycom Group 500, Poly X70, Cisco Codec Pro, Cisco Room Bar, Event management, Corporate event management, hybrid event, AV hardware shop Pakistan"
        url={canonicalShopUrl}
        image="https://avlive.com.pk/og-image.jpg"
        imageAlt="AV Live Communications - Professional AV Equipment Catalog"
        noindex={shouldNoIndexFaceted}
        schema={shopSchema}
      />
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
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
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3 mb-4 pb-3 border-b border-gray-200">
          <div className="min-w-0 flex-1">
            <h1 className="w-full max-w-4xl text-xl sm:text-2xl lg:text-3xl leading-tight font-black tracking-tight text-[#1A2B4C]">
              {activeSingleBrandName
                ? `${activeSingleBrandName} Video Conferencing & AV Hardware in Pakistan`
                : selectedCategoryName
                  ? `${selectedCategoryName} — Official Pakistan Store`
                  : 'Professional Audio Visual & Video Conferencing Hardware in Pakistan'}
            </h1>
            <p className="text-gray-600 mt-1 font-bold uppercase tracking-wider text-xs">
              Authorized Cisco Webex, HP Poly (Polycom), Logitech, Yealink &amp; Commercial Pro-AV Catalog • GS1 GTIN Verified
            </p>
          </div>

          {/* eBay-Style Search Bar in Header */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateFilters({ q: localSearch });
            }}
            className="flex items-center gap-2 w-full lg:w-auto"
          >
            <div className="relative flex-1 lg:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
              <input
                type="text"
                placeholder="Search by model, MPN (e.g. CS-CODEC-PRO-K9), or GTIN..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full pl-9 pr-8 h-10 bg-white border border-gray-300 rounded-xl shadow-xs focus:outline-none focus:ring-2 focus:ring-[#00B4D8] focus:border-[#00B4D8] font-semibold text-xs text-[#1A2B4C]"
              />
              {localSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setLocalSearch('');
                    updateFilters({ q: '' });
                  }}
                  aria-label="Clear search query"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="h-10 px-4 bg-[#1A2B4C] hover:bg-[#00B4D8] text-white rounded-xl font-black text-xs uppercase tracking-wider transition-colors shrink-0 cursor-pointer"
            >
              Search
            </button>
          </form>
        </div>

        {/* Authorized Brand Hub Executive Engineering Summary (SSR-to-CSR Parity on /brands/:brandSlug) */}
        {activeSingleBrandName && (
          <div className="mb-4 bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#00B4D8]">
                Authorized {activeSingleBrandName} Enterprise Partner &amp; Systems Integrator — Pakistan
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full w-fit">
                PTA Compliant • FBR GST Invoice • 1–3 Year Local Warranty
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-[#1A2B4C] leading-relaxed">
              AV Live Communications supplies genuine <strong>{activeSingleBrandName}</strong> hardware across Lahore, Karachi, and Islamabad. Every unit includes verified OEM MPN and GS1 GTIN identifiers, official local warranty coverage, and turnkey boardroom or network integration by our certified engineering teams.
            </p>
          </div>
        )}

        {/* Featured Poly Studio X50 4K + TC8 Special Offer Banner Associated with Brochure Popup */}
        {(!activeSingleBrandSlug || activeSingleBrandSlug.includes('poly')) && (
          <div className="mb-4 rounded-2xl overflow-hidden border border-[#141816]/15 shadow-sm grid grid-cols-1 lg:grid-cols-[1.35fr_0.65fr] bg-[#c7f5c7] text-[#141816]">
            <div className="p-4 sm:p-5 flex flex-col justify-center">
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-wider mb-1.5">
                <span className="bg-[#141816] text-[#c7f5c7] px-2 py-0.5 rounded">SPECIAL OFFER • SAVE 53%</span>
                <span className="bg-emerald-800 text-white px-2 py-0.5 rounded inline-flex items-center gap-1">
                  <Truck size={11} /> FREE DELIVERY IN PAKISTAN
                </span>
                <span className="text-[#2d3831] font-extrabold">MPN: 2215-86399-001</span>
              </div>
              <div className="flex flex-wrap items-baseline gap-3 mb-1.5">
                <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-[#141816]">
                  Poly Studio X50 4K + TC8 Touch Controller Bundle
                </h2>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl sm:text-2xl font-black text-[#141816]">PKR 399,000</span>
                  <span className="text-xs font-bold text-[#d9383a] line-through">PKR 850,000</span>
                </div>
              </div>
              <p className="text-xs text-[#2d3831] font-medium mb-3 max-w-2xl">
                Complete medium-to-large conference room 4K UltraHD video bar with Poly DirectorAI auto-framing, stereo speakers, 8&quot; PoE TC8 touch panel, and free insured delivery across Pakistan.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  to="/product/poly-studio-x50-tc8-special-offer-pakistan"
                  className="bg-[#141816] hover:bg-[#28302c] text-white px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 transition-colors"
                >
                  Buy Now / View Deal <ArrowRight size={13} />
                </Link>
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent('open-poly-x50-offer'))}
                  className="bg-white hover:bg-gray-50 text-[#141816] border border-[#141816]/25 px-3.5 py-2 rounded-lg text-[11px] font-black uppercase tracking-wider cursor-pointer transition-colors"
                >
                  Open Interactive Deal Brochure
                </button>
              </div>
            </div>
            <div className="bg-white p-3 sm:p-4 flex items-center justify-center border-t lg:border-t-0 lg:border-l border-gray-200">
              <Link
                to="/product/poly-studio-x50-tc8-special-offer-pakistan"
                className="flex items-center gap-3 group"
              >
                <img
                  src="https://firebasestorage.googleapis.com/v0/b/studio-5367437135-24ac6.firebasestorage.app/o/Products%2Fpoly-studio-x50-png-3cq9.webp?alt=media&token=bc3614ec-64f7-405b-95df-7a793acd7563"
                  alt="Poly Studio X50 4K Video Bar + TC8 Controller Deal Pakistan"
                  title="Poly Studio X50 4K + TC8 Special Offer — PKR 399,000"
                  width={180}
                  height={144}
                  className="w-28 sm:w-36 h-auto object-contain group-hover:scale-105 transition-transform"
                />
                <div className="text-left">
                  <span className="block text-[10px] font-black uppercase tracking-wider text-emerald-700">In Stock • Ready to Ship</span>
                  <span className="block text-xs font-black text-[#141816] group-hover:text-[#00B4D8] transition-colors">Dual 4K Display Support</span>
                  <span className="block text-[10px] font-semibold text-gray-500">1-Year Official Warranty</span>
                </div>
              </Link>
            </div>
          </div>
        )}

        {/* Quick Department Pill Strip */}
        <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-1.5 no-scrollbar">
          <button
            type="button"
            onClick={() => updateFilters({ category: null })}
            className={`shrink-0 px-3.5 py-2 min-h-[36px] rounded-full text-xs font-black uppercase tracking-wider transition-all border cursor-pointer ${
              !selectedCategory
                ? 'bg-[#1A2B4C] text-white border-[#1A2B4C] shadow-xs'
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
                className={`shrink-0 px-3.5 py-2 min-h-[36px] rounded-full text-xs font-black uppercase tracking-wider transition-all border flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-[#00B4D8] text-white border-[#00B4D8] shadow-xs'
                    : 'bg-white text-[#1A2B4C] border-gray-200 hover:border-[#00B4D8] hover:text-[#00B4D8]'
                }`}
              >
                <span>{cat.name}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Mobile Slide-Over Filter Drawer (< 1024px) */}
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
              onClick={() => setIsMobileFilterOpen(false)}
            />
            <div className="relative z-10 w-80 max-w-[88vw] bg-[#F8F9FA] h-full overflow-y-auto p-4 shadow-2xl flex flex-col">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={16} className="text-[#00B4D8]" />
                  <span className="font-black text-sm text-[#1A2B4C] uppercase tracking-wider">Filter &amp; Sort</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  aria-label="Close filters"
                  className="p-1.5 rounded-lg bg-white border border-gray-200 text-gray-600"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">{renderSidebarFacets()}</div>
              <div className="pt-3 mt-3 border-t border-gray-200 flex gap-2 bg-[#F8F9FA]">
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="flex-1 py-2.5 rounded-xl border border-gray-300 bg-white text-xs font-black text-gray-700"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#1A2B4C] text-white text-xs font-black"
                >
                  Show {sortedAndFilteredProducts.length} Results
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main eBay-Style 2-Column Layout: Persistent Left Aspect Sidebar + Right Results Area */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Desktop Persistent Left Aspect Filter Sidebar */}
          <aside className="hidden lg:block lg:w-64 shrink-0 sticky top-20">
            <div className="flex items-center justify-between mb-2.5 px-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#1A2B4C] flex items-center gap-1.5">
                <SlidersHorizontal size={13} className="text-[#00B4D8]" /> Refine Results
              </span>
              {isAnyFilterActive && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-[11px] font-bold text-[#00B4D8] hover:underline cursor-pointer"
                >
                  Reset all
                </button>
              )}
            </div>
            {renderSidebarFacets()}
          </aside>

          {/* Right Column: eBay Top Control Bar + Active Aspect Pills + Product Grid/List */}
          <div className="flex-1 min-w-0 w-full">
            {/* eBay-Style Top Control Bar (Buying Format Tabs + Result Counter + Sort + View Mode) */}
            <div className="bg-white rounded-2xl border border-gray-200 p-3 sm:p-4 mb-4 shadow-xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100">
                {/* eBay Buying Format / Availability Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {[
                    { id: 'all', label: 'All Listings', count: tabCounts.all },
                    { id: 'sale', label: 'Special Offers', count: tabCounts.sale },
                    { id: 'bundles', label: 'Room Kits & Bundles', count: tabCounts.bundles },
                    { id: 'free-shipping', label: 'Free Shipping', count: tabCounts.freeShipping },
                  ].map((tab) => {
                    const isTabActive = listingTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => updateFilters({ tab: tab.id })}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer border ${
                          isTabActive
                            ? 'bg-[#1A2B4C] text-white border-[#1A2B4C]'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-[#1A2B4C]'
                        }`}
                      >
                        {tab.label} <span className="text-[10px] opacity-80">({tab.count})</span>
                      </button>
                    );
                  })}
                </div>

                {/* Sort & View Controls */}
                <div className="flex items-center gap-2 ml-auto">
                  {/* Mobile Filter Drawer Trigger */}
                  <button
                    type="button"
                    onClick={() => setIsMobileFilterOpen(true)}
                    className="lg:hidden h-9 px-3 rounded-xl bg-[#1A2B4C] text-white font-black text-[11px] flex items-center gap-1.5"
                  >
                    <Filter size={13} /> Filters
                  </button>

                  <div className="flex items-center gap-1.5">
                    <span className="hidden sm:inline text-[11px] font-bold text-gray-500">Sort:</span>
                    <div className="relative">
                      <select
                        value={sortOption}
                        onChange={(e) => updateFilters({ sort: e.target.value })}
                        aria-label="Sort products"
                        className="h-9 appearance-none bg-gray-50 border border-gray-200 pl-3 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B4D8] font-bold text-xs cursor-pointer text-[#1A2B4C]"
                      >
                        <option value="featured">Best Match (Featured)</option>
                        <option value="price-low">Price: Lowest First</option>
                        <option value="price-high">Price: Highest First</option>
                        <option value="savings">Biggest Savings (PKR Off)</option>
                        <option value="newest">Newly Listed (Cisco &amp; Poly)</option>
                        <option value="name-asc">Model Name: A–Z</option>
                        <option value="name-desc">Model Name: Z–A</option>
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                    </div>
                  </div>

                  {/* Grid / List View Toggler */}
                  <div className="flex border border-gray-200 bg-gray-50 rounded-xl overflow-hidden p-0.5 h-9 items-center">
                    <button
                      type="button"
                      onClick={() => setViewMode('grid')}
                      aria-label="Grid view"
                      className={`p-1.5 rounded-lg transition-all h-full aspect-square flex items-center justify-center cursor-pointer ${
                        viewMode === 'grid' ? 'bg-[#1A2B4C] text-white shadow-xs' : 'text-gray-500 hover:text-[#1A2B4C]'
                      }`}
                      title="Gallery Grid View"
                    >
                      <Grid size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('list')}
                      aria-label="List view"
                      className={`p-1.5 rounded-lg transition-all h-full aspect-square flex items-center justify-center cursor-pointer ${
                        viewMode === 'list' ? 'bg-[#1A2B4C] text-white shadow-xs' : 'text-gray-500 hover:text-[#1A2B4C]'
                      }`}
                      title="eBay Detailed List View"
                    >
                      <List size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Result Counter & Quick Brand Filter Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <p className="font-bold text-gray-600">
                  Showing <span className="font-black text-[#1A2B4C]">{sortedAndFilteredProducts.length}</span> verified enterprise results
                  {selectedCategoryName ? (
                    <>
                      {' '}in <span className="font-black text-[#00B4D8]">{selectedCategoryName}</span>
                    </>
                  ) : null}
                </p>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-bold text-gray-400 mr-1">Quick OEM:</span>
                  {[
                    { label: 'Cisco', slug: 'cisco' },
                    { label: 'HP Poly', slug: 'poly' },
                    { label: 'Logitech', slug: 'logitech' },
                    { label: 'Yealink', slug: 'yealink' },
                    { label: 'Bosch', slug: 'bosch' },
                  ].map((oem) => {
                    const active = selectedBrands.includes(oem.slug);
                    return (
                      <button
                        key={oem.slug}
                        type="button"
                        onClick={() => handleBrandToggle(oem.slug)}
                        className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold border transition-all cursor-pointer ${
                          active
                            ? 'bg-[#00B4D8] text-white border-[#00B4D8]'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-[#00B4D8]'
                        }`}
                      >
                        {oem.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Aspect Filter Pills Row */}
              {isAnyFilterActive && (
                <div className="pt-2.5 border-t border-gray-100 flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 mr-1">
                    Active Aspects:
                  </span>

                  {searchQuery && (
                    <span className="bg-gray-100 text-[#1A2B4C] pl-2.5 pr-1.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1">
                      Keyword: &ldquo;{searchQuery}&rdquo;
                      <button type="button" onClick={() => updateFilters({ q: '' })} className="hover:text-red-600 p-0.5">
                        <X size={12} />
                      </button>
                    </span>
                  )}

                  {selectedCategory && (
                    <span className="bg-gray-100 text-[#1A2B4C] pl-2.5 pr-1.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1">
                      Dept: {selectedCategoryName || selectedCategory}
                      <button type="button" onClick={() => updateFilters({ category: null })} className="hover:text-red-600 p-0.5">
                        <X size={12} />
                      </button>
                    </span>
                  )}

                  {listingTab !== 'all' && (
                    <span className="bg-gray-100 text-[#1A2B4C] pl-2.5 pr-1.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1">
                      Format: {listingTab}
                      <button type="button" onClick={() => updateFilters({ tab: 'all' })} className="hover:text-red-600 p-0.5">
                        <X size={12} />
                      </button>
                    </span>
                  )}

                  {selectedBrands.map((brand) => {
                    const properName = availableBrands.find((b) => b.normalized === brand)?.name || brand.toUpperCase();
                    return (
                      <span key={brand} className="bg-gray-100 text-[#1A2B4C] pl-2.5 pr-1.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1">
                        Brand: {properName}
                        <button type="button" onClick={() => handleBrandToggle(brand)} className="hover:text-red-600 p-0.5">
                          <X size={12} />
                        </button>
                      </span>
                    );
                  })}

                  {selectedRooms.map((roomId) => {
                    const label = EBAY_ROOM_SIZE_FACETS.find((r) => r.id === roomId)?.shortLabel || roomId;
                    return (
                      <span key={roomId} className="bg-gray-100 text-[#1A2B4C] pl-2.5 pr-1.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1">
                        Room: {label}
                        <button type="button" onClick={() => handleRoomToggle(roomId)} className="hover:text-red-600 p-0.5">
                          <X size={12} />
                        </button>
                      </span>
                    );
                  })}

                  {selectedTypes.map((typeId) => {
                    const label = EBAY_FORM_FACTOR_FACETS.find((t) => t.id === typeId)?.shortLabel || typeId;
                    return (
                      <span key={typeId} className="bg-gray-100 text-[#1A2B4C] pl-2.5 pr-1.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1">
                        Type: {label}
                        <button type="button" onClick={() => handleTypeToggle(typeId)} className="hover:text-red-600 p-0.5">
                          <X size={12} />
                        </button>
                      </span>
                    );
                  })}

                  {(minPrice || maxPrice) && (
                    <span className="bg-gray-100 text-[#1A2B4C] pl-2.5 pr-1.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1">
                      Price: {minPrice ? `Rs. ${parseFloat(minPrice).toLocaleString()}` : '0'} – {maxPrice ? `Rs. ${parseFloat(maxPrice).toLocaleString()}` : 'Max'}
                      <button
                        type="button"
                        onClick={() => {
                          setLocalMinPrice('');
                          setLocalMaxPrice('');
                          updateFilters({ min_price: '', max_price: '' });
                        }}
                        className="hover:text-red-600 p-0.5"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="text-[#00B4D8] hover:text-[#1A2B4C] font-black text-[11px] flex items-center gap-1 ml-auto cursor-pointer"
                  >
                    <RotateCcw size={12} /> Clear All
                  </button>
                </div>
              )}
            </div>

            {/* Product Results Grid or eBay Detailed Horizontal List */}
            {loading ? (
              <div className="py-24 flex items-center justify-center bg-white rounded-3xl border border-gray-200">
                <div className="text-center">
                  <Loader2 className="animate-spin text-[#00B4D8] mx-auto mb-4" size={40} />
                  <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Syncing Gear Catalog...</p>
                </div>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-5' : 'flex flex-col gap-4'}>
                {visibleProducts.map((product, index) => {
                  const productSlug = getCanonicalProductSlug(product);
                  const productHref = getProductHref(product, product.id);
                  const productKey = product.id || productSlug;
                  const { regularPrice: cardRegularPrice, effectivePrice: cardEffectivePrice, hasSale: cardHasSale } = resolveProductPricing(product);
                  const badges = getProductListingBadges(product);
                  const rawImages = Array.isArray(product.images) ? product.images : (typeof product.images === 'string' ? [product.images] : (product.image ? [product.image] : []));
                  const firstImage = optimizeGalleryImageUrl(rawImages[0] || '/images/products/poly-x70-studio.webp', 480, 75);
                  const secondImage = rawImages[1] ? optimizeGalleryImageUrl(rawImages[1], 480, 75) : null;
                  const primarySeo = buildProductImageSeo(product, rawImages[0], 0);
                  const secondarySeo = secondImage ? buildProductImageSeo(product, rawImages[1], 1) : null;
                  const isEagerCard = index < 4;

                  return viewMode === 'grid' ? (
                    <React.Fragment key={productKey}>
                      <div className="lg:hidden">
                        <MobileProductCard
                          product={product}
                          eager={isEagerCard}
                          priority={index < 2}
                        />
                      </div>
                      <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(index, 8) * 0.02 }}
                        onMouseEnter={() => secondImage && setHoveredProductId(productKey)}
                        onMouseLeave={() => secondImage && setHoveredProductId(null)}
                        className="hidden lg:flex bg-white group rounded-2xl overflow-hidden flex-col border border-gray-200 hover:border-[#00B4D8] transition-all duration-300 shadow-xs hover:shadow-xl relative"
                      >
                        <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden p-4">
                          <Link to={productHref} className="absolute inset-0 z-0 flex items-center justify-center p-4">
                            <BlurProductImage
                              loading={isEagerCard ? 'eager' : 'lazy'}
                              fetchPriority={index < 2 ? 'high' : 'auto'}
                              decoding="async"
                              width={480}
                              height={360}
                              src={firstImage}
                              seed={productSlug}
                              title={primarySeo.title}
                              alt={primarySeo.alt}
                              className={`w-full h-full object-contain mix-blend-multiply transition-opacity duration-500 ${secondImage ? 'group-hover:opacity-0' : ''}`}
                            />
                            {secondImage && secondarySeo && hoveredProductId === productKey && (
                              <img
                                loading="lazy"
                                decoding="async"
                                width={480}
                                height={360}
                                src={secondImage}
                                title={secondarySeo.title}
                                alt={secondarySeo.alt}
                                className="absolute inset-0 w-full h-full object-contain p-4 mix-blend-multiply opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                              />
                            )}
                          </Link>

                          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
                            {cardHasSale && badges.savingsPercent > 0 && (
                              <span className="bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shadow-xs">
                                Save {badges.savingsPercent}%
                              </span>
                            )}
                            {badges.isBundle && (
                              <span className="bg-[#1A2B4C] text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shadow-xs">
                                Complete Kit
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setQuickViewProduct(product);
                            }}
                            aria-label={`Quick view ${product.productName}`}
                            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 hover:bg-[#1A2B4C] text-[#1A2B4C] hover:text-white flex items-center justify-center transition-colors z-10 shadow-xs cursor-pointer"
                            title="Quick View"
                          >
                            <Eye size={14} />
                          </button>
                        </div>

                        <div className="p-4 flex flex-col flex-grow bg-white border-t border-gray-100">
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="text-[10px] font-black uppercase tracking-wider text-[#0088A8]">
                              {product.brand || 'Enterprise AV'}
                            </span>
                            {badges.mpn && (
                              <span className="text-[10px] font-mono font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                {badges.mpn}
                              </span>
                            )}
                          </div>

                          <Link to={productHref} className="block mb-2">
                            <h3 className="font-bold text-sm text-[#1A2B4C] group-hover:text-[#00B4D8] transition-colors line-clamp-2 leading-snug min-h-[2.5rem]">
                              {product.productName}
                            </h3>
                          </Link>

                          {/* eBay-Style Item Specifics Pill Row */}
                          <div className="flex flex-wrap gap-1 mb-3">
                            <span className="text-[10px] font-semibold text-gray-600 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded">
                              Brand New
                            </span>
                            {badges.productTypeLabel && (
                              <span className="text-[10px] font-semibold text-gray-600 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded truncate max-w-[140px]">
                                {badges.productTypeLabel}
                              </span>
                            )}
                            {badges.roomLabel && (
                              <span className="text-[10px] font-semibold text-[#1A2B4C] bg-[#00B4D8]/10 px-2 py-0.5 rounded truncate max-w-[130px]">
                                {badges.roomLabel}
                              </span>
                            )}
                          </div>

                          <div className="mt-auto pt-3 border-t border-gray-100">
                            <div className="flex items-baseline gap-2 mb-1">
                              <span className="font-black text-lg text-[#1A2B4C]">
                                {formatPrice(cardEffectivePrice)}
                              </span>
                              {cardHasSale && (
                                <span className="text-xs text-gray-400 line-through font-semibold">
                                  {formatPrice(cardRegularPrice)}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center justify-between text-[11px] text-gray-500 font-semibold mb-3">
                              <span className="text-emerald-700 font-bold">
                                {badges.isFreeShipping ? 'Free Insured PK Shipping' : '+ Standard Delivery'}
                              </span>
                              <span>In Stock</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  addToCart({
                                    id: product.id || productSlug,
                                    name: product.productName,
                                    price: cardEffectivePrice,
                                    image: firstImage,
                                    brand: product.brand,
                                  } as any);
                                }}
                                aria-label={`Add ${product.productName} to cart`}
                                className="flex-1 bg-[#1A2B4C] hover:bg-[#00B4D8] text-white py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-colors text-center cursor-pointer"
                              >
                                Add to Cart
                              </button>
                              <Link
                                to={productHref}
                                className="py-2 px-3 rounded-xl border border-gray-200 hover:border-[#1A2B4C] text-xs font-bold text-[#1A2B4C] transition-colors"
                              >
                                Specs
                              </Link>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </React.Fragment>
                  ) : (
                    /* eBay-Style Detailed Horizontal List Row */
                    <motion.div
                      key={productKey}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(index, 8) * 0.02 }}
                      className="bg-white group rounded-2xl overflow-hidden flex flex-col sm:flex-row border border-gray-200 hover:border-[#00B4D8] transition-all shadow-xs hover:shadow-md p-4 sm:p-5 gap-5"
                    >
                      <Link
                        to={productHref}
                        className="w-full sm:w-48 h-44 bg-gray-50 rounded-xl overflow-hidden relative shrink-0 flex items-center justify-center p-3 border border-gray-100"
                      >
                        <BlurProductImage
                          loading={isEagerCard ? 'eager' : 'lazy'}
                          decoding="async"
                          width={320}
                          height={320}
                          src={firstImage}
                          seed={productSlug}
                          title={primarySeo.title}
                          alt={primarySeo.alt}
                          className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                        />
                        {cardHasSale && badges.savingsPercent > 0 && (
                          <span className="absolute top-2.5 left-2.5 bg-rose-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded shadow-xs">
                            Save {badges.savingsPercent}%
                          </span>
                        )}
                      </Link>

                      <div className="flex-1 flex flex-col min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-[11px] font-black uppercase tracking-wider text-[#0088A8]">
                            {product.brand}
                          </span>
                          {badges.mpn && (
                            <span className="text-[11px] font-mono font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                              MPN: {badges.mpn}
                            </span>
                          )}
                          {badges.gtin && (
                            <span className="text-[10px] font-mono text-gray-400">
                              GTIN: {badges.gtin}
                            </span>
                          )}
                        </div>

                        <Link to={productHref}>
                          <h3 className="font-black text-base sm:text-lg text-[#1A2B4C] group-hover:text-[#00B4D8] transition-colors mb-1.5 leading-snug">
                            {product.productName}
                          </h3>
                        </Link>

                        <div className="flex flex-wrap items-center gap-2 mb-2 text-xs text-gray-600 font-semibold">
                          <span>Brand New (Factory Sealed)</span>
                          <span>•</span>
                          <span>{badges.productTypeLabel}</span>
                          {badges.roomLabel && (
                            <>
                              <span>•</span>
                              <span className="text-[#1A2B4C] font-bold">{badges.roomLabel}</span>
                            </>
                          )}
                        </div>

                        <div
                          className="text-gray-500 text-xs font-medium line-clamp-2 mb-3"
                          dangerouslySetInnerHTML={{
                            __html: cleanRichTextHtml(
                              product.shortDescription ||
                                'Genuine enterprise audio-visual & unified communications hardware with 1-year Pakistan warranty.'
                            ),
                          }}
                        />

                        <div className="mt-auto pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
                          <div>
                            <div className="flex items-baseline gap-2">
                              <span className="font-black text-xl text-[#1A2B4C]">
                                {formatPrice(cardEffectivePrice)}
                              </span>
                              {cardHasSale && (
                                <span className="text-xs text-gray-400 line-through font-bold">
                                  {formatPrice(cardRegularPrice)}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] font-bold text-emerald-700 mt-0.5">
                              {badges.isFreeShipping
                                ? 'Free Insured Nationwide Shipping • Immediate Dispatch'
                                : 'In Stock in Pakistan • 1-Year Official Warranty'}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setQuickViewProduct(product)}
                              className="h-10 px-3.5 rounded-xl border border-gray-200 hover:border-[#1A2B4C] text-xs font-bold text-[#1A2B4C] flex items-center gap-1.5 cursor-pointer"
                            >
                              <Eye size={14} /> Quick View
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                addToCart({
                                  id: product.id || productSlug,
                                  name: product.productName,
                                  price: cardEffectivePrice,
                                  image: firstImage,
                                  brand: product.brand,
                                } as any)
                              }
                              className="bg-[#1A2B4C] hover:bg-[#00B4D8] text-white h-10 px-5 rounded-xl flex items-center justify-center transition-all text-xs font-black uppercase tracking-wider gap-1.5 cursor-pointer"
                            >
                              <Zap size={14} /> Add to Cart
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                {sortedAndFilteredProducts.length === 0 && (
                  <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-gray-200 shadow-xs px-6">
                    <div className="w-14 h-14 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Search size={26} />
                    </div>
                    <h3 className="text-lg font-black text-[#1A2B4C] mb-1">No Exact Matches Found</h3>
                    <p className="text-gray-500 font-medium max-w-md mx-auto text-xs mb-5">
                      No hardware matched all selected eBay aspect filters. Remove one or more filters to broaden your search.
                    </p>
                    <button
                      type="button"
                      onClick={clearAllFilters}
                      className="bg-[#1A2B4C] text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider hover:bg-[#00B4D8] transition-all cursor-pointer"
                    >
                      Reset All Filters
                    </button>
                  </div>
                )}
              </div>
            )}

            {visibleCount < sortedAndFilteredProducts.length && (
              <div ref={loadMoreRef} className="mt-8 flex flex-col items-center justify-center gap-2.5 py-4">
                <p className="text-xs font-bold text-gray-500">
                  Showing {visibleProducts.length} of {sortedAndFilteredProducts.length} listings
                </p>
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => Math.min(prev + 16, sortedAndFilteredProducts.length))}
                  className="bg-white border border-gray-300 hover:border-[#00B4D8] text-[#1A2B4C] hover:text-[#00B4D8] px-7 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-xs cursor-pointer"
                >
                  Show More Listings ({sortedAndFilteredProducts.length - visibleProducts.length} Remaining)
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
               {(() => {
                 const qvSeo = buildProductImageSeo(quickViewProduct, quickViewProduct.images?.[0], 0);
                 return (
                   <img 
                     src={quickViewProduct.images?.[0] || '/images/products/poly-x70-studio.webp'} 
                     title={qvSeo.title}
                     alt={qvSeo.alt}
                     className="w-full h-full object-contain drop-shadow-xl"
                   />
                 );
               })()}
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
                   <span className="font-black text-3xl text-[#1A2B4C]">{formatPrice(quickViewProduct.salePrice || quickViewProduct.regularPrice || 0)}</span>
                   {quickViewProduct.salePrice < quickViewProduct.regularPrice && (
                     <span className="text-sm text-gray-400 line-through font-bold">{formatPrice(quickViewProduct.regularPrice || 0)}</span>
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
                     to={getProductHref(quickViewProduct, quickViewProduct.id)}
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
                  <th className="py-3 px-4">Reference Price ({currency})</th>
                  <th className="py-3 px-4">Pakistan Warranty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedAndFilteredProducts.slice(0, 10).map((prod) => {
                  const slug = getCanonicalProductSlug(prod);
                  const prodHref = getProductHref(prod, prod.id);
                  const { effectivePrice } = resolveProductPricing(prod);
                  return (
                    <tr key={prod.id || slug} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3 px-4 font-black text-[#1A2B4C]">
                        <Link to={prodHref} className="hover:text-[#00B4D8] transition-colors">
                          {prod.productName}
                        </Link>
                      </td>
                      <td className="py-3 px-4 font-bold text-gray-600">{prod.brand}</td>
                      <td className="py-3 px-4 font-mono text-xs text-gray-500">{prod.sku || prod.mpn || 'Official OEM'}</td>
                      <td className="py-3 px-4 font-black text-[#00B4D8]">{formatPrice(effectivePrice)}</td>
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
