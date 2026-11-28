import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowRight,
  Box,
  Loader2,
  Zap,
  Layers,
  Filter,
  Search,
  ChevronDown,
  Grid,
  List,
  RotateCcw,
  X,
  SlidersHorizontal,
  Check,
} from 'lucide-react';
import { subscribeToCategories, subscribeToProducts, Product, Category as CategoryType } from '../lib/firebase/firestore-helpers';
import {
  getCanonicalProductSlug,
  getProductHref,
  resolveProductPricing,
  PRODUCT_GMC_METADATA,
  PRODUCT_ID_TO_SEO_SLUG,
  buildFallbackProductFromGmcMeta,
} from '../lib/gmc-feed';
import { EXCLUDED_CATEGORY_SLUGS, NON_PRODUCT_CATEGORY_REDIRECTS } from '../lib/sitemap-generator';
import { addToCart } from '../lib/cart';
import { SEO } from '../components/SEO';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { MobileProductCard } from '../components/MobileProductCard';
import { BlurProductImage } from '../components/BlurProductImage';
import { useCurrency } from '../contexts/CurrencyContext';
import { TELEPROMPTER_SLIDES_SEO, buildEditorialImageSeo, buildProductImageSeo } from '../lib/image-seo';
import { optimizeGalleryImageUrl } from '../lib/image-optimize';
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
import {
  LED_TV_CATEGORY_PRODUCT_SLUGS,
  getScreenSizeVariantsForSlug,
  getTvCatalogEntry,
} from '../lib/tv-catalog';

const FALLBACK_PRODUCT_CATEGORIES: Record<
  string,
  { name: string; description: string; imageUrl?: string; productSlugs: string[] }
> = {
  'video-conferencing': {
    name: 'Video Conferencing Systems',
    imageUrl: 'https://www.hp.com/content/dam/sites/worldwide/poly/video-conferencing/all-in-one/studio-x72/Hero_Banner_Desktop@2x.jpg',
    description:
      'Enterprise Video Conference in Pakistan hardware including Cisco Webex Room Kits, Codec Pro, Room Bar Pro, Polycom RealPresence Group 500, Poly Studio X70/X72, Logitech Rally Bar, and Zoom/Teams boardroom solutions.',
    productSlugs: [
      'cisco-webex-codec-pro-pakistan',
      'cisco-webex-room-kit-pro-p60-pakistan',
      'cisco-room-bar-t-c-k9-pakistan',
      'cisco-room-bar-pro-pakistan',
      'cisco-room-kit-pakistan',
      'cisco-webex-desk-pro-pakistan',
      'cisco-room-kit-eq-pakistan',
      'cisco-webex-codec-eq-pakistan',
      'cisco-room-bar-pakistan',
      'polycom-realpresence-group-500-pakistan',
      'poly-studio-x72-pakistan',
      'logitech-rally-bar-pakistan',
      'cisco-room-kit-plus-pakistan',
      'poly-studio-x52-pakistan',
      'poly-studio-usb-video-bar-pakistan',
      'poly-studio-x50-tc8-special-offer-pakistan',
      'poly-studio-x50-pakistan',
      'logitech-rally-bar-mini-pakistan',
      'podium-prompter-17-compact-pakistan',
    ],
  },
  'touch-panels': {
    name: 'Boardroom Touch Panels & Room Controllers',
    imageUrl: '/images/products/cisco-room-kit-studio.jpg',
    description:
      'Dedicated touch-screen room controllers, Poly Studio X50 + TC8 Touch Controller Bundle, Cisco Webex Desk Pro 27" 4K displays, Room Navigator consoles, stealth podium teleprompters, and AV automation systems in Pakistan.',
    productSlugs: [
      'poly-studio-x50-tc8-special-offer-pakistan',
      'cisco-webex-desk-pro-pakistan',
      'cisco-room-bar-pakistan',
      'cisco-room-bar-t-c-k9-pakistan',
      'cisco-room-bar-pro-pakistan',
      'podium-prompter-17-compact-pakistan',
      'cisco-room-kit-plus-pakistan',
      'poly-studio-x72-pakistan',
      'logitech-rally-bar-pakistan',
      'horion-k6a-bundle-special-offer',
      'google-meet-hardware-license-pakistan',
    ],
  },
  'large-room': {
    name: 'Large Boardroom Video Conferencing Systems',
    imageUrl: 'https://www.hp.com/content/dam/sites/worldwide/poly/video-conferencing/all-in-one/studio-x72/Hero_Banner_Desktop@2x.jpg',
    description:
      'High-capacity dual-camera and PTZ codec systems including Cisco Room Kit Pro P60, Cisco Room Kit EQ, Codec Pro, Codec EQ, Polycom RealPresence Group 500, and Poly Studio X72 for 12–40+ seat executive boardrooms in Pakistan.',
    productSlugs: [
      'cisco-webex-room-kit-pro-p60-pakistan',
      'cisco-room-kit-eq-pakistan',
      'cisco-webex-codec-pro-pakistan',
      'cisco-webex-codec-eq-pakistan',
      'cisco-room-bar-pro-pakistan',
      'polycom-realpresence-group-500-pakistan',
      'poly-studio-x72-pakistan',
      'cisco-room-kit-plus-pakistan',
      'cisco-room-kit-pro-pakistan',
      'poly-studio-x50-tc8-special-offer-pakistan',
      'poly-g7500-pakistan',
      'logitech-rally-bar-pakistan',
      'podium-prompter-17-compact-pakistan',
    ],
  },
  speakerphones: {
    name: 'Conference Room Speakerphones & Microphone Arrays',
    imageUrl: 'https://www.onedirect.co.uk/media/catalog/product/cache/aa0ba86914834d3bc3e1ab8fdcec579e/p/o/postur30_4__2.jpg',
    description:
      '360-degree beamforming conference phones, expansion microphones, and ceiling audio pickup systems from Poly, Jabra, and Yealink in Pakistan.',
    productSlugs: [
      'poly-studio-usb-video-bar-pakistan',
      'poly-studio-v52-pakistan',
      'jabra-evolve2-65-pakistan',
      'yealink-sip-t46s-pakistan',
    ],
  },
  'boardroom-codecs': {
    name: 'Enterprise H.323 / SIP Boardroom Codecs',
    imageUrl: '/images/products/cisco-room-kit-eq.webp',
    description:
      'Hardware telepresence codecs including Poly Studio X50 + TC8 Special Offer Bundle, Cisco Webex Codec Pro (CS-CODEC-PRO-K9), Cisco Codec EQ (CS-CODEC-EQ-K9), Room Kit Pro P60, Room Kit EQ, Polycom RealPresence Group 500, and Poly G7500 in Pakistan.',
    productSlugs: [
      'poly-studio-x50-tc8-special-offer-pakistan',
      'cisco-webex-codec-pro-pakistan',
      'cisco-webex-codec-eq-pakistan',
      'cisco-webex-room-kit-pro-p60-pakistan',
      'cisco-room-kit-eq-pakistan',
      'cisco-room-bar-pro-pakistan',
      'cisco-room-kit-pakistan',
      'cisco-room-bar-pakistan',
      'cisco-room-bar-t-c-k9-pakistan',
      'polycom-realpresence-group-500-pakistan',
      'poly-g7500-pakistan',
      'cisco-room-kit-pro-pakistan',
      'cisco-room-kit-plus-pakistan',
      'podium-prompter-17-compact-pakistan',
    ],
  },
  'ptz-cameras': {
    name: '4K Optical PTZ Conferencing & Broadcast Cameras',
    imageUrl: 'https://image.made-in-china.com/2f0j00IidckVRGgbqT/4-Inch-50m-IR-4MP-25X-Zoom-Network-Speed-Dome-Mini-PTZ-Camera-Hikvision-Ds-2de4A425iw-De-S6-Version.jpg',
    description:
      'Motorized 12x–25x optical zoom PTZ cameras including Cisco Precision 60 (Room Kit Pro P60), Polycom EagleEye IV, Logitech Rally PTZ, and Hikvision DarkFighter PTZ systems for boardrooms and hybrid events in Pakistan.',
    productSlugs: [
      'cisco-webex-room-kit-pro-p60-pakistan',
      'polycom-realpresence-group-500-pakistan',
      'logitech-rally-bar-pakistan',
      'hikvision-ptz-camera-pakistan',
      'poly-studio-x72-pakistan',
    ],
  },
  'ip-phones': {
    name: 'Enterprise IP Phones',
    description:
      'Executive SIP & VoIP desk phones from Cisco, Yealink, Poly / Polycom VVX, Grandstream, and Fanvil with PoE and HD voice for Pakistani enterprises.',
    productSlugs: [
      'poly-vvx-411-pakistan',
      'cisco-8841-ip-phone-pakistan',
      'polycom-vvx-250-pakistan',
      'yealink-sip-t46s-pakistan',
      'grandstream-gxp2170-pakistan',
      'fanvil-x4-ip-phone-pakistan',
    ],
  },
  'voip-phone-systems': {
    name: 'VoIP Phone Systems & IP PBX',
    description:
      'Scalable IP PBX appliances and unified communications licensing from 3CX, Grandstream UCM, Cisco CUCM, FreePBX, and Poly VVX enterprise endpoints.',
    productSlugs: [
      '3cx-pro-8-sc-pakistan',
      'freepbx-enterprise-pakistan',
      'cisco-cucm-license-pakistan',
      'grandstream-ucm6308-pakistan',
      'grandstream-ucm6304-pakistan',
      'poly-vvx-411-pakistan',
    ],
  },
  projectors: {
    name: 'Commercial Laser & 4K Projectors',
    imageUrl: 'https://eu.connect.panasonic.com/sites/default/files/media/image/2026-06/pt-rq45kseries-innovationstoeaseeverystep.webp',
    description:
      'High-lumen 4K UHD and laser installation projectors from Panasonic, BenQ, Epson, Sony, Optoma, and ViewSonic for auditoriums and 3D projection mapping in Pakistan.',
    productSlugs: [
      'panasonic-pt-rq45k-pakistan',
      'panasonic-pt-vmz82-pakistan',
      'epson-lifestudio-flex-plus-pakistan',
      'benq-tk705i-pakistan',
      'benq-w4100i-pakistan',
      'sony-bravia-projector-7-pakistan',
      'optoma-gt4000uhd-pakistan',
      'viewsonic-lsd400w-pakistan',
    ],
  },
  headsets: {
    name: 'Professional UC & Call Center Headsets',
    description:
      'Active noise-cancelling (ANC) wireless and USB headsets from Jabra Evolve, HP Poly Voyager/Blackwire, and Yealink for hybrid work and contact centers.',
    productSlugs: [
      'jabra-evolve2-65-pakistan',
      'jabra-evolve-75-pakistan',
      'poly-voyager-focus-uc-pakistan',
      'poly-blackwire-c3220-pakistan',
      'yealink-bh70-headset-pakistan',
    ],
  },
  'ip-cameras': {
    name: 'IP Security & PTZ Cameras',
    description:
      'NDAA-compliant network surveillance, Starlight WDR domes, and optical PTZ cameras from Axis, Hikvision, Dahua, and Uniview.',
    productSlugs: [
      'axis-m3065-v-camera-pakistan',
      'hikvision-colorvu-camera-pakistan',
      'hikvision-ptz-camera-pakistan',
      'dahua-n43al52-bullet-pakistan',
      'uniview-ipc3612sr3-vf-pakistan',
    ],
  },
  'intercom-paging-access': {
    name: 'SIP Intercom, Paging & Public Address',
    description:
      'Commercial PA amplifiers, EN 54-16 voice alarm controllers, and SIP video door intercoms from Bosch PAVIRO, 2N, Axis, and ITC.',
    productSlugs: [
      '2n-ip-vario-intercom-pakistan',
      'axis-a8105-e-door-station-pakistan',
      'bosch-paviro-pva-4cr12-pakistan',
      'bosch-paviro-pva-2p500-pakistan',
      'itc-va-6200ma-pakistan',
    ],
  },
  'led-tv-displays': {
    name: 'LED TVs & Commercial Displays',
    imageUrl: '/images/products/tv-samsung-u8000f.webp',
    description:
      'Official Samsung Crystal UHD & Smart TVs (32"–85"), TCL 4K Google & Smart LED TVs (32"–75"), and Horion 4K Interactive Flat Panels in Pakistan with verified PKR pricing, in-stock nationwide delivery, and official warranty.',
    productSlugs: LED_TV_CATEGORY_PRODUCT_SLUGS,
  },
};

function getFallbackCategoryProducts(slug?: string): Product[] {
  if (!slug) return [];
  const catConfig = FALLBACK_PRODUCT_CATEGORIES[slug];
  const explicitSlugs = catConfig?.productSlugs || [];
  const metadataMatchingSlugs = Object.keys(PRODUCT_GMC_METADATA).filter(
    (k) => !PRODUCT_ID_TO_SEO_SLUG[k] && (PRODUCT_GMC_METADATA[k]?.categorySlugs || []).includes(slug)
  );
  const candidateSlugs = Array.from(
    new Set([
      ...explicitSlugs,
      ...metadataMatchingSlugs,
      ...(explicitSlugs.length === 0 && metadataMatchingSlugs.length === 0
        ? Object.keys(PRODUCT_GMC_METADATA).filter((k) => k.endsWith('-pakistan')).slice(0, 6)
        : []),
    ])
  );

  const built: Product[] = [];
  for (const s of candidateSlugs) {
    const prod = buildFallbackProductFromGmcMeta(s) as Product | null;
    if (prod) {
      built.push({
        ...prod,
        categoryIds: Array.from(new Set([...(prod.categoryIds || []), slug])),
        categorySlugs: Array.from(new Set([...(prod.categorySlugs || []), slug])),
      });
    }
  }
  return built;
}

export function Category() {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // eBay-style client-side facet states on Category page
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedScreenSize, setSelectedScreenSize] = useState<string>('');
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [listingTab, setListingTab] = useState<'all' | 'sale' | 'bundles' | 'free-shipping'>('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [localMinPrice, setLocalMinPrice] = useState('');
  const [localMaxPrice, setLocalMaxPrice] = useState('');
  const [sortOption, setSortOption] = useState('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Reset filters when navigating between categories
  useEffect(() => {
    setSearchQuery('');
    setSelectedBrands([]);
    setSelectedScreenSize('');
    setSelectedRooms([]);
    setSelectedTypes([]);
    setListingTab('all');
    setMinPrice('');
    setMaxPrice('');
    setLocalMinPrice('');
    setLocalMaxPrice('');
    setSortOption('featured');
  }, [categorySlug]);

  useEffect(() => {
    const unsubCategories = subscribeToCategories((cats) => {
      const productOnlyCats = cats.filter(
        c =>
          c.isActive !== false &&
          !EXCLUDED_CATEGORY_SLUGS.has(c.slug) &&
          (!(c as any).type || (c as any).type === 'product')
      );
      setCategories(productOnlyCats);
    });

    const unsubProducts = subscribeToProducts((prods) => {
      setProducts(prods);
      setLoading(false);
    }, { isActive: true });

    return () => {
      unsubCategories();
      unsubProducts();
    };
  }, []);

  if (categorySlug && NON_PRODUCT_CATEGORY_REDIRECTS[categorySlug]) {
    return <Navigate to={NON_PRODUCT_CATEGORY_REDIRECTS[categorySlug]} replace />;
  }

  const { currency, formatPrice } = useCurrency();

  const fallbackCat = categorySlug ? FALLBACK_PRODUCT_CATEGORIES[categorySlug] : undefined;
  const currentCategory: CategoryType | undefined =
    categories.find(c => c.slug === categorySlug && !EXCLUDED_CATEGORY_SLUGS.has(c.slug)) ||
    (fallbackCat && categorySlug
      ? {
          id: categorySlug,
          name: fallbackCat.name,
          slug: categorySlug,
          description: fallbackCat.description,
          parentId: null,
          displayOrder: 1,
          isActive: true,
        }
      : undefined);

  const subcategories = currentCategory
    ? categories.filter(c => c.parentId === currentCategory.id && c.isActive)
    : [];

  // Merge Firestore products for this category with fallback catalog products so no SKU is ever omitted
  const categoryProducts = useMemo(() => {
    const fallbackList = getFallbackCategoryProducts(categorySlug);
    const firestoreMatched = currentCategory
      ? products.filter(
          (p) =>
            (Array.isArray(p.categorySlugs)
              ? p.categorySlugs
              : typeof p.categorySlugs === 'string'
              ? [p.categorySlugs]
              : []
            ).includes(categorySlug!) || p.categoryIds?.includes(currentCategory.id!)
        )
      : [];

    const bySlug = new Map<string, Product>();
    for (const fp of fallbackList) {
      bySlug.set(getCanonicalProductSlug(fp, fp.id), fp);
    }
    for (const lp of firestoreMatched) {
      bySlug.set(getCanonicalProductSlug(lp, lp.id), lp);
    }
    const seenIds = new Set<string>();
    const uniqueProducts: Product[] = [];
    for (const prod of bySlug.values()) {
      const pid = String(prod.id || prod.slug || '').trim();
      if (!pid || seenIds.has(pid)) continue;
      seenIds.add(pid);
      uniqueProducts.push(prod);
    }
    return uniqueProducts;
  }, [products, currentCategory, categorySlug]);

  const brandsIncategory = useMemo(
    () => Array.from(new Set(categoryProducts.map(p => (p.brand || 'Unknown').trim() || 'Unknown'))).sort(),
    [categoryProducts]
  );

  // Contextual brand, room, form-factor, and tab counts within this category
  const availableBrands = useMemo(() => {
    const byNormalized = new Map<string, { name: string; count: number; normalized: string }>();
    categoryProducts.forEach((p) => {
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
  }, [categoryProducts]);

  const isLedTvCategory = categorySlug === 'led-tv-displays';

  const availableScreenSizes = useMemo(() => {
    if (!isLedTvCategory) return [] as Array<{ size: string; count: number }>;
    const counts = new Map<string, number>();
    categoryProducts.forEach((p) => {
      const slug = getCanonicalProductSlug(p, p.id);
      const tvEntry = getTvCatalogEntry(slug);
      const sz = tvEntry?.size || p.size || (/\b(32|40|43|50|55|65|75|85)\s*(?:inch|")/i.exec(p.productName || '')?.[1] ? `${/\b(32|40|43|50|55|65|75|85)\s*(?:inch|")/i.exec(p.productName || '')![1]}"` : '');
      if (sz) counts.set(sz, (counts.get(sz) || 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([size, count]) => ({ size, count }))
      .sort((a, b) => parseInt(a.size, 10) - parseInt(b.size, 10));
  }, [categoryProducts, isLedTvCategory]);

  const roomFacetCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    categoryProducts.forEach((p) => {
      getProductRoomSizeFacets(p).forEach((rId) => {
        counts[rId] = (counts[rId] || 0) + 1;
      });
    });
    return counts;
  }, [categoryProducts]);

  const formFactorCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    categoryProducts.forEach((p) => {
      getProductFormFactorFacets(p).forEach((tId) => {
        counts[tId] = (counts[tId] || 0) + 1;
      });
    });
    return counts;
  }, [categoryProducts]);

  const tabCounts = useMemo(() => {
    let sale = 0;
    let bundles = 0;
    let freeShipping = 0;
    categoryProducts.forEach((p) => {
      const { effectivePrice, hasSale } = resolveProductPricing(p);
      if (hasSale) sale++;
      if (isProductBundleOrKit(p)) bundles++;
      if (effectivePrice >= 100000) freeShipping++;
    });
    return {
      all: categoryProducts.length,
      sale,
      bundles,
      freeShipping,
    };
  }, [categoryProducts]);

  const filteredCategoryProducts = useMemo(() => {
    let result = [...categoryProducts];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          (p.productName || '').toLowerCase().includes(q) ||
          (p.brand || '').toLowerCase().includes(q) ||
          (p.sku || '').toLowerCase().includes(q) ||
          (p.mpn || '').toLowerCase().includes(q) ||
          (p.gtin || '').toLowerCase().includes(q)
      );
    }

    if (listingTab === 'sale') {
      result = result.filter((p) => resolveProductPricing(p).hasSale);
    } else if (listingTab === 'bundles') {
      result = result.filter((p) => isProductBundleOrKit(p));
    } else if (listingTab === 'free-shipping') {
      result = result.filter((p) => resolveProductPricing(p).effectivePrice >= 100000);
    }

    if (selectedBrands.length > 0) {
      result = result.filter((p) => {
        if (!p.brand) return false;
        const pBrand = p.brand.toLowerCase();
        return selectedBrands.some(
          (sb) =>
            pBrand === sb ||
            pBrand.includes(sb) ||
            (sb === 'poly' && (pBrand.includes('poly') || pBrand.includes('plantronics')))
        );
      });
    }

    if (selectedScreenSize) {
      result = result.filter((p) => {
        const slug = getCanonicalProductSlug(p, p.id);
        const tvEntry = getTvCatalogEntry(slug);
        const sz = tvEntry?.size || p.size || '';
        if (sz === selectedScreenSize) return true;
        const inches = selectedScreenSize.replace('"', '');
        return new RegExp(`\\b${inches}\\s*(?:inch|")`, 'i').test(p.productName || '');
      });
    }

    if (selectedRooms.length > 0) {
      result = result.filter((p) => {
        const pRooms = getProductRoomSizeFacets(p);
        return selectedRooms.some((r) => pRooms.includes(r));
      });
    }

    if (selectedTypes.length > 0) {
      result = result.filter((p) => {
        const pTypes = getProductFormFactorFacets(p);
        return selectedTypes.some((t) => pTypes.includes(t));
      });
    }

    if (minPrice) {
      const minVal = parseFloat(minPrice);
      if (!isNaN(minVal)) {
        result = result.filter((p) => resolveProductPricing(p).effectivePrice >= minVal);
      }
    }

    if (maxPrice) {
      const maxVal = parseFloat(maxPrice);
      if (!isNaN(maxVal)) {
        result = result.filter((p) => resolveProductPricing(p).effectivePrice <= maxVal);
      }
    }

    switch (sortOption) {
      case 'price-low':
        result.sort((a, b) => resolveProductPricing(a).effectivePrice - resolveProductPricing(b).effectivePrice);
        break;
      case 'price-high':
        result.sort((a, b) => resolveProductPricing(b).effectivePrice - resolveProductPricing(a).effectivePrice);
        break;
      case 'savings':
        result.sort((a, b) => getProductListingBadges(b).savingsAmount - getProductListingBadges(a).savingsAmount);
        break;
      case 'newest':
        result.sort((a, b) => {
          const ggnA = String(a.gmcId || '').startsWith('GGN-CS-') ? 1 : 0;
          const ggnB = String(b.gmcId || '').startsWith('GGN-CS-') ? 1 : 0;
          return ggnB - ggnA;
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
  }, [categoryProducts, searchQuery, listingTab, selectedBrands, selectedScreenSize, selectedRooms, selectedTypes, minPrice, maxPrice, sortOption]);

  const toggleBrand = (brandName: string) => {
    const norm = brandName.toLowerCase();
    setSelectedBrands((prev) => (prev.includes(norm) ? prev.filter((b) => b !== norm) : [...prev, norm]));
  };

  const toggleRoom = (roomId: string) => {
    setSelectedRooms((prev) => (prev.includes(roomId) ? prev.filter((r) => r !== roomId) : [...prev, roomId]));
  };

  const toggleType = (typeId: string) => {
    setSelectedTypes((prev) => (prev.includes(typeId) ? prev.filter((t) => t !== typeId) : [...prev, typeId]));
  };

  const clearCategoryFilters = () => {
    setSearchQuery('');
    setSelectedBrands([]);
    setSelectedScreenSize('');
    setSelectedRooms([]);
    setSelectedTypes([]);
    setListingTab('all');
    setMinPrice('');
    setMaxPrice('');
    setLocalMinPrice('');
    setLocalMaxPrice('');
    setSortOption('featured');
  };

  const isAnyFilterActive = Boolean(
    searchQuery ||
      selectedBrands.length > 0 ||
      selectedScreenSize ||
      selectedRooms.length > 0 ||
      selectedTypes.length > 0 ||
      listingTab !== 'all' ||
      minPrice ||
      maxPrice
  );

  if (loading && !currentCategory) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <SEO
          title={`${(categorySlug || 'Hardware').replace(/-/g, ' ')} in Pakistan | Enterprise AV | AV Live`}
          description="Explore enterprise video conferencing, VoIP telephony, and commercial AV hardware in Pakistan from AV Live Communications."
          url={`https://avlive.com.pk/category/${categorySlug || ''}`}
        />
        <div className="text-center">
          <Loader2 className="animate-spin text-[#00B4D8] mx-auto mb-4" size={40} />
          <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Filtering Infrastructure...</p>
        </div>
      </div>
    );
  }

  if (!currentCategory) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FA]">
        <SEO
          title="Category Not Found | AV Live Communications"
          description="The requested hardware category does not exist."
          noindex={true}
        />
        <h1 className="text-4xl font-black text-[#1A2B4C] mb-4">Classification Error</h1>
        <p className="text-gray-500 mb-8 font-medium">The hardware category you requested is not indexed.</p>
        <Link to="/shop" className="bg-[#1A2B4C] text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#00B4D8] transition-all shadow-xl">
          Browse All Inventory
        </Link>
      </div>
    );
  }

  const canonicalCategoryUrl = `https://avlive.com.pk/category/${currentCategory.slug || currentCategory.id}`;

  const renderCategorySidebar = () => (
    <div className="space-y-4">
      {/* 1. Department / Category Switcher */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="px-4 py-3 bg-gray-50/70 border-b border-gray-100">
          <h3 className="font-black text-[11px] uppercase tracking-wider text-[#1A2B4C]">
            Departments
          </h3>
        </div>
        <div className="p-3 space-y-1 max-h-60 overflow-y-auto">
          {Object.entries(FALLBACK_PRODUCT_CATEGORIES).map(([slugKey, catMeta]) => {
            const isCurrent = slugKey === categorySlug;
            return (
              <Link
                key={slugKey}
                to={`/category/${slugKey}`}
                className={`flex items-center justify-between py-1.5 px-2.5 rounded-lg text-xs transition-all ${
                  isCurrent
                    ? 'bg-[#1A2B4C] text-white font-black'
                    : 'text-gray-700 hover:bg-gray-100 font-semibold'
                }`}
              >
                <span className="truncate">{catMeta.name}</span>
                {isCurrent && <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded">{categoryProducts.length}</span>}
              </Link>
            );
          })}
        </div>
      </div>

      {/* 2. Brand / OEM Checkboxes + Brand Hub Links */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="px-4 py-3 bg-gray-50/70 border-b border-gray-100">
          <h3 className="font-black text-[11px] uppercase tracking-wider text-[#1A2B4C]">
            Brand / Manufacturer
          </h3>
        </div>
        <div className="p-3 space-y-1.5">
          {availableBrands.map((brand) => {
            const isChecked = selectedBrands.includes(brand.normalized);
            const rawSlug = brand.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
            const canonicalBrandSlug = rawSlug === 'polycom' || rawSlug === 'hp-poly' ? 'poly' : rawSlug;
            return (
              <div key={brand.normalized} className="flex items-center justify-between py-1 px-1.5 rounded-lg hover:bg-gray-50">
                <button
                  type="button"
                  onClick={() => toggleBrand(brand.name)}
                  className="flex items-center gap-2.5 min-w-0 flex-1 text-left cursor-pointer"
                >
                  <span
                    className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                      isChecked ? 'bg-[#1A2B4C] border-[#1A2B4C] text-white' : 'border-gray-300 bg-white'
                    }`}
                  >
                    {isChecked && <Check size={11} strokeWidth={3} />}
                  </span>
                  <span className={`text-xs truncate ${isChecked ? 'font-black text-[#1A2B4C]' : 'font-semibold text-gray-700'}`}>
                    {brand.name}
                  </span>
                </button>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[11px] font-semibold text-gray-400">({brand.count})</span>
                  <Link
                    to={`/brands/${encodeURIComponent(canonicalBrandSlug)}`}
                    title={`View all ${brand.name} hardware`}
                    aria-label={`View ${brand.name} brand page`}
                    className="text-gray-300 hover:text-[#00B4D8]"
                  >
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Room Size & Environment Aspect Checkboxes */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="px-4 py-3 bg-gray-50/70 border-b border-gray-100">
          <h3 className="font-black text-[11px] uppercase tracking-wider text-[#1A2B4C]">
            Room Size &amp; Environment
          </h3>
        </div>
        <div className="p-3 space-y-1">
          {EBAY_ROOM_SIZE_FACETS.filter((f) => (roomFacetCounts[f.id] || 0) > 0).map((facet) => {
            const count = roomFacetCounts[facet.id] || 0;
            const isChecked = selectedRooms.includes(facet.id);
            return (
              <button
                key={facet.id}
                type="button"
                onClick={() => toggleRoom(facet.id)}
                className="w-full flex items-center justify-between py-1.5 px-1.5 rounded-lg hover:bg-gray-50 text-left cursor-pointer"
              >
                <span className="flex items-center gap-2.5">
                  <span
                    className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                      isChecked ? 'bg-[#1A2B4C] border-[#1A2B4C] text-white' : 'border-gray-300 bg-white'
                    }`}
                  >
                    {isChecked && <Check size={11} strokeWidth={3} />}
                  </span>
                  <span className={`text-xs ${isChecked ? 'font-black text-[#1A2B4C]' : 'font-semibold text-gray-700'}`}>
                    {facet.shortLabel || facet.label}
                  </span>
                </span>
                <span className="text-[11px] font-semibold text-gray-400">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Product Type / Form Factor Aspect Checkboxes */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="px-4 py-3 bg-gray-50/70 border-b border-gray-100">
          <h3 className="font-black text-[11px] uppercase tracking-wider text-[#1A2B4C]">
            Product Type / Form Factor
          </h3>
        </div>
        <div className="p-3 space-y-1">
          {EBAY_FORM_FACTOR_FACETS.filter((f) => (formFactorCounts[f.id] || 0) > 0).map((facet) => {
            const count = formFactorCounts[facet.id] || 0;
            const isChecked = selectedTypes.includes(facet.id);
            return (
              <button
                key={facet.id}
                type="button"
                onClick={() => toggleType(facet.id)}
                className="w-full flex items-center justify-between py-1.5 px-1.5 rounded-lg hover:bg-gray-50 text-left cursor-pointer"
              >
                <span className="flex items-center gap-2.5">
                  <span
                    className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                      isChecked ? 'bg-[#1A2B4C] border-[#1A2B4C] text-white' : 'border-gray-300 bg-white'
                    }`}
                  >
                    {isChecked && <Check size={11} strokeWidth={3} />}
                  </span>
                  <span className={`text-xs ${isChecked ? 'font-black text-[#1A2B4C]' : 'font-semibold text-gray-700'}`}>
                    {facet.shortLabel || facet.label}
                  </span>
                </span>
                <span className="text-[11px] font-semibold text-gray-400">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Price Range (PKR) */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="px-4 py-3 bg-gray-50/70 border-b border-gray-100">
          <h3 className="font-black text-[11px] uppercase tracking-wider text-[#1A2B4C]">
            Price Range (PKR)
          </h3>
        </div>
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
                    setMinPrice(tier.min);
                    setMaxPrice(tier.max);
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
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setMinPrice(localMinPrice);
              setMaxPrice(localMaxPrice);
            }}
            className="pt-2 border-t border-gray-100 flex items-center gap-1.5"
          >
            <input
              type="number"
              placeholder="Min"
              aria-label="Minimum price"
              value={localMinPrice}
              onChange={(e) => setLocalMinPrice(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-xs font-bold text-[#1A2B4C]"
            />
            <span className="text-xs text-gray-400 font-bold">to</span>
            <input
              type="number"
              placeholder="Max"
              aria-label="Maximum price"
              value={localMaxPrice}
              onChange={(e) => setLocalMaxPrice(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-xs font-bold text-[#1A2B4C]"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-[#1A2B4C] hover:bg-[#00B4D8] text-white rounded-lg text-xs font-black cursor-pointer"
            >
              Go
            </button>
          </form>
        </div>
      </div>

      {/* 6. Design Assistance CTA */}
      <div className="bg-[#1A2B4C] p-5 rounded-2xl text-white shadow-md">
        <h4 className="text-xs font-black uppercase tracking-widest mb-1.5">Design Assistance</h4>
        <p className="text-xs text-gray-300 leading-relaxed mb-3.5">
          Need a custom technical drawing or FBR GST tender quote for {currentCategory.name}?
        </p>
        <Link
          to="/contact"
          className="bg-[#00B4D8] text-white px-4 py-2 min-h-[36px] rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-[#1A2B4C] transition-all inline-flex items-center justify-center w-full"
        >
          Consult Architect
        </Link>
      </div>
    </div>
  );

  return (
    <div className="bg-[#F8F9FA] min-h-screen pb-16 text-[#1A2B4C]">
      <SEO 
        title={`${currentCategory.name} in Pakistan | Enterprise AV | AV Live`}
        description={currentCategory.description || `Explore genuine ${currentCategory.name} in Pakistan: Poly, Cisco, Logitech & Yealink hardware with PKR pricing and official local warranty.`}
        keywords={`${currentCategory.name}, ${currentCategory.name} price in Pakistan, enterprise AV Pakistan, Poly, Cisco, Logitech, Yealink, Bosch, AV Live`}
        image={currentCategory.imageUrl}
        imageAlt={`${currentCategory.name} Hardware & Integration in Pakistan — AV Live`}
        url={canonicalCategoryUrl}
        schema={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "CollectionPage",
              "@id": `${canonicalCategoryUrl}#collection`,
              "name": `${currentCategory.name} Hardware Catalog in Pakistan | AV Live`,
              "description": currentCategory.description || `Enterprise ${currentCategory.name} hardware in Pakistan.`,
              "url": canonicalCategoryUrl,
              "mainEntity": {
                "@type": "ItemList",
                "numberOfItems": categoryProducts.length,
                "itemListElement": categoryProducts.slice(0, 24).map((prod, idx) => {
                  const prodHref = getProductHref(prod, prod.id);
                  const { effectivePrice } = resolveProductPricing(prod);
                  const rawImg = (Array.isArray(prod.images) && prod.images[0]) || prod.imageUrl || (prod as any).image || 'https://avlive.com.pk/og-image.jpg';
                  const absImg = String(rawImg).startsWith('http') ? String(rawImg) : `https://avlive.com.pk${String(rawImg).startsWith('/') ? '' : '/'}${rawImg}`;
                  return {
                    "@type": "ListItem",
                    "position": idx + 1,
                    "url": `https://avlive.com.pk${prodHref}`,
                    "name": prod.productName,
                    "item": {
                      "@type": "Product",
                      "name": prod.productName,
                      "image": [absImg],
                      "description": prod.shortDescription?.replace(/<[^>]*>?/gm, '') || `${prod.productName} by ${prod.brand || 'AV Live'} in Pakistan.`,
                      "sku": prod.mpn || prod.sku || prod.slug,
                      "mpn": prod.mpn || prod.sku || prod.slug,
                      "url": `https://avlive.com.pk${prodHref}`,
                      "brand": { "@type": "Brand", "name": prod.brand || "AV Live" },
                      "offers": {
                        "@type": "Offer",
                        "url": `https://avlive.com.pk${prodHref}`,
                        "priceCurrency": "PKR",
                        "price": effectivePrice.toFixed(2),
                        "validFrom": "2026-01-01",
                        "priceValidUntil": "2027-12-31",
                        "itemCondition": "https://schema.org/NewCondition",
                        "availability": "https://schema.org/InStock",
                        "shippingDetails": {
                          "@type": "OfferShippingDetails",
                          "shippingRate": {
                            "@type": "MonetaryAmount",
                            "value": effectivePrice >= 100000 ? "0.00" : "1500.00",
                            "currency": "PKR"
                          },
                          "shippingDestination": {
                            "@type": "DefinedRegion",
                            "addressCountry": "PK"
                          },
                          "deliveryTime": {
                            "@type": "ShippingDeliveryTime",
                            "handlingTime": { "@type": "QuantitativeValue", "minValue": 0, "maxValue": 1, "unitCode": "DAY" },
                            "transitTime": { "@type": "QuantitativeValue", "minValue": 1, "maxValue": 5, "unitCode": "DAY" }
                          }
                        },
                        "hasMerchantReturnPolicy": {
                          "@type": "MerchantReturnPolicy",
                          "applicableCountry": "PK",
                          "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
                          "merchantReturnDays": 30,
                          "returnMethod": "https://schema.org/ReturnByMail",
                          "returnFees": "https://schema.org/FreeReturn"
                        }
                      }
                    }
                  };
                })
              }
            },
            {
              "@type": "FAQPage",
              "@id": `${canonicalCategoryUrl}#faq`,
              "mainEntity": isLedTvCategory
                ? [
                    {
                      "@type": "Question",
                      "name": "Which Samsung, TCL, and Horion LED TV models are available in Pakistan at AV Live?",
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "AV Live supplies 28+ official Samsung Crystal UHD & Smart TVs (U8000F, DU8000, DU7000, F6000, H5000, T5300 from 32\" to 85\"), TCL 4K Google & Smart LED TVs (V6D, P6L, P755, P6K, S51K, P79L, T6D, P8US from 32\" to 75\"), and Horion 4K Interactive Flat Panels with verified PKR pricing and nationwide delivery."
                      }
                    }
                  ]
                : [
                    {
                      "@type": "Question",
                      "name": `Which ${currentCategory.name} models are recommended for Video Conference in Pakistan?`,
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": `For enterprise boardrooms and hybrid events in Pakistan, our top-performing ${currentCategory.name} systems include the Cisco Webex Room Kit Pro P60, Cisco Room Kit EQ, Cisco Room Bar Pro, Polycom RealPresence Group 500, Poly Studio X72, and Logitech Rally Bar—all backed by local warranty and engineering support in Lahore, Karachi, and Islamabad.`
                      }
                    }
                  ]
            }
          ]
        }}
      />
      {/* Category Hero */}
      <div className="bg-white border-b border-gray-100 py-3.5 lg:py-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative z-10">
          <Breadcrumbs items={[
            { label: 'Shop', path: '/shop' },
            { label: currentCategory.name }
          ]} />
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5 lg:gap-5">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="hidden sm:flex w-12 h-12 lg:w-16 lg:h-16 bg-[#1A2B4C] text-[#00B4D8] rounded-2xl items-center justify-center shrink-0 shadow-md"
              >
                {currentCategory.imageUrl ? (() => {
                  const catImgSeo = buildEditorialImageSeo(currentCategory.name, 'category', currentCategory.description);
                  return (
                    <img fetchPriority="high" src={currentCategory.imageUrl} title={catImgSeo.title} alt={catImgSeo.alt} className="w-full h-full object-cover rounded-2xl" />
                  );
                })() : (
                  <Layers size={26} />
                )}
              </motion.div>
              <div className="flex-1 text-left">
                <span className="text-[#0088A8] text-xs font-black uppercase tracking-widest mb-0.5 block">Hardware Classification</span>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black mb-1 tracking-tight text-[#1A2B4C]">{currentCategory.name}</h1>
                <p className="text-gray-600 max-w-2xl leading-relaxed font-medium text-xs sm:text-sm line-clamp-2">
                  {currentCategory.description || 'Enterprise-grade equipment and specialized infrastructure solutions.'}
                </p>
              </div>
            </div>

            {/* Category Search Input */}
            <div className="relative w-full lg:w-72 shrink-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search in ${currentCategory.name}...`}
                aria-label={`Search in ${currentCategory.name}`}
                className="w-full pl-9 pr-8 h-10 bg-[#F8F9FA] border border-gray-200 rounded-xl text-xs font-semibold text-[#1A2B4C] focus:outline-none focus:border-[#00B4D8] focus:bg-white"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear category search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Slide-Over Filter Drawer (< 1024px) */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setIsMobileFilterOpen(false)} />
          <div className="relative z-10 w-80 max-w-[88vw] bg-[#F8F9FA] h-full overflow-y-auto p-4 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-200">
              <span className="font-black text-sm text-[#1A2B4C] uppercase tracking-wider flex items-center gap-1.5">
                <SlidersHorizontal size={15} className="text-[#00B4D8]" /> Filter Category
              </span>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                aria-label="Close category filters"
                className="p-1.5 rounded-lg bg-white border border-gray-200 text-gray-600"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">{renderCategorySidebar()}</div>
            <div className="pt-3 mt-3 border-t border-gray-200 flex gap-2">
              <button
                type="button"
                onClick={clearCategoryFilters}
                className="flex-1 py-2.5 rounded-xl border border-gray-300 bg-white text-xs font-black text-gray-700"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#1A2B4C] text-white text-xs font-black"
              >
                Show {filteredCategoryProducts.length} Items
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-4 lg:mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* Persistent Desktop eBay Aspect Filter Sidebar */}
          <aside className="order-2 lg:order-1 lg:col-span-1 space-y-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#1A2B4C] flex items-center gap-1.5">
                <SlidersHorizontal size={13} className="text-[#00B4D8]" /> Filter by Aspect
              </span>
              {isAnyFilterActive && (
                <button
                  type="button"
                  onClick={clearCategoryFilters}
                  className="text-[11px] font-bold text-[#00B4D8] hover:underline cursor-pointer"
                >
                  Reset all
                </button>
              )}
            </div>
            {subcategories.length > 0 && (
              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5">Sub-Systems</h3>
                <div className="space-y-1.5">
                  {subcategories.map(sub => (
                    <Link key={sub.id} to={`/category/${sub.slug}`} className="flex items-center justify-between py-1 group">
                      <span className="text-xs font-bold text-[#1A2B4C] group-hover:text-[#00B4D8] transition-colors">{sub.name}</span>
                      <ArrowRight size={13} className="text-gray-300 group-hover:text-[#00B4D8]" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {renderCategorySidebar()}
          </aside>

          {/* Product Results Area */}
          <div className="order-1 lg:order-2 lg:col-span-3">
            {['video-conferencing', 'large-room', 'touch-panels', 'boardroom-codecs'].includes(categorySlug || '') && (
              <div className="mb-4 bg-[#111318] text-white rounded-2xl overflow-hidden border border-gray-800 grid grid-cols-1 md:grid-cols-12 items-stretch shadow-sm">
                <div className="md:col-span-5 bg-[#0b0d11]">
                  <img
                    src={TELEPROMPTER_SLIDES_SEO[1].src}
                    title={TELEPROMPTER_SLIDES_SEO[1].title}
                    alt={TELEPROMPTER_SLIDES_SEO[1].alt}
                    width={640}
                    height={360}
                    loading="eager"
                    className="w-full h-full object-cover min-h-[160px]"
                  />
                </div>
                <div className="md:col-span-7 p-4 sm:p-5 flex flex-col justify-center">
                  <p className="text-[11px] font-semibold text-[#00B4D8]">
                    Featured Executive Podium Series &middot; 17&Prime; Compact &amp; 22&Prime; Flagship
                  </p>
                  <h2 className="text-base sm:text-lg font-black tracking-tight text-white mt-0.5">
                    AV Live Fold-Flat Stealth Podium Teleprompter
                  </h2>
                  <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                    Ultra-slim 1.2&Prime; fold-flat aluminium unibody, 400+ nit 4-way &plusmn;30&deg; stealth privacy IPS,
                    and frameless 70&deg; 60/40 AR optical glass with interactive PKR quote builder (PKR 160,000 – 570,000).
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <Link
                      to="/podium-teleprompter"
                      className="inline-flex items-center gap-1.5 bg-[#00B4D8] hover:bg-[#0096B4] text-white text-xs font-black px-4 py-2 rounded-full transition-colors whitespace-nowrap"
                    >
                      <span>Explore Interactive Specs &amp; PKR Configurator</span>
                      <ArrowRight size={14} />
                    </Link>
                    <a
                      href="/assets/aistudio/AV_Live_Stealth_Teleprompter_4ff82fdb.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-gray-300 hover:text-white underline whitespace-nowrap"
                    >
                      View PDF Brochure
                    </a>
                  </div>
                </div>
              </div>
            )}

            {isLedTvCategory && (
              <div className="mb-4 bg-white rounded-2xl border border-gray-200 p-4 shadow-xs space-y-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-black uppercase tracking-wider text-gray-500 mr-1">Brand:</span>
                    {[
                      { label: 'All Brands', value: '' },
                      { label: 'Samsung', value: 'samsung' },
                      { label: 'TCL', value: 'tcl' },
                      { label: 'Horion', value: 'horion' },
                    ].map((b) => {
                      const isActive =
                        b.value === ''
                          ? selectedBrands.length === 0
                          : selectedBrands.length === 1 && selectedBrands[0] === b.value;
                      return (
                        <button
                          key={b.label}
                          type="button"
                          onClick={() => setSelectedBrands(b.value ? [b.value] : [])}
                          className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer border ${
                            isActive
                              ? 'bg-[#1A2B4C] text-white border-[#1A2B4C]'
                              : 'bg-gray-50 text-[#1A2B4C] border-gray-200 hover:border-[#00B4D8]'
                          }`}
                        >
                          {b.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-3 text-[11px] font-bold">
                    <Link to="/brands/samsung" className="text-[#0088A8] hover:underline">Samsung Store →</Link>
                    <Link to="/brands/tcl" className="text-[#0088A8] hover:underline">TCL Store →</Link>
                    <Link to="/brands/horion" className="text-[#0088A8] hover:underline">Horion Store →</Link>
                  </div>
                </div>
                {availableScreenSizes.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-2.5 border-t border-gray-100">
                    <span className="text-[11px] font-black uppercase tracking-wider text-gray-500 mr-1">Screen Size:</span>
                    <button
                      type="button"
                      onClick={() => setSelectedScreenSize('')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                        !selectedScreenSize
                          ? 'bg-[#00B4D8] text-white border-[#00B4D8]'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-[#1A2B4C]'
                      }`}
                    >
                      All Sizes
                    </button>
                    {availableScreenSizes.map(({ size, count }) => {
                      const active = selectedScreenSize === size;
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setSelectedScreenSize(active ? '' : size)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold tabular-nums transition-all cursor-pointer border ${
                            active
                              ? 'bg-[#00B4D8] text-white border-[#00B4D8]'
                              : 'bg-white text-[#1A2B4C] border-gray-200 hover:border-[#00B4D8]'
                          }`}
                        >
                          {size} <span className="opacity-70 font-semibold">({count})</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* eBay-Style Top Control Bar (Format Tabs + Sort + Grid/List View) */}
            <div className="bg-white rounded-2xl border border-gray-200 p-3 sm:p-4 mb-4 shadow-xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-gray-100">
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {[
                    { id: 'all', label: 'All Listings', count: tabCounts.all },
                    { id: 'sale', label: 'Special Offers', count: tabCounts.sale },
                    { id: 'bundles', label: 'Room Bundles', count: tabCounts.bundles },
                    { id: 'free-shipping', label: 'Free Shipping', count: tabCounts.freeShipping },
                  ].map((tab) => {
                    const active = listingTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setListingTab(tab.id as any)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer border ${
                          active
                            ? 'bg-[#1A2B4C] text-white border-[#1A2B4C]'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-[#1A2B4C]'
                        }`}
                      >
                        {tab.label} <span className="text-[10px] opacity-80">({tab.count})</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setIsMobileFilterOpen(true)}
                    className="lg:hidden h-9 px-3 rounded-xl bg-[#1A2B4C] text-white font-black text-[11px] flex items-center gap-1.5"
                  >
                    <Filter size={13} /> Filters
                  </button>

                  <div className="relative">
                    <select
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value)}
                      aria-label="Sort category products"
                      className="h-9 appearance-none bg-gray-50 border border-gray-200 pl-3 pr-8 rounded-xl font-bold text-xs text-[#1A2B4C] cursor-pointer focus:outline-none focus:border-[#00B4D8]"
                    >
                      <option value="featured">Sort: Best Match</option>
                      <option value="price-low">Price: Lowest First</option>
                      <option value="price-high">Price: Highest First</option>
                      <option value="savings">Biggest Savings (PKR Off)</option>
                      <option value="newest">Newly Listed (Cisco &amp; Poly)</option>
                      <option value="name-asc">Model Name: A–Z</option>
                      <option value="name-desc">Model Name: Z–A</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>

                  <div className="flex border border-gray-200 bg-gray-50 rounded-xl overflow-hidden p-0.5 h-9 items-center">
                    <button
                      type="button"
                      onClick={() => setViewMode('grid')}
                      aria-label="Grid view"
                      className={`p-1.5 rounded-lg h-full aspect-square flex items-center justify-center cursor-pointer ${
                        viewMode === 'grid' ? 'bg-[#1A2B4C] text-white' : 'text-gray-500 hover:text-[#1A2B4C]'
                      }`}
                    >
                      <Grid size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('list')}
                      aria-label="List view"
                      className={`p-1.5 rounded-lg h-full aspect-square flex items-center justify-center cursor-pointer ${
                        viewMode === 'list' ? 'bg-[#1A2B4C] text-white' : 'text-gray-500 hover:text-[#1A2B4C]'
                      }`}
                    >
                      <List size={14} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <h2 className="text-xs sm:text-sm font-black tracking-tight text-[#1A2B4C]">
                  {filteredCategoryProducts.length} Active Modules Found in {currentCategory.name}
                </h2>
                {isAnyFilterActive && (
                  <button
                    type="button"
                    onClick={clearCategoryFilters}
                    className="text-[#00B4D8] hover:text-[#1A2B4C] font-black text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw size={12} /> Clear Filters
                  </button>
                )}
              </div>
            </div>

            {/* Product Cards (Grid or eBay Horizontal List) */}
            <div className={viewMode === 'grid' ? 'grid grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-5' : 'flex flex-col gap-4'}>
              {filteredCategoryProducts.map((product, idx) => {
                const prodSlug = getCanonicalProductSlug(product);
                const prodHref = getProductHref(product, product.id);
                const { regularPrice, effectivePrice, hasSale } = resolveProductPricing(product);
                const badges = getProductListingBadges(product);
                const rawImg = (Array.isArray(product.images) ? product.images : (typeof product.images === 'string' ? [product.images] : (product.image ? [product.image] : [])))[0] || '/images/products/poly-x70-studio.webp';
                const imgUrl = optimizeGalleryImageUrl(rawImg, 480, 75);
                const prodImgSeo = buildProductImageSeo(product, rawImg, 0);
                const tvCardMeta = getTvCatalogEntry(prodSlug);
                const tvCardSizes = tvCardMeta ? getScreenSizeVariantsForSlug(prodSlug) : [];

                return viewMode === 'grid' ? (
                  <React.Fragment key={product.id || prodSlug}>
                    <div className="lg:hidden">
                      <MobileProductCard
                        product={product}
                        eager={idx < 4}
                        priority={idx < 2}
                      />
                    </div>
                    <motion.div 
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(idx, 8) * 0.03 }}
                      className="hidden lg:flex bg-white group rounded-2xl overflow-hidden border border-gray-200 hover:border-[#00B4D8] transition-all shadow-xs hover:shadow-xl flex-col justify-between"
                    >
                      <Link to={prodHref} className="aspect-[4/3] bg-gray-50 overflow-hidden block relative p-4">
                        <BlurProductImage
                          loading={idx < 4 ? 'eager' : 'lazy'}
                          fetchPriority={idx < 2 ? 'high' : 'auto'}
                          decoding="async"
                          width={400}
                          height={300}
                          src={imgUrl}
                          seed={prodSlug}
                          title={prodImgSeo.title}
                          alt={prodImgSeo.alt}
                          className="relative z-10 w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-20">
                          {hasSale && badges.savingsPercent > 0 && (
                            <span className="bg-rose-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded shadow-xs">
                              Save {badges.savingsPercent}%
                            </span>
                          )}
                          {badges.isBundle && (
                            <span className="bg-[#1A2B4C] text-white text-[10px] font-black uppercase px-2 py-0.5 rounded shadow-xs">
                              Complete Kit
                            </span>
                          )}
                        </div>
                      </Link>
                      <div className="p-4 flex flex-col flex-1 justify-between border-t border-gray-100">
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="text-[10px] text-[#0088A8] font-black uppercase tracking-wider truncate">
                              {product.brand}{tvCardMeta ? ` · ${tvCardMeta.size}` : ''}
                            </span>
                            {tvCardMeta ? (
                              <span className="text-[10px] font-semibold text-gray-500 truncate">
                                {tvCardMeta.modelSeries}
                              </span>
                            ) : badges.mpn ? (
                              <span className="text-[10px] font-mono font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                {badges.mpn}
                              </span>
                            ) : null}
                          </div>
                          <Link to={prodHref} className="block mb-2">
                            <h3 className="font-bold text-sm text-[#1A2B4C] group-hover:text-[#00B4D8] transition-colors line-clamp-2 leading-snug min-h-[2.5rem]">
                              {product.productName}
                            </h3>
                          </Link>
                          {tvCardMeta ? (
                            <p className="text-[11px] font-semibold text-gray-500 mb-3 truncate">
                              {tvCardMeta.typeKeyFeature}
                              {tvCardSizes.length > 1 ? ` · Sizes: ${tvCardSizes.map((s) => s.size).join(', ')}` : ''}
                            </p>
                          ) : (
                            <div className="flex flex-wrap gap-1 mb-3">
                              <span className="text-[10px] font-semibold text-gray-600 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded">
                                Brand New
                              </span>
                              {badges.roomLabel && (
                                <span className="text-[10px] font-semibold text-[#1A2B4C] bg-[#00B4D8]/10 px-2 py-0.5 rounded truncate max-w-[130px]">
                                  {badges.roomLabel}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="pt-3 border-t border-gray-100">
                          <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-lg font-black text-[#1A2B4C] tabular-nums">{formatPrice(effectivePrice)}</span>
                            {hasSale && (
                              <span className="text-xs text-gray-400 line-through font-semibold tabular-nums">{formatPrice(regularPrice)}</span>
                            )}
                          </div>
                          <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-700 mb-3">
                            <span>{badges.isFreeShipping ? 'Free Insured PK Shipping' : 'In Stock • Official Warranty'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                addToCart({
                                  id: product.id || prodSlug,
                                  name: product.productName,
                                  price: effectivePrice,
                                  image: imgUrl,
                                  brand: product.brand,
                                } as any)
                              }
                              aria-label={`Add ${product.productName} to cart`}
                              className="flex-1 bg-[#1A2B4C] hover:bg-[#00B4D8] text-white py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
                            >
                              Add to Cart
                            </button>
                            <Link
                              to={prodHref}
                              className="py-2 px-3 rounded-xl border border-gray-200 hover:border-[#1A2B4C] text-xs font-bold text-[#1A2B4C]"
                            >
                              Specs
                            </Link>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </React.Fragment>
                ) : (
                  /* eBay Horizontal List Card */
                  <motion.div
                    key={product.id || prodSlug}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white group rounded-2xl overflow-hidden flex flex-col sm:flex-row border border-gray-200 hover:border-[#00B4D8] transition-all shadow-xs hover:shadow-md p-4 gap-5"
                  >
                    <Link
                      to={prodHref}
                      className="w-full sm:w-44 h-40 bg-gray-50 rounded-xl overflow-hidden relative shrink-0 flex items-center justify-center p-3 border border-gray-100"
                    >
                      <BlurProductImage
                        loading={idx < 4 ? 'eager' : 'lazy'}
                        decoding="async"
                        width={300}
                        height={300}
                        src={imgUrl}
                        seed={prodSlug}
                        title={prodImgSeo.title}
                        alt={prodImgSeo.alt}
                        className="w-full h-full object-contain mix-blend-multiply"
                      />
                    </Link>
                    <div className="flex-1 flex flex-col min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-[11px] font-black uppercase tracking-wider text-[#0088A8]">{product.brand}</span>
                        {badges.mpn && (
                          <span className="text-[11px] font-mono font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                            MPN: {badges.mpn}
                          </span>
                        )}
                        {badges.gtin && (
                          <span className="text-[10px] font-mono text-gray-400">GTIN: {badges.gtin}</span>
                        )}
                      </div>
                      <Link to={prodHref}>
                        <h3 className="font-black text-base sm:text-lg text-[#1A2B4C] group-hover:text-[#00B4D8] transition-colors mb-1 leading-snug">
                          {product.productName}
                        </h3>
                      </Link>
                      <div
                        className="text-gray-500 text-xs font-medium line-clamp-2 mb-3"
                        dangerouslySetInnerHTML={{
                          __html: cleanRichTextHtml(product.shortDescription || product.description || ''),
                        }}
                      />
                      <div className="mt-auto pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <div className="flex items-baseline gap-2">
                            <span className="font-black text-xl text-[#1A2B4C]">{formatPrice(effectivePrice)}</span>
                            {hasSale && (
                              <span className="text-xs text-gray-400 line-through font-bold">{formatPrice(regularPrice)}</span>
                            )}
                          </div>
                          <p className="text-[11px] font-bold text-emerald-700">
                            {badges.isFreeShipping ? 'Free Insured Nationwide Shipping' : 'In Stock • Official Pakistan Warranty'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            addToCart({
                              id: product.id || prodSlug,
                              name: product.productName,
                              price: effectivePrice,
                              image: imgUrl,
                              brand: product.brand,
                            } as any)
                          }
                          className="bg-[#1A2B4C] hover:bg-[#00B4D8] text-white h-10 px-5 rounded-xl flex items-center justify-center text-xs font-black uppercase tracking-wider gap-1.5 cursor-pointer"
                        >
                          <Zap size={14} /> Add to Cart
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {filteredCategoryProducts.length === 0 && (
                <div className="col-span-full py-14 text-center bg-white rounded-3xl border border-gray-200 px-6">
                  <Box size={40} className="text-gray-300 mx-auto mb-3" />
                  <h3 className="text-lg font-black text-[#1A2B4C] mb-1">No Matching Hardware In {currentCategory.name}</h3>
                  <p className="text-gray-500 font-medium max-w-sm mx-auto text-xs mb-4">
                    No items matched all selected filters. Reset your criteria to view all {categoryProducts.length} products in this department.
                  </p>
                  <button
                    type="button"
                    onClick={clearCategoryFilters}
                    className="bg-[#1A2B4C] text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider hover:bg-[#00B4D8] cursor-pointer"
                  >
                    Reset Category Filters
                  </button>
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>
      
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 bg-white rounded-[32px] p-8 sm:p-10 border border-gray-100 shadow-sm space-y-6">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
          <span className="block text-[10px] font-black uppercase tracking-widest text-[#00B4D8] mb-1">
            Answer-First Procurement Summary ({currentCategory.name})
          </span>
          <p className="text-sm sm:text-base font-bold text-[#1A2B4C] leading-relaxed">
            {isLedTvCategory
              ? `For corporate boardrooms, reception displays, hospitality lounges, and homes across Pakistan, AV Live supplies ${categoryProducts.length} in-stock Samsung Crystal UHD & Smart TVs (32"–85"), TCL 4K Google & Smart LED TVs (32"–75"), and Horion 4K Interactive Flat Panels—complete with transparent PKR pricing, official local warranty, FBR GST corporate billing, and optional wall-mount installation in Lahore, Karachi, and Islamabad.`
              : `For enterprise deployments in Pakistan, AV Live supplies ${categoryProducts.length} verified ${currentCategory.name} models from ${brandsIncategory.slice(0, 5).join(', ') || 'HP Poly, Cisco, Logitech, and Yealink'}—complete with GS1 GTIN/MPN verification, official 1-to-3 year Pakistan warranty, and turnkey installation in Lahore, Karachi, and Islamabad.`}
          </p>
        </div>

        <h2 className="text-2xl font-black text-[#1A2B4C]">
          {currentCategory.name} Comparison &amp; Reference Price Matrix (Pakistan)
        </h2>

        {categoryProducts.length > 0 && (
          <div className="overflow-x-auto rounded-2xl border border-gray-200">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <caption className="bg-[#1A2B4C] text-white font-black text-left px-5 py-3 text-xs uppercase tracking-wider">
                Top {currentCategory.name} Models — Specifications &amp; PKR Pricing
              </caption>
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-[#1A2B4C] font-black uppercase text-[11px] tracking-wider">
                  <th className="py-3 px-4">Hardware Model</th>
                  <th className="py-3 px-4">Brand</th>
                  <th className="py-3 px-4">{isLedTvCategory ? 'Screen Size & Series' : 'Part Number (SKU/MPN)'}</th>
                  <th className="py-3 px-4">Reference Price ({currency})</th>
                  <th className="py-3 px-4">Warranty &amp; Availability</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categoryProducts.slice(0, isLedTvCategory ? 12 : 8).map((prod) => {
                  const slug = getCanonicalProductSlug(prod);
                  const prodHref = getProductHref(prod, prod.id);
                  const { effectivePrice } = resolveProductPricing(prod);
                  const tvRow = getTvCatalogEntry(slug);
                  return (
                    <tr key={prod.id || slug} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3 px-4 font-black text-[#1A2B4C]">
                        <Link to={prodHref} className="hover:text-[#00B4D8] transition-colors">
                          {prod.productName}
                        </Link>
                      </td>
                      <td className="py-3 px-4 font-bold text-gray-600">{prod.brand}</td>
                      <td className="py-3 px-4 font-mono text-xs text-gray-500">
                        {isLedTvCategory && tvRow
                          ? `${tvRow.size} · ${tvRow.modelSeries}`
                          : prod.sku || prod.mpn || 'Official OEM'}
                      </td>
                      <td className="py-3 px-4 font-black text-[#00B4D8] tabular-nums">{formatPrice(effectivePrice)}</td>
                      <td className="py-3 px-4 font-bold text-emerald-600">In Stock • Official PK Warranty</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <p className="text-gray-600 leading-relaxed">
          {isLedTvCategory
            ? 'Compare Samsung Crystal UHD (U8000F, DU8000, DU7000) with Tizen OS, TCL 4K Google TV (V6D, P6L, P755, P6K, P79L, T6D) with AiPQ imaging and Dolby Audio, and Horion 4K interactive displays for executive boardrooms, auditoriums, and commercial signage in Pakistan.'
            : <>When investing in <strong>{currentCategory.name.toLowerCase()}</strong> for your corporate boardroom, <strong>hybrid event</strong>, or <strong>Corporate event management</strong> infrastructure in Pakistan, selecting genuine, PTA-compliant hardware is critical. At AV Live, we supply and integrate flagship <strong>Video conference</strong> systems—including the <strong>Polycom Group 500</strong> and <strong>Poly X70</strong>—alongside commercial audio, IP telephony, and <strong>Hologram Display</strong> solutions.</>}
        </p>
        <p className="text-gray-600 leading-relaxed">
          Our certified technical consultants in <strong>Lahore, Karachi, and Islamabad</strong> provide acoustic room surveys, GS1-verified hardware procurement, and turnkey onsite installation for all <strong>{currentCategory.name.toLowerCase()}</strong> deployments.
        </p>

        <div className="pt-4 border-t border-gray-100 flex flex-wrap gap-3">
          <Link to="/room-designer" className="text-xs font-black text-white bg-[#00B4D8] hover:bg-[#1A2B4C] px-4 py-2 rounded-lg transition-colors">
            Launch 3D Room Designer &amp; LED Calculator →
          </Link>
          <Link to="/video-conference-in-pakistan" className="text-xs font-bold text-[#1A2B4C] hover:text-[#00B4D8] bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 transition-colors">
            Parent Pillar: Video Conference in Pakistan →
          </Link>
          <Link to="/event-management-in-pakistan" className="text-xs font-bold text-[#1A2B4C] hover:text-[#00B4D8] bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 transition-colors">
            Parent Pillar: Event Management in Pakistan →
          </Link>
          <Link to="/blog/logitech-rally-bar-vs-poly-studio-x50-pakistan" className="text-xs font-bold text-[#1A2B4C] hover:text-[#00B4D8] bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 transition-colors">
            Logitech Rally Bar vs. Poly Studio X50 Guide →
          </Link>
          <Link to="/blog/yealink-vs-cisco-video-conferencing-pakistan" className="text-xs font-bold text-[#1A2B4C] hover:text-[#00B4D8] bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 transition-colors">
            Yealink vs. Cisco Room Kits Comparison →
          </Link>
          <Link to="/blog/boardroom-av-system-price-guide-pakistan" className="text-xs font-bold text-[#1A2B4C] hover:text-[#00B4D8] bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 transition-colors">
            6–30 Person Boardroom BoM Price Guide →
          </Link>
          <Link to="/blog/banking-healthcare-university-av-solutions-pakistan" className="text-xs font-bold text-[#1A2B4C] hover:text-[#00B4D8] bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 transition-colors">
            Banking, Healthcare &amp; University AV Guide →
          </Link>
        </div>
      </section>
    </div>
  );
}

