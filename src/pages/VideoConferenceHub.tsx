import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  ChevronDown,
  Download,
  Phone,
  RotateCcw,
  ShieldCheck,
  ShoppingCart,
  SlidersHorizontal,
  Video,
  FileSpreadsheet,
} from 'lucide-react';
import { SEO } from '../components/SEO';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { RealProjectsAndClients } from '../components/RealProjectsAndClients';
import { addToCart } from '../lib/cart';
import {
  buildFallbackProductFromGmcMeta,
  getProductHref,
} from '../lib/gmc-feed';
import { optimizeGalleryImageUrl } from '../lib/image-optimize';

type ProtocolKey = 'cloud' | 'onprem' | 'hybrid';
type RoomTypeKey = 'huddle' | 'medium' | 'boardroom' | 'auditorium';
type VendorPrefKey = 'optimal' | 'poly' | 'cisco' | 'logitech';
type CityHubKey = 'lahore' | 'karachi' | 'islamabad';
type MatrixFilterKey = 'all' | 'codec' | 'projection' | 'voip';
type AddonKey = 'ucm' | 'vvx' | 'intercom' | 'bosch' | 'headset';

interface HardwareRow {
  slug: string;
  model: string;
  vendor: string;
  mpn: string;
  role: string;
  price: number;
  cat: 'codec' | 'projection' | 'voip';
}

interface ConfiguratorItem {
  slug: string;
  name: string;
  mpn: string;
  price: number;
  brand: string;
}

const HISTORY_SERIES = [
  { year: '2006', cloudHybrid: 2, onPremSip: 18, travelOnly: 80 },
  { year: '2009', cloudHybrid: 5, onPremSip: 23, travelOnly: 72 },
  { year: '2012', cloudHybrid: 11, onPremSip: 29, travelOnly: 60 },
  { year: '2015', cloudHybrid: 22, onPremSip: 31, travelOnly: 47 },
  { year: '2018', cloudHybrid: 34, onPremSip: 28, travelOnly: 38 },
  { year: '2020', cloudHybrid: 68, onPremSip: 17, travelOnly: 15 },
  { year: '2023', cloudHybrid: 76, onPremSip: 16, travelOnly: 8 },
  { year: '2026', cloudHybrid: 82, onPremSip: 14, travelOnly: 4 },
];

const PROTOCOL_DATA: Record<
  ProtocolKey,
  {
    eyebrow: string;
    heading: string;
    summary: string;
    encryption: string;
    survivability: string;
    complianceTitle: string;
    complianceText: string;
  }
> = {
  cloud: {
    eyebrow: 'Architecture 01 · Multi-Tenant Cloud SaaS',
    heading: 'Zoom Rooms, Microsoft Teams Rooms, Google Meet & Cisco Webex',
    summary:
      'Dedicated video conference room appliances (Poly Studio X32/X52/X72, Logitech Rally Bar, and Cisco Room Bar / Room Kit Plus) authenticate directly to hyperscale cloud tenants over TLS 1.3 and SRTP. IT teams gain single-pane provisioning, automated firmware updates, AI noise suppression, and one-touch calendar join without maintaining local MCU bridges.',
    encryption: 'TLS 1.3 Signalling · AES-256-GCM SRTP Media',
    survivability: 'Dependent on ISP uplink; mitigated via bonded 4G/5G failover',
    complianceTitle: 'Agile Enterprise Fit',
    complianceText:
      'Ideal for multinationals, distributed corporate offices, and external client collaboration where rapid rollout, Microsoft 365 / Google Workspace calendar integration, and cross-platform guest links are primary priorities.',
  },
  onprem: {
    eyebrow: 'Architecture 02 · Private On-Premises IP / SIP & H.323',
    heading: 'Self-Hosted SIP Trunking, Grandstream UCM6308 & Hardware Codecs',
    summary:
      'Signalling and multipoint media switching remain strictly inside your private MPLS or corporate VLAN perimeter using standards-based hardware codecs (Poly G7500, Polycom RealPresence Group 500, Cisco Room Kit Plus) registered to on-premises SIP PBXs such as Grandstream UCM6308. No audio, video, or attendee metadata leaves your facility.',
    encryption: 'SIP over TLS · H.235 / AES-256 Hardware SRTP',
    survivability: '100% LAN / MPLS survivability during external internet blackouts',
    complianceTitle: 'Defence, Banking & Data Sovereignty Mandate',
    complianceText:
      'Built for commercial banking cores, defence establishments, judicial chambers, and federal ministries requiring air-gapped LAN operation, domestic archival custody, and zero external cloud outage risk.',
  },
  hybrid: {
    eyebrow: 'Architecture 03 · Hybrid Dual-Registration & Broadcast Bridge',
    heading: 'Simultaneous SIP Intranet + Cloud Guest Bridging & Multi-Cam Streaming',
    summary:
      'Combines hardware video conference codecs with Session Border Controllers (SBCs) and SDI/XLR mix-minus broadcast switchers. Internal executive rooms connect over private encrypted SIP/H.323 while external shareholders, remote panellists, or listed-company AGM participants join seamlessly over Zoom, Microsoft Teams, or 1080p60 RTMP streams.',
    encryption: 'Dual-Zone SBC Isolation · Encrypted SECP AGM Logs',
    survivability: 'Internal rooms stay live on local SIP PBX; external stream fails over to 5G',
    complianceTitle: 'SECP / PSX AGMs & Tri-City Summits',
    complianceText:
      'Engineered for listed-company AGMs/EGMs and simultaneous Lahore–Karachi–Islamabad policy forums requiring verified shareholder attendance records, simultaneous interpretation channels, and 99.99% uptime.',
  },
};

const SIGNAL_NODES = [
  {
    stage: 'Stage 01 · Acoustic Pickup',
    shortName: 'Beamforming Mics',
    svgLabel: '01 · CAPTURE',
    svgTitle: 'Beamforming',
    svgSub: 'Ceiling / Table',
    title: 'Beamforming Ceiling & Table Microphone Arrays',
    desc: 'Multi-element MEMS beamforming arrays steer narrow 15°–30° pickup lobes onto the active speaker while rejecting HVAC fans, glass reflections, and keyboard clatter. Unlike omnidirectional laptop microphones, vocal clarity stays uniform across 6–10 metres from the display wall.',
    spec: 'KEY METRIC: 6–10 m pickup radius · Acoustic Fence noise-isolation zone',
  },
  {
    stage: 'Stage 02 · Hardware Audio DSP',
    shortName: 'DSP AEC & Mix-Minus',
    svgLabel: '02 · AUDIO DSP',
    svgTitle: 'Hardware AEC',
    svgSub: 'Mix-Minus Bus',
    title: 'Hardware Acoustic Echo Cancellation (AEC) & Mix-Minus Buses',
    desc: 'Dedicated DSP processors run per-channel hardware AEC and build an isolated mix-minus bus: remote speakers are routed cleanly to the room PA (such as Bosch PAVIRO PVA-2P500) while being mathematically subtracted from the return codec uplink—eliminating feedback howl and remote echo.',
    spec: 'KEY METRIC: Full-duplex double-talk · Zero echo on PA + Teams/Zoom bridge',
  },
  {
    stage: 'Stage 03 · Optical Framing',
    shortName: 'Optical PTZ Tracking',
    svgLabel: '03 · OPTICS',
    svgTitle: 'Optical PTZ',
    svgSub: 'Speaker Frame',
    title: 'Motorised Optical PTZ & AI Multi-Speaker Framing',
    desc: 'Enterprise video conference bars and integrator codecs (Poly Studio X72, Logitech Rally Bar, Cisco Room Kit Plus, Polycom Group 500) pair 4K sensors with 5×–25× optical PTZ lenses. AI director framing captures active panellists in crisp portrait detail without blurry digital crop.',
    spec: 'KEY METRIC: 4K60 optical zoom · Sub-second active speaker framing',
  },
  {
    stage: 'Stage 04 · Video Matrix & Codecs',
    shortName: 'Dual-4K Routing',
    svgLabel: '04 · CODEC',
    svgTitle: 'Dual-4K Route',
    svgSub: 'People + Content',
    title: 'Dual-Display 4K Content Routing & Confidence Monitors',
    desc: 'Dedicated hardware codecs route remote participants onto Display A and razor-sharp 4K slides onto Display B, while stage presenters use floor confidence monitors or Fold-Flat Podium Teleprompters. Auditoriums drive 3,840 Hz P2.5 SMD LED walls with zero camera flicker.',
    spec: 'KEY METRIC: Dual HDMI/SDI 4K60 outputs · 3,840 Hz camera-safe LED drive',
  },
  {
    stage: 'Stage 05 · Network Resilience',
    shortName: 'Bonded WAN Failover',
    svgLabel: '05 · WAN',
    svgTitle: 'Bonded WAN',
    svgSub: 'Fibre + 5G',
    title: 'QoS Voice/Video VLANs & Bonded Fibre + 4G/5G Failover',
    desc: 'Enterprise meeting rooms isolate video conference traffic on DSCP/QoS-prioritised Gigabit VLANs. For critical townhalls and SECP AGMs, bonded routers merge dedicated wired fibre with multi-carrier 4G/5G failover and dual RTMP/SIP encoders so venue Wi-Fi congestion never drops a call.',
    spec: 'KEY METRIC: 99.99% broadcast uptime SLA · Seamless packet-level failover',
  },
];

const FEATURED_PRODUCT_SLUGS = [
  'poly-studio-usb-video-bar-pakistan',
  'poly-studio-x52-pakistan',
  'logitech-rally-bar-pakistan',
  'polycom-realpresence-group-500-pakistan',
  'poly-studio-x72-pakistan',
  'cisco-room-kit-plus-pakistan',
  'poly-g7500-pakistan',
  'horion-k6a-bundle-special-offer',
];

const HARDWARE_CATALOGUE: HardwareRow[] = [
  { slug: 'poly-studio-usb-video-bar-pakistan', model: 'Poly Studio USB Video Bar', vendor: 'HP Poly', mpn: '7200-85830-012', role: 'Huddle & small room USB 4K video bar (2–6 Pax)', price: 248000, cat: 'codec' },
  { slug: 'poly-studio-v52-pakistan', model: 'HP Poly Studio V52', vendor: 'HP Poly', mpn: 'A09D4AA', role: 'Medium room 20MP 4K USB video bar (6–12 Pax)', price: 485000, cat: 'codec' },
  { slug: 'poly-studio-x32-pakistan', model: 'HP Poly Studio X32', vendor: 'HP Poly', mpn: 'A3SV5AA', role: 'All-in-one Cloud / SIP video conference appliance', price: 495000, cat: 'codec' },
  { slug: 'logitech-rally-bar-mini-pakistan', model: 'Logitech Rally Bar Mini', vendor: 'Logitech', mpn: '960-001336', role: 'Huddle & small room standalone 4K AI bar', price: 635000, cat: 'codec' },
  { slug: 'polycom-realpresence-group-500-pakistan', model: 'Polycom RealPresence Group 500', vendor: 'Polycom', mpn: '7200-64550-001', role: 'Boardroom H.323/SIP codec + 12x optical PTZ', price: 745000, cat: 'codec' },
  { slug: 'poly-studio-x52-pakistan', model: 'HP Poly Studio X52', vendor: 'HP Poly', mpn: '7200-87620-001', role: 'Medium boardroom 20MP 4K DirectorAI appliance', price: 765000, cat: 'codec' },
  { slug: 'logitech-rally-bar-pakistan', model: 'Logitech Rally Bar', vendor: 'Logitech', mpn: '960-001308', role: 'Medium-to-large room 15x optical/HD PTZ bar', price: 865000, cat: 'codec' },
  { slug: 'cisco-room-bar-pakistan', model: 'Cisco Room Bar', vendor: 'Cisco', mpn: 'CS-BAR-NR-K9', role: 'All-in-one Webex / Teams / Zoom bar + Navigator', price: 895000, cat: 'codec' },
  { slug: 'poly-studio-x72-pakistan', model: 'HP Poly Studio X72 (X70 Series)', vendor: 'HP Poly', mpn: 'A4LZ8AA', role: 'Large room dual-lens 4K 20MP AI video bar', price: 1165000, cat: 'codec' },
  { slug: 'poly-g7500-pakistan', model: 'HP Poly G7500 Modular Codec', vendor: 'HP Poly', mpn: '7200-87310-001', role: 'Modular dual-4K boardroom & auditorium codec', price: 1420000, cat: 'codec' },
  { slug: 'cisco-room-kit-plus-pakistan', model: 'Cisco Room Kit Plus (PTZ 4K)', vendor: 'Cisco', mpn: 'CS-KITPLPTZ4K-K9', role: 'Large executive boardroom Quad Camera + Codec Plus', price: 1780000, cat: 'codec' },
  { slug: 'cisco-room-kit-eq-pakistan', model: 'Cisco Room Kit EQ Bundle', vendor: 'Cisco', mpn: 'CS-KIT-EQ-C-K9', role: 'NVIDIA AI Quad-Camera triple-4K flagship bundle', price: 2620000, cat: 'codec' },
  { slug: 'horion-k6a-bundle-special-offer', model: 'Horion 65" K6A 4K Smart Board', vendor: 'Horion', mpn: 'HRN-K6A-65-BUNDLE', role: 'Interactive 4K display + 48MP AI camera & 8-mic array', price: 645000, cat: 'projection' },
  { slug: 'benq-tk705i-pakistan', model: 'BenQ TK705i 4K Projector', vendor: 'BenQ', mpn: 'BENQ-TK705I', role: '4K UHD 3,200-lumen meeting room projector', price: 398000, cat: 'projection' },
  { slug: 'optoma-gt4000uhd-pakistan', model: 'Optoma GT4000UHD Laser', vendor: 'Optoma', mpn: 'OPT-GT4000UHD', role: 'Ultra-short-throw 4,000-lumen 4K laser display', price: 625000, cat: 'projection' },
  { slug: 'sony-bravia-projector-7-pakistan', model: 'Sony BRAVIA Projector 7', vendor: 'Sony', mpn: 'VPL-XW5000ES', role: 'Native 4K SXRD laser auditorium projector', price: 1495000, cat: 'projection' },
  { slug: 'hikvision-ptz-camera-pakistan', model: 'Hikvision 25x Optical PTZ Camera', vendor: 'Hikvision', mpn: 'DS-2DE4A425IW-DE', role: '25x optical zoom audience & stage PTZ capture', price: 149000, cat: 'projection' },
  { slug: 'grandstream-ucm6308-pakistan', model: 'Grandstream UCM6308 IP PBX', vendor: 'Grandstream', mpn: 'UCM6308', role: 'On-premises SIP/video PBX (up to 3,000 users)', price: 425000, cat: 'voip' },
  { slug: 'bosch-paviro-pva-2p500-pakistan', model: 'Bosch PAVIRO PVA-2P500 Amp', vendor: 'Bosch', mpn: 'PVA-2P500', role: '2x500W EN 54-16 auditorium & hall PA amplifier', price: 375000, cat: 'voip' },
  { slug: '2n-ip-vario-intercom-pakistan', model: '2N IP Vario SIP Intercom', vendor: '2N', mpn: '9137161U', role: 'SIP boardroom door access & reception intercom', price: 148000, cat: 'voip' },
  { slug: 'yealink-bh70-headset-pakistan', model: 'Yealink BH70 Dual UC Headset', vendor: 'Yealink', mpn: 'BH70-DUAL-UC', role: '3-mic AI noise-canceling wireless UC headset', price: 42000, cat: 'voip' },
  { slug: 'polycom-vvx-250-pakistan', model: 'Polycom VVX 250 IP Phone', vendor: 'Polycom', mpn: '2200-48820-025', role: '4-line Gigabit SIP conference desk phone', price: 31500, cat: 'voip' },
];

const ADDONS: Record<AddonKey, ConfiguratorItem> = {
  ucm: { slug: 'grandstream-ucm6308-pakistan', name: 'Grandstream UCM6308 IP PBX', mpn: 'UCM6308', price: 425000, brand: 'Grandstream' },
  vvx: { slug: 'polycom-vvx-250-pakistan', name: 'Polycom VVX 250 IP Desk Phone', mpn: '2200-48820-025', price: 31500, brand: 'Polycom' },
  intercom: { slug: '2n-ip-vario-intercom-pakistan', name: '2N IP Vario SIP Room Intercom', mpn: '9137161U', price: 148000, brand: '2N' },
  bosch: { slug: 'bosch-paviro-pva-2p500-pakistan', name: 'Bosch PAVIRO PVA-2P500 PA Amp', mpn: 'PVA-2P500', price: 375000, brand: 'Bosch' },
  headset: { slug: 'yealink-bh70-headset-pakistan', name: 'Yealink BH70 Dual UC Headset', mpn: 'BH70-DUAL-UC', price: 42000, brand: 'Yealink' },
};

const VIDEO_CONFERENCE_FAQS = [
  {
    q: 'What is the cost of a complete enterprise video conference system in Pakistan?',
    a: 'Verified video conference hardware in Pakistan starts at PKR 248,000 for a 2–6 person huddle bar (Poly Studio USB Video Bar, MPN 7200-85830-012), ranges from PKR 495,000 to PKR 960,000 for 6–14 seat rooms (Poly Studio X32/X52, Logitech Rally Bar, Cisco Room Bar), and spans PKR 1,165,000 to PKR 2,980,000+ for 15–30+ seat executive boardrooms (Poly Studio X72, Poly G7500, Cisco Room Kit Plus/EQ) including acoustic calibration and concealed cabling.',
  },
  {
    q: 'Why does a dedicated video conference room stack outperform a standard laptop webcam?',
    a: 'Consumer webcams rely on software OS echo cancellation that clips double-talk and lose facial clarity beyond 2.5 metres. Enterprise video conference stacks combine multi-element beamforming microphone arrays (6–10 m range), dedicated hardware DSP mix-minus echo cancellation, optical PTZ speaker tracking, and dual-4K content routing for full-duplex natural conversation.',
  },
  {
    q: 'Can one video conference system join Microsoft Teams, Zoom, Google Meet, and Cisco Webex?',
    a: 'Yes. Modern room appliances from HP Poly (Studio X32, X52, X72, G7500), Logitech (Rally Bar / Mini), and Cisco (Room Bar, Room Kit Plus/EQ) run native Microsoft Teams Rooms or Zoom Rooms while supporting Direct Guest Join, standards-based H.323/SIP dialling, and single-cable USB-C BYOD mode for any visiting laptop.',
  },
  {
    q: 'Should our organisation choose Cloud SaaS or Private On-Premises SIP / H.323 video conferencing?',
    a: 'Choose Cloud SaaS (Teams Rooms, Zoom Rooms, Webex) for rapid deployment, calendar one-touch join, and external client meetings. Choose Private On-Premises IP/SIP & H.323 (Grandstream UCM6308 + Poly G7500 / Polycom Group 500 / Cisco Room Kit) if you are a bank, defence agency, or ministry requiring 100% LAN data sovereignty and internal calling survivability during external internet outages.',
  },
  {
    q: 'How do you prevent acoustic echo in glass-walled boardrooms or large auditoriums?',
    a: 'Our acoustic engineers perform an on-site RT60 reverberation assessment before installation. For glass-walled rooms we activate Poly Acoustic Fence / NoiseBlockAI and place directional table or ceiling beamforming mics close to speakers; for auditoriums and hybrid AGMs we deploy hardware DSP mix-minus buses that subtract remote voices from the PA return feed.',
  },
  {
    q: 'Can AV Live bridge multi-city hybrid AGMs and summits across Lahore, Karachi, and Islamabad?',
    a: 'Yes. We deliver turnkey SECP/PSX-compliant hybrid AGMs and tri-city summits combining 3,840 Hz P2.5 SMD LED walls, 3–4 camera SDI switching, Poly/Cisco codec bridges, simultaneous interpretation, bonded fibre + 4G/5G failover, and standby on-site engineers with a 99.99% uptime SLA.',
  },
  {
    q: 'Are official OEM warranties, FBR GST invoices, and PPRA tender documents included?',
    a: 'Yes. Every video conference unit supplied by AV Live Communications is factory-sealed and serial-verified with a 1-to-3 year official local Pakistan warranty, Manufacturer Authorization Letters (MAL) for PPRA/HEC tenders, and FBR GST/NTN tax invoicing.',
  },
  {
    q: 'How fast is on-site installation and technical SLA response across Pakistan?',
    a: 'Standard huddle and medium rooms are installed and calibrated within 24–48 hours of equipment dispatch. Enterprise clients receive a guaranteed 15-minute remote engineering SLA and rapid on-site dispatch from our regional offices in Lahore (Johar Town HQ), Karachi (Clifton), and Islamabad (Blue Area).',
  },
];

function formatPkr(amount: number): string {
  return `Rs. ${Number(amount).toLocaleString('en-PK')}`;
}

function getRecommendation(
  room: RoomTypeKey,
  protocol: ProtocolKey,
  vendor: VendorPrefKey
): {
  primary: ConfiguratorItem;
  secondary: ConfiguratorItem | null;
  altText: string;
  notes: string;
  turnkeyBand: string;
} {
  let primary: ConfiguratorItem = {
    slug: 'poly-studio-usb-video-bar-pakistan',
    name: 'Poly Studio USB Video Bar',
    mpn: '7200-85830-012',
    price: 248000,
    brand: 'HP Poly',
  };
  let secondary: ConfiguratorItem | null = null;
  let altText = '';
  let notes = '';
  let turnkeyBand = '';

  if (room === 'huddle') {
    turnkeyBand = 'TURNKEY INTEGRATION BENCHMARK: Rs. 248,000 – Rs. 650,000 (room display & cabling optional)';
    if (vendor === 'logitech') {
      primary = { slug: 'logitech-rally-bar-mini-pakistan', name: 'Logitech Rally Bar Mini', mpn: '960-001336', price: 635000, brand: 'Logitech' };
      notes = 'Compact standalone 4K appliance for 2–6 seat huddle spaces with RightSight 2 AI Viewfinder and native Teams/Zoom Rooms OS.';
      altText = 'Alternative: Poly Studio USB Video Bar (MPN: 7200-85830-012 · Rs. 248,000) for BYOD USB host laptops.';
    } else if (vendor === 'cisco') {
      primary = { slug: 'cisco-room-bar-pakistan', name: 'Cisco Room Bar', mpn: 'CS-BAR-NR-K9', price: 895000, brand: 'Cisco' };
      notes = 'All-in-one Cisco RoomOS appliance with Room Navigator touch panel, certified for Webex, Microsoft Teams, Zoom, and SIP.';
      altText = 'Alternative: HP Poly Studio X32 (MPN: A3SV5AA · Rs. 495,000) or Logitech Rally Bar Mini (Rs. 635,000).';
    } else if (protocol === 'onprem') {
      primary = { slug: 'poly-studio-x32-pakistan', name: 'HP Poly Studio X32', mpn: 'A3SV5AA', price: 495000, brand: 'HP Poly' };
      notes = 'Standalone SIP/H.323-capable room bar registering directly to an on-premises Grandstream UCM6308 IP PBX without an external room PC.';
      altText = 'Alternative: Logitech Rally Bar Mini (MPN: 960-001336 · Rs. 635,000) or Poly Studio USB + PC soft-client.';
    } else {
      primary = { slug: 'poly-studio-usb-video-bar-pakistan', name: 'Poly Studio USB Video Bar', mpn: '7200-85830-012', price: 248000, brand: 'HP Poly' };
      notes = 'High-value 4K USB video conference bar with Poly Acoustic Fence, NoiseBlockAI, and speaker tracking for 2–6 seat huddle spaces.';
      altText = 'Alternative: HP Poly Studio X32 (MPN: A3SV5AA · Rs. 495,000) or Logitech Rally Bar Mini (MPN: 960-001336 · Rs. 635,000).';
    }
  } else if (room === 'medium') {
    turnkeyBand = 'TURNKEY INTEGRATION BENCHMARK: Rs. 650,000 – Rs. 1,250,000 (incl. 4K display & acoustic cabling)';
    if (vendor === 'logitech') {
      primary = { slug: 'logitech-rally-bar-pakistan', name: 'Logitech Rally Bar', mpn: '960-001308', price: 865000, brand: 'Logitech' };
      notes = 'Motorised 5× optical PTZ bar (15× total zoom) with anti-vibration stereo speakers and RightSight 2 framing for 6–14 seat rooms.';
      altText = 'Alternative: HP Poly Studio X52 (MPN: 7200-87620-001 · Rs. 765,000) or Poly Studio V52 (Rs. 485,000).';
    } else if (vendor === 'cisco') {
      primary = { slug: 'cisco-room-bar-pakistan', name: 'Cisco Room Bar', mpn: 'CS-BAR-NR-K9', price: 895000, brand: 'Cisco' };
      secondary = { slug: 'benq-tk705i-pakistan', name: 'BenQ TK705i 4K Room Projector', mpn: 'BENQ-TK705I', price: 398000, brand: 'BenQ' };
      notes = 'Cisco Room Bar + 10.1" Room Navigator delivering Webex, Teams, and encrypted SIP registration with dual-screen 4K content routing.';
      altText = 'Alternative: Cisco Room Kit Plus (MPN: CS-KITPLPTZ4K-K9 · Rs. 1,780,000) or Logitech Rally Bar (Rs. 865,000).';
    } else if (vendor === 'poly') {
      primary = { slug: 'poly-studio-x52-pakistan', name: 'HP Poly Studio X52', mpn: '7200-87620-001', price: 765000, brand: 'HP Poly' };
      secondary = { slug: 'benq-tk705i-pakistan', name: 'BenQ TK705i 4K Room Projector', mpn: 'BENQ-TK705I', price: 398000, brand: 'BenQ' };
      notes = '20MP 4K UltraHD all-in-one appliance with 95° distortion-free optics and Poly DirectorAI framing across 6–14 seat conference tables.';
      altText = 'Alternative: Poly Studio V52 (MPN: A09D4AA · Rs. 485,000) for USB MTR PC deployments or Logitech Rally Bar (Rs. 865,000).';
    } else {
      primary = { slug: 'logitech-rally-bar-pakistan', name: 'Logitech Rally Bar', mpn: '960-001308', price: 865000, brand: 'Logitech' };
      notes = 'Optimal 6–14 seat conference room stack with motorised optical PTZ, low-distortion speakers, and native Teams/Zoom/SIP operation.';
      altText = 'Alternative: HP Poly Studio X52 (MPN: 7200-87620-001 · Rs. 765,000) or Cisco Room Bar (MPN: CS-BAR-NR-K9 · Rs. 895,000).';
    }
  } else if (room === 'boardroom') {
    turnkeyBand = 'TURNKEY 30-SEAT BOARDROOM BENCHMARK: Rs. 1,450,000 – Rs. 3,200,000 (incl. dual 4K panels & ceiling mics)';
    if (vendor === 'cisco') {
      primary = { slug: 'cisco-room-kit-plus-pakistan', name: 'Cisco Room Kit Plus (PTZ 4K)', mpn: 'CS-KITPLPTZ4K-K9', price: 1780000, brand: 'Cisco' };
      secondary = { slug: 'optoma-gt4000uhd-pakistan', name: 'Optoma GT4000UHD 4K Laser Display', mpn: 'OPT-GT4000UHD', price: 625000, brand: 'Optoma' };
      notes = 'Enterprise 15–30 seat executive boardroom architecture with Quad Camera 5K speaker tracking, dual-display routing, and native SIP/H.323 + Webex/Teams.';
      altText = 'Alternative: Poly G7500 Modular Codec (MPN: 7200-87310-001 · Rs. 1,420,000) or Poly Studio X72 (Rs. 1,165,000).';
    } else if (vendor === 'logitech') {
      primary = { slug: 'logitech-rally-bar-pakistan', name: 'Logitech Rally Bar', mpn: '960-001308', price: 865000, brand: 'Logitech' };
      secondary = { slug: 'horion-k6a-bundle-special-offer', name: 'Horion 65" K6A 4K Smart Board', mpn: 'HRN-K6A-65-BUNDLE', price: 645000, brand: 'Horion' };
      notes = 'Scaled with daisy-chained Rally Mic Pods for 15–22 seat table coverage paired with a 65" 4K interactive boardroom display.';
      altText = 'Alternative: Poly G7500 (MPN: 7200-87310-001 · Rs. 1,420,000) or Cisco Room Kit Plus (Rs. 1,780,000).';
    } else if (vendor === 'poly') {
      primary = { slug: 'poly-studio-x72-pakistan', name: 'HP Poly Studio X72 (X70 Series)', mpn: 'A4LZ8AA', price: 1165000, brand: 'HP Poly' };
      secondary = { slug: 'optoma-gt4000uhd-pakistan', name: 'Optoma GT4000UHD 4K Laser Display', mpn: 'OPT-GT4000UHD', price: 625000, brand: 'Optoma' };
      notes = 'Dual 20MP 4K wide + telephoto camera bar with 7.6 m beamforming pickup and seamless DirectorAI transitions for large executive rooms.';
      altText = 'Alternative: Poly G7500 Modular Codec (Rs. 1,420,000) or Polycom RealPresence Group 500 (Rs. 745,000).';
    } else {
      primary = { slug: 'poly-g7500-pakistan', name: 'HP Poly G7500 Modular 4K Codec', mpn: '7200-87310-001', price: 1420000, brand: 'HP Poly' };
      secondary = { slug: 'optoma-gt4000uhd-pakistan', name: 'Optoma GT4000UHD 4K Laser Display', mpn: 'OPT-GT4000UHD', price: 625000, brand: 'Optoma' };
      notes = 'Modular flagship boardroom codec supporting ceiling beamforming mic arrays, dual-4K displays, H.323/SIP sovereignty, and cloud Teams/Zoom bridging.';
      altText = 'Alternative: Cisco Room Kit Plus PTZ 4K (MPN: CS-KITPLPTZ4K-K9 · Rs. 1,780,000) or Poly Studio X72 (Rs. 1,165,000).';
    }
  } else {
    turnkeyBand = 'TURNKEY HALL & HYBRID BROADCAST BENCHMARK: Rs. 550,000 – Rs. 5,000,000+ (P2.5 SMD LED + 3–4 Cam SDI + Bonded WAN)';
    if (vendor === 'cisco') {
      primary = { slug: 'cisco-room-kit-eq-pakistan', name: 'Cisco Room Kit EQ Flagship Bundle', mpn: 'CS-KIT-EQ-C-K9', price: 2620000, brand: 'Cisco' };
      secondary = { slug: 'sony-bravia-projector-7-pakistan', name: 'Sony BRAVIA Projector 7 (4K Laser)', mpn: 'VPL-XW5000ES', price: 1495000, brand: 'Sony' };
      notes = 'Auditorium-grade NVIDIA AI multi-camera bridge feeding 4K laser projection or 3,840 Hz P2.5 SMD LED walls with mix-minus DSP PA isolation.';
      altText = 'Alternative: Poly G7500 (Rs. 1,420,000) + Hikvision 25x Optical PTZ Camera (Rs. 149,000).';
    } else {
      primary = { slug: 'poly-g7500-pakistan', name: 'HP Poly G7500 Modular 4K Codec', mpn: '7200-87310-001', price: 1420000, brand: 'HP Poly' };
      secondary = { slug: 'sony-bravia-projector-7-pakistan', name: 'Sony BRAVIA Projector 7 (4K Laser)', mpn: 'VPL-XW5000ES', price: 1495000, brand: 'Sony' };
      notes = 'Full auditorium video conference & hybrid AGM core: Poly G7500 mix-minus bridge, native 4K SXRD laser projection (or P2.5 SMD wall), and multi-cam PTZ capture.';
      altText = 'Alternative: Cisco Room Kit Plus PTZ 4K (Rs. 1,780,000) or Polycom Group 500 (Rs. 745,000). Add Bosch PAVIRO PVA-2P500 for hall PA.';
    }
  }

  if (protocol === 'onprem') {
    notes += ' Configured for private LAN SIP/H.323 survivability with zero external cloud dependency for internal calls.';
  } else if (protocol === 'hybrid') {
    notes += ' Configured with dual-zone mix-minus audio routing for simultaneous cloud webcast and SIP/PA bridging.';
  }

  return { primary, secondary, altText, notes, turnkeyBand };
}

export function VideoConferenceHub() {
  const [activeYearIdx, setActiveYearIdx] = useState<number>(HISTORY_SERIES.length - 1);
  const [protocolTab, setProtocolTab] = useState<ProtocolKey>('cloud');
  const [signalNodeIdx, setSignalNodeIdx] = useState<number>(0);

  // Room Configurator State
  const [roomType, setRoomType] = useState<RoomTypeKey>('boardroom');
  const [cfgProtocol, setCfgProtocol] = useState<ProtocolKey>('hybrid');
  const [cfgVendor, setCfgVendor] = useState<VendorPrefKey>('optimal');
  const [cfgCity, setCfgCity] = useState<CityHubKey>('lahore');
  const [addons, setAddons] = useState<Record<AddonKey, boolean>>({
    ucm: false,
    vvx: false,
    intercom: false,
    bosch: false,
    headset: false,
  });
  const [resetArmed, setResetArmed] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [addedSlug, setAddedSlug] = useState<string | null>(null);

  // Matrix filter & FAQ state
  const [matrixFilter, setMatrixFilter] = useState<MatrixFilterKey>('all');
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

  const featuredProducts = useMemo(() => {
    return FEATURED_PRODUCT_SLUGS.map((slug) => buildFallbackProductFromGmcMeta(slug)).filter(
      Boolean
    ) as Array<Record<string, any>>;
  }, []);

  const rec = useMemo(
    () => getRecommendation(roomType, cfgProtocol, cfgVendor),
    [roomType, cfgProtocol, cfgVendor]
  );

  const selectedAddonsList = useMemo(
    () => (Object.keys(ADDONS) as AddonKey[]).filter((k) => addons[k]).map((k) => ADDONS[k]),
    [addons]
  );

  const addonsTotal = useMemo(
    () => selectedAddonsList.reduce((acc, item) => acc + item.price, 0),
    [selectedAddonsList]
  );

  const bomTotal = rec.primary.price + (rec.secondary ? rec.secondary.price : 0) + addonsTotal;

  const filteredHardware = useMemo(() => {
    if (matrixFilter === 'all') return HARDWARE_CATALOGUE;
    return HARDWARE_CATALOGUE.filter((item) => item.cat === matrixFilter);
  }, [matrixFilter]);

  const handleToggleAddon = (key: AddonKey) => {
    setAddons((prev) => ({ ...prev, [key]: !prev[key] }));
    setResetArmed(false);
    setStatusMsg('');
  };

  const handleResetConfigurator = () => {
    if (!resetArmed) {
      setResetArmed(true);
      return;
    }
    setResetArmed(false);
    setRoomType('huddle');
    setCfgProtocol('cloud');
    setCfgVendor('optimal');
    setCfgCity('lahore');
    setAddons({ ucm: false, vvx: false, intercom: false, bosch: false, headset: false });
    setStatusMsg('Configuration reset to Huddle Space (2–6 Pax) baseline.');
  };

  const handleExportBomCsv = () => {
    const rows: string[][] = [
      ['Category', 'Model', 'MPN', 'Reference Price (PKR)', 'SLA / Hub'],
      [
        'Primary Video Conference Endpoint',
        rec.primary.name,
        rec.primary.mpn,
        String(rec.primary.price),
        `${cfgCity.toUpperCase()} 15-Min SLA`,
      ],
    ];
    if (rec.secondary) {
      rows.push(['Display / Optical Kit', rec.secondary.name, rec.secondary.mpn, String(rec.secondary.price), 'Included']);
    }
    for (const a of selectedAddonsList) {
      rows.push(['Optional Infrastructure Module', a.name, a.mpn, String(a.price), 'Included']);
    }
    rows.push(['TOTAL (Excl. GST)', `${roomType} / ${cfgProtocol}`, '-', String(bomTotal), 'PPRA / FBR GST-NTN Compliant']);

    const csv = rows
      .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    try {
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `avlive-video-conference-bom-${roomType}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setStatusMsg(`Downloaded avlive-video-conference-bom-${roomType}.csv (${rows.length - 1} line items).`);
    } catch {
      setStatusMsg(`BoM summary prepared (${rows.length - 1} items · ${formatPkr(bomTotal)}).`);
    }
  };

  const handleAddConfiguredStackToCart = () => {
    const itemsToAdd: ConfiguratorItem[] = [rec.primary];
    if (rec.secondary) itemsToAdd.push(rec.secondary);
    itemsToAdd.push(...selectedAddonsList);

    for (const item of itemsToAdd) {
      const meta = buildFallbackProductFromGmcMeta(item.slug);
      addToCart(
        {
          id: meta?.id || item.slug,
          slug: item.slug,
          productName: meta?.productName || item.name,
          brand: meta?.brand || item.brand,
          sku: meta?.sku || item.mpn,
          salePrice: item.price,
          regularPrice: meta?.regularPrice || item.price,
          images: meta?.images || ['/images/video-conference/boardroom-hero.webp'],
          stockQuantity: 10,
        },
        1
      );
    }
    setStatusMsg(`Added ${itemsToAdd.length} configured hardware item${itemsToAdd.length > 1 ? 's' : ''} (${formatPkr(bomTotal)}) to cart.`);
  };

  const handleQuickAddProduct = (prod: Record<string, any>) => {
    addToCart(
      {
        id: prod.id || prod.slug,
        slug: prod.slug,
        productName: prod.productName,
        brand: prod.brand,
        sku: prod.sku,
        salePrice: prod.salePrice,
        regularPrice: prod.regularPrice,
        images: prod.images || [],
        stockQuantity: 10,
      },
      1
    );
    setAddedSlug(prod.slug);
    setTimeout(() => setAddedSlug((cur) => (cur === prod.slug ? null : cur)), 2000);
  };

  // Native SVG chart coordinates (viewBox 640 x 260)
  const chartW = 640;
  const chartH = 260;
  const padL = 44;
  const padR = 20;
  const padT = 20;
  const padB = 34;
  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;
  const xFor = (i: number) => padL + (i / (HISTORY_SERIES.length - 1)) * plotW;
  const yFor = (val: number) => padT + plotH - (val / 100) * plotH;

  const buildPolyline = (key: 'cloudHybrid' | 'onPremSip' | 'travelOnly') =>
    HISTORY_SERIES.map((d, i) => `${xFor(i).toFixed(1)},${yFor(d[key]).toFixed(1)}`).join(' ');

  const activePoint = HISTORY_SERIES[activeYearIdx] || HISTORY_SERIES[HISTORY_SERIES.length - 1];
  const activeProto = PROTOCOL_DATA[protocolTab];
  const activeSignal = SIGNAL_NODES[signalNodeIdx];

  const roomMeta: Record<RoomTypeKey, { label: string; seats: number; layoutTitle: string; dualScreen: boolean; paBox: boolean; tableW: number }> = {
    huddle: { label: 'Huddle Space (2–6 Pax)', seats: 4, layoutTitle: 'HUDDLE LAYOUT · 2–6 PAX · SINGLE 4K DISPLAY + VIDEO BAR', dualScreen: false, paBox: false, tableW: 120 },
    medium: { label: 'Small / Medium Room (6–14 Pax)', seats: 10, layoutTitle: 'MEETING ROOM · 6–14 PAX · 4K DISPLAY + BEAMFORMING BAR', dualScreen: false, paBox: false, tableW: 180 },
    boardroom: { label: 'Executive Boardroom (15–30 Pax)', seats: 18, layoutTitle: 'EXECUTIVE BOARDROOM · 15–30 PAX · DUAL 4K DISPLAYS + CEILING MICS', dualScreen: true, paBox: false, tableW: 248 },
    auditorium: { label: 'Hall / Auditorium (50–500+ Pax)', seats: 30, layoutTitle: 'AUDITORIUM / HALL · 50–500+ PAX · P2.5 SMD WALL + PTZ + MIX-MINUS PA', dualScreen: true, paBox: true, tableW: 256 },
  };
  const currentRoom = roomMeta[roomType];

  const citySlaLabels: Record<CityHubKey, string> = {
    lahore: '15-Min SLA · Lahore HQ',
    karachi: '15-Min SLA · Karachi',
    islamabad: '15-Min SLA · Islamabad',
  };

  const structuredSchema = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebPage',
          '@id': 'https://avlive.com.pk/video-conference#webpage',
          url: 'https://avlive.com.pk/video-conference',
          name: 'Video Conference Systems & Boardroom Configurator | AV Live',
          description:
            'Enterprise video conference systems in Pakistan: Poly, Cisco & Logitech hardware, SIP/Teams/Zoom design & PKR room calculator.',
          isPartOf: { '@id': 'https://avlive.com.pk/#website' },
          about: { '@id': 'https://avlive.com.pk/#organization' },
          speakable: {
            '@type': 'SpeakableSpecification',
            cssSelector: ['h1', '#vc-answer-first', 'table'],
          },
        },
        {
          '@type': 'Service',
          '@id': 'https://avlive.com.pk/video-conference#service',
          name: 'Enterprise Video Conference Systems, Protocol Engineering & Boardroom Integration',
          serviceType: 'Video Conference Hardware Distribution & Hybrid Room Integration',
          provider: { '@id': 'https://avlive.com.pk/#organization' },
          areaServed: ['Lahore', 'Karachi', 'Islamabad', 'Pakistan'],
          url: 'https://avlive.com.pk/video-conference',
          offers: {
            '@type': 'AggregateOffer',
            priceCurrency: 'PKR',
            lowPrice: '248000',
            highPrice: '5000000',
            offerCount: String(HARDWARE_CATALOGUE.length),
          },
        },
        {
          '@type': 'ItemList',
          '@id': 'https://avlive.com.pk/video-conference#hardware-list',
          name: 'Verified Enterprise Video Conference Systems in Pakistan',
          numberOfItems: featuredProducts.length,
          itemListElement: featuredProducts.map((p, idx) => ({
            '@type': 'ListItem',
            position: idx + 1,
            name: p.productName,
            url: `https://avlive.com.pk${getProductHref(p, p.id)}`,
          })),
        },
        {
          '@type': 'FAQPage',
          '@id': 'https://avlive.com.pk/video-conference#faq',
          mainEntity: VIDEO_CONFERENCE_FAQS.map((item) => ({
            '@type': 'Question',
            name: item.q,
            acceptedAnswer: {
              '@type': 'Answer',
              text: item.a,
            },
          })),
        },
      ],
    }),
    [featuredProducts]
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A2B4C] pb-20">
      <SEO
        title="Video Conference Systems & Boardroom Configurator | AV Live"
        description="Enterprise video conference systems in Pakistan: Poly, Cisco & Logitech hardware, SIP/Teams/Zoom design & PKR room calculator."
        url="https://avlive.com.pk/video-conference"
        image="https://avlive.com.pk/images/video-conference/boardroom-hero-og.jpg"
        imageAlt="Enterprise video conference boardroom with dual 4K displays and beamforming microphone array by AV Live Pakistan"
        schema={structuredSchema}
      />

      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-14 lg:space-y-20">
        {/* Breadcrumb */}
        <div>
          <Breadcrumbs
            items={[
              { label: 'Home', path: '/' },
              { label: 'Video Conference', path: '/video-conference' },
            ]}
          />
        </div>

        {/* HERO & KPI MASTHEAD */}
        <header className="space-y-8 border-b border-slate-200 pb-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-medium text-slate-600">
                  <span>Enterprise AV Architecture</span>
                  <span aria-hidden="true">·</span>
                  <span>PPRA &amp; FBR GST-NTN Compliant</span>
                  <span aria-hidden="true">·</span>
                  <span>Lahore, Karachi &amp; Islamabad</span>
                </div>

                <h1 className="text-[clamp(2.1rem,3.6vw,3.35rem)] font-bold tracking-tight leading-[1.12] text-[#1A2B4C] [text-wrap:balance]">
                  Video Conference Systems &amp; Hybrid Communications Architecture
                </h1>

                <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-[60ch]">
                  Complete engineering reference, acoustic signal-chain guide, and interactive PKR Bill of Materials (BoM) configurator for enterprise{' '}
                  <strong className="font-semibold text-[#1A2B4C]">video conference</strong> deployments—from 2-person huddle spaces to multi-city SECP-compliant AGM broadcasts.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <a
                  href="#configurator"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[46px] bg-[#1A2B4C] hover:bg-[#00B4D8] text-white font-semibold text-sm rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  <span>Configure Room BoM</span>
                  <ArrowRight size={16} aria-hidden="true" />
                </a>
                <a
                  href="tel:+923214256263"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[46px] bg-white hover:bg-slate-50 text-[#1A2B4C] border border-slate-300 font-semibold text-sm rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  <Phone size={15} className="text-[#00B4D8]" aria-hidden="true" />
                  <span>Call 0321 425 6263</span>
                </a>
                <Link
                  to="/room-designer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-[#0077B6] hover:text-[#1A2B4C] transition-colors whitespace-nowrap shrink-0"
                >
                  <span>3D Room Designer</span>
                  <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="h-full rounded-xl overflow-hidden border border-slate-200 bg-slate-900">
                <img
                  src="/images/video-conference/boardroom-hero.webp"
                  alt="Flagship executive video conference boardroom with dual 4K commercial displays, beamforming microphones, and touch controller engineered by AV Live Pakistan"
                  width={1200}
                  height={675}
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  className="w-full h-full object-cover aspect-[16/9] lg:aspect-auto"
                />
              </div>
            </div>
          </div>

          {/* Answer-First Engineering Verdict for Search & AI Engines */}
          <div
            id="vc-answer-first"
            className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 text-sm sm:text-[15px] text-slate-700 leading-relaxed"
          >
            <span className="font-bold text-[#1A2B4C] mr-1.5">Direct Engineering Summary:</span>
            AV Live Communications designs, supplies, and calibrates turnkey{' '}
            <strong className="font-semibold text-[#1A2B4C]">video conference</strong> systems across Pakistan starting from{' '}
            <strong className="font-semibold text-[#1A2B4C] tabular-nums">Rs. 248,000</strong> (Poly Studio USB Video Bar) for 2–6 seat huddle spaces to{' '}
            <strong className="font-semibold text-[#1A2B4C] tabular-nums">Rs. 1,420,000 – Rs. 2,980,000+</strong> (Poly G7500, Poly Studio X72, Cisco Room Kit Plus/EQ, Logitech Rally Bar) for executive boardrooms and hybrid auditoriums—certified for Microsoft Teams Rooms, Zoom Rooms, Google Meet, and private on-premises H.323/SIP networks with a 15-minute nationwide SLA. Looking for our flagship national hardware &amp; regional deployment guide? Visit{' '}
            <Link to="/video-conference-in-pakistan" className="font-semibold text-[#0077B6] hover:underline">
              Video Conference in Pakistan
            </Link>.
          </div>

          {/* 4-Column KPI Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-1.5">
              <div className="text-xs font-medium text-slate-500">Engineering Response SLA</div>
              <div className="text-3xl font-bold tracking-tight text-[#1A2B4C] font-mono tabular-nums">15 min</div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Remote &amp; on-site dispatch from Lahore HQ, Karachi, and Islamabad.
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-1.5">
              <div className="text-xs font-medium text-slate-500">Multi-City Broadcast Uptime</div>
              <div className="text-3xl font-bold tracking-tight text-[#1A2B4C] font-mono tabular-nums">99.99%</div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Dedicated wired fibre bonded with multi-carrier 4G/5G failover.
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-1.5">
              <div className="text-xs font-medium text-slate-500">Camera-Safe LED Refresh</div>
              <div className="text-3xl font-bold tracking-tight text-[#1A2B4C] font-mono tabular-nums">3,840 Hz</div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Broadcast-grade LED drive eliminating shutter banding on 4K SDI feeds.
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-1.5">
              <div className="text-xs font-medium text-slate-500">Entry Hardware Reference</div>
              <div className="text-3xl font-bold tracking-tight text-[#0077B6] font-mono tabular-nums">Rs. 248k</div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Poly Studio USB (7200-85830-012) scaling to turnkey halls up to Rs. 5.0M+.
              </p>
            </div>
          </div>

          {/* Section Jump Navigation */}
          <nav aria-label="Page sections" className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 border-t border-slate-200 text-xs font-semibold text-[#0077B6]">
            <a href="#evolution" className="py-2 hover:text-[#1A2B4C] hover:underline whitespace-nowrap">01. 20-Year Evolution</a>
            <a href="#protocols" className="py-2 hover:text-[#1A2B4C] hover:underline whitespace-nowrap">02. Cloud vs. On-Premises SIP</a>
            <a href="#acoustics" className="py-2 hover:text-[#1A2B4C] hover:underline whitespace-nowrap">03. Acoustic &amp; Optical Stack</a>
            <a href="#configurator" className="py-2 hover:text-[#1A2B4C] hover:underline whitespace-nowrap">04. Room Configurator</a>
            <a href="#products" className="py-2 hover:text-[#1A2B4C] hover:underline whitespace-nowrap">05. Featured Systems</a>
            <a href="#catalogue" className="py-2 hover:text-[#1A2B4C] hover:underline whitespace-nowrap">06. Hardware Matrix &amp; QA</a>
            <a href="#faqs" className="py-2 hover:text-[#1A2B4C] hover:underline whitespace-nowrap">07. Technical FAQs</a>
          </nav>
        </header>

        {/* SECTION 01: TWO-DECADE VIDEO CONFERENCE EVOLUTION */}
        <section id="evolution" className="space-y-8">
          <div className="border-b border-slate-200 pb-4 space-y-1">
            <div className="text-xs font-semibold text-slate-500">01. Two-Decade Operational Transformation (2006–2026)</div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A2B4C]">
              How enterprise video conference rooms replaced inter-city air travel
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Native Zero-Dependency Interactive SVG Line Chart */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#1A2B4C]">
                    Enterprise Meeting Modality Shift &amp; Travel Displacement
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Share of multi-site executive &amp; institutional briefings (%) · Click or select any year below
                  </p>
                </div>
                <div className="text-xs font-mono tabular-nums text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
                  Year {activePoint.year}: Cloud/Hybrid {activePoint.cloudHybrid}% · SIP {activePoint.onPremSip}% · Travel {activePoint.travelOnly}%
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-slate-600">
                <span className="inline-flex items-center gap-2">
                  <span className="w-3 h-0.5 bg-[#0077B6] inline-block" aria-hidden="true" />
                  Cloud &amp; Hybrid Video Conference Stacks (%)
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="w-3 h-0.5 bg-[#6366F1] inline-block" aria-hidden="true" />
                  Private On-Premises IP / SIP &amp; H.323 (%)
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="w-3 h-0.5 border-t-2 border-dashed border-slate-400 inline-block" aria-hidden="true" />
                  In-Person Air/Inter-City Travel Required (%)
                </span>
              </div>

              <div className="w-full overflow-x-auto">
                <svg
                  viewBox={`0 0 ${chartW} ${chartH}`}
                  className="w-full h-auto min-w-[460px]"
                  role="img"
                  aria-label="20-year enterprise video conference adoption and physical travel displacement chart from 2006 to 2026"
                >
                  {[0, 25, 50, 75, 100].map((tick) => {
                    const y = yFor(tick);
                    return (
                      <g key={tick}>
                        <line x1={padL} y1={y} x2={chartW - padR} y2={y} stroke="#E2E8F0" strokeWidth="1" />
                        <text
                          x={padL - 8}
                          y={y + 4}
                          textAnchor="end"
                          fontSize="10"
                          fill="#64748B"
                          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                        >
                          {tick}%
                        </text>
                      </g>
                    );
                  })}

                  {/* Active year vertical guide */}
                  <line
                    x1={xFor(activeYearIdx)}
                    y1={padT}
                    x2={xFor(activeYearIdx)}
                    y2={chartH - padB}
                    stroke="#CBD5E1"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />

                  {/* Lines */}
                  <polyline
                    fill="none"
                    stroke="#94A3B8"
                    strokeWidth="2"
                    strokeDasharray="5 4"
                    points={buildPolyline('travelOnly')}
                  />
                  <polyline
                    fill="none"
                    stroke="#6366F1"
                    strokeWidth="2.25"
                    points={buildPolyline('onPremSip')}
                  />
                  <polyline
                    fill="none"
                    stroke="#0077B6"
                    strokeWidth="2.75"
                    points={buildPolyline('cloudHybrid')}
                  />

                  {/* Interactive Data Nodes */}
                  {HISTORY_SERIES.map((d, i) => {
                    const cx = xFor(i);
                    const isSelected = i === activeYearIdx;
                    return (
                      <g
                        key={d.year}
                        onClick={() => setActiveYearIdx(i)}
                        className="cursor-pointer"
                      >
                        <circle cx={cx} cy={yFor(d.travelOnly)} r={isSelected ? 4.5 : 3} fill="#94A3B8" />
                        <circle cx={cx} cy={yFor(d.onPremSip)} r={isSelected ? 5 : 3.2} fill="#6366F1" />
                        <circle cx={cx} cy={yFor(d.cloudHybrid)} r={isSelected ? 5.5 : 3.5} fill="#0077B6" />
                        <text
                          x={cx}
                          y={chartH - 10}
                          textAnchor="middle"
                          fontSize="11"
                          fontWeight={isSelected ? '700' : '500'}
                          fill={isSelected ? '#1A2B4C' : '#64748B'}
                          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                        >
                          {d.year}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 pt-1" role="group" aria-label="Select timeline year">
                {HISTORY_SERIES.map((d, i) => (
                  <button
                    key={d.year}
                    type="button"
                    onClick={() => setActiveYearIdx(i)}
                    className={`px-2.5 py-1.5 min-h-[34px] text-xs font-mono tabular-nums rounded-md transition-colors cursor-pointer ${
                      i === activeYearIdx
                        ? 'bg-[#1A2B4C] text-white font-semibold'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {d.year}
                  </button>
                ))}
              </div>
            </div>

            {/* 4 Architectural Phases */}
            <div className="lg:col-span-5 divide-y divide-slate-200 bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="p-4 sm:p-5 space-y-1">
                <div className="text-xs font-mono text-slate-500">Phase 1 · 2006–2011 · Dedicated ISDN &amp; H.323</div>
                <p className="text-sm text-slate-700 leading-relaxed">
                  Early telepresence demanded leased ISDN/MPLS circuits and proprietary H.323 codecs—restricting video conferences to headquarters while regional teams flew domestically for routine governance.
                </p>
              </div>
              <div className="p-4 sm:p-5 space-y-1">
                <div className="text-xs font-mono text-slate-500">Phase 2 · 2012–2018 · IP SIP &amp; HD Bridges</div>
                <p className="text-sm text-slate-700 leading-relaxed">
                  IP SIP trunking and hardware codecs such as the{' '}
                  <Link to="/product/polycom-realpresence-group-500-pakistan" className="text-[#0077B6] font-semibold hover:underline">
                    Polycom RealPresence Group 500
                  </Link>{' '}
                  slashed bandwidth barriers, linking Lahore, Karachi, and Islamabad in real time.
                </p>
              </div>
              <div className="p-4 sm:p-5 space-y-1">
                <div className="text-xs font-mono text-slate-500">Phase 3 · 2019–2022 · Cloud SaaS Ubiquity</div>
                <p className="text-sm text-slate-700 leading-relaxed">
                  Zoom Rooms, Microsoft Teams Rooms, and Cisco Webex standardized software-defined meetings, saving millions of travel hours while exposing the acoustic limits of consumer webcams.
                </p>
              </div>
              <div className="p-4 sm:p-5 space-y-1 bg-slate-50">
                <div className="text-xs font-mono font-semibold text-[#0077B6]">Phase 4 · 2023–2026 · Zero-Echo AI &amp; Hybrid Broadcast</div>
                <p className="text-sm text-slate-800 leading-relaxed">
                  Modern enterprise video conference rooms unite dual-4K optical PTZ tracking, hardware DSP mix-minus echo cancellation, and cloud-to-SIP gateways for sub-second parity with global stakeholders.
                </p>
              </div>
            </div>
          </div>

          {/* Editorial Media Split + 3 Institutional Verticals */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-5 rounded-xl overflow-hidden border border-slate-200 bg-slate-900">
              <img
                src="/images/video-conference/hybrid-summit.webp"
                alt="Hybrid AGM and multi-city enterprise video conference auditorium with curved SMD LED backdrop and optical PTZ broadcast cameras"
                width={1200}
                height={675}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover aspect-[16/9] lg:aspect-auto"
              />
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <article className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="text-xs font-medium text-slate-500">Enterprise &amp; Banking</div>
                  <h3 className="text-base font-bold text-[#1A2B4C]">SECP AGMs &amp; Board Governance</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Listed companies run statutory AGMs/EGMs linking Karachi, Lahore, and Islamabad with two-way shareholder Q&amp;A, verified attendance logs, and encrypted local archives.
                  </p>
                </div>
                <Link to="/services/hybrid-events" className="text-xs font-semibold text-[#0077B6] hover:underline inline-flex items-center gap-1">
                  Hybrid AGM Production <ArrowRight size={13} aria-hidden="true" />
                </Link>
              </article>

              <article className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="text-xs font-medium text-slate-500">Government &amp; Diplomatic</div>
                  <h3 className="text-base font-bold text-[#1A2B4C]">Multi-Agency &amp; Policy Forums</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Federal ministries and Islamabad diplomatic enclaves bridge international delegates with simultaneous interpretation and PPRA-compliant encrypted H.323/SIP stacks.
                  </p>
                </div>
                <Link to="/programs/government-education-pricing" className="text-xs font-semibold text-[#0077B6] hover:underline inline-flex items-center gap-1">
                  PPRA &amp; Gov Pricing <ArrowRight size={13} aria-hidden="true" />
                </Link>
              </article>

              <article className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="text-xs font-medium text-slate-500">Universities &amp; Medical CME</div>
                  <h3 className="text-base font-bold text-[#1A2B4C]">Hybrid Lecture &amp; Telemedicine</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    HEC campuses and accredited medical symposia stream dual-feed PTZ camera angles, high-resolution diagnostic visuals, and live captions to remote clinicians.
                  </p>
                </div>
                <Link to="/solutions" className="text-xs font-semibold text-[#0077B6] hover:underline inline-flex items-center gap-1">
                  Industry Solutions <ArrowRight size={13} aria-hidden="true" />
                </Link>
              </article>
            </div>
          </div>
        </section>

        {/* SECTION 02: UNIFIED COMMUNICATION PROTOCOLS */}
        <section id="protocols" className="space-y-6">
          <div className="border-b border-slate-200 pb-4 space-y-1">
            <div className="text-xs font-semibold text-slate-500">02. Unified Communication Protocol Architecture</div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A2B4C]">
              Cloud SaaS agility versus private on-premises IP / SIP sovereignty
            </h2>
          </div>

          <p className="text-sm sm:text-base text-slate-600 max-w-[70ch] leading-relaxed">
            Choosing between cloud-native video conference appliances and self-hosted IP/SIP infrastructure is a security, compliance, and WAN-survivability decision. Compare the three architectures below.
          </p>

          {/* Interactive Protocol Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-slate-200" role="tablist" aria-label="Video conference deployment architectures">
            {(
              [
                { key: 'cloud', label: 'Cloud SaaS (Teams / Zoom / Meet / Webex)' },
                { key: 'onprem', label: 'Private On-Premises IP / SIP & H.323' },
                { key: 'hybrid', label: 'Hybrid Dual-Registration & Broadcast Bridge' },
              ] as const
            ).map((tab) => {
              const active = protocolTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setProtocolTab(tab.key)}
                  className={`px-4 py-3 min-h-[44px] text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer -mb-px whitespace-nowrap ${
                    active
                      ? 'border-[#0077B6] text-[#1A2B4C]'
                      : 'border-transparent text-slate-500 hover:text-[#1A2B4C]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-6 space-y-5">
              <div className="space-y-1.5">
                <div className="text-xs font-mono text-[#0077B6]">{activeProto.eyebrow}</div>
                <h3 className="text-xl font-bold text-[#1A2B4C]">{activeProto.heading}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{activeProto.summary}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <div className="text-xs font-mono text-slate-500">Encryption Standard</div>
                  <div className="text-sm font-semibold text-[#1A2B4C] mt-1">{activeProto.encryption}</div>
                </div>
                <div>
                  <div className="text-xs font-mono text-slate-500">WAN Outage Survivability</div>
                  <div className="text-sm font-semibold text-[#1A2B4C] mt-1">{activeProto.survivability}</div>
                </div>
              </div>
            </div>

            <aside className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 text-sm font-bold text-[#1A2B4C]">
                  <ShieldCheck size={18} className="text-[#0077B6] shrink-0" aria-hidden="true" />
                  <span>{activeProto.complianceTitle}</span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{activeProto.complianceText}</p>
              </div>
              <div className="flex flex-wrap gap-3 text-xs font-semibold pt-3 border-t border-slate-100">
                <Link to="/zoom-rooms" className="text-[#0077B6] hover:underline">Zoom Rooms →</Link>
                <Link to="/microsoft-teams-rooms" className="text-[#0077B6] hover:underline">Teams Rooms →</Link>
                <Link to="/voip-service-providers" className="text-[#0077B6] hover:underline">SIP / IP-PBX →</Link>
              </div>
            </aside>
          </div>

          {/* Protocol Comparison Semantic Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <caption className="sr-only">
                  Comparison of Cloud SaaS, Private On-Premises SIP/H.323, and Hybrid Video Conference Architectures
                </caption>
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-xs font-mono uppercase tracking-wider text-slate-700">
                    <th className="px-4 py-3.5 font-semibold">Protocol / Dimension</th>
                    <th className="px-4 py-3.5 font-semibold">Cloud SaaS Rooms</th>
                    <th className="px-4 py-3.5 font-semibold">Private On-Premises IP / SIP &amp; H.323</th>
                    <th className="px-4 py-3.5 font-semibold">Hybrid Cloud + SIP Gateway</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="px-4 py-3.5 font-semibold text-[#1A2B4C]">Primary Platforms</td>
                    <td className="px-4 py-3.5 text-slate-600">Zoom Rooms, Microsoft Teams Rooms, Google Meet, Cisco Webex</td>
                    <td className="px-4 py-3.5 text-slate-600">Grandstream UCM6308 IP PBX, internal SIP trunks, H.323 MCUs</td>
                    <td className="px-4 py-3.5 text-slate-600">Dual-registered Poly G7500, Poly Studio X72, Cisco Room Kit Plus</td>
                  </tr>
                  <tr className="bg-slate-50/60">
                    <td className="px-4 py-3.5 font-semibold text-[#1A2B4C]">Signalling &amp; Transport</td>
                    <td className="px-4 py-3.5 text-slate-600">HTTPS / WebSockets, ICE/STUN/TURN, TLS 1.3 &amp; SRTP</td>
                    <td className="px-4 py-3.5 text-slate-600">SIP (RFC 3261 over TLS/TCP), H.323 (H.225/H.245), RTP/SRTP</td>
                    <td className="px-4 py-3.5 text-slate-600">Local SIP/H.323 + Cloud CVI / Direct Guest Join interoperability</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3.5 font-semibold text-[#1A2B4C]">Data Sovereignty</td>
                    <td className="px-4 py-3.5 text-slate-600">Media transits regional cloud PoPs; optional cloud recording</td>
                    <td className="px-4 py-3.5 text-slate-600">100% on-premises media &amp; recordings inside corporate or state LAN</td>
                    <td className="px-4 py-3.5 text-slate-600">Sensitive internal calls stay on LAN; external guests bridged via SBC</td>
                  </tr>
                  <tr className="bg-slate-50/60">
                    <td className="px-4 py-3.5 font-semibold text-[#1A2B4C]">Regulatory Compliance</td>
                    <td className="px-4 py-3.5 text-slate-600">ISO 27001, SOC 2; SECP AGM streaming with verified logs</td>
                    <td className="px-4 py-3.5 text-slate-600">Defence, commercial banking cores, federal ministries, air-gapped LANs</td>
                    <td className="px-4 py-3.5 text-slate-600">SECP / PSX hybrid AGMs + private executive boardroom fallback</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3.5 font-semibold text-[#1A2B4C]">WAN Outage Survivability</td>
                    <td className="px-4 py-3.5 text-slate-600">Dependent on ISP; mitigated with bonded 4G/5G failover routers</td>
                    <td className="px-4 py-3.5 text-slate-600">Full LAN / MPLS site-to-site calling survives total internet blackout</td>
                    <td className="px-4 py-3.5 text-slate-600">Internal rooms stay on local SIP PBX; external stream fails over to 5G</td>
                  </tr>
                  <tr className="bg-slate-50/60">
                    <td className="px-4 py-3.5 font-semibold text-[#1A2B4C]">Verified Hardware</td>
                    <td className="px-4 py-3.5 text-slate-600">Poly Studio USB, Studio X32/X52, Logitech Rally Bar / Mini</td>
                    <td className="px-4 py-3.5 text-slate-600">Grandstream UCM6308, Polycom Group 500, Poly G7500, VVX 250</td>
                    <td className="px-4 py-3.5 text-slate-600">Cisco Room Kit Plus/EQ, Poly Studio X72, Bosch PAVIRO PA</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* SECTION 03: ACOUSTIC & OPTICAL SIGNAL CHAIN */}
        <section id="acoustics" className="space-y-6">
          <div className="border-b border-slate-200 pb-4 space-y-1">
            <div className="text-xs font-semibold text-slate-500">03. Acoustic &amp; Optical Engineering</div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A2B4C]">
              Why desktop webcams fail above four seats—and how enterprise stacks solve it
            </h2>
          </div>

          <p className="text-sm sm:text-base text-slate-600 max-w-[72ch] leading-relaxed">
            Plugging a consumer laptop webcam into a boardroom display or auditorium projector creates immediate acoustic feedback, unintelligible far-end audio, and tiny wide-angle framing. Enterprise video conference stacks isolate every stage in dedicated hardware. Select any stage below to inspect its parameters.
          </p>

          {/* Interactive 5-Stage Signal Chain */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5" role="group" aria-label="Enterprise AV signal chain stages">
              {SIGNAL_NODES.map((node, idx) => {
                const active = idx === signalNodeIdx;
                return (
                  <button
                    key={node.stage}
                    type="button"
                    onClick={() => setSignalNodeIdx(idx)}
                    className={`text-left p-3.5 rounded-lg border transition-colors cursor-pointer min-h-[68px] ${
                      active
                        ? 'bg-[#1A2B4C] border-[#1A2B4C] text-white'
                        : 'bg-slate-50 border-slate-200 text-[#1A2B4C] hover:bg-slate-100'
                    }`}
                  >
                    <div className={`text-[11px] font-mono ${active ? 'text-[#7DD3FC]' : 'text-slate-500'}`}>
                      Stage 0{idx + 1}
                    </div>
                    <div className="text-xs sm:text-sm font-semibold mt-0.5 leading-snug">{node.shortName}</div>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-7 bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-center">
                <svg
                  viewBox="0 0 760 215"
                  className="w-full h-auto"
                  role="img"
                  aria-label="Enterprise video conference AV signal flow diagram from microphones through hardware DSP AEC and optical PTZ to dual 4K displays and bonded WAN"
                >
                  <line x1="138" y1="68" x2="182" y2="68" stroke="#94A3B8" strokeWidth="2" />
                  <line x1="298" y1="68" x2="342" y2="68" stroke="#94A3B8" strokeWidth="2" />
                  <line x1="458" y1="68" x2="502" y2="68" stroke="#94A3B8" strokeWidth="2" />
                  <line x1="618" y1="68" x2="658" y2="68" stroke="#94A3B8" strokeWidth="2" />
                  <path
                    d="M 400 110 L 400 166 L 240 166 L 240 110"
                    fill="none"
                    stroke="#0077B6"
                    strokeWidth="2"
                    strokeDasharray="5 4"
                  />
                  <text
                    x="320"
                    y="186"
                    textAnchor="middle"
                    fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                    fontSize="11"
                    fill="#0077B6"
                    fontWeight="600"
                  >
                    MIX-MINUS HARDWARE AEC REFERENCE BUS (ZERO ECHO)
                  </text>

                  {[
                    { x: 16, w: 122, idx: 0 },
                    { x: 182, w: 116, idx: 1 },
                    { x: 342, w: 116, idx: 2 },
                    { x: 502, w: 116, idx: 3 },
                    { x: 658, w: 88, idx: 4 },
                  ].map((box) => {
                    const node = SIGNAL_NODES[box.idx];
                    const active = box.idx === signalNodeIdx;
                    return (
                      <g
                        key={box.idx}
                        onClick={() => setSignalNodeIdx(box.idx)}
                        className="cursor-pointer"
                      >
                        <rect
                          x={box.x}
                          y={26}
                          width={box.w}
                          height={84}
                          rx={6}
                          fill={active ? '#1A2B4C' : '#FFFFFF'}
                          stroke={active ? '#00B4D8' : '#CBD5E1'}
                          strokeWidth={active ? '2.2' : '1.4'}
                        />
                        <text
                          x={box.x + 10}
                          y={46}
                          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                          fontSize="9.5"
                          fill={active ? '#7DD3FC' : '#64748B'}
                        >
                          {node.svgLabel}
                        </text>
                        <text
                          x={box.x + 10}
                          y={67}
                          fontFamily="system-ui, -apple-system, sans-serif"
                          fontSize="12.5"
                          fontWeight="700"
                          fill={active ? '#FFFFFF' : '#1A2B4C'}
                        >
                          {node.svgTitle}
                        </text>
                        <text
                          x={box.x + 10}
                          y={85}
                          fontFamily="system-ui, -apple-system, sans-serif"
                          fontSize="11"
                          fill={active ? '#CBD5E1' : '#64748B'}
                        >
                          {node.svgSub}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-lg p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="text-xs font-mono text-[#0077B6]">{activeSignal.stage}</div>
                  <h3 className="text-lg font-bold text-[#1A2B4C]">{activeSignal.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{activeSignal.desc}</p>
                </div>
                <div className="text-xs font-mono text-slate-700 pt-3 border-t border-slate-200">
                  {activeSignal.spec}
                </div>
              </div>
            </div>
          </div>

          {/* Acoustic Reference Visual + Webcam vs Enterprise Table */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col">
              <img
                src="/images/video-conference/huddle-space.webp"
                alt="6-person acoustically treated corporate huddle room with 75-inch 4K display, all-in-one video conference bar, and tabletop touch controller"
                width={960}
                height={720}
                loading="lazy"
                decoding="async"
                className="w-full h-56 lg:h-64 object-cover"
              />
              <div className="p-5 space-y-2 flex-1 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="text-xs font-medium text-slate-500">RT60 Acoustic Design Benchmark</div>
                  <h3 className="text-base font-bold text-[#1A2B4C]">Glass &amp; Slatted Felt Room Calibration</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Glass-walled offices common across Lahore, Karachi, and Islamabad create strong sound reflections. Pairing slatted acoustic absorption with beamforming bars keeps RT60 below 0.6 seconds.
                  </p>
                </div>
                <Link
                  to="/blog/shure-bosch-ceiling-microphones-vs-table-mics-pakistan"
                  className="text-xs font-semibold text-[#0077B6] hover:underline inline-flex items-center gap-1 pt-2"
                >
                  Read Ceiling vs. Table Mic Guide <ArrowRight size={13} aria-hidden="true" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="overflow-x-auto h-full">
                <table className="w-full text-left border-collapse text-sm">
                  <caption className="sr-only">
                    Engineering Comparison of Single-User Desktop Webcams versus Enterprise Video Conference Room Stacks
                  </caption>
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-xs font-mono uppercase tracking-wider text-slate-700">
                      <th className="px-4 py-3.5 font-semibold">Engineering Dimension</th>
                      <th className="px-4 py-3.5 font-semibold">Desktop Webcam</th>
                      <th className="px-4 py-3.5 font-semibold">Enterprise Video Conference Stack</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="px-4 py-3 font-semibold text-[#1A2B4C]">Acoustic Echo Cancellation</td>
                      <td className="px-4 py-3 text-slate-600">Software OS AEC; clips speech during double-talk</td>
                      <td className="px-4 py-3 text-slate-700">Per-channel hardware DSP AEC; natural full-duplex speech</td>
                    </tr>
                    <tr className="bg-slate-50/60">
                      <td className="px-4 py-3 font-semibold text-[#1A2B4C]">Mix-Minus PA Routing</td>
                      <td className="px-4 py-3 text-slate-600">None; connecting a room PA causes instant feedback howl</td>
                      <td className="px-4 py-3 text-slate-700">Isolated mix-minus bus subtracts remote audio from uplink</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-semibold text-[#1A2B4C]">Camera Optics &amp; Framing</td>
                      <td className="px-4 py-3 text-slate-600">Fixed digital crop; participants look tiny past 2.5 m</td>
                      <td className="px-4 py-3 text-slate-700">Dual-4K / 5×–25× optical PTZ with AI speaker framing</td>
                    </tr>
                    <tr className="bg-slate-50/60">
                      <td className="px-4 py-3 font-semibold text-[#1A2B4C]">Microphone Pickup</td>
                      <td className="px-4 py-3 text-slate-600">1–2 omni capsules effective only under 1.2 m</td>
                      <td className="px-4 py-3 text-slate-700">Beamforming arrays + ceiling/table Dante expansion (6–30+ seats)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-semibold text-[#1A2B4C]">Dual-4K Content Routing</td>
                      <td className="px-4 py-3 text-slate-600">Single laptop screen steals space from remote faces</td>
                      <td className="px-4 py-3 text-slate-700">Screen A for remote speakers, Screen B for 4K slides + timer</td>
                    </tr>
                    <tr className="bg-slate-50/60">
                      <td className="px-4 py-3 font-semibold text-[#1A2B4C]">Network &amp; Support SLA</td>
                      <td className="px-4 py-3 text-slate-600">Shared office Wi-Fi; manual USB troubleshooting</td>
                      <td className="px-4 py-3 text-slate-700">QoS Gigabit VLAN + bonded 5G failover + 15-min SLA dispatch</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 04: INTERACTIVE VIDEO CONFERENCE ROOM CONFIGURATOR */}
        <section id="configurator" className="space-y-6">
          <div className="border-b border-slate-200 pb-4 space-y-1">
            <div className="text-xs font-semibold text-slate-500">04. Interactive Room Sizing &amp; BoM Engine</div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A2B4C]">
              Video Conference Room Configurator &amp; PKR Recommender
            </h2>
          </div>

          <p className="text-sm sm:text-base text-slate-600 max-w-[72ch] leading-relaxed">
            Select your seating capacity, protocol architecture, OEM vendor preference, and regional SLA hub. The configurator builds a verified Poly, Cisco, Logitech, or Grandstream stack with real PKR unit pricing, MPNs, direct cart checkout, and CSV export.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT CONTROLS */}
            <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-6">
              <div className="space-y-2.5">
                <div className="text-xs font-mono uppercase tracking-wider text-slate-500">
                  Step 1 · Room Capacity &amp; Acoustic Footprint
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5" role="radiogroup" aria-label="Select room capacity">
                  {(
                    [
                      { key: 'huddle', title: 'Huddle Space', meta: '2–6 Pax · 3 × 3.5 m' },
                      { key: 'medium', title: 'Small / Medium Room', meta: '6–14 Pax · 4.5 × 6 m' },
                      { key: 'boardroom', title: 'Executive Boardroom', meta: '15–30 Pax · 6 × 10 m' },
                      { key: 'auditorium', title: 'Hall / Auditorium', meta: '50–500+ Pax · Ballroom' },
                    ] as const
                  ).map((opt) => {
                    const selected = roomType === opt.key;
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => {
                          setRoomType(opt.key);
                          setResetArmed(false);
                          setStatusMsg('');
                        }}
                        className={`text-left p-3.5 rounded-lg border transition-colors cursor-pointer min-h-[72px] ${
                          selected
                            ? 'bg-[#1A2B4C] border-[#1A2B4C] text-white'
                            : 'bg-slate-50 border-slate-200 text-[#1A2B4C] hover:bg-slate-100'
                        }`}
                      >
                        <div className="text-sm font-bold">{opt.title}</div>
                        <div className={`text-xs font-mono mt-1 ${selected ? 'text-[#7DD3FC]' : 'text-slate-500'}`}>
                          {opt.meta}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="vc-cfg-protocol" className="block text-xs font-semibold text-slate-600">
                    Step 2 · Protocol
                  </label>
                  <select
                    id="vc-cfg-protocol"
                    value={cfgProtocol}
                    onChange={(e) => {
                      setCfgProtocol(e.target.value as ProtocolKey);
                      setResetArmed(false);
                      setStatusMsg('');
                    }}
                    className="w-full min-h-[44px] px-3 bg-slate-50 border border-slate-300 rounded-lg text-sm text-[#1A2B4C] focus:outline-none focus:border-[#0077B6]"
                  >
                    <option value="cloud">Cloud SaaS (Teams / Zoom)</option>
                    <option value="onprem">On-Premises IP / SIP &amp; H.323</option>
                    <option value="hybrid">Hybrid Cloud + SIP + AGM</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="vc-cfg-vendor" className="block text-xs font-semibold text-slate-600">
                    Step 3 · Vendor Stack
                  </label>
                  <select
                    id="vc-cfg-vendor"
                    value={cfgVendor}
                    onChange={(e) => {
                      setCfgVendor(e.target.value as VendorPrefKey);
                      setResetArmed(false);
                      setStatusMsg('');
                    }}
                    className="w-full min-h-[44px] px-3 bg-slate-50 border border-slate-300 rounded-lg text-sm text-[#1A2B4C] focus:outline-none focus:border-[#0077B6]"
                  >
                    <option value="optimal">Optimal Match</option>
                    <option value="poly">HP Poly Ecosystem</option>
                    <option value="cisco">Cisco Webex / Room Kit</option>
                    <option value="logitech">Logitech + Grandstream</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="vc-cfg-city" className="block text-xs font-semibold text-slate-600">
                    Step 4 · Dispatch Hub
                  </label>
                  <select
                    id="vc-cfg-city"
                    value={cfgCity}
                    onChange={(e) => {
                      setCfgCity(e.target.value as CityHubKey);
                      setResetArmed(false);
                    }}
                    className="w-full min-h-[44px] px-3 bg-slate-50 border border-slate-300 rounded-lg text-sm text-[#1A2B4C] focus:outline-none focus:border-[#0077B6]"
                  >
                    <option value="lahore">Lahore (Johar Town HQ)</option>
                    <option value="karachi">Karachi (Clifton / DHA)</option>
                    <option value="islamabad">Islamabad (Blue Area)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="text-xs font-mono uppercase tracking-wider text-slate-500">
                  Step 5 · Optional Peripherals &amp; Infrastructure Modules
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(Object.keys(ADDONS) as AddonKey[]).map((key) => {
                    const item = ADDONS[key];
                    const checked = addons[key];
                    return (
                      <label
                        key={key}
                        className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors min-h-[52px] ${
                          checked
                            ? 'bg-sky-50/70 border-[#0077B6]'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleToggleAddon(key)}
                          className="mt-1 w-4 h-4 accent-[#0077B6] shrink-0"
                        />
                        <span className="min-w-0">
                          <span className="block text-xs font-semibold text-[#1A2B4C] leading-snug">
                            {item.name}
                          </span>
                          <span className="block text-[11px] font-mono text-slate-500 tabular-nums mt-0.5">
                            {item.mpn} · {formatPkr(item.price)}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleAddConfiguredStackToCart}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] bg-[#1A2B4C] hover:bg-[#00B4D8] text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                >
                  <ShoppingCart size={16} aria-hidden="true" />
                  <span>Add Stack to Cart</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportBomCsv}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] bg-white hover:bg-slate-50 text-[#1A2B4C] border border-slate-300 text-sm font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Download size={15} aria-hidden="true" />
                  <span>Export BoM (.csv)</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetConfigurator}
                  className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 min-h-[44px] text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                    resetArmed
                      ? 'bg-rose-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <RotateCcw size={14} aria-hidden="true" />
                  <span>{resetArmed ? 'Confirm Reset' : 'Reset'}</span>
                </button>
              </div>

              {statusMsg && (
                <div role="status" aria-live="polite" className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3.5 py-2.5">
                  {statusMsg}
                </div>
              )}
            </div>

            {/* RIGHT LIVE RECOMMENDATION OUTPUT */}
            <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-mono text-slate-500">Recommended Stack · {currentRoom.label}</div>
                  <h3 className="text-xl font-bold text-[#1A2B4C] mt-1">{rec.primary.name}</h3>
                </div>
                <span className="text-xs font-mono font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
                  {citySlaLabels[cfgCity]}
                </span>
              </div>

              {/* Dynamic Room Topology & Camera FOV SVG */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <svg
                  viewBox="0 0 500 165"
                  className="w-full h-auto"
                  role="img"
                  aria-label={currentRoom.layoutTitle}
                >
                  <rect x="8" y="8" width="484" height="149" rx="4" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
                  {currentRoom.dualScreen ? (
                    <>
                      <rect x="130" y="28" width="110" height="10" rx="2" fill="#0077B6" />
                      <rect x="260" y="28" width="110" height="10" rx="2" fill="#0077B6" />
                      <text x="250" y="22" textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="9" fill="#64748B">
                        DUAL 4K DISPLAYS / P2.5 SMD WALL + CODEC
                      </text>
                    </>
                  ) : (
                    <>
                      <rect x="175" y="28" width="150" height="10" rx="2" fill="#0077B6" />
                      <text x="250" y="22" textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="9" fill="#64748B">
                        4K DISPLAY + ALL-IN-ONE VIDEO BAR
                      </text>
                    </>
                  )}

                  {currentRoom.paBox && (
                    <>
                      <rect x="24" y="44" width="78" height="40" rx="4" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="1.2" />
                      <text x="63" y="62" textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="8" fill="#1A2B4C" fontWeight="600">DSP + PA</text>
                      <text x="63" y="74" textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="7.5" fill="#64748B">MIX-MINUS</text>
                      <rect x="398" y="44" width="78" height="40" rx="4" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="1.2" />
                      <text x="437" y="62" textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="8" fill="#1A2B4C" fontWeight="600">OPTICAL PTZ</text>
                      <text x="437" y="74" textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="7.5" fill="#64748B">BONDED WAN</text>
                    </>
                  )}

                  <path d="M 250 42 L 176 122 L 324 122 Z" fill="#BAE6FD" opacity="0.45" />
                  <rect
                    x={(500 - currentRoom.tableW) / 2}
                    y="68"
                    width={currentRoom.tableW}
                    height="52"
                    rx="4"
                    fill="#E2E8F0"
                    stroke="#64748B"
                    strokeWidth="1.4"
                  />
                  <text x="250" y="98" textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="10" fontWeight="600" fill="#1A2B4C">
                    {currentRoom.seats} SEATS / CAMERA FOV
                  </text>
                  <text x="250" y="146" textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="8.8" fill="#475569">
                    {currentRoom.layoutTitle}
                  </text>
                </svg>
              </div>

              {/* Verified BoM Breakdown */}
              <div className="border-t-2 border-[#0077B6] bg-slate-50 rounded-b-lg p-4 space-y-2.5 text-sm">
                <div className="flex items-baseline justify-between gap-4 pb-2 border-b border-slate-200">
                  <div className="min-w-0">
                    <Link
                      to={`/product/${rec.primary.slug}`}
                      className="font-semibold text-[#1A2B4C] hover:text-[#0077B6] hover:underline"
                    >
                      {rec.primary.name}
                    </Link>
                    <div className="text-xs font-mono text-slate-500">MPN: {rec.primary.mpn}</div>
                  </div>
                  <span className="font-mono font-semibold text-[#1A2B4C] tabular-nums whitespace-nowrap">
                    {formatPkr(rec.primary.price)}
                  </span>
                </div>

                {rec.secondary && (
                  <div className="flex items-baseline justify-between gap-4 pb-2 border-b border-slate-200">
                    <div className="min-w-0">
                      <Link
                        to={`/product/${rec.secondary.slug}`}
                        className="font-semibold text-[#1A2B4C] hover:text-[#0077B6] hover:underline"
                      >
                        {rec.secondary.name}
                      </Link>
                      <div className="text-xs font-mono text-slate-500">MPN: {rec.secondary.mpn}</div>
                    </div>
                    <span className="font-mono font-semibold text-[#1A2B4C] tabular-nums whitespace-nowrap">
                      {formatPkr(rec.secondary.price)}
                    </span>
                  </div>
                )}

                <div className="flex items-baseline justify-between gap-4 pb-2 border-b border-slate-200">
                  <span className="text-slate-600">
                    Selected Peripherals &amp; Infrastructure ({selectedAddonsList.length} items)
                  </span>
                  <span className="font-mono text-slate-700 tabular-nums whitespace-nowrap">
                    {formatPkr(addonsTotal)}
                  </span>
                </div>

                <div className="flex items-baseline justify-between gap-4 pt-1">
                  <span className="font-bold text-[#1A2B4C]">Verified Hardware BoM (Excl. GST)</span>
                  <span className="text-2xl font-bold font-mono text-[#0077B6] tabular-nums whitespace-nowrap">
                    {formatPkr(bomTotal)}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-sm text-slate-600">
                <p className="leading-relaxed">{rec.notes}</p>
                <p className="text-xs font-mono text-slate-500">{rec.turnkeyBand}</p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-xs text-slate-600 leading-relaxed">{rec.altText}</p>
                <Link
                  to="/programs/quote"
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 min-h-[40px] bg-white border border-slate-300 hover:border-[#0077B6] text-[#1A2B4C] text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 transition-colors"
                >
                  <FileSpreadsheet size={14} aria-hidden="true" />
                  <span>Request Formal BoQ</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 05: FEATURED VERIFIED VIDEO CONFERENCE PRODUCTS */}
        <section id="products" className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-4">
            <div className="space-y-1">
              <div className="text-xs font-semibold text-slate-500">05. Authorized In-Stock Video Conference Systems</div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A2B4C]">
                Verified Poly, Cisco, Logitech &amp; Horion Hardware
              </h2>
            </div>
            <Link
              to="/category/video-conferencing"
              className="text-sm font-semibold text-[#0077B6] hover:text-[#1A2B4C] inline-flex items-center gap-1 whitespace-nowrap"
            >
              <span>Browse Full Video Conferencing Catalog</span>
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredProducts.map((prod) => {
              const href = getProductHref(prod, prod.id);
              const imgSrc = prod.images?.[0] ? optimizeGalleryImageUrl(prod.images[0], 480, 75) : '';
              const isAdded = addedSlug === prod.slug;

              return (
                <article
                  key={prod.slug}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col justify-between transition-colors hover:border-slate-300"
                >
                  <div>
                    <Link
                      to={href}
                      className="block aspect-[4/3] bg-slate-50 border-b border-slate-100 p-4 overflow-hidden"
                    >
                      {imgSrc ? (
                        <img
                          src={imgSrc}
                          alt={`${prod.productName} (${prod.sku}) — Enterprise video conference system price in Pakistan`}
                          width={480}
                          height={360}
                          loading="lazy"
                          decoding="async"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            const target = e.currentTarget;
                            target.onerror = null;
                            target.src = '/images/video-conference/huddle-space.webp';
                          }}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <Video size={36} aria-hidden="true" />
                        </div>
                      )}
                    </Link>

                    <div className="p-4 space-y-2">
                      <div className="text-xs text-slate-500 font-mono truncate">
                        {prod.brand} · {prod.sku}
                      </div>
                      <h3 className="text-sm font-bold text-[#1A2B4C] leading-snug line-clamp-2 min-h-[2.5rem]">
                        <Link to={href} className="hover:text-[#0077B6] transition-colors">
                          {prod.productName}
                        </Link>
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {prod.shortDescription}
                      </p>
                    </div>
                  </div>

                  <div className="px-4 pb-4 pt-2 border-t border-slate-100 space-y-3">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-base font-bold font-mono text-[#1A2B4C] tabular-nums">
                        {formatPkr(prod.salePrice)}
                      </span>
                      {prod.regularPrice > prod.salePrice && (
                        <span className="text-xs font-mono text-slate-400 line-through tabular-nums">
                          {formatPkr(prod.regularPrice)}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        to={href}
                        className="inline-flex items-center justify-center px-3 py-2 min-h-[40px] text-xs font-semibold text-[#1A2B4C] bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
                      >
                        View Specs
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleQuickAddProduct(prod)}
                        className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 min-h-[40px] text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                          isAdded
                            ? 'bg-emerald-700 text-white'
                            : 'bg-[#1A2B4C] hover:bg-[#00B4D8] text-white'
                        }`}
                      >
                        {isAdded ? <Check size={14} aria-hidden="true" /> : <ShoppingCart size={14} aria-hidden="true" />}
                        <span>{isAdded ? 'Added' : 'Add'}</span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Flagship Stage Companion Callout: Fold-Flat Podium Teleprompter */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs font-mono text-slate-500">Executive Keynote &amp; Hybrid Broadcast Companion</div>
              <h3 className="text-base sm:text-lg font-bold text-[#1A2B4C]">
                AV Live Fold-Flat Podium Teleprompter (17&Prime; Compact &amp; 22&Prime; Flagship)
              </h3>
              <p className="text-sm text-slate-600 max-w-2xl">
                Pair your auditorium video conference rig with our 1.2&Prime; fold-flat stealth privacy IPS teleprompter (400+ nit display, 60/40 AR optical glass, 0% audience glare) from PKR 160,000.
              </p>
            </div>
            <Link
              to="/podium-teleprompter"
              className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] bg-[#1A2B4C] hover:bg-[#00B4D8] text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <span>Explore Podium Teleprompter</span>
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </section>

        {/* SECTION 06: COMPLETE HARDWARE MATRIX & TURNKEY PRODUCTION QA */}
        <section id="catalogue" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-4">
            <div className="space-y-1">
              <div className="text-xs font-semibold text-slate-500">06. Reference Hardware &amp; Turnkey Production Matrix</div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A2B4C]">
                Verified MPN Catalogue, PKR Pricing &amp; Show-Day Verification
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <SlidersHorizontal size={15} className="text-slate-500 shrink-0" aria-hidden="true" />
              <label htmlFor="vc-matrix-filter" className="sr-only">Filter hardware matrix by category</label>
              <select
                id="vc-matrix-filter"
                value={matrixFilter}
                onChange={(e) => setMatrixFilter(e.target.value as MatrixFilterKey)}
                className="min-h-[42px] px-3 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm font-medium text-[#1A2B4C] focus:outline-none focus:border-[#0077B6]"
              >
                <option value="all">All Verified Models ({HARDWARE_CATALOGUE.length} Items)</option>
                <option value="codec">Room Codecs &amp; Video Bars</option>
                <option value="projection">Displays, Projectors &amp; Stage Optics</option>
                <option value="voip">VoIP PBX, Intercoms, PA &amp; Headsets</option>
              </select>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <caption className="sr-only">
                  Verified Enterprise Video Conference Hardware Models, Manufacturer Part Numbers, and PKR Prices in Pakistan
                </caption>
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-xs font-mono uppercase tracking-wider text-slate-700">
                    <th className="px-4 py-3.5 font-semibold">Recommended Model</th>
                    <th className="px-4 py-3.5 font-semibold">Vendor</th>
                    <th className="px-4 py-3.5 font-semibold">MPN</th>
                    <th className="px-4 py-3.5 font-semibold">Primary Role</th>
                    <th className="px-4 py-3.5 font-semibold text-right">Reference Price (PKR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredHardware.map((row, idx) => (
                    <tr key={row.slug} className={idx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'}>
                      <td className="px-4 py-3 font-semibold text-[#1A2B4C]">
                        <Link to={`/product/${row.slug}`} className="hover:text-[#0077B6] hover:underline">
                          {row.model}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{row.vendor}</td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-600 whitespace-nowrap">{row.mpn}</td>
                      <td className="px-4 py-3 text-slate-600">{row.role}</td>
                      <td className="px-4 py-3 font-mono font-semibold text-[#1A2B4C] text-right tabular-nums whitespace-nowrap">
                        {formatPkr(row.price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Turnkey Event & Hybrid Broadcast Tiers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2.5">
              <div className="text-xs font-mono text-slate-500">Turnkey Package · 50–150 Pax</div>
              <h3 className="text-base font-bold text-[#1A2B4C]">Executive Seminar &amp; AGM Tier</h3>
              <div className="text-xl font-bold font-mono text-[#0077B6] tabular-nums">PKR 185,000 – 450,000</div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                12×8 ft P2.5 SMD LED wall, 4 wireless microphones + PA, 2-camera HD SDI Zoom/Teams bridge, 24-hour rigging, 1 standby AV engineer, and 15-minute SLA.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2.5">
              <div className="text-xs font-mono text-slate-500">Turnkey Package · 150–400 Pax</div>
              <h3 className="text-base font-bold text-[#1A2B4C]">Corporate Gala &amp; Hybrid Townhall</h3>
              <div className="text-xl font-bold font-mono text-[#0077B6] tabular-nums">PKR 550,000 – 1,450,000</div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                24×10 ft P2.5 SMD backdrop + confidence monitors, 3–4 camera SDI switching + Poly Studio X72 / Group 500 bridge, 3 standby engineers, and dual-encoder power/ISP failover.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2.5">
              <div className="text-xs font-mono text-slate-500">Turnkey Package · Multi-City</div>
              <h3 className="text-base font-bold text-[#1A2B4C]">Linked Tri-City Summit &amp; Flagship</h3>
              <div className="text-xl font-bold font-mono text-[#0077B6] tabular-nums">PKR 1,200,000 – 5,000,000+</div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Simultaneous Lahore, Karachi, and Islamabad venues bridged live in 1080p60/4K, curved P2.5 LED or 3D HoloGauze stage, line-array PA, broadcast crew, and 99.99% uptime SLA.
              </p>
            </div>
          </div>

          {/* 9-Point Pre-Event Engineering Gate */}
          <details className="bg-white border border-slate-200 rounded-xl p-5 group">
            <summary className="list-none [&::-webkit-details-marker]:hidden cursor-pointer flex items-center justify-between gap-4 min-h-[44px]">
              <span className="text-sm sm:text-base font-bold text-[#1A2B4C]">
                Pre-Deployment &amp; Show-Day Acoustic Verification Checklist (9-Point Production Gate)
              </span>
              <ChevronDown size={18} className="text-slate-500 transition-transform group-open:rotate-180 shrink-0" aria-hidden="true" />
            </summary>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 mt-4 border-t border-slate-100 text-sm text-slate-600 leading-relaxed">
              <div className="space-y-3">
                <p><strong className="text-[#1A2B4C]">1. Run-Sheet-First Scoping:</strong> Lock programme cues, speaker handoffs, and remote Q&amp;A moderators before finalising kit lists.</p>
                <p><strong className="text-[#1A2B4C]">2. Viewing &amp; Pixel Pitch Check:</strong> Specify P1.95–P2.6 SMD LED for indoor conferences and P2.6–P3.91 for larger halls; verify native cabinet pixels before briefing graphic designers.</p>
                <p><strong className="text-[#1A2B4C]">3. 3,840 Hz Camera Refresh Verification:</strong> Test actual PTZ/SDI shutter speeds against the LED wall at calibrated 700–800 cd/m² indoor brightness to eliminate moiré and flicker.</p>
                <p><strong className="text-[#1A2B4C]">4. RT60 Reverberation Sweep:</strong> Measure room reflections and ambient HVAC noise floor before committing ceiling microphone vs. table pod topology.</p>
              </div>
              <div className="space-y-3">
                <p><strong className="text-[#1A2B4C]">5. Mix-Minus &amp; AEC Dry-Run (12–24 Hrs Prior):</strong> Confirm zero acoustic echo between the hall PA and remote Zoom/Teams/SIP codecs across every wireless and gooseneck mic.</p>
                <p><strong className="text-[#1A2B4C]">6. Bonded ISP Failover Test:</strong> Never rely on venue Wi-Fi; test dedicated fibre + multi-carrier 4G/5G failover and secondary hardware RTMP encoder before doors open.</p>
                <p><strong className="text-[#1A2B4C]">7. Dual-Display Eyeline &amp; Accessibility:</strong> Position confidence monitors along natural eyelines, enable live captions, and capture redundant local ISO recordings.</p>
                <p><strong className="text-[#1A2B4C]">8. Hot-Standby Spares &amp; 15-Min SLA:</strong> Stage backup handheld mics, HDMI/SDI cables, and PoE injectors on-site for instant swap without interrupting live governance.</p>
              </div>
            </div>
          </details>
        </section>

        {/* VERIFIED ON-SITE PROJECT GALLERY & ENTERPRISE CLIENT ROSTER */}
        <div className="-mx-4 sm:-mx-6 lg:-mx-8">
          <RealProjectsAndClients defaultTab="video-conference" />
        </div>

        {/* SECTION 07: FREQUENTLY ASKED QUESTIONS (FAQPage SCHEMA SYNCED) */}
        <section id="faqs" className="space-y-6">
          <div className="border-b border-slate-200 pb-4 space-y-1">
            <div className="text-xs font-semibold text-slate-500">07. Commercial &amp; Engineering FAQs</div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A2B4C]">
              Frequently Asked Questions About Enterprise Video Conferencing
            </h2>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-200 overflow-hidden">
            {VIDEO_CONFERENCE_FAQS.map((faq, idx) => {
              const isOpen = openFaqIdx === idx;
              return (
                <div key={faq.q}>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                    className="w-full text-left px-5 py-4 min-h-[54px] flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <span className="text-sm sm:text-base font-semibold text-[#1A2B4C]">{faq.q}</span>
                    <ChevronDown
                      size={18}
                      className={`text-slate-500 shrink-0 transition-transform ${isOpen ? 'rotate-180 text-[#0077B6]' : ''}`}
                      aria-hidden="true"
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-sm text-slate-600 leading-relaxed max-w-[78ch]">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 08: DIRECT ENGINEERING CONSULTATION & REGIONAL HUBS */}
        <section className="bg-[#1A2B4C] text-white rounded-2xl p-6 sm:p-8 lg:p-10 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 space-y-2.5">
              <div className="text-xs font-mono text-[#7DD3FC]">Nationwide Video Conference Deployment · Lahore · Karachi · Islamabad</div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Book a Free On-Site Boardroom Acoustic Survey &amp; Custom BoQ
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-[65ch]">
                Speak directly with AV Live’s certified Poly, Cisco, and Logitech systems engineers for a 15-minute SLA consultation, CAD schematic, and FBR/PPRA-compliant PKR quotation.
              </p>
            </div>
            <div className="lg:col-span-4 flex flex-wrap lg:justify-end gap-3">
              <a
                href="tel:+923214256263"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[46px] bg-[#00B4D8] hover:bg-[#0096B4] text-[#0B132B] font-bold text-sm rounded-lg transition-colors whitespace-nowrap"
              >
                <Phone size={16} aria-hidden="true" />
                <span>0321 425 6263</span>
              </a>
              <Link
                to="/programs/quote"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[46px] bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-sm rounded-lg transition-colors whitespace-nowrap"
              >
                <span>Request 24-Hr Quote</span>
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="pt-5 border-t border-white/15 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-300">
            <span className="font-semibold text-white">Related Hubs:</span>
            <Link to="/video-conference-in-pakistan" className="hover:text-[#7DD3FC] hover:underline">Video Conference in Pakistan</Link>
            <Link to="/video-conferencing-solutions" className="hover:text-[#7DD3FC] hover:underline">Boardroom Solutions</Link>
            <Link to="/conference-room-solutions" className="hover:text-[#7DD3FC] hover:underline">Conference Room AV</Link>
            <Link to="/compare" className="hover:text-[#7DD3FC] hover:underline">Hardware Comparator</Link>
            <Link to="/lahore" className="hover:text-[#7DD3FC] hover:underline">Lahore HQ</Link>
            <Link to="/karachi" className="hover:text-[#7DD3FC] hover:underline">Karachi Hub</Link>
            <Link to="/islamabad" className="hover:text-[#7DD3FC] hover:underline">Islamabad Hub</Link>
          </div>
        </section>
      </div>
    </div>
  );
}

export default VideoConferenceHub;
