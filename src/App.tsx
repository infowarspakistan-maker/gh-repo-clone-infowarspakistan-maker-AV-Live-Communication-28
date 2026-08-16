import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Menu, ShoppingCart, User, X, MapPin, Phone, Search, ChevronDown, ArrowUp, Check, ArrowRight } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import React from 'react';
import { subscribeToProducts, subscribeToCategories } from './lib/firebase/firestore-helpers';
import { getCartCount } from './lib/cart';
import { Home } from './pages/Home';

// Lazy-loaded subpages and admin panels
const Shop = React.lazy(() => import('./pages/Shop').then(m => ({ default: m.Shop })));
const Solutions = React.lazy(() => import('./pages/Solutions').then(m => ({ default: m.Solutions })));
const Services = React.lazy(() => import('./pages/Services').then(m => ({ default: m.Services })));
const Esports = React.lazy(() => import('./pages/Esports').then(m => ({ default: m.Esports })));
const RoomDesigner = React.lazy(() => import('./pages/RoomDesigner').then(m => ({ default: m.RoomDesigner })));
const AdminLayout = React.lazy(() => import('./pages/admin/AdminLayout').then(m => ({ default: m.AdminLayout })));
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

const ProductDetails = React.lazy(() => import('./pages/ProductDetails').then(m => ({ default: m.ProductDetails })));
const Category = React.lazy(() => import('./pages/Category').then(m => ({ default: m.Category })));
const Contact = React.lazy(() => import('./pages/Contact').then(m => ({ default: m.Contact })));
const Blog = React.lazy(() => import('./pages/Blog').then(m => ({ default: m.Blog })));
const BuyersGuides = React.lazy(() => import('./pages/BuyersGuides').then(m => ({ default: m.BuyersGuides })));
const About = React.lazy(() => import('./pages/About').then(m => ({ default: m.About })));
const Reviews = React.lazy(() => import('./pages/Reviews').then(m => ({ default: m.Reviews })));
const Compare = React.lazy(() => import('./pages/Compare').then(m => ({ default: m.Compare })));
const FAQs = React.lazy(() => import('./pages/FAQs').then(m => ({ default: m.FAQs })));
const Payment = React.lazy(() => import('./pages/Payment').then(m => ({ default: m.Payment })));
const Shipping = React.lazy(() => import('./pages/Shipping').then(m => ({ default: m.Shipping })));
const Returns = React.lazy(() => import('./pages/Returns').then(m => ({ default: m.Returns })));
const RMA = React.lazy(() => import('./pages/RMA').then(m => ({ default: m.RMA })));
const BlindDropShipping = React.lazy(() => import('./pages/BlindDropShipping').then(m => ({ default: m.BlindDropShipping })));
const GovEdPricing = React.lazy(() => import('./pages/GovEdPricing').then(m => ({ default: m.GovEdPricing })));
const FulfillmentServices = React.lazy(() => import('./pages/FulfillmentServices').then(m => ({ default: m.FulfillmentServices })));
const Promotions = React.lazy(() => import('./pages/Promotions').then(m => ({ default: m.Promotions })));
const Provisioning = React.lazy(() => import('./pages/Provisioning').then(m => ({ default: m.Provisioning })));
const Quote = React.lazy(() => import('./pages/Quote').then(m => ({ default: m.Quote })));
const Reseller = React.lazy(() => import('./pages/Reseller').then(m => ({ default: m.Reseller })));
const VoipService = React.lazy(() => import('./pages/VoipService').then(m => ({ default: m.VoipService })));
const AdminLogin = React.lazy(() => import('./pages/admin/AdminLogin').then(m => ({ default: m.AdminLogin })));
const Unauthorized = React.lazy(() => import('./pages/admin/Unauthorized').then(m => ({ default: m.Unauthorized })));
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Footer } from './components/Footer';
import { CookieConsent } from './components/CookieConsent';

function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) setIsVisible(true);
      else setIsVisible(false);
    };
    window.addEventListener('scroll', toggleVisibility);
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
  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(getCartCount());
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const { user, userProfile, logout, isAuthenticated, isAdmin, isEditor, isSupport } = useAuth();

  // Search and Suggestions State
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [navCategories, setNavCategories] = useState<any[]>([]);
  const [mobileExpandedCategory, setMobileExpandedCategory] = useState<string | null>(null);

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
    const handleUpdate = () => setCartCount(getCartCount());
    window.addEventListener('cart-updated', handleUpdate);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);

    // Fetch active products and parent categories
    const unsubProducts = subscribeToProducts((data) => {
      setProducts(data);
    }, { isActive: true });

    const unsubCategories = subscribeToCategories((cats) => {
      const productCats = cats.filter(c => c.isActive && ((c as any).type === 'product'));
      setNavCategories(productCats);
      setCategories(productCats.filter(c => !c.parentId));
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
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('cart-updated', handleUpdate);
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
          <span className="flex items-center gap-1.5"><Phone size={14} className="text-[#00B4D8]" /> 0321 425 6263</span>
          <span className="hidden sm:flex items-center gap-1.5"><MapPin size={14} className="text-[#00B4D8]" /> Johar Town Block N, Lahore</span>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/contact" className="hover:text-[#00B4D8] transition-colors">Contact Us</Link>
          <Link to="/blog" className="hover:text-[#00B4D8] transition-colors">Blog</Link>
          <Link to="/guides" className="hover:text-[#00B4D8] transition-colors">Buyer's Guides</Link>
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

      <div className={`sticky top-0 z-50 bg-white/95 backdrop-blur-md transition-[box-shadow,border-color] duration-300 ${isScrolled ? 'shadow-md border-b border-gray-100' : 'border-b border-gray-200'}`}>
        
        <div className={`max-w-[1400px] mx-auto px-4 md:px-8 flex items-center justify-between gap-4 md:gap-8 transition-[height] duration-300 ${isScrolled ? 'h-16' : 'h-24'}`}>
          <div className="flex items-center gap-4 md:gap-8 flex-1">
            <Link to="/" className={`flex flex-col justify-center shrink-0 transition-transform origin-left duration-300 ${isScrolled ? 'scale-75 md:scale-90' : 'scale-100'}`}>
              <div className="flex items-stretch">
                <div className="bg-black text-[#f0f0f0] font-black text-3xl px-3 py-1.5 leading-none tracking-tight">AV</div>
                <div className="text-black font-black text-[32px] leading-none ml-2 flex items-center tracking-tight">Live</div>
              </div>
              <div className="text-black font-light text-[11px] tracking-[0.45em] mt-1 ml-0.5 uppercase">Communication</div>
            </Link>

            <div className={`shrink-0 transition-opacity duration-300 ${isScrolled ? 'hidden pointer-events-none opacity-0' : 'hidden lg:flex flex-col opacity-100'}`}>
              <div className="text-[#F26522] font-black text-xl tracking-tight leading-tight">0321 425 6263</div>
              <div className="text-gray-500 text-xs font-medium uppercase tracking-wider">9 AM - 6 PM PKT M-S</div>
            </div>

            {/* Inline Navigation Menu when scrolled */}
            <div className={`items-center gap-6 text-[12px] font-bold text-[#1A2B4C] uppercase tracking-wider transition-opacity duration-300 ${isScrolled ? 'hidden xl:flex opacity-100' : 'hidden pointer-events-none opacity-0'}`}>
              <Link to="/shop" className="hover:text-[#00B4D8] transition-colors">Products</Link>
              <Link to="/services" className="hover:text-[#00B4D8] transition-colors">Services</Link>
              <Link to="/category/video-conferencing" className="hover:text-[#00B4D8] transition-colors">Video Conference</Link>
              <Link to="/services/ai-development" className="hover:text-[#00B4D8] transition-colors">AI Solutions</Link>
            </div>

            <div ref={searchRef} className={`flex-1 relative transition-all duration-300 ${isScrolled ? 'max-w-xs xl:max-w-md ml-auto hidden md:block' : 'max-w-2xl'}`}>
              <form onSubmit={handleSearchSubmit} className={`flex w-full bg-gray-50/50 hover:bg-white focus-within:bg-white border border-gray-200/80 focus-within:border-[#00B4D8] focus-within:ring-4 focus-within:ring-[#00B4D8]/10 rounded-full overflow-visible transition-all duration-300 relative items-center pr-1.5 ${isScrolled ? 'h-9 shadow-none' : 'h-11 shadow-sm focus-within:shadow-md'}`}>
                {/* Custom category select */}
                <div ref={categoryDropdownRef} className="relative h-full hidden sm:flex items-center shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                    className="flex items-center gap-2 px-4 h-full bg-gray-100/50 hover:bg-gray-100 text-gray-700 hover:text-[#1A2B4C] font-semibold text-xs border-r border-gray-200/50 transition-colors focus:outline-none shrink-0 rounded-l-full cursor-pointer"
                  >
                    <span className="max-w-[110px] truncate">
                      {selectedCategory === 'All' ? 'All Categories' : (categories.find(c => c.id === selectedCategory)?.name || 'Category')}
                    </span>
                    <ChevronDown size={12} className={`text-gray-400 transition-transform duration-200 ${showCategoryDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {showCategoryDropdown && (
                    <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
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
                  placeholder={isScrolled ? "Search..." : "Search professional AV & VoIP hardware..."}
                  className="flex-1 px-4 py-2 bg-transparent focus:outline-none text-sm placeholder-gray-400 font-semibold text-[#1A2B4C]"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                />
                <button 
                  type="submit" 
                  aria-label="Search" 
                  className={`bg-[#1A2B4C] hover:bg-[#00B4D8] text-white rounded-full flex items-center justify-center transition-all duration-300 shrink-0 shadow-sm hover:shadow-md hover:scale-105 ${isScrolled ? 'w-7 h-7' : 'w-8.5 h-8.5'}`}
                >
                  <Search size={isScrolled ? 13 : 15} />
                </button>
              </form>

              {/* Search Suggestions & Discovery Panel */}
              {showSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden divide-y divide-gray-50 animate-in fade-in duration-200">
                  {searchQuery.trim().length > 0 ? (
                    searchSuggestions.length > 0 ? (
                      <div>
                        <div className="px-4 py-2 bg-gray-50/60 text-[10px] font-black uppercase tracking-widest text-[#00B4D8] flex justify-between items-center">
                          <span>Matching Hardware</span>
                          <span>{searchSuggestions.length} items found</span>
                        </div>
                        <div className="max-h-[360px] overflow-y-auto divide-y divide-gray-50">
                          {searchSuggestions.map((product) => (
                            <Link 
                              key={product.id} 
                              to={`/product/${product.slug || product.id}`}
                              className="flex items-center gap-4 p-4 hover:bg-gray-50/80 transition-colors group"
                              onClick={() => setShowSuggestions(false)}
                            >
                              <div className="w-11 h-11 bg-white rounded-xl border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-300">
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
                          className="w-full text-center py-3 text-xs font-black text-[#00B4D8] hover:bg-gray-50 border-t border-gray-100 uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
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
                    )
                  ) : (
                    /* Suggestions state when empty and input is focused */
                    <div className="p-5">
                      <div className="font-black text-[10px] text-gray-400 uppercase tracking-widest mb-3">Trending Categories</div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {categories.slice(0, 4).map((cat) => (
                          <Link
                            key={cat.id}
                            to={`/category/${cat.slug || cat.id}`}
                            onClick={() => setShowSuggestions(false)}
                            className="bg-gray-50 hover:bg-[#00B4D8]/10 hover:text-[#00B4D8] px-3.5 py-2 rounded-full text-xs font-bold text-[#1A2B4C] transition-all duration-200 border border-gray-100"
                          >
                            {cat.name}
                          </Link>
                        ))}
                      </div>
                      
                      {products.length > 0 && (
                        <>
                          <div className="font-black text-[10px] text-gray-400 uppercase tracking-widest mb-2 border-t border-gray-50 pt-3">Top Products</div>
                          <div className="space-y-1">
                            {products.slice(0, 3).map((p) => (
                              <Link
                                key={p.id}
                                to={`/product/${p.slug || p.id}`}
                                onClick={() => setShowSuggestions(false)}
                                className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-gray-50 text-xs font-bold text-gray-600 hover:text-[#1A2B4C] transition-all"
                              >
                                <Search size={12} className="text-gray-400 shrink-0" />
                                <span className="truncate">{p.productName}</span>
                              </Link>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center shrink-0">
            <Link to="/cart" aria-label={`Shopping cart, containing ${cartCount} items`} className="relative p-2 text-[#1A2B4C] hover:text-[#00B4D8] transition-colors group">
              <ShoppingCart size={24} className="group-hover:scale-110 transition-transform" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#F26522] text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">{cartCount}</span>
              )}
            </Link>
          </div>
        </div>

        {/* Main Navigation Row - Only visible when not scrolled */}
        <div className={`border-t border-gray-100 transition-[height,opacity] duration-300 hidden lg:block ${isScrolled ? 'h-0 opacity-0 overflow-hidden border-t-0' : 'h-14 opacity-100'}`}>
          <div className="max-w-[1400px] mx-auto px-8 h-full flex items-center gap-8 text-[12px] font-bold text-[#1A2B4C] uppercase tracking-wider">
            {/* HOME with Dropdown */}
            <div className="h-14 flex items-center group relative">
              <Link to="/" className="h-14 flex items-center border-b-[3px] border-transparent group-hover:border-[#00B4D8] group-hover:text-[#00B4D8] transition-colors">HOME</Link>
              <div className="absolute top-14 left-0 w-[240px] bg-white shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 border border-gray-100 rounded-b-2xl p-5">
                <ul className="space-y-3.5 text-[13px] text-gray-600 font-semibold capitalize tracking-normal">
                  <li><Link to="/about" className="hover:text-[#00B4D8] transition-colors block">About Us</Link></li>
                  <li><Link to="/contact" className="hover:text-[#00B4D8] transition-colors block">Contact Us</Link></li>
                  <li><Link to="/blog" className="hover:text-[#00B4D8] transition-colors block">Company Blog</Link></li>
                  <li><Link to="/guides" className="hover:text-[#00B4D8] transition-colors block">Buyer's Guides</Link></li>
                </ul>
              </div>
            </div>
            
            {/* PRODUCTS */}
            <div className="h-14 flex items-center group relative">
              <Link to="/shop" className="h-14 flex items-center border-b-[3px] border-transparent group-hover:border-[#00B4D8] group-hover:text-[#00B4D8] transition-colors">PRODUCTS</Link>
              <div className="absolute top-14 left-0 w-64 bg-white shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 border border-gray-100 rounded-b-2xl py-2">
                {categories.map(parent => {
                  const subCats = navCategories.filter(c => c.parentId === parent.id);
                  return (
                    <div key={parent.id} className="relative group/sub">
                      <Link 
                        to={`/category/${parent.slug || parent.id}`} 
                        className="flex items-center justify-between px-6 py-3 font-bold text-[#1A2B4C] hover:bg-gray-50 hover:text-[#00B4D8] transition-colors text-sm uppercase tracking-wider"
                      >
                        {parent.name}
                        {subCats.length > 0 && <ChevronDown size={14} className="-rotate-90 text-gray-400 group-hover/sub:text-[#00B4D8]" />}
                      </Link>
                      {subCats.length > 0 && (
                        <div className="absolute top-0 left-full ml-0 w-64 bg-white shadow-2xl opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible transition-all duration-300 z-50 border border-gray-100 rounded-2xl py-2">
                          <ul className="flex flex-col text-[13px] text-gray-500 font-medium capitalize tracking-normal">
                            {subCats.map(sub => (
                              <li key={sub.id}>
                                <Link to={`/category/${sub.slug || sub.id}`} className="block px-6 py-2.5 hover:bg-gray-50 hover:text-[#00B4D8] transition-colors">
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
              </div>
            </div>

            {/* SERVICES */}
            <div className="h-14 flex items-center group relative">
              <Link to="/services" className="h-14 flex items-center border-b-[3px] border-transparent group-hover:border-[#00B4D8] group-hover:text-[#00B4D8] transition-colors">SERVICES</Link>
              <div className="absolute top-14 left-0 w-[300px] bg-white shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 border border-gray-100 rounded-b-2xl p-6">
                <ul className="space-y-4 text-[14px] text-gray-600 font-medium capitalize tracking-normal">
                  <li><Link to="/services/corporate-events" className="hover:text-[#00B4D8] transition-colors block">Corporate Events</Link></li>
                  <li><Link to="/services/hybrid-events" className="hover:text-[#00B4D8] transition-colors block">Hybrid Events</Link></li>
                  <li><Link to="/services/expo-organizing" className="hover:text-[#00B4D8] transition-colors block">Expo Organizing</Link></li>
                  <li><Link to="/esports" className="hover:text-[#00B4D8] transition-colors block">Esports Events</Link></li>
                </ul>
              </div>
            </div>

            {/* VIDEO CONFERENCE - Placed in the Center */}
            <div className="h-14 flex items-center group relative">
              <Link to="/category/video-conferencing" className="h-14 flex items-center border-b-[3px] border-transparent group-hover:border-[#00B4D8] group-hover:text-[#00B4D8] transition-colors">VIDEO CONFERENCE</Link>
              <div className="absolute top-14 left-1/2 -translate-x-1/2 w-[520px] bg-white shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 border border-gray-100 rounded-b-2xl p-6 grid grid-cols-2 gap-6">
                <div>
                  <div className="font-black text-[10px] text-gray-400 uppercase tracking-widest mb-3 pb-1.5 border-b border-gray-100">Meeting Room Systems</div>
                  <ul className="space-y-2.5 text-[13px] text-gray-600 font-semibold capitalize tracking-normal">
                    <li><Link to="/product/cisco-room-kit-plus-pakistan" className="hover:text-[#00B4D8] transition-colors block">Cisco Room Kit Plus</Link></li>
                    <li><Link to="/product/cisco-room-bar-pakistan" className="hover:text-[#00B4D8] transition-colors block">Cisco Room Bar</Link></li>
                    <li><Link to="/product/poly-studio-x52-pakistan" className="hover:text-[#00B4D8] transition-colors block">Poly Studio X52</Link></li>
                    <li><Link to="/product/poly-studio-x50-pakistan" className="hover:text-[#00B4D8] transition-colors block">Poly Studio X50</Link></li>
                  </ul>
                </div>
                <div>
                  <div className="font-black text-[10px] text-gray-400 uppercase tracking-widest mb-3 pb-1.5 border-b border-gray-100">All-in-One USB Bars</div>
                  <ul className="space-y-2.5 text-[13px] text-gray-600 font-semibold capitalize tracking-normal">
                    <li><Link to="/product/logitech-rally-bar-pakistan" className="hover:text-[#00B4D8] transition-colors block">Logitech Rally Bar</Link></li>
                    <li><Link to="/product/logitech-rally-bar-mini-pakistan" className="hover:text-[#00B4D8] transition-colors block">Logitech Rally Bar Mini</Link></li>
                    <li><Link to="/product/poly-studio-usb-video-bar-pakistan" className="hover:text-[#00B4D8] transition-colors block">Poly Studio USB Bar</Link></li>
                    <li>
                      <Link to="/category/video-conferencing" className="text-[#00B4D8] hover:text-[#1A2B4C] transition-colors block font-bold text-xs mt-3.5 flex items-center gap-1">
                        View All Hardware <ArrowRight size={12} />
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* AI SOLUTIONS */}
            <div className="h-14 flex items-center group relative">
              <span className="h-14 flex items-center border-b-[3px] border-transparent hover:border-[#00B4D8] hover:text-[#00B4D8] transition-colors cursor-pointer">AI SOLUTIONS</span>
              <div className="absolute top-14 left-0 w-[300px] bg-white shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 border border-gray-100 rounded-b-2xl p-6">
                <ul className="space-y-4 text-[14px] text-gray-600 font-medium capitalize tracking-normal">
                  <li><Link to="/services/ai-development" className="hover:text-[#00B4D8] transition-colors block">AI Development</Link></li>
                  <li><Link to="/services/ai-agents-workers" className="hover:text-[#00B4D8] transition-colors block">AI Agents</Link></li>
                  <li><Link to="/services/ai-automation" className="hover:text-[#00B4D8] transition-colors block">AI Business Automation</Link></li>
                </ul>
              </div>
            </div>

            {/* VOIP & UC */}
            <div className="h-14 flex items-center group relative">
              <span className="h-14 flex items-center border-b-[3px] border-transparent hover:border-[#00B4D8] hover:text-[#00B4D8] transition-colors cursor-pointer">VOIP & UC</span>
              <div className="absolute top-14 left-0 w-[300px] bg-white shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 border border-gray-100 rounded-b-2xl p-6">
                <ul className="space-y-4 text-[14px] text-gray-600 font-medium capitalize tracking-normal">
                  <li><Link to="/product/3cx-pro-8-sc-pakistan" className="hover:text-[#00B4D8] transition-colors block">3CX Phone System</Link></li>
                  <li><Link to="/product/freepbx-enterprise-pakistan" className="hover:text-[#00B4D8] transition-colors block">FreePBX Enterprise</Link></li>
                  <li><Link to="/product/cisco-cucm-license-pakistan" className="hover:text-[#00B4D8] transition-colors block">Cisco CUCM License</Link></li>
                  <li><Link to="/product/grandstream-ucm6308-pakistan" className="hover:text-[#00B4D8] transition-colors block">Grandstream UCM6308</Link></li>
                  <li><Link to="/voip-service-providers" className="hover:text-[#00B4D8] transition-colors block font-bold text-[#F26522]">VoIP Service Providers</Link></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu Panel */}
        {isOpen && (
          <div className="fixed top-[96px] bottom-16 left-0 right-0 bg-white px-4 pt-2 pb-24 space-y-4 shadow-2xl z-40 overflow-y-auto lg:hidden">
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
                  <button type="submit" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#00B4D8]">
                    <Search size={16} />
                  </button>
                </div>
             </form>
            
             {/* Nested Home & Corporate Info */}
             <div className="px-2 font-black text-gray-400 text-[10px] uppercase tracking-widest border-b border-gray-100 pb-1">Home & Information</div>
             <div className="pl-3 space-y-2.5">
               <Link to="/" className="hover:text-[#00B4D8] block text-sm font-bold text-[#1A2B4C]" onClick={() => setIsOpen(false)}>Home Page</Link>
               <div className="pl-4 space-y-2 border-l border-gray-200 ml-1">
                 <Link to="/about" className="hover:text-[#00B4D8] block text-xs font-semibold text-gray-500" onClick={() => setIsOpen(false)}>About Us</Link>
                 <Link to="/contact" className="hover:text-[#00B4D8] block text-xs font-semibold text-gray-500" onClick={() => setIsOpen(false)}>Contact Us</Link>
                 <Link to="/blog" className="hover:text-[#00B4D8] block text-xs font-semibold text-gray-500" onClick={() => setIsOpen(false)}>Company Blog</Link>
                 <Link to="/guides" className="hover:text-[#00B4D8] block text-xs font-semibold text-gray-500" onClick={() => setIsOpen(false)}>Buyer's Guides</Link>
               </div>
             </div>
            
             <div className="px-2 font-black text-gray-400 text-[10px] uppercase tracking-widest border-b border-gray-100 pb-1 mt-6">Products</div>
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
                        className="p-2 text-gray-400 hover:text-[#00B4D8] transition-colors"
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

            <div className="px-2 font-black text-gray-400 text-[10px] uppercase tracking-widest border-b border-gray-100 pb-1 mt-6">Services</div>
            <Link to="/services/corporate-events" className="hover:text-[#00B4D8] block px-3 py-2 text-sm font-bold text-[#1A2B4C]" onClick={() => setIsOpen(false)}>Corporate Events</Link>
            <Link to="/services/hybrid-events" className="hover:text-[#00B4D8] block px-3 py-2 text-sm font-bold text-[#1A2B4C]" onClick={() => setIsOpen(false)}>Hybrid Events</Link>
            <Link to="/services/expo-organizing" className="hover:text-[#00B4D8] block px-3 py-2 text-sm font-bold text-[#1A2B4C]" onClick={() => setIsOpen(false)}>Expo Organizing</Link>
            <Link to="/esports" className="hover:text-[#00B4D8] block px-3 py-2 text-sm font-bold text-[#1A2B4C]" onClick={() => setIsOpen(false)}>Esports Events</Link>

            <div className="px-2 font-black text-gray-400 text-[10px] uppercase tracking-widest border-b border-gray-100 pb-1 mt-6">AI Solutions</div>
            <Link to="/services/ai-development" className="hover:text-[#00B4D8] block px-3 py-2 text-sm font-bold text-[#1A2B4C]" onClick={() => setIsOpen(false)}>AI Development</Link>
            <Link to="/services/ai-agents-workers" className="hover:text-[#00B4D8] block px-3 py-2 text-sm font-bold text-[#1A2B4C]" onClick={() => setIsOpen(false)}>AI Agents</Link>
            <Link to="/services/ai-automation" className="hover:text-[#00B4D8] block px-3 py-2 text-sm font-bold text-[#1A2B4C]" onClick={() => setIsOpen(false)}>AI Business Automation</Link>

            <div className="px-2 font-black text-gray-400 text-[10px] uppercase tracking-widest border-b border-gray-100 pb-1 mt-6">VoIP & UC</div>
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
      </div>
      
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
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center z-10">{cartCount}</span>
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

const EventQuote = React.lazy(() => import('./pages/EventQuote').then(m => ({ default: m.EventQuote })));
const ServicesLanding = React.lazy(() => import('./pages/services/ServicesLanding').then(m => ({ default: m.ServicesLanding })));
const ServiceDetail = React.lazy(() => import('./pages/services/ServiceDetail').then(m => ({ default: m.ServiceDetail })));
const PrivacyPolicy = React.lazy(() => import('./pages/PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy })));
const TermsOfService = React.lazy(() => import('./pages/TermsOfService').then(m => ({ default: m.TermsOfService })));
const Cart = React.lazy(() => import('./pages/Cart').then(m => ({ default: m.Cart })));
const Checkout = React.lazy(() => import('./pages/Checkout').then(m => ({ default: m.Checkout })));
const SetupWizard = React.lazy(() => import('./pages/SetupWizard').then(m => ({ default: m.SetupWizard })));

import { AIAssist } from './components/AIAssist';
import { ScrollToTop } from "./components/ScrollToTop";

export default function App() {

  return (
    <AuthProvider>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-[#1A2B4C] font-sans selection:bg-[#00B4D8] selection:text-white pb-16 lg:pb-0">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[110] bg-[#00B4D8] text-white px-4 py-2 rounded-full font-bold shadow-lg transition-all">
          Skip to main content
        </a>
        <Navbar />
        <main id="main-content" className="flex-grow flex flex-col">
          <React.Suspense fallback={
            <div className="flex items-center justify-center min-h-[60vh] bg-[#F8F9FA]">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-[#00B4D8] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[#1A2B4C] font-black tracking-widest text-xs uppercase">Loading Dynamic Module...</p>
              </div>
            </div>
          }>
            <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/setup-wizard" element={<SetupWizard />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:productId" element={<ProductDetails />} />
            <Route path="/category/:categorySlug" element={<Category />} />
            <Route path="/solutions" element={<Solutions />} />
            <Route path="/services" element={<ServicesLanding />} />
            <Route path="/services/:serviceSlug" element={<ServiceDetail />} />
            <Route path="/events-services" element={<Services />} />
            <Route path="/event-quote" element={<EventQuote />} />

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
        </Routes>
      </React.Suspense>
      </main>
      <Footer />
      <AIAssist />
      <BackToTop />
      <CookieConsent />
      </div>
    </AuthProvider>
  );
}
