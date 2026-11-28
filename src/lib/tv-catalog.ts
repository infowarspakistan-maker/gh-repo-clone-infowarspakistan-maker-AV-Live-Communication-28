/**
 * Verified Samsung & TCL LED / Smart TV Catalog for AV Live Communications (Pakistan)
 * Structured for 100% Google Merchant Center (GMC) compliance:
 * - Official Google Product Category: Electronics > Video > Televisions (ID 305)
 * - Exact SKU IDs, item_group_id variant grouping, standardized screen sizes, and PKR pricing
 * - Locally hosted authentic OEM studio photography (.jpg for GMC + JSON-LD, .webp for fast storefront)
 * - Official Pakistan model specifications (Samsung Pakistan & TCL Pakistan)
 */

export interface TvCatalogGmcEntry {
  gmcId: string;
  slug: string;
  gtin: string;
  mpn: string;
  identifierExists: 'yes' | 'no';
  brand: 'TCL' | 'Samsung';
  title: string;
  color: string;
  size: string;
  itemGroupId: string;
  modelSeries: string;
  typeKeyFeature: string;
  priceNote: string;
  availability: 'in_stock' | 'out_of_stock' | 'preorder' | 'backorder';
  condition: 'new';
  isBundle: 'no';
  shippingWeight: string;
  shippingLength: string;
  shippingWidth: string;
  shippingHeight: string;
  returnPolicyLabel: string;
  googleProductCategory: string;
  productType: string;
  customLabel0: string;
  customLabel1: string;
  customLabel2: string;
  customLabel3: string;
  customLabel4: string;
  highlight: string;
  shortSummary: string;
  gmcDescription: string;
  regularPrice: number;
  salePrice: number;
  categorySlugs: string[];
  images: string[];
  defaultSpecs: string;
  defaultDescription: string;
  seoMetaDescription: string;
  seoTags: string;
  imageAltText: string;
}

const SCREEN_SHIPPING_SPECS: Record<
  string,
  { weight: string; length: string; width: string; height: string; vesa: string }
> = {
  '32"': { weight: '6.50 kg', length: '82 cm', width: '14 cm', height: '52 cm', vesa: '100 × 100 mm' },
  '40"': { weight: '8.80 kg', length: '101 cm', width: '14 cm', height: '62 cm', vesa: '100 × 100 mm' },
  '43"': { weight: '10.60 kg', length: '109 cm', width: '15 cm', height: '67 cm', vesa: '200 × 200 mm' },
  '50"': { weight: '14.20 kg', length: '126 cm', width: '16 cm', height: '77 cm', vesa: '200 × 200 mm' },
  '55"': { weight: '17.40 kg', length: '139 cm', width: '16 cm', height: '85 cm', vesa: '200 × 200 mm' },
  '65"': { weight: '25.50 kg', length: '162 cm', width: '18 cm', height: '98 cm', vesa: '300 × 300 mm' },
  '75"': { weight: '36.80 kg', length: '184 cm', width: '20 cm', height: '112 cm', vesa: '400 × 300 mm' },
  '85"': { weight: '54.50 kg', length: '208 cm', width: '24 cm', height: '126 cm', vesa: '600 × 400 mm' },
};

function buildTvEntry(params: {
  gmcId: string;
  slug: string;
  brand: 'TCL' | 'Samsung';
  title: string;
  modelSeries: string;
  itemGroupId: string;
  screenSize: string;
  price: number;
  productType: string;
  typeKeyFeature: string;
  priceNote: string;
  images: string[];
  resolution: string;
  panelAndEngine: string;
  hdrAndColor: string;
  motionAndRefresh: string;
  smartOs: string;
  audio: string;
  connectivity: string;
  designAndWarranty: string;
  highlight: string;
  shortDescBase: string;
}): TvCatalogGmcEntry {
  const ship = SCREEN_SHIPPING_SPECS[params.screenSize] || SCREEN_SHIPPING_SPECS['55"'];
  const inchNum = params.screenSize.replace('"', '');
  const fullGmcDesc = `${params.shortDescBase} Features ${params.resolution}, ${params.panelAndEngine}, ${params.hdrAndColor}, ${params.smartOs}, and ${params.audio}. Supplied in Pakistan by AV Live Communications with nationwide delivery in Lahore, Karachi, and Islamabad.`;
  const fullDefaultSpecs = [
    `Screen Size:${params.screenSize} (${inchNum}-Inch Class Diagonal)`,
    `Model Series:${params.brand} ${params.modelSeries}`,
    `Resolution:${params.resolution}`,
    `Panel & Picture Engine:${params.panelAndEngine}`,
    `HDR & Color:${params.hdrAndColor}`,
    `Refresh Rate & Motion:${params.motionAndRefresh}`,
    `Smart TV Platform:${params.smartOs}`,
    `Audio System:${params.audio}`,
    `Connectivity & Ports:${params.connectivity}`,
    `VESA Wall Mount:${ship.vesa} (Commercial & Boardroom Mount Ready)`,
    `Power Supply:AC 220–240V, 50/60Hz (Pakistan Official Standard)`,
    `Design & Warranty:${params.designAndWarranty}`,
  ].join(';');

  const priceTier =
    params.price < 100000
      ? 'Under 100K PKR'
      : params.price < 200000
      ? '100K–200K PKR'
      : params.price < 350000
      ? '200K–350K PKR'
      : '350K+ Flagship PKR';

  return {
    gmcId: params.gmcId,
    slug: params.slug,
    gtin: '',
    mpn: '',
    identifierExists: 'no',
    brand: params.brand,
    title: params.title,
    color: 'Black',
    size: params.screenSize,
    itemGroupId: params.itemGroupId,
    modelSeries: params.modelSeries,
    typeKeyFeature: params.typeKeyFeature,
    priceNote: params.priceNote,
    availability: 'in_stock',
    condition: 'new',
    isBundle: 'no',
    shippingWeight: ship.weight,
    shippingLength: ship.length,
    shippingWidth: ship.width,
    shippingHeight: ship.height,
    returnPolicyLabel: 'Pakistan 14-Day Inspection & Official Warranty',
    googleProductCategory: 'Electronics > Video > Televisions',
    productType: params.productType,
    customLabel0: params.brand,
    customLabel1: params.modelSeries,
    customLabel2: params.screenSize,
    customLabel3: priceTier,
    customLabel4: 'LED TV & Commercial Display',
    highlight: params.highlight,
    shortSummary: `${params.shortDescBase} Official Pakistan stock available via AV Live Communications.`,
    gmcDescription: fullGmcDesc,
    regularPrice: params.price,
    salePrice: params.price,
    categorySlugs: ['led-tv-displays'],
    images: params.images,
    defaultSpecs: fullDefaultSpecs,
    defaultDescription: `${params.title} (${params.gmcId}) available in stock across Lahore, Karachi, and Islamabad from AV Live Communications. ${params.shortDescBase} Equipped with ${params.resolution}, ${params.panelAndEngine}, ${params.hdrAndColor}, ${params.smartOs}, and ${params.audio}. Ideal for corporate boardrooms, huddle displays, hospitality suites, digital signage, and home cinema installations across Pakistan with optional commercial wall-mounting and AV integration.`,
    seoMetaDescription: `Buy ${params.title} in Pakistan at Rs. ${params.price.toLocaleString('en-PK')}. In stock with official warranty & nationwide delivery by AV Live.`,
    seoTags: `${params.brand} TV Pakistan, ${params.title}, ${params.brand} ${params.modelSeries} price in Pakistan, ${inchNum} inch LED TV Pakistan, ${params.typeKeyFeature}`,
    imageAltText: `${params.title} — Official ${params.brand} ${params.modelSeries} ${inchNum}-Inch Front View in Pakistan`,
  };
}

export const TV_CATALOG_ITEMS: TvCatalogGmcEntry[] = [
  // ============================================
  // TCL TELEVISIONS (18 SKUs across 8 Series)
  // ============================================
  buildTvEntry({
    gmcId: 'TCL-V6D-55',
    slug: 'tcl-v6d-55-inch-4k-google-tv-pakistan',
    brand: 'TCL',
    title: 'TCL V6D 55 Inch 4K Google TV',
    modelSeries: 'V6D Series',
    itemGroupId: 'TCL-V6D',
    screenSize: '55"',
    price: 127000,
    productType: 'TVs > TCL > Non-QLED > V6D Series',
    typeKeyFeature: '4K Google TV',
    priceNote: 'Official TCL price 127,000',
    images: ['https://avlive.com.pk/images/products/tv-tcl-v6d.jpg'],
    resolution: '4K Ultra HD (3840 × 2160)',
    panelAndEngine: 'HVA High-Contrast Panel with TCL AiPQ Processor',
    hdrAndColor: 'HDR10 & Dynamic Color Enhancement',
    motionAndRefresh: '60Hz Native Refresh Rate with MEMC Motion Smoothing',
    smartOs: 'Google TV OS with Built-in Google Assistant & Chromecast',
    audio: '2.0-Channel Speakers with Dolby Audio Decoding',
    connectivity: '3 × HDMI (eARC), 1 × USB, Dual-Band Wi-Fi, Bluetooth 5.0, Ethernet LAN',
    designAndWarranty: 'Slim Metallic Bezel-less Design • Official TCL Pakistan Warranty',
    highlight: 'TCL V6D 55" 4K UHD HVA Panel with AiPQ Processor, HDR10, MEMC & Google TV',
    shortDescBase: 'TCL V6D Series 55-inch non-QLED 4K Google TV. Key feature: 4K Google TV.',
  }),

  // TCL P6L Series (55", 65", 75")
  buildTvEntry({
    gmcId: 'TCL-P6L-55',
    slug: 'tcl-p6l-55-inch-4k-led-google-tv-pakistan',
    brand: 'TCL',
    title: 'TCL P6L 55 Inch 4K LED Google TV',
    modelSeries: 'P6L Series',
    itemGroupId: 'TCL-P6L',
    screenSize: '55"',
    price: 124500,
    productType: 'TVs > TCL > Non-QLED > P6L Series',
    typeKeyFeature: '4K LED Google TV',
    priceNote: 'Listed range 124,500–127,900; feed price uses lowest',
    images: ['https://avlive.com.pk/images/products/tv-tcl-p6l.jpg'],
    resolution: '4K Ultra HD (3840 × 2160)',
    panelAndEngine: 'HVA High-Contrast LED Panel with TCL AiPQ Processor',
    hdrAndColor: 'HDR10 & Dynamic Color Enhancement',
    motionAndRefresh: '60Hz Native with MEMC Smooth Motion Compensation',
    smartOs: 'Google TV OS with Google Play, YouTube, Netflix & Built-in Chromecast',
    audio: 'Dolby Audio Stereo Speaker System',
    connectivity: '3 × HDMI (HDMI 2.1 / eARC), 1 × USB, Wi-Fi 5, Bluetooth 5.0, Optical & LAN',
    designAndWarranty: 'Metallic Frameless Uni-Body • Official TCL Pakistan Warranty',
    highlight: 'TCL P6L 55" 4K LED Google TV with HVA Panel, AiPQ Engine, MEMC & Dolby Audio',
    shortDescBase: 'TCL P6L Series 55-inch non-QLED 4K LED Google TV. Key feature: 4K LED Google TV.',
  }),
  buildTvEntry({
    gmcId: 'TCL-P6L-65',
    slug: 'tcl-p6l-65-inch-4k-led-google-tv-pakistan',
    brand: 'TCL',
    title: 'TCL P6L 65 Inch 4K LED Google TV',
    modelSeries: 'P6L Series',
    itemGroupId: 'TCL-P6L',
    screenSize: '65"',
    price: 186000,
    productType: 'TVs > TCL > Non-QLED > P6L Series',
    typeKeyFeature: '4K LED Google TV',
    priceNote: 'Listed price 186,000',
    images: ['https://avlive.com.pk/images/products/tv-tcl-p6l.jpg'],
    resolution: '4K Ultra HD (3840 × 2160)',
    panelAndEngine: 'HVA High-Contrast LED Panel with TCL AiPQ Processor',
    hdrAndColor: 'HDR10 & Dynamic Color Enhancement',
    motionAndRefresh: '60Hz Native with MEMC Smooth Motion Compensation',
    smartOs: 'Google TV OS with Google Play, YouTube, Netflix & Built-in Chromecast',
    audio: 'Dolby Audio Stereo Speaker System',
    connectivity: '3 × HDMI (HDMI 2.1 / eARC), 1 × USB, Wi-Fi 5, Bluetooth 5.0, Optical & LAN',
    designAndWarranty: 'Metallic Frameless Uni-Body • Official TCL Pakistan Warranty',
    highlight: 'TCL P6L 65" 4K LED Google TV with HVA Panel, AiPQ Engine, MEMC & Dolby Audio',
    shortDescBase: 'TCL P6L Series 65-inch non-QLED 4K LED Google TV. Key feature: 4K LED Google TV.',
  }),
  buildTvEntry({
    gmcId: 'TCL-P6L-75',
    slug: 'tcl-p6l-75-inch-4k-led-google-tv-pakistan',
    brand: 'TCL',
    title: 'TCL P6L 75 Inch 4K LED Google TV',
    modelSeries: 'P6L Series',
    itemGroupId: 'TCL-P6L',
    screenSize: '75"',
    price: 268500,
    productType: 'TVs > TCL > Non-QLED > P6L Series',
    typeKeyFeature: '4K LED Google TV',
    priceNote: 'Listed price 268,500',
    images: ['https://avlive.com.pk/images/products/tv-tcl-p6l.jpg'],
    resolution: '4K Ultra HD (3840 × 2160)',
    panelAndEngine: 'Large-Format 75" HVA LED Panel with TCL AiPQ Processor',
    hdrAndColor: 'HDR10 & Dynamic Color Enhancement',
    motionAndRefresh: '60Hz Native with MEMC Smooth Motion Compensation',
    smartOs: 'Google TV OS with Google Assistant & Wireless Casting',
    audio: 'Dolby Audio Stereo Speaker System',
    connectivity: '3 × HDMI (HDMI 2.1 / eARC), 1 × USB, Wi-Fi 5, Bluetooth 5.0, Optical & LAN',
    designAndWarranty: 'Metallic Frameless Uni-Body for Boardrooms & Lounges • Official TCL Warranty',
    highlight: 'TCL P6L 75" Large-Format 4K LED Google TV with HVA Panel, AiPQ & Dolby Audio',
    shortDescBase: 'TCL P6L Series 75-inch non-QLED 4K LED Google TV. Key feature: 4K LED Google TV.',
  }),

  // TCL P755 Series (43", 55", 65", 75")
  buildTvEntry({
    gmcId: 'TCL-P755-43',
    slug: 'tcl-p755-43-inch-4k-uhd-google-tv-pakistan',
    brand: 'TCL',
    title: 'TCL P755 43 Inch 4K UHD Google TV',
    modelSeries: 'P755 Series',
    itemGroupId: 'TCL-P755',
    screenSize: '43"',
    price: 89900,
    productType: 'TVs > TCL > Non-QLED > P755 Series',
    typeKeyFeature: '4K UHD Android / Google TV',
    priceNote: 'Listed range 89,900–98,000; feed price uses lowest',
    images: [
      'https://avlive.com.pk/images/products/tv-tcl-p755.jpg',
      'https://avlive.com.pk/images/products/tv-tcl-p755-angle.jpg',
    ],
    resolution: '4K Ultra HD (3840 × 2160)',
    panelAndEngine: 'Slim Uni-Body LED Panel with TCL AiPQ Processor & Wide Color Gamut',
    hdrAndColor: 'Dolby Vision, HDR10+ & HLG Support',
    motionAndRefresh: '60Hz Native with MEMC & Low-Latency Game Mode',
    smartOs: 'Google TV / Android TV with Hands-Free Google Assistant & AirPlay 2',
    audio: 'Dolby Atmos & DTS Virtual:X Spatial Audio',
    connectivity: '3 × HDMI 2.1 (eARC / ALLM), 1 × USB 3.0, Wi-Fi 5, Bluetooth 5.0, LAN',
    designAndWarranty: 'Ultra-Slim Metallic Uni-Body • Official TCL Pakistan Warranty',
    highlight: 'TCL P755 43" 4K UHD Google TV with Dolby Vision, Dolby Atmos & AiPQ Processor',
    shortDescBase: 'TCL P755 Series 43-inch non-QLED 4K UHD Android/Google TV. Key feature: 4K UHD Android / Google TV.',
  }),
  buildTvEntry({
    gmcId: 'TCL-P755-55',
    slug: 'tcl-p755-55-inch-4k-uhd-google-tv-pakistan',
    brand: 'TCL',
    title: 'TCL P755 55 Inch 4K UHD Google TV',
    modelSeries: 'P755 Series',
    itemGroupId: 'TCL-P755',
    screenSize: '55"',
    price: 127900,
    productType: 'TVs > TCL > Non-QLED > P755 Series',
    typeKeyFeature: '4K UHD Google TV',
    priceNote: 'Listed price 127,900',
    images: [
      'https://avlive.com.pk/images/products/tv-tcl-p755.jpg',
      'https://avlive.com.pk/images/products/tv-tcl-p755-angle.jpg',
    ],
    resolution: '4K Ultra HD (3840 × 2160)',
    panelAndEngine: 'Slim Uni-Body LED Panel with TCL AiPQ Processor & 93% DCI-P3 WCG',
    hdrAndColor: 'Dolby Vision, HDR10+ & HLG Cinema Calibration',
    motionAndRefresh: '120Hz DLG Game Accelerator, MEMC & ALLM',
    smartOs: 'Google TV OS with Hands-Free Voice Control & Chromecast Built-in',
    audio: 'Dolby Atmos & DTS Virtual:X Immersive Audio',
    connectivity: '3 × HDMI 2.1 (eARC / ALLM), 1 × USB 3.0, Dual-Band Wi-Fi, Bluetooth 5.0, LAN',
    designAndWarranty: 'Ultra-Slim Metallic Uni-Body • Official TCL Pakistan Warranty',
    highlight: 'TCL P755 55" 4K UHD Google TV with Dolby Vision, Dolby Atmos & 120Hz Game Accelerator',
    shortDescBase: 'TCL P755 Series 55-inch non-QLED 4K UHD Google TV. Key feature: 4K UHD Google TV.',
  }),
  buildTvEntry({
    gmcId: 'TCL-P755-65',
    slug: 'tcl-p755-65-inch-4k-uhd-google-tv-pakistan',
    brand: 'TCL',
    title: 'TCL P755 65 Inch 4K UHD Google TV',
    modelSeries: 'P755 Series',
    itemGroupId: 'TCL-P755',
    screenSize: '65"',
    price: 246900,
    productType: 'TVs > TCL > Non-QLED > P755 Series',
    typeKeyFeature: '4K UHD Google TV',
    priceNote: 'Listed price 246,900',
    images: [
      'https://avlive.com.pk/images/products/tv-tcl-p755.jpg',
      'https://avlive.com.pk/images/products/tv-tcl-p755-angle.jpg',
    ],
    resolution: '4K Ultra HD (3840 × 2160)',
    panelAndEngine: 'Slim Uni-Body LED Panel with TCL AiPQ Processor & Wide Color Gamut',
    hdrAndColor: 'Dolby Vision, HDR10+ & HLG',
    motionAndRefresh: '120Hz Game Accelerator, MEMC & Auto Low Latency Mode',
    smartOs: 'Google TV OS with Hands-Free Google Assistant & AirPlay 2',
    audio: 'Dolby Atmos & DTS Virtual:X Audio',
    connectivity: '3 × HDMI 2.1 (eARC / ALLM), 1 × USB 3.0, Dual-Band Wi-Fi, Bluetooth 5.0, LAN',
    designAndWarranty: 'Ultra-Slim Metallic Uni-Body • Official TCL Pakistan Warranty',
    highlight: 'TCL P755 65" 4K UHD Google TV with Dolby Vision, Dolby Atmos & 120Hz Accelerator',
    shortDescBase: 'TCL P755 Series 65-inch non-QLED 4K UHD Google TV. Key feature: 4K UHD Google TV.',
  }),
  buildTvEntry({
    gmcId: 'TCL-P755-75',
    slug: 'tcl-p755-75-inch-4k-uhd-google-tv-pakistan',
    brand: 'TCL',
    title: 'TCL P755 75 Inch 4K UHD Google TV',
    modelSeries: 'P755 Series',
    itemGroupId: 'TCL-P755',
    screenSize: '75"',
    price: 325900,
    productType: 'TVs > TCL > Non-QLED > P755 Series',
    typeKeyFeature: '4K UHD Google TV',
    priceNote: 'Listed price 325,900',
    images: [
      'https://avlive.com.pk/images/products/tv-tcl-p755.jpg',
      'https://avlive.com.pk/images/products/tv-tcl-p755-angle.jpg',
    ],
    resolution: '4K Ultra HD (3840 × 2160)',
    panelAndEngine: '75" Commercial-Grade Uni-Body Panel with TCL AiPQ Processor',
    hdrAndColor: 'Dolby Vision, HDR10+ & Wide Color Gamut',
    motionAndRefresh: '120Hz Game Accelerator, MEMC & ALLM',
    smartOs: 'Google TV OS with Hands-Free Voice Control & Multi-Device Casting',
    audio: 'Dolby Atmos & DTS Virtual:X Spatial Audio',
    connectivity: '3 × HDMI 2.1 (eARC / ALLM), 1 × USB 3.0, Dual-Band Wi-Fi, Bluetooth 5.0, LAN',
    designAndWarranty: 'Executive Boardroom & Cinema Uni-Body • Official TCL Pakistan Warranty',
    highlight: 'TCL P755 75" Flagship 4K UHD Google TV with Dolby Vision, Atmos & 120Hz Accelerator',
    shortDescBase: 'TCL P755 Series 75-inch non-QLED 4K UHD Google TV. Key feature: 4K UHD Google TV.',
  }),

  // TCL P6K Series (55", 65")
  buildTvEntry({
    gmcId: 'TCL-P6K-55',
    slug: 'tcl-p6k-55-inch-4k-google-tv-pakistan',
    brand: 'TCL',
    title: 'TCL P6K 55 Inch 4K Google TV',
    modelSeries: 'P6K Series',
    itemGroupId: 'TCL-P6K',
    screenSize: '55"',
    price: 113900,
    productType: 'TVs > TCL > Non-QLED > P6K Series',
    typeKeyFeature: '4K Google TV',
    priceNote: 'Listed price 113,900',
    images: [
      'https://avlive.com.pk/images/products/tv-tcl-p6k.jpg',
      'https://avlive.com.pk/images/products/tv-tcl-p6k-angle.jpg',
    ],
    resolution: '4K Ultra HD (3840 × 2160)',
    panelAndEngine: 'HVA Panel with Quad-Core TCL AiPQ Processor (2GB RAM / 16GB Storage)',
    hdrAndColor: 'HDR10+, 1.07 Billion Colors & Dynamic Color Enhancement',
    motionAndRefresh: '60Hz Native Refresh Rate with MEMC Motion Smoothing',
    smartOs: 'Google TV OS with Google Assistant & Built-in Chromecast',
    audio: '2.0-Channel 20W Speakers with Dolby Audio',
    connectivity: '3 × HDMI (eARC), 1 × USB, Dual-Band Wi-Fi, Bluetooth 5.0, LAN',
    designAndWarranty: 'Metallic Bezel-less Design • Official TCL Pakistan Warranty',
    highlight: 'TCL P6K 55" 4K Google TV with HVA Panel, AiPQ Processor, HDR10+ & Dolby Audio',
    shortDescBase: 'TCL P6K Series 55-inch non-QLED 4K Google TV. Key feature: 4K Google TV.',
  }),
  buildTvEntry({
    gmcId: 'TCL-P6K-65',
    slug: 'tcl-p6k-65-inch-4k-google-tv-pakistan',
    brand: 'TCL',
    title: 'TCL P6K 65 Inch 4K Google TV',
    modelSeries: 'P6K Series',
    itemGroupId: 'TCL-P6K',
    screenSize: '65"',
    price: 182300,
    productType: 'TVs > TCL > Non-QLED > P6K Series',
    typeKeyFeature: '4K Google TV',
    priceNote: 'Listed price 182,300',
    images: [
      'https://avlive.com.pk/images/products/tv-tcl-p6k.jpg',
      'https://avlive.com.pk/images/products/tv-tcl-p6k-angle.jpg',
    ],
    resolution: '4K Ultra HD (3840 × 2160)',
    panelAndEngine: 'HVA Panel with Quad-Core TCL AiPQ Processor (2GB RAM / 16GB Storage)',
    hdrAndColor: 'HDR10+, 1.07 Billion Colors & Dynamic Color Enhancement',
    motionAndRefresh: '60Hz Native Refresh Rate with MEMC Motion Smoothing',
    smartOs: 'Google TV OS with Google Assistant & Built-in Chromecast',
    audio: '2.0-Channel 20W Speakers with Dolby Audio',
    connectivity: '3 × HDMI (eARC), 1 × USB, Dual-Band Wi-Fi, Bluetooth 5.0, LAN',
    designAndWarranty: 'Metallic Bezel-less Design • Official TCL Pakistan Warranty',
    highlight: 'TCL P6K 65" 4K Google TV with HVA Panel, AiPQ Processor, HDR10+ & Dolby Audio',
    shortDescBase: 'TCL P6K Series 65-inch non-QLED 4K Google TV. Key feature: 4K Google TV.',
  }),

  // TCL S51K Series (32", 40", 43", 50")
  buildTvEntry({
    gmcId: 'TCL-S51K-32',
    slug: 'tcl-s51k-32-inch-smart-google-tv-pakistan',
    brand: 'TCL',
    title: 'TCL S51K 32 Inch Smart Google TV',
    modelSeries: 'S51K Series',
    itemGroupId: 'TCL-S51K',
    screenSize: '32"',
    price: 49900,
    productType: 'TVs > TCL > Non-QLED > S51K Series',
    typeKeyFeature: 'Smart Google TV',
    priceNote: 'Listed range 49,900–52,000; feed price uses lowest',
    images: ['https://avlive.com.pk/images/products/tv-tcl-s51k.jpg'],
    resolution: 'HD / 2K Crisp LED Display (Wide Viewing Angle)',
    panelAndEngine: 'High-Contrast HVA Panel (up to 280 nits typical brightness)',
    hdrAndColor: 'HDR10 Decoding & Vibrant Color Optimization',
    motionAndRefresh: '60Hz Native Refresh Rate',
    smartOs: 'Google TV OS with Built-in Google Assistant, YouTube & Netflix',
    audio: 'Dolby Audio Multi-Mode Stereo Speakers',
    connectivity: '2 × HDMI, 1 × USB, Built-in Wi-Fi, Bluetooth 5.0, LAN & RF',
    designAndWarranty: 'Metallic Slim Bezel-less Design • Official TCL Pakistan Warranty',
    highlight: 'TCL S51K 32" Smart Google TV with HVA Panel, HDR10, Dolby Audio & Slim Frame',
    shortDescBase: 'TCL S51K Series 32-inch non-QLED Smart Google TV. Key feature: Smart Google TV.',
  }),
  buildTvEntry({
    gmcId: 'TCL-S51K-40',
    slug: 'tcl-s51k-40-inch-smart-google-tv-pakistan',
    brand: 'TCL',
    title: 'TCL S51K 40 Inch Smart Google TV',
    modelSeries: 'S51K Series',
    itemGroupId: 'TCL-S51K',
    screenSize: '40"',
    price: 67900,
    productType: 'TVs > TCL > Non-QLED > S51K Series',
    typeKeyFeature: 'Smart Google TV',
    priceNote: 'Listed range 67,900–69,000; feed price uses lowest',
    images: ['https://avlive.com.pk/images/products/tv-tcl-s51k.jpg'],
    resolution: 'Full HD 2K (1920 × 1080)',
    panelAndEngine: 'High-Contrast HVA Panel (up to 280 nits typical brightness)',
    hdrAndColor: 'HDR10 Decoding & Dynamic Contrast Enhancement',
    motionAndRefresh: '60Hz Native Refresh Rate',
    smartOs: 'Google TV OS with Built-in Google Assistant & Chromecast',
    audio: 'Dolby Audio Stereo Speakers',
    connectivity: '2 × HDMI, 1 × USB, Built-in Wi-Fi, Bluetooth 5.0, LAN & Optical',
    designAndWarranty: 'Metallic Slim Bezel-less Design • Official TCL Pakistan Warranty',
    highlight: 'TCL S51K 40" Full HD Smart Google TV with HVA Panel, HDR10 & Dolby Audio',
    shortDescBase: 'TCL S51K Series 40-inch non-QLED Smart Google TV. Key feature: Smart Google TV.',
  }),
  buildTvEntry({
    gmcId: 'TCL-S51K-43',
    slug: 'tcl-s51k-43-inch-smart-google-tv-pakistan',
    brand: 'TCL',
    title: 'TCL S51K 43 Inch Smart Google TV',
    modelSeries: 'S51K Series',
    itemGroupId: 'TCL-S51K',
    screenSize: '43"',
    price: 77900,
    productType: 'TVs > TCL > Non-QLED > S51K Series',
    typeKeyFeature: 'Smart Google TV',
    priceNote: 'Listed range 77,900–79,000; feed price uses lowest',
    images: ['https://avlive.com.pk/images/products/tv-tcl-s51k.jpg'],
    resolution: 'Full HD 2K (1920 × 1080)',
    panelAndEngine: 'High-Contrast HVA Panel with Slim Bezel Architecture',
    hdrAndColor: 'HDR10 Support & Enhanced Color Clarity',
    motionAndRefresh: '60Hz Native Refresh Rate',
    smartOs: 'Google TV OS with Google Assistant & Built-in Casting',
    audio: 'Dolby Audio Stereo Speakers',
    connectivity: '2 × HDMI, 1 × USB, Built-in Wi-Fi, Bluetooth 5.0, LAN & Optical',
    designAndWarranty: 'Metallic Slim Bezel-less Design • Official TCL Pakistan Warranty',
    highlight: 'TCL S51K 43" Full HD Smart Google TV with HVA Panel, HDR10 & Google Assistant',
    shortDescBase: 'TCL S51K Series 43-inch non-QLED Smart Google TV. Key feature: Smart Google TV.',
  }),
  buildTvEntry({
    gmcId: 'TCL-S51K-50',
    slug: 'tcl-s51k-50-inch-smart-google-tv-pakistan',
    brand: 'TCL',
    title: 'TCL S51K 50 Inch Smart Google TV',
    modelSeries: 'S51K Series',
    itemGroupId: 'TCL-S51K',
    screenSize: '50"',
    price: 89900,
    productType: 'TVs > TCL > Non-QLED > S51K Series',
    typeKeyFeature: 'Smart Google TV',
    priceNote: 'Listed price 89,900',
    images: ['https://avlive.com.pk/images/products/tv-tcl-s51k.jpg'],
    resolution: 'High-Definition Large-Screen LED Panel',
    panelAndEngine: 'High-Contrast HVA Panel with Slim Bezel Architecture',
    hdrAndColor: 'HDR10 Support & Enhanced Color Optimization',
    motionAndRefresh: '60Hz Native Refresh Rate',
    smartOs: 'Google TV OS with Built-in Google Assistant & Wireless Screen Mirroring',
    audio: 'Dolby Audio Stereo Speakers',
    connectivity: '2 × HDMI, 1 × USB, Built-in Wi-Fi, Bluetooth 5.0, LAN & Optical',
    designAndWarranty: 'Metallic Slim Bezel-less Design • Official TCL Pakistan Warranty',
    highlight: 'TCL S51K 50" Smart Google TV with HVA Panel, HDR10, Dolby Audio & Slim Frame',
    shortDescBase: 'TCL S51K Series 50-inch non-QLED Smart Google TV. Key feature: Smart Google TV.',
  }),

  // TCL P79L Series (55", 65")
  buildTvEntry({
    gmcId: 'TCL-P79L-55',
    slug: 'tcl-p79l-55-inch-4k-google-tv-pakistan',
    brand: 'TCL',
    title: 'TCL P79L 55 Inch 4K Google TV',
    modelSeries: 'P79L Series',
    itemGroupId: 'TCL-P79L',
    screenSize: '55"',
    price: 166899,
    productType: 'TVs > TCL > Non-QLED > P79L Series',
    typeKeyFeature: '4K Google TV',
    priceNote: 'Listed price 166,899',
    images: ['https://avlive.com.pk/images/products/tv-tcl-p79l.jpg'],
    resolution: '4K Ultra HD (3840 × 2160)',
    panelAndEngine: 'High-Contrast HVA Panel with TCL AiPQ Processor',
    hdrAndColor: 'Dolby Vision, HDR10+ & Wide Color Gamut Calibration',
    motionAndRefresh: '60Hz Native with MEMC & Low-Latency Game Master',
    smartOs: 'Google TV OS with Hands-Free Voice Control & AirPlay / Chromecast',
    audio: 'Dolby Atmos Immersive Audio Processing',
    connectivity: '3 × HDMI 2.1 (eARC), 1 × USB, Dual-Band Wi-Fi, Bluetooth 5.0, LAN',
    designAndWarranty: 'Ultra-Slim Metallic Uni-Body • Official TCL Pakistan Warranty',
    highlight: 'TCL P79L 55" 4K Google TV with HVA Panel, AiPQ Processor, Dolby Vision & Dolby Atmos',
    shortDescBase: 'TCL P79L Series 55-inch non-QLED 4K Google TV. Key feature: 4K Google TV.',
  }),
  buildTvEntry({
    gmcId: 'TCL-P79L-65',
    slug: 'tcl-p79l-65-inch-4k-google-tv-pakistan',
    brand: 'TCL',
    title: 'TCL P79L 65 Inch 4K Google TV',
    modelSeries: 'P79L Series',
    itemGroupId: 'TCL-P79L',
    screenSize: '65"',
    price: 219499,
    productType: 'TVs > TCL > Non-QLED > P79L Series',
    typeKeyFeature: '4K Google TV',
    priceNote: 'Listed range 219,499–264,999; feed price uses lowest',
    images: ['https://avlive.com.pk/images/products/tv-tcl-p79l.jpg'],
    resolution: '4K Ultra HD (3840 × 2160)',
    panelAndEngine: 'Large-Format 65" HVA Panel with TCL AiPQ Processor',
    hdrAndColor: 'Dolby Vision, HDR10+ & Wide Color Gamut Calibration',
    motionAndRefresh: '60Hz Native with MEMC & Game Master Low-Latency Mode',
    smartOs: 'Google TV OS with Hands-Free Voice Control & Built-in Chromecast',
    audio: 'Dolby Atmos Immersive Audio Processing',
    connectivity: '3 × HDMI 2.1 (eARC), 1 × USB, Dual-Band Wi-Fi, Bluetooth 5.0, LAN',
    designAndWarranty: 'Ultra-Slim Metallic Uni-Body • Official TCL Pakistan Warranty',
    highlight: 'TCL P79L 65" 4K Google TV with HVA Panel, AiPQ Processor, Dolby Vision & Atmos',
    shortDescBase: 'TCL P79L Series 65-inch non-QLED 4K Google TV. Key feature: 4K Google TV.',
  }),

  // TCL T6C / T6D Series (65")
  buildTvEntry({
    gmcId: 'TCL-T6C-T6D-65',
    slug: 'tcl-t6c-t6d-65-inch-4k-google-tv-pakistan',
    brand: 'TCL',
    title: 'TCL T6C / T6D 65 Inch 4K Google TV',
    modelSeries: 'T6C / T6D Series',
    itemGroupId: 'TCL-T6C-T6D',
    screenSize: '65"',
    price: 203000,
    productType: 'TVs > TCL > Non-QLED > T6C / T6D Series',
    typeKeyFeature: '4K Google TV',
    priceNote: 'Listed price 203,000',
    images: ['https://avlive.com.pk/images/products/tv-tcl-t6c-t6d.jpg'],
    resolution: '4K Ultra HD (3840 × 2160)',
    panelAndEngine: 'High-Contrast HVA Panel (5000:1 Native Contrast) with TCL AiPQ Processor',
    hdrAndColor: 'Dolby Vision, HDR10+ & HLG (Wide Color Volume)',
    motionAndRefresh: '60Hz Native with MEMC & Game Master HDMI 2.1 eARC',
    smartOs: 'Google TV OS with Hands-Free Google Assistant & Chromecast',
    audio: 'Dolby Atmos & DTS Virtual:X Spatial Sound',
    connectivity: '3 × HDMI 2.1 (eARC / ALLM), 1 × USB, Dual-Band Wi-Fi, Bluetooth, LAN',
    designAndWarranty: 'Metallic Bezel-less Architecture • Official TCL Pakistan Warranty',
    highlight: 'TCL T6C / T6D 65" 4K Google TV with HVA Panel, AiPQ Processor, Dolby Vision & Atmos',
    shortDescBase: 'TCL T6C / T6D Series 65-inch non-QLED 4K Google TV. Key feature: 4K Google TV.',
  }),

  // TCL P8US Series (55")
  buildTvEntry({
    gmcId: 'TCL-P8US-55',
    slug: 'tcl-p8us-55-inch-4k-android-tv-pakistan',
    brand: 'TCL',
    title: 'TCL P8US 55 Inch 4K Android TV',
    modelSeries: 'P8US Series',
    itemGroupId: 'TCL-P8US',
    screenSize: '55"',
    price: 83999,
    productType: 'TVs > TCL > Non-QLED > P8US Series',
    typeKeyFeature: '4K Android / Smart TV',
    priceNote: 'Listed price 83,999',
    images: ['https://avlive.com.pk/images/products/tv-tcl-p8us.jpg'],
    resolution: '4K Ultra HD (3840 × 2160)',
    panelAndEngine: 'Wide Color Gamut 4K LED Panel with Micro Dimming Backlight Control',
    hdrAndColor: 'HDR10 & HLG (Over 1 Billion Color Shades)',
    motionAndRefresh: '60Hz Native Refresh Rate',
    smartOs: 'Android TV OS with Google Assistant, Play Store, YouTube & Netflix',
    audio: 'Dolby Audio with 5.1 Surround Decoding & Bluetooth Audio Output',
    connectivity: '3 × HDMI, 2 × USB, Wi-Fi, Bluetooth, Ethernet LAN & Audio Out',
    designAndWarranty: 'Slim Metallic Titanium-Alloy Frame • Official TCL Pakistan Warranty',
    highlight: 'TCL P8US 55" 4K UHD Android Smart TV with Micro Dimming, HDR10 & Dolby Audio',
    shortDescBase: 'TCL P8US Series 55-inch non-QLED 4K Android / Smart TV. Key feature: 4K Android / Smart TV.',
  }),

  // ============================================
  // SAMSUNG TELEVISIONS (10 SKUs across 6 Series)
  // ============================================
  // Samsung U8000F Series (43", 55", 65")
  buildTvEntry({
    gmcId: 'SAM-U8000F-43',
    slug: 'samsung-u8000f-43-inch-4k-crystal-uhd-smart-tv-pakistan',
    brand: 'Samsung',
    title: 'Samsung U8000F 43 Inch 4K Crystal UHD Smart TV',
    modelSeries: 'U8000F Series',
    itemGroupId: 'SAM-U8000F',
    screenSize: '43"',
    price: 98000,
    productType: 'TVs > Samsung > LED & Crystal UHD > U8000F Series',
    typeKeyFeature: '4K Crystal UHD Smart TV',
    priceNote: 'Listed range 98,000–103,000; feed price uses lowest',
    images: [
      'https://avlive.com.pk/images/products/tv-samsung-u8000f.jpg',
      'https://avlive.com.pk/images/products/tv-samsung-u8000f-angle.jpg',
    ],
    resolution: '4K Ultra HD (3840 × 2160)',
    panelAndEngine: 'Crystal Processor 4K with Intelligent 4K Upscaling (MetalStream AirSlim)',
    hdrAndColor: 'Dynamic Crystal Color, HDR10+ & Contrast Enhancer',
    motionAndRefresh: '50Hz / 60Hz with Motion Xcelerator & Auto Low Latency Mode (ALLM)',
    smartOs: 'Samsung Tizen OS Smart TV with SmartThings Hub & Samsung Knox Security',
    audio: '20W 2-Channel Speakers with Object Tracking Sound Lite (OTS Lite) & Q-Symphony',
    connectivity: '3 × HDMI (eARC), 1 × USB-A, Wi-Fi 5, Bluetooth 5.2, Ethernet LAN & AirPlay',
    designAndWarranty: 'Ultra-Thin AirSlim Design • Official Samsung Pakistan Warranty',
    highlight: 'Samsung U8000F 43" 4K Crystal UHD Smart TV with Crystal Processor 4K, AirSlim & Tizen OS',
    shortDescBase: 'Samsung U8000F Series 43-inch 4K Crystal UHD Smart TV. Key feature: 4K Crystal UHD Smart TV.',
  }),
  buildTvEntry({
    gmcId: 'SAM-U8000F-55',
    slug: 'samsung-u8000f-55-inch-4k-crystal-uhd-smart-tv-pakistan',
    brand: 'Samsung',
    title: 'Samsung U8000F 55 Inch 4K Crystal UHD Smart TV',
    modelSeries: 'U8000F Series',
    itemGroupId: 'SAM-U8000F',
    screenSize: '55"',
    price: 142000,
    productType: 'TVs > Samsung > LED & Crystal UHD > U8000F Series',
    typeKeyFeature: '4K Crystal UHD Smart TV',
    priceNote: 'Listed range 142,000–157,000; feed price uses lowest',
    images: [
      'https://avlive.com.pk/images/products/tv-samsung-u8000f.jpg',
      'https://avlive.com.pk/images/products/tv-samsung-u8000f-angle.jpg',
    ],
    resolution: '4K Ultra HD (3840 × 2160)',
    panelAndEngine: 'Crystal Processor 4K with Intelligent 4K Upscaling (MetalStream AirSlim)',
    hdrAndColor: 'Dynamic Crystal Color, HDR10+ & Contrast Enhancer',
    motionAndRefresh: '50Hz / 60Hz with Motion Xcelerator & Auto Low Latency Mode (ALLM)',
    smartOs: 'Samsung Tizen OS Smart TV with SmartThings Hub & Samsung Knox Security',
    audio: '20W 2-Channel Speakers with OTS Lite, Adaptive Sound & Q-Symphony',
    connectivity: '3 × HDMI (eARC), 1 × USB-A, Wi-Fi 5, Bluetooth 5.2, Ethernet LAN & AirPlay',
    designAndWarranty: 'Ultra-Thin AirSlim Design • Official Samsung Pakistan Warranty',
    highlight: 'Samsung U8000F 55" 4K Crystal UHD Smart TV with Crystal Processor 4K, OTS Lite & Tizen OS',
    shortDescBase: 'Samsung U8000F Series 55-inch 4K Crystal UHD Smart TV. Key feature: 4K Crystal UHD Smart TV.',
  }),
  buildTvEntry({
    gmcId: 'SAM-U8000F-65',
    slug: 'samsung-u8000f-65-inch-4k-crystal-uhd-smart-tv-pakistan',
    brand: 'Samsung',
    title: 'Samsung U8000F 65 Inch 4K Crystal UHD Smart TV',
    modelSeries: 'U8000F Series',
    itemGroupId: 'SAM-U8000F',
    screenSize: '65"',
    price: 209000,
    productType: 'TVs > Samsung > LED & Crystal UHD > U8000F Series',
    typeKeyFeature: '4K Crystal UHD Smart TV',
    priceNote: 'Listed price 209,000',
    images: [
      'https://avlive.com.pk/images/products/tv-samsung-u8000f.jpg',
      'https://avlive.com.pk/images/products/tv-samsung-u8000f-angle.jpg',
    ],
    resolution: '4K Ultra HD (3840 × 2160)',
    panelAndEngine: 'Crystal Processor 4K with Intelligent 4K Upscaling (MetalStream AirSlim)',
    hdrAndColor: 'Dynamic Crystal Color, HDR10+ & Contrast Enhancer',
    motionAndRefresh: '50Hz / 60Hz with Motion Xcelerator & ALLM',
    smartOs: 'Samsung Tizen OS Smart TV with SmartThings Hub & Samsung Knox Security',
    audio: '20W 2-Channel Speakers with OTS Lite, Adaptive Sound & Q-Symphony',
    connectivity: '3 × HDMI (eARC), 1 × USB-A, Wi-Fi 5, Bluetooth 5.2, Ethernet LAN & AirPlay',
    designAndWarranty: 'Ultra-Thin AirSlim Design for Boardrooms & Executive Rooms • Official Samsung Warranty',
    highlight: 'Samsung U8000F 65" 4K Crystal UHD Smart TV with AirSlim Profile, Knox Security & Tizen OS',
    shortDescBase: 'Samsung U8000F Series 65-inch 4K Crystal UHD Smart TV. Key feature: 4K Crystal UHD Smart TV.',
  }),

  // Samsung DU8000 Series (85")
  buildTvEntry({
    gmcId: 'SAM-DU8000-85',
    slug: 'samsung-du8000-85-inch-4k-crystal-uhd-smart-tv-pakistan',
    brand: 'Samsung',
    title: 'Samsung DU8000 85 Inch 4K Crystal UHD Smart TV',
    modelSeries: 'DU8000 Series',
    itemGroupId: 'SAM-DU8000',
    screenSize: '85"',
    price: 685000,
    productType: 'TVs > Samsung > LED & Crystal UHD > DU8000 Series',
    typeKeyFeature: '4K Crystal UHD Smart TV',
    priceNote: 'Listed price 685,000',
    images: [
      'https://avlive.com.pk/images/products/tv-samsung-du8000.jpg',
      'https://avlive.com.pk/images/products/tv-samsung-du8000-angle.jpg',
    ],
    resolution: '4K Ultra HD (3840 × 2160)',
    panelAndEngine: '85" Flagship Dynamic Crystal Display with Crystal Processor 4K Upscaling',
    hdrAndColor: 'Dynamic Crystal Color (1 Billion Shades), HDR10+ & UHD Dimming',
    motionAndRefresh: 'Motion Xcelerator with Auto Low Latency Mode (ALLM)',
    smartOs: 'Samsung Tizen OS with SmartThings, Bixby Voice, Multi-View & Knox Security',
    audio: '20W 2CH with Object Tracking Sound Lite (OTS Lite), Adaptive Sound & Q-Symphony',
    connectivity: '3 × HDMI (eARC), 2 × USB-A, Wi-Fi 5, Bluetooth 5.2, Ethernet LAN & AirPlay 2',
    designAndWarranty: '27mm Ultra-Slim AirSlim Executive Display • Official Samsung Pakistan Warranty',
    highlight: 'Samsung DU8000 85" Flagship 4K Crystal UHD AirSlim Display with Dynamic Crystal Color & Tizen OS',
    shortDescBase: 'Samsung DU8000 Series 85-inch 4K Crystal UHD Smart TV. Key feature: 4K Crystal UHD Smart TV.',
  }),

  // Samsung DU7000 Series (43", 75")
  buildTvEntry({
    gmcId: 'SAM-DU7000-43',
    slug: 'samsung-du7000-43-inch-4k-crystal-uhd-smart-tv-pakistan',
    brand: 'Samsung',
    title: 'Samsung DU7000 43 Inch 4K Crystal UHD Smart TV',
    modelSeries: 'DU7000 Series',
    itemGroupId: 'SAM-DU7000',
    screenSize: '43"',
    price: 83500,
    productType: 'TVs > Samsung > LED & Crystal UHD > DU7000 Series',
    typeKeyFeature: '4K Crystal UHD Smart TV',
    priceNote: 'Listed range 83,500–95,900; feed price uses lowest',
    images: [
      'https://avlive.com.pk/images/products/tv-samsung-du7000.jpg',
      'https://avlive.com.pk/images/products/tv-samsung-du7000-angle.jpg',
    ],
    resolution: '4K Ultra HD (3840 × 2160)',
    panelAndEngine: 'Crystal Processor 4K with 4K Upscaling & Mega Contrast',
    hdrAndColor: 'PurColor Technology, HDR10+ & Contrast Enhancer',
    motionAndRefresh: '50Hz / 60Hz with Motion Xcelerator & ALLM',
    smartOs: 'Samsung Tizen OS Smart TV with SmartThings & Samsung Knox Security',
    audio: '20W 2CH with OTS Lite, Adaptive Sound & Q-Symphony Soundbar Sync',
    connectivity: '3 × HDMI (eARC), 1 × USB-A, Wi-Fi 5, Bluetooth 5.2, Ethernet LAN',
    designAndWarranty: '3-Bezel-less Slim Look • Official Samsung Pakistan Warranty',
    highlight: 'Samsung DU7000 43" 4K Crystal UHD Smart TV with PurColor, Crystal Processor 4K & Tizen OS',
    shortDescBase: 'Samsung DU7000 Series 43-inch 4K Crystal UHD Smart TV. Key feature: 4K Crystal UHD Smart TV.',
  }),
  buildTvEntry({
    gmcId: 'SAM-DU7000-75',
    slug: 'samsung-du7000-75-inch-4k-crystal-uhd-smart-tv-pakistan',
    brand: 'Samsung',
    title: 'Samsung DU7000 75 Inch 4K Crystal UHD Smart TV',
    modelSeries: 'DU7000 Series',
    itemGroupId: 'SAM-DU7000',
    screenSize: '75"',
    price: 365000,
    productType: 'TVs > Samsung > LED & Crystal UHD > DU7000 Series',
    typeKeyFeature: '4K Crystal UHD Smart TV',
    priceNote: 'Listed price 365,000',
    images: [
      'https://avlive.com.pk/images/products/tv-samsung-du7000.jpg',
      'https://avlive.com.pk/images/products/tv-samsung-du7000-angle.jpg',
    ],
    resolution: '4K Ultra HD (3840 × 2160)',
    panelAndEngine: '75" Large-Format Crystal Processor 4K with 4K Upscaling & Mega Contrast',
    hdrAndColor: 'PurColor Technology, HDR10+ & Contrast Enhancer',
    motionAndRefresh: '50Hz / 60Hz with Motion Xcelerator & ALLM',
    smartOs: 'Samsung Tizen OS Smart TV with SmartThings & Samsung Knox Security',
    audio: '20W 2CH with OTS Lite, Adaptive Sound & Q-Symphony',
    connectivity: '3 × HDMI (eARC), 1 × USB-A, Wi-Fi 5, Bluetooth 5.2, Ethernet LAN',
    designAndWarranty: '3-Bezel-less Large Conference Display • Official Samsung Pakistan Warranty',
    highlight: 'Samsung DU7000 75" Large-Format 4K Crystal UHD Smart TV with PurColor & Tizen OS',
    shortDescBase: 'Samsung DU7000 Series 75-inch 4K Crystal UHD Smart TV. Key feature: 4K Crystal UHD Smart TV.',
  }),

  // Samsung F6000 Series (43")
  buildTvEntry({
    gmcId: 'SAM-F6000-43',
    slug: 'samsung-f6000-43-inch-full-hd-smart-tv-pakistan',
    brand: 'Samsung',
    title: 'Samsung F6000 43 Inch Full HD Smart TV',
    modelSeries: 'F6000 Series',
    itemGroupId: 'SAM-F6000',
    screenSize: '43"',
    price: 71000,
    productType: 'TVs > Samsung > LED & Crystal UHD > F6000 Series',
    typeKeyFeature: 'Full HD Smart TV',
    priceNote: 'Listed range 71,000–84,990; feed price uses lowest',
    images: [
      'https://avlive.com.pk/images/products/tv-samsung-f6000.jpg',
      'https://avlive.com.pk/images/products/tv-samsung-f6000-angle.jpg',
    ],
    resolution: 'Full HD (1920 × 1080)',
    panelAndEngine: 'Samsung Hyper Real Picture Engine with Micro Dimming Pro',
    hdrAndColor: 'PurColor, HDR, HDR10+ & Contrast Enhancer',
    motionAndRefresh: '50Hz / 60Hz Native Refresh Rate',
    smartOs: 'Samsung Tizen OS Smart TV with Samsung Knox Security & Apple AirPlay',
    audio: '20W 2-Channel Speakers with OTS Lite, Adaptive Sound & Q-Symphony',
    connectivity: '2 × HDMI, 1 × USB-A, Built-in Wi-Fi, Bluetooth, Ethernet LAN & RF',
    designAndWarranty: 'Slim Look 3-Bezel-less Frame • Official Samsung Pakistan Warranty',
    highlight: 'Samsung F6000 43" Full HD Smart TV with Hyper Real Engine, Knox Security & Tizen OS',
    shortDescBase: 'Samsung F6000 Series 43-inch Full HD Smart TV. Key feature: Full HD Smart TV.',
  }),

  // Samsung H5000 Series (32")
  buildTvEntry({
    gmcId: 'SAM-H5000-32',
    slug: 'samsung-h5000-32-inch-hd-smart-led-tv-pakistan',
    brand: 'Samsung',
    title: 'Samsung H5000 32 Inch HD Smart LED TV',
    modelSeries: 'H5000 Series',
    itemGroupId: 'SAM-H5000',
    screenSize: '32"',
    price: 55999,
    productType: 'TVs > Samsung > LED & Crystal UHD > H5000 Series',
    typeKeyFeature: 'HD Smart LED TV',
    priceNote: 'Listed range 55,999–57,990; feed price uses lowest',
    images: [
      'https://avlive.com.pk/images/products/tv-samsung-h5000.jpg',
      'https://avlive.com.pk/images/products/tv-samsung-h5000-angle.jpg',
    ],
    resolution: 'HD Ready (1366 × 768)',
    panelAndEngine: 'Samsung Hyper Real Picture Engine with Micro Dimming Pro',
    hdrAndColor: 'PurColor, HDR / HDR10+ & Mega Contrast',
    motionAndRefresh: '50Hz Native Refresh Rate',
    smartOs: 'Samsung Tizen OS Smart TV with Streaming Apps & Knox Security',
    audio: '10W 2-Channel Speakers with Object Tracking Sound Lite (OTS Lite) & Adaptive Sound',
    connectivity: '2 × HDMI, 1 × USB-A, Built-in Wi-Fi, Bluetooth & Ethernet LAN',
    designAndWarranty: 'Compact Slim Look Frame for Offices, Reception & Lounges • Official Samsung Warranty',
    highlight: 'Samsung H5000 32" HD Smart LED TV with Hyper Real Engine, OTS Lite & Tizen OS',
    shortDescBase: 'Samsung H5000 Series 32-inch HD Smart LED TV. Key feature: HD Smart LED TV.',
  }),

  // Samsung T5300 Series (32", 43")
  buildTvEntry({
    gmcId: 'SAM-T5300-32',
    slug: 'samsung-t5300-32-inch-hd-smart-led-tv-pakistan',
    brand: 'Samsung',
    title: 'Samsung T5300 32 Inch HD Smart LED TV',
    modelSeries: 'T5300 Series',
    itemGroupId: 'SAM-T5300',
    screenSize: '32"',
    price: 61999,
    productType: 'TVs > Samsung > LED & Crystal UHD > T5300 Series',
    typeKeyFeature: 'HD Smart LED TV',
    priceNote: 'Listed range 61,999–78,999; feed price uses lowest',
    images: ['https://avlive.com.pk/images/products/tv-samsung-t5300-32.jpg'],
    resolution: 'HD (1366 × 768) with Ultra Clean View Upscaling',
    panelAndEngine: 'Samsung Hyper Real Picture Engine with Mega Contrast',
    hdrAndColor: 'PurColor, HDR & Contrast Enhancer',
    motionAndRefresh: '50Hz / 60Hz Native Refresh Rate',
    smartOs: 'Samsung Tizen OS Smart Hub with AirPlay 2 & Mobile Mirroring',
    audio: '10W 2-Channel Speakers with Dolby Digital Plus',
    connectivity: '2 × HDMI, 1 × USB, Built-in Wi-Fi, Ethernet LAN, Component & Optical',
    designAndWarranty: 'Classic Slim Black Profile • Official Samsung Pakistan Warranty',
    highlight: 'Samsung T5300 32" HD Smart LED TV with PurColor, HDR, Dolby Digital Plus & Tizen OS',
    shortDescBase: 'Samsung T5300 Series 32-inch HD Smart LED TV. Key feature: HD Smart LED TV.',
  }),
  buildTvEntry({
    gmcId: 'SAM-T5300-43',
    slug: 'samsung-t5300-43-inch-full-hd-smart-tv-pakistan',
    brand: 'Samsung',
    title: 'Samsung T5300 43 Inch Full HD Smart TV',
    modelSeries: 'T5300 Series',
    itemGroupId: 'SAM-T5300',
    screenSize: '43"',
    price: 104900,
    productType: 'TVs > Samsung > LED & Crystal UHD > T5300 Series',
    typeKeyFeature: 'Full HD Smart TV',
    priceNote: 'Listed range 104,900–111,999; feed price uses lowest',
    images: ['https://avlive.com.pk/images/products/tv-samsung-t5300-43.jpg'],
    resolution: 'Full HD (1920 × 1080) with Ultra Clean View',
    panelAndEngine: 'Samsung Hyper Real Picture Engine with Mega Contrast',
    hdrAndColor: 'PurColor, HDR & Contrast Enhancer',
    motionAndRefresh: '50Hz / 60Hz Native Refresh Rate',
    smartOs: 'Samsung Tizen OS Smart Hub with AirPlay 2 & One Remote Support',
    audio: '20W 2-Channel Speakers with Dolby Digital Plus',
    connectivity: '2 × HDMI, 1 × USB, Built-in Wi-Fi, Ethernet LAN, Component & Optical',
    designAndWarranty: 'Slim Glossy Black Frame • Official Samsung Pakistan Warranty',
    highlight: 'Samsung T5300 43" Full HD Smart TV with PurColor, HDR, 20W Dolby Audio & Tizen OS',
    shortDescBase: 'Samsung T5300 Series 43-inch Full HD Smart TV. Key feature: Full HD Smart TV.',
  }),
];

/**
 * Lookup map keyed by canonical `-pakistan` slug for direct spread into PRODUCT_GMC_METADATA.
 */
export const TV_CATALOG_GMC_METADATA: Record<string, TvCatalogGmcEntry> = Object.fromEntries(
  TV_CATALOG_ITEMS.map((item) => [item.slug, item])
);

/**
 * Direct SKU-to-canonical-slug mapping (e.g. "TCL-V6D-55" or "tcl-v6d-55" -> "tcl-v6d-55-inch-4k-google-tv-pakistan").
 */
export const TV_SKU_TO_CANONICAL_SLUG: Record<string, string> = Object.fromEntries(
  TV_CATALOG_ITEMS.flatMap((item) => [
    [item.gmcId, item.slug],
    [item.gmcId.toLowerCase(), item.slug],
  ])
);

/**
 * All canonical slugs in the LED TVs & Commercial Displays category (Samsung + TCL + Horion K6A).
 */
export const LED_TV_CATEGORY_PRODUCT_SLUGS: string[] = [
  ...TV_CATALOG_ITEMS.map((item) => item.slug),
  'horion-k6a-bundle-special-offer',
];

export interface ScreenSizeVariantLink {
  gmcId: string;
  slug: string;
  size: string;
  sizeInches: number;
  price: number;
  availability: 'in_stock' | 'out_of_stock' | 'preorder' | 'backorder';
  title: string;
  modelSeries: string;
  brand: string;
}

/**
 * Returns all sibling screen-size SKUs sharing the same `itemGroupId` (sorted ascending by inch size).
 * Works seamlessly on both ProductDetails (Screen Size Switcher) and Category/Shop cards.
 */
export function getScreenSizeVariantsForSlug(slugOrId?: string | null): ScreenSizeVariantLink[] {
  if (!slugOrId) return [];
  const normalized = String(slugOrId).trim();
  const resolvedSlug =
    TV_CATALOG_GMC_METADATA[normalized]?.slug ||
    TV_SKU_TO_CANONICAL_SLUG[normalized] ||
    TV_SKU_TO_CANONICAL_SLUG[normalized.toLowerCase()];
  if (!resolvedSlug) return [];

  const current = TV_CATALOG_GMC_METADATA[resolvedSlug];
  if (!current || !current.itemGroupId) return [];

  return TV_CATALOG_ITEMS.filter((item) => item.itemGroupId === current.itemGroupId)
    .map((item) => ({
      gmcId: item.gmcId,
      slug: item.slug,
      size: item.size,
      sizeInches: parseInt(item.size.replace(/\D/g, ''), 10) || 0,
      price: item.salePrice,
      availability: item.availability,
      title: item.title,
      modelSeries: item.modelSeries,
      brand: item.brand,
    }))
    .sort((a, b) => a.sizeInches - b.sizeInches);
}

/**
 * Returns a TV catalog metadata entry by canonical slug or raw SKU ID (e.g. TCL-V6D-55).
 */
export function getTvCatalogEntry(slugOrId?: string | null): TvCatalogGmcEntry | null {
  if (!slugOrId) return null;
  const key = String(slugOrId).trim();
  const slug =
    TV_CATALOG_GMC_METADATA[key]?.slug ||
    TV_SKU_TO_CANONICAL_SLUG[key] ||
    TV_SKU_TO_CANONICAL_SLUG[key.toLowerCase()];
  return slug ? TV_CATALOG_GMC_METADATA[slug] || null : null;
}
