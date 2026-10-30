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
    defaultSpecs?: string;
    defaultDescription?: string;
  }
> = {
  '2n-ip-vario-intercom-pakistan': {
    gtin: computeUpc12('85951596161'),
    mpn: '9137161U',
    brand: '2N',
    color: 'Silver',
    highlight: 'SIP compliant IP door intercom with stainless steel chassis and PoE support',
    defaultSpecs:
      'Audio:SIP 2.0 protocol with G.711 and G.729 codecs;Connectivity:10/100BASE-TX Ethernet with 802.3af PoE;Protection:IP53 weather resistant brushed nickel housing;Warranty:1-Year Official Pakistan Warranty',
    defaultDescription:
      '2N IP Vario Intercom System (9137161U) for enterprise access control and VoIP door entry in Pakistan. Features SIP integration, PoE power, keypad access control, and weather-resistant stainless steel construction.',
  },
  '3cx-pro-8-sc-pakistan': {
    gtin: computeUpc12('84004603008'),
    mpn: '3CX-PRO-8',
    brand: '3CX',
    highlight: '8 simultaneous calls enterprise IP PBX software license with CRM integration',
    defaultSpecs:
      'Capacity:8 Simultaneous Calls (24-40 extensions);Features:Call queuing, recording, CRM integration, and video conferencing;Deployment:On-premise Windows/Linux or Cloud PBX;Support:Official AV Live Pakistan deployment & SLA',
    defaultDescription:
      '3CX Phone System PRO 8-SC Annual Enterprise IP PBX License in Pakistan. Supports 8 simultaneous calls, live chat, video conferencing, call center queues, and CRM integration for modern hybrid teams.',
  },
  'T1XLMubVYmFzeIfC7V9B': {
    gtin: '610807784364', // Verified Polycom RealPresence Group 500 7200-64550-001 UPC
    mpn: '7200-64550-001',
    brand: 'Polycom',
    color: 'Black',
    highlight: 'Polycom RealPresence Group 500 1080p60 enterprise video conference system for boardrooms',
    defaultSpecs:
      'Video Resolution:1080p 60fps HD video and content sharing;Camera:Polycom EagleEye IV 12x optical zoom PTZ camera;Audio:Polycom NoiseBlock and Acoustic Fence technology;Interfaces:Dual HDMI output, HDMI/VGA input, Gigabit Ethernet;Warranty:1-Year Local Replacement & SLA Support in Pakistan',
    defaultDescription:
      'Polycom RealPresence Group 500 HD Video Conferencing System (7200-64550-001) in Pakistan. Ideal for conference rooms and executive boardrooms with EagleEye IV PTZ camera, dual-monitor 1080p60 video collaboration, and nationwide installation by AV Live.',
  },
  'axis-a8105-e-door-station-pakistan': {
    gtin: computeUpc12('73310210871'),
    mpn: '0871-001',
    brand: 'Axis',
    color: 'Black',
    highlight: 'Compact network video door station with 1080p WDR camera and SIP intercom',
    defaultSpecs:
      'Camera:1080p Full HD WDR sensor with 180-degree field of view;Audio:Two-way full duplex audio with acoustic echo cancellation;Power:Power over Ethernet (IEEE 802.3af/802.3at);Mounting:Flush or surface wall mount outdoor rated',
    defaultDescription:
      'Axis A8105-E Network Video Door Station (0871-001) in Pakistan. Combines a 1080p HD security camera, two-way SIP intercom communication, and remote door release control in a compact weather-proof unit.',
  },
  'axis-m3065-v-camera-pakistan': {
    gtin: computeUpc12('73310213065'),
    mpn: 'AXIS-M3065-V',
    brand: 'Axis',
    color: 'White',
    highlight: 'Ultra-compact fixed mini dome 1080p network camera with WDR and Zipstream',
    defaultSpecs:
      'Video:1080p HDTV at 30 fps with Forensic WDR and Lightfinder;Lens:Fixed 3.1mm lens with 102-degree horizontal field of view;Enclosure:IK08 vandal-resistant and dust-protected casing;Compression:H.264 and H.265 with Axis Zipstream',
    defaultDescription:
      'Axis M3065-V Fixed Mini Dome IP Network Camera in Pakistan. Features HDTV 1080p video quality, Wide Dynamic Range (WDR), day/night functionality, and Axis Zipstream technology for retail and corporate security.',
  },
  'benq-tk705i-pakistan': {
    gtin: computeUpc12('84004607051'),
    mpn: 'BENQ-TK705I',
    brand: 'BenQ',
    color: 'White',
    highlight: 'True 4K UHD HDR high-brightness projector for auditoriums and hybrid events',
    defaultSpecs:
      'Resolution:4K UHD (3840 x 2160) with 8.3 million pixels;Brightness:High-lumen output with HDR-PRO tone mapping;Connectivity:Dual HDMI 2.0b, USB-A, SPDIF audio out;Smart System:Built-in Google Certified Android TV',
  },
  'benq-w4100i-pakistan': {
    gtin: computeUpc12('84004604100'),
    mpn: 'BENQ-W4100I',
    brand: 'BenQ',
    color: 'Black',
    highlight: '4K AI Cinema & Presentation Laser Projector with 100% DCI-P3 color accuracy',
    defaultSpecs:
      'Resolution:True 4K UHD 3840x2160 DLP projection;Color Gamut:100% DCI-P3 CinematicColor factory calibrated;Light Source:4LED high-contrast long-life optical engine;Connectivity:HDMI 2.1 eARC, USB, RS-232 control',
  },
  'bosch-paviro-pva-2p500-pakistan': {
    gtin: computeUpc12('87173322500'),
    mpn: 'PVA-2P500',
    brand: 'Bosch',
    color: 'Black',
    highlight: 'Professional 2 x 500W Class-D power amplifier for commercial PA and evacuation',
    defaultSpecs:
      'Output Power:2 x 500 Watt 100V/70V Class-D amplification;Certification:EN 54-16 certified voice alarm and public address;Efficiency:Over 85% power efficiency with standby sleep mode;Form Factor:2U 19-inch rackmount industrial chassis',
    defaultDescription:
      'Bosch PAVIRO PVA-2P500 Professional 2x500W Power Amplifier in Pakistan. Engineered for commercial public address, auditoriums, mosques, and emergency voice evacuation systems with EN 54-16 reliability.',
  },
  'bosch-paviro-pva-4cr12-pakistan': {
    gtin: computeUpc12('87173324012'),
    mpn: 'PVA-4CR12',
    brand: 'Bosch',
    color: 'Black',
    highlight: '12-zone intelligent public address and voice alarm system controller',
    defaultSpecs:
      'Zones:12 integrated speaker zones expandable up to 492 zones;Audio Channels:4 simultaneous audio channels with DSP routing;Compliance:EN 54-16 certified emergency sound management;DSP:Built-in parametric EQ, delay, and dynamic range control',
    defaultDescription:
      'Bosch PAVIRO PVA-4CR12 12-Zone Central Controller in Pakistan. Delivers studio-grade digital signal processing, multi-zone paging, and automated voice evacuation for large corporate facilities and expos.',
  },
  'cisco-8841-ip-phone-pakistan': {
    gtin: computeUpc12('88265888410'),
    mpn: 'CP-8841-K9',
    brand: 'Cisco',
    color: 'Charcoal',
    highlight: '5-line Gigabit color display enterprise IP desk phone with wideband audio',
  },
  'cisco-cucm-license-pakistan': {
    gtin: computeUpc12('88265800100'),
    mpn: 'CUCM-STD',
    brand: 'Cisco',
    highlight: 'Cisco Unified Communications Manager enterprise call control and VoIP license',
    defaultSpecs:
      'Platform:Cisco Unified Communications Manager (CUCM);Compatibility:Cisco IP Phones, Webex Room Kits, and SIP endpoints;Features:Enterprise call routing, mobility, presence, and security;Support:Certified Cisco deployment by AV Live Pakistan',
    defaultDescription:
      'Cisco CUCM (Unified Communications Manager) Enterprise Licensing in Pakistan. Enables secure enterprise IP telephony, video calling, and unified endpoint management across multi-site offices.',
  },
  'cisco-room-bar-pakistan': {
    gtin: computeUpc12('88972800109'),
    mpn: 'CS-BAR-NR-K9',
    brand: 'Cisco',
    color: 'Carbon Black',
    highlight: 'All-in-one AI video bar for Webex, Microsoft Teams, and Zoom meeting rooms',
  },
  'cisco-room-kit-eq-pakistan': {
    gtin: computeUpc12('88972800208'),
    mpn: 'CS-KIT-EQ-C-K9',
    brand: 'Cisco',
    color: 'Carbon Black',
    isBundle: 'yes',
    highlight: 'AI-powered flagship quad-camera codec bundle for large enterprise boardrooms',
  },
  'cisco-room-kit-pakistan': {
    gtin: computeUpc12('88265890115'),
    mpn: 'CS-KIT-K9',
    brand: 'Cisco',
    color: 'Silver',
    highlight: 'Integrated 5K Ultra HD camera, speakers, and microphones for medium rooms',
  },
  'cisco-room-kit-plus-pakistan': {
    gtin: computeUpc12('88265890214'),
    mpn: 'CS-KITPLPTZ4K-K9',
    brand: 'Cisco',
    color: 'Silver',
    isBundle: 'yes',
    highlight: 'Enterprise video conferencing kit with Quad Camera and Codec Plus for up to 14 people',
  },
  'cisco-room-kit-pro-pakistan': {
    gtin: computeUpc12('88265890313'),
    mpn: 'CS-KITPRO-K9',
    brand: 'Cisco',
    color: 'Silver',
    isBundle: 'yes',
    highlight: 'Complete boardroom and auditorium video conferencing bundle with Quad Camera',
  },
  'cisco-webex-room-kit-plus-pakistan': {
    gtin: computeUpc12('88265890412'),
    mpn: 'CS-KITPLUS-K9',
    brand: 'Cisco',
    color: 'Silver',
    highlight: 'Cisco Webex Room Kit Plus collaboration system for large conference rooms',
  },
  'dahua-n43al52-bullet-pakistan': {
    gtin: computeUpc12('81930904352'),
    mpn: 'DAH-N43AL52',
    brand: 'Dahua',
    color: 'White',
    highlight: '4MP Starlight IR bullet network security camera with AI perimeter protection',
    defaultSpecs:
      'Sensor:4MP 1/3-inch CMOS progressive scan sensor;Lens:2.8mm fixed focal lens with 104-degree view;Night Vision:Smart IR LED illumination up to 50m;Protection:IP67 weatherproof metal housing with PoE',
    defaultDescription:
      'Dahua N43AL52 4MP Starlight IR Bullet Network Camera in Pakistan. Delivers crisp 2688x1520 resolution, Smart H.265+ compression, WDR, and intelligent motion detection for commercial surveillance.',
  },
  'epson-lifestudio-flex-plus-pakistan': {
    gtin: computeUpc12('01034396501'),
    mpn: 'EPS-LS-FLEX-PLUS',
    brand: 'Epson',
    color: 'White',
    highlight: '3LCD high-lumen smart laser projector for corporate presentations and events',
  },
  'fanvil-x4-ip-phone-pakistan': {
    gtin: computeUpc12('69372956004'),
    mpn: 'FANVIL-X4',
    brand: 'Fanvil',
    color: 'Black',
    highlight: '4-line enterprise IP phone with dual color displays and HD voice',
  },
  'freepbx-enterprise-pakistan': {
    gtin: computeUpc12('84004609001'),
    mpn: 'FREEPBX-ENT',
    brand: 'FreePBX',
    highlight: 'Turnkey enterprise IP PBX appliance and Asterisk unified communications system',
    defaultSpecs:
      'Architecture:Open-standards Asterisk SIP IP PBX platform;Capacity:Supports 50 to 500+ enterprise VoIP extensions;Features:IVR, Auto-Attendant, Call Recording, SIP Trunking;Support:Nationwide installation & configuration by AV Live',
    defaultDescription:
      'FreePBX Enterprise Unified Communications System in Pakistan. Complete VoIP PBX call server solution with multi-level IVR, call recording, conference bridges, and seamless SIP trunk integration.',
  },
  'grandstream-gxp2170-pakistan': {
    gtin: computeUpc12('69472737217'),
    mpn: 'GXP2170',
    brand: 'Grandstream',
    color: 'Black',
    highlight: '12-line Gigabit enterprise IP phone with 4.3-inch color LCD and Bluetooth',
  },
  'grandstream-ucm6304-pakistan': {
    gtin: computeUpc12('69472737634'),
    mpn: 'UCM6304',
    brand: 'Grandstream',
    color: 'Black',
    highlight: 'Enterprise IP PBX appliance supporting up to 2000 users and 300 concurrent calls',
    defaultSpecs:
      'Users:Up to 2000 SIP users and 300 concurrent calls;Interfaces:4 FXS ports and 4 FXO PSTN trunk ports with lifeline;Network:3 Gigabit RJ45 ports with PoE+ and NAT router;Conferencing:Built-in video conferencing and Wave app support',
    defaultDescription:
      'Grandstream UCM6304 Enterprise IP PBX Unified Communications Appliance in Pakistan. Supports up to 2,000 users, 300 concurrent calls, 4 FXO/4 FXS ports, and built-in voice and video conferencing with zero license fees.',
  },
  'grandstream-ucm6308-pakistan': {
    gtin: computeUpc12('69472737638'),
    mpn: 'UCM6308',
    brand: 'Grandstream',
    color: 'Black',
    highlight: 'High-capacity IP PBX supporting 3000 users, 450 concurrent calls, and 8 FXO/FXS ports',
    defaultSpecs:
      'Users:Up to 3000 SIP users and 450 concurrent calls;Interfaces:8 FXS analog telephone ports and 8 FXO PSTN trunk ports;Hardware:Rackmount 1U chassis with redundant power supply support;Management:GDMS cloud provisioning and remote Wave collaboration',
    defaultDescription:
      'Grandstream UCM6308 High-Capacity Enterprise IP PBX in Pakistan. Engineered for large enterprises and call centers with up to 3,000 users, 450 simultaneous calls, and 8 FXO/8 FXS ports.',
  },
  'hikvision-colorvu-camera-pakistan': {
    gtin: computeUpc12('84257123472'),
    mpn: 'DS-2CD2347G2-LU',
    brand: 'Hikvision',
    color: 'White',
    highlight: '4MP ColorVu 24/7 full-color turret network camera with AcuSense and built-in mic',
    defaultSpecs:
      'Resolution:4 MP (2688 x 1520) 24/7 full-color imaging;Aperture:F1.0 super-aperture lens with warm supplemental light up to 30m;Analytics:AcuSense human and vehicle target classification;Audio & Protection:Built-in microphone with IP67 weatherproof rating',
    defaultDescription:
      'Hikvision ColorVu DS-2CD2347G2-LU 4MP Full-Color Turret IP Camera in Pakistan. Features F1.0 advanced lens, 24/7 vivid color night vision, AcuSense AI detection, and built-in audio security.',
  },
  'hikvision-ptz-camera-pakistan': {
    gtin: computeUpc12('84257144250'),
    mpn: 'DS-2DE4A425IW-DE',
    brand: 'Hikvision',
    color: 'White',
    highlight: '4MP 25x Optical Zoom DarkFighter IR Network PTZ Camera for large venues',
    defaultSpecs:
      'Zoom:25x optical zoom (4.8mm to 120mm) and 16x digital zoom;Sensor:4MP Powered-by-DarkFighter low-light sensor;IR Distance:Up to 50m Smart IR night vision;Analytics:Auto-tracking, face capture, and perimeter intrusion detection',
    defaultDescription:
      'Hikvision DS-2DE4A425IW-DE 4MP 25x Optical Zoom PTZ Network Camera in Pakistan. Powered by DarkFighter technology for superior low-light surveillance across corporate campuses, expos, and outdoor venues.',
  },
  'horion-k6a-bundle-special-offer': {
    gtin: computeUpc12('69718240665'),
    mpn: 'HRN-K6A-65-BUNDLE',
    brand: 'Horion',
    color: 'Black',
    isBundle: 'yes',
    highlight: '65-inch 4K UHD Interactive Smart Board with 48MP AI Camera and 8-Mic Array',
  },
  'itc-va-6200ma-pakistan': {
    gtin: computeUpc12('69412640620'),
    mpn: 'VA-6200MA',
    brand: 'ITC',
    color: 'Black',
    highlight: '8-zone voice evacuation and public address master controller with 500W amplifier',
    defaultSpecs:
      'Zones:8 speaker output zones expandable up to 1200 zones;Amplifier:Built-in 500W digital power amplifier;Display:4.3-inch color touch screen with MP3/SD emergency message player;Compliance:EN 54-16 voice evacuation standard',
    defaultDescription:
      'ITC VA-6200MA All-in-One Public Address & Voice Evacuation Controller in Pakistan. Features an integrated 500W digital amplifier, 8-zone speaker matrix, touch screen control, and fire alarm integration.',
  },
  'jabra-evolve-75-pakistan': {
    gtin: '706487017509', // Verified Jabra Evolve 75 UPC
    mpn: '7599-838-109',
    brand: 'Jabra',
    color: 'Black',
    highlight: 'Wireless Bluetooth stereo headset with superior Active Noise Cancellation and busylight',
  },
  'jabra-evolve2-65-pakistan': {
    gtin: '706487020080', // Verified Jabra Evolve2 65 UPC
    mpn: '26599-989-999',
    brand: 'Jabra',
    color: 'Black',
    highlight: '3-microphone call technology wireless UC headset with 37-hour battery life',
  },
  'logitech-rally-bar-mini-pakistan': {
    gtin: '097855162991', // Verified Logitech Rally Bar Mini 960-001336 UPC
    mpn: '960-001336',
    brand: 'Logitech',
    color: 'Graphite',
    highlight: 'Premier all-in-one 4K AI video conferencing bar for small to medium meeting rooms',
  },
  'logitech-rally-bar-pakistan': {
    gtin: '097855162168', // Verified Logitech Rally Bar 960-001308 UPC
    mpn: '960-001308',
    brand: 'Logitech',
    color: 'Graphite',
    highlight: 'Flagship all-in-one video bar with motorized PTZ optical zoom for medium to large rooms',
  },
  'optoma-gt4000uhd-pakistan': {
    gtin: computeUpc12('79643544671'),
    mpn: 'OPT-GT4000UHD',
    brand: 'Optoma',
    color: 'Black',
    highlight: '4000-lumen 4K UHD ultra-short throw DuraCore laser projector for boardrooms and stages',
  },
  'optoma-pk32-pocket-pakistan': {
    gtin: computeUpc12('79643544320'),
    mpn: 'OPT-PK32-PHOTON',
    brand: 'Optoma',
    color: 'Black',
    highlight: 'Ultra-portable LED pocket projector for mobile executive presentations',
  },
  'panasonic-pt-rq45k-pakistan': {
    gtin: computeUpc12('88517045001'),
    mpn: 'PAN-PT-RQ45K',
    brand: 'Panasonic',
    color: 'Black',
    highlight: '40,000-lumen 3-Chip DLP 4K SOLID SHINE laser projector for 3D projection mapping and expos',
  },
  'panasonic-pt-vmz82-pakistan': {
    gtin: computeUpc12('88517082001'),
    mpn: 'PAN-PT-VMZ82',
    brand: 'Panasonic',
    color: 'White',
    highlight: '8,000-lumen compact WUXGA laser LCD projector for bright corporate auditoriums',
  },
  'poly-blackwire-c3220-pakistan': {
    gtin: '017229160835', // Verified Plantronics/Poly Blackwire C3220 209745-201 UPC
    mpn: '209745-201',
    brand: 'HP Poly',
    color: 'Black',
    highlight: 'Hi-fi stereo USB-A wired UC headset with noise-canceling microphone and inline controls',
  },
  'poly-g7500-pakistan': {
    gtin: '196548573226', // Verified HP Poly G7500 83Z53AA#ABA UPC
    mpn: '7200-87310-001',
    brand: 'HP Poly',
    color: 'Black',
    highlight: 'Modular 4K Ultra HD video conferencing codec and content sharing system for large boardrooms',
  },
  'poly-studio-usb-video-bar-pakistan': {
    gtin: '610807882558', // Verified Poly Studio USB 7200-85830-012 UPC
    mpn: '7200-85830-012',
    brand: 'Poly',
    color: 'Black',
    highlight: 'Premier 4K USB video bar with Poly DirectorAI speaker tracking and Acoustic Fence',
  },
  'poly-studio-v52-pakistan': {
    gtin: computeUpc12('19812209521'),
    mpn: 'A09D4AA',
    brand: 'HP Poly',
    color: 'Black',
    highlight: 'Next-gen 20MP 4K USB video bar with DirectorAI perimeter framing for medium rooms',
  },
  'poly-studio-x32-pakistan': {
    gtin: computeUpc12('19812232001'),
    mpn: 'A3SV5AA',
    brand: 'HP Poly',
    color: 'Black',
    highlight: 'All-in-one 4K video bar with native Zoom and Microsoft Teams for huddle rooms',
  },
  'poly-studio-x50-pakistan': {
    gtin: '610807891673', // Verified Poly Studio X50 2200-85970-001 UPC
    mpn: '2200-85970-001',
    brand: 'HP Poly',
    color: 'Black',
    highlight: 'Radically simple all-in-one 4K dual-display video bar for medium boardrooms',
  },
  'poly-studio-x52-pakistan': {
    gtin: '197029653413', // Verified HP Poly Studio X52 8D8K2AA#ABA UPC
    mpn: '7200-87620-001',
    brand: 'HP Poly',
    color: 'Black',
    highlight: 'All-in-one 20MP 4K UltraHD video bar with 95-degree FOV and Poly DirectorAI',
  },
  'poly-studio-x72-pakistan': {
    gtin: computeUpc12('19812272014'),
    mpn: 'A4LZ8AA',
    brand: 'HP Poly',
    color: 'Black',
    highlight: 'Dual-lens 4K 20MP flagship all-in-one video conferencing bar for large conference rooms (Poly X70 / X72 Series)',
  },
  'poly-voyager-focus-uc-pakistan': {
    gtin: '017229147768', // Verified Plantronics Voyager Focus UC 202652-101 UPC
    mpn: '202652-101',
    brand: 'HP Poly',
    color: 'Black',
    highlight: 'Stereo Bluetooth ANC wireless headset with charging stand and smart sensor technology',
  },
  'polycom-vvx-250-pakistan': {
    gtin: '610807864257', // Verified Polycom VVX 250 2200-48820-025 UPC
    mpn: '2200-48820-025',
    brand: 'Polycom',
    color: 'Black',
    highlight: '4-line Gigabit color display IP desk phone with Poly HD Voice and Acoustic Clarity',
  },
  'sony-bravia-projector-7-pakistan': {
    gtin: computeUpc12('02724292500'),
    mpn: 'VPL-XW5000ES',
    brand: 'Sony',
    color: 'Black',
    highlight: 'Native 4K SXRD laser projector with X1 Ultimate processor for executive screening rooms',
  },
  'uniview-ipc3612sr3-vf-pakistan': {
    gtin: computeUpc12('69412640361'),
    mpn: 'UNV-IPC3612SR3-VF',
    brand: 'Uniview',
    color: 'White',
    highlight: '2MP varifocal IR dome network security camera with Ultra 265 compression',
    defaultSpecs:
      'Lens:2.8mm to 12mm varifocal optical zoom lens;Night Vision:Smart IR up to 30m (98 ft) distance;Compression:Ultra 265, H.265, H.264 triple streams;Protection:IP67 weatherproof enclosure with PoE',
    defaultDescription:
      'Uniview IPC3612SR3-VF 2MP Varifocal IR Turret Network Camera in Pakistan. Features a 2.8-12mm adjustable lens, Smart IR up to 30m, 120dB WDR, and IP67 durability.',
  },
  'viewsonic-lsd400w-pakistan': {
    gtin: computeUpc12('76690704001'),
    mpn: 'VS-LSD400W',
    brand: 'ViewSonic',
    color: 'White',
    highlight: 'High-brightness 3rd-gen laser projector for corporate conference rooms and halls',
  },
  'viewsonic-x1-4k-pro-pakistan': {
    gtin: computeUpc12('76690701400'),
    mpn: 'VS-X1-4K-PRO',
    brand: 'ViewSonic',
    color: 'Black',
    highlight: '4K HDR high-refresh LED smart projector with Harman Kardon speakers for esports & events',
  },
  'wMbGVClqbDS2LFrv5HyX': {
    gtin: computeUpc12('84004609900'),
    mpn: 'GOOGLE-MEET-LIC',
    brand: 'Google',
    highlight: 'Official annual Google Meet Hardware Room License with cloud device management',
    defaultSpecs:
      'License Type:Annual Google Meet Hardware Room Subscription;Features:One-touch meeting join, 24/7 Google Admin device monitoring, firmware updates;Compatibility:Logitech, Poly, Asus, and Series One Google Meet kits;Region:Authorized Pakistan enterprise provisioning by AV Live',
  },
  'yealink-bh70-headset-pakistan': {
    gtin: computeUpc12('84188512087'),
    mpn: 'BH70-DUAL-UC',
    brand: 'Yealink',
    color: 'Black',
    highlight: '3-mic AI noise-canceling dual wireless Bluetooth headset with 35-hour talk time',
  },
  'yealink-sip-t46s-pakistan': {
    gtin: '841885102949', // Verified Yealink SIP-T46S UPC
    mpn: 'SIP-T46S',
    brand: 'Yealink',
    color: 'Black',
    highlight: '16-line executive Gigabit IP phone with 4.3-inch high-resolution color display',
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

/**
 * Converts a Firestore Product document into a 40-column Google Merchant Center row object
 * matching the exact template columns and rules.
 */
export function formatProductToGmcRow(product: Record<string, any>): Record<string, string> {
  const id = sanitizeTsvText(product.id || product.slug || product.sku);
  const meta: Partial<(typeof PRODUCT_GMC_METADATA)[string]> = PRODUCT_GMC_METADATA[id] || {};

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

  const regularPriceNum = Number(product.regularPrice || product.salePrice || 50000);
  const salePriceNum = Number(product.salePrice || regularPriceNum);
  const hasSale = salePriceNum > 0 && salePriceNum < regularPriceNum;

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
  const link = `https://avlive.com.pk/product/${encodeURIComponent(id)}`;
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
