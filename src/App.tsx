import { Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Menu, ShoppingCart, User, X, MapPin, Phone, Search, ChevronDown, ArrowUp, Check, ArrowRight } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import React from 'react';
import { subscribeToProducts, subscribeToCategories } from './lib/firebase/firestore-helpers';
import { getCanonicalProductSlug } from './lib/gmc-feed';
import { getCartCount } from './lib/cart';

// Synchronous public SEO routes for instant 0ms navigation & zero-spinner Googlebot WRS hydration
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { Solutions } from './pages/Solutions';
import { Services } from './pages/Services';
import { Esports } from './pages/Esports';
import { RoomDesigner } from './pages/RoomDesigner';
import { ProductDetails } from './pages/ProductDetails';
import { Category } from './pages/Category';
import { Contact } from './pages/Contact';
import { Blog } from './pages/Blog';
import { BuyersGuides } from './pages/BuyersGuides';
import { About } from './pages/About';
import { Reviews } from './pages/Reviews';
import { Compare } from './pages/Compare';
import { FAQs } from './pages/FAQs';
import { Payment } from './pages/Payment';
import { Shipping } from './pages/Shipping';
import { Returns } from './pages/Returns';
import { RMA } from './pages/RMA';
import { BlindDropShipping } from './pages/BlindDropShipping';
import { GovEdPricing } from './pages/GovEdPricing';
import { FulfillmentServices } from './pages/FulfillmentServices';
import { Promotions } from './pages/Promotions';
import { Provisioning } from './pages/Provisioning';
import { Quote } from './pages/Quote';
import { Reseller } from './pages/Reseller';
import { VoipService } from './pages/VoipService';
import { KeywordLandingPage } from './pages/KeywordLandingPage';
import { EventQuote } from './pages/EventQuote';
import { ServicesLanding } from './pages/services/ServicesLanding';
import { ServiceDetail } from './pages/services/ServiceDetail';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfService } from './pages/TermsOfService';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { HtmlSitemap } from './pages/HtmlSitemap';

// Lazy-loaded admin panels & setup wizard
const AdminLayout = React.lazy(() => import('./pages/admin/AdminLayout').then(m => ({ default: m.AdminLayout || m.default })));
const Overview = React.lazy(() => import('./pages/admin/Overview').then(m => ({ default: m.Overview })));
const HomepageEditor = React.lazy(() => import('./pages/admin/HomepageEditor').then(m => ({ default: m.HomepageEditor })));
const AboutEditor = React.lazy(() => import('./pages/admin/AboutEditor').then(m => ({ default: m.AboutEditor })));
const ContactEditor = React.lazy(() => import('./pages/admin/ContactEditor').then(m => ({ default: m.ContactEditor })));
const ServicesEditor = React.lazy(() => import('./pages/admin/ServicesEditor').then(m => ({ default: m.ServicesEditor })));
const ServiceManagement = React.lazy(() => import('./pages/admin/ServiceManagement').then(m => ({ default: m.ServiceManagement })));
const ProductManagement = React.lazy(() => import('./pages/admin/ProductManagement').then(m => ({ default: m.ProductManagement })));
const InventoryDashboard = React.lazy(() => import('./pages/admin/InventoryDashboard').then(m => ({ default: m.InventoryDashboard })));
const EventQuotesManager = React.lazy(() => import('./pages/admin/EventQuotesManager').then(m => ({ default: m.EventQuotesManager })));
const OrderManagement = React.lazy(() => import('./pages/admin/OrderManagement').then(m => ({ default: m.OrderManagement })));
const RMAManagement = React.lazy(() => import('./pages/admin/RMAManagement').then(m => ({ default: m.RMAManagement })));
const UserManager = React.lazy(() => import('./pages/admin/UserManager').then(m => ({ default: m.UserManager })));
const StaffManagement = React.lazy(() => import('./pages/admin/StaffManagement').then(m => ({ default: m.StaffManagement })));
const SettingsPage = React.lazy(() => import('./pages/admin/SettingsPage').then(m => ({ default: m.SettingsPage })));
const PaymentSettings = React.lazy(() => import('./pages/admin/PaymentSettings').then(m => ({ default: m.PaymentSettings })));
const DataManagement = React.lazy(() => import('./pages/admin/DataManagement').then(m => ({ default: m.DataManagement })));
const CategoryManagement = React.lazy(() => import('./pages/admin/CategoryManagement').then(m => ({ default: m.CategoryManagement })));
const MediaGuide = React.lazy(() => import('./pages/admin/MediaGuide').then(m => ({ default: m.MediaGuide })));
const WorkspaceHub = React.lazy(() => import('./pages/admin/WorkspaceHub').then(m => ({ default: m.WorkspaceHub })));
const WorkflowAutomation = React.lazy(() => import('./pages/admin/WorkflowAutomation').then(m => ({ default: m.WorkflowAutomation })));
const GoogleBusinessExport = React.lazy(() => import('./pages/admin/GoogleBusinessExport').then(m => ({ default: m.GoogleBusinessExport })));
const AdminLogin = React.lazy(() => import('./pages/admin/AdminLogin').then(m => ({ default: m.AdminLogin })));
const Unauthorized = React.lazy(() => import('./pages/admin/Unauthorized').then(m => ({ default: m.Unauthorized })));
const SetupWizard = React.lazy(() => import('./pages/SetupWizard').then(m => ({ default: m.SetupWizard })));

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { CartProvider, useCart } from './contexts/CartContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Footer } from './components/Footer';

const CookieConsent = React.lazy(() => import('./components/CookieConsent').then(m => ({ default: m.CookieConsent })));
const AIAssist = React.lazy(() => import('./components/AIAssist').then(m => ({ default: m.AIAssist })));

const DEFAULT_NAV_CATEGORIES = [
  { id: 'cat-video', name: 'Video Conferencing', slug: 'video-conferencing', isActive: true, parentId: null, type: 'product' },
  { id: 'cat-codecs', name: 'Boardroom Codecs', slug: 'boardroom-codecs', isActive: true, parentId: 'cat-video', type: 'product' },
  { id: 'cat-large-room', name: 'Large Room Systems', slug: 'large-room', isActive: true, parentId: 'cat-video', type: 'product' },
  { id: 'cat-ptz', name: 'PTZ Cameras', slug: 'ptz-cameras', isActive: true, parentId: 'cat-video', type: 'product' },
  { id: 'cat-touch', name: 'Touch Panels & Displays', slug: 'touch-panels', isActive: true, parentId: 'cat-video', type: 'product' },
  { id: 'cat-speakerphones', name: 'Speakerphones & Mics', slug: 'speakerphones', isActive: true, parentId: 'cat-video', type: 'product' },
  { id: 'cat-phones', name: 'IP Phones', slug: 'ip-phones', isActive: true, parentId: null, type: 'product' },
  { id: 'cat-voip', name: 'VoIP Phone Systems', slug: 'voip-phone-systems', isActive: true, parentId: null, type: 'product' },
  { id: 'cat-headsets', name: 'Headsets', slug: 'headsets', isActive: true, parentId: null, type: 'product' },
  { id: 'cat-projectors', name: 'Projectors', slug: 'projectors', isActive: true, parentId: null, type: 'product' },
  { id: 'cat-cameras', name: 'IP Cameras', slug: 'ip-cameras', isActive: true, parentId: null, type: 'product' },
  { id: 'cat-intercom', name: 'Intercom, Paging & Access', slug: 'intercom-paging-access', isActive: true, parentId: null, type: 'product' },
];

function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) setIsVisible(true);
      else setIsVisible(false);
    };
    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);
  
  if (!isVisible) return null;
  
  return (
    <button 
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-6 right-6 p-4 bg-[#00B4D8] text-white rounded-full shadow-2xl hover:bg-[#1A2B4C] hover:-translate-y-1 transition-all z-[100]"
      aria-label="Back to top"
    >
      <ArrowUp size={24} strokeWidth={2.5} />
    </button>
  );
}


function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const { itemCount } = useCart();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const { user, userProfile, logout, isAuthenticated, isAdmin, isEditor, isSupport } = useAuth();

  // Search and Suggestions State
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>(DEFAULT_NAV_CATEGORIES);
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [navCategories, setNavCategories] = useState<any[]>(DEFAULT_NAV_CATEGORIES);
  const [mobileExpandedCategory, setMobileExpandedCategory] = useState<string | null>(null);

  // Immediately close all dropdowns and mobile drawers when route changes
  useEffect(() => {
    setActiveDropdown(null);
    setIsOpen(false);
    setShowSuggestions(false);
    setShowCategoryDropdown(false);
    setShowUserMenu(false);
  }, [location.pathname, location.search]);

  const closeAllMenus = () => {
    setActiveDropdown(null);
    setIsOpen(false);
    setShowSuggestions(false);
  };

  const getInitials = () => {
    const name = userProfile?.displayName || user?.displayName || userProfile?.email || user?.email || 'U';
    return name.substring(0, 2).toUpperCase();
  };

  const getRoleLabel = () => {
    switch (userProfile?.role) {
      case 'admin': return 'Administrator';
      case 'editor': return 'Content Editor';
      case 'support': return 'Support Agent';
      case 'customer': return 'Customer';
      default: return 'User';
    }
  };

  useEffect(() => {
    // Fetch active products and parent categories
    const unsubProducts = subscribeToProducts((data) => {
      setProducts(data);
    }, { isActive: true });

    const unsubCategories = subscribeToCategories((cats) => {
      const productCats = cats.filter(c => c.isActive && ((c as any).type === 'product' || !('type' in c)));
      if (productCats.length > 0) {
        setNavCategories(productCats);
        setCategories(productCats.filter(c => !c.parentId));
      }
    });

    // Handle click outside suggestions and user menu
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target as Node)) {
        setShowCategoryDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      unsubProducts();
      unsubCategories();
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Update live search suggestions when query or category changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchSuggestions([]);
      return;
    }
    const queryStr = searchQuery.toLowerCase();
    let filtered = products;

    // Filter by selected category if any
    if (selectedCategory && selectedCategory !== 'All') {
      const cat = categories.find(c => c.id === selectedCategory);
      filtered = filtered.filter(p => 
        p.categoryIds?.includes(selectedCategory) || 
        (cat && (Array.isArray(p.categorySlugs) ? p.categorySlugs : (typeof p.categorySlugs === 'string' ? [p.categorySlugs] : [])).includes(cat.slug))
      );
    }

    // Match query against name, brand, or SKU
    const matched = filtered.filter(p => 
      (p.productName || p.name || '').toLowerCase().includes(queryStr) ||
      (p.brand || '').toLowerCase().includes(queryStr) ||
      (p.sku || '').toLowerCase().includes(queryStr)
    ).slice(0, 5);
    
    setSearchSuggestions(matched);
  }, [searchQuery, selectedCategory, products, categories]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setShowSuggestions(false);
    
    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.set('q', searchQuery.trim());
    }
    if (selectedCategory && selectedCategory !== 'All') {
      params.set('category', selectedCategory);
    }
    
    navigate(`/shop?${params.toString()}`);
  };

  return (
    <>
      <div className="bg-[#f8f9fa] text-gray-600 px-4 md:px-8 text-[13px] flex justify-between items-center border-b border-gray-200 font-medium h-10 shrink-0">
        <div className="flex items-center gap-6">
          <a href="tel:+923214256263" className="flex items-center gap-1.5 hover:text-[#00B4D8] transition-colors"><Phone size={14} className="text-[#00B4D8]" /> 0321 425 6263</a>
          <span className="hidden sm:flex items-center gap-1.5"><MapPin size={14} className="text-[#00B4D8]" /> Johar Town Block N, Lahore</span>
        </div>
        <div className="flex items-center gap-5">
          <Link to="/sitemap" className="hidden md:inline hover:text-[#00B4D8] transition-colors font-semibold text-[#1A2B4C]">Site Directory</Link>
          <Link to="/contact" className="hover:text-[#00B4D8] transition-colors">Contact Us</Link>
          <Link to="/blog" className="hover:text-[#00B4D8] transition-colors">Blog</Link>
          <Link to="/guides" className="hidden sm:inline hover:text-[#00B4D8] transition-colors">Buyer's Guides</Link>
          {isAuthenticated ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-1.5 hover:text-[#00B4D8] transition-colors focus:outline-none cursor-pointer"
              >
                {userProfile?.photoURL || user?.photoURL ? (
                  <img
                    src={userProfile?.photoURL || user?.photoURL || undefined}
                    alt={userProfile?.displayName || user?.displayName || 'User'}
                    className="w-5 h-5 rounded-full object-cover border border-[#00B4D8]"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-[#00B4D8] text-white flex items-center justify-center font-black text-[9px]">
                    {getInitials()}
                  </div>
                )}
                <span className="max-w-[100px] truncate hidden md:inline">
                  {userProfile?.displayName || user?.displayName || userProfile?.email?.split('@')[0] || 'Account'}
                </span>
                <ChevronDown size={12} className={`transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[100] py-3 text-[#1A2B4C] normal-case">
                  <div className="px-4 py-2 border-b border-gray-50 mb-2">
                    <div className="font-black text-[9px] text-gray-400 uppercase tracking-widest mb-1">Signed In As</div>
                    <div className="font-black text-[#1A2B4C] truncate text-sm">
                      {userProfile?.displayName || user?.displayName || 'Active Member'}
                    </div>
                    <div className="text-[11px] text-gray-400 truncate">{userProfile?.email || user?.email}</div>
                    
                    <div className="mt-2 inline-flex items-center gap-1 bg-[#00B4D8]/10 text-[#00B4D8] px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider">
                      {getRoleLabel()}
                    </div>
                  </div>

                  {(isAdmin || isEditor || isSupport) && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-2 px-4 py-2 text-xs font-black text-[#1A2B4C] hover:bg-gray-50 hover:text-[#00B4D8] transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User size={14} />
                      Admin Dashboard
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs font-black text-red-600 hover:bg-red-50 transition-colors text-left"
                  >
                    <User size={14} className="rotate-180" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/admin/login" className="hover:text-[#00B4D8] transition-colors flex items-center gap-1">
              <User size={14} className="mb-0.5" />
              Sign In
            </Link>
          )}
        </div>
      </div>

      {/* Fixed Stable Header (No layout-jumping scroll collapse) */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 flex items-center justify-between gap-4 md:gap-8 h-20">
          <div className="flex items-center gap-4 md:gap-8 flex-1">
            <Link to="/" onClick={closeAllMenus} className="flex flex-col justify-center shrink-0">
              <div className="flex items-stretch">
                <div className="bg-black text-[#f0f0f0] font-black text-2xl md:text-3xl px-2.5 py-1 leading-none tracking-tight">AV</div>
                <div className="text-black font-black text-2xl md:text-[30px] leading-none ml-2 flex items-center tracking-tight">Live</div>
              </div>
              <div className="text-black font-light text-[10px] tracking-[0.42em] mt-1 ml-0.5 uppercase">Communication</div>
            </Link>

            <div className="shrink-0 hidden lg:flex flex-col">
              <a href="tel:+923214256263" className="text-[#F26522] font-black text-lg tracking-tight leading-tight hover:underline">0321 425 6263</a>
              <div className="text-gray-500 text-[11px] font-medium uppercase tracking-wider">9 AM - 6 PM PKT M-S</div>
            </div>

            <div ref={searchRef} className="flex-1 relative max-w-2xl">
              <form onSubmit={handleSearchSubmit} className="flex w-full bg-gray-50/70 hover:bg-white focus-within:bg-white border border-gray-200 focus-within:border-[#00B4D8] focus-within:ring-4 focus-within:ring-[#00B4D8]/10 rounded-full overflow-visible transition-all duration-200 relative items-center pr-1.5 h-11 shadow-sm">
                {/* Custom category select */}
                <div ref={categoryDropdownRef} className="relative h-full hidden sm:flex items-center shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                    className="flex items-center gap-2 px-4 h-full bg-gray-100/60 hover:bg-gray-100 text-gray-700 hover:text-[#1A2B4C] font-semibold text-xs border-r border-gray-200/60 transition-colors focus:outline-none shrink-0 rounded-l-full cursor-pointer"
                  >
                    <span className="max-w-[110px] truncate">
                      {selectedCategory === 'All' ? 'All Categories' : (categories.find(c => c.id === selectedCategory)?.name || 'Category')}
                    </span>
                    <ChevronDown size={12} className={`text-gray-400 transition-transform duration-200 ${showCategoryDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {showCategoryDropdown && (
                    <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 py-1.5 z-50">
                      <div className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-50 mb-1">Filter Categories</div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCategory('All');
                          setShowCategoryDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors flex items-center justify-between ${selectedCategory === 'All' ? 'bg-[#00B4D8]/10 text-[#00B4D8]' : 'text-[#1A2B4C] hover:bg-gray-50'}`}
                      >
                        <span>All Categories</span>
                        {selectedCategory === 'All' && <Check size={14} />}
                      </button>
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            setSelectedCategory(cat.id);
                            setShowCategoryDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors flex items-center justify-between ${selectedCategory === cat.id ? 'bg-[#00B4D8]/10 text-[#00B4D8]' : 'text-[#1A2B4C] hover:bg-gray-50'}`}
                        >
                          <span>{cat.name}</span>
                          {selectedCategory === cat.id && <Check size={14} />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <label htmlFor="navbar-search" className="sr-only">Search products</label>
                <input 
                  id="navbar-search"
                  type="text" 
                  placeholder="Search professional AV & VoIP hardware..."
                  className="flex-1 px-4 py-2 bg-transparent focus:outline-none text-sm placeholder-gray-400 font-semibold text-[#1A2B4C]"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(e.target.value.trim().length > 0);
                  }}
                  onFocus={() => {
                    if (searchQuery.trim().length > 0) {
                      setShowSuggestions(true);
                    }
                  }}
                />
                <button 
                  type="submit" 
                  aria-label="Search" 
                  className="bg-[#1A2B4C] hover:bg-[#00B4D8] text-white rounded-full flex items-center justify-center transition-all duration-200 shrink-0 shadow-sm w-8 h-8 cursor-pointer"
                >
                  <Search size={15} />
                </button>
              </form>

              {/* Search Suggestions & Discovery Panel */}
              {showSuggestions && searchQuery.trim().length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden divide-y divide-gray-50">
                  {searchSuggestions.length > 0 ? (
                    <div>
                      <div className="px-4 py-2 bg-gray-50/60 text-[10px] font-black uppercase tracking-widest text-[#00B4D8] flex justify-between items-center">
                        <span>Matching Hardware</span>
                        <span>{searchSuggestions.length} items found</span>
                      </div>
                      <div className="max-h-[360px] overflow-y-auto divide-y divide-gray-50">
                        {searchSuggestions.map((product, sIdx) => (
                          <Link 
                            key={`${product.id || product.slug || sIdx}`} 
                            to={`/product/${getCanonicalProductSlug(product, product.id)}`}
                            className="flex items-center gap-4 p-3.5 hover:bg-gray-50/80 transition-colors group"
                            onClick={closeAllMenus}
                          >
                            <div className="w-11 h-11 bg-white rounded-xl border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center shadow-sm">
                              <img 
                                src={product.images?.[0] || 'https://via.placeholder.com/48'} 
                                alt={product.productName} 
                                className="w-full h-full object-contain p-1.5" 
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-sm text-[#1A2B4C] group-hover:text-[#00B4D8] transition-colors truncate">
                                {product.productName}
                              </div>
                              <div className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mt-0.5">
                                {product.brand} • <span className="text-gray-300">SKU:</span> {product.sku}
                              </div>
                            </div>
                            <div className="shrink-0 text-right">
                              <div className="text-xs font-black text-[#1A2B4C]">
                                {product.salePrice ? `Rs. ${product.salePrice.toLocaleString()}` : 'Contact for Price'}
                              </div>
                              {product.stockQuantity > 0 ? (
                                <span className="inline-block text-[9px] font-bold text-green-600 bg-green-50 px-2.5 py-0.5 rounded-full mt-1">In Stock</span>
                              ) : (
                                <span className="inline-block text-[9px] font-bold text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full mt-1">Special Order</span>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                      <button 
                        onClick={handleSearchSubmit} 
                        className="w-full text-center py-3 text-xs font-black text-[#00B4D8] hover:bg-gray-50 border-t border-gray-100 uppercase tracking-widest transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        View All Search Results <ArrowRight size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-300">
                        <Search size={20} />
                      </div>
                      <div className="text-sm font-bold text-[#1A2B4C]">No Hardware Found</div>
                      <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">We couldn't find matches for "{searchQuery}". Check spelling or try a different category.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link to="/cart" onClick={closeAllMenus} aria-label={`Shopping cart, containing ${itemCount} items`} className="relative p-2 text-[#1A2B4C] hover:text-[#00B4D8] transition-colors group">
              <ShoppingCart size={24} className="group-hover:scale-110 transition-transform" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#F26522] text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">{itemCount}</span>
              )}
            </Link>
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle mobile menu"
              className="lg:hidden p-2 text-[#1A2B4C] hover:text-[#00B4D8] transition-colors cursor-pointer"
            >
              {isOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>

        {/* Main Navigation Row - Always visible on Desktop (No scroll-collapse jitter) & Controlled Dropdowns */}
        <nav
          aria-label="Primary Navigation"
          className="border-t border-gray-100 hidden lg:block h-12 bg-white"
          onPointerLeave={(e) => { if (e.pointerType === 'mouse') setActiveDropdown(null); }}
        >
          <div className="max-w-[1400px] mx-auto px-4 md:px-8 h-full flex items-center gap-7 text-[12px] font-bold text-[#1A2B4C] uppercase tracking-wider">
            {/* HOME with Dropdown */}
            <div
              className="h-12 flex items-center relative"
              onPointerEnter={(e) => { if (e.pointerType === 'mouse') setActiveDropdown('home'); }}
              onPointerLeave={(e) => { if (e.pointerType === 'mouse') setActiveDropdown(null); }}
            >
              <Link
                to="/"
                onClick={closeAllMenus}
                className={`h-12 flex items-center gap-1 border-b-[3px] transition-colors ${activeDropdown === 'home' || location.pathname === '/' ? 'border-[#00B4D8] text-[#00B4D8]' : 'border-transparent hover:text-[#00B4D8]'}`}
              >
                HOME <ChevronDown size={12} />
              </Link>
              <div className={`absolute top-12 left-0 w-[250px] bg-white shadow-2xl z-50 border border-gray-100 rounded-b-2xl p-5 transition-opacity duration-150 ${activeDropdown === 'home' ? 'opacity-100 visible pointer-events-auto' : 'opacity-0 invisible pointer-events-none'}`}>
                <ul className="space-y-3 text-[13px] text-gray-700 font-semibold capitalize tracking-normal">
                  <li><Link to="/about" onClick={closeAllMenus} className="hover:text-[#00B4D8] transition-colors block">About Us</Link></li>
                  <li><Link to="/contact" onClick={closeAllMenus} className="hover:text-[#00B4D8] transition-colors block">Contact Us</Link></li>
                  <li><Link to="/blog" onClick={closeAllMenus} className="hover:text-[#00B4D8] transition-colors block">Company Blog</Link></li>
                  <li><Link to="/guides" onClick={closeAllMenus} className="hover:text-[#00B4D8] transition-colors block">Buyer's Guides</Link></li>
                  <li className="pt-2 border-t border-gray-100"><Link to="/sitemap" onClick={closeAllMenus} className="text-[#00B4D8] hover:text-[#1A2B4C] font-bold transition-colors block">Complete Site Directory (153+ Pages)</Link></li>
                </ul>
              </div>
            </div>
            
            {/* PRODUCTS */}
            <div
              className="h-12 flex items-center relative"
              onPointerEnter={(e) => { if (e.pointerType === 'mouse') setActiveDropdown('products'); }}
              onPointerLeave={(e) => { if (e.pointerType === 'mouse') setActiveDropdown(null); }}
            >
              <Link
                to="/shop"
                onClick={closeAllMenus}
                className={`h-12 flex items-center gap-1 border-b-[3px] transition-colors ${activeDropdown === 'products' || location.pathname.startsWith('/shop') || location.pathname.startsWith('/category') ? 'border-[#00B4D8] text-[#00B4D8]' : 'border-transparent hover:text-[#00B4D8]'}`}
              >
                PRODUCTS <ChevronDown size={12} />
              </Link>
              <div className={`absolute top-12 left-0 w-72 bg-white shadow-2xl z-50 border border-gray-100 rounded-b-2xl py-2 transition-opacity duration-150 ${activeDropdown === 'products' ? 'opacity-100 visible pointer-events-auto' : 'opacity-0 invisible pointer-events-none'}`}>
                {categories.map(parent => {
                  const subCats = navCategories.filter(c => c.parentId === parent.id);
                  return (
                    <div key={parent.id} className="relative group/sub">
                      <Link 
                        to={`/category/${parent.slug || parent.id}`} 
                        onClick={closeAllMenus}
                        className="flex items-center justify-between px-5 py-2.5 font-bold text-[#1A2B4C] hover:bg-gray-50 hover:text-[#00B4D8] transition-colors text-xs uppercase tracking-wider"
                      >
                        {parent.name}
                        {subCats.length > 0 && <ChevronDown size={14} className="-rotate-90 text-gray-400 group-hover/sub:text-[#00B4D8]" />}
                      </Link>
                      {subCats.length > 0 && (
                        <div className="absolute top-0 left-full ml-0 w-64 bg-white shadow-2xl opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible transition-all duration-150 z-50 border border-gray-100 rounded-2xl py-2">
                          <ul className="flex flex-col text-[13px] text-gray-600 font-medium capitalize tracking-normal">
                            {subCats.map(sub => (
                              <li key={sub.id}>
                                <Link to={`/category/${sub.slug || sub.id}`} onClick={closeAllMenus} className="block px-5 py-2 hover:bg-gray-50 hover:text-[#00B4D8] transition-colors">
                                  {sub.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}
                <div className="mt-1 pt-2 border-t border-gray-100 px-5 py-2">
                  <Link to="/shop" onClick={closeAllMenus} className="text-xs font-black text-[#00B4D8] hover:text-[#1A2B4C] flex items-center justify-between">
                    <span>BROWSE ALL 53+ HARDWARE SKUS</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </div>

            {/* SERVICES */}
            <div
              className="h-12 flex items-center relative"
              onPointerEnter={(e) => { if (e.pointerType === 'mouse') setActiveDropdown('services'); }}
              onPointerLeave={(e) => { if (e.pointerType === 'mouse') setActiveDropdown(null); }}
            >
              <Link
                to="/services"
                onClick={closeAllMenus}
                className={`h-12 flex items-center gap-1 border-b-[3px] transition-colors ${activeDropdown === 'services' || location.pathname.startsWith('/services') || location.pathname === '/corporate-event-management' ? 'border-[#00B4D8] text-[#00B4D8]' : 'border-transparent hover:text-[#00B4D8]'}`}
              >
                SERVICES <ChevronDown size={12} />
              </Link>
              <div className={`absolute top-12 left-0 w-[340px] bg-white shadow-2xl z-50 border border-gray-100 rounded-b-2xl p-6 transition-opacity duration-150 ${activeDropdown === 'services' ? 'opacity-100 visible pointer-events-auto' : 'opacity-0 invisible pointer-events-none'}`}>
                <ul className="space-y-2.5 text-[13px] text-gray-700 font-bold capitalize tracking-normal">
                  <li><Link to="/corporate-event-management" onClick={closeAllMenus} className="hover:text-[#00B4D8] transition-colors block">Corporate Event Management Hub</Link></li>
                  <li><Link to="/services/corporate-events" onClick={closeAllMenus} className="hover:text-[#00B4D8] transition-colors block font-semibold text-gray-600">Corporate Event Production</Link></li>
                  <li><Link to="/services/hybrid-events" onClick={closeAllMenus} className="hover:text-[#00B4D8] transition-colors block font-semibold text-gray-600">Hybrid Event Production</Link></li>
                  <li><Link to="/services/expo-organizing" onClick={closeAllMenus} className="hover:text-[#00B4D8] transition-colors block font-semibold text-gray-600">Expo &amp; Trade Show Organizing</Link></li>
                  <li><Link to="/services/esports-events" onClick={closeAllMenus} className="hover:text-[#00B4D8] transition-colors block font-semibold text-gray-600">e-Sports Arena Production</Link></li>
                  <li><Link to="/services/boardroom-integration" onClick={closeAllMenus} className="hover:text-[#00B4D8] transition-colors block font-semibold text-gray-600">Boardroom AV Integration</Link></li>
                  <li><Link to="/services/voip-telephony" onClick={closeAllMenus} className="hover:text-[#00B4D8] transition-colors block font-semibold text-gray-600">Enterprise VoIP &amp; IP-PBX</Link></li>
                  <li><Link to="/live-streaming-services" onClick={closeAllMenus} className="hover:text-[#00B4D8] transition-colors block">Live Streaming Services</Link></li>
                  <li><Link to="/av-equipment-rental" onClick={closeAllMenus} className="hover:text-[#00B4D8] transition-colors block">AV Equipment Rental</Link></li>
                  <li><Link to="/3d-hologram" onClick={closeAllMenus} className="hover:text-[#00B4D8] transition-colors block">3D Hologram Display Stages</Link></li>
                </ul>
              </div>
            </div>

            {/* VIDEO CONFERENCE */}
            <div
              className="h-12 flex items-center relative"
              onPointerEnter={(e) => { if (e.pointerType === 'mouse') setActiveDropdown('video'); }}
              onPointerLeave={(e) => { if (e.pointerType === 'mouse') setActiveDropdown(null); }}
            >
              <Link
                to="/video-conference-in-pakistan"
                onClick={closeAllMenus}
                className={`h-12 flex items-center gap-1 border-b-[3px] transition-colors ${activeDropdown === 'video' || location.pathname.includes('video-conferenc') ? 'border-[#00B4D8] text-[#00B4D8]' : 'border-transparent hover:text-[#00B4D8]'}`}
              >
                VIDEO CONFERENCE <ChevronDown size={12} />
              </Link>
              <div className={`absolute top-12 left-1/2 -translate-x-1/2 w-[560px] bg-white shadow-2xl z-50 border border-gray-100 rounded-b-2xl p-6 transition-opacity duration-150 ${activeDropdown === 'video' ? 'opacity-100 visible pointer-events-auto' : 'opacity-0 invisible pointer-events-none'}`}>
                <div className="mb-4 pb-3 border-b border-gray-100 bg-blue-50/60 p-3.5 rounded-xl space-y-2">
                  <Link to="/video-conference-in-pakistan" onClick={closeAllMenus} className="font-black text-xs text-[#1A2B4C] hover:text-[#00B4D8] flex items-center justify-between uppercase tracking-wider">
                    <span>Video Conference in Pakistan — Complete Pillar Hub</span>
                    <ArrowRight size={14} />
                  </Link>
                  <Link to="/video-conferencing-solutions" onClick={closeAllMenus} className="font-bold text-[11px] text-[#00B4D8] hover:underline block normal-case">
                    Explore Turnkey Boardroom Solutions (Polycom Group 500, Poly X70, Cisco &amp; Logitech) →
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="font-black text-[10px] text-gray-400 uppercase tracking-widest mb-3 pb-1.5 border-b border-gray-100">Boardroom Codecs &amp; Systems</div>
                    <ul className="space-y-2.5 text-[13px] text-gray-600 font-semibold capitalize tracking-normal">
                      <li><Link to="/product/polycom-realpresence-group-500-pakistan" onClick={closeAllMenus} className="hover:text-[#00B4D8] transition-colors block">Polycom Group 500</Link></li>
                      <li><Link to="/product/cisco-room-kit-plus-pakistan" onClick={closeAllMenus} className="hover:text-[#00B4D8] transition-colors block">Cisco Room Kit Plus</Link></li>
                      <li><Link to="/product/poly-studio-x72-pakistan" onClick={closeAllMenus} className="hover:text-[#00B4D8] transition-colors block">Poly Studio X72 / X70</Link></li>
                      <li><Link to="/product/poly-studio-x52-pakistan" onClick={closeAllMenus} className="hover:text-[#00B4D8] transition-colors block">Poly Studio X52</Link></li>
                    </ul>
                  </div>
                  <div>
                    <div className="font-black text-[10px] text-gray-400 uppercase tracking-widest mb-3 pb-1.5 border-b border-gray-100">All-in-One Video Bars</div>
                    <ul className="space-y-2.5 text-[13px] text-gray-600 font-semibold capitalize tracking-normal">
                      <li><Link to="/product/logitech-rally-bar-pakistan" onClick={closeAllMenus} className="hover:text-[#00B4D8] transition-colors block">Logitech Rally Bar</Link></li>
                      <li><Link to="/product/logitech-rally-bar-mini-pakistan" onClick={closeAllMenus} className="hover:text-[#00B4D8] transition-colors block">Logitech Rally Bar Mini</Link></li>
                      <li><Link to="/product/poly-studio-usb-video-bar-pakistan" onClick={closeAllMenus} className="hover:text-[#00B4D8] transition-colors block">Poly Studio USB Bar</Link></li>
                      <li>
                        <Link to="/category/video-conferencing" onClick={closeAllMenus} className="text-[#00B4D8] hover:text-[#1A2B4C] transition-colors block font-bold text-xs mt-3.5 flex items-center gap-1">
                          View All Video Hardware <ArrowRight size={12} />
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* AI SOLUTIONS */}
            <div
              className="h-12 flex items-center relative"
              onPointerEnter={(e) => { if (e.pointerType === 'mouse') setActiveDropdown('ai'); }}
              onPointerLeave={(e) => { if (e.pointerType === 'mouse') setActiveDropdown(null); }}
            >
              <Link
                to="/services/ai-development"
                onClick={closeAllMenus}
                className={`h-12 flex items-center gap-1 border-b-[3px] transition-colors ${activeDropdown === 'ai' ? 'border-[#00B4D8] text-[#00B4D8]' : 'border-transparent hover:text-[#00B4D8]'}`}
              >
                AI SOLUTIONS <ChevronDown size={12} />
              </Link>
              <div className={`absolute top-12 left-0 w-[280px] bg-white shadow-2xl z-50 border border-gray-100 rounded-b-2xl p-5 transition-opacity duration-150 ${activeDropdown === 'ai' ? 'opacity-100 visible pointer-events-auto' : 'opacity-0 invisible pointer-events-none'}`}>
                <ul className="space-y-3.5 text-[13px] text-gray-700 font-semibold capitalize tracking-normal">
                  <li><Link to="/services/ai-development" onClick={closeAllMenus} className="hover:text-[#00B4D8] transition-colors block">AI Development</Link></li>
                  <li><Link to="/services/ai-agents-workers" onClick={closeAllMenus} className="hover:text-[#00B4D8] transition-colors block">AI Agents &amp; Digital Workers</Link></li>
                  <li><Link to="/services/ai-automation" onClick={closeAllMenus} className="hover:text-[#00B4D8] transition-colors block">AI Business Automation</Link></li>
                </ul>
              </div>
            </div>

            {/* VOIP & UC */}
            <div
              className="h-12 flex items-center relative"
              onPointerEnter={(e) => { if (e.pointerType === 'mouse') setActiveDropdown('voip'); }}
              onPointerLeave={(e) => { if (e.pointerType === 'mouse') setActiveDropdown(null); }}
            >
              <Link
                to="/voip-service-providers"
                onClick={closeAllMenus}
                className={`h-12 flex items-center gap-1 border-b-[3px] transition-colors ${activeDropdown === 'voip' || location.pathname === '/voip-service-providers' ? 'border-[#00B4D8] text-[#00B4D8]' : 'border-transparent hover:text-[#00B4D8]'}`}
              >
                VOIP &amp; UC <ChevronDown size={12} />
              </Link>
              <div className={`absolute top-12 left-0 w-[290px] bg-white shadow-2xl z-50 border border-gray-100 rounded-b-2xl p-5 transition-opacity duration-150 ${activeDropdown === 'voip' ? 'opacity-100 visible pointer-events-auto' : 'opacity-0 invisible pointer-events-none'}`}>
                <ul className="space-y-3 text-[13px] text-gray-700 font-semibold capitalize tracking-normal">
                  <li><Link to="/product/3cx-pro-8-sc-pakistan" onClick={closeAllMenus} className="hover:text-[#00B4D8] transition-colors block">3CX Phone System</Link></li>
                  <li><Link to="/product/freepbx-enterprise-pakistan" onClick={closeAllMenus} className="hover:text-[#00B4D8] transition-colors block">FreePBX Enterprise</Link></li>
                  <li><Link to="/product/cisco-cucm-license-pakistan" onClick={closeAllMenus} className="hover:text-[#00B4D8] transition-colors block">Cisco CUCM License</Link></li>
                  <li><Link to="/product/grandstream-ucm6308-pakistan" onClick={closeAllMenus} className="hover:text-[#00B4D8] transition-colors block">Grandstream UCM6308</Link></li>
                  <li className="pt-2 border-t border-gray-100"><Link to="/voip-service-providers" onClick={closeAllMenus} className="hover:text-[#00B4D8] transition-colors block font-bold text-[#F26522]">VoIP Service Providers Hub</Link></li>
                </ul>
              </div>
            </div>

            {/* Direct Quick-Links */}
            <Link
              to="/corporate-event-management"
              onClick={closeAllMenus}
              className={`h-12 flex items-center border-b-[3px] transition-colors ${location.pathname === '/corporate-event-management' ? 'border-[#00B4D8] text-[#00B4D8]' : 'border-transparent hover:text-[#00B4D8]'}`}
            >
              CORPORATE EVENTS
            </Link>
            <Link
              to="/room-designer"
              onClick={closeAllMenus}
              className={`h-12 flex items-center border-b-[3px] transition-colors ${location.pathname === '/room-designer' ? 'border-[#00B4D8] text-[#00B4D8]' : 'border-transparent hover:text-[#00B4D8]'}`}
            >
              3D ROOM DESIGNER
            </Link>
          </div>
        </nav>

        {/* Mobile Menu Panel */}
        {isOpen && (
          <div className="fixed top-[80px] bottom-16 left-0 right-0 bg-white px-4 pt-2 pb-safe pb-24 space-y-4 shadow-2xl z-40 overflow-y-auto lg:hidden">
             <form onSubmit={(e) => { e.preventDefault(); handleSearchSubmit(); setIsOpen(false); }} className="py-2 mb-2 border-b border-gray-100 flex gap-2 relative sticky top-0 bg-white z-10">
                <label htmlFor="mobile-navbar-search" className="sr-only">Search products</label>
                <div className="relative flex-1">
                  <input 
                    id="mobile-navbar-search"
                    type="text" 
                    placeholder="Search professional hardware..." 
                    aria-label="Search products mobile"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full border border-gray-200 rounded-full py-2.5 pl-5 pr-10 text-sm focus:outline-none focus:border-[#00B4D8] focus:ring-2 focus:ring-[#00B4D8]/10 bg-gray-50/50 text-[#1A2B4C] font-semibold" 
                  />
                  <button type="submit" aria-label="Submit search" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#00B4D8]">
                    <Search size={16} />
                  </button>
                </div>
             </form>
            
             {/* Nested Home & Corporate Info */}
             <div className="px-2 font-black text-slate-600 text-[10px] uppercase tracking-widest border-b border-gray-100 pb-1">Home &amp; Information</div>
             <div className="pl-3 space-y-2.5">
               <Link to="/" className="hover:text-[#00B4D8] block text-sm font-bold text-[#1A2B4C]" onClick={() => setIsOpen(false)}>Home Page</Link>
               <div className="pl-4 space-y-2 border-l border-gray-200 ml-1">
                 <Link to="/video-conference-in-pakistan" className="hover:text-[#00B4D8] block text-xs font-bold text-[#00B4D8]" onClick={() => setIsOpen(false)}>Video Conference in Pakistan</Link>
                 <Link to="/corporate-event-management" className="hover:text-[#00B4D8] block text-xs font-bold text-[#00B4D8]" onClick={() => setIsOpen(false)}>Corporate Event Management</Link>
                 <Link to="/sitemap" className="hover:text-[#00B4D8] block text-xs font-bold text-[#1A2B4C]" onClick={() => setIsOpen(false)}>Complete Site Directory (153+ Pages)</Link>
                 <Link to="/about" className="hover:text-[#00B4D8] block text-xs font-semibold text-gray-600" onClick={() => setIsOpen(false)}>About Us</Link>
                 <Link to="/contact" className="hover:text-[#00B4D8] block text-xs font-semibold text-gray-600" onClick={() => setIsOpen(false)}>Contact Us</Link>
                 <Link to="/blog" className="hover:text-[#00B4D8] block text-xs font-semibold text-gray-600" onClick={() => setIsOpen(false)}>Company Blog</Link>
                 <Link to="/guides" className="hover:text-[#00B4D8] block text-xs font-semibold text-gray-600" onClick={() => setIsOpen(false)}>Buyer's Guides</Link>
               </div>
             </div>
            
             <div className="px-2 font-black text-slate-600 text-[10px] uppercase tracking-widest border-b border-gray-100 pb-1 mt-6">Products</div>
            {categories.map(parent => {
              const subCats = navCategories.filter(c => c.parentId === parent.id);
              const isExpanded = mobileExpandedCategory === parent.id;
              return (
                <div key={parent.id} className="mb-2 border-b border-gray-50 pb-2">
                  <div className="flex items-center justify-between">
                    <Link to={`/category/${parent.slug || parent.id}`} className="hover:text-[#00B4D8] block px-3 py-2 text-sm font-bold text-[#1A2B4C]" onClick={() => setIsOpen(false)}>{parent.name}</Link>
                    {subCats.length > 0 && (
                      <button 
                        onClick={() => setMobileExpandedCategory(isExpanded ? null : (parent.id || null))}
                        aria-label={`Toggle ${parent.name} subcategories`}
                        className="p-2 text-gray-500 hover:text-[#00B4D8] transition-colors"
                      >
                        <ChevronDown size={18} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>
                    )}
                  </div>
                  {subCats.length > 0 && isExpanded && (
                    <div className="pl-4 space-y-2 border-l border-[#00B4D8]/20 ml-4 mb-2 mt-1 py-1">
                      {subCats.map(sub => (
                        <Link key={sub.id} to={`/category/${sub.slug || sub.id}`} className="hover:text-[#00B4D8] block text-xs font-semibold text-gray-600 py-1" onClick={() => setIsOpen(false)}>{sub.name}</Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            <div className="px-2 font-black text-gray-400 text-[10px] uppercase tracking-widest border-b border-gray-100 pb-1 mt-6">Services &amp; Solutions</div>
            <Link to="/corporate-event-management" className="hover:text-[#00B4D8] block px-3 py-2 text-sm font-bold text-[#1A2B4C]" onClick={() => setIsOpen(false)}>Corporate Event Management</Link>
            <Link to="/live-streaming-services" className="hover:text-[#00B4D8] block px-3 py-2 text-sm font-bold text-[#1A2B4C]" onClick={() => setIsOpen(false)}>Live Streaming Services</Link>
            <Link to="/av-equipment-rental" className="hover:text-[#00B4D8] block px-3 py-2 text-sm font-bold text-[#1A2B4C]" onClick={() => setIsOpen(false)}>AV Equipment Rental</Link>
            <Link to="/video-conferencing-solutions" className="hover:text-[#00B4D8] block px-3 py-2 text-sm font-bold text-[#1A2B4C]" onClick={() => setIsOpen(false)}>Video Conferencing Solutions</Link>
            <Link to="/services/hybrid-events" className="hover:text-[#00B4D8] block px-3 py-2 text-sm font-bold text-[#1A2B4C]" onClick={() => setIsOpen(false)}>Hybrid Events</Link>
            <Link to="/services/expo-organizing" className="hover:text-[#00B4D8] block px-3 py-2 text-sm font-bold text-[#1A2B4C]" onClick={() => setIsOpen(false)}>Expo Organizing</Link>
            <Link to="/esports" className="hover:text-[#00B4D8] block px-3 py-2 text-sm font-bold text-[#1A2B4C]" onClick={() => setIsOpen(false)}>Esports Events</Link>

            <div className="px-2 font-black text-gray-400 text-[10px] uppercase tracking-widest border-b border-gray-100 pb-1 mt-6">AI Solutions</div>
            <Link to="/services/ai-development" className="hover:text-[#00B4D8] block px-3 py-2 text-sm font-bold text-[#1A2B4C]" onClick={() => setIsOpen(false)}>AI Development</Link>
            <Link to="/services/ai-agents-workers" className="hover:text-[#00B4D8] block px-3 py-2 text-sm font-bold text-[#1A2B4C]" onClick={() => setIsOpen(false)}>AI Agents</Link>
            <Link to="/services/ai-automation" className="hover:text-[#00B4D8] block px-3 py-2 text-sm font-bold text-[#1A2B4C]" onClick={() => setIsOpen(false)}>AI Business Automation</Link>

            <div className="px-2 font-black text-gray-400 text-[10px] uppercase tracking-widest border-b border-gray-100 pb-1 mt-6">VoIP &amp; UC</div>
            <Link to="/product/3cx-pro-8-sc-pakistan" className="hover:text-[#00B4D8] block px-3 py-2 text-sm font-bold text-[#1A2B4C]" onClick={() => setIsOpen(false)}>3CX Phone System</Link>
            <Link to="/product/freepbx-enterprise-pakistan" className="hover:text-[#00B4D8] block px-3 py-2 text-sm font-bold text-[#1A2B4C]" onClick={() => setIsOpen(false)}>FreePBX Enterprise</Link>
            <Link to="/product/cisco-cucm-license-pakistan" className="hover:text-[#00B4D8] block px-3 py-2 text-sm font-bold text-[#1A2B4C]" onClick={() => setIsOpen(false)}>Cisco CUCM License</Link>
            <Link to="/product/grandstream-ucm6308-pakistan" className="hover:text-[#00B4D8] block px-3 py-2 text-sm font-bold text-[#1A2B4C]" onClick={() => setIsOpen(false)}>Grandstream UCM6308</Link>
            <Link to="/voip-service-providers" className="hover:text-[#00B4D8] block px-3 py-2 text-sm font-bold text-[#1A2B4C]" onClick={() => setIsOpen(false)}>VoIP Service Providers</Link>
            
            {isAuthenticated ? (
              <div className="border-t border-gray-100 pt-4 mt-6 px-3 text-[#1A2B4C]">
                <div className="flex items-center gap-3 mb-4 bg-gray-50 p-3 rounded-2xl">
                  {userProfile?.photoURL || user?.photoURL ? (
                    <img
                      src={userProfile?.photoURL || user?.photoURL || undefined}
                      alt={userProfile?.displayName || user?.displayName || 'User'}
                      className="w-10 h-10 rounded-full object-cover border border-[#00B4D8]"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#00B4D8] text-white flex items-center justify-center font-black text-sm">
                      {getInitials()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-black text-sm text-[#1A2B4C] truncate">
                      {userProfile?.displayName || user?.displayName || 'Active Member'}
                    </div>
                    <div className="text-xs text-gray-500 truncate">{userProfile?.email || user?.email}</div>
                    <div className="mt-1 inline-flex items-center gap-1 bg-[#00B4D8]/10 text-[#00B4D8] px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider">
                      {getRoleLabel()}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {(isAdmin || isEditor || isSupport) && (
                    <Link
                      to="/admin"
                      className="w-full text-center bg-[#1A2B4C] text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#00B4D8] transition-all block"
                      onClick={() => setIsOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      logout();
                    }}
                    className="w-full text-center bg-red-50 text-red-600 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-100 transition-all block cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-t border-gray-100 pt-4 mt-6">
                <Link
                  to="/admin/login"
                  className="w-full text-center bg-[#1A2B4C] text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#00B4D8] transition-all block"
                  onClick={() => setIsOpen(false)}
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        )}
      </header>
      
      {/* Mobile Sticky Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-[100] pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-around h-16 px-2">
          <Link to="/" onClick={() => setIsOpen(false)} className="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-[#00B4D8] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            <span className="text-[9px] font-black uppercase tracking-widest mt-1">Home</span>
          </Link>
          <Link to="/shop" onClick={() => setIsOpen(false)} className="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-[#00B4D8] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            <span className="text-[9px] font-black uppercase tracking-widest mt-1">Shop</span>
          </Link>
          <button onClick={() => { setIsOpen(false); setTimeout(() => document.getElementById('mobile-navbar-search')?.focus(), 100); }} className="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-[#00B4D8] transition-colors">
            <Search size={22} />
            <span className="text-[9px] font-black uppercase tracking-widest mt-1">Search</span>
          </button>
          <Link to="/cart" onClick={() => setIsOpen(false)} className="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-[#00B4D8] transition-colors relative">
            <div className="relative">
              <ShoppingCart size={22} />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center z-10">{itemCount}</span>
              )}
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest mt-1">Cart</span>
          </Link>
          <button onClick={() => setIsOpen(!isOpen)} className="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-[#00B4D8] transition-colors">
            {isOpen ? <X size={22} /> : <Menu size={22} />}
            <span className="text-[9px] font-black uppercase tracking-widest mt-1">{isOpen ? 'Close' : 'Menu'}</span>
          </button>
        </div>
      </div>
    </>
  );
}

import { ScrollToTop } from "./components/ScrollToTop";

export default function App() {

  return (
    <SettingsProvider>
      <CartProvider>
        <AuthProvider>
          <ScrollToTop />
          <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-[#1A2B4C] font-sans selection:bg-[#00B4D8] selection:text-white">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[110] bg-[#00B4D8] text-white px-4 py-2 rounded-full font-bold shadow-lg transition-all">
          Skip to main content
        </a>
        <Navbar />
        <main id="main-content" className="flex-grow flex flex-col">
          <React.Suspense fallback={null}>
            <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/sitemap" element={<HtmlSitemap />} />
            <Route path="/setup-wizard" element={<SetupWizard />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/brands" element={<Shop />} />
            <Route path="/brands/:brandSlug" element={<Shop />} />
            <Route path="/product/:productId" element={<ProductDetails />} />
            <Route path="/category/:categorySlug" element={<Category />} />
            <Route path="/solutions" element={<Solutions />} />
            <Route path="/services" element={<ServicesLanding />} />
            <Route path="/services/:serviceSlug" element={<ServiceDetail />} />
            <Route path="/events-services" element={<Services />} />
            <Route path="/event-quote" element={<EventQuote />} />

            {/* High-Intent SEO Commercial Keyword Routes */}
            <Route path="/3d-hologram" element={<KeywordLandingPage />} />
            <Route path="/projection-mapping" element={<KeywordLandingPage />} />
            <Route path="/lahore" element={<KeywordLandingPage />} />
            <Route path="/karachi" element={<KeywordLandingPage />} />
            <Route path="/islamabad" element={<KeywordLandingPage />} />
            <Route path="/video-conferencing" element={<KeywordLandingPage />} />
            <Route path="/video-conferencing-solutions" element={<KeywordLandingPage />} />
            <Route path="/corporate-event-management" element={<KeywordLandingPage />} />
            <Route path="/live-streaming-services" element={<KeywordLandingPage />} />
            <Route path="/av-equipment-rental" element={<KeywordLandingPage />} />
            <Route path="/conference-room-solutions" element={<KeywordLandingPage />} />
            <Route path="/zoom-rooms" element={<KeywordLandingPage />} />
            <Route path="/microsoft-teams-rooms" element={<KeywordLandingPage />} />

            <Route path="/esports" element={<Esports />} />
            <Route path="/room-designer" element={<RoomDesigner />} />
            
            {/* Admin Authentication */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/unauthorized" element={<Unauthorized />} />

            {/* Protected Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin', 'editor', 'support']}>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Overview />} />
              <Route path="overview" element={<Overview />} />
              <Route path="homepage-editor" element={<HomepageEditor />} />
              <Route path="about-editor" element={<AboutEditor />} />
              <Route path="contact-editor" element={<ContactEditor />} />
              <Route path="services-editor" element={<ServicesEditor />} />
              <Route path="services-management" element={<ServiceManagement />} />
              <Route path="products-all" element={<ProductManagement />} />
              <Route path="products-inventory" element={<InventoryDashboard />} />
            <Route path="categories" element={<CategoryManagement />} />
              <Route path="orders-new" element={<OrderManagement />} />
              <Route path="event-quotes" element={<EventQuotesManager />} />

              <Route path="orders-rma" element={<RMAManagement />} />
              <Route path="users-customers" element={<UserManager />} />
              <Route path="users-staff" element={<StaffManagement />} />
              <Route path="settings-general" element={<SettingsPage />} />
              <Route path="settings-payment" element={<PaymentSettings />} />
              <Route path="data-management" element={<DataManagement />} />
              <Route path="workspace" element={<WorkspaceHub />} />
              <Route path="automation" element={<WorkflowAutomation />} />
              <Route path="google-business" element={<GoogleBusinessExport />} />
              <Route path="media-guide" element={<MediaGuide />} />
            </Route>
          <Route path="/contact" element={<Contact />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:postSlug" element={<Blog />} />
          <Route path="/guides" element={<BuyersGuides />} />
          <Route path="/about" element={<About />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/faqs" element={<FAQs />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/shipping" element={<Shipping />} />
          <Route path="/returns" element={<Returns />} />
          <Route path="/rma" element={<RMA />} />
          <Route path="/programs/blind-drop-shipping" element={<BlindDropShipping />} />
          <Route path="/programs/government-education-pricing" element={<GovEdPricing />} />
          <Route path="/programs/fulfillment-services" element={<FulfillmentServices />} />
          <Route path="/programs/promotions" element={<Promotions />} />
          <Route path="/programs/provisioning-services" element={<Provisioning />} />
          <Route path="/programs/quote" element={<Quote />} />
          <Route path="/programs/reseller-program" element={<Reseller />} />
          <Route path="/voip-service-providers" element={<VoipService />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />

          {/* Client-side canonical redirects for legacy / shorthand URLs */}
          <Route path="/quote" element={<Navigate to="/programs/quote" replace />} />
          <Route path="/blind-drop-shipping" element={<Navigate to="/programs/blind-drop-shipping" replace />} />
          <Route path="/gov-ed-pricing" element={<Navigate to="/programs/government-education-pricing" replace />} />
          <Route path="/government-education-pricing" element={<Navigate to="/programs/government-education-pricing" replace />} />
          <Route path="/fulfillment-services" element={<Navigate to="/programs/fulfillment-services" replace />} />
          <Route path="/promotions" element={<Navigate to="/programs/promotions" replace />} />
          <Route path="/provisioning" element={<Navigate to="/programs/provisioning-services" replace />} />
          <Route path="/provisioning-services" element={<Navigate to="/programs/provisioning-services" replace />} />
          <Route path="/reseller" element={<Navigate to="/programs/reseller-program" replace />} />
          <Route path="/reseller-program" element={<Navigate to="/programs/reseller-program" replace />} />
          <Route path="/buyers-guides" element={<Navigate to="/guides" replace />} />
          <Route path="/voip-service" element={<Navigate to="/voip-service-providers" replace />} />
          <Route path="/products/compare" element={<Navigate to="/compare" replace />} />
          <Route path="/tools/room-designer" element={<Navigate to="/room-designer" replace />} />
          <Route path="/category/about" element={<Navigate to="/about" replace />} />
          <Route path="/category/compare" element={<Navigate to="/compare" replace />} />
          <Route path="/category/faqs" element={<Navigate to="/faqs" replace />} />
          <Route path="/category/guides" element={<Navigate to="/guides" replace />} />
          <Route path="/category/payment" element={<Navigate to="/payment" replace />} />
          <Route path="/category/returns" element={<Navigate to="/returns" replace />} />
          <Route path="/category/reviews" element={<Navigate to="/reviews" replace />} />
          <Route path="/category/rma" element={<Navigate to="/rma" replace />} />
          <Route path="/category/shipping" element={<Navigate to="/shipping" replace />} />
          <Route path="/category/blog" element={<Navigate to="/blog" replace />} />
          <Route path="/category/contact" element={<Navigate to="/contact" replace />} />
          <Route path="/category/privacy-policy" element={<Navigate to="/privacy-policy" replace />} />
          <Route path="/category/terms-of-service" element={<Navigate to="/terms-of-service" replace />} />
          <Route path="/corporate-event-management-pakistan" element={<Navigate to="/corporate-event-management" replace />} />
          <Route path="/brands/polycom" element={<Navigate to="/brands/poly" replace />} />
          <Route path="/brands/hp-poly" element={<Navigate to="/brands/poly" replace />} />
          <Route path="/video-conference-in-pakistan" element={<KeywordLandingPage />} />

          {/* Fallback keyword landing page for unhandled top-level dynamic SEO slugs & 404 routes */}
          <Route path="/:keywordSlug" element={<KeywordLandingPage />} />
          <Route path="*" element={<KeywordLandingPage />} />

        </Routes>
      </React.Suspense>
      </main>
      <Footer />
      <React.Suspense fallback={null}>
        <AIAssist />
        <CookieConsent />
      </React.Suspense>
      <BackToTop />
      </div>
        </AuthProvider>
      </CartProvider>
    </SettingsProvider>
  );
}
