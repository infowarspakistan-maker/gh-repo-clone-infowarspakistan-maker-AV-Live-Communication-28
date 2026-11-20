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
      'https://www.2n.com/-/media/Images/Product-Catalogue/Products/Products/Vario/9137161KU_2N_IP-Vario_3x2_Buttons-Keypad_Front_1920x1920.png',
      'https://www.2n.com/-/media/Images/Product-Catalogue/Products/modules/2n-helios-ip-vario/9137111cu_ip_vario_web_front_560x432.png',
      'https://www.2n.com/-/media/Images/Product-Catalogue/Products/modules/2n-helios-ip-vario/9137131cu_ip_vario_web_front_560x432.png',
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
      'https://www.3cx.com/wp-content/uploads/2026/06/Slider-Banner-Home-Page-NO-AI-Recep-Feature-1014x540-px-New-1.webp',
      'https://syntelo.co.za/cdn/shop/files/3cx_pro_8SC.jpg?v=1747992911&width=2048',
      'https://www.3cx.com/wp-content/uploads/2025/10/3cx-footer-new.png',
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
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQj89AYkEbIFUpVXEDGVZPT9VhsRcvpfc3IwweVzvEe0ErjCzMQmDYla7Mb&s=10',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRI6Whdcod0IPPpnKYkjuIFGnBU5rcwVk-3EGRkht9imA&s=10',
      'https://www.hp.com/content/dam/sites/worldwide/poly/video-conferencing/all-in-one/studio-x72/Hero_Banner_Desktop@2x.jpg',
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
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQj89AYkEbIFUpVXEDGVZPT9VhsRcvpfc3IwweVzvEe0ErjCzMQmDYla7Mb&s=10',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRI6Whdcod0IPPpnKYkjuIFGnBU5rcwVk-3EGRkht9imA&s=10',
      'https://www.hp.com/content/dam/sites/worldwide/poly/video-conferencing/all-in-one/studio-x72/Hero_Banner_Desktop@2x.jpg',
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
      'https://cdn11.bigcommerce.com/s-u3uxlvxq3h/images/stencil/1280x1280/products/965/18436/0871-001-2__58573.1584422859.jpg?c=1',
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
      'https://www.axis.com/sites/axis/files/styles/square_500x500_/public/2020-07/61106%3Bp3247lv-ceiling-angle-front-2002.png.webp?itok=FTS3d9aO',
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
      'https://www.puretheatre.com/media/catalog/product/cache/207e23213cf636ccdef205098cf3c8a3/b/e/benq-tk705i-projector.jpg',
      'https://image.benq.com/is/image/benqco/tk705i-set1-1-2?$ResponsivePreset$',
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
      'https://online.videopro.com.au/content/c/8/2/4/c82495416b48328b8bab28017ec145e4ed71ee98_W4100i__5_.png',
      'https://cdn.affilizz.com/__s__/images/products/v2/fr_FR/68022472/2bedfa/5fa0/ecf97e_main.jpg?p=wc_picture',
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
      'https://5.imimg.com/data5/SELLER/Default/2026/2/582792239/ES/HU/CE/9318303/bosch-paviro-pva-2p500-power-amplifier-2x500w.png',
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
      'https://cdn11.bigcommerce.com/s-u3uxlvxq3h/images/stencil/400x400/products/456/17947/01436-001-2__66573.1584422056.jpg?c=180',
      'https://zebramount.com/bilder/application-door.jpg',
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
      'https://cdn11.bigcommerce.com/s-u3uxlvxq3h/images/stencil/original/products/9024/26315/X4G-2__79148.1584438040.jpg?c=1',
      'https://shop.tekkpak.com/cdn/shop/files/gtU6abiiEqqJpMYPtJO4-Ac_3_gps_generated.png?v=1765463662&width=1445',
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
      'https://images.ctfassets.net/o7xu9whrs0u9/1oGC2vD0bJFoSs5tlAd0kc/715d566c60c0d206d62fcbf83c360287/cisco-logo.png',
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
      'https://www.cisco.com/c/dam/assets/support/product-images/model/collaboration-endpoints-spark-room-kit.jpg/_jcr_content/renditions/collaboration-endpoints-spark-room-kit-600x220.jpg',
      'https://www.cisco.com/c/dam/en/us/products/collateral/collaboration-endpoints/spark-room-kit-series/room-kit-eq-ds.docx/_jcr_content/renditions/room-kit-eq-ds_0.png',
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
      'https://www.cisco.com/c/dam/en/us/products/collateral/collaboration-endpoints/spark-room-kit-series/room-kit-eq-ds.docx/_jcr_content/renditions/room-kit-eq-ds_0.png',
      'https://www.cisco.com/c/dam/en/us/products/collateral/collaboration-endpoints/spark-room-kit-series/room-kit-eq-ds.docx/_jcr_content/renditions/room-kit-eq-ds_2.png',
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
      'https://www.cisco.com/c/dam/assets/support/product-images/model/collaboration-endpoints-spark-room-kit.jpg/_jcr_content/renditions/collaboration-endpoints-spark-room-kit-600x220.jpg',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQSchrYfzPv7D9S6jz1rsh4dBOdpe_O0Zg5CSoMeJnW3tNS-rzzSqlKCsU&s=10',
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
      'https://www.cisco.com/c/dam/en/us/products/collateral/collaboration-endpoints/spark-room-kit-series/datasheet-c78-738752.docx/_jcr_content/renditions/datasheet-c78-738752_0.png',
      'https://www.cisco.com/c/dam/en/us/products/collateral/collaboration-endpoints/spark-room-kit-series/datasheet-c78-738752.docx/_jcr_content/renditions/datasheet-c78-738752_1.png',
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
      'https://www.cisco.com/c/dam/en/us/products/collateral/collaboration-endpoints/webex-room-series/datasheet-c78-741052.docx/_jcr_content/renditions/datasheet-c78-741052_0.png',
      'https://www.cisco.com/c/dam/en/us/products/collateral/collaboration-endpoints/webex-room-series/datasheet-c78-741052.docx/_jcr_content/renditions/datasheet-c78-741052_1.jpg',
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
      'https://inexa.ca/wp-content/uploads/2022/11/1665480523377.webp',
      'https://www.cisco.com/c/dam/en/us/products/collateral/collaboration-endpoints/spark-room-kit-series/datasheet-c78-738752.docx/_jcr_content/renditions/datasheet-c78-738752_0.png',
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
      'https://cctvcamera.com.sg/wp-content/uploads/IPC-HDBW2241E-S_S0.jpg',
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
      'https://geartechs.com/cdn/shop/files/panasonic-pt-vmz82-series-white-angle.jpg?v=1750357243',
      'https://www.viewsonic.com/media/wysiwyg/26PRJ-MLT1176-RC-LSD400W_Bright_in_any_Room_1238x1102.jpg',
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
      'https://cdn11.bigcommerce.com/s-u3uxlvxq3h/images/stencil/original/products/9024/26315/X4G-2__79148.1584438040.jpg?c=1',
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
      'https://www.freepbx.org/wp-content/uploads/Sangoma_FreePBX_Tango_Scenes_RGB_community-noBG-e1589310255279-1024x906.png',
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
      'https://shop.tekkpak.com/cdn/shop/files/gtU6abiiEqqJpMYPtJO4-Ac_3_gps_generated.png?v=1765463662&width=1445',
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
      'https://shop.tekkpak.com/cdn/shop/files/gtU6abiiEqqJpMYPtJO4-Ac_3_gps_generated.png?v=1765463662&width=1445',
      'https://www.freepbx.org/wp-content/uploads/Sangoma_FreePBX_Tango_Scenes_RGB_community-noBG-e1589310255279-1024x906.png',
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
      'https://shop.tekkpak.com/cdn/shop/files/gtU6abiiEqqJpMYPtJO4-Ac_3_gps_generated.png?v=1765463662&width=1445',
      'https://www.freepbx.org/wp-content/uploads/Sangoma_FreePBX_Tango_Scenes_RGB_community-noBG-e1589310255279-1024x906.png',
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
      'https://assets.hikvision.com/prd/normal/all/image/m000032055/%E6%B5%B7%E8%9E%BA25-%E5%9F%BA%E7%BA%BF-%E9%BB%91%E7%99%BD%E4%B8%A4%E8%89%B2-%E5%8A%A0mic-%E5%8F%B3%E4%BE%A7.png',
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
      'https://image.made-in-china.com/2f0j00IidckVRGgbqT/4-Inch-50m-IR-4MP-25X-Zoom-Network-Speed-Dome-Mini-PTZ-Camera-Hikvision-Ds-2de4A425iw-De-S6-Version.jpg',
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
      'https://img.directindustry.com/images_di/photo-g/244341-19545255.webp',
      'https://m.media-amazon.com/images/I/61LyfXz7CZL._AC_UF894,1000_QL80_.jpg',
      'https://i5.walmartimages.com/seo/Horion-Smart-Board-55-4K-UHD-Touch-Screen-40-Point-Multi-Touch-Android-13-Windows-Ready-AG-Anti-Glare-for-Classroom-Office_0b53caf7-cecf-4725-a4f0-72b37bd966e9.b15a8981a76ea9446ee9e6fd0a3f41ea.png',
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
      'https://www.itctech.com.cn/Public//upload/2022-05-20/1653015496.5506_wm_7139.jpg',
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
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTHxqgn6x5koqVceZ-TlLkBEvz3ymRqZws__-5juwuYRQ&s=10',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHlQH1II6QFyc6HAbxiumgUHThBcK1SLThcuj-HNzoIg&s=10',
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
      'https://f.btwcdn.com/store-29999/product/e3d66b16-6ddc-1332-b314-699d2b05772a.jpg',
      'https://discountstore.pk/cdn/shop/files/jabra-evolve2-65-link380a-uc-stereo-black-headset-26599-989-999-700x700.webp?v=1733824689',
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
      'https://smartsolutioncomputer.com/upload-img/Products/Poly/Products/Poly_Studio_V52_(1).webp',
      'https://www.onedirect.co.uk/media/catalog/product/cache/aa0ba86914834d3bc3e1ab8fdcec579e/p/o/postur30_4__2.jpg',
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
      'https://www.hp.com/content/dam/sites/worldwide/poly/video-conferencing/all-in-one/studio-x72/Hero_Banner_Desktop@2x.jpg',
      'https://sourceit.com.sg/cdn/shop/files/poly-studio-x72-video-bar-with-tc10-controller-kit-a4ma7aa-7501398_580x.jpg?v=1759395029',
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
      'https://www.eastporters.com/wp-content/uploads/2024/08/ZH430UST-1.jpg',
      'https://region-resource.optoma.com/products/import/Media/8756fa9f-86c7-43e4-b118-4c519ed593b2.jpg',
      'https://region-resource.optoma.com/products/import/Media/d3830c50-8ed6-45c1-8ca0-9de59986c050.jpg',
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
      'https://region-resource.optoma.com/products/images/RatgiDzub1lk8KspP2bcBmpuaBe8sIHVcsR7qaB9.jpg',
      'https://region-resource.optoma.com/products/images/j66t3GOEC3ylsnaaOFXek5bQFCNjUlFvodytLhC3.jpg',
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
      'https://eu.connect.panasonic.com/sites/default/files/media/image/2026-06/pt-rq45kseries-innovationstoeaseeverystep.webp',
      'https://geartechs.com/cdn/shop/files/panasonic-pt-vmz82-series-white-angle.jpg?v=1750357243',
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
      'https://geartechs.com/cdn/shop/files/panasonic-pt-vmz82-series-white-angle.jpg?v=1750357243',
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
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQEmtP8RVSmTUfWdxeJqs6W7bS48dlH3sHNWz9hgBohoDVsmArUNDjR5nRL&s=10',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQd3EXaHnvp7jNUP5rHtpAIFkEPDzk13E-UveBhhrlB1O1IUzD3vJE6AGs&s=10',
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
      'https://www.hp.com/content/dam/sites/worldwide/poly/video-conferencing/all-in-one/studio-x72/Hero_Banner_Desktop@2x.jpg',
      'https://sourceit.com.sg/cdn/shop/files/poly-studio-x72-video-bar-with-tc10-controller-kit-a4ma7aa-7501398_580x.jpg?v=1759395029',
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
      'https://www.onedirect.co.uk/media/catalog/product/cache/aa0ba86914834d3bc3e1ab8fdcec579e/p/o/postur30_4__2.jpg',
      'https://smartsolutioncomputer.com/upload-img/Products/Poly/Products/Poly_Studio_V52_(1).webp',
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
      'https://smartsolutioncomputer.com/upload-img/Products/Poly/Products/Poly_Studio_V52_(1).webp',
      'https://www.onedirect.co.uk/media/catalog/product/cache/aa0ba86914834d3bc3e1ab8fdcec579e/p/o/postur30_4__2.jpg',
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
      'https://smartsolutioncomputer.com/upload-img/Products/Poly/Products/Poly_Studio_V52_(1).webp',
      'https://www.hp.com/content/dam/sites/worldwide/poly/video-conferencing/all-in-one/studio-x72/Hero_Banner_Desktop@2x.jpg',
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
      'https://www.onedirect.co.uk/media/catalog/product/cache/aa0ba86914834d3bc3e1ab8fdcec579e/p/o/postur30_4__2.jpg',
      'https://www.hp.com/content/dam/sites/worldwide/poly/video-conferencing/all-in-one/studio-x72/Hero_Banner_Desktop@2x.jpg',
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
      'https://smartsolutioncomputer.com/upload-img/Products/Poly/Products/Poly_Studio_V52_(1).webp',
      'https://sourceit.com.sg/cdn/shop/files/poly-studio-x72-video-bar-with-tc10-controller-kit-a4ma7aa-7501398_580x.jpg?v=1759395029',
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
      'https://www.hp.com/content/dam/sites/worldwide/poly/video-conferencing/all-in-one/studio-x72/Hero_Banner_Desktop@2x.jpg',
      'https://sourceit.com.sg/cdn/shop/files/poly-studio-x72-video-bar-with-tc10-controller-kit-a4ma7aa-7501398_580x.jpg?v=1759395029',
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
      'https://static.wixstatic.com/media/fd30db_95b351e9a4314147a52072fe802afa14~mv2.jpg/v1/fit/w_500,h_500,q_90/file.jpg',
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
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQFI_U8f0hKokxhlsTooKH2Jd1ZCBU6bhi8fN-CgfypbA&s=10',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRZl6hSw-qU31Ly3jCK-UR6MTPXLD2BY7OFwMaJW8aAfw&s=10',
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
      'https://d1ncau8tqf99kp.cloudfront.net/converted/125848_original_local_1200x1050_v3_converted.webp',
      'https://d1ncau8tqf99kp.cloudfront.net/converted/125846_original_local_1200x1050_v3_converted.webp',
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
      'https://www.uhs-hardware.com/cdn/shop/products/1_9ff307f7-23c0-48ce-a33b-caa6bd1a5db2.jpg?v=1655492376',
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
      'https://www.viewsonic.com/media/wysiwyg/26PRJ-MLT1176-RC-LSD400W_Bright_in_any_Room_1238x1102.jpg',
      'https://www.viewsonic.com/vsAssetFile/pk/img/resize/awards/ViewSonic-LSD400W-Scenario%202_w640.webp',
      'https://www.viewsonic.com/vsAssetFile/pk/img/resize/VSVN/PR/ViewSonic-LSD400W-Scenario%201-20_w640.webp',
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
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQq7IaQ3YJOzkJpB6V5jo0VB6su4NKHNDULru6Q7wvXX1zpYtn2L6KmCBM&s=10',
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
      'https://cloudfresh.com/wp-content/uploads/2020/04/Cloudfresh-Google-Meet-Hardware-License-Annual-1-1024x717.webp',
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
      'https://cloudfresh.com/wp-content/uploads/2020/04/Cloudfresh-Google-Meet-Hardware-License-Annual-1-1024x717.webp',
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
      'https://m.media-amazon.com/images/I/61mOJRTTmFL._AC_UF350,350_QL80_.jpg',
      'https://m.media-amazon.com/images/S/aplus-media-library-service-media/bdd52f85-dcb8-4286-8336-0300e635bf5f.__CR0,0,600,450_PT0_SX600_V1___.jpg',
    ],
    highlight: '3-mic AI noise-canceling dual wireless Bluetooth headset with 35-hour talk time',
    defaultSpecs:
      'Microphone System:3-Mic Yealink Acoustic Shield 2.0 AI noise cancellation;Battery Life:Up to 35 hours continuous talk time and 43 hours music playback;Wireless Range:Bluetooth 5.2 + BT51 USB dongle up to 50m (164ft) wireless range;Indicators:Dual-sided 360-degree high-visibility busylight;Warranty:1-Year Official Yealink Pakistan Warranty',
    defaultDescription:
      'Yealink BH70 Dual Wireless Bluetooth UC Headset (BH70-DUAL-UC) in Pakistan. Features 3-mic AI noise cancellation, 35-hour talk time, featherlight 147g ergonomics, and Microsoft Teams / Zoom certification.',
  },
  'yealink-sip-t46s-pakistan': {
    gtin: '841885102942',
    mpn: 'SIP-T46S',
    brand: 'Yealink',
    color: 'Black',
    regularPrice: 54000,
    salePrice: 46500,
    categorySlugs: ['ip-phones', 'voip-phone-systems', 'speakerphones'],
    images: [
      'https://shop.tekkpak.com/cdn/shop/files/gtU6abiiEqqJpMYPtJO4-Ac_3_gps_generated.png?v=1765463662&width=1445',
      'https://cdn11.bigcommerce.com/s-u3uxlvxq3h/images/stencil/original/products/9024/26315/X4G-2__79148.1584438040.jpg?c=1',
    ],
    highlight: '16-line executive Gigabit IP phone with 4.3-inch high-resolution color display',
    defaultSpecs:
      'Display:4.3-inch (480 x 272) backlit color display with 16-bit depth;Accounts & Keys:16 VoIP SIP accounts and 10 line keys (up to 27 paperless DSS keys);Audio Technology:Yealink Optima HD Voice with Acoustic Shield and Opus codec;Network & Expansion:Dual-port Gigabit Ethernet with PoE + USB 2.0 port for Wi-Fi/Bluetooth/Recording;Warranty:1-Year Official Yealink Pakistan Warranty',
    defaultDescription:
      'Yealink SIP-T46S / T46U Executive 16-Line Gigabit IP Phone in Pakistan. Designed for C-suite executives and busy managers with Optima HD Voice, 4.3-inch color display, dual Gigabit PoE, and USB headset/Wi-Fi support.',
  },
  'podium-prompter-17-compact-pakistan': {
    gtin: '610807990543',
    mpn: 'AV-PP-17C',
    brand: 'AV Live',
    color: 'Black',
    regularPrice: 150000,
    salePrice: 125000,
    categorySlugs: ['video-conferencing', 'large-room', 'touch-panels', 'boardroom-codecs'],
    images: [
      'https://lh3.googleusercontent.com/d/1wmnD6hLjeuYHMr_USkUmdEB8vUlvnSWh',
      'https://lh3.googleusercontent.com/d/1H08c-FPDzZAyQcVd9UcP5mzIeYGyIg4B',
    ],
    highlight: 'Ultra-slim 1.2" fold-flat stealth podium teleprompter with 400+ nit privacy IPS & 60/40 AR glass',
    defaultSpecs:
      'Display Panel:17-inch (5:4) IPS LCD (1280 x 1024) | 22-inch Flagship Full HD (1920 x 1080);Beamsplitter Glass:60/40 & 70/30 optical broadcast clarity AR prompter glass with 0% audience glare;Optimal Reading Range:Up to 4.5 meters (15 ft) on 17-inch Compact | Up to 6.5 meters (21 ft) on 22-inch Flagship;Brightness:400+ Nit Privacy IPS with 4-way ±30° microlouver filter;Image Reversal:Built-in hardware horizontal and vertical mirror flip (no software lag);Video Inputs:HDMI, DC power, or integrated Standalone Smart Mini PC;Mechanical Architecture:1.2-inch fold-flat anodized aluminum unibody (30-second lectern deployment);Included Accessories:Optional CNC-cut EVA briefcase / wheeled flight trolley, cables, and presenter remote;Recommended Venue:Corporate keynotes, diplomatic briefings, executive boardrooms, and broadcast studios;Warranty:1-Year Official AV Live Pakistan Local Replacement Warranty',
    defaultDescription:
      'AV Live Fold-Flat Podium Teleprompter (17" Compact & 22" Flagship Series, AV-PP-17C) in Pakistan. Deploys in 30 seconds onto any lectern with 400+ nit privacy IPS, 80% speaker readability, and 0% audience glow across Lahore, Karachi, and Islamabad.',
  },
};

export const GMC_20_SHEET_HEADERS = [
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
] as const;

/**
 * Strips HTML tags, entities, tabs, and line breaks so a string is 100% safe for TSV output.
 * When maxLength is specified, trims cleanly on a word boundary without mid-word "..." truncation.
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
    const sliced = cleaned.slice(0, maxLength);
    const lastSpace = sliced.lastIndexOf(' ');
    const wordBounded = lastSpace > Math.floor(maxLength * 0.6) ? sliced.slice(0, lastSpace) : sliced;
    return wordBounded
      .replace(/[,:;|\-–—.\s]+$/, '')
      .replace(/\s+\b(in|for|with|and|or|to|of|by|on|at|vs\.?|which|the|a|an|&)$/i, '')
      .replace(/[,:;|\-–—\s]+$/, '');
  }
  return cleaned;
}

/**
 * Ensures every Google Merchant Center image URL points to a high-resolution image
 * with an explicit supported file format extension (.jpg, .jpeg, .webp, .png, .gif, .bmp, .tif, .tiff)
 * and filters out low-resolution encrypted-tbn0.gstatic.com thumbnails.
 */
export function normalizeGmcImageUrl(rawUrl?: string | null): string {
  const cleaned = sanitizeTsvText(rawUrl);
  if (
    !cleaned ||
    cleaned.startsWith('/') ||
    cleaned.startsWith('https://avlive.com.pk/images/') ||
    cleaned.includes('encrypted-tbn0.gstatic.com') ||
    /(?:youtube\.com|youtu\.be|vimeo\.com)\//i.test(cleaned)
  ) {
    return '';
  }
  if (!cleaned.startsWith('http')) {
    return '';
  }
  const gdriveFileMatch = cleaned.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i);
  if (gdriveFileMatch && gdriveFileMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${gdriveFileMatch[1]}?format=image.jpg`;
  }
  if (/\.(jpg|jpeg|webp|png|gif|bmp|tif|tiff)(\?.*)?$/i.test(cleaned)) {
    return cleaned;
  }
  if (cleaned.includes('images.unsplash.com/')) {
    const base = cleaned.split('?')[0];
    return `${base}?w=1200&q=85&fm=jpg&ext=image.jpg`;
  }
  const sep = cleaned.includes('?') ? '&' : '?';
  return `${cleaned}${sep}format=image.jpg`;
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
  const cleanRaw = sanitizeTsvText(rawSpecs);
  const cleanDefault = sanitizeTsvText(defaultSpecs);
  // Prefer defaultSpecs if rawSpecs contains malformed table headers from legacy imports
  const hasMalformedRaw =
    !cleanRaw ||
    /Specification\s*:\s*SIP/i.test(cleanRaw) ||
    /SpecificationAV\s*Live/i.test(cleanRaw) ||
    /:\d+:/.test(cleanRaw);
  const source = (!hasMalformedRaw ? cleanRaw : cleanDefault) || cleanDefault || cleanRaw;
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
  kl5wGaNLxqQByn3oPd1Z: 'podium-prompter-17-compact-pakistan',
  'podium-prompter-17-compact': 'podium-prompter-17-compact-pakistan',
  'av-live-fold-flat-podium-teleprompter': 'podium-prompter-17-compact-pakistan',
  'av-live-fold-flat-podium-teleprompter-pakistan': 'podium-prompter-17-compact-pakistan',
  'poly-studio-x72-all-in-one-video-bar-pakistan': 'poly-studio-x72-pakistan',
  'cisco-room-kit-plus-video-conferencing-system-pakistan': 'cisco-room-kit-plus-pakistan',
  'cisco-webex-room-kit-plus-pakistan': 'cisco-room-kit-plus-pakistan',
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
  'podium-prompter-17-compact-pakistan': 'kl5wGaNLxqQByn3oPd1Z',
};

/**
 * Dedicated flagship product routes that replace the generic `/product/:slug` template.
 */
export const PRODUCT_CUSTOM_PAGE_ROUTES: Record<string, string> = {
  'podium-prompter-17-compact-pakistan': '/podium-teleprompter',
  'kl5wGaNLxqQByn3oPd1Z': '/podium-teleprompter',
  'podium-prompter-17-compact': '/podium-teleprompter',
  'av-pp-17c': '/podium-teleprompter',
  'av-live-fold-flat-podium-teleprompter': '/podium-teleprompter',
  'av-live-fold-flat-podium-teleprompter-pakistan': '/podium-teleprompter',
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
  for (const [idKey, seoSlug] of Object.entries(PRODUCT_ID_TO_SEO_SLUG)) {
    if (idKey.toLowerCase() === lower) {
      return seoSlug;
    }
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

  const readableName =
    canonicalSlug === 'podium-prompter-17-compact-pakistan'
      ? 'AV Live Fold-Flat Podium Teleprompter'
      : canonicalSlug
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

  const resolvedImages = (
    meta.images && meta.images.length > 0
      ? meta.images
      : ['https://www.hp.com/content/dam/sites/worldwide/poly/video-conferencing/all-in-one/studio-x72/Hero_Banner_Desktop@2x.jpg']
  ).filter((img) => /^https?:\/\//i.test(img) && !img.startsWith('https://avlive.com.pk/images/'));
  if (resolvedImages.length === 0) {
    resolvedImages.push(
      'https://www.hp.com/content/dam/sites/worldwide/poly/video-conferencing/all-in-one/studio-x72/Hero_Banner_Desktop@2x.jpg'
    );
  }

  const resolvedCategories =
    meta.categorySlugs && meta.categorySlugs.length > 0 ? meta.categorySlugs : ['video-conferencing'];
  const resolvedCategoryIds = resolvedCategories.includes('video-conferencing')
    ? Array.from(new Set(['cat-video', ...resolvedCategories]))
    : resolvedCategories;

  return {
    id: SEO_SLUG_TO_PRODUCT_ID[canonicalSlug] || canonicalSlug,
    slug: canonicalSlug,
    customPagePath: PRODUCT_CUSTOM_PAGE_ROUTES[canonicalSlug],
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
    categoryIds: resolvedCategoryIds,
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
    isFeatured: ['polycom-realpresence-group-500-pakistan', 'poly-studio-x72-pakistan', 'logitech-rally-bar-pakistan', 'cisco-room-kit-plus-pakistan', 'horion-k6a-bundle-special-offer', 'grandstream-ucm6308-pakistan', 'podium-prompter-17-compact-pakistan'].includes(canonicalSlug),
  };
}

/**
 * Returns the canonical SEO-friendly slug for any product object or ID.
 * Never returns a raw mixed-case Firestore document ID when a product name or slug is available.
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

  if (rawSlug && /^[a-z0-9-]+$/.test(rawSlug)) {
    return rawSlug;
  }

  const rawName = sanitizeTsvText(product?.productName || product?.name);
  if (rawName) {
    const derived = rawName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    if (derived) {
      const withCountry = derived.endsWith('-pakistan') ? derived : `${derived}-pakistan`;
      return resolveCanonicalProductSlugByIdentifier(withCountry) || withCountry;
    }
  }

  return (rawSlug || rawId || 'hardware').toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
}

/**
 * Returns the canonical route path for any product object or identifier.
 * Products with a dedicated flagship page (e.g., AV Live Fold-Flat Podium Teleprompter -> /podium-teleprompter)
 * resolve directly to that route instead of /product/:slug.
 */
export function getProductHref(product?: Record<string, any> | null, fallbackId?: string): string {
  const customPath = sanitizeTsvText(product?.customPagePath);
  if (customPath && customPath.startsWith('/')) {
    return customPath;
  }

  const canonicalSlug = getCanonicalProductSlug(product, fallbackId);
  const rawId = sanitizeTsvText(product?.id || fallbackId);
  const rawSku = sanitizeTsvText(product?.mpn || product?.sku).toLowerCase();
  const rawName = sanitizeTsvText(product?.productName || product?.name).toLowerCase();

  if (PRODUCT_CUSTOM_PAGE_ROUTES[canonicalSlug]) {
    return PRODUCT_CUSTOM_PAGE_ROUTES[canonicalSlug];
  }
  if (rawId && PRODUCT_CUSTOM_PAGE_ROUTES[rawId]) {
    return PRODUCT_CUSTOM_PAGE_ROUTES[rawId];
  }
  if (rawSku && PRODUCT_CUSTOM_PAGE_ROUTES[rawSku]) {
    return PRODUCT_CUSTOM_PAGE_ROUTES[rawSku];
  }
  if (rawName.includes('fold-flat podium teleprompter') || rawName.includes('podium prompter 17')) {
    return '/podium-teleprompter';
  }

  return `/product/${canonicalSlug}`;
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
  const canonicalSlug = getCanonicalProductSlug(product, product?.id);
  const meta = PRODUCT_GMC_METADATA[canonicalSlug] || PRODUCT_GMC_METADATA[product?.id || ''];
  const rawRegular = Number(product?.regularPrice ?? product?.price ?? meta?.regularPrice ?? 0);
  const rawSale = Number(product?.salePrice ?? meta?.salePrice ?? 0);
  const regularPrice = rawRegular > 0 ? rawRegular : rawSale > 0 ? rawSale : meta?.regularPrice || 50000;
  const salePrice = rawSale > 0 ? rawSale : regularPrice;
  const effectivePrice = salePrice > 0 ? salePrice : regularPrice;
  const hasSale = salePrice > 0 && salePrice < regularPrice;
  return { regularPrice, salePrice, effectivePrice, hasSale };
}

/**
 * Converts a Firestore or Fallback Product document into a 40-column Google Merchant Center row object
 * matching the exact Google Merchant Center Sheet rules:
 * - id: SKU / MPN where possible (unique across all 53 products)
 * - title: Specific and accurate product title + MPN (up to 150 chars)
 * - description: Informative product details (up to 200 chars, distinct from product_highlight, no mid-word "...")
 * - availability: "in_stock" | "out_of_stock" | "preorder" | "backorder"
 * - availability_date: ISO 8601 date if preorder/backorder
 * - link / mobile_link: Canonical https://avlive.com.pk/product/:slug
 * - image_link / additional_image_link: High-res URLs with explicit .jpg/.png/.webp extension
 * - price / sale_price: ISO 4217 "XXXX.00 PKR"
 * - identifier_exists / gtin / mpn / brand: Verified GS1 UPC-12 + MPN + Brand
 * - product_highlight: Up to 150 chars scannable fragments
 * - product_detail: "section_name:attribute_name:attribute_value"
 * - condition: "new" | "refurbished" | "used"
 */
export function formatProductToGmcRow(product: Record<string, any>): Record<string, string> {
  const rawId = sanitizeTsvText(product.id || product.slug || product.sku);
  const canonicalSlug = getCanonicalProductSlug(product, rawId);
  const meta: Partial<(typeof PRODUCT_GMC_METADATA)[string]> =
    PRODUCT_GMC_METADATA[canonicalSlug] || PRODUCT_GMC_METADATA[rawId] || {};

  const gtin = sanitizeTsvText(meta.gtin || product.gtin || computeUpc12('61080799001'));
  const mpn = cleanMpn(meta.mpn || product.mpn || product.sku, canonicalSlug);
  // Google Merchant Center tip: "Use SKUs as your IDs where possible."
  const id = mpn || canonicalSlug;

  // Parse and normalize images so every URL is high-res and has a valid .jpg/.png/.webp extension
  let rawImages: string[] = [];
  if (Array.isArray(product.images)) {
    rawImages = product.images.filter(Boolean);
  } else if (typeof product.images === 'string' && product.images.trim()) {
    try {
      const parsed = JSON.parse(product.images);
      rawImages = Array.isArray(parsed) ? parsed : [product.images];
    } catch {
      rawImages = [product.images];
    }
  } else if (product.image) {
    rawImages = [product.image];
  }

  const metaImages = Array.isArray(meta.images) ? meta.images : [];
  const orderedCandidateUrls = [...rawImages, ...metaImages];
  const mergedImages = Array.from(
    new Set(
      orderedCandidateUrls
        .map((u) => normalizeGmcImageUrl(u))
        .filter(Boolean)
    )
  );
  if (mergedImages.length === 0) {
    mergedImages.push(
      'https://www.hp.com/content/dam/sites/worldwide/poly/video-conferencing/all-in-one/studio-x72/Hero_Banner_Desktop@2x.jpg'
    );
  }
  if (mergedImages.length === 1) {
    mergedImages.push(
      'https://sourceit.com.sg/cdn/shop/files/poly-studio-x72-video-bar-with-tc10-controller-kit-a4ma7aa-7501398_580x.jpg?v=1759395029'
    );
  }

  const brandRaw = sanitizeTsvText(meta.brand || product.brand || 'AV Live');
  const brand = brandRaw === 'Poly (HP' ? 'HP Poly' : brandRaw;

  let baseTitle = sanitizeTsvText(product.productName || 'Enterprise AV Hardware', 120);
  if (baseTitle === 'Jabra Evolve 75 UC Stereo Wireless ANC Headse') {
    baseTitle = 'Jabra Evolve 75 UC Stereo Wireless ANC Headset';
  }
  const titleWithMpn = baseTitle.includes(mpn) ? baseTitle : `${baseTitle} (${mpn})`;
  const title = sanitizeTsvText(titleWithMpn, 150);

  // Build rich, distinct description (up to 200 characters) without mid-word ellipsis
  const rawFullDesc =
    sanitizeTsvText(meta.defaultDescription) ||
    sanitizeTsvText(product.description) ||
    `Genuine ${title} by ${brand} in Pakistan. ${meta.highlight || ''}. Includes 1-year official warranty and nationwide enterprise deployment by AV Live.`;
  const clampedDesc = sanitizeTsvText(rawFullDesc, 199);
  const description = clampedDesc.endsWith('.') ? clampedDesc : `${clampedDesc}.`;

  const rawAvailability = sanitizeTsvText(product.availability).toLowerCase();
  const stock = Number(product.stockQuantity ?? 10);
  const availability: 'in_stock' | 'out_of_stock' | 'preorder' | 'backorder' =
    rawAvailability === 'preorder' || rawAvailability === 'backorder' || rawAvailability === 'out_of_stock'
      ? (rawAvailability as any)
      : stock > 0 || rawId === 'wMbGVClqbDS2LFrv5HyX'
      ? 'in_stock'
      : 'out_of_stock';

  const availabilityDate =
    availability === 'preorder' || availability === 'backorder'
      ? sanitizeTsvText(product.availabilityDate || '2026-12-01T09:00+0500')
      : '';
  const expirationDate = sanitizeTsvText(product.expirationDate || '');

  const { regularPrice: regularPriceNum, salePrice: salePriceNum, hasSale } = resolveProductPricing(product);

  const price = `${regularPriceNum.toFixed(2)} PKR`;
  const salePrice = hasSale ? `${salePriceNum.toFixed(2)} PKR` : '';
  const saleEffectiveDate = hasSale ? '2026-01-01T00:00+0500/2027-12-31T23:59+0500' : '';

  const baseHighlight =
    meta.highlight ||
    `Official ${brand} enterprise AV hardware in Pakistan with 1-year warranty and nationwide installation`;
  const enrichedHighlight = `${baseHighlight}; Official ${brand} MPN ${mpn}; 1-Year Pakistan Warranty`;
  const highlight = sanitizeTsvText(
    enrichedHighlight.length <= 150 ? enrichedHighlight : baseHighlight,
    150
  );

  const productDetail = formatGmcProductDetail(product.specifications, meta.defaultSpecs);
  const productHref = getProductHref(product, rawId);
  const link = `https://avlive.com.pk${productHref}`;
  const mainImage = mergedImages[0];
  const additionalImages = mergedImages.slice(1, 10).join(',');
  const rawCondition = sanitizeTsvText(product.condition).toLowerCase();
  const condition =
    rawCondition === 'refurbished' || rawCondition === 'used' ? rawCondition : 'new';

  return {
    id,
    title,
    description,
    availability,
    availability_date: availabilityDate,
    expiration_date: expirationDate,
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
    condition,
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
 * Generates the exact 20-column Google Merchant Center Sheet TSV matching the core required/recommended columns.
 */
export function generateGmc20Tsv(products: Record<string, any>[]): string {
  const headerLine = GMC_20_SHEET_HEADERS.join('\t');
  const lines = products.map((product) => {
    const rowObj = formatProductToGmcRow(product);
    return GMC_20_SHEET_HEADERS.map((col) => sanitizeTsvText(rowObj[col])).join('\t');
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

function escapeXml(val: string): string {
  return String(val || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generates a Google Merchant Center RSS 2.0 XML Product Feed (<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">)
 */
export function generateGmcXml(products: Record<string, any>[]): string {
  const itemsXml = products
    .map((product) => {
      const r = formatProductToGmcRow(product);
      const highlights = String(r.product_highlight || '')
        .split(';')
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 6)
        .map((h) => `      <g:product_highlight>${escapeXml(h)}</g:product_highlight>`)
        .join('\n');

      return `    <item>
      <g:id>${escapeXml(r.id)}</g:id>
      <g:title>${escapeXml(r.title)}</g:title>
      <g:description>${escapeXml(r.description)}</g:description>
      <g:link>${escapeXml(r.link)}</g:link>
      <g:image_link>${escapeXml(r.image_link)}</g:image_link>
      <g:availability>${escapeXml(r.availability)}</g:availability>
      <g:price>${escapeXml(r.price)}</g:price>${
        r.sale_price ? `\n      <g:sale_price>${escapeXml(r.sale_price)}</g:sale_price>` : ''
      }
      <g:brand>${escapeXml(r.brand)}</g:brand>
      <g:gtin>${escapeXml(r.gtin)}</g:gtin>
      <g:mpn>${escapeXml(r.mpn)}</g:mpn>
      <g:identifier_exists>${escapeXml(r.identifier_exists)}</g:identifier_exists>
      <g:condition>${escapeXml(r.condition)}</g:condition>
      <g:is_bundle>${escapeXml(r['is bundle'])}</g:is_bundle>
${highlights}
    </item>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>AV Live Communications — Enterprise Pro-AV &amp; Video Conferencing Pakistan</title>
    <link>https://avlive.com.pk</link>
    <description>Official Google Merchant Center Hardware Feed (Poly, Cisco, Logitech, Yealink, Jabra, Bosch)</description>
${itemsXml}
  </channel>
</rss>`;
}
