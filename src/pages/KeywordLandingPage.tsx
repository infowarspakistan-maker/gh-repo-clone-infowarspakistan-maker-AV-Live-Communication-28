import { useParams, Link } from 'react-router-dom';
import { ArrowRight, Phone, Calendar, Sparkles, CheckCircle2, ShieldCheck, MapPin, Video, Projector, Layers, Award, Clock } from 'lucide-react';
import { SEO } from '../components/SEO';

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
  features: string[];
  faqs: { question: string; answer: string }[];
}

const LANDING_CONFIGS: Record<string, LandingConfig> = {
  '3d-hologram': {
    title: '3D Hologram Events Pakistan | Stages, Visuals & Shows | AV Live',
    description: 'High-impact 3D hologram stage displays, holographic projections, and custom visual shows for corporate events, launches, and expos in Pakistan.',
    keywords: '3D hologram events Pakistan, holographic stage display Lahore, 3D hologram Karachi, hologram projection Islamabad, AV Live',
    heroHeading: '3D Hologram Stage Displays & Visual Productions in Pakistan',
    heroSubheading: 'Captivate your audience with floating 3D visuals, holographic product reveals, and futuristic stage projection mapping designed by Pakistan’s top AV engineers.',
    pillar: 'Event Management',
    primaryCtaText: 'Book a Free Event or Conference Room Consultation',
    primaryCtaLink: '/event-quote',
    locationCta: 'Book a Free Demo at Our Johar Town Experience Center',
    features: [
      'Custom 3D Content Creation & Holographic Rendering',
      'High-Brightness Fan Holograms & Mesh Screen Holographic Projection',
      'Turnkey Stage Truss, Lighting & Sound Integration',
      'On-Site Sound Engineers & Video Technicians (Lahore, Karachi, Islamabad)',
      'Proven Track Record across Corporate Expos & Product Launches'
    ],
    faqs: [
      {
        question: 'How does 3D Hologram technology work for corporate events in Pakistan?',
        answer: 'We utilize ultra-bright LED holographic fans and high-gain mesh projection displays to render transparent, floating 3D graphics and animations on stage without glasses.'
      },
      {
        question: 'Can 3D Holograms be deployed outdoors or in brightly lit venues?',
        answer: 'Yes! Our high-lumen optical projection arrays and high-density LED fan arrays are calibrated for indoor auditoriums, convention centers, and covered outdoor venues.'
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
    title: 'Video Conferencing Solutions in Pakistan | Boardroom AV | AV Live',
    description: 'Complete B2B video conferencing solutions in Pakistan. Authorized Zoom Rooms, Microsoft Teams Rooms, Cisco Webex, and Poly Studio integration.',
    keywords: 'Video conferencing in Pakistan, conference room AV setup, Zoom meeting room setup Pakistan, Microsoft Teams room setup Pakistan, Polycom Pakistan, AV Live',
    heroHeading: 'Enterprise Video Conferencing Solutions in Pakistan',
    heroSubheading: 'Connect your teams flawlessly across Lahore, Karachi, Islamabad, and international offices with certified Zoom Rooms, Microsoft Teams Rooms, and Poly/Yealink hardware.',
    pillar: 'Video Conferencing',
    primaryCtaText: 'Book a Free Event or Conference Room Consultation',
    primaryCtaLink: '/contact',
    locationCta: 'Call Now for a 15-Minute Response SLA',
    features: [
      'Certified Zoom Rooms & Microsoft Teams Rooms Integration',
      'AI-Powered Auto-Tracking 4K PTZ Cameras & Beamforming Ceiling Mics',
      'Acoustic Calibration & Echo Cancellation Optimization',
      'One-Touch Join Touch Panels & Cable-Free Screen Sharing',
      'Turnkey Installation & After-Sales SLA Support in Pakistan'
    ],
    faqs: [
      {
        question: 'Which video conferencing platforms does AV Live support in Pakistan?',
        answer: 'We support Zoom Rooms, Microsoft Teams Rooms, Cisco Webex, Google Meet, and Poly Studio Native Room Kits with full local warranty and support.'
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
  }
};

export function KeywordLandingPage() {
  const { keywordSlug } = useParams<{ keywordSlug: string }>();
  const slug = keywordSlug?.toLowerCase() || 'video-conferencing';
  const config = LANDING_CONFIGS[slug] || LANDING_CONFIGS['video-conferencing'];

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

      {/* Hero Banner */}
      <section className="relative bg-gradient-to-br from-[#1A2B4C] via-[#0F1B33] to-[#0A1120] text-white py-20 px-4 overflow-hidden border-b border-[#00B4D8]/20">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#00B4D8_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00B4D8]/10 border border-[#00B4D8]/30 text-[#00B4D8] font-black text-xs uppercase tracking-widest mb-6">
            <Sparkles size={16} />
            <span>{config.pillar} {config.city ? `• ${config.city}` : '• Pakistan-Wide'}</span>
          </div>

          <h1 className="text-3xl md:text-6xl font-black tracking-tight mb-6 leading-tight max-w-4xl text-white">
            {config.heroHeading}
          </h1>

          <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-3xl font-medium leading-relaxed">
            {config.heroSubheading}
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <Link 
              to={config.primaryCtaLink}
              className="bg-[#00B4D8] hover:bg-[#0096B4] text-white font-black px-8 py-5 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 text-base uppercase tracking-wider group"
            >
              <span>{config.primaryCtaText}</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>

            <a 
              href="tel:+923214256263"
              className="bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-5 rounded-2xl border border-white/20 transition-all flex items-center justify-center gap-3 text-base"
            >
              <Phone size={20} className="text-[#00B4D8]" />
              <span>+92 321 425 6263 (15-Min SLA)</span>
            </a>
          </div>

          {config.locationCta && (
            <div className="mt-8 flex items-center gap-2 text-sm text-[#00B4D8] font-bold bg-white/5 py-3 px-5 rounded-xl border border-white/10 inline-block">
              <MapPin size={18} />
              <span>{config.locationCta}</span>
            </div>
          )}
        </div>
      </section>

      {/* Trust & Spec Bar */}
      <section className="bg-white border-b border-gray-200 py-6 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-4 border-r border-gray-100 last:border-0 flex flex-col items-center">
            <Clock className="text-[#00B4D8] mb-2" size={28} />
            <h4 className="font-black text-[#1A2B4C] text-sm uppercase">24-Hour Proposal</h4>
            <p className="text-xs text-gray-500 font-medium">Fast Custom Quote Turnaround</p>
          </div>
          <div className="p-4 border-r border-gray-100 last:border-0 flex flex-col items-center">
            <ShieldCheck className="text-[#00B4D8] mb-2" size={28} />
            <h4 className="font-black text-[#1A2B4C] text-sm uppercase">Official Warranty</h4>
            <p className="text-xs text-gray-500 font-medium">Genuine Hardware & SLAs</p>
          </div>
          <div className="p-4 border-r border-gray-100 last:border-0 flex flex-col items-center">
            <Award className="text-[#00B4D8] mb-2" size={28} />
            <h4 className="font-black text-[#1A2B4C] text-sm uppercase">Certified Engineers</h4>
            <p className="text-xs text-gray-500 font-medium">Lahore • Karachi • Islamabad</p>
          </div>
          <div className="p-4 flex flex-col items-center">
            <Phone className="text-[#00B4D8] mb-2" size={28} />
            <h4 className="font-black text-[#1A2B4C] text-sm uppercase">15-Min Response</h4>
            <p className="text-xs text-gray-500 font-medium">Direct WhatsApp & Support</p>
          </div>
        </div>
      </section>

      {/* Feature Specification Grid */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <span className="text-[#00B4D8] text-xs font-black uppercase tracking-[0.3em] block mb-2">Technical Capabilities</span>
          <h2 className="text-3xl font-black text-[#1A2B4C]">What Sets AV Live Solutions Apart</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {config.features.map((feat, idx) => (
            <div key={idx} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col">
              <div className="w-12 h-12 bg-blue-50 text-[#00B4D8] rounded-2xl flex items-center justify-center font-black mb-6">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="font-bold text-[#1A2B4C] text-lg leading-snug">{feat}</h3>
            </div>
          ))}
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

      {/* Final Action Callout */}
      <section className="max-w-7xl mx-auto px-4 mt-16">
        <div className="bg-[#1A2B4C] rounded-3xl p-10 md:p-14 text-white text-center relative overflow-hidden shadow-2xl">
          <h2 className="text-3xl md:text-4xl font-black mb-4">Ready to Upgrade Your Events or Boardrooms?</h2>
          <p className="text-gray-300 max-w-2xl mx-auto mb-8 font-medium">
            Contact Pakistan's leading AV engineers for a free consultation or custom quote within 24 hours.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              to="/event-quote" 
              className="bg-[#00B4D8] hover:bg-[#0096B4] text-white font-black px-8 py-4 rounded-xl transition-all uppercase tracking-wider text-sm"
            >
              Get a Custom Quote in 24 Hours
            </Link>
            <Link 
              to="/contact" 
              className="bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-4 rounded-xl border border-white/20 transition-all uppercase tracking-wider text-sm"
            >
              View Our Event Portfolio & Case Studies
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
