import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

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

// 2. Define Data Objects
const homepageData = {
  heroSlides: [
    {
      title: 'Transform Your Workspace',
      subtitle: 'Premium Video Conferencing Kits for Hybrid Teams',
      ctaText: 'Explore Solutions',
      ctaLink: '/shop',
      imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1920&q=80',
      isActive: true,
      order: 1,
    }
  ],
  brands: [
    { name: 'Poly', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Poly_Logo.svg', isActive: true, order: 1 },
    { name: 'Cisco', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Cisco_logo_blue_2016.svg', isActive: true, order: 2 },
    { name: 'Yealink', logoUrl: 'https://www.yealink.com/image/yealink-logo.png', isActive: true, order: 3 },
    { name: 'Grandstream', logoUrl: 'https://www.grandstream.com/hubfs/Grandstream_Logo_Horizontal_2-color-1.png', isActive: true, order: 4 }
  ],
  testimonials: [
    { name: 'Ahmed Khan', company: 'TechSol Pakistan', quote: 'AV Live transformed our boardroom with Poly solutions. Seamless experience!', rating: 5, avatarUrl: '', isActive: true },
    { name: 'Sara Malik', company: 'Global Events', quote: 'The hybrid event production was world-class. Highly recommended!', rating: 5, avatarUrl: '', isActive: true }
  ],
  stats: {
    yearsExperience: 20,
    happyClients: 500,
    projectsCompleted: 1000
  },
  promoBanner: {
    headline: 'Ready to Upgrade?',
    subheadline: 'Get a professional consultation for your business communications today.',
    ctaText: 'Request Quote',
    ctaLink: '/programs/quote',
    backgroundImageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80',
    isActive: true
  },
  updatedAt: FieldValue.serverTimestamp(),
};

const aboutData = {
  heroHeading: 'Decades of Excellence in AV & Communications',
  heroSubheading: "Pakistan's trusted partner for professional audio, video, and unified communication solutions.",
  heroImageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80',
  mission: 'To provide integrated multimedia tools that drive business innovation and profitability.',
  vision: "To lead Pakistan's digital transformation by making enterprise-grade communication tools accessible, secure, and simple to use.",
  history: 'Founded in 2004, AV Live Communications began with a single vision: to bridge the communication gap in Pakistan using world-class technology.',
  teamDescription: 'Our team comprises Polycom-certified engineers, Cisco-accredited technicians, and dedicated support staff.',
  teamImages: [],
  values: ['Quality First', 'Innovation', 'Reliability', 'Integrity'],
  stats: {
    yearsExperience: 20,
    happyClients: 500,
    projectsCompleted: 1000,
    teamMembers: 50
  },
  updatedAt: FieldValue.serverTimestamp(),
};

const contactData = {
  heroHeading: 'Get in Touch',
  heroSubheading: 'We are here to help you with your AV and communication needs.',
  heroImageUrl: 'https://images.unsplash.com/photo-1516387933999-ed3315fb1b5f?w=1920&q=80',
  address: 'Shop, Johar Town Block N, Lahore, Pakistan',
  phone: '+92 321 425 6263',
  email: 'info@avlive.com.pk',
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3402.551608643869!2d74.27061131514742!3d31.469700381387!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3919016186450017%3A0xa042078652410a!2sJohar%20Town%2C%20Lahore%2C%20Punjab%2C%20Pakistan!5e0!3m2!1sen!2s!4v1625565000000!5m2!1sen!2s',
  businessHours: {
    weekday: '10:00 AM - 7:00 PM',
    saturday: '10:00 AM - 5:00 PM',
    sunday: 'Closed'
  },
  socialLinks: {
    facebook: 'https://facebook.com/avlive',
    linkedin: 'https://linkedin.com/company/avlive',
    youtube: 'https://youtube.com/avlive',
    instagram: 'https://instagram.com/avlive',
    twitter: 'https://twitter.com/avlive'
  },
  updatedAt: FieldValue.serverTimestamp(),
};

const servicesPageData = {
  heroHeading: 'Beyond Products. We Deliver Experiences.',
  heroSubheading: "Whether it's a 500-person corporate gala, a high-stakes esports tournament, or an AI system that runs your business processes—we bring your vision to life.",
  heroImageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=2000',
  introText: 'We bridge the gap between human intelligence and technical excellence.',
  serviceIds: [],
  ctaText: 'Consult an Expert',
  ctaLink: '/contact',
  updatedAt: FieldValue.serverTimestamp(),
};

const blogPosts = [
  {
    title: 'The Future of Video Conferencing in Pakistan: Trends to Watch in 2026',
    date: 'July 2026',
    category: 'Video Conferencing',
    readTime: '6 min read',
    excerpt: 'As Pakistan embraces digital transformation, video conferencing has become core infrastructure for organizations. From AI-driven meeting experiences to secure local platforms like "KALAAM", the landscape is evolving rapidly. At AV Live, we\'re at the forefront, delivering solutions from Cisco Webex and Polycom that "just work" without requiring technical expertise. In this post, we explore the top trends shaping hybrid work and secure communications in Pakistan.',
    image: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=800',
    createdAt: FieldValue.serverTimestamp()
  },
  {
    title: 'IP Phones vs. Softphones: Which Is Right for Your Business?',
    date: 'June 2026',
    category: 'IP Phones & VoIP',
    readTime: '5 min read',
    excerpt: 'Choosing between a physical IP phone and a software-based softphone depends on your team\'s workflow, security needs, and budget. Desk IP phones remain essential for small businesses in 2026, offering reliability, superior audio quality, and dedicated features. We break down the pros and cons of each, helping you make the right decision for your organization.',
    image: 'https://images.unsplash.com/photo-1563690325150-10aa17ff983e?auto=format&fit=crop&q=80&w=800',
    createdAt: FieldValue.serverTimestamp()
  },
  {
    title: 'How to Choose the Right Video Conferencing Equipment for Your Meeting Rooms',
    date: 'June 2026',
    category: 'Video Conferencing',
    readTime: '7 min read',
    excerpt: 'The best video conferencing equipment depends less on the camera alone and more on room size, audio coverage, display use, and meeting workflow. In this comprehensive guide, we walk you through the four things to check first: audio pickup, camera framing, display clarity, and connection simplicity. Whether you need a 4-person huddle room or a 14-person boardroom, AV Live has the solution.',
    image: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&q=80&w=800',
    createdAt: FieldValue.serverTimestamp()
  },
  {
    title: 'Understanding Public Address Systems: Components Every Facility Needs',
    date: 'May 2026',
    category: 'AV Integration',
    readTime: '5 min read',
    excerpt: 'A modern public address system in 2026 consists of five tightly integrated components. From microphones and amplifiers to speakers and network infrastructure, every element plays a critical role. We explain how IP-based PA systems are transforming communication in factories, schools, and commercial buildings across Pakistan.',
    image: 'https://images.unsplash.com/photo-1520166012956-add9ba0ee3f4?auto=format&fit=crop&q=80&w=800',
    createdAt: FieldValue.serverTimestamp()
  },
  {
    title: 'Hybrid Events 101: How to Engage Both In-Person and Virtual Audiences',
    date: 'May 2026',
    category: 'Events & Expo',
    readTime: '6 min read',
    excerpt: 'Hybrid events are here to stay. Combining live audiences with remote participants requires robust AV infrastructure, seamless streaming, and interactive tools. At AV Live, we specialize in end-to-end hybrid event solutions, from SMD displays and PA systems to live streaming and audience engagement platforms.',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800',
    createdAt: FieldValue.serverTimestamp()
  },
  {
    title: 'AV Live Communications: 15 Years of Unifying People and Ideas',
    date: 'April 2026',
    category: 'Company News',
    readTime: '4 min read',
    excerpt: 'Founded in 2010, AV Live has grown from a visionary startup to a trusted leader in Pakistan\'s AV industry. With offices in Lahore and Karachi, a team of dedicated professionals, and partnerships with global brands like Polycom and Cisco, we continue to deliver award-winning solutions that drive business innovation and profitability.',
    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32b7?auto=format&fit=crop&q=80&w=800',
    createdAt: FieldValue.serverTimestamp()
  }
];

const generalSettings = {
  siteName: 'AV Live Communications',
  adminEmail: 'info@avlive.com.pk',
  supportEmail: 'support@avlive.com.pk',
  currency: 'PKR',
  phone: '0321 425 6263',
  address: 'Shop, Johar Town Block N, Lahore',
  socialLinks: {
    facebook: 'https://facebook.com/avlive',
    linkedin: 'https://linkedin.com/company/avlive',
    youtube: 'https://youtube.com/avlive',
  },
  updatedAt: FieldValue.serverTimestamp(),
};

const paymentSettings = {
  merchantId: 'pk_live_avlive_merchant',
  defaultGateway: 'stripe',
  enabledMethods: ['stripe', 'bank_transfer', 'cod'],
  bankDetails: {
    bankName: 'Habib Bank Limited (HBL)',
    accountTitle: 'AV Live Communications',
    accountNumber: '12345678901234',
    iban: 'PK00HABB0012345678901234'
  },
  taxRate: 0.16, // 16% PRA GST
  updatedAt: FieldValue.serverTimestamp(),
};

const categories = [
  // PRODUCT CATEGORIES
  { id: 'parent-unified', name: 'Unified Communications', slug: 'unified-communications', parent: null, type: 'product', isActive: true },
  { id: 'child-projectors', name: 'Projectors', slug: 'projectors', parent: 'unified-communications', type: 'product', isActive: true },
  { id: 'child-ip-phones', name: 'IP Phones', slug: 'ip-phones', parent: 'unified-communications', type: 'product', isActive: true },
  { id: 'child-headsets', name: 'Headsets', slug: 'headsets', parent: 'unified-communications', type: 'product', isActive: true },
  { id: 'child-video-conferencing', name: 'Video Conferencing', slug: 'video-conferencing', parent: 'unified-communications', type: 'product', isActive: true },
  { id: 'child-voip-systems', name: 'VoIP Phone Systems', slug: 'voip-phone-systems', parent: 'unified-communications', type: 'product', isActive: true },
  
  { id: 'parent-security', name: 'Security & Surveillance', slug: 'security-surveillance', parent: null, type: 'product', isActive: true },
  { id: 'child-ip-cameras', name: 'IP Cameras', slug: 'ip-cameras', parent: 'security-surveillance', type: 'product', isActive: true },
  { id: 'child-intercom-paging', name: 'Intercom, Paging & Access', slug: 'intercom-paging-access', parent: 'security-surveillance', type: 'product', isActive: true },

  // SERVICE CATEGORIES
  { id: 'svc-corporate', name: 'Corporate Events', slug: 'corporate-events', parent: null, type: 'service', isActive: true },
  { id: 'svc-hybrid', name: 'Hybrid Events', slug: 'hybrid-events', parent: null, type: 'service', isActive: true },
  { id: 'svc-expo', name: 'Expo Organizing', slug: 'expo-organizing', parent: null, type: 'service', isActive: true },
  { id: 'svc-esports', name: 'Esports Events & Tournaments', slug: 'esports-events', parent: null, type: 'service', isActive: true },
  { id: 'svc-ai-dev', name: 'AI Development', slug: 'ai-development', parent: null, type: 'service', isActive: true },
  { id: 'svc-ai-agents', name: 'AI Agents & Workers', slug: 'ai-agents-workers', parent: null, type: 'service', isActive: true },
  { id: 'svc-ai-auto', name: 'AI Business Automation', slug: 'ai-automation', parent: null, type: 'service', isActive: true },

  // INFORMATION CATEGORIES
  { id: 'info-about', name: 'About Us', slug: 'about', parent: null, type: 'page', isActive: true },
  { id: 'info-reviews', name: 'Verified Customer Reviews', slug: 'reviews', parent: null, type: 'page', isActive: true },
  { id: 'info-compare', name: 'Comparison Charts', slug: 'compare', parent: null, type: 'page', isActive: true },
  { id: 'info-guides', name: "Buyer's Guides", slug: 'guides', parent: null, type: 'page', isActive: true },
  { id: 'info-faqs', name: 'FAQs', slug: 'faqs', parent: null, type: 'page', isActive: true },
  { id: 'info-payment', name: 'Payment Methods', slug: 'payment', parent: null, type: 'page', isActive: true },
  { id: 'info-shipping', name: 'Shipping Methods', slug: 'shipping', parent: null, type: 'page', isActive: true },
  { id: 'info-returns', name: 'Returns', slug: 'returns', parent: null, type: 'page', isActive: true },
  { id: 'info-rma', name: 'RMA Form', slug: 'rma', parent: null, type: 'page', isActive: true },

  // PROGRAM CATEGORIES
  { id: 'prog-drop-shipping', name: 'Blind Drop Shipping', slug: 'blind-drop-shipping', parent: null, type: 'program', isActive: true },
  { id: 'prog-govt-edu', name: 'Government & Education Pricing', slug: 'government-education-pricing', parent: null, type: 'program', isActive: true },
  { id: 'prog-fulfillment', name: 'Product Fulfillment Services', slug: 'fulfillment-services', parent: null, type: 'program', isActive: true },
  { id: 'prog-promotions', name: 'Promotions', slug: 'promotions', parent: null, type: 'program', isActive: true },
  { id: 'prog-provisioning', name: 'Provisioning Services', slug: 'provisioning-services', parent: null, type: 'program', isActive: true },
  { id: 'prog-quote', name: 'Quote Request', slug: 'quote', parent: null, type: 'program', isActive: true },

  // OTHER CATEGORIES
  { id: 'legal-privacy', name: 'Privacy Policy', slug: 'privacy-policy', parent: null, type: 'legal', isActive: true },
  { id: 'legal-terms', name: 'Terms of Service', slug: 'terms-of-service', parent: null, type: 'legal', isActive: true },
  { id: 'legal-blog', name: 'Blog', slug: 'blog', parent: null, type: 'content', isActive: true },
  { id: 'legal-contact', name: 'Contact Us', slug: 'contact', parent: null, type: 'page', isActive: true },
];

const services = [
  {
    id: 'svc-corp-event-mgmt',
    title: 'Corporate Event Management',
    name: 'Corporate Event Management',
    slug: 'corporate-event-management',
    category: 'corporate-events',
    type: 'corporate',
    serviceType: 'corporate',
    heroHeading: 'Flawless Corporate Gatherings. Every Time.',
    description: 'From intimate boardroom meetings to large-scale shareholder AGMs, we provide the AV infrastructure, staging, lighting, and technical direction.',
    detailedContent: 'From intimate boardroom meetings to large-scale shareholder AGMs, we provide the AV infrastructure, staging, lighting, and technical direction to make your brand shine.\n\nOur Corporate Event Services:\n• Stage Design & Set Construction\n• Audio Visual Production\n• Live Streaming\n• Lighting Design\n• Technical Direction\n\nIdeal For: Product Launches, Annual General Meetings (AGMs), Conferences, Seminars, and Team Building.',
    iconUrl: 'https://via.placeholder.com/64x64/1A2B4C/FFFFFF?text=🏢',
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=800',
    formFields: {
      eventType: ['Corporate Conference', 'AGM', 'Product Launch', 'Team Off-site'],
      guestCount: ['1-50', '51-200', '201-500', '501-1000', '1000+'],
      avRequirements: ['SMD Video Walls', 'Public Address', 'Stage Lighting', 'Live Streaming']
    },
    isActive: true,
    priceRange: '300,000 - 5,000,000',
    order: 1
  },
  {
    id: 'svc-corp-av',
    title: 'Corporate AV Production',
    name: 'Corporate AV Production',
    slug: 'corporate-av-production',
    category: 'corporate-events',
    type: 'corporate',
    serviceType: 'corporate',
    heroHeading: 'Professional AV Production for Your Corporate Events',
    description: 'We provide end-to-end AV production services for corporate events. From venue selection and AV setup to branding, catering, and guest logistics.',
    detailedContent: 'We provide end-to-end AV production services for corporate events. From venue selection and AV setup to branding, catering, and guest logistics.\n\nOur AV Production Services:\n• Complete AV Setup & Support\n• Stage & Lighting Design\n• Multi-camera Production\n• Live Streaming & Recording\n• On-site Technical Direction',
    iconUrl: 'https://via.placeholder.com/64x64/00B4D8/FFFFFF?text=🎬',
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=800',
    formFields: {
      eventType: ['Conference', 'Seminar', 'Gala Dinner', 'Product Launch'],
      duration: ['Half Day', 'Full Day', 'Multi Day'],
      avRequirements: ['Projectors', 'LED Screens', 'Sound System', 'Lighting']
    },
    isActive: true,
    priceRange: '150,000 - 2,500,000',
    order: 2
  },
  {
    id: 'svc-corp-stream',
    title: 'Corporate Event Live Streaming',
    name: 'Corporate Event Live Streaming',
    slug: 'corporate-event-live-streaming',
    category: 'corporate-events',
    type: 'corporate',
    serviceType: 'corporate',
    heroHeading: 'Broadcast Your Corporate Events to the World',
    description: 'We provide professional live streaming services for corporate events, ensuring your message reaches a global audience with crystal-clear quality.',
    detailedContent: 'We provide professional live streaming services for corporate events, ensuring your message reaches a global audience with crystal-clear quality and minimal latency.\n\nOur Live Streaming Services:\n• Multi-camera Production\n• Low-latency Streaming\n• Platform Integration (YouTube, Zoom, Teams)\n• Audience Engagement Tools (Q&A, Polls)\n• Recording & On-demand Playback',
    iconUrl: 'https://via.placeholder.com/64x64/1A2B4C/FFFFFF?text=📡',
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=800',
    formFields: {
      eventType: ['Townhall', 'Conference', 'Product Launch', 'AGM'],
      audienceSize: ['1-100', '101-500', '501-1000', '1000+'],
      streamingPlatform: ['YouTube', 'Zoom', 'Microsoft Teams', 'Custom']
    },
    isActive: true,
    priceRange: '150,000 - 1,500,000',
    order: 3
  },
  {
    id: 'svc-hybrid-prod',
    title: 'Hybrid Event Production',
    name: 'Hybrid Event Production',
    slug: 'hybrid-event-production',
    category: 'hybrid-events',
    type: 'hybrid',
    serviceType: 'hybrid',
    heroHeading: 'One Event. Two Audiences. Zero Compromises.',
    description: 'Engage your in-person crowd while captivating a global virtual audience with studio-grade cameras and dynamic virtual platform integrations.',
    detailedContent: 'Engage your in-person crowd while captivating a global virtual audience. We handle the complex AV routing, streaming platforms, and audience interaction tools so you can focus on your content.\n\nHybrid Event Components:\n• Studio-Grade Cameras\n• Virtual Platform Integration\n• Audience Engagement (Q&A, Polls)\n• Dual-Screen Monitoring\n• Replay & On-Demand',
    iconUrl: 'https://via.placeholder.com/64x64/1A2B4C/FFFFFF?text=🌐',
    imageUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=800',
    formFields: {
      eventType: ['Townhall', 'Conference', 'Workshop', 'Summit'],
      guestCount: ['1-50', '51-200', '201-500', '501-1000', '1000+'],
      virtualPlatform: ['Zoom Webinar', 'Microsoft Teams', 'YouTube Live', 'Custom']
    },
    isActive: true,
    priceRange: '400,000 - 3,500,000',
    order: 4
  },
  {
    id: 'svc-hybrid-stream',
    title: 'Hybrid Event Streaming',
    name: 'Hybrid Event Streaming',
    slug: 'hybrid-event-streaming',
    category: 'hybrid-events',
    type: 'hybrid',
    serviceType: 'hybrid',
    heroHeading: 'Seamless Live Streaming for Hybrid Events',
    description: 'We provide professional live streaming services for hybrid events, ensuring your remote audience experiences the event as if they were there.',
    detailedContent: 'We provide professional live streaming services for hybrid events, ensuring your remote audience experiences the event as if they were there.\n\nOur Streaming Services:\n• Multi-camera Production\n• Low-latency Streaming\n• Interactive Engagement Tools\n• Recording & On-Demand\n• Analytics & Reporting',
    iconUrl: 'https://via.placeholder.com/64x64/00B4D8/FFFFFF?text=📡',
    imageUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=800',
    formFields: {
      streamingType: ['Live Broadcast', 'Webinar', 'Virtual Conference'],
      duration: ['1-2 Hours', 'Half Day', 'Full Day'],
      audienceSize: ['1-100', '101-500', '501-1000', '1000+']
    },
    isActive: true,
    priceRange: '200,000 - 2,000,000',
    order: 5
  },
  {
    id: 'svc-hybrid-engage',
    title: 'Hybrid Event Audience Engagement',
    name: 'Hybrid Event Audience Engagement',
    slug: 'hybrid-event-audience-engagement',
    category: 'hybrid-events',
    type: 'hybrid',
    serviceType: 'hybrid',
    heroHeading: 'Keep Every Audience Member Engaged',
    description: 'We provide interactive audience engagement solutions for hybrid events, ensuring both in-person and virtual attendees are actively participating.',
    detailedContent: 'We provide interactive audience engagement solutions for hybrid events, ensuring both in-person and virtual attendees are actively participating.\n\nOur Engagement Solutions:\n• Real-time Q&A\n• Live Polls & Surveys\n• Virtual Networking Sessions\n• Gamification & Leaderboards\n• Analytics & Insights',
    iconUrl: 'https://via.placeholder.com/64x64/1A2B4C/FFFFFF?text=💬',
    imageUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=800',
    formFields: {
      eventType: ['Conference', 'Workshop', 'Summit', 'Training'],
      participantCount: ['1-100', '101-500', '501-1000', '1000+'],
      engagementTools: ['Q&A', 'Polls', 'Networking', 'Gamification']
    },
    isActive: true,
    priceRange: '100,000 - 1,200,000',
    order: 6
  },
  {
    id: 'svc-expo-mgmt',
    title: 'Expo Management',
    name: 'Expo Management',
    slug: 'expo-management',
    category: 'expo-organizing',
    type: 'expo',
    serviceType: 'expo',
    heroHeading: "Build the Industry's Most Memorable Expo.",
    description: "Creating a trade show is about more than just booths—it's about facilitating connections. We manage everything from floorplan design to logistics.",
    detailedContent: "Creating a trade show is about more than just booths—it's about facilitating connections. We manage everything from floorplan design and sponsor communication to on-ground logistics.\n\nExpo Management Services:\n• Booth Design & Construction\n• Sponsor & Exhibitor Management\n• Visitor Flow & Crowd Control\n• Opening Ceremony Production\n• Post-Expo Analytics",
    iconUrl: 'https://via.placeholder.com/64x64/1A2B4C/FFFFFF?text=🏛️',
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800',
    formFields: {
      expoType: ['Trade Show', 'Industry Expo', 'Job Fair', 'Education Fair'],
      boothCount: ['1-10', '11-25', '26-50', '51-100', '100+'],
      expoArea: ['Indoor', 'Outdoor', 'Both']
    },
    isActive: true,
    priceRange: '500,000 - 10,000,000',
    order: 7
  },
  {
    id: 'svc-booth-design',
    title: 'Booth Design & Construction',
    name: 'Booth Design & Construction',
    slug: 'booth-design-construction',
    category: 'expo-organizing',
    type: 'expo',
    serviceType: 'expo',
    heroHeading: 'Stand Out with Custom Exhibition Booths',
    description: 'We design and build custom exhibition booths that attract visitors and showcase your brand. From concept to completion, we handle everything.',
    detailedContent: 'We design and build custom exhibition booths that attract visitors and showcase your brand. From concept to completion, we handle everything.\n\nOur Booth Services:\n• Custom Booth Design\n• Fabrication & Construction\n• AV Integration (SMD displays, lighting)\n• Branding & Printing\n• On-site Installation & Support',
    iconUrl: 'https://via.placeholder.com/64x64/00B4D8/FFFFFF?text=🏗️',
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800',
    formFields: {
      boothType: ['Shell Scheme', 'Custom Build', 'Modular'],
      size: ['3x3m', '6x6m', '9x9m', 'Custom'],
      features: ['SMD Display', 'Lighting', 'Interactive Kiosk', 'Furniture']
    },
    isActive: true,
    priceRange: '150,000 - 3,000,000',
    order: 8
  },
  {
    id: 'svc-expo-av',
    title: 'Expo AV & Technology Integration',
    name: 'Expo AV & Technology Integration',
    slug: 'expo-av-technology-integration',
    category: 'expo-organizing',
    type: 'expo',
    serviceType: 'expo',
    heroHeading: 'Cutting-Edge AV Technology for Your Expo',
    description: 'We provide comprehensive AV and technology integration services for expos and trade shows, creating immersive experiences that captivate visitors.',
    detailedContent: 'We provide comprehensive AV and technology integration services for expos and trade shows, creating immersive experiences that captivate visitors.\n\nOur Expo AV Services:\n• Large-format SMD Video Walls\n• Interactive Touch Displays\n• Digital Signage Solutions\n• PA Systems & Acoustics\n• Live Demonstration Setups',
    iconUrl: 'https://via.placeholder.com/64x64/1A2B4C/FFFFFF?text=📺',
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800',
    formFields: {
      expoType: ['Trade Show', 'Industry Expo', 'Consumer Expo'],
      boothCount: ['1-10', '11-25', '26-50'],
      avFeatures: ['SMD Video Walls', 'Interactive Displays', 'Digital Signage', 'PA Systems']
    },
    isActive: true,
    priceRange: '250,000 - 4,000,000',
    order: 9
  },
  {
    id: 'svc-esports-mgmt',
    title: 'Esports Tournament Management',
    name: 'Esports Tournament Management',
    slug: 'esports-tournament-management',
    category: 'esports-events',
    type: 'esports',
    serviceType: 'esports',
    heroHeading: 'Level Up the Competition.',
    description: "Pakistan's esports scene is exploding. We deliver stadium-grade gaming events, complete with tournament management and professional shoutcasting.",
    detailedContent: "Pakistan's esports scene is exploding. We deliver stadium-grade gaming events, complete with tournament management, high-refresh-rate displays, and professional shoutcasting.\n\nEsports Event Services:\n• Tournament Infrastructure (Gaming PCs/Consoles)\n• Massive Spectator Displays (SMD Video Walls)\n• Broadcast Production (Multi-angle switching)\n• Bracket Management (Digital software)\n• Prize Ceremony Production",
    iconUrl: 'https://via.placeholder.com/64x64/1A2B4C/FFFFFF?text=🎮',
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800',
    formFields: {
      gameTitles: ['PUBG Mobile', 'Fortnite', 'Valorant', 'FIFA', 'Tekken', 'Free Fire'],
      playerCount: ['10-50', '51-200', '201-500', '501-1000', '1000+'],
      tournamentType: ['Online', 'Offline', 'Hybrid']
    },
    isActive: true,
    priceRange: '300,000 - 5,000,000',
    order: 10
  },
  {
    id: 'svc-esports-prod',
    title: 'Esports Broadcast Production',
    name: 'Esports Broadcast Production',
    slug: 'esports-broadcast-production',
    category: 'esports-events',
    type: 'esports',
    serviceType: 'esports',
    heroHeading: 'Professional Broadcast for Esports Events',
    description: 'We provide professional broadcast production services for esports events, including multi-camera switching, instant replay, and shoutcasting.',
    detailedContent: 'We provide professional broadcast production services for esports events, including multi-camera switching, instant replay, and professional shoutcasting.\n\nOur Broadcast Services:\n• Multi-angle Camera Setup\n• Instant Replay & Highlights\n• Professional Shoutcasting\n• Live Streaming to Platforms\n• Graphic Overlays & Sponsorship',
    iconUrl: 'https://via.placeholder.com/64x64/00B4D8/FFFFFF?text=📺',
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800',
    formFields: {
      gameTitles: ['PUBG Mobile', 'Fortnite', 'Valorant', 'FIFA', 'Tekken', 'Free Fire'],
      streamingPlatform: ['YouTube', 'Twitch', 'Facebook Gaming', 'Custom'],
      broadcastQuality: ['1080p', '4K']
    },
    isActive: true,
    priceRange: '200,000 - 3,000,000',
    order: 11
  },
  {
    id: 'svc-esports-arena',
    title: 'Esports Arena Setup & Infrastructure',
    name: 'Esports Arena Setup & Infrastructure',
    slug: 'esports-arena-setup-infrastructure',
    category: 'esports-events',
    type: 'esports',
    serviceType: 'esports',
    heroHeading: 'Build a World-Class Esports Arena',
    description: 'We design and build professional esports arenas with cutting-edge gaming infrastructure, broadcast-ready setups, and immersive spectator experiences.',
    detailedContent: 'We design and build professional esports arenas with cutting-edge gaming infrastructure, broadcast-ready setups, and immersive spectator experiences.\n\nOur Arena Services:\n• Gaming PC & Console Setup\n• High-Refresh-Rate Displays (240Hz+)\n• Soundproof Gaming Booths\n• Spectator Video Walls\n• Network & Low-Latency Infrastructure',
    iconUrl: 'https://via.placeholder.com/64x64/1A2B4C/FFFFFF?text=🏟️',
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800',
    formFields: {
      arenaType: ['Gaming Center', 'Tournament Venue', 'Mobile Arena'],
      capacity: ['1-50', '51-200', '201-500', '500+'],
      equipment: ['Gaming PCs', 'Consoles', 'High-refresh Monitors', 'Video Walls']
    },
    isActive: true,
    priceRange: '500,000 - 8,000,000',
    order: 12
  },
  {
    id: 'svc-ai-model',
    title: 'Custom AI Model Development',
    name: 'Custom AI Model Development',
    slug: 'custom-ai-model-development',
    category: 'ai-development',
    type: 'ai_dev',
    serviceType: 'ai_dev',
    heroHeading: 'Build Intelligence. Anywhere.',
    description: 'Whether you need strict data sovereignty on-premise or the scalability of AWS/Azure/GCP, we build custom AI models for your business.',
    detailedContent: 'Whether you need strict data sovereignty with an on-premise deployment or the scalability of AWS/Azure/GCP, we build custom AI models that solve your unique business problems.\n\nAI Development Services:\n• Custom Machine Learning Models\n• Natural Language Processing (NLP)\n• Computer Vision\n• Predictive Maintenance\n• Data Engineering & MLOps',
    iconUrl: 'https://via.placeholder.com/64x64/1A2B4C/FFFFFF?text=🧠',
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&q=80&w=800',
    formFields: {
      aiType: ['ML Model', 'NLP', 'Computer Vision', 'Predictive Analytics', 'Data Pipeline'],
      deploymentPreference: ['On-Premise', 'Cloud (AWS/Azure/GCP)', 'Edge', 'Not Sure'],
      dataAvailability: ['Structured', 'Unstructured', 'No Data Yet']
    },
    isActive: true,
    priceRange: '500,000 - 5,000,000',
    order: 13
  },
  {
    id: 'svc-ai-consult',
    title: 'AI Strategy & Consulting',
    name: 'AI Strategy & Consulting',
    slug: 'ai-strategy-consulting',
    category: 'ai-development',
    type: 'ai_dev',
    serviceType: 'ai_dev',
    heroHeading: 'Define Your AI Roadmap',
    description: 'We help you identify the highest ROI AI opportunities in your business. From process discovery to implementation, we guide you every step.',
    detailedContent: 'We help you identify the highest ROI AI opportunities in your business. From process discovery to implementation, we guide you every step of the way.\n\nOur Consulting Services:\n• AI Opportunity Assessment\n• Process Discovery & Analysis\n• ROI Calculation\n• Technology Selection\n• Implementation Roadmap',
    iconUrl: 'https://via.placeholder.com/64x64/00B4D8/FFFFFF?text=📊',
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&q=80&w=800',
    formFields: {
      industry: ['Banking', 'Healthcare', 'Retail', 'Manufacturing', 'Education', 'Other'],
      department: ['Operations', 'Customer Service', 'Sales', 'HR', 'Finance'],
      timeline: ['Immediate', '1-3 Months', '3-6 Months', 'Planning Stage']
    },
    isActive: true,
    priceRange: '200,000 - 1,500,000',
    order: 14
  },
  {
    id: 'svc-ai-mlops',
    title: 'AI Data Engineering & MLOps',
    name: 'AI Data Engineering & MLOps',
    slug: 'ai-data-engineering-mlops',
    category: 'ai-development',
    type: 'ai_dev',
    serviceType: 'ai_dev',
    heroHeading: 'Build Robust Data Pipelines & Deploy AI at Scale',
    description: 'We provide end-to-end data engineering and MLOps services to help you build, deploy, and maintain AI models in production environments.',
    detailedContent: 'We provide end-to-end data engineering and MLOps services to help you build, deploy, and maintain AI models in production environments.\n\nOur Services:\n• Data Pipeline Development\n• ETL & Data Warehousing\n• Model Training & Validation\n• CI/CD for ML Models\n• Monitoring & Retraining',
    iconUrl: 'https://via.placeholder.com/64x64/1A2B4C/FFFFFF?text=⚙️',
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&q=80&w=800',
    formFields: {
      dataSource: ['SQL Databases', 'NoSQL', 'APIs', 'Files'],
      dataVolume: ['<1TB', '1-10TB', '10-100TB', '100TB+'],
      cloudPreference: ['AWS', 'GCP', 'Azure', 'On-Premise']
    },
    isActive: true,
    priceRange: '300,000 - 4,000,000',
    order: 15
  },
  {
    id: 'svc-ai-support',
    title: 'AI Customer Support Agents',
    name: 'AI Customer Support Agents',
    slug: 'ai-customer-support-agents',
    category: 'ai-agents-workers',
    type: 'ai_agents',
    serviceType: 'ai_agents',
    heroHeading: '24/7 Customer Support Without the Overhead',
    description: 'Deploy AI-powered customer support agents that understand your business and resolve tickets instantly. Integrated with your CRM and knowledge base.',
    detailedContent: 'Deploy AI-powered customer support agents that understand your business and resolve tickets instantly. Integrated with your knowledge base and CRM, they handle common queries so your team can focus on complex issues.\n\nKey Features:\n• GPT-powered Conversational AI\n• Knowledge Base Integration\n• CRM Integration (Salesforce, HubSpot)\n• Multi-channel Support (Website, Chat, Email)\n• Escalation to Human Agents',
    iconUrl: 'https://via.placeholder.com/64x64/1A2B4C/FFFFFF?text=🤖',
    imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=800',
    formFields: {
      businessType: ['E-commerce', 'SaaS', 'Banking', 'Healthcare', 'Education'],
      channels: ['Website Chat', 'WhatsApp', 'Email', 'Phone'],
      estimatedTicketVolume: ['<100/month', '100-500/month', '500-1000/month', '1000+/month']
    },
    isActive: true,
    priceRange: '300,000 - 2,000,000',
    order: 16
  },
  {
    id: 'svc-ai-lead',
    title: 'AI Lead Generation Agents',
    name: 'AI Lead Generation Agents',
    slug: 'ai-lead-generation-agents',
    category: 'ai-agents-workers',
    type: 'ai_agents',
    serviceType: 'ai_agents',
    heroHeading: 'Automate Your Lead Generation Process',
    description: 'Deploy autonomous AI agents that identify, engage, and qualify leads while you focus on closing deals. Handled via research and personalized outreach.',
    detailedContent: 'Deploy autonomous AI agents that identify, engage, and qualify leads while you focus on closing deals. Agents handle prospect research, personalized outreach, and follow-up scheduling.\n\nKey Features:\n• Automated Prospect Research\n• Personalized Email Outreach\n• LinkedIn Automation\n• Lead Qualification\n• CRM Integration',
    iconUrl: 'https://via.placeholder.com/64x64/00B4D8/FFFFFF?text=🎯',
    imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=800',
    formFields: {
      targetMarket: ['B2B', 'B2C'],
      industry: ['Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing'],
      monthlyLeads: ['<100', '100-500', '500-1000', '1000+']
    },
    isActive: true,
    priceRange: '250,000 - 2,500,000',
    order: 17
  },
  {
    id: 'svc-ai-dataproc',
    title: 'AI Data Processing Agents',
    name: 'AI Data Processing Agents',
    slug: 'ai-data-processing-agents',
    category: 'ai-agents-workers',
    type: 'ai_agents',
    serviceType: 'ai_agents',
    heroHeading: 'Automate Data Entry & Document Processing',
    description: 'Deploy AI agents that automate repetitive data processing tasks, reducing manual effort and errors while improving overall efficiency.',
    detailedContent: 'Deploy AI agents that automate repetitive data processing tasks, reducing manual effort and errors while improving efficiency.\n\nKey Features:\n• Document Classification & Extraction\n• Invoice & Receipt Processing\n• Data Entry Automation\n• Form & Application Processing\n• Integration with Existing Systems',
    iconUrl: 'https://via.placeholder.com/64x64/1A2B4C/FFFFFF?text=📄',
    imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=800',
    formFields: {
      documentType: ['Invoices', 'Receipts', 'Contracts', 'Forms', 'Applications'],
      volume: ['<100/month', '100-1000/month', '1000+/month'],
      integration: ['ERP', 'CRM', 'Accounting Software']
    },
    isActive: true,
    priceRange: '200,000 - 2,500,000',
    order: 18
  },
  {
    id: 'svc-ai-auto-biz',
    title: 'AI-Powered Business Automation',
    name: 'AI-Powered Business Automation',
    slug: 'ai-business-automation',
    category: 'ai-automation',
    type: 'ai_automation',
    serviceType: 'ai_automation',
    heroHeading: 'Automate the Ordinary. Accelerate the Extraordinary.',
    description: 'AI Automation combines robotic process automation (RPA) with AI decision-making to automate end-to-end business processes—not just tasks.',
    detailedContent: 'AI Automation combines robotic process automation (RPA) with AI decision-making to automate end-to-end business processes—not just isolated tasks.\n\nAutomation Capabilities:\n• HR Automation (Resume screening, onboarding)\n• Finance Automation (Invoice reconciliation, approvals)\n• Inventory & Supply Chain (Predictive ordering)\n• Marketing Automation (Hyper-personalized campaigns)',
    iconUrl: 'https://via.placeholder.com/64x64/1A2B4C/FFFFFF?text=⚡',
    imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800',
    formFields: {
      automationArea: ['HR', 'Finance', 'Inventory', 'Marketing', 'Operations'],
      currentProcess: ['Manual', 'Semi-Automated', 'Fully Automated'],
      employeesAffected: ['1-10', '11-50', '51-200', '200+']
    },
    isActive: true,
    priceRange: '400,000 - 4,000,000',
    order: 19
  },
  {
    id: 'svc-rpa',
    title: 'RPA (Robotic Process Automation)',
    name: 'RPA (Robotic Process Automation)',
    slug: 'robotic-process-automation',
    category: 'ai-automation',
    type: 'ai_automation',
    serviceType: 'ai_automation',
    heroHeading: 'Let Bots Handle the Repetitive Work',
    description: 'Deploy software robots that mimic human actions to automate repetitive, rule-based tasks. RPA reduces errors and speeds up process workflows.',
    detailedContent: 'Deploy software robots that mimic human actions to automate repetitive, rule-based tasks. RPA reduces errors, speeds up processes, and frees your team for higher-value work.\n\nOur RPA Services:\n• Process Discovery & Analysis\n• Bot Development & Testing\n• Integration with Existing Systems\n• Monitoring & Maintenance\n• Training & Support',
    iconUrl: 'https://via.placeholder.com/64x64/00B4D8/FFFFFF?text=🤖',
    imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800',
    formFields: {
      processType: ['Data Entry', 'Invoice Processing', 'HR Onboarding', 'Customer Onboarding', 'Reporting'],
      volume: ['<100/month', '100-1000/month', '1000+/month'],
      integration: ['ERP', 'CRM', 'Spreadsheets', 'Email']
    },
    isActive: true,
    priceRange: '250,000 - 3,000,000',
    order: 20
  },
  {
    id: 'svc-ai-auto-consult',
    title: 'Process Discovery & Automation Consulting',
    name: 'Process Discovery & Automation Consulting',
    slug: 'process-discovery-automation-consulting',
    category: 'ai-automation',
    type: 'ai_automation',
    serviceType: 'ai_automation',
    heroHeading: 'Identify Your Highest ROI Automation Opportunities',
    description: 'We help you identify and prioritize the business processes that will deliver the highest return on investment from automation.',
    detailedContent: 'We help you identify and prioritize the business processes that will deliver the highest return on investment from automation.\n\nOur Consulting Services:\n• Process Discovery & Documentation\n• Automation Opportunity Assessment\n• ROI & Business Case Development\n• Technology Selection\n• Implementation Roadmap & Change Management',
    iconUrl: 'https://via.placeholder.com/64x64/1A2B4C/FFFFFF?text=📋',
    imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800',
    formFields: {
      department: ['Operations', 'Finance', 'HR', 'Customer Service', 'Sales'],
      currentChallenges: ['Manual Data Entry', 'Delayed Reporting', 'High Error Rates', 'Compliance Issues'],
      timeline: ['Immediate', '1-3 Months', '3-6 Months']
    },
    isActive: true,
    priceRange: '150,000 - 2,000,000',
    order: 21
  }
];

// 3. Seeding Execution
async function seedAll() {
  console.log('🚀 Running Node Admin Seeding Script...');

  // 1. Homepage
  await db.collection('homepage').doc('main').set(homepageData);
  console.log('✅ Homepage seeded');
  
  // 2. About
  await db.collection('about').doc('main').set(aboutData);
  console.log('✅ About page seeded');
  
  // 3. Contact
  await db.collection('contact').doc('main').set(contactData);
  console.log('✅ Contact page seeded');
  
  // 4. Services Page Configuration
  await db.collection('services_page').doc('main').set(servicesPageData);
  console.log('✅ Services page seeded');
  
  // 5. Blog Posts
  // Clear old blog posts first to avoid accumulation on multiple runs
  const blogSnapshot = await db.collection('blog_posts').get();
  const batch = db.batch();
  blogSnapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();

  for (const post of blogPosts) {
    await db.collection('blog_posts').add(post);
  }
  console.log('✅ Blog posts seeded');
  
  // 6. Settings
  await db.collection('settings').doc('general').set(generalSettings);
  await db.collection('settings').doc('payment').set(paymentSettings);
  console.log('✅ Settings seeded');

  // 7. Categories Seeding
  let orderIdx = 1;
  for (const cat of categories) {
    await db.collection('categories').doc(cat.id).set({
      name: cat.name,
      slug: cat.slug,
      description: cat.name + ' category and resources.',
      parentId: cat.parent,
      parent: cat.parent,
      type: cat.type,
      isActive: cat.isActive,
      displayOrder: orderIdx++,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  }
  console.log('✅ Categories seeded');

  // 8. Services Ecosystem Seeding
  for (const svc of services) {
    await db.collection('services').doc(svc.id).set({
      ...svc,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  }
  console.log('✅ Services ecosystem seeded');
  
  console.log('🎉 All data seeded successfully!');
}

seedAll().then(() => {
  console.log('Exiting seed process.');
  process.exit(0);
}).catch((err) => {
  console.error('❌ Seeding process failed:', err);
  process.exit(1);
});
