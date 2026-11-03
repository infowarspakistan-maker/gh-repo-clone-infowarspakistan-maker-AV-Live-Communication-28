import { useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { ArrowRight, Phone, Sparkles, CheckCircle2, ShieldCheck, MapPin, Award, Clock } from 'lucide-react';
import { SEO } from '../components/SEO';
import { Breadcrumbs } from '../components/Breadcrumbs';

interface LandingConfig {
  title: string;
  description: string;
  keywords: string;
  heroHeading: string;
  heroSubheading: string;
  pillar: 'Event Management' | 'Video Conferencing';
  city?: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  locationCta?: string;
  answerFirstVerdict?: string;
  comparisonTable?: {
    caption: string;
    headers: string[];
    rows: string[][];
  };
  features: string[];
  faqs: { question: string; answer: string }[];
}

const LANDING_CONFIGS: Record<string, LandingConfig> = {
  '3d-hologram': {
    title: 'Hologram Display & 3D Hologram Events in Pakistan | Corporate Event Management | AV Live',
    description: 'High-impact 3D Hologram Display stages, holographic projections, Corporate event management, and hybrid event visual shows in Lahore, Karachi, and Islamabad.',
    keywords: 'Hologram Display, 3D hologram events Pakistan, Event management, Corporate event management, hybrid event, events, holographic stage display Lahore, 3D hologram Karachi, hologram projection Islamabad, AV Live',
    heroHeading: '3D Hologram Display Stages & Corporate Event Management in Pakistan',
    heroSubheading: 'Captivate your audience with floating 3D Hologram Display visuals, holographic product reveals, and turnkey hybrid event stage projection mapping designed by Pakistan’s top AV engineers.',
    pillar: 'Event Management',
    primaryCtaText: 'Book a Free Event or Conference Room Consultation',
    primaryCtaLink: '/event-quote',
    locationCta: 'Book a Free Demo at Our Johar Town Experience Center',
    features: [
      'Custom 3D Hologram Display Content Creation & Holographic Rendering',
      'High-Brightness LED Fan Holograms & Pepper’s Ghost Mesh Projection',
      'Turnkey Corporate Event Management, Stage Truss, Lighting & Sound',
      'Hybrid Event Broadcast Integration with Video Conference Bridges',
      'Proven Track Record across Flagship Corporate Events & Product Launches'
    ],
    faqs: [
      {
        question: 'How does a 3D Hologram Display work for corporate events in Pakistan?',
        answer: 'We utilize ultra-bright LED holographic fans and high-gain Pepper’s Ghost optical mesh projection displays to render transparent, floating 3D Hologram Display graphics and executive keynotes on stage without 3D glasses.'
      },
      {
        question: 'Can a Hologram Display be combined with a hybrid event and live Video conference?',
        answer: 'Yes! Our Corporate event management engineers combine 3D Hologram Display stages with live multi-camera hybrid event broadcasting and Video conference codecs (such as Poly X70 and Polycom Group 500) across Lahore, Karachi, and Islamabad.'
      }
    ]
  },
  'projection-mapping': {
    title: '3D Projection Mapping Pakistan | Building & Stage Displays | AV Live',
    description: '3D architectural projection mapping, immersive visual shows, and stage mapping for corporate galas and public events in Lahore, Karachi, and Islamabad.',
    keywords: 'Projection mapping Pakistan, 3D building mapping Lahore, architectural projection mapping Karachi, stage projection mapping Islamabad, AV Live',
    heroHeading: '3D Architectural & Stage Projection Mapping in Pakistan',
    heroSubheading: 'Transform buildings, stages, and complex geometric structures into mind-bending visual spectacles with high-lumen laser projectors and real-time warping engines.',
    pillar: 'Event Management',
    primaryCtaText: 'Get a Custom Quote in 24 Hours',
    primaryCtaLink: '/event-quote',
    locationCta: 'Request an On-Site Site Survey in Blue Area or Johar Town',
    features: [
      'Full Architectural 3D Surface Calibration & Warping',
      '20,000+ Lumen Laser Projectors for Maximum Contrast',
      'Custom 3D Animation & Motion Graphic Production',
      'Concert-Grade Sound Systems & Stage Lighting Alignment',
      'Seamless Live Playback & Event Stage Control'
    ],
    faqs: [
      {
        question: 'What surface types can be mapped using projection mapping in Pakistan?',
        answer: 'We can map historical building facades, hotel exterior walls, custom stage sets, vehicle surfaces, and indoor corporate auditoriums.'
      }
    ]
  },
  'lahore': {
    title: 'Event Production & Management Company Lahore | AV Live',
    description: 'Lahore’s leading event management company for corporate galas, 3D hologram stages, SMD displays, and conference room AV setups in Johar Town, Gulberg, and DHA.',
    keywords: 'Event production company Lahore, event management company Lahore, 3D hologram Lahore, video conferencing Lahore, conference room AV Johar Town, AV Live',
    heroHeading: 'Premier Event Management & Video Conferencing in Lahore',
    heroSubheading: 'Serving Johar Town, Gulberg, DHA, and greater Lahore with enterprise AV production, 3D hologram stages, and boardroom video conferencing systems.',
    pillar: 'Event Management',
    city: 'Lahore',
    primaryCtaText: 'Book a Free Demo at Our Johar Town Experience Center',
    primaryCtaLink: '/contact',
    locationCta: 'Visit Our Johar Town Experience Center in Lahore',
    features: [
      'Local Johar Town Experience Center for Live Demos',
      '15-Minute Response SLA for Lahore Inquiries',
      'Full Event Setup: SMD Displays, Concert Sound, Stage Lighting',
      'Corporate Boardroom & Zoom/Teams Room Installations',
      'Dedicated On-Site Technicians for Lahore Events'
    ],
    faqs: [
      {
        question: 'Where is AV Live located in Lahore?',
        answer: 'Our main Experience Center and Head Office is located in Johar Town, Lahore, where you can experience live 3D holograms, projection mapping, and Zoom/Teams room setups.'
      }
    ]
  },
  'karachi': {
    title: 'Corporate Event Management & AV Solutions Karachi | AV Live',
    description: 'Premier corporate event management and conference room AV setup in Karachi. 3D hologram stages, venue lighting, sound, and Zoom Rooms in Clifton and PECHS.',
    keywords: 'Corporate event management Karachi, video conferencing Karachi, event management company Karachi, Zoom rooms Karachi, AV Live Clifton',
    heroHeading: 'Corporate Event Production & Video Conferencing in Karachi',
    heroSubheading: 'Empowering Karachi’s corporate hubs in Clifton, Shahrah-e-Faisal, and PECHS with world-class event production and hybrid room solutions.',
    pillar: 'Event Management',
    city: 'Karachi',
    primaryCtaText: 'Schedule a Consultation at Our Clifton Office',
    primaryCtaLink: '/contact',
    locationCta: 'Schedule a Consultation at Our Clifton Office in Karachi',
    features: [
      'Clifton & Shahrah-e-Faisal Dedicated Engineering Support',
      'Corporate Expo & Gala Production Services',
      'Boardroom Fit-Outs & Acoustic Calibration',
      '24-Hour Custom Quote Turnaround',
      'Poly, Yealink, Logitech & Cisco Certified Systems'
    ],
    faqs: [
      {
        question: 'Does AV Live handle corporate events in Clifton and DHA Karachi?',
        answer: 'Yes, our Karachi team provides complete on-site event production, SMD rental, sound, and conference room AV installations across Clifton, DHA, PECHS, and Korangi.'
      }
    ]
  },
  'islamabad': {
    title: 'Event Equipment Rental & Production Islamabad | AV Live',
    description: 'SMD screen rental, concert sound, stage lighting, and video conferencing installation in Islamabad and Rawalpindi. On-site site surveys in Blue Area.',
    keywords: 'Event equipment rental Islamabad, video conferencing Islamabad, corporate events Blue Area, conference room AV Rawalpindi, AV Live',
    heroHeading: 'Event Equipment Rental & Boardroom AV in Islamabad',
    heroSubheading: 'Providing Islamabad, Blue Area, and Rawalpindi with high-spec event equipment rental, SMD screens, 3D holograms, and Microsoft Teams Rooms.',
    pillar: 'Event Management',
    city: 'Islamabad',
    primaryCtaText: 'Request an On-Site Site Survey in Blue Area',
    primaryCtaLink: '/contact',
    locationCta: 'Request an On-Site Site Survey in Blue Area, Islamabad',
    features: [
      'Blue Area Commercial Hub Dedicated Team',
      'Government & Embassy Spec AV Integration',
      'SMD Screen & Concert Sound System Rental',
      'Certified Teams & Zoom Rooms Engineers',
      'Rapid Deployment & 15-Minute Response SLA'
    ],
    faqs: [
      {
        question: 'Can AV Live perform on-site site surveys in Blue Area Islamabad?',
        answer: 'Yes, our Islamabad technical team performs complimentary site surveys for boardrooms and event venues in Blue Area, F-Sectors, and Rawalpindi.'
      }
    ]
  },
  'video-conferencing': {
    title: 'Video Conferencing Room Architecture & Integration | AV Live',
    description: 'Certified Zoom Rooms, Microsoft Teams Rooms (MTR) & H.323/SIP boardroom architecture in Lahore, Karachi & Islamabad with 15-min SLA.',
    keywords: 'Video conferencing room architecture Pakistan, SIP H.323 codec integration, Zoom Rooms Pakistan, Microsoft Teams Rooms Pakistan, boardroom acoustic calibration, AV Live',
    heroHeading: 'Video Conferencing Room Architecture, SIP/H.323 Codecs & Cloud Integration',
    heroSubheading: 'Engineered room acoustics, PoE+ structured cabling, ceiling beamforming microphone arrays, and encrypted H.323/SIP & MTR/Zoom Room integration across Lahore, Karachi, and Islamabad.',
    pillar: 'Video Conferencing',
    primaryCtaText: 'Book a Free Conference Room Acoustic Survey',
    primaryCtaLink: '/contact',
    locationCta: '15-Minute Engineering SLA across Lahore, Karachi & Islamabad',
    answerFirstVerdict: 'Successful enterprise video conferencing integration requires matching room acoustics (RT60 < 0.6s) and table geometry with the right platform architecture: standards-based H.323/SIP hardware codecs for encrypted banking/defense boardrooms, Android all-in-one collaboration bars for 4–14 seat cloud rooms, or modular Windows MTR/Zoom Room bundles for multi-camera townhalls.',
    comparisonTable: {
      caption: 'Enterprise Video Conferencing Room Topologies & Integration Standards',
      headers: ['Architecture Topology', 'Core Codec / Appliance', 'Network & Protocol Stack', 'Best Room Deployment', 'Turnkey SLA & Warranty'],
      rows: [
        ['Encrypted H.323 / SIP Hardware Codec', 'Polycom RealPresence Group 500 / Cisco Room Kit Plus', 'Dedicated Voice/Video VLAN, AES-256, H.323, SIP,On-Prem MCU', 'Commercial Banks, Defense, Ministries, 16–30 Seat Boardrooms', '15-Min SLA + On-Site Engineer'],
        ['Native Cloud Appliance Video Bar', 'HP Poly Studio X52 / X72 / Logitech Rally Bar / Yealink A30', 'CollabOS / Poly VideoOS Native Zoom Rooms & Teams Rooms + USB BYOD', 'Huddle Spaces & 6–16 Seat Corporate Conference Rooms', '1-to-3 Year Local Swap Warranty'],
        ['Multi-Camera Modular Pro-AV Matrix', 'Poly G7500 / Cisco Codec Pro + Dual 20x PTZ + Bosch Ceiling Mics', 'Dante Audio over IP, Dual 4K60 HDMI Matrix, QSC/Bosch DSP', '30–100+ Seat Auditoriums, HEC Lecture Halls & Hybrid Townhalls', 'Custom CAD Blueprint + Acoustic Tuning']
      ]
    },
    features: [
      'RT60 Reverberation Modeling, Acoustic Paneling & NoiseBlockAI Tuning',
      'Standards-Based H.323 / SIP Hardware Codec Provisioning & Firewall Traversal',
      'Dante Ceiling Beamforming Microphone Arrays & Multi-Zone DSP Matrices',
      'Single-Cable USB-C BYOD & Wireless 4K Content Sharing (AirPlay, Miracast, Barco/Poly)',
      'Complete CAD Wiring Schematics, FBR GST Invoicing & 15-Minute Nationwide SLA'
    ],
    faqs: [
      {
        question: 'How is /video-conferencing different from our Video Conference in Pakistan hardware catalog?',
        answer: 'This hub focuses on boardroom acoustic engineering, H.323/SIP network topology, and multi-camera room integration. For direct model-by-model PKR hardware pricing and in-stock endpoints, visit our flagship Video Conference in Pakistan pillar at /video-conference-in-pakistan.'
      },
      {
        question: 'Can you integrate existing Bosch or Shure conference microphones with Zoom and Microsoft Teams?',
        answer: 'Yes. Using Dante-to-USB audio bridges and acoustic echo cancellation (AEC) DSPs, we integrate Bosch CCS 1000 D, Bosch PAVIRO, and ceiling arrays directly into Poly, Cisco, and Logitech rooms.'
      }
    ]
  },
  'video-conference-in-pakistan': {
    title: 'Video Conference in Pakistan | Poly, Cisco & Logitech | AV Live',
    description: 'Complete B2B Video Conference in Pakistan solutions. Official Polycom Group 500, Poly X70, Zoom Rooms, Microsoft Teams Rooms & boardroom AV.',
    keywords: 'Video Conference in Pakistan, Video conference system price in Pakistan, Polycom Group 500, Poly X70, Logitech Rally Bar Pakistan, Cisco Room Kit Pakistan, Yealink video conferencing Pakistan, AV Live',
    heroHeading: 'Video Conference in Pakistan: Official Poly, Cisco, Logitech & Yealink Systems (Est. 2011)',
    heroSubheading: 'Pioneering Video Conference in Pakistan since 2011. Compare and procure serialized, PTA/PPRA-compliant Polycom Group 500, Poly Studio X70/X72, Logitech Rally Bar, Cisco Room Kits, and Yealink endpoints with official PKR pricing and same-day dispatch in Lahore, Karachi, and Islamabad.',
    pillar: 'Video Conferencing',
    primaryCtaText: 'Get Official Video Conference Price List (PKR)',
    primaryCtaLink: '/contact',
    locationCta: 'Live Demo Experience Centers in Johar Town (Lahore), Clifton (Karachi) & Blue Area (Islamabad)',
    answerFirstVerdict: 'Since pioneering the "Video Conference in Pakistan" category in 2011, AV Live Communications supplies 100% genuine, serialized HP Poly (Polycom Group 500, Studio X52/X70/X72), Logitech Rally Bar, Cisco Room Kit Plus, and Yealink video conferencing systems from Rs. 195,000 to Rs. 3,200,000+ with on-site acoustic calibration and a 15-minute engineering SLA.',
    comparisonTable: {
      caption: '2026 Video Conference in Pakistan — Flagship Hardware & PKR Price Comparison Matrix',
      headers: ['Video Conference System', 'OEM Brand & MPN', 'Room Capacity & Optics', 'Platform Compatibility', 'Official Pakistan Price (PKR)'],
      rows: [
        ['Poly Studio R30 / USB Video Bar', 'HP Poly (842D2AA / 7200-85830-001)', '2–6 Pax Huddle • 4K 120° FOV + DirectorAI', 'USB Plug-and-Play (Zoom, Teams, Meet, Webex)', 'Rs. 195,000 – Rs. 310,000'],
        ['Logitech Rally Bar Mini / Poly Studio X52', 'Logitech (960-001336) / Poly (8D8K2AA)', '6–12 Pax Medium • 4K 20MP AI Framing + 6m Mic', 'Native Zoom Rooms, Microsoft Teams Rooms & USB', 'Rs. 640,000 – Rs. 795,000'],
        ['Logitech Rally Bar (Motorized Optical PTZ)', 'Logitech (960-001308)', '10–20 Pax Boardroom • 15x Optical/HD Zoom + 4 Mic Pods', 'Native MTR, Zoom Rooms & BYOD Mode', 'Rs. 845,000 – Rs. 960,000'],
        ['Polycom RealPresence Group 500 (12x PTZ)', 'Polycom (7200-64550-001)', '14–28 Pax Executive • EagleEye IV 12x Optical PTZ', 'Standards H.323 / SIP + Zoom/Teams Interop', 'Rs. 685,000 – Rs. 920,000'],
        ['HP Poly Studio X70 / X72 Large Room Bar', 'HP Poly (2405-86690-001 / A4MA9AA)', '16–28 Pax Large Room • Dual 4K 20MP Lenses (70°+120°)', 'Native Zoom Rooms & Microsoft Teams Rooms', 'Rs. 1,150,000 – Rs. 1,490,000'],
        ['Cisco Room Kit Plus / Quad Camera Bar', 'Cisco (CS-KITPLUS-K9)', '16–30+ Pax C-Suite • 5K Quad Camera + Codec Plus', 'Webex, Native Microsoft Teams Rooms & H.323/SIP', 'Rs. 1,650,000 – Rs. 2,850,000']
      ]
    },
    features: [
      'Direct Authorized Stock of Polycom Group 500, Poly Studio X70/X72, Logitech Rally & Cisco Room Kits',
      'Why We Beat Box-Mover Resellers (accsys, kbse, nasco): Free On-Site RT60 Acoustic & Camera Throw Survey',
      'Local Buffer Stock in Lahore (Johar Town) for Same-Day Dispatch & Instant RMA Swap Warranty',
      'Turnkey Integration with Horion 65"–98" 4K Interactive Flat Panels & Bosch Discussion Mics',
      'FBR GST/NTN Tax Invoices, Manufacturer Authorization Letters (MAL) & PPRA Tender Support'
    ],
    faqs: [
      {
        question: 'Why choose AV Live for Video Conference in Pakistan over general IT hardware vendors?',
        answer: 'Unlike general IT traders or regional distributors that only ship boxes or lock you into a single brand, AV Live has specialized exclusively in Video Conference in Pakistan and live AV engineering since 2011. We stock Poly, Cisco, Logitech, Yealink, Jabra, and Bosch under one roof, perform on-site acoustic tuning, and back every boardroom with a 15-minute engineering SLA.'
      },
      {
        question: 'Which hardware is best for Video Conference in Pakistan: Polycom Group 500, Poly X70, or Logitech Rally Bar?',
        answer: 'Choose the Polycom RealPresence Group 500 for standards-based H.323/SIP government and banking networks requiring a 12x optical PTZ camera. Choose the Poly Studio X70/X72 or Logitech Rally Bar for modern cloud Zoom Rooms and Microsoft Teams Rooms needing dual-camera AI speaker tracking and expansion table microphones.'
      },
      {
        question: 'Do you provide on-site installation and live demos in Lahore, Karachi, and Islamabad?',
        answer: 'Yes! Visit our Johar Town Experience Center in Lahore, or schedule an on-site demonstration and room survey with our regional engineers in Clifton (Karachi) and Blue Area (Islamabad) by calling 0321 425 6263.'
      }
    ]
  },
  'event-management-in-pakistan': {
    title: 'Event Management in Pakistan | Corporate Events & AV | AV Live',
    description: 'Premier Event Management in Pakistan (Est. 2011). In-house SMD LED screens, line-array sound, 3D hologram stages & corporate events in Lahore, Karachi & Islamabad.',
    keywords: 'Event management in Pakistan, Corporate event management Pakistan, event management company in Lahore, event management Karachi, event management Islamabad, SMD screen rental Pakistan, sound system rental Lahore, AV Live',
    heroHeading: 'Event Management in Pakistan: Turnkey Corporate Events, SMD Stages & Hybrid Production (Est. 2011)',
    heroSubheading: 'Unlike catering and floral agencies that sub-rent audio-visual equipment at a 40% markup, AV Live Communications owns Pakistan’s largest in-house fleet of P2.5 SMD LED video walls, concert line-array sound systems, 3D hologram stages, trussing, and multi-camera broadcast rigs across Lahore, Islamabad, and Karachi.',
    pillar: 'Event Management',
    primaryCtaText: 'Get a 15-Minute Event Production BoQ',
    primaryCtaLink: '/event-quote',
    locationCta: 'In-House Warehouses & Crew in Lahore (Johar Town), Islamabad (Blue Area) & Karachi (Clifton)',
    answerFirstVerdict: 'Established in 2011, AV Live is Pakistan’s premier technology-first Event Management company. Because we own 100% of our P2.5 3840Hz SMD LED screens, line-array concert PA sound, aluminum stage trussing, 3D hologram displays, and 4K SDI broadcast switchers, corporate clients save 30%–40% compared to hiring third-party event planner/caterer middlemen.',
    comparisonTable: {
      caption: 'Event Management in Pakistan — AV Live Direct Production vs. Traditional Event/Catering Agencies',
      headers: ['Event Production Pillar', 'AV Live Turnkey Engineering (In-House Fleet)', 'Traditional Event / Catering Agencies', 'Reference AV Live Package (PKR)'],
      rows: [
        ['Corporate Conferences, AGMs & Townhalls', 'P2.5 3840Hz SMD LED Wall, Digital Podium, Bosch Gooseneck Mics, 2-Way Zoom/Teams Bridge', 'Sub-rented low-refresh LED screen + basic analog mixer without hybrid echo cancellation', 'Rs. 250,000 – Rs. 650,000'],
        ['Brand Launches, Galas & 3D Hologram Shows', 'Curved SMD LED Stage, 3D HoloGauze / Pepper’s Ghost Projection, 24x DMX Moving Heads, Line-Array PA', 'Basic stage backdrop & outsourced lighting without 3D holographic or timecode control', 'Rs. 750,000 – Rs. 2,500,000'],
        ['International Expos, Summits & Diplomatic Events', 'Custom 3D Truss Pavilions, Simultaneous Interpretation (BOSCH), Multi-Cam 4K SDI Broadcast', 'Carpentry stall only; no simultaneous translation or multi-cam SDI live streaming', 'Rs. 950,000 – Rs. 4,200,000+'],
        ['Concert Sound, Stage Trussing & Arena AV', 'Dual 12" Line-Array Stacks, 18" Subwoofers, Heavy-Duty Goalpost Truss, Laser & CO2 FX', 'Relies on third-party sound vendors with zero acoustic SPL calibration', 'Rs. 350,000 – Rs. 1,800,000']
      ]
    },
    features: [
      '100% In-House Inventory: Zero Middleman Markups vs. Catering/Decor Event Planners',
      'Fine-Pitch P1.8, P2.5 & P3.9 Indoor/Outdoor SMD LED Video Walls (3840Hz Broadcast Refresh)',
      'Concert Line-Array Sound Systems, Digital Mixers, Wireless Lapel/Handheld Mics & Stage Trussing',
      '3D Hologram Display Stages, Architectural Projection Mapping & Multi-Camera Live Streaming',
      'Simultaneous Interpretation Systems, Bosch Digital Discussion Mics & 5-Star Hotel Venue Execution (PC, Serena, Marriott, Expo Centre)'
    ],
    faqs: [
      {
        question: 'How does AV Live differ from other event management companies in Pakistan like catering or decor planners?',
        answer: 'Most event management companies in Lahore, Karachi, and Islamabad are wedding/catering coordinators who outsource SMD screens, sound systems, stage lighting, and live streaming to technical vendors like us. By contracting AV Live directly, corporate organizations get direct warehouse pricing, broadcast-certified engineers, redundant backup gear, and FBR GST/NTN tax compliance.'
      },
      {
        question: 'Which cities and venues do you cover for Event Management in Pakistan?',
        answer: 'We execute turnkey corporate events, expos, and hybrid summits across Lahore (Pearl Continental, Expo Centre, Faletti’s, Nishat), Islamabad (Serena Hotel, Marriott, Jinnah Convention Centre), Karachi (Expo Centre, Movenpick, Marriott, PC), Faisalabad, Multan, and Peshawar.'
      },
      {
        question: 'Can you combine physical Event Management with live Video Conferencing for hybrid events?',
        answer: 'Yes! Because AV Live leads both Event Management in Pakistan and Video Conference in Pakistan, we seamlessly bridge your physical hotel ballroom stage with remote keynote speakers on Zoom, Microsoft Teams, and Webex with zero audio echo.'
      }
    ]
  },
  'conference-room-solutions': {
    title: 'Conference Room AV Setup Pakistan | Boardroom Solutions | AV Live',
    description: 'Professional conference room AV design, acoustic treatment, smart displays, ceiling mics, and video bars for corporate offices in Pakistan.',
    keywords: 'Conference room AV setup, boardroom AV installation Pakistan, ceiling mic array Lahore, video bar Karachi, AV Live',
    heroHeading: 'Turnkey Conference Room AV Setup & Integration',
    heroSubheading: 'Upgrade your corporate meeting spaces with ultra-clear audio arrays, crisp 4K displays, and seamless room automation designed for modern hybrid collaboration.',
    pillar: 'Video Conferencing',
    primaryCtaText: 'Get a Custom Quote in 24 Hours',
    primaryCtaLink: '/contact',
    locationCta: 'Request a Free On-Site Survey in Lahore, Karachi, or Islamabad',
    features: [
      'Custom Acoustic Analysis & Room Design Blueprint',
      'Ceiling Beamforming Microphone Arrays & DSP Tuning',
      '4K Interactive Touchscreens & Video Wall Deployments',
      'Cable Management & Wireless Touch-Panel Controllers',
      'Full Training & Nationwide Service Level Agreements'
    ],
    faqs: [
      {
        question: 'What is included in a complete conference room AV setup?',
        answer: 'Our turnkey service includes acoustic site assessment, display mounting, video bar/camera setup, ceiling microphone array integration, cable routing, touch console configuration, and end-user training.'
      }
    ]
  },
  'zoom-rooms': {
    title: 'Zoom Rooms Setup & Integration Pakistan | AV Live',
    description: 'Certified Zoom Meeting Room setup in Pakistan. Neat, Poly, Logitech, and Yealink Zoom Rooms appliances for small huddle spaces to large boardrooms.',
    keywords: 'Zoom meeting room setup Pakistan, Zoom Rooms deployment Lahore, Zoom Rooms Karachi, Zoom hardware Islamabad, AV Live',
    heroHeading: 'Certified Zoom Rooms Deployment & Hardware in Pakistan',
    heroSubheading: 'Transform standard meeting rooms into frictionless Zoom Rooms with dedicated touch controllers, intelligent auto-framing cameras, and crystal-clear room audio.',
    pillar: 'Video Conferencing',
    primaryCtaText: 'Book a Free Event or Conference Room Consultation',
    primaryCtaLink: '/contact',
    locationCta: 'Call Now for a 15-Minute Response SLA',
    features: [
      'Official Zoom Rooms Hardware Partners (Poly, Yealink, Neat, Logitech)',
      'Huddle Space, Medium Room, and Large Boardroom Bundles',
      'Dual-Display Output & Digital Whiteboarding Support',
      'Centralized Remote Device Management via Zoom Admin Portal',
      'Local Pakistan Stock & Direct Warranty Support'
    ],
    faqs: [
      {
        question: 'Can existing TV screens and speakers be converted into a Zoom Room?',
        answer: 'Yes! We can integrate your existing displays and acoustics with specialized Zoom Rooms bar appliances like the Yealink A20/A30 or Poly Studio X series.'
      }
    ]
  },
  'microsoft-teams-rooms': {
    title: 'Microsoft Teams Rooms Setup Pakistan | MTR Solutions | AV Live',
    description: 'Native Microsoft Teams Rooms (MTR) deployment in Pakistan. Surface Hub, Yealink, Logitech, and Poly MTR systems for seamless team collaboration.',
    keywords: 'Microsoft Teams room setup Pakistan, MTR deployment Lahore, Teams meeting room Karachi, Poly Teams room Islamabad, AV Live',
    heroHeading: 'Native Microsoft Teams Rooms (MTR) Solutions in Pakistan',
    heroSubheading: 'Empower hybrid workforce productivity with native Microsoft Teams Rooms featuring proximity join, Front Row layout, and intelligent active speaker framing.',
    pillar: 'Video Conferencing',
    primaryCtaText: 'Book a Free Event or Conference Room Consultation',
    primaryCtaLink: '/contact',
    locationCta: 'Request an On-Site Room Survey Today',
    features: [
      'Native Windows & Android Microsoft Teams Rooms Systems',
      'Support for Microsoft Teams Front Row Multi-Window Layouts',
      'Ceiling Microphone Tracking for Large Training & Council Rooms',
      'Seamless Microsoft 365 Calendar Integration',
      'End-to-End Implementation & After-Sales Maintenance'
    ],
    faqs: [
      {
        question: 'What is the difference between MTR on Windows vs Android?',
        answer: 'MTR on Windows offers dual 4K display capabilities, advanced multi-camera switching, and complex room audio DSPs, whereas Android MTR bars provide compact, rapid all-in-one deployment for huddle spaces.'
      }
    ]
  },
  'video-conferencing-solutions': {
    title: 'Enterprise Video Conferencing Solutions in Lahore, Karachi & Islamabad | Poly, Cisco, Yealink | AV Live',
    description: 'Authorized Polycom video conferencing distributors Lahore, Cisco Room Kit installation Karachi, Boardroom AV integration services Islamabad, and Horion interactive flat panels.',
    keywords: 'Polycom video conferencing distributors Lahore, Cisco Room Kit installation Karachi, Enterprise VoIP PBX setup Pakistan, Boardroom AV integration services Islamabad, Interactive flat panel displays for business Lahore, Video Conference in Pakistan',
    heroHeading: 'Enterprise Video Conferencing Solutions in Lahore, Karachi & Islamabad',
    heroSubheading: 'Deploy certified Cisco, Poly, Yealink, Logitech, Horion, and Grandstream boardroom integration, huddle room kits, and 4K interactive flat panels—backed by a guaranteed 15-minute technical SLA.',
    pillar: 'Video Conferencing',
    primaryCtaText: 'Request a 15-Minute Quote',
    primaryCtaLink: '/contact',
    locationCta: 'Live Experience Centers & Standby Engineers in Johar Town (Lahore), Clifton (Karachi) & Blue Area (Islamabad)',
    features: [
      'Authorized Polycom Video Conferencing Distributors in Lahore (Poly Studio X72, X52 & Group 500)',
      'Certified Cisco Room Kit Installation in Karachi & Boardroom AV Integration Services in Islamabad',
      'Interactive Flat Panel Displays for Business in Lahore (Horion 65"–98" 4K Touch Boards)',
      'Enterprise VoIP PBX Setup in Pakistan (Grandstream UCM6308, 3CX, FreePBX & Cisco CUCM)',
      'Guaranteed 15-Minute Technical SLA Response, Zero-Downtime & On-Site Standby Engineers'
    ],
    faqs: [
      {
        question: 'What is the cost of a 30-person executive boardroom AV setup in Pakistan?',
        answer: 'A turnkey 30-person executive boardroom AV setup in Lahore, Karachi, or Islamabad ranges from PKR 1,450,000 to PKR 3,200,000, including dual 4K Horion interactive flat panels, an optical PTZ codec or AI bar (Poly Studio X72, Polycom Group 500, or Cisco Room Kit Plus), ceiling/table microphone arrays, and acoustic calibration.'
      },
      {
        question: 'Do you provide Polycom video conferencing in Lahore and Cisco Room Kit installation in Karachi?',
        answer: 'Yes. AV Live Communications is an authorized partner for Cisco, Poly, Yealink, Logitech, Horion, and Grandstream with engineering hubs in Johar Town (Lahore), Clifton (Karachi), and Blue Area (Islamabad).'
      },
      {
        question: 'What is included in your 15-minute technical SLA?',
        answer: 'Our 15-minute SLA guarantees immediate engineering response via WhatsApp/hotline (0321 425 6263 / 0339 0000 921), 24-hour custom Bill of Materials (BoM) turnaround, and on-site standby engineer dispatch for critical executive meetings.'
      }
    ]
  },
  'corporate-event-management': {
    title: 'Corporate Event Management & Hybrid Event Production in Lahore, Karachi & Islamabad | AV Live',
    description: 'Turnkey Corporate hybrid event live streaming Lahore, SMD LED screen rental for corporate events, 3D hologram display stages Pakistan, and multi-camera event broadcasting Karachi.',
    keywords: 'Corporate hybrid event live streaming Lahore, SMD LED screen rental for corporate events, 3D hologram display stages Pakistan, Multi-camera event broadcasting Karachi, Corporate event management, Event management',
    heroHeading: 'Corporate Event Management & Hybrid Staging in Lahore, Karachi & Islamabad',
    heroSubheading: 'Execute flawless executive summits, 3D hologram display stages, fine-pitch SMD LED video walls, and multi-camera hybrid event broadcasting with zero-downtime guarantees and on-site standby engineers.',
    pillar: 'Event Management',
    primaryCtaText: 'Request a 15-Minute Quote',
    primaryCtaLink: '/event-quote',
    locationCta: 'On-Site Production Teams in Johar Town & DHA (Lahore), Clifton (Karachi) & Blue Area (Islamabad)',
    features: [
      'Corporate Hybrid Event Live Streaming in Lahore with Two-Way Zoom/Teams & Poly X70 Bridging',
      'Fine-Pitch P2.5 SMD LED Screen Rental for Corporate Events, AGMs & Product Launches',
      '3D Hologram Display Stages in Pakistan (HoloGauze Mesh, Pepper’s Ghost & 3D LED Fan Matrices)',
      'Multi-Camera Event Broadcasting in Karachi with 4K SDI Switching & Digital Line-Array Sound',
      'Guaranteed 15-Minute Technical SLA, Redundant Signal Paths & Standby Broadcast Engineers'
    ],
    faqs: [
      {
        question: 'What is included in your corporate hybrid event live streaming and stage production packages?',
        answer: 'Our turnkey packages include fine-pitch SMD LED screen rental for corporate events, 3D hologram display stages, multi-camera SDI broadcasting, line-array PA sound, and zero-echo Video conference bridging via Poly Studio X70 and Cisco codecs.'
      },
      {
        question: 'Can you execute 3D hologram display stages and multi-camera event broadcasting in Lahore, Karachi, and Islamabad?',
        answer: 'Yes. We own and operate all staging, SMD LED, 3D hologram, and broadcast switching inventory across Johar Town/DHA (Lahore), Clifton (Karachi), and Blue Area (Islamabad).'
      },
      {
        question: 'How fast can we get an event or boardroom AV quotation?',
        answer: 'Call 0321 425 6263 or 0339 0000 921 for an immediate 15-minute technical consultation and a complete itemized Bill of Quantities (BoQ) within 24 hours.'
      }
    ]
  },
  'live-streaming-services': {
    title: 'Live Streaming Services for Events in Lahore | AV Live',
    description: 'Secure professional live stream setups and corporate webcast services in Pakistan. AV Live offers multi-camera event broadcasting with zero-downtime guarantees.',
    keywords: 'Live streaming services Lahore, corporate webcast services Pakistan, multi-camera event broadcasting, live stream setup, zero-downtime streaming, AV Live',
    heroHeading: 'Professional Live Streaming Services for Events in Lahore',
    heroSubheading: 'Secure professional live stream setups and corporate webcast services in Pakistan with multi-camera event broadcasting and zero-downtime guarantees.',
    pillar: 'Event Management',
    primaryCtaText: 'Request a 15-Minute Quote',
    primaryCtaLink: '/event-quote',
    locationCta: 'On-Site Standby Engineers in Lahore, Karachi & Islamabad',
    features: [
      'Complete Multi-Camera Event Broadcasting with Professional Live Stream Setup',
      'SyncCast Studio Integration with OBS Studio & Venue Displays',
      'Secure Corporate Webcast Services in Pakistan for Confidential AGMs',
      'Specialized Live Surgery Video Broadcasting & Medical AV',
      'Redundant Network Architecture & 15-Minute Technical SLA'
    ],
    faqs: [
      {
        question: 'What platforms do you stream to?',
        answer: 'We can push your live feed to any destination you require, including custom secure corporate portals, YouTube, Facebook Live, LinkedIn Live, Zoom, Microsoft Teams, or custom virtual event platforms.'
      },
      {
        question: 'What is the difference between a standard webcam setup and a professional live stream setup?',
        answer: 'A professional setup utilizes multiple broadcast-grade cameras, professional lighting, dedicated audio mixing, hardware encoders, and redundant internet connections for a TV-quality viewing experience.'
      }
    ]
  },
  'av-equipment-rental': {
    title: 'Enterprise AV Equipment & SMD LED Screen Rental in Lahore | AV Live',
    description: 'Rent premium AV equipment for corporate events in Pakistan. AV Live provides cutting-edge SMD LED screen rentals, 3D hologram stage setups, and PA systems with on-site engineering support.',
    keywords: 'AV equipment rental Lahore, SMD LED screen rental Pakistan, 3D hologram stage rental, conference PA system rental, Horion interactive flat panel rental, AV Live',
    heroHeading: 'Premium Enterprise AV Equipment & SMD LED Screen Rental in Lahore',
    heroSubheading: 'Rent premium AV equipment for corporate events in Pakistan—cutting-edge SMD LED screen rentals, 3D hologram stage setups, and PA systems with on-site engineering support.',
    pillar: 'Event Management',
    primaryCtaText: 'Request a 15-Minute Quote',
    primaryCtaLink: '/event-quote',
    locationCta: 'Johar Town Lahore Headquarters & Nationwide Dispatch',
    features: [
      'SMD LED Screen Rental for Corporate Events, Indoor & Outdoor Stages',
      '3D Hologram Stage Setup & Holographic Pods for Product Launches',
      'Interactive Flat Panels (Horion 65"–98" 4K Smart Boards available for rent/purchase)',
      'PA System & Line-Array Sound Rental for Conferences',
      'Turnkey Staging, Rigging, Cabling & On-Site Standby Engineers'
    ],
    faqs: [
      {
        question: 'Do you provide AV equipment rentals outside of Lahore?',
        answer: 'Yes. While our technical headquarters are based in Lahore, we actively deploy LED screens, holograms, and AV teams for major corporate events in Karachi, Islamabad, and across Pakistan.'
      },
      {
        question: 'Does the SMD LED screen rental include the trussing and rigging?',
        answer: 'Absolutely. Our quotes include the LED panels, video processors, structural trussing, safe rigging, cabling, and the technical crew required for setup and operation.'
      }
    ]
  }
};

export function KeywordLandingPage() {
  const { keywordSlug } = useParams<{ keywordSlug: string }>();
  const location = useLocation();
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);
  const pathSlug = location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
  const slug = (keywordSlug || pathSlug || '').toLowerCase();
  const config = LANDING_CONFIGS[slug];

  if (!config) {
    return (
      <div className="flex-1 w-full bg-[#F8F9FA] min-h-[70vh] flex flex-col items-center justify-center px-4 py-20 text-center">
        <SEO
          title="Page Not Found (404) | AV Live Communications Pakistan"
          description="The requested page could not be found. Explore AV Live's Video Conferencing in Pakistan, Polycom Group 500, Poly X70, and Corporate Event Management solutions."
          noindex={true}
        />
        <span className="text-[#00B4D8] text-xs font-black uppercase tracking-[0.3em] mb-3">Error 404</span>
        <h1 className="text-4xl md:text-5xl font-black text-[#1A2B4C] mb-4">Page Not Found</h1>
        <p className="text-gray-500 max-w-xl mb-8 font-medium">
          The URL <code className="bg-gray-200 px-2 py-0.5 rounded text-[#1A2B4C]">/{slug}</code> does not exist or has moved. Explore our core enterprise solutions below:
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/video-conferencing" className="bg-[#1A2B4C] hover:bg-[#00B4D8] text-white font-black px-6 py-3.5 rounded-xl text-xs uppercase tracking-widest transition-all">
            Video Conferencing in Pakistan
          </Link>
          <Link to="/events-services" className="bg-[#00B4D8] hover:bg-[#0096B4] text-white font-black px-6 py-3.5 rounded-xl text-xs uppercase tracking-widest transition-all">
            Corporate Event Management
          </Link>
          <Link to="/shop" className="bg-white border border-gray-200 hover:border-[#1A2B4C] text-[#1A2B4C] font-black px-6 py-3.5 rounded-xl text-xs uppercase tracking-widest transition-all">
            Browse Hardware Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full bg-[#F8F9FA] pb-16">
      <SEO 
        title={config.title}
        description={config.description}
        keywords={config.keywords}
        url={`https://avlive.com.pk/${slug}`}
        schema={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebPage",
              "@id": `https://avlive.com.pk/${slug}`,
              "name": config.title,
              "description": config.description,
              "url": `https://avlive.com.pk/${slug}`,
              "publisher": { "@id": "https://avlive.com.pk/#organization" }
            },
            {
              "@type": "Service",
              "name": config.heroHeading,
              "serviceType": config.pillar,
              "provider": { "@id": "https://avlive.com.pk/#organization" },
              "areaServed": config.city ? config.city : ["Lahore", "Karachi", "Islamabad", "Pakistan"],
              "offers": {
                "@type": "Offer",
                "priceCurrency": "PKR",
                "availability": "https://schema.org/InStock"
              }
            },
            {
              "@type": "FAQPage",
              "mainEntity": config.faqs.map(faq => ({
                "@type": "Question",
                "name": faq.question,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": faq.answer
                }
              }))
            }
          ]
        }}
      />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-2.5">
        <Breadcrumbs items={[{ label: config.pillar, path: '/services' }, { label: config.heroHeading }]} />
      </div>

      {/* Compact 16:6 Hero Banner */}
      <section className="relative bg-gradient-to-br from-[#1A2B4C] via-[#0F1B33] to-[#0A1120] text-white py-6 lg:py-10 px-3 sm:px-6 overflow-hidden border-b border-[#00B4D8]/20">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#00B4D8_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00B4D8]/10 border border-[#00B4D8]/30 text-[#00B4D8] font-black text-[10px] uppercase tracking-widest mb-2.5">
            <Sparkles size={13} />
            <span>{config.pillar} {config.city ? `• ${config.city}` : '• Pakistan-Wide'}</span>
          </div>

          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black tracking-tight mb-2.5 leading-tight max-w-4xl text-white">
            {config.heroHeading}
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-gray-300 mb-4 max-w-3xl font-medium leading-relaxed line-clamp-3">
            {config.heroSubheading}
          </p>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link 
              to={config.primaryCtaLink}
              className="bg-[#00B4D8] hover:bg-[#0096B4] text-white font-black px-5 py-2.5 min-h-[38px] rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider group"
            >
              <span>{config.primaryCtaText}</span>
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </Link>

            <a 
              href="tel:+923214256263"
              className="bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-2.5 min-h-[38px] rounded-xl border border-white/20 transition-all flex items-center justify-center gap-2 text-xs"
            >
              <Phone size={14} className="text-[#00B4D8]" />
              <span>0321 425 6263 (15-Min SLA)</span>
            </a>

            <a 
              href="tel:+923390000921"
              className="bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-2.5 min-h-[38px] rounded-xl border border-white/20 transition-all flex items-center justify-center gap-2 text-xs"
            >
              <Phone size={14} className="text-[#F26522]" />
              <span>0339 0000 921</span>
            </a>
          </div>

          {config.locationCta && (
            <div className="mt-3.5 inline-flex items-center gap-2 text-xs text-[#00B4D8] font-bold bg-white/5 py-1.5 px-3.5 rounded-lg border border-white/10">
              <MapPin size={14} />
              <span>{config.locationCta}</span>
            </div>
          )}
        </div>
      </section>

      {/* Compact Partner Authority & Hardware Trust Bar */}
      <section className="bg-white border-b border-gray-200 py-3 px-3 sm:px-6 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Award className="text-[#00B4D8] shrink-0" size={20} />
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-[#00B4D8] block">Certified Engineering Team</span>
              <span className="text-xs font-black text-[#1A2B4C]">Authorized Enterprise Hardware Partners</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { name: 'Cisco', path: '/brands/cisco' },
              { name: 'Poly', path: '/brands/poly' },
              { name: 'Yealink', path: '/brands/yealink' },
              { name: 'Logitech', path: '/brands/logitech' },
              { name: 'Horion', path: '/brands/horion' },
              { name: 'Grandstream', path: '/brands/grandstream' },
              { name: 'Zoom / Teams Rooms', path: '/zoom-rooms' },
            ].map((b) => (
              <Link
                key={b.name}
                to={b.path}
                className="px-3 py-1.5 rounded-lg bg-[#F8F9FA] hover:bg-[#1A2B4C] text-[#1A2B4C] hover:text-white border border-gray-200 text-[10px] font-black uppercase tracking-wider transition-all"
              >
                {b.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Compact "AV Live" Advantage Bar */}
      <section className="bg-[#F8F9FA] border-b border-gray-200 py-4 px-3 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
          <Link to="/contact" className="bg-white p-3.5 rounded-xl border border-gray-100 hover:border-[#00B4D8] transition-all flex flex-col items-center group">
            <Clock className="text-[#00B4D8] mb-1.5" size={20} />
            <h4 className="font-black text-[#1A2B4C] group-hover:text-[#00B4D8] text-xs uppercase">15-Min SLA Response</h4>
            <p className="text-[10px] text-gray-500 font-medium">15-Minute Engineering Callback</p>
          </Link>
          <Link to="/about" className="bg-white p-3.5 rounded-xl border border-gray-100 hover:border-[#00B4D8] transition-all flex flex-col items-center group">
            <ShieldCheck className="text-[#00B4D8] mb-1.5" size={20} />
            <h4 className="font-black text-[#1A2B4C] group-hover:text-[#00B4D8] text-xs uppercase">Zero-Downtime Guarantee</h4>
            <p className="text-[10px] text-gray-500 font-medium">Redundant Codecs &amp; Signal Paths</p>
          </Link>
          <Link to="/services/corporate-events" className="bg-white p-3.5 rounded-xl border border-gray-100 hover:border-[#00B4D8] transition-all flex flex-col items-center group">
            <Award className="text-[#00B4D8] mb-1.5" size={20} />
            <h4 className="font-black text-[#1A2B4C] group-hover:text-[#00B4D8] text-xs uppercase">On-Site Standby Engineers</h4>
            <p className="text-[10px] text-gray-500 font-medium">Lahore • Karachi • Islamabad</p>
          </Link>
          <Link to="/programs/quote" className="bg-white p-3.5 rounded-xl border border-gray-100 hover:border-[#00B4D8] transition-all flex flex-col items-center group">
            <Phone className="text-[#00B4D8] mb-1.5" size={20} />
            <h4 className="font-black text-[#1A2B4C] group-hover:text-[#00B4D8] text-xs uppercase">24-Hour Custom BoQ</h4>
            <p className="text-[10px] text-gray-500 font-medium">FBR GST/NTN Compliant Proposals</p>
          </Link>
        </div>
      </section>

      {/* Answer-First Verdict & Semantic Specification/Pricing Comparison Table (AEO / GEO Standard) */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 pt-6 lg:pt-10">
        <div className="bg-white rounded-3xl p-5 sm:p-8 border border-gray-200 shadow-xs space-y-5">
          <div>
            <span className="text-[#00B4D8] text-[10px] font-black uppercase tracking-[0.25em] block mb-1">
              Direct Engineering Verdict &amp; Reference Matrix
            </span>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-black text-[#1A2B4C] mb-2">
              {config.comparisonTable?.caption || `${config.heroHeading} — Technical Scope & Pakistan Price Matrix`}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium">
              <strong>Answer-First Summary:</strong>{' '}
              {config.answerFirstVerdict ||
                `${config.description} Backed by AV Live Communications (Est. 2011) with in-house engineering teams in Lahore (Johar Town HQ), Karachi (Clifton), and Islamabad (Blue Area), official OEM warranties, FBR GST/NTN invoicing, and a 15-minute technical response SLA.`}
            </p>
          </div>

          <div className="overflow-x-auto bg-[#F8F9FA] rounded-2xl p-3 sm:p-5 border border-gray-100">
            <table className="w-full min-w-[560px] text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-[#1A2B4C] font-black uppercase tracking-wider text-[11px]">
                  {(config.comparisonTable?.headers || [
                    'Deployment Tier',
                    'Recommended Hardware / Production Stack',
                    'Coverage & Technical Spec',
                    'Reference PKR Investment',
                  ]).map((h, i) => (
                    <th key={i} className="py-2.5 px-3 first:pl-1 last:pr-1">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/70 text-slate-700">
                {(config.comparisonTable?.rows || (
                  config.pillar === 'Video Conferencing'
                    ? [
                        ['Huddle & Focus Room (2–6 Pax)', 'Poly Studio R30 / Logitech Rally Bar Mini / Yealink UVC40', '4K 120° Auto-Framing + 4.5m Beamforming Mic', 'Rs. 195,000 – Rs. 485,000'],
                        ['Medium Conference Room (8–14 Pax)', 'Logitech Rally Bar / Poly Studio X52 / Cisco Room Bar', '20MP 4K AI Director + Expansion Table Mic', 'Rs. 640,000 – Rs. 1,250,000'],
                        ['Executive Boardroom (16–30 Pax)', 'Polycom Group 500 / Poly Studio X72 / Cisco Room Kit Plus', '12x Optical PTZ / Dual 4K + Ceiling/Table Array', 'Rs. 1,150,000 – Rs. 2,850,000'],
                      ]
                    : [
                        ['Corporate Townhall & AGM Package', 'P2.5 3840Hz SMD LED Wall + Line-Array PA + Bosch Mics', '100–300 Delegates • 2-Cam HD SDI Hybrid Bridge', 'Rs. 250,000 – Rs. 550,000'],
                        ['Product Launch & 3D Hologram Gala', 'Curved SMD LED Stage + 3D Hologram Display + 24x DMX Lights', '300–1,000+ Guests • 4-Cam 4K Broadcast Switching', 'Rs. 750,000 – Rs. 2,500,000'],
                        ['International Expo & Convention', 'Custom 3D Truss Pavilion + Simultaneous Interpretation', 'Multi-Hall Venue • Standby Broadcast Engineers', 'Rs. 950,000 – Rs. 4,200,000+'],
                      ]
                )).map((row, rIdx) => (
                  <tr key={rIdx}>
                    {row.map((cell, cIdx) => (
                      <td
                        key={cIdx}
                        className={`py-3 px-3 first:pl-1 last:pr-1 ${
                          cIdx === 0 || cIdx === row.length - 1 ? 'font-bold text-[#1A2B4C]' : ''
                        }`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Feature Specification Grid */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 py-8 lg:py-12">
        <div className="text-center mb-6 lg:mb-9">
          <span className="text-[#00B4D8] text-[10px] font-black uppercase tracking-[0.25em] block mb-1">Service Breakdown</span>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#1A2B4C]">What Sets AV Live Solutions Apart</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {config.features.map((feat, idx) => (
            <div key={idx} className="bg-white p-5 lg:p-6 rounded-2xl shadow-xs border border-gray-100 hover:shadow-md transition-all flex flex-col">
              <div className="w-10 h-10 bg-blue-50 text-[#00B4D8] rounded-xl flex items-center justify-center font-black mb-4">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="font-bold text-[#1A2B4C] text-lg leading-snug">{feat}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* Localized Proof (Case Studies in Johar Town, DHA, Clifton & Blue Area) */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-gray-200 shadow-sm">
          <span className="text-[#00B4D8] text-xs font-black uppercase tracking-[0.3em] block mb-2">Localized Proof</span>
          <h2 className="text-2xl md:text-3xl font-black text-[#1A2B4C] mb-8">
            Recent Enterprise Installations &amp; Events in Johar Town, DHA, Clifton &amp; Blue Area
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#F8F9FA] border border-gray-200">
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-[#00B4D8] mb-2">
                <MapPin size={12} /> Johar Town &amp; DHA, Lahore
              </span>
              <h3 className="font-black text-[#1A2B4C] text-base mb-2">30-Person Executive Boardroom &amp; Hybrid Townhall</h3>
              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                Deployed Polycom Group 500 &amp; Poly Studio X72 video bars, 86&quot; Horion interactive flat panel displays, and live SMD LED hybrid streaming.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-[#F8F9FA] border border-gray-200">
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-[#00B4D8] mb-2">
                <MapPin size={12} /> Clifton &amp; Shahrah-e-Faisal, Karachi
              </span>
              <h3 className="font-black text-[#1A2B4C] text-base mb-2">Cisco Room Kit Installation &amp; Multi-Camera Broadcast</h3>
              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                Commissioned multi-floor Cisco Room Kit Plus endpoints, Grandstream UCM6308 VoIP PBX, and 4-camera SDI corporate event broadcasting.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-[#F8F9FA] border border-gray-200">
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-[#00B4D8] mb-2">
                <MapPin size={12} /> Blue Area, Islamabad
              </span>
              <h3 className="font-black text-[#1A2B4C] text-base mb-2">Public Sector Command Center &amp; 3D Hologram Stage</h3>
              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                Engineered Bosch digital conference microphone arrays, fine-pitch P2.5 LED walls, and 3D hologram display stages with standby engineers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Silo Rule 1 & Rule 3: Pillar-to-Cluster Hardware Ecosystem Links & 3D Room Designer CTA */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-gray-200 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-100 pb-6">
            <div>
              <span className="text-[#00B4D8] text-xs font-black uppercase tracking-[0.3em] block mb-1">Pillar-to-Cluster Hardware Matrix</span>
              <h2 className="text-2xl md:text-3xl font-black text-[#1A2B4C]">
                Verified Enterprise Hardware Clusters &amp; 3D Room Designer
              </h2>
            </div>
            <Link
              to="/room-designer"
              className="inline-flex items-center gap-2 bg-[#00B4D8] hover:bg-[#1A2B4C] text-white font-black px-6 py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all shrink-0 shadow-md"
            >
              <span>3D Room Designer &amp; LED Calculator</span>
              <ArrowRight size={15} />
            </Link>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            Every turnkey deployment is powered by serialized, GS1-verified OEM hardware. Select a specific product cluster below to view PKR pricing and datasheets, or model your boardroom and SMD LED video wall in our <Link to="/room-designer" className="text-[#00B4D8] font-bold underline">Interactive 3D Room Designer</Link>:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-5 rounded-2xl bg-[#F8F9FA] border border-gray-200 space-y-2">
              <h3 className="font-black text-[#1A2B4C] uppercase tracking-wider">1. Boardroom Codecs</h3>
              <ul className="space-y-1.5 font-bold text-[#00B4D8]">
                <li><Link to="/product/polycom-realpresence-group-500-pakistan" className="hover:underline">Polycom RealPresence Group 500</Link></li>
                <li><Link to="/product/poly-studio-x72-pakistan" className="hover:underline">Poly Studio X72 / X70</Link></li>
                <li><Link to="/product/poly-studio-x52-pakistan" className="hover:underline">Poly Studio X52 &amp; G7500</Link></li>
                <li><Link to="/product/cisco-room-kit-plus-pakistan" className="hover:underline">Cisco Room Kit Plus &amp; Bar</Link></li>
                <li><Link to="/product/logitech-rally-bar-pakistan" className="hover:underline">Logitech Rally Bar &amp; Mini</Link></li>
              </ul>
            </div>
            <div className="p-5 rounded-2xl bg-[#F8F9FA] border border-gray-200 space-y-2">
              <h3 className="font-black text-[#1A2B4C] uppercase tracking-wider">2. Displays &amp; Projectors</h3>
              <ul className="space-y-1.5 font-bold text-[#00B4D8]">
                <li><Link to="/product/horion-k6a-bundle-special-offer" className="hover:underline">Horion K6a Interactive Panel</Link></li>
                <li><Link to="/av-equipment-rental" className="hover:underline">SMD LED Video Walls (P1.8–P3.9)</Link></li>
                <li><Link to="/product/benq-tk705i-pakistan" className="hover:underline">BenQ TK705i 4K Projector</Link></li>
                <li><Link to="/product/benq-w4100i-pakistan" className="hover:underline">BenQ W4100i Laser Projector</Link></li>
                <li><Link to="/product/bosch-paviro-pva-4cr12-pakistan" className="hover:underline">Bosch PAVIRO Audio System</Link></li>
              </ul>
            </div>
            <div className="p-5 rounded-2xl bg-[#F8F9FA] border border-gray-200 space-y-2">
              <h3 className="font-black text-[#1A2B4C] uppercase tracking-wider">3. VoIP, IP-PBX &amp; UC</h3>
              <ul className="space-y-1.5 font-bold text-[#00B4D8]">
                <li><Link to="/product/3cx-pro-8-sc-pakistan" className="hover:underline">3CX Phone System &amp; PRO 8</Link></li>
                <li><Link to="/product/freepbx-enterprise-pakistan" className="hover:underline">FreePBX Enterprise Server</Link></li>
                <li><Link to="/product/cisco-cucm-license-pakistan" className="hover:underline">Cisco CUCM CallManager</Link></li>
                <li><Link to="/product/grandstream-ucm6308-pakistan" className="hover:underline">Grandstream UCM6308 IP-PBX</Link></li>
                <li><Link to="/voip-service-providers" className="hover:underline">VoIP Service Providers Hub</Link></li>
              </ul>
            </div>
            <div className="p-5 rounded-2xl bg-[#F8F9FA] border border-gray-200 space-y-2">
              <h3 className="font-black text-[#1A2B4C] uppercase tracking-wider">4. Audio, Intercom &amp; PTZ</h3>
              <ul className="space-y-1.5 font-bold text-[#00B4D8]">
                <li><Link to="/product/axis-m3065-v-camera-pakistan" className="hover:underline">Axis M3065-V Network Camera</Link></li>
                <li><Link to="/category/speakerphones" className="hover:underline">Speakerphones &amp; Ceiling Mics</Link></li>
                <li><Link to="/product/2n-ip-vario-intercom-pakistan" className="hover:underline">2N IP Vario SIP Intercom</Link></li>
                <li><Link to="/product/axis-a8105-e-door-station-pakistan" className="hover:underline">Axis A8105-E Door Station</Link></li>
                <li><Link to="/solutions" className="hover:underline">Solutions by Industry Hub</Link></li>
              </ul>
            </div>
          </div>

          {/* Complete Keyword-Mapped Internal Link Directory (Services, Categories, Locations & SLA) */}
          <div className="pt-6 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-5 rounded-2xl bg-[#F8F9FA] border border-gray-200 space-y-2">
              <h3 className="font-black text-[#1A2B4C] uppercase tracking-wider">Core Business Services</h3>
              <ul className="space-y-1.5 font-bold text-[#00B4D8]">
                <li><Link to="/video-conference-in-pakistan" className="hover:underline">Video Conference in Pakistan (Pillar)</Link></li>
                <li><Link to="/event-management-in-pakistan" className="hover:underline">Event Management in Pakistan (Pillar)</Link></li>
                <li><Link to="/video-conferencing-solutions" className="hover:underline">Enterprise Video Conferencing Solutions</Link></li>
                <li><Link to="/corporate-event-management" className="hover:underline">Corporate Event Management</Link></li>
                <li><Link to="/services/hybrid-events" className="hover:underline">Hybrid Event Production</Link></li>
                <li><Link to="/av-equipment-rental" className="hover:underline">AV &amp; SMD Screen Equipment Rental</Link></li>
                <li><Link to="/live-streaming-services" className="hover:underline">Live Streaming Services</Link></li>
                <li><Link to="/services/boardroom-integration" className="hover:underline">Boardroom AV Integration &amp; Design</Link></li>
                <li><Link to="/services/expo-organizing" className="hover:underline">Expo &amp; Trade Show Organizing</Link></li>
                <li><Link to="/esports" className="hover:underline">e-Sports Arena Production</Link></li>
                <li><Link to="/3d-hologram" className="hover:underline">3D Hologram Display Stages</Link></li>
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-[#F8F9FA] border border-gray-200 space-y-2">
              <h3 className="font-black text-[#1A2B4C] uppercase tracking-wider">Product Category Hubs</h3>
              <ul className="space-y-1.5 font-bold text-[#00B4D8]">
                <li><Link to="/category/boardroom-codecs" className="hover:underline">Video Conference Systems / Codecs</Link></li>
                <li><Link to="/category/video-conferencing" className="hover:underline">All-in-One Video Bars / USB Bars</Link></li>
                <li><Link to="/category/touch-panels" className="hover:underline">Interactive Displays &amp; Touch Panels</Link></li>
                <li><Link to="/category/voip-phone-systems" className="hover:underline">IP Phones, VoIP &amp; Networking PoE</Link></li>
                <li><Link to="/category/speakerphones" className="hover:underline">Audio, Acoustic Calibration &amp; Ceiling Mics</Link></li>
                <li><Link to="/category/projectors" className="hover:underline">Projectors &amp; Laser Displays</Link></li>
                <li><Link to="/category/ptz-cameras" className="hover:underline">IP Cameras &amp; Auto-Tracking 4K PTZ Cameras</Link></li>
                <li><Link to="/category/intercom-paging-access" className="hover:underline">Intercom, Paging &amp; Access</Link></li>
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-[#F8F9FA] border border-gray-200 space-y-2">
              <h3 className="font-black text-[#1A2B4C] uppercase tracking-wider">Locations &amp; SLA Guarantees</h3>
              <ul className="space-y-1.5 font-bold text-[#00B4D8]">
                <li><Link to="/lahore" className="hover:underline">AV Live Lahore (AV Integration Services Lahore)</Link></li>
                <li><Link to="/karachi" className="hover:underline">AV Live Karachi Regional Hub</Link></li>
                <li><Link to="/islamabad" className="hover:underline">AV Live Islamabad Regional Hub</Link></li>
                <li><Link to="/contact" className="hover:underline">AV Support Lahore &amp; Karachi (15-Min SLA)</Link></li>
                <li><Link to="/services/boardroom-integration" className="hover:underline">Turnkey Installation &amp; AMC SLA Contracts</Link></li>
                <li><Link to="/programs/quote" className="hover:underline">24-Hour Custom BoQ / Custom Quote</Link></li>
                <li><Link to="/programs/government-education-pricing" className="hover:underline">FBR GST/NTN Compliant Proposals</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      {config.faqs.length > 0 && (
        <section className="bg-white py-16 border-t border-gray-200 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-black text-[#1A2B4C] text-center mb-10 uppercase tracking-wide">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {config.faqs.map((faq, idx) => (
                <div key={idx} className="bg-[#F8F9FA] p-6 rounded-2xl border border-gray-200">
                  <h3 className="font-bold text-[#1A2B4C] text-base mb-2">{faq.question}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Clear Contact Footer with Dual Hotlines (0321 425 6263 & 0339 0000 921) & Integrated Form */}
      <section className="max-w-7xl mx-auto px-4 mt-16">
        <div className="bg-[#1A2B4C] rounded-3xl p-8 md:p-14 text-white relative overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="text-[#00B4D8] text-xs font-black uppercase tracking-widest block mb-2">15-Minute Engineering SLA</span>
              <h2 className="text-3xl md:text-4xl font-black mb-4">Ready to Upgrade Your Events or Boardrooms?</h2>
              <p className="text-gray-300 mb-6 font-medium text-sm leading-relaxed">
                Contact Pakistan&apos;s leading AV engineers for a 15-minute technical consultation or custom Bill of Quantities (BoQ) within 24 hours.
              </p>
              <div className="flex flex-wrap gap-4 mb-6">
                <a href="tel:+923214256263" className="bg-white/10 hover:bg-white/20 border border-white/20 px-6 py-4 rounded-2xl flex items-center gap-3 font-black text-base">
                  <Phone size={20} className="text-[#00B4D8]" />
                  <span>0321 425 6263</span>
                </a>
                <a href="tel:+923390000921" className="bg-white/10 hover:bg-white/20 border border-white/20 px-6 py-4 rounded-2xl flex items-center gap-3 font-black text-base">
                  <Phone size={20} className="text-[#F26522]" />
                  <span>0339 0000 921</span>
                </a>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link to="/event-quote" className="bg-[#00B4D8] hover:bg-[#0096B4] text-white font-black px-6 py-3.5 rounded-xl transition-all uppercase tracking-wider text-xs">
                  Launch Interactive Quote Estimator
                </Link>
                <Link to="/services" className="bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3.5 rounded-xl border border-white/20 transition-all uppercase tracking-wider text-xs">
                  Explore All Services
                </Link>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setQuoteSubmitted(true);
              }}
              className="bg-white text-[#1A2B4C] p-6 sm:p-8 rounded-2xl space-y-4 shadow-xl"
            >
              <h3 className="font-black text-lg text-[#1A2B4C]">Request a 15-Minute Quote</h3>
              {quoteSubmitted ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                  Request received! An AV Live engineer will call you within 15 minutes, or reach us directly at 0321 425 6263 / 0339 0000 921.
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input type="text" required placeholder="Your Name *" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold focus:outline-none focus:border-[#00B4D8]" />
                    <input type="tel" required placeholder="Phone / WhatsApp *" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold focus:outline-none focus:border-[#00B4D8]" />
                  </div>
                  <input type="text" placeholder="Company & City (Lahore / Karachi / Islamabad)" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold focus:outline-none focus:border-[#00B4D8]" />
                  <textarea rows={2} placeholder="Describe your boardroom, VoIP PBX, or event requirement..." className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold focus:outline-none focus:border-[#00B4D8]" />
                  <button type="submit" className="w-full bg-[#1A2B4C] hover:bg-[#00B4D8] text-white font-black py-3.5 rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer">
                    Get 15-Minute Engineering Callback
                  </button>
                </>
              )}
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
