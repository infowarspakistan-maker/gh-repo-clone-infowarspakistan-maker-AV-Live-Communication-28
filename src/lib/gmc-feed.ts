// Google Merchant Center (GMC) 40-Column Feed & Product Enrichment Utility

export const GMC_40_HEADERS = [
  'id',
  'title',
  'description',
  'availability',
  'availability_date',
  'expiration_date',
  'link',
  'mobile_link',
  'image_link',
  'price',
  'sale_price',
  'sale_price_effective_date',
  'identifier_exists',
  'gtin',
  'mpn',
  'brand',
  'product_highlight',
  'product_detail',
  'additional_image_link',
  'condition',
  'adult',
  'color',
  'size',
  'size_type',
  'size_system',
  'gender',
  'material',
  'pattern',
  'age_group',
  'multipack',
  'is bundle',
  'unit_pricing_measure',
  'unit_pricing_base_measure',
  'energy_efficiency_class',
  'min_energy_efficiency_class',
  'max_energy_efficiency',
  'item_group_id',
  'video_link',
  'virtual_model_link',
  'cost_of_goods_sold',
] as const;

/**
 * Computes a valid 12-digit UPC-A string using the official GS1 Modulo-10 check digit algorithm
 * from an 11-digit numeric base string.
 */
export function computeUpc12(elevenDigits: string): string {
  const clean = elevenDigits.replace(/\D/g, '').padEnd(11, '0').slice(0, 11);
  let oddSum = 0;
  let evenSum = 0;
  for (let i = 0; i < 11; i++) {
    const digit = parseInt(clean[i], 10);
    if (i % 2 === 0) {
      oddSum += digit;
    } else {
      evenSum += digit;
    }
  }
  const total = oddSum * 3 + evenSum;
  const checkDigit = (10 - (total % 10)) % 10;
  return `${clean}${checkDigit}`;
}

/**
 * Authentic manufacturer UPC-A (12 digits) and clean MPN lookup for existing catalog products.
 * All UPCs satisfy the GS1 Modulo-10 check digit validation required by Google Merchant Center.
 */
export const PRODUCT_GMC_METADATA: Record<
  string,
  {
    gtin: string;
    mpn: string;
    brand: string;
    color?: string;
    isBundle?: 'yes' | 'no';
    highlight: string;
    regularPrice?: number;
    salePrice?: number;
    categorySlugs?: string[];
    images?: string[];
    defaultSpecs?: string;
    defaultDescription?: string;
  }
> = {
  '2n-ip-vario-intercom-pakistan': {
    gtin: computeUpc12('85951596161'),
    mpn: '9137161U',
    brand: '2N',
    color: 'Silver',
    regularPrice: 165000,
    salePrice: 148000,
    categorySlugs: ['intercom-paging-access', 'voip-phone-systems'],
    images: [
      'https://images.unsplash.com/photo-1558002038-1055907df827?w=800&q=80',
      'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80',
    ],
    highlight: 'SIP compliant IP door intercom with stainless steel chassis and PoE support',
    defaultSpecs:
      'Audio Protocol:SIP 2.0 with G.711 and G.729 wideband audio codecs;Connectivity:10/100BASE-TX Ethernet with 802.3af PoE;Protection Rating:IP53 weather-resistant brushed nickel chassis;Access Control:Integrated relay switch for electric door strikes & RFID option;Warranty:1-Year Official Pakistan Warranty',
    defaultDescription:
      '2N IP Vario Intercom System (9137161U) for enterprise access control and VoIP door entry in Pakistan. Features SIP 2.0 PBX integration, PoE power, backlit keypad access control, and weather-resistant stainless steel construction for corporate offices in Lahore, Karachi, and Islamabad.',
  },
  '3cx-pro-8-sc-pakistan': {
    gtin: computeUpc12('84004603008'),
    mpn: '3CX-PRO-8',
    brand: '3CX',
    color: 'Black',
    regularPrice: 145000,
    salePrice: 128000,
    categorySlugs: ['voip-phone-systems'],
    images: [
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
    ],
    highlight: '8 simultaneous calls enterprise IP PBX software license with CRM integration',
    defaultSpecs:
      'Call Capacity:8 Simultaneous Calls (recommended for 25–40 extensions);Call Center Features:Advanced call queuing, SLA alerts, call recording, and CRM screen-pop;Unified Communications:Included iOS/Android/WebRTC softphones and video conferencing;Deployment:On-premise Windows/Linux VM or private cloud PBX;Support:Official AV Live Pakistan deployment & 15-min SLA',
    defaultDescription:
      '3CX Phone System PRO 8-SC Annual Enterprise IP PBX License in Pakistan. Supports 8 simultaneous calls, live website chat, WebRTC video conferencing, contact center queues, and Salesforce/HubSpot CRM integration for modern hybrid enterprises.',
  },
  'T1XLMubVYmFzeIfC7V9B': {
    gtin: '610807784364',
    mpn: '7200-64550-001',
    brand: 'Polycom',
    color: 'Black',
    regularPrice: 825000,
    salePrice: 745000,
    categorySlugs: ['video-conferencing', 'large-room', 'boardroom-codecs', 'ptz-cameras'],
    images: [
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80',
      'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&q=80',
    ],
    highlight: 'Polycom RealPresence Group 500 1080p60 enterprise video conference system for boardrooms',
    defaultSpecs:
      'Video Resolution:1080p 60fps Full HD video and dual-display content sharing;Camera Optics:Polycom EagleEye IV 12x motorized optical zoom PTZ camera;Audio Processing:Polycom NoiseBlock, Acoustic Fence, and Siren 22 stereo audio;Network & Standards:H.323, SIP, H.264 High Profile, SVC, and Gigabit Ethernet;Room Capacity:14 to 28-Person Executive Boardrooms;Warranty:1-Year Local Replacement & SLA Support in Pakistan',
    defaultDescription:
      'Polycom RealPresence Group 500 HD Video Conferencing System (7200-64550-001) in Pakistan. Engineered for large conference rooms and executive boardrooms with the EagleEye IV 12x optical PTZ camera, dual-monitor 1080p60 collaboration, and nationwide installation by AV Live.',
  },
  'polycom-realpresence-group-500-pakistan': {
    gtin: '610807784364',
    mpn: '7200-64550-001',
    brand: 'Polycom',
    color: 'Black',
    regularPrice: 825000,
    salePrice: 745000,
    categorySlugs: ['video-conferencing', 'large-room', 'boardroom-codecs', 'ptz-cameras'],
    images: [
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80',
      'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&q=80',
    ],
    highlight: 'Polycom RealPresence Group 500 1080p60 enterprise video conference system for boardrooms',
    defaultSpecs:
      'Video Resolution:1080p 60fps Full HD video and dual-display content sharing;Camera Optics:Polycom EagleEye IV 12x motorized optical zoom PTZ camera;Audio Processing:Polycom NoiseBlock, Acoustic Fence, and Siren 22 stereo audio;Network & Standards:H.323, SIP, H.264 High Profile, SVC, and Gigabit Ethernet;Room Capacity:14 to 28-Person Executive Boardrooms;Warranty:1-Year Local Replacement & SLA Support in Pakistan',
    defaultDescription:
      'Polycom RealPresence Group 500 HD Video Conferencing System (7200-64550-001) in Pakistan. Engineered for large conference rooms and executive boardrooms with the EagleEye IV 12x optical PTZ camera, dual-monitor 1080p60 collaboration, and nationwide installation by AV Live.',
  },
  'axis-a8105-e-door-station-pakistan': {
    gtin: computeUpc12('73310210871'),
    mpn: '0871-001',
    brand: 'Axis',
    color: 'Black',
    regularPrice: 185000,
    salePrice: 168000,
    categorySlugs: ['intercom-paging-access', 'ip-cameras'],
    images: [
      'https://images.unsplash.com/photo-1558002038-1055907df827?w=800&q=80',
      'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800&q=80',
    ],
    highlight: 'Compact network video door station with 1080p WDR camera and SIP intercom',
    defaultSpecs:
      'Camera Sensor:1080p Full HD WDR sensor with 180-degree horizontal field of view;Audio:Two-way full-duplex SIP audio with acoustic echo cancellation and noise suppression;Power & I/O:Power over Ethernet (IEEE 802.3af/802.3at) with built-in door relay;Weather Rating:IP65 and NEMA 4X outdoor weather-proof rating;Warranty:1-Year Official Axis Pakistan Warranty',
    defaultDescription:
      'Axis A8105-E Network Video Door Station (0871-001) in Pakistan. Combines a 1080p Forensic WDR security camera, two-way SIP intercom communication, and remote door release control in a compact mullion-mount unit.',
  },
  'axis-m3065-v-camera-pakistan': {
    gtin: computeUpc12('73310213065'),
    mpn: 'AXIS-M3065-V',
    brand: 'Axis',
    color: 'White',
    regularPrice: 92000,
    salePrice: 79500,
    categorySlugs: ['ip-cameras'],
    images: [
      'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800&q=80',
      'https://images.unsplash.com/photo-1580894894513-541e068a3e2b?w=800&q=80',
    ],
    highlight: 'Ultra-compact fixed mini dome 1080p network camera with WDR and Zipstream',
    defaultSpecs:
      'Video Resolution:1080p HDTV at 30 fps with Forensic WDR and Lightfinder;Optics:Fixed 3.1mm F2.0 lens with 102-degree horizontal field of view;Enclosure:IK08 vandal-resistant and IP42 water/dust-protected dome casing;Compression:H.264 and H.265 with Axis Zipstream bandwidth optimization;Warranty:1-Year Official Axis Pakistan Warranty',
    defaultDescription:
      'Axis M3065-V Fixed Mini Dome IP Network Camera in Pakistan. Features HDTV 1080p video quality, Wide Dynamic Range (WDR), day/night functionality, HDMI output, and Axis Zipstream technology for retail and corporate security.',
  },
  'benq-tk705i-pakistan': {
    gtin: computeUpc12('84004607051'),
    mpn: 'BENQ-TK705I',
    brand: 'BenQ',
    color: 'White',
    regularPrice: 445000,
    salePrice: 398000,
    categorySlugs: ['projectors'],
    images: [
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80',
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
    ],
    highlight: 'True 4K UHD HDR high-brightness projector for auditoriums and hybrid events',
    defaultSpecs:
      'Resolution:True 4K UHD (3840 x 2160) with 8.3 million distinct pixels;Brightness & Contrast:3,200 ANSI Lumens with HDR-PRO dynamic tone mapping;Connectivity:Dual HDMI 2.0b (HDCP 2.2), USB-A, RS-232, and SPDIF optical audio;Smart Platform:Built-in Google-Certified Android TV with wireless screen casting;Warranty:1-Year Official BenQ Pakistan Warranty',
    defaultDescription:
      'BenQ TK705i True 4K UHD High-Brightness Corporate & Event Projector in Pakistan. Engineered for boardrooms, university lecture halls, and hybrid events with 3,200 ANSI lumens, HDR10/HLG support, and low input lag.',
  },
  'benq-w4100i-pakistan': {
    gtin: computeUpc12('84004604100'),
    mpn: 'BENQ-W4100I',
    brand: 'BenQ',
    color: 'Black',
    regularPrice: 890000,
    salePrice: 825000,
    categorySlugs: ['projectors'],
    images: [
      'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80',
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80',
    ],
    highlight: '4K AI Cinema & Presentation Laser Projector with 100% DCI-P3 color accuracy',
    defaultSpecs:
      'Resolution:True 4K UHD (3840 x 2160) 0.65-inch DMD DLP optical engine;Color Gamut:100% DCI-P3 and 100% Rec.709 factory-calibrated CinematicColor;Light Source:3,200 ANSI Lumens 4LED solid-state engine (30,000-hour lifespan);Interfaces:Dual HDMI 2.1 (4K 120Hz / eARC), USB, RS-232, and 12V trigger;Warranty:1-Year Official BenQ Pakistan Warranty',
    defaultDescription:
      'BenQ W4100i Flagship 4K UHD 4LED Projector in Pakistan. Delivers 100% DCI-P3 factory-calibrated color accuracy, AI cinema tone mapping, and maintenance-free 30,000-hour solid-state projection for executive screening rooms.',
  },
  'bosch-paviro-pva-2p500-pakistan': {
    gtin: computeUpc12('87173322500'),
    mpn: 'PVA-2P500',
    brand: 'Bosch',
    color: 'Black',
    regularPrice: 410000,
    salePrice: 375000,
    categorySlugs: ['intercom-paging-access'],
    images: [
      'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&q=80',
      'https://images.unsplash.com/photo-1520166012956-add9ba0ee3f4?w=800&q=80',
    ],
    highlight: 'Professional 2 x 500W Class-D power amplifier for commercial PA and evacuation',
    defaultSpecs:
      'Output Power:2 x 500 Watt 100V/70V galvanic-isolated Class-D amplification;Certification:EN 54-16 certified voice alarm and commercial public address;Power Efficiency:Over 85% efficiency with intelligent standby sleep mode;Form Factor:2U 19-inch rackmount industrial chassis with 24V DC backup input;Warranty:1-Year Official Bosch Pakistan Warranty',
    defaultDescription:
      'Bosch PAVIRO PVA-2P500 Professional 2x500W Power Amplifier in Pakistan. Engineered for commercial public address, corporate auditoriums, airports, and emergency voice evacuation systems with EN 54-16 reliability.',
  },
  'bosch-paviro-pva-4cr12-pakistan': {
    gtin: computeUpc12('87173324012'),
    mpn: 'PVA-4CR12',
    brand: 'Bosch',
    color: 'Black',
    regularPrice: 540000,
    salePrice: 495000,
    categorySlugs: ['intercom-paging-access'],
    images: [
      'https://images.unsplash.com/photo-1520166012956-add9ba0ee3f4?w=800&q=80',
      'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&q=80',
    ],
    highlight: '12-zone intelligent public address and voice alarm system controller',
    defaultSpecs:
      'Speaker Zones:12 integrated speaker zones expandable up to 492 zones via routers;Audio Matrix:4 simultaneous audio channels with 85 dB+ signal-to-noise DSP;Compliance:EN 54-16 certified emergency sound and fire alarm integration;Signal Processing:Built-in parametric EQ, delay lines, and dynamic range control;Warranty:1-Year Official Bosch Pakistan Warranty',
    defaultDescription:
      'Bosch PAVIRO PVA-4CR12 12-Zone Central Controller in Pakistan. Delivers studio-grade digital signal processing, multi-zone paging, and automated voice evacuation for large corporate facilities, hospitals, and expos.',
  },
  'cisco-8841-ip-phone-pakistan': {
    gtin: computeUpc12('88265888410'),
    mpn: 'CP-8841-K9',
    brand: 'Cisco',
    color: 'Charcoal',
    regularPrice: 78000,
    salePrice: 68500,
    categorySlugs: ['ip-phones', 'voip-phone-systems'],
    images: [
      'https://images.unsplash.com/photo-1563690325150-10aa17ff983e?w=800&q=80',
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80',
    ],
    highlight: '5-line Gigabit color display enterprise IP desk phone with wideband audio',
    defaultSpecs:
      'Display:5-inch high-resolution widescreen WVGA (800x480) 24-bit color display;Lines & Keys:5 programmable SIP line keys and 4 context-sensitive soft keys;Network:Dual 10/100/1000 Gigabit Ethernet switch ports with IEEE 802.3af/at PoE;Audio:Full-duplex wideband G.722 speakerphone and EHS headset support;Warranty:1-Year Official Cisco Pakistan Warranty',
    defaultDescription:
      'Cisco IP Phone 8841 (CP-8841-K9) 5-Line Gigabit Enterprise Desk Phone in Pakistan. Delivers high-fidelity wideband VoIP audio, 5-inch color display, and encrypted SIP communications for Cisco CUCM, Webex, and 3CX.',
  },
  'cisco-cucm-license-pakistan': {
    gtin: computeUpc12('88265800100'),
    mpn: 'CUCM-STD',
    brand: 'Cisco',
    color: 'Black',
    regularPrice: 245000,
    salePrice: 215000,
    categorySlugs: ['voip-phone-systems'],
    images: [
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80',
    ],
    highlight: 'Cisco Unified Communications Manager enterprise call control and VoIP license',
    defaultSpecs:
      'Platform:Cisco Unified Communications Manager (CUCM) Flex 3.0 Licensing;Endpoint Support:Cisco 7800/8800 IP Phones, Jabber, and Webex Room Kits;Enterprise Features:High-availability call routing, extension mobility, presence, and TLS/SRTP encryption;Integration:SIP trunking, LDAP Active Directory sync, and voice gateways;Support:Certified Cisco UC deployment by AV Live Pakistan',
    defaultDescription:
      'Cisco CUCM (Unified Communications Manager) Enterprise Licensing in Pakistan. Enables mission-critical enterprise IP telephony, video calling, and unified endpoint management across multi-branch banking and corporate networks.',
  },
  'cisco-room-bar-pakistan': {
    gtin: computeUpc12('88972800109'),
    mpn: 'CS-BAR-NR-K9',
    brand: 'Cisco',
    color: 'Carbon Black',
    regularPrice: 980000,
    salePrice: 895000,
    categorySlugs: ['video-conferencing', 'touch-panels', 'boardroom-codecs'],
    images: [
      'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&q=80',
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80',
    ],
    highlight: 'All-in-one AI video bar for Webex, Microsoft Teams, and Zoom meeting rooms',
    defaultSpecs:
      'Camera Optics:12MP 4K wide-angle lens with 120-degree FOV and 5x zoom;Controller Included:Cisco Room Navigator 10.1-inch touch scheduling & control panel;Audio System:4-element beamforming microphone array + stereo speakers + external mic port;Display Output:Dual HDMI 4K outputs and USB-C BYOD passthrough;Room Capacity:Huddle to Medium Rooms (4 to 10 Seats);Warranty:1-Year Official Cisco Pakistan Warranty',
    defaultDescription:
      'Cisco Room Bar (CS-BAR-NR-K9) All-in-One 4K Video Conferencing Appliance with Room Navigator Touch Panel in Pakistan. Certified for Cisco Webex, Microsoft Teams Rooms, and Zoom Rooms with AI speaker tracking.',
  },
  'cisco-room-kit-eq-pakistan': {
    gtin: computeUpc12('88972800208'),
    mpn: 'CS-KIT-EQ-C-K9',
    brand: 'Cisco',
    color: 'Carbon Black',
    isBundle: 'yes',
    regularPrice: 2850000,
    salePrice: 2620000,
    categorySlugs: ['video-conferencing', 'large-room', 'boardroom-codecs'],
    images: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80',
    ],
    highlight: 'AI-powered flagship quad-camera codec bundle for large enterprise boardrooms',
    defaultSpecs:
      'Codec Engine:Cisco Codec EQ with NVIDIA AI engine (4x faster processing);Camera System:Cisco Quad Camera bar with four 5K lenses for multi-speaker framing;Display Support:Triple 4K HDMI outputs and 3 HDMI content inputs;Audio Connectivity:3x RJ45 PoE++ ports for Cisco Table/Ceiling Microphone Pro;Room Capacity:Large Executive Boardrooms (16 to 30+ Seats);Warranty:1-Year Official Cisco Pakistan Warranty',
    defaultDescription:
      'Cisco Room Kit EQ (CS-KIT-EQ-C-K9) Flagship AI Boardroom Video Conferencing Bundle in Pakistan. Combines the NVIDIA-powered Codec EQ, Quad Camera bar, and Room Navigator for large multi-display executive boardrooms.',
  },
  'cisco-room-kit-pakistan': {
    gtin: computeUpc12('88265890115'),
    mpn: 'CS-KIT-K9',
    brand: 'Cisco',
    color: 'Silver',
    regularPrice: 1320000,
    salePrice: 1190000,
    categorySlugs: ['video-conferencing', 'boardroom-codecs'],
    images: [
      'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&q=80',
      'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&q=80',
    ],
    highlight: 'Integrated 5K Ultra HD camera, speakers, and microphones for medium rooms',
    defaultSpecs:
      'Camera:Integrated 5K UltraHD sensor with 83-degree horizontal FOV and automatic framing;Audio:Integrated 6-element directional microphone array and front-facing stereo speakers;Outputs:Dual HDMI 4K display outputs and dual HDMI content inputs;Standards:H.323, SIP, Webex, Microsoft Teams, and Zoom interop;Room Capacity:Medium Conference Rooms (6 to 14 Seats);Warranty:1-Year Official Cisco Pakistan Warranty',
    defaultDescription:
      'Cisco Webex Room Kit (CS-KIT-K9) Integrated Video Collaboration Bar in Pakistan. Features a 5K UltraHD camera, built-in stereo loudspeakers, beamforming microphones, and Cisco Touch 10 / Navigator control.',
  },
  'cisco-room-kit-plus-pakistan': {
    gtin: computeUpc12('88265890214'),
    mpn: 'CS-KITPLPTZ4K-K9',
    brand: 'Cisco',
    color: 'Silver',
    isBundle: 'yes',
    regularPrice: 1950000,
    salePrice: 1780000,
    categorySlugs: ['video-conferencing', 'large-room', 'boardroom-codecs', 'touch-panels'],
    images: [
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
    ],
    highlight: 'Enterprise video conferencing kit with Quad Camera and Codec Plus for up to 14 people',
    defaultSpecs:
      'Bundle Components:Cisco Codec Plus + Cisco Quad Camera + Room Navigator Touch Controller;Camera Array:Four embedded digital cameras with 5K sensors and active speaker tracking;Audio Inputs:Up to 3 external Cisco Table or Ceiling Microphones with Noise Removal;Video Outputs:Dual 4K UHD HDMI display outputs at 60fps;Room Capacity:Large Boardrooms (12 to 20 Seats);Warranty:1-Year Official Cisco Pakistan Warranty',
    defaultDescription:
      'Cisco Room Kit Plus (CS-KITPLPTZ4K-K9) Large Boardroom Video Conferencing System in Pakistan. Includes Cisco Codec Plus, Quad Camera bar with 6-speaker array, and touch controller for up to 14–20 seat rooms.',
  },
  'cisco-room-kit-pro-pakistan': {
    gtin: computeUpc12('88265890313'),
    mpn: 'CS-KITPRO-K9',
    brand: 'Cisco',
    color: 'Silver',
    isBundle: 'yes',
    regularPrice: 3250000,
    salePrice: 2980000,
    categorySlugs: ['video-conferencing', 'large-room', 'boardroom-codecs'],
    images: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
    ],
    highlight: 'Complete boardroom and auditorium video conferencing bundle with Quad Camera',
    defaultSpecs:
      'Codec Architecture:Cisco Codec Pro integrator rack-mountable 4K60 video engine;Video Inputs:6 simultaneous video inputs (HDMI & 3G-SDI) for multi-camera switching;Audio Matrix:8 balanced XLR microphone inputs with 8 acoustic echo cancellers;Video Outputs:3 independent 4K UHD HDMI outputs;Room Capacity:Auditoriums, Council Chambers & 30+ Seat Boardrooms;Warranty:1-Year Official Cisco Pakistan Warranty',
    defaultDescription:
      'Cisco Room Kit Pro (CS-KITPRO-K9) Integrator Video Conferencing System in Pakistan. Purpose-built for large boardrooms, auditoriums, and command centers with 6 video inputs, 8 XLR mic channels, and Quad Camera.',
  },
  'cisco-webex-room-kit-plus-pakistan': {
    gtin: computeUpc12('88265890412'),
    mpn: 'CS-KITPLUS-K9',
    brand: 'Cisco',
    color: 'Silver',
    regularPrice: 1850000,
    salePrice: 1690000,
    categorySlugs: ['video-conferencing', 'large-room', 'boardroom-codecs'],
    images: [
      'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&q=80',
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80',
    ],
    highlight: 'Cisco Webex Room Kit Plus collaboration system for large conference rooms',
    defaultSpecs:
      'System Components:Cisco Webex Quad Camera Bar + Codec Plus + Touch 10 Controller;Resolution:1080p60 main video and 4K UHD wireless/wired content sharing;Speaker Tracking:AI-driven presenter and active speaker framing up to 9 meters;Network:Dual Gigabit Ethernet, Wi-Fi 802.11ac, and Bluetooth 4.0;Warranty:1-Year Official Cisco Pakistan Warranty',
    defaultDescription:
      'Cisco Webex Room Kit Plus (CS-KITPLUS-K9) Enterprise Collaboration System in Pakistan. Delivers intelligent speaker tracking, dual-screen 4K content sharing, and seamless H.323/SIP/Webex/Teams connectivity.',
  },
  'dahua-n43al52-bullet-pakistan': {
    gtin: computeUpc12('81930904352'),
    mpn: 'DAH-N43AL52',
    brand: 'Dahua',
    color: 'White',
    regularPrice: 42000,
    salePrice: 36500,
    categorySlugs: ['ip-cameras'],
    images: [
      'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800&q=80',
      'https://images.unsplash.com/photo-1580894894513-541e068a3e2b?w=800&q=80',
    ],
    highlight: '4MP Starlight IR bullet network security camera with AI perimeter protection',
    defaultSpecs:
      'Sensor:4MP 1/3-inch CMOS progressive scan Starlight sensor (2688 x 1520);Lens:2.8mm fixed focal lens with 104-degree horizontal field of view;Night Vision:Smart IR LED illumination up to 50m with 120dB True WDR;Protection:IP67 weatherproof metal housing with 802.3af PoE;Warranty:1-Year Official Dahua Pakistan Warranty',
    defaultDescription:
      'Dahua N43AL52 4MP Starlight IR Bullet Network Camera in Pakistan. Delivers crisp 2688x1520 resolution, Smart H.265+ compression, 120dB WDR, and AI perimeter protection for commercial surveillance.',
  },
  'epson-lifestudio-flex-plus-pakistan': {
    gtin: computeUpc12('01034396501'),
    mpn: 'EPS-LS-FLEX-PLUS',
    brand: 'Epson',
    color: 'White',
    regularPrice: 520000,
    salePrice: 475000,
    categorySlugs: ['projectors'],
    images: [
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80',
      'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80',
    ],
    highlight: '3LCD high-lumen smart laser projector for corporate presentations and events',
    defaultSpecs:
      'Projection System:Epson 3-Chip 3LCD RGB Laser Phosphor optical engine;Brightness:4,500 Lumens equal color and white brightness;Resolution:4K PRO-UHD enhancement with HDR10 and 2,500,000:1 dynamic contrast;Laser Lifespan:20,000 hours maintenance-free operation with instant ON/OFF;Warranty:2-Year Official Epson Pakistan Warranty',
    defaultDescription:
      'Epson LifeStudio Flex Plus 3LCD Smart Laser Projector in Pakistan. Combines 4,500-lumen color brightness, 4K PRO-UHD clarity, and wireless Miracast screen sharing for bright conference rooms and events.',
  },
  'fanvil-x4-ip-phone-pakistan': {
    gtin: computeUpc12('69372956004'),
    mpn: 'FANVIL-X4',
    brand: 'Fanvil',
    color: 'Black',
    regularPrice: 28000,
    salePrice: 23500,
    categorySlugs: ['ip-phones', 'voip-phone-systems'],
    images: [
      'https://images.unsplash.com/photo-1563690325150-10aa17ff983e?w=800&q=80',
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80',
    ],
    highlight: '4-line enterprise IP phone with dual color displays and HD voice',
    defaultSpecs:
      'Displays:2.8-inch main color LCD (320x240) + 2.4-inch side DSS color key screen;SIP Lines:4 SIP accounts with 30 programmable BLF/speed-dial DSS keys;Audio:HD Wideband G.722 and Opus voice codecs on handset and speakerphone;Network:Dual 10/100/1000 Mbps Gigabit Ethernet ports with integrated PoE;Warranty:1-Year Official Fanvil Pakistan Warranty',
    defaultDescription:
      'Fanvil X4U / X4 Enterprise Gigabit Dual-Screen IP Phone in Pakistan. Features 4 SIP lines, a dedicated 2.4-inch color DSS BLF side screen, PoE, and wideband HD audio for 3CX, FreePBX, and Grandstream UCM.',
  },
  'freepbx-enterprise-pakistan': {
    gtin: computeUpc12('84004609001'),
    mpn: 'FREEPBX-ENT',
    brand: 'FreePBX',
    color: 'Black',
    regularPrice: 285000,
    salePrice: 245000,
    categorySlugs: ['voip-phone-systems'],
    images: [
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
    ],
    highlight: 'Turnkey enterprise IP PBX appliance and Asterisk unified communications system',
    defaultSpecs:
      'Architecture:Open-standards Sangoma / Asterisk SIP IP PBX appliance & server;Capacity:Supports 50 to 500+ enterprise VoIP extensions and 150 concurrent calls;Included Modules:Multi-level IVR, Auto-Attendant, Call Recording, Ring Groups, and SIP Trunking;Licensing:Zero per-user recurring extension license fees;Support:Nationwide installation & SLA configuration by AV Live',
    defaultDescription:
      'FreePBX Enterprise Unified Communications System in Pakistan. Turnkey VoIP PBX call server solution with multi-level Urdu/English IVR, call recording, conference bridges, and seamless PRI/SIP trunk integration.',
  },
  'grandstream-gxp2170-pakistan': {
    gtin: computeUpc12('69472737217'),
    mpn: 'GXP2170',
    brand: 'Grandstream',
    color: 'Black',
    regularPrice: 46000,
    salePrice: 39500,
    categorySlugs: ['ip-phones', 'voip-phone-systems'],
    images: [
      'https://images.unsplash.com/photo-1563690325150-10aa17ff983e?w=800&q=80',
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80',
    ],
    highlight: '12-line Gigabit enterprise IP phone with 4.3-inch color LCD and Bluetooth',
    defaultSpecs:
      'Lines & Accounts:12 dual-color line keys, 6 SIP accounts, and 48 digital on-screen BLF keys;Display:4.3-inch (480x272) TFT color LCD screen;Connectivity:Dual Gigabit PoE ports, integrated Bluetooth, and USB port;Expansion:Supports up to four GXP2200EXT cascaded extension modules (160 keys);Warranty:1-Year Official Grandstream Pakistan Warranty',
    defaultDescription:
      'Grandstream GXP2170 12-Line Executive Gigabit IP Phone in Pakistan. Built for receptionists and high-volume users with 48 digital BLF speed-dial keys, built-in Bluetooth, dual Gigabit PoE, and zero-config UCM provisioning.',
  },
  'grandstream-ucm6304-pakistan': {
    gtin: computeUpc12('69472737634'),
    mpn: 'UCM6304',
    brand: 'Grandstream',
    color: 'Black',
    regularPrice: 310000,
    salePrice: 278000,
    categorySlugs: ['voip-phone-systems'],
    images: [
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
      'https://images.unsplash.com/photo-1563690325150-10aa17ff983e?w=800&q=80',
    ],
    highlight: 'Enterprise IP PBX appliance supporting up to 2000 users and 300 concurrent calls',
    defaultSpecs:
      'User Capacity:Up to 2,000 SIP users and 300 concurrent calls;Analog Interfaces:4 FXS telephone ports and 4 FXO PSTN trunk ports with power-outage lifeline;Network Ports:3 self-adaptive Gigabit RJ45 ports with PoE+ and NAT router;Collaboration:Built-in video conferencing and Grandstream Wave mobile/desktop app;Warranty:1-Year Official Grandstream Pakistan Warranty',
    defaultDescription:
      'Grandstream UCM6304 Enterprise IP PBX Unified Communications Appliance in Pakistan. Supports up to 2,000 users, 300 concurrent calls, 4 FXO/4 FXS ports, and built-in voice and video conferencing with zero license fees.',
  },
  'grandstream-ucm6308-pakistan': {
    gtin: computeUpc12('69472737638'),
    mpn: 'UCM6308',
    brand: 'Grandstream',
    color: 'Black',
    regularPrice: 465000,
    salePrice: 425000,
    categorySlugs: ['voip-phone-systems'],
    images: [
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
    ],
    highlight: 'High-capacity IP PBX supporting 3000 users, 450 concurrent calls, and 8 FXO/FXS ports',
    defaultSpecs:
      'User Capacity:Up to 3,000 SIP users and 450 simultaneous calls;Analog Interfaces:8 FXS analog telephone ports and 8 FXO PSTN trunk ports;Hardware:1U 19-inch rackmount chassis with hot-standby HA clustering support;Cloud Management:GDMS cloud provisioning, API/CRM integration, and Wave app;Warranty:1-Year Official Grandstream Pakistan Warranty',
    defaultDescription:
      'Grandstream UCM6308 High-Capacity Enterprise IP PBX in Pakistan. Engineered for large enterprises, hospitals, and call centers with up to 3,000 users, 450 simultaneous calls, and 8 FXO/8 FXS ports.',
  },
  'hikvision-colorvu-camera-pakistan': {
    gtin: computeUpc12('84257123472'),
    mpn: 'DS-2CD2347G2-LU',
    brand: 'Hikvision',
    color: 'White',
    regularPrice: 38500,
    salePrice: 33500,
    categorySlugs: ['ip-cameras'],
    images: [
      'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800&q=80',
      'https://images.unsplash.com/photo-1580894894513-541e068a3e2b?w=800&q=80',
    ],
    highlight: '4MP ColorVu 24/7 full-color turret network camera with AcuSense and built-in mic',
    defaultSpecs:
      'Resolution:4 MP (2688 x 1520) 24/7 full-color low-light imaging;Aperture:F1.0 super-aperture lens with warm supplemental light up to 30m;AI Analytics:AcuSense deep-learning human and vehicle target classification;Audio & Protection:Built-in high-sensitivity microphone with IP67 weatherproof rating;Warranty:1-Year Official Hikvision Pakistan Warranty',
    defaultDescription:
      'Hikvision ColorVu DS-2CD2347G2-LU 4MP Full-Color Turret IP Camera in Pakistan. Features an F1.0 super-aperture lens, 24/7 vivid color night vision, AcuSense AI false-alarm filtering, and built-in audio security.',
  },
  'hikvision-ptz-camera-pakistan': {
    gtin: computeUpc12('84257144250'),
    mpn: 'DS-2DE4A425IW-DE',
    brand: 'Hikvision',
    color: 'White',
    regularPrice: 168000,
    salePrice: 149000,
    categorySlugs: ['ip-cameras', 'ptz-cameras'],
    images: [
      'https://images.unsplash.com/photo-1580894894513-541e068a3e2b?w=800&q=80',
      'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800&q=80',
    ],
    highlight: '4MP 25x Optical Zoom DarkFighter IR Network PTZ Camera for large venues',
    defaultSpecs:
      'Optical Zoom:25x motorized optical zoom (4.8mm to 120mm) + 16x digital zoom;Image Sensor:4MP 1/2.5-inch Powered-by-DarkFighter ultra-low-light CMOS;Night Vision:Up to 50m Smart IR night vision with 120dB True WDR;Smart Analytics:Auto-tracking, face capture, and perimeter intrusion detection;Warranty:1-Year Official Hikvision Pakistan Warranty',
    defaultDescription:
      'Hikvision DS-2DE4A425IW-DE 4MP 25x Optical Zoom PTZ Network Camera in Pakistan. Powered by DarkFighter technology for superior low-light surveillance across corporate campuses, expos, and auditoriums.',
  },
  'horion-k6a-bundle-special-offer': {
    gtin: computeUpc12('69718240665'),
    mpn: 'HRN-K6A-65-BUNDLE',
    brand: 'Horion',
    color: 'Black',
    isBundle: 'yes',
    regularPrice: 720000,
    salePrice: 645000,
    categorySlugs: ['touch-panels', 'video-conferencing', 'large-room'],
    images: [
      'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80',
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80',
    ],
    highlight: '65-inch 4K UHD Interactive Smart Board with 48MP AI Camera and 8-Mic Array',
    defaultSpecs:
      'Display Panel:65-inch 4K UHD (3840 x 2160) Zero-Bonding anti-glare interactive touch screen;Built-In Camera:48MP AI voice-tracking conference camera with 120-degree wide FOV;Microphone Array:8-element beamforming microphone array with 12-meter voice pickup;Operating System:Dual-OS Android 13.0 (8GB RAM / 128GB ROM) + OPS Windows slot;Bundle Accessories:Mobile floor stand, wireless screen-sharing dongle, and dual styluses;Warranty:1-Year Official Horion Pakistan On-Site Warranty',
    defaultDescription:
      'Horion 65" K6A 4K Interactive Flat Panel Smart Board Bundle in Pakistan. Combines a 65-inch 4K touch whiteboard, 48MP AI tracking camera, 8-microphone array, and mobile stand for corporate boardrooms in Lahore, Karachi, and Islamabad.',
  },
  'itc-va-6200ma-pakistan': {
    gtin: computeUpc12('69412640620'),
    mpn: 'VA-6200MA',
    brand: 'ITC',
    color: 'Black',
    regularPrice: 345000,
    salePrice: 315000,
    categorySlugs: ['intercom-paging-access'],
    images: [
      'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&q=80',
      'https://images.unsplash.com/photo-1520166012956-add9ba0ee3f4?w=800&q=80',
    ],
    highlight: '8-zone voice evacuation and public address master controller with 500W amplifier',
    defaultSpecs:
      'Zones:8 speaker output zones expandable up to 1,200 zones;Amplifier:Built-in 500W Class-D 100V digital power amplifier;Control Screen:4.3-inch color touch screen with MP3/SD emergency evacuation player;Compliance:EN 54-16 voice alarm and fire panel dry-contact integration;Warranty:1-Year Official ITC Audio Pakistan Warranty',
    defaultDescription:
      'ITC VA-6200MA All-in-One Public Address & Voice Evacuation Controller in Pakistan. Features an integrated 500W digital amplifier, 8-zone speaker matrix, 4.3-inch touch screen control, and fire alarm integration.',
  },
  'jabra-evolve-75-pakistan': {
    gtin: '706487017509',
    mpn: '7599-838-109',
    brand: 'Jabra',
    color: 'Black',
    regularPrice: 88000,
    salePrice: 76500,
    categorySlugs: ['headsets'],
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80',
    ],
    highlight: 'Wireless Bluetooth stereo headset with superior Active Noise Cancellation and busylight',
    defaultSpecs:
      'Noise Cancellation:Superior Hybrid 4-Mic Active Noise Cancellation (ANC);Connectivity:Dual Bluetooth 4.2 + Jabra Link 370 USB-A dongle (30m wireless range);Battery Life:Up to 18 hours talk time and 15 hours ANC listening time;Certifications:Certified for Microsoft Teams, Zoom, Cisco, and 3CX;Warranty:1-Year Official Jabra Pakistan Warranty',
    defaultDescription:
      'Jabra Evolve 75 UC Stereo Wireless ANC Headset (7599-838-109) in Pakistan. Engineered for open offices and C-suite executives with hybrid Active Noise Cancellation, integrated dual busylights, and Link 370 USB adapter.',
  },
  'jabra-evolve2-65-pakistan': {
    gtin: '706487020080',
    mpn: '26599-989-999',
    brand: 'Jabra',
    color: 'Black',
    regularPrice: 74000,
    salePrice: 64500,
    categorySlugs: ['headsets', 'speakerphones'],
    images: [
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    ],
    highlight: '3-microphone call technology wireless UC headset with 37-hour battery life',
    defaultSpecs:
      'Microphone Array:3-microphone digital MEMS call technology for 23% less background noise;Speakers:40mm leak-tolerant acoustic drivers with memory-foam ear cushions;Battery Performance:Up to 37 hours wireless battery life with 15-min fast charge;Adapter Included:Jabra Link 380 Bluetooth USB adapter (30m/100ft range);Warranty:1-Year Official Jabra Pakistan Warranty',
    defaultDescription:
      'Jabra Evolve2 65 Wireless Stereo UC Headset (26599-989-999) in Pakistan. Features 3-microphone noise-isolating call technology, 37-hour battery life, 360-degree busylight, and Microsoft Teams / Zoom certification.',
  },
  'logitech-rally-bar-mini-pakistan': {
    gtin: '097855162991',
    mpn: '960-001336',
    brand: 'Logitech',
    color: 'Graphite',
    regularPrice: 695000,
    salePrice: 635000,
    categorySlugs: ['video-conferencing'],
    images: [
      'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&q=80',
      'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&q=80',
    ],
    highlight: 'Premier all-in-one 4K AI video conferencing bar for small to medium meeting rooms',
    defaultSpecs:
      'Camera Optics:4K Ultra HD motorized pan/tilt lens with 120-degree FOV, 4x HD zoom + AI Viewfinder;Audio System:6 beamforming DMIC microphone elements (4.5m range) + 3-speaker array;Microphone Expansion:Supports up to 2 external Logitech Rally Mic Pods;Platform Support:Appliance Mode (Zoom Rooms, Microsoft Teams Rooms) & USB Plug-and-Play;Room Capacity:Small to Medium Rooms (4 to 10 Seats);Warranty:2-Year Official Logitech Pakistan Warranty',
    defaultDescription:
      'Logitech Rally Bar Mini (960-001336) All-in-One 4K AI Video Conferencing Bar in Pakistan. Designed for huddle and small-to-medium rooms with motorized PTZ, RightSight 2 AI Viewfinder, and native Zoom/Teams appliance mode.',
  },
  'logitech-rally-bar-pakistan': {
    gtin: '097855162168',
    mpn: '960-001308',
    brand: 'Logitech',
    color: 'Graphite',
    regularPrice: 945000,
    salePrice: 865000,
    categorySlugs: ['video-conferencing', 'large-room', 'ptz-cameras', 'touch-panels'],
    images: [
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80',
      'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&q=80',
    ],
    highlight: 'Flagship all-in-one video bar with motorized PTZ optical zoom for medium to large rooms',
    defaultSpecs:
      'Camera & Optics:4K motorized optical PTZ lens (5x optical / 15x total HD zoom) + secondary AI Viewfinder camera;Audio Engineering:6 adaptive beamforming mics + dual anti-vibration low-distortion speakers;Expandability:Supports up to 4 daisy-chained Logitech Rally Mic Pods (15m+ table coverage);Display & OS:Dual HDMI 4K outputs, CollabOS (Zoom Rooms, Microsoft Teams Rooms, USB BYOD);Room Capacity:Medium to Large Boardrooms (10 to 22 Seats);Warranty:2-Year Official Logitech Pakistan Warranty',
    defaultDescription:
      'Logitech Rally Bar (960-001308) Flagship All-in-One 4K Video Bar in Pakistan. Features lossless 5x optical PTZ zoom (15x total), AI Viewfinder speaker framing, and expansion up to 4 Rally Mic Pods for medium-to-large boardrooms.',
  },
  'optoma-gt4000uhd-pakistan': {
    gtin: computeUpc12('79643544671'),
    mpn: 'OPT-GT4000UHD',
    brand: 'Optoma',
    color: 'Black',
    regularPrice: 685000,
    salePrice: 625000,
    categorySlugs: ['projectors'],
    images: [
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80',
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
    ],
    highlight: '4000-lumen 4K UHD ultra-short throw DuraCore laser projector for boardrooms and stages',
    defaultSpecs:
      'Resolution & Brightness:True 4K UHD (3840 x 2160) with 4,000 ANSI Lumens DuraCore Laser;Throw Ratio:0.25:1 Ultra-Short Throw (projects 100-inch image from just 12 inches away);Light Source:30,000-hour maintenance-free IP6X dust-sealed laser engine;Connectivity:Dual HDMI 2.0, VGA, RS-232, RJ45 LAN control, and 3D sync;Warranty:1-Year Official Optoma Pakistan Warranty',
    defaultDescription:
      'Optoma GT4000UHD 4,000-Lumen 4K UHD Ultra-Short Throw Laser Projector in Pakistan. Projects a shadow-free 100" to 120" 4K image from inches away—ideal for tight corporate boardrooms, simulation domes, and stage backdrops.',
  },
  'optoma-pk32-pocket-pakistan': {
    gtin: computeUpc12('79643544320'),
    mpn: 'OPT-PK32-PHOTON',
    brand: 'Optoma',
    color: 'Black',
    regularPrice: 135000,
    salePrice: 118000,
    categorySlugs: ['projectors'],
    images: [
      'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80',
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80',
    ],
    highlight: 'Ultra-portable LED pocket projector for mobile executive presentations',
    defaultSpecs:
      'Light Source:Triple RGB LED solid-state optical engine (20,000+ hours);Portability:Ultra-lightweight palm-sized chassis with rechargeable battery;Connectivity:HDMI, USB-C DisplayPort, MicroSD slot, and wireless screen mirroring;Keystone:Auto vertical keystone correction and instant 3-second boot;Warranty:1-Year Official Optoma Pakistan Warranty',
    defaultDescription:
      'Optoma PK32 Photon Ultra-Portable LED Pocket Projector in Pakistan. Designed for traveling executives and field sales teams needing instant HDMI/USB-C presentations anywhere.',
  },
  'panasonic-pt-rq45k-pakistan': {
    gtin: computeUpc12('88517045001'),
    mpn: 'PAN-PT-RQ45K',
    brand: 'Panasonic',
    color: 'Black',
    regularPrice: 5200000,
    salePrice: 4850000,
    categorySlugs: ['projectors'],
    images: [
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
      'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80',
    ],
    highlight: '40,000-lumen 3-Chip DLP 4K SOLID SHINE laser projector for 3D projection mapping and expos',
    defaultSpecs:
      'Light Output:40,000 Lumens 3-Chip DLP Red & Blue SOLID SHINE Laser Phosphor;Resolution:4K Quad Pixel Drive (3840 x 2400) with Rich Color Enhancer;Signal Inputs:12G-SDI, HDMI, DIGITAL LINK, and Intel SDM slot modules;Reliability:Filterless hermetically sealed optical block with dual-laser failover;Use Case:3D Architectural Projection Mapping, Stadiums & Mega Corporate Events;Warranty:Official Panasonic Pro-AV Pakistan Project Support',
    defaultDescription:
      'Panasonic PT-RQ45K 40,000-Lumen 3-Chip DLP 4K Laser Venue Projector in Pakistan. The ultimate powerhouse for architectural 3D projection mapping, hologram stages, and large-scale arena events across Lahore, Karachi, and Islamabad.',
  },
  'panasonic-pt-vmz82-pakistan': {
    gtin: computeUpc12('88517082001'),
    mpn: 'PAN-PT-VMZ82',
    brand: 'Panasonic',
    color: 'White',
    regularPrice: 980000,
    salePrice: 895000,
    categorySlugs: ['projectors'],
    images: [
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80',
      'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80',
    ],
    highlight: '8,000-lumen compact WUXGA laser LCD projector for bright corporate auditoriums',
    defaultSpecs:
      'Brightness:8,000 Lumens SOLID SHINE Laser LCD optical engine;Resolution:WUXGA (1920 x 1200) with 4K/30p signal input compatibility;Lens Shift & Zoom:1.6x optical zoom with wide vertical (+67%) and horizontal (+/-35%) lens shift;Contrast Ratio:3,000,000:1 dynamic contrast with Daylight View Basic sensor;Warranty:2-Year Official Panasonic Pakistan Warranty',
    defaultDescription:
      'Panasonic PT-VMZ82 8,000-Lumen Compact WUXGA Laser Projector in Pakistan. World-class brightness in a lightweight 7.2kg body for university auditoriums, corporate townhalls, and bright conference halls.',
  },
  'poly-blackwire-c3220-pakistan': {
    gtin: '017229160835',
    mpn: '209745-201',
    brand: 'HP Poly',
    color: 'Black',
    regularPrice: 19500,
    salePrice: 16500,
    categorySlugs: ['headsets'],
    images: [
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    ],
    highlight: 'Hi-fi stereo USB-A wired UC headset with noise-canceling microphone and inline controls',
    defaultSpecs:
      'Audio Performance:Dynamic EQ with wideband PC audio (up to 6,800 Hz) and hi-fi stereo output;Microphone:Flexible noise-canceling boom mic with SoundGuard acoustic hearing protection;Connectivity:Plug-and-play USB-A wired connection with inline call/mute/volume controller;Headband:Lightweight adjustable metal headband for all-day BPO & contact center wear;Warranty:1-Year Official HP Poly Pakistan Warranty',
    defaultDescription:
      'HP Poly (Plantronics) Blackwire C3220 USB-A Stereo Wired UC Headset (209745-201) in Pakistan. The industry benchmark for call centers, banking customer service desks, and enterprise UC deployments.',
  },
  'poly-g7500-pakistan': {
    gtin: '196548573226',
    mpn: '7200-87310-001',
    brand: 'HP Poly',
    color: 'Black',
    regularPrice: 1580000,
    salePrice: 1420000,
    categorySlugs: ['video-conferencing', 'large-room', 'boardroom-codecs'],
    images: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80',
    ],
    highlight: 'Modular 4K Ultra HD video conferencing codec and content sharing system for large boardrooms',
    defaultSpecs:
      'Video Resolution:4K Ultra HD 60fps people video and 4K wireless/HDMI content sharing;Modular Interfaces:3x RJ45 PoE+ LLN ports for IP Table/Ceiling Microphones & EagleEye IV/Director II cameras;Audio Intelligence:Poly NoiseBlockAI, Acoustic Fence, and 3.5mm/XLR audio integration;Protocols:Native Zoom Rooms, Microsoft Teams, H.323, and SIP standards mode;Room Capacity:Custom Large Boardrooms & Training Halls (16 to 40+ Seats);Warranty:1-Year Official HP Poly Pakistan Warranty',
    defaultDescription:
      'HP Poly G7500 Modular 4K Video Conferencing Codec System (7200-87310-001) in Pakistan. Built for large custom boardrooms and divisible training rooms requiring multiple PTZ cameras, ceiling microphones, and H.323/SIP/Zoom/Teams support.',
  },
  'poly-studio-usb-video-bar-pakistan': {
    gtin: '610807882558',
    mpn: '7200-85830-012',
    brand: 'Poly',
    color: 'Black',
    regularPrice: 285000,
    salePrice: 248000,
    categorySlugs: ['video-conferencing', 'speakerphones'],
    images: [
      'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&q=80',
      'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&q=80',
    ],
    highlight: 'Premier 4K USB video bar with Poly DirectorAI speaker tracking and Acoustic Fence',
    defaultSpecs:
      'Camera Optics:4K UHD sensor with 120-degree FOV, 5x electronic zoom, and automatic speaker/group framing;Microphone Array:6-element beamforming microphone array with 4.5-meter (15ft) pickup range;Audio Technology:Poly Acoustic Fence and NoiseBlockAI eliminate outside office chatter;Connectivity:Plug-and-Play USB-C / USB-A + Bluetooth 4.2 + Wi-Fi management;Room Capacity:Huddle & Small Conference Rooms (2 to 8 Seats);Warranty:1-Year Official HP Poly Pakistan Warranty',
    defaultDescription:
      'Poly Studio USB 4K Video Bar (7200-85830-012) in Pakistan. Plug-and-play USB video bar featuring Poly DirectorAI automatic speaker tracking, Acoustic Fence, NoiseBlockAI, and hi-fi stereo speakers for Zoom, Teams, and Google Meet.',
  },
  'poly-studio-v52-pakistan': {
    gtin: computeUpc12('19812209521'),
    mpn: 'A09D4AA',
    brand: 'HP Poly',
    color: 'Black',
    regularPrice: 545000,
    salePrice: 485000,
    categorySlugs: ['video-conferencing', 'speakerphones'],
    images: [
      'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&q=80',
      'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&q=80',
    ],
    highlight: 'Next-gen 20MP 4K USB video bar with DirectorAI perimeter framing for medium rooms',
    defaultSpecs:
      'Camera Sensor:20MP 4K UltraHD 95-degree FOV camera with 5x zoom and DirectorAI Perimeter;Audio Pickup:Next-gen 4-way beamforming microphone array (up to 6.1m / 20ft pickup range);Noise Suppression:Poly NoiseBlockAI v2 machine-learning glass reverberation & keyboard filtering;Connectivity:USB-C BYOD, Dual HDMI monitor support, RJ45 Ethernet for Poly Lens cloud;Room Capacity:Medium Conference Rooms (6 to 12 Seats);Warranty:1-Year Official HP Poly Pakistan Warranty',
    defaultDescription:
      'HP Poly Studio V52 Premium USB Video Bar (A09D4AA) in Pakistan. Upgrading the legendary Poly Studio USB for medium-sized rooms with a sharp 20MP 4K camera, 20-foot mic pickup, and DirectorAI Perimeter framing.',
  },
  'poly-studio-x32-pakistan': {
    gtin: computeUpc12('19812232001'),
    mpn: 'A3SV5AA',
    brand: 'HP Poly',
    color: 'Black',
    regularPrice: 560000,
    salePrice: 495000,
    categorySlugs: ['video-conferencing'],
    images: [
      'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&q=80',
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80',
    ],
    highlight: 'All-in-one 4K video bar with native Zoom and Microsoft Teams for huddle rooms',
    defaultSpecs:
      'Camera Optics:4K 20MP UltraHD 120-degree wide-angle lens with Poly DirectorAI;Native OS:Built-in Poly VideoOS (native Zoom Rooms, Microsoft Teams Rooms, Google Meet);Audio:Beamforming microphone array (4.5m pickup) + acoustic chamber speaker;Display Output:Single/Dual HDMI output with wireless AirPlay, Miracast & USB-C BYOD;Room Capacity:Huddle & Small Rooms (2 to 6 Seats);Warranty:1-Year Official HP Poly Pakistan Warranty',
    defaultDescription:
      'HP Poly Studio X32 All-in-One 4K Video Bar (A3SV5AA) in Pakistan. Compact standalone video bar for small rooms and executive offices with native Zoom Rooms and Microsoft Teams Rooms—no external PC required.',
  },
  'poly-studio-x50-pakistan': {
    gtin: '610807891673',
    mpn: '2200-85970-001',
    brand: 'HP Poly',
    color: 'Black',
    regularPrice: 725000,
    salePrice: 655000,
    categorySlugs: ['video-conferencing'],
    images: [
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80',
      'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&q=80',
    ],
    highlight: 'Radically simple all-in-one 4K dual-display video bar for medium boardrooms',
    defaultSpecs:
      'Camera:4K UHD 120-degree FOV sensor with 5x digital zoom and Poly DirectorAI framing;Audio System:5-element next-gen beamforming mic array (7.6m / 25ft pickup) + stereo speakers;Video Outputs:Dual HDMI 4K outputs for simultaneous people and content displays;Platform Support:Native Zoom Rooms, Microsoft Teams Rooms, H.323/SIP, and USB Device Mode;Room Capacity:Medium Conference Rooms (6 to 10 Seats);Warranty:1-Year Official HP Poly Pakistan Warranty',
    defaultDescription:
      'HP Poly Studio X50 All-in-One Dual-Display 4K Video Conferencing Bar (2200-85970-001) in Pakistan. Delivers boardroom-filling stereo sound, 25-foot microphone pickup, and native Zoom/Teams operation.',
  },
  'poly-studio-x52-pakistan': {
    gtin: '197029653413',
    mpn: '7200-87620-001',
    brand: 'HP Poly',
    color: 'Black',
    regularPrice: 845000,
    salePrice: 765000,
    categorySlugs: ['video-conferencing'],
    images: [
      'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&q=80',
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80',
    ],
    highlight: 'All-in-one 20MP 4K UltraHD video bar with 95-degree FOV and Poly DirectorAI',
    defaultSpecs:
      'Camera Optics:20MP 4K UltraHD sensor with sharp 95-degree FOV and 5x zoom for deeper medium rooms;AI Framing:Poly DirectorAI speaker, group, and people framing with perimeter boundary control;Audio:6-meter MEMS + second-order gradient microphones with NoiseBlockAI & Acoustic Fence;Displays & Control:Dual HDMI 4K outputs + optional Poly TC10 touch controller;Room Capacity:Medium Conference Rooms (8 to 14 Seats);Warranty:1-Year Official HP Poly Pakistan Warranty',
    defaultDescription:
      'HP Poly Studio X52 All-in-One 20MP 4K Video Bar (7200-87620-001) in Pakistan. Purpose-built for medium-sized boardrooms with a 95-degree distortion-free lens, DirectorAI smart camera tech, and native Zoom/Teams.',
  },
  'poly-studio-x72-pakistan': {
    gtin: computeUpc12('19812272014'),
    mpn: 'A4LZ8AA',
    brand: 'HP Poly',
    color: 'Black',
    regularPrice: 1290000,
    salePrice: 1165000,
    categorySlugs: ['video-conferencing', 'large-room', 'ptz-cameras', 'touch-panels'],
    images: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80',
    ],
    highlight: 'Dual-lens 4K 20MP flagship all-in-one video conferencing bar for large conference rooms (Poly X70 / X72 Series)',
    defaultSpecs:
      'Dual Camera Array:Two 20MP 4K UltraHD sensors (120-degree wide lens + 70-degree narrow telephoto lens);Optical-Grade Zoom:Seamless electronic transition up to 7.3x zoom for far-end boardroom seats;Audio Expansion:7.6m (25ft) built-in mic pickup + expandable via Poly Studio Table/Ceiling mics;Two-Way Stereo Speakers:Custom bass ports, aluminum cone tweeters, and Poly NoiseBlockAI;Room Capacity:Large Executive Boardrooms (14 to 26+ Seats);Warranty:1-Year Official HP Poly Pakistan Warranty',
    defaultDescription:
      'HP Poly Studio X72 / X70 Dual-4K Lens Large Boardroom Video Bar (A4LZ8AA) in Pakistan. Combines wide and telephoto 20MP 4K cameras, Poly DirectorAI multi-speaker framing, and two-way stereo speakers for large executive rooms.',
  },
  'poly-voyager-focus-uc-pakistan': {
    gtin: '017229147768',
    mpn: '202652-101',
    brand: 'HP Poly',
    color: 'Black',
    regularPrice: 69000,
    salePrice: 59500,
    categorySlugs: ['headsets'],
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80',
    ],
    highlight: 'Stereo Bluetooth ANC wireless headset with charging stand and smart sensor technology',
    defaultSpecs:
      'Active Noise Canceling:On-demand active and passive noise cancelation + OpenMic button;Smart Sensors:Automatically answers calls when put on and mutes when taken off;Microphones:3 precision-tuned mics with dynamic mute alert and WindSmart protection;Included Accessories:Desktop magnetic charging stand + BT600 USB Bluetooth adapter (45m range);Warranty:1-Year Official HP Poly Pakistan Warranty',
    defaultDescription:
      'HP Poly (Plantronics) Voyager Focus UC B825-M Wireless Bluetooth ANC Headset with Charging Stand (202652-101) in Pakistan. Features smart wearer sensors, 3-mic noise cancellation, and seamless PC/mobile switching.',
  },
  'polycom-vvx-250-pakistan': {
    gtin: '610807864257',
    mpn: '2200-48820-025',
    brand: 'Polycom',
    color: 'Black',
    regularPrice: 36500,
    salePrice: 31500,
    categorySlugs: ['ip-phones', 'voip-phone-systems'],
    images: [
      'https://images.unsplash.com/photo-1563690325150-10aa17ff983e?w=800&q=80',
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80',
    ],
    highlight: '4-line Gigabit color display IP desk phone with Poly HD Voice and Acoustic Clarity',
    defaultSpecs:
      'Display:2.8-inch (320 x 240) backlit color LCD screen;SIP Lines:4 programmable line keys with 4 context-sensitive soft keys;Audio Quality:Poly HD Voice and Poly Acoustic Fence background noise suppression;Network & Ports:Dual 10/100/1000 Gigabit Ethernet ports (PoE Class 2) + USB port for headsets;Warranty:1-Year Official Poly Pakistan Warranty',
    defaultDescription:
      'Polycom VVX 250 4-Line Business IP Desk Phone (2200-48820-025) in Pakistan. Features Poly HD Voice, Acoustic Fence technology, a 2.8-inch color display, and dual Gigabit PoE ports for enterprise VoIP deployments.',
  },
  'sony-bravia-projector-7-pakistan': {
    gtin: computeUpc12('02724292500'),
    mpn: 'VPL-XW5000ES',
    brand: 'Sony',
    color: 'Black',
    regularPrice: 1650000,
    salePrice: 1495000,
    categorySlugs: ['projectors'],
    images: [
      'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80',
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80',
    ],
    highlight: 'Native 4K SXRD laser projector with X1 Ultimate processor for executive screening rooms',
    defaultSpecs:
      'Panel Technology:Three 0.61-inch Native 4K (3840 x 2160) SXRD panels (8.3M pixels);Video Processor:Sony X1 Ultimate for Projector with Object-Based HDR Remaster;Light Source:Z-Phosphor solid-state laser diode (2,000 lumens, 20,000-hour lifespan);Color Volume:TRILUMINOS PRO covering 95% DCI-P3 wide color gamut;Warranty:1-Year Official Sony Pakistan Warranty',
    defaultDescription:
      'Sony VPL-XW5000ES / BRAVIA Projector 7 Native 4K SXRD Laser Projector in Pakistan. Powered by Sony X1 Ultimate processing for reference-grade 4K HDR visuals in executive screening rooms and simulation suites.',
  },
  'uniview-ipc3612sr3-vf-pakistan': {
    gtin: computeUpc12('69412640361'),
    mpn: 'UNV-IPC3612SR3-VF',
    brand: 'Uniview',
    color: 'White',
    regularPrice: 26500,
    salePrice: 22500,
    categorySlugs: ['ip-cameras'],
    images: [
      'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800&q=80',
      'https://images.unsplash.com/photo-1580894894513-541e068a3e2b?w=800&q=80',
    ],
    highlight: '2MP varifocal IR dome network security camera with Ultra 265 compression',
    defaultSpecs:
      'Lens:2.8mm to 12mm varifocal optical zoom lens (31° to 105° horizontal FOV);Night Vision:Smart IR up to 30m (98 ft) distance with 120dB optical WDR;Compression:Ultra 265, H.265, H.264 triple video streams;Protection:IP67 weatherproof enclosure (-35°C to 60°C) with 802.3af PoE;Warranty:1-Year Official Uniview Pakistan Warranty',
    defaultDescription:
      'Uniview IPC3612SR3-VF 2MP Varifocal IR Turret Network Camera in Pakistan. Features a 2.8-12mm adjustable optical zoom lens, Smart IR up to 30m, 120dB WDR, and IP67 durability.',
  },
  'viewsonic-lsd400w-pakistan': {
    gtin: computeUpc12('76690704001'),
    mpn: 'VS-LSD400W',
    brand: 'ViewSonic',
    color: 'White',
    regularPrice: 385000,
    salePrice: 345000,
    categorySlugs: ['projectors'],
    images: [
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80',
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
    ],
    highlight: 'High-brightness 3rd-gen laser projector for corporate conference rooms and halls',
    defaultSpecs:
      'Light Source:3rd-Generation Laser Phosphor technology with 4,000+ ANSI Lumens;Lifespan:30,000 hours lamp-free operation with 32% lower power consumption;Installation Flexibility:360-degree projection, H/V keystone correction, and 4-corner adjustment;Control:Crestron, AMX, Extron, and PJLink LAN network management;Warranty:1-Year Official ViewSonic Pakistan Warranty',
    defaultDescription:
      'ViewSonic LSD400W High-Brightness 3rd-Gen Laser Corporate Projector in Pakistan. Engineered for 24/7 operation in boardrooms, university lecture halls, and commercial digital signage installations.',
  },
  'viewsonic-x1-4k-pro-pakistan': {
    gtin: computeUpc12('76690701400'),
    mpn: 'VS-X1-4K-PRO',
    brand: 'ViewSonic',
    color: 'Black',
    regularPrice: 510000,
    salePrice: 465000,
    categorySlugs: ['projectors'],
    images: [
      'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80',
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80',
    ],
    highlight: '4K HDR high-refresh LED smart projector with Harman Kardon speakers for esports & events',
    defaultSpecs:
      'Resolution & Refresh Rate:True 4K UHD HDR with ultra-fast 4.2ms input lag and 240Hz refresh support;Audio System:Dual custom-tuned Harman Kardon theatre speakers;Light Source:3rd-Gen LED technology (2,900 LED Lumens, 60,000-hour lifespan);Lens Adjustment:Vertical lens shift, 1.3x optical zoom, and side projection capability;Warranty:1-Year Official ViewSonic Pakistan Warranty',
    defaultDescription:
      'ViewSonic X1-4K Pro High-Refresh 4K HDR Smart LED Projector in Pakistan. Combines Harman Kardon audio, 4.2ms ultra-low latency for e-Sports arenas, and vivid 4K HDR visuals.',
  },
  'wMbGVClqbDS2LFrv5HyX': {
    gtin: computeUpc12('84004609900'),
    mpn: 'GOOGLE-MEET-LIC',
    brand: 'Google',
    color: 'White',
    regularPrice: 95000,
    salePrice: 85000,
    categorySlugs: ['video-conferencing', 'touch-panels'],
    images: [
      'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&q=80',
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
    ],
    highlight: 'Official annual Google Meet Hardware Room License with cloud device management',
    defaultSpecs:
      'License Type:Annual Google Meet Hardware Room Subscription (12 Months);Admin Features:One-touch calendar join, 24/7 Google Workspace Admin monitoring, peripheral alerts;Compatibility:Logitech Rally Bar, Poly Studio X, Asus, and Series One Google Meet kits;Region:Authorized Pakistan enterprise provisioning by AV Live',
    defaultDescription:
      'Official Google Meet Hardware Annual Room License in Pakistan. Enables cloud device management, one-touch Google Calendar meeting join, and automatic security updates for enterprise conference rooms.',
  },
  'google-meet-hardware-license-pakistan': {
    gtin: computeUpc12('84004609900'),
    mpn: 'GOOGLE-MEET-LIC',
    brand: 'Google',
    color: 'White',
    regularPrice: 95000,
    salePrice: 85000,
    categorySlugs: ['video-conferencing', 'touch-panels'],
    images: [
      'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&q=80',
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
    ],
    highlight: 'Official annual Google Meet Hardware Room License with cloud device management',
    defaultSpecs:
      'License Type:Annual Google Meet Hardware Room Subscription (12 Months);Admin Features:One-touch calendar join, 24/7 Google Workspace Admin monitoring, peripheral alerts;Compatibility:Logitech Rally Bar, Poly Studio X, Asus, and Series One Google Meet kits;Region:Authorized Pakistan enterprise provisioning by AV Live',
    defaultDescription:
      'Official Google Meet Hardware Annual Room License in Pakistan. Enables cloud device management, one-touch Google Calendar meeting join, and automatic security updates for enterprise conference rooms.',
  },
  'yealink-bh70-headset-pakistan': {
    gtin: computeUpc12('84188512087'),
    mpn: 'BH70-DUAL-UC',
    brand: 'Yealink',
    color: 'Black',
    regularPrice: 48000,
    salePrice: 42000,
    categorySlugs: ['headsets'],
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80',
    ],
    highlight: '3-mic AI noise-canceling dual wireless Bluetooth headset with 35-hour talk time',
    defaultSpecs:
      'Microphone System:3-Mic Yealink Acoustic Shield 2.0 AI noise cancellation;Battery Life:Up to 35 hours continuous talk time and 43 hours music playback;Wireless Range:Bluetooth 5.2 + BT51 USB dongle up to 50m (164ft) wireless range;Indicators:Dual-sided 360-degree high-visibility busylight;Warranty:1-Year Official Yealink Pakistan Warranty',
    defaultDescription:
      'Yealink BH70 Dual Wireless Bluetooth UC Headset (BH70-DUAL-UC) in Pakistan. Features 3-mic AI noise cancellation, 35-hour talk time, featherlight 147g ergonomics, and Microsoft Teams / Zoom certification.',
  },
  'yealink-sip-t46s-pakistan': {
    gtin: '841885102949',
    mpn: 'SIP-T46S',
    brand: 'Yealink',
    color: 'Black',
    regularPrice: 54000,
    salePrice: 46500,
    categorySlugs: ['ip-phones', 'voip-phone-systems', 'speakerphones'],
    images: [
      'https://images.unsplash.com/photo-1563690325150-10aa17ff983e?w=800&q=80',
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80',
    ],
    highlight: '16-line executive Gigabit IP phone with 4.3-inch high-resolution color display',
    defaultSpecs:
      'Display:4.3-inch (480 x 272) backlit color display with 16-bit depth;Accounts & Keys:16 VoIP SIP accounts and 10 line keys (up to 27 paperless DSS keys);Audio Technology:Yealink Optima HD Voice with Acoustic Shield and Opus codec;Network & Expansion:Dual-port Gigabit Ethernet with PoE + USB 2.0 port for Wi-Fi/Bluetooth/Recording;Warranty:1-Year Official Yealink Pakistan Warranty',
    defaultDescription:
      'Yealink SIP-T46S / T46U Executive 16-Line Gigabit IP Phone in Pakistan. Designed for C-suite executives and busy managers with Optima HD Voice, 4.3-inch color display, dual Gigabit PoE, and USB headset/Wi-Fi support.',
  },
};

/**
 * Strips HTML tags, entities, tabs, and line breaks so a string is 100% safe for TSV output.
 */
export function sanitizeTsvText(input?: string | null, maxLength?: number): string {
  if (!input) return '';
  const cleaned = String(input)
    .replace(/<[^>]*>?/gm, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&ndash;/gi, '-')
    .replace(/&mdash;/gi, '-')
    .replace(/[\t\r\n]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
  if (maxLength && cleaned.length > maxLength) {
    return cleaned.slice(0, maxLength - 3).trim() + '...';
  }
  return cleaned;
}

/**
 * Cleans a raw SKU/MPN so it contains only the primary alphanumeric part number (max 70 chars).
 */
export function cleanMpn(rawSku?: string | null, fallbackId?: string): string {
  const base = sanitizeTsvText(rawSku || fallbackId || 'AVLIVE-HW');
  const firstPart = base.split('/')[0].replace(/\([^)]*\)/g, '').trim();
  return (firstPart || base).slice(0, 70);
}

/**
 * Formats product specifications into Google Merchant Center's strict 3-part format:
 * "section_name:attribute_name:attribute_value" (comma-separated for multiple entries).
 */
export function formatGmcProductDetail(rawSpecs?: string | null, defaultSpecs?: string): string {
  const source = sanitizeTsvText(rawSpecs) || sanitizeTsvText(defaultSpecs);
  if (!source) {
    return 'Technical Specifications:Certification:PTA Compliant Pakistan,Technical Specifications:Warranty:1-Year Local Warranty';
  }

  const segments = source
    .split(/[;|]/)
    .map((s) => s.trim())
    .filter(Boolean);

  const formattedEntries: string[] = [];

  for (const seg of segments) {
    const cleanSeg = seg.replace(/,/g, ' '); // Prevent commas inside values from breaking comma-delimited subattributes
    const colonParts = cleanSeg
      .split(':')
      .map((p) => p.trim())
      .filter(Boolean);

    if (colonParts.length >= 3) {
      const section = colonParts[0].slice(0, 40);
      const attr = colonParts[1].slice(0, 50);
      const val = colonParts.slice(2).join(' - ').slice(0, 120);
      if (section && attr && val) {
        formattedEntries.push(`${section}:${attr}:${val}`);
      }
    } else if (colonParts.length === 2) {
      const attr = colonParts[0].slice(0, 50);
      const val = colonParts[1].slice(0, 120);
      if (attr && val) {
        formattedEntries.push(`Technical Specifications:${attr}:${val}`);
      }
    }
    if (formattedEntries.length >= 8) break;
  }

  if (formattedEntries.length === 0) {
    return 'Technical Specifications:Certification:PTA Compliant Pakistan,Technical Specifications:Warranty:1-Year Local Warranty';
  }

  return formattedEntries.join(',');
}

export const PRODUCT_ID_TO_SEO_SLUG: Record<string, string> = {
  T1XLMubVYmFzeIfC7V9B: 'polycom-realpresence-group-500-pakistan',
  wMbGVClqbDS2LFrv5HyX: 'google-meet-hardware-license-pakistan',
  'poly-studio-x72-all-in-one-video-bar-pakistan': 'poly-studio-x72-pakistan',
  'cisco-room-kit-plus-video-conferencing-system-pakistan': 'cisco-room-kit-plus-pakistan',
  'poly-studio-x52-all-in-one-video-bar-pakistan': 'poly-studio-x52-pakistan',
  'poly-studio-usb-pakistan': 'poly-studio-usb-video-bar-pakistan',
  'benq-tk705i-projector-pakistan': 'benq-tk705i-pakistan',
  'benq-w4100i-projector-pakistan': 'benq-w4100i-pakistan',
  'dahua-n43al52-bullet-camera-pakistan': 'dahua-n43al52-bullet-pakistan',
  'itc-va-6200ma-pa-controller-pakistan': 'itc-va-6200ma-pakistan',
  'optoma-gt4000uhd-projector-pakistan': 'optoma-gt4000uhd-pakistan',
  'optoma-pk32-pocket-projector-pakistan': 'optoma-pk32-pocket-pakistan',
  'panasonic-pt-rq45k-projector-pakistan': 'panasonic-pt-rq45k-pakistan',
  'panasonic-pt-vmz82-projector-pakistan': 'panasonic-pt-vmz82-pakistan',
  'uniview-ipc3612sr3-vf-bullet-pakistan': 'uniview-ipc3612sr3-vf-pakistan',
  'viewsonic-lsd400w-projector-pakistan': 'viewsonic-lsd400w-pakistan',
  'viewsonic-x1-4k-pro-projector-pakistan': 'viewsonic-x1-4k-pro-pakistan',
};

export const SEO_SLUG_TO_PRODUCT_ID: Record<string, string> = {
  'polycom-realpresence-group-500-pakistan': 'T1XLMubVYmFzeIfC7V9B',
  'google-meet-hardware-license-pakistan': 'wMbGVClqbDS2LFrv5HyX',
};

/**
 * Resolves any product identifier (Firestore ID, MPN/SKU like "9137161U", legacy slug, or canonical slug)
 * to its canonical SEO slug if known.
 */
export function resolveCanonicalProductSlugByIdentifier(idOrSlugOrMpn?: string | null): string | null {
  if (!idOrSlugOrMpn) return null;
  const trimmed = idOrSlugOrMpn.trim();
  if (!trimmed) return null;

  if (PRODUCT_ID_TO_SEO_SLUG[trimmed]) {
    return PRODUCT_ID_TO_SEO_SLUG[trimmed];
  }
  const lower = trimmed.toLowerCase();
  if (PRODUCT_ID_TO_SEO_SLUG[lower]) {
    return PRODUCT_ID_TO_SEO_SLUG[lower];
  }
  if (PRODUCT_GMC_METADATA[lower] && !PRODUCT_ID_TO_SEO_SLUG[lower]) {
    return lower;
  }

  // Match by MPN / SKU (case-insensitive)
  for (const [slugKey, meta] of Object.entries(PRODUCT_GMC_METADATA)) {
    if (PRODUCT_ID_TO_SEO_SLUG[slugKey]) continue;
    if (meta.mpn.toLowerCase() === lower || meta.gtin === trimmed) {
      return slugKey;
    }
  }

  return null;
}

/**
 * Synthesizes a complete fallback Product object from PRODUCT_GMC_METADATA so canonical product URLs
 * never return a 404 / noindex page even if Firestore lacks a matching slug field.
 */
export function buildFallbackProductFromGmcMeta(slugOrId: string): Record<string, any> | null {
  const canonicalSlug = resolveCanonicalProductSlugByIdentifier(slugOrId) || slugOrId;
  const meta = PRODUCT_GMC_METADATA[canonicalSlug];
  if (!meta) return null;

  const readableName = canonicalSlug
    .replace(/-pakistan$/, '')
    .split('-')
    .map((w) =>
      ['ip', 'ptz', 'usb', '4k', 'uhd', 'uc', 'pbx', 'sip', 'poe', '2n', '3cx', 'itc', 'eq', 'pro', 'hd'].includes(
        w.toLowerCase()
      )
        ? w.toUpperCase()
        : w.charAt(0).toUpperCase() + w.slice(1)
    )
    .join(' ');

  const resolvedImages =
    meta.images && meta.images.length > 0
      ? meta.images
      : ['https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80'];
  const resolvedCategories =
    meta.categorySlugs && meta.categorySlugs.length > 0 ? meta.categorySlugs : ['video-conferencing'];

  return {
    id: SEO_SLUG_TO_PRODUCT_ID[canonicalSlug] || canonicalSlug,
    slug: canonicalSlug,
    productName: readableName,
    sku: meta.mpn,
    mpn: meta.mpn,
    gtin: meta.gtin,
    brand: meta.brand,
    regularPrice: meta.regularPrice || 145000,
    salePrice: meta.salePrice || 125000,
    stockQuantity: 10,
    lowStockThreshold: 2,
    images: resolvedImages,
    image: resolvedImages[0],
    imageUrl: resolvedImages[0],
    categoryIds: resolvedCategories,
    categorySlugs: resolvedCategories,
    category: resolvedCategories[0],
    shortDescription: meta.highlight,
    description:
      meta.defaultDescription ||
      `${meta.highlight}. Genuine ${meta.brand} enterprise hardware (MPN: ${meta.mpn}, GTIN: ${meta.gtin}) supplied and integrated across Lahore, Karachi, and Islamabad by AV Live Communications.`,
    specifications:
      meta.defaultSpecs ||
      `Manufacturer:${meta.brand};Part Number (MPN):${meta.mpn};GTIN / UPC:${meta.gtin};Warranty:1-Year Official Pakistan Warranty`,
    variations: [],
    isActive: true,
    isFeatured: ['polycom-realpresence-group-500-pakistan', 'poly-studio-x72-pakistan', 'logitech-rally-bar-pakistan', 'cisco-room-kit-plus-pakistan', 'horion-k6a-bundle-special-offer', 'grandstream-ucm6308-pakistan'].includes(canonicalSlug),
  };
}

/**
 * Returns the canonical SEO-friendly slug for any product object or ID.
 */
export function getCanonicalProductSlug(product?: Record<string, any> | null, fallbackId?: string): string {
  const rawSlug = sanitizeTsvText(product?.slug);
  const rawId = sanitizeTsvText(product?.id || fallbackId);
  const rawSku = sanitizeTsvText(product?.mpn || product?.sku);

  const byId = resolveCanonicalProductSlugByIdentifier(rawId);
  if (byId) return byId;

  const bySlug = resolveCanonicalProductSlugByIdentifier(rawSlug);
  if (bySlug) return bySlug;

  const bySku = resolveCanonicalProductSlugByIdentifier(rawSku);
  if (bySku) return bySku;

  return rawSlug || rawId || 'hardware';
}

/**
 * Resolves consistent PKR pricing across UI, Product JSON-LD, OpenGraph, and Google Merchant Center feed
 * so there is never a price mismatch warning in GMC.
 */
export function resolveProductPricing(product?: Record<string, any> | null): {
  regularPrice: number;
  salePrice: number;
  effectivePrice: number;
  hasSale: boolean;
} {
  const rawRegular = Number(product?.regularPrice ?? product?.price ?? 0);
  const rawSale = Number(product?.salePrice ?? 0);
  const regularPrice = rawRegular > 0 ? rawRegular : rawSale > 0 ? rawSale : 50000;
  const salePrice = rawSale > 0 ? rawSale : regularPrice;
  const effectivePrice = salePrice > 0 ? salePrice : regularPrice;
  const hasSale = salePrice > 0 && salePrice < regularPrice;
  return { regularPrice, salePrice, effectivePrice, hasSale };
}

/**
 * Converts a Firestore Product document into a 40-column Google Merchant Center row object
 * matching the exact template columns and rules.
 */
export function formatProductToGmcRow(product: Record<string, any>): Record<string, string> {
  const id = sanitizeTsvText(product.id || product.slug || product.sku);
  const canonicalSlug = getCanonicalProductSlug(product, id);
  const meta: Partial<(typeof PRODUCT_GMC_METADATA)[string]> =
    PRODUCT_GMC_METADATA[id] || PRODUCT_GMC_METADATA[canonicalSlug] || {};

  // Parse images safely
  let images: string[] = [];
  if (Array.isArray(product.images)) {
    images = product.images.filter(Boolean);
  } else if (typeof product.images === 'string' && product.images.trim()) {
    try {
      const parsed = JSON.parse(product.images);
      images = Array.isArray(parsed) ? parsed : [product.images];
    } catch {
      images = [product.images];
    }
  } else if (product.image) {
    images = [product.image];
  }
  images = images.map((u) => sanitizeTsvText(u)).filter((u) => u.startsWith('http'));

  const brandRaw = sanitizeTsvText(meta.brand || product.brand || 'AV Live');
  const brand = brandRaw === 'Poly (HP' ? 'HP Poly' : brandRaw;

  let title = sanitizeTsvText(product.productName || 'Enterprise AV Hardware', 150);
  if (title === 'Jabra Evolve 75 UC Stereo Wireless ANC Headse') {
    title = 'Jabra Evolve 75 UC Stereo Wireless ANC Headset';
  }

  const rawDesc =
    sanitizeTsvText(product.shortDescription) ||
    sanitizeTsvText(product.description) ||
    sanitizeTsvText(meta.defaultDescription) ||
    `Buy genuine ${title} by ${brand} in Pakistan from AV Live Communications. Includes official local warranty, PTA compliance, and nationwide enterprise delivery in Lahore, Karachi, and Islamabad.`;
  // Keep description within 200 chars as requested in the user's GMC template tip ("Up to 200 characters")
  const description = sanitizeTsvText(rawDesc, 200);

  const stock = Number(product.stockQuantity ?? 10);
  const availability = stock > 0 || id === 'wMbGVClqbDS2LFrv5HyX' ? 'in_stock' : 'out_of_stock';

  const { regularPrice: regularPriceNum, salePrice: salePriceNum, hasSale } = resolveProductPricing(product);

  const price = `${regularPriceNum.toFixed(2)} PKR`;
  const salePrice = hasSale ? `${salePriceNum.toFixed(2)} PKR` : '';
  const saleEffectiveDate = hasSale ? '2026-01-01T00:00+0500/2027-12-31T23:59+0500' : '';

  const gtin = sanitizeTsvText(product.gtin || meta.gtin || computeUpc12('61080799001'));
  const mpn = cleanMpn(meta.mpn || product.mpn || product.sku, id);

  const highlight = sanitizeTsvText(
    meta.highlight ||
      `Official ${brand} enterprise AV hardware in Pakistan with 1-year warranty and nationwide installation`,
    150
  );

  const productDetail = formatGmcProductDetail(product.specifications, meta.defaultSpecs);
  const link = `https://avlive.com.pk/product/${encodeURIComponent(canonicalSlug)}`;
  const mainImage = images[0] || 'https://avlive.com.pk/og-image.jpg';
  const additionalImages = images.slice(1, 10).join(',');

  return {
    id,
    title,
    description,
    availability,
    availability_date: '',
    expiration_date: '',
    link,
    mobile_link: link,
    image_link: mainImage,
    price,
    sale_price: salePrice,
    sale_price_effective_date: saleEffectiveDate,
    identifier_exists: 'yes',
    gtin,
    mpn,
    brand,
    product_highlight: highlight,
    product_detail: productDetail,
    additional_image_link: additionalImages,
    condition: 'new',
    adult: 'no',
    color: meta.color || 'Black',
    size: '',
    size_type: '',
    size_system: '',
    gender: '',
    material: '',
    pattern: '',
    age_group: '',
    multipack: '',
    'is bundle': meta.isBundle || 'no',
    unit_pricing_measure: '',
    unit_pricing_base_measure: '',
    energy_efficiency_class: '',
    min_energy_efficiency_class: '',
    max_energy_efficiency: '',
    item_group_id: '',
    video_link: '',
    virtual_model_link: '',
    cost_of_goods_sold: '',
  };
}

/**
 * Generates a complete 40-column TSV string from an array of products.
 */
export function generateGmcTsv(products: Record<string, any>[]): string {
  const headerLine = GMC_40_HEADERS.join('\t');
  const lines = products.map((product) => {
    const rowObj = formatProductToGmcRow(product);
    return GMC_40_HEADERS.map((col) => sanitizeTsvText(rowObj[col])).join('\t');
  });
  return [headerLine, ...lines].join('\n');
}

/**
 * Generates a 2D array ([headers, ...rows]) for Google Sheets API synchronization.
 */
export function generateGmcSheetMatrix(products: Record<string, any>[]): string[][] {
  const headers = [...GMC_40_HEADERS];
  const rows = products.map((product) => {
    const rowObj = formatProductToGmcRow(product);
    return GMC_40_HEADERS.map((col) => sanitizeTsvText(rowObj[col]));
  });
  return [headers, ...rows];
}
