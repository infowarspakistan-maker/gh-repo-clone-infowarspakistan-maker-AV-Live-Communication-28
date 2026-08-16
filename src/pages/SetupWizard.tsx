import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Video, 
  Phone, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  RotateCcw, 
  ShoppingCart, 
  Calendar, 
  ShieldCheck, 
  Hammer, 
  Plus, 
  FileText,
  Building,
  Monitor,
  Cpu,
  Tv,
  CheckCircle2,
  X,
  ArrowRight,
  Package,
  Wrench
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { addToCart } from '../lib/cart';
import { SEO } from '../components/SEO';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { db } from '../lib/firebase/client';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface Option {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
}

interface Question {
  id: string;
  title: string;
  subtitle: string;
  options: Option[];
}

interface BundleItem {
  id: string;
  name: string;
  model: string;
  brand: string;
  description: string;
  quantity: number;
  price: number;
  image: string;
}

interface Bundle {
  id: string;
  name: string;
  slogan: string;
  tagline: string;
  basePrice: number;
  retailPrice: number;
  badge: string;
  image: string;
  description: string;
  keyFeatures: string[];
  items: BundleItem[];
}

export function SetupWizard() {
  const [step, setStep] = useState<number>(0); // 0 = Intro, 1 = Q1, 2 = Q2, 3 = Q3, 4 = Recommendation
  const [answers, setAnswers] = useState<Record<string, string>>({
    roomSize: '',
    equipmentFocus: '',
    layoutStyle: ''
  });

  // Interactive Add-ons state
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [showConsultModal, setShowConsultModal] = useState(false);
  const [consultForm, setConsultForm] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 3 Simple Wizard Questions
  const questions: Question[] = [
    {
      id: 'roomSize',
      title: 'What is your typical room scale & capacity?',
      subtitle: 'Identify the spatial constraints and maximum occupancy of your deployment area.',
      options: [
        {
          id: 'small',
          label: 'Huddle & Small Spaces',
          description: 'Designed for 1 to 4 participants. Up to 150 sq ft environments.',
          icon: Users
        },
        {
          id: 'medium',
          label: 'Conference Room',
          description: 'Optimized for 5 to 10 participants. Up to 350 sq ft boardrooms.',
          icon: Building
        },
        {
          id: 'large',
          label: 'Boardroom & Event Halls',
          description: 'Engineered for 11+ participants. Large executive spaces & auditioriums.',
          icon: Monitor
        }
      ]
    },
    {
      id: 'equipmentFocus',
      title: 'What hardware technology is your top priority?',
      subtitle: 'Choose the core communication modality your workflow relies upon.',
      options: [
        {
          id: 'video',
          label: 'High-Definition Video Conferencing',
          description: 'Smart camera bars, screen displays, and active speaker-tracking audio.',
          icon: Video
        },
        {
          id: 'telephony',
          label: 'Professional IP Telephony',
          description: 'Enterprise desk phones, reception hubs, and wireless roaming DECT systems.',
          icon: Phone
        },
        {
          id: 'hybrid',
          label: 'Complete Integrated Collaboration',
          description: 'Full suite combining digital video bars with multi-line IP desk phones.',
          icon: Cpu
        }
      ]
    },
    {
      id: 'layoutStyle',
      title: 'What is your preferred deployment layout style?',
      subtitle: 'Select how the main hardware units should be positioned and integrated.',
      options: [
        {
          id: 'wall',
          label: 'Sleek Wall-Mount / Under-Display Bar',
          description: 'Neat horizontal bars hung on walls, minimizing cable paths and desk clutter.',
          icon: Tv
        },
        {
          id: 'tabletop',
          label: 'Tabletop-Centric Touch Control',
          description: 'Interactive console at the center of the desk with modular periphery lines.',
          icon: ShieldCheck
        },
        {
          id: 'wireless',
          label: 'Wireless Roaming & Hot-Swappable',
          description: 'DECT-powered handsets and portable high-fidelity speakerphones.',
          icon: Sparkles
        }
      ]
    }
  ];

  // Pre-configured starter bundles based on enterprise hardware (Poly, Yealink, Logitech)
  const bundles: Record<string, Bundle> = {
    'huddle-video': {
      id: 'huddle-video',
      name: 'Huddle Pro Video Starter Bundle',
      slogan: 'Plug-and-Play Ultra-HD Video Solution for Huddle Rooms',
      tagline: 'Best for Small Office, Tele-workspaces & Agile Zoom/Teams Booths',
      basePrice: 175000,
      retailPrice: 198000,
      badge: 'Bestseller • Small Spaces',
      image: 'https://images.unsplash.com/photo-1517502884422-41eaaced0168?q=80&w=800&auto=format&fit=crop',
      description: 'An elite, small-footprint video conferencing system featuring true 4K resolution, auto-framing intelligence, and stereo audio. Ideal for high-impact communication with zero setup hassle.',
      keyFeatures: [
        'Plug & Play USB connectivity to any laptop/PC',
        'AI Auto-Framing and speaker tracking',
        'NoiseBlockAI filters out background echoes and keystrokes',
        'Integrated premium beamforming microphone array'
      ],
      items: [
        {
          id: 'poly-p15',
          name: 'Poly Studio P15 Personal Video Bar',
          model: 'STUDIO-P15',
          brand: 'Poly',
          description: 'High-performance 4K camera bar with auto-tracking, integrated stereo speakers, and smart microphones.',
          quantity: 1,
          price: 135000,
          image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=400&auto=format&fit=crop'
        },
        {
          id: 'poly-sync20',
          name: 'Poly Sync 20+ Wireless Smart Speakerphone',
          model: 'SYNC20-M',
          brand: 'Poly',
          description: 'USB/Bluetooth speakerphone with triple-microphone array and bass reflex audio, serving as desk audio expansion.',
          quantity: 1,
          price: 40000,
          image: 'https://images.unsplash.com/photo-1589003077984-894e133dabab?q=80&w=400&auto=format&fit=crop'
        }
      ]
    },
    'executive-voice': {
      id: 'executive-voice',
      name: 'Executive IP Voice Starter Bundle',
      slogan: 'Elite Telephony & Wireless Freedom for Professional Workstations',
      tagline: 'Perfect for High-Volume Client Communications & Administrative Desks',
      basePrice: 105000,
      retailPrice: 122000,
      badge: 'Audio Leader • High Productivity',
      image: 'https://images.unsplash.com/photo-1557425955-df376b5903c8?q=80&w=800&auto=format&fit=crop',
      description: 'Equip your desk with standard-setting IP Telephony. Pairs Yealink’s flagship prime business color-display phone with premium noise-cancelling active wireless headset.',
      keyFeatures: [
        '16 SIP accounts with high-res adjustable color LCD screen',
        'DECT wireless phone with multi-cell range up to 50m indoors',
        'Acoustic Shield technology for distraction-free calls',
        'Acoustic noise cancellation on premium wireless headset'
      ],
      items: [
        {
          id: 'yealink-t54w',
          name: 'Yealink SIP-T54W Prime Business IP Phone',
          model: 'SIP-T54W',
          brand: 'Yealink',
          description: 'Adjustable 4.3" pixel color screen, built-in Bluetooth and dual-band Wi-Fi, supporting 16 SIP accounts.',
          quantity: 1,
          price: 45000,
          image: 'https://images.unsplash.com/photo-1520607162513-87226c69f244?q=80&w=400&auto=format&fit=crop'
        },
        {
          id: 'poly-voyager-focus',
          name: 'Poly Voyager Focus 2 UC Wireless Headset',
          model: 'VFY-FOCUS2',
          brand: 'Poly',
          description: 'Stereo Bluetooth headset with Hybrid ANC, smart sensor answer, and premium comfort ear cups.',
          quantity: 1,
          price: 42000,
          image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=400&auto=format&fit=crop'
        },
        {
          id: 'yealink-w73h',
          name: 'Yealink W73H DECT Cordless Handset',
          model: 'W73H',
          brand: 'Yealink',
          description: 'High-definition voice roaming handset, pairing with standard business DECT bases.',
          quantity: 1,
          price: 18000,
          image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=400&auto=format&fit=crop'
        }
      ]
    },
    'conference-core': {
      id: 'conference-core',
      name: 'Conference Core Intelligent Video Bundle',
      slogan: 'All-in-One Android Video Bar with Tabletop Touch Controller',
      tagline: 'Ideal for Mid-Sized Collaboration Rooms, Teams, Zoom & Meet',
      basePrice: 365000,
      retailPrice: 415000,
      badge: 'Most Popular • Conference Rooms',
      image: 'https://images.unsplash.com/photo-1542744094-3a31f103e35f?q=80&w=800&auto=format&fit=crop',
      description: 'A complete standalone Android room solution. Eliminates the need for a dedicated room PC by running Microsoft Teams or Zoom Rooms natively right on the smart bar hardware.',
      keyFeatures: [
        'Powerful Android OS built-in, runs native UC applications',
        '20 Megapixel wide-angle camera with auto-tracking',
        'Dedicated 8-inch high-res interactive tabletop touch console',
        'Dual screen output support for rich content sharing'
      ],
      items: [
        {
          id: 'yealink-a20',
          name: 'Yealink MeetingBar A20 All-in-One Collaboration Bar',
          model: 'MEETINGBAR-A20',
          brand: 'Yealink',
          description: '20MP camera with 133° field-of-view, 8 MEMS microphone array, and premium speaker. Android powered.',
          quantity: 1,
          price: 265000,
          image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=400&auto=format&fit=crop'
        },
        {
          id: 'yealink-ctp18',
          name: 'Yealink CTP18 Collaboration Touch Panel',
          model: 'CTP18',
          brand: 'Yealink',
          description: '8" touch screen controller, lets users join, control cameras, and adjust layouts directly from the conference table.',
          quantity: 1,
          price: 100000,
          image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=400&auto=format&fit=crop'
        }
      ]
    },
    'boardroom-elite': {
      id: 'boardroom-elite',
      name: 'Boardroom Elite Enterprise Collaboration Bundle',
      slogan: 'Premium Dual-Camera Zoom System with Active Spatial Audio',
      tagline: 'Specially Engineered for Large Boardrooms & High-Profile Executive Spaces',
      basePrice: 745000,
      retailPrice: 835000,
      badge: 'Enterprise Flagship • Large Rooms',
      image: 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?q=80&w=800&auto=format&fit=crop',
      description: 'Our ultimate boardroom deployment. Uses intelligent dual-cameras to dynamically pan, scan, and switch views between speaker close-ups and full room overviews, paired with tabletop central smart dialer.',
      keyFeatures: [
        'Dual 4K ultra-wide and telephoto lenses with seamless camera transition',
        'Poly DirectorAI high-performance framing algorithms',
        'Flagship Yealink tabletop phone acting as intelligent mic array & system hub',
        'Supports triple daisy-chained expansion microphones for 30+ participants'
      ],
      items: [
        {
          id: 'poly-x70',
          name: 'Poly Studio X70 Dual-Lens Video Bar',
          model: 'STUDIO-X70',
          brand: 'Poly',
          description: 'State-of-the-art dual 20MP camera bar with stereo speakers and specialized noise-reduction algorithm.',
          quantity: 1,
          price: 545000,
          image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=400&auto=format&fit=crop'
        },
        {
          id: 'yealink-cp965',
          name: 'Yealink CP965 Touchscreen Android Conference Phone',
          model: 'CP965-SIP',
          brand: 'Yealink',
          description: 'Flagship conference phone with 5-inch touch screen, built-in 13-microphone array, and black acoustic fabric design.',
          quantity: 1,
          price: 200000,
          image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=400&auto=format&fit=crop'
        }
      ]
    },
    'flexi-wireless': {
      id: 'flexi-wireless',
      name: 'Flexi-Workspace Wireless Active Bundle',
      slogan: 'Highly Versatile Mobile Collaboration Setup with Roaming Hardware',
      tagline: 'Optimized for Multi-Purpose Rooms, Flexible Offices & Rapid Deployments',
      basePrice: 135000,
      retailPrice: 155000,
      badge: 'Agile • 100% Wireless Audio',
      image: 'https://images.unsplash.com/photo-1531538606174-0f90ff5dce83?q=80&w=800&auto=format&fit=crop',
      description: 'Unbind your meeting space from legacy floor wires. Uses high-performance DECT cordless base stations and daisy-chainable smart Bluetooth speakerphones to establish clear voice links anywhere instantly.',
      keyFeatures: [
        'Smart conference speakerphone with automated daisy-chain capability',
        'DECT base station supporting up to 10 cordless handsets',
        'Portable high-definition webcam with auto-light correction',
        'Perfect for dynamic setups, hot-desks, and shared rooms'
      ],
      items: [
        {
          id: 'poly-sync60',
          name: 'Poly Sync 60 Smart Tabletop Speakerphone',
          model: 'SYNC60-USB',
          brand: 'Poly',
          description: 'Large room Bluetooth speakerphone with dual-passive radiators, status bars, and smartphone charge port.',
          quantity: 1,
          price: 85000,
          image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=400&auto=format&fit=crop'
        },
        {
          id: 'yealink-w73p',
          name: 'Yealink W73P Cordless DECT Phone System',
          model: 'W73P-SYSTEM',
          brand: 'Yealink',
          description: 'Includes W70B DECT base station and one W73H cordless handset with high HD voice quality.',
          quantity: 1,
          price: 32000,
          image: 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?q=80&w=400&auto=format&fit=crop'
        },
        {
          id: 'logi-brio500',
          name: 'Logitech Brio 500 Auto-Framing Webcam',
          model: 'BRIO-500',
          brand: 'Logitech',
          description: '1080p full-HD webcam with auto-framing, dual noise-reducing mics, and dynamic exposure adjustment.',
          quantity: 1,
          price: 18000,
          image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=400&auto=format&fit=crop'
        }
      ]
    }
  };

  // Logic to determine best bundle recommendation
  const getRecommendedBundle = (): Bundle => {
    const { roomSize, equipmentFocus, layoutStyle } = answers;

    // 1. Large rooms always require Boardroom Elite for professional coverage
    if (roomSize === 'large') {
      return bundles['boardroom-elite'];
    }

    // 2. Wireless layout style matches the Flexi Wireless bundle
    if (layoutStyle === 'wireless') {
      return bundles['flexi-wireless'];
    }

    // 3. Medium Rooms
    if (roomSize === 'medium') {
      if (equipmentFocus === 'telephony') {
        return bundles['executive-voice'];
      }
      return bundles['conference-core'];
    }

    // 4. Small Rooms
    if (roomSize === 'small') {
      if (equipmentFocus === 'telephony') {
        return bundles['executive-voice'];
      }
      return bundles['huddle-video'];
    }

    // Default Fallback
    return bundles['conference-core'];
  };

  const currentRecommended = getRecommendedBundle();

  const handleOptionSelect = (questionId: string, optionValue: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionValue
    }));
    
    // Automatically transition to the next step
    setTimeout(() => {
      setStep(prev => prev + 1);
    }, 350);
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(prev => prev - 1);
    }
  };

  const handleReset = () => {
    setAnswers({
      roomSize: '',
      equipmentFocus: '',
      layoutStyle: ''
    });
    setSelectedAddons([]);
    setStep(1);
    setIsSubmitted(false);
  };

  // Toggle custom professional add-ons
  const toggleAddon = (addonId: string) => {
    setSelectedAddons(prev => 
      prev.includes(addonId) ? prev.filter(id => id !== addonId) : [...prev, addonId]
    );
  };

  // Interactive Professional Services Pricing
  const addonPricing: Record<string, { name: string; price: number; icon: React.ElementType; desc: string }> = {
    'cabling': {
      name: 'Structured Cat6 Ethernet Cabling Kit',
      price: 4500,
      icon: Plus,
      desc: 'Shielded professional ethernet runs with solid connectors and color-coded tags.'
    },
    'mounting': {
      name: 'On-Site Professional Mounting & Integration',
      price: 15000,
      icon: Hammer,
      desc: 'Full mechanical drilling, laser leveling, clean cable concealment, and alignment check.'
    },
    'warranty': {
      name: '1-Year Priority Hardware SLA & Express Swap',
      price: 12000,
      icon: ShieldCheck,
      desc: 'Four-hour remote diagnostics response and immediate replacement delivery.'
    }
  };

  const totalBundlePrice = currentRecommended.basePrice + selectedAddons.reduce((acc, addonId) => acc + (addonPricing[addonId]?.price || 0), 0);

  // Cart integration
  const handleAddBundleToCart = () => {
    // 1. Add core bundle
    addToCart({
      id: `bundle-${currentRecommended.id}`,
      name: currentRecommended.name,
      price: currentRecommended.basePrice,
      image: currentRecommended.image,
      brand: 'AV Live Pre-configured'
    }, 1);

    // 2. Add selected add-ons as individual line items
    selectedAddons.forEach(addonId => {
      const addon = addonPricing[addonId];
      if (addon) {
        addToCart({
          id: `addon-${addonId}-${currentRecommended.id}`,
          name: `${addon.name} (${currentRecommended.name})`,
          price: addon.price,
          image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=200&auto=format&fit=crop',
          brand: 'Professional Services'
        }, 1);
      }
    });

    setToastMessage(`Successfully added "${currentRecommended.name}" and ${selectedAddons.length} services to your cart!`);
    setTimeout(() => {
      setToastMessage(null);
    }, 5000);
  };

  // Submit dynamic Quote / Lead to Firestore
  const handleConsultSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consultForm.email || !consultForm.name) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'wizard_leads'), {
        customerName: consultForm.name,
        email: consultForm.email,
        company: consultForm.company,
        phone: consultForm.phone,
        notes: consultForm.notes,
        answers: {
          roomSize: questions[0].options.find(o => o.id === answers.roomSize)?.label || answers.roomSize,
          equipmentFocus: questions[1].options.find(o => o.id === answers.equipmentFocus)?.label || answers.equipmentFocus,
          layoutStyle: questions[2].options.find(o => o.id === answers.layoutStyle)?.label || answers.layoutStyle,
        },
        recommendedBundle: currentRecommended.name,
        selectedAddons: selectedAddons.map(id => addonPricing[id]?.name || id),
        totalProjectEstimate: totalBundlePrice,
        createdAt: serverTimestamp(),
        status: 'new'
      });
      setIsSubmitted(true);
      setConsultForm({ name: '', email: '', company: '', phone: '', notes: '' });
    } catch (error) {
      console.error('Failed to submit consultation lead:', error);
      alert('An error occurred. Please try again or call our support team.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#F8F9FA] min-h-screen py-12 text-[#1A2B4C] relative overflow-hidden">
      <SEO 
        title="Quick Setup Wizard | Pre-Configured AV & Voice Bundles"
        description="Take our 60-second hardware wizard to identify the optimal enterprise IP phones, conference cameras, and collaboration bundles for your business room scale."
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <Breadcrumbs items={[{ label: 'Setup Wizard' }]} />

        {/* Floating Success Toast Notification */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-[#1A2B4C] text-white px-8 py-4 rounded-[1.5rem] shadow-2xl flex items-center gap-4 z-50 border border-[#00B4D8]/30 max-w-lg w-full"
            >
              <div className="bg-[#00B4D8] text-white p-2.5 rounded-xl">
                <CheckCircle2 size={20} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-black uppercase tracking-wider text-[#00B4D8]">Cart Synchronized</p>
                <p className="text-xs font-semibold text-gray-200 mt-0.5">{toastMessage}</p>
              </div>
              <Link to="/cart" className="bg-[#00B4D8] hover:bg-white hover:text-[#1A2B4C] text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors">
                View Cart
              </Link>
              <button onClick={() => setToastMessage(null)} className="text-gray-400 hover:text-white transition-colors pl-2">
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Intro Step */}
        {step === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[3rem] shadow-xl border border-gray-100 p-8 sm:p-16 text-center relative overflow-hidden mt-6"
            id="wizard-intro-card"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#00B4D8]/10 to-transparent rounded-full translate-x-20 -translate-y-20"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-gray-50 to-transparent rounded-full -translate-x-32 translate-y-32"></div>

            <div className="relative z-10 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-[#00B4D8]/10 text-[#00B4D8] px-4 py-2 rounded-full mb-6">
                <Sparkles size={14} className="animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest">Smart Hardware Configurator</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl font-black text-[#1A2B4C] tracking-tight leading-tight mb-6">
                Discover Your Perfect Meeting Space Setup in 60 Seconds
              </h1>
              
              <p className="text-gray-500 font-medium text-sm sm:text-base leading-relaxed mb-10">
                Answer three simple questions about your room scale and communication requirements. Our expert-system will instantly tailor a high-efficiency hardware bundle backed by Poly, Yealink, and Logitech.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left mb-12">
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <div className="bg-[#1A2B4C] text-white w-8 h-8 rounded-full flex items-center justify-center font-black text-xs mb-4">1</div>
                  <h3 className="font-bold text-xs uppercase tracking-wider mb-2 text-[#1A2B4C]">Define Room Scale</h3>
                  <p className="text-gray-400 text-[11px] font-medium">Select your spatial bounds and occupancy limits.</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <div className="bg-[#1A2B4C] text-white w-8 h-8 rounded-full flex items-center justify-center font-black text-xs mb-4">2</div>
                  <h3 className="font-bold text-xs uppercase tracking-wider mb-2 text-[#1A2B4C]">Choose Core Need</h3>
                  <p className="text-gray-400 text-[11px] font-medium">Focus on high-definition video, voice, or hybrid.</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <div className="bg-[#1A2B4C] text-white w-8 h-8 rounded-full flex items-center justify-center font-black text-xs mb-4">3</div>
                  <h3 className="font-bold text-xs uppercase tracking-wider mb-2 text-[#1A2B4C]">Verify Mounting</h3>
                  <p className="text-gray-400 text-[11px] font-medium">Specify wall-mount, tabletop, or cordless setups.</p>
                </div>
              </div>

              <button
                onClick={() => setStep(1)}
                className="bg-[#1A2B4C] hover:bg-[#00B4D8] text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg active:scale-98 inline-flex items-center gap-3 group"
              >
                Launch Setup Configurator
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Question Steps */}
        {step >= 1 && step <= 3 && (
          <div className="mt-6">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Configurator Progress</span>
                <span className="text-xs font-black text-[#00B4D8] uppercase tracking-wider">Question {step} of 3</span>
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                <motion.div 
                  className="bg-[#00B4D8] h-full"
                  initial={{ width: `${((step - 1) / 3) * 100}%` }}
                  animate={{ width: `${(step / 3) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="bg-white rounded-[3rem] shadow-xl border border-gray-100 p-8 sm:p-12"
              >
                <div className="mb-8">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#00B4D8] bg-[#00B4D8]/10 px-3.5 py-1.5 rounded-full mb-4 inline-block">
                    Step {step}: {questions[step - 1].id === 'roomSize' ? 'Spatial Capacity' : questions[step - 1].id === 'equipmentFocus' ? 'Technology Goal' : 'Hardware Placement'}
                  </span>
                  <h2 className="text-3xl font-black text-[#1A2B4C] tracking-tight mt-1">
                    {questions[step - 1].title}
                  </h2>
                  <p className="text-gray-400 font-medium text-sm mt-2">
                    {questions[step - 1].subtitle}
                  </p>
                </div>

                {/* Grid of Options */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                  {questions[step - 1].options.map((option) => {
                    const IconComponent = option.icon;
                    const isSelected = answers[questions[step - 1].id] === option.id;

                    return (
                      <button
                        key={option.id}
                        onClick={() => handleOptionSelect(questions[step - 1].id, option.id)}
                        className={`text-left p-6 rounded-[2rem] border-2 transition-all h-full flex flex-col group ${
                          isSelected 
                            ? 'bg-[#1A2B4C] border-[#1A2B4C] text-white shadow-lg scale-[1.02]' 
                            : 'bg-white border-gray-100 hover:border-[#00B4D8] hover:shadow-xl text-[#1A2B4C]'
                        }`}
                      >
                        <div className={`p-4 rounded-2xl w-14 h-14 flex items-center justify-center mb-6 transition-colors ${
                          isSelected 
                            ? 'bg-[#00B4D8] text-white' 
                            : 'bg-gray-50 text-[#00B4D8] group-hover:bg-[#00B4D8]/15'
                        }`}>
                          <IconComponent size={24} />
                        </div>

                        <h3 className="font-black text-sm uppercase tracking-wide leading-tight mb-2">
                          {option.label}
                        </h3>
                        
                        <p className={`text-[11px] font-medium leading-relaxed mt-1 ${
                          isSelected ? 'text-gray-300' : 'text-gray-400'
                        }`}>
                          {option.description}
                        </p>

                        <div className="mt-auto pt-6 flex items-center gap-1.5 font-black text-[10px] uppercase tracking-widest">
                          <span className={isSelected ? 'text-[#00B4D8]' : 'text-gray-400 group-hover:text-[#00B4D8] transition-colors'}>
                            {isSelected ? 'Selected option' : 'Choose option'}
                          </span>
                          <ChevronRight size={12} className={isSelected ? 'text-[#00B4D8]' : 'text-gray-400 group-hover:translate-x-0.5 transition-all'} />
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Footer buttons */}
                <div className="flex justify-between items-center border-t border-gray-100 pt-8 mt-4">
                  <button
                    onClick={handleBack}
                    className="text-gray-400 hover:text-[#1A2B4C] font-black text-[10px] uppercase tracking-widest flex items-center gap-2 px-5 py-3 border border-gray-200 rounded-xl transition-all"
                  >
                    <ChevronLeft size={14} /> Back
                  </button>
                  
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-300">
                    AV Live Communications Configurator System v1.2
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {/* Recommendation Step */}
        {step === 4 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-10 mt-6"
          >
            {/* Recommendation Title */}
            <div className="bg-[#1A2B4C] rounded-[2.5rem] p-8 sm:p-12 text-white relative overflow-hidden shadow-xl border border-gray-800">
              <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#00B4D8]/10 to-transparent rounded-full translate-x-32 -translate-y-32"></div>
              
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 bg-[#00B4D8] text-white px-4 py-1.5 rounded-full mb-6">
                  <Sparkles size={12} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Optimal Match Identified</span>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                      {currentRecommended.name}
                    </h1>
                    <p className="text-gray-300 font-semibold text-xs sm:text-sm mt-2 max-w-2xl">
                      {currentRecommended.slogan}
                    </p>
                  </div>
                  <div className="bg-white/5 border border-white/10 px-6 py-4 rounded-2xl backdrop-blur-sm">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">Estimated Value Price</span>
                    <span className="text-2xl sm:text-3xl font-black text-[#00B4D8]">Rs. {currentRecommended.basePrice.toLocaleString()}</span>
                    <span className="text-xs text-gray-400 font-bold line-through block mt-0.5">Rs. {currentRecommended.retailPrice.toLocaleString()}</span>
                  </div>
                </div>

                <div className="border-t border-white/5 mt-8 pt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div>
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Selected Capacity</span>
                    <span className="font-bold text-xs uppercase tracking-wider block text-white mt-1.5">
                      {questions[0].options.find(o => o.id === answers.roomSize)?.label || 'Small Huddle'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Technology Goal</span>
                    <span className="font-bold text-xs uppercase tracking-wider block text-white mt-1.5">
                      {questions[1].options.find(o => o.id === answers.equipmentFocus)?.label || 'Video Focus'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Form Placement</span>
                    <span className="font-bold text-xs uppercase tracking-wider block text-white mt-1.5">
                      {questions[2].options.find(o => o.id === answers.layoutStyle)?.label || 'Wall Mounted'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Split layout: Bundle Details vs Pricing/CTA */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left 2 Columns: Items & Why It Fits */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* Bundle Overview Card */}
                <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm space-y-6">
                  <div>
                    <h3 className="font-black uppercase tracking-[0.2em] text-[10px] text-gray-400 mb-2">Why It Fits Your Space</h3>
                    <p className="text-sm font-medium leading-relaxed text-gray-500">
                      Based on your room capacity (up to {answers.roomSize === 'large' ? '15+ people' : answers.roomSize === 'medium' ? '10 people' : '4 people'}), need for {answers.equipmentFocus === 'video' ? 'premium video resolution' : 'structured IP phone channels'}, and preference for {answers.layoutStyle === 'wireless' ? 'wireless freedom' : 'clean table layout'}, we recommended this pre-configured hardware. It reduces spatial echoes, automates meeting entries, and fits securely under standard commercial display systems.
                    </p>
                  </div>

                  <div className="border-t border-gray-100 pt-6">
                    <h4 className="font-black uppercase tracking-[0.2em] text-[10px] text-gray-400 mb-4">Key Systems Integrated</h4>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {currentRecommended.keyFeatures.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs font-semibold text-[#1A2B4C]">
                          <div className="bg-[#00B4D8]/10 text-[#00B4D8] p-1 rounded-md shrink-0 mt-0.5">
                            <Check size={10} strokeWidth={3} />
                          </div>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Individual Bundle Components */}
                <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
                  <h3 className="font-black uppercase tracking-[0.2em] text-[10px] text-gray-400 mb-6">Included Equipment List ({currentRecommended.items.length} Modules)</h3>
                  
                  <div className="divide-y divide-gray-100">
                    {currentRecommended.items.map((item) => (
                      <div key={item.id} className="py-6 first:pt-0 last:pb-0 flex flex-col sm:flex-row gap-6">
                        <div className="w-full sm:w-28 h-28 rounded-2xl bg-gray-50 overflow-hidden shrink-0 border border-gray-100">
                          <img loading="lazy" src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-grow min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[9px] font-black uppercase tracking-wider text-[#00B4D8]">{item.brand}</span>
                            <span className="text-gray-300 text-[10px]">•</span>
                            <span className="text-gray-400 text-[9px] uppercase tracking-wider">{item.model}</span>
                          </div>
                          <h4 className="font-black text-base text-[#1A2B4C] leading-tight mb-2">{item.name}</h4>
                          <p className="text-xs text-gray-400 font-medium leading-relaxed mb-3">{item.description}</p>
                          <div className="flex items-center gap-4">
                            <span className="bg-gray-50 border border-gray-200 text-gray-500 font-black text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-md">
                              Qty: {item.quantity}
                            </span>
                            <span className="text-xs font-bold text-[#1A2B4C]">
                              Rs. {item.price.toLocaleString()} each
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Custom Services Addons & Checkout CTA */}
              <div className="space-y-8">
                
                {/* Professional Integration Services Widget */}
                <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <Wrench size={16} className="text-[#00B4D8]" />
                    <h3 className="font-black uppercase tracking-[0.15em] text-[10px] text-gray-400">Professional Add-ons</h3>
                  </div>
                  <p className="text-[11px] font-medium text-gray-400 mb-6 leading-relaxed">Customize your setup with deployment support directly from AV Live certified network engineers.</p>

                  <div className="space-y-4">
                    {Object.entries(addonPricing).map(([id, addon]) => {
                      const isChecked = selectedAddons.includes(id);
                      const IconComponent = addon.icon;

                      return (
                        <button
                          key={id}
                          onClick={() => toggleAddon(id)}
                          className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-start gap-3.5 group relative ${
                            isChecked 
                              ? 'bg-[#00B4D8]/5 border-[#00B4D8] text-[#1A2B4C]' 
                              : 'bg-white border-gray-100 hover:border-gray-200 text-gray-600'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded border mt-0.5 shrink-0 flex items-center justify-center transition-all ${
                            isChecked ? 'bg-[#00B4D8] border-[#00B4D8] text-white' : 'border-gray-300 bg-white group-hover:border-[#00B4D8]'
                          }`}>
                            {isChecked && <Check size={10} strokeWidth={3} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-black text-[11px] uppercase tracking-wider mb-1 text-[#1A2B4C]">{addon.name}</h4>
                            <p className="text-[10px] text-gray-400 leading-relaxed font-medium mb-1.5">{addon.desc}</p>
                            <span className="text-xs font-black text-[#00B4D8]">
                              + Rs. {addon.price.toLocaleString()}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Value Estimator Card */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                  <h3 className="font-black uppercase tracking-[0.2em] text-[10px] text-gray-400 mb-1">Project Estimate Breakout</h3>
                  
                  <div className="space-y-3.5">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-gray-400">Core Hardware Bundle</span>
                      <span className="text-[#1A2B4C]">Rs. {currentRecommended.basePrice.toLocaleString()}</span>
                    </div>

                    {selectedAddons.map(id => {
                      const addon = addonPricing[id];
                      return (
                        <div key={id} className="flex justify-between items-center text-xs font-semibold">
                          <span className="text-gray-400 truncate max-w-[180px]">{addon.name}</span>
                          <span className="text-[#1A2B4C] shrink-0">+ Rs. {addon.price.toLocaleString()}</span>
                        </div>
                      );
                    })}

                    <div className="border-t border-gray-100 pt-4 flex justify-between items-baseline">
                      <span className="text-xs font-black uppercase tracking-wider text-[#1A2B4C]">Total Estimate</span>
                      <span className="text-2xl font-black text-[#1A2B4C]">Rs. {totalBundlePrice.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <button
                      onClick={handleAddBundleToCart}
                      className="w-full bg-[#1A2B4C] hover:bg-[#00B4D8] text-white px-6 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all shadow-md active:scale-98 flex items-center justify-center gap-2"
                    >
                      <ShoppingCart size={14} /> Add Bundle To Cart
                    </button>

                    <button
                      onClick={() => setShowConsultModal(true)}
                      className="w-full bg-white hover:bg-gray-50 border border-gray-200 text-[#1A2B4C] px-6 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2"
                    >
                      <Calendar size={14} /> Schedule Engineering Review
                    </button>

                    <button
                      onClick={handleReset}
                      className="w-full text-gray-400 hover:text-[#1A2B4C] font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-1.5 py-2 transition-colors"
                    >
                      <RotateCcw size={12} /> Retake Setup Wizard
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        )}

        {/* Modal for Consultation Submission */}
        <AnimatePresence>
          {showConsultModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
              <motion.div 
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                className="bg-white rounded-[2.5rem] p-8 sm:p-10 max-w-xl w-full shadow-2xl relative border border-gray-100"
              >
                <button 
                  onClick={() => {
                    setShowConsultModal(false);
                    setIsSubmitted(false);
                  }} 
                  className="absolute top-6 right-6 text-gray-400 hover:text-[#1A2B4C] transition-colors p-1 bg-gray-50 hover:bg-gray-100 rounded-full"
                >
                  <X size={18} />
                </button>

                {!isSubmitted ? (
                  <form onSubmit={handleConsultSubmit} className="space-y-6">
                    <div>
                      <div className="bg-[#00B4D8]/10 text-[#00B4D8] p-3 rounded-2xl inline-block mb-4">
                        <Calendar size={24} />
                      </div>
                      <h3 className="text-2xl font-black text-[#1A2B4C] tracking-tight">Request Engineering Consult</h3>
                      <p className="text-gray-400 font-medium text-xs mt-1.5 leading-relaxed">
                        Submit your spatial parameters and recommended bundle estimate to our AV Live configuration engineers. We will review your topology and contact you with a direct discount offer.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Contact Name *</label>
                          <input 
                            type="text" 
                            required
                            placeholder="e.g. John Doe"
                            value={consultForm.name}
                            onChange={(e) => setConsultForm(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#00B4D8] rounded-xl px-4 py-3 text-xs font-bold text-[#1A2B4C] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Work Email Address *</label>
                          <input 
                            type="email" 
                            required
                            placeholder="e.g. name@company.com"
                            value={consultForm.email}
                            onChange={(e) => setConsultForm(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#00B4D8] rounded-xl px-4 py-3 text-xs font-bold text-[#1A2B4C] focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Company / Organization</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Acme Corp"
                            value={consultForm.company}
                            onChange={(e) => setConsultForm(prev => ({ ...prev, company: e.target.value }))}
                            className="w-full bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#00B4D8] rounded-xl px-4 py-3 text-xs font-bold text-[#1A2B4C] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Phone Number</label>
                          <input 
                            type="tel" 
                            placeholder="e.g. +92 300 1234567"
                            value={consultForm.phone}
                            onChange={(e) => setConsultForm(prev => ({ ...prev, phone: e.target.value }))}
                            className="w-full bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#00B4D8] rounded-xl px-4 py-3 text-xs font-bold text-[#1A2B4C] focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Spatial Layout Notes / Requests</label>
                        <textarea 
                          rows={3}
                          placeholder="Please mention any room materials, sound dampening, custom ceiling height, or mounting surface details..."
                          value={consultForm.notes}
                          onChange={(e) => setConsultForm(prev => ({ ...prev, notes: e.target.value }))}
                          className="w-full bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#00B4D8] rounded-xl px-4 py-3 text-xs font-bold text-[#1A2B4C] focus:outline-none resize-none"
                        />
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex items-start gap-3">
                      <FileText size={16} className="text-[#00B4D8] shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-wider text-[#1A2B4C] block">Configurator Metadata Attached</span>
                        <span className="text-[10px] text-gray-400 leading-relaxed font-semibold mt-0.5 block">
                          Sending estimated project value of <strong>Rs. {totalBundlePrice.toLocaleString()}</strong> with active components of the "{currentRecommended.name}".
                        </span>
                      </div>
                    </div>

                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#1A2B4C] hover:bg-[#00B4D8] disabled:bg-gray-400 text-white font-black text-[10px] uppercase tracking-widest py-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? 'Submitting Estimate Request...' : 'Submit Hardware Consult Request'}
                    </button>
                  </form>
                ) : (
                  <div className="text-center py-8 space-y-6 animate-in fade-in zoom-in-95 duration-250">
                    <div className="bg-[#00B4D8] text-white p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto shadow-lg">
                      <CheckCircle2 size={32} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-[#1A2B4C] tracking-tight">Consult Request Received</h3>
                      <p className="text-gray-400 font-medium text-xs mt-2 leading-relaxed max-w-sm mx-auto">
                        Your custom setup parameters have been synchronized with our live B2B engineering database. A senior deployment consultant has been assigned and will call you shortly.
                      </p>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl text-[11px] text-gray-500 font-bold max-w-xs mx-auto">
                      Assigned Lead ID: <span className="font-mono text-[#00B4D8]">{Math.random().toString(36).substring(2, 9).toUpperCase()}</span>
                    </div>
                    <button 
                      onClick={() => {
                        setShowConsultModal(false);
                        setIsSubmitted(false);
                      }}
                      className="bg-[#1A2B4C] hover:bg-[#00B4D8] text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                    >
                      Close Window
                    </button>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
