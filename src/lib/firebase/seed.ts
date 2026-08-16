import { db } from "./client";
import {
  collection,
  doc,
  setDoc,
  serverTimestamp,
  getDocs,
  deleteDoc,
} from "firebase/firestore";

export async function seedDatabase() {
  console.log("Seeding database with current production data...");

  // Cleanup existing data to avoid duplicates
  try {
    const collectionsToClear = [
      "products",
      "categories",
      "services",
      "about",
      "contact",
      "settings",
      "homepage",
      "services_page",
      "blog_posts",
      "n8n_workflows"
    ];
    for (const collName of collectionsToClear) {
      const snap = await getDocs(collection(db, collName));
      for (const d of snap.docs) {
        await deleteDoc(doc(db, collName, d.id));
      }
      console.log(`Cleared ${collName}`);
    }
  } catch (e) {
    console.error("Error clearing old data:", e);
  }

  // 1. Seed Settings
  const settings = [
  {
    "id": "global",
    "phone": "0321 425 6263",
    "socialLinks": {
      "youtube": "https://youtube.com/@avlive",
      "linkedin": "https://linkedin.com/company/avlive",
      "twitter": "https://x.com/avlive",
      "facebook": "https://facebook.com/avlive",
      "instagram": "https://instagram.com/avlive"
    },
    "taxRate": 0.18,
    "logoUrl": "https://via.placeholder.com/200x60/1A2B4C/FFFFFF?text=AV+Live",
    "contactEmail": "info@avlive.com.pk",
    "siteName": "AV Live Communications",
    "seo": {
      "ogImage": "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&q=80",
      "keywords": "AV solutions Pakistan, video conferencing, IP phones, PA systems, AV integration",
      "title": "AV Live Communications – AV Solutions Pakistan",
      "description": "Video conferencing, IP phones, PA systems, and AV integration in Pakistan. Authorized Polycom & Cisco partners."
    },
    "address": "Shop, Johar Town Block N, Lahore",
    "faviconUrl": "https://via.placeholder.com/32x32/1A2B4C/FFFFFF?text=AL",
    "tagline": "Unifying People and Ideas Since 2010"
  },
  {
    "id": "payment",
    "bankAccountNumber": "1234-5678-9012",
    "bankSwiftCode": "HABBPKKA",
    "bankTransferInfo": "Bank Name: HBL (Habib Bank Limited)\nAccount Title: AV Live Communications\nAccount Number: 1234-5678-9012\nIBAN: PK36HBLB1234567890123456\nSwift Code: HABBPKKA",
    "isBankTransferEnabled": true,
    "codEnabled": true,
    "stripePublicKey": "pk_test_XXXXXXXXXXXXXXXXXXXXXXXX",
    "bankAccountTitle": "AV Live Communications",
    "bankIban": "PK36HBLB1234567890123456",
    "stripeSecretKey": "sk_test_XXXXXXXXXXXXXXXXXXXXXXXX",
    "isStripeEnabled": true,
    "currency": "PKR",
    "bankName": "HBL (Habib Bank Limited)",
    "stripeWebhookSecret": ""
  }
];
  for (const item of settings) {
    const { id, ...data } = item;
    await setDoc(doc(db, "settings", id), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  }

  // 2. Seed Homepage
  const homepage = [
  {
    "id": "main",
    "stats": {
      "teamMembers": 25,
      "happyClients": 500,
      "projectsCompleted": 1000,
      "yearsExperience": 10
    },
    "solutions": [
      {
        "iconUrl": "https://via.placeholder.com/64x64/1A2B4C/FFFFFF?text=💻",
        "link": "/solutions/smart-collaboration",
        "id": "sol-1",
        "title": "Smart Collaboration",
        "order": 1,
        "description": "Bundling Polycom, Cisco, and HP for hybrid workspaces."
      },
      {
        "id": "sol-2",
        "order": 2,
        "iconUrl": "https://via.placeholder.com/64x64/00B4D8/FFFFFF?text=📺",
        "description": "SMD displays, PA systems, and digital signage solutions.",
        "link": "/solutions/immersive-av",
        "title": "Immersive AV"
      },
      {
        "order": 3,
        "description": "Event management, expo organizing, and AV integration.",
        "iconUrl": "https://via.placeholder.com/64x64/1A2B4C/FFFFFF?text=🎯",
        "title": "Professional Services",
        "link": "/solutions/professional-services",
        "id": "sol-3"
      }
    ],
    "heroSlides": [
      {
        "overlayOpacity": 30,
        "ctaText": "Explore Solutions",
        "title": "Transform Your Workspace",
        "isActive": true,
        "mediaType": "image",
        "id": "slide-1",
        "subtitle": "Premium Video Conferencing Kits for Hybrid Teams",
        "textAlignment": "center",
        "order": 1,
        "imageUrl": "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1920&q=80",
        "ctaLink": "/products/video-conferencing"
      },
      {
        "order": 2,
        "overlayOpacity": 35,
        "title": "Immersive AV for Events",
        "ctaText": "Plan Your Event",
        "mediaType": "image",
        "ctaLink": "/services/corporate-events",
        "textAlignment": "center",
        "imageUrl": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1920&q=80",
        "isActive": true,
        "id": "slide-2",
        "subtitle": "From Corporate Expos to Esports Tournaments"
      },
      {
        "mediaType": "image",
        "title": "AI Automation for Business",
        "subtitle": "Deploy AI Agents & Digital Workers",
        "order": 3,
        "imageUrl": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1920&q=80",
        "id": "slide-3",
        "isActive": true,
        "overlayOpacity": 40,
        "ctaText": "Learn More",
        "textAlignment": "center",
        "ctaLink": "/services/ai-development"
      },
      {
        "ctaText": "View Security",
        "title": "Secure Your Premises",
        "textAlignment": "center",
        "subtitle": "HD IP Cameras & Access Control Systems",
        "order": 4,
        "imageUrl": "https://images.unsplash.com/photo-1558002038-1055907df827?w=1920&q=80",
        "ctaLink": "/products/ip-cameras",
        "id": "slide-4",
        "isActive": true,
        "mediaType": "image",
        "overlayOpacity": 35
      },
      {
        "title": "Crystal Clear Paging",
        "isActive": true,
        "id": "slide-5",
        "textAlignment": "center",
        "overlayOpacity": 30,
        "ctaText": "Explore PA Systems",
        "ctaLink": "/products/intercom-paging-access",
        "mediaType": "image",
        "subtitle": "Public Address Systems for Every Facility",
        "imageUrl": "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=1920&q=80",
        "order": 5
      }
    ],
    "brands": [
      { "id": "brand-1", "website": "https://www.poly.com", "logoUrl": "https://via.placeholder.com/150x50/1A2B4C/FFFFFF?text=Poly", "order": 1, "name": "Poly" },
      { "id": "brand-2", "logoUrl": "https://via.placeholder.com/150x50/00B4D8/FFFFFF?text=Cisco", "order": 2, "website": "https://www.cisco.com", "name": "Cisco" },
      { "order": 3, "id": "brand-3", "website": "https://www.yealink.com", "logoUrl": "https://via.placeholder.com/150x50/1A2B4C/FFFFFF?text=Yealink", "name": "Yealink" },
      { "name": "Grandstream", "website": "https://www.grandstream.com", "id": "brand-4", "order": 4, "logoUrl": "https://via.placeholder.com/150x50/00B4D8/FFFFFF?text=Grandstream" },
      { "website": "https://www.hikvision.com", "name": "Hikvision", "id": "brand-5", "order": 5, "logoUrl": "https://via.placeholder.com/150x50/1A2B4C/FFFFFF?text=Hikvision" },
      { "name": "Bosch", "website": "https://www.bosch.com", "id": "brand-6", "order": 6, "logoUrl": "https://via.placeholder.com/150x50/00B4D8/FFFFFF?text=Bosch" },
      { "id": "brand-7", "name": "Logitech", "website": "https://www.logitech.com", "logoUrl": "https://via.placeholder.com/150x50/1A2B4C/FFFFFF?text=Logitech", "order": 7 },
      { "order": 8, "name": "Jabra", "id": "brand-8", "website": "https://www.jabra.com", "logoUrl": "https://via.placeholder.com/150x50/00B4D8/FFFFFF?text=Jabra" },
      { "order": 9, "logoUrl": "https://via.placeholder.com/150x50/1A2B4C/FFFFFF?text=Axis", "id": "brand-9", "website": "https://www.axis.com", "name": "Axis" },
      { "order": 10, "name": "HP", "website": "https://www.hp.com", "id": "brand-10", "logoUrl": "https://via.placeholder.com/150x50/00B4D8/FFFFFF?text=HP" },
      { "website": "https://www.epson.com", "id": "brand-11", "order": 11, "logoUrl": "https://via.placeholder.com/150x50/1A2B4C/FFFFFF?text=Epson", "name": "Epson" },
      { "id": "brand-12", "name": "BenQ", "website": "https://www.benq.com", "logoUrl": "https://via.placeholder.com/150x50/00B4D8/FFFFFF?text=BenQ", "order": 12 },
      { "order": 13, "id": "brand-13", "website": "https://www.sony.com", "logoUrl": "https://via.placeholder.com/150x50/1A2B4C/FFFFFF?text=Sony", "name": "Sony" },
      { "website": "https://panasonic.net", "name": "Panasonic", "logoUrl": "https://via.placeholder.com/150x50/00B4D8/FFFFFF?text=Panasonic", "order": 14, "id": "brand-14" },
      { "website": "https://www.optoma.com", "name": "Optoma", "id": "brand-15", "order": 15, "logoUrl": "https://via.placeholder.com/150x50/1A2B4C/FFFFFF?text=Optoma" },
      { "website": "https://www.viewsonic.com", "id": "brand-16", "order": 16, "logoUrl": "https://via.placeholder.com/150x50/00B4D8/FFFFFF?text=ViewSonic", "name": "ViewSonic" }
    ],
    "testimonials": [
      { "designation": "IT Director, Habib Bank Ltd.", "id": "t-1", "avatarUrl": "https://i.pravatar.cc/64?img=1", "rating": 5, "order": 1, "name": "Ahmed Raza", "text": "\"AV Live completely transformed our boardroom. The Cisco Room Kit is a game-changer. Their installation team was professional and punctual.\"" },
      { "name": "Sara Khan", "avatarUrl": "https://i.pravatar.cc/64?img=2", "rating": 5, "text": "\"We outfitted our 300-seat call center with Yealink IP Phones and headsets from AV Live. The provisioning service saved us weeks of configuration time.\"", "designation": "Operations Manager, JazzCall", "id": "t-2", "order": 2 },
      { "rating": 5, "order": 3, "designation": "Marketing Head, Nestlé Pakistan", "id": "t-3", "avatarUrl": "https://i.pravatar.cc/64?img=3", "text": "\"The SMD display they installed for our launch event was stunning. The colors were perfect, and the on-site support was impeccable.\"", "name": "Zain Malik" },
      { "text": "\"We needed a public address system for our mosque renovation. AV Live delivered a crystal-clear Bosch system with flawless zone control.\"", "avatarUrl": "https://i.pravatar.cc/64?img=4", "id": "t-4", "name": "Imam Qasim", "rating": 5, "designation": "Jamia Masjid Al-Haram", "order": 4 },
      { "rating": 5, "id": "t-5", "order": 5, "name": "Fatima Ali", "avatarUrl": "https://i.pravatar.cc/64?img=5", "text": "\"AV Live helped us set up our hybrid conference infrastructure. The virtual audience engagement was seamless and professional.\"", "designation": "CEO, TechStart Pakistan" },
      { "name": "Usman Chaudhry", "avatarUrl": "https://i.pravatar.cc/64?img=6", "id": "t-6", "rating": 5, "text": "\"The AV integration for our new auditorium was executed flawlessly. The team understood our requirements and delivered beyond expectations.\"", "designation": "Facilities Manager, LUMS", "order": 6 }
    ],
    "promoBanner": {
      "headline": "Ready to Upgrade Your AV?",
      "backgroundImageUrl": "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1920&q=80",
      "ctaText": "Contact Us",
      "isActive": true,
      "subheadline": "Get a free consultation from our experts today.",
      "ctaLink": "/contact"
    }
  }
];
  for (const item of homepage) {
    const { id, ...data } = item;
    await setDoc(doc(db, "homepage", id), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  }

  // 3. Seed Categories
  const categories = [
  { "id": "cat-headsets", "slug": "headsets", "name": "Headsets", "isActive": true, "parentId": null, "description": "Headsets category and resources.", "displayOrder": 6, "type": "product" },
  { "id": "cat-intercom", "type": "product", "isActive": true, "slug": "intercom-paging-access", "parentId": null, "description": "Intercom, Paging & Access category and resources.", "name": "Intercom, Paging & Access", "displayOrder": 3 },
  { "id": "cat-projectors", "name": "Projectors", "slug": "projectors", "description": "Projectors category and resources.", "type": "product", "displayOrder": 1, "isActive": true, "parentId": null },
  { "id": "cat-video", "isActive": true, "slug": "video-conferencing", "displayOrder": 5, "parentId": null, "type": "product", "description": "Video Conferencing category and resources.", "name": "Video Conferencing" },
  { "id": "cat-voip", "name": "VoIP Phone Systems", "displayOrder": 2, "type": "product", "parentId": null, "isActive": true, "slug": "voip-phone-systems", "description": "VoIP Phone Systems category and resources." },
  { "id": "cat-phones", "slug": "ip-phones", "description": "IP Phones category and resources.", "name": "IP Phones", "parentId": null, "displayOrder": 7, "isActive": true, "type": "product" },
  { "id": "info-compare", "displayOrder": 17, "parentId": null, "name": "Comparison Charts", "isActive": true, "slug": "compare", "type": "page", "description": "Comparison Charts category and resources." },
  { "id": "info-guides", "name": "Buyer's Guides", "isActive": true, "description": "Buyer's Guides category and resources.", "parentId": null, "slug": "guides", "type": "page", "displayOrder": 18 },
  { "id": "info-about", "name": "About Us", "displayOrder": 15, "isActive": true, "slug": "about", "description": "About Us category and resources.", "type": "page", "parentId": null },
  { "id": "info-payment", "description": "Payment Methods category and resources.", "displayOrder": 20, "name": "Payment Methods", "parentId": null, "isActive": true, "slug": "payment", "type": "page" },
  { "id": "info-returns", "displayOrder": 22, "description": "Returns category and resources.", "name": "Returns", "parentId": null, "isActive": true, "slug": "returns", "type": "page" },
  { "id": "info-reviews", "name": "Verified Customer Reviews", "isActive": true, "type": "page", "displayOrder": 16, "parentId": null, "description": "Verified Customer Reviews category and resources.", "slug": "reviews" },
  { "id": "info-rma", "description": "RMA Form category and resources.", "name": "RMA Form", "displayOrder": 23, "isActive": true, "slug": "rma", "type": "page", "parentId": null },
  { "id": "info-shipping", "name": "Shipping Methods", "slug": "shipping", "parentId": null, "type": "page", "displayOrder": 21, "isActive": true, "description": "Shipping Methods category and resources." },
  { "id": "info-faqs", "isActive": true, "type": "page", "name": "FAQs", "parentId": null, "slug": "faqs", "displayOrder": 19, "description": "FAQs category and resources." },
  { "id": "legal-privacy", "name": "Privacy Policy", "parentId": null, "description": "Privacy Policy category and resources.", "displayOrder": 31, "isActive": true, "slug": "privacy-policy", "type": "legal" },
  { "id": "legal-terms", "isActive": true, "type": "legal", "name": "Terms of Service", "slug": "terms-of-service", "parentId": null, "description": "Terms of Service category and resources.", "displayOrder": 32 },
  { "id": "legal-blog", "displayOrder": 33, "isActive": true, "description": "Blog category and resources.", "parentId": null, "slug": "blog", "name": "Blog", "type": "content" },
  { "id": "legal-contact", "isActive": true, "slug": "contact", "name": "Contact Us", "parentId": null, "displayOrder": 34, "type": "page", "description": "Contact Us category and resources." },
  { "id": "prog-govt-edu", "slug": "government-education-pricing", "type": "program", "isActive": true, "description": "Government & Education Pricing category and resources.", "name": "Government & Education Pricing", "displayOrder": 25, "parentId": null },
  { "id": "prog-drop-shipping", "isActive": true, "parentId": null, "slug": "blind-drop-shipping", "name": "Blind Drop Shipping", "type": "program", "displayOrder": 24, "description": "Blind Drop Shipping category and resources." },
  { "id": "prog-fulfillment", "description": "Product Fulfillment Services category and resources.", "name": "Product Fulfillment Services", "displayOrder": 26, "isActive": true, "slug": "fulfillment-services", "parentId": null, "type": "program" },
  { "id": "prog-promotions", "displayOrder": 27, "name": "Promotions", "slug": "promotions", "type": "program", "isActive": true, "parentId": null, "description": "Promotions category and resources." },
  { "id": "prog-provisioning", "type": "program", "parentId": null, "description": "Provisioning Services category and resources.", "name": "Provisioning Services", "slug": "provisioning-services", "isActive": true, "displayOrder": 28 },
  { "id": "prog-quote", "displayOrder": 29, "parentId": null, "name": "Quote Request", "isActive": true, "slug": "quote", "type": "program", "description": "Quote Request category and resources." },
  { "id": "prog-reseller", "parentId": null, "isActive": true, "slug": "reseller-program", "name": "Reseller Program", "type": "program", "displayOrder": 30, "description": "Reseller Program category and resources." },
  { "id": "svc-ai-agents", "parentId": null, "name": "AI Agents & Workers", "type": "service", "displayOrder": 13, "isActive": true, "slug": "ai-agents-workers", "description": "AI Agents & Workers category and resources." },
  { "id": "svc-ai-auto", "name": "AI Business Automation", "isActive": true, "slug": "ai-automation", "parentId": null, "description": "AI Business Automation category and resources.", "displayOrder": 14, "type": "service" },
  { "id": "svc-corporate", "parentId": null, "isActive": true, "slug": "corporate-events", "name": "Corporate Events", "type": "service", "description": "Corporate Events category and resources.", "displayOrder": 8 },
  { "id": "svc-expo", "isActive": true, "description": "Expo Organizing category and resources.", "displayOrder": 10, "parentId": null, "name": "Expo Organizing", "slug": "expo-organizing", "type": "service" },
  { "id": "svc-esports", "parentId": null, "isActive": true, "description": "Esports Events & Tournaments category and resources.", "displayOrder": 11, "type": "service", "name": "Esports Events & Tournaments", "slug": "esports-events" },
  { "id": "svc-ai-dev", "name": "AI Development", "slug": "ai-development", "isActive": true, "displayOrder": 12, "parentId": null, "type": "service", "description": "AI Development category and resources." },
  { "id": "svc-hybrid", "isActive": true, "parentId": null, "slug": "hybrid-events", "name": "Hybrid Events", "type": "service", "displayOrder": 9, "description": "Hybrid Events category and resources." },
  { "id": "voip-providers", "parentId": null, "isActive": true, "slug": "voip-service-providers", "name": "VoIP Service Providers", "type": "voip", "description": "VoIP Service Providers category and resources." }
];
  for (const item of categories) {
    const { id, ...data } = item;
    await setDoc(doc(db, "categories", id), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  // 4. Seed Products
  const products = [
  { "id": "poly-studio-usb-pakistan", "seoMetaDescription": "Poly Studio USB Pakistan – Buy Poly USB Video Bar in Pakistan. High-performance video conferencing with 1-year local warranty. Call AV Live 0321 425 6263.", "images": ["https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80"], "categoryIds": ["cat-video"], "brand": "Poly", "productName": "Poly Studio USB", "regularPrice": 212750, "slug": "poly-studio-usb-pakistan", "isActive": true, "specifications": "Camera: Ultra HD 4K camera with Poly DirectorAI; Field of View: 120° diagonal; Audio Technology: NoiseBlockAI and Acoustic Fence; Speakers: Powerful stereo speakers with custom acoustic suspension; Interfaces: HDMI, USB-C, Gigabit Ethernet, Dual-band Wi-Fi, expansion mic port; Supported Platforms: Microsoft Teams, Zoom, Google Meet, GoToMeeting; Warranty: 1-Year Local Warranty", "categorySlugs": ["video-conferencing"], "salePrice": 185000, "sku": "7200-85830-012", "seoTags": "Primary: Poly Studio USB Pakistan, Poly Pakistan, USB Video Bar Lahore", "stockQuantity": 10, "shortDescription": "The Poly Studio USB is a professional USB Video Bar designed for modern business collaboration in Pakistan. Features crystal-clear HD video, intelligent audio tracking, and native integration with Zoom, Teams, and Webex.", "description": "<h3>Transform Your Meeting Rooms in Pakistan</h3><p>The <strong>Poly Studio USB</strong> is an enterprise-grade USB Video Bar designed to deliver flawless collaborative experiences.</p>" },
  { "id": "cisco-room-kit-plus-video-conferencing-system-pakistan", "sku": "CS-KITPLPTZ4K-K9", "salePrice": 3200000, "seoMetaDescription": "Cisco Room Kit Plus Video Conferencing System Pakistan – Buy Cisco Video Conferencing System in Pakistan.", "images": ["https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80"], "brand": "Cisco", "regularPrice": 3680000, "categorySlugs": ["video-conferencing"], "slug": "cisco-room-kit-plus-video-conferencing-system-pakistan", "productName": "Cisco Room Kit Plus Video Conferencing System", "categoryIds": ["cat-video"], "stockQuantity": 5, "isActive": true, "specifications": "Camera: 4K Ultra HD smart lens with auto-focus; Field of View: 120° diagonal; Microphones: 4-element adaptive beamforming microphone array; Speakers: High-fidelity front-facing stereo speakers; Interfaces: HDMI Input/Output, USB-C, Gigabit Ethernet, Dual-band Wi-Fi; Supported Platforms: Cisco Webex, Microsoft Teams, Zoom; Warranty: 1-Year Local Warranty", "description": "<h3>Transform Your Meeting Rooms in Pakistan</h3><p>The <strong>Cisco Room Kit Plus</strong> is an enterprise-grade Video Conferencing System designed to deliver flawless collaborative experiences.</p>" },
  { "id": "cisco-room-kit-pro-video-conferencing-system-pakistan", "sku": "CS-KITPRO-K9", "isActive": true, "categorySlugs": ["video-conferencing"], "seoTags": "Primary: Cisco Room Kit Pro Video Conferencing System Pakistan", "stockQuantity": 3, "seoMetaDescription": "Cisco Room Kit Pro Video Conferencing System Pakistan – Buy Cisco Video Conferencing System in Pakistan.", "brand": "Cisco", "images": ["https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80"], "slug": "cisco-room-kit-pro-video-conferencing-system-pakistan", "shortDescription": "The Cisco Room Kit Pro Video Conferencing System is a professional Video Conferencing System designed for modern business collaboration in Pakistan.", "salePrice": 5300000, "productName": "Cisco Room Kit Pro Video Conferencing System", "specifications": "Camera: 4K Ultra HD smart lens with auto-focus; Field of View: 120° diagonal; Microphones: 4-element adaptive beamforming microphone array; Speakers: High-fidelity front-facing stereo speakers; Interfaces: HDMI Input/Output, USB-C, Gigabit Ethernet, Dual-band Wi-Fi; Supported Platforms: Cisco Webex, Microsoft Teams, Zoom; Warranty: 1-Year Local Warranty", "categoryIds": ["cat-video"], "regularPrice": 6095000, "description": "<h3>Transform Your Meeting Rooms in Pakistan</h3><p>The <strong>Cisco Room Kit Pro</strong> is an enterprise-grade Video Conferencing System designed to deliver flawless collaborative experiences.</p>" },
  { "id": "cisco-room-kit-eq-video-conferencing-system-pakistan", "regularPrice": 4370000, "seoMetaDescription": "Cisco Room Kit EQ Video Conferencing System Pakistan – Buy Cisco Video Conferencing System in Pakistan.", "shortDescription": "The Cisco Room Kit EQ Video Conferencing System is a professional Video Conferencing System designed for modern business collaboration in Pakistan.", "specifications": "Camera: 4K Ultra HD smart lens with auto-focus; Field of View: 120° diagonal; Microphones: 4-element adaptive beamforming microphone array; Speakers: High-fidelity front-facing stereo speakers; Interfaces: HDMI Input/Output, USB-C, Gigabit Ethernet, Dual-band Wi-Fi; Supported Platforms: Cisco Webex, Microsoft Teams, Zoom; Warranty: 1-Year Local Warranty", "isActive": true, "categorySlugs": ["video-conferencing"], "sku": "CS-KIT-EQ-C-K9", "brand": "Cisco", "images": ["https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80"], "stockQuantity": 3, "categoryIds": ["cat-video"], "slug": "cisco-room-kit-eq-video-conferencing-system-pakistan", "seoTags": "Primary: Cisco Room Kit EQ Video Conferencing System Pakistan", "salePrice": 3800000, "productName": "Cisco Room Kit EQ Video Conferencing System", "description": "<p>The <strong>Cisco Room Kit EQ</strong> is an enterprise-grade Video Conferencing System designed to deliver flawless collaborative experiences.</p>" },
  { "id": "poly-studio-v52-usb-video-bar-pakistan", "seoTags": "Primary: Poly Studio V52 USB Video Bar Pakistan", "regularPrice": 437000, "salePrice": 380000, "categoryIds": ["cat-video"], "images": ["https://images.unsplash.com/photo-1611095773767-114946654271?w=800&q=80"], "brand": "Poly", "categorySlugs": ["video-conferencing"], "isActive": true, "sku": "A09D4AA#ABB", "productName": "Poly Studio V52 USB Video Bar", "stockQuantity": 12, "shortDescription": "The Poly Studio V52 USB Video Bar is a professional USB Video Bar designed for modern business collaboration in Pakistan.", "seoMetaDescription": "Poly Studio V52 USB Video Bar Pakistan – Buy Poly USB Video Bar in Pakistan.", "slug": "poly-studio-v52-usb-video-bar-pakistan", "description": "<p>The <strong>Poly Studio V52 USB Video Bar</strong> is an enterprise-grade USB Video Bar designed to deliver flawless collaborative experiences.</p>", "specifications": "Camera: Ultra HD 4K camera with Poly DirectorAI; Field of View: 120° diagonal; Audio Technology: NoiseBlockAI and Acoustic Fence; Speakers: Powerful stereo speakers with custom acoustic suspension; Interfaces: HDMI, USB-C, Gigabit Ethernet, Dual-band Wi-Fi, expansion mic port; Supported Platforms: Microsoft Teams, Zoom, Google Meet, GoToMeeting; Warranty: 1-Year Local Warranty" },
  { "id": "cisco-room-bar-all-in-one-video-bar-pakistan", "regularPrice": 1265000, "images": ["https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80"], "isActive": true, "specifications": "Camera: 4K Ultra HD smart lens with auto-focus; Field of View: 120° diagonal; Microphones: 4-element adaptive beamforming microphone array; Speakers: High-fidelity front-facing stereo speakers; Interfaces: HDMI Input/Output, USB-C, Gigabit Ethernet, Dual-band Wi-Fi; Supported Platforms: Cisco Webex, Microsoft Teams, Zoom; Warranty: 1-Year Local Warranty", "seoMetaDescription": "Cisco Room Bar All-in-One Video Bar Pakistan – Buy Cisco All-in-One Video Bar in Pakistan.", "brand": "Cisco", "shortDescription": "The Cisco Room Bar All-in-One Video Bar is a professional All-in-One Video Bar designed for modern business collaboration in Pakistan.", "categoryIds": ["cat-video"], "stockQuantity": 15, "sku": "CS-BAR-NR-K9", "seoTags": "Primary: Cisco Room Bar All-in-One Video Bar Pakistan", "productName": "Cisco Room Bar All-in-One Video Bar", "slug": "cisco-room-bar-all-in-one-video-bar-pakistan", "salePrice": 1100000, "categorySlugs": ["video-conferencing"], "description": "<p>The <strong>Cisco Room Bar All-in-One Video Bar</strong> is an enterprise-grade All-in-One Video Bar designed to deliver flawless collaborative experiences.</p>" },
  { "id": "cisco-webex-room-kit-plus-pakistan", "categorySlugs": ["video-conferencing"], "brand": "Cisco", "regularPrice": 1380000, "seoMetaDescription": "Cisco Webex Room Kit Plus Pakistan – Buy Cisco Video Conferencing System in Pakistan.", "specifications": "Camera: 4K Ultra HD smart lens with auto-focus; Field of View: 120° diagonal; Microphones: 4-element adaptive beamforming microphone array; Speakers: High-fidelity front-facing stereo speakers; Interfaces: HDMI Input/Output, USB-C, Gigabit Ethernet, Dual-band Wi-Fi; Supported Platforms: Cisco Webex, Microsoft Teams, Zoom; Warranty: 1-Year Local Warranty", "slug": "cisco-webex-room-kit-plus-pakistan", "sku": "CS-KITPLUS-K9", "isActive": true, "images": ["https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80"], "productName": "Cisco Webex Room Kit Plus", "stockQuantity": 5, "categoryIds": ["cat-video"], "salePrice": 1200000, "seoTags": "Primary: Cisco Webex Room Kit Plus Pakistan", "shortDescription": "The Cisco Webex Room Kit Plus is a professional Video Conferencing System designed for modern business collaboration in Pakistan.", "description": "<p>The <strong>Cisco Webex Room Kit Plus</strong> is an enterprise-grade Video Conferencing System designed to deliver flawless collaborative experiences.</p>" },
  { "id": "cisco-room-kit-video-conferencing-system-pakistan", "isActive": true, "seoTags": "Primary: Cisco Room Kit Video Conferencing System Pakistan", "regularPrice": 2185000, "categoryIds": ["cat-video"], "shortDescription": "The Cisco Room Kit Video Conferencing System is a professional Video Conferencing System designed for modern business collaboration in Pakistan.", "brand": "Cisco", "seoMetaDescription": "Cisco Room Kit Video Conferencing System Pakistan – Buy Cisco Video Conferencing System in Pakistan.", "stockQuantity": 8, "specifications": "Camera: 4K Ultra HD smart lens with auto-focus; Field of View: 120° diagonal; Microphones: 4-element adaptive beamforming microphone array; Speakers: High-fidelity front-facing stereo speakers; Interfaces: HDMI Input/Output, USB-C, Gigabit Ethernet, Dual-band Wi-Fi; Supported Platforms: Cisco Webex, Microsoft Teams, Zoom; Warranty: 1-Year Local Warranty", "categorySlugs": ["video-conferencing"], "salePrice": 1900000, "productName": "Cisco Room Kit Video Conferencing System", "slug": "cisco-room-kit-video-conferencing-system-pakistan", "images": ["https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80"], "sku": "CS-KIT-K9", "description": "<p>The <strong>Cisco Room Kit Video Conferencing System</strong> is an enterprise-grade Video Conferencing System designed to deliver flawless collaborative experiences.</p>" },
  { "id": "logitech-rally-bar-mini-pakistan", "images": ["https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80"], "shortDescription": "The Logitech Rally Bar Mini is a professional Compact Video Bar designed for modern business collaboration in Pakistan.", "seoTags": "Primary: Logitech Rally Bar Mini Pakistan", "stockQuantity": 15, "brand": "Logitech", "salePrice": 320000, "categorySlugs": ["video-conferencing"], "productName": "Logitech Rally Bar Mini", "isActive": true, "categoryIds": ["cat-video"], "seoMetaDescription": "Logitech Rally Bar Mini Pakistan – Buy Logitech Compact Video Bar in Pakistan.", "specifications": "Camera: Premium 4K camera with RightSight auto-framing; Field of View: 120° diagonal; Audio Technology: RightSound acoustic optimization; Speakers: Integrated ultra-low distortion speaker enclosure; Interfaces: USB Plug-and-play, power, expansion mic input, security lock slot; Supported Platforms: Google Meet, Zoom, Microsoft Teams; Warranty: 1-Year Local Warranty", "regularPrice": 368000, "slug": "logitech-rally-bar-mini-pakistan", "sku": "960-001563", "description": "<p>The <strong>Logitech Rally Bar Mini</strong> is an enterprise-grade Compact Video Bar designed to deliver flawless collaborative experiences.</p>" },
  { "id": "logitech-rally-bar-pakistan", "regularPrice": 517500, "sku": "960-001308", "categorySlugs": ["video-conferencing"], "stockQuantity": 8, "categoryIds": ["cat-video"], "brand": "Logitech", "shortDescription": "The Logitech Rally Bar is a professional Premium All-in-One Video Bar designed for modern business collaboration in Pakistan.", "seoMetaDescription": "Logitech Rally Bar Pakistan – Buy Logitech Premium All-in-One Video Bar in Pakistan.", "specifications": "Camera: Premium 4K camera with RightSight auto-framing; Field of View: 120° diagonal; Audio Technology: RightSound acoustic optimization; Speakers: Integrated ultra-low distortion speaker enclosure; Interfaces: USB Plug-and-play, power, expansion mic input, security lock slot; Supported Platforms: Google Meet, Zoom, Microsoft Teams; Warranty: 1-Year Local Warranty", "isActive": true, "images": ["https://images.unsplash.com/photo-1611095773767-114946654271?w=800&q=80"], "productName": "Logitech Rally Bar", "slug": "logitech-rally-bar-pakistan", "seoTags": "Primary: Logitech Rally Bar Pakistan", "salePrice": 450000, "description": "<p>The <strong>Logitech Rally Bar</strong> is an enterprise-grade Premium All-in-One Video Bar designed to deliver flawless collaborative experiences.</p>" },
  { "id": "poly-g7500-modular-video-conferencing-system-pakistan", "categorySlugs": ["video-conferencing"], "isActive": true, "regularPrice": 2530000, "shortDescription": "The Poly G7500 Modular Video Conferencing System is a professional Modular Video Conferencing System designed for modern business collaboration in Pakistan.", "specifications": "Camera: Ultra HD 4K camera with Poly DirectorAI; Field of View: 120° diagonal; Audio Technology: NoiseBlockAI and Acoustic Fence; Speakers: Powerful stereo speakers with custom acoustic suspension; Interfaces: HDMI, USB-C, Gigabit Ethernet, Dual-band Wi-Fi, expansion mic port; Supported Platforms: Microsoft Teams, Zoom, Google Meet, GoToMeeting; Warranty: 1-Year Local Warranty", "images": ["https://images.unsplash.com/photo-1611095773767-114946654271?w=800&q=80"], "seoMetaDescription": "Poly G7500 Modular Video Conferencing System Pakistan – Buy Poly Modular Video Conferencing System in Pakistan.", "brand": "Poly", "productName": "Poly G7500 Modular Video Conferencing System", "categoryIds": ["cat-video"], "salePrice": 2200000, "sku": "842T9AA#ABA", "seoTags": "Primary: Poly G7500 Modular Video Conferencing System Pakistan", "slug": "poly-g7500-modular-video-conferencing-system-pakistan", "stockQuantity": 5, "description": "<p>The <strong>Poly G7500 Modular Video Conferencing System</strong> is an enterprise-grade Modular Video Conferencing System designed to deliver flawless collaborative experiences.</p>" },
  { "id": "poly-studio-x32-all-in-one-video-bar-pakistan", "images": ["https://images.unsplash.com/photo-1611095773767-114946654271?w=800&q=80"], "seoTags": "Primary: Poly Studio X32 All-in-One Video Bar Pakistan", "isActive": true, "slug": "poly-studio-x32-all-in-one-video-bar-pakistan", "regularPrice": 644000, "salePrice": 560000, "shortDescription": "The Poly Studio X32 All-in-One Video Bar is a professional All-in-One Video Bar designed for modern business collaboration in Pakistan.", "brand": "Poly", "stockQuantity": 157, "seoMetaDescription": "Poly Studio X32 All-in-One Video Bar Pakistan – Buy Poly All-in-One Video Bar in Pakistan.", "categoryIds": ["cat-video"], "specifications": "Camera: Ultra HD 4K camera with Poly DirectorAI; Field of View: 120° diagonal; Audio Technology: NoiseBlockAI and Acoustic Fence; Speakers: Powerful stereo speakers with custom acoustic suspension; Interfaces: HDMI, USB-C, Gigabit Ethernet, Dual-band Wi-Fi, expansion mic port; Supported Platforms: Microsoft Teams, Zoom, Google Meet, GoToMeeting; Warranty: 1-Year Local Warranty", "sku": "A3SV5AA#ABA", "categorySlugs": ["video-conferencing"], "productName": "Poly Studio X32 All-in-One Video Bar", "description": "<p>The <strong>Poly Studio X32 All-in-One Video Bar</strong> is an enterprise-grade All-in-One Video Bar designed to deliver flawless collaborative experiences.</p>" },
  { "id": "poly-studio-x50-all-in-one-video-bar-pakistan", "isActive": true, "regularPrice": 1265000, "images": ["https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80"], "brand": "Poly", "salePrice": 1100000, "stockQuantity": 10, "seoTags": "Primary: Poly Studio X50 All-in-One Video Bar Pakistan", "specifications": "Camera: Ultra HD 4K camera with Poly DirectorAI; Field of View: 120° diagonal; Audio Technology: NoiseBlockAI and Acoustic Fence; Speakers: Powerful stereo speakers with custom acoustic suspension; Interfaces: HDMI, USB-C, Gigabit Ethernet, Dual-band Wi-Fi, expansion mic port; Supported Platforms: Microsoft Teams, Zoom, Google Meet, GoToMeeting; Warranty: 1-Year Local Warranty", "shortDescription": "The Poly Studio X50 All-in-One Video Bar is a professional All-in-One Video Bar designed for modern business collaboration in Pakistan.", "categoryIds": ["cat-video"], "productName": "Poly Studio X50 All-in-One Video Bar", "sku": "842W5AA#ABA", "seoMetaDescription": "Poly Studio X50 All-in-One Video Bar Pakistan – Buy Poly All-in-One Video Bar in Pakistan.", "slug": "poly-studio-x50-all-in-one-video-bar-pakistan", "categorySlugs": ["video-conferencing"], "description": "<p>The <strong>Poly Studio X50 All-in-One Video Bar</strong> is an enterprise-grade All-in-One Video Bar designed to deliver flawless collaborative experiences.</p>" },
  { "id": "poly-studio-x52-all-in-one-video-bar-pakistan", "images": ["https://images.unsplash.com/photo-1611095773767-114946654271?w=800&q=80"], "specifications": "Camera: Ultra HD 4K camera with Poly DirectorAI; Field of View: 120° diagonal; Audio Technology: NoiseBlockAI and Acoustic Fence; Speakers: Powerful stereo speakers with custom acoustic suspension; Interfaces: HDMI, USB-C, Gigabit Ethernet, Dual-band Wi-Fi, expansion mic port; Supported Platforms: Microsoft Teams, Zoom, Google Meet, GoToMeeting; Warranty: 1-Year Local Warranty", "brand": "Poly", "isActive": true, "sku": "STUDIO-X52", "salePrice": 1400000, "shortDescription": "The Poly Studio X52 All-in-One Video Bar is a professional All-in-One Video Bar designed for modern business collaboration in Pakistan.", "categorySlugs": ["video-conferencing"], "slug": "poly-studio-x52-all-in-one-video-bar-pakistan", "seoMetaDescription": "Poly Studio X52 All-in-One Video Bar Pakistan – Buy Poly All-in-One Video Bar in Pakistan.", "productName": "Poly Studio X52 All-in-One Video Bar", "regularPrice": 1610000, "stockQuantity": 5, "seoTags": "Primary: Poly Studio X52 All-in-One Video Bar Pakistan", "categoryIds": ["cat-video"], "description": "<p>The <strong>Poly Studio X52 All-in-One Video Bar</strong> is an enterprise-grade All-in-One Video Bar designed to deliver flawless collaborative experiences.</p>" },
  { "id": "poly-studio-x72-all-in-one-video-bar-pakistan", "brand": "Poly", "isActive": true, "images": ["https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80"], "categoryIds": ["cat-video"], "productName": "Poly Studio X72 All-in-One Video Bar", "shortDescription": "The Poly Studio X72 All-in-One Video Bar is a professional All-in-One Video Bar designed for modern business collaboration in Pakistan.", "seoTags": "Primary: Poly Studio X72 All-in-One Video Bar Pakistan", "salePrice": 2000000, "sku": "STUDIO-X72", "specifications": "Camera: Ultra HD 4K camera with Poly DirectorAI; Field of View: 120° diagonal; Audio Technology: NoiseBlockAI and Acoustic Fence; Speakers: Powerful stereo speakers with custom acoustic suspension; Interfaces: HDMI, USB-C, Gigabit Ethernet, Dual-band Wi-Fi, expansion mic port; Supported Platforms: Microsoft Teams, Zoom, Google Meet, GoToMeeting; Warranty: 1-Year Local Warranty", "regularPrice": 2300000, "slug": "poly-studio-x72-all-in-one-video-bar-pakistan", "seoMetaDescription": "Poly Studio X72 All-in-One Video Bar Pakistan – Buy Poly All-in-One Video Bar in Pakistan.", "stockQuantity": 3, "categorySlugs": ["video-conferencing"], "description": "<p>The <strong>Poly Studio X72 All-in-One Video Bar</strong> is an enterprise-grade All-in-One Video Bar designed to deliver flawless collaborative experiences.</p>" }
];
  for (const item of products) {
    const { id, ...data } = item;
    await setDoc(doc(db, "products", id), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  // 5. Seed Services Content
  const services = [
  { "id": "svc-ai-agents-workers", "category": "ai-services", "order": 6, "priceRange": "Subscription", "iconUrl": "https://via.placeholder.com/64x64/1A2B4C/FFFFFF?text=AW", "formFields": { "integrations": ["CRM", "ERP", "Slack", "Teams"], "agentType": ["Customer Support", "Lead Gen", "Data Processing", "Research"] }, "heroHeading": "Your New Digital Workforce", "detailedContent": "<h3>Overview</h3><p>In 2026, enterprise applications are moving beyond the traditional role of enabling employees with digital tools to accommodating a digital workforce of AI agents.</p>", "name": "AI Agents & Workers", "serviceType": "ai-agents", "imageUrl": "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=800", "type": "ai", "slug": "ai-agents-workers", "isActive": true, "description": "Deploy autonomous AI agents that handle customer support, lead generation, data processing, and more.", "title": "AI Agents & Workers" },
  { "id": "svc-ai-automation", "order": 7, "title": "AI Business Automation", "category": "ai-services", "isActive": true, "slug": "ai-automation", "imageUrl": "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800", "type": "ai", "description": "AI Automation combines robotic process automation (RPA) with AI decision-making.", "priceRange": "Custom", "detailedContent": "<h3>Overview</h3><p>Businesses that automate repetitive workflows cut operational costs by 40-60% within the first year.</p>", "heroHeading": "Re-architecting Business Models", "name": "AI Business Automation", "iconUrl": "https://via.placeholder.com/64x64/00B4D8/FFFFFF?text=AA", "formFields": { "currentTools": ["ERP", "CRM", "Spreadsheets"], "automationArea": ["HR", "Finance", "Inventory", "Marketing"] }, "serviceType": "ai-auto" },
  { "id": "svc-ai-development", "serviceType": "ai-dev", "title": "AI Development", "priceRange": "300,000 - 4,000,000", "iconUrl": "https://via.placeholder.com/64x64/00B4D8/FFFFFF?text=AI", "name": "AI Development", "isActive": true, "description": "Whether you need strict data sovereignty or scalability, we build custom AI models.", "category": "ai-services", "formFields": { "cloudPreference": ["AWS", "GCP", "Azure", "On-Premise"], "dataSource": ["SQL Databases", "NoSQL", "APIs", "Files"], "dataVolume": ["<1TB", "1-10TB", "10-100TB", "100TB+"] }, "order": 5, "heroHeading": "Custom AI Models for Your Business", "type": "ai", "slug": "ai-development", "detailedContent": "<h3>Overview</h3><p>Pakistan is making significant strides in artificial intelligence.</p>", "imageUrl": "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&q=80&w=800" },
  { "id": "svc-corporate-events", "priceRange": "150,000 - 2,500,000", "category": "corporate-events", "slug": "corporate-events", "iconUrl": "https://via.placeholder.com/64x64/00B4D8/FFFFFF?text=CE", "isActive": true, "title": "Corporate Events", "type": "corporate", "imageUrl": "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=800", "detailedContent": "<h3>Overview</h3><p>Corporate events have evolved far beyond simple gatherings.</p>", "heroHeading": "Flawless Corporate Gatherings. Every Time.", "serviceType": "corporate", "formFields": { "duration": ["Half Day", "Full Day", "Multi Day"], "avRequirements": ["Projectors", "LED Screens", "Sound System", "Lighting"], "eventType": ["Conference", "Seminar", "Gala Dinner", "Product Launch"] }, "name": "Corporate Events", "order": 1, "description": "Corporate events are strategic investments in brand building." },
  { "id": "svc-esports-events", "slug": "esports-events", "isActive": true, "category": "esports-events", "detailedContent": "<h3>Overview</h3><p>Pakistan is turning into a phone-first esports market.</p>", "name": "Esports Events & Tournaments", "priceRange": "200,000 - 3,000,000", "iconUrl": "https://via.placeholder.com/64x64/1A2B4C/FFFFFF?text=ES", "type": "esports", "serviceType": "esports", "order": 4, "description": "We deliver stadium-grade gaming events.", "heroHeading": "Stadium-Grade Gaming Events", "imageUrl": "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800", "title": "Esports Events & Tournaments", "formFields": { "broadcastQuality": ["1080p", "4K"], "gameTitles": ["PUBG Mobile", "Fortnite", "Valorant", "FIFA", "Tekken", "Free Fire"], "streamingPlatform": ["YouTube", "Twitch", "Facebook Gaming", "Custom"] } },
  { "id": "svc-expo-organizing", "name": "Expo Organizing", "serviceType": "expo", "iconUrl": "https://via.placeholder.com/64x64/00B4D8/FFFFFF?text=EX", "isActive": true, "title": "Expo Organizing", "detailedContent": "<h3>Overview</h3><p>Pakistan's expo landscape is vibrant and growing.</p>", "order": 3, "priceRange": "250,000 - 4,000,000", "heroHeading": "Captivating Trade Shows and Expos", "formFields": { "avFeatures": ["SMD Video Walls", "Interactive Displays", "Digital Signage", "PA Systems"], "expoType": ["Trade Show", "Industry Expo", "Consumer Expo"], "boothCount": ["1-10", "11-25", "26-50"] }, "category": "expo-organizing", "slug": "expo-organizing", "imageUrl": "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800", "type": "expo", "description": "Creating a trade show is about more than just booths." },
  { "id": "svc-hybrid-events", "title": "Hybrid Events", "isActive": true, "category": "hybrid-events", "heroHeading": "Engage Global Audiences Seamlessly", "priceRange": "200,000 - 2,000,000", "detailedContent": "<h3>Overview</h3><p>Hybrid delivery has transitioned into a core event model.</p>", "serviceType": "hybrid", "slug": "hybrid-events", "description": "Hybrid formats are viewed as cost-efficient and scalable.", "imageUrl": "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=800", "name": "Hybrid Events", "type": "corporate", "order": 2, "iconUrl": "https://via.placeholder.com/64x64/1A2B4C/FFFFFF?text=HE", "formFields": { "duration": ["1-2 Hours", "Half Day", "Full Day"], "streamingType": ["Live Broadcast", "Webinar", "Virtual Conference"], "audienceSize": ["1-100", "101-500", "501-1000", "1000+"] } }
];
  for (const item of services) {
    const { id, ...data } = item;
    await setDoc(doc(db, "services", id), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  }

  // 6. Seed Services Landing Page
  const servicesPage = [{ "id": "main", "introText": "We bridge the gap between human intelligence and technical excellence.", "serviceIds": ["svc-corporate-events", "svc-hybrid-events", "svc-expo-organizing", "svc-esports-events", "svc-ai-development", "svc-ai-agents-workers", "svc-ai-automation", "svc-ai-auto-consult"], "heroImageUrl": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=2000", "ctaText": "Consult an Expert", "heroSubheading": "Whether it's a 500-person corporate gala or an AI system—we bring your vision to life.", "heroHeading": "Beyond Products. We Deliver Experiences.", "ctaLink": "/contact" }];
  for (const item of servicesPage) {
    const { id, ...data } = item;
    await setDoc(doc(db, "services_page", id), { ...data, updatedAt: serverTimestamp() });
  }

  // 7. Seed About Page
  const about = [{ "id": "main", "values": ["Innovation", "Integrity", "Customer First", "Excellence", "Collaboration"], "heroImageUrl": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&q=80", "history": "Founded in 2010...", "vision": "To lead Pakistan's digital transformation...", "teamDescription": "Our team comprises Polycom-certified engineers...", "mission": "To provide integrated multimedia tools...", "heroSubheading": "We are an experienced leader...", "heroHeading": "Unifying People and Ideas Since 2010", "teamImages": ["https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=300&q=80"], "stats": { "happyClients": 500, "teamMembers": 25, "projectsCompleted": 1000, "yearsExperience": 10 } }];
  for (const item of about) {
    const { id, ...data } = item;
    await setDoc(doc(db, "about", id), { ...data, updatedAt: serverTimestamp() });
  }

  // 8. Seed Contact Page
  const contact = [{ "id": "main", "businessHours": { "weekday": "9:00 AM – 6:00 PM", "sunday": "Closed", "saturday": "10:00 AM – 4:00 PM" }, "heroSubheading": "Whether you need a single IP phone...", "heroImageUrl": "https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1920&q=80", "phone": "0321 425 6263", "email": "info@avlive.com.pk", "socialLinks": { "twitter": "", "instagram": "https://instagram.com/avlive", "facebook": "https://facebook.com/avlive", "linkedin": "https://linkedin.com/company/avlive", "youtube": "https://youtube.com/@avlive" }, "address": "Shop, Johar Town Block N, Lahore", "mapEmbedUrl": "https://www.google.com/maps/embed?pb=...", "heroHeading": "Let's Build Your AV Solution Together" }];
  for (const item of contact) {
    const { id, ...data } = item;
    await setDoc(doc(db, "contact", id), { ...data, updatedAt: serverTimestamp() });
  }

  // 9. Seed Blog Posts
  const blogPosts = [
  { "id": "future-of-video-conferencing-pakistan-2026", "slug": "future-of-video-conferencing-pakistan-2026", "image": "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&q=80", "excerpt": "As Pakistan embraces digital transformation...", "content": "# The Future of Video Conferencing...", "featuredImage": "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&q=80", "isPublished": true, "tags": ["video-conferencing", "hybrid-work", "technology"], "author": "Admin", "title": "The Future of Video Conferencing in Pakistan", "category": "Video Conferencing" },
  { "id": "ip-phones-vs-softphones-business-guide", "slug": "ip-phones-vs-softphones-business-guide", "image": "https://images.unsplash.com/photo-1587560699334-cc4ff8e5a64b?w=1200&q=80", "excerpt": "Choosing between a physical IP phone and a softphone...", "content": "# IP Phones vs. Softphones...", "featuredImage": "https://images.unsplash.com/photo-1587560699334-cc4ff8e5a64b?w=1200&q=80", "isPublished": true, "tags": ["ip-phones", "voip"], "author": "Admin", "title": "IP Phones vs. Softphones", "category": "IP Phones & VoIP" },
  { "id": "choose-right-video-conferencing-equipment", "slug": "choose-right-video-conferencing-equipment", "image": "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&q=80", "excerpt": "The best video conferencing equipment...", "content": "# Choosing the Right Equipment...", "featuredImage": "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&q=80", "isPublished": true, "tags": ["video-conferencing"], "author": "Admin", "title": "How to Choose Right Equipment", "category": "Video Conferencing" },
  { "id": "public-address-systems-components-guide", "slug": "public-address-systems-components-guide", "image": "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=1200&q=80", "excerpt": "A modern PA system consists of five components...", "content": "# Understanding PA Systems...", "featuredImage": "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=1200&q=80", "isPublished": true, "tags": ["pa-systems"], "author": "Admin", "title": "Understanding PA Systems", "category": "AV Integration" },
  { "id": "hybrid-events-engagement-guide", "slug": "hybrid-events-engagement-guide", "image": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80", "excerpt": "Hybrid events are here to stay...", "content": "# Hybrid Events 101...", "featuredImage": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80", "isPublished": true, "tags": ["hybrid-events"], "author": "Admin", "title": "Hybrid Events 101", "category": "Events & Expo" },
  { "id": "av-live-15-years-anniversary", "slug": "av-live-15-years-anniversary", "image": "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&q=80", "excerpt": "Founded in 2010...", "content": "# AV Live: 15 Years...", "featuredImage": "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&q=80", "isPublished": true, "tags": ["company-news"], "author": "Admin", "title": "AV Live: 15 Years", "category": "Company News" }
];
  for (const item of blogPosts) {
    const { id, ...data } = item;
    await setDoc(doc(db, "blog_posts", id), { ...data, publishedAt: serverTimestamp(), updatedAt: serverTimestamp() });
  }

  // 10. Seed n8n Workflows
  const workflows = [
    { "id": "whatsapp-support-automation", "name": "WhatsApp Support Automation", "status": "active", "triggers": ["New Message"], "lastRun": "2024-03-15T10:30:00Z", "description": "Automatically routes customer queries.", "steps": 5 },
    { "id": "crm-lead-sync", "name": "CRM Lead Sync", "status": "inactive", "triggers": ["Form Submission"], "lastRun": "2024-03-14T15:45:00Z", "description": "Syncs website leads.", "steps": 8 }
  ];
  for (const item of workflows) {
    const { id, ...data } = item;
    await setDoc(doc(db, "n8n_workflows", id), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  }

  console.log("Seeding complete with updated data!");
}
