import {
  getCanonicalProductSlug,
  PRODUCT_GMC_METADATA,
  buildFallbackProductFromGmcMeta,
  resolveProductPricing,
} from './gmc-feed';
import { FALLBACK_SERVICES_CATALOG } from './services-catalog';

export const SITEMAP_BASE_URL = 'https://avlive.com.pk';

export interface BlogComparisonTable {
  caption: string;
  headers: string[];
  rows: string[][];
}

export interface BlogFaqItem {
  q: string;
  a: string;
}

export interface BlogRelatedLink {
  label: string;
  path: string;
}

export interface BlogCatalogEntry {
  id: number | string;
  slug: string;
  title: string;
  date: string;
  publishedIso: string;
  category: string;
  readTime: string;
  excerpt: string;
  answerFirstSummary?: string;
  comparisonTable?: BlogComparisonTable;
  faqs?: BlogFaqItem[];
  relatedLinks?: BlogRelatedLink[];
  content: string[];
  image: string;
  isPublished?: boolean;
  isActive?: boolean;
  updatedAt?: any;
  publishedAt?: any;
}

export const FALLBACK_BLOG_CATALOG: BlogCatalogEntry[] = [
  {
    id: 1,
    slug: 'future-of-video-conferencing-pakistan-2026',
    title: 'The Future of Video Conferencing in Pakistan: Trends to Watch in 2026',
    date: 'July 2026',
    publishedIso: '2026-07-15',
    category: 'Video Conferencing',
    readTime: '6 min read',
    excerpt:
      'As Pakistan embraces digital transformation, video conferencing has become core infrastructure for organizations. From AI-driven meeting experiences to secure local platforms like "KALAAM", the landscape is evolving rapidly. At AV Live, we\'re at the forefront, delivering solutions from Cisco Webex and Polycom that "just work" without requiring technical expertise. In this post, we explore the top trends shaping hybrid work and secure communications in Pakistan.',
    answerFirstSummary:
      'In 2026, enterprise video conferencing in Pakistan is defined by dual-4K AI speaker-tracking bars (Poly Studio X70/X72, Logitech Rally Bar) and standards-based H.323/SIP codecs (Polycom RealPresence Group 500, Cisco Room Kit Plus) certified for Microsoft Teams Rooms and Zoom Rooms with local PTA compliance.',
    comparisonTable: {
      caption: '2026 Pakistan Enterprise Video Conferencing Architecture Matrix',
      headers: ['Room Tier', 'Recommended System', 'Camera Optics', 'Mic Pickup Range', 'Reference Price (PKR)'],
      rows: [
        ['Huddle Room (2–6 Pax)', 'Poly Studio USB / Logitech Rally Bar Mini', '4K 120° FOV Electronic Pan-Tilt', '4.5m – 5m Beamforming', 'Rs. 210,000 – 485,000'],
        ['Medium Boardroom (8–14 Pax)', 'Logitech Rally Bar / Poly Studio X52', '4K 15x HD Zoom / DirectorAI', '6m – 7m + Expansion Pod', 'Rs. 650,000 – 980,000'],
        ['Executive Boardroom (14–28 Pax)', 'Polycom Group 500 / Poly Studio X72 / Cisco Room Kit Plus', '12x Optical PTZ / Dual 4K Lenses', '7.6m+ Ceiling / Table Array', 'Rs. 1,150,000 – 2,450,000']
      ]
    },
    faqs: [
      {
        q: 'Which video conferencing system is best for large executive boardrooms in Pakistan?',
        a: 'For 14 to 28-person boardrooms in Lahore, Karachi, and Islamabad, the Polycom RealPresence Group 500 (with EagleEye IV 12x PTZ camera), Poly Studio X72, and Cisco Room Kit Plus deliver the best optical zoom and multi-microphone acoustic clarity.'
      },
      {
        q: 'Are Poly, Cisco, and Logitech video bars compatible with both Zoom and Microsoft Teams?',
        a: 'Yes. Modern appliance bars from HP Poly, Logitech, Cisco, and Yealink run native Zoom Rooms and Microsoft Teams Rooms (MTR) without requiring an external room PC, while also supporting USB BYOD mode.'
      }
    ],
    relatedLinks: [
      { label: 'Polycom RealPresence Group 500', path: '/product/polycom-realpresence-group-500-pakistan' },
      { label: 'Poly Studio X72 Large Room Bar', path: '/product/poly-studio-x72-pakistan' },
      { label: 'Logitech Rally Bar Pakistan', path: '/product/logitech-rally-bar-pakistan' },
      { label: 'Video Conferencing Hardware Category', path: '/category/video-conferencing' }
    ],
    content: [
      'Enterprise video conferencing in Pakistan has shifted from temporary webcams to permanent, multi-camera boardroom infrastructure powered by HP Poly (Polycom RealPresence Group 500 & Poly Studio X70), Logitech Rally Bar, and Cisco Room Kits.',
      'AI-driven speaker framing (Poly DirectorAI and Logitech RightSight 2) automatically tracks active speakers across large 20-seat executive boardrooms in Lahore, Karachi, and Islamabad without manual PTZ joystick intervention.',
      'Organizations in banking, government, and enterprise sectors increasingly demand Dual-Display 4K codecs, acoustic echo cancellation, and native Zoom Rooms and Microsoft Teams Rooms certification backed by local nationwide SLA support from AV Live Communications.'
    ],
    image: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 2,
    slug: 'ip-phones-vs-softphones-pakistan',
    title: 'IP Phones vs. Softphones: Which Is Right for Your Business?',
    date: 'June 2026',
    publishedIso: '2026-06-22',
    category: 'IP Phones & VoIP',
    readTime: '5 min read',
    excerpt:
      'Choosing between a physical IP phone and a software-based softphone depends on your team\'s workflow, security needs, and budget. Desk IP phones remain essential for small businesses in 2026, offering reliability, superior audio quality, and dedicated features. We break down the pros and cons of each, helping you make the right decision for your organization.',
    answerFirstSummary:
      'Physical PoE SIP desk phones (Cisco 8841, Yealink T46S, Polycom VVX 250, Grandstream GXP2170) provide 99.999% uptime on isolated voice VLANs with hardware acoustic echo cancellation, whereas softphones (3CX, Grandstream Wave) suit mobile field teams. Most Pakistani enterprises deploy a hybrid 70% desk IP phone + 30% mobile softphone architecture.',
    comparisonTable: {
      caption: 'Hardware SIP IP Phones vs. Enterprise Softphones Comparison',
      headers: ['Evaluation Metric', 'Hardware PoE IP Phones (Yealink / Poly / Cisco)', 'Software Softphones (3CX / Wave App)'],
      rows: [
        ['Network Reliability', 'Dedicated Voice VLAN + PoE backup (independent of PC OS crashes)', 'Dependent on laptop Wi-Fi/OS stability and USB headset battery'],
        ['Audio Processing', 'Dedicated DSP chip with Acoustic Fence / HD Opus codec', 'Host CPU audio processing'],
        ['Upfront Endpoint Cost (PKR)', 'Rs. 16,500 – Rs. 85,000 per desk unit', 'Rs. 0 hardware (requires Rs. 15,000+ ANC headset)'],
        ['Best Deployment Role', 'Receptionists, C-Suite Executives, Banking Counters, Call Centers', 'Remote Sales Teams, Field Engineers, Hybrid Staff']
      ]
    },
    relatedLinks: [
      { label: 'Enterprise IP Phones Catalog', path: '/category/ip-phones' },
      { label: 'VoIP Phone Systems & IP PBX', path: '/category/voip-phone-systems' },
      { label: 'Grandstream UCM6308 IP PBX', path: '/product/grandstream-ucm6308-pakistan' },
      { label: '3CX Pro Enterprise Licensing', path: '/product/3cx-pro-8-sc-pakistan' }
    ],
    content: [
      'When deploying an enterprise SIP PBX such as Grandstream UCM6308, 3CX Enterprise, or FreePBX in Pakistan, IT directors frequently weigh dedicated PoE desk IP phones against mobile/desktop softphones.',
      'Hardware SIP endpoints from Yealink, Poly, Cisco, and Fanvil operate on isolated voice VLANs with hardware acoustic echo cancellation and QoS prioritization, ensuring crystal-clear call quality even during workstation reboots.',
      'Hybrid deployments combine executive gigabit color IP phones on desks with encrypted 3CX or Grandstream Wave softphone apps for traveling field engineers.'
    ],
    image: 'https://images.unsplash.com/photo-1563690325150-10aa17ff983e?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 3,
    slug: 'how-to-choose-video-conferencing-equipment',
    title: 'How to Choose the Right Video Conferencing Equipment for Your Meeting Rooms',
    date: 'June 2026',
    publishedIso: '2026-06-08',
    category: 'Video Conferencing',
    readTime: '7 min read',
    excerpt:
      'The best video conferencing equipment depends less on the camera alone and more on room size, audio coverage, display use, and meeting workflow. In this comprehensive guide, we walk you through the four things to check first: audio pickup, camera framing, display clarity, and connection simplicity. Whether you need a 4-person huddle room or a 14-person boardroom, AV Live has the solution.',
    answerFirstSummary:
      'Match your video conferencing hardware to room seating and table length: use wide-angle 120° USB/appliance bars (Poly Studio USB, Rally Bar Mini) for 2–6 person huddle rooms, dual-camera AI bars (Poly Studio X52, Logitech Rally Bar) for 8–12 person medium rooms, and optical PTZ codecs (Polycom Group 500, Poly Studio X72, Cisco Room Kit Plus) for 14–30+ seat boardrooms.',
    relatedLinks: [
      { label: 'Large Boardroom Systems', path: '/category/large-room' },
      { label: 'Interactive 3D Room Designer', path: '/room-designer' },
      { label: 'Hardware Side-by-Side Comparison', path: '/compare' }
    ],
    content: [
      'Selecting the right video conferencing hardware starts with room geometry and seating capacity. Huddle rooms (2–6 seats) thrive with all-in-one USB/appliance bars like the Poly Studio USB or Logitech MeetUp.',
      'Medium-to-large boardrooms (8–20+ seats) require optical PTZ zoom and expansion table microphones—such as the Polycom RealPresence Group 500 with EagleEye IV 12x camera, Poly Studio X70, or Yealink MeetingBar A30.',
      'Always verify native platform compatibility (BYOD USB-C, Zoom Rooms, or Microsoft Teams Rooms) and ensure expansion microphone coverage reaches every participant within a 6-meter radius.'
    ],
    image: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 4,
    slug: 'understanding-public-address-systems-pakistan',
    title: 'Understanding Public Address Systems: Components Every Facility Needs',
    date: 'May 2026',
    publishedIso: '2026-05-19',
    category: 'AV Integration',
    readTime: '5 min read',
    excerpt:
      'A modern public address system in 2026 consists of five tightly integrated components. From microphones and amplifiers to speakers and network infrastructure, every element plays a critical role. We explain how IP-based PA systems are transforming communication in factories, schools, and commercial buildings across Pakistan.',
    answerFirstSummary:
      'A commercial Public Address (PA) and Voice Evacuation system in Pakistan requires five core layers: EN 54-16 zone controllers (Bosch PAVIRO, ITC Audio), 100V Class-D power amplifiers, multi-zone gooseneck paging stations, acoustic ceiling/horn loudspeakers, and SIP intercom gateways integrated with your facility IP PBX and fire alarm panel.',
    relatedLinks: [
      { label: 'SIP Intercom, Paging & PA Category', path: '/category/intercom-paging-access' },
      { label: 'Bosch PAVIRO Controller Pakistan', path: '/product/bosch-paviro-pva-4cr12-pakistan' },
      { label: '2N IP Vario Door Intercom', path: '/product/2n-ip-vario-intercom-pakistan' }
    ],
    content: [
      'Commercial facilities, universities, hospitals, and industrial plants across Pakistan rely on 100V line and SIP-enabled IP Public Address (PA) systems from Bosch, ITC Audio, and 2N.',
      'A complete voice evacuation and paging architecture integrates multi-zone mixer amplifiers, gooseneck paging consoles, ceiling/horn loudspeakers, and SIP intercom gateways linked directly to your IP PBX.',
      'Networked IP audio allows centralized scheduling, automated emergency alerts, and crystal-clear voice announcements across multi-building campuses.'
    ],
    image: 'https://images.unsplash.com/photo-1520166012956-add9ba0ee3f4?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 5,
    slug: 'hybrid-events-101-av-integration-pakistan',
    title: 'Hybrid Events 101: How to Engage Both In-Person and Virtual Audiences',
    date: 'May 2026',
    publishedIso: '2026-05-04',
    category: 'Events & Expo',
    readTime: '6 min read',
    excerpt:
      'Hybrid events are here to stay. Combining live audiences with remote participants requires robust AV infrastructure, seamless streaming, and interactive tools. At AV Live, we specialize in end-to-end hybrid event solutions, from SMD displays and PA systems to live streaming and audience engagement platforms.',
    answerFirstSummary:
      'Turnkey hybrid event production in Pakistan combines physical stage engineering (P2.5 SMD LED video walls, 3D hologram projection stages, line-array PA sound) with multi-camera 4K PTZ broadcast switching and acoustic mix-minus routing so remote Zoom, Microsoft Teams, and YouTube audiences interact with zero echo or latency.',
    relatedLinks: [
      { label: 'Hybrid Event Production Service', path: '/services/hybrid-events' },
      { label: '3D Hologram Stage Displays', path: '/3d-hologram' },
      { label: 'Request a 24-Hour Event Quote', path: '/event-quote' }
    ],
    content: [
      'Modern corporate townhalls, product launches, and international expos require broadcast-grade hybrid event production that bridges physical venues in Lahore, Karachi, and Islamabad with global virtual attendees.',
      'AV Live deploys P2.5 indoor SMD LED walls, 3D hologram stage displays, multi-camera PTZ switching, digital wireless microphone arrays, and low-latency Zoom/Teams/YouTube simulcast encoders.',
      'Redundant audio feeds and dedicated acoustic mix-minus routing ensure remote keynote speakers interact naturally with the live auditorium without echo or latency.'
    ],
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 6,
    slug: 'av-live-communications-15-years-pakistan',
    title: 'AV Live Communications: 15 Years of Unifying People and Ideas',
    date: 'April 2026',
    publishedIso: '2026-04-12',
    category: 'Company News',
    readTime: '4 min read',
    excerpt:
      'Founded in 2010, AV Live has grown from a visionary startup to a trusted leader in Pakistan\'s AV industry. With offices in Lahore and Karachi, a team of dedicated professionals, and partnerships with global brands like Polycom and Cisco, we continue to deliver award-winning solutions that drive business innovation and profitability.',
    answerFirstSummary:
      'Established in 2010 with regional engineering hubs in Lahore, Karachi, and Islamabad, AV Live Communications is Pakistan\'s authorized distributor and turnkey systems integrator for HP Poly (Polycom), Cisco, Logitech, Yealink, Bosch, Jabra, and commercial 3D hologram & corporate event productions.',
    relatedLinks: [
      { label: 'About AV Live Communications', path: '/about' },
      { label: 'Authorized Enterprise Brands', path: '/brands' },
      { label: 'Contact Regional Engineering Teams', path: '/contact' }
    ],
    content: [
      'For over 15 years, AV Live Communications has engineered mission-critical audio-visual, unified communications, and corporate event infrastructures across Pakistan.',
      'As an authorized enterprise partner for HP Poly (Polycom), Logitech, Cisco, Yealink, Grandstream, Bosch, and Jabra, we combine genuine hardware distribution with certified acoustic and network engineering.',
      'From smart boardroom integration and VoIP telephony to nationwide corporate events and 3D hologram productions, our mission remains connecting teams with zero downtime.'
    ],
    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32b7?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 7,
    slug: 'logitech-rally-bar-vs-poly-studio-x50-pakistan',
    title: 'Logitech Rally Bar vs. Poly Studio X50 & X52: Which Video Bar Wins for Pakistani Boardrooms?',
    date: 'October 2026',
    publishedIso: '2026-10-18',
    category: 'Video Conferencing',
    readTime: '8 min read',
    excerpt:
      'Comparing Logitech Rally Bar (960-001308) against HP Poly Studio X50 and Poly Studio X52 for medium-to-large conference rooms in Pakistan. See side-by-side optical zoom, microphone expansion, AI speaker framing, and official PKR pricing.',
    answerFirstSummary:
      'Choose the Logitech Rally Bar (960-001308) if your boardroom requires motorized optical PTZ lens zoom (15x total zoom) and up to 4 daisy-chained Rally Mic Pods for long tables (12–20 seats). Choose the Poly Studio X50 or X52 if you want faster all-in-one electronic DirectorAI framing, Poly NoiseBlockAI acoustic fencing, and a lower total cost of ownership for 6–12 person medium rooms.',
    comparisonTable: {
      caption: 'Logitech Rally Bar vs. HP Poly Studio X50 / X52 Technical & PKR Price Comparison',
      headers: ['Specification', 'Logitech Rally Bar (960-001308)', 'HP Poly Studio X50 / X52', 'Polycom RealPresence Group 500'],
      rows: [
        ['Ideal Room Capacity', 'Medium to Large (10–20 Seats)', 'Medium Boardroom (6–12 Seats)', 'Large Executive Room (14–28 Seats)'],
        ['Camera Sensor & Zoom', 'Motorized Optical PTZ + AI Viewfinder (15x HD Zoom)', '4K 20MP UltraHD 5x Digital Zoom with DirectorAI', 'EagleEye IV 12x Optical Motorized PTZ'],
        ['Microphone Pickup Range', '4.5m Base + up to 4 Rally Mic Pods (15m+ table coverage)', '6m Next-Gen Beamforming + 1 Expansion Mic', '7.6m RealPresence Table Microphone Array'],
        ['Audio Noise Suppression', 'RightSound AI Voice Leveling & Anti-Vibration Enclosure', 'Poly NoiseBlockAI & Acoustic Fence Technology', 'Polycom Siren 22 & Acoustic Clarity'],
        ['Native OS Support', 'CollabOS (Zoom Rooms, Microsoft Teams Rooms, USB BYOD)', 'Poly VideoOS (Zoom, Microsoft Teams, Google Meet, USB)', 'Standards H.323 / SIP + Zoom/Teams Interop'],
        ['Reference Price in Pakistan', 'Rs. 845,000 – Rs. 960,000 (Official Warranty)', 'Rs. 640,000 – Rs. 795,000 (Official Warranty)', 'Rs. 685,000 – Rs. 920,000 (Codec + 12x PTZ Kit)']
      ]
    },
    faqs: [
      {
        q: 'Does Logitech Rally Bar or Poly Studio X50 handle glass-walled boardrooms better?',
        a: 'Poly Studio X50 and X52 feature Poly Acoustic Fence and NoiseBlockAI, which create a virtual audio boundary that blocks hallway conversations through glass walls. Logitech Rally Bar excels when paired with table-mounted Rally Mic Pods in long reverberant rooms.'
      },
      {
        q: 'Can both Logitech Rally Bar and Poly Studio X50 switch between Zoom Rooms and laptop USB mode?',
        a: 'Yes, both support native appliance mode (Zoom Rooms / Microsoft Teams Rooms) as well as single-cable USB-C/HDMI BYOD mode so visiting guests can launch any meeting platform from their laptop.'
      }
    ],
    relatedLinks: [
      { label: 'Logitech Rally Bar Product Page', path: '/product/logitech-rally-bar-pakistan' },
      { label: 'Poly Studio X50 Product Page', path: '/product/poly-studio-x50-pakistan' },
      { label: 'Poly Studio X52 Product Page', path: '/product/poly-studio-x52-pakistan' },
      { label: 'Polycom RealPresence Group 500', path: '/product/polycom-realpresence-group-500-pakistan' }
    ],
    content: [
      'When corporate IT procurement teams in Lahore, Karachi, and Islamabad evaluate all-in-one video bars for 8-to-20 seat conference rooms, the shortlist almost always comes down to the Logitech Rally Bar (MPN: 960-001308) versus the HP Poly Studio X50 and X52.',
      'The Logitech Rally Bar stands out with its dual-camera architecture: a main motorized optical pan-tilt-zoom lens paired with a dedicated AI Viewfinder camera that continuously tracks room occupancy. Because it supports up to four daisy-chained Logitech Rally Mic Pods, it scales effortlessly across U-shaped and 20-person boardroom tables.',
      'Conversely, HP Poly Studio X50 and X52 lead in acoustic intelligence. Poly NoiseBlockAI suppresses keyboard typing, paper rustling, and HVAC hum in real time, while Acoustic Fence builds an invisible capture beam so voices outside glass partitions are never transmitted.',
      'AV Live Communications stocks both ecosystems with official Pakistan warranty, PTA compliance documentation, and turnkey installation across Lahore, Karachi, and Islamabad.'
    ],
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 8,
    slug: 'yealink-vs-cisco-video-conferencing-pakistan',
    title: 'Yealink vs. Cisco Room Kits: Enterprise Video Conferencing Comparison in Pakistan',
    date: 'October 2026',
    publishedIso: '2026-10-20',
    category: 'Video Conferencing',
    readTime: '8 min read',
    excerpt:
      'Detailed architectural comparison of Cisco Room Kit Plus / Room Bar against Yealink MeetingBar and HP Poly G7500 for banks, multinationals, and government ministries in Pakistan.',
    answerFirstSummary:
      'Cisco Room Kit Plus and Room Bar Pro are the gold standard for banks, defense agencies, and multinationals requiring hardware H.323/SIP encryption, Webex Control Hub telemetry, and native Microsoft Teams Rooms certification. Yealink and HP Poly Studio/Group series deliver 30%–45% lower acquisition cost with plug-and-play Teams/Zoom versatility for commercial enterprises.',
    comparisonTable: {
      caption: 'Cisco Room Kit Plus vs. HP Poly Studio X72 vs. Yealink Enterprise Comparison',
      headers: ['Feature / Requirement', 'Cisco Room Kit Plus / Pro', 'HP Poly Studio X72 / G7500', 'Yealink Enterprise Room Series'],
      rows: [
        ['Primary Target Sector', 'Commercial Banks, Defense, Multinationals, Government', 'Corporate Enterprises, Universities, Financial Hubs', 'SMEs, Growing Corporates, Multi-Branch Offices'],
        ['Camera Architecture', 'Quad Camera 5K Sensor Array + SpeakerTrack', 'Dual 4K 20MP Cameras (70° + 120° FOV) / EagleEye IV', 'Dual-Eye 4K AI Camera + Wireless Content Pod'],
        ['Security & Encryption', 'End-to-End AES-256 + H.323/SIP Standards + Control Hub', 'FIPS 140-2 Validated Crypto + Poly Lens Cloud', 'TLS/SRTP Encryption + Yealink Device Management'],
        ['Multi-Display Support', 'Dual / Triple 4K HDMI Output + Cisco Room Navigator', 'Dual 4K HDMI Output + TC8/TC10 Touch Controller', 'Dual 4K HDMI Output + Touch Console'],
        ['Estimated Turnkey Budget (PKR)', 'Rs. 1,650,000 – Rs. 3,200,000+', 'Rs. 950,000 – Rs. 1,850,000', 'Rs. 550,000 – Rs. 1,150,000']
      ]
    },
    faqs: [
      {
        q: 'Can Cisco Room Kit Plus join Microsoft Teams and Zoom meetings natively?',
        a: 'Yes. Current Cisco RoomOS devices are natively certified for Microsoft Teams Rooms (MTR) and support Webex, Zoom CRC/WebRTC interop, and standards-based SIP/H.323 dialing.'
      },
      {
        q: 'Which brand has faster local RMA and spare parts availability in Pakistan?',
        a: 'AV Live Communications maintains local buffer stock and RMA replacement units in Lahore, Karachi, and Islamabad for Cisco, HP Poly (Polycom), Logitech, and Yealink.'
      }
    ],
    relatedLinks: [
      { label: 'Cisco Room Kit Plus Pakistan', path: '/product/cisco-room-kit-plus-pakistan' },
      { label: 'Cisco Room Bar Pakistan', path: '/product/cisco-room-bar-pakistan' },
      { label: 'Poly Studio X72 Pakistan', path: '/product/poly-studio-x72-pakistan' },
      { label: 'Enterprise Boardroom Codecs', path: '/category/boardroom-codecs' }
    ],
    content: [
      'Financial institutions, oil and gas enterprises, and federal ministries in Islamabad and Karachi require video conferencing infrastructure that satisfies strict InfoSec audits while remaining effortless for executives to operate.',
      'Cisco Room Kit Plus and Room Kit Pro pair a multi-lens 5K Quad Camera bar with the powerful Cisco Codec Plus/Pro, delivering instantaneous speaker switching, people counting analytics, and hardware-level encryption.',
      'For organizations seeking native Microsoft Teams Rooms or Zoom Rooms without recurring enterprise licensing overhead, HP Poly Studio X72 and Poly G7500 provide modular camera and ceiling microphone scalability at a highly competitive PKR price point.',
      'Our certified network and AV engineers design, stage, and commission Cisco, Poly, and Yealink boardrooms nationwide with guaranteed SLA response times.'
    ],
    image: 'https://images.unsplash.com/photo-1585282263861-f55e341878f8?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 9,
    slug: 'boardroom-av-system-price-guide-pakistan',
    title: '6-to-30 Person Boardroom AV System BoM & Price Guide in Pakistan (2026)',
    date: 'October 2026',
    publishedIso: '2026-10-24',
    category: 'Video Conferencing',
    readTime: '9 min read',
    excerpt:
      'Complete Bill of Materials (BoM) and PKR pricing guide for designing 6-person huddle rooms, 14-person conference rooms, and 30-person executive boardrooms in Pakistan.',
    answerFirstSummary:
      'In Pakistan, a complete turnkey 4–6 person huddle room AV setup costs Rs. 240,000–Rs. 490,000; an 8–14 person executive conference room costs Rs. 680,000–Rs. 1,350,000; and a 16–30 person large boardroom with dual displays, 12x optical PTZ tracking cameras, and ceiling/table microphone arrays costs Rs. 1,450,000–Rs. 3,500,000+ including installation and acoustic tuning.',
    comparisonTable: {
      caption: '2026 Pakistan Conference Room Bill of Materials (BoM) & Turnkey Price Tiers',
      headers: ['Room Size & Dimensions', 'Core Video Codec / Bar', 'Audio & Control Hardware', 'Display Configuration', 'Turnkey BoM Price (PKR)'],
      rows: [
        ['4–6 Person Huddle Room (3m × 4m)', 'Poly Studio USB Bar or Logitech Rally Bar Mini', 'Built-in 6-Mic Beamforming Array + Auto-Framing', 'Single 65"–75" 4K Commercial Display', 'Rs. 240,000 – Rs. 490,000'],
        ['8–14 Person Conference Room (4.5m × 7m)', 'Logitech Rally Bar or Poly Studio X52', '1–2 Expansion Table Mic Pods + 10" Touch Controller', 'Single 85" Display or Dual 65" 4K Displays', 'Rs. 680,000 – Rs. 1,350,000'],
        ['16–24 Person Executive Boardroom (6m × 10m)', 'Polycom RealPresence Group 500 / Poly Studio X72 / Cisco Room Kit Plus', 'Ceiling Beamforming Mic Array or 3 Daisy-Chained Table Mics + Touch Panel', 'Dual 75"–85" 4K Displays or P1.8 Indoor LED Wall', 'Rs. 1,450,000 – Rs. 2,650,000'],
        ['25–40+ Seat Townhall / Training Room (8m × 14m+)', 'Cisco Room Kit Pro / Poly G7500 + Dual PTZ Cameras', 'Bosch / Shure Ceiling Array + QSC DSP + Ceiling Speakers', 'Laser Projector (7,000+ Lumens) or P2.5 SMD LED Video Wall', 'Rs. 2,800,000 – Rs. 5,500,000+']
      ]
    },
    faqs: [
      {
        q: 'What is included in AV Live’s turnkey boardroom installation fee in Pakistan?',
        a: 'Our turnkey deployment includes on-site acoustic survey, concealed HDMI/Cat6A cabling, wall/display mounting, SIP/Zoom/Teams room provisioning, DSP audio calibration, and staff training in Lahore, Karachi, and Islamabad.'
      },
      {
        q: 'Does AV Live provide FBR-compliant GST tax invoices and PPRA tender documentation?',
        a: 'Yes, all corporate and government quotations include official FBR GST/NTN invoicing, manufacturer authorization letters (MAL), and 1-to-3 year local replacement warranties.'
      }
    ],
    relatedLinks: [
      { label: 'Interactive 3D Conference Room Designer', path: '/room-designer' },
      { label: 'Request Official B2B BoM Quotation', path: '/programs/quote' },
      { label: 'Conference Room Solutions Hub', path: '/conference-room-solutions' },
      { label: 'Microsoft Teams Rooms Pakistan', path: '/microsoft-teams-rooms' }
    ],
    content: [
      'Budgeting accurately for a corporate meeting room upgrade requires accounting for four interdependent subsystems: the video codec/camera bar, microphone pickup geometry, display legibility, and one-touch room control.',
      'Undersizing a camera or relying on display speakers in a 20-foot boardroom is the #1 cause of echo and poor meeting intelligibility. Any table longer than 4.5 meters requires either expansion table microphones or a ceiling beamforming array.',
      'Use the Bill of Materials (BoM) matrix above to benchmark your organization\'s upcoming capex budget, or launch our interactive 3D Room Designer to generate an instant hardware schedule tailored to your exact room dimensions.'
    ],
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 10,
    slug: 'banking-healthcare-university-av-solutions-pakistan',
    title: 'Enterprise AV Architecture for Banks, Hospitals & Universities in Pakistan',
    date: 'October 2026',
    publishedIso: '2026-10-26',
    category: 'AV Integration',
    readTime: '7 min read',
    excerpt:
      'Industry-specific AV, VoIP, and visual communication blueprints for commercial banks, HEC universities, telemedicine hospitals, and public-sector command centers across Pakistan.',
    answerFirstSummary:
      'Industry vertical AV deployments in Pakistan require specialized compliance: commercial banks prioritize encrypted Cisco/Poly H.323 boardrooms and multi-branch Grandstream/3CX SIP PBXs; HEC universities deploy lecture-capture PTZ cameras and 7,000-lumen laser projectors; and hospitals utilize telemedicine carts and EN 54-16 Bosch IP public address systems.',
    comparisonTable: {
      caption: 'Industry Vertical AV & Unified Communications Blueprint (Pakistan)',
      headers: ['Industry Sector', 'Core Video & Collaboration Stack', 'Voice & Paging Infrastructure', 'Primary Compliance / SLA Requirement'],
      rows: [
        ['Commercial Banking & FinTech', 'Cisco Room Kit Plus / Polycom Group 500 + Touch Control', 'Cisco CUCM / Grandstream UCM6308 + Executive IP Phones', 'AES-256 Encryption, Multi-Branch SIP Trunking, 4-Hour Onsite SLA'],
        ['HEC Universities & Higher Ed', 'Poly Studio X52 + Hikvision/Poly Optical PTZ Lecture Cameras', 'Bosch PAVIRO Campus PA + Classroom Speakerphones', 'PPRA Tender Compliance, HEC Smart Classroom Standards'],
        ['Hospitals & Telemedicine', 'Mobile 4K Telemedicine Carts (Poly Studio USB + PTZ)', '2N SIP Cleanroom Intercoms + Multi-Zone Nurse Paging', 'Low-Latency High-CRI Diagnostic Video & Hygienic IP65 Endpoints'],
        ['Government & Command Centers', 'Poly G7500 / Cisco Pro + 24/7 SMD Video Wall Controllers', 'Delegated Bosch Discussion Microphones + Encrypted PBX', 'On-Premise Air-Gapped H.323/SIP Operation & Redundant Power']
      ]
    },
    relatedLinks: [
      { label: 'Government & HEC Education Pricing Program', path: '/programs/government-education-pricing' },
      { label: 'Commercial Laser Projectors', path: '/category/projectors' },
      { label: 'VoIP Phone Systems & IP PBX', path: '/category/voip-phone-systems' },
      { label: 'Bosch PAVIRO & SIP Paging', path: '/category/intercom-paging-access' }
    ],
    content: [
      'Different vertical industries in Pakistan face vastly different acoustic, network security, and regulatory requirements when deploying audio-visual and unified communications infrastructure.',
      'In the banking sector, boardrooms and treasury floors require standards-based H.323/SIP interoperability and encrypted voice VLANs across hundreds of nationwide branches.',
      'In higher education and healthcare, reliability, lecture recording integration, and campus-wide emergency paging take center stage. AV Live Communications provides dedicated vertical engineering teams and PPRA/tax-compliant procurement workflows for each sector.'
    ],
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 11,
    slug: 'shure-bosch-ceiling-microphones-vs-table-mics-pakistan',
    title: 'Ceiling Microphone Arrays vs. Table Microphones: Acoustic Guide for Pakistani Boardrooms',
    date: 'October 2026',
    publishedIso: '2026-10-28',
    category: 'AV Integration',
    readTime: '6 min read',
    excerpt:
      'Should your executive boardroom use ceiling beamforming microphone arrays or daisy-chained table microphones? Compare acoustic pickup, cable-free aesthetics, and PKR costs.',
    answerFirstSummary:
      'Choose table expansion microphones (Logitech Rally Mic Pods, Poly Expansion Mics) for the highest voice-to-reverberation ratio at 60% lower cost in standard boardrooms. Choose ceiling beamforming arrays or Bosch digital conference systems when your executive boardroom requires a 100% cable-free marble/wood table or flexible reconfigurable seating.',
    comparisonTable: {
      caption: 'Ceiling Beamforming Arrays vs. Table Expansion Mics vs. Gooseneck Conference Systems',
      headers: ['Audio Architecture', 'Table Aesthetics', 'Acoustic Environment Tolerance', 'Best Room Application', 'Relative Cost Tier'],
      rows: [
        ['Daisy-Chained Table Mic Pods (Poly / Logitech)', 'Minimal (1–4 compact pods on table)', 'Excellent in untreated or glass-walled rooms (close proximity)', '8–20 Person Standard Corporate Boardrooms', 'PKR Tier 1 (Most Cost-Effective)'],
        ['Ceiling Beamforming Microphone Arrays', '100% Cable-Free Table Surface', 'Requires RT60 < 0.6s acoustic treatment & low HVAC noise', 'Luxury C-Suite Boardrooms & Multipurpose Training Rooms', 'PKR Tier 3 (Premium DSP + Dante)'],
        ['Dedicated Chairman/Delegate Gooseneck Units (Bosch)', 'Dedicated push-to-talk console per seat', 'Highest speech intelligibility in massive halls (zero crosstalk)', '20–100+ Seat Ministries, Parliament & Board of Governors', 'PKR Tier 2–3 (Scales per seat)']
      ]
    },
    relatedLinks: [
      { label: 'Conference Speakerphones & Mic Arrays', path: '/category/speakerphones' },
      { label: 'Intercom, Paging & Bosch Audio', path: '/category/intercom-paging-access' },
      { label: 'Conference Room Solutions Pakistan', path: '/conference-room-solutions' }
    ],
    content: [
      'Audio intelligibility makes or breaks an executive video conference. Even a dual-4K camera bar cannot compensate for hollow, reverberant room audio caused by marble floors and glass partitions common in Pakistani corporate offices.',
      'Before specifying ceiling microphones, our acoustic engineers measure ambient HVAC noise (NC rating) and reverberation time (RT60). Where acoustic panels are not feasible, directional table microphone pods or Bosch chairman/delegate consoles deliver superior vocal isolation.',
      'Contact AV Live Communications for a complimentary acoustic assessment of your boardroom in Lahore, Karachi, or Islamabad.'
    ],
    image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80&w=800'
  }
];

export const STATIC_CORE_ROUTES: string[] = [
  '',
  '/sitemap',
  '/shop',
  '/brands',
  '/solutions',
  '/services',
  '/events-services',
  '/event-quote',
  '/esports',
  '/room-designer',
  '/contact',
  '/about',
  '/faqs',
  '/blog',
  '/compare',
  '/guides',
  '/reviews',
  '/returns',
  '/shipping',
  '/payment',
  '/rma',
  '/privacy-policy',
  '/terms-of-service',
  '/programs/quote',
  '/programs/blind-drop-shipping',
  '/programs/government-education-pricing',
  '/programs/fulfillment-services',
  '/programs/promotions',
  '/programs/provisioning-services',
  '/programs/reseller-program',
  '/voip-service-providers',
  '/3d-hologram',
  '/projection-mapping',
  '/video-conferencing',
  '/video-conferencing-solutions',
  '/video-conference-in-pakistan',
  '/corporate-event-management',
  '/live-streaming-services',
  '/av-equipment-rental',
  '/conference-room-solutions',
  '/zoom-rooms',
  '/microsoft-teams-rooms',
  '/lahore',
  '/karachi',
  '/islamabad',
  '/brands/poly',
  '/brands/cisco',
  '/brands/logitech',
  '/brands/yealink',
  '/brands/jabra',
  '/brands/bosch',
  '/brands/hikvision',
  '/brands/dahua',
  '/brands/axis',
  '/brands/grandstream',
  '/brands/fanvil',
  '/brands/2n',
  '/brands/epson',
  '/brands/benq',
  '/brands/optoma',
  '/brands/panasonic',
  '/brands/sony',
  '/brands/viewsonic',
  '/brands/uniview',
  '/brands/itc',
  '/brands/3cx',
  '/brands/freepbx',
  '/brands/sangoma',
  '/brands/horion',
  '/brands/google'
];

export const CANONICAL_CATEGORY_SLUGS: string[] = [
  'video-conferencing',
  'touch-panels',
  'large-room',
  'speakerphones',
  'boardroom-codecs',
  'ptz-cameras',
  'ip-phones',
  'voip-phone-systems',
  'projectors',
  'headsets',
  'ip-cameras',
  'intercom-paging-access'
];

export const PRIMARY_PRODUCT_CATEGORY_SLUGS = CANONICAL_CATEGORY_SLUGS;

export const PRIMARY_SERVICE_SLUGS: string[] = [
  'corporate-events',
  'hybrid-events',
  'boardroom-integration',
  'voip-telephony',
  'expo-organizing',
  'esports-events',
  'ai-development',
  'ai-agents-workers',
  'ai-automation'
];

export const PRIMARY_PILLAR_ROUTES: string[] = [
  '',
  '/shop',
  '/services',
  '/events-services',
  '/solutions',
  '/video-conferencing',
  '/video-conferencing-solutions',
  '/video-conference-in-pakistan',
  '/corporate-event-management',
  '/live-streaming-services',
  '/av-equipment-rental',
  '/conference-room-solutions',
  '/zoom-rooms',
  '/microsoft-teams-rooms',
  '/3d-hologram',
  '/projection-mapping',
  '/esports',
  '/voip-service-providers',
  '/room-designer',
  '/event-quote',
  '/lahore',
  '/karachi',
  '/islamabad'
];

export const NON_PRODUCT_CATEGORY_REDIRECTS: Record<string, string> = {
  about: '/about',
  compare: '/compare',
  faqs: '/faqs',
  guides: '/guides',
  payment: '/payment',
  returns: '/returns',
  reviews: '/reviews',
  rma: '/rma',
  shipping: '/shipping',
  blog: '/blog',
  contact: '/contact',
  'privacy-policy': '/privacy-policy',
  'terms-of-service': '/terms-of-service',
  'blind-drop-shipping': '/programs/blind-drop-shipping',
  'fulfillment-services': '/programs/fulfillment-services',
  'government-education-pricing': '/programs/government-education-pricing',
  promotions: '/programs/promotions',
  'provisioning-services': '/programs/provisioning-services',
  quote: '/programs/quote',
  'reseller-program': '/programs/reseller-program',
  'voip-service-providers': '/voip-service-providers',
  'corporate-events': '/services/corporate-events',
  'hybrid-events': '/services/hybrid-events',
  'expo-organizing': '/services/expo-organizing',
  'esports-events': '/services/esports-events',
  'ai-development': '/services/ai-development',
  'ai-agents-workers': '/services/ai-agents-workers',
  'ai-automation': '/services/ai-automation',
};

export const EXCLUDED_CATEGORY_SLUGS = new Set<string>(Object.keys(NON_PRODUCT_CATEGORY_REDIRECTS));

export const BLOG_LEGACY_SLUG_TO_CANONICAL: Record<string, string> = {
  '1': 'future-of-video-conferencing-pakistan-2026',
  '2': 'ip-phones-vs-softphones-pakistan',
  '3': 'how-to-choose-video-conferencing-equipment',
  '4': 'understanding-public-address-systems-pakistan',
  '5': 'hybrid-events-101-av-integration-pakistan',
  '6': 'av-live-communications-15-years-pakistan',
  '7': 'logitech-rally-bar-vs-poly-studio-x50-pakistan',
  '8': 'yealink-vs-cisco-video-conferencing-pakistan',
  '9': 'boardroom-av-system-price-guide-pakistan',
  '10': 'banking-healthcare-university-av-solutions-pakistan',
  '11': 'shure-bosch-ceiling-microphones-vs-table-mics-pakistan',
  'ip-phones-vs-softphones-business-guide': 'ip-phones-vs-softphones-pakistan',
  'choose-right-video-conferencing-equipment': 'how-to-choose-video-conferencing-equipment',
  'public-address-systems-components-guide': 'understanding-public-address-systems-pakistan',
  'hybrid-events-engagement-guide': 'hybrid-events-101-av-integration-pakistan',
  'av-live-15-years-anniversary': 'av-live-communications-15-years-pakistan',
};

export function resolveCanonicalBlogSlug(slugOrId?: string | number | null): string | null {
  if (slugOrId === undefined || slugOrId === null) return null;
  const raw = String(slugOrId).trim();
  if (!raw) return null;
  if (BLOG_LEGACY_SLUG_TO_CANONICAL[raw]) {
    return BLOG_LEGACY_SLUG_TO_CANONICAL[raw];
  }
  const lower = raw.toLowerCase();
  if (BLOG_LEGACY_SLUG_TO_CANONICAL[lower]) {
    return BLOG_LEGACY_SLUG_TO_CANONICAL[lower];
  }
  const matched = FALLBACK_BLOG_CATALOG.find(
    fb => fb.slug === lower || String(fb.id) === lower
  );
  if (matched) return matched.slug;
  return lower;
}

export function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function formatSitemapDate(rawValue: any, fallbackIsoDate: string): string {
  if (!rawValue) return fallbackIsoDate;
  try {
    let parsedDate: Date | null = null;
    if (typeof rawValue.toDate === 'function') {
      const d = rawValue.toDate();
      if (d instanceof Date && !isNaN(d.getTime())) parsedDate = d;
    } else if (typeof rawValue._seconds === 'number') {
      const d = new Date(rawValue._seconds * 1000);
      if (!isNaN(d.getTime())) parsedDate = d;
    } else if (rawValue instanceof Date && !isNaN(rawValue.getTime())) {
      parsedDate = rawValue;
    } else if (typeof rawValue === 'string' && rawValue.trim()) {
      const d = new Date(rawValue);
      if (!isNaN(d.getTime())) parsedDate = d;
    }
    if (parsedDate) {
      const iso = parsedDate.toISOString().split('T')[0];
      // Ensure lastmod is never older than the October 2026 SSR/Schema overhaul so Googlebot recrawls updated pages
      return iso < '2026-10-30' ? fallbackIsoDate : iso;
    }
  } catch {
    // Fall back to default date
  }
  return fallbackIsoDate;
}

export interface DynamicSitemapInput {
  products?: Array<Record<string, any>>;
  categories?: Array<Record<string, any>>;
  services?: Array<Record<string, any>>;
  blogPosts?: Array<Record<string, any>>;
}

export interface DynamicSitemapResult {
  xml: string;
  counts: {
    total: number;
    staticPages: number;
    products: number;
    categories: number;
    services: number;
    blogs: number;
  };
}

/**
 * Generates a valid, deduplicated XML 1.0 sitemap that explicitly lists all
 * primary product categories and enterprise services at top crawl priority,
 * followed by active products, brand hubs, blog guides, and static pages.
 */
export function buildDynamicSitemapXml(input: DynamicSitemapInput = {}): DynamicSitemapResult {
  const today = new Date().toISOString().split('T')[0];
  const seenUrls = new Set<string>();
  const urlBlocks: string[] = [];

  const counts = {
    total: 0,
    staticPages: 0,
    products: 0,
    categories: 0,
    services: 0,
    blogs: 0
  };

  const appendUrl = (
    locPath: string,
    priority: string,
    bucket: keyof Omit<typeof counts, 'total'>,
    customLastMod?: string,
    changefreq: 'daily' | 'weekly' | 'monthly' = 'weekly'
  ): boolean => {
    const cleanPath = locPath === '/' ? '' : locPath.replace(/\/+$/, '');
    const fullLoc = `${SITEMAP_BASE_URL}${cleanPath}`;
    if (seenUrls.has(fullLoc)) return false;
    seenUrls.add(fullLoc);

    const lastmod = escapeXml(customLastMod || today);
    urlBlocks.push(
      [
        '  <url>',
        `    <loc>${escapeXml(fullLoc)}</loc>`,
        `    <lastmod>${lastmod}</lastmod>`,
        `    <changefreq>${changefreq}</changefreq>`,
        `    <priority>${priority}</priority>`,
        '  </url>'
      ].join('\n')
    );

    counts.total++;
    counts[bucket]++;
    return true;
  };

  // 1. Primary Commercial Pillar Hubs (Homepage, Shop, Services, Solutions, Geo & Solution Pillars)
  for (const route of PRIMARY_PILLAR_ROUTES) {
    const priority = route === '' ? '1.0' : '0.9';
    const freq = route === '' || route === '/shop' || route === '/services' ? 'daily' : 'weekly';
    appendUrl(route, priority, 'staticPages', today, freq);
  }

  // 2. Explicit Primary Product Categories (/category/*) — Top Crawl Depth Priority (0.9)
  for (const slug of PRIMARY_PRODUCT_CATEGORY_SLUGS) {
    appendUrl(`/category/${slug}`, '0.9', 'categories', today, 'daily');
  }
  if (Array.isArray(input.categories)) {
    for (const cat of input.categories) {
      if (cat.isActive === false) continue;
      const slug = String(cat.slug || cat.id || '').trim();
      if (!slug || (cat.type && cat.type !== 'product') || EXCLUDED_CATEGORY_SLUGS.has(slug)) {
        continue;
      }
      const lastmod = formatSitemapDate(cat.updatedAt || cat.createdAt, today);
      appendUrl(`/category/${slug}`, '0.9', 'categories', lastmod, 'daily');
    }
  }

  // 3. Explicit Primary Enterprise Services (/services/*) — Top Crawl Depth Priority (0.9)
  for (const serviceSlug of PRIMARY_SERVICE_SLUGS) {
    appendUrl(`/services/${serviceSlug}`, '0.9', 'services', today, 'weekly');
  }
  for (const fallbackSvc of FALLBACK_SERVICES_CATALOG) {
    if (fallbackSvc.isActive === false) continue;
    appendUrl(`/services/${fallbackSvc.slug}`, '0.9', 'services', today, 'weekly');
  }
  if (Array.isArray(input.services)) {
    for (const svc of input.services) {
      if (svc.isActive === false) continue;
      const rawSlug = String(svc.slug || svc.id || '').trim();
      if (!rawSlug) continue;
      const cleanSlug = rawSlug.replace(/^\/services\//, '').replace(/^\/+|\/+$/g, '');
      if (EXCLUDED_CATEGORY_SLUGS.has(cleanSlug) && !PRIMARY_SERVICE_SLUGS.includes(cleanSlug)) {
        continue;
      }
      const lastmod = formatSitemapDate(svc.updatedAt || svc.createdAt, today);
      appendUrl(`/services/${cleanSlug}`, '0.9', 'services', lastmod, 'weekly');
    }
  }

  // 4. Active Enterprise Products (/product/*) (Dynamic Firestore Products + Verified GMC Catalog Fallback)
  if (Array.isArray(input.products)) {
    for (const prod of input.products) {
      if (prod.isActive === false) continue;
      const canonicalSlug = getCanonicalProductSlug(prod, String(prod.id || prod.slug || ''));
      if (!canonicalSlug) continue;
      const lastmod = formatSitemapDate(prod.updatedAt || prod.createdAt, today);
      appendUrl(
        `/product/${canonicalSlug}`,
        canonicalSlug === 'polycom-realpresence-group-500-pakistan' ? '0.9' : '0.8',
        'products',
        lastmod,
        'weekly'
      );
    }
  }
  for (const rawKey of Object.keys(PRODUCT_GMC_METADATA)) {
    const canonicalSlug = getCanonicalProductSlug({ slug: rawKey }, rawKey);
    appendUrl(
      `/product/${canonicalSlug}`,
      canonicalSlug === 'polycom-realpresence-group-500-pakistan' ? '0.9' : '0.8',
      'products',
      today,
      'weekly'
    );
  }

  // 5. Active Blog Buyer Guides (/blog/*) (Dynamic Firestore Blog Posts + Fallback Blog Catalog)
  if (Array.isArray(input.blogPosts)) {
    for (const post of input.blogPosts) {
      if (post.isPublished === false || post.isActive === false) continue;
      const rawSlug = String(post.slug || post.id || '').trim();
      if (!rawSlug) continue;
      const canonicalBlogSlug = resolveCanonicalBlogSlug(rawSlug) || rawSlug;
      const matchedFallback = FALLBACK_BLOG_CATALOG.find(
        fb => fb.slug === canonicalBlogSlug || String(fb.id) === rawSlug
      );
      const lastmod = formatSitemapDate(
        post.updatedAt || post.publishedAt || matchedFallback?.publishedIso,
        today
      );
      appendUrl(`/blog/${canonicalBlogSlug}`, '0.8', 'blogs', lastmod, 'weekly');
    }
  }
  for (const fallbackPost of FALLBACK_BLOG_CATALOG) {
    if (fallbackPost.isPublished === false || fallbackPost.isActive === false) continue;
    appendUrl(
      `/blog/${fallbackPost.slug}`,
      '0.8',
      'blogs',
      today,
      'weekly'
    );
  }

  // 6. Remaining Static, Brand (/brands/*), B2B Program (/programs/*) & Corporate Trust Routes
  for (const route of STATIC_CORE_ROUTES) {
    const priority =
      route === ''
        ? '1.0'
        : route.startsWith('/brands/')
        ? '0.8'
        : route.startsWith('/programs/')
        ? '0.7'
        : '0.8';
    appendUrl(route, priority, 'staticPages', today, 'weekly');
  }

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urlBlocks,
    '</urlset>'
  ].join('\n');

  return { xml, counts };
}

/**
 * Generates the comprehensive /llms-full.txt Markdown Knowledge Base for
 * ChatGPT Search (OAI-SearchBot / GPTBot), PerplexityBot, ClaudeBot, and Google-Extended.
 */
export function buildLlmsFullTxt(): string {
  const lines: string[] = [
    '# AV Live Communications Pakistan — Complete Enterprise Knowledge Base (llms-full.txt)',
    '',
    '> Official AI & LLM Reference Catalog for AV Live Communications (https://avlive.com.pk). AV Live is Pakistan\'s premier authorized distributor and turnkey systems integrator for Video Conferencing (HP Poly / Polycom Group 500, Poly Studio X70/X72/X52, Logitech Rally Bar, Cisco Room Kits, Yealink), Enterprise VoIP & IP Telephony (3CX, FreePBX, Grandstream, Cisco, Fanvil), Commercial Laser Projectors (Panasonic, Epson, Sony, BenQ), and Turnkey Corporate Event Management, Hybrid Events, 3D Hologram Stage Displays, and 3D Projection Mapping across Lahore, Karachi, and Islamabad.',
    '',
    '## 1. Standardized Corporate Identity, 15-Minute Technical SLA & Regional Experience Centers (NAP)',
    '- **Legal Entity**: AV Live Communications (Pvt) Ltd',
    '- **Primary Domain**: https://avlive.com.pk',
    '- **Primary 24/7 Enterprise Hotlines**: 0321 425 6263 | 0339 0000 921 (Guaranteed 15-Minute Quote & Technical SLA Response)',
    '- **Authorized Hardware Partner Ecosystem**: Cisco, HP Poly (Polycom), Yealink, Logitech, Horion (Interactive Flat Panels), Grandstream, Bosch, Jabra',
    '- **Lahore Head Office & Experience Center**: Johar Town Block N & DHA Commercial Coverage, Lahore, Punjab, Pakistan | Phone: +92 42 3233 4782 | Hotlines: 0321 425 6263 / 0339 0000 921 | URL: https://avlive.com.pk/lahore',
    '- **Karachi Regional Office**: Clifton Executive Hub & Shahrah-e-Faisal, Karachi, Sindh, Pakistan | Phone: +92 21 3589 0123 | Hotlines: 0321 425 6263 / 0339 0000 921 | URL: https://avlive.com.pk/karachi',
    '- **Islamabad Regional Office**: Blue Area Commercial Hub, Jinnah Avenue, Islamabad, ICT, Pakistan | Phone: +92 51 2890 124 | Hotlines: 0321 425 6263 / 0339 0000 921 | URL: https://avlive.com.pk/islamabad',
    '- **Procurement & Tender Desk**: info@avlive.com.pk | sales@avlive.com.pk | Official FBR GST/NTN Invoicing & PPRA Tender Compliance',
    '- **High-Intent Local Specialties**: Polycom video conferencing distributors Lahore, Cisco Room Kit installation Karachi, Enterprise VoIP PBX setup Pakistan, Boardroom AV integration services Islamabad, Interactive flat panel displays for business Lahore, Corporate hybrid event live streaming Lahore, SMD LED screen rental for corporate events, 3D hologram display stages Pakistan, Multi-camera event broadcasting Karachi.',
    '',
    '## 2. Conference Room Size & Turnkey BoM Price Matrix (Pakistan 2026)',
    '| Room Tier | Seating Capacity | Recommended Video Hardware | Audio & Control Stack | Turnkey PKR Budget |',
    '| :--- | :--- | :--- | :--- | :--- |',
    '| Huddle Room | 2–6 Persons | Poly Studio USB Bar / Logitech Rally Bar Mini | Built-in 6-Mic Beamforming Array | Rs. 240,000 – Rs. 490,000 |',
    '| Medium Boardroom | 8–14 Persons | Logitech Rally Bar / Poly Studio X52 / Cisco Room Bar | 1–2 Expansion Mic Pods + 10" Touch Panel | Rs. 680,000 – Rs. 1,350,000 |',
    '| Large Executive Boardroom | 16–28 Persons | Polycom RealPresence Group 500 / Poly Studio X72 / Cisco Room Kit Plus | 12x Optical PTZ / Dual 4K + Ceiling/Table Mic Array | Rs. 1,450,000 – Rs. 2,650,000 |',
    '| Townhall / Auditorium | 30–100+ Persons | Cisco Room Kit Pro / Poly G7500 + Dual PTZ Cameras | Bosch PAVIRO / Ceiling Array + Laser Projector / SMD LED Wall | Rs. 2,800,000 – Rs. 5,500,000+ |',
    '',
    '## 3. Turnkey Enterprise Services Catalog',
  ];

  for (const svc of FALLBACK_SERVICES_CATALOG) {
    if (svc.isActive === false) continue;
    lines.push(`### ${svc.title}`);
    lines.push(`- **Canonical URL**: https://avlive.com.pk/services/${svc.slug}`);
    lines.push(`- **Summary**: ${svc.description}`);
    lines.push('');
  }

  lines.push('## 4. High-Intent Buyer Guides & Brand-vs-Brand Comparisons');
  for (const post of FALLBACK_BLOG_CATALOG) {
    lines.push(`### ${post.title}`);
    lines.push(`- **Canonical URL**: https://avlive.com.pk/blog/${post.slug}`);
    lines.push(`- **Direct Answer**: ${post.answerFirstSummary || post.excerpt}`);
    if (post.comparisonTable) {
      lines.push(`- **${post.comparisonTable.caption}**:`);
      lines.push(`  | ${post.comparisonTable.headers.join(' | ')} |`);
      lines.push(`  | ${post.comparisonTable.headers.map(() => ':---').join(' | ')} |`);
      for (const row of post.comparisonTable.rows) {
        lines.push(`  | ${row.join(' | ')} |`);
      }
    }
    lines.push('');
  }

  lines.push('## 5. Verified Enterprise Hardware Catalog (Canonical Slugs, MPNs & Reference PKR Pricing)');
  lines.push('| Product Name | Brand | Official MPN | GTIN / UPC | Reference Price (PKR) | Key Highlight | Canonical URL |');
  lines.push('| :--- | :--- | :--- | :--- | :--- | :--- | :--- |');

  const seenProductSlugs = new Set<string>();
  for (const rawKey of Object.keys(PRODUCT_GMC_METADATA)) {
    const canonicalSlug = getCanonicalProductSlug({ slug: rawKey }, rawKey);
    if (!canonicalSlug || seenProductSlugs.has(canonicalSlug)) continue;
    seenProductSlugs.add(canonicalSlug);
    const fallbackProd = buildFallbackProductFromGmcMeta(canonicalSlug);
    const meta = PRODUCT_GMC_METADATA[canonicalSlug] || PRODUCT_GMC_METADATA[rawKey];
    if (!fallbackProd || !meta) continue;
    const { effectivePrice } = resolveProductPricing(fallbackProd);
    lines.push(
      `| ${fallbackProd.productName} | ${meta.brand} | ${meta.mpn} | ${meta.gtin} | Rs. ${effectivePrice.toLocaleString()} | ${meta.highlight} | https://avlive.com.pk/product/${canonicalSlug} |`
    );
  }

  lines.push('');
  lines.push('## 6. Machine-Readable Feeds & Sitemaps');
  lines.push('- **XML Sitemap**: https://avlive.com.pk/sitemap.xml');
  lines.push('- **Concise LLM Index**: https://avlive.com.pk/llms.txt');
  lines.push('- **Full LLM Catalog**: https://avlive.com.pk/llms-full.txt');
  lines.push('- **Google Merchant Center 40-Column TSV Feed**: https://avlive.com.pk/feed/google-merchant.tsv');
  lines.push('');

  return lines.join('\n');
}

