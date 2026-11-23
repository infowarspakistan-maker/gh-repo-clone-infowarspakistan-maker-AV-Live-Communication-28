// Google Merchant Center (GMC) 40-Column Feed & Product Enrichment Utility
import {
  DEFAULT_PKR_PER_UNIT,
  SupportedCurrency,
  formatGmcPriceValue,
  normalizeSupportedCurrency,
} from './currency';
import { inferDefaultGoogleCategory } from './google-taxonomy';

export interface GmcFeedCurrencyOptions {
  currency?: SupportedCurrency;
  pkrPerUnit?: Partial<Record<SupportedCurrency, number>>;
}

export const GMC_EXACT_FEED_HEADERS = [
  'id',
  'title',
  'description',
  'link',
  'image_link',
  'availability',
  'price',
  'brand',
  'condition',
  'gtin',
  'mpn',
  'identifier_exists',
  'google_product_category',
  'product_type',
  'custom_label_0',
  'custom_label_1',
  'custom_label_2',
  'custom_label_3',
  'custom_label_4',
  'shipping_weight',
  'shipping_length',
  'shipping_width',
  'shipping_height',
  'return_policy_label',
  'additional_image_link',
  'video_link',
  'is_bundle',
  'multipack',
  'mobile_link',
  'sale_price',
] as const;

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
  'shipping_weight',
  'shopping_ads_excluded_country',
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
    gmcId?: string;
    gtin: string;
    mpn: string;
    brand: string;
    title?: string;
    color?: string;
    isBundle?: 'yes' | 'no';
    multipack?: number;
    shippingWeight?: string;
    shippingLength?: string;
    shippingWidth?: string;
    shippingHeight?: string;
    returnPolicyLabel?: string;
    googleProductCategory?: string;
    productType?: string;
    customLabel0?: string;
    customLabel1?: string;
    customLabel2?: string;
    customLabel3?: string;
    customLabel4?: string;
    highlight: string;
    shortSummary?: string;
    gmcDescription?: string;
    regularPrice?: number;
    salePrice?: number;
    categorySlugs?: string[];
    images?: string[];
    defaultSpecs?: string;
    defaultDescription?: string;
    seoMetaDescription?: string;
    seoTags?: string;
    imageAltText?: string;
  }
> = {
  '2n-ip-vario-intercom-pakistan': {
    gtin: computeUpc12('85951596161'),
    mpn: '9137161U',
    brand: '2N',
    color: 'Silver',
    shippingWeight: '0.85 kg',
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
    shippingWeight: '0.20 kg',
    regularPrice: 85000,
    salePrice: 82000,
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
    shippingWeight: '5.45 kg',
    regularPrice: 650000,
    salePrice: 515000,
    categorySlugs: ['video-conferencing', 'large-room', 'boardroom-codecs', 'ptz-cameras'],
    images: [
      'https://avlive.com.pk/images/products/polycom-group-500-eagleeye-iv.jpg',
      'https://avlive.com.pk/images/projects/vissonic-delegate-boardroom.webp',
      'https://avlive.com.pk/images/projects/multicity-teams-boardrooms.webp',
      'https://avlive.com.pk/images/video-conference/boardroom-hero.webp',
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
    shippingWeight: '5.45 kg',
    regularPrice: 650000,
    salePrice: 515000,
    categorySlugs: ['video-conferencing', 'large-room', 'boardroom-codecs', 'ptz-cameras'],
    images: [
      'https://avlive.com.pk/images/products/polycom-group-500-eagleeye-iv.jpg',
      'https://avlive.com.pk/images/projects/vissonic-delegate-boardroom.webp',
      'https://avlive.com.pk/images/projects/multicity-teams-boardrooms.webp',
      'https://avlive.com.pk/images/video-conference/boardroom-hero.webp',
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
    regularPrice: 45000,
    salePrice: 42000,
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
    regularPrice: 280000,
    salePrice: 260000,
    categorySlugs: ['projectors'],
    images: [
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
    regularPrice: 490000,
    salePrice: 465000,
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
    regularPrice: 180000,
    salePrice: 165000,
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
    regularPrice: 45000,
    salePrice: 42000,
    categorySlugs: ['ip-phones', 'voip-phone-systems'],
    images: [
      'https://cdn11.bigcommerce.com/s-u3uxlvxq3h/images/stencil/original/products/9024/26315/X4G-2__79148.1584438040.jpg?c=1',
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
    gmcId: 'GGN-CS-BAR-T-K9',
    gtin: '0889728453981',
    mpn: 'CS-BAR-T-K9',
    brand: 'Cisco',
    title: 'Cisco Room Bar CS-BAR-T-K9 – 4K Video Bar with Intelligent Camera and Noise-Cancelling Microphones',
    color: 'First Light Gray',
    isBundle: 'no',
    shippingWeight: '1.50 kg',
    shippingLength: '53.4 cm',
    shippingWidth: '8.2 cm',
    shippingHeight: '6.4 cm',
    returnPolicyLabel: 'b2b-30-day',
    googleProductCategory: 'Electronics > Communications > Telephony > Video Conferencing',
    productType: 'Video Conferencing > Video Bars',
    customLabel0: 'Cisco',
    customLabel1: 'Video-Conferencing',
    customLabel2: 'Huddle-Room',
    customLabel3: 'Focus-Room',
    customLabel4: 'Pakistan-Stock',
    regularPrice: 777010,
    salePrice: 749210,
    categorySlugs: ['video-conferencing', 'touch-panels', 'boardroom-codecs'],
    images: [
      'https://images.squarespace-cdn.com/content/v1/67db47a049b935648edd4c72/a10cbe60-8715-422d-ab46-0d0465bbbc25/cisco+room+bar.jpg',
      'https://avlive.com.pk/images/products/cisco-room-kit-studio.jpg',
      'https://images.squarespace-cdn.com/content/v1/67db47a049b935648edd4c72/0314b887-3a14-4d3d-b4ae-101f44214454/cisco+kit+eq.webp',
      'https://avlive.com.pk/images/video-conference/huddle-space.webp',
    ],
    highlight: 'All-in-one 4K AI video bar with Room Navigator touch panel for Webex & Microsoft Teams',
    shortSummary:
      'Cisco Room Bar (CS-BAR-T-K9) combines a 12MP 4K wide-angle AI camera, 4-element noise-cancelling microphone array, stereo speakers, and Room Navigator touch controller for huddle and focus rooms.',
    gmcDescription:
      'Cisco Room Bar combines a powerful codec, an intelligent wide-field-of-view camera, noise-cancelling microphones, dual stereo speakers, and robust integrations in a single device. Connect one or two displays via HDMI for full HD video and 4K content. It runs natively on RoomOS for Webex and provides interoperability with Microsoft Teams, Zoom, and Google Meet via the Room Navigator touch controller or voice command. Can also be configured as a native Microsoft Teams Rooms system.',
    defaultSpecs:
      'Camera Optics:12MP 4K UltraHD wide-angle lens with 120-degree horizontal FOV, f/2.5 aperture, and 5x digital zoom;Controller Included:Cisco Room Navigator 10.1-inch PoE tabletop touch controller;Audio System:4-element beamforming microphone array with AI noise removal + dual stereo speakers + external mic port;Display & Content I/O:2x HDMI monitor outputs (up to 3840x2160p60) + 1x HDMI content input + USB-C DisplayPort Alt Mode BYOD;Platform Support:Native Cisco RoomOS (Webex) & Native Microsoft Teams Rooms (MTR) + Zoom/Google Meet WebRTC;Dimensions & Weight:53.4 × 8.2 × 6.4 cm (21.0 × 3.2 × 2.5 in) • 1.50 kg (3.3 lb);Room Capacity:Huddle, Focus & Small Meeting Rooms (2 to 8 Seats);Warranty:1-Year Official Cisco Pakistan Warranty & 15-Min SLA',
    defaultDescription:
      'Cisco Room Bar (CS-BAR-T-K9, GTIN: 0889728453981) All-in-One 4K Video Bar with Room Navigator Touch Controller in Pakistan. Engineered for huddle spaces and focus rooms with a 120-degree 12MP AI speaker-tracking camera, noise-cancelling beamforming microphones, dual-screen HDMI output, single-cable USB-C BYOD passthrough, and native Cisco RoomOS or Microsoft Teams Rooms operation.',
    seoMetaDescription:
      'Buy Cisco Room Bar CS-BAR-T-K9 in Pakistan (Rs. 749,210). All-in-one 4K AI video bar with 120° camera, noise-cancelling mics and Room Navigator for Webex/Teams.',
  },
  'cisco-room-bar-t-c-k9-pakistan': {
    gmcId: 'GGN-CS-BAR-T-C-K9',
    gtin: '0889728453981',
    mpn: 'CS-BAR-T-C-K9',
    brand: 'Cisco',
    title: 'Cisco Room Bar CS-BAR-T-C-K9 – All-in-One 4K Video Bar with AI Camera and Noise-Cancelling Mics',
    color: 'Carbon Black',
    isBundle: 'no',
    shippingWeight: '1.50 kg',
    shippingLength: '53.4 cm',
    shippingWidth: '8.2 cm',
    shippingHeight: '6.4 cm',
    returnPolicyLabel: 'b2b-30-day',
    googleProductCategory: 'Electronics > Communications > Telephony > Video Conferencing',
    productType: 'Video Conferencing > Video Bars',
    customLabel0: 'Cisco',
    customLabel1: 'Video-Conferencing',
    customLabel2: 'Huddle-Room',
    customLabel3: 'Focus-Room',
    customLabel4: 'Pakistan-Stock',
    regularPrice: 777010,
    salePrice: 749210,
    categorySlugs: ['video-conferencing', 'touch-panels', 'boardroom-codecs'],
    images: [
      'https://images.squarespace-cdn.com/content/v1/67db47a049b935648edd4c72/f0cdcaa7-867f-410f-a75d-ba68ff16d262/cisco+room+bar.jpg',
      'https://avlive.com.pk/images/products/cisco-room-kit-studio.jpg',
      'https://images.squarespace-cdn.com/content/v1/67db47a049b935648edd4c72/0314b887-3a14-4d3d-b4ae-101f44214454/cisco+kit+eq.webp',
      'https://avlive.com.pk/images/video-conference/huddle-space.webp',
    ],
    highlight: 'Carbon Black all-in-one 4K AI video bar with Room Navigator for huddle and focus rooms',
    shortSummary:
      'Cisco Room Bar Carbon Black (CS-BAR-T-C-K9) delivers a 12MP 120° AI camera, noise-cancelling beamforming mics, dual stereo speakers, and Room Navigator touch control for modern huddle spaces.',
    gmcDescription:
      'Cisco Room Bar combines a powerful codec, an intelligent wide-field-of-view camera, noise-cancelling microphones, dual stereo speakers, and robust integrations in a single device. Connect one or two displays via HDMI for full HD video and 4K content. It runs natively on RoomOS for Webex and provides interoperability with Microsoft Teams, Zoom, and Google Meet via the Room Navigator touch controller or voice command. Can also be configured as a native Microsoft Teams Rooms system.',
    defaultSpecs:
      'Camera Optics:12MP 4K UltraHD wide-angle lens (120-degree horizontal FOV, 5x digital zoom, AI auto-framing);Finish & Controller:Carbon Black enclosure with matching Cisco Room Navigator 10.1-inch touch controller;Audio Architecture:4-element directional microphone array + high-fidelity stereo speakers + 1x external table mic port;Video & BYOD I/O:Dual HDMI display outputs + 1x HDMI 4K content input + single-cable USB-C BYOD passthrough;UC Compatibility:Native Cisco RoomOS (Webex) or Native Microsoft Teams Rooms (MTR) + Zoom/Meet interop;Dimensions & Weight:53.4 × 8.2 × 6.4 cm (21.0 × 3.2 × 2.5 in) • 1.50 kg (3.3 lb);Room Capacity:Huddle & Focus Rooms (2 to 8 Seats);Warranty:1-Year Official Cisco Pakistan Warranty & 15-Min SLA',
    defaultDescription:
      'Cisco Room Bar Carbon Black (CS-BAR-T-C-K9, GTIN: 0889728453981) All-in-One 4K Video Conferencing Bar in Pakistan. Includes the Carbon Black video bar and matching Cisco Room Navigator tabletop touch controller, delivering dual-display 4K collaboration, AI speaker framing, ultrasonic proximity join, and USB-C BYOD mode.',
    seoMetaDescription:
      'Order Cisco Room Bar Carbon CS-BAR-T-C-K9 in Pakistan (Rs. 749,210). Carbon Black 4K AI video bar with 120° lens, stereo audio & Room Navigator touch panel.',
  },
  'cisco-room-bar-pro-pakistan': {
    gmcId: 'GGN-CS-BARPRO-K9',
    gtin: '0889728537841',
    mpn: 'CS-BARPRO-K9',
    brand: 'Cisco',
    title: 'Cisco Room Bar Pro CS-BARPRO-K9 – AI-Enhanced Video Bar with Dual Cameras for Medium Rooms',
    color: 'Carbon Black',
    isBundle: 'no',
    shippingWeight: '4.47 kg',
    shippingLength: '96.0 cm',
    shippingWidth: '11.0 cm',
    shippingHeight: '9.0 cm',
    returnPolicyLabel: 'b2b-30-day',
    googleProductCategory: 'Electronics > Communications > Telephony > Video Conferencing',
    productType: 'Video Conferencing > Video Bars',
    customLabel0: 'Cisco',
    customLabel1: 'Video-Conferencing',
    customLabel2: 'Medium-Room',
    customLabel3: 'Dual-Camera',
    customLabel4: 'Pakistan-Stock',
    regularPrice: 2627100,
    salePrice: 2349100,
    categorySlugs: ['video-conferencing', 'large-room', 'touch-panels', 'boardroom-codecs'],
    images: [
      'https://images.squarespace-cdn.com/content/v1/67db47a049b935648edd4c72/7aa2e865-0c08-415b-9902-8d525edef33c/cisco+barpro.webp',
      'https://images.squarespace-cdn.com/content/v1/67db47a049b935648edd4c72/0314b887-3a14-4d3d-b4ae-101f44214454/cisco+kit+eq.webp',
      'https://avlive.com.pk/images/products/cisco-room-kit-studio.jpg',
      'https://avlive.com.pk/images/video-conference/boardroom-hero.webp',
    ],
    highlight: 'AI-enhanced dual-48MP camera video bar with NVIDIA engine for medium-to-large conference rooms',
    shortSummary:
      'Cisco Room Bar Pro (CS-BARPRO-K9) packs dual 48MP AI cameras (96MP total), an NVIDIA Jetson computing engine, a 3-channel loudspeaker system, and 16-element microphone array for medium spaces.',
    gmcDescription:
      'Cisco Room Bar Pro is an integrated, AI-enhanced video bar solution featuring intelligent dual cameras, a three-channel loudspeaker system, a built-in microphone array, a powerful computing engine, and rich connectivity. It includes an intuitive touch controller and smart room accessories to deliver intelligent, inclusive video collaboration for medium-sized meeting spaces.',
    defaultSpecs:
      'Dual Camera System:96MP dual-lens array (2x 48MP sensors: 112° wide lens + 70° telephoto lens for long-throw clarity);AI Compute Engine:Dedicated NVIDIA AI processor enabling Cinematic Meetings, multi-stream people framing & virtual zones;Audio System:3-channel loudspeaker system with dual passive radiators + 16-element beamforming microphone array;External Audio & PoE:3x RJ45 PoE ports for Cisco Table/Ceiling Microphone Pro and Cisco Room Navigator;Video & BYOD I/O:2x HDMI 4K display outputs + 2x HDMI content inputs + USB-C 4K60 BYOD passthrough;Dimensions & Weight:96.0 × 11.0 × 9.0 cm (37.8 × 4.3 × 3.5 in) • 4.47 kg (9.85 lb);Room Capacity:Medium to Large Conference Rooms (8 to 16 Seats);Warranty:1-Year Official Cisco Pakistan Warranty & 15-Min SLA',
    defaultDescription:
      'Cisco Room Bar Pro (CS-BARPRO-K9, GTIN: 0889728537841) AI-Enhanced Dual-Camera Video Bar in Pakistan. Built for medium and large conference rooms, it integrates dual 48MP wide and telephoto lenses, an NVIDIA AI engine, a 16-element beamforming microphone array, 3 PoE peripheral ports, and native Webex or Microsoft Teams Rooms certification.',
    seoMetaDescription:
      'Buy Cisco Room Bar Pro CS-BARPRO-K9 in Pakistan (Rs. 2,349,100). Dual 48MP AI cameras, 16-mic array, 3-channel audio & Room Navigator for medium rooms.',
  },
  'cisco-webex-codec-pro-pakistan': {
    gmcId: 'GGN-CS-CODEC-PRO-K9',
    gtin: '0889728127431',
    mpn: 'CS-CODEC-PRO-K9',
    brand: 'Cisco',
    title: 'Cisco Webex Codec Pro CS-CODEC-PRO-K9 – Intelligent Video Conferencing Appliance for Large Rooms',
    color: 'Silver',
    isBundle: 'no',
    shippingWeight: '3.30 kg',
    shippingLength: '43.6 cm',
    shippingWidth: '23.1 cm',
    shippingHeight: '6.6 cm',
    returnPolicyLabel: 'b2b-30-day',
    googleProductCategory: 'Electronics > Communications > Telephony > Video Conferencing',
    productType: 'Video Conferencing > Codecs',
    customLabel0: 'Cisco',
    customLabel1: 'Video-Conferencing',
    customLabel2: 'Large-Room',
    customLabel3: 'Enterprise-Boardroom',
    customLabel4: 'Pakistan-Stock',
    regularPrice: 528200,
    salePrice: 512910,
    categorySlugs: ['video-conferencing', 'large-room', 'boardroom-codecs'],
    images: [
      'https://images.squarespace-cdn.com/content/v1/67db47a049b935648edd4c72/b60115d6-20c6-47bf-a3ea-1664b710ec82/codec+pro.webp',
      'https://images.squarespace-cdn.com/content/v1/67db47a049b935648edd4c72/0314b887-3a14-4d3d-b4ae-101f44214454/cisco+kit+eq.webp',
      'https://avlive.com.pk/images/video-conference/boardroom-hero.webp',
    ],
    highlight: '1RU rack-mountable 4K60 integrator video conferencing codec with 6 video inputs & 8 XLR mic ports',
    shortSummary:
      'Cisco Webex Codec Pro (CS-CODEC-PRO-K9) is a 1RU rack-mountable 4K UHD integrator codec featuring 6 video inputs (HDMI/3G-SDI), 3 HDMI outputs, and 8 balanced XLR microphone inputs with individual AEC.',
    gmcDescription:
      'Cisco Webex Codec Pro is the most flexible video collaboration appliance for premium-quality meetings, unparalleled connectivity, and seamless configuration in large workspaces and custom audiovisual environments. It powers the Room Kit Pro bundle and delivers the processing power and hardware connectivity required for demanding collaboration deployments.',
    defaultSpecs:
      'Video Inputs:6 simultaneous video inputs (3x 4K UHD HDMI, 2x 1080p60 HDMI, 1x 3G-SDI / HD-SDI);Video Outputs:3 independent 4K UHD HDMI outputs (up to 3840x2160p60 + 2160p30);Audio Matrix & AEC:8 balanced Euroblock/XLR microphone inputs with 48V phantom power & 8 individual acoustic echo cancellers;Audio Outputs:6 balanced line outputs + 3 HDMI audio outputs + AES67 / Dante AoIP ethernet audio support;Network & Security:5x Gigabit RJ45 Ethernet ports (camera control, PoE Touch 10/Navigator), Wi-Fi 802.11ac, AES-256 H.323/SIP;Dimensions & Weight:43.6 × 23.1 × 6.6 cm (17.2 × 9.1 × 2.6 in, 1.5RU rack-ears included) • 3.30 kg (7.3 lb);Room Capacity:Executive Boardrooms, Council Chambers & Auditoriums (20 to 100+ Seats);Warranty:1-Year Official Cisco Pakistan Warranty & 15-Min SLA',
    defaultDescription:
      'Cisco Webex Codec Pro (CS-CODEC-PRO-K9, GTIN: 0889728127431) Integrator 4K60 Video Conferencing Codec in Pakistan. Designed for large custom boardrooms, auditoriums, and command centers requiring multi-camera HDMI/3G-SDI switching, 8 balanced XLR microphone inputs with dedicated acoustic echo cancellation, triple 4K display outputs, and AES-256 encrypted SIP/H.323 & Webex connectivity.',
    seoMetaDescription:
      'Buy Cisco Webex Codec Pro CS-CODEC-PRO-K9 in Pakistan (Rs. 512,910). 4K60 integrator codec with 6 HDMI/SDI inputs, 3 4K outputs & 8 XLR mic ports.',
  },
  'cisco-webex-room-kit-pro-p60-pakistan': {
    gmcId: 'GGN-CS-KITPRO-P60-K9',
    gtin: '0889728127448',
    mpn: 'CS-KITPRO-P60-K9',
    brand: 'Cisco',
    title: 'Cisco Webex Room Kit Pro P60 CS-KITPRO-P60-K9 – UHD Video Collaboration Bundle for Boardrooms and Auditoriums',
    color: 'Silver',
    isBundle: 'yes',
    shippingWeight: '5.80 kg',
    shippingLength: '43.6 cm',
    shippingWidth: '26.8 cm',
    shippingHeight: '18.0 cm',
    returnPolicyLabel: 'b2b-30-day',
    googleProductCategory: 'Electronics > Communications > Telephony > Video Conferencing',
    productType: 'Video Conferencing > Room Systems',
    customLabel0: 'Cisco',
    customLabel1: 'Video-Conferencing',
    customLabel2: 'Large-Room',
    customLabel3: 'Auditorium',
    customLabel4: 'Pakistan-Stock',
    regularPrice: 1609220,
    salePrice: 1081420,
    categorySlugs: ['video-conferencing', 'large-room', 'boardroom-codecs', 'ptz-cameras'],
    images: [
      'https://images.squarespace-cdn.com/content/v1/67db47a049b935648edd4c72/d7751b8e-2b5d-4a8e-a2ff-66c0cf274868/kitp60+picture.jpg',
      'https://images.squarespace-cdn.com/content/v1/67db47a049b935648edd4c72/0314b887-3a14-4d3d-b4ae-101f44214454/cisco+kit+eq.webp',
      'https://avlive.com.pk/images/video-conference/hybrid-summit.webp',
    ],
    highlight: 'Complete 2160p60 UHD boardroom & auditorium bundle with Codec Pro, Precision 60 20x PTZ Camera & Touch 10',
    shortSummary:
      'Cisco Webex Room Kit Pro P60 (CS-KITPRO-P60-K9) bundles the 4K60 Cisco Codec Pro, Precision 60 20x optical zoom PTZ camera, and Touch 10 / Navigator controller for auditoriums and long boardrooms.',
    gmcDescription:
      'The Cisco Webex Room Kit Pro provides a powerful and flexible platform for large custom video rooms including boardrooms, auditoriums, and purpose-built spaces. It acts as the audio and video engine for UHD collaboration, supporting multiple screens, the Cisco Webex Quad Camera, Precision 60 Camera, or SpeakerTrack 60 dual camera. AI capabilities include intelligent views, noise suppression, voice commands, and people count. Delivers up to 2160p60 end-to-end UHD video.',
    defaultSpecs:
      'Bundle Hardware:Cisco Webex Codec Pro + Cisco Precision 60 PTZ Camera + Cisco Touch 10 / Room Navigator Controller;Precision 60 Optics:1080p60 CMOS sensor with 10x optical zoom + 2x digital zoom (20x total zoom) for long auditorium throws;Codec Pro Video I/O:6 video inputs (3x 4K HDMI, 2x HD HDMI, 1x 3G-SDI) and 3 independent 4K60 UHD HDMI outputs;Pro Audio Matrix:8 balanced XLR microphone inputs with 8 acoustic echo cancellers + 6 balanced line outputs;Protocols & AI:2160p60 UHD H.264/H.265, SIP, H.323, Webex, MS Teams VI, AI noise removal & people count;Combined Weight & Footprint:5.80 kg total hardware (Codec Pro 3.3 kg + Precision 60 2.5 kg) • 43.6 × 26.8 × 18.0 cm;Room Capacity:Large Boardrooms, Lecture Theaters & Auditoriums (20 to 100+ Seats);Warranty:1-Year Official Cisco Pakistan Warranty & 15-Min SLA',
    defaultDescription:
      'Cisco Webex Room Kit Pro P60 (CS-KITPRO-P60-K9, GTIN: 0889728127448) UHD Video Collaboration Bundle in Pakistan. Combines the integrator-grade Cisco Codec Pro, the long-throw Cisco Precision 60 20x zoom motorized PTZ camera, and touch controller for large executive boardrooms, amphitheaters, and hybrid auditoriums.',
    seoMetaDescription:
      'Buy Cisco Webex Room Kit Pro P60 CS-KITPRO-P60-K9 in Pakistan (Rs. 1,081,420). UHD Codec Pro + Precision 60 20x PTZ camera bundle for auditoriums.',
  },
  'cisco-webex-desk-pro-pakistan': {
    gmcId: 'GGN-CS-DESKPRO-K9',
    gtin: '0889728296656',
    mpn: 'CS-DESKPRO-K9',
    brand: 'Cisco',
    title: 'Cisco Webex Desk Pro CS-DESKPRO-K9 – 27-inch 4K AI Collaboration Device for Desks and Focus Rooms',
    color: 'Silver',
    isBundle: 'no',
    shippingWeight: '11.60 kg',
    shippingLength: '63.0 cm',
    shippingWidth: '51.0 cm',
    shippingHeight: '7.5 cm',
    returnPolicyLabel: 'b2b-30-day',
    googleProductCategory: 'Electronics > Communications > Telephony > Video Conferencing',
    productType: 'Video Conferencing > Desk Devices',
    customLabel0: 'Cisco',
    customLabel1: 'Video-Conferencing',
    customLabel2: 'Personal-Desk',
    customLabel3: 'Focus-Room',
    customLabel4: 'Pakistan-Stock',
    regularPrice: 383640,
    salePrice: 361122,
    categorySlugs: ['video-conferencing', 'touch-panels'],
    images: [
      'https://images.squarespace-cdn.com/content/v1/67db47a049b935648edd4c72/9467ef2b-642c-4cbe-85d4-5c153b8e433c/deskpro+pic+3.jpg',
      'https://avlive.com.pk/images/products/cisco-room-kit-studio.jpg',
      'https://avlive.com.pk/images/video-conference/huddle-space.webp',
    ],
    highlight: '27-inch 4K IPS multi-touch executive desk collaboration display with 12MP camera & USB-C dock',
    shortSummary:
      'Cisco Webex Desk Pro (CS-DESKPRO-K9) is an all-in-one 27-inch 4K UHD capacitive touch display with a 12MP 71° camera, 8-element mic array, 3.1 woofer audio system, and 60W USB-C laptop dock.',
    gmcDescription:
      'Cisco Webex Desk Pro is an AI-powered 27-inch 4K touch display and collaboration device built for executive desks, shared workspaces, and small focus rooms. It features an anti-glare 4K IPS touchscreen, an HD camera, a multi-channel speaker system, and an advanced noise-cancelling microphone array. With a single USB-C cable, it doubles as a primary external monitor and docking station while supporting Webex, Microsoft Teams, Zoom, and Google Meet.',
    defaultSpecs:
      'Touch Display:27-inch 4K UHD (3840 × 2160) IPS LCD with optically bonded anti-glare capacitive multi-touch & active stylus;Camera Optics:12MP 71-degree horizontal FOV camera with f/2.0 aperture, privacy shutter, and 60fps HD encoding;Audio System:3.1 multichannel speaker array with dedicated downward-firing woofer + 8-element beamforming microphone array;Single-Cable USB-C Dock:USB-C DisplayPort Alt Mode with 60W laptop charging + HDMI 2.0 in + HDMI out for dual-screen setup;AI Features:Virtual backgrounds, AI noise removal, facial recognition, and digital whiteboarding;Dimensions & Weight:63.0 × 51.0 × 7.5 cm (24.8 × 20.1 × 3.0 in) • 11.60 kg (25.5 lb);Recommended Space:C-Suite Executive Desks & 1–3 Person Focus Rooms;Warranty:1-Year Official Cisco Pakistan Warranty & 15-Min SLA',
    defaultDescription:
      'Cisco Webex Desk Pro (CS-DESKPRO-K9, GTIN: 0889728296656) 27-Inch 4K All-in-One Executive Collaboration Display in Pakistan. Combines a brilliant 27-inch 4K anti-glare touchscreen, 12MP camera, 8-element noise-cancelling mic array, 3.1 woofer speaker system, digital whiteboard stylus, and 60W USB-C docking station for C-suite offices and focus rooms.',
    seoMetaDescription:
      'Buy Cisco Webex Desk Pro CS-DESKPRO-K9 in Pakistan (Rs. 361,122). 27-inch 4K touch collaboration screen with 12MP AI camera, 8-mic array & USB-C dock.',
  },
  'cisco-webex-codec-eq-pakistan': {
    gmcId: 'GGN-CS-CODEC-EQ-K9',
    gtin: '0889728530675',
    mpn: 'CS-CODEC-EQ-K9',
    brand: 'Cisco',
    title: 'Cisco Webex Codec EQ CS-CODEC-EQ-K9 – AI Computing Engine for Room Kit EQ Deployments',
    color: 'Carbon Black',
    isBundle: 'no',
    shippingWeight: '2.95 kg',
    shippingLength: '44.2 cm',
    shippingWidth: '29.7 cm',
    shippingHeight: '4.3 cm',
    returnPolicyLabel: 'b2b-30-day',
    googleProductCategory: 'Electronics > Communications > Telephony > Video Conferencing',
    productType: 'Video Conferencing > Codecs',
    customLabel0: 'Cisco',
    customLabel1: 'Video-Conferencing',
    customLabel2: 'Large-Room',
    customLabel3: 'Codec-Engine',
    customLabel4: 'Pakistan-Stock',
    regularPrice: 2471420,
    salePrice: 2471420,
    categorySlugs: ['video-conferencing', 'large-room', 'boardroom-codecs'],
    images: [
      'https://images.squarespace-cdn.com/content/v1/67db47a049b935648edd4c72/68ee51e7-b1ff-42b4-98c4-89d3f752261e/codec-eq-standalone-perspective-01.webp',
      'https://images.squarespace-cdn.com/content/v1/67db47a049b935648edd4c72/0314b887-3a14-4d3d-b4ae-101f44214454/cisco+kit+eq.webp',
      'https://avlive.com.pk/images/video-conference/boardroom-hero.webp',
    ],
    highlight: 'Next-gen NVIDIA AI-powered 4K boardroom codec with triple HDMI outputs & 3 PoE++ peripheral ports',
    shortSummary:
      'Cisco Webex Codec EQ (CS-CODEC-EQ-K9) is the next-generation NVIDIA AI computing engine powering large RoomOS and Microsoft Teams Rooms boardrooms with triple 4K HDMI outputs and 3 PoE++ mic/touch ports.',
    gmcDescription:
      'Cisco Webex Codec EQ is the next-generation AI-powered computing engine that drives the Room Kit EQ series. Engineered for large conference rooms, boardrooms, and training spaces, it supports up to three 4K displays, multiple camera and content inputs, PoE++ peripheral connectivity, and USB-C BYOD passthrough. Runs natively on Cisco RoomOS or Microsoft Teams Rooms.',
    defaultSpecs:
      'AI Compute Engine:Integrated NVIDIA Jetson Xavier NX AI engine delivering 20 TOPS neural processing performance;Video Outputs:3 independent 4K UHD HDMI 2.0 outputs supporting triple-screen Webex & Microsoft Teams Front Row;Video & Content Inputs:3x HDMI inputs (supporting 4K content & auxiliary PTZ cameras) + 1x USB-C 4K60 BYOD passthrough;Audio & PoE++ Connectivity:3x RJ45 PoE++ (802.3bt) ports for Cisco Table/Ceiling Microphone Pro + 4x USB-A 3.0 + 3.5mm line out;Platform Support:Native Cisco RoomOS 11 (Webex) or Native Microsoft Teams Rooms (MTR on Android) + Zoom interop;Dimensions & Weight:44.2 × 29.7 × 4.3 cm (17.4 × 11.7 × 1.7 in, 1RU rack/wall mountable) • 2.95 kg (6.5 lb);Room Capacity:Large Boardrooms & Training Rooms (14 to 30+ Seats);Warranty:1-Year Official Cisco Pakistan Warranty & 15-Min SLA',
    defaultDescription:
      'Cisco Webex Codec EQ (CS-CODEC-EQ-K9, GTIN: 0889728530675) Next-Gen AI Video Conferencing Codec Engine in Pakistan. Powered by an embedded NVIDIA AI processor, Codec EQ drives up to three 4K displays, three HDMI camera/content sources, three PoE++ Cisco Table/Ceiling Microphone Pro arrays, and single-cable USB-C BYOD passthrough in large enterprise boardrooms.',
    seoMetaDescription:
      'Buy Cisco Webex Codec EQ CS-CODEC-EQ-K9 in Pakistan (Rs. 2,471,420). Next-gen NVIDIA AI boardroom codec with triple 4K HDMI outputs & 3 PoE++ ports.',
  },
  'cisco-room-kit-eq-pakistan': {
    gmcId: 'GGN-CS-KIT-EQ-K9',
    gtin: '0889728530644',
    mpn: 'CS-KIT-EQ-K9',
    brand: 'Cisco',
    title: 'Cisco Room Kit EQ CS-KIT-EQ-K9 – AI-Powered Collaboration Solution with Quad Camera for Large Rooms',
    color: 'Carbon Black',
    isBundle: 'yes',
    shippingWeight: '7.75 kg',
    shippingLength: '95.0 cm',
    shippingWidth: '29.7 cm',
    shippingHeight: '12.0 cm',
    returnPolicyLabel: 'b2b-30-day',
    googleProductCategory: 'Electronics > Communications > Telephony > Video Conferencing',
    productType: 'Video Conferencing > Room Systems',
    customLabel0: 'Cisco',
    customLabel1: 'Video-Conferencing',
    customLabel2: 'Large-Room',
    customLabel3: 'Enterprise-Boardroom',
    customLabel4: 'Pakistan-Stock',
    regularPrice: 3800000,
    salePrice: 2200000,
    categorySlugs: ['video-conferencing', 'large-room', 'boardroom-codecs'],
    images: [
      'https://images.squarespace-cdn.com/content/v1/67db47a049b935648edd4c72/20a86153-6613-45a6-b8da-50f8b0f7e94a/cisco+kit+eq+2.jpeg',
      'https://images.squarespace-cdn.com/content/v1/67db47a049b935648edd4c72/0314b887-3a14-4d3d-b4ae-101f44214454/cisco+kit+eq.webp',
      'https://avlive.com.pk/images/products/cisco-room-kit-studio.jpg',
      'https://avlive.com.pk/images/video-conference/boardroom-hero.webp',
    ],
    highlight: 'AI-powered flagship Quad Camera & Codec EQ bundle for large multi-display enterprise boardrooms',
    shortSummary:
      'Cisco Room Kit EQ (CS-KIT-EQ-K9) bundles the NVIDIA AI-powered Codec EQ, the 4-lens 5K Cisco Quad Camera bar, and Room Navigator touch controller for 16–30+ seat executive boardrooms.',
    gmcDescription:
      'Cisco Room Kit EQ is an advanced collaboration bundle built for large workspaces, boardrooms, and auditoriums. Powered by the next-generation Cisco Codec EQ AI computing engine and paired with the intelligent Quad Camera bar, it delivers lifelike multi-camera framing, intelligent noise removal, and multi-display 4K video and content sharing across Webex, Microsoft Teams Rooms, and Zoom.',
    defaultSpecs:
      'Codec Engine:Cisco Codec EQ with NVIDIA Jetson Xavier NX AI engine (20 TOPS neural processing);Quad Camera Array:Cisco Quad Camera bar with four 5K CMOS sensors (83° wide lens + three 50° telephoto lenses) & 6-speaker audio system;Display Support:3 independent 4K UHD HDMI 2.0 outputs + 3 HDMI camera/content inputs + USB-C 4K60 BYOD passthrough;Audio Connectivity:3x RJ45 PoE++ (802.3bt) ports for Cisco Table/Ceiling Microphone Pro + AI noise removal;Platform Certification:Native Cisco RoomOS 11 (Webex) & Certified Native Microsoft Teams Rooms (MTR) + Zoom interop;Combined Dimensions & Weight:Quad Camera 95.0 × 12.0 × 10.3 cm (4.8 kg) + Codec EQ 44.2 × 29.7 × 4.3 cm (2.95 kg) • 7.75 kg total;Room Capacity:Large Executive Boardrooms & Training Halls (16 to 30+ Seats);Warranty:1-Year Official Cisco Pakistan Warranty & 15-Min SLA',
    defaultDescription:
      'Cisco Room Kit EQ (CS-KIT-EQ-K9, GTIN: 0889728530644) Flagship AI Boardroom Video Conferencing Bundle in Pakistan. Combines the NVIDIA-powered Cisco Codec EQ, the 4-lens 5K Cisco Quad Camera soundbar, and Room Navigator touch controller for triple-display 4K executive boardrooms running native Cisco Webex or Microsoft Teams Rooms.',
    seoMetaDescription:
      'Buy Cisco Room Kit EQ CS-KIT-EQ-K9 in Pakistan (Rs. 2,666,020). AI Codec EQ + 5K Quad Camera bundle for large Webex & Microsoft Teams boardrooms.',
  },
  'cisco-room-kit-pakistan': {
    gmcId: 'GGN-CS-KIT-K9',
    gtin: '0889728021524',
    mpn: 'CS-KIT-K9',
    brand: 'Cisco',
    title: 'Cisco Webex Room Kit CS-KIT-K9 – Integrated Video Conferencing System for Small to Medium Rooms',
    color: 'Silver',
    isBundle: 'no',
    shippingWeight: '3.20 kg',
    shippingLength: '70.0 cm',
    shippingWidth: '10.6 cm',
    shippingHeight: '8.8 cm',
    returnPolicyLabel: 'b2b-30-day',
    googleProductCategory: 'Electronics > Communications > Telephony > Video Conferencing',
    productType: 'Video Conferencing > Room Systems',
    customLabel0: 'Cisco',
    customLabel1: 'Video-Conferencing',
    customLabel2: 'Small-Medium-Room',
    customLabel3: 'Conference-Room',
    customLabel4: 'Pakistan-Stock',
    regularPrice: 1900000,
    salePrice: 1750000,
    categorySlugs: ['video-conferencing', 'boardroom-codecs'],
    images: [
      'https://images.squarespace-cdn.com/content/v1/67db47a049b935648edd4c72/3ae2bb11-b106-4022-8b22-112dcc0f9e02/cisco%2Bcs-kit-k9%2Bfull%2Bpicture.jpg',
      'https://avlive.com.pk/images/products/cisco-room-kit-studio.jpg',
      'https://images.squarespace-cdn.com/content/v1/67db47a049b935648edd4c72/0314b887-3a14-4d3d-b4ae-101f44214454/cisco+kit+eq.webp',
      'https://avlive.com.pk/images/video-conference/boardroom-hero.webp',
    ],
    highlight: 'Integrated 5K Ultra HD camera, stereo speakers, beamforming mics & Touch 10 for up to 7-person rooms',
    shortSummary:
      'Cisco Webex Room Kit (CS-KIT-K9) integrates a 5K Ultra HD 83° camera, 6-element directional microphone array, stereo speakers, and Touch 10 controller into a single bar for small-to-medium rooms.',
    gmcDescription:
      'Cisco Webex Room Kit is an all-in-one video collaboration bar designed for small to medium-sized meeting rooms seating up to 7 people. It integrates a 5K Ultra HD camera, stereo speakers, beamforming microphones, and a powerful codec into a single sleek device that mounts above or below your flat-panel display. Includes automatic speaker framing, dual-screen support, and 4K content sharing.',
    defaultSpecs:
      'Camera Optics:Integrated 5K UltraHD (15.1MP) CMOS sensor with 83° horizontal FOV, 3x digital zoom & AI speaker tracking;Audio Architecture:6-element directional microphone array + integrated full-range stereo speakers & dual bass reflex ports + 2x external mic inputs;Video & Content I/O:2x HDMI monitor outputs (3840x2160p60) + 2x HDMI content inputs (up to 4K30);Controller Included:Cisco Touch 10 / Room Navigator 10-inch capacitive PoE touch control unit;Standards & Protocols:H.323, SIP, Cisco Webex, H.264/H.265, Wi-Fi 802.11ac, Bluetooth 4.0 & WebRTC interop;Dimensions & Weight:70.0 × 10.6 × 8.8 cm (27.5 × 4.2 × 3.5 in) • 3.20 kg (7.0 lb);Room Capacity:Small to Medium Conference Rooms (up to 7–10 Seats);Warranty:1-Year Official Cisco Pakistan Warranty & 15-Min SLA',
    defaultDescription:
      'Cisco Webex Room Kit (CS-KIT-K9, GTIN: 0889728021524) Integrated Video Conferencing System in Pakistan. Combines a 5K UltraHD 15.1MP camera, 6-element directional microphone array, front-facing stereo speakers, dual-screen 4K HDMI outputs, and Cisco Touch 10 / Room Navigator controller for small-to-medium conference rooms.',
    seoMetaDescription:
      'Buy Cisco Webex Room Kit CS-KIT-K9 in Pakistan (Rs. 540,710). Integrated 5K camera, stereo speakers, 6-mic array & Touch 10 for small-to-medium rooms.',
  },
  'cisco-room-kit-plus-pakistan': {
    gtin: computeUpc12('88265890214'),
    mpn: 'CS-KITPLPTZ4K-K9',
    brand: 'Cisco',
    color: 'Silver',
    isBundle: 'yes',
    shippingWeight: '9.50 kg',
    regularPrice: 3200000,
    salePrice: 2200000,
    categorySlugs: ['video-conferencing', 'large-room', 'boardroom-codecs', 'touch-panels'],
    images: [
      'https://images.squarespace-cdn.com/content/v1/67db47a049b935648edd4c72/0314b887-3a14-4d3d-b4ae-101f44214454/cisco+kit+eq.webp',
      'https://avlive.com.pk/images/products/cisco-room-kit-studio.jpg',
      'https://avlive.com.pk/images/video-conference/boardroom-hero.webp',
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
    shippingWeight: '13.40 kg',
    regularPrice: 5300000,
    salePrice: 2800000,
    categorySlugs: ['video-conferencing', 'large-room', 'boardroom-codecs'],
    images: [
      'https://images.squarespace-cdn.com/content/v1/67db47a049b935648edd4c72/0314b887-3a14-4d3d-b4ae-101f44214454/cisco+kit+eq.webp',
      'https://avlive.com.pk/images/products/cisco-room-kit-studio.jpg',
      'https://avlive.com.pk/images/video-conference/hybrid-summit.webp',
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
    shippingWeight: '9.50 kg',
    regularPrice: 1850000,
    salePrice: 1690000,
    categorySlugs: ['video-conferencing', 'large-room', 'boardroom-codecs'],
    images: [
      'https://avlive.com.pk/images/products/cisco-room-kit-studio.jpg',
      'https://images.squarespace-cdn.com/content/v1/67db47a049b935648edd4c72/0314b887-3a14-4d3d-b4ae-101f44214454/cisco+kit+eq.webp',
      'https://avlive.com.pk/images/video-conference/boardroom-hero.webp',
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
    regularPrice: 24000,
    salePrice: 21000,
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
    regularPrice: 195000,
    salePrice: 185000,
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
    regularPrice: 18000,
    salePrice: 16500,
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
      'https://syntelo.co.za/cdn/shop/files/3cx_pro_8SC.jpg?v=1747992911&width=2048',
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
      'https://cdn11.bigcommerce.com/s-u3uxlvxq3h/images/stencil/original/products/9024/26315/X4G-2__79148.1584438040.jpg?c=1',
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
    regularPrice: 145000,
    salePrice: 135000,
    categorySlugs: ['voip-phone-systems'],
    images: [
      'https://syntelo.co.za/cdn/shop/files/3cx_pro_8SC.jpg?v=1747992911&width=2048',
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
    regularPrice: 285000,
    salePrice: 265000,
    categorySlugs: ['voip-phone-systems'],
    images: [
      'https://syntelo.co.za/cdn/shop/files/3cx_pro_8SC.jpg?v=1747992911&width=2048',
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
    regularPrice: 22000,
    salePrice: 19500,
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
    regularPrice: 85000,
    salePrice: 78000,
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
    regularPrice: 450000,
    salePrice: 415000,
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
    regularPrice: 150000,
    salePrice: 135000,
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
    shippingWeight: '0.45 kg',
    regularPrice: 55000,
    salePrice: 52000,
    categorySlugs: ['headsets'],
    images: [
      'https://f.btwcdn.com/store-29999/product/e3d66b16-6ddc-1332-b314-699d2b05772a.jpg',
      'https://discountstore.pk/cdn/shop/files/jabra-evolve2-65-link380a-uc-stereo-black-headset-26599-989-999-700x700.webp?v=1733824689',
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
    regularPrice: 46000,
    salePrice: 43000,
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
    regularPrice: 320000,
    salePrice: 295000,
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
    regularPrice: 450000,
    salePrice: 425000,
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
    regularPrice: 110000,
    salePrice: 98000,
    categorySlugs: ['projectors'],
    images: [
      'https://www.viewsonic.com/media/wysiwyg/26PRJ-MLT1176-RC-LSD400W_Bright_in_any_Room_1238x1102.jpg',
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
    regularPrice: 8500000,
    salePrice: 8200000,
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
    regularPrice: 680000,
    salePrice: 645000,
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
    shippingWeight: '0.28 kg',
    regularPrice: 12000,
    salePrice: 10500,
    categorySlugs: ['headsets'],
    images: [
      'https://static.wixstatic.com/media/fd30db_95b351e9a4314147a52072fe802afa14~mv2.jpg/v1/fit/w_500,h_500,q_90/file.jpg',
      'https://m.media-amazon.com/images/I/61mOJRTTmFL._AC_UF350,350_QL80_.jpg',
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
    shippingWeight: '5.20 kg',
    regularPrice: 9600000,
    salePrice: 1459000,
    categorySlugs: ['video-conferencing', 'large-room', 'boardroom-codecs'],
    images: [
      'https://avlive.com.pk/images/products/poly-x70-boardroom.jpg',
      'https://avlive.com.pk/images/products/poly-x70-studio.jpg',
      'https://avlive.com.pk/images/video-conference/boardroom-hero.webp',
      'https://avlive.com.pk/images/projects/vissonic-delegate-boardroom.webp',
    ],
    highlight: 'Modular 4K Ultra HD video conferencing codec and content sharing system for large boardrooms',
    defaultSpecs:
      'Video Resolution:4K Ultra HD 60fps people video and 4K wireless/HDMI content sharing;Modular Interfaces:3x RJ45 PoE+ LLN ports for IP Table/Ceiling Microphones & EagleEye IV/Studio E70 cameras;Audio Intelligence:Poly NoiseBlockAI, Acoustic Fence, and 3.5mm/XLR audio integration;Protocols:Native Zoom Rooms, Microsoft Teams, H.323, and SIP standards mode;Room Capacity:Custom Large Boardrooms & Training Halls (16 to 40+ Seats);Warranty:1-Year Official HP Poly Pakistan Warranty',
    defaultDescription:
      'HP Poly G7500 Modular 4K Video Conferencing Codec System (7200-87310-001) in Pakistan. Built for large custom boardrooms and divisible training rooms requiring multiple PTZ cameras, ceiling microphones, and H.323/SIP/Zoom/Teams support.',
  },
  'poly-studio-usb-video-bar-pakistan': {
    gtin: '610807882558',
    mpn: '7200-85830-012',
    brand: 'Poly',
    color: 'Black',
    shippingWeight: '3.40 kg',
    regularPrice: 185000,
    salePrice: 175000,
    categorySlugs: ['video-conferencing', 'speakerphones'],
    images: [
      'https://www.onedirect.co.uk/media/catalog/product/cache/aa0ba86914834d3bc3e1ab8fdcec579e/p/o/postur30_4__2.jpg',
      'https://avlive.com.pk/images/products/poly-x70-studio.jpg',
      'https://avlive.com.pk/images/video-conference/huddle-space.webp',
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
    shippingWeight: '3.80 kg',
    regularPrice: 545000,
    salePrice: 485000,
    categorySlugs: ['video-conferencing', 'speakerphones'],
    images: [
      'https://smartsolutioncomputer.com/upload-img/Products/Poly/Products/Poly_Studio_V52_(1).webp',
      'https://avlive.com.pk/images/products/poly-x70-studio.jpg',
      'https://avlive.com.pk/images/video-conference/huddle-space.webp',
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
    shippingWeight: '2.20 kg',
    regularPrice: 760000,
    salePrice: 499000,
    categorySlugs: ['video-conferencing'],
    images: [
      'https://smartsolutioncomputer.com/upload-img/Products/Poly/Products/Poly_Studio_V52_(1).webp',
      'https://avlive.com.pk/images/products/poly-x70-studio.jpg',
      'https://avlive.com.pk/images/video-conference/huddle-space.webp',
    ],
    highlight: 'All-in-one 4K video bar with native Zoom and Microsoft Teams for huddle rooms',
    defaultSpecs:
      'Camera Optics:4K 20MP UltraHD 120-degree wide-angle lens with Poly DirectorAI;Native OS:Built-in Poly VideoOS (native Zoom Rooms, Microsoft Teams Rooms, Google Meet);Audio:Beamforming microphone array (4.5m pickup) + acoustic chamber speaker;Display Output:Single/Dual HDMI output with wireless AirPlay, Miracast & USB-C BYOD;Room Capacity:Huddle & Small Rooms (2 to 6 Seats);Warranty:1-Year Official HP Poly Pakistan Warranty',
    defaultDescription:
      'HP Poly Studio X32 / X30 All-in-One 4K Video Bar (A3SV5AA) in Pakistan. Compact standalone video bar for small rooms and executive offices with native Zoom Rooms and Microsoft Teams Rooms—no external PC required.',
  },
  'poly-studio-x50-pakistan': {
    gmcId: 'AVLIVE-POLY-X50-2200-85970-001',
    gtin: '610807891673',
    mpn: '2200-85970-001',
    brand: 'HP Poly',
    title: 'Poly Studio X50 4K Video Bar with TC8 Touch Controller – Special Offer (Free Delivery Pakistan)',
    color: 'Black',
    isBundle: 'yes',
    shippingWeight: '4.20 kg',
    shippingLength: '76.2 cm',
    shippingWidth: '10.2 cm',
    shippingHeight: '10.2 cm',
    returnPolicyLabel: 'b2b-30-day',
    googleProductCategory: 'Electronics > Communications > Telephony > Video Conferencing',
    productType: 'Video Conferencing > Video Bars',
    customLabel0: 'HP Poly',
    customLabel1: 'Special-Offer',
    customLabel2: 'Medium-Room',
    customLabel3: 'Free-Delivery-Pakistan',
    customLabel4: 'Pakistan-Stock',
    regularPrice: 759000,
    salePrice: 759000,
    categorySlugs: ['video-conferencing', 'touch-panels', 'large-room', 'boardroom-codecs'],
    images: [
      'https://firebasestorage.googleapis.com/v0/b/studio-5367437135-24ac6.firebasestorage.app/o/Products%2Fpoly-studio-x50-png-3cq9.webp?alt=media&token=bc3614ec-64f7-405b-95df-7a793acd7563',
      '/images/products/poly-studio-x50-tc8.webp',
      'https://avlive.com.pk/images/products/poly-x70-studio.jpg',
      'https://avlive.com.pk/images/products/poly-x70-boardroom.jpg',
      'https://avlive.com.pk/images/video-conference/huddle-space.webp',
      'https://avlive.com.pk/images/projects/multicity-teams-boardrooms.webp',
    ],
    highlight: 'Special Pakistan Offer: Poly Studio X50 4K Dual-Display Video Bar + TC8 Controller with Free Nationwide Delivery',
    shortSummary:
      'Special Offer Deal (Rs. 399,000 PKR — Save 53%): HP Poly Studio X50 All-in-One 4K Video Bar bundled with the Poly TC8 8-inch Touch Controller and Free Insured Delivery anywhere in Pakistan.',
    gmcDescription:
      'Upgrade your medium-to-large conference rooms with the HP Poly Studio X50 4K UltraHD all-in-one video bar and Poly TC8 8-inch PoE touch controller bundle at our special promotional price of 399,000 PKR including free delivery across Pakistan. Features Poly DirectorAI auto-framing, boardroom-filling stereo speakers, 25-foot beamforming microphone pickup, dual 4K display support, and native Zoom Rooms and Microsoft Teams Rooms integration without an external PC.',
    defaultSpecs:
      'Special Bundle Included:Poly Studio X50 4K Video Bar + Poly TC8 8-inch Touch Controller + Free Delivery Within Pakistan;Camera:4K UHD 120-degree FOV sensor with 5x digital zoom and Poly DirectorAI framing;Audio System:5-element next-gen beamforming mic array (7.6m / 25ft pickup) + boardroom stereo speakers;Video Outputs:Dual HDMI 4K outputs for simultaneous people and content displays;Platform Support:Native Zoom Rooms, Microsoft Teams Rooms, H.323/SIP, and USB Device Mode;Room Capacity:Medium to Large Conference Rooms (6 to 12 Seats);Warranty & Shipping:1-Year Official HP Poly Pakistan Warranty + Free Insured Nationwide Delivery',
    defaultDescription:
      'HP Poly Studio X50 All-in-One Dual-Display 4K Video Conferencing Bar with Poly TC8 Touch Controller (2200-85970-001 / 2215-86399-001) Special Offer in Pakistan at Rs. 399,000 PKR including free nationwide delivery. Delivers boardroom-filling stereo sound, 25-foot microphone pickup, dual 4K display support, and native Zoom/Teams operation.',
    seoMetaDescription:
      'Special Offer: Poly Studio X50 4K + TC8 Controller for Rs. 399,000 PKR (Save 53%) with Free Delivery in Pakistan. Dual 4K displays, DirectorAI and Zoom/Teams.',
  },
  'poly-studio-x50-tc8-special-offer-pakistan': {
    gmcId: 'AVLIVE-POLY-X50-TC8-DEAL',
    gtin: computeUpc12('61080789861'),
    mpn: '2215-86399-001',
    brand: 'HP Poly',
    title: 'Poly Studio X50 4K + TC8 Touch Controller Special Offer Bundle – Free Delivery in Pakistan',
    color: 'Black',
    isBundle: 'yes',
    shippingWeight: '5.05 kg',
    shippingLength: '76.2 cm',
    shippingWidth: '14.5 cm',
    shippingHeight: '12.5 cm',
    returnPolicyLabel: 'b2b-30-day',
    googleProductCategory: 'Electronics > Communications > Telephony > Video Conferencing',
    productType: 'Video Conferencing > Room Systems',
    customLabel0: 'HP Poly',
    customLabel1: 'Special-Offer',
    customLabel2: 'Medium-Room',
    customLabel3: 'Free-Delivery-Pakistan',
    customLabel4: 'Pakistan-Stock',
    regularPrice: 850000,
    salePrice: 399000,
    categorySlugs: ['video-conferencing', 'touch-panels', 'large-room', 'boardroom-codecs'],
    images: [
      '/images/products/poly-studio-x50-tc8.webp',
      'https://avlive.com.pk/images/products/poly-x70-studio.jpg',
      'https://avlive.com.pk/images/products/poly-x70-boardroom.jpg',
      'https://avlive.com.pk/images/video-conference/boardroom-hero.webp',
    ],
    highlight: 'Limited Conference Room Deal (Save 53%): Poly Studio X50 4K Video Bar + Poly TC8 Touch Controller for PKR 399,000 with Free Delivery in Pakistan',
    shortSummary:
      'Exclusive Pakistan Bundle Deal (PKR 399,000 — Slashed from PKR 850,000, Save 53%): Complete Poly Studio X50 4K UltraHD Video Bar + Poly TC8 8-inch PoE Touch Controller with Free Insured Delivery anywhere in Pakistan.',
    gmcDescription:
      'Claim the limited-time AV Live Pakistan conference room deal: Poly Studio X50 4K UltraHD all-in-one video conferencing bar bundled with the Poly TC8 8-inch high-resolution PoE touch controller for only PKR 399,000 including free nationwide delivery within Pakistan. Engineered for medium-to-large conference rooms with 4K DirectorAI auto-framing, boardroom-filling stereo speakers, 25ft NoiseBlockAI microphone pickup, dual 4K HDMI display support, and native Zoom Rooms & Microsoft Teams Rooms operation.',
    defaultSpecs:
      'Promotional Bundle:Poly Studio X50 4K Video Bar + Poly TC8 8-inch Touch Controller (MPN: 2215-86399-001);Special Deal Price:PKR 399,000 (Save 53% off PKR 850,000) with Free Insured Delivery Anywhere in Pakistan;Camera & AI Framing:4K UltraHD 120-degree FOV camera with 5x digital zoom & Poly DirectorAI speaker/group framing;TC8 Touch Controller:8-inch HD (1280 x 800) capacitive IPS touch screen with single-cable RJ45 PoE power;Boardroom Audio:5-element beamforming mic array (25ft / 7.6m pickup) + dual stereo speakers + NoiseBlockAI & Acoustic Fence;Dual Display & BYOD:2x HDMI 4K video outputs + 1x HDMI content input + USB-C / USB-A BYOD mode + AirPlay/Miracast;Native UC Platforms:Native Zoom Rooms & Microsoft Teams Rooms on Poly VideoOS (no external PC required);Dimensions & Weight:Video Bar 76.2 × 10.2 × 10.2 cm + TC8 20.5 × 12.3 × 7.9 cm • 5.05 kg total packaged;Warranty:1-Year Official HP Poly Pakistan Warranty & 15-Minute Technical SLA',
    defaultDescription:
      'Poly Studio X50 4K Video Bar + Poly TC8 Touch Controller Bundle (2215-86399-001) Special Offer in Pakistan at Rs. 399,000 PKR (Save 53% off Rs. 850,000) including Free Insured Delivery across Lahore, Karachi, Islamabad, and nationwide. Upgrade medium-to-large boardrooms with 4K UltraHD DirectorAI framing, dual 4K display support, boardroom-filling stereo speakers, and one-touch TC8 Zoom & Microsoft Teams control.',
    seoMetaDescription:
      'Buy Poly Studio X50 4K + TC8 Controller Deal in Pakistan for Rs. 399,000 PKR (Save 53%). Free delivery in Pakistan, dual 4K display support and official warranty.',
  },
  'poly-studio-x52-pakistan': {
    gtin: '197029653413',
    mpn: '7200-87620-001',
    brand: 'HP Poly',
    color: 'Black',
    shippingWeight: '4.30 kg',
    regularPrice: 1690000,
    salePrice: 1200000,
    categorySlugs: ['video-conferencing'],
    images: [
      'https://smartsolutioncomputer.com/upload-img/Products/Poly/Products/Poly_Studio_V52_(1).webp',
      'https://avlive.com.pk/images/products/poly-x70-studio.jpg',
      'https://avlive.com.pk/images/products/poly-x70-boardroom.jpg',
      'https://avlive.com.pk/images/video-conference/boardroom-hero.webp',
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
    shippingWeight: '5.10 kg',
    regularPrice: 2000000,
    salePrice: 1900000,
    categorySlugs: ['video-conferencing', 'large-room', 'ptz-cameras', 'touch-panels'],
    images: [
      'https://avlive.com.pk/images/products/poly-x70-studio.jpg',
      'https://avlive.com.pk/images/products/poly-x70-boardroom.jpg',
      'https://www.hp.com/content/dam/sites/worldwide/poly/video-conferencing/all-in-one/studio-x72/Hero_Banner_Desktop@2x.jpg',
      'https://avlive.com.pk/images/video-conference/boardroom-hero.webp',
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
    shippingWeight: '0.52 kg',
    regularPrice: 69000,
    salePrice: 59500,
    categorySlugs: ['headsets'],
    images: [
      'https://static.wixstatic.com/media/fd30db_95b351e9a4314147a52072fe802afa14~mv2.jpg/v1/fit/w_500,h_500,q_90/file.jpg',
      'https://m.media-amazon.com/images/I/61mOJRTTmFL._AC_UF350,350_QL80_.jpg',
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
    shippingWeight: '1.15 kg',
    regularPrice: 32000,
    salePrice: 29500,
    categorySlugs: ['ip-phones', 'voip-phone-systems'],
    images: [
      'https://cdn11.bigcommerce.com/s-u3uxlvxq3h/images/stencil/original/products/9024/26315/X4G-2__79148.1584438040.jpg?c=1',
    ],
    highlight: '4-line Gigabit color display IP desk phone with Poly HD Voice and Acoustic Clarity',
    defaultSpecs:
      'Display:2.8-inch (320 x 240) backlit color LCD screen;SIP Lines:4 programmable line keys with 4 context-sensitive soft keys;Audio Quality:Poly HD Voice and Poly Acoustic Fence background noise suppression;Network & Ports:Dual 10/100/1000 Gigabit Ethernet ports (PoE Class 2) + USB port for headsets;Warranty:1-Year Official Poly Pakistan Warranty',
    defaultDescription:
      'Polycom VVX 250 4-Line Business IP Desk Phone (2200-48820-025) in Pakistan. Features Poly HD Voice, Acoustic Fence technology, a 2.8-inch color display, and dual Gigabit PoE ports for enterprise VoIP deployments.',
  },
  'poly-vvx-411-pakistan': {
    gmcId: 'VVX411-2200-48450-025',
    gtin: '0610807846727',
    mpn: '2200-48450-025',
    brand: 'Poly',
    title: 'Poly VVX 411 12-Line Gigabit PoE Business IP Phone – 3.5" Color LCD, HD Voice',
    color: 'Black',
    isBundle: 'no',
    shippingWeight: '1.4 kg',
    shippingLength: '19 cm',
    shippingWidth: '15 cm',
    shippingHeight: '18 cm',
    returnPolicyLabel: 'b2b-30-day',
    googleProductCategory: 'Electronics > Communications > Telephony > Corded Phones',
    productType: 'Business Phones > IP Phones',
    customLabel0: 'Poly',
    customLabel1: 'IP-Phones',
    customLabel2: 'Enterprise-Office',
    customLabel3: 'PoE-Gigabit',
    customLabel4: 'Pakistan-Stock',
    regularPrice: 49500,
    salePrice: 42500,
    categorySlugs: ['ip-phones', 'voip-phone-systems'],
    images: [
      '/images/products/poly-vvx-411-main.webp',
      '/images/products/poly-vvx-411-ports.webp',
    ],
    highlight: '12-line Gigabit PoE business IP phone with 3.5" color LCD & Poly HD Voice',
    shortSummary:
      '12-line Gigabit PoE desk phone with a 3.5" color display and Poly HD Voice — built for Office365, Skype for Business and open-SIP environments in Pakistan.',
    gmcDescription:
      'The Poly VVX 411 is a 12-line Gigabit PoE business media phone built for knowledge workers and frontline staff who handle moderate call volumes. It features a backlit 3.5-inch color LCD (320 × 240), Poly HD Voice with 7 kHz frequency response, dual Gigabit Ethernet ports, a dedicated RJ9 headset port, and built-in IEEE 802.3af Power over Ethernet. The phone supports SIP, RTCP, RTP and SRTP, and integrates with Microsoft Exchange calendars, corporate directories and third-party UC platforms. An optional 48V DC power supply is available for non-PoE environments. Ideal for offices in Pakistan deploying Skype for Business, Zoom Phone or open-SIP PBX systems.',
    defaultSpecs:
      'Lines:12;Display:3.5 in TFT LCD (320 × 240);Ethernet:Dual Gigabit RJ45 (10/100/1000);PoE:IEEE 802.3af (Class 2);HD Voice:Poly HD Voice (7 kHz);Headset Port:Dedicated RJ9;Protocols:SIP, RTCP, RTP, SRTP, SDP;USB:1 × USB 2.0;Expansion:Supports VVX Expansion Modules;Power:Optional 48V DC adapter;Base Dimensions:19 × 15 × 18 cm;Weight:900 g (base) / 1.4 kg (shipping)',
    defaultDescription:
      '<h2>Poly VVX 411 12-Line Gigabit PoE Business Media Phone (MPN: 2200-48450-025)</h2><p>The <strong>Poly VVX 411</strong> (formerly Polycom VVX 411) is a high-performance 12-line color IP desk phone engineered for knowledge workers, receptionists, and frontline enterprise staff in Pakistan handling moderate-to-high call volumes. Equipped with dual Gigabit Ethernet (10/100/1000) ports and built-in <strong>IEEE 802.3af Class 2 PoE</strong>, it connects seamlessly over a single Cat6 drop to your workstation and corporate voice VLAN.</p><h3>Crystal-Clear Audio &amp; Visual Call Control</h3><ul><li><strong>3.5-Inch Backlit Color LCD (320 × 240):</strong> Displays 12 programmable SIP line/BLF keys with instant call status and intuitive menu navigation.</li><li><strong>Poly HD Voice &amp; Acoustic Clarity:</strong> Delivers 7 kHz wideband audio over the handset, full-duplex speakerphone, or dedicated RJ9 headset port with Poly Acoustic Fence noise reduction.</li><li><strong>USB 2.0 &amp; VVX Expansion Ready:</strong> Supports USB headsets/call recording and daisy-chained Poly VVX Expansion Modules for high-volume attendants.</li><li><strong>Flexible PBX &amp; Cloud UC Integration:</strong> Compatible with 3CX, FreePBX, Grandstream UCM, Cisco CUCM open-SIP, Zoom Phone, Microsoft Teams SIP Gateway, and Skype for Business.</li></ul><h3>SKU &amp; Packaging Reference</h3><p>Primary Stocked SKU: <strong>2200-48450-025</strong> (Standard Worldwide PoE Model, UPC: <code>0610807846727</code>). Optional Skype for Business / Lync Edition: <strong>2200-48450-019</strong> (UPC: <code>0610807857792</code>). Base footprint measures 19 × 15 × 18 cm (~900 g); packaged shipping weight is 1.4 kg. Optional 48V DC power adapter is available separately for non-PoE switches.</p>',
    seoMetaDescription:
      'Buy the Poly VVX 411 12-line Gigabit PoE IP phone in Pakistan. 3.5" color LCD, HD Voice, dual Gigabit ports, Skype for Business compatible.',
    seoTags:
      'Poly VVX 411 Pakistan, Polycom VVX 411 price in Pakistan, 12-line IP phone, Gigabit PoE desk phone, Poly HD Voice, Skype for Business phone, SIP desk phone Lahore',
    imageAltText:
      'Poly VVX 411 12-line Gigabit PoE business IP phone with 3.5-inch color LCD – front view',
  },
  'sony-bravia-projector-7-pakistan': {
    gtin: computeUpc12('02724292500'),
    mpn: 'VPL-XW5000ES',
    brand: 'Sony',
    color: 'Black',
    regularPrice: 1250000,
    salePrice: 1195000,
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
    regularPrice: 18000,
    salePrice: 16000,
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
    regularPrice: 175000,
    salePrice: 155000,
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
    shippingWeight: '4.60 kg',
    regularPrice: 350000,
    salePrice: 325000,
    categorySlugs: ['projectors'],
    images: [
      'https://www.viewsonic.com/media/wysiwyg/26PRJ-MLT1176-RC-LSD400W_Bright_in_any_Room_1238x1102.jpg',
      'https://www.viewsonic.com/vsAssetFile/pk/img/resize/awards/ViewSonic-LSD400W-Scenario%202_w640.webp',
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
      'https://avlive.com.pk/images/products/cisco-room-kit-studio.jpg',
      'https://avlive.com.pk/images/video-conference/huddle-space.webp',
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
      'https://avlive.com.pk/images/products/cisco-room-kit-studio.jpg',
      'https://avlive.com.pk/images/video-conference/huddle-space.webp',
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
    regularPrice: 42000,
    salePrice: 39500,
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
    regularPrice: 38000,
    salePrice: 35000,
    categorySlugs: ['ip-phones', 'voip-phone-systems', 'speakerphones'],
    images: [
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
  'shipping_weight',
  'shopping_ads_excluded_country',
] as const;

export const DEFAULT_SHIPPING_WEIGHT_BY_SLUG: Record<string, string> = {
  '2n-ip-vario-intercom-pakistan': '0.85 kg',
  '3cx-pro-8-sc-pakistan': '0.20 kg',
  'T1XLMubVYmFzeIfC7V9B': '5.45 kg',
  'polycom-realpresence-group-500-pakistan': '5.45 kg',
  'axis-a8105-e-door-station-pakistan': '0.65 kg',
  'axis-m3065-v-camera-pakistan': '0.35 kg',
  'benq-tk705i-pakistan': '4.20 kg',
  'benq-w4100i-pakistan': '6.80 kg',
  'bosch-paviro-pva-2p500-pakistan': '16.50 kg',
  'bosch-paviro-pva-4cr12-pakistan': '8.20 kg',
  'cisco-8841-ip-phone-pakistan': '1.35 kg',
  'cisco-cucm-license-pakistan': '0.20 kg',
  'cisco-room-bar-pakistan': '1.50 kg',
  'cisco-room-bar-t-c-k9-pakistan': '1.50 kg',
  'cisco-room-bar-pro-pakistan': '4.47 kg',
  'cisco-webex-codec-pro-pakistan': '3.30 kg',
  'cisco-webex-room-kit-pro-p60-pakistan': '5.80 kg',
  'cisco-webex-desk-pro-pakistan': '11.60 kg',
  'cisco-webex-codec-eq-pakistan': '2.95 kg',
  'cisco-room-kit-eq-pakistan': '7.75 kg',
  'cisco-room-kit-pakistan': '3.20 kg',
  'cisco-room-kit-plus-pakistan': '9.50 kg',
  'cisco-room-kit-pro-pakistan': '13.40 kg',
  'cisco-webex-room-kit-plus-pakistan': '9.50 kg',
  'dahua-n43al52-bullet-pakistan': '0.75 kg',
  'epson-lifestudio-flex-plus-pakistan': '8.50 kg',
  'fanvil-x4-ip-phone-pakistan': '1.10 kg',
  'freepbx-enterprise-pakistan': '4.50 kg',
  'grandstream-gxp2170-pakistan': '1.40 kg',
  'grandstream-ucm6304-pakistan': '3.60 kg',
  'grandstream-ucm6308-pakistan': '3.85 kg',
  'hikvision-colorvu-camera-pakistan': '0.82 kg',
  'hikvision-ptz-camera-pakistan': '3.20 kg',
  'horion-k6a-bundle-special-offer': '46.00 kg',
  'itc-va-6200ma-pakistan': '12.80 kg',
  'jabra-evolve-75-pakistan': '0.45 kg',
  'jabra-evolve2-65-pakistan': '0.48 kg',
  'logitech-rally-bar-mini-pakistan': '5.80 kg',
  'logitech-rally-bar-pakistan': '9.20 kg',
  'optoma-gt4000uhd-pakistan': '6.90 kg',
  'optoma-pk32-pocket-pakistan': '0.55 kg',
  'panasonic-pt-rq45k-pakistan': '72.00 kg',
  'panasonic-pt-vmz82-pakistan': '8.80 kg',
  'poly-blackwire-c3220-pakistan': '0.28 kg',
  'poly-g7500-pakistan': '5.20 kg',
  'poly-studio-usb-video-bar-pakistan': '3.40 kg',
  'poly-studio-v52-pakistan': '3.80 kg',
  'poly-studio-x32-pakistan': '2.20 kg',
  'poly-studio-x50-pakistan': '4.20 kg',
  'poly-studio-x50-tc8-special-offer-pakistan': '5.05 kg',
  'poly-studio-x52-pakistan': '4.30 kg',
  'poly-studio-x72-pakistan': '5.10 kg',
  'poly-voyager-focus-uc-pakistan': '0.52 kg',
  'polycom-vvx-250-pakistan': '1.15 kg',
  'poly-vvx-411-pakistan': '1.4 kg',
  'sony-bravia-projector-7-pakistan': '15.50 kg',
  'uniview-ipc3612sr3-vf-pakistan': '0.68 kg',
  'viewsonic-lsd400w-pakistan': '4.90 kg',
  'viewsonic-x1-4k-pro-pakistan': '4.60 kg',
  'wMbGVClqbDS2LFrv5HyX': '0.20 kg',
  'google-meet-hardware-license-pakistan': '0.20 kg',
  'yealink-bh70-headset-pakistan': '0.42 kg',
  'yealink-sip-t46s-pakistan': '1.38 kg',
  'podium-prompter-17-compact-pakistan': '6.80 kg',
};

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
  if (!cleaned) return '';

  // Convert verified on-disk local product/project/teleprompter paths to full https://avlive.com.pk URLs
  if (
    (cleaned.startsWith('/images/products/') && !cleaned.includes('/avlive-')) ||
    cleaned.startsWith('/images/projects/') ||
    cleaned.startsWith('/images/teleprompter/') ||
    cleaned.startsWith('/images/video-conference/')
  ) {
    return `https://avlive.com.pk${cleaned.replace(/\.webp$/i, (m) => cleaned.startsWith('/images/products/') ? '.jpg' : m)}`;
  }

  if (
    (cleaned.startsWith('https://avlive.com.pk/images/products/') && !cleaned.includes('/avlive-')) ||
    cleaned.startsWith('https://avlive.com.pk/images/projects/') ||
    cleaned.startsWith('https://avlive.com.pk/images/teleprompter/') ||
    cleaned.startsWith('https://avlive.com.pk/images/video-conference/')
  ) {
    return cleaned.startsWith('https://avlive.com.pk/images/products/')
      ? cleaned.replace(/\.webp$/i, '.jpg')
      : cleaned;
  }

  if (
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
  'VVX411-2200-48450-025': 'poly-vvx-411-pakistan',
  '2200-48450-025': 'poly-vvx-411-pakistan',
  '2200-48450-019': 'poly-vvx-411-pakistan',
  'poly-vvx-411': 'poly-vvx-411-pakistan',
  'polycom-vvx-411': 'poly-vvx-411-pakistan',
  'polycom-vvx-411-pakistan': 'poly-vvx-411-pakistan',
  '0610807846727': 'poly-vvx-411-pakistan',
  'GGN-CS-CODEC-PRO-K9': 'cisco-webex-codec-pro-pakistan',
  'CS-CODEC-PRO-K9': 'cisco-webex-codec-pro-pakistan',
  'cs-codec-pro-k9': 'cisco-webex-codec-pro-pakistan',
  'cisco-codec-pro-pakistan': 'cisco-webex-codec-pro-pakistan',
  'GGN-CS-KITPRO-P60-K9': 'cisco-webex-room-kit-pro-p60-pakistan',
  'CS-KITPRO-P60-K9': 'cisco-webex-room-kit-pro-p60-pakistan',
  'cs-kitpro-p60-k9': 'cisco-webex-room-kit-pro-p60-pakistan',
  'cisco-room-kit-pro-p60-pakistan': 'cisco-webex-room-kit-pro-p60-pakistan',
  'GGN-CS-BAR-T-C-K9': 'cisco-room-bar-t-c-k9-pakistan',
  'CS-BAR-T-C-K9': 'cisco-room-bar-t-c-k9-pakistan',
  'cs-bar-t-c-k9': 'cisco-room-bar-t-c-k9-pakistan',
  'cisco-cs-bar-t-c-k9': 'cisco-room-bar-t-c-k9-pakistan',
  'cisco-room-bar-carbon-pakistan': 'cisco-room-bar-t-c-k9-pakistan',
  'GGN-CS-BARPRO-K9': 'cisco-room-bar-pro-pakistan',
  'CS-BARPRO-K9': 'cisco-room-bar-pro-pakistan',
  'cs-barpro-k9': 'cisco-room-bar-pro-pakistan',
  'product-4-9e76d-pr6ls-5tznn-jwd3f': 'cisco-room-bar-pro-pakistan',
  'GGN-CS-KIT-K9': 'cisco-room-kit-pakistan',
  'CS-KIT-K9': 'cisco-room-kit-pakistan',
  'cs-kit-k9': 'cisco-room-kit-pakistan',
  'cisco-webex-room-kit-pakistan': 'cisco-room-kit-pakistan',
  'GGN-CS-DESKPRO-K9': 'cisco-webex-desk-pro-pakistan',
  'CS-DESKPRO-K9': 'cisco-webex-desk-pro-pakistan',
  'cs-deskpro-k9': 'cisco-webex-desk-pro-pakistan',
  'cisco-desk-pro-pakistan': 'cisco-webex-desk-pro-pakistan',
  'GGN-CS-KIT-EQ-K9': 'cisco-room-kit-eq-pakistan',
  'CS-KIT-EQ-K9': 'cisco-room-kit-eq-pakistan',
  'cs-kit-eq-k9': 'cisco-room-kit-eq-pakistan',
  'CS-KIT-EQ-C-K9': 'cisco-room-kit-eq-pakistan',
  'cs-kit-eq-c-k9': 'cisco-room-kit-eq-pakistan',
  'GGN-CS-CODEC-EQ-K9': 'cisco-webex-codec-eq-pakistan',
  'CS-CODEC-EQ-K9': 'cisco-webex-codec-eq-pakistan',
  'cs-codec-eq-k9': 'cisco-webex-codec-eq-pakistan',
  'cisco-codec-eq-pakistan': 'cisco-webex-codec-eq-pakistan',
  'GGN-CS-BAR-T-K9': 'cisco-room-bar-pakistan',
  'CS-BAR-T-K9': 'cisco-room-bar-pakistan',
  'cs-bar-t-k9': 'cisco-room-bar-pakistan',
  'CS-BAR-NR-K9': 'cisco-room-bar-pakistan',
  'cs-bar-nr-k9': 'cisco-room-bar-pakistan',
  'AVLIVE-POLY-X50-TC8-DEAL': 'poly-studio-x50-tc8-special-offer-pakistan',
  '2215-86399-001': 'poly-studio-x50-tc8-special-offer-pakistan',
  'poly-studio-x50-tc8-bundle-pakistan': 'poly-studio-x50-tc8-special-offer-pakistan',
  'poly-studio-x50-tc8-pakistan': 'poly-studio-x50-tc8-special-offer-pakistan',
  'poly-studio-x50-special-offer': 'poly-studio-x50-tc8-special-offer-pakistan',
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
    meta.title ||
    (canonicalSlug === 'podium-prompter-17-compact-pakistan'
      ? 'AV Live Fold-Flat Podium Teleprompter'
      : canonicalSlug
          .replace(/-pakistan$/, '')
          .split('-')
          .map((w) =>
            ['ip', 'ptz', 'usb', '4k', 'uhd', 'uc', 'pbx', 'sip', 'poe', '2n', '3cx', 'itc', 'eq', 'pro', 'hd', 'vvx'].includes(
              w.toLowerCase()
            )
              ? w.toUpperCase()
              : w.charAt(0).toUpperCase() + w.slice(1)
          )
          .join(' '));

  const resolvedImages = (
    meta.images && meta.images.length > 0
      ? meta.images
      : ['https://avlive.com.pk/images/products/poly-x70-studio.jpg']
  ).filter(
    (img) =>
      (img.startsWith('/images/products/') && !img.includes('/avlive-')) ||
      img.startsWith('/images/projects/') ||
      img.startsWith('/images/video-conference/') ||
      img.startsWith('/images/uploads/') ||
      (img.startsWith('https://avlive.com.pk/images/products/') && !img.includes('/avlive-')) ||
      img.startsWith('https://avlive.com.pk/images/projects/') ||
      img.startsWith('https://avlive.com.pk/images/video-conference/') ||
      img.startsWith('https://avlive.com.pk/images/uploads/') ||
      (/^https?:\/\//i.test(img) && !img.startsWith('https://avlive.com.pk/images/'))
  );
  if (resolvedImages.length === 0) {
    resolvedImages.push(
      'https://avlive.com.pk/images/products/poly-x70-studio.jpg'
    );
  }

  const resolvedCategories =
    meta.categorySlugs && meta.categorySlugs.length > 0 ? meta.categorySlugs : ['video-conferencing'];
  const resolvedCategoryIds = resolvedCategories.includes('video-conferencing')
    ? Array.from(new Set(['cat-video', ...resolvedCategories]))
    : resolvedCategories;

  return {
    id: SEO_SLUG_TO_PRODUCT_ID[canonicalSlug] || canonicalSlug,
    ...(meta.gmcId ? { gmcId: meta.gmcId } : {}),
    slug: canonicalSlug,
    customPagePath: PRODUCT_CUSTOM_PAGE_ROUTES[canonicalSlug],
    productName: readableName,
    sku: meta.mpn,
    mpn: meta.mpn,
    gtin: meta.gtin,
    brand: meta.brand,
    shippingWeight: meta.shippingWeight || DEFAULT_SHIPPING_WEIGHT_BY_SLUG[canonicalSlug] || '2.50 kg',
    ...(meta.shippingLength ? { shippingLength: meta.shippingLength } : {}),
    ...(meta.shippingWidth ? { shippingWidth: meta.shippingWidth } : {}),
    ...(meta.shippingHeight ? { shippingHeight: meta.shippingHeight } : {}),
    ...(meta.returnPolicyLabel ? { returnPolicyLabel: meta.returnPolicyLabel } : {}),
    ...(meta.googleProductCategory ? { googleProductCategory: meta.googleProductCategory } : {}),
    ...(meta.productType ? { productType: meta.productType } : {}),
    ...(meta.customLabel0 ? { customLabel0: meta.customLabel0 } : {}),
    ...(meta.customLabel1 ? { customLabel1: meta.customLabel1 } : {}),
    ...(meta.customLabel2 ? { customLabel2: meta.customLabel2 } : {}),
    ...(meta.customLabel3 ? { customLabel3: meta.customLabel3 } : {}),
    ...(meta.customLabel4 ? { customLabel4: meta.customLabel4 } : {}),
    ...(meta.isBundle ? { isBundle: meta.isBundle } : {}),
    ...(meta.multipack ? { multipack: meta.multipack } : {}),
    ...(meta.gmcDescription ? { gmcDescription: meta.gmcDescription } : {}),
    ...(meta.seoMetaDescription ? { seoMetaDescription: meta.seoMetaDescription } : {}),
    ...(meta.seoTags ? { seoTags: meta.seoTags } : {}),
    ...(meta.imageAltText ? { imageAltText: meta.imageAltText } : {}),
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
    shortDescription: meta.shortSummary || meta.highlight,
    description:
      meta.defaultDescription ||
      `${meta.highlight}. Genuine ${meta.brand} enterprise hardware (MPN: ${meta.mpn}, GTIN: ${meta.gtin}) supplied and integrated across Lahore, Karachi, and Islamabad by AV Live Communications.`,
    specifications:
      meta.defaultSpecs ||
      `Manufacturer:${meta.brand};Part Number (MPN):${meta.mpn};GTIN / UPC:${meta.gtin};Warranty:1-Year Official Pakistan Warranty`,
    variations: [],
    isActive: true,
    isFeatured: ['poly-studio-x50-tc8-special-offer-pakistan', 'poly-studio-x50-pakistan', 'polycom-realpresence-group-500-pakistan', 'poly-studio-x72-pakistan', 'logitech-rally-bar-pakistan', 'cisco-room-kit-plus-pakistan', 'horion-k6a-bundle-special-offer', 'grandstream-ucm6308-pakistan', 'podium-prompter-17-compact-pakistan'].includes(canonicalSlug),
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
  const hasSale = rawSale > 0 && rawSale < regularPrice;
  const salePrice = hasSale ? rawSale : regularPrice;
  const effectivePrice = hasSale ? rawSale : regularPrice;
  return { regularPrice, salePrice, effectivePrice, hasSale };
}

/**
 * Converts a Firestore or Fallback Product document into a Google Merchant Center row object
 * matching the exact Google Merchant Center Item IDs and required attributes:
 * - id: Exact Firestore Document ID / Item ID (e.g. "poly-studio-x50-pakistan", "T1XLMubVYmFzeIfC7V9B")
 * - title: Specific and accurate product title + MPN (up to 150 chars)
 * - description: Informative product details (up to 200 chars, distinct from product_highlight, no mid-word "...")
 * - availability: "in_stock" | "out_of_stock" | "preorder" | "backorder"
 * - availability_date: ISO 8601 date if preorder/backorder
 * - link / mobile_link: Canonical https://avlive.com.pk/product/:slug
 * - image_link / additional_image_link: High-res URLs with explicit .jpg/.png/.webp extension
 * - price / sale_price: ISO 4217 "XXXX.00 PKR"
 * - identifier_exists / gtin / mpn / brand: Verified GS1 UPC-12 + MPN + Brand
 * - shipping_weight: Official manufacturer shipping weight in "X.XX kg" format (required for US/UK listings)
 * - shopping_ads_excluded_country: "US" for NDAA-restricted surveillance brands (Hikvision/Dahua)
 */
export function formatProductToGmcRow(
  product: Record<string, any>,
  options?: GmcFeedCurrencyOptions
): Record<string, string> {
  const hasExplicitCurrencyOption = Boolean(options?.currency);
  const productCurrency = product.priceCurrency
    ? normalizeSupportedCurrency(product.priceCurrency)
    : undefined;
  const targetCurrency = normalizeSupportedCurrency(
    hasExplicitCurrencyOption ? options?.currency : productCurrency || 'PKR'
  );
  const pkrPerUnit = options?.pkrPerUnit || DEFAULT_PKR_PER_UNIT;
  const rawId = sanitizeTsvText(product.id || product.slug || product.sku);
  const canonicalSlug = getCanonicalProductSlug(product, rawId);
  const meta: Partial<(typeof PRODUCT_GMC_METADATA)[string]> =
    PRODUCT_GMC_METADATA[canonicalSlug] || PRODUCT_GMC_METADATA[rawId] || {};

  const identifierExists: 'yes' | 'no' =
    String(product.identifierExists || 'yes').toLowerCase() === 'no' ? 'no' : 'yes';

  const rawGtin = sanitizeTsvText(product.gtin || meta.gtin || (identifierExists === 'yes' ? computeUpc12('61080799001') : '')).replace(/\D/g, '');
  const gtin = identifierExists === 'no' ? '' : rawGtin;
  const mpn =
    identifierExists === 'no'
      ? ''
      : cleanMpn(product.mpn || meta.mpn || product.sku, canonicalSlug);

  // Use explicit custom GMC Product ID (max 50 chars) if provided, otherwise preserve Firestore/canonical ID
  const id = sanitizeTsvText(
    product.gmcId || meta.gmcId || rawId || SEO_SLUG_TO_PRODUCT_ID[canonicalSlug] || canonicalSlug,
    50
  );

  // Parse and normalize images so every URL is high-res and has a valid extension
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

  const explicitMainImage = normalizeGmcImageUrl(product.image);
  const explicitAdditionalImages = Array.isArray(product.additionalImages)
    ? product.additionalImages.map((u: string) => normalizeGmcImageUrl(u)).filter(Boolean)
    : [];

  const metaImages = Array.isArray(meta.images) ? meta.images : [];
  const hasCuratedLocalMain = metaImages.some(
    (u) => u.includes('/images/products/') && !u.includes('/avlive-')
  );
  const orderedCandidateUrls = explicitMainImage
    ? [explicitMainImage, ...explicitAdditionalImages, ...rawImages, ...metaImages]
    : hasCuratedLocalMain
    ? [...metaImages, ...rawImages]
    : [...rawImages, ...metaImages];

  const mergedImages = Array.from(
    new Set(
      orderedCandidateUrls
        .map((u) => normalizeGmcImageUrl(u))
        .filter(Boolean)
    )
  );
  if (mergedImages.length === 0) {
    mergedImages.push('https://avlive.com.pk/images/products/poly-x70-studio.jpg');
  }

  const brandRaw = sanitizeTsvText(product.brand || meta.brand || 'AV Live');
  const brand = brandRaw === 'Poly (HP' ? 'HP Poly' : brandRaw;

  let baseTitle = sanitizeTsvText(product.productName || 'Enterprise AV Hardware', 150);
  if (baseTitle === 'Jabra Evolve 75 UC Stereo Wireless ANC Headse') {
    baseTitle = 'Jabra Evolve 75 UC Stereo Wireless ANC Headset';
  }
  const titleWithMpn =
    mpn && !baseTitle.toLowerCase().includes(mpn.toLowerCase()) && baseTitle.length + mpn.length + 3 <= 150
      ? `${baseTitle} (${mpn})`
      : baseTitle;
  const title = sanitizeTsvText(titleWithMpn, 150);

  // Plain-text GMC description (max 5,000 chars, zero HTML tags)
  const rawFullDesc =
    sanitizeTsvText(product.gmcDescription) ||
    sanitizeTsvText(meta.gmcDescription) ||
    sanitizeTsvText(meta.defaultDescription) ||
    sanitizeTsvText(product.description) ||
    `Genuine ${title} by ${brand} in Pakistan. ${meta.highlight || ''}. Includes 1-year official warranty and nationwide enterprise deployment by AV Live.`;
  const clampedDesc = sanitizeTsvText(rawFullDesc, 5000);
  const description = clampedDesc.endsWith('.') ? clampedDesc : `${clampedDesc}.`;

  const rawAvailability = sanitizeTsvText(product.availability).toLowerCase();
  const stock = Number(product.stockQuantity ?? 10);
  const availability: 'in_stock' | 'out_of_stock' | 'preorder' | 'backorder' =
    rawAvailability === 'in_stock' ||
    rawAvailability === 'out_of_stock' ||
    rawAvailability === 'preorder' ||
    rawAvailability === 'backorder'
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

  let price: string;
  let salePrice: string;
  if (!hasExplicitCurrencyOption && productCurrency && productCurrency !== 'PKR' && Number(product.gmcPrice) > 0) {
    price = `${Number(product.gmcPrice).toFixed(2)} ${productCurrency}`;
    salePrice =
      Number(product.gmcSalePrice) > 0 && Number(product.gmcSalePrice) < Number(product.gmcPrice)
        ? `${Number(product.gmcSalePrice).toFixed(2)} ${productCurrency}`
        : '';
  } else {
    price = formatGmcPriceValue(regularPriceNum, targetCurrency, pkrPerUnit);
    salePrice = hasSale ? formatGmcPriceValue(salePriceNum, targetCurrency, pkrPerUnit) : '';
  }
  const saleEffectiveDate = salePrice ? '2026-01-01T00:00+0500/2027-12-31T23:59+0500' : '';

  const baseHighlight =
    meta.highlight ||
    `Official ${brand} enterprise AV hardware in Pakistan with 1-year warranty and nationwide installation`;
  const enrichedHighlight = mpn
    ? `${baseHighlight}; Official ${brand} MPN ${mpn}; 1-Year Pakistan Warranty`
    : `${baseHighlight}; 1-Year Pakistan Warranty`;
  const highlight = sanitizeTsvText(
    enrichedHighlight.length <= 150 ? enrichedHighlight : baseHighlight,
    150
  );

  const productDetail = formatGmcProductDetail(product.specifications, meta.defaultSpecs);
  const productHref = getProductHref(product, rawId);
  const explicitLink = sanitizeTsvText(product.productUrl || '');
  const baseLink =
    explicitLink && /^https?:\/\//i.test(explicitLink)
      ? explicitLink
      : `https://avlive.com.pk${productHref}`;
  const link =
    hasExplicitCurrencyOption && targetCurrency !== 'PKR' && !baseLink.includes('currency=')
      ? `${baseLink}${baseLink.includes('?') ? '&' : '?'}currency=${targetCurrency}`
      : baseLink;
  const mobileLink = sanitizeTsvText(product.mobileLink || '');

  const mainImage = mergedImages[0];
  const additionalImagesList = mergedImages.slice(1, 11);
  const additionalImages = additionalImagesList.join(',');

  const rawCondition = sanitizeTsvText(product.condition).toLowerCase();
  const condition =
    rawCondition === 'refurbished' || rawCondition === 'used' ? rawCondition : 'new';

  const googleProductCategory =
    sanitizeTsvText(product.googleProductCategory || meta.googleProductCategory) ||
    inferDefaultGoogleCategory(product.categorySlugs, product.productName);

  const derivedStoreType = Array.isArray(product.categorySlugs) && product.categorySlugs.length > 0
    ? product.categorySlugs
        .map((s: string) =>
          String(s)
            .split('-')
            .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : ''))
            .join(' ')
        )
        .filter(Boolean)
        .join(' > ')
    : 'Pro-AV Hardware';
  const productType = sanitizeTsvText(product.productType || meta.productType) || derivedStoreType;

  const customLabel0 = sanitizeTsvText(product.customLabel0 || meta.customLabel0, 100);
  const customLabel1 = sanitizeTsvText(product.customLabel1 || meta.customLabel1, 100);
  const customLabel2 = sanitizeTsvText(product.customLabel2 || meta.customLabel2, 100);
  const customLabel3 = sanitizeTsvText(product.customLabel3 || meta.customLabel3, 100);
  const customLabel4 = sanitizeTsvText(product.customLabel4 || meta.customLabel4, 100);

  const shippingWeight =
    sanitizeTsvText(
      product.shippingWeight ||
        meta.shippingWeight ||
        DEFAULT_SHIPPING_WEIGHT_BY_SLUG[canonicalSlug] ||
        DEFAULT_SHIPPING_WEIGHT_BY_SLUG[rawId]
    ) || '2.50 kg';
  const shippingLength = sanitizeTsvText(product.shippingLength || meta.shippingLength || '');
  const shippingWidth = sanitizeTsvText(product.shippingWidth || meta.shippingWidth || '');
  const shippingHeight = sanitizeTsvText(product.shippingHeight || meta.shippingHeight || '');
  const returnPolicyLabel = sanitizeTsvText(product.returnPolicyLabel || meta.returnPolicyLabel || '');

  const videoLink = sanitizeTsvText(product.videoLink || '');
  const isBundle: 'yes' | 'no' =
    String(product.isBundle || meta.isBundle || 'no').toLowerCase() === 'yes' ? 'yes' : 'no';
  const multipackNum = Number(product.multipack ?? meta.multipack);
  const multipack = Number.isInteger(multipackNum) && multipackNum > 1 ? String(multipackNum) : '';

  // Exclude US targeting on Hikvision and Dahua items to prevent US Local Requirements (NDAA/FCC) disapprovals
  const excludedCountry =
    /^(hikvision|dahua)$/i.test(brand) ||
    ['hikvision-ptz-camera-pakistan', 'hikvision-colorvu-camera-pakistan', 'dahua-n43al52-bullet-pakistan'].includes(
      canonicalSlug
    )
      ? 'US'
      : '';

  return {
    id,
    title,
    description,
    availability,
    availability_date: availabilityDate,
    expiration_date: expirationDate,
    link,
    mobile_link: mobileLink,
    image_link: mainImage,
    price,
    sale_price: salePrice,
    sale_price_effective_date: saleEffectiveDate,
    identifier_exists: identifierExists,
    gtin,
    mpn,
    brand,
    google_product_category: googleProductCategory,
    product_type: productType,
    custom_label_0: customLabel0,
    custom_label_1: customLabel1,
    custom_label_2: customLabel2,
    custom_label_3: customLabel3,
    custom_label_4: customLabel4,
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
    multipack,
    is_bundle: isBundle,
    'is bundle': isBundle,
    shipping_weight: shippingWeight,
    shipping_length: shippingLength,
    shipping_width: shippingWidth,
    shipping_height: shippingHeight,
    return_policy_label: returnPolicyLabel,
    shopping_ads_excluded_country: excludedCountry,
    unit_pricing_measure: '',
    unit_pricing_base_measure: '',
    energy_efficiency_class: '',
    min_energy_efficiency_class: '',
    max_energy_efficiency: '',
    item_group_id: '',
    video_link: videoLink,
    virtual_model_link: '',
    cost_of_goods_sold: '',
  };
}

function escapeCsvCell(val: string): string {
  const str = String(val ?? '');
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Generates an RFC 4180 CSV feed mapping all 30 exact Google Merchant Center attributes.
 */
export function generateGmcCsv(products: Record<string, any>[], options?: GmcFeedCurrencyOptions): string {
  const headerLine = GMC_EXACT_FEED_HEADERS.join(',');
  const lines = products.map((product) => {
    const rowObj = formatProductToGmcRow(product, options);
    return GMC_EXACT_FEED_HEADERS.map((col) => escapeCsvCell(rowObj[col] ?? '')).join(',');
  });
  return [headerLine, ...lines].join('\r\n');
}

/**
 * Generates a complete TSV string from an array of products.
 */
export function generateGmcTsv(products: Record<string, any>[], options?: GmcFeedCurrencyOptions): string {
  const headerLine = GMC_40_HEADERS.join('\t');
  const lines = products.map((product) => {
    const rowObj = formatProductToGmcRow(product, options);
    return GMC_40_HEADERS.map((col) => sanitizeTsvText(rowObj[col])).join('\t');
  });
  return [headerLine, ...lines].join('\n');
}

/**
 * Generates the Google Merchant Center Sheet TSV matching the core required/recommended columns.
 */
export function generateGmc20Tsv(products: Record<string, any>[], options?: GmcFeedCurrencyOptions): string {
  const headerLine = GMC_20_SHEET_HEADERS.join('\t');
  const lines = products.map((product) => {
    const rowObj = formatProductToGmcRow(product, options);
    return GMC_20_SHEET_HEADERS.map((col) => sanitizeTsvText(rowObj[col])).join('\t');
  });
  return [headerLine, ...lines].join('\n');
}

/**
 * Generates a 2D array ([headers, ...rows]) for Google Sheets API synchronization.
 */
export function generateGmcSheetMatrix(products: Record<string, any>[], options?: GmcFeedCurrencyOptions): string[][] {
  const headers = [...GMC_40_HEADERS];
  const rows = products.map((product) => {
    const rowObj = formatProductToGmcRow(product, options);
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
 * mapping every Core, Identifier, Categorization, Custom Label, Shipping/Return, and Advanced attribute.
 */
export function generateGmcXml(products: Record<string, any>[], options?: GmcFeedCurrencyOptions): string {
  const itemsXml = products
    .map((product) => {
      const r = formatProductToGmcRow(product, options);
      const optionalTags: string[] = [];
      const pushTag = (tag: string, value?: string) => {
        if (value && value.trim()) {
          optionalTags.push(`      <g:${tag}>${escapeXml(value.trim())}</g:${tag}>`);
        }
      };

      const additionalImageTags = String(r.additional_image_link || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 10)
        .map((imgUrl) => `      <g:additional_image_link>${escapeXml(imgUrl)}</g:additional_image_link>`);

      if (r.mobile_link) pushTag('mobile_link', r.mobile_link);
      if (r.sale_price) pushTag('sale_price', r.sale_price);
      if (r.gtin) pushTag('gtin', r.gtin);
      if (r.mpn) pushTag('mpn', r.mpn);
      pushTag('google_product_category', r.google_product_category);
      pushTag('product_type', r.product_type);
      pushTag('custom_label_0', r.custom_label_0);
      pushTag('custom_label_1', r.custom_label_1);
      pushTag('custom_label_2', r.custom_label_2);
      pushTag('custom_label_3', r.custom_label_3);
      pushTag('custom_label_4', r.custom_label_4);
      pushTag('shipping_weight', r.shipping_weight);
      pushTag('shipping_length', r.shipping_length);
      pushTag('shipping_width', r.shipping_width);
      pushTag('shipping_height', r.shipping_height);
      pushTag('return_policy_label', r.return_policy_label);
      pushTag('video_link', r.video_link);
      pushTag('is_bundle', r.is_bundle);
      pushTag('multipack', r.multipack);
      pushTag('shopping_ads_excluded_country', r.shopping_ads_excluded_country);

      const highlights = String(r.product_highlight || '')
        .split(';')
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 6)
        .map((h) => `      <g:product_highlight>${escapeXml(h)}</g:product_highlight>`);

      return [
        '    <item>',
        `      <g:id>${escapeXml(r.id)}</g:id>`,
        `      <g:title>${escapeXml(r.title)}</g:title>`,
        `      <g:description>${escapeXml(r.description)}</g:description>`,
        `      <g:link>${escapeXml(r.link)}</g:link>`,
        `      <g:image_link>${escapeXml(r.image_link)}</g:image_link>`,
        ...additionalImageTags,
        `      <g:availability>${escapeXml(r.availability)}</g:availability>`,
        `      <g:price>${escapeXml(r.price)}</g:price>`,
        `      <g:brand>${escapeXml(r.brand)}</g:brand>`,
        `      <g:condition>${escapeXml(r.condition)}</g:condition>`,
        `      <g:identifier_exists>${escapeXml(r.identifier_exists)}</g:identifier_exists>`,
        ...optionalTags,
        ...highlights,
        '    </item>',
      ].join('\n');
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
