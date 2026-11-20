import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  MapPin,
  Search,
  Sparkles,
  Video,
  X,
  ZoomIn,
} from 'lucide-react';

export type ProjectFilterTab = 'all' | 'video-conference' | 'events';

interface RealProjectItem {
  id: string;
  category: 'video-conference' | 'events';
  title: string;
  client: string;
  city: string;
  hardwareStack: string;
  caption: string;
  imageSrc: string;
  width: number;
  height: number;
  featuredOnHome?: boolean;
}

const REAL_PROJECTS: RealProjectItem[] = [
  {
    id: 'meta-values-summit',
    category: 'events',
    title: 'Meta Corporate Summit & Live Broadcast Switcher Stage',
    client: 'Meta (Facebook) · Pakistan Executive Forum',
    city: 'Islamabad',
    hardwareStack: 'Custom Architectural Stage · SMD LED Backdrop · Multi-Cam OBS/SDI Live Production',
    caption: 'Turnkey Meta corporate summit featuring custom 3D stage fabrication, intelligent DMX wash lighting, and Front-of-House multi-camera live broadcast switching.',
    imageSrc: '/images/projects/meta-values-summit.webp',
    width: 1000,
    height: 750,
    featuredOnHome: true,
  },
  {
    id: 'world-bank-president-stage',
    category: 'events',
    title: 'World Bank Group President & Doing Business Reform Summit',
    client: 'World Bank Group (President David Malpass) & Govt of Pakistan',
    city: 'Islamabad',
    hardwareStack: 'Ultra-Wide Panoramic P2.5 SMD LED Wall · Broadcast Camera Rig · Presidential PA',
    caption: 'High-profile international summit for the World Bank Group President and Federal Cabinet featuring an ultra-wide seamless SMD LED stage wall and broadcast camera feeds.',
    imageSrc: '/images/projects/world-bank-president-stage.webp',
    width: 1000,
    height: 563,
    featuredOnHome: true,
  },
  {
    id: 'vissonic-delegate-boardroom',
    category: 'video-conference',
    title: '24+ Seat U-Shape Council Room & Delegate Microphone Array',
    client: 'Institutional Boardroom Deployment',
    city: 'Islamabad',
    hardwareStack: '20+ VISSONIC Digital Chairman/Delegate Gooseneck Mics · 4x 4K Displays · PTZ Codec',
    caption: 'U-shaped executive boardroom engineered with 20+ digital Chairman/Delegate gooseneck conference microphones, central confidence monitor, and dual perimeter displays.',
    imageSrc: '/images/projects/vissonic-delegate-boardroom.webp',
    width: 1000,
    height: 750,
    featuredOnHome: true,
  },
  {
    id: 'hisdu-committee-wall',
    category: 'video-conference',
    title: 'Multi-Panel Executive Committee Room & Video Wall',
    client: 'HISDU / Punjab Healthcare & Public Sector',
    city: 'Lahore',
    hardwareStack: 'Multi-Panel Seamless Video Wall · 12+ Gooseneck Conference Mics · Hardware Codec',
    caption: 'Turnkey government committee hall engineered with bezel-minimized video wall, multi-site switching, and perimeter gooseneck conference microphones.',
    imageSrc: '/images/projects/hisdu-committee-wall.webp',
    width: 1000,
    height: 750,
    featuredOnHome: true,
  },
  {
    id: 'novo-nordisk-arena-summit',
    category: 'events',
    title: 'Novo Nordisk Arena Convention & Multi-Truss SMD Stage',
    client: 'Novo Nordisk Pakistan ("Jaan Laga De" National Convention)',
    city: 'Lahore',
    hardwareStack: 'Giant Truss-Flown P2.5 SMD LED Wall · Wing Screens · Line-Array PA · 3-Cam ENG Crew',
    caption: 'Large-format convention center production for Novo Nordisk with main and side truss-flown SMD LED screens, 3D illuminated stage lettering, and broadcast camera crew.',
    imageSrc: '/images/projects/novo-nordisk-arena-summit.webp',
    width: 1000,
    height: 450,
    featuredOnHome: true,
  },
  {
    id: 'jazz-cisco-bar',
    category: 'video-conference',
    title: 'Cisco Webex Room Bar Executive Boardroom',
    client: 'Jazz Headquarters',
    city: 'Islamabad',
    hardwareStack: 'Cisco Webex Room Bar · Commercial LG 4K Display · Acoustic Mounting',
    caption: 'Clean cable-concealed corporate meeting suite at Jazz Islamabad integrating Cisco Room Bar with commercial large-format display.',
    imageSrc: '/images/projects/jazz-cisco-bar.webp',
    width: 1000,
    height: 563,
    featuredOnHome: true,
  },
  {
    id: 'doing-business-reform-summit',
    category: 'events',
    title: 'Doing Business Reform Exhibition & National Broadcast',
    client: 'World Bank & Federal Board of Investment',
    city: 'Islamabad',
    hardwareStack: 'Wide-Format SMD LED Wall · Live PiP Keynote Feed · Broadcast ENG Teleprompter Rig',
    caption: 'State-level Doing Business Reform Exhibition featuring live Picture-in-Picture keynote camera feed on a seamless panoramic SMD LED backdrop.',
    imageSrc: '/images/projects/doing-business-reform-summit.webp',
    width: 720,
    height: 540,
  },
  {
    id: 'usaid-wapda-auditorium',
    category: 'events',
    title: 'USAID & WAPDA Sustainable Energy Handover Ceremony',
    client: 'USAID & WAPDA Auditorium',
    city: 'Lahore',
    hardwareStack: 'Stage SMD LED Wing · FOH Audio/Video Control Desk · Panel Conference Mics',
    caption: 'Official USAID Sustainable Energy for Pakistan (SEP) ceremony at WAPDA Auditorium with side SMD LED display, stage branding, and FOH broadcast control.',
    imageSrc: '/images/projects/usaid-wapda-auditorium.webp',
    width: 1000,
    height: 562,
  },
  {
    id: 'nima-maritime-conference',
    category: 'events',
    title: '9th International Maritime Conference (IMC-21) Hybrid Bridge',
    client: 'National Institute of Maritime Affairs (NIMA) & Pakistan Navy',
    city: 'Karachi',
    hardwareStack: 'Dual Flanking SMD LED Walls · Live International Video Conference Bridge · FOH Switcher',
    caption: 'Hybrid international maritime summit bridging live remote keynote speakers onto dual high-brightness SMD LED walls with FOH multi-view switching.',
    imageSrc: '/images/projects/nima-maritime-conference.webp',
    width: 1000,
    height: 562,
  },
  {
    id: 'ferozsons-dermatology-summit',
    category: 'events',
    title: '5-City Hybrid Icons of Dermatology Summit',
    client: "Ferozsons Laboratories · Faletti's Hotel",
    city: 'Lahore · Karachi · Rawalpindi · Peshawar · Faisalabad',
    hardwareStack: 'Center SMD LED Wall · 5-City Live Video Conference Window · Broadcast Mixer & ENG Cam',
    caption: 'Simultaneous 5-city medical summit for Ferozsons Laboratories linking Lahore, Karachi, Rawalpindi, Peshawar, and Faisalabad live on a custom SMD LED stage.',
    imageSrc: '/images/projects/ferozsons-dermatology-summit.webp',
    width: 1000,
    height: 562,
  },
  {
    id: 'multicity-teams-boardrooms',
    category: 'video-conference',
    title: '9-Boardroom Nationwide Microsoft Teams Executive Bridge',
    client: 'Enterprise Multi-Branch Annual Strategy Conference',
    city: 'Nationwide (Lahore · Karachi · Islamabad)',
    hardwareStack: 'Microsoft Teams Rooms (MTR) · 9 Simultaneous Conference Rooms · Full-Duplex DSP Audio',
    caption: 'Live multi-branch corporate strategy conference connecting 9 regional executive boardrooms simultaneously over Microsoft Teams with zero-echo room audio.',
    imageSrc: '/images/projects/multicity-teams-boardrooms.webp',
    width: 1000,
    height: 473,
  },
  {
    id: 'jazzcash-corporate-hall',
    category: 'events',
    title: 'JazzCash Executive U-Shape Ballroom & SMD LED Stage',
    client: 'JazzCash (PMCL)',
    city: 'Lahore',
    hardwareStack: 'Center Portrait SMD LED Wall · Flanking Branded Wings · Secondary Projection Screen',
    caption: 'Executive corporate training and leadership summit for JazzCash featuring a center SMD LED stage, branded wings, and dual-screen projection.',
    imageSrc: '/images/projects/jazzcash-corporate-hall.webp',
    width: 1000,
    height: 750,
  },
  {
    id: 'ballroom-smd-stage',
    category: 'events',
    title: 'Grand Hotel Ballroom Panoramic SMD LED Stage',
    client: 'National Corporate Summit',
    city: 'Lahore',
    hardwareStack: 'P2.5 High-Refresh SMD LED Wall · 10x Vertical LED Standees · Multi-Cam ENG Crew',
    caption: 'Full-width synchronized panoramic SMD LED stage backdrop with 10 branded vertical digital standees and multi-camera broadcast coverage.',
    imageSrc: '/images/projects/ballroom-smd-stage.webp',
    width: 720,
    height: 540,
  },
  {
    id: 'pps-national-conference',
    category: 'events',
    title: '24th National Psychiatric Conference Hybrid Stage',
    client: 'Pakistan Psychiatric Society (PPS) · Pearl-Continental',
    city: 'Lahore',
    hardwareStack: 'Wide Seamless SMD LED Wall · Live Speaker PiP · Dual ENG Cameras · Panel Audio',
    caption: 'Medical congress main hall featuring live Picture-in-Picture presenter framing, synchronized slide deck routing, and broadcast recording.',
    imageSrc: '/images/projects/pps-national-conference.webp',
    width: 1000,
    height: 750,
  },
  {
    id: 'psg-gastroenterology-congress',
    category: 'events',
    title: '37th Annual Gastroenterology & GI Endoscopy Congress',
    client: 'Pakistan Society of Gastroenterology (PSG) · Serena Hotel',
    city: 'Islamabad',
    hardwareStack: 'High-Contrast P2.5 Medical Diagnostic SMD LED Wall · Live Speaker PiP + Countdown Timer',
    caption: 'High-resolution medical diagnostic SMD LED stage at Islamabad Serena Hotel displaying live endoscopy fluoroscopy alongside speaker PiP and session timer.',
    imageSrc: '/images/projects/psg-gastroenterology-congress.webp',
    width: 1000,
    height: 472,
  },
  {
    id: 'servier-diamicron-symposium',
    category: 'events',
    title: 'Servier Diamicron MR 60 Hybrid Zoom Medical Symposium',
    client: 'Servier Research & Pharmaceuticals · Pearl-Continental',
    city: 'Lahore',
    hardwareStack: 'Center SMD LED Wall · Live Zoom Cloud Bridge · Custom Stage Wings & Uplighting',
    caption: 'International pharmaceutical symposium for Servier at PC Hotel Lahore combining an on-stage SMD LED wall with live Zoom remote clinical presentations.',
    imageSrc: '/images/projects/servier-diamicron-symposium.webp',
    width: 1000,
    height: 750,
  },
  {
    id: 'adamjee-polycom-room',
    category: 'video-conference',
    title: 'Polycom Group Series Executive Boardroom',
    client: 'Adamjee Insurance',
    city: 'Lahore',
    hardwareStack: 'Polycom RealPresence Group Series · EagleEye IV 12x Optical PTZ · 4K Display',
    caption: 'Enterprise insurance headquarters boardroom deployed with dedicated Polycom hardware codec and optical PTZ speaker tracking.',
    imageSrc: '/images/projects/adamjee-polycom-room.webp',
    width: 1000,
    height: 450,
  },
  {
    id: 'foh-broadcast-control',
    category: 'events',
    title: 'FOH Broadcast Control & Multi-View Switcher Desk',
    client: 'Enterprise Hybrid Convention',
    city: 'Lahore',
    hardwareStack: 'Multi-View SDI Broadcast Switcher · Dual Presentation Laptops · Live Stream Encoder',
    caption: 'Front-of-House live broadcast engineering console managing multi-camera SDI feeds, graphics playback, and wide-stage LED walls.',
    imageSrc: '/images/projects/foh-broadcast-control.webp',
    width: 720,
    height: 540,
  },
  {
    id: 'jazz-cisco-navigator',
    category: 'video-conference',
    title: 'Cisco Room Navigator One-Touch Meeting Console',
    client: 'Jazz Headquarters',
    city: 'Islamabad',
    hardwareStack: 'Cisco Room Navigator · Microsoft Teams, Zoom & Webex One-Touch Join',
    caption: 'Tabletop Cisco Room Navigator touch controller configured for instant one-touch join across Webex, Microsoft Teams, and Zoom.',
    imageSrc: '/images/projects/jazz-cisco-navigator.webp',
    width: 495,
    height: 879,
  },
  {
    id: '101-group-poly-ifp',
    category: 'video-conference',
    title: 'Executive Wood-Paneled Boardroom with HP Poly',
    client: '101 Group',
    city: 'Lahore',
    hardwareStack: 'HP Poly Hardware Codec · EagleEye Optical PTZ Camera · 4K Commercial Display',
    caption: 'Architectural corporate boardroom integrating Poly optical PTZ optics and flush-mounted commercial display.',
    imageSrc: '/images/projects/101-group-poly-ifp.webp',
    width: 1000,
    height: 450,
  },
  {
    id: 'hisdu-live-session',
    category: 'video-conference',
    title: 'Live Multi-District Government Review Bridge',
    client: 'Punjab Healthcare & Food Authority Command Room',
    city: 'Lahore',
    hardwareStack: 'Multi-Window Video Wall Processor · Dual-Stream Content + 4x Live Remote Feeds',
    caption: 'Live provincial briefing displaying real-time presentation schedules alongside simultaneous multi-district remote video streams.',
    imageSrc: '/images/projects/hisdu-live-session.webp',
    width: 1000,
    height: 750,
  },
  {
    id: 'multisite-govt-call',
    category: 'video-conference',
    title: '6+ Site Provincial Secretariat Hardware Bridge',
    client: 'Punjab Government Department',
    city: 'Lahore',
    hardwareStack: 'Polycom RealPresence Group Series · Multi-Point MCU Layout · EagleEye IV PTZ',
    caption: 'High-reliability multi-point hardware conference linking 6+ regional conference rooms simultaneously with zero-echo audio.',
    imageSrc: '/images/projects/multisite-govt-call.webp',
    width: 1000,
    height: 318,
  },
  {
    id: 'pshd-remote-bridge',
    category: 'video-conference',
    title: 'PSHD District Tele-Governance Conference Endpoint',
    client: 'Primary & Secondary Healthcare Dept (PSHD)',
    city: 'Punjab-Wide',
    hardwareStack: 'Polycom Group Series Codec · EagleEye PTZ Camera · Dedicated Shelf Integration',
    caption: 'Standardized provincial healthcare boardroom deployment connecting district headquarters on Zoom, Teams, and SIP/H.323.',
    imageSrc: '/images/projects/pshd-remote-bridge.webp',
    width: 1000,
    height: 750,
  },
];

interface FlagshipClientBrand {
  name: string;
  shortMark: string;
  sector: string;
  accentHex: string;
  bgTint: string;
  subtitle?: string;
}

const FLAGSHIP_CLIENT_BRANDS: FlagshipClientBrand[] = [
  { name: 'Nestlé Pakistan', shortMark: 'Nestlé', sector: 'FMCG & Nutrition', accentHex: '#00529B', bgTint: '#EFF6FF' },
  { name: 'World Bank Group', shortMark: 'WORLD BANK', sector: 'Multilateral Development', accentHex: '#002244', bgTint: '#F1F5F9' },
  { name: 'Meta (Facebook)', shortMark: '∞ Meta', sector: 'Global Technology', accentHex: '#0064E0', bgTint: '#EFF6FF' },
  { name: 'Asian Development Bank', shortMark: 'ADB', sector: 'Multilateral Finance', accentHex: '#0077C8', bgTint: '#E0F2FE' },
  { name: 'USAID Pakistan', shortMark: 'USAID', sector: 'International Development', accentHex: '#002F6C', bgTint: '#EFF6FF' },
  { name: 'United Nations (UNDP / UNEP)', shortMark: 'UN · UNDP', sector: 'Diplomatic & Multilateral', accentHex: '#009EDB', bgTint: '#E0F2FE' },
  { name: 'AkzoNobel (Dulux)', shortMark: 'AkzoNobel', sector: 'Coatings & Chemicals', accentHex: '#00539F', bgTint: '#EFF6FF' },
  { name: 'Lucky Core Industries', shortMark: 'LCI · ICI', sector: 'Formerly ICI Pakistan', accentHex: '#004B87', bgTint: '#F0F9FF' },
  { name: 'Berger Paints', shortMark: 'BERGER', sector: 'Paints & Coatings', accentHex: '#C8102E', bgTint: '#FEF2F2' },
  { name: 'Jazz & JazzCash', shortMark: 'Jazz · JazzCash', sector: 'Telecom & FinTech', accentHex: '#D71920', bgTint: '#FEF2F2' },
  { name: 'Novo Nordisk', shortMark: 'novo nordisk', sector: 'Global Healthcare', accentHex: '#001965', bgTint: '#EEF2FF' },
  { name: 'CitiBank', shortMark: 'citi', sector: 'Global Banking', accentHex: '#003B70', bgTint: '#EFF6FF' },
  { name: 'Deutsche Bank', shortMark: 'DB', sector: 'Investment Banking', accentHex: '#0018A8', bgTint: '#EEF2FF' },
  { name: 'Allied Bank (ABL)', shortMark: 'ABL', sector: 'Commercial Banking', accentHex: '#0033A0', bgTint: '#EFF6FF' },
  { name: 'Dubai Islamic Bank', shortMark: 'DIB', sector: 'Islamic Banking', accentHex: '#007A33', bgTint: '#ECFDF5' },
  { name: 'OGDCL & Mari Energies', shortMark: 'OGDCL · MARI', sector: 'Oil & Gas Exploration', accentHex: '#006837', bgTint: '#ECFDF5' },
  { name: 'WAPDA & NIMA Maritime', shortMark: 'WAPDA · NIMA', sector: 'National Power & Maritime', accentHex: '#0A2A66', bgTint: '#EFF6FF' },
  { name: 'Pakistan Air Force', shortMark: 'PAF', sector: 'Defense & Aviation', accentHex: '#0A2A66', bgTint: '#EFF6FF' },
  { name: 'Abbott, Bayer & Servier', shortMark: 'Abbott · Bayer', sector: 'Multinational Pharma', accentHex: '#0096D6', bgTint: '#E0F2FE' },
  { name: 'British American Tobacco', shortMark: 'BAT', sector: 'Multinational FMCG', accentHex: '#0E2B63', bgTint: '#EEF2FF' },
  { name: 'Atlas Honda', shortMark: 'ATLAS HONDA', sector: 'Automotive Manufacturing', accentHex: '#CC0000', bgTint: '#FEF2F2' },
  { name: 'LUMS & COMSATS', shortMark: 'LUMS · COMSATS', sector: 'Higher Education', accentHex: '#002F6C', bgTint: '#EFF6FF' },
  { name: 'NETSOL & Arbisoft', shortMark: 'NETSOL', sector: 'Enterprise Software & IT', accentHex: '#005DAA', bgTint: '#EFF6FF' },
  { name: 'Adamjee, PFA & PSHD', shortMark: 'ADAMJEE · HISDU', sector: 'Insurance & Provincial Govt', accentHex: '#046A38', bgTint: '#ECFDF5' },
];

interface ClientSectorGroup {
  id: string;
  label: string;
  companies: string[];
}

const VERIFIED_CLIENT_SECTORS: ClientSectorGroup[] = [
  {
    id: 'banking',
    label: 'Banking, Finance & Insurance',
    companies: [
      'World Bank Group',
      'Asian Development Bank (ADB)',
      'CitiBank',
      'Deutsche Bank',
      'Allied Bank Limited (ABL)',
      'Dubai Islamic Bank (DIB)',
      'JazzCash',
      'Adamjee Insurance',
      'Adamjee Life Assurance',
      'Arif Habib',
      'National Clearing Company of Pakistan (NCCPL)',
      'Pak-Kuwait Takaful Company',
      'Pak Brunei Investment Company',
      'ORIX Modaraba',
      'Dollar East',
      'ACCA Pakistan',
    ],
  },
  {
    id: 'government',
    label: 'Government, Defense, Diplomatic & NGOs',
    companies: [
      'United Nations (UNDP & UN Environment)',
      'USAID (Sustainable Energy for Pakistan)',
      'Pakistan Air Force (PAF)',
      'National Institute of Maritime Affairs (NIMA) & Pakistan Navy',
      'WAPDA (Water & Power Development Authority & Mangla Dam)',
      'Primary & Secondary Healthcare Dept (PSHD / HISDU)',
      'Punjab Food Authority (PFA)',
      'OGDCL',
      'Mari Gas (Mari Energies)',
      'NRTC (National Radio & Telecommunication Corp)',
      'NIBGE',
      'ACIAR — Australian High Commission',
      'Bangladesh Embassy',
      'Central Jail Lahore',
      'Open Society Foundations',
      'Malala Fund',
      'CARE Organization',
      'CIDA',
      'Centre for Social Justice',
      'Oil Companies Advisory Council (OCAC)',
    ],
  },
  {
    id: 'healthcare',
    label: 'Healthcare & Pharmaceuticals',
    companies: [
      'Novo Nordisk Pakistan',
      'Abbott Laboratories Pakistan',
      'Bayer Pakistan',
      'Servier Research & Pharmaceuticals',
      'Ferozsons Laboratories Limited',
      'Hilton Pharma',
      "Children's Hospital Lahore",
      'College of Physicians & Surgeons Pakistan (CPSP)',
      'Pakistan Psychiatric Society (PPS)',
      'Pakistan Society of Gastroenterology & GI Endoscopy (PSG)',
      'ASPIRE Regional Reproductive Health Conference',
      'Chiesi Pharmaceuticals',
      'Alcon Scientific Services',
      'Al Razi Healthcare',
      'Cirin Pharmaceuticals',
      'Matrix Pharma',
      'Mapel Pharma',
      'Alliance Med Pharma',
      'Drug Vision International',
      'OptiSurg',
    ],
  },
  {
    id: 'education',
    label: 'Universities & Education',
    companies: [
      'LUMS (Lahore University of Management Sciences)',
      'COMSATS University (Islamabad, Karachi & Peshawar)',
      'Aitchison College',
      'Beaconhouse School System',
      'The City School',
      'Aman Institute for Vocational Training',
      'Lyceum',
      'Dar-ul-Madinah',
      'Minhaj-ul-Quran',
      'Dyal Singh Research & Cultural Forum',
      'Cadence Preschool',
      'Educative',
    ],
  },
  {
    id: 'tech',
    label: 'IT, Telecom & Engineering',
    companies: [
      'Meta (Facebook)',
      'Jazz',
      'NETSOL Technologies',
      'Arbisoft',
      'Confiz',
      'CureMD',
      'Avanceon',
      'AutoSoft Dynamics',
      'Ovex Technologies',
      'Air Link Communication',
      'Brain Telecom',
      'China CAMC Engineering',
      'Net Link Technology Solutions',
      'Abacus Consulting',
      'Comtel Systems',
      'Dataco Global',
      'OnePoint IT Solution',
      'Otium Technology',
      'MHZ Technologies',
      'MedznTech',
      'NexSource',
      'MJLA Solutions',
      'Channel Tek',
      'Aristasols',
      'Apanage Global',
    ],
  },
  {
    id: 'corporate',
    label: 'Manufacturing, FMCG, Textiles & Hospitality',
    companies: [
      'Nestlé Pakistan',
      'AkzoNobel Pakistan (Dulux)',
      'Lucky Core Industries (formerly ICI Pakistan)',
      'Berger Paints Pakistan',
      'British American Tobacco (BAT)',
      'Atlas Honda',
      'Pearl-Continental Hotels (PC Lahore)',
      'Serena Hotels (Islamabad)',
      "Faletti's Hotel Lahore",
      'Avari Hotel Lahore',
      'Mövenpick Hotel Karachi',
      'Nishat Hospitality',
      'Al-Karam International',
      'Crescent Steel & Allied Products',
      'Artistic Fabric Mills',
      'Diamond Fabrics',
      'Maria B',
      'Dawn Bread',
      'Murree Brewery',
      'Nutrico Morinaga',
      'Naveena Group',
      'EcoPack',
      'Pak Oxygen',
      'Olympia Chemicals',
      'Orient Energy Systems',
      'Orient Automotive Industries',
      'Ali Gohar & Company',
      'Adcom',
      'Orientm McCann',
      '101 Group',
      'MK Sons',
      'Mansha Brothers',
      'Check Mate Group',
      'BBCL Group Karachi',
      'Cotton Web',
      'Active Apparels',
      'Bebe Jan',
      'Buzzer Media & Marketing',
      'Bulls Eye',
      'Charles & Co. Solicitors',
      'Cartwright King',
      '3S International',
      'Olympus International',
      'Ologh Beg Group',
      'MAQ International',
      'Metax',
      'NALCO',
      'Damen',
      'BRN Associates',
    ],
  },
];

export interface RealProjectsAndClientsProps {
  defaultTab?: ProjectFilterTab;
  compact?: boolean;
  showClientDirectory?: boolean;
  sectionId?: string;
}

export function RealProjectsAndClients({
  defaultTab = 'all',
  compact = false,
  showClientDirectory = true,
  sectionId = 'verified-projects',
}: RealProjectsAndClientsProps) {
  const [activeTab, setActiveTab] = useState<ProjectFilterTab>(defaultTab);
  const [activeSector, setActiveSector] = useState<string>('all');
  const [clientQuery, setClientQuery] = useState<string>('');
  const [directoryExpanded, setDirectoryExpanded] = useState<boolean>(!compact);
  const [lightboxProject, setLightboxProject] = useState<RealProjectItem | null>(null);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  useEffect(() => {
    if (!lightboxProject) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxProject(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightboxProject]);

  const visibleProjects = useMemo(() => {
    const base =
      activeTab === 'all'
        ? REAL_PROJECTS
        : REAL_PROJECTS.filter((p) => p.category === activeTab);
    if (compact && activeTab === 'all') {
      return base.filter((p) => p.featuredOnHome);
    }
    return compact ? base.slice(0, 6) : base;
  }, [activeTab, compact]);

  const totalUniqueCompanies = useMemo(() => {
    const set = new Set<string>();
    VERIFIED_CLIENT_SECTORS.forEach((g) => g.companies.forEach((c) => set.add(c)));
    return set.size;
  }, []);

  const filteredSectors = useMemo(() => {
    const q = clientQuery.trim().toLowerCase();
    return VERIFIED_CLIENT_SECTORS.filter((s) => activeSector === 'all' || s.id === activeSector)
      .map((s) => ({
        ...s,
        companies: q ? s.companies.filter((c) => c.toLowerCase().includes(q)) : s.companies,
      }))
      .filter((s) => s.companies.length > 0);
  }, [activeSector, clientQuery]);

  const vcCount = REAL_PROJECTS.filter((p) => p.category === 'video-conference').length;
  const eventCount = REAL_PROJECTS.filter((p) => p.category === 'events').length;

  return (
    <section
      id={sectionId}
      className="w-full py-10 lg:py-14 bg-[#F8F9FA] border-t border-gray-200/80 cv-auto-mobile"
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* PART 1: VERIFIED REAL PROJECT DEPLOYMENTS GALLERY */}
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-gray-200 pb-5">
            <div className="space-y-1.5 max-w-3xl">
              <span className="inline-flex items-center gap-1.5 text-[#0077B6] text-[11px] font-black uppercase tracking-[0.22em]">
                <Camera size={13} aria-hidden="true" />
                1,000+ Corporate Events &amp; Boardrooms Engineered Across Pakistan · Est. 2011
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#1A2B4C] tracking-tight">
                Real Video Conference Rooms &amp; National Event Stages Delivered Across Pakistan
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                With over <strong>1,000+ live corporate events, multilateral summits, and executive boardrooms</strong> delivered across Lahore, Islamabad, Karachi, Peshawar, and Faisalabad, inspect our unedited field installations below—spanning Meta, World Bank Group, USAID/WAPDA, NIMA Maritime, Novo Nordisk, Jazz, and provincial command centers.
              </p>
            </div>

            <div
              className="flex flex-wrap items-center gap-2"
              role="tablist"
              aria-label="Filter real project deployments"
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'all'}
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2.5 min-h-[42px] rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-[#1A2B4C] text-white shadow-sm'
                    : 'bg-white text-slate-700 border border-gray-200 hover:border-[#1A2B4C]'
                }`}
              >
                Featured Archive ({REAL_PROJECTS.length})
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'video-conference'}
                onClick={() => setActiveTab('video-conference')}
                className={`px-4 py-2.5 min-h-[42px] rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
                  activeTab === 'video-conference'
                    ? 'bg-[#1A2B4C] text-white shadow-sm'
                    : 'bg-white text-slate-700 border border-gray-200 hover:border-[#1A2B4C]'
                }`}
              >
                <Video size={13} aria-hidden="true" />
                Video Conference ({vcCount})
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'events'}
                onClick={() => setActiveTab('events')}
                className={`px-4 py-2.5 min-h-[42px] rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
                  activeTab === 'events'
                    ? 'bg-[#1A2B4C] text-white shadow-sm'
                    : 'bg-white text-slate-700 border border-gray-200 hover:border-[#1A2B4C]'
                }`}
              >
                <Sparkles size={13} aria-hidden="true" />
                1,000+ Events &amp; Stages ({eventCount})
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {visibleProjects.map((project) => (
              <article
                key={project.id}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col group"
              >
                <button
                  type="button"
                  onClick={() => setLightboxProject(project)}
                  aria-label={`Inspect full-size installation photo: ${project.title} for ${project.client}`}
                  className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900 cursor-pointer text-left"
                >
                  <img
                    src={project.imageSrc}
                    alt={`${project.title} — ${project.client} (${project.city}) deployed by AV Live Pakistan`}
                    width={project.width}
                    height={project.height}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A1120]/75 via-transparent to-transparent opacity-80" />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span
                      className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                        project.category === 'video-conference'
                          ? 'bg-[#0077B6] text-white'
                          : 'bg-[#1A2B4C] text-[#7DD3FC] border border-[#00B4D8]/40'
                      }`}
                    >
                      {project.category === 'video-conference' ? 'Video Conference' : 'Corporate Event'}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 text-white">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-black/50 backdrop-blur-xs px-2.5 py-1 rounded-md">
                      <MapPin size={11} className="text-[#00B4D8]" aria-hidden="true" />
                      {project.city}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-black/50 backdrop-blur-xs px-2 py-1 rounded-md opacity-90 group-hover:bg-[#00B4D8] group-hover:text-[#0A1120] transition-colors">
                      <ZoomIn size={12} aria-hidden="true" />
                      Inspect
                    </span>
                  </div>
                </button>

                <div className="p-5 flex flex-col flex-grow space-y-2.5">
                  <div className="text-[11px] font-black uppercase tracking-wider text-[#0077B6]">
                    {project.client}
                  </div>
                  <h3 className="text-base font-black text-[#1A2B4C] leading-snug">
                    {project.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed flex-grow">
                    {project.caption}
                  </p>
                  <div className="pt-2.5 border-t border-gray-100 text-[11px] font-semibold text-slate-700">
                    <span className="text-[#1A2B4C] font-black">Stack:</span> {project.hardwareStack}
                  </div>
                </div>
              </article>
            ))}
          </div>

          {compact && (
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <p className="text-xs text-slate-600 font-medium">
                Showing {visibleProjects.length} flagship installations from our <strong>1,000+ events &amp; boardroom deployments</strong> archive ({REAL_PROJECTS.length} documented photo plates).
              </p>
              <Link
                to="/about#verified-projects"
                className="text-xs font-black text-[#0077B6] hover:text-[#1A2B4C] uppercase tracking-wider inline-flex items-center gap-1.5"
              >
                View All {REAL_PROJECTS.length} Field Photos &amp; {totalUniqueCompanies}+ Enterprise Clients →
              </Link>
            </div>
          )}
        </div>

        {/* PART 2: FLAGSHIP ENTERPRISE CLIENTS BRAND WALL (24 WELL-KNOWN ACCOUNTS) */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 lg:p-10 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-100 pb-5">
            <div className="space-y-1.5 max-w-3xl">
              <span className="inline-flex items-center gap-1.5 text-[#0077B6] text-[11px] font-black uppercase tracking-[0.22em]">
                <Building2 size={13} aria-hidden="true" />
                Trusted By {totalUniqueCompanies}+ Verified Institutions Across 1,000+ Productions
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#1A2B4C] tracking-tight">
                Multinationals, Banks, Multilateral Agencies &amp; Public Institutions We Serve
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                From global technology and FMCG leaders to multilateral development banks, UN agencies, commercial banking cores, telecom networks, universities, and provincial healthcare departments—every organization below is a verified AV Live corporate or institutional customer.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shrink-0">
              <CheckCircle2 size={15} className="text-emerald-600 shrink-0" aria-hidden="true" />
              <span>1,000+ Events · FBR GST &amp; PPRA Vendor</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {FLAGSHIP_CLIENT_BRANDS.map((brand) => (
              <div
                key={brand.name}
                className="rounded-xl border border-gray-200 bg-white hover:border-[#00B4D8] hover:shadow-md transition-all p-3.5 flex flex-col justify-between min-h-[106px]"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div
                    className="h-9 px-2.5 rounded-lg flex items-center justify-center font-black tracking-tight text-xs sm:text-[13px] leading-none border border-black/5 w-full text-center"
                    style={{ backgroundColor: brand.bgTint, color: brand.accentHex }}
                    aria-hidden="true"
                  >
                    <span className="truncate">{brand.shortMark}</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs font-black text-[#1A2B4C] leading-snug line-clamp-2">
                    {brand.name}
                  </div>
                  <div className="text-[10px] font-semibold text-slate-500 mt-0.5 line-clamp-1">
                    {brand.sector}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* PART 3: COMPLETE VERIFIED INSTITUTIONAL CUSTOMER DIRECTORY (COMPANIES ONLY) */}
          {showClientDirectory && (
            <div className="pt-4 border-t border-gray-100 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-[#1A2B4C]">
                    Complete Verified Corporate &amp; Institutional Client Directory ({totalUniqueCompanies}+ Organizations)
                  </h3>
                  <p className="text-xs text-slate-600">
                    Companies, banks, UN/diplomatic missions, hospitals, universities, and government departments served by AV Live across Pakistan.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDirectoryExpanded((prev) => !prev)}
                  aria-expanded={directoryExpanded}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[42px] rounded-xl bg-[#1A2B4C] hover:bg-[#0077B6] text-white text-xs font-black uppercase tracking-wider transition-colors cursor-pointer shrink-0"
                >
                  <span>{directoryExpanded ? 'Hide Full Roster' : `Browse All ${totalUniqueCompanies}+ Clients`}</span>
                  {directoryExpanded ? (
                    <ChevronUp size={15} aria-hidden="true" />
                  ) : (
                    <ChevronDown size={15} aria-hidden="true" />
                  )}
                </button>
              </div>

              {directoryExpanded && (
                <div className="space-y-4">
                  <div className="flex flex-col lg:flex-row gap-3 lg:items-center justify-between">
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => setActiveSector('all')}
                        className={`px-3 py-1.5 min-h-[36px] rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                          activeSector === 'all'
                            ? 'bg-[#1A2B4C] text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        All Sectors ({totalUniqueCompanies})
                      </button>
                      {VERIFIED_CLIENT_SECTORS.map((sec) => (
                        <button
                          key={sec.id}
                          type="button"
                          onClick={() => setActiveSector(sec.id)}
                          className={`px-3 py-1.5 min-h-[36px] rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                            activeSector === sec.id
                              ? 'bg-[#1A2B4C] text-white'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {sec.label} ({sec.companies.length})
                        </button>
                      ))}
                    </div>

                    <div className="relative w-full lg:w-72 shrink-0">
                      <Search
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                        aria-hidden="true"
                      />
                      <label htmlFor={`${sectionId}-client-search`} className="sr-only">
                        Filter verified client organizations
                      </label>
                      <input
                        id={`${sectionId}-client-search`}
                        type="search"
                        value={clientQuery}
                        onChange={(e) => setClientQuery(e.target.value)}
                        placeholder="Search organization (e.g. Meta, World Bank, Nestlé)..."
                        className="w-full pl-9 pr-3 py-2 min-h-[38px] text-xs rounded-lg border border-gray-300 bg-white text-[#1A2B4C] focus:outline-none focus:border-[#0077B6]"
                      />
                    </div>
                  </div>

                  {filteredSectors.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredSectors.map((sector) => (
                        <div
                          key={sector.id}
                          className="rounded-2xl border border-gray-200 bg-[#F8F9FA] p-4 space-y-2.5"
                        >
                          <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                            <h4 className="text-xs font-black uppercase tracking-wider text-[#1A2B4C]">
                              {sector.label}
                            </h4>
                            <span className="text-[10px] font-mono font-bold text-[#0077B6]">
                              {sector.companies.length}
                            </span>
                          </div>
                          <ul className="grid grid-cols-1 gap-1.5 text-xs text-slate-700 font-medium">
                            {sector.companies.map((company) => (
                              <li key={company} className="flex items-start gap-1.5 leading-snug">
                                <CheckCircle2
                                  size={12}
                                  className="text-[#00B4D8] shrink-0 mt-0.5"
                                  aria-hidden="true"
                                />
                                <span>{company}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-slate-50 rounded-2xl border border-gray-200 text-xs text-slate-600">
                      No organizations matched &ldquo;{clientQuery}&rdquo;. Try searching Meta, World Bank, USAID, Nestlé, Jazz, LUMS, or OGDCL.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* LIGHTBOX MODAL FOR FULL-SIZE REAL DEPLOYMENT INSPECTION */}
      {lightboxProject && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${lightboxProject.title} — ${lightboxProject.client}`}
          onClick={() => setLightboxProject(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl border border-gray-200"
          >
            <div className="flex items-center justify-between px-5 py-3.5 bg-[#1A2B4C] text-white">
              <div>
                <div className="text-[11px] font-black uppercase tracking-wider text-[#7DD3FC]">
                  {lightboxProject.client} · {lightboxProject.city}
                </div>
                <div className="text-sm sm:text-base font-black">{lightboxProject.title}</div>
              </div>
              <button
                type="button"
                onClick={() => setLightboxProject(null)}
                aria-label="Close installation photo preview"
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <div className="bg-slate-950 flex items-center justify-center max-h-[70vh] overflow-hidden">
              <img
                src={lightboxProject.imageSrc}
                alt={`${lightboxProject.title} — ${lightboxProject.client}`}
                width={lightboxProject.width}
                height={lightboxProject.height}
                className="max-h-[70vh] w-auto object-contain"
              />
            </div>
            <div className="p-5 bg-white space-y-2">
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {lightboxProject.caption}
              </p>
              <div className="text-xs font-semibold text-[#1A2B4C]">
                Deployed Hardware Stack:{' '}
                <span className="font-normal text-slate-600">{lightboxProject.hardwareStack}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default RealProjectsAndClients;
