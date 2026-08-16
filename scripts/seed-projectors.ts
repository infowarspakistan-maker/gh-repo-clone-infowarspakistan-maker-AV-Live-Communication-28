import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import fs from 'fs';

// 1. Initialize Firebase Admin
let config: any = {};
try {
  config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
} catch (e) {
  console.warn('Could not read firebase-applet-config.json:', e);
}

if (getApps().length === 0) {
  const serviceAccountPath = 'firebase-admin.json';
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    initializeApp({
      credential: cert(serviceAccount)
    });
    console.log('Initialized with service account credentials from:', serviceAccountPath);
  } else {
    initializeApp({
      projectId: config.projectId || undefined
    });
    console.log('Initialized with ambient/applet credentials for project:', config.projectId);
  }
}

const db = getFirestore(config.firestoreDatabaseId || undefined);

async function seedProjectors() {
  console.log('🚀 Seeding Projectors Category and Products to Firestore...');

  // 1. Seed Projectors Category
  const categoryId = 'child-projectors';
  await db.collection('categories').doc(categoryId).set({
    name: 'Projectors',
    slug: 'projectors',
    description: 'Premium Projectors and Displays category and resources.',
    parentId: 'parent-unified',
    parent: 'parent-unified',
    type: 'product',
    isActive: true,
    displayOrder: 5,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  console.log('✅ Seeded child-projectors category');

  // 2. Define Projector Products
  const projectors = [
    {
      productName: 'Epson Lifestudio Flex Plus',
      sku: 'EPS-LS-FLEX-PLUS',
      brand: 'Epson',
      regularPrice: 195000,
      salePrice: 185000,
      stockQuantity: 15,
      lowStockThreshold: 3,
      isActive: true,
      categoryIds: ['child-projectors', 'parent-unified'],
      categorySlugs: ['projectors', 'unified-communications'],
      images: ['https://images.unsplash.com/photo-1535016120720-40c646be5580?w=800&q=80'],
      shortDescription: 'Portable lifestyle smart projector featuring built-in Google TV and Sound by Bose.',
      description: 'The Epson Lifestudio Flex Plus is a premium portable lifestyle projector from Epson’s revolutionary Lifestudio lineup – the world’s first smart streaming projectors featuring Sound by Bose technology. Designed for both indoor and outdoor entertainment, this sleek projector combines modern design with Epson’s advanced 3-chip 3LCD Triple Core Engine technology, delivering a bright 4K PRO-UHD picture up to 150 inches. The built-in Google TV provides seamless access to all your favourite streaming apps, while the Epson Projection Studio app for iOS and Android makes it easy to create and project personalized interactive experiences. The Flex Plus features a sleek built-in tiltable stand with ambient lighting, elevating the surrounding environment. With EpiqSense 2.0 auto-setup, the projector provides perfect focus, colour and alignment in seconds.',
      specifications: 'Resolution: 4K PRO-UHD; Brightness: 3000 Lumens; Technology: 3-chip 3LCD; Audio: Built-in Bose Sound System; Smart OS: Google TV; Image Size: 30 to 150 inches.',
      seoTags: 'Epson projector, portable smart projector, 4K lifestyle projector, Bose sound projector',
      seoMetaDescription: 'Buy Epson Lifestudio Flex Plus smart 4K projector with Sound by Bose. Top-rated portable smart projector available in Pakistan at AV Live.',
      variations: [],
    },
    {
      productName: 'Sony BRAVIA Projector 7',
      sku: 'SONY-VPL-XW5000',
      brand: 'Sony',
      regularPrice: 1250000,
      salePrice: 1195000,
      stockQuantity: 5,
      lowStockThreshold: 1,
      isActive: true,
      categoryIds: ['child-projectors', 'parent-unified'],
      categorySlugs: ['projectors', 'unified-communications'],
      images: ['https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80'],
      shortDescription: 'Native 4K laser home theater projector with Sony BRAVIA XR processing.',
      description: 'Experience true cinematic bliss at home with the Sony BRAVIA Projector 7. Powered by the state-of-the-art BRAVIA XR Processor for Projectors, it features cognitive intelligence for spectacular contrast, vibrant colors, and pure detail. Utilizing a highly efficient laser light source, this projector offers 2,000 lumens of consistent brightness, making it perfect for dedicated home theaters. With Native 4K resolution (3840 x 2160) and pristine ARC-F lens technology, every frame is rendered with master-class precision.',
      specifications: 'Resolution: Native 4K UHD; Light Source: Laser Diode; Brightness: 2000 Lumens; Processor: BRAVIA XR; Dynamic Range: HDR10 / HLG; Lens: Advanced Crisp Focus (ARC-F).',
      seoTags: 'Sony Bravia Projector, Native 4K laser projector, high-end home theater Pakistan, Sony XW5000',
      seoMetaDescription: 'Bring the theater home with the Sony BRAVIA Projector 7. Native 4K laser projection with cognitive HDR processing. Premium pricing from AV Live Pakistan.',
      variations: [],
    },
    {
      productName: 'Panasonic PT-RQ45K 4K Projector',
      sku: 'PAN-PT-RQ45K',
      brand: 'Panasonic',
      regularPrice: 8500000,
      salePrice: 8200000,
      stockQuantity: 2,
      lowStockThreshold: 1,
      isActive: true,
      categoryIds: ['child-projectors', 'parent-unified'],
      categorySlugs: ['projectors', 'unified-communications'],
      images: ['https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?w=800&q=80'],
      shortDescription: 'Ultra-brightness 45,000 Lumens 3-Chip DLP 4K laser projector for large venues.',
      description: 'The Panasonic PT-RQ45K is the ultimate large-venue projection workhorse. Delivering an astonishing 45,000 lumens of solid-state laser brightness and Native 4K resolution using 3-Chip DLP technology, this model is designed for massive outdoor events, mapping projection, stadiums, and high-end museums. Features Panasonic Quad Pixel Drive technology and dynamic contrast control for incredible image depth and lifelike realism.',
      specifications: 'Resolution: 4K UHD (With Quad Pixel Drive); Brightness: 45,000 Lumens; Light Source: SOLID SHINE Laser; Technology: 3-Chip DLP; Contrast: 20,000:1; Weight: 110 kg.',
      seoTags: 'Panasonic 45k projector, large venue projector, 3-Chip DLP, professional laser projection Pakistan',
      seoMetaDescription: 'Panasonic PT-RQ45K delivers 45,000 lumens of premium laser brightness for stadiums, mapping, and large event spaces. Authorized dealers in Pakistan.',
      variations: [],
    },
    {
      productName: 'Panasonic PT-VMZ82 Laser Projector',
      sku: 'PAN-PT-VMZ82',
      brand: 'Panasonic',
      regularPrice: 680000,
      salePrice: 645000,
      stockQuantity: 12,
      lowStockThreshold: 2,
      isActive: true,
      categoryIds: ['child-projectors', 'parent-unified'],
      categorySlugs: ['projectors', 'unified-communications'],
      images: ['https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80'],
      shortDescription: '8,000 Lumens WUXGA laser projector, compact and versatile for classrooms and meetings.',
      description: 'The Panasonic PT-VMZ82 is the world\'s smallest and lightest 8,000-lumen LCD laser projector. Perfectly suited for bright corporate meeting rooms, school lecture halls, and interactive spaces, it delivers clear WUXGA resolution with a highly reliable SOLID SHINE laser light engine that requires virtually zero maintenance for 20,000 hours. Supports 1.6x zoom, lens shift, and Digital Link for seamless integration.',
      specifications: 'Resolution: WUXGA (1920x1200); Brightness: 8,000 Lumens; Technology: 3LCD Laser; Zoom: 1.6x Manual; Inputs: HDMI, HDBaseT/Digital Link, VGA, LAN.',
      seoTags: 'Panasonic VMZ82, 8000 lumens laser projector, office projector Pakistan, corporate AV display',
      seoMetaDescription: 'Buy the compact Panasonic PT-VMZ82 8,000-lumen laser projector. Ideal for high-brightness classrooms and corporate offices in Lahore, Karachi, Islamabad.',
      variations: [],
    },
    {
      productName: 'BenQ TK705i 4K Gaming Projector',
      sku: 'BENQ-TK705I',
      brand: 'BenQ',
      regularPrice: 280000,
      salePrice: 260000,
      stockQuantity: 18,
      lowStockThreshold: 3,
      isActive: true,
      categoryIds: ['child-projectors', 'parent-unified'],
      categorySlugs: ['projectors', 'unified-communications'],
      images: ['https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80'],
      shortDescription: '4K HDR high-brightness gaming projector with low input lag.',
      description: 'The BenQ TK705i is a high-brightness 4K gaming projector designed for sports enthusiasts and competitive gamers. With 3,200 ANSI lumens, a low input lag of 16ms, and 4K HDR resolution, it brings gaming sessions and sports matches to life in any ambient lighting. Includes Google-certified Android TV built-in for endless entertainment streaming.',
      specifications: 'Resolution: 4K UHD (3840x2160); Brightness: 3,200 ANSI Lumens; Input Lag: 16ms at 4K/60Hz; Smart TV: Android TV; Contrast: 10,000:1; Color Gamut: 96% Rec.709.',
      seoTags: 'BenQ gaming projector, 4K gaming low lag, BenQ TK705i Pakistan, 4K sports projector',
      seoMetaDescription: 'Play games on a giant screen with BenQ TK705i 4K HDR high-brightness projector. Features 16ms ultra-low lag and smart Android TV. Buy now from AV Live.',
      variations: [],
    },
    {
      productName: 'BenQ W4100i 4K Home Cinema Projector',
      sku: 'BENQ-W4100I',
      brand: 'BenQ',
      regularPrice: 490000,
      salePrice: 465000,
      stockQuantity: 8,
      lowStockThreshold: 2,
      isActive: true,
      categoryIds: ['child-projectors', 'parent-unified'],
      categorySlugs: ['projectors', 'unified-communications'],
      images: ['https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80'],
      shortDescription: 'Premium 4K HDR home cinema projector with cinematic color coverage.',
      description: 'For true home cinema purists, the BenQ W4100i offers authentic color accuracy and filmmaker-intent calibration. Featuring 100% DCI-P3 color coverage, 4K UHD resolution, and HDR-PRO technology with local contrast enhancement, it delivers breathtaking visual detail and deep blacks in dark home theater rooms. Powered by Android TV for access to Netflix, Prime Video, and more.',
      specifications: 'Resolution: 4K UHD; Brightness: 3,000 ANSI Lumens; Color Coverage: 100% DCI-P3 / 100% Rec.709; HDR: HDR-PRO, HDR10+, HLG; Smart OS: Android TV.',
      seoTags: 'BenQ home cinema projector, BenQ W4100i Pakistan, 100% DCI-P3 projector, high end movie projector',
      seoMetaDescription: 'Indulge in cinematic perfection with BenQ W4100i 4K home theater projector. True DCI-P3 wide color gamut and premium HDR rendering.',
      variations: [],
    },
    {
      productName: 'Optoma GT4000UHD UST Laser Projector',
      sku: 'OPT-GT4000UHD',
      brand: 'Optoma',
      regularPrice: 395000,
      salePrice: 375000,
      stockQuantity: 14,
      lowStockThreshold: 2,
      isActive: true,
      categoryIds: ['child-projectors', 'parent-unified'],
      categorySlugs: ['projectors', 'unified-communications'],
      images: ['https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80'],
      shortDescription: 'Ultra short throw laser projector delivering high brightness 4K images from inches away.',
      description: 'The Optoma GT4000UHD is an ultra-short-throw 4K laser projector that displays massive images even when placed right next to your wall. Ideal for space-constrained living rooms and boardrooms, its high-power laser light source produces 4,000 lumens, ensuring crisp, vivid images even in ambient light. Features a long-lasting life of up to 30,000 hours and an eco-friendly chassis.',
      specifications: 'Resolution: 4K UHD; Brightness: 4,000 Lumens; Throw Ratio: 0.25:1 (Ultra Short Throw); Light Source: DuraCore Laser; Contrast Ratio: 2,000,000:1; Smart features: HDMI 2.0.',
      seoTags: 'Optoma UST projector, ultra short throw 4K, laser TV Pakistan, Optoma GT4000UHD',
      seoMetaDescription: 'Optoma GT4000UHD ultra-short-throw 4K laser projector. Enjoy a 120-inch screen from just inches away from your wall. Order today from AV Live Pakistan.',
      variations: [],
    },
    {
      productName: 'Optoma Photon Life PK32 Pocket Projector',
      sku: 'OPT-PK32-PHOTON',
      brand: 'Optoma',
      regularPrice: 110000,
      salePrice: 98000,
      stockQuantity: 25,
      lowStockThreshold: 5,
      isActive: true,
      categoryIds: ['child-projectors', 'parent-unified'],
      categorySlugs: ['projectors', 'unified-communications'],
      images: ['https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&q=80'],
      shortDescription: 'Ultra-portable pocket projector with built-in battery and media player.',
      description: 'The Optoma Photon Life PK32 is a pocket-sized smart projector designed for entertainment on the go. Equipped with a built-in battery that lasts up to 3.5 hours, an integrated media player, and Bluetooth audio, it lets you project movies, photos, and presentations directly from a USB stick, micro SD card, or wirelessly from your smartphone. A great accessory for camping and late-night backyard cinema.',
      specifications: 'Resolution: 1080p Full HD; Brightness: 800 Lumens; Battery Life: Up to 3.5 Hours; Connectivity: WiFi, Bluetooth, HDMI, USB, MicroSD; Speaker: 5W Built-in.',
      seoTags: 'Optoma pocket projector, mini smart projector, battery projector Pakistan, portable projector',
      seoMetaDescription: 'Shop the Optoma Photon Life PK32 ultra-portable mini projector with built-in battery and media player. Instant movie nights anywhere. Authorized delivery PK.',
      variations: [],
    },
    {
      productName: 'ViewSonic X1-4K Pro Xbox Projector',
      sku: 'VS-X1-4K-PRO',
      brand: 'ViewSonic',
      regularPrice: 350000,
      salePrice: 325000,
      stockQuantity: 16,
      lowStockThreshold: 3,
      isActive: true,
      categoryIds: ['child-projectors', 'parent-unified'],
      categorySlugs: ['projectors', 'unified-communications'],
      images: ['https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&q=80'],
      shortDescription: 'World\'s first projector designed for Xbox, offering high-speed 4K gaming.',
      description: 'The ViewSonic X1-4K Pro is a high-brightness LED projector engineered specifically for console gaming. As the world\'s first \'Designed for Xbox\' projector, it supports Xbox-exclusive resolution and refresh rate combinations, achieving a seamless 1440p at 120Hz or crisp 4K at 60Hz. Complemented by custom Harman Kardon speakers, it offers an audio-visual package that completely replaces conventional gaming TVs.',
      specifications: 'Resolution: 4K UHD; Brightness: 2,900 LED Lumens; Game Certification: Designed for Xbox; Refresh Rate: Up to 240Hz (at 1080p); Audio: Harman Kardon Speakers.',
      seoTags: 'ViewSonic Xbox projector, ViewSonic X1-4K Pro Pakistan, gaming LED projector, Harman Kardon audio',
      seoMetaDescription: 'Unleash the ultimate gaming experience with ViewSonic X1-4K Pro - the world\'s first \'Designed for Xbox\' 4K LED projector. Available at AV Live Pakistan.',
      variations: [],
    },
    {
      productName: 'ViewSonic LSD400W LED Projector',
      sku: 'VS-LSD400W',
      brand: 'ViewSonic',
      regularPrice: 175000,
      salePrice: 155000,
      stockQuantity: 30,
      lowStockThreshold: 5,
      isActive: true,
      categoryIds: ['child-projectors', 'parent-unified'],
      categorySlugs: ['projectors', 'unified-communications'],
      images: ['https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80'],
      shortDescription: 'High brightness WXGA lamp-free LED projector for classrooms and small offices.',
      description: 'The ViewSonic LSD400W is a sustainable, lamp-free LED business projector designed for cost-conscious organizations. Powered by third-generation LED technology, it provides 4,000 ANSI lumens of brightness and WXGA resolution, eliminating the hassle of lamp replacement and toxic mercury. Its energy-efficient design offers a 30,000-hour lifespan with zero maintenance.',
      specifications: 'Resolution: WXGA (1280x800); Brightness: 4,000 ANSI Lumens; Light Source: Lamp-free LED; Lifespan: Up to 30,000 Hours; Port: HDMI, USB Power, RS232.',
      seoTags: 'ViewSonic corporate projector, mercury free LED projector, ViewSonic LSD400W Pakistan',
      seoMetaDescription: 'Sustainable and bright. ViewSonic LSD400W is a lamp-free 4,000-lumen LED projector, perfect for offices and education setups in Pakistan.',
      variations: [],
    }
  ];

  for (const product of projectors) {
    await db.collection('products').doc(product.sku).set({
      ...product,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    console.log(`✅ Seeded projector product: ${product.productName}`);
  }

  console.log('🎉 Projector category and products seeded successfully!');
}

seedProjectors().then(() => {
  process.exit(0);
}).catch((err) => {
  console.error('❌ Projector seeding failed:', err);
  process.exit(1);
});
