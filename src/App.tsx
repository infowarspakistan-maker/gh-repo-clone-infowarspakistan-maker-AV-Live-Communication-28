import { Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Menu, ShoppingCart, User, X, MapPin, Phone, Search, ChevronDown, ArrowUp, Check, ArrowRight } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import React from 'react';
import { subscribeToProducts, subscribeToCategories } from './lib/firebase/firestore-helpers';
import {
  getCanonicalProductSlug,
  PRODUCT_GMC_METADATA,
  PRODUCT_ID_TO_SEO_SLUG,
  buildFallbackProductFromGmcMeta,
} from './lib/gmc-feed';
import { getCartCount } from './lib/cart';

// Core high-traffic SEO & catalog routes kept synchronous for 0ms render
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { ProductDetails } from './pages/ProductDetails';
import { Category } from './pages/Category';
import { ServicesLanding } from './pages/services/ServicesLanding';
import { ServiceDetail } from './pages/services/ServiceDetail';
import { KeywordLandingPage } from './pages/KeywordLandingPage';
import { Blog } from './pages/Blog';

// Secondary & utility public routes code-split to minimize Mobile TBT & initial JS parse time
const Solutions = React.lazy(() => import('./pages/Solutions').then(m => ({ default: m.Solutions })));
const Services = React.lazy(() => import('./pages/Services').then(m => ({ default: m.Services })));
const Esports = React.lazy(() => import('./pages/Esports').then(m => ({ default: m.Esports })));
const RoomDesigner = React.lazy(() => import('./pages/RoomDesigner').then(m => ({ default: m.RoomDesigner })));
const Contact = React.lazy(() => import('./pages/Contact').then(m => ({ default: m.Contact })));
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
const EventQuote = React.lazy(() => import('./pages/EventQuote').then(m => ({ default: m.EventQuote })));
const PrivacyPolicy = React.lazy(() => import('./pages/PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy })));
const TermsOfService = React.lazy(() => import('./pages/TermsOfService').then(m => ({ default: m.TermsOfService })));
const Cart = React.lazy(() => import('./pages/Cart').then(m => ({ default: m.Cart })));
const Checkout = React.lazy(() => import('./pages/Checkout').then(m => ({ default: m.Checkout })));
const HtmlSitemap = React.lazy(() => import('./pages/HtmlSitemap').then(m => ({ default: m.HtmlSitemap })));

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

const FALLBACK_NAV_PRODUCTS = Object.keys(PRODUCT_GMC_METADATA)
  .filter((slug) => !PRODUCT_ID_TO_SEO_SLUG[slug])
  .map((slug) => buildFallbackProductFromGmcMeta(slug))
  .filter(Boolean) as Record<string, any>[];

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
      className="fixed bottom-16 left-3 lg:left-auto lg:bottom-20 lg:right-6 p-2.5 lg:p-3.5 w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center bg-[#00B4D8] text-white rounded-full shadow-xl hover:bg-[#1A2B4C] hover:-translate-y-1 transition-all z-[90]"
      aria-label="Back to top"
    >
      <ArrowUp size={18} className="lg:w-5 lg:h-5" strokeWidth={2.5} />
    </button>
  );
}


const StaticPrimaryNav = React.memo(function StaticPrimaryNav({ pathname }: { pathname: string }) {
  const isHomeActive =
    pathname === '/' ||
    pathname === '/about' ||
    pathname === '/contact' ||
    pathname.startsWith('/blog') ||
    pathname === '/guides' ||
    pathname === '/sitemap';

  const isProductsActive =
    pathname.startsWith('/shop') ||
    pathname.startsWith('/category') ||
    pathname.startsWith('/product/') ||
    pathname.startsWith('/brands');

  const isAiSolutionsActive = pathname.startsWith('/services/ai-');

  const isVoipActive =
    pathname === '/voip-service-providers' || pathname === '/services/voip-telephony';

  const isCorporateEventsActive =
    pathname === '/corporate-event-management' || pathname === '/services/corporate-events';

  const isVideoConfActive =
    pathname.includes('video-conferenc') ||
    pathname === '/zoom-rooms' ||
    pathname === '/microsoft-teams-rooms' ||
    pathname === '/conference-room-solutions';

  const isServicesActive =
    !isAiSolutionsActive &&
    !isVoipActive &&
    !isCorporateEventsActive &&
    (pathname.startsWith('/services') ||
      pathname === '/projection-mapping' ||
      pathname === '/av-equipment-rental' ||
      pathname === '/3d-hologram' ||
      pathname === '/live-streaming-services' ||
      pathname === '/solutions');

  const isRoomDesignerActive = pathname === '/room-designer';

  // Auto-close dropdowns when a link is clicked via pointer while preserving keyboard focus-visible accessibility
  const handleNavClick = (e: React.MouseEvent<HTMLElement>) => {
    const link = (e.target as HTMLElement).closest('a');
    if (link && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  return (
    <nav
      aria-label="Primary Navigation"
      onClick={handleNavClick}
      className="border-t border-gray-100 hidden lg:block h-10 bg-white"
    >
      <div className="max-w-[1400px] mx-auto px-4 lg:px-6 xl:px-8 h-full flex items-center justify-between xl:justify-start gap-3.5 xl:gap-7 text-[11px] xl:text-[12px] font-bold text-[#1A2B4C] uppercase tracking-wider whitespace-nowrap">
        {/* HOME with CSS HTML-First Dropdown */}
        <div className="h-10 flex items-center relative group">
          <Link
            to="/"
            className={`h-10 flex items-center gap-1 whitespace-nowrap border-b-[2px] transition-colors focus-visible:outline-none focus-visible:border-[#00B4D8] focus-visible:text-[#00B4D8] group-hover:border-[#00B4D8] group-hover:text-[#00B4D8] ${isHomeActive ? 'border-[#00B4D8] text-[#00B4D8]' : 'border-transparent hover:text-[#00B4D8]'}`}
          >
            HOME <ChevronDown size={12} className="transition-transform duration-150 group-hover:rotate-180 group-focus-within:rotate-180 shrink-0" />
          </Link>
          <div className="absolute top-10 left-0 w-[240px] bg-white shadow-2xl z-50 border border-gray-100 rounded-b-2xl p-4 transition-opacity duration-150 opacity-0 invisible pointer-events-none group-hover:opacity-100 group-hover:visible group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:visible group-focus-within:pointer-events-auto">
            <ul className="space-y-2.5 text-[12px] text-gray-700 font-semibold capitalize tracking-normal whitespace-normal">
              <li><Link to="/about" className="hover:text-[#00B4D8] focus-visible:text-[#00B4D8] transition-colors block">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-[#00B4D8] focus-visible:text-[#00B4D8] transition-colors block">Contact Us</Link></li>
              <li><Link to="/blog" className="hover:text-[#00B4D8] focus-visible:text-[#00B4D8] transition-colors block">Company Blog</Link></li>
              <li><Link to="/guides" className="hover:text-[#00B4D8] focus-visible:text-[#00B4D8] transition-colors block">Buyer's Guides</Link></li>
              <li className="pt-2 border-t border-gray-100"><Link to="/sitemap" className="text-[#00B4D8] hover:text-[#1A2B4C] focus-visible:text-[#1A2B4C] font-bold transition-colors block">Complete Site Directory (153+ Pages)</Link></li>
            </ul>
          </div>
        </div>

        {/* PRODUCTS (4-Ecosystem Hardware Silo Mega-Menu — 3-Click Rule) */}
        <div className="h-10 flex items-center relative group">
          <Link
            to="/shop"
            className={`h-10 flex items-center gap-1 whitespace-nowrap border-b-[2px] transition-colors focus-visible:outline-none focus-visible:border-[#00B4D8] focus-visible:text-[#00B4D8] group-hover:border-[#00B4D8] group-hover:text-[#00B4D8] ${isProductsActive ? 'border-[#00B4D8] text-[#00B4D8]' : 'border-transparent hover:text-[#00B4D8]'}`}
          >
            PRODUCTS <ChevronDown size={12} className="transition-transform duration-150 group-hover:rotate-180 group-focus-within:rotate-180 shrink-0" />
          </Link>
          <div className="absolute top-10 left-0 w-[860px] max-w-[calc(100vw-3rem)] bg-white shadow-2xl z-50 border border-gray-100 rounded-b-2xl p-5 transition-opacity duration-150 opacity-0 invisible pointer-events-none group-hover:opacity-100 group-hover:visible group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:visible group-focus-within:pointer-events-auto">
            <div className="grid grid-cols-4 gap-5 text-left normal-case tracking-normal whitespace-normal">
              {/* Silo 1: Boardroom Codecs & Systems */}
              <div>
                <Link to="/category/boardroom-codecs" className="font-black text-[11px] text-[#1A2B4C] hover:text-[#00B4D8] uppercase tracking-wider block pb-2 mb-2.5 border-b border-gray-100">
                  1. Boardroom Codecs &amp; Systems
                </Link>
                <ul className="space-y-1.5 text-[12px] text-gray-600 font-semibold">
                  <li><Link to="/product/polycom-realpresence-group-500-pakistan" className="hover:text-[#00B4D8] block">Polycom Group 500</Link></li>
                  <li><Link to="/product/poly-studio-x72-pakistan" className="hover:text-[#00B4D8] block">Poly Studio X72 / X70</Link></li>
                  <li><Link to="/product/poly-studio-x52-pakistan" className="hover:text-[#00B4D8] block">Poly Studio X52 &amp; G7500</Link></li>
                  <li><Link to="/product/cisco-room-kit-plus-pakistan" className="hover:text-[#00B4D8] block">Cisco Room Kit Plus</Link></li>
                  <li><Link to="/product/cisco-room-bar-pakistan" className="hover:text-[#00B4D8] block">Cisco Room Bar &amp; EQ</Link></li>
                  <li><Link to="/product/logitech-rally-bar-pakistan" className="hover:text-[#00B4D8] block">Logitech Rally Bar &amp; Mini</Link></li>
                </ul>
              </div>

              {/* Silo 2: Displays, Projectors & Video Walls */}
              <div>
                <Link to="/category/projectors" className="font-black text-[11px] text-[#1A2B4C] hover:text-[#00B4D8] uppercase tracking-wider block pb-2 mb-2.5 border-b border-gray-100">
                  2. Displays, Projectors &amp; LED
                </Link>
                <ul className="space-y-1.5 text-[12px] text-gray-600 font-semibold">
                  <li><Link to="/product/horion-k6a-bundle-special-offer" className="hover:text-[#00B4D8] block">Horion K6a Interactive Panel</Link></li>
                  <li><Link to="/av-equipment-rental" className="hover:text-[#00B4D8] block">SMD LED Video Walls</Link></li>
                  <li><Link to="/product/benq-tk705i-pakistan" className="hover:text-[#00B4D8] block">BenQ TK705i 4K Projector</Link></li>
                  <li><Link to="/product/benq-w4100i-pakistan" className="hover:text-[#00B4D8] block">BenQ W4100i Laser Projector</Link></li>
                  <li><Link to="/product/panasonic-pt-rq45k-pakistan" className="hover:text-[#00B4D8] block">Panasonic PT-RQ45K Laser</Link></li>
                  <li><Link to="/product/bosch-paviro-pva-4cr12-pakistan" className="hover:text-[#00B4D8] block">Bosch PAVIRO Controller</Link></li>
                </ul>
              </div>

              {/* Silo 3: VoIP, IP-PBX & Unified Communications */}
              <div>
                <Link to="/category/voip-phone-systems" className="font-black text-[11px] text-[#1A2B4C] hover:text-[#00B4D8] uppercase tracking-wider block pb-2 mb-2.5 border-b border-gray-100">
                  3. VoIP, IP-PBX &amp; UC
                </Link>
                <ul className="space-y-1.5 text-[12px] text-gray-600 font-semibold">
                  <li><Link to="/product/3cx-pro-8-sc-pakistan" className="hover:text-[#00B4D8] block">3CX Phone System PRO 8</Link></li>
                  <li><Link to="/product/freepbx-enterprise-pakistan" className="hover:text-[#00B4D8] block">FreePBX Enterprise Appliance</Link></li>
                  <li><Link to="/product/cisco-cucm-license-pakistan" className="hover:text-[#00B4D8] block">Cisco CUCM CallManager</Link></li>
                  <li><Link to="/product/grandstream-ucm6308-pakistan" className="hover:text-[#00B4D8] block">Grandstream UCM6308 IP-PBX</Link></li>
                  <li><Link to="/category/ip-phones" className="hover:text-[#00B4D8] block">Enterprise SIP IP Phones</Link></li>
                  <li><Link to="/category/headsets" className="hover:text-[#00B4D8] block">Call Center ANC Headsets</Link></li>
                </ul>
              </div>

              {/* Silo 4: Audio, Intercom & Cameras */}
              <div>
                <Link to="/category/intercom-paging-access" className="font-black text-[11px] text-[#1A2B4C] hover:text-[#00B4D8] uppercase tracking-wider block pb-2 mb-2.5 border-b border-gray-100">
                  4. Audio, Intercom &amp; Cameras
                </Link>
                <ul className="space-y-1.5 text-[12px] text-gray-600 font-semibold">
                  <li><Link to="/product/axis-m3065-v-camera-pakistan" className="hover:text-[#00B4D8] block">Axis M3065-V Mini Dome</Link></li>
                  <li><Link to="/category/ptz-cameras" className="hover:text-[#00B4D8] block">Auto-Tracking PTZ Cameras</Link></li>
                  <li><Link to="/category/speakerphones" className="hover:text-[#00B4D8] block">Speakerphones &amp; Ceiling Mics</Link></li>
                  <li><Link to="/product/2n-ip-vario-intercom-pakistan" className="hover:text-[#00B4D8] block">2N IP Vario SIP Intercom</Link></li>
                  <li><Link to="/product/axis-a8105-e-door-station-pakistan" className="hover:text-[#00B4D8] block">Axis A8105-E Door Station</Link></li>
                  <li><Link to="/category/ip-cameras" className="hover:text-[#00B4D8] block">NDAA Commercial IP Cameras</Link></li>
                </ul>
              </div>
            </div>

            {/* Bottom Silo Bar: All Categories + 3D Room Designer + Industry Verticals */}
            <div className="mt-5 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 normal-case whitespace-normal">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Industry Verticals:</span>
                <Link to="/solutions#healthcare" className="text-[11px] font-bold text-[#1A2B4C] hover:text-[#00B4D8] bg-gray-50 px-2.5 py-1 rounded-lg">Healthcare &amp; Telemedicine</Link>
                <Link to="/solutions#banking" className="text-[11px] font-bold text-[#1A2B4C] hover:text-[#00B4D8] bg-gray-50 px-2.5 py-1 rounded-lg">Banking Command Centers</Link>
                <Link to="/solutions#education" className="text-[11px] font-bold text-[#1A2B4C] hover:text-[#00B4D8] bg-gray-50 px-2.5 py-1 rounded-lg">HEC Smart Classrooms</Link>
              </div>
              <div className="flex items-center gap-4">
                <Link to="/room-designer" className="text-xs font-black text-[#F26522] hover:text-[#1A2B4C] flex items-center gap-1">
                  <span>3D ROOM DESIGNER &amp; LED CALCULATOR</span>
                  <ArrowRight size={13} />
                </Link>
                <Link to="/shop" className="text-xs font-black text-[#00B4D8] hover:text-[#1A2B4C] flex items-center gap-1">
                  <span>ALL 53+ SKUS</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* SERVICES */}
        <div className="h-10 flex items-center relative group">
          <Link
            to="/services"
            className={`h-10 flex items-center gap-1 whitespace-nowrap border-b-[2px] transition-colors focus-visible:outline-none focus-visible:border-[#00B4D8] focus-visible:text-[#00B4D8] group-hover:border-[#00B4D8] group-hover:text-[#00B4D8] ${isServicesActive ? 'border-[#00B4D8] text-[#00B4D8]' : 'border-transparent hover:text-[#00B4D8]'}`}
          >
            SERVICES <ChevronDown size={12} className="transition-transform duration-150 group-hover:rotate-180 group-focus-within:rotate-180 shrink-0" />
          </Link>
          <div className="absolute top-10 left-0 w-[360px] bg-white shadow-2xl z-50 border border-gray-100 rounded-b-2xl p-5 transition-opacity duration-150 opacity-0 invisible pointer-events-none group-hover:opacity-100 group-hover:visible group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:visible group-focus-within:pointer-events-auto">
            <ul className="space-y-2 text-[12px] text-gray-700 font-bold capitalize tracking-normal whitespace-normal">
              <li><Link to="/video-conferencing-solutions" className="hover:text-[#00B4D8] transition-colors block">Video Conferencing Solutions (Pillar)</Link></li>
              <li><Link to="/corporate-event-management" className="hover:text-[#00B4D8] transition-colors block">Corporate Event Management (Pillar)</Link></li>
              <li><Link to="/projection-mapping" className="hover:text-[#00B4D8] transition-colors block">3D Projection Mapping &amp; Hologram Stages</Link></li>
              <li><Link to="/services/ai-automation" className="hover:text-[#00B4D8] transition-colors block">AI Business Automation &amp; Digital Workers</Link></li>
              <li><Link to="/services/corporate-events" className="hover:text-[#00B4D8] transition-colors block font-semibold text-gray-600">Corporate Event Production</Link></li>
              <li><Link to="/services/hybrid-events" className="hover:text-[#00B4D8] transition-colors block font-semibold text-gray-600">Hybrid Event Production</Link></li>
              <li><Link to="/services/boardroom-integration" className="hover:text-[#00B4D8] transition-colors block font-semibold text-gray-600">Boardroom AV Integration</Link></li>
              <li><Link to="/services/voip-telephony" className="hover:text-[#00B4D8] transition-colors block font-semibold text-gray-600">Enterprise VoIP &amp; IP-PBX</Link></li>
              <li><Link to="/av-equipment-rental" className="hover:text-[#00B4D8] transition-colors block">SMD LED Wall &amp; AV Equipment Rental</Link></li>
              <li><Link to="/3d-hologram" className="hover:text-[#00B4D8] transition-colors block">3D Hologram Display Stages</Link></li>
              <li className="pt-2 border-t border-gray-100"><Link to="/solutions" className="text-[#00B4D8] hover:text-[#1A2B4C] transition-colors block font-black">Solutions by Industry (Healthcare, Banking, HEC) →</Link></li>
            </ul>
          </div>
        </div>

        {/* VIDEO CONFERENCE */}
        <div className="h-10 flex items-center relative group">
          <Link
            to="/video-conference-in-pakistan"
            className={`h-10 flex items-center gap-1 whitespace-nowrap border-b-[2px] transition-colors focus-visible:outline-none focus-visible:border-[#00B4D8] focus-visible:text-[#00B4D8] group-hover:border-[#00B4D8] group-hover:text-[#00B4D8] ${isVideoConfActive ? 'border-[#00B4D8] text-[#00B4D8]' : 'border-transparent hover:text-[#00B4D8]'}`}
          >
            VIDEO CONFERENCE <ChevronDown size={12} className="transition-transform duration-150 group-hover:rotate-180 group-focus-within:rotate-180 shrink-0" />
          </Link>
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[620px] max-w-[calc(100vw-2rem)] bg-white shadow-2xl z-50 border border-gray-100 rounded-b-2xl p-5 transition-opacity duration-150 opacity-0 invisible pointer-events-none group-hover:opacity-100 group-hover:visible group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:visible group-focus-within:pointer-events-auto whitespace-normal">
            <div className="mb-3.5 pb-2.5 border-b border-gray-100 bg-blue-50/60 p-3 rounded-xl space-y-1.5">
              <Link to="/video-conference-in-pakistan" className="font-black text-xs text-[#1A2B4C] hover:text-[#00B4D8] flex items-center justify-between uppercase tracking-wider">
                <span>Video Conference in Pakistan — Complete Pillar Hub</span>
                <ArrowRight size={14} />
              </Link>
              <Link to="/video-conferencing-solutions" className="font-bold text-[11px] text-[#00B4D8] hover:underline block normal-case">
                Explore Turnkey Boardroom Solutions (Polycom Group 500, Poly X70, Cisco &amp; Logitech) →
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-5">
              <div>
                <div className="font-black text-[10px] text-gray-400 uppercase tracking-widest mb-2.5 pb-1 border-b border-gray-100">Poly Ecosystem</div>
                <ul className="space-y-1.5 text-[12px] text-gray-600 font-semibold capitalize tracking-normal">
                  <li><Link to="/product/polycom-realpresence-group-500-pakistan" className="hover:text-[#00B4D8] transition-colors block">Polycom Group 500</Link></li>
                  <li><Link to="/product/poly-studio-x72-pakistan" className="hover:text-[#00B4D8] transition-colors block">Poly Studio X72 / X70</Link></li>
                  <li><Link to="/product/poly-studio-x52-pakistan" className="hover:text-[#00B4D8] transition-colors block">Poly Studio X52</Link></li>
                  <li><Link to="/product/poly-g7500-pakistan" className="hover:text-[#00B4D8] transition-colors block">Poly G7500 Modular Codec</Link></li>
                  <li><Link to="/product/poly-studio-usb-video-bar-pakistan" className="hover:text-[#00B4D8] transition-colors block">Poly Studio USB Bar</Link></li>
                </ul>
              </div>
              <div>
                <div className="font-black text-[10px] text-gray-400 uppercase tracking-widest mb-2.5 pb-1 border-b border-gray-100">Cisco Ecosystem</div>
                <ul className="space-y-1.5 text-[12px] text-gray-600 font-semibold capitalize tracking-normal">
                  <li><Link to="/product/cisco-room-kit-plus-pakistan" className="hover:text-[#00B4D8] transition-colors block">Cisco Room Kit Plus</Link></li>
                  <li><Link to="/product/cisco-room-bar-pakistan" className="hover:text-[#00B4D8] transition-colors block">Cisco Room Bar</Link></li>
                  <li><Link to="/product/cisco-room-kit-eq-pakistan" className="hover:text-[#00B4D8] transition-colors block">Cisco Room Kit EQ</Link></li>
                  <li><Link to="/product/cisco-room-kit-pro-pakistan" className="hover:text-[#00B4D8] transition-colors block">Cisco Room Kit PRO</Link></li>
                </ul>
              </div>
              <div>
                <div className="font-black text-[10px] text-gray-400 uppercase tracking-widest mb-2.5 pb-1 border-b border-gray-100">Logitech &amp; Displays</div>
                <ul className="space-y-1.5 text-[12px] text-gray-600 font-semibold capitalize tracking-normal">
                  <li><Link to="/product/logitech-rally-bar-pakistan" className="hover:text-[#00B4D8] transition-colors block">Logitech Rally Bar</Link></li>
                  <li><Link to="/product/logitech-rally-bar-mini-pakistan" className="hover:text-[#00B4D8] transition-colors block">Logitech Rally Bar Mini</Link></li>
                  <li><Link to="/product/horion-k6a-bundle-special-offer" className="hover:text-[#00B4D8] transition-colors block">Horion K6a 4K IFP Bundle</Link></li>
                  <li>
                    <Link to="/room-designer" className="text-[#F26522] hover:text-[#1A2B4C] transition-colors block font-bold text-xs mt-2 flex items-center gap-1">
                      3D Room Designer <ArrowRight size={12} />
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* AI SOLUTIONS */}
        <div className="h-10 flex items-center relative group">
          <Link
            to="/services/ai-development"
            className={`h-10 flex items-center gap-1 whitespace-nowrap border-b-[2px] transition-colors focus-visible:outline-none focus-visible:border-[#00B4D8] focus-visible:text-[#00B4D8] group-hover:border-[#00B4D8] group-hover:text-[#00B4D8] ${isAiSolutionsActive ? 'border-[#00B4D8] text-[#00B4D8]' : 'border-transparent hover:text-[#00B4D8]'}`}
          >
            AI SOLUTIONS <ChevronDown size={12} className="transition-transform duration-150 group-hover:rotate-180 group-focus-within:rotate-180 shrink-0" />
          </Link>
          <div className="absolute top-10 left-0 w-[260px] bg-white shadow-2xl z-50 border border-gray-100 rounded-b-2xl p-4 transition-opacity duration-150 opacity-0 invisible pointer-events-none group-hover:opacity-100 group-hover:visible group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:visible group-focus-within:pointer-events-auto">
            <ul className="space-y-2.5 text-[12px] text-gray-700 font-semibold capitalize tracking-normal whitespace-normal">
              <li><Link to="/services/ai-development" className="hover:text-[#00B4D8] transition-colors block">AI Development</Link></li>
              <li><Link to="/services/ai-agents-workers" className="hover:text-[#00B4D8] transition-colors block">AI Agents &amp; Digital Workers</Link></li>
              <li><Link to="/services/ai-automation" className="hover:text-[#00B4D8] transition-colors block">AI Business Automation</Link></li>
            </ul>
          </div>
        </div>

        {/* VOIP & UC */}
        <div className="h-10 flex items-center relative group">
          <Link
            to="/voip-service-providers"
            className={`h-10 flex items-center gap-1 whitespace-nowrap border-b-[2px] transition-colors focus-visible:outline-none focus-visible:border-[#00B4D8] focus-visible:text-[#00B4D8] group-hover:border-[#00B4D8] group-hover:text-[#00B4D8] ${isVoipActive ? 'border-[#00B4D8] text-[#00B4D8]' : 'border-transparent hover:text-[#00B4D8]'}`}
          >
            VOIP &amp; UC <ChevronDown size={12} className="transition-transform duration-150 group-hover:rotate-180 group-focus-within:rotate-180 shrink-0" />
          </Link>
          <div className="absolute top-10 right-0 xl:left-0 xl:right-auto w-[280px] bg-white shadow-2xl z-50 border border-gray-100 rounded-b-2xl p-4 transition-opacity duration-150 opacity-0 invisible pointer-events-none group-hover:opacity-100 group-hover:visible group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:visible group-focus-within:pointer-events-auto">
            <ul className="space-y-2 text-[12px] text-gray-700 font-semibold capitalize tracking-normal whitespace-normal">
              <li><Link to="/product/3cx-pro-8-sc-pakistan" className="hover:text-[#00B4D8] transition-colors block">3CX Phone System &amp; PRO 8</Link></li>
              <li><Link to="/product/freepbx-enterprise-pakistan" className="hover:text-[#00B4D8] transition-colors block">FreePBX Enterprise</Link></li>
              <li><Link to="/product/cisco-cucm-license-pakistan" className="hover:text-[#00B4D8] transition-colors block">Cisco CUCM License</Link></li>
              <li><Link to="/product/grandstream-ucm6308-pakistan" className="hover:text-[#00B4D8] transition-colors block">Grandstream UCM6308</Link></li>
              <li><Link to="/product/2n-ip-vario-intercom-pakistan" className="hover:text-[#00B4D8] transition-colors block">2N IP Vario &amp; Axis Door Intercoms</Link></li>
              <li className="pt-2 border-t border-gray-100"><Link to="/voip-service-providers" className="hover:text-[#00B4D8] transition-colors block font-bold text-[#F26522]">VoIP Service Providers Hub</Link></li>
            </ul>
          </div>
        </div>

        {/* Direct Quick-Links */}
        <Link
          to="/corporate-event-management"
          className={`h-10 flex items-center whitespace-nowrap border-b-[2px] transition-colors focus-visible:outline-none focus-visible:border-[#00B4D8] focus-visible:text-[#00B4D8] ${isCorporateEventsActive ? 'border-[#00B4D8] text-[#00B4D8]' : 'border-transparent hover:text-[#00B4D8]'}`}
        >
          CORPORATE EVENTS
        </Link>
        <Link
          to="/room-designer"
          className={`h-10 flex items-center whitespace-nowrap border-b-[2px] transition-colors focus-visible:outline-none focus-visible:border-[#00B4D8] focus-visible:text-[#00B4D8] ${isRoomDesignerActive ? 'border-[#00B4D8] text-[#00B4D8]' : 'border-transparent hover:text-[#00B4D8]'}`}
        >
          3D ROOM DESIGNER
        </Link>
      </div>
    </nav>
  );
});

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { itemCount } = useCart();

  const { user, userProfile, logout, isAuthenticated, isAdmin, isEditor, isSupport } = useAuth();

  // Search and Suggestions State (pre-populated with synchronous 55-SKU fallback catalog for 0ms autocomplete)
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<any[]>(FALLBACK_NAV_PRODUCTS);
  const [categories, setCategories] = useState<any[]>(DEFAULT_NAV_CATEGORIES.filter(c => !c.parentId));
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [navCategories, setNavCategories] = useState<any[]>(DEFAULT_NAV_CATEGORIES);

  // Immediately close mobile drawer and search suggestions when route changes
  useEffect(() => {
    setIsOpen(false);
    setShowSuggestions(false);
  }, [location.pathname, location.search]);

  const closeAllMenus = () => {
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
    let unsubProducts: (() => void) | undefined;
    let unsubCategories: (() => void) | undefined;

    // Defer non-critical Firestore listeners off the main thread for instant INP responsiveness
    const timer = setTimeout(() => {
      unsubProducts = subscribeToProducts((data) => {
        if (data && data.length > 0) {
          setProducts(data);
        }
      }, { isActive: true });

      unsubCategories = subscribeToCategories((cats) => {
        const productCats = cats.filter(c => c.isActive && ((c as any).type === 'product' || !('type' in c)));
        if (productCats.length > 0) {
          setNavCategories(productCats);
          setCategories(productCats.filter(c => !c.parentId));
        }
      });
    }, 2200);

    // Handle click outside desktop or mobile search suggestions
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const isInsideDesktop = searchRef.current && searchRef.current.contains(target);
      const isInsideMobile = mobileSearchRef.current && mobileSearchRef.current.contains(target);
      if (!isInsideDesktop && !isInsideMobile) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      clearTimeout(timer);
      if (unsubProducts) unsubProducts();
      if (unsubCategories) unsubCategories();
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
      <div className="hidden lg:flex bg-[#f8f9fa] text-gray-600 px-3 sm:px-4 md:px-8 text-[11px] justify-between items-center border-b border-gray-200 font-medium h-8 shrink-0">
        <div className="flex items-center gap-4 sm:gap-5">
          <a href="tel:+923214256263" className="inline-flex items-center gap-1.5 hover:text-[#00B4D8] transition-colors py-0.5 font-semibold text-[#1A2B4C] sm:font-medium sm:text-gray-600"><Phone size={12} className="text-[#00B4D8] shrink-0" /> 0321 425 6263</a>
          <span className="hidden sm:flex items-center gap-1.5"><MapPin size={12} className="text-[#00B4D8]" /> Johar Town Block N, Lahore</span>
          <div className="hidden xl:flex items-center gap-3 text-[11px] text-slate-600 border-l border-gray-200 pl-4">
            <a href="https://www.youtube.com/@avlivepk" target="_blank" rel="noopener" className="hover:text-[#00B4D8]">YouTube</a>
            <a href="https://x.com/avlivepk" target="_blank" rel="noopener" className="hover:text-[#00B4D8]">X</a>
            <a href="https://www.linkedin.com/company/avlivepk" target="_blank" rel="noopener" className="hover:text-[#00B4D8]">LinkedIn</a>
            <a href="https://www.instagram.com/avlivepk" target="_blank" rel="noopener" className="hover:text-[#00B4D8]">Instagram</a>
            <a href="https://www.facebook.com/avlivepk" target="_blank" rel="noopener" className="hover:text-[#00B4D8]">Facebook</a>
          </div>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <Link to="/sitemap" className="hidden md:inline-flex items-center hover:text-[#00B4D8] transition-colors font-semibold text-[#1A2B4C] py-0.5">Site Directory</Link>
          <Link to="/contact" className="hidden xs:inline-flex sm:inline-flex items-center hover:text-[#00B4D8] transition-colors py-0.5">Contact Us</Link>
          <Link to="/blog" className="hidden sm:inline-flex items-center hover:text-[#00B4D8] transition-colors py-0.5">Blog</Link>
          <Link to="/guides" className="hidden sm:inline-flex items-center hover:text-[#00B4D8] transition-colors py-0.5">Buyer's Guides</Link>
          {isAuthenticated ? (
            <details className="relative group">
              <summary className="list-none [&::-webkit-details-marker]:hidden flex items-center justify-center gap-1.5 hover:text-[#00B4D8] transition-colors focus:outline-none cursor-pointer">
                {userProfile?.photoURL || user?.photoURL ? (
                  <img
                    src={userProfile?.photoURL || user?.photoURL || undefined}
                    alt={userProfile?.displayName || user?.displayName || 'User'}
                    className="w-4 h-4 rounded-full object-cover border border-[#00B4D8]"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-4 h-4 rounded-full bg-[#00B4D8] text-white flex items-center justify-center font-black text-[8px]">
                    {getInitials()}
                  </div>
                )}
                <span className="max-w-[100px] truncate hidden md:inline">
                  {userProfile?.displayName || user?.displayName || userProfile?.email?.split('@')[0] || 'Account'}
                </span>
                <ChevronDown size={11} className="transition-transform duration-200 group-open:rotate-180" />
              </summary>

              <div className="absolute right-0 mt-1.5 w-52 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[100] py-2.5 text-[#1A2B4C] normal-case">
                <div className="px-3.5 py-1.5 border-b border-gray-50 mb-1.5">
                  <div className="font-black text-[9px] text-gray-400 uppercase tracking-widest mb-0.5">Signed In As</div>
                  <div className="font-black text-[#1A2B4C] truncate text-xs">
                    {userProfile?.displayName || user?.displayName || 'Active Member'}
                  </div>
                  <div className="text-[10px] text-gray-400 truncate">{userProfile?.email || user?.email}</div>
                  
                  <div className="mt-1.5 inline-flex items-center gap-1 bg-[#00B4D8]/10 text-[#00B4D8] px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider">
                    {getRoleLabel()}
                  </div>
                </div>

                {(isAdmin || isEditor || isSupport) && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-black text-[#1A2B4C] hover:bg-gray-50 hover:text-[#00B4D8] transition-colors"
                  >
                    <User size={13} />
                    Admin Dashboard
                  </Link>
                )}

                <button
                  type="button"
                  onClick={() => logout()}
                  className="w-full flex items-center gap-2 px-3.5 py-1.5 text-xs font-black text-red-600 hover:bg-red-50 transition-colors text-left"
                >
                  <User size={13} className="rotate-180" />
                  Sign Out
                </button>
              </div>
            </details>
          ) : (
            <Link to="/admin/login" className="hover:text-[#00B4D8] transition-colors inline-flex items-center justify-center gap-1 py-0.5">
              <User size={12} className="mb-0.5" />
              Sign In
            </Link>
          )}
        </div>
      </div>

      {/* Compact Sticky Header (Mobile 1-Row 54px; Desktop 56px + 40px Nav = 96px) */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-xs border-b border-gray-100 lg:border-gray-200">
        {/* Compact 1-Row Mobile Top Bar (< 1024px — 54px height) */}
        <div className="lg:hidden h-[54px] px-3 py-1.5 flex items-center gap-2 bg-[#F8F9FA]/95 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle mobile menu"
            className="w-9 h-9 rounded-xl bg-white border border-gray-200/80 shadow-xs flex items-center justify-center text-[#1A2B4C] hover:text-[#00B4D8] transition-colors shrink-0 cursor-pointer"
          >
            {isOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          <Link
            to="/"
            onClick={closeAllMenus}
            className="flex items-center shrink-0 pr-0.5"
            aria-label="AV Live Home"
          >
            <span className="bg-[#1A2B4C] text-white font-black text-xs px-1.5 py-1 rounded-md leading-none tracking-tight">
              AV
            </span>
            <span className="text-[#1A2B4C] font-black text-xs ml-1 leading-none tracking-tight hidden xs:inline">
              Live
            </span>
          </Link>

          <div ref={mobileSearchRef} className="relative flex-1 min-w-0">
            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center bg-white rounded-xl border border-gray-200/80 shadow-xs h-9 pl-2.5 pr-1"
            >
              <Search size={14} className="text-gray-400 shrink-0 mr-1.5" />
              <label htmlFor="mobile-top-search" className="sr-only">Search AV hardware</label>
              <input
                id="mobile-top-search"
                type="text"
                placeholder="Search Poly, Cisco, VoIP..."
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
                className="w-full min-w-0 bg-transparent text-xs font-semibold text-[#1A2B4C] placeholder-gray-400 focus:outline-none h-9"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setShowSuggestions(false);
                  }}
                  aria-label="Clear search"
                  className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-[#1A2B4C] shrink-0"
                >
                  <X size={13} />
                </button>
              )}
              <button
                type="submit"
                aria-label="Submit search"
                className="w-7 h-7 rounded-lg bg-[#1A2B4C] hover:bg-[#00B4D8] text-white flex items-center justify-center shrink-0 transition-colors cursor-pointer ml-0.5"
              >
                <ArrowRight size={13} />
              </button>
            </form>

            {/* Mobile Live Search Suggestions Dropdown */}
            {showSuggestions && searchQuery.trim().length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden divide-y divide-gray-50">
                {searchSuggestions.length > 0 ? (
                  <div>
                    <div className="px-3 py-1.5 bg-gray-50/60 text-[10px] font-black uppercase tracking-widest text-[#00B4D8] flex justify-between items-center">
                      <span>Matching Hardware</span>
                      <span>{searchSuggestions.length} items</span>
                    </div>
                    <div className="max-h-[260px] overflow-y-auto divide-y divide-gray-50">
                      {searchSuggestions.map((product, sIdx) => (
                        <Link
                          key={`mob-${product.id || product.slug || sIdx}`}
                          to={`/product/${getCanonicalProductSlug(product, product.id)}`}
                          className="flex items-center gap-2.5 p-2.5 hover:bg-gray-50/80 transition-colors group"
                          onClick={closeAllMenus}
                        >
                          <div className="w-9 h-9 bg-white rounded-lg border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                            <img
                              src={product.images?.[0] || 'https://via.placeholder.com/48'}
                              alt={product.productName}
                              className="w-full h-full object-contain p-1"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-xs text-[#1A2B4C] group-hover:text-[#00B4D8] transition-colors truncate">
                              {product.productName}
                            </div>
                            <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider truncate">
                              {product.brand} · {product.sku}
                            </div>
                          </div>
                          <div className="shrink-0 text-right">
                            <div className="text-[11px] font-black text-[#1A2B4C]">
                              {product.salePrice ? `Rs. ${product.salePrice.toLocaleString()}` : 'Quote'}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={handleSearchSubmit}
                      className="w-full text-center py-2.5 text-[11px] font-black text-[#00B4D8] hover:bg-gray-50 border-t border-gray-100 uppercase tracking-widest transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      View All Results <ArrowRight size={13} />
                    </button>
                  </div>
                ) : (
                  <div className="p-4 text-center">
                    <div className="text-xs font-bold text-[#1A2B4C]">No Hardware Found</div>
                    <p className="text-[11px] text-gray-500 mt-0.5">No matches for "{searchQuery}".</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <a
            href="tel:+923214256263"
            aria-label="Call AV Live Engineering Desk"
            className="relative w-9 h-9 rounded-xl bg-white border border-gray-200/80 shadow-xs flex items-center justify-center text-[#1A2B4C] hover:text-[#00B4D8] transition-colors shrink-0"
          >
            <Phone size={16} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-rose-500 ring-1 ring-white" />
          </a>
        </div>

        {/* Desktop Header Row (>= 1024px — 56px height) */}
        <div className="hidden lg:flex max-w-[1400px] mx-auto px-4 md:px-8 items-center justify-between gap-4 md:gap-6 h-14">
          <div className="flex items-center gap-4 md:gap-6 flex-1 min-w-0">
            <Link to="/" onClick={closeAllMenus} className="flex flex-col justify-center shrink-0">
              <div className="flex items-stretch">
                <div className="bg-black text-[#f0f0f0] font-black text-lg md:text-2xl px-2 py-0.5 leading-none tracking-tight">AV</div>
                <div className="text-black font-black text-lg md:text-2xl leading-none ml-1.5 flex items-center tracking-tight">Live</div>
              </div>
              <div className="text-black font-light text-[7px] md:text-[8px] tracking-[0.34em] mt-0.5 ml-0.5 uppercase">Communication</div>
            </Link>

            <div className="shrink-0 hidden lg:flex flex-col">
              <a href="tel:+923214256263" className="text-[#F26522] font-black text-sm xl:text-base tracking-tight leading-tight hover:underline">0321 425 6263</a>
              <div className="text-gray-500 text-[10px] font-medium uppercase tracking-wider">9 AM - 6 PM PKT M-S</div>
            </div>

            <div ref={searchRef} className="flex-1 relative max-w-2xl min-w-0">
              <form onSubmit={handleSearchSubmit} className="flex w-full bg-gray-50/70 hover:bg-white focus-within:bg-white border border-gray-200 focus-within:border-[#00B4D8] focus-within:ring-2 focus-within:ring-[#00B4D8]/15 rounded-full overflow-visible transition-all duration-200 relative items-center pr-1 h-9 shadow-xs">
                {/* Native HTML-first category select */}
                <div className="relative h-full hidden sm:flex items-center shrink-0">
                  <label htmlFor="navbar-category-select" className="sr-only">Filter by category</label>
                  <select
                    id="navbar-category-select"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="appearance-none pl-3.5 pr-7 h-full bg-gray-100/60 hover:bg-gray-100 text-gray-700 hover:text-[#1A2B4C] font-semibold text-[11px] border-r border-gray-200/60 transition-colors focus:outline-none shrink-0 rounded-l-full cursor-pointer max-w-[140px] truncate"
                  >
                    <option value="All">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={11} className="text-gray-400 pointer-events-none absolute right-2" />
                </div>

                <label htmlFor="navbar-search" className="sr-only">Search products</label>
                <input 
                  id="navbar-search"
                  type="text" 
                  placeholder="Search AV & VoIP hardware..."
                  className="flex-1 min-w-0 px-3 py-1 bg-transparent focus:outline-none text-xs placeholder-gray-400 font-semibold text-[#1A2B4C]"
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
                  aria-label="Search hardware catalog" 
                  className="bg-[#1A2B4C] hover:bg-[#00B4D8] text-white rounded-full flex items-center justify-center transition-all duration-200 shrink-0 shadow-xs w-7 h-7 cursor-pointer"
                >
                  <Search size={13} />
                </button>
              </form>

              {/* Search Suggestions & Discovery Panel */}
              {showSuggestions && searchQuery.trim().length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden divide-y divide-gray-50">
                  {searchSuggestions.length > 0 ? (
                    <div>
                      <div className="px-4 py-2 bg-gray-50/60 text-xs font-black uppercase tracking-widest text-[#00B4D8] flex justify-between items-center">
                        <span>Matching Hardware</span>
                        <span>{searchSuggestions.length} items found</span>
                      </div>
                      <div className="max-h-[340px] overflow-y-auto divide-y divide-gray-50">
                        {searchSuggestions.map((product, sIdx) => (
                          <Link 
                            key={`${product.id || product.slug || sIdx}`} 
                            to={`/product/${getCanonicalProductSlug(product, product.id)}`}
                            className="flex items-center gap-3.5 p-3 hover:bg-gray-50/80 transition-colors group"
                            onClick={closeAllMenus}
                          >
                            <div className="w-10 h-10 bg-white rounded-xl border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center shadow-xs">
                              <img 
                                src={product.images?.[0] || 'https://via.placeholder.com/48'} 
                                alt={product.productName} 
                                className="w-full h-full object-contain p-1" 
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-xs text-[#1A2B4C] group-hover:text-[#00B4D8] transition-colors truncate">
                                {product.productName}
                              </div>
                              <div className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider mt-0.5">
                                {product.brand} • <span className="text-gray-400">SKU:</span> {product.sku}
                              </div>
                            </div>
                            <div className="shrink-0 text-right">
                              <div className="text-xs font-black text-[#1A2B4C]">
                                {product.salePrice ? `Rs. ${product.salePrice.toLocaleString()}` : 'Contact for Price'}
                              </div>
                              {product.stockQuantity > 0 ? (
                                <span className="inline-block text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full mt-0.5">In Stock</span>
                              ) : (
                                <span className="inline-block text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full mt-0.5">Special Order</span>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                      <button 
                        onClick={handleSearchSubmit} 
                        className="w-full text-center py-2.5 text-xs font-black text-[#00B4D8] hover:bg-gray-50 border-t border-gray-100 uppercase tracking-widest transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        View All Search Results <ArrowRight size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="p-6 text-center">
                      <div className="text-xs font-bold text-[#1A2B4C]">No Hardware Found</div>
                      <p className="text-[11px] text-gray-500 mt-1 max-w-xs mx-auto">We couldn't find matches for "{searchQuery}".</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link to="/cart" onClick={closeAllMenus} aria-label={`Shopping cart, containing ${itemCount} items`} className="relative p-2 flex items-center justify-center text-[#1A2B4C] hover:text-[#00B4D8] transition-colors group">
              <ShoppingCart size={20} className="group-hover:scale-110 transition-transform" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#F26522] text-white text-[10px] font-black w-4 h-4 flex items-center justify-center rounded-full border border-white">{itemCount}</span>
              )}
            </Link>
          </div>
        </div>

        {/* Main Navigation Row - Static HTML-first & CSS group-hover/focus-within dropdowns */}
        <StaticPrimaryNav pathname={location.pathname} />

        {/* Compact Mobile Menu Drawer (Fits cleanly between 54px top header and 52px bottom dock) */}
        {isOpen && (
          <div className="fixed top-[54px] bottom-[52px] left-0 right-0 bg-[#F8F9FA] px-3 pt-2.5 pb-12 space-y-2.5 shadow-2xl z-40 overflow-y-auto lg:hidden">
            {/* Compact Top Hub Identity Card */}
            <div className="bg-white rounded-2xl p-3.5 border border-gray-100 shadow-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-full bg-[#1A2B4C] text-white flex items-center justify-center font-black text-xs shadow-xs shrink-0 border-2 border-[#00B4D8]/25">
                  {isAuthenticated ? getInitials() : 'AV'}
                </div>
                <div className="min-w-0">
                  <div className="font-black text-xs text-[#1A2B4C] truncate">
                    {isAuthenticated ? (userProfile?.displayName || user?.displayName || 'Enterprise Member') : 'AV Live Communications'}
                  </div>
                  <div className="text-[10px] text-gray-400 font-medium truncate">
                    {isAuthenticated ? (userProfile?.email || user?.email) : 'Lahore · Karachi · Islamabad'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Link
                  to="/programs/quote"
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-1.5 min-h-[32px] rounded-xl bg-[#1A2B4C] text-white text-[10px] font-bold inline-flex items-center justify-center hover:bg-[#00B4D8] transition-colors"
                >
                  BoQ Quote
                </Link>
                <Link
                  to="/room-designer"
                  onClick={() => setIsOpen(false)}
                  className="px-2.5 py-1.5 min-h-[32px] rounded-xl bg-[#00B4D8]/10 text-[#1A2B4C] text-[10px] font-bold inline-flex items-center justify-center hover:bg-[#00B4D8] hover:text-white transition-colors"
                >
                  3D Room
                </Link>
              </div>
            </div>

            {/* Card Group 1: Hardware Catalog & Categories */}
            <div className="bg-white rounded-2xl p-3 border border-gray-100 shadow-xs">
              <div className="px-1.5 pb-1.5 mb-1 text-[11px] font-black text-[#1A2B4C] uppercase tracking-wider border-b border-gray-50 flex items-center justify-between">
                <span>Hardware Categories</span>
                <Link to="/shop" onClick={() => setIsOpen(false)} className="text-[10px] font-bold text-[#00B4D8] inline-flex items-center">
                  All 53 SKUs →
                </Link>
              </div>
              <div className="divide-y divide-gray-50">
                {categories.map((parent) => {
                  const subCats = navCategories.filter((c) => c.parentId === parent.id);
                  if (subCats.length === 0) {
                    return (
                      <div key={parent.id} className="flex items-center justify-between">
                        <Link
                          to={`/category/${parent.slug || parent.id}`}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-2.5 min-h-[36px] py-1.5 px-1.5 flex-1 text-xs font-bold text-[#1A2B4C] hover:text-[#00B4D8] transition-colors"
                        >
                          <span className="w-6 h-6 rounded-lg bg-[#F8F9FA] border border-gray-100 flex items-center justify-center text-[#1A2B4C] text-[9px] font-black shrink-0">
                            {parent.name.substring(0, 2).toUpperCase()}
                          </span>
                          <span className="flex-1 truncate">{parent.name}</span>
                          <ArrowRight size={13} className="text-gray-300" />
                        </Link>
                      </div>
                    );
                  }
                  return (
                    <details key={parent.id} className="group">
                      <summary
                        aria-label={`Toggle ${parent.name} subcategories`}
                        className="list-none [&::-webkit-details-marker]:hidden flex items-center justify-between cursor-pointer min-h-[36px] py-1.5 px-1.5 text-xs font-bold text-[#1A2B4C] hover:text-[#00B4D8] transition-colors select-none"
                      >
                        <span className="flex items-center gap-2.5 flex-1 min-w-0">
                          <span className="w-6 h-6 rounded-lg bg-[#F8F9FA] border border-gray-100 flex items-center justify-center text-[#1A2B4C] text-[9px] font-black shrink-0">
                            {parent.name.substring(0, 2).toUpperCase()}
                          </span>
                          <span className="flex-1 truncate">{parent.name}</span>
                        </span>
                        <span className="w-7 h-7 flex items-center justify-center text-gray-400 group-hover:text-[#1A2B4C]">
                          <ChevronDown size={14} className="transition-transform group-open:rotate-180" />
                        </span>
                      </summary>
                      <div className="pl-9 pr-1.5 pb-1.5 space-y-0.5">
                        <Link
                          to={`/category/${parent.slug || parent.id}`}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center justify-between min-h-[32px] px-1.5 text-[11px] font-bold text-[#00B4D8] hover:text-[#1A2B4C]"
                        >
                          <span>All {parent.name}</span>
                          <ArrowRight size={11} className="text-[#00B4D8]" />
                        </Link>
                        {subCats.map((sub) => (
                          <Link
                            key={sub.id}
                            to={`/category/${sub.slug || sub.id}`}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center justify-between min-h-[32px] px-1.5 text-[11px] font-semibold text-gray-500 hover:text-[#00B4D8]"
                          >
                            <span>{sub.name}</span>
                            <ArrowRight size={11} className="text-gray-300" />
                          </Link>
                        ))}
                      </div>
                    </details>
                  );
                })}
              </div>
            </div>

            {/* Card Group 2: Pillar Services & Solutions */}
            <div className="bg-white rounded-2xl p-3 border border-gray-100 shadow-xs">
              <div className="px-1.5 pb-1.5 mb-1 text-[11px] font-black text-[#1A2B4C] uppercase tracking-wider border-b border-gray-50">
                Core Services &amp; Pillar Hubs
              </div>
              <div className="divide-y divide-gray-50">
                {[
                  { label: 'Video Conference in Pakistan', path: '/video-conference-in-pakistan', badge: 'VH' },
                  { label: 'Video Conferencing Solutions', path: '/video-conferencing-solutions', badge: 'VC' },
                  { label: 'Corporate Event Management', path: '/corporate-event-management', badge: 'CE' },
                  { label: '3D Projection Mapping & Holograms', path: '/projection-mapping', badge: '3D' },
                  { label: 'AV Equipment & SMD LED Rental', path: '/av-equipment-rental', badge: 'AV' },
                  { label: 'Live Streaming & Hybrid Events', path: '/live-streaming-services', badge: 'LS' },
                  { label: 'VoIP & IP-PBX Service Providers', path: '/voip-service-providers', badge: 'UC' },
                  { label: 'AI Business Automation & Agents', path: '/services/ai-automation', badge: 'AI' },
                ].map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2.5 min-h-[36px] py-1.5 px-1.5 text-xs font-bold text-[#1A2B4C] hover:text-[#00B4D8] transition-colors"
                  >
                    <span className="w-6 h-6 rounded-lg bg-[#F8F9FA] border border-gray-100 flex items-center justify-center text-[#1A2B4C] text-[9px] font-black shrink-0">
                      {item.badge}
                    </span>
                    <span className="flex-1 truncate">{item.label}</span>
                    <ArrowRight size={13} className="text-gray-300" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Card Group 3: Support, Regional Hubs & Directory */}
            <div className="bg-white rounded-2xl p-3 border border-gray-100 shadow-xs">
              <div className="px-1.5 pb-1.5 mb-1 text-[11px] font-black text-[#1A2B4C] uppercase tracking-wider border-b border-gray-50">
                Enterprise Support &amp; Regional Hubs
              </div>
              <div className="divide-y divide-gray-50">
                {[
                  { label: 'AV Live Lahore Head Office', path: '/lahore', badge: 'LH' },
                  { label: 'AV Live Karachi Regional Hub', path: '/karachi', badge: 'KH' },
                  { label: 'AV Live Islamabad Regional Hub', path: '/islamabad', badge: 'IS' },
                  { label: 'Enterprise AV Buyer’s Guides', path: '/guides', badge: 'BG' },
                  { label: 'Company Blog & Case Studies', path: '/blog', badge: 'BL' },
                  { label: 'RMA & Hardware Warranty Service', path: '/rma', badge: 'RM' },
                  { label: 'Complete Site Directory (155 Pages)', path: '/sitemap', badge: 'SD' },
                  { label: 'Contact Engineering Support', path: '/contact', badge: 'CS' },
                ].map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2.5 min-h-[36px] py-1.5 px-1.5 text-xs font-bold text-[#1A2B4C] hover:text-[#00B4D8] transition-colors"
                  >
                    <span className="w-6 h-6 rounded-lg bg-[#F8F9FA] border border-gray-100 flex items-center justify-center text-[#1A2B4C] text-[9px] font-black shrink-0">
                      {item.badge}
                    </span>
                    <span className="flex-1 truncate">{item.label}</span>
                    <ArrowRight size={13} className="text-gray-300" />
                  </Link>
                ))}
              </div>

              <div className="mt-2.5 pt-2.5 border-t border-gray-100">
                {isAuthenticated ? (
                  <div className="flex flex-col gap-1.5">
                    {(isAdmin || isEditor || isSupport) && (
                      <Link
                        to="/admin"
                        onClick={() => setIsOpen(false)}
                        className="w-full min-h-[38px] rounded-xl bg-[#1A2B4C] text-white font-black text-xs uppercase tracking-widest flex items-center justify-center"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        logout();
                      }}
                      className="w-full min-h-[38px] rounded-xl bg-red-50 text-red-600 font-black text-xs uppercase tracking-widest flex items-center justify-center cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/admin/login"
                    onClick={() => setIsOpen(false)}
                    className="w-full min-h-[38px] rounded-xl bg-[#1A2B4C] text-white font-black text-xs uppercase tracking-widest flex items-center justify-center hover:bg-[#00B4D8] transition-colors"
                  >
                    Partner &amp; Admin Sign In
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Slim 52px Mobile Bottom Navigation Dock (< 1024px) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] pointer-events-none">
        <div className="relative bg-[#0B132B] text-white rounded-t-2xl shadow-[0_-6px_20px_rgba(11,19,43,0.28)] pb-safe pointer-events-auto border-t border-white/10">
          {/* Compact Center Shopping Cart Button */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
            <Link
              to="/cart"
              onClick={() => setIsOpen(false)}
              aria-label={`Shopping cart with ${itemCount} items`}
              className={`w-11 h-11 rounded-full flex items-center justify-center ring-4 ring-[#F8F9FA] shadow-lg transition-transform active:scale-95 relative ${
                location.pathname === '/cart'
                  ? 'bg-[#00B4D8] text-[#0B132B]'
                  : 'bg-[#1A2B4C] text-white hover:bg-[#00B4D8]'
              }`}
            >
              <ShoppingCart size={18} strokeWidth={2.2} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#F26522] text-white text-[9px] font-black min-w-[17px] h-[17px] px-1 rounded-full flex items-center justify-center border border-[#0B132B]">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>

          <div className="grid grid-cols-5 items-center h-[52px] px-1">
            {/* 1. Home */}
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              aria-label="Home"
              className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
                location.pathname === '/' && !isOpen ? 'text-[#00B4D8]' : 'text-gray-300 hover:text-white'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              <span className="text-[9px] font-bold tracking-tight leading-none mt-1">Home</span>
            </Link>

            {/* 2. Shop / Store */}
            <Link
              to="/shop"
              onClick={() => setIsOpen(false)}
              aria-label="Shop Store"
              className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
                (location.pathname.startsWith('/shop') || location.pathname.startsWith('/category') || location.pathname.startsWith('/brands')) && !isOpen
                  ? 'text-[#00B4D8]'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              <span className="text-[9px] font-bold tracking-tight leading-none mt-1">Shop</span>
            </Link>

            {/* 3. Center Spacer & Label for Elevated Cart Button */}
            <div className="flex flex-col items-center justify-end h-full pb-1.5 pointer-events-none" aria-hidden="true">
              <span className="text-[9px] font-bold tracking-tight leading-none text-gray-300">Cart</span>
            </div>

            {/* 4. Search */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setTimeout(() => document.getElementById('mobile-top-search')?.focus(), 120);
              }}
              aria-label="Search hardware"
              className="flex flex-col items-center justify-center w-full h-full text-gray-300 hover:text-white transition-colors cursor-pointer"
            >
              <Search size={17} />
              <span className="text-[9px] font-bold tracking-tight leading-none mt-1">Search</span>
            </button>

            {/* 5. Hub Menu / Profile Directory */}
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? 'Close directory menu' : 'Open directory menu'}
              className={`flex flex-col items-center justify-center w-full h-full transition-colors cursor-pointer ${
                isOpen ? 'text-[#00B4D8]' : 'text-gray-300 hover:text-white'
              }`}
            >
              <Menu size={17} />
              <span className="text-[9px] font-bold tracking-tight leading-none mt-1">Menu</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

import { ScrollToTop } from "./components/ScrollToTop";

export default function App() {
  const [showDeferredWidgets, setShowDeferredWidgets] = useState(false);
  const [showCookieConsent, setShowCookieConsent] = useState(false);

  useEffect(() => {
    const widgetTimer = setTimeout(() => setShowDeferredWidgets(true), 2500);
    const cookieTimer = setTimeout(() => setShowCookieConsent(true), 15000);

    const handleEarlyCookieSettings = () => {
      (window as unknown as { __avliveOpenCookieSettings?: boolean }).__avliveOpenCookieSettings = true;
      setShowCookieConsent(true);
    };
    window.addEventListener('open-cookie-settings', handleEarlyCookieSettings);

    return () => {
      clearTimeout(widgetTimer);
      clearTimeout(cookieTimer);
      window.removeEventListener('open-cookie-settings', handleEarlyCookieSettings);
    };
  }, []);

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
          {/* Internal Link Map — Core Business & Service Alias Redirects */}
          <Route path="/hybrid-event-production" element={<Navigate to="/services/hybrid-events" replace />} />
          <Route path="/boardroom-av-integration" element={<Navigate to="/services/boardroom-integration" replace />} />
          <Route path="/expo-trade-show-organizing" element={<Navigate to="/services/expo-organizing" replace />} />
          <Route path="/e-sports-arena-production" element={<Navigate to="/esports" replace />} />
          <Route path="/3d-hologram-display-stages" element={<Navigate to="/3d-hologram" replace />} />
          <Route path="/av-systems-design-engineering" element={<Navigate to="/services/boardroom-integration" replace />} />
          {/* Internal Link Map — Brand & Platform Solution Alias Redirects */}
          <Route path="/solutions/zoom-microsoft-teams-rooms" element={<Navigate to="/zoom-rooms" replace />} />
          {/* Internal Link Map — Product Category Keyword Redirects */}
          <Route path="/products/video-conference-systems-codecs" element={<Navigate to="/category/boardroom-codecs" replace />} />
          <Route path="/products/all-in-one-video-bars" element={<Navigate to="/category/video-conferencing" replace />} />
          <Route path="/products/interactive-displays-touch-panels" element={<Navigate to="/category/touch-panels" replace />} />
          <Route path="/products/ip-phones-voip" element={<Navigate to="/category/voip-phone-systems" replace />} />
          <Route path="/products/audio-microphones" element={<Navigate to="/category/speakerphones" replace />} />
          <Route path="/products/wireless-presentation-byod" element={<Navigate to="/category/touch-panels" replace />} />
          <Route path="/products/projectors" element={<Navigate to="/category/projectors" replace />} />
          <Route path="/products/ip-cameras-ptz" element={<Navigate to="/category/ptz-cameras" replace />} />
          <Route path="/products/intercom-paging-access" element={<Navigate to="/category/intercom-paging-access" replace />} />
          <Route path="/products/networking-poe" element={<Navigate to="/category/voip-phone-systems" replace />} />
          {/* Internal Link Map — Location & Availability Keyword Redirects */}
          <Route path="/contact/lahore" element={<Navigate to="/lahore" replace />} />
          <Route path="/contact/karachi" element={<Navigate to="/karachi" replace />} />
          <Route path="/contact/islamabad" element={<Navigate to="/islamabad" replace />} />
          <Route path="/support" element={<Navigate to="/contact" replace />} />
          <Route path="/av-integration-services-lahore" element={<Navigate to="/lahore" replace />} />
          {/* Internal Link Map — Value Proposition & SLA Keyword Redirects */}
          <Route path="/services/turnkey-installation" element={<Navigate to="/services/boardroom-integration" replace />} />
          <Route path="/request-quote" element={<Navigate to="/programs/quote" replace />} />
          <Route path="/about/guarantee" element={<Navigate to="/about" replace />} />
          <Route path="/services/on-site-standby-engineers" element={<Navigate to="/services/corporate-events" replace />} />
          <Route path="/services/annual-maintenance-contracts" element={<Navigate to="/services/boardroom-integration" replace />} />
          <Route path="/about/compliance" element={<Navigate to="/programs/government-education-pricing" replace />} />
          <Route path="/video-conference-in-pakistan" element={<KeywordLandingPage />} />

          {/* Fallback keyword landing page for unhandled top-level dynamic SEO slugs & 404 routes */}
          <Route path="/:keywordSlug" element={<KeywordLandingPage />} />
          <Route path="*" element={<KeywordLandingPage />} />

        </Routes>
      </React.Suspense>
      </main>
      <Footer />
      {showDeferredWidgets && (
        <React.Suspense fallback={null}>
          <AIAssist />
        </React.Suspense>
      )}
      {showCookieConsent && (
        <React.Suspense fallback={null}>
          <CookieConsent />
        </React.Suspense>
      )}
      <BackToTop />
      </div>
        </AuthProvider>
      </CartProvider>
    </SettingsProvider>
  );
}
