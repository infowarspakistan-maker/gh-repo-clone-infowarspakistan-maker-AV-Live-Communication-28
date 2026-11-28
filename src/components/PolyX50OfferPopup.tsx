/// <reference types="vite/client" />
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Truck, ShieldCheck, Check } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { buildFallbackProductFromGmcMeta } from '../lib/gmc-feed';

const POLY_X50_OFFER_WEBP = '/images/products/poly-studio-x50-tc8-offer.webp';
const DEAL_PRODUCT_SLUG = 'poly-studio-x50-tc8-special-offer-pakistan';
const SESSION_SEEN_KEY = 'avlive_poly_x50_tc8_399k_popup_seen_v1';

export function triggerPolyX50OfferPopup() {
  window.dispatchEvent(new CustomEvent('open-poly-x50-offer'));
}

export function PolyX50OfferPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [statusVisible, setStatusVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdminOrCheckout =
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/checkout') ||
    location.pathname.startsWith('/cart') ||
    location.pathname.startsWith('/setup-wizard');

  useEffect(() => {
    const handleOpenEvent = () => {
      setIsOpen(true);
    };
    window.addEventListener('open-poly-x50-offer', handleOpenEvent);
    return () => {
      window.removeEventListener('open-poly-x50-offer', handleOpenEvent);
    };
  }, []);

  // Auto-open once per browser session after initial LCP paint (on scroll/interaction or 6.5s idle)
  useEffect(() => {
    if (isAdminOrCheckout) return;
    try {
      const alreadySeen = sessionStorage.getItem(SESSION_SEEN_KEY);
      if (!alreadySeen) {
        let opened = false;
        const openOnce = () => {
          if (opened) return;
          opened = true;
          cleanup();
          setIsOpen(true);
          try {
            sessionStorage.setItem(SESSION_SEEN_KEY, 'true');
          } catch {
            // ignore storage quota errors
          }
        };
        const onInteract = () => {
          window.setTimeout(openOnce, 1200);
        };
        const cleanup = () => {
          window.clearTimeout(fallbackTimer);
          window.removeEventListener('scroll', onInteract);
          window.removeEventListener('pointerdown', onInteract);
        };
        window.addEventListener('scroll', onInteract, { once: true, passive: true });
        window.addEventListener('pointerdown', onInteract, { once: true, passive: true });
        const fallbackTimer = window.setTimeout(openOnce, 6500);
        return cleanup;
      }
    } catch {
      // ignore sessionStorage restrictions
    }
  }, [isAdminOrCheckout]);

  // Escape key closes modal
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  const getDealCartItem = () => {
    const prod = buildFallbackProductFromGmcMeta(DEAL_PRODUCT_SLUG);
    return {
      id: prod?.id || DEAL_PRODUCT_SLUG,
      productId: prod?.id || DEAL_PRODUCT_SLUG,
      slug: DEAL_PRODUCT_SLUG,
      name: 'Poly Studio X50 4K + TC8 Touch Controller Bundle (Special Offer — Free Delivery Pakistan)',
      price: 399000,
      regularPrice: 850000,
      image: 'https://firebasestorage.googleapis.com/v0/b/studio-5367437135-24ac6.firebasestorage.app/o/Products%2Fpoly-studio-x50-png-3cq9.webp?alt=media&token=bc3614ec-64f7-405b-95df-7a793acd7563',
      sku: '2215-86399-001',
      brand: 'HP Poly',
    };
  };

  const handleBuyNow = () => {
    addToCart(getDealCartItem(), 1);
    setIsOpen(false);
    navigate('/checkout');
  };

  const handleAddToCartOnly = () => {
    addToCart(getDealCartItem(), 1);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  };

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) return;

    setSubmitting(true);
    setStatusVisible(true);
    setEmail('');

    try {
      const [{ collection, addDoc, serverTimestamp }, { db }] = await Promise.all([
        import('firebase/firestore'),
        import('../lib/firebase/client'),
      ]);
      await addDoc(collection(db, 'inquiries'), {
        fullName: cleanEmail.split('@')[0].slice(0, 60) || 'Corporate Buyer',
        organization: cleanEmail.split('@')[1]?.slice(0, 80) || 'Enterprise Conference Room Deal',
        email: cleanEmail.slice(0, 120),
        phone: '+92-321-4256263',
        subject: 'Poly Studio X50 + TC8 Deal Claim (PKR 399,000 • Free Delivery)',
        message: `Special Offer Popup Claim: Poly Studio X50 4K + Poly TC8 Touch Controller Bundle (MPN: 2215-86399-001) at PKR 399,000 including Free Delivery within Pakistan. Work Email: ${cleanEmail}.`,
        status: 'new',
        createdAt: serverTimestamp(),
      });
    } catch {
      // Fail-open UI confirmation even if offline
    } finally {
      setSubmitting(false);
    }
  };

  if (isAdminOrCheckout) return null;

  return (
    <>
      {/* Floating Re-Open Deal Brochure Pill (Visible whenever popup is closed) */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Show Poly Studio X50 + TC8 Special Offer (PKR 399,000)"
          className={`fixed ${
            location.pathname.startsWith('/product/') ? 'bottom-[136px] lg:bottom-6' : 'bottom-[72px] lg:bottom-6'
          } left-3 lg:left-6 z-[85] inline-flex items-center gap-2 bg-[#c7f5c7] hover:bg-[#b3eeb3] text-[#141816] border-2 border-[#141816] px-3.5 py-2 rounded-xl font-black text-xs shadow-[0_10px_25px_rgba(0,0,0,0.35)] transition-transform hover:-translate-y-0.5 cursor-pointer`}
        >
          <span className="bg-[#141816] text-[#c7f5c7] px-2 py-0.5 rounded text-xs font-black uppercase tracking-wider">
            DEAL
          </span>
          <span className="truncate max-w-[195px] sm:max-w-none">
            Poly X50 + TC8 • PKR 399,000
          </span>
        </button>
      )}

      {/* Fullscreen Modal Overlay with Conference Room Backdrop */}
      {isOpen && (
        <div
          id="offerOverlay"
          className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
        >
          {/* Conference Room Environment Backdrop */}
          <div
            aria-hidden="true"
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-[#1a2230] bg-[url('/images/video-conference/boardroom-hero.webp')] bg-cover bg-center brightness-45 blur-[3px] scale-[1.03]"
          />
          <div
            aria-hidden="true"
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/50"
          />

          {/* Popup Card Wrapper (allows circular close button to overlap top-right) */}
          <div className="relative z-10 w-full max-w-[880px] my-auto">
            {/* Floating Circular Close Button (Matches Reference Top-Right) */}
            <button
              type="button"
              id="closePopup"
              onClick={() => setIsOpen(false)}
              aria-label="Close special offer"
              title="Close"
              className="absolute -top-3.5 -right-2 sm:-right-3.5 w-[40px] h-[40px] rounded-full bg-[#141816] hover:bg-[#2b332f] text-white border-2 border-white text-xl leading-none cursor-pointer z-30 flex items-center justify-center shadow-[0_6px_16px_rgba(0,0,0,0.35)] transition-transform hover:scale-108"
            >
              &times;
            </button>

            {/* Main Popup Box with Curved Mint-to-White Split */}
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="offerTitle"
              className="group relative grid grid-cols-1 md:grid-cols-[1.28fr_0.92fr] bg-white rounded-xl overflow-hidden shadow-[0_28px_65px_rgba(0,0,0,0.45)] min-h-[470px]"
            >
              {/* Left Pastel Mint Content Area with Curved Right Edge */}
              <div className="relative bg-[#c7f5c7] px-5 py-6 sm:px-9 sm:py-9 flex flex-col justify-center z-10">
                {/* Curved Divider bridging Mint Left & White Right on Desktop */}
                <div
                  aria-hidden="true"
                  className="hidden md:block absolute -top-[10%] -right-[68px] w-[136px] h-[120%] bg-[#c7f5c7] rounded-[0_100%_100%_0/0_50%_50%_0] -z-10 pointer-events-none"
                />

                {/* Eyebrow Badge */}
                <div className="inline-flex flex-wrap items-center gap-2 text-xs font-extrabold tracking-[1.1px] uppercase text-[#141816] mb-2.5">
                  <span>LIMITED CONFERENCE ROOM DEAL</span>
                  <span className="bg-[#141816] text-[#c7f5c7] px-2 py-0.5 rounded text-xs font-extrabold">
                    SAVE 53%
                  </span>
                  <span className="bg-emerald-800 text-white px-2 py-0.5 rounded text-xs font-extrabold inline-flex items-center gap-1">
                    <Truck size={12} /> FREE DELIVERY IN PAKISTAN
                  </span>
                </div>

                {/* Product Title */}
                <h2
                  id="offerTitle"
                  className="text-lg sm:text-xl font-extrabold tracking-[0.4px] uppercase text-[#141816] mb-3 leading-snug"
                >
                  POLY STUDIO X50 4K + TC8 CONTROLLER
                </h2>

                {/* Price Block (Matching Reference Bold Numeric Hierarchy — PKR 399,000) */}
                <div className="flex flex-wrap items-baseline gap-3 mb-3.5">
                  <div className="flex flex-col text-xs sm:text-[13px] font-extrabold leading-[1.15] uppercase text-[#141816]">
                    <span>SPECIAL</span>
                    <span>OFFER</span>
                  </div>
                  <div className="text-3xl sm:text-[44px] font-black leading-[0.95] tracking-[-1.5px] text-[#141816]">
                    <span className="text-base sm:text-[18px] font-extrabold tracking-normal mr-1">PKR</span>
                    399,000
                  </div>
                  <div className="text-base sm:text-[17px] font-bold text-[#d9383a] line-through decoration-2">
                    PKR 850,000
                  </div>
                </div>

                {/* Offer Description */}
                <p className="text-sm leading-relaxed text-[#2d3831] max-w-[440px] mb-3.5">
                  Upgrade your medium-to-large conference rooms with 4K UltraHD DirectorAI auto-framing video,
                  boardroom-filling stereo speakers, the Poly TC8 8&quot; touch controller, and seamless Zoom &amp; Teams integration —{' '}
                  <strong className="text-[#141816] font-extrabold">including free insured delivery anywhere in Pakistan.</strong>
                </p>

                {/* Primary E-Commerce Action Row: Buy Now + Add to Cart + View Product Brochure */}
                <div className="flex flex-wrap items-center gap-2.5 mb-4">
                  <button
                    type="button"
                    onClick={handleBuyNow}
                    className="bg-[#141816] hover:bg-[#28302c] text-white rounded-md px-5 py-3 text-xs font-extrabold tracking-[1.1px] uppercase cursor-pointer inline-flex items-center gap-2 shadow-md transition-all hover:-translate-y-0.5"
                  >
                    <ShoppingBag size={14} /> BUY NOW — PKR 399,000
                  </button>

                  <button
                    type="button"
                    onClick={handleAddToCartOnly}
                    className="bg-white/90 hover:bg-white text-[#141816] border border-[#141816]/30 rounded-md px-3.5 py-3 text-xs font-extrabold tracking-[0.8px] uppercase cursor-pointer inline-flex items-center gap-1.5 transition-all"
                  >
                    {addedToCart ? (
                      <>
                        <Check size={14} className="text-emerald-700" /> ADDED TO CART
                      </>
                    ) : (
                      'ADD TO CART'
                    )}
                  </button>

                  <Link
                    to={`/product/${DEAL_PRODUCT_SLUG}`}
                    onClick={() => setIsOpen(false)}
                    className="text-xs font-extrabold tracking-[0.6px] uppercase text-[#141816] underline hover:opacity-80 inline-flex items-center gap-1 py-1"
                  >
                    View Spec Brochure <ArrowRight size={13} />
                  </Link>
                </div>

                <p className="text-xs sm:text-[13px] font-bold text-[#141816] mb-3">
                  Or claim an official FBR GST corporate bundle quote right in your inbox:
                </p>

                {/* Inline Form (Matching Reference Underlined Input + Dark Pill Button) */}
                <form
                  id="offerForm"
                  onSubmit={handleClaimSubmit}
                  className="flex flex-col sm:flex-row sm:items-end gap-3.5 max-w-[430px] mb-3"
                >
                  <div className="flex-1">
                    <input
                      type="email"
                      id="emailInput"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="WORK EMAIL ADDRESS"
                      aria-label="Work email address for Poly Studio X50 + TC8 offer"
                      required
                      className="w-full bg-transparent border-0 border-b-[1.5px] border-[#141816]/35 focus:border-[#141816] py-2 px-0.5 text-[12px] font-bold tracking-[1px] text-[#141816] placeholder:text-[#141816]/65 placeholder:uppercase outline-none transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-[#141816] hover:bg-[#28302c] text-white border-0 rounded-md px-6 py-3 text-[11px] font-extrabold tracking-[1.3px] uppercase cursor-pointer whitespace-nowrap transition-all hover:-translate-y-0.5"
                  >
                    {submitting ? 'LOCKING...' : 'CLAIM OFFER'}
                  </button>
                </form>

                {/* Status Confirmation Pill */}
                {statusVisible && (
                  <div
                    id="statusMsg"
                    className="inline-flex items-center gap-1.5 text-[12px] font-bold text-white bg-[#141816]/85 px-3 py-1.5 rounded-full w-fit mb-2.5"
                  >
                    &#10003; Offer locked! Our AV specialist will email your PKR 399,000 quote shortly.
                  </div>
                )}

                <p className="text-[11px] font-medium text-[#2d3831] flex items-center gap-1.5">
                  <ShieldCheck size={13} className="shrink-0 text-[#141816]" />
                  <span>Official 1-Year HP Poly warranty, free delivery across Pakistan &amp; installation support.</span>
                </p>
              </div>

              {/* Right White Product Showcase Panel */}
              <div className="relative bg-white flex flex-col items-center justify-center px-6 py-7 md:pl-12 md:pr-7 md:py-9 z-0">
                <span className="mb-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-[10px] font-extrabold uppercase tracking-wider">
                  <ShieldCheck size={11} /> MPN: 2215-86399-001 • Genuine Kit
                </span>

                <Link
                  to={`/product/${DEAL_PRODUCT_SLUG}`}
                  onClick={() => setIsOpen(false)}
                  className="block w-full max-w-[330px]"
                  title="Poly Studio X50 4K + TC8 Touch Controller Bundle — PKR 399,000"
                >
                  <img
                    src={POLY_X50_OFFER_WEBP}
                    alt="Poly Studio X50 4K Video Bar and Poly TC8 Touch Controller Special Offer Pakistan"
                    title="Poly Studio X50 4K Video Bar + Poly TC8 Touch Controller Bundle — PKR 399,000"
                    width={720}
                    height={576}
                    loading="lazy"
                    decoding="async"
                    id="product-img"
                    className="w-full h-auto object-contain -rotate-3 group-hover:-rotate-1 group-hover:scale-103 drop-shadow-[0_18px_24px_rgba(0,0,0,0.16)] transition-transform duration-350"
                  />
                </Link>

                <div className="mt-3 text-center text-[11px] font-bold tracking-[0.8px] uppercase text-[#5b6660]">
                  All-in-One 4K Video Bar + TC8 Touch Panel &bull; Dual 4K Display Support
                </div>

                <div className="mt-3 w-full max-w-[290px] bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-[11px] text-[#141816] space-y-1">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-gray-500">Bundle Price:</span>
                    <span className="font-black text-emerald-700">PKR 399,000 (Inc. Delivery)</span>
                  </div>
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-gray-500">Included Hardware:</span>
                    <span className="font-bold">Studio X50 Bar + TC8 Panel</span>
                  </div>
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-gray-500">Nationwide Shipping:</span>
                    <span className="font-bold text-emerald-700">FREE (Lahore, KHI, ISB)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
